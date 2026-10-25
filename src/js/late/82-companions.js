// ===== Companions: four original magical spirits that follow you (equip them in the Charm slot) =====
// mochi = cloud puff, kitsu = two-tailed fox spirit, lumi = firefly orb, pebble = tiny moss golem.
// Local companion follows with a soft spring, hops when you jump, squeezes its eyes when you are hurt, and dozes when you stand still.
const COMP7=(()=>{
 const IDS=['mochi','kitsu','lumi','pebble'],st={x:0,y:0,vx:0,vy:0,init:0,idle:0,lx:0,last:0,blink:0};
 function step(now){const dt=Math.min(.05,(now-(st.last||now))/1000);st.last=now;const f=P.f||1,tx=P.x-f*38,ty=P.y+P.h-16;
  if(!st.init||Math.hypot(st.x-P.x,st.y-P.y)>900){st.x=tx;st.y=ty;st.vx=st.vy=0;st.init=1}
  const k=26,d=7;st.vx+=((tx-st.x)*k-st.vx*d)*dt;st.vy+=((ty-st.y)*k-st.vy*d)*dt;st.x+=st.vx*dt;st.y+=st.vy*dt;
  if(Math.abs(P.vx)<5&&P.g)st.idle+=dt;else st.idle=0}
 const eyes=(g,x,y,sp,mood,t)=>{g.fillStyle='#1b1630';if(mood=='hurt'){g.strokeStyle='#1b1630';g.lineWidth=1.6;for(const s of[-1,1]){g.beginPath();g.moveTo(x+s*sp-2,y-2);g.lineTo(x+s*sp+2,y+2);g.moveTo(x+s*sp+2,y-2);g.lineTo(x+s*sp-2,y+2);g.stroke()}return}
  const bl=Math.sin(t*1.3)>.985||mood=='sleep';for(const s of[-1,1]){if(bl){g.fillRect(x+s*sp-2.5,y,5,1.4)}else{g.beginPath();g.ellipse(x+s*sp,y,mood=='wow'?2.8:2.1,mood=='wow'?3.4:2.7,0,0,6.3);g.fill();g.fillStyle='#fff';g.fillRect(x+s*sp-1,y-1.6,1.2,1.2);g.fillStyle='#1b1630'}}};
 const blush=(g,x,y,sp)=>{g.fillStyle='rgba(255,130,160,.45)';for(const s of[-1,1]){g.beginPath();g.ellipse(x+s*(sp+4),y+3.5,3,1.8,0,0,6.3);g.fill()}};
 const DRAW={
  mochi(g,t,m,sq){g.scale(1+sq*.12,1-sq*.12);const gr=g.createRadialGradient(-3,-6,1,0,0,15);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#bcd8ff');g.fillStyle=gr;g.strokeStyle='#5f7fb8';g.lineWidth=1.6;g.beginPath();g.moveTo(-12,4);g.bezierCurveTo(-17,-4,-10,-14,-3,-12);g.bezierCurveTo(1,-17,10,-14,11,-7);g.bezierCurveTo(17,-5,16,4,10,6);g.bezierCurveTo(4,9,-6,9,-12,4);g.closePath();g.fill();g.stroke();eyes(g,0,-2,5,m,t);blush(g,0,-2,5);g.strokeStyle='#5f7fb8';g.lineWidth=1.2;g.beginPath();g.arc(0,2,1.8,.2,2.9);g.stroke()},
  kitsu(g,t,m){const w=Math.sin(t*3)*.25;for(const s of[-1,1]){g.save();g.rotate(s*.5+w*s);g.fillStyle='#f58a3a';g.strokeStyle='#8a3d10';g.lineWidth=1.4;g.beginPath();g.ellipse(-12,-2,10,4.2,s*.3,0,6.3);g.fill();g.stroke();g.fillStyle='#fff3dc';g.beginPath();g.ellipse(-19,-3,3.6,2.8,0,0,6.3);g.fill();g.globalCompositeOperation='lighter';g.fillStyle='rgba(110,190,255,.55)';g.beginPath();g.arc(-23,-4,3+Math.sin(t*9+s),0,6.3);g.fill();g.restore()}
   g.fillStyle='#f9a24f';g.strokeStyle='#8a3d10';g.lineWidth=1.5;g.beginPath();g.ellipse(0,0,10,8,0,0,6.3);g.fill();g.stroke();g.beginPath();g.moveTo(-8,-5);g.lineTo(-6,-14);g.lineTo(-1,-7);g.moveTo(8,-5);g.lineTo(6,-14);g.lineTo(1,-7);g.fill();g.stroke();g.fillStyle='#fff3dc';g.beginPath();g.ellipse(0,4,6,3.6,0,0,6.3);g.fill();eyes(g,0,-2,4.3,m,t);g.fillStyle='#1b1630';g.beginPath();g.arc(0,1,1,0,6.3);g.fill()},
  lumi(g,t,m){const p=.7+Math.sin(t*4)*.3;g.globalCompositeOperation='lighter';let gr=g.createRadialGradient(0,0,1,0,0,26);gr.addColorStop(0,'rgba(255,250,150,'+.85*p+')');gr.addColorStop(1,'rgba(255,230,90,0)');g.fillStyle=gr;g.fillRect(-26,-26,52,52);g.globalCompositeOperation='source-over';
   const fl=Math.sin(t*38)*.5;g.fillStyle='rgba(220,245,255,.75)';g.strokeStyle='rgba(120,160,200,.9)';g.lineWidth=1;for(const s of[-1,1]){g.beginPath();g.ellipse(s*7,-6,8,3.6,s*(-.7+fl*.4),0,6.3);g.fill();g.stroke()}
   g.fillStyle='#fff7b0';g.strokeStyle='#b89a20';g.lineWidth=1.4;g.beginPath();g.arc(0,0,6.5,0,6.3);g.fill();g.stroke();eyes(g,0,-.5,2.6,m,t)},
  pebble(g,t,m,sq){g.scale(1+sq*.1,1-sq*.1);const gr=g.createLinearGradient(-10,-10,10,10);gr.addColorStop(0,'#aab3bd');gr.addColorStop(1,'#656f7c');g.fillStyle=gr;g.strokeStyle='#2c333d';g.lineWidth=1.7;g.beginPath();g.moveTo(-10,6);g.lineTo(-12,-3);g.lineTo(-6,-11);g.lineTo(6,-11);g.lineTo(12,-2);g.lineTo(10,6);g.closePath();g.fill();g.stroke();
   g.fillStyle='#5fbf6a';g.beginPath();g.ellipse(-3,-11,7,3,0,0,6.3);g.fill();g.fillStyle='#8fe07f';g.beginPath();g.arc(3,-12,2,0,6.3);g.arc(-7,-10,1.6,0,6.3);g.fill();
   g.fillStyle='#ffd24a';g.shadowColor='#ffd24a';g.shadowBlur=5;if(m=='sleep'||Math.sin(t*1.1)>.985)g.fillRect(-3,-3,6,1.5);else{g.beginPath();g.arc(0,-3,2.6,0,6.3);g.fill()}g.shadowBlur=0;g.fillStyle='#4a525d';g.fillRect(-7,6,5,3);g.fillRect(2,6,5,3)}};
 function draw(g,c,cx,cy,t,f){const local=Math.abs(cx-(P.x-cam.x))<2&&Math.abs(cy-(P.y-cam.y))<2;let x,y,m='ok',sq=0;
  if(local){const now=performance.now();step(now);x=st.x-cam.x;y=st.y-cam.y+Math.sin(t*3)*(c=='lumi'?7:3)-(c=='lumi'?26:0);if(!P.g&&P.vy<-80){m='wow';sq=-.7}else if(!P.g)sq=-.3;else sq=Math.sin(t*5)*.06;try{if(iT>0)m='hurt'}catch(_){}if(st.idle>5&&c!='lumi')m='sleep';
   if(P.g&&Math.abs(P.vx)>60&&(c=='mochi'||c=='pebble'))y-=Math.abs(Math.sin(t*9))*4;}
  else{x=cx-f*30;y=cy+34+Math.sin(t*3)*3}
  g.restore();g.save();g.translate(x,y);g.scale(f,1);g.lineJoin='round';try{DRAW[c](g,t,m,sq)}catch(_){}g.restore();g.save()}
 const _cd=FX7.charmDraw;FX7.charmDraw=function(g,c,cx,cy,t,f){if(IDS.includes(c)){g.save();try{draw(g,c,cx,cy,t,f)}finally{g.restore()}return}return _cd(g,c,cx,cy,t,f)};
 // reactions: a little cheer sound when something exciting happens
 const _lu=window.levelUp;
 return{IDS,st,draw,DRAW}})();
