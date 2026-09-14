// gemini-review.js
// Sends the task context, diff, screenshots, and STYLE_GUIDE.md to
// Gemini and asks for a structured PASS/FAIL review, per Mode A of the
// Spark system prompt.

import { GoogleGenAI, Type } from '@google/genai';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Wraps a Gemini API call with automatic retry on transient failures
 * (503 UNAVAILABLE / server overload, and 429 rate limits). Does NOT
 * retry on other errors (e.g. 404 wrong model name, 400 bad request) —
 * those are real bugs that retrying won't fix, so they're thrown
 * immediately instead of wasting time retrying something that will
 * never succeed.
 *
 * Uses exponential backoff: waits longer between each retry attempt,
 * since immediately retrying a "server is overloaded" error tends to
 * make the overload worse, not better.
 *
 * @param {() => Promise<any>} fn - the API call to attempt
 * @param {Object} [opts]
 * @param {number} [opts.maxAttempts=4]
 * @param {number} [opts.baseDelayMs=2000]
 */
async function withRetry(fn, opts = {}) {
  const maxAttempts = opts.maxAttempts ?? 4;
  const baseDelayMs = opts.baseDelayMs ?? 2000;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.error?.code;
      const isRetryable = status === 503 || status === 429;

      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }

      const delay = baseDelayMs * 2 ** (attempt - 1); // 2s, 4s, 8s, ...
      console.log(
        `Gemini call failed with status ${status} (attempt ${attempt}/${maxAttempts}). ` +
        `Retrying in ${delay / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

const REVIEW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    requirementChecks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          requirement: { type: Type.STRING },
          pass: { type: Type.BOOLEAN },
          notes: { type: Type.STRING },
        },
        required: ['requirement', 'pass'],
      },
    },
    styleGuideViolations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['section', 'description'],
      },
    },
    consoleErrorsFound: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    verdict: {
      type: Type.STRING,
      enum: ['PASS', 'FAIL'],
    },
    summary: { type: Type.STRING },
  },
  required: ['requirementChecks', 'styleGuideViolations', 'consoleErrorsFound', 'verdict', 'summary'],
};

const REVIEW_SYSTEM_INSTRUCTION = `
You are the automated code reviewer for MarketGrid Commerce, a
multi-tenant e-commerce marketplace built with Vite + React + TypeScript
+ Tailwind + Zustand + Framer Motion.

You will be given: the original task prompt that was given to a coding
agent, the resulting code diff, a note explaining WHY only certain
routes were checked (scope is determined automatically from which files
changed — this is intentional focus, not incomplete coverage), a
STYLE_GUIDE.md file (the project's authoritative design/rules document),
and screenshots + console output from actually running the resulting
build.

Some screenshots are full-page captures of a route at rest. Others are
BEFORE/AFTER pairs for a specific interaction (a hover or a click) —
when you see a labeled BEFORE/AFTER pair, compare them directly: does
the AFTER image show the expected change (e.g. a hover background
appearing, a dropdown panel opening, an active-state underline showing)?
A BEFORE/AFTER pair that looks identical usually means the interaction
did not work — treat that as a functional bug, not just a visual one.
If an interaction's error field is populated (element not found /
timeout), that is itself a finding to report — it may mean the element
doesn't exist where expected, or a CSS selector assumption is wrong.

Review strictly and specifically:
1. For EVERY distinct requirement stated in the task prompt, judge PASS
   or FAIL individually. Quote or closely paraphrase the requirement in
   your "requirement" field. Do not merge multiple requirements into one
   check.
2. Cross-check the diff and screenshots against STYLE_GUIDE.md. Pay
   particular attention to: correct glass-1 vs glass-2 usage (glass-2 is
   required for anything floating over other content — dropdowns,
   modals, popovers), no neon glow box-shadow effects anywhere, JetBrains
   Mono used for all prices/order IDs/SKUs/stock counts (never the body
   font), no reference to CSS variables that aren't actually defined
   (e.g. the known --color-surface-variant issue), complete active-nav-
   state logic if the navbar was touched (every nav item needs its own
   route-match condition, no item should default to active), the cart
   icon hidden for vendor/admin roles if role-based UI was touched, and
   the cart store's itemsByVendor (grouped) shape preserved if
   cartStore.ts was touched — never a flat items array.
3. List every console error found verbatim. Console warnings are not
   automatically failing unless they indicate a real functional problem
   (missing key prop warnings, deprecated API usage causing broken
   behavior, etc.) — use judgment, but err toward flagging rather than
   ignoring.
4. The overall verdict is FAIL if ANY requirement check failed, ANY
   style guide violation was found, OR any console error was present.
   A verdict of PASS requires all three categories to be clean.
5. Be conservative. If you are unsure whether something meets a
   requirement, mark it FAIL with a note explaining the uncertainty,
   rather than assuming it's fine.
`.trim();

/**
 * @param {Object} params
 * @param {string} params.taskPrompt - the original prompt given to the coding agent
 * @param {string} params.diffText - the PR diff as plain text
 * @param {string} params.styleGuidePath - path to STYLE_GUIDE.md
 * @param {Array} params.routeResults - from playwright-check.js's reviewBuild(),
 *   each with a full-page screenshot plus interactionResults (before/after
 *   pairs for hover/click checks on that route)
 * @param {Object} [params.scopeInfo] - output of scope-analyzer's
 *   determineAffectedRoutes(), included so Gemini understands why only
 *   these routes were checked rather than the whole site
 * @returns {Promise<Object>} parsed review matching REVIEW_SCHEMA
 */
export async function reviewWithGemini({ taskPrompt, diffText, styleGuidePath, routeResults, scopeInfo }) {
  const client = getClient();
  const styleGuideContent = readFileSync(styleGuidePath, 'utf-8');

  const consoleSummary = routeResults
    .map((r) => {
      const parts = [`Route: ${r.route}`];
      if (r.navigationError) parts.push(`  Navigation error: ${r.navigationError}`);
      if (r.consoleErrors.length) parts.push(`  Console errors: ${r.consoleErrors.join(' | ')}`);
      if (r.pageErrors.length) parts.push(`  Page errors: ${r.pageErrors.join(' | ')}`);
      if (!r.navigationError && !r.consoleErrors.length && !r.pageErrors.length) {
        parts.push('  No errors captured.');
      }
      if (r.interactionResults && r.interactionResults.length) {
        for (const ir of r.interactionResults) {
          if (ir.error) {
            parts.push(`  Interaction "${ir.name}" (${ir.type} on ${ir.selector}): FAILED — ${ir.error}`);
          } else {
            parts.push(`  Interaction "${ir.name}" (${ir.type} on ${ir.selector}): captured before/after screenshots below`);
          }
        }
      }
      return parts.join('\n');
    })
    .join('\n\n');

  const scopeExplanation = scopeInfo
    ? `SCOPE OF THIS REVIEW:\nOnly the following routes were checked, because the deterministic ` +
      `file-to-route mapping determined they are the only ones affected by this diff's changed ` +
      `files (this is intentional — it keeps review focused and avoids unnecessary token usage; ` +
      `it does not mean the rest of the site was checked and found fine, it means the rest of the ` +
      `site could not have been affected by this specific change):\n${scopeInfo.reasons.join('\n')}\n`
    : '';

  const parts = [
    { text: `TASK PROMPT GIVEN TO THE CODING AGENT:\n\n${taskPrompt}` },
    { text: `\n\nCODE DIFF:\n\n${diffText}` },
    { text: `\n\n${scopeExplanation}` },
    { text: `\n\nSTYLE_GUIDE.md CONTENT:\n\n${styleGuideContent}` },
    { text: `\n\nCONSOLE / NAVIGATION / INTERACTION OUTPUT PER ROUTE:\n\n${consoleSummary}` },
  ];

  // Attach each route's full-page screenshot, then each interaction's
  // before/after pair, clearly labeled so Gemini can tell them apart.
  for (const r of routeResults) {
    if (r.screenshotBase64) {
      parts.push({ text: `\n\nFull-page screenshot for route ${r.route}:` });
      parts.push({ inlineData: { mimeType: 'image/png', data: r.screenshotBase64 } });
    }

    for (const ir of r.interactionResults || []) {
      if (ir.beforeScreenshotBase64) {
        parts.push({ text: `\n\nBEFORE screenshot for interaction "${ir.name}" on route ${r.route}:` });
        parts.push({ inlineData: { mimeType: 'image/png', data: ir.beforeScreenshotBase64 } });
      }
      if (ir.afterScreenshotBase64) {
        parts.push({ text: `\n\nAFTER screenshot for interaction "${ir.name}" on route ${r.route} (compare against the BEFORE image directly above — check that the expected visual change, e.g. hover highlight or dropdown opening, actually occurred and matches STYLE_GUIDE.md conventions):` });
        parts.push({ inlineData: { mimeType: 'image/png', data: ir.afterScreenshotBase64 } });
      }
    }
  }

  const response = await withRetry(() =>
    client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: REVIEW_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: REVIEW_SCHEMA,
      },
    })
  );

  const text = response.text;
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON:', text);
    throw new Error('Gemini did not return valid structured JSON.');
  }
}

/**
 * Ask Gemini to generate the next Jules task prompt, following the
 * project's fixed template, for a given backlog item.
 *
 * @param {Object} params
 * @param {Object} params.backlogItem - { id, description }
 * @param {string} params.styleGuidePath
 * @returns {Promise<string>} the full task prompt text, ready to submit to Jules
 */
export async function generateNextTaskPrompt({ backlogItem, styleGuidePath }) {
  const client = getClient();
  const styleGuideContent = readFileSync(styleGuidePath, 'utf-8');

  const templateInstruction = `
Generate a complete, self-contained Jules task prompt for the following
backlog item. Follow this EXACT template structure — do not deviate from
it or omit sections:

IMPORTANT: Before making changes, read STYLE_GUIDE.md at the repo root
and follow it exactly. Read the current contents of any file you plan to
modify before changing it; extend in-place using existing structure and
exported names — do not redeclare interfaces differently or change
signatures other components already call. Create a NEW branch from the
current tip of main for this task, separate from any previous branch,
and state the exact branch name in your summary.

TASK: [one-sentence description]

FILES TO CREATE:
- [exact path] — route "[exact route]" (if applicable)

FILES TO MODIFY:
- [exact path] — [what changes and why]

[Numbered, specific breakdown of exactly what to build/fix. Cite
STYLE_GUIDE.md section numbers for any rule that applies rather than
restating it inline.]

CONFIRM IN YOUR SUMMARY: [specific, checkable questions]

Open a PR when done.

Backlog item to generate this for:
ID: ${backlogItem.id}
Description: ${backlogItem.description}

Use the STYLE_GUIDE.md content below to write specific, correct
references to section numbers and existing conventions (fixed mock data,
color tokens, component patterns) rather than generic instructions.

STYLE_GUIDE.md:
${styleGuideContent}
`.trim();

  const response = await withRetry(() =>
    client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: templateInstruction }] }],
    })
  );

  return response.text.trim();
}

/**
 * Build a corrective task prompt from a failed review, quoting the
 * specific failures verbatim rather than generic feedback.
 *
 * @param {Object} review - the parsed review object from reviewWithGemini
 * @returns {string} corrective prompt text to send via sendMessage
 */
export function buildCorrectivePrompt(review) {
  const failedRequirements = review.requirementChecks.filter((r) => !r.pass);

  const lines = [
    'The previous submission did not pass review. Fix ONLY the specific',
    'issues listed below — do not re-scope, refactor, or "improve"',
    'anything outside of this list.',
    '',
  ];

  if (failedRequirements.length) {
    lines.push('FAILED REQUIREMENTS:');
    for (const r of failedRequirements) {
      lines.push(`- ${r.requirement}${r.notes ? ` (${r.notes})` : ''}`);
    }
    lines.push('');
  }

  if (review.styleGuideViolations.length) {
    lines.push('STYLE_GUIDE.md VIOLATIONS:');
    for (const v of review.styleGuideViolations) {
      lines.push(`- [${v.section}] ${v.description}`);
    }
    lines.push('');
  }

  if (review.consoleErrorsFound.length) {
    lines.push('CONSOLE ERRORS TO FIX:');
    for (const e of review.consoleErrorsFound) {
      lines.push(`- ${e}`);
    }
    lines.push('');
  }

  lines.push('Open a PR (or update the existing one) when done.');

  return lines.join('\n');
}