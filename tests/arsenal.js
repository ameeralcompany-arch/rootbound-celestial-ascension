// The grand arsenal (99-zzzzzzzzz-d-arsenal.js): 21 new weapons for each of the 13 classes. Each class gets 4 common, 4 uncommon, 4 rare,
// 4 epic, 3 legendary and 2 mythic weapons; no two weapons of a class share a move + element; every weapon belongs to its class, is in the
// store, has a description, draws its own held art, deals damage with its move, and has a measured power (WPOWER). No page errors.
// node tests/arsenal.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},400000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);const E=(f,a)=>p.evaluate(f,a);
 let r=await E(()=>{const bad=[],dup=[],rar={};for(const k in CLASS7.C){const ids=ARS10.BYC[k]||[];if(ids.length!=21)bad.push(k+' has '+ids.length);const seen=new Set(),rc={};
   for(const id of ids){const w=WPN[id],S=ARS10.SPEC[id];if(CLASS7.of(w)!==k)bad.push(id+' class');if(!SHOP7.byId.has('wpn_'+id))bad.push(id+' store');if(!(w.d&&w.d.length>20))bad.push(id+' text');if(!(w.md>0&&WPOWER(id)>0))bad.push(id+' power');
    const key=S.mv+'+'+S.el;if(seen.has(key))dup.push(k+': '+key);seen.add(key);rc[w.rar]=(rc[w.rar]||0)+1}rar[k]=['common','uncommon','rare','epic','legendary','mythic'].map(q=>rc[q]|0).join('/')}
  const names=ARS10.IDS.map(id=>WPN[id].n);return{bad,dup,rar,n:ARS10.IDS.length,uniq:new Set(names).size==names.length}});
 ok('273 new weapons, 21 per class, each in its class and the store with a description and a power',r.n==273&&r.bad.length==0&&r.uniq,r.bad.slice(0,8));
 ok('every class: 4 common, 4 uncommon, 4 rare, 4 epic, 3 legendary, 2 mythic',Object.values(r.rar).every(v=>v=='4/4/4/4/3/2'),r.rar);
 ok('no two weapons of a class share a move and an element',r.dup.length==0,r.dup);
 r=await E(()=>{const bad=[];for(const id of ARS10.IDS){const c=document.createElement('canvas');c.width=140;c.height=80;const x=c.getContext('2d');x.translate(30,40);drawWeapon(x,id,40,1);const d=x.getImageData(0,0,140,80).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>30)n++;if(n<150)bad.push(id+' '+n)}return bad});
 ok('every weapon draws its own held art',r.length==0,r.slice(0,8));
 // each weapon attacks: on flat ground, three dummies in front, one use
 await E(()=>{document.getElementById('bp').click()});await p.waitForTimeout(300);await E(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=60;enterWorld('arsenalt')});await p.waitForTimeout(2500);
 r=await E(async()=>{const bad=[],px=Math.floor(P.x/T),fy=Math.floor((P.y+P.h-2)/T);for(let x=px-6;x<=px+14;x++){for(let y=fy-8;y<=fy;y++){const k=y*W+x;tiles[k]=0;wl[k]=0}for(let y=fy+1;y<=fy+2;y++)tiles[y*W+x]=1}
  const X0=px*T+T/2,Y0=(fy+1)*T-P.h-.5;for(const id of ARS10.IDS){P.x=X0;P.y=Y0;P.vx=P.vy=0;own[id]=1;wp=id;wcd=0;mobs.length=0;for(let i=0;i<3;i++){const d=MK.golem;mobs.push({k:'golem',x:P.x+80+i*40,y:P.y+P.h-d.h,w:d.w,h:d.h,vx:0,vy:0,hp:1e6,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:true,wall:0,stun:99})}
   mx=mobs[0].x-cam.x;my=mobs[0].y+mobs[0].h/2-cam.y;try{useWeapon()}catch(e){bad.push(id+' '+e.message);continue}const mv=ARS10.SPEC[id].mv;await new Promise(r=>setTimeout(r,mv=='sky'||mv=='vortex'||mv=='orbit'?900:450));
   if(!(mobs.reduce((s,m)=>s+(1e6-m.hp),0)>0))bad.push(id+' '+mv)}mobs.length=0;wp='fist';return bad});
 ok('every weapon deals damage with its move',r.length==0,r.slice(0,10));
 r=await E(()=>({pool:ARS10.pool<=140}));ok('effects stay in their capped pool',r.pool);
 ok('no page errors',errs.length==0,errs.slice(0,5));
 console.log(fails?'FAILURES '+fails:'all arsenal tests passed');await b.close();process.exit(fails?1:0)})();
