// ===== REALM10: the realms after the Inferno, in WORD9's chain (<World> → Inferno → Galaxy → Abyssal Sea → Crystal Realm). Each one is the
// same terrain as its world (same seed), remade in its own theme, with three regions of its own, a sky, an ambience, physics, four monsters
// far stronger than the realm before, and its own music (MUS7 asks REALM10.mood()). Its hidden word is longer each time (WORD9).
//   Galaxy  ('-gal', level 25, 4 letters): Stardust over Galaxy blocks, Nebula Rock, Star Crystals, Comet Ore; low gravity (big moon jumps).
//           Regions: Nebula Fields (aurora patches, crystal spires) · Meteor Craters · Asteroid Belt (floating rock islands with ore).
//           Monsters: Starling Wisp (star bolts), Void Stalker (blinks to you), Comet Ram (charges), Nebula Titan (orbiting rocks, slams).
//   Abyssal Sea ('-sea', level 35, 5 letters): a world under the ocean. You can breathe and swim anywhere; Seabed Silt, Reef Rock,
//           Abyss Stone, Glow Anemones, Tidal Ore. Regions: Coral Reef · Kelp Forest (swaying kelp) · Abyssal Trench (a deep glowing rift).
//           Monsters (they all swim): Abyss Jelly (shock pulse), Angler Fiend (lure orbs), Razor Shark (lunges), Kraken Spawn (ink spray).
//   Crystal Realm ('-cry', level 45, 8 letters): Quartz Sand, Prism Stone, Radiant Crystal, Aurora Ore, under an aurora sky.
//           Regions: Amethyst Fields · Prism Peaks (tall crystal spikes) · Frozen Glimmer (packed ice, crystal icicles in the caves).
//           Monsters: Prism Sprite (shard volleys), Crystal Spider (leaps), Prism Golem (slam + shard ring), Geode Wyrm (dives).
// Tile ids 228,229,232-239,253,254 (free in BLK and MAT); monster drops are materials 294-305. Art is cached (blocks, skies, glows); per frame
// at most ~11 realm monsters, <=24 bolts, <=48 motes and the visible kelp are drawn. Nothing per frame is O(world). =====
const REALM10=(()=>{
 const R=Math.random,TAU=Math.PI*2,rn=(a,b)=>a+R()*(b-a);
 const h32=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const creative=()=>{try{return !!(typeof RB_CREATIVE!='undefined'&&RB_CREATIVE)||!!CRV8.on}catch(_){return false}};
 const LETTER=18;
 // the current realm stage (2 Galaxy, 3 Abyssal Sea, 4 Crystal Realm; 1 is WORD9's Inferno), cached per world
 let SCW=null,SG=0;const sg=()=>{if(cur!==SCW){SCW=cur;try{SG=WORD9.stageOf(cur)}catch(_){SG=0}}return SG};
 const realm=()=>sg()>=2;
 // ---- blocks: [name, colour, kind, stage]
 const TL={228:['Stardust','#7a68c0','soil',2],229:['Nebula Rock','#3a2f66','rock',2],232:['Star Crystal','#ffe9a8','glow',2],233:['Comet Ore','#8ad8ff','ore',2],
  234:['Seabed Silt','#4f8f92','soil',3],235:['Abyss Stone','#1f3550','rock',3],236:['Glow Anemone','#ff7ad0','glow',3],237:['Tidal Ore','#5affe0','ore',3],
  238:['Quartz Sand','#a894d8','soil',4],239:['Prism Stone','#6a5a8e','rock',4],253:['Radiant Crystal','#7af0ff','glow',4],254:['Aurora Ore','#ff9ae8','ore',4]};
 const SHARD={233:['Comet Shard',60],237:['Tidal Pearl',85],254:['Aurora Gem',120]};
 const hexRGB=h=>{h=String(h).replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
 {const SOFT=(BLK[1]||[0,0,3])[2],HARD=(BLK[3]||[0,0,6])[2];
  for(const id in TL){const n=+id,[nm,c,k,s]=TL[n],m=1+.25*(s-2);BLK[n]=[nm,c,k=='soil'?SOFT:k=='rock'?Math.round(HARD*m):k=='ore'?Math.round(HARD*1.7*m):Math.round(HARD*1.2*m)];
   try{PRICE[n]=k=='ore'?SHARD[n][1]:k=='glow'?12:k=='rock'?5:3;LVREQ[n]=0;SOLID6[n]=1}catch(_){}
   try{TOOLS8.CAT[n]=k=='rock'?'stone':k=='soil'?'soft':'ore'}catch(_){}
   if(k=='ore'||k=='glow')try{GLOW7[n]=hexRGB(c)}catch(_){}
   if(k=='ore')MAT[n]={n:SHARD[n][0],c,p:SHARD[n][1]}}}
 // block art (cached by the game per variant): every block its own look
 function paint(b,v){const c=cvs(T,T),x=c.getContext('2d'),Rb=rr(b*7919+v*131+17),col=TL[b][1];
  const lin=(a,z)=>{const gr=x.createLinearGradient(0,0,T,T);gr.addColorStop(0,a);gr.addColorStop(1,z);x.fillStyle=gr;x.fillRect(0,0,T,T)};
  const dots=(n,cs,s0,s1)=>{for(let i=0;i<n;i++){x.fillStyle=cs[(Rb()*cs.length)|0];const s=s0+Rb()*(s1-s0);x.fillRect(Rb()*T,Rb()*T,s,s)}};
  const glowDot=(cx,cy,r,cc)=>{const gr=x.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,cc);gr.addColorStop(1,cc.replace(/[\d.]+\)$/,'0)'));x.fillStyle=gr;x.fillRect(cx-r,cy-r,r*2,r*2)};
  const facet=(pts,cc)=>{x.fillStyle=cc;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill()};
  const crystal=(cx,by,w,h,a,b2,edge)=>{facet([[cx,by-h],[cx+w,by-h*.62],[cx+w*.7,by],[cx,by]],a);facet([[cx,by-h],[cx-w,by-h*.62],[cx-w*.7,by],[cx,by]],b2);x.strokeStyle=edge;x.lineWidth=1.2;x.beginPath();x.moveTo(cx,by-h);x.lineTo(cx,by);x.stroke()};
  if(b==228){lin('#8a78d0','#4a3c8a');dots(40,['rgba(255,255,255,.55)','rgba(200,180,255,.35)','rgba(30,10,60,.25)'],1,2.4);x.fillStyle='rgba(220,200,255,.45)';x.fillRect(0,0,T,5);x.fillStyle='rgba(255,255,255,.6)';x.fillRect(0,0,T,1.5);for(let i=0;i<3;i++){x.fillStyle='#fff';const px=Rb()*T,py=8+Rb()*(T-12);x.fillRect(px-1,py,3,1);x.fillRect(px,py-1,1,3)}}
  else if(b==229){lin('#4a3c80','#1c1640');for(let i=0;i<3;i++)glowDot(Rb()*T,Rb()*T,10+Rb()*12,['rgba(255,110,200,.35)','rgba(90,220,230,.3)','rgba(160,120,255,.35)'][i]);dots(18,['rgba(255,255,255,.8)','rgba(255,255,255,.4)'],1,1.6);x.strokeStyle='rgba(10,5,30,.45)';x.lineWidth=1.5;for(let i=0;i<2;i++){x.beginPath();let px=Rb()*T,py=Rb()*T;x.moveTo(px,py);for(let k=0;k<3;k++){px+=(Rb()-.5)*18;py+=(Rb()-.5)*18;x.lineTo(px,py)}x.stroke()}}
  else if(b==232){lin('#2a2050','#140e2c');glowDot(T/2,T*.6,T*.5,'rgba(255,220,120,.45)');crystal(T*.32,T-4,7,T*.5,'#fff3c4','#e8c46a','rgba(255,255,255,.7)');crystal(T*.62,T-3,9,T*.78,'#fffbe6','#f2d27a','rgba(255,255,255,.8)');crystal(T*.84,T-5,5,T*.36,'#ffeeb0','#d8b05a','rgba(255,255,255,.6)');x.fillStyle='#fff';x.fillRect(T*.6,T*.2,2,2)}
  else if(b==233){lin('#3e3270','#1a1438');dots(14,['rgba(255,255,255,.7)'],1,1.4);for(let i=0;i<3;i++){const cx=8+Rb()*(T-16),cy=8+Rb()*(T-16);glowDot(cx,cy,9,'rgba(140,220,255,.6)');facet([[cx-5,cy+2],[cx-1,cy-5],[cx+5,cy-2],[cx+3,cy+5]],'#bdf0ff');facet([[cx-1,cy-5],[cx+5,cy-2],[cx+1,cy]],'#ffffff')}x.strokeStyle='rgba(140,220,255,.5)';x.lineWidth=1;x.beginPath();x.moveTo(2,T-6);x.lineTo(T-10,6);x.stroke()}
  else if(b==234){lin('#5aa0a2','#2c5e66');dots(34,['rgba(255,255,255,.18)','rgba(0,30,40,.22)'],1,3);x.strokeStyle='rgba(220,255,250,.18)';x.lineWidth=1.2;for(let i=0;i<3;i++){const py=10+i*13+Rb()*4;x.beginPath();x.moveTo(0,py);x.quadraticCurveTo(T/2,py-4,T,py);x.stroke()}for(let i=0;i<2;i++){const px=6+Rb()*(T-12),py=8+Rb()*(T-14);x.fillStyle='#fff0e6';x.beginPath();x.arc(px,py,3,Math.PI,0);x.fill();x.strokeStyle='rgba(150,100,90,.6)';x.stroke()}x.fillStyle='rgba(190,240,230,.3)';x.fillRect(0,0,T,4)}
  else if(b==235){lin('#28466a','#0e1a2c');dots(16,['rgba(0,0,0,.3)'],2,4);for(let i=0;i<5;i++){const px=Rb()*T,py=Rb()*T;glowDot(px,py,4,'rgba(90,255,230,.55)')}for(let i=0;i<2;i++){const px=6+Rb()*(T-12),py=6+Rb()*(T-12);x.fillStyle='rgba(200,210,220,.35)';x.beginPath();x.arc(px,py,3.5,0,TAU);x.fill();x.fillStyle='rgba(20,30,40,.6)';x.beginPath();x.arc(px,py,1.3,0,TAU);x.fill()}}
  else if(b==236){lin('#3a2a52','#1c1230');x.lineCap='round';for(let i=0;i<4;i++){const bx=7+i*11+Rb()*3,h=T*.45+Rb()*T*.3;x.strokeStyle='#ff6ac0';x.lineWidth=4;x.beginPath();x.moveTo(bx,T);x.quadraticCurveTo(bx+(Rb()-.5)*12,T-h*.5,bx+(Rb()-.5)*8,T-h);x.stroke();glowDot(bx,T-h,7,'rgba(255,170,230,.8)');x.fillStyle='#ffe0f4';x.beginPath();x.arc(bx,T-h,2.5,0,TAU);x.fill()}}
  else if(b==237){lin('#22405e','#0c1828');dots(10,['rgba(90,255,230,.45)'],1,2);for(let i=0;i<3;i++){const cx=9+Rb()*(T-18),cy=9+Rb()*(T-18),r=4+Rb()*2.5;glowDot(cx,cy,r*2.4,'rgba(120,255,235,.5)');const gr=x.createRadialGradient(cx-r*.4,cy-r*.4,1,cx,cy,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,'#c8fff4');gr.addColorStop(1,'#4ad8c8');x.fillStyle=gr;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill()}}
  else if(b==238){lin('#b8a4e6','#6a589e');dots(46,['rgba(255,255,255,.75)','rgba(60,40,110,.3)','rgba(255,170,235,.55)','rgba(140,240,255,.55)'],1,2.2);for(let i=0;i<2;i++){const px=6+Rb()*(T-12),py=8+Rb()*(T-14);x.fillStyle='rgba(230,250,255,.85)';x.beginPath();x.moveTo(px,py-4);x.lineTo(px+2.5,py);x.lineTo(px,py+4);x.lineTo(px-2.5,py);x.closePath();x.fill()}x.fillStyle='rgba(240,230,255,.55)';x.fillRect(0,0,T,4)}
  else if(b==239){lin('#7a6aa2','#3a2e5e');for(let i=0;i<4;i++){const ax=Rb()*T,ay=Rb()*T;facet([[ax,ay],[ax+10+Rb()*10,ay+Rb()*8],[ax+Rb()*8,ay+10+Rb()*10]],Rb()<.5?'rgba(255,255,255,.12)':'rgba(20,10,40,.2)')}x.strokeStyle='rgba(220,200,255,.25)';x.lineWidth=1;for(let i=0;i<3;i++){x.beginPath();x.moveTo(Rb()*T,0);x.lineTo(Rb()*T,T);x.stroke()}dots(6,['rgba(255,190,240,.7)','rgba(150,240,255,.7)'],1,2)}
  else if(b==253){lin('#1c2a4a','#0e1428');glowDot(T/2,T*.55,T*.55,'rgba(120,240,255,.45)');crystal(T*.28,T-2,7,T*.62,'#c8faff','#5ad8f0','rgba(255,255,255,.7)');crystal(T*.56,T-1,10,T*.92,'#e8fdff','#7ae8ff','rgba(255,255,255,.85)');crystal(T*.82,T-3,6,T*.48,'#bff6ff','#4ac0e0','rgba(255,255,255,.6)');x.fillStyle='rgba(255,255,255,.9)';x.fillRect(T*.54,T*.18,2,6)}
  else if(b==254){lin('#6a5a92','#2e2450');for(let i=0;i<3;i++){const cx=9+Rb()*(T-18),cy=9+Rb()*(T-18),cc=i%2?'#9affd8':'#ff9ae8';glowDot(cx,cy,10,i%2?'rgba(150,255,210,.5)':'rgba(255,150,230,.5)');facet([[cx,cy-6],[cx+5,cy],[cx,cy+6],[cx-5,cy]],cc);facet([[cx,cy-6],[cx+5,cy],[cx,cy]],'rgba(255,255,255,.7)')}}
  x.strokeStyle='rgba(0,0,0,.42)';x.lineWidth=2.5;x.strokeRect(1.25,1.25,T-2.5,T-2.5);x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=1.5;x.beginPath();x.moveTo(3.5,T-5);x.lineTo(3.5,3.5);x.lineTo(T-5,3.5);x.stroke();return c}
 {const _bs=blockSprite;blockSprite=function(b,v){if(TL[b])return paint(b,v);return _bs.apply(this,arguments)}}
 // item keys 200+ are materials, so a realm block (its tile id is 228+) can't be an item itself: like the biome blocks it breaks into a
 // buildable block (the ores drop their shard, which is a material). Without this, a dropped Stardust had no material art and the frame
 // that drew it threw, leaving the screen black.
 const DROPR={228:66,229:67,232:9,234:8,235:77,236:59,238:68,239:12,253:9};
 {const _sd=spawnDrop;spawnDrop=function(x,y,it,n){if(typeof it=='number'&&DROPR[it]!=null)it=DROPR[it];return _sd.call(this,x,y,it,n)}}
 // items picked up before the fix: turn them into their blocks (bag and hotbar)
 function fixInv(){try{for(const k in DROPR){const q=inv[k]|0;if(q>0){inv[DROPR[k]]=(inv[DROPR[k]]|0)+q;delete inv[k]}if(inv[k]===0)delete inv[k];for(let i=0;i<bar.length;i++)if(bar[i]==+k)bar[i]=DROPR[k]}}catch(_){}}
 fixInv();
 // a material without art never takes the frame down: a known block draws as its block, anything else draws nothing
 {const _mi=matIcon;matIcon=function(x,k,S){if(typeof k=='number'&&k>=200&&!MAT[k]){try{if(BLK[k])x.drawImage(blockSprite(k,0),S*.12,S*.1,S*.76,S*.76)}catch(_){}return}return _mi.apply(this,arguments)}}
 // ---- regions: each realm's world is split in three, in an order from the world's name
 const RG={2:[['nebula','Nebula Fields'],['craters','Meteor Craters'],['belt','Asteroid Belt']],3:[['reef','Coral Reef'],['kelp','Kelp Forest'],['trench','Abyssal Trench']],4:[['amethyst','Amethyst Fields'],['peaks','Prism Peaks'],['glimmer','Frozen Glimmer']]};
 const order=(n,s)=>{const r=rr((h32(n)^0x2e61)>>>0),a=RG[s].slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 let REG=null,KELP=[];
 const regionAt=x=>REG?REG[Math.max(0,Math.min(2,Math.floor(x/(W/3))))]:null;
 // ---- terrain (WORD9's gen calls this after the letters are placed, before saved edits apply)
 const MAPS={2:{2:228,1:66,42:228,43:66,3:229,77:229,8:68,9:232,15:0,113:0},3:{2:234,1:222,42:234,43:222,3:235,77:235,8:234,9:236,15:0,113:0},4:{2:238,1:238,42:238,43:238,3:239,77:239,8:238,9:253,15:0,113:0}};
 const ORE={2:233,3:237,4:254},ROCK={2:229,3:235,4:239},GLOW={2:232,3:236,4:253},SOIL={2:228,3:234,4:238};
 function shape(s){if(!RG[s])return;const Rg=rr((h32(cur)^(0x7a11+s*977))>>>0),ri=(a,b)=>a+Math.floor(Rg()*Math.max(1,b-a));trees.clear();REG=order(cur,s);KELP=[];
  const nat=b=>b==1||b==2||b==3||b==8||b==42||b==43||b==77;
  const top=x=>{for(let y=2;y<H-2;y++){const b=tiles[y*W+x];if(b&&SOLID6[b])return y}return H-2};
  const safe=x=>x>3&&x<W-4&&Math.abs(x-DX)>7;
  const free=k=>!tiles[k]&&!wl[k];
  const put=(k,b)=>{if(tiles[k]==LETTER||tiles[k]==4)return;tiles[k]=b;hp[k]=BLK[b][2];wl[k]=0};
  const dig=k=>{if(tiles[k]==LETTER||tiles[k]==4||!nat(tiles[k]))return;tiles[k]=0;hp[k]=0};
  for(let ri0=0;ri0<3;ri0++){const id=REG[ri0][0],x0=Math.floor(ri0*W/3)+2,x1=Math.floor((ri0+1)*W/3)-2;
   if(id=='nebula'){for(let x=x0;x<x1;x++){if(!safe(x))continue;const y=top(x);if(!nat(tiles[y*W+x]))continue;for(let d=0;d<3;d++)if(Rg()<.22&&nat(tiles[(y+d)*W+x]))put((y+d)*W+x,67);if(Rg()<.11){const h=ri(2,5);for(let j=1;j<=h;j++){const k=(y-j)*W+x;if(y-j<2||!free(k))break;put(k,232)}}}}
   else if(id=='craters'){const n=ri(3,5);for(let i=0;i<n;i++){const cx=ri(x0+6,x1-6);if(!safe(cx))continue;const r=ri(4,8),y0=top(cx);for(let dx=-r;dx<=r;dx++){const x=cx+dx,d=Math.floor(Math.sqrt(r*r-dx*dx)*.62);for(let y=y0-4;y<=y0+d;y++)if(y>2&&y<H-6)dig(y*W+x);const by=y0+d+1;if(by<H-5&&tiles[by*W+x]&&tiles[by*W+x]!=LETTER){put(by*W+x,Rg()<.35?232:229);if(Rg()<.3&&free((by-1)*W+x))put((by-1)*W+x,232)}}}}
   else if(id=='belt'){const n=ri(6,10);for(let i=0;i<n;i++){const cx=ri(x0+4,x1-4),cy=top(cx)-ri(7,15);if(cy<5)continue;const rx=ri(3,7),ry=ri(2,4);for(let dy=-ry;dy<=ry;dy++)for(let dx=-rx;dx<=rx;dx++){if((dx*dx)/(rx*rx)+(dy*dy)/(ry*ry)>1+Rg()*.25)continue;const k=(cy+dy)*W+cx+dx;if(!free(k))continue;put(k,dy==-ry||(dy<0&&!tiles[k-W]&&Rg()<.6)?228:Rg()<.14?233:229)}}}
   else if(id=='reef'){for(let x=x0;x<x1;x++){if(!safe(x))continue;const y=top(x);if(!nat(tiles[y*W+x]))continue;const r=Rg();if(r<.26){const h=ri(1,3);for(let j=1;j<=h;j++){const k=(y-j)*W+x;if(!free(k))break;put(k,j==h&&Rg()<.5?236:223)}}else if(r<.4){const k=(y-1)*W+x;if(free(k))put(k,236)}}}
   else if(id=='kelp'){for(let x=x0;x<x1;x++){if(!safe(x)||Rg()>.5)continue;const y=top(x);if(!nat(tiles[y*W+x]))continue;KELP.push({x,y,h:ri(3,9),ph:Rg()*TAU,c:Rg()<.5?0:1})}}
   else if(id=='trench'){const cx=ri(x0+10,x1-10);if(safe(cx)){const y0=top(cx),D=ri(18,26);for(let d=-3;d<=D;d++){const hw=Math.max(1,Math.round(6*(1-Math.max(0,d)/(D+3)))),y=y0+d;if(y>=H-6)break;for(let x=cx-hw;x<=cx+hw;x++)dig(y*W+x)}
     for(let d=0;d<=D+1;d++){const y=y0+d;if(y>=H-5)break;for(let x=cx-9;x<=cx+9;x++){const k=y*W+x;if(tiles[k]&&tiles[k]!=LETTER&&(!tiles[k-1]||!tiles[k+1]||!tiles[k-W]))put(k,Rg()<.18?237:Rg()<.12&&d>D*.5?236:235)}}}}
   else if(id=='amethyst'){for(let x=x0;x<x1;x++){if(!safe(x))continue;const y=top(x);if(!nat(tiles[y*W+x]))continue;if(Rg()<.2){const h=ri(1,4);for(let j=1;j<=h;j++){const k=(y-j)*W+x;if(!free(k))break;put(k,220)}}}}
   else if(id=='peaks'){const n=ri(4,8);for(let i=0;i<n;i++){const cx=ri(x0+4,x1-4);if(!safe(cx))continue;const y0=top(cx),hh=ri(6,12),w=ri(2,4);for(let j=0;j<hh;j++){const hw=Math.round(w*(1-j/hh));for(let x=cx-hw;x<=cx+hw;x++){const k=(y0-1-j)*W+x;if(y0-1-j<3)break;if(free(k))put(k,253)}}}}
   else if(id=='glimmer'){for(let x=x0;x<x1;x++){const y=top(x);if(nat(tiles[y*W+x])&&safe(x))put(y*W+x,214);for(let yy=y+6;yy<H-6;yy++){const k=yy*W+x;if(tiles[k-W]&&nat(tiles[k-W])&&free(k)&&Rg()<.12){const h=ri(1,4);for(let j=0;j<h;j++){const q=k+j*W;if(!free(q))break;put(q,253)}}}}}}
  // theme pass: natural blocks take the realm's blocks; its ore runs through the rock below the surface layers
  const M=MAPS[s],ore=ORE[s],rock=ROCK[s];for(let k=0;k<W*H;k++){const b=tiles[k];if(!b||b==LETTER)continue;const m=M[b];if(m===undefined)continue;let n=m;if(n==rock&&k>W*14&&Rg()<.022)n=ore;tiles[k]=n;hp[k]=n?BLK[n][2]:0}deep(s)}
 const DB={};   // underground biomes now come from BIOME17 (99-zzzzzzzzz-m-realmbiomes.js), one per letter of the realm's word
 const ROCKY=new Set([3,77,78,99,19,229,235,239,66,222,213,219]);
 const bandOf=d=>d<10?-1:d<38?0:1;
 function deep(s){const B=DB[s];if(!B)return;const Rg=rr((h32(cur)^(0x3d11+s*131))>>>0),ri=(a,b)=>a+Math.floor(Rg()*Math.max(1,b-a));
  const put=(k,b)=>{if(tiles[k]==LETTER||tiles[k]==4)return;tiles[k]=b;hp[k]=b?BLK[b][2]:0;if(b)wl[k]=0};
  // the band rock and its ore veins
  for(let x=1;x<W-1;x++){const y0=sh(x);for(let y=y0+10;y<H-3;y++){const k=y*W+x,b0=tiles[k];if(!b0||!ROCKY.has(b0))continue;const bd=B[bandOf(y-y0)];put(k,Rg()<bd.op?bd.ore:bd.rock)}}
  // caverns lined with the accent block (some flooded), then crystal geodes
  for(let bi=0;bi<2;bi++){const bd=B[bi];for(let i=0;i<9;i++){const cx=ri(4,W-4),y0=sh(cx),cy=y0+(bi?ri(42,Math.max(43,H-y0-8)):ri(14,34)),rx=ri(3,8),ry=ri(2,4);if(cy>=H-5)continue;
    for(let dy=-ry-1;dy<=ry+1;dy++)for(let dx=-rx-1;dx<=rx+1;dx++){const x=cx+dx,y=cy+dy;if(x<2||x>=W-2||y<sh(x)+9||y>=H-4)continue;const k=y*W+x,e=(dx*dx)/(rx*rx)+(dy*dy)/(ry*ry);
     if(e<=1){if(tiles[k]==LETTER||tiles[k]==4)continue;tiles[k]=0;hp[k]=0;wl[k]=bd.liq&&dy>=ry*.34?8:0}else if(e<=1.7&&tiles[k]&&Rg()<.6)put(k,bd.acc)}}
   for(let i=0;i<7;i++){const cx=ri(4,W-4),y0=sh(cx),cy=y0+(bi?ri(42,Math.max(43,H-y0-7)):ri(13,35)),r=ri(2,4);if(cy>=H-5)continue;
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=cx+dx,y=cy+dy;if(x<2||x>=W-2||y<sh(x)+9||y>=H-4)continue;const k=y*W+x,d=Math.hypot(dx,dy);if(d>r+.4)continue;if(d>r-.8)put(k,bd.acc);else if(Rg()<.55)put(k,bd.core);else{if(tiles[k]!=LETTER&&tiles[k]!=4){tiles[k]=0;hp[k]=0}}}}}}
 // ---- skies (cached canvases + parallax)
 const SKY={};
 function mkSky(s){const S0=cvs(640,360),x=S0.getContext('2d'),r=rr(4242+s*7),grd=(stops)=>{const gr=x.createLinearGradient(0,0,0,360);stops.forEach(q=>gr.addColorStop(q[0],q[1]));x.fillStyle=gr;x.fillRect(0,0,640,360)};
  const blob=(cx,cy,rad,c)=>{const gr=x.createRadialGradient(cx,cy,0,cx,cy,rad);gr.addColorStop(0,c);gr.addColorStop(1,c.replace(/[\d.]+\)$/,'0)'));x.fillStyle=gr;x.fillRect(cx-rad,cy-rad,rad*2,rad*2)};
  const L1=cvs(1280,240),L2=cvs(1280,240),a=L1.getContext('2d'),b=L2.getContext('2d');
  if(s==2){grd([[0,'#04020e'],[.5,'#140a34'],[1,'#2a1452']]);for(let i=0;i<10;i++)blob(r()*640,r()*300,60+r()*120,['rgba(255,90,200,.22)','rgba(80,200,230,.18)','rgba(150,100,255,.24)'][i%3]);
   for(let i=0;i<260;i++){x.fillStyle='rgba(255,255,255,'+(.25+r()*.75)+')';const z=r()<.08?2:1;x.fillRect(r()*640,r()*360,z,z)}
   // a ringed planet
   const px=150,py=96;blob(px,py,70,'rgba(255,170,120,.25)');let gr=x.createRadialGradient(px-12,py-14,4,px,py,34);gr.addColorStop(0,'#ffd8b0');gr.addColorStop(.6,'#d27a5a');gr.addColorStop(1,'#5a2a3a');x.fillStyle=gr;x.beginPath();x.arc(px,py,34,0,TAU);x.fill();
   x.strokeStyle='rgba(255,220,190,.7)';x.lineWidth=3;x.beginPath();x.ellipse(px,py,62,13,-.3,0,TAU);x.stroke();x.strokeStyle='rgba(255,220,190,.3)';x.lineWidth=6;x.beginPath();x.ellipse(px,py,74,16,-.3,0,TAU);x.stroke();
   for(const[c,cx,base,n,col]of[[a,0,150,18,'#1a1038'],[b,0,190,12,'#0a0620']]){c.fillStyle=col;for(let i=0;i<n;i++){const ax=r()*1280,ay=base-r()*110,rad=6+r()*22;c.beginPath();c.ellipse(ax,ay,rad,rad*.75,r()*3,0,TAU);c.fill();if(ax-rad<0){c.beginPath();c.ellipse(ax+1280,ay,rad,rad*.75,0,0,TAU);c.fill()}}c.fillRect(0,base+30,1280,60)}}
  else if(s==3){grd([[0,'#3ac0d8'],[.25,'#1a7ab0'],[.6,'#0c3a6a'],[1,'#04122a']]);
   x.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const x0=40+i*90+r()*30,w=20+r()*40;const gr=x.createLinearGradient(0,0,0,300);gr.addColorStop(0,'rgba(200,250,255,.22)');gr.addColorStop(1,'rgba(200,250,255,0)');x.fillStyle=gr;x.beginPath();x.moveTo(x0,0);x.lineTo(x0+w,0);x.lineTo(x0+w+80,300);x.lineTo(x0+60,300);x.closePath();x.fill()}x.globalCompositeOperation='source-over';
   for(let i=0;i<60;i++){x.fillStyle='rgba(220,250,255,'+(.15+r()*.3)+')';x.fillRect(r()*640,r()*360,1.5,1.5)}
   for(const[c,base,amp,col]of[[a,150,80,'#0b3a5a'],[b,200,60,'#062038']]){c.fillStyle=col;c.beginPath();c.moveTo(0,240);for(let px=0;px<=1280;px+=8){const f=base-(Math.abs(Math.sin(px/1280*TAU*3+base))*.6+Math.sin(px/1280*TAU*11)*.15+.2)*amp;c.lineTo(px,f)}c.lineTo(1280,240);c.closePath();c.fill();
    // coral fans and kelp silhouettes on the ridge
    for(let i=0;i<26;i++){const px=r()*1280,h=20+r()*50,py=base-r()*amp*.5;c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.moveTo(px,py+20);c.quadraticCurveTo(px+(r()-.5)*30,py-h*.5,px+(r()-.5)*16,py-h);c.stroke()}}}
  else{grd([[0,'#140a2e'],[.45,'#3a1a5e'],[.8,'#7a3a8a'],[1,'#d27ab8']]);for(let i=0;i<120;i++){x.fillStyle='rgba(255,255,255,'+(.2+r()*.6)+')';x.fillRect(r()*640,r()*240,1.2,1.2)}
   // aurora ribbons
   x.globalCompositeOperation='lighter';for(const[cy,c1,c2]of[[70,'rgba(120,255,200,','rgba(120,200,255,'],[120,'rgba(255,140,230,','rgba(160,120,255,']]){for(let px=0;px<640;px+=3){const y=cy+Math.sin(px*.018+cy)*22+Math.sin(px*.05)*6,h=40+Math.sin(px*.03+cy)*18;const gr=x.createLinearGradient(0,y-h,0,y+10);gr.addColorStop(0,c2+'0)');gr.addColorStop(.7,c1+'.16)');gr.addColorStop(1,c1+'0)');x.fillStyle=gr;x.fillRect(px,y-h,3,h+10)}}x.globalCompositeOperation='source-over';
   for(const[c,base,col,n]of[[a,170,'#2a1648',14],[b,205,'#160a2a',10]]){c.fillStyle=col;c.fillRect(0,base,1280,60);for(let i=0;i<n;i++){const px=r()*1280,h=40+r()*110,w=10+r()*22;for(const ox of[0,1280,-1280]){c.beginPath();c.moveTo(px+ox-w,base+2);c.lineTo(px+ox-w*.3,base-h*.7);c.lineTo(px+ox,base-h);c.lineTo(px+ox+w*.35,base-h*.6);c.lineTo(px+ox+w,base+2);c.closePath();c.fill()}}
    c.globalCompositeOperation='lighter';c.strokeStyle='rgba(180,240,255,.18)';c.lineWidth=2;for(let i=0;i<n;i++){const px=r()*1280,h=40+r()*100;c.beginPath();c.moveTo(px,base);c.lineTo(px+4,base-h);c.stroke()}c.globalCompositeOperation='source-over'}}
  SKY[s]={S0,L1,L2}}
 function sky(s,w,hh,now){if(!SKY[s])mkSky(s);const q=SKY[s];g.drawImage(q.S0,0,0,w,hh);const k=hh/360;
  for(const[c,pk,y0]of[[q.L1,.03,.36],[q.L2,.08,.52]]){const cw=1280*k,ch=240*k,ox=-((cam.x*pk)%cw+cw)%cw;for(let x=ox;x<w;x+=cw)g.drawImage(c,x,hh*y0,cw+1,ch)}
  g.fillStyle=s==2?'#0a0620':s==3?'#062038':'#160a2a';const by=hh*.52+240*k;if(by<hh)g.fillRect(0,by-1,w,hh-by+1);
  // a few live touches: twinkles (Galaxy), drifting light (Abyss), shimmering aurora (Crystal)
  const t=now/1000;g.save();g.globalCompositeOperation='lighter';
  if(s==2){for(let i=0;i<14;i++){const a=.5+.5*Math.sin(t*(1.3+i*.17)+i*2.1);if(a<.4)continue;g.globalAlpha=a;const sx=((i*397)%997)/997*w,sy=((i*631)%887)/887*hh*.55;g.fillStyle='#fff';g.fillRect(sx-1,sy-3,2,6);g.fillRect(sx-3,sy-1,6,2)}
   const sh2=(t*.13)%1;if(sh2<.12){const p=sh2/.12;g.globalAlpha=1-p;g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;const sx=w*(.2+p*.5),sy=hh*(.08+p*.18);g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-60,sy-24);g.stroke()}}
  else if(s==3){g.globalAlpha=.12+.06*Math.sin(t*.7);g.fillStyle='#bff6ff';for(let i=0;i<3;i++){const x0=w*(.15+i*.3)+Math.sin(t*.25+i)*w*.05;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+w*.06,0);g.lineTo(x0+w*.16,hh);g.lineTo(x0+w*.08,hh);g.closePath();g.fill()}}
  else{g.globalAlpha=.08+.06*Math.sin(t*.9);g.drawImage(q.S0,0,hh*.12,640,150,Math.sin(t*.2)*8,hh*.1,w,hh*.42)}
  g.restore()}
 {const _ds=drawSky;drawSky=function(w,hh,now){const s=sg();if(s<2)return _ds.apply(this,arguments);try{sky(s,w,hh,now||performance.now())}catch(e){_ds.apply(this,arguments)}}}
 // ---- kelp (Kelp Forest), drawn with the world just behind the creatures; swaying ribbons from the seabed
 function drawKelp(x0,x1,y0,y1,now){if(sg()!=3||!KELP.length)return;const t=now/1000;g.save();g.lineCap='round';
  for(const kp of KELP){if(kp.x<x0-2||kp.x>x1+2||kp.y<y0-12||kp.y-kp.h>y1+2)continue;if(tiles[kp.y*W+kp.x]==0)continue;const bx=(kp.x+.5)*T-cam.x,by=kp.y*T-cam.y,len=kp.h*T*.8;
   const sw=i=>Math.sin(t*1.1+kp.ph+i*.9)*(8+i*5);g.strokeStyle=kp.c?'#2f8a4a':'#3aa060';g.lineWidth=7;g.beginPath();g.moveTo(bx,by);for(let i=1;i<=4;i++)g.lineTo(bx+sw(i),by-len*i/4);g.stroke();
   g.strokeStyle=kp.c?'#5ad07a':'#7ae08a';g.lineWidth=2;g.beginPath();g.moveTo(bx,by);for(let i=1;i<=4;i++)g.lineTo(bx+sw(i)-1,by-len*i/4);g.stroke();
   g.fillStyle=kp.c?'#3aa060':'#4ab86a';for(let i=1;i<=3;i++){const lx=bx+sw(i),ly=by-len*i/4;g.beginPath();g.ellipse(lx+6,ly,8,3,-.5+Math.sin(t+i)*.2,0,TAU);g.fill();g.beginPath();g.ellipse(lx-6,ly+6,8,3,.5,0,TAU);g.fill()}
   if(kp.c){g.fillStyle='rgba(255,230,120,.9)';g.beginPath();g.arc(bx+sw(4),by-len,3,0,TAU);g.fill()}}
  g.restore()}
 {const _dw=drawWater;drawWater=function(x0,x1,y0,y1,now){const r=_dw.apply(this,arguments);try{drawKelp(x0,x1,y0,y1,now||performance.now())}catch(e){if(!REALM10.e0){REALM10.e0=1;console.error('REALM10 kelp',e)}}return r}}
 // ---- physics: low gravity in the Galaxy; in the Abyssal Sea you swim anywhere there is open water (all the open space is sea)
 {const _iw=inWater;inWater=function(x,y){if(SG==3&&x===P.x&&sg()==3){const tx=Math.floor(x/T),ty=Math.floor(y/T);if(tx>=0&&ty>=0&&tx<W&&ty<H){const b=tiles[ty*W+tx];if(!b||!SOLID6[b])return true}}return _iw.apply(this,arguments)}}
 // ---- monsters: four per realm, each much stronger than the realm before (Inferno: 150-460 HP, 16-30 damage)
 const MON={
  gal_wisp:{n:'Starling Wisp',c:'#ffe27a',hp:340,dmg:26,gem:40,w:34,h:34,ai:'fly',fly:1,spm:1.4,s:2,d:[294,'Stardust Mote','#ffe9a8',90]},
  gal_stalker:{n:'Void Stalker',c:'#5a4aa8',hp:480,dmg:32,gem:46,w:38,h:58,ai:'walk',spm:1.9,s:2,d:[295,'Void Shard','#8a6aff',100]},
  gal_ram:{n:'Comet Ram',c:'#7ad0ff',hp:560,dmg:36,gem:50,w:58,h:40,ai:'walk',spm:1.5,s:2,d:[296,'Comet Horn','#bfeeff',110]},
  gal_titan:{n:'Nebula Titan',c:'#c86ad8',hp:1050,dmg:46,gem:90,w:62,h:72,ai:'walk',spm:.7,s:2,d:[297,'Nebula Core','#ff8ad8',190]},
  sea_jelly:{n:'Abyss Jelly',c:'#ff9ae0',hp:560,dmg:36,gem:56,w:36,h:46,ai:'fly',fly:1,spm:.8,s:3,d:[298,'Jelly Lumen','#ffb0ea',125]},
  sea_angler:{n:'Angler Fiend',c:'#3a4a6a',hp:760,dmg:44,gem:64,w:52,h:42,ai:'fly',fly:1,spm:1.1,s:3,d:[299,'Angler Lure','#d8ff7a',140]},
  sea_shark:{n:'Razor Shark',c:'#6a8aa8',hp:860,dmg:52,gem:72,w:72,h:32,ai:'fly',fly:1,spm:1.7,s:3,d:[300,'Razor Tooth','#f0f4ff',150]},
  sea_kraken:{n:'Kraken Spawn',c:'#8a4ab8',hp:1500,dmg:60,gem:120,w:64,h:60,ai:'fly',fly:1,spm:.6,s:3,d:[301,'Kraken Ink','#5a2a8a',240]},
  cry_sprite:{n:'Prism Sprite',c:'#bff6ff',hp:780,dmg:48,gem:80,w:30,h:34,ai:'fly',fly:1,spm:1.5,s:4,d:[302,'Prism Dust','#e8fdff',170]},
  cry_spider:{n:'Crystal Spider',c:'#9a7af0',hp:1100,dmg:58,gem:90,w:60,h:34,ai:'walk',spm:2.0,s:4,d:[303,'Crystal Silk','#d8c8ff',190]},
  cry_golem:{n:'Prism Golem',c:'#7af0ff',hp:2000,dmg:74,gem:150,w:60,h:72,ai:'walk',spm:.65,s:4,d:[304,'Prism Heart','#7af0ff',320]},
  cry_wyrm:{n:'Geode Wyrm',c:'#ff8ad8',hp:1500,dmg:66,gem:130,w:80,h:34,ai:'fly',fly:1,spm:1.2,s:4,d:[305,'Wyrm Scale','#ff9ae8',260]}};
 const POOL={2:[['gal_wisp',3],['gal_stalker',3],['gal_ram',2.5],['gal_titan',1.2]],3:[['sea_jelly',3],['sea_angler',2.6],['sea_shark',2.4],['sea_kraken',1.1]],4:[['cry_sprite',3],['cry_spider',2.6],['cry_golem',1.2],['cry_wyrm',1.6]]};
 for(const k in MON){const d=MON[k];MK[k]=Object.assign({min:9999,max:9999,realm:d.s},d);delete MK[k].d;delete MK[k].s;MAT[d.d[0]]={n:d.d[1],c:d.d[2],p:d.d[3]};MOBMAT[k]=d.d[0]}
 {const _pm=pickMob;pickMob=function(dp){const s=sg();if(s<2)return _pm.apply(this,arguments);try{const b=BIOME17.pick(dp);if(b)return b}catch(_){}const pool=POOL[s],wt=(p,i)=>p[1]*(dp>=38&&i==3?2.5:1);let t=0;pool.forEach((p,i)=>t+=wt(p,i));let r=R()*t;for(let i=0;i<pool.length;i++){r-=wt(pool[i],i);if(r<=0)return pool[i][0]}return pool[0][0]}}
 {const _md=mobDrops;mobDrops=function(m){const r=_md.apply(this,arguments);try{const d=MK[m.k];if(d&&d.realm){for(let i=0;i<d.realm+1;i++)spawnDrop(m.x,m.y,'gem',3+d.realm);if(R()<.35)spawnDrop(m.x,m.y,ORE[d.realm],1);if(R()<.2)spawnDrop(m.x,m.y,[73,74,75,76][R()*4|0],1)}}catch(_){}return r}}
 // ---- monster art (vector, drawn per frame: sharp at any resolution); the glows are cached sprites per colour
 const GLC={};const glowSp=c=>GLC[c]||(GLC[c]=(()=>{const q=cvs(96,96),x=q.getContext('2d'),gr=x.createRadialGradient(48,48,2,48,48,48);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,96,96);return q})());
 const OL='rgba(16,10,30,.92)';
 function art(m,now,px,py){g.save();try{art0(m,now,px,py)}finally{g.restore()}}
 function art0(m,now,px,py){const k=m.k,fl=m.fl>0,F=c=>fl?'#fff':c,t=now/1000+m.ph,dir=(m.vx||m.dir||1)<0?-1:1;g.translate(px,py+m.h);g.globalAlpha=m.fade;g.lineWidth=2.5;g.strokeStyle=OL;g.lineJoin='round';g.lineCap='round';
  const glow=(y,s,a,c)=>{g.globalCompositeOperation='lighter';g.globalAlpha=m.fade*a;g.drawImage(glowSp(c),-s/2,y-s/2,s,s);g.globalAlpha=m.fade;g.globalCompositeOperation='source-over'};
  const eye=(ex,ey,r,c,p)=>{g.fillStyle=F(c||'#fff');g.beginPath();g.ellipse(ex,ey,r,r*.85,0,0,TAU);g.fill();g.stroke();g.fillStyle=p||'#140a20';g.beginPath();g.arc(ex+dir*r*.25,ey,r*.45,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(ex-r*.3,ey-r*.45,2,2)};
  const poly=(pts,c,st)=>{g.fillStyle=F(c);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();if(st!==0)g.stroke()};
  if(k=='gal_wisp'){const cy=-m.h/2+Math.sin(t*3)*4;glow(cy,96,.85,'rgba(255,220,120,.7)');
   for(let i=5;i>=1;i--){g.globalAlpha=m.fade*(.55-i*.08);g.fillStyle=F(i%2?'#ffe9a8':'#bfeeff');g.beginPath();g.arc(-dir*i*7,cy+Math.sin(t*5+i)*2.5,10-i*1.4,0,TAU);g.fill()}g.globalAlpha=m.fade;
   g.save();g.translate(0,cy);g.rotate(Math.sin(t*1.5)*.35);const gr=g.createRadialGradient(-3,-3,1,0,0,16);gr.addColorStop(0,'#ffffff');gr.addColorStop(.6,'#ffe27a');gr.addColorStop(1,'#e8a83a');g.fillStyle=fl?'#fff':gr;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7.5:16;i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();
   const bl=(t%3.2)<.12;g.fillStyle='#2a1a10';if(bl){g.fillRect(-6,-1,4,1.5);g.fillRect(2,-1,4,1.5)}else{g.beginPath();g.ellipse(-4,-1,2,2.8,0,0,TAU);g.ellipse(4,-1,2,2.8,0,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(-4.5,-2.5,1.2,1.2);g.fillRect(3.5,-2.5,1.2,1.2)}g.fillStyle='rgba(255,120,120,.6)';g.beginPath();g.ellipse(-7,3,2,1.2,0,0,TAU);g.ellipse(7,3,2,1.2,0,0,TAU);g.fill();g.restore()}
  else if(k=='gal_stalker'){const run=m.g&&Math.abs(m.vx)>20?Math.sin(m.x*.08):0,fk=.82+.18*Math.sin(t*9+m.ph);g.globalAlpha=m.fade*fk;g.scale(dir,1);
   for(const s of[-1,1]){g.save();g.translate(s*5,-22);g.rotate(run*.5*s);g.fillStyle=F('#1a1238');g.beginPath();g.roundRect(-2.5,0,5,22,2);g.fill();g.stroke();g.restore()}
   g.fillStyle=F('#241a4a');g.beginPath();g.ellipse(0,-32,10,14,0,0,TAU);g.fill();g.stroke();
   if(!fl){g.save();g.beginPath();g.ellipse(0,-32,9,13,0,0,TAU);g.clip();g.fillStyle='#fff';for(let i=0;i<9;i++){const sx=((i*37)%17)-8,sy=-44+((i*53)%25);g.globalAlpha=m.fade*(.4+.6*Math.abs(Math.sin(t*2+i)));g.fillRect(sx,sy,1.4,1.4)}g.restore();g.globalAlpha=m.fade*fk}
   for(const s of[-1,1]){g.save();g.translate(s*9,-40);g.rotate(s*.25+Math.sin(t*3+s)*.25);g.strokeStyle=F('#241a4a');g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.lineTo(s*3,16);g.lineTo(s*1,26);g.stroke();g.strokeStyle=OL;g.lineWidth=1.5;g.beginPath();g.moveTo(s*1,26);g.lineTo(s*4,30);g.moveTo(s*1,26);g.lineTo(s*-1,31);g.stroke();g.restore()}
   g.fillStyle=F('#2e2260');g.beginPath();g.ellipse(2,-52,8,7.5,-.2,0,TAU);g.fill();g.stroke();glow(-52,46,.8,'rgba(90,240,255,.7)');g.fillStyle='#8af6ff';g.beginPath();g.roundRect(0,-54,9,3,1.5);g.fill()}
  else if(k=='gal_ram'){glow(-m.h*.6,96,.45,'rgba(140,220,255,.6)');g.scale(dir,1);const run=m.g&&Math.abs(m.vx)>20?Math.sin(m.x*.09):Math.sin(t*2)*.2,bw=m.w/2;g.fillStyle=F('#5a7ab0');
   for(const[lx,ph]of[[-bw*.6,0],[-bw*.35,3.1],[bw*.4,1.6],[bw*.62,4.7]]){g.save();g.translate(lx,-12);g.rotate(Math.sin(ph)*run*.6);g.beginPath();g.rect(-3.5,0,7,12);g.fill();g.stroke();g.fillStyle=F('#1a2440');g.fillRect(-3.5,9,7,3);g.fillStyle=F('#5a7ab0');g.restore()}
   g.fillStyle=F('#e8f4ff');g.beginPath();g.ellipse(-2,-22,bw*.8,12,0,0,TAU);g.fill();g.stroke();if(!fl){g.fillStyle='rgba(180,210,240,.8)';for(let i=0;i<6;i++){g.beginPath();g.arc(-bw*.6+i*bw*.24,-26+Math.sin(i)*3,4.5,0,TAU);g.fill()}}
   g.fillStyle=F('#c8dcf0');g.beginPath();g.ellipse(bw*.72,-26,10,9,0,0,TAU);g.fill();g.stroke();g.fillStyle=F('#ffeec0');g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.arc(bw*.62,-32,7,Math.PI*.9,Math.PI*2.4);g.stroke();g.strokeStyle=F('#ffeec0');g.lineWidth=3;g.beginPath();g.arc(bw*.62,-32,7,Math.PI*.9,Math.PI*2.4);g.stroke();g.strokeStyle=OL;g.lineWidth=2.5;
   g.fillStyle='#2a3a6a';g.beginPath();g.arc(bw*.84,-27,1.8,0,TAU);g.fill();
   if(!fl){for(let i=0;i<7;i++){const fx=bw*.5-i*bw*.2,fh=10+Math.sin(t*12+i*1.7)*4;g.fillStyle=i%2?'#7ad0ff':'#e8fbff';g.globalAlpha=m.fade*(.9-i*.08);g.beginPath();g.moveTo(fx+4,-32);g.quadraticCurveTo(fx-4,-32-fh*.6,fx-12,-30-fh*.2);g.quadraticCurveTo(fx-4,-30,fx-2,-30);g.closePath();g.fill()}g.globalAlpha=m.fade}}
  else if(k=='gal_titan'){const cy=-44,st=Math.sin(t*3)*2,lf=m.g&&Math.abs(m.vx)>10?Math.sin(m.x*.05)*3:0;glow(cy,128,.75,'rgba(255,110,220,.6)');
   const rock=(x,y,w,h,c)=>{g.fillStyle=F(c);g.beginPath();g.moveTo(x+w*.15,y);g.lineTo(x+w*.85,y);g.lineTo(x+w,y+h*.4);g.lineTo(x+w*.8,y+h);g.lineTo(x+w*.1,y+h);g.lineTo(x,y+h*.5);g.closePath();g.fill();g.stroke()};
   rock(-18,-14+lf,14,14,'#3a2f66');rock(4,-14-lf,14,14,'#3a2f66');
   const orb=i=>{const a=t*.9+i*TAU/6;return{x:Math.cos(a)*30,y:cy+Math.sin(a)*9,z:Math.sin(a)}};
   for(let i=0;i<6;i++){const o=orb(i);if(o.z<0)rock(o.x-6,o.y-5,12,10,'#2a2050')}
   g.strokeStyle='rgba(255,180,240,.5)';g.lineWidth=2;g.beginPath();g.ellipse(0,cy,32,9,0,Math.PI,TAU);g.stroke();g.strokeStyle=OL;g.lineWidth=2.5;
   rock(-20,cy-14+st*.3,40,30,'#4a3c80');const gr=g.createRadialGradient(0,cy,1,0,cy,11);gr.addColorStop(0,'#ffffff');gr.addColorStop(.4,'#ff9ae8');gr.addColorStop(1,'rgba(160,80,255,.2)');g.fillStyle=fl?'#fff':gr;g.beginPath();g.arc(0,cy,10+Math.sin(t*4),0,TAU);g.fill();
   rock(-13,-76,26,18,'#4a3c80');g.fillStyle='#ffd0f4';g.fillRect(-8,-70,5,3);g.fillRect(3,-70,5,3);rock(-34,cy-10-st,12,22,'#3a2f66');rock(22,cy-10+st,12,22,'#3a2f66');
   g.strokeStyle='rgba(255,180,240,.5)';g.lineWidth=2;g.beginPath();g.ellipse(0,cy,32,9,0,0,Math.PI);g.stroke();g.strokeStyle=OL;g.lineWidth=2.5;
   for(let i=0;i<6;i++){const o=orb(i);if(o.z>=0)rock(o.x-6,o.y-5,12,10,'#55488f')}}
  else if(k=='sea_jelly'){const cy=-m.h*.62+Math.sin(t*1.6)*4,p=Math.sin(t*3.2),bw=17*(1+.12*p),bh=15*(1-.1*p);glow(cy,100,.8,'rgba(255,150,230,.6)');
   g.strokeStyle=F('rgba(255,170,230,.75)');g.lineWidth=2;for(let i=0;i<5;i++){const tx=-12+i*6;g.beginPath();g.moveTo(tx,cy+2);g.quadraticCurveTo(tx+Math.sin(t*3+i)*6,cy+14,tx+Math.sin(t*2.4+i*1.3)*5,cy+26+(i%2)*4);g.stroke()}
   g.strokeStyle=OL;g.lineWidth=2.5;const gr=g.createLinearGradient(0,cy-bh,0,cy+3);gr.addColorStop(0,'rgba(255,220,245,.95)');gr.addColorStop(1,'rgba(255,120,210,.75)');g.fillStyle=fl?'#fff':gr;g.beginPath();g.moveTo(-bw,cy+2);g.bezierCurveTo(-bw,cy-bh*1.3,bw,cy-bh*1.3,bw,cy+2);g.quadraticCurveTo(bw*.5,cy+6,0,cy+2);g.quadraticCurveTo(-bw*.5,cy+6,-bw,cy+2);g.closePath();g.fill();g.stroke();
   if(!fl){g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){g.fillStyle='rgba(255,255,255,'+(.4+.4*Math.sin(t*4+i))+')';g.beginPath();g.arc(-9+i*6,cy-bh*.55+(i%2)*3,1.6,0,TAU);g.fill()}g.globalCompositeOperation='source-over'}
   g.fillStyle='#4a1a3a';g.beginPath();g.arc(-4,cy-3,1.8,0,TAU);g.arc(4,cy-3,1.8,0,TAU);g.fill()}
  else if(k=='sea_angler'){const cy=-m.h/2+Math.sin(t*2)*3;g.scale(dir,1);const lx=22+Math.sin(t*2.2)*2,ly=cy-26+Math.cos(t*2.2)*2;glow(ly,70,.9,'rgba(220,255,120,.7)');
   g.fillStyle=F('#2a3650');g.beginPath();g.moveTo(-18,cy);g.lineTo(-32,cy-10+Math.sin(t*6)*3);g.lineTo(-30,cy+10+Math.sin(t*6)*3);g.closePath();g.fill();g.stroke();
   g.fillStyle=F('#34426a');g.beginPath();g.arc(0,cy,19,0,TAU);g.fill();g.stroke();g.fillStyle=F('#5a6a90');g.beginPath();g.ellipse(-2,cy+8,13,8,0,0,TAU);g.fill();
   for(let i=0;i<3;i++){g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(-10+i*6,cy-18);g.lineTo(-13+i*6,cy-27);g.stroke()}g.lineWidth=2.5;
   g.fillStyle='#120a14';g.beginPath();g.moveTo(19,cy-6);g.lineTo(4,cy+2);g.lineTo(19,cy+11);g.closePath();g.fill();g.fillStyle='#fff';for(let i=0;i<3;i++){g.beginPath();g.moveTo(17-i*4,cy-5+i*2.6);g.lineTo(14-i*4,cy-1+i*2.6);g.lineTo(13-i*4,cy-5.5+i*2.6);g.fill();g.beginPath();g.moveTo(17-i*4,cy+10-i*2.6);g.lineTo(14-i*4,cy+6-i*2.6);g.lineTo(12-i*4,cy+10.5-i*2.6);g.fill()}
   eye(6,cy-9,4.5,'#ffffff','#120a14');g.strokeStyle=F('#5a6a90');g.lineWidth=2;g.beginPath();g.moveTo(4,cy-18);g.quadraticCurveTo(14,cy-34,lx,ly);g.stroke();g.lineWidth=2.5;g.strokeStyle=OL;
   g.fillStyle=fl?'#fff':'rgb(230,255,'+(140+Math.sin(t*5)*40|0)+')';g.beginPath();g.arc(lx,ly,4.5,0,TAU);g.fill()}
  else if(k=='sea_shark'){const cy=-m.h/2+Math.sin(t*1.8)*2,sw=Math.sin(t*6)*.18;g.scale(dir,1);
   g.save();g.translate(-26,cy);g.rotate(sw);g.fillStyle=F('#5a7a98');g.beginPath();g.moveTo(0,0);g.lineTo(-16,-14);g.lineTo(-11,0);g.lineTo(-16,12);g.closePath();g.fill();g.stroke();g.restore();
   g.fillStyle=F('#6a8aa8');g.beginPath();g.moveTo(-28,cy);g.bezierCurveTo(-18,cy-13,18,cy-13,36,cy+1);g.bezierCurveTo(20,cy+12,-18,cy+10,-28,cy);g.closePath();g.fill();g.stroke();
   g.fillStyle=F('#eef4fa');g.beginPath();g.moveTo(-18,cy+4);g.bezierCurveTo(0,cy+11,22,cy+9,34,cy+2);g.bezierCurveTo(16,cy+5,0,cy+4,-18,cy+4);g.closePath();g.fill();
   g.fillStyle=F('#5a7a98');g.beginPath();g.moveTo(-4,cy-9);g.lineTo(2,cy-22);g.lineTo(10,cy-9);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(4,cy+5);g.lineTo(-4,cy+15);g.lineTo(12,cy+6);g.closePath();g.fill();g.stroke();
   g.strokeStyle='rgba(20,30,50,.6)';g.lineWidth=1.5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(14+i*3,cy-4);g.lineTo(13+i*3,cy+3);g.stroke()}g.strokeStyle='rgba(255,255,255,.55)';g.beginPath();g.moveTo(-6,cy-6);g.lineTo(2,cy-2);g.stroke();
   g.fillStyle='#0a1020';g.beginPath();g.arc(26,cy-3,2.2,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.moveTo(22,cy+5);g.lineTo(34,cy+3);g.stroke();g.fillStyle='#fff';for(let i=0;i<4;i++){g.beginPath();g.moveTo(23+i*3,cy+5);g.lineTo(24.5+i*3,cy+7.5);g.lineTo(26+i*3,cy+4.6);g.fill()}}
  else if(k=='sea_kraken'){const cy=-m.h*.62+Math.sin(t*1.4)*3;glow(cy,120,.5,'rgba(190,120,255,.5)');
   for(let i=0;i<6;i++){const bx=-18+i*7.2,ph=t*2.4+i*1.1;g.strokeStyle=OL;g.lineWidth=8;g.beginPath();g.moveTo(bx,cy+8);g.quadraticCurveTo(bx+Math.sin(ph)*12,cy+20,bx+Math.sin(ph+1)*14,cy+30+(i%2)*4);g.stroke();g.strokeStyle=F(i%2?'#7a3aa8':'#8a4ab8');g.lineWidth=5;g.stroke();
    if(!fl){g.fillStyle='#ffc8f0';g.beginPath();g.arc(bx+Math.sin(ph)*6,cy+18,1.4,0,TAU);g.fill()}}g.lineWidth=2.5;
   g.fillStyle=F('#9a5ac8');g.beginPath();g.moveTo(-22,cy+10);g.bezierCurveTo(-26,cy-30,26,cy-30,22,cy+10);g.quadraticCurveTo(0,cy+16,-22,cy+10);g.closePath();g.fill();g.stroke();
   if(!fl){g.fillStyle='rgba(255,200,240,.35)';for(const[sx,sy,r]of[[-10,-14,4],[6,-18,3],[12,-6,2.5],[-14,-2,2]]){g.beginPath();g.arc(sx,cy+sy,r,0,TAU);g.fill()}}
   for(const s of[-1,1]){g.fillStyle=F('#ffd84a');g.beginPath();g.ellipse(s*9,cy+2,5.5,4.5,0,0,TAU);g.fill();g.stroke();g.fillStyle='#1a0a20';g.fillRect(s*9-3.5,cy+1,7,2.2)}}
  else if(k=='cry_sprite'){const cy=-m.h/2+Math.sin(t*2.6)*5,sp=Math.cos(t*2.2),hue=(t*60)%360;glow(cy,90,.85,'rgba(170,240,255,.7)');
   const w=12*Math.max(.5,Math.abs(sp)),c1='hsl('+hue+',90%,85%)',c2='hsl('+((hue+60)%360)+',80%,70%)',c3='hsl('+((hue+180)%360)+',70%,55%)';
   poly([[0,cy-17],[w,cy],[0,cy+2]],sp>0?c1:c2);poly([[0,cy-17],[-w,cy],[0,cy+2]],sp>0?c2:c1);poly([[0,cy+17],[w,cy],[0,cy+2]],c3);poly([[0,cy+17],[-w,cy],[0,cy+2]],c2);
   g.fillStyle='#1a1440';g.beginPath();g.arc(-3,cy-3,1.6,0,TAU);g.arc(3,cy-3,1.6,0,TAU);g.fill();
   for(let i=0;i<3;i++){const a=t*2+i*TAU/3,ox=Math.cos(a)*18,oy=cy+Math.sin(a)*6;poly([[ox,oy-4],[ox+2.5,oy],[ox,oy+4],[ox-2.5,oy]],'#e8fdff',0)}}
  else if(k=='cry_spider'){g.scale(dir,1);const run=m.g&&Math.abs(m.vx)>20?m.x*.12:t*1.5;
   for(let i=0;i<4;i++)for(const s of[-1,1]){const ph=run+i*1.6+(s>0?0:Math.PI),lift=Math.max(0,Math.sin(ph))*6,bx=-8+i*6,kx=bx+s*0+(i-1.5)*8,ky=-26-lift;g.strokeStyle=OL;g.lineWidth=4.5;g.beginPath();g.moveTo(bx,-16);g.lineTo(kx,ky);g.lineTo(kx+(i-1.5)*6,-lift*.4);g.stroke();g.strokeStyle=F(s>0?'#b8a0ff':'#7a5ad0');g.lineWidth=2.5;g.stroke()}
   g.lineWidth=2.5;g.strokeStyle=OL;poly([[-30,-14],[-24,-28],[-10,-32],[-2,-20],[-10,-10],[-24,-8]],'#8a6ae0');if(!fl){poly([[-24,-28],[-18,-40],[-14,-30]],'#d8c8ff');poly([[-14,-31],[-8,-42],[-6,-28]],'#bff6ff');poly([[-24,-28],[-10,-32],[-16,-22]],'rgba(255,255,255,.35)',0)}
   poly([[-4,-22],[6,-28],[18,-24],[20,-14],[8,-10],[-2,-14]],'#a08af0');g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,120,200,.95)';for(const[ex,ey]of[[12,-22],[16,-20],[11,-18],[15,-16.5]]){g.beginPath();g.arc(ex,ey,1.7,0,TAU);g.fill()}g.globalCompositeOperation='source-over'}
  else if(k=='cry_golem'){const st=Math.sin(t*3)*2,lf=m.g&&Math.abs(m.vx)>10?Math.sin(m.x*.05)*3:0;glow(-44,128,.6,'rgba(120,240,255,.55)');
   poly([[-17,-16+lf],[-5,-16+lf],[-4,0],[-18,0]],'#4ab8d8');poly([[5,-16-lf],[17,-16-lf],[18,0],[4,0]],'#4ab8d8');
   poly([[-22,-50],[22,-50],[26,-30],[14,-14],[-14,-14],[-26,-30]],'#5ad0ec');if(!fl){poly([[-22,-50],[0,-50],[-6,-30],[-26,-30]],'rgba(255,255,255,.28)',0);poly([[14,-14],[26,-30],[6,-30]],'rgba(0,40,80,.25)',0)}
   for(const s of[-1,1]){poly([[s*22,-50],[s*30,-66],[s*34,-48]],'#bff6ff');poly([[s*28,-48],[s*36,-60],[s*38,-44]],'#8ae8ff');g.save();g.translate(s*28,-44+(s>0?st:-st));poly([[-6,0],[6,0],[8,22],[-8,22]],'#4ab8d8');poly([[-8,22],[8,22],[0,32]],'#bff6ff');g.restore()}
   poly([[-11,-66],[11,-66],[13,-54],[-13,-54]],'#7ae8ff');if(!fl){poly([[-11,-66],[11,-66],[0,-76]],'#e8fdff')}g.fillStyle='#fff';g.fillRect(-8,-62,5,3);g.fillRect(3,-62,5,3);
   g.globalCompositeOperation='lighter';g.fillStyle='rgba(180,250,255,'+(.7+Math.sin(t*4)*.25)+')';g.beginPath();g.moveTo(0,-42);g.lineTo(6,-34);g.lineTo(0,-26);g.lineTo(-6,-34);g.closePath();g.fill();g.globalCompositeOperation='source-over'}
  else if(k=='cry_wyrm'){const cy=-m.h/2;glow(cy,110,.55,'rgba(255,140,220,.5)');g.scale(dir,1);
   for(let i=7;i>=1;i--){const sx=-i*9,sy=cy+Math.sin(t*4-i*.7)*7,s=11-i*1.05;poly([[sx,sy-s],[sx+s*.9,sy],[sx,sy+s],[sx-s*.9,sy]],i%2?'#d878c8':'#ff9ae8');if(!fl&&i%2==0)poly([[sx,sy-s],[sx+s*.4,sy-s*1.7],[sx-s*.2,sy-s*.6]],'#ffd0f4',0)}
   const hy=cy+Math.sin(t*4)*3;poly([[-6,hy-9],[12,hy-7],[22,hy],[12,hy+7],[-6,hy+9]],'#ff8ad8');poly([[0,hy-8],[-4,hy-20],[6,hy-8]],'#ffe0f6');poly([[8,hy-7],[8,hy-17],[14,hy-6]],'#ffe0f6');
   g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,255,200,.95)';g.beginPath();g.arc(9,hy-2,2.4,0,TAU);g.fill();g.globalCompositeOperation='source-over';g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.moveTo(14,hy+3);g.lineTo(21,hy+1);g.stroke()}}
 {const _dv=drawMobV;drawMobV=function(m,now,px,py){const d=MK[m.k];if(!d||!d.realm)return _dv.apply(this,arguments);try{art(m,now,px,py)}catch(e){if(!REALM10.e1){REALM10.e1=1;console.error('REALM10 art',e)}}}}
 // ---- per frame: special moves, bolts, a steady trickle of realm monsters (day or night), ambient motes
 const PB=[],MO=[];let spT=3,moT=0,regT=0,lastReg=null,shots=0;
 function hurt(a,kb){if(creative()||iT>0||P.hp<=0)return;P.hp-=a*(1-Math.min(.8,(bonus().arm||0)+(typeof guard!='undefined'&&guard>0?.5:0)));iT=.8;P.vx=kb||0;P.vy=Math.min(P.vy,-260);hurtF=.42;shake=Math.max(shake,QM.reduce?0:.1);try{snd(150,.2,'sawtooth',.06)}catch(_){}}
 const bolt=(x,y,a,v,c,dmg,sz,l)=>{PB.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:l||2.6,c,dmg,sz:sz||26});shots++};
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 function moveX(m,dx){const s=Math.sign(dx);let left=Math.abs(dx);while(left>0){const st=Math.min(4,left)*s,nx=m.x+st+s*m.w/2;if(solidAt(Math.floor(nx/T),Math.floor((m.y+m.h-6)/T))||solidAt(Math.floor(nx/T),Math.floor((m.y+m.h*.4)/T)))return false;m.x+=st;left-=4}return true}
 let band=-2,bandT=0;
 function tick(dt){if(!entered)return;const s=sg();
  bandT-=dt;if(s>=1&&bandT<=0){bandT=.4;const tx=Math.max(0,Math.min(W-1,Math.floor(P.x/T))),b=bandOf(Math.floor((P.y+P.h)/T)-sh(tx));if(b!==band)band=b}
  if(s<2){if(PB.length)PB.length=0;if(MO.length)MO.length=0;return}
  // Galaxy: low gravity (about half: big, floaty jumps); the Abyss swims through inWater above
  if(s==2&&!P.g&&!P.sw&&P.hp>0)P.vy-=760*dt;
  // region name when you cross into another region
  regT-=dt;if(regT<=0){regT=.5;const r=regionAt(P.x/T);if(r&&r!==lastReg){const first=lastReg==null;lastReg=r;if(!first)try{UI6.say6(r[1].toUpperCase(),WORD9.label(cur),1800)}catch(_){try{say(r[1])}catch(_){}}}}
  // spawns
  spT-=dt;if(spT<=0){const dp=depthAt(P.x,P.y+P.h/2),n=mobs.filter(m=>MK[m.k]&&MK[m.k].realm).length,c2=Math.min(8+s,4+s+Math.floor(Math.max(0,dp)/12));spT=n<c2?rn(3.5,7):2;if(n<c2&&!creative())try{spawnMob()}catch(_){}}
  // special moves
  for(const m of mobs){const d=MK[m.k];if(!d||!d.realm||m.dead||m.hp<=0)continue;const dx=P.x-m.x,dy=P.y+P.h/2-(m.y+m.h/2),dist=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
   if(m.dash>0){m.dash-=dt;if(d.fly){const nx=m.x+Math.cos(m.da)*760*dt,ny=m.y+Math.sin(m.da)*760*dt;if(!solidAt(Math.floor(nx/T),Math.floor((ny+m.h/2)/T))){m.x=nx;m.y=ny}else m.dash=0}else moveX(m,m.dd*820*dt)}
   m.sk=(m.sk==null?rn(1,3):m.sk)-dt;if(m.stun>0||m.sk>0)continue;const near=dist<T*9;
   if(m.k=='gal_wisp'&&near){m.sk=rn(2.2,3.2);bolt(m.x,m.y+m.h/2,a,340,'rgba(255,230,140,.95)',16);tone(880,1320,.18,'triangle',.03)}
   else if(m.k=='gal_stalker'&&dist<T*12&&dist>T*3){m.sk=rn(4,6);const tx=P.x-(P.f||1)*T*1.6;if(!solidAt(Math.floor(tx/T),Math.floor((P.y+P.h-6)/T))&&!solidAt(Math.floor(tx/T),Math.floor((P.y+10)/T))){try{VFX.burst(m.x,m.y+m.h/2,['#8a6aff','#1a1238','#8af6ff'],16,220,1,.6,10)}catch(_){}m.x=tx;m.y=P.y+P.h-m.h;m.vy=0;try{VFX.burst(m.x,m.y+m.h/2,['#8a6aff','#8af6ff'],16,220,1,.6,10)}catch(_){}tone(200,900,.2,'sine',.04)}}
   else if(m.k=='gal_ram'&&m.g&&dist<T*7&&Math.abs(dy)<T*2){m.sk=rn(2.6,3.8);m.dash=.55;m.dd=Math.sign(dx)||1;m.dir=m.dd;tone(160,90,.3,'sawtooth',.03)}
   else if((m.k=='gal_titan'||m.k=='cry_golem')&&m.g&&dist<T*3.4){m.sk=rn(2.8,4);const c=m.k=='gal_titan'?'#ff8ad8':'#7af0ff';try{rings.push({x:m.x,y:m.y+m.h,c,t:performance.now()});VFX.wave(m.x,m.y+m.h,c,120,.5,.3);noise(.35,400,.25)}catch(_){}shake=Math.max(shake,QM.reduce?0:.2);if(dist<T*2.8&&P.g)hurt(d.dmg*.5,Math.sign(dx||1)*400);
    if(m.k=='cry_golem')for(let i=0;i<6;i++)bolt(m.x,m.y+m.h*.4,-Math.PI+i*Math.PI/5,300,'rgba(150,240,255,.95)',22,22,1.4)}
   else if(m.k=='sea_jelly'&&dist<T*2.6){m.sk=rn(2.4,3.4);try{VFX.wave(m.x,m.y+m.h/2,'#ff9ae0',90,.4,.4)}catch(_){}tone(1200,600,.15,'square',.02);if(dist<T*2.2)hurt(d.dmg*.55,Math.sign(dx||1)*260)}
   else if(m.k=='sea_angler'&&near){m.sk=rn(2.6,3.6);bolt(m.x,m.y+m.h*.2,a,250,'rgba(220,255,120,.95)',22,30,3.2);tone(500,700,.2,'sine',.03)}
   else if((m.k=='sea_shark'||m.k=='cry_wyrm')&&dist<T*7){m.sk=rn(2.4,3.4);m.dash=.42;m.da=a;m.dir=Math.sign(dx)||1;tone(220,110,.25,'sawtooth',.03)}
   else if(m.k=='sea_kraken'&&near){m.sk=rn(2.8,3.8);for(const o of[-.25,0,.25])bolt(m.x,m.y+m.h/2,a+o,280,'rgba(120,60,180,.95)',24,30);tone(140,90,.3,'sine',.05)}
   else if(m.k=='cry_sprite'&&near){m.sk=rn(2.2,3.2);for(const o of[-.18,0,.18])bolt(m.x,m.y+m.h/2,a+o,380,'rgba(200,250,255,.95)',20,22);tone(1600,2200,.12,'triangle',.025)}
   else if(m.k=='cry_spider'&&m.g&&dist<T*6&&Math.abs(dy)<T*3){m.sk=rn(1.8,2.8);m.vy=-660;m.dir=Math.sign(dx)||1;m.dash=.35;m.dd=m.dir;tone(300,150,.15,'square',.02)}
   else m.sk=.4;
   // a dashing monster that touches you lands its hit
   if(m.dash>0&&Math.abs(P.x-m.x)<(m.w+P.w)/2&&P.y<m.y+m.h&&P.y+P.h>m.y)hurt(d.dmg*.6,Math.sign(dx||1)*420)}
  for(let i=PB.length-1;i>=0;i--){const f=PB[i];f.l-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(solidAt(Math.floor(f.x/T),Math.floor(f.y/T)))f.l=0;
   if(f.l>0&&Math.abs(f.x-P.x)<P.w/2+8&&f.y>P.y-6&&f.y<P.y+P.h+6){f.l=0;hurt(f.dmg,Math.sign(f.vx)*240)}
   if(f.l<=0){try{VFX.burst(f.x,f.y,[f.c,'#ffffff'],6,120,1,.4,8)}catch(_){}PB.splice(i,1)}}
  if(PB.length>24)PB.splice(0,PB.length-24);
  // motes: stardust (Galaxy), bubbles and marine snow (Abyss), prism glints (Crystal)
  const vw=cv.width/ZM,vh=cv.height/ZM,cap=QM.reduce?16:48;moT-=dt;if(moT<-.2)moT=-.2;while(moT<=0&&MO.length<cap){moT+=.06;MO.push({x:cam.x+R()*vw,y:cam.y+R()*vh,vx:rn(-10,10),vy:s==3?-rn(20,60):rn(-12,12),l:rn(3,6),t:0,p:R()*6,b:s==3&&R()<.45})}
  for(let i=MO.length-1;i>=0;i--){const e=MO[i];e.t+=dt;e.x+=(e.vx+Math.sin(e.t*1.6+e.p)*10)*dt;e.y+=e.vy*dt;if(e.t>e.l)MO.splice(i,1)}}
 const BS={};const boltSp=c=>BS[c]||(BS[c]=(()=>{const q=cvs(40,40),x=q.getContext('2d'),gr=x.createRadialGradient(20,20,1,20,20,20);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,40,40);return q})());
 let GLT=null;const glint=()=>GLT||(GLT=(()=>{const q=cvs(16,16),y=q.getContext('2d');y.fillStyle='#fff';y.beginPath();y.moveTo(8,0);y.quadraticCurveTo(9,7,16,8);y.quadraticCurveTo(9,9,8,16);y.quadraticCurveTo(7,9,0,8);y.quadraticCurveTo(7,7,8,0);y.fill();return q})());
 function draw(g2,cx,cy){const s=sg();if(s<2)return;g2.save();g2.globalCompositeOperation='lighter';
  for(const e of MO){const a=Math.min(1,e.t*2,(e.l-e.t)*1.5);if(a<=.02)continue;const x=e.x-cx,y=e.y-cy;
   if(s==2){g2.globalAlpha=a*.8;const z=3+Math.sin(e.t*6+e.p)*1.5;g2.drawImage(glint(),x-z,y-z,z*2,z*2)}
   else if(s==3){if(e.b){g2.globalAlpha=a*.7;g2.strokeStyle='rgba(220,250,255,.9)';g2.lineWidth=1.2;g2.beginPath();g2.arc(x,y,2.5+e.p*.4,0,TAU);g2.stroke()}else{g2.globalAlpha=a*.5;g2.fillStyle='#e8fbff';g2.fillRect(x,y,1.6,1.6)}}
   else{g2.globalAlpha=a*(.5+.5*Math.sin(e.t*5+e.p));const z=2+Math.abs(Math.sin(e.t*3+e.p))*4;g2.drawImage(glint(),x-z,y-z,z*2,z*2)}}
  g2.globalAlpha=1;for(const f of PB){const sp=boltSp(f.c),z=f.sz;g2.drawImage(sp,f.x-cx-z/2,f.y-cy-z/2,z,z);g2.globalAlpha=.45;g2.drawImage(sp,f.x-f.vx*.03-cx-z*.35,f.y-f.vy*.03-cy-z*.35,z*.7,z*.7);g2.globalAlpha=1}
  g2.restore()}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.apply(this,arguments);try{tick(dt)}catch(e){if(!REALM10.e2){REALM10.e2=1;console.error('REALM10 tick',e)}}};BOSS6.drawProj=function(g2,cx,cy){_d.apply(this,arguments);try{draw(g2,cx,cy)}catch(e){if(!REALM10.e3){REALM10.e3=1;console.error('REALM10 draw',e)}}}}
 {const _lw=loadWorld;loadWorld=function(){PB.length=0;MO.length=0;lastReg=null;band=-2;fixInv();const r=_lw.apply(this,arguments);try{const s=sg();if(DB[s])DEPTH8.theme(DB[s].map((b,i)=>({n:b.n,c:b.c,h:b.h,d0:i?38:10,d1:i?999:38,m:b.m,z:'r'+s+'_'+i,em:d=>b.n+' · '+WORD9.label(cur)+' · '+d+' m deep'})))}catch(e){console.error('REALM10 depth zones',e)}try{if(sg()<2){REG=null;KELP=[]}}catch(_){}return r}}
 // music: each realm (and the Inferno) has its own songs (87-music.js)
 const mood=()=>{const s=sg();return s==1?'inferno':s==2?'realm_gal':s==3?'realm_sea':s==4?'realm_cry':null};
 return{TL,MON,POOL,RG,DB,shape,deep,mood,regionAt,get biome(){try{const i=BIOME17.on?BIOME17.bandOfDepth(Math.floor((P.y+P.h)/T)-sh(Math.max(0,Math.min(W-1,Math.floor(P.x/T))))):-1;return i>=0?BIOME17.layout(cur).bi[i].n:null}catch(_){return null}},get stage(){return sg()},get region(){const r=regionAt(P.x/T);return r?r[1]:null},get kelp(){return KELP.length},get bolts(){return PB.length},get shots(){return shots},get motes(){return MO.length}}})();
