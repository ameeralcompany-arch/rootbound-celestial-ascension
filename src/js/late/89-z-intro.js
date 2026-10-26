// ===== INTRO7: launch cinematic + the title card shown whenever you enter a world (new or returning) =====
// Both are skippable with any key or click, never block play (the world card lets you keep moving), and shrink to a quick fade with reduced motion.
const INTRO7=(()=>{
 const reduce=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let el=null,raf=0,playing=false,played=false;
 // ---- launch cinematic
 function play(done){const fin=()=>{try{done&&done()}catch(e){console.error(e)}};
  if(playing||played||(typeof OPT!='undefined'&&OPT.intro===0)){fin();return}played=playing=true;
  const root=document.createElement('div');root.id='intro7';root.setAttribute('role','presentation');root.innerHTML='<canvas></canvas><div class="skip">CLICK OR PRESS ANY KEY TO SKIP</div>';document.body.appendChild(root);root.style.display='block';
  const cv=root.querySelector('canvas'),g=cv.getContext('2d'),red=reduce(),D=Math.min(1.25,devicePixelRatio||1);let W=0,H=0,end=false,t0=performance.now(),last=0,img=null,sp=null,geo=null,tx=null,rot=0;
  const fit=()=>{W=cv.width=Math.max(320,innerWidth*D|0);H=cv.height=Math.max(240,innerHeight*D|0)};fit();
  const R=PLG7.rng(5),stars=[];for(let i=0;i<110;i++)stars.push({x:R(),y:R(),s:.5+R()*1.6,p:R()*6,l:R()});
  try{tx=PLG7.buildTex('plaza',0,false);geo=PLG7.geo(176,.28);sp=document.createElement('canvas');sp.width=sp.height=176;img=sp.getContext('2d').createImageData(176,176)}catch(_){}
  const T=red?1500:4600;let chime=0;
  const stop=()=>{if(end)return;end=true;cancelAnimationFrame(raf);root.style.opacity='0';removeEventListener('keydown',skip,true);setTimeout(()=>{root.remove();playing=false},520);fin()};
  const skip=e=>{if(e&&e.type=='keydown'){e.preventDefault();e.stopPropagation()}stop()};
  root.addEventListener('pointerdown',skip);addEventListener('keydown',skip,true);
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  function frame(now){if(end)return;raf=requestAnimationFrame(frame);if(now-last<(red?100:33))return;last=now;const t=now-t0;if(t>T){stop();return}const u=t/T;
   g.fillStyle='#04030b';g.fillRect(0,0,W,H);
   const gl=g.createRadialGradient(W*.5,H*.62,0,W*.5,H*.62,Math.max(W,H)*.7);gl.addColorStop(0,'rgba(90,70,170,'+(.35*ease(u*2.5))+')');gl.addColorStop(1,'rgba(4,3,11,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
   for(const s of stars){const tw=.5+.5*Math.sin(t/600*(.5+s.l)+s.p),zz=1+u*(.6+s.l*1.8),x=(s.x-.5)*W*zz+W/2,y=(s.y-.5)*H*zz+H/2;g.fillStyle='rgba(255,255,255,'+(ease(u*4)*(.25+.6*tw*s.l)).toFixed(2)+')';g.fillRect(x,y,s.s*D,s.s*D)}
   // planet rises from below the horizon
   const pu=ease((u-.12)/.5),R0=Math.min(W,H)*.2,px=W/2,py=H*(1.15-pu*.55);
   if(tx&&pu>0){rot=t/90000;PLG7.render(img,geo,tx,rot%1,(rot*1.4)%1,PLG7.THEMES.plaza,1,0);sp.getContext('2d').putImageData(img,0,0);
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=pu*.9;const hg=g.createRadialGradient(px,py,R0*.9,px,py,R0*1.9);hg.addColorStop(0,'rgba(255,225,150,.55)');hg.addColorStop(1,'rgba(255,225,150,0)');g.fillStyle=hg;g.beginPath();g.arc(px,py,R0*1.9,0,6.3);g.fill();g.restore();
    g.save();g.globalAlpha=pu;g.beginPath();g.arc(px,py,R0,0,6.3);g.clip();g.drawImage(sp,px-R0,py-R0,R0*2,R0*2);const sh=g.createRadialGradient(px-R0*.4,py-R0*.4,R0*.2,px,py,R0*1.1);sh.addColorStop(0,'rgba(255,255,255,.08)');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(4,2,16,.5)');g.fillStyle=sh;g.fillRect(px-R0,py-R0,R0*2,R0*2);g.restore()}
   // title
   const tu=ease((u-.42)/.3),fo=1-ease((u-.9)/.1),ls=(1.1-.55*tu),fs=Math.round(Math.min(W/9,H/6.5));
   if(tu>0){if(!chime){chime=1;try{PLN7.AU.discover()}catch(_){}}g.save();g.globalAlpha=tu*fo;g.textAlign='center';g.fillStyle='#fff';g.font='700 '+fs+'px '+(getComputedStyle(document.body).fontFamily||'sans-serif');try{g.letterSpacing=(fs*ls*.6)+'px'}catch(_){}
    g.fillText('ROOTBOUND',W/2+(fs*ls*.3),H*.3);g.font='500 '+Math.round(fs*.26)+'px '+(getComputedStyle(document.body).fontFamily||'sans-serif');try{g.letterSpacing=(fs*.12)+'px'}catch(_){}g.globalAlpha=ease((u-.55)/.25)*fo*.8;g.fillStyle='#d9d3ff';g.fillText('CELESTIAL ASCENSION',W/2+(fs*.06),H*.3+fs*.46);g.restore()}
   if(u>.9){g.fillStyle='rgba(255,255,255,'+(.4*Math.sin((u-.9)*10*Math.PI/1)).toFixed(2)+')';if(u<.97)g.fillRect(0,0,W,H)}}
  raf=requestAnimationFrame(frame)}
 // ---- world title card
 let card=null,tmr=0,lastN='',lastT=0;
 function world(n,info){if(!n)return;const now=Date.now();if(n==lastN&&now-lastT<8000)return;lastN=n;lastT=now;try{if(typeof creatorOn!='undefined'&&creatorOn)return}catch(_){}
  let inf=null;try{inf=PLN7.info(n)}catch(_){}if(!inf)return;
  if(!card){card=document.createElement('div');card.id='wcard7';card.setAttribute('aria-live','polite');card.innerHTML='<div class="tint"></div><div class="bar t"></div><div class="bar b"></div><div class="card"><div class="k"></div><h1></h1><div class="s"></div></div>';document.body.appendChild(card)}
  const c=inf.T.atm.join(',');card.querySelector('.tint').style.background='radial-gradient(ellipse at 50% 38%,rgba('+c+',.30),rgba('+c+',0) 62%),linear-gradient(180deg,rgba(4,3,11,.55),rgba(4,3,11,0) 35%)';
  card.querySelector('.k').textContent=info&&info.first?(n=='plaza'?'WELCOME TO ROOTBOUND':'NEW WORLD DISCOVERED'):'WELCOME BACK';card.querySelector('h1').textContent=inf.label;
  let sub=inf.T.name;if(info&&!info.first&&info.last){try{sub+=' · last visit '+new Date(info.last).toLocaleDateString([], {day:'numeric',month:'short'})}catch(_){}}card.querySelector('.s').textContent=sub;
  clearTimeout(tmr);card.style.display='block';void card.offsetWidth;card.classList.add('on');
  const off=()=>{card.classList.remove('on');removeEventListener('keydown',off,true);removeEventListener('pointerdown',off,true);setTimeout(()=>{if(!card.classList.contains('on'))card.style.display='none'},1100)};
  addEventListener('keydown',off,true);addEventListener('pointerdown',off,true);tmr=setTimeout(off,reduce()?1800:3600)}
 return{play,world,get playing(){return playing}}})();
