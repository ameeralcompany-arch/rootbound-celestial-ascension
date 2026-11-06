// ===== DG.legend: every dungeon boss as a force of nature. Each boss gets a climate that grows with its four phases (75%, 50%, 20%), a voiced line and a short scene when it takes
// over the arena and when it reaches its final form, a final form with its own look, and signature abilities that use the weather and the arena. The six legendary bosses
// (Infernal Sovereign, Frost Empress, Nameless Saint, Varkhazan, Eternal Night, World Eater) get a full set; the other four get their climate, the new phase and one ability.
// Everything a boss does is an attack in its own list, so co-op replays it on both computers, telegraphs look like every other warning, and the damage is the dungeon's own. =====
try{(()=>{
 const DG=window.DG,A=DG.A,fx=DG.fx,C=DG.clim,R=Math.random,TAU=Math.PI*2,rn=(a,b)=>a+R()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v;
 const O=()=>DG.S.opt,slowOK=()=>O().slow!==0&&!DG.reduced();
 const B=()=>A.box(),F=()=>A.fl();
 const toast=s=>{try{DG.ui.toast(s)}catch(_){}};
 // ---- the boss's voice, with a subtitle that stays readable over any weather
 let sub=null,subT=0;function line(id){const V=window.BOSSVOICE||{},q=V[id];if(!q)return;try{const a=new Audio('audio/bosses/'+id+'.mp3');let v=1;try{v=Math.max(0,Math.min(1,(OPT.sv==null?1:+OPT.sv)))}catch(_){}a.volume=v;const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}
  if(!sub){sub=document.createElement('div');sub.id='bsub';document.body.appendChild(sub)}const def=DG.boss.DEF[id.replace(/_[a-z0-9]+$/,'')];sub.innerHTML='<b>'+(def?def.n:'')+'</b><span>'+String(q.text).replace(/[<>&]/g,'')+'</span>';sub.classList.add('on');clearTimeout(subT);subT=setTimeout(()=>sub.classList.remove('on'),(q.dur+1.2)*1000)}
 // ---- signature abilities. Each is an ordinary boss attack: warned, then hurts, then a cooldown
 const k=(m,v)=>A.dmg(m,v);
 const pick3=(n,avoid)=>{const b=B(),o=[];let g=0;while(o.length<n&&g++<60){const x=rn(b.l+T*2,b.r-T*2);if(o.every(q=>Math.abs(q-x)>T*3.2)&&(avoid==null||Math.abs(x-avoid)>T*2.5))o.push(x)}return o};
 const AB={
  // storm: lightning where it warned, a second wave on harder difficulties
  judgment:()=>({name:'heavensjudgment',wind:.9,rec:.6,cd:9,tag:'area',start(m){C.boom('thunder',0,.5);A.say('','Lightning gathers…',800)},fire(m,X){const n=2+Math.min(3,m.phase);C.strike(P.x,{dmg:k(m,.85)});for(const x of pick3(n,P.x))C.strike(x,{dmg:k(m,.85)});if(X.mech()>=1)fx.later(1.3,()=>{for(const x of pick3(n,null))C.strike(x,{dmg:k(m,.85)})})}}),
  // storm: the wind turns toward a burning edge of the arena. Walk against it
  gale:()=>({name:'stormgale',wind:.6,rec:.4,cd:12,tag:'area',fire(m){const b=B(),d=P.x<(b.l+b.r)/2?-1:1,f=F(),ex=d<0?b.l:b.r-T*3;fx.z(ex,f-T*3,ex+T*3,f+2,1.2,2.8,{c:'#9ab8ff',dmg:k(m,.45),rep:.6,kind:'bolt'});C.gust(d,2.6,1.2);for(let i=0;i<3;i++)fx.later(1.3+i*.5,()=>fx.shot(m.x,m.y+m.h*.4,-d*160,-40,{r:12,c:'#cfe0ff',dmg:k(m,.4),l:4}))}}),
  // storm, final: a mark follows you; burst it on a lightning rod and the lightning hits the boss instead
  rends:()=>({name:'heavenrends',wind:1,rec:.8,cd:16,ult:1,start(m){const b=B();if(!C.S.rods.length){C.rod(b.l+(b.r-b.l)*.22);C.rod(b.l+(b.r-b.l)*.78)}toast('Lead the lightning onto a rod!')},fire(m){const f=F();fx.mark({t:3.4,r:T*1.6,c:'#cfe0ff',dmg:k(m,1)});fx.later(2.9,()=>{const x=P.x;fx.later(.5,()=>{C.bolt(x,f);for(const q of C.S.rods)if(Math.abs(q.x-x)<T*1.9){q.ch=1;q.t=.8;toast('The rod is charged!')}})});for(const x of pick3(2,P.x))C.strike(x,{dmg:k(m,.7),tel:1.6})}}),
  // inferno: ash and embers fall where they warned, and burn a moment where they land
  ashfall:()=>({name:'ashfall',wind:.7,rec:.5,cd:8,tag:'area',fire(m){const f=F();const xs=[P.x,...pick3(4,P.x)];xs.forEach((x,i)=>{const z=fx.c(x,f-T*.8,T*1.2,1+i*.12,.3,{c:'#ff7a2a',dmg:k(m,.6),kind:'fire'});z.on=()=>fx.ground(x-T,x+T,f,{life:2.2,c:'#ff5a1e',dmg:k(m,.2),rate:.6})})}}),
  // inferno: eruptions run across the floor one after another, with one cool gap to stand in
  erupt:()=>({name:'infernaljudgment',wind:.9,rec:.6,cd:10,tag:'area',fire(m){const b=B(),f=F(),d=m.x<(b.l+b.r)/2?1:-1,n=Math.floor((b.r-b.l)/(T*2)),gap=2+Math.floor(R()*(n-4));for(let i=0;i<n;i++){if(Math.abs(i-gap)<1)continue;const x=d>0?b.l+T+i*T*2:b.r-T-i*T*2;fx.col(x,f,T*4,T*1.8,.8+i*.16,{c:'#ff6a1e',dmg:k(m,.75),kind:'fire',act:.4})}C.boom('thunder',.4,.6)}}),
  // inferno, final: the floor breaks into burning sections; the safe ones change once
  crown:()=>({name:'crownofthesun',wind:1.1,rec:.8,cd:18,ult:1,start(){A.say('','The floor glows…',900)},fire(m){const b=B(),f=F(),n=7,w=(b.r-b.l)/n;const lay=par=>{for(let i=0;i<n;i++)if(i%2==par)fx.ground(b.l+i*w,b.l+(i+1)*w,f,{tel:1.6,life:6,c:'#ff4a12',dmg:k(m,.35),rate:.5,h:T*1.2,kind:'fire'})};lay(0);fx.later(6.2,()=>lay(1));C.S.flash=.4}}),
  // blizzard: a white-out, glassy floor and a gust
  whiteout:()=>({name:'whiteout',wind:.8,rec:.5,cd:14,fire(m){C.whiteout(.55,6);const f=F();for(const x of pick3(3,null))fx.ground(x-T*2.5,x+T*2.5,f,{tel:.8,life:8,c:'#bfeaff',slip:1,dmg:0,kind:'ice'});C.gust(R()<.5?-1:1,2.2,1.2)}}),
  // blizzard: frost circles; stand in one when it closes and you are frozen until you jump free
  frozen:()=>({name:'frozeneternity',wind:.9,rec:.6,cd:10,tag:'area',fire(m){const f=F(),xs=[P.x,...pick3(2,P.x)];for(const x of xs)fx.c(x,f-T*1.2,T*1.6,1.3,.3,{c:'#bfeaff',dmg:k(m,.35),kind:'ice',fn:()=>C.freeze(1.8)})}}),
  // blizzard, final: the edges of the arena freeze inward, then the middle; there is always room to stand
  zero:()=>({name:'absolutezero',wind:1.1,rec:.8,cd:18,ult:1,fire(m){const b=B(),f=F(),W=b.r-b.l;fx.z(b.l,f-T*5,b.l+W*.34,f+2,1.4,3.6,{c:'#9adfff',dmg:k(m,.45),rep:.7,kind:'ice'});fx.z(b.r-W*.34,f-T*5,b.r,f+2,1.4,3.6,{c:'#9adfff',dmg:k(m,.45),rep:.7,kind:'ice'});fx.later(4.2,()=>{fx.z(b.l+W*.3,f-T*5,b.l+W*.7,f+2,1.5,3,{c:'#9adfff',dmg:k(m,.45),rep:.7,kind:'ice'})});C.whiteout(.35,8)}}),
  // blight: roots burst up around you and stay as low walls for a while. Two tiles high, so you can jump them
  roots:()=>({name:'thornedgrasp',wind:.8,rec:.5,cd:9,tag:'area',fire(m){const f=F(),b=B();for(const dx of[-1,1]){const x=cl(P.x+dx*rn(T*2.5,T*4.5),b.l+T,b.r-T);fx.col(x,f,T*2.4,T*.9,1,{c:'#7aff5a',dmg:k(m,.55),kind:'up'});fx.later(1.05,()=>fx.wall(x-T*.4,f-T*2,x+T*.4,f,{life:5,c:'#3a6a2a',kind:'root'}))}}}),
  // blight: corrupted blooms spread poison that grows; destroy a bloom and its poison is gone
  bloom:()=>({name:'rotbloom',wind:.8,rec:.5,cd:16,fire(m){const f=F();for(const x of pick3(2,P.x)){const h=A.spawn('__bloom',x,f,{summon:true,life:14});if(!h)continue;h.hp=h.mhp=Math.max(60,m.mhp*.02);h.pool=fx.ground(x-T*.6,x+T*.6,f,{life:14,c:'#8aff3a',dmg:k(m,.25),rate:.7,kind:'void'});h.grow=1}toast('Destroy the blooms to clear the poison')}}),
  // blight, final: vines sweep the arena in lanes: jump the low ones, stay down under the high ones
  vines:()=>({name:'unnamedgrove',wind:1,rec:.8,cd:15,ult:1,fire(m){const b=B(),f=F();const lane=(lo,t)=>fx.z(b.l,lo?f-T*1.1:f-T*3.3,b.r,lo?f+2:f-T*1.9,t,.35,{c:'#6aff4a',dmg:k(m,.7),kind:'slash'});lane(1,1.3);lane(0,2.6);lane(1,3.9);A.say('','Low: jump · High: stay down',1600)}}),
  // eclipse: the boss vanishes in the dark and strikes where the mark shows
  vanish:()=>({name:'abyssaleclipse',wind:.7,rec:.7,cd:13,fire(m){C.darkness(.72,5);m.hide=1;m.inv=true;const f=F();fx.later(1.3,()=>{const x=P.x;fx.c(x,f-T*1.4,T*1.9,1,.3,{c:'#b48aff',dmg:k(m,1),kind:'void'});fx.later(1,()=>{if(DG.boss.act!==m)return;m.x=A.clX(x);m.hide=0;m.inv=false;DG.shk(.25)})});fx.later(3,()=>{m.hide=0;m.inv=false})}}),
  // eclipse: a well drags you toward the middle, then bursts. Run outward
  collapse:()=>({name:'gravitycollapse',wind:.8,rec:.6,cd:11,tag:'area',fire(m){const b=B(),x=(b.l+b.r)/2,y=F()-T*2;fx.well(x,y,{tel:1,reach:T*11,r:T*1.4,str:1050,life:2.6,dmg:k(m,.4),c:'#9a5aff',boom:1});toast('Run outward before it bursts!')}}),
  // eclipse, final: the moon covers everything, gravity weakens, and crescents run along the floor
  eclipse:()=>({name:'eternaleclipse',wind:1.1,rec:.8,cd:18,ult:1,fire(m){C.darkness(.8,7);C.lowGravity(6);const f=F();for(let i=0;i<3;i++)fx.later(.8+i*1.4,()=>{fx.wave(m.x,f,-1,{c:'#c8a8ff',dmg:k(m,.75),sp:380,tel:.5});fx.wave(m.x,f,1,{c:'#c8a8ff',dmg:k(m,.75),sp:380,tel:.5})})}}),
  // void: cracks spread from the boss, then a shock wave runs both ways. Jump it
  breaker:()=>({name:'worldbreaker',wind:1,rec:.7,cd:12,tag:'area',fire(m){const f=F(),b=B();for(let i=1;i<=6;i++){for(const d of[-1,1]){const x=m.x+d*i*T*1.6;if(x>b.l&&x<b.r)fx.ground(x-T*.5,x+T*.5,f,{tel:.15*i,life:1.4,c:'#ff4a6a',dmg:0,kind:'crack'})}}fx.later(1.2,()=>{fx.wave(m.x,f,-1,{c:'#ff5a7a',dmg:k(m,.9),sp:460});fx.wave(m.x,f,1,{c:'#ff5a7a',dmg:k(m,.9),sp:460});DG.shk(.35);C.boom('thunder',0,.9)})}}),
  // void, final: silence, then five stars fall in turn while the boss pulls
  silence:()=>({name:'thelastsilence',wind:1.2,rec:.9,cd:20,ult:1,start(){A.say('','…',1200)},fire(m){C.darkness(.7,6);const xs=[P.x,...pick3(4,P.x)];xs.forEach((x,i)=>fx.later(i*.55,()=>C.strike(x,{dmg:k(m,.85),c:'#ff5ad0',tel:1.1,r:T*1.7})));fx.well(m.x,m.y+m.h/2,{tel:.8,reach:T*9,r:T*1.2,str:700,life:3,dmg:k(m,.3),c:'#ff2a4a'})}}),
  // arcane: a beam crosses the whole arena, low (jump it) or high (stay down)
  arc:()=>({name:'arcdischarge',wind:.7,rec:.5,cd:10,tag:'area',fire(m){const b=B(),f=F(),lo=R()<.5;fx.beam(b.l,lo?f-T*.6:f-T*2.6,0,b.r-b.l,{w:lo?T*.9:T*1.1,tel:1.1,act:.35,c:'#a8ffe8',dmg:k(m,.7)});A.say('',lo?'Jump the low beam':'Stay down under the high beam',1000)}}),
  // a royal storm: three strikes around you
  royal:()=>({name:'royalstorm',wind:.8,rec:.5,cd:11,tag:'area',fire(m){C.strike(P.x,{dmg:k(m,.8)});for(const x of pick3(2,P.x))C.strike(x,{dmg:k(m,.8)})}})};
 // a corrupted bloom: still, fragile, and its poison spreads until it is destroyed
 try{DG.mobs.reg('__bloom',{n:'Corrupted Bloom',cls:'regular',w:34,h:40,c:'#8aff3a',ai:'still',touch:0,tick(m,dt){if(m.pool){const g=m.pool;if(g.x1-g.x0<T*8){g.x0-=T*.45*dt;g.x1+=T*.45*dt}g.life=Math.max(g.life,.5)}},art(c,m,o){const t=o.t;c.fillStyle='#2a4a1a';c.fillRect(-3,-18,6,18);c.save();c.translate(0,-24);for(let i=0;i<5;i++){c.rotate(TAU/5);c.fillStyle=i%2?'#8aff3a':'#b06aff';c.beginPath();c.ellipse(0,-9-Math.sin(t*3+i)*1.5,6,10,0,0,TAU);c.fill()}c.fillStyle='#ffe85a';c.beginPath();c.arc(0,0,5,0,TAU);c.fill();c.restore()}})}catch(e){console.error('bloom',e)}
 {const _hm=hurtMob;hurtMob=function(m,d){const r=_hm.apply(this,arguments);try{if(m&&m.pool&&m.hp<=0){m.pool.life=0;m.pool=null;toast('The poison clears')}}catch(_){}return r}}
 // ---- who gets what. ai: tags for the smarter choice of attack (t2-boss-ai.js). add: new abilities per phase. light: the lighter treatment
 const LEG={
  sentinel:{pre:'arcane',light:1,final:'The Last Door',lore:'Built to keep the ruins sealed, it has not moved in a thousand years. The crystals answer it still.',gap:['leap'],area:['shockwave','bigwave','wave3','stones'],ult:['judgment'],add:{3:['arc']}},
  sovereign2:{pre:'inferno',final:'Crown of the Sun',lore:'A king who would rather burn his kingdom than hand it over. The volcano obeys him.',gap:['hurl'],area:['eruptions','eruptions2','eruptions3','skyfire','skyfire2'],ult:['cataclysm'],add:{2:['ashfall'],3:['erupt'],4:['crown']}},
  empress:{pre:'blizzard',final:'Absolute Zero',lore:'She froze her court to keep it forever. Winter is her patience.',gap:['clones','clones3'],area:['wave','wave2','wave3','spiral','icefall'],ult:['storm'],add:{2:['whiteout'],3:['frozen'],4:['zero']}},
  saint:{pre:'blight',final:'The Unnamed Grove',lore:'The sanctuary\'s keeper, rotted from within. The roots took its name and kept the rest.',gap:['blink','blink2'],area:['pillars','skyward','chain','chain3'],ult:['judgment','unmake'],add:{2:['roots'],3:['bloom'],4:['vines']}},
  varkhazan:{pre:'storm',final:'Heaven Rends',lore:'The last of the ancient dragons, buried under a storm that never ended. The storm is its breath now.',gap:['dive','takeoff'],area:['breath','tail','bombard','strafe'],ult:['firestorm','inferno'],add:{2:['gale'],3:['judgment'],4:['rends']}},
  worldeater0:{pre:'eclipse',light:1,final:'Existence Ends',lore:'Only the shadow of something far larger, and still the floor forgets how to hold you.',gap:['reach'],area:['ring','sweep','well'],ult:['omega'],add:{3:['collapse']}},
  fallenstar:{pre:'arcane',light:1,final:'Supernova',lore:'A star that fell and refused to go out. Its light cuts.',gap:['rift'],area:['spokes','rings','storm'],ult:['nova'],add:{3:['arc']}},
  eternalnight:{pre:'eclipse',final:'Eternal Eclipse',lore:'It ate the moon so the temple would never see morning. What you cannot see is what hunts you.',gap:['steps','undertow'],area:['crescent','nightrings','corners'],ult:['midnight'],add:{2:['vanish'],3:['collapse'],4:['eclipse']}},
  hollowking:{pre:'storm',light:1,final:'A King Without Mercy',lore:'He kept his oath after his kingdom fell. The storm is the last of his court.',gap:['voidstep','reach'],area:['decree','kingdomsend'],ult:['oathward','kingdomsend'],add:{3:['royal']}},
  worldeater:{pre:'eclipse',final:'The Last Silence',lore:'The end of everything, sitting on a throne of broken worlds. Gravity is a suggestion here.',gap:['longarm'],area:['handfall','worldsrain','twinsweep'],ult:['everything','eventh'],add:{2:['collapse'],3:['breaker'],4:['silence']}}};
 // ---- phases: 100-75, 75-50, 50-20 and the final form under 20%. A boss with three phases keeps its last list for the fourth and gains its final-form abilities there
 function apply(id){const def=DG.boss.DEF[id],L=LEG[id];if(!def||!L||def.legend)return;def.legend=L;def.phases=[.75,.5,.2];def.names=(def.names||[]).slice(0,4);if(def.names.length<4)def.names.push(L.final);
  const atk=(def.atk||[]).map(a=>a.slice());while(atk.length<4)atk.push(atk[atk.length-1].slice());for(const p in L.add)for(const key of L.add[p]){const a=AB[key]&&AB[key]();if(!a)continue;for(let i=+p-1;i<4;i++)atk[i].push(i==+p-1?a:a)}def.atk=atk;
  // the boss's own transition still plays first; the arena's answer follows
  const _ph=def.phase;def.phase=function(i,m,X){if(_ph&&i<(def._oldN||3))try{_ph.call(this,i,m,X)}catch(e){console.error('phase',e)}};def._oldN=(L.n0||3);
  const _de=def.death;def.death=function(m,X){try{C.calm((def.deathDur||4)+1.5);line(id+'_death')}catch(_){}if(_de)return _de.apply(this,arguments)}}
 for(const id in LEG)try{apply(id)}catch(e){console.error('legend',id,e)}
 // the original 4-phase bosses keep their own transitions for all four
 for(const id of['worldeater0','fallenstar','worldeater'])if(DG.boss.DEF[id])DG.boss.DEF[id]._oldN=4;
 // ---- the scene when a phase begins. Returns how long it holds the fight (p3 locks you for that long and never longer)
 const FLOUR={
  storm:(m)=>{for(let i=0;i<3;i++)fx.later(.3+i*.35,()=>C.bolt(m.x+rn(-T*4,T*4),F()));C.boom('thunder',.2,1)},
  blizzard:(m)=>{C.whiteout(.5,1.8);try{DG.music.sfx('freeze',.9)}catch(_){}try{if(!DG.reduced())VFX.shatter(m.x,m.y+m.h/2,['#dff6ff','#9adfff','#fff'],30)}catch(_){}},
  inferno:(m)=>{const b=B(),f=F();for(let i=0;i<5;i++){const x=b.l+(b.r-b.l)*(i+.5)/5;fx.later(.2+i*.15,()=>{try{VFX.burst(x,f-10,['#ff6a1e','#ffd06a'],14,320,1,.8,12)}catch(_){}})}C.S.flash=.35;try{DG.music.sfx('lava',.9)}catch(_){}},
  eclipse:(m)=>{C.darkness(.85,2.2);m.vy=-140;try{DG.music.sfx('rumble',1)}catch(_){}},
  arcane:(m)=>{try{A.wave(m.x,m.y+m.h/2,'#a8ffe8',T*12,.9,.4)}catch(_){}try{DG.music.sfx('glow',.8)}catch(_){}},
  blight:(m)=>{const f=F();for(let i=-3;i<=3;i++)fx.later(.15*Math.abs(i),()=>{try{VFX.burst(m.x+i*T*1.6,f-6,['#6aff4a','#3a6a2a','#b06aff'],10,240,1,.7,10)}catch(_){}});try{DG.music.sfx('crack',.8)}catch(_){}}};
 function enter(m,def,to){const L=def.legend;if(!L)return null;C.stage(to);try{DG.music&&DG.music.state(to==2?'boss2':to==3?'boss3':'final')}catch(_){}line(def.id+'_p'+to);
  const big=to==2||to==4,dur=to==4?3.4:to==2?2.6:1.6;try{(FLOUR[L.pre]||FLOUR.arcane)(m)}catch(e){console.error(e)}
  if(to==4){m.form=1;try{HITSTOP(140)}catch(_){}if(slowOK())try{CINE7.slow(900,.4)}catch(_){}DG.shk(.45);try{A.wave(m.x,m.y+m.h/2,def.c2||def.c,T*16,1.2,.5)}catch(_){}C.S.flash=Math.max(C.S.flash,.5)}
  if(!big||(DG.coop&&DG.coop.fast))return null;try{DG.cam.play([{x:m.x,y:m.y+m.h/2,z:to==4?1.35:1.22,dur:.5,hold:dur-1.1},{x:P.x,y:P.y+P.h/2,z:1,dur:.6}],{hold:true,lock:true})}catch(_){}return{dur}}
 // the climate itself begins with the boss's entrance, in p3-dg-boss.js start()
 DG.legend={LEG,AB,enter,line,apply};
})()}catch(e){console.error('DG legend',e)}
