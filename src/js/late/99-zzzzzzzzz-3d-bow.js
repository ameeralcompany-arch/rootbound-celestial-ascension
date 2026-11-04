// ===== BOW15: bows are held and shot like bows. The far hand holds the bow out at whatever you aim at, the near hand draws the string back to the cheek with an arrow on it, the string snaps
// forward when you loose, and the arrow leaves from the bow. Bows are redrawn so a limb's tips sweep back towards the archer. Other players see the same stance while they are shooting.
// Also here: ordinary scythes and sickles are gripped along the shaft with the blade facing forward, away from the face. =====
const BOW15=(()=>{
 const OL='#140c1c',clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let last=-1e9;
 const COL={zephyrbow:['#3f9e74','#9cf2c8','#e8fff6','#7fe8b0'],crowbow:['#2c1c40','#7e52b8','#d8b8ff','#b070ff'],icebow:['#4d94c8','#bfe8ff','#ffffff','#8fd0ff'],raijinbow:['#40346e','#ffd86a','#fff4c8','#c8a0ff']};
 function pal(id){return COL[id]||(()=>{const c=(WPN[id]&&WPN[id].g)||[200,200,220],s='rgb('+c.join(',')+')';return['#3a3048',s,'#ffffff',s]})()}
 const PW=350;
 // the stance: the direction in the character's own space (facing +x) and how far the string is drawn
 function pose(o){if(o.me){const now=performance.now();if(now-last>3000)return null;const w=WPN[o.wpn]||{},dx=(mx+cam.x-P.x)*(P.f||1),dy=my+cam.y-(P.y+22);return{a:clamp(Math.atan2(dy,Math.max(4,dx)),-1.25,1.25),pull:clamp((now-last)/Math.max(PW*.5,(w.cd||.6)*700),0,1)}}return o.sw>0?{a:-.06,pull:.8}:null}
 const nock=b=>6+b.pull*19;
 // where an arrow starts, in the world
 function origin(wx,wy){const f=wx>=P.x?1:-1,hy=P.y+22,a=clamp(Math.atan2(wy-hy,Math.max(4,(wx-P.x)*f)),-1.25,1.25);return{x:P.x+f*(3+Math.cos(a)*23)*1.1,y:hy+Math.sin(a)*23*1.1}}
 function string(g,tx,ty,n,c){g.strokeStyle=c;g.lineWidth=.8;g.beginPath();g.moveTo(tx,-ty);g.lineTo(-n,0);g.lineTo(tx,ty);g.stroke()}
 function arrow(g,n,c){g.lineCap='round';g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(-n,0);g.lineTo(-n+27,0);g.stroke();g.strokeStyle='#efe6d2';g.lineWidth=.9;g.stroke();g.fillStyle=c;g.strokeStyle=OL;g.lineWidth=.6;g.beginPath();g.moveTo(-n+33,0);g.lineTo(-n+26,-2.4);g.lineTo(-n+27,0);g.lineTo(-n+26,2.4);g.closePath();g.fill();g.stroke();g.fillStyle=c;for(const s of[-1,1]){g.beginPath();g.moveTo(-n+1,0);g.lineTo(-n-2,s*2.6);g.lineTo(-n+5,s*.6);g.closePath();g.fill()}}
 // an ordinary bow, grip at the origin, shooting along +x, tips behind the grip
 function limb(g,s,c){g.beginPath();g.moveTo(1,s*3);g.bezierCurveTo(8,s*8,8,s*18,-3,s*23);g.lineTo(-8,s*26);g.lineTo(-5,s*22);g.bezierCurveTo(3,s*17,3,s*9,-2,s*3);g.closePath();g.fillStyle=c[1];g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();g.strokeStyle=c[2];g.lineWidth=.5;g.beginPath();g.moveTo(3,s*7);g.bezierCurveTo(6,s*11,5,s*17,-3,s*22);g.stroke()}
 function plain(g,id,pull,t,k){const c=pal(id);g.save();g.scale(k,k);g.lineJoin='round';g.lineCap='round';{const n=(pull>0?nock({pull}):3)/k;string(g,-8,26,n,c[2]);if(pull>.1)arrow(g,n,c[3])}limb(g,-1,c);limb(g,1,c);g.fillStyle=c[0];g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.roundRect(-2.4,-4.4,5,8.8,2);g.fill();g.stroke();
  if(id=='crowbow'){g.fillStyle=c[3];for(const s of[-1,1]){g.save();g.translate(-8,s*26);g.rotate(s*-.6);g.beginPath();g.ellipse(-3,0,5,1.8,0,0,6.3);g.fill();g.restore()}}
  else if(id=='icebow'){g.fillStyle='rgba(255,255,255,.9)';for(const s of[-1,1]){g.beginPath();g.moveTo(5,s*12);g.lineTo(9,s*14);g.lineTo(5.6,s*16);g.closePath();g.fill()}}
  else if(id=='raijinbow'){g.strokeStyle=c[1];g.lineWidth=1;g.beginPath();g.moveTo(1,-2.6);g.lineTo(-1,0);g.lineTo(1,0);g.lineTo(-1,2.6);g.stroke();if(t){g.strokeStyle='rgba(255,240,170,'+(.4+.4*Math.sin(t*19))+')';g.lineWidth=.6;g.beginPath();g.moveTo(5,-11);g.lineTo(9,-14);g.lineTo(6,-17);g.moveTo(5,11);g.lineTo(9,14);g.lineTo(6,17);g.stroke()}}
  else if(id=='zephyrbow'){g.fillStyle=c[3];g.beginPath();g.ellipse(6,-9,1.5,3.4,.5,0,6.3);g.fill();g.beginPath();g.ellipse(6,9,1.5,3.4,-.5,0,6.3);g.fill()}
  g.restore()}
 function art(g,id,pull,t,L){L=L||50;const w=WPN[id]||{};if(w.myth){const tr=Math.max(1,MYTH.tier(w.myth)||1),L0=L*.82,s=L0/100*MYART.VIS,n=nock({pull});g.save();g.lineCap='round';string(g,-28*s,72*s,pull>0?n:4,'#ffffff');if(pull>.1)arrow(g,n,COSM.D.archer.neb[0]);MYART.weapon(g,w.myth,tr,L0,t||0,{});g.restore();return}plain(g,id,pull,t,L/46)}
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){const w=WPN[id];if(!w)return _dw.apply(this,arguments);
   if(w.k=='bow'&&!w.myth){x.save();try{if(!t)x.translate(L*.42,0);art(x,id,0,t,L*1.15)}finally{x.restore()}return}
   if((w.k=='scythe'||w.k=='sickle')&&!w.myth&&t){x.save();try{x.translate(-L*.2,0);x.scale(1.12,-1.12);return _dw.apply(this,arguments)}finally{x.restore()}}
   return _dw.apply(this,arguments)}}
 // a shot was fired: draw the bow, and keep it up for a moment
 {const _uw=useWeapon;useWeapon=function(){const c0=wcd,r=_uw.apply(this,arguments);try{const w=WPN[wp];if(w&&w.k=='bow'&&c0<=0&&wcd>0){last=performance.now();swing=Math.min(swing,-.5)}}catch(_){}return r}}
 {const _u=update;update=function(dt){_u.apply(this,arguments);try{const w=WPN[wp];if(w&&w.k=='bow'&&performance.now()-last<3000&&swing<-.5)swing=-.5}catch(_){}}}
 return{pose,nock,art,origin,COL,get last(){return last},get shooting(){return performance.now()-last<600}}})();
