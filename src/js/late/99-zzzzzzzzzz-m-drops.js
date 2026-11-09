// ===== DROP2: dropping anything you may give up, as a real object lying in the world. Blocks, materials, weapons, wearables, store wings and charms. Press E beside it to pick it up.
// Rules, the same for everyone: it stays for 15 minutes; anyone nearby can take it; if nobody does it comes back to whoever dropped it, so timing never loses you anything.
// Never droppable: what you are wearing or holding, upgraded weapons, starter tools, level-earned wings, World Locks and quest items.
// Online: the server decides. The item leaves your inventory only when the server says the drop exists (server/economy.js), so lag, double clicks or a disconnect can not duplicate or lose it.
// Offline there is nobody to cheat, and it is saved in your own browser storage (RB_PREFIX+'rbdrops'), this is not presented as security.
// Mob loot is untouched: it stays the magnet-to-you pickups of the 'drops' list. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbdrops',TTL=15*60000;
 const STARTER=new Set(['fist','pip','pebble','glimmer','twiggy','bubbles','wrench']);
 const num=k=>typeof k=='number';
 const netKey=k=>typeof k=='string'&&k.startsWith('wing:')?'id:wing_'+k.slice(5):k;
 const uiKey=i=>typeof i=='string'&&i.startsWith('id:wing_')?'wing:'+i.slice(8):i;
 const tierOf=k=>{try{return k===0?1:INV7.tierOf(k)}catch(_){return 0}};
 const nameOf=k=>{try{return k===0?'Gems':INV7.nameOf(k)}catch(_){return'Item'}};
 const online=()=>{try{return NET7.online&&!!NET7.room}catch(_){return false}};
 const acct=()=>{try{return NET7.online&&!!NET7.auth&&NET7.auth.kind!='guest'}catch(_){return false}};
 const god=()=>{try{return !!CRV8.on}catch(_){return false}};
 const snd2=n=>{try{UIS.play(n)}catch(_){}};
 const tone=(a,b,d,t,v,dl)=>{try{SFX7.tone(a,b,d,t,v,dl)}catch(_){}};
 const inRun=()=>{try{return !!(window.DG&&DG.run)}catch(_){return false}};
 const voided=()=>{try{return !!(typeof WBOSS13!='undefined'&&WBOSS13.void)}catch(_){return false}};
 // ---- what may be dropped, and if not, why
 function can(k){
  if(num(k)){if(!(cnt(k)>0))return{ok:false,why:'You have none'};if(k==17)return{ok:false,why:'A World Lock stays with you'};if(k>=731&&k<=749)return{ok:false,why:'Quest items stay with you'};return{ok:true}}
  if(k.startsWith('w:')){const id=k.slice(2);if(!own[id])return{ok:false,why:'You do not own this'};if(WPN[id]&&WPN[id].ars)return{ok:false,why:'Earned class weapons stay with you'};if(STARTER.has(id))return{ok:false,why:'Starter tools stay with you'};if((typeof wUp!='undefined'&&wUp[id])|0)return{ok:false,why:'Upgraded weapons stay with you'};if(wp==id)return{ok:false,why:'Put it away first'};return{ok:true}}
  if(k[0]=='a'){const id=k.slice(2);if(!ownW[id])return{ok:false,why:'You do not own this'};const w=WEAR[id];if(w&&wear[w.s]==id)return{ok:false,why:'Take it off first'};return{ok:true}}
  if(k.startsWith('wing:')){const id=k.slice(5);let w=null;try{w=wingById(id)}catch(_){}if(!w||w.src!='shop')return{ok:false,why:'Earned wings stay with you'};if(!SHOP7.has('wing_'+id))return{ok:false,why:'You do not own this'};try{if(curWing(lvl).id==id)return{ok:false,why:'Take them off first'}}catch(_){}return{ok:true}}
  if(k.startsWith('id:')){const id=k.slice(3),it=SHOP7.byId.get(id);if(!it||it.stack||!SHOP7.has(id))return{ok:false,why:'You do not own this'};if(SHOP7.equipped(id))return{ok:false,why:'Unequip it first'};return{ok:true}}
  return{ok:false,why:'This can not be dropped'}}
 // ---- taking and giving, for every kind
 function refresh(){try{renderBar()}catch(_){}try{if(INV7.isOpen)INV7.render()}catch(_){}try{save()}catch(_){}}
 function shopKeysFor(cat,ref){try{return SHOP7.items.filter(i=>i.cat==cat&&i.ref==ref).map(i=>i.id)}catch(_){return[]}}
 function take(k,n){n=n||1;if(num(k)){addI(k,-n)}else if(k.startsWith('w:')){const id=k.slice(2);delete own[id];if(wp==id)wp='fist';try{const s=HOTBAR.slotOf(k);if(s>=0)HOTBAR.set(s,null)}catch(_){}for(const s of shopKeysFor('weapons',id))delete SHOP7.st.own[s]}
  else if(k[0]=='a'){const id=k.slice(2);delete ownW[id];for(const s of shopKeysFor('gear',id))delete SHOP7.st.own[s]}
  else if(k.startsWith('wing:')){delete SHOP7.st.own['wing_'+k.slice(5)]}else if(k.startsWith('id:')){delete SHOP7.st.own[k.slice(3)]}
  try{SHOP7.save()}catch(_){}refresh()}
 function give(k,n){n=n||1;if(num(k)){addI(k,n)}else if(k.startsWith('w:')){own[k.slice(2)]=1}else if(k[0]=='a'){ownW[k.slice(2)]=1}else if(k.startsWith('wing:')){SHOP7.st.own['wing_'+k.slice(5)]=1}else if(k.startsWith('id:')){SHOP7.st.own[k.slice(3)]=1}try{SHOP7.save()}catch(_){}refresh()}
 const owns=k=>{try{if(num(k))return false;if(k.startsWith('w:'))return !!own[k.slice(2)];if(k[0]=='a')return !!ownW[k.slice(2)];if(k.startsWith('wing:'))return SHOP7.has('wing_'+k.slice(5));return SHOP7.has(k.slice(3))}catch(_){return false}};
 function gotFx(k,n,x,y){const t=tierOf(k);try{ft(x,y-14,'+'+(n>1?n+' ':'')+nameOf(k),t>=2?REW8.RC[t]:'#fff')}catch(_){}tone(520+t*80,780+t*120,.14,'triangle',.05);if(t>=3)try{const ico=num(k)||k[0]=='w'||k[0]=='a'?k:undefined;REW8.card({kind:'reveal',kick:REW8.RN[t]+' item',title:nameOf(k)+(n>1?' ×'+n:''),tier:t,icon:ico})}catch(e){console.error('DROP2 reveal',e)}}
 // ---- saved local drops
 let LD=[];try{const o=JSON.parse(localStorage.getItem(KEY())||'[]');if(Array.isArray(o))LD=o.filter(d=>d&&d.id&&d.w).map(d=>Object.assign(d,{rest:1,ph:Math.random()*6,tt:9,vy:0,vx:0}))}catch(_){}
 const persist=()=>{try{localStorage.setItem(KEY(),JSON.stringify(LD.map(d=>({id:d.id,i:d.i,n:d.n,x:d.x,y:d.y,w:d.w,t0:d.t0}))))}catch(_){}};
 let nid=0;
 function unclip(d){try{let tx=Math.floor(d.x/T),n=0;while(n++<8&&solidAt(tx,Math.floor(d.y/T)))d.y-=T}catch(_){}}
 function dropLocal(k,n){const front=(P.f||1)*44,tx=Math.floor((P.x+front)/T),ty=Math.floor((P.y+10)/T),x=solidAt(tx,ty)?P.x:P.x+front,d={id:'l'+Date.now().toString(36)+(nid++),i:k,n,x,y:P.y+P.h*.3,w:cur,t0:Date.now(),vy:-320,vx:(P.f||1)*90,ph:Math.random()*6,tt:0,rest:0};unclip(d);LD.push(d);persist();/* the object exists and is saved before the item leaves your bag */take(k,n);landNote(k,n)}
 function landNote(k,n){try{say('Dropped '+(n>1?n+' × ':'')+nameOf(k))}catch(_){}tone(340,170,.18,'triangle',.05)}
 // ---- dropping: the one entry point
 const pend={};
 function drop(k,n){const c=can(k);if(!c.ok){try{say(c.why)}catch(_){}snd2('error');return false}if(inRun()||voided()){try{say('Nothing can be dropped here')}catch(_){}snd2('error');return false}n=num(k)?Math.max(1,Math.min(cnt(k),n|0)):1;
  if(online()){if(!acct()){try{say('Create an account to drop items')}catch(_){}return false}const key=String(k);if(pend[key]&&performance.now()-pend[key]<4000)return false;pend[key]=performance.now();try{ONL10.report(true);sendGear(true)}catch(_){}NET7.send({t:'drop',i:netKey(k),n});return true}
  dropLocal(k,n);return true}
 async function ask(k){const c=can(k);if(!c.ok){try{say(c.why)}catch(_){}snd2('error');return false}let n=1;
  if(num(k)&&cnt(k)>1){const v=await DLG7.open({title:'Drop '+nameOf(k),text:'How many?',fields:[{k:'n',label:'You have '+cnt(k),val:String(cnt(k)),max:5}],ok:'Next'});if(!v)return false;n=Math.floor(+v.n)||0;if(n<1)return false}
  if(!num(k)||tierOf(k)>=2){const v=await DLG7.open({title:'Drop '+nameOf(k)+'?',text:online()?'It will lie on the ground for 15 minutes, and anyone nearby can pick it up. If nobody does, it comes back to you.':'It will lie on the ground for 15 minutes. If you leave it, it comes back to you.',ok:'Drop it',danger:1});if(!v)return false}
  return drop(k,n)}
 // ---- messages from the server
 let gseq=null,lastG='';
 function sendGear(force){if(!acct()||god()||gseq==null)return;const list=[];for(const id in own)if(own[id]&&!STARTER.has(id)&&WPN[id]&&!((typeof wUp!='undefined'&&wUp[id])|0))list.push('w:'+id);for(const id in ownW)if(ownW[id])list.push('a:'+id);list.sort();const s=list.join();if(!force&&s==lastG)return;lastG=s;NET7.send({t:'gear_sync',list,seq:gseq})}
 setInterval(()=>{try{sendGear()}catch(_){}},4000);
 NET7.on('gear',m=>{try{if(m.seq!=null){gseq=m.seq;lastG=''}const d=m.d||{};for(const i in d){const k=uiKey(i),v=d[i]|0;if(v>0){if(!owns(k))give(k,1);if(m.why=='pick')gotFx(k,1,P.x,P.y);else if(m.why=='returned'||m.why=='While you were away')try{say(nameOf(k)+' came back to you')}catch(_){}}else if(v<0){if(owns(k))take(k,1);delete pend[String(k)];if(m.why=='drop')landNote(k,1)}}}catch(e){console.error('DROP2 gear',e)}});
 function bagNote(m){try{const d=m.d||{};for(const i in d){const v=d[i]|0,k=+i;if(m.why=='drop'&&v<0){delete pend[String(k)];landNote(k,-v)}else if(m.why=='pick'&&v>0)gotFx(k,v,P.x,P.y);else if(m.why=='returned'&&v>0)try{say(v+' × '+nameOf(k)+' came back to you')}catch(_){}}}catch(_){}}
 // ---- local physics and expiry
 function step(d,dt){d.tt=(d.tt||0)+dt;const tx=Math.floor(d.x/T);if(d.rest&&!solidAt(tx,Math.floor((d.y+12)/T)))d.rest=0;if(d.rest)return;d.vy+=1500*dt;d.y+=d.vy*dt;if(d.vx){const nx=d.x+d.vx*dt;if(!solidAt(Math.floor(nx/T),Math.floor(d.y/T)))d.x=nx;d.vx*=Math.max(0,1-3*dt)}const ty=Math.floor((d.y+9)/T);if(d.vy>0&&solidAt(Math.floor(d.x/T),ty)){if(d.vy>300)try{burst(d.x,d.y+8,'#fff',3,50,2,'p')}catch(_){}d.y=ty*T-9;d.vy=0;d.rest=1}if(d.y>H*T){d.y=H*T-20;d.rest=1}}
 {const _u=updDrops;updDrops=function(dt){const r=_u.apply(this,arguments);try{for(const d of LD)if(d.w==cur)step(d,dt)}catch(_){}return r}}
 setInterval(()=>{try{if(!LD.length)return;const now=Date.now();let ch=false;for(let i=LD.length-1;i>=0;i--){const d=LD[i];if(now-d.t0<TTL)continue;LD.splice(i,1);ch=true;if(num(d.i)||!owns(d.i)){give(d.i,d.n);try{say(nameOf(d.i)+' came back to you')}catch(_){}}}if(ch)persist()}catch(_){}},5000);
 // ---- how a dropped thing looks: the item, floating and tilting a little; a soft pool of its rarity colour; from Epic up a thin column of light
 const GL={},IM={};
 function glow(t){if(GL[t])return GL[t];const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),col=(()=>{try{return REW8.RC[t]}catch(_){return'#fff'}})(),g2=x.createRadialGradient(48,48,2,48,48,46);g2.addColorStop(0,col+'cc');g2.addColorStop(.45,col+'44');g2.addColorStop(1,col+'00');x.fillStyle=g2;x.fillRect(0,0,96,96);return GL[t]=c}
 function beam(t){const k='b'+t;if(GL[k])return GL[k];const c=document.createElement('canvas');c.width=24;c.height=150;const x=c.getContext('2d'),col=(()=>{try{return REW8.RC[t]}catch(_){return'#fff'}})(),v=x.createLinearGradient(0,150,0,0);v.addColorStop(0,col+'aa');v.addColorStop(1,col+'00');x.fillStyle=v;x.fillRect(9,0,6,150);return GL[k]=c}
 function pic(k){if(num(k)){try{if(!ICONC[k])iconURL(k);return ICONC[k]||null}catch(_){return null}}if(IM[k])return IM[k].complete?IM[k]:null;const im=new Image();try{im.src=INV7.iconOf(k)}catch(_){}IM[k]=im;return null}
 function draw(d,now,k){if(d.w&&d.w!=cur)return;k=k==null?uiKey(d.i):k;const px=d.x-cam.x,py=d.y-cam.y+Math.sin(now/420+d.ph)*3;if(px<-40||px>cv.width/ZM+40)return;const t=tierOf(k);
  if(t>=1&&k!==0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.55+Math.sin(now/600+d.ph)*.15;g.drawImage(glow(t),px-30,py-26,60,60);if(t>=3){g.globalAlpha=.5+Math.sin(now/500+d.ph)*.2;g.drawImage(beam(t),px-9,py-104,18,112)}g.restore()}
  if(k===0){g.save();g.translate(px,py);g.fillStyle='#5fd0ff';g.strokeStyle='#06304a';g.lineWidth=2;g.beginPath();g.moveTo(0,-9);g.lineTo(8,-2);g.lineTo(0,9);g.lineTo(-8,-2);g.closePath();g.fill();g.stroke();g.restore()}
  else{const c=pic(k);if(c){g.save();g.translate(px,py);g.rotate(Math.sin(now/760+d.ph)*.09);g.drawImage(c,-15,-15,30,30);g.restore()}}
  if(d.n>1){g.font='700 11px '+FONT;g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;g.strokeText(d.n,px+8,py+14);g.fillText(d.n,px+8,py+14)}}
 {const _d=drawDrops;drawDrops=function(now){const r=_d.apply(this,arguments);try{if(!voided()){for(const d of LD)draw(d,now);const n=nearest();if(n)label(n.d,now)}}catch(e){console.error('DROP2 draw',e)}return r}}
 // ---- picking up: E beside it. The closest one wins, and it is ready a moment after it lands so you do not grab what you just threw
 function nearest(){if(inRun()||voided())return null;let best=null,bd=76;const net=(()=>{try{return online()?ONL10.drops:[]}catch(_){return[]}})();const look=(a,o)=>{for(const d of a){if(d.w&&d.w!=cur)continue;if((o?d.t:d.tt)<1.1)continue;const q=Math.hypot(P.x-d.x,P.y+30-d.y);if(q<bd){bd=q;best={d,net:o}}}};look(net,1);if(!online())look(LD,0);return best}
 function label(d,now){const k=uiKey(d.i),px=d.x-cam.x,py=d.y-cam.y-30,t=tierOf(k),txt=nameOf(k)+(d.by?'  ·  '+d.by:'');g.save();g.font='700 13px '+FONT;const w=g.measureText(txt).width+52;g.fillStyle='rgba(10,8,22,.86)';g.strokeStyle=(()=>{try{return REW8.RC[t]}catch(_){return'#fff'}})();g.lineWidth=1.2;g.beginPath();g.roundRect(px-w/2,py-14,w,26,8);g.fill();g.stroke();g.fillStyle='#f4d59a';g.fillRect(px-w/2+7,py-8,16,14);g.fillStyle='#1a1020';g.textAlign='center';g.fillText('E',px-w/2+15,py+4);g.fillStyle='#fff8e6';g.textAlign='left';g.fillText(txt,px-w/2+30,py+4);g.restore()}
 function pick(n){const d=n.d,k=uiKey(d.i);if(n.net){if(performance.now()-(d.sent||0)<1200)return;d.sent=performance.now();NET7.send({t:'pick',id:d.id});return}if(!num(k)&&owns(k)){try{say('You already own one of these')}catch(_){}snd2('error');return}const i=LD.indexOf(d);if(i<0)return;LD.splice(i,1);persist();give(k,d.n);gotFx(k,d.n,d.x,d.y)}
 addEventListener('keydown',e=>{try{if((e.key!='e'&&e.key!='E')||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(!entered||dlgOpen||showInv||creatorOn||menuEl.style.display!='none'||window.RB_COVER||(window.DLG7&&DLG7.isOpen))return;const n=nearest();if(!n)return;e.preventDefault();e.stopImmediatePropagation();pick(n)}catch(_){}},true);
 window.DROP2={can,drop,ask,draw,step,unclip,bagNote,netKey,uiKey,TTL,get local(){return LD},nearest,sendGear,get gseq(){return gseq}};
})()}catch(e){console.error('DROP2',e)}
