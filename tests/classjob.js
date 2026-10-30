// Class jobs (86-z-classjob.js): before choosing, every weapon works; talking to a class master offers "Become a <class>" with a confirm;
// after choosing only that class's weapons work (fist + tools always), other weapons are blocked in use and shown locked on the hotbar;
// a starter weapon is given when you own none of the class; another master refuses to teach until your class is level 10, then teaches;
// learned classes can be switched at their master and in Hub > Classes; state survives reload; creative mode has no limits. node tests/classjob.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 p.on('console',m=>{if(m.type()=='error'&&/CJOB/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(guest);const E=(f,a)=>p.evaluate(f,a);
 const enter=async(reload)=>{if(reload)await p.reload();else await p.goto(URL);await p.waitForTimeout(900);await E(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
  await E(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);await E(()=>enterWorld('plaza'));await p.waitForTimeout(1200)};
 await enter();
 // talk to a class master: walk up to them and press interact; returns the dialog text
 const talk=id=>E(async id=>{if(dlgOpen)closeDlg();const n=NPC2.list().find(n=>n.id==id);P.x=n.wx;P.y=n.wy-P.h-1;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,250));P.x=n.wx;interact();await new Promise(r=>setTimeout(r,120));return{open:dlgOpen,id:curNPC&&curNPC.id,txt:dlg.textContent}},id);
 const click=a=>E(async a=>{const el=dlg.querySelector('[data-a="'+a+'"]');if(!el||el.disabled)return false;el.click();await new Promise(r=>setTimeout(r,120));return true},a);
 const use=id=>E(id=>{own[id]=1;wp=id;wcd=0;const before=wp;try{useWeapon()}catch(_){}return{held:wp,ok:wp==before}},id);
 await E(()=>{lvl=40;own.ember=1;own.arcane=1;own.hammer=1;try{for(const k in CLASS7.S.lv)CLASS7.S.lv[k]=1}catch(_){}});
 ok('no class at the start',await E(()=>CJOB.cur===null));
 const u0=await use('ember');ok('before choosing, any weapon works',u0.ok,u0);
 const d1=await talk('seren');ok('Seren (mage master) offers Become a Mage',d1.open&&/Become a Mage/.test(d1.txt),d1.txt.slice(0,240));
 ok('clicking asks to confirm first',await click('talk:job')&&await E(()=>/Yes, become a Mage/.test(dlg.textContent)&&CJOB.cur===null));
 ok('confirming makes you a Mage',await click('talk:jobok')&&await E(()=>CJOB.cur=='mage'&&CJOB.learned.join()=='mage'));
 const held=await E(()=>({wp,cls:CLASS7.of(WPN[wp])}));ok('a mage weapon is put in your hand',held.cls=='mage',held);
 const u1=await use('ember');ok('a knight weapon is blocked for a mage',!u1.ok,u1);
 ok('fist and tools still work, mage weapons work',(await use('fist')).ok&&(await use('arcane')).ok&&await E(()=>!CJOB.blocks('pip')&&!CJOB.blocks('glimmer')));
 ok('hotbar shows the knight weapon locked',await E(()=>{HOTBAR.set(6,'w:ember',{quiet:1});return HOTBAR.state('w:ember')=='lock'}));
 const d2=await talk('kael');ok('Kael (knight) refuses until your mage is level 10',/Reach level 10 as a Mage/.test(d2.txt)&&!(await click('talk:job')),d2.txt.slice(0,240));
 await E(()=>{CLASS7.S.lv.mage=10});const d3=await talk('kael');ok('at mage level 10 Kael offers to teach Knight',/Learn Knight/.test(d3.txt),d3.txt.slice(0,240));
 ok('learning Knight switches you to Knight',await click('talk:job')&&await click('talk:jobok')&&await E(()=>CJOB.cur=='knight'&&CJOB.learned.join()=='mage,knight'));
 ok('now knight weapons work and mage ones are blocked',(await use('ember')).ok&&!(await use('arcane')).ok);
 const st=await E(()=>{own.titanmaul=0;const had=!!own.titanmaul;return had});
 const d4=await talk('seren');ok('Seren offers to switch back to Mage',/Switch to Mage/.test(d4.txt));await click('talk:job');ok('switched back to Mage without a level check',await E(()=>CJOB.cur=='mage'));
 // starter weapon for a class you own nothing of
 await E(()=>{CLASS7.S.lv.mage=12;for(const id of CLASS7.C.berserker.ids)own[id]=0});const d5=await talk('bram');await click('talk:job');await click('talk:jobok');
 const gift=await E(()=>({cur:CJOB.cur,owns:CLASS7.C.berserker.ids.filter(id=>own[id]),wp,cls:CLASS7.of(WPN[wp])}));ok('a starter weapon is given for a new class',gift.cur=='berserker'&&gift.owns.length>=1,gift);
 // hub tab
 const hub=await E(async()=>{if(dlgOpen)closeDlg();UI6.open('classes');await new Promise(r=>setTimeout(r,250));const d=document.getElementById('cjob'),t=d&&d.textContent;const bt=d&&d.querySelector('[data-cj=mage]');if(bt)bt.click();await new Promise(r=>setTimeout(r,150));const c=CJOB.cur;try{UI6.close()}catch(_){}return{t,c}});
 ok('Hub > Classes shows your class and switches between learned ones',hub.t&&/You are a Berserker/.test(hub.t)&&hub.c=='mage',hub);
 // saved
 await E(()=>{try{saveP()}catch(_){}});await enter(true);
 ok('class choice survives reload',await E(()=>CJOB.cur=='mage'&&CJOB.learned.join()=='mage,knight,berserker'));
 ok('lock still applies after reload',!(await use('ember')).ok);
 ok('no page errors',errs.length==0,errs.slice(0,4));
 console.log(fails?fails+' FAILED':'all classjob tests passed');await b.close();process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
