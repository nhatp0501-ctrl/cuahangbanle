(function (scope) {
  'use strict';
  const { integer, assert } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  function totals(items, discount = 0, taxRate = 0) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    discount = integer(discount, 'Giảm giá');
    assert(discount <= subtotal, 'Giảm giá không được vượt quá tạm tính.');
    taxRate = integer(taxRate, 'Thuế suất', 0, 100);
    const tax = Math.round(((subtotal - discount) * taxRate) / 100);
    return { subtotal, discount, taxRate, tax, total: subtotal - discount + tax };
  }
  function allocateInteger(amount, weights) {
    const sum = weights.reduce((s, n) => s + n, 0);
    if (!sum) return weights.map(() => 0);
    const denominator = BigInt(sum),
      numerator = BigInt(amount);
    const rows = weights.map((weight, index) => ({
      index,
      value: Number((numerator * BigInt(weight)) / denominator),
      remainder: (numerator * BigInt(weight)) % denominator,
    }));
    let left = amount - rows.reduce((s, r) => s + r.value, 0);
    const ranked = rows
      .filter((r, i) => weights[i] > 0)
      .sort((a, b) =>
        a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1,
      );
    for (let n = 0; left > 0; n++, left--) ranked[n % ranked.length].value++;
    return rows.map((r) => r.value);
  }

  const api = { totals, allocateInteger };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(scope.Retail, api);
})(globalThis);
