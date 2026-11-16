// Compact normal worlds (generator g3), played through the game's own code (headless): a world made now is a valley about 160 blocks wide between two
// cliff faces; you cannot walk, jump or fly past them; the camera stays inside; monsters only appear inside; the village is there; and a world made
// before (g2 or classic) keeps its full 256-block width and its builds.   node tests/worldsize.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:100,own:{fist:1},wp:'fist',bar:[1],done:{},xp:3,lvl:30,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:720}});
 await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1');
  // a world made before this update: generator 2 with one build far east, beyond the new valley's edge
  localStorage.setItem('rbw_oldland',JSON.stringify({W:256,g:2,[20*256+230]:[7,0,0,0]}))}},SAVE);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});
 const E=(f,a)=>p.evaluate(f,a);await E(()=>{try{RPG.guide.stop()}catch(_){}});
 // walk (with jumps) toward one side for up to 70 s of game time; returns how far you got
 await E(()=>{window.__walk=(dir,secs)=>{if(dlgOpen)closeDlg();for(const k in K)K[k]=0;let i=0,best=P.x;const t0=P.x;for(;i<secs*60;i++){K.d=dir>0;K.a=dir<0;if(i%45==0)jumpPress();if(i%45==20)jumpRelease();update(1/60);if(dir>0?P.x>best:P.x<best)best=P.x}K.d=K.a=false;return{from:Math.round(t0/T),to:Math.round(best/T),secs:i/60}}});
 const nw=await E(async()=>{enterWorld('valley'+(Date.now()%100000));await new Promise(r=>setTimeout(r,1500));try{NAV16.closeAll()}catch(_){}const o={gv:VILL9.gv,b:window.WBND,BX0:VILL9.BX0,BX1:VILL9.BX1,mark:edits.g,village:!!(VILL9.info&&VILL9.info.v)};
  o.faces=[VILL9.BX0,VILL9.BX1].every(x=>{for(let y=2;y<H-3;y++)if(!solidAt(x,y))return false;return true});return o});
 ok('a world made now is a compact valley (generator 3, 160 blocks between its cliffs) with its village',nw.gv==3&&nw.mark==3&&nw.BX1-nw.BX0==160&&nw.b&&nw.b[0]==nw.BX0*48&&nw.village,nw);
 ok('both cliff faces are solid from the top of the sky down',nw.faces,nw);
 const wr=await E(()=>{P.x=(VILL9.BX1-24)*T;let top=0;for(let y=0;y<H;y++)if(solidAt(VILL9.BX1-24,y)){top=y;break}P.y=top*T-P.h-1;return __walk(1,40)}),wl=await E(()=>{P.x=(VILL9.BX0+24)*T;let top=0;for(let y=0;y<H;y++)if(solidAt(VILL9.BX0+24,y)){top=y;break}P.y=top*T-P.h-1;return __walk(-1,40)});
 ok('walking and jumping east never gets past the east cliff',wr.to<nw.BX1,wr);
 ok('nor west past the west cliff',wl.to>nw.BX0,wl);
 const fl=await E(()=>{P.x=(VILL9.BX1-6)*T;let top=0;for(let y=0;y<H;y++)if(solidAt(VILL9.BX1-6,y)){top=y;break}P.y=(top-12)*T;P.vy=0;P.vx=0;for(let i=0;i<600;i++){K.d=true;K.w=true;P.vy=Math.min(P.vy,-200);update(1/60)}K.d=K.w=false;return{x:+(P.x/T).toFixed(2),y:Math.round(P.y/T)}});
 ok('even flying high you cannot get over a cliff',fl.x<nw.BX1,fl);
 const cam_=await E(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(r));P.x=(VILL9.BX1-3)*T;for(let i=0;i<120;i++)await fr();const vw=cv.width/ZM,r={right:Math.round(cam.x+vw),edge:WBND[1]};P.x=(VILL9.BX0+3)*T;for(let i=0;i<120;i++)await fr();r.left=Math.round(cam.x);r.edge0=WBND[0];return r});
 const mn=await E(()=>{const x=VILL9.BX1;let y=0;for(let r=0;r<H;r++)if(solidAt(x-1,r)){y=r;break}const before=tiles[(y+1)*W+x];const r=breakAt(x,y+1,999);return{r,same:tiles[(y+1)*W+x]===before&&!!before}});
 ok('the cliffs cannot be broken',mn.r===false&&mn.same,mn);
 ok('the camera stays inside the valley at both ends',cam_.right<=cam_.edge+2&&cam_.left>=cam_.edge0-2,cam_);
 const sp=await E(()=>{try{night=1}catch(_){}const out=[];for(const px of[VILL9.BX0+6,VILL9.BX1-6,DX]){P.x=px*T;let top=0;for(let y=0;y<H;y++)if(solidAt(px,y)){top=y;break}P.y=top*T-P.h-1;for(let i=0;i<60;i++){mobs.length=0;if(spawnMob())for(const m of mobs)out.push(Math.round(m.x/T))}}mobs.length=0;return{n:out.length,min:Math.min(...out),max:Math.max(...out)}});
 ok('monsters only appear inside the valley',sp.n>20&&sp.min>nw.BX0&&sp.max<nw.BX1,sp);
 ok('crossing the valley takes about 30 s on foot (was about 47 s)',Math.abs((nw.BX1-nw.BX0)*48/260-29.5)<1.5,String(((nw.BX1-nw.BX0)*48/260).toFixed(1))+' s');
 // ---- an older world keeps its full width and its build
 const od=await E(async()=>{enterWorld('oldland');await new Promise(r=>setTimeout(r,1200));try{NAV16.closeAll()}catch(_){}return{gv:VILL9.gv,b:window.WBND,brick:tiles[20*W+230]==7}});
 ok('a world made before keeps its size (generator 2, no valley) and its build',od.gv==2&&od.b==null&&od.brick,od);
 const ow=await E(()=>{const x=232;let top=0;for(let y=0;y<H;y++)if(solidAt(x,y)){top=y;break}P.x=x*T+T/2;P.y=top*T-P.h-1;P.vx=P.vy=0;for(let i=0;i<30;i++)update(1/60);return{x:+(P.x/T).toFixed(1),open:!solidAt(x,top-1)}});
 ok('and its land beyond where a new valley would end is still there to stand on',ow.x>nw.BX1+20&&ow.open,ow);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
