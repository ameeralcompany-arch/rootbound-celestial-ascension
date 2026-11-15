// ===== RPG.guide: Lavi, your personal mentor. She flies to the real buttons on your screen, says what they do, waits for you to try them and celebrates when you do. A new player meets her right after entering the game;
// everyone else gets one polite offer. Skip, pause, resume and turn her off whenever you like; nothing here ever stops the game. Voice lines: audio/lavi (tools/voice/record.js). She can't say your name out loud, only write it. =====
try{(()=>{
 const RPG=window.RPG,esc=RPG.esc,el=id=>document.getElementById(id),O=()=>RPG.S.opt,T0=()=>RPG.S.tour;
 const V=()=>window.LAVIVOICE||{};
 let wrap=null,cv=null,g=null,bub=null,hl=null,btn=null,raf=0,lastT=0;
 const st={x:-200,y:200,tx:120,ty:400,vx:0,vy:0,pose:'idle',mood:'happy',mouth:0,on:false,s:.62,park:true,look:[0,0],sleep:0,lastAct:performance.now(),orbit:0};
 const mkEls=()=>{if(wrap)return;wrap=document.createElement('div');wrap.id='lavi';cv=document.createElement('canvas');cv.width=300;cv.height=320;cv.style.cssText='position:absolute;left:0;top:0;width:300px;height:320px;inset:auto';wrap.appendChild(cv);document.body.appendChild(wrap);g=cv.getContext('2d');
  bub=document.createElement('div');bub.id='lavib';bub.setAttribute('role','status');bub.setAttribute('aria-live','polite');document.body.appendChild(bub);hl=document.createElement('div');hl.id='lavih';document.body.appendChild(hl);
  btn=document.createElement('button');btn.id='lavibtn';btn.type='button';btn.setAttribute('aria-label','Ask Lavi what to do next');btn.title='Lavi: click to talk, hold and drag to move her';btn.setAttribute('aria-label','Lavi: click to talk, hold and drag to move her');wireBtn();btn.onmouseenter=()=>{if(!speaking&&!st.drag)poseFor('wave',1.1)};document.body.appendChild(btn)};
 const touch=()=>{st.lastAct=performance.now();st.sleep=0};
 let poseUntil=0;function poseFor(p,sec){st.pose=p;poseUntil=performance.now()+sec*1000}
 // ---- where she may be seen: not in a dungeon run, a film or the title screen
 const hidden=()=>{try{if(!entered)return true;if(window.RB_COVER)return true;if(typeof LOGIN1!='undefined'&&LOGIN1.on)return true;if(DG.run)return true;if(DG.cine&&DG.cine.on)return true;if(typeof INTRO60!='undefined'&&INTRO60.playing)return true;if(typeof CINE7!='undefined'&&CINE7.playing)return true;if(window.MOVIE1&&MOVIE1.on)return true;if(window.EVC1&&EVC1.on)return true;if(typeof WBOSS13!='undefined'&&WBOSS13.CIN&&WBOSS13.CIN.on)return true}catch(_){}return !O().auto&&!T.on};
 // ---- when she keeps her thoughts to herself: hidden, a fight close by, a boss, another voice talking. Lines she offers on her own wait for 3 calm seconds
 let fightT=0;const inFight=()=>{const n=performance.now();try{if(hurtF>0||swing>0||mdL)fightT=n;if(typeof WBOSS13!='undefined'&&WBOSS13.fight)return true;if(window.DG&&DG.coop&&DG.coop.on)return true;if(window.FIGHT&&FIGHT.active&&FIGHT.active('me'))fightT=n;for(const m of mobs){if(m&&!m.dead&&Math.abs(m.x-P.x)<T*9&&Math.abs(m.y-P.y)<T*6){fightT=n;break}}}catch(_){}return n-fightT<5000};
 const quiet=()=>{if(hidden())return true;try{if(window.VOX1&&VOX1.busy())return true}catch(_){}return inFight()};
 // ---- her spot: under your profile by default, or wherever you parked her (kept inside the window, re-fitted when it changes size)
 const clampX=x=>Math.max(46,Math.min(innerWidth-46,x)),clampY=y=>Math.max(64,Math.min(innerHeight-56,y));
 let parkR=null,parkT=0;function park(){const p=RPG.S.pos;st.park=true;if(p){st.tx=clampX(p.fx*innerWidth);st.ty=clampY(p.fy*innerHeight);return}const n=performance.now();if(!parkR||n-parkT>1000){parkT=n;const h=el('hudL');parkR=h?h.getBoundingClientRect():{left:10,bottom:70}}const r=parkR;st.tx=Math.max(50,r.left+44);st.ty=Math.min(innerHeight-120,(r.bottom||70)+66)}
 // ---- press and hold her to carry her anywhere; a click (no drag) opens her menu. 6 px of movement makes it a drag, so a click never moves her and a drag never talks
 let dragged=false;function wireBtn(){let d=null;
  btn.addEventListener('pointerdown',e=>{if(e.button!==0||T.on)return;d={id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:st.x-e.clientX,oy:st.y-e.clientY,on:false};try{btn.setPointerCapture(e.pointerId)}catch(_){}});
  btn.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;if(!d.on&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>6){d.on=true;st.drag=true;touch();poseFor('surprised',.35);btn.classList.add('drag');wrap.classList.add('drag');if(speaking&&!T.on){stopVoice();bub.classList.remove('on')}}if(d.on){st.tx=clampX(e.clientX+d.ox);st.ty=clampY(e.clientY+d.oy);e.preventDefault()}});
  const up=e=>{if(!d||e.pointerId!==d.id)return;const was=d.on;d=null;try{btn.releasePointerCapture(e.pointerId)}catch(_){}if(!was)return;dragged=true;st.drag=false;btn.classList.remove('drag');wrap.classList.remove('drag');RPG.S.pos={fx:+(st.tx/innerWidth).toFixed(4),fy:+(st.ty/innerHeight).toFixed(4)};RPG.save();poseFor('land',.5);st.pop=1;try{if(window.UIS)UIS.play('drop')}catch(_){}};
  btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);
  btn.addEventListener('click',e=>{if(dragged){dragged=false;e.preventDefault();return}touch();if(T.on)return;menu()})}
 addEventListener('resize',()=>{if(st.park)park()});
 // ---- the loop. Her own small canvas moves about, so she costs next to nothing on a big screen
 function frame(t){raf=requestAnimationFrame(frame);if(!wrap)return;const dt=Math.min(.05,(t-lastT)/1000||.016);const hide=hidden();wrap.style.display=hide?'none':'';if(btn)btn.classList.toggle('on',!hide&&!T.on);if(hide){if(speaking){const o=speaking.o||{};stopVoice();if(!T.on&&!o.keep&&!(o.actions&&o.actions.length))bub.classList.remove('on')}hl.classList.remove('on');return}
  // parked she needs only 30 frames a second
  if(st.park&&!speaking&&!st.drag&&!st.pop&&Math.hypot(st.x-st.tx,st.y-st.ty)<2&&t-lastT<31)return;lastT=t;if(st.orbit>0){st.orbit-=dt;const a=performance.now()/430;let px=innerWidth/2,py=innerHeight/2;try{px=(P.x-cam.x)*ZM*innerWidth/cv0().width;py=(P.y+P.h/2-cam.y)*ZM*innerHeight/cv0().height}catch(_){}st.tx=px+Math.cos(a)*150;st.ty=py+Math.sin(a*1.4)*70-30}else if(st.park&&!st.drag)park();
  // carried: she follows your pointer closely but softly; released: a little settling bounce
  const k=reduced()?1:Math.min(1,dt*(st.drag?16:3.6)),dx=st.tx-st.x,dy=st.ty-st.y;if(st.pop){st.pop=Math.max(0,st.pop-dt*2.4)}st.vx=dx*k/Math.max(dt,.001);st.vy=dy*k/Math.max(dt,.001);st.x+=dx*k;st.y+=dy*k;const moving=Math.hypot(dx,dy)>26;if(st.wasM&&!moving&&performance.now()>poseUntil)poseFor('land',.45);st.wasM=moving;
  const now=performance.now();if(now>poseUntil)st.pose=moving?'fly':(speaking&&st.point?'point':(speaking?'idle':(now-st.lastAct>90000&&st.park?'sleep':'idle')));
  if(speaking){const q=speaking,sec=q.a?q.a.currentTime:(now-q.t0)/1000,e=q.env||'',i=Math.floor(sec*20);st.mouth=e&&i<e.length?(+e[i]||0)/9:0;highlight(sec)}else st.mouth*=.8;
  const mood=st.pose=='sleep'?'sleepy':st.mood,sq=st.pop?1+Math.sin(st.pop*Math.PI*2)*.06*st.pop:1;cv.style.transform='translate('+Math.round(st.x-150)+'px,'+Math.round(st.y-160)+'px)'+(sq!==1?' scale('+sq.toFixed(3)+','+(2-sq).toFixed(3)+')':'');g.clearRect(0,0,300,320);try{if(window.LAVIART)LAVIART.draw(g,{x:150,y:160,s:st.s,t:now/1000,pose:st.pose,mood,mouth:st.mouth,flip:dx<-6?true:dx>6?false:st.flip,bank:Math.max(-.3,Math.min(.3,st.vx/900)),look:st.look})}catch(e){console.error('Lavi draw',e);cancelAnimationFrame(raf)}if(dx<-6)st.flip=true;else if(dx>6)st.flip=false;
  if(btn&&st.park){btn.style.left=Math.round(st.x-37)+'px';btn.style.top=Math.round(st.y-41)+'px'}posBubble()}
 const reduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}};const cv0=()=>document.getElementById('c')||document.querySelector('canvas');
 function posBubble(){if(!bub||!bub.classList.contains('on'))return;const w=bub.offsetWidth,h=bub.offsetHeight,lf=st.x+70,x=lf+w>innerWidth-10?st.x-w-70:lf,y=Math.max(10,Math.min(innerHeight-h-10,st.y-h/2));bub.style.left=Math.max(10,Math.round(x))+'px';bub.style.top=Math.round(y)+'px'}
 // ---- speech. Real audio with subtitles that follow along. Muted or missing audio: the same timing with no sound, so nothing depends on it
 let speaking=null,sayN=0;
 const fill=s=>{let n='';try{n=myName||''}catch(_){}return String(s||'').replace(/\{name\}/g,n||'adventurer')};
 function stopVoice(){if(speaking){const q=speaking;speaking=null;try{if(q.a){q.a.pause();q.a.src=''}}catch(_){}clearTimeout(q.tm)}}
 function highlight(sec){const q=speaking;if(!q||!q.words||!O().sub)return;const sp=bub.querySelectorAll('.tx span');let n=0;for(let i=0;i<q.words.length;i++)if(sec>=q.words[i][1])n=i+1;if(n!==q.wn){q.wn=n;for(let i=0;i<sp.length;i++)sp[i].classList.toggle('on',i<n)}}
 // say a line; o: {text (replaces the subtitle, e.g. with your real numbers), then, actions, hint, keep}
 // o: {auto (she offers it herself: once ever, queued until calm, 25 s apart), force (you asked: always spoken), silent (text only), now (a queued line's turn)}.
 // A line you have already heard is never spoken again on its own; in the tour it comes back as text only, so the steps still read
 const CFG={gap:25000,calm:3000},AQ=[];let lastAuto=-1e9,hushNow=null;const sessSaid={};
 function enqueue(id,o){if(!id||AQ.some(q=>q.id==id)||AQ.length>=3)return;AQ.push({id,o})}
 let calmT=performance.now();setInterval(()=>{try{if(!began)return;if(quiet()||speaking||T.on){calmT=performance.now();return}if(!AQ.length||performance.now()-calmT<CFG.calm||performance.now()-lastAuto<CFG.gap)return;const q=AQ.shift();const SD=RPG.S.said||{};if(SD[q.id])return;say(q.id,Object.assign({},q.o,{now:1}))}catch(_){}},1000);
 function say(id,o){o=o||{};const SD=RPG.S.said||(RPG.S.said={}),forced=!!(o.force||(T.on&&T.one));
  if(o.auto&&!forced){if(id&&(SD[id]||sessSaid[id]))return false;if(!o.now&&(T.on||speaking||quiet()||performance.now()-lastAuto<CFG.gap)){enqueue(id,o);return false}lastAuto=performance.now()}
  const silent=!!o.silent||(!!id&&!!SD[id]&&!forced);if(id&&!silent&&!o.noMark&&V()[id]){SD[id]=Date.now();sessSaid[id]=1;RPG.save()}
  mkEls();touch();stopVoice();const myN=++sayN,L=V()[id]||{text:o.text||'',dur:2,mood:'happy'},full=fill(o.text||L.text),dur=Math.max(1.2,+L.dur||2);st.mood=L.mood=='pointing'?'happy':L.mood=='excited'?'excited':L.mood=='thinking'?'thinking':L.mood=='surprised'?'surprised':'happy';st.point=L.mood=='pointing';if(L.mood=='excited')poseFor('celebrate',1.2);else if(L.mood=='thinking')poseFor('think',dur);else if(L.mood=='surprised')poseFor('surprised',1);
  const useWords=!o.text&&L.words&&O().sub;const tx=O().sub?(useWords?L.words.map(w=>'<span>'+esc(fill(w[0]))+'</span>').join(' '):esc(full)):'<i>'+esc('Lavi is talking')+'</i>';
  bub.innerHTML='<div class="nm">LAVI<span class="sp">'+(id?'<button data-r="1" title="Hear it again">↻</button>':'')+'<button data-m="1" title="'+(O().mute?'Turn her voice on':'Mute her voice')+'">'+(O().mute?'🔇':'🔊')+'</button>'+(T.on?'<button data-p="1" title="Pause the tutorial">❚❚</button><button data-x="1" title="Skip the tutorial">Skip</button>':'<button data-c="1" title="Close">×</button>')+'</span></div><div class="tx">'+tx+'</div>'+(o.hint?'<p class="hint">'+esc(o.hint)+'</p>':'')+'<div class="ac"></div>';
  bub.classList.add('on');bub.classList.toggle('menu',!!o.menu);const ac=bub.querySelector('.ac');for(const a of o.actions||[]){const b=document.createElement('button');b.textContent=a.t;if(a.pri)b.className='pri';b.onclick=()=>{touch();a.f()};ac.appendChild(b)}
  const q=bub.querySelector('[data-r]');if(q)q.onclick=()=>say(id,Object.assign({},o,{force:1,auto:0,silent:0}));const m=bub.querySelector('[data-m]');m.onclick=()=>{O().mute=O().mute?0:1;RPG.save();m.textContent=O().mute?'🔇':'🔊';m.title=O().mute?'Turn her voice on':'Mute her voice';if(O().mute&&hushNow)hushNow()};const p=bub.querySelector('[data-p]');if(p)p.onclick=()=>T.pause();const x=bub.querySelector('[data-x]');if(x)x.onclick=()=>T.skip();const c=bub.querySelector('[data-c]');if(c)c.onclick=()=>{stopVoice();bub.classList.remove('on')};
  const q2={id,o,t0:performance.now(),env:L.env||'',words:useWords?L.words:null,wn:-1,a:null,tm:0};speaking=q2;const done=()=>{if(speaking!==q2||myN!==sayN)return;speaking=null;if(o.then)o.then();else if(!o.keep&&!(o.actions&&o.actions.length)&&!T.on)setTimeout(()=>{if(myN===sayN&&!speaking)bub.classList.remove('on')},2600)};
  // muting her, or another voice starting (VOX1), stops the sound but lets the line finish its time, so the tour never stalls
  hushNow=()=>{if(speaking!==q2||!q2.a)return;const rem=Math.max(.3,dur-(q2.a.currentTime||0));try{q2.a.onended=null;q2.a.pause()}catch(_){}q2.a=null;q2.t0=performance.now()-(dur-rem)*1000;q2.tm=setTimeout(done,rem*1000)};
  if(!silent&&!O().mute&&V()[id]){try{const a=new Audio('audio/lavi/'+id+'.mp3');a.volume=Math.max(0,Math.min(1,+O().vol||0));q2.a=a;a.onended=done;a.onerror=()=>{q2.a=null;q2.t0=performance.now();q2.tm=setTimeout(done,dur*1000)};const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{q2.a=null;q2.t0=performance.now();q2.tm=setTimeout(done,dur*1000)})}catch(_){q2.a=null;q2.tm=setTimeout(done,dur*1000)}}else q2.tm=setTimeout(done,dur*(silent?.6:O().mute?.8:1)*1000);return true}
 // ---- flying to something real on your screen and lighting it softly
 function target(e){if(!e){hl.classList.remove('on');return}const r=e.getBoundingClientRect();if(r.width<2){hl.classList.remove('on');return}hl.style.left=r.left-5+'px';hl.style.top=r.top-5+'px';hl.style.width=r.width+10+'px';hl.style.height=r.height+10+'px';hl.classList.add('on');st.park=false;const lf=r.left>innerWidth/2;st.tx=Math.max(60,Math.min(innerWidth-60,lf?r.left-80:r.right+80));st.ty=Math.max(90,Math.min(innerHeight-90,r.top+r.height/2-24));st.look=[lf?1:-1,0]}
 const navBtn=id=>{try{const f=NAV16.F.find(q=>q.id==id);const b=f&&el(f.btn);if(b&&b.offsetWidth>0)return b;}catch(_){}return document.querySelector('.n16menu,#bmenu16')||null};
 const openNav=id=>{try{if(!navOn(id))NAV16.act(id)}catch(_){}};const navOn=id=>{try{const f=NAV16.F.find(q=>q.id==id);return !!(f&&f.on())}catch(_){return false}};
 const closeAll=()=>{try{NAV16.closeAll()}catch(_){}try{RPG.enh.close()}catch(_){}try{RPG.items.close()}catch(_){}try{RPG.path.close()}catch(_){}try{DG.page.close()}catch(_){}};
 // ---- the tour. Each step: where to look, what she says, what counts as doing it, and what to say then
 const nv=(id,l,ok,hint)=>({id:l,at:()=>navBtn(id),line:'tour_'+l,done:()=>navOn(id),ok:'tour_'+l+'_ok',hint:hint,show:()=>openNav(id)});
 const STEPS=[nv('character','profile',1,'Click the glowing button'),nv('inventory','inventory',1,'Click the glowing button'),nv('equipment','equipment',1,'Click the glowing button'),
  {id:'hotbar',at:()=>el('bar'),line:'tour_hotbar',hint:'Press a number key from 1 to 7, or scroll',done:()=>wpMoved(),ok:'tour_hotbar_ok'},
  {id:'cp',at:()=>el('cp16'),lines:['tour_cp','tour_cp2'],hint:'Click your Combat Power',done:()=>RPG.path.isOpen&&!!RPG.S.seenCP,ok:'tour_cp_ok',show:()=>RPG.path.open('cp')},
  nv('skills','skills',1,'Click the glowing button'),nv('classes','classes',1,'Click the glowing button'),nv('worlds','worlds',1,'Click the glowing button'),nv('quests','quests',1,'Click the glowing button'),nv('store','store',1,'Click the glowing button'),
  {id:'dungeon',at:()=>navBtn('dungeons'),line:'tour_dungeon',done:()=>DG.page.on,hint:'Click the glowing button',show:()=>{try{DG.page.open('ancient','ruins')}catch(_){}},then:'req'},
  {id:'req',at:()=>document.querySelector('#dg16 .rpgrq'),line:'tour_dungeon2',auto:1,keepOpen:1},
  {id:'rewards',at:()=>document.querySelector('#dg16 .rtb'),line:'tour_rewards',hint:'Click any material',done:()=>RPG.items.isOpen,ok:'tour_rewards_ok',keepOpen:1},
  {id:'enhance',at:()=>el('cp16'),line:'tour_enhance',hint:'Press "Show me" to open the forge',done:()=>RPG.enh.isOpen,ok:'tour_enhance_ok',show:()=>RPG.enh.open()},
  nv('ach','achievements',1,'Click the glowing button'),nv('settings','settings',1,'Click the glowing button')];
 let wp0=null;const wpMoved=()=>{try{return wp0!=null&&wp!==wp0}catch(_){return false}};
 const T={on:false,paused:false,tm:0,one:false,saved:null,start(from){mkEls();T.on=true;T.paused=false;const s=T0();s.off=0;s.done=0;s.paused=0;s.snooze=0;s.step=from|0;RPG.save();closeAll();/* the welcome is said once: after that the tour starts straight at its first step */if(s.step==0&&!(RPG.S.said&&RPG.S.said.intro3))intro();else T.run()},
  // replay one step you asked for, spoken again, without touching your tour progress
  only(i){mkEls();if(T.on)T.stop();const s=T0();T.saved={step:s.step,done:s.done,off:s.off,paused:s.paused};T.one=true;T.on=true;T.paused=false;s.step=Math.max(0,Math.min(STEPS.length-1,i|0));closeAll();T.run()},
  stop(){const wasOne=T.one;if(T.one){Object.assign(T0(),T.saved||{});T.one=false;T.saved=null;RPG.save()}T.on=false;clearInterval(T.tm);stopVoice();sayN++;if(bub)bub.classList.remove('on');target(null);st.orbit=0;park();closeAll();return wasOne},
  skip(){if(T.one){T.stop();return}T0().off=1;RPG.save();T.stop();say('skipped',{})},pause(){T.paused=true;T0().paused=1;RPG.save();clearInterval(T.tm);target(null);stopVoice();park();say('paused',{keep:1,actions:[{t:'Resume',pri:1,f:()=>T.resume()},{t:'Skip the tutorial',f:()=>T.skip()}]})},resume(){T.paused=false;T0().paused=0;RPG.save();T.run()},
  run(){if(!T.on||T.paused)return;const s=T0();if(s.step>=STEPS.length)return T.end();const S0=STEPS[s.step];const go=()=>{const nx=()=>{if(T.one&&!S0.then){T.stop();poseFor('celebrate',1.2);return}if(!S0.keepOpen&&!(STEPS[s.step+1]&&STEPS[s.step+1].keepOpen))closeAll();s.step++;RPG.save();T.run()};
    const after=()=>{clearInterval(T.tm);if(!T.on||T.paused)return;if(S0.auto){setTimeout(nx,300);return}const acts=[{t:'Next',pri:0,f:nx}];if(S0.show&&!(S0.done&&S0.done()))acts.unshift({t:'Show me',pri:1,f:S0.show});if(S0.done&&S0.done())return yes();/* the line was just spoken: only the buttons change, nothing is said twice */say(lastLine,{keep:1,hint:S0.hint,actions:acts,silent:1,noMark:1});T.tm=setInterval(()=>{const t=S0.at&&S0.at();if(t)target(t);if(S0.done&&S0.done())yes()},260)};
    let yesOnce=false;const yes=()=>{if(yesOnce||!T.on)return;yesOnce=true;clearInterval(T.tm);poseFor('celebrate',1.4);if(S0.ok)say(S0.ok,{then:()=>setTimeout(nx,350),actions:[{t:'Next',f:nx}]});else nx()};
    const L=S0.lines||[S0.line],lastLine=L[L.length-1];let i=0;const t0=S0.at&&S0.at();if(t0)target(t0);else{target(null);st.park=true}wp0=(()=>{try{return wp}catch(_){return null}})();const seq=()=>{if(i<L.length-1){say(L[i++],{then:seq,actions:[{t:'Next',f:nx}]})}else say(lastLine,{then:after,hint:S0.hint,actions:[{t:'Next',f:nx}].concat(S0.show?[{t:'Show me',pri:1,f:S0.show}]:[])})};seq();
    // done while she is still talking counts too
    clearInterval(T.tm);T.tm=setInterval(()=>{const t=S0.at&&S0.at();if(t)target(t);if(S0.done&&S0.done()){stopVoice();yes()}},260)};go()},
  end(){T.on=false;clearInterval(T.tm);closeAll();target(null);T0().done=1;T0().step=0;RPG.save();st.orbit=4;poseFor('celebrate',4);say('tour_end',{then:()=>{park();st.orbit=0;say('tour_end2',{})},actions:[]});try{gems+=150;saveP()}catch(_){}}};
 function intro(){const s=T0();st.x=-140;st.y=innerHeight*.3;st.orbit=9;st.park=false;poseFor('surprised',.9);const sk=[{t:'Skip the tutorial',f:()=>T.skip()}];const third=()=>{st.orbit=0;st.tx=innerWidth/2-200;st.ty=innerHeight/2-60;poseFor('wave',2);say('intro3',{keep:1,actions:[{t:"Let's go!",pri:1,f:()=>{s.step=0;RPG.save();T.run()}}].concat(sk)})};say('hello',{actions:sk,then:()=>say('intro2',{actions:sk,then:third})})}
 // ---- when you ask how to get stronger
 function stronger(did){RPG.path.open('next');const r=did?RPG.short(did):{level:0,cp:0},n=RPG.next();const ln=r.level&&r.cp?'need_both':r.level?'need_level':r.cp?'almost':n.line;mkEls();st.park=true;say(ln,{text:null,then:()=>say('stronger',{then:()=>say('stronger2',{})})})}
 // ---- little reactions. Never during a tour, never more than one every few seconds
 // a little congratulation the first time something happens, then she trusts you know (never in a tour, never over a fight; they wait their calm turn)
 function react(id){if(T.on||O().mute&&!O().sub)return;say(id,{auto:1})}
 RPG.events=function(ev,d){try{touch();if(ev=='upgraded'){poseFor('celebrate',1.5);react('upgraded')}}catch(_){}};
 let lvSeen=-1,open0=null;setInterval(()=>{try{if(!entered||!wrap)return;const L=lvl|0;if(lvSeen>=0&&L>lvSeen)react('levelup');lvSeen=L;const o=DG.LIST.filter(d=>!DG.lockReason(d.id)).length;if(open0!=null&&o>open0)react('unlocked');open0=o}catch(_){}},2000);
 // ---- who meets her and when
 const testing=()=>{try{return navigator.webdriver&&!localStorage.getItem('rb_lavi_test')}catch(_){return false}};
 let began=false;function begin(){if(began)return;began=true;mkEls();try{LAVIART.preload(st.s)}catch(_){}raf=requestAnimationFrame(frame);park();st.x=st.tx;st.y=st.ty;const s=T0();if(!O().auto||s.off||s.done)return;
  // a tour you left halfway: one quiet written offer (her "offer" recording is about a new tour, so it is not played here); "Not now" rests it for three days
  if(s.step>0&&s.step<STEPS.length){if(s.snooze&&Date.now()-s.snooze<3*864e5)return;say('offer',{silent:1,noMark:1,text:'Shall we carry on with your tour where we left off?',keep:1,actions:[{t:'Resume',pri:1,f:()=>T.start(s.step)},{t:'Not now',f:()=>{s.snooze=Date.now();RPG.save();stopVoice();bub.classList.remove('on')}},{t:'Skip the tutorial',f:()=>T.skip()}]});return}
  const fresh=(lvl|0)<=2&&((stats.kill|0)+(stats.break|0))<40;if(fresh){T.start(0);return}if(!RPG.S.offered){RPG.S.offered=1;RPG.save();say('offer',{keep:1,actions:[{t:'Yes, show me',pri:1,f:()=>T.start(0)},{t:'No thanks',f:()=>{s.off=1;RPG.save();stopVoice();bub.classList.remove('on')}}]})}}
 // ---- her menu: click her (without dragging). Everything here opens a real page of the game
 const STEPN={profile:'Your profile',inventory:'Your bag',equipment:'Equipment',hotbar:'The hotbar',cp:'Combat Power',skills:'Skills',classes:'Classes',worlds:'Worlds',quests:'Quests',store:'The store',dungeon:'Dungeons',req:'Dungeon requirements',rewards:'Dungeon rewards',enhance:'The forge',achievements:'Achievements',settings:'Settings'};
 const call=f=>()=>{try{bub.classList.remove('on');f()}catch(e){console.error('Lavi menu',e)}};
 function menu(page){mkEls();poseFor('wave',1);const M=[];
  if(page=='replay'){STEPS.forEach((q,i)=>{if(q.auto)return;M.push({t:STEPN[q.id]||q.id,f:call(()=>T.only(i))})});M.push({t:'Back',f:()=>menu()});return say('',{silent:1,noMark:1,keep:1,menu:1,text:'Which part shall I show you again?',actions:M})}
  M.push({t:'What should I do next?',pri:1,f:call(()=>{RPG.path.open('next');const n=RPG.next();say(n.line,{text:n.text,force:1})})});
  if(typeof GUIDE10!='undefined')M.push({t:'Beginner guide',f:call(()=>GUIDE10.open())});
  if(window.DG&&DG.page)M.push({t:'Dungeons',f:call(()=>DG.page.open('ancient'))});
  if(typeof GUIDE8!='undefined')M.push({t:'Items and tools',f:call(()=>GUIDE8.open('basics'))});
  if(RPG.enh)M.push({t:'Make my gear stronger',f:call(()=>RPG.enh.open())});
  if(typeof STORY1!='undefined')M.push({t:'The story so far',f:call(()=>STORY1.open())});
  M.push({t:'Show me a part again',f:()=>menu('replay')});
  if(RPG.S.pos)M.push({t:'Go back to my corner',f:call(()=>{RPG.S.pos=null;RPG.save();park()})});
  M.push({t:O().mute?'Turn your voice on':'Mute your voice',f:()=>{O().mute=O().mute?0:1;RPG.save();if(O().mute&&hushNow)hushNow();menu()}});
  M.push({t:'Close',f:()=>{stopVoice();bub.classList.remove('on')}});
  say('',{silent:1,noMark:1,keep:1,menu:1,text:'Hi '+fill('{name}')+'! What would you like to look at?',actions:M})}
 setInterval(()=>{try{if(began||testing()||!entered||hidden()||typeof entered=='undefined')return;begin()}catch(_){}},1500);
 // ---- settings rows live in the Audio page (90-settings-organize.js)
 RPG.guide={say,stronger,start:f=>T.start(f||0),stop:()=>T.stop(),skip:()=>T.skip(),pause:()=>T.pause(),resume:()=>T.resume(),begin,target,get touring(){return T.on},get paused(){return T.paused},get step(){return T0().step},get stepId(){const q=STEPS[T0().step];return q&&q.id},STEPS,get speaking(){return speaking&&speaking.id},opt:O,park,setVol(v){O().vol=v;RPG.save()},setMute(v){O().mute=v?1:0;RPG.save()},setSub(v){O().sub=v?1:0;RPG.save()},setShow(v){O().auto=v?1:0;RPG.save()},replay(){closeAll();T0().off=0;T0().done=0;T0().step=0;RPG.save();T.start(0)},get st(){return st},
  cfg:CFG,menu,only:i=>T.only(i),hush(){try{if(hushNow)hushNow()}catch(_){}},quiet,get queue(){return AQ.map(q=>q.id)},resetPos(){RPG.S.pos=null;RPG.save();park()},get pos(){return RPG.S.pos}};
})()}catch(e){console.error('RPG guide',e)}
