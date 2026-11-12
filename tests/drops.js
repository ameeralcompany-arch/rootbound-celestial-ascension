// Dropping items as real objects, offline (the online rules are in tests/online-server.js and tests/online.js), and the wrench and tool introductions.
// What can and can not be dropped, the object lands on the ground without clipping, E picks it up, nothing duplicates, it survives a restart, it comes back after 15 minutes.
// The wrench: its panel and three modes do real things, R and Esc work. Each tool introduces itself once. Run: node tests/drops.js   (SHOTS=<dir> saves screenshots)
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},230000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:20,3:40,208:6,17:1,735:1},gems:1000,own:{fist:1,astralkat:1,sakurakat:1,titanmaul:1,ember:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:40,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 const boot=async()=>{await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1500);await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('droptest')});await sleep(2200)};
 await p.goto(FILE,{waitUntil:'commit'});await boot();
 // the rules
 const r=await p.evaluate(()=>{const w=Object.keys(WEAR)[0];ownW[w]=1;wUp.titanmaul=2;wp='sakurakat';const o={};for(const[n,k]of[['block',1],['lock',17],['quest',735],['starter','w:pip'],['wrench','w:wrench'],['upgraded','w:titanmaul'],['held','w:sakurakat'],['free','w:astralkat'],['wear','a:'+w]])o[n]=DROP2.can(k);wear[WEAR[w].s]=w;o.worn=DROP2.can('a:'+w);wear[WEAR[w].s]='';wp='fist';const lw=WINGS.find(x=>x.src=='level');o.levelwing=DROP2.can('wing:'+lw.id);return o});
 ok('what you may give up can be dropped',r.block.ok&&r.free.ok&&r.wear.ok,r);ok('the World Lock and quest items stay with you',!r.lock.ok&&!r.quest.ok);ok('starter tools and the wrench stay with you',!r.starter.ok&&!r.wrench.ok);ok('upgraded weapons stay with you',!r.upgraded.ok);ok('what you hold or wear must be put away first',!r.held.ok&&!r.worn.ok);ok('wings earned by level stay with you',!r.levelwing.ok);
 // drop a weapon
 await p.evaluate(()=>{const s=HOTBAR.N-1;HOTBAR.set(s,'w:astralkat')});const d1=await p.evaluate(()=>{const ok=DROP2.drop('w:astralkat',1);return{ok,own:!!own.astralkat,n:DROP2.local.length,hb:HOTBAR.slotOf('w:astralkat')}});
 ok('dropping removes it from you and from the hotbar, and creates one object',d1.ok&&!d1.own&&d1.n==1&&d1.hb==-1,d1);
 const again=await p.evaluate(()=>DROP2.drop('w:astralkat',1));ok('dropping it twice does nothing the second time',!again&&await p.evaluate(()=>DROP2.local.length==1));
 await sleep(1500);const f=await p.evaluate(()=>{const d=DROP2.local[0],tx=Math.floor(d.x/T);return{rest:d.rest,inside:solidAt(tx,Math.floor(d.y/T)),below:solidAt(tx,Math.floor((d.y+12)/T)),near:!!DROP2.nearest()}});ok('it lands on the ground, not inside it',f.rest&&!f.inside&&f.below,f);ok('standing near it, E is offered',f.near);if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'drop.png')})}
 // restart: still there, and not back in your bag
 await sleep(5500);await p.reload({waitUntil:'commit'});await boot();ok('after a restart it is still on the ground and you still do not have it',await p.evaluate(()=>DROP2.local.length==1&&!own.astralkat));
 // E picks up
 await p.evaluate(()=>{const d=DROP2.local[0];P.x=d.x;P.y=d.y-30;P.vx=P.vy=0});await sleep(1300);await p.keyboard.press('f');await sleep(400);ok('E picks it up, once',await p.evaluate(()=>!!own.astralkat&&DROP2.local.length==0));
 // stacks
 const s=await p.evaluate(()=>{const n=cnt(208);DROP2.drop(208,4);return{n,after:cnt(208),ld:DROP2.local.length,sum:cnt(208)+DROP2.local[0].n}});ok('a stack drops the amount asked, and the total never changes',s.after==s.n-4&&s.sum==s.n,s);
 // it comes home after 15 minutes
 await p.evaluate(()=>{DROP2.local[0].t0=Date.now()-16*60000});await sleep(5600);ok('after 15 minutes it comes back to you',await p.evaluate(()=>DROP2.local.length==0&&cnt(208)==6));
 // valuable items ask first
 const dlg=await p.evaluate(async()=>{const q=DROP2.ask('w:astralkat');await new Promise(r=>setTimeout(r,300));const open=DLG7.isOpen;document.querySelector('#dlg7 [data-cancel]').click();await q;return{open,own:!!own.astralkat,n:DROP2.local.length}});ok('gear asks before it leaves you, and cancelling keeps it',dlg.open&&dlg.own&&dlg.n==0,dlg);
 // inventory panel
 const ui=await p.evaluate(async()=>{NAV16.act('inventory');await new Promise(r=>setTimeout(r,500));INV7.filter='weapons';INV7.render();INV7.select('w:astralkat');await new Promise(r=>setTimeout(r,80));const a=document.querySelector('#inv7 aside [data-a=drop]');const x={on:a&&!a.disabled};INV7.select('w:pip');const t=document.querySelector('#inv7 aside [data-a=drop]');x.pipOff=t&&t.disabled;x.why=t&&t.title;NAV16.closeAll();return x});ok('the Drop button is there when you can, greyed with the reason when you can not',ui.on&&ui.pipOff&&/Starter/.test(ui.why),ui);await sleep(400);
 // wrench and tool introduction
 await p.evaluate(()=>{TOOLI1.reset()});await p.keyboard.press('n');await sleep(900);
 const w1=await p.evaluate(()=>({wp,panel:document.getElementById('wr2').classList.contains('on'),mode:WRENCH2.mode,intro:(document.querySelector('#tooli1 h4')||{}).textContent}));ok('V holds the wrench and opens its panel',w1.wp=='wrench'&&w1.panel&&w1.mode=='inspect',w1);ok('the tool introduces itself',w1.intro=='The Wrench',w1.intro);if(SHOTS)await p.screenshot({path:path.join(SHOTS,'wrench.png')});
 await p.evaluate(()=>document.querySelector('#tooli1 button').click());await sleep(350);ok('once dismissed it does not come back',await p.evaluate(async()=>{wp='fist';await new Promise(r=>setTimeout(r,700));wp='wrench';await new Promise(r=>setTimeout(r,800));return !document.getElementById('tooli1')}));
 const ins=await p.evaluate(async()=>{const tx=Math.floor(P.x/T),ty=Math.floor((P.y+P.h+4)/T);mx=tx*T+T/2-cam.x;my=ty*T+T/2-cam.y;await new Promise(r=>setTimeout(r,200));const t=WRENCH2.target();WRENCH2.use({x:mx+cam.x,y:my+cam.y});await new Promise(r=>setTimeout(r,60));return{ok:t.ok,kind:t.kind,info:WRENCH2.info&&WRENCH2.info.h,name:BLK[tiles[ty*W+tx]][0],txt:document.querySelector('#wr2 .wr-t').textContent}});ok('Inspect names the block under the mouse',ins.ok&&ins.kind=='tile'&&ins.info==ins.name,ins);
 await p.keyboard.press('r');await sleep(150);const cf=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,200));const t=WRENCH2.target();return{mode:WRENCH2.mode,ok:t.ok,msg:t.msg,txt:document.querySelector('#wr2 .wr-t').textContent,ok2:document.querySelector('#wr2 .wr-t').classList.contains('ok')}});ok('R changes mode; Configure says a plain block can not be set up',cf.mode=='config'&&!cf.ok&&!cf.ok2&&/door|chest/i.test(cf.txt),cf);
 await p.keyboard.press('r');await sleep(200);ok('People explains it needs a server when you are offline',await p.evaluate(()=>WRENCH2.mode=='people'&&/server/.test(WRENCH2.target().msg)));
 await p.keyboard.press('Escape');await sleep(300);ok('Esc puts the wrench away',await p.evaluate(()=>wp!='wrench'&&!document.getElementById('wr2').classList.contains('on')));
 ok('every tool has a full introduction',await p.evaluate(()=>['pip','pebble','glimmer','twiggy','bubbles','wrench'].every(i=>{const q=TOOLI1.T1[i];return q.what&&q.how&&q.why&&q.spec&&q.keys})));
 ok('no page errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,600));process.exit(1)});
