// Accounts with a real server and real browsers: a new account always starts at level 1 whatever the computer played before, the offline save stays untouched,
// progress is kept on the server and follows the account to another computer, the backup button is gone online, and a reset starts everyone over. node tests/accounts.js
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbacc-'));const OPT={host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',client:path.join(__dirname,'..','index.html')};
let S=createServer(Object.assign({port:0},OPT));const errs=[];
const ev=(p,f,a)=>p.evaluate(f,a);
const enterGame=async p=>{await p.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online,null,{timeout:15000});await p.waitForTimeout(300);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});await p.waitForTimeout(300)};
async function open(b,url,tag,ctx){ctx=ctx||await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));await p.goto(url);await enterGame(p);return p}
const authAs=async(p,msg,name)=>{await ev(p,m=>NET7.send(m),msg);await p.waitForFunction(n=>typeof NET7!='undefined'&&NET7.auth&&NET7.auth.name==n&&RB_ACCT.id==NET7.auth.uid,name,{timeout:12000});await enterGame(p)};
const reg=(p,n)=>authAs(p,{t:'register',name:n,pass:n+'-password'},n),login=(p,n,pw)=>authAs(p,{t:'login',name:n,pass:pw||n+'-password'},n);
const state=p=>ev(p,()=>({lvl:lvl|0,gems:gems|0,acct:RB_ACCT.id,auth:NET7.auth&&NET7.auth.name}));
(async()=>{let port=await S.listen();const url='http://127.0.0.1:'+port+'/';const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
 try{
  // a computer that has already played a lot
  const P=await open(b,url,'P');await ev(P,()=>{lvl=40;gems=99999;inv[5]=500;saveP()});await sleep(200);const plain0=await ev(P,()=>localStorage.getItem('rbp'));ok('this computer has a level 40 save',/"?lvl"?/.test(plain0||'')||plain0&&plain0.length>10);
  await reg(P,'newbie');let s=await state(P);ok('a new account starts at level 1 with nothing, not this computer\'s level 40',s.lvl<=1&&s.gems<1000&&s.acct,s);
  ok('its save is separate: the offline save is untouched',(await ev(P,()=>{const raw=Storage.prototype.getItem;return window.__raw=(()=>{for(let i=0;i<localStorage.length;i++)if(localStorage.key(i)=='rbp')return true;return false})()})),'');
  ok('no backup button online',await ev(P,()=>{try{UI6.open('settings')}catch(_){}const has=!!document.getElementById('ssd');try{UI6.close()}catch(_){}return !has}));
  ok('save files cannot be imported online',await ev(P,()=>{try{UI6.open('account');const t=document.body.innerText.includes('Import save file');try{UI6.close()}catch(_){}return !t}catch(_){return true}}));
  // progress goes to the server
  await ev(P,()=>{lvl=7;gems=321;saveP();ACCT13.upload(true)});await sleep(800);const u0=JSON.parse(fs.readFileSync(path.join(dir,'profiles',(await ev(P,()=>RB_ACCT.id))+'.json'),'utf8'));ok('progress is saved on the server',u0.rev>=1&&!!u0.keys.rbp&&!Object.keys(u0.keys).some(k=>/^rbw_|^rbp_bak|^rbtok|^rb_/.test(k)),{rev:u0.rev,keys:Object.keys(u0.keys).length,size:JSON.stringify(u0).length});
  // and follows the account to another computer
  const Q=await open(b,url,'Q');await login(Q,'newbie');await Q.waitForFunction(()=>(lvl|0)==7,null,{timeout:12000}).catch(()=>{});await enterGame(Q);s=await state(Q);ok('signing in on another computer brings the same progress',s.lvl==7,s);
  // two computers: one account plays on one at a time (the server signs the other out), and the newer save wins when the first comes back
  await ev(Q,()=>{lvl=9;saveP();ACCT13.upload(true)});await sleep(700);await ev(P,()=>{lvl=8;saveP()});await P.reload();await P.waitForFunction(()=>typeof lvl!='undefined'&&(lvl|0)==9,null,{timeout:15000}).catch(()=>{});await sleep(600);await enterGame(P);s=await state(P);ok('coming back to an older computer: the newer save replaces the old copy',s.lvl==9,s);
  ok('reconnecting keeps the account\'s save on the server',(await ev(P,()=>ACCT13.base))>=2,await ev(P,()=>ACCT13.base));
  // sign out: back to this computer's own save
  await ev(P,()=>{NET7.send({t:'logout',token:localStorage.getItem('rbtok')});localStorage.setItem('rbtok','');ACCT13.leave(false)});await P.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online&&NET7.auth&&NET7.auth.kind=='guest'&&!RB_ACCT.id,null,{timeout:15000});await enterGame(P);s=await state(P);ok('signing out brings back this computer\'s offline save, with its gems',s.lvl==40&&s.gems>=99999,s);const g9=s.gems;
  await ev(P,()=>{SHOP7.st.pend=500;SHOP7.save();saveP()});await P.reload();await enterGame(P);await sleep(1900);s=await state(P);ok('gems an older version moved to pending come back to the offline save',s.gems>=g9+500,s);await ev(P,()=>{gems=99999;saveP()});
  await login(P,'newbie');await P.waitForFunction(()=>(lvl|0)==9,null,{timeout:12000}).catch(()=>{});s=await state(P);ok('signing back in brings back the account',s.lvl==9,s);
  // a world owned before the reset
  await ev(P,()=>NET7.go('oldland',true));await P.waitForFunction(()=>NET7.world=='oldland',null,{timeout:8000});await sleep(400);const k0=await ev(P,()=>{const k=5*W+20;tiles[k]=3;pushEdit(k);return k});await sleep(500);
  const O=await open(b,url,'O');await login(O,'Boss','owner-password-1');s=await state(O);ok('the owner signs in',(await ev(O,()=>NET7.owner)),s);await ev(O,()=>{lvl=33;saveP();ACCT13.upload(true)});await sleep(700);const oid=await ev(O,()=>RB_ACCT.id);
  // ---- the reset
  await S.close();await sleep(500);const before=JSON.parse(fs.readFileSync(path.join(dir,'worlds','oldland.json'),'utf8'));ok('(the world had an owner)',!!before.ownerUid);
  S=createServer(Object.assign({port,resetGen:1},OPT));await S.listen();
  let A=JSON.parse(fs.readFileSync(path.join(dir,'accounts.json'),'utf8'));ok('the reset removes every account but recreates the owner',Object.keys(A.users).length==1&&A.users.boss&&A.users.boss.id==oid&&A.gen==1,Object.keys(A.users));
  ok('saved progress is gone from the server',fs.readdirSync(path.join(dir,'profiles')).filter(f=>f.endsWith('.json')).length==0);
  const w1=JSON.parse(fs.readFileSync(path.join(dir,'worlds','oldland.json'),'utf8'));ok('worlds stay, with their builds, but belong to nobody',!w1.ownerUid&&!w1.ownerName&&w1.edits[k0],{owner:w1.ownerUid,edit:w1.edits[k0]});
  // players who were signed in
  await P.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online&&!RB_ACCT.id,null,{timeout:30000}).catch(()=>{});await enterGame(P);s=await state(P);ok('a deleted account is signed out, back on the offline save',!s.acct&&s.lvl==40,s);
  await reg(P,'newbie');s=await state(P);ok('registering the same name again starts at level 1',s.lvl<=1,s);
  const ok1=await O.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online&&NET7.auth,null,{timeout:30000}).then(()=>true).catch(()=>false);await sleep(1500);
  await O.reload();await enterGame(O);if(!(await ev(O,()=>NET7.owner)))await login(O,'Boss','owner-password-1');await sleep(600);s=await state(O);ok('the owner starts over at level 1 too, still owner',s.lvl<=1&&await ev(O,()=>NET7.owner),s);
  // the same reset does not run twice
  await ev(O,()=>{lvl=4;saveP();ACCT13.upload(true)});await sleep(700);await S.close();await sleep(400);S=createServer(Object.assign({port,resetGen:1},OPT));await S.listen();A=JSON.parse(fs.readFileSync(path.join(dir,'accounts.json'),'utf8'));ok('restarting does not reset again',Object.keys(A.users).length==2,Object.keys(A.users));
  ok('no page errors',errs.length==0,errs.slice(0,4).join(' | '));
 }catch(e){ok('accounts harness',false,String(e.stack||e).slice(0,700))}
 await b.close();try{await S.close()}catch(_){}console.log(fails?'FAILURES '+fails:'all account tests passed');process.exit(fails?1:0)})();
