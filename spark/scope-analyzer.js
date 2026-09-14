// scope-analyzer.js
// Deterministically figures out which routes/pages are affected by a
// given set of changed files, so Spark only screenshots and reviews
// what's actually relevant to the current task — not the whole site
// every cycle. This is plain logic (no AI call needed), which keeps it
// fast, free, and predictable, and keeps Gemini's token usage focused
// on what changed rather than re-scanning everything every time.

// Maps a changed file path (or path fragment) to the route(s) it
// affects. Kept in sync with the actual project structure documented in
// STYLE_GUIDE.md §6. Update this whenever a new page is added.
const FILE_TO_ROUTES = [
  { pattern: /src\/pages\/Storefront/i, routes: ['/'] },
  { pattern: /src\/pages\/CatalogPage/i, routes: ['/catalog'] },
  { pattern: /src\/pages\/VendorsPage/i, routes: ['/vendors'] },
  { pattern: /src\/pages\/VendorDetail/i, routes: ['/vendors', '/'] }, // linked from both
  { pattern: /src\/pages\/DealsPage/i, routes: ['/deals'] },
  { pattern: /src\/pages\/SellPage/i, routes: ['/sell'] },
  { pattern: /src\/pages\/CartPage/i, routes: ['/cart'] },
  { pattern: /src\/pages\/CheckoutPage/i, routes: ['/checkout'] },
  { pattern: /src\/pages\/OrderConfirmation/i, routes: ['/order/:id/confirmation'] },
  { pattern: /src\/pages\/OrderTracking/i, routes: ['/order/:id/track'] },
  { pattern: /src\/pages\/AccountPage/i, routes: ['/account'] },
  { pattern: /src\/pages\/VendorDashboard/i, routes: ['/vendor/dashboard'] },
  { pattern: /src\/pages\/VendorInventory/i, routes: ['/vendor/inventory'] },
  { pattern: /src\/pages\/VendorOrders/i, routes: ['/vendor/orders'] },
  { pattern: /src\/pages\/AdminOverview/i, routes: ['/admin/overview'] },
  { pattern: /src\/pages\/AdminVendors/i, routes: ['/admin/vendors'] },
  { pattern: /src\/pages\/AdminUsersPage/i, routes: ['/admin/users'] },
  { pattern: /src\/pages\/AdminDisputes/i, routes: ['/admin/disputes'] },

  // Shared components/state affect MULTIPLE routes — when these change,
  // we can't narrow to one page, so they expand to a representative set
  // covering all three navbar role-variants plus one customer content
  // page, rather than silently under-checking a global change.
  {
    pattern: /src\/components\/navbar\/Navbar/i,
    routes: ['/', '/vendor/dashboard', '/admin/overview'],
    reason: 'Navbar renders on every page; checking one page per role variant is representative.',
  },
  {
    pattern: /src\/store\/cartStore/i,
    routes: ['/', '/catalog', '/cart', '/checkout'],
    reason: 'cartStore is read by the navbar badge, catalog quick-add, cart, and checkout.',
  },
  {
    pattern: /src\/store\/authStore/i,
    routes: ['/', '/vendor/dashboard', '/admin/overview', '/account'],
    reason: 'authStore drives role-based rendering across the whole app.',
  },
  {
    pattern: /src\/index\.css/i,
    routes: ['/', '/vendor/dashboard', '/admin/overview', '/account'],
    reason: 'Global CSS/theme tokens affect every page; checking one representative page per major layout is enough to catch a token-level regression.',
  },
  {
    pattern: /src\/(types|mocks|services)\//i,
    routes: [], // data-layer only, handled specially below
    reason: 'Data/type/service changes have no direct visual route — flagged for a data-correctness check instead of a screenshot check.',
  },
];

/**
 * Given a list of changed file paths (from a diff), return the set of
 * routes that should be screenshotted/interaction-tested, plus a note
 * of WHY each was included (useful for logging/debugging, and for
 * telling Gemini why these routes were selected).
 *
 * @param {string[]} changedFilePaths - e.g. ['src/pages/CartPage.tsx', 'src/store/cartStore.ts']
 * @returns {{ routes: string[], reasons: string[], dataLayerOnly: boolean }}
 */
export function determineAffectedRoutes(changedFilePaths) {
  const routesSet = new Set();
  const reasons = [];
  let matchedAnything = false;
  let onlyDataLayerFiles = true;

  for (const filePath of changedFilePaths) {
    let matchedThisFile = false;

    for (const rule of FILE_TO_ROUTES) {
      if (rule.pattern.test(filePath)) {
        matchedThisFile = true;
        matchedAnything = true;

        if (rule.routes.length === 0) {
          reasons.push(`${filePath}: ${rule.reason || 'data-layer file, no direct route'}`);
          continue;
        }

        onlyDataLayerFiles = false;
        for (const route of rule.routes) {
          routesSet.add(route);
        }
        if (rule.reason) {
          reasons.push(`${filePath} → ${rule.routes.join(', ')} (${rule.reason})`);
        } else {
          reasons.push(`${filePath} → ${rule.routes.join(', ')}`);
        }
      }
    }

    if (!matchedThisFile) {
      onlyDataLayerFiles = false; // unknown file — be safe, don't assume it's data-only
      reasons.push(`${filePath}: no mapping found — file not recognized by scope-analyzer, review this file manually and consider adding a mapping rule`);
    }
  }

  return {
    routes: Array.from(routesSet),
    reasons,
    dataLayerOnly: matchedAnything && onlyDataLayerFiles,
  };
}

/**
 * Parse a unified diff's file headers to extract the list of changed
 * file paths, without needing a full diff-parsing library.
 * @param {string} diffText - raw unified diff text (e.g. from GitHub's API)
 * @returns {string[]}
 */
export function extractChangedFilePaths(diffText) {
  const paths = new Set();
  const lines = diffText.split('\n');
  for (const line of lines) {
    // Unified diff file headers look like: "+++ b/src/pages/CartPage.tsx"
    const match = line.match(/^\+\+\+ b\/(.+)$/);
    if (match && match[1] !== '/dev/null') {
      paths.add(match[1]);
    }
  }
  return Array.from(paths);
}