function discountPickerHTML(quote) {
  const selected = store.data.draft.discountSelection || { kind: 'none', id: '' };
  const promotions = store.data.promotions.filter(
    (p) => p.active && p.startsOn <= Retail.today() && p.endsOn >= Retail.today(),
  );
  return `<section class="discount-picker"><div class="between"><h3>Giảm giá</h3>${['voucher', 'promotion'].includes(selected.kind) ? action('discount-clear', 'Về KM tự động', '', 'ghost small') : ''}</div><div class="segmented mt16">${[
    ['auto', 'Tự động KM'],
    ['none', 'Không giảm'],
    ['voucher', 'Áp voucher'],
    ['promotion', 'Chương trình KM'],
  ]
    .map(
      ([k, label]) =>
        `<button data-action="discount-tab" data-kind="${k}" class="${discountTab === k ? 'active' : ''}">${label}</button>`,
    )
    .join(
      '',
    )}</div>${discountTab === 'voucher' ? `<div class="row gap8 mt16"><input id="voucher-code" placeholder="Mã cửa hàng hoặc đối tác" aria-label="Mã voucher" autocomplete="off">${action('voucher-apply', 'Áp dụng', '', 'primary small')}</div><p class="sub">Cửa hàng: áp dụng chung · Đối tác: chỉ hàng của đối tác.</p>` : discountTab === 'promotion' ? `<select id="cart-promotion" class="mt16" aria-label="Chọn chương trình khuyến mãi"><option value="">Chọn chương trình…</option>${promotions.map((p) => `<option value="${e(p.id)}" ${selected.kind === 'promotion' && selected.id === p.id ? 'selected' : ''}>${e(p.name)}</option>`).join('')}</select><p class="sub">Ưu đãi cận date chỉ áp dụng đúng lô được chọn.</p>` : ''}${quote.discount > 0 ? `<p class="discount-applied">${e(quote.discountLabel || 'Ưu đãi cần kiểm tra')} · −${money(quote.discount)}${selected.kind === 'auto' ? ' · Tự động chọn mức tốt nhất' : ''}</p>` : ''}</section>`;
}
function applyDiscount(kind, discountId) {
  const draft = clone(store.data.draft);
  draft.discountSelection = { kind, id: discountId };
  store.quoteDraft(draft);
  store.saveDraft(draft);
  discountTab = kind;
  render();
  notify('Đã áp dụng ưu đãi, không cộng dồn với ưu đãi khác.');
}
