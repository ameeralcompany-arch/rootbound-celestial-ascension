// ===== Cosmetic art: Sakura Festival (a summer festival evening: cherry blossoms in red, pink and cream). Drawn on the in-game body in its own cel style (COS1.H).
// Body space: feet at 0, facing right (+x is the front), shoulders c.sh (about -37), hips c.hip (about -21), torso about 19 wide; the head layer is in head
// space (head centre c.hy, about -50; face x -10..10, y hy-10..hy+12). The canvas mirrors for facing left, so the yukata collar flips with c.f (left over right). =====
try{(()=>{const C=COS1,H=C.H,TAU=6.2832,sin=Math.sin,cos=Math.cos,abs=Math.abs,cl=(v,a,b)=>v<a?a:v>b?b:v,OL=H.OL;
 // a cherry blossom: five notched petals in one path, filled and outlined, with a pale heart
 function bloom(g,x,y,r,a0,col,heart,ln,lw){g.beginPath();for(let i=0;i<5;i++){const a=a0+i*1.2566,bx=x+cos(a-.6)*r*.16,by=y+sin(a-.6)*r*.16;if(i)g.lineTo(bx,by);else g.moveTo(bx,by);
   g.quadraticCurveTo(x+cos(a-.68)*r*.86,y+sin(a-.68)*r*.86,x+cos(a-.34)*r,y+sin(a-.34)*r);g.quadraticCurveTo(x+cos(a-.14)*r*1.1,y+sin(a-.14)*r*1.1,x+cos(a)*r*.8,y+sin(a)*r*.8);g.quadraticCurveTo(x+cos(a+.14)*r*1.1,y+sin(a+.14)*r*1.1,x+cos(a+.34)*r,y+sin(a+.34)*r);g.quadraticCurveTo(x+cos(a+.68)*r*.86,y+sin(a+.68)*r*.86,x+cos(a+.6)*r*.16,y+sin(a+.6)*r*.16)}
  g.closePath();g.fillStyle=col;g.fill();g.strokeStyle=ln||OL;g.lineWidth=lw||.6;g.stroke();g.fillStyle=heart;g.beginPath();g.arc(x,y,r*.36,0,TAU);g.fill()}
 // a tiny print blossom: five round petals added to the current path, so a whole print is one fill
 const dot5=(g,x,y,r,a0)=>{for(let i=0;i<5;i++){const a=a0+i*1.2566,px=x+cos(a)*r*.6,py=y+sin(a)*r*.6;g.moveTo(px+r*.46,py);g.arc(px,py,r*.46,0,TAU)}};

 // ---- Sakura Yukata: a cream festival yukata printed with cherry blossoms, a pink dyed hem, crossed collar (left over right) with a red under-collar,
 // wide hanging sleeves, a red obi with pink obiage, a cream cord and a blossom clasp, and a butterfly bow at the back whose wings bob and tails swing
 const YC='#f8ede0',YH='#f4c6d2',PK='#f390ae',PD='#d9486e',OB='#c32d49',OBP='#f7a9be',CR='#fff3dc';
 const SPOTS=[[-4.6,3.6],[4.4,6.6],[-1.6,11],[-8,9.4],[1.4,1.6],[7.2,12]];
 C.art('cos_sakura_yukata',{hb:1,oc:YC,
  back(g,c){/* the look's own short cape is drawn right after this layer and would hide the bow: a yukata is worn without it (the look object is fresh each draw) */if(c.L)c.L.cape=0;
   const gd=c.gd,Wh=gd==1?9.8:gd==2?8.9:9.2,x0=0,y0=0,b=sin(c.t*7)*(c.run?.8:.2),sw=H.sw(c),lf=c.air?-2.6:0;g.translate(-Wh-.2,c.hip-5);g.scale(.86,.86);
   // two tails hanging under the bow, swinging behind you
   for(let k=1;k>=0;k--){const tx=x0-2-k*2.6+sw*(.55+k*.25),ty=y0+11.5-k*2.2+lf;H.celf(g,()=>{g.beginPath();g.moveTo(x0-1.2,y0+.8);g.quadraticCurveTo(x0-1.8-k+sw*.2,y0+6,tx,ty);g.lineTo(tx+2.4,ty-.6);g.quadraticCurveTo(x0+.2-k,y0+5.4,x0+.8,y0+.8);g.closePath()},k?OBP:OB,.9)}
   // the two wings of the bow (up and down behind the back), each with its pink lining and a crease
   for(const s of[-1,1]){const bb=b*s;H.celf(g,()=>{g.beginPath();g.moveTo(x0+.4,y0+s*.4);g.bezierCurveTo(x0-1,y0+s*8.2+bb,x0-8.8,y0+s*10.8+bb,x0-11,y0+s*6.6+bb);g.quadraticCurveTo(x0-12,y0+s*2.6+bb*.5,x0-7.4,y0+s*1.6);g.quadraticCurveTo(x0-3.4,y0+s*.9,x0+.4,y0+s*.4);g.closePath()},OB,1);
    g.fillStyle=OBP;g.beginPath();g.moveTo(x0-2.4,y0+s*2.2);g.quadraticCurveTo(x0-6.4,y0+s*8+bb,x0-9.8,y0+s*6.4+bb);g.quadraticCurveTo(x0-6.8,y0+s*4.2,x0-2.4,y0+s*2.2);g.fill()}
   H.celf(g,()=>{g.beginPath();g.ellipse(x0-.9,y0,2.3,3.3,0,0,TAU)},OB,.9);g.strokeStyle='rgba(60,10,30,.45)';g.lineWidth=.6;g.beginPath();g.moveTo(x0-1.6,y0-2.4);g.lineTo(x0-1.6,y0+2.4);g.stroke()},
  torso(g,c){const sh=c.sh,hip=c.hip,gd=c.gd,W=gd==1?11.1:gd==2?9.6:10.3,Wh=gd==1?9.8:gd==2?8.9:9.2,m=c.f<0?-1:1,ls=c.ls||0,a=abs(ls),air=!!c.air,vx=c.vx||0,
    sway=cl(-vx*.02,-4,4)+sin(c.t*2.8)*.5,f1=2.8+ls*6,f2=-2.8-ls*6,fF=air?5.8:Math.max(f1,f2),fB=air?-5.8:Math.min(f1,f2),
    hx=Math.max(Wh-.6,fF+4),bx=Math.min(-Wh+.6,fB-4)+Math.min(0,sway)*.6,hyF=air?-6.6:-7.4-a*3.6,hyB=air?-6.2+sin(c.t*9)*.7:-7.4-a*.6,hm=Math.max(hyB,hyF)+1;
   // the far sleeve, hanging just behind your back and trailing as you move
   const fs=cl(-vx*.012,-2.5,2.5)+(air?-1:0)+(c.as||0)*-1.2;H.celf(g,()=>{g.beginPath();g.moveTo(-W+1.2,sh+1.4);g.quadraticCurveTo(-W-2.4,sh+1.8,-W-2.9+fs*.5,sh+7);g.lineTo(-W-3.3+fs,hip-2.4);g.quadraticCurveTo(-W-3.2+fs,hip+.4,-W-.4+fs*.6,hip+.2);g.lineTo(-W+1.4,hip-2);g.closePath()},'#efdfd0',1);
   const robe=()=>{g.beginPath();g.moveTo(-W,sh+1.3);g.quadraticCurveTo(-W-.5,(sh+hip)/2,-Wh,hip-.5);g.quadraticCurveTo(-Wh-.2+sway*.15,hip+7,bx,hyB);g.quadraticCurveTo((bx+hx)/2,hm,hx,hyF);g.quadraticCurveTo(Wh+.6,hip+6,Wh,hip-.5);g.quadraticCurveTo(W+.5,(sh+hip)/2,W,sh+1.3);g.quadraticCurveTo(0,sh-.4,-W,sh+1.3);g.closePath()};
   robe();g.fillStyle=H.shade(YC,-.28);g.fill();g.save();robe();g.clip();g.translate(1.3,-1);robe();g.fillStyle=YC;g.fill();g.translate(-1.3,1);
   // pink dyed hem
   g.strokeStyle=YH;g.lineWidth=5.6;g.beginPath();g.moveTo(bx-3,hyB);g.quadraticCurveTo((bx+hx)/2,hm,hx+3,hyF);g.stroke();
   // the blossom print (two pinks), then pale hearts
   g.beginPath();dot5(g,-6.2,sh+4.4,1.8,.3);dot5(g,-4.6,hip+3.6,2,1.1);dot5(g,4.4,hip+6.6,1.8,.6);dot5(g,-1.6,hip+11,1.6,1.7);g.fillStyle=PK;g.fill();
   g.beginPath();dot5(g,-8,hip+9.4,1.3,.4);dot5(g,1.4,hip+1.6,1.2,.9);dot5(g,7.2,hip+12,1.3,1.4);g.fillStyle=PD;g.fill();
   g.fillStyle=CR;g.beginPath();for(const p of SPOTS){g.moveTo(p[0]+.6,hip+p[1]);g.arc(p[0],hip+p[1],.6,0,TAU)}g.moveTo(-5.6,sh+4.4);g.arc(-6.2,sh+4.4,.6,0,TAU);g.fill();
   // the front panel's edge, parting a little at the hem as you stride
   const ex=m*-3.4,eb=m*-3.8;g.strokeStyle='rgba(90,40,60,.45)';g.lineWidth=.7;g.beginPath();g.moveTo(ex,hip-1);g.quadraticCurveTo(ex,hip+5,eb,hm-.6);g.stroke();
   if(a>.2&&!air){g.fillStyle='#b8385a';g.beginPath();g.moveTo(eb,hm-a*4);g.lineTo(eb-m*a*1.1,hm+1);g.lineTo(eb+m*a*1.3,hm+1);g.closePath();g.fill()}
   g.restore();robe();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();
   // obi: pink obiage peeking over it, a cream cord round the middle and a blossom clasp
   const Wo=(W+Wh)/2+.2,ot=hip-8.4,ob=hip-1.5;
   g.strokeStyle=OBP;g.lineWidth=1.3;g.beginPath();g.moveTo(-Wo+.6,ot+.2);g.quadraticCurveTo(0,ot-1.4,Wo-.6,ot+.2);g.stroke();
   H.celf(g,()=>{g.beginPath();g.moveTo(-Wo,ot);g.quadraticCurveTo(0,ot-.9,Wo,ot);g.lineTo(Wo+.1,ob);g.quadraticCurveTo(0,ob+.8,-Wo-.1,ob);g.closePath()},OB,1);
   g.strokeStyle=CR;g.lineWidth=.9;g.beginPath();g.moveTo(-Wo+.2,hip-4.9);g.quadraticCurveTo(0,hip-4.3,Wo-.2,hip-4.9);g.stroke();
   bloom(g,m*.8,hip-4.7,1.8,.3,'#ffb3c8',PD,'#8c1f3c',.45);
   // crossed collar: the open throat, the under lapel, then the top lapel (each with its red under-collar along the opening)
   const nk=gd==1?4.1:gd==2?3:3.5,ty=sh+.3,cy=sh+5.8;
   g.fillStyle=(c.L&&c.L.skin)||'#f1c9a0';g.beginPath();g.moveTo(-nk-.6,ty);g.lineTo(nk+.6,ty);g.lineTo(m*.4,cy+.6);g.closePath();g.fill();
   H.celf(g,H.poly(g,[m*(-nk-1.8),ty-.7,m*(-nk+1.4),ty-.7,m*3,cy+1.2,m*.4,cy+2.8]),YC,.8);
   g.fillStyle=OB;g.beginPath();g.moveTo(m*(-nk+1.4),ty-.5);g.lineTo(m*(-nk+2.6),ty-.5);g.lineTo(m*3.2,cy+.2);g.lineTo(m*2.7,cy+1.3);g.closePath();g.fill();
   H.celf(g,H.poly(g,[m*(nk+1.9),ty-.7,m*(nk-1.2),ty-.7,m*-(Wo-2.3),ot+.2,m*-(Wo-5.4),ot+.2]),YC,.8);
   g.fillStyle=OB;g.beginPath();g.moveTo(m*(nk-1.2),ty-.5);g.lineTo(m*(nk-2.4),ty-.5);g.lineTo(m*-(Wo-1.1),ot);g.lineTo(m*-(Wo-2.3),ot);g.closePath();g.fill();
   // the near sleeve: a wide sleeve bag hanging behind the near arm, swinging with it and lifting in the air
   const ash=gd==1?.6:gd==2?-.4:0,d=(c.as||0)*2.2+cl(-vx*.012,-2.5,2.5)*.6,lf=air?-2:0;
   const slv=()=>{g.beginPath();g.moveTo(3.8+ash,sh+1);g.quadraticCurveTo(9+ash,sh-.4,12.2+ash,sh+2.2);g.quadraticCurveTo(13.4+d*.5,sh+8,13.8+d,hip-4+lf);g.quadraticCurveTo(14+d,hip+1.6+lf,9.4+d,hip+1.6+lf);g.quadraticCurveTo(5.2+d*.6,hip+1.4+lf,4.6+d*.4,hip-3);g.closePath()};
   H.celf(g,slv,YC,1);g.beginPath();dot5(g,11.8+d,hip-1.2+lf,1.6,.8);g.fillStyle=PK;g.fill()}});

 // ---- Blossom Kanzashi: a cluster of silk cherry blossoms and a bud pinned above the ear, with a little gold bar from which four strands of
 // petals hang; the strands sway with time, trail behind you when you run, bounce with your steps and float up in the air
 const KP='#f7a1bb',KL='#ffd8e4',KD='#e0577c',KW='#fff4ee',GO='#e9c46c',SL=[8.6,11.6,10,7.2],SE=new Float32Array(16);
 C.art('cos_kanzashi',{
  head(g,c){const hy=c.hy,x0=-10.6,y0=hy-8.2,sw=H.sw(c),t=c.t,air=c.air,run=c.run,by=y0+3.2;
   for(let i=0;i<4;i++){const ax=x0-4.2+i*1.45,an=cl(sw*.07,-.7,.7)-.06+sin(t*3.1+i*.9)*.06+(run?sin(t*13+i*.8)*.08:0)+(air?(i-1.5)*.14-.12:0),L=SL[i]*(air?.8:1);
    SE[i*4]=ax;SE[i*4+1]=an;SE[i*4+2]=ax+sin(an)*L;SE[i*4+3]=by+cos(an)*L}
   // the strands: fine gold threads, a little curved as they swing
   g.lineCap='round';g.strokeStyle='#d6bd7e';g.lineWidth=.45;g.beginPath();for(let i=0;i<4;i++){const ax=SE[i*4],ex=SE[i*4+2],ey=SE[i*4+3];g.moveTo(ax,by);g.quadraticCurveTo(ax+(ex-ax)*.3,by+(ey-by)*.55,ex,ey)}g.stroke();
   // a bead halfway down each strand, a petal at each end
   g.fillStyle=KL;g.beginPath();for(let i=0;i<4;i++){const ax=SE[i*4],ex=SE[i*4+2],ey=SE[i*4+3],mx=ax+(ex-ax)*.42,my=by+(ey-by)*.5;g.moveTo(mx+.6,my);g.arc(mx,my,.6,0,TAU)}g.fill();
   g.strokeStyle='#b9466c';g.lineWidth=.35;for(let k=0;k<2;k++){g.fillStyle=k?KW:KP;g.beginPath();for(let i=k;i<4;i+=2){const an=SE[i*4+1],ex=SE[i*4+2],ey=SE[i*4+3],ux=sin(an),uy=cos(an);g.moveTo(ex,ey);g.quadraticCurveTo(ex+uy*1.5+ux*.6,ey-ux*1.5+uy*.6,ex+ux*2.3-uy*.35,ey+uy*2.3+ux*.35);g.lineTo(ex+ux*1.9,ey+uy*1.9);g.lineTo(ex+ux*2.3+uy*.35,ey+uy*2.3-ux*.35);g.quadraticCurveTo(ex-uy*1.5+ux*.6,ey+ux*1.5+uy*.6,ex,ey)}g.fill();g.stroke()}
   // the gold bar the strands hang from
   g.fillStyle=GO;g.strokeStyle=OL;g.lineWidth=.5;g.beginPath();g.rect(x0-3.4,by-.7,5.6,1.3);g.fill();g.stroke();
   // the blossoms: a cream one behind, the big pink one, a small deep one and a bud
   bloom(g,x0+3.2,y0-3,2.6,.5,KW,KP,OL,.55);
   g.fillStyle=KP;g.strokeStyle=OL;g.lineWidth=.5;g.beginPath();g.moveTo(x0-6,y0-5.8);g.quadraticCurveTo(x0-2.6,y0-6.2,x0-2.4,y0-2.6);g.quadraticCurveTo(x0-5.2,y0-2.4,x0-6,y0-5.8);g.closePath();g.fill();g.stroke();g.fillStyle=KL;g.beginPath();g.ellipse(x0-4.4,y0-4.7,.7,1.1,-.8,0,TAU);g.fill();
   bloom(g,x0,y0,3.3,-.2,KP,KL,OL,.6);
   bloom(g,x0-2.8,y0+2.4,1.9,.9,KD,KL,OL,.5);
   // stamens on the big blossom, and a glint
   g.fillStyle=GO;g.beginPath();for(let i=0;i<5;i++){const a=i*1.2566+.4;g.moveTo(x0+cos(a)*1.5+.35,y0+sin(a)*1.5);g.arc(x0+cos(a)*1.5,y0+sin(a)*1.5,.35,0,TAU)}g.fill();
   g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(x0+1,y0-1.9,.9,.5,-.5,0,TAU);g.fill()}});

 // ---- Paper Umbrella: a red wagasa slung on the back with its canopy half open, pointing up behind the far shoulder: pleated paper over fine ribs,
 // a cream ring band, a dark wrapped tip and a bamboo shaft and runner; it bobs with your steps and tips back when you jump
 const UR='#d3303f',UK='#7a1828',UC='#f7ebd3',BB='#d9b57c';
 C.art('cos_wagasa',{
  back(g,c){const sh=c.sh,t=c.t,vx=c.vx||0,wob=(c.run?sin(t*14)*.04:sin(t*2.2)*.012)-cl(vx*.0003,-.07,.07)+(c.air?.08:0);
   g.translate(-9.4,sh+3);g.rotate(-2.42+wob);/* local +x runs from the strap on your back out to the tip; the shaft runs to -x behind the body */
   // shaft and the stretcher ribs meeting at the runner
   g.lineCap='round';g.strokeStyle=OL;g.lineWidth=2.6;g.beginPath();g.moveTo(-14,0);g.lineTo(6,0);g.stroke();g.strokeStyle=BB;g.lineWidth=1.3;g.stroke();
   g.strokeStyle='#b48c55';g.lineWidth=.5;g.beginPath();for(const k of[-3.6,-1.8,1.8,3.6]){g.moveTo(-1.6,k*.12);g.lineTo(4.6,k)}g.stroke();
   g.fillStyle=UK;g.beginPath();g.ellipse(-1.8,0,.9,1.3,0,0,TAU);g.fill();
   // the canopy: pleated paper from the rim to the tip, a little scalloped at the rim
   const cnp=()=>{g.beginPath();g.moveTo(27.6,0);g.quadraticCurveTo(16,-3.6,4.2,-4.6);g.quadraticCurveTo(3.2,-3.4,4.4,-2.3);g.quadraticCurveTo(3.4,-1.2,4.4,0);g.quadraticCurveTo(3.4,1.2,4.4,2.3);g.quadraticCurveTo(3.2,3.4,4.2,4.6);g.quadraticCurveTo(16,3.6,27.6,0);g.closePath()};
   cnp();g.fillStyle=H.shade(UR,-.3);g.fill();g.save();cnp();g.clip();g.translate(.9,-1.1);cnp();g.fillStyle=UR;g.fill();g.translate(-.9,1.1);
   // the cream ring band, the folds of paper over each rib, and the shadowed underside
   g.fillStyle=UC;g.beginPath();g.moveTo(12,-6);g.lineTo(14.8,-6);g.lineTo(14.8,6);g.lineTo(12,6);g.closePath();g.fill();
   g.strokeStyle='rgba(90,10,30,.5)';g.lineWidth=.5;g.beginPath();for(const k of[-3,-1.5,0,1.5,3]){g.moveTo(26.4,k*.06);g.quadraticCurveTo(15,k*.86,4.4,k*1.3)}g.stroke();
   g.fillStyle='rgba(70,8,24,.35)';g.fillRect(3,1.7,25,5);g.restore();
   cnp();g.strokeStyle=OL;g.lineWidth=.95;g.stroke();
   // the rim's rib tips, and the dark wrapped tip with its paper band
   g.fillStyle=BB;g.beginPath();for(const k of[-4.6,-2.3,0,2.3,4.6]){g.moveTo(4.6,k);g.arc(4.2,k,.42,0,TAU)}g.fill();
   H.celf(g,()=>{g.beginPath();g.moveTo(24.4,-1.05);g.quadraticCurveTo(28.8,-1.05,29,0);g.quadraticCurveTo(28.8,1.05,24.4,1.05);g.closePath()},'#3a2232',.7);
   g.fillStyle=UC;g.fillRect(23.6,-1.25,.8,2.5)},
  torso(g,c){/* the carrying cord across the chest */const sh=c.sh,hip=c.hip;g.lineCap='round';g.strokeStyle=OL;g.lineWidth=1.9;g.beginPath();g.moveTo(-7.4,sh+1.6);g.quadraticCurveTo(-1,sh+7.6,7.4,hip-3.4);g.stroke();g.strokeStyle='#a8233a';g.lineWidth=1;g.stroke()}});

 // ---- Festival Fox Mask: a white fox mask pushed up onto the side of the head and tilted, leaving the face free: pink ears, slanted eye slits with red
 // flicks, round red brow marks, red cheek stripes and a black nose; a red cord ties it on, its two tassels swinging
 const FW='#fbf6ee',FR='#dc3049',FP='#f59ab2';
 C.art('cos_fox_mask',{
  head(g,c){const hy=c.hy,sw=H.sw(c),t=c.t,bo=c.run?sin(t*14)*.04:sin(t*2.2)*.012,lift=c.air?-.07:0;
   // the cord: from the mask's back edge round behind the head, with a knot and two tassels hanging below it
   const kx=-13.2,ky=hy-9.6;g.lineCap='round';g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.moveTo(-10.6,hy-14.6);g.quadraticCurveTo(-13.2,hy-13,kx,ky);g.stroke();g.strokeStyle=FR;g.lineWidth=.8;g.stroke();
   for(let k=0;k<2;k++){const ex=kx-.6+k*1.2+sw*(.45+k*.15)+(c.run?sin(t*13+k)*.4:0),ey=ky+6.4-k*.8+(c.air?-1.6:0);g.strokeStyle=FR;g.lineWidth=.8;g.beginPath();g.moveTo(kx,ky);g.quadraticCurveTo(kx-.3+k*.6,ky+3,ex,ey);g.stroke();g.fillStyle=FR;g.strokeStyle=OL;g.lineWidth=.4;g.beginPath();g.ellipse(ex,ey+.6,.65,1.1,0,0,TAU);g.fill();g.stroke()}
   g.fillStyle=FR;g.strokeStyle=OL;g.lineWidth=.5;g.beginPath();g.arc(kx,ky,.95,0,TAU);g.fill();g.stroke();
   // the mask itself, in its own space (snout down, ears up), tilted onto the side of the head
   g.save();g.translate(-7.4,hy-14);g.rotate(.42+bo+lift);g.scale(.72,.78);
   const face=()=>{g.beginPath();g.moveTo(0,8.4);g.quadraticCurveTo(-3.4,6.6,-5.4,2.6);g.quadraticCurveTo(-7,-.6,-6,-3.6);g.quadraticCurveTo(-7.6,-8.6,-5.6,-12.4);g.quadraticCurveTo(-3.2,-9.4,-2,-6.6);g.quadraticCurveTo(0,-7.4,2,-6.6);g.quadraticCurveTo(3.2,-9.4,5.6,-12.4);g.quadraticCurveTo(7.6,-8.6,6,-3.6);g.quadraticCurveTo(7,-.6,5.4,2.6);g.quadraticCurveTo(3.4,6.6,0,8.4);g.closePath()};
   H.celf(g,face,FW,1.35);
   g.fillStyle=FP;g.beginPath();g.moveTo(-5,-4.6);g.quadraticCurveTo(-6,-8,-5.2,-10.6);g.quadraticCurveTo(-3.6,-8.2,-2.8,-6.6);g.closePath();g.moveTo(5,-4.6);g.quadraticCurveTo(6,-8,5.2,-10.6);g.quadraticCurveTo(3.6,-8.2,2.8,-6.6);g.closePath();g.fill();
   // eye slits with red flicks, round brow marks, cheek stripes, the nose
   g.fillStyle=OL;g.beginPath();for(const s of[-1,1]){g.moveTo(s*1.1,-.5);g.quadraticCurveTo(s*3,-.1,s*4.7,-2.5);g.quadraticCurveTo(s*2.8,-1.9,s*1.1,-.5)}g.fill();
   g.strokeStyle=FR;g.lineWidth=1.1;g.beginPath();for(const s of[-1,1]){g.moveTo(s*.9,-1.7);g.quadraticCurveTo(s*3.4,-1.9,s*5.8,-4.8)}g.stroke();
   g.lineWidth=.9;g.beginPath();for(const s of[-1,1]){g.moveTo(s*3.2,2.2);g.quadraticCurveTo(s*4.5,2.9,s*5.5,1.8)}g.stroke();
   g.fillStyle=FR;g.beginPath();g.ellipse(-2.3,-4.7,1.05,.62,-.3,0,TAU);g.ellipse(2.3,-4.7,1.05,.62,.3,0,TAU);g.fill();
   g.fillStyle=OL;g.beginPath();g.ellipse(0,7,1.5,1,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-2.6,-8.8,.9,1.6,.5,0,TAU);g.fill();
   g.restore()}});
})()}catch(e){console.error('COS sakura',e)}
