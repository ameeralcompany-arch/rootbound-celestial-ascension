// ===== HERO12: your character shines. On the home screen the portrait stands in an anime aura: flame tongues and slow light rays behind,
// a glow that hugs the silhouette, a light sweep across the figure, rising sparkles and an eye glint now and then. The first time the home
// screen opens after launch it plays a hero reveal (~4.6 s, click to skip): the screen darkens, speed lines rush in, the aura erupts with a
// flash and a shockwave, the eyes glint, your name slams in, and a deep voice line is spoken (Web Speech with the deepest voice found, low
// pitch, plus a soft sub-bass rumble; subtitles always show). Click the portrait for another line. In worlds your character gets a soft
// glow and a few twinkles. Colours follow your level tier. Every sprite is drawn once; the silhouette glow is a quarter-size blurred copy.
// Reduced motion: no shake, zoom or speed lines (the aura stays). =====
const HERO12=(()=>{
 const R=Math.random,TAU=Math.PI*2;
 const cl=(v,a,b)=>v<a?a:v>b?b:v,eo=x=>1-Math.pow(1-cl(x,0,1),3),bo=x=>{x=cl(x,0,1)-1;return 1+2.7*x*x*x+1.7*x*x};
 const red=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c};
 // [light, main, deep, core] by level tier
 function pal(){const l=typeof lvl=='number'?lvl:1;return l>=100?['#ffe9a8','#ffb43a','#ff5a1a','#fff8e0']:l>=50?['#eadcff','#b07aff','#5a2cff','#ffffff']:l>=20?['#d0f6ff','#5ad1ff','#2a6bff','#ffffff']:['#dcfff2','#5ff0c0','#14a07e','#ffffff']}
 // ---- sprites (per palette)
 const SP={};const sp=(k,w,h,f)=>SP[k]||(SP[k]=(()=>{const c=mk(w,h);f(c.getContext('2d'),w,h);return c})());
 const glow=c=>sp('g'+c,256,256,(x,w)=>{const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,c);g.addColorStop(.35,c+'88');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,0,w,w)});
 const flame=p=>sp('f'+p[1],64,160,x=>{const g=x.createLinearGradient(0,160,0,0);g.addColorStop(0,p[3]);g.addColorStop(.25,p[0]);g.addColorStop(.6,p[1]+'cc');g.addColorStop(1,p[2]+'00');x.fillStyle=g;
  x.beginPath();x.moveTo(32,158);x.bezierCurveTo(2,140,4,96,20,70);x.bezierCurveTo(28,52,26,24,34,0);x.bezierCurveTo(44,30,62,64,58,104);x.bezierCurveTo(56,136,46,152,32,158);x.fill();
  x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(32,128,9,26,0,0,TAU);x.fill()});
 const rays=p=>sp('r'+p[1],512,512,x=>{x.translate(256,256);for(let i=0;i<14;i++){x.rotate(TAU/14);const g=x.createLinearGradient(0,0,0,-256);g.addColorStop(0,p[0]+'cc');g.addColorStop(1,p[1]+'00');x.fillStyle=g;x.beginPath();x.moveTo(-6,0);x.lineTo(-22-(i%3)*8,-256);x.lineTo(22+(i%3)*8,-256);x.lineTo(6,0);x.fill()}});
 const star=c=>sp('s'+c,64,64,x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.18,c+'cc');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,0,64,64);
  x.fillStyle='#fff';x.beginPath();for(let i=0;i<8;i++){const r=i%2?2.6:30,a=i*Math.PI/4;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r)}x.closePath();x.fill()});
 const streak=c=>sp('k'+c,512,24,x=>{const g=x.createLinearGradient(0,0,512,0);g.addColorStop(0,c+'00');g.addColorStop(.5,'#ffffff');g.addColorStop(1,c+'00');x.fillStyle=g;x.fillRect(0,10,512,4);x.globalAlpha=.4;x.fillRect(0,6,512,12)});
 const band=()=>sp('band',256,256,x=>{const g=x.createLinearGradient(0,0,256,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,256,256)});
 // ---- voice: the deepest voice available, low pitch, a little slower; subtitles always show
 const LINES=['The roots remember me. Now... I rise.','No matter how far I fall, I always rise again.','This power... was always mine.','Watch closely. This is my ascension.','The sky is not my limit. It is my home.','Stand back. I am just getting started.'];
 let li=-1,sub='',subT=0;
 function voice(){try{const v=speechSynthesis.getVoices();if(!v||!v.length)return null;const en=v.filter(x=>/^en/i.test(x.lang)),pool=en.length?en:v;
  return pool.find(x=>/David|Guy|Mark|George|Ryan|Daniel|Fred|Christopher|Eric|Roger|Brian|Male/i.test(x.name))||pool[0]}catch(_){return null}}
 try{speechSynthesis.getVoices();speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',()=>{})}catch(_){}
 function rumble(){try{snd(46,2.4,'sine',.16,.8);snd(92,1.6,'sine',.05,.7)}catch(_){}}
 function speak(line){li=(li+1+(R()*(LINES.length-1)|0))%LINES.length;line=line||LINES[li];sub=line;subT=performance.now();
  const vol=Math.min(1,typeof OPT!='undefined'&&OPT.sv!=null?+OPT.sv:1);if(!(vol>0))return line;rumble();
  try{if(!('speechSynthesis' in window))return line;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(line),v=voice();if(v)u.voice=v;u.pitch=.2;u.rate=.8;u.volume=vol;speechSynthesis.speak(u)}catch(_){}return line}
 // ---- home portrait
 const S={rv:0,skip:0,pulse:-9,glint:-9,nextGlint:3,parts:[],last:0,done:false};
 // full-screen overlay for the reveal: dark veil, speed lines rushing to the face, the white flash at the eruption; removed when done
 let VC=null;
 function veil(r,rm,fx,fy){if(r>=1.5||S.skip){if(VC){VC.remove();VC=null}return}if(!VC){VC=mk(innerWidth,innerHeight);VC.id='h12veil';VC.setAttribute('aria-hidden','true');VC.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000';document.body.appendChild(VC)}
  if(VC.width!=innerWidth||VC.height!=innerHeight){VC.width=innerWidth;VC.height=innerHeight}const x=VC.getContext('2d'),W=VC.width,H=VC.height;x.clearRect(0,0,W,H);
  const dk=r<.45?.9:.9*(1-eo((r-.45)/.9));if(dk>0){x.fillStyle='rgba(6,4,16,'+dk+')';x.fillRect(0,0,W,H)}
  if(!rm&&r<1.3){const a=r<.25?r/.25:1-(r-.25)/1.05,D=Math.hypot(W,H);x.strokeStyle='rgba(255,255,255,'+(.6*a)+')';x.lineWidth=2;x.beginPath();
   for(let i=0;i<80;i++){const an=R()*TAU,r0=D*(.18+R()*.22),r1=D;x.moveTo(fx+Math.cos(an)*r0,fy+Math.sin(an)*r0);x.lineTo(fx+Math.cos(an)*r1,fy+Math.sin(an)*r1)}x.stroke()}
  if(r>.42&&r<.75){x.fillStyle='rgba(255,255,255,'+((1-(r-.42)/.33)*.9)+')';x.fillRect(0,0,W,H)}}
 let OC=null,SC=null;
 const H0=()=>performance.now()/1000;
 function geo(W,H,o){const s=H/760*(o.zoom||1),ox=o.ox==null?W*.5:o.ox,ty=H-800*s+(o.dy||0);return{s,ox,X:lx=>ox-310*s+lx*s,Y:ly=>ty+ly*s}}
 function drawHome(orig,g,W,H,o){const now=H0(),rm=red(),p=pal(),t=o.t||now;let r=S.rv?now-S.rv:99;if(S.skip)r=Math.max(r,4.6);const rev=r<4.6;
  // camera push + shake during the reveal
  o=Object.assign({},o);if(rev&&!rm){o.zoom=(o.zoom||1)*(1+.2*(1-eo(r/1.7)));const sh=(r>.42&&r<.85)||(r>1.9&&r<2.15)?1:0;if(sh){o.ox=(o.ox==null?W*.5:o.ox)+(R()-.5)*16*H/760;o.dy=(o.dy||0)+(R()-.5)*12*H/760}}
  const G=geo(W,H,o),s=G.s,cx=G.ox,cy=G.Y(470);
  // aura strength: erupts at 0.45 s, overshoots, settles; clicking the portrait pulses it
  let k=rev?(r<.45?0:r<.95?bo((r-.45)/.5)*1.45:1.45-.45*eo((r-.95)/.7)):1;k+=Math.max(0,1-(now-S.pulse)/.8)*.6;
  g.save();
  if(rev)try{const b=g.canvas.getBoundingClientRect();veil(r,rm,b.left+cx*b.width/W,b.top+G.Y(240)*b.height/H)}catch(_){}
  // additive light on the dark theme; on the light theme the flames are painted in colour so they still read on a pale page
  const dark=document.documentElement.dataset.theme=='dark';g.globalCompositeOperation=dark?'lighter':'source-over';
  if(k>0){const rs=Math.min(W,H)*1.25*Math.min(1.3,k);g.globalAlpha=.22*Math.min(1,k);g.translate(cx,G.Y(300));g.rotate(rm?0:t*.12);g.drawImage(rays(p),-rs/2,-rs/2,rs,rs);g.setTransform(1,0,0,1,0,0);
   const gs=760*s*Math.min(1.4,k);g.globalAlpha=.5*Math.min(1,k);g.drawImage(glow(p[1]),cx-gs/2,cy-gs*.62,gs,gs*1.15);
   // flame tongues around the figure, licking upward
   const N=16,fl=flame(p);for(let i=0;i<N;i++){const a=Math.PI*.5+(i/(N-1)-.5)*Math.PI*1.7,ex=cx+Math.cos(a)*250*s,ey=G.Y(560)+Math.sin(a)*330*s,wob=rm?0:Math.sin(t*7+i*1.9),
     h=(170+70*Math.sin(t*5.3+i*2.3))*s*k,w=h*.42,lean=Math.cos(a)*.35+wob*.08;g.globalAlpha=(dark?.55:.42)+.25*Math.sin(t*9+i);g.setTransform(Math.cos(lean),Math.sin(lean),-Math.sin(lean),Math.cos(lean),ex,ey);g.drawImage(fl,-w/2,-h,w,h)}
   g.setTransform(1,0,0,1,0,0)}
  // shockwave + flash at the eruption
  if(rev&&r>.42&&r<1.1){const u=(r-.42)/.68;g.globalAlpha=(1-u)*.9;g.strokeStyle=dark?p[0]:p[1];g.lineWidth=(14-u*10)*s*2;g.beginPath();g.ellipse(cx,cy,u*W*.7,u*W*.42,0,0,TAU);g.stroke()}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';g.restore();
  // the figure, drawn offscreen so the glow can hug it and the light sweep stays on it
  if(!OC||OC.width!=W||OC.height!=H){OC=mk(W,H);SC=mk(W/4,H/4)}const ox=OC.getContext('2d');ox.setTransform(1,0,0,1,0,0);ox.globalCompositeOperation='source-over';ox.globalAlpha=1;ox.clearRect(0,0,W,H);orig.call(this,ox,W,H,o);
  const sx=SC.getContext('2d');sx.globalCompositeOperation='source-over';sx.clearRect(0,0,SC.width,SC.height);sx.filter='blur('+Math.max(2,H/260|0)+'px)';sx.drawImage(OC,0,0,SC.width,SC.height);sx.filter='none';
  sx.globalCompositeOperation='source-in';sx.fillStyle=p[1];sx.fillRect(0,0,SC.width,SC.height);
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,.55+.25*Math.sin(t*3))*Math.min(1,.3+k*.7);g.drawImage(SC,-W*.01,-H*.01,W*1.02,H*1.02);g.drawImage(SC,0,0,W,H);g.restore();
  // light sweep across the figure every ~4 s, and a soft top light in the aura colour
  const sw=((t*.26)%1.25)-.15;ox.globalCompositeOperation='source-atop';if(sw>0&&sw<1){ox.globalAlpha=.45;ox.setTransform(1,0,.55,1,0,0);ox.drawImage(band(),W*(sw*1.4-.4)-H*.55*.5,0,W*.18,H)}
  ox.setTransform(1,0,0,1,0,0);ox.globalAlpha=.1;ox.fillStyle=p[0];ox.fillRect(0,0,W,H*.6);ox.globalAlpha=1;ox.globalCompositeOperation='source-over';
  g.drawImage(OC,0,0);
  // rising sparkles + eye glint
  const dt=Math.min(.1,Math.max(0,now-(S.last||now)));S.last=now;
  if(!rm&&S.parts.length<28&&R()<.5*Math.min(1.5,k))S.parts.push({x:cx+(R()-.5)*520*s,y:G.Y(820),vy:-(60+R()*90)*s,l:0,L:1.6+R(),z:.25+R()*.5,ph:R()*6});
  g.save();g.globalCompositeOperation='lighter';for(let i=S.parts.length-1;i>=0;i--){const q=S.parts[i];q.l+=dt;q.y+=q.vy*dt;if(q.l>=q.L){S.parts.splice(i,1);continue}const a=Math.sin(q.l/q.L*Math.PI)*(.6+.4*Math.sin(now*9+q.ph)),z=q.z*64*s;g.globalAlpha=a;g.drawImage(star(p[1]),q.x-z/2,q.y-z/2,z,z)}
  if(rev&&!S.gl1&&r>1.15){S.gl1=1;S.glint=now}if(!rev&&now>S.nextGlint+(S.glint>0?S.glint:0)){S.glint=now;S.nextGlint=5+R()*4}
  const ga=now-S.glint;if(ga>=0&&ga<.55){const e=Math.sin(ga/.55*Math.PI),by=Math.sin(t*1.5)*3,z=110*s*e;for(const ex of [276,344]){const X=G.X(ex),Y=G.Y(240+by);g.globalAlpha=e;g.drawImage(star(p[0]),X-z/2,Y-z/2,z,z);g.globalAlpha=e*.8;g.drawImage(streak(p[1]),X-260*s*e,Y-6*s,520*s*e,12*s)}}
  g.restore();
  // name slam + subtitle
  if(rev&&r>1.9){const u=cl((r-1.9)/.18,0,1),a=r>4?1-(r-4)/.6:1,sc=1+(1-u)*.8,nm=String(typeof myName!='undefined'&&myName?myName:'Hero'),tier=(typeof npName=='function'?npName(npTier(lvl)):'Wanderer').toUpperCase();
   g.save();g.globalAlpha=cl(a,0,1)*u;g.translate(W*.5,H*.82);g.scale(sc,sc);g.textAlign='center';g.font='italic 700 '+(H*.085|0)+"px 'Cormorant Garamond',Georgia,serif";g.lineWidth=H*.008;g.strokeStyle='rgba(10,6,24,.85)';g.strokeText(nm,0,0);
   g.fillStyle='#fff';g.fillText(nm,0,0);g.font='600 '+(H*.024|0)+'px Montserrat,system-ui,sans-serif';g.fillStyle=p[0];g.fillText(tier.split('').join(' '),0,H*.045);g.restore()}
  if(sub&&now*1000-subT<4200){const a=cl(Math.min((now*1000-subT)/250,(4200-(now*1000-subT))/400),0,1);g.save();g.globalAlpha=a;g.textAlign='center';g.font='italic 500 '+(H*.032|0)+"px 'Cormorant Garamond',Georgia,serif";
   g.lineWidth=H*.006;g.strokeStyle='rgba(8,4,20,.8)';const y=H*(rev&&r>1.9?.93:.92);g.strokeText('“'+sub+'”',W*.5,y);g.fillStyle='#fff';g.fillText('“'+sub+'”',W*.5,y);g.restore()}
  if(S.rv&&!rev&&!S.done){S.done=true;try{document.getElementById('show').classList.remove('h12rev')}catch(_){}}}
 {const _d=SHOWART.draw;SHOWART.draw=function(g,W,H,o){if(g&&g.canvas&&g.canvas.id=='showCv'){try{return drawHome.call(this,_d,g,W,H,o||{})}catch(e){if(!drawHome.e){drawHome.e=1;console.error('HERO12',e)}}}return _d.apply(this,arguments)}}
 // the reveal: once per launch, the first time the home screen opens; click to skip
 let revealed=false;
 function reveal(){if(revealed)return;revealed=true;S.rv=H0();S.skip=0;S.gl1=0;S.done=false;const el=document.getElementById('show');if(el){el.classList.add('h12rev');el.addEventListener('pointerdown',()=>{if(S.rv&&H0()-S.rv<4.6)S.skip=1},{once:true})}
  const at=(ms,f)=>setTimeout(()=>{if(!S.skip)try{f()}catch(_){}},ms);
  at(420,()=>{try{noise(1,900,.5);snd(52,1.3,'sine',.3,.45);snd(104,.8,'triangle',.06,.5)}catch(_){}});
  at(1250,()=>speak());at(1900,()=>{try{snd(70,.7,'triangle',.22,.4);noise(.35,2200,.25)}catch(_){}});
  setTimeout(()=>{try{document.getElementById('show').classList.remove('h12rev')}catch(_){}},2400)}
 {const _o=SHOW7.open;SHOW7.open=function(){const r=_o.apply(this,arguments);try{reveal();const c=document.getElementById('showCv');if(c&&!c._h12){c._h12=1;c.addEventListener('click',()=>{if(S.rv&&H0()-S.rv<4.6&&!S.skip)return;if(H0()-S.pulse<3)return;S.pulse=H0();speak();try{noise(.5,700,.3)}catch(_){}})}}catch(e){console.error('HERO12 open',e)}return r}}
 {const st=document.createElement('style');st.textContent='#show.h12rev header,#show.h12rev .info,#show.h12rev .idx{opacity:0;transform:translateX(24px)}#show header,#show .info,#show .idx{transition:opacity .6s ease,transform .6s ease}#showCv{cursor:pointer}';document.head.appendChild(st)}
 // ---- in worlds: a soft glow behind your character and a few twinkles (3-4 sprite stamps a frame)
 const TW=[];
 {const _dc=drawChar;drawChar=function(x,y){const me=arguments[arguments.length-1]==='me';if(me)try{const p=pal(),t=H0(),a=.28+.08*Math.sin(t*2.4),z=130;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glow(p[1]),x-z/2,y+24-z/2,z,z);
   if(!red()&&TW.length<5&&Math.random()<.04)TW.push({dx:(Math.random()-.5)*40,dy:Math.random()*50,t:0});for(let i=TW.length-1;i>=0;i--){const q=TW[i];q.t+=1/60;if(q.t>.7){TW.splice(i,1);continue}const e=Math.sin(q.t/.7*Math.PI),s=18*e;g.globalAlpha=e*.9;g.drawImage(star(p[0]),x+q.dx-s/2,y+q.dy-q.t*14-s/2,s,s)}
   g.restore()}catch(_){}return _dc.apply(this,arguments)}}
 return{speak,reveal,LINES,S,pal,get sub(){return sub}}})();
