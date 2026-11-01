// The desktop app against a free server that is asleep: it starts from a local file (like the app does), the server only answers after a long wait, and the
// game keeps trying and goes online by itself, playing locally meanwhile. If nothing ever answers it ends up offline, and Connect still works. node tests/online-wake.js
const path=require('path'),fs=require('fs'),os=require('os'),net=require('net');
const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},150000).unref();
const FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
const freePort=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p))})});
(async()=>{const port=await freePort(),dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbwake-'));const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});let S=null;
 try{const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await p.addInitScript(a=>{window.RB_CONFIG_OVERRIDE={solo:false,server:a}},'http://127.0.0.1:'+port);
  await p.goto(FILE);await sleep(1500);await p.evaluate(()=>{try{document.getElementById('bp').click()}catch(_){}});await sleep(400);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});
  await sleep(14000);let r=await p.evaluate(()=>({st:NET7.state,entered:!!entered,cur}));ok('14 s later (past the old 7 s give-up) it is still trying, and you can play meanwhile',r.st=='connecting'&&r.entered,r);
  await sleep(14000);S=createServer({port,host:'127.0.0.1',dataDir:dir,scryptN:64,client:path.join(__dirname,'..','index.html')});await S.listen();
  const t0=Date.now();const on=await p.waitForFunction(()=>NET7.online,null,{timeout:30000}).then(()=>true).catch(()=>false);ok('when the server wakes, the game goes online by itself',on,{after:Math.round((Date.now()-t0)/1000)+'s'});
  await sleep(1000);r=await p.evaluate(()=>({world:NET7.world,cur,kind:NET7.auth&&NET7.auth.kind}));ok('and joins the shared Plaza as a guest',r.world=='plaza'&&r.cur=='plaza'&&r.kind=='guest',r);
  // Disconnect means disconnect: no more tries behind your back
  await p.evaluate(()=>NET7.toOffline());await sleep(6000);r=await p.evaluate(()=>NET7.state);ok('Disconnect stays disconnected',r=='offline',r);
  ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 }catch(e){ok('wake harness',false,String(e.stack||e).slice(0,500))}
 await b.close();try{if(S)await S.close()}catch(_){}console.log(fails?'FAILURES '+fails:'all wake tests passed');process.exit(fails?1:0)})();
