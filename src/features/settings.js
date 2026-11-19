function settingsView() {
  const s = store.data.settings;
  return (
    heading(
      'QUẢN TRỊ / CẤU HÌNH',
      'Cấu hình hệ thống',
      'Thông tin cửa hàng, thanh toán, hóa đơn và sao lưu dữ liệu.',
    ) +
    `<div class="two-col"><section class="panel"><div class="panel-head"><h2>Thông tin cửa hàng & hóa đơn</h2></div><form id="settings-form"><div class="panel-body form-grid">${field('Tên cửa hàng', 'name', s.name, 'text', 'required maxlength="150"', true)}${field('Số điện thoại', 'phone', s.phone, 'text', 'required maxlength="30"')}${field('Thuế suất (%)', 'taxRate', s.taxRate, 'number', 'required min="0" max="100" step="1"')}${field('Địa chỉ', 'address', s.address, 'text', 'required maxlength="250"', true)}${field('Ngân hàng nhận chuyển khoản', 'bank', s.bank, 'text', 'required maxlength="100"')}${field('Số tài khoản', 'bankAccount', s.bankAccount, 'text', 'required maxlength="60"')}${field('Tên chủ tài khoản', 'bankOwner', s.bankOwner, 'text', 'required maxlength="150"', true)}${textField('Lời nhắn trên hóa đơn', 'receiptNote', s.receiptNote)}<div class="full"><button class="btn primary" type="submit">${icon('check')}Lưu thay đổi</button></div>${formError()}</div></form></section><div class="stack"><section class="panel"><div class="panel-head"><h2>Quy tắc vận hành</h2></div><div class="panel-body rules">${[
      ['shield', 'Phân quyền theo vai trò', 'Quản trị · Thu ngân · Kho'],
      ['receipt', 'Lưu hóa đơn thanh toán', 'Tự động ghi nhận sau thanh toán'],
      ['warehouse', 'Kiểm kê có biên bản', 'Lưu người thực hiện và lý do'],
      ['truck', 'Nhập hàng cần phê duyệt', 'Kho gửi yêu cầu, admin duyệt thực nhận'],
    ]
      .map(
        ([ico, title, desc]) =>
          `<div class="rule"><span class="badge">${icon(ico)}</span><div><strong>${title}</strong><p class="sub">${desc}</p></div>${badge('Hoạt động')}</div>`,
      )
      .join(
        '',
      )}</div></section><section class="panel"><div class="panel-head"><h2>Sao lưu & khôi phục</h2></div><div class="panel-body stack"><p class="sub">Dữ liệu nằm trên trình duyệt này. Tải bản sao lưu định kỳ để giữ hóa đơn, tồn kho và danh mục.</p>${action('backup', 'Tải bản sao lưu JSON', 'download')}${action('restore', 'Khôi phục từ bản sao lưu', 'upload')}<p class="sub">Tệp sao lưu có chứa hồ sơ khách hàng và tài khoản dùng thử. Hãy lưu ở nơi riêng tư.</p></div></section></div></div><section class="panel mt16"><div class="panel-head"><h2>Nhật ký thao tác gần đây</h2></div><div class="panel-body">${store.data.logs
      .slice(0, 12)
      .map(
        (l) =>
          `<div class="activity"><i class="dot"></i><div><p><strong>${e(l.action)}</strong> · ${e(l.detail)}</p><small>${date(l.time)} · ${e(l.actor)}</small></div></div>`,
      )
      .join('')}</div></section>`
  );
}
