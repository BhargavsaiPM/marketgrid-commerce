import { chromium } from 'playwright';
import { loginAs } from './auth-helper.js';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:5173');
await page.waitForTimeout(800);

const result = await loginAs(page, 'customer');
console.log(JSON.stringify(result, null, 2));

await browser.close();