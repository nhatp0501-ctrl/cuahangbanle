(function (scope) {
  'use strict';
  const { assert, integer, id, now, clone, METHODS } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const methods = {
    saveDraft(draft) {
      this.require('pos');
      assert(
        Array.isArray(draft.items) &&
          new Set(draft.items.map((i) => i.id)).size === draft.items.length,
        'Giỏ hàng không hợp lệ.',
      );
      assert(
        !(draft.discount > 0),
        'Chọn voucher hoặc chương trình khuyến mãi thay vì giảm giá tùy ý.',
      );
      for (const i of draft.items) {
        integer(i.qty, 'Số lượng', 1);
        integer(i.price, 'Đơn giá');
        assert(
          this.data.products.some((p) => p.id === i.id),
          'Sản phẩm không tồn tại.',
        );
      }
      return this.commit('Cập nhật giỏ hàng', 'Đơn hàng hiện tại', () => {
        const value = clone(draft);
        value.checkoutKey ||= id('PAY');
        value.discountSelection ||= { kind: 'none', id: '' };
        value.discount = 0;
        this.data.draft = value;
      });
    },
    clearDraft() {
      this.data.draft = {
        items: [],
        customerId: '',
        discount: 0,
        discountSelection: { kind: 'none', id: '' },
        checkoutKey: id('PAY'),
        note: '',
        demographic: 'Không ghi nhận',
      };
    },
    hold() {
      this.require('pos');
      assert(this.data.draft.items.length, 'Chọn sản phẩm trước khi lưu.');
      assert(this.data.held.length < 5, 'Chỉ được lưu tối đa 5 đơn tạm.');
      return this.commit('Lưu đơn tạm', 'Chưa thanh toán, chưa giữ tồn', () => {
        const h = { ...clone(this.data.draft), id: id('TAM'), time: now() };
        this.data.held.unshift(h);
        this.clearDraft();
        return h;
      });
    },
    restoreHeld(heldId) {
      this.require('pos');
      assert(!this.data.draft.items.length, 'Lưu hoặc xóa giỏ hiện tại trước khi mở lại đơn tạm.');
      return this.commit('Mở lại đơn tạm', heldId, () => {
        const h = this.data.held.find((h) => h.id === heldId);
        assert(h, 'Đơn tạm không tồn tại.');
        this.data.draft = clone(h);
        this.data.held = this.data.held.filter((h) => h.id !== heldId);
      });
    },
    deleteHeld(heldId) {
      this.require('pos');
      this.commit('Xóa đơn tạm', heldId, () => {
        this.data.held = this.data.held.filter((h) => h.id !== heldId);
      });
    },
    checkout(options) {
      this.require('pos');
      const { payment, paymentRef = '', confirmed = false, checkoutKey } = options;
      assert(METHODS[payment], 'Chọn đúng một phương thức thanh toán.');
      assert(
        !options.payments && !options.partialPayment && !options.installment,
        'Không chia thanh toán hoặc trả góp. Phải thanh toán toàn bộ một lần.',
      );
      if (checkoutKey) {
        const paid = this.data.orders.find((o) => o.checkoutKey === checkoutKey);
        if (paid) return paid;
      }
      const d = this.data.draft;
      assert(d.items.length, 'Giỏ hàng đang trống.');
      assert(
        !checkoutKey || checkoutKey === d.checkoutKey,
        'Giỏ hàng đã thay đổi. Mở lại màn hình thanh toán.',
      );
      const quote = this.quoteDraft(d);
      assert(
        options.amount === undefined || options.amount === quote.total,
        'Không chấp nhận trả một phần hóa đơn.',
      );
      let received = options.received || 0;
      if (payment === 'cash') {
        received = integer(received, 'Tiền khách đưa');
        assert(
          received >= quote.total,
          'Chưa đủ tiền: khách phải thanh toán đủ toàn bộ hóa đơn trong một lần.',
        );
      } else {
        assert(confirmed, 'Cần xác nhận đã nhận đủ toàn bộ tiền.');
        assert(paymentRef.trim(), 'Nhập mã tham chiếu giao dịch.');
        received = quote.total;
      }
      const customer = this.data.customers.find((c) => c.id === d.customerId);
      assert(!d.customerId || customer?.active, 'Khách hàng không hoạt động.');
      return this.commit('Thanh toán đủ một lần', METHODS[payment], () => {
        const { items, discountRule, ...amounts } = quote;
        const order = {
          id: id('HD'),
          time: now(),
          ...amounts,
          items: items.map((i) => ({ ...i, returnedQty: 0 })),
          customerId: customer?.id || '',
          customer: customer?.name || 'Khách lẻ',
          payment,
          paymentStatus: 'paid',
          paymentCount: 1,
          received,
          change: received - quote.total,
          paymentRef: paymentRef.trim(),
          checkoutKey: d.checkoutKey,
          status: 'completed',
          staffId: this.user.id,
          staffName: this.user.name,
          note: d.note,
          demographic: d.demographic,
          store: clone(this.data.settings),
          branchId: 'CN001',
        };
        items.forEach((i) => this.consumeLots(i.id, i.lotAllocations, order.id));
        if (d.discountSelection?.kind === 'voucher') {
          const voucher = this.data.vouchers.find((v) => v.id === d.discountSelection.id);
          assert(voucher && voucher.used < voucher.limit, 'Voucher đã hết lượt.');
          voucher.used++;
        }
        this.data.orders.unshift(order);
        this.clearDraft();
        return order;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).sales = methods;
})(globalThis);
