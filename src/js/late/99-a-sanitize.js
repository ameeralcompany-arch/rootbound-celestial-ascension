// Saved inventories/hotbars written by older versions can reference items that do not exist (any more). Drop them so they can never crash startup.
(function(){try{const okId=k=>{k=+k;return k>=200?!!MAT[k]:k>=100?!!BLK[k-100]:!!BLK[k]};
 for(const k of Object.keys(inv))if(!okId(k)||!(inv[k]>0))delete inv[k];
 for(let i=0;i<bar.length;i++)if(bar[i]!=null&&bar[i]!==0&&!okId(bar[i]))bar[i]=null;
 try{WINGFIX7.run()}catch(_){}
 try{for(const k of Object.keys(own))if(!WPN[k])delete own[k];own.fist=1;if(!WPN[wp]||!own[wp])wp='fist'}catch(_){}
 barDirty=1;for(const f of[renderBar,renderSkills,renderW,hud])try{f()}catch(_){}}catch(e){try{console.error('sanitize',e)}catch(_){}}})();
