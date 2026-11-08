// ===== WBOSS13: world bosses. Every realm has its own huge boss that owns the letters of its hidden word: Thornmaw the Rootwarden (the
// first world), Vulkhar the Pyrelord (Inferno), Nyx the Astral Devourer (Galaxy), Maelor the Leviathan (Abyssal Sea) and Aurelia the Prism
// Empress (Crystal Realm). When you pick up the last letter the ground shakes and the world collapses around you (the blocks crumble away
// outward from where you stand), then a 40-second cinematic tells how you stole the boss's letters and how it woke to take them back.
// After it the world is gone: only a huge arena square floating in the void, you and the boss, with a big summoning entrance. The Word Gate
// stays shut until the boss falls. Each boss has three phases of its own attacks (BOSSX lists, plus moving fire / water walls, beams, black
// holes, expanding rings, homing bubbles, mirror images...), shields, stagger windows and roughly three times the health of a cave boss.
// Win: the outro plays, the world comes back exactly as it was, and the Word Gate opens. Lose (knocked out, or you leave the world): the
// world comes back too, and the boss waits at the Word Gate (L) for a rematch. Nothing is written to the world save while the world is gone
// (the collapse is in memory only), so quitting mid-fight never loses a block.
// The cinematic plays once per boss in full; after that hold any key to skip it. State: RB_PREFIX + 'rbwboss' {w:{world:1}, seen:{id:1}}.
// Online the fight is a private copy on your own computer: nobody else's world collapses. They see you standing where you were, with a bubble saying what
// you are fighting; what they build meanwhile waits and is applied when your world comes back; you send them no blocks or effects from the void. The
// server cannot watch the fight, so a win only unlocks a one-time gem allowance for that world (server/server.js, 'wb').
// Cost: one boss, a few dozen projectiles at most; the void sky and the boss sigils are pre-rendered; the cinematic runs on its own canvas
// while the game loop is paused (RB_COVER). =====
const WBOSS13=(()=>{
 const R=Math.random,PI=Math.PI,TAU=PI*2,rn=(a,b)=>a+R()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k;
 const ez=x=>{x=cl(x,0,1);return x*x*(3-2*x)},eo=x=>1-Math.pow(1-cl(x,0,1),3);
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}};
 const tone=(a,b,d,ty,v,dl,vib)=>{try{SFX7.tone(a,b,d,ty,v,dl,vib)}catch(_){}};
 const shk=v=>{if(!red())shake=Math.max(shake,v)};
 const say6=(a,b,ms)=>{try{UI6.say6(a,b||'',ms||900)}catch(_){}};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const glo=c=>BOSS6.glo(c);
 const OL='#0e0818',AW=46,AH=24,DUR=40,VS=1.55;
 // ---- the five bosses (one per realm stage)
 const WB=[
  {id:'wb_root',sg:0,n:'Thornmaw the Rootwarden',sn:'Thornmaw',ep:'Ancient Heart of the First Forest',w:150,h:200,ai:'walk',mv:'magma',spm:.7,c:'#7ad65a',c2:'#d8ff5a',c3:'#ff5a3a',hp:8500,dmg:24,gems:3000,xp:4000,lv:10,
   relic:'wroot',rn:'Heartwood Seed',rd:'+80 max HP',fx:{hp:80},sky:['#07140b','#1c3a1e','#4f7a2e'],gnd:'#0f2210',place:'Beneath the oldest roots of',have:'The letters of the hidden word grew in his heart like seeds.',
   quote:'THIEF! You tore the seeds from my heart!',phs:['','The roots wake beneath you','The whole forest turns on you'],snd:'warden',hy:.6},
  {id:'wb_pyre',sg:1,n:'Vulkhar the Pyrelord',sn:'Vulkhar',ep:'Tyrant of the Burning Forge',w:150,h:190,ai:'fly',mv:'storm',spm:1,c:'#ff5a1e',c2:'#ffb02a',c3:'#ff2a2a',hp:14500,dmg:32,gems:7000,xp:8500,lv:20,
   relic:'wpyre',rn:'Pyre Crown Ember',rd:'+7% damage',fx:{dmg:.07},sky:['#12030a','#4a0c0e','#c0381a'],gnd:'#1a0606',place:'In the burning heart of',have:'He forged the letters into his molten crown.',
   quote:'You stole from the forge of the world? Then BURN with it!',phs:['','His fire turns white-hot','The whole sky rains fire'],snd:'magma',hy:.84},
  {id:'wb_nyx',sg:2,n:'Nyx the Astral Devourer',sn:'Nyx',ep:'The Hunger Between the Stars',w:170,h:170,ai:'fly',mv:'eclipse',spm:1,c:'#9a7bff',c2:'#ff7ad8',c3:'#ff3a6a',hp:25000,dmg:40,gems:12000,xp:14000,lv:30,
   relic:'wnyx',rn:'Devourer\'s Eye',rd:'+6% crit, +20% crit damage',fx:{crit:.06,cdmg:.2},sky:['#03020c','#120a32','#3a1a6a'],gnd:'#0a0618',place:'Between the drifting stars of',have:'He kept the letters burning like tiny suns inside his eye.',
   quote:'LITTLE SPARK... I WILL SWALLOW YOUR LIGHT!',phs:['','His eye opens wide','The stars themselves go out'],snd:'eclipse',hy:.52},
  {id:'wb_mael',sg:3,n:'Maelor the Leviathan',sn:'Maelor',ep:'Tyrant of the Drowned Trench',w:230,h:120,ai:'fly',mv:'tide',spm:1,c:'#3ac8e0',c2:'#7affea',c3:'#9a5aff',hp:37000,dmg:48,gems:18000,xp:21000,lv:40,
   relic:'wmael',rn:'Trench Pearl',rd:'+6% armor, +40 max HP',fx:{arm:.06,hp:40},sky:['#020a14','#06283a','#0a5a6a'],gnd:'#04141c',place:'In the drowned trenches of',have:'He hoarded the letters like pearls in his lair.',
   quote:'Give back my pearls... or DROWN in the dark!',phs:['','The tide rises','The deep drags you down'],snd:'tide',hy:.5,hx:.38},
  {id:'wb_prism',sg:4,n:'Aurelia the Prism Empress',sn:'Aurelia',she:1,ep:'Queen of the Shattered Light',w:130,h:190,ai:'fly',mv:'sovereign',spm:1,c:'#ff8ae0',c2:'#9ad8ff',c3:'#ff3a7a',hp:54000,dmg:56,gems:28000,xp:32000,lv:48,
   relic:'wprism',rn:'Empress Prism',rd:'+12% XP, +8% gems',fx:{xp:.12,gem:.08},sky:['#0c0618','#2a1648','#8a5ab8'],gnd:'#140a22',place:'Atop the shining throne of',have:'She set the letters as jewels in her crown of light.',
   quote:'You stole the jewels of my crown. KNEEL... or SHATTER!',phs:['','Her light splits apart','Every facet turns against you'],snd:'sovereign',hy:.84}];
 const BY={};
 for(const b of WB){b.wb=1;b.depth=0;b.desc=b.ep;b.aw=b.w;b.ah=b.h;b.w=Math.round(b.w*VS);b.h=Math.round(b.h*VS);BY[b.id]=b;BOSSES.push(b);
  MK['boss_'+b.id]={c:b.c,hp:b.hp,w:b.w,h:b.h,gem:40,dmg:b.dmg,ai:b.ai,spm:b.spm,fly:b.ai=='fly'?1:0,ph:b.ai=='fly'?1:0,min:9999,max:9999,boss:1};try{MOBMAT['boss_'+b.id]=10}catch(_){}
  try{BOSS10.AURA[b.id]=[b.c,b.c2,b.c3];BOSS10.EPI[b.id]=b.ep;BOSS10.PHS[b.id]=b.phs}catch(_){}try{BOSSX.cols[b.id]=b.c}catch(_){}
  try{const mv=b.mv;BMOVE12.AI[b.id]=(m,v,dt,s)=>BMOVE12.AI[mv](m,v,dt,s*(b.ai=='walk'?.95:1.05))}catch(_){}}
 const idOf=m=>String(m&&m.k||'').slice(5),isWB=m=>!!(m&&m.k&&BY[idOf(m)]),him=b=>b.she?'her':'him',he=b=>b.she?'she':'he';
 // ---- save
 const KEY=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbwboss';let S={w:{},seen:{}};
 try{const o=JSON.parse(localStorage.getItem(KEY())||'null');if(o&&typeof o=='object'){if(o.w&&typeof o.w=='object')for(const n in o.w)if(o.w[n])S.w[n]=1;if(o.seen&&typeof o.seen=='object')for(const k in o.seen)if(BY[k])S.seen[k]=1}}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const bossFor=n=>{try{const sg=WORD9.stageOf(n);return WB.find(b=>b.sg==sg)||null}catch(_){return null}};
 const creative=()=>{try{return !!CRV8.on}catch(_){return false}};
 function need(n){try{if(!n||!WORD9.hasWord(n)||creative())return false;const st=WORD9.state.w[n];return !(st&&st.ok)&&!S.w[n]&&!!bossFor(n)}catch(_){return false}}

 // ================= art (feet at the origin, facing right; o: {w,h,t,fl,ph,eye,at,lx,ly}) =================
 const rot=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
 const poly=(c,p)=>{c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath()};
 const gl=(c,col,x,y,r,a)=>{const a0=c.globalAlpha,op=c.globalCompositeOperation;c.globalCompositeOperation='lighter';c.globalAlpha=a0*(a==null?1:a);c.drawImage(glo(col),x-r,y-r,r*2,r*2);c.globalAlpha=a0;c.globalCompositeOperation=op};
 function flame(c,x,y,w,h,t,c1,c2,c3){const f=k=>Math.sin(t*9+k)*w*.12;c.fillStyle=c1;c.beginPath();c.moveTo(x-w/2,y);c.bezierCurveTo(x-w*.6,y-h*.4,x-w*.15+f(1),y-h*.6,x+f(2),y-h);c.bezierCurveTo(x+w*.15+f(3),y-h*.6,x+w*.6,y-h*.4,x+w/2,y);c.closePath();c.fill();
  c.fillStyle=c2;c.beginPath();c.moveTo(x-w*.3,y);c.bezierCurveTo(x-w*.35,y-h*.3,x-w*.08+f(4),y-h*.45,x+f(5)*.6,y-h*.72);c.bezierCurveTo(x+w*.08,y-h*.45,x+w*.35,y-h*.3,x+w*.3,y);c.closePath();c.fill();
  if(c3){c.fillStyle=c3;c.beginPath();c.ellipse(x,y-h*.18,w*.14,h*.18,0,0,TAU);c.fill()}}
 const ART={
  wb_root(c,o){const w=o.w,h=o.h,t=o.t,at=o.at||0,sw=Math.sin(t*1.3)*3,F=x=>o.fl?'#f4fff0':x,ey=o.eye==null?1:o.eye;c.lineJoin='round';c.lineCap='round';
   for(let i=-3;i<=3;i++){const bx=i*w*.07,ex=i*w*.17+Math.sin(t*1.7+i)*3;c.strokeStyle=OL;c.lineWidth=16-Math.abs(i)*1.5;c.beginPath();c.moveTo(bx,-h*.18);c.quadraticCurveTo(bx+i*9,-h*.04,ex,0);c.stroke();c.strokeStyle=F('#5a3a22');c.lineWidth=11-Math.abs(i)*1.4;c.stroke()}
   const arm=(s,back)=>{const sx=s*w*.26+sw,sy=-h*.66,a=Math.sin(t*1.6+(s>0?0:PI))*.2+(s>0?-at*1.1:at*.3),e=rot(s*w*.18,h*.17,a*s),hd=rot(s*w*.1,h*.2,a*s*1.5),ex=sx+e[0],ey2=sy+e[1],hx=ex+hd[0],hy=ey2+hd[1];
    for(const[lw,col]of[[back?19:21,OL],[back?13:15,back?'#3e2716':F('#6b4428')]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(sx,sy);c.lineTo(ex,ey2);c.lineTo(hx,hy);c.stroke()}
    for(let k=-1;k<=1;k++){const q=rot(s*16,22,(k*.45+a)*s);c.strokeStyle=OL;c.lineWidth=7;c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+q[0],hy+q[1]);c.stroke();c.strokeStyle=back?'#3e2716':F('#7a5232');c.lineWidth=4;c.stroke()}
    if(!back){c.fillStyle=F('#4f8a3a');c.beginPath();c.ellipse(sx,sy-6,w*.09,h*.04,s*.3,0,TAU);c.fill();c.fillStyle=F('#7ad65a');c.beginPath();c.ellipse(sx-s*4,sy-9,w*.05,h*.02,s*.3,0,TAU);c.fill()}};
   arm(-1,1);
   c.beginPath();c.moveTo(-w*.31,-h*.07);c.bezierCurveTo(-w*.36,-h*.35,-w*.3+sw*.3,-h*.62,-w*.25+sw,-h*.8);c.quadraticCurveTo(-w*.12+sw,-h*.88,sw,-h*.84);c.quadraticCurveTo(w*.12+sw,-h*.9,w*.25+sw,-h*.8);c.bezierCurveTo(w*.3+sw*.3,-h*.62,w*.36,-h*.35,w*.31,-h*.07);c.quadraticCurveTo(0,-h*.02,-w*.31,-h*.07);c.closePath();
   const gr=c.createLinearGradient(-w*.3,0,w*.3,0);gr.addColorStop(0,F('#4a2e1a'));gr.addColorStop(.45,F('#7a5232'));gr.addColorStop(1,F('#3a2414'));c.fillStyle=gr;c.fill();c.strokeStyle=OL;c.lineWidth=3.5;c.stroke();
   c.strokeStyle='rgba(30,16,8,.75)';c.lineWidth=2.4;for(let i=0;i<6;i++){const x=-w*.22+i*w*.088+sw*.5;c.beginPath();c.moveTo(x,-h*.12);for(let k=1;k<=6;k++)c.lineTo(x+Math.sin(k*1.7+i)*4,-h*.12-k*h*.11);c.stroke()}
   c.fillStyle=F('#3f7a32');for(const[x,y,rx]of[[-w*.2,-h*.74,w*.1],[w*.17,-h*.7,w*.08],[-w*.05,-h*.22,w*.06]]){c.beginPath();c.ellipse(x+sw,y,rx,rx*.5,0,0,TAU);c.fill()}
   const op=cl(.3+.18*Math.sin(t*2)+at*.6,.2,1),my=-h*.4,mx=sw*.5,ry=h*.06*(.55+op);c.fillStyle='#120804';c.beginPath();c.ellipse(mx,my,w*.17,ry,0,0,TAU);c.fill();c.strokeStyle=OL;c.lineWidth=3;c.stroke();
   gl(c,o.ph>=3?'#ff7a3a':b0.c2,mx,my,w*.16*(.6+op),.75);c.fillStyle=F('#d8c8a0');for(let i=-2;i<=2;i++){const x=mx+i*w*.06;c.beginPath();c.moveTo(x-6,my-ry+1);c.lineTo(x,my-ry+12*op+4);c.lineTo(x+6,my-ry+1);c.fill();c.beginPath();c.moveTo(x-5,my+ry-1);c.lineTo(x+3,my+ry-10*op-4);c.lineTo(x+7,my+ry-1);c.fill()}
   const ec=o.ph>=3?'#ff4a3a':'#d8ff5a';for(const s of[-1,1]){const x=s*w*.1+sw*.7,y=-h*.6;if(ey>.05){gl(c,ec,x,y,24*ey,.9);c.fillStyle=o.fl?'#fff':ec;c.beginPath();c.ellipse(x,y,10,4.6*ey,s*.28,0,TAU);c.fill()}else{c.strokeStyle='#1a0e06';c.lineWidth=2.5;c.beginPath();c.moveTo(x-9,y);c.lineTo(x+9,y+s*1);c.stroke()}
    c.strokeStyle=OL;c.lineWidth=5;c.beginPath();c.moveTo(x-s*13,y-13);c.lineTo(x+s*10,y-6);c.stroke()}
   for(let i=0;i<5;i++){const bx=lerp(-w*.2,w*.2,i/4)+sw,by=-h*.82,a=-PI/2+(i-2)*.4+Math.sin(t*1.1+i)*.05,L=h*(.2+(i%2)*.05),ex=bx+Math.cos(a)*L,ey2=by+Math.sin(a)*L,fx=bx+Math.cos(a)*L*.55,fy=by+Math.sin(a)*L*.55;
    for(const[lw,col]of[[11,OL],[7,F('#5a3a22')]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(bx,by);c.lineTo(ex,ey2);c.moveTo(fx,fy);c.lineTo(fx+Math.cos(a+.7)*L*.4,fy+Math.sin(a+.7)*L*.4);c.stroke()}
    c.fillStyle='#22140a';for(let k=1;k<4;k++){const px=bx+Math.cos(a)*L*k/4,py=by+Math.sin(a)*L*k/4;c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(a-1.4)*8,py+Math.sin(a-1.4)*8);c.lineTo(px+Math.cos(a)*4,py+Math.sin(a)*4);c.fill()}
    for(const[dx,dy,r,col]of[[0,0,19,'#2f6a28'],[-9,4,14,'#3f8a32'],[8,2,15,'#4f9a3a'],[-2,-7,11,'#7ad65a'],[3,-10,5,'#b8f080']]){c.fillStyle=F(col);c.beginPath();c.arc(ex+dx,ey2+dy,r,0,TAU);c.fill()}}
   if(!o.cine){for(let i=-1;i<=1;i++){const x=i*w*.09+sw,y=-h*.9,p=.55+.45*Math.sin(t*3+i);c.strokeStyle=b0.c2;c.globalAlpha*=.5+.5*p;c.lineWidth=2.5;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();c.globalAlpha/=.5+.5*p;c.fillStyle='#0c1408';c.beginPath();c.arc(x,y,4.5,0,TAU);c.fill()}}
   arm(1,0)},
  wb_pyre(c,o){const w=o.w,h=o.h,t=o.t,at=o.at||0,F=x=>o.fl?'#fff4ea':x,ey=o.eye==null?1:o.eye,fl=Math.sin(t*3.2)*.22;c.lineJoin='round';c.lineCap='round';
   const op=c.globalCompositeOperation;c.globalCompositeOperation='lighter';const a0=c.globalAlpha;c.globalAlpha=a0*.85;for(let i=-2;i<=2;i++)flame(c,i*w*.07,-h*.03-Math.abs(i)*4,w*.22,h*(.46-Math.abs(i)*.06),t+i*1.3,'rgba(255,90,20,.55)','rgba(255,190,60,.6)',i==0?'rgba(255,255,220,.5)':null);c.globalAlpha=a0;c.globalCompositeOperation=op;
   for(const s of[-1,1]){const shx=s*w*.15,shy=-h*.7,a=fl*s,wr=rot(s*w*.42,-h*.2,a),wx=shx+wr[0],wy=shy+wr[1],tips=[];for(let k=0;k<3;k++){const q=rot(s*w*(.5-k*.08),-h*.05+k*h*.17,a*1.3);tips.push([wx+q[0],wy+q[1]])}
    c.beginPath();c.moveTo(shx,shy);c.lineTo(wx,wy);c.lineTo(tips[0][0],tips[0][1]);for(let k=1;k<3;k++){const p=tips[k-1],q=tips[k],mx=(p[0]+q[0])/2-s*12,my=(p[1]+q[1])/2-6;c.quadraticCurveTo(mx,my,q[0],q[1])}c.quadraticCurveTo(s*w*.3,-h*.36,s*w*.1,-h*.46);c.closePath();
    const g2=c.createLinearGradient(shx,shy,tips[1][0],tips[1][1]);g2.addColorStop(0,F('#3a0806'));g2.addColorStop(.7,F('#a02010'));g2.addColorStop(1,F('#ff6a1e'));c.fillStyle=g2;c.fill();c.strokeStyle=OL;c.lineWidth=2.5;c.stroke();
    c.strokeStyle='#2a0e0a';c.lineWidth=4.5;c.beginPath();c.moveTo(shx,shy);c.lineTo(wx,wy);for(const p of tips){c.moveTo(wx,wy);c.lineTo(p[0],p[1])}c.stroke();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,140,50,.6)';c.lineWidth=2;c.beginPath();c.moveTo(tips[0][0],tips[0][1]);for(const p of tips)c.lineTo(p[0],p[1]);c.stroke();c.globalCompositeOperation=op}
   poly(c,[-w*.21,-h*.75,w*.21,-h*.75,w*.15,-h*.5,w*.1,-h*.4,-w*.1,-h*.4,-w*.15,-h*.5]);const g3=c.createLinearGradient(0,-h*.75,0,-h*.4);g3.addColorStop(0,F('#3a2a2e'));g3.addColorStop(1,F('#140a0c'));c.fillStyle=g3;c.fill();c.strokeStyle=OL;c.lineWidth=3;c.stroke();
   c.strokeStyle='#4a383c';c.lineWidth=2;c.beginPath();c.moveTo(-w*.18,-h*.62);c.lineTo(w*.18,-h*.62);c.moveTo(-w*.13,-h*.5);c.lineTo(w*.13,-h*.5);c.stroke();
   c.globalCompositeOperation='lighter';c.strokeStyle=o.ph>=2?'#ffe08a':'#ff8a2a';c.lineWidth=2.4;c.beginPath();c.moveTo(-w*.12,-h*.72);c.lineTo(-w*.06,-h*.64);c.lineTo(-w*.1,-h*.55);c.lineTo(-w*.03,-h*.46);c.moveTo(w*.14,-h*.7);c.lineTo(w*.07,-h*.6);c.lineTo(w*.11,-h*.5);c.stroke();c.globalCompositeOperation=op;
   gl(c,'#ffb02a',0,-h*.6,20+Math.sin(t*5)*3,.9);c.fillStyle=F('#fff0c0');c.beginPath();c.arc(0,-h*.6,6,0,TAU);c.fill();
   for(const s of[-1,1]){const sw2=Math.sin(t*2+s)*5+(s>0?-at*16:0),hx=s*w*.31,hy=-h*.48+sw2;for(const[lw,col]of[[17,OL],[11,F('#2a1c20')]]){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(s*w*.2,-h*.72);c.lineTo(s*w*.27,-h*.58);c.lineTo(hx,hy);c.stroke()}
    c.fillStyle=F('#1a1012');c.beginPath();c.arc(hx,hy,9,0,TAU);c.fill();c.strokeStyle='#e8d8c0';c.lineWidth=2.5;for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(hx+k*5,hy+5);c.lineTo(hx+k*7+s*2,hy+14);c.stroke()}if(s>0&&at>0)gl(c,'#ff7a2a',hx+6,hy,26*at+10,.9)}
   const hy=-h*.84;c.globalCompositeOperation='lighter';for(let i=-2;i<=2;i++)flame(c,i*9,hy-12,18,34+Math.sin(t*7+i)*8-Math.abs(i)*5,t+i,'rgba(255,90,20,.6)','rgba(255,210,90,.6)',null);c.globalCompositeOperation=op;
   for(const s of[-1,1]){c.beginPath();c.moveTo(s*w*.05,hy-12);c.bezierCurveTo(s*w*.22,hy-26,s*w*.28,hy-46,s*w*.2,hy-62);c.bezierCurveTo(s*w*.2,hy-44,s*w*.13,hy-30,s*w*.05,hy-4);c.closePath();const g4=c.createLinearGradient(0,hy,0,hy-62);g4.addColorStop(0,F('#5a4a3a'));g4.addColorStop(1,F('#f4e6cc'));c.fillStyle=g4;c.fill();c.strokeStyle=OL;c.lineWidth=2.5;c.stroke()}
   c.fillStyle=F('#1c1214');c.beginPath();c.moveTo(-16,hy-16);c.quadraticCurveTo(0,hy-24,16,hy-16);c.lineTo(14,hy+6);c.lineTo(6,hy+16);c.lineTo(-6,hy+16);c.lineTo(-14,hy+6);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2.5;c.stroke();
   c.fillStyle='#e8d8c0';for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*4-2,hy+10);c.lineTo(i*4,hy+16+at*4);c.lineTo(i*4+2,hy+10);c.fill()}
   const ec=o.ph>=3?'#ffffff':'#fff2a0';for(const s of[-1,1]){if(ey>.05){gl(c,'#ff9a3a',s*7,hy-4,16*ey,.9);c.fillStyle=ec;c.beginPath();c.moveTo(s*2,hy-3);c.lineTo(s*12,hy-7*ey-1);c.lineTo(s*11,hy-1);c.closePath();c.fill()}else{c.strokeStyle='#ff8a3a';c.lineWidth=1.5;c.beginPath();c.moveTo(s*3,hy-3);c.lineTo(s*11,hy-4);c.stroke()}}},
  wb_nyx(c,o){const w=o.w,h=o.h,t=o.t,at=o.at||0,Rr=h*.34,cy=-h*.52,F=x=>o.fl?'#fff':x,ey=o.eye==null?1:o.eye;c.lineJoin='round';c.lineCap='round';const op=c.globalCompositeOperation;
   for(let i=0;i<7;i++){const a0=i/7*TAU+t*.15;let px=Math.cos(a0)*Rr*.8,py=cy+Math.sin(a0)*Rr*.8;for(let j=1;j<=10;j++){const r=Rr*(.8+j*.13),a=a0+Math.sin(t*2+j*.5+i)*.28*(j/10),x=Math.cos(a)*r,y=cy+Math.sin(a)*r;c.strokeStyle='#2a1450';c.lineWidth=15-j*1.2;c.beginPath();c.moveTo(px,py);c.lineTo(x,y);c.stroke();
     c.globalCompositeOperation='lighter';c.strokeStyle='rgba(154,123,255,.45)';c.lineWidth=Math.max(1,7-j*.6);c.stroke();c.globalCompositeOperation=op;px=x;py=y}
    gl(c,o.ph>=3?'#ff3a6a':'#ff7ad8',px,py,9,.8)}
   const ring=(front)=>{c.save();c.translate(0,cy);c.rotate(-.22);c.strokeStyle=front?'rgba(220,200,255,.9)':'rgba(180,150,255,.45)';c.lineWidth=front?5:4;c.beginPath();c.ellipse(0,0,Rr*1.6,Rr*.36,0,front?0:PI,front?PI:TAU);c.stroke();
    if(front){c.setLineDash([8,14]);c.lineDashOffset=-t*40;c.strokeStyle='rgba(255,220,255,.7)';c.lineWidth=2;c.beginPath();c.ellipse(0,0,Rr*1.45,Rr*.3,0,0,PI);c.stroke();c.setLineDash([])}c.restore()};
   const planets=(front)=>{for(let k=0;k<3;k++){const a=t*.8+k*2.1,s=Math.sin(a);if((s>0)!=front)continue;const[x,y]=rot(Math.cos(a)*Rr*1.55,s*Rr*.34,-.22);c.fillStyle=['#ffd08a','#8ad8ff','#ff8ad0'][k];c.beginPath();c.arc(x,cy+y,5+k*1.5,0,TAU);c.fill();c.strokeStyle=OL;c.lineWidth=1.5;c.stroke()}};
   ring(0);planets(0);
   for(let i=0;i<5;i++){const a=-PI/2+(i-2)*.42,x=Math.cos(a)*Rr*.92,y=cy+Math.sin(a)*Rr*.92,tx=Math.cos(a)*Rr*1.42,ty=cy+Math.sin(a)*Rr*1.42;c.fillStyle='#120828';c.beginPath();c.moveTo(x+Math.cos(a+1.6)*9,y+Math.sin(a+1.6)*9);c.lineTo(tx,ty);c.lineTo(x+Math.cos(a-1.6)*9,y+Math.sin(a-1.6)*9);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();gl(c,b2.c2,tx,ty,8,.8)}
   const g1=c.createRadialGradient(-Rr*.3,cy-Rr*.35,Rr*.1,0,cy,Rr);g1.addColorStop(0,F('#4a2c8a'));g1.addColorStop(1,F('#07030f'));c.fillStyle=g1;c.beginPath();c.arc(0,cy,Rr,0,TAU);c.fill();
   c.save();c.beginPath();c.arc(0,cy,Rr-2,0,TAU);c.clip();c.translate(0,cy);c.rotate(t*.06);c.globalCompositeOperation='lighter';c.drawImage(stars(),-Rr*1.2,-Rr*1.2,Rr*2.4,Rr*2.4);c.restore();
   c.strokeStyle=OL;c.lineWidth=3;c.beginPath();c.arc(0,cy,Rr,0,TAU);c.stroke();c.strokeStyle='rgba(200,170,255,.5)';c.lineWidth=2;c.beginPath();c.arc(0,cy,Rr-4,-2.4,-1.2);c.stroke();
   const ex=0,eyy=cy-Rr*.08,erx=Rr*.62,ery=Rr*.42*Math.max(.04,ey);c.save();c.beginPath();c.ellipse(ex,eyy,erx,ery,0,0,TAU);c.fillStyle=F('#f4ecff');c.fill();c.clip();
   const lx=cl(o.lx||0,-1,1),ly=cl(o.ly||0,-1,1),ix=ex+lx*Rr*.2,iy=eyy+ly*Rr*.08,g2=c.createRadialGradient(ix,iy,1,ix,iy,Rr*.3);g2.addColorStop(0,o.ph>=3?'#ffd0d8':'#ffc8f0');g2.addColorStop(.45,o.ph>=3?'#ff3a6a':'#b07aff');g2.addColorStop(1,'#20083a');c.fillStyle=g2;c.beginPath();c.arc(ix,iy,Rr*.3,0,TAU);c.fill();
   c.fillStyle='#05020a';c.beginPath();c.ellipse(ix,iy,Rr*(.05+at*.04),Rr*.22,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ix-Rr*.1,iy-Rr*.1,3.5,0,TAU);c.fill();c.restore();
   c.strokeStyle='#1a0c30';c.lineWidth=4;c.beginPath();c.ellipse(ex,eyy,erx,ery,0,0,TAU);c.stroke();
   const mo=.15+at*.85,my=cy+Rr*.55;c.fillStyle='#05020a';c.beginPath();c.moveTo(-Rr*.42,my-4);c.quadraticCurveTo(0,my+Rr*.28*mo+4,Rr*.42,my-4);c.quadraticCurveTo(0,my+4,-Rr*.42,my-4);c.fill();
   c.fillStyle=F('#e8e0ff');for(let i=-3;i<=3;i++){const x=i*Rr*.11;c.beginPath();c.moveTo(x-3,my-2+Math.abs(i));c.lineTo(x,my+5+Rr*.12*mo);c.lineTo(x+3,my-2+Math.abs(i));c.fill()}
   ring(1);planets(1)},
  wb_mael(c,o){const w=o.w,h=o.h,t=o.t,at=o.at||0,F=x=>o.fl?'#f0ffff':x,ey=o.eye==null?1:o.eye,N=16,pts=[];c.lineJoin='round';c.lineCap='round';const op=c.globalCompositeOperation;
   for(let i=0;i<N;i++){const u=i/(N-1),x=lerp(-w*.48,w*.24,u),y=-h*.5+Math.sin(t*3.2-u*5)*h*.17*(1-u*.55),r=lerp(5,h*.25,Math.pow(u,.65));pts.push([x,y,r])}
   const tl=pts[0];c.fillStyle=F('#1c6a82');c.beginPath();c.moveTo(tl[0]+4,tl[1]);c.quadraticCurveTo(tl[0]-20,tl[1]-30,tl[0]-34,tl[1]-36+Math.sin(t*4)*6);c.quadraticCurveTo(tl[0]-22,tl[1],tl[0]-34,tl[1]+36+Math.sin(t*4)*6);c.quadraticCurveTo(tl[0]-20,tl[1]+30,tl[0]+4,tl[1]);c.fill();c.strokeStyle=OL;c.lineWidth=2.5;c.stroke();
   for(let i=2;i<N-2;i+=2){const p=pts[i],q=pts[i+1];c.fillStyle=F('#0e3a4e');c.beginPath();c.moveTo(p[0],p[1]-p[2]+2);c.lineTo((p[0]+q[0])/2-4,p[1]-p[2]-10-p[2]*.5);c.lineTo(q[0],q[1]-q[2]+2);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke()}
   c.beginPath();c.moveTo(pts[0][0],pts[0][1]-pts[0][2]);for(const p of pts)c.lineTo(p[0],p[1]-p[2]);for(let i=N-1;i>=0;i--)c.lineTo(pts[i][0],pts[i][1]+pts[i][2]);c.closePath();
   const g1=c.createLinearGradient(0,-h*.82,0,-h*.18);g1.addColorStop(0,F('#0e4a62'));g1.addColorStop(.5,F('#2a8aa4'));g1.addColorStop(.62,F('#9ae0dc'));g1.addColorStop(1,F('#d8fff4'));c.fillStyle=g1;c.fill();c.strokeStyle=OL;c.lineWidth=3;c.stroke();
   c.strokeStyle='rgba(14,58,78,.5)';c.lineWidth=1.6;for(let i=1;i<N-1;i++){const p=pts[i];c.beginPath();c.moveTo(p[0],p[1]+p[2]*.15);c.lineTo(p[0]+3,p[1]+p[2]*.9);c.stroke()}
   c.globalCompositeOperation='lighter';for(let i=2;i<N-1;i++){const p=pts[i],k=.6+.4*Math.sin(t*3+i);c.fillStyle='rgba(122,255,234,'+(.55*k)+')';c.beginPath();c.arc(p[0],p[1]-p[2]*.3,2+p[2]*.12,0,TAU);c.fill()}c.globalCompositeOperation=op;
   const fp=pts[11],fa=Math.sin(t*4)*.3;c.fillStyle=F('#2a8aa4');c.beginPath();c.moveTo(fp[0]-6,fp[1]+fp[2]*.6);const[qx,qy]=rot(-34,30,fa);c.quadraticCurveTo(fp[0]-30,fp[1]+fp[2]+4,fp[0]+qx,fp[1]+qy+fp[2]);c.quadraticCurveTo(fp[0]-8,fp[1]+fp[2]*1.2,fp[0]+8,fp[1]+fp[2]*.6);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();
   const hp2=pts[N-1],hx=hp2[0],hy=hp2[1],r=hp2[2],jo=cl(.12+.08*Math.sin(t*2.4)+at*.7,0,1);
   for(let k=0;k<3;k++){c.fillStyle=F('#0e3a4e');c.beginPath();c.moveTo(hx-4+k*10,hy-r+2);c.lineTo(hx-26+k*8,hy-r-22-k*4);c.lineTo(hx+6+k*10,hy-r+4);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke()}
   c.save();c.translate(hx,hy+r*.15);c.rotate(jo*.45);c.fillStyle=F('#bfeee6');poly(c,[-8,0,w*.22,4,w*.2,12,-6,r*.75]);c.fill();c.strokeStyle=OL;c.lineWidth=2.5;c.stroke();c.fillStyle='#fff';for(let i=1;i<6;i++){const x=i*w*.035;c.beginPath();c.moveTo(x-3,3);c.lineTo(x,-6);c.lineTo(x+3,3);c.fill()}c.restore();
   if(jo>.2)gl(c,b3.c2,hx+w*.12,hy+r*.2,24*jo,.7);
   c.fillStyle=F('#1c6a82');poly(c,[-6,hy-r,hx+w*.12,hy-r*.75,hx+w*.25,hy-2,hx+w*.24,hy+r*.25,hx-4,hy+r*.25]);c.beginPath();c.moveTo(hx-8,hy-r);c.quadraticCurveTo(hx+w*.12,hy-r*1.05,hx+w*.26,hy-3);c.lineTo(hx+w*.24,hy+r*.25);c.lineTo(hx-4,hy+r*.3);c.closePath();
   const g2=c.createLinearGradient(0,hy-r,0,hy+r*.3);g2.addColorStop(0,F('#0e4a62'));g2.addColorStop(1,F('#3ab0c8'));c.fillStyle=g2;c.fill();c.strokeStyle=OL;c.lineWidth=3;c.stroke();
   c.fillStyle='#fff';for(let i=1;i<6;i++){const x=hx+i*w*.04;c.beginPath();c.moveTo(x-3,hy+r*.22);c.lineTo(x,hy+r*.22+9);c.lineTo(x+3,hy+r*.22);c.fill()}
   const ec=o.ph>=3?'#ff4a6a':'#ffe86a',ex=hx+w*.08,eyy=hy-r*.4;if(ey>.05){gl(c,ec,ex,eyy,18*ey,.9);c.fillStyle=ec;c.beginPath();c.ellipse(ex,eyy,7,4.5*ey,-.2,0,TAU);c.fill();c.fillStyle='#05121a';c.beginPath();c.ellipse(ex+1.5,eyy,1.8,3.6*ey,0,0,TAU);c.fill()}else{c.strokeStyle='#05121a';c.lineWidth=2;c.beginPath();c.moveTo(ex-6,eyy);c.lineTo(ex+6,eyy+1);c.stroke()}
   c.strokeStyle='rgba(191,238,230,.8)';c.lineWidth=2.2;for(const s of[0,1]){c.beginPath();c.moveTo(hx+w*.2,hy+(s?4:-2));c.bezierCurveTo(hx+w*.05,hy+30+s*8,hx-w*.12,hy+18+Math.sin(t*3+s)*14,hx-w*.3,hy+28+Math.sin(t*2.4+s)*18);c.stroke()}},
  wb_prism(c,o){const w=o.w,h=o.h,t=o.t,at=o.at||0,F=x=>o.fl?'#fff':x,ey=o.eye==null?1:o.eye;c.lineJoin='round';c.lineCap='round';const op=c.globalCompositeOperation,a0=c.globalAlpha;
   c.save();c.translate(0,-h*.86);c.rotate(t*.5);c.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const a=i/10*TAU,x=Math.cos(a)*36,y=Math.sin(a)*36;c.fillStyle=i%2?'rgba(255,220,140,.75)':'rgba(255,170,230,.75)';poly(c,[x,y-5,x+3,y,x,y+5,x-3,y]);c.fill()}c.restore();c.globalCompositeOperation=op;
   const fa=Math.sin(t*2)*.08;for(const s of[-1,1])for(let i=0;i<4;i++){const ang=[-1.0,-.55,-.1,.32][i]+fa*s,L=h*[.5,.58,.5,.36][i],bx=s*w*.08,by=-h*.66,[tx,ty]=rot(0,-L,ang*s),[lx,ly]=rot(-9,-L*.32,ang*s),[rx,ry]=rot(9,-L*.3,ang*s);
    c.beginPath();c.moveTo(bx,by);c.lineTo(bx+lx,by+ly);c.lineTo(bx+tx,by+ty);c.lineTo(bx+rx,by+ry);c.closePath();const g1=c.createLinearGradient(bx,by,bx+tx,by+ty);g1.addColorStop(0,'rgba(255,255,255,.75)');g1.addColorStop(1,o.fl?'rgba(255,255,255,.8)':'rgba(154,216,255,.45)');c.fillStyle=g1;c.fill();
    c.globalCompositeOperation='lighter';c.strokeStyle='hsl('+((t*80+i*45+(s>0?0:180))%360|0)+',95%,75%)';c.lineWidth=2;c.stroke();c.globalCompositeOperation=op;c.strokeStyle='rgba(60,30,90,.5)';c.lineWidth=1;c.stroke()}
   c.beginPath();c.moveTo(-w*.13,-h*.48);c.lineTo(w*.13,-h*.48);c.lineTo(w*.42,-h*.03);for(let i=6;i>=0;i--){const x=lerp(-w*.42,w*.42,i/6);c.lineTo(x+w*.035,-h*(.03+(i%2?.06:0)))}c.lineTo(-w*.42,-h*.03);c.closePath();
   const g2=c.createLinearGradient(0,-h*.48,0,0);g2.addColorStop(0,F('#fbe6ff'));g2.addColorStop(.6,F('#c08ae8'));g2.addColorStop(1,F('#6a3ab8'));c.fillStyle=g2;c.fill();c.strokeStyle=OL;c.lineWidth=2.5;c.stroke();
   c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.4;c.beginPath();for(let i=0;i<=6;i++){c.moveTo(lerp(-w*.1,w*.1,i/6),-h*.47);c.lineTo(lerp(-w*.4,w*.4,i/6),-h*.05)}c.stroke();
   poly(c,[-w*.12,-h*.48,-w*.15,-h*.66,0,-h*.72,w*.15,-h*.66,w*.12,-h*.48]);c.fillStyle=F('#fff0fb');c.fill();c.strokeStyle=OL;c.lineWidth=2.2;c.stroke();c.strokeStyle='rgba(190,140,230,.6)';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-h*.72);c.lineTo(0,-h*.48);c.moveTo(-w*.15,-h*.66);c.lineTo(w*.12,-h*.48);c.moveTo(w*.15,-h*.66);c.lineTo(-w*.12,-h*.48);c.stroke();
   gl(c,o.ph>=3?b4.c3:b4.c,0,-h*.6,16,.9);c.fillStyle=F('#ffd0f4');poly(c,[0,-h*.65,6,-h*.6,0,-h*.55,-6,-h*.6]);c.fill();
   for(const s of[-1,1]){const up=s>0?at:0,hx=s*w*(.3-up*.06),hy=-h*(.5+up*.28)+Math.sin(t*2+s)*4;c.strokeStyle=OL;c.lineWidth=8;c.beginPath();c.moveTo(s*w*.14,-h*.67);c.quadraticCurveTo(s*w*.28,-h*.6,hx,hy);c.stroke();c.strokeStyle=F('#f8e8ff');c.lineWidth=5;c.stroke();
    if(s>0&&up>0){gl(c,'#ffffff',hx,hy-12,22*up+8,.9);c.fillStyle='#fff';poly(c,[hx,hy-24,hx+7,hy-12,hx,hy,hx-7,hy-12]);c.fill()}}
   const hy=-h*.8;c.fillStyle=F('#d8b8ff');for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*5-4,hy-6);c.lineTo(i*8+Math.sin(t*2+i)*2,hy+22+Math.abs(i)*2);c.lineTo(i*5+4,hy-6);c.fill()}
   c.fillStyle=F('#fff6fc');c.beginPath();c.ellipse(0,hy,13,16,0,0,TAU);c.fill();c.strokeStyle=OL;c.lineWidth=2.2;c.stroke();
   const ec=o.ph>=3?b4.c3:'#ff5ad8';for(const s of[-1,1]){if(ey>.05){gl(c,ec,s*5,hy-1,10*ey,.8);c.fillStyle=ec;c.beginPath();c.moveTo(s*1.5,hy-1);c.quadraticCurveTo(s*5,hy-5*ey-1,s*9,hy-1.5);c.quadraticCurveTo(s*5,hy+2*ey,s*1.5,hy-1);c.fill()}else{c.strokeStyle='#a04090';c.lineWidth=1.4;c.beginPath();c.moveTo(s*2,hy);c.quadraticCurveTo(s*5,hy+2,s*9,hy);c.stroke()}}
   for(let i=-2;i<=2;i++){const L=[14,22,32,22,14][i+2],x=i*7;c.beginPath();c.moveTo(x-4,hy-13);c.lineTo(x,hy-13-L);c.lineTo(x+4,hy-13);c.closePath();const g3=c.createLinearGradient(0,hy-13,0,hy-13-L);g3.addColorStop(0,F('#ff9ae8'));g3.addColorStop(1,'#ffffff');c.fillStyle=g3;c.fill();c.strokeStyle=OL;c.lineWidth=1.6;c.stroke()}
   gl(c,b4.c2,0,hy-20,9,.9);
   for(let k=0;k<2;k++){const a=t*1.4+k*PI,x=Math.cos(a)*w*.62,y=-h*.5+Math.sin(a)*h*.12;c.globalAlpha=a0*(Math.sin(a)>0?1:.55);c.fillStyle=k?'#bfeaff':'#ffd0f4';poly(c,[x,y-11,x+6,y,x,y+11,x-6,y]);c.fill();c.strokeStyle=OL;c.lineWidth=1.5;c.stroke();c.globalAlpha=a0}}};
 const b0=WB[0],b2=WB[2],b3=WB[3],b4=WB[4];
 let STARS=null;function stars(){if(STARS)return STARS;STARS=cvs(256,256);const x=STARS.getContext('2d');let s=11;const r=()=>(s=s*16807%2147483647)/2147483647;
  for(let i=0;i<3;i++){const g=x.createRadialGradient(r()*256,r()*256,4,r()*256,r()*256,90);g.addColorStop(0,['rgba(255,120,220,.35)','rgba(120,140,255,.35)','rgba(180,90,255,.3)'][i]);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,256,256)}
  for(let i=0;i<140;i++){const a=r();x.fillStyle='rgba(255,255,255,'+(.3+a*.7)+')';x.fillRect(r()*256,r()*256,a>.9?2:1,a>.9?2:1)}return STARS}
 // a boss sigil (summoning circle), pre-rendered once per boss
 const SIG={};function sigil(b){if(SIG[b.id])return SIG[b.id];const c=cvs(256,256),x=c.getContext('2d');x.translate(128,128);x.strokeStyle=b.c;x.lineWidth=3;x.beginPath();x.arc(0,0,120,0,TAU);x.stroke();x.lineWidth=2;x.beginPath();x.arc(0,0,104,0,TAU);x.stroke();
  x.beginPath();for(let i=0;i<=7;i++){const a=-PI/2+i*TAU*3/7,px=Math.cos(a)*104,py=Math.sin(a)*104;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.beginPath();x.arc(0,0,52,0,TAU);x.stroke();
  x.fillStyle=b.c2;for(let i=0;i<28;i++){const a=i/28*TAU;x.save();x.rotate(a);x.fillRect(-2,-116,4,i%4?6:11);x.restore()}x.font='bold 13px serif';x.textAlign='center';x.textBaseline='middle';const RN='ᚱᛟᛟᛏᛒᛟᚢᚾᛞ';for(let i=0;i<9;i++){const a=i/9*TAU;x.save();x.rotate(a);x.fillText(RN[i],0,-88);x.restore()}
  return SIG[b.id]=c}

 // ================= hazards of our own (moving walls, beams, wells, rings, projectiles, mirror images) =================
 const PR=[],BM=[],WV=[],WL=[],RG=[],EM=[],CLN=[];
 const later=(t,f)=>{try{BOSSX.Q.push({t,f})}catch(_){setTimeout(f,t*1000)}};
 const aim=(x,y,a,len,t,c)=>{try{BOSSX.AL.push({x,y,a,len,t,t0:t,c})}catch(_){}};
 const hit=(a,kb)=>{try{if(F&&F.st=='fight')BOSSX.hit(a,kb)}catch(_){}};
 const ar=()=>{try{const A=ARENA7.arena;if(A&&!A.end)return A}catch(_){}return null};
 const box=()=>{const A=ar();return A?{l:A.x0+T,r:A.x1-T,t:A.y0+T,b:A.y1-T}:{l:P.x-T*12,r:P.x+T*12,t:P.y-T*12,b:P.y+P.h}};
 const fl=()=>box().b,clX=x=>{const b=box();return cl(x,b.l,b.r)};
 const addZ=(...a)=>BOSSX.addZ(...a),addC=(...a)=>BOSSX.addC(...a);
 // a column from the floor up to above your head (so flying over the boss is no hiding place), or from the arena top down
 function col(x,tel,c,dmg,up,hh){const f=fl();if(up){const H2=Math.max(hh||T*5,f-P.y+T*1.2);return addZ(x-T*.7,f-H2,x+T*.7,f+2,tel,.35,c,dmg,'up')}return addZ(x-T*.75,box().t-T,x+T*.75,f+2,tel,.35,c,dmg,'down')}
 function shot(x,y,a,sp,o){const q=Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:11,c:'#fff',dmg:20,l:5,g:0,home:0,msp:0,kind:'orb',sp0:sp},o);PR.push(q);return q}
 function clearFx(){PR.length=BM.length=WV.length=WL.length=RG.length=EM.length=CLN.length=0}
 const segD=(px,py,x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1,k=cl(((px-x0)*dx+(py-y0)*dy)/l2,0,1);return Math.hypot(px-x0-dx*k,py-y0-dy*k)};
 function tickFx(dt,m){const pcx=P.x,pcy=P.y+P.h/2,f=fl(),A=ar();
  for(let i=PR.length-1;i>=0;i--){const q=PR[i];q.l-=dt;if(q.home){const dx=pcx-q.x,dy=pcy-q.y,d=Math.hypot(dx,dy)||1;q.vx+=dx/d*q.home*dt;q.vy+=dy/d*q.home*dt;const v=Math.hypot(q.vx,q.vy),mx=q.msp||q.sp0;if(v>mx){q.vx*=mx/v;q.vy*=mx/v}}
   q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(!red()&&R()<dt*(q.kind=='star'?10:28))try{VFX.add(0,q.c,q.x,q.y,0,0,.3,10,2,{a:.6})}catch(_){}
   let dead=q.l<=0;if(Math.hypot(pcx-q.x,pcy-q.y)<q.r+P.w*.45){hit(q.dmg,Math.sign(q.vx||1)*220);dead=true}
   if(!dead&&q.y>=f-4&&q.vy>0){dead=true;if(q.land)try{q.land(q)}catch(e){console.error(e)}}
   if(!dead&&A&&(q.x<A.x0-T*3||q.x>A.x1+T*3||q.y<A.y0-T*6||q.y>A.y1+T*2))dead=true;
   if(dead){try{VFX.burst(q.x,q.y,[q.c,'#fff'],5,130,1,.4,9)}catch(_){}PR.splice(i,1)}}
  for(let i=BM.length-1;i>=0;i--){const b=BM[i];if(b.src){b.x=b.src.x+b.ox;b.y=b.src.y+b.oy}else if(b.x==null){b.x=0;b.y=0}if(b.tel>0){b.tel-=dt;if(b.tel<=0){tone(220,180,.5,'sawtooth',.04);shk(.08)}continue}
   b.act-=dt;b.a+=b.va*dt;b.rt-=dt;const ex=b.x+Math.cos(b.a)*b.len,ey=b.y+Math.sin(b.a)*b.len;if(b.rt<=0&&segD(pcx,pcy,b.x,b.y,ex,ey)<b.w/2+P.w*.35){b.rt=.5;hit(b.dmg,Math.sign(pcx-b.x||1)*240)}if(b.act<=0)BM.splice(i,1)}
  for(let i=WV.length-1;i>=0;i--){const v=WV[i];if(v.tel>0){v.tel-=dt;if(v.tel<=0){tone(v.kind=='fire'?90:140,60,.6,'sawtooth',.05);shk(.1)}continue}v.x+=v.d*v.sp*dt;v.l-=dt;
   if(!red()&&R()<dt*40)try{VFX.add(0,v.kind=='fire'?(R()<.5?'#ffd24a':'#ff6a1a'):'#dff8ff',v.x+rn(-v.w/2,v.w/2),f-rn(0,v.h),-v.d*rn(20,80),-rn(30,120),.5,10,3,{a:.8})}catch(_){}
   if(!v.hit&&Math.abs(P.x-v.x)<v.w/2+P.w*.4&&P.y+P.h>f-v.h){v.hit=1;hit(v.dmg,v.d*420)}if(v.l<=0||(A&&(v.x<A.x0-T||v.x>A.x1+T)))WV.splice(i,1)}
  for(let i=WL.length-1;i>=0;i--){const q=WL[i];if(q.tel>0){q.tel-=dt;continue}q.t-=dt;q.rt-=dt;const dx=q.x-pcx,dy=q.y-pcy,d=Math.hypot(dx,dy)||1;
   if(d<q.reach){const k=1-d/q.reach,s=q.str*(.35+.65*k);P.vx+=dx/d*s*dt*(P.g?1.6:1);if(q.kind=='hole')P.vy+=dy/d*s*dt*.8;if(!red()&&R()<dt*30){const a=R()*TAU,rr=q.reach*rn(.4,.9);try{VFX.add(0,q.c,q.x+Math.cos(a)*rr,q.y+Math.sin(a)*rr*(q.kind=='whirl'?.25:1),-Math.cos(a)*rr*.9,-Math.sin(a)*rr*.9*(q.kind=='whirl'?.25:1),.8,10,3,{a:.7})}catch(_){}}}
   if(d<q.r*1.1&&q.rt<=0){q.rt=.5;hit(q.dmg,Math.sign(-dx||1)*300)}
   if(q.t<=0){if(q.boom){addC(q.x,q.y,q.r*2.6,.05,.3,q.c,q.dmg*1.3,420);try{VFX.shatter(q.x,q.y,[q.c,'#fff'],18)}catch(_){}shk(.18)}WL.splice(i,1)}}
  for(let i=RG.length-1;i>=0;i--){const g=RG[i];g.r+=g.sp*dt;const dx=pcx-g.x,dy=pcy-g.y,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-g.gap;da=Math.atan2(Math.sin(da),Math.cos(da));
   if(!g.hit&&Math.abs(d-g.r)<g.w/2+P.w*.35&&Math.abs(da)>g.gw/2){g.hit=1;hit(g.dmg,Math.sign(dx||1)*380)}if(g.r>g.max)RG.splice(i,1)}
  for(let i=EM.length-1;i>=0;i--){const e=EM[i];e.t-=dt;e.acc+=dt;e.a+=e.va*dt;const s=e.m;while(e.acc>=e.step){e.acc-=e.step;for(let k=0;k<e.arms;k++)shot(s.x,s.y+s.h*.5,e.a+k*TAU/e.arms,e.sp,{r:9,c:e.c,dmg:e.dmg,kind:e.kind,l:5})}if(e.t<=0||!mobs.includes(s))EM.splice(i,1)}
  for(let i=CLN.length-1;i>=0;i--){const q=CLN[i];q.t-=dt;q.fade=Math.min(1,q.fade+dt*2);q.ft-=dt;if(q.ft<=0&&q.t>.5){q.ft=1.15;const a=Math.atan2(pcy-q.y,pcx-q.x);aim(q.x,q.y,a,T*24,.5,'#ffd0f4');later(.5,()=>{if(m&&mobs.includes(m))shot(q.x,q.y,a,700,{r:9,c:'#ffd0f4',dmg:m.dmg*.6,kind:'shard',l:3})})}if(q.t<=0){try{VFX.shatter(q.x,q.y,['#ffd0f4','#bfeaff','#fff'],12)}catch(_){}CLN.splice(i,1)}}}
 function drawFx(c,cx,cy,now){const t=now/1000,op='source-over';c.save();
  for(const v of WV){const x=v.x-cx,f=fl()-cy;if(v.tel>0){const k=.4+.4*Math.sin(t*14);c.globalAlpha=k;c.fillStyle=v.c;c.fillRect(x-(v.d>0?0:T*.6),f-v.h,T*.6,v.h);c.globalAlpha=1;continue}
   if(v.kind=='fire'){c.globalCompositeOperation='lighter';for(let i=-2;i<=2;i++)flame(c,x+i*v.w*.18,f,v.w*.5,v.h*(1-Math.abs(i)*.12)+Math.sin(t*9+i)*8,t+i,'rgba(255,80,20,.55)','rgba(255,200,70,.55)',i==0?'rgba(255,255,220,.45)':null);c.globalCompositeOperation=op}
   else{const g=c.createLinearGradient(0,f-v.h,0,f);g.addColorStop(0,'rgba(220,250,255,.95)');g.addColorStop(1,'rgba(40,140,200,.85)');c.fillStyle=g;c.beginPath();c.moveTo(x-v.d*v.w*.9,f);c.quadraticCurveTo(x-v.d*v.w*.5,f-v.h*.95,x+v.d*v.w*.15,f-v.h);c.quadraticCurveTo(x+v.d*v.w*.55,f-v.h*.9,x+v.d*v.w*.35,f-v.h*.55);c.quadraticCurveTo(x+v.d*v.w*.6,f-v.h*.3,x+v.d*v.w*.5,f);c.closePath();c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.stroke()}}
  for(const q of WL){const x=q.x-cx,y=q.y-cy,k=q.tel>0?.4:Math.min(1,(q.t0-q.t)/.5)*Math.min(1,q.t/.4+.2);c.globalAlpha=k;
   if(q.kind=='hole'){c.globalCompositeOperation='lighter';c.drawImage(glo(q.c),x-q.reach*.45,y-q.reach*.45,q.reach*.9,q.reach*.9);c.globalCompositeOperation=op;c.fillStyle='#000';c.beginPath();c.arc(x,y,q.r,0,TAU);c.fill();c.strokeStyle='#ffd0ff';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.ellipse(x,y,q.r*(1.6+i*.6),q.r*(.5+i*.2),t*(1.5+i*.4),0,PI*1.4);c.stroke()}}
   else{c.strokeStyle=q.c;c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.ellipse(x,y,q.r*(1.2+i*.9),q.r*(.35+i*.18),0,t*(3+i)+i,t*(3+i)+i+PI*1.2);c.stroke()}c.fillStyle='rgba(10,40,60,.8)';c.beginPath();c.ellipse(x,y,q.r,q.r*.3,0,0,TAU);c.fill()}c.globalAlpha=1}
  for(const g of RG){const x=g.x-cx,y=g.y-cy;c.globalCompositeOperation='lighter';c.strokeStyle=g.c;c.lineWidth=g.w;c.globalAlpha=.35;c.beginPath();c.arc(x,y,g.r,g.gap+g.gw/2,g.gap-g.gw/2+TAU);c.stroke();c.globalAlpha=1;c.lineWidth=4;c.strokeStyle='#fff';c.stroke();c.globalCompositeOperation=op}
  for(const b of BM){const x=b.x-cx,y=b.y-cy,ex=x+Math.cos(b.a)*b.len,ey=y+Math.sin(b.a)*b.len;if(b.tel>0){c.globalAlpha=.35+.35*Math.sin(t*16);c.strokeStyle=b.c;c.lineWidth=2;c.setLineDash([12,10]);c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);c.globalAlpha=1;continue}
   c.globalCompositeOperation='lighter';const col=b.rb?'hsl('+((t*120)%360|0)+',95%,70%)':b.c;c.strokeStyle=col;c.globalAlpha=.3;c.lineWidth=b.w*1.8;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.globalAlpha=.9;c.lineWidth=b.w*.75;c.stroke();c.strokeStyle='#fff';c.lineWidth=b.w*.3;c.stroke();c.globalAlpha=1;c.globalCompositeOperation=op}
  for(const q of CLN){c.save();c.globalAlpha=.5*q.fade*Math.min(1,q.t*2);c.translate(q.x-cx,q.y-cy+65);c.scale(.7,.7);try{ART.wb_prism(c,{w:130,h:190,t,fl:0,ph:2,eye:1,at:0})}catch(_){}c.restore()}
  c.globalCompositeOperation='lighter';for(const q of PR){const x=q.x-cx,y=q.y-cy,r=q.r;c.drawImage(glo(q.c),x-r*2.2,y-r*2.2,r*4.4,r*4.4);
   if(q.kind=='shard'||q.kind=='comet'){const a=Math.atan2(q.vy,q.vx);c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#fff';poly(c,[r*1.4,0,0,r*.45,-r*1.8,0,0,-r*.45]);c.fill();c.restore()}
   else if(q.kind=='star'){c.fillStyle='#fff';c.save();c.translate(x,y);c.rotate(t*4);poly(c,[0,-r,r*.3,-r*.3,r,0,r*.3,r*.3,0,r,-r*.3,r*.3,-r,0,-r*.3,-r*.3]);c.fill();c.restore()}
   else if(q.kind=='bubble'){c.globalCompositeOperation=op;c.strokeStyle='rgba(220,250,255,.9)';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(x-r*.35,y-r*.35,r*.22,0,TAU);c.fill();c.globalCompositeOperation='lighter'}
   else if(q.kind=='seed'){c.globalCompositeOperation=op;c.fillStyle='#5a3a1a';c.beginPath();c.ellipse(x,y,r*.8,r,t*3,0,TAU);c.fill();c.fillStyle='#9be070';c.beginPath();c.ellipse(x,y-r*.6,r*.5,r*.25,0,0,TAU);c.fill();c.globalCompositeOperation='lighter'}
   else{c.fillStyle=q.kind=='fire'?'#fff2c0':'#fff';c.beginPath();c.arc(x,y,r*.5,0,TAU);c.fill()}}
  c.restore()}

 // ================= attacks (called by BOSSX: ATK[id][name](m, phase II+, phase III)) =================
 const ATK={
  wb_root:{
   bramble(m,p2,p3){const n=p3?7:p2?5:3;for(let i=0;i<n;i++)col(clX(P.x+(i-(n-1)/2)*T*2.2+rn(-10,10)),.85+i*.17,'#7ad65a',m.dmg*1.05,1,T*5.5);say6('BRAMBLES','',700)},
   swipe(m,p2){m.att=1.2;const f=fl(),d=Math.sign(P.x-m.x)||1,go=s=>{const a=m.x+s*m.w*.2,b=a+s*T*12;addZ(clX(Math.min(a,b)),f-T*2.6,clX(Math.max(a,b)),f+2,1.0,.3,'#d8b070',m.dmg*1.3,'slam',460)};go(d);if(p2)later(.75,()=>go(-d))},
   pods(m,p2,p3){const n=p3?6:p2?4:3;for(let i=0;i<n;i++){const tx=clX(P.x+rn(-T*5,T*5)),sx=m.x,sy=m.y+m.h*.3,tt=1.05+i*.13,vx=(tx-sx)/tt,vy=(fl()-sy-.5*900*tt*tt)/tt;
     PR.push({x:sx,y:sy,vx,vy,g:900,r:13,c:'#9be070',dmg:m.dmg*.7,l:4,kind:'seed',sp0:999,home:0,land:q=>{addC(q.x,fl()-T*.7,T*1.9,.35,.3,'#9be070',m.dmg);if(p3)addZ(q.x-T*1.2,fl()-T*.5,q.x+T*1.2,fl()+2,.5,2.2,'#6fbf4a',m.dmg*.15,'fire',120,.5).ah=1}})}},
   grasp(m,p2,p3){const n=p3?11:8;for(let i=0;i<n;i++)later(i*.3,()=>col(clX(P.x+P.vx*.25),.55,'#8fdc5a',m.dmg*1.1,1,T*4.5));later(n*.3+.6,()=>{});say6('THE ROOTS HUNT YOU','',900)},
   forest(m){const b=box(),wave=tel=>{const g1=rn(b.l+T*3,b.r-T*3);let g2=rn(b.l+T*3,b.r-T*3);for(let k=0;k<8&&Math.abs(g2-g1)<T*8;k++)g2=rn(b.l+T*3,b.r-T*3);
     for(let x=b.l+T*.7;x<b.r;x+=T*1.45){if(Math.abs(x-g1)<T*1.8||Math.abs(x-g2)<T*1.8)continue;col(x,tel,'#7ad65a',m.dmg*1.2,1,T*6)}for(const gx of[g1,g2])addZ(gx-T*1.6,fl()-T*.4,gx+T*1.6,fl()+2,tel,.01,'#ffffff',0,'up').ah=1};
    wave(1.5);later(1.9,()=>wave(1.3));say6('THE FOREST ERUPTS','Find the gaps!',1200)}},
  wb_pyre:{
   fireballs(m,p2,p3){const vol=()=>{const n=p3?9:p2?7:5,sx=m.x,sy=m.y+m.h*.45,a0=Math.atan2(P.y+P.h/2-sy,P.x-sx);for(let i=0;i<n;i++)shot(sx,sy,a0+(i-(n-1)/2)*.16,340,{r:12,c:'#ff7a2a',dmg:m.dmg*.75,kind:'fire',l:4});tone(300,120,.3,'sawtooth',.05)};m.att=.6;vol();if(p3)later(.7,vol)},
   meteors(m,p2,p3){const n=p3?9:p2?7:5,b=box();for(let i=0;i<n;i++){const x=clX(P.x+rn(-T*7,T*7)),tel=1.0+i*.2;addZ(x-T*.9,b.t-T,x+T*.9,fl()+2,tel,.35,'#ff8a3a',m.dmg*1.2,'down');if(p2)later(tel+.3,()=>{addZ(x-T*1.3,fl()-T*.6,x+T*1.3,fl()+2,.01,2.4,'#ff5a1a',m.dmg*.16,'fire',120,.5).ah=1})}say6('METEORS','',800)},
   flamewall(m,p2,p3){const b=box(),d=P.x>(b.l+b.r)/2?1:-1,go=(d,dl)=>WV.push({x:d>0?b.l:b.r,d,sp:p3?380:320,h:T*2.3,w:T*1.2,tel:1.1+dl,l:9,c:'#ff6a1a',dmg:m.dmg*1.15,kind:'fire',hit:0});go(d,0);if(p2)go(-d,1.4);later(p2?5.6:4.4,()=>{});say6('WALL OF FIRE','Jump it!',1100)},
   nova(m,p2,p3){m.att=1.2;addC(m.x,m.y+m.h*.5,T*(p3?6.5:5.5),1.0,.35,'#ffb02a',m.dmg*1.35,420);say6('NOVA','Get away!',800)},
   hellrain(m){const b=box();for(let i=0;i<30;i++)later(i*.1,()=>shot(rn(b.l,b.r),b.t,PI/2+rn(-.15,.15),rn(240,330),{g:260,r:10,c:'#ff8a3a',dmg:m.dmg*.6,kind:'fire',l:5}));later(3.6,()=>{});say6('CINDER RAIN','',1000)}},
  wb_nyx:{
   spiral(m,p2,p3){const d=p3?3:2.4;EM.push({m,t:d,step:.11,acc:0,arms:p3?4:p2?3:2,a:R()*TAU,va:p3?2.2:1.8,sp:p3?210:180,c:'#c9b0ff',dmg:m.dmg*.6,kind:'star'});m.att=d;later(d,()=>{});say6('STARFALL SPIRAL','',900)},
   comets(m,p2,p3){const n=p3?8:p2?6:4,b=box();for(let i=0;i<n;i++){const left=R()<.5,sx=left?b.l-T:b.r+T,sy=rn(b.t,fl()-T*1.5),tx=P.x+rn(-T*3,T*3),ty=P.y+P.h/2+rn(-T*2,T*2),a=Math.atan2(ty-sy,tx-sx),dl=i*.28;
     later(dl,()=>aim(sx,sy,a,T*60,.75,'#ffd0ff'));later(dl+.75,()=>{if(mobs.includes(m))shot(sx,sy,a,950,{r:13,c:'#ffd0ff',dmg:m.dmg*.9,kind:'comet',l:3})})}},
   blackhole(m,p2,p3){const b=box(),x=clX(P.x+rn(-T*3,T*3)),y=cl(P.y+P.h/2-T*2,b.t+T*3,fl()-T*3);WL.push({x,y,r:T*1.3,reach:T*12,str:p3?520:420,t:4.6,t0:4.6,tel:.8,dmg:m.dmg*.8,c:'#9a7bff',rt:0,kind:'hole',boom:1});later(5.6,()=>{});say6('BLACK HOLE','Pull away!',1100)},
   eyebeam(m,p2,p3){const a0=Math.atan2(P.y+P.h/2-(m.y+m.h*.5),P.x-m.x),dir=R()<.5?1:-1;m.att=3;BM.push({src:m,ox:0,oy:m.h*.45,a:a0-dir*.95,va:dir*(p3?1.15:.95),len:T*34,w:30,tel:1.0,act:2.0,c:'#ff7ad8',dmg:m.dmg,rt:0});later(3.2,()=>{});say6('EYE OF THE VOID','',900)},
   supernova(m){m.att=4;for(let i=0;i<3;i++)later(1.4+i*1.0,()=>{if(!mobs.includes(m))return;RG.push({x:m.x,y:m.y+m.h*.5,r:m.w*.4,sp:330,w:22,gap:R()*TAU,gw:.9,c:i%2?'#ff7ad8':'#c9b0ff',dmg:m.dmg*1.2,hit:0,max:T*40});tone(180,90,.6,'sawtooth',.05);shk(.12)});later(5.2,()=>{});say6('SUPERNOVA','Slip through the gaps!',1300)}},
  wb_mael:{
   tidal(m,p2,p3){const b=box(),d=P.x>(b.l+b.r)/2?1:-1,go=(d,dl)=>WV.push({x:d>0?b.l:b.r,d,sp:p3?400:340,h:T*2.4,w:T*1.6,tel:1.0+dl,l:9,c:'#5ad8ff',dmg:m.dmg*1.1,kind:'water',hit:0});go(d,0);if(p2)go(-d,1.2);if(p3)go(d,2.4);later(4.6,()=>{});say6('TIDAL WAVE','Jump it!',1000)},
   bubbles(m,p2,p3){const n=p3?8:p2?6:4;m.att=.8;for(let i=0;i<n;i++){const a=-PI/2+(i-(n-1)/2)*.45;shot(m.x+m.w*.3*(P.x>m.x?1:-1),m.y+m.h*.5,a,160,{home:220,msp:p3?170:140,r:15,c:'#9af0ff',dmg:m.dmg*.7,kind:'bubble',l:7})}},
   geysers(m,p2,p3){const n=p3?8:p2?6:4;for(let i=0;i<n;i++)later(i*.35,()=>col(clX(P.x+P.vx*.3),.7,'#5ad8ff',m.dmg*1.05,1,T*7))},
   whirlpool(m,p2,p3){const x=clX(P.x+rn(-T*2,T*2));WL.push({x,y:fl()-T*.8,r:T*1.4,reach:T*13,str:p3?560:460,t:4.4,t0:4.4,tel:.7,dmg:m.dmg*.8,c:'#3ac8e0',rt:0,kind:'whirl',boom:0});later(5,()=>{});say6('WHIRLPOOL','Fight the current!',1100)},
   charge(m){const b=box(),y=cl(P.y+P.h/2,b.t+m.h*.5,fl()-m.h*.4),tx=m.x<(b.l+b.r)/2?b.r-m.w*.5:b.l+m.w*.5;m.att=1.6;m.dash={t:0,tel:1.0,tx,y};addZ(Math.min(m.x,tx)-m.w*.5,y-m.h*.45,Math.max(m.x,tx)+m.w*.5,y+m.h*.45,1.0,.5,'#7affea',m.dmg*1.4,'beam',480);say6('CHARGE','',700)},
   maelstrom(m,p2,p3){ATK.wb_mael.whirlpool(m,p2,p3);later(.8,()=>{if(mobs.includes(m))ATK.wb_mael.bubbles(m,p2,p3)});later(1.6,()=>{if(mobs.includes(m))ATK.wb_mael.geysers(m,p2,p3)});say6('MAELSTROM','',1000)}},
  wb_prism:{
   shards(m,p2,p3){const n=p3?12:p2?8:6,sx=m.x,sy=m.y+m.h*.45,a0=Math.atan2(P.y+P.h/2-sy,P.x-sx);m.att=.9;for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*(p3?.14:.2);aim(sx,sy,a,T*26,.7,'#ffd0f4');later(.7,()=>{if(mobs.includes(m))shot(sx,sy,a,760,{r:10,c:'#ffd0f4',dmg:m.dmg*.75,kind:'shard',l:3})})}},
   pillars(m,p2){const b=box(),dir=P.x>(b.l+b.r)/2?-1:1,run=(d,dl)=>{let i=0;for(let x=d>0?b.l+T:b.r-T;x>=b.l&&x<=b.r;x+=d*T*2.2,i++)col(x,.9+dl+i*.11,'#ff8ae0',m.dmg*1.1,0)};run(dir,0);if(p2)run(-dir,1.1);say6('PILLARS OF LIGHT','',900)},
   rainbow(m,p2,p3){const b=box(),f=fl(),n=p3?4:p2?3:2,lv=[T*.9,T*3.4,T*5.9,T*8.4,T*10.9].map(v=>f-v),py=P.y+P.h*.5;let near=0;for(let i=1;i<lv.length;i++)if(Math.abs(lv[i]-py)<Math.abs(lv[near]-py))near=i;
    const pick=[near];while(pick.length<n){const k=R()*lv.length|0;if(!pick.includes(k))pick.push(k)}pick.forEach((k,i)=>addZ(b.l,lv[k]-14,b.r,lv[k]+14,1.2+i*.25,.35,['#ff7a9a','#ffd27a','#7affb0','#7ac8ff','#c49aff'][k],m.dmg*1.1,'beam'));say6('RAINBOW','',800)},
   mirrors(m,p2,p3){const b=box(),n=p3?3:2;for(let i=0;i<n;i++)CLN.push({x:rn(b.l+T*2,b.r-T*2),y:rn(b.t+T*2,fl()-T*5),t:4.6,ft:.8+i*.3,fade:0});later(4.6,()=>{});say6('MIRROR IMAGES','',900)},
   lattice(m){const b=box(),f=fl(),set=(off,ys)=>{for(let i=0;i<5;i++)col(lerp(b.l+T*2,b.r-T*2,(i+off)/4.5),1.4,'#ff8ae0',m.dmg*1.15,0);for(const y of ys)addZ(b.l,y-14,b.r,y+14,1.4,.35,'#9ad8ff',m.dmg*1.15,'beam')};set(0,[f-T*1.1,f-T*5.6]);later(2.1,()=>{if(mobs.includes(m))set(.5,[f-T*3.3,f-T*8])});say6('CRYSTAL LATTICE','',1100)},
   prismburst(m,p2,p3){const a=R()*TAU,n=p3?3:2;m.att=4.3;for(let k=0;k<n;k++)BM.push({src:m,ox:0,oy:m.h*.45,a:a+k*TAU/n,va:1.0,len:T*30,w:24,tel:1.1,act:3.2,c:'#ff8ae0',dmg:m.dmg*.9,rt:0,rb:1});later(4.4,()=>{});say6('PRISM BURST','',900)}}};
 const LIST={wb_root:[['bramble','swipe','pods'],['bramble','swipe','pods','grasp'],['swipe','grasp','forest','pods','bramble']],
  wb_pyre:[['fireballs','meteors','flamewall'],['fireballs','meteors','flamewall','nova'],['meteors','nova','hellrain','flamewall','fireballs']],
  wb_nyx:[['spiral','comets','blackhole'],['spiral','comets','blackhole','eyebeam'],['eyebeam','supernova','blackhole','spiral','comets']],
  wb_mael:[['tidal','bubbles','geysers'],['tidal','bubbles','geysers','whirlpool','charge'],['charge','maelstrom','whirlpool','tidal','geysers']],
  wb_prism:[['shards','pillars','rainbow'],['shards','pillars','rainbow','mirrors'],['lattice','prismburst','mirrors','rainbow','shards','pillars']]};
 try{for(const id in ATK){BOSSX.ATK[id]=ATK[id];BOSSX.LIST[id]=LIST[id]}for(const k of['swipe','grasp','forest','meteors','flamewall','nova','hellrain','blackhole','eyebeam','supernova','tidal','whirlpool','charge','maelstrom','pillars','rainbow','lattice','prismburst'])BOSSX.BIG[k]=1;
  // phase II-III arena hazards in each boss's element
  const top=gy2=>{const A=ar();return A?A.y0:gy2-T*14};
  BOSSX.EXT.wb_root=(m,x,gy,tel,d)=>addZ(x-T*.6,gy-T*4.5,x+T*.6,gy+2,tel,.35,'#9be070',d,'up');
  BOSSX.EXT.wb_pyre=(m,x,gy,tel,d)=>{const z=addZ(x-T*.7,gy-T*6,x+T*.7,gy+2,tel,.4,'#ff8a3a',d,'up');addZ(x-T*1.1,gy-T*.6,x+T*1.1,gy+2,tel+.4,1.8,'#ff5a1a',d*.2,'fire',120,.55).ah=1;return z};
  BOSSX.EXT.wb_nyx=(m,x,gy,tel,d)=>addZ(x-T*.5,top(gy),x+T*.5,gy+2,tel,.25,'#c9b0ff',d,'down');
  BOSSX.EXT.wb_mael=(m,x,gy,tel,d)=>addZ(x-T*.7,gy-T*6,x+T*.7,gy+2,tel,.4,'#6ac8ff',d,'up');
  BOSSX.EXT.wb_prism=(m,x,gy,tel,d)=>addZ(x-T*.5,top(gy),x+T*.5,gy+2,tel,.25,'#ff9ae8',d,'down')}catch(e){console.error('WBOSS13 attacks',e)}

 // ================= the sequence: quake -> collapse -> cinematic -> arena -> fight -> world back =================
 let F=null,SNAP=null,VOID=null,Qd=null,HELD=[];const DB=[];
 const hold=()=>{if(!F)return;P.x=F.px;P.y=F.py;P.vx=P.vy=0;iT=Math.max(iT,.6)};
 function start(n,first){if(F||!need(n)||n!==cur||!entered)return false;try{if(BOSS6.active()){say('Finish the fight you are in first');return false}}catch(_){}
  const b=bossFor(n);F={st:'quake',b,w:n,t0:performance.now(),px:P.x,py:P.y,first:!!first,ev:{}};try{WORD9.close()}catch(_){}
  say6('THE GROUND TREMBLES',b.sn+' wants the letters back',2200);tone(45,30,2.4,'sawtooth',.06);tone(70,40,2,'sine',.05,.3);return true}
 function found(n){setTimeout(()=>{if(cur===n&&need(n))start(n,true)},1500)}
 // the collapse: everything off screen goes at once, the blocks in view crumble outward from you, then the rest of the world is wiped
 let SCH=[],SI=0;
 function collapse(){F.st='collapse';F.t0=performance.now();
  SNAP={t:tiles.slice(),hp:hp.slice(),wl:wl.slice(),tr:Array.from(trees),bw:(()=>{try{return WALL9.bw.slice()}catch(_){return null}})(),dr:drops.splice(0),px:F.px,py:F.py};
  mobs.length=0;const vw=cv.width/ZM,vh=cv.height/ZM,x0=Math.max(0,(cam.x/T|0)-1),x1=Math.min(W-1,((cam.x+vw)/T|0)+1),y0=Math.max(0,(cam.y/T|0)-1),y1=Math.min(H-1,((cam.y+vh)/T|0)+1);
  const cx=P.x/T,cy=(P.y+P.h)/T,md=Math.hypot(Math.max(cx-x0,x1-cx),Math.max(cy-y0,y1-cy))||1;let bw=null;try{bw=WALL9.bw}catch(_){}
  const ids={};SCH=[];SI=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,b=tiles[k];if(!b&&!trees.has(k)&&!(bw&&bw[k]))continue;
   if(x>=x0&&x<=x1&&y>=y0&&y<=y1){SCH.push({k,t:Math.hypot(x-cx,y-cy)/md*2.3+R()*.45});if(b&&SOLID6[b])ids[b]=(ids[b]|0)+1}else{tiles[k]=0;hp[k]=0;wl[k]=0;trees.delete(k);if(bw&&bw[k])try{WALL9.set(k,0)}catch(_){}}}
  SCH.sort((a,b2)=>a.t-b2.t);F.ids=Object.keys(ids).sort((a,b2)=>ids[b2]-ids[a]).slice(0,5).map(Number);
  tone(60,30,3,'sawtooth',.07);tone(110,40,2.6,'square',.025,.4);say6('THE WORLD COLLAPSES','',2400)}
 function crumble(k){const b=tiles[k];tiles[k]=0;hp[k]=0;wl[k]=0;trees.delete(k);try{if(WALL9.bw[k])WALL9.set(k,0)}catch(_){}
  if(b&&DB.length<220&&R()<.75)DB.push({x:(k%W+.5)*T,y:((k/W|0)+.5)*T,vx:rn(-90,90),vy:rn(-260,-40),r:rn(0,6),vr:rn(-6,6),b,l:rn(1.2,2),l0:2,s:rn(.45,.85)})
  else if(b&&R()<.3)try{VFX.add(0,(BLK[b]||[0,'#888'])[1],(k%W+.5)*T,((k/W|0)+.5)*T,rn(-40,40),rn(-80,0),.6,12,4,{a:.7})}catch(_){}}
 function wipe(){tiles.fill(0);hp.fill(0);wl.fill(0);trees.clear();try{WALL9.clear()}catch(_){}try{pop.clear();hitAt.clear()}catch(_){}drops.length=0;mobs.length=0;
  VOID={b:F.b,img:voidImg(F.b),frag:frags(F.ids)};document.body.classList.add('wb13v')}
 // after the cinematic: a 46 x 24 arena square in the void (2 rows of bedrock), you on the left, the boss summoned on the right
 function arena(){const b=F.b;let cx=cl(Math.round(F.px/T),AW/2+2,W-AW/2-3);const far=AW/2+18;if(Math.abs(cx-DX)<far)cx=cx<DX&&DX-far>=AW/2+2?DX-far:Math.min(W-AW/2-3,DX+far);
  const fy=cl(Math.round(sh(cx)),AH+3,H-4),x0=cx-(AW>>1),x1=x0+AW-1;for(let x=x0;x<=x1;x++)for(const y of[fy,fy+1]){tiles[y*W+x]=4;hp[y*W+x]=BLK[4][2]}
  F.ar={x0,x1,fy};P.x=(x0+AW*.22)*T;P.y=fy*T-P.h-1;P.vx=P.vy=0;try{P.hp=maxHP()}catch(_){}F.px=P.x;F.py=P.y;
  const vw=cv.width/ZM,vh=cv.height/ZM;cam.x=cl(P.x-vw/2,0,W*T-vw);cam.y=cl(P.y-vh/2,-200,H*T-vh);
  try{BOSS6.clear()}catch(_){}let ok=false;for(let i=0;i<6&&!ok;i++)ok=BOSS6.spawn(b.id);if(!ok){lost(true);return}
  const m=BOSS6.active();m.x=(x0+AW*.74)*T;m.y=b.ai=='fly'?fy*T-m.h-T*3.5:fy*T-m.h-1;m.vx=m.vy=0;F.m=m;
  const A=ARENA7.arena;if(A){A.x0=x0*T;A.x1=(x1+1)*T;A.y0=(fy-AH)*T;A.y1=(fy+1)*T;const w=A.x1-A.x0,h=A.y1-A.y0,sc=cv.height/Math.max(1,innerHeight),fz=Math.min(cv.width/(w+T),(cv.height-220*sc)/(h-T*.5));
   if(fz<ZM){const z=Math.max(.7,Math.floor(fz*20)/20);if(z<ZM){const k=ZM/z;ZM=z;try{mx*=k;my*=k}catch(_){}A.zs=z}}A.fit=w<=cv.width/ZM-T*.5&&h<=cv.height/ZM-2*110*sc/ZM}
  F.st='fight';F.t0=performance.now();F.ev={};tone(55,110,1.2,'sawtooth',.05);netWB('start');tell('is fighting '+b.sn+'!')}
 function restore(){const s=SNAP;if(!s)return;tiles.set(s.t);hp.set(s.hp);wl.set(s.wl);trees.clear();for(const[k,v]of s.tr)trees.set(k,v);
  try{const bw=WALL9.bw;if(s.bw)for(let k=0;k<bw.length;k++)if(bw[k]!==s.bw[k])WALL9.set(k,s.bw[k])}catch(_){}drops.length=0;for(const d of s.dr)drops.push(d);
  VOID=null;SNAP=null;DB.length=0;document.body.classList.remove('wb13v');P.x=s.px;P.y=s.py;P.vx=P.vy=0;clearFx();
  const h=HELD;HELD=[];for(const f of h)try{f()}catch(e){console.error('WBOSS13 held',e)}}
 function won(){const b=F.b;S.w[F.w]=1;save();restore();const n=F.w;F=null;try{P.hp=maxHP()}catch(_){}tell('defeated '+b.sn+'!');
  say6('THE WORLD RETURNS','The Word Gate is open',2600);try{VFX.levelUp(P.x,P.y,b.c)}catch(_){}
  setTimeout(()=>{try{if(cur===n&&entered)WORD9.open()}catch(_){}},1600)}
 function lost(quiet){const b=F&&F.b;restore();F=null;try{P.hp=maxHP()}catch(_){}try{BOSS6.clear()}catch(_){}
  if(!quiet&&b)setTimeout(()=>say6(b.sn.toUpperCase()+' STILL HOLDS THE GATE','Press L to face '+him(b)+' again',3200),3800)}
 function abort(){if(!F)return;CIN.stop(true);try{BOSS6.clear();BOSS10.stop()}catch(_){}restore();F=null}
 // ---- per frame (after the game's update): the sequence, our hazards, the world-boss attack pacing
 function flow(dt){if(!F)return;const now=performance.now(),el=(now-F.t0)/1000;
  if(F.st=='quake'){hold();shk(.06+el*.05);if(!red()&&R()<dt*16){const x=P.x+rn(-T*14,T*14),y=P.y+P.h+rn(-T*2,T*4);try{VFX.add(0,'#bfb4aa',x,y,rn(-30,30),-rn(40,140),.7,10,4,{a:.6})}catch(_){}}if(el>2.3)collapse();return}
  if(F.st=='collapse'){hold();shk(.12);while(SI<SCH.length&&SCH[SI].t<=el)crumble(SCH[SI++].k);if(el>3.4){wipe();F.st='cine';CIN.play(F.b,{skip:!!S.seen[F.b.id],world:F.w},()=>{S.seen[F.b.id]=1;save();if(F&&F.st=='cine')arena()})}return}
  if(F.st=='fight'||F.st=='won'){const m=F.m;for(let i=mobs.length-1;i>=0;i--)if(mobs[i]!==m)mobs.splice(i,1);
   if(F.st=='fight'){if(m.rew||(m.dead&&m.hp<=0)){F.st='won';F.t0=now;F.wait=(()=>{try{return BOSS10.left()}catch(_){return 4600}})()+1600;netWB('win');return}if(!mobs.includes(m)){lost();return}
    try{if(BOSS10.kind=='in'&&BOSS10.state.id==F.b.id){const t=BOSS10.t,e=F.ev,cx=m.x,cy=m.y+m.h/2;
     if(!e.a&&t>.05){e.a=1;VFX.wave(cx,cy,F.b.c,320,1,.3);tone(80,160,1,'sawtooth',.05)}if(!e.b&&t>1.0){e.b=1;VFX.shatter(cx,cy,[F.b.c,F.b.c2,'#fff'],40);VFX.wave(cx,cy,'#fff',420,.8,.4);shk(.2);tone(55,40,.8,'sawtooth',.08)}
     if(!e.c&&t>2.25){e.c=1;for(let i=0;i<3;i++)VFX.wave(cx,cy,i?F.b.c2:'#fff',300+i*160,.9+i*.2,.3);VFX.burst(cx,cy,[F.b.c,F.b.c2,'#fff'],50,520,2,1.2,16);shk(.32)}}}catch(_){}}
   else if(now-F.t0>F.wait||!ar())won();return}}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){const m=BOSS6.active(),wb=isWB(m);
   if(wb){m.bs='idle';m.bt=99;if(m.xt!=null){if(m.xt>(m._xt||0)+.5)m.xt*=.85;m._xt=m.xt}if(m.att>0)m.att-=dt}   // world bosses only use their own attack lists, a little faster
   _t.call(this,dt);
   try{if(wb||PR.length||BM.length||WV.length||WL.length||RG.length||EM.length||CLN.length){if(wb&&mobs.includes(m)&&!m.dead)tickFx(dt,m);else clearFx()}}catch(e){if(!tickFx.e){tickFx.e=1;console.error('WBOSS13 fx',e)}}
   for(let i=DB.length-1;i>=0;i--){const d=DB[i];d.vy+=900*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.r+=d.vr*dt;d.l-=dt;if(d.l<=0)DB.splice(i,1)}
   try{flow(dt)}catch(e){console.error('WBOSS13',e);try{abort()}catch(_){}}}}
 // ---- drawing: our hazards, the falling debris, the arena floor glow and the summoning circle (world space, after the world)
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{const now=performance.now();
   if(DB.length){gc.save();for(const d of DB){gc.globalAlpha=Math.min(1,d.l/.5);gc.save();gc.translate(d.x-cx,d.y-cy);gc.rotate(d.r);const s=T*d.s;try{gc.drawImage(spr(d.b,0,0),-s/2,-s/2,s,s)}catch(_){gc.fillStyle=(BLK[d.b]||[0,'#777'])[1];gc.fillRect(-s/2,-s/2,s,s)}gc.restore()}gc.restore()}
   if(F&&F.ar&&VOID){const a=F.ar,y=a.fy*T-cy,x0=a.x0*T-cx,x1=(a.x1+1)*T-cx,t=now/1000;gc.save();gc.globalCompositeOperation='lighter';gc.strokeStyle=F.b.c;gc.globalAlpha=.35+.15*Math.sin(t*2);gc.lineWidth=6;gc.beginPath();gc.moveTo(x0,y);gc.lineTo(x1,y);gc.stroke();
    gc.globalAlpha=.8;gc.lineWidth=2;gc.setLineDash([18,30]);gc.lineDashOffset=-t*30;gc.beginPath();gc.moveTo(x0,y+T*.5);gc.lineTo(x1,y+T*.5);gc.stroke();gc.setLineDash([]);gc.restore()}
   const m=BOSS6.active();if(isWB(m)&&mobs.includes(m))drawFx(gc,cx,cy,now)}catch(e){if(!drawFx.e){drawFx.e=1;console.error('WBOSS13 draw',e)}}}}
 function drawSummon(cx,cy,it,b,m){const R0=Math.max(m.w,m.h)*.95,k=eo(it/1.0),fade=it>2.4?1-ez((it-2.4)/1):1;if(fade<=0)return;g.save();g.globalCompositeOperation='lighter';
  if(it>.3&&it<2.6){const pk=Math.min(1,(it-.3)/.4)*(it>2.1?1-(it-2.1)/.5:1),pw=m.w*.7;const gr=g.createLinearGradient(cx-pw/2,0,cx+pw/2,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,'+(.55*pk)+')');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(cx-pw/2,cy-2000,pw,2000+m.h*.6)}
  g.globalAlpha=fade*.9;g.translate(cx,cy+m.h*.45);g.scale(1,.32);g.rotate(it*.8);const s=R0*2*k;g.drawImage(sigil(b),-s/2,-s/2,s,s);g.rotate(-it*1.9);g.globalAlpha=fade*.5;g.drawImage(sigil(b),-s*.35,-s*.35,s*.7,s*.7);g.restore();
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=fade*.7*k;g.drawImage(glo(b.c),cx-R0,cy-R0,R0*2,R0*2);g.restore()}
 function drawWB(m,now,b){const v=m.mv,t=now/1000,fx=m.x-cam.x,fy=m.y+m.h-cam.y,f=P.x>=m.x?1:-1;let k=1;
  let bin=false;try{bin=BOSS10.kind=='in'&&BOSS10.state.id==b.id}catch(_){}
  if(bin){const it=BOSS10.t;drawSummon(fx,fy-m.h/2,it,b,m);k=ez((it-1.0)/1.2);if(k<=0)return}
  const a0=g.globalAlpha;g.save();if(v&&v.fade<1)g.globalAlpha=a0*v.fade;g.translate(fx,fy);
  if(v){const fly=b.ai=='fly';if(fly){g.translate(0,-m.h/2);g.rotate(v.lean*.8);g.translate(0,m.h/2)}else g.rotate(v.lean||0);if(v.sq>0)g.scale(1+.12*v.sq,1-.15*v.sq)}
  if(k<1){g.translate(0,-m.h/2);g.scale(.3+.7*k,.3+.7*k);g.translate(0,m.h/2);g.globalAlpha*=Math.min(1,k*1.6)}
  if(m.wind>0||m.vul>0||m.stag>0){const c=m.stag>0?'#ffd24a':m.vul>0?'#ffd24a':b.c;gl(g,c,0,-m.h/2,Math.max(m.w,m.h)*.85,m.wind>0?.55:.35)}
  if(m.shield>0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=b.c2;g.globalAlpha*=.5+.2*Math.sin(t*6);g.lineWidth=4;g.beginPath();g.ellipse(0,-m.h/2,m.w*.7,m.h*.62,0,0,TAU);g.stroke();g.restore()}
  g.scale(f*VS,VS);const dx=P.x-m.x,dy=P.y+P.h/2-(m.y+m.h/2),d=Math.hypot(dx,dy)||1;
  ART[b.id](g,{w:b.aw,h:b.ah,t,fl:m.fl>0||(k<1&&k>.15&&k<.5),ph:m.phase|0,eye:1,at:m.wind>0?1-m.wind/(m.wind0||.6):(m.att>0?1:0),lx:dx/d*f,ly:dy/d});
  g.restore();g.globalAlpha=a0}
 {const _dm=drawMob;drawMob=function(m,now){if(!isWB(m))return _dm(m,now);try{drawWB(m,now,BY[idOf(m)])}catch(e){if(!drawWB.e){drawWB.e=1;console.error('WBOSS13 art',e)}}}}
 // ---- the void: the sky is gone, the remains of your world drift in the dark
 const VI={};function voidImg(b){if(VI[b.id])return VI[b.id];const c=cvs(480,270),x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,270);gr.addColorStop(0,'#020106');gr.addColorStop(.55,b.sky[0]);gr.addColorStop(1,b.sky[1]);x.fillStyle=gr;x.fillRect(0,0,480,270);
  let s=7;const r=()=>(s=s*16807%2147483647)/2147483647;for(let i=0;i<6;i++){const px=r()*480,py=r()*270,rr=60+r()*120,g2=x.createRadialGradient(px,py,4,px,py,rr);g2.addColorStop(0,i%2?b.c+'55':b.c2+'40');g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(0,0,480,270)}
  for(let i=0;i<220;i++){const a=r();x.fillStyle='rgba(255,255,255,'+(.2+a*.7)+')';x.fillRect(r()*480,r()*270,a>.94?2:1,a>.94?2:1)}return VI[b.id]=c}
 function frags(ids){const out=[],L=ids.length?ids:[3,1];for(let i=0;i<7;i++){const c=cvs(T*4,T*3),x=c.getContext('2d'),cells=[[1,0],[2,0],[0,1],[1,1],[2,1],[3,1],[1,2],[2,2]].filter((_,j)=>j<3||R()<.7);
   for(const[cx,cy]of cells){const b=L[(R()*L.length)|0];try{x.drawImage(spr(b,cx,cy),cx*T,cy*T,T,T)}catch(_){x.fillStyle=(BLK[b]||[0,'#777'])[1];x.fillRect(cx*T,cy*T,T,T)}}out.push(c)}
  const F2=[];for(let i=0;i<16;i++)F2.push({x:R(),y:rn(.08,.95),s:rn(.25,.9),par:rn(.04,.22),rot:rn(-.6,.6),vr:rn(-.08,.08),bob:rn(0,6),img:out[i%out.length]});F2.sort((a,b2)=>a.s-b2.s);return F2}
 {const _ds=drawSky;drawSky=function(w,hh,now){if(!VOID)return _ds.apply(this,arguments);try{const t=now/1000,ox=(cam.x*.015)%(w*.05);g.drawImage(VOID.img,-w*.05-ox,-hh*.03,w*1.1,hh*1.08);
    for(const f of VOID.frag){const ww=w*1.5,sx=((f.x*ww-cam.x*f.par)%ww+ww)%ww-w*.25,sy=f.y*hh+Math.sin(t*.4+f.bob)*14-cam.y*f.par*.3%hh;g.save();g.globalAlpha=.2+f.s*.3;g.translate(sx,sy);g.rotate(f.rot+t*f.vr);const s=f.s*ZM*.9;g.scale(s,s);g.drawImage(f.img,-T*2,-T*1.5);g.restore()}}catch(e){_ds.apply(this,arguments)}}}
 // nothing else lives in the void: no monster spawns, no NPCs or door, no building or mining, nothing written to the world save
 {const _sm=spawnMob;spawnMob=function(){if(F||VOID)return false;return _sm.apply(this,arguments)}}
 {const _dn=drawNPCs;drawNPCs=function(now){if(VOID)return;return _dn.apply(this,arguments)}}
 {const _pe=pushEdit;pushEdit=function(k){if(F||SNAP)return;return _pe.apply(this,arguments)}}
 {const _ba=breakAt;breakAt=function(){if(F||SNAP)return false;return _ba.apply(this,arguments)}}
 {const _pa=placeAction;placeAction=function(){if(F||SNAP){if(!placeAction.t||performance.now()-placeAction.t>1500){placeAction.t=performance.now();say('Nothing can be built in the void')}return}return _pa.apply(this,arguments)}}
 {const _lw=loadWorld;loadWorld=function(){try{abort()}catch(_){}return _lw.apply(this,arguments)}}

 // ---- online: everything that would cross between your private fight and the shared world goes through here
 function netWB(op){try{if(!rm||!rm.net)return;NET7.send({t:'wb',op});if(op=='win'&&SHOP7.serverMode)setTimeout(()=>{try{NET7.send({t:'sync',gems:Math.max(0,(gems|0)+(SHOP7.pend|0))})}catch(_){}},400)}catch(_){}}
 function tell(t){try{if(rm&&rm.net)rm.emit('chat',{t,n:myName})}catch(_){}}
 {const _br=bindRoom;bindRoom=function(r){if(r&&r.net){const em=r.emit,pr=r.presence,ps=r.peers;
    r.h=new Proxy(r.h,{get(o,t){const f=o[t];if(!f||!SNAP)return f;if(t=='e'||t=='o'||t=='meta')return m=>{HELD.push(()=>f(m))};if(t=='x')return()=>{};return f}});
    r.emit=(t,x)=>{if(SNAP&&t!='chat')return;return em(t,x)};
    r.presence=o=>{if(SNAP&&o)o=Object.assign({},o,{x:SNAP.px|0,y:SNAP.py|0,vx:0,sw:0,fm:1});return pr(o)};
    r.peers=()=>{const L=ps();return SNAP?L.filter(p=>p.isMe):L}}return _br.apply(this,arguments)}}

 // ================= the 40-second cinematic (its own canvas over the paused game) =================
 const CIN=(()=>{let C=null,prevCover=null,bg0=null;
  const VW=1280,VH=720;
  // ---- audio (the game's AudioContext, a master gain for this scene)
  function au(){try{ac()}catch(_){}if(!AC||!C)return null;if(!C.mg){C.mg=AC.createGain();C.mg.gain.value=mute?0:Math.max(.0001,(OPT.sv||1));C.mg.connect(AC.destination)}return C.mg}
  function osc(type,f,at,d,v,f2,lp){const M=au();if(!M)return;const t=AC.currentTime+at,o=AC.createOscillator(),n=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
   n.gain.setValueAtTime(.0001,t);n.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+Math.min(.05,d*.2));n.gain.exponentialRampToValueAtTime(.0001,t+d);let out=n;if(lp){const q=AC.createBiquadFilter();q.type='lowpass';q.frequency.value=lp;n.connect(q);out=q}o.connect(n);out.connect(M);o.start(t);o.stop(t+d+.05)}
  function noiz(at,d,v,fc,fc2){const M=au();if(!M)return;const t=AC.currentTime+at,b=AC.createBuffer(1,Math.max(1,AC.sampleRate*d|0),AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(R()*2-1)*(1-i/a.length);
   const s=AC.createBufferSource(),q=AC.createBiquadFilter(),n=AC.createGain();s.buffer=b;q.type='lowpass';q.frequency.setValueAtTime(fc,t);if(fc2)q.frequency.exponentialRampToValueAtTime(fc2,t+d);n.gain.value=v;s.connect(q);q.connect(n);n.connect(M);s.start(t)}
  function drone(){const M=au();if(!M)return;const t=AC.currentTime,n=AC.createGain(),q=AC.createBiquadFilter();q.type='lowpass';q.frequency.setValueAtTime(260,t);q.frequency.linearRampToValueAtTime(900,t+22);q.frequency.linearRampToValueAtTime(420,t+36);
   n.gain.setValueAtTime(.0001,t);n.gain.exponentialRampToValueAtTime(.05,t+4);n.connect(M);q.connect(n);C.dr=[];for(const f of[55,55.6,82.4]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(q);o.start(t);C.dr.push(o)}C.dg=n}
  function droneOff(){try{if(C&&C.dg){const t=AC.currentTime;C.dg.gain.cancelScheduledValues(t);C.dg.gain.setValueAtTime(Math.max(.0001,C.dg.gain.value),t);C.dg.gain.exponentialRampToValueAtTime(.0001,t+.6);for(const o of C.dr)o.stop(t+.7)}}catch(_){}}
  const SC=[0,2,4,7,9,12,14,16],note=i=>220*Math.pow(2,SC[i%SC.length]/12);
  function events(t){const e=C.ev,on=(k,at)=>{if(e[k]||t<at)return false;e[k]=1;return true};
   if(on('d',0))drone();for(let i=0;i<9;i++)if(on('n'+i,.6+i*1.45))osc('sine',note(i*3%8),0,1.6,.035,0,0);
   const L=C.word.length;for(let i=0;i<L;i++)if(on('l'+i,9.5+i*(3/L)))osc('triangle',note(i+4)*2,0,.5,.05);
   for(const[k,at,v]of[['h1',14.5,.09],['h2',15.3,.11],['h3',16.1,.16]])if(on(k,at)){osc('sine',62,0,.35,v,38);osc('sine',62,.16,.3,v*.6,40)}
   if(on('eye',16.2)){osc('sawtooth',110,0,1.6,.04,220,900);noiz(0,1.2,.05,3000,200)}
   if(on('roar',21)){try{CINE7.bossSfx('roar',C.b.snd,1.2)}catch(_){}noiz(0,2.6,.16,1800,120);osc('sawtooth',90,0,2.2,.08,40,600)}
   for(let i=0;i<4;i++)if(on('dr'+i,22.2+i*1.4)){osc('sine',55,0,.5,.14,30);noiz(0,.3,.06,400)}
   if(on('rum',28))noiz(0,6.5,.07,300,90);if(on('arena',30.6)){for(const f of[220,277,330,440])osc('triangle',f,0,2.4,.03);noiz(0,.6,.05,4000,500)}
   if(on('stab',35.6)){for(const f of[110,131,165,220])osc('sawtooth',f,0,2.8,.035,0,1400);osc('sine',55,0,2.4,.12,40)}if(on('fin',39.2))noiz(0,.8,.06,6000,600)}
  // ---- drawing helpers (virtual 1280 x 720)
  function cap(x,s,a,y,big,col){if(a<=0)return;x.save();x.globalAlpha=a;x.textAlign='center';x.textBaseline='middle';x.font=(big?'800 46px ':'600 27px ')+FONT;x.lineJoin='round';x.lineWidth=big?8:6;x.strokeStyle='rgba(0,0,0,.75)';
   const lines=String(s).split('\n');lines.forEach((l,i)=>{const yy=y+(i-(lines.length-1)/2)*(big?56:36);x.strokeText(l,VW/2,yy);x.fillStyle=col||'#fff';x.fillText(l,VW/2,yy)});x.restore()}
  const wrap=(s,n)=>{const out=[];let l='';for(const w of s.split(' ')){if(l&&(l+' '+w).length>n){out.push(l);l=w}else l=l?l+' '+w:w}out.push(l);return out.join('\n')};
  const fa=(t,a,b,f)=>{f=f||.6;return t<a||t>b?0:Math.min(1,(t-a)/f,(b-t)/f)};
  function sky(x,b,t,dark){const gr=x.createLinearGradient(0,0,0,VH);gr.addColorStop(0,b.sky[0]);gr.addColorStop(.6,b.sky[1]);gr.addColorStop(1,b.sky[2]);x.fillStyle=gr;x.fillRect(0,0,VW,VH);
   x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.6;x.drawImage(stars(),-((t*6)%256),0,VW+512,VH);x.restore();
   for(let i=0;i<40;i++){const px=(i*197+t*(10+i%5*6))%VW,py=(i*331%VH+Math.sin(t+i)*20+VH)%VH;x.fillStyle=b.c2;x.globalAlpha=.25+.25*Math.sin(t*2+i);x.fillRect(px,py,2,2)}x.globalAlpha=1;
   if(dark){x.fillStyle='rgba(0,0,0,'+dark+')';x.fillRect(0,0,VW,VH)}}
  function hills(x,b,t,gy,shake,broken){const L=[[.55,'rgba(0,0,0,.35)',60,.004],[.75,'rgba(0,0,0,.55)',40,.007],[1,b.gnd,24,.012]];
   for(const[k,col,amp,fq]of L){x.fillStyle=col;x.beginPath();x.moveTo(-40,VH);for(let px=-40;px<=VW+160;px+=16){const y=gy-amp*(1-k*.4)+Math.sin(px*fq+k*7)*amp*.6+Math.sin(px*fq*2.3+k)*amp*.25+(k==1?0:-(1-k)*120);x.lineTo(px+shake,y)}x.lineTo(VW+160,VH);x.closePath();x.fill()}
   x.fillStyle=b.gnd;x.fillRect(-40,gy,VW+200,VH-gy)}
  function boss(x,b,cx,gy,s,t,o){x.save();x.translate(cx,gy);x.scale(s,s);try{ART[b.id](x,Object.assign({w:b.aw,h:b.ah,t,fl:0,ph:1,eye:1,at:0,cine:1},o))}catch(e){console.error(e)}x.restore()}
  function thief(x,px,py,s,t,run){x.save();x.translate(px,py);x.scale(s,s);const bob=run?Math.abs(Math.sin(t*12))*-4:0;x.translate(0,bob);
   x.strokeStyle='#c83a4a';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(-2,-40);x.quadraticCurveTo(-18,-36+Math.sin(t*10)*4,-30,-30+Math.sin(t*12)*6);x.stroke();
   x.fillStyle='#14101c';x.beginPath();x.ellipse(0,-22,11,18,0,0,TAU);x.fill();x.beginPath();x.arc(0,-46,12,0,TAU);x.fill();x.beginPath();x.moveTo(-12,-48);x.quadraticCurveTo(0,-66,12,-48);x.fill();
   const st=run?Math.sin(t*12)*8:0;x.strokeStyle='#14101c';x.lineWidth=6;x.beginPath();x.moveTo(-4,-6);x.lineTo(-5-st,0);x.moveTo(4,-6);x.lineTo(5+st,0);x.stroke();x.fillStyle='#fff6c0';x.beginPath();x.arc(4,-47,2,0,TAU);x.arc(-3,-47,2,0,TAU);x.fill();x.restore()}
  function letter(x,ch,px,py,r,a,b){if(a<=0)return;x.save();x.globalAlpha=a;x.globalCompositeOperation='lighter';x.drawImage(glo('#ffe27a'),px-r*2.2,py-r*2.2,r*4.4,r*4.4);x.globalCompositeOperation='source-over';
   x.fillStyle='#fff6d0';x.beginPath();x.arc(px,py,r,0,TAU);x.fill();x.strokeStyle=b.c;x.lineWidth=3;x.stroke();x.fillStyle='#3a2a10';x.font='900 '+(r*1.2|0)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(ch,px,py+1);x.restore()}
  function draw(t){const x=C.x,b=C.b,cw=C.cv.width,ch=C.cv.height,s=Math.min(cw/VW,ch/VH);x.setTransform(1,0,0,1,0,0);x.fillStyle='#000';x.fillRect(0,0,cw,ch);x.setTransform(s,0,0,s,(cw-VW*s)/2,(ch-VH*s)/2);
   x.save();x.beginPath();x.rect(0,0,VW,VH);x.clip();const W2=C.word,L=W2.length,gy=560,bx=870,bs=b.id=='wb_mael'?1.7:1.55,rs=red()?.3:1;
   if(t<14){const pan=-t*5;sky(x,b,t,0);x.save();x.translate(pan,0);hills(x,b,t,gy,0);const br=1+Math.sin(t*1.4)*.012;
    boss(x,b,bx+40,gy+(b.ai=='fly'?-60:0),bs*br,t,{eye:0,cine:1});
    const bcx=bx+40,bcy=gy-b.ah*bs*.55-(b.ai=='fly'?60:0);
    for(let i=0;i<L;i++){const a=t*.6+i/L*TAU,ox=Math.cos(a)*b.aw*bs*.85,oy=Math.sin(a)*40;let px=bcx+ox,py=bcy+oy,al=1,r=18;const lt=9.5+i*(3/L);
     if(t>lt){const k=ez((t-lt)/.9),tx=440+(t<13?Math.min(1,(t-7)/2.5)*0:0),ty=gy-70;px=lerp(px,C.thx,k);py=lerp(py,C.thy,k)-Math.sin(PI*k)*120;r=18*(1-k*.6);al=t>lt+.9?0:1;if(t>lt+.85&&t<lt+1.1)x.drawImage(glo('#fff6c0'),C.thx-30,C.thy-30,60,60)}
     letter(x,W2[i],px,py,r,al*Math.min(1,t/1.2),b)}
    if(t>7){const run=t<9.6||t>13,tx=t<9.6?lerp(-80,560,ez((t-7)/2.6)):t<13?560:lerp(560,-120,ez((t-13)/1.2));C.thx=tx+4-pan*0;C.thy=gy-60;thief(x,tx,gy,1.5,t,run)}else{C.thx=560;C.thy=gy-60}
    x.restore();cap(x,b.place+' '+C.world+',\n'+b.sn+' slept.',fa(t,.8,3.7),120);cap(x,b.have,fa(t,3.9,6.8),120);cap(x,'One by one, you took them.',fa(t,7.6,13.2),120)}
   else if(t<20){const k=(t-14)/6,eye=t<16?0:ez((t-16)/.6);sky(x,b,t,.55);x.fillStyle=b.c;x.globalAlpha=.08+.12*eye;x.fillRect(0,0,VW,VH);x.globalAlpha=1;
    const zs=3.6+k*.8,hx=(b.hx!=null?(b.hx-.5)*b.aw*zs:0),hy=b.ah*b.hy*zs;const jit=t>16.2&&t<17?(R()-.5)*8*rs:0;boss(x,b,VW/2-hx+jit,VH/2+hy+jit,zs,t,{eye,cine:1,ph:eye>.9?3:1});
    const vg=x.createRadialGradient(VW/2,VH/2,200,VW/2,VH/2,760);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.85)');x.fillStyle=vg;x.fillRect(0,0,VW,VH);
    if(t>16.1&&t<16.6){x.fillStyle='#fff';x.globalAlpha=(1-(t-16.1)/.5)*.6*rs;x.fillRect(0,0,VW,VH);x.globalAlpha=1}cap(x,'...and '+he(b)+' felt every one of them leave.',fa(t,14.6,19.6),640)}
   else if(t<28){const rk=ez((t-20)/1.0),roar=t>21?Math.max(0,1-(t-21)/2.4):0,sh=(R()-.5)*30*roar*rs,sy=(R()-.5)*20*roar*rs;x.save();x.translate(sh,sy);sky(x,b,t,0);
    x.fillStyle=b.c3;x.globalAlpha=.12+.12*Math.sin(t*6)*(t>21?1:0);x.fillRect(0,0,VW,VH);x.globalAlpha=1;hills(x,b,t,gy,0);
    if(!C.cr){C.cr=[];for(let i=0;i<46;i++)C.cr.push({x:R()*VW,y:gy+R()*140,s:12+R()*26,vx:(R()-.5)*160,vy:-120-R()*380,r:R()*6,vr:(R()-.5)*6,t0:21+R()*5})}
    for(const q of C.cr){if(t<q.t0)continue;const d=t-q.t0;x.save();x.translate(q.x+q.vx*d,q.y+q.vy*d+260*d*d*.5*-.2);x.rotate(q.r+q.vr*d);x.fillStyle=b.gnd;x.fillRect(-q.s/2,-q.s/2,q.s,q.s);x.strokeStyle=b.c;x.globalAlpha=.6;x.strokeRect(-q.s/2,-q.s/2,q.s,q.s);x.restore()}
    x.strokeStyle=b.c2;x.lineWidth=3;x.globalAlpha=Math.min(1,(t-21)*2)*.8;for(let i=0;i<7;i++){x.beginPath();let px=bx+(i-3)*30,py=gy;x.moveTo(px,py);for(let k=0;k<5;k++){px+=(i-3)*22+(R()-.5)*30;py+=18+R()*16;x.lineTo(px,py)}x.stroke()}x.globalAlpha=1;
    const by=gy+(1-rk)*160+(b.ai=='fly'?-80*rk:0);boss(x,b,bx-60,by,bs*1.15,t,{eye:1,ph:3,at:roar>0?1:.3});
    if(t>21){for(let i=0;i<3;i++){const d=((t-21)*1.4+i*.33)%1;x.strokeStyle=i%2?b.c:'#fff';x.globalAlpha=(1-d)*.7*rs;x.lineWidth=6;x.beginPath();x.arc(bx-60,by-b.ah*bs*.55,60+d*900,0,TAU);x.stroke()}x.globalAlpha=1}
    if(t>21&&t<21.35){x.fillStyle='#fff';x.globalAlpha=.7*rs;x.fillRect(0,0,VW,VH);x.globalAlpha=1}x.restore();
    const q=wrap('"'+b.quote+'"',34),nch=Math.max(0,Math.min(q.length,((t-21.6)*28)|0));cap(x,q.slice(0,nch),fa(t,21.6,27.6,.3),130,1,b.c2)}
   else if(t<35){const k=ez((t-28)/2.4);sky(x,b,t,.5+k*.4);x.save();x.globalAlpha=1-k;x.translate(0,k*260);hills(x,b,t,gy,0);x.restore();
    if(!C.ch){C.ch=[];for(let i=0;i<60;i++)C.ch.push({x:R()*VW,y:gy+R()*160,s:14+R()*40,vy:R()*60,r:R()*6,vr:(R()-.5)*3})}
    for(const q of C.ch){const d=Math.max(0,t-28);x.save();x.translate(q.x,q.y+q.vy*d+90*d*d);x.rotate(q.r+q.vr*d);x.fillStyle=b.gnd;x.globalAlpha=Math.max(0,1-d/5);x.fillRect(-q.s/2,-q.s/2,q.s,q.s);x.restore()}
    const ak=ez((t-30.4)/1.6),aw=820,ah=430,ax=VW/2-aw/2,ay=VH/2-ah/2+30;if(t>30.4){x.save();x.globalCompositeOperation='lighter';x.strokeStyle=b.c;x.lineWidth=4;x.shadowColor=b.c;x.shadowBlur=18;const per=2*(aw+ah)*ak;x.setLineDash([per,9999]);x.strokeRect(ax,ay,aw,ah);x.setLineDash([]);x.shadowBlur=0;x.restore();
     x.fillStyle='#22232b';x.globalAlpha=ak;x.fillRect(ax,ay+ah-26,aw,26);x.globalAlpha=1;thief(x,ax+150,ay+ah-26,1.6,t,0);boss(x,b,ax+aw-180,ay+ah-26-(b.ai=='fly'?50:0),bs*.62,t,{eye:1,ph:3})}
    cap(x,'The world collapses.\nOnly you and '+b.sn+' remain.',fa(t,29,34.6),110)}
   else{const k=t-35;sky(x,b,t,.82);x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.6;x.drawImage(glo(b.c),VW/2-520,VH/2-520,1040,1040);x.restore();
    x.save();x.globalAlpha=.25;boss(x,b,VW*.78,VH*.95,bs*1.1,t,{eye:1,ph:3});x.restore();
    const a1=fa(t,35.3,40,.4),a2=fa(t,35.6,40,.5),a3=fa(t,36.2,40,.5),a4=fa(t,36.8,40,.5);x.save();x.textAlign='center';x.textBaseline='middle';
    x.globalAlpha=a1;x.fillStyle=b.c;x.fillRect(VW/2-200,VH/2-112,400,4);x.font='700 22px '+FONT;x.fillStyle=b.c2;x.fillText('W O R L D   B O S S',VW/2,VH/2-138);
    const sc=1+.15*(1-ez((t-35.6)/.6));x.globalAlpha=a2;x.translate(VW/2,VH/2-40);x.scale(sc,sc);x.font='900 64px '+FONT;x.lineWidth=10;x.strokeStyle='rgba(0,0,0,.8)';x.strokeText(b.n,0,0);x.fillStyle='#fff';x.fillText(b.n,0,0);x.setTransform(s,0,0,s,(cw-VW*s)/2,(ch-VH*s)/2);
    x.globalAlpha=a3;x.font='italic 600 28px '+FONT;x.fillStyle=b.c2;x.fillText(b.ep,VW/2,VH/2+30);x.globalAlpha=a4;x.font='600 24px '+FONT;x.fillStyle='#fff';x.fillText('Defeat '+him(b)+' to open the Word Gate',VW/2,VH/2+92);x.restore();
    if(t>39.2){x.fillStyle='#fff';x.globalAlpha=ez((t-39.2)/.8);x.fillRect(0,0,VW,VH);x.globalAlpha=1}}
   const bar=Math.min(1,t/1.2)*(t>39.4?1-(t-39.4)/.6:1)*62;x.fillStyle='#000';x.fillRect(0,0,VW,bar);x.fillRect(0,VH-bar,VW,bar);
   if(C.skip){x.globalAlpha=.75;x.font='600 16px '+FONT;x.textAlign='right';x.fillStyle='#fff';x.fillText('Hold any key to skip',VW-28,VH-26);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(VW-188,VH-16,160,3);x.fillStyle=b.c2;x.fillRect(VW-188,VH-16,160*Math.min(1,C.hold/.8),3);x.globalAlpha=1}
   x.restore()}
  function size(){if(!C)return;const d=Math.min(2,devicePixelRatio||1),w=Math.min(2560,Math.round(innerWidth*d)),h=Math.min(1440,Math.round(innerHeight*d));if(C.cv.width!==w||C.cv.height!==h){C.cv.width=w;C.cv.height=h}}
  function frame(n){if(!C)return;const dt=Math.min(.05,(n-C.last)/1000);C.last=n;const t=(n-C.t0)/1000;
   if(C.skip&&C.held){C.hold+=dt;if(C.hold>=.8){finish();return}}else C.hold=Math.max(0,C.hold-dt*2);
   size();try{events(t);draw(t)}catch(e){console.error('WBOSS13 cinematic',e);finish();return}if(t>=DUR){finish();return}C.raf=requestAnimationFrame(frame)}
  function key(e){if(!C)return;e.stopPropagation();if(e.key!='F11'&&e.key!='F12')e.preventDefault();if(e.type=='keydown'||e.type=='mousedown'||e.type=='pointerdown')C.held=true;else C.held=false}
  const EVS=['keydown','keyup','mousedown','mouseup','pointerdown','pointerup'];
  function play(b,o,done){stop(true);const cv2=document.createElement('canvas');cv2.id='wb13c';cv2.setAttribute('aria-label',b.n+' cinematic');document.body.appendChild(cv2);
   let word='';try{word=WORD9.word||''}catch(_){}if(!word)word='???';word=word.split('').sort(()=>R()-.5).join('');
   let wl=o.world;try{wl=WORD9.label(o.world)}catch(_){}
   C={cv:cv2,x:cv2.getContext('2d'),b,t0:performance.now(),last:performance.now(),done,skip:!!o.skip,hold:0,held:false,raf:0,ev:{},word,world:wl,thx:560,thy:500};
   prevCover=window.RB_COVER;window.RB_COVER=1;try{if(bgm&&bgm.m){bg0=bgm.m.gain.value;bgm.m.gain.value=bg0*.2}}catch(_){}
   for(const k of EVS)addEventListener(k,key,true);size();C.raf=requestAnimationFrame(frame)}
  function stop(quiet){if(!C)return;cancelAnimationFrame(C.raf);droneOff();for(const k of EVS)removeEventListener(k,key,true);const cv2=C.cv,mg=C.mg;setTimeout(()=>{try{cv2.remove()}catch(_){}try{if(mg)mg.disconnect()}catch(_){}},quiet?0:700);
   if(!quiet){cv2.style.transition='opacity .6s';cv2.style.opacity='0'}window.RB_COVER=prevCover||0;if(!window.RB_COVER)try{delete window.RB_COVER}catch(_){}try{if(bgm&&bgm.m&&bg0!=null)bgm.m.gain.value=bg0}catch(_){}bg0=null;try{for(const k in keys)keys[k]=0}catch(_){}C=null}
  function finish(){if(!C)return;const d=C.done;stop(false);try{d&&d()}catch(e){console.error(e)}}
  return{play,stop,finish,seek(t){if(C)C.t0=performance.now()-t*1000},get on(){return !!C},get t(){return C?(performance.now()-C.t0)/1000:0},get canSkip(){return !!(C&&C.skip)}}})();

 // ---- "fight now?" when you press L / open the Word Gate with the boss still waiting
 function ask(n){const b=bossFor(n);if(!b||F)return;if(!Qd){Qd=document.createElement('div');Qd.id='wb13q';Qd.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="wb13qt"><i class="k">World boss</i><h3 id="wb13qt"></h3><p></p><div class="acts"><button class="no">Not yet</button><button class="go pri">Fight</button></div></div>';
   document.body.appendChild(Qd);Qd.querySelector('.no').onclick=()=>closeQ();Qd.querySelector('.go').onclick=()=>{closeQ();start(cur)};Qd.addEventListener('mousedown',e=>{if(e.target===Qd)closeQ()});
   addEventListener('keydown',e=>{if(!Qd||!Qd.classList.contains('on'))return;if(e.key=='Escape'){e.stopPropagation();e.preventDefault();closeQ()}else if(e.key=='Enter'){e.stopPropagation();e.preventDefault();closeQ();start(cur)}},true)}
  Qd.querySelector('h3').textContent=b.n;Qd.querySelector('p').innerHTML=esc(b.sn)+' took back the power of your letters and guards the Word Gate. Defeat '+him(b)+' to solve the word and open the way on.<br><small>The world falls away while you fight and comes back afterwards. Recommended level '+b.lv+'.</small>';
  Qd.style.display='flex';Qd._o=1;requestAnimationFrame(()=>{if(Qd._o)Qd.classList.add('on')});try{UIS.play('open')}catch(_){}try{for(const k in keys)keys[k]=0}catch(_){}}
 function closeQ(){if(!Qd)return;Qd._o=0;Qd.classList.remove('on');setTimeout(()=>{if(Qd&&!Qd._o)Qd.style.display='none'},180)}
 return{WB,BY,need,found,ask,start,isWB,ART,LIST,ATK,CIN,get state(){return S},get fight(){return F?{st:F.st,id:F.b.id,w:F.w,ar:F.ar}:null},get void(){return !!VOID||!!(window.DG&&DG.run)},get home(){return SNAP?{x:SNAP.px,y:SNAP.py}:null},get held(){return HELD.length},
  skip(){if(CIN.on)CIN.finish()},abort,clearFx,get fx(){return PR.length+BM.length+WV.length+WL.length+RG.length+EM.length+CLN.length}}})();
