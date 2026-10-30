// allocation churn (MB/s) and GC pauses during heavy play: sums heap growth between frames, and reads GC events from a CDP trace
const pw=require('playwright');const path=require('path');
(async()=>{const b=await pw.chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--mute-audio','--enable-precise-memory-info']});const ctx=await b.newContext({viewport:{width:1600,height:900}});const p=await ctx.newPage();
 await p.goto('file:///'+path.resolve(process.argv[2]||'.','index.html').replace(/\\/g,'/'));await p.waitForTimeout(1500);
 await p.evaluate(()=>{try{SHOW7.close()}catch(_){}try{document.getElementById('bp').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=80});await p.evaluate(()=>enterWorld('gcprof'));await p.waitForTimeout(2500);
 await p.evaluate(async()=>{gems=1e6;try{wingEquip('haloseraph')}catch(_){}try{for(const id of ['fx_aura_astral','fx_trail_ember'])SHOP7.st.own[id]=1;SHOP7.equip('fx_aura_astral');SHOP7.equip('fx_trail_ember')}catch(_){}
  try{for(const s of PET10.SPECIES)await SHOP7.buy('pet_'+s);PET10.ensure();addI(PET10.HOME,1);PET10.place(Math.floor(P.x/T)+2,Math.floor((P.y+P.h)/T)-1)}catch(_){}try{WX6.force='rain'}catch(_){}try{for(const id in BRK7.SHOP)SHOP7.st.own['fx_brk_'+id]=1;BRK7.set('galaxy')}catch(_){}
  mobs.length=0;try{BOSS6.spawn('storm')}catch(_){}for(let i=0;i<20;i++)try{spawnMob()}catch(_){}});
 const cdp=await ctx.newCDPSession(p);const ev=[];cdp.on('Tracing.dataCollected',d=>ev.push(...d.value));
 await cdp.send('Tracing.start',{categories:'v8,devtools.timeline,disabled-by-default-v8.gc',transferMode:'ReportEvents'});
 const r=await p.evaluate(async()=>{let frames=0,last=performance.now(),h0=performance.memory.usedJSHeapSize,alloc=0,mt=0,wt=0;const t0=last;
  while(performance.now()-t0<8000){await new Promise(r=>requestAnimationFrame(r));const n=performance.now();frames++;P.hp=9999;const h=performance.memory.usedJSHeapSize;if(h>h0)alloc+=h-h0;h0=h;
   if(n-mt>110){mt=n;const px=Math.floor(P.x/T)+((frames%7)-3),py=Math.floor((P.y+P.h)/T)+1,q=py*W+px;if(px>0&&py>0&&py<H-2){if(!tiles[q])tiles[q]=1;for(let i=0;i<30&&tiles[q];i++)breakAt(px,py,999)}}
   if(n-wt>150){wt=n;try{wcd=0;useWeapon()}catch(_){}}}
  return{frames,mbps:+(alloc/8/1048576).toFixed(1),perFrameKB:+(alloc/frames/1024).toFixed(1)}});
 const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
 const gc=ev.filter(e=>/^(MinorGC|MajorGC|V8.GCScavenger|V8.GCFinalizeMC|V8.GCIncrementalMarking|ScavengeTask)$/.test(e.name)&&e.dur);const by={};for(const e of gc){const k=e.name;by[k]=by[k]||{n:0,ms:0,max:0};by[k].n++;by[k].ms+=e.dur/1000;by[k].max=Math.max(by[k].max,e.dur/1000)}
 for(const k in by){by[k].ms=+by[k].ms.toFixed(1);by[k].max=+by[k].max.toFixed(2)}
 console.log(JSON.stringify(r),'\nGC over 8 s:',JSON.stringify(by));await b.close()})().catch(e=>{console.error('FAILED',e.message.slice(0,300));process.exit(1)});
