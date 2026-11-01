// World bosses (WBOSS13): the last letter wakes the realm's boss; the world collapses (in memory only), a 40-second cinematic plays, then only you and
// the boss remain in a huge arena; the Word Gate stays shut until it falls; win or lose, the world comes back exactly as it was. node tests/worldboss.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::|AudioContext/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(400);
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 const until=async(f,ms,a)=>{const t0=Date.now();while(Date.now()-t0<(ms||15000)){if(await E(f,a))return true;await W(120)}return false};
 await E(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=30;enterWorld('wbone');try{GUARD16.blocks=()=>false}catch(_){}try{BIOME17.locks=()=>false}catch(_){}});await W(2500);
 // ---- five bosses, kept out of the challenge list and the "defeat every boss" goal
 let r=await E(()=>({ids:WBOSS13.WB.map(b=>b.id),stages:WBOSS13.WB.map(b=>b.sg),inList:WBOSS13.WB.every(b=>BOSSES.includes(b)&&MK['boss_'+b.id]&&MK['boss_'+b.id].dmg>0),cave:BOSSES.filter(b=>!b.wb).length}));
 ok('one unique world boss per realm stage, registered as bosses; the six cave bosses are untouched',r.ids.length==5&&r.stages.join()=='0,1,2,3,4'&&r.inList&&r.cave==6,r);
 // ---- the Word Gate stays shut until the boss falls
 const L0=await E(()=>{const l=WORD9.letters;for(const q of l.slice(0,-1))WORD9.collect(q.i);window.__last=l[l.length-1].i;return{n:l.length,need:WBOSS13.need(cur),fight:WBOSS13.fight}});
 ok('collecting letters does not wake the boss before the last one',L0.need&&!L0.fight&&L0.n>=3,L0);
 await E(()=>{window.__t0=tiles.slice();window.__tr=trees.size;window.__bw=WALL9.bw.slice();const q=WORD9.letters.find(l=>l.i==window.__last);window.__lk=q.k;drops.push({x:P.x,y:P.y,vx:0,vy:0,k:1,n:3,t:0,ph:0})});
 await E(()=>WORD9.collect(window.__last));
 ok('the last letter wakes the boss',await until(()=>WBOSS13.fight&&WBOSS13.fight.st=='quake',4000));
 r=await E(()=>({open:WORD9.open(),gate:WORD9.isOpen()}));ok('the Word Gate does not open while the boss lives',!r.open&&!r.gate,r);
 await E(()=>{window.__e0=JSON.stringify(edits);window.__px=P.x;window.__py=P.y;window.__tr=trees.size;window.__dn=drops.length});
 // ---- the collapse
 ok('the world collapses',await until(()=>WBOSS13.fight&&WBOSS13.fight.st=='collapse',5000));
 r=await E(()=>({x:P.x==window.__px,y:P.y==window.__py,it:iT>0}));ok('you hang in place, untouchable, while it crumbles',r.x&&r.y&&r.it,r);
 ok('the cinematic starts when the world is gone',await until(()=>WBOSS13.CIN.on,6000));
 r=await E(()=>{let n=0;for(let i=0;i<tiles.length;i++)if(tiles[i])n++;return{n,trees:trees.size,drops:drops.length,walls:WALL9.bw.some(v=>v),mobs:mobs.length,void:WBOSS13.void,cover:window.RB_COVER,edits:JSON.stringify(edits)==window.__e0,canSkip:WBOSS13.CIN.canSkip}});
 ok('every block, tree, wall, drop and monster is gone, but the world save is untouched',r.n==0&&r.trees==0&&r.drops==0&&!r.walls&&r.mobs==0&&r.void&&r.edits,r);
 ok('the game is paused under the cinematic, and the first viewing cannot be skipped',r.cover&&!r.canSkip,r);
 // ---- 40 seconds
 await E(()=>WBOSS13.CIN.seek(20));await W(300);r=await E(()=>WBOSS13.CIN.on);ok('still playing at 20 s',r);
 await p.keyboard.down('x');await W(1200);await p.keyboard.up('x');r=await E(()=>WBOSS13.CIN.on);ok('holding a key does not skip the first viewing',r);
 await E(()=>WBOSS13.CIN.seek(39.5));await W(250);r=await E(()=>WBOSS13.CIN.on);ok('still playing at 39.5 s',r);
 ok('the cinematic ends at 40 s and hands over to the arena',await until(()=>!WBOSS13.CIN.on&&WBOSS13.fight&&WBOSS13.fight.st=='fight',3000));
 r=await E(()=>{const A=ARENA7.arena,m=BOSS6.active();return{w:(A.x1-A.x0)/T,h:(A.y1-A.y0)/T,boss:m&&m.k,in:P.x>A.x0&&P.x<A.x1&&m.x>A.x0&&m.x<A.x1,cover:window.RB_COVER,hp:P.hp==maxHP(),big:m.w>=200&&m.h>=250,kind:BOSS10.kind,dmg:m.dmg,mhp:m.mhp}});
 ok('a huge arena square with you and a huge boss inside; full health; the summoning intro plays',r.w>=46&&r.h>=24&&r.boss=='boss_wb_root'&&r.in&&!r.cover&&r.hp&&r.big&&r.kind=='in'&&r.dmg>0,r);
 ok('the boss intro hands over to the fight',await until(()=>!BOSS10.kind&&ARENA7.arena&&!ARENA7.arena.pend,9000));
 r=await E(async()=>{mobs.push({k:'slime',x:P.x,y:P.y,w:40,h:40,vx:0,vy:0,hp:10,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:false,wall:0});const s=spawnMob();breakAt(P.x/T|0,(P.y+P.h)/T|0);await new Promise(r=>setTimeout(r,200));pushEdit(5);return{mobs:mobs.length,only:mobs[0]===BOSS6.active(),s,edits:JSON.stringify(edits)==window.__e0,floor:tiles[(((P.y+P.h)/T+.5)|0)*W+(P.x/T|0)]}});
 ok('only you and the boss: strays vanish, no spawns, no mining the floor, nothing written to the save',r.mobs==1&&r.only&&!r.s&&r.edits&&r.floor==4,r);
 // ---- a hit is a real number (bosses used to make your HP NaN)
 r=await E(async()=>{const m=BOSS6.active();iT=0;P.hp=maxHP();const h0=P.hp;BOSSX.addZ(P.x-60,P.y-20,P.x+60,P.y+P.h+10,.03,.4,'#fff',m.dmg*1.1,'slam');await new Promise(r=>setTimeout(r,350));return{h0,h:P.hp}});
 ok('boss attacks deal real damage',Number.isFinite(r.h)&&r.h<r.h0&&r.h>0,r);
 // ---- every attack of every boss, in all phases
 r=await E(async()=>{const out=[];const m=BOSS6.active();for(const id in WBOSS13.ATK)for(const k in WBOSS13.ATK[id]){iT=9;P.hp=maxHP();try{WBOSS13.ATK[id][k](m,true,true)}catch(e){out.push(id+'.'+k+': '+e.message)}await new Promise(r=>setTimeout(r,120))}
   const lists=Object.keys(WBOSS13.LIST).every(id=>WBOSS13.LIST[id].length==3&&WBOSS13.LIST[id].flat().every(k=>WBOSS13.ATK[id][k]));await new Promise(r=>setTimeout(r,1500));return{out,lists,fx:WBOSS13.fx,hp:P.hp}});
 ok('every attack of all five bosses runs; each has three phases of attacks',r.out.length==0&&r.lists,r);
 // ---- phases + win
 r=await E(async()=>{const m=BOSS6.active();iT=9;BOSSX.clearFx();WBOSS13.clearFx();m.hp=m.mhp*.6;await new Promise(r=>setTimeout(r,300));const p2=m.phase;m.pb=0;m.hp=m.mhp*.3;await new Promise(r=>setTimeout(r,300));const p3=m.phase;return{p2,p3}});
 ok('phases at 66% and 33%',r.p2==2&&r.p3==3,r);
 const g0=await E(()=>{iT=99;return gems});
 await E(()=>{const m=BOSS6.active();m.shield=0;m.hp=1;P.hp=maxHP();hurtMob(m,99999,null,0)});
 ok('killing the boss brings the world back',await until(()=>!WBOSS13.fight&&!WBOSS13.void,12000));
 r=await E(()=>{let d=0;const k=window.__lk;for(let i=0;i<tiles.length;i++)if(i!=k&&tiles[i]!=window.__t0[i])d++;return{d,lastGone:tiles[k]==0,trees:trees.size==window.__tr,walls:WALL9.bw.every((v,i)=>v==window.__bw[i]),drops:drops.length==window.__dn,x:Math.abs(P.x-window.__px)<T*2,edits:JSON.stringify(edits)==window.__e0,body:document.body.classList.contains('wb13v'),relic:relics.wroot,solved:WBOSS13.state.w[cur],need:WBOSS13.need(cur)}});
 ok('every block, tree, wall and drop is back, you stand where you stood, and the save never changed',r.d==0&&r.lastGone&&r.trees&&r.walls&&r.drops&&r.x&&r.edits&&!r.body,r);
 ok('the victory is saved, with a relic and gems',r.relic&&r.solved&&!r.need&&(await E(()=>gems))>g0,{relic:r.relic,solved:r.solved});
 ok('the Word Gate opens',await until(()=>WORD9.isOpen(),4000));
 r=await E(()=>WORD9.submit(WORD9.word));ok('the word can then be solved',r);await W(1200);
 // ---- losing: the world comes back, the boss waits
 await E(()=>{lvl=30;enterWorld('wbtwo');try{GUARD16.blocks=()=>false}catch(_){}try{BIOME17.locks=()=>false}catch(_){}});await W(2500);
 await E(()=>{for(const q of WORD9.letters)WORD9.collect(q.i)});ok('a second world, a second boss',await until(()=>WBOSS13.fight,4000));
 await E(()=>{window.__px2=P.x});ok('collapse',await until(()=>WBOSS13.CIN.on,10000));
 r=await E(()=>WBOSS13.CIN.canSkip);ok('a boss you have already seen can be skipped',r);
 await p.keyboard.down('x');ok('holding any key skips it',await until(()=>!WBOSS13.CIN.on&&WBOSS13.fight&&WBOSS13.fight.st=='fight',3000));await p.keyboard.up('x');await W(300);
 await E(()=>{iT=0;P.hp=-1});
 ok('being knocked out ends the fight',await until(()=>!WBOSS13.fight&&!WBOSS13.void,4000));
 r=await E(()=>{let n=0;for(let i=0;i<tiles.length;i++)if(tiles[i])n++;return{n,need:WBOSS13.need(cur),boss:!!BOSS6.active(),hp:P.hp==maxHP(),px:Math.abs(P.x-window.__px2)<T*2,solid:(()=>{for(let y=(P.y+P.h)/T|0,i=0;i<3;i++,y++)if(tiles[y*W+(P.x/T|0)])return true;return false})()}});
 ok('the world returns under your feet, you are healed, and the boss still guards the gate',r.n>1000&&r.need&&!r.boss&&r.hp&&r.px&&r.solid,r);
 // ---- a rematch from the Word Gate asks first
 r=await E(()=>{const o=WORD9.open();const q=document.getElementById('wb13q');return{o,shown:!!q&&q.style.display=='flex',fight:WBOSS13.fight}});ok('L at the gate asks before starting the rematch',!r.o&&r.shown&&!r.fight,r);
 await E(()=>document.querySelector('#wb13q .no').click());await W(300);r=await E(()=>WBOSS13.fight);ok('"Not yet" leaves you in the world',!r,r);
 // ---- leaving mid-fight
 await E(()=>{WORD9.open();document.querySelector('#wb13q .go').click()});ok('"Fight" starts the rematch',await until(()=>WBOSS13.fight,1500));ok('collapse again',await until(()=>WBOSS13.CIN.on,10000));
 await E(()=>enterWorld('wbthree'));await W(2000);
 r=await E(()=>{let n=0;for(let i=0;i<tiles.length;i++)if(tiles[i])n++;return{n,fight:WBOSS13.fight,void:WBOSS13.void,cover:window.RB_COVER,cine:WBOSS13.CIN.on,canvas:!!document.getElementById('wb13c'),cur}});
 ok('leaving the world mid-sequence tears everything down and the next world loads normally',r.n>1000&&!r.fight&&!r.void&&!r.cover&&!r.cine&&!r.canvas,r);
 await E(()=>enterWorld('wbtwo'));await W(2500);r=await E(()=>{let n=0;for(let i=0;i<tiles.length;i++)if(tiles[i])n++;return{n,need:WBOSS13.need(cur),got:WORD9.state.w[cur].got.length}});ok('coming back: the world is whole, letters kept, boss still waiting',r.n>1000&&r.need&&r.got>=3,r);
 // ---- each realm gets its own boss, and worlds already solved need none
 r=await E(()=>{const st=WORD9.state.w;st['wbsolved']={got:[0,1,2],ok:1,tr:0};return{solved:WBOSS13.need('wbsolved'),plaza:WBOSS13.need('plaza')}});ok('a solved world or the Plaza has no boss',!r.solved&&!r.plaza,r);
 for(const[i,id]of[[1,'wb_pyre'],[2,'wb_nyx'],[3,'wb_mael'],[4,'wb_prism']]){await E(i=>{lvl=60;enterWorld(WORD9.stName('wbrealm',i));try{GUARD16.blocks=()=>false}catch(_){}try{BIOME17.locks=()=>false}catch(_){}},i);await W(2200);await E(()=>{for(const q of WORD9.letters)WORD9.collect(q.i)});
  const o=await until(()=>WBOSS13.CIN.on,12000);await E(()=>WBOSS13.CIN.seek(39.9));const f=await until(()=>WBOSS13.fight&&WBOSS13.fight.st=='fight',3000);await W(2600);
  r=await E(()=>{const m=BOSS6.active();return{id:WBOSS13.fight&&WBOSS13.fight.id,k:m&&m.k,x:m&&m.x,y:m&&m.y}});ok(id+' guards that realm',o&&f&&r.id==id&&r.k=='boss_'+id&&Number.isFinite(r.x)&&Number.isFinite(r.y),r);
  await p.screenshot({path:path.join(process.env.WB_SHOTS||require('os').tmpdir(),'wb-'+id+'.png')});
  await E(()=>{const m=BOSS6.active();iT=99;m.shield=0;m.hp=1;P.hp=maxHP();hurtMob(m,99999,null,0)});ok(id+' falls and the realm comes back',await until(()=>!WBOSS13.fight&&!WBOSS13.void,12000));await W(1900);await E(()=>{try{WORD9.close()}catch(_){}})}
 // ---- saved
 r=await E(()=>{const k=Object.keys(localStorage).find(k=>/rbwboss$/.test(k));return k&&JSON.parse(localStorage.getItem(k))});ok('victories and seen cinematics are saved',r&&r.w&&r.w.wbone==1&&r.seen&&r.seen.wb_root==1,r&&{w:Object.keys(r.w).length,seen:Object.keys(r.seen)});
 ok('no page errors',errs.length==0,errs.slice(0,6));
 console.log(fails?'FAILURES '+fails:'all world boss tests passed');await b.close();process.exit(fails?1:0)})();
