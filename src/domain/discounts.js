(function (scope) {
  'use strict';
  const { assert, integer, id, clone, today, validDate, now } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { totals, allocateInteger: allocate } =
    typeof module !== 'undefined' && module.exports ? require('./calculations.js') : scope.Retail;
  const methods = {
    quoteDraft(draft = this.data.draft, { singleRule = false } = {}) {
      const selection = draft.discountSelection || { kind: 'none', id: '' };
      if (
        ['auto', 'promotions'].includes(selection.kind) ||
        (selection.kind === 'voucher' && !singleRule)
      )
        return this.quotePromotions(
          draft,
          this.data.promotions.filter(
            (p) => selection.kind !== 'promotions' || selection.ids?.includes(p.id),
          ),
        );
      assert(['none', 'voucher', 'promotion'].includes(selection.kind), 'Chọn một loại giảm giá.');
      const items = draft.items.map((i) => {
        const p = this.data.products.find((p) => p.id === i.id);
        assert(p?.active, 'Mặt hàng không còn kinh doanh.');
        integer(i.qty, 'Số lượng', 1);
        assert(i.price === p.price, `Giá ${p.name} đã đổi. Hãy chọn lại sản phẩm.`);
        return {
          ...clone(i),
          image: p.image,
          cost: p.cost,
          category: p.category,
          lotAllocations: this.allocateLots(p.id, i.qty),
        };
      });
      const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
      let discount = 0,
        label = 'Không giảm giá',
        rule = null;
      const eligible = items.map((i) => i.qty * i.price);
      let quantityWeights = null;
      if (selection.kind !== 'none') {
        rule = (selection.kind === 'voucher' ? this.data.vouchers : this.data.promotions).find(
          (r) => r.id === selection.id,
        );
        assert(rule && rule.active, 'Voucher/chương trình không còn hoạt động.');
        assert(
          rule.startsOn <= today() && rule.endsOn >= today(),
          'Voucher/chương trình chưa bắt đầu hoặc đã hết hạn.',
        );
        assert(
          subtotal >= rule.minSpend,
          `Hóa đơn chưa đạt mức tối thiểu ${rule.minSpend.toLocaleString('vi-VN')}đ.`,
        );
        if (selection.kind === 'voucher') {
          assert(rule.used < rule.limit, 'Voucher đã hết lượt sử dụng.');
          if (rule.source === 'partner')
            items.forEach((i, index) => {
              const product = this.data.products.find((p) => p.id === i.id);
              eligible[index] =
                product?.supplierId === rule.partnerSupplierId &&
                (!rule.productIds?.length || rule.productIds.includes(i.id))
                  ? i.qty * i.price
                  : 0;
            });
        } else
          items.forEach((i, index) => {
            eligible[index] = rule.productIds.includes(i.id)
              ? i.lotAllocations
                  .filter((l) => !rule.lotIds.length || rule.lotIds.includes(l.lotId))
                  .reduce((a, l) => a + l.qty * i.price, 0)
              : 0;
          });
        const base = eligible.reduce((a, n) => a + n, 0);
        assert(base > 0, 'Giỏ hàng không có sản phẩm/lô thuộc chương trình.');
        assert(base >= rule.minSpend, 'Giá trị hàng thuộc phạm vi ưu đãi chưa đạt mức tối thiểu.');
        if (rule.type === 'quantity')
          quantityWeights = items.map((item, n) => {
            const groups = item.price > 0 ? Math.floor(eligible[n] / item.price / rule.buyQty) : 0;
            return groups * Math.min(rule.buyQty * item.price, rule.value);
          });
        const quantityDiscount = quantityWeights?.reduce((sum, amount) => sum + amount, 0) || 0;
        if (rule.type === 'quantity')
          assert(
            quantityDiscount > 0,
            `Cần mua đủ ${rule.buyQty} sản phẩm cùng mã thuộc chương trình.`,
          );
        discount = Math.min(
          base,
          rule.type === 'quantity'
            ? quantityDiscount
            : rule.type === 'percent'
              ? Math.floor((base * rule.value) / 100)
              : rule.value,
          rule.maxDiscount || Number.MAX_SAFE_INTEGER,
        );
        assert(
          discount >= 1000,
          'Số tiền giảm thực tế phải từ 1.000đ. Mua thêm hàng đủ điều kiện.',
        );
        label = selection.kind === 'voucher' ? `Voucher ${rule.code}` : rule.name;
      }
      const t = totals(items, discount, this.data.settings.taxRate);
      const discounts = allocate(discount, quantityWeights || eligible),
        nets = items.map((i, n) => i.qty * i.price - discounts[n]),
        taxes = allocate(t.tax, nets);
      items.forEach((i, n) => {
        i.lineDiscount = discounts[n];
        i.lineTax = taxes[n];
        i.paidTotal = nets[n] + taxes[n];
      });
      return {
        ...t,
        items,
        discountLabel: label,
        discountSelection: clone(selection),
        discountRule: rule ? clone(rule) : null,
      };
    },
    upsertDiscount(kind, values) {
      this.admin();
      assert(['voucher', 'promotion'].includes(kind), 'Loại giảm giá không hợp lệ.');
      const v = clone(values),
        list = kind === 'voucher' ? this.data.vouchers : this.data.promotions;
      assert(v.name?.trim(), 'Nhập tên.');
      assert(
        (kind === 'promotion' ? ['fixed', 'percent', 'quantity'] : ['fixed', 'percent']).includes(
          v.type,
        ),
        'Chọn cách giảm hợp lệ.',
      );
      v.value = integer(
        v.value,
        'Mức giảm',
        v.type === 'percent' ? 1 : 1000,
        v.type === 'percent' ? 100 : 1000000000,
      );
      if (v.type === 'quantity') v.buyQty = integer(v.buyQty, 'Số lượng mỗi nhóm', 2, 100000);
      v.minSpend = integer(v.minSpend, 'Giá trị tối thiểu');
      v.maxDiscount = integer(v.maxDiscount || 0, 'Giảm tối đa');
      assert(!v.maxDiscount || v.maxDiscount >= 1000, 'Trần giảm giá phải từ 1.000đ hoặc bằng 0.');
      assert(
        validDate(v.startsOn) && validDate(v.endsOn) && v.startsOn <= v.endsOn,
        'Khoảng thời gian không hợp lệ.',
      );
      v.active = !!v.active;
      if (kind === 'voucher') {
        v.code = v.code?.trim().toUpperCase();
        assert(v.code && /^[A-Z0-9_-]{3,40}$/.test(v.code), 'Mã voucher 3–40 ký tự chữ/số.');
        assert(!list.some((r) => r.id !== v.id && r.code === v.code), 'Mã voucher trùng.');
        v.limit = integer(v.limit, 'Số lượt', 1);
        assert(['store', 'partner'].includes(v.source), 'Chọn nguồn voucher.');
        if (v.source === 'partner') {
          const partner = this.data.suppliers.find((s) => s.id === v.partnerSupplierId && s.active);
          assert(partner, 'Chọn nhà cung cấp/đối tác voucher.');
          v.partner = partner.name;
          v.productIds ||= [];
          assert(
            v.productIds.every((pid) =>
              this.data.products.some((p) => p.id === pid && p.supplierId === partner.id),
            ),
            'Voucher đối tác chỉ áp dụng sản phẩm của đối tác đó.',
          );
        } else {
          v.partnerSupplierId = '';
          v.productIds = [];
        }
      } else {
        assert(Array.isArray(v.productIds) && v.productIds.length, 'Chọn sản phẩm áp dụng.');
        assert(
          v.productIds.every((pid) => this.data.products.some((p) => p.id === pid && p.active)),
          'Sản phẩm áp dụng không hợp lệ.',
        );
        v.lotIds ||= [];
        assert(
          v.lotIds.every((lid) => {
            const l = this.data.lots.find((l) => l.id === lid);
            return l && v.productIds.includes(l.productId) && this.lotStatus(l) === 'near';
          }),
          'Chọn đúng lô cận date đang còn hạn.',
        );
      }
      return this.commit(
        'Lưu ' + (kind === 'voucher' ? 'voucher' : 'chương trình khuyến mãi'),
        v.name,
        () => {
          let r = v.id ? list.find((r) => r.id === v.id) : null;
          assert(!v.id || r, 'Không tìm thấy chương trình.');
          if (r) {
            if (kind === 'voucher')
              assert(v.limit >= r.used, 'Số lượt không được nhỏ hơn đã dùng.');
            Object.assign(r, v);
          } else {
            r = { ...v, id: id(kind === 'voucher' ? 'VC' : 'KM'), used: 0, createdAt: now() };
            list.push(r);
          }
          return r;
        },
      );
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).discounts = methods;
})(globalThis);
