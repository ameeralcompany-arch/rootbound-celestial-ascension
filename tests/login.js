// The one way into Rootbound, end to end, as a player runs it (the Windows app's real online mode, not the automated single-player mode), against a local server:
// the login screen comes first and nothing is entered behind it; the server refuses guests; a wrong password is refused; creating an account shows its
// recovery key, brings this computer's progress, and enters the online Plaza; the progress is on the server for a second computer; "Remember me" on and off;
// a forgotten password reset with the recovery key; signing in elsewhere signs this one out; a server that goes down mid-game freezes the game behind a
// "Connection lost" cover and play resumes when it is back; a server that cannot be reached at launch shows a connection screen whose Retry works; signing
// out returns to the login screen. There is never an offline or guest option. node tests/login.js   (SHOTS=1 saves screenshots in %TEMP%/rblogin-shots)
const path=require('path'),fs=require('fs'),os=require('os');const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(process.env.INDEX||path.join(__dirname,'..','index.html')).replace(/\\/g,'/'),SHOTS=process.env.SHOTS?path.join(os.tmpdir(),'rblogin-shots'):null;if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},600000).unref();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Rootbound/6.99.0 Chrome/130.0.0.0 Electron/33.0.0 Safari/537.36';
const OFFLINE_SAVE=JSON.stringify({v:1,inv:{1:20},gems:1234,own:{fist:1},wp:'fist',bar:[1],done:{},xp:40,lvl:7,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a',shoes:'#222',hat:0,gd:1,eye:'#222'}});
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rblogin-'));let port=0,S=null;
 const up=async()=>{S=createServer({csp:false,port,host:'127.0.0.1',dataDir:dir,scryptN:64,wxCooldownMs:0,maxConnsPerIp:200,regPerIp:50,ownerName:'Boss',ownerPass:'owner-password-1'});port=await S.listen()};
 const down=async()=>{try{await Promise.race([S.close(),sleep(3000)])}catch(_){}};
 await up();
 const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});const errs=[];
 const ctxOf=async seed=>{const c=await b.newContext({viewport:{width:1600,height:900},userAgent:UA});await c.addInitScript(([p,seed])=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});window.RB_CONFIG_OVERRIDE={server:'http://127.0.0.1:'+p,solo:false};try{if(seed&&!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('rbp',seed);localStorage.setItem('rbg_seen','1')}}catch(_){}},[port,seed]);return c};
 const page=async c=>{const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()=='error'&&/LOGIN1|NET7|ACCT13|EVC|FILM1/.test(m.text()))errs.push(m.text().slice(0,240))});await p.goto(FILE,{waitUntil:'commit'});return p};
 const shot=async(p,n)=>{if(SHOTS)try{await p.screenshot({path:path.join(SHOTS,n+'.jpg'),type:'jpeg',quality:72})}catch(_){}};
 const view=p=>p.evaluate(()=>{const r=document.getElementById('rbl');if(!r)return{gone:1};const h=r.querySelector('.rbl-body h3'),bz=r.querySelector('.rbl-busy b'),e=r.querySelector('.rbl-err');return{h:h&&h.textContent,busy:bz&&bz.textContent,err:e&&e.textContent,key:(r.querySelector('.rbl-key')||{}).textContent||null}}).catch(()=>({nav:1}));
 const until=async(p,fn,ms,arg)=>{const t0=Date.now();while(Date.now()-t0<(ms||20000)){try{const r=await p.evaluate(fn,arg);if(r)return r}catch(_){}await sleep(200)}return null};
 const inWorld=p=>until(p,()=>typeof entered!='undefined'&&entered&&NET7.online&&NET7.auth&&NET7.auth.kind!='guest'&&!document.getElementById('rbl')?{w:cur,name:NET7.auth.name,lvl:typeof lvl!='undefined'?lvl:null}:null,40000);
 const loginView=p=>until(p,()=>{const h=document.querySelector('#rbl .rbl-body h3');return h&&/Welcome to Rootbound/.test(h.textContent)&&!document.querySelector('#rbgo').disabled?h.textContent:null},90000);
 // ---- 1. launch: the login screen, nothing behind it, the server refuses guests
 const cA=await ctxOf(OFFLINE_SAVE);let A=await page(cA);
 const l0=await loginView(A);await shot(A,'1-login');
 const s0=await A.evaluate(()=>({entered:typeof entered!='undefined'&&entered,net:NET7.state,auth:NET7.auth,cover:!!window.RB_COVER,text:document.getElementById('rbl').innerText}));
 ok('the login screen comes first and the world is not entered behind it',!!l0&&!s0.entered&&s0.net=='ready'&&!s0.auth&&s0.cover,{l0,entered:s0.entered,net:s0.net});
 ok('the login screen has no offline, guest or single-player option',!/offline|guest|play without|single.?player|local/i.test(s0.text),s0.text.slice(0,200));
 const gst=await A.evaluate(p=>new Promise(r=>{const w=new WebSocket('ws://127.0.0.1:'+p+'/ws');let out=null;w.onmessage=e=>{const m=JSON.parse(e.data);if(m.t=='server')w.send(JSON.stringify({t:'guest',name:'Tester'}));if(m.t=='auth'){out=m;w.close();r(out)}};setTimeout(()=>r(out),5000)}),port);
 ok('the server refuses to let anyone play as a guest',gst&&!gst.ok&&gst.guestOff==1,gst);
 // ---- 2. a wrong password is refused, with the reason, on the same screen
 await A.click('[data-a=register]');await sleep(200);const hasImp=await A.evaluate(()=>!!document.getElementById('rbim'));await A.click('[data-a=login]');await sleep(200);
 await A.fill('#rbn','nobody_here');await A.fill('#rbp','wrongpassword1');await A.click('#rbgo');await until(A,()=>{const e=document.querySelector('#rbl .rbl-err');return e&&e.textContent},8000);
 const v1=await view(A);ok('a wrong name or password is refused on the login screen',/wrong/i.test(v1.err||'')&&/Welcome/.test(v1.h||''),v1);
 // ---- 3. create an account: the recovery key, this computer's progress comes along, the online Plaza
 await A.click('[data-a=register]');await sleep(250);await A.fill('#rbn','Mira_01');await A.fill('#rbp','silver-lantern-9');await A.fill('#rbp2','silver-lantern-9');await shot(A,'2-register');await A.click('#rbgo');
 await until(A,()=>!!document.querySelector('#rbl .rbl-key'),30000);const v2=await view(A);await shot(A,'3-key');
 const go0=await A.evaluate(()=>document.querySelector('#rbgo').disabled);
 ok('creating an account shows its recovery key once, and Continue waits until it is saved',/^[A-Z0-9]{5}(-[A-Z0-9]{5}){3}$/.test(v2.key||'')&&go0===true,{key:v2.key,disabled:go0,importBox:hasImp});
 const KEY=v2.key;await A.check('#rbsv');await A.click('#rbgo');const w1=await inWorld(A);await shot(A,'4-world');
 ok('then the player is signed in and in the online Plaza',!!w1&&w1.w=='plaza'&&w1.name=='Mira_01',w1);
 ok("the progress made on this computer before came into the new account",!!w1&&w1.lvl==7&&hasImp,{lvl:w1&&w1.lvl,offered:hasImp});
 await sleep(6000);
 // ---- 4. the same account on another computer: its progress comes from the server
 const cB=await ctxOf(null);let Bp=await page(cB);await loginView(Bp);await Bp.fill('#rbn','Mira_01');await Bp.fill('#rbp','silver-lantern-9');await Bp.click('#rbgo');const w2=await inWorld(Bp);
 ok('on a second computer the same account loads its progress from the server',!!w2&&w2.lvl==7,w2);
 // signing in there signed this one out, with the reason, and only a way back to the login screen
 const k1=await until(A,()=>{const e=document.getElementById('rblost');return e&&e.classList.contains('on')?e.innerText:null},10000);await shot(A,'5-signed-elsewhere');
 ok('signing in somewhere else signs this computer out, and says so',!!k1&&/another place/i.test(k1)&&/Back to sign in/i.test(k1),k1&&k1.slice(0,120));
 await A.close();
 // ---- 6. a lost connection mid-game: frozen behind a cover, back when the server is
 await down();const lc=await until(Bp,()=>{const e=document.getElementById('rblost');return e&&e.classList.contains('on')&&window.RB_COVER?e.innerText:null},20000);await shot(Bp,'7-lost');
 ok('when the server goes down mid-game, the game pauses behind "Connection lost" (no offline play)',!!lc&&/Connection lost|Reconnecting/i.test(lc),lc&&lc.slice(0,80));
 await up();const back=await until(Bp,()=>{const e=document.getElementById('rblost');return(!e||!e.classList.contains('on'))&&NET7.online&&NET7.auth&&entered&&!window.RB_COVER?cur:null},60000);
 ok('when the server is back, play resumes in the same world',back=='plaza',back);
 // ---- 7. forgot password: the recovery key sets a new one
 await Bp.evaluate(()=>NET7.signOut());const lo=await loginView(Bp);const vso=await view(Bp);ok('signing out returns to the login screen',!!lo&&/signed out/i.test(await Bp.evaluate(()=>document.querySelector('#rbl .sub').textContent)),vso);
 await Bp.click('[data-a=forgot]');await sleep(250);await Bp.fill('#rbn','Mira_01');await Bp.fill('#rbk',KEY.toLowerCase());await Bp.fill('#rbp','new-moonlight-22');await Bp.fill('#rbp2','new-moonlight-22');await Bp.click('#rbgo');
 await until(Bp,()=>!!document.querySelector('#rbl .rbl-key'),30000);const v3=await view(Bp);await shot(Bp,'8-reset');
 ok('a forgotten password is reset with the recovery key, and a new key is given',/Password reset/.test(v3.h||'')&&v3.key&&v3.key!==KEY,v3);
 await Bp.check('#rbsv');await Bp.click('#rbgo');const w3=await inWorld(Bp);ok('then the player is in the world with the new password',!!w3,w3);
 // "Remember me" on (the default): the next launch welcomes the player back, signed in
 await Bp.close();Bp=await page(cB);const wb=await until(Bp,()=>{const h=document.querySelector('#rbl .rbl-body h3');return h&&/Welcome back/.test(h.textContent)?document.querySelector('.rbl-who b').textContent:null},30000);await shot(Bp,'6-welcome');
 ok('with "Remember me" on, the next launch welcomes the player back',wb=='Mira_01',wb);await Bp.click('#rbgo');const w5=await inWorld(Bp);ok('and Enter goes straight into the world',!!w5,w5);await Bp.close();
 // the old password no longer works; "Remember me" off: the next launch asks again
 const cC=await ctxOf(null);let Cp=await page(cC);await loginView(Cp);await Cp.fill('#rbn','Mira_01');await Cp.fill('#rbp','silver-lantern-9');await Cp.click('#rbgo');await until(Cp,()=>{const e=document.querySelector('#rbl .rbl-err');return e&&e.textContent},8000);
 const v4=await view(Cp);ok('the old password no longer works',/wrong/i.test(v4.err||''),v4);
 await Cp.fill('#rbp','new-moonlight-22');await Cp.uncheck('#rbr');await Cp.click('#rbgo');const w4=await inWorld(Cp);
 await Cp.close();Cp=await page(cC);const lf=await loginView(Cp);ok('with "Remember me" off, the next launch asks for the password again',!!w4&&!!lf,{w4:!!w4,login:lf});
 // ---- 8. the server cannot be reached at launch: a connection screen, and Retry works
 await down();const cD=await ctxOf(null);const Dp=await page(cD);const er=await until(Dp,()=>{const h=document.querySelector('#rbl .rbl-body h3');return h&&/reach the servers/i.test(h.textContent)?h.textContent:null},100000);await shot(Dp,'9-unreachable');
 const ent=await Dp.evaluate(()=>typeof entered!='undefined'&&entered);ok('a server that cannot be reached shows a connection screen with Retry, and nothing is played offline',!!er&&!ent,{er,entered:ent});
 await up();await Dp.click('#rbgo');const rl=await loginView(Dp);ok('Retry connects once the server is back',!!rl,rl);
 ok('no errors during the login tests',errs.length==0,[...new Set(errs)].slice(0,6));
 await b.close();await down();try{fs.rmSync(dir,{recursive:true,force:true})}catch(_){}
 console.log(fails?fails+' login test(s) FAILED':'all login tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
