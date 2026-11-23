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
      if (draft.discountSelection?.kind === 'voucher')
        quotes.push(this.quoteDraft(draft, { singleRule: true }));

      // Cộng dồn trên giá gốc; phân bổ lại khi tổng ưu đãi vượt giá trị một dòng hàng.
      // Mỗi ưu đãi vẫn giữ đúng phạm vi, mức tối thiểu và trần giảm riêng.
      const allocations = base.items.map((item, index) => {
        const weights = quotes.map((q) => q.items[index].lineDiscount);
        return distribute(
          Math.min(item.qty * item.price, weights.reduce((sum, n) => sum + n, 0)),
          weights,
        );
      });
      const appliedPromotions = quotes
        .map((q, quoteIndex) => {
          const lines = base.items
            .map((item, index) => ({ id: item.id, discount: allocations[index][quoteIndex] }))
            .filter((line) => line.discount > 0);
          return {
            id: q.discountRule.id,
            kind: q.discountSelection.kind,
            name: q.discountLabel,
            discount: lines.reduce((sum, line) => sum + line.discount, 0),
            productIds: lines.map((line) => line.id),
            lines,
          };
        })
        .filter((rule) => rule.discount > 0);
      const lineDiscounts = allocations.map((amounts) => amounts.reduce((sum, n) => sum + n, 0));
      const discount = lineDiscounts.reduce((sum, n) => sum + n, 0);
      const t = totals(base.items, discount, this.data.settings.taxRate);
      const nets = base.items.map((item, index) => item.qty * item.price - lineDiscounts[index]);
      const taxes = distribute(t.tax, nets);
      const items = base.items.map((item, index) => ({
        ...item,
        lineDiscount: lineDiscounts[index],
        lineTax: taxes[index],
        paidTotal: nets[index] + taxes[index],
        appliedPromotions: appliedPromotions
          .filter((rule) => rule.productIds.includes(item.id))
          .map((rule) => ({
            id: rule.id,
            name: rule.name,
            discount: rule.lines.find((line) => line.id === item.id).discount,
          })),
      }));
      const discountRules = quotes
        .filter((q) => appliedPromotions.some((rule) => rule.id === q.discountRule.id))
        .map((q) => clone(q.discountRule));
      return {
        ...t,
        items,
        appliedPromotions,
        discountRules,
        discountRule: discountRules.length === 1 ? clone(discountRules[0]) : null,
        discountLabel: appliedPromotions.length
          ? appliedPromotions.map((rule) => rule.name).join(' + ')
          : 'Chưa có chương trình đủ điều kiện',
        discountSelection: clone(draft.discountSelection || { kind: 'auto', id: '' }),
      };
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = methods;
  else (scope.Retail.storeModules ||= {}).promotionCombinations = methods;
})(globalThis);
