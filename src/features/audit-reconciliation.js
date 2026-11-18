function auditReconciliationFoot(auditId, label, cls = 'primary') {
  return `<div class="modal-footer">${action('audit-detail', 'Quay lại phiếu', '', '', `data-id="${e(auditId)}"`)}<button type="submit" class="btn ${cls}">${icon('check')}${e(label)}</button></div>`;
}
function auditDiscrepanciesHTML(a) {
  const rows = a.items.filter(
    (i) => i.countedQty !== null && (i.countedQty !== i.bookQty || i.damagedQty !== i.bookBlocked),
  );
  return rows
    .map((i) => {
      const delta = i.countedQty - i.bookQty;
      const editable =
        a.status === 'counting' && (store.user.role === 'ADMIN' || a.actorId === store.user.id);
      return `<section class="discrepancy-card"><h3>${delta > 0 ? 'Dư' : delta < 0 ? 'Thiếu' : 'Lệch hàng cách ly'} ${Math.abs(delta)} · ${e(i.name)}</h3><p>Lô ${e(i.lotCode)} · Sổ ${i.bookQty} / Đếm ${i.countedQty} · ${i.recountConfirmed ? 'Đã chốt đếm lại' : 'Yêu cầu xử lý ngay'}</p><p class="sub">${delta > 0 ? 'Gợi ý: đếm lại theo đúng đơn vị, kiểm tra vị trí kệ và lô khác, đối chiếu hóa đơn bán và phiếu nhận. Nếu NCC giao dư chưa ghi nhận, xác minh chứng từ trước khi admin tăng tồn; hàng chưa rõ nguồn gốc phải cách ly, không ghi thành doanh thu.' : 'Đối chiếu hóa đơn đã bán, thời điểm xuất hàng, phiếu nhập và đơn vị tính. Đếm lại độc lập; chỉ khoản thiếu được admin duyệt mới trừ ở báo cáo tháng theo giá bán chụp lúc mở phiếu.'}</p>${i.invoiceReview ? `<p class="positive">Đã đối chiếu: ${e(i.invoiceReview.note)}</p>` : ''}${editable ? `<div class="row wrap">${action('audit-invoices', 'Kiểm tra hóa đơn sản phẩm', 'receipt', 'primary small', `data-audit="${e(a.id)}" data-id="${e(i.productId)}"`)}${action('audit-recount-lot', 'Nhập & chốt số đếm lại', 'check', 'teal small', `data-audit="${e(a.id)}" data-id="${e(i.lotId)}" ${i.invoiceReview ? '' : 'disabled'}`)}</div>` : ''}${i.countHistory?.length ? `<p class="sub">Lần đếm lại gần nhất: ${e(i.countHistory.at(-1).note)}</p>` : ''}</section>`;
    })
    .join('');
}
function auditInvoicesModal(auditId, productId) {
  const a = store.data.audits.find((a) => a.id === auditId),
    i = a.items.find((i) => i.productId === productId);
  const invoices = store.auditInvoices(auditId, productId);
  modalContext = { type: 'audit-invoices', auditId, productId };
  showModal(
    'Đối chiếu hóa đơn sản phẩm',
    `<form id="audit-invoices-form"><div class="modal-content stack"><h3>${e(i.name)}</h3><p class="note">Hóa đơn đã thanh toán trước mốc khóa kiểm kê ${date(a.time)}. Tồn sổ đã trừ các hóa đơn này; không trừ số bán lần nữa. Đối chiếu cả phiếu nhập và đơn vị thùng/lốc/chai.</p><input id="audit-invoice-search" placeholder="Lọc mã hóa đơn hoặc ngày…" aria-label="Lọc hóa đơn sản phẩm">${table(
      ['Hóa đơn', 'Ngày', 'Khách / Thu ngân', 'Số đã mua', 'Thành tiền'],
      invoices.map(
        (o) =>
          `<tr data-invoice-search="${e(o.id + ' ' + date(o.time))}"><td>${e(o.id)}</td><td>${date(o.time)}</td><td>${e(o.customer)}<div class="sub">${e(o.staff)}</div></td><td>${o.qty}</td><td>${money(o.amount)}</td></tr>`,
      ),
    )}<p>${invoices.length} hóa đơn · Tổng số lượng bán ${invoices.reduce((s, o) => s + o.qty, 0)}</p>${textField('Kết quả kiểm tra hóa đơn và chứng từ', 'note', i.invoiceReview?.note || '')}${formError()}</div>${auditReconciliationFoot(auditId, 'Xác nhận đã đối chiếu')}</form>`,
    true,
  );
}
function auditRecountModal(auditId, lotId) {
  const a = store.data.audits.find((a) => a.id === auditId),
    i = a.items.find((i) => i.lotId === lotId);
  modalContext = { type: 'audit-recount', auditId, lotId };
  showModal(
    'Đếm lại và chốt số thực tế',
    `<form id="audit-recount-form"><div class="modal-content stack"><h3>${e(i.name)} · ${e(i.lotCode)}</h3><p class="note">Sổ ${i.bookQty} · Lần đếm đã lưu ${i.countedQty}. Đếm độc lập lần nữa, ghi con số thực tế cuối cùng. Admin duyệt mới điều chỉnh tồn.</p>${field('Số thực tế sau đếm lại', 'qty', i.countedQty, 'number', 'required min="0" step="1"')}${field('Trong đó hỏng / cần cách ly', 'damagedQty', i.damagedQty, 'number', 'required min="0" step="1"')}${textField('Kết luận đếm lại / nguồn gốc hàng dư / hướng xử lý', 'note', i.reason)}${formError()}</div>${auditReconciliationFoot(auditId, 'Chốt số đếm lại', 'teal')}</form>`,
  );
}
function updateAuditDiscrepancy(input) {
  const row = input.closest('[data-count-lot]');
  const a = store.data.audits.find((a) => a.id === modalContext.auditId),
    item = a?.items.find((i) => i.lotId === row?.dataset.countLot);
  if (!item) return;
  let warning = row.querySelector('.live-count-warning');
  if (!warning) {
    warning = document.createElement('p');
    warning.className = 'live-count-warning';
    row.cells[0].append(warning);
  }
  const value = row.querySelector('[data-count-field="countedQty"]').value;
  warning.textContent =
    value !== '' && Number(value) !== item.bookQty
      ? `Yêu cầu xử lý chênh lệch: ${Number(value) - item.bookQty > 0 ? 'dư' : 'thiếu'} ${Math.abs(Number(value) - item.bookQty)}. Lưu số đếm để mở đối chiếu hóa đơn & đếm lại.`
      : '';
}
