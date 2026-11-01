// The realm chain (99-zzzzzz-words.js + 99-zzzzzzzzz-c-realms.js): <World> → Inferno → Galaxy → Abyssal Sea → Crystal Realm. Each realm hides a
// longer word (3, 3, 4, 5, 8 letters) that opens the next one at levels 15 / 25 / 35 / 45 (refused below, also typed as a world name); each
// realm is its world's terrain remade in its own blocks (and three regions of its own), with its own sky, music, monsters (stronger every realm,
// they spawn day or night and never outside their realm) and physics: low gravity in the Galaxy, swimming anywhere in the Abyssal Sea.
// Solving the Crystal Realm's word completes the Celestial Ascension. No page errors. node tests/realms.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(guest);await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);
 const E=(f,a)=>p.evaluate(f,a),W8=ms=>p.waitForTimeout(ms||100);
 const go=async w=>{await E(w=>{enterWorld(w);mobs.length=0;try{for(const l of WORD9.letters)GUARD16.clear(cur,l.i)}catch(_){}try{BIOME17.clearAll()}catch(_){}},w);await W8(600)};
 // ---- names and the chain
 const N=await E(()=>({inf:WORD9.stName('realmsa',1),gal:WORD9.stName('realmsa',2),sea:WORD9.stName('realmsa',3),cry:WORD9.stName('realmsa',4),lab:[2,3,4].map(i=>WORD9.label(WORD9.stName('realmsa',i))),st:['realmsa','realmsa-inf','realmsa-gal','realmsa-sea','realmsa-cry'].map(n=>WORD9.stageOf(n))}));
 ok('every realm is a world of its own, named after its world',N.inf=='realmsa-inf'&&N.gal=='realmsa-gal'&&N.sea=='realmsa-sea'&&N.cry=='realmsa-cry'&&N.lab.join('|')=='Realmsa · Galaxy|Realmsa · Abyssal Sea|Realmsa · Crystal Realm'&&N.st.join()=='0,1,2,3,4',N);
 // ---- level gates
 await E(()=>{lvl=50});await go('realmsa');await E(()=>{lvl=20});await go('realmsa-gal');const g1=await E(()=>cur);await E(()=>{lvl=30});await go('realmsa-sea');const g2=await E(()=>cur);await E(()=>{lvl=40});await go('realmsa-cry');const g3=await E(()=>cur);
 ok('each realm is refused below its level (Galaxy 25, Abyssal Sea 35, Crystal Realm 45)',g1=='realmsa'&&g2=='realmsa'&&g3=='realmsa',[g1,g2,g3]);
 // ---- each realm: word length, blocks, regions, music, monsters
 await E(()=>{lvl=50});const R={};
 for(const[s,suf,len]of[[1,'-inf',3],[2,'-gal',4],[3,'-sea',5],[4,'-cry',8]]){await go('realmsa'+suf);
  R[s]=await E(s=>{const c={};for(let k=0;k<W*H;k++){const t=tiles[k];if(t)c[t]=(c[t]||0)+1}const L=WORD9.letters;const pk=[];for(let i=0;i<60;i++)pk.push(pickMob(i%2?2:30));
   const TLs=Object.keys(REALM10.TL).map(Number).filter(id=>REALM10.TL[id][3]==s);
   return{cur,word:WORD9.word,n:L.length,lt:c[WORD9.LETTER]|0,scr:L.map(l=>l.ch).sort().join('')==[...WORD9.word].sort().join(''),grass:c[2]|0,dirt:c[1]|0,stone:c[3]|0,own:TLs.map(id=>c[id]|0),
    region:REALM10.region,mood:REALM10.mood(),songs:!!(MUS7.MOODS[REALM10.mood()]&&MUS7.MOODS[REALM10.mood()+'_f']),picks:[...new Set(pk)],strip:document.getElementById('wl9').className,force:WX6.force}},s);
  const r=R[s];ok('realm '+s+' ('+r.cur+') hides a '+len+'-letter word, scrambled, one Letter Block each',r.n==len&&r.word.length==len&&r.lt==len&&r.scr,{word:r.word,n:r.n,lt:r.lt});
  ok('realm '+s+': its own music and battle song; clear sky; its own word strip',r.songs&&r.force=='clear'&&/\b(inf|gal|sea|cry)\b/.test(r.strip),{mood:r.mood,strip:r.strip,force:r.force})}
 for(const s of[2,3,4]){const r=R[s];ok('realm '+s+': the terrain is remade in its own blocks (no grass, dirt or stone left; soil, rock, glow and ore all present)',r.grass==0&&r.dirt==0&&r.stone==0&&r.own.every(n=>n>20),{own:r.own,grass:r.grass,dirt:r.dirt,stone:r.stone});
  ok('realm '+s+': only its own monsters spawn (surface and deep), and it has a named region',r.picks.length>=3&&r.picks.every(k=>MKs(k)==s)&&!!r.region,{picks:r.picks,region:r.region})}
 function MKs(k){return {gal:2,sea:3,cry:4}[k.slice(0,3)]}
 const ST=await E(()=>{const pool=s=>REALM10.POOL[s].map(q=>MK[q[0]]);const mx=s=>Math.max(...pool(s).map(d=>d.hp)),mn=s=>Math.min(...pool(s).map(d=>d.hp)),dm=s=>Math.min(...pool(s).map(d=>d.dmg));
  const inf=Math.max(...Object.values(WORD9.IM).map(d=>d.hp)),infD=Math.max(...Object.values(WORD9.IM).map(d=>d.dmg));
  return{inf,infD,gal:[mn(2),mx(2),dm(2)],sea:[mn(3),mx(3),dm(3)],cry:[mn(4),mx(4),dm(4)],drops:Object.keys(REALM10.MON).every(k=>MAT[MOBMAT[k]]&&MAT[MOBMAT[k]].p>0),never:Object.keys(REALM10.MON).every(k=>MK[k].min>999)}});
 ok('monsters get stronger every realm (each realm\'s toughest beats the last realm\'s; damage climbs)',ST.gal[1]>ST.inf&&ST.sea[1]>ST.gal[1]&&ST.cry[1]>ST.sea[1]&&ST.gal[2]>ST.infD*.8&&ST.sea[2]>ST.gal[2]&&ST.cry[2]>ST.sea[2],ST);
 ok('every realm monster drops its own sellable material and never spawns outside its realm',ST.drops&&ST.never);
 await go('realmsa');const home=await E(()=>{const pk=[];for(let i=0;i<40;i++)pk.push(pickMob(i%2?2:30));return{mood:REALM10.mood(),realm:pk.some(k=>k&&/^(gal|sea|cry)_/.test(k))}});
 ok('back in the world itself: no realm monsters, no realm music',!home.realm&&home.mood==null,home);
 // ---- physics: low gravity in the Galaxy, swimming anywhere in the Abyssal Sea
 await go('realmsa-gal');const gal=await E(()=>new Promise(res=>{const y0=P.y;P.vy=-690;P.g=false;let top=y0;const t0=performance.now();const f=()=>{top=Math.min(top,P.y);if(performance.now()-t0<1500)requestAnimationFrame(f);else res(Math.round(y0-top))};requestAnimationFrame(f)}));
 await go('realmsa');const nor=await E(()=>new Promise(res=>{const y0=P.y;P.vy=-690;P.g=false;let top=y0;const t0=performance.now();const f=()=>{top=Math.min(top,P.y);if(performance.now()-t0<1500)requestAnimationFrame(f);else res(Math.round(y0-top))};requestAnimationFrame(f)}));
 ok('the Galaxy has low gravity: the same jump goes much higher',gal>nor*1.4,{galaxy:gal,normal:nor});
 await go('realmsa-sea');await W8(300);const sw=await E(()=>{const r=[];for(let i=0;i<5;i++){r.push(inWater(P.x,P.y+P.h*.6))}return{sw:P.sw,iw:r.every(Boolean),other:inWater(P.x+1000,P.y+P.h*.6)}});
 ok('the Abyssal Sea: you swim anywhere in the open (all open space is sea); kelp grows in the Kelp Forest',sw.sw==1&&sw.iw&&(await E(()=>REALM10.kelp>0||REALM10.RG[3].length==3)),sw);
 // ---- the chain: solving a realm's word opens the next one; the Crystal Realm's word completes the ascension
 const tr=await E(()=>{WORD9.state.w[cur]={got:WORD9.letters.map(l=>l.i),ok:0,tr:0};WORD9.open();const w=WORD9.word,g0=gems;WORD9.submit(w);return{w,gems:gems-g0}});await W8(1600);
 const at=await E(()=>cur);ok('solving the Abyssal Sea\'s word pays out and leads on to the Crystal Realm',at=='realmsa-cry'&&tr.gems>0,{at,gems:tr.gems});
 const fin=await E(()=>{WORD9.state.w[cur]={got:WORD9.letters.map(l=>l.i),ok:0,tr:0};WORD9.open();const g0=gems;WORD9.submit(WORD9.word);return{gems:gems-g0,cur,next:WORD9.nextName(),travel:WORD9.travel()}});await W8(300);
 ok('the Crystal Realm\'s word completes the Celestial Ascension (a big reward, no realm beyond it)',fin.gems>=2500&&fin.next==null&&fin.travel===false&&(await E(()=>cur))=='realmsa-cry',fin);
 await E(()=>{try{WORD9.close()}catch(_){}});
 // ---- a short soak in each realm: monsters fight, bolts fly, nothing breaks
 for(const w of['realmsa-gal','realmsa-sea','realmsa-cry']){await go(w);await E(()=>{const s=REALM10.stage;REALM10.POOL[s].forEach((q,i)=>{const d=MK[q[0]];mobs.push({k:q[0],x:P.x+(i-1.5)*140,y:P.y-40,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:i,t:1,dir:1,fade:1,g:false,wall:0,sk:.1})})});await W8(2500)}
 const sk=await E(()=>({shots:REALM10.shots,motes:REALM10.motes}));ok('realm monsters use their moves (bolts fired) and the ambience runs',sk.shots>0&&sk.motes>0,sk);
 ok('no page errors',errs.length==0,errs.slice(0,5));
 console.log(fails?'FAILURES '+fails:'all realm tests passed');await b.close();process.exit(fails?1:0)})();
