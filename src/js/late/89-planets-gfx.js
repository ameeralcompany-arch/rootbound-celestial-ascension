// ===== PLG7: planet graphics for the Star Atlas (world selection). Everything is procedural, nothing is loaded from files. =====
// A planet = a 512x256 surface texture (RGB + a "glow" byte that is not darkened by night) + an optional cloud texture, wrapped on a
// sphere per pixel with typed arrays and drawn into a small canvas. Lighting, atmosphere, rings, moons and orbiting particles are
// layered on top with ordinary 2D canvas calls. Textures are shared per (theme, variant) so many worlds stay cheap.
const PLG7=(()=>{
 let TW=512,TH=256;const TAU=Math.PI*2;
 const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 const clamp=(v,a,b)=>v<a?a:v>b?b:v,sstep=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)};
 const hash=(x,y,s)=>{let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1274126177))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
 function vn(x,y,P,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,x0=((xi%P)+P)%P,x1=(x0+1)%P;
  const a=hash(x0,yi,s),b=hash(x1,yi,s),c=hash(x0,yi+1,s),d=hash(x1,yi+1,s),u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
 function fbm(u,v,F,oct,s){let a=.5,sum=0,f=F,n=0;for(let o=0;o<oct;o++){sum+=a*vn(u*f,v*f*.5,f,s+o*31);n+=a;a*=.5;f*=2}return sum/n}
 function lut(hs){const st=hs.map(hex),n=st.length,L=new Uint8Array(768);for(let i=0;i<256;i++){const t=i/255*(n-1),k=Math.min(n-2,Math.floor(t)),f=t-k;for(let c=0;c<3;c++)L[i*3+c]=st[k][c]+(st[k+1][c]-st[k][c])*f}return L}
 const put=(L,t,o)=>{const i=(t<=0?0:t>=1?255:(t*255)|0)*3;o[0]=L[i];o[1]=L[i+1];o[2]=L[i+2]};
 const mix=(o,r,g,b,a)=>{o[0]+=(r-o[0])*a;o[1]+=(g-o[1])*a;o[2]+=(b-o[2])*a};
 const ridge=n=>1-Math.abs(2*n-1);

 // ---------------------------------------------------------------- themes
 // n: stable number, atm: atmosphere rgb, ai: atmosphere strength, cloud: [threshold, alpha, rgb] or null,
 // fx: orbiting particle kind, moons: [[orbitRadius, size, colour, speed]...], ring: ring spec or null
 let W1=0,W2=0,WH=0; // worley results: nearest distance, second distance, hash of the nearest cell
 function worley(u,v,F,s){const R=F>>1||1,x=u*F,y=v*R,cx=Math.floor(x),cy=Math.floor(y);let d1=9,d2=9,h1=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const gx=cx+dx,gy=cy+dy,wx=((gx%F)+F)%F,px=gx+hash(wx,gy,s),py=gy+hash(wx,gy,s+77),d=Math.hypot(px-x,py-y);if(d<d1){d2=d1;d1=d;h1=hash(wx,gy,s+5)}else if(d<d2)d2=d}
  W1=d1;W2=d2;WH=h1}
 const L={
  vOcean:lut(['#0b3350','#115e78','#1b8f9a','#3fc0b0']),vLand:lut(['#3fae6a','#2a8a55','#1d6a45','#144f36','#6cc57a']),
  bSea:lut(['#56427f','#7c5cab','#a47cc2','#d49bd0']),bLand:lut(['#f9d3e0','#f3a9c6','#e784ab','#c95f8f']),
  fIce:lut(['#2c5a9c','#5b97d4','#9cccf0','#d9eeff']),
  xVoid:lut(['#05020b','#110826','#24114a','#34196a']),
  aSky:lut(['#030a26','#07205e','#123f98','#2260c8']),
  gA:lut(['#120f58','#32198f','#6e30d0','#c13ad0']),gB:lut(['#0a2d66','#1a8fd0','#2ee6ff','#d8ffff']),
  eRock:lut(['#0c0606','#1e0f0c','#32170f','#4a2416']),eLava:lut(['#a01e08','#ff4a1a','#ff9a3a','#ffe08a']),
  tSea:lut(['#06295c','#0d4c8c','#1c78bd','#43acdc']),
  dSand:lut(['#a8682a','#cf8e3c','#eeba6a','#f9e2a8']),
  pBase:lut(['#5fc6b0','#3fa38e','#2b8176','#80d9b8'])};
 const THEMES={
  verdant:{n:1,name:'Verdant Haven',blurb:'Teal seas, emerald forests and plants that glow after dark.',atm:[125,255,210],ai:.9,cloud:[.6,.6,[255,255,255]],fx:'firefly',moons:[[1.55,.2,'#bfe8d8',.35]],ring:null,
   paint(u,v,lat,s,o){const h=fbm(u,v,3,6,s);if(h<.5){put(L.vOcean,h/.5,o);if(h>.47)mix(o,100,230,205,(h-.47)/.03*.7);o[3]=0}
    else{const t=(h-.5)/.5;put(L.vLand,t,o);const f=fbm(u,v,10,3,s+7);if(f>.55)mix(o,8,55,36,sstep(.55,.68,f)*.65);
     o[3]=0;const sp=fbm(u,v,28,2,s+3);if(sp>.64&&f>.5){mix(o,130,255,215,.9);o[3]=170*sstep(.64,.72,sp)}}
    const p=sstep(.86,.95,Math.abs(lat));if(p>0){mix(o,235,248,245,p);o[3]*=1-p}}},
  blossom:{n:2,name:'Cherry Blossom',blurb:'Rose-coloured skies, blossom groves and drifting petals.',atm:[255,170,205],ai:1,cloud:[.6,.55,[255,236,244]],fx:'petal',moons:[[1.6,.17,'#ffd9e8',.4]],ring:null,
   paint(u,v,lat,s,o){const h=fbm(u,v,3,6,s);if(h<.52){put(L.bSea,h/.52,o);if(h>.49)mix(o,250,215,235,(h-.49)/.03*.6);o[3]=0}else{put(L.bLand,(h-.52)/.48,o);const f=fbm(u,v,9,4,s+5);if(f>.52)mix(o,225,90,150,sstep(.52,.66,f)*.75);
     const sp=fbm(u,v,30,2,s+4);o[3]=0;if(sp>.62&&f>.5){mix(o,255,245,250,.85);o[3]=70}}
    const p=sstep(.86,.95,Math.abs(lat));if(p>0){mix(o,255,246,240,p);o[3]*=1-p}}},
  frost:{n:3,name:'Frostbound',blurb:'Pale crystalline ice fields lit by a cold, quiet glow.',atm:[185,230,255],ai:.8,cloud:[.68,.4,[236,246,255]],fx:'snow',moons:[[1.5,.14,'#dff1ff',.3]],ring:null,
   paint(u,v,lat,s,o){const wp=fbm(u,v,6,3,s+3);worley(u+.07*wp,v+.04*wp,20,s);const gap=W2-W1,pl=WH,h=fbm(u,v,4,5,s+1);put(L.fIce,.02+pl*.4+h*.45,o);o[3]=0;
    if(gap<.075){const k=1-gap/.075;mix(o,30,70,140,k*.8);mix(o,150,235,255,Math.max(0,k-.6)*.9);o[3]=Math.max(0,k-.5)*90}
    const pc=sstep(.6,.82,Math.abs(lat));mix(o,246,251,255,pc*.85)}},
  void:{n:4,name:'Void Expanse',blurb:'Dark violet stone split by glowing fissures.',atm:[150,90,255],ai:.55,cloud:null,fx:'shard',moons:[],ring:null,
   paint(u,v,lat,s,o){const w=fbm(u,v,6,3,s+9);worley(u+.09*w,v+.05*w,18,s);const gap=W2-W1,h=fbm(u,v,4,5,s);put(L.xVoid,h*.8+WH*.25,o);o[3]=0;
    if(gap<.055){const k=1-gap/.055;mix(o,200,120,255,k);o[3]=70+k*185}else if(gap<.13){mix(o,100,50,180,(1-(gap-.055)/.075)*.35)}
    if(hash(Math.floor(u*300),Math.floor(v*150),s)>.996){mix(o,235,210,255,.9);o[3]=170}}},
  astral:{n:5,name:'Astral Frontier',blurb:'Deep-blue plains studded with luminous crystals.',atm:[95,170,255],ai:.9,cloud:null,fx:'twinkle',moons:[],ring:{c:'#9fd2ff',w:.34,t:-.35,gap:.5},
   paint(u,v,lat,s,o){const h=fbm(u,v,3,6,s);put(L.aSky,h,o);o[3]=0;worley(u,v,16,s+2);if(WH>.62&&W1<.3){const k=sstep(.3,.04,W1);mix(o,120,230,255,k*.85);o[3]=k*190}
    const g2=fbm(u,v,7,3,s+3);if(g2>.6)mix(o,30,110,200,sstep(.6,.72,g2)*.5);
    if(hash(Math.floor(u*320),Math.floor(v*160),s+1)>.995){mix(o,255,255,255,.95);o[3]=200}}},
  galaxy:{n:6,name:'Galaxy Core',blurb:'A swirling nebula of violet, cyan and magenta.',atm:[190,120,255],ai:1,cloud:[.5,.8,[120,230,255]],fx:'star',moons:[],ring:null,
   paint(u,v,lat,s,o){const w=fbm(u+.22*fbm(u,v,3,3,s+9),v+.22*fbm(u+.3,v,3,3,s+19),3,6,s);put(L.gA,w*1.3-.05,o);const b=fbm(u+.12*w,v,5,5,s+21);
    if(b>.5){const k=sstep(.5,.72,b),q=[0,0,0];put(L.gB,(b-.5)*2.2,q);mix(o,q[0],q[1],q[2],k*.85)}
    o[3]=40+w*70;if(hash(Math.floor(u*320),Math.floor(v*160),s)>.995){mix(o,255,255,255,1);o[3]=230}}},
  ember:{n:7,name:'Ember Reach',blurb:'Black basalt with rivers of molten light.',atm:[255,140,80],ai:.8,cloud:[.62,.4,[100,45,34]],fx:'ember',moons:[[1.5,.13,'#5a2f26',.5]],ring:null,
   paint(u,v,lat,s,o){const w=fbm(u,v,6,3,s+9);worley(u+.09*w,v+.05*w,16,s);const gap=W2-W1,h=fbm(u,v,4,5,s);put(L.eRock,h*.9+WH*.35,o);o[3]=0;
    if(gap<.085){const k=1-gap/.085,q=[0,0,0];put(L.eLava,.2+k*.75,q);mix(o,q[0],q[1],q[2],Math.min(1,k*1.5));o[3]=90+k*165}
    const sea=fbm(u,v,3,4,s+31);if(sea<.3){const k=sstep(.3,.2,sea),q=[0,0,0];put(L.eLava,.3+k*.5,q);mix(o,q[0],q[1],q[2],.95);o[3]=170}}},
  tidal:{n:8,name:'Tidal Veil',blurb:'An ocean world of bright shallows and tiny island chains.',atm:[110,215,255],ai:1,cloud:[.62,.5,[255,255,255]],fx:'bubble',moons:[[1.5,.17,'#cfe6f2',.45],[2.0,.1,'#e8dcc8',.28]],ring:null,
   paint(u,v,lat,s,o){const h=fbm(u,v,4,6,s),band=Math.sin(lat*8+h*5)*.05;put(L.tSea,h*.9+band+.05,o);o[3]=0;
    if(h>.6){const k=sstep(.6,.63,h);mix(o,238,222,160,k);if(h>.655)mix(o,70,170,100,sstep(.655,.69,h)*.9)}
    else if(h>.55)mix(o,170,240,250,sstep(.55,.6,h)*.75)}},
  dune:{n:9,name:'Aurelian Dunes',blurb:'Golden ridges, hot haze and a few secret oases.',atm:[255,212,138],ai:.85,cloud:[.66,.35,[255,236,200]],fx:'sand',moons:[[1.5,.12,'#d9b27a',.5],[1.95,.09,'#b88a58',.3]],ring:null,
   paint(u,v,lat,s,o){const w=fbm(u,v,3,5,s),b=Math.sin(v*50+w*11+Math.sin(u*TAU*3)*1.4)*.5+.5;put(L.dSand,b*.62+w*.5,o);o[3]=0;
    const k=fbm(u,v,6,4,s+2);if(k>.58)mix(o,110,62,36,sstep(.58,.72,k)*.6);
    const oz=fbm(u,v,24,2,s+8);if(oz>.7){mix(o,28,190,170,sstep(.7,.76,oz));o[3]=70}}},
  plaza:{n:10,name:'Lumen Plaza',blurb:'The shared hub: lantern light, a pond and the Lumen crystal.',atm:[255,225,150],ai:1,cloud:[.62,.5,[255,250,235]],fx:'lantern',moons:[[1.55,.16,'#fff1c8',.4]],ring:{c:'#ffd877',w:.22,t:.28,gap:0},
   paint(u,v,lat,s,o){const h=fbm(u,v,3,6,s);put(L.pBase,h,o);o[3]=0;const wv=fbm(u,v,5,3,s+3),gx=Math.abs(((u*12+wv*.8)%1)-.5),gy=Math.abs(((v*6+wv*.5)%1)-.5);
    if(gx>.492||gy>.494){mix(o,255,215,120,.7);o[3]=90}}}};
 const ORDER=['verdant','blossom','frost','void','astral','galaxy','ember','tidal','dune'];
 // which in-world sky (ENV7) each theme starts with. Others keep the natural skies.
 const SKY={blossom:'blossom',astral:'space',galaxy:'galaxy'},SKY2THEME={blossom:'blossom',space:'astral',galaxy:'galaxy'};

 // ---------------------------------------------------------------- textures (built a few rows per frame so nothing stalls)
 const texCache=new Map(),jobs=[];
 function dot(tex,x,y,r,rgb,glow){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const d=Math.hypot(dx,dy);if(d>r+.2)continue;const a=1-d/(r+1),yy=y+dy;if(yy<0||yy>=TH)continue;const xx=((x+dx)%TW+TW)%TW,i=yy*TW+xx,c=tex[i];
   const R=(c&255)+(rgb[0]-(c&255))*a,G=((c>>8)&255)+(rgb[1]-((c>>8)&255))*a,B=((c>>16)&255)+(rgb[2]-((c>>16)&255))*a,A=Math.max(c>>>24,glow*a);tex[i]=((A&255)<<24|(B&255)<<16|(G&255)<<8|(R&255))>>>0}}
 function startTex(id,variant,hi){const T=THEMES[id],s=(variant*7919+T.n*104729)|0,w=hi?512:256,h=w>>1;return{id,variant,hi:!!hi,s,T,y:0,tex:new Uint32Array(w*h),cl:T.cloud?new Uint8Array(w*h):null,TW:w,TH:h,o:[0,0,0,0],done:false,used:0}}
 function stepTex(j,ms){const t0=performance.now(),{T,s,tex,cl,o}=j;TW=j.TW;TH=j.TH;
  while(j.y<TH){const y=j.y++,v=(y+.5)/TH,lat=(v-.5)*2;for(let x=0;x<TW;x++){const u=x/TW;T.paint(u,v,lat,s,o);
    const d=.84+.32*fbm(u,v,22,2,s+55);o[0]*=d;o[1]*=d;o[2]*=d;
    tex[y*TW+x]=((clamp(o[3],0,255)|0)<<24|(clamp(o[2],0,255)|0)<<16|(clamp(o[1],0,255)|0)<<8|(clamp(o[0],0,255)|0))>>>0;
    if(cl){const f=fbm(u,v,5,4,s+101),c=clamp((f-T.cloud[0])/(1-T.cloud[0])*2.4,0,1);cl[y*TW+x]=c*c*(3-2*c)*255*T.cloud[1]}}
   if(performance.now()-t0>ms)return false}
  finishTex(j);return true}
 function blur(tex){const c=new Uint8Array(tex.buffer),n=TW*TH,t=new Uint8Array(n*4);for(let pass=0;pass<2;pass++){const src=pass?t:c,dst=pass?c:t;
   for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x,a=pass?((y?y-1:y)*TW+x):(y*TW+((x+TW-1)%TW)),b=pass?((y<TH-1?y+1:y)*TW+x):(y*TW+((x+1)%TW));for(let k=0;k<4;k++)dst[i*4+k]=(src[a*4+k]+2*src[i*4+k]+src[b*4+k])>>2}}}
 function finishTex(j){const{id,tex,s}=j;TW=j.TW;TH=j.TH;const K=TW/512,Y=TH/256;blur(tex);const R=(()=>{let q=s>>>0||1;return()=>(q=(Math.imul(q,1664525)+1013904223)>>>0)/4294967296})();
  if(id=='astral'){for(let k=0;k<4;k++){let px=R()*TW,py=(40+R()*170)*Y;const pts=[];for(let q=0;q<5;q++){px+=(R()-.3)*34*K;py+=(R()-.5)*26*Y;pts.push([px|0,py|0])}
    for(let q=0;q<pts.length;q++){dot(tex,pts[q][0],pts[q][1],K>.6?2:1,[220,245,255],255);if(q){const a=pts[q-1],b=pts[q],n=Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1])|0);for(let w=0;w<=n;w++)dot(tex,(a[0]+(b[0]-a[0])*w/n)|0,(a[1]+(b[1]-a[1])*w/n)|0,0,[170,225,255],150)}}}}
  if(id=='verdant'||id=='blossom'){for(let k=0;k<26;k++)dot(tex,R()*TW|0,(30+R()*196)*Y|0,1+(R()*2|0),id=='verdant'?[150,255,210]:[255,250,252],id=='verdant'?150:60)}
  if(id=='plaza'){for(let k=0;k<70;k++)dot(tex,R()*TW|0,(30+R()*196)*Y|0,1,[255,226,150],200)}
  if(id=='frost'){for(let k=0;k<30;k++)dot(tex,R()*TW|0,(20+R()*216)*Y|0,1,[235,250,255],110)}
  j.done=true;j.used=performance.now();const key=id+':'+j.variant+':'+(j.hi?1:0);texCache.set(key,j);
  if(texCache.size>18){let old=null,ok=null;for(const[k,v]of texCache)if(k!=key&&(!old||v.used<old.used)){old=v;ok=k}if(ok)texCache.delete(ok)}}
 function getTex(id,variant,hi){const t=(hi&&texCache.get(id+':'+variant+':1'))||texCache.get(id+':'+variant+':0')||texCache.get(id+':'+variant+':1');if(t)t.used=performance.now();return t||null}
 function want(id,variant,hi){const lo=texCache.has(id+':'+variant+':0');const tier=lo&&hi?1:0;if(texCache.has(id+':'+variant+':'+tier)||jobs.some(j=>j.id==id&&j.variant==variant&&j.hi==!!tier))return;if(hi&&!lo&&texCache.has(id+':'+variant+':1'))return;const j=startTex(id,variant,tier);tier?jobs.push(j):jobs.unshift(j)}
 function pump(ms){if(!jobs.length)return;if(stepTex(jobs[0],ms))jobs.shift()}
 function buildTex(id,variant,hi){let t=getTex(id,variant,hi);if(t&&(!hi||t.hi))return t;const i=jobs.findIndex(j=>j.id==id&&j.variant==variant&&j.hi==!!hi);const j=i>=0?jobs.splice(i,1)[0]:startTex(id,variant,hi);stepTex(j,1e9);return texCache.get(id+':'+variant+':'+(hi?1:0))}

// ---------------------------------------------------------------- sphere renderer
 const geoCache=new Map();
 function geo(N,tilt){const key=N+'|'+tilt.toFixed(2);let g=geoCache.get(key);if(g)return g;
  const n=N*N,uB=new Float32Array(n),vR=new Float32Array(n),lit=new Uint8Array(n),atm=new Uint8Array(n),msk=new Uint8Array(n),R=N/2,ca=Math.cos(tilt),sa=Math.sin(tilt);
  let lx=-.55,ly=-.5,lz=.67;const ll=Math.hypot(lx,ly,lz);lx/=ll;ly/=ll;lz/=ll;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,px=(x+.5-R)/R,py=(y+.5-R)/R,r2=px*px+py*py;if(r2>1)continue;const pz=Math.sqrt(1-r2);msk[i]=1;
   const bx=px*ca+py*sa,by=-px*sa+py*ca,lon=Math.atan2(bx,pz),lat=Math.asin(clamp(by,-1,1));uB[i]=lon/TAU+.5;vR[i]=clamp(lat/Math.PI+.5,0,.9999);
   const d=px*lx+py*ly+pz*lz;lit[i]=clamp(Math.round((.16+.84*sstep(-.22,.78,d))*255),0,255);atm[i]=clamp(Math.round(Math.pow(1-pz,2.3)*255*(.35+.65*sstep(-.5,.6,d))),0,255)}
  g={uB,vR,lit,atm,msk,N};geoCache.set(key,g);if(geoCache.size>40)geoCache.delete(geoCache.keys().next().value);return g}
 // out: ImageData(N,N). rot / crot are turns (0..1). aRGB atmosphere colour, aI strength 0..1.5. veil 0..1 dims & cools an unexplored planet.
 function render(out,g,tx,rot,crot,T,aI,veil){const N=g.N,o32=new Uint32Array(out.data.buffer),tex=tx.tex,cl=tx.cl,tw=tx.TW,th=tx.TH,sh=(rot*tw)|0,ch=(crot*tw)|0,M=tw-1,uB=g.uB,vR=g.vR,lit=g.lit,atm=g.atm,msk=g.msk;
  const ar=T.atm[0],ag=T.atm[1],ab=T.atm[2],ca=T.cloud?T.cloud[1]:0,cr=T.cloud?T.cloud[2][0]:0,cg=T.cloud?T.cloud[2][1]:0,cb=T.cloud?T.cloud[2][2]:0,ai=Math.min(255,aI*T.ai*255*.62)|0,vl=veil||0;
  for(let i=0,n=N*N;i<n;i++){if(!msk[i]){o32[i]=0;continue}
   const row=((vR[i]*th)|0)*tw,ui=(uB[i]*tw)|0,c=tex[row+((ui+sh)&M)];let r=c&255,gg=(c>>8)&255,b=(c>>16)&255;const gl=c>>>24;
   const l=lit[i];r=r*l>>8;gg=gg*l>>8;b=b*l>>8;
   if(gl){r+=((c&255)-r)*gl>>8;gg+=(((c>>8)&255)-gg)*gl>>8;b+=(((c>>16)&255)-b)*gl>>8}
   if(cl){let a=cl[row+((ui+ch)&M)];if(a){a=a*(.35+l/400)|0;const cc=l+40>255?255:l+40;r+=((cr*cc>>8)-r)*a>>8;gg+=((cg*cc>>8)-gg)*a>>8;b+=((cb*cc>>8)-b)*a>>8}}
   const t=atm[i]*ai>>8;if(t){r+=(ar-r)*t>>8;gg+=(ag-gg)*t>>8;b+=(ab-b)*t>>8}
   if(vl){const m=(r+gg+b)/3;r=r+(m*.6+22-r)*vl*.6;gg=gg+(m*.7+30-gg)*vl*.6;b=b+(m*1.0+52-b)*vl*.6}
   o32[i]=0xff000000|((b>255?255:b)<<16)|((gg>255?255:gg)<<8)|(r>255?255:r)}}

 // ---------------------------------------------------------------- backdrop
 const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 let neb=null,bg=null,stars=null,dust=null;
 function buildBackdrop(low){const mk=(seed,cols)=>{const c=document.createElement('canvas');c.width=low?480:800;c.height=low?270:450;const x=c.getContext('2d'),r=rng(seed);x.fillStyle='#04030c';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='lighter';
   for(let i=0;i<14;i++){const cx=r()*c.width,cy=r()*c.height,rad=70+r()*190,col=cols[i%cols.length],g=x.createRadialGradient(cx,cy,0,cx,cy,rad);g.addColorStop(0,'rgba('+col+',.30)');g.addColorStop(.5,'rgba('+col+',.10)');g.addColorStop(1,'rgba('+col+',0)');x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2)}return c};
  neb=[mk(11,['70,40,150','30,70,150','150,40,120','20,110,130']),mk(29,['90,50,170','20,90,160','40,140,150'])];
  const r=rng(77),n=low?90:200;stars=[];for(let i=0;i<n;i++)stars.push({x:r(),y:r(),s:.5+r()*1.6,l:r()<.55?0:r()<.7?1:2,p:r()*6.28,f:.6+r()*1.8,c:r()<.18?'255,214,190':r()<.4?'190,215,255':'255,255,255'});
  dust=[];for(let i=0;i<(low?12:34);i++)dust.push({x:r(),y:r(),s:.4+r()*1.2,v:.004+r()*.012,p:r()*6.28})}
 function disposeBackdrop(){neb=stars=dust=bg=null}
 function mkBg(W,H){const mw=Math.ceil(W*1.1),mh=Math.ceil(H*1.1),c=document.createElement('canvas');c.width=mw;c.height=mh;const x=c.getContext('2d');x.fillStyle='#05040d';x.fillRect(0,0,mw,mh);
  for(let k=0;k<2;k++){const sc=Math.max(mw/neb[k].width,mh/neb[k].height),w=neb[k].width*sc,h=neb[k].height*sc;x.globalAlpha=k?.55:.95;x.drawImage(neb[k],(mw-w)/2,(mh-h)/2,w,h)}bg={c,w:W,h:H,mw,mh}}
 // cam: {x,y} world position of the view centre; px,py: parallax offsets in pixels
 function drawBackdrop(g,W,H,t,px,py,calm,glow){if(!neb)return;
  if(!bg||bg.w!=W||bg.h!=H)mkBg(W,H);const mx=(bg.mw-W)/2,my=(bg.mh-H)/2;g.drawImage(bg.c,-mx+clamp(px*.03,-mx,mx),-my+clamp(py*.03,-my,my));
  g.globalAlpha=1;
  if(glow){const gr=g.createRadialGradient(glow.x,glow.y,0,glow.x,glow.y,glow.r);gr.addColorStop(0,'rgba('+glow.c+','+glow.a+')');gr.addColorStop(1,'rgba('+glow.c+',0)');g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}
  const par=[.02,.05,.1];
  for(const s of stars){const f=par[s.l],x=(((s.x*W*1.2-px*f)%(W*1.2))+W*1.2)%(W*1.2)-W*.1,y=(((s.y*H*1.2-py*f)%(H*1.2))+H*1.2)%(H*1.2)-H*.1,tw=calm?.8:.55+.45*Math.sin(t*s.f+s.p);
   g.fillStyle='rgba('+s.c+','+(tw*(.45+s.l*.22)).toFixed(2)+')';const z=s.s*(1+s.l*.35);g.fillRect(x,y,z,z);
   if(s.l==2&&s.s>1.5){g.fillStyle='rgba('+s.c+','+(tw*.25).toFixed(2)+')';g.fillRect(x-3,y+z/2-.4,z+6,.8);g.fillRect(x+z/2-.4,y-3,.8,z+6)}}
  g.fillStyle='rgba(210,200,255,.22)';for(const d of dust){const x=(((d.x*W+Math.sin(t*d.v*40+d.p)*14-px*.14)%W)+W)%W,y=(((d.y*H-(calm?0:t*d.v*H)-py*.14)%H)+H)%H;g.beginPath();g.arc(x,y,d.s,0,TAU);g.fill()}}

 // ---------------------------------------------------------------- orbiting bits (drawn around a planet, behind or in front of it)
 function drawBit(g,kind,x,y,sz,a,t,k){
  g.save();g.translate(x,y);
  switch(kind){
   case'petal':g.rotate(a*2+k);g.fillStyle='rgba(255,170,205,.9)';g.beginPath();g.ellipse(0,0,sz*1.5,sz*.8,0,0,TAU);g.fill();break;
   case'shard':g.rotate(a*3+k);g.fillStyle='rgba(196,120,255,.85)';g.beginPath();g.moveTo(0,-sz*2);g.lineTo(sz*.8,0);g.lineTo(0,sz*2);g.lineTo(-sz*.8,0);g.closePath();g.fill();break;
   case'snow':g.fillStyle='rgba(240,250,255,.9)';g.beginPath();g.arc(0,0,sz*.8,0,TAU);g.fill();break;
   case'ember':g.fillStyle='rgba(255,'+(130+80*Math.sin(t*3+k)|0)+',60,.9)';g.beginPath();g.arc(0,0,sz*.7,0,TAU);g.fill();break;
   case'twinkle':{const s=sz*(1.2+.8*Math.sin(t*4+k));g.fillStyle='rgba(190,235,255,.9)';g.fillRect(-s,-.5,s*2,1);g.fillRect(-.5,-s,1,s*2);g.beginPath();g.arc(0,0,sz*.5,0,TAU);g.fill();break}
   case'star':g.fillStyle='rgba(255,'+(200+55*Math.sin(k)|0)+',255,.95)';g.beginPath();g.arc(0,0,sz*.7,0,TAU);g.fill();break;
   case'bubble':g.strokeStyle='rgba(200,240,255,.85)';g.lineWidth=1;g.beginPath();g.arc(0,0,sz,0,TAU);g.stroke();break;
   case'sand':g.fillStyle='rgba(255,226,160,.75)';g.fillRect(-sz*1.6,-.5,sz*3.2,1.2);break;
   case'lantern':g.fillStyle='rgba(255,214,120,.95)';g.beginPath();g.arc(0,0,sz*.8,0,TAU);g.fill();break;
   default:g.fillStyle='rgba(170,255,210,'+(.55+.45*Math.sin(t*2.5+k)).toFixed(2)+')';g.beginPath();g.arc(0,0,sz*.7,0,TAU);g.fill()}
  g.restore()}
 // little shaded moon sprite
 const moonCache={};
 function moonSprite(col){let c=moonCache[col];if(c)return c;c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(22,20,2,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.25,col);g.addColorStop(1,'#10101c');x.beginPath();x.arc(32,32,31,0,TAU);x.fillStyle=g;x.fill();
  x.globalCompositeOperation='source-atop';x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<5;i++){x.beginPath();x.arc(14+i*9%40,18+i*13%34,3+i%3,0,TAU);x.fill()}return moonCache[col]=c}
 function dispose(){jobs.length=0;texCache.clear();geoCache.clear();disposeBackdrop();for(const k in moonCache)delete moonCache[k]}
 return{THEMES,ORDER,SKY,SKY2THEME,getTex,buildTex,want,pump,geo,render,buildBackdrop,drawBackdrop,disposeBackdrop,drawBit,moonSprite,dispose,hash,rng,fbm}})();
