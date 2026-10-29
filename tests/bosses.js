// Boss fights (BOSS10 + BOSSX + ARENA7 + CINE7 overlays): for each of the six bosses - intro cinematic (camera pans to the boss, you are
// invulnerable, the boss holds), health bar with phase ticks, phase changes at 66% / 33% with new patterns, telegraphs before big attacks,
// vulnerable / stagger windows, arena hazards, outro on defeat with rewards, skip on repeat encounters, the loss path, and a clean tear-down
// (no camera target, no canvas transform, normal time, no overlays) after rapid spawn/kill and world changes. Run: node tests/bosses.js
const {chromium}=require('playwright');const path=require('path');let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const URL='file://'+path.resolve(__dirname,'../index.html');
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},420000).unref();
const IDS=['warden','sovereign','eclipse','magma','tide','storm'];
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms),until=(f,a,t)=>p.waitForFunction(f,a,{timeout:t||9000}).then(()=>true,()=>false);
 await p.goto(URL);await W(700);await E(()=>document.getElementById('bp').click());await W(500);await E(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=40});await W(300);
 await E(()=>enterWorld('bossarena'));await W(3200);await E(()=>{BOSS10.forget();P.hp=maxHP()});
 const spawn=id=>E(id=>{mobs.length=0;BOSS6.clear();let ok=false;for(let i=0;i<10&&!ok;i++)ok=BOSS6.spawn(id);const m=BOSS6.active();return ok&&m?{x:m.x,y:m.y,hp:P.hp,cx:window.CAMT&&CAMT.x}:null},id);
 const clean=()=>E(()=>({camt:window.CAMT||null,tr:cv.style.transform,tS:CINE7.tS,card:!!document.getElementById('cine7b'),bar:!!document.querySelector('#bb10.on'),hint:!!document.getElementById('bb10k'),cine:document.body.classList.contains('bb10c'),kind:BOSS10.kind,ghost:!!BOSS10.ghost}));
 const isClean=c=>!c.camt&&c.tr==''&&c.tS==1&&!c.card&&!c.bar&&!c.hint&&!c.cine&&!c.kind&&!c.ghost;
 for(const id of IDS){
  // ---- intro
  const s=await spawn(id);ok(id+': spawns',!!s);if(!s)continue;
  await until(()=>BOSS10.t>=1.3);
  const a=await E(s=>{const m=BOSS6.active(),b=BOSSES.find(q=>'boss_'+q.id==m.k);return{kind:BOSS10.kind,camDx:window.CAMT?Math.abs(CAMT.x-m.x):1e9,startDx:Math.abs(s.x-(s.cx||P.x)),iT,still:Math.abs(m.x-s.x)<1&&Math.abs(m.y-s.y)<1,idle:m.bs=='idle'&&!(m.wind>0),hp:P.hp>=s.hp,skip:BOSS10.canSkip,hidden:document.body.classList.contains('bb10c'),bars:!!document.querySelector('#cine7b.bars'),hz:BOSSX.HZ.length,lim:T*3}},s);
  ok(id+': intro plays, letterbox on, HUD steps aside',a.kind=='in'&&a.bars&&a.hidden,a);
  ok(id+': intro camera pans to the boss',a.camDx<=Math.max(a.lim,a.startDx*.5),a);
  ok(id+': intro - player invulnerable and unharmed, boss holds still without attacking',a.iT>1&&a.hp&&a.still&&a.idle&&a.hz==0,a);
  ok(id+': first encounter cannot be skipped',!a.skip,a);
  await until(()=>BOSS10.t>=2.7);const cd=await E(()=>({card:!!document.querySelector('#cine7b.on .c7b-card b'),name:(document.querySelector('#cine7b .c7b-card b')||{}).textContent,arena:ARENA7.arena&&ARENA7.arena.pend}));
  ok(id+': roar + name card mid-intro, barrier not formed yet',cd.card&&cd.name&&cd.arena==1,cd);
  await until(()=>!BOSS10.kind,null,6000);await W(200);
  const f=await E(s=>{const m=BOSS6.active(),A=ARENA7.arena,bb=document.getElementById('bb10');return{m:!!m,hp:P.hp>=s.hp,formed:A&&!A.pend,cam:window.CAMT?'arena':'player',fit:A&&A.fit,bar:!!document.querySelector('#bb10.on'),name:bb&&bb.querySelector('.bb10-h b').textContent,ticks:bb?[...bb.querySelectorAll('.bb10-tk')].map(e=>e.style.left):[],ph:bb&&bb.dataset.ph,cine:document.body.classList.contains('bb10c')}},s);
  ok(id+': after the intro the arena forms and the camera returns',f.m&&f.formed&&f.cam==(f.fit?'arena':'player')&&!f.cine,f);
  ok(id+': health bar with name and phase ticks at 66% / 33%',f.bar&&f.name&&f.ticks.join()=='66%,33%'&&f.ph=='1',f);
  ok(id+': player unharmed through the whole intro',f.hp,f);
  // ---- phases
  await E(()=>{iT=999;const m=BOSS6.active();m.hp=Math.round(m.mhp*.6)});await W(120);
  const p2=await E(()=>{const m=BOSS6.active(),b=m.k.slice(5),L=BOSSX.LIST[b];return{ph:m.phase,pb:m.pb,bar:document.getElementById('bb10').dataset.ph,st:document.querySelector('#bb10 .bb10-st').textContent,newA:L[1].filter(k=>!L[0].includes(k)),fl:m.fl}});
  ok(id+': phase II at 66% with a transition beat and new attacks',p2.ph==2&&p2.pb>0&&p2.bar=='2'&&/phase/i.test(p2.st)&&p2.newA.length>0,p2);
  await W(1500);await E(()=>{const m=BOSS6.active();m.hp=Math.round(m.mhp*.3)});await W(120);
  const p3=await E(()=>{const m=BOSS6.active(),b=m.k.slice(5),L=BOSSX.LIST[b];return{ph:m.phase,pb:m.pb,bar:document.getElementById('bb10').dataset.ph,newA:L[2].filter(k=>!L[1].includes(k)),done:document.querySelectorAll('#bb10 .bb10-tk.done').length}});
  ok(id+': phase III at 33%, more new attacks, both ticks passed',p3.ph==3&&p3.pb>0&&p3.bar=='3'&&p3.newA.length>0&&p3.done==2,p3);
  await until(()=>!(BOSS6.active().pb>0),null,4000);
  // ---- wind-up + telegraphs
  await E(()=>{const m=BOSS6.active();m.shield=0;m.stag=0;m.xt=.01;m.xc=1});const wu=await until(()=>BOSS6.active().wind>0,null,2000);
  ok(id+': attacks start with a wind-up (warning mark)',wu);
  const tg=await E(()=>{const m=BOSS6.active(),b=m.k.slice(5),all=[...new Set(BOSSX.LIST[b].flat())],out={};for(const k of all){if(!BOSSX.BIG[k])continue;BOSSX.clearFx();m.dash=null;const h0=BOSSX.HZ.length;BOSSX.ATK[b][k](m,true,true);
    const zs=BOSSX.HZ.filter(z=>z.tel>=.7),mv=BOSSX.MOV.filter(v=>v.tel>=.7),g=BOSSX.gust;out[k]=zs.length+mv.length+(g&&g.wait>=.7?1:0)}BOSSX.clearFx();m.dash=null;m.vx=0;return out});
  ok(id+': every big attack is telegraphed (warning zones / arrows >= 0.7 s ahead)',Object.keys(tg).length>0&&Object.values(tg).every(v=>v>0),tg);
  const nl=await E(()=>{const m=BOSS6.active(),b=m.k.slice(5),L=BOSSX.LIST[b],out={};for(const k of L[2].filter(k=>!L[0].includes(k))){BOSSX.clearFx();m.dash=null;m.pull=0;BOSSX.ATK[b][k](m,true,true);out[k]=BOSSX.HZ.filter(z=>z.tel>0).length+BOSSX.MOV.length+BOSSX.AL.length+BOSSX.Q.length+(m.pull>0?1:0)+(BOSSX.gust&&BOSSX.gust.wait>0?1:0)}BOSSX.clearFx();m.pull=0;m.dash=null;return out});
  ok(id+': the new phase II / III patterns all produce warned hazards',Object.values(nl).every(v=>v>0),nl);
  // ---- vulnerable / stagger windows
  const dm=await E(()=>{const m=BOSS6.active();m.hp=m.mhp;m.shield=0;m.stag=0;m.vul=0;m.vq=0;const hit=()=>{const h=m.hp;hurtMob(m,100,null,0);return h-m.hp};const base=hit();m.vul=1;const vul=hit();m.vul=0;m.stag=1;const stag=hit();m.stag=0;m.hp=Math.round(m.mhp*.3);return{base,vul,stag}});
  ok(id+': vulnerable window +35% and stagger +45% damage',Math.abs(dm.base-100)<1&&Math.abs(dm.vul-135)<1&&Math.abs(dm.stag-145)<1,dm);
  await E(()=>{const m=BOSS6.active();m.vq=.05;m.vul=0});await W(200);const vw=await E(()=>{const m=BOSS6.active();return{vul:m.vul,st:document.querySelector('#bb10 .bb10-st').textContent}});
  ok(id+': a big attack playing out opens a vulnerable window (shown on the bar)',vw.vul>0&&/vulnerable/i.test(vw.st),vw);
  await E(()=>{const m=BOSS6.active();m.ah=.01;BOSSX.clearFx()});await W(150);const ah=await E(()=>BOSSX.HZ.filter(z=>z.ah).length);
  ok(id+': arena hazards spawn in the later phases',ah>=2,ah);
  // ---- outro + rewards
  const r0=await E(()=>{BOSSX.clearFx();const m=BOSS6.active(),b=BOSSES.find(q=>'boss_'+q.id==m.k);const o={g:gems,k:bossK[b.id]|0,gems:b.gems,rel:b.relic};hurtMob(m,1e7,WPN[wp],0);o.kind=BOSS10.kind;o.g1=gems;o.k1=bossK[b.id]|0;o.relic=!!relics[b.relic];o.bars=!!document.querySelector('#cine7b.out');return o});
  ok(id+': defeat starts the outro, rewards granted (gems, kill count, relic)',r0.kind=='out'&&r0.g1-r0.g>=r0.gems&&r0.k1==r0.k+1&&r0.relic&&r0.bars,r0);
  await W(250);const o1=await E(()=>({tS:CINE7.tS,camt:!!window.CAMT,ghost:!!BOSS10.ghost,inMobs:mobs.some(m=>m.boss)}));
  ok(id+': outro - slow motion, camera locked on the falling boss',o1.tS<.9&&o1.camt&&o1.ghost&&!o1.inMobs,o1);
  await until(()=>!!document.querySelector('#cine7b.win.on'),null,4000);const o2=await E(()=>{const c=document.querySelector('#cine7b.win');return{txt:c&&c.textContent,fx:REW8.fx,fl:REW8.flights,t:BOSS10.t}});
  ok(id+': BOSS DEFEATED card after the collapse, with REW8 celebration + gems flying',/Boss Defeated/i.test(o2.txt||'')&&/gems/.test(o2.txt||'')&&o2.t>1.8&&(o2.fx>=1||o2.fl>0),o2);
  await until(()=>!BOSS10.kind&&!document.getElementById('cine7b')&&!ARENA7.arena,null,8000);await W(100);const c1=await clean();
  ok(id+': outro cleans up (camera, transform, time scale, overlays, arena)',isClean(c1),c1);
  // ---- repeat encounter: skip, then the loss path
  const s2=await spawn(id);await W(300);const sk=await E(()=>({can:BOSS10.canSkip,hint:!!document.getElementById('bb10k')}));
  ok(id+': repeat encounter offers the skip',!!s2&&sk.can&&sk.hint,sk);
  await E(()=>dispatchEvent(new KeyboardEvent('keydown',{key:'Shift'})));await W(800);const sk2=await E(()=>({st:BOSS10.state,t:BOSS10.t}));await E(()=>dispatchEvent(new KeyboardEvent('keyup',{key:'Shift'})));
  ok(id+': holding a key skips to the end of the intro',!sk2.st||sk2.st.skipped==1&&sk2.t>=3.6,sk2);
  await until(()=>!BOSS10.kind,null,3000);await E(()=>{iT=0;mobs.length=0});await W(250);
  const lo=await E(()=>({lose:!!document.querySelector('#cine7b.lose')&&/Defeated/i.test(document.querySelector('#cine7b.lose').textContent),bar:!!document.querySelector('#bb10.on'),kind:BOSS10.kind}));
  ok(id+': loss path - DEFEATED card, bar gone',lo.lose&&!lo.bar&&!lo.kind,lo);
  await until(()=>!document.getElementById('cine7b')&&!ARENA7.arena,null,5000);await E(()=>{P.hp=maxHP()})}
 // ---- tear-down edge cases
 {await spawn('eclipse');await W(900);await E(()=>loadWorld(cur));await W(300);const c=await clean();ok('world change mid-intro leaves nothing behind',isClean(c),c)}
 {await spawn('magma');await until(()=>!BOSS10.kind,null,7000);await E(()=>hurtMob(BOSS6.active(),1e7,WPN[wp],0));await W(500);await E(()=>loadWorld(cur));await W(300);const c=await clean();ok('world change mid-outro leaves nothing behind (slow motion reset)',isClean(c),c)}
 {await spawn('tide');await W(1200);await E(()=>{const m=BOSS6.active();const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1)});await W(400);const c=await E(()=>({kind:BOSS10.kind,camt:window.CAMT||null,cine:document.body.classList.contains('bb10c')}));
  ok('boss despawning mid-intro ends the cinematic',!c.kind&&!c.camt&&!c.cine,c);await until(()=>!document.getElementById('cine7b'),null,4000)}
 {await spawn('storm');await until(()=>!BOSS10.kind,null,7000);await E(()=>{iT=0;P.hp=-1});await W(400);const c=await E(()=>({lose:!!document.querySelector('#cine7b.lose'),pos:Math.round(P.hp)}));ok('knocked out mid-fight: back at the door, boss gone, DEFEATED card',c.lose&&c.pos>0,c);await until(()=>!document.getElementById('cine7b')&&!ARENA7.arena,null,5000)}
 {const r=await E(()=>{const o={};for(const id of['warden','sovereign','eclipse','magma','tide','storm']){mobs.length=0;BOSS6.clear();o[id]=BOSS6.spawn(id);const m=BOSS6.active();if(m)hurtMob(m,1e6,WPN[wp],0)}return o});
  await W(6200);const c=await clean();ok('rapid spawn/kill of all six leaves nothing behind',isClean(c)&&Object.values(r).every(Boolean),{c,r})}
 ok('bosses: no page errors',errs.length==0,errs.slice(0,6).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all boss tests passed');process.exit(fails?1:0)})();
