// ===== DG co-op: two real players in one dungeon. The map is the same on both computers (it is built from the dungeon's own seed). The party leader's computer runs the monsters and bosses and sends where they are;
//  the other computer shows copies of them. When a monster attacks, both computers run that attack aimed at the same player, and each computer only ever hurts its own player, so dodging feels the same on both.
//  A blow on a copy is sent to the leader, who decides what it did. If the leader leaves, the other computer takes the monsters over. server/party.js owns who is in the party and pays the run's reward once. =====
try{(()=>{
 const DG=window.DG,A=DG.A,TAU=Math.PI*2,R=Math.random,cl=DG.cl;
 let PT=null,C=null,invite=null;const LS=[];
 const ns=o=>{try{return NET7.send(o)}catch(_){return false}};
 const me=()=>{try{return NET7.auth&&NET7.auth.uid}catch(_){return''}};
 const pg=d=>{if(C)ns({t:'pg',d})};
 const say=(a,b,ms)=>{try{DG.ui.say(a,b||'',ms||2400)}catch(_){}};
 const toast=t=>{try{DG.ui.toast(t)}catch(_){try{window.say&&window.say(t)}catch(_){}}};
 const byN=n=>{for(const m of mobs)if(m.dgx&&m.nid===n)return m;return null};
 const mateOf=()=>PT&&PT.m&&PT.m.find(x=>x.uid!==me());
 const myM=()=>PT&&PT.m&&PT.m.find(x=>x.uid===me());
 function pres(){try{return{x:P.x|0,y:P.y|0,f:P.f,n:myName,h:myHue,vx:0,wp,sw:0,fm:1,hat:wear.hat,wing:wear.wing,boot:wear.boot,glove:wear.glove,body:wear.body,lv:lvl,wo:1,uid:myId,lk:look,cx:celPres()}}catch(_){return{}}}
 function pushInfo(){if(!NET7.online)return;let open=[];try{open=DG.LIST.filter(d=>!DG.lockReason(d.id)).map(d=>d.id)}catch(_){}let wn='';try{const w=WPN[wp];wn=w&&w.n||wp}catch(_){}let wg='';try{const q=curWing(lvl);wg=q&&q.n||''}catch(_){}ns({t:'party',op:'info',d:{lvl:lvl|0,wp:wn,wg,title:(DG.S&&DG.S.titleOn)||'',open,pr:JSON.stringify(pres())}})}

 // ================= the run =================
 const K_HP={regular:1.55,elite:1.7,mini:1.75,boss:1.85,aregular:1.6,aelite:1.75,aboss:1.9};
 // two players do about twice the damage, but they also split up, revive and dodge: enemies get about 1.6 to 1.9 times the health, not double, and each hit stings a little less as there is more to go around
 {const h0=DG.mobHP,d0=DG.mobDmg;DG.mobHP=function(d,cls){const v=h0.apply(this,arguments);return C&&C.scale?v*(K_HP[cls]||1.6):v};DG.mobDmg=function(d,cls){const v=d0.apply(this,arguments);return C&&C.scale?v*.92:v}}
 function begin(pv,go){C={run:go.run,d:go.d,df:go.df,seed:go.seed,leaderUid:go.leader,get guest(){return this.leaderUid!==me()},scale:true,mate:null,mateIn:false,mateOn:true,nid:1,pt:0,st:0,gt:0,rev:0,eH:false,down:false,dealt:0,mdealt:0,ghq:[],groups:{},pz:[],bm:null,claimed:false,fast:false,bt:18,quiet:0,started:performance.now(),hello:0};
  try{DG.page&&DG.page.close()}catch(_){}try{if(DG.run)DG.endRun()}catch(_){}document.body.classList.add('dgduo');
  // the film is the same but may run a different length on each computer: nothing wakes up until both have arrived
  const ok=DG.enter(go.d,go.df,{force:true,duo:true});if(!ok){toast('Could not enter');stop()}return ok}
 function stop(){const c=C;C=null;document.body.classList.remove('dgduo');hudOff();return c}
 const coop={
  get on(){return !!C},get run(){return C&&C.run},get leader(){return !!(C&&!C.guest)},get mirror(){return !!(C&&C.guest)},get mateIn(){return !!(C&&C.mateIn)},get down(){return !!(C&&C.down)},get fast(){return !!(C&&C.fast)},get C(){return C},get party(){return PT},
  get hitMate(){return !!(C&&C.fromMate)},
  hold(r){if(!C||C.guest||!C.mateOn||C.mateIn||C.soloed)return false;if(performance.now()-(C.t0||C.started)>20000)return false;const n=performance.now();if(n-(C.holdT||0)>2500){C.holdT=n;say('WAITING FOR YOUR FRIEND','The fight starts when they arrive',2200)}return true},
  // ---- targets: a monster goes for whoever is nearest, and stays on them for a few seconds so it does not twitch between you
  swap(m){if(!C||C.guest||!C.mate||!C.mateIn||!C.mateOn)return null;const M=C.mate;m.tgT=(m.tgT||0)-1/60;if(M.dn){m.tg=0}else if(C.down){m.tg=1}else if(m.dgb&&C.aggro){m.tg=C.aggro-1}else if(m.own){m.tg=m.own-1}else if(m.tgT<=0||m.tg==null){m.tgT=2.5+R()*1.5;m.tg=Math.hypot(M.x-m.x,M.y-m.y)<Math.hypot(P.x-m.x,P.y-m.y)?1:0}if(m.tg!==1)return null;const sv={x:P.x,y:P.y,g:P.g};P.x=M.x;P.y=M.y;P.g=!M.a;DG.aimed=1;return sv},
  unswap(sv){P.x=sv.x;P.y=sv.y;P.g=sv.g;DG.aimed=0},
  atk(m,a,w){if(!C||C.guest)return;pg({e:'a',n:m.nid,a:a.name,w,tg:m.tg===1?1:0,tx:P.x|0,ty:P.y|0})},
  fire(m,a){if(!C||C.guest)return;pg({e:'f',n:m.nid,a:a.name,tg:m.tg===1?1:0,tx:P.x|0,ty:P.y|0})},
  spawned(m,id,o){if(!C)return;if(C.guest&&!o.net)return;if(C.guest){m.nid=o.net;return}m.nid=++C.nid;if(id[0]=='@'){m.nid=1;return}pg({e:'sp',n:m.nid,id,x:m.x|0,y:(m.y+m.h)|0,o:{hpk:o.hpk||1,dmgk:o.dmgk||1,summon:o.summon?1:0,life:o.life||0,quiet:o.quiet?1:0,own:o.own||0}})},
  stub(id,x,y,o){const def=DG.mobs.DEF[id]||{w:30,h:30};return{k:'dgm_'+id,dgx:def,x,y:y-(def.h||30),w:def.w,h:def.h,hp:1,mhp:1,cd:{},stub:1,fl:0,ph:0,room:DG.run&&DG.run.room}},
  ghosted(m,o,sc){if(!C)return;if(C.guest){C.ghq.push(o.kit||null);return}pg({e:'gh',n:m.nid,sc:sc||.7})},
  died(m){if(!C||C.guest)return;pg({e:'x',n:m.nid,k:m.dead!==2?1:0})},
  out(m){if(!C||C.guest)return;pg({e:'bo'})},
  phase(m){if(!C||C.guest)return;pg({e:'ph',ph:m.phase})},
  roomOn(r){if(!C||C.guest||C.quiet)return;pg({e:'rm',i:DG.L.rooms.indexOf(r),s:1});pull(r)},
  roomDone(r){if(!C||C.guest||C.quiet)return;pg({e:'rm',i:DG.L.rooms.indexOf(r),s:2})},
  want(r){if(!C||!C.guest)return;const i=DG.L.rooms.indexOf(r);const n=performance.now();if(n-(r.wantT||0)<900)return;r.wantT=n;pg({e:'want',i})},
  key(){if(!C||C.quiet)return;pg({e:'k'})},
  gate(q){if(!C||C.quiet)return;pg({e:'g',i:DG.L.gates.indexOf(q)})},
  bossDown(run){if(!C||C.guest)return;ns({t:'party',op:'done',run:C.run})},
  gateBlock(q){if(!C||C.quiet)return false;return DG.duoP?DG.duoP.gateBlock(q):false},
  near(){if(!C||!C.mate||!C.mateIn)return null;const M=C.mate;if(M.dn&&!C.down&&Math.hypot(P.x-M.x,P.y-M.y)<T*3.2)return{t:'Hold '+DG.keyName('use')+' to revive '+((C.mate.pr&&C.mate.pr.n)||'your friend'),go(){}};return DG.duoP?DG.duoP.near():null},
  begun(){if(!C)return;C.t0=performance.now();C.mateIn=false;announce();hudOn()},
  ended(){if(!C)return;hudOff()},
  left(){if(!C)return;ns({t:'party',op:'out',run:C.run});stop()},
  // ---- every frame of a run
  tick(dt){if(!C||!DG.run)return;C.pt-=dt;if(C.pt<=0){C.pt=.066;if(C.hq&&C.hq.size){pg({e:'hits',l:[...C.hq.values()].slice(0,40)});C.hq.clear()}pg({e:'p',x:P.x|0,y:P.y|0,f:P.f,vx:P.vx|0,a:P.g?0:1,s:typeof swing!='undefined'&&swing>0?1:0,hp:P.hp|0,mh:maxHP()|0,dn:C.down?1:0,rv:C.rev>0?+C.rev.toFixed(2):0,wp})}
   C.hello-=dt;if(!C.mateIn&&C.hello<=0){C.hello=1;announce()}
   if(!C.guest){C.st-=dt;if(C.st<=0){C.st=.1;snap()}}
   C.gt-=dt;if(C.gt<=0){C.gt=.25;groupSync()}
   if(C.down){try{for(const k in K)K[k]=0;mdL=false;mdR=false}catch(_){}P.vx=0;P.hp=Math.max(1,P.hp);iT=Math.max(iT,.5);if(P.g===false)P.vy=Math.max(P.vy,60)}
   const M=C.mate;if(M&&M.dn&&!C.down&&C.eH&&Math.hypot(P.x-M.x,P.y-M.y)<T*3.2){C.rev+=dt/3;try{if(!DG.reduced()&&R()<dt*16)VFX.burst(M.x,M.y+20,['#bfffe0','#fff'],1,60,1,.5,4)}catch(_){}if(C.rev>=1){C.rev=0;pg({e:'revive'});toast('You pulled your friend back up');C.revives=(C.revives|0)+1}}else C.rev=Math.max(0,C.rev-dt*2);
   if(!C.guest&&C.down&&M&&M.dn)wipe();
   if(!C.guest&&!C.mateOn&&C.down)selfRise();
   if(DG.duoP)try{DG.duoP.tick(dt)}catch(e){if(!coop.e){coop.e=1;console.error('DG duo',e)}}
   hudTick(dt)},
  mirrorMobs(dt){for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];if(!m.dgx||m.dgb)continue;m.ph+=dt;m.fl-=dt;m.fade=Math.min(1,(m.fade||0)+dt*2);if(m.at>0)m.at-=dt;mirrorOne(m,dt);touch(m,m.dgx.touch||.6,260)}},
  mirrorBoss(m,dt){m.ph+=dt;m.fl-=dt;if(m.at>0)m.at-=dt;if(m.vul>0)m.vul-=dt;mirrorOne(m,dt);if(m.dgx.touch!==0)touch(m,m.dgx.touch||.55,340)},
  draw(c,cx,cy,now){if(!C)return;try{drawMate(c,cx,cy,now);if(DG.duoP)DG.duoP.draw(c,cx,cy,now)}catch(e){if(!coop.de){coop.de=1;console.error('DG mate',e)}}},
  died2(){return died()},
  invite:n=>{pushInfo();ns({t:'party',op:'invite',who:n})},accept(){if(invite){ns({t:'party',op:'accept',id:invite.id});pushInfo();invite=null;invEl()}},decline(){if(invite){ns({t:'party',op:'decline',id:invite.id});invite=null;invEl()}},leave(){ns({t:'party',op:'leave'})},lead(){ns({t:'party',op:'lead'})},start(d,df){pushInfo();ns({t:'party',op:'start',d,df})},
  get full(){return !!(PT&&PT.m&&PT.m.length==2)},get isLead(){return !!(PT&&PT.leader===me())},get inv(){return invite},refresh(){pushInfo();ns({t:'party',op:'state'})},onChange(f){LS.push(f)},pres};
 DG.coop=coop;
 function fireL(){for(const f of LS)try{f()}catch(e){console.error(e)}}
 function announce(){if(C&&DG.run)pg({e:'in',pr:pres(),i:C.mateIn?1:0})}
 const findAtk=(m,name)=>{const def=m.dgx;if(def.atk){for(const L of def.atk)for(const a of L)if(a.name==name)return a}if(m.kit)for(const a of m.kit)if(a.name==name)return a;if(def.kit)for(const a of def.kit)if(a.name==name)return a;return null};
 function aim(e,fn){if(e.tg===1||!C||!C.guest&&0)return fn();const sv={x:P.x,y:P.y};P.x=e.tx;P.y=e.ty;DG.aimed=1;try{fn()}finally{P.x=sv.x;P.y=sv.y;DG.aimed=0}}
 function mirrorOne(m,dt){if(m.sx!=null){const k=Math.min(1,dt*12);m.x+=(m.sx-m.x)*k;m.y+=(m.sy-m.y)*k}m.vx=0;m.vy=0;if(m.st=='wind'){m.tt-=dt}else if(m.st=='rec'){m.tt-=dt;if(m.tt<=0){m.st='idle';m.atk=null}}const def=m.dgx;if(def.tick&&!m.dy)try{def.tick(m,dt,A)}catch(e){if(!def.e){def.e=1;console.error('DG mirror',def.id,e)}}}
 function touch(m,k,kb){if(m.nohit||m.hide>0||C.down)return;if(Math.abs(P.x-m.x)<(P.w+m.w*.8)/2-2&&P.y<m.y+m.h&&P.y+P.h>m.y+m.h*.1)DG.hurtP(m.dmg*k,Math.sign(P.x-m.x||1)*kb)}
 function snap(){const a=[];for(const m of mobs)if(m.dgx&&m.nid&&!m.stub)a.push([m.nid,m.x|0,m.y|0,Math.ceil(m.hp),m.f||1,Math.ceil(m.shield||0),m.hide>0?1:0,m.inv?1:0]);if(a.length)pg({e:'m',a:a.slice(0,48)})}
 function groupSync(){const G=DG.groups;for(const k in G){const v=G[k]&&G[k].on?1:0;if(C.groups[k]===undefined)C.groups[k]=v;if(v&&!C.groups[k]){C.groups[k]=1;pg({e:'grp',k})}}}
 // whoever is outside a room that has just shut is brought in
 function pull(r){if(!r||!DG.run)return;if(P.x<(r.x0+1.5)*T||P.x>(r.x1-1)*T||(r.y0!=null&&P.y+P.h<(r.y0-1)*T)||P.y>(r.fy+1)*T){P.x=(r.x0+3)*T;P.y=r.fy*T-P.h-2;P.vx=P.vy=0;toast('Your friend started the fight')}}
 function rise(){if(!C)return;C.down=false;P.hp=Math.round(maxHP()*.4);iT=Math.max(iT,2.2);say('BACK ON YOUR FEET','',1400);hudTick(1)}
 function selfRise(){C.down=false;P.hp=Math.round(maxHP()*.3);iT=Math.max(iT,2.2)}
 // ---- knocked out: while your friend still stands you wait for them instead of leaving. When both are down the party restarts from the checkpoint
 const diedSolo=DG.flow.died;
 function died(){if(!C||!C.mate||!C.mateIn||!C.mateOn){if(C&&!C.guest&&C.mate)pg({e:'wipe'});return diedSolo.apply(DG.flow,arguments)}
  if(C.down){P.hp=1;return}
  C.down=true;P.hp=1;iT=Math.max(iT,1.5);C.downs=(C.downs|0)+1;try{DG.fx.clear()}catch(_){}say('YOU ARE DOWN','Your friend can revive you',2800);pg({e:'dn'})}
 function wipe(){if(!C)return;C.down=false;C.rev=0;if(C.mate)C.mate.dn=0;if(!C.guest)pg({e:'wipe'});say('THE PARTY HAS FALLEN','Back to the checkpoint',2400);diedSolo.call(DG.flow)}
 DG.flow.died=died;
 // a blow on a copy: the leader decides what it did
 {const _h=hurtMob;hurtMob=function(m,d,w,ang){if(C&&m&&m.dgx){if(m.stub)return;if(C.guest&&!C.fromLead){if(m.inv||m.hide>=1)return;let dm=d;if(w&&d>0){try{if(R()<Math.min(.6,.06+prof.fight.l*.004+bonus().crit))dm=Math.round(d*(1.75+bonus().cdmg))}catch(_){}if(w.fx=='leech')P.hp=Math.min(maxHP(),P.hp+dm*.25);if(w.fx=='heal')P.hp=Math.min(maxHP(),P.hp+3)}if(!(dm>0))return;m.fl=.15;C.dealt+=dm;try{ft(m.x,m.y-10,''+Math.round(dm),'#fff');burst(m.x,m.y+m.h/2,'rgb('+(w&&w.g?w.g:[255,255,255])+')',6,120,3)}catch(_){}{const hq=C.hq||(C.hq=new Map()),q=hq.get(m.nid);if(q){q[1]+=Math.round(dm);q[2]=+(ang||0).toFixed(2);if(w&&w.fx)q[3]=w.fx}else hq.set(m.nid,[m.nid,Math.round(dm),+(ang||0).toFixed(2),w&&w.fx||0])};return}
    if(!C.fromMate&&d>0)C.dealt+=Math.min(d,m.hp)}return _h.apply(this,arguments)}}
 /* the Use key: 00-00-keys.js hands older code the Use key as 'e' and keeps the physical key in e.rbKey (the real E is Skill 2 and never gets here) */const onE=e=>{const uk=(window.RB_KB&&RB_KB.use)||'f',raw=e.rbKey||String(e.key||'').toLowerCase();if(raw===uk){if(C&&!e.repeat)C.eH=e.type=='keydown';if(C&&e.type=='keyup')C.eH=false;if(C&&e.type=='keydown'&&DG.duoP)try{DG.duoP.press()}catch(_){}}};addEventListener('keydown',onE,true);addEventListener('keyup',onE,true);
 // the chest: the server says whether this run has paid you already, so a resend or a dropped connection can never pay twice
 const opChest=DG.rew.open;
 {DG.rew.open=function(q){if(!C||q.kind!='final')return opChest.apply(this,arguments);if(q.open||C.claiming||!DG.run)return;C.claiming=q;C.claimN=0;ns({t:'party',op:'claim',run:C.run});toast('Opening the chest')}}
 // the mate leaves: the one who stays takes over and the monsters shrink to a one-player fight
 function solo(why,leaderUid){if(!C)return;const was=C.guest;if(leaderUid)C.leaderUid=leaderUid;if(C.soloed){if(was&&!C.guest){for(const q of mobs)if(q.dgx){q.sx=null;if(q.st!='idle'){q.st='idle';q.acd=1;q.bt=1;q.atk=null}}toast('You now run the fight')}return}C.soloed=1;C.mateOn=false;C.mateIn=false;C.mate=null;C.scale=false;for(const m of mobs)if(m.dgx&&!m.stub){const k=K_HP[m.dgx.cls||(m.dgb?'boss':'regular')]||1.6;m.mhp/=k;m.hp/=k;m.dmg/=.92;m.sx=null;if(m.st=='wind'||m.st=='rec'){m.st='idle';m.acd=1;m.atk=null;m.bt=1}}if(C.down){C.down=false;P.hp=Math.round(maxHP()*.5);iT=Math.max(iT,2)}if(DG.run&&DG.run.doneBoss&&!C.guest)ns({t:'party',op:'done',run:C.run});if(was&&!C.guest)toast('You now run the fight');say('YOUR FRIEND '+(why=='lost'?'LOST CONNECTION':'LEFT'),'The dungeon has adjusted to one player',3000);hudTick(1)}

 // ================= what comes from the other computer =================
 function fullState(){const L=DG.L,run=DG.run;return{e:'full',rooms:L.rooms.map(r=>r.state),gates:L.gates.map(q=>q.open?1:0),key:!!(L.keyAt&&L.keyAt.got),groups:Object.keys(DG.groups).filter(k=>DG.groups[k]&&DG.groups[k].on),mobs:mobs.filter(m=>m.dgx&&m.nid&&!m.dgb).map(m=>({n:m.nid,id:m.dgx.id,x:m.x|0,y:(m.y+m.h)|0,hp:m.hp,mhp:m.mhp})),boss:(()=>{const m=DG.boss.act;return m?{hp:m.hp,mhp:m.mhp,ph:m.phase}:null})(),done:!!run.doneBoss,nid:C.nid,pz:DG.duoP?DG.duoP.state():null,check:run.check}}
 function onFull(e){const L=DG.L,run=DG.run;if(!L||!run)return;C.quiet=1;try{for(let i=0;i<L.rooms.length;i++){const r=L.rooms[i],s=e.rooms[i];if(s==r.state)continue;if(s=='done'){if(r.state=='on'){DG.flow.clearRoom(r)}else{r.state='done';if(r.doors)for(const q of r.doors)q.on=0}}else if(s=='on'&&r.kind=='fight'){pull(r);DG.flow.startRoom(r)}}
   e.gates.forEach((o,i)=>{const q=L.gates[i];if(o&&q&&!q.open){q.open=true;q.t=2;q.sol.on=0}});if(e.key&&L.keyAt&&!L.keyAt.got)DG.gotKey();for(const k of e.groups||[])if(DG.groups[k])DG.groups[k].on=1;
   for(const q of e.mobs||[])if(!byN(q.n)){const m=DG.mobs.DEF[q.id]&&DG.mobs.spawn(q.id,q.x,q.y,{net:q.n,quiet:1});if(m){m.hp=q.hp;m.mhp=q.mhp}}
   if(e.boss&&!DG.boss.act){const r=L.rooms.find(q=>q.kind=='boss');if(r){C.fast=true;r.state='wait';pull(r);DG.flow.startRoom(r);C.fast=false;const m=DG.boss.act;if(m){m.hp=e.boss.hp;m.mhp=e.boss.mhp;m.phase=e.boss.ph}}}
   /* back after a dropped connection: a boss phase change sent meanwhile was missed */else if(e.boss&&DG.boss.act){const m=DG.boss.act;if(e.boss.ph&&m.phase!==e.boss.ph)try{DG.boss.phaseTo(m,e.boss.ph)}catch(_){}m.hp=e.boss.hp}
   if(DG.duoP&&e.pz)DG.duoP.restore(e.pz);if(e.check)run.check=e.check}finally{C.quiet=0}}
 NET7.on('pg',msg=>{const e=msg.d;if(!e||!C)return;const run=DG.run;const k=e.e;
  if(k=='in'){if(!run)return;const first=!C.mate||!C.mateIn;C.mate=C.mate||{x:e.pr&&e.pr.x||P.x,y:e.pr&&e.pr.y||P.y,dx:P.x,dy:P.y,f:1,vx:0,hp:1,mh:1,dn:0};C.mate.pr=e.pr||C.mate.pr;C.mateIn=true;C.mateOn=true;if(!C.guest&&(first||!e.i))pg(fullState());if(first)say('YOUR FRIEND HAS ARRIVED','',1600);if(!e.i)announce();return}
  if(!run)return;
  if(k=='p'){const M=C.mate||(C.mate={dx:e.x,dy:e.y});M.x=e.x;M.y=e.y;M.f=e.f;M.vx=e.vx;M.a=e.a;M.s=e.s;M.hp=e.hp;M.mh=e.mh;M.dn=e.dn;M.rv=e.rv;M.wp=e.wp;if(M.dx==null){M.dx=e.x;M.dy=e.y}C.mateIn=true;return}
  if(k=='full'){if(C.guest)onFull(e);return}
  if(k=='dn'){if(C.mate){C.mate.dn=1;toast('Your friend is down! Get to them')}return}
  if(k=='revive'){if(C.down)rise();return}
  if(k=='wipe'){if(C.guest)wipe();return}
  if(k=='k'){const L=DG.L;C.quiet=1;try{if(L.keyAt&&!L.keyAt.got){DG.gotKey()}}finally{C.quiet=0}return}
  if(k=='g'){const q=DG.L.gates[e.i];if(q&&!q.open){C.quiet=1;try{DG.tryGate(q)}finally{C.quiet=0};if(!q.open){q.open=true;q.t=0;q.sol.on=0}}return}
  if(k=='grp'){const g=DG.groups[e.k];if(g){g.on=1;C.groups[e.k]=1}return}
  if(k=='want'){if(C.guest)return;const r=DG.L.rooms[e.i];if(r&&r.state=='wait')DG.flow.startRoom(r);return}
  if(k=='pz'||k=='pe'||k=='bm'||k=='pad'){if(DG.duoP)DG.duoP.net(e);return}
  if(!C.guest){if(k=='hits'){for(const q of Array.isArray(e.l)?e.l.slice(0,40):[]){const m=byN(q[0]);if(m&&!m.dead){C.fromMate=true;C.mdealt+=q[1]|0;try{hurtMob(m,q[1]|0,null,+q[2]||0);if(q[3]=='burn')m.burn=3;if(q[3]=='stun'||q[3]=='smash')m.stun=1.5;if(q[3]=='slow')m.slow=3}finally{C.fromMate=false}}}return}if(k=='hit'){const m=byN(e.n);if(m&&!m.dead){C.fromMate=true;C.mdealt+=e.d;try{hurtMob(m,e.d,null,e.a||0);if(e.fx=='burn')m.burn=3;if(e.fx=='stun'||e.fx=='smash')m.stun=1.5;if(e.fx=='slow')m.slow=3}finally{C.fromMate=false}}return}return}
  // ---- only the guest copies these
  if(k=='m'){for(const q of e.a){const m=byN(q[0]);if(!m)continue;m.sx=q[1];m.sy=q[2];m.hp=q[3];m.f=q[4];m.shield=q[5];m.hide=q[6];m.inv=!!q[7]}return}
  if(k=='sp'){if(byN(e.n))return;DG.mobs.spawn(e.id,e.x,e.y,Object.assign({},e.o,{net:e.n,summon:!!e.o.summon,quiet:!!e.o.quiet}));return}
  if(k=='gh'){const m=byN(e.n),b=DG.boss.act;if(m&&b){const dx=b.dgx;m.src=dx;m.sc=e.sc;m.w=dx.w*e.sc;m.h=dx.h*e.sc;const kit=C.ghq.shift();m.dgx=Object.assign({},m.dgx,{kit,tick:null});m.kit=kit;m.k='dgm___ghost'}return}
  if(k=='x'){const m=byN(e.n);if(!m)return;const i=mobs.indexOf(m);if(e.k){run.kills++;if(m.elite){run.elites++;run.corr=Math.max(0,(run.corr||0)-12)}try{mobDrops(m)}catch(_){}try{xpGain('fight',((MK[m.k]&&MK[m.k].gem)||26)*4);stat('kill',1)}catch(_){}try{burst(m.x,m.y+m.h/2,m.dgx.c,18,180,4)}catch(_){}if(m.dgx.onDie)try{m.dgx.onDie(m,A)}catch(_){}}if(i>=0)mobs.splice(i,1);return}
  if(k=='a'){const m=byN(e.n);if(!m)return;const a=findAtk(m,e.a);if(!a)return;m.atk=a;m.st='wind';m.tt=e.w;m.tt0=e.w;if(a.start)aim(e,()=>{try{a.start(m,A)}catch(err){console.error('DG atk',err)}});return}
  if(k=='f'){const m=byN(e.n);if(!m)return;const a=findAtk(m,e.a);if(!a)return;if(a.fire)aim(e,()=>{try{a.fire(m,A)}catch(err){console.error('DG atk',err)}});m.st='rec';m.tt=a.rec==null?.5:a.rec;m.at=.35;if(a.vul)m.vul=a.vul;return}
  if(k=='ph'){const m=DG.boss.act;if(m&&m.phase!==e.ph)DG.boss.phaseTo(m,e.ph);return}
  if(k=='bo'){const m=DG.boss.act;if(m)DG.boss.fall(m);return}
  if(k=='rm'){const r=DG.L.rooms[e.i];if(!r)return;C.quiet=1;try{if(e.s==1&&r.state=='wait'){pull(r);DG.flow.startRoom(r)}else if(e.s==2&&r.state!='done')DG.flow.clearRoom(r)}finally{C.quiet=0}return}});
 // ================= the party, from the server =================
 NET7.on('party',m=>{const op=m.op;
  if(op=='state'){const had=PT;if(C)C.stateAt=Date.now();if(!m.p&&C&&DG.run&&had&&!C.resumed){const mt=(had.m||[]).find(x=>x.uid!==me());if(mt){C.resumed=1;ns({t:'party',op:'resume',mate:mt.uid,run:{id:C.run,d:C.d,df:C.df,seed:C.seed,leader:C.leaderUid}});setTimeout(()=>{if(C)C.resumed=0},8000);return}}PT=m.p;if(!PT&&C&&!DG.run)C=null;fireL();if(m.back&&PT&&PT.run&&!C)rejoin();else if(m.back&&C&&DG.run)announce();return}
  if(op=='err'){toast(m.m||'That did not work');try{window.say&&window.say(m.m)}catch(_){}return}
  if(op=='invited'){invite={id:m.id,from:m.from,lvl:m.lvl,exp:performance.now()+(m.ms||60000)};invEl();setTimeout(()=>{if(invite&&invite.id==m.id){invite=null;invEl()}},m.ms||60000);fireL();return}
  if(op=='sent'){toast('Invitation sent to '+m.to);return}
  if(op=='declined'){toast(m.name+' said no this time');return}
  if(op=='ask'){let why=null;try{why=DG.lockReason(m.d);const d=DG.BY[m.d];if(!why&&d&&!DG.diffOpen(d,m.df))why='Has not finished the difficulty before this one';if(!why&&(DG.run||!entered||(window.MOVIE1&&MOVIE1.on)||document.getElementById('mv1u')))why='Is busy right now'}catch(_){why='Is busy right now'}ns({t:'party',op:'ready',ok:why?0:1,why:why||''});if(why)toast('You cannot enter: '+why);return}
  if(op=='go'){begin(PT,m);return}
  if(op=='mate_off'){if(C){C.mateOn=false;toast(m.name+' lost connection. Waiting for them')}fireL();return}
  if(op=='mate_back'){if(C){C.mateOn=true;toast(m.name+' is back');if(DG.run&&!C.guest)setTimeout(()=>{if(C&&DG.run)pg(fullState())},300);announce()}fireL();return}
  if(op=='mate_out'){toast(m.name+' left the dungeon');if(C&&DG.run)solo('left');fireL();return}
  if(op=='mate_gone'){if(C)solo(m.why,m.leader);fireL();return}
  if(op=='run_done'){return}
  if(op=='reward'){if(!C||m.run!==C.run)return;const q=C.claiming;C.claiming=null;if(!q)return;if(!m.ok){if((C.claimN=(C.claimN|0)+1)<12){C.claiming=q;setTimeout(()=>{if(C&&C.claiming===q)ns({t:'party',op:'claim',run:C.run})},1000)}else toast('The chest would not open. Try again');return}
   q.open=true;const run=DG.run;if(m.dup){toast('You already took this chest');try{DG.ui.results(run,true,[],[],['Your reward was already delivered'])}catch(_){}return}
   q.open=false;const s=DG.S;s.duo=s.duo||{};const rec=s.duo[run.d.id]=s.duo[run.d.id]||{n:0,best:0};rec.n++;const tm=performance.now()-run.t0;if(!rec.best||tm<rec.best)rec.best=tm;run.duo={mine:Math.round(C.dealt),mate:Math.round(C.mdealt),revives:C.revives|0,gems:m.gems|0};if(m.gems>0){gems+=m.gems|0;setTimeout(()=>{try{NET7.send({t:'sync',gems:Math.max(0,(gems|0)+(SHOP7.pend|0))})}catch(_){}},300)}if(m.first){s.titles=s.titles||{};s.titles['Twin Roots']=1;if(run.d.tier=='abyssal')s.titles['Abyss Twins']=1;run.duoFirst=1}
   try{DG.rew.give&&DG.rew.give(719,run.d.tier=='abyssal'?3:1)}catch(_){}DG.save();opChest(q);return}
  if(op=='promote'){if(C){C.leaderUid=m.leader;for(const q of mobs)if(q.dgx){q.sx=null;if(q.st!='idle'){q.st='idle';q.acd=1;q.bt=1;q.atk=null}}}return}});
 // the results say how the two of you did, and the party leaves together rather than running it again from here
 {const res=DG.ui.results;DG.ui.results=function(run,win,loot,first,recs){const f=(first||[]).slice(),rc=(recs||[]).slice();if(run&&run.duoFirst)f.push('First duo clear: the title Twin Roots');if(run&&run.duo){rc.push('You dealt '+run.duo.mine.toLocaleString()+', your friend '+run.duo.mate.toLocaleString()+(run.duo.revives?' · revives '+run.duo.revives:'')+' · +'+run.duo.gems.toLocaleString()+' gems')}res.call(this,run,win,loot,f,rc);if(C){const b=document.querySelector('#dgres .again');if(b)b.style.display='none'}}}
 // back after the page reloaded: rejoin the run the party is still in
 function rejoin(){const r=PT&&PT.run;if(!r||DG.run)return;let n=0;/* the opening film may still be playing: wait for the game, as long as the run lasts */const t=setInterval(()=>{if(!PT||!PT.run||PT.run.id!==r.id||DG.run||C||++n>2400){clearInterval(t);return}if(!entered||window.RB_COVER)return;clearInterval(t);ns({t:'party',op:'rejoin',run:r.id});begin(PT,{run:r.id,d:r.d,df:r.df,seed:r.seed,leader:PT.m.find(x=>x.uid!==me()&&x.on)?PT.m.find(x=>x.uid!==me()).uid:me()})},250)}
 NET7.onHello&&0;
 // back online in the middle of a run: if the server does not say which party we are in within a moment (it restarted and lost it), ask; the 'state' answer resumes it
 {let seen=null;setInterval(()=>{try{const a=NET7.auth;if(NET7.online&&a&&a!==seen){seen=a;if(C&&DG.run){const t0=Date.now();setTimeout(()=>{try{if(C&&DG.run&&!(C.stateAt>t0))ns({t:'party',op:'state'})}catch(_){}},2500)}}}catch(_){}},1000)}
 setInterval(()=>{try{if(NET7.online&&NET7.auth&&NET7.auth.kind!='guest'&&PT)pushInfo()}catch(_){}},15000);

 // ================= on screen: the invitation, the friend's frame, the friend in the world =================
 function invEl(){let e=document.getElementById('dginv');if(!invite){if(e)e.remove();return}if(!e){e=document.createElement('div');e.id='dginv';document.body.appendChild(e)}e.innerHTML='<b></b><small>wants you in a dungeon party</small><div class="act"><button class="yes">Accept</button><button class="no">Decline</button></div>';e.querySelector('b').textContent=invite.from+(invite.lvl?' · Level '+invite.lvl:'');e.querySelector('.yes').onclick=()=>coop.accept();e.querySelector('.no').onclick=()=>coop.decline()}
 let hudE=null,hudKey='';
 function hudOn(){if(!hudE){hudE=document.createElement('div');hudE.id='dgmate';hudE.innerHTML='<b></b><span class="st"></span><div class="hp"><i></i></div>';document.body.appendChild(hudE)}hudE.style.display='block';hudKey=''}
 function hudOff(){if(hudE)hudE.style.display='none'}
 function hudTick(){if(!hudE||!C)return;const M=C.mate,on=!!(M&&C.mateOn),k=on?[M.pr&&M.pr.n,Math.round((M.hp/(M.mh||1))*40),M.dn,M.rv>0].join():C.mateOn?'wait':'off';if(k===hudKey)return;hudKey=k;hudE.classList.toggle('down',!!(on&&M.dn));hudE.querySelector('b').textContent=(M&&M.pr&&M.pr.n)||(mateOf()&&mateOf().name)||'Your friend';hudE.querySelector('.st').textContent=!C.mateOn?'Connection lost':!C.mateIn?'Arriving':M&&M.dn?(M.rv>0?'Being revived':'Down: revive them'):'';hudE.querySelector('.hp i').style.width=(on?cl(M.hp/(M.mh||1),0,1)*100:0)+'%'}
 function drawMate(c,cx,cy,now){const M=C.mate;if(!M||!C.mateIn||M.x==null)return;M.dx+=(M.x-M.dx)*.28;M.dy+=(M.y-M.dy)*.28;const q=M.pr||{},t=now/1000,X=M.dx-cx,Y=M.dy-cy;const g0=c.globalAlpha;if(M.dn)c.globalAlpha=.55;try{const rq=window.RBFXQ?RBFXQ(q):q;drawChar(X,Y,M.f>0?1:-1,+q.h||0,(q.lv?'['+(q.lv|0)+'] ':'')+String(q.n||'Friend').slice(0,14),t,M.vx||0,M.a?1:0,'',M.wp||q.wp||'fist',M.s?.12:0,1,{hat:q.hat,wing:q.wing,boot:q.boot,glove:q.glove,body:q.body,wo:q.wo},0,q.lk,rq)}catch(e){c.fillStyle='#bfeaff';c.fillRect(X-10,Y,20,46)}c.globalAlpha=g0;
  if(M.dn){const u=C.rev>0?C.rev:(M.rv||0);c.save();c.lineWidth=4;c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.arc(X,Y-22,18,0,TAU);c.stroke();c.strokeStyle='#9fffd0';c.beginPath();c.arc(X,Y-22,18,-Math.PI/2,-Math.PI/2+u*TAU);c.stroke();c.fillStyle='#fff';c.font='800 13px system-ui,sans-serif';c.textAlign='center';c.fillText('+',X,Y-17);c.restore()}
  // off screen: a small arrow says which way your friend is
  const vw=cv.width/ZM,vh=cv.height/ZM;if(X<-20||X>vw+20||Y<-40||Y>vh+20){const ax=cl(X,28,vw-28),ay=cl(Y,70,vh-70),an=Math.atan2(Y-ay,X-ax);c.save();c.translate(ax,ay);c.rotate(an);c.fillStyle=M.dn?'#ff8a8a':'rgba(226,214,255,.9)';c.beginPath();c.moveTo(13,0);c.lineTo(-7,-8);c.lineTo(-3,0);c.lineTo(-7,8);c.closePath();c.fill();c.restore()}}
})()}catch(e){console.error('DG coop',e)}
