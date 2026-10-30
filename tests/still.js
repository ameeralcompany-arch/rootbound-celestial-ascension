// Still background (STILL13): with the setting on (default) the sky and every weather-machine scenery are pixel-identical over time and
// weather cannot start; switching it off brings the motion and the weather back; the switch lives in Settings > Graphics.
const {chromium}=require('playwright');const path=require('path');let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},150000).unref();
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///'+path.resolve(__dirname,'..','index.html').replace(/\\/g,'/'));await p.waitForTimeout(1200);
 await p.evaluate(()=>{try{SHOW7.close()}catch(_){}try{document.getElementById('bp').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.evaluate(()=>enterWorld('stilltest'));await p.waitForTimeout(2200);
 const grab=()=>p.evaluate(()=>{const x=document.createElement('canvas');x.width=160;x.height=40;const g2=x.getContext('2d');g2.drawImage(cv,0,0,cv.width,cv.height*.22,0,0,160,40);return Array.from(g2.getImageData(0,0,160,40).data)});
 const diff=(a,b)=>{let d=0;for(let i=0;i<a.length;i++)d+=Math.abs(a[i]-b[i]);return d/a.length};
 await p.evaluate(()=>{P.vx=0;const v=clock();clock=()=>v});
 ok('still background is on by default',await p.evaluate(()=>cel.opt.still!=0&&STILL13.on()));
 const a1=await grab();await p.waitForTimeout(2500);const a2=await grab();ok('the sky does not move',diff(a1,a2)<.08,diff(a1,a2).toFixed(3));
 const env={};for(const e of ['blossom','galaxy','space']){await p.evaluate(e=>ENV7.set(e,{instant:true}),e);await p.waitForTimeout(1000);const x1=await grab();await p.waitForTimeout(1800);const x2=await grab();env[e]=+diff(x1,x2).toFixed(3)}
 ok('weather-machine scenery is still',Object.values(env).every(v=>v<.08),JSON.stringify(env));await p.evaluate(()=>ENV7.set('default',{instant:true}));
 const w=await p.evaluate(async()=>{WX6.force='storm';await new Promise(z=>setTimeout(z,1200));const o={cur:WX6.cur,storm:WX6.I.storm};WX6.force=null;return o});ok('no weather starts, even when a machine forces it',w.cur=='clear'&&w.storm<.05,JSON.stringify(w));
 await p.evaluate(()=>{cel.opt.still=0});const b1=await grab();await p.waitForTimeout(2500);const b2=await grab();ok('switched off: the sky moves again',diff(b1,b2)>.2,diff(b1,b2).toFixed(3));
 const w2=await p.evaluate(async()=>{WX6.force='rain';await new Promise(z=>setTimeout(z,1200));const o=WX6.cur;WX6.force=null;return o});ok('switched off: weather works again',w2=='rain',w2);
 ok('Settings > Graphics has the Still background switch',await p.evaluate(()=>{try{UI6.open('settings')}catch(_){}const e=document.getElementById('sst');return !!e&&e.closest('#ss-graphics')!=null}));
 ok('no page errors',errs.length==0,errs.slice(0,3).join('|'));
 await b.close();console.log(fails?'FAILURES '+fails:'all still tests passed');process.exit(fails?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
