// ===== Cosmetic art: Mochi Dreams (cute). Drawn on the in-game body in its own cel style; every layer gets the body's live measurements (COS1.H helpers).
// Body space: feet at 0, facing right (+x is the front), shoulders c.sh (about -37), hips c.hip (about -21), torso about 19 wide; the head layer is in
// head space (head centre c.hy, about -50; face spans x -10..10, y hy-10..hy+12). =====
try{(()=>{const C=COS1,H=C.H,TAU=6.2832,sin=Math.sin;
 // ---- Cat-Ear Hoodie: oversized pastel hoodie, hood up with two cat ears, a kangaroo pocket with paw prints, drawstrings that swing
 const HP='#f7c6d9',HD='#e7a9c0',HL='#fff0f6';
 C.art('cos_cat_hoodie',{hb:1,hh:1,oc:HP,
  back(g,c){/* the hood's back, behind the hair */g.save();g.translate(0,-43);g.scale(1.24,1.24);g.translate(0,43);H.celf(g,()=>{g.beginPath();g.ellipse(-1.5,c.hy-3.5,15,18.4,0,0,TAU)},HD,1.1);g.restore()},
  torso(g,c){const sh=c.sh,hip=c.hip,w=c.gd==1?11.6:c.gd==2?10.2:10.9;
   H.celf(g,()=>{g.beginPath();g.moveTo(-w,sh+1);g.quadraticCurveTo(-w-1.6,(sh+hip)/2,-w+.4,hip+3);g.lineTo(-w+1,hip+6);g.lineTo(w-1,hip+6);g.lineTo(w-.4,hip+3);g.quadraticCurveTo(w+1.6,(sh+hip)/2,w,sh+1);g.closePath()},HP,1.1);
   g.fillStyle=HD;g.fillRect(-w+1,hip+3.6,2*w-2,2.6);g.strokeStyle=H.OL;g.lineWidth=.7;g.strokeRect(-w+1,hip+3.6,2*w-2,2.6);
   // kangaroo pocket with two paw prints
   H.celf(g,()=>{g.beginPath();g.moveTo(-6,hip-5);g.lineTo(6,hip-5);g.lineTo(7.5,hip+2);g.lineTo(-7.5,hip+2);g.closePath()},HD,.8);
   g.fillStyle=HL;for(const s of[-3.2,3.2]){g.beginPath();g.arc(s,hip-1.4,1.2,0,TAU);g.fill();for(let i=0;i<3;i++){g.beginPath();g.arc(s-1.3+i*1.3,hip-3.2,.5,0,TAU);g.fill()}}
   // drawstrings, swinging with your movement
   const sw=H.sw(c);g.strokeStyle=HL;g.lineWidth=.9;g.lineCap='round';for(const s of[-2.2,2.2]){g.beginPath();g.moveTo(s,sh+2);g.quadraticCurveTo(s+sw*.3,sh+6,s+sw*.6,sh+9);g.stroke();g.fillStyle=HL;g.beginPath();g.arc(s+sw*.6,sh+9.4,.8,0,TAU);g.fill()}},
  head(g,c){const hy=c.hy;/* the hood framing the face, with two cat ears */
   /* a puffy hood: tall enough to cover any hairstyle's spikes, open around the face */const ring=()=>{g.beginPath();g.ellipse(-.6,hy-4.5,15.2,19,0,Math.PI*.9,Math.PI*2.1);g.ellipse(.4,hy-.6,11.2,11.4,0,Math.PI*2.06,Math.PI*.94,true);g.closePath()};
   H.celf(g,ring,HP,1.1);
   for(const s of[-1,1]){const ex=s*7.8-.4,ey=hy-19.6,tw=sin(c.t*3.1+s)*.35;H.celf(g,()=>{g.beginPath();g.moveTo(ex-4.2,ey+3.4);g.quadraticCurveTo(ex-2+tw,ey-5,ex+.6+tw,ey-6.4);g.quadraticCurveTo(ex+2.6,ey-2,ex+4.2,ey+3);g.closePath()},HP,1);g.fillStyle='#ff9ec0';g.beginPath();g.moveTo(ex-2.2,ey+2.2);g.quadraticCurveTo(ex-.8+tw,ey-2.4,ex+.5+tw,ey-3.6);g.quadraticCurveTo(ex+1.6,ey-.6,ex+2.4,ey+2);g.closePath();g.fill()}}});
 // ---- Big Ribbon: a satin bow at the back of the head; its tails bounce when you run and lift when you jump
 const RB='#ff6f9e',RD='#d9477a';
 C.art('cos_ribbon_bow',{
  head(g,c){const hy=c.hy,x0=-8.2,y0=hy-11,b=sin(c.t*7)*(c.run?.6:.15),lift=c.air?-2.4:0;
   for(const s of[-1,1])H.celf(g,()=>{g.beginPath();g.moveTo(x0,y0);g.bezierCurveTo(x0+s*1+(s<0?-7:3),y0-7+b,x0+s*7+(s<0?-4:2),y0-1+b,x0+(s<0?-1.4:1.4),y0+1.6);g.closePath()},RB,1);
   const sw=H.sw(c);for(const s of[-1,1])H.celf(g,()=>{g.beginPath();g.moveTo(x0-.6,y0+1);g.quadraticCurveTo(x0-2+s*1.4+sw*.4,y0+5+lift,x0-2.6+s*2.6+sw*.8,y0+9+lift);g.lineTo(x0-.4+s*2.2+sw*.8,y0+8.4+lift);g.quadraticCurveTo(x0+s*.6,y0+4,x0+.6,y0+1);g.closePath()},RD,.9);
   H.celf(g,()=>{g.beginPath();g.ellipse(x0,y0+.4,1.9,2.2,0,0,TAU)},RD,.9);g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x0-3,y0-3+b,1.4,.7,-.6,0,TAU);g.fill()}});
 // ---- shared bits for the pieces below
 const abs=Math.abs,cos=Math.cos,PI=Math.PI,cl=(v,a,b)=>v<a?a:v>b?b:v,ss=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
 // the head's own space (60-char.js scales the head 1.24 about a pivot 7 below its centre); for pieces drawn on body layers
 const inHead=(g,c)=>{const p=c.hy+7;g.translate(0,p);g.scale(1.24,1.24);g.translate(0,-p)};
 // fluff, pompoms and frills: circles [x,y,r,...] as one soft shape (outline first, so the fill hides the seams), then its lit side
 const SHC=new Map(),shd=(c,k)=>{const q=c+k;let v=SHC.get(q);if(!v){v=H.shade(c,k);SHC.set(q,v)}return v};
 const dots=(g,P)=>{g.beginPath();for(let i=0;i<P.length;i+=3){g.moveTo(P[i]+P[i+2],P[i+1]);g.arc(P[i],P[i+1],P[i+2],0,TAU)}};
 function puff(g,P,col,lw){dots(g,P);g.strokeStyle=H.OL;g.lineWidth=(lw||1)*2;g.lineJoin='round';g.stroke();g.fillStyle=shd(col,-.2);g.fill();g.save();g.clip();g.translate(.9,-.8);dots(g,P);g.fillStyle=col;g.fill();g.restore()}
 // small parts: one flat fill and an outline
 const fo=(g,col,lw)=>{g.fillStyle=col;g.fill();g.strokeStyle=H.OL;g.lineWidth=lw;g.stroke()};
 // a long soft ear bent at its middle: base (x,y), base angle a1 and tip angle a2 (0 is straight up, + leans to the front), lengths l1 l2, half-width w
 const earP=(g,x,y,a1,a2,l1,l2,w)=>{const s1=sin(a1),c1=cos(a1),s2=sin(a2),c2=cos(a2),am=(a1+a2)/2,sm=sin(am),cm=cos(am),x1=x+s1*l1,y1=y-c1*l1,x2=x1+s2*l2,y2=y1-c2*l2;
  return()=>{g.beginPath();g.moveTo(x-c1*w*.62,y-s1*w*.62);g.quadraticCurveTo(x1-cm*w*1.3,y1-sm*w*1.3,x2-c2*w*.82,y2-s2*w*.82);g.quadraticCurveTo(x2+s2*w*1.55,y2-c2*w*1.55,x2+c2*w*.82,y2+s2*w*.82);g.quadraticCurveTo(x1+cm*w*1.3,y1+sm*w*1.3,x+c1*w*.62,y+s1*w*.62);g.closePath()}};
 // a four-point twinkle
 const twk=(g,x,y,r)=>{g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill()};
 // ---- Moonbun Costume: a fluffy lilac bunny suit; a round hood with two tall soft ears (one a floppy lop) that bob with each step, trail when you run,
 // perk up in the air and twitch now and then; cream fur around the face, at the collar and the bloomer cuffs; a pompom tail that hops and wiggles
 const BN='#e8dcff',BD='#c6b2f0',BC='#fff9f0',BP='#ffb0cb';
 C.art('cos_bunny_suit',{hb:1,hh:1,oc:BN,
  back(g,c){const t=c.t,hip=c.hip;/* a full costume: your own short cape (drawn right after this layer) would cover the tail */if(c.L)c.L.cape=0;
   g.save();inHead(g,c);H.celf(g,()=>{g.beginPath();g.ellipse(-1.6,c.hy-5.4,16.2,20.8,0,0,TAU)},BD,1.1);g.restore();
   const q=t%3.7,wg=q<.5?sin(q*40)*.8*(1-q/.5):0,b=c.run?-abs(sin(t*14-1))*1.4:sin(t*2.2)*.3,x=-14+wg,y=hip+1+b-(c.air?1.4:0);
   puff(g,[x,y,3.3,x-2.2,y-1.6,2.2,x-2.4,y+1.4,2.2,x-.1,y-2.7,2,x+.5,y+2.6,2,x+1.9,y-1.2,2],BC,1)},
  torso(g,c){const sh=c.sh,hip=c.hip,w=c.gd==1?11.8:c.gd==2?10.4:11.1;
   H.celf(g,()=>{g.beginPath();g.moveTo(-w+3,sh+.2);g.quadraticCurveTo(-w-.6,sh+.4,-w-.3,sh+4.6);g.quadraticCurveTo(-w-2.2,hip-4,-w-.2,hip+4.4);g.lineTo(w+.2,hip+4.4);g.quadraticCurveTo(w+2.2,hip-4,w+.3,sh+4.6);g.quadraticCurveTo(w+.6,sh+.4,w-3,sh+.2);g.closePath()},BN,1.1);
   H.celf(g,()=>{g.beginPath();g.ellipse(1,hip-5.4,4.2,5.2,0,0,TAU)},'#fff4f8',.8);
   const P=[];for(let i=0;i<=6;i++)P.push(-w+.2+(2*w-.4)*i/6,hip+4.9+(i%2)*.45,2.1+(i%2)*.3);puff(g,P,BC,.9);
   P.length=0;for(let i=0;i<5;i++){const x=-7.4+i*3.4;P.push(x,sh+2.3+abs(x)*.07,2.1)}puff(g,P,BC,.9);
   puff(g,[1.4,sh+5.6,1.6],BP,.8)},
  head(g,c){const hy=c.hy,t=c.t,air=c.air?1:0,dr=-cl(c.vx*.0017,-.5,.5),bo=c.run?abs(sin(t*14-.9)):0,id=sin(t*2.1)*.05,q=t%4.6,tw=q<.45?sin(q/.45*TAU*2)*.15*(1-q/.45):0;
   const b1=-.36+dr*.5+id-air*.14,b2=(air?-.8:-1.4+bo*.42)+dr+id*1.5,f1=.16+dr*.4+tw+id*.6+air*.1,f2=f1+.42+dr*.9-bo*.34+tw*1.4;
   H.celf(g,earP(g,-5.6,hy-25,b1,b2,8.2,7.6,3.3),BD,1);g.fillStyle=shd(BP,-.12);earP(g,-5.5,hy-25.8,b1,b2,7,6.4,1.5)();g.fill();
   H.celf(g,earP(g,4.2,hy-25,f1,f2,7.6,7,3.4),BN,1);g.fillStyle=BP;earP(g,4.4,hy-25.8,f1,f2,6.5,6,1.7)();g.fill();
   H.celf(g,()=>{g.beginPath();g.moveTo(-15.6,hy+2.4);g.bezierCurveTo(-17.8,hy-20,-15.6,hy-27,-.6,hy-26.8);g.bezierCurveTo(14.4,hy-27,16.6,hy-20,14.4,hy+2.4);g.ellipse(.4,hy-.6,11.2,11.4,0,PI*2.06,PI*.94,true);g.closePath()},BN,1.1);
   puff(g,[-.6,hy-26.2,1.7,-2.4,hy-25.5,1.3,1.2,hy-25.6,1.3],BC,.8);
   const P=[];for(let i=0;i<13;i++){const a=PI*(.96+i*1.08/12);P.push(.4+cos(a)*12.5,hy-.6+sin(a)*12.7,2.2+(i%2)*.25)}puff(g,P,BC,.9)},
  front(g,c){const x=6.4+(c.gd==1?.6:c.gd==2?-.4:0),y=c.sh+3.4;puff(g,[x,y,3.2,x+1.5,y+1.9,2.4,x-1.4,y+2,2.3],BN,1)}});
 // ---- Marshmallow Dress: a pink bodice with puff sleeves and a cream frill collar, a lavender satin sash tied in a big bow at the back, and three
 // swaying layers (cream lace petticoat, mint skirt, scalloped pink overskirt with ribbon trim) that flare in the air; a few twinkles on the skirt
 const DP='#ffc6dc',DM='#bfeedd',DC='#fffaf3',DL='#c2aefa',DO='#fff0f6',DH='#ff7fae';
 // a scalloped hem from left to right: n scallops of depth d, the middle a little lower (the skirt's roundness), shifted by sway s
 const hem=(g,hy,hw,s,n,d)=>{for(let i=0;i<n;i++){const xb=-hw+2*hw*(i+1)/n,xm=xb-hw/n;g.quadraticCurveTo(xm+s,hy+(1-(xm/hw)**2)*1.2+d*2,xb+s,hy+(1-(xb/hw)**2)*1.2)}};
 const tier=(g,wy,ww,hy,hw,s,n,d)=>()=>{g.beginPath();g.moveTo(-ww,wy);g.bezierCurveTo(-ww-1.2,wy+(hy-wy)*.45,-hw+s*.55,hy-3,-hw+s,hy);hem(g,hy,hw,s,n,d);g.bezierCurveTo(hw+s*.55,hy-3,ww+1.2,wy+(hy-wy)*.45,ww,wy);g.closePath()};
 C.art('cos_pastel_dress',{hb:1,oc:DO,
  back(g,c){/* your own cape would hang out under the hem; the bow's tails take its place */if(c.L)c.L.cape=0},
  torso(g,c){const sh=c.sh,hip=c.hip,t=c.t,air=c.air?1:0,w=c.gd==1?10.6:c.gd==2?9.4:10,ash=c.gd==1?.6:c.gd==2?-.4:0,
    s=-cl(c.vx*.022,-5.5,5.5)+sin(t*2.8)*.8,up=air*2.2+(c.run?abs(sin(t*14-.7))*1.1:0),fl=air*2.4;
   H.celf(g,tier(g,hip-4,8.4,hip+11-up,13.8+fl,s*1.1,9,.8),DC,1);
   H.celf(g,tier(g,hip-4,8.6,hip+8.8-up,13+fl,s,6,1.1),DM,1);
   g.fillStyle='#fff';for(let i=0;i<3;i++){g.globalAlpha=.45+.55*abs(sin(t*2.4+i*2.1));twk(g,[-7.8,6,-.8][i]+s*.85,hip+[6.4,6.9,7.6][i]-up*.8,[1.5,1.3,1.7][i])}g.globalAlpha=1;
   H.celf(g,tier(g,hip-5,9,hip+4.4-up*.6,11.4+fl*.6,s*.7,5,1.6),DP,1);
   g.strokeStyle=shd(DP,-.2);g.lineWidth=.6;g.beginPath();for(const x of[-5.6,-.4,4.8]){g.moveTo(x*.8,hip-3);g.quadraticCurveTo(x*1.05+s*.2,hip,x*1.3+s*.6,hip+3.6-up*.6)}g.stroke();
   g.strokeStyle=DL;g.lineWidth=1.1;g.beginPath();g.moveTo(-11.4-fl*.6+s*.7,hip+3.2-up*.6);hem(g,hip+3.2-up*.6,11.4+fl*.6,s*.7,5,1.6);g.stroke();
   H.celf(g,()=>{g.beginPath();g.ellipse(-7.6-ash,sh+3.6,3.8,3.4,-.3,0,TAU)},shd(DP,-.08),1);
   H.celf(g,()=>{g.beginPath();g.moveTo(-w+2,sh+.3);g.quadraticCurveTo(-w-.2,sh+.4,-w,sh+4);g.quadraticCurveTo(-w+.8,hip-9,-8.4,hip-4);g.lineTo(8.4,hip-4);g.quadraticCurveTo(w-.8,hip-9,w,sh+4);g.quadraticCurveTo(w+.2,sh+.4,w-2,sh+.3);g.closePath()},DP,1.1);
   g.fillStyle=DC;g.beginPath();g.arc(1.2,sh+8.4,.75,0,TAU);g.moveTo(1.95,sh+11.4);g.arc(1.2,sh+11.4,.75,0,TAU);g.fill();
   H.celf(g,()=>{g.beginPath();g.moveTo(-w+.8,hip-8);g.quadraticCurveTo(0,hip-7,w-.8,hip-8);g.lineTo(8.8,hip-4.4);g.quadraticCurveTo(0,hip-3.4,-8.8,hip-4.4);g.closePath()},DL,1);
   const P=[];for(let i=0;i<5;i++){const x=-6.6+i*3.3;P.push(x,sh+2.3+abs(x)*.1,2.1)}puff(g,P,DC,.8);
   g.fillStyle=DH;g.strokeStyle=H.OL;g.lineWidth=.6;g.beginPath();g.moveTo(1.2,sh+5.9);g.bezierCurveTo(-1.6,sh+4.2,-.4,sh+2.2,1.2,sh+3.4);g.bezierCurveTo(2.8,sh+2.2,4,sh+4.2,1.2,sh+5.9);g.fill();g.stroke();
   // the bow at the back: two satin tails (notched ends) that trail and flutter, two big loops and the knot
   const bx=-8.8,by=hip-6,f=sin(t*5.2)*.6+(c.run?sin(t*14)*.8:0),tl=s*.9-air*1.6;
   for(const k of[1,0]){const ex=bx-1.6-k*2.6+tl+f*(1-k*.5),ey=by+9.6-k*1.6-air*1.6,mx=bx-1.2-k*1.4+tl*.3,my=by+4.6;
    H.celf(g,()=>{g.beginPath();g.moveTo(bx-.9,by+.4);g.quadraticCurveTo(mx-1.1,my,ex-1.3,ey);g.lineTo(ex,ey-1.1);g.lineTo(ex+1.3,ey+.3);g.quadraticCurveTo(mx+1.1,my,bx+.9,by+.4);g.closePath()},k?shd(DL,-.06):DL,.9)}
   H.celf(g,()=>{g.beginPath();g.moveTo(bx,by);g.bezierCurveTo(bx-1.2,by-8,bx-9.2,by-5.6,bx,by);g.bezierCurveTo(bx-9.2,by+.8,bx-5.6,by+6.6,bx,by);g.closePath()},DL,.9);
   g.strokeStyle=shd(DL,-.25);g.lineWidth=.6;g.beginPath();g.moveTo(bx-1.2,by-1);g.quadraticCurveTo(bx-3.6,by-3.6,bx-5.4,by-3.4);g.moveTo(bx-1.4,by+1);g.quadraticCurveTo(bx-4,by+2.2,bx-5,by+3.4);g.stroke();
   g.beginPath();g.ellipse(bx,by,1.6,1.9,0,0,TAU);fo(g,DL,.8)},
  front(g,c){const x=6.6+(c.gd==1?.6:c.gd==2?-.4:0),y=c.sh+3.6;H.celf(g,()=>{g.beginPath();g.ellipse(x,y,4,3.5,.3,0,TAU)},DP,1);
   puff(g,[x-2.6,y+2.6,1.3,x-.4,y+3.5,1.3,x+2,y+3.3,1.3],DC,.7)}});
 // ---- Bear Backpack: a plush caramel bear riding high on your back, pink straps over your shoulders and one paw holding on; its head peeks over
 // your shoulder and every few seconds it turns to look ahead, looks back, or tilts its head; it bounces a step behind you and its legs dangle and swing
 const KB='#e3b28a',KM='#ffe8cf',KP='#ffb2c4',KR='#ff8db4',KS='#f49cbc',KE='#3a2430';
 const LK=[0,0,2.2,0,2.6,1,4.4,1,4.8,0,6.4,0,6.8,-1,8.4,-1,8.8,0,10.6,0];   // where it looks over 10.6 s: 0 at you, 1 ahead, -1 back
 const look=t=>{const p=t%10.6;for(let i=2;i<LK.length;i+=2)if(p<=LK[i])return LK[i-1]+(LK[i+1]-LK[i-1])*ss((p-LK[i-2])/(LK[i]-LK[i-2]));return 0};
 // the pack hangs from the far shoulder (-6.5, sh+2): it swings back as you run, bounces a beat after each step and lifts in the air
 const kpose=(g,c)=>{const t=c.t,air=c.air?1:0,rot=cl(-c.vx*.0011,-.28,.28)+sin(t*1.7)*.03-air*.08,bo=c.run?-abs(sin(t*14-1.2))*1.3:sin(t*2.2)*.25;
  g.translate(-6.5,c.sh+2);g.rotate(rot);g.translate(0,bo-air*1.2);return rot};
 const KST=[[-3.6,-5.8,-6.8],[1.6,3,3.8]];   // the two straps: top, middle and bottom x, far one then near one
 C.art('cos_bear_pack',{
  back(g,c){/* the pack takes the cape's place on your back (it is drawn right after this layer) */if(c.L)c.L.cape=0;const t=c.t,air=c.air?1:0,run=c.run?1:0,rot=kpose(g,c);
   const lg=sin(t*2.6)*.18+(run?sin(t*14)*.45:0)+(air?-.5:0)-rot*1.5;
   const a0=lg+.12,a1=-lg*.7+.12,x0=-10+sin(a0)*3,y0=12+cos(a0)*3,x1=-5.2+sin(a1)*3,y1=12.8+cos(a1)*3;
   H.celf(g,()=>{g.beginPath();g.ellipse(x0,y0,2.3,3.1,-a0,0,TAU);g.moveTo(x1+2.3,y1);g.ellipse(x1,y1,2.3,3.1,-a1,0,TAU)},KB,.9);
   g.fillStyle=KM;g.beginPath();g.ellipse(x0+sin(a0)*1.1,y0+cos(a0)*1.1,1.4,1.1,-a0,0,TAU);g.moveTo(x1+sin(a1)*1.1+1.4,y1+cos(a1)*1.1);g.ellipse(x1+sin(a1)*1.1,y1+cos(a1)*1.1,1.4,1.1,-a1,0,TAU);g.fill();
   H.celf(g,()=>{g.beginPath();g.moveTo(-3.6,5.4);g.quadraticCurveTo(-3.4,.6,-1.2,-.6);g.lineTo(.6,1.4);g.quadraticCurveTo(-1,3.6,-.8,6);g.closePath()},KB,.9);
   H.celf(g,()=>{g.beginPath();g.ellipse(-7,6.6,6.2,7,-.06,0,TAU)},KB,1.1);
   g.beginPath();g.ellipse(-8.8,8.2,2.7,3.3,-.1,0,TAU);fo(g,'#f8dcbd',.7)},
  torso(g,c){const sh=c.sh,hip=c.hip,t=c.t,run=c.run?1:0;
   H.celf(g,()=>{g.beginPath();for(const[x0,x1,x2]of KST){g.moveTo(x0-1.1,sh+.4);g.quadraticCurveTo(x1-1.1,sh+7,x2-1.1,hip-4.6);g.lineTo(x2+1.1,hip-4.6);g.quadraticCurveTo(x1+1.1,sh+7,x0+1.1,sh+.4);g.closePath()}},KS,.8);
   g.fillStyle=KM;g.strokeStyle=H.OL;g.lineWidth=.6;g.beginPath();g.arc(3,sh+8.4,1.1,0,TAU);g.fill();g.stroke();
   const rot=kpose(g,c);g.beginPath();g.ellipse(-.6,.4,2.5,2.1,-.4,0,TAU);fo(g,KB,.9);g.fillStyle=KM;g.beginPath();g.arc(-.2,.8,.9,0,TAU);g.fill();
   const L=look(t),q=t%10.6,tilt=(q>4.8&&q<6.4?sin((q-4.8)/1.6*PI)*.24:0)-L*.1+rot*.6;
   g.save();g.translate(-9.4,-5.2+(run?abs(sin(t*14-1.6))*.5:0));g.rotate(tilt);const fx=L*2.2;
   const ea=fx*.35-4.6,eb=fx*.35+4.6;H.celf(g,()=>{g.beginPath();g.arc(ea,-4.4,2.5,0,TAU);g.moveTo(eb+2.5,-4.4);g.arc(eb,-4.4,2.5,0,TAU)},KB,.9);g.fillStyle=KP;g.beginPath();g.arc(ea-.1,-4.2,1.2,0,TAU);g.moveTo(eb+1.3,-4.2);g.arc(eb+.1,-4.2,1.2,0,TAU);g.fill();
   H.celf(g,()=>{g.beginPath();g.ellipse(0,0,6.4,5.8,0,0,TAU)},KB,1.1);
   g.beginPath();g.ellipse(fx*1.05,2,2.7,2.1,0,0,TAU);fo(g,KM,.7);
   g.fillStyle=KE;g.beginPath();g.ellipse(fx*1.1,1.2,1.15,.8,0,0,TAU);g.fill();
   g.strokeStyle=KE;g.lineWidth=.55;g.lineCap='round';g.beginPath();g.moveTo(fx*1.1,1.8);g.lineTo(fx*1.1,2.6);g.moveTo(fx*1.1-1,2.9);g.quadraticCurveTo(fx*1.1,3.4,fx*1.1+1,2.9);g.stroke();
   const bl=(t%5.3)<.14;for(const s of[-1,1]){const ex=fx+s*2.5,ey=-.9;g.fillStyle=KE;if(bl)g.fillRect(ex-.9,ey-.15,1.8,.5);else{g.beginPath();g.arc(ex,ey,1,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex+.35,ey-.4,.35,0,TAU);g.fill()}}
   g.fillStyle='rgba(255,130,160,.45)';for(const s of[-1,1]){g.beginPath();g.ellipse(fx+s*3.8,1.5,1.1,.65,0,0,TAU);g.fill()}
   g.restore();
   H.celf(g,()=>{g.beginPath();g.moveTo(-8,.6);g.lineTo(-12.2,-1.6);g.quadraticCurveTo(-13,.6,-12.2,2.8);g.closePath();g.moveTo(-8,.6);g.lineTo(-3.8,-1.6);g.quadraticCurveTo(-3,.6,-3.8,2.8);g.closePath()},KR,.8);
   g.beginPath();g.ellipse(-8,.6,1.3,1.5,0,0,TAU);fo(g,KR,.7)}});
})()}catch(e){console.error('COS mochi',e)}
