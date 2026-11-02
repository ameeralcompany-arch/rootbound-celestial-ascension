// The story intro's song: scene cuts on the beat, the song leads the story clock, it stops cleanly, the last word, and it reaches the player in
// every version (a file opened from disk, the page the server hosts, after the sign-in reload, without the song). Run: node tests/introsong.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),os=require('os'),http=require('http');const {createServer}=require('../server/server');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},300000).unref();
const FILE='file://'+path.resolve(__dirname,'../index.html'),MP3=path.resolve(__dirname,'../audio/intro-song.mp3');
const get=(url,headers,method)=>new Promise((res,rej)=>{const q=http.request(url,{headers,method:method||'GET'},r=>{let n=0;r.on('data',d=>n+=d.length);r.on('end',()=>res({s:r.statusCode,h:r.headers,n}))});q.on('error',rej);q.end()});
// never out loud: the song is muted (--mute-audio) and the computer's voice is replaced by a recorder
const INIT=()=>{try{localStorage.setItem('rb_force_launch','1');localStorage.setItem('rb_story_intro','1')}catch(_){}window.SAID=[];try{speechSynthesis.speak=u=>{SAID.push(u.text);setTimeout(()=>{try{u.onend&&u.onend({})}catch(_){}},20)}}catch(_){}};
(async()=>{
 const launch=(free)=>chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio'].concat(free?['--autoplay-policy=no-user-gesture-required']:[])});
 const b=await launch(true);
 const page=async(o={})=>{const ctx=await(o.b||b).newContext({viewport:{width:1280,height:720},reducedMotion:o.rm||'no-preference'});await ctx.addInitScript(INIT);if(o.init)await ctx.addInitScript(o.init);const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/CINE7/.test(m.text()))p.errs.push(m.text())});p.ctx=ctx;if(o.route)await o.route(p);await p.goto(o.url||FILE);return p};
 const started=p=>p.waitForFunction(()=>CINE7.playing&&!CINE7.state.prep,null,{timeout:30000});
 ok('the song ships beside the game',fs.existsSync(MP3)&&fs.statSync(MP3).size>3e6);

 // ---- from a file on disk (the desktop app and a downloaded copy load the same way)
 {const p=await page();await started(p);
  const m=await p.evaluate(()=>{const S=CINE7.SONG,cuts=[];let on=true,last=-1,rates=[];for(const c of S.cuts){const pts=[c[1]].concat(c[2]?[c[2][1]]:[]);for(const t of pts){const k=(t-S.d0)/(S.beat/2);if(t>0&&Math.abs(k-Math.round(k))>.02)on=false;if(t<=last)on=false;last=t;cuts.push(t)}}
   const hit=id=>S.cuts.find(c=>c[0]==id);for(let t=0;t<S.end-.5;t+=.3)rates.push((CINE7.songU(t+.3)-CINE7.songU(t))/.3);
   return{on,scenes:S.cuts.map(c=>c[0]).join(),story:CINE7.STORY.map(s=>s[0]).join(),lo:Math.min(...rates),hi:Math.max(...rates),end:S.end,el:CINE7.songEl.duration,hits:S.hits,eclipseHit:hit('eclipse')[2][1],titleHit:hit('title')[2][1],restoreHit:hit('restore')[2][1]}});
  ok('every scene cut and pinned moment lands on the beat grid, in order',m.on);
  ok('every scene has a place in the song, in story order',m.scenes==m.story,m.scenes);
  ok('the story never runs too slow or too fast against the music',m.lo>=.4&&m.hi<=1.35,{lo:m.lo,hi:m.hi});
  ok('the big moments sit on the big hits: drums + shatter, last hit + light, last chord + title',m.eclipseHit==18.39&&m.restoreHit==135.69&&m.titleHit==157.59&&m.hits.includes(18.39)&&m.hits.includes(135.69));
  ok('the story ends with the song (2:43, once the piano has faded out)',m.end>=162.95&&m.end<=Math.min(164,m.el),{end:m.end,duration:m.el});
  // the song leads the clock
  const a=await p.evaluate(()=>({st:CINE7.state,paused:CINE7.songEl.paused,t:CINE7.songEl.currentTime,v:CINE7.songEl.volume}));await p.waitForTimeout(1500);
  const c=await p.evaluate(()=>({st:CINE7.state,paused:CINE7.songEl.paused,t:CINE7.songEl.currentTime}));
  ok('the song plays and the story follows it',a.st.song&&a.st.live&&!c.paused&&c.t>a.t+.8&&Math.abs(c.st.clock-c.t)<.3,{clock:c.st.clock,song:c.t});
  ok('at the music volume setting',a.v>0&&a.v<=1,a.v);
  const at=await p.evaluate(async()=>{const r={};for(const t of[1,12,19,30,40,57,76,96,116,126,140,150,158]){CINE7.seek(CINE7.songU(t));CINE7.songEl.currentTime=t;await new Promise(z=>setTimeout(z,90));r[t]=CINE7.state.scene}return r});
  ok('the scenes follow the song\'s sections',at[1]=='tree'&&at[12]=='village'&&at[19]=='eclipse'&&at[30]=='bosses'&&at[40]=='wake'&&at[57]=='wings'&&at[76]=='biomes'&&at[96]=='camp'&&at[116]=='ascend'&&at[126]=='duel'&&at[140]=='restore'&&at[150]=='home'&&at[158]=='title',at);
  const hitF=await p.evaluate(async()=>{const t=114.42;CINE7.seek(CINE7.songU(t));CINE7.songEl.currentTime=t;await new Promise(z=>setTimeout(z,40));return CINE7.state.push});ok('the picture pushes on a big hit',/scale/.test(hitF),hitF);
  ok('nothing is spoken before the very end',await p.evaluate(()=>SAID.length==0&&VOX12.log.length==0));
  // the last word, then the hand-over into the game
  await p.evaluate(()=>{const t=CINE7.SONG.say-.3;CINE7.seek(CINE7.songU(t));CINE7.songEl.currentTime=t});await p.waitForTimeout(900);
  const v=await p.evaluate(()=>({said:SAID,log:VOX12.log,say:CINE7.SONG.say}));ok('a voice says the name once, in the last seconds',v.said.length==1&&v.said[0]=='Rootbound.'&&v.say>=157.59,v);
  await p.waitForFunction(()=>!CINE7.playing,null,{timeout:6000});await p.waitForTimeout(500);
  const e=await p.evaluate(()=>{const a=CINE7.songEl;return{paused:a.paused,src:a.getAttribute('src'),gone:!document.getElementById('cine7'),cover:window.RB_COVER,said:SAID.length}});
  ok('the song stops when the intro ends, the canvas is gone and the game takes over',e.paused&&e.src==null&&e.gone&&e.cover===false&&e.said==1,e);
  ok('no page errors',p.errs.length==0,p.errs.join('|'));await p.ctx.close()}

 // ---- skipping
 {const p=await page();await started(p);await p.waitForTimeout(300);await p.keyboard.down(' ');await p.waitForTimeout(1500);const mid=await p.evaluate(()=>CINE7.playing?CINE7.songEl.volume:-1);await p.waitForTimeout(400);await p.keyboard.up(' ');await p.waitForFunction(()=>!CINE7.playing,null,{timeout:6000});await p.waitForTimeout(300);
  const e=await p.evaluate(()=>({paused:CINE7.songEl.paused,src:CINE7.songEl.getAttribute('src'),said:SAID.length,gone:!document.getElementById('cine7')}));
  ok('holding Space skips: the song fades and stops, and the name is not spoken',e.paused&&e.src==null&&e.said==0&&e.gone,{mid,e});ok('skip: no page errors',p.errs.length==0,p.errs.join('|'));await p.ctx.close()}

 // ---- reduced motion: same song, calm pictures
 {const p=await page({rm:'reduce'});await started(p);await p.waitForTimeout(300);const r=await p.evaluate(async()=>{const t=114.42;CINE7.seek(CINE7.songU(t));CINE7.songEl.currentTime=t;await new Promise(z=>setTimeout(z,60));return CINE7.state});
  ok('reduced motion: still on the song, without the push on the beat',r.song&&r.live&&r.k==1&&r.push=='',r);ok('reduced motion: every scene draws',await p.evaluate(async()=>{for(const s of CINE7.STORY){CINE7.seek(s[3]+s[1]*.6);await new Promise(z=>setTimeout(z,30))}return true})&&p.errs.length==0,p.errs.join('|'));await p.ctx.close()}

 // ---- a browser that blocks sound until the player touches the page
 const BLOCK=()=>{const pl=HTMLMediaElement.prototype.play;window.UNBLOCK=false;HTMLMediaElement.prototype.play=function(){return window.UNBLOCK?pl.call(this):Promise.reject(new DOMException('blocked','NotAllowedError'))};addEventListener('keydown',()=>{window.UNBLOCK=true},true);addEventListener('pointerdown',()=>{window.UNBLOCK=true},true)};
 {const p=await page({init:BLOCK});await p.waitForFunction(()=>CINE7.playing&&CINE7.state.gate=='blocked',null,{timeout:30000});ok('sound blocked: the story waits at a prompt',await p.evaluate(()=>CINE7.state.prep));await p.waitForTimeout(200);
  await p.keyboard.press('a');await started(p);await p.waitForTimeout(800);const s=await p.evaluate(()=>({st:CINE7.state,t:CINE7.songEl.currentTime,paused:CINE7.songEl.paused}));ok('the first key starts the song from the top',s.st.live&&!s.paused&&s.t<3,s);await p.ctx.close()}
 {const p=await page({init:BLOCK});await p.waitForFunction(()=>CINE7.playing&&!CINE7.state.prep,null,{timeout:40000});await p.waitForTimeout(1200);const s0=await p.evaluate(()=>CINE7.state);ok('no key press: the story starts anyway, in silence',!s0.live&&s0.clock>.5&&s0.song,s0);
  await p.keyboard.press('a');await p.waitForTimeout(700);const s=await p.evaluate(()=>({st:CINE7.state,t:CINE7.songEl.currentTime,paused:CINE7.songEl.paused}));ok('a late key press brings the song in at the right place',s.st.live&&!s.paused&&Math.abs(s.t-s.st.clock)<.4&&s.t>1,s);await p.ctx.close()}

 // ---- the page the server hosts
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbsong-'));const S=createServer({csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',client:path.resolve(__dirname,'../index.html')});const port=await S.listen(),url='http://127.0.0.1:'+port+'/',size=fs.statSync(MP3).size;
 const r0=await get(url+'audio/intro-song.mp3'),r1=await get(url+'audio/intro-song.mp3',{Range:'bytes=1000-1999'}),r2=await get(url+'audio/intro-song.mp3',{Range:'bytes=99999999-'}),r3=await get(url+'audio/intro-song.mp3',{'If-None-Match':r0.h.etag}),r4=await get(url+'audio/rootbound-voice.mp3'),r5=await get(url+'audio/../server/server.js'),r6=await get(url+'audio/intro-song.mp3',{},'HEAD');
 ok('the server hosts the song',r0.s==200&&r0.n==size&&r0.h['content-type']=='audio/mpeg'&&r0.h['accept-ranges']=='bytes'&&/max-age/.test(r0.h['cache-control']),{s:r0.s,n:r0.n});
 ok('with byte ranges, so browsers can seek in it',r1.s==206&&r1.n==1000&&r1.h['content-range']=='bytes 1000-1999/'+size&&r2.s==416&&r6.s==200&&r6.n==0,{a:r1.s,b:r2.s,head:r6.s});
 ok('a repeat visit does not download it again',r3.s==304&&r3.n==0,r3.s);
 ok('only those files: no recording yet is a plain 404, and nothing else can be read',r4.s==404&&r5.s==404,{v:r4.s,x:r5.s});
 {const p=await page({url});await started(p);await p.waitForTimeout(500);const s=await p.evaluate(()=>({st:CINE7.state,src:CINE7.songEl.currentSrc,t:CINE7.songEl.currentTime}));ok('hosted page: the song plays',s.st.live&&s.t>.1&&/\/audio\/intro-song\.mp3$/.test(s.src),s);
  await p.evaluate(()=>{const t=140;CINE7.seek(CINE7.songU(t));CINE7.songEl.currentTime=t});await p.waitForTimeout(800);const q=await p.evaluate(()=>({t:CINE7.songEl.currentTime,c:CINE7.state.clock}));ok('hosted page: seeking inside the song works',q.t>139.5&&Math.abs(q.t-q.c)<.3,q);
  // a brand-new account: the page signs in and reloads, and the intro plays again from a fresh save
  await p.keyboard.down(' ');await p.waitForTimeout(1500);await p.keyboard.up(' ');await p.waitForFunction(()=>!CINE7.playing,null,{timeout:8000});await p.waitForFunction(()=>typeof NET7!='undefined'&&NET7.online,null,{timeout:20000});
  await p.evaluate(()=>NET7.send({t:'register',name:'songtester',pass:'songtester-password'}));await p.waitForFunction(()=>typeof NET7!='undefined'&&NET7.auth&&NET7.auth.name=='songtester'&&RB_ACCT.id==NET7.auth.uid,null,{timeout:20000});
  await p.reload();await started(p);await p.waitForTimeout(500);const a=await p.evaluate(()=>({st:CINE7.state,t:CINE7.songEl.currentTime,paused:CINE7.songEl.paused,acct:RB_ACCT.id||''}));ok('after signing in and reloading, a new account gets the intro with the song',a.st.live&&!a.paused&&a.t>.1,a);
  ok('hosted page: no page errors',p.errs.length==0,p.errs.join('|'));await p.ctx.close()}
 // ---- only index.html was copied, or the song cannot be reached: the old synthesized score carries the story
 {const p=await page({url,route:async pg=>{await pg.route('**/audio/intro-song.mp3',r=>r.fulfill({status:404,body:''}))}});await started(p);await p.waitForTimeout(800);const s=await p.evaluate(()=>CINE7.state);ok('no song: the story still plays, on its own clock',!s.song&&!s.live&&s.clock>.3&&s.total>=140,s);
  await p.keyboard.down(' ');await p.waitForTimeout(1500);await p.keyboard.up(' ');await p.waitForFunction(()=>!CINE7.playing,null,{timeout:8000});ok('no song: skipping still works, without errors',p.errs.length==0,p.errs.join('|'));await p.ctx.close()}
 await S.close();try{fs.rmSync(dir,{recursive:true,force:true})}catch(_){}
 await b.close();console.log(fails?'FAILURES '+fails:'all intro song tests passed');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL crashed',e);process.exit(2)});
