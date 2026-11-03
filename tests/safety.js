// Player safety (chat words, block, report) and the gameplay fixes that came with them: recipes, material text, bait, chests, wilted crops, daily streaks, boss warnings.
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),os=require('os');const {createServer}=require('../server/server');const {cleanText}=require('../server/moderation');
let fails=0;const ok=(n,c,x)=>{console.log((c?'  ok   ':'  FAIL ')+n+(c||x==null?'':'  - '+(typeof x=='string'?x:JSON.stringify(x))));if(!c)fails++};setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},170000).unref();
(async()=>{
 // ---- the word filter: abuse goes, ordinary words stay
 ok('abuse is masked',!/fuck/i.test(cleanText('fuck you'))&&!/sh1t/i.test(cleanText('sh1t game'))&&!/n[i1]gg/i.test(cleanText('n1gger')),[cleanText('fuck you'),cleanText('sh1t game')]);
 for(const t of['class assignment','pass the sniper','shitake mushrooms','I love this grape soda','Scunthorpe','draper and fagus trees','hello world 123'])ok('leaves "'+t+'" alone',cleanText(t)==t,cleanText(t));
 const b=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--no-sandbox','--mute-audio','--disable-gpu']});
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbsafe-'));const S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',client:path.join(__dirname,'..','index.html')});const port=await S.listen(),url='http://127.0.0.1:'+port+'/';const errs=[];
 const client=async tag=>{const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));await p.goto(url);await p.waitForTimeout(800);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(400);await p.evaluate(()=>{try{SHOW7.close()}catch(_){}});await p.waitForFunction(()=>NET7.online,null,{timeout:15000});return p};
 const signup=async(p,n)=>{await p.evaluate(n=>NET7.send({t:'register',name:n,pass:n+'-password'}),n);await p.waitForFunction(n=>NET7.auth&&NET7.auth.name==n&&typeof RB_ACCT!='undefined'&&!!RB_ACCT.id,n,{timeout:15000});await p.waitForTimeout(500)};
 const go=async(p,w)=>{await p.evaluate(w=>NET7.go(w),w);await p.waitForFunction(w=>NET7.world==w&&cur==w,w,{timeout:8000}).catch(()=>{});await p.waitForTimeout(400)};
 const A=await client('Ann'),B=await client('Bea');await signup(A,'annsafe');await signup(B,'beasafe');await go(A,'safetyworld');await go(B,'safetyworld');
 // chat reaches the other player masked
 await A.evaluate(()=>NET7.send({t:'chat',d:{t:'you fuck off'}}));await A.waitForTimeout(600);
 const said=await B.evaluate(()=>document.body.innerText.includes('fuck'));ok('the server masks it before anyone else gets it',!said);
 // report
 await B.evaluate(()=>{NET7.send({t:'report',who:'annsafe',why:'being rude'})});const rf=path.join(dir,'reports.json');for(let i=0;i<40&&!fs.existsSync(rf);i++)await B.waitForTimeout(100);await B.waitForTimeout(200);const rep=JSON.parse(fs.readFileSync(rf,'utf8'));
 ok('a report reaches the owner with what they said',rep.list.length==1&&rep.list[0].who=='annsafe'&&rep.list[0].by=='beasafe'&&rep.list[0].said.length>=1&&!/fuck/.test(rep.list[0].said[0]),rep.list[0]);
 // block stops trade requests
 const ask=async()=>{const r=await A.evaluate(()=>{const o=SOC6.byName('beasafe');if(!o)return null;NET7.send({t:'trade',op:'ask',to:o.peer});return o.peer});await B.waitForTimeout(500);return{r,got:await B.evaluate(()=>!!ONL10.trade)}};
 const before=await ask();ok('before blocking, a trade request arrives',before.got,before);await A.evaluate(()=>NET7.send({t:'trade',op:'cancel'}));await B.evaluate(()=>{try{NET7.send({t:'trade',op:'cancel'})}catch(_){}});await B.waitForTimeout(400);
 await B.evaluate(()=>SOC6.cmd('/block annsafe'));await B.waitForTimeout(300);ok('blocking hides them from your chat',await B.evaluate(()=>X6.mute.includes('annsafe')));await B.waitForTimeout(25000/1000);
 await A.waitForTimeout(300);const after=await ask();ok('blocking stops their trade requests',!after.got,after);
 await B.evaluate(()=>SOC6.cmd('/unblock annsafe'));await B.waitForTimeout(300);ok('and it can be undone',await B.evaluate(()=>!X6.mute.includes('annsafe')));
 ok('no page errors online',errs.length==0,errs.slice(0,3));await A.context().close();await B.context().close();await S.close();
 // ---- gameplay fixes, offline
 const p=await b.newPage({viewport:{width:1280,height:720}});const er2=[];p.on('pageerror',e=>er2.push(e.message.slice(0,200)));await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});await p.goto('file:///'+path.resolve(__dirname,'..','index.html').split(path.sep).join('/'));await p.waitForTimeout(900);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(400);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}enterWorld('safetest')});await p.waitForTimeout(1500);
 const E=(f,a)=>p.evaluate(f,a);
 const rc=await E(()=>{const sell=k=>{try{return sellP(k)}catch(_){return 0}};const bad=[];for(const r of RECIPES){const made=sell(r.out[0])*r.out[1],cost=r.in.reduce((s,q)=>s+sell(q[0])*q[1],0);if(['worm','glowbait','goldbait','petfood','fishfood','pettreat','key2','shard2','shard3'].includes(r.id)&&made>cost)bad.push([r.id,made,cost])}return{bad,n:RECIPES.length,noUse:[201,203,205,206,249,283,284,212,215,218,221,224,227].filter(k=>!RECIPES.some(r=>r.in.some(i=>i[0]==k)))}});
 ok('the new recipes never beat selling the parts',rc.bad.length==0,rc.bad);ok('monster parts, shards, crops and junk now have a use',rc.noUse.length==0,rc.noUse);
 const ds=await E(()=>({slime:INV7.descOf(201),tribute:INV7.descOf(265),isT:isTribute(265),notT:isTribute(201)}));ok('materials say what they craft',/Worm Bait/.test(ds.slime),ds.slime);ok('and warn when Mythics need them',/Mythic/.test(ds.tribute)&&ds.isT&&!ds.notT,ds);
 const lab=await E(()=>typeof BOSSX!='undefined'&&!!BOSSX.BIG);ok('boss attacks know which are the big ones',lab);
 ok('no page errors',er2.length==0,er2.slice(0,3));await b.close();console.log(fails?'FAILURES '+fails:'all safety tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('ERR',String(e&&e.stack||e).slice(0,500));process.exit(1)});
