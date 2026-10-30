// perf soak: heavy play for ~1 minute (mining, weapon spam, monster floods, boss fights, rain off/on) and checks that nothing compounds:
// living monsters stay under the ENT13 ceiling, retained heap (after GC) does not climb, DOM / timers / listeners stay flat, and the
// frame rate at the end is close to the start. Run: NODE_PATH=... CHROMIUM=... node tests/perfsoak.js
const {chromium}=require('playwright');const path=require('path');let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},240000).unref();
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--enable-precise-memory-info','--mute-audio']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});
 await ctx.addInitScript(()=>{const S=window.__soak={iv:new Set(),ls:0};const si=setInterval,ci=clearInterval;window.setInterval=function(f,ms,...a){const id=si.call(window,f,ms,...a);S.iv.add(id);return id};window.clearInterval=function(id){S.iv.delete(id);return ci.call(window,id)};
  const ae=EventTarget.prototype.addEventListener,re=EventTarget.prototype.removeEventListener;EventTarget.prototype.addEventListener=function(){S.ls++;return ae.apply(this,arguments)};EventTarget.prototype.removeEventListener=function(){S.ls--;return re.apply(this,arguments)}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const cdp=await ctx.newCDPSession(p);
 await p.goto('file:///'+path.resolve(__dirname,'..','index.html').replace(/\\/g,'/'));await p.waitForTimeout(1200);
 await p.evaluate(()=>{try{SHOW7.close()}catch(_){}try{document.getElementById('bp').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=80});await p.evaluate(()=>enterWorld('perfsoak'));await p.waitForTimeout(2200);
 await p.evaluate(()=>{try{for(const id in BRK7.SHOP)SHOP7.st.own['fx_brk_'+id]=1;BRK7.set('galaxy')}catch(_){}});
 const sample=async()=>{await cdp.send('HeapProfiler.collectGarbage');await p.waitForTimeout(150);return p.evaluate(()=>({heap:performance.memory.usedJSHeapSize/1048576,dom:document.getElementsByTagName('*').length,iv:window.__soak.iv.size,ls:window.__soak.ls,st:ENT13.stats()}))};
 const rows=[];
 for(let r=0;r<6;r++){
  const f=await p.evaluate(async r=>{let frames=0,mt=0,wt=0,bt=0;const t0=performance.now(),ms=8000,peak={live:0};
   while(performance.now()-t0<ms){await new Promise(z=>requestAnimationFrame(z));const n=performance.now();frames++;P.hp=9999;
    if(n-mt>110){mt=n;const px=Math.floor(P.x/T)+((frames%7)-3),py=Math.floor((P.y+P.h)/T)+1,q=py*W+px;if(px>0&&py>0&&py<H-2){if(!tiles[q])tiles[q]=1;for(let i=0;i<30&&tiles[q];i++)breakAt(px,py,999)}}
    if(n-wt>150){wt=n;try{wcd=0;useWeapon()}catch(_){}}
    if(n-bt>1000){bt=n;for(let i=0;i<8;i++)try{spawnMob()}catch(_){}if(r==3)try{if(!BOSS6.active())BOSS6.spawn('storm')}catch(_){}}
    peak.live=Math.max(peak.live,ENT13.live())}
   return{fps:frames*1000/ms,peak:peak.live}},r);
  rows.push(Object.assign(f,await sample()));console.log('round',r,JSON.stringify({fps:Math.round(rows[r].fps),peak:rows[r].peak,heap:rows[r].heap.toFixed(1),dom:rows[r].dom,iv:rows[r].iv,ls:rows[r].ls,st:rows[r].st}))}
 const cap=rows[0].st.cap,a=rows[1],z=rows[rows.length-1];
 ok('monster floods stay under the ceiling (boss fights may add their boss)',rows.every(r=>r.peak<=cap+2),'cap '+cap+', peaks '+rows.map(r=>r.peak).join(','));
 ok('ordinary spawns past the ceiling are skipped, off-screen monsters are not drawn',z.st.skipped>0&&z.st.culled>0,JSON.stringify(z.st));
 ok('retained heap does not climb',z.heap-a.heap<12,a.heap.toFixed(1)+' -> '+z.heap.toFixed(1)+' MB');
 ok('DOM, intervals and listeners stay flat',z.dom<=a.dom*1.1+10&&z.iv<=a.iv+2&&z.ls<=a.ls+10,JSON.stringify({dom:[a.dom,z.dom],iv:[a.iv,z.iv],ls:[a.ls,z.ls]}));
 const f0=(rows[0].fps+rows[1].fps)/2,f1=(rows[4].fps+rows[5].fps)/2;ok('frame rate at the end stays close to the start (no compounding slowdown)',f1>=f0*.8,Math.round(f0)+' -> '+Math.round(f1)+' fps');
 ok('burst particles are recycled',z.st.pool>0,JSON.stringify({parts:z.st.parts,pool:z.st.pool}));
 ok('no page errors',errs.length==0,errs.slice(0,3).join('|'));
 await b.close();console.log(fails?'FAILURES '+fails:'all perfsoak tests passed');process.exit(fails?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
