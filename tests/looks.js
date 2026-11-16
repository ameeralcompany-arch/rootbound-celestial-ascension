// Exclusive looks (master update 2): no cosmetic is sold; each is earned by a progress goal (LOOKS1 claims it); what a player already bought stays theirs.
//   node tests/looks.js
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');const CAT=require('../server/catalog.json');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},150000).unref();
// ---- the catalog
{const it=CAT.items||CAT,looks=it.filter(i=>['wings','effects','charms','cosmetics'].includes(i.cat)||(i.cat=='pets'&&!['pet_home','pet_food','pet_treat'].includes(i.id))||(i.cat=='weather'&&i.id!='obj_88'));
 ok('no look is sold: wings, effects, companions, cosmetics, pets and sky weather are all earned or found',looks.length>=130&&looks.every(i=>i.sale===0&&(i.how==='drop'||(i.earn&&i.earn.m&&i.earn.n>0&&i.earn.t))),looks.filter(i=>i.sale!==0).map(i=>i.id).slice(0,5));
 const kept=it.filter(i=>i.sale!==0);ok('the store keeps what is useful: blocks, seeds, objects, pet care and Neon Rain',kept.every(i=>['blocks','seeds','objects'].includes(i.cat)||['pet_home','pet_food','pet_treat','obj_88'].includes(i.id))&&kept.some(i=>i.id=='obj_88'),kept.filter(i=>!['blocks','seeds','objects'].includes(i.cat)).map(i=>i.id));
 const doc=fs.readFileSync(path.join(__dirname,'../docs/master-update-2/cosmetic-sources.md'),'utf8');ok('every look and its source is written down',looks.every(i=>doc.includes('| '+i.n+' |')),looks.filter(i=>!doc.includes('| '+i.n+' |')).map(i=>i.n).slice(0,4))}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('rbp',JSON.stringify({v:1,inv:{1:5},gems:100,own:{fist:1},wp:'fist',bar:[1],done:{},lvl:12,made:true,stats:{place:150}}));localStorage.setItem('rbg_seen','1');
  // a wing and an effect bought before this update
  localStorage.setItem('rbc3',JSON.stringify({own:{wing_dragon:1,fx_aura_void:1},eq:{},seen:{},pend:0}))}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready&&window.LOOKS1,null,{timeout:90000});
 const E=(f,a)=>p.evaluate(f,a);await E(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await p.waitForTimeout(4200);
 const own=await E(()=>({dragon:SHOP7.has('wing_dragon'),aura:SHOP7.has('fx_aura_void'),card:LOOKS1.lastCard,bow:SHOP7.has('cos_ribbon_bow')}));
 ok('looks bought before stay yours, with no new "earned" card for them',own.dragon&&own.aura&&own.card!=='wing_dragon'&&own.card!=='fx_aura_void',own);
 ok('short of a goal (Place 200 blocks, at 150) the bow is not earned',!own.bow,own);
 await E(()=>{stats.place=205});await p.waitForFunction(()=>SHOP7.has('cos_ribbon_bow'),null,{timeout:8000}).catch(()=>{});
 const got=await E(()=>({bow:SHOP7.has('cos_ribbon_bow'),batch:LOOKS1.lastBatch,cards:[...document.querySelectorAll('#rw8 .rw8c[data-kind=look]')].map(c=>c.textContent)}));
 ok('reaching the goal earns it at once, with an "Earned · exclusive" card naming it and its goal',got.bow&&got.batch.includes('cos_ribbon_bow')&&got.cards.some(t=>/Earned/.test(t)&&/Big Ribbon/.test(t)&&/Place 200 blocks/.test(t)),got);
 const many=await E(async()=>{document.querySelectorAll('#rw8 .rw8c').forEach(c=>c.remove());await new Promise(r=>setTimeout(r,50));LOOKS1.announce(LOOKS1.earnable().slice(0,5));await new Promise(r=>setTimeout(r,250));return[...document.querySelectorAll('#rw8 .rw8c[data-kind=look]')].map(c=>c.textContent)});
 ok('many earned at once (a returning player) share one card instead of flooding the screen',many.length==1&&/5 exclusive looks/.test(many[0]),many);
 const ui=await E(async()=>{const o={};COL1.open();await new Promise(r=>setTimeout(r,300));const it=SHOP7.items.find(i=>i.cat=='cosmetics'&&i.earn&&i.earn.m&&!SHOP7.has(i.id));COL1.select&&COL1.select(it.id);await new Promise(r=>setTimeout(r,200));o.col=(document.getElementById('col1')||{textContent:''}).textContent;o.goal=it.earn.t;o.store=/See it in the store|Store · /.test(o.col);COL1.close();
  const w=SHOP7.items.find(i=>i.cat=='wings'&&!SHOP7.has(i.id));o.wingGoal=w.earn.t;return o});
 ok('the Collection says how a look is earned, never "store"',ui.col.includes('Earned')&&!ui.store,{goal:ui.goal,store:ui.store});
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
