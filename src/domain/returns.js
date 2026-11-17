(function (scope) {
  'use strict';
  const { KEY, ROLES, METHODS, ACCESS, clone, now, id, assert, integer } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { totals } =
    typeof module !== 'undefined' && module.exports ? require('./calculations.js') : scope.Retail;
  const { validateBackup } =
    typeof module !== 'undefined' && module.exports ? require('./backup.js') : scope.Retail;
  const methods = {
    available(orderId, productId, excludeReturnId = '') {
      const o = this.data.orders.find((o) => o.id === orderId),
        i = o?.items.find((i) => i.id === productId);
      if (!i) return 0;
      const reserved = this.data.returns
        .filter((r) => r.orderId === orderId && r.status === 'pending' && r.id !== excludeReturnId)
        .reduce((s, r) => s + (r.items.find((i) => i.id === productId)?.qty || 0), 0);
      return i.qty - i.returnedQty - reserved;
    },
    createReturn(orderId, selections, reason, restock) {
      this.require('returns');
      const o = this.data.orders.find((o) => o.id === orderId);
      assert(
        o && ['completed', 'partial'].includes(o.status),
        'Chỉ được trả hàng từ hóa đơn đã thanh toán còn hàng chưa trả.',
      );
      assert(reason.trim(), 'Vui lòng nhập lý do trả hàng.');
      assert(selections.length, 'Chọn ít nhất một mặt hàng cần trả.');
      assert(
        new Set(selections.map((i) => i.id)).size === selections.length,
        'Sản phẩm trả bị trùng.',
      );
      const items = selections.map((s) => {
        const i = o.items.find((i) => i.id === s.id);
        assert(i, 'Sản phẩm không có trong hóa đơn.');
        const qty = integer(s.qty, 'Số lượng trả', 1);
        assert(
          qty <= this.available(o.id, i.id),
          `Số lượng trả của ${i.name} vượt số lượng khả dụng.`,
        );
        return { id: i.id, name: i.name, price: i.price, qty };
      });
      return this.commit('Tạo yêu cầu trả hàng', o.id, () => {
        const r = {
          id: id('DT'),
          orderId: o.id,
          time: now(),
          items,
          reason: reason.trim(),
          restock: !!restock,
          status: 'pending',
          scope:
            items.reduce((a, i) => a + i.qty, 0) === o.items.reduce((a, i) => a + i.qty, 0)
              ? 'full'
              : 'partial',
          amount: 0,
          actor: this.user.name,
          payment: o.payment,
        };
        this.data.returns.unshift(r);
        return r;
      });
    },
    resolveReturn(returnId, approved) {
      this.admin();
      return this.commit(approved ? 'Duyệt hoàn tiền' : 'Từ chối trả hàng', returnId, () => {
        const r = this.data.returns.find((r) => r.id === returnId);
        assert(r && r.status === 'pending', 'Yêu cầu đã được xử lý hoặc không tồn tại.');
        const o = this.data.orders.find((o) => o.id === r.orderId);
        assert(o, 'Không tìm thấy hóa đơn gốc.');
        if (approved) {
          assert(
            ['completed', 'partial'].includes(o.status),
            'Hóa đơn không còn hợp lệ để hoàn tiền.',
          );
          let amount = 0;
          r.items.forEach((item) => {
            const original = o.items.find((i) => i.id === item.id);
            assert(
              item.qty <= this.available(o.id, item.id, r.id),
              'Số lượng khả dụng đã thay đổi.',
            );
            const value =
              Math.floor((original.paidTotal * (original.returnedQty + item.qty)) / original.qty) -
              Math.floor((original.paidTotal * original.returnedQty) / original.qty);
            amount += value;
            item.refund = value;
            original.returnedQty += item.qty;
            if (r.restock)
              this.restoreReturnStock(original, item.qty, original.returnedQty - item.qty, r.id);
          });
          r.amount = amount;
          r.status = 'approved';
          o.status = 'completed';
        } else r.status = 'rejected';
        r.resolvedAt = now();
        r.approver = this.user.name;
        return r;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules || (scope.Retail.storeModules = {})).returns = methods;
})(globalThis);
