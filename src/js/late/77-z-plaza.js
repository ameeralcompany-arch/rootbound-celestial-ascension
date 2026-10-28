// ===== NPCs live only in the Plaza. Other worlds (and creator worlds) have none: NPC2 draws and ticks them only when cur=='plaza'. =====
{const _nn=nearNPC;nearNPC=function(){return cur=='plaza'?_nn():null};
 window.NPC_PLAZA_ONLY=1}
