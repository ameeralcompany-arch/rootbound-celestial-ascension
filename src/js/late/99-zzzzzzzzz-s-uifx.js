// ===== The player's control over how the game looks and what that costs: background blur, particles, shadows, film effects, interface motion and a performance mode that turns everything down at once.
// All of it is a few attributes on <html> and a multiplier on the particle budget, so nothing here runs while you play. Big screens also scale the panels by the window's height (--uiz). =====
const UIFX=(()=>{
 const O=()=>cel.opt,PK={high:1,med:.6,low:.3},d=document.documentElement;
 try{const o=(JSON.parse(localStorage.getItem('rbc')||'null')||{}).opt||{},q=cel.opt;q.blur=['high','med','off'].includes(o.blur)?o.blur:'med';q.pq=['high','med','low'].includes(o.pq)?o.pq:'high';q.shq=['high','med','low'].includes(o.shq)?o.shq:'high';q.uianim=o.uianim===0?0:1;q.perf=o.perf?1:0}catch(_){}
 const scale=()=>{const k=Math.max(1,Math.min(2.4,Math.min(innerHeight/1080,innerWidth/1920)));d.style.setProperty('--uiz',k.toFixed(3))};
 function apply(){const o=O(),pf=!!o.perf;d.setAttribute('data-blur',pf?'off':o.blur||'med');d.setAttribute('data-shadows',pf?'low':o.shq||'high');d.setAttribute('data-uianim',pf||o.uianim===0?'off':'on');d.setAttribute('data-perf',pf?'on':'off');scale();try{QM.apply(QM.cur.id,true)}catch(_){}}
 // the particle budget follows the setting; performance mode also takes the lowest graphics preset
 {const a0=QM.apply;QM.apply=function(id,silent){const o=O();const r=a0.call(this,o.perf?'low':id,silent);try{OPT.q*=PK[o.perf?'low':o.pq||'high']||1}catch(_){}return r}}
 addEventListener('resize',scale);
 apply();
 return{apply,PK,scale}})();
