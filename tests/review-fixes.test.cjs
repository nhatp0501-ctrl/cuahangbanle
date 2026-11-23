const test = require('node:test'),
  assert = require('node:assert/strict');
const { fixture, draft, clone, addDays, KEY, voucher } = require('./fixtures.cjs');
const { Store, validateBackup } = require('../store');
test('discount allocation stays integer and never exceeds an eligible line at high discount rates', () => {
  const { allocateInteger } = require('../store');
  const weights = [...Array(99).fill(1001), 1000],
    discount = Math.floor(weights.reduce((s, n) => s + n, 0) * 0.99);
  const allocated = allocateInteger(discount, weights);
  assert.equal(
    allocated.reduce((s, n) => s + n, 0),
    discount,
  );
  assert.ok(allocated.every((n, i) => Number.isSafeInteger(n) && n >= 0 && n <= weights[i]));
});
function promo(s, products, values = {}) {
  return s.upsertDiscount('promotion', {
    name: 'Ưu đãi thử',
    type: 'fixed',
    value: 3000,
    minSpend: 0,
    maxDiscount: 0,
    startsOn: addDays(-1),
    endsOn: addDays(10),
    active: true,
    productIds: products.map((p) => p.id),
    lotIds: [],
    ...values,
  });
}
function pair() {
  const f = fixture();
  f.s.data.promotions.forEach((p) => (p.active = false));
  f.other = f.s.data.products.find(
    (p) => p.active && p.id !== f.p.id && p.price >= 10000 && f.s.saleableStock(p.id) >= 10,
  );
  return f;
}
function basket(s, p, other, selection = { kind: 'auto', id: '' }) {
  const d = draft(s, p, 2, selection);
  d.items.push({ id: other.id, name: other.name, price: other.price, qty: 2 });
  s.saveDraft(d);
}
test('different products receive multiple programmes with exact tax, invoice snapshots and reload', () => {
  const { s, p, other, storage } = pair();
  s.saveSettings({ ...s.data.settings, taxRate: 8 });
  const a = promo(s, [p], { name: 'Mua 2 giảm 5k', type: 'quantity', buyQty: 2, value: 5000 }),
    b = promo(s, [other], { name: 'Hàng B giảm 20%', type: 'percent', value: 20 });
  basket(s, p, other);
  const q = s.quoteDraft(),
    expected = 5000 + Math.floor(other.price * 2 * 0.2);
  assert.equal(q.discount, expected);
  assert.equal(q.appliedPromotions.length, 2);
  assert.equal(q.items[0].lineDiscount, 5000);
  assert.equal(q.items[1].lineDiscount, Math.floor(other.price * 2 * 0.2));
  assert.equal(
    q.items.reduce((v, i) => v + i.paidTotal, 0),
    q.total,
  );
  const o = s.checkout({ payment: 'cash', received: 99999999 });
  assert.equal(o.discount, expected);
  assert.deepEqual(o.appliedPromotions.map((r) => r.id).sort(), [a.id, b.id].sort());
  const reloaded = new Store(storage);
  assert.equal(reloaded.loadError, '');
  assert.equal(reloaded.data.orders[0].appliedPromotions.length, 2);
  validateBackup(reloaded.data);
});
test('overlapping programmes stack on the same SKU while keeping other products offers', () => {
  const { s, p, other } = pair();
  promo(s, [p], { value: 2000 });
  const second = promo(s, [p], { value: 7000 });
  promo(s, [other], { value: 3000 });
  basket(s, p, other);
  const q = s.quoteDraft();
  assert.equal(q.discount, 12000);
  assert.equal(q.appliedPromotions.length, 3);
  assert.equal(q.items[0].lineDiscount, 9000);
  assert.equal(q.items[0].appliedPromotions.length, 2);
  assert.ok(q.items[0].appliedPromotions.some((rule) => rule.id === second.id));
});
test('shared caps apply once per programme when stacking across products', () => {
  const { s, p, other } = pair();
  const broad = promo(s, [p, other], {
    type: 'percent',
    value: 20,
    maxDiscount: 5000,
    minSpend: 0,
  });
  basket(s, p, other);
  assert.equal(s.quoteDraft().discount, 5000);
  const q = s.quoteDraft();
  assert.equal(q.appliedPromotions[0].id, broad.id);
  assert.equal(
    q.items.reduce((n, i) => n + i.lineDiscount, 0),
    5000,
  );
  promo(s, [p], { value: 8000 });
  promo(s, [other], { value: 4000 });
  assert.equal(
    s.quoteDraft().discount,
    8000 + 4000 + 5000,
  );
});
test('manual selection accepts multiple programme IDs and ignores programmes outside selection', () => {
  const { s, p, other } = pair();
  const a = promo(s, [p], { value: 4000 }),
    b = promo(s, [other], { value: 3000 });
  promo(s, [p], { value: 9000 });
  basket(s, p, other, { kind: 'promotions', ids: [a.id, b.id] });
  assert.equal(s.quoteDraft().discount, 7000);
});
test('voucher stacks with overlapping promotions and preserves tax, usage and invoice snapshots', () => {
  const { s, p, other, storage } = pair();
  s.saveSettings({ ...s.data.settings, taxRate: 8 });
  promo(s, [p], { value: 4000 });
  promo(s, [p], { type: 'quantity', buyQty: 2, value: 3000 });
  const v = voucher(s, { code: 'STACK', type: 'fixed', value: 2000 });
  basket(s, p, other, { kind: 'voucher', id: v.id });
  const q = s.quoteDraft();
  assert.equal(q.discount, 9000);
  assert.equal(q.appliedPromotions.length, 3);
  assert.equal(q.items[0].appliedPromotions.length, 3);
  assert.equal(q.tax, Math.round((q.subtotal - 9000) * 0.08));
  assert.equal(q.items.reduce((sum, i) => sum + i.paidTotal, 0), q.total);
  const key = s.data.draft.checkoutKey;
  const order = s.checkout({ payment: 'cash', received: 99999999, checkoutKey: key });
  assert.equal(v.used, 1);
  s.checkout({ payment: 'cash', received: 99999999, checkoutKey: key });
  assert.equal(v.used, 1);
  assert.deepEqual(order.appliedPromotions, q.appliedPromotions);
  const reloaded = new Store(storage);
  assert.deepEqual(reloaded.data.orders[0].items[0].appliedPromotions, q.items[0].appliedPromotions);
  validateBackup(reloaded.data);
  const withoutVoucher = s.quoteDraft({ ...clone(order), discountSelection: { kind: 'auto', id: '' } });
  assert.equal(withoutVoucher.discount, 7000);
});
test('stacked partner voucher stays within its product scope while other products keep promotions', () => {
  const { s, p, other } = pair();
  promo(s, [p], { value: 3000 });
  promo(s, [other], { value: 4000 });
  const v = voucher(s, {
    code: 'PARTNERSTACK',
    source: 'partner',
    partnerSupplierId: p.supplierId,
    productIds: [p.id],
  });
  basket(s, p, other, { kind: 'voucher', id: v.id });
  const q = s.quoteDraft();
  assert.equal(q.discount, 7000 + Math.floor(p.price * 2 * 0.1));
  assert.equal(q.items[1].lineDiscount, 4000);
  assert.deepEqual(q.appliedPromotions.find((rule) => rule.id === v.id).productIds, [p.id]);
});
test('stacked discounts cap each line and reconcile every programme without leaking to other products', () => {
  const { s, p, other } = pair();
  s.saveSettings({ ...s.data.settings, taxRate: 8 });
  promo(s, [p], { type: 'percent', value: 100 });
  promo(s, [p], { value: 999999 });
  promo(s, [other], { value: 3000 });
  const v = voucher(s, {
    code: 'CAPPEDSTACK',
    source: 'partner',
    partnerSupplierId: p.supplierId,
    productIds: [p.id],
    value: 100,
  });
  basket(s, p, other, { kind: 'voucher', id: v.id });
  const q = s.quoteDraft();
  assert.equal(q.discount, p.price * 2 + 3000);
  assert.equal(q.items[0].paidTotal, 0);
  assert.equal(q.items[1].lineDiscount, 3000);
  assert.equal(q.appliedPromotions.reduce((sum, r) => sum + r.discount, 0), q.discount);
  for (const item of q.items) {
    assert.ok(Number.isSafeInteger(item.lineDiscount) && item.lineDiscount <= item.qty * item.price);
    assert.ok(item.lineTax >= 0 && item.paidTotal >= 0);
    assert.equal(item.appliedPromotions.reduce((sum, r) => sum + r.discount, 0), item.lineDiscount);
  }
  assert.equal(q.items.reduce((sum, i) => sum + i.paidTotal, 0), q.total);
  s.data.promotions.reverse();
  assert.equal(s.quoteDraft().discount, q.discount);
});
test('fully discounted carts have zero tax and never produce negative totals', () => {
  const { s, p } = pair();
  promo(s, [p], { type: 'percent', value: 100 });
  promo(s, [p], { type: 'percent', value: 100 });
  draft(s, p, 2, { kind: 'auto', id: '' });
  const q = s.quoteDraft();
  assert.equal(q.discount, q.subtotal);
  assert.equal(q.tax, 0);
  assert.equal(q.total, 0);
});
test('stacking ignores ineligible programmes while still rejecting invalid vouchers', () => {
  const { s, p } = pair();
  const valid = promo(s, [p], { value: 3000 });
  promo(s, [p], { active: false });
  promo(s, [p], { startsOn: addDays(1) });
  promo(s, [p], { endsOn: addDays(-1) });
  promo(s, [p], { minSpend: p.price * 3 });
  promo(s, [p], { type: 'quantity', buyQty: 3 });
  draft(s, p, 2, { kind: 'auto', id: '' });
  assert.equal(s.quoteDraft().discount, 3000);
  assert.deepEqual(s.quoteDraft().appliedPromotions.map((r) => r.id), [valid.id]);
  const v = voucher(s, { code: 'EXPIREDSTACK', endsOn: addDays(-1) });
  draft(s, p, 2, { kind: 'voucher', id: v.id });
  assert.throws(() => s.quoteDraft(), /hết hạn/);
});
test('a shared minimum-spend offer still combines with a third unrelated product promotion', () => {
  const { s, p, other } = pair();
  const third = s.data.products.find(
    (x) =>
      x.active &&
      x.id !== p.id &&
      x.id !== other.id &&
      x.price >= 10000 &&
      s.saleableStock(x.id) >= 2,
  );
  promo(s, [p, other], {
    name: 'Giảm chung A B',
    value: 15000,
    minSpend: 2 * (p.price + other.price),
  });
  promo(s, [p], { value: 14000 });
  promo(s, [third], { value: 3000 });
  basket(s, p, other);
  const d = clone(s.data.draft);
  d.items.push({ id: third.id, name: third.name, price: third.price, qty: 2 });
  s.saveDraft(d);
  const q = s.quoteDraft();
  assert.equal(q.discount, 32000);
  assert.equal(q.appliedPromotions.length, 3);
});
test('invoice reconciliation excludes every unrelated invoice and confirms without a note', () => {
  const { s, p, other } = pair();
  s.data.orders = [];
  draft(s, p, 2);
  const a = s.checkout({ payment: 'cash', received: 99999999 });
  draft(s, other, 1);
  const unrelated = s.checkout({ payment: 'cash', received: 99999999 });
  basket(s, p, other);
  const mixed = s.checkout({ payment: 'cash', received: 99999999 });
  const audit = s.startAudit([p.id], 'Kiểm tra đúng mã');
  const invoices = s.auditInvoices(audit.id, p.id);
  assert.deepEqual(invoices.map((o) => o.id).sort(), [a.id, mixed.id].sort());
  assert.ok(!invoices.some((o) => o.id === unrelated.id));
  assert.ok(invoices.every((o) => o.productId === p.id && o.qty === 2 && o.amount > 0));
  s.reviewAuditInvoices(audit.id, p.id, '');
  assert.ok(s.data.audits[0].items.every((i) => i.invoiceReview.note.includes(p.id)));
  assert.deepEqual(
    s.data.audits[0].items[0].invoiceReview.invoiceIds.sort(),
    [a.id, mixed.id].sort(),
  );
});
test('old mismatched supplier mappings are repaired even when an old partner voucher exists', () => {
  const { s, storage, records } = fixture();
  const oreo = s.data.products.find((p) => p.active && /oreo/i.test(p.name));
  oreo.supplierId = 'NCC002';
  voucher(s, {
    code: 'OLDACE',
    source: 'partner',
    partnerSupplierId: 'NCC002',
    productIds: [oreo.id],
  });
  const old = clone(s.data);
  delete old.supplierRepairVersion;
  old.draft.discountSelection = { kind: 'none', id: '' };
  records.set(KEY, JSON.stringify(old));
  const upgraded = new Store(storage);
  assert.equal(upgraded.loadError, '');
  assert.notEqual(upgraded.data.products.find((p) => p.id === oreo.id).supplierId, 'NCC002');
  assert.equal(upgraded.data.vouchers.find((v) => v.code === 'OLDACE').active, false);
  assert.equal(upgraded.data.draft.discountSelection.kind, 'auto');
  for (const p of upgraded.data.products.filter((p) => p.active))
    assert.ok(upgraded.supplierAcceptsProduct(p.supplierId, p), p.name);
  assert.ok(
    upgraded.data.products
      .filter((p) => p.active && p.supplierId === 'NCC001')
      .every((p) => /vinamilk/i.test(p.name)),
  );
  assert.ok(
    upgraded.data.products
      .filter((p) => p.active && p.supplierId === 'NCC002')
      .every((p) => /hảo hảo|đệ nhất/i.test(p.name)),
  );
});
test('catalogue edits and purchase requests cannot put unrelated brands under Vinamilk', () => {
  const { s, p } = fixture();
  assert.throws(
    () => s.upsert('products', { ...clone(p), supplierId: 'NCC001', name: 'Bánh Oreo thử' }),
    /thương hiệu/,
  );
  const oreo = s.data.products.find((p) => p.active && /oreo/i.test(p.name));
  oreo.supplierId = 'NCC001';
  assert.throws(
    () =>
      s.createPurchase('NCC001', [{ id: oreo.id, qty: 1, price: oreo.cost }], 'Sai thương hiệu'),
    /thương hiệu/,
  );
});
