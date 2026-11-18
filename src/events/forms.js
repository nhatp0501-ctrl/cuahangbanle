document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!form.id) return;
  event.preventDefault();
  if (form.dataset.submitting === 'true') return;
  form.dataset.submitting = 'true';
  const submitButtons = $$('button[type="submit"]', form),
    disabledStates = submitButtons.map((b) => b.disabled);
  submitButtons.forEach((b) => (b.disabled = true));
  const v = dataForm(form);
  try {
    if (handleRetailForm(form, v, event)) return;
    switch (form.id) {
      case 'login-form':
        store.login(v.username.trim(), v.password);
        sessionStorage.setItem('retailflow-user', store.user.id);
        page = ACCESS[store.user.role][0];
        shell();
        notify(`Chào ${store.user.name}, chúc bạn một ngày làm việc tốt!`);
        break;
      case 'checkout-form': {
        const d = clone(store.data.draft);
        d.demographic = v.demographic;
        store.saveDraft(d);
        const o = store.checkout({
          payment: v.payment,
          received: Number(v.received || 0),
          confirmed: v.confirmed === 'on',
          checkoutKey: v.checkoutKey,
        });
        render();
        orderDetail(o.id);
        notify(`Thanh toán thành công · ${o.id}`);
        break;
      }
      case 'entity-form': {
        const type = modalContext.entity;
        const values = {
          ...v,
          active: v.active === 'true',
          ...(v.tracksExpiry !== undefined ? { tracksExpiry: v.tracksExpiry === 'true' } : {}),
        };
        if (modalContext.id) values.id = modalContext.id;
        store.upsert(type, values);
        closeModal();
        if ($('#content')) render();
        notify('Đã lưu thông tin.');
        break;
      }
      case 'purchase-form':
        store.createPurchase(v.supplierId, purchaseLines, v.note || '', v.status);
        closeModal();
        render();
        notify('Đã lưu phiếu nhập hàng.');
        break;
      case 'settings-form':
        store.saveSettings({ ...v, taxRate: Number(v.taxRate) });
        render();
        notify('Đã lưu cấu hình cửa hàng.');
        break;
      case 'branch-form':
        store.createBranch(v);
        closeModal();
        render();
        notify('Địa chỉ có đối tác phục vụ. Đã lưu đề xuất chi nhánh.');
        break;
      case 'scan-form': {
        const p = store.data.products.find(
          (p) => p.barcode === v.code.trim() || p.id.toLowerCase() === v.code.trim().toLowerCase(),
        );
        if (!p) throw new Error('Không tìm thấy sản phẩm với mã này.');
        addCart(p.id);
        closeModal();
        notify(`Đã thêm ${p.name}`);
        break;
      }
    }
  } catch (error) {
    const target = $('#form-error', form) || $('#login-error', form);
    if (target) {
      target.textContent = error.message;
      target.scrollIntoView({ block: 'nearest' });
    } else notify(error.message, true);
  } finally {
    form.dataset.submitting = 'false';
    if (form.isConnected) submitButtons.forEach((b, index) => (b.disabled = disabledStates[index]));
  }
});
