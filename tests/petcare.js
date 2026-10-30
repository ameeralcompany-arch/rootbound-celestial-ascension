// Pets (96-zz-petcare.js): the store sells 4 pets, 9 clothes and the Pet Home / Pet Food / Pet Treat (Pets tab, every card draws), adopting
// each species makes a pet, the Pet Home is placed with the real click path and pets move in, they wander within range and stay on the
// ground (hop up a 1-block step, never walk into a pit), behaviours trigger (sit, talk, sleep, hop, stretch, spin, flip, happy, eat, follow)
// with their particles and soft sounds, clothes + colours change from the Pet UI (chips, swatches, colour picker) and persist, hunger rises
// over (mocked) time and makes a pet sad / refuse to play, feeding resets it, the ball game works end to end, E opens / closes the UI,
// picking up the home and placing it again re-homes the pets, bad saved data is cleaned, state survives a reload, no page errors.
// Cute extras: walking up to a pet makes it wiggle with a heart, hops land with a squash, ear-twitch / wiggle poses draw.
// Voices (VOX): per-species sets, state picks happy / soft / sleep variants, +-5% pitch jitter, rate limits, panning / off-screen / SFX volume.
// Optional screenshots: SHOTS=<folder>. node tests/petcare.js
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.env.SHOTS||'';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
const guest=()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));
 // waits in game time (the loop caps a frame at 50 ms, so on a busy machine game time runs slower than the wall clock)
 window._gw=async s=>{const c=PET10.clock,t0=performance.now();while(PET10.clock-c<s&&performance.now()-t0<s*12000+5000)await new Promise(q=>setTimeout(q,25))}};
async function enter(p,world,reload){if(reload)await p.reload();else await p.goto(URL);await p.waitForTimeout(700);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}});await p.waitForTimeout(300);await p.evaluate(w=>enterWorld(w),world);await p.waitForTimeout(900)}
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:1366,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',x=>errs.push(x.message));
 p.on('console',m=>{if(m.type()=='error'&&/PET10/.test(m.text()))errs.push(m.text())});
 await p.addInitScript(guest);await enter(p,'pettest');const E=(f,a)=>p.evaluate(f,a);const W8=ms=>p.waitForTimeout(ms||100);const shot=async n=>{if(SHOTS)await p.screenshot({path:path.join(SHOTS,'pets-'+n+'.png')})};
 // ---- store
 const st=await E(()=>{const L=SHOP7.items.filter(i=>i.cat=='pets');const bad=[];for(const it of L)for(const still of[true,false]){const c=document.createElement('canvas');c.width=300;c.height=255;const x=c.getContext('2d');STORE7.drawPrev(x,it,300,255,1.3,1,still);
   const d=x.getImageData(0,0,300,255).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>20)n++;if(n<800)bad.push(it.id+(still?' still':' live')+' '+n)}
  return{n:L.length,pets:L.filter(i=>i.id.startsWith('pet_')&&!i.stack).map(i=>i.ref),clo:L.filter(i=>i.id.startsWith('petc_')).length,care:L.filter(i=>i.stack).map(i=>i.id+':'+i.ref),tab:SHOP7.CATS.some(c=>c[0]=='pets'),bad,
   icons:[610,611,612].map(k=>{try{return iconURL(k).length>500}catch(_){return false}}),names:[610,611,612].map(k=>iname(k))}});
 ok('store: 4 pets, 9 clothes, Pet Home + Food + Treat in a Pets tab',st.n==16&&st.pets.sort().join()=='cat,dog,fox,rabbit'&&st.clo==9&&st.care.sort().join()=='pet_food:610,pet_home:612,pet_treat:611'&&st.tab,st);
 ok('every pet store card draws (still thumbnail + live preview) and the care items have icons + names',st.bad.length==0&&st.icons.every(Boolean)&&st.names.join()=='Pet Food,Pet Treat,Pet Home',st.bad.concat(st.names));
 const so=await E(async()=>{STORE7.open({cat:'pets'});await new Promise(r=>setTimeout(r,300));const n=STORE7.list().length;const tab=!!document.querySelector('#store7 nav [data-c=pets]');STORE7.close();return{n,tab}});
 ok('the store opens on the Pets tab and lists them',so.n==16&&so.tab,so);
 // ---- adopt every species (real purchase flow)
 const ad=await E(async()=>{gems=100000;WX6.force='clear';mobs.length=0;const out={};for(const s of PET10.SPECIES){const r=await SHOP7.buy('pet_'+s);out[s]=r.ok}PET10.ensure();
  return{out,n:PET10.S.pets.length,sp:PET10.S.pets.map(p=>p.sp).sort().join(),names:PET10.S.pets.map(p=>p.nm),homeless:PET10.S.pets.every(p=>!p.home),again:PET10.ensure()}});
 ok('adopting each species (cat, dog, rabbit, fox) creates one pet each, waiting for a home',ad.n==4&&ad.sp=='cat,dog,fox,rabbit'&&Object.values(ad.out).every(Boolean)&&ad.homeless&&ad.again==0,ad);
 // ---- a flat test yard: floor, a 1-block step right of the home, a 3-deep pit left of it, no water or trees
 const yard=await E(()=>{const px=Math.floor(P.x/T)+18,gy=Math.floor((P.y+P.h)/T)+0;const set=(x,y,v)=>{const k=y*W+x;tiles[k]=v;wl[k]=0;trees.delete(k);hp[k]=v?BLK[v][2]:0};
  for(let x=px-4;x<=px+22;x++){for(let y=gy-7;y<gy;y++)set(x,y,0);for(let y=gy;y<gy+4;y++)set(x,y,3)}for(const x of[px-5,px+23])for(let y=gy-8;y<gy+4;y++)set(x,y,3);const hx=px+6;set(hx+2,gy-1,3);for(const x of[hx-3,hx-2])for(let y=gy;y<gy+3;y++)set(x,y,0);
  try{TILE7.dirty&&TILE7.dirty()}catch(_){}P.x=(hx-1)*T+T/2;P.y=gy*T-P.h-1;P.vx=P.vy=0;window._Y={hx,gy};return window._Y});
 await W8(300);
 // ---- place the Pet Home with the real click path (hold it on the hotbar, click the tile)
 const pl=await E(({hx,gy})=>{addI(PET10.HOME,2);HOTBAR.equip(PET10.HOME);const c0=cnt(PET10.HOME);const cl=(tx,ty)=>{mx=(tx+.5)*T-cam.x;my=(ty+.5)*T-cam.y};
  cl(hx,gy+1);useWeapon();const inSolid=PET10.homesHere().length; // a solid tile: refused
  cl(hx,gy-1);useWeapon();wcd=0;const L=PET10.homesHere();return{inSolid,n:L.length,at:L[0]&&[L[0].x,L[0].y],used:c0-cnt(PET10.HOME),moved:PET10.S.pets.every(p=>p.home==(L[0]||{}).id)}},yard);
 ok('a Pet Home is placed by clicking with it held (not into solid ground), uses one item and all 4 pets move in',pl.inSolid==0&&pl.n==1&&pl.at[0]==yard.hx&&pl.at[1]==yard.gy-1&&pl.used==1&&pl.moved,pl);
 await E(({hx,gy})=>{P.x=(hx+9)*T+T/2;P.y=gy*T-P.h-1;P.vx=P.vy=0},yard);
 // ---- wander: within range, on the ground, never inside a block, never in the pit
 const wan=await E(async({hx,gy})=>{const out={bad:[],minx:1e9,maxx:-1e9,grounded:0,samples:0,states:{},moved:{}};const x0={};await _gw(.2);for(const p of PET10.S.pets)PET10.force(p.id,'walk');   // start them walking: a pet that naps the whole window is not a failure
  for(let i=0;i<48;i++){await _gw(.25);mobs.length=0;P.vx=0;for(const p of PET10.S.pets){const r=PET10.RT.get(p.id);if(!r){out.bad.push('no rt '+p.sp);continue}if(x0[p.id]==null)x0[p.id]=r.x;out.moved[p.sp]=Math.max(out.moved[p.sp]||0,Math.abs(r.x-x0[p.id]));
    const tx=r.x/T-hx-.5;out.minx=Math.min(out.minx,tx);out.maxx=Math.max(out.maxx,tx);out.samples++;if(r.g)out.grounded++;out.states[r.st]=1;
    if(solidAt(Math.floor(r.x/T),Math.floor((r.y-4)/T)))out.bad.push(p.sp+' inside a block');if(r.y>gy*T+2)out.bad.push(p.sp+' fell into the pit '+(r.y/T).toFixed(2))}}
  out.minx=+out.minx.toFixed(2);out.maxx=+out.maxx.toFixed(2);return out},yard);
 ok('pets wander left and right within range of their home (±'+4+' tiles, a little slack)',wan.minx>=-5.5&&wan.maxx<=5.5&&Object.values(wan.moved).filter(v=>v>T0()).length>=3,{minx:wan.minx,maxx:wan.maxx,moved:wan.moved});
 function T0(){return 30}
 ok('they stay on the ground, never inside a block or down the pit',wan.bad.length==0&&wan.grounded/wan.samples>.6,{bad:wan.bad.slice(0,4),grounded:+(wan.grounded/wan.samples).toFixed(2)});
 ok('their timers pick varied behaviours by themselves',Object.keys(wan.states).length>=3,Object.keys(wan.states));
 // forced walks: right over the 1-block step (hop up), left towards the pit (turns at the edge)
 const walk=await E(async({hx,gy})=>{const c=PET10.RT.get('pcat'),d=PET10.RT.get('pdog'),rb=PET10.RT.get('prabbit');c.x=(hx+.5)*T;c.y=(gy-1)*T;d.x=(hx-.6)*T;d.y=(gy-1)*T;rb.x=(hx-.2)*T;rb.y=(gy-1)*T;
  const go=()=>{for(const[r,dir,id]of[[c,1,'pcat'],[d,-1,'pdog'],[rb,-1,'prabbit']]){if(r.st!='walk'){PET10.force(id,'walk');r.dir=dir}r.tm=99}};go();c.dir=1;d.dir=-1;rb.dir=-1;
  const o={step:0,cmax:0,pit:0,dturn:0,rturn:0,dmin:99};for(let i=0;i<40;i++){await _gw(.1);go();if(Math.floor(c.x/T)==hx+2&&Math.abs(c.y-(gy-1)*T)<1&&c.g)o.step=1;o.cmax=Math.max(o.cmax,c.x/T-hx-.5);
   for(const r of[d,rb])if(r.y>gy*T+2)o.pit=1;if(d.dir==1)o.dturn=1;if(rb.dir==1)o.rturn=1;o.dmin=Math.min(o.dmin,d.x/T-hx-.5)}for(const id of['pcat','pdog','prabbit'])PET10.force(id,'idle');o.cmax=+o.cmax.toFixed(2);o.dmin=+o.dmin.toFixed(2);return o},yard);
 ok('a walking pet hops up a 1-block step',walk.step==1&&walk.cmax>1.6,walk);
 ok('walking pets (incl. the hopping rabbit) turn at a cliff instead of falling in',walk.pit==0&&walk.dturn&&walk.rturn&&walk.dmin>-2.6,walk);
 // ---- behaviours: frames, particles, sounds
 const beh=await E(async({hx,gy})=>{const V=PET10.VOX,seq=()=>V.log.length?V.log[V.log.length-1].seq:0;V.reset();for(const id of['pcat','pdog','prabbit']){PET10.force(id,'sit');PET10.RT.get(id).tm=99}const r=PET10.RT.get('pfox');r.x=(hx+.5)*T;r.y=(gy-1)*T;r.vx=r.vy=0;
  const res={};const want={sit:['sit','sitb'],talk:['talk'],sleep:['sleep0','sleep1'],stretch:['stretch'],happy:['happy','jump'],eat:['eat0','eat1'],spin:['walk0','walk1','walk2','walk3','jump','idle0']};
  for(const s of['sit','talk','sleep','stretch','happy','eat','spin','hop','flip']){PET10.PT.length=0;const n0=seq();PET10.force('pfox',s);r.tm=Math.max(r.tm,2);const fr=new Set(),dirs=new Set(),pk=new Set(PET10.PT.map(q=>q.k));let air=0,rot=0;
   for(let i=0;i<14;i++){await _gw(.1);fr.add(r.fr);dirs.add(r.dir);if(!r.g)air=1;if(r.rot>0)rot=1;for(const q of PET10.PT)pk.add(q.k)}
   res[s]={st:r.st==s||s=='hop'||s=='flip'||s=='happy',fr:[...fr],ok:want[s]?[...fr].some(f=>want[s].includes(f)):true,pt:[...pk],snd:V.log.filter(q=>q.seq>n0&&q.id=='pfox').map(q=>q.mood+':'+q.v),air,rot,dirs:dirs.size}}
  PET10.force('pfox','idle');for(const id of['pcat','pdog','prabbit'])PET10.force(id,'idle');return res},yard);
 const bf=Object.keys(beh).filter(k=>!beh[k].ok);ok('behaviour frames: sit, talk, sleep, stretch, happy, eat, spin show their poses',bf.length==0,bf.map(k=>k+':'+beh[k].fr.join('/')).join(' ')||'all');
 ok('hop and flip leave the ground (the flip spins), spin turns around',beh.hop.air&&beh.flip.air&&beh.flip.rot&&beh.spin.dirs==2,{hop:beh.hop.air,flip:[beh.flip.air,beh.flip.rot],spin:beh.spin.dirs});
 ok('particles: zzz while sleeping, a note when it talks, hearts when happy, crumbs when eating',beh.sleep.pt.includes('z')&&beh.talk.pt.includes('note')&&beh.happy.pt.includes('heart')&&beh.eat.pt.includes('crumb'),{sleep:beh.sleep.pt,talk:beh.talk.pt,happy:beh.happy.pt,eat:beh.eat.pt});
 ok('state-aware voices: its talk turn speaks, a flip is a happy fox sound, eating munches, sleeping only breathes / snores',beh.talk.snd.some(x=>/^(soft|happy):fox./.test(x))&&beh.flip.snd.some(x=>/^happy:fox./.test(x))&&beh.eat.snd.includes('happy:munch')&&beh.sleep.snd.length>=1&&beh.sleep.snd.every(x=>/^sleep:fox.(breath|snore)$/.test(x)),{talk:beh.talk.snd,flip:beh.flip.snd,eat:beh.eat.snd,sleep:beh.sleep.snd});
 const fol=await E(async({hx,gy})=>{const r=PET10.RT.get('pcat');r.x=(hx+.5)*T;r.y=(gy-1)*T;P.x=(hx+3.6)*T;P.y=gy*T-P.h-1;P.vx=0;await _gw(.05);PET10.force('pcat','follow');r.tm=4;const x0=r.x;
  await _gw(1.6);const d=r.x-x0;P.x=(hx+9)*T+T/2;return{d:Math.round(d),st:r.st}},yard);
 ok('a happy pet follows you a little',fol.d>T0(),fol);
 // cute extras: walking up to a pet makes it wiggle happily (a heart, it keeps its state); hops land with a squash; new poses exist
 const cute=await E(async({hx,gy})=>{const r=PET10.RT.get('pcat');P.x=(hx+9)*T;P.y=gy*T-P.h-1;P.vx=0;r.x=(hx+.5)*T;r.y=gy*T;r.vx=r.vy=0;PET10.force('pcat','sit');r.tm=30;r.wigN=0;await _gw(.3);
  PET10.PT.length=0;P.x=r.x+40;const o={fr:new Set(),hearts:0,st:new Set(),land:0};for(let i=0;i<8;i++){await _gw(.1);o.fr.add(r.fr);o.st.add(r.st);if(PET10.PT.some(q=>q.k=='heart'))o.hearts=1}
  const f=PET10.RT.get('pfox');f.x=(hx-.5)*T;f.y=(gy-1)*T;f.vx=f.vy=0;await _gw(.1);PET10.force('pfox','hop');for(let i=0;i<30&&!o.land;i++){await _gw(.05);if(f.land>0)o.land=1}
  P.x=(hx+9)*T+T/2;PET10.force('pcat','idle');o.fr=[...o.fr];o.st=[...o.st];o.poses=['wig0','wig1','twitch','sitt'].every(k=>PET10.FR[k]&&PET10.sprite('cat',0,k,'',{}).width>0);return o},yard);
 ok('walking up to a pet makes it wiggle happily with a heart (it keeps sitting); a hop lands with a squash; twitch / wiggle poses draw',cute.fr.some(f=>f=='wig0'||f=='wig1')&&cute.hearts&&cute.st.join()=='sit'&&cute.land&&cute.poses,cute);
 // ---- voices: per-species sets, state picks happy / soft / sleep, +-5% pitch jitter, rate limits, mixing (pan, distance, off-screen, SFX volume)
 const vx=await E(async({hx,gy})=>{const V=PET10.VOX,o={};const M=['happy','soft','sleep'];
  o.sets=PET10.SPECIES.filter(sp=>!M.every(m=>Array.isArray(V.SETS[sp][m])&&V.SETS[sp][m].length>=2&&V.SETS[sp][m].every(id=>id.startsWith(sp+'.')&&typeof V.FN[id]=='function')));
  const all=PET10.SPECIES.flatMap(sp=>M.flatMap(m=>V.SETS[sp][m]));o.unique=new Set(all).size==all.length&&typeof V.FN[V.SETS.cat.purr]=='function';
  o.synth=[];try{ac()}catch(_){}if(typeof AC!='undefined'&&AC){const g=AC.createGain();g.gain.value=0;g.connect(AC.destination);for(const id in V.FN){try{const d=V.FN[id]({t:AC.currentTime+.01,o:g,f:1,v:.0001});if(!(d>0))o.synth.push(id+' len')}catch(e){o.synth.push(id+' '+e.message)}}}else o.synth.push('no audio');
  P.x=(hx+1)*T;P.y=gy*T-P.h-1;P.vx=P.vy=0;const L={};PET10.S.pets.forEach(p=>{const r=PET10.RT.get(p.id),i=PET10.SPECIES.indexOf(p.sp);r.x=(hx+[-.2,.4,2,2.6][i])*T;r.y=gy*T;r.vx=r.vy=0;PET10.force(p.id,'sit');r.tm=60;L[p.sp]=[p,r]});await _gw(.3);V.reset();
  const[cp,cr]=L.cat,[dp,dr]=L.dog,[bp,br]=L.rabbit,[fp,fr]=L.fox;
  o.mood={fetch:V.moodOf(cp,{st:'fetch',x:cr.x,y:cr.y}),flip:V.moodOf(dp,{st:'flip',x:dr.x,y:dr.y}),petted:V.moodOf(cp,cr,'purr'),fed:V.moodOf(dp,dr,'eat'),wiggle:V.moodOf(bp,{st:'sit',wig:1,x:br.x,y:br.y}),idleFar:V.moodOf(fp,{st:'idle',x:P.x+T*8,y:gy*T}),asleep:V.moodOf(fp,{st:'sleep',x:fr.x,y:fr.y})};
  PET10.timeShift(3*3600e3);o.mood.hungryPlay=V.moodOf(dp,{st:'fetch',x:dr.x,y:dr.y},'happy');o.mood.hungryTalk=V.moodOf(fp,fr,'talk');PET10.timeShift(0);
  const a=V.say(cp,cr,'happy');o.happy=a&&{mood:a.mood,inSet:V.SETS.cat.happy.includes(a.v),played:a.played||typeof AC=='undefined'||!AC,pan:a.pan,vol:a.vol};
  o.gap=V.say(cp,cr,'happy')===null&&V.why;const b=V.say(dp,dr,'happy');o.second=!!b;o.busy=V.say(bp,br,'happy')===null&&V.why;o.busyChat=V.say(fp,fr,'chat')===null&&V.why;o.talking=V.talking().length;
  V.reset();PET10.timeShift(3*3600e3);const c=V.say(fp,fr,'talk');PET10.timeShift(0);o.sad=c&&{mood:c.mood,inSet:V.SETS.fox.soft.includes(c.v),vol:c.vol,pan:c.pan};
  V.reset();PET10.force('prabbit','sleep');const z=V.say(bp,br,'sleep');o.sleep=z&&{mood:z.mood,inSet:V.SETS.rabbit.sleep.includes(z.v),vol:z.vol};PET10.force('prabbit','sit');
  const J=[];for(let i=0;i<2000;i++)J.push(V.jit());o.jit=[Math.min(...J),Math.max(...J)].map(x=>+x.toFixed(4));o.logJit=V.log.every(q=>q.j>=.95&&q.j<=1.05);
  V.reset();const sv=OPT.sv;OPT.sv=0;o.muted=V.say(dp,dr,'happy')===null&&V.why;OPT.sv=sv;
  V.reset();const x0=dr.x;dr.x=P.x+T*70;o.off=V.say(dp,dr,'happy')===null&&V.why;dr.x=x0;
  V.reset();const vs=[];for(let i=0;i<40;i++){const q=V.say(cp,cr,'happy');if(q)vs.push(q.v);V.reset()}o.variety=new Set(vs).size;
  for(const p of PET10.S.pets)PET10.force(p.id,'idle');P.x=(hx+9)*T+T/2;V.reset();return o},yard);
 ok('every species has its own voice set (happy / soft / sleep, 2-3 variants each, a cat purr) and every variant synthesizes',vx.sets.length==0&&vx.unique&&vx.synth.length==0,{sets:vx.sets,unique:vx.unique,synth:vx.synth.slice(0,4)});
 ok('the pet state picks the voice: playing / petted / fed / wiggling = happy, idle far away or hungry = soft, asleep = sleep',vx.mood.fetch=='happy'&&vx.mood.flip=='happy'&&vx.mood.petted=='happy'&&vx.mood.fed=='happy'&&vx.mood.wiggle=='happy'&&vx.mood.idleFar=='soft'&&vx.mood.asleep=='sleep'&&vx.mood.hungryPlay=='soft'&&vx.mood.hungryTalk=='soft'
  &&vx.happy&&vx.happy.mood=='happy'&&vx.happy.inSet&&vx.happy.played&&vx.sad&&vx.sad.mood=='soft'&&vx.sad.inSet&&vx.sleep&&vx.sleep.mood=='sleep'&&vx.sleep.inSet&&vx.sleep.vol<vx.happy.vol*.5&&vx.variety>=2,{mood:vx.mood,happy:vx.happy,sad:vx.sad,sleep:vx.sleep,variety:vx.variety});
 ok('pitch jitter stays within +-5% (and uses the range)',vx.jit[0]>=.95&&vx.jit[1]<=1.05&&vx.jit[0]<.96&&vx.jit[1]>1.04&&vx.logJit,vx.jit);
 ok('rate limits: one reaction per pet every 1.5 s, never more than 2 pets talking (idle chatter waits too)',vx.gap=='gap'&&vx.second&&vx.busy=='busy'&&vx.busyChat=='busy'&&vx.talking==2,{gap:vx.gap,second:vx.second,busy:vx.busy,chat:vx.busyChat,talking:vx.talking});
 ok('mixing: panned by screen position (left of you = left), silent off-screen and with the SFX volume at 0',vx.happy.pan<0&&vx.sad.pan>0&&vx.off=='off'&&vx.muted=='muted',{pan:[vx.happy.pan,vx.sad.pan],off:vx.off,muted:vx.muted});
 // ---- Pet UI: E opens it, clothes + colours, locked items go to the store
 await E(async({hx,gy})=>{for(const c of Object.keys(PET10.CL))if(c!='wings')await SHOP7.buy('petc_'+c);const r=PET10.RT.get('pcat');PET10.force('pcat','sit');r.tm=30;r.x=(hx+1.5)*T;r.y=gy*T;r.vy=0;P.x=r.x+30;P.y=(gy)*T-P.h-1;P.vx=P.vy=0},yard);
 await E(async()=>{for(let i=0;i<30&&!PET10.nearest();i++){const r=PET10.RT.get('pcat');P.x=r.x+20;P.y=r.y-P.h-1;P.vx=P.vy=0;await new Promise(q=>setTimeout(q,50))}});await p.keyboard.press('e');await W8(300);
 const ui=await E(()=>({on:PET10.ui.on,vis:document.getElementById('petui').style.display,pid:PET10.ui.pid,tabs:document.querySelectorAll('#petui .tb10').length,chips:document.querySelectorAll('#petui .ch10').length}));
 ok('E next to a pet opens its Pet UI (4 pet tabs + store, every clothing chip)',ui.on&&ui.vis=='block'&&ui.tabs==5&&ui.chips==13,ui);
 await p.click('#petui .tb10[data-id=pcat]');await W8(120);
 await p.click('#petui [data-a=wear][data-id=bow]');await W8(80);await p.click('#petui [data-a=col][data-c="#5ab0ff"]');await W8(80);
 await p.click('#petui [data-a=wear][data-id=sweater]');await W8(80);await p.click('#petui [data-a=col][data-c="#ffd34a"]');await W8(80);
 await p.click('#petui [data-a=wear][data-id=scarf]');await W8(80);await p.$eval('#petui input[type=color]',e=>{e.value='#12ab34';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))});await W8(80);
 await p.click('#petui [data-a=wear][data-id=cape]');await W8(80);
 await p.click('#petui [data-a=fur][data-i="2"]');await W8(80);
 await p.fill('#petui [data-a=nm]','Sir Whiskers');await p.press('#petui [data-a=nm]','Enter');await W8(120);
 const cl=await E(()=>{const c=PET10.S.pets.find(p=>p.id=='pcat');const r=PET10.RT.get('pcat');const im=PET10.sprite(c.sp,c.fur,'idle0','',c.clo);return{clo:JSON.stringify(c.clo),fur:c.fur,nm:c.nm,cache:PET10.CACHE.size,img:im.width,on:PET10.ui.on,label:document.querySelector('#petui .tb10.on').textContent}});
 ok('clothes chips + colour swatches + the colour picker dress the pet (one item per slot)',cl.clo==JSON.stringify({head:['bow','#5ab0ff'],body:['sweater','#ffd34a'],neck:['scarf','#12ab34'],back:['cape','#b3263a']}),cl.clo);
 ok('fur colour and name change from the UI',cl.fur==2&&cl.nm=='Sir Whiskers'&&/Sir Whiskers/.test(cl.label)&&cl.on,cl);
 await p.click('#petui [data-a=wear][data-id=wings]');await W8(400);
 ok('a clothing item you do not own opens it in the store instead',await E(()=>STORE7.isOpen&&STORE7.selected=='petc_wings'&&!PET10.ui.on));
 await E(()=>STORE7.close());await W8(200);
 // the outfit renders in the world and in the panel (cached: a second request is the same canvas)
 ok('dressed sprites are cached per outfit (same canvas twice, recolour = new entry)',await E(()=>{const c=PET10.S.pets.find(p=>p.id=='pcat');const a=PET10.sprite(c.sp,c.fur,'walk1','',c.clo),b=PET10.sprite(c.sp,c.fur,'walk1','',c.clo),cc=JSON.parse(JSON.stringify(c.clo));cc.head[1]='#000000';return a===b&&PET10.sprite(c.sp,c.fur,'walk1','',cc)!==a}));
 // ---- hunger over (mocked) time, feeding resets it
 const hu=await E(async({hx,gy})=>{const d=PET10.S.pets.find(p=>p.id=='pdog');const r=PET10.RT.get('pdog');r.x=(hx-.5)*T;r.y=(gy-1)*T;P.x=r.x+30;
  const o={h0:+PET10.hunger(d).toFixed(3),hun0:PET10.hungry(d)};PET10.timeShift(1.2*3600e3);o.h1=+PET10.hunger(d).toFixed(2);o.hun1=PET10.hungry(d);PET10.timeShift(2.1*3600e3);o.h2=+PET10.hunger(d).toFixed(2);o.hun2=PET10.hungry(d);
  await _gw(.4);o.mood=r.mood;o.play=PET10.play('pdog');for(const k of[PET10.FOOD,PET10.TREAT])inv[k]=0;o.nofood=PET10.feed('pdog');o.hap0=Math.round(PET10.happy(d));return o},yard);
 ok('hunger rises over (mocked) real time: fine after 1 h, hungry after 2 h',hu.h0<.01&&!hu.hun0&&hu.h1>.5&&hu.h1<.7&&!hu.hun1&&hu.h2>=1&&hu.hun2,hu);
 ok('a hungry pet looks sad and refuses to play; feeding without food is refused',hu.mood=='sad'&&!hu.play.ok&&/hungry/.test(hu.play.m)&&!hu.nofood.ok,{mood:hu.mood,play:hu.play.m,nofood:hu.nofood.m});
 await E(()=>{addI(PET10.FOOD,3);addI(PET10.TREAT,1);PET10.open('pdog',null)});await W8(200);
 await p.click('#petui [data-a=feed]');await W8(200);
 const fd=await E(()=>{const d=PET10.S.pets.find(p=>p.id=='pdog');return{h:+PET10.hunger(d).toFixed(3),food:cnt(PET10.FOOD),st:PET10.RT.get('pdog').st,meals:d.n.meals,hap:Math.round(PET10.happy(d)),again:PET10.feed('pdog').ok,bar:document.querySelector('#petui .f10 b').style.width}});
 ok('Feed (Pet UI) uses one Pet Food, resets hunger, plays the eating animation',fd.h<.01&&fd.food==2&&fd.st=='eat'&&fd.meals==1&&fd.bar=='100%'&&fd.again===0,fd);
 const tr=await E(()=>{const d=PET10.S.pets.find(p=>p.id=='pdog');const h0=PET10.happy(d);const r=PET10.feed('pdog',true);return{ok:r.ok,up:Math.round(PET10.happy(d)-h0),treats:cnt(PET10.TREAT)}});
 ok('a Pet Treat makes it much happier',tr.ok&&tr.up>=15&&tr.treats==0,tr);
 const pt=await E(async()=>{const d=PET10.S.pets.find(p=>p.id=='pdog');d.hap=40;d.hapT=Date.now()+PET10.S.off;const a=PET10.pet('pdog');await new Promise(q=>setTimeout(q,50));return{ok:a.ok,hap:Math.round(PET10.happy(d)),st:PET10.RT.get('pdog').st,spam:PET10.pet('pdog').ok}});
 ok('petting raises happiness, shows hearts and has a short cooldown',pt.ok&&pt.hap>=45&&pt.st=='happy'&&!pt.spam,pt);
 await E(()=>PET10.close());
 // ---- play: throw the ball, the dog fetches it and brings it back
 const pb=await E(async({hx,gy})=>{const d=PET10.S.pets.find(p=>p.id=='pdog');P.x=(hx+3.5)*T;P.y=gy*T-P.h-1;P.vx=P.vy=0;const r=PET10.RT.get('pdog');r.x=(hx+.5)*T;r.y=(gy-1)*T;
  const h0=PET10.happy(d),n0=d.n.plays,a=PET10.play('pdog');const o={ok:a.ok,ball:!!PET10.ball,states:new Set(),held:0,t:0};
  for(let i=0;i<150&&(PET10.ball||o.t<1);i++){await _gw(.1);o.t+=.1;o.states.add(r.st);if(PET10.ball&&PET10.ball.st=='held')o.held=1;mobs.length=0}
  o.states=[...o.states];o.back=!PET10.ball;o.plays=d.n.plays-n0;o.up=Math.round(PET10.happy(d)-h0);o.dist=+(Math.abs(r.x-P.x)/T).toFixed(2);o.t=+o.t.toFixed(1);return o},yard);
 ok('Play ball: the ball flies, the dog runs to it, carries it back to you, happiness goes up',pb.ok&&pb.ball&&pb.held&&pb.back&&pb.plays==1&&pb.up>=10&&pb.states.includes('fetch')&&pb.states.includes('ret')&&pb.dist<2,pb);
 await shot('world');
 // ---- E closes / Esc closes
 await E(({hx,gy})=>{const r=PET10.RT.get('prabbit');PET10.force('prabbit','sit');r.tm=30;r.x=(hx+1)*T;r.y=gy*T;r.vy=0;P.x=r.x+24;P.y=gy*T-P.h-1;P.vx=0},yard);await E(async()=>{for(let i=0;i<30&&!PET10.nearest();i++)await new Promise(q=>setTimeout(q,50))});
 await p.keyboard.press('e');await W8(250);const o1=await E(()=>PET10.ui.on&&!!PET10.ui.pid);await shot('ui');
 await p.keyboard.press('e');await W8(200);const o2=await E(()=>!PET10.ui.on);await p.keyboard.press('e');await W8(200);await p.keyboard.press('Escape');await W8(200);const o3=await E(()=>!PET10.ui.on&&document.getElementById('petui').style.display=='none');
 ok('E opens the nearest pet, E and Esc close the Pet UI',o1&&o2&&o3,[o1,o2,o3]);
 // ---- persistence across a reload
 await E(()=>{PET10.timeShift(0);PET10.save()});const before=await E(()=>JSON.parse(localStorage.getItem((typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpet10')));
 await enter(p,'pettest',true);await W8(1200);
 const rl=await E(()=>{const c=PET10.S.pets.find(p=>p.id=='pcat');return{n:PET10.S.pets.length,clo:JSON.stringify(c&&Object.fromEntries(Object.entries(c.clo).sort())),nm:c&&c.nm,fur:c&&c.fur,homes:(PET10.S.homes.pettest||[]).length,homed:PET10.S.pets.every(p=>PET10.homeById(p.home)),rt:PET10.S.pets.filter(p=>PET10.RT.get(p.id)).length,
  dogfed:PET10.S.pets.find(p=>p.id=='pdog').fed,meals:PET10.S.pets.find(p=>p.id=='pdog').n.meals}});
 ok('pets, names, fur, outfits, homes and meal times survive a reload; pets come back at their home',rl.n==4&&rl.clo==JSON.stringify({back:['cape','#b3263a'],body:['sweater','#ffd34a'],head:['bow','#5ab0ff'],neck:['scarf','#12ab34']})&&rl.nm=='Sir Whiskers'&&rl.fur==2&&rl.homes==1&&rl.homed&&rl.rt==4&&rl.dogfed==before.pets.find(p=>p.id=='pdog').fed&&rl.meals==2,rl);
 // ---- picking the home up and placing it again
 const pu=await E(async()=>{const h=PET10.homesHere()[0];WX6.force='clear';mobs.length=0;const gy=h.y+1;for(let x=h.x-3;x<=h.x+3;x++){for(let y=h.y-4;y<=h.y;y++){const k=y*W+x;tiles[k]=0;wl[k]=0;trees.delete(k)}tiles[gy*W+x]=3}
  P.x=(h.x-1.5)*T;P.y=gy*T-P.h-1;P.vx=P.vy=0;await new Promise(q=>setTimeout(q,200));HOTBAR.equip('w:fist');const c0=cnt(PET10.HOME);const cl=()=>{mx=(h.x+.5)*T-cam.x;my=(h.y+.5)*T-cam.y};
  for(let i=0;i<3;i++){cl();wcd=0;useWeapon();await new Promise(q=>setTimeout(q,120))}const o={gone:PET10.homesHere().length==0,got:cnt(PET10.HOME)-c0,homeless:PET10.S.pets.every(p=>!p.home),rt:PET10.S.pets.filter(p=>PET10.rt(p)).length};
  HOTBAR.equip(PET10.HOME);cl();useWeapon();o.back=PET10.homesHere().length==1&&PET10.S.pets.every(p=>p.home==PET10.homesHere()[0].id);await new Promise(q=>setTimeout(q,300));o.rt2=PET10.S.pets.filter(p=>PET10.RT.get(p.id)).length;return o});
 ok('hitting the Pet Home 3 times picks it up (item back, pets wait); placing it again re-homes them',pu.gone&&pu.got==1&&pu.homeless&&pu.rt==0&&pu.back&&pu.rt2==4,pu);
 // ---- bad saved data never breaks anything
 const bad=await E(()=>{const K=(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpet10',keep=localStorage.getItem(K);const res=[];
  for(const v of['{bad json','null','[]','{"pets":"x","homes":5}',JSON.stringify({pets:[{sp:'dragon'},{sp:'cat',fur:99,nm:'<b>x</b>'.repeat(9),clo:{head:['wings','#zzz'],neck:['collar','javascript'],body:['sweater','#ABCDEF']},fed:'soon',hap:1e9},{sp:'cat'},null,5],homes:{w1:[{x:-5,y:2},{x:10,y:10,id:'<x>'}],w2:'no'}})]){
   localStorage.setItem(K,v);try{PET10.load();res.push(PET10.S.pets.length+':'+Object.keys(PET10.S.homes).length)}catch(e){res.push('THROW '+e.message)}}
  const c=PET10.S.pets[0];const o={res,c:c&&{fur:c.fur,nm:c.nm,clo:c.clo,fed:Number.isFinite(c.fed),hap:c.hap},home:PET10.S.homes.w1&&PET10.S.homes.w1[0]};localStorage.setItem(K,keep);PET10.load();o.restored=PET10.S.pets.length;return o});
 ok('garbage / hostile saved data is cleaned (bad species, colours, slots, numbers, names, homes)',bad.res.slice(0,4).every(r=>r=='0:0')&&bad.res[4]=='1:1'&&bad.c.fur==3&&!/[<>]/.test(bad.c.nm)&&bad.c.nm.length<=14&&JSON.stringify(bad.c.clo)=='{"neck":["collar","#d8344a"],"body":["sweater","#abcdef"]}'&&bad.c.fed&&bad.c.hap==100&&bad.home.x==10&&bad.home.id=='x'&&bad.restored==4,bad);
 // ---- cost: far pets do not run physics; the sprite cache stays small
 const cost=await E(async()=>{for(let i=0;i<40&&!PET10.RT.get('pcat');i++)await new Promise(q=>requestAnimationFrame(q));   // runtime state is rebuilt on the next tick after a load
  const r=PET10.RT.get('pcat');P.x=Math.min(W*T-200,P.x+T*60);await _gw(1.2);const x0=r.x,f=r.far;await _gw(.5);return{far:f,still:r.x==x0,cache:PET10.CACHE.size,pt:PET10.PT.length}});
 ok('off-screen pets only keep their timers (no physics) and caches stay bounded',cost.far==1&&cost.still&&cost.cache<300&&cost.pt<=40,cost);
 ok('no page errors',errs.length==0,errs.slice(0,4));
 console.log(fails?fails+' FAILED':'all petcare tests passed');await b.close();process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
