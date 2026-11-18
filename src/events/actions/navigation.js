function handleNavigationAction(a) {
  switch (a.action) {
    case 'navigate':
      navigate(a.page);
      $('#global-results')?.remove();
      break;

    case 'logout':
      store.userId = null;
      sessionStorage.removeItem('retailflow-user');
      loginScreen();
      break;

    case 'mobile-menu':
      $('.sidebar').classList.toggle('open');
      break;

    case 'close-modal':
      closeModal();
      break;

    case 'confirm': {
      const fn = modalContext.onConfirm;
      closeModal();
      fn();
      break;
    }

    case 'chart-period':
      chartDays = Number(a.days);
      render();
      break;

    case 'paginate':
      pagination[a.key] = (pagination[a.key] || 1) + Number(a.delta);
      render();
      break;

    case 'notifications':
      showModal(
        'Thông báo cửa hàng',
        `<div class="modal-content stack">${
          store.data.products
            .filter((p) => p.active && p.stock <= p.minStock)
            .map(
              (p) =>
                `<div class="note yellow"><strong>${e(p.name)}</strong> · Chỉ còn ${p.stock} sản phẩm.</div>`,
            )
            .join('') || empty('Kho hàng đủ hàng')
        }${store.can('purchases') ? action('navigate-modal', 'Xem phiếu nhập', 'truck', '', 'data-page="purchases"') : ''}</div>`,
      );
      break;

    case 'navigate-modal':
      closeModal();
      navigate(a.page);
      break;

    default:
      return false;
  }
  return true;
}
