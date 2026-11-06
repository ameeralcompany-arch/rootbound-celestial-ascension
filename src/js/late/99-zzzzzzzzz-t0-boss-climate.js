// ===== DG.clim: a boss's weather. Six presets (storm, blizzard, inferno, eclipse, arcane, blight), four intensities that follow the boss's phases, and real effects on play:
// wind that pushes you and bends shots, lightning that strikes where it warned, ice that slides, darkness that narrows your sight, low gravity. Every effect that can hurt you
// is warned on screen and by sound first, lasts a set time and has a cooldown; the hurting itself always goes through DG.fx, so telegraphs, damage and co-op stay the same as every
// other attack. Graphics quality changes how much is drawn, never what can hit you. Drawn in two passes around the hazards (p1-dg-world.js), so weather never hides a warning. =====
try{(()=>{
 const DG=window.DG,fx=DG.fx,R=Math.random,TAU=Math.PI*2,rn=(a,b)=>a+R()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v;
 const O=()=>DG.S.opt,flashOK=()=>O().flash!==0,quality=()=>{if(DG.reduced())return 0;const c=O().cq;return c==null?2:cl(+c|0,0,2)};
 // ---- presets: how each climate looks, sounds and plays
 const PRE={
  storm:{n:'Thunderstorm',tint:'#0c1426',ta:.42,part:'rain',pc:'#bcd2ff',wind:70,clouds:'#0a1020',sheen:'#9ab8ff',amb:'storm'},
  blizzard:{n:'Blizzard',tint:'#cfe6ff',ta:.2,part:'snow',pc:'#f4fbff',wind:110,white:1,frost:1,amb:'blizzard'},
  inferno:{n:'Infernal sky',tint:'#5a0c02',ta:.38,part:'ash',pc:'#ffa04a',wind:30,heat:1,amb:'inferno'},
  eclipse:{n:'Void eclipse',tint:'#05020c',ta:.45,part:'mote',pc:'#b48aff',wind:0,eclipse:1,amb:'void'},
  arcane:{n:'Arcane storm',tint:'#1a0a3a',ta:.3,part:'spark',pc:'#a8ffe8',wind:20,crystals:1,amb:'arcane'},
  blight:{n:'Corrupted grove',tint:'#0c2410',ta:.34,part:'spore',pc:'#b6ff7a',wind:15,mist:'#4f7a2e',amb:'blight'}};
 const STAGE=[0,.2,.5,.78,1];   // intensity per phase (1-4)
 const S={on:false,pre:null,k:'',stage:0,int:0,tgt:0,t:0,wind:0,gust:null,flash:0,bolts:[],dark:0,darkT:0,darkV:0,white:0,rods:[],shots:[],calm:0,frozen:0,jumps:0,lowG:0,cr:[]};
 // ---- the weather's sound: noise and drones on the ambience volume, so the boss's voice and music stay clear
 let AC=null,bus=null,nb=null,layers={};
 const vol=()=>{try{return Math.max(0,Math.min(1,(OPT.av==null?1:+OPT.av)*(OPT.sv==null?1:+OPT.sv)))}catch(_){return .8}};
 function ac(){if(AC)return AC;try{AC=new (window.AudioContext||window.webkitAudioContext)();bus=AC.createGain();bus.gain.value=0;bus.connect(AC.destination);const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=R()*2-1;l=(l+.02*w)/1.02;d[i]=w*.6+l*3}nb=b}catch(_){AC=null}return AC}
 function noise(type,f,q){const s=AC.createBufferSource();s.buffer=nb;s.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||.7;const g=AC.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(bus);s.start();return{s,fl,g}}
 function drone(f,type){const o=AC.createOscillator();o.type=type||'sine';o.frequency.value=f;const g=AC.createGain();g.gain.value=0;o.connect(g);g.connect(bus);o.start();return{s:o,g}}
 const REC={storm:()=>({rain:noise('highpass',1400,.5),wind:noise('bandpass',380,.8),low:noise('lowpass',90,.7)}),blizzard:()=>({wind:noise('bandpass',620,1.4),hiss:noise('highpass',3200,.4),low:noise('lowpass',120,.7)}),
  inferno:()=>({rumble:noise('lowpass',110,.9),fire:noise('bandpass',900,.6),d:drone(43,'sawtooth')}),void:()=>({d1:drone(41,'sine'),d2:drone(41.7,'triangle'),air:noise('lowpass',260,.6)}),
  arcane:()=>({sh:drone(880,'sine'),sh2:drone(1318,'sine'),air:noise('bandpass',2400,2)}),blight:()=>({wind:noise('bandpass',300,.6),bub:noise('lowpass',180,1.4),d:drone(55,'triangle')})};
 const LEVEL={rain:.5,wind:.42,low:.35,hiss:.18,rumble:.6,fire:.25,d:.06,d1:.09,d2:.06,air:.22,sh:.012,sh2:.008,bub:.3};
 function soundOn(k){if(!ac())return;try{if(AC.state=='suspended')AC.resume()}catch(_){}soundOff(0);try{layers=REC[k]?REC[k]():{}}catch(_){layers={}}}
 function soundOff(sec){const L=layers;layers={};if(!AC)return;const t=AC.currentTime;for(const n in L){const q=L[n];try{q.g.gain.cancelScheduledValues(t);q.g.gain.setValueAtTime(q.g.gain.value,t);q.g.gain.linearRampToValueAtTime(0,t+(sec||.01));setTimeout(()=>{try{q.s.stop();q.s.disconnect();q.g.disconnect()}catch(_){}},(sec||.01)*1000+80)}catch(_){}}}
 function soundTick(){if(!AC||!bus)return;const t=AC.currentTime,v=vol()*S.int;try{bus.gain.setTargetAtTime(v*.55,t,.4)}catch(_){}for(const n in layers){const q=layers[n],base=LEVEL[n]||.2;let k=base;if(n=='wind')k=base*(.5+.5*Math.min(1,Math.abs(S.wind)/140))*(S.gust?1.6:1);if(n=='sh'||n=='sh2')k=base*(1+.5*Math.sin(S.t*2+(n=='sh'?0:1.3)));try{q.g.gain.setTargetAtTime(k,t,.3)}catch(_){}}}
 // a single sound: thunder rolls in after a short, natural delay (farther strikes arrive later)
 function boom(kind,delay,size){if(!ac())return;const t=AC.currentTime+(delay||0),v=vol()*(size||1);try{const s=AC.createBufferSource();s.buffer=nb;const f=AC.createBiquadFilter(),g=AC.createGain();f.type='lowpass';f.frequency.setValueAtTime(kind=='crack'?2400:900,t);f.frequency.exponentialRampToValueAtTime(kind=='crack'?300:60,t+(kind=='crack'?.5:2.2));g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9*v,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+(kind=='crack'?.7:2.6));s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+3)}catch(_){}}
 function whoosh(){if(!ac())return;const t=AC.currentTime,v=vol();try{const s=AC.createBufferSource();s.buffer=nb;const f=AC.createBiquadFilter(),g=AC.createGain();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(1400,t+1.1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5*v,t+.8);g.gain.linearRampToValueAtTime(0,t+1.4);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t);s.stop(t+1.5)}catch(_){}}
 // ---- control
 function start(k){const p=PRE[k];if(!p)return;S.on=true;S.k=k;S.pre=p;S.stage=1;S.tgt=STAGE[1];S.int=Math.max(S.int,.02);S.calm=0;S.rods.length=0;S.bolts.length=0;S.cr.length=0;S.gust=null;S.dark=S.darkV=S.white=0;S.frozen=0;S.lowG=0;soundOn(p.amb)}
 function stage(n){if(!S.on)return;S.stage=cl(n|0,1,4);S.tgt=STAGE[S.stage]}
 function stop(){S.on=false;S.pre=null;S.int=S.tgt=0;S.gust=null;S.rods.length=0;S.bolts.length=0;S.cr.length=0;S.shots.length=0;S.frozen=0;S.dark=S.darkV=S.white=0;S.lowG=0;soundOff(.6)}
 // the climate calms over sec seconds after a boss falls
 function calm(sec){if(!S.on)return;S.calm=sec||4;S.calm0=S.calm;S.tgt=0;S.gust=null;S.frozen=0;S.lowG=0;S.darkT=0}
 // lightning: a warned strike at x (on the floor of the arena). o:{tel,r,dmg,c}
 function strike(x,o={}){const f=DG.A.fl(),r=o.r||T*1.5;const z=fx.c(x,f-r*.6,r,o.tel==null?1.15:o.tel,.28,{c:o.c||'#cfe0ff',dmg:o.dmg||0,kind:'bolt',boom:0,snd:0});z.on=()=>{bolt(x,f);for(const q of S.rods)if(Math.abs(q.x-x)<r+T*.6)charge(q)};return z}
 function bolt(x,y){const pts=[];let px=x+rn(-T*2,T*2),py=(cam.y||0)-20;pts.push([px,py]);const n=9;for(let i=1;i<=n;i++){const u=i/n;pts.push([x+(1-u)*rn(-T*1.6,T*1.6)+rn(-12,12),py+(y-py)*u])}S.bolts.push({pts,life:.28,x,y});S.flash=Math.max(S.flash,flashOK()?.55:.1);DG.shk(.12);boom('crack',0,.9);boom('thunder',rn(.25,.9),.8);try{if(!DG.reduced())VFX.burst(x,y-6,['#e8f0ff','#9ab8ff'],10,220,1,.5,10)}catch(_){}}
 // lightning rods: a strike next to one charges it, and a charged rod throws that lightning at the boss
 function rod(x){const q={x,y:DG.A.fl(),ch:0,t:0};S.rods.push(q);return q}
 function charge(q){if(q.ch>0)return;q.ch=1;q.t=.9;DG.ui.toast('The rod is charged!');boom('crack',0,.6)}
 // wind: a gust, warned by streaming arrows and a rising whoosh, then a push for sec seconds. You can always walk against it
 function gust(dir,sec,tel){S.gust={d:dir||1,t:sec||2.6,tel:tel==null?1.2:tel,tel0:tel==null?1.2:tel};whoosh();try{DG.ui.toast(dir>0?'The wind turns → hold on':'← The wind turns, hold on')}catch(_){}}
 // darkness: sight shrinks to a circle around you. v 0..1, sec seconds. Warnings are drawn over it
 function darkness(v,sec){S.darkV=cl(v,0,.85);S.darkT=sec||5}
 function whiteout(v,sec){S.white=cl(v,0,.7);S.darkT=Math.max(S.darkT,sec||5)}
 // frozen in place: jump to break out (four presses), or wait it out. Never longer than sec
 function freeze(sec){if(S.frozen>0)return;S.frozen=sec||1.8;S.jumps=0;S.fx=P.x;S.fy=P.y;DG.ui.toast('Frozen! Press jump to break free');try{DG.music.sfx('freeze',.7)}catch(_){}}
 addEventListener('keydown',e=>{if(S.frozen>0&&!e.repeat&&/^( |w|W|ArrowUp|Space)$/.test(e.key==' '?' ':e.key)){if(++S.jumps>=4){S.frozen=0;try{VFX.shatter(P.x,P.y+P.h/2,['#dff6ff','#fff'],14)}catch(_){}}}},true);
 function lowGravity(sec){S.lowG=sec||4;DG.ui.toast('Gravity weakens: your jumps go higher')}
 // boss shots bend with the wind
 {const _s=fx.shot;fx.shot=function(){const q=_s.apply(this,arguments);try{if(S.on&&S.pre&&S.pre.wind)S.shots.push(q);if(S.shots.length>80)S.shots.shift()}catch(_){}return q}}
 // ---- every frame
 function tick(dt){if(!S.on)return;S.t+=dt;if(S.calm>0){S.calm-=dt;if(S.calm<=0){stop();return}}S.int+=(S.tgt-S.int)*Math.min(1,dt*(S.calm>0?1.2:.7));
  const p=S.pre;let w=p.wind*S.int*(Math.sin(S.t*.35)*.5+.5);
  if(S.gust){const g=S.gust;if(g.tel>0)g.tel-=dt;else{g.t-=dt;w=g.d*(130+70*S.int);if(!DG.locked&&!(S.frozen>0)){const nx=P.x+g.d*95*dt,tx=Math.floor((nx+g.d*P.w/2)/T),ty=Math.floor((P.y+P.h*.5)/T);if(!solidAt(tx,ty)&&!solidAt(tx,Math.floor((P.y+4)/T)))P.x=nx}if(g.t<=0)S.gust=null}}
  S.wind+=(w-S.wind)*Math.min(1,dt*2);
  for(let i=S.shots.length-1;i>=0;i--){const q=S.shots[i];if(!(q.l>0)){S.shots.splice(i,1);continue}q.vx+=S.wind*.9*dt}
  if(S.darkT>0){S.darkT-=dt;S.dark+=(Math.max(S.darkV,S.white)-S.dark)*Math.min(1,dt*3);if(S.darkT<=0){S.darkV=0;S.white=0}}else S.dark*=Math.pow(.2,dt);
  if(S.frozen>0){S.frozen-=dt;P.x=S.fx;P.y=Math.min(P.y,S.fy);P.vx=0;if(P.vy<0)P.vy=0}
  if(S.lowG>0){S.lowG-=dt;P.dgGrav=.5}
  S.flash=Math.max(0,S.flash-dt*2.6);for(let i=S.bolts.length-1;i>=0;i--){S.bolts[i].life-=dt;if(S.bolts[i].life<=0)S.bolts.splice(i,1)}
  for(const q of S.rods)if(q.ch>0){q.t-=dt;if(q.t<=0){q.ch=0;const m=DG.boss.act;if(m&&m.hp>0){bolt(m.x,m.y+m.h);m.stun=Math.max(m.stun||0,2.4);m.vul=Math.max(m.vul||0,3.2);m.hp-=m.mhp*.035;m.fl=.3;DG.ui.toast('The lightning strikes the boss! It is open');try{DG.run.rods=(DG.run.rods|0)+1}catch(_){}}}}
  soundTick()}
 // ---- drawing. Particles live in fixed pools, so nothing is allocated while you fight
 const POOL=640,px=new Float32Array(POOL),py=new Float32Array(POOL),pz=new Float32Array(POOL),pp=new Float32Array(POOL);let seeded=false;
 const COUNT=[110,260,520];
 function seed(vw,vh){for(let i=0;i<POOL;i++){px[i]=R()*vw;py[i]=R()*vh;pz[i]=.4+R()*.9;pp[i]=R()*TAU}seeded=true}
 let blob=null,vig=null,vigW=null;const glow=c=>{const k='g'+c;if(glow[k])return glow[k];const s=document.createElement('canvas');s.width=s.height=128;const x=s.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return glow[k]=s};
 function vignette(white){const k=white?'w':'d';if(white?vigW:vig)return white?vigW:vig;const s=document.createElement('canvas');s.width=s.height=512;const x=s.getContext('2d'),gr=x.createRadialGradient(256,256,60,256,256,256);const col=white?'235,246,255':'2,0,8';gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(.55,'rgba('+col+',.55)');gr.addColorStop(1,'rgba('+col+',1)');x.fillStyle=gr;x.fillRect(0,0,512,512);if(white)vigW=s;else vig=s;return s}
 // behind the warnings: the sky's colour, clouds, the eclipse, darkness
 function back(c,cx,cy,now,vw,vh){if(!S.on||S.int<.01)return;const p=S.pre,I=S.int,q=quality(),t=S.t;c.save();c.setTransform(c.getTransform());
  c.globalAlpha=p.ta*I;c.fillStyle=p.tint;c.fillRect(0,0,vw,vh);
  if(p.clouds&&q>0){c.globalAlpha=.55*I;const n=q==2?7:4;for(let i=0;i<n;i++){const x=((i*vw/n*1.3+t*(12+S.wind*.25)*(1+i%3*.3))%(vw*1.3))-vw*.15,y=vh*(.05+.08*(i%3)),s=vw*.42;c.drawImage(glow(p.clouds),x-s/2,y-s*.3,s,s*.6)}}
  if(p.eclipse){const X=vw*.78,Y=vh*.16,r=Math.min(vw,vh)*.075*(1+S.stage*.1);c.globalAlpha=I;c.globalCompositeOperation='lighter';c.drawImage(glow('#b48aff'),X-r*3.4,Y-r*3.4,r*6.8,r*6.8);c.globalCompositeOperation='source-over';c.fillStyle='#ffe9c8';c.beginPath();c.arc(X,Y,r,0,TAU);c.fill();c.fillStyle='#020006';c.beginPath();c.arc(X+r*(1.3-Math.min(1,S.stage/4+I*.1)*1.3),Y,r*1.02,0,TAU);c.fill()}
  if(p.heat&&q>0){c.globalAlpha=.06*I;c.strokeStyle='#ffd0a0';c.lineWidth=2;for(let i=0;i<(q==2?14:6);i++){const x=(i*97+t*20)%vw;c.beginPath();for(let y=vh;y>vh*.35;y-=18){c.lineTo(x+Math.sin(y*.05+t*3+i)*6,y)}c.stroke()}}
  if(p.mist){c.globalAlpha=.5*I;const g=c.createLinearGradient(0,vh*.62,0,vh);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,p.mist);c.fillStyle=g;c.fillRect(0,vh*.62,vw,vh*.38)}
  if(p.sheen){c.globalAlpha=.18*I;const fy=DG.A.fl()-cy;c.fillStyle=p.sheen;c.fillRect(0,fy-2,vw,3)}
  if(p.frost){const fy=DG.A.fl()-cy;c.globalAlpha=.7*I;c.fillStyle='#e6f6ff';c.fillRect(0,fy-2-5*I,vw,4+5*I)}
  // darkness around you, or a white-out; warnings are drawn after this
  if(S.dark>.01){const W=S.white>0,v=vignette(W),X=P.x-cx,Y=P.y+P.h/2-cy,rad=T*(13-9*S.dark);c.globalAlpha=Math.min(.94,S.dark+.1);c.drawImage(v,X-rad,Y-rad,rad*2,rad*2);c.fillStyle=W?'rgb(235,246,255)':'rgb(2,0,8)';c.fillRect(0,0,vw,Math.max(0,Y-rad));c.fillRect(0,Y+rad,vw,vh);c.fillRect(0,Y-rad,Math.max(0,X-rad),rad*2);c.fillRect(X+rad,Y-rad,vw,rad*2)}
  // lightning rods, and the crystals of an arcane storm
  for(const r of S.rods){const X=r.x-cx,Y=r.y-cy;c.globalAlpha=1;c.fillStyle='#3a4458';c.fillRect(X-4,Y-T*3,8,T*3);c.fillStyle='#c8d8ff';c.beginPath();c.moveTo(X,Y-T*3.6);c.lineTo(X-6,Y-T*3);c.lineTo(X+6,Y-T*3);c.fill();if(r.ch>0){c.globalCompositeOperation='lighter';c.globalAlpha=.6+.4*Math.sin(now/40);c.drawImage(glow('#cfe0ff'),X-T*2,Y-T*4.6,T*4,T*4);c.globalCompositeOperation='source-over'}}
  if(p.crystals){const b=DG.A.box();for(let i=0;i<5;i++){const X=b.l+(b.r-b.l)*(i+.5)/5-cx,Y=b.t+T*2+Math.sin(t*1.2+i)*T*.5-cy;c.save();c.translate(X,Y);c.rotate(Math.sin(t+i)*.3);c.globalAlpha=.75*I;c.fillStyle=p.pc;c.beginPath();c.moveTo(0,-14);c.lineTo(8,0);c.lineTo(0,14);c.lineTo(-8,0);c.fill();c.globalCompositeOperation='lighter';c.globalAlpha=.4*I;c.drawImage(glow(p.pc),-30,-30,60,60);c.restore()}}
  c.restore()}
 // in front: rain, snow, ash, motes; lightning and its flash
 function front(c,cx,cy,now,vw,vh){if(!S.on||S.int<.01)return;const p=S.pre,I=S.int,q=quality(),t=S.t;if(!seeded)seed(vw,vh);c.save();const n=Math.floor(COUNT[q]*I),dt=Math.min(.05,(now-(front.l||now))/1000);front.l=now;const wnd=S.wind;
  if(p.part=='rain'){c.strokeStyle=p.pc;c.globalAlpha=.42;c.lineWidth=1.3;c.beginPath();for(let i=0;i<n;i++){py[i]+=dt*(620+pz[i]*380);px[i]+=dt*wnd*2.2;if(py[i]>vh){py[i]-=vh+20;px[i]=R()*vw}if(px[i]>vw)px[i]-=vw;if(px[i]<0)px[i]+=vw;const L=10+pz[i]*12;c.moveTo(px[i],py[i]);c.lineTo(px[i]-wnd*.04*L,py[i]-L)}c.stroke()}
  else{c.fillStyle=p.pc;const add=p.part=='spark'||p.part=='mote'||p.part=='ash';if(add)c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){pp[i]+=dt;let vy=0,vx=wnd*1.4*pz[i];if(p.part=='snow')vy=60+pz[i]*80;else if(p.part=='ash'){vy=(i%3?-40:30)*pz[i];vx+=Math.sin(pp[i]*2)*14}else if(p.part=='mote'){vy=-18*pz[i];vx+=Math.cos(pp[i])*8}else if(p.part=='spark'){vy=Math.sin(pp[i]*3)*30;vx+=Math.cos(pp[i]*2)*30}else{vy=Math.sin(pp[i])*10-6;vx+=Math.cos(pp[i]*.7)*10}px[i]+=vx*dt;py[i]+=vy*dt;if(py[i]>vh+10)py[i]-=vh+20;if(py[i]<-10)py[i]+=vh+20;if(px[i]>vw+10)px[i]-=vw+20;if(px[i]<-10)px[i]+=vw+20;c.globalAlpha=(p.part=='snow'?.85:.35+.4*Math.sin(pp[i]*3))*(.4+.6*pz[i]);const s=(p.part=='snow'?2.2:1.6)*pz[i]*(p.part=='spark'?1.4:1);c.fillRect(px[i],py[i],s,s)}c.globalCompositeOperation='source-over'}
  // the gust is shown as streaks across the screen before it arrives
  if(S.gust){const g=S.gust,u=g.tel>0?1-g.tel/g.tel0:1;c.strokeStyle='#ffffff';c.globalAlpha=g.tel>0?.25+.4*u:.35;c.lineWidth=2;c.beginPath();for(let i=0;i<14;i++){const y=(i*53+31)%vh,x=((now/2.2*g.d+i*137)%(vw+200)+vw+200)%(vw+200)-100;c.moveTo(x,y);c.lineTo(x-g.d*60,y)}c.stroke();if(g.tel>0){c.globalAlpha=.8;c.fillStyle='#ffffff';c.font='bold 28px sans-serif';c.textAlign='center';c.fillText(g.d>0?'≫ ≫ ≫':'≪ ≪ ≪',vw/2,vh*.22)}}
  for(const b of S.bolts){c.globalCompositeOperation='lighter';c.strokeStyle='#eef4ff';c.globalAlpha=Math.min(1,b.life*5);c.lineWidth=3.5;c.beginPath();for(let i=0;i<b.pts.length;i++){const[x,y]=b.pts[i];i?c.lineTo(x-cx,y-cy):c.moveTo(x-cx,y-cy)}c.stroke();c.lineWidth=9;c.globalAlpha*=.25;c.stroke();c.globalCompositeOperation='source-over'}
  if(S.flash>0){c.globalAlpha=S.flash*(flashOK()?.75:.2);c.fillStyle=p.k=='inferno'?'#ffd0a0':'#eef4ff';c.fillRect(0,0,vw,vh)}
  if(S.frozen>0){c.globalAlpha=.55;c.strokeStyle='#dff6ff';c.lineWidth=3;const X=P.x-cx,Y=P.y-cy;c.strokeRect(X-P.w*.8,Y-6,P.w*1.6,P.h+10);c.fillStyle='rgba(200,235,255,.25)';c.fillRect(X-P.w*.8,Y-6,P.w*1.6,P.h+10);c.globalAlpha=1;c.fillStyle='#fff';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText('JUMP! '+(4-S.jumps),X,Y-14)}
  c.restore()}
 DG.clim={PRE,STAGE,start,stage,stop,calm,strike,bolt,rod,gust,darkness,whiteout,freeze,lowGravity,tick,back,front,boom,whoosh,quality,get on(){return S.on},get k(){return S.k},get S(){return S}};
 // a run that ends, however it ends, takes its weather with it
 {const _l=DG.leave;DG.leave=function(){try{stop()}catch(_){}return _l.apply(this,arguments)}}
 {const _s=DG.boss.stop;DG.boss.stop=function(){try{stop()}catch(_){}return _s.apply(this,arguments)}}
})()}catch(e){console.error('DG climate',e)}
