(function (scope) {
  'use strict';
  const KEY = 'retailflow.v1';
  const ROLES = { ADMIN: 'Quản trị viên', CASHIER: 'Thu ngân', WAREHOUSE: 'Nhân viên kho' };
  const METHODS = { cash: 'Tiền mặt', transfer: 'Chuyển khoản', card: 'Thẻ ngân hàng' };
  const ACCESS = {
    ADMIN: [
      'dashboard',
      'pos',
      'products',
      'orders',
      'inventory',
      'purchases',
      'suppliers',
      'customers',
      'staff',
      'returns',
      'reports',
      'branches',
      'settings',
      'promotions',
    ],
    CASHIER: ['pos', 'orders', 'customers', 'returns'],
    WAREHOUSE: ['products', 'inventory', 'purchases', 'suppliers'],
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const id = (prefix) =>
    `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const integer = (n, label, min = 0, max = 1000000000000) => {
    n = Number(n);
    assert(
      Number.isSafeInteger(n) && n >= min && n <= max,
      `${label} phải là số nguyên từ ${min.toLocaleString('vi-VN')} đến ${max.toLocaleString('vi-VN')}.`,
    );
    return n;
  };

  const today = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  const addDays = (days, value = today()) => {
    const d = new Date(value + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const validDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
    !isNaN(Date.parse(value + 'T12:00:00Z')) &&
    new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
  const api = {
    KEY,
    ROLES,
    METHODS,
    ACCESS,
    clone,
    now,
    id,
    assert,
    integer,
    today,
    addDays,
    validDate,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(scope.Retail || (scope.Retail = {}), api);
})(globalThis);
