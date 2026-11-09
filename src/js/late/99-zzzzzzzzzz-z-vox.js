// ===== VOX1: the class voices. Only the lines for your current class and weapon are loaded; one line plays at a time, a repeat of a line waits, an ultimate takes priority. Its own volume slider, separate from music and effects, and optional subtitles with the meaning.
// Files are audio/battle/<class>_<slot>.mp3, recorded by tools/voice/record-battle.js. =====
try{(()=>{
 const pool=new Map(),MAX=18,dur=4;let cur=null,curUlt=false,lastAt=0;const lastLine={};
 const fileOf=sk=>{if(!sk||!sk.cls||!sk.jp)return null;if(sk.klass)return sk.cls+'_c'+sk.idx;const s=WPN[sk.w].ars.slot;return sk.cls+'_'+(s=='m'?'m'+sk.idx:s)};
 const srcOf=f=>'audio/battle/'+f+'.mp3';
 const vol=()=>{const v=cel.opt.voxv;return v==null?.8:v};
 function get(f){let a=pool.get(f);if(a){pool.delete(f);pool.set(f,a);return a}a=new Audio(srcOf(f));a.preload='auto';pool.set(f,a);while(pool.size>MAX){const k=pool.keys().next().value,o=pool.get(k);if(o&&!o.paused)break;pool.delete(k);try{o.src=''}catch(_){}}return a}
 // what you hold and the class you are: the only lines worth having ready
 let sig='';function warm(){try{const s=(CLASS7.cur()||'')+'|'+wp;if(s===sig)return;sig=s;for(const sk of SK1.classSkills().concat(SK1.weaponSkills())){const f=fileOf(sk);if(f)get(f)}}catch(_){}}
 setInterval(()=>{try{if(entered)warm()}catch(_){}},1000);
 function sub(sk){if(cel.opt.voxs===0)return;let b=document.getElementById('vox9');if(!b){b=document.createElement('div');b.id='vox9';document.body.appendChild(b)}b.innerHTML='<b></b><small></small>';b.querySelector('b').textContent=sk.jp;b.querySelector('small').textContent=sk.ro+' — '+sk.en;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(sub.t);sub.t=setTimeout(()=>b.classList.remove('on'),sk.ult?2200:1400)}
 function say(sk){const f=fileOf(sk);if(!f)return false;const now=performance.now(),v=vol();sub(sk);if(v<=0)return false;if(!sk.ult){if(now-lastAt<650)return false;if(now-(lastLine[f]||0)<2500)return false;if(cur&&!cur.paused&&curUlt)return false}if(cur&&!cur.paused){try{cur.pause()}catch(_){}}const a=get(f);lastLine[f]=now;lastAt=now;cur=a;curUlt=!!sk.ult;try{a.currentTime=0;a.volume=Math.min(1,v);const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}return true}
 window.VOX1={say,fileOf,get pool(){return pool.size},warm,get cur(){return cur}};
})()}catch(e){console.error('VOX1',e)}
