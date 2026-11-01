// ===== Removed weapons: the v10 arsenal (weapon ids ax_*) was taken out of the game. Saves made while it was installed may still own one
// or hold one in the hand; drop those so nothing points at a weapon that no longer exists (the store and hotbar already skip unknown ids). =====
(()=>{function fix(){try{for(const id of Object.keys(own))if(!WPN[id])delete own[id];if(!WPN[wp])wp='fist'}catch(_){}}
 fix();{const _lw=loadWorld;loadWorld=function(){fix();return _lw.apply(this,arguments)}}})();
