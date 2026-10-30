// Cinematics (CINE7): launch story intro, world entry card, boss intro/defeat/loss cards. Run: node tests/cine.js
const {chromium}=require('playwright');const path=require('path');let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
const URL='file://'+path.resolve(__dirname,'../index.html');
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},180000).unref();
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 const page=async(o={})=>{const ctx=await b.newContext({viewport:{width:1280,height:720},reducedMotion:o.rm||'no-preference'});if(o.force)await ctx.addInitScript(()=>{try{localStorage.setItem('rb_force_launch','1')}catch(_){}});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/CINE7/.test(m.text()))p.errs.push(m.text())});p.ctx=ctx;await p.goto(URL);return p};
 // 1. automated browsers skip the intro (tests keep working)
 {const p=await page();await p.waitForTimeout(900);ok('webdriver skips the launch intro',await p.evaluate(()=>!CINE7.playing&&!document.getElementById('cine7')&&!SHOW7.isOpen));await p.ctx.close()}
 // 2. forced launch: the story plays, pauses the game, swallows keys, then hands over to the home screen and cleans up
 {const p=await page({force:true});await p.waitForFunction(()=>CINE7.playing,null,{timeout:15000});
  const s=await p.evaluate(()=>({cover:window.RB_COVER,st:CINE7.state,z:+getComputedStyle(document.getElementById('cine7')).zIndex,home:SHOW7.isOpen}));
  ok('intro plays at launch over everything, game paused',s.cover===true&&s.z>2147483000&&!s.home&&s.st.total>=92&&s.st.total<=112,JSON.stringify(s));
  const keyed=await p.evaluate(()=>{let got=0;const h=()=>got++;addEventListener('keydown',h);dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));dispatchEvent(new KeyboardEvent('keydown',{key:'e'}));removeEventListener('keydown',h);return got});
  ok('intro cannot be skipped by keys (game handlers do not see them)',keyed==0&&await p.evaluate(()=>CINE7.playing));
  await p.waitForTimeout(1200);const sc=[];for(const u of await p.evaluate(()=>CINE7.STORY.map(s=>s[3]+s[1]*.5))){await p.evaluate(u=>CINE7.seek(u),u);await p.waitForTimeout(60);sc.push(await p.evaluate(()=>CINE7.state.scene))}
  ok('all seventeen scenes render (gags, the fall, the fight, the restoration)',new Set(sc).size==17,sc.join(','));
  const px=await p.evaluate(()=>{const c=document.getElementById('cine7'),x=document.createElement('canvas');x.width=64;x.height=36;const g=x.getContext('2d');g.drawImage(c,0,0,64,36);const d=g.getImageData(0,0,64,36).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]>60)n++;return n});ok('intro canvas has artwork',px>200,px);
  await p.evaluate(()=>CINE7.seek(CINE7.state.total-.8));await p.waitForTimeout(2200);
  const e=await p.evaluate(()=>({gone:!document.getElementById('cine7'),playing:CINE7.playing,home:SHOW7.isOpen,cover:window.RB_COVER}));
  ok('intro ends into the home screen and removes its canvas',e.gone&&!e.playing&&e.home&&e.cover===true,JSON.stringify(e));
  const vo=await p.evaluate(()=>({log:VOX12.log.slice(),caps:CINE7.STORY.filter(s=>s[2]).map(s=>s[2]),p:VOX12.params({dark:false}),d:VOX12.params({dark:true})}));
  ok('narrator reads the story lines and ends on "RootBound"; dark characters get a deeper, slower read that stays clear',vo.caps.every(c=>vo.log.includes(c))&&vo.log.lastIndexOf('RootBound.')>vo.log.lastIndexOf(vo.caps[vo.caps.length-1])&&vo.d.pitch<vo.p.pitch&&vo.d.rate<vo.p.rate&&vo.d.pitch>=.5,JSON.stringify({n:vo.log.length,tail:vo.log.slice(-2),p:vo.p,d:vo.d}));
  ok('intro: no page errors',p.errs.length==0,p.errs.join('|'));await p.ctx.close()}
 // 3. reduced motion shortens (does not remove) the story
 {const p=await page({force:true,rm:'reduce'});await p.waitForFunction(()=>CINE7.playing,null,{timeout:15000});const st=await p.evaluate(()=>Object.assign({need:CINE7.STORY.reduce((a,s)=>a+(s[2]?VOX12.est(s[2],VOX12.params().rate):0),0)},CINE7.state));ok('reduced motion: same story, quicker visuals, never shorter than the narration needs',st.k<1&&st.total*st.k>=st.need&&st.total*st.k<=112,JSON.stringify(st));await p.ctx.close()}
 // 4. world entry card + boss cinematics inside the game
 {const p=await page();await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=40});await p.waitForTimeout(400);
  await p.evaluate(()=>enterWorld('cinetest'));await p.waitForTimeout(150);
  const w=await p.evaluate(()=>{const e=document.getElementById('cine7w');return{on:!!e,pe:e&&getComputedStyle(e).pointerEvents,txt:e&&e.textContent,cover:window.RB_COVER}});
  ok('entering a world shows the portal + title card without blocking input',w.on&&w.pe=='none'&&/cinetest/i.test(w.txt)&&/new world/i.test(w.txt)&&!w.cover,JSON.stringify(w));
  ok('internal reload of the same world does not replay it',await p.evaluate(()=>{const a=document.getElementById('cine7w');loadWorld(cur);return document.getElementById('cine7w')===a}));
  // a level-up during the world card waits for it (both sit top-centre; they used to overlap)
  const lv0=await p.evaluate(async()=>{lvl+=1;await new Promise(r=>setTimeout(r,350));const e=document.getElementById('rw8lv');return{card:!!document.getElementById('cine7w'),lvOn:!!(e&&e.classList.contains('on'))}});
  await p.waitForTimeout(3200);const lv1=await p.evaluate(()=>{const e=document.getElementById('rw8lv');return!!(e&&e.classList.contains('on'))});
  ok('a level-up during the world card waits until the card is gone, then shows',lv0.card&&!lv0.lvOn&&lv1,JSON.stringify({lv0,lv1}));
  ok('world card cleans up',await p.evaluate(()=>!document.getElementById('cine7w')&&!document.body.classList.contains('c7w-on')));
  ok('visited worlds tracked in rbc7',await p.evaluate(()=>!!JSON.parse(localStorage.getItem('rbc7')).v.cinetest));
  const bi=await p.evaluate(()=>new Promise(res=>{mobs.length=0;BOSS6.clear();let okS=false;for(let i=0;i<4&&!okS;i++)okS=BOSS6.spawn('warden');const m=BOSS6.active();if(!m)return res({okS});const x0=m.x,hp0=P.hp;
   setTimeout(()=>res({okS,card:!!document.querySelector('#cine7b.on .c7b-card b'),name:document.querySelector('#cine7b b').textContent,still:Math.abs(m.x-x0)<1,idle:m.bs=='idle',hp:P.hp>=hp0,zoom:cv.style.transform}),2900)}));   // BOSS10: the name card comes with the roar, ~2.5 s into the intro
  ok('boss intro: card, boss held still, player unharmed',bi.okS&&bi.card&&/warden/i.test(bi.name)&&bi.still&&bi.idle&&bi.hp,JSON.stringify(bi));
  await p.waitForFunction(()=>!BOSS10.kind,null,{timeout:4000}).catch(()=>{});await p.evaluate(()=>{const m=BOSS6.active();hurtMob(m,1e6,WPN[wp],0)});await p.waitForTimeout(2300);   // BOSS10 outro: the defeat card follows the collapse (~1.95 s)
  const bw=await p.evaluate(()=>{const c=document.querySelector('#cine7b.win');return{win:!!c,txt:c&&c.textContent,banner:document.getElementById('banner')&&document.getElementById('banner').classList.contains('on')&&/BOSS DEFEATED/.test(document.getElementById('banner').textContent),zoom:cv.style.transform}});
  ok('boss defeat: card with name + rewards replaces the old banner, zoom reset',bw.win&&/Verdant Warden/.test(bw.txt)&&/gems/.test(bw.txt)&&!bw.banner&&bw.zoom=='',JSON.stringify(bw));
  await p.waitForTimeout(3300);ok('boss cards clean up',await p.evaluate(()=>!document.getElementById('cine7b')&&cv.style.transform==''));
  await p.evaluate(()=>{mobs.length=0;BOSS6.clear();for(let i=0;i<4&&!BOSS6.active();i++)BOSS6.spawn('sovereign')});await p.waitForTimeout(2900);await p.evaluate(()=>{mobs.length=0});await p.waitForTimeout(300);
  ok('boss loss: DEFEATED card',await p.evaluate(()=>!!document.querySelector('#cine7b.lose')&&/Defeated/i.test(document.querySelector('#cine7b.lose').textContent)));
  const r=await p.evaluate(()=>{const o={};for(const id of['warden','sovereign','eclipse','magma','tide','storm']){mobs.length=0;BOSS6.clear();o[id]=BOSS6.spawn(id);const m=BOSS6.active();if(m)hurtMob(m,1e6,WPN[wp],0)}return o});
  await p.waitForTimeout(6200);ok('rapid spawn/kill of all six bosses leaves nothing behind',await p.evaluate(()=>!document.getElementById('cine7b')&&cv.style.transform==''&&!window.CAMT),JSON.stringify(r));
  ok('in-game cinematics: no page errors',p.errs.length==0,p.errs.join('|'));await p.ctx.close()}
 await b.close();console.log(fails?'FAILURES '+fails:'all cine tests passed');process.exit(fails?1:0)})();
