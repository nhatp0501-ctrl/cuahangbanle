function orderTable(orders, compact = false) {
  return table(
    compact
      ? ['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', '']
      : [
          'Mã đơn hàng',
          'Khách hàng',
          'Thời gian',
          'Thanh toán',
          'Tổng tiền',
          'Trạng thái',
          'Thao tác',
        ],
    orders.map(
      (o) =>
        `<tr><td class="name"><button class="text-link" data-action="order-detail" data-id="${e(o.id)}">${e(o.id)}</button></td><td>${e(o.customer)}</td>${compact ? '' : `<td>${date(o.time)}</td><td>${METHODS[o.payment]}</td>`}<td class="money name">${money(o.total)}</td><td>${status(o.status === 'cancelled' ? 'cancelled' : 'completed')}</td><td>${ib('order-detail', 'eye', 'Xem hóa đơn', `data-id="${e(o.id)}"`)}</td></tr>`,
    ),
  );
}

function ordersView() {
  const s = store.data,
    list = s.orders.filter(
      (o) =>
        match(o.id + ' ' + o.customer + ' ' + o.staffName, filters.orders || '') &&
        (!filters.payment || o.payment === filters.payment) &&
        (!filters.from || dayKey(o.time) >= filters.from) &&
        (!filters.to || dayKey(o.time) <= filters.to),
    );
  const p = paginate(list, 'orders');
  return (
    heading(
      'BÁN HÀNG / HÓA ĐƠN',
      'Lịch sử đơn hàng',
      'Giao dịch bán đã thanh toán đủ. Các yêu cầu sau bán quản lý ở phân hệ Trả hàng.',
      action('export-orders', 'Xuất CSV', 'download'),
    ) +
    stats([
      ['Tổng hóa đơn', s.orders.length, 'Giao dịch đã lưu', 'receipt'],
      [
        'Thanh toán đủ',
        s.orders.filter((o) => o.status !== 'cancelled').length,
        'Một lần, một phương thức',
        'check',
      ],
      [
        'Tiền mặt',
        s.orders.filter((o) => o.payment === 'cash').length,
        'Số giao dịch tiền mặt',
        'cash',
      ],
      [
        'Giá trị bán',
        money(s.orders.filter((o) => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0)),
        'Theo hóa đơn gốc',
        'chart',
      ],
    ]) +
    '<section class="panel"><div class="panel-head"><h2>Danh sách hóa đơn bán</h2></div><div class="table-tools wrap">' +
    filterInput('orders', 'Mã hóa đơn, khách hàng, thu ngân…') +
    filterSelect('payment', [['', 'Mọi thanh toán'], ...Object.entries(METHODS)]) +
    '<label class="date-filter">Từ <input type="date" data-filter="from" value="' +
    e(filters.from || '') +
    '"></label><label class="date-filter">Đến <input type="date" data-filter="to" value="' +
    e(filters.to || '') +
    '"></label></div>' +
    orderTable(p.items) +
    p.foot +
    '</section>'
  );
}

function receiptHTML(o) {
  return (
    '<article class="receipt"><div class="receipt-head"><h2>' +
    e(o.store.name) +
    '</h2><p>' +
    e(o.store.address) +
    '</p><p>Điện thoại: ' +
    e(o.store.phone) +
    '</p><h3>HÓA ĐƠN BÁN HÀNG</h3><p>' +
    e(o.id) +
    ' · ' +
    date(o.time) +
    '</p></div><div class="detail-grid"><div>Khách hàng: <strong>' +
    e(o.customer) +
    '</strong><br>Thu ngân: ' +
    e(o.staffName) +
    '</div><div>Thanh toán: ' +
    METHODS[o.payment] +
    '<br>Đã thanh toán đủ một lần' +
    (o.paymentRef ? '<br>Tham chiếu: ' + e(o.paymentRef) : '') +
    '</div></div>' +
    table(
      ['Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền'],
      o.items.map(
        (i) =>
          '<tr><td>' +
          e(i.name) +
          '</td><td>' +
          i.qty +
          '</td><td>' +
          money(i.price) +
          '</td><td>' +
          money(i.qty * i.price) +
          '</td></tr>',
      ),
    ) +
    '<div class="receipt-total"><div class="between"><span>Tạm tính</span><span>' +
    money(o.subtotal) +
    '</span></div><div class="between"><span>' +
    e(o.discountLabel || 'Giảm giá') +
    '</span><span>− ' +
    money(o.discount) +
    '</span></div><div class="between"><span>Thuế (' +
    o.taxRate +
    '%)</span><span>' +
    money(o.tax) +
    '</span></div><div class="between grand"><span>Đã thanh toán</span><span>' +
    money(o.total) +
    '</span></div><div class="between"><span>Khách đưa / đã nhận</span><span>' +
    money(o.received) +
    '</span></div><div class="between"><span>Tiền thừa trả khách</span><span>' +
    money(o.change) +
    '</span></div></div>' +
    (o.note ? '<p class="sub">Ghi chú: ' + e(o.note) + '</p>' : '') +
    '<div class="receipt-foot">' +
    e(o.store.receiptNote) +
    '<br>Phiếu bán hàng nội bộ</div></article>'
  );
}

function orderDetail(orderId) {
  const o = store.data.orders.find((o) => o.id === orderId);
  if (!o) throw new Error('Không tìm thấy hóa đơn.');
  modalContext = { type: 'order', id: o.id };
  showModal(
    'Chi tiết hóa đơn bán hàng',
    '<div class="modal-content">' +
      receiptHTML(o) +
      '</div><div class="modal-footer wrap">' +
      action('download-invoice', 'Tải hóa đơn', 'download', '', 'data-id="' + e(o.id) + '"') +
      action('print-invoice', 'In / Lưu PDF', 'print', 'primary', 'data-id="' + e(o.id) + '"') +
      '</div>',
    true,
  );
}

function printInvoice(orderId) {
  const o = store.data.orders.find((o) => o.id === orderId);
  $('#print-area').innerHTML = receiptHTML(o);
  window.print();
}

function invoiceDownload(orderId) {
  const o = store.data.orders.find((o) => o.id === orderId);
  const html = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(o.id)}</title><style>body{max-width:720px;margin:40px auto;padding:20px;font-family:Arial,sans-serif;font-size:13px;color:#26354c}.receipt-head,.receipt-foot{text-align:center}.receipt-head{margin-bottom:30px}.detail-grid{display:flex;justify-content:space-between;margin:20px 0}table{border-collapse:collapse;width:100%}td,th{padding:12px 5px;border-bottom:1px solid #eee;text-align:left}.between{display:flex;justify-content:space-between;gap:25px;margin-top:8px}.receipt-total{margin:25px 0}.grand{font-size:18px}.sub,.receipt-foot{font-size:11px;color:#738097}.receipt-foot{margin-top:30px}@media print{body{margin:0}}</style>${receiptHTML(o)}</html>`;
  download(html, `${o.id}.html`, 'text/html;charset=utf-8');
  notify('Đã tải hóa đơn. Mở tệp để xem hoặc in lại.');
}
