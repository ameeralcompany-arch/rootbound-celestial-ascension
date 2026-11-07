// ===== RESTORE1: the worlds remember (docs/story-proposal.md, stage 3). Each realm (the first world, Inferno, Galaxy, Abyssal Sea, Crystal Realm: WORD9 stages 0-4)
// is Silent until its word is spoken at the Word Gate, Waking until its guardian rests (WBOSS13), then Restored. The difference is visible and audible:
//   Silent: the colour is drained a little and the music becomes a hushed, sparse version (MUS7 mood 'silent');
//   Waking: the world's own music returns, colour almost back;
//   Restored: full colour, and warm lights drift in the air.
// The Plaza fills up as worlds are restored: one lantern strand per restored realm, in its colour, and when all five are back, a festival (petals, its own music).
// Arriving in a realm says which state it is in. Cost: a CSS colour filter on the game canvas only in Silent and Waking worlds; a few dozen sprites drawn otherwise. =====
try{(()=>{
 const COL=['#9be37a','#ff9a4a','#b48cff','#5ab8ff','#ff9ad0'],NAME=['the first world','an Inferno world','a Galaxy world','an Abyssal Sea world','a Crystal Realm world'];
 const stage=n=>{try{return WORD9.stageOf(n)}catch(_){return -1}};
 // only the story's own realms (rootbound and its four realms); worlds players build keep their own colour and music
 const REALM=['rootbound','rootbound-inf','rootbound-gal','rootbound-sea','rootbound-cry'],isRealm=n=>REALM.includes(n);
 const anyIn=(o,sg,f)=>{try{const n=REALM[sg];return !!(o&&n in o&&f(o[n]))}catch(_){return false}};
 const word=sg=>{try{return anyIn(WORD9.state.w,sg,v=>v&&v.ok)}catch(_){return false}};
 const guard=sg=>{try{return anyIn(WBOSS13.state&&WBOSS13.state.w,sg,v=>!!v)}catch(_){return false}};
 const state=sg=>word(sg)?(guard(sg)?2:1):0;
 const restored=()=>[0,1,2,3,4].filter(sg=>state(sg)==2).length;
 const inRun=()=>{try{return !!(window.DG&&DG.run)}catch(_){return false}};
 const here=()=>{try{if(typeof cur=='undefined'||!cur||!isRealm(cur)||inRun())return null;if(!WORD9.hasWord(cur))return null;const sg=stage(cur);return sg>=0&&sg<=4?{sg,st:state(sg)}:null}catch(_){return null}};
 // ---- colour, and the note on arrival
 let lastW='',lastSt=-1;
 function apply(){const h=here(),root=document.documentElement,v=h&&h.st<2?String(h.st):'';if(root.dataset.wst!==v){if(v)root.dataset.wst=v;else delete root.dataset.wst}
  const c=typeof cur!='undefined'?cur:'';if(c!==lastW||(h&&h.st!==lastSt)){const fresh=c!==lastW;lastW=c;lastSt=h?h.st:-1;if(h&&fresh)setTimeout(()=>{try{say(h.st==0?'This world is Silent. Its word is lost: find its letters.':h.st==1?'This world is Waking. Its guardian still stands.':'This world is Restored. It remembers you.')}catch(_){}},2600)}}
 setInterval(apply,1000);
 // ---- music: a hushed version in Silent worlds, a festival in a fully restored Plaza
 try{const C=(a)=>a.map(([r,q])=>[r,q]);const M=MUS7.MOODS;
  if(M&&!M.silent)M.silent={n:'Silent',songs:[{id:'held-breath',bpm:54,key:2,sc:'dor',feel:'soft',prog:M.night.songs[0].prog.slice?M.night.songs[0].prog:C([[0,'m9'],[5,'m7']]),lead:'keys'},{id:'empty-road',bpm:52,key:9,sc:'min',feel:'soft',prog:(M.rain&&M.rain.songs[0].prog)||M.night.songs[1].prog,lead:'keys'}]};
  if(M&&!M.festival)M.festival={n:'Festival',songs:[{id:'lantern-dance',bpm:96,key:7,sc:'maj',feel:'brush',prog:M.plaza.songs[2].prog,lead:'box'},{id:'all-worlds-home',bpm:90,key:0,sc:'maj',feel:'lofi',prog:M.plaza.songs[0].prog,lead:'box'}]};
  const m0=REALM10.mood;REALM10.mood=function(){try{if(typeof cur!='undefined'&&cur=='plaza'&&restored()==5&&MUS7.MOODS.festival)return'festival';const h=here();if(h&&h.st==0&&MUS7.MOODS.silent)return'silent'}catch(_){}return m0.apply(this,arguments)}}catch(e){console.error('RESTORE1 music',e)}
 // ---- drawing, in the world's own coordinates (the same hook the dungeons use)
 const T0=()=>typeof T!='undefined'?T:48;
 function lights(g,now){const w=g.canvas.width/ZM,h=g.canvas.height/ZM;g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<26;i++){const a=Math.abs(Math.sin(i*12.9898)*43758.5453)%1,b=Math.abs(Math.sin(i*78.233)*12345.678)%1,t=now/1000;
   const sx=((a*w*1.4-cam.x*.15+Math.sin(t*.3+i)*40)%(w*1.4)+w*1.4)%(w*1.4)-w*.2,sy=((b*h-cam.y*.1+Math.cos(t*.25+i*2)*30)%h+h)%h,tw=.5+.5*Math.sin(t*1.7+i*3),r=3+tw*2.5;
   const gr=g.createRadialGradient(sx,sy,0,sx,sy,r*4);gr.addColorStop(0,'rgba(255,236,170,'+(.55*tw)+')');gr.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=gr;g.fillRect(sx-r*4,sy-r*4,r*8,r*8)}
  g.restore()}
 function lanterns(g,now){const T1=T0(),n=restored();if(!n)return;const vw=g.canvas.width/ZM,x0=Math.floor(cam.x/T1)-16,x1=x0+Math.ceil(vw/T1)+32,SP=14;
  g.save();for(let s=0;s<n;s++){const col=COL[[0,1,2,3,4].filter(sg=>state(sg)==2)[s]],lift=(8.5+s*1.3)*T1;
   for(let px=Math.floor(x0/SP)*SP;px<x1;px+=SP){let ya,yb;try{ya=sh(px)*T1-lift;yb=sh(px+SP)*T1-lift}catch(_){continue}
    const ax=px*T1-cam.x,ay=ya-cam.y,bx=(px+SP)*T1-cam.x,by=yb-cam.y,sag=T1*1.4,mx=(ax+bx)/2,my=(ay+by)/2+sag;
    g.strokeStyle='rgba(255,232,196,.42)';g.lineWidth=1.6;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo(mx,my+sag*.2,bx,by);g.stroke();
    for(let k=1;k<6;k++){const u=k/6,lx=(1-u)*(1-u)*ax+2*(1-u)*u*mx+u*u*bx,ly=(1-u)*(1-u)*ay+2*(1-u)*u*(my+sag*.2)+u*u*by,sw=Math.sin(now/700+k+px)*2;
     const gr=g.createRadialGradient(lx+sw,ly+9,0,lx+sw,ly+9,22);gr.addColorStop(0,col+'aa');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.fillRect(lx+sw-22,ly-13,44,44);
     g.fillStyle=col;g.beginPath();g.ellipse(lx+sw,ly+9,6,8,0,0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(lx+sw-2,ly+6,2,3,0,0,6.283);g.fill()}}}
  if(n==5){const w=g.canvas.width/ZM,h=g.canvas.height/ZM,t=now/1000;for(let i=0;i<40;i++){const a=Math.abs(Math.sin(i*91.7)*4375.85)%1,b=Math.abs(Math.sin(i*17.3)*9123.4)%1;
    const x=((a*w+t*22*(.5+b))%w+w)%w,y=((b*h+t*40*(.6+a))%h+h)%h;g.save();g.translate(x,y);g.rotate(t*(1+a)+i);g.fillStyle=COL[i%5];g.globalAlpha=.75;g.beginPath();g.ellipse(0,0,5,2.6,0,0,6.283);g.fill();g.restore()}}
  g.restore()}
 try{const dp=BOSS6.drawProj;BOSS6.drawProj=function(){const r=dp.apply(this,arguments);try{const now=performance.now();if(typeof cur!='undefined'&&cur=='plaza'&&!inRun())lanterns(g,now);else{const h=here();if(h&&h.st==2)lights(g,now)}}catch(_){}return r}}catch(e){console.error('RESTORE1 draw',e)}
 window.RESTORE1={state,restored,here,COL,NAME,apply,REALM,isRealm};
})()}catch(e){console.error('RESTORE1',e)}
