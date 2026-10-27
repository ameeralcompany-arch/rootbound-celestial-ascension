// ===== Boss overhaul: telegraphed hazards, shields + stagger windows, no building in a boss, HP bar fix, nicer idle/attack animation =====
// three more bosses (data + art + mechanics live here so they can share the hazard system)
BOSSES.push(
 {id:'magma',n:'Magma Colossus',depth:34,hp:4200,w:112,h:132,dmg:32,ai:'walk',spm:.8,c:'#ff6a2a',gems:3600,xp:4500,relic:'magma',rn:'Colossus Heart',rd:'+8% damage',fx:{dmg:.08},desc:'A basalt giant whose cracks run with living lava.'},
 {id:'tide',n:'Abyssal Leviathan',depth:46,hp:5200,w:150,h:72,dmg:34,ai:'fly',spm:1.1,c:'#4aa8ff',gems:5200,xp:6200,relic:'tide',rn:'Leviathan Pearl',rd:'+10% gems',fx:{gem:.1},desc:'A deep-sea serpent that drags the tide behind it.'},
 {id:'storm',n:'Tempest Roc',depth:58,hp:6500,w:140,h:100,dmg:38,ai:'fly',spm:1.3,c:'#ffe27a',gems:7600,xp:8800,relic:'tempest',rn:'Roc Feather',rd:'+6% speed, +6% jump',fx:{spd:.06,jump:.06},desc:'A thunderbird that calls lightning down on its prey.'});
for(const b of BOSSES.slice(3)){MK['boss_'+b.id]={c:b.c,hp:b.hp,w:b.w,h:b.h,gem:40,dmg:b.dmg,ai:b.ai,jp:b.jp,sx:b.sx,cd:b.cd,spm:b.spm,fly:b.ai=='fly'?1:0,ph:b.ai=='fly'?1:0,min:9999,max:9999,boss:1};MOBMAT['boss_'+b.id]=10}
const BOSSX=(()=>{
 const HZ=[],ORB=[];let nb=0;const rn=(a,b)=>a+Math.random()*(b-a);
 const cols={warden:'#6fe08a',sovereign:'#7fd8ff',eclipse:'#b58cff',magma:'#ff6a2a',tide:'#4aa8ff',storm:'#ffe27a'},MOV=[];let gust=null;
 const boss=()=>{const a=BOSS6.active();return a&&!a.dead&&mobs.includes(a)?a:null};
 const id=m=>m.k.slice(5);
 function hit(a,kb){if(iT>0)return;P.hp-=a*(1-Math.min(.8,bonus().arm+(guard>0?.5:0)));iT=.9;P.vx=kb||0;P.vy=-320;hurtF=.45;shake=Math.max(shake,QM.reduce?0:.14);snd(130,.22,'sawtooth',.07)}
 const gyAt=(x,fromY)=>{const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.floor(fromY/T);for(let i=0;i<16&&ty<H-2;i++,ty++)if(solidAt(tx,ty))return ty*T;return fromY};
 const hitsP=(z)=>P.x+P.w/2>z.x0&&P.x-P.w/2<z.x1&&P.y+P.h>z.y0&&P.y<z.y1;
 // hazard: rectangle that warns (tel seconds), then hurts (act seconds)
 const addZ=(x0,y0,x1,y1,tel,act,c,dmg,kind,kb,rep)=>HZ.push({x0,y0,x1,y1,tel,tel0:tel,act,act0:act,c,dmg,kind,kb:kb||260,hit:0,rep:rep||0,rt:0,fx:0});
 function col(x,m,tel,up,c){const gy=gyAt(x,P.y+P.h-8);const h=up?T*5:T*13;addZ(x-T*.7,gy-h,x+T*.7,gy+2,tel,.35,c,m.dmg*1.1,up?'up':'down')}
 function beam(m,y,tel,c){const x0=Math.max(T,m.x-T*16),x1=Math.min((W-1)*T,m.x+T*16);addZ(x0,y-15,x1,y+15,tel,.3,c,m.dmg*1.1,'beam')}
 function orb(m,sp){ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(sp)*120,vy:Math.sin(sp)*120,l:6,c:'#b58cff'})}
 const ATK={
  warden:{thorns(m,p2){const n=p2?5:3;for(let i=0;i<n;i++)col(P.x+rn(-T*4,T*4)+(i==0?0:0),m,1.0+i*.28,1,'#6fe08a');UI6.say6('THORNS','',700)},
          wave(m,p2){const d=Math.sign(P.x-m.x)||1,n=p2?11:8;for(let k=1;k<=n;k++)col(m.x+d*k*T*1.5,m,.75+k*.12,1,'#6fe08a')}},
  sovereign:{rain(m,p2){const n=p2?8:6;for(let i=0;i<n;i++)col(P.x+(i-(n-1)/2)*T*1.7+rn(-8,8),m,1.0+Math.abs(i-n/2)*.1+rn(0,.4),0,'#7fd8ff')},
          beam(m,p2){const y=P.y+P.h*.55;beam(m,y,1.15,'#7fd8ff');if(p2)beam(m,y-T*2.6,1.5,'#7fd8ff')}},
  magma:{lava(m,p2){const d=Math.sign(P.x-m.x)||1,n=p2?9:6;for(let k=0;k<n;k++){const x=m.x+d*(T*1.6+k*T*1.7);col(x,m,.7+k*.1,1,'#ff8a3a');if(p2&&k%2==0)col(x-d*T*.85,m,.9+k*.1,1,'#ff8a3a')}},
         meteors(m,p2){const n=p2?7:5;for(let i=0;i<n;i++){const x=P.x+rn(-T*6,T*6),gy=gyAt(x,P.y+P.h-8),tel=1.0+i*.25;addZ(x-T*.8,gy-T*14,x+T*.8,gy+2,tel,.3,'#ff6a2a',m.dmg*1.2,'down',280);addZ(x-T*1.4,gy-T*.8,x+T*1.4,gy+2,tel+.3,3.2,'#ff5a1a',m.dmg*.22,'fire',120,.55)}},
         slam(m,p2){const gy=gyAt(m.x,m.y+m.h);addZ(m.x-T*4.2,gy-T*2.4,m.x+T*4.2,gy+2,1.1,.4,'#ff8a3a',m.dmg*1.3,'slam',420);if(p2){addZ(m.x-T*8,gy-T*1.6,m.x-T*4.2,gy+2,1.5,.4,'#ff8a3a',m.dmg,'slam',380);addZ(m.x+T*4.2,gy-T*1.6,m.x+T*8,gy+2,1.5,.4,'#ff8a3a',m.dmg,'slam',380)}}},
  tide:{wave(m,p2){const side=m.x<P.x?-1:1,x=Math.max(T,Math.min((W-2)*T,P.x+side*T*17)),gy=gyAt(P.x,P.y+P.h-8),h=T*(p2?2.8:2.2);MOV.push({x,d:-side,sp:380,l:6,tel:1.2,tel0:1.2,gy,h,c:'#4aa8ff',dmg:m.dmg*1.2,hit:0});UI6.say6('TIDAL WAVE','',800)},
        bubbles(m,p2){const n=p2?8:5,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.5;ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(a)*190,vy:Math.sin(a)*190,l:5,c:'#8fd0ff',straight:1,r:14})}snd(420,.25,'sine',.06,.7)},
        dive(m,p2){ATK.eclipse.dash(m,p2)}},
  storm:{bolts(m,p2){const n=p2?6:4;for(let i=0;i<n;i++){const x=P.x+(i==0?0:rn(-T*7,T*7)),gy=gyAt(x,P.y+P.h-8),tel=.8+i*.3;addZ(x-T*.45,gy-T*16,x+T*.45,gy+2,tel,.22,'#fff6b0',m.dmg*1.3,'bolt',300)}},
         gale(m,p2){gust={t:2.8,d:Math.sign(m.x-P.x)||1,wait:.9};UI6.say6('GALE','Brace!',900)},
         volley(m,p2){const n=p2?9:6,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.2;ORB.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(a)*340,vy:Math.sin(a)*340,l:3.2,c:'#ffe27a',straight:1,r:9})}snd(700,.25,'triangle',.07,.6)}},
  eclipse:{orbs(m,p2){const n=p2?5:3,a0=Math.atan2(P.y-m.y,P.x-m.x);for(let i=0;i<n;i++)orb(m,a0+(i-(n-1)/2)*.9);snd(300,.3,'sine',.07,.5)},
          dash(m,p2){const dir=P.x>m.x?1:-1,tx=Math.max(3*T,Math.min((W-3)*T,P.x+dir*T*9)),y=P.y+P.h*.4;m.dash={tx,y,t:0,tel:.9};addZ(Math.min(m.x,tx)-8,y-18,Math.max(m.x,tx)+8,y+18,.9,.45,'#b58cff',m.dmg*1.3,'beam',380)},
          pull(m,p2){if(!p2)return ATK.eclipse.orbs(m,p2);m.pull=3.4;UI6.say6('VOID PULL','',900)}}};
 const LIST={warden:['thorns','wave'],sovereign:['rain','beam'],eclipse:['orbs','dash','pull'],magma:['lava','meteors','slam'],tide:['wave','bubbles','dive'],storm:['bolts','gale','volley']};
 function zoneFx(z){try{shake=Math.max(shake,QM.reduce?0:(z.kind=='bolt'?.14:.08));const x=(z.x0+z.x1)/2,cn=QM.reduce?3:9;snd(z.kind=='bolt'?1400:z.kind=='beam'?240:100,.2,z.kind=='bolt'?'square':'sawtooth',.07,.4);
  if(z.kind=='beam'){for(let i=0;i<cn;i++)VFX.add(1,z.c,z.x0+Math.random()*(z.x1-z.x0),(z.y0+z.y1)/2,0,(Math.random()-.5)*80,.4,9,2,{a:1});return}
  if(z.kind=='fire')return;
  const up=z.kind!='down'&&z.kind!='bolt';const yb=z.y1-2;for(let i=0;i<cn;i++)VFX.add(0,i%3?z.c:'#fff',x+(Math.random()-.5)*(z.x1-z.x0),yb,(Math.random()-.5)*160,-(80+Math.random()*260)*(up?1:.5),.5,12,3,{a:.9,g:260});VFX.wave(x,yb,z.c,Math.min(160,(z.x1-z.x0)*.9),.4,.3);if(z.kind=='bolt')VFX.wave(x,z.y0+(z.y1-z.y0)*.5,'#fff',60,.25,.4)}catch(_){}}
 function tick(dt){const m=boss();
  const hb=document.getElementById('bossbar');if(hb&&!m)hb.style.display='none';
  if(!m){if(HZ.length||ORB.length){HZ.length=0;ORB.length=0;MOV.length=0;gust=null}return}
  const b=id(m),p2=m.phase==2;if(!ATK[b])return;
  if(m.born==null)m.born=performance.now();
  if(m.xt==null){m.xt=3.2;m.xc=0;m.stag=0;m.shieldAt=[.66,.33];m.shield=0}
  if(m.stag>0){m.stag-=dt;m.xt=Math.max(m.xt,1.2)}
  // shield: Sovereign + Eclipse raise a barrier at set health marks; breaking it staggers the boss
  if(b!='warden'&&m.shieldAt.length&&m.hp/m.mhp<m.shieldAt[0]){m.shieldAt.shift();m.shield=m.mhp*.12;m.shieldMax=m.shield;UI6.say6('SHIELD UP','Burst it down to break it',1800);VFX.wave(m.x,m.y+m.h/2,cols[b],260,.8,.4);snd(520,.4,'sine',.08,.6)}
  m.xt-=dt;if(m.xt<=0&&m.stag<=0&&performance.now()-m.born>1600){const l=LIST[b],pick=l[Math.random()*l.length|0];try{ATK[b][pick](m,p2)}catch(e){console.error(e)}m.xc++;m.xt=p2?3.0:4.4;
   if(m.xc%4==0){m.stag=3.4;m.xt=3.6;UI6.say6('EXHAUSTED','Hit it now',1400);VFX.wave(m.x,m.y+m.h/2,'#ffd24a',200,.7,.3)}}
  // dash / pull state
  if(m.dash){m.dash.t+=dt;if(m.dash.t>m.dash.tel){const k=Math.min(1,(m.dash.t-m.dash.tel)/.35);m.x+=(m.dash.tx-m.x)*Math.min(1,dt*9);m.y+=(m.dash.y-m.h*.4-m.y)*Math.min(1,dt*7);if(k>=1)m.dash=null}}
  if(m.pull>0){m.pull-=dt;const dx=m.x-P.x,d=Math.abs(dx);if(m.pull<2.4&&d<T*16){P.x+=Math.sign(dx)*Math.min(150,60+ (T*16-d)*.1)*dt}if(Math.hypot(dx,m.y+m.h/2-(P.y+P.h/2))<T*2.4&&m.pull<2.4)hit(m.dmg*.9,Math.sign(-dx||1)*300)}
  // hazards (a short burst of particles marks the moment a zone goes live)
  for(let i=HZ.length-1;i>=0;i--){const z=HZ[i];if(z.tel>0){z.tel-=dt;if(z.tel<=0)zoneFx(z)}else{z.act-=dt;
    if(z.rep){z.rt-=dt;if(z.rt<=0&&hitsP(z)){z.rt=z.rep;hit(z.dmg,Math.sign(P.x-(z.x0+z.x1)/2||1)*z.kb)}if(z.kind=='fire'&&!QM.reduce&&Math.random()<dt*14)VFX.add(0,Math.random()<.5?'#ff8a3a':'#ffd24a',z.x0+Math.random()*(z.x1-z.x0),z.y1-4,0,-50-Math.random()*60,.5,10,3,{a:.8})}
    else if(!z.hit&&hitsP(z)){z.hit=1;hit(z.dmg,Math.sign(P.x-(z.x0+z.x1)/2||1)*z.kb)}if(z.act<=0)HZ.splice(i,1)}}
  // moving tidal waves
  for(let i=MOV.length-1;i>=0;i--){const v=MOV[i];if(v.tel>0){v.tel-=dt;continue}v.x+=v.d*v.sp*dt;v.l-=dt;const r={x0:v.x-T*.9,x1:v.x+T*.9,y0:v.gy-v.h,y1:v.gy};
   if(!QM.reduce&&Math.random()<dt*30)VFX.add(0,'#bfe6ff',v.x+(Math.random()-.5)*T,v.gy-Math.random()*v.h,0,-30,.5,10,3,{a:.7});
   if(!v.hit&&hitsP(r)){v.hit=1;hit(v.dmg,v.d*380)}if(v.l<=0||v.x<0||v.x>W*T)MOV.splice(i,1)}
  // gale: pushes you toward the boss unless you push back
  if(gust){if(gust.wait>0)gust.wait-=dt;else{gust.t-=dt;P.vx+=gust.d*(P.g?700:1000)*dt;if(!QM.reduce&&Math.random()<.5)VFX.add(0,'#eef6ff',cam.x+Math.random()*cv.width/ZM,cam.y+Math.random()*cv.height/ZM,gust.d*420,0,.4,10,2,{a:.5});if(gust.t<=0)gust=null}}
  // homing void orbs
  for(let i=ORB.length-1;i>=0;i--){const o=ORB[i];o.l-=dt;const dx=P.x-o.x,dy=P.y+P.h/2-o.y,d=Math.hypot(dx,dy)||1,sp=p2?190:140;if(!o.straight){o.vx+=dx/d*260*dt;o.vy+=dy/d*260*dt;const v=Math.hypot(o.vx,o.vy);if(v>sp){o.vx*=sp/v;o.vy*=sp/v}}o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.straight&&solidAt(Math.floor(o.x/T),Math.floor(o.y/T)))o.l=0;
   if(Math.random()<.4)VFX.add(0,'#b58cff',o.x,o.y,0,0,.3,12,2,{a:.7});
   if(d<P.w/2+(o.r||12)){hit(m.dmg*.8,Math.sign(o.vx||1)*200);o.l=0}if(o.l<=0){VFX.burst(o.x,o.y,['#b58cff','#fff'],6,120,1,.4,9);ORB.splice(i,1)}}}
 // damage shaping: shield absorbs, exhausted bosses take extra
 {const _h=hurtMob;hurtMob=function(m,d,w,ang){if(m.boss&&m.k&&m.k.startsWith('boss_')){if(m.shield>0){const ab=Math.min(d,m.shield);m.shield-=ab;d-=ab;if(m.shield<=0){m.shield=0;m.stag=4.2;m.xt=4.4;UI6.say6('SHIELD BROKEN','Strike now!',1500);try{VFX.shatter(m.x,m.y+m.h/2,['#fff',cols[id(m)]],30)}catch(_){}snd(900,.2,'triangle',.08,1.2)}if(d<=0)d=.01}else if(m.stag>0)d*=1.45}return _h.call(this,m,d,w,ang)}}
 // no building inside a boss (or right beside it)
 {const _pa=placeAction;placeAction=function(){try{const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);for(const m of mobs){if(!m.boss||m.dead)continue;if(tx*T<m.x+m.w/2+T&&(tx+1)*T>m.x-m.w/2-T&&ty*T<m.y+m.h+T&&(ty+1)*T>m.y-T){if(performance.now()-nb>1200){nb=performance.now();say("You can't build inside a boss");try{UIS.play('error')}catch(_){}}return}}}catch(_){}return _pa.apply(this,arguments)}}

 // ---- art for the three new bosses (feet at the origin after translate)
 const NEWART={magma:1,tide:1,storm:1},OL='#0e0818';
 function artNew(m,now,b){const px=m.x-cam.x,py=m.y-cam.y+m.h,t=now/1000,fl=m.fl>0,enr=m.phase==2,f=(P.x>m.x)?1:-1,w=m.w,h=m.h;g.save();g.translate(px,py);g.lineJoin='round';g.lineCap='round';
  if(b=='magma'){const mv=Math.abs(m.vx)>10?1:.15,sw=Math.sin(t*4)*mv,pulse=.55+.45*Math.sin(t*3),rock=fl?'#fff':'#3a2e3c',rock2=fl?'#ddd':'#1d1624';g.scale(f,1);
   // legs
   for(const s of[-1,1]){g.fillStyle=rock2;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.roundRect(s*w*.2-14+s*sw*8,-h*.38,28,h*.38,6);g.fill();g.stroke()}
   // far arm, torso, near arm
   const arm=(s,ph)=>{const a=Math.sin(t*4+ph)*mv*.5,sx=s*w*.46,sy=-h*.78;g.strokeStyle=OL;g.lineWidth=17;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+s*10+a*14,sy+h*.34);g.stroke();g.strokeStyle=rock;g.lineWidth=12;g.stroke();g.fillStyle=rock;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.arc(sx+s*10+a*14,sy+h*.4,16,0,6.3);g.fill();g.stroke();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,110,30,'+(.35+.3*pulse)+')';g.beginPath();g.arc(sx+s*10+a*14,sy+h*.4,9,0,6.3);g.fill();g.globalCompositeOperation='source-over'};arm(-1,0);
   const gr=g.createLinearGradient(0,-h*.9,0,-h*.3);gr.addColorStop(0,fl?'#fff':'#4a3c4e');gr.addColorStop(1,rock2);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=3.5;g.beginPath();g.moveTo(-w*.42,-h*.4);g.lineTo(-w*.5,-h*.7);g.lineTo(-w*.3,-h*.9);g.lineTo(w*.3,-h*.9);g.lineTo(w*.5,-h*.7);g.lineTo(w*.42,-h*.4);g.lineTo(w*.2,-h*.3);g.lineTo(-w*.2,-h*.3);g.closePath();g.fill();g.stroke();
   // lava cracks
   g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,'+(enr?70:120)+',30,'+(.55+.4*pulse)+')';g.lineWidth=3;g.shadowColor='#ff6a2a';g.shadowBlur=QM.cur.wfx>=1?10:0;for(const c of[[-.2,-.85,-.05,-.6,-.2,-.4],[.25,-.82,.1,-.62,.28,-.45],[0,-.62,.02,-.4]]){g.beginPath();c.length==6?(g.moveTo(c[0]*w,c[1]*h),g.lineTo(c[2]*w,c[3]*h),g.lineTo(c[4]*w,c[5]*h)):(g.moveTo(c[0]*w,c[1]*h),g.lineTo(c[2]*w,c[3]*h));g.stroke()}g.shadowBlur=0;
   const cg=g.createRadialGradient(0,-h*.6,2,0,-h*.6,w*.4);cg.addColorStop(0,'rgba(255,170,60,'+(.5+.3*pulse)+')');cg.addColorStop(1,'rgba(255,100,20,0)');g.fillStyle=cg;g.fillRect(-w*.5,-h*.95,w,h*.65);g.globalCompositeOperation='source-over';
   // head + shoulder spikes
   g.fillStyle=rock;g.strokeStyle=OL;g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(s*w*.36,-h*.86);g.lineTo(s*w*.5,-h*1.02);g.lineTo(s*w*.22,-h*.9);g.closePath();g.fill();g.stroke()}
   g.beginPath();g.roundRect(-w*.17,-h*1.04,w*.34,h*.2,8);g.fill();g.stroke();g.fillStyle=enr?'#ff3a2a':'#ffb24a';g.shadowColor=g.fillStyle;g.shadowBlur=8;g.fillRect(w*.02,-h*.97,w*.1,5);g.fillRect(-w*.1,-h*.97,w*.08,5);g.shadowBlur=0;arm(1,2);
   if(!QM.reduce&&Math.random()<.25)VFX.add(0,'#ff8a3a',m.x+(Math.random()-.5)*w*.6,m.y+h*(.2+Math.random()*.5),0,40,.7,10,3,{a:.8,g:200})}
  else if(b=='tide'){g.scale(f,1);const n=15,seg=w/n,hy=-h*.55,wob=(i)=>Math.sin(t*3-i*.55)*(8+i*.7);const gx=i=>-i*seg*.92+w*.38,gy=i=>hy+wob(i);
   const col1=fl?'#fff':'#2a6fb8',col2=fl?'#ddd':'#8fd8ff';
   for(let i=n-1;i>=1;i--){const r=Math.max(6,(h*.48)*(1-i/(n+3)));const gr=g.createRadialGradient(gx(i)-r*.3,gy(i)-r*.4,1,gx(i),gy(i),r);gr.addColorStop(0,col2);gr.addColorStop(1,col1);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.arc(gx(i),gy(i),r,0,6.3);g.fill();g.stroke();
    if(i%2==0){g.fillStyle=enr?'#ff5a6a':'#4ae8ff';g.beginPath();g.moveTo(gx(i)-4,gy(i)-r+1);g.lineTo(gx(i)+2,gy(i)-r-9-(i%4));g.lineTo(gx(i)+7,gy(i)-r+2);g.closePath();g.fill();g.stroke()}}
   const hx=gx(0),hy2=gy(0),r0=h*.5;const gr=g.createRadialGradient(hx-r0*.3,hy2-r0*.4,2,hx,hy2,r0*1.2);gr.addColorStop(0,col2);gr.addColorStop(1,col1);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.ellipse(hx+6,hy2,r0*1.05,r0*.8,0,0,6.3);g.fill();g.stroke();
   g.fillStyle='#10304a';g.beginPath();g.moveTo(hx+r0*.3,hy2+r0*.15);g.quadraticCurveTo(hx+r0,hy2+r0*.55,hx+r0*1.0,hy2+r0*.25);g.quadraticCurveTo(hx+r0*.7,hy2+r0*.3,hx+r0*.3,hy2+r0*.15);g.fill();g.fillStyle='#fff';for(let i=0;i<4;i++){g.beginPath();g.moveTo(hx+r0*(.45+i*.14),hy2+r0*.3);g.lineTo(hx+r0*(.5+i*.14),hy2+r0*.45);g.lineTo(hx+r0*(.55+i*.14),hy2+r0*.3);g.fill()}
   g.fillStyle='#fff6c8';g.beginPath();g.arc(hx+r0*.35,hy2-r0*.15,r0*.24,0,6.3);g.fill();g.stroke();g.fillStyle=enr?'#ff2a3a':'#06222f';g.beginPath();g.ellipse(hx+r0*.4,hy2-r0*.15,r0*.07,r0*.2,0,0,6.3);g.fill();
   g.globalCompositeOperation='lighter';const lr=g.createRadialGradient(hx+r0*.2,hy2-r0*1.15,1,hx+r0*.2,hy2-r0*1.15,16);lr.addColorStop(0,'#fff');lr.addColorStop(.4,'#6ae8ff');lr.addColorStop(1,'rgba(60,200,255,0)');g.fillStyle=lr;g.fillRect(hx+r0*.2-16,hy2-r0*1.15-16,32,32);g.strokeStyle='rgba(120,220,255,.6)';g.lineWidth=2;g.beginPath();g.moveTo(hx+r0*.1,hy2-r0*.7);g.quadraticCurveTo(hx+r0*.1,hy2-r0*1.1,hx+r0*.2,hy2-r0*1.15);g.stroke();g.globalCompositeOperation='source-over';
   if(!QM.reduce&&Math.random()<.2)VFX.add(0,'#bfe6ff',m.x+(Math.random()-.5)*w,m.y+h*Math.random(),0,-30,.9,12,4,{a:.5})}
  else{g.scale(f,1);const bob=Math.sin(t*2.2)*5,fl2=Math.sin(t*(m.bs=='tele'?14:6)),cy=-h*.5+bob;g.translate(0,cy);
   const feather=(a0,len,wid,c1,c2)=>{g.save();g.rotate(a0);const gr=g.createLinearGradient(0,0,len,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-wid,len,-wid*.15);g.quadraticCurveTo(len*.55,wid*.7,0,0);g.fill();g.stroke();g.restore()};
   const c1=fl?'#fff':'#e8c438',c2=fl?'#eee':'#fff4b0';
   // far wing, tail, body, near wing
   for(const side of[0,1]){if(side==1){g.fillStyle=fl?'#fff':'#f7d84a';g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.ellipse(0,0,w*.3,h*.3,0,0,6.3);g.fill();g.stroke();g.fillStyle=fl?'#fff':'#fff8d0';g.beginPath();g.ellipse(w*.02,h*.1,w*.2,h*.18,0,0,6.3);g.fill();
     for(let i=0;i<4;i++)feather(Math.PI-.5+i*.28,w*.3,10,c1,c2);
     g.fillStyle=fl?'#fff':'#f7d84a';g.beginPath();g.arc(w*.3,-h*.12,h*.2,0,6.3);g.fill();g.stroke();g.fillStyle='#ff9a2a';g.beginPath();g.moveTo(w*.45,-h*.16);g.lineTo(w*.6,-h*.08);g.lineTo(w*.45,-h*.02);g.closePath();g.fill();g.stroke();
     g.fillStyle='#fff';g.beginPath();g.arc(w*.34,-h*.16,5,0,6.3);g.fill();g.stroke();g.fillStyle=enr?'#ff2a3a':'#241a06';g.beginPath();g.arc(w*.35,-h*.16,2.4,0,6.3);g.fill();for(let i=0;i<3;i++)feather(-Math.PI/2-.4+i*.35,h*.28,6,'#ffb030','#fff0a0')}
    const flap=fl2*.7*(side?1:.85)+(side?0:.2),root=[ -w*.04,-h*.12];g.save();g.translate(root[0],root[1]);g.scale(1,side?1:.9);g.globalAlpha=side?1:.8;for(let i=0;i<8;i++)feather(-Math.PI/2.1+flap*(.4+i*.1)-i*.16-(side?0:.1),w*(.6-i*.02),14-i*.8,c1,c2);g.restore();if(side==0){}}
   if(Math.random()<(enr?.5:.25)){g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,250,170,.9)';g.lineWidth=2;g.shadowColor='#ffe27a';g.shadowBlur=QM.cur.wfx>=1?8:0;g.beginPath();let x0=-w*.5,y0=-h*.3;g.moveTo(x0,y0);for(let i=0;i<6;i++){x0+=w*.17;y0+=(Math.random()-.5)*h*.5;g.lineTo(x0,y0)}g.stroke();g.shadowBlur=0;g.globalCompositeOperation='source-over'}}
  g.restore();
  const hr=m.hp/m.mhp;if(hr<1){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(px-m.w/2,m.y-cam.y-14,m.w,6);g.fillStyle='#ff5a6a';g.fillRect(px-m.w/2+1,m.y-cam.y-13,(m.w-2)*Math.max(0,hr),4)}}
 // animation wrapper: spawn rise, wind-up crouch, recoil, shadow, shield bubble, exhaustion stars
 {const _dm=drawMob;drawMob=function(m,now){if(!(m.boss&&m.k&&m.k.startsWith('boss_')))return _dm(m,now);
  if(m.born==null)m.born=now;const sp=Math.min(1,(now-m.born)/1300),e=1-Math.pow(1-sp,3),fx=m.x-cam.x,fy=m.y+m.h-cam.y,b=id(m),c=cols[b]||'#fff',t=now/1000;
  g.save();
  // ground shadow
  try{const gy=b=='eclipse'?gyAt(m.x,m.y+m.h)-cam.y:fy;const hgt=Math.max(0,Math.min(1,(gy-fy)/260));g.globalAlpha=(.35-.2*hgt)*e;g.fillStyle='#000';g.beginPath();g.ellipse(fx,gy-2,m.w*.5*(1-.3*hgt),7,0,0,6.3);g.fill();g.globalAlpha=1}catch(_){}
  let sx=1,sy=1;if(m.bs=='tele'){const k=1-Math.max(0,Math.min(1,m.bt/.95));sy=1-.09*k;sx=1+.06*k}else if(m.bt>2.2){const k=(m.bt-2.2)/.4;sy=1+.05*Math.max(0,k);sx=1-.03*Math.max(0,k)}
  if(m.stag>0){sy*=.96;g.rotate(0)}
  sy*=.35+.65*e;g.globalAlpha=Math.min(1,e*1.4);
  g.translate(fx,fy);g.scale(sx,sy);g.translate(-fx,-fy);
  (NEWART[b]?artNew(m,now,b):_dm(m,now));g.restore();
  g.save();
  if(m.shield>0){const r=Math.max(m.w,m.h)*.78,cx=fx,cy=m.y+m.h/2-cam.y;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(cx,cy,r*.6,cx,cy,r);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,c);g.globalAlpha=.35+.25*Math.sin(t*5);g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,6.3);g.fill();g.globalAlpha=.9;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(cx,cy,r,0,6.3);g.stroke();g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle='rgba(0,0,0,.6)';g.fillRect(cx-m.w/2,m.y-cam.y-26,m.w,5);g.fillStyle='#fff';g.fillRect(cx-m.w/2+1,m.y-cam.y-25,(m.w-2)*Math.max(0,m.shield/(m.shieldMax||1)),3)}
  if(m.stag>0){g.fillStyle='#ffd24a';for(let i=0;i<3;i++){const a=t*4+i*2.1,sx2=fx+Math.cos(a)*22,sy2=m.y-cam.y-10+Math.sin(a)*6;g.beginPath();for(let k=0;k<10;k++){const r=k%2?3:7,aa=k*Math.PI/5;g.lineTo(sx2+Math.cos(aa)*r,sy2+Math.sin(aa)*r)}g.closePath();g.fill()}}
  if(m.phase==2&&!QM.reduce&&Math.random()<.5)VFX.mote(m.x+rn(-m.w/2,m.w/2),m.y+m.h*Math.random(),'#ff5a6a');
  g.restore()}}
 // draw hazards + orbs (called by the game loop through BOSS6.drawProj)
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(gc,cx,cy){try{_dp.call(this,gc,cx,cy)}catch(_){}if(!HZ.length&&!ORB.length)return;const t=performance.now()/1000;gc.save();
  for(const z of HZ){const x=z.x0-cx,y=z.y0-cy,w=z.x1-z.x0,h=z.y1-z.y0;
   if(z.tel>0){const k=1-z.tel/z.tel0,fl=.5+.5*Math.sin(t*20),warn=z.kind=='fire'?'#ff9a3a':'#ff5a6a';gc.globalAlpha=.07+.06*fl;gc.fillStyle=warn;gc.fillRect(x,y,w,h);
    gc.globalAlpha=.35+.35*k;gc.strokeStyle=warn;gc.lineWidth=1.5;gc.setLineDash([7,6]);gc.strokeRect(x+.5,y+.5,w-1,h-1);gc.setLineDash([]);
    gc.globalAlpha=.85;gc.fillStyle=warn;if(z.kind=='beam'){gc.fillRect(x,y+h/2-1.5,w*k,3)}else{gc.fillRect(x,y+h-4,w*k,4)}
    if(k>.55){gc.globalAlpha=(k-.55)*1.5*(.5+.5*fl);gc.fillStyle='#fff';gc.fillRect(x+w/2-1,y+(z.kind=='beam'?0:h*.2),2,z.kind=='beam'?h:h*.8)}}
   else if(z.kind=='fire'){const f=.5+.5*Math.sin(t*14+z.x0);gc.globalCompositeOperation='lighter';gc.globalAlpha=.3+.2*f;const gr=gc.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(255,140,40,0)');gr.addColorStop(1,'rgba(255,120,30,.9)');gc.fillStyle=gr;gc.fillRect(x,y,w,h);gc.globalCompositeOperation='source-over'}
   else{const a=Math.max(0,Math.min(1,z.act/(z.act0||.35)));gc.globalCompositeOperation='lighter';
    const gr=z.kind=='beam'?gc.createLinearGradient(0,y,0,y+h):gc.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,'+(.7*a)+')');gr.addColorStop(1,'rgba(255,255,255,0)');
    gc.globalAlpha=.42*a;gc.fillStyle=z.c;gc.fillRect(x,y,w,h);gc.globalAlpha=1;gc.fillStyle=gr;gc.fillRect(x,y,w,h);gc.globalCompositeOperation='source-over'}}
  for(const v of MOV){const x=v.x-cx,y=v.gy-cy,hh=v.h;if(v.tel>0){const k=1-v.tel/v.tel0;gc.globalAlpha=.5+.4*Math.sin(t*18);gc.fillStyle='#ff5a6a';const ax=x,dir=v.d;gc.beginPath();gc.moveTo(ax+dir*30,y-hh/2);gc.lineTo(ax,y-hh/2-16);gc.lineTo(ax,y-hh/2+16);gc.closePath();gc.fill();gc.globalAlpha=.12;gc.fillRect(Math.min(x,x+dir*T*30),y-hh,Math.abs(T*30),hh);gc.globalAlpha=1;continue}
   gc.globalCompositeOperation='lighter';const gr=gc.createLinearGradient(x-T*.9,0,x+T*.9,0);gr.addColorStop(0,'rgba(120,200,255,0)');gr.addColorStop(.5,'rgba(190,235,255,.75)');gr.addColorStop(1,'rgba(120,200,255,0)');gc.fillStyle=gr;gc.fillRect(x-T*.9,y-hh,T*1.8,hh);gc.strokeStyle='rgba(255,255,255,.8)';gc.lineWidth=3;gc.beginPath();for(let i=0;i<=8;i++){const px=x-T*.9+i*T*.225,py=y-hh+Math.sin(t*10+i)*5;i?gc.lineTo(px,py):gc.moveTo(px,py)}gc.stroke();gc.globalCompositeOperation='source-over'}
  if(gust&&gust.wait>0){gc.globalAlpha=.35;gc.strokeStyle='#fff';gc.lineWidth=1.5;for(let i=0;i<7;i++){const yy=((t*60+i*97)%260)+20,xx=((t*500*gust.d+i*190)%600+600)%600;gc.beginPath();gc.moveTo(xx,yy);gc.lineTo(xx+gust.d*60,yy);gc.stroke()}gc.globalAlpha=1}
  gc.globalCompositeOperation='lighter';for(const o of ORB){const R2=(o.r||12)+6,gr=gc.createRadialGradient(o.x-cx,o.y-cy,0,o.x-cx,o.y-cy,R2);gr.addColorStop(0,'#fff');gr.addColorStop(.35,o.c);gr.addColorStop(1,'rgba(0,0,0,0)');gc.globalAlpha=1;gc.fillStyle=gr;gc.fillRect(o.x-cx-R2,o.y-cy-R2,R2*2,R2*2)}
  gc.restore()}}
 {const _t=BOSS6.tick,_c=BOSS6.clear;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('BOSSX',e)}};BOSS6.clear=function(){_c.call(this);HZ.length=0;ORB.length=0;MOV.length=0;gust=null;const hb=document.getElementById('bossbar');if(hb)hb.style.display='none'}}
 return{HZ,ORB,tick}})();
