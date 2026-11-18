(function (scope) {
  'use strict';
  const methods = {
    supplierAcceptsProduct(supplierId, product) {
      const s = this.data.suppliers.find((s) => s.id === supplierId);
      return !!s && (!s.supplyPattern || new RegExp(s.supplyPattern, 'i').test(product.name || ''));
    },
  };
  function repairSupplierCatalog(s) {
    if (s.supplierRepairVersion === 2) return s;
    const catalog =
      typeof module !== 'undefined' && module.exports
        ? require('../data/supplier-catalog.js').supplierCatalog
        : scope.Retail.supplierCatalog;
    const aliases = { 'S-VINA': 'NCC001', 'S-ACE': 'NCC002' };
    for (const [id, name, category, pattern] of catalog) {
      const supplier = s.suppliers.find((x) => x.id === (aliases[id] || id));
      if (supplier) {
        supplier.supplyPattern = pattern;
        supplier.category = category;
        if (!aliases[id]) supplier.name = name + ' (mẫu)';
      }
      if (aliases[id]) {
        const duplicate = s.suppliers.find((x) => x.id === id);
        if (duplicate) {
          duplicate.active = false;
          duplicate.supplyPattern = pattern;
          duplicate.category = category;
          duplicate.name = name + ' (hồ sơ cũ)';
        }
      }
    }
    const managed = new Set(['NCC001', 'NCC002', 'NCC003', ...catalog.map((row) => row[0])]);
    for (const p of s.products.filter((p) => p.active && managed.has(p.supplierId))) {
      const rule = catalog.find((row) => new RegExp(row[3], 'i').test(p.name));
      if (rule) p.supplierId = aliases[rule[0]] || rule[0];
      else if (['NCC001', 'NCC002'].includes(p.supplierId)) {
        p.supplierId = 'NCC003';
        p.supplierNote = 'Chuyển sang NCC tổng hợp do không thuộc thương hiệu Vinamilk/Acecook.';
      }
    }
    for (const v of s.vouchers.filter((v) => v.source === 'partner')) {
      v.partnerSupplierId = aliases[v.partnerSupplierId] || v.partnerSupplierId;
      v.partner = s.suppliers.find((x) => x.id === v.partnerSupplierId)?.name || v.partner;
      if (v.productIds?.length) {
        v.productIds = v.productIds.filter((id) =>
          s.products.some((p) => p.id === id && p.supplierId === v.partnerSupplierId),
        );
        if (!v.productIds.length) {
          v.active = false;
          v.migrationNote = 'Cần chọn lại sản phẩm đúng nhà cung cấp.';
        }
      }
    }
    for (const p of s.purchases.filter(
      (p) => !['received', 'closed_short', 'cancelled', 'rejected'].includes(p.status),
    )) {
      if (aliases[p.supplierId]) {
        p.supplierId = aliases[p.supplierId];
        p.supplier = s.suppliers.find((x) => x.id === p.supplierId)?.name || p.supplier;
      }
    }
    for (const d of [s.draft, ...s.held])
      if (d.discountSelection?.kind === 'none') d.discountSelection = { kind: 'auto', id: '' };
    s.supplierRepairVersion = 2;
    return s;
  }
  if (typeof module !== 'undefined' && module.exports)
    module.exports = { ...methods, repairSupplierCatalog };
  else {
    (scope.Retail.storeModules ||= {}).supplierMatching = methods;
    scope.Retail.repairSupplierCatalog = repairSupplierCatalog;
  }
})(globalThis);
