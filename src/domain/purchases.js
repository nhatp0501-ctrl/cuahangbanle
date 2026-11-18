(function (scope) {
  'use strict';
  const { assert, integer, id, now, today, validDate } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const methods = {
    createPurchase(supplierId, lines, note, status = 'submitted') {
      this.require('purchases');
      assert(['draft', 'submitted'].includes(status), 'Lập nháp hoặc gửi yêu cầu admin duyệt.');
      const supplier = this.data.suppliers.find((s) => s.id === supplierId && s.active);
      assert(supplier, 'Nhà cung cấp không hoạt động.');
      assert(
        lines.length && new Set(lines.map((i) => i.id)).size === lines.length,
        'Chọn các mặt hàng không trùng.',
      );
      const items = lines.map((i) => {
        const p = this.data.products.find(
          (p) => p.id === i.id && p.supplierId === supplierId && p.active,
        );
        assert(p, 'Mặt hàng không thuộc nhà cung cấp hoặc ngừng bán.');
        assert(
          this.supplierAcceptsProduct(supplierId, p),
          'Mặt hàng không đúng thương hiệu/phạm vi cung cấp của NCC.',
        );
        return {
          id: p.id,
          name: p.name,
          image: p.image,
          qty: integer(i.qty, 'Số lượng đề nghị', 1),
          price: integer(i.price, 'Giá nhập'),
          receivedQty: 0,
          rejectedQty: 0,
        };
      });
      return this.commit('Lập yêu cầu nhập hàng', supplier.name, () => {
        const p = {
          id: id('PN'),
          time: now(),
          supplierId,
          supplier: supplier.name,
          items,
          total: items.reduce((a, i) => a + i.qty * i.price, 0),
          note: note || '',
          status,
          actor: this.user.name,
          creatorId: this.user.id,
          receiptIds: [],
        };
        this.data.purchases.unshift(p);
        return p;
      });
    },
    submitPurchase(purchaseId) {
      this.require('purchases');
      return this.commit('Gửi admin duyệt yêu cầu nhập', purchaseId, () => {
        const p = this.data.purchases.find((p) => p.id === purchaseId);
        assert(p && p.status === 'draft', 'Chỉ gửi phiếu nháp.');
        assert(
          this.user.role === 'ADMIN' || p.creatorId === this.user.id,
          'Chỉ gửi phiếu của mình.',
        );
        p.status = 'submitted';
        p.submittedAt = now();
      });
    },
    reviewPurchase(purchaseId, approved, note) {
      this.admin();
      assert(note?.trim(), 'Nhập ý kiến kiểm duyệt.');
      return this.commit(
        approved ? 'Duyệt yêu cầu nhập' : 'Từ chối yêu cầu nhập',
        purchaseId,
        () => {
          const p = this.data.purchases.find((p) => p.id === purchaseId);
          assert(p && p.status === 'submitted', 'Phiếu không ở trạng thái chờ admin duyệt.');
          assert(
            !approved || this.data.suppliers.find((s) => s.id === p.supplierId)?.active,
            'Nhà cung cấp không hoạt động.',
          );
          assert(
            !approved ||
              p.items.every((i) => {
                const product = this.data.products.find((x) => x.id === i.id);
                return (
                  product?.supplierId === p.supplierId &&
                  this.supplierAcceptsProduct(p.supplierId, product)
                );
              }),
            'Phiếu có sản phẩm không thuộc NCC. Hủy yêu cầu sai và lập lại với đúng nhà cung cấp.',
          );
          p.status = approved ? 'approved' : 'rejected';
          p.reviewNote = note.trim();
          p.reviewedAt = now();
          p.reviewer = this.user.name;
        },
      );
    },
    cancelPurchase(purchaseId, note) {
      this.require('purchases');
      assert(note?.trim(), 'Nhập lý do hủy.');
      return this.commit('Hủy yêu cầu nhập', purchaseId, () => {
        const p = this.data.purchases.find((p) => p.id === purchaseId);
        assert(
          p && ['draft', 'submitted', 'approved'].includes(p.status),
          'Không thể hủy phiếu đã phát sinh nhận hàng.',
        );
        assert(
          this.user.role === 'ADMIN' || (p.creatorId === this.user.id && p.status === 'draft'),
          'Kho chỉ được hủy phiếu nháp của mình.',
        );
        p.status = 'cancelled';
        p.closeNote = note;
        p.closedAt = now();
      });
    },
    reportPurchaseReceipt(purchaseId, lines, { deliveryRef, note = '' }) {
      this.require('purchases');
      assert(deliveryRef?.trim(), 'Nhập số phiếu giao hàng của nhà cung cấp.');
      const p = this.data.purchases.find((p) => p.id === purchaseId);
      assert(
        p && ['approved', 'partially_received'].includes(p.status),
        'Chỉ ghi nhận hàng sau khi admin đã duyệt yêu cầu.',
      );
      assert(
        !this.data.purchaseReceipts.some((r) => r.purchaseId === p.id && r.status === 'submitted'),
        'Đã có biên bản thực nhận chờ admin.',
      );
      assert(
        lines.length === p.items.length && new Set(lines.map((i) => i.id)).size === lines.length,
        'Đối chiếu đầy đủ các mặt hàng của phiếu.',
      );
      const items = lines.map((l) => {
        const ordered = p.items.find((i) => i.id === l.id);
        assert(ordered, 'Mặt hàng không thuộc phiếu.');
        this.assertUnlocked(l.id);
        const product = this.data.products.find((i) => i.id === l.id);
        const remaining = Math.max(0, ordered.qty - ordered.receivedQty);
        const actual = integer(l.actualQty, 'Số giao thực tế'),
          rejected = integer(l.rejectedQty || 0, 'Số không đạt', 0, actual),
          accepted = actual - rejected;
        assert(!accepted || l.lotCode?.trim(), 'Nhập mã lô hàng thực nhận.');
        assert(
          !accepted ||
            !product.tracksExpiry ||
            (validDate(l.expiryDate) && l.expiryDate >= today()),
          'Hàng đạt nhập kho phải có HSD hợp lệ, chưa hết hạn.',
        );
        assert(
          !(actual !== remaining || rejected) || l.reason?.trim(),
          'Giải trình hàng thiếu, giao dư hoặc không đạt.',
        );
        return {
          id: ordered.id,
          name: ordered.name,
          price: ordered.price,
          orderedQty: ordered.qty,
          previouslyReceived: ordered.receivedQty,
          actualQty: actual,
          rejectedQty: rejected,
          acceptedQty: accepted,
          remainingAfter: Math.max(0, remaining - accepted),
          surplusQty: Math.max(0, accepted - remaining),
          lotCode: l.lotCode?.trim() || '',
          expiryDate: l.expiryDate || null,
          reason: l.reason?.trim() || '',
        };
      });
      return this.commit('Gửi biên bản thực nhận lên admin', p.id, () => {
        const r = {
          id: id('BN'),
          purchaseId: p.id,
          time: now(),
          status: 'submitted',
          deliveryRef: deliveryRef.trim(),
          note,
          items,
          actor: this.user.name,
          actorId: this.user.id,
        };
        this.data.purchaseReceipts.unshift(r);
        p.receiptIds.push(r.id);
        p.status = 'receipt_pending';
        return r;
      });
    },
    reviewPurchaseReceipt(receiptId, approved, note, surplusDecision = '') {
      this.admin();
      assert(note?.trim(), 'Nhập kết luận đối chiếu thực nhận.');
      return this.commit(
        approved ? 'Duyệt số hàng thực nhận' : 'Yêu cầu sửa biên bản nhận hàng',
        receiptId,
        () => {
          const r = this.data.purchaseReceipts.find((r) => r.id === receiptId);
          assert(r && r.status === 'submitted', 'Biên bản đã được xử lý hoặc không tồn tại.');
          const p = this.data.purchases.find((p) => p.id === r.purchaseId);
          assert(p?.status === 'receipt_pending', 'Phiếu không chờ đối chiếu thực nhận.');
          if (approved) {
            for (const item of r.items) {
              const ordered = p.items.find((i) => i.id === item.id);
              assert(
                ordered.receivedQty === item.previouslyReceived,
                'Số đã nhận thay đổi; cần lập lại biên bản.',
              );
              const surplus = Math.max(
                0,
                item.acceptedQty - Math.max(0, ordered.qty - ordered.receivedQty),
              );
              assert(
                !surplus || ['accept', 'send_back'].includes(surplusDecision),
                'Giao dư: admin phải chọn nhận bổ sung hoặc giao lại NCC.',
              );
              item.surplusDecision = surplus ? surplusDecision : '';
              item.sentBackQty = surplusDecision === 'send_back' ? surplus : 0;
              item.approvedQty = item.acceptedQty - item.sentBackQty;
              if (item.approvedQty) {
                const product = this.data.products.find((p) => p.id === item.id);
                assert(
                  !product.tracksExpiry || item.expiryDate >= today(),
                  'Lô đã hết hạn khi admin duyệt.',
                );
                this.addLot(item.id, {
                  qty: item.approvedQty,
                  expiryDate: item.expiryDate,
                  code: item.lotCode,
                  sourceId: r.id,
                });
                product.cost = item.price;
                ordered.receivedQty += item.approvedQty;
              }
              ordered.rejectedQty += item.rejectedQty;
            }
            r.status = 'approved';
            p.status = p.items.every((i) => i.receivedQty >= i.qty)
              ? 'received'
              : 'partially_received';
          } else {
            r.status = 'rejected';
            p.status = p.items.some((i) => i.receivedQty > 0) ? 'partially_received' : 'approved';
          }
          r.reviewNote = note.trim();
          r.reviewedAt = now();
          r.reviewer = this.user.name;
          p.lastReceiptAt = now();
          p.receivedValue = p.items.reduce((sum, i) => sum + i.receivedQty * i.price, 0);
          p.surplusValue = p.items.reduce(
            (sum, i) => sum + Math.max(0, i.receivedQty - i.qty) * i.price,
            0,
          );
          return r;
        },
      );
    },
    closePurchaseShort(purchaseId, note) {
      this.admin();
      assert(note?.trim(), 'Nhập xác nhận của nhà cung cấp và cách xử lý lượng thiếu.');
      return this.commit('Chốt đơn nhập còn thiếu', purchaseId, () => {
        const p = this.data.purchases.find((p) => p.id === purchaseId);
        assert(
          p && ['approved', 'partially_received'].includes(p.status),
          'Chỉ chốt phiếu đang chờ hàng hoặc nhận thiếu.',
        );
        p.status = 'closed_short';
        p.closeNote = note.trim();
        p.closedAt = now();
        p.closedBy = this.user.name;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).purchases = methods;
})(globalThis);
