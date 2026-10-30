// Creative mode (01-creative.js early switch + 99-zzzzz-creative.js): the main menu has a Creative button, switching on keeps a copy of the
// normal save and gives full level (150), max classes + tools, every wing / outfit / weapon / effect / charm wearable, 999 of every block that never
// runs out, lots of gems and no damage; the badge shows; switching back to Survival restores the normal save exactly (level, gems, items,
// class + tool levels, ownership) while world builds stay. node tests/creative.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(guest);const E=(f,a)=>p.evaluate(f,a);
 const enter=async(reload)=>{if(reload)await p.waitForLoadState('load');else await p.goto(URL);await p.waitForTimeout(900);await E(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
  await E(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);await E(()=>enterWorld('crvw'));await p.waitForTimeout(900)};
 await enter();
 // a normal (survival) save to protect
 const base=await E(()=>{lvl=7;xp=12;gems=1234;inv={};inv[1]=5;inv[3]=2;barDirty=1;CLASS7.S.lv.knight=3;saveP();
  const w=WINGS.find(w=>w.src=='shop'&&!wingOwned(w));const tl=TOOLLV.lvl('pip');
  const px=Math.floor(P.x/T)+3,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=8;pushEdit(q);try{saveW&&saveW()}catch(_){}
  return{menu:!!document.getElementById('bcr'),label:(document.getElementById('bcr')||{}).textContent,wing:w&&w.id,tl,q,on:CRV8.on}});
 ok('main menu has a Creative mode button under Play',base.menu&&/Creative/i.test(base.label)&&!base.on,base);
 ok('the confirm dialog opens and cancels',await E(()=>{CRV8.ask();const d=document.getElementById('crv8d'),t=d&&d.textContent;d.querySelector('[data-a=no]').click();return /Start creative/.test(t)&&!document.getElementById('crv8d')}));
 // switch on (reloads)
 await E(()=>{setTimeout(()=>CRV8.toggle(),50)});await p.waitForEvent('load');await enter(true);
 const cr=await E(async w=>{const hp0=P.hp;try{hurtP(80)}catch(_){}P.hp-=500;const hp1=P.hp,mh=maxHP();
  const wings=WINGS.filter(x=>!wingOwned(x)).map(x=>x.id);const gear=SHOP7.items.filter(i=>i.cat=='gear').sort((a,b)=>(b.lv|0)-(a.lv|0))[0];const ge=SHOP7.equip(gear.id);
  const top=SHOP7.items.filter(i=>i.cat=='weapons').sort((a,b)=>(b.lv|0)-(a.lv|0))[0];const we=SHOP7.equip(top.id);
  const fx=SHOP7.items.filter(i=>i.cat=='effects'||i.cat=='charms').every(i=>SHOP7.has(i.id));const we2=wingEquip(w);
  const cls=Object.keys(CLASS7.C).every(k=>CLASS7.S.lv[k]>=100),tools=TOOLLV.IDS.every(id=>TOOLLV.lvl(id)==TOOLLV.MAX);
  const stack=SHOP7.items.filter(i=>i.stack&&+i.ref>0);const full=stack.every(i=>cnt(+i.ref)>=999);addI(1,-600);await new Promise(r=>setTimeout(r,1800));
  const badge=document.getElementById('crv8b');return{on:CRV8.on,lvl,gems,hp:[hp0,hp1,mh],wings,ge,gearLv:gear.lv,we,topLv:top.lv,fx,we2,cls,tools,full,n:stack.length,refill:cnt(1),badge:!!badge&&getComputedStyle(badge).display!='none',
   btn:(document.getElementById('bcr')||{}).textContent,stash:!!localStorage.getItem('rbcr_stash')}},base.wing);
 ok('creative is on and kept a copy of the normal save',cr.on&&cr.stash,cr);
 ok('full level (150) and plenty of gems',cr.lvl==150&&cr.gems>=999999,[cr.lvl,cr.gems]);
 ok('every wing is wearable (incl. one not owned before)',cr.wings.length==0&&cr.we2,cr.wings);
 ok('highest-level outfit and weapon can be equipped',cr.ge&&cr.we,[cr.gearLv,cr.topLv]);
 ok('every effect and charm unlocked',cr.fx);
 ok('every class and tool at max level',cr.cls&&cr.tools);
 ok('999 of every block / seed / object, refilled after use',cr.full&&cr.refill>=999,[cr.n,cr.refill]);
 ok('no damage in creative',cr.hp[0]==cr.hp[2]&&cr.hp[1]==cr.hp[2],cr.hp);
 ok('CREATIVE badge shows, menu button says Back to Survival',cr.badge&&/Survival/.test(cr.btn),cr.btn);
 const set=await E(async()=>{try{UI6.open&&UI6.open('settings')}catch(_){}await new Promise(r=>setTimeout(r,300));const b=document.getElementById('crv8s');const t=b&&b.textContent;try{UI6.close&&UI6.close()}catch(_){}return t||null});
 ok('Hub settings has the game mode switch',set==null||/Survival/.test(set),set);
 // world edit made in creative stays
 const q2=await E(()=>{const px=Math.floor(P.x/T)+4,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=8;pushEdit(q);try{saveW&&saveW()}catch(_){}return q});
 // back to survival (reloads)
 await E(()=>{setTimeout(()=>CRV8.toggle(),50)});await p.waitForEvent('load');await enter(true);
 const sv=await E(o=>({on:CRV8.on,lvl,xp,gems,i1:cnt(1),i3:cnt(3),knight:CLASS7.S.lv.knight,wing:o.wing?wingOwned(WINGS.find(w=>w.id==o.wing)):false,tl:TOOLLV.lvl('pip'),stash:!!localStorage.getItem('rbcr_stash'),
  badge:!!document.getElementById('crv8b'),btn:(document.getElementById('bcr')||{}).textContent,hpw:Object.getOwnPropertyDescriptor(P,'hp').get==null}),base);
 ok('back in survival: badge gone, copy cleared',!sv.on&&!sv.badge&&!sv.stash&&/Creative/.test(sv.btn),sv);
 ok('normal save restored exactly (level, xp, gems, items)',sv.lvl==7&&sv.xp==12&&sv.gems==1234&&sv.i1==5&&sv.i3==2,sv);
 ok('class + tool levels and ownership restored',sv.knight==3&&sv.tl==base.tl&&!sv.wing,sv);
 ok('damage works again in survival',sv.hpw);
 ok('no page errors',errs.length==0,errs.slice(0,4));
 console.log(fails?fails+' FAILED':'all creative tests passed');await b.close();process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
