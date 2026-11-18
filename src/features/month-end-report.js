let reportMonth = Retail.today().slice(0, 7);
function monthEndReportHTML() {
  const m = store.monthEndSummary(reportMonth);
  return `<section class="panel month-end"><div class="panel-head"><div><h2>Đối soát doanh thu cuối tháng & hao hụt</h2><p class="sub">Chỉ ghi khoản thiếu đã được admin duyệt trong tháng. Hàng dư không tăng doanh thu.</p></div><div class="row"><input id="report-month" type="month" value="${e(reportMonth)}" aria-label="Tháng đối soát">${action('export-month-report', 'Xuất đối soát tháng', 'download', 'primary small')}</div></div>${stats(
    [
      ['Thu từ hóa đơn', money(m.gross), `Tháng ${reportMonth}`, 'receipt'],
      ['Trừ thiếu kiểm kê', money(m.loss), 'Số thiếu × giá bán tại lúc mở phiên', 'warehouse'],
      [
        'Điều chỉnh lịch sử',
        money(m.historicalAdjustment),
        'Dữ liệu trước khi bỏ chức năng trả hàng',
        'info',
      ],
      ['Thu sau hao hụt', money(m.afterLoss), 'Thu hóa đơn − điều chỉnh − thiếu đã duyệt', 'chart'],
    ],
  )}<p class="note">Đây là kết quả đối soát quản trị sau hao hụt, chưa phải lợi nhuận kế toán. Hóa đơn và doanh thu bán hàng gốc được giữ nguyên; giá vốn thiếu cũng được lưu riêng trên phiếu kiểm kê. Không lấy hàng dư bù tự động cho khoản thiếu.</p>${table(
    ['Phiếu kiểm kê', 'Sản phẩm / lô', 'Ngày duyệt', 'Thiếu', 'Giá trị mỗi SP', 'Khoản trừ tháng'],
    m.losses.map(
      (i) =>
        `<tr><td>${action('audit-detail', e(i.auditId), 'receipt', 'small', `data-id="${e(i.auditId)}"`)}</td><td>${e(i.name)}<div class="sub">${e(i.lotCode)}</div></td><td>${date(i.time)}</td><td>${i.qty}</td><td>${money(i.unitValue)}</td><td class="negative">−${money(i.amount)}</td></tr>`,
    ),
  )}</section>`;
}
function exportMonthReport() {
  const m = store.monthEndSummary(reportMonth);
  exportCSV(
    [
      ['Tháng', m.month],
      ['Thu hóa đơn', m.gross],
      ['Điều chỉnh lịch sử', m.historicalAdjustment],
      ['Thiếu kiểm kê đã duyệt', m.loss],
      ['Thu sau hao hụt', m.afterLoss],
      [],
      ['Phiếu kiểm kê', 'Sản phẩm', 'Lô', 'Ngày duyệt', 'Số thiếu', 'Đơn giá', 'Khoản trừ'],
      ...m.losses.map((i) => [
        i.auditId,
        i.name,
        i.lotCode,
        date(i.time),
        i.qty,
        i.unitValue,
        i.amount,
      ]),
    ],
    `RetailFlow-doi-soat-thang-${m.month}.csv`,
  );
}
