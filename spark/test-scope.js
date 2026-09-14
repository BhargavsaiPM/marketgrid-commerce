import { extractChangedFilePaths, determineAffectedRoutes } from './scope-analyzer.js';

const testDiff = readFileSyncTest();

function readFileSyncTest() {
  return `diff --git a/src/pages/CartPage.tsx b/src/pages/CartPage.tsx
index abc..def 100644
--- a/src/pages/CartPage.tsx
+++ b/src/pages/CartPage.tsx
@@ -1,1 +1,1 @@
diff --git a/src/store/cartStore.ts b/src/store/cartStore.ts
index abc..def 100644
--- a/src/store/cartStore.ts
+++ b/src/store/cartStore.ts
@@ -1,1 +1,1 @@`;
}

const files = extractChangedFilePaths(testDiff);
console.log('Changed files found:', files);

const scope = determineAffectedRoutes(files);
console.log(JSON.stringify(scope, null, 2));