// Depth bands + underground activities (DEPTH8) and the reward feedback (REW8): every band is detected and shows its indicator, every
// activity can be completed and pays out, reward effects fire and clean up, reduced motion drops the heavy effects, existing world saves
// (including old 100-wide ones and saves with builds where a room would go) still load untouched. node tests/depths.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&/DEPTH8|REW8/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 // an old 100-wide save (no W key) and a save with a build where the first glowcap grove of 'savedbuild' would be carved
 await p.addInitScript(()=>{if(!localStorage.getItem('rbw_oldwide'))localStorage.setItem('rbw_oldwide',JSON.stringify({'205':[7,0,0,0],'206':[7,0,0,0]}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=8});await p.waitForTimeout(400);
 const E=(f,a)=>p.evaluate(f,a);
 await E(()=>{enterWorld('depthtest');WX6.force='clear';clock=()=>.3;window.TP=(k,dx)=>{const r=DEPTH8.find(k);for(let i=mobs.length-1;i>=0;i--)if(!mobs[i].vg)mobs.splice(i,1);P.x=(r.x+.5)*T+T*(dx==null?2.5:dx);P.y=r.fy*T-P.h-1;P.vx=P.vy=0;iT=1e4;cam.x=P.x-cv.width/ZM/2;cam.y=P.y-cv.height/ZM/2;return r.id};
  window.CARDS=()=>[...document.querySelectorAll('#rw8 .rw8c:not(.out)')].map(c=>({k:c.dataset.kind,r:c.dataset.rar,t:c.textContent}))});
 await sleep(900);
 // ---- generation + blocks
 const gen=await E(()=>{const S=DEPTH8.sites(),kinds=[...new Set(S.map(r=>r.k))];const s93=spr(93,1,1),s94=spr(94,1,1);const px=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n};
  return{kinds,n:S.length,ca:DEPTH8.caches().filter(k=>tiles[k]==93).length,ge:DEPTH8.geodes().filter(k=>tiles[k]==94).length,spr:px(s93)>1000&&px(s94)>1000,names:[BLK[93][0],BLK[94][0]],tile7:TILE7.on,glow:!!GLOW7[94],cat:TOOLS8.catOf(94)+'/'+TOOLS8.catOf(93),valid:validEdit({k:5,a:[94,0,0,0]}),ok:DEPTH8.wr().ok.length}});
 ok('world generation places every site kind (groves, resonance shrines, ancient shrines, relic vaults)',['grove','reso','shrine','vault'].every(k=>gen.kinds.includes(k)),gen);
 ok('Buried Caches (93) and Crystal Geodes (94) are placed and render through the block sprite path',gen.ca>=6&&gen.ge>=8&&gen.spr&&gen.tile7&&gen.glow&&gen.valid,gen);
 ok('tool categories: geodes are ore (Glimmer), caches are soft (Pip)',gen.cat=='ore/soft',gen.cat);
 // ---- bands + indicator
 for(const[k,id,nm]of[['grove','hollow','Glowroot Hollows'],['reso','crystal','Crystal Caverns'],['shrine','magma','Emberdeep']]){await E(k=>TP(k),k);await sleep(450);
  const r=await E(()=>{const e=document.getElementById('dz8');return{band:DEPTH8.band,on:!!e&&e.classList.contains('on'),txt:e&&e.textContent,depth:Math.round(DEPTH8.depth)}});
  ok('band '+id+' is detected and its indicator shows name + depth',r.band==id&&r.on&&r.txt.includes(nm)&&/\d+ m deep/.test(r.txt),r)}
 const zone=await E(()=>({z:DEPTH8.db.zone,cards:CARDS().filter(c=>c.k=='zone').length}));ok('first visit to each zone is rewarded once',zone.z.hollow&&zone.z.crystal&&zone.z.magma,zone);
 const rec=await E(()=>({best:DEPTH8.db.best,ms:DEPTH8.db.ms}));ok('depth record and its milestones are tracked',rec.best>=46&&rec.ms[15]&&rec.ms[30]&&rec.ms[45],rec);
 await E(()=>{P.x=DX*T+T/2;P.y=sh(DX)*T-P.h-2;cam.y=P.y-cv.height/ZM/2});await sleep(500);
 ok('back on the surface the indicator hides',await E(()=>DEPTH8.band==null&&!document.getElementById('dz8').classList.contains('on')));
 // ---- glowcap grove: catch every spore
 const gv=await E(async()=>{const id=TP('grove'),r=DEPTH8.find('grove'),g0=gems,s0=cnt(260);for(let j=0;j<r.caps.length;j++){const s=DEPTH8.spore(r,j,performance.now()/1000);P.x=s.x;P.y=s.y-30;P.vx=P.vy=0;await new Promise(q=>setTimeout(q,90))}
  await new Promise(q=>setTimeout(q,200));const w=DEPTH8.wr();return{got:w.gd[id]==1,regrow:(w.g[id]||0)>Date.now(),gems:gems-g0,spore:cnt(260)-s0,card:CARDS().some(c=>c.k=='grove')}});
 ok('glowcap grove: catching all spores harvests it (gems, XP, Glowspores, regrow timer, reward card)',gv.got&&gv.regrow&&gv.gems>=25&&gv.spore>=2&&gv.card,gv);
 // ---- buried cache
 const cv1=await E(async()=>{const k=DEPTH8.caches().find(k=>tiles[k]==93),x=k%W,y=k/W|0,g0=gems;P.x=x*T-T;P.y=y*T-P.h;iT=1e4;wp='pip';const r=breakAt(x,y,255);await new Promise(q=>setTimeout(q,60));return{r,gone:!tiles[k],found:DEPTH8.wr().cb.includes(k),gems:gems-g0,blockDrop:drops.some(d=>d.k===93),card:CARDS().some(c=>c.k=='cache')}});
 ok('buried cache: digging it out pays gems + loot once (no cache block drop)',cv1.r&&cv1.gone&&cv1.found&&cv1.gems>=30&&!cv1.blockDrop&&cv1.card,cv1);
 // ---- crystal geode: three cracks with a good tool, rarity reveal
 const ge=await E(async()=>{const k=DEPTH8.geodes().find(k=>tiles[k]==94),x=k%W,y=k/W|0,g0=gems,inv0=[262,263,264,265,266,267].map(cnt);P.x=x*T-T;P.y=y*T-P.h;const a=breakAt(x,y,255),t1=tiles[k],h1=hp[k];breakAt(x,y,255);const t2=tiles[k];breakAt(x,y,255);
  await new Promise(q=>setTimeout(q,60));const inv1=[262,263,264,265,266,267].map(cnt);return{a,t1,h1,t2,gone:!tiles[k],found:DEPTH8.wr().gb.includes(k),gems:gems-g0,item:inv1.some((v,i)=>v>inv0[i]),card:CARDS().find(c=>c.k=='reveal'&&/Geode cracked/.test(c.t))}});
 ok('crystal geode: first cracks keep it (hp drops), the third cracks it open',ge.a&&ge.t1==94&&ge.h1<14&&ge.t2==94&&ge.gone,ge);
 ok('crystal geode: pays gems + a rarity-rolled gem with a rarity reveal card',ge.found&&ge.gems>=8&&ge.item&&!!ge.card&&!!ge.card.r,ge.card);
 const pg=await E(()=>{const x=Math.floor(P.x/T)+2,y=Math.floor(P.y/T),k=y*W+x;tiles[k]=0;setTile(x,y,94);const n=DEPTH8.wr().gb.length,g0=gems;for(let i=0;i<20;i++)breakAt(x,y,255);return{gone:!tiles[k],same:DEPTH8.wr().gb.length==n,gems:gems-g0}});
 ok('a placed geode is a plain block (no reward farming)',pg.gone&&pg.same&&pg.gems==0,pg);
 // ---- resonance shrine: listen, a wrong note fails, the right melody solves
 await E(()=>TP('reso',0));await E(()=>interact());const st0=await E(()=>DEPTH8.find('reso').st);
 for(let i=0;i<80&&await E(()=>DEPTH8.find('reso').st)!='input';i++)await sleep(100);
 const wrong=await E(()=>{const r=DEPTH8.find('reso'),j=(r.seq[0]+1)%4;DEPTH8.hit(r,j);return r.st});
 ok('resonance: E starts the melody, a wrong crystal breaks the song',st0=='show'&&wrong=='fail',{st0,wrong});
 await sleep(1600);await E(()=>DEPTH8.listen(DEPTH8.find('reso')));for(let i=0;i<80&&await E(()=>DEPTH8.find('reso').st)!='input';i++)await sleep(100);
 // the first note by striking the crystal with a weapon (mouse over it), the rest by hit()
 const strike=await E(()=>{const r=DEPTH8.find('reso'),j=r.seq[0],px=DEPTH8.pillX(r,j);P.x=px-T*1.2;P.y=r.fy*T-P.h-1;wp='fist';wcd=0;mx=px-cam.x;my=r.fy*T-T-cam.y;useWeapon();return r.step});
 const rs=await E(async()=>{const r=DEPTH8.find('reso'),s0=cnt(268),g0=gems;for(let i=r.step;i<r.seq.length;i++)DEPTH8.hit(r,r.seq[i]);await new Promise(q=>setTimeout(q,900));return{solved:!!DEPTH8.wr().p[r.id],shard:cnt(268)-s0,gems:gems-g0,st:r.st,card:CARDS().some(c=>c.k=='reso')}});
 ok('resonance: striking a crystal with a weapon counts as a note',strike==1,strike);
 ok('resonance: repeating the melody solves it (gems, Resonant Shard, card)',rs.solved&&rs.shard==1&&rs.gems>=80&&rs.card,rs);
 // ---- ancient shrine blessing
 const sh1=await E(()=>{TP('shrine',0);const d0=bonus();interact();const d1=bonus(),bf=DEPTH8.db.buff;const B=bf&&DEPTH8.BUFFS[bf.k];const k=B&&Object.keys(B.fx)[0];return{bf:!!bf,up:!!k&&d1[k]>d0[k],card:CARDS().some(c=>c.k=='shrine'),cd:(DEPTH8.wr().s[DEPTH8.find('shrine').id]||0)>Date.now()}});
 const sh2=await E(()=>{const e0=DEPTH8.db.buff.end;interact();return DEPTH8.db.buff.end==e0&&/gathering embers/i.test(msg)});
 ok('ancient shrine: E grants a timed blessing that raises your stats',sh1.bf&&sh1.up&&sh1.card&&sh1.cd,sh1);ok('ancient shrine: it then recharges (no stacking)',sh2);
 // ---- relic vault: guardians, unseal, open
 await E(()=>TP('vault',-2));await sleep(500);
 const v1=await E(()=>{const r=DEPTH8.find('vault');return{gs:r.gs.length,elite:r.gs.every(m=>m.elite&&mobs.includes(m)&&m.hp>MK[m.k].hp)}});
 ok('relic vault: approaching wakes 3 tougher guardians',v1.gs==3&&v1.elite,v1);
 const v2=await E(()=>{TP('vault',0);interact();return/sealed/i.test(msg)&&!DEPTH8.wr().v[DEPTH8.find('vault').id]});ok('relic vault: the chest stays sealed while guardians live',v2);
 await E(()=>{const r=DEPTH8.find('vault');for(const m of r.gs.slice())hurtMob(m,1e7,WPN[wp],0)});await sleep(400);
 const v3=await E(()=>{const r=DEPTH8.find('vault'),g0=gems,e0=cnt(269);TP('vault',0);interact();return{killed:r.killed,open:!!DEPTH8.wr().v[r.id],relic:cnt(269)-e0,gems:gems-g0,card:CARDS().find(c=>c.k=='reveal'&&/Relic vault/.test(c.t))}});
 ok('relic vault: beating the guardians unseals it and E opens a legendary relic',v3.killed==3&&v3.open&&v3.relic==1&&v3.gems>=180&&v3.card&&v3.card.r=='legendary',v3);
 const cnts=await E(()=>DEPTH8.BANDS.map(b=>DEPTH8.counts(b)).map(c=>c.f+'/'+c.n));ok('discoveries are tracked per band',cnts.every(s=>+s.split('/')[0]>=1),cnts);
 const persisted=await E(()=>{const j=JSON.parse(localStorage.getItem((typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbdepth')||'{}');const w=j.w&&j.w.depthtest;return !!w&&w.cb.length>=1&&w.gb.length>=1&&Object.keys(w.p).length>=1&&Object.keys(w.v).length>=1});ok('progress is saved',persisted);
 // ---- reward effects: fire and clean up
 await E(()=>{P.x=DX*T+T/2+T*6;P.y=sh(DX+6)*T-P.h-2;P.vx=P.vy=0;cam.x=P.x-cv.width/ZM/2;cam.y=P.y-cv.height/ZM/2;mobs.length=0;document.querySelectorAll('#rw8 .rw8c').forEach(e=>e.remove())});await sleep(4500);
 const base=await E(()=>({v:VFX.count,p:parts.length}));
 const lv=await E(async()=>{const l0=lvl;xp=xpNeed(lvl)+1;xpGain('mine',1);await new Promise(q=>setTimeout(q,350));const e=document.getElementById('rw8lv'),bn=document.getElementById('banner');
  return{up:lvl==l0+1,card:!!e&&e.classList.contains('on')&&e.textContent.includes(String(lvl)),fx:REW8.fx,v:VFX.count,banner:bn.classList.contains('on')&&/^LEVEL \d+$/.test(bn.firstChild.textContent)}});
 ok('level up: light pillar + rays + confetti + rolling level card, the plain banner is replaced',lv.up&&lv.card&&lv.fx>=1&&lv.v>base.v+20&&!lv.banner,{lv,base});
 const qz=await E(async()=>{done.harvest=0;const g0=gems;G('harvest');const fl=REW8.flights,shown0=+document.getElementById('gv').textContent;await new Promise(q=>setTimeout(q,1500));return{card:CARDS().some(c=>c.k=='quest'&&/Harvest a tree/.test(c.t)),fl,shown0,g:gems-g0,shown:+document.getElementById('gv').textContent,gems,pend:REW8.pend}});
 ok('quest complete: reward card + gems fly into the HUD counter, which then matches the wallet',qz.card&&qz.fl>0&&qz.shown0<qz.gems&&qz.shown==qz.gems&&qz.pend==0,qz);
 const ac=await E(()=>{delete achD[0];stats.break=Math.max(60,stats.break|0);checkAch();return CARDS().some(c=>c.k=='ach'&&/Pebble Pecker/.test(c.t))});ok('achievement unlocked: reward card',ac);
 const my=await E(async()=>{const c=REW8.reveal(267,1,P.x,P.y-20,{kick:'Test',showTier:true,gems:10});await new Promise(q=>setTimeout(q,120));const f=document.getElementById('rw8f');return{rar:c.dataset.rar,flash:!!f&&f.getAnimations().length>0,fx:REW8.fx}});
 ok('mythic reveal: rarity-coloured card, pillar and a screen flash',my.rar=='mythic'&&my.flash&&my.fx>=1,my);
 const rc=await E(()=>{UI6.say6('Rare catch!','Golden Carp',2200);const bn=document.getElementById('banner');return{card:CARDS().some(c=>c.k=='reveal'&&/Golden Carp/.test(c.t)),banner:bn.classList.contains('on')&&/Rare catch/.test(bn.textContent)}});
 ok('rare catch: reveal card instead of the banner',rc.card&&!rc.banner,rc);
 const dr=await E(async()=>{spawnDrop(P.x,P.y-10,265,1);for(const d of drops)if(d.k===265)d.t=1;await new Promise(q=>setTimeout(q,900));return CARDS().some(c=>c.k=='reveal'&&/drop/i.test(c.t)&&/Starheart/.test(c.t))});ok('epic+ drop picked up: reveal card',dr);
 const ch=await E(async()=>{const c=CHEST7.list().find(c=>!(CHEST7.opened()[cur]||[]).includes(c.i));if(!c)return'none';P.x=(c.tx+.5)*T;P.y=(c.ty+1)*T-P.h-1;P.vx=P.vy=0;iT=1e4;await new Promise(q=>setTimeout(q,120));interact();return CARDS().some(x=>x.k=='chest')});
 ok('treasure chest opened: reward card + celebration',ch===true,ch);
 const bw=await E(()=>{CINE7.bossWin({x:P.x,y:P.y,h:50},{n:'Test Boss',gems:300,xp:100,c:'#ffd24a'},false);const c=document.querySelector('#cine7b.win');return{card:!!c&&/gems/.test(c.textContent),fx:REW8.fx,fl:REW8.flights}});ok('boss reward: celebration + gems flying on top of the victory card',bw.card&&bw.fx>=1&&bw.fl>0,bw);
 await E(()=>{P.x=DX*T+T/2+T*6;P.y=sh(DX+6)*T-P.h-2;P.vx=P.vy=0;cam.x=P.x-cv.width/ZM/2;cam.y=P.y-cv.height/ZM/2});await sleep(6500);
 const clean=await E(()=>({v:VFX.count,p:parts.length,fx:REW8.fx,fl:REW8.flights,cards:document.querySelectorAll('#rw8 .rw8c').length,lv:document.getElementById('rw8lv').classList.contains('on'),pend:REW8.pend,shown:+document.getElementById('gv').textContent,gems}));
 ok('reward effects clean up (pillars, flights, cards, level card gone; particle counts back to normal; counter = wallet)',clean.fx==0&&clean.fl==0&&clean.cards==0&&!clean.lv&&clean.pend==0&&clean.shown==clean.gems&&clean.v<=base.v+15&&clean.p<=base.p+20,{clean,base});
 // ---- reduced motion: no pillars / flights / flash, numbers still update, cards still show
 const rm=await E(async()=>{cel.opt.reduce=1;QM.apply(QM.cur.id,true);const g0=gems;done.harvest=0;G('harvest');REW8.reveal(267,1,P.x,P.y,{gems:5});const r={fx:REW8.fx,fl:REW8.flights,cards:CARDS().length,shown:+document.getElementById('gv').textContent};await new Promise(q=>setTimeout(q,100));r.shown=+document.getElementById('gv').textContent;r.gems=gems;cel.opt.reduce=0;QM.apply(QM.cur.id,true);return r});
 ok('reduced motion: no pillars or flying gems, the counter updates at once, cards still appear',rm.fx==0&&rm.fl==0&&rm.cards>=2&&rm.shown==rm.gems,rm);
 // ---- existing saves still load
 const old=await E(()=>{enterWorld('oldwide');return{a:tiles[2*W+5],b:tiles[2*W+6],w:JSON.parse(localStorage.getItem('rbw_oldwide')).W,W}});
 ok('an old 100-wide world save still migrates and loads its edits',old.a==7&&old.b==7&&old.w==old.W,old);
 const sb=await E(()=>{enterWorld('savedbuild');const g0=DEPTH8.find('grove');const k=(g0.fy-1)*W+g0.x;delete DEPTH8.db.w.savedbuild;DEPTH8.save();
  // simulate a save made before DEPTH8 existed: a brick inside the first grove room plus one far away
  localStorage.setItem('rbw_savedbuild',JSON.stringify({W,[k]:[7,0,0,0],[5*W+3]:[11,0,0,0]}));enterWorld('savedbuild');const ids=DEPTH8.sites().map(r=>r.id);
  const r={brick:tiles[k]==7,far:tiles[5*W+3]==11,skipped:!ids.includes(g0.id),others:ids.length>=8,ok:DEPTH8.wr().ok.slice()};enterWorld('depthtest');enterWorld('savedbuild');r.stable=JSON.stringify(DEPTH8.sites().map(x=>x.id))==JSON.stringify(ids);return r});
 ok('a save with a build where a room would go: the build is kept, that room is skipped, the rest appear, layout stays stable',sb.brick&&sb.far&&sb.skipped&&sb.others&&sb.stable&&!sb.ok.includes('g0'),sb);
 ok('no page errors',errs.length==0,errs.join(' | '));
 await b.close();console.log(fails?fails+' depth test(s) FAILED':'all depth tests passed');process.exit(fails?1:0)})();
