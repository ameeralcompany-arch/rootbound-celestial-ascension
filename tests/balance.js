// Balance (ARENA7 + BMOVE12 + BAL11 + CLASS7): the boss arena is tall enough to fly in (you reach the soft ceiling, it stops you gently, the camera
// keeps you and the boss in view, your zoom comes back afterwards), every boss moves (and stays inside the arena, out of the walls), weapon power
// (WPOWER) is monotonic in rarity and level, each weapon's measured power sits in its rarity band, classes land within +-12% of each other at
// class levels 1 / 25 / 50, class level bonuses grow by the same total value for every class, and every class beats every boss at the expected
// level in a reasonable simulated time. Weapons are measured headlessly against training dummies on a virtual clock (fixed random seed).
// Prints the class table. Run: node tests/balance.js
const {chromium}=require('playwright');const path=require('path');let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?'  - '+(typeof x=='string'?x:JSON.stringify(x)):''));if(!c)fails++};
const URL='file://'+path.resolve(__dirname,'../index.html');
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},400000).unref();
const IDS=['warden','sovereign','eclipse','magma','tide','storm'];
// page-side simulator: pauses the real loop, runs update + boss tick on a virtual clock, keeps the player and dummies pinned, sums the damage
const SIMLIB=`window.SIM=(()=>{let vt=0,on=false,seed=1;const pn=Performance.prototype.now,rnd0=Math.random;
 const rng=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 function start(){if(on)return;on=true;vt=pn.call(performance);performance.now=()=>vt;window.RB_COVER=1;Math.random=rng;seed=12345}
 function stop(){if(!on)return;on=false;delete performance.now;window.RB_COVER=0;Math.random=rnd0}
 let x0=0,fy=0,fixL={};
 function flat(){const px=Math.floor(P.x/T);fy=Math.floor((P.y+P.h-2)/T);for(let x=px-18;x<=px+22;x++){for(let y=fy-14;y<=fy;y++){const k=y*W+x;tiles[k]=0;wl[k]=0;trees.delete(k)}for(let y=fy+1;y<=fy+3;y++){const k=y*W+x;tiles[k]=1;hp[k]=BLK[1][2]}}
  P.x=px*T+T/2;P.y=(fy+1)*T-P.h-.5;P.vx=P.vy=0;x0=P.x}
 const mk=(dx,o)=>({k:'golem',x:x0+dx,y:(fy+1)*T-72,w:56,h:72,vx:0,vy:0,hp:1e9,mhp:o.mhp||1e9,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:true,wall:0,stun:99,dum:1});
 function pin(D,o){P.x=x0;P.vx=0;P.f=1;iT=999;P.hp=maxHP()*(o.hp||1);lvl=fixL.lvl;xp=0;prof.fight.l=fixL.fight;prof.fight.x=0;for(const k in CLASS7.S.lv){CLASS7.S.lv[k]=fixL.cl;CLASS7.S.xp[k]=0}
  mobs.length=0;for(const d of D){d.x=d.x0;d.y=(fy+1)*T-d.h;d.vx=d.vy=0;d.stun=99;if(o.mhp)d.mhp=o.mhp;mobs.push(d)}showInv=false;dlgOpen=false}
 function step(dt){vt+=dt*1000;window.FDT=dt;update(dt);BOSS6.tick(dt);VFX.update(dt)}
 function run(id,dxs,secs,o){const D=dxs.map(dx=>{const m=mk(dx,o);m.x0=m.x;return m}),dt=1/60;wp=id;own[id]=1;wcd=0;mdL=false;for(let i=0;i<70;i++){pin([],o);step(dt)}wp=id;wcd=0;let tot=0,t=0;
  const n=Math.round(secs/dt);for(let i=0;i<n;i++){pin(D,o);const a=D[0];mx=a.x-cam.x;my=a.y+a.h/2-cam.y;mdL=id=='sniper'?(t%1.25)<1.17:true;step(dt);t+=dt;
   for(const d of D){if(d.dead){d.dead=0;d.hp=1e9}if(d.hp<5e8){tot+=1e9-d.hp;d.hp=1e9}}}mdL=false;for(const d of D)tot+=1e9-d.hp;return tot/secs}
 function weapon(id,o){o=o||{};start();try{flat();fixL={lvl:o.lvl||60,cl:o.cl||1,fight:o.fight||25};const L9=(1+LVL9.dmgB(fixL.lvl))*(1+fixL.fight*.04)/1.04,s=o.secs||20;
   const near=run(id,[70],s,o)/L9,far=run(id,[300],s,o)/L9,nearA=o.noaoe?0:run(id,[70,105,140],s,o)/L9,farA=o.noaoe?0:run(id,[290,325,360],s,o)/L9;return{near,far,nearA,farA}}
  finally{stop();mobs.length=0;wp='fist';mdL=false}}
 return{weapon}})();`;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
 await p.addInitScript(()=>{if(!localStorage.getItem('rb_session'))localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}));localStorage.setItem('rbb10',JSON.stringify({warden:1,sovereign:1,eclipse:1,magma:1,tide:1,storm:1}))});
 const E=(f,a)=>p.evaluate(f,a),Wt=ms=>p.waitForTimeout(ms),until=(f,a,t)=>p.waitForFunction(f,a,{timeout:t||9000}).then(()=>true,()=>false);
 await p.goto(URL);await Wt(700);await E(()=>document.getElementById('bp').click());await Wt(500);await E(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=40;cel.wing='auto'});await Wt(300);
 await E(()=>enterWorld('bossarena'));await Wt(2500);await E(()=>{try{WX6.force='clear'}catch(_){}P.hp=maxHP()});
 const z0=await E(()=>ZM);
 // ---- arena + boss movement
 for(const id of IDS){
  const s=await E(id=>{mobs.length=0;BOSS6.clear();let ok=false;for(let i=0;i<10&&!ok;i++)ok=BOSS6.spawn(id);if(ok)BOSS10.skip();return ok},id);ok(id+': spawns',s);if(!s)continue;
  await until(()=>!BOSS10.kind&&ARENA7.arena&&!ARENA7.arena.pend,null,8000);await Wt(200);
  const a=await E(()=>{const A=ARENA7.arena;return{w:(A.x1-A.x0)/T,h:(A.y1-A.y0)/T,cam:!!window.CAMT,ZM,fit:A.fit}});
  ok(id+': arena is tall and wide (>= 17 x 30 tiles) and the camera frames the fight',a.h>=17&&a.w>=30&&a.cam&&a.ZM>=.7,a);
  const tr=await E(async()=>{const out=[];for(let i=0;i<16;i++){iT=999;P.hp=maxHP();const m=BOSS6.active(),A=ARENA7.arena;if(!m||!A)break;
    out.push({x:m.x,y:m.y,in:m.x-m.w/2>=A.x0-1&&m.x+m.w/2<=A.x1+1&&m.y>=A.y0-1&&m.y+m.h<=A.y1+1,clip:!!boxHit(m),vis:m.x>cam.x-m.w/2&&m.x<cam.x+cv.width/ZM+m.w/2&&m.y+m.h>cam.y&&m.y<cam.y+cv.height/ZM,pv:P.y>=cam.y-P.h&&P.y<=cam.y+cv.height/ZM});await new Promise(r=>setTimeout(r,250))}return out});
  let pathL=0;for(let i=1;i<tr.length;i++)pathL+=Math.hypot(tr[i].x-tr[i-1].x,tr[i].y-tr[i-1].y);const span=tr.length?Math.max(...tr.map(t=>t.x))-Math.min(...tr.map(t=>t.x))+Math.max(...tr.map(t=>t.y))-Math.min(...tr.map(t=>t.y)):0;
  ok(id+': the boss moves (path over 4 s)',tr.length>=12&&pathL>48*3&&span>48*1.5,{pathL:Math.round(pathL),span:Math.round(span)});
  ok(id+': stays inside the arena and out of the walls, boss + player in view',tr.every(t=>t.in)&&tr.filter(t=>t.clip).length<=3&&tr.filter(t=>t.vis&&t.pv).length>=tr.length-2,tr.map(t=>(t.in?'':'O')+(t.clip?'C':'')+(t.vis?'':'V')+(t.pv?'':'P')).join(','));
  if(id=='storm'){// flight: jump, hold Space; you reach the soft ceiling, it stops you gently (no bump through), camera keeps you in view
   const f=await E(async()=>{const A=ARENA7.arena,fx=(A.x0+A.x1)/2,fg=BOSSX.gyAt(fx,A.y0+T);P.x=fx;P.y=fg-P.h-T;P.vy=-650;P.g=false;iT=999;FLY7.F.sta=1;K[' ']=true;let top=1e9,vis=0,n=0,vy=0;
     for(let i=0;i<70;i++){await new Promise(r=>setTimeout(r,100));iT=999;P.hp=maxHP();top=Math.min(top,P.y);n++;if(P.y>=cam.y-4&&P.y+P.h<=cam.y+cv.height/ZM+4)vis++;vy=P.vy}K[' ']=false;
     return{fromTop:(top-A.y0)/T,above:top<A.y0-1,vis,n,vy,rip:A.rip.length,wing:!!curWing(lvl)}});
   ok('flight: you can fly up to the soft ceiling of the arena (within 2.5 tiles of the top)',f.wing&&f.fromTop<=2.5&&!f.above,f);
   ok('flight: the soft ceiling stops the climb gently (ripple feedback, no climbing through)',f.rip>0&&f.vy>-60&&!f.above,f);
   ok('flight: the camera keeps you in view all the way up',f.vis>=f.n-3,f)}
  await E(()=>{BOSS10.stop();mobs.length=0;BOSS6.clear()});await until(()=>!ARENA7.arena,null,6000);await until(()=>!document.getElementById('cine7b'),null,6000);await E(()=>{P.hp=maxHP()})}
 const z1=await E(()=>ZM);ok('your camera zoom comes back when the arena is gone',Math.abs(z1-z0)<1e-6,{z0,z1});
 // ---- weapon power: rarity bands, monotonic, level order
 const wp=await E(()=>{const RO=BAL11.RO,ids=Object.keys(WPN).filter(id=>WPN[id].md>0&&WPN[id].k!='tool');const o={n:ids.length,bad:[],rows:ids.map(id=>({id,r:RO.indexOf(WPNRAR(id)),p:WPOWER(id),lv:WPN[id].lv|0}))};
  for(const x of o.rows)if(!(x.p>0)||x.r<0)o.bad.push(x.id);for(let r=0;r<5;r++){const a=o.rows.filter(x=>x.r==r),c=o.rows.filter(x=>x.r==r+1);if(a.length&&c.length&&Math.max(...a.map(x=>x.p))>=Math.min(...c.map(x=>x.p)))o.bad.push('band '+RO[r])}
  for(let r=0;r<6;r++){const a=o.rows.filter(x=>x.r==r).sort((p,q)=>p.lv-q.lv);for(let i=1;i<a.length;i++)if(a[i].lv>a[i-1].lv&&a[i].p<a[i-1].p)o.bad.push('lv '+a[i].id)}
  o.gunLv=GUN9.IDS.every((id,i,L)=>!i||WPOWER(id)>=WPOWER(L[i-1]));return o});
 ok('WPOWER: every weapon has a power and a rarity; power is monotonic in rarity (common < ... < mythic) and in level',wp.bad.length==0&&wp.gunLv&&wp.n>=60,wp.bad);
 await E(SIMLIB);await E(()=>{enterWorld('baltest')});await Wt(1500);
 const meas=await E(()=>{const o={};for(const id of Object.keys(WPN))if(WPN[id].md>0&&WPN[id].k!='tool')o[id]=SIM.weapon(id);return o});
 const val=v=>{const r=v.far>=.5*v.near,S=r?(v.near+v.far)/2:v.near,A=Math.min(3.5,r?(v.nearA+v.farA)/Math.max(1e-6,v.near+v.far):v.nearA/Math.max(1e-6,v.near));return{r,S,V:S*(1+.15*(A-1))*(r?1.1:1)}};
 const info=await E(()=>{const o={};for(const id of Object.keys(WPN))if(WPN[id].md>0)o[id]={rar:WPNRAR(id),p:WPOWER(id),cls:CLASS7.of(WPN[id]),lv:WPN[id].lv|0};return{o,C:Object.fromEntries(Object.entries(CLASS7.C).map(([k,c])=>[k,c.ids.filter(id=>WPN[id])]))}});
 const off=[];for(const id in meas){const v=val(meas[id]),e=v.V/info.o[id].p-1;meas[id].v=v;meas[id].e=e;if(Math.abs(e)>.2)off.push(id+' '+Math.round(e*100)+'%')}
 ok('each weapon\'s measured power is within 20% of its rarity band target (WPOWER)',off.length==0,off);
 // ---- classes at class level 1 / 25 / 50
 const LV=[1,25,50],cls=info.C;
 const cm=await E(([cls,LV])=>{const o={};for(const k in cls){o[k]={};for(const id of cls[k]){o[k][id]={};for(const L of LV){const opt={cl:L,noaoe:1,secs:12,hp:k=='berserker'?.65:1};const a=SIM.weapon(id,opt);
     if(k=='reaper'){const b=SIM.weapon(id,Object.assign({},opt,{mhp:3e9}));a.near=1/(.65/a.near+.35/b.near);a.far=a.far&&b.far?1/(.65/a.far+.35/b.far):0}o[k][id][L]=a}}}return o},[cls,LV]);
 const bonus=await E(()=>{const o={};for(const k in CLASS7.C){o[k]={};for(const L of[1,10,25,50,100]){const b=CLASS7.bon(k,L),safe=k=='knight'||k=='demon'||k=='druid'?1+b.p/2:1,exe=1/(.65+.35/(1+b.exe));
   o[k][L]={v:b.dmg*(1+b.spd)*(1+b.crit*(b.cm-1))*(1+b.far*1.04)*exe*(1+b.floor+b.rage*.35)*(1+b.aff*.895)*(1+.5*b.arc)*safe,g:1+b.g,safe}}}return o});
 const geo=a=>Math.exp(a.reduce((s,x)=>s+Math.log(x),0)/a.length);const idx={},mult={};
 for(const k in cls){idx[k]={};mult[k]={};for(const L of LV){const r=[],m=[];for(const id of cls[k]){const c=cm[k][id],S=v=>meas[id].v.r?(v.near+v.far)/2:v.near,s1=S(c[1]),sL=S(c[L]);if(!(s1>0))continue;m.push(sL/s1);r.push(sL/s1*meas[id].v.V/info.o[id].p)}
   mult[k][L]=geo(m)*bonus[k][L].safe;idx[k][L]=geo(r)*bonus[k][L].safe}}
 console.log('\nclass        weapons  value index (measured power / rarity band, x class level bonus)   L1     L25    L50   | DPS mult L25 L50');
 for(const k in cls)console.log(k.padEnd(13),String(cls[k].length).padStart(3),'                                                              ',...LV.map(L=>idx[k][L].toFixed(3).padStart(6)),'|',mult[k][25].toFixed(2),mult[k][50].toFixed(2));
 for(const L of LV){const v=Object.values(idx).map(o=>o[L]),mean=v.reduce((a,b)=>a+b,0)/v.length,dev=Math.max(...v.map(x=>Math.abs(x/mean-1)));
  ok('classes balanced at class level '+L+': every class within 12% of the mean (max '+(dev*100).toFixed(1)+'%)',dev<=.12,Object.fromEntries(Object.entries(idx).map(([k,o])=>[k,+(o[L]/mean).toFixed(3)])))}
 const gr=[];for(const k in mult){const g25=bonus[k][25].g,g50=bonus[k][50].g;if(Math.abs(mult[k][25]/g25-1)>.1||Math.abs(mult[k][50]/g50-1)>.1)gr.push(k+' '+mult[k][25].toFixed(2)+'/'+g25.toFixed(2)+' '+mult[k][50].toFixed(2)+'/'+g50.toFixed(2)+' ['+cls[k].map(id=>{const c=cm[k][id],S=v=>meas[id].v.r?(v.near+v.far)/2:v.near;return id+' '+(S(c[50])/S(c[1])).toFixed(2)}).join(', ')+']')}
 ok('class levels make every class stronger by about the same measured amount (within 10% of 1+g: +41% at 25, +63% at 50)',gr.length==0,gr);
 const bv=[];for(const k in bonus){let prev=0;for(const L of[1,10,25,50,100]){const o=bonus[k][L];if(o.v<prev-1e-9||Math.abs(o.v/o.g-1)>.05)bv.push(k+' L'+L+' '+o.v.toFixed(3)+' vs '+o.g.toFixed(3));prev=o.v}}
 ok('class level bonuses grow with level and add up to the same total value for every class (+-5%)',bv.length==0,bv);
 const txt=await E(()=>Object.keys(CLASS7.C).every(k=>CLASS7.perk(k,30).length>10&&CLASS7.perk(k,30)!==CLASS7.perk(k,60)));ok('each class shows its own perk text, with numbers that grow',txt);
 // ---- bosses: simulated time to kill per class at the expected level (single target, 60% uptime for dodging / phase beats)
 const bd=await E(()=>({B:BOSSES.map(b=>[b.id,b.hp]),bb:[8,15,28,22,35,42].map(L=>[L,LVL9.bossB(L),LVL9.dmgB(L)]),band:BAL11.RO.map(r=>BAL11.band(r))}));
 const EXP={warden:8,sovereign:15,eclipse:28,magma:22,tide:35,storm:42},tierAt=L=>L<5?0:L<13?1:L<23?2:L<33?3:L<45?4:5,RO=['common','uncommon','rare','epic','legendary','mythic'];
 const gOf=L=>.9*(1-Math.exp(-(Math.max(1,L)-1)/40));const mAt=(k,cl)=>{const g=gOf(cl);return g<=gOf(25)?1+(mult[k][25]/bonus[k][25].safe-1)*g/gOf(25):1+(mult[k][25]/bonus[k][25].safe-1)+(mult[k][50]/bonus[k][50].safe-mult[k][25]/bonus[k][25].safe)*(g-gOf(25))/(gOf(50)-gOf(25))};
 const ttk={},badT=[];for(const[bid,hp]of bd.B){const L=EXP[bid],t=tierAt(L),q=bd.bb.find(x=>x[0]==L),cl=Math.round(L*.6);ttk[bid]={};
  for(const k in cls){const s=geo(cls[k].map(id=>meas[id].v.S*bd.band[t]/bd.band[RO.indexOf(info.o[id].rar)]));const dps=s*(1+q[2])*(1+.04*L/2)/1.04*mAt(k,cl),T2=hp*q[1]/(dps*.6);ttk[bid][k]=Math.round(T2);if(T2<30||T2>200)badT.push(bid+'/'+k+' '+Math.round(T2)+'s')}}
 console.log('\nboss TTK (s) at expected level:');for(const bid in ttk)console.log(bid.padEnd(10),'L'+EXP[bid],Object.entries(ttk[bid]).map(([k,v])=>k.slice(0,5)+' '+v).join('  '));
 ok('every class beats every boss at the expected level in 30-200 s (simulated)',badT.length==0,badT);
 ok('balance: no page errors',errs.length==0,errs.slice(0,6).join(' | '));
 await b.close();console.log(fails?'FAILURES '+fails:'all balance tests passed');process.exit(fails?1:0)})();
