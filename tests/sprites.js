// Art made in Blender reaches the game: the server hosts assets/sprites/ (and nothing else there), RBART draws the right frame under the page's real protection, and a missing
// or badly named sprite only returns false, so the game keeps drawing what it always did. The sheet in tests/fixtures was made by tools/blender/render_sheet.py --demo. node tests/sprites.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),os=require('os'),http=require('http');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},120000).unref();
const FIX=path.join(__dirname,'fixtures'),meta=JSON.parse(fs.readFileSync(path.join(FIX,'rbtest-sheet.json'),'utf8'));
const get=(port,p)=>new Promise((res,rej)=>{http.get({port,host:'127.0.0.1',path:p},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res({s:r.statusCode,h:r.headers,n:Buffer.concat(c).length}))}).on('error',rej)});
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbart-'));fs.copyFileSync(path.join(__dirname,'..','index.html'),path.join(dir,'index.html'));fs.mkdirSync(path.join(dir,'assets','sprites'),{recursive:true});fs.copyFileSync(path.join(FIX,'rbtest-sheet.png'),path.join(dir,'assets','sprites','rbtest-sheet.png'));fs.writeFileSync(path.join(dir,'assets','sprites','secret.txt'),'nope');
 const S=createServer({allowGuests:true,port:0,host:'127.0.0.1',dataDir:fs.mkdtempSync(path.join(os.tmpdir(),'rbartd-')),scryptN:64,client:path.join(dir,'index.html')});const port=await S.listen();
 const a=await get(port,'/assets/sprites/rbtest-sheet.png');ok('the server hosts a sprite sheet as an image',a.s==200&&a.h['content-type']=='image/png'&&a.n>200,{s:a.s,t:a.h['content-type'],n:a.n});
 for(const p of['/assets/sprites/secret.txt','/assets/sprites/../index.html','/assets/sprites/%2e%2e/%2e%2e/server/server.js','/assets/sprites/no-such-sheet.png','/assets/sprites/UPPER.png','/assets/other.png'])ok('not served: '+p,(await get(port,p)).s==404);
 const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:720}});await c.addInitScript(()=>{window.__csp=[];addEventListener('securitypolicyviolation',e=>__csp.push(e.violatedDirective+' '+String(e.blockedURI).slice(0,70)))});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,140)));await p.goto('http://127.0.0.1:'+port+'/');for(let i=0;i<100&&!(await p.evaluate(()=>typeof RBART!='undefined'));i++)await p.waitForTimeout(100);
 const r=await p.evaluate(async m=>{const first=RBART.draw(document.createElement('canvas').getContext('2d'),'rbtest-sheet',0,0,0,{fw:m.fw,n:m.n,cols:m.cols});for(let i=0;i<60&&!RBART.ready('rbtest-sheet');i++)await new Promise(r=>setTimeout(r,50));
  const shot=(frame,flip)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const ok=RBART.draw(g,'rbtest-sheet',0,32,32,{fw:m.fw,n:m.n,cols:m.cols,w:64,frame,flip});const d=g.getImageData(0,0,64,64).data;let ink=0,corner=d[3],sum=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>40){ink++;sum=(sum*31+d[i])%1000003}}return{ok,ink,corner,sum}};
  const f0=shot(0),f3=shot(3),f0b=shot(0),fl=shot(1,true),fn=shot(1);const ctx=document.createElement('canvas').getContext('2d');
  const missing=RBART.draw(ctx,'no-such-sheet',0,0,0,{fw:64});await new Promise(r=>setTimeout(r,500));
  return{first,f0,f3,f0b,fl,fn,missing,missingLater:RBART.draw(ctx,'no-such-sheet',0,0,0,{fw:64}),failed:RBART.failed('no-such-sheet'),badName:RBART.draw(ctx,'../../server',0,0,0,{fw:64}),timed:RBART.draw(ctx,'rbtest-sheet',1.5,0,0,{fw:m.fw,n:m.n,cols:m.cols,fps:12}),csp:__csp.slice(0,4)}},meta);
 ok('before it has loaded, draw says no, so the game draws what it always did',r.first===false);
 ok('once loaded it draws, with a see-through background',r.f0.ok&&r.f0.ink>200&&r.f0.corner==0,r.f0);
 ok('different frames show a different picture, the same frame the same one',r.f0.sum!=r.f3.sum&&r.f0.sum==r.f0b.sum,{f0:r.f0.sum,f3:r.f3.sum});
 ok('it can face either way',r.fl.ok&&r.fl.ink==r.fn.ink,{flip:r.fl.ink,normal:r.fn.ink});
 ok('it follows time',r.timed===true);
 ok('a missing sprite never breaks the game',r.missing===false&&r.missingLater===false&&r.failed===true,r);
 ok('a bad name is refused',r.badName===false);
 ok('the page\'s protection allows it',r.csp.filter(x=>/rbtest/.test(x)).length==0,r.csp);ok('no page errors',errs.length==0,errs.slice(0,3));
 await b.close();await S.close();console.log(fails?'FAILED '+fails:'all sprite tests passed');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e&&e.stack||e).slice(0,600));process.exit(1)});
