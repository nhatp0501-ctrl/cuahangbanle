/* Shared browser state and HTML helpers. Loaded before feature scripts. */
'use strict';
const { Store, totals, METHODS, ROLES, ACCESS, clone } = Retail;
const store = new Store(localStorage);
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHTML = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const e = escapeHTML;
const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' ₫';
const number = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);
const date = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
const dayKey = (value) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
const match = (value, query) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .includes(
      String(query)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .toLowerCase(),
    );
const icons = {
  layers: 'M12 3 3 8l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  cart: 'm2 3 2 1 3 12h12l3-10H5M9 21h.01M18 21h.01',
  box: 'm12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5M12 12 3 7m9 5v10M7 5l10 5',
  receipt: 'M5 3h14v19l-3-2-4 2-4-2-3 2V3Zm3 5h8M8 12h8M8 16h4',
  warehouse: 'm3 9 9-6 9 6v12H3V9Zm4 12V11h10v10M7 15h10M7 18h10',
  truck:
    'M1 5h13v12H1zM14 9h5l4 5v3h-9M5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M17 4a4 4 0 0 1 0 8m6 9v-2a4 4 0 0 0-3-3.9M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 7A5 5 0 1 1 7 7a5 5 0 0 1 10 0Z',
  return: 'm9 14-5-5 5-5M4 9h10a6 6 0 0 1 0 12h-2',
  chart: 'M3 3v18h18M7 15l4-5 4 3 6-8',
  branch: 'M4 4h6v6H4zM14 14h6v6h-6zM4 14h6v6H4zM7 10v4m3-7h7v7',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 2h6l1 3 3 1 3 3v6l-3 1-1 3-3 3H9l-1-3-3-1-3-3V9l3-1 1-3 3-3Z',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  logout: 'M9 3H3v18h6m6-14 5 5-5 5m-8-5h13',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  edit: 'm16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  check: 'm4 12 5 5L20 6',
  cash: 'M2 5h20v14H2zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 8h1m12 8h1',
  card: 'M2 5h20v14H2zM2 9h20M6 15h4',
  transfer: 'M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5',
  print: 'M6 9V2h12v7M6 17H2V9h20v8h-4M6 14h12v8H6zM18 11h.01',
  save: 'M4 3h14l3 3v15H3V3h1ZM7 3v6h10V3M7 21v-8h10v8',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 10 3 3 5-6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  trash: 'M3 6h18M6 6l1 15h10l1-15M9 6V3h6v3m-5 4v7m4-7v7',
  scan: 'M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M7 7v10m4-10v10m3-10v10m3-10v10',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6m0-10h.01',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.box}"/></svg>`;
const logo = () =>
  `<div class="logo"><div class="logo-mark">${icon('layers')}</div><div><strong>RetailFlow</strong><small>RETAIL MANAGEMENT</small></div></div>`;
const action = (name, label, ico = '', kind = '', attrs = '') =>
  `<button type="button" class="btn ${kind}" data-action="${name}" ${attrs}>${ico ? icon(ico) : ''}${label}</button>`;
const ib = (name, ico, label, attrs = '') =>
  `<button type="button" class="icon-btn" data-action="${name}" title="${e(label)}" aria-label="${e(label)}" ${attrs}>${icon(ico)}</button>`;
const empty = (
  label = 'Chưa có dữ liệu',
  desc = 'Các thông tin mới sẽ xuất hiện tại đây.',
  ico = 'box',
) => `<div class="empty">${icon(ico)}<strong>${label}</strong><div class="sub">${desc}</div></div>`;
const badge = (label, color = 'green') =>
  `<span class="badge ${color}"><i class="dot"></i>${label}</span>`;
const statusLabels = {
  completed: ['Đã thanh toán', 'green'],
  partial: ['Đã trả một phần', 'yellow'],
  refunded: ['Đã hoàn trả', 'red'],
  cancelled: ['Đã hủy', 'gray'],
  pending: ['Chờ xác nhận', 'yellow'],
  approved: ['Đã hoàn tiền', 'green'],
  rejected: ['Đã từ chối', 'red'],
  draft: ['Bản nháp', 'gray'],
  received: ['Đã nhập kho', 'green'],
  active: ['Đang hoạt động', 'green'],
};
const status = (value) => badge(...(statusLabels[value] || [e(value), 'gray']));
const stats = (values) =>
  `<div class="stats">${values.map(([label, value, desc, ico]) => `<div class="panel stat"><div class="stat-icon">${icon(ico || 'receipt')}</div><div class="stat-label muted">${label}</div><div class="money" style="font-size:inherit"><h2 class="stat-value" style="margin-top:19px;font-weight:750">${value}</h2></div><p class="sub">${desc}</p></div>`).join('')}</div>`;
const table = (headers, rows, cls = '') =>
  `<div class="table-wrap ${cls}"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>${rows.length ? '' : empty('Không có kết quả', 'Thử đổi bộ lọc hoặc thêm dữ liệu mới.', 'search')}</div>`;
const field = (label, name, value = '', type = 'text', attrs = '', full = false) =>
  `<label class="field ${full ? 'full' : ''}"><span>${label}</span><input name="${name}" type="${type}" value="${e(value)}" ${attrs}></label>`;
const selectField = (label, name, options, value = '', attrs = '', full = false) =>
  `<label class="field ${full ? 'full' : ''}"><span>${label}</span><select name="${name}" ${attrs}>${options.map(([v, t]) => `<option value="${e(v)}" ${v === value ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></label>`;
const textField = (label, name, value = '', full = true) =>
  `<label class="field ${full ? 'full' : ''}"><span>${label}</span><textarea name="${name}">${e(value)}</textarea></label>`;
const formError = () => '<div class="error-text full" id="form-error" role="alert"></div>';
const foot = (submit = 'Lưu thông tin', cls = 'primary') =>
  `<div class="modal-footer">${action('close-modal', 'Đóng')}<button class="btn ${cls}" type="submit">${icon('check')}${submit}</button></div>`;
const pages = [
  ['dashboard', 'Tổng quan', 'grid', 'TỔNG QUAN'],
  ['pos', 'Bán hàng POS', 'cart'],
  ['products', 'Sản phẩm', 'box'],
  ['orders', 'Đơn hàng', 'receipt'],
  ['inventory', 'Kho & kiểm kê', 'warehouse', 'QUẢN LÝ NGHIỆP VỤ'],
  ['purchases', 'Nhập hàng', 'truck'],
  ['suppliers', 'Nhà cung cấp', 'branch'],
  ['customers', 'Khách hàng', 'users'],
  ['staff', 'Nhân viên & tài khoản', 'user'],
  ['returns', 'Đổi trả & hoàn tiền', 'return'],
  ['reports', 'Báo cáo doanh thu', 'chart', 'QUẢN TRỊ'],
  ['promotions', 'Voucher & khuyến mãi', 'receipt'],
  ['branches', 'Chi nhánh', 'branch'],
  ['settings', 'Cấu hình hệ thống', 'settings'],
];
let page = 'dashboard',
  filters = {},
  pagination = {},
  modalContext = {},
  chartDays = 7,
  reportDays = 7,
  activeCategory = 'Tất cả',
  inventoryTab = 'stock';
let purchaseLines = [];
