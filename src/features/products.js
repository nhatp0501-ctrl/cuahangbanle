function productsView() {
  const s = store.data;
  const categories = [...new Set(s.products.map((p) => p.category))];
  const list = s.products.filter(
    (p) =>
      match(`${p.id} ${p.name} ${p.barcode}`, filters.products || '') &&
      (!filters.category || p.category === filters.category) &&
      (!filters.active || (filters.active === 'yes' ? p.active : !p.active)),
  );
  const p = paginate(list, 'products');
  return (
    heading(
      'DANH MỤC / SẢN PHẨM',
      'Quản lý sản phẩm',
      'Quản lý danh mục, giá bán, mã hàng và trạng thái kinh doanh.',
      action('export-products', 'Xuất CSV', 'download') +
        (store.user.role === 'ADMIN'
          ? action('entity-new', 'Thêm sản phẩm', 'plus', 'primary', 'data-type="products"')
          : ''),
    ) +
    stats([
      ['Tổng mặt hàng', number(s.products.length), 'Đang có trong danh mục', 'box'],
      [
        'Đang kinh doanh',
        number(s.products.filter((p) => p.active).length),
        'Có thể chọn tại POS',
        'check',
      ],
      [
        'Sắp hết hàng',
        number(s.products.filter((p) => p.active && p.stock <= p.minStock).length),
        'Cần kiểm tra và nhập thêm',
        'bell',
      ],
      [
        'Ngừng kinh doanh',
        number(s.products.filter((p) => !p.active).length),
        'Giữ lại lịch sử giao dịch',
        'box',
      ],
    ]) +
    `<section class="panel"><div class="panel-head"><h2>Danh sách sản phẩm</h2><span class="sub">${s.products.length} mặt hàng</span></div><div class="table-tools wrap">${filterInput('products', 'Tìm tên, mã sản phẩm, mã vạch…')}${filterSelect('category', [['', 'Tất cả danh mục'], ...categories.map((c) => [c, c])])}${filterSelect(
      'active',
      [
        ['', 'Tất cả trạng thái'],
        ['yes', 'Đang kinh doanh'],
        ['no', 'Ngừng kinh doanh'],
      ],
    )}</div>${table(
      ['Sản phẩm', 'Mã sản phẩm', 'Danh mục', 'Giá bán', 'Tồn vật lý / bán được', 'Trạng thái', ''],
      p.items.map(
        (item) =>
          `<tr><td class="name"><div class="product-cell">${productImage(item, 'product-thumb')}<div>${e(item.name)}<div class="sub">${e(item.barcode)}</div></div></div></td><td>${e(item.id)}</td><td>${e(item.category)}</td><td class="money name">${money(item.price)}</td><td class="${item.stock <= item.minStock ? 'negative' : ''}">${item.stock} / ${store.saleableStock(item.id)} ${item.stock <= item.minStock ? '<span class="badge yellow">Thấp</span>' : ''}</td><td>${item.active ? badge('Đang bán') : badge('Ngừng bán', 'gray')}</td><td>${store.user.role === 'ADMIN' ? ibEntity('products', item.id) : ''}</td></tr>`,
      ),
    )}${p.foot}</section>`
  );
}

function ibEntity(type, id) {
  return ib('entity-edit', 'settings', 'Chỉnh sửa', `data-type="${type}" data-id="${e(id)}"`);
}
