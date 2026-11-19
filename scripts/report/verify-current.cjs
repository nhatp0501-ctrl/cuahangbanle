'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  zlib = require('node:zlib'),
  { pathToFileURL } = require('node:url');
const { out, root } = require('./browser-session.cjs'),
  dep = require('./dependencies.cjs');
const qa = path.join(root, 'preview', 'report-v3-qa');
fs.mkdirSync(qa, { recursive: true });
function unzipXML(bytes) {
  let end = bytes.length - 22;
  while (end >= 0 && bytes.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw Error('Word không phải ZIP hợp lệ.');
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const entries = [],
    xml = {};
  for (let n = 0; n < count; n++) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50)
      throw Error('ZIP central directory không hợp lệ.');
    const len = bytes.readUInt16LE(offset + 28),
      extra = bytes.readUInt16LE(offset + 30),
      comment = bytes.readUInt16LE(offset + 32),
      name = bytes.toString('utf8', offset + 46, offset + 46 + len),
      method = bytes.readUInt16LE(offset + 10),
      size = bytes.readUInt32LE(offset + 20),
      local = bytes.readUInt32LE(offset + 42);
    entries.push(name);
    if (['word/document.xml', 'word/settings.xml'].includes(name)) {
      const start = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28),
        data = bytes.subarray(start, start + size);
      xml[name] = (method === 8 ? zlib.inflateRawSync(data) : data).toString('utf8');
    }
    offset += 46 + len + extra + comment;
  }
  return { entries, xml };
}
async function main() {
  const canvas = dep('@napi-rs/canvas');
  Object.assign(globalThis, {
    DOMMatrix: canvas.DOMMatrix,
    ImageData: canvas.ImageData,
    Path2D: canvas.Path2D,
  });
  const pdfjs = await import(pathToFileURL(dep.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href);
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(
      fs.readFileSync(path.join(out, 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.pdf')),
    ),
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  const layout = JSON.parse(fs.readFileSync(path.join(out, 'kiem-tra-bo-cuc-v3.json'), 'utf8'));
  const rows = Math.ceil(document.numPages / 6),
    montage = canvas.createCanvas(6 * 220, rows * 315),
    ctx = montage.getContext('2d');
  ctx.fillStyle = '#e4e8ee';
  ctx.fillRect(0, 0, montage.width, montage.height);
  const selected = new Set([1, 2, 3, 8, 9, 14, 21, 25, 28, 35, 40, 47, 53, 59, 64, 69, 73]),
    texts = [];
  for (let n = 1; n <= document.numPages; n++) {
    const page = await document.getPage(n),
      content = await page.getTextContent();
    texts.push({ page: n, text: content.items.map((i) => i.str).join(' ') });
    const vp = page.getViewport({ scale: 0.32 }),
      small = canvas.createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    await page.render({ canvasContext: small.getContext('2d'), viewport: vp }).promise;
    const x = ((n - 1) % 6) * 220 + 12,
      y = Math.floor((n - 1) / 6) * 315 + 22;
    ctx.drawImage(small, x, y);
    ctx.fillStyle = '#25344c';
    ctx.font = '12px Arial';
    ctx.fillText('Trang ' + n, x, y - 6);
    if (selected.has(n)) {
      const view = page.getViewport({ scale: 1.25 }),
        large = canvas.createCanvas(Math.ceil(view.width), Math.ceil(view.height));
      await page.render({ canvasContext: large.getContext('2d'), viewport: view }).promise;
      fs.writeFileSync(path.join(qa, 'page-' + n + '.png'), large.toBuffer('image/png'));
    }
  }
  fs.writeFileSync(path.join(qa, 'montage.png'), montage.toBuffer('image/png'));
  fs.writeFileSync(path.join(out, 'van-ban-trich-xuat-pdf.json'), JSON.stringify(texts, null, 2));
  const zip = unzipXML(
      fs.readFileSync(path.join(out, 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.docx')),
    ),
    xml = zip.xml['word/document.xml'],
    text = texts.map((t) => t.text).join('\n');
  const checks = {
    pdfPages: document.numPages,
    htmlPages: layout.length,
    pdfPagesMatchLayout: document.numPages === layout.length,
    noOverflow: layout.every((p) => p.overflow <= 1),
    allPagesHaveText: texts.every((t) => t.text.length > 60),
    noReplacementCharacter: !text.includes('\ufffd'),
    containsAllChapters: [1, 2, 3, 4, 5, 6, 7].every((n) => text.includes('CHƯƠNG ' + n)),
    containsNewPromotions: text.includes('nhiều chương trình'),
    containsInvoiceReconciliation: text.includes('đối chiếu hóa đơn'),
    containsReferences: text.includes('Tài liệu tham khảo'),
    noObsoleteSettingsLabel: !text.includes('Hoàn tiền cần phê duyệt'),
    wordIsValid: xml.includes('</w:document>'),
    wordImages: zip.entries.filter((e) => e.startsWith('word/media/') && e.endsWith('.png')).length,
    wordHasAutomaticTOC: xml.includes('TOC '),
    wordHasVietnamese: xml.includes('đối chiếu') && xml.includes('khuyến mãi'),
    wordUpdatesFields: zip.xml['word/settings.xml']?.includes('updateFields') || false,
  };
  const bad = Object.entries(checks).filter(([k, v]) => typeof v === 'boolean' && !v);
  fs.writeFileSync(
    path.join(out, 'kiem-tra-tai-lieu-v3.json'),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        checks,
        pdfSize: fs.statSync(path.join(out, 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.pdf')).size,
        wordSize: fs.statSync(path.join(out, 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.docx')).size,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(checks));
  await loadingTask.destroy();
  if (bad.length) throw Error('Chưa đạt: ' + JSON.stringify(bad));
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
