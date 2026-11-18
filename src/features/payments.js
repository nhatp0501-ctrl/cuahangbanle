function checkoutModal(method = 'cash') {
  modalContext = { type: 'checkout', method };
  const t = store.quoteDraft();
  showModal(
    'Thanh toán đơn hàng',
    `<form id="checkout-form"><input type="hidden" name="checkoutKey" value="${e(store.data.draft.checkoutKey)}"><div class="modal-content"><div class="note mb16">Thanh toán đủ toàn bộ hóa đơn trong một lần, bằng một phương thức. Không ghi nợ hoặc chia tiền.</div><div class="payment-total">TỔNG SỐ TIỀN THANH TOÁN<b>${money(t.total)}</b></div><div class="payment-methods">${Object.entries(
      METHODS,
    )
      .map(
        ([key, label]) =>
          `<button type="button" data-action="payment-method" data-method="${key}" class="${method === key ? 'active' : ''}">${icon(key === 'cash' ? 'cash' : key === 'card' ? 'card' : 'transfer')}${label}</button>`,
      )
      .join(
        '',
      )}</div><input type="hidden" name="payment" value="${method}">${method === 'cash' ? `<div class="stack">${field('Tiền khách đưa (₫)', 'received', t.total, 'number', 'id="cash-input" required min="0" step="1"')}<div class="cash-quick">${[50000, 100000, 200000, 500000].map((n) => action('quick-cash', number(n), '', 'small', `data-amount="${n}"`)).join('')}${action('quick-cash', 'Đủ tiền', '', 'small', `data-amount="${t.total}"`)}</div><div class="between"><span class="muted">Tiền trả lại</span><strong id="cash-change" class="positive money">0 ₫</strong></div><details><summary class="sub" style="cursor:pointer">Bàn phím số</summary><div class="numpad mt16">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((n) => `<button type="button" data-action="numpad" data-key="${n}">${n}</button>`).join('')}</div></details></div>` : `<div class="stack">${method === 'transfer' ? `<div class="note">Chuyển khoản tới <strong>${e(store.data.settings.bank)}</strong><br>STK: <strong>${e(store.data.settings.bankAccount)}</strong><br>Chủ tài khoản: ${e(store.data.settings.bankOwner)}<br>Nội dung gợi ý: RF ${Date.now().toString().slice(-6)}</div>` : '<div class="note">Thực hiện giao dịch trên máy POS của cửa hàng, sau đó xác nhận đã nhận đủ tiền.</div>'}<p class="note">Mã giao dịch được hệ thống tự tạo theo dạng <strong>HDxxxxx</strong> khi thanh toán thành công.</p><label class="check-label"><input type="checkbox" name="confirmed" required><span>Tôi đã kiểm tra và xác nhận cửa hàng nhận đủ <strong>${money(t.total)}</strong>.</span></label><p class="sub">Đây là bước ghi nhận thủ công, chưa kết nối ngân hàng hoặc cổng thanh toán.</p></div>`}<div class="mt16">${selectField(
      'Nhóm khách hàng (không bắt buộc)',
      'demographic',
      ['Không ghi nhận', 'Nam', 'Nữ', 'Khác'].map((x) => [x, x]),
      store.data.draft.demographic,
    )}</div>${formError()}</div>${foot('Xác nhận thanh toán', 'teal')}</form>`,
  );
}

function updateCash() {
  const input = $('#cash-input');
  if (input) {
    const t = store.quoteDraft().total;
    $('#cash-change').textContent = money(Math.max(0, Number(input.value) - t));
  }
}
