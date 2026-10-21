// ===== V6 VFX manager: one pooled, typed-array particle system (no per-particle allocation) =====
const VFX=(()=>{
 const CAP=3000,X=new Float32Array(CAP),Y=new Float32Array(CAP),VX=new Float32Array(CAP),VY=new Float32Array(CAP),L=new Float32Array(CAP),ML=new Float32Array(CAP),S0=new Float32Array(CAP),S1=new Float32Array(CAP),R=new Float32Array(CAP),VR=new Float32Array(CAP),GR=new Float32Array(CAP),DR=new Float32Array(CAP),A0=new Float32Array(CAP);
 const SP=new Uint16Array(CAP),KD=new Uint8Array(CAP);let n=0;const waves=[];
 const sprites=[],spIdx=new Map();
 // sprite kinds: 0 soft glow, 1 star/spark, 2 crystal shard, 3 ring-dot, 4 feather
 function mk(kind,col){const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');x.translate(24,24);
  if(kind==0){const g2=x.createRadialGradient(0,0,0,0,0,23);g2.addColorStop(0,'#fff');g2.addColorStop(.25,col);g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(-24,-24,48,48)}
  else if(kind==1){const g2=x.createRadialGradient(0,0,0,0,0,10);g2.addColorStop(0,'#fff');g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(-24,-24,48,48);x.fillStyle=col;x.beginPath();x.moveTo(0,-23);x.quadraticCurveTo(2,-2,23,0);x.quadraticCurveTo(2,2,0,23);x.quadraticCurveTo(-2,2,-23,0);x.quadraticCurveTo(-2,-2,0,-23);x.fill();x.fillStyle='#fff';x.beginPath();x.moveTo(0,-9);x.lineTo(2,0);x.lineTo(0,9);x.lineTo(-2,0);x.fill()}
  else if(kind==2){x.fillStyle=col;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(0,-22);x.lineTo(9,-4);x.lineTo(5,20);x.lineTo(-6,20);x.lineTo(-10,-3);x.closePath();x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(0,-22);x.lineTo(9,-4);x.lineTo(0,2);x.closePath();x.fill()}
  else if(kind==3){x.strokeStyle=col;x.lineWidth=3;x.beginPath();x.arc(0,0,18,0,6.3);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(0,0,4,0,6.3);x.fill()}
  else{x.fillStyle=col;x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.5;x.beginPath();x.moveTo(0,-22);x.quadraticCurveTo(12,-6,3,22);x.quadraticCurveTo(-2,10,-3,22);x.quadraticCurveTo(-12,-6,0,-22);x.fill();x.stroke()}
  return c}
 const spr=(k,col)=>{const key=k+col;let i=spIdx.get(key);if(i==null){if(sprites.length>200){sprites.length=0;spIdx.clear()}i=sprites.length;sprites.push(mk(k,col));spIdx.set(key,i)}return i};
 const rnd=(a,b)=>a+Math.random()*(b-a);
 function add(kind,col,x,y,vx,vy,life,s0,s1,o){if(n>=CAP||n>=QM.cur.cap)return;const i=n++;o=o||{};X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;L[i]=ML[i]=life;S0[i]=s0;S1[i]=s1;R[i]=o.r||0;VR[i]=o.vr||0;GR[i]=o.g||0;DR[i]=o.d||0;A0[i]=o.a==null?1:o.a;SP[i]=spr(kind,col);KD[i]=o.add===0?0:1}
 const k=()=>QM.vfxK,N=c=>{const v=c*k();return v<1?(Math.random()<v?1:0):Math.round(v)};
 const api={
  get count(){return n},
  clear(){n=0;waves.length=0},
  add,
  wave(x,y,col,maxR,life,sq){if(waves.length>28)waves.shift();waves.push({x,y,c:col,R:maxR,l:life,ml:life,sq:sq==null?.3:sq})},
  burst(x,y,cols,cnt,sp,kind,life,size){cnt=N(cnt);for(let i=0;i<cnt;i++){const a=Math.random()*6.283,v=rnd(.25,1)*sp,c=cols[i%cols.length];add(kind==null?0:kind,c,x,y,Math.cos(a)*v,Math.sin(a)*v-sp*.2,rnd(.5,1)*(life||.8),size||10,2,{g:240,d:1.5,r:a,vr:rnd(-5,5)})}},
  hit(x,y,col,crit){api.burst(x,y,[col||'#fff','#fff'],crit?16:7,crit?340:220,1,.5,crit?20:12);if(crit){api.wave(x,y,col||'#ffd24a',46,.35,1);api.burst(x,y,['#ffd24a','#fff6c0'],8,260,2,.7,14)}},
  mine(x,y,col){api.burst(x,y,[col,'#fff'],5,150,1,.4,9)},
  land(x,y,pw){const c=N(Math.min(10,3+pw*.01));for(let i=0;i<c;i++){const s=i%2?1:-1;add(0,'#cdbbff',x+s*rnd(2,10),y,s*rnd(30,110),-rnd(5,40),rnd(.3,.55),10,22,{d:2.5,a:.45})}},
  dash(x,y,dir,col){for(let i=0,c=N(6);i<c;i++)add(0,col||'#9fd8ff',x-dir*rnd(0,14),y+rnd(-20,22),-dir*rnd(30,140),rnd(-20,20),rnd(.25,.5),14,4,{d:3,a:.7})},
  step(x,y){if(Math.random()<k()*.5)add(0,'#c9bde6',x,y,rnd(-18,18),-rnd(5,26),rnd(.25,.45),6,15,{d:2,a:.35})},
  levelUp(x,y,col){api.wave(x,y+20,col||'#ffd24a',150,.9,.3);api.wave(x,y+20,'#fff',90,.65,.3);for(let i=0,c=N(46);i<c;i++){const a=Math.random()*6.283,r=rnd(10,60);add(1,i%3?'#fff6c0':col||'#ffd24a',x+Math.cos(a)*r,y+30+Math.sin(a)*r*.4,Math.cos(a)*20,-rnd(90,260),rnd(.8,1.6),rnd(10,20),2,{d:.8,g:-30,r:a,vr:rnd(-4,4)})}},
  ascend(x,y,pal){api.wave(x,y+25,pal[3],260,1.4,.28);api.wave(x,y+25,'#fff',170,1.1,.28);api.wave(x,y,pal[1],110,.8,1);for(let i=0,c=N(90);i<c;i++){const a=Math.random()*6.283;add(i%2?2:1,pal[i%4],x,y+10,Math.cos(a)*rnd(60,340),Math.sin(a)*rnd(60,340)-60,rnd(.9,1.8),rnd(8,20),2,{d:1.2,g:80,r:a,vr:rnd(-6,6)})}},
  shatter(x,y,cols,cnt){for(let i=0,c=N(cnt||14);i<c;i++){const a=rnd(-3.14,0),v=rnd(80,320);add(2,cols[i%cols.length],x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.5,1.1),rnd(8,16),4,{g:520,d:.3,r:a,vr:rnd(-12,12)})}},
  feather(x,y,col,dir){if(Math.random()>k()*.6)return;add(4,col,x,y,-dir*rnd(10,60),rnd(10,60),rnd(.9,1.6),rnd(8,13),rnd(6,10),{g:18,d:1.2,r:rnd(0,6),vr:rnd(-3,3),a:.9})},
  mote(x,y,col){if(Math.random()>k())return;add(1,col,x,y,rnd(-8,8),-rnd(10,40),rnd(.8,1.6),rnd(5,10),1,{g:-8,d:.4,a:.8})},
  update(dt){for(let i=n-1;i>=0;i--){L[i]-=dt;if(L[i]<=0){n--;if(i!=n){X[i]=X[n];Y[i]=Y[n];VX[i]=VX[n];VY[i]=VY[n];L[i]=L[n];ML[i]=ML[n];S0[i]=S0[n];S1[i]=S1[n];R[i]=R[n];VR[i]=VR[n];GR[i]=GR[n];DR[i]=DR[n];A0[i]=A0[n];SP[i]=SP[n];KD[i]=KD[n]}continue}
    const dr=1-Math.min(.95,DR[i]*dt);VX[i]*=dr;VY[i]=VY[i]*dr+GR[i]*dt;X[i]+=VX[i]*dt;Y[i]+=VY[i]*dt;R[i]+=VR[i]*dt}
   for(let i=waves.length-1;i>=0;i--){waves[i].l-=dt;if(waves[i].l<=0)waves.splice(i,1)}},
  draw(g,camx,camy,vw,vh){g.save();g.globalCompositeOperation='lighter';
   for(const w of waves){const t=1-w.l/w.ml,e=1-(1-t)*(1-t),r=w.R*e;g.globalAlpha=Math.max(0,(1-t))*.85;g.strokeStyle=w.c;g.lineWidth=Math.max(1,5*(1-t));g.beginPath();g.ellipse(w.x-camx,w.y-camy,r,r*w.sq,0,0,6.3);g.stroke();g.globalAlpha*=.3;g.lineWidth*=3;g.stroke()}
   for(let i=0;i<n;i++){const x=X[i]-camx,y=Y[i]-camy;if(x<-40||y<-40||x>vw+40||y>vh+40)continue;const t=1-L[i]/ML[i],s=S0[i]+(S1[i]-S0[i])*t,a=A0[i]*(t<.12?t/.12:1)*Math.min(1,L[i]/(ML[i]*.45));if(a<=.01)continue;g.globalAlpha=a;const im=sprites[SP[i]];if(!im)continue;
    if(R[i]){g.save();g.translate(x,y);g.rotate(R[i]);g.drawImage(im,-s/2,-s/2,s,s);g.restore()}else g.drawImage(im,x-s/2,y-s/2,s,s)}
   g.restore()}};
 return api})();
