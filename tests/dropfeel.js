// How a drop moves and is picked up (master update 2), offline: thrown under a low ceiling it never rises into it; thrown at a wall at head height it
// never passes through; one that starts inside blocks is moved out (up, or a step sideways); only your Use key picks things up (the E skill key no longer does).
//   node tests/dropfeel.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,300):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},150000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext();
 await c.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('rbp',JSON.stringify({v:1,inv:{1:20,6:9},own:{fist:1},wp:'fist',bar:[1],done:{},lvl:30,made:true}));localStorage.setItem('rbg_seen','1')}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});
 const E=(f,a)=>p.evaluate(f,a);await E(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('dropfeel'+Date.now()%1000)});await p.waitForTimeout(1500);
 const ph=await E(()=>{const set=(x,y,b)=>{const k=y*W+x;tiles[k]=b;hp[k]=b?BLK[b][2]:0};const X=120,Y=30;for(let x=X-4;x<=X+6;x++){for(let y=Y-16;y<=Y+4;y++)set(x,y,0);set(x,Y+1,3);set(x,Y-2,3)}set(X+3,Y,3);set(X+3,Y-1,3);
  const o={};const d={i:1,n:1,x:(X+.5)*T,y:(Y+.4)*T,vy:-500,vx:0,tt:0,rest:0,ph:0};let minY=1e9;for(let i=0;i<120;i++){DROP2.step(d,1/60);minY=Math.min(minY,d.y)}o.ceil=minY>=(Y-1)*T;
  const e={i:1,n:1,x:(X+1.5)*T,y:(Y+.5)*T,vy:-80,vx:600,tt:0,rest:0,ph:0};let maxX=0;for(let i=0;i<120;i++){DROP2.step(e,1/60);maxX=Math.max(maxX,e.x)}o.wall=maxX<(X+3)*T;
  set(X-2,Y,3);set(X-2,Y-1,3);set(X-2,Y-2,3);const q={x:(X-1.5)*T,y:(Y+.5)*T};for(let y=Y-12;y<=Y+1;y++)set(X-2,y,3);DROP2.unclip(q);o.unclip=!solidAt(Math.floor(q.x/T),Math.floor(q.y/T));return o});
 ok('a drop thrown up under a low ceiling never rises into it',ph.ceil,ph);ok('thrown at a wall at head height it never passes through',ph.wall,ph);ok('one that starts inside blocks is moved out',ph.unclip,ph);
 const pk=await E(async()=>{const wait=n=>new Promise(r=>setTimeout(r,n));const c0=cnt(6);DROP2.drop(6,2);const c1=cnt(6);await wait(1500);const d=DROP2.local[DROP2.local.length-1];P.x=d.x;P.y=d.y-30;P.vx=P.vy=0;return{c0,c1}});
 await p.keyboard.press('e');await p.waitForTimeout(300);const afterE=await E(()=>cnt(6));await p.keyboard.press('f');await p.waitForTimeout(300);const afterF=await E(()=>cnt(6));
 ok('the E skill key does not pick things up; your Use key (F) does',pk.c1==pk.c0-2&&afterE==pk.c1&&afterF==pk.c0,{pk,afterE,afterF});
 ok('no errors',errs.length==0,errs.slice(0,3));await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
