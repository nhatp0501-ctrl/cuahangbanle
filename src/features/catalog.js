function entitiesView(type) {
  const s = store.data,
    config = {
      suppliers: [
        'ĐỐI TÁC / NHÀ CUNG CẤP',
        'Nhà cung cấp',
        'Hồ sơ đối tác, vùng cung ứng và lịch sử hợp tác.',
        'Thêm nhà cung cấp',
      ],
      customers: [
        'QUẢN LÝ / KHÁCH HÀNG',
        'Khách hàng',
        'Lưu hồ sơ khách hàng và tra cứu lịch sử mua sắm.',
        'Thêm khách hàng',
      ],
      staff: [
        'QUẢN TRỊ / NHÂN VIÊN',
        'Nhân viên & tài khoản',
        'Quản lý hồ sơ, trạng thái và quyền truy cập theo vai trò.',
        'Thêm nhân viên',
      ],
    }[type];
  const entries = s[type],
    list = entries.filter((x) =>
      match(`${x.name} ${x.id} ${x.phone || ''} ${x.username || ''}`, filters[type] || ''),
    );
  const p = paginate(list, type);
  const metrics =
    type === 'suppliers'
      ? [
          ['Nhà cung cấp', entries.length, 'Đối tác trong danh sách', 'truck'],
          [
            'Đang hợp tác',
            entries.filter((x) => x.active).length,
            'Có thể lập phiếu nhập',
            'check',
          ],
          [
            'Ngừng hợp tác',
            entries.filter((x) => !x.active).length,
            'Không tạo phiếu nhập mới',
            'return',
          ],
          [
            'Vùng cung ứng',
            new Set(entries.flatMap((s) => s.areas.split(',').map((x) => x.trim()))).size,
            'Khu vực đối tác phục vụ',
            'branch',
          ],
        ]
      : type === 'customers'
        ? [
            ['Khách hàng', entries.length, 'Hồ sơ đang lưu', 'users'],
            [
              'Đang hoạt động',
              entries.filter((x) => x.active).length,
              'Có thể gắn vào đơn hàng',
              'check',
            ],
            [
              'Khách quay lại',
              entries.filter((c) => s.orders.filter((o) => o.customerId === c.id).length > 1)
                .length,
              'Đã có trên một đơn hàng',
              'return',
            ],
            [
              'Giá trị đơn trung bình',
              money(
                Math.round(
                  s.orders.reduce((a, o) => a + o.total, 0) / Math.max(s.orders.length, 1),
                ),
              ),
              'Trên tất cả hóa đơn đã lưu',
              'receipt',
            ],
          ]
        : [
            ['Tổng nhân viên', entries.length, 'Hồ sơ nhân sự', 'users'],
            [
              'Đang hoạt động',
              entries.filter((x) => x.active).length,
              'Tài khoản được đăng nhập',
              'check',
            ],
            [
              'Quản trị viên',
              entries.filter((x) => x.role === 'ADMIN').length,
              'Quyền quản trị hệ thống',
              'shield',
            ],
            [
              'Tài khoản khóa',
              entries.filter((x) => !x.active).length,
              'Không thể đăng nhập',
              'logout',
            ],
          ];
  let headers, rows;
  if (type === 'products')
    fields +=
      field(
        'Đường dẫn ảnh bao bì local',
        'image',
        v.image || 'assets/product-placeholder.svg',
        'text',
        'maxlength="200"',
        true,
      ) +
      selectField(
        'Quản lý HSD theo lô',
        'tracksExpiry',
        [
          ['true', 'Có — hàng tiêu dùng'],
          ['false', 'Không — giấy/đồ dùng không HSD'],
        ],
        String(v.tracksExpiry !== false),
        '',
        true,
      ) +
      (!recordId
        ? field('Mã lô tồn đầu kỳ', 'lotCode', '', 'text', '', false) +
          field('HSD lô tồn đầu kỳ', 'expiryDate', '', 'date')
        : '');
  if (type === 'suppliers') {
    headers = [
      'Mã NCC',
      'Tên đối tác',
      'Nhóm cung cấp',
      'Điện thoại',
      'Vùng cung ứng',
      'Trạng thái',
      '',
    ];
    rows = p.items.map(
      (x) =>
        `<tr><td>${e(x.id)}</td><td class="name">${e(x.name)}</td><td>${e(x.category)}</td><td>${e(x.phone)}</td><td>${e(x.areas)}</td><td>${x.active ? badge('Đang hợp tác') : badge('Ngừng hợp tác', 'gray')}</td><td>${ibEntity(type, x.id)}${ib('supplier-history', 'receipt', 'Lịch sử nhập hàng', `data-id="${e(x.id)}"`)}</td></tr>`,
    );
  }
  if (type === 'customers') {
    headers = ['Mã KH', 'Họ tên', 'Điện thoại', 'Số đơn', 'Tổng mua ròng', 'Trạng thái', ''];
    rows = p.items.map((x) => {
      const orders = s.orders.filter((o) => o.customerId === x.id);
      const refunds = s.returns
        .filter((r) => r.status === 'approved' && orders.some((o) => o.id === r.orderId))
        .reduce((a, r) => a + r.amount, 0);
      return `<tr><td>${e(x.id)}</td><td class="name">${e(x.name)}</td><td>${e(x.phone)}</td><td>${orders.length}</td><td class="money name">${money(orders.reduce((a, o) => a + o.total, 0) - refunds)}</td><td>${x.active ? badge('Hoạt động') : badge('Tạm ngừng', 'gray')}</td><td>${ibEntity(type, x.id)}${ib('customer-history', 'receipt', 'Lịch sử mua hàng', `data-id="${e(x.id)}"`)}</td></tr>`;
    });
  }
  if (type === 'staff') {
    headers = ['Mã NV', 'Họ và tên', 'Tên đăng nhập', 'Vai trò', 'Trạng thái', 'Thao tác'];
    rows = p.items.map(
      (x) =>
        `<tr><td>${e(x.id)}</td><td class="name">${e(x.name)}</td><td>${e(x.username)}</td><td><span class="badge">${ROLES[x.role]}</span></td><td>${x.active ? badge('Đang làm việc') : badge('Tài khoản khóa', 'red')}</td><td>${action('entity-edit', 'Phân quyền', 'shield', 'small', `data-type="staff" data-id="${e(x.id)}"`)}</td></tr>`,
    );
  }
  return (
    heading(
      config[0],
      config[1],
      config[2],
      action('entity-new', config[3], 'plus', 'primary', `data-type="${type}"`),
    ) +
    stats(metrics) +
    `<section class="panel"><div class="panel-head"><h2>Danh sách ${type === 'staff' ? 'nhân viên' : type === 'customers' ? 'khách hàng' : 'nhà cung cấp'}</h2>${type === 'staff' ? badge('Phân quyền theo vai trò', 'gray') : ''}</div><div class="table-tools">${filterInput(type, 'Tìm kiếm theo tên, mã hoặc thông tin liên hệ…')}</div>${table(headers, rows)}${p.foot}</section>${type === 'staff' ? '<div class="note mt16">Quản trị viên: toàn bộ chức năng · Thu ngân: POS, đơn hàng, khách hàng, tạo yêu cầu trả · Nhân viên kho: xem sản phẩm, kiểm kê, nhập hàng, nhà cung cấp. Phê duyệt hoàn tiền cần quyền quản trị.</div>' : ''}`
  );
}

function entityModal(type, recordId = '') {
  store.require(type === 'staff' ? 'staff' : type);
  if (type === 'products') store.admin();
  const v = store.data[type].find((x) => x.id === recordId) || { active: true };
  modalContext = { type: 'entity', entity: type, id: recordId };
  let fields = field(
    'Tên / Họ tên',
    'name',
    v.name || '',
    'text',
    'required maxlength="150"',
    true,
  );
  if (type === 'products')
    fields =
      field('Tên sản phẩm', 'name', v.name || '', 'text', 'required maxlength="150"', true) +
      field('Mã vạch (duy nhất)', 'barcode', v.barcode || '', 'text', 'required maxlength="60"') +
      field('Biểu tượng sản phẩm', 'icon', v.icon || '📦', 'text', 'required maxlength="8"') +
      field(
        'Danh mục',
        'category',
        v.category || 'Thực phẩm khô',
        'text',
        'required list="category-options" maxlength="80"',
      ) +
      selectField(
        'Nhà cung cấp',
        'supplierId',
        store.data.suppliers.map((s) => [s.id, s.name]),
        v.supplierId || store.data.suppliers[0]?.id,
        'required',
      ) +
      field('Giá bán (₫)', 'price', v.price ?? 0, 'number', 'required min="0" step="1"') +
      field('Giá vốn (₫)', 'cost', v.cost ?? 0, 'number', 'required min="0" step="1"') +
      field(
        'Ngưỡng tồn kho thấp',
        'minStock',
        v.minStock ?? 15,
        'number',
        'required min="0" step="1"',
      ) +
      (!recordId
        ? field('Tồn đầu kỳ', 'stock', 0, 'number', 'required min="0" step="1"')
        : '<div class="note">Điều chỉnh số lượng hàng ở chức năng Kho & kiểm kê.</div>') +
      `<datalist id="category-options">${[...new Set(store.data.products.map((p) => p.category))].map((c) => `<option value="${e(c)}">`).join('')}</datalist>`;
  if (type === 'suppliers')
    fields +=
      field('Số điện thoại', 'phone', v.phone || '', 'tel', 'required maxlength="30"') +
      field(
        'Nhóm hàng cung cấp',
        'category',
        v.category || '',
        'text',
        'required maxlength="120"',
      ) +
      field(
        'Vùng cung ứng (phân tách bằng dấu phẩy)',
        'areas',
        v.areas || 'TP. HCM',
        'text',
        'required maxlength="250"',
        true,
      );
  if (type === 'customers')
    fields +=
      field('Số điện thoại', 'phone', v.phone || '', 'tel', 'required maxlength="18"') +
      field('Email (không bắt buộc)', 'email', v.email || '', 'email', 'maxlength="150"');
  if (type === 'staff')
    fields +=
      field(
        'Tên đăng nhập',
        'username',
        v.username || '',
        'text',
        'required minlength="3" maxlength="40" autocomplete="off"',
      ) +
      field(
        recordId ? 'Mật khẩu mới (để trống để giữ nguyên)' : 'Mật khẩu',
        'password',
        '',
        'password',
        `${recordId ? '' : 'required'} minlength="6" maxlength="100" autocomplete="new-password"`,
      ) +
      selectField('Vai trò', 'role', Object.entries(ROLES), v.role || 'CASHIER', '', true);
  fields +=
    selectField(
      'Trạng thái',
      'active',
      [
        ['true', type === 'staff' ? 'Đang làm việc' : 'Đang hoạt động'],
        ['false', type === 'staff' ? 'Khóa tài khoản' : 'Ngừng hoạt động'],
      ],
      String(v.active),
      '',
      true,
    ) + formError();
  showModal(
    `${recordId ? 'Chỉnh sửa' : 'Thêm'} ${type === 'products' ? 'sản phẩm' : type === 'suppliers' ? 'nhà cung cấp' : type === 'customers' ? 'khách hàng' : 'nhân viên'}`,
    `<form id="entity-form"><div class="modal-content form-grid">${fields}</div>${foot()}</form>`,
    type === 'products',
  );
}

function customerHistory(customerId) {
  const c = store.data.customers.find((c) => c.id === customerId);
  const orders = store.data.orders.filter((o) => o.customerId === customerId);
  showModal(
    `Lịch sử mua hàng · ${e(c.name)}`,
    `<div class="modal-content"><p class="sub mb16">${e(c.phone)} · ${orders.length} đơn hàng</p>${orderTable(orders)}</div>`,
    true,
  );
}

function supplierHistory(supplierId) {
  const s = store.data.suppliers.find((s) => s.id === supplierId);
  const orders = store.data.purchases.filter((p) => p.supplierId === supplierId);
  showModal(
    `Lịch sử nhập · ${e(s.name)}`,
    `<div class="modal-content">${table(
      ['Phiếu nhập', 'Ngày', 'Giá trị', 'Trạng thái'],
      orders.map(
        (o) =>
          `<tr><td>${action('purchase-detail', e(o.id), '', 'ghost small', `data-id="${e(o.id)}"`)}</td><td>${date(o.time)}</td><td>${money(o.total)}</td><td>${status(o.status)}</td></tr>`,
      ),
    )}</div>`,
    true,
  );
}
