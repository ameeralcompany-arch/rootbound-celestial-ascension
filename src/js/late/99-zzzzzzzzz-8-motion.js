// ===== MOTION9: the menu and its Worlds / Options screens open with the same calm motion as the other panels: the menu card fades and
// rises in, each screen switch eases in, and the world rows cascade in once (capped at 12 rows, ~24 ms apart). The inventory and the store
// lay out and paint their content one frame before their motion starts (see their open()), so the first frames of the animation never
// stall. transform / opacity only; reduced motion turns it off (98-panelmotion.css). =====
(()=>{
 const play=(e,c)=>{if(!e)return;e.classList.remove(c);void e.offsetWidth;e.classList.add(c)};
 const card=()=>document.getElementById('card');
 function cascade(){const rows=document.querySelectorAll('#mworlds .wr');rows.forEach((r,i)=>r.style.setProperty('--i',Math.min(i,12)));play(document.getElementById('mworlds'),'mo9list')}
 {const _s=scr;scr=function(id){const was=(()=>{try{return document.getElementById(id).style.display=='block'}catch(_){return true}})();const r=_s.apply(this,arguments);try{if(!was){play(document.getElementById(id),'mo9in');if(id=='mworlds')cascade()}}catch(_){}return r}}
 {const _o=openMenu;openMenu=function(){const was=menuEl.style.display=='flex';const r=_o.apply(this,arguments);try{if(!was){play(menuEl,'mo9show');play(card(),'mo9card')}}catch(_){}return r}}
 {const _r=renderWorlds;renderWorlds=function(){const r=_r.apply(this,arguments);try{if(document.getElementById('mworlds').style.display=='block')document.querySelectorAll('#mworlds .wr').forEach((e,i)=>e.style.setProperty('--i',Math.min(i,12)))}catch(_){}return r}}
})();
