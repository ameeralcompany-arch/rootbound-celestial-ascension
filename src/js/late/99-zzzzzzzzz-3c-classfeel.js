// ===== FEEL15: what a class feels like in the hand. Hit-stop on the blows that matter; a named third-hit finisher for every class's ordinary weapons (it only looks and sounds:
// damage stays as measured in the balance tests); an entrance when your class changes; Early / Mid / End stages of a class with a mark under your feet. =====
const FEEL15=(()=>{
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const D=COSM.D,R=Math.random,TAU=Math.PI*2;
 // ---- hit-stop: for a few hundredths of a second the world slows almost to a stop (99-loop.js reads this)
 let lastStop=0;function stop(ms){if(red()||window.HS_OFF)return;const n=performance.now();if(n-lastStop<140)return;lastStop=n;window.HS_T=Math.max(window.HS_T||0,ms/1000)}
 window.HITSTOP=stop;
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){const was=m&&m.hp>0;const r=_hm.apply(this,arguments);try{if(was&&m.hp<=0&&w){stop(m.boss?110:42)}}catch(_){}return r}}
 // ---- finishers: every third hit in a row with a class weapon
 const FIN={brawler:['Knockout','#ff8a3a',-1],knight:['Oathstrike','#ffe48a',1],samurai:['Iaido','#ff9ac0',1],archer:['Trueshot','#cfc4ff',1],mage:['Overload','#c88aff',-1],demon:['Bloodletting','#ff4a64',-1],reaper:['Last Hour','#b48cff',1],elementalist:['Confluence','#7ad8ff',-1],stormcaller:['Thunderclap','#8ad4ff',1],berserker:['Rampage','#ff6a3a',-1],ninja:['Vanish','#7fefe0',1],druid:['Overgrowth','#8affb0',-1],gunslinger:['Last Round','#ffd27e',1]};
 let chain=0,chainT=0,chainK=null;
 function finisher(k){const f=FIN[k],d=D[k];if(!f||window.HS_OFF)return;const dir=P.f||1,x=P.x+dir*T*1.6,y=P.y+P.h*.45;let near=false;try{near=mobs.some(m=>!m.dead&&m.hp>0&&Math.hypot(m.x-x,m.y+m.h/2-y)<T*3)}catch(_){}
  try{ft(P.x,P.y-30,f[0]+'!',f[1])}catch(_){}
  try{const FK={brawler:'uppercut',knight:'cleave',samurai:'iaido',archer:'pierce',mage:'missiles',demon:'splash',reaper:'harvest',elementalist:'prism',stormcaller:'chain',berserker:'whirl',ninja:'clones',druid:'whip',gunslinger:'ricochet'};const a=Math.atan2(my+cam.y-y,mx+cam.x-x);FLOW15.sig(FK[k],k,{x:P.x,y:P.y+P.h*.45},a,dir,x,y)}catch(_){}
  try{const b=f[2]>0?660:330;SFX7.tone(b,b*2,.14,'triangle',.05);SFX7.tone(b*1.5,b*.75,.2,'sine',.04,.06)}catch(_){}
  if(near){stop(60);try{if(!red())shake=Math.max(shake,.1)}catch(_){}}}
 {const _uw=useWeapon;useWeapon=function(){const c0=wcd;const r=_uw.apply(this,arguments);try{const w=WPN[wp];if(w&&!w.myth&&w.k!='tool'&&w.id!='fist'&&c0<=0&&wcd>0){const k=CLASS7.of(w),n=performance.now();if(k&&FIN[k]){if(k==chainK&&n-chainT<1400)chain++;else chain=1;chainK=k;chainT=n;if(chain>=3){chain=0;finisher(k)}}}}catch(e){if(!FEEL15.e){FEEL15.e=1;console.error('FEEL15',e)}}return r}}
 // ---- when your class changes: a short entrance in its colours, and its own chord
 let lastCls=undefined,lastStage={};const NOTES=[262,294,330,349,392,440,494,523,587,659,698,784,880];
 function entrance(k){const d=D[k];if(!d)return;const i=Object.keys(D).indexOf(k),b=NOTES[i%NOTES.length];try{const c=d.neb[0],x=P.x,y=P.y+P.h*.5;burst(x,y,c,red()?6:24,240,5);burst(x,y,d.star,red()?2:12,150,3,'p');rings.push({x,y,c:d.rim,t:performance.now()});VFX.wave(x,y,c,T*3,.5,.45)}catch(_){}
  try{SFX7.tone(b,b,.12,'triangle',.04);SFX7.tone(b*1.25,b*1.25,.14,'triangle',.04,.08);SFX7.tone(b*1.5,b*1.5,.22,'sine',.045,.17)}catch(_){}
  try{ft(P.x,P.y-44,CLASS7.C[k].n,d.rim)}catch(_){}}
 // ---- Early / Mid / End
 const STG=['','Early','Mid','End'],stageOf=L=>L>=50?3:L>=25?2:1;CLASS7.stage=k=>stageOf(CLASS7.lv(k));CLASS7.stageName=k=>STG[stageOf(CLASS7.lv(k))];
 const STXT={2:'Your class mark awakens. New weapons and its level 25 passive are open.',3:'Your class mark is complete. The Mythic forge is open to you.'};
 function watch(){if(typeof entered=='undefined'||!entered)return;let k=null;try{k=CLASS7.cur()}catch(_){}if(lastCls===undefined){lastCls=k;for(const q in D)lastStage[q]=stageOf(CLASS7.lv(q));return}
  if(k!==lastCls){lastCls=k;if(k)entrance(k)}
  for(const q in D){const s=stageOf(CLASS7.lv(q));if(s>(lastStage[q]||1)){lastStage[q]=s;try{UI6.say6(CLASS7.C[q].n+' · '+STG[s]+' stage',STXT[s],3600)}catch(_){}try{entrance(q)}catch(_){}}else if(s<lastStage[q])lastStage[q]=s}}
 setInterval(()=>{try{watch()}catch(_){}},250);
 // the class mark under your feet while you hold a class weapon. Drawn only for you for now.
 function mark(now){if(typeof entered=='undefined'||!entered)return;let k=null;try{k=CLASS7.cur()}catch(_){}if(!k||!D[k])return;const s=stageOf(CLASS7.lv(k));if(s<2)return;const d=D[k],t=now/1000,x=P.x-cam.x,y=P.y+P.h-cam.y-2;g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.scale(1,.3);g.strokeStyle=d.rim;g.globalAlpha=.42;g.lineWidth=1.6;g.beginPath();g.arc(0,0,26,0,TAU);g.stroke();
   if(s>=3){g.globalAlpha=.3;g.beginPath();g.arc(0,0,33,0,TAU);g.stroke();g.fillStyle=d.star;g.globalAlpha=.85;for(let i=0;i<3;i++){const q=t*1.1+i*TAU/3;g.beginPath();g.arc(Math.cos(q)*33,Math.sin(q)*33,2.2,0,TAU);g.fill()}}g.restore()}
 {const _dn=drawNPCs;drawNPCs=function(now){try{mark(now)}catch(_){}return _dn.apply(this,arguments)}}
 // ---- reaching a new Mythic stage is announced as such
 {const _a=MYTH.ascend;MYTH.ascend=function(k){const t0=MYTH.tier(k),r=_a.apply(this,arguments);try{const t1=MYTH.tier(k);if(r&&COSM.stage(t1)>COSM.stage(t0||1)&&t0>0){const s=COSM.stage(t1);setTimeout(()=>{try{UI6.say6(MYART.TH[k].n+' · Stage '+['','I','II','III'][s],COSM.STN[s]+(s==3?': a fourth strike joins the combo.':': an orbit ring wakes around its heart.'),3600)}catch(_){}},3800)}}catch(_){}return r}}
 MYTH.stage=k=>{const t=MYTH.tier(k);return t?COSM.stage(t):0};
 // ---- a Mythic needs player level 35, and once used it stays out in your hand for a minute
 for(const k in D){const w=WPN[MYTH.ID(k)];if(w)w.lv=35}
 let mythT=-1e9;{const _uw=useWeapon;useWeapon=function(){const w=WPN[wp],c0=wcd,r=_uw.apply(this,arguments);try{if(w&&w.myth&&c0<=0&&wcd>0&&(lvl|0)>=(w.lv|0))mythT=performance.now()}catch(_){}return r}}
 {const _u=update;update=function(dt){_u.apply(this,arguments);try{const w=WPN[wp];if(w&&w.myth&&performance.now()-mythT<60000&&swing<-.5)swing=-.5}catch(_){}}}
 return{FIN,stop,finisher,entrance,stageOf,watch,get mythT(){return mythT},set mythT(v){mythT=v}}})();
// ===== SHOW15: each class's Mythic floats in front of its master's house in the plaza, slowly turning over a pool of its own light. It is drawn for everyone in the same place, is not
// a block, so nothing is in the way, and only the ones on screen cost anything. E beside it (or the master's dialog) opens that weapon's page on the Classes screen. =====
const SHOW15=(()=>{
 const TAU=Math.PI*2,D=COSM.D;
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}};
 const spots=()=>{try{return PLZ7.HS.map(h=>({k:h.c,npc:h.npc,x:(h.x0+h.w/2)*T,y:(PLZ7.S-4.8)*T,gy:PLZ7.S*T}))}catch(_){return[]}};
 let SP=null;const list=()=>SP||(SP=spots());
 const POOL={};function pool(k){if(POOL[k])return POOL[k];const c=document.createElement('canvas');c.width=150;c.height=46;const x=c.getContext('2d'),d=D[k];x.translate(75,23);x.scale(1,.3);const g2=x.createRadialGradient(0,0,0,0,0,72);g2.addColorStop(0,MYART.rgba(d.rim,.75));g2.addColorStop(.5,MYART.rgba(d.neb[0],.3));g2.addColorStop(1,MYART.rgba(d.neb[0],0));x.fillStyle=g2;x.beginPath();x.arc(0,0,72,0,TAU);x.fill();return POOL[k]=c}
 // a patch of its own night sky behind the weapon, so it reads against any wall
 const DISC={};function disc(k){if(DISC[k])return DISC[k];const c=document.createElement('canvas');c.width=c.height=220;const x=c.getContext('2d'),d=D[k],n=COSM.nebula(k);x.save();x.beginPath();x.arc(110,110,108,0,TAU);x.clip();x.drawImage(n,-50,-50,320,320);x.restore();x.globalCompositeOperation='destination-in';const gr=x.createRadialGradient(110,110,30,110,110,108);gr.addColorStop(0,'rgba(0,0,0,.92)');gr.addColorStop(.6,'rgba(0,0,0,.62)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,220,220);return DISC[k]=c}
 function drawOne(s,t,vis){const k=s.k,d=D[k],sx=s.x-cam.x,sy=s.y-cam.y,mo=red()?0:1,fy=Math.sin(t*1.2+s.x)*5*mo;
  // the beam of light from the ground, then the pool
  g.save();g.globalCompositeOperation='lighter';const gy=s.gy-cam.y;g.globalAlpha=.8;g.drawImage(pool(k),sx-75,gy-23);
  const gr=g.createLinearGradient(0,sy,0,gy);gr.addColorStop(0,MYART.rgba(d.rim,0));gr.addColorStop(1,MYART.rgba(d.rim,.2));g.fillStyle=gr;g.beginPath();g.moveTo(sx-9,sy);g.lineTo(sx+9,sy);g.lineTo(sx+30,gy);g.lineTo(sx-30,gy);g.closePath();g.fill();g.restore();
  // the weapon, turning like a thing on a slow string
  const th=MYART.TH[k],ty=th.type||'scythe',sp=COSM.sprite(k,6,90),b=sp?sp.pts.b:[-30,-30,100,30],cxx=(b[0]+b[2])/2,cyy=(b[1]+b[3])/2,ext=Math.max(b[2]-b[0],b[3]-b[1]),L=Math.min(175,19000/Math.max(50,ext));g.drawImage(disc(k),sx-110,sy+fy-110);
  g.save();g.translate(sx,sy+fy);g.rotate(-1.2+Math.sin(t*.5+s.x)*.07*mo);g.scale(1,mo?.86+.14*Math.cos(t*.7+s.x):1);g.translate(-cxx*L/100,-cyy*L/100);try{MYART.weapon(g,k,6,L,mo?t:0,{aura:1})}catch(e){if(!SHOW15.e){SHOW15.e=1;console.error('SHOW15',e)}}g.restore();
  // a few motes rising around it
  if(mo){g.save();g.globalCompositeOperation='lighter';g.fillStyle=d.star;for(let i=0;i<6;i++){const q=(t*.28+i/6+s.x*.01)%1,a=i*1.05+t*.4;g.globalAlpha=(1-q)*.8;g.fillRect(sx+Math.cos(a)*(22+i*4),gy-q*190,1.8,1.8)}g.restore()}
  if(vis<T*5){g.save();g.textAlign='center';g.globalAlpha=Math.min(1,(T*5-vis)/(T*2));g.font="700 italic 14px 'Cormorant Garamond',Georgia,serif";g.lineWidth=3;g.strokeStyle='rgba(6,4,20,.8)';g.fillStyle='#fff';g.strokeText(th.n,sx,sy-112);g.fillText(th.n,sx,sy-112);g.restore()}}
 function draw(now){if(typeof cur=='undefined'||cur!='plaza')return;const t=now/1000,vw=cv.width/(typeof ZM!='undefined'?ZM:1);for(const s of list()){const sx=s.x-cam.x;if(sx<-170||sx>vw+170)continue;drawOne(s,t,Math.abs(s.x-P.x))}}
 {const _dn=drawNPCs;drawNPCs=function(now){try{draw(now)}catch(e){if(!SHOW15.e){SHOW15.e=1;console.error('SHOW15',e)}}return _dn.apply(this,arguments)}}
 function nearSpot(){if(typeof cur=='undefined'||cur!='plaza')return null;let b=null,bd=T*2.2;for(const s of list()){const d=Math.abs(s.x-P.x);if(d<bd&&Math.abs(s.gy-(P.y+P.h))<T*2.5){bd=d;b=s}}return b}
 const inspect=k=>{try{closeDlg()}catch(_){}try{CLS9.open(k)}catch(e){console.error('SHOW15',e)}};
 {const _i=interact;interact=function(){if(!dlgOpen&&!creatorOn&&!showInv&&menuEl.style.display=='none'){let npc=null;try{npc=nearNPC()}catch(_){}const s=nearSpot();if(s&&!npc){inspect(s.k);return}}return _i.apply(this,arguments)}}
 {const _pt=OBJ6.promptText;OBJ6.promptText=function(npc){const r=_pt.apply(this,arguments);if(r||npc)return r;const s=nearSpot();return s?'Press E to inspect '+MYART.TH[s.k].n:r}}
 // the master's dialog gets a button for it
 {const _c=NPC2.classHTML;NPC2.classHTML=function(n){const h=_c.apply(this,arguments);try{if(n&&n.cls&&MYART.TH[n.cls])return h+'<div class="rw"><div style="flex:1"><b>'+MYART.TH[n.cls].n+'</b><small>The Mythic '+MYART.TH[n.cls].noun+' of this house'+(MYTH.tier(n.cls)?' · yours, Tier '+MYTH.RN[MYTH.tier(n.cls)]:' · not forged yet')+'</small></div><button data-a="talk:myth">Inspect</button></div>'}catch(_){}return h}}
 {const _da=dlgAct;dlgAct=function(a){if(a=='talk:myth'){try{inspect(curNPC.cls)}catch(_){}return}return _da.apply(this,arguments)}}
 return{list,draw,nearSpot,inspect}})();
