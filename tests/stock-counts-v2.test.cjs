const test = require('node:test'),
  assert = require('node:assert/strict');
const { fixture, draft, addDays } = require('./fixtures.cjs');
const lines = (a, delta = 0) =>
  a.items.map((i, n) => ({
    lotId: i.lotId,
    countedQty: i.bookQty + (n === 0 ? delta : 0),
    damagedQty: 0,
    reason: delta ? 'Vỡ mất sản phẩm, có biên bản ca' : 'Đếm khớp',
  }));
test('counting locks sale and receiving for the scope and requires independent saved counts first', () => {
  const { s, p } = fixture();
  const a = s.startAudit([p.id], 'Đếm kệ A');
  assert.equal(a.status, 'counting');
  assert.throws(() => { draft(s, p, 1); s.quoteDraft(); }, /khóa kiểm kê/);
  assert.throws(() => s.addLot(p.id, { qty: 2, code: 'X', expiryDate: addDays(20) }), /khóa/);
  assert.throws(() => s.saveAuditCount(a.id, lines(a), true), /Lưu kết quả/);
  s.saveAuditCount(a.id, lines(a), false);
  assert.equal(s.data.audits[0].countSaved, true);
});
test('warehouse submits discrepancies; stock changes only on admin approval with loss and quarantine tracked', () => {
  const { s, p } = fixture(),
    before = p.stock;
  s.login('kho', '123456');
  const a = s.startAudit([p.id], 'Đếm cuối ca'),
    counted = lines(a, -2);
  counted[0].damagedQty = 1;
  s.saveAuditCount(a.id, counted, false);
  s.saveAuditCount(a.id, counted, true);
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before);
  assert.throws(() => s.resolveAudit(a.id, 'approve', 'Ghi mất2'), /không có quyền/);
  s.login('admin', '123456');
  const done = s.resolveAudit(a.id, 'approve', 'Xác nhận vỡ 2, cách ly 1 móp');
  assert.equal(done.status, 'approved');
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before - 2);
  assert.equal(done.items[0].lossValue, 2 * p.cost);
  assert.equal(s.data.lots.find((l) => l.id === done.items[0].lotId).blockedQty, 1);
  assert.equal(s.inventoryLock(p.id), undefined);
  assert.throws(() => s.resolveAudit(a.id, 'approve', 'Lặp'), /trạng thái/);
});
test('unexplained changes cannot be submitted; recount resets blind counts; rejection unlocks without adjustment', () => {
  const { s, p } = fixture(),
    before = p.stock;
  let a = s.startAudit([p.id], 'Kiểm đếm'),
    counted = lines(a, -1);
  counted[0].reason = '';
  s.saveAuditCount(a.id, counted, false);
  assert.throws(() => s.saveAuditCount(a.id, counted, true), /Giải trình/);
  counted[0].reason = 'Thiếu hàng';
  s.saveAuditCount(a.id, counted, true);
  s.resolveAudit(a.id, 'recount', 'Yêu cầu đếm độc lập lần hai');
  a = s.data.audits.find((x) => x.id === a.id);
  assert.equal(a.countSaved, false);
  assert.ok(a.items.every((i) => i.countedQty === null));
  s.saveAuditCount(a.id, lines(a), false);
  s.saveAuditCount(a.id, lines(a), true);
  s.resolveAudit(a.id, 'reject', 'Không điều chỉnh, biên bản chưa hợp lệ');
  assert.equal(s.data.products.find((x) => x.id === p.id).stock, before);
  assert.equal(s.inventoryLock(p.id), undefined);
});
