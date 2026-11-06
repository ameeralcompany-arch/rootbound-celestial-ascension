// The story layer (docs/story-proposal.md): Journal pages unlock from the game's own records (a realm seen, its word spoken, its guardian at rest, dungeons cleared),
// Lavi speaks her recorded line at those moments but never in the middle of a fight, unlocked pages survive a reload, the Journal opens from the phone and shows
// locked pages with a hint, the phone counts unread pages, and no religious names are left in what players read. Run: node tests/story.js
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,500):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:500,own:{fist:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:2,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
const require_lines=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'../tools/voice/town-lines.json'),'utf8')).lines;
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 const boot=async()=>{await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await p.evaluate(()=>{try{document.querySelector('#intro60 button').click()}catch(_){}});await sleep(700);
  await p.evaluate(()=>{try{document.getElementById('bp').click()}catch(_){}});await sleep(500);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await sleep(500);
  await p.evaluate(()=>{enterWorld('plaza');try{RPG.guide.stop()}catch(_){}window.SAID=[];const g=RPG.guide.say;RPG.guide.say=function(id){SAID.push(id);return g.apply(this,arguments)}});await sleep(1200)};
 await p.goto(FILE,{waitUntil:'commit'});await boot();
 const a=await p.evaluate(()=>{STORY1.check();return{got:STORY1.got,n:STORY1.PAGES.length}});
 ok('a new traveller starts with the first pages only',a.got.includes('wake')&&a.got.includes('plaza')&&!a.got.includes('silence')&&!a.got.includes('w0_word'),a);
 // seeing a realm, then its word, then its guardian, from the game's own records
 const w=await p.evaluate(async()=>{const W=n=>new Promise(r=>setTimeout(r,n));enterWorld('rootbound');await W(1500);STORY1.check();const s1=STORY1.got.includes('w0_seen');
  WORD9.state.w['rootbound']=Object.assign(WORD9.state.w['rootbound']||{got:[],tr:0},{ok:1});STORY1.check();const s2=STORY1.got.includes('w0_word');
  WBOSS13.state.w['rootbound']=1;STORY1.check();const s3=STORY1.got.includes('w0_guard');for(let i=0;i<6;i++)STORY1.check();return{s1,s2,s3,said:SAID.slice()}});
 ok('visiting the first world unlocks its page',w.s1);ok('speaking its word unlocks the next',w.s2);ok('its guardian at rest unlocks the third',w.s3);
 ok('Lavi speaks her recorded lines for them, one at a time',['st_w1_letters','st_word','st_guard_root'].every(id=>w.said.includes(id)),w.said);
 ok('the lines exist as recordings',await p.evaluate(()=>['st_silence','st_word','st_guard_root','st_shadow','st_end'].every(id=>window.LAVIVOICE&&LAVIVOICE[id]&&LAVIVOICE[id].dur>1)));
 // never over a fight: in a dungeon run she waits
 const q=await p.evaluate(()=>{SAID.length=0;const b0=STORY1.busy;STORY1.busy=()=>true;DG.S.clr=DG.S.clr||{};DG.S.clr.abyss={normal:1};STORY1.check();STORY1.check();const during=SAID.slice();STORY1.busy=b0;STORY1.check();STORY1.check();return{during,after:SAID.slice(),got:STORY1.got}});
 ok('during a dungeon run Lavi stays quiet, and speaks after',q.during.length==0&&q.after.includes('st_dungeon_first'),q);
 ok('clearing the Eternal Abyss unlocks the shadow page',q.got.includes('dg_shadow'));
 // the phone counts unread pages, and opens the Journal
 await p.evaluate(()=>ROOTLINK.open());await p.waitForFunction(()=>getComputedStyle(document.querySelector('#rlk .rlk-dev')).opacity=='1',null,{timeout:6000}).catch(()=>{});
 const ph=await p.evaluate(()=>({bdg:document.querySelector('#rlk .rlk-app[data-app=journal] .rlk-bdg').textContent,unread:STORY1.unread,apps:document.querySelectorAll('#rlk .rlk-app').length}));
 ok('the phone shows how many pages are unread',ph.unread>0&&ph.bdg==String(ph.unread),ph);
 await p.click('#rlk .rlk-app[data-app=journal]');await p.waitForFunction(()=>STORY1.on,null,{timeout:5000}).catch(()=>{});await sleep(400);
 const j=await p.evaluate(()=>{const e=document.getElementById('stj');return{on:STORY1.on,count:e.querySelector('.stj-count').textContent,title:e.querySelector('.stj-page h1').textContent,locked:e.querySelectorAll('.stj-list .lock').length,newb:e.querySelectorAll('.stj-list i').length}});
 ok('the Journal opens from the phone, on an unread page',j.on&&!!j.title&&/of 32 pages/.test(j.count),j);
 ok('pages not yet earned are hidden, with a hint',j.locked>5,j.locked);
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'journal.png')})}
 await p.click('#stj .stj-list button.lock');await sleep(200);ok('a locked page shows what to do',await p.evaluate(()=>!!document.querySelector('#stj .stj-page .hint')&&document.querySelector('#stj .stj-page .hint').textContent.length>8));
 await p.keyboard.press('Escape');await sleep(200);ok('Esc closes the Journal',await p.evaluate(()=>!STORY1.on));
 // the townsfolk remember: a story line once, in their own voice, then their everyday chatter; new lines arrive with progress
 const tw=await p.evaluate(()=>{const played=[];const A=window.Audio;window.Audio=function(src){const o=new A(src);played.push(src);o.play=()=>Promise.resolve();return o};STORY2.reset();
  const n=NPC2.list().find(x=>x.id=='mira');const out={has0:STORY2.has('mira')};NPC2.onTalk(n);out.l1=n.line;NPC2.onTalk(n);out.l2=n.line;out.has1=STORY2.has('mira');
  const pip=NPC2.list().find(x=>x.id=='pip');NPC2.onTalk(pip);out.pip=pip.line;out.played=played.slice();window.Audio=A;out.lines=Object.values(TOWNVOICE).filter(l=>l.need!='side').length;
  out.npcs=[...new Set(Object.values(TOWNVOICE).map(l=>l.npc))].length;out.side=Object.values(TOWNVOICE).filter(l=>l.need=='side').length;return out});
 ok('Mira has something to say, says her story line once, then chats',tw.has0&&/hear the Rootways/.test(tw.l1)&&!/hear the Rootways/.test(tw.l2),tw);
 ok('the next unlocked line waits its turn (her world line, after the first)',tw.has1===true,tw.has1);
 ok('each line plays its own recording',tw.played.some(x=>x.endsWith('town/mira_1.mp3'))&&tw.played.some(x=>x.includes('town/pip_')),tw.played);
 ok('35 story lines and 16 side-story lines for 12 townsfolk, every file on disk',tw.lines==35&&tw.side==16&&tw.npcs==12&&Object.keys(require_lines()).every(id=>fs.existsSync(path.join(__dirname,'../audio/town/'+id+'.mp3'))),{lines:tw.lines,npcs:tw.npcs});
 // it survives a reload
 const before=await p.evaluate(()=>STORY1.got.length);await p.reload({waitUntil:'commit'});await boot();const after=await p.evaluate(()=>STORY1.got.length);
 ok('unlocked pages are kept after a reload',after>=before&&before>=7,{before,after});
 // nothing religious left in the names players read
 const words=await p.evaluate(()=>{const txt=[...Object.values(DG.boss.DEF).flatMap(d=>[d.n,d.ti,...(d.names||[])]),...Object.values(CLASS7.C).map(c=>c.n),...(DG.D||[]).map(d=>d.n||''),...STORY1.PAGES.flatMap(p=>[p.t,p.x])].join(' | ');const bad=txt.match(/\b(saint|sanctuary|temple|heaven|halo|holy|divine|demon|angel|seraph|cathedral|shrine|prayed?|blessing|sacred)\b/ig);return bad||[]});
 ok('no religious names in boss, class, dungeon or story text',words.length==0,words);
 ok('no page errors',errs.length==0,errs.slice(0,3));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,500));process.exit(1)});
