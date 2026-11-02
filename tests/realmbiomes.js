// Every realm works like the first world, with its own number of letters: one biome per letter (Inferno 3, Galaxy 4, Abyssal Sea 5, Crystal Realm 8), each with its
// own rock, ore, monsters, beacons and trial; the letter sits sealed in its chamber until the trial is done, then a Letter Warden guards it. FPS stays up, also after
// the Inferno (lava's texture lives on the graphics card). node tests/realmbiomes.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},280000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::|AudioContext/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(900);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(400);await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=60;WBOSS13.need=()=>false});
 const E=(f,a)=>p.evaluate(f,a),W8=ms=>p.waitForTimeout(ms);const fps=ms=>E(async ms=>{let n=0;const t0=performance.now();while(performance.now()-t0<ms){iT=999;P.hp=maxHP();await new Promise(r=>requestAnimationFrame(r));n++}return Math.round(n/(ms/1000))},ms);
 const seen={rock:new Set(),names:new Set()};
 for(const[s,len,lab]of[[0,3,'World'],[1,3,'Inferno'],[2,4,'Galaxy'],[3,5,'Abyssal Sea'],[4,8,'Crystal Realm']]){
  const w=await E(s=>WORD9.stName('rbiome',s),s);await E(w=>{enterWorld(w);mobs.length=0},w);await W8(2800);
  const r=await E(()=>{const lay=BIOME17.lay,bi=lay.bi,L=WORD9.letters,c={};for(let k=0;k<W*H;k++){const t=tiles[k];if(t)c[t]=(c[t]||0)+1}
   return{on:BIOME17.on,n:bi.length,word:WORD9.word,letters:L.length,lt:c[18]|0,names:bi.map(b=>b.n),band:lay.band,rocks:bi.map(b=>c[b.rock]|0),ores:bi.map(b=>c[b.ore]|0),oreIds:bi.map(b=>b.ore),beacons:BIOME17.beacons.length,perB:bi.map((_,i)=>BIOME17.beacons.filter(q=>q.i==i).length),chambers:BIOME17.chambers.length,
    depths:L.map(l=>BIOME17.bandOfDepth(l.y-sh(l.x))),sealed:L.map(l=>BIOME17.sealed(cur,l.i)),wet:BIOME17.beacons.filter(q=>{for(let y=q.y-3;y<q.y;y++)if(wl[y*W+q.x]||tiles[y*W+q.x])return true;return false}).map(q=>q.id+' wl'+wl[(q.y-1)*W+q.x]+' t'+tiles[(q.y-1)*W+q.x]+','+tiles[(q.y-3)*W+q.x]),wetL:L.filter(l=>wl[l.k]).length}});
  ok(lab+': '+len+' letters and '+len+' biomes, one per letter',r.on&&r.n==len&&r.word.length==len&&r.letters==len&&r.lt==len,{word:r.word,n:r.n,letters:r.letters,lt:r.lt,names:r.names});
  ok(lab+': each biome has its rock and enough ore to finish the trial',r.rocks.every(v=>v>200)&&r.ores.every((v,i)=>v>=10)&&new Set(r.oreIds).size==len,{rocks:r.rocks,ores:r.ores});
  const blocked=s==3||s==0?r.wet.filter(x=>!/ t0,0$/.test(x)):r.wet;/* water is harmless under the sea and in a first world (whose layout must not change); a block never is, and lava in the Inferno would burn */ok(lab+': 3 beacons in every biome, in clear chambers (no lava, no blocks)',r.perB.every(v=>v==3)&&blocked.length==0,{perB:r.perB,wet:r.wet});
  ok(lab+': each letter lies in its own biome, sealed',r.chambers==len&&r.depths.every((d,i)=>d>=0)&&new Set(r.depths).size>=len-1&&r.sealed.every(Boolean)&&r.wetL==0,{depths:r.depths,sealed:r.sealed,band:r.band});
  if(s){const dupe=r.names.filter(n=>seen.names.has(n));ok(lab+': its biomes are its own, not shared with another realm',dupe.length==0,dupe);r.names.forEach(n=>seen.names.add(n))}
  // monsters and a full trial + warden on the deepest biome
  const t=await E(()=>{const lay=BIOME17.lay,last=lay.bi.length-1,mk=[];for(let i=0;i<80;i++)mk.push(pickMob(BIOME17.TOP+last*lay.band+2));const own=lay.bi[last].mob.map(q=>q[0]),hit=mk.filter(k=>own.includes(k)).length;const l=WORD9.letters.find(q=>q.i==last);const lockd=!WORD9.collect(l.i);BIOME17.finish(last);const free=!BIOME17.sealed(cur,last);const warden=GUARD16.blocks(cur,l);return{hit,lockd,free,warden,own,need:[BIOME17.needK(0),BIOME17.needK(last),BIOME17.needO(last)],hp:MK[own[0]].hp}});
  ok(lab+': the deepest biome spawns its own monsters; its letter opens only after the trial, then a warden guards it',t.hit>=50&&t.lockd&&t.free&&t.warden,t);
  ok(lab+': trials stay the same size overall, however many biomes',t.need[0]==12&&t.need[1]==20&&t.need[2]==10,t.need);
  const a=await E(()=>{const lay=BIOME17.lay,out=[];for(const b of lay.bi)for(const q of b.mob){const d=MK[q[0]];const m={k:q[0],x:P.x+80,y:P.y,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:1,t:1,dir:1,fade:1,g:true,wall:0};try{drawMob(m,performance.now())}catch(e){out.push(q[0]+': '+e.message)}}return out});ok(lab+': every biome monster draws',a.length==0,a);
  const f=await fps(2500);ok(lab+': frame rate holds',f>=80,f);await p.screenshot({path:path.join(process.env.WB_SHOTS||require('os').tmpdir(),'rb-'+s+'.png')})}
 // walking down through the biomes: the panel names each one
 const w=await E(()=>WORD9.stName('rbiome',2));await E(w=>enterWorld(w),w);await W8(6500);const names=await E(async()=>{const out=[],lay=BIOME17.lay;for(let i=0;i<lay.bi.length;i++){const q=BIOME17.beacons.find(b=>b.i==i);P.x=(q.x+.5)*T;P.y=q.y*T-P.h-2;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,700));out.push((document.getElementById('bi17')||{}).textContent||'')}return{out,want:lay.bi.map(b=>b.n)}});ok('the Galaxy panel names each biome as you go down',names.want.every((n,i)=>names.out[i].includes(n)),names);
 // the fix for the FPS collapse: the lava texture is a graphics-card canvas, and frame rate survives a stay in the Inferno
 const w1=await E(()=>WORD9.stName('rbiome',1));await E(w=>{enterWorld(w);mobs.length=0},w1);await W8(2500);const f1=await fps(4000);await W8(5000);const f2=await fps(4000);await E(()=>{enterWorld('rbiome');mobs.length=0});await W8(2500);const f3=await fps(4000);ok('the Inferno keeps its frame rate, and the world is fine after it',f1>=80&&f2>=80&&f3>=80,{f1,f2,f3});
 const pat=await E(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillRect(0,0,9,9);const cp=g.createPattern(c,'repeat');return{cpu:!!c._rbCpu,ok:!!cp}});ok('patterns from small canvases are made on the graphics card',pat.cpu&&pat.ok,pat);
 ok('no page errors',errs.length==0,errs.slice(0,5));
 console.log(fails?'FAILURES '+fails:'all realm biome tests passed');await b.close();process.exit(fails?1:0)})();
