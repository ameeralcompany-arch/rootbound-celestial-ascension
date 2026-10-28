// ===== Nameplate skins (NPSKIN7): fire, frost, ornate, gothic, chrome and void frames. Pick one in Hub > Nameplates. =====
const PLATEX7={
 fire(x,w,h,st,bx,by,bw,bh,rr2){ // charred rim with living flames
  const flame=(X,Y,H,W,ph)=>{const g=x.createLinearGradient(X,Y,X,Y-H);g.addColorStop(0,'#ff3a10');g.addColorStop(.55,'#ff9a20');g.addColorStop(1,'rgba(255,235,120,.9)');x.fillStyle=g;x.beginPath();x.moveTo(X-W,Y);x.bezierCurveTo(X-W*.9,Y-H*.45,X-W*.2+ph,Y-H*.6,X+ph*1.5,Y-H);x.bezierCurveTo(X+W*.3,Y-H*.55,X+W*.9,Y-H*.4,X+W,Y);x.closePath();x.fill()};
  x.shadowColor='#ff7a20';x.shadowBlur=10;for(let i=0;i<9;i++){const X=bx+8+i*(bw-16)/8;flame(X,by+4,9+((i*29)%7),5.5,(i%2?2:-2))}x.shadowBlur=0;
  const gr=x.createLinearGradient(0,by,0,by+bh);gr.addColorStop(0,'#3a1208');gr.addColorStop(.5,'#1c0905');gr.addColorStop(1,'#0a0403');x.fillStyle=gr;x.beginPath();const n=Math.max(8,bw/10|0);x.moveTo(bx,by+bh/2);for(let i=0;i<=n;i++){const X=bx+i*bw/n;x.lineTo(X,by+(i%2?2.5:-.5))}x.lineTo(bx+bw,by+bh/2);for(let i=n;i>=0;i--){const X=bx+i*bw/n;x.lineTo(X,by+bh+(i%2?-2.5:.5))}x.closePath();x.fill();
  x.strokeStyle='#ff8a2a';x.lineWidth=1.6;x.shadowColor='#ff5a10';x.shadowBlur=6;x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,210,120,.55)';x.lineWidth=.8;x.beginPath();x.moveTo(bx+10,by+bh-3.5);x.lineTo(bx+bw-10,by+bh-3.5);x.stroke();
  for(const s of[-1,1]){const X=s<0?bx+2:bx+bw-2,Y=by+bh/2;x.fillStyle='#ffb02a';x.beginPath();x.moveTo(X-s*6,Y);x.lineTo(X+s*4,Y-7);x.lineTo(X+s*10,Y);x.lineTo(X+s*4,Y+7);x.closePath();x.fill();x.strokeStyle='#5a1404';x.lineWidth=1;x.stroke();x.fillStyle='#fff3b0';x.beginPath();x.arc(X+s*3,Y,2,0,6.3);x.fill()}},
 ice(x,w,h,st,bx,by,bw,bh,rr2){ // frosted glass with crystal shards and a four-point star
  const gr=x.createLinearGradient(0,by,0,by+bh);gr.addColorStop(0,'#bfe9ff');gr.addColorStop(.5,'#6fb8f0');gr.addColorStop(1,'#2e6fc0');x.fillStyle=gr;rr2(bx,by,bw,bh,bh/2.6);x.fill();
  x.save();rr2(bx,by,bw,bh,bh/2.6);x.clip();x.globalAlpha=.35;x.fillStyle='#fff';for(let i=0;i<6;i++){x.beginPath();x.moveTo(bx+i*bw/5,by);x.lineTo(bx+i*bw/5+14,by);x.lineTo(bx+i*bw/5-10,by+bh);x.lineTo(bx+i*bw/5-24,by+bh);x.closePath();x.fill()}x.globalAlpha=1;x.restore();
  x.strokeStyle='#eaf8ff';x.lineWidth=1.6;x.shadowColor='#8fd8ff';x.shadowBlur=7;rr2(bx,by,bw,bh,bh/2.6);x.stroke();x.shadowBlur=0;
  const shard=(X,Y,a,L,W2)=>{x.save();x.translate(X,Y);x.rotate(a);x.fillStyle='#f4fcff';x.strokeStyle='#4aa0e8';x.lineWidth=.9;x.beginPath();x.moveTo(0,-W2);x.lineTo(L,0);x.lineTo(0,W2);x.closePath();x.fill();x.stroke();x.restore()};
  for(let i=0;i<7;i++){const X=bx+10+i*(bw-20)/6;shard(X,by+1,-Math.PI/2+(i%2?.18:-.18),6+((i*13)%5),2.4);shard(X,by+bh-1,Math.PI/2+(i%2?-.18:.18),5+((i*17)%5),2.2)}
  for(const s of[-1,1]){const X=s<0?bx-1:bx+bw+1,Y=by+bh/2;shard(X,Y,s<0?Math.PI:0,13,4);shard(X,Y-5,s<0?Math.PI*1.2:-.35,9,2.6);shard(X,Y+5,s<0?Math.PI*.8:.35,9,2.6)}
  const X=bx+9,Y=by+bh/2;x.fillStyle='#fff';x.shadowColor='#fff';x.shadowBlur=6;x.beginPath();for(let i=0;i<8;i++){const r=i%2?2.2:7,a=i*Math.PI/4;x.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r)}x.closePath();x.fill();x.shadowBlur=0},
 ornate(x,w,h,st,bx,by,bw,bh,rr2){ // deep-blue panel, gold filigree, gem ends and a sunburst
  const gr=x.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#10206a');gr.addColorStop(.5,'#2a5ad8');gr.addColorStop(1,'#10206a');x.fillStyle=gr;rr2(bx,by,bw,bh,3);x.fill();
  x.save();rr2(bx,by,bw,bh,3);x.clip();x.globalAlpha=.18;x.strokeStyle='#9fd0ff';x.lineWidth=1;for(let i=0;i<bw/12;i++){x.beginPath();x.arc(bx+i*12,by+bh,9,Math.PI,0);x.stroke()}x.globalAlpha=1;x.restore();
  x.strokeStyle='#e8c46a';x.lineWidth=1.4;rr2(bx,by,bw,bh,3);x.stroke();x.lineWidth=.7;x.strokeStyle='rgba(255,230,160,.7)';rr2(bx+3,by+3,bw-6,bh-6,2);x.stroke();
  x.strokeStyle='#e8c46a';x.lineWidth=1.3;for(const s of[-1,1]){const X=s<0?bx:bx+bw;x.beginPath();x.moveTo(X,by+bh*.2);x.bezierCurveTo(X+s*-12,by-6,X+s*-22,by+4,X+s*-12,by+9);x.stroke();x.beginPath();x.moveTo(X,by+bh*.8);x.bezierCurveTo(X+s*-12,by+bh+6,X+s*-22,by+bh-4,X+s*-12,by+bh-9);x.stroke();
   x.fillStyle='#5ae8e0';x.strokeStyle='#e8c46a';x.beginPath();x.moveTo(X+s*-8,by+bh/2-7);x.lineTo(X+s*-1,by+bh/2);x.lineTo(X+s*-8,by+bh/2+7);x.lineTo(X+s*-15,by+bh/2);x.closePath();x.fill();x.stroke()}
  const X=w/2,Y=by;x.fillStyle='#f4d27a';x.strokeStyle='#8a5a10';x.lineWidth=.8;x.beginPath();for(let i=0;i<16;i++){const r=i%2?3.5:8,a=i*Math.PI/8-Math.PI/2;x.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r)}x.closePath();x.fill();x.stroke()},
 gothic(x,w,h,st,bx,by,bw,bh,rr2){ // black panel, pale frame, crimson vines
  x.fillStyle='#08060a';rr2(bx,by,bw,bh,2);x.fill();const gr=x.createLinearGradient(0,by,0,by+bh);gr.addColorStop(0,'rgba(120,10,30,.55)');gr.addColorStop(1,'rgba(20,0,6,0)');x.fillStyle=gr;rr2(bx,by,bw,bh,2);x.fill();
  x.strokeStyle='#e8e0d8';x.lineWidth=1.3;rr2(bx,by,bw,bh,2);x.stroke();x.strokeStyle='rgba(232,224,216,.45)';x.lineWidth=.7;rr2(bx+3,by+3,bw-6,bh-6,1);x.stroke();
  x.strokeStyle='#c0183a';x.lineWidth=1.6;x.lineCap='round';x.shadowColor='#ff2a50';x.shadowBlur=5;for(const s of[-1,1]){const X=s<0?bx:bx+bw;x.beginPath();x.moveTo(X,by+bh*.8);x.bezierCurveTo(X+s*-6,by+bh*.2,X+s*8,by-2,X+s*18,by+bh*.35);x.bezierCurveTo(X+s*26,by+bh*.7,X+s*30,by+4,X+s*40,by+bh*.4);x.stroke();x.beginPath();x.moveTo(X+s*10,by+bh*.12);x.lineTo(X+s*14,by-4);x.moveTo(X+s*26,by+bh*.62);x.lineTo(X+s*30,by+bh+3);x.stroke()}x.shadowBlur=0;
  x.fillStyle='#b01030';for(const[i,j]of[[.18,.9],[.52,1.0],[.8,.92]]){x.beginPath();x.moveTo(bx+bw*i-2,by+bh-1);x.quadraticCurveTo(bx+bw*i,by+bh+7*j,bx+bw*i+2,by+bh-1);x.fill()}
  x.fillStyle='#e8e0d8';x.beginPath();x.moveTo(w/2,by-5);x.lineTo(w/2+4,by);x.lineTo(w/2,by+3);x.lineTo(w/2-4,by);x.closePath();x.fill()},
 chrome(x,w,h,st,bx,by,bw,bh,rr2){ // holographic glass with a chrome star and bubbles
  x.fillStyle='rgba(14,10,30,.92)';rr2(bx,by,bw,bh,bh/2);x.fill();const hg=x.createLinearGradient(bx,by,bx+bw,by+bh);['#ff7ad9','#7aa8ff','#7affea','#fff27a','#ff7ad9'].forEach((c,i)=>hg.addColorStop(i/4,c));x.save();rr2(bx,by,bw,bh,bh/2);x.clip();x.globalAlpha=.28;x.fillStyle=hg;x.fillRect(bx,by,bw,bh);x.globalAlpha=1;x.restore();
  x.strokeStyle=hg;x.lineWidth=2;x.shadowColor='#b69cff';x.shadowBlur=8;rr2(bx,by,bw,bh,bh/2);x.stroke();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.8;x.beginPath();x.moveTo(bx+14,by+2.5);x.lineTo(bx+bw-14,by+2.5);x.stroke();
  const star=(X,Y,R)=>{const g=x.createLinearGradient(X-R,Y-R,X+R,Y+R);g.addColorStop(0,'#fff');g.addColorStop(.5,'#9aa8d8');g.addColorStop(1,'#e8f0ff');x.fillStyle=g;x.strokeStyle='#1a1630';x.lineWidth=.8;x.beginPath();for(let i=0;i<8;i++){const r=i%2?R*.28:R,a=i*Math.PI/4-Math.PI/2;x.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r)}x.closePath();x.fill();x.stroke()};
  star(bx+4,by+bh/2,10);star(bx+bw-6,by+bh*.25,5);x.strokeStyle='rgba(220,230,255,.7)';x.lineWidth=.8;for(const[X,Y,r]of[[bx+bw-10,by+bh*.7,3.5],[bx+bw-20,by+bh*.35,2.2]]){x.beginPath();x.arc(X,Y,r,0,6.3);x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(X-r*.3,Y-r*.3,r*.3,0,6.3);x.fill()}},
 void(x,w,h,st,bx,by,bw,bh,rr2){ // black hole ring with violet lightning
  x.fillStyle='#07030c';rr2(bx,by,bw,bh,bh/2.4);x.fill();const gr=x.createRadialGradient(bx+14,by+bh/2,2,bx+14,by+bh/2,bw*.6);gr.addColorStop(0,'rgba(190,60,255,.45)');gr.addColorStop(1,'rgba(60,0,100,0)');x.fillStyle=gr;rr2(bx,by,bw,bh,bh/2.4);x.fill();
  x.strokeStyle='#e05aff';x.lineWidth=1.8;x.shadowColor='#e05aff';x.shadowBlur=9;rr2(bx,by,bw,bh,bh/2.4);x.stroke();x.shadowBlur=0;
  const X=bx+6,Y=by+bh/2;x.fillStyle='#000';x.beginPath();x.arc(X,Y,8,0,6.3);x.fill();x.strokeStyle='#ff7aff';x.lineWidth=2;x.shadowColor='#ff5aff';x.shadowBlur=8;x.beginPath();x.arc(X,Y,8.5,0,6.3);x.stroke();x.lineWidth=1.4;x.beginPath();x.ellipse(X,Y,15,4,-.5,0,6.3);x.stroke();x.shadowBlur=0;
  x.strokeStyle='#f0a8ff';x.lineWidth=1;for(const s of[.3,.62,.86]){const X2=bx+bw*s;x.beginPath();x.moveTo(X2,by+2);x.lineTo(X2+3,by+bh*.4);x.lineTo(X2-2,by+bh*.55);x.lineTo(X2+2,by+bh-2);x.stroke()}}
};
const NPSKIN7=(()=>{
 const L=[{id:'fire',n:'Inferno Bar',lvl:20,st:{k:'fire',a:'#ff8a2a',g:'#ffd070'}},{id:'ice',n:'Frostglass',lvl:30,st:{k:'ice',a:'#eaf8ff',g:'#ffffff'}},{id:'ornate',n:'Celestial Ornate',lvl:55,st:{k:'ornate',a:'#e8c46a',g:'#ffe9a8'}},
  {id:'gothic',n:'Crimson Heritage',lvl:80,st:{k:'gothic',a:'#e8e0d8',g:'#ff9aa8'}},{id:'chrome',n:'Y2K Chrome',lvl:105,st:{k:'chrome',a:'#b69cff',g:'#e8f0ff'}},{id:'void',n:'Void Singularity',lvl:130,st:{k:'void',a:'#e05aff',g:'#f6c8ff'}}];
 const byId={};for(const s of L)byId[s.id]=s;
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpplskin';let c='';try{c=localStorage.getItem(K())||''}catch(_){}
 const ok=s=>!!byId[s]&&lvl>=byId[s].lvl;
 return{list:L,byId,cur:()=>ok(c)?c:null,set(v){c=v||'';try{localStorage.setItem(K(),c)}catch(_){}},ok,get raw(){return c}}})();
