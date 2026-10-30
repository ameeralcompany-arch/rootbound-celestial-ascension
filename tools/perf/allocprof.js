// where the per-frame garbage comes from: CDP sampling heap profiler (incl. objects already collected) during heavy play
const pw=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await pw.chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--mute-audio','--enable-precise-memory-info']});const ctx=await b.newContext({viewport:{width:1600,height:900}});const p=await ctx.newPage();
 const html=path.resolve(process.argv[2]||'.','index.html');await p.goto('file:///'+html.replace(/\\/g,'/'));await p.waitForTimeout(1500);
 await p.evaluate(()=>{try{SHOW7.close()}catch(_){}try{document.getElementById('bp').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=80});await p.evaluate(()=>enterWorld('allocprof'));await p.waitForTimeout(2500);
 await p.evaluate(async()=>{gems=1e6;try{wingEquip('haloseraph')}catch(_){}try{for(const id of ['fx_aura_astral','fx_trail_ember'])SHOP7.st.own[id]=1;SHOP7.equip('fx_aura_astral');SHOP7.equip('fx_trail_ember')}catch(_){}
  try{for(const s of PET10.SPECIES)await SHOP7.buy('pet_'+s);PET10.ensure();addI(PET10.HOME,1);PET10.place(Math.floor(P.x/T)+2,Math.floor((P.y+P.h)/T)-1)}catch(_){}try{WX6.force='rain'}catch(_){}try{for(const id in BRK7.SHOP)SHOP7.st.own['fx_brk_'+id]=1;BRK7.set('galaxy')}catch(_){}
  mobs.length=0;try{BOSS6.spawn('storm')}catch(_){}for(let i=0;i<20;i++)try{spawnMob()}catch(_){}});
 await p.waitForTimeout(1500);
 const cdp=await ctx.newCDPSession(p);await cdp.send('HeapProfiler.enable');
 await cdp.send('HeapProfiler.startSampling',{samplingInterval:4096,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});
 const r=await p.evaluate(async()=>{let frames=0,mt=0,wt=0;const t0=performance.now();
  while(performance.now()-t0<6000){await new Promise(r=>requestAnimationFrame(r));const n=performance.now();frames++;P.hp=9999;
   if(n-mt>110){mt=n;const px=Math.floor(P.x/T)+((frames%7)-3),py=Math.floor((P.y+P.h)/T)+1,q=py*W+px;if(px>0&&py>0&&py<H-2){if(!tiles[q])tiles[q]=1;for(let i=0;i<30&&tiles[q];i++)breakAt(px,py,999)}}
   if(n-wt>150){wt=n;try{wcd=0;useWeapon()}catch(_){}}}return{frames}});
 const {profile}=await cdp.send('HeapProfiler.stopSampling');
 // map line:col in index.html back to the source file via the build's file banners is hard; print a code snippet instead
 const lines=fs.readFileSync(html,'utf8').split('\n');const agg={},snip={};let tot=0;
 (function walk(n){const cf=n.callFrame;const k=(cf.functionName||'(anon)')+' @'+(cf.lineNumber+1)+':'+(cf.columnNumber+1);agg[k]=(agg[k]||0)+n.selfSize;tot+=n.selfSize;
  if(!snip[k]&&cf.lineNumber>=0&&lines[cf.lineNumber])snip[k]=lines[cf.lineNumber].slice(Math.max(0,cf.columnNumber-30),cf.columnNumber+90);for(const c of n.children)walk(c)})(profile.head);
 const top=Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,25);console.log(JSON.stringify(r),'sampled MB',(tot/1048576).toFixed(1),'= KB/frame',(tot/1024/r.frames).toFixed(0));
 for(const [k,v] of top)console.log((v/tot*100).toFixed(1).padStart(5)+'%  '+k+'\n         '+(snip[k]||''));
 await b.close()})().catch(e=>{console.error('FAILED',e.message.slice(0,300));process.exit(1)});
