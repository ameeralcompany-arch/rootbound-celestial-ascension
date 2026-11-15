// ===== VOICE1: one voice at a time. Rootbound has several voiced things (Lavi, the townsfolk, side stories, boss lines, the narrator); each one that starts
// a recorded line claims it here. A new voice asks Lavi to stop speaking (her text stays), and Lavi waits while anyone else is talking. =====
window.VOICE1=(()=>{
 const live=new Set();
 const playing=a=>{try{return !!a&&!a.paused&&!a.ended&&a.currentTime<(a.duration||1e9)}catch(_){return false}};
 function claim(a,who){try{if(!a)return a;if(who!=='lavi')try{if(window.RPG&&RPG.guide&&RPG.guide.speaking)RPG.guide.hush()}catch(_){}live.add(a);const off=()=>live.delete(a);a.addEventListener('ended',off);a.addEventListener('pause',off);a.addEventListener('error',off)}catch(_){}return a}
 function busy(){for(const a of live){if(playing(a))return true;live.delete(a)}try{if(window.speechSynthesis&&speechSynthesis.speaking)return true}catch(_){}return false}
 return{claim,busy,get n(){return live.size}}})();
