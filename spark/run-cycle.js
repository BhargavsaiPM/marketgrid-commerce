// run-cycle.js
// Entry point invoked by the GitHub Actions workflow on each scheduled
// run. Implements Mode A (review) and Mode B (decide + act) from the
// Spark system prompt, using a small on-disk state file so progress
// persists across separate workflow runs.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { createSession, pollSessionUntilDone, sendMessage } from './jules-client.js';
import { reviewBuild } from './playwright-check.js';
import { determineAffectedRoutes, extractChangedFilePaths } from './scope-analyzer.js';
import { reviewWithGemini, generateNextTaskPrompt, buildCorrectivePrompt } from './gemini-review.js';

const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const STYLE_GUIDE_PATH = path.resolve('./STYLE_GUIDE.md');
const BACKLOG_PATH = path.resolve('./spark/backlog.json');
const STATE_PATH = path.resolve('./spark/state.json');

const MAX_CONSECUTIVE_FAILURES = 3;

function loadJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function loadBacklog() {
  return loadJson(BACKLOG_PATH, { completed: [], inFlight: null, next: [] });
}

function saveBacklog(backlog) {
  saveJson(BACKLOG_PATH, backlog);
}

function loadState() {
  return loadJson(STATE_PATH, {
    currentSessionName: null,
    currentBacklogItemId: null,
    currentBranchName: null,
    consecutiveFailures: 0,
    needsHumanAttention: false,
    lastAlert: null,
  });
}

function saveState(state) {
  saveJson(STATE_PATH, state);
}

/** Write a human-visible alert. Replace this with a real Slack/email
 * webhook call when you have one — for now it writes to the workflow
 * log and to state.json so it's visible in the repo. */
function alertHuman(message) {
  console.error(`\n==== SPARK NEEDS HUMAN ATTENTION ====\n${message}\n=====================================\n`);
}

/** Fetch the diff for a PR via the GitHub REST API (plain fetch, no SDK
 * needed for this one call). */
async function fetchPrDiff(prUrl) {
  // prUrl looks like https://github.com/OWNER/REPO/pull/123
  const match = prUrl.match(/\/pull\/(\d+)/);
  if (!match) throw new Error(`Could not parse PR number from URL: ${prUrl}`);
  const prNumber = match[1];

  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3.diff',
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch PR diff: ${res.status} ${res.statusText}`);
  }
  return { diffText: await res.text(), prNumber };
}

/** Merge a PR via the GitHub REST API. */
async function mergePr(prNumber) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}/merge`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ merge_method: 'squash' }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to merge PR #${prNumber}: ${res.status} ${body}`);
  }
  return res.json();
}

async function handleReview({ state, backlog }) {
  console.log(`Polling in-flight session ${state.currentSessionName}...`);
  const result = await pollSessionUntilDone(state.currentSessionName, {
    intervalMs: 30_000,
    maxWaitMs: 15 * 60_000, // don't block the whole 20-minute job timeout on one poll
  });

  if (result.status === 'timeout') {
    console.log('Session not finished yet within this run\'s polling window. Will check again next run.');
    return { backlog, state }; // no change — next scheduled run will poll again
  }

  if (result.status === 'failed') {
    state.consecutiveFailures += 1;
    if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      alertHuman(
        `Session ${state.currentSessionName} for backlog item "${state.currentBacklogItemId}" ` +
        `has failed ${state.consecutiveFailures} times in a row. Stopping automatic retries.`
      );
      state.needsHumanAttention = true;
      state.lastAlert = new Date().toISOString();
      return { backlog, state };
    }
    console.log('Jules session failed. Will retry with a fresh session next run.');
    state.currentSessionName = null; // force a fresh session next run
    return { backlog, state };
  }

  // result.status === 'completed'
  if (!result.prUrl) {
    alertHuman(
      `Session ${state.currentSessionName} completed but no PR URL was found in the response. ` +
      `Check jules-client.js's pollSessionUntilDone — the field path for the PR URL may need updating.`
    );
    state.needsHumanAttention = true;
    return { backlog, state };
  }

  console.log(`Session completed. PR: ${result.prUrl}`);
  const { diffText, prNumber } = await fetchPrDiff(result.prUrl);

  // Determine scope deterministically from the actual changed files,
  // rather than screenshotting the whole site or asking Gemini to
  // figure out scope (which would waste a call and tokens before we
  // even know what to look at).
  const changedFiles = extractChangedFilePaths(diffText);
  const scope = determineAffectedRoutes(changedFiles);
  console.log('Changed files:', changedFiles);
  console.log('Scope analysis:', JSON.stringify(scope, null, 2));

  if (scope.dataLayerOnly) {
    console.log(
      'Only data-layer files changed (types/mocks/services) — no direct route to ' +
      'screenshot. Skipping visual review; Gemini will review the diff text only.'
    );
  } else if (scope.routes.length === 0) {
    console.log(
      'Scope analyzer found no route mapping for the changed files. Falling back to ' +
      'checking "/" as a minimal sanity check — consider adding a mapping rule to ' +
      'scope-analyzer.js for these files.'
    );
    scope.routes = ['/'];
  }

  const branchName = result.branchName || state.currentBranchName;
  const playwrightResult = scope.dataLayerOnly
    ? { installOk: true, installLog: '(skipped — data-layer-only change)', devServerStarted: true, routeResults: [] }
    : await reviewBuild({
        repoOwner: REPO_OWNER,
        repoName: REPO_NAME,
        branchName,
        githubToken: GITHUB_TOKEN,
        routes: scope.routes,
      });

  if (!playwrightResult.installOk) {
    // Automatic FAIL — don't even bother calling Gemini.
    const correctivePrompt =
      'The build failed to install dependencies (`npm install`). ' +
      'Please fix whatever is causing this. Install log:\n\n' +
      playwrightResult.installLog;
    await sendMessage(state.currentSessionName, correctivePrompt);
    state.consecutiveFailures += 1;
    return { backlog, state };
  }

  if (!playwrightResult.devServerStarted) {
    const correctivePrompt =
      'The dev server failed to start (`npm run dev`). ' +
      'Please fix whatever is causing this. Dev server log:\n\n' +
      (playwrightResult.devServerLog || '(no output captured)');
    await sendMessage(state.currentSessionName, correctivePrompt);
    state.consecutiveFailures += 1;
    return { backlog, state };
  }

  console.log('Sending build to Gemini for review...');
  const currentTaskDescription = backlog.next.find((i) => i.id === state.currentBacklogItemId)?.description
    || `Corrective fix for ${state.currentBacklogItemId}`;

  const review = await reviewWithGemini({
    taskPrompt: currentTaskDescription,
    diffText,
    styleGuidePath: STYLE_GUIDE_PATH,
    routeResults: playwrightResult.routeResults,
    scopeInfo: scope,
  });

  console.log('Gemini verdict:', review.verdict);
  console.log('Summary:', review.summary);

  if (review.verdict === 'PASS') {
    console.log(`Merging PR #${prNumber}...`);
    await mergePr(prNumber);

    // Move the completed item from next -> completed
    backlog.completed.push(state.currentBacklogItemId);
    backlog.next = backlog.next.filter((i) => i.id !== state.currentBacklogItemId);
    saveBacklog(backlog);

    state.currentSessionName = null;
    state.currentBacklogItemId = null;
    state.currentBranchName = null;
    state.consecutiveFailures = 0;
    console.log('Backlog item completed and merged.');
  } else {
    state.consecutiveFailures += 1;
    if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      alertHuman(
        `Backlog item "${state.currentBacklogItemId}" has failed review ` +
        `${state.consecutiveFailures} times in a row. Latest verdict summary: ${review.summary}`
      );
      state.needsHumanAttention = true;
      state.lastAlert = new Date().toISOString();
      return { backlog, state };
    }
    const correctivePrompt = buildCorrectivePrompt(review);
    console.log('Sending corrective prompt to the same Jules session...');
    await sendMessage(state.currentSessionName, correctivePrompt);
  }

  return { backlog, state };
}

async function handleStartNextTask({ state, backlog }) {
  if (backlog.next.length === 0) {
    console.log('Backlog is empty. Nothing to do.');
    return { backlog, state };
  }

  const nextItem = backlog.next[0];
  console.log(`Starting next backlog item: ${nextItem.id}`);

  const prompt = await generateNextTaskPrompt({
    backlogItem: nextItem,
    styleGuidePath: STYLE_GUIDE_PATH,
  });

  const session = await createSession({
    prompt,
    repoOwner: REPO_OWNER,
    repoName: REPO_NAME,
    startingBranch: 'main',
  });

  state.currentSessionName = session.name;
  state.currentBacklogItemId = nextItem.id;
  state.currentBranchName = null; // filled in once the session completes and we know the branch
  state.consecutiveFailures = 0;
  // Route scope is no longer guessed ahead of time — once the session
  // completes, handleReview() determines affected routes from the
  // actual diff via scope-analyzer.js, which is far more accurate than
  // guessing before any code exists.

  return { backlog, state };
}

function commitStateChanges() {
  try {
    execSync('git config user.name "spark-bot"');
    execSync('git config user.email "spark-bot@users.noreply.github.com"');
    execSync('git add spark/backlog.json spark/state.json');
    // If there's nothing to commit, `git commit` exits non-zero — swallow that case.
    try {
      execSync('git commit -m "chore: update spark backlog state [skip ci]"');
      execSync('git push');
      console.log('Committed and pushed state updates.');
    } catch {
      console.log('No state changes to commit.');
    }
  } catch (err) {
    console.error('Failed to commit state changes:', err.message);
  }
}

async function main() {
  if (!REPO_OWNER || !REPO_NAME || !GITHUB_TOKEN) {
    throw new Error('REPO_OWNER, REPO_NAME, and GITHUB_TOKEN must all be set.');
  }

  let backlog = loadBacklog();
  let state = loadState();

  if (state.needsHumanAttention) {
    console.log('Spark is paused pending human attention (see state.json). Exiting without action.');
    return;
  }

  if (state.currentSessionName) {
    ({ backlog, state } = await handleReview({ state, backlog }));
  } else {
    ({ backlog, state } = await handleStartNextTask({ state, backlog }));
  }

  saveBacklog(backlog);
  saveState(state);
  commitStateChanges();
}

main().catch((err) => {
  console.error('Spark run-cycle failed with an uncaught error:', err);
  process.exit(1);
});