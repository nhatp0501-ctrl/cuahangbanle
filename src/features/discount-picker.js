function discountPickerHTML(quote) {
  const selected = store.data.draft.discountSelection || { kind: 'auto', id: '' };
  const promotions = store.data.promotions.filter(
    (p) =>
      p.active &&
      p.startsOn <= Retail.today() &&
      p.endsOn >= Retail.today() &&
      p.productIds.some((id) => store.data.draft.items.some((i) => i.id === id)),
  );
  const applied = quote.appliedPromotions || [];
  return `<section class="discount-picker"><div class="between"><h3>Giảm giá</h3>${selected.kind !== 'auto' ? action('discount-clear', 'Về KM tự động', '', 'ghost small') : ''}</div><div class="segmented mt16">${[
    ['auto', 'Tự động KM'],
    ['voucher', 'Áp voucher'],
    ['promotion', 'Chọn nhiều KM'],
  ]
    .map(
      ([kind, label]) =>
        `<button data-action="discount-tab" data-kind="${kind}" class="${discountTab === kind ? 'active' : ''}">${label}</button>`,
    )
    .join(
      '',
    )}</div>${discountTab === 'voucher' ? `<div class="row gap8 mt16"><input id="voucher-code" placeholder="Mã cửa hàng hoặc đối tác" aria-label="Mã voucher" autocomplete="off">${action('voucher-apply', 'Áp dụng', '', 'primary small')}</div><p class="sub">Voucher thay thế các chương trình đang áp dụng. Đối tác chỉ giảm đúng hàng của đối tác.</p>` : discountTab === 'promotion' ? `<div class="stack mt16">${promotions.map((p) => `<label class="scope-product"><input type="checkbox" data-promotion-select="${e(p.id)}" ${(selected.kind === 'promotions' && selected.ids.includes(p.id)) || (selected.kind === 'promotion' && selected.id === p.id) ? 'checked' : ''}><span>${e(p.name)}</span></label>`).join('') || '<p class="sub">Giỏ chưa có sản phẩm thuộc chương trình.</p>'}</div>` : ''}<p class="sub">Nhiều sản phẩm được hưởng nhiều chương trình. Cùng một mã hàng ưu tiên mức giảm tốt hơn, không giảm chồng hai lần.</p>${applied.length ? `<div class="applied-promotions">${applied.map((r) => `<p class="discount-applied" data-applied-promotion="${e(r.id)}"><strong>${e(r.name)} · −${money(r.discount)}</strong><small>${r.productIds.map((id) => e(store.data.products.find((p) => p.id === id)?.name || id)).join(', ')}</small></p>`).join('')}</div>` : quote.discount > 0 ? `<p class="discount-applied">${e(quote.discountLabel)} · −${money(quote.discount)}</p>` : '<p class="sub">Ưu đãi sẽ tự tính khi đủ điều kiện.</p>'}</section>`;
}
function applyDiscount(kind, discountId) {
  const draft = clone(store.data.draft);
  draft.discountSelection = { kind, id: discountId };
  store.quoteDraft(draft);
  store.saveDraft(draft);
  discountTab = kind;
  render();
  notify('Đã áp dụng ưu đãi.');
}
function selectCartPromotion(id, checked) {
  const d = clone(store.data.draft),
    selection = d.discountSelection;
  const ids = new Set(
    selection?.kind === 'promotions'
      ? selection.ids
      : selection?.kind === 'promotion'
        ? [selection.id]
        : [],
  );
  if (checked) ids.add(id);
  else ids.delete(id);
  d.discountSelection = ids.size ? { kind: 'promotions', ids: [...ids] } : { kind: 'auto', id: '' };
  store.quoteDraft(d);
  store.saveDraft(d);
  render();
}
