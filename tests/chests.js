// Storage chests (97-chestui.js + 91-objects.js): open with E even when boxed in by blocks, click / shift / right / ctrl-click moves,
// take all, deposit matching, deposit all (hotbar items stay), sort, search, stack merging, capacity + 9999 stacks, drag & drop,
// rename + colour, no loss or duplication under rapid clicking, breaking a full chest loses nothing, saves per world across a world
// change + reload, closes when you walk away / E / Esc, works with the 7-slot hotbar. node tests/chests.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
async function enter(p,world,reload){if(reload)await p.reload();else await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);await p.evaluate(w=>enterWorld(w),world);await p.waitForTimeout(900)}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(guest);await enter(p,'chesta');const E=(f,a)=>p.evaluate(f,a);const W8=ms=>p.waitForTimeout(ms||80);
 // a chest right next to the player, walled in by stone on the far side and above (the player stands in the open next to it)
 const place=()=>E(()=>{meta=null;WX6.force='clear';mobs.length=0;P.vx=0;const px=Math.floor(P.x/T),py=Math.floor((P.y+P.h-1)/T),k=py*W+px+1;for(const q of[k,k-W,k+1,k+1-W,k-W-W])trees.delete(q);
  tiles[k]=27;pushEdit(k);tiles[k+1]=3;pushEdit(k+1);tiles[k-W]=3;pushEdit(k-W);tiles[k+1-W]=3;pushEdit(k+1-W);for(const q of[k-1,k-1-W,k-1-W-W]){if(tiles[q]&&q!=k)tiles[q]=0}window._k=k;return k});
 const k=await place();await W8(200);
 await E(()=>{inv={};inv[1]=50;inv[3]=30;inv[8]=7;inv[205]=9;barDirty=1;HOTBAR.set(4,1,{quiet:1});renderBar()});await W8(200);
 await p.keyboard.press('e');await W8(250);ok('E opens the chest even when it is boxed in by blocks',await E(k=>CHEST6.k==k&&document.getElementById('chestui').style.display=='block',k));
 const tot=id=>E(([k,id])=>cnt(id)+(OBJ[k].c.it.find(x=>x[0]==id)||[0,0])[1],[k,id]);
 // ---- clicks
 await p.click('#chestui [data-m=put][data-i="3"]');await W8();let s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n:cnt(3)}),k);ok('click a backpack item stores 1',s.c=='3:1'&&s.n==29,s);
 await p.click('#chestui [data-m=put][data-i="3"]',{modifiers:['Shift']});await W8();s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n:cnt(3)}),k);ok('shift-click stores the whole stack (merged into one slot)',s.c=='3:30'&&s.n==0,s);
 await p.click('#chestui [data-m=take][data-i="3"]',{modifiers:['Control']});await W8();s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n:cnt(3)}),k);ok('ctrl-click takes half',s.c=='3:15'&&s.n==15,s);
 await p.click('#chestui [data-m=take][data-i="3"]',{button:'right'});await W8();s=await E(k=>({c:OBJ[k].c.it.length,n:cnt(3)}),k);ok('right-click takes the whole stack',s.c==0&&s.n==30,s);
 // ---- hotbar: storing the whole held stack greys its slot, taking it back lights it up
 await p.click('#chestui [data-m=put][data-i="1"]',{modifiers:['Shift']});await W8(350);ok('storing all of a hotbar block leaves its slot greyed (7-slot bar)',await E(()=>/st-out/.test(document.querySelector('#bar .s6[data-i="4"]').className)&&document.querySelectorAll('#bar .s6').length==7));
 await p.click('#chestui [data-m=take][data-i="1"]',{modifiers:['Shift']});await W8(350);ok('taking it back lights the slot up again',await E(()=>/st-ok/.test(document.querySelector('#bar .s6[data-i="4"]').className)));
 // ---- buttons
 await E(k=>{OBJ[k].c.it=[[8,2],[205,1]];CHEST6.render()},k);await p.click('#chestui [data-a=match]');await W8();s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n8:cnt(8),n205:cnt(205),n1:cnt(1)}),k);
 ok('Deposit matching stores only what the chest already holds',s.c=='8:9,205:10'&&s.n8==0&&s.n205==0&&s.n1==50,s);
 await p.click('#chestui [data-a=putall]');await W8();s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n1:cnt(1),n3:cnt(3)}),k);ok('Deposit all stores everything except hotbar items',s.n1==50&&s.n3==0&&/3:30/.test(s.c),s);
 await p.click('#chestui [data-a=sort]');await W8();s=await E(k=>OBJ[k].c.it.map(x=>x[0]),k);ok('Sort orders the chest (blocks before materials)',s.indexOf(205)>s.indexOf(3)&&s.indexOf(205)>s.indexOf(8),s);
 await p.click('#chestui [data-a=takeall]');await W8();s=await E(k=>({c:OBJ[k].c.it.length,n3:cnt(3),n8:cnt(8),n205:cnt(205)}),k);ok('Take all empties the chest into the backpack',s.c==0&&s.n3==30&&s.n8==9&&s.n205==10,s);
 // ---- search filters both sides
 await E(k=>{OBJ[k].c.it=[[3,5],[205,2]];CHEST6.render()},k);await p.fill('#chq8','stone');await W8(120);
 s=await E(()=>({c:[...document.querySelectorAll('#chestui [data-m=take]')].map(e=>+e.dataset.i),b:[...document.querySelectorAll('#chestui [data-m=put]')].map(e=>+e.dataset.i)}));ok('search filters the chest and the backpack',s.c.join()=='3'&&s.b.join()=='3',s);
 await p.fill('#chq8','');await W8(100);
 // ---- drag & drop between the panes
 await p.dragAndDrop('#chestui [data-m=take][data-i="205"]','#chestui [data-drop=put]');await W8(120);s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n:cnt(205)}),k);ok('drag a chest tile to the backpack moves its stack',s.c=='3:5'&&s.n==12,s);
 await p.dragAndDrop('#chestui [data-m=put][data-i="8"]','#chestui [data-drop=take]');await W8(120);s=await E(k=>({c:OBJ[k].c.it.map(x=>x.join(':')).join(),n:cnt(8)}),k);ok('drag a backpack tile into the chest stores its stack',s.c=='3:5,8:9'&&s.n==0,s);
 // ---- capacity + 9999 stacks + merging old duplicate data
 const cap=await E(k=>{const o=OBJ[k];o.c.it=[];const ids=Object.keys(BLK).map(Number).filter(i=>i>0&&i<20&&i!=17).concat(Object.keys(MAT).map(Number)).slice(0,25);for(const i of ids)inv[i]=(inv[i]|0)+2;
  let m=0;for(const i of ids.slice(0,24))m+=CHEST6.move(k,'put',i,1,1);const n25=cnt(ids[24]),r=CHEST6.move(k,'put',ids[24],1,1);CHEST6.render();return{len:o.c.it.length,m,r,n25b:cnt(ids[24])==n25,txt:document.querySelector('#chestui .cap8').textContent}},k);
 ok('capacity: a Treasure Chest holds 24 item types, the 25th is refused (nothing lost)',cap.len==24&&cap.m==24&&cap.r==0&&cap.n25b&&/^24 \/ 24 slots/.test(cap.txt),cap);
 const big=await E(k=>{const o=OBJ[k];o.c.it=[[1,9990]];inv[1]=20;const r=CHEST6.move(k,'put',1,20);return{r,c:o.c.it[0][1],n:cnt(1)}},k);ok('a 9999 stack takes only what fits; the rest stays in the backpack',big.r==9&&big.c==9999&&big.n==11,big);
 const mg=await E(()=>cleanObj({t:27,c:{it:[[1,3],[1,4],[5,2]],col:4,nm:'Mine'}}),0);ok('old data with duplicate stacks merges on load (and keeps the colour)',JSON.stringify(mg.c.it)=='[[1,7],[5,2]]'&&mg.c.col==4,mg.c);
 // ---- rapid clicking never loses or duplicates
 await E(k=>{OBJ[k].c.it=[[3,40]];inv[3]=40;CHEST6.render()},k);const t0=await tot(3);
 for(let i=0;i<40;i++){const sel=i%3==0?'#chestui [data-m=take][data-i="3"]':'#chestui [data-m=put][data-i="3"]';const el=await p.$(sel);if(el)await el.click({modifiers:i%5==0?['Shift']:[],delay:0}).catch(()=>{})}
 await W8(150);const t1=await tot(3);ok('40 rapid clicks both ways: Stone total unchanged ('+t0+')',t1==t0,[t0,t1]);
 // ---- rename + colour
 await p.click('#chestui [data-a=ren]');await W8(150);await p.fill('#dlg7 input','Ore Box');await p.click('#dlg7 [data-ok]');await W8(250);await p.click('#chestui [data-col="2"]');await W8();
 ok('rename + colour the chest',await E(k=>OBJ[k].c.nm=='Ore Box'&&OBJ[k].c.col==2&&document.querySelector('#chestui .nm8').textContent=='Ore Box',k));
 // ---- closing: E, Esc, walking away
 await p.keyboard.press('e');await W8(150);ok('E closes the chest window',await E(()=>CHEST6.k==-1));
 await p.keyboard.press('e');await W8(150);await p.keyboard.press('Escape');await W8(150);ok('Esc closes it',await E(()=>CHEST6.k==-1&&document.getElementById('chestui').style.display=='none'));
 await E(k=>CHEST6.open(k),k);await W8(100);await E(()=>{P.x-=T*6});await W8(300);ok('walking away closes it',await E(()=>CHEST6.k==-1));await E(()=>{P.x+=T*6});await W8(100);
 // ---- saving: world A chest, travel to B at once, B chest, reload: both chests and the backpack agree
 await E(k=>{OBJ[k].c.it=[[3,11],[205,4]];inv[3]=5;inv[205]=1;CHEST6.open(k);CHEST6.move(k,'put',3,2);CHEST6.close()},k);await E(()=>enterWorld('chestb'));await W8(900);
 const kb=await place();await W8(150);await E(k=>{inv[8]=10;CHEST6.open(k);CHEST6.move(k,'put',8,6);CHEST6.close()},kb);await W8(100);
 await enter(p,'chesta',true);const ra=await E(k=>({it:OBJ[k]&&OBJ[k].c.it,nm:OBJ[k]&&OBJ[k].c.nm,col:OBJ[k]&&OBJ[k].c.col,n3:cnt(3),n8:cnt(8)}),k);
 ok('world A chest survives a world change + reload (contents, name, colour)',ra.it&&JSON.stringify(ra.it)=='[[3,13],[205,4]]'&&ra.nm=='Ore Box'&&ra.col==2,ra);
 ok('backpack saved together with the chests (no loss, no duplicate)',ra.n3==3&&ra.n8==4,ra);
 await E(()=>enterWorld('chestb'));await W8(900);const rb=await E(k=>OBJ[k]&&OBJ[k].c.it,kb);ok('world B keeps its own chest',JSON.stringify(rb)=='[[8,6]]',rb);
 // ---- breaking a full chest: everything comes back (drops, or the backpack when the ground is full)
 const br=await E(k=>{const x=k%W,y=k/W|0,o=OBJ[k];const ids=Object.keys(BLK).map(Number).filter(i=>i>1&&i<20&&i!=17).concat(Object.keys(MAT).map(Number)).slice(0,24);o.c.it=ids.map(i=>[i,60]);
  const before={};for(const i of ids)before[i]=cnt(i);drops.length=0;let n=0;while(tiles[k]&&n++<300)breakAt(x,y,50);const got={};for(const d of drops)got[d.k]=(got[d.k]||0)+d.n;let lost=0;for(const i of ids){const back=(got[i]||0)+cnt(i)-before[i];if(back!=60)lost++}return{broke:!tiles[k],lost,drops:drops.length}},kb);
 ok('breaking a full chest loses nothing (24 stacks: drops + backpack)',br.broke&&br.lost==0,br);
 // a big title banner that arrives while the chest window is open waits (it used to cover the chest header), then shows on close
 const kq=await place();await W8(150);const bq=await E(async k=>{const b=document.getElementById('banner');b.classList.remove('on');CHEST6.open(k);UI6.say6('QUEUED','banner test',1500);await new Promise(r=>setTimeout(r,300));const during=b.classList.contains('on');CHEST6.close();await new Promise(r=>setTimeout(r,450));return{during,after:b.classList.contains('on')&&/QUEUED/.test(b.textContent)}},kq);
 ok('a title banner waits while the chest window is open, then shows when it closes',!bq.during&&bq.after,bq);
 ok('no page errors',errs.length==0,errs.join('|'));
 await b.close();console.log(fails?fails+' chest test(s) FAILED':'all chest tests passed');process.exit(fails?1:0)})();
