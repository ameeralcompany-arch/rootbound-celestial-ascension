// Side stories (docs/story-proposal.md, stage 4): a townsperson offers a story when you talk to them, it tracks what you really do, and talking to them again hands it in
// (their recorded thank-you, gems, a Journal page). Covers a counter story (Pip), an item story that takes the items (Tobi), a visit story (Kael), a night-only visit (Lumi),
// a dungeon story (Mira), stories that wait for their moment in the main story, the phone's Stories list, and progress kept across a reload. Run: node tests/side.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:1000,own:{fist:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:12,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 const boot=async()=>{await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await p.evaluate(()=>{try{document.querySelector('#intro60 button').click()}catch(_){}});await sleep(700);
  await p.evaluate(()=>{try{document.getElementById('bp').click()}catch(_){}});await sleep(500);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}try{RPG.guide.stop()}catch(_){}});await sleep(500);
  await p.evaluate(()=>{enterWorld('plaza');try{GUARD16.blocks=()=>false}catch(_){}try{BIOME17.locks=()=>false}catch(_){}window.PLAYED=[];const A=window.Audio;window.Audio=function(src){const o=new A(src);PLAYED.push(src);o.play=()=>Promise.resolve();return o}});await sleep(1500)};
 await p.goto(FILE,{waitUntil:'commit'});await boot();
 const talk=id=>p.evaluate(id=>{const n=NPC2.list().find(x=>x.id==id);NPC2.onTalk(n);return n.line},id);
 // Pip: offered, tracked from the real block counter, handed in
 await p.evaluate(()=>{STORY2.reset();SIDE1.reset();STORY2.markHeard('pip')});
 const pip0=await talk('pip');const a=await p.evaluate(()=>({act:SIDE1.active().map(q=>q.id),spark:STORY2.has('pip'),played:PLAYED.slice(-1)[0]}));
 ok('Pip offers his story when you talk to him, in his own voice',/dragon egg/.test(pip0)&&a.act.includes('pip')&&/side_pip_ask/.test(a.played||''),{line:pip0,a});
 const mid=await p.evaluate(()=>{stat('break',10);return{p:SIDE1.prog(SIDE1.Q[0]),ready:SIDE1.ready(SIDE1.Q[0])}});ok('breaking blocks moves it on, from the game\'s own counter',mid.p>.35&&mid.p<.5&&!mid.ready,mid);
 const g0=await p.evaluate(()=>{stat('break',20);return gems});const pip1=await talk('pip');const r=await p.evaluate(()=>({gems,done:SIDE1.done('pip'),page:(STORY1.check(),STORY1.got.includes('side_pip'))}));
 ok('talking to him again hands it in: his thank-you, gems and a Journal page',/Kevin/.test(pip1)&&r.done&&r.gems==g0+150&&r.page,{pip1,r,g0});
 // stories wait for their moment: Tobi asks only after you have seen an Inferno world
 const t0=await p.evaluate(()=>{STORY2.markHeard('tobi');return SIDE1.has('tobi')});
 ok('Tobi\'s story waits until you have been to the Inferno',t0===false,t0);
 await p.evaluate(()=>{STORY1.S.got.w1_seen=Date.now()});const tobi=await talk('tobi');ok('then he asks for Magma Shards',/Magma Shards/.test(tobi),tobi);
 const tk=await p.evaluate(()=>{inv[208]=7;return{ready:SIDE1.ready(SIDE1.Q.find(q=>q.id=='tobi'))}});await talk('tobi');const tk2=await p.evaluate(()=>({left:inv[208]|0,done:SIDE1.done('tobi')}));
 ok('carrying five Magma Shards finishes it, and handing it in takes them',tk.ready&&tk2.done&&tk2.left==2,{tk,tk2});
 // Kael: a visit after accepting. Lumi: the same, but only at night
 await p.evaluate(()=>{STORY1.S.got.w3_seen=Date.now();STORY1.S.got.w2_seen=Date.now();STORY2.markHeard('kael');STORY2.markHeard('lumi');});
 await talk('kael');await talk('lumi');const acc=await p.evaluate(()=>SIDE1.active().map(q=>q.id));ok('Kael and Lumi give their stories',acc.includes('kael')&&acc.includes('lumi'),acc);
 await p.evaluate(()=>{lvl=60;enterWorld('rootbound-sea')});await sleep(4500);const kv=await p.evaluate(()=>({k:SIDE1.ready(SIDE1.Q.find(q=>q.id=='kael')),cur}));ok('visiting an Abyssal Sea world completes Kael\'s letter',kv.k,kv);
 await p.evaluate(()=>{clock=()=>0;enterWorld('rootbound-gal')});await sleep(4500);const day=await p.evaluate(()=>({l:SIDE1.ready(SIDE1.Q.find(q=>q.id=='lumi')),night}));
 await p.evaluate(()=>{clock=()=>.5});await sleep(4000);const nt=await p.evaluate(()=>({l:SIDE1.ready(SIDE1.Q.find(q=>q.id=='lumi')),night}));
 ok('Lumi\'s lantern is found only at night',!day.l&&nt.l,{day,nt});
 // Mira: clear a dungeon after accepting
 await p.evaluate(()=>{enterWorld('plaza');STORY1.S.got.dg_first=Date.now();STORY2.markHeard('mira');});await sleep(1500);
 const mira=await talk('mira');await p.evaluate(()=>{DG.S.clr=DG.S.clr||{};DG.S.clr.ruins=Object.assign(DG.S.clr.ruins||{},{hard:1,normal:1,nightmare:1})});await sleep(2600);
 ok('Mira\'s music box: asked, then found by clearing a dungeon',/music box/.test(mira)&&await p.evaluate(()=>SIDE1.ready(SIDE1.Q.find(q=>q.id=='mira'))),mira);
 // the phone lists the stories in progress
 const ph=await p.evaluate(async()=>{ROOTLINK.open();await new Promise(r=>setTimeout(r,500));const e=document.querySelector('#rlk .rlk-side');const t=e&&!e.hidden?e.textContent:'';ROOTLINK.close();return t});
 ok('the phone lists the stories in progress and who to talk to',/Talk to Kael/.test(ph)&&/Mira|Music Box/.test(ph),ph.slice(0,200));
 // kept across a reload
 const before=await p.evaluate(()=>JSON.stringify(SIDE1.S));await p.reload({waitUntil:'commit'});await boot();const after=await p.evaluate(()=>JSON.stringify(SIDE1.S));
 ok('side stories are kept after a reload',before==after,{before:before.slice(0,120),after:after.slice(0,120)});
 ok('no page errors',errs.length==0,errs.slice(0,3));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,500));process.exit(1)});
