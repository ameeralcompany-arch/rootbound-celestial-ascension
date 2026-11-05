// Saved inventories/hotbars written by older versions can reference items that do not exist (any more). Drop them so they can never crash startup.
// Many items are registered by scripts that load after this one (realm materials, mythic weapons, dungeon keys...), so nothing is thrown away here: whatever isn't known yet is set aside, and 99-zzzzzzzzzz-restore.js,
// the very last script, gives back everything that turned out to exist. Only what is still unknown then is really gone.
(function(){try{const okId=k=>{k=+k;return k>=200?!!MAT[k]:k>=100?!!BLK[k-100]:!!BLK[k]};const H=window.RB_HELD={inv:{},own:{},bar:{},wp:null};
 for(const k of Object.keys(inv)){if(!(inv[k]>0))delete inv[k];else if(!okId(k)){H.inv[k]=inv[k];delete inv[k]}}
 for(let i=0;i<bar.length;i++)if(bar[i]!=null&&bar[i]!==0&&!okId(bar[i])){H.bar[i]=bar[i];bar[i]=null}
 try{WINGFIX7.run()}catch(_){}
 try{for(const k of Object.keys(own))if(!WPN[k]){H.own[k]=1;delete own[k]}own.fist=1;if(!WPN[wp]||!own[wp]){H.wp=wp;wp='fist'}}catch(_){}
 barDirty=1;for(const f of[renderBar,renderSkills,renderW,hud])try{f()}catch(_){}}catch(e){try{console.error('sanitize',e)}catch(_){}}})();
