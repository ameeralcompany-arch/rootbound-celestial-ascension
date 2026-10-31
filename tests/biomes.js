// Biome worlds (BIOME17): a normal world hides a 3-letter word; under the surface it has one biome per letter in equal 30-depth bands, each
// with its own blocks, monsters and trial (3 beacons that wake monster waves, kills, ore); the biome's letter stays sealed until its trial is
// done, then its warden can be fought; all trials + the Word Gate finish the world with a reward sized to its difficulty. Worlds whose hunt
// had started keep their old word. node tests/biomes.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},150000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/BIOME17|WORD9|GUARD16|DEPTH8/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});
 const E=(f,a)=>p.evaluate(f,a),W8=ms=>p.waitForTimeout(ms);
 const go=async w=>{await E(w=>{enterWorld(w);WX6.force='clear';mobs.length=0},w);await W8(500)};
 await go('biotest');
 // word, biomes, bands
 const A=await E(()=>{const L=BIOME17.lay,ls=WORD9.letters;return{w:WORD9.word,in3:BIOME17.WORDS3.includes(WORD9.word),bi:L.bi.map(b=>b.id),diff:L.diff,
  bands:DEPTH8.BANDS.map(b=>[b.n,b.d0,b.d1]),names:L.bi.map(b=>b.n),
  ls:ls.map(l=>{const d=l.y-sh(l.x);return{i:l.i,d,band:BIOME17.bandOfDepth(d),air:!tiles[(l.y)*W+l.x-1]&&!tiles[(l.y-1)*W+l.x-1]}})}});
 ok('a normal world hides a 3-letter word',A.w.length==3&&A.in3&&A.ls.length==3,A.w);
 ok('it has three different biomes, one per letter, with a difficulty of 1-5 stars',new Set(A.bi).size==3&&A.diff>=1&&A.diff<=5,A.bi.join(',')+' d'+A.diff);
 ok('the biomes split the depths equally: 30 depths each (6-36, 36-66, 66-96+)',A.bands.length==3&&A.bands.every((b,i)=>b[1]==6+30*i&&(i==2?b[2]>=96:b[2]==36+30*i))&&A.bands.every((b,i)=>b[0]==A.names[i]),A.bands);
 ok('each letter waits in a chamber in its own biome',A.ls.every(l=>l.band==l.i&&l.air),A.ls);
 const C=await E(()=>{const L=BIOME17.lay;let top=0,inb=[0,0,0],own=[0,0,0];for(let x=1;x<W-1;x++){const s=sh(x);for(let y=s;y<H-2;y++){const t=tiles[y*W+x],d=y-s,ti=BIOME17.TILE[t];if(!ti)continue;if(d<3)top++;const i=BIOME17.bandOfDepth(d);if(i>=0){inb[i]++;if(ti.b===L.bi[i])own[i]++}}}return{top,inb,own}});
 ok('each band is built from its biome\'s own blocks (and the surface is untouched)',C.top==0&&C.inb.every((n,i)=>n>800&&C.own[i]>=n*.9),C);
 await go('biotest2');const B2=await E(()=>WORD9.word+BIOME17.lay.bi.map(b=>b.id).join());await go('biotest');
 const A2=await E(()=>({w:WORD9.word,bi:BIOME17.lay.bi.map(b=>b.id),k:WORD9.letters.map(l=>l.k)}));
 ok('the layout comes from the world name: same word, biomes and letter spots on every visit',A2.w==A.w&&A2.bi.join()==A.bi.join(),{A2,B2});
 // monsters: the biome's own, stronger deeper
 const M=await E(()=>{const L=BIOME17.lay,res=[];for(let i=0;i<3;i++){let own=0;for(let n=0;n<200;n++){const k=pickMob(8+30*i);if(L.bi[i].mob.some(q=>q[0]==k))own++}res.push(own)}
  BIOME17.refresh();const hp=L.bi.map((b,i)=>MK[b.mob[0][0]].hp/b.mob[0][5]);return{res,hp}});
 ok('monsters in a biome are mostly its own two kinds',M.res.every(n=>n>=130),M.res);
 ok('biome monsters get stronger the deeper the biome',M.hp[1]>M.hp[0]&&M.hp[2]>M.hp[1],M.hp.map(v=>v.toFixed(2)));
 // the letter is sealed until the biome's trial is done; its warden sleeps
 const S1=await E(async()=>{const l=WORD9.letters[0];P.x=(l.x+.5)*T+T*2;P.y=(l.y+1)*T-P.h-2;P.vx=P.vy=0;iT=1e5;await new Promise(r=>setTimeout(r,4600));const col=WORD9.collect(l.i);await new Promise(r=>setTimeout(r,400));
  return{col,sealed:BIOME17.sealed(cur,l.i),wardens:GUARD16.live.length,panel:(document.getElementById('bi17')||{}).textContent||''}});
 ok('a biome\'s letter stays sealed (no warden) while its trial is unfinished',S1.col===false&&S1.sealed&&S1.wardens==0,S1);
 ok('the trial panel shows the biome, its three goals and the way to the nearest beacon',/Biome I of III/.test(S1.panel)&&/Defeat biome monsters/.test(S1.panel)&&/Nearest/.test(S1.panel),S1.panel);
 // beacon: E wakes a wave; beating it lights the beacon; kills count
 const BW=await E(async()=>{const q=BIOME17.beacons.find(q=>q.i==0);P.x=(q.x+.5)*T;P.y=q.y*T-P.h-2;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,200));const k0=BIOME17.prog(0).k;const woke=BIOME17.use();
  await new Promise(r=>setTimeout(r,300));const n1=mobs.filter(m=>m.wv==q.id).length;for(let t=0;t<14;t++){for(const m of mobs.filter(m=>m.wv==q.id&&m.hp>0))hurtMob(m,m.hp+99,WPN.fist,0);await new Promise(r=>setTimeout(r,450));if(BIOME17.beacons.find(x=>x.id==q.id).st=='lit')break}
  const bq=BIOME17.beacons.find(x=>x.id==q.id);return{woke,n1,st:bq.st,want:bq.want,lit:BIOME17.prog(0).lit,k:BIOME17.prog(0).k-k0}});
 ok('pressing E at a beacon wakes a wave of biome monsters; beating the wave lights it',BW.woke&&BW.n1>=2&&BW.st=='lit'&&BW.lit==1,BW);
 ok('the wave\'s monsters count toward the biome\'s monster goal',BW.k>=BW.want,BW);
 // ore: counts, drops its shard; biome rock drops plain stone
 const O=await E(()=>{const b=BIOME17.lay.bi[0];let k=-1,rk=-1;for(let i=0;i<W*H&&(k<0||rk<0);i++){if(tiles[i]==b.ore&&k<0)k=i;if(tiles[i]==b.rock&&rk<0)rk=i}drops.length=0;const o0=BIOME17.prog(0).o;
  for(let n=0;n<40&&tiles[k];n++)breakAt(k%W,k/W|0,99);for(let n=0;n<40&&tiles[rk];n++)breakAt(rk%W,rk/W|0,99);return{o:BIOME17.prog(0).o-o0,shard:drops.some(d=>d.k===b.ore),stone:drops.some(d=>d.k===BIOME17.DROP[b.rock]),plain:BIOME17.DROP[b.rock],odd:drops.some(d=>BIOME17.TILE[d.k]&&!BIOME17.ORE.has(d.k)),name:MAT[b.ore].n}});
 ok('mining biome ore counts for the trial and drops its shard; biome rock drops a plain block',O.o==1&&O.shard&&O.stone&&!O.odd,O);
 // finish the trial for real: light the other beacons, kill, mine
 const F=await E(async()=>{const L=BIOME17.lay,b=L.bi[0];for(const q of BIOME17.beacons.filter(q=>q.i==0&&q.st!='lit')){P.x=(q.x+.5)*T;P.y=q.y*T-P.h-2;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,100));BIOME17.use();
   for(let t=0;t<14;t++){for(const m of mobs.filter(m=>m.wv==q.id&&m.hp>0))hurtMob(m,m.hp+99,WPN.fist,0);await new Promise(r=>setTimeout(r,400));if(BIOME17.beacons.find(x=>x.id==q.id).st=='lit')break}}
  const d=MK[b.mob[0][0]];while(BIOME17.prog(0).k<BIOME17.needK(0)){const m={k:b.mob[0][0],x:P.x+T*3,y:P.y,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:false,wall:0};mobs.push(m);hurtMob(m,m.hp+99,WPN.fist,0)}
  const g0=gems;for(let i=0;i<W*H&&BIOME17.prog(0).o<BIOME17.needO(0);i++)if(tiles[i]==b.ore){for(let n=0;n<40&&tiles[i];n++)breakAt(i%W,i/W|0,99)}
  await new Promise(r=>setTimeout(r,700));const card=[...document.querySelectorAll('#rw8 .rw8c')].some(c=>/Biome trial complete/.test(c.textContent));return{p:BIOME17.prog(0),card,gems:gems-g0,sealed:BIOME17.sealed(cur,0)}});
 ok('lighting 3 beacons, defeating the monsters and mining the ore completes the biome trial (reward card, gems)',F.p.done&&F.card&&F.gems>0,F);
 const S2=await E(async()=>{const l=WORD9.letters[0];P.x=(l.x+.5)*T+T*2;P.y=(l.y+1)*T-P.h-2;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,700));const g=GUARD16.live.find(q=>q.i==l.i);return{sealed:BIOME17.sealed(cur,l.i),warden:!!g}});
 ok('then the seal breaks and the letter\'s warden rises',!S2.sealed&&S2.warden,S2);
 // world conquered: every trial + the Word Gate
 const WC=await E(async()=>{BIOME17.clearAll();for(const l of WORD9.letters)GUARD16.clear(cur,l.i);for(const l of WORD9.letters)WORD9.collect(l.i);await new Promise(r=>setTimeout(r,1500));WORD9.close();const g0=gems,m0=cnt(262);const want=BIOME17.rewardFor(BIOME17.lay.diff,lvl);
  const okw=WORD9.submit(WORD9.word);WORD9.close();await new Promise(r=>setTimeout(r,1600));const card=[...document.querySelectorAll('#rw8 .rw8c')].some(c=>/World conquered/.test(c.textContent));
  return{okw,gems:gems-g0,want:want.gems,mats:cnt(262)-m0,done:BIOME17.rec('biotest').done,card}});
 ok('all three trials and the Word Gate conquer the world: gems sized to its difficulty, XP, depth materials, a card',WC.okw&&WC.done&&WC.gems>=WC.want&&WC.mats>=3&&WC.card,WC);
 const WC2=await E(async()=>{const g0=gems;await new Promise(r=>setTimeout(r,1300));return gems-g0});ok('the world reward is paid once',WC2<50,WC2);
 // a world whose hunt had already started keeps its word and letters (not sealed)
 const OLD=await E(async()=>{WORD9.state.w.biooldw={got:[0],ok:0,tr:0};enterWorld('biooldw');mobs.length=0;await new Promise(r=>setTimeout(r,400));const l=WORD9.letters.find(q=>q.i!=0);return{w:WORD9.word,inList:WORD9.WORDS.includes(WORD9.word),n:WORD9.letters.length,biomes:BIOME17.on,sealed:BIOME17.sealed(cur,l.i)}});
 ok('a world whose letter hunt had started keeps its old word (biomes still there, letters not sealed)',OLD.inList&&OLD.n==OLD.w.length&&OLD.biomes&&!OLD.sealed,OLD);
 // tools: Geode Rock breaks only with the Rock Tapper; the Ore Pick refuses everything that isn't an ore
 const TL=await E(()=>{mobs.length=0;P.vx=P.vy=0;const tx=Math.floor(P.x/T)+1,ty=Math.floor((P.y+P.h/2)/T),k=ty*W+tx;
  const hit=(id,b,n)=>{tiles[k]=b;hp[k]=BLK[b][2];trees.delete(k);mx=tx*T+T/2-cam.x;my=ty*T+T/2-cam.y;own[id]=1;wp=id;for(let i=0;i<n;i++){wcd=0;useWeapon()}const r={left:tiles[k]==b,hurt:tiles[k]==b&&hp[k]<BLK[b][2]};tiles[k]=0;hp[k]=0;return r};
  return{cat:[TOOLS8.catOf(219),TOOLS8.catOf(221),TOOLS8.catOf(220),TOOLS8.catOf(210)],
   gOre:hit('glimmer',219,6),pip:hit('pip',219,6),axe:hit('twiggy',219,6),peb:hit('pebble',219,1),
   gStone:hit('glimmer',3,6),gDirt:hit('glimmer',1,6),gMoss:hit('glimmer',210,6),gPrism:hit('glimmer',221,1),gIron:hit('glimmer',9,1),pipStone:hit('pip',3,1)}});
 ok('Geode Rock counts as stone, biome ores and crystals as ores',TL.cat.join()=='stone,ore,ore,stone',TL.cat);
 ok('Geode Rock: Ore Pick, Shovel and Axe do nothing; the Rock Tapper breaks it',TL.gOre.left&&!TL.gOre.hurt&&TL.pip.left&&!TL.pip.hurt&&TL.axe.left&&!TL.axe.hurt&&!TL.peb.left,TL);
 ok('the Ore Pick leaves stone, dirt and biome rock alone but still mines ores',TL.gStone.left&&!TL.gStone.hurt&&TL.gDirt.left&&!TL.gDirt.hurt&&TL.gMoss.left&&!TL.gMoss.hurt&&!TL.gPrism.left&&!TL.gIron.left,TL);
 ok('other tools still chip at blocks outside their job (Shovel on stone)',TL.pipStone.hurt||!TL.pipStone.left,TL.pipStone);
 // no biomes in the Plaza or an Inferno; depth zones go back to normal there
 await go('plaza');const PZ=await E(()=>({on:BIOME17.on,b:DEPTH8.BANDS.map(b=>b.n).join()}));
 ok('no biomes in the Plaza (depth zones back to their usual names)',!PZ.on&&/Glowroot/.test(PZ.b),PZ);
 ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?fails+' biome test(s) FAILED':'all biome tests passed');process.exit(fails?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
