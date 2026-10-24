// ===== NPCs live only in the Plaza. Other worlds (and creator worlds) have none: not drawn, not talkable. =====
{const _nn=nearNPC;nearNPC=function(){return cur=='plaza'?_nn():null};
 const _dn=drawNPCs;drawNPCs=function(now){if(cur=='plaza')return _dn(now);const keep=NPCS.splice(0);try{_dn(now)}finally{NPCS.push(...keep)}};
 window.NPC_PLAZA_ONLY=1}
