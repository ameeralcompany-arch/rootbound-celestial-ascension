// The Plaza as a place to be (ultimate update, Phase 3), played through the game's own code:
//   the class masters wear a CHOOSE YOUR PATH arrow until you pick a class, then only your own master keeps a marker; an edge pointer leads a new player to them;
//   emotes are full-body moves that travel to other players (a remote emote plays on them), and the same emote together is "in sync";
//   sitting travels too (others draw you seated), and it is validated; the new benches are real seats; Mochi reads one fortune a day;
//   golden petals can be caught; cherry trees and lantern posts draw without errors and cheaply.   node tests/plaza-life.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').replace(/\\/g,'/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:100,own:{fist:1},wp:'fist',bar:[1],done:{},xp:3,lvl:12,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});
 const c=await b.newContext({viewport:{width:1280,height:720}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|favicon/.test(m.text()))errs.push(m.text().slice(0,300))});
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await p.evaluate(()=>enterWorld('plaza'));await sleep(1800);
 const frames=n=>p.evaluate(n=>new Promise(r=>{let i=0;const f=()=>{if(++i>=n)r();else requestAnimationFrame(f)};requestAnimationFrame(f)}),n);
 // ---- class masters: arrows before a class, then only your master
 const ar=await p.evaluate(()=>{const ms=NPC2.list().filter(n=>n.cls),n0=ms[0],o={masters:ms.length};const x=document.createElement('canvas').getContext('2d');let drew=0;const di=x.drawImage.bind(x);x.drawImage=(...a)=>{drew++;return di(...a)};
  CJOB.S.cur=null;P.x=n0.wx+T*2;P.y=n0.wy-P.h-4;drew=0;o.yBefore=MASTER1.mark(x,n0,100,300,1000);o.drawnBefore=drew;
  const other=ms.find(q=>q.cls!==n0.cls);CJOB.S.cur=n0.cls;drew=0;o.yMine=MASTER1.mark(x,n0,100,300,1000);o.drawnMine=drew;P.x=other.wx+T*40;drew=0;o.yOther=MASTER1.mark(x,other,100,300,1000);o.drawnOther=drew;
  CJOB.S.cur=null;P.x=-9999;drew=0;MASTER1.edge(x,NPC2.list(),1000);o.edge=drew;return o});
 ok('all 13 class masters can carry the arrow',ar.masters==13,ar);
 ok('before a class: an arrow and CHOOSE YOUR PATH over a master near you',ar.drawnBefore==2&&ar.yBefore<300,ar);
 ok('after choosing: your master keeps a marker, a far master of another class has none',ar.drawnMine>=1&&ar.drawnOther==0&&ar.yOther==300,ar);
 ok('with no master on screen, an edge pointer shows the way',ar.edge==1,ar);
 // ---- emotes: a full-body move, sent to others, played on others; the same emote together is in sync
 const em=await p.evaluate(async()=>{const o={};SOC6.emote(0);o.local=FIGHT.active('me');o.net=FIGHT.net();await new Promise(r=>setTimeout(r,1300));
  FIGHT.onRemote('p:Friend','emo:dance',{x:P.x+T,y:P.y,n:'Friend'});o.remote=FIGHT.active('p:Friend');
  SOC6.emote(1);await new Promise(r=>setTimeout(r,200));FIGHT.onRemote('p:Friend','emo:dance',{x:P.x+T,y:P.y,n:'Friend'});o.sync=EMO2.lastMsg;
  o.moves=Object.keys(EMO2.MV);return o});
 ok('an emote plays a full-body move on you',em.local,em);
 ok('and it travels to other players with your look (move id emo:wave)',Array.isArray(em.net)&&em.net[0]=='emo:wave',em.net);
 ok('another player\'s emote plays on them',em.remote,em);
 ok('the same emote together, close by, is "in sync"',/In sync with Friend/.test(em.sync),em.sync);
 ok('seven emotes have body moves',em.moves.length==7,em.moves);
 // ---- sitting travels and is validated; the new benches are seats
 const st=await p.evaluate(async()=>{const o={};await new Promise(r=>setTimeout(r,1200));const seats=SUMMER9.SEATS.filter(s=>s.it&&s.it.plzd);o.benches=seats.length;const s=seats[0];if(s){P.x=s.sx;P.y=s.fy-P.h-1;SUMMER9.sit(s);await new Promise(r=>setTimeout(r,100))}
  const cx=celPres();o.st=cx&&cx.st;o.clean=cleanCx({st:[15,0]}).st;o.bad=cleanCx({st:['x',99999]}).st;o.junk=cleanCx({st:'sit'}).st;o.rsit=AC6.RSIT({st:[15,40]});SUMMER9.stand();return o});
 ok('the new Plaza benches are real seats',st.benches>=3,st);
 ok('sitting is sent to others (seat height and lean)',Array.isArray(st.st)&&st.st[0]==15,st);
 ok('and only clean numbers get through',JSON.stringify(st.clean)=='[15,0]'&&st.bad===undefined&&st.junk===undefined,st);
 ok('other players are drawn seated',st.rsit&&st.rsit.h==15&&Math.abs(st.rsit.lean-.4)<1e-9,st.rsit);
 // ---- Mochi's fortune: one a day, the same all day
 const mo=await p.evaluate(()=>{const said=[];PLZD.readFortune();said.push(PLZD.lastMsg);PLZD.readFortune();said.push(PLZD.lastMsg);return said});
 ok('Mochi reads a fortune, and the same one all day',mo.length==2&&/Mochi opens one eye/.test(mo[0])&&mo[0]==mo[1],mo);
 // ---- golden petals
 const gp=await p.evaluate(async()=>{const c0=PLZD.caught;PLZD.gold.push({x:P.x,y:P.y+P.h/2,t:0,ph:0});await new Promise(r=>setTimeout(r,300));return{before:c0,after:PLZD.caught,left:PLZD.gold.length}});
 ok('walking through a golden petal catches it and counts it',gp.after==gp.before+1&&gp.left==0,gp);
 // ---- the decor draws, cheaply
 const dr=await p.evaluate(async()=>{const o={};for(const[c]of PLZD.TREES.slice(0,2)){P.x=c*T;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}const t0=performance.now();for(let i=0;i<20;i++)drawNPCs(performance.now());o.ms=(performance.now()-t0)/20;return o});
 ok('the Plaza layer (trees, posts, Mochi, petals and the town\'s people) draws in under 4 ms',dr.ms<4,dr);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
