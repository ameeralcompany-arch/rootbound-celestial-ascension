// Farming (FARM9): plant crop seeds on soil, water them (2x growth, rain waters too), 5 growth stages, harvest timing / quality stars,
// rewards (produce, seeds, gems, XP, stats, milestones), saving the 5-field crop edits, and old tree saplings still working. node tests/farming.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.env.RB_SHOTS||'';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error')errs.push('console: '+m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});await p.waitForTimeout(400);
 await p.evaluate(()=>{enterWorld('farmtest')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a);const shot=async n=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,n+'.png')})};
 await E(()=>{WX6.force='clear';mobs.length=0;ENV7.set('default',{instant:true})});await p.waitForTimeout(200);
 // a flat strip of grass right next to the player, sky above it
 const spot=await E(()=>{const px=Math.floor(P.x/T),gy=Math.floor((P.y+P.h+2)/T);for(let x=px-3;x<=px+9;x++){for(let y=gy-6;y<gy;y++){tiles[y*W+x]=0;trees.delete(y*W+x)}tiles[gy*W+x]=2;hp[gy*W+x]=BLK[2][2];tiles[(gy+1)*W+x]=1}P.x=(px-1)*T+T/2;P.y=gy*T-P.h-1;P.vx=P.vy=0;return{gy,x0:px}});
 const aim=(x,y)=>E(([x,y])=>{mx=x*T+T/2-cam.x;my=y*T+T/2-cam.y},[x,y]);
 const hold=it=>E(it=>{HOTBAR.set(4,it,{quiet:1});HOTBAR.pick(4,true)},it);
 // ---- data
 const d=await E(()=>({crops:Object.keys(FARM9.CROPS).map(Number),seedsInStore:SHOP7.items.filter(i=>/^seed_18[0-4]$/.test(i.id)).length,names:[180,181,182,183,184].map(k=>iname(k)),prod:[280,281,282,283,284].map(k=>MAT[k]&&MAT[k].n),cat:ITEM7.cat(180),icon:iconURL(181).length>500&&iconURL(283).length>500}));
 ok('five crops (carrot, strawberry, wheat, pumpkin, moon melon) with seed items, produce materials, icons and store entries',d.crops.length==5&&d.seedsInStore==5&&d.names[0]=='Carrot Seed'&&d.prod[4]=='Moon Melon'&&d.cat=='seed'&&d.icon,d);
 // ---- planting: only on soil, from the hotbar
 const pl=await E(async({gy,x0})=>{addI(180,6);addI(182,3);HOTBAR.set(4,180,{quiet:1});HOTBAR.pick(4,true);const o={};const st0=stats.plant|0,c0=cnt(180);
  const k=(gy-1)*W+x0;mx=x0*T+T/2-cam.x;my=(gy-1)*T+T/2-cam.y;placeAction();const t=trees.get(k);o.planted=!!t&&t.s==80&&cnt(180)==c0-1&&(stats.plant|0)==st0+1;o.k=k;o.stage=t?FARM9.stageOf(FARM9.cp(t)):-1;
  // stone below: refused
  const k2=(gy-1)*W+x0+2;tiles[gy*W+x0+2]=3;mx=(x0+2)*T+T/2-cam.x;placeAction();o.stoneRefused=!trees.has(k2);tiles[gy*W+x0+2]=2;return o},spot);
 ok('a crop seed plants on soil (hotbar slot + click), stage 0, counts as planting; stone is refused',pl.planted&&pl.stage==0&&pl.stoneRefused,pl);
 // ---- watering: clicking a growing crop waters it instead of pulling it up; watered crops grow twice as fast
 const wt=await E(async k=>{const t=trees.get(k),o={};wp='fist';const now=Date.now();harvest(k);o.still=trees.has(k);o.wet=FARM9.wet(t);o.saved=edits[k]&&edits[k].length==5&&edits[k][4]>now;
  const w1=t.w;harvest(k);o.noDouble=t.w==w1;
  // same planting time, one dry one watered: compare progress after 1.2 s
  const k2=k+1;trees.set(k2,{s:80,r:80,p:t.p,w:0});pushEdit(k2);await new Promise(r=>setTimeout(r,1200));o.wetP=FARM9.cp(t);o.dryP=FARM9.cp(trees.get(k2));o.ratio=o.wetP/o.dryP;trees.delete(k2);pushEdit(k2);return o},pl.k);
 ok('clicking a growing crop waters it (crop stays, wet soil, saved in the 5th edit field, no double watering)',wt.still&&wt.wet&&wt.saved&&wt.noDouble,wt);
 ok('watered crops grow twice as fast',wt.ratio>1.8&&wt.ratio<2.2,wt);
 // ---- growth stages over time (fake the clock by moving the planting time)
 const sg=await E(k=>{const t=trees.get(k),G=FARM9.CROPS[80].grow*1000,out=[];t.w=0;for(const f of[0,.2,.5,.8,1.01]){t.p=Date.now()-f*G;out.push(FARM9.stageOf(FARM9.cp(t)))}return out},pl.k);
 ok('five visible growth stages: seed, sprout, leafy, budding, ripe',JSON.stringify(sg)=='[0,1,2,3,4]',sg);
 // screenshots: every crop at every stage, side by side
 await E(({gy,x0})=>{const G=c=>FARM9.CROPS[c].grow*1000;trees.clear();let i=0;for(let st=0;st<5;st++){const x=x0-2+st*2;trees.set((gy-1)*W+x,{s:80+((st+1)%5),r:80+((st+1)%5),p:Date.now()-[0,.2,.5,.8,1.05][st]*G(80+((st+1)%5)),w:st%2?Date.now()+30000:0});pushEdit((gy-1)*W+x)}},spot);
 await p.waitForTimeout(400);await shot('farm_stages');
 const allSt=await E(({gy,x0})=>{const o=[];for(const c of[80,81,82,83,84])for(let st=0;st<5;st++){try{const s=FARM9.sprite(c,st,0);o.push(s.width>0)}catch(e){o.push(false)}}return o.every(Boolean)&&o.length==25},spot);
 ok('every crop has art for every stage (25 sprites) and the field renders',allSt);
 await E(({gy,x0})=>{const G=c=>FARM9.CROPS[c].grow*1000;trees.clear();[80,81,82,83,84].forEach((c,i)=>{const k=(gy-1)*W+x0-2+i*2;trees.set(k,{s:c,r:c,p:Date.now()-G(c)*1.05,w:Date.now()-1})});P.x=(x0+2)*T+T/2},spot);await p.waitForTimeout(500);await shot('farm_ripe');
 // ---- harvest timing + quality
 const hv=await E(async({gy,x0})=>{const o={},G=FARM9.CROPS[80].grow*1000,PER=FARM9.PER,PW=FARM9.PW;trees.clear();const k=(gy-1)*W+x0;
  const ripe=(w,ph)=>{const now=Date.now();const t={s:80,r:80,p:0,w:0};t.p=now-G-ph;if(w){t.w=1}trees.set(k,t);pushEdit(k);return t};
  // perfect: watered + in the glowing window
  let t=ripe(true,PER-PW/2);o.perf=FARM9.perfectNow(t,Date.now());let c0=cnt(280),g0=gems,h0=stats.harvest|0,x0p=prof.farm.x+prof.farm.l*1e6;wp='fist';harvest(k);o.gotP=cnt(280)-c0;o.gemsP=gems-g0;o.statH=(stats.harvest|0)-h0;o.xp=prof.farm.x+prof.farm.l*1e6>x0p;o.gone=!trees.has(k);
  // plain: never watered, off-beat
  t=ripe(false,10);o.perf2=FARM9.perfectNow(t,Date.now());c0=cnt(280);harvest(k);o.gotN=cnt(280)-c0;
  // wilted: ripe for more than 5 minutes
  t=ripe(true,FARM9.OVER+5000);o.wilt=FARM9.wilted(t,Date.now());c0=cnt(280);harvest(k);o.gotW=cnt(280)-c0;
  await new Promise(r=>setTimeout(r,50));return o},spot);
 ok('perfect harvest (watered + golden ring): 3 stars = double yield, gems, Farming XP, harvest stat, crop removed',hv.perf&&hv.gotP>=4&&hv.gotP<=6&&hv.gemsP>0&&hv.statH==1&&hv.xp&&hv.gone,hv);
 ok('an unwatered off-beat harvest gives the base yield; a crop left ripe too long wilts (half yield)',!hv.perf2&&hv.gotN>=2&&hv.gotN<=3&&hv.wilt&&hv.gotW>=1&&hv.gotW<=2,hv);
 // harvest burst screenshot
 await E(({gy,x0})=>{const G=FARM9.CROPS[83].grow*1000,PER=FARM9.PER,PW=FARM9.PW,k=(gy-1)*W+x0+2;trees.set(k,{s:83,r:83,p:Date.now()-G-(PER-PW/2),w:1});pushEdit(k);harvest(k)},spot);await p.waitForTimeout(220);await shot('farm_harvest');
 // milestones + reward card
 const ms=await E(async({gy,x0})=>{const k=(gy-1)*W+x0;const G=FARM9.CROPS[82].grow*1000;for(let i=0;i<5;i++){trees.set(k,{s:82,r:82,p:Date.now()-G-10,w:0});pushEdit(k);harvest(k)}await new Promise(r=>setTimeout(r,200));return{m:FARM9.S.m.slice(),h:FARM9.S.h,saved:JSON.parse(localStorage.getItem((typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpfarm')).h}},spot);
 ok('farming milestones pay out (First Harvests after 5) and farm stats are saved per profile',ms.m.includes('h5')&&ms.saved==ms.h&&ms.h>=8,ms);
 // ---- rain waters every growing crop
 const rn=await E(async({gy,x0})=>{const k=(gy-1)*W+x0+4;trees.set(k,{s:81,r:81,p:Date.now(),w:0});pushEdit(k);WX6.force='rain';const t0=performance.now();while(performance.now()-t0<14000&&!FARM9.wet(trees.get(k)))await new Promise(r=>setTimeout(r,250));const o={wet:FARM9.wet(trees.get(k)),wx:wxN};WX6.force='clear';return o},spot);
 ok('rain waters growing crops by itself',rn.wet,rn);
 // ---- saving: the crop (with its watered-until field) survives a save + reload of the world
 const sv=await E(async({gy,x0})=>{const k=(gy-1)*W+x0+6,now=Date.now();trees.set(k,{s:84,r:84,p:now-30000,w:now+20000});pushEdit(k);localStorage.setItem('rbw_'+cur,JSON.stringify(edits));const n=cur;loadWorld(n);await new Promise(r=>setTimeout(r,200));const t=trees.get(k);return{back:!!t&&t.s==84&&Math.abs(t.p-(now-30000))<2&&Math.abs(t.w-(now+20000))<2,len:edits[k]&&edits[k].length}},spot);
 ok('crops (and their watered state) are saved with the world and load back',sv.back&&sv.len==5,sv);
 // ---- old saplings still work exactly like before
 const sap=await E(async()=>{const px=Math.floor(P.x/T),gy=Math.floor((P.y+P.h+2)/T),x=px+1,k=(gy-1)*W+x;for(let y=gy-4;y<gy;y++){tiles[y*W+x]=0;trees.delete(y*W+x)}tiles[gy*W+x]=2;addI(101,2);HOTBAR.set(4,101,{quiet:1});HOTBAR.pick(4,true);mx=x*T+T/2-cam.x;my=(gy-1)*T+T/2-cam.y;placeAction();const t=trees.get(k);const o={planted:!!t&&t.s==1&&t.r==1&&!FARM9.isCrop(t)};
  t.p=Date.now()-3600*1000;o.grown=prog(t)===1;const d0=drops.length;wp='fist';harvest(k);o.harvested=!trees.has(k)&&drops.length>d0;o.edit=edits[k]&&edits[k].length==4;return o});
 ok('old tree saplings still plant, grow and harvest the old way (4-field edits)',sap.planted&&sap.grown&&sap.harvested&&sap.edit,sap);
 // ---- hover status + ghost sprout render without errors, reduced motion still draws
 await E(({gy,x0})=>{const k=(gy-1)*W+x0;trees.set(k,{s:80,r:80,p:Date.now()-15000,w:0});pushEdit(k);mx=x0*T+T/2-cam.x;my=(gy-1)*T+T/2-cam.y;cel.opt.reduce=1},spot);await p.waitForTimeout(300);await E(()=>{cel.opt.reduce=0});await shot('farm_hover');
 ok('no page errors',errs.length==0,errs.slice(0,5).join(' | '));
 await b.close();console.log(fails?fails+' farming test(s) FAILED':'all farming tests passed');process.exit(fails?1:0)})();
