function discountPickerHTML(quote) {
  const selected = store.data.draft.discountSelection || { kind: 'auto', id: '' };
  const voucher =
    selected.kind === 'voucher'
      ? store.data.vouchers.find((v) => v.id === selected.id)
      : null;
  const applied = quote.appliedPromotions || [];
  return `<section class="discount-picker"><div class="between"><h3>Áp voucher</h3>${voucher ? action('discount-clear', 'Bỏ voucher', '', 'ghost small') : ''}</div><div class="row gap8 mt16"><input id="voucher-code" value="${e(voucher?.code || '')}" placeholder="Mã cửa hàng hoặc đối tác" aria-label="Mã voucher" autocomplete="off">${action('voucher-apply', 'Áp dụng', '', 'primary small')}</div><p class="sub">Voucher được cộng dồn với các khuyến mãi đủ điều kiện. Voucher đối tác chỉ áp dụng cho hàng của đối tác.</p>${applied.length ? `<div class="applied-promotions">${applied.map((rule) => `<p class="discount-applied" data-applied-promotion="${e(rule.id)}"><strong>${e(rule.name)} · −${money(rule.discount)}</strong><small>${rule.productIds.map((id) => e(store.data.products.find((p) => p.id === id)?.name || id)).join(', ')}</small></p>`).join('')}</div>` : ''}</section>`;
}
function applyDiscount(kind, discountId) {
  const draft = clone(store.data.draft);
  draft.discountSelection = { kind, id: discountId };
  store.quoteDraft(draft);
  store.saveDraft(draft);
  render();
  notify('Đã áp dụng ưu đãi.');
}
