// ===== COSM: every class's Mythic weapon as a cosmic artifact. The weapon keeps its own silhouette (MYART draws it once, off-screen); a nebula in the class's colours is poured
// into that shape, its edge catches starlight, a small planet sits in its heart, and the result is kept as a picture, so a Mythic in your hand costs one image plus a few sparks a frame.
// The look grows with the weapon: tiers I-II are Awakened, III-IV Ascended (an orbit ring), V-VI Transcendent (two rings, a moon, a star at the tip).
// It also adds the weapon showcase to the Classes screen (the panel on the left): the weapon floats, turns and glows, and the Hero button shows the old portrait. =====
const COSM=(()=>{
 const A=MYART,TH=A.TH,TAU=Math.PI*2,W0=A.weapon,R=(s=>()=>(s=Math.imul(s,1664525)+1013904223>>>0)/4294967296);
 const red=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 // deep: the dark of the metal; neb: three nebula colours; rim: edge light; star: sparkle; pl: planet [light, mid, dark]; fall: which way its motes drift (-1 up, 1 down); d: one line of lore
 const D={
  brawler:{deep:'#1c0708',neb:['#ff5a1e','#d81e5a','#7a1ea8'],rim:'#ffb070',star:'#fff0d8',pl:['#ffe0a0','#e0501e','#4a0e14'],fall:-1,mote:'ember',d:'Gauntlets forged inside a dying red star. Every punch lets a little of its fire out.'},
  knight:{deep:'#0b0f2a',neb:['#ffd86a','#6a8cff','#3a2ab0'],rim:'#fff2c0',star:'#ffffff',pl:['#fffbe0','#e8c050','#3a3070'],fall:1,mote:'feather',d:'A cathedral of starlight in the shape of a greatsword, lit by a sun that never set.'},
  samurai:{deep:'#170818',neb:['#ff5f96','#a43cff','#2b1a8c'],rim:'#ffc2dc',star:'#ffe9f2',pl:['#ffd0e0','#e0508a','#4a1450'],fall:1,mote:'petal',d:'One long cut of violet sky. Blossoms of stardust fall wherever its edge has been.'},
  archer:{deep:'#0a0a2c',neb:['#9aa8ff','#ffd98a','#4a2ab8'],rim:'#e8e4ff',star:'#fff6e0',pl:['#fff6d0','#b8a0ff','#2a2060'],fall:1,mote:'star',d:'A bow strung with a constellation. It never misses, because the stars already know where you are.'},
  mage:{deep:'#10062c',neb:['#b45aff','#ff4fd8','#3a2ae0'],rim:'#e8c8ff',star:'#fff0ff',pl:['#f4d8ff','#b04cff','#2a0e60'],fall:-1,mote:'rune',d:'A staff whose orb is a pocket galaxy. Its runes are the names of stars that no longer exist.'},
  demon:{deep:'#16040c',neb:['#ff1e46','#8a0e5a','#3a0a6a'],rim:'#ff9aa8',star:'#ffd8dc',pl:['#ffb0a8','#c8102e','#28040e'],fall:-1,mote:'ember',d:'A blade drinking from a crimson black hole. What it takes from them, it gives to you.'},
  reaper:{deep:'#0a0418',neb:['#9a4cff','#4a2cff','#d060ff'],rim:'#d8b8ff',star:'#f4e8ff',pl:['#e4ccff','#7a3ce0','#160638'],fall:-1,mote:'mote',d:'An enormous scythe cut from the night between galaxies. Its edge is the last light a star ever gave.'},
  elementalist:{deep:'#06102a',neb:['#ff7a2a','#38c8ff','#7a3cff'],rim:'#d0f0ff',star:'#ffffff',pl:['#ffe0b0','#38a0e0','#2a1060'],fall:-1,mote:'mote',d:'A spear with a comet for a head, burning on one side and frozen on the other.'},
  stormcaller:{deep:'#060c2a',neb:['#3ab8ff','#7a6cff','#e0f4ff'],rim:'#c8ecff',star:'#ffffff',pl:['#e8f8ff','#3a9cff','#0e1e60'],fall:1,mote:'spark',d:'A hammer holding a storm the size of a world. You can hear it thinking.'},
  berserker:{deep:'#180606',neb:['#ff3a1e','#a0122a','#ffa03a'],rim:'#ffc090',star:'#ffe8c8',pl:['#ffc890','#d8301a','#380808'],fall:-1,mote:'ember',d:'An axe of molten planet-core. The closer you are to falling, the brighter it burns.'},
  ninja:{deep:'#050c1c',neb:['#3ad8c8','#2a5cff','#7a3cff'],rim:'#b8fff0',star:'#e8fffa',pl:['#c8fff0','#2ab0b0','#08204a'],fall:1,mote:'mote',d:'A chakram spun from ink and twilight. It leaves before you see it and is back before you blink.'},
  druid:{deep:'#041410',neb:['#4aff9a','#2ac8b8','#8a5cff'],rim:'#c8ffd8',star:'#f0fff0',pl:['#d0ffd8','#38b878','#0a2e38'],fall:1,mote:'leaf',d:'A living branch from the first world-tree, still growing towards a sun it remembers.'},
  gunslinger:{deep:'#120c06',neb:['#ffb84a','#38d0e0','#6a3cff'],rim:'#ffe0a8',star:'#fff4d8',pl:['#ffe8b8','#e09a2a','#1a2a50'],fall:-1,mote:'spark',d:'A pistol with a tiny clockwork planet for a cylinder. Every shot is one tick of its year.'}};
 // where the planet sits on each kind of weapon, and how the showcase holds it
 const HEART={scythe:[84,-1,5.6],greatsword:[1,0,4.6],katana:[-1,0,3.4],blade:[1,0,4],spear:[72,0,4.2],hammer:[80,0,6.4],axe:[78,0,4.8],gauntlet:[8,0,5],chakram:[20,0,5],gun:[10,-1,5.4],bow:[4,0,5],staff:[94,0,6.6],branch:[88,0,6]};
 const TIP={scythe:[80,-48],greatsword:[104,0],katana:[106,-12],blade:[104,-3],spear:[108,0],hammer:[80,-26],axe:[106,0],gauntlet:[30,-8],chakram:[47,0],gun:[84,-1],bow:[24,-57],staff:[94,-22],branch:[100,0]};
 const POSEQ={gauntlet:-.32,chakram:-.3,gun:-.36,bow:-.02};
 const OX=62,OY=88,DW=196,DH=176;   // the picture's design box: x -62..134, y -88..88, grip at the origin
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c};
 const heart=k=>HEART[(TH[k]||{}).type||'scythe']||HEART.scythe,tipOf=k=>TIP[(TH[k]||{}).type||'scythe']||TIP.scythe;
 const stage=t=>t>=5?3:t>=3?2:1;
 // ---- a nebula, once per class
 const NEB={};function nebula(k){if(NEB[k])return NEB[k];const d=D[k],c=mk(320,320),x=c.getContext('2d'),r=R(k.length*7919+k.charCodeAt(0)*131);x.fillStyle=d.deep;x.fillRect(0,0,320,320);x.globalCompositeOperation='lighter';
  for(let i=0;i<90;i++){const px=r()*320,py=r()*320,rad=14+r()*70,col=d.neb[i%3],gr=x.createRadialGradient(px,py,0,px,py,rad);gr.addColorStop(0,A.rgba(col,.05+r()*.13));gr.addColorStop(1,A.rgba(col,0));x.fillStyle=gr;x.fillRect(px-rad,py-rad,rad*2,rad*2)}
  // darker lanes of dust give it the look of clouds rather than a blur
  x.globalCompositeOperation='source-over';for(let i=0;i<26;i++){const px=r()*320,py=r()*320,rad=12+r()*44,gr=x.createRadialGradient(px,py,0,px,py,rad);gr.addColorStop(0,A.rgba(d.deep,.4));gr.addColorStop(1,A.rgba(d.deep,0));x.fillStyle=gr;x.fillRect(px-rad,py-rad,rad*2,rad*2)}
  x.globalCompositeOperation='lighter';for(let i=0;i<230;i++){const a=r(),s=a>.97?1.5:a>.8?1:.6;x.fillStyle=A.rgba(i%5?d.star:d.neb[0],.25+r()*.75);x.fillRect(r()*320,r()*320,s,s)}return NEB[k]=c}
 const tint=(src,col)=>{const c=mk(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c};
 const star=(g,x,y,r)=>{g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill()};
 function planet(x,cx,cy,r,p,ringed){const gl=x.createRadialGradient(cx,cy,r*.6,cx,cy,r*2.4);gl.addColorStop(0,A.rgba(p[1],.55));gl.addColorStop(1,A.rgba(p[1],0));x.fillStyle=gl;x.beginPath();x.arc(cx,cy,r*2.4,0,TAU);x.fill();
  const gr=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.25,p[0]);gr.addColorStop(.65,p[1]);gr.addColorStop(1,p[2]);x.fillStyle=gr;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();
  x.save();x.beginPath();x.arc(cx,cy,r,0,TAU);x.clip();x.strokeStyle=A.rgba(p[2],.2);x.lineWidth=r*.2;for(const q of[-.34,.3]){x.beginPath();x.ellipse(cx,cy+q*r,r*1.1,r*.14,-.18,0,TAU);x.stroke()}x.restore();
  x.strokeStyle=A.rgba('#ffffff',.55);x.lineWidth=Math.max(.3,r*.07);x.beginPath();x.arc(cx,cy,r,0,TAU);x.stroke();if(ringed){x.save();x.translate(cx,cy);x.rotate(-.34);x.strokeStyle=A.rgba(p[0],.9);x.lineWidth=Math.max(.3,r*.1);x.beginPath();x.ellipse(0,0,r*1.7,r*.42,0,0,TAU);x.stroke();x.restore()}}
 // ---- the weapon as a picture (S pixels per design unit)
 const CACHE=new Map(),PTS={};let lastBuild=-1e9;
 function points(k,orig,S){if(PTS[k])return PTS[k];const c=mk(DW,DH),x=c.getContext('2d',{willReadFrequently:true});x.drawImage(orig,0,0,DW,DH);const d=x.getImageData(0,0,DW,DH).data,all=[];for(let y=0;y<DH;y+=2)for(let i=0;i<DW;i+=2)if(d[(y*DW+i)*4+3]>170)all.push([i-OX,y-OY]);
  const r=R(k.length*131+7),out=[];const n=Math.min(46,all.length);for(let i=0;i<n;i++)out.push(all[r()*all.length|0]);out.sort((a,b)=>a[0]-b[0]);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of all){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1]}return PTS[k]={p:out,b:[x0,y0,x1,y1],seed:out.map(()=>r()*TAU)}}
 // ---- each class's own ornaments, in design units: a crescent, a shard, a ring of runes, a bolt, a flame. They grow with the stage.
 const crescent=(x,cx,cy,r,rot,c)=>{const n=Math.ceil(r*2.4*8),t=mk(n,n),q=t.getContext('2d');q.scale(8,8);q.translate(r*1.2,r*1.2);q.rotate(rot);q.fillStyle=c;q.beginPath();q.arc(0,0,r,0,TAU);q.fill();q.globalCompositeOperation='destination-out';q.beginPath();q.arc(r*.34,0,r*.86,0,TAU);q.fill();x.drawImage(t,cx-r*1.2,cy-r*1.2,r*2.4,r*2.4)};
 const shard=(x,cx,cy,s,rot,c1,c2)=>{x.save();x.translate(cx,cy);x.rotate(rot);const g=x.createLinearGradient(-s,0,s,0);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.moveTo(-s,0);x.lineTo(0,-s*.42);x.lineTo(s,0);x.lineTo(0,s*.42);x.closePath();x.fill();x.restore()};
 const boltL=(x,x0,y0,x1,y1,c,seed)=>{const r=R(seed);x.strokeStyle=c;x.lineWidth=.7;x.lineJoin='round';x.beginPath();x.moveTo(x0,y0);for(let i=1;i<6;i++){const q=i/6;x.lineTo(x0+(x1-x0)*q+(r()-.5)*6,y0+(y1-y0)*q+(r()-.5)*6)}x.lineTo(x1,y1);x.stroke()};
 const runeRing=(x,cx,cy,r,c)=>{x.strokeStyle=c;x.lineWidth=.45;x.beginPath();x.arc(cx,cy,r,0,TAU);x.stroke();x.beginPath();x.arc(cx,cy,r*.82,0,TAU);x.stroke();for(let i=0;i<8;i++){const q=i/8*TAU;x.beginPath();x.moveTo(cx+Math.cos(q)*r*.82,cy+Math.sin(q)*r*.82);x.lineTo(cx+Math.cos(q+.32)*r,cy+Math.sin(q+.32)*r);x.stroke()}};
 const ORN={
  brawler(x,d,st){for(let i=0;i<4;i++)shard(x,32,-8.5+i*5.6,3.5+st,0,d.neb[0],d.star);if(st>=3)for(const s of[-1,1])crescent(x,4,s*17,5,s>0?-1.2:1.2,d.rim)},
  knight(x,d,st){runeRing(x,1,0,st>=3?24:19,d.rim);if(st>=2)for(const s of[-1,1])shard(x,8,s*25,8,s*1.2,d.star,d.neb[0]);if(st>=3)for(let i=0;i<4;i++)shard(x,26+i*18,0,3,0,d.star,d.neb[1])},
  samurai(x,d,st){crescent(x,-1,0,11,0,d.rim);for(let i=0;i<(st>=3?5:st>=2?3:1);i++){x.save();x.translate(26+i*15,-8-i*1.4+(i%2?-4:0));x.rotate(i);x.fillStyle=A.rgba(d.star,.9);for(let n=0;n<5;n++){x.rotate(TAU/5);x.beginPath();x.ellipse(1.6,0,1.6,.8,0,0,TAU);x.fill()}x.restore()}},
  archer(x,d,st){const P=[[24,-57],[20,-34],[6,-14],[-10,0],[6,14],[20,34],[24,57]];x.strokeStyle=A.rgba(d.star,.65);x.lineWidth=.4;x.beginPath();P.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.fillStyle=d.star;for(const p of P)star(x,p[0],p[1],st>=3?2.6:1.8);if(st>=2)runeRing(x,4,0,14,d.rim)},
  mage(x,d,st){crescent(x,94,0,17,0,d.rim);runeRing(x,94,0,st>=3?24:20,d.neb[1]);if(st>=3)for(const q of[-1,0,1])shard(x,118,q*13,5,q*.3,d.star,d.neb[0])},
  demon(x,d,st){for(const s of[-1,1]){shard(x,0,s*22,9,s*2,d.neb[0],d.star);if(st>=2)shard(x,12,s*19,6,s*1.5,d.neb[1],d.star)}if(st>=3)crescent(x,62,-16,7,1.6,d.rim)},
  reaper(x,d,st){for(let i=0;i<(st>=3?3:st>=2?2:1);i++)crescent(x,-14-i*16,-14-i*3,4.5,1.2,d.star);runeRing(x,84,-1,st>=3?15:12,d.rim);if(st>=3)shard(x,84,-23,7,Math.PI/2,d.neb[2],d.star)},
  elementalist(x,d,st){const g=x.createLinearGradient(108,0,38,0);g.addColorStop(0,A.rgba(d.neb[1],.75));g.addColorStop(1,A.rgba(d.neb[0],0));x.fillStyle=g;x.beginPath();x.moveTo(104,0);x.quadraticCurveTo(70,-16,38,-5);x.quadraticCurveTo(62,0,38,5);x.quadraticCurveTo(70,16,104,0);x.fill();if(st>=2){shard(x,90,-20,5,.4,d.neb[0],d.star);shard(x,90,20,5,-.4,d.neb[1],d.star)}if(st>=3){shard(x,114,-14,4,.2,d.neb[1],d.star);shard(x,114,14,4,-.2,d.neb[0],d.star)}},
  stormcaller(x,d,st){boltL(x,66,-24,48,-34,d.rim,11);boltL(x,66,24,44,34,d.rim,17);if(st>=2){boltL(x,94,-24,114,-38,d.star,23);boltL(x,94,24,114,38,d.star,29)}if(st>=3){boltL(x,94,0,126,-6,d.neb[0],31);runeRing(x,80,0,30,d.neb[0])}},
  berserker(x,d,st){x.strokeStyle=d.neb[2];x.lineWidth=.8;for(const[a,b,c,e]of[[86,-18,96,-8],[96,-8,92,2],[92,2,100,12],[84,14,92,20]]){x.beginPath();x.moveTo(a,b);x.lineTo(c,e);x.stroke()}for(let i=0;i<(st>=3?4:st>=2?2:0);i++)shard(x,112+i*2,-20+i*14,4.5,.4-i*.3,d.neb[0],d.star)},
  ninja(x,d,st){runeRing(x,20,0,st>=3?38:33,d.rim);for(let i=0;i<(st>=3?8:4);i++){const q=i/(st>=3?8:4)*TAU+.3;x.fillStyle=d.star;star(x,20+Math.cos(q)*36,Math.sin(q)*36,1.8)}},
  druid(x,d,st){crescent(x,88,0,21,0,d.rim);for(let i=0;i<(st>=3?6:st>=2?4:2);i++){const q=i/(st>=3?6:4)*Math.PI-1.5;shard(x,88+Math.cos(q)*26,Math.sin(q)*26,4.5,q,d.neb[0],d.star)}},
  gunslinger(x,d,st){runeRing(x,10,-1,st>=3?17:13,d.rim);x.strokeStyle=d.star;x.lineWidth=.6;x.beginPath();x.moveTo(10,-1);x.lineTo(10,-10);x.moveTo(10,-1);x.lineTo(16,-4);x.stroke();if(st>=2)for(let i=0;i<3;i++)shard(x,92+i*8,-1,3-i*.5,0,d.neb[1],d.star)}};
 function ornLayer(k,st,S,w,h){const c=mk(w,h),x=c.getContext('2d');x.scale(S,S);x.translate(OX,OY);try{ORN[k]&&ORN[k](x,D[k],st)}catch(e){console.error('COSM orn',k,e)}return c}
 function build(k,tier,S){const d=D[k],st=stage(tier),w=DW*S,h=DH*S;
  const o0=mk(w,h),ox=o0.getContext('2d');ox.translate(OX*S,OY*S);W0.call(A,ox,k,Math.min(tier,3),100*S,0,{});
  const pts=points(k,o0,S);
  const n0=mk(w,h),nx=n0.getContext('2d');nx.save();const ps=Math.max(1,S*.55);nx.scale(ps,ps);nx.fillStyle=nx.createPattern(nebula(k),'repeat');nx.fillRect(0,0,w/ps,h/ps);nx.restore();nx.globalCompositeOperation='destination-in';nx.drawImage(o0,0,0);
  const c=mk(w,h),x=c.getContext('2d');
  // the glow behind it, then the metal darkened to midnight with the nebula poured in, then the original's engraving laid back over it so every line survives
  const gl=tint(o0,d.rim);x.save();try{x.filter='blur('+(2.2*S)+'px)'}catch(_){}x.globalAlpha=[.0,.45,.7,.95][st];x.drawImage(gl,0,0);x.restore();try{x.filter='none'}catch(_){}
  x.drawImage(o0,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=[0,.78,.88,.94][st];x.fillStyle=d.deep;x.fillRect(0,0,w,h);x.globalAlpha=1;x.globalCompositeOperation='lighter';x.globalAlpha=[0,.85,1,1][st];x.drawImage(n0,0,0);if(st>=2){x.globalAlpha=st==3?.8:.45;x.drawImage(n0,0,0)}x.globalAlpha=[0,.34,.28,.24][st];x.globalCompositeOperation='overlay';x.drawImage(o0,0,0);
  // engraving: a constellation drawn through the metal, the same lines for this weapon at every stage
  x.globalAlpha=[0,.35,.6,.85][st];x.globalCompositeOperation='lighter';x.save();x.scale(S,S);x.translate(OX,OY);x.strokeStyle=d.rim;x.lineWidth=.32;x.beginPath();const lp=pts.p;for(let i=0;i+1<lp.length;i++){if(Math.hypot(lp[i+1][0]-lp[i][0],lp[i+1][1]-lp[i][1])<20){x.moveTo(lp[i][0],lp[i][1]);x.lineTo(lp[i+1][0],lp[i+1][1])}}x.stroke();x.fillStyle=d.star;for(let i=0;i<lp.length;i+=3){x.beginPath();x.arc(lp[i][0],lp[i][1],.5,0,TAU);x.fill()}x.restore();x.globalAlpha=1;x.drawImage(ornLayer(k,st,S,w,h),0,0);
  // starlit edge: the outline minus a copy of itself shifted inward
  const e=tint(o0,d.rim),ex=e.getContext('2d');ex.globalCompositeOperation='destination-out';ex.drawImage(o0,.7*S,.8*S);x.globalCompositeOperation='lighter';x.globalAlpha=[0,.75,.9,1][st];x.drawImage(e,0,0);
  x.globalCompositeOperation='source-over';x.globalAlpha=1;x.save();x.scale(S,S);x.translate(OX,OY);const[hx,hy,hr]=heart(k);planet(x,hx,hy,hr*(st==3?1.08:1),d.pl,st>=2);
  const[tx,ty]=tipOf(k);x.fillStyle=d.star;x.globalCompositeOperation='lighter';if(st>=2)star(x,tx,ty,st==3?6:4);x.restore();return{c,glow:gl,pts}}
 function sprite(k,tier,L){if(!D[k])return null;tier=Math.max(1,Math.min(6,tier|0));const S=L>200?5:2,key=k+tier+'|'+S;let s=CACHE.get(key);if(s)return s;const n=performance.now();if(n-lastBuild<24)return null;lastBuild=n;try{s=build(k,tier,S)}catch(e){console.error('COSM',k,e);return null}s.S=S;lastBuild=performance.now();CACHE.set(key,s);if(CACHE.size>32)CACHE.delete(CACHE.keys().next().value);return s}
 // ---- what moves on top of the picture, in design units
 function rings(g,k,tier,t,front){const st=stage(tier);if(st<2)return;const d=D[k],[hx,hy,hr]=heart(k);g.save();g.translate(hx,hy);g.globalCompositeOperation='lighter';const one=(rx,ry,rot,sp,col)=>{g.save();g.rotate(rot);g.strokeStyle=A.rgba(col,front?.75:.3);g.lineWidth=.55;g.beginPath();g.ellipse(0,0,rx,ry,0,front?0:Math.PI,front?Math.PI:TAU);g.stroke();const q=(t*sp)%TAU,Q=q<0?q+TAU:q;if((Q<Math.PI)===front){g.fillStyle=d.star;star(g,Math.cos(Q)*rx,Math.sin(Q)*ry,1.7)}g.restore()};one(hr*2.8,hr*.8,-.34,1.1,d.rim);if(st>=3)one(hr*3.8,hr*1.05,.52,-.75,d.neb[0]);g.restore()}
 function sparks(g,k,tier,t,L,sp){const d=D[k],st=stage(tier),P=sp.pts.p,sd=sp.pts.seed,step=L>200?1:st==3?3:5;g.save();g.globalCompositeOperation='lighter';g.fillStyle=d.star;for(let i=0;i<P.length;i+=step){const p=P[i],w=Math.sin(p[0]*.11-t*2.1+sd[i]*.3),b=w>0?w*w:0,tw=.5+.5*Math.sin(t*3+sd[i]);const a=(.1+.9*b)*(.35+.65*tw);if(a<.08)continue;g.globalAlpha=a;if(b>.6)star(g,p[0],p[1],L>200?1.7:1.5);else g.fillRect(p[0]-.3,p[1]-.3,.6,.6)}g.restore()}
 A.weapon=function(g,k,tier,L,t,o){if(o&&o.vector)return W0.apply(this,arguments);const sp=D[k]?sprite(k,tier,L):null;if(!sp)return W0.apply(this,arguments);t=t||0;const s=L/100;g.save();g.scale(s,s);
  if(o&&o.aura){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.3+.12*Math.sin(t*2.4);g.drawImage(sp.glow,-OX,-OY,DW,DH);g.restore()}
  rings(g,k,tier,t,false);g.drawImage(sp.c,-OX,-OY,DW,DH);rings(g,k,tier,t,true);sparks(g,k,tier,t,L,sp);
  if((tier|0)>=6){const[tx,ty]=tipOf(k);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.55+.45*Math.sin(t*3.1);g.fillStyle=D[k].star;star(g,tx,ty,9);g.restore()}g.restore()};
 // ---- the showcase on the Classes screen
 const STN=['','Awakened','Ascended','Transcendent'],esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let view='weapon',cur=null,raf=0,cv=null,cx=null,sw=0,pv=0,bg=null,mo=[];
 const tierNow=k=>{try{return MYTH.tier(k)}catch(_){return 0}};
 const shownTier=k=>pv||tierNow(k)||6;
 function caption(k){const th=TH[k],d=D[k],t=tierNow(k),st=t?stage(t):0,sh=stage(shownTier(k)),last=th.mv[th.mv.length-1],cls=(()=>{try{return CLASS7.C[k].n}catch(_){return k}})();
  return'<div class="c9cb"><button data-cv="weapon" aria-pressed="'+(view=='weapon')+'">Weapon</button><button data-cv="hero" aria-pressed="'+(view=='hero')+'">Hero</button></div>'+
   '<div class="c9cc"><small>'+esc(cls)+' · Mythic '+esc(th.noun)+'</small><h3>'+esc(th.n)+'</h3><p>'+esc(d.d)+'</p><p class="c9cs"><b>Signature</b> '+esc(last[0])+': '+esc(last[2])+'</p>'+
   '<div class="c9cst" role="group" aria-label="Stages">'+[1,2,3].map(i=>'<button data-cst="'+i+'" class="'+(i==sh?'on ':'')+(i<=st?'got':'')+'" title="'+(i<=st?'Reached':'Preview')+'">'+['','I','II','III'][i]+'<span>'+STN[i]+'</span></button>').join('')+'</div>'+
   '<small class="c9cf">'+(t?'Forged · Tier '+MYTH.RN[t]+' · Stage '+['','I','II','III'][st]+(pv&&stage(pv)!=st?' · previewing':''):'Not forged yet · this is what you are working towards')+'</small></div>'}
 function mkBg(k,w,h){const c=mk(w,h),x=c.getContext('2d'),d=D[k],n=nebula(k);x.fillStyle=d.deep;x.fillRect(0,0,w,h);const sc=Math.max(w,h)/320*1.25;x.save();x.globalAlpha=.85;x.scale(sc,sc);x.drawImage(n,0,0);x.restore();
  const v=x.createRadialGradient(w/2,h*.44,Math.min(w,h)*.2,w/2,h*.5,Math.max(w,h)*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(2,1,8,.86)');x.fillStyle=v;x.fillRect(0,0,w,h);
  const a=x.createRadialGradient(w/2,h*.44,0,w/2,h*.44,Math.min(w,h)*.62);a.addColorStop(0,A.rgba(d.neb[0],.36));a.addColorStop(.5,A.rgba(d.neb[1],.12));a.addColorStop(1,A.rgba(d.neb[1],0));x.globalCompositeOperation='lighter';x.fillStyle=a;x.fillRect(0,0,w,h);
  // a pool of light under the weapon
  x.save();x.translate(w/2,h*.8);x.scale(1,.2);const pd=x.createRadialGradient(0,0,0,0,0,w*.42);pd.addColorStop(0,A.rgba(d.rim,.5));pd.addColorStop(1,A.rgba(d.rim,0));x.fillStyle=pd;x.beginPath();x.arc(0,0,w*.42,0,TAU);x.fill();x.restore();return c}
 function motes(k,w,h){const d=D[k],r=R(k.length*97+3),n=red()?0:22;mo=[];for(let i=0;i<n;i++)mo.push({x:r()*w,y:r()*h,s:.4+r()*1,v:(8+r()*22)*d.fall,ph:r()*TAU,c:i%3?d.star:d.neb[i%2]})}
 function drawMote(g,m,kind,t){const w=Math.sin(t*1.3+m.ph);g.fillStyle=m.c;g.globalAlpha=.32+.5*(.5+.5*Math.sin(t*2+m.ph));if(kind=='petal'||kind=='leaf'||kind=='feather'){g.save();g.translate(m.x+w*9,m.y);g.rotate(m.ph+t*.7);g.beginPath();g.ellipse(0,0,4*m.s*(kind=='feather'?1.5:1),1.8*m.s,0,0,TAU);g.fill();g.restore()}else if(kind=='star'||kind=='rune')star(g,m.x+w*4,m.y,3.4*m.s);else if(kind=='spark'){g.fillRect(m.x+w*3,m.y,1.2*m.s,7*m.s)}else{g.beginPath();g.arc(m.x+w*5,m.y,1.5*m.s,0,TAU);g.fill()}}
 function frame(){raf=0;if(!cv||!cv.isConnected||view!='weapon'||!cur)return;const t=performance.now()/1000,w=cv.width,h=cv.height,k=cur,th=TH[k],ty=th.type||'scythe',tier=shownTier(k),q=red()?1:Math.min(1,(performance.now()-sw)/520),ez=1-Math.pow(1-q,3);
  cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=1;cx.globalCompositeOperation='source-over';if(bg)cx.drawImage(bg,0,0);
  cx.globalCompositeOperation='lighter';const dt=frame.t?Math.min(.05,t-frame.t):0;frame.t=t;for(const m of mo){m.y+=m.v*dt;if(m.y<-8)m.y=h+8;if(m.y>h+8)m.y=-8;drawMote(cx,m,D[k].mote,t)}cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
  const sp=sprite(k,tier,600);if(sp){const b=sp.pts.b,rot=POSEQ[ty]!=null?POSEQ[ty]:-1.16,ex=(b[2]-b[0]),ey=(b[3]-b[1]),c=Math.abs(Math.cos(rot)),s=Math.abs(Math.sin(rot)),fw=ex*c+ey*s,fh=ex*s+ey*c,L=Math.min(w*.88/fw,h*.58/fh)*100,mx=(b[0]+b[2])/2,my=(b[1]+b[3])/2,mot=red()?0:1;
   cx.save();cx.translate(w/2,h*.42+Math.sin(t*1.25)*h*.012*mot);cx.rotate(rot+(1-ez)*.32+Math.sin(t*.62)*.05*mot);const roll=mot?.93+.07*Math.cos(t*.8):1;cx.scale((.8+.2*ez)*1,(.8+.2*ez)*roll);cx.globalAlpha=ez;cx.translate(-mx*L/100,-my*L/100);A.weapon(cx,k,tier,Math.max(201,L),red()?0:t,{aura:1});cx.restore();cx.globalAlpha=1}
  if(q<1){const r=(.1+q*.7)*Math.max(w,h);cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=(1-q)*.9;cx.strokeStyle=D[k].rim;cx.lineWidth=(1-q)*10+1;cx.beginPath();cx.arc(w/2,h*.42,r,0,TAU);cx.stroke();cx.restore()}
  if(!red()||q<1)raf=requestAnimationFrame(frame)}
 function start(){if(!raf&&cv)raf=requestAnimationFrame(frame)}
 function attach(el,k){const art=el.querySelector('.c9art');if(!art)return;const hero=art.querySelector('.c9heroc');let c=art.querySelector('.c9cos'),cap=art.querySelector('.c9capt');if(!c){c=document.createElement('canvas');c.className='c9cos';c.setAttribute('aria-hidden','true');art.appendChild(c);cap=document.createElement('div');cap.className='c9capt';art.appendChild(cap);
    cap.addEventListener('click',e=>{const a=e.target.closest('[data-cv]'),s=e.target.closest('[data-cst]');if(a){view=a.dataset.cv;refresh();try{UIS.play('tab')}catch(_){}}else if(s){const i=+s.dataset.cst,t=tierNow(cur);pv=t&&stage(t)==i?0:[0,2,4,6][i];sw=performance.now();refresh();try{UIS.play('tab')}catch(_){}}})}
  if(k!==cur){cur=k;pv=0;sw=performance.now();bg=null}
  function refresh(){cap.innerHTML=caption(cur);art.classList.toggle('hero',view=='hero');c.style.display=view=='weapon'?'block':'none';if(hero)hero.style.visibility=view=='weapon'?'hidden':'visible';if(view=='weapon')start()}
  const r=art.getBoundingClientRect(),dpr=Math.min(1.5,devicePixelRatio||1),w=Math.max(200,Math.round(r.width*dpr)),h=Math.max(200,Math.round(r.height*dpr));if(c.width!=w||c.height!=h||!bg||cv!==c){c.width=w;c.height=h;bg=mkBg(k,w,h);motes(k,w,h)}cv=c;cx=c.getContext('2d');refresh()}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;cur=null;cv=null}
 {const _a=MYUI.after,_s=MYUI.stop;MYUI.after=function(el,k){const r=_a.apply(this,arguments);try{attach(el,k)}catch(e){console.error('COSM attach',e)}return r};MYUI.stop=function(){stop();return _s.apply(this,arguments)}}
 return{D,stage,STN,sprite,nebula,heart,get view(){return view},set view(v){view=v},get cur(){return cur},get preview(){return pv}}})();
