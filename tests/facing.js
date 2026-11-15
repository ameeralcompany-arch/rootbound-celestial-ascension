// Facing in a fight, played through the game's own code (headless): aim one way while walking the other, with every class's weapons and Mythic,
// a plain weapon, a gun and a bow. What must hold: the character faces the aim for the whole attack (no snap back to the walking side), turns back to
// walking straight after; the hit lands on the aimed side and not the other; a cursor right on the body never flickers the facing; the aim stays true
// after a zoom; a skill pressed in a wind-up waits instead of vanishing; your move carries its facing and aim to others; another player's move plays on them.
//   node tests/facing.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file:///'+path.resolve(__dirname,'../index.html').split(path.sep).join('/');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+(typeof d=='string'?d:JSON.stringify(d)).slice(0,500):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},280000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:20},gems:500,own:{fist:1,ember:1},wp:'ember',bar:[1],done:{},xp:3,lvl:95,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const errs=[];const c=await b.newContext({viewport:{width:1600,height:900}});
 await c.addInitScript(sd=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')}},SAVE);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error'&&/FACE1|FIGHT|SK1|MYTH|GUN9/.test(m.text()))errs.push(m.text().slice(0,300))});
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1200);
 await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('rbfacing');
  window.__gr=x0=>{P.x=x0||W*T*.45;const tx=P.x/T|0;let gy=0;for(let i=4;i<H;i++)if(solidAt(tx,i)&&!solidAt(tx,i-1)&&!solidAt(tx,i-2)){gy=i*T;break}P.y=gy-P.h-1;P.vx=P.vy=0;P.g=true;P.f=1;return gy};
  window.__sp=(x,y)=>{mobs.push({k:'slime',x,y:y+10,w:MK.slime.w,h:MK.slime.h,vx:0,vy:0,hp:1e6,mhp:1e6,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:false,wall:0,stun:30})};
  // point the real pointer at a world spot (the game then reads it every frame)
  window.__aim=(wx,wy)=>{const sx=(wx-cam.x)*ZM*innerWidth/cv.width,sy=(wy-cam.y)*ZM*innerHeight/cv.height;cv.dispatchEvent(new MouseEvent('mousemove',{clientX:sx,clientY:sy,bubbles:true}))};
  // one attack aimed at side s while walking the other way: facing sampled every frame while the attack holds it, then once it lets go
  window.__atk=async(fire,s,o)=>{o=o||{};const fr=()=>new Promise(r=>requestAnimationFrame(r));for(const k in K)K[k]=0;FIGHT.stop('me');swing=0;wcd=0;mdL=false;mobs.length=0;try{projs.length=0;SK1.FX.length=0}catch(_){}for(let i=0;i<12;i++)await fr();try{projs.length=0;SK1.FX.length=0}catch(_){}__gr();P.f=-s;await fr();await fr();
   __aim(P.x+s*230,P.y+23);await fr();if(o.mobs!==false){__sp(P.x+s*64,P.y);__sp(P.x-s*220,P.y)}const mA=mobs[0],mB=mobs[1];if(!o.stand)K[s>0?'a':'d']=1;await fr();
   fire();const mv=(FIGHT.state('me')&&FIGHT.state('me').q&&FIGHT.state('me').k)||'';const seen=[];let vmax=0;let t0=performance.now();await fr();while(FACE1.held()&&performance.now()-t0<2500){if(Math.sign(P.vx)===-s&&!(FIGHT.root&&FIGHT.root.vx!=null))vmax=Math.max(vmax,Math.abs(P.vx));seen.push(P.f===s||(mA&&Math.abs(mA.x-P.x)>8&&P.f===Math.sign(mA.x-P.x))?s:P.f);await fr()}mdL=false;const heldMs=Math.round(performance.now()-t0);for(let i=0;i<4;i++)await fr();const after=P.f;for(let i=0;i<16;i++)await fr();for(const k in K)K[k]=0;
   return{mv,n:seen.length,wrong:seen.filter(f=>f!==s).length,heldMs,vmax:Math.round(vmax),after,back:after===-s,hitA:mA?mA.hp<mA.mhp:null,hitB:mB?mB.hp<mB.mhp:null}};
  window.__clean=()=>{for(const k in K)K[k]=0;FIGHT.stop('me');mdL=false;mobs.length=0}});
 await sleep(2400);
 // ---- every class: its weapons and its Mythic, aimed left while walking right, then aimed right while walking left
 await p.evaluate(()=>{try{EARN1.hold(true)}catch(_){}P.hp=maxHP();for(const id of ARS1.IDS)own[id]=1;for(const k in CLASS7.C){own['myth_'+k]=1;MYTH.S.t[k]=1;CLASS7.S.lv[k]=75}lvl=95});
 const all=await p.evaluate(async()=>{const bad=[],hitW=[],fast=[];let n=0;for(const cl in CLASS7.C){CJOB.S.cur=cl;CJOB.S.learned=[...new Set([...(CJOB.S.learned||[]),cl])];
  for(const id of ARS1.IDS.filter(i=>WPN[i].cls==cl).concat(['myth_'+cl])){wp=id;try{renderSkills()}catch(_){}for(const s of[-1,1]){n++;P.hp=maxHP();try{SK1.reset()}catch(_){}const r=await __atk(()=>{wcd=0;useWeapon()},s);if(r.wrong||!r.back||r.n<1)bad.push(id+(s<0?' L ':' R ')+JSON.stringify(r));/* guns and bows back away at 70% so kiting works; the ninja Mythic strikes with its own dash */const rng=WPN[id].k=='bow'||(GUN9.AIM&&GUN9.AIM.has(id))||/^b:(bow|staff|wand|gun|orb|tome|book|scepter)/.test(r.mv);if(id!='myth_ninja'&&r.vmax>Math.round(260*(1+bonus().spd)*(rng?.7:.5))+2)fast.push(id+' '+r.vmax);if(s<0&&!rng){try{SK1.reset()}catch(_){}let r2=await __atk(()=>{wcd=0;useWeapon()},s,{stand:true});/* Mythic combos have leaping steps that can pass a target this close: one more swing */if(!r2.hitA)r2=await __atk(()=>{wcd=0;useWeapon()},s,{stand:true});if(!r2.hitA)hitW.push(id)}}}}__clean();return{n,bad,hitW,fast}});
 ok('every class weapon and Mythic ('+all.n/2+' weapons): you face where you aim for the whole attack, walking the other way, then turn back',all.bad.length==0&&all.n==130,all.bad.slice(0,6));
 ok('standing still, every close-range attack lands on the side you aim (bows, guns and magic projectiles: their own checks below)',all.hitW.length==0,all.hitW.slice(0,8));
 ok('backing away while an attack holds your facing is a careful step (at most half speed, 70% with a bow or gun), so moving and swinging never fight',all.fast.length==0,all.fast.slice(0,8));
 // ---- a weapon skill and a Mythic skill, cast toward the aim while walking away
 const sk=await p.evaluate(async()=>{const out={};try{dlgOpen=false;NAV16.closeAll()}catch(_){}CJOB.S.cur='knight';wp=ARS1.byC.knight.l1;renderSkills();SK1.reset();const s1=SK1.weaponSkills()[0];out.weapon=await __atk(()=>SK1.cast(s1),-1);
  CJOB.S.cur='reaper';wp='myth_reaper';renderSkills();SK1.reset();const s2=SK1.weaponSkills()[1];out.myth=await __atk(()=>SK1.cast(s2),-1);__clean();return out});
 ok('skills face their aim for the whole move (a weapon skill and a Mythic skill)',['weapon','myth'].every(k=>sk[k].n>0&&sk[k].wrong==0&&sk[k].back),sk);
 // ---- a plain weapon, a gun (held trigger) and a bow
 const rg=await p.evaluate(async()=>{const out={};wp='ember';out.ember=await __atk(()=>{wcd=0;useWeapon()},-1);
  const gun=[...GUN9.GUNS].find(id=>WPN[id]);own[gun]=1;wp=gun;out.gun=await __atk(()=>{mdL=true;setTimeout(()=>{mdL=false},400)},-1,{mobs:false});out.gunId=gun;
  const bow=Object.keys(WPN).find(id=>WPN[id].k=='bow'&&!WPN[id].myth);own[bow]=1;wp=bow;out.bow=await __atk(()=>{mdL=true;setTimeout(()=>{mdL=false},400)},-1,{mobs:false});out.bowId=bow;
  __clean();wp='ember';return out});
 ok('a plain weapon faces its swing, and walking turns you back afterwards',rg.ember.n>0&&rg.ember.wrong==0&&rg.ember.back&&!rg.ember.hitB,rg.ember);
 ok('holding a gun\'s trigger faces where it shoots, even walking away',rg.gun.n>2&&rg.gun.wrong==0&&rg.gun.back,{id:rg.gunId,r:rg.gun});
 ok('drawing a bow faces where it shoots, even walking away',rg.bow.n>2&&rg.bow.wrong==0&&rg.bow.back,{id:rg.bowId,r:rg.bow});
 // ---- a cursor right on the body keeps the facing
 const dz=await p.evaluate(()=>{__gr();P.f=-1;const a=FACE1.side(P.x+3),b=FACE1.side(P.x-3);P.f=1;const c=FACE1.side(P.x-3),d=FACE1.side(P.x+40),e=FACE1.side(P.x-40);return{a,b,c,d,e}});
 ok('a pointer right on your body never flips you; past it, it does',dz.a==-1&&dz.b==-1&&dz.c==1&&dz.d==1&&dz.e==-1,dz);
 // ---- the aim stays true after a zoom
 const zm=await p.evaluate(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(r));__gr();await fr();__aim(P.x+300,P.y);await fr();const sx=(P.x+300-cam.x)*ZM*innerWidth/cv.width;const z0=ZM;setZoom(z0*1.25);for(let i=0;i<40;i++)await fr();
  const want=sx*cv.width/innerWidth/ZM,stale=sx*cv.width/innerWidth/z0,got=mx;setZoom(z0);await fr();return{z0,z1:+(z0*1.25).toFixed(2),want:+want.toFixed(1),stale:+stale.toFixed(1),got:+got.toFixed(1)}});
 ok('after a zoom the aim is re-read for the new zoom (never left stale)',Math.abs(zm.got-zm.want)<zm.want*.03&&Math.abs(zm.got-zm.stale)>zm.want*.1,zm);
 // ---- a skill pressed in a wind-up waits a moment instead of vanishing
 const bf=await p.evaluate(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(r));__clean();__gr();CJOB.S.cur='samurai';wp='myth_samurai';renderSkills();SK1.reset();const S=SK1.weaponSkills();FIGHT.stop('me');
  SK1.cast(S[0]);await fr();const st=FIGHT.state('me');const r=SK1.cast(S[1]);const pend=FACE1.pending;let cast=false;const t0=performance.now();while(performance.now()-t0<600){await fr();if(FACE1.pending==null){cast=FIGHT.state('me')&&FIGHT.state('me').k==S[1].id;break}}__clean();return{first:st&&st.k,second:r,pend,cast,s1:S[1].id}});
 ok('a skill pressed during a wind-up is kept and cast right after',bf.second===false&&bf.pend===bf.s1&&bf.cast,bf);
 // ---- multiplayer: your move carries facing and aim; theirs plays on them
 const mp=await p.evaluate(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(r));__clean();__gr();CJOB.S.cur='knight';wp=ARS1.byC.knight.l1;renderSkills();__aim(P.x-230,P.y+23);await fr();wcd=0;useWeapon();await fr();
  const net=FIGHT.net(),clean=cleanCx({fa:net}).fa;__clean();
  const q=(seq)=>({x:P.x+120,y:P.y,f:1,n:'Friend',wp:ARS1.byC.knight.l1,h:0,cx:{fa:[net[0],seq,-1,net[3]]}});
  drawChar(200,200,1,0,'Friend',performance.now()/1000,0,false,'',ARS1.byC.knight.l1,0,0,{},0,null,q(5));const first=FIGHT.active('p:Friend');
  drawChar(200,200,1,0,'Friend',performance.now()/1000,0,false,'',ARS1.byC.knight.l1,0,0,{},0,null,q(6));const second=FIGHT.active('p:Friend');return{net,clean,first,second}});
 ok('your move sends its facing and aim with it (aimed left: facing -1, aim near pi)',Array.isArray(mp.net)&&mp.net.length==4&&mp.net[2]==-1&&Math.abs(Math.abs(mp.net[3])-314)<40&&Array.isArray(mp.clean)&&mp.clean.length==4&&mp.clean[2]==-1,mp);
 ok('another player\'s new move plays on them (not their first sighting, then each new move)',mp.first===false&&mp.second===true,mp);
 ok('no errors',errs.length==0,errs.slice(0,4));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL',e&&e.stack||e);process.exit(1)});
