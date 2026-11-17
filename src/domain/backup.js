(function (scope) {
  'use strict';
  const { assert, integer, ROLES, METHODS, validDate } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { totals } =
    typeof module !== 'undefined' && module.exports ? require('./calculations.js') : scope.Retail;
  function validateBackup(s) {
    assert(s && [1, 2].includes(s.schema), 'Tệp sao lưu không đúng định dạng RetailFlow.');
    for (const key of [
      'products',
      'customers',
      'suppliers',
      'staff',
      'orders',
      'returns',
      'purchases',
      'movements',
      'audits',
      'held',
      'branches',
      'logs',
    ]) {
      assert(Array.isArray(s[key]), `Thiếu danh sách ${key}.`);
      const keys = s[key].map((x) => x.id);
      assert(
        keys.every((x) => typeof x === 'string' && x.length > 0) &&
          new Set(keys).size === keys.length,
        `Mã trong ${key} không hợp lệ hoặc trùng.`,
      );
    }
    assert(
      s.settings && typeof s.settings.name === 'string' && typeof s.settings.address === 'string',
      'Cấu hình cửa hàng không hợp lệ.',
    );
    integer(s.settings.taxRate, 'Thuế suất', 0, 100);
    const productIds = new Set(s.products.map((p) => p.id));
    const supplierIds = new Set(s.suppliers.map((p) => p.id));
    const barcodes = new Set();
    s.products.forEach((p) => {
      assert(
        typeof p.name === 'string' &&
          typeof p.category === 'string' &&
          typeof p.icon === 'string' &&
          typeof p.active === 'boolean',
        'Sản phẩm không hợp lệ.',
      );
      assert(supplierIds.has(p.supplierId), 'Nhà cung cấp của sản phẩm không tồn tại.');
      integer(p.price, 'Giá bán');
      integer(p.cost, 'Giá vốn');
      integer(p.stock, 'Tồn kho');
      integer(p.minStock, 'Ngưỡng tồn');
      assert(typeof p.barcode === 'string' && !barcodes.has(p.barcode), 'Mã vạch bị trùng.');
      barcodes.add(p.barcode);
    });
    s.staff.forEach((u) =>
      assert(
        typeof u.username === 'string' &&
          typeof u.password === 'string' &&
          typeof u.name === 'string' &&
          ROLES[u.role] &&
          typeof u.active === 'boolean',
        'Tài khoản không hợp lệ.',
      ),
    );
    assert(
      new Set(s.staff.map((u) => u.username)).size === s.staff.length,
      'Tên đăng nhập bị trùng.',
    );
    assert(
      s.staff.some((u) => u.role === 'ADMIN' && u.active),
      'Cần ít nhất một quản trị viên đang hoạt động.',
    );
    const validItems = (items, checkReturned = false) => {
      assert(Array.isArray(items) && items.length, 'Danh sách hàng không hợp lệ.');
      assert(
        new Set(items.map((i) => i.id)).size === items.length,
        'Sản phẩm trong chứng từ bị trùng.',
      );
      items.forEach((i) => {
        assert(productIds.has(i.id), 'Sản phẩm trong chứng từ không tồn tại.');
        integer(i.qty, 'Số lượng', 1);
        integer(i.price, 'Đơn giá');
        if (checkReturned) {
          integer(i.returnedQty, 'Số lượng đã trả', 0, i.qty);
          integer(i.paidTotal, 'Giá trị đã trả tiền');
        }
      });
    };
    s.orders.forEach((o) => {
      validItems(o.items, true);
      assert(
        !isNaN(Date.parse(o.time)) &&
          METHODS[o.payment] &&
          ['completed', 'partial', 'refunded', 'cancelled'].includes(o.status),
        'Hóa đơn không hợp lệ.',
      );
      integer(o.total, 'Tổng hóa đơn');
      const t = totals(o.items, o.discount, o.taxRate);
      assert(
        t.total === o.total && o.items.reduce((a, i) => a + i.paidTotal, 0) === o.total,
        'Tổng tiền hóa đơn không khớp.',
      );
    });
    s.returns.forEach((r) => {
      assert(
        ['pending', 'approved', 'rejected'].includes(r.status) &&
          s.orders.some((o) => o.id === r.orderId),
        'Phiếu trả không hợp lệ.',
      );
      validItems(r.items);
      integer(r.amount, 'Tiền hoàn');
    });
    s.purchases.forEach((p) => {
      assert(
        supplierIds.has(p.supplierId) &&
          [
            'draft',
            'pending',
            'submitted',
            'approved',
            'rejected',
            'receipt_pending',
            'partially_received',
            'received',
            'closed_short',
            'cancelled',
          ].includes(p.status),
        'Phiếu nhập không hợp lệ.',
      );
      validItems(p.items);
      integer(p.total, 'Tổng tiền nhập');
      assert(
        p.total === p.items.reduce((a, i) => a + i.qty * i.price, 0),
        'Tổng phiếu nhập không khớp.',
      );
    });
    assert(s.held.length <= 5 && s.draft && Array.isArray(s.draft.items), 'Đơn tạm không hợp lệ.');
    for (const d of [s.draft, ...s.held]) {
      if (d.items.length) validItems(d.items);
      totals(d.items, d.discount, s.settings.taxRate);
    }
    s.customers.forEach((c) =>
      assert(typeof c.name === 'string' && typeof c.phone === 'string', 'Khách hàng không hợp lệ.'),
    );
    s.suppliers.forEach((c) =>
      assert(
        typeof c.name === 'string' && typeof c.areas === 'string',
        'Nhà cung cấp không hợp lệ.',
      ),
    );
    if (s.schema === 2) {
      for (const key of ['lots', 'vouchers', 'promotions', 'purchaseReceipts']) {
        assert(Array.isArray(s[key]), `Thiếu ${key}.`);
        assert(new Set(s[key].map((i) => i.id)).size === s[key].length, `Trùng mã ${key}.`);
      }
      const balances = new Map();
      s.lots.forEach((l) => {
        assert(productIds.has(l.productId), 'Lô không có mặt hàng.');
        integer(l.qty, 'Tồn lô');
        integer(l.blockedQty, 'Số cách ly', 0, l.qty);
        assert(l.expiryDate === null || validDate(l.expiryDate), 'HSD không hợp lệ.');
        balances.set(l.productId, (balances.get(l.productId) || 0) + l.qty);
      });
      s.products.forEach((p) =>
        assert(p.stock === (balances.get(p.id) || 0), `Tồn ${p.name} không khớp số lượng các lô.`),
      );
      for (const v of [...s.vouchers, ...s.promotions]) {
        assert(
          typeof v.name === 'string' &&
            ['fixed', 'percent'].includes(v.type) &&
            validDate(v.startsOn) &&
            validDate(v.endsOn) &&
            v.startsOn <= v.endsOn,
          'Ưu đãi không hợp lệ.',
        );
        integer(v.value, 'Mức giảm', 1, v.type === 'percent' ? 100 : 1000000000);
        integer(v.minSpend, 'Giá trị tối thiểu');
        integer(v.maxDiscount || 0, 'Giảm tối đa');
      }
      s.vouchers.forEach((v) => {
        assert(
          ['store', 'partner'].includes(v.source) && typeof v.code === 'string',
          'Voucher không hợp lệ.',
        );
        integer(v.limit, 'Lượt voucher', 1);
        integer(v.used, 'Đã dùng voucher', 0, v.limit);
        if (v.source === 'partner')
          assert(supplierIds.has(v.partnerSupplierId), 'Đối tác voucher không tồn tại.');
      });
      s.promotions.forEach((p) => {
        assert(
          Array.isArray(p.productIds) &&
            p.productIds.length &&
            p.productIds.every((pid) => productIds.has(pid)) &&
            Array.isArray(p.lotIds) &&
            p.lotIds.every((lid) =>
              s.lots.some((l) => l.id === lid && p.productIds.includes(l.productId)),
            ),
          'Phạm vi chương trình không hợp lệ.',
        );
      });
      const locked = new Set();
      s.audits
        .filter((a) => a.status !== 'legacy_approved')
        .forEach((a) => {
          assert(
            ['counting', 'submitted', 'approved', 'rejected', 'cancelled'].includes(a.status) &&
              Array.isArray(a.items) &&
              a.items.length,
            'Phiếu kiểm kê không hợp lệ.',
          );
          a.items.forEach((i) => {
            assert(
              s.lots.some((l) => l.id === i.lotId && l.productId === i.productId),
              'Lô kiểm kê không tồn tại.',
            );
            integer(i.bookQty, 'Tồn sổ kiểm kê');
            integer(i.bookBlocked, 'Cách ly trên sổ', 0, i.bookQty);
            if (i.countedQty !== null) integer(i.countedQty, 'Thực đếm');
            integer(i.damagedQty, 'Số hỏng', 0, i.countedQty === null ? 0 : i.countedQty);
            if (['submitted', 'approved'].includes(a.status))
              assert(i.countedQty !== null, 'Thiếu số đếm trong phiếu gửi duyệt.');
            if (['counting', 'submitted'].includes(a.status)) {
              assert(!locked.has(i.lotId), 'Lô bị khóa ở hai phiếu kiểm kê.');
              locked.add(i.lotId);
            }
          });
        });
      s.orders.forEach((o) =>
        assert(
          o.status === 'cancelled' || (o.received >= o.total && (o.paymentCount ?? 1) === 1),
          'Hóa đơn không được thanh toán một phần.',
        ),
      );
      s.purchases.forEach((p) =>
        p.items.forEach((i) => {
          integer(i.receivedQty, 'Đã nhận', 0, i.qty);
          integer(i.rejectedQty, 'Không đạt');
        }),
      );
      s.purchaseReceipts.forEach((r) => {
        assert(
          s.purchases.some((p) => p.id === r.purchaseId) &&
            ['submitted', 'approved', 'rejected'].includes(r.status),
          'Biên bản nhập không hợp lệ.',
        );
        assert(Array.isArray(r.items) && r.items.length, 'Thiếu dòng nhận hàng.');
        r.items.forEach((i) => {
          integer(i.actualQty, 'Thực nhận');
          integer(i.rejectedQty, 'Không đạt', 0, i.actualQty);
          integer(i.acceptedQty, 'Nhập kho');
          assert(i.acceptedQty === i.actualQty - i.rejectedQty, 'Số đạt không khớp.');
        });
      });
    }
    return s;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { validateBackup };
  else scope.Retail.validateBackup = validateBackup;
})(globalThis);
