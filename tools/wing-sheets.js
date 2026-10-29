// Wing sprite sheets: renders the 8-key flight cycle (F1..F8, see WING9 in src/js/late/50-z-wings2.js) of the given wings with the
// game's own renderer in headless Chromium and writes art/wings/<id>-sheet.png (transparent) + <id>-sheet-black.png + sheets.json.
// Every frame shares one size and one shoulder anchor (union of all 8 frames, so no tip is ever cut off). Needs playwright and a built
// index.html: node tools/wing-sheets.js [ids]   (env NODE_PATH = playwright install, CHROMIUM = chrome.exe; headless only)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'art','wings'),URL=require('url').pathToFileURL(path.join(ROOT,'index.html')).href;
const IDS=(process.argv[2]||'haloseraph,voidshroud,stormlance').split(','),SC=2,PAD=12,HEAD=28,COLS=4;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox'],headless:true});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForFunction(()=>typeof WingArt!='undefined'&&typeof WING9!='undefined',null,{timeout:20000});
 fs.mkdirSync(OUT,{recursive:true});const meta={frames:WING_FRAMES(),scale:SC,cols:COLS,rows:2,header:HEAD,sheets:{}};
 for(const id of IDS){const r=await p.evaluate(([id,SC,PAD,HEAD,COLS])=>{const i=WINGS.findIndex(w=>w.id==id);if(i<0)return{err:'unknown wing '+id};const N=1600,A=N/2;
   QM.cur.wfx=3;const fr=[];let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
   for(let k=0;k<8;k++){const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');x.translate(A,A);x.scale(SC,SC);
    // anchor = the shoulder-blade root of both wings: WingArt.draw puts it at (cx, cy-7)
    WingArt.draw(x,i,0,7,1,1.3,2,0,0,1,null,0,{kf:k,trail:1,ds:SC*2});const d=x.getImageData(0,0,N,N).data;
    for(let y=0;y<N;y+=2)for(let q=0;q<N;q+=2)if(d[(y*N+q)*4+3]>6){if(q<bx0)bx0=q;if(q>bx1)bx1=q;if(y<by0)by0=y;if(y>by1)by1=y}fr.push(c)}
   const hw=Math.max(A-bx0,bx1-A)+PAD,FW=Math.ceil(hw*2/8)*8,top=A-by0+PAD,FH=Math.ceil((top+(by1-A)+PAD)/8)*8,ax=FW/2,ay=Math.round(top);
   const out={};for(const bg of['clear','black']){const s=document.createElement('canvas');s.width=FW*COLS;s.height=(FH+HEAD)*2;const x=s.getContext('2d');if(bg=='black'){x.fillStyle='#000';x.fillRect(0,0,s.width,s.height)}
    for(let k=0;k<8;k++){const cx=(k%COLS)*FW,cy=((k/COLS)|0)*(FH+HEAD);x.fillStyle=bg=='black'?'#15151c':'rgba(10,10,16,.72)';x.fillRect(cx,cy,FW,HEAD);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(cx,cy+HEAD-1,FW,1);x.fillRect(cx+FW-1,cy,1,HEAD);
     x.font='600 15px sans-serif';x.fillStyle='#ffffff';x.textBaseline='middle';x.fillText(WING9.NAMES[k],cx+10,cy+HEAD/2);x.drawImage(fr[k],A-ax,A-ay,FW,FH,cx,cy+HEAD,FW,FH)}
    out[bg]=s.toDataURL('image/png')}
   return{name:WINGS[i].n,FW,FH,ax,ay,W:FW*COLS,H:(FH+HEAD)*2,out}},[id,SC,PAD,HEAD,COLS]);
  if(r.err)throw Error(r.err);
  fs.writeFileSync(path.join(OUT,id+'-sheet.png'),Buffer.from(r.out.clear.split(',')[1],'base64'));fs.writeFileSync(path.join(OUT,id+'-sheet-black.png'),Buffer.from(r.out.black.split(',')[1],'base64'));
  meta.sheets[id]={name:r.name,width:r.W,height:r.H,frame:[r.FW,r.FH],anchor:[r.ax,r.ay]};console.log(id,r.W+'x'+r.H,'frame',r.FW+'x'+r.FH,'anchor',r.ax+','+r.ay)}
 fs.writeFileSync(path.join(OUT,'sheets.json'),JSON.stringify(meta,null,1)+'\n');if(errs.length)console.log('page errors:',errs);await b.close();if(errs.length)process.exit(1)})();
function WING_FRAMES(){return['F1 Flare','F2 Upstroke Peak','F3 Power Snap','F4 Max Extension','F5 Recovery Lift','F6 Hover','F7 Hover Billow','F8 Hover Settle']}
