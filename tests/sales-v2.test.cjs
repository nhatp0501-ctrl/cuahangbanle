const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const { fixture, draft, voucher, clone, KEY, addDays } = require('./fixtures.cjs');
const { Store, seed, validateBackup } = require('../store');
test('catalogue has >=180 real local pack shots, and lot balances match physical stock', () => {
  const { s } = fixture();
  const active = s.data.products.filter((p) => p.active);
  assert.ok(active.length >= 180);
  for (const p of active) {
    assert.ok(p.image.startsWith('assets/products/'));
    assert.ok(fs.existsSync(path.join(__dirname, '..', p.image)));
    assert.equal(
      p.stock,
      s.data.lots.filter((l) => l.productId === p.id).reduce((a, l) => a + l.qty, 0),
    );
  }
  assert.equal(validateBackup(s.data).schema, 3);
});
test('v1 migration preserves invoices, original quantities and a backup without inventing legacy HSD', () => {
  const old = seed(),
    raw = JSON.stringify(old),
    map = new Map([[KEY, raw]]);
  const storage = { getItem: (k) => map.get(k) || null, setItem: (k, v) => map.set(k, v) };
  const s = new Store(storage);
  assert.equal(s.loadError, '');
  assert.equal(s.data.orders.length, old.orders.length);
  assert.equal(s.data.products.find((p) => p.id === 'SP001').stock, old.products[0].stock);
  assert.equal(map.get(KEY + '.before-v2'), raw);
  assert.equal(s.saleableStock('SP001'), 0);
  assert.ok(s.data.lots.some((l) => l.productId === 'SP001' && l.needsExpiry));
});
test('cash must pay the whole invoice once; duplicate checkout key cannot deduct stock twice', () => {
  const { s, p } = fixture();
  draft(s, p);
  const before = p.stock,
    key = s.data.draft.checkoutKey,
    total = s.quoteDraft().total;
  assert.throws(() => s.checkout({ payment: 'cash', received: 1 }), /đủ/);
  assert.throws(() => s.checkout({ payment: 'cash', received: total, amount: 1 }), /một phần/);
  assert.throws(() => s.checkout({ payment: 'cash', received: total, payments: [] }), /chia/);
  const o = s.checkout({ payment: 'cash', received: total + 5000, checkoutKey: key });
  assert.equal(o.change, 5000);
  assert.equal(o.paymentCount, 1);
  assert.equal(p.stock, before - 2);
  const again = s.checkout({ payment: 'cash', received: total, checkoutKey: key });
  assert.equal(again.id, o.id);
  assert.equal(p.stock, before - 2);
});
for (const payment of ['transfer', 'card'])
  test(`${payment} requires full receipt confirmation and generates HD reference`, () => {
    const { s, p } = fixture();
    draft(s, p);
    assert.throws(() => s.checkout({ payment, paymentRef: 'X' }), /xác nhận/);
    const total = s.quoteDraft().total,
      o = s.checkout({ payment, confirmed: true, paymentRef: 'REF' });
    assert.equal(o.payment, payment);
    assert.equal(o.received, total);
    assert.equal(o.paymentStatus, 'paid');
    assert.match(o.paymentRef, /^HD\d{5}$/);
    assert.notEqual(o.paymentRef, 'REF');
  });
test('FEFO sells the earliest valid lot and refuses expired, undated and quarantined units', () => {
  const { s, p } = fixture();
  const lots = s.data.lots.filter((l) => l.productId === p.id);
  lots.forEach((l) => {
    l.expiryDate = addDays(180);
  });
  s.addLot(p.id, { qty: 3, code: 'NEAR', expiryDate: addDays(2), sourceId: 'TEST' });
  s.addLot(p.id, { qty: 5, code: 'EXPIRED', expiryDate: addDays(-1), sourceId: 'TEST' });
  s.addLot(p.id, { qty: 4, blockedQty: 4, code: 'BAD', expiryDate: addDays(30), sourceId: 'TEST' });
  draft(s, p, 2);
  assert.equal(s.quoteDraft().items[0].lotAllocations[0].lotCode, 'NEAR');
  const available = s.saleableStock(p.id);
  assert.throws(() => {
    draft(s, p, available + 1);
    s.checkout({ payment: 'cash', received: 999999999 });
  }, /chỉ còn/);
  draft(s, p, 2);
  s.checkout({ payment: 'cash', received: 999999999 });
  assert.equal(s.data.lots.find((l) => l.code === 'NEAR').qty, 1);
});
test('store voucher discounts the whole basket, partner voucher only that partner products', () => {
  const { s, p } = fixture();
  const other = s.data.products.find(
    (x) => x.active && x.supplierId !== p.supplierId && s.saleableStock(x.id) > 5,
  );
  const v = voucher(s, { source: 'partner', partnerSupplierId: p.supplierId });
  const d = draft(s, p, 2);
  d.items.push({ id: other.id, name: other.name, price: other.price, qty: 2 });
  d.discountSelection = { kind: 'voucher', id: v.id };
  s.saveDraft(d);
  let q = s.quoteDraft();
  assert.equal(q.discount, Math.floor(p.price * 2 * 0.1));
  assert.equal(q.items.find((i) => i.id === other.id).lineDiscount, 0);
  const global = voucher(s, { code: 'GLOBAL' });
  d.discountSelection = { kind: 'voucher', id: global.id };
  s.saveDraft(d);
  q = s.quoteDraft();
  assert.equal(q.discount, Math.floor((p.price + other.price) * 2 * 0.1));
});
test('partner voucher is rejected for a basket without that partner and a crafted foreign scope', () => {
  const { s, p } = fixture();
  const other = s.data.products.find(
    (x) => x.active && x.supplierId !== p.supplierId && s.saleableStock(x.id) > 5,
  );
  const v = voucher(s, { source: 'partner', partnerSupplierId: p.supplierId });
  draft(s, other, 1, { kind: 'voucher', id: v.id });
  assert.throws(() => s.quoteDraft(), /không có/);
  assert.throws(
    () =>
      voucher(s, {
        code: 'WRONG',
        source: 'partner',
        partnerSupplierId: p.supplierId,
        productIds: [other.id],
      }),
    /chỉ áp dụng/,
  );
  const scoped = voucher(s, {
    code: 'SCOPEDMIN',
    source: 'partner',
    partnerSupplierId: p.supplierId,
    minSpend: p.price * 2,
  });
  const mixed = draft(s, p, 1, { kind: 'voucher', id: scoped.id });
  mixed.items.push({
    id: other.id,
    name: other.name,
    price: other.price,
    qty: Math.ceil((p.price * 2) / other.price) + 1,
  });
  s.saveDraft(mixed);
  assert.throws(() => s.quoteDraft(), /phạm vi/);
});
test('near-date promotion affects only chosen lot quantity and preserves integer line totals', () => {
  const { s, p } = fixture();
  s.data.lots.filter((l) => l.productId === p.id).forEach((l) => (l.expiryDate = addDays(180)));
  const near = s.addLot(p.id, {
    qty: 3,
    code: 'NEAR-DISCOUNT',
    expiryDate: addDays(5),
    sourceId: 'TEST',
  });
  const promo = s.upsertDiscount('promotion', {
    name: 'Cận date',
    type: 'percent',
    value: 20,
    minSpend: 0,
    maxDiscount: 0,
    startsOn: addDays(-1),
    endsOn: addDays(3),
    productIds: [p.id],
    lotIds: [near.id],
    active: true,
  });
  draft(s, p, 5, { kind: 'promotion', id: promo.id });
  const q = s.quoteDraft();
  assert.equal(q.discount, Math.floor(p.price * 3 * 0.2));
  assert.equal(
    q.items.reduce((a, i) => a + i.paidTotal, 0),
    q.total,
  );
  assert.equal(q.items[0].lotAllocations[0].qty, 3);
});
test('voucher usage, validity and minimum order are enforced at checkout', () => {
  const { s, p } = fixture();
  const v = voucher(s, { limit: 1 });
  draft(s, p, 1, { kind: 'voucher', id: v.id });
  s.checkout({ payment: 'cash', received: 99999999 });
  assert.equal(v.used, 1);
  draft(s, p, 1, { kind: 'voucher', id: v.id });
  assert.throws(() => s.quoteDraft(), /hết lượt/);
  const exp = voucher(s, { code: 'EXP', endsOn: addDays(-1), startsOn: addDays(-10) });
  draft(s, p, 1, { kind: 'voucher', id: exp.id });
  assert.throws(() => s.quoteDraft(), /hết hạn/);
});
test('returns have no domain operations or role access', () => {
  const { s } = fixture();
  assert.equal(s.createReturn, undefined);
  assert.equal(s.resolveReturn, undefined);
  assert.equal(s.can('returns'), false);
});
test('held carts remain independent and restore without overwriting a current cart', () => {
  const { s, p } = fixture();
  draft(s, p, 2);
  const h = s.hold();
  draft(s, p, 1);
  assert.throws(() => s.restoreHeld(h.id), /giỏ hiện tại/);
  s.saveDraft({ ...s.data.draft, items: [] });
  s.restoreHeld(h.id);
  assert.equal(s.data.draft.items[0].qty, 2);
});
test('failed writes and newer tabs cannot produce a partial sale', () => {
  const { s, p, storage } = fixture();
  draft(s, p);
  const before = clone(s.data);
  const write = storage.setItem;
  storage.setItem = () => {
    throw new Error('Quota');
  };
  assert.throws(() => s.checkout({ payment: 'cash', received: 99999999 }), /Quota/);
  assert.deepEqual(s.data, before);
  storage.setItem = write;
  const tab = new Store(storage);
  tab.login('admin', '123456');
  draft(s, p, 1);
  assert.throws(() => draft(tab, p, 1), /tab khác/);
});
test('adding a new product with opening stock requires expiry and creates a balanced lot', () => {
  const { s, p } = fixture();
  const values = {
    name: 'Sữa Vinamilk thử nghiệm',
    category: 'Thực phẩm',
    price: 1000,
    cost: 700,
    minStock: 2,
    stock: 5,
    tracksExpiry: true,
    barcode: 'TEST-NEW',
    supplierId: p.supplierId,
    image: 'assets/product-placeholder.svg',
    active: true,
  };
  assert.throws(() => s.upsert('products', values), /HSD/);
  const created = s.upsert('products', { ...values, expiryDate: addDays(60), lotCode: 'OPEN' });
  assert.equal(s.saleableStock(created.id), 5);
  assert.equal(validateBackup(s.data).schema, 3);
});
