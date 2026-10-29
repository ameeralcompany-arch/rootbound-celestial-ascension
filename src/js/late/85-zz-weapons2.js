// ===== WFX8: eight shop weapons with their own physics (thrust line, whip rope, returning chakram, arrow arcs, spring flail,
// bouncing gravity orb, ricocheting shuriken, ground shockwave). Each has its own held model, impact effect and sound. =====
const WFX8=(()=>{
 const R=Math.random,PR=[];
 const NEW=WFX8NEW;
 const pos=()=>({x:P.x,y:P.y+23});
 const rad=m=>Math.max(m.w,m.h)*.5;
 const live=m=>!m.dead&&m.hp>0;
 const dmg=(w,k)=>Math.max(1,Math.round(dmgM(w)*(k||1)));
 const hit=(m,w,k,ang)=>{try{hurtMob(m,dmg(w,k),w,ang)}catch(e){console.error(e)}};
 const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/l;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(ax+dx*t),py-(ay+dy*t))};
 const gyAt=(x,y0)=>{const tx=Math.max(1,Math.min(W-2,Math.floor(x/T)));let ty=Math.max(0,Math.floor(y0/T));for(let i=0;i<20&&ty<H-1;i++,ty++)if(solidAt(tx,ty))return ty*T;return y0};
 const spark=(x,y,c,n,sp)=>{if(QM&&QM.reduce)n=Math.ceil(n/3);for(let i=0;i<n;i++){const a=R()*6.28,v=(.3+R())*(sp||120);VFX.add(1,c,x,y,Math.cos(a)*v,Math.sin(a)*v,.45,9,2,{a:1})}};
 // weapons never break blocks (only tools do): the line just stops at the first solid block
 const breakLine=(o,a,len,bd)=>{for(let d=T*.5;d<=len;d+=T*.5){const tx=Math.floor((o.x+Math.cos(a)*d)/T),ty=Math.floor((o.y+Math.sin(a)*d)/T);if(solidAt(tx,ty))return d}return len};
 const bdOf=w=>w.bd+bonus().pow+(wUp[wp]|0)+Math.floor(prof.mine.l/6);
 const SFX={skyspear:[[900,.1,'triangle',.05,.5],[1500,.06,'sine',.03,.6]],thornlash:[[300,.14,'sawtooth',.05,.4],[1800,.04,'square',.04,.8]],moonchakram:[[700,.25,'sine',.04,.6]],zephyrbow:[[260,.08,'triangle',.06,.5],[1100,.07,'sine',.03,.6]],
  stormflail:[[130,.3,'sawtooth',.06,.5]],gravitystaff:[[160,.25,'sine',.07,.4],[640,.2,'sine',.03,.5]],galeshuriken:[[1700,.08,'sine',.04,.5],[2100,.06,'sine',.03,.5]],titanmaul:[[70,.4,'square',.1,.4],[160,.2,'sawtooth',.05,.5]]};
 const sfx=id=>{for(const s of SFX[id]||[])snd(s[0],s[1],s[2],s[3],s[4])};
 const BEH={
  skyspear(w,a,o){const L=T*3.7;breakLine(o,a,L,bdOf(w));PR.push({k:'spear',x:o.x,y:o.y,a,L,t:.26,t0:.26});
   for(const m of mobs)if(live(m)&&segDist(m.x,m.y+m.h/2,o.x,o.y,o.x+Math.cos(a)*L,o.y+Math.sin(a)*L)<rad(m)+8){hit(m,w,1,a);spark(m.x,m.y+m.h/2,'#e8f6ff',6,150)}},
  thornlash(w,a,o){PR.push({k:'whip',a,L:T*4.4,t:.34,t0:.34,hit:new Set(),w})},
  moonchakram(w,a,o){if(PR.some(p=>p.k=='chak'))return;PR.push({k:'chak',a,u:0,T:1.15,D:T*6.4,W:T*.9*(P.f||1),hit:new Set(),w,x:o.x,y:o.y,rot:0})},
  zephyrbow(w,a,o){PR.push({k:'arrow',x:o.x,y:o.y,vx:Math.cos(a)*980,vy:Math.sin(a)*980,l:3,w,stuck:0,pierce:1,hit:new Set()})},
  stormflail(w,a,o){if(PR.some(p=>p.k=='flail'))return;PR.push({k:'flail',a,w,av:(P.f||1)*17,t:1.5,x:o.x+Math.cos(a)*T,y:o.y+Math.sin(a)*T,vx:0,vy:0,cd:new Map()})},
  gravitystaff(w,a,o){PR.push({k:'orb',x:o.x,y:o.y,vx:Math.cos(a)*560,vy:Math.sin(a)*560-120,l:4.5,b:0,w,r:11})},
  galeshuriken(w,a,o){for(let i=-1;i<=1;i++){const q=a+i*.24;PR.push({k:'shur',x:o.x,y:o.y,vx:Math.cos(q)*720,vy:Math.sin(q)*720,l:1.5,w,rc:1,rot:R()*6,hit:new Set()})}},
  titanmaul(w,a,o){const gy=gyAt(P.x,P.y+P.h-4);breakLine({x:P.x,y:P.y+23},Math.PI/2,T*2.6,bdOf(w));for(const d of[-1,1])PR.push({k:'quake',x:P.x,d,sp:560,l:.85,w,hit:new Set(),gy});shake=Math.max(shake,QM.reduce?0:.22);VFX.wave(P.x,gy,'#ff9a4a',200,.5,.3);spark(P.x,gy-6,'#ffb06a',16,220)}};
 function use(w){const cdm=over>0?.5:1;wcd=w.cd*cdm/(1+bonus().atk);swing=.22;const wx=mx+cam.x,wy=my+cam.y,o=pos(),a=Math.atan2(wy-o.y,wx-o.x);P.f=Math.cos(a)>=0?1:-1;sfx(w.id);
  try{FX7.weaponAnim(w.id)}catch(_){}BEH[w.id](w,a,o)}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&BEH[w.id]&&own[w.id]){use(w);return}return _uw.apply(this,arguments)}}
 function tick(dt){const o=pos();for(let i=PR.length-1;i>=0;i--){const p=PR[i];let dead=false;
  if(p.k=='spear'){p.t-=dt;dead=p.t<=0;p.x=o.x;p.y=o.y}
  else if(p.k=='whip'){p.t-=dt;p.x=o.x;p.y=o.y;const e=Math.sin(Math.min(1,(p.t0-p.t)/(p.t0*.55))*Math.PI/2),Ln=p.L*e,wv=Math.sin((p.t0-p.t)*26);
   if(p.t>p.t0*.2)for(const m of mobs){if(!live(m)||p.hit.has(m))continue;for(let s=3;s<=14;s++){const u=s/14,d=Ln*u,amp=Math.max(0,1-u*.6)*T*.5*wv*(1-e*.5),px=o.x+Math.cos(p.a)*d-Math.sin(p.a)*amp,py=o.y+Math.sin(p.a)*d+Math.cos(p.a)*amp;if(Math.hypot(m.x-px,m.y+m.h/2-py)<rad(m)+14){p.hit.add(m);hit(m,p.w,1,p.a);m.vx+=(P.x-m.x)*2.2;spark(px,py,'#b8ffc0',8,160);snd(1900,.05,'square',.05,.6);break}}}
   dead=p.t<=0}
  else if(p.k=='chak'){p.u+=dt/p.T;if(p.u>=1)dead=true;else{if(p.u>.5&&!p.half){p.half=1;p.hit.clear()}const s=p.u,al=p.D*(1-Math.cos(2*Math.PI*s))/2,pe=p.W*Math.sin(2*Math.PI*s),ca=Math.cos(p.a),sa=Math.sin(p.a);p.x=o.x+ca*al-sa*pe;p.y=o.y+sa*al+ca*pe;p.rot+=dt*22;
   if(solidAt(Math.floor(p.x/T),Math.floor(p.y/T))&&s<.5){p.u=1-s;p.half=1;p.hit.clear();spark(p.x,p.y,'#d8ceff',8,160)}
   for(const m of mobs)if(live(m)&&!p.hit.has(m)&&Math.hypot(m.x-p.x,m.y+m.h/2-p.y)<rad(m)+18){p.hit.add(m);hit(m,p.w,1,Math.atan2(m.y-p.y,m.x-p.x));spark(p.x,p.y,'#d8ceff',6,150)}
   if(Math.random()<.6)VFX.add(0,'#cfc4ff',p.x,p.y,0,0,.3,11,2,{a:.7});if(p.u>.93&&Math.hypot(p.x-o.x,p.y-o.y)<T*1.3){dead=true;snd(900,.06,'triangle',.05,.8)}}}
  else if(p.k=='arrow'){if(p.stuck){p.stuck-=dt;dead=p.stuck<=0}else{p.vy+=700*dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;p.l-=dt;
   if(solidAt(Math.floor(nx/T),Math.floor(ny/T))){p.stuck=1.6;spark(p.x,p.y,'#caffe8',5,90);snd(220,.06,'square',.05,.5)}else{p.x=nx;p.y=ny;
    for(const m of mobs)if(live(m)&&!p.hit.has(m)&&Math.hypot(m.x-p.x,m.y+m.h/2-p.y)<rad(m)+8){p.hit.add(m);hit(m,p.w,1.2,Math.atan2(p.vy,p.vx));spark(p.x,p.y,'#caffe8',7,140);if(--p.pierce<0){dead=true;break}}}
   if(p.l<=0||p.y>H*T)dead=true;if(Math.random()<.5)VFX.add(0,'#bfffe0',p.x,p.y,0,0,.25,9,2,{a:.6})}}
  else if(p.k=='flail'){p.t-=dt;if(p.t<=0)dead=true;else{const el=1.5-p.t,r=T*(1.0+1.6*Math.min(1,el/.3))*(p.t<.35?p.t/.35:1)+8,tx=o.x+Math.cos(p.a)*r,ty=o.y+Math.sin(p.a)*r;p.a+=p.av*dt;p.av*=Math.max(0,1-.55*dt);
   p.vx+=((tx-p.x)*90-p.vx*7)*dt;p.vy+=((ty-p.y)*90-p.vy*7)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const sp=Math.hypot(p.vx,p.vy);
   if(sp>260)for(const m of mobs)if(live(m)&&Math.hypot(m.x-p.x,m.y+m.h/2-p.y)<rad(m)+16&&(p.cd.get(m)||0)<=el){p.cd.set(m,el+.3);hit(m,p.w,.8+Math.min(.6,sp/1400),Math.atan2(m.y-p.y,m.x-p.x));spark(p.x,p.y,'#fff0a0',8,170);shake=Math.max(shake,QM.reduce?0:.06)}
   if(sp>300&&Math.random()<.7)VFX.add(0,'#ffe27a',p.x,p.y,0,0,.3,12,3,{a:.8});if(solidAt(Math.floor(p.x/T),Math.floor(p.y/T))&&sp>200&&R()<.12)spark(p.x,p.y,'#fff0a0',4,90)}}
  else if(p.k=='orb'){p.l-=dt;p.vy+=900*dt;let nx=p.x+p.vx*dt,ny=p.y+p.vy*dt,boom=false;
   if(solidAt(Math.floor(nx/T),Math.floor(p.y/T))){p.vx*=-.78;nx=p.x;p.b++;snd(180+p.b*60,.08,'sine',.06,.6);spark(p.x,p.y,'#e2b8ff',5,100)}
   if(solidAt(Math.floor(p.x/T),Math.floor(ny/T))){p.vy*=-.78;if(Math.abs(p.vy)<90)p.vy=-90;ny=p.y;p.b++;snd(180+p.b*60,.08,'sine',.06,.6);spark(p.x,p.y,'#e2b8ff',5,100)}
   p.x=nx;p.y=ny;if(Math.random()<.7)VFX.add(0,'#c690ff',p.x,p.y,0,0,.35,14,3,{a:.7});
   for(const m of mobs)if(live(m)&&Math.hypot(m.x-p.x,m.y+m.h/2-p.y)<rad(m)+p.r){boom=true;break}
   if(boom||p.b>=4||p.l<=0){dead=true;for(const m of mobs)if(live(m)&&Math.hypot(m.x-p.x,m.y+m.h/2-p.y)<T*2.3+rad(m)){hit(m,p.w,1.4,Math.atan2(m.y-p.y,m.x-p.x));m.vx+=(p.x-m.x)*3}
    PR.push({k:'blast',x:p.x,y:p.y,t:.45,t0:.45,c:'190,120,255'});spark(p.x,p.y,'#d8a8ff',22,260);VFX.wave(p.x,p.y,'#b070ff',T*2.3,.5,.3);snd(90,.35,'sawtooth',.09,.4);snd(400,.2,'sine',.05,.5);shake=Math.max(shake,QM.reduce?0:.12);}}
  else if(p.k=='shur'){p.l-=dt;p.rot+=dt*30;let tg=null,bd=T*6;for(const m of mobs)if(live(m)){const d=Math.hypot(m.x-p.x,m.y+m.h/2-p.y);if(d<bd){bd=d;tg=m}}
   if(tg){const sp=Math.hypot(p.vx,p.vy),a0=Math.atan2(p.vy,p.vx),a1=Math.atan2(tg.y+tg.h/2-p.y,tg.x-p.x);let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const na=a0+Math.max(-4.5*dt,Math.min(4.5*dt,da));p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}
   let nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;if(solidAt(Math.floor(nx/T),Math.floor(p.y/T))){if(p.rc-->0){p.vx*=-1;nx=p.x;spark(p.x,p.y,'#bff',5,100);snd(1500,.05,'sine',.04,.7)}else dead=true}if(solidAt(Math.floor(p.x/T),Math.floor(ny/T))){if(p.rc-->0){p.vy*=-1;ny=p.y;spark(p.x,p.y,'#bff',5,100)}else dead=true}
   p.x=nx;p.y=ny;if(Math.random()<.5)VFX.add(0,'#aef4ff',p.x,p.y,0,0,.25,8,2,{a:.7});
   for(const m of mobs)if(live(m)&&!p.hit.has(m)&&Math.hypot(m.x-p.x,m.y+m.h/2-p.y)<rad(m)+10){p.hit.add(m);hit(m,p.w,.7,Math.atan2(p.vy,p.vx));spark(p.x,p.y,'#bff',6,130);dead=true;break}
   if(p.l<=0)dead=true}
  else if(p.k=='quake'){p.l-=dt;p.x+=p.d*p.sp*dt;const gy=gyAt(p.x,p.gy-T*2);if(Math.abs(gy-p.gy)>T*1.6||p.x<T||p.x>(W-1)*T)dead=true;else{p.gy=gy;
   if(Math.random()<.8)VFX.add(0,'#d8b890',p.x,gy-4,(R()-.5)*60,-60-R()*80,.5,12,3,{a:.8,g:200});
   for(const m of mobs)if(live(m)&&!p.hit.has(m)&&Math.abs(m.x-p.x)<T*.9+m.w/2&&Math.abs(m.y+m.h-gy)<T*1.4){p.hit.add(m);hit(m,p.w,1,p.d>0?-.3:Math.PI+.3);m.vy=-430;spark(m.x,m.y+m.h,'#ffcf8a',8,170)}}
   if(p.l<=0)dead=true}
  else if(p.k=='blast'){p.t-=dt;dead=p.t<=0}
  if(dead)PR.splice(i,1)}}
 function draw(g,cx,cy){if(!PR.length)return;const o=pos(),t=performance.now()/1000;g.save();g.lineCap='round';g.lineJoin='round';
  for(const p of PR){
   if(p.k=='spear'){const e=Math.sin(Math.min(1,(p.t0-p.t)/(p.t0*.45))*Math.PI/2),back=p.t<p.t0*.4?p.t/(p.t0*.4):1,Ln=p.L*e*(.55+.45*back),x0=p.x-cx,y0=p.y-cy,ca=Math.cos(p.a),sa=Math.sin(p.a);g.globalCompositeOperation='lighter';
    const gr=g.createLinearGradient(x0,y0,x0+ca*Ln,y0+sa*Ln);gr.addColorStop(0,'rgba(190,230,255,0)');gr.addColorStop(1,'rgba(235,248,255,'+(.9*back)+')');g.strokeStyle=gr;g.lineWidth=14*back;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+ca*Ln,y0+sa*Ln);g.stroke();g.strokeStyle='rgba(255,255,255,'+back+')';g.lineWidth=3;g.stroke();g.globalCompositeOperation='source-over';
    g.save();g.translate(x0+ca*Ln,y0+sa*Ln);g.rotate(p.a);g.fillStyle='#f4fbff';g.strokeStyle='#27425c';g.lineWidth=2;g.beginPath();g.moveTo(14,0);g.lineTo(-4,-7);g.lineTo(-1,0);g.lineTo(-4,7);g.closePath();g.fill();g.stroke();g.restore()}
   else if(p.k=='whip'){const e=Math.sin(Math.min(1,(p.t0-p.t)/(p.t0*.55))*Math.PI/2),Ln=p.L*e,wv=Math.sin((p.t0-p.t)*26),ca=Math.cos(p.a),sa=Math.sin(p.a),pts=[];for(let s=0;s<=14;s++){const u=s/14,d=Ln*u,amp=Math.max(0,1-u*.6)*T*.5*wv*(1-e*.5);pts.push([o.x-cx+ca*d-sa*amp,o.y-cy+sa*d+ca*amp])}
    for(const[c,wd]of[['#18391f',9],['#4cc06a',6],['#b8ffc0',2.4]]){g.strokeStyle=c;g.lineWidth=wd*(p.t<p.t0*.3?p.t/(p.t0*.3):1);g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()}
    g.fillStyle='#e8ffd8';for(let s=2;s<14;s+=3){const q=pts[s];g.beginPath();g.moveTo(q[0],q[1]-4);g.lineTo(q[0]+3,q[1]+2);g.lineTo(q[0]-3,q[1]+2);g.fill()}}
   else if(p.k=='chak'){g.save();g.translate(p.x-cx,p.y-cy);g.rotate(p.rot);g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,0,4,0,0,26);gr.addColorStop(0,'rgba(220,210,255,.55)');gr.addColorStop(1,'rgba(160,140,255,0)');g.fillStyle=gr;g.fillRect(-26,-26,52,52);g.globalCompositeOperation='source-over';
    g.fillStyle='#e8e2ff';g.strokeStyle='#3a2f6a';g.lineWidth=2;g.beginPath();g.arc(0,0,15,.35,Math.PI*2-.35);g.arc(5,0,11,Math.PI*2-.45,.45,true);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(-6,-6,2.5,0,6.3);g.fill();g.restore()}
   else if(p.k=='arrow'){const a=p.stuck?Math.atan2(p.vy,p.vx):Math.atan2(p.vy,p.vx);g.save();g.translate(p.x-cx,p.y-cy);g.rotate(a);g.globalAlpha=p.stuck?Math.min(1,p.stuck):1;g.strokeStyle='#27402f';g.lineWidth=4;g.beginPath();g.moveTo(-22,0);g.lineTo(8,0);g.stroke();g.strokeStyle='#d8fff0';g.lineWidth=1.6;g.stroke();g.fillStyle='#e8fff6';g.strokeStyle='#27402f';g.lineWidth=1.5;g.beginPath();g.moveTo(15,0);g.lineTo(6,-4);g.lineTo(6,4);g.closePath();g.fill();g.stroke();g.fillStyle='#7fe8b0';g.beginPath();g.moveTo(-22,0);g.lineTo(-27,-5);g.lineTo(-17,0);g.lineTo(-27,5);g.closePath();g.fill();g.restore()}
   else if(p.k=='flail'){const bx=p.x-cx,by=p.y-cy,hx=o.x-cx,hy=o.y-cy,n=10;g.strokeStyle='#2a2f3a';g.lineWidth=4;g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo((hx+bx)/2+Math.sin(t*20)*3,(hy+by)/2+Math.cos(t*20)*3,bx,by);g.stroke();g.strokeStyle='#aab4c8';g.lineWidth=2;g.setLineDash([5,4]);g.stroke();g.setLineDash([]);
    g.save();g.translate(bx,by);g.rotate(t*14);g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,0,2,0,0,26);gr.addColorStop(0,'rgba(255,240,150,.6)');gr.addColorStop(1,'rgba(255,200,60,0)');g.fillStyle=gr;g.fillRect(-26,-26,52,52);g.globalCompositeOperation='source-over';g.fillStyle='#59606e';g.strokeStyle='#14171d';g.lineWidth=2;for(let i=0;i<8;i++){g.save();g.rotate(i*Math.PI/4);g.beginPath();g.moveTo(10,-4);g.lineTo(19,0);g.lineTo(10,4);g.closePath();g.fill();g.stroke();g.restore()}g.beginPath();g.arc(0,0,11,0,6.3);g.fill();g.stroke();g.fillStyle='#ffe27a';g.beginPath();g.arc(-3,-3,3,0,6.3);g.fill();g.restore()}
   else if(p.k=='orb'){const x=p.x-cx,y=p.y-cy;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,2,x,y,28);gr.addColorStop(0,'#fff');gr.addColorStop(.3,'rgba(200,140,255,.9)');gr.addColorStop(1,'rgba(120,60,220,0)');g.fillStyle=gr;g.fillRect(x-28,y-28,56,56);g.strokeStyle='rgba(230,200,255,.8)';g.lineWidth=1.5;for(let i=0;i<3;i++){const a=t*5+i*2.1;g.beginPath();g.ellipse(x,y,17,6,a,0,6.3);g.stroke()}g.globalCompositeOperation='source-over'}
   else if(p.k=='shur'){g.save();g.translate(p.x-cx,p.y-cy);g.rotate(p.rot);g.globalCompositeOperation='lighter';g.fillStyle='rgba(150,240,255,.35)';g.beginPath();g.arc(0,0,16,0,6.3);g.fill();g.globalCompositeOperation='source-over';g.fillStyle='#e8fbff';g.strokeStyle='#1a4a5a';g.lineWidth=1.6;g.beginPath();for(let i=0;i<8;i++){const r=i%2?4:13,a=i*Math.PI/4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.restore()}
   else if(p.k=='quake'){const x=p.x-cx,y=p.gy-cy;g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(x,y-T*2,x,y);gr.addColorStop(0,'rgba(255,170,80,0)');gr.addColorStop(1,'rgba(255,200,120,.75)');g.fillStyle=gr;g.fillRect(x-T*.6,y-T*2,T*1.2,T*2);g.strokeStyle='rgba(255,230,170,.9)';g.lineWidth=3;g.beginPath();for(let i=0;i<7;i++){const xx=x-p.d*i*T*.35;g.lineTo(xx,y-2-((i*37)%5)*2)}g.stroke();g.globalCompositeOperation='source-over'}
   else if(p.k=='blast'){const k=1-p.t/p.t0,x=p.x-cx,y=p.y-cy;g.globalCompositeOperation='lighter';g.strokeStyle='rgba('+p.c+','+(1-k)+')';g.lineWidth=6*(1-k)+1;g.beginPath();g.arc(x,y,T*2.3*k,0,6.3);g.stroke();g.fillStyle='rgba('+p.c+','+(.35*(1-k))+')';g.beginPath();g.arc(x,y,T*2.3*k,0,6.3);g.fill();g.globalCompositeOperation='source-over'}}
  g.restore()}
 // ---- held models (origin at the hand, pointing +x, L ~ 44)
 const MODEL={
  skyspear(x,L){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#8a6a3a';x.fillRect(-L*.5,-2,L*1.5,4);x.strokeRect(-L*.5,-2,L*1.5,4);x.fillStyle='#f4fbff';x.beginPath();x.moveTo(L*1.45,0);x.lineTo(L*1.05,-7);x.lineTo(L*1.12,0);x.lineTo(L*1.05,7);x.closePath();x.fill();x.stroke();x.fillStyle='#9fd0ff';x.fillRect(L*.98,-4,3,8)},
  thornlash(x,L,t){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#6a4a2a';x.fillRect(-L*.2,-3,L*.4,6);x.strokeRect(-L*.2,-3,L*.4,6);x.strokeStyle='#3fae58';x.lineWidth=3;x.beginPath();x.moveTo(L*.2,0);x.bezierCurveTo(L*.5,-10+Math.sin(t*3)*3,L*.7,12,L*.95,-2);x.stroke();x.strokeStyle='#b8ffc0';x.lineWidth=1;x.stroke()},
  moonchakram(x,L,t){x.save();x.rotate(t*3);x.fillStyle='#e8e2ff';x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.arc(L*.35,0,12,.35,Math.PI*2-.35);x.arc(L*.35+5,0,8.5,Math.PI*2-.45,.45,true);x.closePath();x.fill();x.stroke();x.restore()},
  zephyrbow(x,L){x.strokeStyle='#000';x.lineWidth=5;x.beginPath();x.moveTo(L*.3,-L*.5);x.quadraticCurveTo(L*.75,0,L*.3,L*.5);x.stroke();x.strokeStyle='#7fe8b0';x.lineWidth=3;x.stroke();x.strokeStyle='#e8fff6';x.lineWidth=1;x.beginPath();x.moveTo(L*.3,-L*.5);x.lineTo(L*.1,0);x.lineTo(L*.3,L*.5);x.stroke()},
  stormflail(x,L,t){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#5a4a2a';x.fillRect(-L*.2,-3,L*.5,6);x.strokeRect(-L*.2,-3,L*.5,6);x.strokeStyle='#8a94a8';x.lineWidth=2;x.setLineDash([4,3]);x.beginPath();x.moveTo(L*.3,0);x.lineTo(L*.7,Math.sin(t*4)*3);x.stroke();x.setLineDash([]);x.fillStyle='#59606e';x.strokeStyle='#000';x.beginPath();x.arc(L*.82,Math.sin(t*4)*3,8,0,6.3);x.fill();x.stroke();x.fillStyle='#ffe27a';x.fillRect(L*.8,Math.sin(t*4)*3-3,3,3)},
  gravitystaff(x,L,t){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#3a2a5a';x.fillRect(-L*.3,-2.5,L*1.1,5);x.strokeRect(-L*.3,-2.5,L*1.1,5);x.globalCompositeOperation='lighter';const gr=x.createRadialGradient(L*.95,0,1,L*.95,0,16);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'rgba(200,140,255,.9)');gr.addColorStop(1,'rgba(120,60,220,0)');x.fillStyle=gr;x.fillRect(L*.95-16,-16,32,32);x.globalCompositeOperation='source-over'},
  galeshuriken(x,L,t){x.save();x.translate(L*.4,0);x.rotate(t*5);x.fillStyle='#e8fbff';x.strokeStyle='#000';x.lineWidth=1.6;x.beginPath();for(let i=0;i<8;i++){const r=i%2?4:11,a=i*Math.PI/4;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.stroke();x.restore()},
  titanmaul(x,L){x.strokeStyle='#000';x.lineWidth=2;x.fillStyle='#6a4a2a';x.fillRect(-L*.3,-3,L*1.1,6);x.strokeRect(-L*.3,-3,L*1.1,6);const hx=L*.7;x.fillStyle='#8a8f9c';x.beginPath();x.rect(hx,-17,L*.42,34);x.fill();x.stroke();x.fillStyle='#ff9a4a';x.fillRect(hx+4,-13,L*.42-8,26);x.strokeRect(hx+4,-13,L*.42-8,26);x.strokeStyle='#fff3c8';x.lineWidth=1;x.beginPath();x.moveTo(hx+L*.2,-10);x.lineTo(hx+L*.2,10);x.stroke()}};
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){if(NEW[id]&&MODEL[id]){x.save();x.lineJoin='round';x.lineCap='round';try{MODEL[id](x,L,t||0)}finally{x.restore()}return}_dw(x,id,L,t)}}
 {const _t=BOSS6.tick,_dp=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('WFX8',e)}};BOSS6.drawProj=function(gc,cx,cy){_dp.call(this,gc,cx,cy);try{draw(gc,cx,cy)}catch(e){console.error('WFX8d',e)}}}
 return{NEW,PR,BEH}})();
