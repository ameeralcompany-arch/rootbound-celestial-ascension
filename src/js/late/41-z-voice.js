// ===== VOX12: the narrator / hero voice (Web Speech, no audio files). Picks the deepest clear voice installed (prefers English male voices
// such as Microsoft David / Guy / Mark). Why it no longer sounds robotic or gets cut off:
//  - pitch stays close to the voice's own (.88). Windows voices are pitch-shifted by resampling, and anything under ~.8 turns metallic
//    and smeared; David is already deep, so a small drop keeps him warm. Rate .96 gives a calm, unhurried read.
//  - every sentence is its own utterance, queued back to back. Long utterances are where Chromium stalls or drops the tail, and
//    a sentence boundary is a natural breath anyway.
//  - every queued utterance is kept referenced until it ends: Chromium garbage-collects live utterances, which silently cuts speech off
//    mid-sentence and never fires onend.
//  - nothing cancels a line in flight unless the caller asks (cancel:true is only used for click-to-skip style interruptions).
// Dark / corrupted characters (dark-themed wings, a void / shadow / phantom / eclipse aura, skin or trail, or a very dark outfit) get a
// deeper, slower, more commanding read (pitch .8, rate .88), still clean. Follows the Sound effects slider; say() returns the first
// utterance (or null) and calls onstart (first sentence) / onend (last sentence) so callers can duck music and time scenes. =====
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
 function params(o){const d=o&&o.dark!=null?o.dark:dark();return d?{pitch:.8,rate:.88,dark:true}:{pitch:.88,rate:.96,dark:false}}
 const vol=()=>Math.min(1,typeof OPT!='undefined'&&OPT.sv!=null?+OPT.sv:1);
 // split into sentences, keeping the punctuation (it drives the voice's falling intonation and the pause after it)
 function sentences(text){const m=String(text).match(/[^.!?…]+(?:\.\.\.|[.!?…]+)?["')\]]*\s*/g)||[text];const out=[];
  for(const s of m){const t=s.trim();if(!t)continue;if(out.length&&t.length<4)out[out.length-1]+=' '+t;else out.push(t)}return out.length?out:[String(text)]}
 // spoken length in seconds, fitted to Microsoft David measured off-screen at rate .93: ~0.3 s a word, ~0.95 s per sentence (each
 // sentence is its own utterance: falling tone, pause, hand-over) and ~0.3 s per comma. Slower rates stretch it proportionally.
 function est(text,rate){const s=String(text||''),w=(s.match(/\S+/g)||[]).length,c=(s.match(/[,;:—–]/g)||[]).length,n=sentences(s).length;return (w*.3+n*.95+c*.3)*(.93/(rate||.93))}
 const live=new Set(),log=[];
 function say(text,o){o=o||{};if(text){log.push(text);if(log.length>40)log.shift()}if(!has()||!text||!(vol()>0))return null;
  try{if(o.cancel){speechSynthesis.cancel();live.clear()}const p=params(o),parts=sentences(text);V=V||pick();let first=null,done=false;
   const fin=()=>{if(done)return;done=true;try{o.onend&&o.onend()}catch(_){}};
   parts.forEach((s,i)=>{const u=new SpeechSynthesisUtterance(s);if(V)u.voice=V;u.pitch=o.pitch!=null?o.pitch:p.pitch;u.rate=o.rate!=null?o.rate:p.rate;u.volume=vol()*(o.vol||1);
    const last=i==parts.length-1,drop=()=>{live.delete(u);if(last)fin()};
    if(i==0&&o.onstart)u.onstart=o.onstart;u.onend=drop;u.onerror=e=>{live.delete(u);if(last||(e&&e.error=='canceled'||e&&e.error=='interrupted'))fin()};
    live.add(u);speechSynthesis.speak(u);if(!first)first=u});
   return first}catch(_){return null}}
 function stop(){try{if(has())speechSynthesis.cancel()}catch(_){}live.clear()}
 const busy=()=>{try{return has()&&(speechSynthesis.speaking||speechSynthesis.pending)}catch(_){return false}};
 return{say,stop,dark,params,pick,log,sentences,est,busy,get voice(){return V||pick()}}})();
