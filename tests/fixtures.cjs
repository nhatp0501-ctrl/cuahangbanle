const { Store, clone, KEY, addDays } = require('../store');
function fixture() {
  const records = new Map();
  const storage = { getItem: (k) => records.get(k) || null, setItem: (k, v) => records.set(k, v) };
  const s = new Store(storage);
  s.login('admin', '123456');
  if (s.loadError) throw new Error(s.loadError);
  const p = s.data.products.find((p) => p.active && p.tracksExpiry && s.saleableStock(p.id) > 30);
  return { s, p, storage, records };
}
function draft(s, p, qty = 2, selection = { kind: 'none', id: '' }) {
  s.saveDraft({
    ...clone(s.data.draft),
    items: [{ id: p.id, name: p.name, price: p.price, image: p.image, qty }],
    discount: 0,
    discountSelection: selection,
  });
  return s.data.draft;
}
function voucher(s, overrides = {}) {
  return s.upsertDiscount('voucher', {
    name: 'Voucher thử',
    code: 'TEST10',
    source: 'store',
    type: 'percent',
    value: 10,
    minSpend: 0,
    maxDiscount: 0,
    startsOn: addDays(-1),
    endsOn: addDays(10),
    limit: 100,
    active: true,
    ...overrides,
  });
}
module.exports = { fixture, draft, voucher, clone, KEY, addDays };
