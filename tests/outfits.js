// v10 wardrobe (60-zz-gear3.js): six animated aura sets — Bubblegum Dream, Celestial Seraph, Inferno Dragon (mythic) and Sakura Kitsune,
// Frost Empress, Neon Cyber (legendary). Each piece is a store item with stats (WEAR), worn art (GEAR7.D) and an icon; a piece shows its
// set's aura, the full set at full strength; every skill does something; the aura stays cheap per frame. No page errors. node tests/outfits.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);
 const E=(f,a)=>p.evaluate(f,a);
 // ---- catalog, stats, art, icons
 let r=await E(()=>{const bad=[],rar={},sets={};for(const id of GEAR10.IDS){const w=WEAR[id],it=SHOP7.byId.get('wear_'+id),d=GEAR7.D[id];if(!w||!it){bad.push('missing '+id);continue}
   if(it.cat!='gear'||it.sub!=w.s||!(it.price>0)||!(it.lv>0))bad.push('item '+id);if(!w.b||!Object.keys(w.b).length||!w.sd)bad.push('stats '+id);
   if(w.s=='hat'?!GEAR7.has(id,'hatF'):!GEAR7.has(id,'torso'))bad.push('art '+id);
   const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');if(!GEAR7.icon(x,id,64))bad.push('icon '+id);else{const px=x.getImageData(0,0,64,64).data;let n=0;for(let i=3;i<px.length;i+=4)if(px[i]>20)n++;if(n<400)bad.push('blank icon '+id)}
   rar[it.rar]=(rar[it.rar]||0)+1;(sets[GEAR10.SET[id]]=sets[GEAR10.SET[id]]||[]).push(w.s)}
  return{bad,rar,sets,n:GEAR10.IDS.length}});
 ok('12 new pieces: each a store item with stats, a skill, worn art and a drawn icon',r.n==12&&r.bad.length==0,r.bad);
 ok('six sets of hat + body; 6 mythic and 6 legendary pieces (Bubblegum Dream is mythic)',Object.keys(r.sets).length==6&&Object.values(r.sets).every(a=>a.sort().join()=='body,hat')&&r.rar.mythic==6&&r.rar.legendary==6&&(await E(()=>SHOP7.byId.get('wear_bubbledress').rar))=='mythic',r);
 // ---- auras: one piece softer, the full set stronger; a different set shows a different aura; no aura without a set piece
 r=await E(()=>{const pk=w=>GEAR10.pick(w),base={hat:'',body:'',boot:'',glove:'',wing:''};
  return{none:pk(base),one:pk(Object.assign({},base,{hat:'bubblehood'})),full:pk(Object.assign({},base,{hat:'bubblehood',body:'bubbledress'})),mix:pk(Object.assign({},base,{hat:'frostcrown',body:'dragonplate'}))}});
 ok('a piece shows its set\'s aura, the full set at full strength; the body piece leads a mixed outfit',r.none==null&&r.one.th=='bubble'&&r.one.lv==1&&r.full.lv==2&&r.mix.th=='dragon'&&r.mix.lv==1,r);
 // the aura actually draws (pixels around the character change with it), for every set
 r=await E(async()=>{const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d'),saved=g;const ink=()=>{const d=x.getImageData(0,0,200,200).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>8)n++;return n};
  const draw=w=>{x.clearRect(0,0,200,200);g=x;try{AC6.draw(100,60,1,0,'',1.3,0,false,0,'fist',0,false,w,0,null,null)}finally{g=saved}return ink()};
  const base={hat:'',body:'',boot:'',glove:'',wing:''},plain=draw(base),out={};for(const th of Object.keys(GEAR10.TH)){const ids=GEAR10.IDS.filter(i=>GEAR10.SET[i]==th);out[th]=draw(Object.assign({},base,{hat:ids.find(i=>WEAR[i].s=='hat'),body:ids.find(i=>WEAR[i].s=='body')}))}return{plain,out}});
 ok('every set draws its aura around the character',Object.values(r.out).every(n=>n>r.plain*1.6),r);
 // per-frame cost of a full-set aura (cached sprites, stateless particles)
 r=await E(()=>{const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d'),saved=g;const w={hat:'bubblehood',body:'bubbledress',boot:'',glove:'',wing:''};g=x;const t0=performance.now();try{for(let i=0;i<200;i++)AC6.draw(100,60,1,0,'',i/60,0,false,0,'fist',0,false,w,0,null,null)}finally{g=saved}return(performance.now()-t0)/200});
 ok('a fully dressed aura character draws in under 1.5 ms',r<1.5,r.toFixed(3)+' ms');
 // ---- skills: each one acts on nearby monsters or on you
 await E(()=>{lvl=40;enterWorld('outfitsa');mobs.length=0});await p.waitForTimeout(700);
 r=await E(async()=>{const res={};const spawn=()=>{mobs.length=0;for(let i=0;i<4;i++){const d=MK.slime;mobs.push({k:'slime',x:P.x+(i<2?-1:1)*(60+i*30),y:P.y,w:d.w,h:d.h,vx:0,vy:0,hp:5000,fl:0,burn:0,slow:0,ph:i,t:1,dir:1,fade:1,g:true,wall:0})}};
  for(const id of GEAR10.IDS){spawn();P.hp=maxHP()*.5;const hp0=P.hp,x0=P.x;GEAR10.st.bub=0;GEAR10.st.bliz=0;try{GEAR10.SK[id]()}catch(e){res[id]='ERR '+e.message;continue}await new Promise(r=>setTimeout(r,900));
   const hurt=mobs.filter(m=>m.hp<5000).length,stun=mobs.filter(m=>(m.stun||0)>0||(m.slow||0)>0||(m.burn||0)>0).length;res[id]={hurt,stun,heal:Math.round(P.hp-hp0),moved:Math.round(P.x-x0),bub:+GEAR10.st.bub.toFixed(1),bliz:+GEAR10.st.bliz.toFixed(1)};P.x=x0}return res});
 const acts=Object.entries(r).map(([id,v])=>[id,typeof v=='object'&&(v.hurt>0||v.stun>0||v.heal>0||Math.abs(v.moved)>0||v.bub>0||v.bliz>0)]);
 ok('every skill does something (hurts, freezes, burns, heals, shields, storms or blinks)',acts.every(a=>a[1]),r);
 ok('Bubble Shield floats you inside a bubble; Bubble Burst heals you',r.bubblehood.bub>0&&r.bubbledress.heal>0,{shield:r.bubblehood,burst:r.bubbledress});
 ok('no page errors',errs.length==0,errs.slice(0,5));
 console.log(fails?'FAILURES '+fails:'all outfit tests passed');await b.close();process.exit(fails?1:0)})();
