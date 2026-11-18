function auditListHTML() {
  const p = paginate(store.data.audits, 'audits');
  return (
    table(
      ['Phiếu / thời gian', 'Phạm vi', 'Người đếm', 'Trạng thái', ''],
      p.items.map(
        (a) =>
          `<tr><td class="name">${e(a.id)}<div class="sub">${date(a.time)}</div></td><td>${e(a.note)}<div class="sub">${a.items.length} lô</div></td><td>${e(a.actor)}</td><td>${workflowStatus(a.status, 'audit')}</td><td>${a.status === 'legacy_approved' ? '<span class="muted">Chứng từ phiên bản cũ</span>' : action('audit-detail', 'Mở phiếu', 'eye', 'small', `data-id="${e(a.id)}"`)}</td></tr>`,
      ),
    ) +
    p.foot +
    `<div class="panel-body"><div class="note">Kiểm kê có phạm vi cụ thể, tạm khóa xuất nhập các mặt hàng đang đếm. Kho lưu kết quả đếm, đối chiếu và giải trình; admin duyệt, yêu cầu đếm lại hoặc từ chối. Chỉ phiếu được duyệt mới thay đổi tồn.</div></div>`
  );
}
function productChecklist(name, products, selected = []) {
  return `<div class="scope-checklist">${products.map((p) => `<label class="scope-product" data-product-search="${e(p.name + ' ' + p.id)}"><input type="checkbox" name="${name}" value="${e(p.id)}" ${selected.includes(p.id) ? 'checked' : ''}>${productImage(p, 'product-thumb')}<span>${e(p.name)}<small class="sub">${e(p.id)}</small></span></label>`).join('')}</div>`;
}
function auditModal() {
  store.require('inventory');
  const products = store.data.products.filter(
    (p) => p.active && p.stock > 0 && !store.inventoryLock(p.id),
  );
  showModal(
    'Chọn phạm vi kiểm kê thực tế',
    `<form id="audit-start-form"><div class="modal-content stack"><div class="note yellow">Khi mở phiên, các mặt hàng được chọn sẽ tạm khóa bán và nhập để giữ mốc tồn. Chỉ chọn phạm vi có thể đếm xong trong ca.</div>${textField('Khu vực / mục đích / lịch kiểm kê', 'note')}<input data-list-filter placeholder="Tìm mặt hàng cần kiểm kê…" aria-label="Tìm phạm vi kiểm kê">${productChecklist('productIds', products)}${formError()}</div>${foot('Mở phiên & bắt đầu đếm')}</form>`,
    true,
  );
}
function auditDetail(auditId) {
  const a = store.data.audits.find((a) => a.id === auditId);
  if (!a) throw new Error('Phiếu không tồn tại.');
  const admin = store.user.role === 'ADMIN',
    editable = a.status === 'counting' && (admin || a.actorId === store.user.id),
    showBook = admin || a.countSaved || a.status !== 'counting';
  modalContext = { type: 'audit-count', auditId };
  const rows = a.items.map(
    (i, index) =>
      `<tr data-count-lot="${e(i.lotId)}"><td class="name">${e(i.name)}<div class="sub">Lô ${e(i.lotCode)} · HSD ${expiryText(i.expiryDate)}</div></td><td>${showBook ? i.bookQty : '—'}</td><td>${editable ? `<input class="audit-qty" type="number" min="0" step="1" data-count-field="countedQty" value="${i.countedQty ?? ''}" aria-label="Số thực đếm ${e(i.lotCode)}">` : (i.countedQty ?? '—')}</td><td>${editable ? `<input class="audit-qty" type="number" min="0" step="1" data-count-field="damagedQty" value="${i.damagedQty}" aria-label="Số hỏng ${e(i.lotCode)}">` : i.damagedQty}</td><td class="${i.countedQty !== null && i.countedQty !== i.bookQty ? 'negative' : ''}">${showBook && i.countedQty !== null ? i.countedQty - i.bookQty : '—'}</td><td>${editable ? `<input type="text" class="count-reason" data-count-field="reason" value="${e(i.reason)}" placeholder="Giải trình thiếu/thừa/hỏng…" aria-label="Giải trình lô ${e(i.lotCode)}">` : e(i.reason)}</td></tr>`,
  );
  showModal(
    'Phiếu kiểm kê & xử lý chênh lệch',
    `<form id="audit-count-form"><div class="modal-content stack"><div class="between"><div><h3>${e(a.id)}</h3><p class="sub">${e(a.note)} · ${e(a.actor)}</p></div>${workflowStatus(a.status, 'audit')}</div><div class="workflow-guide"><span>1. Đếm thực tế</span><span>2. Lưu để đối chiếu</span><span>3. Giải trình & gửi</span><span>4. Admin duyệt</span></div>${!showBook ? '<div class="note">Số trên sổ đang được ẩn để đếm độc lập. Lưu kết quả đếm trước khi xem chênh lệch và giải trình.</div>' : ''}${a.recountNote ? `<div class="note yellow">Admin yêu cầu đếm lại: ${e(a.recountNote)}</div>` : ''}${table(['Mặt hàng / lô', 'Tồn sổ', 'Thực đếm', 'Hỏng/cách ly', 'Lệch', 'Giải trình'], rows)}${showBook ? `<div class="note">Thiếu vật lý dự kiến ${money(a.items.reduce((sum, i) => sum + (i.countedQty === null ? 0 : Math.max(0, i.bookQty - i.countedQty) * (i.salePrice ?? i.cost)), 0))} theo giá bán tại thời điểm mở phiếu; khoản thiếu đã duyệt sẽ trừ ở báo cáo tháng. Admin ghi kết luận xử lý và chịu trách nhiệm điều chỉnh.</div>` : ''}${a.reviewNote ? `<p class="sub">Kết luận ${e(a.reviewer)}: ${e(a.reviewNote)}</p>` : ''}${auditDiscrepanciesHTML(a)}${formError()}</div><div class="modal-footer wrap">${editable ? `<button type="submit" class="btn" name="intent" value="save">${icon('save')}Lưu số đếm để đối chiếu</button><button type="submit" class="btn primary" name="intent" value="submit" ${a.countSaved ? '' : 'disabled'}>${icon('upload')}Gửi admin kiểm duyệt</button>` : ''}${admin && a.status === 'submitted' ? action('audit-review', 'Đếm lại', '', '', `data-id="${e(a.id)}" data-decision="recount"`) + action('audit-review', 'Từ chối', '', 'danger', `data-id="${e(a.id)}" data-decision="reject"`) + action('audit-review', 'Duyệt điều chỉnh tồn', 'check', 'teal', `data-id="${e(a.id)}" data-decision="approve"`) : ''}${admin && a.status === 'counting' ? action('audit-review', 'Hủy phiên, mở lại xuất nhập', '', 'danger', `data-id="${e(a.id)}" data-decision="cancel"`) : ''}${!editable ? action('close-modal', 'Đóng') : ''}</div></form>`,
    true,
  );
}
