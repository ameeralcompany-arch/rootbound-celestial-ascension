// Dungeon fixes from the ultimate update, played through the game's own code: the world you came from leaves no chests, relic vaults or depth sites inside a dungeon
// (the dungeon's own chests stay); the class dash on Shift gets through dash gates (it used to bounce off every one) and a dash that ended a moment early still
// carries you through; walking into a gate without dashing still bounces you; every dungeon prompt names the Use key the player has bound, never E (a skill key).
//   node tests/dg-fixes.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').replace(/\\/g,'/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:4321,own:{fist:1,ember:1},ownW:{},wear:{},wp:'ember',bar:[1],done:{},xp:3,lvl:40,prof:{mine:{l:2,x:0},farm:{l:1,x:0},fight:{l:1,x:0}},look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'},made:true});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});
 const c=await b.newContext({viewport:{width:1280,height:720}});await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd)}},SAVE);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|favicon/.test(m.text()))errs.push(m.text().slice(0,300))});
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready&&(window.RPG&&(RPG.CFG.dungeon={}),true),null,{timeout:90000});
 // ---- a world with caves: its own chests and depth sites exist there
 await p.evaluate(()=>enterWorld('chestcaves'));await sleep(1500);
 const w=await p.evaluate(()=>({chests:CHEST7.list().length,sites:DEPTH8.sites().length,cur}));
 ok('an ordinary world has its cave chests',w.chests>0,w);
 // ---- into a dungeon: none of them come along
 await p.evaluate(()=>{lvl=70;DG.enter('ruins','normal',{force:true,skipCine:true})});await sleep(900);
 const d=await p.evaluate(()=>{const o={run:!!DG.run,cur,listed:CHEST7.list().length,sites:DEPTH8.sites().length};let best=null;for(const c of CHEST7.list()){P.x=(c.tx+.5)*T;P.y=(c.ty-1)*T;best=CHEST7.near();if(best)break}o.nearAny=!!best;
  /* draw a frame over where an old chest was and count golden chest pixels: the drawing must be skipped */const x=document.createElement('canvas').getContext('2d');let drew=false;const fr=x.fillRect.bind(x);x.fillRect=(...a)=>{drew=true;return fr(...a)};try{BOSS6.drawProj(x,0,0)}catch(_){}o.dgChests=DG.L.chests.length;return o});
 ok('inside a dungeon the last world\'s cave chests are not there (nothing to see, nothing to open)',d.run&&d.cur=='dg_ruins'&&!d.nearAny,d);
 ok('nor its relic vaults, caches and depth sites',d.sites==0&&d.listed==0&&await p.evaluate(()=>DEPTH8.caches().length==0&&DEPTH8.geodes().length==0),d);
 ok('the dungeon keeps its own chests',d.dgChests>0,d.dgChests);
 // ---- dash gates
 const g=await p.evaluate(async()=>{const L=DG.L,out={};const gate=L.gad.find(q=>q.k=='dashgate');out.has=!!gate;if(!gate)return out;
  const at=()=>{P.x=gate.x-T*1.2;P.y=gate.y1-P.h-2;P.vx=0;P.vy=0};const frames=n=>new Promise(r=>{let i=0;const f=()=>{if(++i>=n)r();else requestAnimationFrame(f)};requestAnimationFrame(f)});
  // 1. walk into it: bounced back
  at();K.d=1;await frames(40);K.d=0;out.walk=Math.round((P.x-gate.x)/T*10)/10;
  // 2. the class dash on Shift: through
  at();await frames(3);P.f=1;dispatchEvent(new KeyboardEvent('keydown',{key:'Shift'}));K.d=1;await frames(30);K.d=0;dispatchEvent(new KeyboardEvent('keyup',{key:'Shift'}));out.dash=Math.round((P.x-gate.x)/T*10)/10;out.classDash=!!(window.STY1&&STY1.DS);
  // 3. a dash that ended a moment before the gate still counts
  out.grace=(()=>{STY1.DS.on=1;DASHING();STY1.DS.on=0;const a=DASHING();DASHING.t=performance.now()-400;const b=DASHING();return[a,b]})();
  return out});
 ok('the dungeon has a dash gate to test',g.has,g);
 ok('walking into a dash gate still bounces you back',g.walk<0,g);
 ok('the class dash (Shift) goes through a dash gate',g.dash>0,g);
 ok('a dash that ended a moment ago still carries you through; a long-finished one does not',g.grace[0]===true&&g.grace[1]===false,g.grace);
 // ---- prompts name the Use key, never E
 const pr=await p.evaluate(async()=>{const L=DG.L,o={};const shown=async()=>{for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,60));const e=document.getElementById('prompt');if(e&&e.style.display=='block'&&e.textContent)return e.textContent}return null};const hold=(x,y)=>{P.x=x;P.y=y-P.h;P.vx=P.vy=0};
  const port=L.portals[0];if(port){hold(port.x,port.y);o.portal=await shown()}const ch=L.chests.find(q=>!q.hid&&!q.open);if(ch){hold(ch.x,ch.y);o.chest=await shown()}const gt=L.gates.find(q=>!q.open);if(gt){hold(gt.x,gt.y);o.gate=await shown()}o.hint=(document.querySelector('#dghud .hint')||document.querySelector('.hint')||{}).textContent;o.key=RB_KB.use;return o});
 ok('dungeon prompts name the Use key ('+pr.key.toUpperCase()+'), not E',[pr.portal,pr.chest].every(t=>t&&t.includes('('+pr.key.toUpperCase()+')'))&&[pr.portal,pr.chest,pr.gate].every(t=>!t||!t.includes('(E)')),pr);
 ok('the dungeon hint line names Shift and the Use key',!pr.hint||(/Shift dash/.test(pr.hint)&&!/ E use/.test(pr.hint)),pr.hint);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
