# MarketGrid Commerce — Developer Specification
### Multi-Tenant E-Commerce Marketplace & Vendor Management System

This is the single source of truth for design rules, UI conventions,
Tailwind patterns, and frontend constraints on this project. It
supersedes any individual task prompt or bug-fix note that came before
it. When in doubt, follow this document.

---

## 1. Stack (fixed, do not change)

- Vite + React 18 + TypeScript
- Tailwind CSS 3 (JIT), theme extended via CSS custom properties in
  `src/index.css`
- React Router v6
- Zustand for state (`cartStore`, `authStore`)
- Framer Motion for animation
- Lucide React for icons only — no other icon library

Do not introduce Next.js, Redux, styled-components, or any other UI
component library (no shadcn, no MUI, no Chakra). Everything is
hand-built to the spec in this document.

---

## 2. Design system — "Obsidian Flux" (dark) / "Daylight Grid" (light)

Both themes share the same structural mechanics — only color values
differ. **Both themes use glassmorphism.** Light mode is NOT a flat/
bordered alternative; it uses the same blur+translucency mechanic as
dark mode, just tinted for a light base (see §2.3).

### 2.1 Color tokens

All colors are CSS custom properties in `src/index.css`, under `:root`
(light/default) and `[data-theme="dark"]` (dark). Never hardcode hex
values in components — always reference the Tailwind color name mapped
to these variables.

```css
/* Light — Daylight Grid */
--color-surface: #FAFAF9;
--color-surface-container-lowest: #FFFFFF;
--color-surface-container-low: #F6F6F6;
--color-surface-container: #F0F0F0;
--color-surface-container-high: #EAEAEA;
--color-surface-container-highest: #E4E4E4;
--color-on-surface: #121318;
--color-on-surface-variant: #484555;
--color-outline: #938ea1;
--color-outline-variant: #c9c4d8;
--color-primary: #6C63FF;
--color-on-primary: #FFFFFF;
--color-secondary: #2FA893;
--color-on-secondary: #FFFFFF;
--color-tertiary: #ffb955;
--color-error: #ba1a1a;
--color-background: #FAFAF9;
--color-on-background: #121318;
--glass-level-1-fill: rgba(0, 0, 0, 0.04);
--glass-level-1-border: rgba(0, 0, 0, 0.1);
--glass-level-2-fill: rgba(0, 0, 0, 0.08);
--glass-level-2-border: rgba(0, 0, 0, 0.2);

/* Dark — Obsidian Flux */
--color-surface: #121318;
--color-surface-container-lowest: #0d0e13;
--color-surface-container-low: #1a1b20;
--color-surface-container: #1e1f25;
--color-surface-container-high: #292a2f;
--color-surface-container-highest: #33343a;
--color-on-surface: #e3e2e9;
--color-on-surface-variant: #c9c4d8;
--color-outline: #938ea1;
--color-outline-variant: #484555;
--color-primary: #6C63FF;
--color-secondary: #2FA893;
--color-tertiary: #ffb955;
--color-error: #ffb4ab;
--color-background: #05060A;
--color-on-background: #e3e2e9;
--glass-level-1-fill: rgba(255, 255, 255, 0.04);
--glass-level-1-border: rgba(255, 255, 255, 0.1);
--glass-level-2-fill: rgba(255, 255, 255, 0.08);
--glass-level-2-border: rgba(255, 255, 255, 0.2);
```

**Known gap:** `--color-surface-variant` has caused two separate bugs
(navbar hover, AccountPage audit-log hover) because it does not exist as
a token but is referenced via `hover:bg-surface-variant` in several
places. Either define it properly in both theme blocks (recommended: a
step between `surface-container` and `surface-container-high` in the
elevation scale) or replace all `hover:bg-surface-variant` usages with
`hover:bg-surface-container-high`. Do not leave this token undefined —
audit for any remaining references before adding new hover states.

**Do not use neon glow effects.** No `shadow-[0_0_Npx_#hexcolor]` glows
on active states, underlines, or price text. This was an explicit
correction from an earlier "trading terminal" aesthetic — the brand is
meant to read as professional/enterprise, not speculative/crypto.

### 2.2 Glass elevation levels

```css
.glass-1 {
  background-color: var(--glass-level-1-fill);
  backdrop-filter: blur(40px);
  border: 1px solid var(--glass-level-1-border);
}
.glass-2 {
  background-color: var(--glass-level-2-fill);
  backdrop-filter: blur(64px);
  border: 1px solid var(--glass-level-2-border);
}
```

- **`glass-1`**: cards, panels, static content containers (ProductCard,
  MetricCard, section containers on AccountPage).
- **`glass-2`**: anything that floats OVER other content — mega-menus,
  simple dropdowns, the avatar menu, modals, popovers. `glass-2` has
  double the blur and fill opacity specifically because floating
  elements need to stay legible against whatever page content is behind
  them. Using `glass-1` for a dropdown was a confirmed bug — verify any
  new floating element uses `glass-2`.

### 2.3 Light mode's glass math (do not get this backwards)

Dark mode glass = a small amount of **white** tint over a near-black
base (this is what "frosts" the surface). Light mode cannot use white
tint on an already-light base — that would be invisible. Light mode
glass uses the same blur amounts and elevation structure, but the tint
is **dark** (black at low opacity) instead of white. This is already
correctly implemented in the CSS variables above — the pattern to
remember for any new theme-aware component: never assume "glass = white
tint," it's "glass = tint in the direction that creates contrast against
the base."

### 2.4 Vendor Seam (signature component)

The one deliberate signature visual element, used ONLY where multiple
vendors' content appears together (Cart, Checkout Split Review, Order
Tracking lanes). Not used as a generic decorative divider elsewhere.

```css
.vendor-seam {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--color-primary), var(--color-secondary), transparent);
  background-size: 200% 100%;
  animation: flow 3s linear infinite;
}
```

### 2.5 Typography

- **Space Grotesk** — headings, display text, tight tracking
  (-0.02em to -0.04em)
- **Inter** — body text, labels, UI copy
- **JetBrains Mono** — all prices, SKUs, order IDs, stock counts, any
  numeric/tabular data. This is a hard rule: a price rendered in Inter
  instead of JetBrains Mono is a bug.

### 2.6 Shape

4px (`rounded`) for buttons/inputs, 8px (`rounded-lg`) for cards/large
containers. 1.5px stroke weight for all Lucide icons.

---

## 3. Navbar — structure and known-bug checklist

One shared `Navbar.tsx` component, content varies by role
(`useAuthStore` → `session.user.role`).

### 3.1 Customer nav
`Categories ▾` (mega-menu) · `Vendors ▾` (mega-menu) · `Deals ▾`
(mega-menu) · `Sell on MarketGrid` (plain link, neutral color — NOT
accent-colored, this was a confirmed bug).

Mega-menus are two-column: left = intro sentence + "See all" link, right
= icon/card grid of actual content (categories, vendors, or deal
products) pulled from real mock data, never static placeholder text.

### 3.2 Vendor nav
`Dashboard` (plain) · `Inventory ▾` (simple single-column dropdown:
Manage Stock / Bulk Upload / Low-Stock Report) · `Orders ▾` (simple
dropdown: All Orders / Pending Fulfillment / Completed) · `Analytics`
(plain).

### 3.3 Admin nav
`Overview` (plain) · `Vendors ▾` (simple dropdown: All Vendors / KYC
Review Queue / Suspended) · `Users ▾` (simple dropdown: Customers /
Vendors / Admins) · `Reports` (plain).

Vendor/Admin dropdowns are single-column, no intro blurb, no icon grid —
ops screens need density, not a marketing panel. Same `glass-2` treatment
as customer mega-menus, just simpler internal layout.

### 3.4 Right side, all roles
Expanding search icon → cart icon (customer role ONLY — vendors/admins
do not purchase, hide this icon entirely for those roles) → auth area:
- Logged out: solid "Sign In" pill button.
- Logged in, customer: avatar menu only.
- Logged in, vendor/admin: tenant/role-switcher pill (same visual weight
  as Sign In button) + avatar menu.

Avatar dropdown must match the same visual polish as mega-menus — proper
padding, consistent icon+label row alignment, clear separator between
user-info header and action links. A cramped/unstyled avatar dropdown
next to polished mega-menus is a confirmed recurring bug.

### 3.5 Active-state rules

- Active nav item = 2px solid `primary`-color underline directly under
  the item (Framer Motion `layoutId="activeNavIndicator"` for a smooth
  sliding transition between items).
- **Every** top-level nav item must have its own active-route condition,
  matched with `.startsWith()` for items with sub-routes (e.g. Inventory
  is active on `/vendor/inventory`, `/vendor/inventory/bulk`, AND
  `/vendor/inventory/reports`). A confirmed bug: several nav items
  (Inventory, Orders, Analytics, admin Vendors, Users, Reports) had NO
  active-state condition written at all — only Dashboard and Overview
  were wired up. When adding any new nav item, always add its
  active-route condition; do not assume it's covered by a shared/default
  case.
- No nav item should default to "active" on a page it doesn't own. There
  is no correct fallback/default active item — the correct state on an
  unrelated page (Cart, Checkout, Account) is that NONE of the
  Categories/Vendors/Deals-style items show as active.
- "Sell on MarketGrid" uses `isNeutral` styling (never accent-colored)
  but still needs its own active-route condition for the underline to
  appear when actually on `/sell` — neutral color and active-state
  tracking are two independent things, fixing one does not fix the other.

### 3.6 Dropdown timing

All dropdowns (mega-menus, simple dropdowns, avatar menu) close via a
600ms delayed `setTimeout` on `mouseLeave`, cleared if the user re-enters
the trigger or panel before it fires. Do not close dropdowns
instantaneously on mouse-leave — this was an explicit UX correction.

---

## 4. State management

### 4.1 Cart (`src/store/cartStore.ts`)

Canonical shape — **items are grouped by vendor, not a flat array.**
This was the subject of a confirmed merge conflict; the flat-array
version is deprecated and must not be reintroduced.

```typescript
interface CartState {
  itemsByVendor: Record<string, CartItem[]>;
  addItem: (product: ProductDTO, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemsByVendor: () => Record<string, CartItem[]>;
  getVendorTotals: () => Record<string, number>;
  getGrandTotal: () => number;
  getTotalItemsCount: () => number;
}
```

Any component reading the cart (Navbar's badge, CartPage, CheckoutPage)
must use these existing selector functions — never re-derive totals
independently in a component, and never change these function
signatures without checking every consumer first.

### 4.2 Auth (`src/store/authStore.ts`)

In-memory only — no `localStorage`. Holds `session.user` with
`role: 'customer' | 'vendor' | 'admin'`, `activeTenantId`, mock JWT.
`login` / `logout` / `switchTenant` actions.

---

## 5. Mock data — fixed dataset, reused everywhere

Do not invent different vendors/products/currency per page. This
exact dataset is the anchor; extra products can be added but these must
always exist and stay named as below:

**Vendors:** Lumen Electronics (Tier-1, Electronics, 4.8★) · Aurora Home
Goods (Boutique, Home & Living, 4.6★) · Vertex Sportswear (Verified,
Sports, 4.7★) · Nimbus Beauty Co. (Boutique, Beauty, 4.9★)

**Products:** Aria Wireless Earbuds Pro ($89.99, Lumen, in stock 142) ·
Halo Smart Display 7in ($59.99, Lumen, low stock 6) · Linen Weave Throw
Blanket ($34.50, Aurora, in stock 58) · TrailFlex Running Shoes ($74.00,
Vertex, in stock 210) · Rosewater Renewal Serum ($28.00, Nimbus, out of
stock)

**Currency:** USD only. Never any other symbol or fictional currency.

**Stock status convention:** always dot + text label together, never
color alone — `● In stock (142)` (secondary/teal), `● Low stock (6)`
(tertiary/amber), `● Out of stock` (error/rose, outline-only dot).

---

## 6. Page inventory and route map

| Route | Page | Role |
|---|---|---|
| `/` | Storefront | all |
| `/catalog` | CatalogPage | all |
| `/vendors` | VendorsPage | all |
| `/vendor/:id` | VendorDetail | all |
| `/deals` | DealsPage | all |
| `/sell` | SellPage | all |
| `/cart` | CartPage | customer |
| `/checkout` | CheckoutPage | customer |
| `/order/:id/confirmation` | OrderConfirmationPage | customer |
| `/order/:id/track` | OrderTrackingPage | customer |
| `/account` | AccountPage | all (content adapts by role) |
| `/vendor/dashboard` | VendorDashboard | vendor |
| `/vendor/inventory` | VendorInventory | vendor |
| `/vendor/orders` | VendorOrders | vendor |
| `/admin/overview` | AdminOverview | admin |
| `/admin/vendors` | AdminVendors | admin |
| `/admin/users` | AdminUsersPage | admin |
| `/admin/disputes` | AdminDisputes | admin |

**One Account page, not three.** Role-conditional sections within a
single component (`user.role === 'customer' | 'vendor' | 'admin'`), not
separate routes per role.

### 6.1 AccountPage structure — accordion, not a scrolling stack

Sections: Profile Details → Location → Account Settings → role-specific
section (Saved Addresses / Business Details / Platform Access).

- True accordion: only one section expanded at a time; opening a new
  one collapses whichever was previously open.
- Default state: Profile Details expanded, all others collapsed.
- Collapsed headers show a one-line preview of actual current values
  (e.g. "Customer User · customer@example.com"), not placeholder text.
- Chevron icon rotates 180° on expand.
- Smooth height/opacity transition (Framer Motion), respects
  `prefers-reduced-motion`.

### 6.2 Checkout — split-vendor is the core feature, don't flatten it

CheckoutPage must render checkout as **one card per vendor** present in
the cart (via `getItemsByVendor`), each with its own subtotal, shipping
cost, and estimated delivery date, separated by the Vendor Seam divider
— then a combined grand total below. This is the product's actual
differentiator; a checkout that just shows one flat list of all items
regardless of vendor defeats the purpose.

### 6.3 Order Tracking — shipments progress independently

OrderTrackingPage must show one horizontal stepper "lane" per vendor
shipment, and **different vendors must be allowed to be at different
statuses simultaneously** (e.g. one Shipped, another still Packed). A
tracker where every vendor lane shows the same status at all times fails
to demonstrate the actual multi-vendor split-fulfillment concept.

---

## 7. Accessibility & motion

- All Framer Motion transitions must respect `prefers-reduced-motion`
  (collapse to opacity-only fades when set).
- Color is never the sole signal — stock status, active nav state, and
  any status indicator always pairs a color with text/shape.
- Keyboard-navigable focus rings on all interactive elements.

---

## 8. Process rules for AI-assisted development (Jules or similar agents)

These exist because of repeated, confirmed failure patterns during this
project's build — they are not theoretical.

1. **Always create a new branch per task**, off the current tip of
   `main`. Never commit onto a branch that already has a merged or
   closed pull request — commits pushed there have no PR to attach to
   and become invisible/orphaned. State the exact branch name in every
   task summary.
2. **Read before rewriting.** Before modifying an existing file
   (`cartStore.ts`, `index.css`, any shared store/service), read its
   current contents and extend in place. Do not redeclare an interface
   differently or change a function's signature/behavior without
   checking every other file that already calls it.
3. **Don't trust a "View PR" button blindly.** Verify the actual PR
   exists and targets the right branch via GitHub's compare view
   (`/compare/main...branch-name`) directly.
4. **Verify immediately after every merge** — `git pull`, `npm install`,
   `npm run dev`, check the browser console — before starting the next
   task. Silent breakage compounds if multiple tasks stack before
   anyone checks.
5. **On merge conflicts**, read the full conflicting file content before
   resolving. Some conflicts are cosmetic duplicates (safe to
   auto-resolve); others (like the cartStore shape change) represent a
   genuine design decision between two different implementations and
   need a considered choice, not a coin flip.
6. **One task at a time.** Do not queue multiple sequential tasks before
   verifying the previous one — later tasks build on assumptions about
   what already exists, and those assumptions need to be confirmed true
   first.
