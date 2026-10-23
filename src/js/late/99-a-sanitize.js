// Saved inventories/hotbars written by older versions can reference items that do not exist (any more). Drop them so they can never crash startup.
(function(){try{const okId=k=>{k=+k;return k>=200?!!MAT[k]:k>=100?!!BLK[k-100]:!!BLK[k]};
 for(const k of Object.keys(inv))if(!okId(k)||!(inv[k]>0))delete inv[k];
 for(let i=0;i<bar.length;i++)if(bar[i]!=null&&bar[i]!==0&&!okId(bar[i]))bar[i]=null;
 barDirty=1}catch(e){try{console.error('sanitize',e)}catch(_){}}})();
