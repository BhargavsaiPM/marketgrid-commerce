import { readFileSync } from 'node:fs';
import { reviewWithGemini } from './gemini-review.js';

const diffText = readFileSync('./test-diff.txt', 'utf-8');
const screenshotBase64 = readFileSync('./test-screenshot.png').toString('base64');

const result = await reviewWithGemini({
  taskPrompt: 'Add a one-line HTML comment at the top of index.html saying: <!-- Spark test task -->. Make this small change and open a PR.',
  diffText,
  styleGuidePath: '../STYLE_GUIDE.md',
  routeResults: [
    {
      route: '/',
      screenshotBase64,
      consoleErrors: [],
      pageErrors: [],
      navigationError: null,
    },
  ],
});

console.log(JSON.stringify(result, null, 2));