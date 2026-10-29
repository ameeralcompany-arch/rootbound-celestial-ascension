// NPC tests + visual check (headless). Run: node tests/npc.js [shotDir]   (CHROMIUM=/path/to/chromium if needed)
// Enters the Plaza, screenshots NPCs over ~10 s, checks they never stand inside blocks, that the shop / smith / quest dialogs still open, and measures frame cost.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.argv[2]||'';
let fails=0;const ok=(n,c,d)=>{console.log((c?'PASS ':'FAIL ')+n+(d?'  - '+d:''));if(!c)fails++};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=8;if(cur!='plaza')enterWorld('plaza')});await p.waitForTimeout(900);
 const has2=await p.evaluate(()=>typeof NPC2!='undefined');
 const shot=async(name)=>{if(!SHOTS)return;fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,name+'.png')})};
 const goTo=async(dx)=>{await p.evaluate(dx=>{P.x=(DX+dx)*T+T/2;P.y=sh(DX)*T-P.h-1;P.vx=P.vy=0;const vw=cv.width/ZM,vh=cv.height/ZM;cam.x=Math.max(0,Math.min(W*T-vw,P.x-vw/2));cam.y=Math.max(-200,Math.min(H*T-vh,P.y+P.h/2-vh/2))},dx)};
 const all=()=>p.evaluate(()=>(typeof NPC2!='undefined'?NPC2.list():NPCS).map(n=>({id:n.id,x:n.wx!=null?n.wx:n.x*T+T/2,y:n.wy!=null?n.wy:sh(DX)*T,st:n.st||'',on:n.on!==false,fly:!!n.fly})));
 // --- frame cost in the Plaza (camera on the hub)
 await goTo(0);await p.waitForTimeout(500);
 const perf=await p.evaluate(()=>new Promise(res=>{let n=0,ms=0,nm=0;const d0=draw,dn0=drawNPCs;draw=function(){const t=performance.now();d0.apply(this,arguments);ms+=performance.now()-t;n++};drawNPCs=function(){const t=performance.now();dn0.apply(this,arguments);nm+=performance.now()-t};let f=0;const t0=performance.now();const tick=()=>{f++;if(performance.now()-t0<3000)requestAnimationFrame(tick);else{draw=d0;drawNPCs=dn0;res({fps:Math.round(f/3),drawMs:+(ms/n).toFixed(3),npcMs:+(nm/n).toFixed(3)})}};requestAnimationFrame(tick)}));
 console.log('PERF plaza hub: '+JSON.stringify(perf));
 // --- screenshots of the hub over ~10 s + solid-tile check sampling
 const bad=[];let samples=0;const ids=new Set();
 const sample=async()=>{for(const n of await all()){ids.add(n.id);if(!n.on||n.fly)continue;samples++;const r=await p.evaluate(q=>{const c=Math.floor(q.x/T),r0=Math.floor((q.y-2)/T);return{inside:solidAt(c,r0)||solidAt(c,r0-1),ground:solidAt(c,r0+1),oob:c<1||c>=W-1,row:Math.abs(q.y-sh(DX)*T)<1}},n);if(r.inside||!r.ground||r.oob||!r.row)bad.push(n.id+'@'+Math.round(n.x/48-128)+':'+JSON.stringify(r))}};
 for(let i=0;i<5;i++){await shot('hub_'+i);await sample();await p.waitForTimeout(2000)}
 await p.evaluate(()=>setZoom(2));for(const [nm,dx] of [['zoom_mira',-21],['zoom_oak',19],['zoom_bram',40],['zoom_mage',-37],['zoom_guard',54]]){await goTo(dx);await p.waitForTimeout(1300);await shot(nm);await sample()}await p.evaluate(()=>setZoom(1));
 // walk past the town: artisan lane, Hana's field, Gate Square, warriors' row, the far west and east ends
 for(const [nm,dx] of [['west',-50],['garden',-63],['gate',9],['east',72],['field',-100],['arcane',110]]){await goTo(dx);await p.waitForTimeout(1600);await shot(nm+'_a');await sample();await p.waitForTimeout(1800);await shot(nm+'_b');await sample()}
 // night: special NPCs
 await p.evaluate(()=>{window._clk=clock;clock=()=>.5});await p.waitForTimeout(1500);
 for(const [nm,dx] of [['night_hub',-6],['night_crypt',-86]]){await goTo(dx);await p.waitForTimeout(1800);await shot(nm);await sample()}
 await p.evaluate(()=>{clock=window._clk});
 ok('NPCs never stand inside blocks and always have ground under them ('+samples+' samples)',bad.length==0,bad.slice(0,6).join(' | '));
 const fin=await all();ok('NPC count and positions sane',fin.length>=3&&fin.length<=16&&fin.every(n=>isFinite(n.x)&&isFinite(n.y)&&n.x>0&&n.x<256*48),fin.length+' npcs');
 // --- close-up near Mira with nameplate + greeting
 await goTo(-19);await p.waitForTimeout(1400);await shot('near_mira');await goTo(28);await p.waitForTimeout(1400);await shot('near_oak_bram');
 // --- dialogs via interact (player stands at each service NPC)
 const dl=await p.evaluate(()=>{const o={};const at=id=>{const n=NPCS.find(q=>q.id==id);const x=n.wx!=null?n.wx:n.x*T+T/2;P.x=x+10;P.y=sh(DX)*T-P.h-1;P.vx=P.vy=0;if(dlgOpen)closeDlg();interact();const h=document.getElementById('dlg');return{open:dlgOpen&&h.style.display=='block',who:curNPC&&curNPC.id,html:h.innerHTML}};
  let r=at('mira');o.mira=r.open&&r.who=='mira'&&/data-a="buy:/.test(r.html)&&/tab:sell/.test(r.html);dlgAct('tab:sell');o.sell=/Sell|Nothing to sell/.test(document.getElementById('dlg').innerHTML);dlgAct('tab:buy');gems=1000;const c0=cnt(1);dlgAct('buy:1:1');o.buy=cnt(1)==c0+1;closeDlg();
  r=at('bram');o.bram=r.open&&r.who=='bram'&&/data-a="up"/.test(r.html);closeDlg();
  r=at('oak');o.oak=r.open&&r.who=='oak'&&/claim:0/.test(r.html);closeDlg();
  if(typeof NPC2!='undefined'){const amb=NPC2.list().filter(n=>!n.k||n.k=='talk').filter(n=>n.on!==false&&(!n.night||n.alpha>.6));o.amb=amb.map(n=>{P.x=n.wx+8;P.y=(n.fly?sh(DX)*T:n.wy)-P.h-1;if(dlgOpen)closeDlg();const nn=nearNPC();if(!nn||nn.id!=n.id)return n.id+':notnear('+(nn&&nn.id)+')';interact();const h=document.getElementById('dlg').innerHTML,okk=dlgOpen&&/data-a="talk:next"/.test(h);dlgAct('talk:next');const h2=document.getElementById('dlg').innerHTML;closeDlg();return okk&&h2.length>40?'ok':n.id+':bad'})}
  return o});
 ok('Mira shop dialog opens via interact, buy + sell tabs work',dl.mira&&dl.sell&&dl.buy,JSON.stringify(dl));ok('Bram smith dialog opens via interact',dl.bram);ok('Elder Oak quest dialog opens via interact',dl.oak);
 if(has2)ok('every ambient NPC is talkable when near and has dialogue',dl.amb&&dl.amb.every(x=>x=='ok'),JSON.stringify(dl.amb));
 // --- talking turns the NPC toward the player; screenshot with an open dialog
 if(has2){const tk=await p.evaluate(async()=>{const n=NPCS.find(q=>q.id=='bram');P.x=n.wx-60;P.y=sh(DX)*T-P.h-1;if(dlgOpen)closeDlg();interact();await new Promise(r=>setTimeout(r,700));const o={st:n.st,face:n.face};closeDlg();return o});ok('talking NPC faces the player',tk.face==-1&&tk.st=='talk',JSON.stringify(tk))}
 await goTo(-21);await p.evaluate(()=>{const n=NPCS[0];P.x=(n.wx||n.x*T)+40;interact()});await p.waitForTimeout(900);await shot('dialog_mira');await p.evaluate(()=>closeDlg());
 // --- NPCs only in the plaza
 const other=await p.evaluate(async()=>{enterWorld('npctest');await new Promise(r=>setTimeout(r,1500));const o={near:nearNPC()};o.n=(typeof NPC2!='undefined'?NPC2.list().filter(n=>n.on!==false&&n.vis).length:0);enterWorld('plaza');await new Promise(r=>setTimeout(r,800));return o});
 ok('NPCs leave with the plaza (none talkable elsewhere unless ambient travelers)',other.near===null||other.near.amb,JSON.stringify(other));
 ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all npc tests passed');process.exit(fails?1:0)})();
