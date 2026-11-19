'use strict';
const fs = require('node:fs'),
  path = require('node:path');
const { browserSession } = require('./browser-session.cjs');
browserSession(async ({ command, evaluate, pause, url, out, errors }) => {
  const directory = path.join(out, 'anh');
  fs.mkdirSync(directory, { recursive: true });
  const captures = [];
  const viewport = async (w = 1440, h = 1050, mobile = false) =>
    command('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      mobile,
      deviceScaleFactor: 1,
    });
  async function shot(name, selector = '', caption = '') {
    await evaluate(
      `document.activeElement?.blur(); document.querySelector('#toasts').style.display='none'; document.querySelectorAll(':focus').forEach(e=>e.blur()); for(const img of document.images) img.loading='eager'; Promise.race([Promise.allSettled([...document.images].map(i=>i.decode())),new Promise(r=>setTimeout(r,1200))])`,
    );
    await pause(180);
    let clip;
    if (selector)
      clip = await evaluate(
        `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1};})()`,
      );
    const r = await command('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: !!selector,
      ...(clip ? { clip } : {}),
    });
    fs.writeFileSync(path.join(directory, name + '.png'), Buffer.from(r.data, 'base64'));
    captures.push({
      name,
      caption,
      selector,
      width: clip?.width || 1440,
      height: clip?.height || 1050,
    });
    console.log('Ảnh: ' + name);
  }
  const view = async (route, name, extra = '') => {
    await evaluate(
      `if(document.querySelector('#modal').open)closeModal();navigate(${JSON.stringify(route)});${extra}`,
    );
    await shot(name);
  };
  const user = async (login) =>
    evaluate(
      `if(document.querySelector('#modal').open)closeModal();store.login(${JSON.stringify(login)},'123456');page=ACCESS[store.user.role][0];shell()`,
    );
  await viewport();
  await command('Page.navigate', { url });
  for (let n = 0; n < 80; n++) {
    if (await evaluate(`!!document.querySelector('#login-form')`)) break;
    await pause(100);
  }
  await shot('01-dang-nhap');
  await user('admin');
  const facts = await evaluate(
    `({pages:pages.map(p=>({id:p[0],name:p[1]})),roles:ACCESS,products:store.data.products.filter(p=>p.active).length,categories:[...new Set(store.data.products.filter(p=>p.active).map(p=>p.category))],suppliers:store.data.suppliers.length,activeSuppliers:store.data.suppliers.filter(s=>s.active).length,lots:store.data.lots.length,schema:store.data.schema})`,
  );
  await view('dashboard', '02-tong-quan');
  await view('pos', '03-pos');
  await evaluate(`quantityModal('SP001')`);
  await shot('04-chon-so-luong', '#modal');
  await evaluate(
    `closeModal();addCart('SP001',2);addCart('SP002',4);addCart('SP003',1);const input=document.querySelector('#customer-phone-search');input.value='090';searchCustomerPhone(input)`,
  );
  await shot('05-tim-khach', '.cart-panel');
  await evaluate(
    `selectPhoneCustomer('KH001');store.upsertDiscount('promotion',{name:'Ưu đãi sữa Vinamilk 5.000đ',type:'fixed',value:5000,minSpend:0,maxDiscount:5000,startsOn:Retail.today(),endsOn:Retail.addDays(7),productIds:['SP001'],lotIds:[],active:true});changeDraft(d=>d.discountSelection={kind:'auto',id:''});filters.pos='';render()`,
  );
  await viewport(1440, 1500);
  await shot('06-nhieu-khuyen-mai');
  await evaluate(`discountTab='promotion';render()`);
  await shot('07-chon-nhieu-km', '.cart-panel');
  await evaluate(
    `checkoutModal('cash');document.querySelector('#cash-input').value=300000;updateCash()`,
  );
  await shot('08-tien-mat', '#modal');
  await evaluate(`checkoutModal('transfer')`);
  await shot('09-chuyen-khoan', '#modal');
  await evaluate(`checkoutModal('card')`);
  await shot('10-the', '#modal');
  const sale = await evaluate(
    `(()=>{const o=store.checkout({payment:'cash',received:300000});closeModal();render();return o.id})()`,
  );
  await evaluate(`orderDetail(${JSON.stringify(sale)})`);
  await shot('11-hoa-don', '#modal');
  await evaluate(`closeModal()`);
  await viewport();
  await view('orders', '12-don-hang');
  await view('products', '13-san-pham');
  await evaluate(`entityModal('products','SP001')`);
  await shot('14-sua-san-pham', '#modal');
  await view('promotions', '15-voucher');
  await evaluate(`discountModal('voucher')`);
  await shot('16-thiet-lap-voucher', '#modal');
  await view('promotions', '17-chuong-trinh', `discountManagementTab='programs';render()`);
  await view('promotions', '18-can-date', `discountManagementTab='near';render()`);
  await view('inventory', '19-ton-kho');
  await view('inventory', '20-lo-hsd', `inventoryTab='lots';render()`);
  await user('kho');
  await view('purchases', '21-nhap-hang');
  await evaluate(`purchaseModal('SP003')`);
  await shot('22-lap-yeu-cau', '#modal');
  const purchase = await evaluate(
    `(()=>{closeModal();return store.createPurchase(store.data.products.find(p=>p.id==='SP003').supplierId,[{id:'SP003',qty:10,price:38000}],'Bổ sung quầy gia vị','submitted').id})()`,
  );
  await user('admin');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchase)})`);
  await shot('23-admin-duyet-yeu-cau', '#modal');
  await evaluate(
    `store.reviewPurchase(${JSON.stringify(purchase)},true,'Đủ nhu cầu và ngân sách; đồng ý đặt NCC.')`,
  );
  await user('kho');
  await evaluate(
    `navigate('purchases');receiptReportModal(${JSON.stringify(purchase)});document.querySelector('[name=deliveryRef]').value='GH-MAU-01';for(const [key,value] of Object.entries({actualQty:8,rejectedQty:2,lotCode:'SIMPLY-MAU-01',expiryDate:Retail.addDays(180),reason:'Giao thiếu 2, có 2 chai móp không đạt'})){document.querySelector('[data-receipt-field="'+key+'"]').value=value;}updateReceiptEntry(document.querySelector('[data-receipt-product]'))`,
  );
  await shot('24-khai-thuc-nhan', '#modal');
  const receipt = await evaluate(
    `store.reportPurchaseReceipt(${JSON.stringify(purchase)},[{id:'SP003',actualQty:8,rejectedQty:2,lotCode:'SIMPLY-MAU-01',expiryDate:Retail.addDays(180),reason:'NCC giao 8, trong đó 2 chai móp'}],{deliveryRef:'GH-MAU-01'}).id`,
  );
  await user('admin');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchase)})`);
  await shot('25-nhan-thieu', '#modal');
  await evaluate(
    `store.reviewPurchaseReceipt(${JSON.stringify(receipt)},true,'Nhập 6 đạt, theo dõi 4 còn thiếu.');closeModal()`,
  );
  await user('kho');
  const surplus = await evaluate(
    `store.reportPurchaseReceipt(${JSON.stringify(purchase)},[{id:'SP003',actualQty:6,rejectedQty:0,lotCode:'SIMPLY-MAU-02',expiryDate:Retail.addDays(200),reason:'NCC giao dư 2 so với phần còn đặt'}],{deliveryRef:'GH-MAU-02'}).id`,
  );
  await user('admin');
  await evaluate(`navigate('purchases');purchaseDetail(${JSON.stringify(purchase)})`);
  await shot('26-giao-du', '#modal');
  await evaluate(`workflowDecisionModal('receipt',${JSON.stringify(surplus)},'approve')`);
  await shot('27-quyet-dinh-giao-du', '#modal');
  await evaluate(
    `store.reviewPurchaseReceipt(${JSON.stringify(surplus)},true,'NCC xác nhận giao lại 2 dư, nhập 4 còn đặt.','send_back');closeModal()`,
  );
  await user('kho');
  await view('inventory', '28-pham-vi-kiem-ke', `auditModal()`);
  await shot('29-chon-pham-vi', '#modal');
  await evaluate(`closeModal()`);
  const audit = await evaluate(`store.startAudit(['SP001'],'Kiểm kê quầy sữa cuối ca').id`);
  await evaluate(`auditDetail(${JSON.stringify(audit)})`);
  await shot('30-dem-doc-lap', '#modal');
  await evaluate(
    `(()=>{const a=store.data.audits.find(a=>a.id===${JSON.stringify(audit)});store.saveAuditCount(a.id,a.items.map((i,n)=>({lotId:i.lotId,countedQty:i.bookQty-(n===0?1:0),damagedQty:0,reason:n===0?'Thiếu 1, cần xác minh':''})));auditDetail(a.id)})()`,
  );
  await shot('31-chenh-lech', '#modal');
  await evaluate(`auditInvoicesModal(${JSON.stringify(audit)},'SP001')`);
  await shot('32-doi-chieu-hoa-don', '#modal');
  await evaluate(
    `store.reviewAuditInvoices(${JSON.stringify(audit)},'SP001','');const a=store.data.audits.find(a=>a.id===${JSON.stringify(audit)});auditRecountModal(a.id,a.items[0].lotId)`,
  );
  await shot('33-chot-dem-lai', '#modal');
  await evaluate(
    `(()=>{const a=store.data.audits.find(a=>a.id===${JSON.stringify(audit)});store.recountAuditLot(a.id,a.items[0].lotId,a.items[0].countedQty,0,'Đếm lại hai người: thiếu vật lý 1 hộp; đã đối chiếu hóa đơn và phiếu nhập.');store.saveAuditCount(a.id,a.items.map(i=>({lotId:i.lotId,countedQty:i.countedQty,damagedQty:i.damagedQty,reason:i.reason})),true);closeModal()})()`,
  );
  await user('admin');
  await evaluate(`navigate('inventory');auditDetail(${JSON.stringify(audit)})`);
  await shot('34-admin-kiem-ke', '#modal');
  await evaluate(
    `store.resolveAudit(${JSON.stringify(audit)},'approve','Đã xác minh thiếu 1; duyệt số thực đếm và ghi hao hụt tháng.');closeModal()`,
  );
  await view('reports', '35-doi-soat-thang');
  await evaluate(`window.scrollTo(0,900)`);
  await shot('36-bao-cao-doanh-thu');
  await view('suppliers', '37-nha-cung-cap');
  await evaluate(`supplierHistory('NCC001')`);
  await shot('38-danh-muc-ncc', '#modal');
  await view('customers', '39-khach-hang');
  await evaluate(`customerHistory('KH001')`);
  await shot('40-lich-su-khach', '#modal');
  await view('staff', '41-nhan-vien');
  await view('branches', '42-chi-nhanh');
  await view('settings', '43-cau-hinh');
  await viewport(390, 844, true);
  await evaluate(`navigate('pos');window.scrollTo(0,0)`);
  await pause(350);
  await shot('44-pos-mobile');
  await viewport(768, 1024);
  await evaluate(`navigate('inventory')`);
  await pause(350);
  await shot('45-kho-tablet');
  const version = await command('Browser.getVersion');
  fs.writeFileSync(
    path.join(out, 'bang-chung-giao-dien.json'),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        businessDate: '2026-11-19',
        sampleDataOnly: true,
        browser: version,
        node: process.version,
        desktop: { width: 1440, height: 1050 },
        facts,
        captures,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ screenshots: captures.length, facts, errors }));
}).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
