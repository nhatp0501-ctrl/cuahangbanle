function inventoryView() {
  const s = store.data,
    tabs = [
      ['stock', 'Tồn theo mặt hàng'],
      ['lots', 'Lô & hạn sử dụng'],
      ['movements', 'Lịch sử xuất nhập'],
      ['audits', 'Phiếu kiểm kê'],
    ],
    near = s.lots.filter((l) => l.qty > 0 && store.lotStatus(l) === 'near');
  let content = '';
  if (inventoryTab === 'stock') {
    const p = paginate(
      s.products.filter((p) => p.active && match(`${p.name} ${p.id}`, filters.inventory || '')),
      'stock',
    );
    content = `<div class="table-tools">${filterInput('inventory', 'Tìm sản phẩm hoặc mã…')}</div>${table(
      ['Sản phẩm', 'Tồn vật lý', 'Bán được', 'Cách ly / chưa đủ điều kiện', 'Kiểm kê', ''],
      p.items.map(
        (p) =>
          `<tr><td class="name"><div class="product-cell">${productImage(p, 'product-thumb')}<span>${e(p.name)}</span></div></td><td>${p.stock}</td><td class="positive">${store.saleableStock(p.id)}</td><td>${p.stock - store.saleableStock(p.id)}</td><td>${store.inventoryLock(p.id) ? badge('Đang khóa đếm', 'yellow') : badge('Có thể xuất nhập')}</td><td>${action('inventory-product-lots', 'Xem lô', '', 'small', `data-id="${e(p.id)}"`)}</td></tr>`,
      ),
    )}${p.foot}`;
  }
  if (inventoryTab === 'lots') content = inventoryLotsHTML();
  if (inventoryTab === 'movements') {
    const p = paginate(
      s.movements.filter((m) =>
        match(`${m.productName} ${m.reference} ${m.reason}`, filters.inventory || ''),
      ),
      'movements',
    );
    content = `<div class="table-tools">${filterInput('inventory', 'Tìm chứng từ, mặt hàng, nghiệp vụ…')}</div>${table(
      [
        'Thời gian',
        'Mặt hàng',
        'Tăng / giảm',
        'Tồn vật lý sau',
        'Nghiệp vụ',
        'Chứng từ / lô',
        'Người thực hiện',
      ],
      p.items.map(
        (m) =>
          `<tr><td>${date(m.time)}</td><td>${e(m.productName)}</td><td class="${m.delta >= 0 ? 'positive' : 'negative'}">${m.delta > 0 ? '+' : ''}${m.delta}</td><td>${m.balance}</td><td>${e(m.reason)}</td><td>${e(m.reference)}<div class="sub">${e(m.lotId || '')}</div></td><td>${e(m.actor)}</td></tr>`,
      ),
    )}${p.foot}`;
  }
  if (inventoryTab === 'audits') content = auditListHTML();
  return (
    heading(
      'KHO / LÔ HÀNG & KIỂM KÊ',
      'Tồn kho, hạn dùng & kiểm đếm',
      'Đếm theo lô → đối chiếu → giải trình → admin duyệt điều chỉnh.',
      action('audit-new', 'Mở phiên kiểm kê', 'plus', 'primary'),
    ) +
    stats([
      [
        'Số lượng vật lý',
        number(s.products.reduce((a, p) => a + p.stock, 0)),
        'Bao gồm phần chưa đủ điều kiện bán',
        'warehouse',
      ],
      ['Lô cận date', near.length, `Còn tối đa ${s.settings.nearExpiryDays} ngày`, 'clock'],
      [
        'Hết hạn / chưa rõ HSD',
        s.lots.filter((l) => l.qty > 0 && ['expired', 'unknown'].includes(store.lotStatus(l)))
          .length,
        'Được chặn tại POS',
        'shield',
      ],
      [
        'Chờ admin kiểm kê',
        s.audits.filter((a) => a.status === 'submitted').length,
        'Không tự ghi đè tồn kho',
        'receipt',
      ],
    ]) +
    `<div class="tabs">${tabs.map(([key, label]) => `<button data-action="inventory-tab" data-tab="${key}" class="${inventoryTab === key ? 'active' : ''}">${label}</button>`).join('')}</div><section class="panel"><div class="panel-head"><h2>${tabs.find((t) => t[0] === inventoryTab)?.[1]}</h2></div>${content}</section>`
  );
}
