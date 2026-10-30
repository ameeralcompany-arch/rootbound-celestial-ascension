// ===== V6 world: 2.5D parallax sky, 12-state weather manager (smooth blends), color grading, bloom =====
// v8 "calm skies": soft volumetric clouds (pre-rendered sprites in day / storm / dusk light) drift in three depth layers, gentle sun
// rays, distant bird flocks on clear days, an overcast deck for rain and snow. The sky itself is painted into the SKYC7 cache (48 Hz),
// so everything in it moves slowly. Fast weather (rain in 3 depth layers + splash ripples + wet sheen, swaying snow, rolling fog banks,
// tumbling leaves, meteors) is drawn every frame outside that cache with the real frame time, from pooled arrays and pre-rendered
// sprites: no per-frame gradients, no shadowBlur, capped counts.
const WXS8=(()=>{ // shared pre-rendered weather sprites (built lazily, once)
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const rng=s=>()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
 const puff=(x,px,py,r,a,c)=>{c=c||'255,255,255';const g2=x.createRadialGradient(px,py,0,px,py,r);g2.addColorStop(0,'rgba('+c+','+a+')');g2.addColorStop(.7,'rgba('+c+','+a*.94+')');g2.addColorStop(.88,'rgba('+c+','+a*.55+')');g2.addColorStop(1,'rgba('+c+',0)');x.fillStyle=g2;x.fillRect(px-r,py-r,r*2,r*2)};
 // light: [top highlight, underside shade, overall tint] per palette
 // [top highlight, underside shade, overall tint, self-shadow rgb] per palette
 const PAL={day:['rgba(255,255,255,0)','rgba(146,162,198,.7)',null,'150,168,206'],storm:['rgba(186,192,208,.4)','rgba(52,56,74,.82)','rgba(112,118,138,.78)','70,76,96'],dusk:['rgba(255,226,160,.6)','rgba(188,104,140,.66)','rgba(255,190,160,.28)','214,128,150']};
 function shade(x,w,h,pal,pf){const P=PAL[pal];x.globalCompositeOperation='source-atop';if(P[2]){x.fillStyle=P[2];x.fillRect(0,0,w,h)}
  if(pf)for(const[px,py,r]of pf)puff(x,px+r*.12,py+r*.55,r*.78,.32,P[3]);// soft self-shadow under every bump = volume
  const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,P[0]);gr.addColorStop(.45,'rgba(255,255,255,0)');gr.addColorStop(1,P[1]);x.fillStyle=gr;x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over'}
 function cloud(kind,seed,pal){const R=rng(seed*7919+13);let c,x;
  let pf=null;if(kind=='cu'){c=mk(340,170);x=c.getContext('2d');const W=340,H=170,n=7+(R()*4|0);pf=[];
   for(let i=0;i<n;i++){const u=i/(n-1),dome=Math.sin(u*Math.PI),r=H*(.17+.2*dome+R()*.08),px=W*(.15+.7*u)+(R()-.5)*18,py=H*.74-r*.5-dome*H*.16;pf.push([px,py,r])}
   for(let i=0;i<4;i++){const px=W*(.32+R()*.36),r=H*(.16+R()*.12),py=H*(.3+R()*.14);pf.push([px,py,r])}
   pf.sort((a,b)=>a[1]-b[1]);for(const[px,py,r]of pf)puff(x,px,py,r,1);for(let i=0;i<6;i++){const px=W*(.12+R()*.76);puff(x,px,H*.8,H*.1,.8)}}
  else if(kind=='st'){c=mk(520,120);x=c.getContext('2d');const W=520,H=120;for(let i=0;i<18;i++){const u=R(),r=H*(.16+R()*.2);puff(x,W*(.08+u*.84),H*(.58+(R()-.5)*.22),r,.55)}}
  else{c=mk(440,80);x=c.getContext('2d');const W=440,H=80;x.save();x.translate(0,H/2);for(let i=0;i<9;i++){const px=W*(.1+R()*.8),py=(R()-.5)*H*.4,rx=W*(.1+R()*.16),ry=H*(.06+R()*.08);x.save();x.translate(px,py);x.rotate((R()-.5)*.25);x.scale(1,ry/rx);puff(x,0,0,rx,.42);x.restore()}x.restore()}
  shade(x,c.width,c.height,pal,pf);return c}
 const cache={};
 const get=(kind,i,pal)=>{const k=kind+i+pal;return cache[k]||(cache[k]=cloud(kind,i+(kind=='st'?40:kind=='ci'?80:0),pal))};
 function strip(pal){const W=1024,H=240,c=mk(W,H),x=c.getContext('2d'),R=rng(pal=='day'?5:9);
  for(let i=0;i<70;i++){const px=R()*W,py=H*(.15+R()*.55),r=40+R()*70;for(const o of[-W,0,W])if(px+o+r>0&&px+o-r<W)puff(x,px+o,py,r,.6)}
  x.globalCompositeOperation='destination-in';const f=x.createLinearGradient(0,0,0,H);f.addColorStop(0,'rgba(0,0,0,1)');f.addColorStop(.7,'rgba(0,0,0,.9)');f.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=f;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';shade(x,W,H,pal);return c}
 function glow(sz,stops){const c=mk(sz,sz),x=c.getContext('2d'),g2=x.createRadialGradient(sz/2,sz/2,0,sz/2,sz/2,sz/2);for(const s of stops)g2.addColorStop(s[0],s[1]);x.fillStyle=g2;x.fillRect(0,0,sz,sz);return c}
 function ray(){const c=mk(96,1024),x=c.getContext('2d'),h=x.createLinearGradient(0,0,96,0);h.addColorStop(0,'rgba(255,240,200,0)');h.addColorStop(.5,'rgba(255,240,200,1)');h.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=h;x.fillRect(0,0,96,1024);
  x.globalCompositeOperation='destination-in';const v=x.createLinearGradient(0,0,0,1024);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.08,'rgba(0,0,0,1)');v.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=v;x.fillRect(0,0,96,1024);return c}
 function drop(len,wd,a){const c=mk(Math.ceil(wd)+2,len),x=c.getContext('2d'),v=x.createLinearGradient(0,0,0,len);v.addColorStop(0,'rgba(200,220,255,0)');v.addColorStop(1,'rgba(225,238,255,'+a+')');x.fillStyle=v;x.beginPath();x.moveTo(1,0);x.lineTo(1+wd,0);x.lineTo(1+wd*.9,len);x.arc(1+wd/2,len-wd/2,wd/2,0,Math.PI);x.closePath();x.fill();return c}
 function fog(){const W=1024,H=256,c=mk(W,H),x=c.getContext('2d'),R=rng(77);for(let i=0;i<46;i++){const px=R()*W,py=H*(.35+R()*.35),r=50+R()*80;x.save();x.translate(0,py);x.scale(1,.55);for(const o of[-W,0,W])if(px+o+r>0&&px+o-r<W)puff(x,px+o,0,r,.5);x.restore()}
  x.globalCompositeOperation='destination-in';const f=x.createLinearGradient(0,0,0,H);f.addColorStop(0,'rgba(0,0,0,0)');f.addColorStop(.35,'rgba(0,0,0,1)');f.addColorStop(.8,'rgba(0,0,0,1)');f.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=f;x.fillRect(0,0,W,H);return c}
 function leaf(col,petal){const c=mk(18,12),x=c.getContext('2d');x.fillStyle=col;x.beginPath();if(petal){x.ellipse(9,6,6,3.6,0,0,6.3)}else{x.moveTo(1,6);x.quadraticCurveTo(8,-1,17,6);x.quadraticCurveTo(8,13,1,6)}x.fill();if(!petal){x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=.8;x.beginPath();x.moveTo(2,6);x.lineTo(15,6);x.stroke()}return c}
 function meteor(){const c=mk(240,8),x=c.getContext('2d'),h=x.createLinearGradient(0,0,240,0);h.addColorStop(0,'rgba(180,200,255,0)');h.addColorStop(.85,'rgba(235,240,255,.75)');h.addColorStop(1,'rgba(255,255,255,1)');x.fillStyle=h;x.beginPath();x.moveTo(0,4);x.lineTo(236,1.5);x.arc(236,4,2.5,-1.57,1.57);x.lineTo(0,4);x.fill();return c}
 const L={};const lazy=(k,f)=>L[k]||(L[k]=f());
 return{cloud:get,strip:p=>lazy('strip'+p,()=>strip(p)),
  get sun(){return lazy('sun',()=>glow(256,[[0,'rgba(255,246,214,1)'],[.12,'rgba(255,232,170,.85)'],[.4,'rgba(255,210,130,.25)'],[1,'rgba(255,190,110,0)']]))},
  get moon(){return lazy('moon',()=>glow(192,[[0,'rgba(220,230,255,.75)'],[.3,'rgba(170,190,255,.3)'],[1,'rgba(120,140,255,0)']]))},
  get ray(){return lazy('ray',ray)},get fog(){return lazy('fog',fog)},get meteor(){return lazy('met',meteor)},
  get flake(){return lazy('flake',()=>glow(32,[[0,'rgba(255,255,255,1)'],[.4,'rgba(255,255,255,.8)'],[1,'rgba(255,255,255,0)']]))},
  get firefly(){return lazy('ffly',()=>glow(40,[[0,'rgba(255,255,220,1)'],[.18,'rgba(236,255,140,.8)'],[.5,'rgba(190,255,90,.18)'],[1,'rgba(160,255,80,0)']]))},
  get drops(){return lazy('drops',()=>[drop(18,1.2,.45),drop(28,1.6,.65),drop(44,2.3,.85)])},
  get leaves(){return lazy('leaves',()=>[leaf('#8cc65a'),leaf('#d9a441'),leaf('#c8783c'),leaf('#f7b6cc',1),leaf('#a8d86a')])}}})();
const WX6=(()=>{
 const I={},ST=WX_STATES;for(const s of ST)I[s]=s=='clear'?1:0;
 const W8={clear:30,cloudy:14,fog:8,drizzle:8,rain:12,storm:6,snow:8,blizzard:3,windy:6,aurora:5,starfall:4,crystal:4};
 const hash=n=>{n=(n^61)^(n>>>16);n=(n+(n<<3))>>>0;n=Math.imul(n,0x27d4eb2d);n^=n>>>15;return n>>>0};
 const SLOT=75000;let cur='clear',acc=0,wet=0,thunder=6;const drops=[],flakes=[],spl=[],leaves=[],mets=[];
 function pick(slot){const seed=hash(slot*7919+(typeof ws=='number'?Math.floor(ws*10):0)),dayPos=((slot*SLOT)/1000%DAY)/DAY,nt=(1-Math.cos(6.2832*dayPos))/2;let tot=0;const w=ST.map(s=>{let v=W8[s];if(s=='aurora'||s=='starfall')v*=nt>.55?2.2:0;if(s=='crystal')v*=1;tot+=v;return v});let r=seed%Math.max(1,Math.round(tot*1000))/1000,i=0;for(;i<ST.length;i++){if(r<w[i])break;r-=w[i]}return ST[Math.min(i,ST.length-1)]}
 const api={I,get cur(){return cur},get acc(){return acc},get wet(){return wet},
  rain:0,snow:0,fog:0,cloud:0,wind:0,aurora:0,star:0,crystal:0,
  update(dt){const on=cel.opt.wxOn;cur=on?pick(Math.floor(Date.now()/SLOT)):'clear';if(api.force)cur=api.force;const r=Math.min(1,dt*.14);for(const s of ST)I[s]+=((s==cur?1:0)-I[s])*r;
   api.rain=I.drizzle*.35+I.rain*.8+I.storm;api.snow=I.snow*.6+I.blizzard;api.fog=I.fog*.85+I.blizzard*.5+I.crystal*.35;api.cloud=Math.min(1,I.cloudy*.6+I.rain*.8+I.drizzle*.5+I.storm+I.snow*.6+I.blizzard+I.fog*.5);api.wind=I.windy+I.storm*.7+I.blizzard*1.2+I.rain*.3;api.aurora=I.aurora;api.star=I.starfall;api.crystal=I.crystal;
   acc=Math.max(0,Math.min(1,acc+(api.snow>.1?api.snow*dt*.012:-(.006+api.rain*.03)*dt)));
   wet=Math.max(0,Math.min(1,wet+(api.rain>.12?api.rain*dt*.05:-dt*.012)));
   // keep legacy variables in step (HUD chip, thunder, ambient, sky tint)
   const d=clock();night=(1-Math.cos(6.2832*d))/2;wxN=api.snow>.3?'snow':I.storm>.4?'storm':api.rain>.3?'rain':api.cloud>.3?'cloud':'clear';ptype=api.snow>.3?'snow':I.storm>.4?'storm':'rain';wxI=Math.max(api.rain,api.snow);wxC=api.cloud;
   if(I.storm>.5&&!QM.reduce){thunder-=dt;if(thunder<=0){thunder=rnd(7,14);flash=.4;try{makeBolt()}catch(_){}setTimeout(()=>{noise(1.6,260,.45);snd(60,1,'sine',.15,.5)},rnd(250,900))}}flash=Math.max(0,flash-dt);if(QM.reduce)flash=Math.min(flash,.08);
   try{ambUpdate()}catch(_){}},
  reset(){drops.length=0;flakes.length=0;spl.length=0;leaves.length=0;mets.length=0}};
 const R=Math.random,cl01=v=>v<0?0:v>1?1:v;
 // surface under a screen column (world x): first solid tile or water surface below the top of the view
 function surf(wx){const tx=Math.floor(wx/T);if(tx<1||tx>=W-1)return null;let ty=Math.max(1,Math.floor(cam.y/T));for(let n=0;n<34&&ty<H-1;n++,ty++){const k=ty*W+tx;if(wl[k]>0&&!tiles[k])return{y:(ty+1)*T-wl[k]/8*T,w:1};if(tiles[k]&&SOLID6[tiles[k]])return tiles[k-W]?null:{y:ty*T,w:0}}return null}
 // ---------- precipitation + overlays (screen space, drawn every frame after the world, before the lighting layer)
 api.draw=function(w,hh,now){const q=QM.cur.wx,t=now/1000,dt=Math.min(.05,window.FDT||1/60),red=QM.reduce,sc=hh/1080,wind=api.wind*140+(I.windy?Math.sin(t*.5)*60:0);
  let open=1;try{if(entered)open=1-cl01((depthAt(P.x,P.y)-5)/8)}catch(_){}// fades out while you are deep underground
  g.save();
  // world space: snow caps on exposed surface blocks, wet sheen + glints on exposed tops after rain, splash ripples
  if(entered&&(acc>.04||wet>.03||spl.length)){g.save();g.scale(ZM,ZM);const vw=w/ZM,vh=hh/ZM,x0=Math.max(1,cam.x/T|0),x1=Math.min(W-2,(cam.x+vw)/T|0),y0=Math.max(1,cam.y/T|0),y1=Math.min(H-2,(cam.y+vh)/T|0);
   if(acc>.04){g.fillStyle='rgba(245,250,255,'+Math.min(.95,acc*1.4)+')';for(let x=x0;x<=x1;x++){const y=sh(x);if(tiles[y*W+x]&&!tiles[(y-1)*W+x]){const px=x*T-cam.x,py=y*T-cam.y,th=2+acc*7;g.beginPath();g.moveTo(px,py+1);g.quadraticCurveTo(px+T*.25,py-th,px+T*.5,py-th*.6);g.quadraticCurveTo(px+T*.78,py-th*1.1,px+T,py+1);g.closePath();g.fill()}}}
   if(wet>.03){const a=wet*(1-acc);g.fillStyle='rgba(215,232,255,'+(.2*a)+')';const tops=[];for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const k=y*W+x,b=tiles[k];if(b&&SOLID6[b]&&!tiles[k-W]&&!wl[k-W]){tops.push(x,y);g.fillRect(x*T-cam.x+1,y*T-cam.y,T-2,2.5)}}
    g.fillStyle='rgba(255,255,255,'+(.5*a)+')';for(let i=0;i<tops.length;i+=2){const x=tops[i],gx=(t*22+x*61)%(T*4);if(gx<T-10)g.fillRect(x*T-cam.x+gx,tops[i+1]*T-cam.y,10,1.5)}}
   if(spl.length){for(let i=spl.length-1;i>=0;i--){const s=spl[i];s.a+=dt*2.2;if(s.a>=1)spl.splice(i,1)}
    for(let b=0;b<3;b++){g.strokeStyle='rgba(215,235,255,'+(.55-b*.17)+')';g.lineWidth=1.2;g.beginPath();for(const s of spl){if((s.a*3|0)!=b)continue;const px=s.x-cam.x,py=s.y-cam.y,r=2+s.a*(s.w?13:9);g.moveTo(px+r,py);g.ellipse(px,py,r,r*.3,0,0,6.3)}g.stroke()}
    g.fillStyle='rgba(225,240,255,.75)';for(const s of spl){if(s.a>.55||s.w)continue;const px=s.x-cam.x,py=s.y-cam.y,h=Math.sin(s.a/.55*Math.PI)*7;g.fillRect(px-2-s.a*9,py-h,1.6,1.6);g.fillRect(px+1+s.a*9,py-h*.8,1.6,1.6)}}
   g.restore()}
  // rain: three depth layers of pre-rendered streaks, slanted by the wind with one transform per layer
  if(api.rain>.02&&open>.02){const N=Math.round(300*q*api.rain*(red?.4:1)*PERF7.k);while(drops.length<N)drops.push({x:R(),y:R(),L:R()<.45?0:R()<.6?1:2});if(drops.length>N)drops.length=N;
   const D=WXS8.drops,nd=1-night*.45;
   for(let L=0;L<3;L++){const im=D[L],sp=(780+L*420+api.rain*260)*sc,vx=wind*(.55+L*.3)*sc,c=vx/sp,iw=im.width*sc*1.3,ih=im.height*sc;g.save();g.transform(1,0,c,1,0,0);g.globalAlpha=Math.min(1,(.6+L*.22)*nd*open*Math.min(1,api.rain*1.6));
    for(const d of drops){if(d.L!=L)continue;d.y+=sp*dt/hh;d.x+=vx*dt/w;if(d.y>1.04){d.y-=1.1;d.x=R()}if(d.x>1.06)d.x-=1.12;else if(d.x<-.06)d.x+=1.12;const y=d.y*hh;g.drawImage(im,d.x*w-c*y,y-ih,iw,ih)}g.restore()}
   // splash ripples where drops land (world space, pooled)
   if(entered&&open>.3){let n=api.rain*110*dt*q*(red?.4:1);while(n>0&&spl.length<70){if(n<1&&R()>n)break;n--;const wx=cam.x+R()*w/ZM,s=surf(wx);if(s)spl.push({x:wx,y:s.y,a:0,w:s.w})}}
   g.fillStyle='rgba(170,186,210,'+(.06*api.rain*open)+')';g.fillRect(0,0,w,hh)}else{if(drops.length)drops.length=0}
  // snow: soft flakes in three depths that sway as they fall
  if(api.snow>.02&&open>.02){const N=Math.round((170*api.snow+120*I.blizzard)*q*(red?.4:1)*PERF7.k);while(flakes.length<N)flakes.push({x:R(),y:R(),z:R(),p:R()*6.3});if(flakes.length>N)flakes.length=N;
   const im=WXS8.flake,bz=1+I.blizzard*1.6;g.globalAlpha=1;
   for(const f of flakes){const vy=(26+f.z*52)*bz*sc,vx=(wind*(.25+f.z*.5)+Math.sin(t*(.5+f.z*.6)+f.p)*(10+f.z*14))*sc;f.y+=vy*dt/hh;f.x+=vx*dt/w;if(f.y>1.03){f.y=-.03;f.x=R()}if(f.x>1.03)f.x-=1.06;else if(f.x<-.03)f.x+=1.06;
    const s=(4+f.z*9)*sc;g.globalAlpha=(.5+f.z*.5)*open*Math.min(1,api.snow*1.5);g.drawImage(im,f.x*w-s/2,f.y*hh-s/2,s,s)}g.globalAlpha=1}else if(flakes.length)flakes.length=0;
  // fog: an even veil + slow rolling banks (pre-rendered, tiled) in the lower half
  if(api.fog>.02){const fc=I.crystal>.3?'206,186,255':'214,222,236';g.fillStyle='rgba('+fc+','+(api.fog*.12)+')';g.fillRect(0,0,w,hh);const im=WXS8.fog;
   for(let i=0;i<4;i++){const bw=w*(1.1+i*.15),bh=hh*(.3+i*.05),y=hh*(.26+i*.12)-bh*.3,off=((t*(5+i*4)*sc+i*397-cam.x*ZM*(.06+i*.06))%bw+bw)%bw;g.globalAlpha=api.fog*(.24-i*.03);for(let x=off-bw;x<w;x+=bw)g.drawImage(im,x,y,bw+1,bh)}g.globalAlpha=1;
   if(I.crystal>.3){g.fillStyle='rgba(190,160,255,'+(I.crystal*.06)+')';g.fillRect(0,0,w,hh)}}
  if(I.blizzard>.02){g.fillStyle='rgba(235,242,255,'+I.blizzard*.24+')';g.fillRect(0,0,w,hh)}
  // windy: leaves (and a few petals) tumbling across the screen
  const lw=I.windy*(1-api.rain)*(1-api.snow)*open;if(lw>.05&&!red){const N=Math.round(26*lw*q);while(leaves.length<N)leaves.push({x:-.05-R()*.3,y:R()*.8,z:R(),p:R()*6.3,r:R()*6.3,k:R()*5|0});if(leaves.length>N)leaves.length=N;const LV=WXS8.leaves;
   for(const f of leaves){f.x+=((90+f.z*120)*sc+wind*.6*sc)*dt/w;f.y+=(Math.sin(t*1.6+f.p)*38+20)*sc*dt/hh;f.r+=dt*(1.5+f.z*3);if(f.x>1.08||f.y>1.05){f.x=-.05-R()*.2;f.y=R()*.7}
    const s=(.8+f.z*.9)*sc*1.4;g.save();g.globalAlpha=.85*lw;g.translate(f.x*w,f.y*hh);g.rotate(f.r);g.scale(s,s*Math.abs(Math.cos(f.r*1.3))+.25*s);g.drawImage(LV[f.k],-9,-6);g.restore()}}else if(leaves.length)leaves.length=0;
  // starfall: smooth meteors (moved out of the cached sky so they never step)
  if(api.star>.05&&!red){if(mets.length<4&&R()<api.star*.9*dt)mets.push({x:R()*w*.9,y:R()*hh*.3,a:.45+R()*.25,v:(600+R()*500)*sc,l:1});const im=WXS8.meteor;g.save();g.globalCompositeOperation='lighter';
   for(let i=mets.length-1;i>=0;i--){const m=mets[i];m.l-=dt*.9;m.x+=Math.cos(m.a)*m.v*dt;m.y+=Math.sin(m.a)*m.v*dt;if(m.l<=0){mets.splice(i,1);continue}g.globalAlpha=Math.min(1,m.l*1.8)*api.star;{const k=window.SKYS||1;g.setTransform(k*Math.cos(m.a),k*Math.sin(m.a),-k*Math.sin(m.a),k*Math.cos(m.a),k*m.x,k*m.y)};g.drawImage(im,-236*sc,-4*sc,240*sc,8*sc)}g.restore()}else if(mets.length)mets.length=0;
  if(I.crystal>.05&&Math.random()<.35*q&&entered)VFX.mote(cam.x+Math.random()*w/ZM,cam.y+Math.random()*hh/ZM,['#bfa8ff','#9fe0ff','#ffc8ff'][Math.random()*3|0]);
  g.restore()};
 return api})();
updWeather=function(dt){WX6.update(dt)};
drawPrecip=function(w,hh,now){WX6.draw(w,hh,now)};
updSplash=function(){};// rain splashes are drawn by WX6 (pooled ripples on the real surface)
const SKY6=(()=>{
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),rgb=(c,a)=>'rgba('+c.map(Math.round)+','+(a==null?1:a)+')',cl01=v=>v<0?0:v>1?1:v;
 const hs=n=>{n=Math.imul(n^61,2246822519)>>>0;n^=n>>>13;n=Math.imul(n,3266489917)>>>0;return((n^n>>>16)>>>0)/4294967296};
 const stars=[];for(let i=0;i<140;i++)stars.push([hs(i*3+1),hs(i*3+2)*.7,hs(i*3+3)]);
 function mountains(w,hh,off,k,base,amp,col,snowCap,seed,sx){g.fillStyle=col;g.beginPath();g.moveTo(0,hh);const step=18;let pts=[];for(let x=0;x<=w+step;x+=step){const wx=(x+off*k)/ (sx||1),y=base-(Math.abs(Math.sin(wx*.0042+seed))*.7+Math.abs(Math.sin(wx*.0097+seed*2))*.3)*amp;pts.push([x,y]);g.lineTo(x,y)}g.lineTo(w+step,hh);g.closePath();g.fill();
  if(snowCap){g.fillStyle=snowCap;g.beginPath();for(const[x,y]of pts){if(y<base-amp*.62){g.moveTo(x-step,y+amp*.07);g.lineTo(x,y);g.lineTo(x+step,y+amp*.07);g.closePath()}}g.fill()}}
 function island(x,y,s,col,topc,glow,t){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.beginPath();g.moveTo(-70,0);g.quadraticCurveTo(-60,34,-20,52+Math.sin(t)*2);g.quadraticCurveTo(0,86,18,50);g.quadraticCurveTo(58,32,70,0);g.closePath();g.fill();g.fillStyle=topc;g.beginPath();g.ellipse(0,0,72,12,0,0,6.3);g.fill();
  if(glow){g.globalAlpha*=.3;g.fillStyle=glow;g.beginPath();g.moveTo(-24,-2);g.lineTo(-12,-38);g.lineTo(0,-3);g.lineTo(10,-28);g.lineTo(20,-2);g.closePath();g.fill();g.globalAlpha/=.3;g.fillStyle=glow;g.beginPath();g.moveTo(-18,-2);g.lineTo(-10,-30);g.lineTo(-2,-3);g.lineTo(6,-22);g.lineTo(14,-2);g.closePath();g.fill()}
  g.restore()}
 function ruins(x,y,s,col,glow){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.fillRect(-60,-6,120,8);for(const px of[-50,-20,26,52]){const h=px==26?44:px==-20?70:px==52?36:84;g.fillRect(px-5,-h,10,h)}g.beginPath();g.moveTo(-50,-84);g.quadraticCurveTo(-35,-110,-20,-70);g.lineTo(-25,-70);g.quadraticCurveTo(-35,-95,-45,-84);g.fill();if(glow){g.fillStyle=glow;g.beginPath();g.moveTo(80,0);g.lineTo(88,-50);g.lineTo(96,-10);g.lineTo(104,-36);g.lineTo(112,0);g.closePath();g.fill()}g.restore()}
 // cloud slots: [x 0..1, height 0..1, size 0..1, shape, appear threshold] per depth layer; more slots appear as cloud cover grows
 const LAY=[{n:8,k:.012,sp:2.6,s:[.42,.58],y:[.05,.22],a:.62},{n:7,k:.03,sp:6,s:[.66,.86],y:[.08,.3],a:.82},{n:6,k:.055,sp:11,s:[.95,1.3],y:[.12,.38],a:.92}].map((L,li)=>({...L,slots:Array.from({length:L.n},(_,i)=>{const r=j=>hs(li*131+i*17+j);return{u:r(1),h:r(2),z:r(3),sh:(r(4)*6|0),ci:r(5)<.35,th:(i+r(6)*.8)/L.n}})}));
 let lastT=0,birds=[],birdT=8;
 function clouds(w,hh,t,L,cov,stv,dsk,nt,wind,cx,dy){const span=w+800;
  for(const s of L.slots){const a0=cl01((cov-s.th)*5)*L.a*(1-nt*.5);if(a0<.02)continue;const sc=(L.s[0]+(L.s[1]-L.s[0])*s.z)*hh/1080*1.25;
   const cirrus=s.ci&&cov<.5,kind=cirrus?'ci':cov>.75&&s.z<.4?'st':'cu',idx=kind=='cu'?s.sh:s.sh%2,sp=L.sp+wind*14;
   const x=((s.u*span+t*sp-cx*L.k)%span+span)%span-400,y=hh*(L.y[0]+(L.y[1]-L.y[0])*s.h)+dy,dw=(kind=='st'?520:kind=='ci'?440:340)*sc,dh=(kind=='st'?120:kind=='ci'?80:170)*sc;
   const a=cirrus?a0*.7*(1-stv):a0,wd=(1-stv)*(1-dsk),ws=stv,wk=(1-stv)*dsk;
   if(wd>.02){g.globalAlpha=a*wd;g.drawImage(WXS8.cloud(kind,idx,'day'),x,y,dw,dh)}
   if(wk>.02){g.globalAlpha=a*wk;g.drawImage(WXS8.cloud(kind,idx,'dusk'),x,y,dw,dh)}
   if(ws>.02){g.globalAlpha=a*ws;g.drawImage(WXS8.cloud(kind,idx,'storm'),x,y,dw,dh)}}
  g.globalAlpha=1}
 function draw(w,hh,now){const t=now/1000,d=clock(),I=WX6.I,tw=Math.max(0,1-Math.abs(night-.5)*4),cl=WX6.cloud,gry=[110,120,138],np=QM.cur.par,refY=sh(W/2|0)*T-hh*.5/ZM,dy=k=>Math.max(-400,Math.min(900,(cam.y-refY)*k*ZM)),cx=cam.x*ZM;
  const sdt=Math.min(.12,Math.max(0,t-lastT));lastT=t;
  // sky colour: zenith / middle / horizon, blended smoothly through day, dusk, night and every weather state
  const ovc=cl*.85*(1-night*.55),stm=I.storm,rn=WX6.rain*(1-night*.5),sno=Math.min(1,WX6.snow)*(1-night*.5),fg=WX6.fog*(1-night*.4);
  let Z=mix([84,156,236],[5,9,28],night),M=mix([146,198,248],[14,20,54],night),Hz=mix([216,236,250],[36,36,84],night);
  Z=mix(Z,[86,92,168],tw*.5);M=mix(M,[238,150,140],tw*.72);Hz=mix(Hz,[255,194,126],tw*.85);
  Z=mix(Z,[124,134,152],ovc);M=mix(M,[156,166,182],ovc);Hz=mix(Hz,[190,198,210],ovc*.9);
  if(rn>.01){Z=mix(Z,[98,106,122],rn*.6);M=mix(M,[132,140,154],rn*.55);Hz=mix(Hz,[162,170,182],rn*.5)}
  if(stm>.01){Z=mix(Z,[34,38,54],stm*.7);M=mix(M,[58,62,80],stm*.65);Hz=mix(Hz,[92,98,116],stm*.55)}
  if(sno>.01){Z=mix(Z,[176,186,204],sno*.75);M=mix(M,[210,216,228],sno*.75);Hz=mix(Hz,[236,240,246],sno*.8)}
  if(fg>.01){Z=mix(Z,[176,188,204],fg*.4);M=mix(M,[204,212,224],fg*.6);Hz=mix(Hz,[224,230,238],fg*.7)}
  if(I.crystal>.05){Z=mix(Z,[70,40,120],I.crystal*.35*(1-night*.5));M=mix(M,[140,110,210],I.crystal*.3);Hz=mix(Hz,[180,150,230],I.crystal*.4)}
  if(WX6.aurora>.05){Z=mix(Z,[4,18,34],WX6.aurora*night*.6);M=mix(M,[10,34,56],WX6.aurora*night*.5)}
  const gr=g.createLinearGradient(0,0,0,hh);gr.addColorStop(0,rgb(Z));gr.addColorStop(.36,rgb(M));gr.addColorStop(.64,rgb(Hz));g.fillStyle=gr;g.fillRect(0,0,w,hh);
  // stars
  const sa=Math.min(1,Math.max(0,(night-.2)*1.7))*(1-cl*.85);if(sa>.02){g.fillStyle='#fff';for(const s of stars){g.globalAlpha=sa*(.4+.6*Math.abs(Math.sin(t*.9+s[2]*30)));const sz=s[2]>.9?3:s[2]>.6?2:1.4;g.fillRect(((s[0]*w-cx*.02)%w+w)%w,s[1]*hh,sz,sz)}g.globalAlpha=1}
  // aurora ribbons (slow)
  if(WX6.aurora>.03){g.save();g.globalCompositeOperation='lighter';for(let b=0;b<3;b++){const base=hh*(.16+b*.07);const gr2=g.createLinearGradient(0,base-70,0,base+110);const c=[['rgba(80,255,170,','rgba(120,120,255,'],['rgba(120,255,220,','rgba(200,100,255,'],['rgba(60,220,255,','rgba(255,120,220,']][b];gr2.addColorStop(0,c[0]+'0)');gr2.addColorStop(.35,c[0]+(.75*WX6.aurora)+')');gr2.addColorStop(1,c[1]+'0)');g.fillStyle=gr2;g.beginPath();g.moveTo(0,base+110);for(let x=0;x<=w;x+=24){g.lineTo(x,base+Math.sin(x*.0035+t*.22+b*1.7)*36+Math.sin(x*.009-t*.31+b)*14)}g.lineTo(w,base+110);g.closePath();g.fill()}g.restore()}
  // sun / moon (pre-rendered glows), soft and diffused behind cloud cover
  const a=6.2832*d,sx=w/2+Math.sin(a)*w*.42,sy=hh*.62-Math.cos(a)*hh*.5,mxp=w-sx,myp=hh*1.24-sy,sunUp=cl01((hh*.9-sy)/(hh*.25));
  const sunVis=cl01(1-cl*1.2);if(sunUp>0){g.globalCompositeOperation='lighter';const gs=(300+cl*300)*hh/1080;g.globalAlpha=sunUp*(.8*sunVis+.22*cl*(1-stm));g.drawImage(WXS8.sun,sx-gs/2,sy-gs/2,gs,gs);g.globalCompositeOperation='source-over';g.globalAlpha=sunUp*sunVis;g.fillStyle=tw>.3?'#ffe2b0':'#fff6d8';g.beginPath();g.arc(sx,sy,24*hh/1080+4,0,6.3);g.fill();g.globalAlpha=1}
  if(myp<hh*.9){g.globalAlpha=1-cl*.75;g.globalCompositeOperation='lighter';const ms=200*hh/1080;g.drawImage(WXS8.moon,mxp-ms/2,myp-ms/2,ms,ms);g.globalCompositeOperation='source-over';g.fillStyle='#e9eeff';g.beginPath();g.arc(mxp,myp,22,0,6.3);g.fill();g.fillStyle='rgba(150,160,200,.5)';for(const[ox,oy,r]of[[-7,-5,5],[6,4,4],[-2,9,3]]){g.beginPath();g.arc(mxp+ox,myp+oy,r,0,6.3);g.fill()}g.globalAlpha=1}
  // gentle light rays from the sun (slowly breathing)
  const ra=sunUp*(1-cl*1.6)*(1-night)*(QM.cur.bloom>=1?1:.5);if(ra>.03){g.save();g.globalCompositeOperation='lighter';const L2=hh*1.5;for(let i=0;i<6;i++){const ang=Math.atan2(hh-sy,w*.5-sx)+(i-2.5)*.17+Math.sin(t*.07+i*1.3)*.04;g.globalAlpha=ra*(.05+.03*Math.sin(t*.13+i*2.1));{const k=window.SKYS||1;g.setTransform(k*Math.cos(ang-1.5708),k*Math.sin(ang-1.5708),-k*Math.sin(ang-1.5708),k*Math.cos(ang-1.5708),k*sx,k*sy)};g.drawImage(WXS8.ray,-(60+i*14)*hh/1080,0,(120+i*28)*hh/1080,L2)}g.restore()}
  // birds: a distant flock now and then on calm, clear days
  birdT-=sdt;const calm=night<.35&&cl<.45&&WX6.rain<.05&&WX6.snow<.05&&WX6.fog<.3;if(calm&&birdT<=0&&!birds.length&&!QM.reduce){birdT=22+Math.random()*26;const dir=Math.random()<.5?1:-1,n=5+(Math.random()*5|0),y0=hh*(.12+Math.random()*.2);birds=Array.from({length:n},(_,i)=>({ox:-Math.abs(i-(n>>1))*22-Math.random()*8,oy:Math.abs(i-(n>>1))*12*(i<n>>1?1:1)+Math.random()*6,p:Math.random()*6.3}));birds.x=dir>0?-120:w+120;birds.y=y0;birds.d=dir;birds.v=(26+Math.random()*16)*hh/1080}
  if(birds.length){birds.x+=birds.d*birds.v*sdt;birds.y+=Math.sin(t*.4)*3*sdt;if(birds.x<-260||birds.x>w+260)birds=[];else{g.strokeStyle=rgb(mix([46,56,78],[90,96,120],ovc),.62*(1-night*1.5));g.lineWidth=1.6*hh/1080+.4;g.lineCap='round';g.beginPath();const bs=hh/1080;
    for(const b of birds){const x=birds.x+b.ox*birds.d*bs,y=birds.y+b.oy*bs,f=Math.sin(t*7+b.p),s=(5+1.5*Math.sin(b.p))*bs;g.moveTo(x-s,y-f*s*.6);g.quadraticCurveTo(x-s*.4,y-s*.5*(1+f*.3),x,y);g.quadraticCurveTo(x+s*.4,y-s*.5*(1+f*.3),x+s,y-f*s*.6)}g.stroke();g.lineCap='butt'}}
  const nm=night*.85,haze=(c)=>rgb(mix(mix(mix(c,gry,cl*.35+rn*.25),[205,212,224],fg*.45+sno*.2),[16,22,48],nm),1);
  const cov=cl01(.2+cl*.95),stv=cl01(I.storm+I.rain*.65+I.drizzle*.35+I.blizzard*.7+I.snow*.3+cl01((night-.45)*1.8)*.8),dsk=cl01(tw*1.3)*(1-night*.5),wind=WX6.wind;
  // far clouds and the overcast deck sit behind the mountains
  clouds(w,hh,t,LAY[0],cov,stv,dsk,night,wind,cx,dy(.02));
  if(cl>.4){const oa=cl01((cl-.4)*1.7)*.9*(1-night*.35),bw=1024*hh/600,bh=240*hh/600,off=((t*3.5-cx*.01)%bw+bw)%bw;for(const[pal,wt]of[['day',1-stv],['storm',stv]]){if(wt<.02)continue;g.globalAlpha=oa*wt;for(let x=-off;x<w;x+=bw)g.drawImage(WXS8.strip(pal),x,-bh*.12+dy(.015),bw+1,bh)}g.globalAlpha=1}
  if(flash>0&&I.storm>.1){g.globalCompositeOperation='lighter';g.fillStyle='rgba(190,200,255,'+Math.min(.3,flash*.6)+')';g.fillRect(0,0,w,hh*.5);g.globalCompositeOperation='source-over'}
  // parallax layers: far mountains -> floating islands -> mid clouds -> ruins/crystals -> near clouds -> hills -> mist
  const horizon=hh*.66;
  mountains(w,hh,cx,.03,horizon-hh*.04+dy(.02),hh*.34,haze([128,148,190]),rgb(mix(mix([240,248,255],[255,210,190],tw*.5),[120,130,180],nm),.9),1.3);
  if(fg>.02){g.fillStyle=rgb(mix([214,222,234],[40,44,70],nm),fg*.35);g.fillRect(0,0,w,hh)}
  if(np>=2)for(let i=-1;i<5;i++){const wx=((i*520+hs(i+9)*200)-cx*.06),x=((wx%(w+600))+w+600)%(w+600)-300,y=hh*(.22+hs(i+3)*.2)+Math.sin(t*.35+i)*5+dy(.05),s=.7+hs(i+5)*.5;island(x,y,s,haze([84,78,96]),haze([92,150,96]),nm>.4?'rgb(150,220,255)':null,t+i)}
  clouds(w,hh,t,LAY[1],cov,stv,dsk,night,wind,cx,dy(.03));
  mountains(w,hh,cx,.06,horizon+hh*.0+dy(.04),hh*.22,haze([98,128,150]),null,4.1);
  if(np>=3)for(let i=-1;i<4;i++){const wx=(i*700+hs(i+21)*300)-cx*.11,x=((wx%(w+800))+w+800)%(w+800)-400,y=horizon+hh*.07+dy(.07);ruins(x,y,.8+hs(i)*.4,haze([70,84,104]),nm>.35||WX6.I.crystal>.2?'rgb(160,120,255)':null)}
  clouds(w,hh,t,LAY[2],cov,stv,dsk,night,wind,cx,dy(.04));
  for(let l=0;l<3;l++){const k=.09+l*.07,base=hh*(.7+l*.08)+dy(.1+l*.05),col=mix(mix([[110,170,120],[80,140,100],[56,110,84]][l],[205,214,226],fg*.3*(1-l*.3)),[16,22,48],night*.85);g.fillStyle='rgba('+mix(col,gry,cl*.35).map(Math.round)+','+(.55+l*.2)+')';g.beginPath();g.moveTo(0,hh);for(let x=0;x<=w;x+=24)g.lineTo(x,base-Math.sin((x+cx*k)*.006*(l+1)+l)*50-Math.sin((x+cx*k)*.015)*14);g.lineTo(w,hh);g.fill()}
  if(np>=4){g.globalAlpha=.55*(1-night*.5);const mg=g.createLinearGradient(0,horizon-20,0,horizon+hh*.25);mg.addColorStop(0,'rgba(255,255,255,0)');mg.addColorStop(.5,'rgba('+(night>.5?'120,110,190':'230,240,255')+',.45)');mg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=mg;g.fillRect(0,horizon-20,w,hh*.3);g.globalAlpha=1}}
 return{draw}})();
drawSky=function(w,hh,now){SKY6.draw(w,hh,now)};
// ---------- post: color grade, vignette, bloom, cinematic bars (run after legacy draw + VFX)
const POST6=(()=>{const bc=document.createElement('canvas'),bx=bc.getContext('2d'),b2=document.createElement('canvas'),b2x=b2.getContext('2d'),can=('filter'in bx);let bars=0,bf=0;   // bf: the blurred bloom buffer is refreshed every 2nd frame (copying the frame stalls the GPU)
 return{run(w,hh){const q=QM.cur;
  if(q.grade&&entered){const d=clock(),tw=Math.max(0,1-Math.abs(night-.5)*4);g.save();g.globalCompositeOperation='soft-light';const tint=night>.5?[40,50,140]:tw>.3?[255,150,90]:[255,245,220],a=q.grade==2?.34:.2;g.globalAlpha=a*(night>.5?night:tw>.3?tw:.3);g.fillStyle='rgb('+tint+')';g.fillRect(0,0,w,hh);if(WX6.cloud>.3){g.globalAlpha=.18*WX6.cloud;g.fillStyle='rgb(120,130,150)';g.fillRect(0,0,w,hh)}g.restore();
   const vg=g.createRadialGradient(w/2,hh/2,hh*.45,w/2,hh/2,hh*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(6,4,16,'+(q.grade==2?.5:.3)+')');g.fillStyle=vg;g.fillRect(0,0,w,hh)}
  if(q.bloom&&cel.opt.bloom&&ZM>=.7&&can&&entered){const bw=w>>2,bh=hh>>2;let fresh=false;if(bc.width!=bw||bc.height!=bh){bc.width=b2.width=bw;bc.height=b2.height=bh;fresh=true}if(fresh||(bf++&1)==0){bx.globalCompositeOperation='copy';bx.drawImage(cv,0,0,bw,bh);b2x.filter='brightness(.8) contrast(2.6) saturate(1.3) blur('+(q.bloom==2?5:3)+'px)';b2x.globalCompositeOperation='copy';b2x.drawImage(bc,0,0);b2x.filter='none'}g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(q.bloom==2?.38:.22)*(QM.reduce?.6:1);g.drawImage(b2,0,0,w,hh);g.restore()}
  const tb=q.cine&&cel.opt.cine!==0?1:0;bars+=(tb-bars)*.08;if(bars>.01){const bh2=hh*.07*bars;g.fillStyle='#000';g.fillRect(0,0,w,bh2);g.fillRect(0,hh-bh2,w,bh2)}}}})();
