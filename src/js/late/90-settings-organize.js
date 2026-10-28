// ===== Settings: six clear categories (General, Graphics, Audio, Controls, Interface, Accessibility) + search.
// Every control changes a real option and persists (cel.opt + celSave, or the legacy OPT + saveP for audio/zoom/shake). =====
(()=>{const X=UI6.ext,el=id=>document.getElementById(id),esc=UI6.esc;
 X.post=(tab,body)=>{if(tab=='plates'){try{X.postPlates(body)}catch(e){console.error(e)}}};
 const CATS=[['general','General','◎','Theme, name and save data'],['graphics','Graphics','✧','Quality and visual effects'],['audio','Audio','♪','Music, effects and interface sounds'],['controls','Controls','⌘','Camera and key reference'],['interface','Interface','▣','HUD size, opacity and panels'],['access','Accessibility','◐','Motion, shake and contrast']];
 const KEYS=[['A / D','Move'],['W / Space','Jump (again in the air to double jump)'],['Left click','Break, attack, use tool'],['Right click','Place block or seed'],['1 · 2','Block slots'],['3','Switch weapon'],['Q R Z Shift F','Gear skills'],['E','Use / talk'],['G','Set a door destination'],['C','Character hub'],['I / Tab','Inventory'],['J','Quest journal'],['H','Show / hide quest tracker'],['M','Music on / off'],['+ / − / 0','Zoom in / out / reset'],['Enter','Chat'],['F3','FPS counter']];
 const row=(id,label,desc,ctl)=>'<div class="srow7" data-k="'+esc((label+' '+desc).toLowerCase())+'"><div class="sl7"><label for="'+id+'">'+label+'</label><small>'+desc+'</small></div><div class="sc7">'+ctl+'</div></div>';
 const tog=(id,on,lbl)=>'<input type="checkbox" role="switch" class="rb-toggle" id="'+id+'"'+(on?' checked':'')+' aria-label="'+esc(lbl)+'">';
 const rng=(id,min,max,v,u)=>'<input type="range" id="'+id+'" min="'+min+'" max="'+max+'" value="'+Math.round(v)+'"><output id="'+id+'n">'+Math.round(v)+(u==null?'%':u)+'</output>';
 const sel=(id,opts,v)=>'<select id="'+id+'">'+opts.map(o=>'<option value="'+o[0]+'"'+(String(o[0])==String(v)?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
 const num=(v,d)=>v==null||isNaN(v)?d:+v;
 X.settings=function(){const body=UI6.body,o=cel.opt,preset=['auto',...QPRE.map(p=>p.id)];
  const S={
   general:row('sth','Theme','Pearl daylight or the plum night palette',sel('sth',[['light','Pearl (light)'],['dark','Plum night (dark)'],['auto','Match my system']],o.theme||'light'))
    +row('snm','Player name','Shown on your nameplate (up to 14 letters)','<input type="text" id="snm" maxlength="14" value="'+esc(myName)+'" autocomplete="off">')
    +row('ssd','Save data','Progress saves automatically; keep a backup file too','<button class="hbtn" id="ssd">Backup & restore</button>'),
   graphics:row('sq','Graphics quality','Resolution, particles and background layers',sel('sq',preset.map(p=>[p,p=='auto'?'Auto (by device)':QPRE.find(q=>q.id==p).n]),o.qp)+'<small id="sqn" class="snote7"></small>')
    +row('sv','Effects intensity','Strength of hit sparks, auras and magic',rng('sv',0,150,o.vfx*100))
    +row('sb','Bloom & glow','Soft light around bright blocks and magic',tog('sb',o.bloom,'Bloom'))
    +row('sw','Weather','Rain, snow, fog and their sounds',tog('sw',o.wxOn,'Weather'))
    +row('sci','Letterbox bars','Film bars when the Cinematic quality is selected',tog('sci',o.cine,'Letterbox bars')),
   audio:row('smv','Music','Background music volume',rng('smv',0,100,num(OPT.mv,.5)*100))
    +row('ssv','Sound effects','Blocks, combat and world sounds',rng('ssv',0,100,num(OPT.sv,1)*100))
    +row('sav','Ambience','Wind, rain and cave atmosphere',rng('sav',0,100,num(OPT.av,1)*100))
    +row('suv','Interface sounds','Soft clicks and chimes in menus',rng('suv',0,100,(o.uiv==null?.6:o.uiv)*100))
    +row('sum','Mute interface sounds','Silence menu sounds only',tog('sum',o.uim,'Mute interface sounds')),
   controls:row('szm','Camera zoom','How close the camera sits (also + and − keys)',rng('szm',50,220,(typeof ZM=='number'?ZM:1)*100))
    +'<div class="skeys7" data-k="keys controls keyboard bindings '+esc(KEYS.map(k=>k[1]).join(' ').toLowerCase())+'">'+KEYS.map(([k,d])=>'<div><kbd>'+esc(k)+'</kbd><span>'+esc(d)+'</span></div>').join('')+'</div>',
   interface:row('su','Interface size','Scales the HUD, hotbar and quest tracker',rng('su',80,140,o.ui*100))
    +row('sho','HUD opacity','Fade the HUD while you play (hover shows it fully)',rng('sho',40,100,(o.hudOp||1)*100))
    +row('sqt','Quest tracker','The “Getting started” card on the right',tog('sqt',!o.hideQuest,'Quest tracker'))
    +row('smm','Minimap','Small map in the top right corner',tog('smm',!o.hideMini,'Minimap'))
    +row('sf','FPS counter','Frames per second, top left',tog('sf',o.fpsShow,'FPS counter')),
   access:row('sr','Reduced motion','Calmer menus, less shake and flashing, fewer particles',tog('sr',o.reduce,'Reduced motion'))
    +row('ssh','Screen shake','How much the camera shakes on impacts',rng('ssh',0,100,num(OPT.sh,1)*100))
    +row('sct','Stronger contrast','Darker secondary text and clearer outlines',tog('sct',o.contrast,'Stronger contrast'))};
  body.innerHTML='<h3>Settings</h3><div class="set7"><nav class="snav7" aria-label="Setting categories">'+CATS.map(([k,n,g],i)=>'<button data-sc="'+k+'" class="'+(i?'':'on')+'"><i>'+g+'</i>'+n+'</button>').join('')+'</nav><div class="smain7"><div class="setq7"><input type="search" id="setq7" placeholder="Search settings…" aria-label="Search settings" autocomplete="off"><span class="dim" id="setn7"></span></div>'
   +CATS.map(([k,n,g,d])=>'<section class="ssec7" id="ss-'+k+'"><h4><i>'+g+'</i>'+n+'<small>'+d+'</small></h4>'+S[k]+'</section>').join('')+'<p class="dim snote7" id="sempty7" hidden>No settings match.</p></div></div>';
  bind(body,o)};
 function bind(body,o){const q=id=>body.querySelector('#'+id),lab=(id,v,u)=>{const n=q(id+'n');if(n)n.textContent=Math.round(v)+(u==null?'%':u)};
  const save=()=>{celSave();try{QM.apply(QM.cur.id,true)}catch(_){}try{UI6.applyUi()}catch(_){}};
  const tg=(id,fn)=>{const e=q(id);if(e)e.onchange=()=>{fn(e.checked);save()}};
  // general
  q('sth').onchange=e=>{o.theme=e.target.value;celSave()};
  q('snm').onchange=e=>{const n=e.target.value.trim().slice(0,14);if(n){myName=n;try{$('nm').value=n;saveP()}catch(_){}}else e.target.value=myName};q('snm').onkeydown=e=>e.stopPropagation();
  q('ssd').onclick=()=>UI6.open('account');
  // graphics
  const qn=()=>{try{const p=o.qp=='auto'?QM.cur:QPRE.find(x=>x.id==o.qp);q('sqn').textContent='Resolution '+Math.round(p.rsc*100)+'% · up to '+p.cap+' particles · '+p.par+' parallax layers'}catch(_){}};qn();
  q('sq').onchange=e=>{QM.setting(e.target.value);qn()};
  q('sv').oninput=e=>{o.vfx=e.target.value/100;lab('sv',e.target.value);try{QM.apply(QM.cur.id,true)}catch(_){}celSave()};
  tg('sb',v=>o.bloom=v?1:0);tg('sw',v=>o.wxOn=v?1:0);tg('sci',v=>o.cine=v?1:0);
  // audio: drive the original menu sliders so every listener (music engine, ambience) reacts exactly as before
  const drive=(id,v)=>{const m=el(id);if(m){m.value=v;m.dispatchEvent(new Event('input'))}};
  q('smv').oninput=e=>{lab('smv',e.target.value);if(el('ov'))drive('ov',e.target.value);else{OPT.mv=e.target.value/100;saveP()}};
  q('ssv').oninput=e=>{lab('ssv',e.target.value);if(el('os'))drive('os',e.target.value);else{OPT.sv=e.target.value/100;saveP()}};
  q('sav').oninput=e=>{lab('sav',e.target.value);OPT.av=e.target.value/100;try{saveP()}catch(_){}const a=el('oav');if(a)a.value=e.target.value};
  q('suv').oninput=e=>{o.uiv=e.target.value/100;lab('suv',e.target.value);celSave()};q('suv').onchange=()=>{try{UIS.play('select')}catch(_){}};
  tg('sum',v=>{o.uim=v?1:0;if(!v)try{UIS.play('select')}catch(_){}});
  // controls
  q('szm').oninput=e=>lab('szm',e.target.value);q('szm').onchange=e=>{try{setZoom(e.target.value/100);saveP()}catch(_){}lab('szm',Math.round(ZM*100))};
  // interface
  q('su').oninput=e=>{o.ui=e.target.value/100;lab('su',e.target.value);UI6.applyUi();celSave()};
  q('sho').oninput=e=>{o.hudOp=e.target.value/100;lab('sho',e.target.value);celSave()};
  tg('sqt',v=>o.hideQuest=v?0:1);tg('smm',v=>o.hideMini=v?0:1);tg('sf',v=>o.fpsShow=v?1:0);
  // accessibility
  tg('sr',v=>o.reduce=v?1:0);tg('sct',v=>o.contrast=v?1:0);
  q('ssh').oninput=e=>{OPT.sh=e.target.value/100;lab('ssh',e.target.value);try{const c=el('osh');if(c)c.checked=OPT.sh>0;saveP()}catch(_){}};
  // category nav: scrolls to the section; the highlight follows the scroll position
  const nav=body.querySelector('.snav7'),secs=[...body.querySelectorAll('.ssec7')],mark=k=>nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.sc==k));
  nav.onclick=e=>{const b=e.target.closest('[data-sc]');if(!b)return;const s=q('ss-'+b.dataset.sc);if(s){body.scrollTo({top:s.offsetTop-12,behavior:cel.opt.reduce?'auto':'smooth'});mark(b.dataset.sc)}};
  body.onscroll=()=>{if(UI6.tab!='settings')return;let cur=secs[0];for(const s of secs)if(s.offsetTop-40<=body.scrollTop)cur=s;if(body.scrollTop+body.clientHeight>=body.scrollHeight-4)cur=secs[secs.length-1];if(cur)mark(cur.id.slice(3))};
  // search across every category
  const inp=q('setq7'),rows=[...body.querySelectorAll('.srow7,.skeys7')];
  inp.oninput=()=>{const s=inp.value.trim().toLowerCase();let n=0;for(const r of rows){const m=!s||r.dataset.k.includes(s);r.style.display=m?'':'none';if(m)n++}
   for(const sec of secs)sec.style.display=[...sec.querySelectorAll('.srow7,.skeys7')].some(r=>r.style.display!='none')?'':'none';
   q('setn7').textContent=s?(n?n+' found':''):'';q('sempty7').hidden=!!n||!s};
  inp.onkeydown=e=>e.stopPropagation()}
})();
