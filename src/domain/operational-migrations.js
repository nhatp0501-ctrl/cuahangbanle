(function (scope) {
  'use strict';
  const { today, addDays } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { supplierCatalog } =
    typeof module !== 'undefined' && module.exports
      ? require('../data/supplier-catalog.js')
      : scope.Retail;
  function migrateOperations(s) {
    if (s.schema >= 3) return s;
    for (const [id, name, category] of supplierCatalog) {
      if (!s.suppliers.some((x) => x.id === id))
        s.suppliers.push({
          id,
          name: name + ' (mẫu)',
          category,
          phone: 'Chưa cập nhật',
          areas: 'TP. HCM, Bình Dương',
          active: true,
          contact: 'Bộ phận kinh doanh',
          address: 'Địa chỉ mẫu — cập nhật trước khi giao dịch',
          demo: true,
        });
    }
    // Giữ nguyên nhà cung cấp của chứng từ cũ và sản phẩm được người dùng tự tạo.
    for (const p of s.products.filter((p) => p.active && (p.catalogSource || p.sourceUrl))) {
      if (s.vouchers.some((v) => v.source === 'partner' && v.partnerSupplierId === p.supplierId))
        continue;
      const supplier = supplierCatalog.find((row) => new RegExp(row[3], 'i').test(p.name));
      if (supplier) p.supplierId = supplier[0];
    }
    for (const d of [s.draft, ...s.held])
      if (!d.discountSelection || d.discountSelection.kind === 'none')
        d.discountSelection = { kind: 'auto', id: '' };
    for (const r of [...s.vouchers, ...s.promotions]) {
      if ((r.type === 'fixed' && r.value < 1000) || (r.maxDiscount > 0 && r.maxDiscount < 1000)) {
        r.active = false;
        r.migrationNote = 'Tạm dừng: mức giảm dưới 1.000đ. Admin cần cập nhật.';
      }
    }
    const product = s.products.find((p) => p.active && /hảo hảo/i.test(p.name));
    if (product && !s.promotions.some((p) => p.id === 'KM-MUA2'))
      s.promotions.push({
        id: 'KM-MUA2',
        name: 'Mua 2 giảm 5.000đ',
        type: 'quantity',
        value: 5000,
        buyQty: 2,
        minSpend: 0,
        maxDiscount: 0,
        startsOn: today(),
        endsOn: addDays(30),
        productIds: [product.id],
        lotIds: [],
        active: true,
        demo: true,
      });
    for (const a of s.audits.filter((a) => ['counting', 'submitted'].includes(a.status))) {
      a.items.forEach(
        (i) => (i.salePrice ??= s.products.find((p) => p.id === i.productId)?.price ?? i.cost),
      );
      if (
        a.status === 'submitted' &&
        a.items.some((i) => i.countedQty !== i.bookQty || i.damagedQty !== i.bookBlocked)
      ) {
        a.status = 'counting';
        a.recountNote =
          'Nâng cấp quy trình: cần đối chiếu hóa đơn và chốt đếm lại trước khi gửi duyệt chênh lệch.';
      }
    }
    s.schema = 3;
    return s;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { migrateOperations };
  else scope.Retail.migrateOperations = migrateOperations;
})(globalThis);
