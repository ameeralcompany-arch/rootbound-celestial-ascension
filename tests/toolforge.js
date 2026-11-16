// The Tool Forge: the server's table (server/toolforge.js) and the game's (TFORGE) are the same; the server charges once per request, refuses what you
// cannot pay and levels you do not have; the game refuses a half-full bar or missing materials without spending anything; levels already earned load
// unchanged; the Tool Guide shows the forge with have / need for each material; every material in the table is a real item.   node tests/toolforge.js
const path=require('path');const {chromium}=require('playwright');const TF=require('../server/toolforge');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
// ---- the server on its own
{const led={};const u={};const count=(uu,i)=>led[i]|0,charged=[];const charge=(uu,l,why)=>{charged.push(l);for(const[i,n]of l)led[i]=(led[i]|0)-n};
 led[0]=100;led[1]=10;let r=TF.forge(u,{rid:'a1',tool:'pip',from:1},{count,charge});ok('the server refuses a forge you cannot pay, and spends nothing',r.ok===0&&charged.length==0&&led[0]==100,r);
 led[0]=1000;led[1]=100;r=TF.forge(u,{rid:'a2',tool:'pip',from:1},{count,charge});ok('it charges the price once and records the level',r.ok===1&&r.to==2&&led[0]==940&&led[1]==70&&u.tool.pip==2,{r,led});
 r=TF.forge(u,{rid:'a2',tool:'pip',from:1},{count,charge});ok('the same request again is answered from the record, not charged twice',r.ok===1&&r.dup&&led[0]==940&&charged.length==1,r);
 r=TF.forge(u,{rid:'a3',tool:'pip',from:1},{count,charge});ok('a stale level is refused with the real one',r.ok===0&&r.to==2,r);
 r=TF.forge(u,{rid:'a4',tool:'pip',from:10},{count,charge});ok('nothing forges past level 10, and unknown tools are refused',r.ok===0&&TF.forge(u,{rid:'a5',tool:'sword',from:1},{count,charge}).ok===0,r);
 let tot=0;for(let l=2;l<=10;l++)tot+=TF.cost('glimmer',l)[0][1];ok('the whole climb is 7,500 gems a tool, plus materials',tot==7500,String(tot))}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('rbp',JSON.stringify({v:1,inv:{1:5},gems:0,own:{fist:1},wp:'fist',bar:[1],done:{},lvl:30,made:true}));localStorage.setItem('rbg_seen','1');
  // levels earned before the forge existed: Glimmer 6 with some progress, Twiggy 10
  localStorage.setItem('rbptool',JSON.stringify({v:1,t:{glimmer:{l:6,x:40,n:300,tx:900},twiggy:{l:10,x:0,n:999,tx:4000}}}))}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready&&window.TFORGE,null,{timeout:90000});
 const E=(f,a)=>p.evaluate(f,a);await E(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await p.waitForTimeout(1200);
 const same=await E(()=>JSON.stringify({n:TFORGE.NAT,r:TFORGE.RECIPE}));ok('the game and the server use the same forge table',same==JSON.stringify({n:TF.NAT,r:TF.RECIPE}));
 const names=await E(()=>{const bad=[];for(const id in TFORGE.NAT)for(let l=2;l<=10;l++)for(const[i]of TFORGE.cost(id,l)){if(i===0)continue;let n='';try{n=iname(i)}catch(_){}if(!n||/^#|undefined/.test(n))bad.push(id+':'+i)}return bad});
 ok('every material in the table is a real item with a name',names.length==0,names);
 const kept=await E(()=>({g:TOOLLV.info('glimmer'),t:TOOLLV.info('twiggy')}));ok('levels earned before load unchanged (Glimmer 6 with its progress, Twiggy 10)',kept.g.l==6&&kept.g.x==40&&kept.t.l==10,kept);
 const ref=await E(async()=>{const o={};TOOLLV.set('pebble',3,5);const g0=gems;o.half=await TFORGE.forge('pebble');o.l1=TOOLLV.lvl('pebble');TOOLLV.add('pebble',TOOLLV.need(3));o.poor=await TFORGE.forge('pebble');o.l2=TOOLLV.lvl('pebble');o.spent=g0-gems;return o});
 ok('a half-full bar cannot be forged',ref.half.ok===0&&/fill its bar/.test(ref.half.m)&&ref.l1==3,ref.half);
 ok('missing materials are named, and nothing is spent',ref.poor.ok===0&&/Still needed/.test(ref.poor.m)&&ref.l2==3&&ref.spent==0,ref.poor);
 const ui=await E(async()=>{const c=TFORGE.cost('pebble',4);for(const[i,n]of c){if(i===0)gems+=n;else addI(i,n)}GUIDE8.open('pebble');await new Promise(r=>setTimeout(r,300));const box=document.querySelector('.tf9');const o={box:!!box,rows:box?box.querySelectorAll('li').length:0,ok:box?box.classList.contains('ok'):false,btn:box?!box.querySelector('[data-tf]').disabled:false};
  box.querySelector('[data-tf]').click();await new Promise(r=>setTimeout(r,200));o.anim=!!document.getElementById('tf9anim');await new Promise(r=>setTimeout(r,2400));o.after=TOOLLV.lvl('pebble');o.animGone=!document.getElementById('tf9anim');o.next=!!document.querySelector('.tf9');try{GUIDE8.close()}catch(_){}return o});
 ok('the Tool Guide shows the forge for the tool, with have / need for each material, ready to press',ui.box&&ui.rows==3&&ui.ok&&ui.btn,ui);
 ok('pressing Forge plays the anvil moment, then the tool is level 4 and the panel shows the next price',ui.anim&&ui.after==4&&ui.animGone&&ui.next,ui);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
