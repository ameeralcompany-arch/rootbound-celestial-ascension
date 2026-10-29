// Plaza town tests (headless). Run: node tests/plaza.js [shotDir]   (CHROMIUM=/path/to/chromium if needed)
// The Plaza is a wide open town at mid-world height: clear air above the street, no trees, every NPC has a class and lives near a house of
// that class, the street can be walked end to end, the world door works, the Sky Run floats clear of the town and can be finished,
// spirit stones are reachable, stale plaza data is migrated away, the plaza never reads as underground, and nothing throws.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.argv[2]||'';
let fails=0;const ok=(n,c,d)=>{console.log((c?'PASS ':'FAIL ')+n+(d?'  - '+d:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},300000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1280,height:720}});
 // stale data from an older plaza + one of the player's own worlds: the plaza data must go, the player world must stay
 await ctx.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));if(!localStorage.getItem('plz_seeded')){localStorage.setItem('plz_seeded','1');localStorage.setItem('rbplz','2');localStorage.setItem('rbw_plaza',JSON.stringify({'1000':[3,0,0,0],'1001':[7,0,0,0]}));localStorage.setItem('rbw_mytown',JSON.stringify({'500':[5,0,0,0]}))}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push('console: '+m.text())});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=8;if(cur!='plaza')enterWorld('plaza')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a);
 const shot=async(name,tx,ty)=>{if(!SHOTS)return;await E(([tx,ty])=>{P.x=tx*T+T/2;P.y=(ty==null?sh(tx):ty)*T-P.h-1;P.vx=P.vy=0;const vw=cv.width/ZM,vh=cv.height/ZM;cam.x=Math.max(0,Math.min(W*T-vw,P.x-vw/2));cam.y=Math.max(-200,Math.min(H*T-vh,P.y+P.h/2-(window.CAMUP||0)-vh/2))},[tx,ty]);await p.waitForTimeout(700);fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,'plaza_'+name+'.png')})};
 // --- migration
 let r=await E(()=>({v:localStorage.getItem('rbplz'),old:localStorage.getItem('rbw_plaza'),mine:localStorage.getItem('rbw_mytown'),k1000:tiles[1000],k1001:tiles[1001]}));
 ok('old plaza edits are migrated away (layout v3), the player\'s own worlds are untouched',r.v=='3'&&r.old===null&&r.mine&&r.mine.includes('500')&&r.k1000==0&&r.k1001==0,JSON.stringify(r));
 // --- terrain: mid-world ground, clear air above the street, no trees
 r=await E(()=>{const S=PLZ7.S,o={S,mid:sh(DX)==S&&S==H/2,trees:trees.size,blocked:[],sky:0,ground:0};const C=new Set();for(const q of PLZ7.COURSE)for(let x=q.x0;x<q.x0+q.w;x++){C.add(q.row*W+x);C.add((q.row+1)*W+x)}
  for(let y=0;y<S;y++)for(let x=1;x<W-1;x++){const k=y*W+x;if(!tiles[k])continue;if(C.has(k)){o.sky++;continue}o.blocked.push(x+','+y)}
  for(let x=1;x<W-1;x++){if(x>=PLZ7.POND.x0&&x<=PLZ7.POND.open)continue;if(solidAt(x,S))o.ground++}o.need=W-2-(PLZ7.POND.open-PLZ7.POND.x0+1);o.lowest=Math.max(...PLZ7.COURSE.map(q=>q.row+1));return o});
 ok('plaza ground sits at mid-world height (row '+r.S+' of 128)',r.mid,JSON.stringify(r).slice(0,200));
 ok('no trees in the plaza',r.trees==0,'trees='+r.trees);
 ok('the air above the street is clear (only Sky Run platforms float, high up)',r.blocked.length==0&&r.sky>0&&r.lowest<r.S-20,r.blocked.slice(0,8).join(' ')+' sky='+r.sky+' lowest='+r.lowest);
 ok('solid street from the pier to the east wall',r.ground==r.need,r.ground+'/'+r.need);
 // --- NPCs: class + matching house, painted facades distinct per class
 r=await E(()=>{const o={bad:[],cls:new Set(),n:0};for(const n of NPC2.list()){o.n++;const h=PLZ7.house(n.id);if(!n.cls||!CLASS7.C[n.cls])o.bad.push(n.id+':noclass');else if(!h||h.c!=n.cls)o.bad.push(n.id+':house');else{o.cls.add(h.c);if(!HOUSE7.P[h.c])o.bad.push(n.id+':painter');if(!/ · /.test(n.role))o.bad.push(n.id+':role')}}
  const sigs=new Set();for(const it of PLZ7.IT){if(!it.npc)continue;const e=HOUSE7.get(it,.5,true),c=e.c,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let px=0,h=0;for(let i=3;i<d.length;i+=16)if(d[i]>40){px++;h=(h*31+d[i-3]*3+d[i-2]*5+d[i-1]*7)>>>0}if(px<c.width*c.height/16*.25)o.bad.push(it.id+':blank '+px);sigs.add(h)}o.sigs=sigs.size;o.cls=o.cls.size;return o});
 ok('every NPC has a class and lives in a house of that class (13 distinct class houses)',r.bad.length==0&&r.cls==13&&r.sigs==13&&r.n>=13,JSON.stringify(r));
 // NPCs stay near their own house over time, on the ground, never inside blocks
 {const bad=[];let samples=0;for(let i=0;i<6;i++){const s=await E(()=>NPC2.list().filter(n=>n.on&&!n.fly).map(n=>{const h=PLZ7.house(n.id),c=Math.floor(n.wx/T),r0=Math.floor((n.wy-2)/T);return{id:n.id,near:n.wx>=(h.x0-1)*T&&n.wx<=(h.x0+h.w+3)*T,inside:solidAt(c,r0)||solidAt(c,r0-1),ground:solidAt(c,r0+1),row:Math.abs(n.wy-PLZ7.S*T)<1}}));for(const q of s){samples++;if(!q.near||q.inside||!q.ground||!q.row)bad.push(q.id+JSON.stringify(q))}await p.waitForTimeout(1800)}
  ok('NPCs stay near their houses on open ground ('+samples+' samples over ~11 s)',bad.length==0&&samples>40,bad.slice(0,4).join(' | '))}
 r=await E(()=>{const o={};const lu=NPC2.list().find(n=>n.id=='lumi');P.x=lu.wx+8;P.y=PLZ7.S*T-P.h-1;P.vx=P.vy=0;const nn=nearNPC();o.lumi=nn&&nn.id;const n=NPCS.find(q=>q.id=='mira');P.x=n.wx+10;if(dlgOpen)closeDlg();interact();const h=document.getElementById('dlg').innerHTML;o.dlg=/Gunslinger/.test(h)&&/talk:cls/.test(h);dlgAct('talk:cls');o.tip=/Deadeye|trigger/.test(document.getElementById('dlg').innerHTML);closeDlg();return o});
 ok('NPC dialogs show the class and give class tips; Lumi is reachable from the street',r.dlg&&r.tip&&r.lumi=='lumi',JSON.stringify(r));
 // --- walk the whole street end to end (holding right, then left, jumping now and then) and climb out of the pond
 const walk=dir=>E(dir=>{const S=PLZ7.S,goal=dir>0?(W-2)*T:(PLZ7.POND.pier0+.5)*T;if(dlgOpen)closeDlg();menuEl.style.display='none';P.x=dir>0?(PLZ7.POND.pier0+.5)*T:(W-2.5)*T;P.y=S*T-P.h-1;P.vx=P.vy=0;let best=P.x,stall=0,i=0,ok=false;
  for(;i<9000;i++){K.d=dir>0;K.a=dir<0;if(i%50==0)jumpPress();K.w=false;update(1/60);if(dir>0?P.x>best+1:P.x<best-1){best=P.x;stall=0}else stall++;if(stall>240)break;if(dir>0?P.x>=goal:P.x<=goal){ok=true;break}}K.d=K.a=K.w=false;return{ok,steps:i,x:Math.round(P.x/T),stall}},dir);
 r=await walk(1);ok('walk the plaza west to east without getting stuck',r.ok,JSON.stringify(r));
 r=await walk(-1);ok('walk the plaza east to west without getting stuck',r.ok,JSON.stringify(r));
 r=await E(()=>{const S=PLZ7.S;P.x=5*T;P.y=(S+3)*T;P.vx=P.vy=0;let i=0;for(;i<1500;i++){K.d=true;if(i%30==0)jumpPress();K.w=true;update(1/60);if(P.g&&P.x>(PLZ7.POND.pier0)*T&&Math.round((P.y+P.h)/T)==S)break}K.d=K.w=false;return{ok:i<1500,i,x:+(P.x/T).toFixed(1)}});
 ok('the Moonlit Pond can be swum out of onto the pier',r.ok,JSON.stringify(r));
 // --- world door
 r=await E(()=>{P.x=DX*T+T/2;P.y=sh(DX)*T-P.h-1;P.vx=P.vy=0;update(1/60);const o={near:nearDoor()};if(dlgOpen)closeDlg();interact();o.menu=menuEl.style.display!='none';try{closeMenu()}catch(_){}menuEl.style.display='none';return o});
 ok('the World Gate door opens the world menu',r.near&&r.menu,JSON.stringify(r));
 // --- Sky Run: beam up, course clear of the town, a bot finishes it (tapping jump only, no wing flight), the return pad glides down
 r=await E(()=>{const o={},S=PLZ7.S,C=PLZ7.COURSE;o.clear=C.every(q=>PLZ7.HS.every(h=>q.x0+q.w<=h.x0||q.x0>=h.x0+h.w||q.row+2<S-h.h-10));o.square=PLZ7.BEAM.x0>=PLZ7.SQ.x0&&PLZ7.BEAM.x1<=PLZ7.SQ.x1;
  RUN7.reset();P.x=(PLZ7.BEAM.x0+1)*T;P.y=S*T-P.h-1;P.vx=P.vy=0;K.d=K.a=false;let i=0;for(;i<400&&!RUN7.riding;i++)update(1/60);o.launched=RUN7.riding;for(;i<900&&RUN7.riding;i++)update(1/60);for(let j=0;j<30;j++)update(1/60);
  o.atStart=Math.round((P.y+P.h)/T)==C[0].row&&P.x>=C[0].x0*T&&P.x<=(C[0].x0+C[0].w)*T;o.state=RUN7.state;return o});
 ok('the Sky Run floats clear above the town (10+ rows over every roof) and starts from Gate Square',r.clear&&r.square,JSON.stringify(r));
 ok('the Sky Beam lifts the player to START and the run starts',r.launched&&r.atStart&&r.state=='run',JSON.stringify(r));
 r=await E(()=>{const C=PLZ7.COURSE,o={hops:0,fail:-1};const on=q=>P.g&&Math.round((P.y+P.h)/T)==q.row&&P.x>=q.x0*T-2&&P.x<=(q.x0+q.w)*T+2;
  for(let k=0;k<C.length-1;k++){const a=C[k],bb=C[k+1],dir=Math.sign(bb.x0-a.x0)||1,L=bb.x0*T,R=(bb.x0+bb.w)*T,tc=(L+R)/2;let jumped=false,done=false,ji=0;
   for(let i=0;i<700;i++){if(on(bb)&&Math.abs(P.vx)<8&&jumped){done=true;break}
    if(!jumped){const edge=dir>0?(a.x0+a.w)*T-15:a.x0*T+15;if(dir>0?P.x<edge:P.x>edge){K.d=dir>0;K.a=dir<0}else{K.d=dir>0;K.a=dir<0;jumpPress();K.w=false;jumped=true;ji=i}}
    else{if(P.vy<0&&!(P.x>L&&P.x<R)){K.d=dir>0;K.a=dir<0}else{const dx=tc-P.x;K.d=dx>4;K.a=dx<-4}if(P.g&&!on(bb)&&i>ji+20){break}}
    update(1/120)}K.d=K.a=K.w=false;for(let i=0;i<12;i++)update(1/120);if(!done){o.fail=k;o.at=[+(P.x/T).toFixed(1),+((P.y+P.h)/T).toFixed(1)];break}o.hops++}
  o.state=RUN7.state;o.best=RUN7.best>0;return o});
 ok('the Sky Run is playable: a bot hops every platform to the Sky Shrine and the finish registers',r.fail<0&&r.state=='done'&&r.best,JSON.stringify(r));
 r=await E(()=>{const S=PLZ7.S,R=PLZ7.RET;P.x=(R.x0+1)*T;P.y=R.row*T-P.h-1;P.vx=P.vy=0;let i=0;for(;i<400&&!RUN7.riding;i++)update(1/60);const l=RUN7.riding;for(;i<1200&&RUN7.riding;i++)update(1/60);for(let j=0;j<40;j++)update(1/60);return{l,ground:P.g&&Math.round((P.y+P.h)/T)==S,x:+(P.x/T).toFixed(1)}});
 ok('the Sky Shrine return pad glides the player back down to the street',r.l&&r.ground,JSON.stringify(r));
 // --- spirit stones reachable
 r=await E(()=>{const S=PLZ7.S,bad=[];for(let i=0;i<HUNT7.SPOTS.length;i++){const q=HUNT7.pos(i),tx=Math.floor(q.x/T),ty=Math.floor(q.y/T);if(tiles[ty*W+tx]){bad.push(i+':solid');continue}if(wl[ty*W+tx]>0)continue;let reach=false;for(let dx=-1;dx<=1&&!reach;dx++)for(let y=ty+1;y<=ty+4;y++){const x=tx+dx;if(solidAt(x,y)&&!solidAt(x,y-1)&&!solidAt(x,y-2)){if(y*T-27-q.y<=150)reach=true;break}}if(!reach)bad.push(i+':far')}return{n:HUNT7.SPOTS.length,bad}});
 ok('all 7 spirit stones sit in reachable spots (walk, jump or swim)',r.n==7&&r.bad.length==0,JSON.stringify(r));
 // --- the plaza reads as the surface: no mine/deep music, no depth zone, not even in the pond
 r=await E(()=>{const o={},S=PLZ7.S;for(const[k,x,y]of[['street',DX,S],['pond',5,S+4],['sky',150,30]]){P.x=x*T+T/2;P.y=y*T-P.h;MUS7.detect();o[k]=[MUS7.depthNow(),MUS7.want]}for(let i=0;i<5;i++)update(1/60);try{o.zone=(document.getElementById('dz8')||{classList:{contains:()=>false}}).classList.contains('on')||!!DEPTH8.band?1:0}catch(_){o.zone=0}return o});
 ok('no underground zone or music anywhere in the plaza',['street','pond','sky'].every(k=>r[k][0]<20&&!/mine|deep/.test(r[k][1]))&&!r.zone,JSON.stringify(r));
 // --- frame cost in the plaza (headless software renderer: indicative only)
 await shot('center',128);const perf=await E(()=>new Promise(res=>{let n=0,ms=0;const d0=draw;draw=function(){const t=performance.now();d0.apply(this,arguments);ms+=performance.now()-t;n++};const t0=performance.now();(function f(){if(performance.now()-t0<2500)requestAnimationFrame(f);else{draw=d0;res({drawMs:+(ms/n).toFixed(2),frames:n,cachePx:HOUSE7.px})}})()}));
 console.log('PERF plaza (headless, not representative of a GPU): '+JSON.stringify(perf));
 if(SHOTS){for(const[nm,x]of[['west',26],['artisan',76],['market',150],['warriors',190],['arcane',236]])await shot(nm,x);await shot('sky',160,26)}
 ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all plaza tests passed');process.exit(fails?1:0)})();
