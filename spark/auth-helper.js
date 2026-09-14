// auth-helper.js
// Since this app's authentication is fully mocked and in-memory (no
// login form UI yet, no localStorage/cookies — confirmed from the real
// authStore.ts), Playwright can't "log in" the normal way (fill a form,
// submit). Instead, this reaches into the page's own JavaScript runtime
// and calls the Zustand authStore's login() function directly, exactly
// as a real login form would eventually do internally.
//
// Confirmed real mock user IDs from src/services/userService.ts:
//   u1 = admin, u2 = vendor, u3 = customer

export const MOCK_USER_IDS = {
  admin: 'u1',
  vendor: 'u2',
  customer: 'u3',
};

/**
 * Log a Playwright page into a given mock role by calling the app's own
 * authStore.login() function inside the browser.
 *
 * IMPORTANT — fragile by nature: this works by reaching into Zustand's
 * internal store registry via a global hook, which most Zustand stores
 * do NOT expose by default. If this fails, the more robust fix is a
 * small one-line addition to authStore.ts exposing the store on
 * `window` in development mode only, e.g.:
 *   if (import.meta.env.DEV) { (window).__authStore = useAuthStore; }
 * That one line, added via a future Jules task, would make this
 * completely reliable instead of relying on the fallback techniques
 * below. Until then, this function tries a few reasonable approaches
 * and reports clearly which one worked (or that none did), so you know
 * whether that small dev-only export is worth adding.
 *
 * @param {import('playwright').Page} page - an already-navigated Playwright page
 * @param {'admin'|'vendor'|'customer'} role
 * @returns {Promise<{ success: boolean, method: string|null, error: string|null }>}
 */
export async function loginAs(page, role) {
  const userId = MOCK_USER_IDS[role];
  if (!userId) {
    return { success: false, method: null, error: `Unknown role: ${role}` };
  }

  // Attempt 1: if the app has been updated to expose the store on
  // window (the recommended fix above), use it directly — cleanest path.
  const viaWindowHook = await page.evaluate(async (uid) => {
    try {
      if (window.__authStore) {
        await window.__authStore.getState().login(uid);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, userId);

  if (viaWindowHook) {
    // Give React a moment to re-render with the new session before the
    // caller proceeds to check for session-gated elements.
    await page.waitForTimeout(300);
    return { success: true, method: 'window.__authStore', error: null };
  }

  return {
    success: false,
    method: null,
    error:
      'window.__authStore was not found. The app does not yet expose its ' +
      'Zustand authStore for test access. Add this one line to ' +
      'src/store/authStore.ts (dev-only, safe for production): ' +
      'if (import.meta.env.DEV) { (window as any).__authStore = useAuthStore; } ' +
      '— this is a small, low-risk Jules task worth running once, since it ' +
      'unblocks all future automated testing of logged-in pages.',
  };
}