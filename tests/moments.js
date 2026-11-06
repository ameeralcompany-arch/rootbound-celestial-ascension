// The story's cinematic moments (docs/story-proposal.md, stage 5): Waking the first time you stand in a world after speaking its word, Restored the first time after its
// guardian rests (a wave of colour), each once; the ending on coming home to the Plaza after the last Journal page, with Lavi's last words in order; the Journal can play the
// ending again; the overlay never blocks the game and is removed afterwards. Run: node tests/moments.js   (SHOTS=<dir> saves screenshots)
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html'),SHOTS=process.env.SHOTS;
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},220000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:500,own:{fist:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:60,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});
 await p.evaluate(()=>{try{document.querySelector('#intro60 button').click()}catch(_){}});await sleep(700);await p.evaluate(()=>{try{document.getElementById('bp').click()}catch(_){}});await sleep(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}try{RPG.guide.stop()}catch(_){}MOMENT1.reset();window.SAID=[];const g=RPG.guide.say;RPG.guide.say=function(id){SAID.push(id);return g.apply(this,arguments)}});await sleep(500);
 const shot=async n=>{if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,n+'.png')})}};
 // Waking
 await p.evaluate(()=>{WORD9.state.w['rootbound']=Object.assign(WORD9.state.w['rootbound']||{got:[],tr:0},{ok:1});delete WBOSS13.state.w['rootbound'];enterWorld('rootbound')});
 await p.waitForFunction(()=>MOMENT1.on,null,{timeout:12000}).catch(()=>{});const w=await p.evaluate(()=>({k:MOMENT1.kind,pe:getComputedStyle(document.getElementById('moment1')||document.body).pointerEvents}));
 ok('standing in a world after speaking its word plays the Waking moment, over the game, never blocking it',w.k=='wake'&&w.pe=='none',w);await sleep(1300);await shot('m-wake');
 await p.waitForFunction(()=>!MOMENT1.on,null,{timeout:8000}).catch(()=>{});ok('it ends by itself and its canvas is removed',await p.evaluate(()=>!MOMENT1.on&&!document.getElementById('moment1')));
 // Restored
 await p.evaluate(()=>{WBOSS13.state.w['rootbound']=1;enterWorld('plaza')});await sleep(4500);await p.evaluate(()=>enterWorld('rootbound'));
 await p.waitForFunction(()=>MOMENT1.on,null,{timeout:12000}).catch(()=>{});const r=await p.evaluate(()=>MOMENT1.kind);ok('after its guardian rests, coming back plays the Restored moment',r=='rest',r);
 await sleep(2400);await shot('m-restored');await p.waitForFunction(()=>!MOMENT1.on,null,{timeout:10000}).catch(()=>{});
 await p.evaluate(()=>enterWorld('plaza'));await sleep(4500);await p.evaluate(()=>enterWorld('rootbound'));await sleep(5000);ok('each moment plays only once',await p.evaluate(()=>!MOMENT1.on));
 // the ending
 await p.evaluate(()=>{STORY1.S.got.end=Date.now();SAID.length=0;enterWorld('plaza')});await p.waitForFunction(()=>MOMENT1.on,null,{timeout:12000}).catch(()=>{});
 const e0=await p.evaluate(()=>MOMENT1.kind);await sleep(9500);await shot('m-ending');const e1=await p.evaluate(()=>SAID.slice());
 ok('coming home after the last page plays the ending, and Lavi speaks her last words in order',e0=='end'&&e1[0]=='st_end_a'&&e1.includes('st_end_b'),{e0,e1});
 await p.evaluate(()=>MOMENT1.stop());await sleep(300);ok('when it ends she invites you to the festival',await p.evaluate(()=>SAID.includes('st_end_d')&&!MOMENT1.on));
 // the Journal can play it again
 await p.evaluate(()=>{STORY1.open()});await sleep(300);await p.evaluate(()=>{const b=[...document.querySelectorAll('#stj .stj-list button')].find(x=>x.dataset.p=='end');b.click()});await sleep(200);
 const btn=await p.evaluate(()=>!!document.querySelector('#stj .stj-replay'));ok('the last Journal page has a Watch the ending button',btn);
 if(btn){await p.click('#stj .stj-replay');await sleep(400);ok('and it plays the ending again',await p.evaluate(()=>MOMENT1.kind=='end'&&!STORY1.on));await p.evaluate(()=>MOMENT1.stop())}
 ok('no page errors',errs.length==0,errs.slice(0,3));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,500));process.exit(1)});
