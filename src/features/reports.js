function reportsView() {
  const p = periodData(reportDays),
    categorySales = {};
  p.orders.forEach((o) =>
    o.items.forEach((i) => {
      categorySales[i.category] = (categorySales[i.category] || 0) + i.paidTotal;
    }),
  );
  const categories = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);
  const highest = Math.max(...Object.values(categorySales), 1);
  return (
    heading(
      'THỐNG KÊ / DOANH THU',
      'Báo cáo kinh doanh',
      'Tổng hợp thu bán hàng, điều chỉnh lịch sử và đối soát hao hụt cuối tháng.',
      action('export-report', 'Xuất báo cáo CSV', 'download', 'primary'),
    ) +
    `<div class="row mb16"><span class="muted">Kỳ báo cáo</span><select id="report-period" style="width:140px">${[1, 7, 30, 90].map((n) => `<option value="${n}" ${n === reportDays ? 'selected' : ''}>${n === 1 ? 'Hôm nay' : n + ' ngày gần nhất'}</option>`).join('')}</select><span class="sub">Doanh thu từ hóa đơn đã thanh toán · Hoàn tiền theo ngày xử lý</span></div>` +
    monthEndReportHTML() +
    stats([
      ['Doanh thu gộp', money(p.gross), `${reportDays} ngày gần nhất`, 'receipt'],
      ['Điều chỉnh lịch sử', money(p.refund), 'Dữ liệu trước khi bỏ trả hàng', 'info'],
      ['Doanh thu thuần', money(p.gross - p.refund), 'Doanh thu gộp trừ tiền hoàn', 'chart'],
      ['Số đơn thanh toán', number(p.orders.length), 'Hóa đơn đã thanh toán', 'cart'],
    ]) +
    `<div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>Biểu đồ doanh thu</h2><p class="sub">Doanh thu gộp theo ngày · Đơn vị nghìn đồng</p></div></div><div class="panel-body">${lineChart(reportDays === 1 ? 7 : reportDays)}</div></section><section class="panel"><div class="panel-head"><h2>Danh mục bán chạy</h2></div><div class="panel-body">${
      categories
        .slice(0, 6)
        .map(
          ([label, value]) =>
            `<div class="progress-row"><div class="between"><strong>${e(label)}</strong><span class="muted">${p.gross ? Math.round((value / p.gross) * 100) : 0}%</span></div><div class="progress"><div style="width:${(value / highest) * 100}%"></div></div></div>`,
        )
        .join('') || empty()
    }</div></section></div><section class="panel"><div class="panel-head"><h2>Doanh thu theo phương thức thanh toán</h2></div>${table(
      [
        'Phương thức',
        'Số giao dịch',
        'Tổng thu trong kỳ',
        'Tiền hoàn trong kỳ',
        'Chênh lệch thu hoàn',
      ],
      Object.entries(METHODS).map(([key, label]) => {
        const orders = p.orders.filter((o) => o.payment === key);
        const gross = orders.reduce((a, o) => a + o.total, 0),
          refund = p.refunds.filter((r) => r.payment === key).reduce((a, r) => a + r.amount, 0);
        return `<tr><td class="name">${label}</td><td>${orders.length}</td><td class="money">${money(gross)}</td><td class="money negative">${money(refund)}</td><td class="money name">${money(gross - refund)}</td></tr>`;
      }),
    )}</section>`
  );
}
