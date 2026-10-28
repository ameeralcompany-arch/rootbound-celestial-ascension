// ===== MINE7: a bigger, deeper world. New ores (ids 71-76) in depth bands, a deepslate layer (77), floating sky islands,
// and Tackle Boxes (70) on lake shores that give fishing bait when punched. Also migrates worlds saved at the old 100-wide size. =====
const MINE7=(()=>{
 const OLDW=100;
 const D={
  70:{n:'Tackle Box',c:'#4aa8e8',h:99,p:0},
  71:{n:'Copper Ore',c:'#e08a4a',h:7,p:18,g:[2,4],xp:8,dep:3,ch:.012,v:[3,6]},
  72:{n:'Iron Ore',c:'#d8c0a8',h:9,p:30,g:[3,6],xp:12,dep:12,ch:.011,v:[3,6]},
  73:{n:'Ruby Ore',c:'#ff3a5a',h:11,p:80,g:[8,14],xp:24,dep:30,ch:.005,v:[2,4],glow:[255,60,90]},
  74:{n:'Sapphire Ore',c:'#3a7aff',h:11,p:80,g:[8,14],xp:24,dep:38,ch:.005,v:[2,4],glow:[70,120,255]},
  75:{n:'Emerald Ore',c:'#2ee07a',h:12,p:95,g:[10,18],xp:30,dep:48,ch:.004,v:[2,4],glow:[50,230,120]},
  76:{n:'Diamond Ore',c:'#bff6ff',h:14,p:160,g:[18,30],xp:45,dep:62,ch:.0025,v:[1,3],glow:[190,245,255]},
  77:{n:'Deepslate',c:'#3e4250',h:10,p:6}};
 const ORES=[71,72,73,74,75,76];
 for(const id in D){const d=D[id];BLK[id]=[d.n,d.c,d.h];PRICE[id]=d.p;LVREQ[id]=0;SOLID6[id]=1;if(d.glow)GLOW7[id]=d.glow}
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 // ---- sprites
 function ore(x,R,c,base){x.fillStyle=base||'#6e737d';x.fillRect(0,0,T,T);for(let i=0;i<34;i++){x.fillStyle='rgba(25,27,35,'+(.15+R()*.3)+')';x.fillRect(R()*T,R()*T,2+R()*3,2+R()*3)}
  for(let i=0;i<6;i++){const cx=7+R()*34,cy=7+R()*34,r=3+R()*4;const g=x.createRadialGradient(cx-1,cy-1,.5,cx,cy,r+2);g.addColorStop(0,'#fff');g.addColorStop(.45,c);g.addColorStop(1,'rgba(0,0,0,.2)');x.fillStyle=g;x.beginPath();
   for(let j=0;j<6;j++){const a=j*1.047+R()*.4,rr2=r*(.75+R()*.4);x.lineTo(cx+Math.cos(a)*rr2,cy+Math.sin(a)*rr2)}x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1;x.stroke()}}
 const PT={
  70(x,R,c){x.fillStyle='#2b6d9c';x.fillRect(0,0,T,T);x.fillStyle='#8fd0ff';x.fillRect(0,0,T,4);
   // body
   const g=x.createLinearGradient(0,12,0,44);g.addColorStop(0,'#6cc4ff');g.addColorStop(1,'#2f86c8');x.fillStyle=g;x.beginPath();x.roundRect?x.roundRect(5,14,38,30,6):x.rect(5,14,38,30);x.fill();x.strokeStyle='#123a5a';x.lineWidth=2;x.stroke();
   x.fillStyle='#ffd34a';x.fillRect(5,24,38,4);x.strokeRect(5,24,38,4);x.fillStyle='#ffe9a0';x.fillRect(20,22,8,8);x.strokeRect(20,22,8,8);
   x.strokeStyle='#123a5a';x.lineWidth=3;x.beginPath();x.arc(24,14,7,Math.PI,0);x.stroke();
   // fish sticker
   x.fillStyle='#ff8a5a';x.beginPath();x.ellipse(17,36,6,3.5,0,0,6.3);x.fill();x.beginPath();x.moveTo(11,36);x.lineTo(7,33);x.lineTo(7,39);x.closePath();x.fill();x.fillStyle='#fff';x.beginPath();x.arc(20,35,1.2,0,6.3);x.fill();
   x.fillStyle='#fff';x.beginPath();x.arc(33,36,2,0,6.3);x.arc(37,33,1.3,0,6.3);x.fill()},
  77(x,R,c){x.fillStyle=c;x.fillRect(0,0,T,T);for(let y=0;y<T;y+=8){x.fillStyle='rgba(0,0,0,'+(.12+R()*.1)+')';x.fillRect(0,y,T,2)}for(let i=0;i<26;i++){x.fillStyle='rgba(255,255,255,'+(R()*.06)+')';x.fillRect(R()*T,R()*T,3,2)}}};
 for(const id of ORES)PT[id]=(x,R,c)=>ore(x,R,c,id>=74?'#4a4e5c':'#6e737d');
 {const _bs=blockSprite;blockSprite=function(b,v){if(PT[b]){const c=document.createElement('canvas');c.width=c.height=T;PT[b](c.getContext('2d'),rr(b*733+v*97+11),D[b].c);try{if(!GLOW7[b])NB7.bevel(c,b)}catch(_){}return c}return _bs(b,v)}}
 // ---- generation (seeded by the world, so every player sees the same world)
 {const _gb=genBase;genBase=function(){_gb.apply(this,arguments);if(cur=='plaza')return;const R=rr((7331+Math.floor(ws*15485863))>>>0);
   const ok=(x,y)=>x>0&&x<W-1&&y>0&&y<H-2,set=(x,y,b)=>{if(ok(x,y)){tiles[y*W+x]=b;hp[y*W+x]=BLK[b][2]}};
   // deepslate below ~45 tiles, with a ragged top edge
   for(let x=1;x<W-1;x++){const s=sh(x),top=s+44+Math.round(Math.sin(x*.21+ws)*2+Math.sin(x*.07)*2);for(let y=top;y<H-2;y++){const k=y*W+x;if(tiles[k]==3){tiles[k]=77;hp[k]=BLK[77][2]}}}
   // ore veins: a short random walk through stone/deepslate
   for(let x=2;x<W-2;x++){const s=sh(x);for(let y=s+4;y<H-3;y++){const t=tiles[y*W+x];if(t!=3&&t!=77)continue;const dep=y-s,r=R();let acc=0,id=0;
     for(const o of ORES){const d=D[o];if(dep<d.dep)continue;acc+=d.ch;if(r<acc){id=o;break}}
     if(!id)continue;const d=D[id],n=d.v[0]+Math.floor(R()*(d.v[1]-d.v[0]+1));let vx=x,vy=y;for(let i=0;i<n;i++){const tt=tiles[vy*W+vx];if(tt==3||tt==77)set(vx,vy,id);const q=R();if(q<.3)vx++;else if(q<.55)vx--;else if(q<.8)vy++;else vy--;if(!ok(vx,vy))break}}}
   // tackle boxes on lake shores: first dry tile next to the water surface
   let lastBox=-99;for(let x=3;x<W-3;x++){if(x-lastBox<14)continue;const s=sh(x);let wy=-1;for(let y=Math.max(1,s-2);y<s+8&&y<H-2;y++)if(wl[y*W+x]>0&&!tiles[y*W+x]){wy=y;break}
    if(wy<0)continue;for(const dx of[-2,-3,2,3,-4,4]){const bx=x+dx;let y=Math.max(1,wy-4);while(y<H-3&&!tiles[(y+1)*W+bx])y++;const k=y*W+bx;if(!tiles[k]&&!wl[k]&&tiles[(y+1)*W+bx]&&tiles[(y+1)*W+bx]!=70){set(bx,y,70);lastBox=x;break}}}
   // floating sky islands with a little loot on top
   const nI=Math.max(2,Math.round(W/42));for(let i=0;i<nI;i++){const cx=6+Math.floor(R()*(W-12)),s=sh(cx),cy=Math.max(3,s-7-Math.floor(R()*5)),rw=3+Math.floor(R()*4),rh=2+Math.floor(R()*2);
    if(Math.abs(cx-DX)<8)continue;
    for(let x=cx-rw;x<=cx+rw;x++){const u=(x-cx)/rw,depth=Math.max(1,Math.round(rh*(1-u*u)+R()*.8));for(let y=cy;y<cy+depth;y++)if(ok(x,y)&&!tiles[y*W+x])set(x,y,y==cy?2:1)}
    const r=R();if(r<.4)set(cx,cy-1,64);else if(r<.65)set(cx,cy-1,63);else if(r<.85)set(cx,cy-1,70)}}}
 // ---- punching: tackle boxes give bait (they never break); ores give bonus gems and xp
 const boxCd=new Map();const BAITS=[[250,.68],[251,.27],[252,.05]];
 {const _ba=breakAt;breakAt=function(x,y,dmg){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0;
   if(b==70){const now=performance.now(),px=x*T+T/2,py=y*T+T/2,left=((boxCd.get(cur+':'+k)||0)-now)/1000;hitAt.set(k,now);pop.set(k,now-60);
    if(left>0){if(R0()<.5)try{ft(px,py-14,'Restocking... '+Math.ceil(left)+'s','#bfe6ff')}catch(_){}try{SFX7.tone(330,300,.08,'sine',.03)}catch(_){}return true}
    boxCd.set(cur+':'+k,now+6000);let r=Math.random(),id=250;for(const[i,c]of BAITS){if(r<c){id=i;break}r-=c}const n=id==250?1+(Math.random()*3|0):1;spawnDrop(px,py-10,id,n);
    try{ft(px,py-18,'+'+n+' '+MAT[id].n,'#9fe6ff')}catch(_){}burst(px,py,'#8fd0ff',10,160,4);burst(px,py,'#ffe9a0',5,110,3,'p');try{SFX7.tone(520,880,.12,'sine',.04);SFX7.tone(880,1320,.14,'sine',.03,.08)}catch(_){}return true}
   const r=_ba.apply(this,arguments);
   try{const d=D[b];if(r&&d&&d.g&&inb&&!tiles[k]){const px=x*T+T/2,py=y*T+T/2,n=d.g[0]+Math.round(Math.random()*(d.g[1]-d.g[0]));spawnDrop(px,py,'gem',n);xpGain('mine',d.xp);ft(px,py-12,'+'+n+' gems','#8ff3ff');burst(px,py,d.c,14,200,5);burst(px,py,'#fff',6,120,3,'p');try{UIS.play('buy')}catch(_){}}}catch(_){}
   return r}}
 const R0=Math.random;
 // ---- world saves made when the world was 100 tiles wide: move every tile key to its new index (x,y stay the same)
 const remap=k=>{k=+k;return Math.floor(k/OLDW)*W+(k%OLDW)};
 function migrate(e){if(!e||typeof e!='object'||e.W===W)return e;const o={W};for(const k in e){if(k=='m'){o.m=e.m;continue}if(k=='o'){const oo={};if(e.o&&typeof e.o=='object')for(const kk in e.o){const n=+kk;if(Number.isInteger(n))oo[remap(n)]=e.o[kk]}o.o=oo;continue}if(k=='W')continue;const n=+k;if(Number.isInteger(n)&&n>=0&&n<OLDW*64)o[remap(n)]=e[k]}return o}
 {const _lw=loadWorld;loadWorld=function(n,e){try{if(!e&&OLDW!==W){const nm=String(n||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)||'plaza';if(nm!='plaza'){const raw=localStorage.getItem('rbw_'+nm);if(raw){const j=JSON.parse(raw);if(j&&typeof j=='object'&&j.W!==W)localStorage.setItem('rbw_'+nm,JSON.stringify(migrate(j)))}}}}catch(err){console.error('MINE7 migrate',err)}
   const r=_lw.apply(this,arguments);try{edits.W=W}catch(_){}return r}}
 return{D,ORES,migrate}})();
