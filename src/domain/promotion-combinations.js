(function (scope) {
  'use strict';
  const { clone } =
    typeof module !== 'undefined' && module.exports ? require('./config.js') : scope.Retail;
  const { totals, allocateInteger: distribute } =
    typeof module !== 'undefined' && module.exports ? require('./calculations.js') : scope.Retail;
  const methods = {
    quotePromotions(draft, rules) {
      const base = this.quoteDraft({ ...draft, discountSelection: { kind: 'none', id: '' } });
      const quotes = [];
      for (const rule of rules) {
        try {
          quotes.push(
            this.quoteDraft({ ...draft, discountSelection: { kind: 'promotion', id: rule.id } }),
          );
        } catch {
          /* Ưu đãi chưa đủ điều kiện không làm chặn các chương trình khác. */
        }
      }
      let usable = quotes,
        groups = [];
      // Mỗi mã hàng chỉ thuộc một chương trình. Tính lại trần/mức tối thiểu
      // cho đúng nhóm hàng thực sự được giảm, thay vì cộng các báo giá chồng lấn.
      while (usable.length) {
        const assignments = new Map();
        base.items.forEach((item, index) => {
          let best = null;
          for (const q of usable)
            if (
              q.items[index].lineDiscount > 0 &&
              (!best || q.items[index].lineDiscount > best.items[index].lineDiscount)
            )
              best = q;
          if (best) {
            const group = assignments.get(best.discountRule.id) || [];
            group.push(item.id);
            assignments.set(best.discountRule.id, group);
          }
        });
        const invalid = new Set();
        groups = [];
        for (const [ruleId, ids] of assignments) {
          try {
            groups.push(
              this.quoteDraft({
                ...draft,
                items: draft.items.filter((i) => ids.includes(i.id)),
                discountSelection: { kind: 'promotion', id: ruleId },
              }),
            );
          } catch {
            invalid.add(ruleId);
          }
        }
        if (!invalid.size) break;
        usable = usable.filter((q) => !invalid.has(q.discountRule.id));
        groups = [];
      }
      const grouped = groups.reduce((sum, q) => sum + q.discount, 0);
      const bestSingle = quotes.reduce(
        (best, q) => (!best || q.discount > best.discount ? q : best),
        null,
      );
      // Nếu tách hàng làm mất điều kiện đơn tối thiểu của một chương trình,
      // thử giữ nguyên chương trình đó rồi tiếp tục giảm cho các mã hàng còn lại.
      const anchored = [],
        usedRules = new Set(),
        remaining = new Set(base.items.map((i) => i.id));
      let next = bestSingle;
      while (next) {
        anchored.push(next);
        usedRules.add(next.discountRule.id);
        next.items.filter((i) => i.lineDiscount > 0).forEach((i) => remaining.delete(i.id));
        next = null;
        if (!remaining.size) break;
        for (const rule of rules.filter((r) => !usedRules.has(r.id))) {
          try {
            const q = this.quoteDraft({
              ...draft,
              items: draft.items.filter((i) => remaining.has(i.id)),
              discountSelection: { kind: 'promotion', id: rule.id },
            });
            if (!next || q.discount > next.discount) next = q;
          } catch {
            /* Phần hàng còn lại chưa đạt điều kiện chương trình. */
          }
        }
      }
      if (anchored.reduce((sum, q) => sum + q.discount, 0) > grouped) groups = anchored;
      const discounts = new Map(),
        appliedPromotions = [];
      for (const q of groups) {
        const lines = q.items.filter((i) => i.lineDiscount > 0);
        appliedPromotions.push({
          id: q.discountRule.id,
          name: q.discountRule.name,
          discount: q.discount,
          productIds: lines.map((i) => i.id),
          lines: lines.map((i) => ({ id: i.id, discount: i.lineDiscount })),
        });
        lines.forEach((i) =>
          discounts.set(i.id, {
            amount: i.lineDiscount,
            id: q.discountRule.id,
            name: q.discountRule.name,
          }),
        );
      }
      const discount = [...discounts.values()].reduce((sum, i) => sum + i.amount, 0);
      const t = totals(base.items, discount, this.data.settings.taxRate);
      const nets = base.items.map((i) => i.qty * i.price - (discounts.get(i.id)?.amount || 0));
      const taxes = distribute(t.tax, nets);
      const items = base.items.map((item, index) => ({
        ...item,
        lineDiscount: discounts.get(item.id)?.amount || 0,
        lineTax: taxes[index],
        paidTotal: nets[index] + taxes[index],
        appliedPromotion: discounts.has(item.id) ? clone(discounts.get(item.id)) : null,
      }));
      return {
        ...t,
        items,
        appliedPromotions,
        discountRules: groups.map((q) => clone(q.discountRule)),
        discountRule: groups.length === 1 ? clone(groups[0].discountRule) : null,
        discountLabel: appliedPromotions.length
          ? appliedPromotions.map((r) => r.name).join(' + ')
          : 'Chưa có chương trình đủ điều kiện',
        discountSelection: clone(draft.discountSelection || { kind: 'auto', id: '' }),
      };
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).promotionCombinations = methods;
})(globalThis);
