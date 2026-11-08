// The inventory drawer (src/js/late/99-zzzzzzzzzz-l-drawer.js) with a real mouse: the collapsed handle opens it by drag or click, the header drags between the three states, a flick
// down closes it, a click on a tile is never a drag, the hotbar stays visible and clickable, the keys work, and every item kind answers "Where to find" and "What is it used for?"
// from the game's real data. Run: node tests/drawer.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,400):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:20,3:40,208:6},gems:1000,own:{fist:1,astralkat:1,sakurakat:1},ownW:{},wear:{},wp:'astralkat',bar:[1],done:{},xp:3,lvl:30,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];
 const c=await b.newContext({viewport:{width:1600,height:900}});await c.addInitScript(sd=>{localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1500);await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('plaza')});await sleep(1500);
 const st=()=>p.evaluate(()=>({open:INV7.isOpen,lv:DRAWER1.level,vis:Math.round(DRAWER1.vis),rest:DRAWER1.rest}));
 const box=s=>p.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,top:r.top,left:r.left,w:r.width,h:r.height}},s);
 await p.waitForFunction(()=>{const h=document.getElementById('invh7');return h&&h.style.display!='none'},null,{timeout:6000});
 const h=await box('#invh7');const bar=await box('#bar');ok('collapsed: a handle sits on top of the hotbar',h.y<bar.top+4&&Math.abs(h.x-bar.x)<8,{h,bar});
 // click opens
 await p.mouse.click(h.x,h.y);await sleep(900);let s=await st();ok('clicking the handle opens the drawer to its expanded state',s.open&&s.lv=='half'&&s.rest,s);
 const sh=await box('#inv7 .sheet');ok('it grows out of the hotbar, which stays visible',sh.top+sh.h<=bar.top+8,{sheetBottom:sh.top+sh.h,barTop:bar.top});
 const slot=await p.evaluate(()=>{const r=document.querySelector('#bar > *').getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e.closest('#bar')});ok('the hotbar can still be clicked and dropped on',slot);
 // drag header up to full
 const hd=await box('#inv7 header');await p.mouse.move(hd.left+hd.w/2,hd.top+24);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(hd.left+hd.w/2,hd.top+24-i*30);await sleep(16)}await p.mouse.up();await sleep(900);s=await st();const m=await p.evaluate(()=>DRAWER1.metrics());ok('dragging the header up reaches full view',s.lv=='full'&&Math.abs(s.vis-m.full)<3&&s.rest,{s,m});
 const up=await box('#inv7 .sheet');ok('full view leaves the hotbar visible and fits the window',up.top>=0&&up.top+up.h<=bar.top+8,up);
 // tap toggles
 const h2=await box('#inv7 header');await p.mouse.click(h2.left+h2.w*.5,h2.top+12);await sleep(900);s=await st();ok('a tap on the header toggles back to expanded',s.lv=='half'&&s.rest,s);
 // a small wobble is not a drag
 const h3=await box('#inv7 header');await p.mouse.move(h3.x,h3.top+24);await p.mouse.down();await p.mouse.move(h3.x,h3.top+21);await p.mouse.up();await sleep(800);s=await st();ok('moving under the threshold does not drag, it counts as a tap',s.lv=='full',s);await p.keyboard.press('PageDown');await sleep(800);
 // clicking tiles never moves them; scrolling the grid does not drag
 const k0=await p.evaluate(()=>INV7.list.slice(0,6).join());const t=await box('#inv7 .it7');await p.mouse.click(t.x,t.y);await sleep(200);await p.mouse.move(t.x,t.y);await p.mouse.wheel(0,300);await sleep(300);const k1=await p.evaluate(()=>INV7.list.slice(0,6).join());ok('selecting and scrolling never move an item, and the drawer stays put',k0==k1&&(await st()).lv=='half',{k0,k1});
 // keys
 await p.evaluate(()=>INV7.select(INV7.list[0]));await p.keyboard.press('ArrowRight');await sleep(120);ok('arrows move the selection',await p.evaluate(()=>INV7.selK===INV7.list[1]));const f0=await p.evaluate(()=>INV7.filter);await p.keyboard.press(']');await sleep(250);ok('] changes category',await p.evaluate(f=>INV7.filter!=f,f0));await p.keyboard.press('[');await sleep(250);await p.keyboard.press('PageUp');await sleep(800);ok('Page Up grows it',(await st()).lv=='full');await p.keyboard.press('PageDown');await sleep(800);ok('Page Down shrinks it',(await st()).lv=='half');
 // flick down closes
 const h4=await box('#inv7 header');await p.mouse.move(h4.x,h4.top+24);await p.mouse.down();for(let i=1;i<=5;i++){await p.mouse.move(h4.x,h4.top+24+i*70);await sleep(8)}await p.mouse.up();await sleep(700);s=await st();ok('a flick down closes it',!s.open,s);
 // drag up from the handle
 await p.waitForFunction(()=>document.getElementById('invh7').style.display!='none',null,{timeout:4000});const h5=await box('#invh7');await p.mouse.move(h5.x,h5.y);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(h5.x,h5.y-i*36);await sleep(16)}await sleep(60);await p.mouse.up();await sleep(900);s=await st();ok('dragging the handle up opens it, following the mouse',s.open&&s.rest&&s.vis>300,s);
 // the source panel, from real data, for every kind
 const src=await p.evaluate(()=>{const kinds={mat:208,block:3,weapon:'w:astralkat',tool:'w:wrench'};const o={};for(const n in kinds)o[n]={w:ITEMSRC.where(kinds[n]).map(q=>q.t),u:ITEMSRC.used(kinds[n]).map(q=>q.t)};const wear=Object.keys(WEAR).find(id=>WEAR[id].cost>0);o.wear={w:ITEMSRC.where('a:'+wear).map(q=>q.t),u:ITEMSRC.used('a:'+wear).map(q=>q.t)};const it=SHOP7.items.find(i=>i.cat=='charms');o.charm={w:ITEMSRC.where('id:'+it.id).map(q=>q.t),u:ITEMSRC.used('id:'+it.id).map(q=>q.t)};const wg=WINGS[0];o.wing={w:ITEMSRC.where('wing:'+wg.id).map(q=>q.t),u:ITEMSRC.used('wing:'+wg.id).map(q=>q.t)};return o});
 ok('every kind of item says where it comes from and what it is for',Object.values(src).every(v=>v.w.length&&v.u.length),src);
 ok('no invented drop rate appears anywhere in those answers',!/\d+\s?%/.test(JSON.stringify(src)));
 const ui=await p.evaluate(async()=>{INV7.filter='all';INV7.render();INV7.select(208);await new Promise(r=>setTimeout(r,100));document.querySelector('#inv7 [data-src=where]').click();await new Promise(r=>setTimeout(r,120));return{list:document.querySelectorAll('#inv7 .src-l li').length,rules:(document.querySelector('#inv7 .src-r')||{}).textContent}});ok('the panel shows the answer in place',ui.list>0&&/You own 6/.test(ui.rules)&&/traded/.test(ui.rules),ui);
 ok('World Lock and quest items are not offered for trade',await p.evaluate(()=>/Can.t be/.test(ITEMSRC.rules(17)[0])&&/Quest item/.test(ITEMSRC.rules(735)[0])));
 ok('no page errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',String(e).slice(0,600));process.exit(1)});
