// ===== PLZ7 v3 "Rootbound Town": the Plaza hub as a wide, open town at mid-world height (replaces the Blossom Garden plaza).
// Ground row S=64 of 128 (legacy sh() returns it in the Plaza): solid foundation below, open air above, nothing to get stuck on.
// The full 256-tile width is used, west to east:
//   Moonlit Pond (pier + fishing, x1-17) | MOONLIT QUARTER: Ren's Hideout (Ninja), Lantern Crypt (Hollow, Reaper)
//   | ARTISAN LANE: Hana's Lodge (Archer) + field, Stormwind Bakery (Tobi, Stormcaller), Astral Tower (Seren, Mage), Mira's Trading Post (Gunslinger)
//   | GATE SQUARE (x114-142): town map, World Gate (the world door, DX), Sky Beam dais up to the Sky Run
//   | MARKET ROW: Rootwood Lodge (Oak, Druid, quests), Bram's Longhouse (Berserker, smith) | WARRIORS' ROW: Lionheart Keep (Kael, Knight),
//   Moon Teahouse (Lulu, Samurai), Iron Fist Dojo (Pip, Brawler) | ARCANE END: Prism Shrine (Lumi, Elementalist), Ember Manor (Vesper, Demon).
// The Sky Run course floats high above (rows 40 -> 13, at least 25 rows over every roof). Houses are HOUSE7 facades drawn behind
// everyone and never solid; only the street, the pier and the sky platforms are blocks (painted through the TILE7 chunk cache).
// The plaza is never saved, but a layout version (localStorage 'rbplz') drops any stale plaza data (old rbw_plaza edits/objects) once.
const PLZ7=(()=>{
 const S=64,LV=3,{floor,ceil,max,min,sin,cos,abs,round,PI}=Math;
 // ---- houses: NPC id, class (CLASS7 key), x0 + width + height in tiles
 const HS=[['ren','ninja',21,11,10],['hollow','reaper',36,12,14],['hana','archer',52,12,11],['tobi','stormcaller',70,12,16],['seren','mage',86,11,16],['mira','gunslinger',101,13,11],
  ['oak','druid',145,12,11],['bram','berserker',161,13,11],['kael','knight',178,13,13],['lulu','samurai',195,12,14],['pip','brawler',211,11,11],['lumi','elementalist',225,12,14],['vesper','demon',241,13,15]]
  .map(([npc,c,x0,w,h])=>({npc,c,x0,w,h}));
 const NAMES={ren:"Ren's Hideout",hollow:'Lantern Crypt',hana:"Hana's Lodge",tobi:'Stormwind Bakery',seren:'Astral Tower',mira:"Mira's Trading Post",oak:'Rootwood Lodge',bram:"Bram's Longhouse",kael:'Lionheart Keep',lulu:'Moon Teahouse',pip:'Iron Fist Dojo',lumi:'Prism Shrine',vesper:'Ember Manor'};
 const PLINTH={ninja:54,reaper:54,archer:42,stormcaller:55,mage:56,gunslinger:45,druid:57,berserker:55,knight:11,samurai:55,brawler:45,elementalist:12,demon:54};
 const POND={x0:1,x1:13,open:9,pier0:10,pier1:17,d:4},SQ={x0:114,x1:142},GATE={x0:122,w:13,h:12},BOARD={x0:116,w:3,h:4},DAIS={x0:136,w:6,h:6},BEAM={x0:138,x1:139};
 const LAMPS=[19,34,50,69,84,99,114,143,159,176,193,209,223,239],SIGN={34:'MOONLIT QUARTER',69:'ARTISAN LANE',114:'GATE SQUARE',143:'MARKET ROW',176:"WARRIORS' ROW",223:'ARCANE END'};
 // ---- Sky Run course: START above the Sky Beam, then [gap, rise, width] steps east, FINISH = the Sky Shrine island
 const COURSE=(()=>{const c=[{x0:140,w:6,row:40,k:'start'}];/* START sits just east of the beam column, so the ride rises beside it and steps on */for(const[gap,dy,w]of[[2,-1,2],[2,-2,2],[2,0,1],[2,-2,2],[2,-1,2],[2,0,1],[2,-2,2],[2,-2,3],[2,0,1],[2,-2,2],[2,-1,2],[2,-2,2],[2,0,1],[2,-2,2],[2,-2,3],[2,-1,2],[2,-2,1],[2,-1,2],[2,-2,2]]){const p=c[c.length-1];c.push({x0:p.x0+p.w+gap,w,row:p.row+dy})}
  const p=c[c.length-1];c.push({x0:p.x0+p.w+2,w:8,row:p.row-2,k:'finish'});return c})();
 const FIN=COURSE[COURSE.length-1],RET={x0:FIN.x0+FIN.w-3,x1:FIN.x0+FIN.w-2,row:FIN.row};
 // ---- drawable pieces (world px boxes); id is the HOUSE7 cache key
 const IT=[];{const add=(id,cls,x0,w,h,yb,extra)=>IT.push(Object.assign({id,cls,x0:x0*T,y0:(yb-h)*T,W:w*T,H:h*T,x1:(x0+w)*T,y1:yb*T},extra||{}));
  for(const h of HS)add('h:'+h.npc,h.c,h.x0,h.w,h.h,S,{npc:h.npc});
  add('gate','gate',GATE.x0,GATE.w,GATE.h,S);add('board','board',BOARD.x0,BOARD.w,BOARD.h,S);add('dais','dais',DAIS.x0,DAIS.w,DAIS.h,S);
  add('pond','pond',POND.pier0-1,9,10,S+5);add('skystart','skystart',COURSE[0].x0,COURSE[0].w,3,COURSE[0].row);add('shrine','shrine',FIN.x0,FIN.w,5,FIN.row)}
 const house=id=>HS.find(h=>h.npc==id)||null;
 // ---- terrain
 function set(x,y,b){if(x<0||x>=W||y<0||y>=H)return;const k=y*W+x;tiles[k]=b;hp[k]=b?BLK[b][2]:0;wl[k]=0}
 function build(){tiles.fill(0);hp.fill(0);wl.fill(0);trees.clear();pop.clear();hitAt.clear();
  const pl=new Uint8Array(W);for(const h of HS)for(let x=h.x0;x<h.x0+h.w;x++)pl[x]=PLINTH[h.c];
  for(let x=0;x<W;x++){const top=pl[x]||(x>=GATE.x0&&x<GATE.x0+GATE.w?12:x>=SQ.x0&&x<=SQ.x1?44:42),found=pl[x]||(x>=SQ.x0&&x<=SQ.x1)?55:43;
   for(let y=0;y<H;y++){let b=0;if(x==0||x==W-1)b=y>=S?4:57;else if(y>=H-2)b=4;else if(y==S)b=top;else if(y==S+1)b=found;else if(y>S+1&&y<S+6)b=43;else if(y>=S+6)b=3;if(b)set(x,y,b)}}
  // Moonlit Pond: open water west of the pier, the pier deck at street level (no step to climb), river-stone basin
  for(let x=POND.x0;x<=POND.x1;x++){for(let y=S;y<=S+POND.d;y++){set(x,y,0);if(y>S)wl[y*W+x]=8}set(x,S+POND.d+1,55)}
  for(let y=S+1;y<=S+POND.d+1;y++)set(POND.x1+1,y,55);
  for(let x=POND.pier0;x<=POND.pier1;x++)set(x,S,47);
  // Sky Run platforms
  for(const p of COURSE){const top=p.k=='start'?44:p.k=='finish'?58:p.w==1?52:p.w>=3?58:56;for(let x=p.x0;x<p.x0+p.w;x++){set(x,p.row,top);if(p.k)set(x,p.row+1,46)}/* path platforms are one block thick, resting on a cloud */}}
 // ---- sprites: street lamp (+ optional district sign), cloud bed under sky platforms
 const SP={};
 function lampSpr(k,sign){const key='l'+k+(sign||'');if(SP[key])return SP[key];const w=150,h=170,c=document.createElement('canvas');c.width=ceil(w*k);c.height=ceil(h*k);const x=c.getContext('2d');x.scale(k,k);x.lineJoin=x.lineCap='round';const OL='#1e1430',cx=75,B=h;
  const ln=(a,lw,col)=>{x.beginPath();x.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)x.lineTo(a[i],a[i+1]);x.strokeStyle=OL;x.lineWidth=lw+2.4;x.stroke();x.strokeStyle=col;x.lineWidth=lw;x.stroke()};
  x.fillStyle='rgba(10,10,30,.22)';x.beginPath();x.ellipse(cx,B-3,18,4,0,0,6.3);x.fill();
  x.fillStyle='#3a3448';x.beginPath();x.roundRect(cx-9,B-14,18,14,3);x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke();ln([cx,B-12,cx,B-128],4,'#4a4458');ln([cx,B-126,cx+20,B-134],2.4,'#4a4458');
  x.fillStyle='#ffe08a';x.beginPath();x.moveTo(cx-11,B-152);x.lineTo(cx+11,B-152);x.lineTo(cx+8,B-130);x.lineTo(cx-8,B-130);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke();x.fillStyle='#3a3448';x.beginPath();x.moveTo(cx-15,B-152);x.lineTo(cx,B-164);x.lineTo(cx+15,B-152);x.closePath();x.fill();x.stroke();x.fillRect(cx-9,B-131,18,4);
  if(sign){x.font='800 11px '+FONT;const tw=x.measureText(sign).width+20;x.fillStyle='#6a4528';x.beginPath();x.roundRect(cx-tw/2,B-104,tw,24,5);x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke();x.fillStyle='#fff3c4';x.textAlign='center';x.textBaseline='middle';x.fillText(sign,cx,B-91.5);for(const s of[-1,1]){x.fillStyle='#3a2a20';x.fillRect(cx+s*tw/2-s*8-1.5,B-112,3,9)}}
  return SP[key]=c}
 function cloudSpr(k){const key='c'+k;if(SP[key])return SP[key];const w=256,h=80,c=document.createElement('canvas');c.width=ceil(w*k);c.height=ceil(h*k);const x=c.getContext('2d');x.scale(k,k);let s=91;const R=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
  const blobs=[];for(let i=0;i<14;i++)blobs.push([20+R()*216,30+R()*22,16+R()*16]);x.fillStyle='rgba(200,214,240,.9)';for(const[a,b,r]of blobs){x.beginPath();x.arc(a,b+6,r,0,6.3);x.fill()}x.fillStyle='rgba(255,255,255,.96)';for(const[a,b,r]of blobs){x.beginPath();x.arc(a,b,r,0,6.3);x.fill()}return SP[key]=c}
 // ---- world-space background pass: runs inside TILE7.draw (before the block chunks), so it sits behind blocks, NPCs and players
 let warmT=0;
 function back(now){const t=now/1000,vw=cv.width/ZM,vh=cv.height/ZM,L=cam.x-300,Rr=cam.x+vw+300,Tp=cam.y-300,Bt=cam.y+vh+300,m=g.getTransform(),k=HOUSE7.bucket(Math.hypot(m.a,m.b)),nt=typeof night=='number'?night:0;HOUSE7.frame();
  const cs=cloudSpr(k);for(const p of COURSE){const x0=p.x0*T-44,y0=(p.row+(p.k?2:1))*T-30;if(x0>Rr||x0+p.w*T+88<L||y0>Bt||y0+80<Tp)continue;g.drawImage(cs,x0-cam.x,y0-cam.y,p.w*T+88,p.k?84:66)}
  for(const it of IT){if(it.x1<L||it.x0>Rr||it.y1<Tp||it.y0>Bt)continue;HOUSE7.draw(g,it,k,it.x0-cam.x,it.y0-cam.y,t,nt)}
  const ly=S*T-170;if(ly<Bt&&ly+170>Tp){const gs=HOUSE7.glowSpr('rgba(255,224,138,.9)');for(const lx of LAMPS){const px=lx*T+T/2;if(px<L||px>Rr)continue;g.drawImage(lampSpr(k,SIGN[lx]),px-75-cam.x,ly-cam.y,150,170);const hx=px-cam.x,hy=S*T-141-cam.y;if(nt>.25){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=min(1,(nt-.25)*2);g.drawImage(gs,hx-46,hy-46,92,92);g.restore();lampL.push(hx,hy)}}}
  // warm the facade cache in the background (one piece per few frames) so walking into a new district never paints in a burst
  if((warmT+=1)%3==0)HOUSE7.warm(IT,k)}
 {const _td=TILE7.draw;TILE7.draw=function(){if(cur=='plaza'&&!creatorOn)try{back(performance.now())}catch(e){if(!back.e){back.e=1;console.error('PLZ7',e)}}return _td.apply(this,arguments)}}
 // ---- parallax backdrop (mountains, distant pagoda) behind the town; cached at reduced resolution, repainted only when the view changed
 const lerp=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u),col=c=>'rgb('+c.map(Math.round)+')';
 function ridge(g,w,base,par,amp,fq,seed,c0,c1){const off=cam.x*par;g.beginPath();g.moveTo(0,base+400);for(let x=0;x<=w;x+=8){const u=(x+off)*fq+seed;g.lineTo(x,base-amp*(.55+.28*sin(u)+.17*sin(u*2.3+1.7)+.1*sin(u*5.1)))}g.lineTo(w,base+400);g.closePath();const gr=g.createLinearGradient(0,base-amp,0,base+20);gr.addColorStop(0,col(c0));gr.addColorStop(1,col(c1));g.fillStyle=gr;g.fill()}
 function backdrop(w,hh,g){const base=(S*T-cam.y)*ZM+6,dk=typeof night=='number'?night:0,wx=Math.min(1,wxC||0);if(base<-50||base>hh+500)return;
  const dim=c=>lerp(lerp(c,[200,205,215],wx*.5),[c[0]*.22,c[1]*.25,c[2]*.5],dk*.88),haze=dim([205,225,245]);g.save();
  {const px=w*.62-cam.x*.04,top=base-330,r=420,gr=g.createLinearGradient(0,top,0,base);gr.addColorStop(0,col(dim([180,196,226])));gr.addColorStop(1,col(dim([140,160,205])));g.fillStyle=gr;g.beginPath();g.moveTo(px-r,base+10);g.bezierCurveTo(px-r*.45,base-90,px-60,top+40,px-24,top);g.lineTo(px+24,top);g.bezierCurveTo(px+60,top+40,px+r*.45,base-90,px+r,base+10);g.closePath();g.fill();
   g.fillStyle=col(dim([245,248,255]));g.beginPath();g.moveTo(px-24,top);g.lineTo(px+24,top);g.bezierCurveTo(px+46,top+26,px+70,top+58,px+96,top+84);for(let k=0;k<6;k++)g.lineTo(px+80-k*28,top+70+(k%2?22:-4));g.lineTo(px-96,top+84);g.bezierCurveTo(px-70,top+58,px-46,top+26,px-24,top);g.fill()}
  ridge(g,w,base-10,.07,150,.004,1.3,dim([150,170,214]),haze);ridge(g,w,base,.14,120,.006,4.1,dim([118,150,190]),haze);
  {const px=w*.28-cam.x*.2,b=base-84,c=dim([92,112,150]);g.fillStyle=col(c);for(let i=0;i<4;i++){const ww=70-i*13,yy=b-i*30;g.beginPath();g.moveTo(px-ww/2-14,yy);g.quadraticCurveTo(px,yy-18,px+ww/2+14,yy);g.lineTo(px+ww/2,yy+6);g.lineTo(px-ww/2,yy+6);g.closePath();g.fill();g.fillRect(px-ww/2+8,yy+6,ww-16,24)}g.fillRect(px-2,b-128,4,22);if(dk>.35){g.fillStyle='rgba(255,210,120,'+(dk-.3)+')';for(let i=0;i<4;i++)g.fillRect(px-4,b-i*30+10,8,10)}}
  ridge(g,w,base+4,.26,95,.009,7.7,dim([84,128,128]),dim([150,190,170]));ridge(g,w,base+10,.45,60,.014,2.2,dim([62,112,84]),dim([96,150,100]));
  const hz=g.createLinearGradient(0,base-120,0,base+10);hz.addColorStop(0,'rgba(255,255,255,0)');hz.addColorStop(1,col(haze).replace('rgb','rgba').replace(')',',.55)'));g.fillStyle=hz;g.fillRect(0,base-120,w,130);g.restore()}
 const bc=document.createElement('canvas'),bcx=bc.getContext('2d');const bk={x:-1e9,y:-1e9,n:-1,wx:-1};
 function backdropCached(G,w,hh){if(cur!='plaza')return;const q=QM.cur.id,lo=q=='potato'||q=='low',kk=lo?.5:.7,cw=max(2,round(w*kk)),ch=max(2,round(hh*kk)),wx=Math.min(1,wxC||0),base=(S*T-cam.y)*ZM+6;if(base<-50||base>hh+500)return;
  const moved=abs(cam.x-bk.x)>(lo?6:3)||abs(cam.y-bk.y)>3,sky=abs(night-bk.n)>.006||abs(wx-bk.wx)>.02;
  if(bc.width!=cw||bc.height!=ch||moved||sky){if(bc.width!=cw||bc.height!=ch){bc.width=cw;bc.height=ch}bcx.setTransform(1,0,0,1,0,0);bcx.clearRect(0,0,cw,ch);bcx.scale(cw/w,ch/hh);backdrop(w,hh,bcx);bk.x=cam.x;bk.y=cam.y;bk.n=night;bk.wx=wx}
  const y0=max(0,floor(base-470)),y1=min(hh,Math.ceil(base+24));if(y1>y0)G.drawImage(bc,0,y0*ch/hh,cw,(y1-y0)*ch/hh,0,y0,w,y1-y0)}
 {const _ds=drawSky;drawSky=function(w,hh,now){_ds(w,hh,now);try{backdropCached(g,w,hh)}catch(e){}}}
 {const _g=gen;gen=function(){_g.apply(this,arguments);if(cur=='plaza'){try{build()}catch(e){console.error('PLZ7',e)}}}}
 // ---- one-time migration of stale plaza data: the plaza is a shared hub rebuilt from code; player worlds/inventory/progress are untouched
 function migrate(){let v=0;try{v=+(localStorage.getItem('rbplz')||0)}catch(_){}if(v>=LV)return false;try{localStorage.removeItem('rbw_plaza')}catch(_){}try{localStorage.setItem('rbplz',String(LV))}catch(_){}return true}
 migrate();
 // camera look-ahead: in the town the view sits ~3.5 tiles higher so rooftops and the sky show instead of the foundation
 {const _u=update;update=function(dt){_u.apply(this,arguments);window.CAMUP=cur=='plaza'&&!creatorOn?Math.min(170,Math.round(cv.height/ZM*.16)):0}}
 if(cur=='plaza'){try{gen()}catch(e){console.error(e)}}
 // Lumi naps on the glowing altar crystal inside her Prism Shrine (low enough to chat with from the street)
 function perch(id){if(id!='lumi')return null;const h=house('lumi');return{x:(h.x0+h.w/2)*T,y:S*T-150}}
 return{S,LV,HS,NAMES,IT,COURSE,FIN,RET,BEAM,DAIS,GATE,POND,SQ,LAMPS,house,build,perch,migrate,surface:()=>S}})();
