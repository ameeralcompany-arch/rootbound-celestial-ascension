// ===== Creative mode switch (runs before the save is read). Creative is a sandbox on top of your real save: switching it on (CRV8.toggle sets
// rb_cr_go and reloads) first copies every progress key (level, gems, items, inventory, classes, tools, quests... not your worlds, options or
// theme) to 'rbcr_stash'; switching it off puts that copy back and drops keys made while in creative, so nothing done in creative changes your
// normal game. If the copy cannot be written, creative stays off. RB_CREATIVE is true while creative is on. =====
const RB_CREATIVE=(function(){let on=false;try{const LS=localStorage,go=LS.getItem('rb_cr_go');LS.removeItem('rb_cr_go');
 const SKIP=/^(rbw_|rbopt$|rbidx$|rbid$|rbtheme$|rbt$|rbplz$|rbcr)/;
 const keys=()=>{const a=[];for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&/^rb[a-z0-9]/.test(k)&&!SKIP.test(k))a.push(k)}return a};
 if(go=='on'&&LS.getItem('rbcr')!='1'){const o={};for(const k of keys())o[k]=LS.getItem(k);LS.setItem('rbcr_stash',JSON.stringify(o));LS.setItem('rbcr','1')}
 else if(go=='off'&&LS.getItem('rbcr')=='1'){let o=null;try{o=JSON.parse(LS.getItem('rbcr_stash')||'null')}catch(_){}
  if(o&&typeof o=='object'){for(const k of keys())if(!(k in o))LS.removeItem(k);for(const k in o)if(typeof o[k]=='string')LS.setItem(k,o[k])}
  LS.removeItem('rbcr_stash');LS.removeItem('rbcr')}
 on=LS.getItem('rbcr')=='1'}catch(_){}return on})();
