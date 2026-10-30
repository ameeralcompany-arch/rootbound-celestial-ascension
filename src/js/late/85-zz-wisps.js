// ===== BRK7: block-break effects. Free: soul wisps (the default), star sparkles, petals and classic (none). In the store (Effects, slot
// 'break', one equipped at a time): Bubble Pop, Heart Pop, Sakura Bloom, Snowfall, Fireflies, Butterflies, Gold Rush, Galaxy Swirl, Royal
// Ghosts and Shadow Phantoms (tools/breakfx-v10.json). Every shape is drawn once into a small sprite and stamped with drawImage (no per-frame
// gradients or paths), at most 70 alive. Picked in the store or in Hub > Settings > Break effect (free ones plus the ones you own).
// preview() draws the store card: a little grass block that breaks on a loop. =====
const BRK7=(()=>{
 const FREE=[['souls','Soul wisps'],['sparkle','Star sparkles'],['petals','Petals'],['classic','Classic (none)']];
 const SHOP={bubble:'Bubble Pop',heart:'Heart Pop',blossom:'Sakura Bloom',snow:'Snowfall',firefly:'Fireflies',butterfly:'Butterflies',coin:'Gold Rush',galaxy:'Galaxy Swirl',royal:'Royal Ghosts',phantom:'Shadow Phantoms'};
 const shopId=k=>'fx_brk_'+k;
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpbrk';let free='souls';try{free=localStorage.getItem(K())||'souls'}catch(_){}if(!FREE.some(f=>f[0]==free))free='souls';
 function skin(){try{const r=SHOP7.eqRef('break');if(r&&SHOP[r.slice(4)])return r.slice(4)}catch(_){}return free}
 const R=Math.random,L=[],MAX=70,pick=a=>a[(R()*a.length)|0];
 // ---- sprites (made on first use, then cached)
 const SP={};const sp=(key,w,h,f)=>{if(SP[key])return SP[key];const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));return SP[key]=c};
 const glow=c=>sp('g'+c,48,48,x=>{const g=x.createRadialGradient(24,24,1,24,24,24);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,48,48)});
 const dot=c=>sp('d'+c,12,12,x=>{x.fillStyle=c;x.beginPath();x.arc(6,6,3,0,6.3);x.fill()});
 const star=c=>sp('s'+c,24,24,x=>{x.translate(12,12);x.fillStyle=c;x.beginPath();for(let i=0;i<8;i++){const r=i%2?2.4:11,a=i*Math.PI/4;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill()});
 const heart=c=>sp('h'+c,40,40,x=>{const s=13;x.beginPath();x.moveTo(20,21+s*.85);x.bezierCurveTo(20-s*1.5,21-s*.15,20-s*.75,21-s*1.25,20,21-s*.4);x.bezierCurveTo(20+s*.75,21-s*1.25,20+s*1.5,21-s*.15,20,21+s*.85);x.closePath();
  x.fillStyle=c;x.fill();x.lineWidth=2;x.strokeStyle='rgba(120,20,60,.55)';x.stroke();x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(13.5,15,3.6,2.2,-.6,0,6.3);x.fill()});
 const flower=c=>sp('f'+c,40,40,x=>{x.translate(20,20);for(let i=0;i<5;i++){x.save();x.rotate(i*Math.PI*2/5);x.fillStyle=c;x.beginPath();x.ellipse(0,-9,6,9.5,0,0,6.3);x.fill();x.strokeStyle='rgba(200,80,130,.45)';x.lineWidth=1.2;x.stroke();
   x.globalCompositeOperation='destination-out';x.beginPath();x.arc(0,-19,2.6,0,6.3);x.fill();x.restore()}
  x.fillStyle='rgba(255,120,170,.55)';x.beginPath();x.arc(0,0,6,0,6.3);x.fill();x.fillStyle='#ffd96a';x.beginPath();x.arc(0,0,3.2,0,6.3);x.fill();
  x.fillStyle='#fff3b0';for(let i=0;i<5;i++){const a=i*1.2566+.6;x.beginPath();x.arc(Math.cos(a)*4.6,Math.sin(a)*4.6,1,0,6.3);x.fill()}});
 const petal=c=>sp('p'+c,20,20,x=>{x.translate(10,10);x.fillStyle=c;x.beginPath();x.ellipse(0,0,4.5,7.5,0,0,6.3);x.fill();x.globalCompositeOperation='destination-out';x.beginPath();x.arc(0,-8.5,2.2,0,6.3);x.fill()});
 const bubble=()=>sp('bub',36,36,x=>{x.fillStyle='rgba(160,225,255,.14)';x.strokeStyle='rgba(200,240,255,.95)';x.lineWidth=1.8;x.beginPath();x.arc(18,18,15,0,6.3);x.fill();x.stroke();
  x.strokeStyle='rgba(255,170,240,.5)';x.lineWidth=1.2;x.beginPath();x.arc(18,18,12.5,.4,1.6);x.stroke();x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.ellipse(12,11,4,2.4,-.7,0,6.3);x.fill();x.beginPath();x.arc(23,25,1.4,0,6.3);x.fill()});
 const ring=()=>sp('ring',40,40,x=>{x.strokeStyle='rgba(210,245,255,.95)';x.lineWidth=2;x.beginPath();x.arc(20,20,17,0,6.3);x.stroke();x.fillStyle='#fff';for(let i=0;i<6;i++){const a=i*1.047;x.beginPath();x.arc(20+Math.cos(a)*17,20+Math.sin(a)*17,1.6,0,6.3);x.fill()}});
 const flake=()=>sp('snow',36,36,x=>{x.translate(18,18);x.lineCap='round';for(const [w,c] of [[4.2,'rgba(150,200,255,.45)'],[2,'#ffffff']]){x.strokeStyle=c;x.lineWidth=w;
  for(let i=0;i<6;i++){x.save();x.rotate(i*Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-14);x.moveTo(0,-8);x.lineTo(-4,-12);x.moveTo(0,-8);x.lineTo(4,-12);x.stroke();x.restore()}}});
 // one butterfly wing pair (upper + lower), body edge at x=0; drawn mirrored for the other side
 const wing=c=>sp('w'+c,30,34,x=>{x.fillStyle=c;x.strokeStyle='rgba(30,20,50,.8)';x.lineWidth=1.6;x.beginPath();x.moveTo(1,16);x.bezierCurveTo(6,0,26,-2,28,8);x.bezierCurveTo(29,16,16,18,1,17);x.closePath();x.fill();x.stroke();
  x.beginPath();x.moveTo(1,18);x.bezierCurveTo(16,18,24,26,18,32);x.bezierCurveTo(12,35,4,28,1,19);x.closePath();x.fill();x.stroke();
  x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.arc(19,8,2.6,0,6.3);x.arc(12,25,2,0,6.3);x.fill();x.fillStyle='rgba(30,20,50,.35)';x.beginPath();x.arc(24,10,1.4,0,6.3);x.fill()});
 const coin=()=>sp('coin',32,32,x=>{const g=x.createLinearGradient(0,4,0,28);g.addColorStop(0,'#fff1a0');g.addColorStop(.5,'#ffc93a');g.addColorStop(1,'#d08a10');x.fillStyle=g;x.beginPath();x.arc(16,16,13,0,6.3);x.fill();x.strokeStyle='#9a5e00';x.lineWidth=2;x.stroke();
  x.strokeStyle='rgba(255,250,210,.8)';x.lineWidth=1.4;x.beginPath();x.arc(16,16,9.5,0,6.3);x.stroke();x.fillStyle='#fff6c8';x.beginPath();for(let i=0;i<10;i++){const r=i%2?3:7,a=-Math.PI/2+i*Math.PI/5;x.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r)}x.closePath();x.fill()});
 const planet=(a,b)=>sp('pl'+a+b,44,44,x=>{x.translate(22,22);x.rotate(-.35);x.strokeStyle=b;x.lineWidth=2.4;x.beginPath();x.ellipse(0,0,19,6,0,Math.PI,6.283);x.stroke();
  const g=x.createRadialGradient(-3,-4,1,0,0,10);g.addColorStop(0,'#ffffff');g.addColorStop(.35,a);g.addColorStop(1,'#1a1240');x.fillStyle=g;x.beginPath();x.arc(0,0,10,0,6.3);x.fill();x.beginPath();x.ellipse(0,0,19,6,0,0,Math.PI);x.stroke()});
 // ghosts: dome + scalloped hem (ragged for phantoms), eyes, blush, an optional crown; head centre at (32, GY) in a 64 px sprite
 const GH={souls:{fill:'rgba(245,250,255,.95)',eye:'#28325a',blush:'rgba(255,150,170,.6)'},royal:{fill:'rgba(240,228,255,.97)',rim:'rgba(170,120,255,.8)',eye:'#3a2266',blush:'rgba(255,140,190,.7)',crown:1},
  phantom:{fill:'rgba(22,12,36,.96)',rim:'rgba(150,80,255,.9)',eye:'#ff4a8a',rag:1}};
 const GY=k=>GH[k].crown?36:28;
 const ghost=k=>sp('gh'+k,64,64,x=>{const o=GH[k],cx=32,cy=GY(k),r=15,n=o.rag?4:3;x.beginPath();x.arc(cx,cy,r,Math.PI,0);x.lineTo(cx+r,cy+r*1.25);
  for(let s=0;s<n;s++){const x0=cx+r-s*2*r/n,x1=x0-2*r/n;x.quadraticCurveTo((x0+x1)/2,cy+r*(o.rag?(s%2?.55:1.05):.8),x1,cy+r*1.25)}x.closePath();x.fillStyle=o.fill;x.fill();if(o.rim){x.strokeStyle=o.rim;x.lineWidth=2;x.stroke()}
  x.fillStyle=o.eye;x.beginPath();if(o.rag){x.ellipse(cx-5.5,cy,2.6,1.5,.35,0,6.3);x.ellipse(cx+5.5,cy,2.6,1.5,-.35,0,6.3)}else{x.arc(cx-5.2,cy,2.1,0,6.3);x.arc(cx+5.2,cy,2.1,0,6.3)}x.fill();
  if(o.blush){x.fillStyle=o.blush;x.beginPath();x.arc(cx-9,cy+4.5,2.4,0,6.3);x.arc(cx+9,cy+4.5,2.4,0,6.3);x.fill()}
  if(o.crown){x.fillStyle='#ffd34a';x.strokeStyle='#a86a00';x.lineWidth=1.3;x.beginPath();x.moveTo(cx-9,cy-12);x.lineTo(cx-10,cy-22);x.lineTo(cx-5,cy-16);x.lineTo(cx,cy-25);x.lineTo(cx+5,cy-16);x.lineTo(cx+10,cy-22);x.lineTo(cx+9,cy-12);x.closePath();x.fill();x.stroke();
   x.fillStyle='#ff5a8a';x.beginPath();x.arc(cx,cy-15.5,1.8,0,6.3);x.fill()}});
 const cube=()=>sp('cube',32,32,x=>{x.fillStyle='#8a5a34';x.fillRect(0,0,32,32);x.fillStyle='#6e4626';for(let i=0;i<14;i++)x.fillRect((i*13)%30,10+(i*7)%20,3,3);x.fillStyle='#5cc04a';x.fillRect(0,0,32,9);
  x.fillStyle='#3e9a34';for(let i=0;i<8;i++)x.fillRect(i*4,8,2,2+(i%3));x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=2;x.strokeRect(1,1,30,30)});
 const lite=c=>'rgb('+c.map(v=>Math.min(255,(v|0)+80)).join(',')+')';
 // ---- particles
 const PAL={heart:['#ff5c8a','#ff8fb8','#ff3d6e','#e08cff'],blossom:['#ffb7d0','#ffd6e6','#ff9ec4'],butterfly:['#6ec8ff','#ff9ad5','#ffb347','#b48cff','#7dffb0'],galaxy:[['#9fd0ff','#ffe08a'],['#ff9ad5','#c9b8ff'],['#ffb36a','#ffffff']]};
 const add=(list,o)=>{if(list.length<MAX)list.push(Object.assign({t:0,vx:0,vy:0,ph:R()*6.3,tr:null,life:1.4,sz:1},o))};
 function burst(list,k,x,y,col){const j=s=>(R()-.5)*s,TT=typeof T=='number'?T:32;
  if(k=='souls')for(let i=0,n=2+(R()<.5);i<n;i++)add(list,{k,x:x+j(TT*.6),y:y+j(TT*.4),vx:j(80),vy:-50-R()*50,life:1.3+R()*.6,sz:.75+R()*.3,tr:[]});
  else if(k=='royal')for(let i=0;i<2;i++)add(list,{k,x:x+j(TT*.6),y:y+j(TT*.4),vx:j(90),vy:-70-R()*40,life:1.6+R()*.5,sz:1+R()*.2,tr:[]});
  else if(k=='phantom')for(let i=0;i<2;i++)add(list,{k,x,y,ox:x,oy:y,a:R()*6.3+i*Math.PI,life:1.8+R()*.4,sz:1.05+R()*.2,tr:[]});
  else if(k=='sparkle')for(let i=0;i<4;i++)add(list,{k,x:x+j(TT*.6),y:y+j(TT*.4),vx:j(80),vy:-50-R()*50,life:1.1+R()*.5,sz:.8+R()*.5,c:lite(col)});
  else if(k=='petals')for(let i=0;i<4;i++)add(list,{k,x:x+j(TT*.6),y:y+j(TT*.4),vx:j(80),vy:-50-R()*50,life:1.4+R()*.6,sz:.8+R()*.4,c:pick(PAL.blossom)});
  else if(k=='heart')for(let i=0,n=3+(R()<.5);i<n;i++)add(list,{k,x:x+j(TT*.7),y:y+j(TT*.3),vx:j(70),vy:-70-R()*50,life:1.3+R()*.5,sz:.55+R()*.35,c:pick(PAL.heart)});
  else if(k=='blossom'){for(let i=0;i<3;i++)add(list,{k,x:x+j(TT*.8),y:y+j(TT*.4),vx:j(70),vy:-80-R()*40,life:1.8+R()*.5,sz:.6+R()*.3,c:pick(PAL.blossom),spin:j(3)});
   for(let i=0;i<4;i++)add(list,{k:'petals',x:x+j(TT*.6),y:y+j(TT*.4),vx:j(90),vy:-60-R()*50,life:1.5+R()*.5,sz:.7+R()*.3,c:pick(PAL.blossom)})}
  else if(k=='bubble')for(let i=0;i<4;i++)add(list,{k,x:x+j(TT*.7),y:y+j(TT*.3),vx:j(40),vy:-30-R()*30,life:1.4+R()*.7,sz:.4+R()*.45});
  else if(k=='snow')for(let i=0;i<5;i++)add(list,{k,x:x+j(TT*.9),y:y+j(TT*.5),vx:j(70),vy:-60-R()*40,life:1.9+R()*.6,sz:.4+R()*.4,spin:j(2.5)});
  else if(k=='firefly')for(let i=0;i<4;i++)add(list,{k,x:x+j(TT*.6),y:y+j(TT*.4),vx:j(60),vy:-30-R()*40,life:2+R()*.8});
  else if(k=='butterfly')for(let i=0;i<2;i++)add(list,{k,x:x+j(TT*.5),y:y+j(TT*.3),vx:(i?1:-1)*(30+R()*30),vy:-60-R()*20,life:2.2+R()*.6,sz:.7+R()*.25,c:pick(PAL.butterfly)});
  else if(k=='coin')for(let i=0;i<3;i++)add(list,{k,x:x+j(TT*.5),y:y+j(TT*.3),vx:j(160),vy:-170-R()*70,life:1.5+R()*.3,sz:.5+R()*.15});
  else if(k=='galaxy'){const p=pick(PAL.galaxy);add(list,{k:'planet',x,y,ox:x,oy:y,a:R()*6.3,w:3.2,life:1.9,sz:.75,c:p});
   for(let i=0;i<5;i++)add(list,{k:'gstar',x,y,ox:x,oy:y,a:i*1.2566,w:3.6+R(),life:1.6+R()*.4,sz:.4+R()*.35,c:i%2?'#ffffff':p[1]})}}
 // tx,ty: where ghosts and coins fly to (the player); world: true for the real list (finished ghosts leave a little mote there)
 function tick(list,dt,tx,ty,world){const TT=typeof T=='number'?T:32;for(let i=list.length-1;i>=0;i--){const w=list[i];w.t+=dt;
   if(w.t>=w.life){if(world&&(w.k=='souls'||w.k=='royal'||w.k=='coin'||w.k=='phantom'))try{VFX.mote&&VFX.mote(w.x,w.y,w.k=='coin'?'#ffe27a':w.k=='phantom'?'#b07aff':'#cfe8ff')}catch(_){}list.splice(i,1);continue}
   const u=w.t/w.life,k=w.k;let mv=true;
   if(k=='souls'||k=='royal'||(k=='coin'&&u>.3)){const a=Math.max(0,(u-(k=='coin'?.3:.35))/.65);w.vx+=((tx-w.x)*2.2*a-w.vx*1.5+Math.sin(w.t*6+w.ph)*60*(1-a))*dt;w.vy+=((ty-w.y)*2.2*a-w.vy*1.2-30*(1-a))*dt}
   else if(k=='coin'){w.vy+=420*dt;w.vx*=1-1.5*dt}
   else if(k=='phantom'){if(u<.5){w.a+=dt*(5-u*4);const r=6+u*2*TT*1.1;w.x=w.ox+Math.cos(w.a)*r;w.y=w.oy-u*TT*1.6+Math.sin(w.a)*r*.5;mv=false}else{const a=(u-.5)/.5;w.vx+=((tx-w.x)*6*a-w.vx*2.5)*dt;w.vy+=((ty-w.y)*6*a-w.vy*2.5)*dt}}
   else if(k=='planet'||k=='gstar'){w.a+=w.w*dt;const r=6+Math.pow(u,.7)*TT*1.5;w.x=w.ox+Math.cos(w.a)*r;w.y=w.oy-u*TT*1.2+Math.sin(w.a)*r*.42;mv=false}
   else if(k=='sparkle')w.vy+=60*dt;
   else if(k=='petals'){w.vy+=(40-w.vy)*dt;w.vx+=Math.sin(w.t*5+w.ph)*90*dt}
   else if(k=='heart'){w.vy+=(-45-w.vy)*1.5*dt;w.vx+=(Math.sin(w.t*4+w.ph)*40-w.vx)*2*dt}
   else if(k=='blossom'){w.vy+=(22-w.vy)*1.3*dt;w.vx+=(Math.sin(w.t*2.4+w.ph)*35-w.vx)*1.5*dt}
   else if(k=='bubble'){w.vy+=(-55-w.vy)*1.2*dt;w.vx+=(Math.sin(w.t*3+w.ph)*30-w.vx)*2*dt}
   else if(k=='snow'){w.vy+=(26-w.vy)*1.4*dt;w.vx+=(Math.sin(w.t*1.8+w.ph)*28-w.vx)*1.2*dt}
   else if(k=='firefly'){w.vx+=((R()-.5)*700-w.vx*1.8)*dt;w.vy+=((R()-.5)*700-w.vy*1.8-25)*dt}
   else if(k=='butterfly'){w.vy+=(-28+Math.sin(w.t*3.2+w.ph)*70-w.vy)*2*dt;w.vx+=((w.vx<0?-1:1)*45-w.vx)*dt}
   if(mv){w.x+=w.vx*dt;w.y+=w.vy*dt}
   if(w.tr){w.tr.push(w.x,w.y);if(w.tr.length>14)w.tr.splice(0,2)}}}
 function stamp(g,img,x,y,s,rot,sx){const w=img.width*s,h=img.height*s;if(!rot&&sx==null){g.drawImage(img,x-w/2,y-h/2,w,h);return}g.save();g.translate(x,y);if(rot)g.rotate(rot);if(sx!=null)g.scale(sx,1);g.drawImage(img,-w/2,-h/2,w,h);g.restore()}
 const GLOW={souls:['rgba(220,240,255,.5)',.28],royal:['rgba(200,160,255,.55)',.32],phantom:['rgba(140,60,255,.5)',.34],coin:['rgba(255,220,90,.45)',.7],planet:['rgba(160,140,255,.45)',1.4],gstar:['rgba(255,255,255,.35)',.7]};
 const TRC={souls:'rgba(190,225,255,.5)',royal:'rgba(210,180,255,.5)',phantom:'rgba(120,50,220,.6)'};
 function draw(g,list,ox,oy){if(!list.length)return;g.save();
  g.globalCompositeOperation='lighter'; // pass 1: glows and trails
  for(const w of list){const u=w.t/w.life,al=Math.min(1,w.t*5)*(1-u*u*u),x=w.x-ox,y=w.y-oy,k=w.k,r=9*w.sz;
   if(k=='firefly'){g.globalAlpha=al*(.55+.45*Math.sin(w.t*8+w.ph));stamp(g,glow('rgba(215,255,120,.95)'),x,y,.55);continue}
   if(w.tr){const im=glow(TRC[k]),tr=w.tr;for(let j=0;j<tr.length;j+=2){const f=j/tr.length;g.globalAlpha=al*.5*f;stamp(g,im,tr[j]-ox,tr[j+1]-oy,r*.035*f+.02)}}
   const gl=GLOW[k];if(gl){g.globalAlpha=al;stamp(g,glow(gl[0]),x,y,k=='souls'||k=='royal'||k=='phantom'?r*gl[1]/2.4:gl[1]*w.sz)}}
  g.globalCompositeOperation='source-over'; // pass 2: the shapes
  for(const w of list){const u=w.t/w.life,al=Math.min(1,w.t*5)*(1-u*u*u),x=w.x-ox,y=w.y-oy,k=w.k;g.globalAlpha=al;
   if(k=='souls'||k=='royal'||k=='phantom'){const s=9*w.sz/15,b=Math.sin(w.t*8+w.ph)*.05,im=ghost(k);g.save();g.translate(x,y);g.scale(s*(1-b),s*(1+b));g.drawImage(im,-32,-GY(k));g.restore()}
   else if(k=='firefly')stamp(g,dot('#fbffd0'),x,y,.6);
   else if(k=='sparkle')stamp(g,star(w.c),x,y,.5*w.sz,w.t*3+w.ph);
   else if(k=='petals')stamp(g,petal(w.c),x,y,.9*w.sz,w.t*4+w.ph);
   else if(k=='heart'){const pop=u>.82?(u-.82)/.18:0;stamp(g,heart(w.c),x,y,w.sz*(1+pop*.6)*(1+Math.sin(w.t*9)*.06),Math.sin(w.t*3+w.ph)*.25)}
   else if(k=='blossom'){const bl=1-Math.pow(1-Math.min(1,w.t*2.2),3);stamp(g,flower(w.c),x,y,w.sz*(.2+.8*bl),w.t*w.spin+w.ph)}
   else if(k=='bubble'){if(u<.88)stamp(g,bubble(),x,y,w.sz*(1+Math.sin(w.t*6+w.ph)*.04));else{const p=(u-.88)/.12;g.globalAlpha=al*(1-p);stamp(g,ring(),x,y,w.sz*(1+p*.9))}}
   else if(k=='snow')stamp(g,flake(),x,y,w.sz,w.t*w.spin+w.ph);
   else if(k=='butterfly'){const f=Math.abs(Math.sin(w.t*16+w.ph))*.85+.15,im=wing(w.c);g.save();g.translate(x,y);g.rotate(Math.max(-.5,Math.min(.5,w.vx/200)));g.scale(w.sz,w.sz);
    g.save();g.scale(f,1);g.drawImage(im,0,-17);g.restore();g.scale(-f,1);g.drawImage(im,0,-17);g.restore();g.fillStyle='#2a1a3a';g.fillRect(x-1.3*w.sz,y-8*w.sz,2.6*w.sz,15*w.sz)}
   else if(k=='coin')stamp(g,coin(),x,y,w.sz,0,Math.cos(w.t*9+w.ph));
   else if(k=='planet')stamp(g,planet(w.c[0],w.c[1]),x,y,w.sz);
   else if(k=='gstar')stamp(g,star(w.c),x,y,w.sz*(.7+.3*Math.sin(w.t*10+w.ph)),w.t*2)}
  g.restore()}
 // ---- in the world
 function hex(c){c=(c||'#9cf').replace('#','');if(c.length==3)c=c.replace(/./g,'$&$&');const n=parseInt(c,16)||0;return[n>>16&255,n>>8&255,n&255]}
 function spawn(tx,ty,id){const k=skin();if(k=='classic'||(typeof QM!='undefined'&&QM.reduce))return;const b=BLK[id];burst(L,k,(tx+.5)*T,(ty+.5)*T,b&&b[1]?hex(b[1]):[150,200,255])}
 {const _b=breakAt;breakAt=function(x,y){const id=tiles[y*W+x];const r=_b.apply(this,arguments);try{if(r&&id&&!tiles[y*W+x])spawn(x,y,id)}catch(_){}return r}}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(L,dt,P.x,P.y+P.h*.4,true)}catch(e){console.error('BRK7',e)}};BOSS6.drawProj=function(g,cx,cy){_d.call(this,g,cx,cy);try{draw(g,L,cx,cy)}catch(e){console.error('BRK7d',e)}}}
 // equipping one in the store shows it once at your feet
 {const _e=FX7.onEquip;FX7.onEquip=function(slot,id){const r=_e.apply(this,arguments);try{if(slot=='break'&&id){const k=skin();if(k!='classic')burst(L,k,P.x,P.y+P.h*.6,[150,200,255])}}catch(_){}return r}}
 // ---- choosing: free ones are saved here, store ones are the SHOP7 'break' slot (picking a free one takes the store one off)
 function set(v){if(SHOP[v]){try{if(SHOP7.has(shopId(v)))SHOP7.equip(shopId(v))}catch(_){}return}if(!FREE.some(f=>f[0]==v))return;free=v;try{localStorage.setItem(K(),free)}catch(_){}
  try{const id=SHOP7.st.eq.break;if(id)SHOP7.unequip(id)}catch(_){}}
 const options=()=>FREE.concat(Object.keys(SHOP).filter(k=>{try{return SHOP7.has(shopId(k))}catch(_){return false}}).map(k=>[k,SHOP[k]+' ★']));
 {const _p=UI6.ext.post;UI6.ext.post=function(tab,body){if(tab=='settings'){const r=document.createElement('div'),c=skin();r.className='hrow';
   r.innerHTML='<label>Break effect</label><select id="brk7">'+options().map(s=>'<option value="'+s[0]+'"'+(c==s[0]?' selected':'')+'>'+s[1]+'</option>').join('')+'</select>';
   r.querySelector('select').onchange=e=>set(e.target.value);const h=body.querySelector('h3');h&&h.nextSibling?body.insertBefore(r,h.nextSibling):body.appendChild(r)}return _p&&_p.apply(this,arguments)}}
 // ---- store card: a grass block that gets mined, pops, shows the effect and comes back. still: a frozen frame for the thumbnails
 const PV={k:'',L:[],last:0,next:0,gone:-9};
 function preview(x,ref,cx,cy,k,t,still){const kind=String(ref||'').replace(/^brk_/,''),s=k*1.25;x.save();x.translate(cx,cy+28*k);x.scale(s,s);
  if(still){const tmp=[];burst(tmp,kind,0,0,[150,200,255]);for(let i=0;i<8;i++)tick(tmp,.07,0,-70,false);x.globalAlpha=.55;x.drawImage(cube(),-16,-16);x.globalAlpha=1;draw(x,tmp,0,0);x.restore();return}
  if(PV.k!==kind){PV.k=kind;PV.L.length=0;PV.next=t+.5;PV.last=t;PV.gone=-9}
  const dt=Math.min(.05,Math.max(0,t-PV.last));PV.last=t;if(t>=PV.next){burst(PV.L,kind,0,0,[150,200,255]);PV.gone=t;PV.next=t+2.4}
  tick(PV.L,dt,0,-70,false);const since=t-PV.gone;
  if(since>.8){const a=Math.min(1,(since-.8)/.2),sc=.6+.4*a,jit=t>PV.next-.45?Math.sin(t*70)*1.6:0;x.globalAlpha=a;x.save();x.translate(jit,0);x.scale(sc,sc);x.drawImage(cube(),-16,-16);x.restore();x.globalAlpha=1}
  draw(x,PV.L,0,0);x.restore()}
 return{spawn,burst,tick,draw,preview,set,options,FREE,SHOP,get skin(){return skin()},get free(){return free},L}})();
