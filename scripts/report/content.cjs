'use strict';
const fs = require('node:fs'),
  path = require('node:path');
const { out } = require('./browser-session.cjs');
const evidence = {
  unit: JSON.parse(fs.readFileSync(path.join(out, 'ket-qua-nghiep-vu.json'), 'utf8')),
  browser: JSON.parse(fs.readFileSync(path.join(out, 'ket-qua-trinh-duyet.json'), 'utf8')),
  ui: JSON.parse(fs.readFileSync(path.join(out, 'bang-chung-giao-dien.json'), 'utf8')),
};
const pages = [];
const api = {
  page: (chapter, title, lead, blocks) =>
    pages.push({
      id: 's' + String(pages.length + 1).padStart(3, '0'),
      chapter,
      title,
      lead,
      blocks,
    }),
  p: (text) => ({ type: 'p', text }),
  h: (text) => ({ type: 'heading', text }),
  t: (headers, rows) => ({ type: 'table', headers, rows }),
  b: (items) => ({ type: 'bullets', items }),
  n: (title, text) => ({ type: 'note', title, text }),
  f: (image, caption) => ({ type: 'figure', image, caption }),
  pair: (figures) => ({ type: 'pair', figures }),
  flow: (steps) => ({ type: 'flow', steps }),
  evidence,
};
for (const module of ['foundations', 'requirements', 'architecture', 'screens', 'evaluation'])
  require('./content-' + module + '.cjs')(api);
let figureNumber = 0,
  tableNumber = 0;
const figures = [],
  tables = [];
for (const page of pages) {
  for (const block of page.blocks) {
    if (block.type === 'figure') {
      block.number = ++figureNumber;
      block.id = 'fig' + figureNumber;
      figures.push({ id: block.id, number: block.number, title: block.caption, pageId: page.id });
    } else if (block.type === 'pair') {
      block.items = block.figures.map(([image, caption]) => {
        const item = { image, caption, number: ++figureNumber, id: 'fig' + figureNumber };
        figures.push({ id: item.id, number: item.number, title: caption, pageId: page.id });
        return item;
      });
    } else if (block.type === 'table') {
      if (block.headers[0] === 'Chức năng' && block.headers[1] === 'Admin')
        block.widths = [46, 18, 18, 18];
      if (block.headers[0] === 'Mã') block.widths = [12, 39, 49];
      if (block.headers[0] === 'Bộ kiểm thử') block.widths = [26, 10, 48, 16];
      block.number = ++tableNumber;
      block.id = 'table' + tableNumber;
      block.caption =
        page.title.replace(/^\d+\.\d+\.\s*/, '') +
        (page.blocks.filter((b) => b.type === 'table').length > 1
          ? ' – bảng ' + (page.blocks.filter((b) => b.type === 'table').indexOf(block) + 1)
          : '');
      tables.push({ id: block.id, number: block.number, title: block.caption, pageId: page.id });
    }
  }
}
module.exports = { pages, figures, tables, evidence };
