// Photographs the logo system from tools/brand/brand.html into assets/brand/*.png (transparent where the lockup allows) and docs/brand-sheet.png. node tools/brand/export.js
const path=require('path');const {chromium}=require('playwright');const R=path.join(__dirname,'..','..');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1720,height:900},deviceScaleFactor:2});
 await p.goto('file:///'+path.join(__dirname,'brand.html').split(path.sep).join('/'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
 for(const id of ['logo-dark','logo-light','logo-compact','logo-mono-white','logo-mono-black','social']){await p.locator('#'+id).screenshot({path:path.join(R,'assets','brand',id+'.png')});console.log(id)}
 await p.locator('#sheet').screenshot({path:path.join(R,'docs','brand-sheet.png')});console.log('sheet');await b.close()})().catch(e=>{console.error(e);process.exit(1)});
