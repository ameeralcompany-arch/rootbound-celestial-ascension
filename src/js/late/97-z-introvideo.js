// ===== INTRO60: the launch cinematic, a 43-second film cut from footage of the real game (audio/intro-cinematic.mp4), with its music and sound already in it.
// The film is cut ahead of time from the Remotion project (rootbound-video) and sits next to index.html like the song, so it never adds to the page.
// "Press any key to skip" appears after a few seconds, next to a Skip button. Settings > General has a button to watch it again. A recording at
// audio/rootbound-voice.mp3, if one is ever added, is spoken over the title.
// CINE7's story intro stays as the fallback: it plays when the film cannot (only index.html was copied, a browser without H.264, a connection too slow to
// start it in time).
const INTRO60=(()=>{
 const SRC='audio/intro-cinematic.mp4',VOICE='audio/rootbound-voice.mp3',SAY=39.6,SKIPAT=3,WAIT=8000,GATE=12000,STALL=8;
 let S=null;
 const volume=()=>{try{return Math.min(1,Math.max(0,(typeof mute!='undefined'&&mute)?0:(OPT.mv==null?.5:+OPT.mv)*1.5))}catch(_){return .75}};

 function launch(home){
  let story=false;try{story=!!localStorage.getItem('rb_story_intro')}catch(_){}
  const v=document.createElement('video');
  if(story||!v.canPlayType||!v.canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"'))return CINE7.launch(home);try{v.preload='auto';v.src=SRC;v.load()}catch(_){}/* buffering starts now, while the game is still starting */
  let n=0;const iv=setInterval(()=>{n++;let rdy=true,bad=false;try{rdy=!window.RBDIAG||RBDIAG.ready;const d=document.getElementById('rbdiag');bad=!!(d&&getComputedStyle(d).display!='none')}catch(_){}
   if(bad||n>330){clearInterval(iv);home();return}if(!rdy)return;clearInterval(iv);try{start(v,home)}catch(e){console.error('INTRO60',e);drop();CINE7.launch(home)}},60)}

 function start(v,home){
  const w=document.createElement('div');w.id='intro60';w.setAttribute('role','img');w.setAttribute('aria-label','Intro film: Rootbound');
  w.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#000;cursor:none;user-select:none;touch-action:none';
  if(!v.getAttribute('src'))v.src=SRC;v.preload='auto';v.playsInline=true;v.setAttribute('playsinline','');v.disablePictureInPicture=true;v.controls=false;
  v.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;pointer-events:none';
  const skip=document.createElement('div');skip.style.cssText='position:absolute;right:30px;bottom:26px;display:flex;align-items:center;gap:16px;font:600 14px Montserrat,system-ui,sans-serif;color:#fff;opacity:0;transition:opacity .5s;text-shadow:0 1px 3px #000;letter-spacing:.04em;pointer-events:none';
  skip.innerHTML='<span>Press any key to skip</span><button type="button" style="font:600 13px Montserrat,system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.55);border-radius:7px;padding:7px 16px;cursor:pointer;pointer-events:auto">Skip</button>';
  const prompt=document.createElement('div');prompt.style.cssText="position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;color:#fff4dc;font:italic 600 34px 'Cormorant Garamond',Georgia,serif;text-align:center;pointer-events:none";
  prompt.innerHTML='Click or press any key to begin<div style="font:600 14px Montserrat,system-ui,sans-serif;font-style:normal;color:rgba(255,255,255,.6);margin-top:12px">This film has music</div>';
  w.append(v,prompt,skip);document.body.appendChild(w);window.RB_COVER=true;
  S={v,w,skip,prompt,home,st:'wait',t0:performance.now(),hint:performance.now(),last:performance.now(),lc:-1,stall:0,said:false,skipped:false,fin:false,vc:null};skip.querySelector('button').addEventListener('click',e=>{e.stopPropagation();skipNow()});
  try{const a=new Audio();a.preload='auto';a.oncanplaythrough=()=>{if(S)S.vc=a};a.src=VOICE;a.load()}catch(_){}
  v.volume=volume();
  v.addEventListener('canplay',()=>{if(S&&S.st=='wait')tryPlay()});
  v.addEventListener('error',()=>{if(S&&!S.fin)giveUp()});
  v.addEventListener('ended',()=>finish());
  addEventListener('keydown',key,true);addEventListener('keyup',keyUp,true);
  w.addEventListener('pointerdown',()=>{if(input())skipNow()});
  w.addEventListener('pointermove',()=>{if(S){S.hint=performance.now();S.w.style.cursor='default'}});
  v.load();S.raf=requestAnimationFrame(tick)}

 function tryPlay(){const s=S;if(!s)return;s.st='try';let p;try{p=s.v.play()}catch(_){return giveUp()}
  if(!p){s.st='on';return}p.then(()=>{if(S===s)s.st='on'}).catch(e=>{if(S!==s)return;if(e&&e.name=='NotAllowedError'){s.st='blocked';s.tb=performance.now();s.prompt.style.display='flex'}else giveUp()})}
 // a browser that blocks sound until the player has touched the page: a short prompt, then the film starts silently and the sound joins on the first click or key
 function input(){const s=S;if(!s)return false;s.hint=performance.now();if(s.st=='blocked'){s.prompt.style.display='none';tryPlay();return false}if(s.st=='late'){s.st='on';s.v.muted=false;return false}return(s.st=='on')&&s.v.currentTime>=SKIPAT}
 function skipNow(){if(S&&!S.fin){S.skipped=true;finish()}}
 function key(e){if(!S)return;if(/^F\d+$/.test(e.key||''))return;e.stopImmediatePropagation();e.preventDefault();if(!e.repeat&&input())skipNow()}
 function keyUp(e){if(!S)return;e.stopImmediatePropagation()}

 function tick(){const s=S;if(!s||s.fin)return;const now=performance.now(),dt=Math.min(.1,(now-s.last)/1000);s.last=now;const v=s.v;
  if(s.replay)try{iT=Math.max(iT,.5)}catch(_){}
  if(s.st=='wait'&&now-s.t0>WAIT)return giveUp();
  if(s.st=='blocked'&&now-s.tb>GATE){s.prompt.style.display='none';s.st='late';v.muted=true;try{const p=v.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
  try{if(!v.muted)v.volume=volume()}catch(_){}
  // the skip prompt comes up after a few seconds
  s.skip.style.opacity=(s.st=='on'||s.st=='late')&&v.currentTime>=SKIPAT?'.85':'0';if(now-s.hint>2500)s.w.style.cursor='none';
  // the name, spoken over the title
  if(!s.said&&s.vc&&v.currentTime>=SAY){s.said=true;say(s)}
  // a film that stops delivering is let go rather than leaving the player on a frozen picture
  if(s.st=='on'||s.st=='late'){if(v.currentTime===s.lc&&!v.paused){s.stall+=dt;if(s.stall>STALL)return finish()}else if(v.paused&&!v.ended){try{const p=v.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}else s.stall=0;s.lc=v.currentTime}
  s.raf=requestAnimationFrame(tick)}
 function say(s){if(typeof mute!='undefined'&&mute)return;try{s.vc.volume=Math.min(1,OPT.sv==null?1:+OPT.sv);const p=s.vc.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}

 function drop(){const s=S;S=null;removeEventListener('keydown',key,true);removeEventListener('keyup',keyUp,true);if(!s)return;cancelAnimationFrame(s.raf);try{s.v.pause();s.v.removeAttribute('src');s.v.load()}catch(_){}try{s.w.remove()}catch(_){}try{if(!(typeof SHOW7!='undefined'&&SHOW7.isOpen))window.RB_COVER=false}catch(_){window.RB_COVER=false}return s}
 // the film could not start: fall back to the story intro
 function giveUp(){const s=drop();if(!s)return;if(s.replay)s.home();else CINE7.launch(s.home)}
 // the film is over or skipped: fade to black, then the game
 function finish(){const s=S;if(!s||s.fin)return;s.fin=true;cancelAnimationFrame(s.raf);s.skip.style.opacity='0';const d=s.skipped?300:120,t0=performance.now();s.v.style.transition='opacity '+d+'ms';s.v.style.opacity='0';
  const a0=(()=>{try{return s.v.volume}catch(_){return 1}})(),fade=()=>{const k=Math.min(1,(performance.now()-t0)/d);try{s.v.volume=a0*(1-k)}catch(_){}if(k<1)requestAnimationFrame(fade);else{drop();try{if(!s.replay)startBGM()}catch(_){}try{s.home()}catch(e){console.error('INTRO60 home',e)}}};fade()}

 // the game's own music waits until the film has finished
 {const _sb=startBGM;startBGM=function(){if(S){S.bgm=1;return}return _sb.apply(this,arguments)}}
 // Settings > General: watch it again. The game keeps its place underneath: its music drops out and nothing can hurt you meanwhile.
 function replay(){if(S)return false;const cover=!!window.RB_COVER;let m=null,g0=1;try{m=bgm&&bgm.m&&bgm.m.gain;if(m){g0=m.value;m.setTargetAtTime(0,bgm.m.context.currentTime,.25)}}catch(_){m=null}
  const back=()=>{try{if(m)m.setTargetAtTime(g0,bgm.m.context.currentTime,.4)}catch(_){}window.RB_COVER=cover};
  try{start(document.createElement('video'),back);S.replay=true}catch(e){console.error('INTRO60 replay',e);drop();back();return false}return true}
 return{launch,replay,get playing(){return !!S},get state(){return S?{st:S.st,t:S.v.currentTime,d:S.v.duration,paused:S.v.paused,muted:S.v.muted,vol:S.v.volume,said:S.said,fin:S.fin,w:S.v.videoWidth,h:S.v.videoHeight,skipShown:S.skip.style.opacity}:null},seek(t){if(S)S.v.currentTime=t},SRC,SAY,SKIPAT}})();
