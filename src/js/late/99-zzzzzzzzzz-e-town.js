// ===== STORY2: the townsfolk remember. Each Plaza character has story lines that unlock with the player's progress (the Journal pages, STORY1); talking to them
// says their first unheard line, once, in their own recorded voice (audio/town/<id>.mp3, tools/voice/record-town.js), and then they go back to their everyday chatter.
// A small gold spark over a townsperson means they have something new to say. NPC2 (77-npcs2.js) asks STORY2.take(id) before picking an everyday line.
// State: RB_PREFIX+'rbtown' {heard:{id:1}}. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbtown';
 let S={heard:{}};try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY())||'{}'))}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const data=()=>window.TOWNVOICE||{};
 const met=need=>{if(need=='always')return true;try{return STORY1.got.includes(need)}catch(_){return false}};
 function next(npc){for(const id of Object.keys(data())){const l=data()[id];if(l.npc==npc&&l.need!='side'&&!S.heard[id]&&met(l.need))return[id,l]}return null}
 const fill=s=>String(s).replace(/\{name\}/g,(typeof myName!='undefined'&&myName)||'traveler').replace(/\{lvl\}/g,typeof lvl!='undefined'?lvl:1);
 let au=null;
 function stop(){if(au){try{au.pause()}catch(_){}au=null}}
 function play(id){stop();try{const v=typeof OPT!='undefined'&&OPT.sv!=null?+OPT.sv:1;if(!(v>0))return;au=new Audio('audio/town/'+id+'.mp3');au.volume=Math.min(1,v*.95);const p=au.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
 // a little gold spark over their head: something new to say
 function mark(g,x,y,now){const b=Math.sin(now/380+x)*2,s=5+Math.sin(now/260)*.8;g.save();g.translate(Math.round(x),Math.round(y+b));g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(0,0,0,0,0,s*2.6);gr.addColorStop(0,'rgba(255,226,150,.85)');gr.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=gr;g.fillRect(-s*3,-s*3,s*6,s*6);
  g.fillStyle='#fff3c8';g.beginPath();g.moveTo(0,-s*1.6);g.quadraticCurveTo(s*.25,-s*.25,s*1.6,0);g.quadraticCurveTo(s*.25,s*.25,0,s*1.6);g.quadraticCurveTo(-s*.25,s*.25,-s*1.6,0);g.quadraticCurveTo(-s*.25,-s*.25,0,-s*1.6);g.fill();g.restore()}
 window.STORY2={has:npc=>!!next(npc)||!!(window.SIDE1&&SIDE1.has(npc)),take(npc){try{const t=window.SIDE1&&SIDE1.turnIn(npc);if(t)return fill(t)}catch(_){}const r=next(npc);if(r){S.heard[r[0]]=1;save();play(r[0]);return fill(r[1].text)}try{const o=window.SIDE1&&SIDE1.offer(npc);if(o)return fill(o)}catch(_){}return null},mark,stop,markHeard(npc){for(const id of Object.keys(data())){const l=data()[id];if(l.npc==npc&&l.need!='side'&&met(l.need))S.heard[id]=1}save()},
  get heard(){return Object.keys(S.heard)},get lines(){return data()},reset(){S={heard:{}};save()}};
})()}catch(e){console.error('STORY2',e)}
