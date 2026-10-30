// Letter hunt, Word Gate and Inferno worlds (99-zzzzzz-words.js): every normal world hides one word as shiny Letter Blocks (same word and spots
// on every load, none in the Plaza), touching / breaking collects (no block item), the HUD strip fills in, the gate opens with every letter,
// wrong answers shake + hint after 2 tries, Esc closes and L reopens, the right word below level 15 keeps the gate open but refuses the Inferno
// (also when typed as a world name), collected letters + the solved gate survive a reload, at level 15 the gate leads to "<World> · Inferno":
// same terrain, burnt blocks, lava instead of water (it burns), clear sky, only the new monsters (stronger than any normal one, better drops,
// imps throw fireballs), and the way home is the normal door / menu. Creative: letters and gates still work, lava does not hurt. node tests/words.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))};
async function boot(p,reload){if(reload)await p.reload();else await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300)}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));p.on('console',m=>{if(m.type()=='error'&&!/ERR_|Failed to load|net::/.test(m.text()))errs.push('console: '+m.text())});
 await p.addInitScript(guest);await boot(p);const E=(f,a)=>p.evaluate(f,a);const W8=ms=>p.waitForTimeout(ms||100);
 const go=async w=>{await E(w=>{enterWorld(w);WX6.force='clear';mobs.length=0},w);await W8(500)};
 await E(()=>{lvl=5});await go('wordsa');
 // ---- placement
 const A=await E(()=>{const L=WORD9.letters,w=WORD9.word;return{w,L,n:L.length,all:L.every(l=>tiles[l.y*W+l.x]==WORD9.LETTER),inList:WORD9.WORDS.includes(w),
  sameChars:L.map(l=>l.ch).sort().join('')==[...w].sort().join(''),scr:L.map(l=>l.ch).join('')!=w,surf:L.some(l=>l.y==sh(l.x)-1),under:L.filter(l=>l.y>sh(l.x)+5).length,
  xs:L.map(l=>l.x).sort((a,b)=>a-b),door:L.every(l=>Math.abs(l.x-DX)>5||l.y>sh(l.x)+5),count:(()=>{let c=0;for(let k=0;k<W*H;k++)if(tiles[k]==WORD9.LETTER)c++;return c})()}});
 ok('a normal world hides one word from the list (3-7 letters), one Letter Block per letter',A.inList&&A.n==A.w.length&&A.n>=3&&A.n<=7&&A.all&&A.count==A.n,{w:A.w,n:A.n,count:A.count});
 ok('the blocks carry exactly the word\'s letters, scrambled',A.sameChars&&A.scr,A.L.map(l=>l.ch).join(''));
 const gaps=A.xs.slice(1).map((x,i)=>x-A.xs[i]);ok('letters are spread across the world (surface + underground, none at the spawn door)',A.under>=1&&A.door&&A.xs[A.n-1]-A.xs[0]>80&&Math.min(...gaps)>=3,{xs:A.xs,under:A.under,surf:A.surf});
 await go('wordsb');const Bw=await E(()=>({w:WORD9.word,L:WORD9.letters.map(l=>l.k).join()}));await go('wordsa');
 const A2=await E(()=>({w:WORD9.word,L:WORD9.letters.map(l=>l.k+l.ch).join()}));
 ok('same world = same word, spots and scramble on every visit (deterministic per world name)',A2.w==A.w&&A2.L==A.L.map(l=>l.k+l.ch).join(),A2);
 ok('another world has its own spots',Bw.L!=A.L.map(l=>l.k).join(),Bw);
 await go('plaza');const pz=await E(()=>{let c=0;for(let k=0;k<W*H;k++)if(tiles[k]==WORD9.LETTER)c++;return{n:WORD9.letters.length,c,vis:document.getElementById('wl9').style.display}});
 ok('no letters in the Plaza (and no HUD strip there)',pz.n==0&&pz.c==0&&pz.vis=='none',pz);
 await go('wordsa');await W8(3200);
 const hud0=await E(()=>{const el=document.getElementById('wl9');return{vis:el.style.display!='none'&&el.offsetWidth>0,slots:el.querySelectorAll('i').length,on:el.querySelectorAll('i.on').length,txt:el.innerText}});
 ok('the HUD strip shows one empty slot per letter',hud0.vis&&hud0.slots==A.n&&hud0.on==0,hud0);
 // ---- collecting: touch, break, click
 const t1=await E(()=>{const l=WORD9.letters.find(l=>l.y==sh(l.x)-1)||WORD9.letters[0],k=l.y*W+l.x;for(const q of[k-W,k-2*W,k-3*W]){tiles[q]=0;wl[q]=0;trees.delete(q)}P.vx=P.vy=0;P.x=l.x*T+T/2;P.y=l.y*T-P.h-3;window._l1=l;return l});await W8(400);
 const c1=await E(()=>{const l=window._l1;return{gone:tiles[l.y*W+l.x]!=WORD9.LETTER,got:(WORD9.state.w.wordsa||{got:[]}).got.includes(l.i),slot:document.querySelector('#wl9 i[data-i="'+l.i+'"]').textContent,on:document.querySelectorAll('#wl9 i.on').length}});
 ok('touching a Letter Block collects it (block gone, saved, slot filled)',c1.gone&&c1.got&&c1.slot==t1.ch&&c1.on==1,c1);
 const c2=await E(()=>{const l=WORD9.letters.find(q=>tiles[q.y*W+q.x]==WORD9.LETTER);drops.length=0;const n0=cnt(WORD9.LETTER),r=breakAt(l.x,l.y,1);return{r,gone:tiles[l.y*W+l.x]==0,got:WORD9.state.w.wordsa.got.length,item:cnt(WORD9.LETTER)-n0,drop:drops.some(d=>d.k==WORD9.LETTER),edit:edits[l.y*W+l.x]&&edits[l.y*W+l.x][0]===0}});
 ok('breaking one (any tool, one hit) collects it instead: no Letter Block item or drop, edit saved',c2.r&&c2.gone&&c2.got==2&&c2.item==0&&!c2.drop&&c2.edit,c2);
 // (standing on a block right above the letter: within reach, not touching it)
 const c3=await E(async()=>{const l=WORD9.letters.find(q=>tiles[q.y*W+q.x]==WORD9.LETTER),k=l.y*W+l.x;if(!tiles[k-W]||!SOLID6[tiles[k-W]])tiles[k-W]=3;for(const q of[k-2*W,k-3*W,k-4*W]){tiles[q]=0;wl[q]=0;trees.delete(q)}
  const n0=WORD9.state.w.wordsa.got.length;let before=true;for(let i=0;i<8;i++){P.vx=P.vy=0;P.x=l.x*T+T/2;P.y=(l.y-1)*T-P.h-.5;if(i==2)before=tiles[k]==WORD9.LETTER;mx=l.x*T+T/2-cam.x;my=l.y*T+T/2-cam.y;mdL=i>=2;await new Promise(r=>setTimeout(r,30))}mdL=false;
  return{before,gone:tiles[k]!=WORD9.LETTER,got:WORD9.state.w.wordsa.got.length-n0}});
 ok('clicking a letter within reach collects it',c3.before&&c3.gone&&c3.got==1,c3);
 // ---- the gate: opens with the last letter
 const st0=await E(()=>{const left=WORD9.letters.filter(l=>!WORD9.state.w.wordsa.got.includes(l.i));for(const l of left.slice(0,-1))WORD9.collect(l.i);const early=WORD9.open();return{early,left:left.length}});
 ok('the Word Gate stays shut until every letter is found',!st0.early&&!(await E(()=>WORD9.isOpen())),st0);
 await E(()=>{const l=WORD9.letters.find(l=>!WORD9.state.w.wordsa.got.includes(l.i));WORD9.collect(l.i)});await W8(1700);
 const g0=await E(()=>({open:WORD9.isOpen(),vis:getComputedStyle(document.getElementById('wg9')).display,tiles:[...document.querySelectorAll('#wg9 .tl i')].map(i=>i.textContent).join(''),focus:document.activeElement&&document.activeElement.id,strip:document.querySelectorAll('#wl9 i.on').length}));
 ok('with the last letter the Word Gate opens by itself (scrambled letters shown, input focused)',g0.open&&g0.vis=='flex'&&g0.tiles==A.L.map(l=>l.ch).join('')&&g0.focus=='wg9i'&&g0.strip==A.n,g0);
 await p.fill('#wg9i','zzz');await p.keyboard.press('Enter');await W8(150);
 const w1=await E(()=>({err:document.querySelector('#wg9 .err').textContent,shake:document.querySelector('#wg9 .box').classList.contains('shake'),hint:document.querySelector('#wg9 .hint').hidden,cur,open:WORD9.isOpen()}));
 ok('a wrong word shakes the gate and says try again (no hint yet)',/Try again/.test(w1.err)&&w1.shake&&w1.hint&&w1.cur=='wordsa'&&w1.open,w1);
 await p.fill('#wg9i','qqqq');await p.keyboard.press('Enter');await W8(150);
 const w2=await E(()=>({hint:!document.querySelector('#wg9 .hint').hidden,txt:document.querySelector('#wg9 .hint').textContent,tr:WORD9.state.w.wordsa.tr}));
 ok('after 2 wrong tries the hint shows the first letter',w2.hint&&w2.txt.endsWith(A.w[0])&&w2.tr==2,w2);
 await p.keyboard.press('Escape');await W8(300);ok('Esc closes the gate',!(await E(()=>WORD9.isOpen())));
 await p.keyboard.press('l');await W8(300);ok('L reopens it (hint still there)',await E(()=>WORD9.isOpen()&&!document.querySelector('#wg9 .hint').hidden));
 await p.fill('#wg9i',A.w.toLowerCase()+' ');await p.keyboard.press('Enter');await W8(400);
 const r1=await E(()=>({ok:WORD9.state.w.wordsa.ok,cur,open:WORD9.isOpen(),txt:document.querySelector('#wg9 .box').innerText,go:!!document.querySelector('#wg9 [data-go]')}));
 ok('the right word (any case) below level 15: gate solved, but you need level 15 (no travel)',r1.ok==1&&r1.cur=='wordsa'&&r1.open&&/level 15/.test(r1.txt)&&!r1.go,r1.txt.slice(0,160));
 await p.click('#wg9 [data-x]');await W8(300);
 const inf=await E(()=>WORD9.infName('wordsa'));ok('the Inferno is a world of its own ("<world>-inf", shown as "<World> · Inferno")',inf=='wordsa-inf'&&(await E(n=>WORD9.label(n),inf))=='Wordsa · Inferno',inf);
 await E(n=>enterWorld(n),inf);await W8(400);const rf1=await E(()=>({cur,inf:WORD9.inf}));
 await E(n=>loadWorld(n),inf);await W8(400);const rf2=await E(()=>({cur,inf:WORD9.inf}));
 ok('below level 15 an Inferno is refused (typed into the menu or loaded directly)',rf1.cur=='wordsa'&&!rf1.inf&&rf2.cur=='wordsa'&&!rf2.inf,[rf1,rf2]);
 // ---- reload keeps everything
 await E(()=>{try{saveP()}catch(_){}});await boot(p,true);await E(()=>{lvl=5});await go('wordsa');await W8(200);
 const rl=await E(()=>({L:WORD9.letters.map(l=>l.k+l.ch).join(),got:WORD9.state.w.wordsa.got.length,ok:WORD9.state.w.wordsa.ok,blocks:WORD9.letters.filter(l=>tiles[l.y*W+l.x]==WORD9.LETTER).length,on:document.querySelectorAll('#wl9 i.on').length,em:document.querySelector('#wl9 em').textContent}));
 ok('after a reload: same letters, all collected (no block comes back), gate still solved',rl.L==A.L.map(l=>l.k+l.ch).join()&&rl.got==A.n&&rl.ok==1&&rl.blocks==0&&rl.on==A.n&&/Gate open/.test(rl.em),rl);
 // half-collected world survives a reload too
 await go('wordsb');await E(()=>{WORD9.collect(WORD9.letters[0].i)});await boot(p,true);await go('wordsb');
 const hb=await E(()=>({got:WORD9.state.w.wordsb.got,b0:tiles[WORD9.letters[0].y*W+WORD9.letters[0].x]==WORD9.LETTER,rest:WORD9.letters.slice(1).every(l=>tiles[l.y*W+l.x]==WORD9.LETTER)}));
 ok('a half-found word keeps its found letter gone and the others in place after a reload',hb.got.length==1&&!hb.b0&&hb.rest,hb);
 // ---- level 15: through the gate into the Inferno
 await go('wordsa');const base=await E(()=>({sh:Array.from({length:W},(_,x)=>sh(x)).join(),water:wl.reduce((a,v)=>a+(v?1:0),0)}));
 await E(()=>{lvl=15});await p.keyboard.press('l');await W8(300);const d15=await E(()=>!!document.querySelector('#wg9 [data-go]'));
 await p.click('#wg9 [data-go]');await W8(900);
 const I=await E(()=>{const c={};for(let k=0;k<W*H;k++)c[tiles[k]]=(c[tiles[k]]||0)+1;let lava=0;for(let k=0;k<W*H;k++)if(wl[k]&&!tiles[k])lava++;
  return{cur,inf:WORD9.inf,lava,grass:c[2]|0,dirt:c[1]|0,stone:c[3]|0,ash:c[WORD9.ASH]|0,bas:c[WORD9.BASALT]|0,mag:c[WORD9.MAGMA]|0,obs:c[WORD9.OBSID]|0,letters:WORD9.letters.length,lt:c[WORD9.LETTER]|0,sh:Array.from({length:W},(_,x)=>sh(x)).join(),wname:document.getElementById('wname').textContent,force:WX6.force}});
 ok('at level 15 the solved gate offers the Inferno and takes you there',d15&&I.cur=='wordsa-inf'&&I.inf,{cur:I.cur});
 ok('the Inferno is the same terrain, burnt: ash, basalt, magma stone, obsidian, no grass/dirt/stone',I.sh==base.sh&&I.grass==0&&I.dirt==0&&I.stone==0&&I.ash>50&&I.bas>1000&&I.mag>20&&I.obs>20,{ash:I.ash,bas:I.bas,mag:I.mag,obs:I.obs});
 ok('lava instead of water (lakes + cave pockets)',I.lava>=base.water*.8&&I.lava>100,{lava:I.lava,water:base.water});
 ok('no letters in an Inferno; HUD reads "Wordsa · Inferno"; clear sky (no rain or snow)',I.letters==0&&I.lt==0&&I.wname=='Wordsa · Inferno'&&I.force=='clear',{wname:I.wname,force:I.force});
 // monsters
 const M=await E(()=>{const N=['slime','moth','crab','cloud','bat','golem','wraith','magma','shade'],maxHp=Math.max(...N.map(k=>MK[k].hp)),maxD=Math.max(...N.map(k=>MK[k].dmg||6)),maxG=Math.max(...N.map(k=>MK[k].gem));
  const ks=Object.keys(WORD9.IM),picks=new Set();for(let i=0;i<300;i++){picks.add(pickMob(i%2?2:20))}
  return{ks,maxHp,maxD,maxG,str:ks.every(k=>MK[k].hp>maxHp&&MK[k].dmg>maxD&&MK[k].gem>=maxG*.8),picks:[...picks],onlyInf:[...picks].every(k=>ks.includes(k)),fly:ks.some(k=>MK[k].fly),art:ks.map(k=>k)}});
 ok('4 new monsters, each with more HP and damage than any normal one, one of them flying',M.ks.length==4&&M.str&&M.fly,M.ks.map(k=>k).join());
 ok('only the new monsters spawn in an Inferno (surface and caves)',M.onlyInf&&M.picks.length==4,M.picks);
 const sp=await E(async()=>{mobs.length=0;let n=0;for(let i=0;i<40&&mobs.length<6;i++){if(spawnMob())n++}await new Promise(r=>setTimeout(r,300));return{n,kinds:[...new Set(mobs.map(m=>m.k))],all:mobs.every(m=>MK[m.k].inf)}});
 ok('spawning in the Inferno makes Inferno monsters',sp.n>0&&sp.all,sp);
 const dr=await E(()=>{mobs.length=0;drops.length=0;const k='inf_golem',m=WORD9.spawnAt(k,P.x+T*3,P.y);hurtMob(m,99999,null,0);const ms=drops.filter(d=>d.k==MOBMAT[k]).length,gm=drops.filter(d=>d.k=='gem').reduce((a,d)=>a+d.n,0);return{ms,gm,name:MAT[MOBMAT[k]].n}});
 ok('better drops: own material + many gems',dr.ms>=1&&dr.gm>=30,dr);
 // (the player is made untouchable here: being knocked out clears every monster)
 const fb=await E(async()=>{mobs.length=0;P.x=DX*T+T/2;P.y=sh(DX)*T-P.h-2;P.vx=P.vy=0;const t0=WORD9.thrown,im=WORD9.spawnAt('inf_imp',P.x+T*3,P.y-T*2);let mx2=0;for(let i=0;i<40&&!mx2;i++){iT=9;P.hp=maxHP();if(!mobs.includes(im))mobs.push(im);await new Promise(r=>setTimeout(r,150));mx2=WORD9.thrown-t0}mobs.length=0;iT=0;return mx2});
 ok('Ember Imps throw fireballs',fb>0,fb);
 // draw every monster (no errors), lava hurts
 const art=await E(async()=>{mobs.length=0;let i=0;for(const k of Object.keys(WORD9.IM)){const m=WORD9.spawnAt(k,P.x+(i++-1.5)*T*2,P.y-T);m.stun=9;m.fade=1}await new Promise(r=>setTimeout(r,500));const n=mobs.length;mobs.length=0;return{n,e:[WORD9.err,WORD9.err2,WORD9.err3,WORD9.err4].filter(Boolean).length}});
 ok('the new monsters, lava, embers and sky draw without errors',art.e==0&&art.n==4,art);
 const lv=await E(async()=>{let k=-1;for(let y=10;y<H-3&&k<0;y++)for(let x=3;x<W-3;x++){const q=y*W+x;if(wl[q]>=8&&wl[q+W]>=8&&!tiles[q]&&!tiles[q+W]&&!tiles[q-W]){k=q;break}}if(k<0)return{k};const x=k%W,y=k/W|0;mobs.length=0;P.hp=maxHP();iT=0;P.vx=P.vy=0;
  const h0=P.hp;for(let i=0;i<8;i++){P.x=x*T+T/2;P.y=y*T+4;P.vx=P.vy=0;await new Promise(r=>setTimeout(r,60))}const h1=P.hp;P.x=DX*T+T/2;P.y=sh(DX)*T-P.h-2;P.hp=maxHP();return{k,h0,h1}});
 ok('lava burns the player',lv.k>0&&lv.h1<lv.h0-3,lv);
 // home again
 await go('wordsa');const hm=await E(()=>({cur,inf:WORD9.inf,letters:WORD9.letters.length,picks:(()=>{const s=new Set();for(let i=0;i<300;i++)s.add(pickMob(i%2?2:30));return[...s]})(),wname:document.getElementById('wname').textContent}));
 ok('the menu / door brings you home: normal world, normal monsters, letters back on the HUD',hm.cur=='wordsa'&&!hm.inf&&hm.letters==A.n&&!hm.picks.some(k=>k!=null&&/^inf_/.test(k))&&hm.picks.filter(Boolean).length>0&&hm.wname!='Wordsa · Inferno',hm);
 await E(()=>{lvl=9});await go('wordsa-inf');ok('dropping below level 15 locks the Inferno again',await E(()=>cur=='wordsa'&&!WORD9.inf));
 // ---- creative mode: letters + gate work (level 150), lava does not hurt
 await E(()=>{try{saveP()}catch(_){}localStorage.setItem('rb_cr_go','on')});await boot(p,true);await go('wordsc');
 const cr=await E(async()=>{const on=CRV8.on,n=WORD9.letters.length;for(const l of WORD9.letters)WORD9.collect(l.i);await new Promise(r=>setTimeout(r,1500));const op=WORD9.isOpen();WORD9.submit(WORD9.word);await new Promise(r=>setTimeout(r,1300));return{on,n,op,cur,inf:WORD9.inf,lvl}});
 ok('creative: letters and the Word Gate work, the gate leads straight into the Inferno',cr.on&&cr.n>=3&&cr.op&&cr.cur=='wordsc-inf'&&cr.inf,cr);
 const cl=await E(async()=>{let k=-1;for(let y=10;y<H-3&&k<0;y++)for(let x=3;x<W-3;x++){const q=y*W+x;if(wl[q]>=8&&wl[q+W]>=8&&!tiles[q]&&!tiles[q+W]&&!tiles[q-W]){k=q;break}}if(k<0)return{k};mobs.length=0;let low=1e9;for(let i=0;i<8;i++){P.x=(k%W)*T+T/2;P.y=(k/W|0)*T+4;await new Promise(r=>setTimeout(r,60));low=Math.min(low,P.hp)}return{k,low,max:maxHP()}});
 ok('creative: lava does not hurt',cl.k>0&&cl.low>=cl.max,cl);
 await E(()=>localStorage.setItem('rb_cr_go','off'));await boot(p,true);ok('back to survival afterwards',await E(()=>!CRV8.on));
 ok('no page errors',errs.length==0,errs.join(' | '));
 await b.close();console.log(fails?fails+' word test(s) FAILED':'all word tests passed');process.exit(fails?1:0)})();
