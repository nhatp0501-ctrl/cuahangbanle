'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  { pathToFileURL } = require('node:url');
const { browserSession } = require('./browser-session.cjs');
browserSession(async ({ command, evaluate, pause, out }) => {
  console.log('Mở bản HTML để xuất PDF.');
  const htmlPath = path.join(out, 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.html');
  await command('Page.navigate', { url: pathToFileURL(htmlPath).href });
  for (let n = 0; n < 100; n++) {
    if (
      await evaluate(
        `document.readyState==='complete'&&document.querySelectorAll('.page').length>10`,
      )
    )
      break;
    await pause(100);
  }
  await evaluate(
    `Promise.all([document.fonts.ready,...[...document.images].map(img=>img.decode())])`,
  );
  console.log('Đã tải font và ảnh; bắt đầu phân trang.');
  await command('Emulation.setEmulatedMedia', { media: 'print' });
  const layout = await evaluate(`(()=>{
  let count=0;
  const overflow=page=>page.querySelector('.page-body').getBoundingClientRect().bottom-page.querySelector('.page-footer').getBoundingClientRect().top+7;
  function continuation(page){const clone=page.cloneNode(true);clone.id=page.dataset.origin+'-cont-'+(++count);clone.querySelector('.blocks').replaceChildren();clone.querySelector('h1').textContent=page.querySelector('h1').textContent.replace(/ \\(tiếp theo\\)$/,'')+' (tiếp theo)';clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));page.after(clone);return clone;}
  let pages=[...document.querySelectorAll('.page')];
  for(let index=0;index<pages.length;index++){
   const page=pages[index];if(page.classList.contains('cover'))continue;
   const blocks=page.querySelector('.blocks');let target=null;
   while(overflow(page)>1){
    if(count>200)throw Error('Quá nhiều trang tiếp diễn.');
    if(blocks.children.length>1){target||=continuation(page);target.querySelector('.blocks').prepend(blocks.lastElementChild);if(blocks.lastElementChild?.tagName==='H2')target.querySelector('.blocks').prepend(blocks.lastElementChild);}
    else{
     const only=blocks.firstElementChild;
     if(only?.classList.contains('report-table')){
      const rows=only.querySelector('tbody');if(rows.children.length<2)throw Error('Một dòng bảng quá cao: '+page.id);
      target||=continuation(page);let split=target.querySelector('.report-table');if(!split){split=only.cloneNode(true);split.removeAttribute('id');split.querySelector('tbody').replaceChildren();split.querySelector('.table-caption').textContent+=' (tiếp theo)';target.querySelector('.blocks').prepend(split);}
      split.querySelector('tbody').prepend(rows.lastElementChild);
     }else if(only?.classList.contains('listing')){
      if(only.children.length<2)throw Error('Mục danh sách quá cao.');target||=continuation(page);let split=target.querySelector('.listing');if(!split){split=only.cloneNode(false);target.querySelector('.blocks').append(split);}split.prepend(only.lastElementChild);
     }else throw Error('Khối không thể phân trang: '+page.id+' '+only?.className);
    }
   }
   pages=[...document.querySelectorAll('.page')];
  }
  pages.forEach((page,index)=>{const number=page.querySelector('.page-number');if(number)number.textContent=(index+1)+' / '+pages.length;});
  document.querySelectorAll('[data-target]').forEach(link=>{const target=document.getElementById(link.dataset.target);const page=target?.closest('.page');const number=pages.indexOf(page)+1;if(number<1)throw Error('Mục lục mất đích '+link.dataset.target);link.querySelector('b').textContent=number;});
  return pages.map((page,index)=>({page:index+1,id:page.id,title:page.querySelector('h1')?.textContent,overflow:page.classList.contains('cover')?0:Math.max(0,overflow(page)),width:page.getBoundingClientRect().width}));
 })()`);
  const invalid = layout.filter((p) => p.overflow > 1);
  if (invalid.length) throw Error('Còn nội dung tràn: ' + JSON.stringify(invalid));
  console.log('Đã kiểm bố cục ' + layout.length + ' trang; bắt đầu in PDF.');
  const finalHTML = await evaluate(`'<!doctype html>'+document.documentElement.outerHTML`);
  fs.writeFileSync(htmlPath, finalHTML);
  fs.writeFileSync(path.join(out, 'kiem-tra-bo-cuc-v3.json'), JSON.stringify(layout, null, 2));
  const pdf = await command('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    generateTaggedPDF: true,
  });
  const pdfPath = path.join(out, 'Bao-cao-thiet-ke-giao-dien-RetailFlow-v3.pdf');
  fs.writeFileSync(pdfPath, Buffer.from(pdf.data, 'base64'));
  console.log(
    JSON.stringify({
      pages: layout.length,
      continuations: layout.filter((p) => p.id.includes('-cont-')).length,
      pdf: pdfPath,
      bytes: fs.statSync(pdfPath).size,
      overflow: invalid,
    }),
  );
}).catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
