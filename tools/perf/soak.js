// soak test: heavy gameplay for N rounds; per round reports frame times, retained heap (after GC), DOM / canvas / timer / listener counts,
// and every top-level game global (arrays, Maps, Sets, objects, and one level inside module objects) whose size keeps growing.
const pw=require('playwright');const path=require('path');const fs=require('fs');
const ROUNDS=+(process.argv[3]||10),RMS=+(process.argv[4]||20000);
(async()=>{const b=await pw.chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--enable-precise-memory-info','--mute-audio','--js-flags=--expose-gc']});
 const ctx=await b.newContext({viewport:{width:1600,height:900}});
 await ctx.addInitScript(()=>{const S=window.__soak={iv:new Set(),to:new Set(),ls:0,raf:0};const si=setInterval,ci=clearInterval,st=setTimeout,ct=clearTimeout;
  window.setInterval=function(f,ms,...a){const id=si.call(window,f,ms,...a);S.iv.add(id);return id};window.clearInterval=function(id){S.iv.delete(id);return ci.call(window,id)};
  window.setTimeout=function(f,ms,...a){let id;id=st.call(window,function(){S.to.delete(id);return typeof f=='function'?f.apply(this,arguments):0},ms,...a);S.to.add(id);return id};window.clearTimeout=function(id){S.to.delete(id);return ct.call(window,id)};
  const ae=EventTarget.prototype.addEventListener,re=EventTarget.prototype.removeEventListener;EventTarget.prototype.addEventListener=function(){S.ls++;return ae.apply(this,arguments)};EventTarget.prototype.removeEventListener=function(){S.ls--;return re.apply(this,arguments)}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const cdp=await ctx.newCDPSession(p);
 const html=path.resolve(process.argv[2]||'.','index.html');await p.goto('file:///'+html.replace(/\\/g,'/'));await p.waitForTimeout(1500);
 // top-level names from the built page
 const src=fs.readFileSync(html,'utf8');const names=[...new Set([...src.matchAll(/(?:^|[;\n}])\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map(m=>m[1]))];
 await p.evaluate(()=>{try{SHOW7.close()}catch(_){}try{document.getElementById('bp').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=80;try{QM.setting('high')}catch(_){}});
 await p.evaluate(()=>enterWorld('soak'));await p.waitForTimeout(2500);
 await p.evaluate(async()=>{gems=1e6;try{wingEquip('haloseraph')}catch(_){}try{for(const id of ['fx_aura_astral','fx_trail_ember'])SHOP7.st.own[id]=1;SHOP7.equip('fx_aura_astral');SHOP7.equip('fx_trail_ember')}catch(_){}
  try{for(const s of PET10.SPECIES)await SHOP7.buy('pet_'+s);PET10.ensure();addI(PET10.HOME,1);PET10.place(Math.floor(P.x/T)+2,Math.floor((P.y+P.h)/T)-1)}catch(_){}
  try{WX6.force='rain'}catch(_){}try{for(const id in BRK7.SHOP)SHOP7.st.own['fx_brk_'+id]=1;BRK7.set('galaxy')}catch(_){}});
 const sample=async(r,stats)=>{await cdp.send('HeapProfiler.collectGarbage');await p.waitForTimeout(200);
  return p.evaluate(([names,r,stats])=>{const sz=v=>{if(v==null)return -1;if(Array.isArray(v)||ArrayBuffer.isView(v))return v.length;if(v instanceof Map||v instanceof Set)return v.size;if(typeof v=='object'&&!(v instanceof Node))return Object.keys(v).length;return -1};
   const o={};for(const n of names){let v;try{v=(0,eval)(n)}catch(_){continue}const s=sz(v);if(s>=0)o[n]=s;if(v&&typeof v=='object'&&!Array.isArray(v)&&!(v instanceof Map)&&!(v instanceof Set)&&!(v instanceof Node)&&!ArrayBuffer.isView(v)){let k=0;for(const key in v){if(++k>80)break;let w;try{w=v[key]}catch(_){continue}if(w&&typeof w=='object'&&!(w instanceof Node)){const s2=sz(w);if(s2>=0)o[n+'.'+key]=s2}}}}
   const S=window.__soak;return{r,heap:Math.round(performance.memory.usedJSHeapSize/1048576),dom:document.getElementsByTagName('*').length,cv:document.querySelectorAll('canvas').length,iv:S.iv.size,to:S.to.size,ls:S.ls,sizes:o,...stats}},[names,r,stats])};
 const rows=[];rows.push(await sample(0,{}));
 for(let r=1;r<=ROUNDS;r++){
  const stats=await p.evaluate(async ms=>{let frames=0,last=performance.now(),mt=0,wt=0,bt=0,pt=0,mv=0,dir=1;const t0=last,ds=[];
   while(performance.now()-t0<ms){await new Promise(r=>requestAnimationFrame(r));const n=performance.now();ds.push(n-last);last=n;frames++;P.hp=9999;
    if(n-mt>110){mt=n;const px=Math.floor(P.x/T)+((frames%7)-3),py=Math.floor((P.y+P.h)/T)+1+(frames%3),q=py*W+px;if(px>0&&py>0&&py<H-2){if(!tiles[q])tiles[q]=1+(frames%11);for(let i=0;i<30&&tiles[q];i++)breakAt(px,py,999)}}
    if(n-wt>150){wt=n;try{wcd=0;useWeapon()}catch(_){}}
    if(n-pt>400){pt=n;try{const px=Math.floor(P.x/T)-3,py=Math.floor(P.y/T)-2,q=py*W+px;if(py>2&&!tiles[q]){tiles[q]=5;try{markDirty&&markDirty(px,py)}catch(_){}}}catch(_){}}
    if(n-bt>9000){bt=n;try{if(!BOSS6.active())BOSS6.spawn(['storm','magma','tide'][(n/9000|0)%3])}catch(_){}try{for(let i=0;i<6;i++)spawnMob&&spawnMob()}catch(_){}}
    if(++mv%600==0)dir=-dir;P.x=Math.max(T*4,Math.min((W-6)*T,P.x+dir*3))}
   ds.sort((a,b)=>a-b);return{frames,fps:Math.round(frames*1000/ms),p50:+ds[ds.length>>1].toFixed(1),p95:+ds[Math.floor(ds.length*.95)].toFixed(1),p99:+ds[Math.floor(ds.length*.99)].toFixed(1),mobs:mobs.length,drops:typeof drops!='undefined'?drops.length:-1}},RMS);
  rows.push(await sample(r,stats));const x=rows[rows.length-1];console.log('round',r,JSON.stringify({fps:x.fps,p50:x.p50,p95:x.p95,p99:x.p99,heap:x.heap,dom:x.dom,cv:x.cv,iv:x.iv,to:x.to,ls:x.ls,mobs:x.mobs,drops:x.drops}))}
 // growth report: sizes that grew between round 1 and the last round and never shrank much
 const a=rows[1].sizes,z=rows[rows.length-1].sizes,grow=[];for(const k in z){if(!(k in a))continue;const d=z[k]-a[k];if(d<=5)continue;let mono=true;for(let i=2;i<rows.length;i++){if((rows[i].sizes[k]|0)<(rows[i-1].sizes[k]|0)*.9){mono=false;break}}grow.push([k,a[k],z[k],mono])}
 grow.sort((x,y)=>(y[2]-y[1])-(x[2]-x[1]));console.log('GROWING (name, round1, last, monotonic):');for(const g of grow.slice(0,40))console.log('  ',g.join('  '));
 fs.writeFileSync(path.join(require('os').tmpdir(),'rootbound-soak.json'),JSON.stringify(rows));console.log('errors:',errs.slice(0,5));await b.close()})().catch(e=>{console.error('FAILED',e.message.slice(0,400));process.exit(1)});
