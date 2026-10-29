// v8 wardrobe: new wearables (incl. the mythic Anonymous set + its aura), new charms/companions, and the Male/Female body type.
// node tests/gear.js  (CHROMIUM=/path/to/chromium if needed)
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const errs=[];
 const boot=async()=>{const p=await ctx.newPage();p.on('pageerror',x=>errs.push(x.message));
  await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
  await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
  await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);return p};
 const p=await boot();const E=(f,a)=>p.evaluate(f,a);
 await E(()=>{enterWorld('geartest')});await p.waitForTimeout(900);await E(()=>{try{WX6.force='clear'}catch(_){}mobs.length=0;lvl=60;gems=200000});
 // shared pixel helpers in the page
 await E(()=>{window.__px=(c)=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,h=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>20){n++;h=(h*31+d[i]*3+d[i+1]*5+d[i+2]*7+i)>>>0}return{n,h}};
  window.__char=(wr,opt)=>{opt=opt||{};const c=document.createElement('canvas');c.width=c.height=240;const x=c.getContext('2d'),og=g;g=x;try{x.scale(2,2);const cx=60,cy=40;cam.x=P.x-cx;cam.y=P.y-cy;for(const t of opt.ts||[.3,1.1])AC6.draw(cx,cy,1,0,'',t,opt.vx||0,false,'','fist',0,0,wr,false,look,opt.me?'me':null)}finally{g=og}return __px(c)};
  window.__portrait=(gear,ap)=>{const c=document.createElement('canvas');c.width=310;c.height=430;const x=c.getContext('2d');SHOWART.draw(x,310,430,{look:SHOWART.info(ap||sanAp(cel.ap)),t:1.2,wpn:'fist',wings:false,gear});return __px(c)}});
 // ---- every new wearable: catalog entry, buy, equip, icon, worn art in-game + portrait
 let r=await E(async()=>{const out={bad:[],n:0};for(const id of GEAR8.IDS){out.n++;const w=WEAR[id],it=SHOP7.byId.get('wear_'+id);if(!w||!it){out.bad.push('missing '+id);continue}
   if(it.price!=w.cost||it.sub!=w.s||it.lv!=w.lv||it.cat!='gear')out.bad.push('catalog '+id);delete ownW[id];const g0=gems;const res=await SHOP7.buy(it.id);if(!res.ok||g0-gems!=it.price)out.bad.push('buy '+id+' '+res.m);
   if(!SHOP7.equip(it.id)||wear[w.s]!=id)out.bad.push('equip '+id);
   const c=document.createElement('canvas');c.width=c.height=96;try{if(!GEAR7.icon(c.getContext('2d'),id,96))out.bad.push('icon '+id)}catch(e){out.bad.push('icon '+id+' '+e.message)}if(__px(c).n<400)out.bad.push('icon empty '+id);
   const u=iconURL('a:'+id);if(!u||u.length<500)out.bad.push('iconURL '+id);
   const base={hat:'',body:'',boot:'',glove:'',wing:''},wr=Object.assign({},base,{[w.s]:id});const a=__char(base),bb=__char(wr);if(bb.n<300||a.h==bb.h)out.bad.push('worn art '+id);
   if(w.s=='hat'||w.s=='body'){const p0=__portrait(base),p1=__portrait(wr);if(p1.n<1000||p0.h==p1.h)out.bad.push('portrait '+id)}
   if(!(w.d&&w.sd&&w.cd>0&&Object.keys(w.b).length))out.bad.push('stats '+id)}
  for(const k in wear)wear[k]='';return out});
 ok('12 new wearables: catalog, buy charges the price, equip, icon, worn art in-game and in the portrait',r.n>=12&&r.bad.length==0,r.bad.slice(0,8).join(', '));
 // ---- every slot gets something, several rarities
 r=await E(()=>{const s={},rr={};for(const id of GEAR8.IDS){s[WEAR[id].s]=1;rr[SHOP7.byId.get('wear_'+id).rar]=1}return{slots:Object.keys(s).sort().join(),rars:Object.keys(rr).length}});
 ok('new wearables cover hat/body/boot/glove across 4+ rarities',r.slots=='body,boot,glove,hat'&&r.rars>=4,r);
 // ---- the Anonymous set: mythic, the most expensive cosmetics, aura draws, skills
 r=await E(()=>{const m=SHOP7.byId.get('wear_anonmask'),s=SHOP7.byId.get('wear_anonsuit');const cos=SHOP7.items.filter(i=>i.cat!='weapons'&&!i.id.startsWith('wear_anon'));const top=Math.max(...cos.map(i=>i.price));
  return{rar:m.rar=='mythic'&&s.rar=='mythic',tier:SHOP7.RAR.indexOf('mythic')>SHOP7.RAR.indexOf('legendary'),most:s.price>top&&m.price>top,top,suit:s.price,mask:m.price,feat:m.feat&&s.feat,item7:ITEM7.rar('a:anonsuit')=='mythic'}});
 ok('Anonymous Mask + Cloak are mythic, mythic ranks above legendary, and they are the most expensive cosmetics in the store',r.rar&&r.tier&&r.most&&r.feat&&r.item7,r);
 r=await E(()=>{const base={hat:'',body:'',boot:'',glove:'',wing:''};const plain=__char(Object.assign({},base,{hat:'witchhat'})),one=__char(Object.assign({},base,{hat:'anonmask'})),full=__char(Object.assign({},base,{hat:'anonmask',body:'anonsuit'}));
  return{lvl:[GEAR8.level({hat:'anonmask'}),GEAR8.level({hat:'anonmask',body:'anonsuit'}),GEAR8.level({hat:'cap'})],plain:plain.n,one:one.n,full:full.n,sprites:!!GEAR8.sprites}});
 ok('dark aura: drawn around the character (more coverage with the full set), sprites pre-rendered once',r.lvl.join()=='1,2,0'&&r.one>r.plain*1.4&&r.full>=r.one*.95&&r.sprites,r);
 r=await E(()=>{const base={hat:'',body:'',boot:'',glove:'',wing:''};const a=__portrait(Object.assign({},base,{hat:'witchhat'})),bq=__portrait(Object.assign({},base,{hat:'anonmask',body:'anonsuit'}));return{a:a.n,b:bq.n}});
 ok('dark aura also wraps the large portrait',r.b>r.a*1.05,r);
 r=await E(()=>{const o={bad:[]};const k=Object.keys(MK)[0];for(const id of GEAR8.IDS){const sl=WEAR[id].s;for(const s in wear)wear[s]='';wear[sl]=id;cdT[sl]=0;
   const m={x:P.x+40,y:P.y,w:30,h:30,vx:0,vy:0,hp:99999,k};mobs.length=0;mobs.push(m);try{useSkill(sl)}catch(e){o.bad.push(id+' '+e.message)}if(!(cdT[sl]>0))o.bad.push('cd '+id);
   if(id=='anonsuit'){o.nova=99999-m.hp;o.heal=1}if(id=='anonmask')o.vanish=GEAR8.st.vanish>4&&brace>4;dash=0;mobs.length=0}
  for(const s in wear)wear[s]='';return o});
 ok('every new wearable skill fires (cooldown set); Legion of Shadows damages monsters; Vanish makes you untouchable',r.bad.length==0&&r.nova>=40&&r.vanish,r);
 // ---- charms: 3 companions + 3 effect charms
 r=await E(async()=>{const ids=['pip','gloop','cinder','runehalo','sakura','comet'],o={bad:[]};for(const c of ids){const it=SHOP7.byId.get('charm_'+c);if(!it){o.bad.push('missing '+c);continue}
   const res=await SHOP7.buy(it.id);if(!res.ok)o.bad.push('buy '+c);if(!SHOP7.equip(it.id)||SHOP7.eqRef('charm')!=c)o.bad.push('equip '+c);
   const cv=document.createElement('canvas');cv.width=cv.height=120;const x=cv.getContext('2d');x.translate(60,40);try{FX7.charmDraw(x,c,0,0,1.2,1)}catch(e){o.bad.push('draw '+c+' '+e.message)}if(__px(cv).n<60)o.bad.push('blank '+c);
   try{for(let i=0;i<5;i++)FX7.tick(.05);__char({},{me:1})}catch(e){o.bad.push('tick '+c+' '+e.message)}}
  o.comp=['pip','gloop','cinder'].every(c=>COMP7.IDS.includes(c));o.book=BOOK7.stats().find(s=>s.c=='charms').l.length;o.store=SHOP7.items.filter(i=>i.cat=='charms').length;o.cx=cleanCx({fx:{ch:'cinder'}}).fx.ch;return o});
 ok('6 new charms (3 companions + 3 effects): buy, equip, draw, emit, in the store + collection book',r.bad.length==0&&r.comp&&r.store>=15&&r.book==r.store&&r.cx=='cinder',r);
 // ---- store UI shows the mythic tiles
 await E(()=>{STORE7.open();STORE7.setFilter({cat:'gear',sort:'pd',q:'',rar:'all',owned:false})});await p.waitForTimeout(500);
 r=await E(()=>{const c=[...document.querySelectorAll('#store7 .card')];const f=c[0];return{first:f&&f.dataset.id,myth:c.filter(x=>x.dataset.rar=='mythic').length,bg:f&&getComputedStyle(f).backgroundImage.includes('gradient'),pulse:f&&getComputedStyle(f,'::before').animationName}});
 ok('store: the mythic Anonymous tiles lead the gear shelf with the obsidian treatment',r.first=='wear_anonsuit'&&r.myth==2&&r.bg&&r.pulse=='g8pulse',r);await E(()=>STORE7.close());
 // ---- body type
 r=await E(()=>{const o={};o.opts=AP.hair.length==10&&AP.gd.length==3;delete cel.ap.gd;cel.ap.hair=0;
  const ap0=sanAp(cel.ap),cl=__portrait(null,ap0),sp0=__char({});o.san=ap0.gd===0;
  GENDER7.setLook(2);o.f=cel.ap.gd==2&&cel.ap.hair==8;const sf=__char({}),pf=__portrait(null,sanAp(cel.ap));
  cel.ap.hair=8;GENDER7.setLook(1);o.m=cel.ap.gd==1&&cel.ap.hair==0;const sm=__char({}),pm=__portrait(null,sanAp(cel.ap));
  cel.ap.hair=3;GENDER7.setLook(2);o.keep=cel.ap.hair==3;const sf3=__char({});GENDER7.setLook(1);const sm3=__char({});
  o.spriteDiff=sm3.h!=sf3.h&&sm.h!=sp0.h;o.portDiff=pm.h!=pf.h&&pm.h!=cl.h;o.remote=cleanCx({ap:{gd:2}}).ap.gd==2&&cleanCx({ap:{}}).ap.gd==0;return o});
 ok('body type: Male/Female change the sprite and the portrait; stock hair follows, a chosen hairstyle is kept',r.opts&&r.san&&r.f&&r.m&&r.keep&&r.spriteDiff&&r.portDiff&&r.remote,r);
 await E(()=>{UI6.open('look')});await p.waitForTimeout(300);
 r=await E(()=>{const b=document.querySelector('#hubbody [data-gd8="2"]');if(!b)return{row:false};b.click();return{row:true,gd:cel.ap.gd,on:!!document.querySelector('#hubbody [data-gd8="2"].on')}});
 ok('hub Appearance tab has a Body type switch that sets the look',r.row&&r.gd==2&&r.on,r);await E(()=>{UI6.close();celSave();saveP()});
 const q=await boot();r=await q.evaluate(()=>({gd:cel.ap.gd,hair:cel.ap.hair,look0:X6.sc.looks[X6.sc.act|0]&&X6.sc.looks[X6.sc.act|0].gd}));
 ok('body type persists across a reload (live look + character slot)',r.gd==2&&r.look0==2,r);
 await q.evaluate(()=>{SHOW7.open();SHOW7.cur=0;SHOW7.render()});await q.waitForTimeout(500);
 r=await q.evaluate(()=>{const b=document.querySelector('#show [data-gd="1"]');if(!b)return{btn:false};b.click();return{btn:true,slot:X6.sc.looks[0].gd,on:!!document.querySelector('#show [data-gd="1"].on')}});
 ok('home screen offers Male / Female for your character',r.btn&&r.slot==1&&r.on,r);await q.evaluate(()=>SHOW7.close());
 // ---- old saves: an appearance saved before v8 (no gd) loads unchanged and renders the classic look
 await q.evaluate(()=>{Object.assign(cel.ap,{hair:3,eyes:2,outfit:1,acc:1,cape:2,eyeCol:4,hairCol:'#aa3344',skinCol:'#eebb99',outCol:'#224466',trimCol:'#ddcc88'});delete cel.ap.gd;const raw=JSON.parse(JSON.stringify(cel));delete raw.ap.gd;localStorage.setItem('rbc',JSON.stringify(raw));try{X6.sc.looks[X6.sc.act|0]=Object.assign({},raw.ap);x6Save()}catch(_){}});await q.close();
 const q2=await boot();r=await q2.evaluate(()=>{const A=cel.ap;const want={hair:3,eyes:2,outfit:1,acc:1,cape:2,eyeCol:4,hairCol:'#aa3344',skinCol:'#eebb99',outCol:'#224466',trimCol:'#ddcc88'};
  const same=Object.keys(want).every(k=>A[k]===want[k]);const c1=document.createElement('canvas'),c2=document.createElement('canvas');for(const c of[c1,c2]){c.width=310;c.height=430}
  const L0=SHOWART.info(Object.assign({},want)),L1=SHOWART.info(Object.assign({},want,{gd:0}));SHOWART.draw(c1.getContext('2d'),310,430,{look:L0,t:1,wpn:'fist',wings:false});SHOWART.draw(c2.getContext('2d'),310,430,{look:L1,t:1,wpn:'fist',wings:false});
  return{same,gd:A.gd|0,classic:c1.toDataURL()==c2.toDataURL()}});
 ok('old saves without a body type load unchanged (classic look)',r.same&&r.gd==0&&r.classic,r);await q2.close();
 ok('no page errors',errs.length==0,errs.slice(0,5).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all gear tests passed');process.exit(fails?1:0)})();
