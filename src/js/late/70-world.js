// ===== V6 world: 2.5D parallax sky, 12-state weather manager (smooth blends), color grading, bloom =====
const WX6=(()=>{
 const I={},ST=WX_STATES;for(const s of ST)I[s]=s=='clear'?1:0;
 const W8={clear:30,cloudy:14,fog:8,drizzle:8,rain:12,storm:6,snow:8,blizzard:3,windy:6,aurora:5,starfall:4,crystal:4};
 const hash=n=>{n=(n^61)^(n>>>16);n=(n+(n<<3))>>>0;n=Math.imul(n,0x27d4eb2d);n^=n>>>15;return n>>>0};
 const SLOT=75000;let cur='clear',acc=0,thunder=6,drops=[],flakes=[];
 function pick(slot){const seed=hash(slot*7919+(typeof ws=='number'?Math.floor(ws*10):0)),dayPos=((slot*SLOT)/1000%DAY)/DAY,nt=(1-Math.cos(6.2832*dayPos))/2;let tot=0;const w=ST.map(s=>{let v=W8[s];if(s=='aurora'||s=='starfall')v*=nt>.55?2.2:0;if(s=='crystal')v*=1;tot+=v;return v});let r=seed%Math.max(1,Math.round(tot*1000))/1000,i=0;for(;i<ST.length;i++){if(r<w[i])break;r-=w[i]}return ST[Math.min(i,ST.length-1)]}
 const api={I,get cur(){return cur},get acc(){return acc},
  rain:0,snow:0,fog:0,cloud:0,wind:0,aurora:0,star:0,crystal:0,
  update(dt){const on=cel.opt.wxOn;cur=on?pick(Math.floor(Date.now()/SLOT)):'clear';if(api.force)cur=api.force;const r=Math.min(1,dt*.14);for(const s of ST)I[s]+=((s==cur?1:0)-I[s])*r;
   api.rain=I.drizzle*.35+I.rain*.8+I.storm;api.snow=I.snow*.6+I.blizzard;api.fog=I.fog*.85+I.blizzard*.5+I.crystal*.35;api.cloud=Math.min(1,I.cloudy*.6+I.rain*.8+I.drizzle*.5+I.storm+I.snow*.6+I.blizzard+I.fog*.5);api.wind=I.windy+I.storm*.7+I.blizzard*1.2+I.rain*.3;api.aurora=I.aurora;api.star=I.starfall;api.crystal=I.crystal;
   acc=Math.max(0,Math.min(1,acc+(api.snow>.1?api.snow*dt*.012:-(.006+api.rain*.03)*dt)));
   // keep legacy variables in step (HUD chip, thunder, ambient, sky tint)
   const d=clock();night=(1-Math.cos(6.2832*d))/2;wxN=api.snow>.3?'snow':I.storm>.4?'storm':api.rain>.3?'rain':api.cloud>.3?'cloud':'clear';ptype=api.snow>.3?'snow':I.storm>.4?'storm':'rain';wxI=Math.max(api.rain,api.snow);wxC=api.cloud;
   if(I.storm>.5&&!QM.reduce){thunder-=dt;if(thunder<=0){thunder=rnd(7,14);flash=.4;try{makeBolt()}catch(_){}setTimeout(()=>{noise(1.6,260,.45);snd(60,1,'sine',.15,.5)},rnd(250,900))}}flash=Math.max(0,flash-dt);if(QM.reduce)flash=Math.min(flash,.08);
   try{ambUpdate()}catch(_){}},
  reset(){drops.length=0;flakes.length=0}};
 // ---------- precipitation + overlays (screen space, drawn after the world, before the lighting layer)
 api.draw=function(w,hh,now){const q=QM.cur.wx,t=now/1000,wind=api.wind*140+(I.windy?Math.sin(t*.5)*60:0);
  g.save();
  // world-space: snow caps on exposed surface blocks
  if(acc>.04&&entered){g.save();g.scale(ZM,ZM);const vw=w/ZM,x0=Math.max(0,cam.x/T|0),x1=Math.min(W-1,(cam.x+vw)/T|0);g.fillStyle='rgba(245,250,255,'+Math.min(.95,acc*1.4)+')';for(let x=x0;x<=x1;x++){const y=sh(x);if(tiles[y*W+x]&&!tiles[(y-1)*W+x]){const px=x*T-cam.x,py=y*T-cam.y,th=2+acc*7;g.beginPath();g.moveTo(px,py+1);g.quadraticCurveTo(px+T*.25,py-th,px+T*.5,py-th*.6);g.quadraticCurveTo(px+T*.78,py-th*1.1,px+T,py+1);g.closePath();g.fill()}}g.restore()}
  // rain
  if(api.rain>.02){const N=Math.round(220*q*api.rain);while(drops.length<N)drops.push({x:Math.random(),y:Math.random(),z:Math.random()});drops.length=Math.min(drops.length,Math.max(N,0));
   const sp=(900+api.rain*500)/hh;for(let L=0;L<3;L++){g.strokeStyle='rgba(190,215,255,'+(.22+L*.16)+')';g.lineWidth=.8+L*.6;g.beginPath();for(const d of drops){if(((d.z*3)|0)!=L)continue;d.y+=sp*(.7+L*.35)*(1/60);d.x+=wind/w*(.7+L*.35)*(1/60);if(d.y>1){d.y=-.05;d.x=Math.random()}if(d.x>1.05)d.x-=1.1;if(d.x<-.05)d.x+=1.1;const x=d.x*w,y=d.y*hh,len=10+L*7+api.rain*6;g.moveTo(x,y);g.lineTo(x-wind*.012*(1+L*.3),y-len)}g.stroke()}}else if(drops.length)drops.length=0;
  // snow
  if(api.snow>.02){const N=Math.round(160*q*api.snow);while(flakes.length<N)flakes.push({x:Math.random(),y:Math.random(),z:Math.random(),p:Math.random()*6});flakes.length=Math.min(flakes.length,Math.max(N,0));
   g.fillStyle='rgba(255,255,255,.85)';for(const f of flakes){f.y+=(.05+f.z*.1+api.snow*.04)*(1/60)*(hh>0?1:0);f.x+=(wind/w*.6+Math.sin(t*1.2+f.p)*.0004)*(1/60)*60;if(f.y>1){f.y=-.02;f.x=Math.random()}if(f.x>1.02)f.x-=1.04;if(f.x<-.02)f.x+=1.04;g.globalAlpha=.5+f.z*.5;g.beginPath();g.arc(f.x*w,f.y*hh,1+f.z*2.2,0,6.3);g.fill()}g.globalAlpha=1}else if(flakes.length)flakes.length=0;
  // fog / blizzard whiteout / crystal mist
  if(api.fog>.02){for(let i=0;i<3;i++){const gr=g.createLinearGradient(0,hh*(.3+i*.2),0,hh);const x=Math.sin(t*.05+i*2)*w*.1;g.globalAlpha=api.fog*(.22+i*.05);gr.addColorStop(0,'rgba(210,220,235,0)');gr.addColorStop(.6,'rgba('+(I.crystal>.3?'200,170,255':'210,222,238')+',.9)');gr.addColorStop(1,'rgba(220,230,240,.4)');g.fillStyle=gr;g.fillRect(x-40,hh*(.3+i*.2),w+80,hh)}g.globalAlpha=1}
  if(I.blizzard>.02){g.fillStyle='rgba(235,242,255,'+I.blizzard*.28+')';g.fillRect(0,0,w,hh)}
  if(I.crystal>.05&&Math.random()<.35*q&&entered)VFX.mote(cam.x+Math.random()*w/ZM,cam.y+Math.random()*hh/ZM,['#bfa8ff','#9fe0ff','#ffc8ff'][Math.random()*3|0]);
  g.restore()};
 return api})();
updWeather=function(dt){WX6.update(dt)};
drawPrecip=function(w,hh,now){WX6.draw(w,hh,now)};
const SKY6=(()=>{
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),rgb=(c,a)=>'rgba('+c.map(Math.round)+','+(a==null?1:a)+')';
 const hs=n=>{n=Math.imul(n^61,2246822519)>>>0;n^=n>>>13;n=Math.imul(n,3266489917)>>>0;return((n^n>>>16)>>>0)/4294967296};
 const stars=[];for(let i=0;i<140;i++)stars.push([hs(i*3+1),hs(i*3+2)*.7,hs(i*3+3)]);let meteors=[];
 function mountains(w,hh,off,k,base,amp,col,snowCap,seed,sx){g.fillStyle=col;g.beginPath();g.moveTo(0,hh);const step=18;let pts=[];for(let x=0;x<=w+step;x+=step){const wx=(x+off*k)/ (sx||1),y=base-(Math.abs(Math.sin(wx*.0042+seed))*.7+Math.abs(Math.sin(wx*.0097+seed*2))*.3)*amp;pts.push([x,y]);g.lineTo(x,y)}g.lineTo(w+step,hh);g.closePath();g.fill();
  if(snowCap){g.fillStyle=snowCap;g.beginPath();for(const[x,y]of pts){if(y<base-amp*.62){g.moveTo(x-step,y+amp*.07);g.lineTo(x,y);g.lineTo(x+step,y+amp*.07);g.closePath()}}g.fill()}}
 function island(x,y,s,col,topc,glow,t){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.beginPath();g.moveTo(-70,0);g.quadraticCurveTo(-60,34,-20,52+Math.sin(t)*2);g.quadraticCurveTo(0,86,18,50);g.quadraticCurveTo(58,32,70,0);g.closePath();g.fill();g.fillStyle=topc;g.beginPath();g.ellipse(0,0,72,12,0,0,6.3);g.fill();
  if(glow){g.fillStyle=glow;g.shadowColor=glow;g.shadowBlur=14;g.beginPath();g.moveTo(-18,-2);g.lineTo(-10,-30);g.lineTo(-2,-3);g.lineTo(6,-22);g.lineTo(14,-2);g.closePath();g.fill();g.shadowBlur=0}
  g.restore()}
 function ruins(x,y,s,col,glow){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.fillRect(-60,-6,120,8);for(const px of[-50,-20,26,52]){const h=px==26?44:px==-20?70:px==52?36:84;g.fillRect(px-5,-h,10,h)}g.beginPath();g.moveTo(-50,-84);g.quadraticCurveTo(-35,-110,-20,-70);g.lineTo(-25,-70);g.quadraticCurveTo(-35,-95,-45,-84);g.fill();if(glow){g.fillStyle=glow;g.shadowColor=glow;g.shadowBlur=12;g.beginPath();g.moveTo(80,0);g.lineTo(88,-50);g.lineTo(96,-10);g.lineTo(104,-36);g.lineTo(112,0);g.closePath();g.fill();g.shadowBlur=0}g.restore()}
 function draw(w,hh,now){const t=now/1000,d=clock(),tw=Math.max(0,1-Math.abs(night-.5)*4),cl=WX6.cloud,gry=[110,120,138],np=QM.cur.par,refY=sh(W/2|0)*T-hh*.5/ZM,dy=k=>Math.max(-400,Math.min(900,(cam.y-refY)*k*ZM)),cx=cam.x*ZM;
  let top=mix([74,163,255],[8,12,38],night),bot=mix([191,232,255],[36,30,84],night);top=mix(top,[255,140,90],tw*.45);bot=mix(bot,[255,196,120],tw*.6);top=mix(top,gry,cl*.55*(1-night*.6));bot=mix(bot,gry,cl*.5*(1-night*.6));if(WX6.I.storm)top=mix(top,[40,44,62],WX6.I.storm*.6);
  if(WX6.I.crystal>.05){top=mix(top,[70,40,120],WX6.I.crystal*.35*(1-night*.5));bot=mix(bot,[160,130,220],WX6.I.crystal*.4)}
  const gr=g.createLinearGradient(0,0,0,hh);gr.addColorStop(0,rgb(top));gr.addColorStop(1,rgb(bot));g.fillStyle=gr;g.fillRect(0,0,w,hh);
  // stars
  const sa=Math.min(1,Math.max(0,(night-.2)*1.7))*(1-cl*.8);if(sa>.02){g.fillStyle='#fff';for(const s of stars){g.globalAlpha=sa*(.4+.6*Math.abs(Math.sin(t*1.3+s[2]*30)));const sz=s[2]>.9?3:s[2]>.6?2:1.4;g.fillRect(((s[0]*w-cx*.02)%w+w)%w,s[1]*hh,sz,sz)}g.globalAlpha=1}
  // aurora ribbons
  if(WX6.aurora>.03){g.save();g.globalCompositeOperation='lighter';for(let b=0;b<3;b++){const base=hh*(.18+b*.07);const gr2=g.createLinearGradient(0,base-60,0,base+90);const c=[['rgba(80,255,170,','rgba(120,120,255,'],['rgba(120,255,220,','rgba(200,100,255,'],['rgba(60,220,255,','rgba(255,120,220,']][b];gr2.addColorStop(0,c[0]+'0)');gr2.addColorStop(.4,c[0]+(.9*WX6.aurora)+')');gr2.addColorStop(1,c[1]+'0)');g.fillStyle=gr2;g.beginPath();g.moveTo(0,base+90);for(let x=0;x<=w;x+=24){g.lineTo(x,base+Math.sin(x*.004+t*.35+b*1.7)*34+Math.sin(x*.011-t*.5+b)*14)}g.lineTo(w,base+90);g.closePath();g.fill()}g.restore()}
  // meteors
  if(WX6.star>.05){if(Math.random()<WX6.star*.05)meteors.push({x:Math.random()*w,y:Math.random()*hh*.35,l:1,v:rnd(500,900)});g.save();g.globalCompositeOperation='lighter';for(let i=meteors.length-1;i>=0;i--){const m=meteors[i];m.l-=.016;m.x+=m.v*.016*.7;m.y+=m.v*.016*.5;if(m.l<=0){meteors.splice(i,1);continue}const gr3=g.createLinearGradient(m.x,m.y,m.x-m.v*.1,m.y-m.v*.07);gr3.addColorStop(0,'rgba(255,255,255,'+m.l+')');gr3.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr3;g.lineWidth=2;g.beginPath();g.moveTo(m.x,m.y);g.lineTo(m.x-m.v*.1,m.y-m.v*.07);g.stroke()}g.restore()}
  // sun / moon
  const a=6.2832*d,sx=w/2+Math.sin(a)*w*.42,sy=hh*.62-Math.cos(a)*hh*.5,mxp=w-sx,myp=hh*1.24-sy;
  if(sy<hh*.9){g.globalCompositeOperation='lighter';const sg=g.createRadialGradient(sx,sy,10,sx,sy,170);sg.addColorStop(0,'rgba(255,230,160,'+.7*(1-cl*.7)+')');sg.addColorStop(1,'rgba(255,200,100,0)');g.fillStyle=sg;g.fillRect(sx-170,sy-170,340,340);g.globalCompositeOperation='source-over';g.globalAlpha=1-cl*.6;g.fillStyle='#fff3c4';g.beginPath();g.arc(sx,sy,26,0,6.3);g.fill();g.globalAlpha=1}
  if(myp<hh*.9){g.globalAlpha=1-cl*.7;g.globalCompositeOperation='lighter';const mg=g.createRadialGradient(mxp,myp,8,mxp,myp,90);mg.addColorStop(0,'rgba(170,190,255,.45)');mg.addColorStop(1,'rgba(120,140,255,0)');g.fillStyle=mg;g.fillRect(mxp-90,myp-90,180,180);g.globalCompositeOperation='source-over';g.fillStyle='#e9eeff';g.beginPath();g.arc(mxp,myp,22,0,6.3);g.fill();g.fillStyle='rgba(150,160,200,.5)';for(const[ox,oy,r]of[[-7,-5,5],[6,4,4],[-2,9,3]]){g.beginPath();g.arc(mxp+ox,myp+oy,r,0,6.3);g.fill()}g.globalAlpha=1}
  // god rays (Ultra / Cinematic daytime)
  if(QM.cur.bloom>=2&&sy<hh*.7&&cl<.5){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const ang=1.1+i*.1+Math.sin(t*.1+i)*.03;g.fillStyle='rgba(255,236,180,'+(.05*(1-cl*2)*(1-night))+')';g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(ang)*hh*1.4-70,sy+Math.sin(ang)*hh*1.4);g.lineTo(sx+Math.cos(ang)*hh*1.4+70,sy+Math.sin(ang)*hh*1.4);g.closePath();g.fill()}g.restore()}
  const nm=night*.85,haze=(c)=>rgb(mix(mix(c,gry,cl*.35),[16,22,48],nm),1);
  // parallax layers: far mountains -> floating islands -> ruins/crystals -> hills -> mist
  const horizon=hh*.66;
  mountains(w,hh,cx,.03,horizon-hh*.04+dy(.02),hh*.34,haze([128,148,190]),rgb(mix([240,248,255],[120,130,180],nm),.9),1.3);
  if(np>=2)for(let i=-1;i<5;i++){const wx=((i*520+hs(i+9)*200)-cx*.06),x=((wx%(w+600))+w+600)%(w+600)-300,y=hh*(.22+hs(i+3)*.2)+Math.sin(t*.5+i)*5+dy(.05),s=.7+hs(i+5)*.5;island(x,y,s,haze([84,78,96]),haze([92,150,96]),nm>.4?'rgb(150,220,255)':null,t+i)}
  mountains(w,hh,cx,.06,horizon+hh*.0+dy(.04),hh*.22,haze([98,128,150]),null,4.1);
  if(np>=3)for(let i=-1;i<4;i++){const wx=(i*700+hs(i+21)*300)-cx*.11,x=((wx%(w+800))+w+800)%(w+800)-400,y=horizon+hh*.07+dy(.07);ruins(x,y,.8+hs(i)*.4,haze([70,84,104]),nm>.35||WX6.I.crystal>.2?'rgb(160,120,255)':'rgba(120,200,255,.0)')}
  for(let l=0;l<3;l++){const k=.09+l*.07,base=hh*(.7+l*.08)+dy(.1+l*.05),col=mix([[110,170,120],[80,140,100],[56,110,84]][l],[16,22,48],night*.85);g.fillStyle='rgba('+mix(col,gry,cl*.35).map(Math.round)+','+(.55+l*.2)+')';g.beginPath();g.moveTo(0,hh);for(let x=0;x<=w;x+=24)g.lineTo(x,base-Math.sin((x+cx*k)*.006*(l+1)+l)*50-Math.sin((x+cx*k)*.015)*14);g.lineTo(w,hh);g.fill()}
  if(np>=4){g.globalAlpha=.55*(1-night*.5);const mg=g.createLinearGradient(0,horizon-20,0,horizon+hh*.25);mg.addColorStop(0,'rgba(255,255,255,0)');mg.addColorStop(.5,'rgba('+(night>.5?'120,110,190':'230,240,255')+',.45)');mg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=mg;g.fillRect(0,horizon-20,w,hh*.3);g.globalAlpha=1}
  // clouds
  const cc=4+Math.round(cl*5);for(let i=0;i<cc;i++){const sp=8+i*3+WX6.wind*18,x=((i*311+now*.001*sp-cx*.08)%(w+500)+w+500)%(w+500)-250,y=hh*.1+((i*97)%140)+dy(.03),s=.8+((i*53)%10)/12;g.fillStyle='rgba('+mix([255,255,255],[120,126,148],cl*.8+night*.4).map(Math.round)+','+(.4+cl*.4)+')';for(const[ox,oy,r]of[[0,0,30],[30,6,24],[-30,8,22],[8,-14,24]]){g.beginPath();g.arc(x+ox*s,y+oy*s,r*s,0,6.3);g.fill()}}}
 return{draw}})();
drawSky=function(w,hh,now){SKY6.draw(w,hh,now)};
// ---------- post: color grade, vignette, bloom, cinematic bars (run after legacy draw + VFX)
const POST6=(()=>{const bc=document.createElement('canvas'),bx=bc.getContext('2d'),b2=document.createElement('canvas'),b2x=b2.getContext('2d'),can=('filter'in bx);let bars=0,bf=0;   // bf: the blurred bloom buffer is refreshed every 2nd frame (copying the frame stalls the GPU)
 return{run(w,hh){const q=QM.cur;
  if(q.grade&&entered){const d=clock(),tw=Math.max(0,1-Math.abs(night-.5)*4);g.save();g.globalCompositeOperation='soft-light';const tint=night>.5?[40,50,140]:tw>.3?[255,150,90]:[255,245,220],a=q.grade==2?.34:.2;g.globalAlpha=a*(night>.5?night:tw>.3?tw:.3);g.fillStyle='rgb('+tint+')';g.fillRect(0,0,w,hh);if(WX6.cloud>.3){g.globalAlpha=.18*WX6.cloud;g.fillStyle='rgb(120,130,150)';g.fillRect(0,0,w,hh)}g.restore();
   const vg=g.createRadialGradient(w/2,hh/2,hh*.45,w/2,hh/2,hh*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(6,4,16,'+(q.grade==2?.5:.3)+')');g.fillStyle=vg;g.fillRect(0,0,w,hh)}
  if(q.bloom&&cel.opt.bloom&&ZM>=.7&&can&&entered){const bw=w>>2,bh=hh>>2;let fresh=false;if(bc.width!=bw||bc.height!=bh){bc.width=b2.width=bw;bc.height=b2.height=bh;fresh=true}if(fresh||(bf++&1)==0){bx.globalCompositeOperation='copy';bx.drawImage(cv,0,0,bw,bh);b2x.filter='brightness(.8) contrast(2.6) saturate(1.3) blur('+(q.bloom==2?5:3)+'px)';b2x.globalCompositeOperation='copy';b2x.drawImage(bc,0,0);b2x.filter='none'}g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(q.bloom==2?.38:.22)*(QM.reduce?.6:1);g.drawImage(b2,0,0,w,hh);g.restore()}
  const tb=q.cine&&cel.opt.cine!==0?1:0;bars+=(tb-bars)*.08;if(bars>.01){const bh2=hh*.07*bars;g.fillStyle='#000';g.fillRect(0,0,w,bh2);g.fillRect(0,hh-bh2,w,bh2)}}}})();
