function supplierProductsHTML(supplierId, query = '') {
  const products = store.data.products.filter(
    (p) =>
      p.supplierId === supplierId && p.active && match(`${p.name} ${p.id} ${p.category}`, query),
  );
  return `<p class="sub">${products.length} sản phẩm thuộc nhà cung cấp này</p><div class="supplier-products">${products.map((p) => `<div class="supplier-product">${productImage(p)}<div><strong>${e(p.name)}</strong><p class="sub">${e(p.id)} · ${e(p.category)} · Tồn ${p.stock}</p><p>Giá nhập ${money(p.cost)} · Giá bán ${money(p.price)}</p></div>${store.can('purchases') ? action('purchase-restock', 'Lập yêu cầu nhập', 'plus', 'primary small', `data-id="${e(p.id)}"`) : ''}</div>`).join('') || empty('Không có sản phẩm phù hợp')}</div>`;
}
