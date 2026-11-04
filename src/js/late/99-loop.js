try{RBDIAG.stage('late-scripts-loaded')}catch(_){}
// ===== V6 main loop: legacy update/draw + VFX + minimap + quality manager =====
// While a big menu covers the screen (inventory, store, classes, character/settings panels) the world keeps simulating every frame but is
// redrawn at ~30 fps behind it: the menu (its glass, scrolling and animations) gets the time instead of a world you can barely see.
(function(){let last=performance.now(),fpsC=0,fpsT=last,acc=0,lastDraw=0;
 const good={x:0,y:0,ok:false},nf=v=>!Number.isFinite(v);
 function sane(){let hit='';if(nf(P.x)||nf(P.y)||nf(P.vx)||nf(P.vy)){hit='player';if(good.ok&&(nf(P.x)||nf(P.y))){P.x=good.x;P.y=good.y}P.vx=0;P.vy=0}else{good.x=P.x;good.y=P.y;good.ok=true}
  if(nf(ZM)||ZM<=0){hit='zoom';ZM=1}if(nf(cam.x)||nf(cam.y)){hit=hit||'camera';cam.x=P.x-cv.width/ZM/2;cam.y=P.y-cv.height/ZM/2}if(hit&&!sane.said){sane.said=1;console.warn('[rootbound] a broken '+hit+' number was repaired')}}
 const menu=()=>{try{return !!(entered&&((typeof INV7!='undefined'&&INV7.isOpen)||(typeof STORE7!='undefined'&&STORE7.isOpen)||(typeof CLS9!='undefined'&&CLS9.isOpen())||(typeof UI6!='undefined'&&UI6.on)))}catch(_){return false}};
 function loop(n){const raw=n-last;last=n;
  if(window.RB_COVER&&(!window.RBDIAG||RBDIAG.ready)){requestAnimationFrame(loop);return}const hs=window.HS_T>0;if(hs)window.HS_T-=raw/1000;const dt=Math.min(.05,raw/1000)*(hs?.06:1);window.FDT=dt;
  const dn=!menu()||n-lastDraw>=32;if(dn)lastDraw=n;try{update(dt);sane();evTick(dt);BOSS6.tick(dt);try{OBJ6.tick(dt)}catch(_){}DAILY6.tick(dt);VFX.update(dt);if(dn)draw();if(window.RBDIAG&&!RBDIAG.ready)RBDIAG.done();
   if(entered&&dn){const w=cv.width,hh=cv.height;g.save();g.scale(ZM,ZM);VFX.draw(g,cam.x,cam.y,w/ZM,hh/ZM);BOSS6.drawProj(g,cam.x,cam.y);g.restore();POST6.run(w,hh);UI6.minimap(n)}}catch(e){if(!loop.err){loop.err=1;console.error(e)}
   // a frame that throws mid-draw skips its g.restore(): without this the world zoom stacks up and stays stuck (and the view goes blank)
   try{if(g.reset)g.reset();else{g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over'}}catch(_){}}
  QM.tick(raw,n);fpsC++;if(n-fpsT>500){$('fps').textContent=Math.round(fpsC*1000/(n-fpsT))+' fps | '+QM.cur.n+' | fx '+VFX.count;fpsC=0;fpsT=n}
  requestAnimationFrame(loop)}
 requestAnimationFrame(loop)})();
