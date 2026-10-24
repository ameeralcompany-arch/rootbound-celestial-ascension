// ===== Plaza redesign: "Blossom Garden Plaza" built only from the 18 new blocks (ids 42-59) =====
// Layout (x relative to the door DX): pond+arched bridge (-44..-38), cottage (-36..-28), cherry tree (-23),
// fountain with Lumen crystal (-17..-11), paved promenade, door + crystal pedestals (0), torii gate (+16..+20),
// two-storey teahouse (+25..+35), bamboo grove (+38..+44). NPC spots (-7,+7,+13) stay on flat paving.
const PLZ7=(()=>{
 const S=22;
 function build(){
  const set=(x,y,b)=>{if(x>0&&x<W-1&&y>=0&&y<H-2){tiles[y*W+x]=b;hp[y*W+x]=b?BLK[b][2]:0;wl[y*W+x]=0}};
  const fillR=(x0,x1,y,b)=>{for(let x=x0;x<=x1;x++)set(x,y,b)};
  const D=DX;
  // wipe everything the legacy generator put above ground, and re-skin its surface row
  for(let y=0;y<S;y++)for(let x=1;x<W-1;x++){const k=y*W+x;tiles[k]=0;hp[k]=0}
  for(let x=1;x<W-1;x++){const k=S*W+x;if(tiles[k]==2||tiles[k]==11||tiles[k]==12)set(x,S,42)}
  // ground: moss turf over rich loam
  for(let x=1;x<W-1;x++){for(let y=S;y<S+8;y++){const k=y*W+x;if(tiles[k]==2)set(x,y,42);else if(tiles[k]==1)set(x,y,43)}}
  // promenade of slate pavers with river-stone edging
  fillR(D-24,D+22,S,44);for(let x=D-24;x<=D+22;x++)if(x%6==0)set(x,S,55);
  fillR(D-24,D-24,S,55);fillR(D+22,D+22,S,55);
  for(let y=S+1;y<=S+2;y++)fillR(D-24,D+22,y,y==S+1?57:43);
  // ---- pond west with arched cherry-wood bridge
  const xa=D-44,xb=D-38;
  for(let y=S;y<=S+5;y++){set(xa,y,57);set(xb,y,57);for(let x=xa+1;x<xb;x++){if(y==S+5)set(x,y,55);else{set(x,y,0);wl[y*W+x]=8}}}
  fillR(xa+1,xb-1,S+6,54);
  set(xa,S-1,45);set(xb,S-1,45);set(xa-1,S-1,0);
  set(xa+1,S-1,50);set(xb-1,S-1,50);fillR(xa+2,xb-2,S-2,50);
  for(const x of[xa,xb]){set(x,S-2,47);set(x,S-3,47);set(x,S-4,53)}
  for(let x=xa+1;x<xb;x++)if(x!=xa+1&&x!=xb-1){/* underside beam */ }
  fillR(xa+2,xb-2,S-1,0);
  set(xa+1,S-2,0);
  // ---- cottage (cherry planks, terracotta roof)
  {const x0=D-36,x1=D-28;
   for(let y=S-1;y>=S-4;y--){set(x0,y,47);set(x1,y,47);for(let x=x0+1;x<x1;x++)set(x,y,y==S-4?47:50)}
   for(let y=S-1;y>=S-3;y--){set(D-32,y,0);set(D-31,y,0)}
   set(x0+2,S-2,53);set(x1-2,S-2,53);set(D-32,S-4,47);
   for(let i=0;i<6;i++)fillR(x0-1+i,x1+1-i,S-5-i,48);
   set(D-32,S-11,58);set(D-30,S-11,0)}
  // ---- fountain: mossy cobble basin around a glowing Lumen crystal
  {const a=D-17,b=D-11;for(let x=a;x<=b;x++){set(x,S,55);set(x,S-1,x==a||x==b?57:0)}
   set(a,S-2,57);set(b,S-2,57);for(let x=a+1;x<b;x++){wl[(S-1)*W+x]=8}
   set(D-14,S-1,44);set(D-14,S-2,52);set(D-14,S-3,52);set(D-14,S-4,58)}
  // ---- door pedestals
  for(const x of[D-3,D+3]){set(x,S-1,56);set(x,S-2,52)}
  // ---- stone lanterns along the promenade
  for(const x of[D-21,D-10,D+10]){set(x,S-1,54);set(x,S-2,53);set(x,S-3,44)}
  // ---- torii gate (terracotta, timber, gilded plaque)
  {const a=D+16,b=D+20;for(let y=S-1;y>=S-5;y--){set(a,y,y>=S-2?54:48);set(b,y,y>=S-2?54:48)}
   fillR(a-1,b+1,S-6,48);fillR(a,b,S-5,0);set(a,S-5,48);set(b,S-5,48);set(D+18,S-6,58);fillR(a-2,b+2,S-7,47)}
  // ---- teahouse (two storeys, indigo roofs, gilded finial)
  {const x0=D+25,x1=D+35,mid=D+30;
   set(x0-1,S-1,45);set(x1+1,S-1,45);
   for(let y=S-1;y>=S-4;y--){set(x0,y,47);set(x1,y,47);if(y<S-1)for(let x=x0+1;x<x1;x++)set(x,y,y==S-4?47:46)}
   for(let y=S-2;y>=S-3;y--)for(let x=mid-2;x<=mid+2;x++)set(x,y,0);
   set(x0+2,S-2,53);set(x1-2,S-2,53);set(x0+3,S-3,53);set(x1-3,S-3,53);
   fillR(x0-2,x1+2,S-5,49);fillR(x0-1,x1+1,S-6,49);set(x0-3,S-5,49);set(x1+3,S-5,49);
   const u0=x0+2,u1=x1-2;for(let y=S-7;y>=S-9;y--){set(u0,y,47);set(u1,y,47);for(let x=u0+1;x<u1;x++)set(x,y,y==S-9?47:46)}
   set(mid-2,S-8,53);set(mid+2,S-8,53);set(mid,S-8,53);
   fillR(u0-2,u1+2,S-10,49);fillR(u0-1,u1+1,S-11,49);fillR(u0+1,u1-1,S-12,49);fillR(mid-1,mid+1,S-13,49);set(mid,S-14,58);set(mid,S-15,58);set(mid,S-16,52);
   set(x0-1,S-2,59);set(x1+1,S-2,59);set(x0-1,S-1,59);set(x1+1,S-1,59)}
  // ---- bamboo grove
  [[D+38,6],[D+41,8],[D+44,5],[D+47,7]].forEach(([x,h])=>{for(let y=S-1;y>=S-h;y--)set(x,y,51)});
  // ---- flower planters (coral)
  for(const x of[D-20,D-2,D+2,D+14,D+23]){set(x,S-1,59)}
  trees.clear();
 }
 // ----- decor sprites (drawn behind characters): cherry trees, shrubs, flowers -----
 const SP={};
 const rr=(s)=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 function cherry(seed){if(SP['c'+seed])return SP['c'+seed];const w=300,h=330,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),R=rr(seed*7+3),bx=w/2,by=h-8;
  x.lineCap=x.lineJoin='round';
  // trunk (gradient bark, gnarled)
  const tg=x.createLinearGradient(bx-16,0,bx+16,0);tg.addColorStop(0,'#2f1d14');tg.addColorStop(.45,'#6a4430');tg.addColorStop(1,'#3a2418');
  x.fillStyle=tg;x.beginPath();x.moveTo(bx-18,by);x.bezierCurveTo(bx-10,by-30,bx-14,by-70,bx-8,by-120);x.lineTo(bx+8,by-120);x.bezierCurveTo(bx+14,by-70,bx+9,by-30,bx+19,by);x.closePath();x.fill();
  x.strokeStyle='rgba(20,10,6,.5)';x.lineWidth=1.3;for(let i=0;i<9;i++){const xx=bx-10+R()*20,y0=by-R()*100;x.beginPath();x.moveTo(xx,y0);x.lineTo(xx+(R()-.5)*3,y0-8-R()*14);x.stroke()}
  // branches
  const br=[];for(let i=0;i<5;i++){const a=-2.5+i*1.25+(R()-.5)*.3,len=60+R()*38,sx=bx+(R()-.5)*8,sy=by-95-R()*25,ex=sx+Math.cos(a)*len,ey=sy+Math.sin(a)*len*.8-12;br.push([ex,ey]);x.strokeStyle='#3d2619';x.lineWidth=7-i%2*2;x.beginPath();x.moveTo(sx,sy);x.quadraticCurveTo((sx+ex)/2,Math.min(sy,ey)-10,ex,ey);x.stroke()}
  // canopy: dark underside then lit blossom clusters
  const blobs=[];for(const[ex,ey]of br)for(let i=0;i<7;i++)blobs.push([ex+(R()-.5)*70,ey+(R()-.5)*46,22+R()*20]);for(let i=0;i<12;i++)blobs.push([bx+(R()-.5)*130,by-170-R()*50,26+R()*18]);
  x.globalAlpha=.9;for(const[px,py,r]of blobs){const g=x.createRadialGradient(px+4,py+8,2,px+4,py+8,r);g.addColorStop(0,'#b15a7e');g.addColorStop(1,'rgba(150,60,100,0)');x.fillStyle=g;x.beginPath();x.arc(px+4,py+8,r,0,6.3);x.fill()}x.globalAlpha=1;
  blobs.sort((a,b)=>a[1]-b[1]);
  for(const[px,py,r]of blobs){const g=x.createRadialGradient(px-r*.3,py-r*.4,1,px,py,r);g.addColorStop(0,'#fff0f5');g.addColorStop(.5,'#ffc1d6');g.addColorStop(1,'#e988ac');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,6.3);x.fill()}
  for(let i=0;i<420;i++){const b=blobs[R()*blobs.length|0],a=R()*6.28,d=Math.sqrt(R())*b[2]*.95;const px=b[0]+Math.cos(a)*d,py=b[1]+Math.sin(a)*d;x.fillStyle=['#fff6f9','#ffd6e3','#f6a1bf','#ffffff'][R()*4|0];x.globalAlpha=.55+R()*.4;x.beginPath();x.arc(px,py,1.4+R()*2.2,0,6.3);x.fill()}x.globalAlpha=1;
  return SP['c'+seed]=c}
 function bush(seed){if(SP['b'+seed])return SP['b'+seed];const c=document.createElement('canvas');c.width=110;c.height=70;const x=c.getContext('2d'),R=rr(seed*13+1);for(let i=0;i<9;i++){const px=20+R()*70,py=40+R()*14,r=14+R()*10;const g=x.createRadialGradient(px-4,py-8,2,px,py,r);g.addColorStop(0,'#8fd06a');g.addColorStop(1,'#2f6a3a');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,6.3);x.fill()}for(let i=0;i<14;i++){x.fillStyle=['#ffd6e3','#fff3a0','#ffffff'][i%3];x.beginPath();x.arc(14+R()*82,26+R()*34,2,0,6.3);x.fill()}return SP['b'+seed]=c}
 function ground(g,wx,sc){/* wx: world x px */}
 // deterministic cherry placement
 const TR=()=>[[DX-23,1.0,1],[DX+10,.75,2],[DX+47,.9,3],[DX-47,.8,4]];
 const BUSH=()=>[DX-26,DX-19,DX-1,DX+5,DX+15,DX+23,DX+36,DX-40];
 const FL=[];for(let i=0;i<46;i++){const r=rr(i*31+5);FL.push([r()*(W-4)+2,r()])}
 function draw(now){if(cur!='plaza')return;const t=now/1000,gy=S*T-cam.y,vw=cv.width/ZM;
  for(const[tx,sc,sd]of TR()){const px=tx*T+T/2-cam.x;if(px<-200||px>vw+200)continue;const s=cherry(sd),sway=Math.sin(t*.8+sd)*.012;
   g.save();g.fillStyle='rgba(10,20,10,.28)';g.beginPath();g.ellipse(px+14,gy,64*sc,8*sc,0,0,6.3);g.fill();g.translate(px,gy);g.transform(1,0,sway,1,0,0);g.scale(sc,sc);g.drawImage(s,-s.width/2,-s.height+8);g.restore()}
  for(const bx of BUSH()){const px=bx*T+T/2-cam.x;if(px<-80||px>vw+80)continue;const s=bush(bx);g.drawImage(s,px-55,gy-62)}
  // flowers: little stems with petals swaying
  for(const[fx,f]of FL){const wx=fx*T,px=wx-cam.x;if(px<-10||px>vw+10)continue;const gx=Math.floor(fx);if(tiles[(S-1)*W+gx])continue;const sw=Math.sin(t*1.6+fx)*2,h=7+f*7,col=['#ff9fbf','#fff1a0','#ffffff','#bfa8ff','#ffb27a'][(fx*3|0)%5];g.strokeStyle='#3f8a45';g.lineWidth=1.4;g.beginPath();g.moveTo(px,gy);g.quadraticCurveTo(px+sw*.4,gy-h*.5,px+sw,gy-h);g.stroke();g.fillStyle=col;g.beginPath();g.arc(px+sw,gy-h,2.4,0,6.3);g.fill();g.fillStyle='#ffe27a';g.beginPath();g.arc(px+sw,gy-h,.9,0,6.3);g.fill()}
  // strings of paper lanterns across the promenade
  const strings=[[DX-21,DX-10],[DX-10,DX+10],[DX+10,DX+16]];
  for(const[a,b]of strings){const ax=a*T+T/2-cam.x,bx2=b*T+T/2-cam.x;if(bx2<-20||ax>vw+20)continue;const ay=(S-3)*T+10-cam.y,n=Math.max(3,(b-a)|0);g.strokeStyle='rgba(40,25,20,.7)';g.lineWidth=1.5;g.beginPath();for(let i=0;i<=24;i++){const u=i/24,xx=ax+(bx2-ax)*u,yy=ay+Math.sin(u*Math.PI)*22;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke();
   for(let i=1;i<n;i++){const u=i/n,xx=ax+(bx2-ax)*u,yy=ay+Math.sin(u*Math.PI)*22+7,fl=.85+.15*Math.sin(t*3+i*2+a),col=i%2?'255,170,80':'255,120,110';g.fillStyle='rgb('+col+')';g.beginPath();g.ellipse(xx,yy,5,6.5,0,0,6.3);g.fill();g.fillStyle='rgba(255,255,230,.7)';g.beginPath();g.ellipse(xx-1.5,yy-2,1.8,2.4,0,0,6.3);g.fill();g.globalCompositeOperation='lighter';const gg=g.createRadialGradient(xx,yy,1,xx,yy,26);gg.addColorStop(0,'rgba('+col+','+(.22+night*.4)*fl+')');gg.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gg;g.fillRect(xx-26,yy-26,52,52);g.globalCompositeOperation='source-over'}}
  // falling blossom petals + night fireflies (deterministic, no state)
  const n=Math.round(26*Math.min(1,OPT.q+.2));for(let i=0;i<n;i++){const ph=(t*.09+i/n)%1,sx=((i*137.5)%100)*T+Math.sin(t*.5+i)*40,px=sx-cam.x,py=gy-330+ph*360+Math.sin(t+i)*10;if(px<-10||px>vw+10)continue;g.save();g.translate(px,py);g.rotate(t*1.4+i);g.globalAlpha=.85*(1-Math.abs(ph-.5)*.5);g.fillStyle=i%3?'#ffc9db':'#fff0f5';g.beginPath();g.ellipse(0,0,3.2,1.8,0,0,6.3);g.fill();g.restore()}
  if(night>.3){const nf=18;g.globalCompositeOperation='lighter';for(let i=0;i<nf;i++){const px=((i*83)%100)*T+Math.sin(t*.7+i*3)*30-cam.x,py=gy-20-(i%5)*18+Math.cos(t*.9+i)*12;if(px<-10||px>vw+10)continue;const a=(.4+.6*Math.sin(t*2+i*1.7)**2)*Math.min(1,(night-.3)*2);const gg=g.createRadialGradient(px,py,0,px,py,9);gg.addColorStop(0,'rgba(230,255,150,'+a+')');gg.addColorStop(1,'rgba(230,255,150,0)');g.fillStyle=gg;g.fillRect(px-9,py-9,18,18)}g.globalCompositeOperation='source-over'}
  // fountain jets
  {const fx=(DX-14)*T+T/2-cam.x;if(fx>-60&&fx<vw+60){const fy=(S-4)*T-cam.y+10;g.strokeStyle='rgba(200,240,255,.65)';g.lineWidth=2;for(let k=-2;k<=2;k++){g.beginPath();const sp=k*.5;for(let u=0;u<=1;u+=.1){const xx=fx+sp*u*46,yy=fy+(-Math.sin(u*3.14)*28+u*u*70)*(1+.1*Math.sin(t*5+k));u?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}}}
 }
 // ----- parallax backdrop (mountains, hills, distant pagoda) painted over the sky -----
 const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),col=c=>'rgb('+c.map(Math.round)+')';
 function ridge(g,w,base,par,amp,fq,seed,c0,c1,snow){const off=cam.x*par;g.beginPath();g.moveTo(0,base+400);for(let x=0;x<=w;x+=8){const u=(x+off)*fq+seed;const y=base-amp*(.55+.28*Math.sin(u)+.17*Math.sin(u*2.3+1.7)+.1*Math.sin(u*5.1));g.lineTo(x,y)}g.lineTo(w,base+400);g.closePath();const gr=g.createLinearGradient(0,base-amp,0,base+20);gr.addColorStop(0,col(c0));gr.addColorStop(1,col(c1));g.fillStyle=gr;g.fill()}
 function backdrop(w,hh,now){if(cur!='plaza')return;const base=S*T-cam.y+6,dk=night,wx=Math.min(1,wxC||0);if(base<-50)return;
  const dim=(c)=>lerp(lerp(c,[200,205,215],wx*.5),[c[0]*.22,c[1]*.25,c[2]*.5],dk*.88),haze=dim([205,225,245]);
  g.save();
  // far snowy peak (cone with snow cap)
  {const px=w*.62-cam.x*.04,top=base-330,r=420;const gr=g.createLinearGradient(0,top,0,base);gr.addColorStop(0,col(dim([180,196,226])));gr.addColorStop(1,col(dim([140,160,205])));g.fillStyle=gr;g.beginPath();g.moveTo(px-r,base+10);g.bezierCurveTo(px-r*.45,base-90,px-60,top+40,px-24,top);g.lineTo(px+24,top);g.bezierCurveTo(px+60,top+40,px+r*.45,base-90,px+r,base+10);g.closePath();g.fill();
   g.fillStyle=col(dim([245,248,255]));g.beginPath();g.moveTo(px-24,top);g.lineTo(px+24,top);g.bezierCurveTo(px+46,top+26,px+70,top+58,px+96,top+84);for(let k=0;k<6;k++)g.lineTo(px+80-k*28,top+70+(k%2?22:-4));g.lineTo(px-96,top+84);g.bezierCurveTo(px-70,top+58,px-46,top+26,px-24,top);g.fill()}
  ridge(g,w,base-10,.07,150,.004,1.3,dim([150,170,214]),haze);
  ridge(g,w,base,.14,120,.006,4.1,dim([118,150,190]),haze);
  // distant pagoda + small gate silhouette on the mid ridge
  {const px=w*.28-cam.x*.2,b=base-84,c=dim([92,112,150]);g.fillStyle=col(c);for(let i=0;i<4;i++){const ww=70-i*13,yy=b-i*30;g.beginPath();g.moveTo(px-ww/2-14,yy);g.quadraticCurveTo(px,yy-18,px+ww/2+14,yy);g.lineTo(px+ww/2,yy+6);g.lineTo(px-ww/2,yy+6);g.closePath();g.fill();g.fillRect(px-ww/2+8,yy+6,ww-16,24)}g.fillRect(px-2,b-128,4,22);
   if(dk>.35){g.fillStyle='rgba(255,210,120,'+(dk-.3)+')';for(let i=0;i<4;i++)g.fillRect(px-4,b-i*30+10,8,10)}}
  ridge(g,w,base+4,.26,95,.009,7.7,dim([84,128,128]),dim([150,190,170]));
  // cypress / pine silhouettes along the near ridge
  {const off=cam.x*.26;g.fillStyle=col(dim([48,92,84]));for(let i=0;i<40;i++){const wx2=((i*173)%(w+400))-200,h2=24+(i*37)%26,xx=((wx2-off*0)%(w+400));const y0=base-70-Math.sin(((xx+off)*.009)+7.7)*40;g.beginPath();g.moveTo(xx,y0);g.lineTo(xx-9,y0+h2);g.lineTo(xx+9,y0+h2);g.closePath();g.fill()}}
  ridge(g,w,base+10,.45,60,.014,2.2,dim([62,112,84]),dim([96,150,100]));
  // haze veil to blend into the ground
  const hz=g.createLinearGradient(0,base-120,0,base+10);hz.addColorStop(0,'rgba(255,255,255,0)');hz.addColorStop(1,col(haze).replace('rgb','rgba').replace(')',',.55)'));g.fillStyle=hz;g.fillRect(0,base-120,w,130);
  g.restore()}
 return{build,draw,backdrop,cherry,TR,S}})();
{const _g=gen;gen=function(){_g();if(cur=='plaza'){try{PLZ7.build()}catch(e){console.error('plaza',e)}}}}
{const _ds=drawSky;drawSky=function(w,hh,now){_ds(w,hh,now);try{PLZ7.backdrop(w,hh,now)}catch(e){}}}
{const _dn=drawNPCs;drawNPCs=function(now){try{PLZ7.draw(now)}catch(e){}return _dn(now)}}
if(cur=='plaza'){try{gen()}catch(e){console.error(e)}}
