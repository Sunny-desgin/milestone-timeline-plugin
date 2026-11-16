import fs from 'node:fs';
import path from 'node:path';

const root = import.meta.dirname;
const dist = path.join(root, 'dist');
const reviewIndex = path.join(dist, 'index.html');
const reviewAssets = path.join(dist, 'assets');

if (!fs.existsSync(reviewIndex)) {
  throw new Error('Missing dist/index.html. Run npm run build first.');
}

if (!fs.existsSync(reviewAssets)) {
  throw new Error('Missing dist/assets. Run npm run build first.');
}

const reviewHtml = fs.readFileSync(reviewIndex, 'utf8');

if (!reviewHtml.includes('<div id="root"></div>')) {
  throw new Error('The dist entry does not contain the application root element.');
}

if (reviewHtml.includes('/src/index.tsx')) {
  throw new Error('The dist entry still references the development source file.');
}

const references = [...reviewHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((reference) => !reference.startsWith('data:') && !reference.startsWith('#'));

if (references.length === 0) {
  throw new Error('No static asset references were found in dist/index.html.');
}

const invalidReferences = references.filter(
  (reference) => !reference.startsWith('./') || reference.startsWith('./../'),
);
if (invalidReferences.length > 0) {
  throw new Error(`Non-relative asset references: ${invalidReferences.join(', ')}`);
}

for (const reference of references) {
  const pathname = reference.split(/[?#]/, 1)[0];
  const assetPath = path.resolve(dist, pathname);
  if (!assetPath.startsWith(`${dist}${path.sep}`) || !fs.existsSync(assetPath)) {
    throw new Error(`Missing review asset: ${reference}`);
  }
}

console.log(`Static review entry verified: ${reviewIndex}`);
console.log(`Relative asset references verified: ${references.length}`);
