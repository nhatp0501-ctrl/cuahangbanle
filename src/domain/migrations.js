(function (scope) {
  'use strict';
  const { clone, now, id, today, addDays } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  function catalogue() {
    if (typeof module !== 'undefined' && module.exports) {
      try {
        return require('../data/product-catalog.js').productCatalog;
      } catch {
        return [];
      }
    }
    return scope.Retail.productCatalog || [];
  }
  function migrateData(input, { fresh = false } = {}) {
    const s = clone(input),
      oldSchema = s.schema === 1;
    s.lots ||= [];
    s.purchaseReceipts ||= [];
    s.vouchers ||= [];
    s.promotions ||= [];
    s.settings.nearExpiryDays ??= 30;
    if (
      (s.catalogVersion !== 20261117 || s.catalogCount !== catalogue().length) &&
      catalogue().length
    ) {
      const originalDemo = new Set([
        'Bánh Mì Que Pate Peak',
        'Cơm Tấm Sườn Nướng 7-E',
        'Sandwich Trứng Mayonnaise',
        'Bao Tử Cá Cay Chuẩn Vị',
        'Trà Tắc Xí Muội Mát Lạnh',
        'Trà Tắc Mật Khổng Lồ',
        'Cà Phê Sữa Đá 7-Select',
        'Cà Phê Đen Đá Nguyên Chất',
        'Matcha Latte Đá Sữa Tươi',
        'Trà Sữa Trân Châu Ô Long',
        'Bánh Bao Nhân Thịt Trứng Cút',
        'In Ảnh Photobooth Khung 7E',
        'Cà phê Cốt Dừa',
        'Trà Sữa Oolong',
        'Trà Đào Sả',
        'Bánh Mì Que Hải Phòng',
        'Snack Khoai Tây',
        'Khô Gà Bơ Tỏi',
        'Khăn Giấy Ướt Cao Cấp',
        'Nước Rửa Tay Diệt Khuẩn',
      ]);
      s.products.forEach((p) => {
        if (originalDemo.has(p.name) && /^SP\d{3}$/.test(p.id)) {
          p.active = false;
          p.legacyDemo = true;
        }
      });
      catalogue().forEach((c, index) => {
        let p = c.legacyId
          ? s.products.find((p) => p.id === c.legacyId)
          : s.products.find((p) => p.catalogSource === c.sourceUrl);
        if (p) {
          p.image = c.image;
          p.sourceUrl = c.sourceUrl;
          p.name = c.name;
          p.category = c.category;
          p.tracksExpiry = c.tracksExpiry !== false;
          p.unit = c.unit || 'Sản phẩm';
        } else {
          const productId = 'SKU' + String(index + 1).padStart(4, '0');
          if (s.products.some((p) => p.id === productId)) return;
          p = {
            id: productId,
            name: c.name,
            category: c.category,
            image: c.image,
            sourceUrl: c.sourceUrl,
            catalogSource: c.sourceUrl,
            price: c.price,
            cost: Math.round(c.price * 0.72),
            stock: c.stock || 240,
            minStock: c.minStock || 30,
            barcode: c.barcode || 'RF' + String(index + 1).padStart(10, '0'),
            barcodeIsInternal: !c.barcode,
            supplierId:
              c.supplierGroup === 'dairy'
                ? 'NCC001'
                : c.supplierGroup === 'food'
                  ? 'NCC002'
                  : 'NCC003',
            tracksExpiry: c.tracksExpiry !== false,
            unit: c.unit || 'Sản phẩm',
            active: true,
            icon: '',
            createdAt: now(),
            demo: true,
          };
          s.products.push(p);
          p.newDemo = true;
        }
      });
      s.catalogVersion = 20261117;
      s.catalogCount = catalogue().length;
    }
    s.products.forEach((p, index) => {
      p.tracksExpiry ??= !/gia dụng|giấy|photobooth/i.test(p.category + ' ' + p.name);
      p.image ||= 'assets/products/placeholder.svg';
      p.icon ??= '';
      if (!s.lots.some((l) => l.productId === p.id) && p.stock > 0) {
        if (fresh || p.newDemo) {
          const near =
            p.tracksExpiry && index % 5 === 0
              ? Math.min(p.stock, Math.max(4, Math.floor(p.stock * 0.2)))
              : 0;
          if (near)
            s.lots.push({
              id: id('LO'),
              productId: p.id,
              code: `DEMO-${p.id}-A`,
              expiryDate: addDays(10),
              qty: near,
              blockedQty: 0,
              receivedAt: now(),
              sourceId: 'TON-DAU',
              demo: true,
            });
          const qty = p.stock - near;
          if (qty)
            s.lots.push({
              id: id('LO'),
              productId: p.id,
              code: `DEMO-${p.id}-B`,
              expiryDate: p.tracksExpiry ? addDays(120 + (index % 240)) : null,
              qty,
              blockedQty: 0,
              receivedAt: now(),
              sourceId: 'TON-DAU',
              demo: true,
            });
        } else
          s.lots.push({
            id: id('LO'),
            productId: p.id,
            code: `CHUYEN-DOI-${p.id}`,
            expiryDate: null,
            qty: p.stock,
            blockedQty: 0,
            receivedAt: now(),
            sourceId: 'CHUYEN-DOI',
            needsExpiry: p.tracksExpiry,
          });
      }
      delete p.newDemo;
    });
    for (const p of s.purchases) {
      if (oldSchema) {
        p.status = p.status === 'pending' ? 'submitted' : p.status;
        p.legacy = true;
      }
      for (const i of p.items) {
        i.receivedQty ??= p.status === 'received' ? i.qty : 0;
        i.rejectedQty ??= 0;
      }
      p.receiptIds ||= [];
    }
    for (const a of s.audits) if (!a.status) a.status = 'legacy_approved';
    for (const d of [s.draft, ...s.held]) {
      d.checkoutKey ||= id('PAY');
      d.discountSelection ||= { kind: 'none', id: '' };
      if (oldSchema) {
        d.legacyDiscount = d.discount || 0;
        d.discount = 0;
      }
    }
    if (!s.vouchers.length)
      s.vouchers.push({
        id: 'VC-WELCOME',
        code: 'CHAOMUNG',
        name: 'Chào mừng khách mua từ 100.000đ',
        source: 'store',
        type: 'fixed',
        value: 10000,
        minSpend: 100000,
        maxDiscount: 10000,
        startsOn: addDays(-30),
        endsOn: addDays(180),
        limit: 200,
        used: 0,
        active: true,
      });
    for (const o of s.orders)
      if (['partial', 'refunded'].includes(o.status)) o.status = 'completed';
    if (!s.promotions.length) {
      const lots = s.lots
        .filter(
          (l) => l.demo && l.expiryDate && l.expiryDate >= today() && l.expiryDate <= addDays(30),
        )
        .slice(0, 8);
      if (lots.length)
        s.promotions.push({
          id: 'KM-CANDATE',
          name: 'Ưu đãi lô cận date 15%',
          type: 'percent',
          value: 15,
          minSpend: 0,
          maxDiscount: 50000,
          startsOn: today(),
          endsOn: addDays(7),
          productIds: [...new Set(lots.map((l) => l.productId))],
          lotIds: lots.map((l) => l.id),
          active: true,
          demo: true,
        });
    }
    const { migrateOperations } =
      typeof module !== 'undefined' && module.exports
        ? require('./operational-migrations.js')
        : scope.Retail;
    migrateOperations(s);
    if (oldSchema)
      s.logs.unshift({
        id: id('LOG'),
        time: now(),
        actor: 'Hệ thống',
        action: 'Nâng cấp nghiệp vụ v2',
        detail: 'Bổ sung lô hàng, hạn dùng, yêu cầu nhập và quy trình kiểm kê phê duyệt.',
      });
    return s;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { migrateData };
  else scope.Retail.migrateData = migrateData;
})(globalThis);
