// ===== LIFE8: a livelier, calmer world. Grass blades and little flowers sway in the wind and lean away as you walk through them,
// butterflies flutter over flowers on clear days (and flee when you come close), fish jump in lakes, fireflies drift near the ground
// at night (drawn after the lighting so they glow). The cursor highlight tells you whether the held item can break the block.
// Everything is pooled, capped and drawn from pre-rendered sprites (no per-particle gradients). =====
const LIFE8=(()=>{
 const R=Math.random,cl01=v=>v<0?0:v>1?1:v;
 const hs=(a,b)=>{let n=Math.imul(a*73856093^b*19349663,2246822519)>>>0;n^=n>>>13;n=Math.imul(n,3266489917)>>>0;return((n^n>>>16)>>>0)/4294967296};
 const FLW=['#ffd1e8','#fff1a0','#cdbdff','#ffffff','#ffb8a4','#a8e4ff'];
 const bf=[],fish=[],rip=[],ff=[],dust=[];let fishT=3,flowers=[],tops=0;
 const day=()=>night<.42,clearSky=()=>WX6.rain<.08&&WX6.snow<.08&&WX6.fog<.4;
 const surfY=tx=>{try{return sh(Math.max(0,Math.min(W-1,tx)))*T}catch(_){return 0}};
 // ---- grass + flowers on exposed grass tops in view (world space, before lighting). Pre-rendered atlas: 3 tuft variants x 13 lean
 // frames and 6 flower colours, so a whole meadow is a handful of batched drawImage calls (stroking hundreds of curves was GPU-heavy).
 const NL=13,GW=48,GH=22;let atlas=null,fatlas=null;
 function mkAtlas(){atlas=document.createElement('canvas');atlas.width=GW*NL;atlas.height=GH*3;const x=atlas.getContext('2d');x.lineCap='round';x.lineWidth=1.6;
  for(let v=0;v<3;v++)for(let l=0;l<NL;l++){const ox=l*GW,oy=v*GH,lean=(l-(NL-1)/2)*1.1;for(const pass of[0,1]){x.strokeStyle=pass?'rgba(150,214,98,.95)':'rgba(84,150,66,.9)';x.beginPath();
   for(let i=pass;i<6;i+=2){const h=hs(v*7+i,13),bx=ox+4+i*7.4+h*3,ht=5+h*8,sw=lean*(.7+h*.6);x.moveTo(bx,oy+GH-1);x.quadraticCurveTo(bx+sw*.3,oy+GH-1-ht*.6,bx+sw,oy+GH-1-ht)}x.stroke()}}
  fatlas=document.createElement('canvas');fatlas.width=16*FLW.length;fatlas.height=34;const y=fatlas.getContext('2d');
  FLW.forEach((c,i)=>{const cx=i*16+8;y.strokeStyle='#5d9a4a';y.lineWidth=1.3;y.beginPath();y.moveTo(cx,33);y.quadraticCurveTo(cx+1,20,cx,6);y.stroke();y.fillStyle=c;for(let j=0;j<5;j++){const a=j*1.2566;y.beginPath();y.arc(cx+Math.cos(a)*2.5,6+Math.sin(a)*2.5,2,0,6.3);y.fill()}y.fillStyle='#ffc94a';y.beginPath();y.arc(cx,6,1.4,0,6.3);y.fill()})}
 function flora(x0,x1,y0,y1,t){if(!atlas)mkAtlas();const wind=1.2+WX6.wind*3;flowers.length=0;tops=0;let nf=0;/* flower records are pooled (no new arrays every frame) */
  const push=(bx,by)=>{const dx=bx-P.x,dy=Math.abs(P.y+P.h-by);if(dy>26||Math.abs(dx)>44)return 0;return Math.sign(dx||1)*(1-Math.abs(dx)/44)*(4+Math.min(3,Math.abs(P.vx)/80))};
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const k=y*W+x;if(tiles[k]!=2||tiles[k-W]||wl[k-W])continue;tops++;
   const lean=Math.sin(t*1.5+x*.6)*wind*.5+push(x*T+T/2,y*T),l=Math.max(0,Math.min(NL-1,Math.round(lean+(NL-1)/2))),v=(x*7+y)%3;
   g.drawImage(atlas,l*GW,v*GH,GW,GH,x*T-cam.x,y*T-cam.y-GH+2,GW,GH);
   const h=hs(x,y*3+1);if(h<.2){const f=FPOOL[nf]||(FPOOL[nf]=[0,0,0,0]);nf++;f[0]=x*T+10+h*120%28;f[1]=y*T;f[2]=(h*997|0)%FLW.length;f[3]=h;flowers.push(f)}}
  // flowers: one sprite each, rotated around the stem base as they sway / get brushed aside
  for(const f of flowers){const[fx,fy,ci,h]=f,a=(Math.sin(t*1.2+fx*.05)*wind*.05+push(fx,fy)*.07),s=.7+h*1.5,c=Math.cos(a),sn=Math.sin(a);g.setTransform(c*ZM*s,sn*ZM*s,-sn*ZM*s,c*ZM*s,(fx-cam.x)*ZM+ox0,(fy-cam.y+1)*ZM+oy0);g.drawImage(fatlas,ci*16,0,16,34,-8,-33,16,34)}
  g.setTransform(ZM,0,0,ZM,ox0,oy0)}
 let ox0=0,oy0=0;const FPOOL=[];
 // ---- butterflies: up to 3, near flowers, day + clear sky; they scatter when you come close
 function butterflies(dt,t,vw,vh){const want=day()&&clearSky()&&flowers.length&&!QM.reduce?Math.min(3,1+(flowers.length>>2)):0;
  if(bf.length<want&&R()<dt*.6){const f=flowers[R()*flowers.length|0];bf.push({x:f[0]+(R()-.5)*60,y:f[1]-30-R()*30,hx:f[0],hy:f[1]-22,p:R()*6.3,c:['#ffe27a','#ffb3d9','#bfe3ff','#fff'][R()*4|0],fl:0,a:0})}
  for(let i=bf.length-1;i>=0;i--){const b=bf[i];b.p+=dt;const d=Math.hypot(b.x-P.x,b.y-(P.y+P.h*.5));if(d<85&&!b.fl){b.fl=2.5;b.vx=Math.sign(b.x-P.x||1)*90;b.vy=-70}
   if(b.fl>0){b.fl-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt+Math.sin(b.p*9)*20*dt;b.vx*=1-dt*.4;if(b.fl<=0){if(flowers.length){const f=flowers[R()*flowers.length|0];b.hx=f[0];b.hy=f[1]-22}b.fl=0}}
   else{b.x+=((b.hx+Math.sin(b.p*.9)*26)-b.x)*dt*1.4;b.y+=((b.hy+Math.sin(b.p*1.7)*12-8)-b.y)*dt*1.4}
   b.a=Math.min(1,b.a+dt*2)*(want?1:.98);const sx=b.x-cam.x,sy=b.y-cam.y;if(sx<-200||sx>vw+200||sy<-200||sy>vh+200||(!want&&R()<dt*.5)){bf.splice(i,1);continue}
   const fl=Math.abs(Math.sin(b.p*15)),dir=Math.cos(b.p*.9)>0?1:-1;g.globalAlpha=b.a;g.fillStyle=b.c;
   for(const s of[-1,1]){g.beginPath();g.ellipse(sx+s*3.2*fl,sy-1,3.6*fl+.5,3,s*.4,0,6.3);g.fill();g.beginPath();g.ellipse(sx+s*2.4*fl,sy+2.4,2.4*fl+.4,2,-s*.3,0,6.3);g.fill()}
   g.fillStyle='#3a2a2a';g.fillRect(sx-.6,sy-2.5,1.2,6);g.globalAlpha=1}}
 // ---- fish jumping in lakes now and then (silver minnows, orange koi)
 function fishes(dt,vw,vh,x0,x1,y0,y1){fishT-=dt;if(fishT<=0){fishT=3+R()*6;if(!QM.reduce)for(let n=0;n<14;n++){const x=x0+(R()*(x1-x0+1)|0);for(let y=y0;y<=y1;y++){const k=y*W+x;if(wl[k]>0&&!tiles[k]&&!wl[k-W]&&!tiles[k-W]&&wl[k+W]>0&&wl[k+2*W]>0){const sy=(y+1)*T-wl[k]/8*T;fish.push({x:x*T+T/2,y:sy,s:sy,vx:(R()<.5?-1:1)*(40+R()*40),vy:-(240+R()*90),c:R()<.3?'#ff9a4a':'#a8c8e0',up:1});n=99;break}}}}
  for(let i=fish.length-1;i>=0;i--){const f=fish[i];f.vy+=760*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.up&&f.vy>0)f.up=0;
   if(!f.up&&f.y>f.s){rip.push({x:f.x,y:f.s,a:0});for(let j=0;j<5;j++)try{VFX.add(0,'#dff2ff',f.x,f.s-2,(R()-.5)*120,-60-R()*110,.45,6,2,{g:600,a:.8})}catch(_){}try{SFX7.plip()}catch(_){}fish.splice(i,1);continue}
   if(f.up&&f.vy>-200&&!f.sp){f.sp=1;rip.push({x:f.x,y:f.s,a:0})}
   const sx=f.x-cam.x,sy=f.y-cam.y,a=Math.atan2(f.vy,f.vx);g.save();g.translate(sx,sy);g.rotate(a);g.fillStyle=f.c;g.beginPath();g.ellipse(0,0,8,3.6,0,0,6.3);g.fill();g.beginPath();g.moveTo(-6,0);g.lineTo(-12,-4);g.lineTo(-12,4);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-3,-2.4,7,1.2);g.fillStyle='#123';g.fillRect(4,-1.5,1.5,1.5);g.restore()}
  if(rip.length){g.strokeStyle='rgba(225,242,255,.7)';g.lineWidth=1.2;for(let i=rip.length-1;i>=0;i--){const r=rip[i];r.a+=dt*1.4;if(r.a>=1){rip.splice(i,1);continue}g.globalAlpha=1-r.a;for(const m of[1,.55]){g.beginPath();g.ellipse(r.x-cam.x,r.y-cam.y,(4+r.a*18)*m,(1.2+r.a*4)*m,0,0,6.3);g.stroke()}}g.globalAlpha=1}}
 // ---- fireflies (night, near the ground, gently avoiding you) - updated here, drawn after the lighting layer
 function fireflies(dt,t,vw,vh){const on=night>.55&&WX6.rain<.3&&WX6.snow<.3&&!QM.reduce,want=on?Math.round(16*Math.min(1,QM.cur.wx||1)):0;let deep=false;try{deep=depthAt(P.x,P.y)>6}catch(_){}
  while(ff.length<want&&!deep){const x=cam.x+R()*vw,s=surfY(Math.floor(x/T));if(s<cam.y-40||s>cam.y+vh+40){if(R()<.7)break}ff.push({x,y:s-T*(.4+R()*2.6),p:R()*6.3,v:.5+R()*.8,a:0});if(ff.length>=want)break}
  for(let i=ff.length-1;i>=0;i--){const f=ff[i];f.p+=dt*f.v;f.x+=Math.sin(f.p*1.1)*18*dt;f.y+=Math.cos(f.p*.8)*10*dt;const dx=f.x-P.x,dy=f.y-(P.y+P.h*.5),d=Math.hypot(dx,dy);if(d<60){f.x+=dx/d*40*dt;f.y+=dy/d*40*dt}
   f.a=Math.min(1,f.a+dt*.5);if(!on||deep)f.a-=dt*1.5;const sx=f.x-cam.x;if(f.a<0||sx<-120||sx>vw+120)ff.splice(i,1)}}
 function drawGlow(g2){if(!ff.length)return;const im=WXS8.firefly,t=performance.now()/1000;g2.save();g2.globalCompositeOperation='lighter';for(const f of ff){const b=Math.max(0,Math.sin(t*2.1*f.v+f.p*3)),a=f.a*(.25+.75*b*b);if(a<.03)continue;g2.globalAlpha=a;const s=16+b*8;g2.drawImage(im,f.x-cam.x-s/2,f.y-cam.y-s/2,s,s)}g2.restore()}
 // ---- ambient motes: faint pollen near the ground by day, dim blue motes in caves (sprite based)
 function motes(dt,t,vw,vh){let cave=false;try{cave=depthAt(P.x,P.y)>10}catch(_){}const n=OPT.q<.3?0:cave?18:day()&&clearSky()?10:0;while(dust.length<n)dust.push({x:R(),y:R(),p:R()*6.3,s:.4+R()*.6});if(dust.length>n)dust.length=n;if(!n)return;
  const im=WXS8.flake;g.save();g.globalCompositeOperation='lighter';
  for(const a of dust){a.x+=(Math.sin(t*.4*a.s+a.p)*8+(cave?0:9)*a.s)*dt/vw;a.y+=(Math.cos(t*.5*a.s+a.p*1.7)*6-(cave?3:0))*dt/vh;if(a.x>1.05)a.x=-.05;if(a.x<-.05)a.x=1.05;if(a.y>1.05)a.y=-.05;if(a.y<-.05)a.y=1.05;
   const px=a.x*vw,py=a.y*vh;if(!cave){const s=surfY(Math.floor((px+cam.x)/T))-cam.y;if(py>s+4||py<s-T*3)continue}
   g.globalAlpha=cave?.16+.12*Math.sin(t*1.3+a.p):.22*a.s;const s=cave?7:5;g.drawImage(im,px-s/2,py-s/2,s,s)}g.restore()}
 drawAmbient=function(vw,vh,now,dt){const t=now/1000;if(!entered)return;const x0=Math.max(1,cam.x/T|0),x1=Math.min(W-2,(cam.x+vw)/T|0),y0=Math.max(1,cam.y/T|0),y1=Math.min(H-3,(cam.y+vh)/T|0);
  try{const m=g.getTransform();ox0=m.e;oy0=m.f;if(OPT.q>=.3&&ZM>=.6)flora(x0,x1,y0,y1,t);else flowers.length=0;butterflies(dt,t,vw,vh);fishes(dt,vw,vh,x0,x1,y0,y1);fireflies(dt,t,vw,vh);motes(dt,t,vw,vh)}catch(e){if(!LIFE8.err){LIFE8.err=1;console.error('LIFE8',e)}}
  g.save();for(let i=pops2.length-1;i>=0;i--){const q=pops2[i],a=(now-q.t)/450;if(a<0)continue;if(a>=1){pops2.splice(i,1);continue}const px=q.x-cam.x,py=q.y-cam.y,r=3+a*7;g.strokeStyle='rgba(255,255,255,'+(1-a)+')';g.lineWidth=1.5;g.beginPath();g.moveTo(px-r,py);g.lineTo(px+r,py);g.moveTo(px,py-r);g.lineTo(px,py+r);g.stroke()}g.restore()};
 {const _dp=BOSS6.drawProj;BOSS6.drawProj=function(g2,cx,cy){_dp.apply(this,arguments);try{drawGlow(g2)}catch(_){}}}
 // ---- cursor highlight: green = the held tool breaks it quickly, amber = slow (another tool is better), cool grey = weapons can't dig
 drawTarget=function(now){if(menuEl.style.display!='none'||typeof mx=='undefined'||showInv)return;const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);if(tx<1||ty<1||tx>=W-1||ty>=H-1)return;
  const k=ty*W+tx,px=tx*T-cam.x,py=ty*T-cam.y,inR=Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH,it=bar[sel],pl=.5+.5*Math.sin(now/260);
  g.save();if(!inR){g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=1.5;g.setLineDash([4,5]);g.strokeRect(px+1,py+1,T-2,T-2);g.restore();return}
  const tk=pickTree(mx+cam.x,my+cam.y);
  if(tk>=0&&!tiles[k]){const t=trees.get(tk),bx=(tk%W)*T+T/2-cam.x,by=(tk/W|0)*T+T-cam.y,ready=t&&prog(t)>=1;g.strokeStyle=ready?'rgba(190,255,150,'+(.55+.3*pl)+')':'rgba(255,255,255,.4)';g.lineWidth=2;g.beginPath();g.ellipse(bx,by-2,T*.62,T*.18,0,0,6.3);g.stroke();g.restore();return}
  if(it&&it<100&&!tiles[k]&&!trees.has(k)&&cnt(it)>0){g.globalAlpha=.3+.1*pl;g.fillStyle=BLK[it][1];g.fillRect(px+2,py+2,T-4,T-4);g.globalAlpha=1;g.strokeStyle='rgba(255,255,255,'+(.5+.3*pl)+')';g.lineWidth=2;g.strokeRect(px+1,py+1,T-2,T-2)}
  else if(tiles[k]&&tiles[k]!=4){const b=tiles[k],w=WPN[wp]||{};let col='205,215,235',m=0;
   if(w.k=='tool'&&w.tool!='rod'){const good=TOOLS8.fits(w.tool,TOOLS8.catOf(b));col=good?'150,255,170':'255,210,120';m=good?2:1}else if(b==70&&w.k=='fist'){col='140,220,255';m=2}
   if(m){g.fillStyle='rgba('+col+','+(m==2?.12+.08*pl:.07)+')';g.fillRect(px+2,py+2,T-4,T-4)}
   const L=m?12:9;g.strokeStyle='rgba('+col+','+(m?.7+.3*pl:.62)+')';g.lineWidth=m?3:2;if(!m){g.setLineDash([3,3])}g.lineCap='square';for(const[cx2,cy2,dx,dy]of[[px,py,1,1],[px+T,py,-1,1],[px,py+T,1,-1],[px+T,py+T,-1,-1]]){g.beginPath();g.moveTo(cx2+dx*L,cy2);g.lineTo(cx2,cy2);g.lineTo(cx2,cy2+dy*L);g.stroke()}
   const mh=(BLK[b]||[0,0,1])[2];if(hp[k]<mh&&hp[k]>0){const r=1-hp[k]/mh;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(px+6,py+T-9,T-12,5);g.fillStyle='#ffd24a';g.fillRect(px+7,py+T-8,(T-14)*r,3)}}
  g.restore()};
 // warm up the cloud sprites in idle time so the first cloudy sky never hitches
 {const jobs=[];for(const p of['day','storm','dusk'])for(const[k,n]of[['cu',6],['st',2],['ci',2]])for(let i=0;i<n;i++)jobs.push(()=>WXS8.cloud(k,i,p));jobs.push(()=>WXS8.strip('day'),()=>WXS8.strip('storm'),()=>WXS8.fog,()=>WXS8.drops,()=>WXS8.flake,()=>WXS8.firefly,()=>WXS8.ray,()=>WXS8.sun);
  const ric=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>8}),60));const run=d=>{while(jobs.length&&d.timeRemaining()>4)try{jobs.shift()()}catch(_){}if(jobs.length)ric(run)};ric(run)}
 return{get counts(){return{butterflies:bf.length,fish:fish.length,fireflies:ff.length,flowers:flowers.length,grass:tops}}}})();
