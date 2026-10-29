// ===== v8 charms: three more companions (registered into COMP7, so they follow with its spring and moods) and three effect charms.
// pip = sprout bunny, gloop = bubble jelly (floats), cinder = baby dragon (flies, puffs embers). Effect charms: runehalo (a turning ring
// of runes over your head), sakura (petals drift around you and trail behind), comet (a little star orbits you with a sparkling tail).
// Cost: plain fills only (no per-frame gradients or shadow blur); the halo and comet use sprites rendered once; emitted particles go
// through the pooled VFX system and are rate-limited by the quality preset.
const PETS8=(()=>{
 const OL='#1b1630';
 const eyes=(g,x,y,sp,m,t,r)=>{r=r||2.2;g.fillStyle=OL;const bl=Math.sin(t*1.3+.7)>.985||m=='sleep';
  if(m=='hurt'){g.strokeStyle=OL;g.lineWidth=1.5;for(const s of[-1,1]){g.beginPath();g.moveTo(x+s*sp-2,y-2);g.lineTo(x+s*sp+2,y+2);g.moveTo(x+s*sp+2,y-2);g.lineTo(x+s*sp-2,y+2);g.stroke()}return}
  for(const s of[-1,1]){if(bl){g.fillRect(x+s*sp-2.4,y,4.8,1.4)}else{g.beginPath();g.ellipse(x+s*sp,y,m=='wow'?r*1.25:r,m=='wow'?r*1.5:r*1.25,0,0,6.3);g.fill();g.fillStyle='#fff';g.fillRect(x+s*sp-1,y-1.6,1.2,1.2);g.fillStyle=OL}}};
 const blush=(g,x,y,sp)=>{g.fillStyle='rgba(255,130,160,.5)';for(const s of[-1,1]){g.beginPath();g.ellipse(x+s*(sp+3.6),y+3.2,2.8,1.6,0,0,6.3);g.fill()}};
 const out=(g,c,w)=>{g.fillStyle=c;g.fill();g.strokeStyle=OL;g.lineWidth=w||1.5;g.stroke()};
 const DRAW={
  // Pip: cream bunny with a two-leaf sprout between its ears; ears flop when it naps
  pip(g,t,m,sq){g.scale(1+sq*.12,1-sq*.12);const sl=m=='sleep',w=Math.sin(t*2.6)*.08;
   for(const s of[-1,1]){g.save();g.translate(s*3.4,-8);g.rotate(sl?s*1.15:s*.16+w*s);g.beginPath();g.ellipse(0,-7,2.8,7.4,0,0,6.3);out(g,'#fff6ea',1.4);g.fillStyle='#ffb3c8';g.beginPath();g.ellipse(0,-7,1.3,5,0,0,6.3);g.fill();g.restore()}
   g.beginPath();g.arc(-10,4,3,0,6.3);out(g,'#ffffff',1.2);
   g.beginPath();g.moveTo(-11,4);g.bezierCurveTo(-12,-8,10,-10,11,3);g.bezierCurveTo(11,10,-11,10,-11,4);g.closePath();out(g,'#fff6ea');
   g.fillStyle='#f2e2cc';g.beginPath();g.ellipse(-3,7,4,1.6,0,0,6.3);g.ellipse(4,7,4,1.6,0,0,6.3);g.fill();
   g.save();g.translate(0,-8.6);g.rotate(Math.sin(t*3.4)*.12);g.strokeStyle='#3f9a4a';g.lineWidth=1.2;g.beginPath();g.moveTo(0,0);g.lineTo(0,-4);g.stroke();for(const s of[-1,1]){g.beginPath();g.moveTo(0,-4);g.quadraticCurveTo(s*5,-8,s*6,-4);g.quadraticCurveTo(s*3,-2.6,0,-4);out(g,'#6fdc6a',1)}g.restore();
   eyes(g,1.4,0,3.8,m,t,1.9);blush(g,1.4,0,3.8);g.fillStyle='#ff8fae';g.beginPath();g.moveTo(.6,2.6);g.lineTo(2.2,2.6);g.lineTo(1.4,3.6);g.closePath();g.fill()},
  // Gloop: a translucent bubble jelly that floats, with swaying ribbon tentacles
  gloop(g,t,m,sq){g.translate(0,-16+Math.sin(t*2.2)*2.4);g.scale(1-sq*.08,1+sq*.1);g.lineCap='round';
   for(let i=0;i<4;i++){const x=-6+i*4;g.strokeStyle=i%2?'rgba(120,210,255,.85)':'rgba(255,150,220,.85)';g.lineWidth=1.6;g.beginPath();g.moveTo(x,5);for(let k=1;k<=4;k++)g.lineTo(x+Math.sin(t*3.6+i+k*1.1)*2.2,5+k*3.2);g.stroke()}
   g.beginPath();g.moveTo(-11,5);g.bezierCurveTo(-12,-12,12,-12,11,5);g.quadraticCurveTo(5.5,3,0,5.4);g.quadraticCurveTo(-5.5,3,-11,5);g.closePath();g.fillStyle='rgba(150,230,255,.62)';g.fill();g.strokeStyle='#2f86b8';g.lineWidth=1.5;g.stroke();
   g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-5,-5,3,1.8,-.5,0,6.3);g.fill();g.fillStyle='rgba(255,190,240,.55)';g.beginPath();g.arc(4,-6,1.6,0,6.3);g.arc(6.4,-3.4,1,0,6.3);g.fill();
   eyes(g,0,-1,3.6,m,t,1.7);blush(g,0,-1,3.4);if(m!='sleep'&&m!='hurt'){g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.arc(0,1.4,1.4,.2,2.9);g.stroke()}},
  // Cinder: a round baby dragon that flies beside you; its tail tip is a little flame
  cinder(g,t,m,sq){const fl=m=='sleep'?.15:Math.sin(t*(m=='wow'?20:12));g.translate(0,-20+Math.sin(t*2.6)*2.6);g.scale(1+sq*.06,1-sq*.06);
   g.save();g.translate(-10,4);g.rotate(Math.sin(t*3)*.25);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-7,4,-11,-2);g.lineTo(-9,-1.4);g.quadraticCurveTo(-6,1,-1,-3);g.closePath();out(g,'#ff6a3a',1.2);
    const f=1+Math.sin(t*17)*.2;g.fillStyle='#ffb02a';g.beginPath();g.moveTo(-11,-2);g.quadraticCurveTo(-16*f,-5,-13,-11*f);g.quadraticCurveTo(-11.6,-6,-9.4,-3.6);g.closePath();g.fill();g.fillStyle='#fff3a0';g.beginPath();g.arc(-12,-4.6,1.3,0,6.3);g.fill();g.restore();
   g.save();g.translate(-2,-6);g.rotate(-.5+fl*.45);g.beginPath();g.moveTo(0,0);g.lineTo(-6,-10);g.lineTo(-9,-4);g.lineTo(-12,-6);g.lineTo(-10,1);g.closePath();out(g,'#ffb02a',1.2);g.restore();
   g.beginPath();g.ellipse(-1,2,9,7.2,0,0,6.3);out(g,'#ff6a3a');g.fillStyle='#ffe2b0';g.beginPath();g.ellipse(1,4.6,5,3.4,0,0,6.3);g.fill();
   g.beginPath();g.ellipse(6,-4,7,6,0,0,6.3);out(g,'#ff7a44');for(const[a,b]of[[3,-9],[8,-9.4]]){g.beginPath();g.moveTo(a-1.4,b+1.6);g.lineTo(a-.6,b-3.4);g.lineTo(a+1.4,b+1);g.closePath();out(g,'#fff1d0',1)}
   g.save();g.translate(1,-5);g.rotate(.4-fl*.4);g.beginPath();g.moveTo(0,0);g.lineTo(-4,-9);g.lineTo(-7,-3);g.lineTo(-9,-4);g.lineTo(-7,2);g.closePath();out(g,'#ff9a3a',1.2);g.restore();
   eyes(g,7,-4.4,2.6,m,t,1.5);g.fillStyle=OL;g.fillRect(11.4,-2.6,.9,.9);g.fillStyle='rgba(255,130,160,.5)';g.beginPath();g.ellipse(9.6,-1.4,1.8,1.1,0,0,6.3);g.fill();
   g.fillStyle='#ff6a3a';g.strokeStyle=OL;g.lineWidth=1;for(const a of[-4,2]){g.beginPath();g.ellipse(a,8.4,1.8,1.4,0,0,6.3);g.fill();g.stroke()}}};
 const PET=['pip','gloop','cinder'];
 try{for(const id of PET){if(!COMP7.IDS.includes(id))COMP7.IDS.push(id);COMP7.DRAW[id]=DRAW[id]}}catch(e){console.error('PETS8',e)}
 // ---- effect charms (screen space, drawn after the body)
 let SP=null;const mk=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c};
 function spr(){if(SP)return SP;SP={};
  SP.ring=(()=>{const c=mk(128),x=c.getContext('2d');x.translate(64,64);for(const[w,a]of[[9,.12],[5,.25],[2,.9]]){x.strokeStyle='rgba(255,214,120,'+a+')';x.lineWidth=w;x.beginPath();x.arc(0,0,46,0,6.3);x.stroke()}
   x.strokeStyle='rgba(120,240,255,.8)';x.lineWidth=1.2;x.beginPath();x.arc(0,0,38,0,6.3);x.stroke();x.fillStyle='#fff3c0';x.strokeStyle='rgba(255,214,120,.9)';x.lineWidth=2.2;x.lineCap='round';
   for(let i=0;i<8;i++){x.save();x.rotate(i*Math.PI/4);x.translate(0,-46);x.fillStyle='#2a1a48';x.beginPath();x.arc(0,0,7,0,6.3);x.fill();x.strokeStyle='#ffe27a';x.lineWidth=1.6;x.beginPath();
    if(i%4==0){x.moveTo(0,-4);x.lineTo(0,4);x.moveTo(-3,-1);x.lineTo(3,-1)}else if(i%4==1){x.moveTo(-3,3);x.lineTo(0,-4);x.lineTo(3,3)}else if(i%4==2){x.arc(0,0,3,0,4.7)}else{x.moveTo(-3,-3);x.lineTo(3,3);x.moveTo(3,-3);x.lineTo(-3,3)}x.stroke();x.restore()}return c})();
  SP.star=(()=>{const c=mk(32),x=c.getContext('2d');const gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(160,230,255,.9)');gr.addColorStop(1,'rgba(90,160,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
   x.fillStyle='#fff';x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?3:12;x.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r)}x.closePath();x.fill();return c})();
  SP.petal=(()=>{const c=mk(16),x=c.getContext('2d');x.translate(8,8);x.fillStyle='#ffb0cf';x.strokeStyle='#e0709a';x.lineWidth=.8;x.beginPath();x.moveTo(0,-6);x.quadraticCurveTo(5,-1,0,6);x.quadraticCurveTo(-5,-1,0,-6);x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(-1,-1.6,1,2.4,0,0,6.3);x.fill();return c})();
  return SP}
 const FX={
  runehalo(g,cx,cy,t,f){const s=spr();g.save();g.translate(cx,cy-12+Math.sin(t*2)*1.5);g.scale(1,.34);g.rotate(t*.9);g.globalAlpha=1;g.drawImage(s.ring,-30,-30,60,60);g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(s.ring,-30,-30,60,60);g.restore()},
  sakura(g,cx,cy,t,f){const s=spr();g.save();for(let i=0;i<6;i++){const a=t*.9+i*1.047,r=22+Math.sin(t*1.3+i)*4;g.save();g.translate(cx+Math.cos(a)*r,cy+22+Math.sin(a)*r*.45+Math.sin(t*2+i)*4);g.rotate(t*1.6+i);g.globalAlpha=Math.sin(a)>0?.95:.55;g.drawImage(s.petal,-7,-7,14,14);g.restore()}g.restore()},
  comet(g,cx,cy,t,f){const s=spr();g.save();g.globalCompositeOperation='lighter';for(let k=11;k>=0;k--){const a=t*2.3-k*.085,x=cx+Math.cos(a)*32,y=cy+24+Math.sin(a)*12-Math.cos(a)*7,z=(k?10-k*.6:17),al=Math.sin(a)<0?.45:1;g.globalAlpha=(1-k/12)*al;g.drawImage(s.star,x-z/2,y-z/2,z,z)}g.restore()}};
 const _cd=FX7.charmDraw;FX7.charmDraw=function(g,c,cx,cy,t,f){if(FX[c]){try{FX[c](g,cx,cy,t,f||1)}catch(_){}return}return _cd.apply(this,arguments)};
 // ---- local emitters (world space): petals trail when you move, the comet sheds glitter, the dragon puffs embers, the halo drops motes
 let acc=0;const _tk=FX7.tick;FX7.tick=function(dt){_tk.apply(this,arguments);try{if(!entered||dt>.2)return;const c=SHOP7.eqRef('charm');if(!c)return;const q=QM.cur.vfx*(QM.reduce?.25:1);acc+=dt*q;if(acc<.06)return;acc=0;const R=Math.random,f=P.f||1,t=performance.now()/1000;
  if(c=='sakura'){const mv=Math.abs(P.vx)>40;VFX.add(4,'#ffb0cf',P.x-f*(mv?14:0)+(R()-.5)*30,P.y+10+R()*30,-f*(mv?40:0)+(R()-.5)*16,18+R()*14,1.6,9,7,{r:R()*6,vr:2.4,a:.9})}
  else if(c=='comet'){const a=t*2.3;VFX.add(1,'#bfe8ff',P.x+Math.cos(a)*32,P.y+24+Math.sin(a)*12,(R()-.5)*10,10,.6,6,1,{a:.9})}
  else if(c=='runehalo'&&R()<.5)VFX.add(1,'#ffe27a',P.x+(R()-.5)*30,P.y-10,0,-10,.8,6,1,{a:.8});
  else if(c=='cinder'&&R()<.35){const s=COMP7.st;VFX.add(0,'#ff8a2a',s.x+f*8,s.y-24,f*30,-20,.5,8,2,{a:.9})}}catch(_){}};
 return{DRAW,FX,PET,spr}})();
