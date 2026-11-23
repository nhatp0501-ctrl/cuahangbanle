let posProductPage = 1;
function posView() {
  const s = store.data,
    d = s.draft,
    categories = ['Tất cả', ...new Set(s.products.filter((p) => p.active).map((p) => p.category))];
  const list = s.products.filter(
    (p) =>
      p.active &&
      (activeCategory === 'Tất cả' || p.category === activeCategory) &&
      match(`${p.name} ${p.id} ${p.barcode}`, filters.pos || ''),
  );
  const pages = Math.max(1, Math.ceil(list.length / 24));
  posProductPage = Math.min(posProductPage, pages);
  const products = list.slice((posProductPage - 1) * 24, posProductPage * 24),
    t = safeQuote();
  return (
    heading(
      'BÁN HÀNG / HÀNG TIÊU DÙNG',
      'Bán hàng tại quầy',
      'Chọn hàng và số lượng → tự tính nhiều khuyến mãi → thanh toán đủ một lần.',
      action('held-orders', `Đơn tạm ${s.held.length}/5`, 'clock'),
    ) +
    `<div class="pos-layout"><section class="panel"><div class="panel-head"><div><h2>Danh mục hàng tiêu dùng</h2><p class="sub">${list.length} mặt hàng · Ảnh bao bì thực tế · Giá/tồn/HSD mẫu</p></div>${badge('Bán theo lô FEFO')}</div><div class="table-tools"><div class="pos-search">${icon('search')}${filterInput('pos', 'Tên, mã sản phẩm hoặc mã vạch…')}</div>${action('scan', 'Quét mã', 'scan')}</div><div class="categories">${categories.map((c) => `<button class="${activeCategory === c ? 'active' : ''}" data-action="category" data-category="${e(c)}">${e(c)}</button>`).join('')}</div><div class="product-grid retail-product-grid">${
      products
        .map((p) => {
          const stock = store.saleableStock(p.id),
            locked = store.inventoryLock(p.id),
            disabled = stock <= 0 || locked;
          return `<article class="product-card retail-product-card"><button class="product-choose" data-action="choose-product" data-id="${e(p.id)}" ${disabled ? 'disabled' : ''} aria-label="Chọn số lượng ${e(p.name)}">${productImage(p, 'product-art')}<strong>${e(p.name)}</strong></button><div class="price money">${money(p.price)}</div><p class="stock">${locked ? 'Tạm khóa kiểm kê' : `Bán được ${stock} · Tồn ${p.stock}`}</p>${promotionHintsHTML(p)}<div class="product-buttons">${action('add-cart', '+1', '', 'small', `data-id="${e(p.id)}" ${disabled ? 'disabled' : ''}`)}${action('choose-product', 'Chọn số lượng', '', 'primary small', `data-id="${e(p.id)}" ${disabled ? 'disabled' : ''}`)}</div></article>`;
        })
        .join('') || empty('Không tìm thấy mặt hàng', 'Thử tên hoặc nhóm hàng khác.', 'search')
    }</div><div class="table-foot"><span>Trang ${posProductPage}/${pages} · ${list.length} mặt hàng</span><div class="row gap8">${action('pos-page', '← Trước', '', 'small', `data-delta="-1" ${posProductPage === 1 ? 'disabled' : ''}`)}${action('pos-page', 'Sau →', '', 'small', `data-delta="1" ${posProductPage === pages ? 'disabled' : ''}`)}</div></div></section><section class="panel cart-panel"><div class="panel-head"><div><h2>Đơn hàng hiện tại</h2><p class="sub">${d.items.reduce((a, i) => a + i.qty, 0)} sản phẩm · Chưa thanh toán</p></div>${action('clear-cart', 'Xóa giỏ', 'trash', 'danger small', d.items.length ? '' : 'disabled')}</div><div class="cart-body">${customerLookupHTML()}<div class="cart-items">${d.items.map((i) => `<div class="cart-item">${productImage(i, 'cart-item-photo')}<div class="cart-item-info"><strong>${e(i.name)}</strong><small>${money(i.price)}</small><div class="quantity">${action('cart-qty', '−', '', 'small', `data-id="${e(i.id)}" data-delta="-1"`)}<input type="number" min="1" step="1" value="${i.qty}" data-cart-quantity="${e(i.id)}" aria-label="Số lượng ${e(i.name)}">${action('cart-qty', '+', '', 'small', `data-id="${e(i.id)}" data-delta="1"`)}</div></div><div class="right"><strong class="money">${money(i.qty * i.price)}</strong>${ib('remove-cart', 'close', 'Bỏ mặt hàng', `data-id="${e(i.id)}"`)}</div></div>`).join('') || empty('Chọn hàng để bắt đầu', 'Có thể bấm chọn số lượng trước khi thêm vào giỏ.', 'cart')}</div>${discountPickerHTML(t)}<div class="cart-summary"><div class="between"><span>Tạm tính</span><span>${money(t.subtotal)}</span></div><div class="between"><span>Ưu đãi</span><span>− ${money(t.discount)}</span></div><div class="between"><span>Thuế (${s.settings.taxRate}%)</span><span>${money(t.tax)}</span></div></div><div class="mt16">${field('Ghi chú', 'cart-note', d.note, 'text', 'id="cart-note"')}</div>${t.error ? `<div class="note yellow mt16">${e(t.error)}</div>` : ''}<div class="cart-total between"><span>Thanh toán đủ</span><span>${money(t.total)}</span></div><div class="cart-actions">${action('hold', 'Lưu đơn', 'save', '', d.items.length ? '' : 'disabled')}${action('checkout', 'Thanh toán một lần', 'card', 'teal', d.items.length && !t.error ? '' : 'disabled')}</div><p class="cart-notice">Không ghi nợ · Không chia thanh toán</p></div></section></div>`
  );
}
function changeDraft(fn) {
  const d = clone(store.data.draft);
  fn(d);
  store.saveDraft(d);
  render();
}
function setCartQuantity(productId, qty) {
  const p = store.data.products.find((p) => p.id === productId && p.active);
  if (!p) throw new Error('Mặt hàng không còn bán.');
  if (!Number.isSafeInteger(qty) || qty < 0)
    throw new Error('Số lượng phải là số nguyên không âm.');
  if (qty) store.allocateLots(p.id, qty);
  changeDraft((d) => {
    const item = d.items.find((i) => i.id === p.id);
    if (!qty) {
      d.items = d.items.filter((i) => i.id !== p.id);
      return;
    }
    if (item) item.qty = qty;
    else d.items.push({ id: p.id, name: p.name, price: p.price, qty, image: p.image, icon: '' });
  });
}
function addCart(productId, delta = 1) {
  const qty = (store.data.draft.items.find((i) => i.id === productId)?.qty || 0) + delta;
  setCartQuantity(productId, Math.max(0, qty));
}
function quantityModal(productId) {
  const p = store.data.products.find((p) => p.id === productId && p.active);
  if (!p) throw new Error('Mặt hàng không tồn tại.');
  store.assertUnlocked(p.id);
  const available =
    store.saleableStock(p.id) - (store.data.draft.items.find((i) => i.id === p.id)?.qty || 0);
  if (available <= 0) throw new Error('Đã đạt số lượng có thể bán.');
  modalContext = { type: 'quantity', productId };
  showModal(
    'Chọn số lượng sản phẩm',
    `<form id="quantity-form"><div class="modal-content stack"><div class="quantity-product">${productImage(p)}<div><h2>${e(p.name)}</h2><p class="sub">${money(p.price)} / sản phẩm · Có thể thêm ${available}</p></div></div>${field('Số lượng muốn thêm', 'qty', 1, 'number', `id="quantity-input" required min="1" max="${available}" step="1"`)}<div class="quantity-presets">${[
      1, 2, 3, 5, 10, 20,
    ]
      .filter((n) => n <= available)
      .map((n) => action('quantity-preset', String(n), '', '', `data-qty="${n}"`))
      .join('')}</div>${formError()}</div>${foot('Thêm vào giỏ')}</form>`,
  );
}
function heldModal() {
  showModal(
    'Đơn hàng lưu tạm',
    `<div class="modal-content stack">${store.data.held.map((h) => `<div class="panel" style="padding:16px"><h3>${e(h.id)}</h3><p class="sub">${date(h.time)} · ${h.items.reduce((a, i) => a + i.qty, 0)} sản phẩm</p><p class="sub">${e(h.items.map((i) => i.name + ' × ' + i.qty).join(', '))}</p><div class="row mt16">${action('restore-held', 'Tiếp tục bán', 'cart', 'primary', `data-id="${e(h.id)}"`)}${action('delete-held', 'Xóa đơn', 'trash', 'danger', `data-id="${e(h.id)}"`)}</div></div>`).join('') || empty('Không có đơn tạm')}</div>`,
  );
}
