// interaction-manifest.js
// Defines, per route, which interactive elements to hover/click during a
// review cycle, and what before/after screenshot pair to capture for
// each. Selectors are best-guess based on everything built so far in
// this project (navbar structure, ProductCard, CartPage, AccountPage
// accordion) — adjust the CSS selectors here if they don't match your
// actual rendered DOM once you test against it.
//
// Each interaction is one of:
//   { type: 'hover', name, selector }
//     - hovers the element, waits briefly, screenshots, then moves the
//       mouse away and screenshots again (before/after pair)
//   { type: 'click', name, selector, waitForSelector? }
//     - clicks the element, optionally waits for another selector to
//       appear (e.g. a dropdown panel), screenshots, then clicks
//       elsewhere to close/reset and screenshots again
//
// "global" interactions run on EVERY route (the navbar is present
// everywhere). Route-specific interactions run only on that route.

export const GLOBAL_INTERACTIONS = [
  { type: 'hover', name: 'navbar-categories-hover', selector: 'nav >> text=Categories' },
  { type: 'hover', name: 'navbar-vendors-hover', selector: 'nav >> text=Vendors' },
  { type: 'hover', name: 'navbar-deals-hover', selector: 'nav >> text=Deals' },
  {
    // Confirmed from real Navbar.tsx source: this button has no
    // aria-label, opens via onMouseEnter (hover), not a click, and
    // contains a Lucide User icon. Target it by icon + position (last
    // round button in the nav) rather than an aria-label that doesn't
    // exist. If the navbar markup changes, this may need updating —
    // an aria-label added to that button would be a more robust fix
    // worth requesting as a small Jules task later.
    type: 'hover',
    name: 'navbar-avatar-dropdown',
    selector: 'nav button:has(svg.lucide-user)',
  },
];

export const ROUTE_INTERACTIONS = {
  '/': [
    {
      type: 'hover',
      name: 'storefront-first-product-quick-add',
      selector: 'button[aria-label^="Add "][aria-label$=" to cart"] >> nth=0',
    },
  ],
  '/catalog': [
    {
      type: 'click',
      name: 'catalog-quick-add-first-product',
      selector: 'button[aria-label^="Add "][aria-label$=" to cart"] >> nth=0',
    },
  ],
  '/cart': [
    {
      // Confirmed from real CartPage.tsx: the increment button has no
      // aria-label but contains a Lucide Plus icon (the decrement
      // button uses Minus, so targeting by icon distinguishes them).
      // Targets the first item's increment button across all vendor
      // groups.
      type: 'click',
      name: 'cart-quantity-increment',
      selector: 'button:has(svg.lucide-plus) >> nth=0',
    },
  ],
  '/account': [
    {
      type: 'click',
      name: 'account-location-section-expand',
      selector: 'text=Location',
      waitForSelector: 'text=Use my current location',
    },
  ],
  '/vendor/dashboard': [
    { type: 'hover', name: 'vendor-nav-inventory-hover', selector: 'nav >> text=Inventory' },
  ],
  '/admin/overview': [
    { type: 'hover', name: 'admin-nav-vendors-hover', selector: 'nav >> text=Vendors' },
  ],
};

/**
 * All routes Spark should check every review cycle, per your decision
 * to always run full coverage rather than only the current task's
 * routes. Keep this in sync with the actual route map in the project.
 */
export const ALL_ROUTES = [
  '/',
  '/catalog',
  '/vendors',
  '/deals',
  '/sell',
  '/cart',
  '/checkout',
  '/account',
  '/vendor/dashboard',
  '/vendor/inventory',
  '/vendor/orders',
  '/admin/overview',
  '/admin/vendors',
  '/admin/users',
  '/admin/disputes',
];