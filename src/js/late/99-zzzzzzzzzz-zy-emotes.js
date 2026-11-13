// ===== EMO2: body emotes everyone can see, emotes in sync, and sitting that others see. The emote wheel and /e used to show only an emoji over your head;
// now each emote is a full-body move (wave, dance, cheer, heart, bow, laugh, think) on the FIGHT pose system, which already travels to other players in the
// cosmetics they receive, so everyone nearby sees you wave. Two players who do the same emote within three seconds of each other, close together, are
// "in sync": a burst of light between them and a line in the corner. Sitting on a bench or a chair is sent the same way, so others see you sit.
// Loads after FIGHT (v-fight) and the skills (x-skills), whose remote handler it extends. =====
try{(()=>{
 if(!window.FIGHT||!FIGHT.POSE)return;
 const PZ=FIGHT.POSE;
 // pose = hip drop, hip shift, lean, near hand x,y, far hand x,y (from the shoulder; y up is negative), front foot, back foot, weapon angle
 const P_=(by,bx,lean,nx,ny,fx,fy,ax,ay,bfx,bfy,wa)=>({by,bx,lean,nh:[nx,ny],fh:[fx,fy],ff:[ax,ay],bf:[bfx,bfy],wa});
 Object.assign(PZ,{
  emWaveA:P_(0,0,-.04,5,-18,3,10,6,-2,-6,-2,-.7),emWaveB:P_(0,0,-.04,12,-14,3,10,6,-2,-6,-2,-.7),
  emBow:P_(3,-3,.62,7,11,5,12,6,-2,-6,-2,-.7),
  emCheerU:P_(-1,0,-.1,7,-19,-5,-18,6,-3,-6,-3,-1.4),emCheerD:P_(2,0,0,10,-11,-3,-11,6,-2,-6,-2,-1.2),
  emDanceL:P_(2,-3,-.12,12,-9,-6,4,9,-5,-7,-2,-.7),emDanceR:P_(2,3,.12,4,6,8,-10,7,-2,-9,-5,-.7),
  emHeart:P_(0,0,-.05,4,-17,1,-17,6,-2,-6,-2,-.7),
  emLaughA:P_(1,0,-.18,7,8,3,9,6,-2,-6,-2,-.7),emLaughB:P_(2,0,-.06,7,10,3,11,6,-2,-6,-2,-.7),
  emThink:P_(0,0,.03,6,-5,4,7,6,-2,-6,-2,-.7)});
 // one move per emote, in the order of SOC6.EMOTES: wave dance cheer heart bow sit laugh think (sit has no move: it sits you down)
 const MV={wave:'emWaveA.2 emWaveB.17 emWaveA.17 emWaveB.17 emWaveA.17 ready.25',dance:'emDanceL.22 emDanceR.22 emDanceL.22 emDanceR.22 emDanceL.22 emDanceR.22 ready.25',
  cheer:'emCheerD.12 emCheerU.18 emCheerD.14 emCheerU.18 emCheerD.14 emCheerU.2 ready.3',heart:'emHeart.3 emHeart.9 ready.3',bow:'emBow.35 emBow.6 ready.35',
  laugh:'emLaughA.16 emLaughB.16 emLaughA.16 emLaughB.16 emLaughA.16 ready.25',think:'emThink.3 emThink.9 ready.3'};
 for(const k in MV)FIGHT.parse(MV[k]);   // a typo in a pose name fails here, at load, not in front of a player
 const NAME={wave:'wave',dance:'dance',cheer:'cheer',heart:'heart',bow:'bow',laugh:'laugh',think:'think'};
 let mine=null;   // your last emote: {k, t}
 function playMe(k){if(!MV[k])return;try{FIGHT.play('me',MV[k],{id:'emo:'+k,type:'fist',soft:true})}catch(e){console.error('EMO2',e)}mine={k,t:performance.now()}}
 // the emote wheel and /e go through SOC6.emote(i)
 if(typeof SOC6!='undefined'&&SOC6.emote){const _e=SOC6.emote,L=SOC6.EMOTES;SOC6.emote=function(i){const r=_e.apply(this,arguments);try{const em=L[i|0];if(em)playMe(em[0])}catch(_){}return r}}
 // someone else's emote: play it on them, and if it matches yours just now and they are close, you are in sync
 const _or=FIGHT.onRemote;
 FIGHT.onRemote=function(key,id,q){if(typeof id=='string'&&id.slice(0,4)=='emo:'){const k=id.slice(4);if(MV[k]){try{FIGHT.play(key,MV[k],{type:'fist',soft:true})}catch(_){}sync(k,q)}return}return _or?_or.apply(this,arguments):undefined};
 let lastSync=0,lastMsg='';
 function sync(k,q){try{const now=performance.now();if(!mine||mine.k!==k||now-mine.t>3000||now-lastSync<2500||!q)return;const x=+q.x,y=+q.y;if(!Number.isFinite(x)||Math.hypot(x-P.x,y-P.y)>T*7)return;lastSync=now;
   const mx=(x+P.x)/2,my=Math.min(y,P.y)+10;try{VFX.burst(mx,my,['#ffd6f0','#fff4c2','#c9e8ff'],22,180,1,.9,10);VFX.wave(mx,my+20,'#ffe0f4',110,.4,.3)}catch(_){}
   const txt='In sync with '+String(q.n||'a friend').slice(0,14)+'!';lastMsg=txt;try{UIS.play('confirm')}catch(_){}try{say(txt)}catch(_){}}catch(_){}}
 // ---- sitting, seen by others: the seat height and lean travel in your look (cx.st); everyone draws you seated
 if(typeof celPres=='function'){const _cp=celPres;celPres=function(){const o=_cp.apply(this,arguments);try{const s=typeof AC6!='undefined'&&AC6.SIT&&AC6.SIT();if(o&&s)o.st=[Math.max(0,Math.min(60,s.h|0)),Math.round((s.lean||0)*100)]}catch(_){}return o}}
 if(typeof cleanCx=='function'){const _cc=cleanCx;cleanCx=function(c){const r=_cc.apply(this,arguments);try{if(r&&c&&Array.isArray(c.st)&&c.st.length==2){const h=+c.st[0],l=+c.st[1];if(Number.isFinite(h)&&Number.isFinite(l))r.st=[Math.max(0,Math.min(60,h|0)),Math.max(-100,Math.min(100,l|0))]}}catch(_){}return r}}
 if(typeof AC6!='undefined')AC6.RSIT=cx=>{const s=cx&&cx.st;return Array.isArray(s)?{h:+s[0]||0,lean:(+s[1]||0)/100}:0};
 window.EMO2={MV,playMe,get mine(){return mine},get lastMsg(){return lastMsg}};
})()}catch(e){console.error('EMO2',e)}
