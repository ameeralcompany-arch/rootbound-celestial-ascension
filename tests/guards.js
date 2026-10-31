// Letter Wardens (GUARD16): every hidden-word letter is guarded by a mini-boss; the letter cannot be collected until the warden is beaten;
// health scales with your level; the warden attacks; beating it pays gems and XP sized to the economy; it stays beaten (creative mode skips wardens). node tests/guards.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},120000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/GUARD16|WORD9/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});
 const E=(f,a)=>p.evaluate(f,a),W8=ms=>p.waitForTimeout(ms);
 await E(()=>{enterWorld('guardtest');WX6.force='clear';mobs.length=0;BIOME17.clearAll()});await W8(4500);
 // walk up to a letter: its warden rises and the letter is sealed
 const s1=await E(async()=>{const l=WORD9.letters[0];P.x=(l.x+.5)*T+T*3;P.y=(l.y+.5)*T-P.h;P.vx=P.vy=0;iT=1e4;await new Promise(r=>setTimeout(r,500));const g=GUARD16.live.find(q=>q.i==l.i),col=WORD9.collect(l.i);
  return{n:GUARD16.live.length,has:!!g,st:g&&g.st,hp:g&&g.m.mhp,want:GUARD16.hpOf(lvl),col,got:(WORD9.state.w.guardtest||{got:[]}).got.includes(l.i),inMobs:g&&mobs.includes(g.m)}});
 ok('coming near a letter wakes its Letter Warden; health scales with your level (400 + 90 L)',s1.has&&s1.inMobs&&s1.hp==s1.want,s1);
 ok('the letter cannot be collected while its warden lives',s1.col===false&&!s1.got,s1);
 const sty=await E(()=>WORD9.letters.map(l=>GUARD16.STY[l.i%3]));ok('wardens come in different styles (charger, hopper, caster)',new Set(sty).size>=Math.min(3,sty.length),sty);
 // the warden fights back (it can hurt you once you are not invulnerable)
 const atk=await E(async()=>{const g=GUARD16.live[0],gx=Math.floor(g.m.x/T),gy=Math.floor((g.m.y+g.m.h-4)/T);for(let x=gx-3;x<=gx+3;x++){for(let y=gy-2;y<=gy;y++)setTile(x,y,0);setTile(x,gy+1,1)}iT=0;P.hp=maxHP();const h0=P.hp;for(let i=0;i<60&&P.hp>=h0;i++){P.x=g.m.x+(g.st=='caster'?T*3:20);P.y=g.m.y+g.m.h-P.h;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,60))}return{h0,h1:P.hp,st:g.st}});
 ok('the warden attacks (mid strength: 8 + 0.9 L per hit)',atk.h1<atk.h0,atk);
 // beat it: gems + XP sized to the economy, a reward card, the letter is free, it stays beaten
 const k1=await E(async()=>{iT=1e4;P.hp=maxHP();const g=GUARD16.live[0],l=WORD9.letters.find(q=>q.i==g.i),g0=gems,x0=xp,l0=lvl;hurtMob(g.m,g.m.hp+50,WPN.fist,0);await new Promise(r=>setTimeout(r,600));
  const card=[...document.querySelectorAll('#rw8 .rw8c')].some(c=>/Letter Warden/.test(c.textContent));const col=WORD9.collect(l.i);return{gems:gems-g0,want:GUARD16.gemsOf(l0),xpUp:xp>x0||lvl>l0,card,same:GUARD16.live.filter(q=>q.i==l.i).length,cleared:GUARD16.cleared('guardtest',l.i),col}});
 ok('beating the warden pays about three minutes of income in gems, XP and a reward card',k1.gems>=k1.want&&k1.xpUp&&k1.card,k1);
 ok('then the letter is free to collect, and the warden stays beaten',k1.cleared&&k1.col===true&&k1.same==0,k1);
 ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?fails+' guard test(s) FAILED':'all guard tests passed');process.exit(fails?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
