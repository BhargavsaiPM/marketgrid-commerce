import { chromium } from 'playwright';
import { GLOBAL_INTERACTIONS, ROUTE_INTERACTIONS } from './interaction-manifest.js';

async function testRoute(route) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`\n=== Testing route: ${route} ===`);
  await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const interactions = [...GLOBAL_INTERACTIONS, ...(ROUTE_INTERACTIONS[route] || [])];

  for (const interaction of interactions) {
    try {
      const locator = page.locator(interaction.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 3000 });
      console.log(`  ✅ FOUND: "${interaction.name}" (selector: ${interaction.selector})`);
    } catch (err) {
      console.log(`  ❌ NOT FOUND: "${interaction.name}" (selector: ${interaction.selector})`);
    }
  }

  await browser.close();
}

await testRoute('/');
await testRoute('/cart');
await testRoute('/account');