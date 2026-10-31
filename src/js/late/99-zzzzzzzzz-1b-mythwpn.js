// ===== MYART weapons: each class's mythic weapon is its own kind (only the Reaper's is a scythe): Brawler gauntlets, Knight greatsword,
// Samurai katana, Archer bow, Mage staff, Demon blade, Elementalist spear, Stormcaller hammer, Berserker axe, Ninja chakram, Druid staff,
// Gunslinger pistol. MYART.weapon(g,k,tier,L,t,o) draws any of them like MYART.scythe: grip at the origin, pointing along +x, tier I-V
// adding detail (gems, a glowing edge, a floating halo, sparks). The names and creeds name the weapon kind instead of "scythe". =====
(()=>{
 const A=MYART,TH=A.TH,TAU=Math.PI*2,OL=A.OL;
 const WT={brawler:['gauntlet','gauntlets'],knight:['greatsword','greatsword'],samurai:['katana','katana'],archer:['bow','bow'],mage:['staff','staff'],demon:['blade','blade'],
  reaper:['scythe','scythe'],elementalist:['spear','spear'],stormcaller:['hammer','hammer'],berserker:['axe','axe'],ninja:['chakram','chakram'],druid:['branch','staff'],gunslinger:['gun','pistol']};
 for(const k in TH){const n=WT[k][1];TH[k].type=WT[k][0];TH[k].noun=n;TH[k].ep=TH[k].ep.replace(/^Scythe/,n[0].toUpperCase()+n.slice(1))}
 // move texts that described a scythe spin, for the classes that now shoot or cast
 const MV={archer:[null,null,'A sky volley that rains falling stars onto the field'],mage:[null,null,'A final cast opens a black hole that swallows foes'],druid:[null,null,'A final cast blooms a ring of petals and thorns'],
  gunslinger:['A shot that flies as a crescent',null,null],brawler:[null,null,'An uppercut that drives a pillar of fire up from the ground'],ninja:[null,null,'The chakram spins out and splashes slashing ink']};
 for(const k in MV)MV[k].forEach((d,i)=>{if(d)TH[k].mv[i][2]=d});
 const glowEdge=(g,col,t,tier,w)=>{if(tier<5)return;g.globalCompositeOperation='lighter';g.globalAlpha=.3+.25*Math.sin(t*5);g.strokeStyle=col;g.lineWidth=w||5;g.stroke();g.globalAlpha=1;g.globalCompositeOperation='source-over'};
 const halo=(g,x,y,r,col,t)=>{g.save();g.translate(x,y);g.rotate(t*.8);g.strokeStyle=A.rgba(col,.85);g.lineWidth=1.1;g.beginPath();g.ellipse(0,0,r,r*.4,0,0,TAU);g.stroke();for(let i=0;i<4;i++){const q=i*TAU/4+t;A.star4(g,Math.cos(q)*r,Math.sin(q)*r*.4,2.4,col,t)}g.restore()};
 const sparks=(g,x,y,r,col,t)=>{for(let i=0;i<5;i++){const q=t*1.7+i*1.26,rr=r*(.8+.3*Math.sin(t*2+i));A.star4(g,x+Math.cos(q)*rr,y+Math.sin(q)*rr*.7,2+Math.sin(t*6+i),col,q)}};
 const aura=(g,x,y,r,col,t,tier)=>{const gr=g.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,A.rgba(col,.26+.1*Math.sin(t*3)*(tier>=5?1.6:1)));gr.addColorStop(1,A.rgba(col,0));g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)};
 const grip=(g,k,x0,x1,w)=>{const[m,l,d,a]=TH[k].pal;const sg=g.createLinearGradient(0,-w,0,w);sg.addColorStop(0,A.mix(d,'#ffffff',.25));sg.addColorStop(1,'#050307');g.fillStyle=sg;g.beginPath();g.roundRect(x0,-w,x1-x0,w*2,w*.6);g.fill();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();
  g.strokeStyle=A.rgba(a,.9);g.lineWidth=1;for(let x=x0+2;x<x1-2;x+=3.2){g.beginPath();g.moveTo(x,-w);g.lineTo(x+2.4,w);g.stroke()}};
 const pommel=(g,k,x,r)=>{g.fillStyle=A.metal(g,x-r,-r,x+r,r,k,.2);g.beginPath();g.arc(x,0,r,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();A.gem(g,x,0,r*.55,TH[k].pal[3])};
 // ---- each kind, design length 100
 const D={
  greatsword(g,k,tr,t,o){const[m,l,d,a]=TH[k].pal;pommel(g,k,-22,5);grip(g,k,-18,-2,3);
   g.beginPath();g.moveTo(-3,-3);g.lineTo(0,-16);g.lineTo(4,-20);g.lineTo(6,-14);g.lineTo(4,-4);g.lineTo(4,4);g.lineTo(6,14);g.lineTo(4,20);g.lineTo(0,16);g.lineTo(-3,3);g.closePath();g.fillStyle=A.metal(g,-3,-20,6,20,k,.2);g.fill();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();A.curl(g,3,-12,6,-1.4,false,A.mix(l,'#ffffff',.4),.9);A.curl(g,3,12,6,1.4,true,A.mix(l,'#ffffff',.4),.9);
   g.beginPath();g.moveTo(5,-7.5);g.lineTo(92,-4.5);g.lineTo(104,0);g.lineTo(92,4.5);g.lineTo(5,7.5);g.closePath();g.fillStyle=A.metal(g,5,-8,5,8,k,.08);g.fill();g.strokeStyle=OL;g.stroke();
   g.beginPath();g.moveTo(10,-1.5);g.lineTo(80,-.8);g.lineTo(80,.8);g.lineTo(10,1.5);g.closePath();g.fillStyle=A.mix(d,m,.4);g.fill();for(let i=0;i<4;i++)A.rune(g,20+i*15,0,2.2,A.rgba(l,.95),0,i);
   g.beginPath();g.moveTo(5,-7.5);g.lineTo(92,-4.5);g.lineTo(104,0);g.strokeStyle='#ffffff';g.lineWidth=1;g.stroke();glowEdge(g,m,t,tr);A.gem(g,1,0,tr>=2?3.6:3,a,tr>=2);if(tr>=4)halo(g,0,0,16,l,t);if(tr>=5)sparks(g,60,0,28,l,t)},
  katana(g,k,tr,t){const[m,l,d,a]=TH[k].pal;grip(g,k,-24,-3,2.4);g.fillStyle=A.metal(g,-26,-3,-24,3,k);g.fillRect(-27,-2.6,3,5.2);
   g.beginPath();g.ellipse(-1,0,2.6,9,0,0,TAU);g.fillStyle=A.metal(g,-3,-9,1,9,k,.4);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();for(const s of[-1,1])A.petal(g,-1,s*6,2.4,s>0?Math.PI:0,m);
   g.beginPath();g.moveTo(1,-2.6);g.quadraticCurveTo(55,-9,106,-12);g.quadraticCurveTo(100,-7,96,-5.5);g.quadraticCurveTo(50,1.5,1,2.6);g.closePath();g.fillStyle=A.metal(g,0,-6,0,3,k,.05);g.fill();g.strokeStyle=OL;g.stroke();
   g.beginPath();g.moveTo(6,0);for(let x=6;x<96;x+=6)g.quadraticCurveTo(x+3,-3.6-x*.055,x+6,-1.2-x*.06);g.strokeStyle=A.rgba(l,.9);g.lineWidth=1;g.stroke();
   g.beginPath();g.moveTo(1,-2.6);g.quadraticCurveTo(55,-9,106,-12);g.strokeStyle='#ffffff';g.lineWidth=.9;g.stroke();glowEdge(g,m,t,tr,4);if(tr>=2)A.gem(g,-1,0,2,a);if(tr>=4)halo(g,-1,0,13,l,t);if(tr>=5)sparks(g,60,-6,26,l,t)},
  blade(g,k,tr,t){const[m,l,d,a]=TH[k].pal;pommel(g,k,-22,4.4);grip(g,k,-18,-2,2.8);
   g.beginPath();g.moveTo(-2,-3);g.lineTo(2,-15);g.lineTo(8,-10);g.lineTo(4,-3);g.lineTo(4,3);g.lineTo(8,10);g.lineTo(2,15);g.lineTo(-2,3);g.closePath();g.fillStyle=A.metal(g,-2,-15,8,15,k,.5);g.fill();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();
   g.beginPath();g.moveTo(4,-6);for(let i=0;i<6;i++){const x=4+i*16;g.lineTo(x+9,-7-i*.3);g.lineTo(x+16,-4.5-i*.4)}g.lineTo(104,-3);g.lineTo(96,4.5);g.quadraticCurveTo(50,7,4,6);g.closePath();g.fillStyle=A.metal(g,0,-8,0,6,k,.35);g.fill();g.strokeStyle=OL;g.stroke();
   g.beginPath();g.moveTo(10,1);g.bezierCurveTo(30,-3,50,4,70,0);g.bezierCurveTo(80,-2,88,1,96,0);g.strokeStyle=A.rgba(m,.95);g.lineWidth=1.6;g.stroke();for(let i=0;i<3;i++)A.drop(g,24+i*22,3.4,1.6,m);
   glowEdge(g,m,t,tr);A.gem(g,1,0,3.2,a,tr>=2);if(tr>=4)halo(g,0,0,15,l,t);if(tr>=5)sparks(g,60,0,26,m,t)},
  spear(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.fillStyle=A.metal(g,0,-2,0,2,k,.5);g.beginPath();g.roundRect(-30,-2,104,4,2);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();grip(g,k,-8,10,2.6);
   g.beginPath();g.moveTo(-30,-2);g.lineTo(-38,0);g.lineTo(-30,2);g.closePath();g.fillStyle=A.metal(g,-38,-2,-30,2,k);g.fill();g.stroke();
   g.beginPath();g.moveTo(72,-5);g.quadraticCurveTo(84,-3,108,0);g.quadraticCurveTo(84,3,72,5);g.closePath();g.fillStyle=A.metal(g,72,-5,108,5,k,.1);g.fill();g.stroke();
   for(const s of[-1,1]){g.beginPath();g.moveTo(72,s*4);g.quadraticCurveTo(80,s*12,92,s*13);g.quadraticCurveTo(82,s*8,78,s*3);g.closePath();g.fillStyle=s<0?A.mix(m,'#ffffff',.3):A.mix(a,'#ffffff',.2);g.fill();g.strokeStyle=OL;g.stroke()}
   A.gem(g,72,0,3.2,a,tr>=2);if(tr>=2){A.flame(g,96,-10,4,a,t);A.crystal(g,96,13,8,Math.PI,m)}glowEdge(g,m,t,tr);if(tr>=4)halo(g,72,0,15,l,t);if(tr>=5)sparks(g,88,0,24,l,t)},
  hammer(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.fillStyle=A.metal(g,0,-2.4,0,2.4,k,.5);g.beginPath();g.roundRect(-14,-2.6,82,5.2,2);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();grip(g,k,-14,6,3);
   g.save();g.translate(80,0);g.beginPath();g.roundRect(-14,-24,28,48,4);g.fillStyle=A.metal(g,-14,-24,14,24,k,.25);g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();
   for(const s of[-1,1]){g.beginPath();g.roundRect(-16,s>0?16:-26,32,10,3);g.fillStyle=A.metal(g,-16,-26,16,26,k,.05);g.fill();g.stroke()}
   A.bolt(g,-6,-14,22,Math.PI/2,m,7);A.gem(g,0,0,5,a,true);A.curl(g,-10,-18,6,0,false,A.mix(l,'#ffffff',.4),.9);A.curl(g,10,18,6,Math.PI,false,A.mix(l,'#ffffff',.4),.9);if(tr>=4)halo(g,0,0,22,l,t);if(tr>=5)sparks(g,0,0,30,l,t);g.restore()},
  axe(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.fillStyle=A.metal(g,0,-2.4,0,2.4,k,.6);g.beginPath();g.roundRect(-16,-2.8,96,5.6,2);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();grip(g,k,-16,6,3.2);
   g.save();g.translate(78,0);g.beginPath();g.moveTo(-6,-6);g.quadraticCurveTo(4,-14,2,-32);g.quadraticCurveTo(26,-22,28,0);g.quadraticCurveTo(26,22,2,32);g.quadraticCurveTo(4,14,-6,6);g.closePath();g.fillStyle=A.metal(g,-6,-32,28,32,k,.3);g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();
   g.beginPath();g.moveTo(2,-32);g.quadraticCurveTo(26,-22,28,0);g.quadraticCurveTo(26,22,2,32);g.strokeStyle='#ffffff';g.lineWidth=1;g.stroke();glowEdge(g,m,t,tr);
   g.beginPath();g.moveTo(4,-20);g.bezierCurveTo(14,-14,8,-4,16,0);g.bezierCurveTo(8,4,14,14,4,20);g.strokeStyle=A.rgba(m,.95);g.lineWidth=2;g.stroke();
   g.beginPath();g.moveTo(-6,-5);g.lineTo(-18,-10);g.lineTo(-12,0);g.lineTo(-18,10);g.lineTo(-6,5);g.closePath();g.fillStyle=A.metal(g,-18,-10,-6,10,k,.3);g.fill();g.strokeStyle=OL;g.stroke();A.gem(g,0,0,3.6,a,tr>=2);if(tr>=4)halo(g,6,0,20,l,t);if(tr>=5)sparks(g,10,0,30,m,t);g.restore()},
  gauntlet(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.save();g.translate(14,0);g.beginPath();g.roundRect(-16,-11,22,22,5);g.fillStyle=A.metal(g,-16,-11,6,11,k,.3);g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();
   for(let i=0;i<4;i++){g.beginPath();g.roundRect(4,-11+i*5.6,12,5.2,2.4);g.fillStyle=A.metal(g,4,-11,16,11,k,.15);g.fill();g.stroke();A.star4(g,15,-8.5+i*5.6,1.2,'#ffffff')}
   g.beginPath();g.moveTo(-16,-9);g.lineTo(-26,-12);g.lineTo(-26,12);g.lineTo(-16,9);g.closePath();g.fillStyle=A.mix(d,m,.3);g.fill();g.stroke();A.gem(g,-6,0,4,a,true);
   for(let i=0;i<3;i++){g.save();g.translate(-24,-8+i*8);g.rotate(Math.PI);A.flame(g,0,0,3.4,i==1?a:m,t+i);g.restore()}if(tr>=4)halo(g,-4,0,16,l,t);if(tr>=5)sparks(g,0,0,22,a,t);g.restore()},
  chakram(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.save();g.translate(20,0);g.rotate(t*2);const R1=20,R0=13;g.beginPath();for(let i=0;i<8;i++){const q=i/8*TAU;g.lineTo(Math.cos(q)*R1,Math.sin(q)*R1);g.lineTo(Math.cos(q+.2)*(R1+7),Math.sin(q+.2)*(R1+7));g.lineTo(Math.cos(q+.39)*R1,Math.sin(q+.39)*R1)}g.closePath();
   g.arc(0,0,R0,0,TAU,true);g.fillStyle=A.metal(g,-R1,-R1,R1,R1,k,.15);g.fill('evenodd');g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();g.beginPath();g.arc(0,0,(R0+R1)/2,0,TAU);g.strokeStyle=A.rgba(m,.95);g.lineWidth=1.6;g.stroke();
   for(let i=0;i<4;i++){const q=i/4*TAU;A.gem(g,Math.cos(q)*(R0+R1)/2,Math.sin(q)*(R0+R1)/2,1.8,a)}g.rotate(-t*2);g.beginPath();g.arc(0,0,R0-1,0,TAU);g.strokeStyle=A.rgba(l,.3);g.lineWidth=1;g.stroke();if(tr>=4)halo(g,0,0,32,l,t);if(tr>=5)sparks(g,0,0,36,l,t);g.restore();grip(g,k,-6,6,2.4)},
  gun(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.beginPath();g.moveTo(-4,0);g.lineTo(-14,20);g.quadraticCurveTo(-10,25,-3,23);g.lineTo(6,4);g.closePath();g.fillStyle=A.mix(d,'#3a2a20',.4);g.fill();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke();A.gem(g,-7,16,2,a);
   g.beginPath();g.roundRect(-6,-7,30,12,3);g.fillStyle=A.metal(g,-6,-7,24,5,k,.1);g.fill();g.stroke();A.gear(g,10,-1,6.4,A.mix(a,'#8a6420',.25),t);
   g.beginPath();g.roundRect(22,-5,58,7,2);g.fillStyle=A.metal(g,22,-5,80,2,k,.2);g.fill();g.stroke();g.beginPath();g.roundRect(22,2,40,3,1.4);g.fillStyle=A.mix(d,m,.4);g.fill();g.stroke();
   g.strokeStyle=A.rgba(m,.95);g.lineWidth=1;g.beginPath();g.moveTo(26,-1.5);g.lineTo(76,-1.5);g.stroke();for(const x of[36,52,68])A.curl(g,x,-5,4,-1.2,false,A.mix(l,'#ffffff',.4),.7);
   g.fillStyle=A.metal(g,78,-6,84,3,k);g.fillRect(78,-6,5,9);g.strokeRect(78,-6,5,9);if(tr>=2)A.gem(g,30,-8,2,a);if(tr>=4)halo(g,40,-1,18,l,t);if(tr>=5)sparks(g,60,-1,24,l,t)},
  bow(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.save();const lim=s=>{g.beginPath();g.moveTo(2,s*4);g.bezierCurveTo(14,s*20,8,s*40,22,s*58);g.lineTo(26,s*55);g.bezierCurveTo(14,s*40,20,s*20,6,s*3);g.closePath();g.fillStyle=A.metal(g,0,0,26,s*58,k,.3);g.fill();g.strokeStyle=OL;g.lineWidth=1.1;g.stroke()};
   lim(-1);lim(1);for(const s of[-1,1]){A.crystal(g,16,s*30,9,s>0?Math.PI*.8:Math.PI*.2,m);A.feather(g,22,s*56,14,s*(Math.PI*.35),'#ffffff',A.mix(m,'#ffffff',.4));A.star4(g,24,s*57,3.4,l,t)}
   g.beginPath();g.moveTo(23,-57);g.lineTo(-10,0);g.lineTo(23,57);g.strokeStyle=A.rgba(l,.95);g.lineWidth=.8;g.stroke();g.globalCompositeOperation='lighter';g.strokeStyle=A.rgba(m,.4);g.lineWidth=2.4;g.stroke();g.globalCompositeOperation='source-over';
   g.beginPath();g.roundRect(-3,-7,8,14,3);g.fillStyle=A.mix(d,'#000000',.2);g.fill();g.strokeStyle=OL;g.stroke();A.gem(g,4,0,4,a,true);A.curl(g,6,-6,6,-1,false,A.mix(l,'#ffffff',.4),.9);A.curl(g,6,6,6,1,true,A.mix(l,'#ffffff',.4),.9);
   if(tr>=2){g.save();g.translate(4,0);g.rotate(t);for(let i=0;i<4;i++){const q=i/4*TAU;A.star4(g,Math.cos(q)*9,Math.sin(q)*9,2.4,l,0)}g.restore()}if(tr>=4)halo(g,4,0,18,l,t);if(tr>=5)sparks(g,10,0,40,l,t);g.restore()},
  staff(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.fillStyle=A.mix(d,'#000000',.2);g.beginPath();g.roundRect(-40,-2.4,118,4.8,2);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();for(const x of[-30,20,60]){g.fillStyle=A.metal(g,x,-4,x+4,4,k);g.beginPath();g.roundRect(x,-3.6,4,7.2,1.4);g.fill();g.stroke()}grip(g,k,-6,12,2.6);
   g.save();g.translate(90,0);for(const s of[-1,1]){g.beginPath();g.moveTo(-14,s*2);g.bezierCurveTo(-6,s*20,14,s*20,16,s*8);g.quadraticCurveTo(6,s*14,-4,s*3);g.closePath();g.fillStyle=A.metal(g,-14,s*20,16,0,k,.25);g.fill();g.strokeStyle=OL;g.stroke()}
   const pul=.5+.5*Math.sin(t*3),gr=g.createRadialGradient(4,0,1,4,0,13);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,l);gr.addColorStop(1,A.rgba(m,0));g.fillStyle=gr;g.beginPath();g.arc(4,0,12+pul*1.5,0,TAU);g.fill();g.beginPath();g.arc(4,0,6,0,TAU);g.fillStyle=A.mix(m,'#ffffff',.3);g.fill();g.strokeStyle=OL;g.lineWidth=.9;g.stroke();
   g.save();g.translate(4,0);g.rotate(t*.9);g.strokeStyle=A.rgba(l,.85);g.lineWidth=.9;g.beginPath();g.ellipse(0,0,17,6,0,0,TAU);g.stroke();for(let i=0;i<3;i++)A.rune(g,Math.cos(i*2.1)*17,Math.sin(i*2.1)*6,2.4,l,0,i);g.restore();
   if(tr>=2)A.gem(g,-14,0,3,a,true);if(tr>=4)halo(g,4,0,24,l,t);if(tr>=5)sparks(g,4,0,30,l,t);g.restore()},
  branch(g,k,tr,t){const[m,l,d,a]=TH[k].pal;g.strokeStyle='#3a2414';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-40,0);g.bezierCurveTo(0,4,40,-4,82,0);g.stroke();g.strokeStyle='#6a4428';g.lineWidth=2;g.stroke();
   g.strokeStyle='#2a5a1a';g.lineWidth=1.4;g.beginPath();for(let x=-34;x<80;x+=4)g.lineTo(x,Math.sin(x*.25)*3.6);g.stroke();for(let i=0;i<5;i++)A.leaf(g,-20+i*22,i%2?-3:3,7,i%2?-.9:.9,m);
   g.save();g.translate(88,0);for(let i=0;i<5;i++){g.save();g.rotate(i/5*TAU+t*.3);A.leaf(g,4,0,14,0,i%2?m:A.mix(m,'#ffffff',.3));g.restore()}A.rose(g,0,0,8,a);const gr=g.createRadialGradient(0,0,0,0,0,18);gr.addColorStop(0,A.rgba(l,.6));gr.addColorStop(1,A.rgba(l,0));g.fillStyle=gr;g.fillRect(-18,-18,36,36);
   if(tr>=4)halo(g,0,0,24,l,t);if(tr>=5)sparks(g,0,0,30,m,t);g.restore()}};
 A.weapon=function(g,k,tier,L,t,o){const th=TH[k]||TH.reaper,ty=th.type||'scythe';if(ty=='scythe')return A.scythe(g,k,tier,L,t,o);tier=Math.max(1,Math.min(5,tier|0));o=o||{};t=t||0;g.save();g.scale(L/100,L/100);g.lineJoin='round';g.lineCap='round';
  if(tier>=4||o.aura)aura(g,ty=='gauntlet'||ty=='chakram'||ty=='gun'?20:60,0,ty=='bow'?70:60,th.pal[0],t,tier);try{D[ty](g,k,tier,t,o)}catch(e){if(!A.weapon.e){A.weapon.e=1;console.error('MYART weapon',ty,e)}}g.restore()};
 A.WT=WT})();
