// ===== DG bosses. Registered with DG.boss.reg(id, def):
//   {n, ti(tle), d(ungeon id), cls:'boss'|'aboss', c, c2, c3, w, h, ai:'walk'|'fly'|'float', sp, hover(px above you for fly), ttk, pct, mats:[ids only it drops],
//    phases:[.65,.25] (health where phase 2, 3... begin), names:['Awakening','Ancient Fury',...], idle:[1.7,1.3,1] (seconds between attacks per phase),
//    atk:[[...phase 1 attacks],[...phase 2],[...phase 3]] each {name, wind, rec, min, max, tag, vul(seconds it stays open afterwards), w(m,A) (weight, for adapting to how you fight), when(m,A), start(m,A), fire(m,A)},
//    intro(I, m, A): the entrance. I.at(seconds, fn), I.cam(shots), I.dur = total length. phase(i, m, A): the 1-3 s transition into phase i (0-based). death(m, A): started when it falls; deathTick(m, u, A) each frame, u 0..1; deathDur.
//    art(c, m, o): draw, feet at origin, facing right. o:{t, fl(ash), wind(0..1), at(tacking), ph(ase 1..), dy(ing 0..1), rise(0..1 during entrance), f}
//    tick(m, dt, A), onHit(m, d, w, ang, A) } =====
try{(()=>{
 const DG=window.DG,A=DG.A,fx=DG.fx,R=Math.random,TAU=Math.PI*2,rn=DG.rn,cl=DG.cl,DEF={};let act=null,I=null,OUT=null,PHS=null;
 function reg(id,def){def.id=id;DEF[id]=def;def.isBoss=1;const k='dgb_'+id;try{MK[k]={c:def.c,hp:1000,w:def.w,h:def.h,gem:Math.round((def.cls=='aboss'?260:60+DG.BY[def.d].lvl*2)),dmg:10,ai:'dg',fly:0,ph:0,min:9999,max:9999,dgm:1};MOBMAT[k]=def.mats?def.mats[0]:700}catch(_){}return def}
 const fl=()=>{const r=DG.run&&DG.run.room;return r?r.fy*T:P.y+P.h};
 const box=()=>{const r=DG.run&&DG.run.room;return r?{l:r.x0*T+T,r:r.x1*T-T,t:r.y0*T+T,b:r.fy*T}:{l:P.x-T*12,r:P.x+T*12,t:P.y-T*12,b:P.y+P.h}};
 A.box=box;A.fl=fl;A.boss=()=>act;A.clX=x=>{const b=box();return cl(x,b.l,b.r)};
 // the player is held still while a scene runs
 const hold={on:false,x:0,y:0};function lockP(){hold.on=true;hold.x=P.x;hold.y=P.y;DG.locked=true;try{for(const k in K)K[k]=0;mdL=mdR=false}catch(_){}}
 function unlockP(){hold.on=false;DG.locked=false}
 function spawnBoss(def,r,lv){const run=DG.run,cls=def.cls||'boss',hp=DG.mobHP(run.d,cls,def.ttk,run.df),dmg=DG.mobDmg(run.d,cls,def.pct,run.df),b=box(),x=b.l+(b.r-b.l)*.72,y=def.ai=='walk'?r.fy*T-def.h:r.fy*T-def.h-T*(def.hoverTiles||3);
  const m={k:'dgb_'+def.id,dgx:def,dgb:1,x,y,w:def.w,h:def.h,vx:0,vy:0,hp,mhp:hp,dmg,fl:0,burn:0,slow:0,stun:0,ph:R()*6,t:1,dir:1,fade:1,g:false,wall:0,phase:1,bt:2,st:'idle',room:r,inv:true,rise:0,cd:{},last:null,air:0,farT:0,nearT:0};mobs.push(m);if(DG.coop)DG.coop.spawned(m,'@'+def.id,{net:1});return m}
 // ---- the boss's own card over the screen, its level is the dungeon's
 function start(r){const run=DG.run,def=DEF[run.d.boss];if(!def){say('This boss is not ready yet');return}const m=spawnBoss(def,r);act=m;run.bossName=def.n;DG.flow.objective();lockP();DG.fx.clear();DG.music&&DG.music.state('bossintro');
  const seen=!!DG.S.bseen[def.id]&&!(DG.coop&&DG.coop.on);I={t:0,dur:def.introDur||6,ev:[],seen,skip:false,m};const api={at:(t,f)=>I.ev.push({t,f}),cam:(s,o)=>DG.cam.play(s,Object.assign({hold:true,lock:true},o||{})),set dur(v){I.dur=v},get dur(){return I.dur},room:r};
  const mx=m.x,my=m.y+m.h/2;
  try{if(def.intro)def.intro(api,m,A);else{api.cam([{x:(r.x0+r.x1)*T/2,y:r.fy*T-T*6,z:1,dur:1.2},{x:mx,y:my,z:1.25,dur:1.4,hold:2}]);api.at(1.4,()=>{m.rise=1})}}catch(e){console.error('DG intro',e)}
  if(DG.coop&&DG.coop.fast)I.dur=.2;api.at(I.dur-2.4,()=>DG.ui.bossCard(def,run));I.ev.sort((a,b)=>a.t-b.t);I.card=false;DG.ui.bars&&DG.ui.bars(true);if(seen)DG.ui.toast('Hold any key to skip');addEventListener('keydown',skipKey);addEventListener('keyup',skipUp)}
 let skipH=false,skipT=0;const skipKey=()=>{skipH=true},skipUp=()=>{skipH=false};
 function endIntro(){const m=I&&I.m,def=m&&m.dgx;removeEventListener('keydown',skipKey);removeEventListener('keyup',skipUp);skipH=false;skipT=0;I=null;if(!m)return;m.inv=false;m.rise=1;m.bt=1.3;if(def.lowG)m.lowG=def.lowG;unlockP();const r=m.room;DG.cam.frame(r.x0*T,r.x1*T,r.y0*T,r.fy*T);DG.cam.release();DG.S.bseen[def.id]=1;DG.save();DG.ui.bars&&DG.ui.bars(false);DG.ui.bossBar(m,def,true);DG.music&&DG.music.state('boss');DG.shk(.2);A.wave(m.x,m.y+m.h/2,def.c,T*9,.7,.3)}
 function pick(m,def){const L=def.atk[Math.min(m.phase-1,def.atk.length-1)]||[],d=A.dist(m),opts=[];let tot=0;for(const a of L){if(a.min!=null&&d<a.min)continue;if(a.max!=null&&d>a.max)continue;if(a.when&&!a.when(m,A))continue;if((m.cd[a.name]||0)>0)continue;let w=a.w?a.w(m,A):1;if(a===m.last)w*=.15;if(w>0){opts.push([a,w]);tot+=w}}if(!opts.length)return null;let u=R()*tot;for(const[a,w]of opts){u-=w;if(u<=0)return a}return opts[0][0]}
 function move(m,def,dt){const dx=P.x-m.x,b=box(),sp=(def.sp||70)*(m.slow>0?.5:1)*(1+(m.phase-1)*.12);if(m.frozenAI||m.st=='wind'&&!def.moveInWind){m.vx*=Math.pow(.02,dt);if(def.ai=='walk'){m.vy+=1800*dt;moveE(m,dt)}else{m.vy*=Math.pow(.02,dt);m.x+=m.vx*dt;m.y+=m.vy*dt}}
  else if(def.ai=='walk'){const near=Math.abs(dx)<(def.range||T*3);m.vx+=((near?0:Math.sign(dx)*sp)-m.vx)*Math.min(1,dt*3);m.vy+=1800*dt;moveE(m,dt)}
  else{const hov=def.hover||T*5,rg=def.range||T*6,tx=P.x-Math.sign(dx||1)*rg,ty=cl(P.y-hov+Math.sin(m.ph*1.1)*T*.8,b.t,b.b-m.h-T);m.vx+=(cl((tx-m.x)*1.2,-sp*2,sp*2)-m.vx)*Math.min(1,dt*2.4);m.vy+=(cl((ty-m.y)*1.2,-sp*2,sp*2)-m.vy)*Math.min(1,dt*2.4);m.x+=m.vx*dt;m.y+=m.vy*dt}
  const l=b.l+m.w/2-T+3,r2=b.r-m.w/2+T-3;if(!Number.isFinite(m.x))m.x=(b.l+b.r)/2;if(m.x<l){m.x=l;m.vx=Math.max(0,m.vx)}if(m.x>r2){m.x=r2;m.vx=Math.min(0,m.vx)}if(def.ai!='walk'){if(m.y<b.t)m.y=b.t;if(m.y>b.b-m.h)m.y=b.b-m.h}if(!Number.isFinite(m.y)||m.y<b.t-T*3||m.y>b.b+T){m.y=b.b-m.h-2;m.vy=0}m.f=(P.x-m.x)>=0?1:-1}
 function tickIntro(dt){const m=I.m;I.t+=dt;if(m.riseT)m.rise=Math.min(1,(m.rise||0)+dt/1.5);while(I.ev.length&&I.ev[0].t<=I.t){const e=I.ev.shift();try{e.f()}catch(err){console.error('DG intro ev',err)}}if(I.seen&&skipH){skipT+=dt;if(skipT>.6){endIntro();return}}else skipT=0;if(I.t>=I.dur)endIntro()}
 function tick(dt){if(hold.on){P.x=hold.x;P.y=hold.y;P.vx=P.vy=0;iT=Math.max(iT,.3);try{wcd=.3;rcd=.3}catch(_){}}
  if(OUT){OUT.t+=dt;const m=OUT.m,def=m.dgx,u=cl(OUT.t/OUT.dur,0,1);m.dy=u;m.ph+=dt;m.fl=0;try{if(def.deathTick)def.deathTick(m,u,A)}catch(e){console.error(e)}if(!DG.reduced()&&R()<dt*30)A.burst(m.x+rn(-m.w/2,m.w/2),m.y+rn(0,m.h),[def.c,def.c2||'#fff'],3,160);if(OUT.t>=OUT.dur)finishOut();return}
  if(I){tickIntro(dt);if(I)I.m.ph+=dt;return}
  const m=act;if(!m)return;const def=m.dgx;if(!mobs.includes(m)){act=null;return}if(m.lowG>0){m.lowG-=dt;P.dgGrav=.42}if(DG.coop&&DG.coop.mirror){DG.coop.mirrorBoss(m,dt);if(PHS){PHS.t+=dt;if(PHS.t>=PHS.dur)PHS=null}DG.ui.bossBar(m,def);return}m.ph+=dt;m.fl-=dt;m.slow-=dt;m.stun=(m.stun||0)-dt;if(m.at>0)m.at-=dt;if(m.vul>0)m.vul-=dt;for(const k in m.cd)m.cd[k]-=dt;if(m.burn>0){m.burn-=dt;m.hp-=m.mhp*.0008*dt*10}
  if(!P.g)m.air+=dt;else m.air=Math.max(0,m.air-dt*2);const d=A.dist(m);if(d>T*10)m.farT+=dt;else m.farT=Math.max(0,m.farT-dt);if(d<T*4)m.nearT+=dt;else m.nearT=Math.max(0,m.nearT-dt);
  if(m.hp<=0||m.dead){beginOut(m);return}
  // a new phase: a short beat, the arena answers, then straight back to the fight
  const pi=m.phase-1,P2=def.phases||[];if(pi<P2.length&&m.hp/m.mhp<P2[pi]&&!PHS){enterPhase(m,def,m.phase+1);if(DG.coop)DG.coop.phase(m)}
  if(PHS){PHS.t+=dt;m.vx*=.9;if(PHS.t>=PHS.dur){m.inv=false;m.bt=.8;PHS=null}move(m,def,dt);DG.ui.bossBar(m,def);return}
  const sw=DG.coop?DG.coop.swap(m):null;
  if(def.tick)try{def.tick(m,dt,A)}catch(e){if(!def.e){def.e=1;console.error('DG boss tick',def.id,e)}}
  move(m,def,dt);
  const idle=(def.idle||[1.7,1.3,1])[Math.min(m.phase-1,2)]*((DG.run&&DG.run.df.tel)||1);
  if(m.st=='idle'&&m.stun<=0){m.bt-=dt;if(m.bt<=0&&!DG.locked){const a=pick(m,def);if(a){m.atk=a;m.last=a;m.st='wind';m.tt=(a.wind==null?.9:a.wind)*((DG.run&&DG.run.df.tel)||1);m.tt0=m.tt;if(DG.coop)DG.coop.atk(m,a,m.tt);if(a.start)try{a.start(m,A)}catch(e){console.error('DG boss atk',a.name,e)}}else m.bt=.4}}
  else if(m.st=='wind'){m.tt-=dt;if(m.tt<=0){const a=m.atk;if(DG.coop)DG.coop.fire(m,a);try{if(a.fire)a.fire(m,A)}catch(e){console.error('DG boss atk',a.name,e)}m.st='rec';m.tt=a.rec==null?.5:a.rec;m.at=.35;if(a.cd)m.cd[a.name]=a.cd;if(a.vul)m.vul=a.vul}}
  else if(m.st=='rec'){m.tt-=dt;if(m.tt<=0){m.st='idle';m.bt=idle;m.atk=null}}
  if(sw)DG.coop.unswap(sw);
  const ov=!m.nohit&&Math.abs(P.x-m.x)<(P.w+m.w*.8)/2&&P.y<m.y+m.h&&P.y+P.h>m.y+m.h*.1;if(ov&&def.touch!==0)DG.hurtP(m.dmg*(def.touch||.55),Math.sign(P.x-m.x||1)*340);
  DG.ui.bossBar(m,def)}
 function enterPhase(m,def,to){const P2=def.phases||[];m.phase=to;PHS={t:0,dur:def.phaseDur||1.6,m};m.inv=true;m.st='idle';m.atk=null;DG.fx.clear();const nm=(def.names&&def.names[m.phase-1])||'';DG.ui.phase(nm,m.phase);if(m.phase-1==P2.length)DG.music&&DG.music.state('final');DG.shk(.3);try{if(def.phase)def.phase(m.phase-1,m,A);else A.wave(m.x,m.y+m.h/2,def.c,T*10,.8,.4)}catch(e){console.error('DG phase',e)}DG.cam.zoomTo(1.05,.3);setTimeout(()=>{try{if(act)DG.cam.zoomTo(1,.5)}catch(_){}},500);DG.ui.bossBar(m,def,true)}
 // ---- it falls: a quiet, slow moment that belongs to this boss, then the announcement, then the chest
 function beginOut(m){const def=m.dgx;if(DG.coop)DG.coop.out(m);act=null;m.dead=0;m.hp=0;m.inv=true;m.dy=0;OUT={t:0,dur:def.deathDur||4,m};DG.fx.clear();lockP();DG.ui.bossBar(null);DG.music&&DG.music.state('bossdeath');const r=m.room;DG.cam.arena=null;DG.cam.play([{x:m.x,y:m.y+m.h/2,z:1.22,dur:.8,hold:OUT.dur}],{hold:true,lock:true});DG.ui.bars&&DG.ui.bars(true);try{HITSTOP(180)}catch(_){}try{if(!DG.reduced())CINE7.slow((def.deathDur||4)*520,.34)}catch(_){}DG.shk(.5);try{if(def.death)def.death(m,A);else A.wave(m.x,m.y+m.h/2,def.c,T*14,1.2,.4)}catch(e){console.error('DG death',e)}}
 function finishOut(){const m=OUT.m,def=m.dgx;OUT=null;const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1);A.burst(m.x,m.y+m.h/2,[def.c,def.c2||'#fff','#ffd86a'],40,420,14);A.wave(m.x,m.y+m.h/2,'#fff',T*12,1,.3);DG.shk(.45);DG.tone(880,1760,.8,'triangle',.07);DG.tone(660,1320,.9,'sine',.05,.1);unlockP();DG.cam.reset();DG.ui.bars&&DG.ui.bars(false);const run=DG.run;run.tBoss=performance.now();DG.ui.say(def.n.toUpperCase()+' DEFEATED',run.d.n+' · '+run.df.n,3200);const L=DG.L,c=L&&L.chests.find(q=>q.kind=='final');if(c){c.x=DG.cl(m.x,(m.room.x0+3)*T,(m.room.x1-3)*T);c.y=m.room.fy*T;c.hid=false;c.drop=1}DG.rew&&DG.rew.bossKill(run,def);DG.flow.bossDown(def)}
 {const _dm=drawMob;drawMob=function(m,now){if(!m.dgb)return _dm(m,now);const def=m.dgx;try{const t=now/1000,X=m.x-cam.x,Y=m.y+m.h-cam.y;g.save();g.translate(X,Y);if(m.vul>0||m.st=='wind'){const c=m.vul>0?'#ffd24a':def.c,a0=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=a0*(m.vul>0?.55:.35+.3*(1-m.tt/(m.tt0||1)));const s=Math.max(m.w,m.h)*1.5;g.drawImage(BOSS6.glo(c),-s/2,-m.h/2-s/2,s,s);g.globalAlpha=a0;g.globalCompositeOperation='source-over'}if(m.shield>0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=def.c2||'#bfeaff';g.globalAlpha=.55+.2*Math.sin(t*6);g.lineWidth=4;g.beginPath();g.ellipse(0,-m.h/2,m.w*.72,m.h*.64,0,0,TAU);g.stroke();g.restore()}g.scale(m.f||1,1);if(m.hide>0)g.globalAlpha*=1-m.hide;def.art(g,m,{t,fl:m.fl>0,wind:m.st=='wind'?1-m.tt/(m.tt0||1):0,at:m.at>0?1:0,ph:m.phase,dy:m.dy||0,rise:m.rise==null?1:m.rise,f:m.f||1,cine:!!I});g.restore()}catch(e){try{g.restore()}catch(_){}if(!def.ee){def.ee=1;console.error('DG boss art',def.id,e)}}}}
 // bosses hit harder when open, and shields stop the blow
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){if(m&&m.dgb&&m.inv)return;if(m&&m.dgb&&d>0){const def=m.dgx;if(def.onHit)try{d=def.onHit(m,d,w,ang,A);if(!(d>0))return}catch(e){console.error(e)}if(m.vul>0)d=Math.round(d*1.3)}return _hm.call(this,m,d,w,ang)}}
 // ---- a copy of a boss with its own attack pattern (Shadow Replication and friends). Dies quickly, draws as the boss in a ghostly tint
 const GHOST={id:'__ghost',n:'Shadow',cls:'regular',w:60,h:90,c:'#5a4a8a',ai:'still',fly:1,touch:0,art(c,m,o){const s=m.src;c.save();c.globalAlpha*=.62*(m.fade||1);const q=m.sc||1;c.scale(q,q);try{s.art(c,m,{t:o.t,fl:o.fl,wind:o.wind,at:o.at,ph:1,dy:0,rise:1,f:o.f})}catch(_){}c.restore()}};
 DG.mobs.reg('__ghost',GHOST);
 A.ghost=(src,x,y,o={})=>{const m=A.spawn('__ghost',x,y,{summon:true,quiet:o.quiet,life:o.life||8});if(!m)return null;m.src=src;m.w=src.w*(o.sc||.7);m.h=src.h*(o.sc||.7);m.sc=o.sc||.7;m.y=y-m.h;m.hp=m.mhp=(act?act.mhp:1000)*(o.hp||.03);m.k='dgm___ghost';m.gtick=o.tick;const r=DG.run&&DG.run.room;if(r)m.room=r;m.dgx=Object.assign({},GHOST,{kit:o.kit||null,icd:o.icd||1.6,tick:o.tick||null});if(DG.coop)DG.coop.ghosted(m,o,o.sc||.7);return m};
 // ---- soul drain: for a while your blows land weaker. Killing what caused it (or waiting) ends it
 A.soul=(v,t)=>{DG.soul=v;DG.soulT=t;DG.ui.toast('Your strength is drained')};
 // ---- reality collapse: a stretch of the arena floor stops existing for a moment. Warned well ahead, and it hurts a lot to stand there
 A.collapse=(x0,x1,dur,c,dmg)=>{const f=fl();const z=fx.z(x0,f-T*3,x1,f+2,1.5,dur,{c:c||'#3a1a6a',dmg,kind:'void',rep:.45});z.voidz=1;return z};
 function stop(){act=null;I=null;OUT=null;PHS=null;hold.on=false;DG.locked=false;DG.cam.reset();removeEventListener('keydown',skipKey);removeEventListener('keyup',skipUp);DG.ui&&DG.ui.bossBar&&DG.ui.bossBar(null);DG.ui&&DG.ui.bars&&DG.ui.bars(false)}
 function reset(){const m=act;stop();if(m){const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1)}}
 // the owner's way to jump straight to a fight
 function startNow(id){const run=DG.run;if(!run)return false;const r=run.room&&run.room.kind=='boss'?run.room:DG.L.rooms.find(q=>q.kind=='boss');if(!r)return false;P.x=(r.x0+4)*T;P.y=r.fy*T-P.h-2;run.room=r;r.state='on';for(const s of r.doors)s.on=1;run.check={x:(r.x0+3)*T,y:r.fy*T-P.h-2};if(id&&DEF[id]){const o=run.d.boss;run.d=Object.assign({},run.d,{boss:id});start(r)}else start(r);return true}
 DG.boss={reg,DEF,start,tick,stop,reset,startNow,phaseTo:(m,to)=>enterPhase(m,m.dgx,to),fall:m=>beginOut(m),draw(){},get act(){return act},get inIntro(){return !!I},get inOut(){return !!OUT}};
})()}catch(e){console.error('DG boss',e)}
