// ===== AERO7: the Aqua glass (Frutiger Aero) skin's live parts (styles: css/99-aero.css).
// - the light that follows the mouse: glass panels get --mx/--my (cursor position inside them) while the cursor moves over them
// - glass sliders show their filled part (--v) as they appear and while they move
// - Aqua glass becomes the theme once for everyone (it is the new default); Light and Dark stay in Settings > General > Theme =====
const AERO7=(()=>{
 const on=()=>document.documentElement.getAttribute('data-skin')=='aero';
 const GLASS='#hudR .pn,.pn,#hudL,#inv7 .sheet,#inv7 .panel,#store7 .shell,#dlg7 .box,#dlg,#hubc,#tools7 .sheet,#chestui,#wl9,#menu #card,#book7,.netcard';
 let cur=null,pend=null;
 addEventListener('pointermove',e=>{if(!on())return;pend=e;if(pend.q)return;pend.q=1;requestAnimationFrame(()=>{const ev=pend;pend=null;if(!ev||!ev.target||!ev.target.closest)return;
  const el=ev.target.closest(GLASS);if(cur&&cur!==el){cur.style.removeProperty('--mx');cur.style.removeProperty('--my');cur=null}if(!el)return;const r=el.getBoundingClientRect();
  el.style.setProperty('--mx',Math.round(ev.clientX-r.left)+'px');el.style.setProperty('--my',Math.round(ev.clientY-r.top)+'px');cur=el})},{passive:true});
 addEventListener('pointerleave',()=>{if(cur){cur.style.removeProperty('--mx');cur.style.removeProperty('--my');cur=null}});
 // slider fill
 const fill=r=>{const mn=+r.min||0,mx=r.max===''?100:+r.max,v=+r.value;r.style.setProperty('--v',(mx>mn?(v-mn)/(mx-mn)*100:0).toFixed(1)+'%')};
 document.addEventListener('input',e=>{const t=e.target;if(t&&t.type=='range')fill(t)},true);
 try{new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.type=='range'){fill(n);continue}const rs=n.getElementsByTagName('input');for(let i=0;i<rs.length;i++)if(rs[i].type=='range')fill(rs[i])}}).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
 for(const r of document.querySelectorAll('input[type=range]'))fill(r);
 // the new default, once (players can switch back in Settings)
 try{if(!localStorage.getItem('rb_aero1'))localStorage.setItem('rb_aero1','1')}catch(_){}
 // the Night skin (css/99-zzz-night.css) is the new default, once for everyone; other themes stay in Settings
 try{if(!localStorage.getItem('rb_night1')){localStorage.setItem('rb_night1','1');cel.opt.theme='night';try{celSave()}catch(_){}try{THEME7.apply()}catch(_){}}}catch(_){}
 return{on,fill}})();
