// Quality-of-life features: avatar frames + portrait backgrounds (AVF10), milestones for everything (MILE10), the starting guide
// (GUIDE10) and the store's "Can buy now" shelf and filter. node tests/qol.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},200000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const p=await b.newPage({viewport:{width:1400,height:800}});const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::|AudioContext/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}enterWorld('qolw')});await p.waitForTimeout(2500);const E=(f,a)=>p.evaluate(f,a);
 // ---- avatar frames
 let r=await E(()=>({n:AVF10.FR.length,bgs:AVF10.BG.length,cv:!!document.getElementById('pframe10'),dark:AVF10.FR.some(f=>f[0]=='shadow'),bubbly:AVF10.FR.some(f=>f[0]=='bubble')}));
 ok('21 avatar frames (a dark Shadow Veil and a bubbly Bubblegum among them) and 12 portrait backgrounds; the frame sits on the HUD portrait',r.n==21&&r.bgs==12&&r.cv&&r.dark&&r.bubbly,r);
 r=await E(()=>{const ids=['moonrose','moondrape','pearlfall','nightcrown','moonjewel','lightlord','chronicle'],o={};for(const id of ids){const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');let ink=0;try{AVF10.ART[id](x);const d=x.getImageData(0,0,96,96).data;for(let i=3;i<d.length;i+=4)if(d[i]>0)ink++;const hole=x.getImageData(48,48,1,1).data[3];o[id]={ink,hole}}catch(e){o[id]={err:e.message}}}return o});
 ok('the 7 moonlit frames all draw, and leave the portrait in the middle clear',Object.values(r).length==7&&Object.values(r).every(v=>v.ink>2000&&v.hole==0),r);
 await E(()=>{lvl=1});await p.click('#pwrap9');await p.waitForTimeout(400);
 r=await E(()=>{const el=document.getElementById('avf10'),lk=el.querySelector('button[data-f="shadow"]');return{open:el.classList.contains('on'),locked:lk.disabled}});
 ok('clicking the portrait opens the avatar picker; frames above your level are locked',r.open&&r.locked,r);
 r=await E(()=>{lvl=60;AVF10.close();AVF10.open();document.querySelector('#avf10 button[data-f="shadow"]').click();const px=document.getElementById('pframe10').getContext('2d').getImageData(96,8,1,1).data;
  document.querySelector('#avf10 button[data-b="night"]').click();AVF10.close();return{f:AVF10.frame,bg:AVF10.bgId,ink:px[3]>0}});
 await p.waitForTimeout(900);ok('choosing a frame and a background applies them (and they are saved)',r.f=='shadow'&&r.bg=='night'&&(await E(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>/rbframe$/.test(k)))).f))=='shadow',r);
 // ---- milestones
 r=await E(async()=>{const g0=gems;const i0=MILE10.state.i.kill|0;stats.kill=Math.max(stats.kill|0,MILE10.target(MILE10.KINDS.kill[1],i0)-1);const g1=gems;stat('kill',1);const g2=gems;stat('kill',0);const g3=gems;return{paid:g2>g1,once:g3==g2,rung:MILE10.state.i.kill>i0}});
 ok('reaching a milestone pays gems once (no double pay), and the ladder moves to the next rung',r.paid&&r.once&&r.rung,r);
 r=await E(()=>Object.keys(MILE10.KINDS).length);ok('milestone ladders for every activity (blocks, building, monsters, farming, fish, worlds, letters, words, totems, walking)',r>=11,r);
 // ---- the starting guide
 await p.keyboard.press('F1');await p.waitForTimeout(400);r=await E(()=>({open:GUIDE10.isOpen,pages:GUIDE10.PAGES.length}));
 await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);const pg=await E(()=>GUIDE10.page);await p.keyboard.press('Escape');await p.waitForTimeout(300);
 ok('F1 opens the starting guide (6 pages: what the game is, controls, the hidden words and realms, classes, rewards); arrows turn pages, Esc closes',r.open&&r.pages==6&&pg==1&&!(await E(()=>GUIDE10.isOpen)),{r,pg});
 // ---- store: can buy now
 r=await E(()=>{gems=500;lvl=6;STORE7.open();const h=[...document.querySelectorAll('#store7 .grid h4')].map(x=>x.textContent);STORE7.setFilter({cat:'all',buy:true});const L=STORE7.list();const good=L.length>0&&L.every(i=>i.price<=gems&&(i.lv|0)<=lvl);const cant=document.querySelectorAll('#store7 .card.cant').length;
  STORE7.setFilter({buy:false});const cant2=document.querySelectorAll('#store7 .card.cant').length;STORE7.close();return{shelf:h[0],good,n:L.length,cant,cant2}});
 ok('the store opens on a "You can buy now" shelf; the Can buy now filter lists only what you can afford and use; unaffordable prices are marked',/can buy now/i.test(r.shelf||'')&&r.good&&r.cant==0&&r.cant2>0,r);
 ok('no page errors',errs.length==0,errs.slice(0,5));
 console.log(fails?'FAILURES '+fails:'all qol tests passed');await b.close();process.exit(fails?1:0)})();
