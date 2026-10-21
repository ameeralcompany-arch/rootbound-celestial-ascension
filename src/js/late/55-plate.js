// ===== V6 nameplates: data-driven tiers (every 15 levels), cached sprites per (tier,name,level) =====
const Plate=(()=>{
 const cache=new Map();let order=[];const DPR=2;
 function frame(x,w,h,st,t){ // draws the ornate frame into a (w,h) box
  const {k,a,b,g:gl}=st;x.save();x.lineJoin='round';
  const rr2=(X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()};
  const px=14,bx=px,by=10,bw=w-px*2,bh=h-20;
  const panel=(c1,c2)=>{const gr=x.createLinearGradient(0,by,0,by+bh);gr.addColorStop(0,c1);gr.addColorStop(1,c2);x.fillStyle=gr};
  if(k=='plain'){panel('#1b2236','#0c101c');rr2(bx,by,bw,bh,bh/2);x.fill();x.strokeStyle=a;x.lineWidth=1.4;x.stroke();x.strokeStyle='rgba(255,255,255,.12)';x.beginPath();x.moveTo(bx+8,by+2);x.lineTo(bx+bw-8,by+2);x.stroke()}
  else if(k=='scroll'){panel('#2e2016','#150d09');rr2(bx,by,bw,bh,6);x.fill();x.strokeStyle=a;x.lineWidth=1.8;x.stroke();x.strokeStyle=gl;x.globalAlpha=.5;x.lineWidth=.8;rr2(bx+3,by+3,bw-6,bh-6,4);x.stroke();x.globalAlpha=1;
   x.strokeStyle=a;x.lineWidth=1.8;for(const s of[-1,1]){const X=s<0?bx:bx+bw;x.beginPath();x.moveTo(X,by+bh/2);x.bezierCurveTo(X+s*-10,by-8,X+s*-22,by+2,X+s*-14,by+8);x.stroke();x.beginPath();x.arc(X+s*-12,by+9,2.4,0,6.3);x.fillStyle=gl;x.fill()}}
  else if(k=='crystal'){panel('#18305c','#0a1328');x.beginPath();x.moveTo(bx+8,by);x.lineTo(bx+bw-8,by);x.lineTo(bx+bw,by+bh/2);x.lineTo(bx+bw-8,by+bh);x.lineTo(bx+8,by+bh);x.lineTo(bx,by+bh/2);x.closePath();x.fill();x.strokeStyle=a;x.lineWidth=1.6;x.stroke();
   x.fillStyle=gl;for(const s of[-1,1]){const X=s<0?bx:bx+bw;x.beginPath();x.moveTo(X,by+bh/2-9);x.lineTo(X+s*-13,by+bh/2);x.lineTo(X,by+bh/2+9);x.lineTo(X+s*4,by+bh/2);x.closePath();x.globalAlpha=.85;x.fill()}x.globalAlpha=1;x.fillStyle='rgba(255,255,255,.15)';x.beginPath();x.moveTo(bx+10,by+1);x.lineTo(bx+bw*.45,by+1);x.lineTo(bx+bw*.35,by+bh*.45);x.lineTo(bx+4,by+bh*.45);x.fill()}
  else if(k=='rose'){panel('#4a0f1c','#1a0509');rr2(bx,by,bw,bh,5);x.fill();x.strokeStyle=a;x.lineWidth=1.8;x.stroke();x.strokeStyle='rgba(217,180,106,.5)';x.lineWidth=.8;rr2(bx+3,by+3,bw-6,bh-6,3);x.stroke();
   for(const s of[-1,1]){const X=s<0?bx-1:bx+bw+1,Y=by+bh/2;x.fillStyle='#c1263a';x.strokeStyle='#ffb0b8';x.lineWidth=1;x.beginPath();x.arc(X,Y,7,0,6.3);x.fill();x.stroke();x.beginPath();x.arc(X+.5,Y,4,.3,5.2);x.stroke();x.beginPath();x.arc(X,Y,1.6,0,6.3);x.stroke();x.fillStyle=a;for(const d of[-1,1]){x.beginPath();x.moveTo(X+s*-6,Y+d*2);x.quadraticCurveTo(X+s*-16,Y+d*10,X+s*-12,Y+d*13);x.quadraticCurveTo(X+s*-14,Y+d*6,X+s*-6,Y+d*2);x.fill()}}
   x.fillStyle=a;x.beginPath();x.moveTo(w/2,by-6);x.lineTo(w/2+6,by);x.lineTo(w/2,by+3);x.lineTo(w/2-6,by);x.closePath();x.fill()}
  else if(k=='wing'){panel('#2b2210','#110c04');rr2(bx,by,bw,bh,bh/2);x.fill();x.shadowColor=gl;x.shadowBlur=8;x.strokeStyle=a;x.lineWidth=1.8;x.stroke();x.shadowBlur=0;
   x.fillStyle=a;for(const s of[-1,1]){const X=s<0?bx+2:bx+bw-2;for(let i=0;i<4;i++){x.beginPath();x.moveTo(X,by+bh/2);x.quadraticCurveTo(X+s*(-6-i*5),by+bh/2-5-i*3.4,X+s*(-12-i*6.5),by+bh/2-4-i*4);x.quadraticCurveTo(X+s*(-8-i*5),by+bh/2,X,by+bh/2);x.globalAlpha=.9-i*.12;x.fill()}}x.globalAlpha=1;
   x.beginPath();x.arc(w/2,by-1,4,0,6.3);x.fillStyle=gl;x.fill()}
  else if(k=='thorn'){x.shadowColor=gl;x.shadowBlur=10;x.fillStyle='#07040c';x.strokeStyle=a;x.lineWidth=1.2;
   // jagged thorn spikes (reference: black thorned frame)
   const sp=(X,Y,ang,L,wd)=>{x.save();x.translate(X,Y);x.rotate(ang);x.beginPath();x.moveTo(-wd,0);x.quadraticCurveTo(-wd*.3,-L*.5,L*.15,-L);x.quadraticCurveTo(wd*.7,-L*.45,wd,0);x.closePath();x.fill();x.stroke();x.restore()};
   const n=Math.max(5,Math.floor(bw/14));for(let i=0;i<n;i++){const X=bx+6+i*(bw-12)/(n-1),L=7+((i*37)%5)*2;sp(X,by+2,(i%2?-.25:.25)+(X-w/2)/w*.8,L,3);sp(X,by+bh-2,Math.PI+(i%2?.25:-.25)-(X-w/2)/w*.8,L-2,2.6)}
   for(const s of[-1,1]){const X=s<0?bx:bx+bw;sp(X,by+bh/2,s*1.57+ (s<0?-.2:.2)+0,16,3.4);sp(X,by+bh/2-4,s*1.2,12,2.6);sp(X,by+bh/2+4,s*1.9,12,2.6)}
   x.shadowBlur=0;panel('#0e0816','#050309');rr2(bx,by,bw,bh,3);x.fill();x.strokeStyle=a;x.lineWidth=1.4;x.stroke()}
  else{ // cosmic
   const gr=x.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#1a0a44');gr.addColorStop(.5,'#3b1078');gr.addColorStop(1,'#0a2a5a');x.fillStyle=gr;rr2(bx,by,bw,bh,bh/2);x.fill();x.strokeStyle=a;x.shadowColor=gl;x.shadowBlur=10;x.lineWidth=1.8;x.stroke();x.shadowBlur=0;
   x.fillStyle='#fff';for(let i=0;i<26;i++){x.globalAlpha=.3+((i*53)%10)/16;x.fillRect(bx+8+((i*37)%Math.max(8,bw-16)),by+3+((i*19)%Math.max(4,bh-6)),1.4,1.4)}x.globalAlpha=1;
   x.strokeStyle=gl;x.globalAlpha=.7;x.lineWidth=1;x.beginPath();x.ellipse(w/2,by+bh/2,bw/2+9,bh/2+5,0,0,6.3);x.stroke();x.globalAlpha=1;
   for(const s of[-1,1]){x.fillStyle=gl;x.beginPath();x.moveTo(s<0?bx-8:bx+bw+8,by+bh/2-7);x.lineTo(s<0?bx-1:bx+bw+1,by+bh/2);x.lineTo(s<0?bx-8:bx+bw+8,by+bh/2+7);x.lineTo(s<0?bx-4:bx+bw+4,by+bh/2);x.fill()}}
  x.restore()}
 function make(tier,name,lv){const st=NP_STYLE(tier),mc=document.createElement('canvas').getContext('2d');mc.font='700 13px sans-serif';const nm=String(name).slice(0,14),lab='Lv '+lv,ttl=npName(tier).toUpperCase();mc.font='700 13px sans-serif';const w1=mc.measureText(lab+'  '+nm).width;mc.font='600 8.5px sans-serif';const w2=mc.measureText(ttl).width+ttl.length*1.2;
  const w=Math.ceil(Math.max(w1,w2)+60),h=44,c=document.createElement('canvas');c.width=w*DPR;c.height=h*DPR;const x=c.getContext('2d');x.scale(DPR,DPR);
  // title ribbon above (slightly lifted), main plate below
  x.save();x.translate(0,4);frame(x,w,h-4,st);x.restore();
  x.textAlign='center';x.textBaseline='middle';x.font='600 8.5px sans-serif';if('letterSpacing'in x)x.letterSpacing='1.2px';x.fillStyle=st.g;x.shadowColor=st.g;x.shadowBlur=4;x.fillText(ttl,w/2,9);x.shadowBlur=0;if('letterSpacing'in x)x.letterSpacing='0px';
  x.font='700 13px sans-serif';const lw=x.measureText(lab).width,nw=x.measureText(nm).width,tot=lw+10+nw,x0=w/2-tot/2;x.textAlign='left';
  x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.85)';x.fillStyle=st.g;x.strokeText(lab,x0,h/2+5);x.fillText(lab,x0,h/2+5);x.fillStyle='#fff';x.strokeText(nm,x0+lw+10,h/2+5);x.fillText(nm,x0+lw+10,h/2+5);
  return{c,w,h}}
 function get(tier,name,lv){const k=tier+'|'+name+'|'+lv;let p=cache.get(k);if(!p){p=make(tier,name,lv);cache.set(k,p);order.push(k);if(order.length>80)cache.delete(order.shift())}return p}
 return{get,draw(g,cx,cy,tier,name,lv){const p=get(tier,name,lv);g.drawImage(p.c,cx-p.w/2,cy-p.h/2,p.w,p.h)},make}})();
