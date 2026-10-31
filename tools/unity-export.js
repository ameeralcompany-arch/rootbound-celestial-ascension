// Exports Rootbound's data tables and its procedurally drawn art (blocks, cracks, item icons, trees, the hero) from the web build into the
// Unity project's StreamingAssets, so the Unity version uses the exact same numbers and look. Runs headless on a fresh browser profile
// (never the real save). Build index.html first.   NODE_PATH=... CHROMIUM=... node tools/unity-export.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const ROOT=path.resolve(__dirname,'..'),URL='file://'+path.join(ROOT,'index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
const OUT=path.join(ROOT,'unity/Rootbound/Assets/StreamingAssets/Rootbound');
setTimeout(()=>{console.log('FAIL export timed out');process.exit(2)},180000).unref();
const png=(f,d)=>fs.writeFileSync(path.join(OUT,f),Buffer.from(d.split(',')[1],'base64'));
(async()=>{fs.mkdirSync(OUT,{recursive:true});
 const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});
 await p.evaluate(()=>{enterWorld('unityexport');WX6.force='clear';mobs.length=0});await p.waitForTimeout(600);
 const R=await p.evaluate(()=>{
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
  const ids=Object.keys(BLK).map(Number).filter(n=>n>0&&n<256).sort((a,b)=>a-b);
  // ---- data tables
  const blocks={};for(const id of ids){const B=BLK[id];let cat='soft',only='';try{cat=TOOLS8.catOf(id)||'soft';only=TOOLS8.ONLY[id]||''}catch(_){}
   blocks[id]={n:B[0],c:B[1],h:B[2],solid:SOLID6[id]===1?1:0,price:(typeof PRICE!='undefined'&&PRICE[id])||0,cat,only,glow:(typeof GLOW7!='undefined'&&GLOW7[id])||null}}
  const mats={};try{for(const k in MAT)mats[k]={n:MAT[k].n,c:MAT[k].c,p:MAT[k].p||0}}catch(_){}
  const tools={};for(const id in TOOLS8.TL){const t=TOOLS8.TL[id];tools[id]={n:t.n,tool:t.tool,g:t.g,d:t.d,cd:WPN[id].cd}}
  let drop={};try{drop=Object.assign({},BIOME17.DROP)}catch(_){}
  const data={v:1,T,W,H,DAY,REACH:REACH/T,ids,blocks,mats,tools,drop,player:{w:P.w,h:P.h}};
  // ---- block atlas: 16 columns of 48px cells; block id -> row (id>>4)*3+variant... simpler: one cell per (id, variant), index listed in data
  const cells=[];for(const id of ids)for(let v=0;v<3;v++)cells.push([id,v]);
  const COLS=24,rows=Math.ceil(cells.length/COLS),atl=mk(COLS*T,rows*T),ax=atl.getContext('2d');const bmap={};
  cells.forEach(([id,v],i)=>{let s=null;try{s=blockSprite(id,v)}catch(_){}if(!s)return;ax.drawImage(s,(i%COLS)*T,Math.floor(i/COLS)*T,T,T);(bmap[id]=bmap[id]||[])[v]=i});
  data.blockAtlas={file:'blocks.png',cell:T,cols:COLS,rows,map:bmap};
  // ---- crack stages
  const cr=mk(T*5,T),cx=cr.getContext('2d');for(let s=0;s<5;s++){try{cx.drawImage(crackSprite(s),s*T,0)}catch(_){}}
  data.cracks={file:'cracks.png',n:5,cell:T};
  // ---- item icons (64px): every block, every tool, every material
  const keys=[...ids,...Object.keys(TOOLS8.TL).map(i=>'w:'+i),...Object.keys(mats).map(Number)];
  return{data,keys,atlas:atl.toDataURL('image/png'),cracks:cr.toDataURL('image/png')}});
 png('blocks.png',R.atlas);png('cracks.png',R.cracks);
 // icons are produced by the game asynchronously (images from data URLs): collect them one by one
 const icons=await p.evaluate(async keys=>{const C=16,Z=64,c=document.createElement('canvas');c.width=C*Z;c.height=Math.ceil(keys.length/C)*Z;const x=c.getContext('2d'),map={};
  const load=u=>new Promise(r=>{if(!u)return r(null);if(typeof u!='string'){r(u);return}const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=u});
  let i=0;for(const k of keys){let u=null;try{u=iconURL(k)}catch(_){}const im=await load(u);if(!im)continue;x.drawImage(im,(i%C)*Z,Math.floor(i/C)*Z,Z,Z);map[k]=i;i++}
  return{url:c.toDataURL('image/png'),map,cols:C,cell:Z}},R.keys);
 png('icons.png',icons.url);R.data.icons={file:'icons.png',cols:icons.cols,cell:icons.cell,map:icons.map};
 // ---- trees: trunk + crown per tree type and growth stage (shared 170x250 frame, base at 85,242; the crown sways around px,py)
 const trees=await p.evaluate(()=>{const types=[5,50,15,8,3],out={},C=7;const c=document.createElement('canvas');c.width=170*C;c.height=250*types.length*2;const x=c.getContext('2d');
  types.forEach((r,ti)=>{out[r]=[];for(let sg=0;sg<C;sg++){let s=null;try{s=TREE9.get(r,sg,false)}catch(_){}if(!s)continue;x.drawImage(s.t,sg*170,ti*500);x.drawImage(s.c,sg*170,ti*500+250);out[r][sg]={px:s.px,py:s.py}}});
  return{url:c.toDataURL('image/png'),types,frames:out,w:170,h:250,bx:85,by:242}});
 png('trees.png',trees.url);delete trees.url;R.data.trees=Object.assign({file:'trees.png'},trees);
 // ---- the hero: idle, run and jump frames drawn by the game's own character renderer into a sprite sheet
 const hero=await p.evaluate(()=>{const Z=3,FW=160*Z,FH=170*Z,ox=80,oy=78,fr=[];for(let i=0;i<8;i++)fr.push({k:'idle',t:i*.18,vx:0,air:false});for(let i=0;i<8;i++)fr.push({k:'run',t:i*.07,vx:260,air:false});
  for(let i=0;i<4;i++)fr.push({k:'jump',t:i*.1,vx:120,air:true});
  const c=document.createElement('canvas');c.width=FW*fr.length;c.height=FH;const x=c.getContext('2d'),g0=g;
  fr.forEach((f,i)=>{const s=document.createElement('canvas');s.width=FW;s.height=FH;const sx=s.getContext('2d');g=sx;sx.setTransform(Z,0,0,Z,0,0);try{drawChar(ox,oy,1,myHue,'',f.t,f.vx,f.air,'','fist',0,0,wear,false,look,'')}catch(e){console.error('hero',e)}g=g0;sx.setTransform(1,0,0,1,0,0);sx.clearRect(0,0,FW,46*Z);x.drawImage(s,i*FW,0)});
  const anim={};fr.forEach((f,i)=>{(anim[f.k]=anim[f.k]||[]).push(i)});return{url:c.toDataURL('image/png'),fw:FW,fh:FH,ox:ox*Z,oy:oy*Z,scale:Z,anim}});
 png('hero.png',hero.url);delete hero.url;R.data.hero=Object.assign({file:'hero.png'},hero);
 fs.writeFileSync(path.join(OUT,'data.json'),JSON.stringify(R.data));
 const files=fs.readdirSync(OUT).map(f=>f+' '+(fs.statSync(path.join(OUT,f)).size/1024|0)+'KB');
 console.log('exported:',files.join(', '));console.log('blocks',R.data.ids.length,'icons',Object.keys(icons.map).length,'errors',errs.length?errs.slice(0,3):'none');
 await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
