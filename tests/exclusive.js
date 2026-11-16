// Exclusive presentation and the ten new wings (master update 2): the new wings sit at the end of the list (nothing already there moves), are never
// sold, each has an earning goal, draws, and looks unlike the others; each rarity has its own tile look (rare edge, epic breathing glow, legendary
// sweep, mythic turning edge); a worn legendary+ look puts glints around the character; reward cards carry their tier.   node tests/exclusive.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},150000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:800}});
 await c.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('rbp',JSON.stringify({v:1,inv:{1:5,264:2,265:1,266:1,267:1},own:{fist:1},wp:'fist',bar:[1],done:{},lvl:60,made:true}));localStorage.setItem('rbg_seen','1')}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready&&window.WINGS4,null,{timeout:90000});
 const E=(f,a)=>p.evaluate(f,a);await E(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await p.waitForTimeout(1200);
 const w=await E(()=>{const ids=WINGS4,idx=ids.map(id=>WINGS.findIndex(x=>x.id==id)),o={n:ids.length,idx,last:WINGS.length};o.atEnd=idx.every(i=>i>=WINGS.length-ids.length);o.sold=ids.filter(id=>SHOP7.byId.get('wing_'+id)&&SHOP7.byId.get('wing_'+id).sale!==0);
  o.goals=ids.every(id=>Array.isArray(WINGX.REQ[id])&&WINGX.REQ[id].length&&WINGX.REQ[id].every(r=>typeof r[0]=='string'&&typeof r[1]=='function'));
  const hs=[],blank=[];for(const i of idx){const cv=document.createElement('canvas');cv.width=260;cv.height=220;const x=cv.getContext('2d',{willReadFrequently:true});x.translate(130,140);x.scale(.8,.8);WingArt.draw(x,i,0,0,1,0,0,0,0,1,null,null,{ds:1});const d=x.getImageData(0,0,260,220).data;let px=0,h=0;for(let k=0;k<d.length;k+=16)if(d[k+3]>20){px++;h=(h*31+(d[k]>>4)*3+(d[k+1]>>4)*5+(d[k+2]>>4)*7+k)>>>0}if(px<300)blank.push(WINGS[i].id);hs.push(h)}
  o.blank=blank;o.distinct=new Set(hs).size;o.fams=new Set(idx.map(i=>WINGS[i].fam)).size;o.rars=[...new Set(idx.map(i=>WINGS[i].rar))];return o});
 ok('ten new wings, added at the end of the list (no existing wing moves)',w.n==10&&w.atEnd,w);
 ok('none is sold; each has an earning goal',w.sold.length==0&&w.goals,w);
 ok('each draws and looks unlike the others (ten distinct pictures, six families, four rarities)',w.blank.length==0&&w.distinct==10&&w.fams>=6&&w.rars.length>=4,w);
 const tiers=await E(async()=>{INV7.open();INV7.filter='mats';INV7.render();await new Promise(r=>setTimeout(r,300));const o={};for(const r of['rare','epic','legendary','mythic']){const t=document.querySelector('#inv7 .it7[data-rar='+r+']');if(!t){o[r]='none';continue}const cs=getComputedStyle(t),bf=getComputedStyle(t,'::before'),af=getComputedStyle(t,'::after');o[r]={tile:cs.animationName,before:bf.content!='none'?(bf.animationName&&bf.animationName!='none'?bf.animationName:'edge'):'none',after:af.content!='none'?af.animationName:'none'}}INV7.close();return o});
 ok('each rarity has its own look: rare an edge, epic a breathing glow, legendary a light sweep, mythic a turning edge',tiers.rare&&tiers.rare.before=='edge'&&tiers.legendary.before=='edge'&&tiers.epic&&tiers.epic.tile=='rbt-breathe'&&tiers.legendary&&tiers.legendary.after=='rbt-sweep'&&tiers.mythic&&tiers.mythic.before=='rbt-turn',tiers);
 const au=await E(()=>{const m=SHOP7.items.find(i=>i.cat=='cosmetics'&&(i.rar=='mythic'||i.rar=='legendary'));const eq=COS1.eq,s0=eq[m.sub];eq[m.sub]=m.id;let me=0;try{me=TIERAURA.best('me')}finally{if(s0==null)delete eq[m.sub];else eq[m.sub]=s0}/* the top tiers are rare finds: worn here as if found */const plain=TIERAURA.best({cx:{cz:[]}});const other=TIERAURA.best({cx:{cz:[m.ord]}});return{me,plain,other,rar:m.rar}});
 ok('wearing a legendary or mythic look puts glints around you, and others see them on you too',au.me>=1&&au.plain==0&&au.other==au.me,au);
 const rc=await E(()=>{REW8.card({kind:'look',kick:'Earned',title:'Test',sub:'x',tier:5,ms:800});const c=[...document.querySelectorAll('#rw8 .rw8c')].pop();return c&&c.dataset.tier});
 ok('reward cards carry their tier, so a mythic card has its own edge',rc=='5',rc);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
