// ===== Deep treasure chests (CHEST7): hidden in caves, seeded by the world. Walk up and press E to open (once per world). =====
const CHEST7=(()=>{
 let list=[],opened={};const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpchest';
 const load=()=>{try{opened=JSON.parse(localStorage.getItem(K())||'{}')||{}}catch(_){opened={}}};const save=()=>{try{localStorage.setItem(K(),JSON.stringify(opened))}catch(_){}};load();
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const tierOf=dp=>dp<20?0:dp<32?1:2;const TN=['Wooden','Iron','Golden'];
 function build(){list=[];if(cur=='plaza')return;const R=rr((9157+Math.floor(ws*65537))>>>0);let lastX=-99;
  for(let x=4;x<W-4;x++){if(x-lastX<10)continue;const s=sh(x);for(let y=s+10;y<H-4;y++){if(!tiles[y*W+x]&&!tiles[(y-1)*W+x]&&tiles[(y+1)*W+x]&&tiles[(y+1)*W+x]!=17&&R()<.07){list.push({i:list.length,tx:x,ty:y,dp:y-s});lastX=x;break}}}
  list=list.slice(0,Math.round(9*W/100));list.forEach((c,i)=>c.i=i)}
 {const _gb=genBase;genBase=function(){const r=_gb.apply(this,arguments);try{build()}catch(e){console.error('chests',e)}return r}}
 const isOpen=c=>!!(opened[cur]&&opened[cur].includes(c.i));
 const near=()=>{let b=null,bd=T*1.7;for(const c of list){if(isOpen(c))continue;const d=Math.hypot((c.tx+.5)*T-P.x,(c.ty+.5)*T-(P.y+P.h/2));if(d<bd){bd=d;b=c}}return b};
 function loot(c){const t=tierOf(c.dp),R=Math.random,px=(c.tx+.5)*T,py=(c.ty+.2)*T;const gemsN=Math.round((60+c.dp*7)*(.7+R()*.6)*(1+t*.5));
  for(let i=0;i<5;i++)spawnDrop(px+(R()-.5)*30,py,'gem',Math.max(1,Math.round(gemsN/5)));
  const pool=[];const deep=[60,61,62,63,64,65].filter((id,k)=>c.dp>8+k*5);for(const id of deep)pool.push([id,1+t,3]);for(const k in MAT)pool.push([+k,1,2+t]);for(const k of[1,3,5,8,9,10])pool.push([100+k,1,2]);pool.push([10,1,1+t],[9,1,2+t]);
  const n=3+t+(R()<.4?1:0),got=[];for(let i=0;i<n&&pool.length;i++){const p=pool[R()*pool.length|0],q=p[1]+Math.floor(R()*(p[2]-p[1]+1));spawnDrop(px+(R()-.5)*40,py-10,p[0],q);got.push(q+' '+(typeof iname=='function'?iname(p[0]):'item'))}
  xpGain('mine',20+c.dp*3);return{gemsN,got,t}}
 function open(c){if(!opened[cur])opened[cur]=[];opened[cur].push(c.i);save();c.t0=performance.now();const r=loot(c),px=(c.tx+.5)*T,py=(c.ty+.2)*T;
  try{VFX.wave(px,py,r.t==2?'#ffd24a':r.t==1?'#cfe6ff':'#ffd9a0',160,.5,.35);VFX.burst(px,py,['#ffd24a','#fff','#ffe9a0'],26,260,1,.9,14)}catch(_){}
  try{burst(px,py,'#ffd24a',20,240,5,'p');shake=Math.max(shake,QM.reduce?0:.1)}catch(_){}
  snd(520,.18,'triangle',.07,1.3);snd(780,.24,'triangle',.06,1.3);snd(1180,.3,'sine',.05,1.2);noise(.25,3000,.06);
  try{say(TN[r.t]+' chest: +'+r.gemsN+' gems'+(r.got.length?', '+r.got.slice(0,3).join(', ')+(r.got.length>3?'...':''):''))}catch(_){}
  try{G('chest')}catch(_){}}
 {const _i=interact;interact=function(){if(!dlgOpen&&!creatorOn&&!showInv&&menuEl.style.display=='none'){const c=near();if(c){let npc=null;try{npc=nearNPC()}catch(_){}if(!npc){open(c);return}}}return _i.apply(this,arguments)}}
 function draw(g,cx,cy){if(!list.length||cur=='plaza')return;const t=performance.now()/1000,nr=near();
  for(const c of list){const x=(c.tx+.5)*T-cx,y=(c.ty+1)*T-cy;if(x<-60||x>cv.width/ZM+60||y<-60||y>cv.height/ZM+80)continue;const op=isOpen(c),tt=tierOf(c.dp),pal=[['#9a6a36','#6a4420','#e8c070'],['#8a96ac','#4e586c','#dfe8ff'],['#e8b83a','#9a6a10','#fff3b0']][tt];
   // a chest that lost its floor drops until something solid is below
   if(!solidAt(c.tx,c.ty+1)&&c.ty<H-3)c.ty++;
   const open0=op?Math.min(1,(performance.now()-(c.t0||0))/350):0,lid=op?(c.t0?open0:1):0;
   g.save();g.translate(x,y);
   if(!op){g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,-16,2,0,-16,44);gr.addColorStop(0,'rgba(255,226,140,'+(.28+.12*Math.sin(t*3+c.i))+')');gr.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gr;g.fillRect(-44,-62,88,88);g.globalCompositeOperation='source-over'}
   g.lineJoin='round';g.strokeStyle='#1b1220';g.lineWidth=2.5;
   g.fillStyle=pal[1];g.beginPath();g.roundRect(-19,-22,38,22,3);g.fill();g.stroke();g.fillStyle=pal[0];g.fillRect(-17,-20,34,8);
   g.fillStyle=pal[2];g.fillRect(-19,-13,38,3);g.fillRect(-3,-16,6,9);
   g.save();g.translate(-19,-22);g.rotate(-lid*1.15);g.fillStyle=pal[0];g.beginPath();g.roundRect(0,-14,38,14,[6,6,2,2]);g.fill();g.stroke();g.fillStyle=pal[2];g.fillRect(0,-5,38,3);g.restore();
   if(op&&lid>0){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,230,150,'+(.5*(1-Math.min(1,(performance.now()-(c.t0||0))/1200)))+')';g.fillRect(-16,-34,32,16);g.globalCompositeOperation='source-over'}
   if(c===nr){g.font='bold 12px system-ui,sans-serif';g.textAlign='center';const tw=g.measureText('Press E').width+18;g.fillStyle='rgba(20,18,30,.78)';g.beginPath();g.roundRect(-tw/2,-58+Math.sin(t*4)*2,tw,20,10);g.fill();g.fillStyle='#fff';g.fillText('Press E',0,-44+Math.sin(t*4)*2)}
   g.restore()}}
 {const _d=BOSS6.drawProj;BOSS6.drawProj=function(g,cx,cy){try{draw(g,cx,cy)}catch(_){}_d.call(this,g,cx,cy)}}
 return{build,list:()=>list,near,open,opened:()=>opened,reload:load}})();
