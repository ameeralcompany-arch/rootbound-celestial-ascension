// ===== Cosmetic art: Crimson Covenant (demonic, dark and beautiful: black and crimson with silver). Drawn on the in-game body in its own cel style (COS1.H).
// Body space: feet at 0, facing right (+x is the front), shoulders c.sh (about -37), hips c.hip (about -21), torso about 19 wide; the head layer is in
// head space (head centre c.hy, about -50; face spans x -10..10, y hy-10..hy+12). Glows are small, in front of the body, and never behind the head. =====
try{(()=>{const C=COS1,H=C.H,TAU=6.2832,sin=Math.sin,cl=(v,a,b)=>v<a?a:v>b?b:v;
 const BK='#2b2433',BKD='#1a1520',CR='#c0182f',CRD='#6e0f22',GLO='#ff2a46',SV='#d6d9e6',SVD='#8e92a6';
 // a heartbeat: two quick beats, then rest (0..1)
 const beat=t=>{const p=(t*1.05)%1,e=x=>Math.exp(-x*x*160);return Math.min(1,e(p)+e(p-1)+.62*e(p-.21))};
 // a flat fill and outline, one path build: for small pieces and near-black shapes where the lit offset would not show
 const fo=(g,path,col,lw)=>{path();g.fillStyle=col;g.fill();g.strokeStyle=H.OL;g.lineWidth=lw||1;g.stroke()};
 // ---- a tapered horn along a cubic curve p (root .. tip), root half-width w: cel shaded, ringed with ridges, a silver band at the root, a glowing vein
 const cb=(a,b,c,d,u)=>{const v=1-u;return v*v*v*a+3*v*v*u*b+3*v*u*u*c+u*u*u*d},cd=(a,b,c,d,u)=>{const v=1-u;return 3*v*v*(b-a)+6*v*u*(c-b)+3*u*u*(d-c)};
 const nrm=(dx,dy)=>{const L=Math.hypot(dx,dy)||1;return[-dy/L,dx/L]};
 function horn(g,p,w,col,vein,rid,band,u0,u1,spark){const[x0,y0,x1,y1,x2,y2,x3,y3]=p,n0=nrm(x1-x0,y1-y0),n1=nrm(x2-x0,y2-y0),n2=nrm(x3-x1,y3-y1);
  const at=u=>{const n=nrm(cd(x0,x1,x2,x3,u),cd(y0,y1,y2,y3,u)),k=w*cb(1,.8,.4,0,u);return[cb(x0,x1,x2,x3,u),cb(y0,y1,y2,y3,u),n[0]*k,n[1]*k]};
  H.celf(g,()=>{g.beginPath();g.moveTo(x0+n0[0]*w,y0+n0[1]*w);g.bezierCurveTo(x1+n1[0]*w*.8,y1+n1[1]*w*.8,x2+n2[0]*w*.4,y2+n2[1]*w*.4,x3,y3);g.bezierCurveTo(x2-n2[0]*w*.4,y2-n2[1]*w*.4,x1-n1[0]*w*.8,y1-n1[1]*w*.8,x0-n0[0]*w,y0-n0[1]*w);g.closePath()},col,.9);
  // ridges: shallow rings that curve toward the tip
  g.strokeStyle='rgba(6,3,10,.6)';g.lineWidth=.45;g.beginPath();for(let i=1;i<=rid;i++){const q=at(.16+i*.62/rid);g.moveTo(q[0]+q[2],q[1]+q[3]);g.quadraticCurveTo(q[0]-q[3]*.7,q[1]+q[2]*.7,q[0]-q[2],q[1]-q[3])}g.stroke();
  // a lacquer sheen along one edge
  const s1=at(.1),s2=at(.42),s3=at(.78);g.strokeStyle='rgba(230,220,250,.42)';g.lineWidth=.55;g.lineCap='round';g.beginPath();g.moveTo(s1[0]+s1[2]*.55,s1[1]+s1[3]*.55);g.quadraticCurveTo(s2[0]+s2[2]*.6,s2[1]+s2[3]*.6,s3[0]+s3[2]*.5,s3[1]+s3[3]*.5);g.stroke();
  // a vein of crimson light from u0 to u1 (a faint wide glow added under a thin crimson core: light without blur), with one branch
  if(vein>0){const a=at(u0),m=at(u0+(u1-u0)*.36),n=at(u0+(u1-u0)*.7),e=at(u1),V=()=>{g.beginPath();g.moveTo(a[0]-a[2]*.15,a[1]-a[3]*.15);g.lineTo(m[0]+m[2]*.3,m[1]+m[3]*.3);g.lineTo(n[0]-n[2]*.35,n[1]-n[3]*.35);g.lineTo(e[0],e[1]);g.moveTo(m[0]+m[2]*.3,m[1]+m[3]*.3);g.lineTo(m[0]-m[2]*.55+(n[0]-m[0])*.45,m[1]-m[3]*.55+(n[1]-m[1])*.45)};
   g.save();g.lineCap='round';g.lineJoin='round';g.globalCompositeOperation='lighter';g.globalAlpha=.22*vein;g.strokeStyle=CR;g.lineWidth=1.8;V();g.stroke();g.globalCompositeOperation='source-over';g.globalAlpha=.35+.6*vein;g.strokeStyle='#ff3550';g.lineWidth=.45;g.stroke();g.restore()}
  // a bead of light that runs up the vein now and then (k: 0..1 along it)
  if(spark>0&&spark<1){const q=at(u0+(u1-u0)*spark),a=Math.sin(spark*Math.PI);H.glow(g,q[0],q[1],2.2,GLO,.55*a);g.globalAlpha=a;g.fillStyle='#ffd0d6';g.beginPath();g.arc(q[0],q[1],.45,0,TAU);g.fill();g.globalAlpha=1}
  // the silver band around the root, curved like a ring seen from the side
  if(band){const q=at(.1),r=at(.2),tx=(r[0]-q[0])*.5,ty=(r[1]-q[1])*.5;g.lineCap='butt';g.beginPath();g.moveTo(q[0]+q[2],q[1]+q[3]);g.quadraticCurveTo(q[0]+tx,q[1]+ty,q[0]-q[2],q[1]-q[3]);g.strokeStyle=H.OL;g.lineWidth=2;g.stroke();g.strokeStyle=SV;g.lineWidth=1;g.stroke()}
  return at}
 const ember=(g,x,y,r,a)=>{if(a<=0)return;g.globalAlpha=a;g.fillStyle='#ff6a4a';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.globalAlpha=1};

 // ---- Obsidian Horns: two black horns curling up out of the hair, ringed and banded in silver, each with a cracked crimson vein that breathes with light
 // and a bead of light that runs up it now and then
 C.art('cos_horn_crown',{hh:1,
  head(g,c){const hy=c.hy,v=.6+.4*sin(c.t*2.1);
   for(const s of[-1,1]){const o=s<0?-.8:0,P=[s*6.2+o,hy-13.4,s*11.4+o,hy-15.6,s*16+o,hy-22,s*12.6+o,hy-30.6];horn(g,P,3.3,BK,v,4,1,.16,.8,((c.t*.32+(s>0?.45:0))%1)*1.6)}}});

 // ---- Crimson Covenant Coat: a long black coat lined in crimson, crimson lapels, three silver clasps, a flared collar and long tails that stream behind you
 C.art('cos_shadow_coat',{hb:1,oc:'#2a2232',
  back(g,c){const sh=c.sh,hip=c.hip,sw=cl(-c.vx*.034,-9,9)+sin(c.t*2.3)*1.1,fl=c.run?sin(c.t*13)*1.2:0,up=c.air?-5:0,lf=Math.abs(sw)*.5,hb=-2.5+up+lf;if(c.L)c.L.cape=0;/* the coat's own tails replace the look's short cape (the look object is fresh each draw) */
   // the high collar: two flared points standing up behind the neck, crimson inside
   for(const s of[-1,1]){fo(g,H.poly(g,[s*3,sh+3,s*7.2,sh-7.6,s*14.6,sh-5.4,s*11.6,sh+3]),BK,1);g.fillStyle='#a3162c';g.beginPath();g.moveTo(s*5.6,sh+1);g.lineTo(s*7.6,sh-5.6);g.lineTo(s*12.4,sh-4.4);g.lineTo(s*10.6,sh+1);g.closePath();g.fill()}
   // the long back of the coat, seen between the legs: crimson lining framed by black, split into two tails
   fo(g,()=>{g.beginPath();g.moveTo(-9,hip-4);g.lineTo(9,hip-4);g.quadraticCurveTo(11.5+sw*.4,hip+8,12.8+sw+fl,hb-1);g.lineTo(2.2+sw*.9,hb+.6-fl*.4);g.lineTo(sw*.7,hip+12+lf*.4);g.lineTo(-2.2+sw*.9,hb+.6+fl*.4);g.lineTo(-12.8+sw-fl,hb-1);g.quadraticCurveTo(-11.5+sw*.4,hip+8,-9,hip-4);g.closePath()},BK,1.1);
   g.fillStyle=CRD;g.beginPath();g.moveTo(-6.6,hip-2);g.lineTo(6.6,hip-2);g.quadraticCurveTo(9+sw*.4,hip+8,10.4+sw+fl,hb-2.2);g.lineTo(2.6+sw*.9,hb-1);g.lineTo(sw*.7,hip+10.4+lf*.4);g.lineTo(-2.6+sw*.9,hb-1);g.lineTo(-10.4+sw-fl,hb-2.2);g.quadraticCurveTo(-9+sw*.4,hip+8,-6.6,hip-2);g.closePath();g.fill()},
  torso(g,c){const sh=c.sh,hip=c.hip,w=(c.gd==1?10.4:c.gd==2?8.8:9.5)+.8,sl=c.gd==2,sw=cl(-c.vx*.02,-4,4)+sin(c.t*2.6)*.6,ls=c.ls*2.4,up=c.air?-2.5:0;
   // the front skirt: two panels over the thighs, parted in the middle, faced in crimson along the part and the hem
   for(const s of[-1,1]){const dx=sw+s*ls,hy=hip+14.2+up;H.celf(g,H.poly(g,[s*.8,hip-1,s*9.2,hip-1,s*12.6+dx,hy+1.4,s*2.2+dx,hy]),BK,1);
    g.fillStyle=CR;g.beginPath();g.moveTo(s*.9,hip-.4);g.lineTo(s*2.5,hip-.4);g.lineTo(s*3.8+dx,hy-1.4);g.lineTo(s*12.2+dx,hy);g.lineTo(s*12.5+dx,hy+1.2);g.lineTo(s*2.3+dx,hy-.1);g.closePath();g.fill()}
   // the coat body
   H.celf(g,()=>{g.beginPath();g.moveTo(-w,sh+.6);g.lineTo(w,sh+.6);g.quadraticCurveTo(sl?6.6:w-.6,(sh+hip)/2,9.2,hip+.4);g.lineTo(-9.2,hip+.4);g.quadraticCurveTo(sl?-6.6:-w+.6,(sh+hip)/2,-w,sh+.6);g.closePath()},BK,1.1);
   // the waistcoat in the opening, then crimson lapels edged in silver
   g.fillStyle='#3a1220';g.beginPath();g.moveTo(-4.6,sh+.8);g.lineTo(4.6,sh+.8);g.lineTo(.8,sh+12);g.lineTo(-.8,sh+12);g.closePath();g.fill();
   for(const s of[-1,1]){fo(g,H.poly(g,[s*4.4,sh+.5,s*8.4,sh+1,s*5.4,sh+5,s*6.2,sh+6.4,s*.9,sh+12.6]),CR,.8);g.strokeStyle=SV;g.lineWidth=.5;g.beginPath();g.moveTo(s*8,sh+1.3);g.lineTo(s*5.4,sh+5);g.lineTo(s*6,sh+6.4);g.lineTo(s*1.3,sh+12.2);g.stroke()}
   // a silver cravat pin with a crimson stone, then three silver clasps closing the waist
   g.fillStyle=SV;g.strokeStyle=H.OL;g.lineWidth=.6;g.beginPath();g.moveTo(0,sh+1.4);g.lineTo(1.4,sh+3);g.lineTo(0,sh+4.8);g.lineTo(-1.4,sh+3);g.closePath();g.fill();g.stroke();g.fillStyle=CR;g.beginPath();g.arc(0,sh+3,.65,0,TAU);g.fill();
   g.lineCap='round';for(let i=0;i<3;i++){const y=sh+13.4+i*2.9,hw=2.6;g.strokeStyle=H.OL;g.lineWidth=1.7;g.beginPath();g.moveTo(-hw,y);g.lineTo(hw,y);g.stroke();g.strokeStyle=SV;g.lineWidth=.8;g.stroke();g.fillStyle=SV;g.beginPath();g.arc(-hw,y,.95,0,TAU);g.arc(hw,y,.95,0,TAU);g.fill();g.lineWidth=.5;g.strokeStyle=H.OL;g.stroke()}
   // the waist seam and the centre line below the clasps
   g.strokeStyle='rgba(8,4,12,.6)';g.lineWidth=.7;g.beginPath();g.moveTo(-8.6,hip-1.6);g.quadraticCurveTo(0,hip-.4,8.6,hip-1.6);g.stroke();
   // silver piping along the shoulders
   g.strokeStyle=SVD;g.lineWidth=.7;g.beginPath();g.moveTo(-w+.6,sh+1.4);g.lineTo(-8.6,sh+1.4);g.moveTo(8.6,sh+1.4);g.lineTo(w-.6,sh+1.4);g.stroke()}});

 // ---- Oni Half-Mask: red lacquer over the lower face (the eyes stay clear), ivory tusks, a black-lacquered grin, a silver rim and a gloss that slides across
 C.art('cos_oni_mask',{
  head(g,c){const hy=c.hy,R='#cf1f36';
   const M=()=>{g.beginPath();g.moveTo(-10.4,hy+4.2);g.quadraticCurveTo(-7.4,hy+6.9,-4.6,hy+7.5);g.quadraticCurveTo(-1.4,hy+7.7,.9,hy+5.5);g.quadraticCurveTo(2.6,hy+7.9,5.6,hy+8);g.quadraticCurveTo(9.2,hy+7.8,10.9,hy+4);
    g.quadraticCurveTo(11.6,hy+9.4,7.8,hy+12.8);g.quadraticCurveTo(4.6,hy+15.8,2.4,hy+15.6);g.quadraticCurveTo(-4.8,hy+14.2,-9,hy+9.6);g.closePath()};
   // the cord tying it behind the ear
   g.strokeStyle=BKD;g.lineWidth=.9;g.beginPath();g.moveTo(-10,hy+5.4);g.lineTo(-12,hy+2.4);g.stroke();
   H.celf(g,M,R,1);
   // a black-lacquered rim along the top edge, with a silver stud on the bridge of the nose
   g.strokeStyle='#2a0a12';g.lineWidth=.9;g.beginPath();g.moveTo(-9.8,hy+5);g.quadraticCurveTo(-7.2,hy+7.4,-4.6,hy+8);g.quadraticCurveTo(-1.3,hy+8.2,.9,hy+6.2);g.quadraticCurveTo(2.6,hy+8.5,5.6,hy+8.6);g.quadraticCurveTo(9,hy+8.3,10.4,hy+5.1);g.stroke();
   g.fillStyle=SV;g.beginPath();g.arc(1,hy+6.9,.55,0,TAU);g.fill();
   // nose ridge and flared nostrils
   g.fillStyle='rgba(255,190,190,.45)';g.beginPath();g.moveTo(.9,hy+6.2);g.quadraticCurveTo(2.6,hy+7.6,3.4,hy+8.8);g.lineTo(2.2,hy+8.6);g.closePath();g.fill();
   g.fillStyle='#2a0a12';g.beginPath();g.ellipse(1.6,hy+9.2,.75,.45,.3,0,TAU);g.ellipse(4.5,hy+9.1,.75,.45,-.3,0,TAU);g.fill();
   // the grin, black lacquer, with two ivory tusks rising from its corners
   g.fillStyle='#1d0a10';g.beginPath();g.moveTo(-3.8,hy+10.6);g.quadraticCurveTo(2.2,hy+13.6,8.2,hy+10.2);g.quadraticCurveTo(2.6,hy+11.6,-3.8,hy+10.6);g.closePath();g.fill();
   for(const[x,s]of[[-3,-1],[7.4,1]])H.celf(g,H.poly(g,[x-1,hy+11.4,x+1,hy+11.2,x+s*.9,hy+8.2]),'#f4ead2',.6);
   // cheek ridges in black lacquer
   g.strokeStyle='#2a0a12';g.lineWidth=.7;g.lineCap='round';g.beginPath();g.moveTo(-8.4,hy+7.6);g.quadraticCurveTo(-8,hy+10.6,-5.4,hy+11.8);g.moveTo(9.6,hy+7.4);g.quadraticCurveTo(9.6,hy+9.8,8.4,hy+11);g.stroke();
   // the lacquer gloss: a soft fixed shine and a glint that slides across now and then
   g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-6.2,hy+9.4,1.5,.55,-.7,0,TAU);g.fill();
   const gp=(c.t*.21)%1;if(gp<.14){const k=gp/.14,gx=-8+k*19;g.save();M();g.clip();g.globalAlpha=sin(k*Math.PI)*.4;g.fillStyle='#fff';g.beginPath();g.moveTo(gx,hy+4);g.lineTo(gx+1.1,hy+4);g.lineTo(gx-2.9,hy+16);g.lineTo(gx-4,hy+16);g.closePath();g.fill();g.restore()}}});

 // ---- Nightwing Mantle: a black shoulder mantle lined in crimson whose ends are two small bat wings: folded at rest, opening as you run, beating in the air
 // wing points, outward +x and down +y from the shoulder blade: root, arm control, wrist, three finger tips with the scallops between them, back to the body
 const WO=[[0,0],[6,-6.5],[12,-7],[19,-2],[14.5,-1],[16,5.5],[12,3.5],[10,9],[6.5,5],[1,7.5]],WF=[[0,0],[5,-5.2],[9.6,-4.2],[12.8,7],[10.2,7.2],[10.6,12.8],[7.9,11.2],[6.8,14.6],[3.8,11.8],[1,11]];
 const mantle=(g,c,w,cut)=>{const sh=c.sh,y=sh+8.4,f=()=>{g.beginPath();if(cut){g.moveTo(cut,sh-.2);g.lineTo(4,sh-.4)}else{g.moveTo(-w,y);g.quadraticCurveTo(-w-.8,sh-.6,-4,sh-.4);g.lineTo(4,sh-.4)}g.quadraticCurveTo(w+.8,sh-.6,w,y);
   g.quadraticCurveTo(w*.86,sh+5.2,w*.62,sh+6.4);g.quadraticCurveTo(w*.5,sh+7.6,w*.34,sh+9);if(cut){g.lineTo(cut,sh+7.4)}else{g.quadraticCurveTo(w*.2,sh+5.6,0,sh+6.4);g.quadraticCurveTo(-w*.2,sh+5.6,-w*.34,sh+9);g.quadraticCurveTo(-w*.5,sh+7.6,-w*.62,sh+6.4);g.quadraticCurveTo(-w*.86,sh+5.2,-w,y)}g.closePath()};return f};
 C.art('cos_bat_mantle',{
  back(g,c){const sh=c.sh,sp=Math.abs(c.vx)/240;if(c.L)c.L.cape=0;let o=c.air?.86+.14*sin(c.t*11):cl(sp,0,.7)+(sp<.1?.05+.05*sin(c.t*1.7):0)+(c.run?sin(c.t*14)*.06:0);o=cl(o,0,1);
   for(const s of[-1,1]){const ax=s*3.4,ay=sh+4.5,P=[];for(let i=0;i<10;i++){const x=WF[i][0]+(WO[i][0]-WF[i][0])*o,y=WF[i][1]+(WO[i][1]-WF[i][1])*o;P.push(ax+s*x,ay+y)}
    const Wp=()=>{g.beginPath();g.moveTo(P[0],P[1]);g.quadraticCurveTo(P[2],P[3],P[4],P[5]);g.lineTo(P[6],P[7]);g.quadraticCurveTo(P[8],P[9],P[10],P[11]);g.quadraticCurveTo(P[12],P[13],P[14],P[15]);g.quadraticCurveTo(P[16],P[17],P[18],P[19]);g.closePath()};
    H.celf(g,Wp,'#7a1630',1);
    // the finger bones, black, and a small silver claw at the wrist
    g.strokeStyle=BKD;g.lineWidth=1.1;g.lineCap='round';g.beginPath();g.moveTo(P[0],P[1]);g.quadraticCurveTo(P[2],P[3],P[4],P[5]);g.lineTo(P[6],P[7]);g.moveTo(P[4],P[5]);g.lineTo(P[10],P[11]);g.moveTo(P[4],P[5]);g.lineTo(P[14],P[15]);g.stroke();
    g.fillStyle=SV;g.beginPath();g.moveTo(P[4]-s*.8,P[5]);g.quadraticCurveTo(P[4]+s*.4,P[5]-2.4,P[4]+s*1.5,P[5]-2.2);g.lineTo(P[4]+s*.8,P[5]+.3);g.closePath();g.fill()}},
  torso(g,c){const sh=c.sh,w=(c.gd==1?10.4:c.gd==2?8.8:9.5)+1.8,M=mantle(g,c,w,0);
   // the mantle over the shoulders, its hem cut in bat-wing scallops; the crimson lining shows below it
   g.save();g.translate(0,1);M();g.fillStyle=CR;g.fill();g.restore();fo(g,M,BK,1);
   // a silver clasp at the throat with a crimson stone, and a fine silver chain between the shoulders
   g.strokeStyle=SVD;g.lineWidth=.5;g.beginPath();g.moveTo(-5.6,sh+2.6);g.quadraticCurveTo(0,sh+5.6,5.6,sh+2.6);g.stroke();
   g.fillStyle=SV;g.strokeStyle=H.OL;g.lineWidth=.6;g.beginPath();g.moveTo(-2.2,sh+1.6);g.lineTo(0,sh+.4);g.lineTo(2.2,sh+1.6);g.lineTo(0,sh+3.4);g.closePath();g.fill();g.stroke();g.fillStyle=CR;g.beginPath();g.arc(0,sh+1.8,.7,0,TAU);g.fill()},
  front(g,c){const w=(c.gd==1?10.4:c.gd==2?8.8:9.5)+1.8,cut=5.2,sh=c.sh,F=mantle(g,c,w,cut);
   // the mantle drapes over the near shoulder, above the arm (its inner edge continues the piece drawn under the head)
   g.save();g.translate(0,1);F();g.fillStyle=CR;g.fill();g.restore();
   F();g.fillStyle=BK;g.fill();g.strokeStyle=H.OL;g.lineWidth=1;g.beginPath();g.moveTo(cut+1.2,sh-.3);g.quadraticCurveTo(w+.8,sh-.6,w,sh+8.4);g.quadraticCurveTo(w*.86,sh+5.2,w*.62,sh+6.4);g.quadraticCurveTo(w*.5,sh+7.6,w*.34,sh+9);g.stroke()}});

 // ---- Abyssal Regent Armor (Extremely rare): dark demonic plate with a crimson core that beats like a heart and veins of light that pulse with it,
 // a crowned, horned helm with a silver brow framing the face, spiked pauldrons, and a tattered cape trailing embers (it replaces the look's short cape)
 const AR='#3a3347',ARD='#1f1a27',ARL='#6d6386';
 // a pauldron (s: 1 near side, -1 far side): a curved spike, a lower lame, the main shell; crimson along its lower edge, silver along its crest
 const pauld=(g,px,py,s,k,lame)=>{const X=v=>px+s*v*k,Y=v=>py+v*k;
  fo(g,()=>{g.beginPath();g.moveTo(X(-1.2),Y(-3));g.quadraticCurveTo(X(3),Y(-9.4),X(9.4),Y(-10.6));g.quadraticCurveTo(X(5.6),Y(-6.6),X(4.8),Y(-1.6));g.closePath()},ARD,.8);
  if(lame)fo(g,H.poly(g,[X(-3),Y(2.2),X(5.6),Y(1.4),X(6.6),Y(5.4),X(1.8),Y(6.8),X(-2.6),Y(5)]),AR,.8);
  H.celf(g,()=>{g.beginPath();g.moveTo(X(-4.4),Y(2));g.quadraticCurveTo(X(-4),Y(-4.8),X(1.4),Y(-4.6));g.quadraticCurveTo(X(7),Y(-3.8),X(7.4),Y(1.6));g.quadraticCurveTo(X(1.6),Y(4.6),X(-4.4),Y(2));g.closePath()},AR,1);
  g.lineCap='round';g.strokeStyle=CR;g.lineWidth=.8;g.beginPath();g.moveTo(X(-3.4),Y(2.1));g.quadraticCurveTo(X(1.6),Y(3.8),X(6.6),Y(1.5));if(lame){g.moveTo(X(-1.8),Y(5.2));g.lineTo(X(1.8),Y(6.2));g.lineTo(X(5.8),Y(5))}g.stroke();
  g.strokeStyle=SV;g.lineWidth=.6;g.beginPath();g.moveTo(X(-3.4),Y(-.8));g.quadraticCurveTo(X(-2.6),Y(-3.8),X(1.4),Y(-3.8));g.quadraticCurveTo(X(4.6),Y(-3.4),X(5.8),Y(-1.4));g.stroke()};
 C.art('cos_abyss_armor',{hb:1,hh:1,oc:'#251f2c',
  back(g,c){const sh=c.sh,hip=c.hip,sw=cl(-c.vx*.035,-9,9)+sin(c.t*2.1)*1.2,up=c.air?-6:0,lf=Math.abs(sw)*.6,hb=-1.5+up+lf,fl=c.run?sin(c.t*12):0;if(c.L)c.L.cape=0;
   // the tattered cape: crimson inside, black outside, ragged points
   const cape=k=>{g.beginPath();g.moveTo(-8*k,sh+2);g.lineTo(8*k,sh+2);g.quadraticCurveTo(13*k+sw*.3,hip,14*k+sw+fl,hb-2);g.lineTo(9*k+sw*.95,hb+1.5);g.lineTo(5*k+sw*.9,hb-1.4);g.lineTo(1.4*k+sw*.85,hb+2);g.lineTo(-2.6*k+sw*.85,hb-1.6);g.lineTo(-6.4*k+sw*.9,hb+1.6);g.lineTo(-10*k+sw*.95,hb-1.2);g.lineTo(-14*k+sw-fl,hb-2.6);g.quadraticCurveTo(-13*k+sw*.3,hip,-8*k,sh+2);g.closePath()};
   fo(g,()=>cape(1),ARD,1.1);g.fillStyle='#5a0c1e';cape(.82);g.fill();
   // embers rising off the hem (they fade out long before shoulder height)
   g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const ph=(c.t*.5+i*.25)%1,x=-10.5+i*7+sw*.8+sin(c.t*1.3+i*2)*1.6,y=hb-2-ph*16;ember(g,x,y,.8-ph*.4,(1-ph)*(.5+.5*beat(c.t-.1*i)))}g.restore()},
  torso(g,c){const sh=c.sh,hip=c.hip,w=(c.gd==1?10.4:c.gd==2?8.8:9.5)+.6,b=beat(c.t),sw=cl(-c.vx*.02,-4,4)+sin(c.t*2.6)*.5,ls=c.ls*2.2;
   // tassets: plates over the thighs that swing with your stride
   for(const s of[-1,1]){const dx=sw+s*ls;fo(g,H.poly(g,[s*.8,hip-2,s*9.4,hip-2,s*10.6+dx,hip+8.6,s*5.4+dx,hip+10.2,s*1.4+dx*.6,hip+8]),AR,1);g.strokeStyle=CR;g.lineWidth=.8;g.beginPath();g.moveTo(s*10.3+dx,hip+8);g.lineTo(s*5.4+dx,hip+9.4);g.lineTo(s*1.8+dx*.6,hip+7.4);g.stroke()}
   // the breastplate
   H.celf(g,()=>{g.beginPath();g.moveTo(-w,sh+.4);g.lineTo(w,sh+.4);g.lineTo(w-.8,sh+7);g.lineTo(8.6,hip-1.5);g.lineTo(0,hip+1.4);g.lineTo(-8.6,hip-1.5);g.lineTo(-w+.8,sh+7);g.closePath()},AR,1.1);
   // sculpted plate lines
   g.strokeStyle=ARD;g.lineWidth=.8;g.beginPath();g.moveTo(-w+1,sh+7.6);g.quadraticCurveTo(-4,sh+12.4,0,sh+11.4);g.quadraticCurveTo(4,sh+12.4,w-1,sh+7.6);g.moveTo(-7.6,hip-5);g.lineTo(0,hip-2.6);g.lineTo(7.6,hip-5);g.stroke();
   // silver along the neckline, crimson along the lower point
   g.strokeStyle=SV;g.lineWidth=.6;g.beginPath();g.moveTo(-w+1.2,sh+1.4);g.lineTo(w-1.2,sh+1.4);g.stroke();
   g.strokeStyle=CR;g.lineWidth=.7;g.beginPath();g.moveTo(-8,hip-2.2);g.lineTo(0,hip+.4);g.lineTo(8,hip-2.2);g.stroke();
   // a gorget under the chin
   fo(g,H.poly(g,[-5.2,sh+.2,5.2,sh+.2,3.6,sh+3.2,-3.6,sh+3.2]),ARD,.8);
   // veins of crimson light running out from the core, brightening with each beat
   const cx=.6,cy=sh+7.4;g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.beginPath();g.moveTo(cx-2,cy);g.lineTo(-4.4,cy-2.4);g.lineTo(-7.4,cy-3.4);g.moveTo(cx+2,cy);g.lineTo(4.8,cy-2.2);g.lineTo(8,cy-3.6);g.moveTo(cx-1.6,cy+2);g.lineTo(-3.4,cy+6);g.lineTo(-2.6,hip-3.6);g.moveTo(cx+1.6,cy+2);g.lineTo(3.8,cy+5.6);g.lineTo(3.2,hip-3.4);
     for(const[lw,a,cc]of[[1.8,.22,CR],[.55,.85,GLO]]){g.globalAlpha=a*(.35+.65*b);g.strokeStyle=cc;g.lineWidth=lw;g.stroke()}g.restore();
   // the core: a crimson stone in a black claw setting, glowing on every beat
   fo(g,H.poly(g,[cx,cy-4.6,cx+3.6,cy,cx,cy+4.6,cx-3.6,cy]),ARD,.9);
   fo(g,H.poly(g,[cx,cy-3,cx+2.3,cy,cx,cy+3,cx-2.3,cy]),CR,.7);
   H.glow(g,cx,cy,4.5+4*b,GLO,.3+.55*b);g.fillStyle='rgba(255,220,225,'+(.5+.5*b)+')';g.beginPath();g.arc(cx-.5,cy-.8,.75,0,TAU);g.fill();
   // the far pauldron
   pauld(g,-w+.6,sh+2.6,-1,.88)},
  // the near pauldron, over the arm
  front(g,c){const w=(c.gd==1?10.4:c.gd==2?8.8:9.5)+.6;pauld(g,w-.4,c.sh+2.8,1,1,1)},
  head(g,c){const hy=c.hy,b=beat(c.t),gl=.4+.6*b;
   // great horns sweeping out from behind the helm, their tips smouldering
   for(const s of[-1,1]){const o=s<0?-.8:0;horn(g,[s*10+o,hy-11,s*18.4+o,hy-12,s*22+o,hy-23,s*16+o,hy-35],4.2,'#241e2c',gl,3,0,.5,.96)}
   // the crown: blades rising from the helm, the middle one tallest, a seam of crimson light up each of the three great ones
   const BL=[[-10.6,-25.6,-2.4,2.6],[-4.8,-31.4,-.9,3.6],[1,-36,0,3.9],[6.8,-32.6,.9,3.6],[12.2,-26,2.4,2.6]];
   fo(g,()=>{g.beginPath();for(const[x,ty,ln,hw]of BL){g.moveTo(x-hw,hy-16);g.quadraticCurveTo(x-hw*.45+ln*.3,hy-24,x+ln,hy+ty);g.quadraticCurveTo(x+hw*.45+ln*.3,hy-24,x+hw,hy-16);g.closePath()}},AR,.9);
   g.save();g.lineCap='round';g.globalCompositeOperation='lighter';g.globalAlpha=.3*gl;g.strokeStyle=CR;g.lineWidth=1.6;const SEAM=()=>{g.beginPath();for(let i=1;i<4;i++){const[x,ty,ln]=BL[i];g.moveTo(x+.2,hy-22);g.quadraticCurveTo(x+.3+ln*.3,hy-26,x+ln*.9,hy+ty+2.6)}};SEAM();g.stroke();
   g.globalCompositeOperation='source-over';g.globalAlpha=.5+.5*gl;g.strokeStyle='#ff3550';g.lineWidth=.5;g.stroke();g.restore();
   // the helm: a rounded crowned cap with a widow's-peak brow and cheek guards, open over the face; the fringe falls from under its brow
   H.celf(g,()=>{g.beginPath();g.moveTo(-9.8,hy+9.6);g.quadraticCurveTo(-13.8,hy+2,-13.3,hy-7);g.bezierCurveTo(-12.9,hy-18,-8,hy-23.6,1,hy-24);g.bezierCurveTo(10,hy-23.6,14.3,hy-18,13.9,hy-7);g.quadraticCurveTo(14.5,hy+2,11.6,hy+9.6);
    g.quadraticCurveTo(11.4,hy+4,10.6,hy+1);g.lineTo(11.2,hy-6);g.quadraticCurveTo(6.4,hy-7.6,1.4,hy-4.4);g.quadraticCurveTo(-3.8,hy-7.6,-9.6,hy-6);g.lineTo(-10.2,hy+1);g.quadraticCurveTo(-10.6,hy+5,-9.8,hy+9.6);g.closePath()},AR,1.1);
   // sheen on the dome and a raised crest down its middle
   g.lineCap='round';g.strokeStyle='rgba(200,190,235,.38)';g.lineWidth=1.2;g.beginPath();g.moveTo(-10,hy-15.6);g.quadraticCurveTo(-6,hy-21,-.6,hy-21.8);g.stroke();
   g.strokeStyle=ARD;g.lineWidth=.8;g.beginPath();g.moveTo(1.6,hy-12.4);g.quadraticCurveTo(1.6,hy-19,1.1,hy-23.6);g.stroke();g.strokeStyle=ARL;g.lineWidth=.5;g.beginPath();g.moveTo(2.4,hy-12.4);g.quadraticCurveTo(2.4,hy-19,1.9,hy-23.2);g.stroke();
   // silver trim along the brow
   g.strokeStyle=SV;g.lineWidth=.7;g.beginPath();g.moveTo(-10.1,hy-6.5);g.quadraticCurveTo(-3.8,hy-8.3,1.4,hy-5.1);g.quadraticCurveTo(6.4,hy-8.3,11.6,hy-6.5);g.stroke();
   // a jewel in the brow that beats with the core
   fo(g,H.poly(g,[1.4,hy-12.4,2.9,hy-9.8,1.4,hy-7.4,-.1,hy-9.8]),CR,.6);H.glow(g,1.4,hy-9.8,2.5+2*b,GLO,.25+.5*b)}});
})()}catch(e){console.error('COS crimson',e)}
