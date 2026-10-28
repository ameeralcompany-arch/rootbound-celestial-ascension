try{RBDIAG.stage('late-scripts-loaded')}catch(_){}
// ===== V6 main loop: legacy update/draw + VFX + minimap + quality manager =====
(function(){let last=performance.now(),fpsC=0,fpsT=last,acc=0;
 function loop(n){const raw=n-last;last=n;
  if(window.RB_COVER&&(!window.RBDIAG||RBDIAG.ready)){requestAnimationFrame(loop);return}const dt=Math.min(.05,raw/1000);window.FDT=dt;
  try{update(dt);evTick(dt);BOSS6.tick(dt);try{OBJ6.tick(dt)}catch(_){}DAILY6.tick(dt);VFX.update(dt);draw();if(window.RBDIAG&&!RBDIAG.ready)RBDIAG.done();
   if(entered){const w=cv.width,hh=cv.height;g.save();g.scale(ZM,ZM);VFX.draw(g,cam.x,cam.y,w/ZM,hh/ZM);BOSS6.drawProj(g,cam.x,cam.y);g.restore();POST6.run(w,hh);UI6.minimap(n)}}catch(e){if(!loop.err){loop.err=1;console.error(e)}}
  QM.tick(raw,n);fpsC++;if(n-fpsT>500){$('fps').textContent=Math.round(fpsC*1000/(n-fpsT))+' fps | '+QM.cur.n+' | fx '+VFX.count;fpsC=0;fpsT=n}
  requestAnimationFrame(loop)}
 requestAnimationFrame(loop)})();
