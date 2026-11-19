'use strict';
const fs = require('node:fs'),
  path = require('node:path');
const { out } = require('./browser-session.cjs'),
  dep = require('./dependencies.cjs');
const { pages, figures, tables, evidence } = require('./content.cjs');
const docx = dep('docx'),
  { loadImage } = dep('@napi-rs/canvas');
const name = 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3';
const escape = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const metaFile = path.join(out, 'thong-tin-bia.json');
const metadata = fs.existsSync(metaFile)
  ? JSON.parse(fs.readFileSync(metaFile, 'utf8'))
  : {
      school: '[TÊN TRƯỜNG]',
      faculty: '[KHOA / BỘ MÔN]',
      course: '[Tên môn học]',
      teacher: '[Họ tên giảng viên]',
      students: '[Họ tên – MSSV – Lớp / Nhóm]',
      date: 'Tháng 11 năm 2026',
    };
const imageCache = new Map();
function imageData(image) {
  if (!imageCache.has(image))
    imageCache.set(image, fs.readFileSync(path.join(out, 'anh', image + '.png')));
  return imageCache.get(image);
}
function figureHTML(f) {
  return `<figure id="${f.id}"><img src="data:image/png;base64,${imageData(f.image).toString('base64')}" alt="${escape(f.caption)}"><figcaption>Hình ${f.number}. ${escape(f.caption)}</figcaption></figure>`;
}
const widths = (n) =>
  n === 2 ? [27, 73] : n === 3 ? [20, 43, 37] : n === 4 ? [19, 14, 45, 22] : Array(n).fill(100 / n);
function blockHTML(b) {
  switch (b.type) {
    case 'p':
      return `<p class="block">${escape(b.text)}</p>`;
    case 'heading':
      return `<h2 class="block">${escape(b.text)}</h2>`;
    case 'bullets':
      return `<ul class="block">${b.items.map((i) => `<li>${escape(i)}</li>`).join('')}</ul>`;
    case 'note':
      return `<aside class="block note"><strong>${escape(b.title)}</strong><p>${escape(b.text)}</p></aside>`;
    case 'table':
      return `<div class="block report-table" id="${b.id}"><div class="table-caption">Bảng ${b.number}. ${escape(b.caption)}</div><table><colgroup>${(b.widths || widths(b.headers.length)).map((w) => `<col style="width:${w}%">`).join('')}</colgroup><thead><tr>${b.headers.map((h) => `<th>${escape(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map((row) => `<tr>${row.map((c) => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'figure':
      return `<div class="block">${figureHTML(b)}</div>`;
    case 'pair':
      return `<div class="block figure-pair">${b.items.map(figureHTML).join('')}</div>`;
    case 'flow':
      return `<div class="block flow">${b.steps.map((s, i) => `${i ? '<span class="flow-arrow">→</span>' : ''}<div class="flow-box">${escape(s)}</div>`).join('')}</div>`;
    case 'palette':
      return `<div class="block palette">${b.items.map(([color, label]) => `<div><div class="swatch" style="background:${color}"></div><b>${escape(color)}</b><small>${escape(label)}</small></div>`).join('')}</div>`;
    default:
      throw Error('Unknown block ' + b.type);
  }
}
const footer = () =>
  `<footer class="page-footer"><span>RetailFlow · Thiết kế giao diện · v3</span><span class="page-number"></span></footer>`;
function pageHTML(page) {
  return `<section class="page" id="${page.id}" data-origin="${page.id}"><header class="page-header"><span>RETAILFLOW</span><span>${escape(page.chapter)}</span></header><div class="page-body"><p class="eyebrow">${escape(page.chapter)}</p><h1>${escape(page.title)}</h1><p class="lead">${escape(page.lead)}</p><div class="blocks">${page.blocks.map(blockHTML).join('')}</div></div>${footer()}</section>`;
}
function listingPage(id, title, items) {
  return `<section class="page" id="${id}" data-origin="${id}"><header class="page-header"><span>RETAILFLOW</span><span>DANH MỤC</span></header><div class="page-body"><h1>${escape(title)}</h1><p class="lead">Số trang tương ứng bản PDF đi kèm.</p><div class="blocks"><div class="block listing">${items.map((i) => `<a href="#${i.id}" data-target="${i.id}"><span>${escape(i.title)}</span><b>…</b></a>`).join('')}</div></div></div>${footer()}</section>`;
}
function listsHTML() {
  let html = '';
  for (const [prefix, title, items, chunk] of [
    ['toc', 'MỤC LỤC', pages.map((p) => ({ id: p.id, title: p.title })), 24],
    [
      'figures',
      'DANH MỤC HÌNH',
      figures.map((f) => ({ id: f.id, title: 'Hình ' + f.number + '. ' + f.title })),
      24,
    ],
    [
      'tables',
      'DANH MỤC BẢNG',
      tables.map((t) => ({ id: t.id, title: 'Bảng ' + t.number + '. ' + t.title })),
      24,
    ],
  ])
    for (let i = 0; i < items.length; i += chunk)
      html += listingPage(
        prefix + '-' + i,
        title + (i ? ' (tiếp theo)' : ''),
        items.slice(i, i + chunk),
      );
  return html;
}
function coverHTML() {
  return `<section class="page cover" id="cover"><p class="school">${escape(metadata.school)}<br>${escape(metadata.faculty)}</p><div class="rule"></div><p class="label">BÁO CÁO ĐỒ ÁN</p><h1>THIẾT KẾ GIAO DIỆN<br>HỆ THỐNG QUẢN LÝ<br>CỬA HÀNG BÁN LẺ</h1><p class="subtitle">RETAILFLOW</p><div class="meta">Môn học: ${escape(metadata.course)}<br>Giảng viên hướng dẫn: ${escape(metadata.teacher)}<br>Người thực hiện: ${escape(metadata.students)}</div><div class="version">Phiên bản báo cáo 3.0 · Ngày lập 19/11/2026<br>Mã nguồn khảo sát: ae5a928 · Dữ liệu minh họa</div><p class="date">${escape(metadata.date)}</p></section>`;
}
async function word() {
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    ImageRun,
    HeadingLevel,
    AlignmentType,
    WidthType,
    BorderStyle,
    Footer,
    Header,
    PageNumber,
    TableOfContents,
  } = docx;
  const paragraph = (text, options = {}) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 100, line: 330 },
      indent: { firstLine: 340 },
      ...options,
      children: [new TextRun({ text, font: 'Times New Roman', size: 26, ...options.run })],
    });
  const title = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 100, after: 150 },
      children: [
        new TextRun({ text, font: 'Times New Roman', size: 32, bold: true, color: '182D4B' }),
      ],
    });
  const small = (text, options = {}) =>
    paragraph(text, {
      indent: { firstLine: 0 },
      run: { size: 21 },
      spacing: { after: 75, line: 255 },
      ...options,
    });
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'AEB9C7' };
  function table(b) {
    const w = (b.widths || widths(b.headers.length)).map((n) => Math.round((9354 * n) / 100));
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: w,
      layout: docx.TableLayoutType.FIXED,
      rows: [b.headers, ...b.rows].map(
        (row, index) =>
          new TableRow({
            tableHeader: index === 0,
            cantSplit: true,
            children: row.map(
              (text, col) =>
                new TableCell({
                  width: { size: w[col], type: WidthType.DXA },
                  margins: { top: 70, bottom: 70, left: 90, right: 90 },
                  borders: { top: border, bottom: border, left: border, right: border },
                  shading: { fill: index === 0 ? 'E9EEF6' : index % 2 ? 'FFFFFF' : 'F7F9FC' },
                  children: [
                    small(String(text), {
                      run: { size: 21, bold: index === 0 },
                      spacing: { after: 0, line: 250 },
                    }),
                  ],
                }),
            ),
          }),
      ),
    });
  }
  async function figure(item, maxWidth = 605, maxHeight = 330) {
    const buffer = imageData(item.image),
      img = await loadImage(buffer),
      ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 60 },
        children: [
          new ImageRun({
            data: buffer,
            type: 'png',
            transformation: {
              width: Math.round(img.width * ratio),
              height: Math.round(img.height * ratio),
            },
            altText: { title: item.caption, description: item.caption, name: item.image },
          }),
        ],
      }),
      small(`Hình ${item.number}. ${item.caption}`, {
        alignment: AlignmentType.CENTER,
        run: { size: 20, italics: true },
      }),
    ];
  }
  const children = [];
  children.push(
    paragraph(metadata.school, {
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      run: { bold: true, size: 30 },
      spacing: { after: 120 },
    }),
    paragraph(metadata.faculty, {
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      run: { size: 28 },
      spacing: { after: 1000 },
    }),
    paragraph('BÁO CÁO ĐỒ ÁN', {
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      run: { size: 34, bold: true },
      spacing: { after: 300 },
    }),
    paragraph('THIẾT KẾ GIAO DIỆN HỆ THỐNG QUẢN LÝ CỬA HÀNG BÁN LẺ', {
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      run: { size: 44, bold: true, color: '182D4B' },
      spacing: { after: 250, line: 550 },
    }),
    paragraph('RETAILFLOW', {
      alignment: AlignmentType.CENTER,
      indent: { firstLine: 0 },
      run: { size: 34, bold: true },
      spacing: { after: 800 },
    }),
    paragraph('Môn học: ' + metadata.course),
    paragraph('Giảng viên hướng dẫn: ' + metadata.teacher),
    paragraph('Người thực hiện: ' + metadata.students),
    small('Phiên bản 3.0 · Ngày lập 19/11/2026 · Mã nguồn ae5a928', {
      alignment: AlignmentType.CENTER,
      spacing: { before: 650, after: 100 },
    }),
    paragraph(metadata.date, { alignment: AlignmentType.CENTER, indent: { firstLine: 0 } }),
  );
  children.push(
    new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.TITLE, text: 'MỤC LỤC' }),
    new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-2' }),
    small(
      'Mục lục Word là trường tự động. Khi Word yêu cầu, cập nhật trường; sau khi chỉnh sửa có thể chọn toàn bộ nội dung và nhấn F9. Số trang của bản Word có thể khác PDF.',
    ),
  );
  for (const [label, list] of [
    ['DANH MỤC HÌNH', figures.map((i) => `Hình ${i.number}. ${i.title}`)],
    ['DANH MỤC BẢNG', tables.map((i) => `Bảng ${i.number}. ${i.title}`)],
  ]) {
    children.push(
      new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.TITLE, text: label }),
    );
    list.forEach((text) => children.push(small(text)));
  }
  let previousChapter = '';
  for (const page of pages) {
    if (previousChapter !== page.chapter) {
      children.push(
        new Paragraph({
          pageBreakBefore: true,
          heading: HeadingLevel.HEADING_1,
          text: page.chapter,
          spacing: { after: 200 },
        }),
      );
      previousChapter = page.chapter;
    }
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        pageBreakBefore:
          page !== pages[0] &&
          pages.indexOf(page) > 0 &&
          pages[pages.indexOf(page) - 1].chapter === page.chapter,
        spacing: { before: 0, after: 100 },
        children: [
          new TextRun({
            text: page.title,
            font: 'Times New Roman',
            size: 30,
            bold: true,
            color: '182D4B',
          }),
        ],
      }),
      small(page.lead, { run: { size: 23, italics: true, color: '45576A' } }),
    );
    for (const block of page.blocks) {
      switch (block.type) {
        case 'p':
          children.push(paragraph(block.text));
          break;
        case 'heading':
          children.push(
            paragraph(block.text, {
              run: { bold: true, size: 26 },
              indent: { firstLine: 0 },
              keepNext: true,
            }),
          );
          break;
        case 'bullets':
          for (const item of block.items)
            children.push(
              paragraph('• ' + item, { indent: { left: 200, hanging: 150 }, run: { size: 24 } }),
            );
          break;
        case 'note':
          children.push(
            small(block.title, { run: { bold: true, size: 23 }, keepNext: true }),
            small(block.text, { run: { size: 23 }, shading: { fill: 'F0F3F8' } }),
          );
          break;
        case 'table':
          children.push(
            small(`Bảng ${block.number}. ${block.caption}`, {
              alignment: AlignmentType.CENTER,
              run: { italics: true, size: 20 },
              keepNext: true,
            }),
            table(block),
            small(''),
          );
          break;
        case 'figure':
          children.push(...(await figure(block)));
          break;
        case 'pair': {
          const cells = [];
          for (const item of block.items)
            cells.push(
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: await figure(item, 285, 330),
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
              }),
            );
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [new TableRow({ cantSplit: true, children: cells })],
            }),
          );
          break;
        }
        case 'flow':
          children.push(
            small(block.steps.join(' → '), {
              run: { size: 22, bold: true },
              shading: { fill: 'EEF2F8' },
            }),
          );
          break;
        case 'palette':
          children.push(table({ headers: ['Mã màu', 'Vai trò'], rows: block.items }));
          break;
      }
    }
  }
  const document = new Document({
    creator: 'Nhóm thực hiện đồ án RetailFlow',
    title: 'Báo cáo thiết kế giao diện hệ thống quản lý cửa hàng bán lẻ RetailFlow',
    subject: 'Đặc tả giao diện, nghiệp vụ, kiểm thử và đánh giá phiên bản 3',
    description:
      'Báo cáo theo hiện trạng ae5a928; thông tin học thuật chưa cung cấp được để thành trường điền.',
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 26 },
          paragraph: { spacing: { after: 100, line: 330 } },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Times New Roman', size: 32, bold: true, color: '182D4B' },
          paragraph: { keepNext: true },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: 'Times New Roman', size: 30, bold: true, color: '182D4B' },
          paragraph: { keepNext: true },
        },
      ],
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, bottom: 1134, left: 1417, right: 1134, header: 430, footer: 430 },
          },
        },
        headers: {
          default: new Header({
            children: [
              small('RETAILFLOW · BÁO CÁO THIẾT KẾ GIAO DIỆN · V3', {
                run: { size: 17, color: '586575' },
                spacing: { after: 0 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Trang ', size: 19, font: 'Times New Roman' }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 19,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  fs.writeFileSync(path.join(out, name + '.docx'), await Packer.toBuffer(document));
}
async function main() {
  fs.mkdirSync(out, { recursive: true });
  if (!fs.existsSync(metaFile)) fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
  fs.writeFileSync(
    path.join(out, 'noi-dung-bao-cao-v3.json'),
    JSON.stringify({ metadata, sourceCommit: 'ae5a928', pages, figures, tables }, null, 2),
  );
  const html =
    '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Báo cáo thiết kế giao diện RetailFlow v3</title><style>' +
    fs.readFileSync(path.join(__dirname, 'report.css'), 'utf8') +
    '</style></head><body>' +
    coverHTML() +
    pageHTML(pages[0]) +
    listsHTML() +
    pages.slice(1).map(pageHTML).join('') +
    '</body></html>';
  fs.writeFileSync(path.join(out, name + '.html'), html);
  await word();
  console.log(
    JSON.stringify({
      logicalSections: pages.length,
      figures: figures.length,
      tables: tables.length,
      embeddedImages: imageCache.size,
      html: name + '.html',
      word: name + '.docx',
      browserChecks: evidence.browser.checks.length,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
