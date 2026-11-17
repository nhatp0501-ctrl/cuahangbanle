function inventoryLotsHTML() {
  const lots = store.data.lots.filter(
    (l) =>
      l.qty > 0 &&
      (!filters.productId || l.productId === filters.productId) &&
      (!filters.expiry || store.lotStatus(l) === filters.expiry) &&
      match(
        `${l.code} ${store.data.products.find((p) => p.id === l.productId)?.name}`,
        filters.inventory || '',
      ),
  );
  const p = paginate(lots, 'lots');
  return `<div class="table-tools wrap">${filterInput('inventory', 'Tên sản phẩm hoặc mã lô…')}${filterSelect(
    'expiry',
    [
      ['', 'Tất cả hạn dùng'],
      ['near', 'Cận date'],
      ['expired', 'Hết hạn'],
      ['unknown', 'Chưa rõ HSD'],
      ['good', 'Còn hạn'],
    ],
  )}${filters.productId ? action('inventory-clear-product', 'Xem tất cả mặt hàng', '', 'small') : ''}</div>${table(
    ['Sản phẩm / lô', 'Hạn sử dụng', 'Tồn vật lý', 'Hỏng / cách ly', 'Trạng thái', 'Thao tác'],
    p.items.map((l) => {
      const product = store.data.products.find((p) => p.id === l.productId);
      return `<tr><td class="name">${e(product.name)}<div class="sub">Lô ${e(l.code)}</div></td><td>${product.tracksExpiry ? expiryText(l.expiryDate) : 'Không quản lý HSD'}</td><td>${l.qty}</td><td>${l.blockedQty}</td><td>${lotBadge(l)}</td><td>${store.user.role === 'ADMIN' && product.tracksExpiry ? action('lot-expiry', 'Cập nhật HSD', 'edit', 'small', `data-id="${e(l.id)}"`) : ''}${store.user.role === 'ADMIN' && store.lotStatus(l) === 'near' ? action('promotion-lot', 'Tạo khuyến mãi', 'plus', 'small', `data-id="${e(l.id)}"`) : ''}</td></tr>`;
    }),
  )}${p.foot}<div class="panel-body"><div class="note">HSD được quản lý trên từng lô, không gán chung cho cả mã hàng. POS ưu tiên lô hết hạn sớm (FEFO); lô hết hạn, chưa rõ HSD hoặc cách ly không được bán.</div></div>`;
}
function lotExpiryModal(lotId) {
  store.admin();
  const l = store.data.lots.find((l) => l.id === lotId);
  if (!l) throw new Error('Lô không tồn tại.');
  modalContext = { type: 'lot-expiry', lotId };
  showModal(
    'Xác minh hạn sử dụng trên lô',
    `<form id="lot-expiry-form"><div class="modal-content stack"><p class="note">Lô ${e(l.code)} · Cập nhật dựa trên nhãn thực tế, không tự gia hạn hàng hết date.</p>${field('Hạn sử dụng trên bao bì', 'expiryDate', l.expiryDate || '', 'date', 'required')}${textField('Căn cứ xác minh / biên bản', 'note')}${formError()}</div>${foot('Lưu HSD đã xác minh')}</form>`,
  );
}
