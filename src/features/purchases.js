function purchasesView() {
  const s = store.data,
    p = paginate(
      s.purchases.filter(
        (p) =>
          match(`${p.id} ${p.supplier}`, filters.purchases || '') &&
          (!filters.status || p.status === filters.status),
      ),
      'purchases',
    );
  return (
    heading(
      'KHO / ĐỀ NGHỊ NHẬP HÀNG',
      'Yêu cầu nhập & thực nhận',
      'Kho lập yêu cầu → Admin duyệt → Kho báo hàng thực nhận → Admin đối chiếu nhập kho.',
      action('purchase-new', 'Lập yêu cầu nhập', 'plus', 'primary'),
    ) +
    stats([
      [
        'Chờ duyệt yêu cầu',
        s.purchases.filter((p) => p.status === 'submitted').length,
        'Admin kiểm tra nhu cầu nhập',
        'shield',
      ],
      [
        'Chờ duyệt thực nhận',
        s.purchases.filter((p) => p.status === 'receipt_pending').length,
        'Đối chiếu biên bản của kho',
        'receipt',
      ],
      [
        'Đang nhận thiếu',
        s.purchases.filter((p) => p.status === 'partially_received').length,
        'Theo dõi NCC giao bổ sung',
        'truck',
      ],
      [
        'Đã nhận đủ',
        s.purchases.filter((p) => p.status === 'received').length,
        'Đã nhập đúng số lượng đạt',
        'check',
      ],
    ]) +
    `<div class="workflow-guide"><span>01 · Kho gửi yêu cầu</span><span>02 · Admin phê duyệt</span><span>03 · Kho khai thực nhận</span><span>04 · Admin chốt đối chiếu</span></div>` +
    restockSuggestionsHTML() +
    `<section class="panel"><div class="panel-head"><h2>Yêu cầu nhập hàng</h2><span class="sub">Không cộng tồn khi chỉ lập phiếu</span></div><div class="table-tools">${filterInput('purchases', 'Tìm mã yêu cầu hoặc nhà cung cấp…')}${filterSelect('status', [['', 'Tất cả bước xử lý'], ...['draft', 'submitted', 'approved', 'receipt_pending', 'partially_received', 'received', 'closed_short', 'rejected', 'cancelled'].map((k) => [k, { draft: 'Nháp', submitted: 'Chờ admin', approved: 'Đã duyệt', receipt_pending: 'Chờ đối chiếu thực nhận', partially_received: 'Nhận thiếu', received: 'Nhận đủ', closed_short: 'Chốt thiếu', rejected: 'Từ chối', cancelled: 'Hủy' }[k]])])}</div>${table(
      [
        'Mã yêu cầu',
        'Nhà cung cấp',
        'Ngày / người lập',
        'Đặt / đạt đã nhập',
        'Giá trị đề nghị',
        'Trạng thái',
        '',
      ],
      p.items.map(
        (p) =>
          `<tr><td class="name">${e(p.id)}</td><td>${e(p.supplier)}</td><td>${date(p.time)}<div class="sub">${e(p.actor)}</div></td><td>${p.items.reduce((a, i) => a + i.qty, 0)} / ${p.items.reduce((a, i) => a + i.receivedQty, 0)}</td><td>${money(p.total)}</td><td>${workflowStatus(p.status)}</td><td>${action('purchase-detail', 'Xem & xử lý', 'eye', 'small', `data-id="${e(p.id)}"`)}</td></tr>`,
      ),
    )}${p.foot}</section>`
  );
}
function purchaseModal(productId = '') {
  store.require('purchases');
  const suppliers = store.data.suppliers.filter((s) => s.active),
    chosen = store.data.products.find((p) => p.id === productId && p.active);
  if (productId && (!chosen || !suppliers.some((s) => s.id === chosen.supplierId)))
    throw new Error('Sản phẩm/nhà cung cấp không hoạt động.');
  purchaseLines = [];
  modalContext = { type: 'purchase' };
  showModal(
    'Kho lập yêu cầu nhập hàng',
    `<form id="purchase-form"><div class="modal-content stack"><div class="note">Yêu cầu được gửi lên admin kiểm duyệt trước khi liên hệ đặt NCC. Chưa cộng tồn kho.</div>${selectField(
      'Nhà cung cấp',
      'supplierId',
      suppliers.map((s) => [s.id, s.name]),
      chosen?.supplierId || suppliers[0]?.id,
      'id="purchase-supplier" required',
    )}<div id="purchase-restock-suggestions"></div><div class="form-grid">${selectField('Sản phẩm đề nghị', 'productId', [], '', 'id="purchase-product"', true)}${field('Số lượng cần nhập', 'qty', 1, 'number', 'id="purchase-qty" min="1" step="1"')}${field('Giá nhập dự kiến (₫)', 'price', 0, 'number', 'id="purchase-price" min="0" step="1"')}</div>${action('purchase-line-add', 'Thêm vào đề nghị', 'plus')}<div id="purchase-lines"></div>${textField('Lý do / căn cứ đề nghị nhập', 'note')}${selectField(
      'Lưu yêu cầu',
      'status',
      [
        ['submitted', 'Gửi admin kiểm duyệt'],
        ['draft', 'Lưu nháp để hoàn thiện'],
      ],
      'submitted',
    )}${formError()}</div>${foot('Lưu / gửi yêu cầu')}</form>`,
    true,
  );
  updatePurchaseOptions();
  if (chosen) addSuggestedPurchase(chosen.id);
}
function updatePurchaseOptions() {
  const sid = $('#purchase-supplier').value,
    products = store.data.products.filter((p) => p.active && p.supplierId === sid);
  $('#purchase-product').innerHTML = products
    .map(
      (p) =>
        `<option value="${e(p.id)}">${e(p.name)} · Bán được ${store.saleableStock(p.id)}</option>`,
    )
    .join('');
  $('#purchase-price').value = products[0]?.cost || 0;
  purchaseLines = [];
  renderPurchaseLines();
}
function renderPurchaseLines() {
  $('#purchase-lines').innerHTML =
    table(
      ['Sản phẩm', 'Số lượng đặt', 'Đơn giá dự kiến', 'Giá trị', ''],
      purchaseLines.map(
        (i, n) =>
          `<tr><td class="name">${e(i.name)}</td><td><input class="purchase-line-input" type="number" required min="1" step="1" value="${i.qty}" data-purchase-field="qty" data-index="${n}" aria-label="Số lượng đề nghị ${e(i.name)}"></td><td><input class="purchase-line-input purchase-line-price" type="number" required min="0" step="1" value="${i.price}" data-purchase-field="price" data-index="${n}" aria-label="Giá dự kiến ${e(i.name)}"></td><td>${money(i.qty * i.price)}</td><td>${ib('purchase-line-delete', 'trash', 'Bỏ sản phẩm khỏi yêu cầu', `data-index="${n}"`)}</td></tr>`,
      ),
    ) +
    `<p class="right mt16"><strong>Tổng đề nghị ${money(purchaseLines.reduce((a, i) => a + i.qty * i.price, 0))}</strong></p>`;
  renderSupplierRestockSuggestions();
}
function purchaseDetail(purchaseId) {
  const p = store.data.purchases.find((p) => p.id === purchaseId);
  if (!p) throw new Error('Yêu cầu không tồn tại.');
  const admin = store.user.role === 'ADMIN',
    reports = store.data.purchaseReceipts.filter((r) => r.purchaseId === p.id);
  const actions = [];
  if (p.status === 'draft' && (admin || p.creatorId === store.user.id))
    actions.push(
      action('purchase-send', 'Gửi admin duyệt', 'upload', 'primary', `data-id="${e(p.id)}"`),
    );
  if (admin && p.status === 'submitted')
    actions.push(
      action(
        'purchase-review',
        'Từ chối yêu cầu',
        '',
        'danger',
        `data-id="${e(p.id)}" data-decision="reject"`,
      ),
      action(
        'purchase-review',
        'Duyệt đặt hàng',
        'check',
        'primary',
        `data-id="${e(p.id)}" data-decision="approve"`,
      ),
    );
  if (['approved', 'partially_received'].includes(p.status))
    actions.push(
      action(
        'purchase-report',
        'Ghi nhận hàng thực nhận',
        'truck',
        'primary',
        `data-id="${e(p.id)}"`,
      ),
    );
  if (admin && ['approved', 'partially_received'].includes(p.status))
    actions.push(action('purchase-short', 'Chốt không giao thêm', '', '', `data-id="${e(p.id)}"`));
  if (
    ['draft', 'submitted', 'approved'].includes(p.status) &&
    (admin || (p.status === 'draft' && p.creatorId === store.user.id))
  )
    actions.push(action('purchase-cancel', 'Hủy yêu cầu', '', 'danger', `data-id="${e(p.id)}"`));
  showModal(
    'Theo dõi yêu cầu & số hàng thực nhận',
    `<div class="modal-content stack"><div class="between"><div><h3>${e(p.id)}</h3><p class="sub">${e(p.supplier)} · Lập bởi ${e(p.actor)} · ${date(p.time)}</p></div>${workflowStatus(p.status)}</div>${table(
      ['Sản phẩm', 'Yêu cầu', 'Đạt đã nhập', 'Còn thiếu', 'Không đạt', 'Giá nhập'],
      p.items.map(
        (i) =>
          `<tr><td class="name">${e(i.name)}</td><td>${i.qty}</td><td class="positive">${i.receivedQty}</td><td class="${i.qty - i.receivedQty ? 'negative' : ''}">${i.qty - i.receivedQty}</td><td>${i.rejectedQty}</td><td>${money(i.price)}</td></tr>`,
      ),
    )}<div class="mini-cards"><div class="mini-card">Giá trị đặt dự kiến<strong>${money(p.total)}</strong></div><div class="mini-card">Giá trị hàng đạt đã nhập<strong>${money(p.items.reduce((a, i) => a + i.receivedQty * i.price, 0))}</strong></div></div>${p.note ? `<p class="sub">Lý do đề nghị: ${e(p.note)}</p>` : ''}${p.reviewNote ? `<div class="note">Admin ${e(p.reviewer)}: ${e(p.reviewNote)}</div>` : ''}${p.closeNote ? `<div class="note yellow">Kết luận: ${e(p.closeNote)}</div>` : ''}<h3>Biên bản từng lần giao hàng</h3>${reports.map((r) => receiptReportHTML(r)).join('') || '<p class="sub">Chưa ghi nhận giao hàng từ NCC. Kho chỉ khai thực nhận sau khi yêu cầu được duyệt.</p>'}<div class="note">Hàng thiếu được giữ để NCC giao bù. Admin có thể chốt số còn thiếu với lý do và xác nhận của NCC. Không sửa số thực nhận để giả lập nhận đủ.</div></div><div class="modal-footer wrap">${actions.join('') || action('close-modal', 'Đóng')}</div>`,
    true,
  );
}
