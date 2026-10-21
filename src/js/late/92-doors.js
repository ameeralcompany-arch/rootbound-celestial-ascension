// ===== V6 doors / portals / interaction / configuration UI =====
const DOORS6=(()=>{
 let busy=0,hist=[],fade=null,ui=null,uiK=-1;
 const mk=()=>{if(!fade){fade=document.createElement('div');fade.id='objfade';document.body.appendChild(fade);ui=document.createElement('div');ui.id='objui';document.body.appendChild(ui)}};
 const roleName=['Everyone','Trusted & up','Builders & owner','Owner only'];
 function cancel(){busy=0;if(fade)fade.classList.remove('on')}
 // loop / spam guard: more than 4 world transitions in 10s are refused
 function loopOK(){const t=performance.now();hist=hist.filter(x=>t-x<10000);if(hist.length>=4){say('The gates fizzle... too many jumps, wait a moment');return false}hist.push(t);return true}
 function find(label,exceptK){for(const k in OBJ){const o=OBJ[k];if(+k==exceptK)continue;if((o.t==32||ODEF[o.t].cat=='door')&&(o.c.lb||'')==label&&label)return +k}return -1}
 function tpTo(k){const x=k%W*T+T/2,y=(k/W|0)*T+T;P.x=x;P.y=y-P.h-1;P.vx=0;P.vy=0}
 function check(o){const d=ODEF[o.t];if(!OBJ6.canUse(o,myId)){return 'Access: '+roleName[OBJ6.need(o)]}
  if(o.c.lv&&lvl<o.c.lv)return 'Requires level '+o.c.lv;
  if(o.c.kr&&cnt(230)<1)return 'Needs a Gate Key';
  if(o.c.sw){let on=false;for(const k in OBJ)if(OBJ[k].t==30||OBJ[k].t==31)if(OBJ[k].s.on)on=true;if(!on)return 'The gate is unpowered (flip a lever)'}
  return ''}
 function go(k,o){const c=o.c,d=ODEF[o.t];
  if(c.dt=='l'){const t=find(c.lb,k);if(t<0){say('This gate leads nowhere (no linked gate "'+c.lb+'")');OBJ6.sfx('bad');return}return transit(()=>tpTo(t),d)}
  if(c.dt=='s'){return transit(()=>{const sp=OBJ6.spawnPoint()||{x:(W/2)*T,y:(sh(W/2)-3)*T};P.x=sp.x;P.y=sp.y;P.vx=P.vy=0},d)}
  const dest=String(c.d||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);if(!dest){say('This gate has no destination');return}
  if(dest==cur){return transit(()=>{const sp=OBJ6.spawnPoint()||{x:(W/2)*T,y:(sh(W/2)-3)*T};P.x=sp.x;P.y=sp.y;P.vx=P.vy=0},d)}
  if(!loopOK())return;
  if(rm&&!rm.isHost){} // guests leave the room when travelling; see README
  transit(()=>{try{enterWorld(dest)}catch(e){say('Could not open that world');console.error(e)}},d,true)}
 function transit(fn,d,far){if(busy)return;busy=1;mk();const portal=d.tr=='portal'||far;fade.style.background=d.rare?'radial-gradient(circle,#fff,#ffd36a 30%,#120a24 75%)':portal?'':'#000';fade.classList.add('on');try{VFX.wave(P.x,P.y+P.h/2,d.th,90,.6,.5)}catch(_){}
  setTimeout(()=>{try{fn()}catch(e){console.error(e)}setTimeout(()=>{fade.classList.remove('on');busy=0},far?500:250)},380)}
 function use(k){const o=OBJ[k];if(!o)return;const d=ODEF[o.t];
  if(d.cat=='door'){if(busy)return;const why=check(o);if(why){say(why);OBJ6.sfx('lock');VFX.wave(k%W*T+T/2,(k/W|0)*T+T-30,'#ff6a6a',30,.2,.3);return}
   if(o.c.kr&&o.c.kc){addI(230,-1);say('Used a Gate Key')}
   OBJ6.setState(k,{open:1});OBJ6.feedback(o,k,true);go(k,o);return}
  if(d.cat=='tele'){if(busy)return;if(!OBJ6.canUse(o,myId)){say('Access: '+roleName[OBJ6.need(o)]);return}const t=find(o.c.lb,k);if(t<0){say('No other pad labelled "'+o.c.lb+'"');OBJ6.sfx('bad');return}OBJ6.feedback(o,k,true);transit(()=>tpTo(t),d);return}
  if(d.k=='sign'){say('Sign: '+(o.c.tx||'(blank)'));return}
  if(d.k=='lamp'||d.k=='switch'){if(!OBJ6.canUse(o,myId)){say('Only trusted visitors and up can do that');return}OBJ6.setState(k,{on:o.s.on?0:1});OBJ6.feedback(o,k,true);return}
  if(d.cat=='cont'){if(!OBJ6.canUse(o,myId)&&!(meta&&OBJ6.roleOf(myId)>=(o.c.dp|0))){say('Access: '+roleName[o.c.ac|0]);OBJ6.sfx('lock');return}o._open=1;OBJ6.sfx('open');config(k,true);return}
  if(d.k=='waystone'){if(!meta||!OBJ6.canConfig(myId)){say('The waystone hums. (Only builders can bind it)');return}const x=k%W,y=k/W|0;setMeta(Object.assign({},meta,{sp:{x,y}}));say('World spawn bound to this waystone');VFX.wave(x*T+T/2,y*T,'#9fd8ff',80,.6,.5);OBJ6.sfx('star');return}
  if(d.k=='seat'){say('You rest a moment');try{P.hp=Math.min(maxHP(),P.hp+5)}catch(_){}return}
  if(d.cat=='station'){if(typeof CRAFT6!='undefined')CRAFT6.open(k);else say('Crafting table');return}
  if(d.k=='dummy'){say('Swing your weapon at it!');return}}
 // ---- UI
 function close(){if(ui){ui.style.display='none'}if(OBJ[uiK])OBJ[uiK]._open=0;uiK=-1}
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function config(k,viewOnly){mk();const o=OBJ[k];if(!o)return;const d=ODEF[o.t],c=o.c,can=OBJ6.canConfig(myId);uiK=k;let h='<h3>'+esc(c.nm||d.n)+'</h3>';
  if(d.cat=='cont'){h+='<label>Contents ('+c.it.length+'/12)</label>'+(c.it.map(x=>'<div class="it"><span>'+x[1]+' × '+esc(OBJ6.itemName(x[0]))+'</span><button data-t="'+x[0]+'" data-n="'+x[1]+'">Take</button></div>').join('')||'<div style="color:#8a7aaa">Empty</div>');
   h+='<label>Put in (hold item selected on hotbar)</label><div class="row"><button id="op_put1">Put 1</button><button id="op_putall">Put all</button></div>'}
  if(can&&!viewOnly||(can&&d.cat=='cont')){
   if(d.cat=='door'){h+='<label>Name</label><input type=text id="f_nm" maxlength=16 value="'+esc(c.nm)+'"><label>Destination type</label><select id="f_dt"><option value=w>Another world</option><option value=s>Return to this world\'s spawn</option><option value=l>Linked gate/pad in this world (label)</option></select><label>World name (for "another world")</label><input type=text id="f_d" maxlength=16 value="'+esc(c.d)+'"><label>Link label</label><input type=text id="f_lb" maxlength=12 value="'+esc(c.lb)+'"><label>Who may use it</label><select id="f_ac">'+roleName.map((r,i)=>'<option value='+i+'>'+r+'</option>').join('')+'</select><label>Min. level</label><input type=number id="f_lv" min=0 max=999 value='+c.lv+'><label><input type=checkbox id="f_kr" '+(c.kr?'checked':'')+'> Requires a Gate Key</label><label><input type=checkbox id="f_kc" '+(c.kc?'checked':'')+'> Key is consumed</label><label><input type=checkbox id="f_sw" '+(c.sw?'checked':'')+'> Requires a lever/plate to be on</label>'}
   else if(d.k=='sign')h+='<label>Text (80 chars)</label><input type=text id="f_tx" maxlength=80 value="'+esc(c.tx)+'">';
   else if(d.k=='tele')h+='<label>Pad label (pads with the same label link)</label><input type=text id="f_lb" maxlength=12 value="'+esc(c.lb)+'"><label>Who may use it</label><select id="f_ac">'+roleName.map((r,i)=>'<option value='+i+'>'+r+'</option>').join('')+'</select>';
   else if(d.cat=='cont')h+='<label>Name</label><input type=text id="f_nm" maxlength=16 value="'+esc(c.nm)+'"><label>Who may take</label><select id="f_ac">'+roleName.map((r,i)=>'<option value='+i+'>'+r+'</option>').join('')+'</select>';
   else if(d.k=='waystone')h+='<label>Name</label><input type=text id="f_nm" maxlength=16 value="'+esc(c.nm)+'">';}
  h+='<div class="row">'+(can&&['door','tele','cont'].includes(d.cat)||can&&['sign','waystone'].includes(d.k)?'<button id="op_save">Save</button>':'')+'<button id="op_close">Close</button></div>';
  ui.innerHTML=h;ui.style.display='block';
  const set=(id,v)=>{const e=ui.querySelector('#'+id);if(e)e.value=v};set('f_dt',c.dt);set('f_ac',c.ac);
  ui.querySelector('#op_close').onclick=close;
  const sv=ui.querySelector('#op_save');if(sv)sv.onclick=()=>{const g2=id=>{const e=ui.querySelector('#'+id);return e?e.type=='checkbox'?e.checked?1:0:e.value:undefined},v=Object.assign({},c);for(const f of['nm','dt','d','lb','ac','lv','kr','kc','sw','tx']){const x=g2('f_'+f);if(x!==undefined)v[f]=x}if(OBJ6.configure(k,v)){say('Saved');OBJ6.sfx('ok');close()}};
  ui.querySelectorAll('.it button').forEach(b=>b.onclick=()=>OBJ6.chestOp(k,'take',+b.dataset.t,+b.dataset.n));
  const p1=ui.querySelector('#op_put1'),pa=ui.querySelector('#op_putall'),sel=()=>bar[sel];if(p1)p1.onclick=()=>{const it=sel();if(it)OBJ6.chestOp(k,'put',it,1);else say('Select an item on the hotbar')};if(pa)pa.onclick=()=>{const it=sel();if(it&&cnt(it))OBJ6.chestOp(k,'put',it,cnt(it));else say('Select an item on the hotbar')}}
 UI6.chestRefresh=()=>{if(uiK>=0&&OBJ[uiK]&&ui.style.display=='block'&&ODEF[OBJ[uiK].t].cat=='cont')config(uiK,true)};
 addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT')return;const k=e.key.toLowerCase();if(k=='escape'&&ui&&ui.style.display=='block'){close();return}if(k=='g'&&entered&&!e.repeat){const n=OBJ6.near();if(n)config(n.k,false)}});
 return{use,config,cancel,close,check,find,go,get busy(){return busy}}})();
const _int6=interact;interact=function(){if(dlgOpen)return _int6();if(creatorOn||showInv||menuEl.style.display!='none')return;if(nearNPC())return _int6();const n=OBJ6.near();if(n&&!nearDoor()){DOORS6.use(n.k);return}_int6()};

