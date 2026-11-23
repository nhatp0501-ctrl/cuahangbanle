const test = require('node:test'),
  assert = require('node:assert/strict');
const { fixture, draft, voucher, addDays, clone, KEY } = require('./fixtures.cjs');
const { Store, validateBackup } = require('../store');
const programme = (s, p, other = {}) =>
  s.upsertDiscount('promotion', {
    name: 'Mua 2 giảm 5k',
    type: 'quantity',
    buyQty: 2,
    value: 5000,
    minSpend: 0,
    maxDiscount: 0,
    startsOn: addDays(-1),
    endsOn: addDays(10),
    active: true,
    productIds: [p.id],
    lotIds: [],
    ...other,
  });
test('minimum monetary discount and cap are 1000; percent under 1000 cannot apply', () => {
  const { s, p } = fixture();
  assert.throws(() => voucher(s, { type: 'fixed', value: 999 }), /1.000/);
  assert.throws(() => voucher(s, { maxDiscount: 999 }), /1.000/);
  const v = voucher(s, { type: 'percent', value: 1 });
  draft(s, p, 1, { kind: 'voucher', id: v.id });
  assert.throws(() => s.quoteDraft(), /1.000/);
  programme(s, p, { value: 1000 });
  assert.throws(() => programme(s, p, { value: 999 }), /1.000/);
});
test('quantity promotion repeats per same-SKU group, excludes incomplete SKU, and stacks automatically', () => {
  const { s, p } = fixture(),
    other = s.data.products.find((x) => x.active && x.id !== p.id && s.saleableStock(x.id) > 5);
  s.data.promotions.forEach((r) => (r.active = false));
  const rule = programme(s, p, { productIds: [p.id, other.id] });
  const d = draft(s, p, 5, { kind: 'auto', id: '' });
  d.items.push({ id: other.id, name: other.name, price: other.price, qty: 1 });
  s.saveDraft(d);
  let q = s.quoteDraft();
  assert.equal(q.discount, 10000);
  assert.equal(q.discountRule.id, rule.id);
  assert.equal(q.items[1].lineDiscount, 0);
  assert.equal(
    q.items.reduce((s, i) => s + i.paidTotal, 0),
    q.total,
  );
  programme(s, p, { name: 'Giảm 12k', type: 'fixed', value: 12000 });
  assert.equal(s.quoteDraft().discount, 22000);
  draft(s, p, 1, { kind: 'promotion', id: rule.id });
  assert.throws(() => s.quoteDraft(), /mua đủ/);
});
test('quantity promotion only counts allocated eligible unexpired lots; cannot mix SKU to complete group', () => {
  const { s, p } = fixture();
  s.data.lots.filter((l) => l.productId === p.id).forEach((l) => (l.expiryDate = addDays(100)));
  const lot = s.addLot(p.id, { qty: 3, code: 'KM-NEAR', expiryDate: addDays(2) });
  const rule = programme(s, p, { lotIds: [lot.id] });
  draft(s, p, 5, { kind: 'promotion', id: rule.id });
  assert.equal(s.quoteDraft().discount, 5000);
  assert.throws(
    () =>
      programme(s, p, {
        lotIds: [s.data.lots.find((l) => l.productId === p.id && l.id !== lot.id).id],
      }),
    /cận date/,
  );
});
test('supplier catalogues are distinct and cannot be cross-ordered', () => {
  const { s, p } = fixture(),
    suppliers = s.data.suppliers.filter((x) =>
      s.data.products.some((p) => p.active && p.supplierId === x.id),
    );
  assert.ok(suppliers.length >= 15);
  const other = s.data.products.find((x) => x.active && x.supplierId !== p.supplierId);
  assert.throws(
    () => s.createPurchase(p.supplierId, [{ id: other.id, qty: 1, price: other.cost }], 'Sai NCC'),
    /không thuộc/,
  );
  assert.equal(new Set(s.data.products.filter((p) => p.active).map((p) => p.id)).size, 186);
});
test('a surplus opens a discrepancy, requires invoice review and recount, never creates sales revenue', () => {
  const { s, p } = fixture();
  draft(s, p, 1);
  const sale = s.checkout({ payment: 'cash', received: 9999999 });
  const before = s.monthEndSummary(),
    audit = s.startAudit([p.id], 'Đếm kệ');
  const lines = audit.items.map((i, n) => ({
    lotId: i.lotId,
    countedQty: i.bookQty + (n ? 0 : 1),
    damagedQty: 0,
    reason: 'Dư do vị trí kệ',
  }));
  s.saveAuditCount(audit.id, lines);
  assert.equal(s.data.audits[0].items[0].discrepancyStatus, 'needs_review');
  assert.throws(() => s.saveAuditCount(audit.id, lines, true), /đối chiếu/);
  assert.ok(s.auditInvoices(audit.id, p.id).some((o) => o.id === sale.id && o.qty === 1));
  s.reviewAuditInvoices(audit.id, p.id, 'Khớp hóa đơn, kiểm tra phiếu nhập');
  s.recountAuditLot(
    audit.id,
    audit.items[0].lotId,
    lines[0].countedQty,
    0,
    'Đếm lại hai người: dư 1, chứng từ đã xác minh',
  );
  s.saveAuditCount(audit.id, lines, true);
  s.resolveAudit(audit.id, 'approve', 'Đã xác minh lô, tăng tồn 1');
  assert.equal(s.monthEndSummary().gross, before.gross);
  assert.equal(s.monthEndSummary().loss, 0);
  assert.equal(validateBackup(s.data).schema, 3);
});
test('month end loss applies only once on approval, source invoices stay unchanged and reload is balanced', () => {
  const { s, p, storage } = fixture();
  draft(s, p, 1);
  const order = s.checkout({ payment: 'cash', received: 999999 });
  const original = clone(order),
    before = s.monthEndSummary();
  const a = s.startAudit([p.id], 'Chốt tháng'),
    lines = a.items.map((i, n) => ({
      lotId: i.lotId,
      countedQty: i.bookQty - (n ? 0 : 2),
      damagedQty: 0,
      reason: 'Thiếu 2',
    }));
  s.saveAuditCount(a.id, lines);
  assert.equal(s.monthEndSummary().loss, 0);
  s.reviewAuditInvoices(a.id, p.id, 'Không có hóa đơn bỏ sót');
  s.recountAuditLot(a.id, a.items[0].lotId, lines[0].countedQty, 0, 'Đếm lại thiếu 2');
  s.saveAuditCount(a.id, lines, true);
  assert.equal(s.monthEndSummary().loss, 0);
  s.resolveAudit(a.id, 'approve', 'Chốt thiếu 2');
  const m = s.monthEndSummary();
  assert.equal(m.afterLoss, before.gross - 2 * p.price);
  assert.equal(m.losses[0].qty, 2);
  assert.deepEqual(
    s.data.orders.find((o) => o.id === order.id),
    original,
  );
  const restored = new Store(storage);
  assert.equal(restored.loadError, '');
  assert.equal(restored.monthEndSummary().loss, m.loss);
});
test('v2 upgrade preserves historical supplier vouchers and creates a pre-v3 backup', () => {
  const { s, p, storage, records } = fixture();
  const v = voucher(s, { source: 'partner', partnerSupplierId: p.supplierId });
  const data = clone(s.data);
  data.schema = 2;
  records.set(KEY, JSON.stringify(data));
  const upgraded = new Store(storage);
  assert.equal(upgraded.loadError, '');
  assert.ok(records.has(KEY + '.before-v3'));
  assert.equal(upgraded.data.products.find((x) => x.id === p.id).supplierId, v.partnerSupplierId);
});
