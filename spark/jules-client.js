// jules-client.js
// Thin wrapper around the Jules REST API (v1alpha).
// Docs: https://developers.google.com/jules/api
// NOTE: this API is alpha/experimental. Field names below are based on
// the confirmed public docs as of this writing — if Google changes the
// shape, the console.error() logging in each function is there so you
// can see the raw response and fix the field paths quickly.

const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';

function getApiKey() {
  const key = process.env.JULES_API_KEY;
  if (!key) {
    throw new Error('JULES_API_KEY environment variable is not set.');
  }
  return key;
}

async function julesFetch(path, options = {}) {
  const url = `${JULES_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'x-goog-api-key': getApiKey(),
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    console.error(`Jules API error [${res.status}] on ${path}:`, JSON.stringify(json, null, 2));
    throw new Error(`Jules API request failed: ${res.status} ${res.statusText}`);
  }

  return json;
}

/**
 * List all sources connected to this Jules account.
 * Use this once, manually, to confirm your repo is connected before
 * automating anything (see setup guide Step 2).
 */
export async function listSources() {
  return julesFetch('/sources');
}

/**
 * Create a new session (submit a task to Jules).
 * @param {Object} params
 * @param {string} params.prompt - the full task prompt text
 * @param {string} params.repoOwner - e.g. "BhargavsaiPM"
 * @param {string} params.repoName - e.g. "marketgrid-commerce"
 * @param {string} [params.startingBranch] - defaults to "main"
 * @returns {Promise<Object>} the created session object
 */
export async function createSession({ prompt, repoOwner, repoName, startingBranch = 'main' }) {
  const body = {
    prompt,
    sourceContext: {
      source: `sources/github/${repoOwner}/${repoName}`,
      githubRepoContext: {
        startingBranch,
      },
    },
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: false,
  };

  const session = await julesFetch('/sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  console.log(`Created Jules session: ${session.name}`);
  return session;
}

/**
 * Send a follow-up message to an existing, still-open session.
 * Use this for corrective fixes — keeps the same branch/PR rather than
 * creating a new one, per the branching rule.
 * @param {string} sessionName - full resource name, e.g. "sessions/1234567"
 * @param {string} prompt - the corrective message text
 */
export async function sendMessage(sessionName, prompt) {
  // sessionName may come in as "sessions/1234567" or just "1234567" —
  // normalize so callers don't have to think about it.
  const id = sessionName.startsWith('sessions/') ? sessionName : `sessions/${sessionName}`;
  return julesFetch(`/${id}:sendMessage`, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

/**
 * List activities for a session (used for polling progress/completion).
 * @param {string} sessionName - e.g. "sessions/1234567"
 * @param {number} [pageSize=50]
 */
export async function listActivities(sessionName, pageSize = 50) {
  const id = sessionName.startsWith('sessions/') ? sessionName : `sessions/${sessionName}`;
  return julesFetch(`/${id}/activities?pageSize=${pageSize}`);
}

/**
 * Get a single session's current state.
 * @param {string} sessionName - e.g. "sessions/1234567"
 */
export async function getSession(sessionName) {
  const id = sessionName.startsWith('sessions/') ? sessionName : `sessions/${sessionName}`;
  return julesFetch(`/${id}`);
}

/**
 * Search a nested object/array for a GitHub pull request URL, by looking
 * for any string value matching github.com/.../pull/NNN. This is a
 * deliberately loose, resilient approach rather than a hardcoded field
 * path — confirmed empirically that real activity objects can take a
 * few different shapes (plain "agentMessaged" text activities are one
 * example we've already seen; the exact shape of a code-producing,
 * PR-opening activity may differ and is easier to find this way than to
 * hardcode a guessed path that breaks silently).
 */
function findPrUrlDeep(value) {
  if (typeof value === 'string') {
    const match = value.match(/https:\/\/github\.com\/[^\s"]+\/pull\/\d+/);
    return match ? match[0] : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPrUrlDeep(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      const found = findPrUrlDeep(value[key]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Poll a session's activities until it reaches a terminal state
 * (completed or failed), or until maxWaitMs is exceeded.
 *
 * Confirmed from a real test session: a plain conversational reply from
 * Jules arrives as an activity shaped like:
 *   { originator: "agent", agentMessaged: { agentMessage: "..." } }
 * with no "sessionCompleted"/"sessionFailed" field at all. This function
 * therefore does NOT rely solely on those two fields being present —
 * it also checks the session's own status via getSession() each round,
 * and falls back to scanning activity text for a PR link, since a task
 * that actually produces code is expected to differ from this plain-
 * message case in ways not yet observed firsthand.
 *
 * @param {string} sessionName
 * @param {Object} [opts]
 * @param {number} [opts.intervalMs=60000] - how often to poll
 * @param {number} [opts.maxWaitMs=1200000] - give up after this long (20 min default)
 * @returns {Promise<{status: 'completed'|'failed'|'timeout'|'awaiting_pr', prUrl?: string, branchName?: string, raw?: Object}>}
 */
export async function pollSessionUntilDone(sessionName, opts = {}) {
  const intervalMs = opts.intervalMs ?? 60_000;
  const maxWaitMs = opts.maxWaitMs ?? 20 * 60_000;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    const { activities = [] } = await listActivities(sessionName);
    const session = await getSession(sessionName);

    // Check the session object itself for an explicit state field.
    // Log the raw session once per loop so you can inspect real field
    // names in your GitHub Actions logs and tighten this check later.
    console.log('Current session state snapshot:', JSON.stringify(session.state ?? session.status ?? '(no state/status field found)', null, 2));

    for (const activity of activities) {
      if (activity.sessionCompleted) {
        const prUrl = findPrUrlDeep(activity) || findPrUrlDeep(session);
        return { status: 'completed', prUrl, raw: activity };
      }
      if (activity.sessionFailed) {
        return { status: 'failed', raw: activity };
      }
    }

    // Fallback: even without a sessionCompleted marker, if a PR URL has
    // appeared anywhere in the session or its activities, treat that as
    // done — a PR existing is itself strong evidence the work finished.
    const prUrlAnywhere = findPrUrlDeep(activities) || findPrUrlDeep(session);
    if (prUrlAnywhere) {
      return { status: 'completed', prUrl: prUrlAnywhere, raw: { activities, session } };
    }

    console.log(`Session ${sessionName} still in progress, waiting ${intervalMs / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { status: 'timeout' };
}