// ===== TOOLLV: the five tools level up from 1 to 10 by doing their own job (a block the tool fits: soft / wood / stone / ore / trees, Buried
// Caches, Crystal Geodes; fish for Bubbles). The wrong tool earns nothing. XP to the next level = 18 * level^1.6 (2,409 XP from 1 to 10, about
// 1,200 dirt blocks for Pip, ~110 ore veins for Glimmer, ~140 fish for Bubbles). Every level pays gems and a perk (faster swing, bonus blocks,
// gem finds, Worm/Glow Bait from soil, Quartz/Amethyst from stone, bigger veins, 2-tap geodes, extra wood, sooner bites, longer bite window,
// rarer fish, double catches) with a REW8 celebration (pillar, confetti, fanfare, flying gems, perk card) and a big rolling level number.
// Tools shine more as they level: plain -> soft glint -> steady glow -> sparkles -> golden aura -> radiant -> RAINBOW at level 10. The shine is
// drawn in hand (pre-rendered glow / star / ray sprites, no shadowBlur, ~10 drawImage calls) and baked into the tool icons (hotbar, inventory,
// cards; animated with a CSS filter on img[src$="#tl8-N"]). Mining with a tool also plays the MSFX8 material sounds and mutes the old generic
// break blip for that hit. Saved per profile in localStorage "rbptool" (missing = every tool at level 1, so old saves load untouched).
// For slot UIs: iconURL('w:<tool>') already carries the shine; TOOLLV.decorate(slotEl,id) adds an animated ring (data-tl8), TOOLLV.badgeUnder /
// TOOLLV.badge(ctx,id,x,y,size,t) paint it on a canvas, TOOLLV.info(id) gives level / XP / perk, and a "rbtoollevel" window event fires on change. =====
const TOOLLV=(()=>{
 const R=Math.random,IDS=['pip','pebble','glimmer','twiggy','bubbles'],TL8=TOOLS8.TL,catOf=TOOLS8.catOf,fits=TOOLS8.fits;
 const MAX=10,need=l=>Math.round(18*Math.pow(l,1.6));
 const TIER=[0,0,1,2,2,3,3,4,4,5,6],TIERN=['Plain','Soft glint','Steady glow','Sparkles','Golden aura','Radiant','Rainbow shine'];
 const GEMS=[0,0,30,45,60,80,100,130,160,200,400],XP={soft:2,wood:2,stone:2,ore:6,vein:4,tree:6,cache:12,geode:20};
 const GOLD='#ffc640',RB=['#ff5f7e','#ffb340','#ffe94a','#6fe38a','#5fb8ff','#b07aff'],HS={pip:0,pebble:.2,glimmer:.4,twiggy:.6,bubbles:.8};
 const hex=g=>'#'+g.map(v=>(v|0).toString(16).padStart(2,'0')).join(''),COL={};for(const id of IDS)COL[id]=hex(TL8[id].g);
 const rgba=(h,a)=>{h=h.replace('#','');return'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 // ---- perks (the formulas below are what the cards promise)
 const spd=l=>.05*(l-1),drop=l=>.04*(l-1),gemCh=l=>l>=5?.08+.03*(l-5):0,VEIN=[0,8,8,10,10,10,12,12,16,16,22],wood=l=>2+(l>=3)+(l>=6)+(l>=9)+(l>=10);
 const worm=l=>l>=4?.03+.006*(l-4):0,glowB=l=>l>=7?.012:0,quartz=l=>l>=4?.03+.006*(l-4):0,amet=l=>l>=7?.01:0;
 const waitM=l=>1-.06*(l-1),bite=l=>.1*(l-1),luck=l=>l>=4?.4+.2*(l-4):0,dbl=l=>l>=5?.03*(l-3):0;
 const PERKS={
  pip:[,,['Quick Scoop','Swings 5% faster · 4% chance of a bonus block'],['Lucky Dirt','Bonus block chance 8%'],['Worm Finder','Dirt, grass and sand can turn up Worm Bait'],['Sparkle Soil','8% of digs turn up gems'],['Deep Scoop','Swings 25% faster · bonus blocks 20%'],['Glow Worms','The soil can hide Glow Bait too'],['Speedy Spade','Swings 35% faster'],['Treasure Sense','Gems from 20% of digs'],['Rainbow Pip','Rainbow shine! Swings 45% faster · bonus blocks 36%']],
  pebble:[,,['Steady Tap','Swings 5% faster · 4% chance of a bonus block'],['Rock Hound','Bonus block chance 8%'],['Quartz Eye','Stone can crack into Quartz Shards'],['Glitter Grit','8% of stones hold gems'],['Heavy Tap','Swings 25% faster · bonus blocks 20%'],['Crystal Ear','Amethyst can turn up in stone'],['Rapid Tapper','Swings 35% faster'],['Gem Cutter','Gems from 20% of stones'],['Rainbow Pebble','Rainbow shine! Swings 45% faster · bonus blocks 36%']],
  glimmer:[,,['Bright Eye','Swings 5% faster · +4% bonus ore'],['Wide Vein','Mines veins of up to 10 blocks'],['Ore Sense','+12% bonus ore'],['Gem Glint','8% of ores hold gems'],['Deep Vein','Veins of up to 12 blocks · swings 25% faster'],['Geode Whisper','Crystal Geodes crack in 2 taps'],['Mother Lode','Veins of up to 16 blocks'],['Prospector','+32% bonus ore · gems from 20% of ores'],['Rainbow Glimmer','Rainbow shine! Veins of up to 22 blocks']],
  twiggy:[,,['Sharp Edge','Swings 5% faster · 4% bonus wood blocks'],['Timber','Trees give 3 extra wood'],['Splitter','Bonus wood blocks 12%'],['Sap Gems','8% of trees drop gems'],['Lumberjack','Trees give 4 extra wood · swings 25% faster'],['Woodland Luck','Gems from 14% of trees'],['Whirlwind Chop','Swings 35% faster'],['Forest Friend','Trees give 5 extra wood'],['Rainbow Twiggy','Rainbow shine! Trees give 6 extra wood']],
  bubbles:[,,['Patient Line','Fish bite 6% sooner'],['Steady Hands','+0.2 s to click when it bites'],['Lucky Lure','Rare fish are more likely'],['Double Hook','6% chance to catch two fish'],['Fish Whisperer','Fish bite 30% sooner'],['Shiny Scales','Rare fish even more likely'],['Big Net','15% chance to catch two'],['Old Salt','Bites 48% sooner · +0.8 s to react'],['Rainbow Bubbles','Rainbow shine! The best luck for legendary fish']]};
 const pc=v=>Math.round(v*100)+'%';
 function summary(id,l){const o=[];if(id=='bubbles'){o.push('Bites '+pc(1-waitM(l))+' sooner');o.push('+'+bite(l).toFixed(1)+' s to react');o.push('Rare-fish luck +'+luck(l).toFixed(1));o.push('Double catch '+pc(dbl(l)));return o}
  o.push('Swing speed +'+pc(spd(l)));if(id=='glimmer'){o.push('Veins up to '+VEIN[l]+' blocks');o.push('Bonus ore 50% + '+pc(drop(l)));o.push('Geodes: '+(l>=7?2:3)+' taps')}
  else if(id=='twiggy'){o.push(wood(l)+' extra wood per tree');o.push('Bonus wood blocks '+pc(drop(l)))}else o.push('Bonus blocks '+pc(drop(l)));
  o.push('Gem finds '+pc(gemCh(l)));if(id=='pip')o.push('Worm Bait '+pc(worm(l))+(l>=7?' · Glow Bait '+pc(glowB(l)):''));if(id=='pebble')o.push('Quartz '+pc(quartz(l))+(l>=7?' · Amethyst '+pc(amet(l)):''));return o}
 // ---- state (per profile)
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbptool';let S={},dirty=0,lastSave=0;const LOG=[];
 function load(){let o=null;try{o=JSON.parse(localStorage.getItem(K())||'null')}catch(_){o=null}S={};
  for(const id of IDS){const q=o&&o.t&&typeof o.t[id]=='object'?o.t[id]:null,l=q?Math.max(1,Math.min(MAX,q.l|0)):1;S[id]={l,x:l>=MAX?0:Math.max(0,Math.min(need(l)-1,q&&+q.x||0)),n:q&&q.n|0||0,tx:q&&+q.tx||0}}}
 function save(){dirty=0;lastSave=performance.now();try{localStorage.setItem(K(),JSON.stringify({v:1,t:S}))}catch(_){}}
 load();
 const lvl=id=>S[id]?S[id].l:1,tier=id=>S[id]?TIER[S[id].l]:0;
 // ---- sprites (pre-rendered once per colour)
 const SP={},memo=(k,f)=>SP[k]||(SP[k]=f()),mkc=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));return c};
 const GLOW=c=>memo('g'+c,()=>mkc(64,64,x=>{const g2=x.createRadialGradient(32,32,0,32,32,32);g2.addColorStop(0,'rgba(255,255,255,.95)');g2.addColorStop(.3,rgba(c,.6));g2.addColorStop(.62,rgba(c,.2));g2.addColorStop(1,rgba(c,0));x.fillStyle=g2;x.fillRect(0,0,64,64)}));
 const STAR=c=>memo('s'+c,()=>mkc(32,32,x=>{x.translate(16,16);const g2=x.createRadialGradient(0,0,0,0,0,8);g2.addColorStop(0,'rgba(255,255,255,.95)');g2.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g2;x.fillRect(-16,-16,32,32);
  x.fillStyle=c;x.beginPath();x.moveTo(0,-15);x.quadraticCurveTo(1.6,-1.6,15,0);x.quadraticCurveTo(1.6,1.6,0,15);x.quadraticCurveTo(-1.6,1.6,-15,0);x.quadraticCurveTo(-1.6,-1.6,0,-15);x.fill();x.fillStyle='#fff';x.beginPath();x.moveTo(0,-6);x.lineTo(1.4,0);x.lineTo(0,6);x.lineTo(-1.4,0);x.fill()}));
 const RAYS=c=>memo('r'+c,()=>mkc(128,128,x=>{x.translate(64,64);const g2=x.createRadialGradient(0,0,4,0,0,64);g2.addColorStop(0,rgba(c,.75));g2.addColorStop(.5,rgba(c,.22));g2.addColorStop(1,rgba(c,0));x.fillStyle=g2;for(let i=0;i<8;i++){const a=i/8*6.2832,w=i%2?.06:.11;x.beginPath();x.moveTo(0,0);x.arc(0,0,64,a-w,a+w);x.closePath();x.fill()}}));
 const HALO=c=>memo('o'+c,()=>mkc(64,64,x=>{const g2=x.createRadialGradient(32,32,0,32,32,32);g2.addColorStop(0,rgba(c,.9));g2.addColorStop(.45,rgba(c,.5));g2.addColorStop(1,rgba(c,0));x.fillStyle=g2;x.fillRect(0,0,64,64)}));
 const HUE=i=>memo('h'+i,()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g2=x.createRadialGradient(32,32,0,32,32,32),h=i*30;g2.addColorStop(0,'rgba(255,255,255,.95)');g2.addColorStop(.3,'hsla('+h+',100%,64%,.62)');g2.addColorStop(.62,'hsla('+h+',100%,60%,.22)');g2.addColorStop(1,'hsla('+h+',100%,60%,0)');x.fillStyle=g2;x.fillRect(0,0,64,64);return c});
 // ---- shine drawing in tool space (origin at the hand, tool along +x, length L)
 function under(x,id,L,t,tr){if(tr<2)return;const cx=L*.66,cy=-1,pul=.88+.12*Math.sin(t*(tr>=5?4.2:2.6)),r=L*(tr>=5?.66:tr>=4?.58:tr>=3?.5:.44)*pul;x.save();if(tr<6){x.globalAlpha=Math.min(.6,.18+.07*tr);x.drawImage(HALO(tr>=4?GOLD:COL[id]||'#ffffff'),cx-r*.8,cy-r*.8,r*1.6,r*1.6)}x.globalCompositeOperation='lighter';
  if(tr>=5){x.save();x.translate(cx,cy);x.rotate(t*.7);x.globalAlpha=.5;x.drawImage(RAYS(tr>=6?RB[((t*1.5)|0)%6]:GOLD),-r*1.2,-r*1.2,r*2.4,r*2.4);x.restore()}
  if(tr>=6){const h=(t*6)%12,i=h|0,f=h-i;x.globalAlpha=.8*(1-f);x.drawImage(HUE(i),cx-r,cy-r,r*2,r*2);x.globalAlpha=.8*f;x.drawImage(HUE((i+1)%12),cx-r,cy-r,r*2,r*2);/* three colours orbit the head so several hues show at once */for(let j=0;j<3;j++){const a=t*2.4+j*2.094,q=r*.62;x.globalAlpha=.7;x.drawImage(HUE((i+4*j+2)%12),cx+Math.cos(a)*r*.5-q/2,cy+Math.sin(a)*r*.38-q/2,q,q)}}
  else{x.globalAlpha=tr>=4?.75:tr>=3?.62:.52;x.drawImage(GLOW(tr>=4?GOLD:COL[id]||'#ffffff'),cx-r,cy-r,r*2,r*2)}x.restore()}
 const NST=[0,0,0,3,4,5,6];
 function over(x,id,L,t,tr){if(tr<1)return;x.save();x.globalCompositeOperation='lighter';const u=(t*.42+(HS[id]||0))%1;
  if(u<.22){const s=u/.22,z=7+tr*1.2;x.globalAlpha=Math.sin(s*Math.PI)*.95;x.drawImage(STAR('#ffffff'),L*(.4+.48*s)-z/2,-4-z/2,z,z)}
  for(let i=0;i<NST[tr];i++){const ph=(t*(.6+.11*i)+i*.37)%1,a=Math.sin(ph*Math.PI);if(a<.06)continue;const px=L*(.34+.58*((i*.618+.1)%1)),py=(((i*.41+.2)%1)-.5)*L*.6,s=(4+7*a)*(tr>=5?1.25:1),
   c=tr>=6?RB[(i+((t*2)|0))%6]:tr>=4?(i%2?'#fff3c0':GOLD):(i%2?'#ffffff':COL[id]||'#ffffff');x.globalAlpha=a;x.drawImage(STAR(c),px-s/2,py-s/2,s,s)}x.restore()}
 // in hand: drawWeapon gets a time t for the held, animated draw; the holster on the back passes 0 on the game canvas (icons: 0 on their own canvas)
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){const tt=t||(typeof g!='undefined'&&x===g?performance.now()/1000:0),tr=tt&&TL8[id]?tier(id):0;if(!tr)return _dw.apply(this,arguments);try{under(x,id,L,tt,tr)}catch(_){}const r=_dw.apply(this,arguments);try{over(x,id,L,tt,tr)}catch(_){}return r}}
 // any tier on any canvas (guide previews)
 function drawTool(x,id,L,t,tr){if(tr==null)tr=tier(id);try{under(x,id,L,t,tr)}catch(_){}const tt=t||.0001,o=S[id];drawWeaponRaw(x,id,L,tt);try{over(x,id,L,t,tr)}catch(_){}}
 function drawWeaponRaw(x,id,L,t){const keep=S[id];S[id]={l:1,x:0};try{drawWeapon(x,id,L,t)}finally{S[id]=keep}}
 // ---- icons: the shine is baked in (re-made on level change) and tagged "#tl8-<tier>" so CSS can animate it
 function iconUnder(x,id,tr){x.save();x.shadowColor='rgba(0,0,0,0)';
  if(tr>=5){x.globalAlpha=.5;x.drawImage(RAYS(tr>=6?'#ff7ac0':'#ffb020'),-8,-7,64,64)}
  if(tr>=6){for(let i=0;i<6;i++){const a=i/6*6.2832;x.globalAlpha=.5;x.drawImage(HALO(RB[i]),24+Math.cos(a)*9-15,25+Math.sin(a)*9-15,30,30)}}
  else if(tr>=2){const r=[0,0,17,19,20,22][tr];x.globalAlpha=[0,0,.5,.62,.72,.85][tr];x.drawImage(HALO(tr>=4?GOLD:COL[id]),24-r,25-r,r*2,r*2)}x.restore()}
 const ICS=[[38,10,8],[10,37,6],[40,33,6],[11,12,5],[29,5,5]];
 function iconOver(x,id,tr,l){x.save();x.shadowColor='rgba(0,0,0,0)';
  if(tr>=4){x.lineWidth=2;let st=rgba(GOLD,.9);if(tr>=6){const g2=x.createLinearGradient(0,0,48,48);RB.forEach((c,i)=>g2.addColorStop(i/5,c));st=g2}x.strokeStyle=st;x.beginPath();if(x.roundRect)x.roundRect(2,2,44,44,8);else x.rect(2,2,44,44);x.stroke()}
  const n=[0,1,1,2,3,4,5][tr];for(let i=0;i<n;i++){const[a,b,s]=ICS[i],c=tr>=6?RB[(i*2)%6]:tr>=4?'#ffb020':tr<=1?'#ffc640':i%2?'#ffc640':COL[id];x.globalAlpha=1;x.drawImage(STAR(c),a-s,b-s,s*2,s*2)}x.globalAlpha=1;
  if(l>=2){const s='Lv'+l;x.font='800 9px '+(typeof FONT!='undefined'?FONT:'sans-serif');const w=x.measureText(s).width+7;x.fillStyle=tr>=6?(()=>{const g2=x.createLinearGradient(46-w,0,46,0);RB.forEach((c,i)=>g2.addColorStop(i/5,c));return g2})():tr>=4?'#e8a21a':'rgba(36,26,58,.88)';
   x.beginPath();if(x.roundRect)x.roundRect(46-w,35,w,11,5.5);else x.rect(46-w,35,w,11);x.fill();x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(s,46-w/2,40.8)}x.restore()}
 {const _iu=iconURL;iconURL=function(k){if(ICON[k])return ICON[k];const id=typeof k=='string'&&k.startsWith('w:')?k.slice(2):'',tr=id&&TL8[id]?tier(id):0;if(!tr)return _iu.apply(this,arguments);
   const Sz=48,c=document.createElement('canvas');c.width=c.height=Sz;const x=c.getContext('2d');try{burstBG(x,Sz)}catch(_){}iconUnder(x,id,tr);x.save();x.translate(22,27);x.rotate(-Math.PI/4);const L=28;x.translate(-L*.4,0);drawWeapon(x,id,L,0);x.restore();iconOver(x,id,tr,lvl(id));
   ICONC[k]=c;return ICON[k]=c.toDataURL()+'#tl8-'+tr}}
 function flush(id){const k='w:'+id;delete ICON[k];delete ICONC[k]}
 // DOM helper for any slot element: data-tl8="<tier>" draws an animated ring (CSS, 89-z-tools.css)
 function decorate(el,k){if(!el)return;const id=String(k||'').replace(/^w:/,''),tr=TL8[id]?tier(id):0;if(tr)el.setAttribute('data-tl8',tr);else el.removeAttribute('data-tl8')}
 // canvas helpers for a square icon area (x,y,size): aura behind, glint / stars / ring / level pip on top
 function badgeUnder(g2,k,x,y,z,t){const id=String(k).replace(/^w:/,''),tr=TL8[id]?tier(id):0;if(tr<2)return;g2.save();g2.globalCompositeOperation='lighter';const r=z*(.5+.06*tr)*(.92+.08*Math.sin((t||0)*3));
  if(tr>=6){const h=((t||0)*6)%12;g2.globalAlpha=.85;g2.drawImage(HUE(h|0),x+z/2-r,y+z/2-r,r*2,r*2)}else{g2.globalAlpha=.7;g2.drawImage(GLOW(tr>=4?GOLD:COL[id]),x+z/2-r,y+z/2-r,r*2,r*2)}g2.restore()}
 function badge(g2,k,x,y,z,t){const id=String(k).replace(/^w:/,''),tr=TL8[id]?tier(id):0;if(!tr)return;t=t||0;g2.save();
  if(tr>=4){g2.lineWidth=Math.max(1.5,z/24);g2.strokeStyle=tr>=6?'hsl('+(((t*120)|0)%360)+',100%,62%)':GOLD;g2.globalAlpha=tr>=6?1:.65+.35*Math.sin(t*3);g2.beginPath();if(g2.roundRect)g2.roundRect(x+1,y+1,z-2,z-2,z/6);else g2.rect(x+1,y+1,z-2,z-2);g2.stroke()}
  g2.globalCompositeOperation='lighter';const u=(t*.42+(HS[id]||0))%1;if(u<.22){const s=u/.22,q=z*.3;g2.globalAlpha=Math.sin(s*Math.PI);g2.drawImage(STAR('#ffffff'),x+z*(.15+.7*s)-q/2,y+z*(.85-.7*s)-q/2,q,q)}
  for(let i=0;i<NST[tr]&&i<ICS.length;i++){const a=Math.sin(((t*(.6+.11*i)+i*.37)%1)*Math.PI),[px,py]=ICS[i],q=z*(.1+.16*a);g2.globalAlpha=a;g2.drawImage(STAR(tr>=6?RB[(i+((t*2)|0))%6]:tr>=4?GOLD:'#ffffff'),x+px/48*z-q/2,y+py/48*z-q/2,q,q)}g2.restore()}
 // ---- sounds: the old generic blip is muted for a tool's own hit; TOOLS8's little tones after the break too (until the break's G() call)
 let U=null,VN=null;const Q={q:0};
 {const _s=snd;snd=function(f){if(Q.q>0&&f!=660&&f!=880)return;return _s.apply(this,arguments)}}
 {const _n=noise;noise=function(){if(Q.q>0)return;return _n.apply(this,arguments)}}
 {const _t=SFX7.tone;SFX7.tone=function(){if(U&&U.mute)return;return _t.apply(this,arguments)}}
 {const _G=G;G=function(){if(U)U.mute=false;return _G.apply(this,arguments)}}
 {const _h=harvest;harvest=function(k){const had=trees.has(k),r=_h.apply(this,arguments);if(U&&U.ph==1){if(had&&!trees.has(k)&&!(typeof FARM9!='undefined'&&FARM9.lastCrop===k))U.tree=k;U.mute=true}return r}}
 {const _ba=breakAt;breakAt=function(x,y,dmg){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0,mine=!!(U&&U.ph==1&&!U.hit&&b),vb=!U&&!!VN&&b&&b==VN.b&&dmg>=100&&performance.now()<VN.until;
   if(!mine&&!vb)return _ba.apply(this,arguments);Q.q++;let r;try{r=_ba.apply(this,arguments)}finally{Q.q--}
   try{const broken=!!r&&!tiles[k];if(mine){const cat=catOf(b);U.hit={x,y,k,b,cat,good:fits(U.tool,cat),r:!!r,broken};U.mute=true;if(r&&!broken&&b==94&&U.tool=='ore'&&lvl(U.id)>=7)hp[k]=Math.min(hp[k],BLK[94][2]/3)}
    else if(broken){const i=VN.i++;try{MSFX8.vein(i,VN.n,b)}catch(_){}addXP('glimmer',XP.vein)}}catch(e){console.error('TOOLLV',e)}return r}}
 function bfs(tx,ty,id,n){const seen=new Set([ty*W+tx]),q=[[tx,ty]],out=[];while(q.length&&out.length<n){const[x,y]=q.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=ny*W+nx;if(nx<1||ny<1||nx>=W-1||ny>=H-1||seen.has(k))continue;seen.add(k);if(tiles[k]==id){out.push([nx,ny]);q.push([nx,ny])}}}return out}
 const fl=(x,y,t,c)=>{try{ft(x,y,t,c)}catch(_){}};
 const gemDrop=(l,x,y)=>{if(R()<gemCh(l)){const n=(l>=9?2:1)+(R()*3|0);spawnDrop(x,y,'gem',n);fl(x,y-30,'+'+n+' gems found','#9ff0ff');return true}return false};
 const bonusBlock=(b,x,y,l,txt)=>{if(R()<drop(l)){spawnDrop(x,y,b==2?1:b,1);fl(x,y-22,txt||'Bonus block!','#ffe9b0')}};
 function perks(id,h,l,px,py){const b=h.b;
  if(id=='pip'){if(b==93)return;bonusBlock(b,px,py,l);if(b==1||b==2||b==8){if(R()<glowB(l)){spawnDrop(px,py,251,1);fl(px,py-34,'Glow Bait!','#7affe0')}else if(R()<worm(l)){spawnDrop(px,py,250,1);fl(px,py-34,'Worm Bait!','#ffb0a0')}}gemDrop(l,px,py)}
  else if(id=='pebble'&&h.cat=='stone'){bonusBlock(b,px,py,l);if(R()<amet(l)){spawnDrop(px,py,263,1);fl(px,py-34,'Amethyst!','#d0b0ff')}else if(R()<quartz(l)){spawnDrop(px,py,262,1);fl(px,py-34,'Quartz Shard!','#eef4ff')}gemDrop(l,px,py)}
  else if(id=='glimmer'&&h.cat=='ore'&&b!=94){bonusBlock(b,px,py,l,'Bonus ore!');gemDrop(l,px,py);const L2=bfs(h.x,h.y,b,VEIN[l]);VN=L2.length?{b,i:0,n:L2.length,until:performance.now()+70*(L2.length+2)+600}:null;
   L2.slice(8).forEach(([vx,vy],i)=>setTimeout(()=>{try{if(tiles[vy*W+vx]==b)breakAt(vx,vy,255)}catch(_){}},70*(9+i)))}
  else if(id=='twiggy'&&h.cat=='wood')bonusBlock(b,px,py,l,'Bonus wood!')}
 function after(u){const l=lvl(u.id);if(typeof wcd=='number'&&wcd>0)wcd/=1+spd(l);
  if(u.tree>=0){try{MSFX8.tree()}catch(_){}if(u.tool=='tree'){const px=(u.tree%W)*T+T/2,py=(u.tree/W|0)*T,ex=wood(l)-2;addXP(u.id,XP.tree);if(ex>0){spawnDrop(px,py,5,ex);fl(px,py-26,'+'+ex+' bonus wood','#e8ffc8')}gemDrop(l,px,py)}return}
  const h=u.hit;if(!h||!h.r)return;if(!h.good){try{MSFX8.wrong(h.cat)}catch(_){}return}
  if(!h.broken){try{MSFX8.play('hit',h.cat,h.b,{pr:h.b==94?1-hp[h.k]/BLK[94][2]:0})}catch(_){}return}
  try{MSFX8.play('break',h.cat,h.b)}catch(_){}if(h.b==70)return;
  addXP(u.id,h.b==94?XP.geode:h.b==93?XP.cache:XP[h.cat]||2);perks(u.id,h,l,h.x*T+T/2,h.y*T+T/2)}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(!(w&&w.k=='tool'&&own[w.id])||w.tool=='rod')return _uw.apply(this,arguments);const u=U={id:w.id,tool:w.tool,ph:1,hit:null,mute:false,tree:-1};
   try{return _uw.apply(this,arguments)}finally{U=null;try{after(u)}catch(e){console.error('TOOLLV',e)}}}}
 // ---- fishing: luck during the catch, double catches, sooner bites and a longer bite window (state changes watched each frame)
 {const F=TOOLS8.FISH,_c=F.click;F.click=function(c){if(F.S.st!='bite')return _c.apply(this,arguments);const l=lvl('bubbles'),B=TOOLS8.BAIT,bk=F.S.bait,o=B[bk]||null,ol=o?o.luck:0,FS=TOOLS8.FISHES,b0={};for(const k in FS)b0[k]=cnt(+k);
   if(luck(l)>0){if(o)o.luck=ol+luck(l);else B[bk]={luck:luck(l),wait:[4,9]}}let r;try{r=_c.apply(this,arguments)}finally{if(o)o.luck=ol;else delete B[bk]}
   try{let got=0;for(const k in FS)if(cnt(+k)>b0[k]){got=+k;break}if(got){const f=FS[got];addXP('bubbles',f.junk?3:12+Math.round(f.p/4));if(!f.junk&&R()<dbl(l)){addI(got,1);fl(P.x,P.y-50,'Double catch! +1 '+f.n,'#bff0ff')}}}catch(e){console.error('TOOLLV fish',e)}return r}}
 let fst='idle';function fishWatch(){const s=TOOLS8.FISH.S;if(s.st===fst)return;const l=lvl('bubbles');if(s.st=='wait')s.t*=waitM(l);else if(s.st=='bite')s.t+=bite(l);fst=s.st}
 // ---- XP and level-ups
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}};
 function addXP(id,n){const s=S[id];if(!s||!(n>0))return;s.n=(s.n|0)+1;s.tx=(s.tx||0)+n;if(s.l>=MAX){dirty=1;chip(id);return}s.x+=n;dirty=1;while(s.l<MAX&&s.x>=need(s.l)){s.x-=need(s.l);s.l++;levelUp(id,s.l)}if(s.l>=MAX)s.x=0;chip(id)}
 const nameOf=id=>TL8[id].n.replace(/ the .*$/,'');
 function levelUp(id,l){flush(id);const g=GEMS[l]|0,nm=nameOf(id),pk=PERKS[id][l],ct=l>=10?5:l>=8?4:l>=6?3:l>=4?2:1;LOG.push({id,l,g});if(LOG.length>30)LOG.shift();
  if(g>0){gems+=g;try{stat('gems',g)}catch(_){}}try{MSFX8.levelup(l)}catch(_){}
  const Rw=typeof REW8!='undefined'?REW8:null;
  if(Rw&&typeof entered!='undefined'&&entered){const x=P.x,y=P.y+P.h,c=l>=10?'#ff5f9e':l>=7?GOLD:COL[id];
   try{Rw.celebrate(x,y,c,{d:l>=10?2.4:1.7,s:l>=10?1.4:1.05,n:l>=10?14:26,sp:l>=10?12:16,w:l>=10?240:170});if(l>=10){Rw.confetti(x,y-20,40,RB);Rw.flash('#ff8ad8',.28);Rw.sparkle(x,y-40,'#ffffff',14,260)}Rw.fan('level');if(g)Rw.fly(x,y-30,g)}catch(_){}
   try{Rw.card({kind:'tool',kick:nm+' reached level '+l,title:pk[0],sub:pk[1],gems:g,tier:ct,icon:'w:'+id,ms:4200+(l>=10?1600:0)})}catch(_){}
   if(TIER[l]!=TIER[l-1])setTimeout(()=>{try{Rw.card({kind:'tool',kick:'New shine unlocked',title:TIERN[TIER[l]],sub:l>=10?nm+' glows with every colour':nm+' shines brighter · press G for the tool guide',tier:Math.min(5,TIER[l]),icon:'w:'+id,ms:3600})}catch(_){}},700)}
  banner(id,l,pk);save();try{renderBar()}catch(_){}try{dispatchEvent(new CustomEvent('rbtoollevel',{detail:{id,l,tier:TIER[l]}}))}catch(_){}try{if(typeof INV7!='undefined'&&INV7.isOpen)INV7.render()}catch(_){}try{if(typeof GUIDE8!='undefined')GUIDE8.refresh()}catch(_){}}
 function banner(id,l,pk){if(typeof document=='undefined')return;let e=document.getElementById('tl8lv');if(!e){e=document.createElement('div');e.id='tl8lv';e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e)}
  e.classList.remove('on','off');e.setAttribute('data-tier',TIER[l]);e.innerHTML='<i class="rw8ray" aria-hidden="true"></i><img class="tl8bi" alt="" src="'+iconURL('w:'+id)+'"><small>'+esc(nameOf(id))+' · tool level</small><div class="rw8num"><span class="rw8roll"><i>'+(l-1)+'</i><i>'+l+'</i></span></div><em><b>'+esc(pk[0])+'</b> '+esc(pk[1])+'</em>';
  void e.offsetWidth;e.classList.add('on');clearTimeout(banner.t);clearTimeout(banner.t2);banner.t=setTimeout(()=>e.classList.add('off'),2700);banner.t2=setTimeout(()=>e.classList.remove('on','off'),3200)}
 // ---- small XP chip above the hotbar while you mine (DOM written at most 8x a second, only when it changed)
 let chEl=null,chId='',chT=0,chD=0,chW=0,chKey='';
 function chip(id){chId=id;chT=performance.now()+1900;chD=1}
 function chipTick(now){if(!chEl&&!chD)return;if(chD&&now-chW>125){chD=0;chW=now;if(!chEl){chEl=document.createElement('div');chEl.id='tl8x';chEl.setAttribute('aria-hidden','true');chEl.innerHTML='<img alt=""><b></b><small></small><span class="tl8b"><i></i></span><em></em>';document.body.appendChild(chEl)}
   const s=S[chId],mx2=s.l>=MAX,key=chId+'|'+s.l+'|'+Math.floor(s.x);if(key!==chKey){chKey=key;const q=a=>chEl.querySelector(a);q('img').src=iconURL('w:'+chId);q('b').textContent=nameOf(chId);q('small').textContent='Lv '+s.l;q('.tl8b i').style.transform='scaleX('+(mx2?1:Math.min(1,s.x/need(s.l))).toFixed(3)+')';q('em').textContent=mx2?'MAX':Math.floor(s.x)+' / '+need(s.l)+' XP';chEl.setAttribute('data-tier',TIER[s.l])}
   if(!chEl.classList.contains('on')){/* beside the hotbar (right side, vertically centred); above it when there is no room */const bar=document.getElementById('bar'),cw=chEl.offsetWidth||230,chh=chEl.offsetHeight||34;let side=false;if(bar){const r=bar.getBoundingClientRect();if(r.height){if(r.right+16+cw<innerWidth-8){side=true;chEl.style.left=Math.round(r.right+14)+'px';chEl.style.bottom=Math.round(innerHeight-r.bottom+(r.height-chh)/2)+'px'}else{chEl.style.left='';chEl.style.bottom=Math.round(innerHeight-r.top+12)+'px'}}}chEl.classList.toggle('side',side);chEl.classList.add('on')}}
  if(chEl&&now>chT&&chEl.classList.contains('on'))chEl.classList.remove('on')}
 // ---- held-tool sparkles in the world (time-based emission, pooled VFX), per frame upkeep
 let em=0;const ER=[0,0,0,1.6,2.6,3.6,6];
 function emit(dt){const w=WPN[wp];if(!w||w.k!='tool'||!entered||red())return;const tr=tier(wp);if(tr<3){em=0;return}let k=1;try{k=Math.min(1.2,Math.max(.25,QM.vfxK))}catch(_){}em+=dt*ER[tr]*k;let n=0;
  while(em>=1&&n<3){em--;n++;const c=tr>=6?RB[(R()*6)|0]:tr>=4?(R()<.6?GOLD:'#fff3c0'):(R()<.5?COL[wp]:'#ffffff');try{VFX.add(1,c,P.x+P.f*(8+R()*16),P.y+P.h*(.32+R()*.28),(R()-.5)*22,-12-R()*26,.6+R()*.5,7+R()*5,1,{g:-6,d:.6,a:.85})}catch(_){}}}
 function tick(dt){const now=performance.now();try{fishWatch()}catch(_){}emit(dt);chipTick(now);if(dirty&&now-lastSave>4000)save()}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('TOOLLV',e)}}}}
 addEventListener('beforeunload',()=>{if(dirty)save()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&dirty)save()});
 // ---- api
 function info(k){const id=String(k).replace(/^w:/,''),s=S[id];if(!s)return null;return{id,l:s.l,x:s.x,need:s.l>=MAX?0:need(s.l),tier:TIER[s.l],tierName:TIERN[TIER[s.l]],perk:s.l>=2?PERKS[id][s.l]:null,next:s.l<MAX?PERKS[id][s.l+1]:null,gemsNext:s.l<MAX?GEMS[s.l+1]:0,summary:summary(id,s.l),uses:s.n|0}}
 function set(id,l,x){if(!S[id])return;S[id].tx=S[id].tx||0;S[id].l=Math.max(1,Math.min(MAX,l|0));S[id].x=x|0;flush(id);save();try{renderBar()}catch(_){}try{dispatchEvent(new CustomEvent('rbtoollevel',{detail:{id,l:S[id].l,tier:TIER[S[id].l]}}))}catch(_){}}
 return{IDS,MAX,need,TIER,TIERN,GEMS,XP,PERKS,VEIN,COL,RB,summary,info,lvl,tier,add:addXP,set,save,reload:()=>{load();for(const id of IDS)flush(id)},get S(){return S},LOG,decorate,badge,badgeUnder,drawTool,under,over,
  cls:k=>{const id=String(k).replace(/^w:/,'');return TL8[id]?'tl8 tl8-t'+tier(id):''},stats:{spd,drop,gemCh,wood,worm,glowB,quartz,amet,waitM,bite,luck,dbl},get U(){return U},get VN(){return VN},K,fishWatch}})();
