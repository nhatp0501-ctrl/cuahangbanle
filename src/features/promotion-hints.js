function promotionHintsHTML(product) {
  const rules = store.data.promotions.filter(
    (r) =>
      r.active &&
      r.startsOn <= Retail.today() &&
      r.endsOn >= Retail.today() &&
      r.productIds.includes(product.id),
  );
  const qty = store.data.draft.items.find((i) => i.id === product.id)?.qty || 0;
  return rules
    .map((r) => {
      const lots = store.data.lots.filter(
        (l) =>
          l.productId === product.id &&
          (!r.lotIds.length || r.lotIds.includes(l.id)) &&
          ['near', 'good'].includes(store.lotStatus(l)),
      );
      const eligibleStock = lots.reduce((s, l) => s + l.qty - l.blockedQty, 0);
      if (!eligibleStock) return '';
      let selectedQty = 0;
      try {
        selectedQty = store
          .allocateLots(product.id, qty || 1)
          .filter((l) => !r.lotIds.length || r.lotIds.includes(l.lotId))
          .reduce((s, l) => s + l.qty, 0);
      } catch {}
      if (!qty) selectedQty = 0;
      const offer =
        r.type === 'quantity'
          ? `Mua ${r.buyQty} giảm ${money(r.value)} / nhóm`
          : r.type === 'percent'
            ? `Giảm ${r.value}%`
            : `Giảm ${money(r.value)}`;
      const left = r.type === 'quantity' ? Math.max(0, r.buyQty - selectedQty) : 0;
      return `<div class="promotion-hint"><strong>${e(offer)}</strong><span>${e(r.name)}${r.lotIds.length ? ' · Chỉ lô chỉ định còn hạn' : ''}</span><small>${left ? `Mua thêm ${left} sản phẩm đúng phạm vi để đủ nhóm đầu` : qty ? 'Tự xét ưu đãi trong giỏ' : 'Thông báo ưu đãi này cho khách'}${r.minSpend ? ` · Hàng áp dụng từ ${money(r.minSpend)}` : ''} · Giảm thực tế từ 1.000đ${r.maxDiscount ? ` · Trần ${money(r.maxDiscount)}` : ''}</small></div>`;
    })
    .join('');
}
