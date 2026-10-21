// ===== V6 bosses: 3 telegraphed fights, relic rewards (state lives in legacy bossK/relics so it saves with the profile) =====
const BOSSES=[
 {id:'warden',n:'Verdant Warden',depth:10,hp:520,w:96,h:78,dmg:16,ai:'hop',c:'#6fe08a',jp:780,sx:170,cd:.9,gems:350,xp:420,relic:'verdant',rn:'Warden\'s Seed',rd:'+10% XP',fx:{xp:.1},desc:'A colossal jelly king crowned in living thorns.'},
 {id:'sovereign',n:'Crystal Sovereign',depth:26,hp:1400,w:84,h:120,dmg:22,ai:'walk',spm:1.1,c:'#7fd8ff',gems:900,xp:1100,relic:'crystal',rn:'Sovereign Core',rd:'+60 HP, +6% armor',fx:{hp:60,arm:.06},desc:'A walking cathedral of living crystal.'},
 {id:'eclipse',n:'Eclipse Lord',depth:44,hp:2800,w:80,h:112,dmg:28,ai:'fly',spm:1.2,c:'#b58cff',gems:2400,xp:3000,relic:'eclipse',rn:'Eclipse Shard',rd:'+7% crit, +25% crit damage',fx:{crit:.07,cdmg:.25},desc:'A void-winged tyrant that swallows the light.'}];
for(const b of BOSSES)MK['boss_'+b.id]={c:b.c,hp:b.hp,w:b.w,h:b.h,gem:40,dmg:b.dmg,ai:b.ai,jp:b.jp,sx:b.sx,cd:b.cd,spm:b.spm,fly:b.ai=='fly'?1:0,ph:b.ai=='fly'?1:0,min:9999,max:9999,boss:1};
MOBMAT.boss_warden=2;MOBMAT.boss_sovereign=9;MOBMAT.boss_eclipse=10;
const _bonus6=bonus;bonus=function(){const r=_bonus6();for(const b of BOSSES)if(relics[b.relic])for(const k in b.fx)r[k]=(r[k]||0)+b.fx[k];return r};
const BOSS6=(()=>{
 const BP=[];let act=null,lastEnd=-1e9,bar=null;const rn=(a,b)=>a+Math.random()*(b-a);
 function ui(){if(bar)return bar;bar=document.createElement('div');bar.id='bossbar';bar.style.cssText='position:fixed;left:50%;top:64px;transform:translateX(-50%);width:min(520px,80vw);z-index:8;display:none;text-align:center;pointer-events:none';bar.innerHTML='<div style="font-size:13px;letter-spacing:5px;color:#f3dca0;text-shadow:0 0 10px #9a6bff,0 1px 2px #000"></div><div style="height:12px;margin-top:4px;background:#14101f;border:1px solid #6a4a9a;border-radius:3px;overflow:hidden;box-shadow:0 0 14px rgba(154,107,255,.5)"><i style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#8a1d3a,#ff5a6a)"></i></div>';document.body.appendChild(bar);return bar}
 const def=m=>BOSSES.find(b=>'boss_'+b.id==m.k);
 function hurtP(a,kb){if(iT>0)return;P.hp-=a*(1-Math.min(.8,bonus().arm+(guard>0?.5:0)));iT=.9;P.vx=kb||0;P.vy=-320;hurtF=.45;shake=Math.max(shake,QM.reduce?0:.14);snd(130,.22,'sawtooth',.07)}
 function spawn(id){if(act)return false;const b=BOSSES.find(x=>x.id==id);if(!b||cur=='plaza'){say('Bosses do not appear in the plaza');return false}
  const k='boss_'+id,d=MK[k],online=rm?Math.max(1,rm.peers().filter(p=>p.kind=='viewer').length):1;let x,y,ok=false;
  for(let i=0;i<80&&!ok;i++){const tx=Math.floor(P.x/T+(Math.random()<.5?-1:1)*rn(7,13)),ty=Math.floor(P.y/T+rn(-4,4));if(tx<3||tx>W-4||ty<3||ty>H-5)continue;const cw=Math.ceil(d.w/T)+1,ch=Math.ceil(d.h/T)+1;let clear=true;for(let a=0;a<cw&&clear;a++)for(let c=0;c<ch;c++)if(solidAt(tx+a-(cw>>1),ty-c)){clear=false;break}if(!clear)continue;if(!d.fly&&!solidAt(tx,ty+1))continue;x=tx*T+T/2;y=d.fly?ty*T-d.h/2:ty*T+T-d.h-2;ok=true}
  if(!ok){say('No room for the boss here - try a wider cave');return false}
  const hp=Math.round(d.hp*(1+.6*(online-1)));mobs.push({k,x,y,w:d.w,h:d.h,vx:0,vy:0,hp,mhp:hp,fl:0,burn:0,slow:0,ph:0,t:1,dir:1,fade:1,g:false,wall:0,boss:1,bs:'idle',bt:2.4,at:0,phase:1,sum:0});act=mobs[mobs.length-1];
  VFX.wave(x,y+d.h,b.c,320,1.2,.3);VFX.burst(x,y+d.h/2,[b.c,'#fff'],40,300,1,1.2,16);UI6.say6(b.n.toUpperCase(),'A BOSS APPEARS',3600);snd(80,1.2,'sawtooth',.1,.5);return true}
 function reward(m,b){bossK[b.id]=(bossK[b.id]|0)+1;const first=!relics[b.relic];relics[b.relic]=1;gems+=b.gems;stat('gems',b.gems);xpGain('fight',b.xp);VFX.shatter(m.x,m.y+m.h/2,[b.c,'#fff','#ffd24a'],40);VFX.wave(m.x,m.y+m.h/2,'#fff',300,1,.3);UI6.say6('BOSS DEFEATED',b.n.toUpperCase()+(first?'  -  RELIC: '+b.rn:''),4200);burst(m.x,m.y+m.h/2,'#ffd24a',40,320,5,'p');rings.push({x:m.x,y:m.y+m.h/2,c:'#ffd24a',t:performance.now()});shake=Math.max(shake,QM.reduce?0:.25);try{saveP()}catch(_){}lastEnd=performance.now()}
 const _hm=hurtMob;hurtMob=function(m,d,w,ang){const was=m.dead;const r=_hm.apply(this,arguments);if(m.boss&&m.hp<=0&&!was&&!m.rew){m.rew=1;m.dead=true;const b=def(m);if(b)reward(m,b);act=null}return r};
 function bolt(m,ang,sp,c){BP.push({x:m.x,y:m.y+m.h*.4,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,l:4,c})}
 function tick(dt){if(!entered){return}ui();
  if(act&&(act.dead||!mobs.includes(act))){act=null;bar.style.display='none'}
  if(act){const m=act,b=def(m),hr=m.hp/m.mhp;bar.style.display='block';bar.firstChild.textContent=b.n.toUpperCase()+(m.phase==2?'  -  ENRAGED':'');bar.lastChild.firstChild.style.width=Math.max(0,hr*100)+'%';
   if(hr<.5&&m.phase==1){m.phase=2;VFX.wave(m.x,m.y+m.h/2,'#ff5a6a',280,.9,.4);UI6.say6('ENRAGED','',1800);snd(70,.8,'sawtooth',.1,.6)}
   m.bt-=dt;const dist=Math.hypot(P.x-m.x,P.y-m.y);
   if(m.bs=='idle'&&m.bt<=0){m.bs='tele';m.bt=m.phase==2?.7:.95;m.at=m.sum%3==2?2:dist<T*7?0:1;m.sum++}
   else if(m.bs=='tele'){if(Math.random()<.6)VFX.mote(m.x+rn(-40,40),m.y+m.h+rn(-10,0),b.c);if(m.at==0)VFX.wave(m.x,m.y+m.h,b.c,m.w*1.9*(1-m.bt),.12,.3);
    if(m.bt<=0){m.bs='idle';m.bt=m.phase==2?1.7:2.6;
     if(m.at==0){VFX.wave(m.x,m.y+m.h,'#fff',m.w*2.2,.5,.3);VFX.wave(m.x,m.y+m.h,b.c,m.w*2.6,.7,.3);shake=Math.max(shake,QM.reduce?0:.18);snd(70,.4,'sawtooth',.12,.4);if(Math.abs(P.x-m.x)<m.w*1.1&&P.y+P.h>m.y+m.h-T*1.6)hurtP(b.dmg*1.2,Math.sign(P.x-m.x||1)*340)}
     else if(m.at==1){const n=m.phase==2?9:6,a0=Math.atan2(P.y+P.h/2-(m.y+m.h*.4),P.x-m.x);for(let i=0;i<n;i++)bolt(m,a0+(i-(n-1)/2)*.17,300,b.c);snd(520,.3,'triangle',.08,.5)}
     else{for(let i=0;i<2;i++){const kk=b.id=='warden'?'slime':b.id=='sovereign'?'golem':'wraith',d=MK[kk];mobs.push({k:kk,x:m.x+(i?60:-60),y:m.y,w:d.w,h:d.h,vx:0,vy:-200,hp:d.hp,fl:0,burn:0,slow:0,ph:Math.random()*6,t:1,dir:1,fade:0,g:false,wall:0})}VFX.burst(m.x,m.y+m.h/2,[b.c,'#fff'],20,200,1,.7,12);snd(300,.3,'square',.07,.5)}}}
   if(b.ai=='fly'&&dist>T*30){m.x+=(P.x-m.x)*dt*.5}}
  for(let i=BP.length-1;i>=0;i--){const q=BP[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;if(Math.random()<.5)VFX.add(0,q.c,q.x,q.y,0,0,.3,12,2,{a:.7});let dead=q.l<=0||solidAt(Math.floor(q.x/T),Math.floor(q.y/T));if(!dead&&Math.abs(q.x-P.x)<P.w/2+8&&q.y>P.y&&q.y<P.y+P.h){hurtP(12,Math.sign(q.vx||1)*180);dead=true}if(dead){VFX.burst(q.x,q.y,[q.c,'#fff'],5,120,1,.4,9);BP.splice(i,1)}}}
 // visuals
 function art(m,now){const b=def(m),px=m.x-cam.x,py=m.y-cam.y+m.h,t=now/1000,fl=m.fl>0,tele=m.bs=='tele';
  g.save();g.translate(px,py);
  if(tele){g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,-m.h/2,5,0,-m.h/2,m.w*1.2);gr.addColorStop(0,b.c);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55;g.fillStyle=gr;g.fillRect(-m.w*1.3,-m.h*1.3,m.w*2.6,m.h*1.8);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  g.lineJoin='round';const OLc='#0e0818',enr=m.phase==2;
  if(b.id=='warden'){const sq=1+Math.sin(t*3)*.04+(m.g?0:.12),f=m.dir||1;g.scale(1/sq,sq);const bw=m.w/2;
   const gr=g.createLinearGradient(0,-m.h,0,0);gr.addColorStop(0,fl?'#fff':'#9dffb4');gr.addColorStop(1,fl?'#ddd':'#2a9a5a');g.fillStyle=gr;g.strokeStyle=OLc;g.lineWidth=3;g.beginPath();g.moveTo(-bw,0);g.bezierCurveTo(-bw*1.1,-m.h*.7,-bw*.6,-m.h*1.02,0,-m.h*1.02);g.bezierCurveTo(bw*.6,-m.h*1.02,bw*1.1,-m.h*.7,bw,0);g.closePath();g.fill();g.stroke();
   g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.ellipse(-bw*.35,-m.h*.72,bw*.25,m.h*.14,-.5,0,6.3);g.fill();g.globalCompositeOperation='lighter';const cg=g.createRadialGradient(0,-m.h*.45,2,0,-m.h*.45,bw*.5);cg.addColorStop(0,'rgba(255,255,160,.9)');cg.addColorStop(1,'rgba(255,255,160,0)');g.fillStyle=cg;g.fillRect(-bw,-m.h,bw*2,m.h);g.globalCompositeOperation='source-over';
   g.fillStyle='#2f7a3a';g.strokeStyle=OLc;g.lineWidth=2;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*bw*.28-8,-m.h*.98);g.lineTo(i*bw*.28,-m.h*(1.22+(i==0?.1:0)));g.lineTo(i*bw*.28+8,-m.h*.98);g.closePath();g.fill();g.stroke()}
   for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(s*bw*.34,-m.h*.62,9,12,s*.3,0,6.3);g.fill();g.stroke();g.fillStyle=enr?'#ff3a4a':'#0a2a10';g.beginPath();g.ellipse(s*bw*.34+f*2,-m.h*.6,3.5,8,0,0,6.3);g.fill()}
   g.fillStyle='#10301a';g.beginPath();g.moveTo(-bw*.4,-m.h*.36);g.quadraticCurveTo(0,-m.h*.2,bw*.4,-m.h*.36);g.quadraticCurveTo(0,-m.h*.3,-bw*.4,-m.h*.36);g.fill();g.fillStyle='#fff';for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*bw*.11-3,-m.h*.31+Math.abs(i)*1.4);g.lineTo(i*bw*.11,-m.h*.24);g.lineTo(i*bw*.11+3,-m.h*.31+Math.abs(i)*1.4);g.fill()}}
  else if(b.id=='sovereign'){const f=m.vx>=0?1:-1,w2=Math.sin(t*5)*(Math.abs(m.vx)>10?1:.2),hh=m.h;
   const fc=fl?'#fff':'#bfeaff',dc=fl?'#ddd':'#3a7ac8';const crys=(pts,c1,c2)=>{g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();const gr=g.createLinearGradient(pts[0],pts[1],pts[pts.length-2],pts[pts.length-1]);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fill();g.strokeStyle='#eaffff';g.lineWidth=1.6;g.stroke();g.strokeStyle=OLc;g.lineWidth=1;g.stroke()};
   for(const s of[-1,1])crys([s*14,-hh*.1,s*28,-hh*.12,s*24+s*w2*8,0,s*10+s*w2*8,0],fc,dc);
   for(const s of[-1,1]){crys([s*30,-hh*.78,s*52,-hh*.62,s*58,-hh*.2+s*w2*10,s*44,-hh*.18+s*w2*10,s*30,-hh*.5],fc,dc);crys([s*26,-hh*.9,s*44,-hh*1.05,s*40,-hh*.8],'#fff',dc)}
   crys([-30,-hh*.9,30,-hh*.9,36,-hh*.35,22,-hh*.1,-22,-hh*.1,-36,-hh*.35],fc,dc);crys([-10,-hh*.8,10,-hh*.8,14,-hh*.5,0,-hh*.3,-14,-hh*.5],'#ffffff','#6ad0ff');
   crys([-16,-hh*1.02,16,-hh*1.02,12,-hh*.86,0,-hh*.8,-12,-hh*.86],'#fff',dc);g.fillStyle=enr?'#ff4a6a':'#2ad8ff';g.shadowColor=g.fillStyle;g.shadowBlur=10;g.fillRect(-9,-hh*.95,6,3);g.fillRect(3,-hh*.95,6,3);g.shadowBlur=0;
   g.globalCompositeOperation='lighter';g.fillStyle='rgba(160,230,255,.8)';for(let i=0;i<5;i++){const a=t*1.2+i*1.26;g.beginPath();g.moveTo(Math.cos(a)*60,-hh*.55+Math.sin(a)*30-9);g.lineTo(Math.cos(a)*60+4,-hh*.55+Math.sin(a)*30);g.lineTo(Math.cos(a)*60,-hh*.55+Math.sin(a)*30+9);g.lineTo(Math.cos(a)*60-4,-hh*.55+Math.sin(a)*30);g.fill()}g.globalCompositeOperation='source-over'}
  else{const hh=m.h,bob=Math.sin(t*2)*6;g.translate(0,-hh*.5+bob);
   g.save();g.globalCompositeOperation='lighter';g.fillStyle='#000';g.globalCompositeOperation='source-over';g.beginPath();g.arc(0,-10,46,0,6.3);g.fillStyle='#07030f';g.fill();g.globalCompositeOperation='lighter';g.strokeStyle='#ffd36a';g.shadowColor='#ffd36a';g.shadowBlur=18;g.lineWidth=4;g.beginPath();g.arc(0,-10,48,0,6.3);g.stroke();g.shadowBlur=0;g.restore();
   g.save();g.scale(1.05,1.05);WingArt.draw(g,4,0,0,1,t,2,0,0,fl?.9:1);g.restore();
   g.fillStyle=fl?'#fff':'#1a0f2e';g.strokeStyle=OLc;g.lineWidth=2;g.beginPath();g.moveTo(-28,-hh*.34);g.lineTo(28,-hh*.34);g.lineTo(36,hh*.5);for(let i=0;i<6;i++)g.lineTo(30-i*12,hh*(.42+(i%2)*.16));g.lineTo(-36,hh*.5);g.closePath();g.fill();g.stroke();
   g.fillStyle='#e8e2f2';g.strokeStyle=OLc;g.beginPath();g.ellipse(0,-hh*.32,17,20,0,0,6.3);g.fill();g.stroke();g.fillStyle='#0a0612';g.beginPath();g.ellipse(-7,-hh*.34,5,7,0,0,6.3);g.ellipse(7,-hh*.34,5,7,0,0,6.3);g.fill();g.fillStyle=enr?'#ff3a6a':'#b58cff';g.shadowColor=g.fillStyle;g.shadowBlur=8;g.beginPath();g.arc(-7,-hh*.33,2,0,6.3);g.arc(7,-hh*.33,2,0,6.3);g.fill();g.shadowBlur=0;
   g.fillStyle='#0a0612';g.beginPath();g.moveTo(-8,-hh*.2);g.lineTo(8,-hh*.2);g.lineTo(0,-hh*.14);g.fill();g.strokeStyle='#e8e2f2';g.lineWidth=1.4;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*3,-hh*.2);g.lineTo(i*3,-hh*.14)}g.stroke();
   g.strokeStyle='#d9cfe8';g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(s*28,-hh*.28);g.quadraticCurveTo(s*56,-hh*.12,s*46,hh*.16);g.stroke();g.beginPath();g.moveTo(s*46,hh*.16);g.lineTo(s*54,hh*.28);g.lineTo(s*40,hh*.26);g.stroke()}}
  g.restore();
  const hr=m.hp/m.mhp;if(hr<1){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(px-m.w/2,m.y-cam.y-14,m.w,6);g.fillStyle='#ff5a6a';g.fillRect(px-m.w/2+1,m.y-cam.y-13,(m.w-2)*Math.max(0,hr),4)}}
 const _dm=drawMob;drawMob=function(m,now){if(m.boss&&def(m)){art(m,now);return}_dm(m,now)};
 function drawProj(g,cx,cy){if(!BP.length)return;g.save();g.globalCompositeOperation='lighter';for(const q of BP){const gr=g.createRadialGradient(q.x-cx,q.y-cy,0,q.x-cx,q.y-cy,16);gr.addColorStop(0,'#fff');gr.addColorStop(.3,q.c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(q.x-cx-16,q.y-cy-16,32,32)}g.restore()}
 return{spawn,tick,drawProj,active:()=>act,clear(){BP.length=0;act=null;if(bar)bar.style.display='none'}}})();
