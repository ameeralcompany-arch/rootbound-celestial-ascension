// Inventory (88-inventory.js): equip every item type by button, double-click, E / Enter, right-click menu and drag; unequip from the
// Equipped strip; search / filters / sorting; weapons ordered by rarity then power (inventory + store, WPOWER hook); drop; walking still
// works with the sheet open; no rebuild while nothing changes. node tests/inventory.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
async function enter(p,world){await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);await p.evaluate(w=>enterWorld(w),world||'invtest');await p.waitForTimeout(900)}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(guest);await enter(p);const E=(f,a)=>p.evaluate(f,a);const W8=ms=>p.waitForTimeout(ms||90);
 const env=await E(()=>{lvl=20;gems=0;WX6.force='clear';mobs.length=0;for(const id of['cinder','solarfang','popgun','blood','hammer'])if(WPN[id])own[id]=1;own.sniper=1;
  const hats=Object.keys(WEAR).filter(k=>WEAR[k].s=='hat'&&!(WEAR[k].lv>20)),boots=Object.keys(WEAR).filter(k=>WEAR[k].s=='boot'&&!(WEAR[k].lv>20));ownW[hats[0]]=1;ownW[boots[0]]=1;wear.hat='';wear.boot='';
  const ch=SHOP7.items.filter(i=>i.cat=='charms');SHOP7.grantLocal(ch[0],1);try{SHOP7.unequip(ch[0].id)}catch(_){}
  const wg=WINGS.filter(w=>wingOwned(w));try{wingUnequip()}catch(_){}inv[1]=40;inv[3]=12;renderBar();
  return{hat:hats[0],boot:boots[0],charm:ch[0].id,wing:wg.length?wg[0].id:null,sniperLv:WPN.sniper.lv}});
 // ---- opens with the key, never blocks walking
 await p.keyboard.press('i');await W8(400);ok('inventory opens with I',await E(()=>INV7.isOpen));
 const x0=await E(()=>P.x);await p.keyboard.down('d');await W8(500);await p.keyboard.up('d');ok('walking still works with the inventory open',(await E(()=>P.x))-x0>30);
 ok('Equipped strip shows 7 slots (hand, head, body, boots, gloves, wings, charm)',await E(()=>[...document.querySelectorAll('#inv7 .es8')].map(e=>e.dataset.slot).join()=='hand,hat,body,boot,glove,wings,charm'));
 // ---- weapons: the button, double-click, E, Enter
 await E(()=>{INV7.filter='weapons';INV7.render()});await W8(200);
 await p.click('#inv7 [data-k="w:cinder"]');await W8();await p.click('#inv7 aside [data-a="equip"]');await W8();
 ok('Equip button holds the weapon and shows it in the hand slot',await E(()=>wp=='cinder'&&document.querySelector('#inv7 .es8[data-slot=hand]').dataset.ek=='w:cinder'));
 await p.dblclick('#inv7 [data-k="w:solarfang"]');await W8(150);ok('double-click equips a weapon',await E(()=>wp=='solarfang'));
 await p.click('#inv7 [data-k="w:popgun"]');await W8();await p.keyboard.press('e');await W8();ok('E equips the selected weapon (and opens nothing else)',await E(()=>wp=='popgun'&&!dlgOpen));
 await p.click('#inv7 [data-k="w:cinder"]');await W8();await p.keyboard.press('Enter');await W8();ok('Enter equips the selected weapon',await E(()=>wp=='cinder'));
 await p.click('#inv7 [data-k="w:sniper"]');await W8();await E(()=>{msg=''});await p.keyboard.press('e');await W8();ok('E on an under-level weapon says why and changes nothing',await E(()=>wp=='cinder'&&/Reach level/.test(String(msg))));
 await p.click('#inv7 .es8[data-slot=hand] .ux8');await W8();ok('✕ on the hand slot puts the weapon away (fists)',await E(()=>wp=='fist'&&HOTBAR.cur==-1&&!document.querySelector('#inv7 .es8[data-slot=hand]').dataset.ek));
 // ---- wearables: right-click menu, drag onto the strip, unequip
 await E(()=>{INV7.filter='wear';INV7.render()});await W8(200);
 await p.click('#inv7 [data-k="a:'+env.hat+'"]',{button:'right'});await W8();const mh=await E(()=>!!document.querySelector('#ictx8 [data-c=p]'));await p.click('#ictx8 [data-c=p]');await W8();
 ok('right-click menu → Wear puts the hat on',mh&&await E(h=>wear.hat==h&&!document.querySelector('#ictx8'),env.hat));
 await p.click('#inv7 [data-k="a:'+env.hat+'"]',{button:'right'});await W8();await p.click('#ictx8 [data-c=hb3]');await W8();ok('right-click menu → hotbar slot 4',await E(h=>HOTBAR.slots[3]=='a:'+h,env.hat));
 await p.click('#inv7 [data-k="a:'+env.hat+'"]',{button:'right'});await W8();await p.keyboard.press('Escape');await W8();ok('Esc closes the menu first (the inventory stays open)',await E(()=>!document.querySelector('#ictx8')&&INV7.isOpen));
 await p.dragAndDrop('#inv7 [data-k="a:'+env.boot+'"]','#inv7 .es8[data-slot=boot]');await W8(150);ok('drag boots onto the Equipped strip wears them',await E(b=>wear.boot==b,env.boot));
 await p.click('#inv7 .es8[data-slot=hat] .ux8');await W8();await p.click('#inv7 .es8[data-slot=boot] .ux8');await W8();ok('✕ takes the hat and the boots off',await E(()=>wear.hat==''&&wear.boot==''));
 await p.dblclick('#inv7 [data-k="a:'+env.hat+'"]');await W8(150);ok('double-click wears a hat; double-click again takes it off',await E(h=>wear.hat==h,env.hat)&&(await p.dblclick('#inv7 [data-k="a:'+env.hat+'"]'),await W8(150),await E(()=>wear.hat=='')));
 // ---- wings + charm
 if(env.wing){await E(()=>{INV7.filter='wings';INV7.render()});await W8(200);await p.dblclick('#inv7 [data-k="wing:'+env.wing+'"]');await W8(150);
  ok('double-click wears wings (shown in the Wings slot)',await E(w=>curWing(lvl)&&curWing(lvl).id==w&&document.querySelector('#inv7 .es8[data-slot=wings]').dataset.ek=='wing:'+w,env.wing));
  await p.click('#inv7 .es8[data-slot=wings] .ux8');await W8();ok('✕ takes the wings off',await E(()=>!curWing(lvl)));
  await p.dragAndDrop('#inv7 [data-k="wing:'+env.wing+'"]','#inv7 .es8[data-slot=wings]');await W8(150);ok('drag wings onto the strip wears them',await E(w=>curWing(lvl)&&curWing(lvl).id==w,env.wing))}
 else ok('wings available at level 20',false,'no owned wing');
 await E(()=>{INV7.filter='charms';INV7.render()});await W8(200);await p.click('#inv7 [data-k="id:'+env.charm+'"]');await W8();await p.click('#inv7 aside [data-a="equip"]');await W8();
 ok('charm: Equip button (shown in the Charm slot)',await E(c=>SHOP7.equipped(c)&&document.querySelector('#inv7 .es8[data-slot=charm]').dataset.ek=='id:'+c,env.charm));
 await p.click('#inv7 .es8[data-slot=charm] .ux8');await W8();ok('✕ unequips the charm',await E(c=>!SHOP7.equipped(c),env.charm));
 // ---- blocks: hold, drop
 await E(()=>{INV7.filter='blocks';INV7.render()});await W8(200);await p.dblclick('#inv7 [data-k="1"]');await W8(150);ok('double-click a block holds it (on the hotbar)',await E(()=>HOTBAR.held()===1&&wp=='fist'));
 const d0=await E(()=>({n:cnt(1),d:drops.length}));await p.click('#inv7 [data-k="1"]',{button:'right'});await W8();await p.click('#ictx8 [data-c=d1]');await W8();
 const d1=await E(()=>({n:cnt(1),d:drops.length,k:drops.length?drops[drops.length-1].k:null}));ok('right-click → Drop 1 throws one Dirt on the ground',d1.n==d0.n-1&&d1.d==d0.d+1&&d1.k===1,[d0,d1]);
 // ---- tabs, search, sorting
 const tabs=await E(()=>{const o={};for(const f of['tools','wear','weapons']){INV7.filter=f;INV7.render();o[f]=INV7.list}INV7.filter='all';INV7.render();return o});
 ok('Tools tab lists only tools, Gear only wearables, Weapons no tools',tabs.tools.length>=5&&await E(t=>t.tools.every(k=>WPN[k.slice(2)].k=='tool')&&t.wear.every(k=>k.startsWith('a:'))&&t.weapons.every(k=>k.startsWith('w:')&&WPN[k.slice(2)].k!='tool'),tabs),tabs.tools);
 await p.fill('#inq7','fang');await W8(150);const sq=await E(()=>INV7.list.map(k=>INV7.nameOf(k)));ok('search narrows the list (all match "fang")',sq.length>0&&sq.every(n=>/fang/i.test(n)),sq);
 await p.press('#inq7','Enter');await W8();ok('Enter in the search selects the first match',await E(()=>INV7.selK===INV7.list[0]));
 await p.fill('#inq7','');await W8(100);
 const ord=await E(()=>{INV7.filter='weapons';INV7.sortBy='default';INV7.q='';INV7.render();const L=INV7.list.filter(k=>own[k.slice(2)]);const t=L.map(k=>ITEM7.tier(k)),pw=L.map(k=>ITEM7.power(k));
  let good=true;for(let i=1;i<L.length;i++){if(t[i]>t[i-1]||t[i]==t[i-1]&&pw[i]>pw[i-1])good=false}const chip=document.querySelector('#inv7 .it7[data-k="'+L[0]+'"] .pw7');return{good,L,t,pw,chip:chip&&chip.textContent,p0:pw[0]}});
 ok('weapons tab (default order): rarity first (mythic → common), then power high → low',ord.good&&ord.L.length>=5,ord);
 ok('weapon tiles show their power number',ord.chip=='⚔'+ord.p0,ord.chip);
 const so=await E(()=>{const o={};INV7.sortBy='name';INV7.render();const n=INV7.list.filter(k=>own[k.slice(2)]).map(k=>INV7.nameOf(k));o.name=n.every((v,i)=>!i||n[i-1].localeCompare(v)<=0);
  INV7.sortBy='power';INV7.render();const pw=INV7.list.filter(k=>own[k.slice(2)]).map(k=>ITEM7.power(k));o.power=pw.every((v,i)=>!i||pw[i-1]>=v);
  INV7.sortBy='rar';INV7.render();const t=INV7.list.filter(k=>own[k.slice(2)]).map(k=>ITEM7.tier(k));o.rar=t.every((v,i)=>!i||t[i-1]>=v);
  INV7.sortBy='default';INV7.render();return o});ok('sort by name / power / rarity',so.name&&so.power&&so.rar,so);
 // WPOWER (combat balance module) decides the power number when present
 const wpw=await E(()=>{const ids=INV7.list.filter(k=>own[k.slice(2)]&&ITEM7.tier(k)==ITEM7.tier(INV7.list.filter(x=>own[x.slice(2)])[0]));window.WPOWER=id=>id=='cinder'?9999:1;INV7.render();
  const L=INV7.list.filter(k=>own[k.slice(2)]),c=L.indexOf('w:cinder'),before=L.slice(0,c).every(k=>ITEM7.tier(k)>ITEM7.tier('w:cinder'));const pv=ITEM7.power('w:cinder');delete window.WPOWER;INV7.render();return{before,pv}});
 ok('window.WPOWER(id) drives the power number and the order within a rarity',wpw.pv==9999&&wpw.before,wpw);
 // store weapons: same order by default, power chips
 const st=await E(async()=>{INV7.close();STORE7.open();STORE7.setFilter({cat:'weapons',sort:'feat',q:'',rar:'all',owned:false});await new Promise(r=>setTimeout(r,300));const RO={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5,exclusive:6};
  const L=STORE7.list();let good=true;for(let i=1;i<L.length;i++){const a=L[i-1],c=L[i];if(RO[c.rar]>RO[a.rar]||RO[c.rar]==RO[a.rar]&&ITEM7.power('w:'+c.ref)>ITEM7.power('w:'+a.ref))good=false}
  const chips=document.querySelectorAll('#store7 .card .pw8').length,cards=document.querySelectorAll('#store7 .card').length;STORE7.setFilter({sort:'pow'});const L2=STORE7.list().map(i=>i.id).join();STORE7.close();return{good,n:L.length,chips,cards,same:L2==L.map(i=>i.id).join()}});
 ok('store weapons: rarity then power by default (and the "Power" sort), every card shows its power',st.good&&st.n>10&&st.chips==st.cards&&st.same,st);
 // ---- perf: nothing is rebuilt while nothing changes
 await W8(300);await p.keyboard.press('i');await W8(400);const pf=await E(async()=>{let m=0;const ob=new MutationObserver(r=>{m+=r.length});ob.observe(document.getElementById('inv7'),{childList:true,subtree:true,attributes:true,characterData:true});for(let i=0;i<40;i++)await new Promise(r=>requestAnimationFrame(r));ob.disconnect();return m});
 ok('the open inventory does no DOM work while nothing changes',pf==0,pf);
 await p.keyboard.press('Escape');await W8(300);ok('Esc closes the inventory',await E(()=>!showInv));
 ok('no page errors',errs.length==0,errs.join('|'));
 await b.close();console.log(fails?fails+' inventory test(s) FAILED':'all inventory tests passed');process.exit(fails?1:0)})();
