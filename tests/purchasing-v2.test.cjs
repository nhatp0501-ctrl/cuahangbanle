const test = require('node:test'),
  assert = require('node:assert/strict');
const { fixture, addDays } = require('./fixtures.cjs');
function request(s, p, qty = 10) {
  s.login('kho', '123456');
  return s.createPurchase(
    p.supplierId,
    [{ id: p.id, qty, price: p.cost }],
    'Cần bổ sung',
    'submitted',
  );
}
function report(s, pn, p, actual, bad = 0) {
  s.login('kho', '123456');
  return s.reportPurchaseReceipt(
    pn.id,
    [
      {
        id: p.id,
        actualQty: actual,
        rejectedQty: bad,
        lotCode: 'SUP-LOT',
        expiryDate: addDays(100),
        reason: 'NCC giao thiếu / không đạt',
      },
    ],
    { deliveryRef: 'GH-001', note: 'Hẹn giao bù' },
  );
}
test('warehouse requests never add stock and only admin approves the request', () => {
  const { s, p } = fixture(),
    before = p.stock,
    pn = request(s, p);
  assert.equal(pn.status, 'submitted');
  assert.equal(p.stock, before);
  assert.throws(() => s.reviewPurchase(pn.id, true, 'Duyệt'), /không có quyền/);
  assert.throws(
    () => s.addLot(p.id, { qty: 1, expiryDate: addDays(20), code: 'X' }),
    /không có quyền/,
  );
  assert.throws(() => report(s, pn, p, 10), /admin đã duyệt/);
  s.login('admin', '123456');
  s.reviewPurchase(pn.id, true, 'Đủ nhu cầu');
  assert.equal(pn.status, 'approved');
  assert.equal(p.stock, before);
});
test('partial delivery tracks actual/rejected/accepted and only approved accepted quantities enter stock', () => {
  const { s, p } = fixture(),
    before = p.stock,
    pn = request(s, p);
  s.login('admin', '123456');
  s.reviewPurchase(pn.id, true, 'Đặt NCC');
  let r = report(s, pn, p, 8, 2);
  assert.equal(pn.status, 'receipt_pending');
  assert.equal(p.stock, before);
  assert.throws(() => s.reviewPurchaseReceipt(r.id, true, 'Đã kiểm'), /không có quyền/);
  s.login('admin', '123456');
  s.reviewPurchaseReceipt(r.id, true, 'Nhập 6 đạt, theo dõi 4 thiếu');
  let po = s.data.purchases.find((x) => x.id === pn.id);
  assert.equal(po.items[0].receivedQty, 6);
  assert.equal(po.items[0].rejectedQty, 2);
  assert.equal(po.status, 'partially_received');
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before + 6);
  assert.throws(() => s.reviewPurchaseReceipt(r.id, true, 'Lặp'), /đã được xử lý/);
  r = report(s, po, p, 4);
  s.login('admin', '123456');
  s.reviewPurchaseReceipt(r.id, true, 'Nhận bù đủ');
  po = s.data.purchases.find((x) => x.id === pn.id);
  assert.equal(po.status, 'received');
  assert.equal(po.items[0].receivedQty, 10);
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before + 10);
});
test('expired accepted goods and a receipt missing reasons are refused', () => {
  const { s, p } = fixture(),
    pn = request(s, p);
  s.login('admin', '123456');
  s.reviewPurchase(pn.id, true, 'OK');
  s.login('kho', '123456');
  assert.throws(
    () =>
      s.reportPurchaseReceipt(
        pn.id,
        [{ id: p.id, actualQty: 10, rejectedQty: 0, lotCode: 'X', expiryDate: addDays(-1) }],
        { deliveryRef: 'GH' },
      ),
    /HSD/,
  );
  assert.throws(
    () =>
      s.reportPurchaseReceipt(
        pn.id,
        [{ id: p.id, actualQty: 5, rejectedQty: 0, lotCode: 'X', expiryDate: addDays(10) }],
        { deliveryRef: 'GH' },
      ),
    /Giải trình/,
  );
});
for (const choice of ['accept', 'send_back'])
  test(`overdelivery is recorded and admin must explicitly ${choice} surplus`, () => {
    const { s, p } = fixture(),
      before = p.stock,
      pn = request(s, p);
    s.login('admin', '123456');
    s.reviewPurchase(pn.id, true, 'Đặt 10');
    const r = report(s, pn, p, 13, 1);
    assert.equal(r.items[0].actualQty, 13);
    assert.equal(r.items[0].surplusQty, 2);
    assert.equal(p.stock, before);
    s.login('admin', '123456');
    assert.throws(() => s.reviewPurchaseReceipt(r.id, true, 'Đối chiếu'), /Giao dư/);
    s.reviewPurchaseReceipt(r.id, true, 'NCC xác nhận phần dư', choice);
    const po = s.data.purchases.find((x) => x.id === pn.id),
      accepted = choice === 'accept' ? 12 : 10;
    assert.equal(po.items[0].receivedQty, accepted);
    assert.equal(po.receivedValue, accepted * p.cost);
    assert.equal(po.status, 'received');
    assert.equal(s.data.products.find((x) => x.id === p.id).stock, before + accepted);
    assert.equal(require('../store').validateBackup(s.data).schema, 3);
  });
test('receipt rejection does not add inventory and permits a corrected receipt', () => {
  const { s, p } = fixture(),
    before = p.stock,
    pn = request(s, p);
  s.login('admin', '123456');
  s.reviewPurchase(pn.id, true, 'OK');
  const r = report(s, pn, p, 5);
  s.login('admin', '123456');
  s.reviewPurchaseReceipt(r.id, false, 'Sửa chứng từ');
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before);
  assert.equal(s.data.purchases.find((x) => x.id === pn.id).status, 'approved');
  assert.doesNotThrow(() => report(s, pn, p, 10));
});
test('only admin can close a supplier shortage, with a recorded reason and no phantom stock', () => {
  const { s, p } = fixture(),
    before = p.stock,
    pn = request(s, p);
  s.login('admin', '123456');
  s.reviewPurchase(pn.id, true, 'OK');
  const r = report(s, pn, p, 6);
  s.login('admin', '123456');
  s.reviewPurchaseReceipt(r.id, true, 'Nhập6');
  s.login('kho', '123456');
  assert.throws(() => s.closePurchaseShort(pn.id, 'NCC hết hàng'), /không có quyền/);
  s.login('admin', '123456');
  assert.throws(() => s.closePurchaseShort(pn.id, ''), /xác nhận/);
  s.closePurchaseShort(pn.id, 'NCC xác nhận không giao 4 còn thiếu, hủy phần còn lại.');
  assert.equal(s.data.purchases.find((x) => x.id === pn.id).status, 'closed_short');
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before + 6);
});
test('multi-line receiving is atomic even when a later lot fails approval', () => {
  const { s, p, storage } = fixture();
  const other = s.data.products.find(
    (x) => x.active && x.id !== p.id && x.supplierId === p.supplierId && x.tracksExpiry,
  );
  const pn = s.createPurchase(
    p.supplierId,
    [p, other].map((x) => ({ id: x.id, qty: 5, price: x.cost })),
    'Nhập cùng NCC',
  );
  s.reviewPurchase(pn.id, true, 'Đủ điều kiện');
  const r = s.reportPurchaseReceipt(
    pn.id,
    [p, other].map((x) => ({
      id: x.id,
      actualQty: 5,
      rejectedQty: 0,
      lotCode: 'TX-' + x.id,
      expiryDate: addDays(20),
    })),
    { deliveryRef: 'ATOMIC' },
  );
  r.items[1].expiryDate = addDays(-1); // HSD không còn hợp lệ tại thời điểm duyệt.
  const { KEY, clone } = require('./fixtures.cjs');
  const before = clone(s.data),
    disk = storage.getItem(KEY);
  assert.throws(() => s.reviewPurchaseReceipt(r.id, true, 'Đối chiếu'), /hết hạn/);
  assert.deepEqual(s.data, before);
  assert.equal(storage.getItem(KEY), disk);
});
