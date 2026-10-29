// ===== V6 anime character renderer (layered, cel-shaded, animated) + presence of celestial cosmetics =====
const AC6=(()=>{
 const sc=new Map(),OL='#140c1c';
 function shade(h,k){const key=h+k;let v=sc.get(key);if(v)return v;const n=parseInt(h.slice(1),16);let r=n>>16,g2=n>>8&255,b=n&255;if(k<0){r*=1+k;g2*=1+k;b*=1+k;r*=.94;b*=1.04}else{r+=(255-r)*k;g2+=(255-g2)*k;b+=(255-b)*k}v='rgb('+Math.max(0,Math.min(255,r|0))+','+Math.max(0,Math.min(255,g2|0))+','+Math.max(0,Math.min(255,b|0))+')';if(sc.size>400)sc.clear();sc.set(key,v);return v}
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // cel-shaded fill: dark base, lit shape offset toward the light, outline
 function celf(g,path,col,lw){path();g.fillStyle=shade(col,-.38);g.fill();g.save();path();g.clip();g.translate(1.7,-1.3);path();g.fillStyle=col;g.fill();g.restore();path();g.strokeStyle=OL;g.lineWidth=lw||1.1;g.stroke()}
 const poly=(g,pts,close)=>()=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);if(close!==false)g.closePath()};
 function limb(g,x1,y1,x2,y2,w,col){g.lineCap='round';g.strokeStyle=OL;g.lineWidth=w+2.2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle=col;g.lineWidth=w;g.stroke();g.strokeStyle=shade(col,-.3);g.lineWidth=w*.35;g.beginPath();g.moveTo(x1-.7,y1+.6);g.lineTo(x2-.7,y2+.6);g.stroke()}
 // hair table: back = shape behind head; top = spike count/height; bang = fringe drop; side = part offset
 const HS=[{back:'short',top:5,th:10,bang:5,sw:1},{back:'tail',top:3,th:6,bang:5,sw:1},{back:'short',top:0,th:0,bang:7,sw:-1},{back:'shoulder',top:6,th:13,bang:6,sw:1},{back:'none',top:3,th:5,bang:3,sw:1},{back:'long',top:4,th:8,bang:6,sw:1},{back:'none',top:0,th:2,bang:3,sw:1},{back:'shoulder',top:2,th:4,bang:8,sw:-1},{back:'straight',top:0,th:0,bang:6,sw:1},{back:'twin',top:0,th:2,bang:6,sw:-1}]; // 8 long straight, 9 twin tails (v8)
 const HSN=HS.map(h=>Object.assign({},h,{top:0})); // same styles without the top spikes (worn under hoods/caps)
 function hairBack(g,h,hy,hair,hs,t){const c=hair,sw=hs;
  if(h.back=='none')return;if(h.back=='twin'){for(const s of[-1,1])celf(g,()=>{const x0=s<0?-8.6:7.6,sx=s<0?-1:1,w=Math.sin(t*2.4+s)*1.2;g.beginPath();g.moveTo(x0-sx*1.5,hy-9);g.bezierCurveTo(x0+sx*6,hy-11,x0+sx*7.5-sw*.4,hy+6,x0+sx*4.5-sw*.7+w,hy+26);g.bezierCurveTo(x0+sx*2-sw*.4,hy+16,x0+sx*1.4,hy+4,x0-sx*1.2,hy-3);g.closePath()},c,1.1);return}celf(g,()=>{g.beginPath();
   if(h.back=='tail'){g.moveTo(-5,hy-6);g.bezierCurveTo(-14-sw*.5,hy-6,-22-sw,hy+6,-17-sw*1.6,hy+22);g.bezierCurveTo(-13-sw,hy+12,-10,hy+8,-6,hy+6)}
   else if(h.back=='long'){g.moveTo(-9,hy-4);g.bezierCurveTo(-16-sw*.3,hy+6,-14-sw*.6,hy+20,-11-sw,hy+30);g.lineTo(5,hy+28);g.bezierCurveTo(8,hy+16,9,hy+4,8,hy-4)}
   else if(h.back=='straight'){g.moveTo(-9,hy-4);g.bezierCurveTo(-13.5,hy+8,-12.5,hy+24,-10.5-sw*.7,hy+38);g.lineTo(5,hy+36);g.bezierCurveTo(8,hy+20,9.4,hy+6,8,hy-4)}
   else if(h.back=='shoulder'){g.moveTo(-9,hy-4);g.bezierCurveTo(-14,hy+6,-13-sw*.3,hy+14,-11-sw*.5,hy+17);g.lineTo(6,hy+15);g.bezierCurveTo(9,hy+8,9,hy+2,8,hy-4)}
   else{g.moveTo(-8,hy-4);g.quadraticCurveTo(-11,hy+6,-6,hy+10);g.lineTo(6,hy+9);g.quadraticCurveTo(9,hy+4,8,hy-4)}g.closePath()},c,1.1)}
 function hairFront(g,h,hy,hair,hs,t,air){const dn=h.bang,sw=h.sw;
  // skull cap
  celf(g,()=>{g.beginPath();g.moveTo(-10.6,hy+1);g.bezierCurveTo(-12,hy-10,-6,hy-15,1,hy-15);g.bezierCurveTo(8,hy-15,12,hy-9,10.8,hy+1);g.lineTo(9,hy-3.5);
   // fringe: jagged locks along the brow
   const n=5;for(let i=n;i>=0;i--){const u=i/n,X=-9+u*18,tipY=hy-3+dn*(.55+.45*Math.sin(i*1.9+1)),mx=X+sw*2.2+hs*.05;g.lineTo(mx,tipY+(i%2?1.5:0));g.lineTo(X-1.7,hy-6.5)}
   g.closePath()},hair,1.1);
  // spikes on top
  if(h.top){celf(g,()=>{g.beginPath();g.moveTo(-9,hy-8);const n=h.top;for(let i=0;i<n;i++){const u=(i+.5)/n,X=-9+u*18,Hh=h.th*(.7+.5*Math.sin(i*2.3+.7)+(air?.15:0));g.lineTo(X-2.2,hy-11);g.lineTo(X+sw*3.2+hs*.25,hy-12-Hh);g.lineTo(X+2.2,hy-11)}g.lineTo(9,hy-8);g.closePath()},hair,1)}
  // sheen
  g.save();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.3;g.beginPath();g.moveTo(-5,hy-11);g.quadraticCurveTo(0,hy-14,5,hy-11);g.stroke();g.restore()}
 function eye(g,x,y,sx,es,col,blink,far){const w=(es==3?3.1:2.7)*sx,ht=es==3?4.6:es==1?3.2:3.8;
  if(blink){g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.moveTo(x-w,y+.5);g.quadraticCurveTo(x,y+2.2,x+w,y);g.stroke();return}
  g.save();g.beginPath();g.moveTo(x-w,y-ht*.4);g.quadraticCurveTo(x,y-ht*1.05,x+w,y-ht*(es==2?.1:.4));g.quadraticCurveTo(x+w*.9,y+ht*.9,x,y+ht*.95);g.quadraticCurveTo(x-w*.9,y+ht*.9,x-w,y-ht*.4);g.closePath();g.fillStyle='#f6f4ff';g.fill();g.clip();
  const gr=g.createLinearGradient(0,y-ht,0,y+ht);gr.addColorStop(0,shade(col,-.55));gr.addColorStop(.6,col);gr.addColorStop(1,shade(col,.55));g.fillStyle=gr;g.beginPath();g.ellipse(x+.3*sx,y+.2,w*.78,ht*.92,0,0,6.3);g.fill();g.fillStyle='#0a0612';g.beginPath();g.ellipse(x+.3*sx,y+.4,w*.34,ht*.42,0,0,6.3);g.fill();
  if(es==1){g.fillStyle='rgba(20,12,28,.35)';g.fillRect(x-w,y-ht*1.2,w*2,ht*.75)}
  g.fillStyle='#fff';g.beginPath();g.arc(x-w*.1*sx,y-ht*.3,w*.3,0,6.3);g.fill();g.globalAlpha=.8;g.beginPath();g.arc(x+w*.4*sx,y+ht*.45,w*.17,0,6.3);g.fill();g.restore();
  g.strokeStyle=OL;g.lineWidth=1.7;g.lineCap='round';g.beginPath();g.moveTo(x-w,y-ht*.4);g.quadraticCurveTo(x,y-ht*1.1,x+w,y-ht*(es==2?.1:.4));g.stroke();g.beginPath();g.moveTo(x+w,y-ht*(es==2?.1:.4));g.lineTo(x+w+1.6*sx,y-ht*(es==2?.1:.4)-.9);g.stroke()}
 function head(g,L,hy,t,air,blink,hs,sx){
  const skin=L.skin,hair=L.hair,h=HS[L.hs];
  // neck
  const gd=L.gd|0,nk=gd==1?3.3:gd==2?2.4:2.8;celf(g,poly(g,[-nk,hy+7,nk,hy+7,nk+.4,hy+14,-nk-.4,hy+14]),shade(skin,-.08),.9);
  // face: angular jaw
  celf(g,()=>{g.beginPath();g.moveTo(-9.6,hy-4);g.bezierCurveTo(-10,hy+3,-7,hy+8,-3,hy+10.6);g.lineTo(1.2,hy+11.2);g.bezierCurveTo(6,hy+9,9.8,hy+5,10,hy-3);g.bezierCurveTo(10,hy-9,-9.6,hy-9,-9.6,hy-4);g.closePath()},skin,1.1);
  // ear
  g.fillStyle=shade(skin,-.15);g.strokeStyle=OL;g.lineWidth=.9;g.beginPath();g.ellipse(-9.4,hy+1.5,1.8,2.6,0,0,6.3);g.fill();g.stroke();
  const ey=hy+1.2,es=L.es;eye(g,-2.6,ey,.85,es,L.eyeCol,blink,1);eye(g,5.6,ey,1,es,L.eyeCol,blink,0);
  // female: fuller upper lash line + flicked lashes; male: heavier brows (gd 0 = classic look, unchanged)
  if(gd==2&&!blink){const ht=es==3?4.6:es==1?3.2:3.8;g.strokeStyle=OL;g.lineCap='round';for(const[x,w,s]of[[5.6,es==3?3.1:2.7,1],[-2.6,(es==3?3.1:2.7)*.85,.85]]){const yt=ey-ht*(es==2?.1:.4);g.lineWidth=2.3;g.beginPath();g.moveTo(x-w*.2,ey-ht*.95);g.quadraticCurveTo(x+w*.6,ey-ht*.9,x+w,yt);g.stroke();g.lineWidth=1;g.beginPath();g.moveTo(x+w,yt);g.lineTo(x+w+1.9*s,yt-2);g.moveTo(x+w*.55,yt-ht*.45);g.lineTo(x+w*.9+1.2*s,yt-ht*.45-1.9);g.stroke()}}
  // brows
  g.strokeStyle=shade(hair,-.5);g.lineWidth=gd==1?2:gd==2?1.2:1.5;g.lineCap='round';const bt=es==2?2.2:es==1?-.3:.6;g.beginPath();g.moveTo(-6,ey-5.6+bt);g.lineTo(-0.6,ey-6.2-bt*.3);g.stroke();g.beginPath();g.moveTo(2.6,ey-6.2-bt*.3);g.lineTo(8.6,ey-5.4+bt);g.stroke();
  // nose + mouth
  g.strokeStyle=shade(skin,-.4);g.lineWidth=.9;g.beginPath();g.moveTo(3.6,ey+3.6);g.lineTo(4.4,ey+5);g.stroke();g.strokeStyle=gd==2?'#c4485e':'#8e4a52';g.lineWidth=gd==2?1.3:1.1;g.beginPath();g.moveTo(1.8,hy+8);g.quadraticCurveTo(3.4,hy+8.6,5,hy+7.8);g.stroke();
  g.fillStyle=gd==1?'rgba(255,120,150,.16)':gd==2?'rgba(255,120,150,.42)':'rgba(255,120,150,.32)';g.beginPath();g.ellipse(-5.6,hy+5.2,2.6,1.5,0,0,6.3);g.ellipse(7.4,hy+5.2,2.6,1.5,0,0,6.3);g.fill();
  // jaw shade
  g.fillStyle='rgba(60,30,70,.12)';g.beginPath();g.moveTo(-8,hy+4);g.quadraticCurveTo(-4,hy+10,1,hy+10.8);g.lineTo(-3,hy+7);g.closePath();g.fill()}
 function drawBody(g,L,o){
  const {t,vx,air,f,sw,wpn,fm,wr}=o,run=Math.abs(vx)>10,ph=t*(run?14:2.4),ls=run?Math.sin(ph):0,as=run?Math.sin(ph+3.1):0,breath=run?0:Math.sin(t*2.2)*.5,bob=(run?Math.abs(Math.sin(ph))*-2.7:breath*.8)+(air?-1:0);
  const hs=clamp(-vx*.018,-6,6)+Math.sin(t*2.6)*1.1+(air?-2:0),blink=(t%4.2)<.13,out=L.out,trim=L.trim,sh=-37+bob,hip=-21+bob*.5;
  const boot=wr.boot&&WEAR[wr.boot]?WEAR[wr.boot].c:'#2a2030',glove=wr.glove&&WEAR[wr.glove]?WEAR[wr.glove].c:L.skin,bodyW=wr.body&&WEAR[wr.body]?WEAR[wr.body].c:null,oc=bodyW||out;
  // equipment art (GEAR7): a worn body piece replaces the outfit's own details; hats, boots and gloves draw from cached sprites
  const G7=GEAR7,GH=wr.hat&&WEAR[wr.hat]?wr.hat:'',GB=wr.body&&WEAR[wr.body]&&G7.has(wr.body,'torso')?wr.body:'',GF=wr.boot&&WEAR[wr.boot]?wr.boot:'',GG=wr.glove&&WEAR[wr.glove]?wr.glove:'',paw=G7.paws(GB),lc=G7.legs(GB);G7.begin(g);
  const of=GB?-1:L.of,ac=GB&&G7.D[GB].arms=='out'?out:oc,gd=L.gd|0,ash=gd==1?.6:gd==2?-.4:0; // gd: body type (shoulder offset)
  const hand=(x0,y0,r)=>{if(GG&&G7.glove(g,GG,x0,y0))return;if(paw&&!GG&&G7.glove(g,GB,x0,y0))return;g.fillStyle=glove;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.arc(x0,y0,r,0,6.3);g.fill();g.stroke()};
  // --- cape (behind)
  if(L.cape){const len=L.cape==2?30:19,fl=clamp(-vx*.03,-10,10)+Math.sin(t*3)*1.5+(air?-6:0);celf(g,()=>{g.beginPath();g.moveTo(-5,sh+2);g.lineTo(6,sh+2);g.bezierCurveTo(8+fl*.3,sh+len*.5,10+fl,sh+len,6+fl*1.3,sh+len+4);g.lineTo(-9+fl*1.4,sh+len+3);g.bezierCurveTo(-11+fl*.6,sh+len*.5,-8,sh+8,-5,sh+2);g.closePath()},shade(trim,-.45),1.1)}
  if(GB){G7.tail(g,GB,-7.5,hip-3.5,t,run,air);if(!(GB=='sparksuit'&&GH=='sparkhood'))G7.put(g,GB,'back',0,sh)}
  g.save();g.translate(0,-43+bob);g.scale(1.16,1.16);g.translate(0,43-bob);hairBack(g,HS[L.hs],-50+bob,L.hair,hs,t);if(GH)G7.hat(g,GH,-50+bob,t,'B',1.16);g.restore();
  // --- far arm
  const swing=sw>0?1-sw/.22:-1,armA=swing>=0?-2.1+3.5*swing:null;
  // aura pose with wings (60-z-aurapose.js): pa = flight pose weight (arms spread, legs together and trailing), pg = grounded levitation (arms open)
  const pz=o.pz,pa=pz?pz.air:0,pg=pz?pz.arms:0,lp=(a,b,k)=>a+(b-a)*k;let fax=-8-as*2.2,fay=hip-3-as*.8;if(pa||pg){fax=lp(lp(fax,-11.5,pg),-16,pa);fay=lp(lp(fay,hip-3.5,pg),sh+12,pa)}
  limb(g,-5-ash,sh+3,fax,fay,4.4,shade(ac,-.2));hand(fax,fay+1,2.4);
  // --- legs
  for(const s of[-1,1]){const lx=s*2.8,lift=air?-5:Math.max(0,s*ls)*5;let fx=lx+(air?s*3:s*ls*6),fy=-2-lift;if(pa){fx=lp(fx,s>0?-4.5:-7.8,pa);fy=lp(fy,s>0?-.5:-3.8,pa)}else if(pg)fx=lp(fx,lx*.55,pg*.7);const pc=lc?shade(lc,s<0?-.2:0):of==2||of==5?shade(oc,-.15):shade(L.pants,s<0?-.2:0);
   limb(g,lx,hip,fx,fy-5,5.6,pc);
   let done=false;if(GF)done=G7.boot(g,GF,lx,hip,fx,fy,t,run||air);else if(paw){G7.put(g,GB,'foot',fx,fy);done=true}
   if(!done){celf(g,()=>{g.beginPath();g.moveTo(fx-3,fy-6);g.lineTo(fx+3,fy-6);g.lineTo(fx+4.6,fy+2);g.lineTo(fx-3.4,fy+2);g.closePath()},boot,1);g.fillStyle=shade(trim,0);g.fillRect(fx-3,fy-6,6,1.1)}}
  // --- coat tails / robe skirt (behind torso)
  const sway=clamp(-vx*.02,-5,5)+Math.sin(t*2.8)*.8;
  if(GB&&G7.has(GB,'skirt'))G7.putSkew(g,GB,'skirt',0,hip,sway*.045);
  if(of==0||of==5){celf(g,()=>{g.beginPath();g.moveTo(-8,hip-3);g.lineTo(8,hip-3);g.lineTo(11+sway,hip+14+(air?-3:0));g.lineTo(4,hip+11);g.lineTo(0,hip+15);g.lineTo(-4,hip+11);g.lineTo(-11+sway,hip+14+(air?-3:0));g.closePath()},shade(oc,-.15),1.1)}
  if(of==2){celf(g,()=>{g.beginPath();g.moveTo(-8,hip-4);g.lineTo(8,hip-4);g.lineTo(13+sway,hip+20);g.lineTo(-13+sway,hip+20);g.closePath()},oc,1.1);g.fillStyle=trim;g.fillRect(-13+sway,hip+18,26,2)}
  // --- torso
  {const tw=gd==1?10.4:gd==2?8.8:9.5;celf(g,()=>{g.beginPath();g.moveTo(-tw,sh+1);g.lineTo(tw,sh+1);if(gd==2){g.quadraticCurveTo(6.3,sh+9,8.4,hip-1);g.lineTo(-8.4,hip-1);g.quadraticCurveTo(-6.3,sh+9,-tw,sh+1)}else{g.lineTo(8,hip-1);g.lineTo(-8,hip-1)}g.closePath()},of==4?'#e8e4f2':oc,1.1);
   if(gd==2){g.strokeStyle='rgba(20,12,28,.3)';g.lineWidth=.8;g.beginPath();g.moveTo(-5.4,sh+6.4);g.quadraticCurveTo(-2.6,sh+8.6,-.2,sh+6.8);g.moveTo(1.4,sh+6.8);g.quadraticCurveTo(4.2,sh+8.8,7,sh+6.2);g.stroke()}}
  // inner shirt / chest line
  if(of==0||of==5){g.fillStyle=shade('#e8e0ef',-.1);g.beginPath();g.moveTo(-2.4,sh+1);g.lineTo(2.4,sh+1);g.lineTo(1.2,hip-2);g.lineTo(-1.2,hip-2);g.closePath();g.fill()}
  if(of==1){celf(g,poly(g,[-4.5,sh+1,4.5,sh+1,5.5,hip+8,-5.5,hip+8]),shade(trim,-.1),1);g.fillStyle=oc;g.fillRect(-1,sh+3,2,hip+3-sh)}
  if(of==3){g.strokeStyle=trim;g.lineWidth=1.3;g.beginPath();g.moveTo(-8,sh+3);g.lineTo(6,hip-2);g.moveTo(8,sh+3);g.lineTo(-6,hip-2);g.stroke();g.fillStyle=shade(trim,-.1);g.fillRect(-1,sh+3,2,hip-sh)}
  if(of==4){celf(g,poly(g,[-9,sh+1,-1.2,sh+1,0,hip-1,-8,hip-1]),oc,1);celf(g,poly(g,[9,sh+1,1.2,sh+1,0,hip-1,8,hip-1]),oc,1);g.fillStyle=trim;g.beginPath();g.moveTo(0,sh+2);g.lineTo(2,sh+6);g.lineTo(0,hip-4);g.lineTo(-2,sh+6);g.closePath();g.fill()}
  // belt
  if(GB)G7.put(g,GB,'torso',0,sh);
  if(!GB||G7.D[GB].belt){g.fillStyle=shade(trim,-.55);g.fillRect(-8.2,hip-6,16.4,3.2);g.fillStyle=trim;g.fillRect(-1.8,hip-6.4,3.6,4);g.strokeStyle=OL;g.lineWidth=.7;g.strokeRect(-8.2,hip-6,16.4,3.2)}
  if(of==5){g.fillStyle=shade(trim,-.3);g.fillRect(-9,hip-9,18,3)}
  // collar
  if(of==0||of==3||of==5){celf(g,poly(g,[-8.5,sh+1,-3,sh-3.5,-1,sh+2]),shade(oc,.1),1);celf(g,poly(g,[8.5,sh+1,3,sh-3.5,1,sh+2]),shade(oc,.1),1)}
  if(of==2){g.fillStyle=trim;g.beginPath();g.moveTo(-9,sh+1);g.lineTo(9,sh+1);g.lineTo(0,sh+10);g.closePath();g.globalAlpha=.9;g.fill();g.globalAlpha=1}
  // trim on hem/cuff
  if(!GB){g.strokeStyle=trim;g.lineWidth=1;g.beginPath();g.moveTo(-9.3,sh+1.4);g.lineTo(9.3,sh+1.4);g.stroke()}
  // pauldrons / mantle
  if(of==1||L.acc==5){for(const s of[-1,1]){celf(g,()=>{g.beginPath();g.ellipse(s*9.3,sh+2,L.acc==5?5.6:4.6,3.6,0,0,6.3)},L.acc==5?shade(trim,-.35):shade(trim,-.2),1)}}
  // scarf
  if(L.acc==1){celf(g,poly(g,[-5.6,sh-2,5.6,sh-2,5,sh+3,-5,sh+3]),trim,1);const tl=clamp(-vx*.04,-9,9)+Math.sin(t*4)*1.2;celf(g,()=>{g.beginPath();g.moveTo(-3,sh+2);g.lineTo(2,sh+2);g.lineTo(-6+tl,sh+15);g.lineTo(-10+tl,sh+13);g.closePath()},shade(trim,-.15),1)}
  // head (a little oversized for a cuter proportion)
  g.save();g.translate(0,-43+bob);g.scale(1.16,1.16);g.translate(0,43-bob);head(g,L,-50+bob,t,air,blink,hs);
  // face-side accessories
  if(L.acc==2){g.fillStyle='#fff';g.shadowColor=trim;g.shadowBlur=4;g.beginPath();g.arc(-9.4,-50+bob+4.2,1.5,0,6.3);g.fill();g.shadowBlur=0}
  if(L.acc==3){celf(g,poly(g,[-6,-50+bob+4,8,-50+bob+4,5,-50+bob+11,-3,-50+bob+11.6]),shade('#2a2438',0),1)}
  if(L.acc==4){g.fillStyle=trim;g.strokeStyle=OL;g.lineWidth=.9;g.fillRect(-10,-50+bob-5,20,2.8);g.strokeRect(-10,-50+bob-5,20,2.8);const tl=clamp(-vx*.05,-10,10)+Math.sin(t*5);g.beginPath();g.moveTo(-10,-50+bob-4);g.quadraticCurveTo(-16+tl,-48+bob,-18+tl*1.3,-42+bob);g.lineTo(-14+tl,-43+bob);g.quadraticCurveTo(-12+tl*.5,-47+bob,-9,-52+bob);g.fill()}
  hairFront(g,G7.cover(GH)?HSN[L.hs]:HS[L.hs],-50+bob,L.hair,hs,t,air);
  if(L.acc==4&&!G7.cover(GH)){g.fillStyle=trim;g.strokeStyle=OL;g.lineWidth=.9;g.fillRect(-10,-50+bob-5,20,2.8);g.strokeRect(-10,-50+bob-5,20,2.8)}
  // hat item (cached GEAR7 sprite; unknown ids fall back to the icon art)
  if(GH&&!G7.hat(g,GH,-50+bob,t,'F',1.16)){g.save();g.translate(0,-62+bob);g.scale(.62,.62);g.translate(-24,-24);try{drawWearIcon(g,wr.hat,48)}catch(_){}g.restore()}
  g.restore();
  // --- near arm (+ weapon)
  const hx=6+ash,hy2=sh+4;let hxp,hyp;
  if(armA!=null&&fm){hxp=hx+Math.cos(armA)*15;hyp=hy2+Math.sin(armA)*15}else{hxp=9+as*2.2;hyp=hip-2+as*.8;if(pa||pg){hxp=lp(lp(hxp,11.5,pg),16,pa);hyp=lp(lp(hyp,hip-3,pg),sh+9,pa)}}
  if(wpn!='fist'&&!fm){g.save();g.translate(-6,sh+4);g.rotate(-2.35);g.scale(.58,.58);drawWeapon(g,wpn,44,0);g.restore()}
  limb(g,hx,hy2-1,hxp,hyp,4.6,ac);if(GB)G7.put(g,GB,'shoulder',0,sh);
  if(wpn!='fist'&&fm){g.save();g.translate(hxp,hyp);g.rotate(armA!=null?armA+.15:-.6+Math.sin(t*3)*.05);drawWeapon(g,wpn,WPN[wpn].k=='sword'?44:WPN[wpn].k=='scythe'?46:WPN[wpn].k=='glaive'?34:40,t);g.restore()}
  hand(hxp,hyp+.6,2.6);
  if(fm&&sw>0&&wpn=='fist'){g.fillStyle=L.skin;g.beginPath();g.arc(hxp+8*(1-sw/.22),hyp,4,0,6.3);g.fill();g.stroke()}
 }
 // landing squash / jump stretch for the local player
 const SQUISH=(()=>{let v=0,was=true,tp=0;return{tick(dt){const g2=P.g;if(g2&&!was&&P.pvy>300)v=Math.min(.2,P.pvy/4500);was=g2;v*=Math.exp(-dt*12)},v:()=>v}})();
 try{const _lf=landFx;landFx=function(dt){SQUISH.tick(dt);return _lf.apply(this,arguments)}}catch(_){}
 // collect look + cosmetic info for either the local player or a validated remote presence
 function info(lk,q,local){const A=local?cel.ap:(q&&q.cx&&q.cx.ap)||cel.ap;const lvv=local?lvl:+((q&&q.lv)||1);
  const eyeC=AP.eyeCol[A.eyeCol|0]||AP.eyeCol[0];
  return{skin:A.skinCol||(lk&&lk.skin)||'#f1c9a0',hair:A.hairCol||'#3a2a3a',hs:A.hair|0,es:A.eyes|0,eyeCol:eyeC,of:A.outfit|0,out:A.outCol,trim:A.trimCol,pants:shade(A.outCol,-.35),acc:A.acc|0,cape:A.cape|0,gd:A.gd|0,lv:lvv}}
 function draw(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q){
  wpn=WPN[wpn]?wpn:'fist';wr=wr||{};const local=q==='me',now=performance.now(),cxo=local?null:(q&&q.cx)||null;
  const L=info(lk,q,local),lvv=L.lv,wingIdx=local?(()=>{const w=wingShown(lvl);return w?WINGS.indexOf(w):-1})():(cxo&&cxo.w!=null?cxo.w:-1),aura=local?curAura(lvl):(cxo&&AURAS[cxo.a])||AURAS[0],tier=local?curPlateTier(lvl):(cxo&&cxo.t!=null?cxo.t:npTier(lvv));
  const feet=cy+54,mode=air?2:Math.abs(vx)>10?1:0;
  // aura pose hook: visual-only lift (levitation px), lean and flight-pose weights; hitboxes and P are never touched
  const pz=api.PZ&&wingIdx>=0?api.PZ(local?'me':'p:'+name,wingIdx,air,vx,sw,t,local):null,ly=pz?pz.lev:0;
  // aura circle under the feet (ground-projected)
  if(aura&&aura.id!='none'&&QM.cur.wfx>=0)Sigil.draw(g,aura,cx,feet-1,t,72,.8);
  // soft shadow
  g.save();const sd=QM.cur.shadow;g.fillStyle='rgba(0,0,0,'+(sd?.32:.22)+')';g.beginPath();g.ellipse(cx,feet,15-ly*.7,4-ly*.12,0,0,6.3);g.fill();g.restore();
  // wings sit behind the body
  const hasLegacy=wr.wing&&WEAR[wr.wing];
  if(!hasLegacy)WingArt.drawChar(g,wingIdx,cx,cy+24-ly,f,t,mode,vx,local?0:(String(name).length%6),local?'me':'p:'+name,local?P.vy:null);
  else if(hasLegacy){g.save();g.translate(cx,feet);g.scale(1.1*f,1.1);try{drawWings(wr.wing,wr.wo!=null?wr.wo:wingOpen,wr.wo!=null?(wr.wo>.9?.3:0):wingFlap,t)}catch(_){}g.restore()}
  if(pz&&api.PZG)api.PZG(g,pz,cx,feet-ly,t);
  g.save();g.translate(cx,feet-ly);if(pz&&pz.lean){g.translate(0,-30);g.rotate(pz.lean*f);g.translate(0,30)}g.imageSmoothingEnabled=true;{const sq=local?SQUISH.v():0,st=local&&!air?0:local&&P.vy<-200?.05:0;g.scale(.9*f*(1+sq*.45),.9*(1-sq+st))}g.lineJoin='round';g.lineCap='round';
  FX7.ld=local;
  try{drawBody(g,L,{t,vx:vx*f*1,air,f,sw,wpn,fm,wr,pz})}finally{g.restore();FX7.ld=false}
  // idle VFX
  if(local||QM.cur.wfx>=2){if(wingIdx>=0&&Math.random()<.05)WingArt.idleFx(WINGS[wingIdx],cx+cam.x,cy+cam.y+10+Math.random()*30,f);
   if(aura&&aura.id!='none'&&Math.random()<.12)VFX.mote(cx+cam.x+(Math.random()-.5)*60,feet+cam.y,aura.c2)}
  // shop cosmetics: charm (all players), aura particles for others (own aura is emitted by FX7.tick)
  try{const fxo=local?{ch:SHOP7.eqRef('charm'),au:null}:(cxo&&cxo.fx)||{};if(fxo.ch)FX7.charmDraw(g,fxo.ch,cx,cy-ly,t,f);if(!local&&fxo.au&&QM.cur.wfx>=2&&Math.random()<.2)FX7.AUR[fxo.au](1,cx+cam.x,cy+cam.y+54,t)}catch(_){}
  // nameplate + bubble
  const nm=String(name||'').replace(/^\[\d+\]\s*/,'');Plate.draw(g,cx,cy-50-ly,tier,nm,lvv,local?NPSKIN7.cur():null);
  if(bubT){g.save();g.font='500 13px '+FONT;g.textAlign='center';const bw=g.measureText(bubT).width+18;rr(cx-bw/2,cy-96,bw,24,10);g.fillStyle='#fff';g.fill();g.fillStyle='#111';g.fillText(bubT,cx,cy-79);g.restore()}
 }
 function headFull(g,L,hy,t,air,wr){const h=HS[L.hs],GH=wr&&wr.hat&&WEAR[wr.hat]&&GEAR7.has(wr.hat,'hatF')?wr.hat:'';hairBack(g,h,hy,L.hair,0,t);if(GH){GEAR7.begin(g);GEAR7.hat(g,GH,hy,t,'B')}head(g,L,hy,t,air,false,0);hairFront(g,GH&&GEAR7.cover(GH)?HSN[L.hs]:h,hy,L.hair,0,t,air);if(GH)GEAR7.hat(g,GH,hy,t,'F')}
 const api={draw,info,shade,head,headFull,PZ:null,PZG:null};return api})();
// ===== GEAR7: equipment art shared by the item icons and the worn character (hats, armour, boots, gloves, the Sparkmouse costume).
// Worn pieces are pre-rendered once per (item, part, scale bucket) on small offscreen canvases and blitted, so a fully geared character
// costs a handful of drawImage calls per frame. Icons call the same vector parts at icon scale, so the icon and the worn look always match.
const GEAR7=(()=>{
 const OL='#140c1c',SC=new Map(),sh=(c,k)=>AC6.shade(c,k);
 const Y='#ffd23f',CR='#fff3c9',TL='#36d6e0',GOLD='#f2c14e';
 // cel fill (dark base, lit shape offset toward the light, outline) — same language as the body renderer
 function cel(x,path,col,lw,lx,ly){path();x.fillStyle=sh(col,-.34);x.fill();x.save();path();x.clip();x.translate(lx==null?1.4:lx,ly==null?-1.1:ly);path();x.fillStyle=col;x.fill();x.restore();path();x.strokeStyle=OL;x.lineWidth=lw||1;x.stroke()}
 const P=(x,a,c)=>()=>{x.beginPath();x.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)x.lineTo(a[i],a[i+1]);if(c!==false)x.closePath()};
 const E=(x,cx,cy,rx,ry,r)=>()=>{x.beginPath();x.ellipse(cx,cy,rx,ry,r||0,0,6.3)};
 function line(x,c,w,pts,dash){x.strokeStyle=c;x.lineWidth=w;if(dash)x.setLineDash(dash);x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.stroke();if(dash)x.setLineDash([])}
 function star(x,cx,cy,r1,r2,n,rot){x.beginPath();for(let i=0;i<n*2;i++){const a=(rot==null?-Math.PI/2:rot)+i*Math.PI/n,r=i%2?r2:r1;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath()}
 function glow(x,cx,cy,r,col,a){const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,col);gr.addColorStop(1,col+'00');x.save();x.globalAlpha=a||.6;x.fillStyle=gr;x.beginPath();x.arc(cx,cy,r,0,6.3);x.fill();x.restore()}
 function gem(x,cx,cy,r,col){x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.9,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.9,cy);x.closePath();const gr=x.createLinearGradient(cx-r,cy-r,cx+r,cy+r);gr.addColorStop(0,sh(col,.6));gr.addColorStop(.5,col);gr.addColorStop(1,sh(col,-.5));x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.55;x.stroke();x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(cx-r*.28,cy-r*.34,r*.26,0,6.3);x.fill()}
 function spark(x,cx,cy,r,col){star(x,cx,cy,r,r*.28,4,0);x.fillStyle=col||'#fff';x.fill()}
 function rivet(x,cx,cy){x.fillStyle='#f4f6fb';x.beginPath();x.arc(cx,cy,.55,0,6.3);x.fill();x.strokeStyle=OL;x.lineWidth=.35;x.stroke()}
 function hl(x,w,a,pts){x.save();x.globalAlpha=a;line(x,'#fff',w,pts);x.restore()}
 // glove / paw: cuff toward the wrist (up), rounded fist, thumb on the facing side, finger creases; gold variant gets a gradient
 function mitt(x,col,cuff,gold){
  const fist=()=>{x.beginPath();x.moveTo(-3.1,-2.3);x.bezierCurveTo(-3.8,1.4,-2.2,3.6,.1,3.6);x.bezierCurveTo(2.5,3.6,3.6,1.8,3.3,-2.3);x.closePath()};
  if(gold){fist();const gr=x.createLinearGradient(-3,-3,3,3.5);gr.addColorStop(0,'#fff6b8');gr.addColorStop(.5,col);gr.addColorStop(1,'#a8740c');x.fillStyle=gr;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke()}else cel(x,fist,col,.6,.9,-.7);
  // thumb: a short rounded digit folded across the front of the fist
  const th=()=>{x.beginPath();x.moveTo(3.1,-1.2);x.bezierCurveTo(4.6,-.6,4.4,1.6,2.8,2);x.bezierCurveTo(1.6,2.3,.6,1.6,.9,.9);x.bezierCurveTo(1.6,.6,2.4,.3,2.4,-.6);x.closePath()};
  x.fillStyle=gold?'#ffe27a':sh(col,.1);th();x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke();line(x,gold?'rgba(120,70,0,.4)':sh(col,-.3),.3,[2.2,1.4,3.3,1.1]);
  cel(x,P(x,[-2.9,-4.8,2.9,-4.8,3.3,-1.9,-3.3,-1.9]),cuff,.55,.6,-.5);line(x,sh(cuff,.35),.35,[-3,-2.6,3.1,-2.6]);
  for(const a of[-1.9,-.6])line(x,gold?'rgba(120,70,0,.45)':sh(col,-.38),.32,[a,1.8,a,3.3]);hl(x,.6,.6,[-2.3,-1.2,-2.1,1.2])}
 // Sparkmouse ear: base at 0,0 pointing up; rounded tip, cream inner, a little fur tuft
 function ear(x,dk){cel(x,()=>{x.beginPath();x.moveTo(-3.2,1);x.bezierCurveTo(-4.5,-5,-3.4,-11.4,0,-12.8);x.bezierCurveTo(3.4,-11.4,4.5,-5,3.2,1);x.closePath()},dk?sh(Y,-.1):Y,1);
  x.fillStyle=CR;x.beginPath();x.moveTo(-1.7,.2);x.bezierCurveTo(-2.5,-4.4,-1.8,-8.8,0,-10);x.bezierCurveTo(1.8,-8.8,2.5,-4.4,1.7,.2);x.closePath();x.fill();line(x,'rgba(200,150,60,.45)',.5,[0,-1,0,-7.5]);line(x,OL,.6,[-.6,-12.4,-1.4,-14.2]);line(x,OL,.6,[.5,-12.5,1.1,-14])}
 // ---------------- item definitions: each part is {bb:[x,y,w,h], f(ctx)} in body units around its anchor ----------------
 const D={
  helmet:{cover:1,hatF:{bb:[-14,-24,34,26],f(x){const c='#f5b82e';cel(x,E(x,1.6,-6.2,13.6,2.7),sh(c,-.12),1);
   cel(x,()=>{x.beginPath();x.moveTo(-11.6,-6);x.bezierCurveTo(-12,-15.2,-6,-20.6,1,-20.6);x.bezierCurveTo(8,-20.6,12.6,-15.2,12,-6);x.quadraticCurveTo(0,-4.1,-11.6,-6);x.closePath()},c,1.1);
   x.fillStyle=sh(c,-.22);x.beginPath();x.moveTo(-2.2,-20.4);x.quadraticCurveTo(-3.2,-12,-2.8,-5.1);x.lineTo(1,-4.9);x.quadraticCurveTo(1.8,-12,1.4,-20.6);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke();
   hl(x,1.3,.8,[-8,-12.6,-6.4,-16.8,-3,-18.6]);
   x.fillStyle='#3a2a24';x.beginPath();x.moveTo(-10.6,-5.6);x.lineTo(-8.4,-5.3);x.lineTo(-7.7,1.6);x.lineTo(-9.8,1.6);x.closePath();x.fill();x.fillStyle=GOLD;x.fillRect(-10,-1.9,2.4,1.5);
   glow(x,10.4,-12.4,8,'#fff3a0',.55);cel(x,E(x,8.8,-12.4,3.5,3.5),'#5b6270',.9);const gr=x.createRadialGradient(9.6,-12.9,.2,9.2,-12.4,2.4);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,'#fff6b0');gr.addColorStop(1,'#ffc23a');x.fillStyle=gr;x.beginPath();x.arc(9.2,-12.4,2.3,0,6.3);x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke()}}},
  clover:{hatF:{bb:[-12,-27,26,28],f(x){const c='#3fcf6a';x.beginPath();x.moveTo(-10.2,-2);x.bezierCurveTo(-11.2,-11,-5.5,-15.8,1,-15.8);x.bezierCurveTo(7.5,-15.8,11.6,-10.5,10.6,-2);x.strokeStyle=OL;x.lineWidth=3.6;x.stroke();x.strokeStyle=sh(c,-.2);x.lineWidth=2.2;x.stroke();x.strokeStyle=sh(c,.35);x.lineWidth=.7;x.stroke();
   const cx=5,cy=-18;line(x,OL,1.8,[cx,cy,cx-1.6,cy+3.4,cx-3.4,cy+4.6]);line(x,sh(c,-.3),.9,[cx,cy,cx-1.6,cy+3.4,cx-3.4,cy+4.6]);
   for(let i=0;i<4;i++){x.save();x.translate(cx,cy);x.rotate(i*Math.PI/2+Math.PI/4);cel(x,()=>{x.beginPath();x.moveTo(0,0);x.bezierCurveTo(-4.2,-1.2,-4.4,-6.2,-1.9,-6.4);x.quadraticCurveTo(-.4,-6.4,0,-4.8);x.quadraticCurveTo(.4,-6.4,1.9,-6.4);x.bezierCurveTo(4.4,-6.2,4.2,-1.2,0,0);x.closePath()},i%2?sh(c,.08):c,.8);line(x,sh(c,-.45),.5,[0,-.6,0,-4.4]);x.restore()}
   gem(x,cx,cy,1.5,'#ffd24a');spark(x,cx+6.2,cy-5.4,1.8,'#fff');spark(x,cx-6.5,cy+.5,1.1,'#f6ffe0')}}},
  sage:{cover:1,hatB:{bb:[-16,-18,26,31],f(x){cel(x,()=>{x.beginPath();x.moveTo(-6,-15);x.bezierCurveTo(-13,-14,-15.5,-5,-14,6);x.quadraticCurveTo(-12,11.5,-6,11.5);x.lineTo(4,9);x.bezierCurveTo(8,4,8,-12,-6,-15);x.closePath()},sh('#8f7bff',-.3),1)}},
   hatF:{bb:[-25,-22,37,34],f(x){const c='#8f7bff';cel(x,()=>{x.beginPath();x.moveTo(-6,-17.4);x.bezierCurveTo(-14,-19.4,-21,-14,-22.6,-5.6);x.quadraticCurveTo(-21,-9,-17,-9.6);x.quadraticCurveTo(-14,-9.2,-12,-7);x.closePath()},sh(c,-.1),1);
    cel(x,E(x,-22.6,-4.8,1.6,1.6),GOLD,.7);
    cel(x,()=>{x.beginPath();x.moveTo(10.6,-5.5);x.bezierCurveTo(10.5,-14,5,-19,-1,-19);x.bezierCurveTo(-9,-19,-14.2,-12,-13.6,-2);x.bezierCurveTo(-13.4,4,-12,8,-9.5,10.5);x.lineTo(-7,9.6);x.bezierCurveTo(-9,4,-9.4,-2,-7.4,-6.6);x.bezierCurveTo(-4.6,-11.2,4,-12.2,10.6,-5.5);x.closePath()},c,1.1);
    x.strokeStyle=OL;x.lineWidth=2.4;x.beginPath();x.moveTo(-8.2,9.8);x.bezierCurveTo(-10,4,-10.4,-2,-8.2,-7.2);x.bezierCurveTo(-5,-12.4,4,-13.2,10.4,-6.2);x.stroke();x.strokeStyle=GOLD;x.lineWidth=1.3;x.stroke();
    line(x,sh(c,-.42),.7,[-11.4,-7,-10.6,1,-11.4,7.4]);line(x,sh(c,-.42),.6,[-4,-17.6,-7.6,-14]);hl(x,1,.45,[-1,-17.6,4.4,-15.8,7.6,-12]);
    glow(x,-10.8,-3.6,5,'#e2d8ff',.75);x.strokeStyle='#fff6d0';x.lineWidth=.75;x.beginPath();x.arc(-10.8,-3.6,2.1,0,6.3);x.stroke();x.beginPath();x.moveTo(-12.2,-3.6);x.quadraticCurveTo(-10.8,-5,-9.4,-3.6);x.quadraticCurveTo(-10.8,-2.2,-12.2,-3.6);x.stroke();x.fillStyle='#fff6d0';x.beginPath();x.arc(-10.8,-3.6,.55,0,6.3);x.fill()}},
   front(x){const c='#8f7bff';for(const s of[-1,1]){x.save();x.scale(s,1);cel(x,()=>{x.beginPath();x.moveTo(0,-19.6);x.bezierCurveTo(-9,-19.6,-14.6,-12,-14,-1);x.bezierCurveTo(-13.6,5,-12.2,9,-9.6,11.4);x.lineTo(-7.2,10.4);x.bezierCurveTo(-9.6,4.6,-10,-2,-8,-6.8);x.bezierCurveTo(-5.4,-11,-2.6,-12.4,0,-12.4);x.closePath()},s<0?c:sh(c,-.08),1.1);
    x.strokeStyle=GOLD;x.lineWidth=1.2;x.beginPath();x.moveTo(-8.4,10.4);x.bezierCurveTo(-10.4,4.4,-10.8,-2.2,-8.6,-7.4);x.bezierCurveTo(-6,-11.8,-2.8,-13,0,-13);x.stroke();x.restore()}
    cel(x,()=>{x.beginPath();x.moveTo(-3,-19);x.quadraticCurveTo(0,-27,5,-29);x.quadraticCurveTo(2.6,-24,3,-19);x.closePath()},sh(c,-.1),1);
    glow(x,0,-16,4.6,'#e2d8ff',.75);x.strokeStyle='#fff6d0';x.lineWidth=.7;x.beginPath();x.arc(0,-16,1.9,0,6.3);x.stroke();x.fillStyle='#fff6d0';x.beginPath();x.arc(0,-16,.6,0,6.3);x.fill()}},
  crown:{hatF:{bb:[-14,-31,28,22],f(x){const G='#ffcf3a';x.save();x.translate(.5,-14.6);x.rotate(-.06);
   cel(x,()=>{x.beginPath();x.moveTo(-8.6,.4);x.bezierCurveTo(-8,-9.4,8,-9.4,8.6,.4);x.closePath()},'#b3263a',.8);
   const out=()=>{x.beginPath();x.moveTo(-10.6,2.6);x.lineTo(-10.6,-1);x.lineTo(-11.6,-8.6);x.lineTo(-6.8,-3);x.lineTo(-5.2,-11);x.lineTo(-2.3,-3.2);x.lineTo(0,-13.6);x.lineTo(2.3,-3.2);x.lineTo(5.2,-11);x.lineTo(6.8,-3);x.lineTo(11.6,-8.6);x.lineTo(10.6,-1);x.lineTo(10.6,2.6);x.quadraticCurveTo(0,4,-10.6,2.6);x.closePath()};
   out();const gr=x.createLinearGradient(0,-13.6,0,4);gr.addColorStop(0,'#fff6b8');gr.addColorStop(.45,G);gr.addColorStop(1,'#a8740c');x.fillStyle=gr;x.fill();
   x.save();out();x.clip();x.fillStyle='rgba(120,70,0,.2)';x.fillRect(1,-14,12,19);x.fillStyle=sh(G,-.2);x.beginPath();x.moveTo(-10.6,-1.2);x.quadraticCurveTo(0,.2,10.6,-1.2);x.lineTo(10.6,2.6);x.quadraticCurveTo(0,4,-10.6,2.6);x.closePath();x.fill();
   x.strokeStyle='rgba(255,250,210,.85)';x.lineWidth=.6;x.beginPath();x.moveTo(-10.4,-.8);x.quadraticCurveTo(0,.6,10.4,-.8);x.stroke();x.restore();out();x.strokeStyle=OL;x.lineWidth=1;x.stroke();
   for(const[a,b]of[[-11.6,-8.6],[-5.2,-11],[0,-13.6],[5.2,-11],[11.6,-8.6]]){x.fillStyle='#fffaf0';x.beginPath();x.arc(a,b,1.3,0,6.3);x.fill();x.strokeStyle=OL;x.lineWidth=.55;x.stroke();x.fillStyle='rgba(180,170,210,.6)';x.beginPath();x.arc(a+.4,b+.4,.6,0,6.3);x.fill()}
   gem(x,0,1,2,'#e0284a');gem(x,-6,1.1,1.35,'#3a7bff');gem(x,6,1.1,1.35,'#2fd07a');for(const a of[-8.6,-3,3,8.6]){x.fillStyle='#fff7d0';x.beginPath();x.arc(a,1.2,.45,0,6.3);x.fill()}
   hl(x,.9,.7,[-8.6,-6.4,-8.2,-3.6]);spark(x,-4.2,-7.6,1.9,'#fff');x.restore()}}},
  nightcap:{cover:1,hatF:{bb:[-26,-24,39,31],f(x){const c='#3b3f9a';const cone=()=>{x.beginPath();x.moveTo(11,-7);x.bezierCurveTo(10,-16,4,-21.4,-3,-21.4);x.bezierCurveTo(-10,-21.4,-16,-15,-19.4,-7);x.quadraticCurveTo(-20.4,-2,-21.4,1);x.quadraticCurveTo(-17.4,-4,-14,-8);x.lineTo(-11,-7);x.closePath()};
   cel(x,cone,c,1.1);x.save();cone();x.clip();x.fillStyle='#ffe27a';for(const[a,b,r]of[[-2,-17,1.5],[5,-13,1.1],[-9,-14,1.2],[-15,-9,1],[1,-10,.9],[-6,-19.4,.8]]){spark(x,a,b,r*1.5,'#ffe27a')}x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.ellipse(-2,-18,9,2.4,-.2,0,6.3);x.fill();x.restore();
   cel(x,()=>{x.beginPath();x.moveTo(-11.8,-6.4);x.bezierCurveTo(-11.6,-12.4,11.6,-12.8,11.8,-7);x.lineTo(11.9,-3.6);x.bezierCurveTo(6,-8,-6,-7.8,-11.9,-3);x.closePath()},'#f4f2ff',1);
   x.fillStyle='#ffffff';for(let i=0;i<7;i++){x.beginPath();x.arc(-10.2+i*3.4,-3.6-Math.sin(i/6*Math.PI)*3.2,1.05,0,6.3);x.fill()}
   const px=-21.6,py=2.2;x.fillStyle=OL;x.beginPath();x.arc(px,py,3.6,0,6.3);x.fill();x.fillStyle='#ffffff';for(let i=0;i<7;i++){const a=i/7*6.28;x.beginPath();x.arc(px+Math.cos(a)*1.6,py+Math.sin(a)*1.6,1.6,0,6.3);x.fill()}x.fillStyle='#dcd8f2';x.beginPath();x.arc(px+1,py+1.1,1.2,0,6.3);x.fill()}}},
  cap:{cover:1,hatF:{bb:[-13,-22,35,19],f(x){const c='#e8e8ee',A='#ff5f6d';
   cel(x,()=>{x.beginPath();x.moveTo(6,-8.4);x.quadraticCurveTo(14,-10,20.4,-6.4);x.quadraticCurveTo(15.4,-3.8,7,-5.2);x.closePath()},A,1);line(x,sh(A,-.35),.6,[8,-6.2,14.6,-5.8,19.2,-6.4]);
   const dome=()=>{x.beginPath();x.moveTo(-11.3,-5.4);x.bezierCurveTo(-12,-15,-5,-19.6,.5,-19.6);x.bezierCurveTo(7,-19.6,11.7,-14,11.3,-5.6);x.quadraticCurveTo(0,-3.6,-11.3,-5.4);x.closePath()};
   cel(x,dome,c,1.1);x.save();dome();x.clip();x.strokeStyle=A;x.lineWidth=3;x.beginPath();x.moveTo(-1,-20.4);x.quadraticCurveTo(5.6,-14,7.8,-3.8);x.stroke();x.strokeStyle='#3c4a7a';x.lineWidth=1;x.beginPath();x.moveTo(-3.4,-20);x.quadraticCurveTo(3.4,-13.4,5.2,-3.6);x.stroke();line(x,'rgba(0,0,0,.18)',.6,[-6,-18,-9.6,-5]);
   x.fillStyle='#3c4a7a';x.beginPath();x.moveTo(-10.4,-9.4);x.quadraticCurveTo(-8.4,-7.4,-10.6,-5.6);x.closePath();x.fill();x.restore();
   cel(x,E(x,.6,-19.6,1.25,.9),A,.7);x.fillStyle='#ffffff';x.strokeStyle=OL;x.lineWidth=.5;x.beginPath();x.moveTo(-1.6,-11);x.quadraticCurveTo(-4.6,-13.4,-6.4,-11.8);x.quadraticCurveTo(-5,-11.6,-4.8,-10.6);x.quadraticCurveTo(-3.8,-10.2,-1.6,-11);x.closePath();x.fill();x.stroke();
   hl(x,1.1,.7,[-7.4,-13.4,-5.4,-17,-1.6,-18.4])}}},
  sparkhood:{cover:1,hatB:{bb:[-17,-20,30,34],f(x){cel(x,()=>{x.beginPath();x.moveTo(-4,-17.4);x.bezierCurveTo(-13,-17.4,-16.6,-8,-15.6,3);x.quadraticCurveTo(-14,11.6,-6,11.8);x.lineTo(6,9);x.bezierCurveTo(10,3,10,-14,-4,-17.4);x.closePath()},'#e09a1c',1)}},
   hatF:{bb:[-17,-26,31,38],f(x){
    cel(x,()=>{x.beginPath();x.moveTo(11,-4.5);x.bezierCurveTo(11.4,-14,5,-19.8,-1,-19.8);x.bezierCurveTo(-10,-19.8,-15.4,-12,-14.8,-1);x.bezierCurveTo(-14.4,5,-12.6,9,-9.8,11.4);x.lineTo(-7,10.4);x.bezierCurveTo(-9.4,4.6,-9.8,-2,-7.8,-6.8);x.bezierCurveTo(-4.8,-11.6,4.4,-12.4,11,-4.5);x.closePath()},Y,1.1);
    line(x,'rgba(170,110,20,.5)',.6,[-12.4,-8,-11.6,0,-12.2,6.6]);hl(x,1.1,.6,[-2,-18.4,4.6,-16.6,8.6,-11.6]);
    const rim=()=>{x.beginPath();x.moveTo(-8.4,10.8);x.bezierCurveTo(-10.6,4.6,-11,-2.2,-8.8,-7.4);x.bezierCurveTo(-5.4,-12.8,4.6,-13.6,11.2,-5.2)};
    rim();x.strokeStyle=OL;x.lineWidth=3.8;x.stroke();rim();x.strokeStyle=CR;x.lineWidth=2.5;x.stroke();rim();x.setLineDash([.6,1.5]);x.strokeStyle='#ffffff';x.lineWidth=1;x.stroke();x.setLineDash([]);
    cel(x,()=>{x.beginPath();x.moveTo(-1.2,-19.2);x.quadraticCurveTo(-1.8,-24.2,2.4,-24.8);x.quadraticCurveTo(5.2,-24.4,4.2,-21.6);x.quadraticCurveTo(2.6,-23,1.6,-21.6);x.quadraticCurveTo(1.6,-20.2,2.8,-19.4);x.closePath()},Y,.8);
    star(x,-11.8,-2.6,2.6,1.1,5);x.fillStyle=TL;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke();x.fillStyle='#e8ffff';x.beginPath();x.arc(-12.4,-3.4,.5,0,6.3);x.fill();
    for(const[a,b]of[[7.4,5.4],[-5.6,5.4]]){star(x,a,b,1.75,.75,4,0);x.fillStyle=TL;x.fill();x.strokeStyle='rgba(20,12,28,.55)';x.lineWidth=.4;x.stroke()}}},
   earB:{bb:[-5,-15,10,17],f(x){ear(x,1)}},earF:{bb:[-5,-15,10,17],f(x){ear(x,0)}},
   front(x){for(const s of[-1,1]){x.save();x.scale(s,1);cel(x,()=>{x.beginPath();x.moveTo(0,-20.2);x.bezierCurveTo(-9.6,-20.2,-15.2,-12,-14.8,-1);x.bezierCurveTo(-14.4,5,-12.6,9,-9.8,11.6);x.lineTo(-7.2,10.6);x.bezierCurveTo(-9.6,4.6,-10,-2,-8,-6.8);x.bezierCurveTo(-5.4,-11.4,-2.6,-12.8,0,-12.8);x.closePath()},s<0?Y:sh(Y,-.06),1.1);
    const rim=()=>{x.beginPath();x.moveTo(-8.6,11);x.bezierCurveTo(-10.6,4.6,-11,-2.2,-8.8,-7.4);x.bezierCurveTo(-6.4,-11.8,-3,-13.4,0,-13.4)};rim();x.strokeStyle=OL;x.lineWidth=3.6;x.stroke();rim();x.strokeStyle=CR;x.lineWidth=2.4;x.stroke();x.restore()}
    for(const s of[-1,1]){x.save();x.translate(s*8.4,-15.8);x.rotate(s*.62);x.scale(.8,.8);ear(x,s>0?1:0);x.restore()}
    star(x,0,-17,2.2,.95,5);x.fillStyle=TL;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke();
    for(const a of[-6.2,6.2]){star(x,a,5.6,1.7,.72,4,0);x.fillStyle=TL;x.fill()}}},
  // ---------- body ----------
  vest:{belt:1,arms:'out',torso:{bb:[-10,0,20,17],f(x){const c='#b5774a';x.fillStyle='#e9e4dc';P(x,[-2.6,1,2.6,1,1.8,16,-1.8,16])();x.fill();line(x,'rgba(0,0,0,.25)',.5,[0,1.4,0,15.6]);
   for(const s of[-1,1]){cel(x,P(x,[s*6.6,1,s*2.6,1,s*1.5,6.8]),sh(c,.12),.8);
    x.fillStyle='#e7f05a';P(x,[s*2.1,9,s*8.8,9,s*8.6,11.4,s*2,11.4])();x.fill();x.fillStyle='#dfe4ee';P(x,[s*2.1,9.8,s*8.75,9.8,s*8.7,10.6,s*2.05,10.6])();x.fill();x.strokeStyle=OL;x.lineWidth=.45;P(x,[s*2.1,9,s*8.8,9,s*8.6,11.4,s*2,11.4])();x.stroke();
    cel(x,P(x,[s*3.8,3.6,s*7.6,3.6,s*7.4,7.4,s*4,7.4]),sh(c,-.06),.6);x.fillStyle=sh(c,-.3);P(x,[s*3.7,3.4,s*7.7,3.4,s*7.6,4.8,s*3.8,4.8])();x.fill();x.fillStyle=GOLD;x.beginPath();x.arc(s*5.7,4.3,.55,0,6.3);x.fill()}
   line(x,OL,.8,[-2.6,1,-1.8,16]);line(x,OL,.8,[2.6,1,1.8,16]);x.fillStyle='#ffd24a';x.fillRect(-6.3,1.6,.9,2.6);x.fillStyle=sh(c,-.28);x.fillRect(-8.2,14.4,16.4,1.6);line(x,sh(c,.4),.4,[-8.8,2,-8.2,14],[.8,.8]);line(x,sh(c,.4),.4,[8.8,2,8.2,14],[.8,.8])}}},
  robe:{torso:{bb:[-10,0,20,17],f(x){const c='#6a5cff';x.fillStyle=sh(c,-.55);P(x,[-3.6,1,3.6,1,0,7.4])();x.fill();x.strokeStyle=GOLD;x.lineWidth=1.1;x.beginPath();x.moveTo(-4.2,1.2);x.lineTo(0,8);x.lineTo(4.2,1.2);x.stroke();
   x.fillStyle=sh(GOLD,-.1);P(x,[-8.4,11,8.4,11,8.2,13.8,-8.2,13.8])();x.fill();x.strokeStyle=OL;x.lineWidth=.5;x.stroke();glow(x,0,12.4,4,'#9ff3ff',.7);gem(x,0,12.4,1.7,'#5be0ff');
   for(const[a,b,r]of[[-6,5,1.3],[5.8,7.4,1.1],[-5,9,.8],[6.6,3.4,.8]])spark(x,a,b,r,'#ffe9a8');line(x,GOLD,.6,[-9.2,1.6,-4.8,1.6]);line(x,GOLD,.6,[4.8,1.6,9.2,1.6])}},
   skirt:{bb:[-15,-5,30,24],f(x){const c='#6a5cff';cel(x,()=>{x.beginPath();x.moveTo(-8,-4.4);x.lineTo(8,-4.4);x.bezierCurveTo(10,4,12.6,10,13.6,16.6);x.quadraticCurveTo(0,19,-13.6,16.6);x.bezierCurveTo(-12.6,10,-10,4,-8,-4.4);x.closePath()},sh(c,-.04),1.1);
    x.fillStyle=sh(c,-.6);P(x,[1.6,-1,3.6,17.6,.6,17.8])();x.fill();line(x,sh(c,-.4),.6,[-4.6,0,-8.4,15]);line(x,sh(c,-.4),.6,[5.4,0,8.6,15]);
    x.strokeStyle=GOLD;x.lineWidth=1.6;x.beginPath();x.moveTo(-13.2,15.2);x.quadraticCurveTo(0,17.6,13.2,15.2);x.stroke();for(const a of[-9,-4.6,5.4,9.6])spark(x,a,14.4+Math.abs(a)*-.04,1.2,'#ffe9a8')}}},
  plate:{rune:1,torso:{bb:[-10,0,20,17],f(x){const c='#c9d2e0';for(let i=0;i<2;i++){cel(x,P(x,[-8.3,11.4+i*2.3,8.3,11.4+i*2.3,8,13.8+i*2.3,-8,13.8+i*2.3]),sh(c,-.1-i*.06),.7);rivet(x,-6.4,12.6+i*2.3);rivet(x,6.4,12.6+i*2.3)}
   const bp=()=>{x.beginPath();x.moveTo(-9.3,1.4);x.lineTo(9.3,1.4);x.lineTo(8.5,10.4);x.quadraticCurveTo(0,14.6,-8.5,10.4);x.closePath()};cel(x,bp,c,1.1);
   x.save();bp();x.clip();x.fillStyle='rgba(30,40,70,.16)';x.fillRect(0,0,10,16);x.restore();line(x,sh(c,-.5),.6,[0,1.8,0,12.4]);hl(x,.7,.9,[-.6,2,-.6,12]);hl(x,1.5,.75,[-6.6,3,-5.6,6.4,-4.6,9]);
   x.strokeStyle='#e2b54a';x.lineWidth=.9;x.beginPath();x.moveTo(-9.1,2);x.lineTo(9.1,2);x.moveTo(-8.2,10.2);x.quadraticCurveTo(0,14.2,8.2,10.2);x.stroke();
   cel(x,()=>{x.beginPath();x.moveTo(-4.6,1.2);x.quadraticCurveTo(0,4.2,4.6,1.2);x.lineTo(3.8,-.4);x.quadraticCurveTo(0,1.6,-3.8,-.4);x.closePath()},sh(c,.12),.7);
   glow(x,0,6.6,5.4,'#7fe6ff',.8);gem(x,0,6.6,2,'#3fc4ff')}},
   shoulder:{bb:[-16,-4,32,13],f(x){const c='#c9d2e0';for(const s of[-1,1]){x.save();x.translate(s*9.8,2.8);x.rotate(s*.28);cel(x,E(x,0,2.2,5,2.6),sh(c,-.14),.9);cel(x,()=>{x.beginPath();x.ellipse(0,0,5.6,3.9,0,Math.PI*1.02,Math.PI*1.98+.1);x.lineTo(5.4,1.4);x.quadraticCurveTo(0,3.4,-5.4,1.4);x.closePath()},s<0?sh(c,-.06):c,1);
    x.strokeStyle='#e2b54a';x.lineWidth=.8;x.beginPath();x.moveTo(-5.2,1.3);x.quadraticCurveTo(0,3.2,5.2,1.3);x.stroke();rivet(x,-2.6,.4);rivet(x,2.6,.4);hl(x,1,.7,[-3.6,-1.6,-1,-3.2]);x.restore()}}},
   skirt:{bb:[-9,-4,18,12],f(x){const c='#c9d2e0';for(const s of[-1,1]){cel(x,P(x,[s*.6,-2.6,s*7.2,-2.6,s*8.2,6.2,s*1.2,5.4]),sh(c,-.06),.9);x.strokeStyle='#e2b54a';x.lineWidth=.7;P(x,[s*8.2,6.2,s*1.2,5.4],false)();x.stroke();rivet(x,s*3.8,-1.2);hl(x,.8,.6,[s*2,-1.4,s*2.4,4])}}}},
  pajamas:{legs:'#4a5ac0',torso:{bb:[-10,0,20,17],f(x){line(x,'#f4f1ff',1,[0,4,0,16]);for(const y of[6,10,14]){x.fillStyle='#ffffff';x.beginPath();x.arc(1.3,y,.75,0,6.3);x.fill();x.strokeStyle=OL;x.lineWidth=.35;x.stroke()}
   for(const s of[-1,1])cel(x,()=>{x.beginPath();x.moveTo(0,1.2);x.bezierCurveTo(s*2,5.4,s*6.6,5,s*7.6,1.2);x.closePath()},'#f4f1ff',.8);
   for(const[a,b,r]of[[-6,7.4,1.5],[5.8,11,1.3],[-4.4,13.6,1.1],[6.4,6,1],[-6.8,11.6,.9]])spark(x,a,b,r,'#ffe27a');
   x.fillStyle='#ffe27a';x.beginPath();x.arc(4.6,14,1.6,0,6.3);x.fill();x.fillStyle='#5a6bd6';x.beginPath();x.arc(5.4,13.4,1.4,0,6.3);x.fill();
   x.strokeStyle='#f4f1ff';x.lineWidth=.5;x.strokeRect(-7.4,8.4,3.4,3)}}},
  hoodie:{back:{bb:[-13,-8,21,12],f(x){const c='#8f8fa8';cel(x,()=>{x.beginPath();x.moveTo(-9.6,3);x.bezierCurveTo(-12.6,-3,-6,-7.2,0,-6.2);x.bezierCurveTo(5,-5.6,7.4,-1.6,6.4,2.4);x.closePath()},sh(c,-.14),1);x.fillStyle=sh(c,-.5);x.beginPath();x.ellipse(-2,-1.2,5.6,2.6,-.15,0,6.3);x.fill()}},
   torso:{bb:[-10,0,20,17],f(x){const c='#8f8fa8';x.fillStyle=sh(c,-.5);x.beginPath();x.arc(0,1,2.8,0,Math.PI);x.fill();
   cel(x,P(x,[-6,9.6,6,9.6,7.4,14.8,-7.4,14.8]),sh(c,-.08),.7);line(x,sh(c,-.45),.6,[-6,9.8,-4.8,13.6]);line(x,sh(c,-.45),.6,[6,9.8,4.8,13.6]);
   x.fillStyle=sh(c,-.22);x.fillRect(-8.1,14.6,16.2,1.6);for(let i=-7;i<=7;i+=1.4)line(x,'rgba(0,0,0,.18)',.3,[i,14.7,i,16.1]);
   for(const[a,b,c2,d]of[[-1.8,1.8,-2.6,8],[1.8,1.8,2.6,7.2]]){line(x,OL,1.6,[a,b,c2,d]);line(x,'#f6f4fb',.8,[a,b,c2,d]);x.fillStyle='#3a3550';x.fillRect(c2-.5,d-.2,1,1.4)}
   x.fillStyle='#ffffff';x.globalAlpha=.85;spark(x,4.6,5,1.4,'#ffffff');x.globalAlpha=1}}},
  jacket:{torso:{bb:[-10,0,20,17],f(x){const c='#3f6fb0',S='#f0a040';x.fillStyle='#f2f0ea';P(x,[-3.4,1,3.4,1,2.6,16,-2.6,16])();x.fill();x.fillStyle='#e05a6a';x.beginPath();x.arc(0,8,1.3,0,6.3);x.fill();
   line(x,OL,.8,[-3.4,1,-2.6,16]);line(x,OL,.8,[3.4,1,2.6,16]);line(x,S,.4,[-4,2,-3.3,14.4],[.8,.7]);line(x,S,.4,[4,2,3.3,14.4],[.8,.7]);
   for(const s of[-1,1]){cel(x,P(x,[s*4.4,5.2,s*8,5.2,s*7.8,9.4,s*4.6,9.4]),sh(c,-.06),.6);cel(x,P(x,[s*4.2,4.8,s*8.2,4.8,s*7.6,6.8,s*6.2,7.6,s*4.8,6.8]),sh(c,.06),.6);x.fillStyle='#c98a3a';x.beginPath();x.arc(s*6.2,6.6,.6,0,6.3);x.fill();
    cel(x,P(x,[s*3.4,1,s*9.4,1.2,s*6.8,6,s*3,4.2]),sh(c,.1),.8);line(x,S,.35,[s*4.2,1.8,s*7.6,1.9,s*6.2,4.8],[.7,.6])}
   x.fillStyle=sh(c,-.12);x.fillRect(-8.1,14.2,16.2,1.9);line(x,S,.35,[-7.8,14.6,7.8,14.6],[.7,.6]);x.fillStyle='#c98a3a';for(const a of[-6,6]){x.beginPath();x.arc(a,15.2,.55,0,6.3);x.fill()}}}},
  sparksuit:{legs:Y,paws:1,torso:{bb:[-10,0,20,17],f(x){
   cel(x,()=>{x.beginPath();x.moveTo(0,4.4);x.bezierCurveTo(5.8,4.4,6.8,10,5.9,16.2);x.lineTo(-5.9,16.2);x.bezierCurveTo(-6.8,10,-5.8,4.4,0,4.4);x.closePath()},CR,.8);
   star(x,0,10.6,2.8,1.2,5);x.fillStyle=TL;x.fill();x.strokeStyle=OL;x.lineWidth=.6;x.stroke();x.fillStyle='#e8ffff';x.beginPath();x.arc(-.7,9.7,.55,0,6.3);x.fill();
   line(x,'rgba(120,80,10,.55)',.7,[0,1.2,0,4.4]);for(let y=1.6;y<4.4;y+=.8)line(x,'rgba(120,80,10,.5)',.35,[-.5,y,.5,y]);spark(x,.9,3.2,1.2,TL);
   x.fillStyle=CR;for(let i=0;i<5;i++){x.beginPath();x.arc(-3.2+i*1.6,1.3,1,0,Math.PI);x.fill()}
   spark(x,-7,3.4,1.1,TL);spark(x,7.2,4.6,.9,TL);line(x,'rgba(170,110,20,.45)',.5,[-8.6,6,-7.8,15]);line(x,'rgba(170,110,20,.45)',.5,[8.6,6,7.8,15])}},
   back:{bb:[-13,-9,20,13],f(x){cel(x,()=>{x.beginPath();x.moveTo(-9.4,3);x.bezierCurveTo(-11.6,-2.4,-7,-5.6,-1,-5);x.bezierCurveTo(4,-4.6,6.2,-1.2,5.2,2.6);x.closePath()},sh(Y,-.1),1);
    x.strokeStyle=CR;x.lineWidth=1.3;x.beginPath();x.moveTo(-8,1.6);x.bezierCurveTo(-9,-2,-5,-3.8,-.6,-3.6);x.stroke();
    for(const[a,b,r]of[[-7.4,-3.2,-.7],[-3.6,-4.6,-.45]]){x.save();x.translate(a,b);x.rotate(r);x.scale(.5,.5);ear(x,1);x.restore()}}},
   tail:{bb:[-15,-25,18,29],f(x){glow(x,-5.6,-18.6,8,'#7ff6ff',.55);
    cel(x,()=>{x.beginPath();x.moveTo(.6,2);x.bezierCurveTo(-7,2,-13,-3,-12.5,-10);x.bezierCurveTo(-12,-15,-9,-17.5,-6,-17.8);x.lineTo(-5.4,-14.6);x.bezierCurveTo(-7.6,-14,-9,-12.4,-8.8,-10);x.bezierCurveTo(-8.4,-5,-4,-2,.6,-2);x.closePath()},Y,1);
    line(x,'rgba(170,110,20,.5)',.55,[-2,1.2,-7.4,-.6,-10.6,-5.6]);line(x,OL,.6,[-12.6,-8,-13.8,-8.6]);line(x,OL,.6,[-11.4,-4.4,-12.8,-4.4]);hl(x,.8,.55,[-9.6,-14.4,-11,-11]);
    star(x,-5.6,-18.8,4.4,2,5,-1.75);x.fillStyle=TL;x.fill();x.strokeStyle=OL;x.lineWidth=.8;x.stroke();star(x,-5.6,-18.8,2.2,1,5,-1.75);x.fillStyle='#bdfcff';x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-6.6,-20,.7,0,6.3);x.fill()}},
   zap:{bb:[-4,-4,8,8],f(x){glow(x,0,0,3.8,'#9ffcff',.8);spark(x,0,0,3,'#ffffff');spark(x,0,0,1.6,TL)}},
   foot:{bb:[-5,-8,11,11],f(x){cel(x,()=>{x.beginPath();x.moveTo(-3.2,-6.2);x.lineTo(2.6,-6.2);x.bezierCurveTo(5.4,-5.8,5.8,1.8,4.2,2);x.lineTo(-3.4,2);x.bezierCurveTo(-4.2,0,-4,-4,-3.2,-6.2);x.closePath()},Y,1);
    x.fillStyle=CR;x.beginPath();x.ellipse(2.4,.6,2.5,1.4,0,0,6.3);x.fill();line(x,'rgba(120,80,10,.6)',.45,[1.6,-.5,1.6,1.6]);line(x,'rgba(120,80,10,.6)',.45,[3.2,-.4,3.2,1.6])}},
   glove:{bb:[-5,-6,10,11],f(x){mitt(x,CR,Y);x.fillStyle='#ffb3c1';for(const[a,b,r]of[[-1.7,1.9,.55],[0,2.3,.55],[1.7,1.9,.55],[0,.5,.9]]){x.beginPath();x.arc(a,b,r,0,6.3);x.fill()}}}},
  // ---------- boots: foot sprite around (fx,fy); shaft = how far up the shin the boot colour goes ----------
  spring:{shaft:.45,sc:'#4fd1ff',foot:{bb:[-5,-8,12,11],f(x){const c='#4fd1ff';cel(x,()=>{x.beginPath();x.moveTo(-3.2,-6.8);x.lineTo(2.4,-6.8);x.lineTo(2.8,-3);x.bezierCurveTo(5.8,-2.6,5.8,0,5,.3);x.lineTo(-3.6,.3);x.closePath()},c,1);
   cel(x,P(x,[-3.3,-6.8,2.5,-6.8,2.6,-5.3,-3.4,-5.3]),sh(c,.3),.6);cel(x,E(x,-.8,-2.8,1.1,1.1),'#d8dee8',.5);
   line(x,OL,1.7,[-3,.3,-1.8,1.5,-.6,.3,.6,1.5,1.8,.3,3,1.5,4.2,.3]);line(x,'#dfe5ee',.8,[-3,.3,-1.8,1.5,-.6,.3,.6,1.5,1.8,.3,3,1.5,4.2,.3]);cel(x,P(x,[-3.8,1.4,5.2,1.4,5.2,2.4,-3.8,2.4]),'#3a4252',.6)}}},
  sandal:{shaft:.5,sc:'#f3e6d0',straps:'#e8c070',foot:{bb:[-6,-8,12,11],f(x){const c='#e8c070';cel(x,()=>{x.beginPath();x.moveTo(-3.2,-6);x.lineTo(2.4,-6);x.bezierCurveTo(4.8,-3.6,5.6,-.4,4.8,.8);x.lineTo(-3.6,.8);x.closePath()},'#f3e6d0',.8);
   cel(x,P(x,[-3.9,.6,5.3,.6,5.3,2,-3.9,2]),'#a87a3a',.7);for(const[a,b,c2,d]of[[-1.4,-.4,4,.6],[.4,-3.2,4.2,-1.2],[-3.2,-5,2.8,-5]]){line(x,OL,1.8,[a,b,c2,d]);line(x,c,1,[a,b,c2,d])}
   x.save();x.translate(-3.8,-4);cel(x,()=>{x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(-3,-3.4,-5.4,-2.6);x.quadraticCurveTo(-3.6,-1.6,-4.6,-.6);x.quadraticCurveTo(-2.6,-.2,-3.2,1);x.quadraticCurveTo(-1.2,1,0,.8);x.closePath()},'#ffffff',.6);x.restore()}}},
  rocket:{shaft:.55,sc:'#ff4d4d',foot:{bb:[-8,-9,15,12],f(x){const c='#ff4d4d';cel(x,P(x,[-4,-4.6,-6.4,-5.4,-6.4,-1.2,-4,-2]),'#5b6270',.7);x.fillStyle='#ffb24a';x.beginPath();x.ellipse(-6.3,-3.3,.6,1.6,0,0,6.3);x.fill();
   cel(x,()=>{x.beginPath();x.moveTo(-3.6,-7);x.lineTo(2.8,-7);x.lineTo(3.2,-3.4);x.bezierCurveTo(6.2,-3,6.4,.6,5.4,1);x.lineTo(-4,1);x.closePath()},c,1);
   cel(x,()=>{x.beginPath();x.moveTo(2.6,-3.4);x.bezierCurveTo(5.6,-3,6.2,.4,5.4,1);x.lineTo(2,1);x.closePath()},'#dfe5ee',.6);cel(x,P(x,[-4.1,.9,5.6,.9,5.4,2.4,-4,2.4]),'#2a2d3a',.6);
   line(x,'#fff',.9,[-2.8,-6,1,-1.4]);line(x,'#ffd24a',.6,[-1.6,-6.4,2,-2])}},
   flame0:{bb:[-15,-6,10,7],f(x){glow(x,-9,-3.3,6,'#ffb24a',.6);x.fillStyle='#ff7a2a';x.beginPath();x.moveTo(-6.4,-5);x.quadraticCurveTo(-11,-4.6,-14,-3.3);x.quadraticCurveTo(-11,-2,-6.4,-1.6);x.closePath();x.fill();x.fillStyle='#ffe27a';x.beginPath();x.moveTo(-6.4,-4.2);x.quadraticCurveTo(-9,-3.8,-10.6,-3.3);x.quadraticCurveTo(-9,-2.8,-6.4,-2.4);x.closePath();x.fill()}},
   flame1:{bb:[-13,-6,8,7],f(x){glow(x,-8.4,-3.3,5,'#ffb24a',.6);x.fillStyle='#ff7a2a';x.beginPath();x.moveTo(-6.4,-4.8);x.quadraticCurveTo(-9.6,-4.4,-12,-3.3);x.quadraticCurveTo(-9.6,-2.2,-6.4,-1.8);x.closePath();x.fill();x.fillStyle='#fff6c4';x.beginPath();x.moveTo(-6.4,-4);x.quadraticCurveTo(-8.4,-3.6,-9.4,-3.3);x.quadraticCurveTo(-8.4,-3,-6.4,-2.6);x.closePath();x.fill()}}},
  sneakers:{foot:{bb:[-6,-8,13,12],f(x){const c='#f4f4ff';x.fillStyle=OL;for(const a of[-3,-.6,1.8,4.2]){x.beginPath();x.arc(a,1,1.85,0,6.3);x.fill()}x.fillStyle='#ffffff';for(const a of[-3,-.6,1.8,4.2]){x.beginPath();x.arc(a,1,1.25,0,6.3);x.fill()}x.fillStyle='#cfe3ff';x.fillRect(-4.2,1.4,9.6,.9);
   cel(x,()=>{x.beginPath();x.moveTo(-3.2,-6.4);x.lineTo(2.2,-6.4);x.bezierCurveTo(3,-2.6,6,-2.2,5.4,.2);x.lineTo(-3.6,.2);x.closePath()},c,1);
   x.fillStyle='#5fb8ff';x.beginPath();x.moveTo(-3.2,-1.2);x.quadraticCurveTo(1,-1.4,4.8,-3.6);x.quadraticCurveTo(1.6,-.2,-3.2,-.1);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=.45;x.stroke();
   for(let i=0;i<3;i++)line(x,'#9aa2c0',.55,[.6+i*.5,-5.2+i*1.1,2.4+i*.5,-5.6+i*1.1]);cel(x,P(x,[-3.6,-6.6,-1.8,-6.6,-2,-4.4,-3.7,-4.4]),'#5fb8ff',.5)}}},
  slippers:{foot:{bb:[-6,-8,13,11],f(x){const c='#ff9fc4';cel(x,()=>{x.beginPath();x.moveTo(-3.6,-3);x.bezierCurveTo(-3.8,-6.4,4.8,-6.2,5.6,-1);x.quadraticCurveTo(5.8,1.8,3.2,1.8);x.lineTo(-3.4,1.8);x.quadraticCurveTo(-4.4,0,-3.6,-3);x.closePath()},c,1);
   for(const[a,b]of[[-3,-4.2],[-1,-5],[1,-5.1],[3,-4.6]]){x.fillStyle=OL;x.beginPath();x.arc(a,b,1.45,0,6.3);x.fill()}for(const[a,b]of[[-3,-4.2],[-1,-5],[1,-5.1],[3,-4.6]]){x.fillStyle=sh(c,.42);x.beginPath();x.arc(a,b,1.05,0,6.3);x.fill()}
   x.fillStyle=OL;x.beginPath();x.arc(4,-2.6,2.1,0,6.3);x.fill();x.fillStyle='#ffffff';for(let i=0;i<6;i++){const a=i/6*6.28;x.beginPath();x.arc(4+Math.cos(a)*.8,-2.6+Math.sin(a)*.8,1,0,6.3);x.fill()}line(x,sh(c,-.35),.6,[-3.2,1.2,4.2,1.2])}}},
  cowboy:{shaft:.68,sc:'#a06a3a',foot:{bb:[-8,-8,16,11],f(x){const c='#a06a3a';cel(x,()=>{x.beginPath();x.moveTo(-3.4,-7);x.lineTo(2.6,-7);x.lineTo(3,-3.6);x.bezierCurveTo(5,-3.2,7.4,-1.2,6.8,.4);x.lineTo(-1,.6);x.lineTo(-1.4,2.2);x.lineTo(-3.8,2.2);x.lineTo(-3.6,.6);x.closePath()},c,1);
   x.fillStyle=sh(c,-.2);x.beginPath();x.moveTo(3.4,-3.4);x.bezierCurveTo(5.4,-3,7.4,-1.2,6.8,.4);x.lineTo(3,.5);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=.4;x.stroke();line(x,'#f4d7a0',.45,[-2.6,-6,-.4,-4,1.6,-5.6],[.7,.6]);line(x,'#f4d7a0',.45,[-2.4,-3.6,0,-2,2.6,-2.4],[.7,.6]);
   line(x,OL,1.1,[-3.6,-.4,-5.4,-.2]);line(x,'#d8dee8',.55,[-3.6,-.4,-5.4,-.2]);star(x,-6.6,-.2,2.1,.85,6);x.fillStyle='#eef2f8';x.fill();x.strokeStyle=OL;x.lineWidth=.3;x.stroke();x.fillStyle='#9aa4b8';x.beginPath();x.arc(-6.6,-.2,.45,0,6.3);x.fill()}}},
  // ---------- gloves: sprite centred on the hand ----------
  power:{glove:{bb:[-5,-6,10,11],f(x){const c='#c0c6d4';mitt(x,c,'#4a5162');x.fillStyle='#5b6270';for(let i=0;i<3;i++){x.fillRect(-2.5+i*1.75,.7,1.3,1.2)}line(x,'#fff',.35,[-2.4,.8,2.2,.8]);glow(x,0,-3.2,2.6,'#ffb24a',.8);x.fillStyle='#ffd27a';x.beginPath();x.arc(0,-3.2,.75,0,6.3);x.fill();x.strokeStyle=OL;x.lineWidth=.35;x.stroke()}}},
  garden:{glove:{bb:[-6,-7,12,12],f(x){const c='#7bd24f';for(const a of[-.7,0,.7]){x.save();x.translate(0,-3.4);x.rotate(a);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(1.7,-1.8,0,-3.6);x.quadraticCurveTo(-1.7,-1.8,0,0);x.closePath();x.fillStyle=a?sh(c,-.12):sh(c,.08);x.fill();x.strokeStyle=OL;x.lineWidth=.4;x.stroke();line(x,sh(c,-.4),.25,[0,-.4,0,-3]);x.restore()}
   mitt(x,c,sh(c,-.25));x.setLineDash([.45,.45]);line(x,sh(c,.45),.3,[-2.6,-1.4,2.6,-1.4]);x.setLineDash([]);x.fillStyle='#fff';for(let i=0;i<5;i++){const a=i/5*6.28;x.beginPath();x.arc(-.6+Math.cos(a)*.65,.4+Math.sin(a)*.65,.42,0,6.3);x.fill()}x.fillStyle='#ffd24a';x.beginPath();x.arc(-.6,.4,.35,0,6.3);x.fill()}}},
  midas:{glove:{bb:[-5,-6,10,11],f(x){const c='#ffcf3a';mitt(x,c,'#b8860b',1);gem(x,-.4,.8,1.25,'#e0284a');spark(x,2.6,-2.6,1.5,'#fff');spark(x,-2.6,2.6,.9,'#fff8d0')}}}
 };
 // ---------------- sprite cache ----------------
 const BK=[1,1.5,2,2.5,3,4,5,6,8,10,12,16];let S0=2;
 function begin(g){try{const m=g.getTransform();S0=Math.hypot(m.a,m.b)||2}catch(_){S0=2}}
 const bucket=k=>{const s=S0*(k||1);for(const b of BK)if(b>=s*.97)return b;return 16};
 function spr(id,part,s){const key=id+'|'+part+'|'+s;let e=SC.get(key);if(e)return e;const d=D[id][part],bb=d.bb,pad=1.2,c=document.createElement('canvas');c.width=Math.max(1,Math.ceil((bb[2]+pad*2)*s));c.height=Math.max(1,Math.ceil((bb[3]+pad*2)*s));
  const x=c.getContext('2d');x.scale(s,s);x.translate(pad-bb[0],pad-bb[1]);x.lineJoin='round';x.lineCap='round';try{d.f(x)}catch(err){console.error(err)}e={c,x:bb[0]-pad,y:bb[1]-pad,w:c.width/s,h:c.height/s};if(SC.size>420)SC.clear();SC.set(key,e);return e}
 const has=(id,part)=>!!(id&&D[id]&&D[id][part]);
 function put(g,id,part,dx,dy,k){if(!has(id,part))return;const e=spr(id,part,bucket(k));g.drawImage(e.c,dx+e.x,dy+e.y,e.w,e.h)}
 function putR(g,id,part,dx,dy,a,k,alpha){if(!has(id,part))return;const e=spr(id,part,bucket(k));g.save();g.translate(dx,dy);if(a)g.rotate(a);if(alpha!=null)g.globalAlpha*=alpha;g.drawImage(e.c,e.x,e.y,e.w,e.h);g.restore()}
 function putSkew(g,id,part,dx,dy,k){if(!has(id,part))return;const e=spr(id,part,bucket());g.save();g.translate(dx,dy);g.transform(1,0,k,1,0,0);g.drawImage(e.c,e.x,e.y,e.w,e.h);g.restore()}
 // ---------------- worn-layer helpers used by AC6.drawBody ----------------
 const twitch=t=>{const p=t%3.7;return p<.22?Math.sin(p/.22*Math.PI)*.3:0};
 function hat(g,id,hy,t,layer,k){if(!D[id])return false;if(layer=='B'){put(g,id,'hatB',0,hy,k);return true}
  put(g,id,'hatF',0,hy,k);if(id=='sparkhood'){const w=Math.sin(t*2.1)*.05;putR(g,id,'earB',-6.2,hy-16.6,-.38+w-twitch(t+1.3)*.6,k);putR(g,id,'earF',4,hy-18,.14-w+twitch(t),k)}return true}
 function tail(g,id,x0,y0,t,run,air){if(!has(id,'tail'))return;const a=Math.sin(t*(run?9:3.2))*(run?.16:.12)+(air?-.22:0),K=1.18,e=spr(id,'tail',bucket(K));g.save();g.translate(x0,y0);g.rotate(a);g.scale(K,K);g.drawImage(e.c,e.x,e.y,e.w,e.h);g.restore();
  const p=(t*.43)%1;if(p<.09){const q=p/.09,ca=Math.cos(a),sa=Math.sin(a),tx=-5.6*K,ty=-18.8*K;putR(g,id,'zap',x0+tx*ca-ty*sa+Math.sin(q*9)*2,y0+tx*sa+ty*ca-q*4,q*2,1,1-q)}}
 function boot(g,id,lx,hip,fx,fy,t,mov){const d=D[id];if(!d||!d.foot)return false;const ky=fy-5;
  if(d.shaft){const k=d.shaft,ax=fx+(lx-fx)*k,ay=ky+(hip-ky)*k;g.lineCap='round';g.strokeStyle=OL;g.lineWidth=7.6;g.beginPath();g.moveTo(ax,ay);g.lineTo(fx,ky);g.stroke();g.strokeStyle=d.sc;g.lineWidth=5.6;g.stroke();g.strokeStyle=sh(d.sc,-.3);g.lineWidth=2;g.beginPath();g.moveTo(ax-.8,ay+.6);g.lineTo(fx-.8,ky+.6);g.stroke();
   const nx=(fx-lx),ny=(ky-hip),l=Math.hypot(nx,ny)||1,px=-ny/l*3.1,py=nx/l*3.1;g.strokeStyle=OL;g.lineWidth=2.6;g.beginPath();g.moveTo(ax+px,ay+py);g.lineTo(ax-px,ay-py);g.stroke();g.strokeStyle=sh(d.sc,.32);g.lineWidth=1.3;g.stroke()}
  if(d.straps){const k=d.shaft,ax=fx+(lx-fx)*k,ay=ky+(hip-ky)*k;g.lineCap='round';for(const s of[0,1]){g.strokeStyle=OL;g.lineWidth=1.9;g.beginPath();g.moveTo(fx-2.6,ky+1);for(let i=1;i<=3;i++){const u=i/3;g.lineTo(fx+(ax-fx)*u+((i+s)%2?2.8:-2.8),ky+(ay-ky)*u)}g.stroke();g.strokeStyle=d.straps;g.lineWidth=1;g.stroke()}}
  put(g,id,'foot',fx,fy);if(id=='rocket'&&mov)put(g,id,(t*20|0)%2?'flame1':'flame0',fx,fy);return true}
 const glove=(g,id,x0,y0)=>{if(!has(id,'glove'))return false;const e=spr(id,'glove',bucket(.74));g.save();g.translate(x0,y0);g.scale(.74,.74);g.drawImage(e.c,e.x,e.y,e.w,e.h);g.restore();return true};
 // ---------------- icons: the same parts, composed and fitted to the icon square ----------------
 function torsoBase(x,c){cel(x,P(x,[-9.5,1,9.5,1,8,16,-8,16]),c,1.1)}
 function sleeve(x,c,s){x.lineCap='round';x.strokeStyle=OL;x.lineWidth=6.8;x.beginPath();x.moveTo(s*7.6,3.2);x.lineTo(s*11,11.6);x.stroke();x.strokeStyle=s<0?sh(c,-.15):c;x.lineWidth=4.6;x.stroke()}
 function icon(x,id,S){const d=D[id],w=WEAR[id];if(!d||!w)return false;x.save();x.lineJoin='round';x.lineCap='round';
  const fit=(bb,f)=>{const s=Math.min(S*.8/bb[2],S*.8/bb[3]);x.translate(S/2,S/2+S*.02);x.scale(s,s);x.translate(-(bb[0]+bb[2]/2),-(bb[1]+bb[3]/2));f()};
  if(w.s=='hat'){const bb=id=='sparkhood'?[-17,-33,31,45]:id=='nightcap'?[-26,-24,39,31]:id=='cap'?[-13,-22,34,19]:[d.hatF.bb[0],d.hatF.bb[1],d.hatF.bb[2],Math.max(d.hatF.bb[3],12)];
   fit(bb,()=>{if(d.hatB)d.hatB.f(x);if(id=='sparkhood'){x.save();x.translate(-6.2,-16.6);x.rotate(-.38);d.earB.f(x);x.restore()}d.hatF.f(x);if(id=='sparkhood'){x.save();x.translate(4,-18);x.rotate(.14);d.earF.f(x);x.restore()}})}
  else if(w.s=='body'){const c=w.c,suit=id=='sparksuit';fit(suit?[-16,-14,30,44]:id=='robe'?[-15,-6,30,42]:d.shoulder?[-16,-5,32,28]:[-13,-8,26,26],()=>{
   if(suit){x.save();x.translate(-6,15);x.rotate(-.1);d.tail.f(x);x.restore();for(const s of[-1,1]){x.lineCap='round';x.strokeStyle=OL;x.lineWidth=7.4;x.beginPath();x.moveTo(s*3,15);x.lineTo(s*3.6,22.4);x.stroke();x.strokeStyle=s<0?sh(Y,-.15):Y;x.lineWidth=5.4;x.stroke();x.save();x.translate(s*3.6,26.4);if(s<0)x.scale(-1,1);d.foot.f(x);x.restore()}}
   if(d.back)d.back.f(x);sleeve(x,c,-1);if(d.skirt&&id=='robe'){x.save();x.translate(0,16);d.skirt.f(x);x.restore()}torsoBase(x,c);d.torso.f(x);sleeve(x,c,1);
   if(d.skirt&&id!='robe'){x.save();x.translate(0,16);d.skirt.f(x);x.restore()}if(d.shoulder)d.shoulder.f(x);
   if(suit){for(const s of[-1,1]){x.save();x.translate(s*11.4,13.4);x.scale(.74,.74);d.glove.f(x);x.restore()}}})}
  else if(w.s=='boot'){const fb=d.foot.bb,top=-5-(d.shaft||0)*13-1.6,x0=Math.min(-6.5,fb[0],id=='rocket'?-15:0),x1=Math.max(7,fb[0]+fb[2]),y0=Math.min(fb[1],top-2);fit([x0,y0,x1-x0,3.4-y0],()=>{if(d.shaft){const tp=-5-d.shaft*13;cel(x,P(x,[-3.2,tp,2.6,tp,2.7,-6,-3.3,-6]),d.sc,1);line(x,sh(d.sc,-.3),.5,[-1.9,tp+1.4,-2,-6.4]);
    if(d.straps){for(const s of[0,1]){x.strokeStyle=OL;x.lineWidth=1.9;x.beginPath();x.moveTo(-2.6,-5.4);for(let i=1;i<=3;i++)x.lineTo(((i+s)%2?2.6:-2.9),-5.4+(tp+5.4)*i/3);x.stroke();x.strokeStyle=d.straps;x.lineWidth=1;x.stroke()}}else cel(x,P(x,[-3.7,tp-1,3.1,tp-1,3,tp+1.1,-3.6,tp+1.1]),sh(d.sc,.25),.8,.5,-.4)}d.foot.f(x);if(id=='rocket')D.rocket.flame0.f(x)})}
  else if(w.s=='glove'){fit([-5.8,-7.4,11.6,11.6],()=>{d.glove.f(x)})}
  x.restore();return true}
 // front view (home portrait): hoods get a symmetric version, everything else uses the 3/4 art
 function front(g,id,t){const d=D[id];if(!d)return;g.lineJoin='round';g.lineCap='round';if(d.front){d.front(g);return}if(d.hatB)d.hatB.f(g);d.hatF.f(g)}
 return{D,has,begin,put,putR,putSkew,hat,tail,boot,glove,icon,front,legs:id=>id&&D[id]&&D[id].legs,cover:id=>!!(id&&D[id]&&D[id].cover),paws:id=>!!(id&&D[id]&&D[id].paws),flush(){SC.clear()},get size(){return SC.size}}})();
drawChar=function(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q){AC6.draw(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q)};
nameTag=function(){};
// compact, validated cosmetic block for multiplayer presence
function celPres(){const w=curWing(lvl),a=curAura(lvl);return{fx:{au:SHOP7.eqRef('aura')||'',ch:SHOP7.eqRef('charm')||'',ws:SHOP7.eqRef('wskin')||''},w:w?WINGS.indexOf(w):-1,a:AURAS.indexOf(a),t:curPlateTier(lvl),ap:Object.assign({},cel.ap)}}
// Sparkmouse costume skills (the base useSkill handles cooldown, ring and burst; these add the effect)
{const _us=useSkill;useSkill=function(slot){const id=wear[slot];if((id=='sparkhood'||id=='sparksuit')&&!(cdT[slot]>0)&&!showInv&&!dlgOpen){_us.apply(this,arguments);try{if(id=='sparksuit'){P.vy=-1100;P.g=false;burst(P.x,P.y+40,'#7ff6ff',14,160,4,'p')}else{for(const m of mobs)if(Math.hypot(m.x-P.x,m.y-P.y)<T*5)hurtMob(m,12,null,0);rings.push({x:P.x,y:P.y+30,c:'#36d6e0',t:performance.now()+90});burst(P.x,P.y+24,'#fff3a0',16,220,4,'p')}}catch(_){}return}return _us.apply(this,arguments)}}
