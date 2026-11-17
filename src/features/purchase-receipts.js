function receiptReportHTML(r) {
  const admin = store.user.role === 'ADMIN';
  return `<section class="receipt-report panel"><div class="between"><div><h3>${e(r.id)} · Phiếu NCC ${e(r.deliveryRef)}</h3><p class="sub">Kho ${e(r.actor)} · ${date(r.time)}</p></div>${badge(r.status === 'submitted' ? 'Chờ admin đối chiếu' : r.status === 'approved' ? 'Đã duyệt nhập' : 'Yêu cầu sửa', r.status === 'submitted' ? 'yellow' : r.status === 'approved' ? 'green' : 'red')}</div>${table(
    [
      'Mặt hàng',
      'Đặt',
      'Đã nhận trước',
      'Thực giao',
      'Không đạt',
      'Đạt đề nghị',
      'Còn thiếu',
      'Lô / HSD',
    ],
    r.items.map(
      (i) =>
        `<tr><td>${e(i.name)}${i.reason ? `<div class="sub">${e(i.reason)}</div>` : ''}</td><td>${i.orderedQty}</td><td>${i.previouslyReceived}</td><td>${i.actualQty}</td><td>${i.rejectedQty}</td><td class="positive">${i.acceptedQty}</td><td class="negative">${i.remainingAfter}</td><td>${e(i.lotCode)}<div class="sub">${expiryText(i.expiryDate)}</div></td></tr>`,
    ),
  )}${r.reviewNote ? `<p class="sub">Admin ${e(r.reviewer)}: ${e(r.reviewNote)}</p>` : ''}${admin && r.status === 'submitted' ? `<div class="row wrap">${action('receipt-review', 'Trả lại biên bản', '', 'danger', `data-id="${e(r.id)}" data-decision="reject"`)}${action('receipt-review', 'Duyệt số đạt nhập kho', 'check', 'teal', `data-id="${e(r.id)}" data-decision="approve"`)}</div>` : ''}</section>`;
}
function receiptReportModal(purchaseId) {
  const p = store.data.purchases.find((p) => p.id === purchaseId);
  if (!p || !['approved', 'partially_received'].includes(p.status))
    throw new Error('Yêu cầu chưa được duyệt hoặc đang chờ đối chiếu.');
  modalContext = { type: 'receipt-report', purchaseId };
  showModal(
    'Kho khai hàng thực nhận từ NCC',
    `<form id="receipt-report-form"><div class="modal-content stack"><div class="note">Đếm hàng thực tế và kiểm tra nhãn lô/HSD. Hàng không đạt không được nhập kho. Báo cáo gửi admin duyệt, chưa làm tăng tồn.</div>${field('Số phiếu giao hàng / chứng từ NCC', 'deliveryRef', '', 'text', 'required maxlength="100"')}${p.items
      .map((i) => {
        const left = i.qty - i.receivedQty;
        return `<section class="receipt-entry" data-receipt-product="${e(i.id)}"><h3>${e(i.name)}</h3><p class="sub">Đặt ${i.qty} · Đạt đã nhập ${i.receivedQty} · Cần giao còn ${left}</p><div class="form-grid mt16">${field('Thực giao lần này', 'actualQty', '', 'number', `data-receipt-field="actualQty" min="0" max="${left}" step="1" required`)}${field('Không đạt / trả NCC', 'rejectedQty', 0, 'number', 'data-receipt-field="rejectedQty" min="0" step="1"')}${field('Mã lô trên bao bì', 'lotCode', '', 'text', 'data-receipt-field="lotCode" maxlength="100"')}${field('Hạn sử dụng', 'expiryDate', '', 'date', 'data-receipt-field="expiryDate"')}${field('Giải trình thiếu/không đạt', 'reason', '', 'text', 'data-receipt-field="reason" placeholder="NCC giao thiếu, hàng móp/hỏng…"', true)}</div><div class="receipt-entry-summary sub">Nhập số thực giao để tính số đạt và chênh lệch.</div></section>`;
      })
      .join(
        '',
      )}${textField('Ghi chú chung / hẹn giao bù', 'note')}${formError()}</div>${foot('Gửi admin đối chiếu')}</form>`,
    true,
  );
}
function updateReceiptEntry(entry) {
  const read = (k) => entry.querySelector(`[data-receipt-field="${k}"]`).value;
  const p = store.data.purchases.find((p) => p.id === modalContext.purchaseId),
    i = p.items.find((i) => i.id === entry.dataset.receiptProduct);
  const actual = Number(read('actualQty')),
    bad = Number(read('rejectedQty'));
  entry.querySelector('.receipt-entry-summary').textContent =
    `Đạt đề nghị nhập ${Math.max(0, actual - bad)} · Sau lần này còn thiếu ${Math.max(0, i.qty - i.receivedQty - actual + bad)}`;
}
function workflowDecisionModal(kind, recordId, decision) {
  const admin = store.user.role === 'ADMIN';
  if (!admin && kind !== 'purchase-cancel') throw new Error('Chỉ admin được kiểm duyệt.');
  const names = {
    purchase: 'Kiểm duyệt yêu cầu đặt hàng',
    receipt: 'Đối chiếu số hàng thực nhận',
    audit: 'Kết luận kiểm kê',
    'purchase-short': 'Chốt số hàng còn thiếu',
    'purchase-cancel': 'Hủy yêu cầu nhập',
  };
  modalContext = { type: 'workflow-decision', kind, recordId, decision };
  showModal(
    names[kind],
    `<form id="workflow-decision-form"><div class="modal-content stack"><p class="note">${kind === 'receipt' && decision === 'approve' ? 'Số hàng đạt trong biên bản sẽ được cộng vào đúng lô sau khi duyệt. Số thiếu tiếp tục theo dõi trên yêu cầu.' : kind === 'audit' && decision === 'approve' ? 'Tồn theo lô sẽ được điều chỉnh về số đã kiểm đếm, hàng hỏng được cách ly. Ghi rõ cách xử lý phần thiếu/thừa.' : kind === 'purchase-short' ? 'Đóng phần còn thiếu sau khi xác minh NCC không giao thêm. Không cộng tồn phần chưa nhận.' : 'Ghi kết luận cụ thể để nhân viên kho theo dõi và thực hiện.'}</p>${textField('Ý kiến admin / lý do xử lý', 'note')}<label class="check-label"><input type="checkbox" required><span>Tôi đã đối chiếu chứng từ và xác nhận thực hiện bước này.</span></label>${formError()}</div>${foot(decision === 'approve' ? 'Phê duyệt & ghi nhận' : decision === 'recount' ? 'Yêu cầu kiểm đếm lại' : 'Xác nhận xử lý', decision === 'approve' ? 'teal' : 'primary')}</form>`,
  );
}
