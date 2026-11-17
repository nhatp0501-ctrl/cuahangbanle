'use strict';
const fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '..'),
  { productCatalog } = require('../src/data/product-catalog');
const errors = [];
let bytes = 0;
const categories = new Set(),
  names = new Set(),
  images = new Set();
for (const p of productCatalog) {
  categories.add(p.category);
  if (names.has(p.name)) errors.push('Duplicate name: ' + p.name);
  names.add(p.name);
  images.add(p.image);
  const file = path.resolve(root, p.image);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    errors.push('Missing: ' + p.image);
    continue;
  }
  const b = fs.readFileSync(file);
  bytes += b.length;
  if (!(b[0] === 255 && b[1] === 216) && !(b[0] === 137 && b.toString('ascii', 1, 4) === 'PNG'))
    errors.push('Not JPEG/PNG: ' + p.image);
  if (!p.sourceUrl || !p.sourceImageUrl) errors.push('Missing source: ' + p.name);
}
console.log(
  JSON.stringify(
    {
      products: productCatalog.length,
      uniqueNames: names.size,
      uniqueImages: images.size,
      categories: categories.size,
      megabytes: Math.round((bytes / 1024 / 1024) * 100) / 100,
      legacy: productCatalog.filter((p) => p.legacyId).map((p) => p.legacyId),
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
