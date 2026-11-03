// ===== ONL10: the online game on top of NET7. Owner chat commands (/god /pull /summon /ban /give ...), the bag report, server-run trades (wrench a
// player, or /trade), items dropped for others, the world + realm picker, the worlds you own (5 at most) and the "hide other players' effects" setting.
// This file only shows things and asks: the server (server/server.js, server/economy.js) checks every command, trade, drop and world change. =====
const ONL10=(()=>{
 const esc=DLG7.esc,snd=n=>{try{UIS.play(n)}catch(_){}},live=()=>NET7.online&&!!NET7.room,acct=()=>NET7.online&&!!NET7.auth&&NET7.auth.kind!='guest';
 const nm=i=>i===0?'Gems':iname(i),god=()=>{try{return !!CRV8.on}catch(_){return false}};
 const stop=el=>{for(const x of el.querySelectorAll('input,select'))x.addEventListener('keydown',e=>e.stopPropagation())};
 // ---- item names: a number, "gems", or a name with _ for spaces (iron_ore, oak_seed)
 function itemId(s){s=String(s||'').toLowerCase().replace(/[_-]+/g,' ').trim();if(!s)return null;if(/^\d+$/.test(s))return +s;if(s=='gem'||s=='gems')return 0;const L=[];for(const k in BLK){const i=+k;if(i>0&&i<100)L.push(i,i+100)}for(const k in MAT)L.push(+k);
  const n=i=>iname(i).toLowerCase();return L.find(i=>n(i)==s)??L.find(i=>n(i).startsWith(s))??null}
 // ---- owner commands: the server answers "Not authorized" to everyone else
 async function adm(op,data){if(!NET7.online){say('Connect to the server first');return}const r=await TOOLS7.req(op,data);say(r.ok?(r.m||'Done'):r.m=='Not authorized'?'Only the server owner can do that':(r.m||'That did not work'))}
 const OWNER={
  '/god':a=>adm('god',a[1]=='on'?{on:true}:a[1]=='off'?{on:false}:{}),
  '/pull':a=>a[1]?adm('pull',{who:a[1]}):say('Usage: /pull name'),
  '/summon':a=>a[1]?adm('summon',{who:a[1]}):say('Usage: /summon name'),
  '/ban':a=>{if(!a[1])return say('Usage: /ban name [minutes] [reason]');const m=/^\d+$/.test(a[2]||'');return adm('ban',{who:a[1],mins:m?+a[2]:0,reason:a.slice(m?3:2).join(' ')})},
  '/unban':a=>a[1]?adm('unban',{who:a[1]}):say('Usage: /unban name'),
  '/kick':a=>a[1]?adm('kick',{who:a[1]}):say('Usage: /kick name'),
  '/smute':a=>a[1]?adm('mute',{who:a[1],mins:+a[2]||10}):say('Usage: /smute name [minutes]'),
  '/sunmute':a=>a[1]?adm('unmute',{who:a[1]}):say('Usage: /sunmute name'),
  '/announce':a=>a[1]?adm('announce',{text:a.slice(1).join(' '),scope:'all'}):say('Usage: /announce message'),
  '/give':a=>{if(!a[1]||!a[2])return say('Usage: /give name item [amount]  (item: gems, a number or a name like iron_ore)');const i=itemId(a[2]);if(i==null)return say('No item called '+a[2]);return adm('give',{who:a[1]=='me'&&NET7.auth?NET7.auth.name:a[1],item:i,n:Math.max(1,Math.floor(+a[3]||1))})}};
 const HELP2='Online: wrench a player (V) or /trade name [give n want n]  ·  /drop item [n]  ·  place a World Lock to claim a world  ·  owner: /god /pull /summon /ban /unban /give /kick /smute /announce';
 {const _c=SOC6.cmd;SOC6.cmd=function(t){const a=String(t).trim().split(/\s+/),c=a[0].toLowerCase();
   if(OWNER[c]){OWNER[c](a);return true}
   if(c=='/help'||c=='/?'){const r=_c.apply(this,arguments);say(HELP2);return r}
   if(c=='/drop'){const i=itemId(a[1]);if(i==null||!live())say(live()?'Usage: /drop item [amount]':'Dropping for others needs a server');else drop(i,Math.max(1,Math.floor(+a[2]||1)));return true}
   if(c=='/trade'&&live()){typed(a);return true}
   return _c.apply(this,arguments)}}
 // ---- the bag: tell the server what this client holds (it limits growth); changes the server makes arrive as 'bag'
 let seq=0,last='';
 function report(force){if(!acct()||god())return;const o={};for(const k in inv){const i=+k,n=cnt(i);if(Number.isInteger(i)&&i>0&&i<=999&&n>0)o[k]=n}const s=JSON.stringify(o);if(!force&&s==last)return;last=s;NET7.send({t:'bag_sync',inv:o,seq})}
 setInterval(report,4000);
 NET7.on('bag',m=>{if(m.seq!=null)seq=m.seq;const d=m.d||{};for(const k in d){const i=+k,n=d[k]|0;if(!n)continue;if(i===0)gems=Math.max(0,(gems|0)+n);else if(n>0)addI(i,n);else{const c=cnt(i);if(c>0)addI(i,-Math.min(c,-n))}
   if(n>0&&m.why!='trade'){try{ft(P.x,P.y-14,'+'+n+' '+nm(i),'#fff')}catch(_){}}if(n>0&&m.why=='gift')say('The server owner gave you '+n+' '+nm(i))}
  last='';try{barDirty=1;renderBar()}catch(_){}try{if(INV7.isOpen)INV7.render()}catch(_){}report()});
 NET7.on('god',m=>{try{m.on?CRV8.enable():CRV8.disable()}catch(e){console.error(e)}});
 // ---- world ownership on this client: a world without a lock still belongs to its owner
 {const _ce=canEdit;canEdit=function(){if(cur!='plaza'&&NET7.world){if(god()&&NET7.owner)return true;if(!meta&&window.RB_OWN&&RB_OWN.o)return RB_OWN.o==myId}return _ce.apply(this,arguments)}}
 NET7.on('own',m=>{const d=m.d||{};window.RB_OWN=d.o?{o:d.o,on:d.on}:null;if(d.clearLock){meta=null;delete edits.m}});
 // ---- trades
 let TR=null,tEl=null;
 const offerRow=(x,mine)=>'<div class="trow10"'+(mine?' data-rm="'+x[0]+'"':'')+'><span>'+esc(nm(x[0]))+'</span><b>× '+x[1]+'</b>'+(mine?'<i aria-hidden="true">✕</i>':'')+'</div>';
 function tOpen(){if(tEl)return tEl;tEl=document.createElement('div');tEl.id='trade10';tEl.setAttribute('role','dialog');tEl.setAttribute('aria-label','Trade');document.body.appendChild(tEl);
  tEl.addEventListener('click',e=>{if(!TR)return;const b=e.target.closest('[data-tr]'),r=e.target.closest('[data-rm]');
   if(r&&TR.me){const i=+r.dataset.rm;NET7.send({t:'trade',op:'set',id:TR.id,it:TR.me.it.filter(x=>x[0]!==i)});return}if(!b)return;const a=b.dataset.tr;
   if(a=='accept'){NET7.send({t:'trade',op:'accept',id:TR.id});snd('select')}else if(a=='cancel')NET7.send({t:'trade',op:'cancel',id:TR.id});
   else if(a=='add'){const i=+tEl.querySelector('#tr10i').value,n=Math.floor(+tEl.querySelector('#tr10n').value)||0;if(!(n>0))return say('How many?');const it=TR.me.it.filter(x=>x[0]!==i);it.push([i,n]);report(true);NET7.send({t:'trade',op:'set',id:TR.id,it});snd('select')}
   else if(a=='lock')NET7.send({t:'trade',op:'lock',id:TR.id,on:TR.me.lock?0:1});else if(a=='confirm')NET7.send({t:'trade',op:'confirm',id:TR.id})});return tEl}
 function tClose(){TR=null;if(tEl)tEl.style.display='none'}
 function tRender(){const e=tOpen();e.style.display='flex';let h='<div class="card10"><header><b>Trade with '+esc(TR.name)+'</b><button data-tr="cancel" aria-label="Close">✕</button></header>';
  if(TR.st=='ask'){const f=x=>x?x[1]+' × '+esc(nm(x[0])):'';h+='<p>'+esc(TR.name)+' wants to trade with you.'+(TR.give?' They offer <b>'+f(TR.give)+'</b>':'')+(TR.want?' and want <b>'+f(TR.want)+'</b>':'')+'</p><p class="note10">Nothing changes until both of you confirm.</p><footer><button class="btn" data-tr="accept">Open the trade</button><button class="btn ghost" data-tr="cancel">Decline</button></footer></div>';e.innerHTML=h;return}
  if(TR.st=='asked'){h+='<p>Waiting for '+esc(TR.name)+' to answer…</p><footer><button class="btn ghost" data-tr="cancel">Cancel</button></footer></div>';e.innerHTML=h;return}
  const keep=(id,d)=>{const x=e.querySelector('#'+id);return x?x.value:d},si=keep('tr10i',''),sn=keep('tr10n','1');const keys=Object.keys(inv).map(Number).filter(k=>k>0&&k<=999&&cnt(k)>0).sort((a,b)=>nm(a).localeCompare(nm(b)));
  h+='<div class="cols10"><section'+(TR.me.lock?' class="locked10"':'')+'><h4>You give'+(TR.me.ok?' · confirmed':TR.me.lock?' · locked':'')+'</h4>'+(TR.me.it.map(x=>offerRow(x,!TR.me.lock)).join('')||'<p class="note10">Nothing yet</p>')+'</section><section'+(TR.them.lock?' class="locked10"':'')+'><h4>'+esc(TR.name)+' gives'+(TR.them.ok?' · confirmed':TR.them.lock?' · locked':'')+'</h4>'+(TR.them.it.map(x=>offerRow(x,false)).join('')||'<p class="note10">Nothing yet</p>')+'</section></div>';
  if(!TR.me.lock)h+='<div class="add10"><select id="tr10i" aria-label="Item"><option value="0">Gems ('+(gems|0)+')</option>'+keys.map(k=>'<option value="'+k+'">'+esc(nm(k))+' ('+cnt(k)+')</option>').join('')+'</select><input id="tr10n" type="number" min="1" value="1" aria-label="Amount"><button class="btn ghost" data-tr="add">Add</button></div>';
  const both=TR.me.lock&&TR.them.lock;h+='<footer><button class="btn'+(TR.me.lock?' ghost':'')+'" data-tr="lock">'+(TR.me.lock?'Unlock':'Lock in my offer')+'</button><button class="btn" data-tr="confirm"'+(both&&!TR.me.ok?'':' disabled')+'>'+(TR.me.ok?'Waiting for '+esc(TR.name):'Confirm trade')+'</button><button class="btn ghost" data-tr="cancel">Cancel</button></footer><p class="note10">Changing an offer unlocks both sides. In-game items only.</p></div>';
  e.innerHTML=h;stop(e);const x=e.querySelector('#tr10i');if(x){if(si&&[...x.options].some(o=>o.value==si))x.value=si;e.querySelector('#tr10n').value=sn}}
 NET7.on('trade',m=>{const op=m.op;if(op=='err'){say(m.m||'Trade problem');return}
  if(op=='ask'){if(typeof WBOSS13!='undefined'&&WBOSS13.void){NET7.send({t:'trade',op:'cancel',id:m.id});return}TR={st:'ask',id:m.id,name:m.name,give:m.give,want:m.want};snd('open');tRender();return}if(op=='asked'){TR={st:'asked',id:m.id,name:m.name};tRender();return}
  if(op=='state'){TR={st:'on',id:m.id,name:m.name,me:m.me,them:m.them};tRender();return}
  if(op=='closed'){const was=TR;tClose();if(m.done){say('Trade complete');snd('buy')}else if(was)say(m.why||'Trade closed')}});
 function ask(sid,give,want){if(!live())return say('Trading needs a server');if(!acct())return say('Create an account to trade');report(true);NET7.send({t:'trade',op:'ask',to:sid,give:give||undefined,want:want||undefined})}
 // /trade name  or  /trade name giveItem n wantItem n
 function typed(a){const p=SOC6.byName(a[1]);if(!p)return say(a[1]?'That player is not in this world':'Usage: /trade name [giveItem n wantItem n]  (id 0 = gems)');if(a.length<3)return ask(p.peer);
  const gi=itemId(a[2]),gn=+a[3],wi=itemId(a[4]),wn=+a[5];if(gi==null||wi==null||!(gn>=1)||!(wn>=1))return say('Usage: /trade name giveItem n wantItem n  (id 0 = gems)');ask(p.peer,[gi,Math.floor(gn)],[wi,Math.floor(wn)])}
 // ---- the wrench tool (TOOLS8 calls this on click, key V holds it): a player opens their card, a World Lock its settings
 let pEl=null;
 function card(p){const q=p.presence;if(!pEl){pEl=document.createElement('div');pEl.id='pcard10';pEl.setAttribute('role','dialog');document.body.appendChild(pEl)}const o=NET7.owner;
  const blocked=n=>{try{return X6.mute.includes(String(n).toLowerCase())}catch(_){return false}};
  pEl.innerHTML='<header><b>'+esc(q.n)+'</b><small>Level '+(q.lv|0)+'</small><button data-pc="x" aria-label="Close">✕</button></header><div class="pcb10"><button class="btn" data-pc="trade">Trade</button><button class="btn ghost" data-pc="friend">Add friend</button><button class="btn ghost" data-pc="block">'+(blocked(q.n)?'Unblock':'Block')+'</button><button class="btn ghost" data-pc="report">Report…</button>'+(o?'<button class="btn ghost" data-pc="pull">Pull</button><button class="btn ghost" data-pc="give">Give…</button><button class="btn ghost" data-pc="kick">Kick</button><button class="btn ghost" data-pc="ban">Ban…</button>':'')+'</div>';pEl.style.display='block';
  pEl.onclick=async e=>{const b=e.target.closest('[data-pc]');if(!b)return;const a=b.dataset.pc;pEl.style.display='none';
   if(a=='block'){SOC6.cmd((blocked(q.n)?'/unblock ':'/block ')+q.n);return}
   if(a=='report'){const v=await DLG7.open({title:'Report '+q.n,text:'The server owner will see this and what '+q.n+' recently said in this world.',fields:[{k:'why',label:'What happened?',max:160}],ok:'Send report'});if(v&&v.why&&v.why.trim()){try{NET7.send({t:'report',who:q.n,why:v.why})}catch(_){}}return}
   if(a=='trade')ask(p.peer);else if(a=='friend')SOC6.cmd('/friend '+q.n);else if(a=='pull')adm('pull',{who:p.peer});else if(a=='kick')adm('kick',{who:p.peer});
   else if(a=='give'){const v=await DLG7.open({title:'Give '+q.n,fields:[{k:'i',label:'Item (gems, a number or a name like iron_ore)',max:40},{k:'n',label:'Amount',val:'1',max:6}],ok:'Give'});if(v){const i=itemId(v.i);if(i==null)say('No such item');else adm('give',{who:p.peer,item:i,n:Math.max(1,Math.floor(+v.n||1))})}}
   else if(a=='ban'){const v=await DLG7.open({title:'Ban '+q.n,fields:[{k:'m',label:'Minutes (empty = until you unban)',max:6},{k:'r',label:'Reason',max:80}],ok:'Ban',danger:1});if(v)adm('ban',{who:p.peer,mins:+v.m||0,reason:v.r})}}}
 function wrenchAt(c){if(!rm){say('The wrench is for other players: join a server');return}let best=null,bd=1e9;for(const p of SOC6.peers()){const r=rp[p.peer]||p.presence;if(!r||!(Math.abs(r.x-c.x)<34&&c.y>r.y-14&&c.y<r.y+70))continue;const d=Math.hypot(r.x-c.x,r.y+28-c.y);if(d<bd){bd=d;best=p}}
  if(best){snd('open');return card(best)}try{if(wrench())return}catch(_){}say('Point the wrench at a player')}
 let lastHand='';addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'||e.target.tagName=='TEXTAREA'||menuEl.style.display!='none'||!entered||e.repeat)return;if(e.key.toLowerCase()!='v')return;if(wp=='wrench')wp=lastHand&&WPN[lastHand]?lastHand:'fist';else{lastHand=wp;wp='wrench';say('Wrench: click a player to trade')}snd('select')});
 // ---- items dropped for others (the server owns them; the first player to reach one gets it)
 const ND=[];
 const addD=(d,old)=>{if(ND.some(x=>x.id==d.id))return;ND.push({id:d.id,i:d.i,n:d.n,x:d.x,y:d.y,vy:old?0:-220,ph:Math.random()*6,t:old?9:0,sent:0,rest:0})};
 NET7.onHello(d=>{ND.length=0;for(const x of d.dr||[])addD(x,1);try{renderWorlds()}catch(_){}});
 NET7.on('dr+',m=>addD(m.d));NET7.on('dr-',m=>{const i=ND.findIndex(x=>x.id==m.d.id);if(i>=0){const d=ND[i];ND.splice(i,1);try{burst(d.x,d.y,d.i===0?'#7ee8ff':'#fff',4,60,3,'p')}catch(_){}}});
 {const _u=updDrops;updDrops=function(dt){const r=_u.apply(this,arguments);if(!NET7.room){ND.length=0;return r}if(typeof WBOSS13!='undefined'&&WBOSS13.void)return r;const now=performance.now();for(const d of ND){d.t+=dt;const tx=Math.floor(d.x/T);
    if(d.rest&&!solidAt(tx,Math.floor((d.y+12)/T)))d.rest=0;if(!d.rest){d.vy+=1500*dt;d.y+=d.vy*dt;const ty=Math.floor((d.y+9)/T);if(d.vy>0&&solidAt(tx,ty)){d.y=ty*T-9;d.vy=0;d.rest=1}if(d.y>H*T){d.y=H*T-20;d.rest=1}}
    if(d.t>1.6&&now-d.sent>1500&&Math.hypot(P.x-d.x,P.y+30-d.y)<44){d.sent=now;NET7.send({t:'pick',id:d.id})}}return r}}
 {const _d=drawDrops;drawDrops=function(now){const r=_d.apply(this,arguments);if(typeof WBOSS13!='undefined'&&WBOSS13.void)return r;for(const d of ND){const px=d.x-cam.x,py=d.y-cam.y+Math.sin(now/260+d.ph)*2.5;if(px<-30||px>cv.width/ZM+30)continue;
    if(d.i===0){g.save();g.translate(px,py);g.fillStyle='#5fd0ff';g.strokeStyle='#06304a';g.lineWidth=2;g.beginPath();g.moveTo(0,-9);g.lineTo(8,-2);g.lineTo(0,9);g.lineTo(-8,-2);g.closePath();g.fill();g.stroke();g.restore()}
    else{try{if(!ICONC[d.i])iconURL(d.i);const c=ICONC[d.i];if(c)g.drawImage(c,px-11,py-11,22,22)}catch(_){}}
    if(d.n>1){g.font='700 11px '+FONT;g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;g.strokeText(d.n,px+6,py+12);g.fillText(d.n,px+6,py+12)}}return r}}
 function drop(k,n){if(!live())return false;if(typeof WBOSS13!='undefined'&&WBOSS13.void){say('Nothing can be dropped in the void');return true}if(!acct()){say('Create an account to drop items');return true}report(true);NET7.send({t:'drop',i:k,n});say('Dropped '+n+' × '+nm(k));snd('close');return true}
 // ---- hide other players' effects: their auras, wings and sparkles are simply not drawn (their character still is)
 const hideFx=()=>{try{return !!cel.opt.hideFx}catch(_){return false}};
 window.RBFXQ=q=>{if(!hideFx())return q;const c=q&&q.cx?Object.assign({},q.cx,{w:-1,a:0,fx:{au:'',ch:'',ws:''}}):q&&q.cx;return Object.assign({},q,{cx:c,wing:'',wo:0,fm:0})};
 // ---- menu: realm picker + the worlds you own
 let mine={list:[],max:5};NET7.on('myworlds',m=>{mine={list:m.list||[],max:m.max};try{renderWorlds()}catch(_){}});
 function baseNow(){try{const b=entered&&cur!='plaza'?(WORD9.stageOf(cur)?WORD9.baseOf(cur):cur):(recents().find(n=>n!='plaza'&&!WORD9.stageOf(n))||'');return b}catch(_){return''}}
 // a realm is open once you solved the word of the realm before it (or have been inside it); god mode opens them all
 function realmState(b,i){const n=WORD9.stName(b,i),st=WORD9.state.w,c=WORD9.CH[i];if(i==0)return{n,open:true,lv:0};const prev=st[WORD9.stName(b,i-1)];const seen=!!st[n];const open=god()||seen||!!(prev&&prev.ok);return{n,open,lv:c.lv,tooLow:(lvl|0)<c.lv,prevName:i==1?'this world':WORD9.CH[i-1].t}}
 function panels(){const m=$('mworlds'),h3=$('wlive')&&$('wlive').previousElementSibling;if(!m||!h3)return;let r=$('wrealm');if(!r){r=document.createElement('div');r.id='wrealm';h3.parentNode.insertBefore(r,h3);const o=document.createElement('div');o.id='wmine';h3.parentNode.insertBefore(o,h3)}
  const b=baseNow();if(!b)r.innerHTML='<h3>Realms</h3><div class="rb-empty">Enter a world first, then its realms show here.</div>';
  else{let rows='';for(let i=0;i<5;i++){const s=realmState(b,i),t=i?WORD9.CH[i].t:'Base world',why=!s.open?'Locked · solve the word of '+s.prevName:s.tooLow?'Locked · reach level '+s.lv:i?'Level '+s.lv+'+':'';rows+='<div class="wr rl10'+(s.open&&!s.tooLow?'':' lock10')+(cur==s.n?' here10':'')+'" data-rl="'+esc(s.n)+'" data-why="'+esc(why)+'"><span><b>'+esc(t)+'</b><br><small>'+esc(why||WORD9.label(s.n))+'</small></span><span>'+(s.open&&!s.tooLow?(cur==s.n?'here':''):'<i aria-label="Locked">🔒</i>')+'</span></div>'}
   r.innerHTML='<h3>Realms of '+esc(WORD9.label(b))+'</h3>'+rows;for(const e of r.querySelectorAll('.rl10'))e.onclick=()=>{if(e.classList.contains('lock10')){say(e.dataset.why);snd('error');return}enterWorld(e.dataset.rl)}}
  const o=$('wmine');if(!acct()){o.innerHTML='';return}const lim=mine.max?mine.list.length+' of '+mine.max:mine.list.length+'';
  o.innerHTML='<h3>Worlds you own ('+lim+')</h3>'+(mine.list.map(w=>'<div class="wr mine10" data-mw="'+esc(w.id)+'"><span><b>'+esc(w.id)+'</b>'+(w.pop?'<br><small>'+w.pop+' here</small>':'')+'</span><button class="btn ghost" data-rel="'+esc(w.id)+'">Release</button></div>').join('')||'<div class="rb-empty">None yet. Type a new name above to make your first world.</div>');
  for(const e of o.querySelectorAll('.mine10'))e.onclick=async ev=>{const rel=ev.target.closest('[data-rel]');if(!rel)return enterWorld(e.dataset.mw);if(await DLG7.confirm('Release “'+rel.dataset.rel+'”?','It stays saved, but it is no longer yours: your World Lock comes back to your bag, and anyone can lock the world.','Release'))NET7.send({t:'world_release',w:rel.dataset.rel})}}
 {const _r=renderWorlds;renderWorlds=function(){const r=_r.apply(this,arguments);try{panels()}catch(e){console.error('ONL10 panels',e)}return r}}
 // a World Lock claims the world, so tell the player here if the server would refuse it, before the lock leaves their hands
 function lockBlock(){if(!live())return false;let m='';if(!acct())m='Create an account to lock a world';else{try{if(WORD9.stageOf(cur))m='A realm belongs to its base world: place your lock there'}catch(_){}if(!m&&window.RB_OWN&&RB_OWN.o&&RB_OWN.o!=myId)m='This world belongs to '+RB_OWN.on;if(!m&&!NET7.owner&&mine.max&&mine.list.length>=mine.max&&!(window.RB_OWN&&RB_OWN.o==myId))m='You already own '+mine.max+' worlds. Release one first'}if(m){say(m);return true}return false}
 return{drop,lockBlock,wrench:wrenchAt,ask,realmState,itemId,report,get trade(){return TR},get drops(){return ND},get seq(){return seq},get mine(){return mine}}})();
