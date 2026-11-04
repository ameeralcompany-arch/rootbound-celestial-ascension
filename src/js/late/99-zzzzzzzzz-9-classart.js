// ===== CLART: a world and a banner of their own for each of the 13 classes.
// scene(g,k,w,h): a painted backdrop in the class palette, drawn once under the Classes screen's motif particles (MYUI bg):
//   brawler a volcanic arena, knight a cathedral at dawn, samurai a torii gate under blossom, archer a starlit pine forest, mage floating
//   towers under a magic circle, demon a blood moon over spires and chains, reaper a moonlit graveyard with a dead tree and crows,
//   elementalist floating prism crystals, stormcaller a storm over sea cliffs, berserker a battlefield of broken blades, ninja an ink-wash
//   bamboo grove, druid an ancient world tree, gunslinger a clock tower city under a great clock.
// MYART.banner(g,k,w,h,t) is replaced: each class has its own cloth shape (flame tongues, kite shield, nobori, three tails, scroll, bat
//   wing, tattered rags, prism point, lightning cut, torn war flag, hanging scroll, leaf, notched gear) and its own emblem.
// Also: the large banner hangs on the Classes screen, each class chip in the rail and the top-bar CLASSES button show a miniature of the
// class's world (miniatures are painted in idle time, never during a cinematic). =====
const CLART=(()=>{
 const A=MYART,TAU=Math.PI*2,PI=Math.PI;
 const pal=k=>(A.TH[k]||A.TH.reaper).pal,mx=(a,b,t)=>A.mix(a,b,t),rg=(c,a)=>A.rgba(c,a);
 const srnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
 // ---- shared painting tools
 function sky(g,w,h,c0,c1,c2){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,c0);gr.addColorStop(.62,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,w,h)}
 function disk(g,x,y,r,c,halo){const gr=g.createRadialGradient(x,y,r*.2,x,y,r*(halo||3));gr.addColorStop(0,rg(c,.55));gr.addColorStop(1,rg(c,0));g.fillStyle=gr;g.fillRect(x-r*(halo||3),y-r*(halo||3),r*(halo||3)*2,r*(halo||3)*2);g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}
 function ridge(g,w,h,y,amp,col,seed,f){const r=srnd(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,h);let px=0;g.lineTo(0,y);const n=Math.ceil(w/(18*f))+2;const pts=[];for(let i=0;i<=n;i++)pts.push(r());for(let i=0;i<=n;i++){px=i*w/n;g.lineTo(px,y-pts[i]*amp-Math.sin(i*.7+seed)*amp*.3)}g.lineTo(w,h);g.closePath();g.fill()}
 function mist(g,w,h,y,th,c,a){const gr=g.createLinearGradient(0,y-th,0,y+th);gr.addColorStop(0,rg(c,0));gr.addColorStop(.5,rg(c,a));gr.addColorStop(1,rg(c,0));g.fillStyle=gr;g.fillRect(0,y-th,w,th*2)}
 function rays(g,x,y,len,n,c,a,spread,dir){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const q=(dir||PI/2)+(i/(n-1)-.5)*spread,wd=.02+(i%3)*.012;g.globalAlpha=a*(.5+.5*((i*7)%5)/5);g.fillStyle=c;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(q-wd)*len,y+Math.sin(q-wd)*len);g.lineTo(x+Math.cos(q+wd)*len,y+Math.sin(q+wd)*len);g.closePath();g.fill()}g.restore()}
 function stars(g,w,h,n,seed,c,maxY){const r=srnd(seed);for(let i=0;i<n;i++){g.globalAlpha=.25+r()*.6;g.fillStyle=c||'#fff';const s=r()*1.4+.4;g.fillRect(r()*w,r()*h*(maxY||.6),s,s)}g.globalAlpha=1}
 function vignette(g,w,h,a){const gr=g.createRadialGradient(w*.5,h*.5,Math.min(w,h)*.3,w*.5,h*.5,Math.max(w,h)*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,'+a+')');g.fillStyle=gr;g.fillRect(0,0,w,h)}
 const poly=(g,...p)=>{g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1])};
 // ---- the 13 worlds (S: the shorter side, so details scale with the screen)
 const W={
  brawler(g,w,h,p){sky(g,w,h,'#0e0302','#3a0e04','#a03a0a');disk(g,w*.72,h*.3,Math.min(w,h)*.07,'#ffb050',4);
   g.fillStyle='#1a0603';g.beginPath();poly(g,w*.5,h,w*.66,h*.36,w*.72,h*.34,w*.78,h*.36,w*.96,h);g.fill();
   const lg=g.createLinearGradient(0,h*.34,0,h);lg.addColorStop(0,'#ffd36a');lg.addColorStop(1,'rgba(255,90,20,0)');g.strokeStyle=lg;g.lineWidth=3;for(let i=0;i<4;i++){g.beginPath();g.moveTo(w*.72,h*.35);g.bezierCurveTo(w*(.7+i*.02),h*.55,w*(.62+i*.06),h*.7,w*(.6+i*.09),h);g.stroke()}
   rays(g,w*.72,h*.34,h*.4,9,'#ff8a3a',.12,1.2,-PI/2);ridge(g,w,h,h*.84,h*.05,'#140402',3,2);
   for(const x of[.08,.2,.86]){g.fillStyle='#0c0302';g.fillRect(w*x,h*.5,w*.035,h*.5);g.fillRect(w*x-w*.008,h*.5,w*.051,h*.02)}
   const r=srnd(7);g.globalCompositeOperation='lighter';for(let i=0;i<70;i++){g.globalAlpha=.3+r()*.6;g.fillStyle=r()<.5?'#ffb050':'#ff6a20';const s=1+r()*2;g.fillRect(r()*w,h*.25+r()*h*.75,s,s)}g.globalAlpha=1;g.globalCompositeOperation='source-over'},
  knight(g,w,h,p){sky(g,w,h,'#140f05','#4a3a14','#e8c878');rays(g,w*.62,-h*.05,h*1.1,13,'#fff2c0',.16,1.1);
   const cx=w*.64,bw=w*.3;g.fillStyle='#120d05';g.fillRect(cx-bw/2,h*.42,bw,h*.58);for(const s of[-1,1]){const sx=cx+s*bw*.42;g.beginPath();poly(g,sx-w*.035,h*.42,sx,h*.1,sx+w*.035,h*.42);g.fill();g.fillRect(sx-w*.035,h*.42,w*.07,h*.58)}
   g.beginPath();poly(g,cx-bw*.25,h*.42,cx,h*.24,cx+bw*.25,h*.42);g.fill();const rr=Math.min(w,h)*.07;disk(g,cx,h*.5,rr,'#ffe9a0',2.4);g.strokeStyle='#120d05';g.lineWidth=2;for(let i=0;i<12;i++){const q=i/12*TAU;g.beginPath();g.moveTo(cx,h*.5);g.lineTo(cx+Math.cos(q)*rr,h*.5+Math.sin(q)*rr);g.stroke()}g.beginPath();g.arc(cx,h*.5,rr*.45,0,TAU);g.stroke();
   for(const s of[-1,1]){const ax=cx+s*bw*.2;g.fillStyle='rgba(255,230,160,.6)';g.beginPath();g.moveTo(ax-w*.012,h*.82);g.lineTo(ax-w*.012,h*.66);g.arc(ax,h*.66,w*.012,PI,0);g.lineTo(ax+w*.012,h*.82);g.fill()}
   mist(g,w,h,h*.9,h*.12,'#fff2c0',.18)},
  samurai(g,w,h,p){sky(g,w,h,'#12060e','#4a1a34','#ff9ab8');disk(g,w*.66,h*.36,Math.min(w,h)*.12,'#fff0f2',2.2);
   g.fillStyle='#3a1426';g.beginPath();poly(g,w*.38,h*.86,w*.66,h*.42,w*.94,h*.86);g.fill();g.fillStyle='#fde8ef';g.beginPath();poly(g,w*.6,h*.5,w*.66,h*.42,w*.72,h*.5,w*.69,h*.52,w*.66,h*.49,w*.63,h*.52);g.fill();
   ridge(g,w,h,h*.84,h*.04,'#22080f',11,3);const tx=w*.55,tw=w*.16,ty=h*.62;g.fillStyle='#c8203a';g.fillRect(tx-tw*.4,ty,w*.012,h*.3);g.fillRect(tx+tw*.4-w*.012,ty,w*.012,h*.3);
   g.beginPath();g.moveTo(tx-tw*.6,ty-h*.02);g.quadraticCurveTo(tx,ty-h*.05,tx+tw*.6,ty-h*.02);g.lineTo(tx+tw*.62,ty+h*.005);g.quadraticCurveTo(tx,ty-h*.02,tx-tw*.62,ty+h*.005);g.fill();g.fillRect(tx-tw*.48,ty+h*.04,tw*.96,h*.015);
   g.strokeStyle='#1a060c';g.lineWidth=Math.max(3,w*.006);g.beginPath();g.moveTo(w*.98,h*.02);g.bezierCurveTo(w*.85,h*.08,w*.8,h*.05,w*.7,h*.14);g.moveTo(w*.86,h*.07);g.quadraticCurveTo(w*.84,h*.16,w*.78,h*.22);g.stroke();
   const r=srnd(19);for(let i=0;i<110;i++){const x=w*(.68+r()*.32),y=h*(r()*.28);g.globalAlpha=.55+r()*.4;A.petal(g,x,y,3+r()*5,r()*TAU,r()<.5?'#ffc0d4':'#ff8aa8')}g.globalAlpha=1;
   mist(g,w,h,h*.86,h*.08,'#ffd0dc',.2)},
  archer(g,w,h,p){sky(g,w,h,'#030714','#0c2240','#2a5a7a');stars(g,w,h,160,23,'#fff6e0',.7);
   const S=Math.min(w,h);disk(g,w*.7,h*.22,S*.06,'#fff6e0',2);g.fillStyle='#0c2240';g.beginPath();g.arc(w*.7+S*.025,h*.22-S*.012,S*.055,0,TAU);g.fill();
   const cons=[[.52,.12],[.56,.2],[.62,.17],[.66,.27],[.74,.32],[.8,.28]];g.strokeStyle='rgba(255,217,138,.45)';g.lineWidth=1;g.beginPath();cons.forEach(([x,y],i)=>i?g.lineTo(w*x,h*y):g.moveTo(w*x,h*y));g.stroke();cons.forEach(([x,y])=>A.star4(g,w*x,h*y,4,'#ffd98a',0));
   for(const[L,c,sd]of[[.68,'#0a1c30',29],[.78,'#06121e',31]]){const r=srnd(sd);g.fillStyle=c;for(let x=-20;x<w+20;x+=w*.03+r()*w*.02){const th=h*(.14+r()*.16),by=h*L+r()*h*.05;g.beginPath();poly(g,x-w*.018,by,x,by-th,x+w*.018,by);g.fill();g.fillRect(x-w*.003,by,w*.006,h)}g.fillRect(0,h*L+h*.04,w,h)}
   mist(g,w,h,h*.74,h*.06,'#7aa8c8',.18)},
  mage(g,w,h,p){sky(g,w,h,'#07040f','#24164a','#6a4ab0');stars(g,w,h,120,37,'#f0e0ff',.8);const S=Math.min(w,h),cx=w*.66,cy=h*.3;
   g.save();g.translate(cx,cy);g.strokeStyle='rgba(255,106,224,.5)';g.lineWidth=1.5;for(const r of[S*.22,S*.26,S*.3]){g.beginPath();g.arc(0,0,r,0,TAU);g.stroke()}for(let i=0;i<20;i++){const q=i/20*TAU;A.rune(g,Math.cos(q)*S*.28,Math.sin(q)*S*.28,5,'rgba(240,224,255,.8)',q+PI/2,i)}
   g.beginPath();for(let i=0;i<=5;i++){const q=i*TAU*2/5-PI/2;g.lineTo(Math.cos(q)*S*.22,Math.sin(q)*S*.22)}g.stroke();g.restore();
   disk(g,w*.88,h*.16,S*.04,'#c8a8ff',2);g.strokeStyle='rgba(240,224,255,.6)';g.beginPath();g.ellipse(w*.88,h*.16,S*.07,S*.018,-.3,0,TAU);g.stroke();disk(g,w*.48,h*.1,S*.018,'#ffb0f0',2.5);
   for(const[x,y,s]of[[.58,.68,1],[.82,.6,.8],[.44,.78,.6]]){const iw=w*.12*s,ih=h*.06*s;g.fillStyle='#120a28';g.beginPath();g.ellipse(w*x,h*y,iw,ih*.4,0,0,PI);g.lineTo(w*x,h*y+ih*1.6);g.closePath();g.fill();
    g.fillRect(w*x-iw*.18,h*y-ih*3,iw*.36,ih*3);g.beginPath();poly(g,w*x-iw*.26,h*y-ih*3,w*x,h*y-ih*4.4,w*x+iw*.26,h*y-ih*3);g.fill();g.fillStyle='#ffd0ff';g.fillRect(w*x-iw*.05,h*y-ih*2.4,iw*.1,ih*.5)}
   mist(g,w,h,h*.9,h*.1,'#b06aff',.18)},
  demon(g,w,h,p){sky(g,w,h,'#080102','#2e050a','#8a1220');const S=Math.min(w,h);disk(g,w*.68,h*.3,S*.15,'#ff2a3a',2.2);g.fillStyle='rgba(120,0,10,.35)';g.beginPath();g.arc(w*.68-S*.04,h*.3+S*.03,S*.05,0,TAU);g.fill();
   g.fillStyle='#0a0103';const r=srnd(41);for(let i=0;i<9;i++){const x=w*(.4+i*.07),sh=h*(.25+r()*.3);g.beginPath();poly(g,x-w*.03,h,x-w*.012,h-sh,x,h-sh-h*.08,x+w*.012,h-sh,x+w*.03,h);g.fill()}
   g.strokeStyle='#1a0306';g.lineWidth=3;for(const x of[.5,.62,.86]){g.beginPath();for(let y=0;y<h*.4;y+=10){g.moveTo(w*x-4,y);g.lineTo(w*x+4,y+6)}g.stroke()}
   mist(g,w,h,h*.82,h*.14,'#ff2a3a',.2)},
  reaper(g,w,h,p){sky(g,w,h,'#05030a','#1a1230','#3e3060');stars(g,w,h,90,43,'#ece0ff',.6);const S=Math.min(w,h);disk(g,w*.7,h*.26,S*.11,'#ece0ff',2.6);
   g.strokeStyle='#08050e';g.fillStyle='#08050e';g.lineCap='round';const tr=(x,y,a,l,lw,d)=>{if(d>5||l<4)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;g.lineWidth=lw;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();tr(x2,y2,a-.45-d*.05,l*.72,lw*.66,d+1);tr(x2,y2,a+.38,l*.66,lw*.62,d+1)};tr(w*.84,h*.92,-PI/2-.08,h*.2,S*.03,0);
   ridge(g,w,h,h*.86,h*.03,'#0a0712',47,3);for(const[x,s]of[[.5,1],[.58,.8],[.66,1.1],[.75,.9],[.93,.8]]){const tx=w*x,th=h*.07*s,tw=w*.022*s;g.fillStyle='#0d0918';g.beginPath();g.moveTo(tx-tw,h*.9);g.lineTo(tx-tw,h*.9-th);g.arc(tx,h*.9-th,tw,PI,0);g.lineTo(tx+tw,h*.9);g.fill()}
   for(const x of[.54,.71]){g.fillStyle='#0d0918';g.fillRect(w*x-2,h*.78,4,h*.12);g.fillRect(w*x-w*.012,h*.8,w*.024,4)}
   mist(g,w,h,h*.88,h*.08,'#9a8ad8',.3);for(let i=0;i<6;i++)A.crow(g,w*(.55+i*.06),h*(.12+(i%3)*.05),10+i%2*4,0,'#06030a',i*.7)},
  elementalist(g,w,h,p){sky(g,w,h,'#030c14','#0c2e3e','#4ab8cc');const S=Math.min(w,h);
   const cols=['#ff5a5a','#ffb04a','#ffe95a','#5aff8a','#5ad8ff','#b06aff'];g.save();g.globalCompositeOperation='lighter';cols.forEach((c,i)=>{g.globalAlpha=.22;g.strokeStyle=c;g.lineWidth=S*.012;g.beginPath();g.moveTo(w*.42,h*.05+i*S*.012);g.lineTo(w*1.02,h*.62+i*S*.03);g.stroke()});g.restore();
   const r=srnd(53);for(let i=0;i<9;i++){const x=w*(.5+r()*.45),y=h*(.15+r()*.55),s=S*(.04+r()*.06);g.globalAlpha=.85;A.crystal(g,x,y,s,r()*.6-.3,i%2?'#5ad8ff':'#e8fbff');g.globalAlpha=.25;g.fillStyle='#e8fbff';g.beginPath();g.arc(x,y,s*.9,0,TAU);g.fill()}g.globalAlpha=1;
   for(let i=0;i<5;i++){const cx=w*(.4+i*.16),cy=h*(.86+(i%2)*.03);g.fillStyle='rgba(200,240,250,.18)';g.beginPath();g.ellipse(cx,cy,w*.12,h*.05,0,0,TAU);g.fill()}},
  stormcaller(g,w,h,p){sky(g,w,h,'#04060c','#141c34','#3a5080');const S=Math.min(w,h);for(let i=0;i<5;i++){g.fillStyle=rg(i%2?'#0c1222':'#1a2440',.85);g.beginPath();g.ellipse(w*(.45+i*.14),h*(.1+(i%3)*.05),w*.2,h*.09,0,0,TAU);g.fill()}
   g.globalCompositeOperation='lighter';for(const[x,s]of[[.62,7],[.8,13],[.92,21]])A.bolt(g,w*x,h*.14,h*.6,PI/2+(s%3-1)*.15,'#ffe95a',s);g.globalCompositeOperation='source-over';
   g.fillStyle='#0a0e1a';g.fillRect(0,h*.8,w,h*.2);g.fillStyle='#05070e';g.beginPath();poly(g,w*.36,h,w*.42,h*.66,w*.5,h*.7,w*.56,h*.8,w*.6,h);g.fill();
   g.strokeStyle='rgba(180,200,255,.22)';g.lineWidth=1;const r=srnd(59);g.beginPath();for(let i=0;i<120;i++){const x=r()*w,y=r()*h;g.moveTo(x,y);g.lineTo(x-6,y+18)}g.stroke();mist(g,w,h,h*.8,h*.05,'#7ad8ff',.16)},
  berserker(g,w,h,p){sky(g,w,h,'#0e0302','#3a1008','#b8461c');const S=Math.min(w,h);disk(g,w*.7,h*.42,S*.08,'#ffb04a',3);
   for(let i=0;i<4;i++){g.fillStyle='rgba(30,10,6,.45)';g.beginPath();g.ellipse(w*(.5+i*.13),h*(.3-i*.04),w*.08,h*.2,.3,0,TAU);g.fill()}
   g.fillStyle='#120402';g.beginPath();poly(g,w*.82,h,w*.82,h*.34,w*.86,h*.3,w*.88,h*.36,w*.9,h*.32,w*.92,h);g.fill();ridge(g,w,h,h*.84,h*.04,'#140402',61,2);
   const r=srnd(67);for(let i=0;i<10;i++){const x=w*(.42+r()*.56),y=h*(.84+r()*.06),a=(r()-.5)*.6,l=h*(.08+r()*.07);g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#0a0302';g.fillRect(-2,-l,4,l);g.fillRect(-w*.008,-l*.78,w*.016,3);if(i%3==0){g.beginPath();g.ellipse(4,-l*.92,w*.012,l*.12,0,0,TAU);g.fill()}g.restore()}
   mist(g,w,h,h*.86,h*.07,'#ff8a4a',.16)},
  ninja(g,w,h,p){sky(g,w,h,'#0a0a0e','#22242e','#6a6e80');const S=Math.min(w,h);disk(g,w*.68,h*.3,S*.1,'#e84a4a',1.6);
   g.fillStyle='rgba(20,22,30,.6)';g.beginPath();poly(g,w*.42,h*.86,w*.52,h*.46,w*.6,h*.86);g.fill();const px=w*.52;for(let i=0;i<4;i++){const y=h*(.5+i*.08),ww=w*(.035+i*.012);g.fillStyle='#14161e';g.beginPath();poly(g,px-ww*1.4,y+h*.03,px,y-h*.02,px+ww*1.4,y+h*.03);g.fill();g.fillRect(px-ww*.7,y+h*.03,ww*1.4,h*.04)}
   const r=srnd(71);for(let i=0;i<16;i++){const x=w*(.62+r()*.38),lw=S*(.008+r()*.012);g.fillStyle=rg('#0c0d12',.6+r()*.4);g.fillRect(x,0,lw,h);for(let y=r()*60;y<h;y+=50+r()*40)g.fillRect(x-lw*.3,y,lw*1.6,2);if(i%2){A.leaf(g,x,h*(.1+r()*.6),10+r()*8,(r()-.5)*1.5,'#0c0d12')}}
   for(let i=0;i<5;i++){g.globalAlpha=.5;A.ink(g,w*(.45+r()*.5),h*(.85+r()*.1),8+r()*14,'#050508',(r()*1e5)|0)}g.globalAlpha=1;mist(g,w,h,h*.7,h*.14,'#c8ccd8',.22)},
  druid(g,w,h,p){sky(g,w,h,'#030a04','#0e2e14','#3a7a40');const S=Math.min(w,h);rays(g,w*.66,-h*.05,h,10,'#eaffe0',.1,.9);
   const tx=w*.68;g.fillStyle='#071a09';g.beginPath();g.moveTo(tx-w*.05,h);g.bezierCurveTo(tx-w*.03,h*.7,tx-w*.04,h*.5,tx-w*.015,h*.4);g.lineTo(tx+w*.015,h*.4);g.bezierCurveTo(tx+w*.04,h*.5,tx+w*.03,h*.7,tx+w*.05,h);g.fill();
   for(const s of[-1,1])for(let i=0;i<3;i++){g.strokeStyle='#071a09';g.lineWidth=S*(.02-i*.005);g.beginPath();g.moveTo(tx,h*.95);g.quadraticCurveTo(tx+s*w*(.08+i*.06),h*(.9-i*.02),tx+s*w*(.14+i*.08),h);g.stroke()}
   for(const[x,y,r]of[[0,.32,.2],[-.12,.36,.14],[.12,.34,.15],[-.06,.22,.13],[.07,.2,.12]]){g.fillStyle=mx('#0c2a10','#1a4a1e',(y-.2)*4);g.beginPath();g.ellipse(tx+w*x,h*y,w*r*.7,h*r*.6,0,0,TAU);g.fill()}
   const r=srnd(79);g.globalCompositeOperation='lighter';for(let i=0;i<40;i++){g.globalAlpha=.4+r()*.5;const x=r()*w,y=h*(.5+r()*.5);g.fillStyle=r()<.5?'#7aff8a':'#ffe95a';g.beginPath();g.arc(x,y,1+r()*1.5,0,TAU);g.fill()}g.globalCompositeOperation='source-over';g.globalAlpha=1;
   for(let i=0;i<12;i++)A.rose(g,w*(.4+r()*.58),h*(.9+r()*.08),4+r()*4,i%2?'#ff7aa8':'#ffd0e0');mist(g,w,h,h*.92,h*.06,'#7aff8a',.12)},
  gunslinger(g,w,h,p){sky(g,w,h,'#05101a','#103040','#c88a4a');const S=Math.min(w,h),cx=w*.66,cy=h*.3,R=S*.2;
   g.fillStyle='rgba(224,251,255,.1)';g.beginPath();g.arc(cx,cy,R,0,TAU);g.fill();g.strokeStyle='rgba(255,211,106,.65)';g.lineWidth=2;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();g.beginPath();g.arc(cx,cy,R*.9,0,TAU);g.stroke();
   for(let i=0;i<12;i++){const q=i/12*TAU;g.lineWidth=i%3?1.5:3;g.beginPath();g.moveTo(cx+Math.cos(q)*R*.78,cy+Math.sin(q)*R*.78);g.lineTo(cx+Math.cos(q)*R*.88,cy+Math.sin(q)*R*.88);g.stroke()}
   g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(-1.2)*R*.55,cy+Math.sin(-1.2)*R*.55);g.moveTo(cx,cy);g.lineTo(cx+Math.cos(.4)*R*.75,cy+Math.sin(.4)*R*.75);g.stroke();
   g.globalAlpha=.25;A.gear(g,w*.9,h*.12,S*.08,'#ffd36a',.3);A.gear(g,w*.46,h*.2,S*.05,'#ffd36a',.8);g.globalAlpha=1;
   g.fillStyle='#071018';const r=srnd(83);for(let x=w*.38;x<w;x+=w*(.03+r()*.03)){const bh=h*(.12+r()*.2);g.fillRect(x,h-bh,w*.03,bh)}g.fillRect(w*.8,h*.36,w*.06,h*.64);g.beginPath();poly(g,w*.79,h*.36,w*.83,h*.26,w*.87,h*.36);g.fill();g.fillStyle='#ffd36a';g.beginPath();g.arc(w*.83,h*.42,w*.014,0,TAU);g.fill();
   mist(g,w,h,h*.9,h*.08,'#ffd36a',.14)}};
 // the backdrop for one class: the world, then a darker veil on the right where the glass panels sit (keeps the text readable)
 function scene(g,k,w,h){const f=W[k]||W.reaper,p=pal(k);g.save();try{f(g,w,h,p)}catch(e){if(!scene.e){scene.e=1;console.error('CLART scene',k,e)}}g.restore();
  const gr=g.createLinearGradient(w*.3,0,w,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.42)');g.fillStyle=gr;g.fillRect(0,0,w,h);vignette(g,w,h,.55)}

 // ---- banners: a cloth shape per class, an emblem per class
 // shapes trace the cloth outline between x0..x1 below the rod (yt) to the bottom (yb); wv(y) is the sway offset
 const SHAPE={
  brawler:(g,x0,x1,yt,yb,wv)=>{const m=(x0+x1)/2,q=(x1-x0)/6;g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb-8),yb-8);g.quadraticCurveTo(x0+q+wv(yb),yb-2,x0+q*1.4+wv(yb),yb-10);g.quadraticCurveTo(m-q*.6+wv(yb),yb+2,m+wv(yb),yb+4);g.quadraticCurveTo(m+q*.6+wv(yb),yb+2,x1-q*1.4+wv(yb),yb-10);g.quadraticCurveTo(x1-q+wv(yb),yb-2,x1+wv(yb-8),yb-8);g.lineTo(x1+wv(yt),yt)},
  knight:(g,x0,x1,yt,yb,wv)=>{const m=(x0+x1)/2,yc=yt+(yb-yt)*.55;g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yc),yc);g.quadraticCurveTo(x0+wv(yb),yb-(yb-yt)*.12,m+wv(yb),yb);g.quadraticCurveTo(x1+wv(yb),yb-(yb-yt)*.12,x1+wv(yc),yc);g.lineTo(x1+wv(yt),yt)},
  samurai:(g,x0,x1,yt,yb,wv)=>{g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);g.lineTo(x1+wv(yb),yb);g.lineTo(x1+wv(yt),yt)},
  archer:(g,x0,x1,yt,yb,wv)=>{const q=(x1-x0)/3,yn=yb-(yb-yt)*.16;g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);g.lineTo(x0+q*.5+wv(yn),yn);g.lineTo(x0+q*1.5+wv(yb),yb+2);g.lineTo(x0+q*2+wv(yn),yn);g.lineTo(x1+wv(yb),yb);g.lineTo(x1+wv(yt),yt)},
  mage:(g,x0,x1,yt,yb,wv)=>{g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb-4),yb-4);g.lineTo(x1+wv(yb-4),yb-4);g.lineTo(x1+wv(yt),yt)},
  demon:(g,x0,x1,yt,yb,wv)=>{const q=(x1-x0)/3;g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);for(let i=0;i<3;i++){const a=x0+q*i,b=a+q;g.quadraticCurveTo((a+b)/2+wv(yb),yb-(yb-yt)*.14,b+wv(yb),yb)}g.lineTo(x1+wv(yt),yt)},
  reaper:(g,x0,x1,yt,yb,wv)=>{const pts=[[0,0],[.12,-.05],[.2,.03],[.32,-.09],[.42,0],[.5,-.03],[.6,.04],[.7,-.07],[.8,.02],[.9,-.04],[1,.01]];g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);for(const[f,dy]of pts){const y=yb+dy*(yb-yt);g.lineTo(x0+(x1-x0)*f+wv(y),y)}g.lineTo(x1+wv(yt),yt)},
  elementalist:(g,x0,x1,yt,yb,wv)=>{const m=(x0+x1)/2,yc=yt+(yb-yt)*.7;g.moveTo(x0+3+wv(yt),yt);g.lineTo(x0+wv(yt+6),yt+6);g.lineTo(x0+wv(yc),yc);g.lineTo(m+wv(yb),yb);g.lineTo(x1+wv(yc),yc);g.lineTo(x1+wv(yt+6),yt+6);g.lineTo(x1-3+wv(yt),yt)},
  stormcaller:(g,x0,x1,yt,yb,wv)=>{const q=(x1-x0)/4,d=(yb-yt)*.12;g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);g.lineTo(x0+q+wv(yb),yb-d);g.lineTo(x0+q*1.6+wv(yb),yb+d*.4);g.lineTo(x0+q*2.4+wv(yb),yb-d*1.2);g.lineTo(x0+q*3+wv(yb),yb-d*.2);g.lineTo(x1+wv(yb),yb-d);g.lineTo(x1+wv(yt),yt)},
  berserker:(g,x0,x1,yt,yb,wv)=>{g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);g.lineTo(x0+(x1-x0)*.35+wv(yb),yb-(yb-yt)*.06);g.lineTo(x1+wv(yb),yb-(yb-yt)*.3);g.lineTo(x1+wv(yt),yt)},
  ninja:(g,x0,x1,yt,yb,wv)=>{const i=(x1-x0)*.12;g.moveTo(x0+i+wv(yt),yt);g.lineTo(x0+i+wv(yb-4),yb-4);g.lineTo(x1-i+wv(yb-4),yb-4);g.lineTo(x1-i+wv(yt),yt)},
  druid:(g,x0,x1,yt,yb,wv)=>{const m=(x0+x1)/2;g.moveTo(x0+wv(yt),yt);g.bezierCurveTo(x0-3+wv(yt+(yb-yt)*.4),yt+(yb-yt)*.45,x0+(x1-x0)*.1+wv(yb),yb-(yb-yt)*.15,m+wv(yb),yb);g.bezierCurveTo(x1-(x1-x0)*.1+wv(yb),yb-(yb-yt)*.15,x1+3+wv(yt+(yb-yt)*.4),yt+(yb-yt)*.45,x1+wv(yt),yt)},
  gunslinger:(g,x0,x1,yt,yb,wv)=>{const m=(x0+x1)/2,r=(x1-x0)*.18;g.moveTo(x0+wv(yt),yt);g.lineTo(x0+wv(yb),yb);g.lineTo(m-r+wv(yb),yb);g.arc(m+wv(yb),yb,r,PI,0,true);g.lineTo(x1+wv(yb),yb);g.lineTo(x1+wv(yt),yt)}};
 // emblems drawn at (x,y) with radius r
 const EMB={
  brawler:(g,x,y,r,p,t)=>{A.flame(g,x,y+r*.55,r*1.1,p[0],t);g.fillStyle=p[1];g.beginPath();g.roundRect?g.roundRect(x-r*.38,y-r*.15,r*.76,r*.55,r*.15):g.rect(x-r*.38,y-r*.15,r*.76,r*.55);g.fill()},
  knight:(g,x,y,r,p)=>{g.fillStyle=p[1];g.fillRect(x-r*.12,y-r*.75,r*.24,r*1.5);g.fillRect(x-r*.55,y-r*.32,r*1.1,r*.22);g.strokeStyle=p[3];g.lineWidth=1;for(let i=0;i<8;i++){const q=i/8*TAU;g.beginPath();g.moveTo(x+Math.cos(q)*r*.8,y+Math.sin(q)*r*.8);g.lineTo(x+Math.cos(q)*r,y+Math.sin(q)*r);g.stroke()}},
  samurai:(g,x,y,r,p)=>{for(let i=0;i<5;i++){const q=i/5*TAU-PI/2;A.petal(g,x+Math.cos(q)*r*.45,y+Math.sin(q)*r*.45,r*.5,q+PI/2,p[1])}g.fillStyle=p[3];g.beginPath();g.arc(x,y,r*.18,0,TAU);g.fill()},
  archer:(g,x,y,r,p)=>{g.strokeStyle=p[1];g.lineWidth=Math.max(1,r*.12);g.beginPath();g.moveTo(x-r*.7,y+r*.7);g.lineTo(x+r*.6,y-r*.6);g.stroke();g.fillStyle=p[1];g.beginPath();poly(g,x+r*.75,y-r*.75,x+r*.3,y-r*.55,x+r*.55,y-r*.3);g.fill();A.star4(g,x-r*.25,y-r*.35,r*.35,p[3],0)},
  mage:(g,x,y,r,p)=>{g.fillStyle=p[1];g.beginPath();g.arc(x,y,r*.7,PI*.3,PI*1.7);g.arc(x+r*.25,y,r*.55,PI*1.6,PI*.4,true);g.fill();A.star4(g,x+r*.35,y-r*.2,r*.32,p[3],0)},
  demon:(g,x,y,r,p)=>{g.fillStyle=p[0];g.beginPath();poly(g,x-r*.75,y-r*.75,x-r*.35,y-r*.1,x-r*.1,y-r*.35);g.fill();g.beginPath();poly(g,x+r*.75,y-r*.75,x+r*.35,y-r*.1,x+r*.1,y-r*.35);g.fill();g.fillStyle=p[1];g.beginPath();g.ellipse(x,y+r*.15,r*.55,r*.3,0,0,TAU);g.fill();g.fillStyle=p[2];g.beginPath();g.ellipse(x,y+r*.15,r*.12,r*.28,0,0,TAU);g.fill()},
  reaper:(g,x,y,r,p)=>{g.strokeStyle=p[1];g.lineWidth=Math.max(1,r*.12);g.beginPath();g.moveTo(x-r*.2,y+r*.8);g.lineTo(x+r*.25,y-r*.75);g.stroke();g.fillStyle=p[1];g.beginPath();g.moveTo(x+r*.25,y-r*.75);g.quadraticCurveTo(x-r*.7,y-r*.95,x-r*.85,y-r*.2);g.quadraticCurveTo(x-r*.55,y-r*.6,x+r*.18,y-r*.5);g.closePath();g.fill()},
  elementalist:(g,x,y,r,p)=>{A.crystal(g,x,y+r*.6,r*1.3,0,p[1]);const c=['#ff5a5a','#ffe95a','#5aff8a','#5ad8ff'];c.forEach((cc,i)=>{g.fillStyle=cc;g.beginPath();g.arc(x+Math.cos(i/4*TAU)*r*.8,y+Math.sin(i/4*TAU)*r*.8,r*.12,0,TAU);g.fill()})},
  stormcaller:(g,x,y,r,p)=>{g.fillStyle=p[1];g.beginPath();poly(g,x+r*.15,y-r*.85,x-r*.45,y+r*.1,x-r*.02,y+r*.1,x-r*.2,y+r*.85,x+r*.45,y-r*.15,x+r*.05,y-r*.15);g.closePath();g.fill()},
  berserker:(g,x,y,r,p)=>{for(const s of[-1,1]){g.save();g.translate(x,y);g.rotate(s*.6);g.fillStyle=p[1];g.fillRect(-r*.07,-r*.8,r*.14,r*1.6);g.beginPath();g.moveTo(r*.07*s,-r*.75);g.quadraticCurveTo(r*.65*s,-r*.55,r*.07*s,-r*.15);g.fill();g.restore()}},
  ninja:(g,x,y,r,p)=>{g.strokeStyle=p[1];g.lineWidth=Math.max(1.2,r*.16);g.beginPath();g.arc(x,y,r*.8,.4,TAU-.2);g.stroke();A.shuriken(g,x,y,r*.45,.3,p[3])},
  druid:(g,x,y,r,p)=>{for(let i=0;i<3;i++)A.leaf(g,x,y+r*.2,r*.8,-PI/2+(i-1)*.7,i==1?p[0]:p[1]);A.rose(g,x,y+r*.35,r*.22,p[3])},
  gunslinger:(g,x,y,r,p)=>{A.gear(g,x,y,r*.75,p[3],0);g.fillStyle=p[2];g.beginPath();g.arc(x,y,r*.42,0,TAU);g.fill();g.strokeStyle=p[1];g.lineWidth=Math.max(1,r*.1);g.beginPath();g.moveTo(x,y);g.lineTo(x,y-r*.35);g.moveTo(x,y);g.lineTo(x+r*.26,y+r*.1);g.stroke()}};
 // the hanging banner: rod, the class's cloth shape with trim, its emblem, and the class ornament (tassels, cord, scroll roller...)
 function banner(g,k,w,h,t){const th=A.TH[k]||A.TH.reaper,p=th.pal,[m,l,d,a]=p,sway=Math.sin(t*1.3)*.5,shape=SHAPE[k]||SHAPE.reaper;g.save();g.lineJoin='round';
  const rodY=5;g.fillStyle=A.metal(g,0,rodY-2,w,rodY+2,k);g.beginPath();g.roundRect?g.roundRect(1,rodY-2.2,w-2,4.4,2):g.rect(1,rodY-2.2,w-2,4.4);g.fill();g.strokeStyle=A.OL;g.lineWidth=1;g.stroke();A.gem(g,2.5,rodY,2.6,a);A.gem(g,w-2.5,rodY,2.6,a);
  const x0=w*.14,x1=w*.86,yt=rodY+2,yb=h-(k=='mage'||k=='ninja'?6:4)-(k=='brawler'?4:0),wv=y=>Math.sin(t*2.1+y*.06)*1.4*(y/h)+sway*(y/h)*3;
  g.beginPath();shape(g,x0,x1,yt,yb,wv);g.closePath();const cg=g.createLinearGradient(0,0,w,h);cg.addColorStop(0,mx(m,'#ffffff',.15));cg.addColorStop(.5,mx(m,d,.35));cg.addColorStop(1,d);g.fillStyle=cg;g.fill();
  // the class's cloth pattern, clipped to the shape
  g.save();g.clip();g.globalAlpha=.22;g.strokeStyle=l;g.lineWidth=.8;
  if(k=='knight'||k=='gunslinger'){g.beginPath();g.moveTo((x0+x1)/2,yt);g.lineTo((x0+x1)/2,yb);g.moveTo(x0,h*.36);g.lineTo(x1,h*.36);g.stroke()}
  else if(k=='samurai'||k=='ninja'){for(let y=yt+6;y<yb;y+=7){g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke()}}
  else if(k=='mage'||k=='archer'){for(let i=0;i<10;i++){g.fillStyle=l;g.fillRect(x0+((i*37)%100)/100*(x1-x0),yt+((i*53)%100)/100*(yb-yt),1.2,1.2)}}
  else if(k=='demon'||k=='berserker'){for(let i=0;i<3;i++){g.beginPath();g.moveTo(x0+i*4+2,yt+8);g.lineTo(x1-6+i*2,yb-10);g.stroke()}}
  else if(k=='druid'){g.beginPath();g.moveTo((x0+x1)/2,yb);g.quadraticCurveTo(x0,h*.5,(x0+x1)/2,yt);g.stroke()}
  else{g.beginPath();for(let y=yt+5;y<yb;y+=9){g.moveTo(x0,y);g.quadraticCurveTo((x0+x1)/2,y+4,x1,y)}g.stroke()}
  g.restore();g.globalAlpha=1;g.beginPath();shape(g,x0,x1,yt,yb,wv);g.closePath();g.strokeStyle=A.OL;g.lineWidth=1;g.stroke();
  g.save();g.beginPath();shape(g,x0+2.5,x1-2.5,yt+3,yb-4,wv);g.closePath();g.strokeStyle=rg(a,.85);g.lineWidth=.9;g.stroke();g.restore();
  g.globalAlpha=.16;g.fillStyle='#000';g.fillRect((x0+x1)/2-1.5+wv(h*.5),yt+3,3,(yb-yt)*.6);g.globalAlpha=1;
  const ex=(x0+x1)/2+wv(h*.4),ey=h*.4,er=Math.min(w*.27,h*.15);g.beginPath();g.arc(ex,ey,er,0,TAU);g.fillStyle=rg(d,.6);g.fill();g.strokeStyle=A.metal(g,ex-er,ey-er,ex+er,ey+er,k,.1);g.lineWidth=1.4;g.stroke();
  try{(EMB[k]||EMB.reaper)(g,ex,ey,er*.82,p,t)}catch(_){}
  // ornaments
  if(k=='mage'||k=='ninja'){const iw=k=='ninja'?(x1-x0)*.12:0;g.fillStyle=A.metal(g,x0,yb-6,x1,yb,k);g.fillRect(x0+iw-2+wv(yb),yb-5,(x1-x0)-iw*2+4,4);if(k=='ninja'){g.strokeStyle=rg(a,.9);g.lineWidth=.8;g.beginPath();g.moveTo(x0+iw+wv(yb),yb-1);g.lineTo(x0+iw+wv(yb)+sway,yb+5);g.stroke()}}
  else if(k=='samurai'){for(let y=yt+6;y<yb;y+=Math.max(10,(yb-yt)/5)){g.strokeStyle=rg(a,.9);g.lineWidth=.8;g.beginPath();g.arc(x0-1.6+wv(y),y,1.6,0,TAU);g.stroke()}}
  else if(k=='druid'){g.strokeStyle=rg(m,.9);g.lineWidth=.9;g.beginPath();g.moveTo(x0+wv(yt),yt+2);g.bezierCurveTo(x0-4,h*.4,x1+4,h*.6,(x0+x1)/2+wv(yb),yb);g.stroke();A.leaf(g,x0+2,h*.5,5,.6,m)}
  else if(k=='reaper'||k=='berserker'){g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.arc(x0+(x1-x0)*.7+wv(h*.7),h*.72,1.4,0,TAU);g.arc(x0+(x1-x0)*.3+wv(h*.62),h*.62,1,0,TAU);g.fill()}
  else{for(const tx of[x0+1,x1-1]){const tw=wv(yb);g.strokeStyle=rg(a,.9);g.lineWidth=.8;g.beginPath();g.moveTo(tx+tw,yb-6);g.lineTo(tx+tw+sway,yb+1);g.stroke();A.gem(g,tx+tw+sway,yb+2,1.5,a)}}
  g.restore()}
 A.banner=banner;
 // ---- miniatures of each world (rail chips, the CLASSES button): painted in idle time, kept as image URLs in one style sheet
 const MW=180,MH=60,MINI={};let css=null;
 function mini(k){if(MINI[k])return MINI[k];const d=1.5,c=document.createElement('canvas');c.width=320*d;c.height=180*d;const g=c.getContext('2d',{willReadFrequently:true});g.setTransform(d,0,0,d,0,0);
  try{(W[k]||W.reaper)(g,320,180,pal(k))}catch(_){}
  // paint the world at 16:9, then frame the band around its landmark (upper right) to the chip
  const c2=document.createElement('canvas');c2.width=MW*d;c2.height=MH*d;const g2=c2.getContext('2d',{willReadFrequently:true});g2.drawImage(c,c.width*.36,c.height*.1,c.width*.64,c.height*.5,0,0,c2.width,c2.height);
  const gr=g2.createLinearGradient(0,0,c2.width,0);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.6,'rgba(0,0,0,.15)');gr.addColorStop(1,'rgba(0,0,0,.05)');g2.fillStyle=gr;g2.fillRect(0,0,c2.width,c2.height);
  return MINI[k]=c2.toDataURL('image/jpeg',.82)}
 // one style sheet with every miniature, rewritten only when it changes (rewriting it is DOM work)
 function sheet(){if(!css){css=document.createElement('style');css.id='clart-css';document.head.appendChild(css)}
  const txt=Object.keys(MINI).map(k=>'#cls9 .c9c[data-k="'+k+'"]{background:linear-gradient(rgba(0,0,0,.18),rgba(0,0,0,.18)),url('+MINI[k]+') center/cover no-repeat}').join('\n')+
   '\n#cls9 .c9c.on{box-shadow:0 0 0 1px var(--l,#fff),0 0 16px -4px var(--m,#fff)}#cls9 .c9c b,#cls9 .c9c small,#cls9 .c9c em{text-shadow:0 1px 3px rgba(0,0,0,.85)}'+
   '\n#bcls.clart{background-size:cover;background-position:center;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9);border-color:var(--clart-l,rgba(255,255,255,.5))}';if(css.textContent!==txt)css.textContent=txt}
 const busy=()=>typeof CINE7!='undefined'&&CINE7.playing;
 let qi=null;function warm(){if(qi)return;qi=A.KEYS.slice();const step=dl=>{if(busy()){setTimeout(()=>ric(step),1500);return}if(dl&&(dl.didTimeout||dl.timeRemaining()<10)){ric(step);return}const t0=performance.now();try{mini(qi.shift())}catch(_){qi.length=0}if(performance.now()-t0>45)qi.length=0;if(qi.length)setTimeout(()=>ric(step),60);else sheet()};ric(step)}
 const ric=f=>typeof requestIdleCallback=='function'?requestIdleCallback(f,{timeout:4000}):setTimeout(f,80);
 setTimeout(warm,6000);
 // the Classes screen: the large banner hangs inside the hero frame; any miniatures not painted yet are finished on open
 {const _a=MYUI.after;MYUI.after=function(el,k){const r=_a.apply(this,arguments);try{if(Object.keys(MINI).length<A.KEYS.length){for(const q of A.KEYS)mini(q);sheet()}hang(el,k)}catch(e){if(!hang.e){hang.e=1;console.error('CLART',e)}}return r}}
 function hang(el,k){const hc=el.querySelector('.c9heroc');if(!hc||!hc.parentElement)return;const host=hc.parentElement;let c=host.querySelector('canvas.c9ban');
  if(!c){c=document.createElement('canvas');c.className='c9ban';c.setAttribute('aria-hidden','true');c.style.cssText='position:absolute;right:6%;top:0;width:64px;height:156px;pointer-events:none;z-index:3;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55));transform-origin:50% 0;animation:pb9sway 5s ease-in-out infinite';if(getComputedStyle(host).position=='static')host.style.position='relative';host.appendChild(c)}
  if(c.dataset.k===k)return;c.dataset.k=k;const d=Math.min(2,devicePixelRatio||1);c.width=64*d;c.height=156*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,64,156);banner(g,k,64,156,0)}
 return{scene,banner,mini,W,SHAPE,EMB,get ready(){return Object.keys(MINI).length}}})();
