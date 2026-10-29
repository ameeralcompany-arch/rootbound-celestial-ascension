// Wings v9: the 8-key flight cycle (F1 flare, F2-F5 flap, F6-F8 hover) for every wing, three-tier ascended wings (span, tiers, emissive
// tips, trails), the cycle phases in real flight (synced to FLY7), capped trail particles, the always-on aura pose with wings (air + ground,
// hitbox untouched, pet still follows), the new store wings (buy, equip, sounds, previews) and the art/wings sprite sheets. node tests/wings.js
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const NEW=['voidshroud','nightforge','haloseraph','inkwraith','eyemoth','stormlance','bonelight','amethclaw'];
const pngSize=f=>{const b=fs.readFileSync(f);return b.slice(1,4).toString()=='PNG'?[b.readUInt32BE(16),b.readUInt32BE(20)]:null};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=80});await p.waitForTimeout(400);
 await p.evaluate(()=>{enterWorld('wingtest')});await p.waitForTimeout(900);
 const E=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await E(()=>{WX6.force='clear';mobs.length=0;QM.cur.wfx=3});
 // ---- every wing (old and new) renders each of the 8 keyframes, with pixels, no errors
 let r=await E(()=>{const bad=[],c=document.createElement('canvas');c.width=520;c.height=520;const x=c.getContext('2d');let n=0;
  for(let w=0;w<WINGS.length;w++)for(let k=0;k<8;k++){x.clearRect(0,0,520,520);try{WingArt.draw(x,w,260,260,k%2?-1:1,1.3,2,0,0,1,null,0,{kf:k,trail:1});n++}catch(e){bad.push(WINGS[w].id+'@F'+(k+1)+': '+e.message);continue}
   const d=x.getImageData(0,0,520,520).data;let px=0;for(let i=3;i<d.length;i+=16)if(d[i]>20)px++;if(px<60)bad.push('blank '+WINGS[w].id+'@F'+(k+1))}
  return{n,total:WINGS.length,bad:bad.slice(0,8),names:WING9.NAMES.length}});
 ok('every wing ('+r.total+') renders all 8 keyframes F1..F8 with pixels and no errors',r.n==r.total*8&&r.total==46&&r.bad.length==0&&r.names==8,r);
 // ---- new wings: tier family, span >= 2.5x torso, F2 higher than F4, tips glow (additive sprites), nothing cut off at the cycle extremes
 r=await E(NEW=>{const torso=2*9.5*.9,out={},bad=[];const c=document.createElement('canvas');c.width=c.height=700;const x=c.getContext('2d');
  const box=(i,k)=>{x.clearRect(0,0,700,700);WingArt.draw(x,i,350,350,1,1.3,2,0,0,1,null,0,{kf:k});const d=x.getImageData(0,0,700,700).data;let x0=1e9,x1=-1,y0=1e9,y1=-1;for(let y=0;y<700;y+=2)for(let q=0;q<700;q+=2)if(d[(y*700+q)*4+3]>24){x0=Math.min(x0,q);x1=Math.max(x1,q);y0=Math.min(y0,y);y1=Math.max(y1,y)}return{w:x1-x0,top:350-y0,bot:y1-350,edge:x0<=0||y0<=0||x1>=698||y1>=698}};
  for(const id of NEW){const i=WINGS.findIndex(w=>w.id==id),Wg=WINGS[i];if(i<0){bad.push('missing '+id);continue}const art=WingArt.get(i,1.25),tier=art.parts.find(q=>q.kind=='tier');
   const f1=box(i,0),f2=box(i,1),f4=box(i,3);out[id]=+(f1.w/torso).toFixed(1);
   if(!tier||!tier.pr.length||!tier.t2||!tier.t3)bad.push(id+' tiers');if(!tier.pr.every(s=>s.g))bad.push(id+' tip glow sprites');if(f1.w<torso*2.5)bad.push(id+' span '+f1.w);if(!(f2.top>f4.top))bad.push(id+' F2 not above F4');if(!(f4.bot>f2.bot))bad.push(id+' F4 not lower');if(f1.edge||f2.edge||f4.edge)bad.push(id+' cut off');
   if(!['legendary','mythic'].includes(Wg.rar)||Wg.src!='shop'||!Wg.a.trail)bad.push(id+' data')}
  return{ratio:out,bad}},NEW);
 ok('8 new three-tier wings: span >= 2.5x torso width, F2 high above F4, emissive tip sprites, trails, nothing cut off',r.bad.length==0,r);
 // ---- buy + equip a new wing (store), it shows in the store category and the collection, with its own sounds
 r=await E(async()=>{gems=99999;lvl=80;const o={};o.cat=SHOP7.items.filter(i=>i.cat=='wings').length;lvl=40;o.lock=(await SHOP7.buy('wing_voidshroud')).ok;lvl=80;
  o.buy=(await SHOP7.buy('wing_haloseraph')).ok;o.eq=curWing(lvl)&&curWing(lvl).id;o.own=wingOwned(wingById('haloseraph'));o.sfx=['voidshroud','nightforge','haloseraph','inkwraith','eyemoth','stormlance','bonelight','amethclaw'].filter(id=>{const P=WINGSFX.P7[id];if(!P)return true;try{P.j();P.f(true);P.g();P.e();return false}catch(e){return true}});
  const c=document.createElement('canvas');c.width=168;c.height=112;const x=c.getContext('2d');let blank=[];for(const id of['voidshroud','eyemoth','bonelight']){x.clearRect(0,0,168,112);const i=WINGS.findIndex(w=>w.id==id),k=Math.min(1.45,60/(WINGS[i].a.L*1.15));x.save();x.translate(84,76);x.scale(k,k);WingArt.draw(x,i,0,6,1,1,0,0,i,1,null,null,{ds:1});x.restore();const d=x.getImageData(0,0,168,112).data;let n=0;for(let q=3;q<d.length;q+=4)if(d[q]>20)n++;if(n<500)blank.push(id)}o.blank=blank;return o});
 ok('new wings are in the store (27 wings), level-gated, buyable, equip on purchase, each has a working sound profile and a collection preview',r.cat==27&&r.lock===0&&r.buy&&r.eq=='haloseraph'&&r.own&&!r.sfx.length&&!r.blank.length,r);
 // ---- pet + hitbox baseline on the ground
 await E(async()=>{gems=99999;await SHOP7.buy('charm_mochi');SHOP7.equip('charm_mochi')});
 const pos=await E(()=>{const px=Math.floor(P.x/T);let y=0;while(y<H-1&&!tiles[(y+1)*W+px])y++;return{w:P.w,h:P.h}});
 await W(900);
 // ---- ground idle: levitation + aura on, hitbox and P.y untouched, pet follows
 r=await E(()=>({g:P.g,st:WING9.state('me')&&WING9.state('me').ph,pz:AURAP.S.get('me'),y:P.y,w:P.w,h:P.h}));
 const y0=r.y;await W(400);
 let r2=await E(()=>{COMP7.st.last=0;return 1});await W(250);
 r2=await E(()=>({y:P.y,w:P.w,h:P.h,pet:COMP7.st.last>0,lev:AC6.PZ('probe',WINGS.findIndex(w=>w.id=='haloseraph'),false,0,0,performance.now()/1000,false)}));
 ok('ground idle with wings: aura pose levitates a few px (visual only), wings folded/idle phase, P.y and hitbox unchanged, pet follows',r.g&&r.st=='g'&&r.pz&&r.pz.lev>.9&&Math.abs(r2.y-y0)<.01&&r2.w==pos.w&&r2.h==pos.h&&r2.pet&&r2.lev.lev>2&&r2.lev.lev<7,{st:r.st,lev:r.pz&&r.pz.lev,probe:r2.lev.lev,dy:r2.y-y0,pet:r2.pet});
 // ---- take-off: F1 flare, then the flap loop while holding Space (synced to FLY7), particles shed and capped, flight aura pose
 await E(()=>{P.y-=520;P.vy=-200;P.g=false;K[' ']=true});
 const seen=[];let maxP=0,sync=1,bobOk=0,poseAir=0,pet=0;
 for(let i=0;i<34;i++){await W(50);const s=await E(()=>{const st=WING9.state('me'),c=((WingArt.FL.ph/(Math.PI*2))%1+1)%1;const o={ph:st.ph,on:FLY7.F.on,np:WING9.parts('me'),sync:!FLY7.F.on||st.ph!='p'||Math.abs(st.c-c)<1e-6,bob:WingArt.FL.bob,air:AURAP.S.get('me').air,pet:COMP7.st.last};COMP7.st.last=0;return o});
  if(seen[seen.length-1]!==s.ph)seen.push(s.ph);maxP=Math.max(maxP,s.np);if(!s.sync)sync=0;if(s.on&&Math.abs(s.bob)>.3)bobOk=1;if(s.air>.85)poseAir=1;if(s.pet>0)pet++}
 ok('take-off plays the F1 flare, then the F2-F5 flap loop while flying, its clock locked to the FLY7 beat (lift pulses on F3)',seen[0]=='f'&&seen.includes('p')&&seen.indexOf('p')>seen.indexOf('f')&&sync&&bobOk,{seen,sync,bobOk});
 ok('trail particles shed from the tips during strokes and stay capped (<= 50)',maxP>3&&maxP<=50,{maxP});
 ok('in the air the aura flight pose is on and the pet keeps following through the flight bob',poseAir&&pet>=25,{poseAir,pet});
 // ---- release: hover / glide loop F6-F8 in the air
 await E(()=>{K[' ']=false;P.vy=0});await W(120);
 const hs=[];for(let i=0;i<6;i++){await W(40);hs.push(await E(()=>WING9.state('me').ph+(P.g?'G':'')))}
 r=await E(()=>{const st=WING9.state('me');return{hc:st.hc}});await W(200);const hc2=await E(()=>WING9.state('me').hc);
 ok('releasing Space in the air switches to the F6-F8 hover / glide loop',hs.every(s=>s=='h')&&hc2>r.hc,{hs,hc:[r.hc,hc2]});
 // ---- quality: wfx 0 sheds no new particles; the cache and draw cost stay small
 r=await E(()=>{QM.cur.wfx=0;const k='qtest',c=document.createElement('canvas').getContext('2d'),i=WINGS.findIndex(w=>w.id=='stormlance');let t=10;for(let n=0;n<60;n++){t+=.016;WingArt.draw(c,i,100,100,1,t,2,0,0,1,k,-300)}const n0=WING9.parts(k);QM.cur.wfx=3;
  for(let n=0;n<240;n++){t+=.016;WingArt.draw(c,i,100,100,1,t,2,0,0,1,k,-300)}const n3=WING9.parts(k);
  const t0=performance.now();for(let n=0;n<400;n++){t+=.016;WingArt.draw(c,i,100,100,1,t,2,0,0,1,k,-300)}const ms=(performance.now()-t0)/400;return{n0,n3,ms:+ms.toFixed(3)}});
 ok('wfx 0 sheds no particles, wfx 3 does (capped for other players), one ascended wing costs < 1 ms per draw',r.n0==0&&r.n3>0&&r.n3<=20&&r.ms<1,r);
 // ---- unequip: no aura pose, wings fold away
 r=await E(async()=>{let calls=0;const o=AC6.PZ;AC6.PZ=function(){calls++;return o.apply(this,arguments)};wingUnequip();await new Promise(r=>setTimeout(r,500));const c1=calls;await new Promise(r=>setTimeout(r,300));AC6.PZ=o;return{c1,c2:calls,w:curWing(lvl)}});
 ok('without wings the aura pose is off (no pose hook calls)',r.w===null&&r.c2==r.c1,r);
 await E(()=>wingEquip('haloseraph'));
 // ---- in-game screenshot sanity (headless) + no page errors
 await E(()=>{P.y-=200;P.vy=-200;P.g=false;K[' ']=true});await W(400);const shot=await p.screenshot();ok('flight screenshot renders',shot.length>20000);await E(()=>{K[' ']=false});
 // ---- sprite sheets
 const dir=path.resolve(__dirname,'../art/wings');let meta=null;try{meta=JSON.parse(fs.readFileSync(path.join(dir,'sheets.json'),'utf8'))}catch(_){}
 const sh=[];if(meta)for(const id of Object.keys(meta.sheets)){const m=meta.sheets[id];for(const f of[id+'-sheet.png',id+'-sheet-black.png']){const s=fs.existsSync(path.join(dir,f))?pngSize(path.join(dir,f)):null;sh.push(f+':'+(s&&s[0]==m.width&&s[1]==m.height&&m.width==m.frame[0]*4&&m.height==(m.frame[1]+28)*2&&m.anchor[0]==m.frame[0]/2?'ok':'bad'))}}
 ok('sprite sheets: 3 wings x (transparent + black), 4x2 grid with labels, sizes match frame/anchor metadata, README present',meta&&sh.length==6&&sh.every(s=>/ok$/.test(s))&&fs.existsSync(path.join(dir,'README.md'))&&meta.frames.length==8,sh);
 ok('no page errors',errs.length==0,errs.slice(0,5).join(' | '));
 await b.close();console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})();
