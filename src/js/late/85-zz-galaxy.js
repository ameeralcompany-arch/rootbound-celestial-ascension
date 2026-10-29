// ===== Galaxy blocks (66 Galaxy, 67 Aurora, 68 Starlight Marble) with animated nebula + twinkling stars, and the Campfire (69):
// animated flames, sparks, smoke, warm light and gentle healing nearby. Adds soft drifting pollen in the Plaza (whose town decor is PLZ7's). =====
const GAL7=(()=>{
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 SOLID6[69]=0;
 const PAL={66:{a:'#1a0f3e',b:'#5a2fb0',c:'#c8a0ff',s:'#fff'},67:{a:'#0e3a48',b:'#2fb09a',c:'#a070ff',s:'#e8fff8'},68:{a:'#f2eefa',b:'#d8d0ee',c:'#e8c46a',s:'#fff4c8'}};
 function paint(b,v){const c=document.createElement('canvas');c.width=c.height=T;const x=c.getContext('2d'),R=rr(b*911+v*53+5);
  if(b==69){x.lineCap='round';x.fillStyle='#8a8f98';x.strokeStyle='#3a3e46';x.lineWidth=2;for(let i=0;i<6;i++){const a=Math.PI+i*Math.PI/5,px=T/2+Math.cos(a)*15*-1,py=T-9-Math.sin(a)*5;x.beginPath();x.ellipse(px,py,5.5,4.2,0,0,6.3);x.fill();x.stroke()}
   x.strokeStyle='#4a2a12';x.fillStyle='#8a5a2e';x.lineWidth=2;for(const s of[-1,1]){x.save();x.translate(T/2,T-9);x.rotate(s*.5);x.beginPath();x.roundRect(-14,-3.5,28,7,3);x.fill();x.stroke();x.restore()}return c}
  const q=PAL[b],g=x.createLinearGradient(0,0,T,T);g.addColorStop(0,q.a);g.addColorStop(.55,q.b);g.addColorStop(1,q.a);x.fillStyle=g;x.fillRect(0,0,T,T);
  if(b==68){for(let i=0;i<4;i++){x.strokeStyle='rgba(200,170,90,'+(.35+R()*.3)+')';x.lineWidth=1+R()*1.4;x.beginPath();let px=R()*T,py=0;x.moveTo(px,py);for(let k=0;k<5;k++){px+=(R()-.5)*18;py+=T/5;x.lineTo(px,py)}x.stroke()}}
  else{for(let i=0;i<3;i++){const cx=R()*T,cy=R()*T,r=14+R()*14,rg=x.createRadialGradient(cx,cy,1,cx,cy,r);rg.addColorStop(0,q.c+'aa');rg.addColorStop(1,q.c+'00');x.fillStyle=rg;x.fillRect(0,0,T,T)}
   x.fillStyle=q.s;for(let i=0;i<12;i++){x.globalAlpha=.4+R()*.6;const s=R()<.2?2:1;x.fillRect(R()*T|0,R()*T|0,s,s)}x.globalAlpha=1}
  x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=1.5;x.strokeRect(1.5,1.5,T-3,T-3);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;x.strokeRect(.5,.5,T-1,T-1);return c}
 {const _bs=blockSprite;blockSprite=function(b,v){if(b>=66&&b<=69)return paint(b,v);return _bs(b,v)}}
 const sparks=[],smoke=[];let heal=0,warmT=0;
 const hash=(x,y,i)=>{let h=(x*374761393+y*668265263+i*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return((h^(h>>>16))>>>0)/4294967295};
 let mk=-1,mb=0;function tick(dt){if(!tiles)return;if(cur=='plaza'&&(mk<0||tiles[mk]!=mb)){try{const r=decorate();mk=r.k;mb=r.b}catch(e){console.error('GAL7',e);mk=0;mb=0}}const tx0=Math.floor(P.x/T),ty0=Math.floor((P.y+P.h/2)/T);let near=false;
  for(let y=ty0-3;y<=ty0+3;y++)for(let x=tx0-4;x<=tx0+4;x++){if(x<0||y<0||x>=W||y>=H||tiles[y*W+x]!=69)continue;if(Math.hypot((x+.5)*T-P.x,(y+.5)*T-(P.y+P.h/2))<T*3.2)near=true}
  if(near&&P.hp>0&&P.hp<maxHP()){heal+=dt;if(heal>1){heal=0;P.hp=Math.min(maxHP(),P.hp+Math.max(2,maxHP()*.04));ft(P.x,P.y-30,'Warm','#ffb070')}}
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vx+=Math.sin(s.t*9+s.ph)*30*dt;if(s.t>s.l)sparks.splice(i,1)}
  for(let i=smoke.length-1;i>=0;i--){const s=smoke[i];s.t+=dt;s.x+=s.vx*dt;s.y-=26*dt;s.vx+=Math.sin(s.t*3+s.ph)*14*dt;if(s.t>s.l)smoke.splice(i,1)}}
 function draw(g,cx,cy){if(!tiles)return;const t=performance.now()/1000,vw=cv.width/ZM,vh=cv.height/ZM,x0=Math.max(0,Math.floor(cx/T)),x1=Math.min(W-1,Math.floor((cx+vw)/T)),y0=Math.max(0,Math.floor(cy/T)),y1=Math.min(H-1,Math.floor((cy+vh)/T)),low=document.documentElement.classList.contains('lowfx');
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const b=tiles[y*W+x];if(b<66||b>69)continue;const px=x*T-cx,py=y*T-cy;
   if(b==69){const fl=t*9+x;g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(px+T/2,py+T*.7,2,px+T/2,py+T*.7,T*2.6);gr.addColorStop(0,'rgba(255,160,70,'+(.34+.08*Math.sin(fl*1.7))+')');gr.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gr;g.fillRect(px-T*2.2,py-T*1.9,T*5.4,T*4.6);
    for(let k=0;k<4;k++){const w=T*(.26-k*.04),h=T*(.62-k*.1)*(1+.14*Math.sin(fl*1.3+k*2)),sx=Math.sin(fl*.9+k*1.7)*3,cols=['rgba(255,80,20,.85)','rgba(255,150,30,.85)','rgba(255,215,90,.9)','rgba(255,250,200,.95)'];g.fillStyle=cols[k];g.beginPath();const bx=px+T/2+sx*.5,by=py+T-12;g.moveTo(bx-w,by);g.bezierCurveTo(bx-w*1.1,by-h*.5,bx-w*.2+sx,by-h*.7,bx+sx,by-h);g.bezierCurveTo(bx+w*.3+sx,by-h*.6,bx+w*1.1,by-h*.45,bx+w,by);g.closePath();g.fill()}g.restore();
    if(!low&&Math.random()<dt60()*5)sparks.push({x:px+cx+T/2+(Math.random()-.5)*10,y:py+cy+T-18,vx:(Math.random()-.5)*30,vy:-50-Math.random()*50,t:0,l:.8+Math.random()*.7,ph:Math.random()*6});if(Math.random()<dt60()*1.3)smoke.push({x:px+cx+T/2,y:py+cy+T*.3,vx:0,t:0,l:2+Math.random(),ph:Math.random()*6,r:5+Math.random()*4});continue}
   const q=PAL[b];g.save();g.beginPath();g.rect(px,py,T,T);g.clip();g.globalCompositeOperation='lighter';
   if(b==68){const sx=((t*40+x*17+y*9)%(T*3))-T;const lg=g.createLinearGradient(px+sx-12,py,px+sx+12,py+T);lg.addColorStop(0,'rgba(255,230,150,0)');lg.addColorStop(.5,'rgba(255,232,160,.32)');lg.addColorStop(1,'rgba(255,230,150,0)');g.fillStyle=lg;g.fillRect(px,py,T,T)}
   else{for(let k=0;k<2;k++){const ox=px+T/2+Math.sin(t*.7+hash(x,y,k)*6+k*2)*T*.35,oy=py+T/2+Math.cos(t*.6+hash(x,y,k+5)*6)*T*.35,rg=g.createRadialGradient(ox,oy,1,ox,oy,T*.7);rg.addColorStop(0,q.c+(b==67?'66':'55'));rg.addColorStop(1,q.c+'00');g.fillStyle=rg;g.fillRect(px,py,T,T)}
    if(b==67){g.strokeStyle='rgba(140,255,210,.28)';g.lineWidth=3;g.beginPath();for(let i=0;i<=8;i++){const yy=py+T*.5+Math.sin(t*1.4+i*.8+x*.7)*T*.28;i?g.lineTo(px+i*T/8,yy):g.moveTo(px,yy)}g.stroke()}}
   if(!low)for(let i=0;i<5;i++){const tw=.5+.5*Math.sin(t*(2+hash(x,y,i+9)*3)+hash(x,y,i)*20),sx=px+3+hash(x,y,i+20)*(T-6),sy=py+3+hash(x,y,i+30)*(T-6);g.fillStyle='rgba(255,255,255,'+(.15+.8*tw*tw)+')';const s=1+tw*1.6;g.fillRect(sx-s/2,sy-s/2,s,s);if(tw>.85){g.fillRect(sx-3,sy-.4,6,.8);g.fillRect(sx-.4,sy-3,.8,6)}}
   g.restore()}
  g.save();g.globalCompositeOperation='lighter';for(const s of sparks){const u=1-s.t/s.l;g.fillStyle='rgba(255,'+(150+u*90|0)+',60,'+u+')';g.fillRect(s.x-cx-1.2,s.y-cy-1.2,2.4,2.4)}g.restore();
  for(const s of smoke){const u=s.t/s.l;g.fillStyle='rgba(150,150,160,'+(.22*(1-u))+')';g.beginPath();g.arc(s.x-cx,s.y-cy,s.r*(1+u*1.6),0,6.3);g.fill()}
  if(cur=='plaza')pollen(g,t,vw,vh)}
 let _l=performance.now();const dt60=()=>{const n=performance.now(),d=Math.min(.05,(n-_l)/1000);return d||.016};
 const POL=Array.from({length:16},(_,i)=>({x:hash(i,1,1),y:hash(i,2,2),s:.4+hash(i,3,3),ph:hash(i,4,4)*6}));
 function pollen(g,t,vw,vh){if(document.documentElement.classList.contains('lowfx'))return;g.save();g.globalCompositeOperation='lighter';for(const p of POL){const x=((p.x*vw+t*8*p.s+Math.sin(t*.5+p.ph)*20)%vw+vw)%vw,y=((p.y*vh-t*5*p.s)%vh+vh)%vh,a=.18+.16*Math.sin(t*1.5+p.ph);const gr=g.createRadialGradient(x,y,0,x,y,7);gr.addColorStop(0,'rgba(255,244,200,'+a+')');gr.addColorStop(1,'rgba(255,244,200,0)');g.fillStyle=gr;g.fillRect(x-7,y-7,14,14)}g.restore()}
 {const _g=gen;gen=function(){_g.apply(this,arguments);if(cur!='plaza')return;try{decorate()}catch(e){console.error('GAL7',e)}}}
 function decorate(){if(cur=='plaza')return{k:0,b:tiles[0]};/* the plaza town (PLZ7) has its own decor */const S=22,free=(x,n)=>{for(let y=S-n;y<S;y++)if(tiles[y*W+x])return false;return tiles[S*W+x]&&SOLID6[tiles[S*W+x]]},set=(x,y,b)=>{if(x>0&&x<W-1&&y>=0&&y<H-2){tiles[y*W+x]=b;hp[y*W+x]=BLK[b][2]}},col=(x,n)=>{for(let d=0;d<8;d++)for(const s of[1,-1]){const q=x+d*s;if(q>1&&q<W-2&&free(q,n))return q}return -1};
  const cx=Math.floor(W/2);for(const x of[cx-18,cx+18,cx-34,cx+34]){const q=col(x,5);if(q>0)set(q,S-1,69)}
  const pil=[[cx-8,4,66],[cx+8,4,67],[cx-12,2,68],[cx+12,2,68]].map(([x,h,b])=>[col(x,h+2),h,b]).filter(a=>a[0]>0);for(const [x,h,b] of pil)for(let i=1;i<=h;i++)set(x,S-i,b);return pil.length?{k:(S-1)*W+pil[0][0],b:pil[0][2]}:{k:0,b:0}}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('GAL7',e)}};BOSS6.drawProj=function(g,cx,cy){_d.call(this,g,cx,cy);try{_l=performance.now();draw(g,cx,cy)}catch(e){console.error('GAL7d',e)}}}
 return{paint}})();
