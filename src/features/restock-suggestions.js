function pendingPurchaseQuantity(productId) {
  return store.data.purchases
    .filter((p) =>
      ['submitted', 'approved', 'receipt_pending', 'partially_received'].includes(p.status),
    )
    .reduce(
      (total, p) =>
        total +
        p.items
          .filter((i) => i.id === productId)
          .reduce((n, i) => n + Math.max(0, i.qty - (i.receivedQty || 0)), 0),
      0,
    );
}

function restockQuantity(product) {
  const target = Math.max(1, product.minStock * 2);
  return Math.max(0, target - product.stock - pendingPurchaseQuantity(product.id));
}

function lowStockProducts(supplierId = '') {
  return store.data.products
    .filter(
      (p) => p.active && p.stock <= p.minStock && (!supplierId || p.supplierId === supplierId),
    )
    .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name, 'vi'));
}

function restockSuggestionsHTML() {
  const products = lowStockProducts();
  if (!products.length) return '';
  return `<section class="panel restock-panel"><div class="panel-head"><div>
    <h2>Gợi ý nhập hàng sắp hết</h2><p class="sub">${products.length} mặt hàng bằng hoặc dưới ngưỡng tồn tối thiểu · Chọn hàng để lập phiếu nhập ngay</p>
    </div>${badge(`${products.length} cần chú ý`, 'yellow')}</div>
    <div class="restock-grid">${products
      .map((p) => {
        const supplier = store.data.suppliers.find((s) => s.id === p.supplierId);
        const pending = pendingPurchaseQuantity(p.id),
          recommended = restockQuantity(p);
        return `<article class="restock-card"><div class="row">${productImage(p, 'product-thumb')}<div>
        <h3>${e(p.name)}</h3><p class="sub">${e(supplier?.name || 'Chưa có nhà cung cấp')}</p>
        </div></div><div class="restock-levels"><span>Còn <b class="negative">${p.stock}</b></span><span>Ngưỡng tối thiểu <b>${p.minStock}</b></span></div>
        ${pending ? `<p class="sub">Đã đề nghị/chờ giao: <strong>${pending}</strong> sản phẩm</p>` : ''}
        <p class="restock-recommended">${recommended ? `Gợi ý nhập thêm <strong>${recommended}</strong> sản phẩm` : 'Hàng chờ nhập đã đủ mức bổ sung gợi ý'}</p>
        ${action('purchase-restock', recommended ? 'Nhập mặt hàng này' : 'Nhập thêm', 'plus', 'primary small', `data-id="${e(p.id)}" ${supplier?.active ? '' : 'disabled'}`)}
        ${!supplier?.active ? '<p class="sub negative">Nhà cung cấp đã ngừng hợp tác</p>' : ''}
      </article>`;
      })
      .join(
        '',
      )}</div><p class="restock-explanation sub">Số lượng gợi ý đưa tồn kho lên 2 lần ngưỡng tối thiểu, đã trừ hàng trong phiếu chờ nhận. Bạn có thể chỉnh lại trước khi lập phiếu.</p></section>`;
}

function renderSupplierRestockSuggestions() {
  const container = $('#purchase-restock-suggestions');
  if (!container) return;
  const products = lowStockProducts($('#purchase-supplier').value);
  container.hidden = !products.length;
  container.innerHTML = `<h3>Hàng sắp hết của nhà cung cấp này</h3><p class="sub">Chọn để thêm nhanh vào phiếu · Có thể chỉnh số lượng ở ô bên dưới trước khi thêm thủ công</p>
    <div class="supplier-restock-list">${products
      .map((p) => {
        const added = purchaseLines.some((i) => i.id === p.id);
        return `<button type="button" class="supplier-restock-item" data-action="purchase-add-suggestion" data-id="${e(p.id)}" ${added ? 'disabled' : ''}>
        <span><strong>${e(p.name)}</strong><small>Còn ${p.stock} · Ngưỡng ${p.minStock} · Đề nghị/chờ giao ${pendingPurchaseQuantity(p.id)}</small></span>
        <span>${added ? 'Đã thêm' : `+ ${restockQuantity(p) || 1}`}</span></button>`;
      })
      .join('')}</div>`;
}

function addSuggestedPurchase(productId) {
  store.require('purchases');
  const product = store.data.products.find((p) => p.id === productId && p.active);
  const supplierId = $('#purchase-supplier').value;
  if (!product || product.supplierId !== supplierId)
    throw new Error('Sản phẩm không thuộc nhà cung cấp đang chọn.');
  if (purchaseLines.some((i) => i.id === product.id))
    throw new Error('Mặt hàng đã có trong phiếu.');
  const qty = restockQuantity(product) || 1;
  $('#purchase-product').value = product.id;
  $('#purchase-qty').value = qty;
  $('#purchase-price').value = product.cost;
  purchaseLines.push({ id: product.id, name: product.name, qty, price: product.cost });
  renderPurchaseLines();
}
