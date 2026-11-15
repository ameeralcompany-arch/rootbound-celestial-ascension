// Lavi, the guidance fairy, played through the game's own code in a headless browser (silent: every recording is recorded as "played" and muted):
//   each line is spoken once: the tour never says a line twice, a reload does not replay her welcome or a step she already said, a line she offers on her
//   own waits while you fight and then plays once, and never again; she hides under the reconnect cover; you can carry her anywhere (press, hold, drag),
//   she stays inside the window and remembers the spot after a reload, a drag never opens her menu or makes her talk, a click opens a menu of real pages,
//   one tutorial step can be replayed without touching your tour progress, another voice stops hers, and muting does not restart her line.
//   node tests/lavi.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},300000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:20,own:{fist:1},wp:'fist',bar:[1],done:{},xp:0,lvl:1,made:true,stats:{break:0,kill:0},look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});
 const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(sd=>{if(!localStorage.getItem('seeded_lavi')){localStorage.setItem('seeded_lavi','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1');localStorage.setItem('rb_lavi_test','1')}
  // every recording that starts is written down and "ends" a moment later, so the test runs fast and makes no sound
  window.__plays=[];window.__paused=0;const pl=HTMLMediaElement.prototype.play,pa=HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.play=function(){this.muted=true;window.__plays.push(String(this.src||'').replace(/^.*\/audio\//,''));const a=this;setTimeout(()=>{if(!a.__stopped)a.dispatchEvent(new Event('ended'))},80);return Promise.resolve()};
  HTMLMediaElement.prototype.pause=function(){this.__stopped=true;window.__paused++;try{return pa.call(this)}catch(_){}}},SAVE);
 const errs=[];const page=async()=>{const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/Lavi|RPG|VOX1/.test(m.text()))errs.push(m.text().slice(0,300))});await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready&&window.RPG&&RPG.guide,null,{timeout:90000});await p.evaluate(()=>enterWorld('plaza'));return p};
 const lavi=p=>p.evaluate(()=>window.__plays.filter(s=>s.startsWith('lavi/')).map(s=>s.slice(5,-4)));
 let p=await page();
 // ---- the tour: welcome, then the first step, every line once
 await p.waitForFunction(()=>RPG.guide.touring,null,{timeout:20000}).catch(()=>{});
 await p.waitForFunction(()=>{const b=document.querySelector('#lavib .ac button.pri');return b&&/go/i.test(b.textContent)},null,{timeout:20000}).catch(()=>{});
 let L=await lavi(p);ok('a new player meets her: the welcome is spoken, each line once',L.filter(x=>x=='hello').length==1&&L.filter(x=>x=='intro2').length==1&&L.filter(x=>x=='intro3').length==1,L);
 await p.click('#lavib .ac button.pri');await p.waitForFunction(()=>RPG.guide.stepId=='profile'&&window.__plays.some(s=>/tour_profile/.test(s)),null,{timeout:10000}).catch(()=>{});await sleep(1500);
 L=await lavi(p);ok('the first step\'s line is said once, not again when its buttons appear',L.filter(x=>x=='tour_profile').length==1&&!!(await p.$('#lavib.on')),L);
 const said=await p.evaluate(()=>Object.keys(RPG.S.said));ok('what she has said is remembered with your progress',['hello','intro2','intro3','tour_profile'].every(k=>said.includes(k)),said);
 // ---- reload: the welcome and the step are not spoken again
 await p.evaluate(()=>RPG.save());await p.close();p=await page();
 await p.waitForFunction(()=>RPG.guide.touring&&RPG.guide.stepId=='profile',null,{timeout:20000}).catch(()=>{});await sleep(2500);
 L=await lavi(p);ok('after a reload she does not replay her welcome or the step she already said',L.length==0&&await p.evaluate(()=>RPG.guide.touring&&RPG.guide.stepId=='profile'),L);
 ok('the step still reads on screen (text only)',await p.evaluate(()=>{const b=document.getElementById('lavib');return !!b&&b.classList.contains('on')&&b.querySelector('.tx').textContent.length>5}));
 // ---- a line she offers herself waits for a calm moment, then plays once, and never again
 await p.evaluate(()=>{RPG.guide.stop();RPG.guide.cfg.gap=300;RPG.guide.cfg.calm=200;window.__plays.length=0;hurtF=1});
 const q1=await p.evaluate(()=>({r:RPG.guide.say('levelup',{auto:1}),q:RPG.guide.queue,sp:RPG.guide.speaking}));
 ok('in a fight she keeps it for later instead of talking',q1.r===false&&q1.q.includes('levelup')&&!q1.sp,q1);
 await p.evaluate(()=>{hurtF=0});await p.waitForFunction(()=>window.__plays.some(s=>/levelup/.test(s)),null,{timeout:12000}).catch(()=>{});
 L=await lavi(p);ok('once it is calm she says it, once',L.filter(x=>x=='levelup').length==1,L);
 await sleep(400);const again=await p.evaluate(()=>{const r=RPG.guide.say('levelup',{auto:1});return{r,q:RPG.guide.queue}});await sleep(1500);L=await lavi(p);
 ok('she never offers the same line again',again.r===false&&!again.q.includes('levelup')&&L.filter(x=>x=='levelup').length==1,{again,L});
 // ---- hidden under the reconnect cover
 const cov=await p.evaluate(async()=>{window.RB_COVER=true;await new Promise(r=>setTimeout(r,300));const o={quiet:RPG.guide.quiet(),shown:getComputedStyle(document.getElementById('lavi')).display!='none'};window.RB_COVER=false;await new Promise(r=>setTimeout(r,300));o.back=getComputedStyle(document.getElementById('lavi')).display!='none';return o});
 ok('she hides while the game reconnects, and comes back after',cov.quiet&&!cov.shown&&cov.back,cov);
 // ---- carry her: press, hold, drag
 await p.evaluate(()=>{document.getElementById('lavib').classList.remove('on')});await sleep(800);
 const r0=await p.evaluate(()=>{const r=document.getElementById('lavibtn').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,shown:r.width>0&&getComputedStyle(document.getElementById('lavibtn')).display!='none'}});
 await p.evaluate(()=>{window.__plays.length=0});await p.mouse.move(r0.x,r0.y);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(r0.x+i*40,r0.y-i*22);await sleep(16)}
 const mid=await p.evaluate(()=>({drag:!!RPG.guide.st.drag,cls:document.getElementById('lavi').classList.contains('drag')}));await p.mouse.up();await sleep(900);
 const dr=await p.evaluate(()=>({pos:RPG.guide.pos,x:RPG.guide.st.x,y:RPG.guide.st.y,menu:document.getElementById('lavib').classList.contains('on'),W:innerWidth,H:innerHeight}));L=await lavi(p);
 ok('press and hold carries her, with a soft glow while held',r0.shown&&mid.drag&&mid.cls,{r0,mid});
 ok('on release she stays where you put her, and the spot is saved',!!dr.pos&&Math.abs(dr.x-(r0.x+480))<40&&Math.abs(dr.pos.fx*dr.W-dr.x)<30,dr);
 ok('a drag never opens her menu or makes her talk',!dr.menu&&L.length==0,{menu:dr.menu,L});
 // she stays inside the window
 const r1=await p.evaluate(()=>{const r=document.getElementById('lavibtn').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});
 await p.mouse.move(r1.x,r1.y);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(r1.x-i*200,r1.y+i*120);await sleep(16)}await p.mouse.up();await sleep(900);
 const cl=await p.evaluate(()=>({x:RPG.guide.st.x,y:RPG.guide.st.y,W:innerWidth,H:innerHeight}));ok('dragged past the edge, she stays inside the window',cl.x>=40&&cl.y<=cl.H-50&&cl.x<=cl.W-40,cl);
 // ---- click (no drag): her menu, made of real pages
 const r2=await p.evaluate(()=>{const r=document.getElementById('lavibtn').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});await p.mouse.click(r2.x,r2.y);await sleep(300);
 const mn=await p.evaluate(()=>{const b=document.getElementById('lavib');return{on:b.classList.contains('on')&&b.classList.contains('menu'),items:[...b.querySelectorAll('.ac button')].map(x=>x.textContent)}});
 ok('a click opens her menu: what next, guides, dungeons, items and tools, replay, her spot, voice, close',mn.on&&['What should I do next?','Beginner guide','Dungeons','Items and tools','Show me a part again','Go back to my corner','Close'].every(t=>mn.items.includes(t)),mn);
 await p.evaluate(()=>{[...document.querySelectorAll('#lavib .ac button')].find(x=>x.textContent=='Beginner guide').click()});await sleep(400);
 ok('"Beginner guide" opens the real guide',await p.evaluate(()=>GUIDE10.isOpen));await p.evaluate(()=>{try{GUIDE10.close()}catch(_){}try{NAV16.closeAll()}catch(_){}});
 // replay one step without touching the tour progress
 const before=await p.evaluate(()=>JSON.stringify(RPG.S.tour));await p.evaluate(()=>{window.__plays.length=0;RPG.guide.menu('replay')});await sleep(200);
 await p.evaluate(()=>{[...document.querySelectorAll('#lavib .ac button')].find(x=>x.textContent=='The hotbar').click()});await p.waitForFunction(()=>window.__plays.some(s=>/tour_hotbar/.test(s)),null,{timeout:8000}).catch(()=>{});
 const rp=await p.evaluate(()=>({touring:RPG.guide.touring,step:RPG.guide.stepId}));await p.evaluate(()=>RPG.guide.stop());const after=await p.evaluate(()=>JSON.stringify(RPG.S.tour));L=await lavi(p);
 ok('"Show me a part again" replays that one step, spoken',rp.touring&&rp.step=='hotbar'&&L.includes('tour_hotbar'),{rp,L});
 ok('and leaves your tour progress as it was',before==after,{before,after});
 // back to her corner
 await p.evaluate(()=>RPG.guide.resetPos());await sleep(900);ok('"Go back to my corner" forgets the spot',await p.evaluate(()=>RPG.guide.pos===null));
 // ---- reload: the spot is remembered
 await p.evaluate(()=>{RPG.S.pos={fx:.7,fy:.4};RPG.S.tour.off=1;RPG.save()});await p.close();p=await page();await p.waitForFunction(()=>RPG.guide.st&&Math.abs(RPG.guide.st.x-innerWidth*.7)<30,null,{timeout:20000}).catch(()=>{});
 const kp=await p.evaluate(()=>({x:RPG.guide.st.x,y:RPG.guide.st.y,W:innerWidth,H:innerHeight}));ok('after a reload she is where you left her',Math.abs(kp.x-kp.W*.7)<30&&Math.abs(kp.y-kp.H*.4)<30,kp);
 // ---- one voice at a time
 const vx=await p.evaluate(async()=>{try{RPG.guide.stop()}catch(_){}window.__paused=0;RPG.guide.say('stronger',{force:1});await new Promise(r=>setTimeout(r,30));const sp=RPG.guide.speaking;
  const fake={paused:false,ended:false,currentTime:0,duration:5,addEventListener(){}};VOX1.claim(fake,'town');const o={sp,paused:window.__paused,still:RPG.guide.speaking,busy:VOX1.busy(),quiet:RPG.guide.quiet()};fake.paused=true;o.after=VOX1.busy();return o});
 ok('another voice starting stops hers (her words stay on screen), and she waits while it talks',vx.sp=='stronger'&&vx.paused>=1&&vx.still=='stronger'&&vx.busy&&vx.quiet&&!vx.after,vx);
 // ---- muting her mid-line does not start the line again
 const mu=await p.evaluate(async()=>{RPG.guide.setMute(0);window.__plays.length=0;RPG.guide.say('stronger2',{force:1});await new Promise(r=>setTimeout(r,20));document.querySelector('#lavib [data-m]').click();await new Promise(r=>setTimeout(r,300));const o={plays:window.__plays.filter(s=>/stronger2/.test(s)).length,mute:RPG.guide.opt().mute};RPG.guide.setMute(0);return o});
 ok('muting her mid-line does not replay it',mu.plays==1&&mu.mute==1,mu);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
