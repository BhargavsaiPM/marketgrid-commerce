// playwright-check.js
// Checks out a given branch into a scratch directory, installs deps,
// starts the dev server, and uses Playwright to capture:
//   1. A full-page screenshot + console output for every route (static check)
//   2. Before/after screenshot pairs for each defined interaction on
//      that route (hover states, dropdown opens, etc.) — per the
//      interaction-manifest.js config.

import { execSync, spawn } from 'node:child_process';
import { existsSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import waitOn from 'wait-on';
import { chromium } from 'playwright';
import { GLOBAL_INTERACTIONS, ROUTE_INTERACTIONS, ALL_ROUTES } from './interaction-manifest.js';

const SCRATCH_DIR = path.resolve('./spark/.scratch-review');
const DEV_SERVER_URL = 'http://localhost:5173';
const DEV_SERVER_PORT = 5173;

function run(cmd, cwd) {
  console.log(`$ ${cmd}  (cwd: ${cwd})`);
  return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf-8' });
}

function prepareScratchCheckout({ repoOwner, repoName, branchName, githubToken }) {
  if (existsSync(SCRATCH_DIR)) {
    rmSync(SCRATCH_DIR, { recursive: true, force: true });
  }
  mkdirSync(SCRATCH_DIR, { recursive: true });

  const remote = `https://x-access-token:${githubToken}@github.com/${repoOwner}/${repoName}.git`;
  run(`git clone --depth 1 --branch ${branchName} ${remote} .`, SCRATCH_DIR);
}

function installDependencies() {
  try {
    const log = run('npm install', SCRATCH_DIR);
    return { ok: true, log };
  } catch (err) {
    return { ok: false, log: `${err.stdout || ''}\n${err.stderr || ''}` };
  }
}

function startDevServer() {
  const child = spawn('npm', ['run', 'dev', '--', '--port', String(DEV_SERVER_PORT)], {
    cwd: SCRATCH_DIR,
    stdio: 'pipe',
    detached: true,
  });

  let output = '';
  child.stdout.on('data', (d) => { output += d.toString(); });
  child.stderr.on('data', (d) => { output += d.toString(); });

  return { child, getOutput: () => output };
}

function stopDevServer(child) {
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch (err) {
    console.warn('Could not cleanly stop dev server:', err.message);
  }
}

/**
 * Attempt one interaction (hover or click) on the current page and
 * capture a before/after screenshot pair. Failures here are recorded
 * as data (element not found, timeout, etc.) rather than thrown —
 * a missing selector is useful review information ("this element
 * doesn't exist where expected"), not a reason to crash the whole run.
 */
async function captureInteraction(page, interaction) {
  const result = {
    name: interaction.name,
    type: interaction.type,
    selector: interaction.selector,
    beforeScreenshotBase64: null,
    afterScreenshotBase64: null,
    error: null,
  };

  try {
    result.beforeScreenshotBase64 = (await page.screenshot({ fullPage: false })).toString('base64');

    const locator = page.locator(interaction.selector).first();
    await locator.waitFor({ state: 'visible', timeout: 5000 });

    if (interaction.type === 'hover') {
      await locator.hover();
      await page.waitForTimeout(400); // let hover transition/animation settle
      result.afterScreenshotBase64 = (await page.screenshot({ fullPage: false })).toString('base64');
      // Move mouse away to reset hover state before the next interaction
      await page.mouse.move(0, 0);
    } else if (interaction.type === 'click') {
      await locator.click();
      if (interaction.waitForSelector) {
        await page.locator(interaction.waitForSelector).first().waitFor({ state: 'visible', timeout: 5000 });
      } else {
        await page.waitForTimeout(400);
      }
      result.afterScreenshotBase64 = (await page.screenshot({ fullPage: false })).toString('base64');
      // Try to reset state by pressing Escape and clicking elsewhere,
      // so the next interaction on this page starts clean.
      await page.keyboard.press('Escape').catch(() => {});
      await page.mouse.click(5, 5).catch(() => {});
    }
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

/**
 * Visit each route, capture a full-page screenshot + console/page
 * errors, then run through that route's defined interactions
 * (global navbar interactions + any route-specific ones).
 */
async function captureRoutes(routes) {
  const browser = await chromium.launch();
  const results = [];

  for (const route of routes) {
    const page = await browser.newPage();
    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    let navigationError = null;
    try {
      await page.goto(`${DEV_SERVER_URL}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(800); // let entrance animations settle
    } catch (err) {
      navigationError = err.message;
    }

    let screenshotBase64 = null;
    try {
      const buffer = await page.screenshot({ fullPage: true });
      screenshotBase64 = buffer.toString('base64');
    } catch (err) {
      console.warn(`Could not screenshot ${route}:`, err.message);
    }

    // Run interactions only if navigation succeeded — no point testing
    // hover states on a page that never loaded.
    const interactionsToRun = navigationError
      ? []
      : [...GLOBAL_INTERACTIONS, ...(ROUTE_INTERACTIONS[route] || [])];

    const interactionResults = [];
    for (const interaction of interactionsToRun) {
      console.log(`  Testing interaction: ${interaction.name} on ${route}`);
      const result = await captureInteraction(page, interaction);
      interactionResults.push(result);
    }

    results.push({
      route,
      navigationError,
      screenshotBase64,
      consoleErrors: consoleMessages.filter((m) => m.type === 'error').map((m) => m.text),
      consoleWarnings: consoleMessages.filter((m) => m.type === 'warning').map((m) => m.text),
      pageErrors,
      interactionResults,
    });

    await page.close();
  }

  await browser.close();
  return results;
}

/**
 * Full review pipeline: checkout branch, install, run dev server,
 * capture every route (full coverage, per project decision) plus their
 * defined interactions, clean up.
 *
 * @param {Object} params
 * @param {string} params.repoOwner
 * @param {string} params.repoName
 * @param {string} params.branchName
 * @param {string} params.githubToken
 * @param {string[]} [params.routes] - defaults to ALL_ROUTES for full
 *   coverage every cycle, per project decision. Pass a narrower list to
 *   override for a specific quick check.
 * @returns {Promise<{installOk: boolean, installLog: string, devServerStarted: boolean, routeResults: Array}>}
 */
export async function reviewBuild({ repoOwner, repoName, branchName, githubToken, routes }) {
  const routesToCheck = routes && routes.length ? routes : ALL_ROUTES;

  prepareScratchCheckout({ repoOwner, repoName, branchName, githubToken });

  const install = installDependencies();
  if (!install.ok) {
    return {
      installOk: false,
      installLog: install.log,
      devServerStarted: false,
      routeResults: [],
    };
  }

  const { child, getOutput } = startDevServer();

  let devServerStarted = true;
  try {
    await waitOn({ resources: [DEV_SERVER_URL], timeout: 30_000 });
  } catch (err) {
    devServerStarted = false;
  }

  let routeResults = [];
  if (devServerStarted) {
    try {
      routeResults = await captureRoutes(routesToCheck);
    } finally {
      stopDevServer(child);
    }
  } else {
    stopDevServer(child);
  }

  return {
    installOk: true,
    installLog: install.log,
    devServerStarted,
    devServerLog: devServerStarted ? null : getOutput(),
    routeResults,
  };
}