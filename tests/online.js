// The online game end to end: a real server and real headless browsers. Owner /god and the other chat commands, no creative menu for anyone, the same terrain
// for everyone, wrench to trade, the trade window, the Drop button, hide other players' effects, the realm picker, worlds you own. node tests/online.js
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbonlb-'));const PW='owner-password-1';
const S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,wxCooldownMs:0,maxConnsPerIp:200,ownerName:'Boss',ownerPass:PW,client:path.join(__dirname,'..','index.html')});
const errs=[];
async function client(b,url,tag){const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));
 await p.goto(url);await p.waitForTimeout(800);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(400);await p.evaluate(()=>{try{SHOW7.close()}catch(_){}});
 await p.waitForFunction(()=>NET7.online,null,{timeout:15000});return p}
const ev=(p,f,a)=>p.evaluate(f,a);
const signup=async(p,name,pass)=>{await ev(p,([n,w])=>NET7.send({t:'register',name:n,pass:w}),[name,pass||name+'-password']);await p.waitForFunction(n=>typeof NET7!='undefined'&&NET7.auth&&NET7.auth.name==n,name,{timeout:15000});await p.waitForFunction(()=>typeof RB_ACCT!='undefined'&&!!RB_ACCT.id&&NET7.online&&NET7.auth&&NET7.auth.uid==RB_ACCT.id,null,{timeout:15000});await p.waitForTimeout(400);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});await p.waitForTimeout(300)};
const go=async(p,w,c)=>{await ev(p,([w,c])=>NET7.go(w,c),[w,c]);await p.waitForFunction(w=>NET7.world==w&&cur==w,w,{timeout:8000}).catch(()=>{});await p.waitForTimeout(300)};
const cmd=(p,t)=>ev(p,t=>SOC6.cmd(t),t);
const hash=p=>ev(p,()=>{let h=0;for(let i=0;i<tiles.length;i++)h=(h*31+tiles[i])|0;return h});
(async()=>{const port=await S.listen(),url='http://127.0.0.1:'+port+'/';const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 try{
  const O=await client(b,url,'Owner'),A=await client(b,url,'Ann'),B=await client(b,url,'Bea');
  ok('the page served by the server goes online by itself',await ev(A,()=>NET7.online));
  ok('no creative button in the main menu for anyone',await ev(A,()=>!document.getElementById('bcr')&&!CRV8.on));
  await ev(A,()=>{UI6.open&&UI6.open('settings')});await sleep(300);ok('no game-mode switch in Settings',await ev(A,()=>!document.getElementById('crv8s')));await ev(A,()=>{try{UI6.close&&UI6.close()}catch(_){}});
  await signup(A,'annie');await signup(B,'beatrix');await ev(O,p=>NET7.send({t:'login',name:'Boss',pass:p}),PW);await O.waitForFunction(()=>typeof RB_ACCT!='undefined'&&RB_ACCT.id&&NET7.owner,null,{timeout:8000});
  // ---- worlds: same terrain for everyone, owned
  await go(A,'annland',true);await go(B,'annland');await go(O,'annland');await sleep(500);await ev(A,()=>(()=>{const x=(P.x/T|0)+3;let y=0;for(let yy=0;yy<H;yy++)if(tiles[yy*W+x]){y=yy-1;break}const k=y*W+x;tiles[k]=17;hp[k]=99;setMeta({x,y,o:myId,on:(NET7.auth&&NET7.auth.name)||myName,f:[],pub:0});pushEdit(k)})());await sleep(500);
  ok('whoever locks it owns it, and the client knows',await ev(A,()=>canEdit()&&RB_OWN.on=='annie'));
  ok('a visitor cannot edit an owned world, and is told why',await ev(B,()=>!canEdit()&&/annie/.test(lockMsg())));
  const K=await ev(A,()=>{const x=(P.x/T|0)+6;let y=0;for(let yy=0;yy<H;yy++)if(tiles[yy*W+x]){y=yy-1;break}return y*W+x});await ev(A,k=>{tiles[k]=3;pushEdit(k)},K);await sleep(700);
  ok('a block placed by the owner reaches everyone',await ev(B,k=>tiles[k]==3,K)&&await ev(O,k=>tiles[k]==3,K));
  const L=await client(b,url,'Late');await signup(L,'latecomer');await go(L,'annland');await sleep(400);
  const hs=[await hash(A),await hash(B),await hash(L)];ok('every client has identical terrain, also someone who joins after edits exist',hs[0]==hs[1]&&hs[1]==hs[2],hs);
  ok('the late joiner uses the generator the world was made with',await ev(L,()=>VILL9.gv)==await ev(A,()=>VILL9.gv));
  // ---- the world menu: realms and owned worlds
  await ev(A,()=>{openMenu('mworlds')});await sleep(300);
  const rows=await ev(A,()=>[...document.querySelectorAll('#wrealm .rl10')].map(e=>({n:e.dataset.rl,lock:e.classList.contains('lock10'),t:e.querySelector('b').textContent,why:e.dataset.why})));
  ok('the picker lists the base world and the four realms in order',rows.length==5&&rows.map(r=>r.t).join()=='Base world,Inferno,Galaxy,Abyssal Sea,Crystal Realm',rows.map(r=>r.t));
  ok('unopened realms show as locked, the base world as open',!rows[0].lock&&rows.slice(1).every(r=>r.lock),rows);
  ok('the world you own is listed with the limit of 5',await ev(A,()=>/Worlds you own \(1 of 5\)/.test($('wmine').textContent)&&!!document.querySelector('#wmine [data-mw=annland]')));
  await ev(A,()=>document.querySelector('#wrealm [data-rl=annland-inf]').click());await sleep(300);ok('clicking a locked realm does not travel',await ev(A,()=>cur)=='annland');
  await ev(A,()=>{lvl=20;WORD9.state.w.annland={got:[0,1,2],ok:1,tr:0};renderWorlds()});await sleep(200);
  const r1=await ev(A,()=>{const e=document.querySelector('#wrealm [data-rl=annland-inf]'),g=document.querySelector('#wrealm [data-rl=annland-gal]');return[e.classList.contains('lock10'),g.classList.contains('lock10'),g.dataset.why]});ok('solving the world\'s word opens the Inferno, the next stays locked',!r1[0]&&r1[1],r1);
  await ev(A,()=>document.querySelector('#wrealm [data-rl=annland-inf]').click());await A.waitForFunction(()=>NET7.world=='annland-inf',null,{timeout:8000}).catch(()=>{});await sleep(400);
  ok('entering an opened realm uses a shared server world owned by the base owner',await ev(A,()=>NET7.world=='annland-inf'&&cur=='annland-inf'&&RB_OWN.on=='annie')&&!!S.worlds.get('annland-inf'));
  ok('the realm does not use up one of your 5 worlds',await ev(A,()=>ONL10.mine.list.length)==1);
  await ev(A,()=>{openMenu('mworlds')});await sleep(150);const lowLv=await ev(A,()=>{lvl=2;WORD9.state.w['annland-inf']={got:[],ok:1,tr:0};renderWorlds();const g=document.querySelector('#wrealm [data-rl=annland-gal]');return[g.classList.contains('lock10'),g.dataset.why]});ok('an opened realm above your level is still locked and says why',lowLv[0]&&/level 25/.test(lowLv[1]),lowLv);
  await ev(A,()=>{lvl=20;menuEl.style.display='none'});await go(A,'annland');
  // ---- owner commands from chat
  ok('a normal player cannot use /god',await (async()=>{await cmd(A,'/god');await sleep(500);return !(await ev(A,()=>CRV8.on))})());
  await ev(A,()=>{localStorage.setItem('rb_cr_go','on');localStorage.setItem('rbcr','1');});
  const before=await ev(O,()=>{lvl=7;xp=12;gems=1234;inv={};inv[1]=5;saveP();return lvl});
  await cmd(O,'/god');await O.waitForFunction(()=>CRV8.on,null,{timeout:6000}).catch(()=>{});
  const gd=await ev(O,async()=>{const hp0=P.hp;hurtP(80);P.hp-=500;const out={on:CRV8.on,flag:RB_CREATIVE,lvl,gems,hp:P.hp==maxHP(),wings:WINGS.filter(x=>!wingOwned(x)).length,stack:SHOP7.items.filter(i=>i.stack&&+i.ref>0).every(i=>cnt(+i.ref)>=999),cls:Object.keys(CLASS7.C).every(k=>CLASS7.S.lv[k]>=CLASS7.MAX),tools:TOOLLV.IDS.every(id=>TOOLLV.lvl(id)==TOOLLV.MAX),badge:!!document.getElementById('crv8b')};return out});
  ok('/god gives the owner everything creative did',gd.on&&gd.flag&&gd.lvl==150&&gd.gems>=999999&&gd.hp&&gd.wings==0&&gd.stack&&gd.cls&&gd.tools&&gd.badge,gd);
  ok('in god mode the owner can build anywhere',await ev(O,()=>canEdit()));
  await ev(O,()=>{P.x=3000;P.y=600;NET7.room.presence({x:3000,y:600,f:1,n:'Boss'})});await sleep(400);await cmd(O,'/pull beatrix');await sleep(500);ok('/pull brings a player to you',await ev(B,()=>P.x)==3000,await ev(B,()=>P.x));
  await go(B,'plaza');await cmd(O,'/summon beatrix');await B.waitForFunction(()=>NET7.world=='annland',null,{timeout:8000}).catch(()=>{});await sleep(400);ok('/summon brings a player from another world',await ev(B,()=>NET7.world=='annland'&&cur=='annland'&&P.x==3000),await ev(B,()=>[NET7.world,cur,P.x]));
  const b0=await ev(B,()=>cnt(5));await cmd(O,'/give beatrix wood 30');await sleep(500);ok('/give puts items in the player\'s inventory',await ev(B,()=>cnt(5))==b0+30,await ev(B,()=>cnt(5)));
  await cmd(O,'/give beatrix gems 400');await sleep(500);ok('/give gems works',await ev(B,()=>gems)>=400,await ev(B,()=>gems));
  await ev(O,()=>{P.x=200;P.vx=P.vy=0});await sleep(800);
  await ev(A,()=>{inv[6]=25;barDirty=1;ONL10.report(true)});await sleep(300);
  // ---- wrench -> player card -> trade window
  await ev(A,()=>{try{menuEl.style.display='none'}catch(_){}});await A.keyboard.press('v');await sleep(250);ok('V puts the wrench in your hand, and it draws without errors',await ev(A,()=>wp=='wrench'));
  const wr=await ev(A,()=>{const peer=SOC6.peers().find(p=>p.presence.n=='beatrix');const r=rp[peer.peer];mx=r.x-cam.x;my=r.y+20-cam.y;wcd=0;useWeapon();const c=document.getElementById('pcard10');return{open:c&&c.style.display=='block',txt:c&&c.textContent,trade:!!c.querySelector('[data-pc=trade]'),own:!!c.querySelector('[data-pc=ban]')}});
  ok('wrenching a player opens their card with Trade',wr.open&&/beatrix/.test(wr.txt)&&wr.trade&&!wr.own,wr);
  ok('the wrench is a real tool you can hold',await ev(A,()=>WPN.wrench.k=='tool'&&own.wrench&&wp=='wrench'));
  await ev(A,()=>document.querySelector('#pcard10 [data-pc=trade]').click());await B.waitForFunction(()=>ONL10.trade&&ONL10.trade.st=='ask',null,{timeout:5000}).catch(()=>{});ok('the other player is asked',await ev(B,()=>/annie/.test(document.getElementById('trade10').textContent)));
  await ev(B,()=>document.querySelector('#trade10 [data-tr=accept]').click());await A.waitForFunction(()=>ONL10.trade&&ONL10.trade.st=='on',null,{timeout:5000}).catch(()=>{});await sleep(150);
  const inv0=await ev(A,()=>[cnt(6),cnt(5)]),inv1=await ev(B,()=>[cnt(6),cnt(5)]);
  await ev(A,()=>TRADE2.add(6,10));await sleep(300);
  await ev(B,()=>TRADE2.add(5,8));await sleep(300);
  ok('both offers show in two equal boxes',await ev(A,()=>{const a=document.querySelectorAll('#trade10 .tr-box.me .tr-t').length,b=document.querySelectorAll('#trade10 .tr-box.them .tr-t').length,s=document.querySelectorAll('#trade10 .tr-box.me .tr-g>*').length==document.querySelectorAll('#trade10 .tr-box.them .tr-g>*').length;return a==1&&b==1&&s&&/10/.test(document.querySelector('#trade10 .tr-box.me').textContent)&&/8/.test(document.querySelector('#trade10 .tr-box.them').textContent)}));
  if(process.env.SHOTS)await A.screenshot({path:process.env.SHOTS+'/trade1.png'});ok('confirm does not exist until both are ready',await ev(A,()=>!document.querySelector('#trade10 [data-tr=confirm]')));
  await ev(A,()=>document.querySelector('#trade10 [data-tr=lock]').click());await sleep(200);await ev(B,()=>document.querySelector('#trade10 [data-tr=lock]').click());await sleep(250);
  if(process.env.SHOTS)await A.screenshot({path:process.env.SHOTS+'/trade2.png'});await ev(A,()=>document.querySelector('#trade10 [data-tr=confirm]').click());await sleep(200);ok('nothing moves on one confirmation',await ev(A,()=>cnt(6))==inv0[0]);
  await ev(B,()=>document.querySelector('#trade10 [data-tr=confirm]').click());await sleep(500);
  const af=await ev(A,()=>[cnt(6),cnt(5)]),bf=await ev(B,()=>[cnt(6),cnt(5)]);ok('the trade moves exactly what was offered',af[0]==inv0[0]-10&&af[1]==inv0[1]+8&&bf[0]==inv1[0]+10&&bf[1]==inv1[1]-8,{inv0,inv1,af,bf});
  ok('the window closes for both',await ev(A,()=>!ONL10.trade&&document.getElementById('trade10').style.display=='none')&&await ev(B,()=>!ONL10.trade));
  await sleep(300);await cmd(A,'/trade beatrix 6 2 5 1');await B.waitForFunction(()=>ONL10.trade&&ONL10.trade.st=='ask',null,{timeout:5000}).catch(()=>{});ok('a typed /trade carries the terms',await ev(B,()=>ONL10.trade.give[1]==2&&ONL10.trade.want[1]==1&&/2 × /.test(document.getElementById('trade10').textContent)));await ev(B,()=>document.querySelector('#trade10 [data-tr=cancel]').click());await sleep(250);ok('declining changes nothing',await ev(A,()=>cnt(6))==af[0]&&await ev(A,()=>!ONL10.trade));
  // ---- the Drop button in the inventory
  await ev(A,()=>{P.x=2000;P.y=(sh(Math.floor(2000/T))*T)-P.h-2;P.vx=P.vy=0;NET7.room.presence({x:P.x,y:P.y,f:1,n:'annie'})});await ev(B,()=>{P.x=6000;NET7.room.presence({x:6000,y:P.y,f:1,n:'beatrix'})});await sleep(300);
  await ev(A,()=>{INV7.open('all');});await sleep(350);
  const drc=await ev(A,async()=>{INV7.render();const t=document.querySelector('#inv7 .it7[data-k="6"]');if(!t)return{t:0};t.click();await new Promise(r=>setTimeout(r,120));const btn=document.querySelector('#inv7 aside [data-a=drop]');if(!btn)return{btn:0};btn.click();return{ok:1}});ok('the inventory has a Drop button',drc.ok==1,drc);
  await sleep(250);await ev(A,()=>{const i=[...document.querySelectorAll('input')].filter(x=>x.offsetParent).pop();i.value='3';i.dispatchEvent(new Event('input',{bubbles:true}));const bs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&x.textContent=='Next'&&!x.closest('#inv7'));bs[0].click()});await sleep(500);
  const a5=await ev(A,()=>cnt(6));ok('dropping takes the items from your inventory',a5==af[0]-3,a5);await ev(A,()=>INV7.close&&INV7.close());
  ok('other players see the item on the ground',await ev(B,()=>ONL10.drops.some(d=>d.i==6&&d.n==3)),await ev(B,()=>ONL10.drops));
  const onGround=await ev(B,()=>ONL10.drops.find(d=>d.i==6));const c6=await ev(B,()=>cnt(6));await sleep(1200);await ev(B,d=>{P.x=d.x;P.y=d.y-30;P.vx=P.vy=0;NET7.room.presence({x:P.x|0,y:P.y|0,f:1,n:'beatrix'})},onGround);await B.waitForTimeout(1800);await B.keyboard.press('e');
  await B.waitForFunction(n=>cnt(6)>=n+3,c6,{timeout:6000}).catch(()=>{});ok('E beside it picks it up',await ev(B,()=>cnt(6))==c6+3,[c6,await ev(B,()=>cnt(6))]);ok('it is gone for everyone',await ev(A,()=>!ONL10.drops.some(d=>d.i==6)));
  // gear, between two real clients: the weapon leaves A only when the server says so, and arrives at B whole
  {const wid=await ev(A,()=>{const id=Object.keys(WPN).find(i=>WPN[i].cost>0&&!WPN[i].hid&&WPN[i].k!='tool'&&!own[i]);own[id]=1;wUp[id]=0;DROP2.sendGear(true);return id});await sleep(700);
   const had=await ev(B,w=>!!own[w],wid);await ev(A,w=>{DROP2.drop('w:'+w,1)},wid);await B.waitForFunction(w=>ONL10.drops.some(d=>d.i=='w:'+w),wid,{timeout:6000}).catch(()=>{});await sleep(400);ok('gear dropped by one player appears for the other, and is gone from its owner',await ev(A,w=>!own[w],wid)&&await ev(B,w=>ONL10.drops.some(d=>d.i=='w:'+w),wid));
   const gd=await ev(B,w=>ONL10.drops.find(d=>d.i=='w:'+w),wid);await sleep(1200);await ev(B,d=>{P.x=d.x;P.y=d.y-30;P.vx=P.vy=0;NET7.room.presence({x:P.x|0,y:P.y|0,f:1,n:'beatrix'})},gd);await B.waitForTimeout(1600);await B.keyboard.press('e');await B.waitForFunction(w=>!!own[w],wid,{timeout:6000}).catch(()=>{});ok('picking it up gives the weapon to the other player',!had&&await ev(B,w=>!!own[w],wid),wid);ok('and it stays gone from the first',await ev(A,w=>!own[w],wid))}
  // ---- hide other players' effects
  const fx=await ev(A,()=>{const q={x:1,y:2,n:'x',wing:'w',wo:.5,fm:1,cx:{a:3,w:2,t:1,fx:{au:'k',ch:'c',ws:'s'},ap:{hair:1}}};cel.opt.hideFx=0;const a=RBFXQ(q);cel.opt.hideFx=1;const b2=RBFXQ(q);return{same:a===q,a:b2.cx.a,w:b2.cx.w,wing:b2.wing,au:b2.cx.fx.au,ap:!!b2.cx.ap,x:b2.x,orig:q.cx.a}});ok('the setting removes auras, wings and effects from others only, not their look or position',fx.same&&fx.a==0&&fx.w==-1&&fx.wing==''&&fx.au==''&&fx.ap&&fx.x==1&&fx.orig==3,fx);
  const sp=await ev(A,()=>chatIn6({peer:'zz',data:{n:'x',t:'hi',e:0}}));ok('emotes still arrive as chat with the setting on',sp===true);
  await ev(A,()=>{UI6.open('settings')});await sleep(350);const row=await ev(A,()=>{const t=document.getElementById('shfx');return t?t.checked:null});ok('the setting is in Settings > Graphics and remembers it is on',row===true,row);await ev(A,()=>{try{UI6.close()}catch(_){}cel.opt.hideFx=0});await sleep(200);
  // ---- owner: off, ban
  await cmd(O,'/ban latecomer');await sleep(700);ok('/ban throws the player out',await ev(L,()=>!NET7.online));
  const nav=O.waitForEvent('load',{timeout:12000}).catch(()=>null);await cmd(O,'/god off');await nav;await sleep(1200);await O.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online,null,{timeout:15000}).catch(()=>{});await sleep(800);
  const back=await ev(O,()=>({on:CRV8.on,flag:RB_CREATIVE,lvl,gems,i1:cnt(1),stash:!!localStorage.getItem('rbcr_stash')}));ok('/god off restores the owner\'s real save after a reload',!back.on&&!back.flag&&back.lvl==7&&back.i1==5&&!back.stash,back);
  // ---- a stale creative save goes back to normal, for everyone
  const ctx=await b.newContext();const old=await ctx.newPage();await old.addInitScript(()=>{if(!localStorage.getItem('rb_seeded')){localStorage.setItem('rb_seeded','1');localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbcr','1');localStorage.setItem('rbcr_stash',JSON.stringify({rbp:'{}'}))}});await old.goto(url);await old.waitForTimeout(900);
  ok('a player still in old creative mode gets their normal save back at load',await ev(old,()=>!CRV8.on&&!RB_CREATIVE&&!localStorage.getItem('rbcr')&&!localStorage.getItem('rbcr_stash')));
  ok('no page errors in any client',errs.length==0,errs.slice(0,4).join(' | '));
 }catch(e){ok('online harness',false,String(e.stack||e).slice(0,600))}
 await b.close();try{await S.close()}catch(_){}
 console.log(fails?'FAILURES '+fails:'all online tests passed');process.exit(fails?1:0)})();
