// ===== VILL9: the newer world generator, for NEWLY made worlds only. Worlds saved by older versions keep the classic terrain forever:
// a save without a generator marker is "classic" (g:1), every world made from now on is stamped g:2 in its edits when it is first
// saved. New worlds keep the surface in the upper part of the map (about 10-27 tiles from the top) but with real variety: rolling
// hills, long plains, small mesas with rocky 2-3 tile cliffs and the lakes from the classic generator. The surface heights are
// precomputed into SHN (legacy sh() reads it), so ores, caves, sky islands, chests and the DEPTH8 bands all follow the new ground.
// Each new world also gets a small village (1-3 cosy houses built from the new blocks, background walls and house doors, a campfire,
// lanterns, fences, flower planters and a gravel path) on flat ground away from the spawn door, plus wild trees (oak, cherry,
// hedge, palm near water). Everything is generated from the world seed, so it is identical on every load and costs nothing per frame
// except the chimney smoke (a handful of sprite puffs, only on screen). =====
const VILL9=(()=>{
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,wsOf=n=>[...n].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%1000/10;
 let GV=0,info=null;const CHIM=[];
 const norm=n=>String(n||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)||'plaza';
 // ---- which generator does this world use? 0 plaza, 1 classic (any save made before the marker existed), 2 new
 function verOf(n,e){if(n=='plaza')return 0;let s=e;if(!s){try{s=JSON.parse(localStorage.getItem('rbw_'+n)||'null')}catch(_){s=null}}
  if(s&&typeof s=='object'){if(s.g===2)return 2;if(s.g===1)return 1;for(const k in s)if(k!='W'&&k!='g')return 1}return 2}
 // ---- terrain: smooth value noise at three scales, damped on plains, plus mesas (cliffs) and a flat landing at the spawn door
 function terrain(w){const R=rr((90001+Math.floor(w*7907))>>>0),h=new Int16Array(W),a=new Float32Array(W);
  const nz=(L,amp)=>{const n=Math.ceil(W/L)+3,v=[];for(let i=0;i<n;i++)v.push(R()*2-1);return x=>{const f=x/L,i=Math.floor(f),t=f-i,u=t*t*(3-2*t);return(v[i]*(1-u)+v[i+1]*u)*amp}};
  const big=nz(52,5.5),mid=nz(17,2.4),fine=nz(7,.8),flat=nz(70,1);
  for(let x=0;x<W;x++){const pf=Math.max(0,Math.min(1,flat(x)*1.4+.35));a[x]=(big(x)+mid(x)*(1-pf*.7)+fine(x)*(1-pf))*(1-pf*.65)}
  const cl=[],nm=1+(R()*2|0);for(let i=0;i<=nm;i++){const wd=9+(R()*9|0),cx=10+Math.floor(R()*(W-20)),d=i<nm?2+(R()*2|0):-(2+(R()*2|0));if(Math.abs(cx-DX)<wd/2+18)continue;for(let x=Math.max(1,cx-(wd>>1));x<=Math.min(W-2,cx+(wd>>1));x++)a[x]+=d;cl.push([cx-(wd>>1),cx+(wd>>1),d])}
  for(let x=0;x<W;x++)h[x]=Math.max(10,Math.min(27,Math.round(18-a[x])));
  const s0=h[DX];for(let x=DX-9;x<=DX+9;x++)h[x]=s0;
  for(let x=DX+10;x<W;x++){const c=Math.max(h[x-1]-1,Math.min(h[x-1]+1,h[x]));if(c==h[x]&&x>DX+16)break;h[x]=c}
  for(let x=DX-10;x>=0;x--){const c=Math.max(h[x+1]-1,Math.min(h[x+1]+1,h[x]));if(c==h[x]&&x<DX-16)break;h[x]=c}
  return{h,cl}}
 // ---- decide + precompute before the world is generated; stamp the marker into the edits afterwards
 {const _lw=loadWorld;loadWorld=function(n,e){const nm=norm(n);try{GV=verOf(nm,e);SHN=GV==2?(info=terrain(wsOf(nm))).h:null;if(GV!=2)info=null}catch(err){console.error('VILL9',err);GV=1;SHN=null;info=null}
   const r=_lw.apply(this,arguments);try{if(cur!='plaza'&&GV&&!edits.g)edits.g=GV}catch(_){}return r}}
 const setT=(x,y,b)=>{if(x>0&&x<W-1&&y>0&&y<H-2){const k=y*W+x;tiles[k]=b;hp[k]=b?BLK[b][2]:0;if(b)wl[k]=0}};
 // ---- rocky faces on cliffs: the exposed side of a 2+ tile step is stone, not dirt
 function cliffs(){for(let x=2;x<W-2;x++){const s=SHN[x];for(const nx of[x-1,x+1]){const d=SHN[nx]-s;if(d<2)continue;for(let y=s+1;y<=s+d;y++){const k=y*W+x;if(tiles[k]==1)setT(x,y,R0()<.25?102:3)}}}}
 let R0=Math.random;
 // ---- flatten a column to surface row ty (grass on top, dirt under it), clearing what was above
 function level(x,ty){const c=SHN[x];for(let y=Math.max(1,ty-13);y<ty;y++){const k=y*W+x;tiles[k]=0;hp[k]=0;wl[k]=0}setT(x,ty,2);
  for(let y=ty+1;y<=ty+12&&y<H-3;y++){const k=y*W+x;if(!tiles[k]||tiles[k]==2||wl[k]||tiles[k]==8)setT(x,y,y<ty+5?1:3);else if(y>Math.max(c,ty)+3)break}SHN[x]=ty}
 // ---- one cosy house: x0 = left wall, w = outer width, ty = ground row; door on the side facing the campfire
 // house blocks are tiles 100-114 (see 70-zz-blocks2.js): 100 clay brick, 101 half-timber, 102 mossy stone brick, 103 wood floor, 104 slate roof,
 // 105 green roof, 106 thatch, 107 framed window, 108 lantern, 109 bookshelf, 110 fence, 111 rug, 113 planter, 114 gravel path
 const STY=[{wall:101,roof:48,bg:3,low:102},{wall:100,roof:104,bg:1,low:100},{wall:46,roof:105,bg:5,low:102},{wall:47,roof:106,bg:6,low:47}];
 function house(x0,w,ty,s,doorRight,R){const S=STY[s],x1=x0+w-1,BW=WALL9.set,K=(x,y)=>y*W+x;
  for(let x=x0-1;x<=x1+1;x++)for(let y=ty-12;y<ty;y++)setT(x,y,0);
  for(let x=x0;x<=x1;x++){setT(x,ty,x==x0||x==x1?102:103);if(!tiles[K(x,ty+1)]||tiles[K(x,ty+1)]==2)setT(x,ty+1,1)}
  for(let y=ty-4;y<=ty-1;y++)for(const x of[x0,x1])setT(x,y,y==ty-1?S.low:S.wall);
  const dx=doorRight?x1:x0,wx=doorRight?x0:x1;setT(dx,ty-1,95);setT(dx,ty-2,96);setT(wx,ty-2,107);setT(wx,ty-3,107);
  for(let x=x0;x<=x1;x++)for(let y=ty-4;y<=ty-1;y++)BW(K(x,y),S.bg);
  const nwin=w>=9?2:1;for(let i=0;i<nwin;i++){const x=x0+Math.round((i+1)*w/(nwin+1));if(x>x0&&x<x1)BW(K(x,ty-3),9)}
  // eaves + a low pitched roof (at most 3 courses above the eaves, flat ridge on wide houses) so the cottages stay cosy, not towering
  for(let x=x0-1;x<=x1+1;x++)setT(x,ty-5,S.roof);
  for(let i=1;i<=3;i++){const a=x0-1+i,b=x1+1-i,y=ty-5-i;if(b-a<2)break;for(let x=a;x<=b;x++)setT(x,y,S.roof)}
  if(s<3&&w>=8){const cx=x1-1,rt=ty-5-(x1+1-cx);setT(cx,rt-1,100);setT(cx,rt-2,100);CHIM.push([cx,rt-2])}
  // inside: a rug, a bookshelf in the far corner with a lantern on it, a planter under the window side
  const far=doorRight?x0+1:x1-1,step=doorRight?1:-1;setT(far,ty-1,109);setT(far,ty-2,109);setT(far,ty-3,108);
  for(let x=far+step*2;x!=dx-step&&x!=dx;x+=step)if(!tiles[K(x,ty-1)])setT(x,ty-1,111);
  return{x0,x1,dx,ty}}
 // ---- the village: site search on flat-ish dry ground away from spawn, then level it and build
 function village(R){const nh=1+(R()<.55?1:0)+(R()<.4?1:0),wd=[];for(let i=0;i<nh;i++)wd.push(7+(R()*3|0));const M=4,FIRE=7,GAP=3,span=M*2+wd.reduce((a,b)=>a+b,0)+FIRE+(nh>2?GAP:0);
  let best=null,bs=1e9;for(let x0=4;x0<W-4-span;x0++){const c=x0+span/2;if(x0<DX+16&&x0+span>DX-16)continue;let lo=99,hi=-99,pen=0;
   // water under the site is filled in when the ground is levelled (just costs a little); a sky island low over it rules the site out
   for(let x=x0-2;x<=x0+span+1;x++){const s=SHN[x];lo=Math.min(lo,s);hi=Math.max(hi,s);for(let y=Math.max(1,s-4);y<=s+3;y++)if(wl[y*W+x]){pen+=6;break}for(let y=Math.max(2,s-14);y<s-1;y++)if(tiles[y*W+x]){pen+=200;break}}
   const d=Math.abs(c-DX);pen+=d<26?40:d>90?(d-90)*.4:0;const sc=(hi-lo)*4+pen+R()*1.5;if(sc<bs){bs=sc;best=x0}}
  if(best==null||bs>=200)return null;const x0=best,hs=[];for(let x=x0;x<x0+span;x++)hs.push(SHN[x]);hs.sort((a,b)=>a-b);const ty=hs[hs.length>>1];
  for(let x=x0-1;x<=x0+span;x++)level(x,ty);
  for(let x=x0-2;x>Math.max(1,x0-14);x--){const c=Math.max(SHN[x+1]-1,Math.min(SHN[x+1]+1,SHN[x]));if(c==SHN[x])break;level(x,c)}
  for(let x=x0+span+1;x<Math.min(W-2,x0+span+14);x++){const c=Math.max(SHN[x-1]-1,Math.min(SHN[x-1]+1,SHN[x]));if(c==SHN[x])break;level(x,c)}
  let x=x0+M;const H9=[],styles=[0,1,2,3].sort(()=>R()-.5);H9.push(house(x,wd[0],ty,styles[0],true,R));x+=wd[0];const f0=x;x+=FIRE;
  for(let i=1;i<nh;i++){H9.push(house(x,wd[i],ty,styles[i],false,R));x+=wd[i]+GAP}
  const fx=f0+(FIRE>>1);for(let xx=x0+1;xx<x0+span-1;xx++){const b=tiles[ty*W+xx];if(b==2)setT(xx,ty,114)}
  setT(fx,ty-1,69);
  // fences + lanterns at both ends, planters by the houses, lanterns by the doors
  for(const[a,dir]of[[x0+1,1],[x0+span-2,-1]]){setT(a,ty-1,110);setT(a+dir,ty-1,110);setT(a-dir,ty-1,108);setT(a+dir*2,ty-1,113);if(R()<.6)setT(a,ty,2);if(R()<.6)setT(a+dir,ty,2)}
  for(const h of H9){const out=h.dx==h.x1?h.dx+1:h.dx-1,lx=h.dx==h.x1?h.dx+2:h.dx-2;if(!tiles[(ty-1)*W+lx]&&lx!=fx)setT(lx,ty-1,108)}
  return{x0,x1:x0+span-1,ty,fx,houses:H9}}
 // ---- wild trees on open grass (never in the village, near the spawn door or on sky islands)
 function wild(R,v){let last=-99,n=0;for(let x=4;x<W-4;x++){if(x-last<5||Math.abs(x-DX)<14||(v&&x>=v.x0-3&&x<=v.x1+3))continue;const s=SHN[x],k=(s-1)*W+x;if(tiles[s*W+x]!=2||tiles[k]||wl[k])continue;
   let ok=true;for(let y=s-7;y<s;y++)if(y>0&&tiles[y*W+x]){ok=false;break}if(!ok||R()>.32)continue;let wet=false;for(let dx=-6;dx<=6&&!wet;dx++){const xx=x+dx;if(xx>0&&xx<W)for(let y=SHN[xx]-1;y<=SHN[xx]+2;y++)if(wl[y*W+xx]){wet=true;break}}
   const r=R(),t=wet&&r<.55?8:r<.58?5:r<.76?50:r<.9?15:5;trees.set(k,{s:t,r:t,p:0,deco:1});last=x;n++}return n}
 {const _gb=genBase;genBase=function(){CHIM.length=0;const r=_gb.apply(this,arguments);if(cur=='plaza'||GV!=2||!SHN)return r;
   try{const R=rr((61001+Math.floor(ws*48611))>>>0);R0=R;cliffs();const v=village(R);const nt=wild(R,v);info=Object.assign(info||{},{v,trees:nt})}catch(e){console.error('VILL9 gen',e)}return r}}
 // ---- chimney smoke (soft grey puffs from a pre-rendered sprite; time based, only for chimneys on screen) + campfire crackle
 let puff=null;const mkPuff=()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g2=x.createRadialGradient(16,16,0,16,16,16);g2.addColorStop(0,'rgba(236,236,240,.9)');g2.addColorStop(.6,'rgba(220,220,228,.45)');g2.addColorStop(1,'rgba(210,210,220,0)');x.fillStyle=g2;x.fillRect(0,0,32,32);return c};
 function drawFx(vw,vh,t){if(!CHIM.length||GV!=2)return;if(!puff)puff=mkPuff();const wind=(typeof WX6!='undefined'?WX6.wind:0)*30+8;for(const[cx,cy]of CHIM){const px=(cx+.5)*T-cam.x,py=cy*T-cam.y;if(px<-120||px>vw+120||py<-200||py>vh+60)continue;
   for(let i=0;i<5;i++){const a=(t*.22+i/5)%1,s=10+a*26;g.globalAlpha=.32*(1-a)*Math.min(1,a*6);g.drawImage(puff,px-s/2+a*wind+Math.sin(t*1.3+i*2)*4,py-a*110-s/2,s,s)}}g.globalAlpha=1}
 let crT=0;function crackle(dt){if(!entered||cur=='plaza')return;crT-=dt;if(crT>0)return;crT=.12+Math.random()*.35;const tx=Math.floor(P.x/T),ty=Math.floor((P.y+P.h/2)/T);let best=1e9;
  for(let y=ty-4;y<=ty+4;y++)for(let x=tx-8;x<=tx+8;x++){if(x<0||y<0||x>=W||y>=H||tiles[y*W+x]!=69)continue;const d=Math.hypot((x+.5)*T-P.x,(y+.5)*T-(P.y+P.h/2));if(d<best)best=d}
  if(best>T*7.5)return;const v=Math.min(1,1.25-best/(T*6));try{noise(.03+Math.random()*.04,1800+Math.random()*2600,.05*v);if(Math.random()<.25)snd(90+Math.random()*60,.06,'triangle',.012*v)}catch(_){}}
 return{get gv(){return GV},get info(){return info},verOf,terrain,drawFx,crackle,chimneys:CHIM}})();
