// World restoration (docs/story-proposal.md, stage 3): a realm is Silent until its word is spoken, Waking until its guardian rests, then Restored. Colour and music follow
// (a drained, hushed Silent world; the realm's own music once Waking; full colour and drifting lights when Restored); the Plaza gets a lantern strand per restored realm
// and a festival, with its own music, when all five are back. Run: node tests/restore.js   (SHOTS=<dir> saves screenshots)
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:500,own:{fist:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:20,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});
 await p.evaluate(()=>{try{document.querySelector('#intro60 button').click()}catch(_){}});await sleep(700);await p.evaluate(()=>{try{document.getElementById('bp').click()}catch(_){}});await sleep(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}try{RPG.guide.stop()}catch(_){}});await sleep(500);
 const shot=async n=>{if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,n+'.png')})}};
 const S=()=>p.evaluate(()=>{RESTORE1.apply();const h=RESTORE1.here();return{h,wst:document.documentElement.dataset.wst||'',filter:getComputedStyle(document.getElementById('c')).filter,mood:REALM10.mood(),restored:RESTORE1.restored()}});
 await p.evaluate(()=>{const w=WORD9.state.w['rootbound'];if(w)w.ok=0;delete WBOSS13.state.w['rootbound'];enterWorld('rootbound')});await sleep(3200);
 const s0=await S();ok('a world whose word is lost is Silent: drained colour, hushed music',s0.h&&s0.h.st==0&&s0.wst=='0'&&/saturate/.test(s0.filter)&&s0.mood=='silent',s0);await sleep(2600);await shot('w-silent');
 await p.evaluate(()=>{WORD9.state.w['rootbound']=Object.assign(WORD9.state.w['rootbound']||{got:[],tr:0},{ok:1})});const s1=await S();
 ok('speaking its word wakes it: its own music returns, colour nearly back',s1.h.st==1&&s1.wst=='1'&&s1.mood!='silent',s1);
 await p.evaluate(()=>{WBOSS13.state.w['rootbound']=1;RESTORE1.apply()});await sleep(2800);const s2=await S();await shot('w-restored');
 ok('its guardian at rest restores it: no filter at all, counted as restored',s2.h.st==2&&s2.wst==''&&(s2.filter=='none'||!s2.filter)&&s2.restored==1,s2);
 await p.evaluate(()=>enterWorld('mytestworld'));await sleep(3000);const own=await S();ok('a world the player builds is never greyed or hushed, only the story realms are',own.h===null&&own.wst==''&&own.mood!='silent',own);
 ok('the music system knows the hushed and festival moods',await p.evaluate(()=>!!(MUS7.MOODS.silent&&MUS7.MOODS.festival&&MUS7.MOODS.silent.songs.length==2)));
 // the Plaza: one lantern strand per restored realm, a festival when all five are back
 await p.evaluate(()=>enterWorld('plaza'));await sleep(2500);const pl=await S();ok('in the Plaza no filter, and the plaza mood until all five are back',pl.wst==''&&pl.mood!='festival',pl);
 await p.evaluate(()=>{for(const n of['rootbound-inf','rootbound-gal','rootbound-sea','rootbound-cry']){WORD9.state.w[n]=Object.assign(WORD9.state.w[n]||{got:[],tr:0},{ok:1});WBOSS13.state.w[n]=1}});
 const fe=await S();ok('all five restored: the Plaza has its festival music',fe.restored==5&&fe.mood=='festival',fe);await sleep(800);await shot('plaza-festival');
 const ph=await p.evaluate(async()=>{ROOTLINK.open();await new Promise(r=>setTimeout(r,500));const t=document.querySelector('#rlk .rlk-world').textContent;ROOTLINK.close();return t});ok('the phone shows how many worlds are restored',/5 of 5 worlds restored/.test(ph),ph);
 const mu=await p.evaluate(async()=>{const W=n=>new Promise(r=>setTimeout(r,n));try{startBGM()}catch(_){}await W(1500);const out={festival:{mood:MUS7.mood,song:MUS7.song,ids:MUS7.MOODS.festival.songs.map(s=>s.id)}};
  lvl=60;try{GUARD16.blocks=()=>false}catch(_){}try{BIOME17.locks=()=>false}catch(_){}const n='rootbound-sea';if(WORD9.state.w[n])WORD9.state.w[n].ok=0;delete WBOSS13.state.w[n];enterWorld(n);await W(5000);
  out.silent={cur,mood:MUS7.mood,song:MUS7.song,ids:MUS7.MOODS.silent.songs.map(s=>s.id)};return out});
 ok('the music engine really plays the festival songs in the Plaza, and the hushed songs in a Silent world',mu.festival.ids.includes(mu.festival.song)&&mu.silent.ids.includes(mu.silent.song),mu);
 ok('no page errors',errs.length==0,errs.slice(0,3));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,500));process.exit(1)});
