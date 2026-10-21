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
 const HS=[{back:'short',top:5,th:10,bang:5,sw:1},{back:'tail',top:3,th:6,bang:5,sw:1},{back:'short',top:0,th:0,bang:7,sw:-1},{back:'shoulder',top:6,th:13,bang:6,sw:1},{back:'none',top:3,th:5,bang:3,sw:1},{back:'long',top:4,th:8,bang:6,sw:1},{back:'none',top:0,th:2,bang:3,sw:1},{back:'shoulder',top:2,th:4,bang:8,sw:-1}];
 function hairBack(g,h,hy,hair,hs,t){const c=hair,sw=hs;
  if(h.back=='none')return;celf(g,()=>{g.beginPath();
   if(h.back=='tail'){g.moveTo(-5,hy-6);g.bezierCurveTo(-14-sw*.5,hy-6,-22-sw,hy+6,-17-sw*1.6,hy+22);g.bezierCurveTo(-13-sw,hy+12,-10,hy+8,-6,hy+6)}
   else if(h.back=='long'){g.moveTo(-9,hy-4);g.bezierCurveTo(-16-sw*.3,hy+6,-14-sw*.6,hy+20,-11-sw,hy+30);g.lineTo(5,hy+28);g.bezierCurveTo(8,hy+16,9,hy+4,8,hy-4)}
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
  celf(g,poly(g,[-2.8,hy+7,2.8,hy+7,3.2,hy+14,-3.2,hy+14]),shade(skin,-.08),.9);
  // face: angular jaw
  celf(g,()=>{g.beginPath();g.moveTo(-9.6,hy-4);g.bezierCurveTo(-10,hy+3,-7,hy+8,-3,hy+10.6);g.lineTo(1.2,hy+11.2);g.bezierCurveTo(6,hy+9,9.8,hy+5,10,hy-3);g.bezierCurveTo(10,hy-9,-9.6,hy-9,-9.6,hy-4);g.closePath()},skin,1.1);
  // ear
  g.fillStyle=shade(skin,-.15);g.strokeStyle=OL;g.lineWidth=.9;g.beginPath();g.ellipse(-9.4,hy+1.5,1.8,2.6,0,0,6.3);g.fill();g.stroke();
  const ey=hy+1.2,es=L.es;eye(g,-2.6,ey,.85,es,L.eyeCol,blink,1);eye(g,5.6,ey,1,es,L.eyeCol,blink,0);
  // brows
  g.strokeStyle=shade(hair,-.5);g.lineWidth=1.5;g.lineCap='round';const bt=es==2?2.2:es==1?-.3:.6;g.beginPath();g.moveTo(-6,ey-5.6+bt);g.lineTo(-0.6,ey-6.2-bt*.3);g.stroke();g.beginPath();g.moveTo(2.6,ey-6.2-bt*.3);g.lineTo(8.6,ey-5.4+bt);g.stroke();
  // nose + mouth
  g.strokeStyle=shade(skin,-.4);g.lineWidth=.9;g.beginPath();g.moveTo(3.6,ey+3.6);g.lineTo(4.4,ey+5);g.stroke();g.strokeStyle='#8e4a52';g.lineWidth=1.1;g.beginPath();g.moveTo(1.8,hy+8);g.quadraticCurveTo(3.4,hy+8.6,5,hy+7.8);g.stroke();
  // jaw shade
  g.fillStyle='rgba(60,30,70,.12)';g.beginPath();g.moveTo(-8,hy+4);g.quadraticCurveTo(-4,hy+10,1,hy+10.8);g.lineTo(-3,hy+7);g.closePath();g.fill()}
 function drawBody(g,L,o){
  const {t,vx,air,f,sw,wpn,fm,wr}=o,run=Math.abs(vx)>10,ph=t*(run?14:2.4),ls=run?Math.sin(ph):0,as=run?Math.sin(ph+3.1):0,breath=run?0:Math.sin(t*2.2)*.5,bob=(run?Math.abs(Math.sin(ph))*-1.8:breath*.5)+(air?-1:0);
  const hs=clamp(-vx*.018,-6,6)+Math.sin(t*2.6)*1.1+(air?-2:0),blink=(t%4.2)<.13,out=L.out,trim=L.trim,sh=-37+bob,hip=-21+bob*.5;
  const boot=wr.boot&&WEAR[wr.boot]?WEAR[wr.boot].c:'#2a2030',glove=wr.glove&&WEAR[wr.glove]?WEAR[wr.glove].c:L.skin,bodyW=wr.body&&WEAR[wr.body]?WEAR[wr.body].c:null,oc=bodyW||out;
  const of=L.of;
  // --- cape (behind)
  if(L.cape){const len=L.cape==2?30:19,fl=clamp(-vx*.03,-10,10)+Math.sin(t*3)*1.5+(air?-6:0);celf(g,()=>{g.beginPath();g.moveTo(-5,sh+2);g.lineTo(6,sh+2);g.bezierCurveTo(8+fl*.3,sh+len*.5,10+fl,sh+len,6+fl*1.3,sh+len+4);g.lineTo(-9+fl*1.4,sh+len+3);g.bezierCurveTo(-11+fl*.6,sh+len*.5,-8,sh+8,-5,sh+2);g.closePath()},shade(trim,-.45),1.1)}
  hairBack(g,HS[L.hs],-50+bob,L.hair,hs,t);
  // --- far arm
  const swing=sw>0?1-sw/.22:-1,armA=swing>=0?-2.1+3.5*swing:null;
  limb(g,-5,sh+3,-8-as*2.2,hip-3-as*.8,4.4,shade(oc,-.2));g.fillStyle=glove;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.arc(-8-as*2.2,hip-2-as*.8,2.4,0,6.3);g.fill();g.stroke();
  // --- legs
  for(const s of[-1,1]){const lx=s*2.8,fx=lx+(air?s*3:s*ls*6),lift=air?-5:Math.max(0,s*ls)*5,fy=-2-lift;const pc=of==2||of==5?shade(oc,-.15):shade(L.pants,s<0?-.2:0);
   limb(g,lx,hip,fx,fy-5,5.6,pc);
   celf(g,()=>{g.beginPath();g.moveTo(fx-3,fy-6);g.lineTo(fx+3,fy-6);g.lineTo(fx+4.6,fy+2);g.lineTo(fx-3.4,fy+2);g.closePath()},boot,1);g.fillStyle=shade(trim,0);g.fillRect(fx-3,fy-6,6,1.1)}
  // --- coat tails / robe skirt (behind torso)
  const sway=clamp(-vx*.02,-5,5)+Math.sin(t*2.8)*.8;
  if(of==0||of==5){celf(g,()=>{g.beginPath();g.moveTo(-8,hip-3);g.lineTo(8,hip-3);g.lineTo(11+sway,hip+14+(air?-3:0));g.lineTo(4,hip+11);g.lineTo(0,hip+15);g.lineTo(-4,hip+11);g.lineTo(-11+sway,hip+14+(air?-3:0));g.closePath()},shade(oc,-.15),1.1)}
  if(of==2){celf(g,()=>{g.beginPath();g.moveTo(-8,hip-4);g.lineTo(8,hip-4);g.lineTo(13+sway,hip+20);g.lineTo(-13+sway,hip+20);g.closePath()},oc,1.1);g.fillStyle=trim;g.fillRect(-13+sway,hip+18,26,2)}
  // --- torso
  celf(g,()=>{g.beginPath();g.moveTo(-9.5,sh+1);g.lineTo(9.5,sh+1);g.lineTo(8,hip-1);g.lineTo(-8,hip-1);g.closePath()},of==4?'#e8e4f2':oc,1.1);
  // inner shirt / chest line
  if(of==0||of==5){g.fillStyle=shade('#e8e0ef',-.1);g.beginPath();g.moveTo(-2.4,sh+1);g.lineTo(2.4,sh+1);g.lineTo(1.2,hip-2);g.lineTo(-1.2,hip-2);g.closePath();g.fill()}
  if(of==1){celf(g,poly(g,[-4.5,sh+1,4.5,sh+1,5.5,hip+8,-5.5,hip+8]),shade(trim,-.1),1);g.fillStyle=oc;g.fillRect(-1,sh+3,2,hip+3-sh)}
  if(of==3){g.strokeStyle=trim;g.lineWidth=1.3;g.beginPath();g.moveTo(-8,sh+3);g.lineTo(6,hip-2);g.moveTo(8,sh+3);g.lineTo(-6,hip-2);g.stroke();g.fillStyle=shade(trim,-.1);g.fillRect(-1,sh+3,2,hip-sh)}
  if(of==4){celf(g,poly(g,[-9,sh+1,-1.2,sh+1,0,hip-1,-8,hip-1]),oc,1);celf(g,poly(g,[9,sh+1,1.2,sh+1,0,hip-1,8,hip-1]),oc,1);g.fillStyle=trim;g.beginPath();g.moveTo(0,sh+2);g.lineTo(2,sh+6);g.lineTo(0,hip-4);g.lineTo(-2,sh+6);g.closePath();g.fill()}
  // belt
  g.fillStyle=shade(trim,-.55);g.fillRect(-8.2,hip-6,16.4,3.2);g.fillStyle=trim;g.fillRect(-1.8,hip-6.4,3.6,4);g.strokeStyle=OL;g.lineWidth=.7;g.strokeRect(-8.2,hip-6,16.4,3.2);
  if(of==5){g.fillStyle=shade(trim,-.3);g.fillRect(-9,hip-9,18,3)}
  // collar
  if(of==0||of==3||of==5){celf(g,poly(g,[-8.5,sh+1,-3,sh-3.5,-1,sh+2]),shade(oc,.1),1);celf(g,poly(g,[8.5,sh+1,3,sh-3.5,1,sh+2]),shade(oc,.1),1)}
  if(of==2){g.fillStyle=trim;g.beginPath();g.moveTo(-9,sh+1);g.lineTo(9,sh+1);g.lineTo(0,sh+10);g.closePath();g.globalAlpha=.9;g.fill();g.globalAlpha=1}
  // trim on hem/cuff
  g.strokeStyle=trim;g.lineWidth=1;g.beginPath();g.moveTo(-9.3,sh+1.4);g.lineTo(9.3,sh+1.4);g.stroke();
  // pauldrons / mantle
  if(of==1||L.acc==5){for(const s of[-1,1]){celf(g,()=>{g.beginPath();g.ellipse(s*9.3,sh+2,L.acc==5?5.6:4.6,3.6,0,0,6.3)},L.acc==5?shade(trim,-.35):shade(trim,-.2),1)}}
  // scarf
  if(L.acc==1){celf(g,poly(g,[-5.6,sh-2,5.6,sh-2,5,sh+3,-5,sh+3]),trim,1);const tl=clamp(-vx*.04,-9,9)+Math.sin(t*4)*1.2;celf(g,()=>{g.beginPath();g.moveTo(-3,sh+2);g.lineTo(2,sh+2);g.lineTo(-6+tl,sh+15);g.lineTo(-10+tl,sh+13);g.closePath()},shade(trim,-.15),1)}
  // head
  head(g,L,-50+bob,t,air,blink,hs);
  // face-side accessories
  if(L.acc==2){g.fillStyle='#fff';g.shadowColor=trim;g.shadowBlur=4;g.beginPath();g.arc(-9.4,-50+bob+4.2,1.5,0,6.3);g.fill();g.shadowBlur=0}
  if(L.acc==3){celf(g,poly(g,[-6,-50+bob+4,8,-50+bob+4,5,-50+bob+11,-3,-50+bob+11.6]),shade('#2a2438',0),1)}
  if(L.acc==4){g.fillStyle=trim;g.strokeStyle=OL;g.lineWidth=.9;g.fillRect(-10,-50+bob-5,20,2.8);g.strokeRect(-10,-50+bob-5,20,2.8);const tl=clamp(-vx*.05,-10,10)+Math.sin(t*5);g.beginPath();g.moveTo(-10,-50+bob-4);g.quadraticCurveTo(-16+tl,-48+bob,-18+tl*1.3,-42+bob);g.lineTo(-14+tl,-43+bob);g.quadraticCurveTo(-12+tl*.5,-47+bob,-9,-52+bob);g.fill()}
  hairFront(g,HS[L.hs],-50+bob,L.hair,hs,t,air);
  if(L.acc==4){g.fillStyle=trim;g.strokeStyle=OL;g.lineWidth=.9;g.fillRect(-10,-50+bob-5,20,2.8);g.strokeRect(-10,-50+bob-5,20,2.8)}
  // legacy hat item
  if(wr.hat&&WEAR[wr.hat]){g.save();g.translate(0,-62+bob);g.scale(.62,.62);g.translate(-24,-24);try{drawWearIcon(g,wr.hat,48)}catch(_){}g.restore()}
  // --- near arm (+ weapon)
  const hx=6,hy2=sh+4;let hxp,hyp;
  if(armA!=null&&fm){hxp=hx+Math.cos(armA)*15;hyp=hy2+Math.sin(armA)*15}else{hxp=9+as*2.2;hyp=hip-2+as*.8}
  if(wpn!='fist'&&!fm){g.save();g.translate(-6,sh+4);g.rotate(-2.35);g.scale(.58,.58);drawWeapon(g,wpn,44,0);g.restore()}
  limb(g,hx,hy2-1,hxp,hyp,4.6,oc);
  if(wpn!='fist'&&fm){g.save();g.translate(hxp,hyp);g.rotate(armA!=null?armA+.15:-.6+Math.sin(t*3)*.05);drawWeapon(g,wpn,WPN[wpn].k=='sword'?44:WPN[wpn].k=='scythe'?46:WPN[wpn].k=='glaive'?34:40,t);g.restore()}
  g.fillStyle=glove;g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.arc(hxp,hyp+.6,2.6,0,6.3);g.fill();g.stroke();
  if(fm&&sw>0&&wpn=='fist'){g.fillStyle=L.skin;g.beginPath();g.arc(hxp+8*(1-sw/.22),hyp,4,0,6.3);g.fill();g.stroke()}
 }
 // collect look + cosmetic info for either the local player or a validated remote presence
 function info(lk,q,local){const A=local?cel.ap:(q&&q.cx&&q.cx.ap)||cel.ap;const lvv=local?lvl:+((q&&q.lv)||1);
  const eyeC=AP.eyeCol[A.eyeCol|0]||AP.eyeCol[0];
  return{skin:A.skinCol||(lk&&lk.skin)||'#f1c9a0',hair:A.hairCol||'#3a2a3a',hs:A.hair|0,es:A.eyes|0,eyeCol:eyeC,of:A.outfit|0,out:A.outCol,trim:A.trimCol,pants:shade(A.outCol,-.35),acc:A.acc|0,cape:A.cape|0,lv:lvv}}
 function draw(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q){
  wpn=WPN[wpn]?wpn:'fist';wr=wr||{};const local=q==='me',now=performance.now(),cxo=local?null:(q&&q.cx)||null;
  const L=info(lk,q,local),lvv=L.lv,wingIdx=local?(()=>{const w=curWing(lvl);return w?WINGS.indexOf(w):-1})():(cxo&&cxo.w!=null?cxo.w:-1),aura=local?curAura(lvl):(cxo&&AURAS[cxo.a])||AURAS[0],tier=local?curPlateTier(lvl):(cxo&&cxo.t!=null?cxo.t:npTier(lvv));
  const feet=cy+54,mode=air?2:Math.abs(vx)>10?1:0;
  // aura circle under the feet (ground-projected)
  if(aura&&aura.id!='none'&&QM.cur.wfx>=0)Sigil.draw(g,aura,cx,feet-1,t,72,.8);
  // soft shadow
  g.save();const sd=QM.cur.shadow;g.fillStyle='rgba(0,0,0,'+(sd?.32:.22)+')';g.beginPath();g.ellipse(cx,feet,15,4,0,0,6.3);g.fill();g.restore();
  // wings sit behind the body
  const hasLegacy=wr.wing&&WEAR[wr.wing];
  if(wingIdx>=0&&!hasLegacy){WingArt.draw(g,wingIdx,cx,cy+24,f,t,mode,vx,(cx*.01)%6);WingArt.extras(g,wingIdx,cx,cy+24,t)}
  else if(hasLegacy){g.save();g.translate(cx,feet);g.scale(1.1*f,1.1);try{drawWings(wr.wing,wr.wo!=null?wr.wo:wingOpen,wr.wo!=null?(wr.wo>.9?.3:0):wingFlap,t)}catch(_){}g.restore()}
  g.save();g.translate(cx,feet);g.scale(1.12*f,1.12);g.lineJoin='round';g.lineCap='round';
  try{drawBody(g,L,{t,vx:vx*f*1,air,f,sw,wpn,fm,wr})}finally{g.restore()}
  // idle VFX
  if(local||QM.cur.wfx>=2){if(wingIdx>=0&&Math.random()<.06)VFX.feather(cx+cam.x+(Math.random()<.5?-1:1)*30,cy+cam.y+10+Math.random()*30,WINGS[wingIdx].pal[2],f);
   if(aura&&aura.id!='none'&&Math.random()<.12)VFX.mote(cx+cam.x+(Math.random()-.5)*60,feet+cam.y,aura.c2)}
  // nameplate + bubble
  const nm=String(name||'').replace(/^\[\d+\]\s*/,'');Plate.draw(g,cx,cy-50,tier,nm,lvv);
  if(bubT){g.save();g.font='500 13px '+FONT;g.textAlign='center';const bw=g.measureText(bubT).width+18;rr(cx-bw/2,cy-96,bw,24,10);g.fillStyle='#fff';g.fill();g.fillStyle='#111';g.fillText(bubT,cx,cy-79);g.restore()}
 }
 function headFull(g,L,hy,t,air){const h=HS[L.hs];hairBack(g,h,hy,L.hair,0,t);head(g,L,hy,t,air,false,0);hairFront(g,h,hy,L.hair,0,t,air)}
 return{draw,info,shade,head,headFull}})();
drawChar=function(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q){AC6.draw(cx,cy,f,hue,name,t,vx,air,bubT,wpn,sw,fm,wr,dsh,lk,q)};
nameTag=function(){};
// compact, validated cosmetic block for multiplayer presence
function celPres(){const w=curWing(lvl),a=curAura(lvl);return{w:w?WINGS.indexOf(w):-1,a:AURAS.indexOf(a),t:curPlateTier(lvl),ap:Object.assign({},cel.ap)}}
