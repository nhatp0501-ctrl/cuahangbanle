function handleRetailForm(form, v, event) {
  switch (form.id) {
    case 'audit-invoices-form': {
      const aid = modalContext.auditId;
      store.reviewAuditInvoices(aid, modalContext.productId, v.note);
      auditDetail(aid);
      notify('Đã lưu đối chiếu. Đếm lại và chốt số thực tế trước khi gửi admin.');
      break;
    }
    case 'audit-recount-form': {
      const aid = modalContext.auditId;
      store.recountAuditLot(aid, modalContext.lotId, v.qty, v.damagedQty, v.note);
      auditDetail(aid);
      break;
    }
    case 'quantity-form': {
      const qty = Number(v.qty);
      if (!Number.isSafeInteger(qty) || qty < 1) throw new Error('Chọn số lượng nguyên lớn hơn 0.');
      addCart(modalContext.productId, qty);
      closeModal();
      break;
    }
    case 'discount-form': {
      const fd = new FormData(form),
        kind = modalContext.kind;
      const values = {
        ...v,
        active: v.active === 'true',
        productIds: kind === 'promotion' ? fd.getAll('productIds') : [],
        lotIds: kind === 'promotion' ? fd.getAll('lotIds') : [],
      };
      if (modalContext.discountId) values.id = modalContext.discountId;
      if (kind === 'promotion') {
        for (const lid of values.lotIds) {
          const l = store.data.lots.find((l) => l.id === lid);
          if (l && !values.productIds.includes(l.productId)) values.productIds.push(l.productId);
        }
      }
      store.upsertDiscount(kind, values);
      closeModal();
      render();
      notify('Đã lưu ưu đãi.');
      break;
    }
    case 'lot-expiry-form':
      store.setLotExpiry(modalContext.lotId, v.expiryDate, v.note);
      closeModal();
      render();
      notify('Đã lưu HSD có căn cứ.');
      break;
    case 'audit-start-form': {
      const ids = new FormData(form).getAll('productIds');
      if (ids.length > 30) throw new Error('Mỗi phiên tối đa 30 mặt hàng để kiểm đếm trong ca.');
      const a = store.startAudit(ids, v.note);
      render();
      auditDetail(a.id);
      notify('Đã mở phiên. Các mặt hàng được chọn tạm khóa xuất nhập.');
      break;
    }
    case 'audit-count-form': {
      const lines = $$('[data-count-lot]', form).map((row) => ({
        lotId: row.dataset.countLot,
        countedQty: $('[data-count-field="countedQty"]', row).value,
        damagedQty: $('[data-count-field="damagedQty"]', row).value,
        reason: $('[data-count-field="reason"]', row).value,
      }));
      const a = store.saveAuditCount(
        modalContext.auditId,
        lines,
        event.submitter?.value === 'submit',
      );
      render();
      auditDetail(a.id);
      notify(
        a.status === 'submitted'
          ? 'Đã gửi admin, chưa điều chỉnh tồn.'
          : 'Đã lưu số đếm. Đối chiếu và giải trình trước khi gửi.',
      );
      break;
    }
    case 'receipt-report-form': {
      const lines = $$('[data-receipt-product]', form).map((row) => {
        const data = { id: row.dataset.receiptProduct };
        $$('[data-receipt-field]', row).forEach(
          (input) => (data[input.dataset.receiptField] = input.value),
        );
        return data;
      });
      const pid = modalContext.purchaseId;
      store.reportPurchaseReceipt(pid, lines, { deliveryRef: v.deliveryRef, note: v.note });
      render();
      purchaseDetail(pid);
      notify('Đã gửi thực nhận lên admin. Chưa cộng tồn.');
      break;
    }
    case 'workflow-decision-form': {
      const { kind, recordId, decision } = modalContext;
      let resultId = recordId;
      if (kind === 'purchase') store.reviewPurchase(recordId, decision === 'approve', v.note);
      if (kind === 'receipt') {
        resultId = store.data.purchaseReceipts.find((r) => r.id === recordId).purchaseId;
        store.reviewPurchaseReceipt(recordId, decision === 'approve', v.note, v.surplusDecision);
      }
      if (kind === 'audit') store.resolveAudit(recordId, decision, v.note);
      if (kind === 'purchase-short') store.closePurchaseShort(recordId, v.note);
      if (kind === 'purchase-cancel') store.cancelPurchase(recordId, v.note);
      render();
      if (kind === 'audit') auditDetail(resultId);
      else purchaseDetail(resultId);
      notify('Đã ghi nhận bước xử lý và lưu dấu vết.');
      break;
    }
    default:
      return false;
  }
  return true;
}
