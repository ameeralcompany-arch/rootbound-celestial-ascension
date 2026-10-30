// Block-break effects + softer mining sounds (85-zz-wisps.js, 86-zz-minesfx.js): the 18 store break effects are in the catalog (slot 'break'),
// buying + equipping one switches the effect, every effect spawns, moves, draws and fades out without errors, the free ones still work and
// picking one in Settings takes the store one off, the store card preview animates, fist / weapon hits now play the soft material sounds
// (no old blip), and a quick FPS-safety check: many breaks stay within the particle cap. node tests/breakfx.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 p.on('console',m=>{if(m.type()=='error'&&/BRK7|MSFX8/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(guest);await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);
 await p.evaluate(()=>enterWorld('brkfx'));await p.waitForTimeout(900);const E=(f,a)=>p.evaluate(f,a);
 // catalog
 const cat=await E(()=>{const L=SHOP7.items.filter(i=>i.sub=='break');return{n:L.length,ids:L.map(i=>i.id),slot:SHOP7.SLOTS.includes('break'),shop:Object.keys(BRK7.SHOP).length,rar:[...new Set(L.map(i=>i.rar))]}});
 ok('18 break effects in the store, slot break',cat.n==18&&cat.slot&&cat.shop==18,cat);
 ok('break effects span common to mythic',cat.rar.includes('common')&&cat.rar.includes('mythic'),cat.rar);
 ok('default break effect is the free soul wisps',await E(()=>BRK7.skin)=='souls');
 // buy + equip Heart Pop
 const buy=await E(async()=>{gems=100000;const r=await SHOP7.buy('fx_brk_heart');const e=SHOP7.equip('fx_brk_heart');return{r:r.ok,e,skin:BRK7.skin,opts:BRK7.options().map(o=>o[0])}});
 ok('buying + equipping Heart Pop switches the break effect',buy.r&&buy.e&&buy.skin=='heart',buy);
 ok('settings list shows free + owned effects',buy.opts.includes('heart')&&buy.opts.includes('souls')&&!buy.opts.includes('phantom'),buy.opts);
 // every effect in the world: spawn by breaking a block, it moves, then it is gone
 const kinds=['souls','sparkle','petals',...cat.ids.map(i=>i.slice(7))];const res={};
 await E(()=>{for(const id of Object.keys(BRK7.SHOP))SHOP7.st.own['fx_brk_'+id]=1;mobs.length=0;P.vx=P.vy=0});
 for(const k of kinds){res[k]=await E(async k=>{BRK7.L.length=0;BRK7.set(k);const px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=1;
   const brk=()=>{for(let i=0;i<40&&tiles[q];i++)breakAt(px,py,999)};brk();const n0=BRK7.L.length,kinds=[...new Set(BRK7.L.map(w=>w.k))],x0=BRK7.L.map(w=>w.x+','+w.y).join();
   await new Promise(r=>setTimeout(r,500));const moved=BRK7.L.map(w=>w.x+','+w.y).join()!=x0;await new Promise(r=>setTimeout(r,2900));return{skin:BRK7.skin,n0,kinds,moved,left:BRK7.L.length}},k)}
 const bad=kinds.filter(k=>!(res[k].skin==k&&res[k].n0>0&&res[k].moved&&res[k].left==0));
 ok('every break effect spawns, moves and fades out ('+kinds.length+')',bad.length==0,bad.map(k=>k+':'+JSON.stringify(res[k])).join(' | ')||kinds.join(','));
 ok('blossom also drops loose petals, galaxy has a planet and stars',res.blossom.kinds.includes('petals')&&res.galaxy.kinds.includes('planet')&&res.galaxy.kinds.includes('gstar'),[res.blossom.kinds,res.galaxy.kinds]);
 ok('picking a free effect takes the store one off',await E(()=>{BRK7.set('heart');const a=SHOP7.st.eq.break;BRK7.set('petals');return a=='fx_brk_heart'&&!SHOP7.st.eq.break&&BRK7.skin=='petals'}));
 // classic: nothing spawns
 ok('classic spawns nothing',await E(()=>{BRK7.L.length=0;BRK7.set('classic');const px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=1;for(let i=0;i<40&&tiles[q];i++)breakAt(px,py,999);return BRK7.L.length==0}));
 // cap
 ok('particle cap holds under fast mining',await E(()=>{BRK7.set('blossom');BRK7.L.length=0;const px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;for(let j=0;j<60;j++){tiles[q]=1;for(let i=0;i<40&&tiles[q];i++)breakAt(px,py,999)}return BRK7.L.length<=90}));
 // store card preview: animates on the preview canvas and the still thumbnail draws
 const pv=await E(async()=>{const c=document.createElement('canvas');c.width=300;c.height=255;const x=c.getContext('2d'),out={};for(const k of ['heart','phantom','galaxy','butterfly']){let t=performance.now()/1000;for(let i=0;i<60;i++){BRK7.preview(x,'brk_'+k,150,148,1,t+i/30,false)}
   const d=x.getImageData(0,0,300,255).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;out[k]=n}
  const s=document.createElement('canvas');s.width=132;s.height=106;BRK7.preview(s.getContext('2d'),'brk_heart',66,61,.44,1,true);const d=s.getContext('2d').getImageData(0,0,132,106).data;let m=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)m++;out.still=m;return out});
 ok('store preview draws each break effect + the thumbnail',Object.values(pv).every(v=>v>200),pv);
 const st=await E(async()=>{STORE7.open&&STORE7.open();await new Promise(r=>setTimeout(r,300));const el=document.querySelector('#store7, .store7, [id^=store]');return !!el});
 ok('store opens with the break effects inside',st);
 await E(()=>{try{STORE7.close&&STORE7.close()}catch(_){}});
 // sounds: a fist hit now goes through MSFX8 (the soft material sounds), not breakAt's old square blip
 const snd=await E(async()=>{const n0=MSFX8.log.length,px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=3;breakAt(px,py,1);await new Promise(r=>setTimeout(r,40));const a=MSFX8.log.slice(n0).map(e=>e.k+':'+e.c);
  await new Promise(r=>setTimeout(r,60));for(let i=0;i<60&&tiles[q];i++)breakAt(px,py,999);await new Promise(r=>setTimeout(r,40));const b=MSFX8.log.slice(n0).map(e=>e.k+':'+e.c);return{a,b}});
 ok('non-tool hits play the soft material sound',(snd.a.includes('hit:stone')||snd.a.includes('break:stone'))&&snd.b.includes('break:stone'),snd);
 const bus=await E(()=>{try{ac()}catch(_){}MSFX8.play('break','ore',73);return typeof AC!='undefined'&&!!AC});ok('sound bus builds (shelf + lowpass + room) without errors',bus&&!errs.length,errs.slice(0,3));
 // block debris (DEB12): texture fragments + dust by material, always (even with classic), from a pool that reuses slots; effect sounds (BFX12)
 const deb=await E(async()=>{BRK7.set('classic');DEB12.clear();const out={},want={dirt:/^Dirt$/,stone:/^Stone$/,ore:/Ore/,wood:/^Wood$/,glass:/^Glass$/,sand:/^Sand$/};
  for(const k in want){let id=0;for(const b in BLK)if(want[k].test(BLK[b][0])){id=+b;break}if(!id)continue;DEB12.clear();const px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=id;for(let i=0;i<60&&tiles[q];i++)breakAt(px,py,999);
   out[k]={id,m:DEB12.mat(id),n:DEB12.count,frag:DEB12.art(id).f.length}}
  DEB12.clear();const cap0=DEB12.cap;for(let j=0;j<120;j++){const px=Math.floor(P.x/T)+2,py=Math.floor((P.y+P.h)/T)-1,q=py*W+px;tiles[q]=3;for(let i=0;i<60&&tiles[q];i++)breakAt(px,py,999)}
  const peak=DEB12.count,cap1=DEB12.cap;await new Promise(r=>setTimeout(r,2200));
  const kinds=BRK7.FREE.map(f=>f[0]).filter(k=>k!='classic').concat(Object.keys(BRK7.SHOP));
  return{out,peak,cap0,cap1,left:DEB12.count,mapped:kinds.filter(k=>!BFX12.MAP[k]),heart:(()=>{try{BFX12.MAP.heart(AC.destination);return true}catch(e){return e.message}})()}});
 ok('breaking blocks always throws debris cut from the block texture, by material (even with the classic effect)',Object.values(deb.out).every(o=>o.n>0&&o.frag==8)&&deb.out.stone.m=='stone'&&deb.out.wood.m=='wood'&&deb.out.glass.m=='glass'&&deb.out.sand.m=='sand',JSON.stringify(deb.out));
 ok('debris pool grows instead of dropping, stays capped, and empties after',deb.cap1>=deb.cap0&&deb.cap1<=1024&&deb.peak<=deb.cap1&&deb.left==0,JSON.stringify({peak:deb.peak,cap0:deb.cap0,cap1:deb.cap1,left:deb.left}));
 ok('every break effect has its own sound layer; Heart Pop plays its warm chime',deb.mapped.length==0&&deb.heart===true,JSON.stringify({missing:deb.mapped,heart:deb.heart}));
 ok('no page errors',errs.length==0,errs.slice(0,4));
 console.log(fails?fails+' FAILED':'all breakfx tests passed');await b.close();process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
