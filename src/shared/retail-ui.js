const productImage = (p, cls = '') =>
  `<span class="retail-photo ${cls}"><img src="${e(p.image || 'assets/product-placeholder.svg')}" alt="${e(p.name)}" loading="lazy" decoding="async"></span>`;
const expiryText = (value) => (value ? value.split('-').reverse().join('/') : 'Chưa xác minh');
const workflowStatus = (value, kind = 'purchase') => {
  const labels = {
    draft: ['Nháp', 'gray'],
    submitted: ['Chờ admin duyệt', 'yellow'],
    approved: [kind === 'audit' ? 'Đã điều chỉnh' : 'Đã duyệt yêu cầu', 'green'],
    rejected: ['Bị từ chối', 'red'],
    receipt_pending: ['Chờ duyệt thực nhận', 'yellow'],
    partially_received: ['Nhận thiếu, chờ bổ sung', 'yellow'],
    received: ['Đã nhận đủ', 'green'],
    closed_short: ['Đã chốt thiếu', 'gray'],
    cancelled: ['Đã hủy', 'gray'],
    counting: ['Đang kiểm đếm', 'yellow'],
    legacy_approved: ['Đã xử lý (cũ)', 'gray'],
  };
  return badge(...(labels[value] || [value, 'gray']));
};
const lotBadge = (lot) => {
  const state = store.lotStatus(lot),
    labels = {
      good: ['Còn hạn', 'green'],
      near: ['Cận date', 'yellow'],
      expired: ['Hết hạn · cấm bán', 'red'],
      unknown: ['Chưa rõ HSD · cấm bán', 'gray'],
    };
  return badge(...labels[state]);
};
const safeQuote = () => {
  try {
    return { ...store.quoteDraft(), error: '' };
  } catch (error) {
    const subtotal = store.data.draft.items.reduce((a, i) => a + i.qty * i.price, 0);
    return { subtotal, discount: 0, tax: 0, total: subtotal, error: error.message };
  }
};
document.addEventListener(
  'error',
  (event) => {
    if (event.target.tagName === 'IMG' && !event.target.src.endsWith('product-placeholder.svg'))
      event.target.src = 'assets/product-placeholder.svg';
  },
  true,
);
