// ===== Cosmetic art: Wanderer of Mist (a mysterious traveller: mist grey, ink blue, pale gold, paper and lantern light). Drawn on the in-game body in its own
// cel style; every layer gets the body's live measurements (COS1.H helpers). Body space: feet at 0, facing right (+x is the front), shoulders c.sh (about -37),
// hips c.hip (about -21); the head layer is in head space (head centre c.hy, about -50; face spans x -10..10, y hy-10..hy+12). All four are found by breaking. =====
try{(()=>{const C=COS1,H=C.H,OL=H.OL,TAU=6.2832,PI=3.1416,sin=Math.sin,cos=Math.cos,cl=(v,a,b)=>v<a?a:v>b?b:v;
 const ra=(h,a)=>{const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'};
 const INK='#2f3c62',GOLD='#ecd79c',GOLDD='#b4924f',MIST='#e4eaf2',INK7=ra(INK,.75),INK8=ra(INK,.85),GOLD6=ra(GOLD,.6),GOLD8=ra(GOLD,.8),GOLD9=ra(GOLD,.9);
 // gradients are made once per canvas in a unit box and placed with the transform, so a frame allocates almost nothing
 const GC=new WeakMap(),grad=(g,key,make)=>{let m=GC.get(g);if(!m)GC.set(g,m=new Map());let G=m.get(key);if(!G){G=make();m.set(key,G)}return G};
 const fillIn=(g,G,x,y,sx,sy)=>{g.save();g.translate(x,y);g.scale(sx,sy);g.fillStyle=G;g.fill();g.restore()};
 const lin=(g,key,x0,y0,x1,y1,stops)=>grad(g,key,()=>{const G=g.createLinearGradient(x0,y0,x1,y1);for(let i=0;i<stops.length;i+=2)G.addColorStop(stops[i],stops[i+1]);return G});
 // a soft additive glow (cached radial paint)
 function glow(g,x,y,r,col,a){const G=grad(g,'gl'+col,()=>{const R=g.createRadialGradient(0,0,0,0,0,1);R.addColorStop(0,col);R.addColorStop(1,'rgba(0,0,0,0)');return R});
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=a;g.translate(x,y);g.scale(r,r);g.fillStyle=G;g.beginPath();g.arc(0,0,1,0,TAU);g.fill();g.restore()}
 // tiny parts: one flat fill and an outline (the cel pass is invisible at that size)
 const flat=(g,path,col,lw)=>{path();g.fillStyle=col;g.fill();g.strokeStyle=OL;g.lineWidth=lw;g.stroke()};
 // body space -> head space (the way the game draws the hair: scaled 1.24 about the neck)
 const toHead=(g,c)=>{const b=c.hy+50;g.translate(0,-43+b);g.scale(1.24,1.24);g.translate(0,43-b)};
 // a wisp of mist: a soft head with a tapering tail streaming back (-x); p = its age 0..1 (it stretches, rises and fades)
 function wisp(g,x,y,p,s,a){const k=a*sin(p*PI);if(k<.03)return;const L=(4+p*6)*s,w=(1+p*.8)*s,a0=g.globalAlpha;g.fillStyle=MIST;g.globalAlpha=a0*k*.34;
  g.beginPath();g.moveTo(x,y-w);g.quadraticCurveTo(x-L*.45,y-w*1.5,x-L,y-w*.2-L*.1);g.quadraticCurveTo(x-L*.5,y+w*.4,x,y+w);g.quadraticCurveTo(x+w*1.3,y,x,y-w);g.fill();
  g.globalAlpha=a0*k*.2;g.beginPath();g.ellipse(x-w*.3,y,w*1.7,w*1.15,0,0,TAU);g.fill();g.globalAlpha=a0}

 // ---- Wanderer's Hat (rare): a wide woven straw travelling hat with an ink-blue band and a pale gold tasselled cord, and a sheer veil of mist cloth
 // hanging from the brim (the face shows through it). The brim tips up in the wind when you run; the veil streams back and lifts when you jump.
 const ST='#d9bf87',UNDER='#8f774a',HR=21;
 const hatTilt=c=>.05-cl(c.vx*.0003,-.07,.07)+(c.air?-.05:0)+sin(c.t*2.2)*.012;
 // the veil: from the two brim tips, flaring a little, to a soft scalloped hem; returns its key points for the folds
 function veil(g,c){const hy=c.hy,tl=hatTilt(c),ox=1,oy=hy-11.6,cs=cos(tl)*HR,sn=sin(tl)*HR,x1=ox+cs,y1=oy+sn+.6,x0=ox-cs,y0=oy-sn+.6;
  const sw=H.sw(c),dr=sw*.55,L=hy+13.5+(c.air?-3.2:0)+(c.run?-1:0),xr=x1+1+dr*.7,xl=x0-.8+dr*1.2,n=5;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.quadraticCurveTo(x1+.2+dr*.2,(y1+L)/2,xr,L);
  for(let i=1;i<=n;i++){const u=i/n,x=xr+(xl-xr)*u,xm=xr+(xl-xr)*(u-.5/n);g.quadraticCurveTo(xm,L+2+sin(c.t*2.3+i*1.7)*.7,x,L+(i<n?.2:.6))}
  g.quadraticCurveTo(x0-.2+dr*.5,(y0+L)/2,x0,y0);g.closePath();return[x0,y0,x1,y1,xl,xr,L,dr]}
 function veilFolds(g,v,a){const[x0,y0,x1,y1,xl,xr,L,dr]=v;g.strokeStyle=a;g.lineWidth=.45;g.beginPath();for(let k=1;k<6;k++){const u=k/6,xt=x0+(x1-x0)*u,yt=y0+(y1-y0)*u,xb=xl+(xr-xl)*u;g.moveTo(xt,yt+1.2);g.quadraticCurveTo(xt+dr*.3+(k%2?.6:-.6),(yt+L)/2,xb,L+(k%2?1.6:.8))}g.stroke()}
 C.art('cos_wanderer_hat',{hh:1,
  back(g,c){toHead(g,c);/* the far side of the veil, behind the hair: denser, in shadow */const v=veil(g,c);fillIn(g,lin(g,'vb',0,0,0,1,[0,ra('#b9c3d4',.55),1,ra('#b9c3d4',.22)]),0,v[1],1,v[6]+2-v[1]);veilFolds(g,v,'rgba(80,92,126,.25)')},
  head(g,c){const hy=c.hy,tl=hatTilt(c),R=HR,t=c.t;
   // the brim's shadow across the brow
   g.beginPath();g.rect(-11.5,hy-12,23,9);fillIn(g,lin(g,'bs',0,-12,0,-3,[0,'rgba(28,22,48,.34)',1,'rgba(28,22,48,0)']),0,hy,1,1);
   // the near side of the veil: sheer, so the face shows through; a fine bright hem
   const v=veil(g,c);fillIn(g,lin(g,'vf',0,0,0,1,[0,ra(MIST,.26),1,ra(MIST,.1)]),0,v[1],1,v[6]+2-v[1]);veilFolds(g,v,'rgba(240,244,250,.28)');
   g.strokeStyle='rgba(236,242,250,.55)';g.lineWidth=.55;g.beginPath();g.moveTo(v[5],v[6]);for(let i=1;i<=5;i++){const u=i/5,x=v[5]+(v[4]-v[5])*u,xm=v[5]+(v[4]-v[5])*(u-.1);g.quadraticCurveTo(xm,v[6]+2+sin(t*2.3+i*1.7)*.7,x,v[6]+(i<5?.2:.6))}g.stroke();
   // the hat: brim underside, then the woven crown
   g.translate(1,hy-11.6);g.rotate(tl);
   H.celf(g,()=>{g.beginPath();g.ellipse(0,.4,R+.4,2.5,0,0,TAU)},UNDER,.9);
   const dome=()=>{g.beginPath();g.moveTo(-R,0);g.bezierCurveTo(-13.8,-1.8,-12.6,-17,0,-19.4);g.bezierCurveTo(12.6,-17,13.8,-1.8,R,0);g.quadraticCurveTo(0,2,-R,0);g.closePath()};
   H.celf(g,dome,ST,1.1);
   g.save();dome();g.clip();
   g.strokeStyle='rgba(122,92,46,.4)';g.lineWidth=.45;g.beginPath();for(const y of[-2.2,-9,-13,-16.4]){g.moveTo(-R,y);g.quadraticCurveTo(0,y+2.4,R,y)}
   for(const x of[-15,-8.5,-2,4.5,11,17]){g.moveTo(x*.06,-19.4);g.quadraticCurveTo(x*1.02,-12.5,x*1.12,1.5)}g.stroke();
   // ink-blue band with a thin light edge
   g.fillStyle=INK;g.beginPath();g.moveTo(-R,-3.2);g.quadraticCurveTo(0,-.6,R,-3.2);g.lineTo(R,-6.2);g.quadraticCurveTo(0,-3.6,-R,-6.2);g.closePath();g.fill();
   g.strokeStyle='rgba(150,170,220,.5)';g.lineWidth=.45;g.beginPath();g.moveTo(-R,-5.7);g.quadraticCurveTo(0,-3.1,R,-5.7);g.stroke();
   g.fillStyle='rgba(255,248,220,.32)';g.beginPath();g.ellipse(6.4,-13.4,3.4,1.2,-.55,0,TAU);g.fill();g.restore();
   // a pale gold cord knotted on the band, its little tassel swinging
   const sw=H.sw(c),tx=-11.4,ty=-3.4,ex=tx-1.1+sw*.45,ey=ty+5.2;g.strokeStyle=GOLDD;g.lineWidth=.7;g.lineCap='round';g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx-.9+sw*.2,ty+2.6,ex,ey);g.stroke();
   flat(g,()=>{g.beginPath();g.arc(tx,ty,1.05,0,TAU)},GOLD,.6);
   g.strokeStyle=GOLD;g.lineWidth=.55;g.beginPath();for(const d of[-.7,0,.7]){g.moveTo(ex+d*.6,ey+.6);g.lineTo(ex+d+sw*.12,ey+3.6)}g.stroke();
   flat(g,()=>{g.beginPath();g.ellipse(ex,ey+.4,.95,.75,0,0,TAU)},GOLDD,.5)}});

 // ---- Mistwalker Cloak (very rare): a grey travelling cloak over an ink-blue robe; a petal-pointed capelet with a pale gold toggle at the throat, an ink-blue
 // lining turned back along the opening and piped in pale gold, and a long hem that pales into mist and drifts off behind you in wisps (faster when you run).
 const CK='#8c95a7',CKL='#a7afbe',ROBE='#34446c',OCC='#7d879b';
 const FADE=[[0,ra('#5b6377',1),.3,ra('#5b6377',1),.72,ra('#b4bccb',.5),1,ra(MIST,0)],[0,ra(CK,1),.3,ra(CK,1),.72,ra(MIST,.5),1,ra(MIST,0)],[0,ra(OL,1),.3,ra(OL,1),.72,ra(OL,.25),1,ra(OL,0)]];
 const cw=c=>c.gd==1?11.2:c.gd==2?9.7:10.4,swy=c=>cl(-c.vx*.02,-5,5)+sin(c.t*2.8)*.8;
 // a cel fill that pales into mist between y0 and y1 (dark base, lit shape toward the light, outline); the paints are cached in a 0..100 box
 function celFade(g,path,y0,y1,lw){const s=(y1-y0)/100,q=i=>lin(g,'cf'+i,0,0,0,100,FADE[i]),put=(G,st)=>{g.save();g.translate(0,y0);g.scale(s,s);if(st){g.strokeStyle=G;g.lineWidth=lw/s;g.stroke()}else{g.fillStyle=G;g.fill()}g.restore()};
  path();put(q(0));g.save();path();g.clip();g.translate(1.3,-1);path();put(q(1));g.restore();path();put(q(2),1)}
 function hemWave(g,xa,xb,y,t,k){for(let i=1;i<=3;i++){const x=xa+(xb-xa)*i/3,xm=xa+(xb-xa)*(i-.5)/3;g.quadraticCurveTo(xm,y+2.4+sin(t*2.4+i+k*2)*.9,x,y-(i<3?.5:0))}}
 function hemMist(g,c,x0,x1,y,n,seed,a){const run=c.run?1:0,dx=-(5+cl(c.vx*.03,-9,9));for(let i=0;i<n;i++){const p=(c.t*(.26+run*.24)+i/n+seed)%1,x=x0+(x1-x0)*((i*.618+seed)%1)+dx*p*1.7,yy=y-p*(4+run*2)+sin(c.t*1.7+i*2.1)*.7;wisp(g,x,yy,p,.8+(i%2)*.3,a)}}
 C.art('cos_mist_cloak',{hb:1,oc:OCC,
  back(g,c){const sh=c.sh,hip=c.hip,w=cw(c),fl=cl(-c.vx*.03,-10,10)+sin(c.t*3)*1.4+(c.air?-5:0),hem=-3+(c.air?-4:0);
   /* the look's own short cape is drawn right after this layer and would cover the hem (the look object is fresh each draw) */if(c.L)c.L.cape=0;
   // the long back of the cloak, behind the legs
   celFade(g,()=>{g.beginPath();g.moveTo(-w,sh+1);g.lineTo(w-2,sh+1);g.quadraticCurveTo(w+.5,hip,w+1+fl*.6,hem);hemWave(g,w+1+fl*.6,-w-4+fl*1.3,hem,c.t,2);g.bezierCurveTo(-w-5+fl*.5,hip,-w-2,sh+8,-w,sh+1);g.closePath()},hip-6,hem+1,1.1);
   hemMist(g,c,-w-3+fl,w,hem,2,.13,.95)},
  torso(g,c){const sh=c.sh,hip=c.hip,w=cw(c),sw=swy(c),hem=hip+15.5+(c.air?-3.5:0),t=c.t,rh=hip+9+(c.air?-2:0);
   // the ink-blue robe where the cloak hangs open, a pale gold sash at the waist
   H.celf(g,()=>{g.beginPath();g.moveTo(-2.4,sh+1);g.lineTo(4.4,sh+1);g.lineTo(5.6+sw*.3,rh);g.lineTo(-3.4+sw*.3,rh+.4);g.closePath()},ROBE,.9);
   g.fillStyle=GOLD;g.fillRect(-3,hip-5.8,8.4,1.7);g.strokeStyle=OL;g.lineWidth=.5;g.strokeRect(-3,hip-5.8,8.4,1.7);
   // the two front panels (one path): solid at the chest, paling into mist toward the hem
   celFade(g,()=>{g.beginPath();g.moveTo(-w,sh+1);g.quadraticCurveTo(-w-1.6,(sh+hip)/2,-w-1.2+sw*.4,hip+2);g.lineTo(-w-2.2+sw,hem);hemWave(g,-w-2.2+sw,-2.6+sw*.8,hem,t,0);g.lineTo(-1.9,hip+1);g.lineTo(-1.1,sh+1.4);g.closePath();
    g.moveTo(3.5,sh+1.4);g.lineTo(4.5,hip+1);g.lineTo(5.6+sw*.8,hem);hemWave(g,5.6+sw*.8,w+2.4+sw,hem,t,1);g.lineTo(w+1+sw*.4,hip+2);g.quadraticCurveTo(w+1.6,(sh+hip)/2,w,sh+1);g.closePath()},hip-4,hem+1,1.05);
   // soft folds
   g.strokeStyle='rgba(70,76,98,.35)';g.lineWidth=.6;g.beginPath();g.moveTo(-w+3,sh+10);g.quadraticCurveTo(-w+2,hip-2,-w+1.6+sw*.5,hip+5);g.moveTo(w-2.4,sh+10);g.quadraticCurveTo(w-1.6,hip-2,w-1+sw*.5,hip+5);g.stroke();
   // the ink-blue lining turned back along the opening, piped in pale gold, and a little mist curl embroidered on each panel
   const s4=sw*.4,s3=sw*.33;g.fillStyle=INK;g.beginPath();g.moveTo(-1.1,sh+1.4);g.lineTo(-2.5,sh+1.8);g.lineTo(-3.3,hip+1);g.lineTo(-3.7+s4,hip+7);g.lineTo(-2.2+s3,hip+7);g.lineTo(-1.9,hip+1);g.closePath();
   g.moveTo(3.5,sh+1.4);g.lineTo(4.9,sh+1.8);g.lineTo(5.9,hip+1);g.lineTo(6.4+s4,hip+7);g.lineTo(4.95+s3,hip+7);g.lineTo(4.5,hip+1);g.closePath();g.fill();
   g.strokeStyle=GOLD9;g.lineWidth=.55;g.lineCap='round';g.beginPath();g.moveTo(-2.5,sh+1.8);g.lineTo(-3.3,hip+1);g.lineTo(-3.7+s4,hip+7);g.moveTo(4.9,sh+1.8);g.lineTo(5.9,hip+1);g.lineTo(6.4+s4,hip+7);g.stroke();
   g.strokeStyle=GOLD6;g.lineWidth=.45;g.beginPath();for(const[x,d]of[[w-2.6+s3,1],[-w+2.8+s3,-1]]){const y=hip+4.4;g.moveTo(x-2.4*d,y+.9);g.quadraticCurveTo(x-1*d,y-1.2,x+.4*d,y);g.quadraticCurveTo(x+1*d,y+1,x,y+1.3);g.moveTo(x-2.4*d,y+.9);g.quadraticCurveTo(x-3.6*d,y+1.6,x-4.6*d,y+1.1)}g.stroke();
   hemMist(g,c,-w,w+2,hem,3,.61,.9)},
  front(g,c){const sh=c.sh,w=cw(c),sw=swy(c)*.3,t=c.t,yb=sh+8.4+(c.air?-1.2:0),fl=sin(t*2.6)*.3;
   // the petal-pointed capelet over both shoulders (and over the near arm), open at the throat
   const nx=w+2.8+sw,fx=-w-2.6+sw,cx=1.2+sw*.5;
   const cp=()=>{g.beginPath();g.moveTo(-w-.4,sh+.2);g.quadraticCurveTo(-w*.5,sh-1.5,-1.5,sh-.3);g.lineTo(1.2,sh+3.8);g.lineTo(3.9,sh-.3);g.quadraticCurveTo(w*.6,sh-1.5,w+.6,sh+.2);
    g.quadraticCurveTo(w+2.4,sh+3.2,nx,yb+1+fl);g.quadraticCurveTo(w*.55+1,yb-2.2,cx+.4,yb+2.8-fl);g.quadraticCurveTo(-w*.4,yb-2.2,fx,yb+1.2+fl);g.quadraticCurveTo(-w-2.4,sh+3.2,-w-.4,sh+.2);g.closePath()};
   H.celf(g,cp,CKL,1.05);
   // ink-blue edging and a fine pale gold stitch line along the petals
   const hemL=d=>{g.beginPath();g.moveTo(nx-.3,yb+1+fl-d);g.quadraticCurveTo(w*.55+1,yb-2.2-d,cx+.4,yb+2.8-fl-d);g.quadraticCurveTo(-w*.4,yb-2.2-d,fx+.3,yb+1.2+fl-d)};
   hemL(.5);g.strokeStyle=INK;g.lineWidth=1;g.stroke();hemL(1.9);g.strokeStyle=GOLD8;g.lineWidth=.45;g.stroke();
   // the toggle clasp at the throat
   g.strokeStyle=INK;g.lineWidth=.8;g.beginPath();g.moveTo(-.4,sh+3.4);g.lineTo(2.8,sh+3.4);g.stroke();
   flat(g,()=>{g.beginPath();g.ellipse(-.6,sh+3.4,1.25,1.05,0,0,TAU);g.moveTo(4.25,sh+3.4);g.ellipse(3,sh+3.4,1.25,1.05,0,0,TAU)},GOLD,.6)}});

 // ---- Spirit Lantern (extremely rare): a paper lantern that floats beside your back shoulder on its own (never behind the head). It bobs, trails behind when
 // you run and lags when you jump; its ink-capped paper glows warm around a small spirit flame, sparks drift up from it and a thread of mist follows it.
 const MIST22=ra(MIST,.22),MIST12=ra(MIST,.12);
 C.art('cos_spirit_lantern',{
  back(g,c){const t=c.t,lag=cl(c.vx*.022,-7,7),bx=-21-lag+sin(t*.9)*1.1,by=c.sh-3.6+sin(t*1.7)*1.7+(c.air?3.5:0),rot=sin(t*1.3)*.07+lag*.03,fk=.86+.14*sin(t*9.3)*sin(t*5.1+1);
   glow(g,bx,by+.5,15,'#ffbf62',.32*fk+.12);glow(g,bx,by,7.5,'#ffe2a6',.32*fk);
   // a thread of mist following it
   g.lineCap='round';g.strokeStyle=MIST22;g.lineWidth=1.6;g.beginPath();g.moveTo(bx-1.4,by+6.6);g.bezierCurveTo(bx-4+sin(t*1.9)*1.2,by+10.5,bx-8-lag*.6,by+6.5+sin(t*1.4),bx-12-lag,by+9.5+sin(t*1.6)*1.5);g.stroke();
   g.strokeStyle=MIST12;g.lineWidth=3.2;g.stroke();wisp(g,bx-12-lag*1.1,by+9.5+sin(t*1.6)*1.5,(t*.3)%1,.7,.9);
   // sparks drifting up
   const a0=g.globalAlpha;g.fillStyle='#ffe3a0';for(let i=0;i<4;i++){const p=(t*.42+i/4)%1;g.globalAlpha=a0*sin(p*PI)*.95;g.beginPath();g.arc(bx+sin(p*6+i*2)*2.6-p*lag*.9,by-8-p*14,.8-p*.35,0,TAU);g.fill()}g.globalAlpha=a0;
   g.translate(bx,by);g.rotate(rot);
   // the tassel, swinging under it
   const ts=sin(t*2.1+.6)*1.2-lag*.25;g.strokeStyle=GOLDD;g.lineWidth=.7;g.beginPath();g.moveTo(0,7.4);g.quadraticCurveTo(ts*.4,9,ts*.7,10.4);g.stroke();
   flat(g,()=>{g.beginPath();g.arc(ts*.7,10.6,.9,0,TAU)},GOLD,.5);flat(g,()=>{g.beginPath();g.moveTo(ts*.7-.6,11.2);g.lineTo(ts*1.1+1,15);g.lineTo(ts*1.1-1.6,15);g.closePath()},'#c8463e',.5);
   // the paper body, lit from inside
   const P=()=>{g.beginPath();g.moveTo(-3.1,-6.2);g.bezierCurveTo(-6.6,-5.2,-6.6,5.2,-3.1,6.2);g.lineTo(3.1,6.2);g.bezierCurveTo(6.6,5.2,6.6,-5.2,3.1,-6.2);g.closePath()};
   P();g.fillStyle=grad(g,'lp',()=>{const R=g.createRadialGradient(.4,1,0,0,0,7);R.addColorStop(0,'#fffbe8');R.addColorStop(.5,'#ffd98c');R.addColorStop(1,'#d98a42');return R});g.fill();
   // the spirit flame inside
   const fh=3.4*fk;g.fillStyle='rgba(255,255,244,.9)';g.beginPath();g.moveTo(0,2.8);g.quadraticCurveTo(2.1,1.6,.25,2.6-fh-1.2);g.quadraticCurveTo(-2.1,1.6,0,2.8);g.fill();
   // ribs, and a band of mist waves painted in ink
   g.strokeStyle='rgba(168,96,40,.5)';g.lineWidth=.45;g.beginPath();for(const y of[-4,-1.4,1.4,4]){const hw=5.5-y*y*.07;g.moveTo(-hw,y);g.quadraticCurveTo(0,y+1,hw,y)}g.stroke();
   g.strokeStyle=INK7;g.lineWidth=.55;g.beginPath();g.moveTo(-5.2,3);for(let i=0;i<4;i++){const x=-5.2+i*2.6;g.quadraticCurveTo(x+.65,1.9,x+1.3,3);g.quadraticCurveTo(x+1.95,4.1,x+2.6,3)}g.moveTo(-5.4,-3.2);g.quadraticCurveTo(-4.6,-4.2,-3.8,-3.2);g.quadraticCurveTo(-3,-2.2,-2.2,-3.2);g.stroke();
   P();g.strokeStyle=OL;g.lineWidth=.9;g.stroke();
   // ink-lacquered caps and a little finial
   H.celf(g,()=>{g.beginPath();g.roundRect(-3.7,-7.9,7.4,2.3,.8)},INK,.8);flat(g,()=>{g.beginPath();g.roundRect(-3.3,5.6,6.6,2,.8)},INK,.8);
   flat(g,()=>{g.beginPath();g.moveTo(-1,-7.8);g.quadraticCurveTo(0,-11,1,-7.8);g.closePath()},GOLD,.6)}});

 // ---- Porcelain Mask (mythical): a flawless white porcelain mask worn over the face: sorrowful almond eye-slits, dark with a faint gold light inside, painted
 // ink brows and lash wings, a small rose mouth, and one gold tear under the near eye that glints and sheds tiny gold motes. A pale gold glaze-light sweeps
 // across it now and then and a breath of mist curls from under the jaw. Tied on with ink-blue cords whose tails flutter behind the head.
 const MW='#f8f8fb',GOLD95=ra(GOLD,.95);
 C.art('cos_porcelain_mask',{
  back(g,c){toHead(g,c);const hy=c.hy,sw=H.sw(c),lift=(c.run?-4:0)+(c.air?-2.5:0);
   flat(g,()=>{g.beginPath();for(const k of[0,1]){const ex=-15.6-k*1.2+sw*(.7+k*.15),ey=hy+9.5+k*1.6+lift+sin(c.t*3+k)*.6;g.moveTo(-11.4,hy-1.6);g.quadraticCurveTo(-13.4+sw*.3,hy+3+k,ex,ey);g.lineTo(ex+1.3,ey+.4);g.quadraticCurveTo(-12+sw*.3,hy+3+k,-10.8,hy-.8);g.closePath()}},INK,.6)},
  head(g,c){const hy=c.hy,t=c.t,a0=g.globalAlpha;
   // the cord over the ear and its knot
   g.strokeStyle=INK;g.lineWidth=.9;g.beginPath();g.moveTo(-8.6,hy-1);g.lineTo(-11.2,hy-1.4);g.stroke();flat(g,()=>{g.beginPath();g.arc(-11.6,hy-1.4,1.2,0,TAU)},INK,.6);
   // the mask: its top follows the brow (the fringe tucks behind it), down to a small chin
   const mk=()=>{g.beginPath();g.moveTo(-9.2,hy-3.2);g.bezierCurveTo(-9.6,hy+3,-7,hy+8.6,-2.6,hy+10.5);g.quadraticCurveTo(1.2,hy+12.1,3.6,hy+11.1);g.bezierCurveTo(7.8,hy+8.9,10.2,hy+4.6,10.2,hy-2.2);
    g.bezierCurveTo(10,hy-6.4,7.4,hy-7.8,5.8,hy-7.6);g.quadraticCurveTo(3.2,hy-7.4,1.4,hy-6);g.quadraticCurveTo(-.6,hy-7.6,-3.4,hy-7.6);g.bezierCurveTo(-6.4,hy-7.6,-9,hy-6.2,-9.2,hy-3.2);g.closePath()};
   // porcelain: cool shade on the far side, bright toward the light, a soft shadow under the cheek and down the nose
   mk();g.fillStyle=lin(g,'pm',-9,0,10,0,[0,'#c2c7d5',.3,'#eceef3',.72,MW,1,'#dde0e9']);g.fill();
   g.save();mk();g.clip();g.fillStyle='rgba(118,126,160,.15)';g.beginPath();g.ellipse(-4,hy+8,9,4,.3,0,TAU);g.fill();g.beginPath();g.moveTo(3.2,hy+1);g.quadraticCurveTo(3.4,hy+4.6,4.6,hy+5.6);g.lineTo(3.4,hy+5.8);g.quadraticCurveTo(2.6,hy+3.6,3.2,hy+1);g.fill();
   g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.ellipse(7.4,hy-2.6,1,3,-.2,0,TAU);g.fill();
   // the glaze-light: a pale gold sheen sweeps across now and then
   const sp=(t*.23)%1;if(sp<.4){const u=sp/.4,xc=-14+u*30;g.globalAlpha=a0*sin(u*PI)*.5;g.fillStyle='#fff1c8';g.beginPath();g.moveTo(xc,hy-9);g.lineTo(xc+3.4,hy-9);g.lineTo(xc-2.6,hy+13);g.lineTo(xc-6,hy+13);g.closePath();g.fill();g.globalAlpha=a0}
   // a fine pale gold line just inside the edge
   mk();g.strokeStyle=GOLD95;g.lineWidth=1.2;g.stroke();mk();g.strokeStyle=MW;g.lineWidth=.45;g.stroke();g.restore();
   mk();g.strokeStyle=OL;g.lineWidth=.95;g.stroke();
   // a breath of mist curling away from under the jaw
   for(let i=0;i<2;i++){const p=(t*.3+i*.5)%1;wisp(g,-4.4-p*(5+cl(c.vx*.02,0,6)),hy+10.4-p*5,p,.75,.8)}
   // serene crescent eye-slits (smiling eyes over a weeping tear), dark, with a faint gold light inside
   g.fillStyle='#140e20';g.beginPath();g.moveTo(2.3,hy+1.7);g.quadraticCurveTo(5.5,hy-1.9,8.7,hy+1.5);g.quadraticCurveTo(5.5,hy+.1,2.3,hy+1.7);g.moveTo(-.5,hy+1.6);g.quadraticCurveTo(-3,hy-1.3,-5.5,hy+1.5);g.quadraticCurveTo(-3,hy+.4,-.5,hy+1.6);g.fill();
   const ga=.5+.4*sin(t*1.3);glow(g,5.5,hy+.2,2.6,'#ffd88a',ga*.5);glow(g,-3,hy+.4,2.2,'#ffd88a',ga*.4);g.fillStyle='#ffe4a0';g.globalAlpha=a0*ga;g.beginPath();g.ellipse(5.5,hy+.1,.7,.4,0,0,TAU);g.ellipse(-3,hy+.3,.55,.32,0,0,TAU);g.fill();g.globalAlpha=a0;
   // painted ink: brows (high and sorrowful), lash wings, a small mist curl on the far brow
   g.strokeStyle=INK8;g.lineCap='round';g.lineWidth=.55;g.beginPath();g.moveTo(2.8,hy-3.8);g.quadraticCurveTo(6,hy-4.4,8.6,hy-2.6);g.moveTo(-.4,hy-3.8);g.quadraticCurveTo(-3.2,hy-4.3,-5.4,hy-2.8);
   g.moveTo(8.6,hy+1.6);g.lineTo(9.7,hy+2.5);g.moveTo(-5.4,hy+1.4);g.lineTo(-6.6,hy+2.2);g.moveTo(-7.4,hy-4.6);g.quadraticCurveTo(-6.4,hy-6,-5.2,hy-5.2);g.quadraticCurveTo(-4.6,hy-4.6,-5.4,hy-4.2);g.stroke();
   // a small rose mouth
   g.fillStyle='#b54d5c';g.beginPath();g.moveTo(2.2,hy+8.1);g.quadraticCurveTo(3.4,hy+7.3,4.6,hy+8);g.quadraticCurveTo(3.5,hy+9.2,2.2,hy+8.1);g.fill();
   // the gold tear, and the tiny motes it sheds
   g.beginPath();g.moveTo(5.6,hy+3.1);g.quadraticCurveTo(6.9,hy+5.6,6.3,hy+6.9);g.arc(5.6,hy+6.6,.9,.4,3.4);g.quadraticCurveTo(4.8,hy+5,5.6,hy+3.1);g.closePath();
   fillIn(g,lin(g,'tr',4.8,3,6.8,7.6,[0,'#fff2c4',.6,'#e8c56a',1,'#a87a2a']),0,hy,1,1);g.strokeStyle='#7a5520';g.lineWidth=.4;g.stroke();
   glow(g,5.7,hy+6,5,'#ffd27a',.24+.1*sin(t*2));
   g.fillStyle='#ffe7a8';for(let i=0;i<2;i++){const p=(t*.35+i*.5)%1;g.globalAlpha=a0*sin(p*PI)*.9;g.beginPath();g.arc(5.6+sin(p*5+i*3)*1.4,hy+8+p*7,.5-p*.2,0,TAU);g.fill()}g.globalAlpha=a0;
   // a glint runs over the tear now and then
   const p=(t*.45)%1;if(p<.3){const s=sin(p/.3*PI)*2.6,gx=5.8,gy=hy+5.4;g.fillStyle='rgba(255,252,236,.95)';g.beginPath();g.moveTo(gx,gy-s);g.lineTo(gx+s*.22,gy-s*.22);g.lineTo(gx+s,gy);g.lineTo(gx+s*.22,gy+s*.22);g.lineTo(gx,gy+s);g.lineTo(gx-s*.22,gy+s*.22);g.lineTo(gx-s,gy);g.lineTo(gx-s*.22,gy-s*.22);g.closePath();g.fill()}}});
})()}catch(e){console.error('COS mist',e)}
