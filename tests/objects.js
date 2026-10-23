// Object / door / permission tests (single client; multiplayer transport needs real browsers+PeerJS and is NOT covered here)
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d?'  - '+d:''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});await p.waitForTimeout(400);
 await p.evaluate(()=>{enterWorld('objtest')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a);
 // place a door in front of the player
 const info=await E(()=>{const tx=Math.floor(P.x/T)+2,ty=Math.floor((P.y+P.h-1)/T);const ks=[];for(let i=0;i<4;i++){const k=ty*W+tx+i;tiles[k]=0;ks.push(k)}return{ks,ty,tx}});
 ok('object ids registered with names/prices',await E(()=>[20,21,22,23,24,25,26,27].every(i=>BLK[i]&&PRICE[i]>0&&SOLID6[i]===0)));
 ok('all 7 door types defined',await E(()=>[20,21,22,23,24,25,26].every(i=>ODEF[i].cat=='door')));
 await E(i=>{for(let j=0;j<i.ks.length;j++){tiles[i.ks[j]]=[20,23,27,30][j];pushEdit(i.ks[j])}},info);
 ok('placing objects creates object records',await E(i=>i.ks.every(k=>OBJ[k]&&OBJ[k].t==tiles[k]),info));
 ok('objects are walk-through (non solid)',await E(i=>!solidAt(i.ks[0]%W,i.ks[0]/W|0),info));
 ok('objects persisted into edits.o',await E(i=>!!(edits.o&&edits.o[i.ks[0]]),info));
 // render a frame with all object types for crash check
 const art=await E(()=>{const r=[];for(const id of OBJ_IDS){const k=(H-3)*W+10+id;tiles[k]=id;OBJ[k]=objDefaults(id)}return 'ok'});await p.waitForTimeout(800);
 ok('all object types render without errors',errs.length==0,errs.join('|'));
 await E(()=>{for(const id of OBJ_IDS){const k=(H-3)*W+10+id;tiles[k]=0;delete OBJ[k]}});
 // door config sanitising
 ok('cleanObj sanitises hostile config',await E(()=>{const o=cleanObj({t:20,c:{d:'<script>alert(1)</script>',nm:'x'.repeat(99),lv:'abc',ac:9,dt:'zz'},s:{on:1}});return o.c.d.indexOf('<')<0&&o.c.nm.length<=16&&o.c.lv===0&&o.c.ac<=3&&o.c.dt=='w'}));
 ok('cleanObj rejects unknown ids / junk',await E(()=>cleanObj({t:999})===null&&cleanObj(null)===null&&cleanObj('x')===null));
 ok('OBJ6.clean caps and validates keys',await E(()=>{const e={};for(let i=0;i<2000;i++)e[i]={t:20};e[-5]={t:20};e.abc={t:20};e[W*H+9]={t:20};const c=OBJ6.clean(e);return Object.keys(c).length<=1500&&!(-5 in c)&&!('abc' in c)}));
 // same-world link
 const r1=await E(i=>{const [a,b2]=i.ks;OBJ[a].c.dt='l';OBJ[a].c.lb='AA';OBJ[a].c.ac=0;tiles[b2]=32;OBJ[b2]=objDefaults(32);OBJ[b2].c.lb='AA';const px=P.x;P.x=a%W*T+T/2;P.y=(a/W|0)*T;DOORS6.use(a);return{busy:DOORS6.busy}},info);
 await p.waitForTimeout(1300);
 ok('same-world door teleports to linked label',await E(i=>Math.abs(P.x-(i.ks[1]%W*T+T/2))<2,info));
 // access control: visitor in someone else's world
 const r2=await E(i=>{meta={x:5,y:5,o:'someone-else',on:'Owner',f:[],t:[],b:[],pub:0};const k=i.ks[0];OBJ[k].c.dt='w';OBJ[k].c.d='plaza';OBJ[k].c.ac=3;const why=DOORS6.check(OBJ[k]);OBJ[k].c.ac=0;const why2=DOORS6.check(OBJ[k]);return{why,why2,role:OBJ6.roleOf(myId)}},info);
 ok('owner-only door refuses a visitor',/Access/.test(r2.why),r2.why);ok('everyone door allows a visitor',r2.why2==='',r2.why2);
 ok('visitor cannot configure',await E(()=>!OBJ6.canConfig(myId)));
 ok('visitor cannot change door via configure()',await E(i=>{const k=i.ks[0];const before=OBJ[k].c.d;const r=OBJ6.configure(k,{...OBJ[k].c,d:'hack'});return r===false&&OBJ[k].c.d==before},info));
 ok('builder can configure',await E(i=>{meta.f=[myId];const r=OBJ6.canConfig(myId);return r}));
 // key / level requirement
 const r3=await E(i=>{const k=i.ks[0];const o=OBJ[k];o.c.kr=1;o.c.lv=0;inv[230]=0;const a=DOORS6.check(o);inv[230]=1;const b2=DOORS6.check(o);o.c.kr=0;o.c.lv=99;const c=DOORS6.check(o);o.c.lv=0;return{a,b:b2,c}},info);
 ok('missing key blocks door',/Key/.test(r3.a),r3.a);ok('having key allows door',r3.b==='',r3.b);ok('level requirement blocks',/level/.test(r3.c),r3.c);
 // loop guard
 const lg=await E(i=>{DOORS6.cancel();let n=0;const k=i.ks[0];OBJ[k].c.dt='w';OBJ[k].c.d=cur;/* same world => no history */ for(let j=0;j<10;j++){}return 1},info);
 // break object clears record
 const bk=await E(i=>{const k=i.ks[2];tiles[k]=0;pushEdit(k);return !OBJ[k]},info);ok('breaking an object removes its record',bk);
 // chest ops (solo = host path)
 const ch=await E(i=>{meta=null;const k=i.ks[2];tiles[k]=27;pushEdit(k);inv[5]=10;OBJ6.chestOp(k,'put',5,4);const a=OBJ[k].c.it.map(x=>x.join(':')).join(),inv1=cnt(5);OBJ6.chestOp(k,'take',5,3);return{a,inv1,after:cnt(5),left:OBJ[k].c.it[0]&&OBJ[k].c.it[0][1]}},info);
 ok('chest put moves items out of inventory',ch.a=='5:4'&&ch.inv1==6,JSON.stringify(ch));ok('chest take returns items, no duplication',ch.after==9&&ch.left==1,JSON.stringify(ch));
 const ch2=await E(i=>{const k=i.ks[2];OBJ6.chestOp(k,'take',5,50);return{n:cnt(5),left:OBJ[k].c.it[0][1]}},info);ok('chest over-take refused',ch2.n==9&&ch2.left==1,JSON.stringify(ch2));
 const ch3=await E(i=>{const k=i.ks[2];const b4=cnt(5);OBJ6.chestOp(k,'put',5,9999);return cnt(5)==b4},info);ok('cannot put more than you own',ch3);
 // host validation of remote requests
 // permission enforcement for shared worlds now lives on the server (rules.js) and is covered by tests/server.js + tests/e2e.js
 // banned user
 ok('banned uid has role -1',await E(()=>{meta={x:1,y:1,o:'own',on:'O',f:[],t:[],b:['bad'],pub:0};const r=OBJ6.roleOf('bad');meta=null;return r===-1}));

 // crafting
 const cr=await E(i=>{const k=i.ks[3];tiles[k]=33;pushEdit(k);P.x=k%W*T+T/2;P.y=(k/W|0)*T;inv={};inv[8]=5;lvl=20;const a=CRAFT6.start('glass',1);return{q:X6.q&&X6.q.r,sand:cnt(8),near:!!OBJ6.near()}},info);
 ok('craft consumes ingredients atomically and queues',cr.q=='glass'&&cr.sand==3,JSON.stringify(cr));
 const cr2=await E(()=>{CRAFT6.start('brick',1);return X6.q.r},0);ok('second craft refused while one is running',cr2=='glass');
 const cr3=await E(()=>{CRAFT6.collect();return cnt(6)},0);ok('collect before finish gives nothing',cr3==0);
 const cr4=await E(()=>{X6.q.end=Date.now()-1;CRAFT6.collect();return{g:cnt(6),q:X6.q}},0);ok('finished craft pays out once',cr4.g==2&&cr4.q===null,JSON.stringify(cr4));
 const cr5=await E(()=>{inv={};CRAFT6.start('marble',1);return{q:X6.q,n:cnt(3)}},0);ok('craft with missing materials refused, nothing consumed',cr5.q===null&&cr5.n==0);
 const cr6=await E(()=>{inv={1:2,11:1};lvl=1;CRAFT6.start('brick',1);const lv=X6.q;lvl=20;return lv},0);ok('craft refused when under level',!cr6);
 const cr7=await E(()=>{inv={8:2};x6Save();X6.q={r:'glass',end:Date.now()-5000,n:1};x6Save();X6.q=null;x6Load();return X6.q&&X6.q.r},0);ok('craft queue persists and finishes while offline',cr7=='glass');
 const cr8=await E(()=>{localStorage.setItem('rbc2',JSON.stringify({q:{r:'<x>',end:'zzz',n:9e9},friends:[1,'a'],disc:{a:1,b:5}}));X6.q=null;X6.friends=[];X6.disc={};x6Load();return{q:X6.q,f:X6.friends,d:Object.keys(X6.disc)}},0);ok('corrupt craft save is sanitised',cr8.q===null&&cr8.f.length==1&&cr8.d.join()=='a',JSON.stringify(cr8));

 // farming growth uses wall-clock timestamps => continues while the game is closed
 const fm=await E(()=>{const k=(H-20)*W+30;trees.set(k,{s:1,r:1,p:Date.now()-3600*1000});const a=prog(trees.get(k));trees.set(k,{s:1,r:1,p:Date.now()});const b=prog(trees.get(k));return{a,b}},0);ok('crop planted an hour ago is fully grown, fresh crop is not',fm.a===1&&fm.b<.2,JSON.stringify(fm));
 // object persistence through world save + page reload
 await E(i=>{const k=i.ks[2];tiles[k]=27;pushEdit(k);OBJ[k].c.it=[[5,7]];OBJ[k].c.nm='Persist';dirty=1},info);await p.waitForTimeout(4500);
 await p.reload();await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(500);await p.evaluate(()=>enterWorld('objtest'));await p.waitForTimeout(900);
 const ps=await E(i=>{const k=i.ks[2];return OBJ[k]?{nm:OBJ[k].c.nm,it:OBJ[k].c.it}:null},info);ok('chest + contents survive save and reload',ps&&ps.nm=='Persist'&&ps.it[0][1]==7,JSON.stringify(ps));
 ok('door survives reload with its config',await E(i=>!!OBJ[i.ks[0]]&&OBJ[i.ks[0]].t==20,info));
 // sign
 ok('no page errors in whole run',errs.length==0,errs.join('|'));
 console.log(fails?fails+' FAILED':'all object tests passed');await b.close();process.exit(fails?1:0)})();
