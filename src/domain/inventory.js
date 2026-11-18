(function (scope) {
  'use strict';
  const { assert, integer, id, now } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const methods = {
    startAudit(productIds, note) {
      this.require('inventory');
      assert(note?.trim(), 'Nhập phạm vi và mục đích kiểm kê.');
      assert(
        productIds.length && new Set(productIds).size === productIds.length,
        'Chọn mặt hàng kiểm kê không trùng.',
      );
      const items = productIds.flatMap((productId) => {
        const p = this.data.products.find((p) => p.id === productId);
        assert(p, 'Mặt hàng không tồn tại.');
        this.assertUnlocked(productId);
        const lots = this.data.lots.filter((l) => l.productId === productId && l.qty > 0);
        assert(lots.length, `${p.name} không có lô tồn để kiểm kê.`);
        return lots.map((l) => ({
          lotId: l.id,
          productId: p.id,
          name: p.name,
          lotCode: l.code,
          expiryDate: l.expiryDate,
          bookQty: l.qty,
          bookBlocked: l.blockedQty,
          cost: p.cost,
          salePrice: p.price,
          countedQty: null,
          damagedQty: 0,
          reason: '',
        }));
      });
      return this.commit('Mở phiên kiểm kê, khóa xuất nhập', note, () => {
        const a = {
          id: id('KK'),
          time: now(),
          actor: this.user.name,
          actorId: this.user.id,
          note: note.trim(),
          status: 'counting',
          items,
        };
        this.data.audits.unshift(a);
        return a;
      });
    },
    saveAuditCount(auditId, lines, submit = false) {
      this.require('inventory');
      return this.commit(
        submit ? 'Gửi kết quả kiểm kê cho admin' : 'Lưu tiến độ đếm hàng',
        auditId,
        () => {
          const a = this.data.audits.find((a) => a.id === auditId);
          assert(a?.status === 'counting', 'Phiếu không ở bước đếm hàng.');
          assert(
            this.user.role === 'ADMIN' || a.actorId === this.user.id,
            'Chỉ cập nhật phiên kiểm kê của mình.',
          );
          assert(
            lines.length === a.items.length &&
              new Set(lines.map((i) => i.lotId)).size === lines.length,
            'Cần khai báo đủ các lô.',
          );
          lines.forEach((input) => {
            const row = a.items.find((i) => i.lotId === input.lotId);
            assert(row, 'Lô không thuộc phiên kiểm kê.');
            if (input.countedQty === '' || input.countedQty === null) {
              assert(!submit, 'Phải đếm đủ các lô trước khi gửi.');
              row.countedQty = null;
              row.damagedQty = 0;
              row.reason = input.reason || '';
              return;
            }
            const counted = integer(input.countedQty, 'Số thực đếm');
            if (counted !== row.countedQty || Number(input.damagedQty || 0) !== row.damagedQty)
              row.recountConfirmed = false;
            row.countedQty = counted;
            row.damagedQty = integer(input.damagedQty || 0, 'Số hỏng/cách ly', 0, row.countedQty);
            row.reason = input.reason?.trim() || '';
            if (row.countedQty !== row.bookQty || row.damagedQty !== row.bookBlocked) {
              row.discrepancyStatus = row.recountConfirmed ? 'awaiting_admin' : 'needs_review';
              row.discrepancyOpenedAt ||= now();
              if (submit)
                assert(
                  row.invoiceReview && row.recountConfirmed,
                  'Có chênh lệch: đối chiếu hóa đơn và chốt đếm lại từng lô trước khi gửi admin.',
                );
            } else row.discrepancyStatus = 'matched';
            if (submit && (row.countedQty !== row.bookQty || row.damagedQty !== row.bookBlocked))
              assert(row.reason, 'Giải trình từng lô có chênh lệch hoặc hàng hỏng.');
          });
          if (submit) {
            assert(
              a.countSaved,
              'Lưu kết quả đếm trước để đối chiếu và giải trình, sau đó mới gửi admin.',
            );
            a.status = 'submitted';
            a.submittedAt = now();
          } else a.countSaved = a.items.every((i) => i.countedQty !== null);
          return a;
        },
      );
    },
    resolveAudit(auditId, decision, note) {
      this.admin();
      assert(
        ['approve', 'recount', 'reject', 'cancel'].includes(decision),
        'Chọn hướng xử lý kiểm kê.',
      );
      assert(note?.trim(), 'Nhập kết luận và hướng xử lý chênh lệch.');
      return this.commit('Xử lý kiểm kê: ' + decision, auditId, () => {
        const a = this.data.audits.find((a) => a.id === auditId);
        assert(
          a && (a.status === 'submitted' || (decision === 'cancel' && a.status === 'counting')),
          'Phiếu không ở trạng thái có thể xử lý.',
        );
        if (decision === 'approve') {
          for (const i of a.items) {
            const lot = this.data.lots.find((l) => l.id === i.lotId);
            assert(
              lot && lot.qty === i.bookQty && lot.blockedQty === i.bookBlocked,
              'Tồn đã thay đổi trong phiên. Cần đếm lại trước khi điều chỉnh.',
            );
            assert(
              i.countedQty !== null && i.countedQty !== undefined,
              'Phải có số thực đếm trước khi duyệt.',
            );
            integer(i.countedQty, 'Số thực đếm');
            const delta = i.countedQty - i.bookQty;
            if (delta || i.damagedQty !== i.bookBlocked)
              assert(i.reason?.trim(), 'Thiếu giải trình chênh lệch.');
            if (delta || i.damagedQty !== i.bookBlocked)
              assert(
                i.invoiceReview && i.recountConfirmed,
                'Phải đối chiếu hóa đơn và đếm lại trước khi duyệt chênh lệch.',
              );
            lot.qty = i.countedQty;
            lot.blockedQty = i.damagedQty;
            this.stockMovement(i.productId, delta, 'Điều chỉnh kiểm kê đã duyệt', a.id, lot.id);
            i.delta = delta;
            i.costLoss = Math.max(0, -delta) * i.cost;
            i.lossValue = Math.max(0, -delta) * (i.salePrice ?? i.cost);
            i.discrepancyStatus = 'resolved';
          }
          a.status = 'approved';
          a.resolvedAt = now();
        } else if (decision === 'recount') {
          a.status = 'counting';
          a.recountNote = note.trim();
          a.recountTimes = (a.recountTimes || 0) + 1;
          a.countSaved = false;
          a.items.forEach((i) => {
            i.countedQty = null;
            i.damagedQty = 0;
            i.reason = '';
            i.recountConfirmed = false;
            delete i.invoiceReview;
          });
        } else {
          a.status = decision === 'cancel' ? 'cancelled' : 'rejected';
          a.resolvedAt = now();
        }
        a.reviewNote = note.trim();
        a.reviewer = this.user.name;
        return a;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).inventory = methods;
})(globalThis);
