document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.dataset.filter && el.tagName === 'INPUT' && el.type !== 'date') {
    filters[el.dataset.filter] = el.value;
    pagination = {};
    render();
  }
  if (el.id === 'global-search') globalSearch(el.value);
  if (el.id === 'cash-input') updateCash();
  if (el.dataset.listFilter !== undefined) {
    const area = el.closest('.modal-content') || el.parentElement;
    $$('[data-product-search]', area).forEach(
      (row) => (row.hidden = !match(row.dataset.productSearch, el.value)),
    );
  }
  if (el.dataset.receiptField) updateReceiptEntry(el.closest('[data-receipt-product]'));
  if (el.id === 'customer-phone-search') {
    try {
      searchCustomerPhone(el);
    } catch (error) {
      notify(error.message, true);
    }
  }
});
document.addEventListener('change', async (event) => {
  const el = event.target;
  try {
    if (el.dataset.filter && (el.tagName === 'SELECT' || el.type === 'date')) {
      filters[el.dataset.filter] = el.value;
      pagination = {};
      render();
    }
    if (el.dataset.cartQuantity) {
      setCartQuantity(el.dataset.cartQuantity, Number(el.value));
    }
    if (el.id === 'cart-promotion' && el.value) applyDiscount('promotion', el.value);
    if (el.id === 'cart-note') changeDraft((d) => (d.note = el.value));
    if (el.id === 'purchase-supplier') updatePurchaseOptions();
    if (el.id === 'purchase-product')
      $('#purchase-price').value = store.data.products.find((p) => p.id === el.value)?.cost || 0;
    if (el.dataset.purchaseField) {
      const key = el.dataset.purchaseField,
        line = purchaseLines[Number(el.dataset.index)];
      if (!line || !['qty', 'price'].includes(key))
        throw new Error('Mặt hàng không còn trong phiếu.');
      const value = Number(el.value),
        minimum = key === 'qty' ? 1 : 0;
      if (!el.value.trim() || !Number.isSafeInteger(value) || value < minimum) {
        el.value = line[key];
        throw new Error(
          key === 'qty'
            ? 'Số lượng nhập phải là số nguyên lớn hơn 0.'
            : 'Giá nhập phải là số nguyên không âm.',
        );
      }
      line[key] = value;
      renderPurchaseLines();
    }
    if (el.id === 'report-period') {
      reportDays = Number(el.value);
      render();
    }
    if (el.id === 'restore-file' && el.files.length) {
      store.admin();
      const file = el.files[0];
      if (file.size > 20 * 1024 * 1024) throw new Error('Tệp sao lưu quá lớn (tối đa 20 MB).');
      const value = JSON.parse(await file.text());
      Retail.validateBackup(value);
      confirmation(
        'Khôi phục bản sao lưu?',
        `Tệp <strong>${e(file.name)}</strong> có ${value.orders.length} hóa đơn và ${value.products.length} sản phẩm. Dữ liệu hiện tại sẽ được thay thế. Hãy tải bản sao lưu hiện tại trước khi xác nhận.`,
        () => {
          store.importBackup(value);
          if (store.user) {
            shell();
          } else {
            sessionStorage.removeItem('retailflow-user');
            loginScreen();
          }
          notify('Đã khôi phục dữ liệu từ bản sao lưu.');
        },
      );
      el.value = '';
    }
  } catch (error) {
    notify(error.message, true);
    if (['cart-note', 'cart-promotion'].includes(el.id) || el.dataset.cartQuantity) render();
    if (el.id === 'restore-file') el.value = '';
  }
});
