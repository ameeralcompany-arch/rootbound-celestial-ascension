// ===== AVF10: avatar frames and portrait backgrounds. Click your portrait (top left) to choose. 14 frames, from Classic to the dark Shadow
// Veil and the bubbly Bubblegum, and 11 backgrounds; new ones unlock as you level up (a little reward on the way). The frame is drawn once
// to a small canvas around the portrait and only redrawn when you change it; a few frames turn slowly (a CSS transform on that canvas:
// compositor-only, no repaint, and still when reduced motion is on). The background is painted by the portrait itself (80-ui.js asks
// AVF10.bg). State: RB_PREFIX + 'rbframe' {f, bg, seen}. =====
const AVF10=(()=>{
 const TAU=Math.PI*2,K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbframe';
 const S={f:'classic',bg:'theme',seen:{}};try{const o=JSON.parse(localStorage.getItem(K())||'null');if(o&&typeof o=='object'){if(typeof o.f=='string')S.f=o.f;if(typeof o.bg=='string')S.bg=o.bg;if(o.seen&&typeof o.seen=='object')S.seen=o.seen}}catch(_){}
 const save=()=>{try{localStorage.setItem(K(),JSON.stringify(S))}catch(_){}};
 // ---- frames: id, name, level to unlock, spins?; art drawn around a portrait of radius 32 in a 96x96 box (centre 48,48)
 const FR=[['classic','Classic',1],['bubble','Bubblegum',3,1],['sakura','Sakura',5],['frost','Frost Crown',8],['neon','Neon Pulse',10,1],['ocean','Ocean Pearl',12],
  ['inferno','Inferno',15],['kitty','Kitty',18],['galaxy','Galaxy Orbit',22,1],['crystal','Crystal Prism',26],['shadow','Shadow Veil',30,1],['dragon','Dragon Horns',35],['celestial','Celestial Halo',40,1],['royal','Royal Laurel',50]];
 const BG=[['theme','Default',1,null],['sunrise','Sunrise',2,['#fff3d6','#ffc6a8','#f59a8c']],['mint','Mint',4,['#f0fff7','#bff0d8','#7fd4b0']],['sakura','Sakura',6,['#fff4f8','#ffd0e2','#f3a2c4']],
  ['ocean','Ocean',9,['#e6fbff','#9fdcf2','#3f9fd0']],['candy','Candy',11,['#fff0fb','#e8d0ff','#b8e4ff']],['twilight','Twilight',14,['#ffd9b0','#c99ad8','#5a4a9a']],['ember','Ember',17,['#ffe2b0','#ff9a5a','#a83a2a']],
  ['night','Starry night',20,['#3a4a8a','#1c2450','#0a0e24']],['aurora','Aurora',25,['#c8fff0','#5ad0c8','#2a3a7a']],['void','Void',30,['#4a2a7a','#1a0e33','#05030c']]];
 const lv=()=>lvl|0,ok=a=>lv()>=a[2];
 const fr=id=>FR.find(f=>f[0]==id)||FR[0],bgOf=id=>BG.find(b=>b[0]==id)||BG[0];
 if(!ok(fr(S.f)))S.f='classic';if(!ok(bgOf(S.bg)))S.bg='theme';
 // ---- art
 const C=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 function ring(x,r,w,a,b,edge){const g=x.createLinearGradient(48-r,48-r,48+r,48+r);g.addColorStop(0,a);g.addColorStop(1,b);x.lineWidth=w;x.strokeStyle=g;x.beginPath();x.arc(48,48,r,0,TAU);x.stroke();if(edge){x.lineWidth=1;x.strokeStyle=edge;x.beginPath();x.arc(48,48,r+w/2,0,TAU);x.stroke();x.beginPath();x.arc(48,48,r-w/2,0,TAU);x.stroke()}}
 const glow=(x,cx,cy,r,c)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2)};
 const at=(a,r)=>[48+Math.cos(a)*r,48+Math.sin(a)*r];
 function star(x,cx,cy,r1,r2,n,c){x.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,r=i%2?r2:r1;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.fillStyle=c;x.fill()}
 function bubble(x,cx,cy,r){const g=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.5,'rgba(220,240,255,.35)');g.addColorStop(1,'rgba(255,160,220,.6)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,TAU);x.fill();x.lineWidth=.8;x.strokeStyle='rgba(150,120,190,.7)';x.stroke()}
 const ART={
  classic(x){ring(x,35,4,'#ffffff','#9aa2ae','rgba(60,66,80,.5)')},
  bubble(x){ring(x,35,5,'#ffd0ea','#a8e8ff','rgba(200,120,180,.6)');for(let i=0;i<9;i++){const a=i/9*TAU+.3,[px,py]=at(a,38+(i%2)*3);bubble(x,px,py,2.5+(i%3)*1.4)}
   x.save();x.translate(48,86);for(const s of[-1,1]){x.beginPath();x.moveTo(0,0);x.bezierCurveTo(s*6,-6,s*12,-2,s*10,4);x.bezierCurveTo(s*8,8,s*3,4,0,0);x.fillStyle='#7ae8ff';x.fill();x.strokeStyle='#3a8aa8';x.lineWidth=.8;x.stroke()}x.beginPath();x.arc(0,1,2.4,0,TAU);x.fillStyle='#bff6ff';x.fill();x.restore()},
  sakura(x){ring(x,35,4,'#ffe0ec','#e88ab0','rgba(160,60,100,.5)');x.strokeStyle='#6a4030';x.lineWidth=2;x.beginPath();x.moveTo(10,70);x.quadraticCurveTo(14,52,26,44);x.stroke();
   for(const[px,py,s]of[[12,64,1],[20,50,1.2],[28,44,.9],[80,22,1],[70,14,.8],[84,36,.9]]){x.save();x.translate(px,py);for(let i=0;i<5;i++){x.rotate(TAU/5);x.beginPath();x.ellipse(0,-3*s,1.8*s,3*s,0,0,TAU);x.fillStyle=i%2?'#ffc0d6':'#ffd8e6';x.fill()}x.beginPath();x.arc(0,0,1.2*s,0,TAU);x.fillStyle='#ffeaa0';x.fill();x.restore()}},
  frost(x){ring(x,35,4,'#f4fbff','#8ad0f0','rgba(60,120,160,.5)');for(const[a,l]of[[-1.57,14],[-1.95,9],[-1.19,9],[-2.3,6],[-.84,6]]){const[bx,by]=at(a,36),[tx,ty]=at(a,36+l),n=[-Math.sin(a)*2.6,Math.cos(a)*2.6];
   const g=x.createLinearGradient(bx,by,tx,ty);g.addColorStop(0,'#7ad0f0');g.addColorStop(1,'#ffffff');x.beginPath();x.moveTo(bx+n[0],by+n[1]);x.lineTo(tx,ty);x.lineTo(bx-n[0],by-n[1]);x.closePath();x.fillStyle=g;x.fill();x.strokeStyle='rgba(60,120,160,.6)';x.lineWidth=.7;x.stroke()}},
  neon(x){glow(x,48,48,46,'rgba(40,220,255,.25)');x.lineCap='round';for(const[r,c,w,o]of[[37,'#24e0ff',3,0],[32.5,'#ff4fd8',2,1.2]]){x.strokeStyle=c;x.lineWidth=w;for(let i=0;i<6;i++){x.beginPath();x.arc(48,48,r,o+i*TAU/6,o+i*TAU/6+.8);x.stroke()}}},
  ocean(x){ring(x,35,4,'#bff0ff','#2a8ac0','rgba(20,80,120,.5)');x.fillStyle='#4ac8ff';x.beginPath();x.moveTo(14,74);for(let px=14;px<=82;px+=4)x.lineTo(px,74+Math.sin(px*.4)*3);x.lineTo(82,86);x.lineTo(14,86);x.closePath();x.globalAlpha=.85;x.fill();x.globalAlpha=1;
   for(let i=0;i<7;i++){const[px,py]=at(-Math.PI*.15-i*.38,37);const g=x.createRadialGradient(px-1,py-1,.3,px,py,2.6);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8e4ee');x.fillStyle=g;x.beginPath();x.arc(px,py,2.4,0,TAU);x.fill()}},
  inferno(x){for(let i=0;i<14;i++){const a=i/14*TAU,[bx,by]=at(a,35),[tx,ty]=at(a,44+(i%3)*3),n=[-Math.sin(a)*3,Math.cos(a)*3];const g=x.createLinearGradient(bx,by,tx,ty);g.addColorStop(0,'#ff5a1a');g.addColorStop(1,'rgba(255,220,90,0)');x.beginPath();x.moveTo(bx+n[0],by+n[1]);x.quadraticCurveTo(tx+n[0],ty+n[1],tx,ty);x.quadraticCurveTo(tx-n[0],ty-n[1],bx-n[0],by-n[1]);x.closePath();x.fillStyle=g;x.fill()}ring(x,35,4,'#ffd27a','#c8321a','rgba(90,20,10,.6)')},
  kitty(x){ring(x,35,4,'#fff4ea','#f2b48a','rgba(140,80,50,.5)');for(const s of[-1,1]){x.beginPath();x.moveTo(48+s*12,20);x.lineTo(48+s*26,4);x.lineTo(48+s*28,26);x.closePath();x.fillStyle='#f2b48a';x.fill();x.strokeStyle='rgba(120,70,40,.7)';x.lineWidth=1;x.stroke();x.beginPath();x.moveTo(48+s*16,20);x.lineTo(48+s*24,10);x.lineTo(48+s*25,22);x.closePath();x.fillStyle='#ffc8d8';x.fill()}
   x.strokeStyle='rgba(90,60,40,.6)';x.lineWidth=1;for(const s of[-1,1])for(const dy of[-2,2]){x.beginPath();x.moveTo(48+s*38,54+dy);x.lineTo(48+s*47,52+dy*2);x.stroke()}},
  galaxy(x){glow(x,48,48,46,'rgba(160,110,255,.3)');ring(x,35,4,'#6a4ad8','#1a1040','rgba(200,170,255,.5)');x.strokeStyle='rgba(220,200,255,.7)';x.lineWidth=1.2;x.beginPath();x.ellipse(48,48,45,14,-.4,0,TAU);x.stroke();
   const[px,py]=[48+Math.cos(-.4)*42,48+Math.sin(-.4)*42+4];const g=x.createRadialGradient(px-1.5,py-1.5,.5,px,py,5);g.addColorStop(0,'#ffe0b0');g.addColorStop(1,'#d2704a');x.fillStyle=g;x.beginPath();x.arc(px,py,4.4,0,TAU);x.fill();
   for(let i=0;i<10;i++){const[sx,sy]=at(i*.63,30+(i%4)*5);star(x,sx,sy,1.8,.6,4,'#ffffff')}},
  crystal(x){ring(x,35,4,'#e8fdff','#9a7af0','rgba(90,60,160,.5)');for(let i=0;i<4;i++){const a=i*TAU/4-Math.PI/2,[cx,cy]=at(a,37);x.save();x.translate(cx,cy);x.rotate(a+Math.PI/2);x.beginPath();x.moveTo(0,-9);x.lineTo(5,-1);x.lineTo(0,6);x.lineTo(-5,-1);x.closePath();const g=x.createLinearGradient(-5,-9,5,6);g.addColorStop(0,'#ffffff');g.addColorStop(1,i%2?'#b48cff':'#7ae8ff');x.fillStyle=g;x.fill();x.strokeStyle='rgba(60,40,110,.7)';x.lineWidth=.8;x.stroke();x.restore()}},
  shadow(x){glow(x,48,48,47,'rgba(110,50,220,.35)');for(let i=0;i<16;i++){const a=i/16*TAU,[bx,by]=at(a,36),[tx,ty]=at(a+.06,43+(i%2)*4),n=[-Math.sin(a)*2.2,Math.cos(a)*2.2];x.beginPath();x.moveTo(bx+n[0],by+n[1]);x.lineTo(tx,ty);x.lineTo(bx-n[0],by-n[1]);x.closePath();x.fillStyle=i%2?'#1a0e2e':'#2c1a4a';x.fill()}
   ring(x,35,5,'#3a2460','#08050f','rgba(170,120,255,.7)');for(let i=0;i<3;i++){const[px,py]=at(-1.2+i*1.1,35);glow(x,px,py,4,'rgba(200,160,255,.9)')}},
  dragon(x){ring(x,35,5,'#a8323e','#3a0c12','rgba(242,193,78,.7)');x.strokeStyle='rgba(20,4,8,.5)';x.lineWidth=.7;for(let i=0;i<24;i++){const[px,py]=at(i/24*TAU,35);x.beginPath();x.arc(px,py,2.2,0,Math.PI);x.stroke()}
   for(const s of[-1,1]){x.beginPath();x.moveTo(48+s*14,20);x.bezierCurveTo(48+s*22,6,48+s*36,4,48+s*42,-2);x.bezierCurveTo(48+s*34,10,48+s*26,16,48+s*22,24);x.closePath();const g=x.createLinearGradient(48+s*14,24,48+s*42,-2);g.addColorStop(0,'#c8b890');g.addColorStop(1,'#fff6dc');x.fillStyle=g;x.fill();x.strokeStyle='rgba(60,40,20,.7)';x.lineWidth=1;x.stroke()}},
  celestial(x){glow(x,48,48,47,'rgba(255,230,150,.4)');for(let i=0;i<24;i++){const a=i/24*TAU,[bx,by]=at(a,37),[tx,ty]=at(a,i%2?43:47);x.strokeStyle='rgba(255,215,110,.85)';x.lineWidth=i%2?1:1.6;x.beginPath();x.moveTo(bx,by);x.lineTo(tx,ty);x.stroke()}
   ring(x,35,4,'#fff6c8','#d8a23a','rgba(140,100,30,.6)');x.strokeStyle='#ffd65a';x.lineWidth=2;x.beginPath();x.ellipse(48,6,14,3.4,0,0,TAU);x.stroke();for(const[px,py]of[[18,20],[80,24],[14,72],[84,70]])star(x,px,py,3,1,4,'#fffbe0')},
  royal(x){ring(x,35,4,'#fff0b0','#c8962a','rgba(120,80,20,.6)');for(const s of[-1,1])for(let i=0;i<7;i++){const a=Math.PI/2+s*(.35+i*.3),[px,py]=at(a,39);x.save();x.translate(px,py);x.rotate(a+s*1.3);x.beginPath();x.ellipse(0,0,2.4,5,0,0,TAU);x.fillStyle=i%2?'#e0b040':'#ffd65a';x.fill();x.restore()}
   x.beginPath();x.moveTo(34,14);x.lineTo(38,2);x.lineTo(43,10);x.lineTo(48,0);x.lineTo(53,10);x.lineTo(58,2);x.lineTo(62,14);x.closePath();x.fillStyle='#ffd65a';x.fill();x.strokeStyle='rgba(120,80,20,.8)';x.lineWidth=1;x.stroke();for(const px of[38,48,58]){x.beginPath();x.arc(px,px==48?1:3,1.6,0,TAU);x.fillStyle='#e0284a';x.fill()}}};
 const CA={};function art(id,s){const k=id+'|'+s;if(CA[k])return CA[k];const c=C(96*s,96*s),x=c.getContext('2d');x.scale(s,s);try{(ART[id]||ART.classic)(x)}catch(e){console.error('AVF10 art',e)}return CA[k]=c}
 // ---- the frame on the HUD portrait
 let cv=null,shown='';
 function mount(){const w=document.getElementById('pwrap9')||(document.getElementById('portrait')||{}).parentNode;if(!w)return false;if(cv&&cv.isConnected&&cv.parentNode===w)return true;
  cv=document.createElement('canvas');cv.id='pframe10';cv.setAttribute('aria-hidden','true');cv.width=cv.height=192;w.appendChild(cv);
  w.style.cursor='pointer';w.title='Avatar: frames and backgrounds';w.addEventListener('click',e=>{e.stopPropagation();open()});shown='';return true}
 function paint(){if(!mount())return;if(shown===S.f)return;shown=S.f;const x=cv.getContext('2d');x.clearRect(0,0,192,192);x.drawImage(art(S.f,2),0,0);cv.classList.toggle('spin',!!fr(S.f)[3]);
  try{const r=document.querySelector('#pwrap9 .ring');if(r)r.style.opacity=S.f=='classic'?'':'0'}catch(_){}}
 // ---- portrait background (80-ui.js calls this; false = keep the theme's own gradient)
 function bg(x,dk){const b=bgOf(S.bg);if(!b[3])return false;const g=x.createRadialGradient(64,44,6,64,64,72);g.addColorStop(0,b[3][0]);g.addColorStop(.6,b[3][1]);g.addColorStop(1,b[3][2]);x.fillStyle=g;x.fillRect(0,0,128,128);
  if(S.bg=='night'||S.bg=='void'||S.bg=='aurora'){x.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<14;i++){const sx=(i*37)%120+4,sy=(i*53)%70+4;x.fillRect(sx,sy,1.4,1.4)}}return true}
 const bgKey=()=>S.bg;
 // ---- the picker (clean, light dialog; opened by clicking the portrait)
 let el=null;
 function open(){if(!el){el=document.createElement('div');el.id='avf10';el.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-label="Avatar"><header><h3>Avatar</h3><button class="x" aria-label="Close">✕</button></header><p class="sub">Frames and backgrounds for your portrait. New ones unlock as you level up.</p><h4>Frames</h4><div class="g fr"></div><h4>Backgrounds</h4><div class="g bg"></div></div>';document.body.appendChild(el);
   el.addEventListener('mousedown',e=>{if(e.target===el)close()});el.querySelector('.x').onclick=close;addEventListener('keydown',e=>{if(el.classList.contains('on')&&e.key=='Escape'){e.stopPropagation();close()}},true)}
  render();el.style.display='flex';requestAnimationFrame(()=>el.classList.add('on'));try{UIS.play('open')}catch(_){}}
 function close(){if(!el)return;el.classList.remove('on');setTimeout(()=>{if(!el.classList.contains('on'))el.style.display='none'},180);try{UIS.play('close')}catch(_){}}
 function render(){const f=el.querySelector('.g.fr'),b=el.querySelector('.g.bg');
  f.innerHTML=FR.map(a=>'<button data-f="'+a[0]+'" class="'+(a[0]==S.f?'on':'')+(ok(a)?'':' lk')+'"'+(ok(a)?'':' disabled')+'><canvas width="96" height="96"></canvas><b>'+a[1]+'</b><small>'+(ok(a)?(S.seen['f_'+a[0]]||a[2]<=1?'':'NEW'):'Level '+a[2])+'</small></button>').join('');
  f.querySelectorAll('button').forEach(btn=>{const c=btn.querySelector('canvas').getContext('2d');c.drawImage(art(btn.dataset.f,1),0,0);btn.onclick=()=>{S.f=btn.dataset.f;S.seen['f_'+S.f]=1;save();paint();render();try{UIS.play('select')}catch(_){}}});
  b.innerHTML=BG.map(a=>'<button data-b="'+a[0]+'" class="'+(a[0]==S.bg?'on':'')+(ok(a)?'':' lk')+'"'+(ok(a)?'':' disabled')+' style="--bgc:'+(a[3]?'radial-gradient(circle at 50% 35%,'+a[3][0]+','+a[3][1]+' 60%,'+a[3][2]+')':'linear-gradient(180deg,#ffffff,#dde1e6)')+'"><b>'+a[1]+'</b><small>'+(ok(a)?'':'Level '+a[2])+'</small></button>').join('');
  b.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{S.bg=btn.dataset.b;S.seen['b_'+S.bg]=1;save();render();try{UIS.play('select')}catch(_){}});}
 // ---- unlock notices: a new frame or background on level up (part of "every step is rewarded")
 let lastLv=null;function tick(){paint();const L=lv();if(lastLv==null){lastLv=L;return}if(L>lastLv){for(const a of FR)if(a[2]>lastLv&&a[2]<=L)notify('New avatar frame: '+a[1]);for(const a of BG)if(a[2]>lastLv&&a[2]<=L)notify('New portrait background: '+a[1]);lastLv=L}}
 function notify(t){try{say(t+' (click your portrait)')}catch(_){}}
 setInterval(()=>{try{if(entered)tick()}catch(_){}},700);
 return{FR,BG,ART,state:S,bg,bgKey,open,close,paint,get frame(){return S.f},set frame(v){if(fr(v)[0]==v&&ok(fr(v))){S.f=v;save();paint()}},get bgId(){return S.bg}}})();
