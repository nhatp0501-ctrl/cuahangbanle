let discountManagementTab = 'vouchers';
function promotionsView() {
  const s = store.data,
    near = s.lots.filter((l) => l.qty > l.blockedQty && store.lotStatus(l) === 'near');
  let body = '';
  if (discountManagementTab === 'near') {
    const p = paginate(near, 'near-discounts');
    body =
      table(
        ['Sản phẩm / lô', 'Hạn sử dụng', 'Có thể giảm giá', 'Thao tác'],
        p.items.map(
          (l) =>
            `<tr><td class="name">${e(s.products.find((p) => p.id === l.productId)?.name)}<div class="sub">${e(l.code)}</div></td><td>${expiryText(l.expiryDate)}</td><td>${l.qty - l.blockedQty}</td><td>${action('promotion-lot', 'Đưa lô vào chương trình', 'plus', 'primary small', `data-id="${e(l.id)}"`)}</td></tr>`,
        ),
      ) + p.foot;
  } else if (discountManagementTab === 'vouchers') {
    body = table(
      ['Mã / tên voucher', 'Nguồn & phạm vi', 'Mức giảm', 'Hiệu lực', 'Lượt dùng', ''],
      s.vouchers.map(
        (v) =>
          `<tr><td class="name">${e(v.code)}<div class="sub">${e(v.name)}</div></td><td>${v.source === 'partner' ? `Đối tác: ${e(s.suppliers.find((x) => x.id === v.partnerSupplierId)?.name || v.partner)}<div class="sub">Chỉ hàng của đối tác${v.productIds?.length ? ' · ' + v.productIds.length + ' mã' : ''}</div>` : 'Cửa hàng · Toàn bộ sản phẩm'}</td><td>${v.type === 'percent' ? v.value + '%' : money(v.value)}</td><td>${expiryText(v.startsOn)} – ${expiryText(v.endsOn)}<div class="sub">${v.active ? 'Đang bật' : 'Tạm dừng'}</div></td><td>${v.used}/${v.limit}</td><td>${action('discount-edit', 'Chỉnh sửa', 'edit', 'small', `data-kind="voucher" data-id="${e(v.id)}"`)}</td></tr>`,
      ),
    );
  } else
    body = table(
      ['Chương trình', 'Phạm vi', 'Mức giảm', 'Hiệu lực', 'Trạng thái', ''],
      s.promotions.map(
        (p) =>
          `<tr><td class="name">${e(p.name)}</td><td>${p.productIds.length} sản phẩm${p.lotIds.length ? ` · ${p.lotIds.length} lô chỉ định` : ''}</td><td>${p.type === 'quantity' ? `Mua ${p.buyQty} giảm ${money(p.value)} / nhóm cùng mã` : p.type === 'percent' ? p.value + '%' : money(p.value)}</td><td>${expiryText(p.startsOn)} – ${expiryText(p.endsOn)}</td><td>${p.active ? badge('Đang bật') : badge('Tạm dừng', 'gray')}</td><td>${action('discount-edit', 'Chỉnh sửa', 'edit', 'small', `data-kind="promotion" data-id="${e(p.id)}"`)}</td></tr>`,
      ),
    );
  return (
    heading(
      'QUẢN TRỊ / GIẢM GIÁ',
      'Voucher & chương trình khuyến mãi',
      'Tự động gợi ý và chọn chương trình đủ điều kiện tốt nhất. Mức giảm thực tế từ 1.000đ; không cộng dồn voucher.',
      action('discount-new', 'Thêm voucher', 'plus', '', 'data-kind="voucher"') +
        action('discount-new', 'Tạo chương trình', 'plus', 'primary', 'data-kind="promotion"'),
    ) +
    stats([
      [
        'Voucher cửa hàng',
        s.vouchers.filter((v) => v.source === 'store').length,
        'Dùng chung toàn bộ mặt hàng',
        'receipt',
      ],
      [
        'Voucher đối tác',
        s.vouchers.filter((v) => v.source === 'partner').length,
        'Giới hạn đúng sản phẩm đối tác',
        'branch',
      ],
      ['Chương trình KM', s.promotions.length, 'Theo sản phẩm / lô chỉ định', 'box'],
      ['Lô cận date', near.length, 'Chọn để giải phóng hàng còn hạn', 'clock'],
    ]) +
    `<div class="tabs">${[
      ['vouchers', 'Voucher'],
      ['programs', 'Chương trình'],
      ['near', 'Hàng cận date'],
    ]
      .map(
        ([k, label]) =>
          `<button data-action="discount-manage-tab" data-tab="${k}" class="${discountManagementTab === k ? 'active' : ''}">${label}</button>`,
      )
      .join(
        '',
      )}</div><section class="panel"><div class="panel-head"><h2>${discountManagementTab === 'near' ? 'Các lô còn hạn cần thúc đẩy bán' : 'Danh sách ưu đãi'}</h2></div>${body}</section>`
  );
}
function discountModal(kind, discountId = '', lotId = '') {
  store.admin();
  const list = kind === 'voucher' ? store.data.vouchers : store.data.promotions;
  const v = list.find((r) => r.id === discountId) || {
    active: true,
    type: 'percent',
    value: 10,
    minSpend: 0,
    maxDiscount: 50000,
    startsOn: Retail.today(),
    endsOn: Retail.addDays(14),
    source: 'store',
    limit: 100,
    productIds: [],
    lotIds: [],
  };
  const chosenLot = lotId ? store.data.lots.find((l) => l.id === lotId) : null;
  if (chosenLot) {
    if (store.lotStatus(chosenLot) !== 'near') throw new Error('Chọn lô cận date còn hạn.');
    v.productIds = [chosenLot.productId];
    v.lotIds = [chosenLot.id];
    v.endsOn = v.endsOn > chosenLot.expiryDate ? chosenLot.expiryDate : v.endsOn;
  }
  modalContext = { type: 'discount', kind, discountId };
  const near = store.data.lots.filter(
    (l) => l.qty > l.blockedQty && (store.lotStatus(l) === 'near' || v.lotIds?.includes(l.id)),
  );
  let fields = field('Tên ưu đãi', 'name', v.name || '', 'text', 'required maxlength="150"', true);
  if (kind === 'voucher')
    fields +=
      field('Mã voucher', 'code', v.code || '', 'text', 'required maxlength="40"') +
      selectField(
        'Nguồn voucher',
        'source',
        [
          ['store', 'Cửa hàng — toàn bộ sản phẩm'],
          ['partner', 'Đối tác — chỉ hàng của đối tác'],
        ],
        v.source,
        'id="voucher-source"',
      ) +
      selectField(
        'Đối tác / nhà cung cấp (chỉ cho voucher đối tác)',
        'partnerSupplierId',
        store.data.suppliers.filter((s) => s.active).map((s) => [s.id, s.name]),
        v.partnerSupplierId || store.data.suppliers[0]?.id,
        '',
        true,
      ) +
      field(
        'Tổng lượt được sử dụng',
        'limit',
        v.limit,
        'number',
        'required min="1" step="1"',
        true,
      );
  fields +=
    selectField(
      'Cách giảm',
      'type',
      [
        ['percent', 'Theo phần trăm'],
        ['fixed', 'Số tiền cố định'],
        ...(kind === 'promotion' ? [['quantity', 'Mua đủ số lượng → giảm tiền mỗi nhóm']] : []),
      ],
      v.type,
      'id="discount-type"',
    ) +
    field(
      'Mức giảm (₫ hoặc %; số tiền từ 1.000đ)',
      'value',
      v.value,
      'number',
      `id="discount-value" required min="${v.type === 'percent' ? 1 : 1000}" ${v.type === 'percent' ? 'max="100"' : ''} step="1"`,
    ) +
    (kind === 'promotion'
      ? field(
          'Số lượng mỗi nhóm cùng mã (chỉ dùng khi mua đủ số lượng)',
          'buyQty',
          v.buyQty || 2,
          'number',
          'required min="2" step="1"',
        )
      : '') +
    field('Đơn tối thiểu (₫)', 'minSpend', v.minSpend, 'number', 'required min="0" step="1"') +
    field(
      'Giảm tối đa (₫, 0 = không đặt trần)',
      'maxDiscount',
      v.maxDiscount,
      'number',
      'required min="0" step="1"',
    ) +
    field('Từ ngày', 'startsOn', v.startsOn, 'date', 'required') +
    field('Đến ngày', 'endsOn', v.endsOn, 'date', 'required') +
    selectField(
      'Trạng thái',
      'active',
      [
        ['true', 'Bật ưu đãi'],
        ['false', 'Tạm dừng'],
      ],
      String(v.active),
      '',
      true,
    );
  if (kind === 'promotion')
    fields += `<div class="full"><h3>Sản phẩm áp dụng</h3><input data-list-filter placeholder="Lọc sản phẩm…" aria-label="Lọc sản phẩm khuyến mãi">${productChecklist(
      'productIds',
      store.data.products.filter((p) => p.active),
      v.productIds,
    )}<h3 class="mt16">Giới hạn theo lô cận date (không chọn = toàn bộ lô của sản phẩm)</h3><div class="scope-checklist">${near.map((l) => `<label class="scope-product"><input type="checkbox" name="lotIds" value="${e(l.id)}" ${v.lotIds.includes(l.id) ? 'checked' : ''}><span>${e(store.data.products.find((p) => p.id === l.productId)?.name)}<small>Lô ${e(l.code)} · HSD ${expiryText(l.expiryDate)} · ${l.qty - l.blockedQty} sản phẩm</small></span></label>`).join('') || '<p class="sub">Chưa có lô cận date.</p>'}</div></div>`;
  fields += formError();
  showModal(
    kind === 'voucher' ? 'Thiết lập voucher' : 'Thiết lập chương trình khuyến mãi',
    `<form id="discount-form"><div class="modal-content form-grid">${fields}</div>${foot('Lưu ưu đãi')}</form>`,
    true,
  );
}
