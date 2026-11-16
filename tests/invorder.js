// Moving things in the backpack (master update 2): your own order per tab ("My order"), moved by the menu, Alt + arrows or dragging a tile onto another
// (left part: before it, right part: after it, middle: swap); it survives a reload; a search never scrambles the rest; the game's refreshes keep your
// scroll and do not rebuild the grid when nothing you can see changed; keys 1-7 only file the selected item into a slot while your pointer is over the
// backpack; the new tabs (Consumables, Special) hold what they say; "Newest first" follows things you pick up again.   node tests/invorder.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const INV={1:20,2:20,3:20,5:20,7:20,8:20,11:20,12:20,13:20,14:20,15:20,250:4,610:3,17:1,101:5,71:9,262:5,263:2};
const SAVE=JSON.stringify({v:1,inv:INV,gems:100,own:{fist:1},wp:'fist',bar:[1],done:{},xp:3,lvl:30,made:true});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:800}});
 await c.addInitScript(sd=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const errs=[];const open=async()=>{const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});
  await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await sleep(900);await p.evaluate(()=>{INV7.open();INV7.filter='blocks';INV7.render()});await sleep(300);return p};
 let p=await open();const E=(f,a)=>p.evaluate(f,a);
 const L0=await E(()=>INV7.list.map(String));
 const mv=await E(()=>{const k=INV7.list[1];INV7.select(k);INV7.move(k,-1);return{k:String(k),list:INV7.list.map(String)}});
 ok('"Move up" moves the item one place earlier (My order)',mv.list[0]==mv.k&&mv.list[1]==L0[0]&&mv.list.length==L0.length,{L0,after:mv.list});
 await p.keyboard.down('Alt');await p.keyboard.press('ArrowRight');await p.keyboard.up('Alt');await sleep(150);
 const ak=await E(()=>INV7.list.map(String));ok('Alt + → moves the selected item one place later',ak[1]==mv.k&&ak[0]==L0[0],ak.slice(0,3));
 // drag: a tile dropped on the left part of another goes before it; on the middle, they swap
 // (the synthetic drag can miss its target when the page is busy: one retry, the way a person would simply drop again)
 const dragTo=async(a,bk,frac)=>{const b0=await E(()=>INV7.list.map(String));for(let t=0;t<2;t++){const box=await p.locator('#inv7 .grid7 .it7[data-k="'+bk+'"]').boundingBox();await p.dragAndDrop('#inv7 .grid7 .it7[data-k="'+a+'"]','#inv7 .grid7 .it7[data-k="'+bk+'"]',{targetPosition:{x:box.width*frac,y:box.height/2}});await sleep(250);const l=await E(()=>INV7.list.map(String));if(JSON.stringify(l)!=JSON.stringify(b0))return l}return E(()=>INV7.list.map(String))};
 let cur=ak;const a1=cur[4],b1=cur[1];let after=await dragTo(a1,b1,.1);ok('dragging a tile onto the left part of another puts it right before it',after.indexOf(a1)==after.indexOf(b1)-1&&after.length==cur.length,{a1,b1,after:after.slice(0,6)});
 cur=after;const a2=cur[0],b2=cur[5];after=await dragTo(a2,b2,.5);ok('dropping on the middle of a tile swaps the two',after[0]==b2&&after[5]==a2,{a2,b2,after:after.slice(0,6)});
 const before=after;
 // a search, a move, then clear the search: the items you did not touch keep their places
 const sr=await E(()=>{INV7.render();const all=INV7.list.map(String);const inp=document.getElementById('inq7');inp.value='brick';inp.dispatchEvent(new Event('input',{bubbles:true}));const shown=INV7.list.map(String);const k=shown[0];INV7.move(k,1);inp.value='';const n=document.getElementById('inq7');n.value='';n.dispatchEvent(new Event('input',{bubbles:true}));return{all,shown,k,after:INV7.list.map(String)}});
 const rest=a=>a.filter(k=>k!=sr.k);ok('a move made while searching never scrambles the rest of the tab',JSON.stringify(rest(sr.after))==JSON.stringify(rest(sr.all)),sr);
 // reload: the order stays
 const want=await E(()=>INV7.list.map(String));await p.close();p=await open();const got=await p.evaluate(()=>INV7.list.map(String));
 ok('your order survives a reload',JSON.stringify(got)==JSON.stringify(want),{want,got});
 // refreshes: the grid is not rebuilt when nothing visible changed, and keeps its scroll when it is
 const rf=await p.evaluate(async()=>{INV7.filter='all';INV7.render();const g=document.querySelector('#inv7 .grid7');g.style.maxHeight='160px';g.scrollTop=90;const t0=document.querySelector('#inv7 .grid7 .it7');renderInv();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const same=document.querySelector('#inv7 .grid7 .it7')===t0;
  addI(3,1);renderInv();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const g2=document.querySelector('#inv7 .grid7');return{same,rebuilt:document.querySelector('#inv7 .grid7 .it7')!==t0,scroll:g2.scrollTop}});
 ok('a refresh with nothing new does not rebuild the grid; one that does keeps your scroll',rf.same&&rf.rebuilt&&rf.scroll>=80,rf);
 // keys 1-7: only while the pointer is over the backpack
 const ks=await p.evaluate(async()=>{const H=HOTBAR;INV7.filter='blocks';INV7.render();const k=INV7.list.find(x=>H.assignable(x)&&H.slotOf(x)<0);INV7.select(k);const ev=new PointerEvent('pointerout',{bubbles:true,relatedTarget:document.body});document.getElementById('inv7').dispatchEvent(ev);await new Promise(r=>setTimeout(r,30));const away=INV7.hover;selBar(3);const s1=H.slotOf(k);
  document.querySelector('#inv7 .sheet').dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));await new Promise(r=>setTimeout(r,30));selBar(3);const s2=H.slotOf(k);return{k,away,s1,s2}});
 ok('keys 1-7 do not file the selected item away while your pointer is elsewhere; over the backpack they do',ks.away===false&&ks.s1<0&&ks.s2==3,ks);
 // the new tabs and "newest first"
 const tb=await p.evaluate(()=>{const o={};for(const f of['cons','objects','mats']){INV7.filter=f;INV7.render();o[f]=INV7.list.map(String)}INV7.filter='mats';(()=>{const inp=document.getElementById('ins7');inp.value='new';inp.dispatchEvent(new Event('change',{bubbles:true}))})();addI(262,3);INV7.render();o.newest=String(INV7.list[0]);return o});
 ok('Consumables holds bait and pet food; Special holds the World Lock; Materials holds quartz but not bait',tb.cons.includes('250')&&tb.cons.includes('610')&&tb.objects.includes('17')&&tb.mats.includes('262')&&!tb.mats.includes('250'),tb);
 ok('"Newest first" puts something you just picked up more of at the top',tb.newest=='262',tb.newest);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
