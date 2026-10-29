// ===== PLAY8: weapons fight, tools dig. Faster switching: mouse wheel cycles weapons + tools (only over the game, throttled),
// 3 = next, 4-8 = Pip / Pebble / Glimmer / Twiggy / Bubbles, 9 = your last weapon, X = swap between your last weapon and last tool.
// A small animated pill above the hotbar shows the item you switched to with the previous / next names. =====
const PLAY8=(()=>{
 const TOOLS=['pip','pebble','glimmer','twiggy','bubbles'],PK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpsw';
 const S={wpn:'fist',tool:'pip'};try{const o=JSON.parse(localStorage.getItem(PK())||'{}');if(o.w)S.wpn=o.w;if(o.t)S.tool=o.t}catch(_){}
 const save=()=>{try{localStorage.setItem(PK(),JSON.stringify({w:S.wpn,t:S.tool}))}catch(_){}};
 const isTool=id=>!!(WPN[id]&&WPN[id].k=='tool');
 const list=()=>Object.keys(WPN).filter(id=>own[id]&&!(WPN[id].hid&&!own[id]));
 const ok=id=>!!(WPN[id]&&own[id]);
 const free=()=>entered&&!dlgOpen&&!creatorOn&&menuEl.style.display=='none';
 // ---- weapons never break blocks: a guard around every weapon use (covers moves that call breakAt directly) + the one allowed case
 const G={wpn:0,allow:0,hintT:-1e9,tinkT:0};
 function hint(px,py){const now=performance.now();
  if(now-G.tinkT>140){G.tinkT=now;try{for(let i=0;i<3;i++)VFX.add(1,'#e8eef8',px+(Math.random()-.5)*16,py+(Math.random()-.5)*16,(Math.random()-.5)*60,-20-Math.random()*40,.3,8,2,{a:.7})}catch(_){}try{SFX7.tone(260,220,.05,'triangle',.02)}catch(_){}}
  if(now-G.hintT<40000)return;// gentle: at most once every 40 s, never while fighting next to the cursor
  const cx=mx+cam.x,cy=my+cam.y;for(const m of mobs)if(!m.dead&&Math.hypot(m.x-cx,m.y+m.h/2-cy)<T*3)return;
  G.hintT=now;try{say('Use a tool to break blocks — scroll, 3 or X to switch')}catch(_){}}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&w.k=='tool')return _uw.apply(this,arguments);G.wpn++;try{return _uw.apply(this,arguments)}finally{G.wpn--}}}
 {const _ba=breakAt;breakAt=function(){if(G.wpn>0&&!G.allow)return false;return _ba.apply(this,arguments)}}
 // ---- switching
 let el=null,hideT=0,acc=0,lastW=0,lastStep=0,seen=null;
 const nameOf=id=>{const n=(WPN[id]||{}).n||id;return n.replace(/ the .*$/,'')};
 const SUB={soft:'Tool · digs dirt, sand, wood',stone:'Tool · cracks stone & brick',ore:'Tool · mines whole ore veins',tree:'Tool · chops trees & wood',rod:'Tool · click water to fish'};
 function mk(){if(el)return;el=document.createElement('div');el.id='sw8';el.setAttribute('aria-live','polite');
  el.style.cssText='position:fixed;left:50%;bottom:170px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;pointer-events:none;z-index:31;opacity:0;transition:opacity .28s ease;font:600 13px Fredoka,system-ui,sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.55);white-space:nowrap';
  el.innerHTML='<span data-p style="opacity:.75;font-size:12px;padding:3px 9px;border-radius:999px;background:rgba(24,20,38,.42)"></span><div data-c style="display:flex;align-items:center;gap:9px;padding:5px 15px 5px 5px;border-radius:999px;background:rgba(24,20,38,.76);border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 24px -8px rgba(0,0,0,.45)"><img data-i alt="" width="30" height="30" style="border-radius:50%;background:rgba(255,255,255,.14)"><div style="display:flex;flex-direction:column;line-height:1.18"><b data-n style="font-size:14px;font-weight:600"></b><small data-s style="font-size:11px;opacity:.78;font-weight:500"></small></div></div><span data-x style="opacity:.75;font-size:12px;padding:3px 9px;border-radius:999px;background:rgba(24,20,38,.42)"></span>';
  document.body.appendChild(el)}
 function show(dir){try{mk();const L=list(),i=Math.max(0,L.indexOf(wp)),pv=L[(i-1+L.length)%L.length],nx=L[(i+1)%L.length],w=WPN[wp];
  const q=s=>el.querySelector(s);q('[data-p]').textContent=L.length>1?'‹ '+nameOf(pv):'';q('[data-x]').textContent=L.length>1?nameOf(nx)+' ›':'';q('[data-n]').textContent=w.n;
  q('[data-s]').textContent=w.k=='tool'?(SUB[w.tool]||'Tool')+'  ·  X: '+nameOf(S.wpn):'Weapon · fights, never digs  ·  X: '+nameOf(S.tool);try{q('[data-i]').src=iconURL('w:'+wp)}catch(_){}
  const bar=document.getElementById('bar');if(bar){const r=bar.getBoundingClientRect();if(r.height)el.style.bottom=Math.round(innerHeight-r.top+58)+'px'}
  el.style.opacity='1';const c=q('[data-c]');if(c.animate){c.animate([{transform:'scale(.9) translateY(4px)',opacity:.4},{transform:'scale(1)',opacity:1}],{duration:240,easing:'cubic-bezier(.2,.9,.3,1.25)'});if(dir)for(const s of['[data-p]','[data-x]'])q(s).animate([{transform:'translateX('+(dir*12)+'px)',opacity:0},{transform:'none',opacity:.75}],{duration:260,easing:'ease-out'})}
  clearTimeout(hideT);hideT=setTimeout(()=>{if(el)el.style.opacity='0'},1700)}catch(e){console.error('PLAY8 hud',e)}}
 function note(id){if(!WPN[id])return;if(isTool(id))S.tool=id;else S.wpn=id;save()}
 function set(id,dir){if(!ok(id)||!free())return false;if(id!=wp){wp=id;note(id);seen=id;try{renderBar()}catch(_){}try{UIS.play('select')}catch(_){}}show(dir||0);return true}
 function step(d){const L=list();if(!L.length)return;const i=L.indexOf(wp);set(L[((i<0?0:i)+d+L.length)%L.length],d)}
 function swap(){if(isTool(wp))set(ok(S.wpn)?S.wpn:'fist',-1);else set(ok(S.tool)?S.tool:'pip',1)}
 function wheel(e){if(!free())return;const now=performance.now(),dy=e.deltaY*(e.deltaMode==1?33:e.deltaMode==2?400:1);if(now-lastW>350)acc=0;lastW=now;acc+=dy;
  if(Math.abs(acc)>=45&&now-lastStep>100){lastStep=now;step(acc>0?1:-1);acc=0}}
 // keys: 1-2 blocks, 3 next, 4-8 tools, 9 last weapon; X swaps weapon <-> tool
 selBar=function(i){if(i<=1){sel=i;renderBar();return}if(i==2){step(1);return}if(i>=3&&i<=7){set(TOOLS[i-3]);return}if(i==8)set(ok(S.wpn)?S.wpn:'fist')};
 cycleWeapon=function(){step(1)};cycleW=function(){step(1)};
 addEventListener('keydown',e=>{if(e.repeat||isTextEl(e.target)||e.ctrlKey||e.altKey||e.metaKey)return;if(e.key.toLowerCase()=='x'&&free())swap()});
 // remember the last weapon/tool whatever changed it (inventory, store, shop equip)
 {const _u=update;update=function(dt){const r=_u.apply(this,arguments);if(seen!==wp){seen=wp;note(wp)}return r}}
 // weapon clicked on a block: no damage; fists still open Tackle Boxes (bait)
 window.wTryBreak=function(tx,ty,w){if(tx<1||ty<1||tx>=W-1||ty>=H-1)return false;const b=tiles[ty*W+tx];if(!b||b==4)return false;
  if(b==70&&w&&w.k=='fist'){G.allow++;try{return breakAt(tx,ty,1)}finally{G.allow--}}
  hint(tx*T+T/2,ty*T+T/2);return false};
 return{step,set,swap,wheel,show,list,TOOLS,get last(){return{wpn:S.wpn,tool:S.tool}},G}})();
