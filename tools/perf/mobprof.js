// per-function ms/frame at different mob counts (finds anything that scales worse than linearly with mobs)
const pw=require('playwright');const path=require('path');
(async()=>{const b=await pw.chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1600,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///'+path.resolve(process.argv[2]||'.','index.html').replace(/\\/g,'/'));await p.waitForTimeout(1500);
 await p.evaluate(()=>{try{SHOW7.close()}catch(_){}try{document.getElementById('bp').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=80});await p.evaluate(()=>enterWorld('mobprof'));await p.waitForTimeout(2500);
 const names=(process.env.FN||'update,draw,updMobs,drawMob,moveE,hurtMob,updDrops,drawDrops,burst,solidAt,drawChar').split(',');
 for(const N of [10,40,80,140]){
  const r=await p.evaluate(async([N,names])=>{mobs.length=0;let g=0;while(mobs.length<N&&g++<N*20)try{spawnMob()}catch(_){}
   // keep them alive and near
   const acc={},cnt={},orig={};for(const n of names){try{const f=(0,eval)(n);if(typeof f!='function')continue;orig[n]=f;acc[n]=0;cnt[n]=0;(0,eval)(n+'=function(){const t=performance.now();try{return window.__o["'+n+'"].apply(this,arguments)}finally{window.__a["'+n+'"]+=performance.now()-t;window.__c["'+n+'"]++}}')}catch(e){}}
   window.__o=orig;window.__a=acc;window.__c=cnt;
   let frames=0,last=performance.now();const t0=last,ds=[];while(performance.now()-t0<5000){await new Promise(r=>requestAnimationFrame(r));const n=performance.now();ds.push(n-last);last=n;frames++;P.hp=9999;for(const m of mobs)m.hp=Math.max(m.hp,50);let k=0;while(mobs.length<N&&k++<5)try{spawnMob()}catch(_){}}
   for(const n in orig)try{(0,eval)(n+"=window.__o[\""+n+"\"]")}catch(_){};ds.sort((a,b)=>a-b);const o={};for(const n in acc)o[n]=+(acc[n]/frames).toFixed(2)+'ms/'+Math.round(cnt[n]/frames);
   return{N:mobs.length,fps:Math.round(frames/5),p95:+ds[Math.floor(ds.length*.95)].toFixed(1),fn:o}},[N,names]);console.log(JSON.stringify(r))}
 console.log('errors',errs.slice(0,3));await b.close()})().catch(e=>{console.error('FAILED',e.message.slice(0,300));process.exit(1)});
