// ===== VOX12: the narrator / hero voice (Web Speech, no audio files). Picks the deepest clear voice installed (prefers English male voices
// such as Microsoft David / Guy / Mark), speaks low and calm but never so low that it smears: pitch .74, rate .9. If your character reads as
// dark / corrupted (dark-themed wings, a void / shadow / phantom / eclipse aura, skin or trail, or a very dark outfit) the voice shifts deeper,
// slower and more commanding (pitch .58, rate .82), still clean. Follows the Sound effects slider; say() returns the utterance (or null) and
// calls onstart / onend so callers can duck music and time subtitles. =====
const VOX12=(()=>{
 const has=()=>typeof speechSynthesis!='undefined'&&typeof SpeechSynthesisUtterance!='undefined';
 let V=null;
 function pick(){if(!has())return null;let v=[];try{v=speechSynthesis.getVoices()||[]}catch(_){}if(!v.length)return null;const en=v.filter(x=>/^en/i.test(x.lang)),pool=en.length?en:v;
  return pool.find(x=>/David|Guy|Mark|George|Ryan|Christopher|Eric|Roger|Brian|Daniel|Fred|Male/i.test(x.name))||pool.find(x=>!/Zira|Hazel|Susan|Female|Aria|Jenny|Sonia|Libby/i.test(x.name))||pool[0]}
 try{if(has()){speechSynthesis.getVoices();speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',()=>{V=pick()})}}catch(_){}
 const DARK=/void|shadow|phantom|eclipse|obsidian|abyss|night|crow|raven|bone|dark|corrupt|shroud|umbra|demon|nether|cursed/i;
 function dark(){try{const w=curWing(lvl);if(w){try{if(typeof WTRAIL!='undefined'&&WTRAIL.theme&&WTRAIL.theme(w)=='dark')return true}catch(_){}if(DARK.test((w.id||'')+' '+(w.n||'')))return true}}catch(_){}
  try{for(const s of ['aura','skin','trail']){const r=SHOP7.st.eq[s];if(r&&DARK.test(r))return true}}catch(_){}
  try{const c=String(cel.ap.out||'');if(/^#[0-9a-f]{6}$/i.test(c)){const n=parseInt(c.slice(1),16),l=((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)/255;if(l<.13)return true}}catch(_){}return false}
 function params(o){const d=o&&o.dark!=null?o.dark:dark();return d?{pitch:.58,rate:.82,dark:true}:{pitch:.74,rate:.9,dark:false}}
 const vol=()=>Math.min(1,typeof OPT!='undefined'&&OPT.sv!=null?+OPT.sv:1);
 const log=[];
 function say(text,o){o=o||{};if(text){log.push(text);if(log.length>40)log.shift()}if(!has()||!text||!(vol()>0))return null;try{if(o.cancel)speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text),p=params(o);V=V||pick();if(V)u.voice=V;
   u.pitch=o.pitch!=null?o.pitch:p.pitch;u.rate=o.rate!=null?o.rate:p.rate;u.volume=vol()*(o.vol||1);if(o.onstart)u.onstart=o.onstart;if(o.onend){u.onend=o.onend;u.onerror=o.onend}speechSynthesis.speak(u);return u}catch(_){return null}}
 function stop(){try{if(has())speechSynthesis.cancel()}catch(_){}}
 return{say,stop,dark,params,pick,log,get voice(){return V||pick()}}})();
