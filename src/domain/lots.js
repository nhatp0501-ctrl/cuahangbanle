(function (scope) {
  'use strict';
  const { assert, integer, id, now, today, validDate, addDays } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const methods = {
    inventoryLock(productId) {
      return this.data.audits.find(
        (a) =>
          ['counting', 'submitted'].includes(a.status) &&
          a.items.some((i) => i.productId === productId),
      );
    },
    assertUnlocked(productId) {
      const lock = this.inventoryLock(productId);
      assert(
        !lock,
        `Mặt hàng đang khóa kiểm kê trong phiếu ${lock?.id}. Hoàn tất hoặc hủy kiểm kê trước khi xuất/nhập.`,
      );
    },
    lotStatus(lot) {
      const p = this.data.products.find((p) => p.id === lot.productId);
      if (p?.tracksExpiry && !lot.expiryDate) return 'unknown';
      if (lot.expiryDate && lot.expiryDate < today()) return 'expired';
      if (lot.expiryDate && lot.expiryDate <= addDays(this.data.settings.nearExpiryDays || 30))
        return 'near';
      return 'good';
    },
    saleableStock(productId) {
      return this.data.lots
        .filter((l) => l.productId === productId && ['good', 'near'].includes(this.lotStatus(l)))
        .reduce((a, l) => a + l.qty - l.blockedQty, 0);
    },
    allocateLots(productId, qty) {
      integer(qty, 'Số lượng', 1);
      this.assertUnlocked(productId);
      const p = this.data.products.find((p) => p.id === productId);
      assert(p?.active, 'Mặt hàng đã ngừng kinh doanh.');
      const lots = this.data.lots
        .filter(
          (l) =>
            l.productId === productId &&
            ['good', 'near'].includes(this.lotStatus(l)) &&
            l.qty > l.blockedQty,
        )
        .sort(
          (a, b) =>
            (a.expiryDate || '9999').localeCompare(b.expiryDate || '9999') ||
            a.receivedAt.localeCompare(b.receivedAt),
        );
      let remaining = qty;
      const result = [];
      for (const l of lots) {
        const take = Math.min(remaining, l.qty - l.blockedQty);
        if (take) {
          result.push({ lotId: l.id, lotCode: l.code, expiryDate: l.expiryDate, qty: take });
          remaining -= take;
        }
        if (!remaining) break;
      }
      assert(
        !remaining,
        `${p.name} chỉ còn ${this.saleableStock(productId)} sản phẩm đủ điều kiện bán (không tính hàng hết hạn, hỏng hoặc chưa rõ HSD).`,
      );
      return result;
    },
    stockMovement(productId, delta, reason, reference, lotId = '') {
      const p = this.data.products.find((p) => p.id === productId);
      assert(p, 'Sản phẩm không tồn tại.');
      integer(p.stock + delta, 'Tồn kho');
      p.stock += delta;
      this.data.movements.unshift({
        id: id('GD'),
        time: now(),
        productId,
        productName: p.name,
        delta,
        balance: p.stock,
        reason,
        reference,
        lotId,
        actor: this.user?.name || 'Hệ thống',
      });
    },
    addLot(productId, { qty, expiryDate, code, blockedQty = 0, sourceId }) {
      this.admin();
      this.assertUnlocked(productId);
      const p = this.data.products.find((p) => p.id === productId);
      assert(p, 'Sản phẩm không tồn tại.');
      qty = integer(qty, 'Số lượng lô', 1);
      blockedQty = integer(blockedQty, 'Hàng cách ly', 0, qty);
      assert(!p.tracksExpiry || validDate(expiryDate), 'Nhập ngày hết hạn hợp lệ cho lô hàng.');
      assert(!expiryDate || validDate(expiryDate), 'Hạn sử dụng không hợp lệ.');
      assert(code?.trim(), 'Nhập mã lô thực tế.');
      const l = {
        id: id('LO'),
        productId,
        qty,
        blockedQty,
        code: code.trim(),
        expiryDate: expiryDate || null,
        sourceId,
        receivedAt: now(),
      };
      this.data.lots.push(l);
      this.stockMovement(productId, qty, 'Nhập lô hàng', sourceId, l.id);
      return l;
    },
    consumeLots(productId, allocations, reference) {
      this.assertUnlocked(productId);
      for (const allocation of allocations) {
        const l = this.data.lots.find(
          (l) => l.id === allocation.lotId && l.productId === productId,
        );
        assert(
          l &&
            ['good', 'near'].includes(this.lotStatus(l)) &&
            l.qty - l.blockedQty >= allocation.qty,
          'Tồn lô hoặc hạn sử dụng đã thay đổi.',
        );
        l.qty -= allocation.qty;
        this.stockMovement(productId, -allocation.qty, 'Bán hàng FEFO', reference, l.id);
      }
    },
    restoreReturnStock(original, qty, previouslyReturned, reference) {
      this.assertUnlocked(original.id);
      let skip = previouslyReturned,
        remaining = qty;
      for (const allocation of original.lotAllocations || []) {
        const ignored = Math.min(skip, allocation.qty);
        skip -= ignored;
        const take = Math.min(remaining, allocation.qty - ignored);
        if (!take) continue;
        let lot = this.data.lots.find((l) => l.id === allocation.lotId);
        if (!lot) {
          lot = {
            id: id('LO'),
            productId: original.id,
            code: allocation.lotCode,
            expiryDate: allocation.expiryDate || null,
            qty: 0,
            blockedQty: 0,
            receivedAt: now(),
            sourceId: reference,
          };
          this.data.lots.push(lot);
        }
        lot.qty += take;
        if (!['good', 'near'].includes(this.lotStatus(lot))) lot.blockedQty += take;
        this.stockMovement(original.id, take, 'Nhận lại lô hàng trả', reference, lot.id);
        remaining -= take;
        if (!remaining) break;
      }
      if (remaining) {
        const lot = {
          id: id('LO'),
          productId: original.id,
          code: 'TRA-CHUA-XAC-MINH',
          expiryDate: null,
          qty: remaining,
          blockedQty: remaining,
          receivedAt: now(),
          sourceId: reference,
          needsExpiry: true,
        };
        this.data.lots.push(lot);
        this.stockMovement(
          original.id,
          remaining,
          'Hàng trả cách ly chờ xác minh lô',
          reference,
          lot.id,
        );
      }
    },
    setLotExpiry(lotId, expiryDate, note) {
      this.admin();
      const lot = this.data.lots.find((l) => l.id === lotId);
      assert(lot, 'Lô không tồn tại.');
      assert(validDate(expiryDate), 'Ngày hết hạn không hợp lệ.');
      assert(note?.trim(), 'Nhập căn cứ cập nhật HSD (nhãn bao bì/biên bản).');
      this.assertUnlocked(lot.productId);
      return this.commit('Cập nhật hạn sử dụng', `${lot.code}: ${note}`, () => {
        (lot.expiryChanges ||= []).push({
          before: lot.expiryDate,
          after: expiryDate,
          note: note.trim(),
          actor: this.user.name,
          time: now(),
        });
        lot.expiryDate = expiryDate;
        lot.needsExpiry = false;
        lot.expiryUpdatedBy = this.user.name;
        lot.expiryNote = note;
      });
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).lots = methods;
})(globalThis);
