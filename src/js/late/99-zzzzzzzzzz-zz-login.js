// ===== LOGIN1: the login screen, and the one way into Rootbound. Rootbound is one online game: launch, sign in (or create an account), connect, load your
// progress from the server, enter the world. There is no offline mode and no guest play for players. A server that cannot be reached shows a connection
// screen with Retry; a free server that is asleep is waited for. In the world, a lost connection freezes the game behind a cover while it reconnects.
// Behind the panel, each class is on stage: its own character (look, outfit, weapon, place, aura and sigil come from the evolution cinematics, EVC1),
// breathing, with wind in the hair and cloth, a weapon flourish now and then, and a cinematic change between classes.
// Sign-in, accounts and progress are the existing ones: NET7 (connection and auth), ACCT13 (the account's save on the server), RB_ACCT (its storage).
// Automated test browsers never see this screen (RB_LOGINHOME is only set for players). =====
try{window.LOGIN1=(()=>{
 const HOME=window.RB_LOGINHOME;if(!HOME||typeof NET7=='undefined'||!NET7.PLAYER||!window.EVC1||!window.FILM1)return{needNet(){},fatal(){},newKey(){},on:false};
 const W=1920,H=1080,TAU=6.2832,sin=Math.sin,cos=Math.cos,K=MOVIE1.kit,{glow,motes,sparks,ez,eo,lerp,cl,sr}=K;
 const LS=(()=>{try{return localStorage}catch(_){return null}})(),SS=(()=>{try{return sessionStorage}catch(_){return null}})();
 const lg=k=>{try{return LS.getItem(k)}catch(_){return null}},ls=(k,v)=>{try{v==null?LS.removeItem(k):LS.setItem(k,v)}catch(_){}},sg=k=>{try{return SS.getItem(k)}catch(_){return null}},ss=(k,v)=>{try{v==null?SS.removeItem(k):SS.setItem(k,v)}catch(_){}};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 // ---------- the classes on stage: each its own character, not the player's
 const ORDER=['knight','samurai','archer','mage','demon','elementalist','stormcaller','berserker','ninja','druid','gunslinger','brawler','reaper'];
 const LOOK={knight:{skin:'#f6dcc8',hair:'#f2d27a',hs:0,es:0,eyeCol:'#3a6ad8',gd:0},samurai:{skin:'#f8e0d0',hair:'#1c1418',hs:1,es:1,eyeCol:'#c03a6a',gd:2},archer:{skin:'#f3d6bc',hair:'#b8582a',hs:3,es:2,eyeCol:'#2a9a5a',gd:1},mage:{skin:'#fbe6dc',hair:'#c8b8ff',hs:5,es:3,eyeCol:'#8a4aff',gd:2},
  demon:{skin:'#f0d8d0',hair:'#7a1424',hs:8,es:2,eyeCol:'#ff3a4a',gd:2},elementalist:{skin:'#f4d4b8',hair:'#ff8a3a',hs:2,es:0,eyeCol:'#3ac8ff',gd:0},stormcaller:{skin:'#f1d8c4',hair:'#3a4a9a',hs:4,es:2,eyeCol:'#ffe03a',gd:1},berserker:{skin:'#d8a07a',hair:'#c83a1a',hs:6,es:2,eyeCol:'#ff8a2a',gd:0},
  ninja:{skin:'#f2dccb',hair:'#1a2030',hs:7,es:1,eyeCol:'#7ad0ff',gd:1},druid:{skin:'#f4e0c8',hair:'#5a8a3a',hs:9,es:3,eyeCol:'#9aff7a',gd:2},gunslinger:{skin:'#e8c4a0',hair:'#d8b07a',hs:3,es:1,eyeCol:'#c89a3a',gd:1},brawler:{skin:'#c8865a',hair:'#ff6a2a',hs:2,es:2,eyeCol:'#ffb03a',gd:0},reaper:{skin:'#f0e4f0',hair:'#e8e8ff',hs:5,es:1,eyeCol:'#b48aff',gd:1}};
 const ROLE={knight:'Guardian',samurai:'Duelist',archer:'Ranger',mage:'Arcanist',demon:'Blood pact',elementalist:'Elemental caster',stormcaller:'Storm warrior',berserker:'Warrior',ninja:'Assassin',druid:'Nature keeper',gunslinger:'Gunner',brawler:'Fighter',reaper:'Shadow reaper'};
 const KIND={great:'Greatsword',katana:'Katana',bow:'Bow',staff:'Staff',dagger:'Blade',scythe:'Scythe',spear:'Spear',hammer:'Hammer',axe:'Axe',kunai:'Chakram',branch:'Living staff',gun:'Pistol',gaunt:'Gauntlets'};
 const DESC={knight:'A shield for the many. Holds the line with a greatsword and answers every blow.',samurai:'One clean draw. A wandering blade that cuts like falling petals.',archer:'Swift and far-seeing. The wind carries every arrow home.',mage:'Reads the old equations of the sky and writes them in starlight.',
  demon:'Power taken by pact. Every wound feeds the blade.',elementalist:'Fire, frost, storm and stone, bent to a single will.',stormcaller:'Calls the storm down and rides the thunder in.',berserker:'Rage turned to strength. Every swing shakes the ground.',ninja:'Unseen until the cut. Ink, shadow and a spinning blade.',
  druid:'Speaks for the forest. Roots rise and blossoms heal.',gunslinger:'Six shots and steady hands. Time slows when the hammer falls.',brawler:'Fists like rising suns. Fast, fearless and close.',reaper:'Walks with the dusk, carrying a blade older than its name.'};
 const cname=k=>{try{return CLASS7.C[k].n}catch(_){return k[0].toUpperCase()+k.slice(1)}},wname=k=>{try{return MYART.TH[k].n}catch(_){return''}};
 const STG={},STQ=[];function stage(k){if(STG[k])return STG[k];const q=EVC1.ctx(k,LOOK[k]);STG[k]=q;STQ.push(k);while(STQ.length>3){const o=STQ.shift();if(o!==cur&&o!==nxt){const z=STG[o];delete STG[o];try{z.plate.width=z.plate.height=1;z.plateB.width=z.plateB.height=1}catch(_){}}else STQ.push(o)}return q}
 // ---------- the page
 const root=document.createElement('div');root.id='rbl';root.setAttribute('role','dialog');root.setAttribute('aria-label','Rootbound sign in');
 root.innerHTML='<canvas id="rblc" width="'+W+'" height="'+H+'"></canvas><div class="rbl-shade"></div>'+
  '<div class="rbl-logo" aria-label="Rootbound"><div class="rbl-mark">'+(window.RB_BRANDSYM?String(RB_BRANDSYM).split('brG').join('rblG').replace('class="br-sym"','class="rbl-sym"'):'')+'<b>ROOTBOUND</b></div><i>EVERY WORLD IS WAITING TO BE REMEMBERED</i></div>'+
  '<div class="rbl-class"><small></small><h2></h2><div class="w"></div><p></p></div><nav class="rbl-roster" aria-label="Classes"></nav>'+
  '<aside class="rbl-panel"><div class="rbl-body"></div></aside><div class="rbl-foot"><div class="rbl-srv"><i></i><span>Connecting…</span></div><div class="rbl-ver"><span class="v"></span><button class="rbl-mus" title="Music" aria-label="Music">♪</button></div></div><div class="rbl-fade"></div>';
 const $q=s=>root.querySelector(s),cv=$q('#rblc'),x=cv.getContext('2d',{alpha:false}),body=$q('.rbl-body'),srv=$q('.rbl-srv'),clsEl=$q('.rbl-class'),roster=$q('.rbl-roster');
 const ver=(navigator.userAgent.match(/Rootbound\/(\d+\.\d+\.\d+)/i)||[])[1];$q('.rbl-ver .v').textContent=ver?'Version '+ver:'';
 // ---------- quiet interface sounds and the login music
 let AC0=null;const actx=()=>{try{if(!AC0)AC0=new(window.AudioContext||window.webkitAudioContext)();if(AC0.state=='suspended')AC0.resume();return AC0}catch(_){return null}};
 const vol=()=>{try{return mute?0:cl(OPT.sv==null?1:+OPT.sv,0,1)}catch(_){return 1}},mvol=()=>{try{return mute?0:cl(OPT.mv==null?1:+OPT.mv,0,1)}catch(_){return 1}};
 function blip(f0,f1,d,type,v,dl){const a=actx();if(!a||!vol())return;const t=a.currentTime+(dl||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}
 const SND={hover:()=>blip(1500,1250,.05,'sine',.018),click:()=>{blip(660,640,.16,'triangle',.035);blip(990,980,.2,'sine',.022,.04)},ok:()=>{[523,659,784,1047].forEach((f,i)=>blip(f,f,.5,'sine',.03,i*.08))},err:()=>{blip(240,200,.3,'triangle',.035)},swap:()=>{blip(400,900,.28,'sine',.016)}};
 const mus=new Audio('audio/login/theme.mp3');mus.loop=true;mus.preload='auto';mus.volume=0;let musOn=lg('rb_loginmusic')!=='0',musT=0;
 function musGo(){if(!musOn||!vis)return;try{const p=mus.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}cancelAnimationFrame(musT);const t0=performance.now(),v0=mus.volume,to=.55*mvol(),f=n=>{const k=cl((n-t0)/2200,0,1);mus.volume=cl(v0+(to-v0)*k,0,1);if(k<1)musT=requestAnimationFrame(f)};musT=requestAnimationFrame(f)}
 function musFade(ms,then){cancelAnimationFrame(musT);const t0=performance.now(),v0=mus.volume,f=n=>{const k=cl((n-t0)/ms,0,1);mus.volume=cl(v0*(1-k),0,1);if(k<1)musT=requestAnimationFrame(f);else{try{mus.pause()}catch(_){}then&&then()}};musT=requestAnimationFrame(f)}
 const musBtn=$q('.rbl-mus');musBtn.classList.toggle('off',!musOn);musBtn.onclick=()=>{musOn=!musOn;ls('rb_loginmusic',musOn?'1':'0');musBtn.classList.toggle('off',!musOn);if(musOn)musGo();else musFade(400)};
 const firstTouch=()=>{actx();musGo();removeEventListener('pointerdown',firstTouch,true);removeEventListener('keydown',firstTouch,true)};addEventListener('pointerdown',firstTouch,true);addEventListener('keydown',firstTouch,true);
 root.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('button,a');if(b&&!b.disabled&&b!==root.__hov){root.__hov=b;SND.hover()}});
 // the game's own music waits until the player is in
 let held=false;{const _sb=startBGM;startBGM=function(){if(vis){held=true;return}return _sb.apply(this,arguments)}}
 // ---------- the showcase
 let cur=ORDER[(Math.random()*ORDER.length)|0],nxt=null,tx0=0,last=0,raf=0,vis=false,tLast=performance.now(),T=0,autoT=0,hoverRoster=false;
 const BUST={};function bust(k){if(BUST[k])return BUST[k];const c=document.createElement('canvas');c.width=c.height=112;const y=c.getContext('2d'),sp=EVC1.SPEC[k],P=sp.pal||['#c9a8ff','#2a1a4a','#fff'];
  const G=y.createRadialGradient(56,40,8,56,56,80);G.addColorStop(0,P[2]||'#fff');G.addColorStop(.35,P[0]);G.addColorStop(1,P[1]);y.fillStyle=G;y.fillRect(0,0,112,112);
  try{const s=.118,pose=Object.assign({},EVC1.POSE.great.gather,{noWpn:1,nh:[-16,560],fh:[10,556],hd:{yaw:.28,eye:{open:.95,col:sp.eye}}});y.save();y.translate(56+14*s,70+1422*s);y.scale(s,s);FILM1.body(y,LOOK[k],pose,{t:2,C:sp.C,dress:sp.dress,dk:{p1:1,p2:1,p3:1},evo:sp.evo?sp.evo({p1:1,p2:1,p3:1},true):null,wind:.25});y.restore()}catch(e){console.error('LOGIN1 bust',k,e)}
  return BUST[k]=c}
 function buildRoster(){roster.innerHTML='';const prev=document.createElement('button');prev.className='arr';prev.textContent='‹';prev.setAttribute('aria-label','Previous class');prev.onclick=()=>step(-1);roster.appendChild(prev);
  for(const k of ORDER){const b=document.createElement('button');b.dataset.k=k;b.title=cname(k);b.setAttribute('aria-label',cname(k));b.onclick=()=>{if(k!==cur)swapTo(k)};roster.appendChild(b)}
  const nx=document.createElement('button');nx.className='arr';nx.textContent='›';nx.setAttribute('aria-label','Next class');nx.onclick=()=>step(1);roster.appendChild(nx);
  roster.onmouseenter=()=>hoverRoster=true;roster.onmouseleave=()=>hoverRoster=false;
  // the portraits are painted one per frame by the showcase loop, so the first frame is not held up
  bustQ=ORDER.slice()}
 let bustQ=[];
 function step(d){const i=ORDER.indexOf(nxt||cur);swapTo(ORDER[(i+d+ORDER.length)%ORDER.length])}
 function showText(k){const sp=EVC1.SPEC[k],P=sp.pal;root.style.setProperty('--cc',P[0]);root.style.setProperty('--cc2',P[1]);const n=ORDER.indexOf(k)+1;
  clsEl.classList.remove('swap');void clsEl.offsetWidth;clsEl.classList.add('swap');clsEl.querySelector('small').textContent=ROLE[k].toUpperCase()+'  ·  '+String(n).padStart(2,'0')+' / '+ORDER.length;clsEl.querySelector('h2').textContent=cname(k);
  clsEl.querySelector('.w').innerHTML=esc(KIND[EVC1.TYPE(k)]||'')+(wname(k)?'  ·  <em>'+esc(wname(k))+'</em>':'');clsEl.querySelector('p').textContent=DESC[k];
  for(const b of roster.querySelectorAll('[data-k]'))b.classList.toggle('on',b.dataset.k==k)}
 let queued=null;function swapTo(k){if(!EVC1.SPEC[k])return;if(nxt){if(k!==nxt)queued=k;return}if(k===cur)return;nxt=k;tx0=T;autoT=0;SND.swap();try{stage(k)}catch(e){console.error('LOGIN1 stage',k,e);nxt=null;return}showText(k)}
 // one frame: the place, the sigil, the aura, the character, the light, the motes; and the change between two classes
 const HX=790,HY=1010,HS=.5;
 function idlePose(q,t){const p=q.pose.hero,hd=Object.assign({},p.hd||{}),bl=(t%4.6)<.11;hd.yaw=(hd.yaw==null?.26:hd.yaw)+sin(t*.37)*.05;hd.eye=Object.assign({open:.95},hd.eye||{});if(bl)hd.eye.open=.06;
  let P=Object.assign({},p,{py:(p.py||0)+sin(t*1.6)*7,lean:(p.lean||0)+sin(t*.8)*.012,hd});
  // a flourish every eleven seconds: the class's wind-up, half way, and back
  const f=(t+3)%11;if(f>9.2&&f<10.6){const k=sin(Math.PI*(f-9.2)/1.4)*.5;P=FILM1.lerpPose(P,Object.assign({},q.pose.windup,{hd}),k)}return P}
 function drawClass(q,k,a,dx,t){const sp=q.sp,P=sp.pal;x.save();x.globalAlpha=a;
  const px=sin(t*.05)*30+dx*.25,py=sin(t*.07)*12;x.drawImage(q.plate,-80+px,-50+py,W+160,H+100);
  x.restore();x.save();x.globalAlpha=a;x.translate(dx,0);
  try{EVC1.sigil(q,x,HX,HY+6,480,1,t*.45,.6)}catch(_){}try{EVC1.aura(q,x,HX,HY,.7,t)}catch(_){}
  try{EVC1.rays(x,HX,HY+60,12,900,P[0],.12+.06*sin(t*.9),t,7)}catch(_){}
  const f=(t+3)%11,fl=f>9.6&&f<10.4?sin(Math.PI*(f-9.6)/.8):0;if(fl>0)glow(x,HX+180,HY-560,420,P[2]||'#fff',.35*fl);
  try{EVC1.hero(q,t,x,HX,HY,HS,idlePose(q,t),{wind:.38+.16*sin(t*.9)+.1*sin(t*2.3),act:{rim:[P[2]||'#fff',1,-8,-3],rim2:[P[0],.55,9,-2]}})}catch(e){if(!drawClass.e){drawClass.e=1;console.error('LOGIN1 hero',k,e)}}
  motes(x,ORDER.indexOf(k)+40,t,70,0,0,W,H,P[0],6,-26,.75);x.restore()}
 const STAR=(()=>{const c=document.createElement('canvas');c.width=W;c.height=H*.55|0;const y=c.getContext('2d'),R=sr(5);for(let i=0;i<220;i++){const s=R()*1.6+.3;y.globalAlpha=.2+R()*.7;y.fillStyle=R()<.15?'#ffe6c0':'#fff';y.fillRect(R()*W,R()*c.height,s,s)}return c})();
 function frame(now){raf=0;if(!vis)return;if(document.hidden){raf=requestAnimationFrame(frame);tLast=now;return}let dt=(now-tLast)/1000;tLast=now;if(dt>.1)dt=.1;
  // about 60 frames a second at most; the showcase never needs more
  if(now-last<15.5){raf=requestAnimationFrame(frame);return}last=now;T+=dt;
  autoT+=dt;if(!nxt&&autoT>11&&!hoverRoster&&!document.hidden)step(1);
  if(bustQ.length&&T>.35){const k=bustQ.shift(),b=roster.querySelector('[data-k="'+k+'"]');if(b&&!b.firstChild)try{b.appendChild(bust(k))}catch(_){}}
  x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.fillStyle='#05030c';x.fillRect(0,0,W,H);
  const q0=STG[cur]||stage(cur);
  if(nxt){const u=cl((T-tx0)/1.05,0,1),q1=STG[nxt];drawClass(q0,cur,1-ez(u),-260*ei2(u),T);drawClass(q1,nxt,ez(u),300*(1-eo(u)),T);
   // the change: a sweep of the incoming class's light, a flash at its middle, streaks
   const P=q1.sp.pal,sx=lerp(-400,W+400,eo(u));x.save();x.globalCompositeOperation='lighter';const G=x.createLinearGradient(sx-380,0,sx+380,0);G.addColorStop(0,'rgba(0,0,0,0)');G.addColorStop(.5,P[0]);G.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=.45*sin(Math.PI*u);x.fillStyle=G;x.fillRect(0,0,W,H);x.restore();
   if(u>.3&&u<.6)K.speedLines(x,HX,HY-400,ORDER.indexOf(nxt),T,'rgba(255,255,255,.8)',.4*sin(Math.PI*(u-.3)/.3),40,360);
   if(u>=1){cur=nxt;nxt=null;autoT=0;if(queued){const q=queued;queued=null;swapTo(q)}else setTimeout(prefetch,1200)}}
  else drawClass(q0,cur,1,0,T);
  // high stars and drifting cloud light over every place
  x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.35+.1*sin(T*.7);x.drawImage(STAR,0,0);x.restore();
  raf=requestAnimationFrame(frame)}
 const ei2=u=>u*u;
 function prefetch(){if(!vis)return;const k=ORDER[(ORDER.indexOf(cur)+1)%ORDER.length];const run=()=>{try{if(vis&&!STG[k])stage(k)}catch(_){}};if(window.requestIdleCallback)requestIdleCallback(run,{timeout:3000});else setTimeout(run,200)}
 // ---------- the panel
 let view='',prevForm='login',waitT=0,net0=Date.now();
 const remember=()=>lg('rb_remember')!=='0';
 const hasLocal=()=>{try{if(RB_ACCT.id||lg('rb_imported'))return false;const p=JSON.parse(LS.getItem('rbp')||'null');return !!(p&&(p.made||(p.lvl|0)>1||(p.xp|0)>3))}catch(_){return false}};
 function field(id,label,type,ph,val,ac){return'<div class="rbl-f"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" placeholder="'+esc(ph)+'" value="'+esc(val||'')+'" autocomplete="'+(ac||'off')+'" spellcheck="false" maxlength="'+(type=='password'?128:40)+'">'+(type=='password'?'<button type="button" class="eye" tabindex="-1" aria-label="Show password" data-eye="'+id+'">👁</button>':'')+'</div>'}
 function goBtn(id,txt){return'<button class="rbl-go" id="'+id+'">'+txt+'</button>'}
 function render(v,o){view=v;o=o||{};let h='';
  if(v=='login'){prevForm='login';h='<h3>Welcome to Rootbound</h3><p class="sub">'+esc(o.msg||'Sign in to enter the world.')+'</p>'+field('rbn','Account name','text','Your account name',o.name!=null?o.name:(lg('rb_lastname')||''),'username')+field('rbp','Password','password','Your password','','current-password')+
   '<div class="rbl-row"><label class="rbl-check"><input type="checkbox" id="rbr"'+(remember()?' checked':'')+'> Remember me</label><button class="rbl-link" data-a="forgot">Forgot password?</button></div><div class="rbl-err" role="alert">'+esc(o.err||'')+'</div>'+goBtn('rbgo','Sign in')+'<button class="rbl-alt" data-a="register">Create an account</button>'}
  else if(v=='register'){prevForm='register';const lp=hasLocal();h='<h3>Create your account</h3><p class="sub">One account keeps your character and progress safe on the server, on any computer.</p>'+field('rbn','Account name','text','3–16 letters, numbers, _ or -',o.name||'','username')+field('rbp','Password','password','At least 8 characters','','new-password')+field('rbp2','Password again','password','The same password','','new-password')+
   (lp?'<div class="rbl-row"><label class="rbl-check"><input type="checkbox" id="rbim" checked> Bring my progress from this computer</label></div>':'')+'<div class="rbl-err" role="alert">'+esc(o.err||'')+'</div>'+goBtn('rbgo','Create account')+'<button class="rbl-alt" data-a="login">I already have an account</button>'}
  else if(v=='forgot'){prevForm='forgot';h='<h3>Forgot your password?</h3><p class="sub">Enter your account name and the recovery key you were given when you made it. If you lost the key too, the server owner can reset your password.</p>'+field('rbn','Account name','text','Your account name',o.name!=null?o.name:(lg('rb_lastname')||''),'username')+field('rbk','Recovery key','text','XXXXX-XXXXX-XXXXX-XXXXX','','off')+field('rbp','New password','password','At least 8 characters','','new-password')+field('rbp2','New password again','password','The same password','','new-password')+
   '<div class="rbl-err" role="alert">'+esc(o.err||'')+'</div>'+goBtn('rbgo','Reset password')+'<button class="rbl-alt" data-a="login">Back to sign in</button>'}
  else if(v=='welcome'){const n=(NET7.auth&&NET7.auth.name)||lg('rb_lastname')||'';h='<h3>Welcome back</h3><p class="sub">Your character and progress are waiting on the server.</p><div class="rbl-who"><div class="av">'+esc((n[0]||'?').toUpperCase())+'</div><div><b>'+esc(n)+'</b><small>'+(NET7.auth&&NET7.auth.owner?'Server owner':'Signed in')+'</small></div></div>'+goBtn('rbgo','Enter Rootbound')+'<button class="rbl-alt" data-a="switch">Use another account</button>'}
  else if(v=='key'){h='<h3>'+(o.r?'Password reset':'Your recovery key')+'</h3><p class="sub">'+(o.r?'Your new password is set and you are signed in. Here is a new recovery key; the old one no longer works.':'This key resets your password if you ever forget it. It is shown only once: write it down or keep it somewhere safe.')+'</p><div class="rbl-key">'+esc(o.k)+'</div>'+
   '<div class="rbl-row"><button class="rbl-link" data-a="copy">Copy key</button><span class="rbl-ok" id="rbcp"></span></div><div class="rbl-row"><label class="rbl-check"><input type="checkbox" id="rbsv"> I have saved my recovery key</label></div>'+goBtn('rbgo','Continue')}
  else if(v=='busy'){h='<div class="rbl-busy"><div class="ring"></div><b>'+esc(o.t||'Connecting…')+'</b><small>'+esc(o.s||'')+'</small><div class="rbl-bar"><i></i></div></div>'}
  else if(v=='error'){h='<h3>'+esc(o.title||'Can’t reach the servers')+'</h3><p class="sub">'+esc(o.msg||'Rootbound is an online game and needs its server. Check your internet connection, then try again.')+'</p><div class="rbl-err" role="alert">'+esc(o.err||'')+'</div>'+goBtn('rbgo',o.btn||'Retry')+(o.alt?'<button class="rbl-alt" data-a="'+o.alt[0]+'">'+esc(o.alt[1])+'</button>':'')}
  body.innerHTML='<div class="fade">'+h+'</div>';
  for(const b of body.querySelectorAll('[data-eye]'))b.onclick=()=>{const i=body.querySelector('#'+b.dataset.eye);i.type=i.type=='password'?'text':'password'};
  for(const b of body.querySelectorAll('[data-a]'))b.onclick=()=>act(b.dataset.a);
  const go=body.querySelector('#rbgo');if(go){go.onclick=e=>{ripple(go,e);submit()};if(v=='key'){go.disabled=true;body.querySelector('#rbsv').onchange=e=>{go.disabled=!e.target.checked}}}
  for(const i of body.querySelectorAll('input'))i.addEventListener('input',()=>{const e=body.querySelector('.rbl-err');if(e&&e.textContent)e.textContent=''});
  netUi();const f=body.querySelector('input:not([type=checkbox])');if(f&&vis)setTimeout(()=>{try{(f.value&&body.querySelectorAll('input:not([type=checkbox])')[1]||f).focus()}catch(_){}},60)}
 function ripple(b,e){try{const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height),s=document.createElement('span');s.className='rbl-ripple';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+((e.clientX||r.left+r.width/2)-r.left-d/2)+'px;top:'+((e.clientY||r.top+r.height/2)-r.top-d/2)+'px';b.appendChild(s);setTimeout(()=>s.remove(),650)}catch(_){}SND.click()}
 const val=id=>{const i=body.querySelector('#'+id);return i?i.value:''},err=(m)=>{const e=body.querySelector('.rbl-err');if(e)e.textContent=m;SND.err()};
 function act(a){SND.click();if(a=='forgot')render('forgot',{name:val('rbn')});else if(a=='register')render('register',{name:val('rbn')});else if(a=='login')render('login',{name:val('rbn')});
  else if(a=='switch'){render('busy',{t:'Signing out…'});NET7.signOut()}else if(a=='copy'){const k=body.querySelector('.rbl-key').textContent;try{navigator.clipboard.writeText(k).then(()=>{const c=body.querySelector('#rbcp');if(c)c.textContent='Copied'})}catch(_){}}
  else if(a=='reload'){try{location.reload()}catch(_){}}}
 const online=()=>NET7.state=='ready'||NET7.state=='online';
 function submit(){if(view=='error'){if(NET7.state=='offline'||!NET7.hasUrl){render('busy',{t:'Connecting…',s:'Reaching the Rootbound servers'});NET7.retry()}else location.reload();return}
  if(view=='welcome'){ss('rb_login_go','1');proceed();return}
  if(view=='key'){ss('rb_newkey',null);proceed();return}
  if(!online()){err('Not connected yet. Please wait a moment.');return}
  const n=val('rbn').trim(),p=val('rbp');
  if(view=='login'){if(!n||!p)return err('Enter your account name and password.');ls('rb_remember',body.querySelector('#rbr').checked?'1':'0');ls('rb_lastname',n);begin('Signing in…');NET7.login(n,p);return}
  if(view=='register'){if(!/^[A-Za-z0-9_-]{3,16}$/.test(n))return err('Account name: 3–16 letters, numbers, _ or -');if(p.length<8)return err('The password needs at least 8 characters.');if(p!==val('rbp2'))return err('The two passwords are not the same.');const im=body.querySelector('#rbim');ss('rb_import',im&&im.checked?'1':null);ls('rb_lastname',n);if(lg('rb_remember')==null)ls('rb_remember','1');begin('Creating your account…');NET7.register(n,p);return}
  if(view=='forgot'){const k=val('rbk').trim();if(!n||!k)return err('Enter your account name and recovery key.');if(p.length<8)return err('The new password needs at least 8 characters.');if(p!==val('rbp2'))return err('The two passwords are not the same.');ls('rb_lastname',n);begin('Checking your recovery key…');NET7.recover(n,k,p);return}}
 function begin(t){ss('rb_login_go','1');const n=val('rbn');render('busy',{t,s:'Talking to the Rootbound servers'});render.n=n;clearTimeout(waitT);waitT=setTimeout(()=>{if(view=='busy'&&!NET7.auth){ss('rb_login_go',null);render(prevForm,{name:render.n,err:'The server did not answer. Please try again.'})}},20000)}
 // signed in (and on this account's own save): load the progress, then enter
 function proceed(){const nk=sg('rb_newkey');if(nk){try{const o=JSON.parse(nk);render('key',o);SND.ok();return}catch(_){ss('rb_newkey',null)}}
  render('busy',{t:'Loading your progress…',s:'Your character is kept on the server'});const t0=Date.now();
  const tick=()=>{if(!vis)return;let live=false;try{live=!!ACCT13.live}catch(_){}if(NET7.online&&NET7.auth&&live){render('busy',{t:'Entering the world…',s:'The Plaza is opening'});SND.ok();setTimeout(leave,650);return}
   if(Date.now()-t0>30000){ss('rb_login_go',null);render('error',{title:'Your progress did not load',msg:'The server did not send your saved progress in time. Your account is safe. Please try again.',btn:'Try again'});return}setTimeout(tick,120)};tick()}
 // ---------- the network, as the player sees it
 function netUi(){const st=NET7.state,e=NET7.err;let t='Connecting…',c='';
  if(st=='ready'||st=='online'){c='ok';t='Online'+(NET7.rtt?' · '+NET7.rtt+' ms':'')}else if(st=='connecting')t=/Waking/.test(e)?'Waking the server…':'Connecting…';else if(st=='reconnecting')t='Reconnecting…';else if(st=='offline'&&e){c='bad';t='Server unreachable'}
  srv.className='rbl-srv '+c;srv.querySelector('span').textContent=t;
  const go=body.querySelector('#rbgo');if(go&&/^(login|register|forgot)$/.test(view)){const okNet=st=='ready'||st=='online';go.disabled=!okNet;go.classList.toggle('busy',!okNet&&st!='offline');go.title=okNet?'':'Connecting to the server…'}}
 function onNet(st,e){netUi();if(!vis){lost.state(st,e);return}
  if(st=='offline'&&e&&view!='error'&&!(view=='busy'&&NET7.auth)){ss('rb_login_go',null);render('error',{msg:'Rootbound is an online game and needs its server. Check your internet connection, then try again.',err:e});return}
  if(st=='connecting'&&/Waking/.test(e||'')&&view=='busy'&&!NET7.auth)render('busy',{t:'Waking the server…',s:'The server sleeps when nobody is playing. This takes up to a minute.'});
  if(st=='ready'){// connected and nobody is signed in on this connection
   if(view=='busy'||view=='error'||!view){const rl=lg('rb_relogin');ls('rb_relogin',null);const so=sg('rb_signedout');ss('rb_signedout',null);ss('rb_login_go',null);render('login',{msg:rl?'Your sign-in ended. Please sign in again.':so?'You are signed out.':null})}}}
 function onAuth(m){clearTimeout(waitT);if(!vis)return;
  if(!m.ok){if(m.expired)return;/* the page is reloading */ss('rb_login_go',null);if(view=='busy'||/^(login|register|forgot)$/.test(view)){render(prevForm,{name:render.n,err:m.m||'That did not work'});SND.err()}return}
  if(m.kind=='guest')return;
  if(m.uid!==RB_ACCT.id){render('busy',{t:'Opening your account…',s:'Loading your character'});return}/* ACCT13 switches to this account's own save and reloads */
  if(sg('rb_login_go'))proceed();else render('welcome')}
 // ---------- leaving the login screen for the world
 function leave(){if(!vis)return;ss('rb_login_go',null);root.classList.add('leaving');SND.swap();musFade(900);
  setTimeout(()=>{vis=false;cancelAnimationFrame(raf);window.RB_KEYGATE=null;window.RB_KEYOWN=null;window.RB_COVER=cov0;root.remove();
   for(const k in STG){try{STG[k].plate.width=STG[k].plate.height=1;STG[k].plateB.width=STG[k].plateB.height=1}catch(_){}delete STG[k]}
   const neu=typeof made!='undefined'&&!made;try{if(neu&&typeof INTRO60!='undefined'){INTRO60.launch(()=>{try{HOME()}catch(_){}});}else{if(held)startBGM();HOME()}}catch(e){console.error('LOGIN1 home',e);try{HOME()}catch(_){}}
   // the world should be open within a few seconds; if it is not, say so instead of leaving the player looking at nothing
   const t0=Date.now(),chk=()=>{if(typeof entered!='undefined'&&entered)return;if(typeof INTRO60!='undefined'&&INTRO60.playing){setTimeout(chk,1000);return}if(Date.now()-t0>25000){lost.show('The world did not open','The server did not open the Plaza in time.',true);return}setTimeout(chk,500)};setTimeout(chk,1500)},950)}
 // ---------- a lost connection while playing
 const lost=(()=>{const el=document.createElement('div');el.id='rblost';el.setAttribute('role','alertdialog');document.body.appendChild(el);let on=false,t0=0,c0=false,iv=0;
  function paint(title,msg,btns,spin){el.innerHTML='<div class="p">'+(spin?'<div class="ring"></div>':'')+'<b>'+esc(title)+'</b><p>'+esc(msg)+'</p>'+(btns||[]).map(b=>'<button data-l="'+b[0]+'"'+(b[2]?' class="s"':'')+'>'+esc(b[1])+'</button>').join('')+'</div>';
   for(const b of el.querySelectorAll('[data-l]'))b.onclick=()=>{const a=b.dataset.l;if(a=='retry'){t0=Date.now();NET7.retry();paint('Reconnecting…','Reaching the Rootbound servers.',null,true)}else if(a=='login'){try{location.reload()}catch(_){}}else if(a=='close')hide()}}
  function show(title,msg,fatal){if(!on){on=true;c0=!!window.RB_COVER;t0=Date.now()}window.RB_COVER=true;try{for(const q in K0)K0[q]=0}catch(_){}el.classList.add('on');paint(title,msg,fatal?[['login','Back to sign in']]:null,!fatal);clearInterval(iv);if(!fatal)iv=setInterval(()=>{if(!on)return clearInterval(iv);const s=(Date.now()-t0)/1000|0;if(s>=40)paint('Still reconnecting…','The connection to the server was lost '+s+' seconds ago. Your progress up to then is saved.',[['retry','Retry now'],['login','Back to sign in',1]],true)},1000)}
  function hide(){if(!on)return;on=false;clearInterval(iv);el.classList.remove('on');window.RB_COVER=c0}
  function state(st,e){if(typeof entered=='undefined'||!entered){return}if(st=='reconnecting'||st=='connecting'){show('Connection lost','Reconnecting to the Rootbound servers. The game is paused meanwhile.')}else if((st=='online')&&NET7.auth){hide()}else if(st=='offline'&&e&&!on)show('Connection lost',e,true)}
  return{show,hide,state,el,get on(){return on}}})();
 const K0=(()=>{try{return new Function('return typeof K!="undefined"?K:{}')()}catch(_){return{}}})();
 // ---------- start
 let cov0=false;
 function boot(){vis=true;cov0=!!window.RB_COVER;window.RB_COVER=true;window.RB_KEYOWN=root;window.RB_KEYGATE=e=>{if(e.type!='keydown')return;actx();if(musOn&&mus.paused)musGo();const t=e.target,typing=t&&/^(INPUT|TEXTAREA)$/.test(t.tagName);if(e.key=='Enter'&&(typing||t===document.body)){const g=body.querySelector('#rbgo');if(g&&!g.disabled){ripple(g,{});submit()}}else if(!typing&&e.key=='ArrowLeft')step(-1);else if(!typing&&e.key=='ArrowRight')step(1)};
  document.body.appendChild(root);buildRoster();showText(cur);try{stage(cur)}catch(e){console.error('LOGIN1 stage',e)}requestAnimationFrame(()=>root.classList.add('on'));setTimeout(()=>root.classList.add('settled'),2600);tLast=performance.now();raf=requestAnimationFrame(frame);setTimeout(prefetch,2500);musGo();
  const tok=lg('rbtok');if(sg('rb_login_go')&&tok)render('busy',{t:'Signing in…',s:'Opening your account'});else if(tok)render('busy',{t:'Connecting…',s:'Reaching the Rootbound servers'});else render('busy',{t:'Connecting…',s:'Reaching the Rootbound servers'});
  NET7.onState(onNet);NET7.onAuth(onAuth);NET7.on('rkey',m=>{if(m.ok)keyBox(m.key);else lost.show('Recovery key',m.m||'That did not work',false)});
  // already answered before this screen was ready (a fast local server)
  setTimeout(()=>{const st=NET7.state;if(st=='online'&&NET7.auth&&NET7.auth.kind!='guest'&&NET7.auth.uid===RB_ACCT.id)onAuth({ok:1,uid:NET7.auth.uid,kind:NET7.auth.kind});else onNet(st,NET7.err)},30)}
 function keyBox(k){lost.show('Your new recovery key','',true);lost.el.querySelector('.p').innerHTML='<b>Your new recovery key</b><p>It resets your password if you forget it. The old key no longer works. Keep this one somewhere safe.</p><div style="font:700 18px Consolas,monospace;letter-spacing:.12em;padding:14px;border:1px dashed #c9a8ff;border-radius:12px;margin:0 0 16px;user-select:all">'+esc(k)+'</div><button data-l="copy">Copy</button><button data-l="close" class="s">Done</button>';
  lost.el.querySelector('[data-l=copy]').onclick=()=>{try{navigator.clipboard.writeText(k)}catch(_){}};lost.el.querySelector('[data-l=close]').onclick=()=>lost.hide()}
 boot();
 return{get on(){return vis},needNet(){if(vis)return;lost.show('Connection lost','Reconnecting to the Rootbound servers. The game is paused meanwhile.')},fatal(msg){ss('rb_login_go',null);if(vis){render('error',{title:'Disconnected',msg:String(msg||'You were disconnected from the server.'),btn:'Back to sign in'});view='error';body.querySelector('#rbgo').onclick=()=>location.reload();return}lost.show('Disconnected',String(msg||'You were disconnected from the server.'),true)},newKey(){NET7.newKey()},swapTo,get cur(){return cur},LOOK,ORDER}})()}catch(e){console.error('LOGIN1',e);try{window.RB_LOGINHOME&&window.RB_LOGINHOME()}catch(_){}}
