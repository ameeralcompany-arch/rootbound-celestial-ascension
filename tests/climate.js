// Bosses that control the weather, played through the game's own update loop: every boss's climate and four phases, the scene at each big phase (and that it always hands control
// back), voiced lines, every new ability warning before it hurts, wind, lightning rods, freezing, blooms, darkness, the smarter choice of attacks, graphics settings that never change
// what can hit you, the flash setting, frame rate at full weather, and that the weather is gone after a win or after leaving.
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,600):''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await p.evaluate(()=>{enterWorld('plaza');CINE7.slow=()=>{}});await p.waitForTimeout(600);
 // helpers in the page: run game time, record every warning an ability raises
 await p.evaluate(()=>{window.__run=s=>{for(let i=0;i<Math.round(s*60);i++)update(1/60)};const W=window.__warn=[];for(const k of['z','c','col','beam','ground','well','wave'])(o=>{DG.fx[k]=function(){const a=[...arguments];let tel=k=='z'?a[4]:k=='c'?a[3]:k=='col'?a[4]:(a[a.length-1]||{}).tel;W.push({k,tel:tel==null?0:+tel,dmg:+((a[a.length-1]||{}).dmg||0),kind:(a[a.length-1]||{}).kind});return o.apply(this,a)}})(DG.fx[k])});
 const ids=await p.evaluate(()=>Object.keys(DG.legend.LEG));
 for(const id of ids){const r=await p.evaluate(async id=>{const def=DG.boss.DEF[id],d=DG.BY[def.d],o={};lvl=70;DG.god=1;DG.S.bseen[id]=1;DG.enter(d.id,DG.diffsOf(d)[0],{force:true,skipCine:true});window.RB_COVER=1;__run(.3);DG.boss.startNow();for(let i=0;i<900&&DG.boss.inIntro;i++)update(1/60);const m=DG.boss.act;if(!m)return{err:'no boss'};
   o.pre=DG.clim.k;o.want=def.legend.pre;o.on=DG.clim.on;o.names=def.names.length;o.ph=def.phases.join(',');o.lists=def.atk.length;const st=[],lock=[],sub=[];
   for(const[f,to]of[[.74,2],[.49,3],[.19,4]]){m.hp=m.mhp*f;let locked=false,t=0;for(;t<6;t+=1/60){update(1/60);if(DG.locked)locked=true;if(m.phase==to&&!DG.locked&&!m.inv&&t>.2)break}st.push([m.phase,DG.clim.S.stage]);lock.push({to,locked,free:!DG.locked,t:+t.toFixed(1)});sub.push((document.getElementById('bsub')||{}).textContent||'')}
   o.st=st;o.lock=lock;o.sub=sub;o.form=m.form;
   // each new ability, fired by the boss itself: what it warns before it hurts
   const mine=new Set(Object.values(DG.legend.AB).map(f=>f().name)),abil=[];for(const L of def.atk)for(const a of L)if(mine.has(a.name)&&!abil.find(q=>q.name==a.name))abil.push(a);o.abil=[];
   for(const a of abil){__warn.length=0;DG.fx.clear();const c0=DG.fx.count;try{if(a.start)a.start(m,DG.A);if(a.fire)a.fire(m,DG.A)}catch(e){o.abil.push({n:a.name,err:e.message});continue}__run(1.6);const hurt=__warn.filter(w=>w.dmg>0),minTel=Math.min(...hurt.filter(w=>w.k!='wave'&&w.k!='ground'&&w.k!='well').map(w=>w.tel),9);o.abil.push({n:a.name,cd:a.cd,hazards:__warn.length,hurt:hurt.length,minTel:+minTel.toFixed(2),fxNow:DG.fx.count-c0,clim:{dark:+DG.clim.S.dark.toFixed(2),gust:!!DG.clim.S.gust,low:DG.clim.S.lowG>0}});__run(.4)}
   DG.fx.clear();DG.clim.S.frozen=0;
   // the win: the weather calms and is gone, the boss says its last words
   m.hp=0;let t=0;for(;t<14&&DG.clim.on;t+=1/60)update(1/60);o.calm=!DG.clim.on;o.calmT=+t.toFixed(1);o.lastWords=(document.getElementById('bsub')||{}).textContent||'';o.locked=DG.locked;__run(1);DG.leave();__run(.5);DG.god=0;return o},id);
  if(r.err){ok(id+': the fight starts',false,r);continue}
  ok(id+': its own climate, from the start',r.on&&r.pre==r.want,{pre:r.pre,want:r.want});
  ok(id+': four phases at 75%, 50% and 20%, with four names and four attack lists',r.ph=='0.75,0.5,0.2'&&r.names==4&&r.lists==4,r);
  ok(id+': the weather grows with each phase',r.st.map(s=>s.join(':')).join(' ')=='2:2 3:3 4:4',r.st);
  ok(id+': the big phases play a scene and then give control back',r.lock[0].locked&&r.lock[2].locked&&r.lock.every(l=>l.free&&l.t<5),r.lock);
  ok(id+': it speaks at each phase',r.sub.every(s=>s.length>8),r.sub);
  ok(id+': the final form has its own look',r.form==1);
  const bad=r.abil.filter(a=>a.err||!(a.hazards>0||a.clim.dark>0||a.clim.gust||a.clim.low)||(a.hurt>0&&a.minTel<.6)||!(a.cd>0));
  ok(id+': every new ability ('+r.abil.map(a=>a.n).join(', ')+') does something real, warns at least 0.6 s before it hurts, and has a cooldown',r.abil.length>0&&bad.length==0,bad.length?bad:r.abil);
  ok(id+': after the win the climate calms and stops',r.calm&&r.calmT<12&&!r.locked,{t:r.calmT});ok(id+': and it has last words',r.lastWords.length>8,r.lastWords)}
 // ---- the mechanics, one by one, in Dragon's Grave
 const mech=await p.evaluate(()=>{const o={};lvl=70;DG.god=0;DG.enter('dragon','normal',{force:true,skipCine:true});__run(.3);DG.boss.startNow();for(let i=0;i<900&&DG.boss.inIntro;i++)update(1/60);const m=DG.boss.act,C=DG.clim,b=DG.A.box();P.hp=1e9;
  // wind pushes you, and never into rock
  P.x=(b.l+b.r)/2;P.y=DG.A.fl()-P.h-1;const x0=P.x;C.gust(1,2,0);__run(1);o.gust=Math.round(P.x-x0);o.notInRock=!solidAt(Math.floor(P.x/T),Math.floor((P.y+P.h/2)/T));C.S.gust=null;
  // a strike warns, then hits where it warned
  const hp0=P.hp;iT=0;C.strike(P.x,{dmg:50,tel:1.15});__run(.9);o.before=hp0-P.hp;__run(.5);o.after=hp0-P.hp;
  // a lightning rod: lead the strike onto it and the boss is struck and opened
  DG.fx.clear();C.S.rods.length=0;const rd=C.rod((b.l+b.r)/2);P.x=rd.x;const bh=m.hp;C.strike(rd.x,{dmg:1,tel:.3});__run(2);o.rod={vul:m.vul>0,stun:m.stun>0,lost:Math.round(bh-m.hp)};
  // frozen: jumping four times breaks out
  C.freeze(1.8);const fx0=P.x;for(let i=0;i<2;i++)dispatchEvent(new KeyboardEvent('keydown',{key:' '}));__run(.2);o.stillFrozen=C.S.frozen>0&&P.x==fx0;for(let i=0;i<2;i++)dispatchEvent(new KeyboardEvent('keydown',{key:' '}));__run(.1);o.free=C.S.frozen<=0;
  // darkness narrows sight, then lifts
  C.darkness(.8,1);__run(.6);o.dark=C.S.dark>.5;__run(2);o.lifted=C.S.dark<.2;
  // bright flashes can be turned off
  DG.S.opt.flash=0;C.S.flash=0;C.bolt(P.x,DG.A.fl());o.softFlash=C.S.flash;DG.S.opt.flash=1;C.S.flash=0;C.bolt(P.x,DG.A.fl());o.fullFlash=C.S.flash;
  // smarter choices: a flurry of hits up close brings a warned counter; a big burst brings a guard that takes most of the damage; the strongest abilities are never back to back
  DG.fx.clear();P.x=m.x-T*2;P.y=m.y+m.h/2-P.h/2;P.hp=1e9;m.aiH=[];m.cAt=null;for(let i=0;i<6;i++){const h=m.hp;hurtMob(m,1,WPN.ember,0)}o.counter=(DG.bossAI.force(m,m.dgx)||{}).name;m.phase=Math.max(2,m.phase);m.aiH=[[m.ph,m.mhp*.1]];m.gAt=null;o.guard=(DG.bossAI.force(m,m.dgx)||{}).name;m.inv=false;m.vul=0;m.guardUntil=0;const R0=Math.random;Math.random=()=>.99;const h0=m.hp;hurtMob(m,100,WPN.ember,0);const plain=h0-m.hp;const g=DG.boss.DEF.varkhazan.kit.find(a=>a.name=='guard');g.start(m,DG.A);const h1=m.hp;hurtMob(m,100,WPN.ember,0);o.guarded=+((h1-m.hp)/plain).toFixed(2);Math.random=R0;
  const ult=m.dgx.atk[3].find(a=>a.name=='heavenrends');DG.bossAI.picked(m,ult);o.ultAgain=DG.bossAI.w(m,ult,T*5);
  o.kit=DG.boss.DEF.varkhazan.kit.map(a=>a.name);
  // the same warnings on every graphics setting
  const counts=[];for(const q of[0,2]){DG.S.opt.cq=q;DG.fx.clear();__warn.length=0;const a=DG.legend.AB.judgment();a.fire(m,DG.A);counts.push(__warn.length)}o.sameOnAll=counts;
  // leaving mid-fight takes the weather with it
  DG.leave();__run(.5);o.goneAfterLeave=!DG.clim.on;return o});
 ok('wind pushes you, and never into rock',mech.gust>40&&mech.notInRock,mech);ok('lightning only hurts after its warning',mech.before==0&&mech.after>0,mech);ok('leading lightning onto a rod strikes the boss and opens it',mech.rod.vul&&mech.rod.stun&&mech.rod.lost>0,mech.rod);
 ok('frozen, two jumps are not enough and four break you out',mech.stillFrozen&&mech.free,mech);ok('darkness narrows your sight, then lifts',mech.dark&&mech.lifted,mech);ok('with bright flashes off, lightning barely lights the screen',mech.softFlash<=.12&&mech.fullFlash>=.5,mech);
 ok('a flurry up close is answered with a counter, a burst with a guard',mech.counter=='counter'&&mech.guard=='guard',mech);ok('the guard takes half the damage',mech.guarded<=.55&&mech.guarded>0,mech.guarded);ok('its strongest ability is never used twice in a row',mech.ultAgain===0,mech.ultAgain);ok('co-op can replay the reactions',mech.kit.includes('counter')&&mech.kit.includes('guard'));
 ok('low and high graphics raise exactly the same warnings',mech.sameOnAll[0]==mech.sameOnAll[1]&&mech.sameOnAll[0]>0,mech.sameOnAll);ok('leaving mid-fight takes the weather with it',mech.goneAfterLeave);
 // ---- a bloom spreads poison until it is destroyed
 const bl=await p.evaluate(()=>{lvl=70;DG.enter('hollow','normal',{force:true,skipCine:true});__run(.3);DG.boss.startNow();for(let i=0;i<900&&DG.boss.inIntro;i++)update(1/60);const m=DG.boss.act;const a=DG.legend.AB.bloom();a.fire(m,DG.A);const h=mobs.find(q=>q.pool);if(!h)return{none:1};const w0=h.pool.x1-h.pool.x0;__run(2);const w1=h.pool.x1-h.pool.x0,pool=h.pool;hurtMob(h,1e6,WPN.ember,0);__run(.2);const o={grew:w1>w0,cleared:!(pool.life>0)};DG.leave();__run(.4);return o});ok('a bloom\'s poison grows, and destroying the bloom clears it',bl.grew&&bl.cleared,bl);
 // ---- frame rate at full weather against none, in the same arena
 const fps=await p.evaluate(async()=>{lvl=70;DG.god=1;DG.S.opt.cq=2;DG.enter('dragon','normal',{force:true,skipCine:true});await new Promise(r=>setTimeout(r,800));const meas=()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0>2500)r(n/2.5);else requestAnimationFrame(f)};requestAnimationFrame(f)});const off=await meas();DG.clim.start('storm');DG.clim.stage(4);DG.clim.S.int=1;DG.clim.darkness(.6,9);const on=await meas();DG.clim.stop();DG.clim.start('blizzard');DG.clim.stage(4);DG.clim.S.int=1;const on2=await meas();DG.leave();DG.god=0;return{off:Math.round(off),storm:Math.round(on),blizzard:Math.round(on2)}});
 ok('full weather keeps the frame rate (within 15% of none)',fps.storm>=fps.off*.85&&fps.blizzard>=fps.off*.85,fps);
 ok('no errors in the page',errs.length==0,errs.slice(0,6));
 await b.close();console.log(fails?'FAILURES '+fails:'ALL PASSED');process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
