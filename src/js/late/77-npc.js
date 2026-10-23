// ===== NPC7: distinct accessories per NPC + weather-aware styling + greeting sparkle (drawn over the legacy pixel NPCs) =====
// NPCs stay where they are (shops/quests/doors depend on their position); the idle motion comes from the legacy bob/blink plus the effects below.
const NPC7=(()=>{
 const star=(g,x,y,r,rot)=>{g.beginPath();for(let i=0;i<8;i++){const a=rot+i*Math.PI/4,rr=i%2?r*.38:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill()};
 const petal=(g,x,y,r,rot,c)=>{g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=c;for(let i=0;i<5;i++){g.rotate(Math.PI*2/5);g.beginPath();g.ellipse(0,-r*.7,r*.45,r*.75,0,0,6.3);g.fill()}g.fillStyle='#ffe9a8';g.beginPath();g.arc(0,0,r*.28,0,6.3);g.fill();g.restore()};
 function base(g,n,hx,hy,t){g.save();g.lineJoin='round';
  if(n.id=='mira'){// red hair ribbon + swinging coin charm
   g.fillStyle='#d8435a';g.strokeStyle='#5a1020';g.lineWidth=1.4;g.beginPath();g.moveTo(hx+9,hy-9);g.lineTo(hx+19,hy-15);g.lineTo(hx+17,hy-5);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(hx+9,hy-9);g.lineTo(hx+19,hy-1);g.lineTo(hx+16,hy-11);g.fill();g.stroke();g.beginPath();g.arc(hx+9,hy-9,2.6,0,6.3);g.fill();g.stroke();
   const sw=Math.sin(t*2.2)*.35;g.translate(hx-13,hy+36);g.rotate(sw);g.strokeStyle='#8a6a2a';g.beginPath();g.moveTo(0,0);g.lineTo(0,8);g.stroke();g.fillStyle='#ffd24a';g.beginPath();g.arc(0,11,4.2,0,6.3);g.fill();g.stroke()}
  else if(n.id=='oak'){// leaf crown
   for(let i=-2;i<=2;i++){g.save();g.translate(hx+i*7,hy-17-Math.abs(i)*-1.2);g.rotate(i*.35+Math.sin(t*1.4+i)*.05);g.fillStyle=i%2?'#6fbf6a':'#4f9f55';g.strokeStyle='#244a2a';g.lineWidth=1.2;g.beginPath();g.ellipse(0,-5,3.6,7,0,0,6.3);g.fill();g.stroke();g.restore()}}
  else{// Bram: forehead goggles + rising embers
   g.strokeStyle='#2a2630';g.lineWidth=2.2;g.beginPath();g.moveTo(hx-15,hy-9);g.lineTo(hx+15,hy-9);g.stroke();for(const s of[-7,7]){g.fillStyle='rgba(160,220,255,.75)';g.beginPath();g.arc(hx+s,hy-10,5,0,6.3);g.fill();g.strokeStyle='#4a4f5a';g.lineWidth=1.8;g.stroke()}
   g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const u=(t*.6+i*.25)%1;g.fillStyle='rgba(255,'+(150+i*20)+',60,'+(1-u)*.8+')';g.beginPath();g.arc(hx+50+Math.sin(u*9+i)*5,hy+55-u*34,1.6,0,6.3);g.fill()}g.globalCompositeOperation='source-over'}
  g.restore()}
 function themed(g,n,hx,hy,t,wx){g.save();g.lineJoin='round';
  if(wx=='blossom'){petal(g,hx-12,hy-7,5.5,t*.4,'#ffb3cb');petal(g,hx-18,hy-1,3.6,-t*.3,'#ffd3e1');
   for(let i=0;i<4;i++){const u=(t*.18+i*.27+n.x*.13)%1;g.fillStyle='rgba(255,190,210,'+(1-u)*.85+')';g.beginPath();g.ellipse(hx-26+i*17+Math.sin(u*7+i)*7,hy-30+u*86,2.6,1.5,u*6+i,0,6.3);g.fill()}}
  else if(wx=='space'){g.strokeStyle='#9fb4ff';g.lineWidth=1.6;g.beginPath();g.moveTo(hx+8,hy-18);g.lineTo(hx+13,hy-34);g.stroke();const bl=.55+Math.sin(t*3+n.x)*.45;g.fillStyle='rgba(120,220,255,'+bl+')';g.beginPath();g.arc(hx+13,hy-35,3.2,0,6.3);g.fill();
   g.globalCompositeOperation='lighter';g.strokeStyle='rgba(120,200,255,.8)';g.lineWidth=2;g.beginPath();g.moveTo(hx-12,hy+1);g.lineTo(hx+12,hy+1);g.stroke();g.globalCompositeOperation='source-over';
   g.fillStyle='rgba(170,200,255,.8)';for(let i=0;i<3;i++){const a=t*.9+i*2.1;g.beginPath();g.arc(hx+Math.cos(a)*30,hy+22+Math.sin(a*1.3)*16,1.7,0,6.3);g.fill()}}
  else if(wx=='galaxy'){g.globalCompositeOperation='lighter';const R=26;g.strokeStyle='rgba(220,170,255,.55)';g.lineWidth=1.4;g.beginPath();g.ellipse(hx,hy-26,R,7,0,0,6.3);g.stroke();
   for(let i=0;i<5;i++){const a=t*.8+i*Math.PI*2/5;g.fillStyle=i%2?'rgba(255,170,230,.95)':'rgba(190,200,255,.95)';star(g,hx+Math.cos(a)*R,hy-26+Math.sin(a)*7,i%2?2.6:3.4,a)}
   const gr=g.createRadialGradient(hx,hy+20,4,hx,hy+20,48);gr.addColorStop(0,'rgba(190,130,255,.22)');gr.addColorStop(1,'rgba(190,130,255,0)');g.fillStyle=gr;g.beginPath();g.arc(hx,hy+20,48,0,6.3);g.fill();g.globalCompositeOperation='source-over'}
  g.restore()}
 function greet(g,n,hx,hy,t){const dx=Math.abs(P.x-(n.x*T+T/2));if(dx>T*3.2)return;const k=1-dx/(T*3.2);g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,236,170,'+(.5*k)+')';for(let i=0;i<3;i++){const a=t*1.6+i*2.1,r=22+Math.sin(t*2+i)*3;star(g,hx+Math.cos(a)*r,hy-6+Math.sin(a)*r*.6,2.4,a)}g.restore()}
 const _d=drawNPCs;
 drawNPCs=function(now){_d(now);if(!entered)return;let wx='default';try{wx=ENV7.target}catch(_){}const t=now/1000;
  for(const n of NPCS){const px=n.x*T+T/2-cam.x,gy=sh(n.x)*T-cam.y;if(px<-120||px>cv.width/ZM+120)continue;const bob=Math.sin(now/600+n.x)*1.5,hx=px,hy=gy-42+bob;
   try{base(g,n,hx,hy,t);themed(g,n,hx,hy,t,wx);greet(g,n,hx,hy,t)}catch(e){if(!drawNPCs.e){drawNPCs.e=1;console.error(e)}}}};
 return{star,petal}})();
