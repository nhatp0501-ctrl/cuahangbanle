function handleSalesAction(a) {
  switch (a.action) {
    case 'choose-product':
      quantityModal(a.id);
      break;
    case 'quantity-preset':
      $('#quantity-input').value = a.qty;
      break;
    case 'pos-page':
      posProductPage += Number(a.delta);
      render();
      break;
    case 'discount-clear':
      changeDraft((d) => {
        d.discountSelection = { kind: 'auto', id: '' };
      });
      break;
    case 'voucher-apply': {
      const code = $('#voucher-code').value.trim().toUpperCase(),
        v = store.data.vouchers.find((v) => v.code === code);
      if (!v) throw new Error('Không tìm thấy mã voucher.');
      applyDiscount('voucher', v.id);
      break;
    }
    case 'customer-select':
      selectPhoneCustomer(a.id);
      break;

    case 'customer-clear':
      clearPhoneCustomer();
      break;
    case 'category':
      posProductPage = 1;
      activeCategory = a.category;
      render();
      break;

    case 'add-cart':
      addCart(a.id);
      break;

    case 'cart-qty':
      addCart(a.id, Number(a.delta));
      break;

    case 'remove-cart':
      changeDraft((d) => {
        d.items = d.items.filter((i) => i.id !== a.id);
        d.discount = Math.min(
          d.discount,
          d.items.reduce((s, i) => s + i.qty * i.price, 0),
        );
      });
      break;

    case 'cart-minus':
      addCart(a.id, -1);
      break;

    case 'cart-remove':
      changeDraft((d) => {
        d.items = d.items.filter((i) => i.id !== a.id);
        d.discount = Math.min(
          d.discount,
          d.items.reduce((s, i) => s + i.qty * i.price, 0),
        );
      });
      break;

    case 'clear-cart':
      confirmation('Xóa giỏ hàng?', 'Giỏ hàng hiện tại sẽ được xóa.', () => {
        changeDraft((d) => {
          d.items = [];
          d.discount = 0;
        });
      });
      break;

    case 'hold':
      store.hold();
      render();
      notify('Đã lưu đơn tạm. Bạn có thể tạo đơn tiếp theo.');
      break;

    case 'held-orders':
      heldModal();
      break;

    case 'restore-held':
      store.restoreHeld(a.id);
      closeModal();
      render();
      notify('Đã mở lại đơn tạm.');
      break;

    case 'delete-held': {
      const hid = a.id;
      confirmation('Xóa đơn tạm?', 'Đơn tạm này sẽ được xóa khỏi danh sách.', () => {
        store.deleteHeld(hid);
        render();
        heldModal();
      });
      break;
    }

    case 'checkout':
      if (!store.data.draft.items.length) throw new Error('Chọn sản phẩm trước khi thanh toán.');
      checkoutModal();
      break;

    case 'payment-method':
      checkoutModal(a.method);
      break;

    case 'quick-cash':
      $('#cash-input').value = a.amount;
      updateCash();
      break;

    case 'numpad': {
      const input = $('#cash-input');
      input.value =
        a.key === 'C'
          ? ''
          : a.key === '⌫'
            ? input.value.slice(0, -1)
            : (input.value === '0' ? '' : input.value) + a.key;
      updateCash();
      break;
    }

    case 'scan':
      modalContext = { type: 'scan' };
      showModal(
        'Quét / nhập mã sản phẩm',
        `<form id="scan-form"><div class="modal-content stack">${field('Mã vạch hoặc mã sản phẩm', 'code', '', 'text', 'required autofocus autocomplete="off"')}<div class="note">Dùng máy quét mã vạch USB hoặc nhập mã và nhấn Enter. Không cần bật camera.</div>${formError()}</div>${foot('Thêm vào giỏ')}</form>`,
      );
      break;

    case 'search-product':
      navigate('pos');
      addCart(a.id);
      $('#global-search').value = '';
      $('#global-results')?.remove();
      break;
    default:
      return false;
  }
  return true;
}
