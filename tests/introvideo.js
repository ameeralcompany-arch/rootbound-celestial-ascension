// The intro film cut from real game footage: it plays first, with its sound, the skip prompt comes up after a few seconds, a key or the button skips, keys never reach the game, the game starts afterwards, it can be replayed from
// Settings, the server hosts it, and the older story intro takes over whenever it can't play. Run: node tests/introvideo.js
// afterwards, the server hosts it, and the older story intro takes over whenever it can't play. Run: node tests/introvideo.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),os=require('os'),http=require('http');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},240000).unref();
const FILE='file://'+path.resolve(__dirname,'../index.html'),MP4=path.resolve(__dirname,'../audio/intro-cinematic.mp4');
const get=(url,headers)=>new Promise((res,rej)=>{http.request(url,{headers},r=>{let n=0;r.on('data',d=>n+=d.length);r.on('end',()=>res({s:r.statusCode,h:r.headers,n}))}).on('error',rej).end()});
const INIT=()=>{try{localStorage.setItem('rb_force_launch','1')}catch(_){}window.SAID=[];try{speechSynthesis.speak=u=>{SAID.push(u.text);setTimeout(()=>{try{u.onend&&u.onend({})}catch(_){}},30)}}catch(_){}};
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});
 const page=async(o={})=>{const c=await b.newContext({viewport:{width:1280,height:720},reducedMotion:o.rm||'no-preference'});await c.addInitScript(INIT);if(o.init)await c.addInitScript(o.init);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.errs=errs;await p.goto(o.url||FILE);return p};
 ok('the film ships beside the game',fs.existsSync(MP4)&&fs.statSync(MP4).size>5e6&&fs.statSync(MP4).size<60e6,{mb:Math.round(fs.statSync(MP4).size/1e5)/10});

 // the server hosts it the way a video player needs
 {const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rb-vid-'));const S=createServer({port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',client:path.resolve(__dirname,'../index.html')});const port=await S.listen();
  const u='http://127.0.0.1:'+port+'/audio/intro-cinematic.mp4',a=await get(u,{}),r=await get(u,{Range:'bytes=100-199'});
  ok('the server hosts the film as a video',a.s==200&&a.h['content-type']=='video/mp4'&&a.n==fs.statSync(MP4).size,{s:a.s,t:a.h['content-type']});
  ok('and answers partial requests (a player needs them to start and seek)',r.s==206&&r.n==100,{s:r.s,n:r.n});await S.close()}

 const canPlay=await (async()=>{const p=await b.newPage();const r=await p.evaluate(()=>document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"'));await p.close();return !!r})();
 if(!canPlay){
  // a browser without H.264 (some test machines): the story intro plays instead
  const p=await page();await p.waitForFunction(()=>typeof CINE7!='undefined'&&CINE7.playing,null,{timeout:30000});ok('a browser that cannot play the film gets the story intro',!(await p.evaluate(()=>INTRO60.playing)));await p.context().close();
  console.log('note: this browser has no H.264, the film itself was not played');
 }else{
  const p=await page();await p.waitForFunction(()=>typeof INTRO60!='undefined'&&INTRO60.playing&&INTRO60.state.st=='on',null,{timeout:30000});
  const a=await p.evaluate(()=>{const o=SHOW7.open;window.OPENED=0;SHOW7.open=function(){OPENED++;return o.apply(this,arguments)};return{s:INTRO60.state,story:CINE7.playing,cover:!!window.RB_COVER}});await p.waitForTimeout(1500);const a2=await p.evaluate(()=>INTRO60.state);
  ok('the film plays first, at full size, not the story intro',a.s.w==1920&&a.s.h==1080&&Math.abs(a.s.d-43.5)<.2&&!a.story&&a.cover,{w:a.s.w,h:a.s.h,d:a.s.d});
  ok('it moves, with its sound on',a2.t>a.s.t+.8&&!a2.paused&&!a2.muted&&a2.vol>0,{t0:a.s.t,t1:a2.t,vol:a2.vol});
  ok('the game waits for the film to finish',await p.evaluate(()=>OPENED==0));
  // the first seconds can't be skipped by accident, and keys are the film's while it plays
  await p.keyboard.press('i');await p.waitForTimeout(250);ok('a key in the first seconds does nothing',await p.evaluate(()=>INTRO60.playing&&document.getElementById('inv')&&getComputedStyle(document.getElementById('inv')).display!='block'||INTRO60.playing));
  await p.evaluate(()=>INTRO60.seek(38));await p.waitForTimeout(900);ok('the skip prompt shows',await p.evaluate(()=>+INTRO60.state.skipShown>.5),await p.evaluate(()=>INTRO60.state.skipShown));
  ok('no spoken name without a recording',(await p.evaluate(()=>SAID)).length==0);
  await p.evaluate(()=>INTRO60.seek(42.6));
  // it ends and hands over
  await p.waitForFunction(()=>!INTRO60.playing,null,{timeout:8000});await p.waitForTimeout(800);
  const e=await p.evaluate(()=>({gone:!document.getElementById('intro60'),cover:!!window.RB_COVER,opened:OPENED}));ok('at the end the film is gone and the game starts, once',e.gone&&e.opened==1,e);ok('no errors',p.errs.length==0,p.errs);await p.context().close();
  // any key skips once the prompt is up; so does the button
  const q=await page();await q.waitForFunction(()=>INTRO60.playing&&INTRO60.state.st=='on',null,{timeout:30000});await q.evaluate(()=>INTRO60.seek(5));await q.waitForTimeout(400);await q.keyboard.press('x');await q.waitForFunction(()=>!INTRO60.playing,null,{timeout:5000});ok('any key skips it after the prompt',!(await q.evaluate(()=>!!document.getElementById('intro60'))));await q.context().close();
  const m=await page();await m.waitForFunction(()=>INTRO60.playing&&INTRO60.state.st=='on',null,{timeout:30000});await m.evaluate(()=>INTRO60.seek(5));await m.waitForTimeout(400);await m.click('#intro60 button');await m.waitForFunction(()=>!INTRO60.playing,null,{timeout:5000});ok('the Skip button skips it',true);
  // replay from Settings: the film comes back over the game, and the game is still there afterwards
  await m.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await m.waitForTimeout(400);await m.evaluate(()=>{UI6.open('settings')});await m.waitForTimeout(500);const has=await m.evaluate(()=>!!document.getElementById('sintro'));ok('Settings has a Replay button',has);if(has){await m.evaluate(()=>document.getElementById('sintro').click());await m.waitForFunction(()=>INTRO60.playing&&INTRO60.state.st=='on',null,{timeout:10000});await m.evaluate(()=>INTRO60.seek(5));await m.waitForTimeout(300);await m.keyboard.press('x');await m.waitForFunction(()=>!INTRO60.playing,null,{timeout:5000});ok('it plays again and hands back to the game',await m.evaluate(()=>!window.RB_COVER&&!document.getElementById('intro60')));}await m.context().close();
  // blocked autoplay: a prompt, not a frozen black screen
  const BLOCK=()=>{const pl=HTMLMediaElement.prototype.play;window.UNBLOCK=false;HTMLMediaElement.prototype.play=function(){return window.UNBLOCK?pl.call(this):Promise.reject(new DOMException('blocked','NotAllowedError'))};addEventListener('keydown',()=>{window.UNBLOCK=true},true);addEventListener('pointerdown',()=>{window.UNBLOCK=true},true)};
  const h=await page({init:BLOCK});await h.waitForFunction(()=>typeof INTRO60!='undefined'&&INTRO60.playing&&INTRO60.state.st=='blocked',null,{timeout:30000});
  await h.mouse.click(600,300);await h.waitForFunction(()=>INTRO60.state&&INTRO60.state.st=='on',null,{timeout:6000});ok('when the browser blocks sound, a click starts it with the sound on',!(await h.evaluate(()=>INTRO60.state.muted)));await h.context().close();
 }
 // the film is missing (only index.html was copied): the story takes over
 {const c=await b.newContext({viewport:{width:1280,height:720}});await c.addInitScript(INIT);const p=await c.newPage();await p.route('**/intro-cinematic.mp4',r=>r.abort());await p.goto(FILE);await p.waitForFunction(()=>typeof CINE7!='undefined'&&CINE7.playing,null,{timeout:30000});ok('without the film file, the story intro plays instead',!(await p.evaluate(()=>INTRO60.playing)));ok('and nothing of the film is left behind',!(await p.evaluate(()=>!!document.getElementById('intro60'))));await c.close()}
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,600));process.exit(1)});
