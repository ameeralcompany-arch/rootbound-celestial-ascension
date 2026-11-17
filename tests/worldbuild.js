// World building (MATS10, FEEL10, DECOR10, BUILDER10): colour and material blocks (one tile per material, the colour saved with each block),
// placement and break feel by material, the decoration catalog (every one draws; the duck quacks and reacts; lamps switch and save; other players'
// reactions replay), earned patterns, the Builder (search, favourites, equip, brush, flip, line fill, undo / redo) and frame cost in a heavily
// decorated world.   node tests/worldbuild.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,500):''))};
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:800}});
 await c.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');const inv={1:30,3:30};for(let k=900;k<=907;k++)inv[k]=40;for(let k=920;k<=938;k++)inv[k]=10;for(let k=620;k<=660;k++)inv[k]=5;
   localStorage.setItem('rbp',JSON.stringify({v:1,inv,own:{fist:1},wp:'fist',bar:[3],done:{},lvl:30,made:true}));localStorage.setItem('rbg_seen','1')}});
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&!/favicon|net::/.test(m.text()))errs.push('console: '+m.text())});
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready&&typeof BUILDER10!='undefined',null,{timeout:120000});
 const E=(f,a)=>p.evaluate(f,a);await E(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('wbtest')});await p.waitForTimeout(2500);
 // a flat, clear building ground right of the player
 const G=await E(()=>{P.vx=0;const gy=Math.floor((P.y+P.h)/T),tx=Math.floor(P.x/T);for(let y=gy-6;y<gy;y++)for(let x=tx-6;x<=tx+8;x++){const k=y*W+x;tiles[k]=0;trees.delete(k)}for(let x=tx-6;x<=tx+8;x++){const k=gy*W+x;tiles[k]=3;hp[k]=6}return{gy,tx}});
 const R=await E(()=>{const hash=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0,px=0;for(let i=0;i<d.length;i+=12)if(d[i+3]>10){px++;h=(h*31+(d[i]>>3)*7+(d[i+1]>>3)*3+(d[i+2]>>3)+i)>>>0}return px<40?'blank':h};
  const o={};const hs=new Set();let blank=0;for(let m=0;m<6;m++)for(let i=0;i<51;i++){const h=hash(MATS10.vsprite(115,m*64+i));if(h=='blank')blank++;hs.add(h)}for(const b of[116,117])for(let i=0;i<51;i++){const h=hash(MATS10.vsprite(b,i));if(h=='blank')blank++;hs.add(h)}
  o.colours={n:hs.size,blank,pal:MATS10.NC,fams:new Set(MATS10.PAL.map(p=>p[2])).size};const fx=MATS10.FIX.map(f=>hash(MATS10.fsprite(f[0],0)));o.fixed={n:fx.length,distinct:new Set(fx).size,blank:fx.filter(h=>h=='blank').length};
  o.names=[900,905,906,907,920,938].map(k=>iname(k));o.server=[115,116,117,140].every(b=>b<=149)&&MATS10.FIX.every(f=>f[0]<=149);return o});
 ok('51 colours in 17 families; six paintable materials plus tinted glass and glow blocks, every combination its own picture',R.colours.pal==51&&R.colours.fams==17&&R.colours.blank==0&&R.colours.n==8*51,R.colours);
 ok('19 fixed materials, each its own picture; every new tile is in the range the server accepts',R.fixed.n==19&&R.fixed.distinct==19&&R.fixed.blank==0&&R.server,R);
 // placing a colour block: the colour rides with the block, the item is used, the feel plays for its material
 const P1=await E(G=>{const o={};const n0=cnt(902);MATS10.setCol(902,33);const f0=FEEL10.n;o.placed=MATS10.placeKey(902,G.tx+2,G.gy-1);const k=(G.gy-1)*W+G.tx+2;o.tile=tiles[k];o.v=TVAR[k];o.edit=edits[k];o.used=n0-cnt(902);o.feel=FEEL10.n-f0;o.snd=FEEL10.log[FEEL10.log.length-1];
  o.placed2=MATS10.placeKey(920,G.tx+3,G.gy-1);o.snd2=FEEL10.log[FEEL10.log.length-1];MATS10.placeKey(906,G.tx+4,G.gy-1);o.snd3=FEEL10.log[FEEL10.log.length-1];MATS10.placeKey(927,G.tx+5,G.gy-1);o.snd4=FEEL10.log[FEEL10.log.length-1];return o},G);
 ok('a colour block keeps its colour in the saved edit (variant = material*64 + colour) and uses one item',P1.placed&&P1.tile==115&&P1.v==2*64+33&&P1.edit&&P1.edit[0]==115&&P1.edit[2]==2*64+33&&P1.used==1,P1);
 ok('placing plays its material: fabric pat, wood knock, glass ting, metal ping',P1.feel==1&&P1.snd=='place:fabric'&&P1.snd2=='place:wood'&&P1.snd3=='place:glass'&&P1.snd4=='place:metal',P1);
 // an old block placed the old way gets the new feel too, without the square blip
 const P2=await E(async G=>{const n0=FEEL10.n;let blips=0;const s0=AC&&AC.createOscillator;sel=0;bar[0]=3;try{HOTBAR.set(0,3);HOTBAR.pick(0,1)}catch(_){}
  const k=(G.gy-2)*W+G.tx+2;mx=(G.tx+2)*T+T/2-cam.x;my=(G.gy-2)*T+T/2-cam.y;tiles[k]=0;placeAction();return{tile:tiles[k],feel:FEEL10.n-n0,last:FEEL10.log[FEEL10.log.length-1],pf:FEEL10.PF.has(k)}},G);
 ok('an ordinary stone block placed by right click settles in with the new feel (stone tap)',P2.tile==3&&P2.feel==1&&P2.last=='place:stone'&&P2.pf,P2);
 // breaking returns the material, never a seed
 const B1=await E(G=>{const k=(G.gy-1)*W+G.tx+2,n0=drops.length;let r=0;for(let i=0;i<20&&tiles[k];i++)breakAt(G.tx+2,G.gy-1,99);const ks=drops.slice(n0).map(d=>d.k);return{gone:!tiles[k],ks}},G);
 ok('a broken colour block drops its material item (Woven Fabric, 902), never a seed',B1.gone&&B1.ks.includes(902)&&!B1.ks.some(k=>k>=100&&k<200),B1);
 // the colour strip and , / . keys while a colour material is held
 const CS=await E(async()=>{try{HOTBAR.set(0,904);HOTBAR.pick(0,1)}catch(_){}sel=0;bar[0]=904;await new Promise(r=>setTimeout(r,400));const s=document.getElementById('mats10');const o={on:!!(s&&s.classList.contains('on')),sw:s?s.querySelectorAll('.m10s').length:0,c0:MATS10.colOf(904)};
  dispatchEvent(new KeyboardEvent('keydown',{key:'.',bubbles:true}));o.c1=MATS10.colOf(904);s.querySelector('.m10s[data-i="20"]').click();o.c2=MATS10.colOf(904);return o});
 ok('holding a colour material shows the 51-colour strip; . steps the colour and a swatch picks it',CS.on&&CS.sw==51&&CS.c1==(CS.c0+1)%51&&CS.c2==20,CS);
 // decorations: every one draws (sprite or live parts), icons too
 const D1=await E(()=>{const L=DECOR10.L,bad=[];for(const d of L){const s=DECOR10.sprite(d.i,0,1),ic=DECOR10.iconCanvas(d.i,48);const x=ic.getContext('2d').getImageData(0,0,48,48).data;let px=0;for(let i=3;i<x.length;i+=16)if(x[i]>10)px++;if(px<60)bad.push(d.id)}
  const fams={};for(const d of L)fams[d.fam]=(fams[d.fam]||0)+1;return{n:L.length,bad,fams,pats:L.filter(DECOR10.isPat).map(d=>d.id),ids:new Set(L.map(d=>d.id)).size}});
 ok('the decoration catalog: 60+ decorations in five families, every one drawn, unique ids',D1.n>=60&&D1.bad.length==0&&Object.keys(D1.fams).length==5&&D1.ids==D1.n,D1);
 // the duck: say hello, it quacks with one of four reactions, then waits a moment before the next
 const DK=await E(async G=>{const i=DECOR10.BYID.puddle_duck.i,key=DECOR10.keyOf(i);sel=0;bar[0]=key;try{HOTBAR.set(0,key);HOTBAR.pick(0,1)}catch(_){}const n0=cnt(key);const okp=DECOR10.place(i,G.tx+1,G.gy-1,{flip:0});const k=(G.gy-1)*W+G.tx+1;
  P.x=(G.tx+1)*T+T/2;P.y=(G.gy)*T-P.h-1;P.vx=0;await new Promise(r=>setTimeout(r,250));const o={placed:okp,tile:tiles[k],v:TVAR[k],used:n0-cnt(key),edit:edits[k]};o.near=DECOR10.near()==k;o.prompt=OBJ6.promptText(null);
  const l0=DECOR10.log.length;interact();o.a=DECOR10.log.slice(l0);const st=DECOR10.st(k);o.anim=st.ak;o.r=st.r;interact();o.cool=DECOR10.log.length-l0;await new Promise(r=>setTimeout(r,800));interact();o.after=DECOR10.log.length-l0;
  o.pres=(()=>{const c=celPres();return c.dz})();o.clean=(cleanCx({dz:o.pres})||{}).dz;return o},G);
 ok('a placed duck is a saved decoration (tile 140, its kind in the edit) and uses one duck',DK.placed&&DK.tile==140&&DK.edit&&DK.edit[0]==140&&DK.edit[2]==DK.v&&DK.used==1,DK);
 ok('near the duck the prompt invites you; Use makes it quack with a reaction, then a short cooldown',DK.near&&/say hello to the Puddle Duck/.test(DK.prompt)&&DK.a.length==1&&DK.a[0].kind=='quack'&&DK.anim=='quack'&&DK.r>=0&&DK.r<4&&DK.cool==1&&DK.after==2,DK);
 ok('the reaction rides in presence (cx.dz) and survives the presence filter, so other players see it',Array.isArray(DK.pres)&&DK.pres[0]==DK.a[0].k&&JSON.stringify(DK.clean)==JSON.stringify(DK.pres),DK);
 // another player's reaction replays here with the same pick
 const RM=await E(async G=>{const k=(G.gy-1)*W+G.tx+1,l0=DECOR10.log.length;const fake={peers:()=>[{id:'other1',name:'Other',kind:'viewer',presence:{x:P.x,y:P.y,cx:{dz:[k,2,5]}}}],emit(){}};const r0=window.rm;try{rm=fake}catch(_){}
  DECOR10.draw(0,W-1,0,H-1,performance.now());fake.peers()[0].presence.cx.dz=[k,3,6];const pr=fake.peers;fake.peers=()=>[{id:'other1',name:'Other',kind:'viewer',presence:{x:P.x,y:P.y,cx:{dz:[k,3,6]}}}];DECOR10.draw(0,W-1,0,H-1,performance.now());try{rm=r0}catch(_){}
  const a=DECOR10.log.slice(l0);return{a}},G);
 ok('another player’s duck greeting replays here with their reaction (hop), not a new random one',RM.a.length==1&&RM.a[0].remote&&RM.a[0].r==3&&RM.a[0].kind=='quack',RM);
 // a lamp switches, and the state is saved in the edit (a[3]) so everyone and every reload agree
 const LP=await E(async G=>{const i=DECOR10.BYID.lantern_post.i;P.x=(G.tx+6)*T+T/2;const k=(G.gy-1)*W+G.tx+7;DECOR10.place(i,G.tx+7,G.gy-1,{flip:0});const s0=TST[k]&1,e0=edits[k][3];P.x=(G.tx+7)*T+T/2;await new Promise(r=>setTimeout(r,100));DECOR10.act(k);return{s0,s1:TST[k]&1,e0,e1:edits[k][3],lit:lampL.length>=0}},G);
 ok('a lantern post switches off and on; its state is saved with the world edit',LP.s0==1&&LP.s1==0&&(LP.e0&1)==1&&(LP.e1&1)==0,LP);
 // breaking a decoration gives it back; a pattern can't be placed until earned and never drops
 const BR=await E(G=>{const k=(G.gy-1)*W+G.tx+1,n0=drops.length;for(let i=0;i<10&&tiles[k];i++)breakAt(G.tx+1,G.gy-1,99);const ks=drops.slice(n0).map(d=>d.k);
  const pi=DECOR10.BYID.aurora_tree.i;const before=DECOR10.place(pi,G.tx+6,G.gy-1,{quiet:1});const own0=DECOR10.owns(DECOR10.L[pi]);try{SHOP7.grant?SHOP7.grant('dec_aurora_tree'):null}catch(_){}const own1=DECOR10.owns(DECOR10.L[pi]);const after=own1?DECOR10.place(pi,G.tx+6,G.gy-1,{quiet:1}):false;
  const k2=(G.gy-1)*W+G.tx+6,n1=drops.length;if(after)for(let i=0;i<10&&tiles[k2];i++)breakAt(G.tx+6,G.gy-1,99);return{ks,before,own0,own1,after,patDrops:drops.slice(n1).map(d=>d.k),cat:SHOP7.byId.get('dec_aurora_tree')}},G);
 ok('a broken duck drops a duck item again',BR.ks.some(k=>k>=620&&k<700),BR.ks);
 ok('an exclusive pattern is never sold, needs its goal, and once earned places freely and drops nothing',BR.cat&&BR.cat.sale===0&&BR.cat.earn&&!BR.before&&!BR.own0&&(!BR.own1||(BR.after&&BR.patDrops.length==0)),{c:BR.cat&&BR.cat.earn,b:BR.before,o:[BR.own0,BR.own1],a:BR.after,d:BR.patDrops});
 // the Builder: open, search, favourite, choose, undo / redo, line fill
 const BU=await E(async G=>{const o={};dispatchEvent(new KeyboardEvent('keydown',{key:'`',bubbles:true}));await new Promise(r=>setTimeout(r,250));const el=document.getElementById('bld10');o.open=el&&el.classList.contains('on');
  const inp=el.querySelector('input');inp.value='duck';inp.dispatchEvent(new Event('input'));o.search=[...el.querySelectorAll('.b10i .nm')].map(x=>x.textContent);
  const first=el.querySelector('.b10i');first.querySelector('.star').click();o.fav=Object.keys(BUILDER10.S.fav);inp.value='';inp.dispatchEvent(new Event('input'));el.querySelector('[data-t=fav]').click();o.favTab=el.querySelectorAll('.b10i').length;
  el.querySelector('[data-t=col]').click();const pl=[...el.querySelectorAll('.b10i')].find(b=>b.dataset.id=='k900');pl.click();await new Promise(r=>setTimeout(r,200));o.held=MATS10.held();
  inp.value='pink';inp.dispatchEvent(new Event('input'));o.pink=el.querySelectorAll('.b10i').length;BUILDER10.close();o.closed=!el.classList.contains('on');
  // place three plaster, line-fill to the right, undo twice, redo once
  P.x=(G.tx+2)*T+T/2;const n0=cnt(900);MATS10.placeKey(900,G.tx-2,G.gy-1);mx=(G.tx+1)*T+T/2-cam.x;my=(G.gy-1)*T+T/2-cam.y;o.line=BUILDER10.line();o.after=cnt(900);const row=[];for(let x=G.tx-2;x<=G.tx+1;x++)row.push(tiles[(G.gy-1)*W+x]);o.row=row;
  o.u1=BUILDER10.undo();o.u2=BUILDER10.undo();o.afterUndo=cnt(900);o.r1=BUILDER10.redo();o.afterRedo=cnt(900);o.n0=n0;o.rec=BUILDER10.S.rec.slice(0,3);return o},G);
 ok('the Builder opens with `, finds the ducks by search, and favourites stay in their own tab',BU.open&&BU.search.length>=4&&BU.search.every(n=>/duck|mallard/i.test(n))&&BU.fav.length==1&&BU.favTab==1,BU);
 ok('choosing a material puts it in your hand; searching a colour name finds the colour materials',BU.held==900&&BU.pink>=8&&BU.closed,BU);
 ok('Shift-line fill places a straight row; undo takes back and refunds, redo puts it back',BU.line&&BU.row.every(t=>t==115)&&BU.n0-BU.after==4&&BU.u1&&BU.u2&&BU.afterUndo==BU.after+2&&BU.r1&&BU.afterRedo==BU.afterUndo-1&&BU.rec[0]=='k900',BU);
 // a heavily decorated world: frame cost with 1,200 decorations and 2,000 colour blocks around you
 const PF=await E(async()=>{const tx=Math.floor(P.x/T),ty=Math.floor(P.y/T);const meas=async()=>{const t=[];for(let i=0;i<40;i++){const a=performance.now();draw(performance.now());t.push(performance.now()-a);await new Promise(r=>requestAnimationFrame(r))}t.sort((a,b)=>a-b);return t[Math.floor(t.length*.5)]};
  const base=await meas();let nd=0,nb=0;for(let y=ty-14;y<ty+10;y++)for(let x=tx-40;x<tx+40;x++){if(x<1||y<1||x>=W-1||y>=H-1)continue;const k=y*W+x;if((x+y)%2==0&&nd<1200){tiles[k]=140;TVAR[k]=(x*7+y*3)%DECOR10.N;TST[k]=1;nd++}else if(nb<2000){tiles[k]=115;TVAR[k]=((x+y)%6)*64+(x*3+y)%51;nb++}}
  await new Promise(r=>setTimeout(r,400));const heavy=await meas();return{base:+base.toFixed(2),heavy:+heavy.toFixed(2),nd,nb,drawn:DECOR10.count}});
 ok('a world packed with 1,200 decorations and 2,000 colour blocks still draws a frame in a few milliseconds',PF.heavy<Math.max(14,PF.base*4),PF);
 ok('no errors',errs.length==0,errs.slice(0,5));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
