function dashboardView() {
  const s = store.data,
    today = periodData(1),
    low = s.products.filter((p) => p.active && p.stock <= p.minStock),
    pending = s.purchases.filter((p) =>
      ['submitted', 'receipt_pending', 'partially_received'].includes(p.status),
    ),
    refund = s.returns.filter((r) => r.status === 'pending');
  const methods = Object.keys(METHODS).map((m, i) => ({
    label: METHODS[m],
    value: today.orders.filter((o) => o.payment === m).reduce((s, o) => s + o.total, 0),
    color: ['#7871d8', '#25b6a5', '#edc273'][i],
  }));
  const total = methods.reduce((s, m) => s + m.value, 0);
  let angle = 0;
  const gradient = methods
    .map((m) => {
      const start = angle;
      angle += total ? (m.value / total) * 360 : 120;
      return `${m.color} ${start}deg ${angle}deg`;
    })
    .join(',');
  const dateLabel = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date());
  return (
    heading(
      e(dateLabel),
      'Tổng quan cửa hàng',
      'Theo dõi hoạt động kinh doanh trong ngày.',
      action('navigate', 'Tạo đơn bán mới', 'plus', 'primary', 'data-page="pos"'),
    ) +
    stats([
      [
        'Doanh thu hôm nay',
        money(today.gross - today.refund),
        `${today.orders.length} giao dịch đã thanh toán`,
        'receipt',
      ],
      ['Đơn hàng hôm nay', number(today.orders.length), 'Đơn bán hàng đã hoàn tất', 'cart'],
      [
        'Mặt hàng đang bán',
        number(s.products.filter((p) => p.active).length),
        'Sản phẩm trong danh mục',
        'box',
      ],
      ['Sắp hết hàng', number(low.length), 'Cần bổ sung hàng hóa', 'bell'],
    ]) +
    `<div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Xu hướng doanh thu</h2><p class="sub">Doanh thu gộp · ${chartDays} ngày gần nhất</p></div><div class="segmented">${[7, 30].map((n) => `<button class="${chartDays === n ? 'active' : ''}" data-action="chart-period" data-days="${n}">${n} ngày</button>`).join('')}</div></div><div class="panel-body">${lineChart(chartDays)}</div></section><section class="panel"><div class="panel-head"><div><h2>Cơ cấu thanh toán</h2><p class="sub">Theo doanh thu hôm nay</p></div>${icon('card')}</div><div class="panel-body"><div class="donut-wrap"><div class="donut" style="background:conic-gradient(${gradient})"><div class="donut-center"><b>${today.orders.length}</b><small>giao dịch</small></div></div><div class="legend">${methods.map((m) => `<div><i class="dot" style="color:${m.color}"></i>${m.label}<strong>${total ? Math.round((m.value / total) * 100) : 0}%</strong></div>`).join('')}</div></div></div></section></div><div class="dashboard-grid"><section class="panel"><div class="panel-head"><h2>Đơn hàng gần đây</h2>${action('navigate', 'Xem tất cả →', '', 'ghost small', 'data-page="orders"')}</div>${orderTable(s.orders.slice(0, 6), true)}</section><section class="panel"><div class="panel-head"><h2>Cần chú ý</h2><span class="badge yellow">${low.length + pending.length + refund.length} cần xử lý</span></div><div class="panel-body">${low
      .slice(0, 3)
      .map(
        (p) =>
          `<div class="alert-item"><div class="stat-icon">${icon('box')}</div><div><strong>${e(p.name)}</strong><small>Còn ${p.stock} · Ngưỡng tối thiểu ${p.minStock}</small></div>${badge('Tồn thấp', 'yellow')}</div>`,
      )
      .join(
        '',
      )}${pending.length ? `<div class="alert-item"><div class="stat-icon">${icon('truck')}</div><div><strong>${pending.length} phiếu nhập cần xử lý</strong><small>Kiểm tra và xác nhận nhập kho</small></div>${ib('navigate', 'arrow', 'Xem phiếu nhập', 'data-page="purchases"')}</div>` : ''}${refund.length ? `<div class="alert-item"><div class="stat-icon">${icon('return')}</div><div><strong>${refund.length} yêu cầu hoàn tiền</strong><small>Cần quản trị viên phê duyệt</small></div>${ib('navigate', 'arrow', 'Xem yêu cầu trả hàng', 'data-page="returns"')}</div>` : ''}${!low.length && !pending.length && !refund.length ? empty('Mọi thứ đang ổn', 'Chưa có công việc cần xử lý.', 'check') : ''}</div></section></div>`
  );
}
