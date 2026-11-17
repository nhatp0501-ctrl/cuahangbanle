function handleSettingsAction(a) {
  switch (a.action) {
    case 'discount-manage-tab':
      discountManagementTab = a.tab;
      pagination = {};
      render();
      break;
    case 'discount-new':
      discountModal(a.kind);
      break;
    case 'discount-edit':
      discountModal(a.kind, a.id);
      break;
    case 'promotion-lot':
      discountModal('promotion', '', a.id);
      break;
    case 'branch-new':
      branchModal();
      break;

    case 'backup':
      store.admin();
      download(
        JSON.stringify(store.data, null, 2),
        `RetailFlow-backup-${dayKey(new Date())}.json`,
        'application/json',
      );
      notify('Đã tải bản sao lưu dữ liệu.');
      break;

    case 'restore':
      store.admin();
      $('#restore-file').click();
      break;

    case 'export-report': {
      store.require('reports');
      const p = periodData(reportDays);
      exportCSV(
        [
          ['Báo cáo', `${reportDays} ngày gần nhất`],
          ['Doanh thu gộp', p.gross],
          ['Hoàn tiền trong kỳ', p.refund],
          ['Doanh thu thuần', p.gross - p.refund],
          [],
          ['Mã hóa đơn', 'Thời gian', 'Khách hàng', 'Phương thức', 'Tổng tiền', 'Trạng thái'],
          ...p.orders.map((o) => [
            o.id,
            date(o.time),
            o.customer,
            METHODS[o.payment],
            o.total,
            statusLabels[o.status][0],
          ]),
          [],
          ['Phiếu hoàn', 'Hóa đơn gốc', 'Ngày hoàn', 'Số tiền'],
          ...p.refunds.map((r) => [r.id, r.orderId, date(r.resolvedAt), r.amount]),
        ],
        `RetailFlow-bao-cao-${reportDays}-ngay.csv`,
      );
      break;
    }

    default:
      return false;
  }
  return true;
}
