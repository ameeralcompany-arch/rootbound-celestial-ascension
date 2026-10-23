// Startup tests: the game must show its UI (never a black/blank screen) even when the network is slow/blocked,
// storage is blocked, or startup stalls. Run: node tests/boot.js
const {chromium}=require('playwright');const path=require('path'),http=require('http'),fs=require('fs');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},240000).unref();
const FILE=path.join(__dirname,'..','index.html');
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
const srv=http.createServer((q,r)=>{r.setHeader('content-type','text/html');r.end(fs.readFileSync(FILE))}).listen(0);const url='http://127.0.0.1:'+srv.address().port+'/';
async function run(name,{target=FILE.startsWith('/')?'file://'+FILE:FILE,net='ok',storage=true,wait=2500,vp={width:1280,height:720},init}={}){
 const ctx=await b.newContext({viewport:vp}),p=await ctx.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 if(net!='ok')await p.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>net=='block'?r.abort('blockedbyclient'):0);
 if(!storage)await p.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}})});
 if(init)await p.addInitScript(init);
 await p.goto(target,{waitUntil:'commit'}).catch(()=>{});await p.waitForTimeout(wait);
 const s=await p.evaluate(()=>({ready:!!(window.RBDIAG&&RBDIAG.ready),login:(()=>{const l=document.getElementById('login');return l?getComputedStyle(l).display:'none'})(),menu:(()=>{const l=document.getElementById('hudL');return !!l})(),boot:!!document.getElementById('rbboot'),diag:(()=>{const d=document.getElementById('rbdiag');return d?getComputedStyle(d).display:'none'})()})).catch(e=>({err:String(e)}));
 await p.unrouteAll({behavior:'ignoreErrors'}).catch(()=>{});await Promise.race([ctx.close().catch(()=>{}),new Promise(r=>setTimeout(r,5000))]);return{s,errs}}
let r=await run('baseline');ok('file:// normal network: reaches ready + login visible',r.s.ready&&r.s.login!='none'&&r.errs.length==0,JSON.stringify(r.s));
r=await run('hang',{net:'hang'});ok('file:// external hosts HANG (old black-screen cause): UI still ready',r.s.ready&&r.s.login!='none',JSON.stringify(r.s));
r=await run('block',{net:'block'});ok('external hosts blocked: UI ready',r.s.ready&&r.s.login!='none');
r=await run('http',{target:url,net:'hang'});ok('served over local HTTP with hung CDN: UI ready',r.s.ready&&r.s.login!='none');
r=await run('storage',{storage:false,net:'hang'});ok('localStorage blocked: UI ready (memory fallback)',r.s.ready&&r.s.login!='none',JSON.stringify(r.s));
for(const vp of [{width:800,height:600},{width:390,height:800},{width:2560,height:1440}]){r=await run('vp',{vp});ok('viewport '+vp.width+'x'+vp.height+': ready',r.s.ready&&r.errs.length==0)}
r=await run('stall',{wait:13500,init:()=>{window.requestAnimationFrame=()=>0}});ok('stalled render loop: diagnostic panel shown instead of blank screen',!r.s.ready&&r.s.diag=='block',JSON.stringify(r.s));
// regression: a saved profile holding object/unknown items crashed startup ("Cannot read properties of undefined (reading '1')" in blockSprite)
{const ctx=await b.newContext();const p=await ctx.newPage();await p.goto('file://'+FILE);await p.waitForTimeout(900);await p.getByText('PLAY AS GUEST',{exact:false}).first().click();await p.waitForTimeout(800);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(400);
 await p.evaluate(()=>{inv[27]=1;inv[41]=2;inv[127]=1;inv[55]=3;inv[0]=2;bar[0]=27;bar[1]=41;bar[2]=77;saveP()});
 const q=await ctx.newPage();const er=[];q.on('pageerror',e=>er.push(e.message));await q.goto('file://'+FILE);await q.waitForTimeout(2500);
 ok('saved profile with object/unknown items starts without errors',er.length==0&&await q.evaluate(()=>RBDIAG.ready),er.join('|'));await ctx.close()}
srv.close();await Promise.race([b.close().catch(()=>{}),new Promise(r=>setTimeout(r,5000))]);console.log(fails?'FAILURES '+fails:'all boot tests passed');process.exit(fails?1:0)})();
