function handleInventoryAction(a) {
  switch (a.action) {
    case 'audit-invoices':
      auditInvoicesModal(a.audit, a.id);
      break;
    case 'audit-recount-lot':
      auditRecountModal(a.audit, a.id);
      break;
    case 'inventory-tab':
      inventoryTab = a.tab;
      filters = {};
      pagination = {};
      render();
      break;
    case 'inventory-product-lots':
      inventoryTab = 'lots';
      filters = { productId: a.id };
      pagination = {};
      render();
      break;
    case 'inventory-clear-product':
      delete filters.productId;
      render();
      break;
    case 'lot-expiry':
      lotExpiryModal(a.id);
      break;
    case 'audit-new':
      auditModal();
      break;
    case 'audit-detail':
      auditDetail(a.id);
      break;
    case 'audit-review':
      workflowDecisionModal('audit', a.id, a.decision);
      break;
    case 'purchase-new':
      purchaseModal();
      break;
    case 'purchase-restock':
      purchaseModal(a.id);
      break;
    case 'purchase-add-suggestion':
      addSuggestedPurchase(a.id);
      break;
    case 'purchase-detail':
      purchaseDetail(a.id);
      break;
    case 'purchase-send':
      store.submitPurchase(a.id);
      render();
      purchaseDetail(a.id);
      notify('Đã gửi admin kiểm duyệt.');
      break;
    case 'purchase-review':
      workflowDecisionModal('purchase', a.id, a.decision);
      break;
    case 'purchase-report':
      receiptReportModal(a.id);
      break;
    case 'receipt-review':
      workflowDecisionModal('receipt', a.id, a.decision);
      break;
    case 'purchase-short':
      workflowDecisionModal('purchase-short', a.id, 'close');
      break;
    case 'purchase-cancel':
      workflowDecisionModal('purchase-cancel', a.id, 'cancel');
      break;
    case 'purchase-line-add': {
      const p = store.data.products.find((p) => p.id === $('#purchase-product').value);
      if (!p) throw new Error('Chưa có sản phẩm của NCC.');
      const qty = Number($('#purchase-qty').value),
        price = Number($('#purchase-price').value);
      if (!Number.isSafeInteger(qty) || qty < 1 || !Number.isSafeInteger(price) || price < 0)
        throw new Error('Số lượng và đơn giá phải hợp lệ.');
      if (purchaseLines.some((i) => i.id === p.id))
        throw new Error('Sản phẩm đã có. Sửa trực tiếp dòng đã thêm.');
      purchaseLines.push({ id: p.id, name: p.name, qty, price });
      renderPurchaseLines();
      break;
    }
    case 'purchase-line-delete':
      purchaseLines.splice(Number(a.index), 1);
      renderPurchaseLines();
      break;
    default:
      return false;
  }
  return true;
}
