// ===== GUARD16: every hidden-word letter is protected by a mini-boss, a Letter Warden. Walk near a sealed letter and its warden rises beside
// it; the letter cannot be collected (touch, break or click) until the warden falls. Mid strength, scaled to your level:
//   health  = 400 + 90 L        contact / attack damage = 8 + 0.9 L
// Three simple, readable movement styles, picked per letter:
//   Charger  walks at you, flashes, then dashes in a straight line
//   Hopper   leaps at you in arcs and slams the ground where it lands (stay off the ground or out of reach)
//   Caster   floats, throws three slow orbs, and blinks away after taking a few hits
// Wardens keep near their letter (they walk back if led away) and shrug off most knockback.
// Reward (fits the economy in docs/progression-balance.md): about 3 minutes of income in gems, 3 x (30 + 4.5 L), and 8% of the XP of your
// current level, 0.08 x xpNeed(L), plus class XP. A defeated warden stays defeated (per world, RB_PREFIX + 'rbguard'). No wardens in creative.
const GUARD16=(()=>{
 const TAU=Math.PI*2,R=Math.random;
 const SK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbguard';let S={};
 try{const o=JSON.parse(localStorage.getItem(SK())||'null');if(o&&typeof o=='object')S=o}catch(_){}
 const save=()=>{try{localStorage.setItem(SK(),JSON.stringify(S))}catch(_){}};
 const creative=()=>{try{return !!(typeof RB_CREATIVE!='undefined'&&RB_CREATIVE)||!!CRV8.on}catch(_){return false}};
 const cleared=(w,i)=>(S[w]||[]).includes(i);
 const STY=['charger','hopper','caster'],COL={charger:['#ff7a4a','#ffd0b0','#5a1a0a'],hopper:['#5ad88a','#d8ffe4','#0a3a1a'],caster:['#b48cff','#ece0ff','#2a1050']};
 const hpOf=L=>Math.round(400+90*Math.max(1,L)),dmgOf=L=>Math.round(8+.9*Math.max(1,L));
 const gemsOf=L=>Math.round(3*(30+4.5*Math.max(1,L))),xpOf=L=>Math.round(.08*xpNeed(Math.max(1,L)));
 let alertT=0,wCur=null,wT=0;const G=[],ORB=[];   // live wardens, caster orbs
 const liveG=i=>G.find(g=>g.i==i&&g.m&&g.m.hp>0&&!g.m.dead);
 // in a biome world the warden sleeps until that biome's trial is done (BIOME17)
 const sealed=l=>{try{return BIOME17.sealed(cur,l.i)}catch(_){return false}};
 // ---- is this letter sealed? (WORD9.collect asks before it collects)
 function blocks(w,l){if(creative()||!l||cleared(w,l.i))return false;const g=liveG(l.i);if(!g)spawn(l);const n=performance.now();if(n-alertT>2200){alertT=n;try{say('A Letter Warden guards "'+l.ch+'" — defeat it to free the letter')}catch(_){}try{SFX7.tone(220,180,.25,'square',.03)}catch(_){}}return true}
 // ---- spawning: an open spot on the ground near the letter, else beside you
 // a roomy spot: two tiles of air over solid ground, three columns wide (so you can reach and fight it)
 function airAt(tx,ty){for(let x=tx-1;x<=tx+1;x++)if(solidAt(x,ty)||solidAt(x,ty-1))return false;return solidAt(tx,ty+1)}
 function spot(l){const lx=l.k%W,ly=l.k/W|0,side=Math.sign(P.x/T-lx)||1;for(let r=1;r<=6;r++)for(const s of[side,-side])for(let dy=-4;dy<=4;dy++){const tx=lx+s*r,ty=ly+dy;if(tx>1&&tx<W-2&&ty>2&&ty<H-3&&airAt(tx,ty))return{x:(tx+.5)*T,y:(ty+1)*T}}
  const tx=Math.floor(P.x/T)+(P.f||1)*3;for(let dy=-4;dy<=4;dy++){const ty=Math.floor((P.y+P.h)/T)-1+dy;if(airAt(tx,ty))return{x:(tx+.5)*T,y:(ty+1)*T}}return{x:P.x+(P.f||1)*T*3,y:P.y+P.h}}
 function spawn(l){if(G.some(q=>q.i==l.i&&q.w==cur)||cleared(cur,l.i))return;const st=STY[l.i%3],L=lvl|0,base=st=='caster'?'wraith':'golem',d=MK[base]||{w:46,h:54},sp=spot(l),hp=hpOf(L),w=st=='caster'?40:54,h=st=='caster'?56:64;
  const m={k:base,x:sp.x,y:sp.y-h-2,w,h,vx:0,vy:0,hp,mhp:hp,fl:0,burn:0,slow:0,ph:R()*6,t:1,dir:1,fade:0,g:false,wall:0,elite:1,lg:1};
  try{mobs.push(m)}catch(_){Array.prototype.push.call(mobs,m)}if(!mobs.includes(m))Array.prototype.push.call(mobs,m);
  G.push({i:l.i,ch:l.ch,w:cur,st,m,hx:sp.x,cd:1.6,s:'idle',t:0,hits:0,lastHp:hp,air:false,dmg:dmgOf(L),L});
  try{VFX.burst(m.x,m.y+h/2,COL[st],28,300,1,.9,14);VFX.wave(m.x,m.y+h,COL[st][0],90,.5,1)}catch(_){}try{SFX7.tone(110,70,.7,'sawtooth',.06);SFX7.tone(330,220,.5,'triangle',.03,.1)}catch(_){}
  try{UI6.say6('LETTER WARDEN','It guards the letter "'+l.ch+'"',2200)}catch(_){}}
 // ---- per frame
 // hurting the player the same way monsters do (armour and Guard apply, a short invulnerability after the hit)
 function hurtMe(a,kb){if(iT>0||P.hp<=0||creative())return;P.hp-=a*(1-Math.min(.8,(bonus().arm||0)+(typeof guard!='undefined'&&guard>0?.5:0)));iT=1.1;P.vx=kb||0;P.vy=-300;try{hurtF=.4;shake=Math.max(shake,.1);snd(200,.25,'sine',.04,.6)}catch(_){}}
 function touch(m,pad){return Math.abs(P.x-m.x)<(m.w+P.w)/2+(pad||0)&&P.y<m.y+m.h&&P.y+P.h>m.y}
 function moveX(m,dx){const s=Math.sign(dx);let left=Math.abs(dx);while(left>0){const st=Math.min(4,left)*s,nx=m.x+st+s*m.w/2;if(solidAt(Math.floor(nx/T),Math.floor((m.y+m.h-6)/T))||solidAt(Math.floor(nx/T),Math.floor((m.y+m.h*.4)/T)))return false;m.x+=st;left-=4}return true}
 function tick(dt){if(!entered||creative())return;let L=[];try{L=WORD9.letters;if(!WORD9.hasWord(cur))L=[]}catch(_){L=[]}const got=((WORD9.state.w[cur]||{}).got)||[];
  // wake the warden of a sealed letter when you come close (never while a menu is open, nor in your first seconds in a world)
  if(cur!==wCur){wCur=cur;wT=performance.now()}const busy=performance.now()-wT<4000||(()=>{try{return (typeof INV7!='undefined'&&INV7.isOpen)||UI6.on||(typeof CLS9!='undefined'&&CLS9.isOpen())||dlgOpen}catch(_){return false}})();
  if(!busy)for(const l of L){if(got.includes(l.i)||cleared(cur,l.i)||G.some(q=>q.i==l.i&&q.w==cur)||sealed(l))continue;const x=(l.x+.5)*T,y=(l.y+.5)*T;if(Math.abs(P.x-x)<T*8&&Math.abs(P.y-y)<T*6)spawn(l)}
  for(let i=G.length-1;i>=0;i--){const g=G[i],m=g.m;
   if(g.w!==cur){G.splice(i,1);continue}
   if(m.hp<=0||m.dead||!mobs.includes(m)){if(m.hp<=0||m.dead)reward(g);G.splice(i,1);continue}
   if(Math.abs(m.x-P.x)>T*32){m.dead=1;m.hp=0;const k=mobs.indexOf(m);if(k>=0)mobs.splice(k,1);G.splice(i,1);continue}   // left behind: it returns, healed, next time
   g.t+=dt;g.cd-=dt;const dir=Math.sign(P.x-m.x)||1;
   if(m.hp<g.lastHp){g.hits++;g.lastHp=m.hp}
   // heavy: most knockback is shrugged off; stay near the letter
   if(g.s!='dash'&&Math.abs(m.vx)>220)m.vx*=.6;if(Math.abs(m.x-g.hx)>T*7&&g.s!='dash'){m.vx=Math.sign(g.hx-m.x)*120}
   if(g.st=='charger'){if(g.s=='idle'&&g.cd<=0&&Math.abs(P.x-m.x)<T*9){g.s='wind';g.t=0;g.dir=dir;m.vx=0}
    else if(g.s=='wind'){m.vx=0;if(g.t>.6){g.s='dash';g.t=0;try{SFX7.tone(160,90,.3,'sawtooth',.05)}catch(_){}}}
    else if(g.s=='dash'){if(!moveX(m,g.dir*600*dt)||g.t>.55){g.s='idle';g.cd=2.6+R();try{shake=Math.max(shake,QM.reduce?0:.06)}catch(_){}}if(touch(m,4))try{hurtMe(Math.round(g.dmg*1.4),g.dir*420)}catch(_){}}}
   else if(g.st=='hopper'){const grounded=solidAt(Math.floor(m.x/T),Math.floor((m.y+m.h+2)/T));
    if(g.s=='idle'&&g.cd<=0&&grounded){g.s='jump';g.t=0;m.vy=-600;g.dir=dir;g.air=true;try{SFX7.tone(260,420,.2,'triangle',.04)}catch(_){}}
    else if(g.s=='jump'){moveX(m,g.dir*Math.min(260,Math.abs(P.x-m.x)*1.6+40)*dt);if(g.t>.25&&grounded){g.s='idle';g.cd=2.1+R()*.6;slam(g)}}}
   else if(g.st=='caster'){
    if(g.cd<=0&&Math.abs(P.x-m.x)<T*10){g.cd=2.4;for(let j=-1;j<=1;j++){const a=Math.atan2(P.y+P.h/2-(m.y+m.h/2),P.x-m.x)+j*.22;ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(a)*250,vy:Math.sin(a)*250,t:0,g})}try{SFX7.tone(700,400,.3,'sine',.035)}catch(_){}}
    if(g.hits>=3){g.hits=0;const nx=g.hx+(R()<.5?-1:1)*T*(2+R()*2);puff(m);m.x=nx;puff(m);try{SFX7.tone(1400,500,.2,'triangle',.03)}catch(_){}}}
   if(g.s!='dash'&&touch(m)&&R()<dt*2)try{hurtMe(g.dmg,dir*260)}catch(_){}}
  for(let i=ORB.length-1;i>=0;i--){const o=ORB[i];o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.t>3.2||solidAt(Math.floor(o.x/T),Math.floor(o.y/T))){ORB.splice(i,1);continue}
   if(Math.abs(o.x-P.x)<P.w/2+8&&o.y>P.y&&o.y<P.y+P.h){try{hurtMe(Math.round(o.g.dmg*.8),Math.sign(o.vx)*200)}catch(_){}ORB.splice(i,1)}}}
 function slam(g){const m=g.m,y=m.y+m.h;try{VFX.wave(m.x,y,COL.hopper[0],T*2.4,.4,1);VFX.burst(m.x,y,COL.hopper,14,240,1,.6,10);shake=Math.max(shake,QM.reduce?0:.1)}catch(_){}try{SFX7.tone(90,55,.4,'sawtooth',.06)}catch(_){}
  if(Math.abs(P.x-m.x)<T*2.3&&Math.abs(P.y+P.h-y)<T*.8)try{hurtMe(g.dmg,Math.sign(P.x-m.x)*380)}catch(_){}}
 function puff(m){try{VFX.burst(m.x,m.y+m.h/2,COL.caster,14,200,1,.5,10)}catch(_){}}
 function reward(g){if(g.paid)return;g.paid=1;const w=g.w;(S[w]||(S[w]=[])).includes(g.i)||S[w].push(g.i);save();const L=lvl|0,gm=gemsOf(L),xp2=xpOf(L),x=g.m.x,y=g.m.y+g.m.h/2;
  gems+=gm;try{stat('gems',gm)}catch(_){}try{xpGain('fight',xp2)}catch(_){}try{const c=CLASS7.cur();if(c)CLASS7.gainXp(c,40+L)}catch(_){}
  try{const q=REW8;q.celebrate(x,y,COL[g.st][0],{d:1.6,s:1,n:30});q.fly(x,y,gm);q.fan('discover');q.card({kind:'guard',kick:'Letter Warden defeated',title:'The letter "'+g.ch+'" is free',gems:gm,xp:xp2,tier:2})}catch(_){try{say('Letter Warden defeated! +'+gm+' gems, +'+xp2+' XP')}catch(__){}}
  try{SFX7.tone(523,523,.2,'triangle',.05);SFX7.tone(784,784,.25,'triangle',.05,.1);SFX7.tone(1047,1047,.4,'sine',.05,.2)}catch(_){}}
 // ---- drawing: the warden (a rune golem with its letter glowing on the chest), its health bar, seals on guarded letters, caster orbs
 {const _dm=drawMob;drawMob=function(m,now){if(!m||!m.lg)return _dm.apply(this,arguments);const g=G.find(q=>q.m===m);try{drawG(m,g,now/1000)}catch(e){if(!drawMob.e){drawMob.e=1;console.error('GUARD16 draw',e)}}}}
 function drawG(m,gd,t){const x=m.x-cam.x,y=m.y-cam.y,st=gd?gd.st:'charger',c=COL[st],ch=gd?gd.ch:'?',flash=gd&&gd.s=='wind'&&Math.floor(t*14)%2,bob=st=='caster'?Math.sin(t*2)*4:0;if(gd)gd.bob=bob;
  const cx=x,top=y+bob,A=MYART,G2=g;
  // aura
  const gr=G2.createRadialGradient(cx,top+m.h*.5,4,cx,top+m.h*.5,m.h);gr.addColorStop(0,A.rgba(c[0],.35));gr.addColorStop(1,A.rgba(c[0],0));G2.fillStyle=gr;G2.fillRect(cx-m.h,top-m.h*.5,m.h*2,m.h*2);
  G2.save();G2.lineJoin='round';G2.strokeStyle=A.OL;G2.lineWidth=2;
  if(st=='caster'){G2.beginPath();G2.moveTo(cx-m.w*.5,top+m.h);G2.quadraticCurveTo(cx-m.w*.6,top+m.h*.3,cx,top+m.h*.12);G2.quadraticCurveTo(cx+m.w*.6,top+m.h*.3,cx+m.w*.5,top+m.h);for(let i=0;i<4;i++)G2.lineTo(cx+m.w*.5-(i+1)*m.w/4,top+m.h+(i%2?0:7));G2.closePath()}
  else{G2.beginPath();G2.roundRect(cx-m.w*.5,top+m.h*.22,m.w,m.h*.62,10);G2.roundRect(cx-m.w*.5-8,top+m.h*.25,12,m.h*.4,5);G2.roundRect(cx+m.w*.5-4,top+m.h*.25,12,m.h*.4,5);G2.roundRect(cx-m.w*.32,top+m.h*.8,12,m.h*.2,4);G2.roundRect(cx+m.w*.32-12,top+m.h*.8,12,m.h*.2,4)}
  const bg=G2.createLinearGradient(cx-m.w/2,0,cx+m.w/2,0);bg.addColorStop(0,A.mix(c[2],'#000000',.2));bg.addColorStop(.5,flash?'#ffffff':A.mix(c[2],c[0],.35));bg.addColorStop(1,A.mix(c[2],'#000000',.3));G2.fillStyle=bg;G2.fill();G2.stroke();
  // head
  G2.beginPath();G2.roundRect(cx-m.w*.28,top,m.w*.56,m.h*.26,8);G2.fillStyle=A.mix(c[2],c[0],.25);G2.fill();G2.stroke();G2.fillStyle=c[1];for(const s of[-1,1]){G2.beginPath();G2.ellipse(cx+s*m.w*.12,top+m.h*.13,3.2,2.2,0,0,TAU);G2.fill()}
  // the letter on the chest, rainbow like the letter blocks
  const ly=top+m.h*.5;G2.beginPath();G2.arc(cx,ly,13,0,TAU);const rg=G2.createLinearGradient(cx-13,ly-13,cx+13,ly+13);['#ff6a8a','#ffb84a','#ffe86a','#6aff9a','#5ad0ff','#b07aff'].forEach((q,i)=>rg.addColorStop(i/5,q));G2.fillStyle=rg;G2.fill();G2.stroke();
  G2.fillStyle='#1a1028';G2.font="900 16px Montserrat,'Segoe UI',sans-serif";G2.textAlign='center';G2.textBaseline='middle';G2.fillText(ch,cx,ly+1);
  for(let i=0;i<3;i++){const q=t*1.5+i*TAU/3;A.crystal(G2,cx+Math.cos(q)*m.w*.55,top-6+Math.sin(q)*5,9,0,i%2?c[1]:c[0])}
  G2.restore();
  // health bar + name
  const hw=Math.max(60,m.w*1.4),fr=Math.max(0,m.hp/(m.mhp||1)),bx=cx-hw/2,by=top-20;G2.save();G2.fillStyle='rgba(10,8,16,.8)';G2.beginPath();G2.roundRect(bx-2,by-2,hw+4,9,4);G2.fill();G2.fillStyle=c[0];G2.fillRect(bx,by,hw*fr,5);
  G2.font="700 10px Montserrat,'Segoe UI',sans-serif";G2.textAlign='center';G2.fillStyle='#fff';G2.fillText('Warden of "'+ch+'"',cx,by-6);G2.restore()}
 // seals on guarded letters (a turning rune ring and two chains) and the caster's orbs; drawn over the world
 function draw(g2,cx,cy){if(!entered||creative())return;let L=[];try{L=WORD9.hasWord(cur)?WORD9.letters:[]}catch(_){}const got=((WORD9.state.w[cur]||{}).got)||[],t=performance.now()/1000,vw=cv.width/ZM,vh=cv.height/ZM;
  for(const l of L){if(got.includes(l.i)||cleared(cur,l.i))continue;const x=(l.x+.5)*T-cx,y=(l.y+.5)*T-cy;if(x<-60||y<-60||x>vw+60||y>vh+60)continue;g2.save();g2.translate(x,y);g2.rotate(t*.8);g2.strokeStyle='rgba(255,90,120,.85)';g2.lineWidth=2;g2.beginPath();g2.arc(0,0,T*.72,0,TAU);g2.stroke();
   for(let i=0;i<6;i++){const q=i/6*TAU;MYART.rune(g2,Math.cos(q)*T*.72,Math.sin(q)*T*.72,4,'rgba(255,200,210,.95)',q,i)}g2.restore();g2.save();g2.strokeStyle='rgba(200,200,220,.8)';g2.lineWidth=2.4;g2.setLineDash([5,3]);for(const s of[-1,1]){g2.beginPath();g2.moveTo(x-T*.5,y+s*T*.5);g2.lineTo(x+T*.5,y-s*T*.5);g2.stroke()}g2.restore();
   const gd=liveG(l.i);if(gd){g2.save();g2.globalCompositeOperation='lighter';g2.strokeStyle='rgba(255,120,150,'+(.35+.25*Math.sin(t*6))+')';g2.lineWidth=2;g2.beginPath();g2.moveTo(x,y);g2.lineTo(gd.m.x-cx,gd.m.y+gd.m.h*.5+(gd.bob||0)-cy);g2.stroke();g2.restore()}}
  g2.save();g2.globalCompositeOperation='lighter';for(const o of ORB){const gr=g2.createRadialGradient(o.x-cx,o.y-cy,0,o.x-cx,o.y-cy,12);gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,COL.caster[0]);gr.addColorStop(1,'rgba(180,140,255,0)');g2.fillStyle=gr;g2.beginPath();g2.arc(o.x-cx,o.y-cy,12,0,TAU);g2.fill()}g2.restore()}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('GUARD16',e)}}};BOSS6.drawProj=function(g2,cx,cy){_d.call(this,g2,cx,cy);try{draw(g2,cx,cy)}catch(e){if(!draw.e){draw.e=1;console.error('GUARD16 draw',e)}}}}
 return{blocks,cleared,spawn,clear(w,i){(S[w]||(S[w]=[])).includes(i)||S[w].push(i);save()},get live(){return G.slice()},get orbs(){return ORB.length},hpOf,dmgOf,gemsOf,xpOf,STY}})();
