// Mining tools: material sounds (MSFX8), tool levels with rewards + perks (TOOLLV), shine tiers in hand and on icons (rainbow at 10),
// saving / loading (old saves start at level 1), and the Tool Guide (GUIDE8: G key, hub tab, inventory button). node tests/tools.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function boot(p,world){await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});await p.waitForTimeout(400);
 await p.evaluate(w=>{enterWorld(w);WX6.force='clear';mobs.length=0},world);await p.waitForTimeout(900);
 await p.evaluate(()=>{mobs.length=0;
  // mine one block next to the player with a tool (the same path as a click: useWeapon -> TOOLS8.use -> breakAt)
  window.MINE=(id,b,dx,dy)=>{wp=id;const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h/2)/T),x=px+(dx==null?1:dx),y=py+(dy||0),k=y*W+x;if(b!=null){tiles[k]=b;hp[k]=BLK[b][2]}mx=x*T+T/2-cam.x;my=y*T+T/2-cam.y;
   const s=TOOLLV.S[id],x0=s.x,l0=s.l,n0=MSFX8.log.length;wcd=0;useWeapon();return{k,b,gone:!tiles[k],xp:TOOLLV.S[id].x-x0,l:TOOLLV.S[id].l,snd:MSFX8.log.slice(n0).map(e=>e.k+':'+e.c),wcd}};
  window.CARDS=()=>[...document.querySelectorAll('#rw8 .rw8c:not(.out)')].map(c=>({k:c.dataset.kind,r:c.dataset.rar,t:c.textContent}))})}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&/TOOLLV|MSFX8|GUIDE8|TOOLS8/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 // an older save: other progress present, no tool levels yet
 await p.addInitScript(()=>{if(!localStorage.getItem('rbc5'))localStorage.setItem('rbc5','1')});
 await boot(p,'tooltest');const E=(f,a)=>p.evaluate(f,a);
 const fresh=await E(()=>({l:TOOLLV.IDS.map(id=>TOOLLV.lvl(id)),key:localStorage.getItem(TOOLLV.K()),api:typeof MSFX8.play=='function'&&typeof GUIDE8.open=='function'}));
 ok('an existing save without tool data loads every tool at level 1',fresh.l.every(l=>l==1)&&fresh.api,fresh);
 // ---- sounds + XP for proper use
 const r1=await E(()=>MINE('pip',1));await sleep(60);
 const r2=await E(()=>MINE('pebble',3));await sleep(60);
 const r3=await E(()=>MINE('twiggy',5));await sleep(60);
 const r4=await E(()=>MINE('glimmer',72));await sleep(900);
 ok('Pip breaks dirt in one scoop: "soft" break sound + 2 XP',r1.gone&&r1.snd.includes('break:soft')&&r1.xp==2,r1);
 ok('Pebble breaks stone: "stone" break sound + 2 XP',r2.gone&&r2.snd.includes('break:stone')&&r2.xp==2,r2);
 ok('Twiggy splits wood: "wood" break sound + 2 XP',r3.gone&&r3.snd.includes('break:wood')&&r3.xp==2,r3);
 ok('Glimmer breaks ore: "ore" break sound (rock crack + crystal ting) + 6 XP',r4.gone&&r4.snd.includes('break:ore')&&r4.xp>=6,r4);
 const w1=await E(()=>MINE('pip',3));await sleep(120);const w2=await E(()=>MINE('pebble',72));await sleep(80);
 ok('the wrong tool only chips the block: dull "wrong" sound and no XP',!w1.gone&&w1.snd.includes('wrong:stone')&&w1.xp==0&&!w2.gone&&w2.snd.includes('wrong:ore')&&w2.xp==0,{w1,w2});
 const noXp=await E(()=>{const x0=JSON.stringify(TOOLLV.S);const px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h/2)/T)-2,k=py*W+px;tiles[k]=1;hp[k]=3;wp='pip';breakAt(px,py,255);
  const k2=k+1;tiles[k2]=1;hp[k2]=3;wp='fist';mx=(px+1)*T+T/2-cam.x;my=py*T+T/2-cam.y;wcd=0;useWeapon();return{same:JSON.stringify(TOOLLV.S)==x0,weaponLeft:tiles[k2]==1}});
 ok('no XP from breaks outside a tool swing or from weapons',noXp.same&&noXp.weaponLeft,noXp);
 // vein: a 20-block diamond vein; level 1 Glimmer takes 1 + 8, level 10 takes all 20 (each extra block has its own rising "vein" note)
 const mkVein=()=>E(()=>{const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h/2)/T),cells=[];for(let i=0;i<5;i++)cells.push([px+1,py-i]);for(let i=1;i<=15;i++)cells.push([px+1+i,py-4]);for(const[x,y]of cells){tiles[y*W+x]=76;hp[y*W+x]=BLK[76][2]}window.VC=cells;return cells.length});
 await mkVein();const v1=await E(()=>{const n0=MSFX8.log.length,x0=TOOLLV.S.glimmer.tx;const r=MINE('glimmer',null);return{r,n0,x0}});await sleep(1700);
 const v1b=await E(o=>({left:VC.filter(([x,y])=>tiles[y*W+x]==76).length,vein:MSFX8.log.slice(o.n0).filter(e=>e.k=='vein').length,xp:TOOLLV.S.glimmer.tx-o.x0}),v1);
 ok('Glimmer level 1 mines the clicked ore + an 8-block vein, each vein block chimes and gives 4 XP',v1b.left==11&&v1b.vein>=8&&v1b.xp==6+8*4,v1b);
 // speed perk
 const sp=await E(()=>{TOOLLV.set('pip',1,0);const a=MINE('pip',1).wcd;TOOLLV.set('pip',6,0);const b2=MINE('pip',1).wcd;TOOLLV.set('pip',1,0);return{a,b:b2,ratio:a/b2}});await sleep(60);
 ok('swing speed perk: a level 6 tool swings 25% faster',Math.abs(sp.ratio-1.25)<.01,sp);
 // geodes: 3 taps at level 1, 2 taps from level 7, sparkly geode break sound, +20 XP
 const geo=await E(async()=>{const out={};for(const L of[1,7]){TOOLLV.set('glimmer',L,0);let taps=0,snd=[],x0=TOOLLV.S.glimmer.tx;MINE('glimmer',94);taps++;snd.push(...MSFX8.log.slice(-1).map(e=>e.k+':'+e.c));
   const k=Math.floor((P.y+P.h/2)/T)*W+Math.floor(P.x/T)+1;while(tiles[k]==94&&taps<6){await new Promise(r=>setTimeout(r,60));const r=MINE('glimmer',null);taps++;snd.push(...r.snd)}out[L]={taps,snd,xp:TOOLLV.S.glimmer.tx-x0};await new Promise(r=>setTimeout(r,60))}return out});
 ok('Crystal Geode: 3 taps at level 1 and 2 taps from level 7, with geode hit + break sounds and +20 XP',geo[1].taps==3&&geo[7].taps==2&&geo[1].snd.includes('break:geode')&&geo[1].snd.includes('hit:geode')&&geo[1].xp==20&&geo[7].snd.includes('break:geode'),geo);
 // rate limit + volume
 const rl=await E(()=>{const n0=MSFX8.log.length;for(let i=0;i<25;i++)MSFX8.play('break','stone',3);return MSFX8.log.length-n0});
 ok('sounds are rate-limited (25 identical calls at once play once)',rl==1,rl);
 await sleep(80);const vol=await E(async()=>{ac();const A=AC;let n=0;const co=A.createOscillator.bind(A),cb=A.createBufferSource.bind(A);A.createOscillator=()=>{n++;return co()};A.createBufferSource=()=>{n++;return cb()};
  const sv=OPT.sv;OPT.sv=0;MSFX8.play('break','ore',73);const off=n;await new Promise(r=>setTimeout(r,60));OPT.sv=1;MSFX8.play('break','ore',73);const on=n-off;OPT.sv=sv;A.createOscillator=co;A.createBufferSource=cb;return{off,on,state:A.state}});
 ok('mining sounds follow the sound-effects volume (silent at 0, synthesized voices at 100%)',vol.off==0&&vol.on>=6,vol);
 // ---- level-ups: rewards, perks, celebration
 await sleep(400);const lu=await E(async()=>{TOOLLV.set('pip',1,0);const g0=gems,c0=document.querySelectorAll('#rw8 .rw8c[data-kind=tool]').length,ml=MSFX8.log.length;TOOLLV.add('pip',TOOLLV.need(1));await new Promise(r=>setTimeout(r,250));
  const cards=[...document.querySelectorAll('#rw8 .rw8c[data-kind=tool]')].map(c=>c.textContent),bn=document.getElementById('tl8lv');
  return{l:TOOLLV.lvl('pip'),dg:gems-g0,cards,c0,banner:!!bn&&bn.classList.contains('on')&&/Quick Scoop/.test(bn.textContent),lvSnd:MSFX8.log.slice(ml).some(e=>e.k=='level'),fx:REW8.fx,log:TOOLLV.LOG.slice(-1)[0]}});
 ok('reaching level 2 pays 30 gems, shows a REW8 perk card and the rolling tool-level banner, plays the level chime',lu.l==2&&lu.dg==30&&lu.cards.some(t=>/Pip reached level 2/.test(t)&&/Quick Scoop/.test(t))&&lu.banner&&lu.lvSnd&&lu.fx>0,lu);
 const l10=await E(async()=>{TOOLLV.set('glimmer',1,0);const g0=gems,n0=TOOLLV.LOG.length;let tot=0;for(let l=1;l<10;l++)tot+=TOOLLV.need(l);TOOLLV.add('glimmer',tot+50);await new Promise(r=>setTimeout(r,900));
  return{l:TOOLLV.lvl('glimmer'),x:TOOLLV.S.glimmer.x,dg:gems-g0,paid:TOOLLV.LOG.slice(n0).reduce((s,e)=>s+e.g,0),ups:TOOLLV.LOG.slice(n0).map(e=>e.l),tier:TOOLLV.tier('glimmer'),shine:CARDS().some(c=>/Rainbow shine/.test(c.t)),info:TOOLLV.info('glimmer')}});
 ok('enough XP climbs every level to 10 (each level paid: 1,205 gems in total), max level holds no extra XP',l10.l==10&&l10.x==0&&l10.paid==1205&&l10.dg>=1205&&l10.ups.join()=='2,3,4,5,6,7,8,9,10',l10);
 ok('level 10 is the rainbow tier and says so on a card',l10.tier==6&&l10.shine&&l10.info.tierName=='Rainbow shine',{tier:l10.tier,shine:l10.shine});
 await mkVein();const v10=await E(()=>{MINE('glimmer',null);return 1});await sleep(2400);const v10b=await E(()=>VC.filter(([x,y])=>tiles[y*W+x]==76).length);
 ok('perk: level 10 Glimmer mines a 20-block vein completely (veins up to 22)',v10b==0,v10b);
 const perk=await E(()=>{const s=TOOLLV.stats;return{pip10:TOOLLV.summary('pip',10),bub:[s.waitM(6),s.bite(3),s.luck(4),s.dbl(5)],wood:[s.wood(1),s.wood(3),s.wood(10)]}});
 ok('perk numbers match the cards (bites 30% sooner at 6, +0.2 s at 3, luck at 4, 6% double catch at 5, 2/3/6 extra wood)',Math.abs(perk.bub[0]-.7)<1e-9&&Math.abs(perk.bub[1]-.2)<1e-9&&perk.bub[2]>0&&Math.abs(perk.bub[3]-.06)<1e-9&&perk.wood.join()=='2,3,6',perk);
 // fishing XP: a catch through the rod's click gives Bubbles XP; luck is only lent during the catch
 const fish=await E(()=>{TOOLLV.set('bubbles',4,0);const F=TOOLS8.FISH;wp='bubbles';F.S.st='bite';F.S.x=P.x+40;F.S.y=P.y;F.S.bait=0;F.S.t=1;const x0=TOOLLV.S.bubbles.x;F.click({x:F.S.x,y:F.S.y});const reel=F.S.st,mid=TOOLLV.S.bubbles.x-x0;F.land();return{xp:TOOLLV.S.bubbles.x-x0,reel,mid,bait0:0 in TOOLS8.BAIT,st:F.S.st}});
 ok('a fish caught with Bubbles gives tool XP (reel mini-game first, XP only when it is landed; luck is lent only during the catch)',fish.reel=='reel'&&fish.mid==0&&fish.xp>=3&&!fish.bait0&&fish.st=='idle',fish);
 const bite=await E(()=>{TOOLLV.set('bubbles',6,0);const F=TOOLS8.FISH;F.S.st='idle';TOOLLV.fishWatch();F.S.st='wait';F.S.t=10;TOOLLV.fishWatch();const t=F.S.t;F.S.st='idle';TOOLLV.fishWatch();return t});
 ok('perk: level 6 Bubbles fish bite 30% sooner',bite<7.2&&bite>6.5,bite);
 // ---- shine tiers: icons tagged per tier + CSS animation, in-hand glow grows, rainbow cycles colours
 const tiers=await E(()=>{const out=[];for(let l=1;l<=10;l++){TOOLLV.set('pebble',l,0);const u=iconURL('w:pebble'),m=u.match(/#tl8-(\d)$/),im=new Image();im.src=u;document.body.appendChild(im);out.push({l,t:TOOLLV.tier('pebble'),tag:m?+m[1]:0,anim:getComputedStyle(im).animationName});im.remove()}return out});
 ok('tool icons carry their shine tier (plain at 1, tiers 1-6 after) and level 10 icons animate the rainbow',tiers.every(o=>o.tag==o.t)&&tiers[0].tag==0&&tiers[9].tag==6&&tiers[9].anim=='tl8rbs'&&tiers[7].anim=='tl8gd'&&tiers[5].anim=='tl8tw',tiers.map(o=>o.l+':'+o.t+'/'+o.tag+'/'+o.anim).join(' '));
 const hand=await E(()=>{const lit=l=>{TOOLLV.set('pip',l,0);const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d');x.translate(40,100);x.scale(2,2);drawWeapon(x,'pip',40,1.37);const d=x.getImageData(0,0,160,160).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>20)n++;return n};
  const v=[1,2,3,5,7,9,10].map(lit);const avg=t=>{const c=document.createElement('canvas');c.width=c.height=100;const x=c.getContext('2d');x.translate(10,50);TOOLLV.under(x,'pip',40,t,6);const d=x.getImageData(0,0,100,100).data;let r=0,g2=0,b2=0;for(let i=0;i<d.length;i+=4){r+=d[i];g2+=d[i+1];b2+=d[i+2]}return[r,g2,b2].map(q=>Math.round(q/1e4))};
  TOOLLV.set('pip',2,0);return{v,a:avg(.2),b:avg(1.2)}});
 const grows=hand.v.slice(2).every((n,i)=>n>=hand.v[i+1]*.98)&&hand.v[6]>hand.v[0]*1.5;
 ok('in hand the shine grows with the tier (more glowing pixels at higher levels)',grows,hand.v);
 ok('the rainbow aura cycles its colour over time',hand.a.join()!=hand.b.join(),{a:hand.a,b:hand.b});
 const deco=await E(()=>{const d=document.createElement('div');d.style.cssText='width:40px;height:40px;border-radius:8px';document.body.appendChild(d);TOOLLV.set('twiggy',10,0);TOOLLV.decorate(d,'w:twiggy');const a=d.getAttribute('data-tl8'),an=getComputedStyle(d,'::after').animationName;TOOLLV.set('twiggy',1,0);TOOLLV.decorate(d,'twiggy');const b2=d.getAttribute('data-tl8');d.remove();
  const c=document.createElement('canvas');c.width=c.height=48;TOOLLV.set('twiggy',10,0);TOOLLV.badge(c.getContext('2d'),'twiggy',0,0,48,1.1);const px=c.getContext('2d').getImageData(0,0,48,48).data.filter((v,i)=>i%4==3&&v>0).length;TOOLLV.set('twiggy',1,0);return{a,an,b:b2,px}});
 ok('icon API for slots: decorate() puts an animated rainbow ring on a slot, badge() paints on a canvas, both clear at level 1',deco.a=='6'&&deco.an=='tl8hue'&&deco.b==null&&deco.px>50,deco);
 // ---- persistence
 await E(()=>{TOOLLV.set('pip',4,17);TOOLLV.set('glimmer',10,0);TOOLLV.set('bubbles',7,3);TOOLLV.save()});
 await p.reload();await boot(p,'tooltest');
 const kept=await E(()=>({pip:TOOLLV.S.pip,gl:TOOLLV.lvl('glimmer'),bu:TOOLLV.lvl('bubbles'),tw:TOOLLV.lvl('twiggy'),ic:iconURL('w:glimmer').slice(-6)}));
 ok('tool levels and XP survive a reload of the saved data',kept.pip.l==4&&kept.pip.x==17&&kept.gl==10&&kept.bu==7&&kept.tw==1&&kept.ic=='#tl8-6',kept);
 // ---- guide
 const near=await E(()=>{try{return !!OBJ6.near()}catch(_){return false}});
 await p.mouse.move(640,300);await p.keyboard.press('g');await sleep(450);
 const g1=await E(()=>{const b=UI6.body;return{on:UI6.on,tab:UI6.tab,tabs:UI6.TABS.map(t=>t[0]).includes('toolguide'),nav:[...b.querySelectorAll('.tg8nav [data-g]')].map(x=>x.dataset.g),txt:b.textContent}});
 ok('G opens the Tool Guide hub tab (when not beside an object)',!near&&g1.on&&g1.tab=='toolguide'&&g1.tabs,{near,on:g1.on,tab:g1.tab});
 ok('the guide lists every tool plus basics, levels & shine and where to dig',['pip','pebble','glimmer','twiggy','bubbles','basics','levels','dig'].every(k=>g1.nav.includes(k))&&/hotbar slot \(1–6\)/.test(g1.txt),g1.nav);
 const pages=await E(async()=>{const out={};for(const id of TOOLLV.IDS){GUIDE8.go(id);await new Promise(r=>setTimeout(r,120));const b=UI6.body,c=b.querySelector('canvas.tg8cv');let lit=0;if(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=16)if(d[i]>20)lit++}
   out[id]={name:(b.querySelector('.tg8info h4')||{}).textContent==TOOLS8.TL[id].n,how:b.querySelectorAll('.tg8steps li').length,chips:b.querySelectorAll('.tg8chips .tg8c').length,levels:b.querySelectorAll('.tg8pl li').length,lit}}
  for(const pg of['basics','levels','dig']){GUIDE8.go(pg);await new Promise(r=>setTimeout(r,120));out[pg]={len:UI6.body.querySelector('.tg8pg').textContent.length,cv:UI6.body.querySelectorAll('canvas.tg8cv').length}}return out});
 ok('every tool page names the tool, shows how to use it, example blocks, all 10 levels and an animated preview',TOOLLV_IDS_OK(pages),pages);
 function TOOLLV_IDS_OK(o){return['pip','pebble','glimmer','twiggy','bubbles'].every(id=>o[id]&&o[id].name&&o[id].how>=3&&o[id].chips>=4&&o[id].levels==10&&o[id].lit>30)&&o.basics.len>400&&o.levels.cv==7&&o.dig.len>200}
 await p.keyboard.press('Escape');await sleep(350);ok('Escape closes the guide',await E(()=>!UI6.on));
 await p.keyboard.press('i');await sleep(350);const ib=await E(()=>!!document.querySelector('#inv7 .tg8ib'));await E(()=>document.querySelector('#inv7 .tg8ib').click());await sleep(400);
 ok('the inventory has a "Tool guide" button that opens the guide',ib&&await E(()=>UI6.on&&UI6.tab=='toolguide'&&!showInv));
 await E(()=>UI6.close());await sleep(250);
 // ---- corrupt tool data never breaks a load
 const ctx2=await b.newContext({viewport:{width:1280,height:720}});const p2=await ctx2.newPage();const errs2=[];p2.on('pageerror',x=>errs2.push(x.message));
 await p2.addInitScript(()=>{localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbptool','{oops')});await boot(p2,'tooltest2');
 const c2=await p2.evaluate(()=>TOOLLV.IDS.map(id=>TOOLLV.lvl(id)));ok('unreadable tool data loads as level 1 without errors',c2.every(l=>l==1)&&!errs2.length,{c2,errs2});await ctx2.close();
 ok('no page errors',!errs.length,errs.slice(0,5));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
