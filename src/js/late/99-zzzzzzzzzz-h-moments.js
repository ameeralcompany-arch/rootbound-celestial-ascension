// ===== MOMENT1: the story's cinematic moments (docs/story-proposal.md, stage 5). Drawn on a canvas over the live game; they never take the controls away and cost nothing
// when none is playing (the canvas and its loop exist only while one runs).
//   Waking (4.5 s), the first time you stand in a world after speaking its word: a ripple of light and its name, remembered.
//   Restored (7 s), the first time you stand in a world after its guardian rests: the picture is grey, then a wave of colour spreads out from you, lights rise in the
//     realm's colour, its name and "Restored", and a rising chord.
//   The ending (about 32 s), the first time you come home to the Plaza after the last page of the Journal: letterbox, the festival under it, Lavi's last words in her
//     own voice (st_end_a, b, the message, d), and a closing card. The Journal's last page can play it again. Reduce motion keeps the words and drops the waves.
// State: RB_PREFIX+'rbmoment' {wake:{sg:1}, rest:{sg:1}, end:1}. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbmoment';
 let S={wake:{},rest:{},end:0};try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY())||'{}'))}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const REALM=['THE FIRST WORLD','INFERNO','GALAXY','ABYSSAL SEA','CRYSTAL REALM'];
 const reduce=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const cl=(v,a,b)=>v<a?a:v>b?b:v,ez=v=>{v=cl(v,0,1);return v*v*(3-2*v)},eo=v=>1-Math.pow(1-cl(v,0,1),3);
 let M=null;
 function chord(notes,gap,type){try{notes.forEach((f,i)=>setTimeout(()=>snd(f,1.6,type||'sine',.045),i*gap))}catch(_){}}
 function start(kind,o){if(M)return false;const c=document.createElement('canvas');c.id='moment1';c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:2147482300;pointer-events:none';
  c.width=Math.round(innerWidth*Math.min(1.5,devicePixelRatio||1));c.height=Math.round(innerHeight*Math.min(1.5,devicePixelRatio||1));document.body.appendChild(c);
  M={kind,o:o||{},c,x:c.getContext('2d'),t0:performance.now(),dur:kind=='rest'?7:kind=='wake'?4.6:32.5,said:{},red:reduce()};
  if(kind=='rest')chord([392,494,587,784,988],140,'triangle');if(kind=='wake')chord([523,659,784],120,'sine');
  M.raf=requestAnimationFrame(frame);return true}
 function stop(){if(!M)return;cancelAnimationFrame(M.raf);try{M.c.remove()}catch(_){}const k=M.kind;M=null;if(k=='end')try{RPG.guide.say('st_end_d')}catch(_){}}
 // where the player is on screen, for the waves to start from
 const pScreen=()=>{try{const s=M.c.width/innerWidth;const r=document.getElementById('c').getBoundingClientRect();return{x:((P.x+P.w/2-cam.x)*ZM*(r.width/document.getElementById('c').width)+r.left)*s,y:((P.y+P.h/2-cam.y)*ZM*(r.height/document.getElementById('c').height)+r.top)*s}}catch(_){return{x:M.c.width/2,y:M.c.height*.6}}};
 function title(x,W,H,a,big,small,col){if(a<=0)return;x.save();x.globalAlpha=a;x.textAlign='center';x.fillStyle='#fff8ea';x.shadowColor=col||'rgba(255,220,160,.8)';x.shadowBlur=24*W/1920;
  x.font='700 '+Math.round(64*W/1920)+"px 'Cormorant Garamond',Georgia,serif";const sp=(.42-.12*a);x.letterSpacing=sp+'em';x.fillText(big,W/2,H*.62);x.shadowBlur=0;
  if(small){x.font='italic 500 '+Math.round(30*W/1920)+"px 'Cormorant Garamond',Georgia,serif";x.letterSpacing='0em';x.fillStyle='#f3e6cf';x.fillText(small,W/2,H*.62+46*W/1920)}x.restore()}
 function frame(now){const m=M;if(!m)return;const t=(now-m.t0)/1000,x=m.x,W=m.c.width,H=m.c.height;x.clearRect(0,0,W,H);
  if(t>=m.dur){stop();return}
  const col=(window.RESTORE1&&RESTORE1.COL[m.o.sg])||'#ffe2a8';
  if(m.kind=='rest'){
   // grey, then a wave of colour from the player: the game's picture drawn grey outside a growing circle
   if(!m.red){const src=document.getElementById('c'),p=pScreen(),R=Math.hypot(W,H)*eo((t-.9)/3.4),fade=1-ez((t-4.6)/1.2);
    if(fade>0){x.save();x.globalAlpha=fade;x.filter='grayscale(1) brightness(.8)';x.beginPath();x.rect(0,0,W,H);x.arc(p.x,p.y,R,0,Math.PI*2,true);x.clip('evenodd');x.drawImage(src,0,0,W,H);x.restore();x.filter='none'}
    if(t>.9&&t<4.6){x.save();x.globalCompositeOperation='lighter';x.strokeStyle=col;x.globalAlpha=.55*(1-ez((t-.9)/3.7));x.lineWidth=10*W/1920;x.beginPath();x.arc(p.x,p.y,R,0,Math.PI*2);x.stroke();x.restore()}
    x.save();x.globalCompositeOperation='lighter';for(let i=0;i<60;i++){const a=Math.abs(Math.sin(i*12.9898)*43758.5453)%1,b=Math.abs(Math.sin(i*78.233)*1234.5)%1,k=cl((t-1-b*1.5)/4,0,1);if(k<=0||k>=1)continue;
     const px=a*W,py=H*(1.05-k*.9)-b*H*.1,r=(3+b*4)*W/1920,al=Math.sin(Math.PI*k);const g2=x.createRadialGradient(px,py,0,px,py,r*4);g2.addColorStop(0,col);g2.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=al*.8;x.fillStyle=g2;x.fillRect(px-r*4,py-r*4,r*8,r*8)}x.restore()}
   title(x,W,H,ez((t-1.6)/.8)*(1-ez((t-5.8)/1)),REALM[m.o.sg]||'THIS WORLD','Restored',col)}
  else if(m.kind=='wake'){
   if(!m.red){const p=pScreen();x.save();x.globalCompositeOperation='lighter';for(let r=0;r<3;r++){const k=cl((t-r*.35)/2.2,0,1);if(k<=0||k>=1)continue;x.strokeStyle=col;x.globalAlpha=.5*(1-k);x.lineWidth=6*W/1920;x.beginPath();x.arc(p.x,p.y,Math.hypot(W,H)*.6*eo(k),0,Math.PI*2);x.stroke()}x.restore()}
   title(x,W,H,ez((t-.6)/.7)*(1-ez((t-3.6)/.9)),REALM[m.o.sg]||'THIS WORLD','remembers its name',col)}
  else if(m.kind=='end'){
   const bar=H*.11*ez(t/1.2)*(1-ez((t-31.2)/1.2));x.fillStyle='#000';x.fillRect(0,0,W,bar);x.fillRect(0,H-bar,W,bar);
   const v=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(4,2,12,'+(.55*ez(t/2))+')');x.fillStyle=v;x.fillRect(0,0,W,H);
   // Lavi's last words, one after another, in her own voice (lengths from her recordings)
   const L=window.LAVIVOICE||{},seq=[['st_end_a',1.5],['st_end_b',0],['st_end',0]];let at=1.5;
   for(const[id]of seq){const d=(L[id]&&L[id].dur)||5;if(t>=at&&!m.said[id]){m.said[id]=1;try{RPG.guide.say(id)}catch(_){}}at+=d+1.2}
   const fin=at+.6;title(x,W,H,ez((t-fin)/1.2)*(1-ez((t-31.4)/1)),'THE WORLDS WE LEFT BEHIND','Thank you for remembering.','rgba(255,214,160,.9)');
   if(t>fin+3.5&&!m.red){x.save();x.globalCompositeOperation='lighter';for(let i=0;i<50;i++){const a=Math.abs(Math.sin(i*91.7)*4375.85)%1,b=Math.abs(Math.sin(i*17.3)*9123.4)%1,k=((t-fin-3.5)*.12+b)%1;
     const px=a*W,py=H*(1-k),r=(2+b*3)*W/1920;x.globalAlpha=.7*Math.sin(Math.PI*k);x.fillStyle=(window.RESTORE1?RESTORE1.COL[i%5]:'#ffe2a8');x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill()}x.restore()}
   if(fin+8<m.dur)m.dur=Math.min(m.dur,fin+8)}
  m.raf=requestAnimationFrame(frame)}
 // when to play them: on arriving in a world in its new state, once; the ending on coming home to the Plaza after the last Journal page
 const calm=()=>{try{if(typeof INTRO60!='undefined'&&INTRO60.playing)return false;if(typeof CINE7!='undefined'&&CINE7.playing)return false;if(window.DG&&(DG.run||(DG.cine&&DG.cine.on)))return false;if(typeof WBOSS13!='undefined'&&WBOSS13.fight)return false;if(typeof entered!='undefined'&&!entered)return false;return true}catch(_){return false}};
 let lastW='',settle=0;
 setInterval(()=>{if(M||!calm())return;const c=typeof cur!='undefined'?cur:'';if(c!==lastW){lastW=c;settle=performance.now()+3200;return}if(performance.now()<settle)return;
  try{if(c=='plaza'){if(!S.end&&STORY1.got.includes('end')){S.end=1;save();start('end')}return}const h=window.RESTORE1&&RESTORE1.here();if(!h)return;
   if(h.st==2&&!S.rest[h.sg]){S.rest[h.sg]=1;S.wake[h.sg]=1;save();start('rest',{sg:h.sg})}else if(h.st==1&&!S.wake[h.sg]){S.wake[h.sg]=1;save();start('wake',{sg:h.sg})}}catch(_){}},700);
 // the Journal's last page can play the ending again
 try{const pg=STORY1.PAGES.find(p=>p.id=='end');if(pg)pg.replay=()=>start('end')}catch(_){}
 window.MOMENT1={start,stop,get on(){return !!M},get kind(){return M&&M.kind},get S(){return S},reset(){S={wake:{},rest:{},end:0};save()}};
})()}catch(e){console.error('MOMENT1',e)}
