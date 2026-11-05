// The last script of all: every item, weapon and piece of gear in the game is registered by now, so what the start-up check set aside (99-a-sanitize.js) goes back where it was.
(function(){try{const H=window.RB_HELD;window.RB_LATE_DONE=1;if(!H)return;const okId=k=>{k=+k;return k>=200?!!MAT[k]:k>=100?!!BLK[k-100]:!!BLK[k]};
 for(const k in H.inv)if(okId(k))inv[k]=(inv[k]|0)+H.inv[k];
 for(const i in H.bar)if(okId(H.bar[i])&&!bar[i])bar[i]=H.bar[i];
 for(const k in H.own)if(WPN[k])own[k]=1;if(H.wp&&WPN[H.wp]&&own[H.wp])wp=H.wp;
 window.RB_HELD=null;barDirty=1;for(const f of[renderBar,renderW,hud])try{f()}catch(_){}}catch(e){try{console.error('restore',e)}catch(_){}}})();
