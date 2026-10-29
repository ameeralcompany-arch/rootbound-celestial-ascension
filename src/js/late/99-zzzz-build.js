// ===== BUILD9: input + glue for house building, loaded last so it runs before the other click handlers.
//  - background walls (items 320-328): click with one held to place it behind whatever is there; hit an empty tile that has a wall with a
//    tool or your fist to knock it down (the right tool takes it in one hit) and get the item back
//  - house blocks (items 400-414 = tiles 100-114): click to place, like any block; broken ones drop the item again
//  - house doors (item 95): click with one held to place a 1x2 door (needs two free tiles and ground); break either half with a tool;
//    E next to a door holds it open / lets it close
//  - recipes for the new blocks, walls and the door at the Crafting Table; clean item icons for the see-through blocks
//  - chimney smoke + campfire crackle hooks, and a few frame-cost fixes (HUD text written only when it changes). =====
const BUILD9=(()=>{
 const inReach=(tx,ty)=>Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH;
 const cursor=()=>({tx:Math.floor((mx+cam.x)/T),ty:Math.floor((my+cam.y)/T)});
 const held=()=>{try{const k=HOTBAR.held();if(k!=null)return k}catch(_){}return bar[sel]};
 const locked=()=>{if(canEdit())return false;try{if(performance.now()-lockWarned>1500){lockWarned=performance.now();say(lockMsg())}}catch(_){}return true};
 const hits=new Map();
 // ---- walls
 function placeWall(key){const id=WALL9.idOf(key);if(!id||cnt(key)<1)return false;const{tx,ty}=cursor();if(tx<1||ty<1||tx>=W-1||ty>=H-1||!inReach(tx,ty))return true;const k=ty*W+tx;if(WALL9.bw[k])return true;if(locked())return true;
  if(!WALL9.edit(k,id))return true;addI(key,-1);pop.set(k,performance.now());const px=tx*T+T/2,py=ty*T+T/2;burst(px,py,WALL9.D[id][1],6,70,3);try{MSFX8.play('hit',WALL9.D[id][2],id==1||id==6?5:id==2||id==4||id==8?3:1)}catch(_){}
  try{stat('place',1);G('place')}catch(_){}return true}
 function hitWall(){const w=WPN[wp]||{};if(w.k&&w.k!='tool'&&w.k!='fist'&&wp!='fist')return false;if(w.tool=='rod')return false;const{tx,ty}=cursor();if(tx<1||ty<1||tx>=W-1||ty>=H-1)return false;const k=ty*W+tx,id=WALL9.bw[k];
  if(!id||(tiles[k]&&SOLID6[tiles[k]])||(tiles[k]>=95&&tiles[k]<=96)||!inReach(tx,ty))return false;if(pickTree(mx+cam.x,my+cam.y)>=0)return false;if(tiles[k]&&!SOLID6[tiles[k]])return false;
  if(locked()){wcd=.3;return true}const cat=WALL9.D[id][2],good=w.k=='tool'&&TOOLS8.fits(w.tool,cat),need=good?1:wp=='fist'||w.k=='fist'?3:2,n=(hits.get(k)||0)+1,px=tx*T+T/2,py=ty*T+T/2,col=WALL9.D[id][1];
  wcd=w.cd?w.cd:.25;swing=.15;P.f=px>=P.x?1:-1;hitAt.set(k,performance.now());
  if(n<need){hits.set(k,n);burst(px,py,col,3,90,3);try{MSFX8.play('hit',cat,cat=='wood'?5:cat=='stone'?3:1)}catch(_){}return true}
  hits.delete(k);WALL9.edit(k,0);spawnDrop(px,py,WALL9.key(id),1);burst(px,py,col,10,160,4);burst(px,py,'#fff',3,90,2,'p');shake=Math.max(shake,.03);try{MSFX8.play('break',cat,cat=='wood'?5:cat=='stone'?3:1)}catch(_){}try{G('break');stat('break',1)}catch(_){}return true}
 // ---- house blocks (inventory keys 400-414 = tiles 100-114): the same rules as placing any block
 function placeBlock(key){const id=BLK9.TILE(key);if(!id||cnt(key)<1)return false;const{tx,ty}=cursor();if(tx<1||ty<1||tx>=W-1||ty>=H-1||!inReach(tx,ty))return true;const k=ty*W+tx;if(tiles[k]||trees.has(k))return true;if(locked())return true;
  if(SOLID6[id]&&tx*T<P.x+P.w/2&&(tx+1)*T>P.x-P.w/2&&ty*T<P.y+P.h&&(ty+1)*T>P.y)return true;addI(key,-1);tiles[k]=id;hp[k]=BLK[id][2];pop.set(k,performance.now());pushEdit(k);const px=tx*T+T/2,py=ty*T+T/2;burst(px,py,BLK[id][1],8,90,4);rings.push({x:px,y:py,c:'#fff',t:performance.now()});
  try{snd(240,.09,'square',.06)}catch(_){}try{stat('place',1);G('place')}catch(_){}return true}
 // ---- doors
 function placeDoor(){if(cnt(95)<1)return false;const{tx,ty}=cursor();if(tx<1||ty<2||tx>=W-1||ty>=H-2||!inReach(tx,ty))return true;if(locked())return true;const k=HDOOR9.place(tx,ty);
  if(!k){try{say('A door needs two free tiles with ground under them')}catch(_){}return true}addI(95,-1);const px=tx*T+T/2,py=(k/W|0)*T;burst(px,py,'#c8945e',10,100,4);try{MSFX8.play('hit','wood',5)}catch(_){}try{stat('place',1);G('place')}catch(_){}return true}
 {const _pa=placeAction;placeAction=function(){try{if(!wrench()){const it=held();if(WALL9.isKey(it)){if(placeWall(it))return}else if(BLK9.isKey(it)){if(placeBlock(it))return}else if(it===95||bar[sel]===95){if(placeDoor())return}}}catch(e){console.error('BUILD9 place',e)}return _pa.apply(this,arguments)}}
 {const _uw=useWeapon;useWeapon=function(){try{const it=held();if(WALL9.isKey(it)&&cnt(it)>0){placeWall(it);wcd=.12;return}if(BLK9.isKey(it)&&cnt(it)>0&&!showInv){placeBlock(it);wcd=.15;return}if(it===95&&cnt(95)>0&&!showInv){placeDoor();wcd=.2;return}if(hitWall())return}catch(e){console.error('BUILD9 use',e)}return _uw.apply(this,arguments)}}
 {const _ba=breakAt;breakAt=function(x,y,dmg){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0;
   // a broken house block drops its inventory key (tile + 300), never the tile id (100-199 would read as a seed)
   if(b>=100&&b<=114){const n0=drops.length,r=_ba.apply(this,arguments);for(let i=n0;i<drops.length;i++)if(drops[i].k===b)drops[i].k=b+300;return r}
   if(b!=95&&b!=96)return _ba.apply(this,arguments);if(!canEdit()){locked();return false}
   const kb=b==96?k+W:k;hitAt.set(kb,performance.now());hp[kb]=Math.max(0,hp[kb]-dmg);const px=x*T+T/2,py=(kb/W|0)*T+T/2;
   if(hp[kb]>0){burst(px,py,'#a8784a',4,110,3);try{MSFX8.play('hit','wood',5)}catch(_){}return true}
   if(HDOOR9.breakDoor(kb)){spawnDrop(px,py,95,1);burst(px,py-T/2,'#a8784a',12,170,4);burst(px,py-T/2,'#4a2c16',6,120,3);rings.push({x:px,y:py-T/2,c:'#ffe9c0',t:performance.now()});shake=Math.max(shake,.06);try{MSFX8.play('break','wood',5)}catch(_){}try{stat('break',1);qProgress('break',1)}catch(_){}}return true}}
 {const _it=interact;interact=function(){try{if(!dlgOpen&&!creatorOn&&!showInv&&menuEl.style.display=='none'&&!nearNPC()&&!nearDoor()&&!(OBJ6.near&&OBJ6.near())&&HDOOR9.nearest()>=0){HDOOR9.toggle();return}}catch(_){}return _it.apply(this,arguments)}}
 // ---- crafting recipes (shown at a Crafting Table once you have held every ingredient)
 try{for(const r of[{id:'claybrick',n:'Clay Brick',out:[400,4],in:[[1,2],[8,1]],secs:4,lv:1},{id:'halftimber',n:'Half-Timber Wood Frame',out:[401,4],in:[[5,2],[8,1]],secs:5,lv:2},{id:'mossbrick',n:'Mossy Stone Brick',out:[402,3],in:[[3,2],[2,1]],secs:5,lv:2},
   {id:'woodfloor',n:'Polished Wood Floor',out:[403,4],in:[[5,3]],secs:4,lv:1},{id:'slateroof',n:'Slate Roof Tile',out:[404,4],in:[[3,3]],secs:5,lv:3},{id:'thatch',n:'Thatch Roof',out:[406,4],in:[[2,3]],secs:4,lv:1},{id:'window',n:'Framed Window',out:[407,2],in:[[6,2],[5,1]],secs:5,lv:2},
   {id:'lantern2',n:'Iron Lantern',out:[408,1],in:[[6,1],[72,1]],secs:8,lv:3},{id:'bookshelf',n:'Wooden Bookshelf',out:[409,1],in:[[5,4]],secs:6,lv:3},{id:'fence',n:'Wooden Fence',out:[410,4],in:[[5,2]],secs:3,lv:1},{id:'housedoor',n:'Wooden House Door',out:[95,1],in:[[5,4]],secs:6,lv:1},
   {id:'gravel',n:'Gravel Path',out:[414,4],in:[[3,1],[1,1]],secs:3,lv:1},{id:'wall_oak',n:'Oak Panel Wall',out:[320,4],in:[[5,1]],secs:3,lv:1},{id:'wall_stone',n:'Stone Brick Wall',out:[321,4],in:[[3,1]],secs:3,lv:1},{id:'wall_plaster',n:'Whitewash Plaster Wall',out:[324,4],in:[[8,1],[1,1]],secs:3,lv:1}])if(!RECIPES.some(q=>q.id==r.id))RECIPES.push(r)}catch(e){console.error('BUILD9 recipes',e)}
 // ---- inventory / store category: walls sit with the blocks, the house door with the doors
 {const _c=ITEM7.cat;ITEM7.cat=function(k){if(WALL9.isKey(k)||BLK9.isKey(k))return'block';if(+k===95)return'door';return _c.apply(this,arguments)}}
 {const _cn=ITEM7.catName;ITEM7.catName=function(k){if(WALL9.isKey(k))return'Background wall · click to place';if(BLK9.isKey(k))return'Block · click to place';return _cn.apply(this,arguments)}}
 // ---- icons: the see-through blocks sit on the normal item plate without a black square behind them
 // (house blocks show their tile; the see-through ones without a backing square)
 const SEE=new Set([107,108,110,111,113,95]);
 {const _iu=iconURL;iconURL=function(k){const b=BLK9.TILE(k)||(k===95?95:0);if(!b)return _iu.apply(this,arguments);if(ICON[k])return ICON[k];const S=48,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');try{burstBG(x,S)}catch(_){}
   const sp=spr(b,0,0),rug=b==111;x.save();x.shadowColor='rgba(30,20,55,.35)';x.shadowBlur=SEE.has(b)?3:4;x.shadowOffsetY=2;if(!SEE.has(b)){x.fillStyle='#000';x.fillRect(5,4,38,38)}x.restore();x.save();if(SEE.has(b)){x.shadowColor='rgba(30,20,55,.35)';x.shadowBlur=3;x.shadowOffsetY=2}x.drawImage(sp,rug?2:5,rug?-6:4,rug?44:38,rug?44:38);x.restore();if(!SEE.has(b)){x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1;x.strokeRect(5.5,4.5,37,37)}return ICON[k]=c.toDataURL()}}
 // drops / material panels draw items >= 200 with matIcon: give the house blocks their tile there too
 {const _mi=matIcon;matIcon=function(x,k,S){const b=BLK9.TILE(k);if(!b)return _mi.apply(this,arguments);try{burstBG(x,S)}catch(_){}x.drawImage(spr(b,0,0),S*.12,S*.1,S*.76,S*.76)}}
 // the cursor preview for a held wall / house block (the normal one only knows tiles 1-99)
 {const _dt=drawTarget;drawTarget=function(now){_dt.apply(this,arguments);try{const it=held(),wk=WALL9.isKey(it),bk=BLK9.isKey(it);if((!wk&&!bk)||cnt(it)<1||showInv||menuEl.style.display!='none')return;const{tx,ty}=cursor();if(tx<1||ty<1||tx>=W-1||ty>=H-1||!inReach(tx,ty))return;const k=ty*W+tx;if(wk?WALL9.bw[k]:tiles[k])return;
   const px=tx*T-cam.x,py=ty*T-cam.y,pl=.5+.5*Math.sin(now/260);g.save();g.globalAlpha=.42+.1*pl;g.drawImage(wk?WALL9.sprite(WALL9.idOf(it),0):spr(BLK9.TILE(it),tx,ty),px+2,py+2,T-4,T-4);g.globalAlpha=1;g.strokeStyle='rgba(255,255,255,'+(.5+.3*pl)+')';g.lineWidth=2;g.strokeRect(px+1,py+1,T-2,T-2);g.restore()}catch(_){}}}
 // ---- per-frame hooks: chimney smoke in the world pass (before lighting), campfire crackle
 {const _da=drawAmbient;drawAmbient=function(vw,vh,now,dt){const r=_da.apply(this,arguments);try{if(entered){VILL9.drawFx(vw,vh,now/1000);TREE9.fx(vw,vh,now,dt)}}catch(e){if(!BUILD9.e1){BUILD9.e1=1;console.error('BUILD9 fx',e)}}return r}}
 {const _t=OBJ6.tick;OBJ6.tick=function(dt){_t.call(this,dt);try{VILL9.crackle(dt)}catch(_){}}}
 // ---- lamp glow: one pre-rendered halo instead of a new radial gradient per lamp per frame (villages have several lanterns)
 {let LG=null;drawLampGlow=function(){if(!lampL.length)return;if(!LG){LG=document.createElement('canvas');LG.width=LG.height=128;const x=LG.getContext('2d'),gg=x.createRadialGradient(64,64,1.4,64,64,64);gg.addColorStop(0,'rgba(255,224,138,.42)');gg.addColorStop(1,'rgba(255,224,138,0)');x.fillStyle=gg;x.fillRect(0,0,128,128)}
   g.globalCompositeOperation='lighter';for(let i=0;i<lampL.length&&i<48;i+=2)g.drawImage(LG,lampL[i]-90,lampL[i+1]-90,180,180);g.globalCompositeOperation='source-over'}}
 // ---- frame cost: the HUD rewrote the same texts every few frames (each write = style recalc + layout). Write only real changes.
 try{const tc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent'),ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  const guard=el=>{if(!el||el._g9)return;el._g9=1;Object.defineProperty(el,'textContent',{configurable:true,get(){return tc.get.call(this)},set(v){v=v==null?'':String(v);if(tc.get.call(this)!==v)tc.set.call(this,v)}});
   Object.defineProperty(el,'innerHTML',{configurable:true,get(){return ih.get.call(this)},set(v){v=v==null?'':String(v);if(this._ih9!==v||ih.get.call(this)!==this._ih9n){ih.set.call(this,v);this._ih9=v;this._ih9n=ih.get.call(this)}}})};
  const ids=['pname','gv','wname','wchip','prompt','hudTitle','hudWing','fps'];const run=()=>{for(const i of ids)guard(document.getElementById(i))};run();setTimeout(run,1500);setTimeout(run,6000)}catch(e){console.error('BUILD9 guard',e)}
 return{placeWall,hitWall,placeBlock,placeDoor,hits}})();
