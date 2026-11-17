'use strict';
module.exports = async function ({ evaluate, command, click, fill, submit, check, screenshot }) {
  const change = (selector, value) =>
    evaluate(
      `(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing field '+${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}));})()`,
    );
  async function login(username) {
    if (await evaluate(`!!store.user`)) {
      await evaluate(`if(document.querySelector('#modal').open)closeModal()`);
      await click('[data-action="logout"]');
    }
    await fill('[name="username"]', username);
    await fill('[name="password"]', '123456');
    await submit('login-form');
  }
  async function decision(note) {
    await fill('#workflow-decision-form [name="note"]', note);
    await click('#workflow-decision-form [type="checkbox"]');
    await submit('workflow-decision-form');
  }
  await submit('login-form');
  await check(
    `store.data.schema===2 && !store.loadError && store.data.products.filter(p=>p.active).length>=180`,
    'v2 loads a realistic large catalogue without losing data',
  );
  await evaluate(`for(const p of pages)navigate(p[0]);navigate('pos')`);
  await check(
    `document.querySelectorAll('.retail-product-card').length===24`,
    'all management screens render; POS paginates 24 products',
  );
  await evaluate(
    `Promise.allSettled(Array.from(document.querySelectorAll('.retail-product-card img')).slice(0,6).map(i=>i.decode()))`,
  );
  await check(
    `Array.from(document.querySelectorAll('.retail-product-card img')).slice(0,6).every(i=>i.naturalWidth>80 && i.src.includes('/assets/products/'))`,
    'real product photographs load from local assets',
  );
  const pid = await evaluate(
    `store.data.products.find(p=>p.active&&p.tracksExpiry&&store.saleableStock(p.id)>30).id`,
  );
  await click(`[data-action="choose-product"][data-id="${pid}"]`);
  await click('[data-action="quantity-preset"][data-qty="3"]');
  await submit('quantity-form');
  await check(
    `store.data.draft.items[0].qty===3`,
    'product quantity chooser adds the requested quantity',
  );
  await change('[data-cart-quantity]', 5);
  await check(`store.data.draft.items[0].qty===5`, 'cart quantity can be edited directly');
  await fill('#customer-phone-search', '0903');
  await click('[data-action="customer-select"]');
  await check(
    `store.data.draft.customerId==='KH001'`,
    'live phone lookup still selects the customer',
  );
  await click('[data-action="discount-tab"][data-kind="voucher"]');
  await fill('#voucher-code', 'CHAOMUNG');
  await click('[data-action="voucher-apply"]');
  await check(
    `store.quoteDraft().discount===10000`,
    'store voucher applies and manual discount input is removed',
  );
  await evaluate(`navigate('promotions')`);
  await click('[data-action="discount-new"][data-kind="voucher"]');
  await fill('#discount-form [name="name"]', 'Đối tác giảm riêng sản phẩm');
  await fill('[name="code"]', 'PARTNER10');
  await change('[name="source"]', 'partner');
  const supplier = await evaluate(
    `store.data.products.find(p=>p.id===${JSON.stringify(pid)}).supplierId`,
  );
  await change('[name="partnerSupplierId"]', supplier);
  await submit('discount-form');
  await check(
    `store.data.vouchers.some(v=>v.code==='PARTNER10'&&v.partnerSupplierId===${JSON.stringify(supplier)})`,
    'admin can configure a partner-scoped voucher',
  );
  await evaluate(
    `navigate('pos');const other=store.data.products.find(p=>p.active&&p.supplierId!==${JSON.stringify(supplier)}&&store.saleableStock(p.id)>2);addCart(other.id,2)`,
  );
  await click('[data-action="discount-tab"][data-kind="voucher"]');
  await fill('#voucher-code', 'PARTNER10');
  await click('[data-action="voucher-apply"]');
  await check(
    `store.quoteDraft().items.filter(i=>store.data.products.find(p=>p.id===i.id).supplierId!==${JSON.stringify(supplier)}).every(i=>i.lineDiscount===0)`,
    'partner voucher does not reduce other suppliers products',
  );
  await screenshot('v2-pos.png');
  const beforeOrders = await evaluate('store.data.orders.length');
  await click('[data-action="checkout"]');
  await fill('#cash-input', 1);
  await submit('checkout-form');
  await check(
    `store.data.orders.length===${beforeOrders} && document.querySelector('#form-error').textContent.includes('đủ')`,
    'partial cash payment is rejected without creating an invoice',
  );
  await fill('#cash-input', 99999999);
  await submit('checkout-form');
  const orderId = await evaluate('store.data.orders[0].id');
  await check(
    `store.data.orders.length===${beforeOrders + 1} && store.data.orders[0].paymentCount===1 && !document.querySelector('#modal').textContent.includes('Đã trả')`,
    'one full payment saves an invoice without return state',
  );
  await click('[data-action="close-modal"]');
  for (const method of ['transfer', 'card']) {
    await evaluate(`addCart(${JSON.stringify(pid)},1)`);
    await click('[data-action="checkout"]');
    await click(`[data-method="${method}"]`);
    await fill('[name="paymentRef"]', 'FULL-' + method);
    await click('[name="confirmed"]');
    await submit('checkout-form');
    await check(
      `store.data.orders[0].payment===${JSON.stringify(method)} && store.data.orders[0].received===store.data.orders[0].total`,
      method + ' confirms full invoice value',
    );
    await click('[data-action="close-modal"]');
  }
  await login('nhanvien');
  await evaluate(`navigate('returns');returnModal(${JSON.stringify(orderId)})`);
  await fill('[data-return-id]', 1);
  await fill('[name="reason"]', 'Khách đổi nhu cầu');
  await submit('return-form');
  await check(
    `store.data.returns[0].status==='pending' && !document.querySelector('[data-action="return-approve"]')`,
    'cashier only sends a return request',
  );
  const rid = await evaluate('store.data.returns[0].id');
  await click('[data-action="close-modal"]');
  await evaluate(`navigate('orders')`);
  await check(
    `!document.querySelector('#content').textContent.includes('Một phần') && !document.querySelector('#content').textContent.includes('Có hoàn trả')`,
    'orders page does not expose partial or full return state',
  );
  await login('admin');
  await evaluate(`navigate('returns');returnDetail(${JSON.stringify(rid)})`);
  await click('[data-action="return-approve"]');
  await click('[data-action="confirm"]');
  await check(
    `store.data.orders.find(o=>o.id===${JSON.stringify(orderId)}).status==='completed' && store.data.returns.find(r=>r.id===${JSON.stringify(rid)}).status==='approved'`,
    'return approval is separate from the paid order status',
  );
  await click('[data-action="close-modal"]');
  await evaluate(`navigate('promotions')`);
  await click('[data-action="discount-manage-tab"][data-tab="near"]');
  await click('[data-action="promotion-lot"]');
  await fill('[name="name"]', 'Chương trình cận date tại quầy');
  await submit('discount-form');
  await check(
    `store.data.promotions.some(p=>p.name==='Chương trình cận date tại quầy'&&p.lotIds.length>0)`,
    'near-expiry lots can be selected into a promotion',
  );

  await login('kho');
  await evaluate(`navigate('purchases')`);
  await click('[data-action="purchase-new"]');
  await change('#purchase-supplier', supplier);
  await change('#purchase-product', pid);
  await fill('#purchase-qty', 10);
  await click('[data-action="purchase-line-add"]');
  await fill('#purchase-form [name="note"]', 'Bổ sung kệ bán');
  await submit('purchase-form');
  const purchaseId = await evaluate('store.data.purchases[0].id'),
    stockBefore = await evaluate(
      `store.data.products.find(p=>p.id===${JSON.stringify(pid)}).stock`,
    );
  await evaluate(`purchaseDetail(${JSON.stringify(purchaseId)})`);
  await check(
    `store.data.purchases[0].status==='submitted' && !document.querySelector('[data-action="purchase-review"]') && !document.querySelector('[data-action="purchase-report"]')`,
    'warehouse sends request but cannot approve or receive before approval',
  );
  await login('admin');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchaseId)})`);
  await click('[data-action="purchase-review"][data-decision="approve"]');
  await decision('Nhu cầu phù hợp, duyệt đặt NCC');
  await login('kho');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchaseId)})`);
  await click('[data-action="purchase-report"]');
  await fill('[name="deliveryRef"]', 'NCC-GIAO-01');
  await fill('[data-receipt-field="actualQty"]', 6);
  await fill('[data-receipt-field="rejectedQty"]', 1);
  await fill('[data-receipt-field="lotCode"]', 'NCC-LOT-01');
  await fill('[data-receipt-field="expiryDate"]', await evaluate('Retail.addDays(90)'));
  await fill('[data-receipt-field="reason"]', 'Giao thiếu 4, có 1 móp; NCC hẹn giao bù');
  await submit('receipt-report-form');
  await check(
    `store.data.purchases[0].status==='receipt_pending' && store.data.products.find(p=>p.id===${JSON.stringify(pid)}).stock===${stockBefore} && !document.querySelector('[data-action="receipt-review"]')`,
    'warehouse receipt reports actual short/damaged quantities without changing stock',
  );
  await login('admin');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchaseId)})`);
  await screenshot('v2-receipt-review.png');
  await click('[data-action="receipt-review"][data-decision="approve"]');
  await decision('Đối chiếu phiếu NCC: nhập 5 đạt, theo dõi 5 thiếu');
  await check(
    `store.data.purchases[0].status==='partially_received' && store.data.purchases[0].items[0].receivedQty===5 && store.data.products.find(p=>p.id===${JSON.stringify(pid)}).stock===${stockBefore + 5}`,
    'admin approval adds only accepted stock and retains the supplier shortage',
  );
  await screenshot('v2-purchase-short.png');
  await login('kho');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchaseId)})`);
  await click('[data-action="purchase-report"]');
  await fill('[name="deliveryRef"]', 'NCC-GIAO-02');
  await fill('[data-receipt-field="actualQty"]', 5);
  await fill('[data-receipt-field="lotCode"]', 'NCC-LOT-02');
  await fill('[data-receipt-field="expiryDate"]', await evaluate('Retail.addDays(100)'));
  await submit('receipt-report-form');
  await login('admin');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchaseId)})`);
  await click('[data-action="receipt-review"][data-decision="approve"]');
  await decision('Nhận bổ sung đủ 5, đóng đơn nhận đủ');
  await check(
    `store.data.purchases[0].status==='received' && store.data.purchases[0].items[0].receivedQty===10`,
    'a later delivery reconciles cumulatively to the requested quantity',
  );

  await login('kho');
  await evaluate(`navigate('inventory')`);
  await click('[data-action="audit-new"]');
  await fill('#audit-start-form [name="note"]', 'Kiểm kê độc lập kệ A');
  await click(`#audit-start-form [name="productIds"][value="${pid}"]`);
  await submit('audit-start-form');
  const auditId = await evaluate('store.data.audits[0].id');
  await check(
    `!store.data.audits[0].countSaved && !document.querySelector('[data-action="audit-review"]') && store.inventoryLock(${JSON.stringify(pid)})`,
    'warehouse starts a locked blind count without approval controls',
  );
  await evaluate(
    `(()=>{const a=store.data.audits[0];for(const [n,i] of a.items.entries()){const row=document.querySelector('[data-count-lot="'+i.lotId+'"]');row.querySelector('[data-count-field="countedQty"]').value=i.bookQty-(n===0?1:0);}})()`,
  );
  await submit('audit-count-form');
  await check(
    `store.data.audits[0].countSaved && store.data.audits[0].status==='counting'`,
    'saving counts reveals comparison before submission',
  );
  await fill('[data-count-field="reason"]', 'Thiếu 1 do vỡ, có xác nhận trong ca');
  await evaluate(
    `document.querySelector('#audit-count-form').requestSubmit(document.querySelector('#audit-count-form button[value="submit"]'))`,
  );
  const beforeAudit = await evaluate(
    `store.data.products.find(p=>p.id===${JSON.stringify(pid)}).stock`,
  );
  await check(
    `store.data.audits[0].status==='submitted'`,
    'warehouse sends the explained count to admin',
  );
  await login('admin');
  await evaluate(`navigate('inventory');auditDetail(${JSON.stringify(auditId)})`);
  await screenshot('v2-audit-review.png');
  await click('[data-action="audit-review"][data-decision="approve"]');
  await decision('Xác minh vỡ 1; duyệt điều chỉnh thiếu theo biên bản');
  await check(
    `store.data.audits[0].status==='approved' && store.data.products.find(p=>p.id===${JSON.stringify(pid)}).stock===${beforeAudit - 1} && !store.inventoryLock(${JSON.stringify(pid)})`,
    'admin approves the actual loss once and releases inventory locks',
  );
  await click('[data-action="close-modal"]');
  await command('Page.reload');
  await new Promise((r) => setTimeout(r, 450));
  await check(
    `store.data.schema===2 && store.data.purchases[0].status==='received' && store.data.audits[0].status==='approved'`,
    'approved workflows and lot balances survive reload',
  );
  await command('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate(`navigate('pos')`);
  await new Promise((r) => setTimeout(r, 300));
  await check(
    `document.documentElement.scrollWidth<=innerWidth+1`,
    'consumer product POS fits a mobile screen',
  );
  await screenshot('v2-mobile.png');
};
