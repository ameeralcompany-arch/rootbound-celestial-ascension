// ===== MOVIE1: the class story movies. One small engine, a separate timeline for each class.
// It is the sequence manager, camera, dialogue and subtitles, audio transitions, skip and replay, and state restoration in one place. Every frame is computed from the movie's time alone (no frame depends on the last one), so seeking, skipping and filming are exact.
// While a movie plays the game world is frozen exactly where it stands (RB_COVER, the same pause the trailer and showcase use) and nothing about the player changes, so there is nothing to restore but the music and the keys. Nothing here costs anything until a movie starts; its pictures and sounds are loaded then and released at the end.
// The reward never lives here: a movie only reports "the reveal was reached" (or "skipped"); EVO1 grants the evolution, once. =====
try{window.MOVIE1=(()=>{
 const TAU=6.2832,V_W=1920,V_H=1080,cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k;
 const ez=k=>{k=cl(k,0,1);return k*k*(3-2*k)},eo=k=>1-Math.pow(1-cl(k,0,1),3),ei=k=>{k=cl(k,0,1);return k*k*k};
 const sr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const REG={};let M=null;
 const reduce=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const nameOf=()=>{try{return String(myName||'').replace(/^\[\d+\]\s*/,'')||'Traveler'}catch(_){return'Traveler'}};
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c};
 // ---------- reusable drawing kit
 const GLOW={};function glowOf(c0){let c=c0;if(c.length==4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];if(GLOW[c])return GLOW[c];const S=256,g=mk(S,S),x=g.getContext('2d'),G=x.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);G.addColorStop(0,c);G.addColorStop(.25,c+'aa');G.addColorStop(.6,c+'22');G.addColorStop(1,c+'00');x.fillStyle=G;x.fillRect(0,0,S,S);return GLOW[c]=g}
 function glow(x,px,py,r,c,a){if(a<=0||r<=0)return;x.save();x.globalCompositeOperation='lighter';x.globalAlpha=a;x.drawImage(glowOf(c),px-r,py-r,r*2,r*2);x.restore()}
 function rect(x,c,a){if(a<=0)return;x.save();x.setTransform(M?M.k:1,0,0,M?M.k:1,0,0);x.globalAlpha=a;x.fillStyle=c;x.fillRect(-20,-20,V_W+40,V_H+40);x.restore()}
 function crescent(x,cx,cy,r,a0,a1,w,c,al,core){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=al;const n=22;x.beginPath();for(let i=0;i<=n;i++){const k=i/n,a=lerp(a0,a1,k),R=r+w*Math.sin(k*3.14)*.5;x[i?'lineTo':'moveTo'](cx+Math.cos(a)*R,cy+Math.sin(a)*R)}for(let i=n;i>=0;i--){const k=i/n,a=lerp(a0,a1,k),R=r-w*Math.sin(k*3.14)*.5;x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R)}x.closePath();x.fillStyle=c;x.fill();if(core){x.globalAlpha=al;x.strokeStyle='#fff';x.lineWidth=w*.12;x.beginPath();x.arc(cx,cy,r,a0,a1,a1<a0);x.stroke()}x.restore()}
 function speedLines(x,cx,cy,seed,t,c,a,n,r0){const R=sr(seed+((t*24)|0));x.save();x.strokeStyle=c;x.globalAlpha=a;x.lineCap='round';for(let i=0;i<(n||46);i++){const b=R()*TAU,r1=(r0||380)+R()*220,r2=1500;x.lineWidth=1+R()*5;x.beginPath();x.moveTo(cx+Math.cos(b)*r1,cy+Math.sin(b)*r1);x.lineTo(cx+Math.cos(b)*r2,cy+Math.sin(b)*r2);x.stroke()}x.restore()}
 function sparks(x,seed,t,px,py,n,sp,c,life,g0){const R=sr(seed);x.save();x.globalCompositeOperation='lighter';x.lineCap='round';for(let i=0;i<n;i++){const a=R()*TAU,v=sp*(.35+R()),l=(life||.6)*(.6+R()*.6),lw=2+R()*2.4,k=t/l;if(k<0||k>=1)continue;const X=px+Math.cos(a)*v*t,Y=py+Math.sin(a)*v*t+(g0||900)*t*t*.5;x.globalAlpha=1-k;x.strokeStyle=c;x.lineWidth=lw;x.beginPath();x.moveTo(X,Y);x.lineTo(X-Math.cos(a)*v*.03,Y-Math.sin(a)*v*.03);x.stroke()}x.restore()}
 // floating points that drift on a loop; identical for any time asked
 function motes(x,seed,t,n,X0,Y0,W0,H0,c,sz,vy,al,mode){const R=sr(seed);x.save();x.globalCompositeOperation=mode||'lighter';for(let i=0;i<n;i++){const px=R(),py=R(),ph=R()*TAU,s=sz*(.5+R()),d=.5+R();const y=((py+t*vy*d/H0)%1+1)%1,X=X0+(px+Math.sin(t*.4*d+ph)*.012)*W0,Y=Y0+y*H0,A=Math.sin(y*3.14)*(.5+.5*Math.sin(t*1.7+ph));x.globalAlpha=(al==null?1:al)*Math.max(0,A);x.drawImage(glowOf(c),X-s,Y-s,s*2,s*2)}x.restore()}
 // a crow, wings keyed to phase
 function crow(x,px,py,s,ph,a,c){x.save();x.translate(px,py);x.rotate(a||0);x.scale(s,s);const w=Math.sin(ph)*.9;x.fillStyle=c||'#0a0614';x.beginPath();x.ellipse(0,0,26,10,0,0,TAU);x.fill();x.beginPath();x.moveTo(24,-3);x.lineTo(44,0);x.lineTo(24,5);x.closePath();x.fill();x.beginPath();x.moveTo(-26,-3);x.lineTo(-52,-8);x.lineTo(-48,0);x.lineTo(-54,6);x.lineTo(-24,6);x.closePath();x.fill();for(const q of[-1,1]){x.beginPath();x.moveTo(-10,q*-2);x.quadraticCurveTo(-4,q*(-30)*w-q*6,-22,q*(-62)*w);x.quadraticCurveTo(10,q*(-40)*w,16,q*-2);x.closePath();x.fill()}x.restore()}
 // layered offscreen canvases, reused every frame for actors (rim light, grading, silhouettes)
 const LY=[];function layer(i,w,h){let c=LY[i];if(!c||c.width<w||c.height<h){c=LY[i]=mk(w,h)}return c}
 function actor(x,px,py,paint,o){o=o||{};const k=M?M.k:1,W=Math.ceil((o.w||1000)*k),H=Math.ceil((o.h||1100)*k),bx=o.bx==null?.5:o.bx,by=o.by==null?.92:o.by,c=layer(0,W,H),y=c.getContext('2d');
  y.setTransform(1,0,0,1,0,0);y.globalCompositeOperation='source-over';y.globalAlpha=1;y.filter='none';y.clearRect(0,0,c.width,c.height);y.setTransform(k,0,0,k,W*bx,H*by);const o0=window.g;
  try{paint(y)}catch(e){if(!actor.e){actor.e=1;console.error('MOVIE1 actor',e)}}
  y.setTransform(1,0,0,1,0,0);y.globalAlpha=1;
  if(o.grade){y.globalCompositeOperation='source-atop';y.fillStyle=o.grade[0];y.globalAlpha=o.grade[1];y.fillRect(0,0,W,H);y.globalAlpha=1}
  if(o.side){y.globalCompositeOperation='source-atop';const q0=o.side[0]<0,G=y.createLinearGradient(W*(q0?.22:.78),0,W*(q0?.6:.4),0);G.addColorStop(0,'rgba(8,4,24,'+o.side[1]+')');G.addColorStop(1,'rgba(8,4,24,0)');y.fillStyle=G;y.fillRect(0,0,W,H)}
  if(o.sil!=null&&o.sil>0){y.globalCompositeOperation='source-atop';y.fillStyle=o.silC||'#05030c';y.globalAlpha=o.sil;y.fillRect(0,0,W,H);y.globalAlpha=1}
  for(const rm of[o.rim,o.rim2]){if(!rm)continue;const r=layer(1,W,H),q=r.getContext('2d');q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='copy';q.drawImage(c,0,0);q.globalCompositeOperation='source-in';q.fillStyle=rm[0];q.fillRect(0,0,W,H);q.globalCompositeOperation='destination-out';q.drawImage(c,(rm[2]==null?-7:rm[2])*k,(rm[3]==null?-3:rm[3])*k);y.globalCompositeOperation='lighter';y.globalAlpha=rm[1];y.drawImage(r,0,0);y.globalAlpha=1}
  y.globalCompositeOperation='source-over';
  x.save();x.globalAlpha=o.a==null?1:o.a;if(o.blur&&M&&!M.lowq)x.filter='blur('+(o.blur*k)+'px)';x.drawImage(c,0,0,W,H,px-W/k*bx,py-H/k*by,W/k,H/k);x.restore()}
 // the camera: [[u,cx,cy,zoom,roll],...] over the shot's 0..1, eased
 function camAt(keys,u){if(keys.length==1)return keys[0];let i=1;while(i<keys.length-1&&u>keys[i][0])i++;const a=keys[i-1],b=keys[i],k=ez((u-a[0])/((b[0]-a[0])||1));return[u,lerp(a[1],b[1],k),lerp(a[2],b[2],k),lerp(a[3],b[3],k),lerp(a[4]||0,b[4]||0,k)]}
 function view(x,C,par,fn){const p=par==null?1:par,Z=1+(C[3]-1)*p;x.save();x.translate(V_W/2,V_H/2);if(C[4])x.rotate(C[4]*p);x.scale(Z,Z);x.translate(-V_W/2-(C[1]-V_W/2)*p,-V_H/2-(C[2]-V_H/2)*p);fn(x);x.restore()}
 function shake(t,amp,seed){if(!amp||reduce())return[0,0];const a=Math.sin(t*93+(seed||0))*amp,b=Math.sin(t*71+1.7+(seed||0))*amp;return[a,b]}
 const FONT0="'Cormorant Garamond',Georgia,serif",FONT1="Montserrat,system-ui,sans-serif";
 function subtitle(x,txt,a,who){if(a<=0||!txt)return;x.save();x.globalAlpha=a;x.textAlign='center';x.textBaseline='alphabetic';x.font='600 37px '+FONT1;x.lineJoin='round';const y=V_H-88;if(who){x.font='600 22px '+FONT1;x.fillStyle='rgba(216,200,255,.92)';x.strokeStyle='rgba(6,3,14,.9)';x.lineWidth=6;x.strokeText(who.toUpperCase(),V_W/2,y-46);x.fillText(who.toUpperCase(),V_W/2,y-46);x.font='600 37px '+FONT1}x.strokeStyle='rgba(6,3,14,.92)';x.lineWidth=8;x.strokeText(txt,V_W/2,y);x.fillStyle='#fbf7ff';x.fillText(txt,V_W/2,y);x.restore()}
 // ---------- one frame, from the movie's time alone
 function grain(){if(grain.c)return grain.c;const c=mk(256,256),x=c.getContext('2d'),d=x.createImageData(256,256),R=sr(99);for(let i=0;i<d.data.length;i+=4){const v=R()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=22}x.putImageData(d,0,0);return grain.c=c}
 function vignette(){if(vignette.c)return vignette.c;const c=mk(480,270),x=c.getContext('2d'),G=x.createRadialGradient(240,135,70,240,135,290);G.addColorStop(0,'rgba(4,2,12,0)');G.addColorStop(.7,'rgba(4,2,12,.14)');G.addColorStop(1,'rgba(4,2,12,.58)');x.fillStyle=G;x.fillRect(0,0,480,270);return vignette.c=c}
 function shotAt(m,T){let i=m.at.length-1;while(i>0&&T<m.at[i])i--;return i}
 function drawShot(m,x,i,T){const s=m.shots[i],t=T-m.at[i],u=cl(t/s.d,0,1),C=s.cam?camAt(s.cam,u):[0,V_W/2,V_H/2,1,0],ctx={t,u,d:s.d,T,C:C.slice(),k:m.k,m};if(s.shk){const q=s.shk(t,u);if(q){const[a,b]=shake(t,q,i);ctx.C[1]+=a;ctx.C[2]+=b}}x.save();try{s.draw(x,ctx)}catch(e){if(!drawShot.e){drawShot.e=1;console.error('MOVIE1 shot '+i,e)}}x.restore()}
 function frame(m,T){const x=m.x,i=shotAt(m,T),s=m.shots[i],t=T-m.at[i];x.setTransform(m.k,0,0,m.k,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.filter='none';x.fillStyle='#000';x.fillRect(0,0,V_W,V_H);
  drawShot(m,x,i,T);
  // a dissolve is the previous shot held a moment longer and laid over this one
  if(s.tr=='dis'&&i>0&&t<(s.trd||.9)){const b=m.buf,y=b.getContext('2d'),k0=t/(s.trd||.9);y.setTransform(m.k,0,0,m.k,0,0);y.fillStyle='#000';y.fillRect(0,0,V_W,V_H);const z0=m.x;m.x=y;drawShot(m,y,i-1,m.at[i-1]+m.shots[i-1].d+t);m.x=z0;x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=1-ez(k0);x.drawImage(b,0,0);x.restore()}
  // flashes and fades at the seams
  const rd=reduce()?.28:1;if(s.tr=='flash'&&t<.55)rect(x,'#ffffff',(1-t/.55)*rd);if(s.tr=='vflash'&&t<.45)rect(x,'#c9a8ff',(1-t/.45)*rd);if(s.tr=='bflash'&&t<.3)rect(x,'#000',(1-t/.3));if(s.tr=='black'&&t<(s.trd||.8))rect(x,'#000',1-ez(t/(s.trd||.8)));
  const te=s.d-t;if(s.out=='black'&&te<(s.outd||.8))rect(x,'#000',ez(1-te/(s.outd||.8)));if(s.out=='flash'&&te<.3)rect(x,'#fff',ez(1-te/.3)*rd);
  // film finish
  x.save();x.setTransform(m.k,0,0,m.k,0,0);x.drawImage(vignette(),0,0,V_W,V_H);if(!m.lowq){x.globalAlpha=.5;x.globalCompositeOperation='overlay';const G=grain(),ox=(T*53)%256|0,oy=(T*97)%256|0;x.translate(-ox,-oy);x.fillStyle=x.createPattern(G,'repeat');x.fillRect(0,0,V_W+256,V_H+256)}x.restore();
  x.setTransform(m.k,0,0,m.k,0,0);x.fillStyle='#000';const bar=m.bar==null?54:m.bar;if(!s.nobar){x.fillRect(0,0,V_W,bar);x.fillRect(0,V_H-bar,V_W,bar)}
  // subtitles
  for(const L of m.lines){const a=T-L.at;if(a<0||a>L.d)continue;const f=Math.min(1,a/.18)*Math.min(1,(L.d-a)/.3);subtitle(x,L.text.replace(/\{name\}/g,nameOf()),f,L.who)}
 }
 // ---------- starting, running, ending
 function has(k){return !!REG[k]}
 function musicDown(m){try{const q=bgm&&bgm.m&&bgm.m.gain;if(q){m.g0=q.value;m.gq=q;q.setTargetAtTime(0,bgm.m.context.currentTime,.25)}}catch(_){}}
 function musicUp(m){try{if(m.gq)m.gq.setTargetAtTime(m.g0,bgm.m.context.currentTime,.5)}catch(_){}}
 const volM=()=>{try{return mute?0:cl(OPT.mv==null?1:+OPT.mv,0,1)}catch(_){return 1}},volV=()=>{try{return mute?0:cl(OPT.sv==null?1:+OPT.sv,0,1)}catch(_){return 1}};
 function prepare(def,o){const W=Math.min(1920,Math.round(innerWidth*Math.min(1.5,devicePixelRatio||1))),H=Math.round(W*9/16),c=mk(W,H);c.id='movie1';c.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:contain;z-index:2147482500;background:#000;cursor:none';
  const m={def,o:o||{},c,x:c.getContext('2d',{alpha:false}),k:W/V_W,buf:mk(W,H),shots:def.shots,lines:[],at:[],dur:0,T:0,paused:false,lowq:!!(o&&o.lowq),seen:{},wrap:null,voices:{},mv:1};
  let a=0;for(const s of m.shots){m.at.push(a);a+=s.d}m.dur=a;
  const gd=(()=>{try{return AC6.info(null,'me',true).gd|0}catch(_){return 0}})();m.gd=gd;for(const L of def.lines){const q=Object.assign({},L);m.lines.push(q)}
  m.ctx=def.setup?def.setup(m):{};return m}
 function bindKeys(m){window.RB_KEYGATE=e=>{if(!M||e.type!='keydown'||e.repeat)return;const k=e.key;if(M.ask){if(k=='Enter'||k=='y'||k=='Y'){finish('skip')}else if(k=='Escape'||k=='n'||k=='N'){askClose()}return}if(k=='Escape'){askOpen()}};
  m.onVis=()=>{if(!M)return;if(document.hidden){M.hid=true;pauseAudio(M)}else if(M.hid){M.hid=false;if(!M.ask)resumeAudio(M)}};document.addEventListener('visibilitychange',m.onVis);
  m.onBlur=()=>{if(!M)return;M.hid=true;pauseAudio(M)};m.onFocus=()=>{if(!M||document.hidden||!M.hid)return;M.hid=false;if(!M.ask)resumeAudio(M)};addEventListener('blur',m.onBlur);addEventListener('focus',m.onFocus)}
 function pauseAudio(m){try{m.score&&m.score.pause()}catch(_){}for(const id in m.voices){try{m.voices[id].pause()}catch(_){}}}
 function resumeAudio(m){try{if(m.score&&!m.done)m.score.play().catch(()=>{})}catch(_){}for(const id in m.voices){const a=m.voices[id];try{if(a.__on&&!a.ended)a.play().catch(()=>{})}catch(_){}}}
 function askOpen(){const m=M;if(!m||m.ask)return;m.ask=mkAsk();pauseAudio(m)}
 function askClose(){const m=M;if(!m||!m.ask)return;try{m.ask.remove()}catch(_){}m.ask=null;resumeAudio(m);m.tLast=performance.now()}
 function mkAsk(){const d=document.createElement('div');d.id='movie1ask';d.setAttribute('role','dialog');const ev=M.def.kind=='evo';d.innerHTML='<div class="p"><b>'+(ev?'Skip the evolution scene?':'Skip this story?')+'</b><p>'+(M.o.first?'You still receive your evolution, and you can watch '+(ev?'it':'this story')+' again any time from the Classes screen.':'You can watch it again any time.')+'</p><button data-a="y">Skip</button><button data-a="n">Keep watching</button></div>';d.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;if(b.dataset.a=='y')finish('skip');else askClose()});document.body.appendChild(d);return d}
 function hint(m){const d=document.createElement('button');d.id='movie1skip';d.textContent='Esc to skip';d.addEventListener('click',askOpen);document.body.appendChild(d);m.skipEl=d}
 function play(k,o){if(M||!REG[k])return false;if(!o||!o.rec){try{if(typeof INTRO60!='undefined'&&INTRO60.playing)return false;if(typeof CINE7!='undefined'&&CINE7.playing)return false}catch(_){}}
  const m=prepare(REG[k],o);M=m;m.cover=!!window.RB_COVER;window.RB_COVER=true;document.body.appendChild(m.c);try{for(const q in K)K[q]=0}catch(_){}
  if(!m.o.rec){bindKeys(m);musicDown(m);hint(m);m.c.addEventListener('click',()=>{const a=m.skipEl;if(a){a.classList.add('on');clearTimeout(m.ht);m.ht=setTimeout(()=>a.classList.remove('on'),2200)}})
   if(m.def.score){const a=new Audio(m.def.score);a.preload='auto';a.volume=volM();m.score=a;a.addEventListener('error',()=>{m.score=null});a.addEventListener('playing',()=>{if(!m.scoreStarted&&m.T>.1){try{a.currentTime=m.T}catch(_){}}m.scoreStarted=true});m.pending=a.play();if(m.pending&&m.pending.catch)m.pending.catch(e=>{if(!e||e.name!='AbortError')m.score=null})}
   m.tLast=performance.now();m.raf=requestAnimationFrame(tick)}
  return true}
 function voiceFor(m,L){if(!L.file)return null;const f=typeof L.file=='function'?L.file(m.gd):L.file;if(!f)return null;let a=m.voices[L.id];if(!a){a=new Audio(f);a.preload='auto';m.voices[L.id]=a}return a}
 function tick(now){const m=M;if(!m||m.done)return;if(m.ask||m.hid){m.tLast=now;m.raf=requestAnimationFrame(tick);return}let dt=(now-m.tLast)/1000;m.tLast=now;if(dt>.25)dt=.25;let T=m.T+dt;
  if(m.score&&m.scoreStarted&&!m.score.ended){if(m.score.paused){try{m.score.play().catch(()=>{})}catch(_){}}else{const aT=m.score.currentTime;if(Math.abs(aT-T)>.1)T=aT;else T+=(aT-T)*.05}}
  if(T>=m.dur){m.T=m.dur;finish('end');return}
  // reached moments
  for(const L of m.lines){if(L.file&&!L.on&&T>=L.at&&T<L.at+L.d){L.on=1;const a=voiceFor(m,L);if(a){a.__on=1;a.currentTime=0;a.volume=volV();a.play().catch(()=>{})}}}
  if(m.def.reveal!=null&&!m.seen.rv&&T>=m.def.reveal){m.seen.rv=1;report(m,'reveal')}
  m.T=T;frame(m,T);m.raf=requestAnimationFrame(tick)}
 function report(m,ev){try{m.o.on&&m.o.on(ev,m.def.id)}catch(e){console.error('MOVIE1 report',e)}}
 function release(m){cancelAnimationFrame(m.raf);try{m.c.remove()}catch(_){}try{m.ask&&m.ask.remove()}catch(_){}try{m.skipEl&&m.skipEl.remove()}catch(_){}window.RB_KEYGATE=null;if(m.onVis)document.removeEventListener('visibilitychange',m.onVis);if(m.onBlur){removeEventListener('blur',m.onBlur);removeEventListener('focus',m.onFocus)}pauseAudio(m);for(const id in m.voices){try{m.voices[id].removeAttribute('src');m.voices[id].load()}catch(_){}}try{if(m.score){m.score.removeAttribute('src');m.score.load()}}catch(_){}if(m.def.teardown)try{m.def.teardown(m)}catch(_){}m.buf.width=m.buf.height=1;m.c.width=m.c.height=1;LY.length=0}
 function finish(why){const m=M;if(!m||m.done)return;m.done=true;if(!m.o.rec)musicUp(m);release(m);M=null;window.RB_COVER=m.cover;try{for(const q in K)K[q]=0;mdL=mdR=false}catch(_){}try{if(!m.seen.rv)report(m,'reveal')}catch(_){}report(m,why);try{iT=Math.max(typeof iT=='number'?iT:0,1.2)}catch(_){}}
 function register(k,def){REG[k]=def}
 return{register,has,play,finish,ask:askOpen,get on(){return !!M},get state(){return M?{T:M.T,dur:M.dur,id:M.def.id,paused:!!M.ask}:null},REG,
  // filming and testing: draw exactly the frame at time T
  seek(T){if(!M)return false;M.T=T;frame(M,T);return true},canvas(){return M&&M.c},
  kit:{TAU,V_W,V_H,cl,lerp,ez,eo,ei,sr,mk,glow,glowOf,rect,crescent,speedLines,sparks,motes,crow,actor,camAt,view,shake,reduce,nameOf}}})()}catch(e){console.error('MOVIE1',e)}
