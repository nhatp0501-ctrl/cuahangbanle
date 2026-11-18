(function (scope) {
  'use strict';
  const { assert, integer, now, today } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const methods = {
    auditInvoices(auditId, productId) {
      this.require('inventory');
      const a = this.data.audits.find((a) => a.id === auditId);
      assert(
        a?.items.some((i) => i.productId === productId),
        'Sản phẩm không thuộc phiên kiểm kê.',
      );
      return this.data.orders
        .filter(
          (o) =>
            o.status !== 'cancelled' && o.time <= a.time && o.items.some((i) => i.id === productId),
        )
        .map((o) => ({
          id: o.id,
          time: o.time,
          customer: o.customer,
          staff: o.staffName,
          qty: o.items.find((i) => i.id === productId).qty,
          amount: o.items.find((i) => i.id === productId).paidTotal,
        }));
    },
    reviewAuditInvoices(auditId, productId, note) {
      this.require('inventory');
      assert(note?.trim(), 'Ghi kết quả đối chiếu hóa đơn / chứng từ.');
      const invoices = this.auditInvoices(auditId, productId);
      return this.commit('Đối chiếu hóa đơn kiểm kê', productId, () => {
        const a = this.data.audits.find((a) => a.id === auditId);
        assert(
          a.status === 'counting' && (this.user.role === 'ADMIN' || a.actorId === this.user.id),
          'Không được sửa phiên này.',
        );
        a.items
          .filter((i) => i.productId === productId)
          .forEach((i) => {
            i.invoiceReview = {
              time: now(),
              actor: this.user.name,
              note: note.trim(),
              invoiceIds: invoices.map((o) => o.id),
            };
          });
      });
    },
    recountAuditLot(auditId, lotId, qty, damagedQty, note) {
      this.require('inventory');
      assert(note?.trim(), 'Ghi kết luận đếm lại và hướng xử lý thiếu/thừa.');
      return this.commit('Chốt số thực đếm lại', lotId, () => {
        const a = this.data.audits.find((a) => a.id === auditId);
        assert(
          a?.status === 'counting' && (this.user.role === 'ADMIN' || a.actorId === this.user.id),
          'Không được sửa phiên này.',
        );
        const i = a.items.find((i) => i.lotId === lotId);
        assert(
          i && i.countedQty !== null && i.invoiceReview,
          'Lưu lần đếm đầu và đối chiếu hóa đơn trước khi chốt đếm lại.',
        );
        const finalQty = integer(qty, 'Số lượng chốt sau đếm lại');
        const finalDamaged = integer(damagedQty, 'Hỏng/cách ly', 0, finalQty);
        (i.countHistory ||= []).push({
          time: now(),
          actor: this.user.name,
          firstQty: i.countedQty,
          finalQty,
          damagedQty: finalDamaged,
          note: note.trim(),
        });
        i.countedQty = finalQty;
        i.damagedQty = finalDamaged;
        i.reason = note.trim();
        i.recountConfirmed = true;
        i.discrepancyStatus =
          finalQty === i.bookQty && finalDamaged === i.bookBlocked
            ? 'matched_after_recount'
            : 'awaiting_admin';
      });
    },
    monthEndSummary(month = today().slice(0, 7)) {
      assert(/^\d{4}-(0[1-9]|1[0-2])$/.test(month), 'Tháng không hợp lệ.');
      const monthOf = (time) =>
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Ho_Chi_Minh',
          year: 'numeric',
          month: '2-digit',
        })
          .format(new Date(time))
          .slice(0, 7);
      const orders = this.data.orders.filter(
        (o) => o.status !== 'cancelled' && monthOf(o.time) === month,
      );
      const losses = this.data.audits
        .filter((a) => a.status === 'approved' && monthOf(a.resolvedAt) === month)
        .flatMap((a) =>
          a.items
            .filter((i) => i.lossValue > 0)
            .map((i) => ({
              auditId: a.id,
              productId: i.productId,
              name: i.name,
              lotCode: i.lotCode,
              qty: Math.max(0, -i.delta),
              unitValue: i.salePrice ?? i.cost,
              amount: i.lossValue,
              time: a.resolvedAt,
            })),
        );
      const gross = orders.reduce((s, o) => s + o.total, 0);
      const loss = losses.reduce((s, i) => s + i.amount, 0);
      const historicalAdjustment = this.data.returns
        .filter((r) => r.status === 'approved' && r.resolvedAt && monthOf(r.resolvedAt) === month)
        .reduce((s, r) => s + r.amount, 0);
      return {
        month,
        orders,
        gross,
        loss,
        losses,
        historicalAdjustment,
        afterLoss: gross - historicalAdjustment - loss,
      };
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).reconciliation = methods;
})(globalThis);
