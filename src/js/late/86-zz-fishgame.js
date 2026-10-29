// ===== FISHGAME9: the reeling mini-game. When a fish bites and you click, a short skill game starts above your head:
// a fish shadow darts along a water track and you keep your green catch zone on it - HOLD the mouse (or Space / W / ↑) to push the zone
// right, let go and it drifts back left. Fish inside the zone fills the catch meter; outside, the meter drains and the line tension
// rises - at full tension the line snaps (no fish, bait lost). Rarer fish are faster, jumpier and need a smaller zone; Bubbles levels
// (bigger zone, slower fish, tougher line) and better bait make it easier. A full meter lands the fish through the normal catch path
// (TOOLS8.FISH.click in the 'bite' state with S.land set) so the catch rewards, rare reveal card, Bubbles XP and double catches all
// still apply. The UI is drawn on the game canvas (no DOM, no layout), particles are capped, reduced motion drops shake/splashes. =====
const FISHGAME=(()=>{
 const R=Math.random,cl=(v,a,b)=>v<a?a:v>b?b:v;
 const G={on:0,fid:0,d:0,zp:.35,zv:0,zw:.26,fp:.5,ft:.5,fv:.4,fT:0,pr:.25,ten:0,t:0,hold:false,force:null,res:null,resT:0,splT:0,clkT:0,jit:0,lvl:1,luck:0,dart:0};
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}};
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 const lvlB=()=>{try{return TOOLLV.lvl('bubbles')}catch(_){return 1}};
 // difficulty of a fish (0 easy .. 1 legendary) and the tuning it implies; perks and bait soften it
 function diff(fid,lvl,bait){const f=TOOLS8.FISHES[fid]||{p:4},junk=!!f.junk,d=junk?0:cl((Math.log2(Math.max(2,f.p))-1.5)/5.8,0,1),l=Math.max(1,lvl|0),b=TOOLS8.BAIT[bait],luck=b?b.luck:0;
  return{d,junk,zw:cl((.3-.13*d)*(1+.05*(l-1))*(1+.05*luck),.12,.46),fv:(junk?.12:.28+.78*d)*(1-.03*(l-1)),fe:(1.25-.7*d),dart:junk?0:d*.55,gain:.36-.1*d,drain:.16+.12*d,tup:(.42+.38*d)*(1-.04*(l-1))*(1-.04*luck),tdn:.55}}
 let P0=null;
 function start(fid,bait){const q=diff(fid,G.lvl=lvlB(),bait);P0=q;Object.assign(G,{on:1,fid,d:q.d,zw:q.zw,zp:.5-q.zw/2,zv:0,fp:.5,ft:.5,fv:q.fv,fT:.4,pr:.25,ten:0,t:0,res:null,splT:0,dart:q.dart,jit:0});
  tone(500,800,.08,'square',.025);try{SFX7.splash(300)}catch(_){}}
 function end(){G.on=0;G.force=null}
 const holding=()=>G.force!=null?!!G.force:(typeof mdL!='undefined'&&mdL)||(typeof K!='undefined'&&(K[' ']||K.w||K.arrowup));
 // returns 0 while playing, 'land' or 'snap' when it ends
 function tick(dt){if(!G.on)return 0;dt=Math.min(.05,dt);const q=P0;G.t+=dt;G.hold=holding();
  // catch zone physics: push right while holding, drift left when released, soft bounce at both ends
  G.zv+=(G.hold?3.4:-3)*dt;G.zv*=Math.pow(.1,dt);G.zp+=G.zv*dt;if(G.zp<0){G.zp=0;G.zv=Math.abs(G.zv)*.25}if(G.zp>1-G.zw){G.zp=1-G.zw;G.zv=-Math.abs(G.zv)*.25}
  // the fish wanders to new spots; rarer fish dart
  G.fT-=dt;if(G.fT<=0){const dart=R()<G.dart;G.ft=cl(dart?(G.fp<.5?.7+R()*.3:R()*.3):G.fp+(R()-.5)*(.35+q.d*.5),.02,.98);G.fT=q.fe*(.5+R()*.8)*(dart?.6:1);G.jit=dart?1:0}
  const sp=G.fv*(G.jit?2.2:1);G.fp+=cl(G.ft-G.fp,-sp*dt,sp*dt);G.jit=Math.max(0,G.jit-dt*2);
  const inside=G.fp>=G.zp&&G.fp<=G.zp+G.zw;
  if(inside){G.pr+=q.gain*dt;G.ten=Math.max(0,G.ten-q.tdn*dt)}else{G.pr-=q.drain*dt;G.ten+=q.tup*dt}
  G.pr=cl(G.pr,0,1);
  // feedback: reel clicks while holding (pitch rises with tension), creaks near the limit, splashes as the fish fights
  G.clkT-=dt;if(G.hold&&G.clkT<=0){G.clkT=.085;tone(1500+G.ten*900,1300+G.ten*900,.02,'square',.008)}
  if(G.ten>.7&&R()<dt*5)tone(180+R()*40,140,.12,'sawtooth',.015);
  G.splT-=dt;if(G.splT<=0){G.splT=.35+R()*.4;if(!red()){try{const S=TOOLS8.FISH.S;burst(S.x+(G.fp-.5)*T*1.4,S.y,'#bfe8ff',3+(G.jit?3:0),120,3)}catch(_){}}if(G.jit||R()<.3)try{SFX7.plip()}catch(_){}}
  if(G.pr>=1){G.on=0;return'land'}if(G.ten>=1){G.on=0;return'snap'}if(G.t>25){G.on=0;return'snap'}return 0}
 // test / accessibility hook: finish now
 function win(){if(!G.on)return false;G.pr=1;return true}
 // result popup (fish preview) shown above the player for a moment
 function show(fid,ok){G.res={fid,ok,t:performance.now()};if(ok){tone(660,990,.12,'sine',.04);tone(990,1480,.2,'triangle',.035,.1)}else{tone(520,90,.35,'sawtooth',.04);tone(180,90,.2,'square',.02,.05)}}
 const RC=['#d8e0ea','#6fe3a0','#64b0ff','#b98aff','#ffc640','#ff5f9e'];
 const tier=fid=>{try{return ITEM7.tier(fid)}catch(_){return 0}};
 function fishShape(g,x,y,s,col,dir){g.save();g.translate(x,y);g.scale(dir*s,s);g.fillStyle=col;g.beginPath();g.ellipse(0,0,8,4.4,0,0,6.283);g.fill();g.beginPath();g.moveTo(-7,0);g.lineTo(-12,-4);g.lineTo(-12,4);g.closePath();g.fill();g.restore()}
 function rr(g,x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)}
 function draw(g,cx,cy){const now=performance.now();
  if(G.on){const TW=228,TH=20,x0=Math.round(P.x-cx-TW/2-5),y0=Math.round(P.y-cy-132),q=P0,inside=G.fp>=G.zp&&G.fp<=G.zp+G.zw,sh=red()?0:G.ten>.75?Math.sin(now/30)*1.5*(G.ten-.75)*4:0;
   g.save();g.translate(sh,0);
   rr(g,x0-14,y0-24,TW+40,68,12);g.fillStyle='rgba(14,18,38,.86)';g.fill();g.lineWidth=2;g.strokeStyle=G.ten>.7?'rgba(255,110,110,.9)':'rgba(255,255,255,.35)';g.stroke();
   // water track + zone + fish
   rr(g,x0,y0,TW,TH,7);g.fillStyle='#1d4a7a';g.fill();g.fillStyle='rgba(120,200,255,.25)';g.fillRect(x0+4,y0+4,TW-8,3);
   const zx=x0+G.zp*TW,zw=G.zw*TW;rr(g,zx,y0-3,zw,TH+6,7);g.fillStyle=inside?'rgba(110,240,140,.55)':'rgba(255,220,110,.4)';g.fill();g.lineWidth=2;g.strokeStyle=inside?'#8dffb0':'#ffe08a';g.stroke();
   const fc=q.junk?'#8a6a4a':RC[Math.min(5,tier(G.fid))],fx=x0+G.fp*TW,fy=y0+TH/2+(red()?0:Math.sin(now/90)*1.5*(1+G.jit*2)),dir=G.ft>=G.fp?1:-1;fishShape(g,fx,fy+1,1.4,'rgba(0,0,0,.45)',dir);fishShape(g,fx,fy,1.3,fc,dir);
   // catch meter (under the track) + tension gauge (right)
   rr(g,x0,y0+TH+8,TW,8,4);g.fillStyle='rgba(255,255,255,.12)';g.fill();rr(g,x0,y0+TH+8,Math.max(6,TW*G.pr),8,4);g.fillStyle=G.pr>.8?'#8dffb0':'#5fd38a';g.fill();
   const tx=x0+TW+8,ty=y0-16,th=52;g.fillStyle='rgba(255,255,255,.12)';g.fillRect(tx,ty,7,th);const tc=G.ten>.7?'#ff5a5a':G.ten>.4?'#ffb84a':'#7fd0ff';g.fillStyle=tc;g.fillRect(tx,ty+th*(1-G.ten),7,th*G.ten);
   g.font='700 12px '+FONT;g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='rgba(255,255,255,.85)';g.fillText(G.t<2.2?(G.hold?'Keep the fish in the green!':'HOLD click / Space to reel →'):G.ten>.7?'Careful — the line!':q.junk?'Something heavy…':q.d>.75?'A big one!':'Reeling…',x0,y0-8);
   g.restore()}
  if(G.res){const u=(now-G.res.t)/1400;if(u>=1){G.res=null;return}const f=TOOLS8.FISHES[G.res.fid],x=P.x-cx,y=P.y-cy-104-Math.min(1,u*4)*16,a=u>.75?(1-u)/.25:1;g.save();g.globalAlpha=a;
   if(G.res.ok&&f){const c=RC[Math.min(5,tier(G.res.fid))];rr(g,x-58,y-22,116,40,12);g.fillStyle='rgba(14,18,38,.86)';g.fill();g.lineWidth=2;g.strokeStyle=c;g.stroke();
    try{const im=fimg(G.res.fid);g.drawImage(im,x-54,y-20,36,36)}catch(_){}g.font='700 11px '+FONT;g.textAlign='left';g.fillStyle='#fff';g.fillText(f.n,x-14,y-4);g.font='600 9px '+FONT;g.fillStyle=c;g.fillText(f.junk?'Junk':['Common','Uncommon','Rare','Epic','Legendary','Mythic'][Math.min(5,tier(G.res.fid))],x-14,y+9)}
   else{g.font='700 13px '+FONT;g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,10,10,.8)';g.strokeText('SNAP! It got away…',x,y);g.fillStyle='#ffb0a0';g.fillText('SNAP! It got away…',x,y)}g.restore()}}
 const FI={};function fimg(fid){if(FI[fid])return FI[fid];const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');try{matIcon(x,fid,48)}catch(_){}return FI[fid]=c}
 // no jumping while you reel with Space / W / ↑
 {const _jp=jumpPress;jumpPress=function(){if(G.on)return;return _jp.apply(this,arguments)}}
 return{G,diff,start,end,tick,draw,win,show,get params(){return P0}}})();
