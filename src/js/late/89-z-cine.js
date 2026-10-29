// ===== CINE7: anime-style cinematics. Original procedural art + synthesized score (no image or audio files) =====
// 1) launch story intro: unskippable, ~30 s (reduced motion: the same 7 scenes in ~18 s), then fades into the home screen
// 2) world entry: portal iris opening + world title card (pointer-events:none, never blocks input)
// 3) boss intro / defeat / loss cards, hooked from ARENA7 (85-zzz-arena.js) and BOSS6 (85-bosses.js)
// Budget: static art is pre-rendered once into offscreen canvases (lazily, one asset per frame ahead of use); every rAF loop /
// timer stops and every node is removed when a cinematic ends, so gameplay frames pay nothing while nothing plays.
const CINE7=(()=>{
 const R=Math.random,PI=Math.PI,TAU=PI*2;
 const cl=(v,a,b)=>v<a?a:v>b?b:v,ez=x=>{x=cl(x,0,1);return x*x*(3-2*x)},eo=x=>1-Math.pow(1-cl(x,0,1),3),ei=x=>Math.pow(cl(x,0,1),3),lerp=(a,b,k)=>a+(b-a)*k;
 const bo=x=>{x=cl(x,0,1)-1;return 1+2.70158*x*x*x+1.70158*x*x};
 const reduce=()=>{try{return !!(cel.opt.reduce||QM.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c};
 const hx=h=>{const n=parseInt(String(h).slice(1),16)||0;return[n>>16,n>>8&255,n&255]};
 const rgba=(h,a)=>{const c=hx(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 const mix=(a,b,k)=>{const x=hx(a),y=hx(b);return'#'+x.map((v,i)=>('0'+Math.round(v+(y[i]-v)*k).toString(16)).slice(-2)).join('')};
 const srnd=s=>()=>(s=s*16807%2147483647)/2147483647;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const SERIF="'Cormorant Garamond',Georgia,'Times New Roman',serif",SANS="Montserrat,system-ui,'Segoe UI',Arial,sans-serif";
 const BIDS=['warden','sovereign','eclipse','magma','tide','storm'];
 const BC={warden:'#6fe08a',sovereign:'#7fd8ff',eclipse:'#b58cff',magma:'#ff6a2a',tide:'#4aa8ff',storm:'#ffe27a'};
 const BNM={warden:'Verdant Warden',sovereign:'Crystal Sovereign',eclipse:'Eclipse Lord',magma:'Magma Colossus',tide:'Abyssal Leviathan',storm:'Tempest Roc'};
 const EPI={warden:'Thorn-Crowned King of the Deep Grove',sovereign:'The Walking Cathedral of Crystal',eclipse:'Tyrant of the Swallowed Sun',magma:'Heart of the Burning Mountain',tide:'Serpent of the Drowned Stars',storm:'Herald of the Thousand Storms'};
 const bdef=id=>{try{return BOSSES.find(b=>b.id==id)||null}catch(_){return null}};

 // ================= AUDIO: music bus (OPT.mv, mute) + sfx bus (OPT.sv), each with a soft reverb send =================
 let AX=null,NB=null;
 function vol(){if(!AX)return;try{const mu=typeof mute!='undefined'&&mute;AX.m.gain.value=mu?0:(OPT.mv==null?.5:+OPT.mv);AX.s.gain.value=OPT.sv==null?1:+OPT.sv}catch(_){}}
 function au(){try{ac();if(!AC||AC.state=='closed')return null;if(AC.state=='suspended'){AC.resume().catch(()=>{});return null}
   if(!AX||AX.a!==AC){const a=AC,m=a.createGain(),s=a.createGain(),mi=a.createGain(),si=a.createGain(),comp=a.createDynamicsCompressor(),len=a.sampleRate*2.4|0,b=a.createBuffer(2,len,a.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(R()*2-1)*Math.pow(1-i/len,2.6)}
    const rv=a.createConvolver(),rv2=a.createConvolver(),wm=a.createGain(),ws=a.createGain(),sx=a.createGain();rv.buffer=b;rv2.buffer=b;wm.gain.value=.4;ws.gain.value=.3;
    comp.threshold.value=-12;comp.ratio.value=3.5;mi.connect(m);mi.connect(rv);rv.connect(wm);wm.connect(m);si.connect(s);sx.connect(rv2);rv2.connect(ws);ws.connect(s);m.connect(comp);s.connect(comp);comp.connect(a.destination);
    AX={a,m,s,mi,si,sx}}
   vol();return AX}catch(_){return null}}
 const nbuf=a=>NB&&NB.sampleRate==a.sampleRate?NB:(NB=(()=>{const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;return b})());
 const dst=(bus,wet)=>bus=='m'?AX.mi:(wet?[AX.si,AX.sx]:[AX.si]);
 const con=(n,d)=>{if(Array.isArray(d))d.forEach(x=>n.connect(x));else n.connect(d)};
 function o(bus,f0,f1,t,d,ty,v,at,det,wet){const a=AX.a,x=a.createOscillator(),g=a.createGain();x.type=ty||'sine';x.frequency.setValueAtTime(f0,t);if(f1&&f1!=f0)x.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d*.95);if(det)x.detune.value=det;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(at||.008));g.gain.exponentialRampToValueAtTime(.0003,t+d);x.connect(g);con(g,dst(bus,wet));x.start(t);x.stop(t+d+.05)}
 function nz(bus,t,d,ty,f0,f1,v,at,q,wet){const a=AX.a,b=a.createBufferSource();b.buffer=nbuf(a);b.loop=true;const f=a.createBiquadFilter();f.type=ty;f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+d);if(q)f.Q.value=q;
  const g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(at||.004));g.gain.exponentialRampToValueAtTime(.0003,t+d);b.connect(f);f.connect(g);con(g,dst(bus,wet));b.start(t,R()*1.5);b.stop(t+d+.05)}
 function stack(fs,t,d,v,ty,c0,c1,c2,at,det){const a=AX.a,f=a.createBiquadFilter();f.type='lowpass';f.Q.value=.6;f.frequency.setValueAtTime(c0,t);f.frequency.linearRampToValueAtTime(c1,t+Math.min(d*.3,.15+at));f.frequency.exponentialRampToValueAtTime(c2,t+d);
  const g=a.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.setValueAtTime(v,t+Math.max(at,d*.6));g.gain.exponentialRampToValueAtTime(.0003,t+d);f.connect(g);g.connect(AX.mi);
  for(const fr of fs)for(const dt of[-det,det]){const x=a.createOscillator();x.type=ty;x.frequency.value=fr;x.detune.value=dt;x.connect(f);x.start(t);x.stop(t+d+.05)}}
 const M=m=>440*Math.pow(2,(m-69)/12);
 const pad=(ms,t,d,v,cut)=>stack(ms.map(M),t,d,v,'sawtooth',cut||800,cut||800,(cut||800)*.8,Math.min(1.1,d*.35),7);
 const brass=(ms,t,d,v)=>stack(ms.map(M),t,d,v,'sawtooth',280,2400,600,.03,9);
 const bell=(m,t,v,d)=>{const f=M(m);o('m',f,f,t,d||2.2,'sine',v,.004);o('m',f*2.76,f*2.76,t,(d||2.2)*.35,'sine',v*.22,.003);o('m',f*5.4,f*5.4,t,.22,'sine',v*.07,.002)};
 const pluck=(m,t,v)=>{const f=M(m);o('m',f,f,t,.7,'triangle',v,.003);o('m',f*2,f*2,t,.25,'sine',v*.3,.002)};
 const lead=(m,t,d,v)=>{const f=M(m);o('m',f,f,t,d,'square',v*.28,.015,-6);o('m',f,f,t,d+.1,'triangle',v,.015,6);o('m',f*2,f*2,t,d*.6,'sine',v*.12,.02)};
 const bass=(m,t,d,v)=>{const f=M(m);o('m',f,f,t,d,'triangle',v,.006);o('m',f*.5,f*.5,t,d,'sine',v*.8,.006)};
 const kick=(t,v)=>{o('m',150,42,t,.32,'sine',v,.002);nz('m',t,.03,'highpass',3000,0,v*.12)};
 const snare=(t,v)=>{nz('m',t,.17,'bandpass',1900,1300,v,.002,.8);o('m',220,160,t,.09,'triangle',v*.4,.002)};
 const hat=(t,v)=>nz('m',t,.045,'highpass',8000,0,v);
 const crash=(t,v)=>nz('m',t,1.7,'highpass',5200,3200,v,.003);
 const taiko=(t,v)=>{o('m',118,46,t,.6,'sine',v,.003);nz('m',t,.14,'lowpass',900,180,v*.5,.002)};
 const boom=(t,v)=>{o('s',82,28,t,1.5,'sine',v,.004);o('s',164,40,t,.45,'triangle',v*.35,.003);nz('s',t,1.2,'lowpass',1400,60,v*.55,.004,0,1)};
 const shing=(t,v)=>{o('s',2400,2650,t,.9,'sine',v*.45,.002,0,1);o('s',3620,3500,t,.6,'sine',v*.25,.002,0,1);nz('s',t,.3,'highpass',7000,0,v*.35)};
 const shatter=(t,v)=>{nz('s',t,1,'highpass',2500,9000,v,.002,0,1);for(let i=0;i<14;i++){const f=1800+R()*4200;o('s',f,f*.96,t+R()*.55,.25+R()*.35,'sine',v*.22,.002,0,1)}};
 const whoosh=(t,d,v)=>nz('s',t,d,'bandpass',300,2800,v,d*.55,1.3,1);
 const riser=(t,d,v)=>{nz('s',t,d,'bandpass',260,7000,v,d*.92,2,1);o('s',160,1300,t,d,'sawtooth',v*.07,d*.92)};
 const thunk=(t,v)=>{o('s',200,95,t,.13,'sine',v,.002);nz('s',t,.05,'lowpass',1500,300,v*.45)};
 const clink=(t,v)=>{o('s',1900,1750,t,.3,'triangle',v*.5,.001,0,1);o('s',3150,3050,t,.2,'sine',v*.3,.001);nz('s',t,.06,'highpass',4000,0,v*.6)};
 const splash=(t,v)=>{o('s',250,640,t,.15,'sine',v*.7,.003);nz('s',t,.4,'lowpass',2400,380,v*.6,.004,0,1)};
 const sfx=(fn,...a)=>{const x=au();if(x)try{fn(x.a.currentTime+.01,...a)}catch(_){}};

 // the score, in "story seconds" (reduced motion plays the same timeline faster)
 function score(){const E=[],at=(t,f)=>E.push([t,f]);
  // 1 World Tree: warm pad, music-box arpeggio, wind
  at(0,t=>{pad([50,57,64,65],t,2.7,.032,750);nz('m',t,4.6,'bandpass',420,900,.022,1.6,.7)});
  at(2.3,t=>pad([46,53,57,62],t,2.6,.032,850));
  [69,74,76,77,76,74,69,72,70,74,77,81,79,77,74,72].forEach((n,i)=>at(.25+i*.27,t=>bell(n,t,.045,1.8)));
  at(1.25,t=>o('m',M(93),M(101),t,.6,'sine',.018,.01));at(3.15,t=>o('m',M(96),M(103),t,.6,'sine',.016,.01));
  // 2 Eclipse: drone swell, timpani, shatter, falling comets
  at(4.6,t=>{stack([M(26),M(33),M(38)],t,4.3,.05,'sawtooth',90,90,620,1.6,6)});
  [4.95,5.6,6.05].forEach(x=>at(x,t=>taiko(t,.16)));at(5.0,t=>pad([46,49,53,58],t,1.5,.03,600));
  at(6.4,t=>{boom(t,.42);shatter(t,.16);crash(t,.09);brass([38,45,50],t,1.7,.07)});
  at(6.6,t=>pad([43,50,55,58],t,1.2,.034,900));at(7.7,t=>pad([45,52,55,61],t,1.15,.034,1000));
  [7.1,7.35,7.6,7.85].forEach(x=>at(x,t=>whoosh(t,.55,.05)));
  // 3 Six shadows: ostinato, taiko per panel, power chords, snare roll
  for(let x=8.8;x<13.4;x+=.2)at(x,t=>{o('m',M(38),M(38),t,.17,'sawtooth',.026,.004);o('m',M(26),M(26),t,.18,'sine',.05,.004)});
  [.38,.6,.82,2.63,2.85,3.07].forEach(x=>at(8.8+x,t=>{taiko(t,.22);crash(t,.025)}));
  [[8.9,[38,45,50]],[11.15,[41,48,53]],[12.3,[43,50,55]],[12.9,[45,52,57]]].forEach(c=>at(c[0],t=>brass(c[1],t,1.1,.06)));
  for(let i=0;i<12;i++)at(13.0+i*.045,t=>snare(t,.02+i*.006));
  // 4 Awakening: heartbeat, descending twinkles, the eye opens, rising notes of hope
  [13.95,14.2,14.95,15.2].forEach((x,i)=>at(x,t=>kick(t,i%2?.07:.1)));
  [93,88,86,81,79,76,74].forEach((n,i)=>at(13.75+i*.19,t=>bell(n,t,.02,1.2)));
  at(15.1,t=>{bell(74,t,.05,2.6);whoosh(t,.8,.03);pad([62,69,74],t,2.6,.02,1400)});
  at(16.2,t=>shing(t,.14));[62,65,69,74].forEach((n,i)=>at(16.95+i*.15,t=>pluck(n,t,.05)));
  // 5 Wings: riser, burst, then the driving beat and the heroic melody
  at(17.6,t=>riser(t,1.02,.07));
  at(18.6,t=>{boom(t,.36);crash(t,.09);brass([41,45,48,53],t,1.9,.07);pad([53,57,60,65,69],t,1.6,.035,1600)});
  [81,84,86,89].forEach((n,i)=>at(18.7+i*.09,t=>bell(n,t,.025,1.4)));
  for(let x=19.5;x<25;x+=.4){at(x,t=>kick(t,.15));at(x+.2,t=>hat(t,.025))}
  for(let x=19.9;x<25;x+=.8)at(x,t=>snare(t,.05));
  const roots=[[19.5,38],[20.3,41],[21.4,46],[22.3,48],[23.2,50],[24.1,53]];
  roots.forEach((r,i)=>{const e=i<5?roots[i+1][0]:25;for(let x=r[0];x<e-.01;x+=.2)at(x,t=>bass(r[1]+((Math.round((x-r[0])/.2))%2?12:0),t,.19,.07))});
  let lt=19.5;[[74,2],[76,1],[77,3],[81,2],[79,2],[77,1],[76,1],[77,2],[79,1],[81,3],[82,2],[84,2],[81,2],[86,3]].forEach(n=>{const s=lt;at(s,t=>lead(n[0],t,n[1]*.2*.95,.05));lt+=n[1]*.2});
  // 6 Montage: an impact per cut, plus the cut's own sounds
  [21.4,22.3,23.2,24.1].forEach(x=>at(x,t=>{crash(t,.04);whoosh(t,.3,.04)}));
  for(let i=0;i<18;i++)at(21.4+.04+i*.042,t=>thunk(t,.07));
  at(22.6,t=>clink(t,.14));at(22.88,t=>{clink(t,.16);nz('s',t,.3,'lowpass',900,200,.08)});
  at(23.48,t=>splash(t,.12));at(24.05,t=>splash(t,.08));at(24.2,t=>whoosh(t,.4,.05));at(24.55,t=>whoosh(t,.4,.05));
  at(24.1,t=>riser(t,1.45,.06));
  // 7 Title: slam, then a shimmering resolve that fades into the home screen
  at(25.55,t=>{boom(t,.5);crash(t,.1);kick(t,.22);brass([38,45,50,53,57],t,2.6,.075);pad([50,57,62,64,65,69],t,4.3,.036,1500)});
  [74,77,81,86,81,77,76,79,83,88,83,79,77,81,86,89].forEach((n,i)=>at(26.0+i*.22,t=>bell(n,t,.03,1.6)));
  at(26.55,t=>o('s',1800,5200,t,.7,'sine',.035,.05,0,1));
  return E.sort((a,b)=>a[0]-b[0])}

 // ================= LAUNCH STORY INTRO =================
 const STORY=[['tree',4.6,'Long ago, the World Tree held up the sky, its roots binding every island to the stars.'],
  ['eclipse',4.2,'Then the Eclipse came. The sky shattered, and the roots fell silent.'],
  ['bosses',4.8,'Six guardians, twisted by the dark, broke loose upon the world.'],
  ['wake',4.0,'Deep beneath the roots, a lone wanderer awoke.'],
  ['wings',3.8,'A spark of fallen starlight became their wings.'],
  ['montage',3.6,'Build. Mine. Fish. Climb. Mend the roots, and raise the sky again.'],
  ['title',5.0,'']];
 let ST=0;for(const s of STORY){s[3]=ST;ST+=s[1]}
 let I=null;const AB={};
 const as=n=>I.as[n]||(I.as[n]=AB[n]());
 function art(w,h,qf,fn){const q=I.q*(qf||1),c=mk(w*q,h*q),x=c.getContext('2d');x.scale(c.width/w,c.height/h);x.lineJoin='round';x.lineCap='round';fn(x,w,h);return{c,w,h}}
 const put=(g,a,x,y,w,h)=>g.drawImage(a.c,x,y,w==null?a.w:w,h==null?a.h:h);
 const putc=(g,a,x,y,s)=>{s=s||1;g.drawImage(a.c,x-a.w*s/2,y-a.h*s/2,a.w*s,a.h*s)};
 function glow(c){const n='gl'+c;return I.as[n]||(I.as[n]=art(128,128,.45,x=>{const gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,rgba(c,1));gr.addColorStop(.2,rgba(c,.5));gr.addColorStop(.5,rgba(c,.13));gr.addColorStop(1,rgba(c,0));x.fillStyle=gr;x.fillRect(0,0,128,128)}))}
 function streak(c){const n='st'+c;return I.as[n]||(I.as[n]=art(420,24,.8,x=>{const gr=x.createLinearGradient(0,0,420,0);gr.addColorStop(0,rgba(c,0));gr.addColorStop(.8,rgba(c,.75));gr.addColorStop(1,'#fff');x.fillStyle=gr;x.beginPath();x.moveTo(0,12);x.lineTo(408,7);x.lineTo(420,12);x.lineTo(408,17);x.closePath();x.fill();const r=x.createRadialGradient(408,12,0,408,12,12);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,rgba(c,0));x.fillStyle=r;x.fillRect(394,0,26,24)}))}
 function drawStreak(g,c,x,y,ang,len,a,th){const s=streak(c);g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=a;g.drawImage(s.c,-len,-(th||10)/2,len,th||10);g.restore()}
 // ---- art: skies, stars, aurora, clouds
 function skyArt(st,neb){return art(1800,1300,.22,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);st.forEach(s=>gr.addColorStop(s[0],s[1]));x.fillStyle=gr;x.fillRect(0,0,w,h);
  for(const n of neb){const r=x.createRadialGradient(n[0],n[1],0,n[0],n[1],n[2]);r.addColorStop(0,rgba(n[3],n[4]));r.addColorStop(1,rgba(n[3],0));x.fillStyle=r;x.fillRect(n[0]-n[2],n[1]-n[2],n[2]*2,n[2]*2)}})}
 AB.sky1=()=>skyArt([[0,'#02041a'],[.28,'#0a0d38'],[.52,'#21195a'],[.72,'#553180'],[.88,'#ad5f8f'],[1,'#ffae7c']],[[500,260,430,'#6a3cc0',.3],[1320,380,380,'#2b8fc8',.22],[900,120,300,'#c04a9a',.15],[300,720,360,'#3a2a90',.25],[900,1300,720,'#ffcf9a',.38],[1150,560,260,'#4fd8ff',.1]]);
 AB.sky7=()=>skyArt([[0,'#060c30'],[.3,'#19226a'],[.55,'#4a3a90'],[.74,'#b2629c'],[.9,'#ff9f86'],[1,'#ffe2a2']],[[800,1300,820,'#fff0c0',.55],[400,300,420,'#5a6ad8',.26],[1300,260,380,'#9a5ad8',.24],[800,700,500,'#ffb0c8',.18]]);
 AB.sky3=()=>art(1600,900,.25,(x,w,h)=>{const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#14020d');gr.addColorStop(.5,'#36081f');gr.addColorStop(1,'#5a1430');x.fillStyle=gr;x.fillRect(0,0,w,h);const r=x.createRadialGradient(800,120,40,800,120,700);r.addColorStop(0,'rgba(255,120,200,.28)');r.addColorStop(1,'rgba(255,120,200,0)');x.fillStyle=r;x.fillRect(0,0,w,h)});
 AB.aurora=()=>art(1800,700,.3,x=>{x.globalCompositeOperation='lighter';const rib=(y0,amp,c1,c2,lw,a)=>{const gr=x.createLinearGradient(0,0,1800,0);gr.addColorStop(0,rgba(c1,0));gr.addColorStop(.3,rgba(c1,a));gr.addColorStop(.7,rgba(c2,a));gr.addColorStop(1,rgba(c2,0));x.strokeStyle=gr;x.lineWidth=lw;x.shadowColor=c1;x.shadowBlur=40;x.beginPath();x.moveTo(0,y0);x.bezierCurveTo(500,y0-amp,1100,y0+amp,1800,y0-amp*.4);x.stroke()};
  rib(320,190,'#4fffd0','#8a6bff',100,.2);rib(400,120,'#5ad8ff','#ff7fd8',46,.2);rib(260,230,'#7affc0','#6a8bff',22,.34)});
 AB.clouds=()=>art(2000,440,.45,(x,w)=>{const gr=x.createLinearGradient(0,40,0,400);gr.addColorStop(0,'#ffc0d8');gr.addColorStop(.3,'#a8649e');gr.addColorStop(.7,'#3a2668');gr.addColorStop(1,'#140f36');const r=srnd(11);x.fillStyle=gr;
  for(let i=0;i<80;i++){const cx=r()*w,cy=170+r()*160+(i%3)*18,rr=46+r()*110;x.beginPath();x.arc(cx,cy,rr,0,TAU);x.fill()}x.fillRect(0,330,w,110)});
 AB.spark=()=>art(64,64,1,x=>{x.translate(32,32);const gr=x.createRadialGradient(0,0,0,0,0,14);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(160,200,255,0)');x.fillStyle=gr;x.beginPath();x.arc(0,0,14,0,TAU);x.fill();x.fillStyle='#fff';for(let i=0;i<4;i++){x.rotate(PI/2);x.beginPath();x.moveTo(0,-31);x.lineTo(2.4,0);x.lineTo(-2.4,0);x.closePath();x.fill()}});
 function stars(g,t,al){g.fillStyle='#fff';for(const s of I.stars){const a=al*s.b*(.55+.45*Math.sin(t*s.sp+s.ph));if(a<.04)continue;g.globalAlpha=a;g.fillRect(s.x,s.y,s.r,s.r)}
  const sp=as('spark');for(const s of I.big){g.globalAlpha=al*(.6+.4*Math.sin(t*1.7+s.ph));const z=s.r*(.85+.15*Math.sin(t*2.3+s.ph));g.drawImage(sp.c,s.x-z/2,s.y-z/2,z,z)}g.globalAlpha=1}
 // ---- art: the World Tree (silhouette + separate glow layer so the veins can pulse, die and return gold)
 function treeGeo(){const r=srnd(42),cx=750,G={roots:[],limbs:[],blobs:[]};const curve=(x0,y0,x1,y1,x2,y2,x3,y3,w0,w1)=>{const p=[];for(let i=0;i<=22;i++){const u=i/22,v=1-u;p.push([v*v*v*x0+3*v*v*u*x1+3*v*u*u*x2+u*u*u*x3,v*v*v*y0+3*v*v*u*y1+3*v*u*u*y2+u*u*u*y3,lerp(w0,w1,u)])}return p};
  for(let i=0;i<13;i++){const s=i%2?1:-1,sx=cx+s*(10+r()*110),reach=260+r()*560,ex=cx+s*reach,ey=1240+r()*70,arch=r()<.5;G.roots.push(curve(sx,1130,sx+s*reach*.3,arch?1060-r()*80:1180,ex-s*reach*.25,arch?1120:1240,ex,ey,46+r()*40,5))}
  const L=[[680,560,560,420,440,330,300,270],[820,560,940,420,1060,330,1200,260],[720,520,700,380,640,260,560,170],[780,520,800,380,860,250,950,160],[750,540,750,380,760,240,750,110],[690,600,560,560,430,520,250,470],[810,600,940,560,1070,520,1250,460]];
  for(const l of L)G.limbs.push(curve(...l,58,9));
  for(let i=0;i<54;i++){const a=r()*TAU,d=Math.sqrt(r()),bx=cx+Math.cos(a)*d*600,by=330+Math.sin(a)*d*230-(1-Math.abs(Math.cos(a)))*40;G.blobs.push([bx,by,70+r()*95*(by<330?1.2:1)])}G.blobs.sort((a,b)=>a[1]-b[1]);
  G.trunk=[[610,1300],[640,1120],[690,860],[680,620],[650,470],[850,470],[820,620],[810,860],[860,1120],[890,1300]];return G}
 function tstroke(x,p,wk,dy){for(let i=1;i<p.length;i++){x.lineWidth=Math.max(1,p[i][2]*wk);x.beginPath();x.moveTo(p[i-1][0],p[i-1][1]+(dy||0));x.lineTo(p[i][0],p[i][1]+(dy||0));x.stroke()}}
 function treeArt(gl){return art(1500,1550,gl?.6:1,x=>{x.translate(0,200);const G=I.tg||(I.tg=treeGeo()),DK='#0b0a22',RIM='#5a58b8';
  if(!gl){x.strokeStyle=RIM;for(const p of G.roots)tstroke(x,p,1,-5);for(const p of G.limbs)tstroke(x,p,1,-5);
   x.strokeStyle=DK;for(const p of G.roots)tstroke(x,p,1,0);for(const p of G.limbs)tstroke(x,p,1,0);
   x.fillStyle=DK;x.beginPath();G.trunk.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.fill();
   x.strokeStyle=RIM;x.lineWidth=4;x.beginPath();x.moveTo(612,1290);x.lineTo(642,1120);x.lineTo(692,860);x.lineTo(682,620);x.lineTo(652,475);x.stroke();
   x.fillStyle=RIM;for(const b of G.blobs){x.beginPath();x.arc(b[0],b[1]-9,b[2],0,TAU);x.fill()}
   x.fillStyle=DK;for(const b of G.blobs){x.beginPath();x.arc(b[0],b[1]+3,b[2],0,TAU);x.fill()}
   const r=srnd(9);x.fillStyle='#16153a';for(let i=0;i<130;i++){const b=G.blobs[(r()*G.blobs.length)|0];x.beginPath();x.arc(b[0]+(r()-.5)*b[2],b[1]+(r()-.5)*b[2]*.8,10+r()*26,PI,TAU);x.fill()}
}
  else{x.globalCompositeOperation='lighter';x.shadowColor='#4fd8ff';x.shadowBlur=14;x.strokeStyle='#8ff8ff';
   for(const p of G.roots.concat(G.limbs)){x.lineWidth=2.6;x.beginPath();p.forEach((q,i)=>{const yy=q[1]-q[2]*.18;i?x.lineTo(q[0],yy):x.moveTo(q[0],yy)});x.stroke()}
   for(let k=0;k<6;k++){x.lineWidth=2;x.beginPath();for(let y=1250;y>480;y-=20){const xx=750+(k-2.5)*30*(0.6+(y-480)/1500)+Math.sin(y*.02+k)*7;y==1250?x.moveTo(xx,y):x.lineTo(xx,y)}x.stroke()}
   const r=srnd(17);for(let i=0;i<170;i++){const b=G.blobs[(r()*G.blobs.length)|0],c=r()<.72?'#a8f8ff':'#ffe08a';x.shadowColor=c;x.fillStyle=c;x.beginPath();x.arc(b[0]+(r()-.5)*b[2]*1.3,b[1]+(r()-.5)*b[2],1.5+r()*3.5,0,TAU);x.fill()}}})}
 AB.tree=()=>treeArt(false);AB.treeG=()=>treeArt(true);
 AB.treeY=()=>{const s=as('treeG'),c=mk(s.c.width,s.c.height),x=c.getContext('2d');x.drawImage(s.c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='#ffbf3a';x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='lighter';x.globalAlpha=.18;x.drawImage(s.c,0,0);return{c,w:s.w,h:s.h}};
 // ---- art: floating islands built from blocks (a nod to the building game underneath)
 function islandArt(w,seed,top){return art(w,w*1.1,1,x=>{const r=srnd(seed),B=w/14,ty=w*.24,h=w*1.1;let L=0,Rr=w,rows=[];
  for(let i=0;i<30;i++){const y=ty+i*B;L+=B*(.25+r()*.95);Rr-=B*(.25+r()*.95);if(Rr-L<B*1.2||y>h-B*1.5)break;rows.push([L,Rr,y])}
  x.strokeStyle='#1c1640';x.lineWidth=Math.max(1.2,w/160);for(let i=0;i<8;i++){const sx=w*.22+r()*w*.56,len=w*(.15+r()*.35),ry=ty+rows.length*B*.6*r();x.beginPath();x.moveTo(sx,ry);x.quadraticCurveTo(sx+(r()-.5)*w*.12,ry+len*.5,sx+(r()-.5)*w*.08,ry+len);x.stroke();if(r()<.5){x.fillStyle='#7ff0ff';x.beginPath();x.arc(sx+(r()-.5)*w*.08,ry+len,w/110,0,TAU);x.fill()}}
  rows.forEach((q,i)=>{const k=i/Math.max(1,rows.length-1);x.fillStyle=mix('#4a3f86','#140f30',k);x.fillRect(q[0],q[2],q[1]-q[0],B+.6);x.fillStyle='rgba(0,0,0,.28)';for(let bx=q[0];bx<q[1];bx+=B)x.fillRect(bx,q[2],Math.max(1,B*.06),B);x.fillRect(q[0],q[2]+B*.92,q[1]-q[0],B*.08);x.fillStyle='rgba(170,160,255,.32)';x.fillRect(q[0],q[2],B*.28,B)});
  x.fillStyle='#2b7d63';x.fillRect(0,ty-B*.7,w,B);x.fillStyle='#7ff0b8';x.fillRect(0,ty-B*.7,w,B*.22);x.fillStyle='rgba(0,0,0,.22)';for(let bx=0;bx<w;bx+=B)x.fillRect(bx,ty-B*.48,Math.max(1,B*.06),B*.78);
  const gy=ty-B*.7;
  if(top=='tree'){x.fillStyle='#1b1335';x.fillRect(w*.6-B*.35,gy-B*3,B*.7,B*3);for(const b of[[.6,-3.6,1.6],[.48,-3.2,1.2],[.72,-3.1,1.2],[.6,-4.5,1.1]]){x.fillStyle='#6fe0a0';x.beginPath();x.arc(w*b[0],gy+B*b[1]-B*.15,B*b[2],0,TAU);x.fill();x.fillStyle='#1f5a4a';x.beginPath();x.arc(w*b[0]+B*.15,gy+B*b[1]+B*.1,B*b[2],0,TAU);x.fill()}}
  else if(top=='house'){const hx0=w*.3,hw=B*4;x.fillStyle='#5a3a46';x.fillRect(hx0,gy-B*2.4,hw,B*2.4);x.fillStyle='#8a3048';x.beginPath();x.moveTo(hx0-B*.5,gy-B*2.4);x.lineTo(hx0+hw/2,gy-B*4.2);x.lineTo(hx0+hw+B*.5,gy-B*2.4);x.closePath();x.fill();x.fillStyle='#ffd36a';x.shadowColor='#ffb84a';x.shadowBlur=12;x.fillRect(hx0+B*.6,gy-B*1.7,B*.9,B*.8);x.fillRect(hx0+B*2.5,gy-B*1.7,B*.9,B*.8);x.shadowBlur=0;x.fillStyle='#2a1a22';x.fillRect(hx0+B*1.55,gy-B*1.3,B*.85,B*1.3)}
  else if(top=='crystal'){x.fillStyle='#7fd8ff';x.shadowColor='#7fd8ff';x.shadowBlur=10;for(const c of[[.5,3],[.42,2],[.6,2.2]]){x.beginPath();x.moveTo(w*c[0]-B*.4,gy);x.lineTo(w*c[0],gy-B*c[1]);x.lineTo(w*c[0]+B*.4,gy);x.closePath();x.fill()}x.shadowBlur=0}})}
 AB.isl0=()=>islandArt(300,3,'house');AB.isl1=()=>islandArt(320,8,'tree');AB.isl2=()=>islandArt(180,13,'crystal');AB.isl3=()=>islandArt(150,21,'tree');AB.isl4=()=>islandArt(120,27,'');
 AB.fg=()=>art(1800,520,.8,x=>{const r=srnd(31);const root=(pts,w)=>{x.lineWidth=w;x.beginPath();x.moveTo(pts[0],pts[1]);x.bezierCurveTo(pts[2],pts[3],pts[4],pts[5],pts[6],pts[7]);x.stroke()};
  const RT=[[-60,520,80,300,260,330,520,560],[-60,420,150,330,300,420,420,560],[0,560,120,400,180,240,90,120],[1860,520,1700,300,1500,330,1260,560],[1860,430,1660,360,1500,430,1380,560],[1800,560,1680,420,1640,260,1730,140]];
  x.strokeStyle='#3d3a86';x.lineCap='round';x.save();x.translate(0,-6);RT.forEach((p,i)=>root(p,i%3==2?26:52));x.restore();x.strokeStyle='#04030c';RT.forEach((p,i)=>root(p,i%3==2?26:52));
  for(let i=0;i<16;i++){const lx=r()<.5?40+r()*380:1380+r()*380,ly=400+r()*120;x.fillStyle='#0a0718';x.fillRect(lx-2,ly,4,14);x.fillStyle=r()<.5?'#7ff0ff':'#b58cff';x.shadowColor=x.fillStyle;x.shadowBlur=14;x.beginPath();x.ellipse(lx,ly,9,5,0,PI,TAU);x.fill();x.shadowBlur=0}});
 // ---- art: the Eclipse, its corona, crack lines and falling sky shards
 AB.sun=()=>art(400,400,.6,x=>{const r=x.createRadialGradient(200,200,40,200,200,200);r.addColorStop(0,'rgba(255,255,240,1)');r.addColorStop(.3,'rgba(255,220,140,.55)');r.addColorStop(1,'rgba(255,170,90,0)');x.fillStyle=r;x.fillRect(0,0,400,400);x.fillStyle='#fffdf0';x.beginPath();x.arc(200,200,62,0,TAU);x.fill()});
 AB.corona=()=>art(900,900,.5,x=>{const r=srnd(3);x.translate(450,450);for(let i=0;i<80;i++){const a=i/80*TAU+r()*.05,l=140+r()*300,w=.012+r()*.03;x.fillStyle=i%2?'rgba(255,214,120,.55)':'rgba(200,150,255,.45)';x.beginPath();x.moveTo(Math.cos(a-w)*64,Math.sin(a-w)*64);x.lineTo(Math.cos(a)*l,Math.sin(a)*l);x.lineTo(Math.cos(a+w)*64,Math.sin(a+w)*64);x.closePath();x.fill()}
  x.globalCompositeOperation='destination-in';const m=x.createRadialGradient(0,0,60,0,0,450);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(-450,-450,900,900);x.globalCompositeOperation='lighter';x.shadowColor='#ffe2a0';x.shadowBlur=26;x.strokeStyle='#fff6dc';x.lineWidth=5;x.beginPath();x.arc(0,0,64,0,TAU);x.stroke()});
 function crackGen(){const r=srnd(5),B=[];const grow=(x,y,a,len,d)=>{const p=[[x,y]];let L=0;while(L<len){const st=18+r()*26;a+=(r()-.5)*.7;x+=Math.cos(a)*st;y+=Math.sin(a)*st;L+=st;p.push([x,y]);if(d<2&&r()<.13)grow(x,y,a+(r()<.5?-1:1)*(.5+r()*.6),len*.4*(1-L/len)+60,d+1)}B.push({p,d})};
  for(let i=0;i<10;i++){const a=i/10*TAU+r()*.4;grow(Math.cos(a)*70,Math.sin(a)*70,a,560+r()*560,0)}return B}
 function cracks(g,f,cx,cy,a){g.save();g.translate(cx,cy);g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
  for(const ps of[[10,'rgba(255,80,200,'+(.26*a)+')'],[2.6,'rgba(255,240,255,'+(.95*a)+')']]){g.lineWidth=ps[0];g.strokeStyle=ps[1];g.beginPath();for(const b of I.cr){const n=Math.floor(b.p.length*cl(f*1.5-b.d*.32,0,1));if(n<2)continue;g.moveTo(b.p[0][0],b.p[0][1]);for(let i=1;i<n;i++)g.lineTo(b.p[i][0],b.p[i][1])}g.stroke()}g.restore()}
 function shardGen(){const r=srnd(77),S=[];for(let i=0;i<26;i++){const b=I.cr[(r()*I.cr.length)|0],q=b.p[(r()*b.p.length)|0],n=3+(r()*3|0),sz=16+r()*46,pts=[];for(let k=0;k<n;k++){const a=k/n*TAU+r()*.6;pts.push([Math.cos(a)*sz*(.6+r()*.5),Math.sin(a)*sz*(.6+r()*.5)])}
  S.push({x:q[0],y:q[1],vx:(q[0])*.25+(r()-.5)*60,vy:-40+r()*90,a:r()*6,va:(r()-.5)*5,pts,dl:r()*.35})}return S}
 // ---- art: the six guardians as rim-lit silhouettes (each in a 420x520 box, feet at the bottom)
 const poly=(x,...p)=>{x.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)x.lineTo(p[i],p[i+1]);x.closePath()};
 const SH={
  warden:x=>{x.beginPath();x.moveTo(36,505);x.bezierCurveTo(14,330,90,196,210,196);x.bezierCurveTo(330,196,406,330,384,505);x.closePath();for(let i=-2;i<=2;i++){const bx=210+i*48,by=212+Math.abs(i)*12;poly(x,bx-21,by,bx+i*7,118+Math.abs(i)*26-(i?0:24),bx+21,by)}
   x.moveTo(40,505);x.quadraticCurveTo(-4,470,10,410);x.quadraticCurveTo(30,452,64,474);x.closePath();x.moveTo(380,505);x.quadraticCurveTo(424,470,410,410);x.quadraticCurveTo(390,452,356,474);x.closePath()},
  sovereign:x=>{x.beginPath();poly(x,166,505,188,360,206,360,196,505);poly(x,254,505,232,360,214,360,224,505);poly(x,146,362,274,362,304,228,252,168,168,168,116,228);poly(x,120,232,56,150,36,252,100,302);poly(x,300,232,364,150,384,252,320,302);
   poly(x,56,150,88,52,112,172);poly(x,364,150,332,52,308,172);poly(x,100,300,66,430,94,440,126,310);poly(x,320,300,354,430,326,440,294,310);poly(x,178,170,172,118,210,92,248,118,242,170);poly(x,180,112,190,34,206,100);poly(x,206,96,214,10,226,96);poly(x,232,112,246,40,240,104)},
  eclipse:x=>{x.beginPath();x.moveTo(146,505);x.lineTo(174,262);x.quadraticCurveTo(210,200,246,262);x.lineTo(274,505);x.closePath();x.moveTo(172,252);x.quadraticCurveTo(166,166,210,146);x.quadraticCurveTo(254,166,248,252);x.closePath();
   for(const s of[-1,1])for(let i=0;i<6;i++){const a=-.95+i*.33,L=215-i*14,bx=210+s*28,by=272;x.moveTo(bx,by);x.lineTo(bx+s*Math.cos(a)*L,by+Math.sin(a)*L);x.lineTo(bx+s*Math.cos(a+.2)*L*.78,by+Math.sin(a+.2)*L*.78);x.closePath()}},
  magma:x=>{x.beginPath();poly(x,118,505,140,378,280,378,302,505);x.moveTo(86,392);x.quadraticCurveTo(56,236,130,186);x.lineTo(290,186);x.quadraticCurveTo(364,236,334,392);x.closePath();x.moveTo(176,200);x.quadraticCurveTo(170,136,210,130);x.quadraticCurveTo(250,136,244,200);x.closePath();
   x.moveTo(110,206);x.quadraticCurveTo(26,258,38,382);x.lineTo(92,382);x.quadraticCurveTo(96,300,132,258);x.closePath();x.moveTo(310,206);x.quadraticCurveTo(394,258,382,382);x.lineTo(328,382);x.quadraticCurveTo(324,300,288,258);x.closePath();poly(x,14,372,112,368,118,456,10,452);poly(x,308,368,406,372,410,452,302,456)},
  tide:x=>{x.beginPath();x.moveTo(52,525);x.bezierCurveTo(30,380,336,384,304,250);x.bezierCurveTo(288,178,232,148,200,168);x.lineTo(146,126);x.lineTo(112,174);x.lineTo(168,214);x.bezierCurveTo(232,232,244,300,222,332);x.bezierCurveTo(170,424,148,452,172,525);x.closePath();
   poly(x,292,296,368,262,302,334);poly(x,252,382,338,392,252,414);poly(x,202,170,236,94,218,178);poly(x,150,128,128,80,170,140)},
  storm:x=>{x.beginPath();x.moveTo(210,148);x.quadraticCurveTo(252,200,242,330);x.lineTo(210,424);x.lineTo(178,330);x.quadraticCurveTo(168,200,210,148);x.closePath();x.moveTo(188,162);x.quadraticCurveTo(210,108,236,150);x.lineTo(266,170);x.lineTo(232,172);x.closePath();poly(x,198,128,182,64,212,118,216,52,224,122);
   for(const s of[-1,1]){x.moveTo(210+s*14,196);x.quadraticCurveTo(210+s*120,84,210+s*208,128);for(let i=0;i<7;i++){const u=1-i/7,fx=210+s*(30+u*178),fy=190+(1-u)*60;x.lineTo(fx,fy+42);x.lineTo(fx-s*13,fy+8)}x.lineTo(210+s*14,262);x.closePath()}poly(x,194,400,166,505,210,452,254,505,226,400)}};
 const EY={warden:[[160,330,13,.35],[260,330,13,-.35]],sovereign:[[197,136,6,0],[223,136,6,0]],eclipse:[[199,216,6,0],[221,216,6,0]],magma:[[196,168,7,.2],[224,168,7,-.2]],tide:[[166,160,10,.3]],storm:[[224,142,7,-.2]]};
 const DET={eclipse:(x,c)=>{x.save();x.globalCompositeOperation='destination-over';x.shadowColor='#ffd36a';x.shadowBlur=24;x.strokeStyle='#ffd36a';x.lineWidth=6;x.beginPath();x.arc(210,196,74,0,TAU);x.stroke();x.restore()},
  magma:(x,c)=>{x.save();SH.magma(x);x.clip();x.globalCompositeOperation='lighter';x.shadowColor='#ff6a2a';x.shadowBlur=12;x.strokeStyle='#ffb04a';x.lineWidth=3;const r=srnd(4);for(let i=0;i<9;i++){let px=110+r()*200,py=200+r()*260;x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++){px+=(r()-.5)*44;py+=10+r()*22;x.lineTo(px,py)}x.stroke()}x.restore()},
  tide:(x,c)=>{x.save();x.strokeStyle='#123a6a';x.lineWidth=3;x.beginPath();x.moveTo(140,124);x.quadraticCurveTo(108,70,96,96);x.stroke();x.globalCompositeOperation='lighter';x.shadowColor=c;x.shadowBlur=20;x.fillStyle='#bfe8ff';x.beginPath();x.arc(96,98,9,0,TAU);x.fill();x.strokeStyle=rgba(c,.8);x.lineWidth=4;for(let i=0;i<3;i++){x.beginPath();for(let px=0;px<=420;px+=10){const py=482+i*14+Math.sin(px*.05+i*2)*6;px?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}x.restore()},
  storm:(x,c)=>{x.save();x.globalCompositeOperation='lighter';x.shadowColor=c;x.shadowBlur=16;x.strokeStyle='#fff6c0';x.lineWidth=3;for(const b of[[30,40,1],[380,60,-1],[60,300,1]]){let px=b[0],py=b[1];x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++){px+=b[2]*(8+k*3);py+=22;x.lineTo(px,py);px-=b[2]*10;x.lineTo(px,py+4)}x.stroke()}x.restore()},
  sovereign:(x,c)=>{x.save();SH.sovereign(x);x.clip();x.globalCompositeOperation='lighter';x.strokeStyle=rgba(c,.55);x.lineWidth=1.6;for(const l of[[210,170,160,360],[210,170,260,360],[116,228,304,228],[150,300,270,300],[56,150,100,302],[364,150,320,302]]){x.beginPath();x.moveTo(l[0],l[1]);x.lineTo(l[2],l[3]);x.stroke()}x.restore()},
  warden:(x,c)=>{x.save();SH.warden(x);x.clip();x.globalCompositeOperation='lighter';const r=srnd(12);for(let i=0;i<26;i++){x.fillStyle=rgba(c,.5);x.beginPath();x.arc(60+r()*300,260+r()*240,2+r()*5,0,TAU);x.fill()}x.restore()}};
 function silArt(id){const c=BC[id],S=SH[id];return art(420,540,1,x=>{x.translate(0,10);x.save();x.shadowColor=c;x.shadowBlur=30;x.fillStyle=mix(c,'#ffffff',.3);S(x);x.fill();x.restore();
  x.save();S(x);x.clip();x.fillStyle='#07040d';x.translate(7,6);S(x);x.fill();x.restore();try{DET[id](x,c)}catch(_){}
  x.globalCompositeOperation='lighter';for(const e of EY[id]){x.save();x.translate(e[0],e[1]);x.rotate(e[3]);x.shadowColor=c;x.shadowBlur=16;x.fillStyle='#fff';x.beginPath();x.ellipse(0,0,e[2],e[2]*.42,0,0,TAU);x.fill();x.restore()}})}
 function pbgArt(id){const c=BC[id];return art(620,900,.35,x=>{const gr=x.createLinearGradient(0,0,0,900);gr.addColorStop(0,'#050208');gr.addColorStop(.55,mix('#000000',c,.3));gr.addColorStop(1,'#0a0410');x.fillStyle=gr;x.fillRect(0,0,620,900);x.globalCompositeOperation='lighter';
  const rg=x.createRadialGradient(310,430,10,310,430,440);rg.addColorStop(0,rgba(c,.6));rg.addColorStop(1,rgba(c,0));x.fillStyle=rg;x.fillRect(0,0,620,900);const r=srnd(id.length*31+7);x.fillStyle=rgba(c,.24);
  for(let i=0;i<64;i++){const a=r()*TAU,r0=160+r()*70,w=.004+r()*.012;x.beginPath();x.moveTo(310+Math.cos(a)*r0,430+Math.sin(a)*r0);x.lineTo(310+Math.cos(a-w)*700,430+Math.sin(a-w)*700);x.lineTo(310+Math.cos(a+w)*700,430+Math.sin(a+w)*700);x.closePath();x.fill()}})}
 BIDS.forEach(id=>{AB['sil_'+id]=()=>silArt(id);AB['pbg_'+id]=()=>pbgArt(id)});
 // ---- art: the root cave, the player's portrait (SHOWART) and the wings
 AB.cave=()=>art(1600,900,.7,x=>{const gr=x.createLinearGradient(0,0,0,900);gr.addColorStop(0,'#010309');gr.addColorStop(.6,'#03161e');gr.addColorStop(1,'#062628');x.fillStyle=gr;x.fillRect(0,0,1600,900);const r=srnd(55);
  const glowR=x.createRadialGradient(800,700,20,800,700,620);glowR.addColorStop(0,'rgba(60,200,190,.22)');glowR.addColorStop(1,'rgba(60,200,190,0)');x.fillStyle=glowR;x.fillRect(0,0,1600,900);
  const arch=(p,w)=>{x.lineWidth=w;x.beginPath();x.moveTo(p[0],p[1]);x.bezierCurveTo(p[2],p[3],p[4],p[5],p[6],p[7]);x.stroke()};
  const A=[[-100,240,400,-60,1200,-60,1700,260],[-100,520,250,200,520,40,900,-40],[1700,560,1350,240,1100,60,700,-40],[-60,900,120,620,60,380,-40,260],[1660,900,1480,640,1560,380,1660,260],[200,900,380,760,620,820,800,760],[1400,900,1220,760,980,820,800,760]];
  x.strokeStyle='#0d4848';x.save();x.translate(0,-5);A.forEach((p,i)=>arch(p,i<3?90-i*14:60));x.restore();x.strokeStyle='#010507';A.forEach((p,i)=>arch(p,i<3?90-i*14:60));
  for(const c of[[180,820,1],[1420,800,1.2],[300,600,.6],[1300,560,.7]]){for(let k=0;k<4;k++){const h=(60+r()*90)*c[2],bx=c[0]+(k-1.5)*26*c[2],lean=(r()-.5)*.6;x.save();x.translate(bx,c[1]);x.rotate(lean);const cg=x.createLinearGradient(0,-h,0,0);cg.addColorStop(0,'#d8fbff');cg.addColorStop(1,'#1a7a9a');x.fillStyle=cg;x.shadowColor='#4fd8ff';x.shadowBlur=18;x.beginPath();x.moveTo(-12*c[2],0);x.lineTo(0,-h);x.lineTo(12*c[2],0);x.closePath();x.fill();x.restore()}}
  for(let i=0;i<140;i++){const mx=r()*1600,my=640+r()*260,c=r()<.7?'#5fffd0':'#7fb8ff';x.fillStyle=c;x.shadowColor=c;x.shadowBlur=8;x.globalAlpha=.4+r()*.6;x.beginPath();x.arc(mx,my,1+r()*2.6,0,TAU);x.fill()}x.globalAlpha=1;x.shadowBlur=0;
  for(let i=0;i<9;i++){const mx=120+r()*1360,my=700+r()*150,s=.6+r()*.8;x.fillStyle='#04120f';x.fillRect(mx-2*s,my,4*s,16*s);x.fillStyle='#62ffe0';x.shadowColor='#62ffe0';x.shadowBlur=14;x.beginPath();x.ellipse(mx,my,13*s,7*s,0,PI,TAU);x.fill();x.shadowBlur=0}
  x.fillStyle='#020a0c';x.beginPath();x.ellipse(800,800,420,70,0,0,TAU);x.fill()});
 AB.bust=()=>{const q=I.q,w=700,h=820,c=mk(w*q,h*q),x=c.getContext('2d');let ok=false;try{SHOWART.draw(x,c.width,c.height,{t:.4,wpn:'fist',wings:false,dy:30*q});ok=true}catch(e){}
  if(!ok){x.scale(q,q);x.fillStyle='#0a0814';x.beginPath();x.arc(350,300,120,0,TAU);x.fill();x.beginPath();x.moveTo(170,820);x.quadraticCurveTo(190,470,350,440);x.quadraticCurveTo(510,470,530,820);x.fill()}return{c,w,h}};
 function bustTint(dark,rim,ra){const s=as('bust'),c=mk(s.c.width,s.c.height),x=c.getContext('2d');x.drawImage(s.c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=dark;x.fillRect(0,0,c.width,c.height);
  const r=x.createRadialGradient(c.width*.42,-c.height*.05,0,c.width*.42,-c.height*.05,c.height*.9);r.addColorStop(0,rgba(rim,ra));r.addColorStop(1,rgba(rim,0));x.fillStyle=r;x.fillRect(0,0,c.width,c.height);return{c,w:s.w,h:s.h}}
 AB.bustD=()=>bustTint('rgba(2,16,24,.66)','#7ff0ff',.55);AB.bustL=()=>bustTint('rgba(30,20,60,.18)','#fff4d0',.5);
 AB.wing=()=>art(1300,860,1,x=>{try{x.translate(650,560);const sc=7.6;x.scale(sc,sc);WingArt.draw(x,0,0,0,1,1.3,0,0,0,1,null,0,{ds:Math.min(12,sc*I.q)})}catch(e){}});
 AB.flyer=()=>art(300,260,1,x=>{try{x.save();x.translate(150,128);x.scale(2.6,2.6);WingArt.draw(x,0,0,0,1,1,0,0,0,1,null,0,{ds:Math.min(8,2.6*I.q)});x.restore()}catch(e){}
  // a slim anime silhouette rising with one arm reaching up and a scarf streaming below
  const body=()=>{x.beginPath();x.ellipse(150,86,15,17,0,0,TAU);poly(x,135,84,128,62,142,72,146,56,154,70,166,58,164,76,172,70,166,90);
   x.moveTo(139,101);x.quadraticCurveTo(150,97,161,101);x.quadraticCurveTo(166,124,158,146);x.lineTo(142,146);x.quadraticCurveTo(134,124,139,101);
   x.moveTo(143,144);x.quadraticCurveTo(138,170,141,204);x.lineTo(148,204);x.quadraticCurveTo(149,172,151,146);x.closePath();x.moveTo(150,146);x.quadraticCurveTo(158,170,164,198);x.lineTo(170,195);x.quadraticCurveTo(164,168,158,144);x.closePath();
   x.moveTo(158,104);x.quadraticCurveTo(170,80,176,40);x.lineTo(183,42);x.quadraticCurveTo(178,84,163,110);x.closePath();x.moveTo(141,104);x.quadraticCurveTo(126,118,124,140);x.lineTo(130,141);x.quadraticCurveTo(134,122,146,110);x.closePath();
   x.moveTo(140,100);x.bezierCurveTo(120,130,128,170,96,214);x.bezierCurveTo(120,186,126,150,152,104);x.closePath()};
  x.fillStyle='#d6fbff';x.save();x.translate(-2,-2);body();x.fill();x.restore();x.fillStyle='#0a0718';body();x.fill()});
 AB.rays=()=>art(1000,1000,.5,x=>{x.translate(500,500);for(let i=0;i<40;i++){const a=i/40*TAU,w=i%2?.035:.06;x.fillStyle=i%2?'rgba(255,240,200,.5)':'rgba(255,255,255,.85)';x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a-w)*500,Math.sin(a-w)*500);x.lineTo(Math.cos(a+w)*500,Math.sin(a+w)*500);x.closePath();x.fill()}
  x.globalCompositeOperation='destination-in';const m=x.createRadialGradient(0,0,0,0,0,500);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=m;x.fillRect(-500,-500,1000,1000)});
 AB.speed=()=>art(1600,900,.5,x=>{const r=srnd(19);x.fillStyle='#fff';for(let i=0;i<170;i++){const a=r()*TAU,r0=300+r()*260,w=.003+r()*.007;x.globalAlpha=.35+r()*.6;x.beginPath();x.moveTo(800+Math.cos(a)*r0,450+Math.sin(a)*r0*.7);x.lineTo(800+Math.cos(a-w)*1200,450+Math.sin(a-w)*1200);x.lineTo(800+Math.cos(a+w)*1200,450+Math.sin(a+w)*1200);x.closePath();x.fill()}});
 AB.vlines=()=>art(1600,900,.4,x=>{const r=srnd(23);x.fillStyle='#fff';for(let i=0;i<110;i++){x.globalAlpha=.15+r()*.5;const lx=r()*1600,ly=r()*900,l=150+r()*600,w=1+r()*3.5;for(const o of[-900,0,900])x.fillRect(lx,ly-l/2+o,w,l)}});
 AB.face=()=>{const sk=(()=>{try{return/^#[0-9a-f]{6}$/i.test(cel.ap.skinCol)?cel.ap.skinCol:'#f1c9a0'}catch(_){return'#f1c9a0'}})();return art(1600,900,.25,x=>{const base=mix(sk,'#0a2a34',.55),lit=mix(sk,'#bff6ff',.25);const r=x.createRadialGradient(1150,120,40,900,450,1100);r.addColorStop(0,lit);r.addColorStop(.5,base);r.addColorStop(1,mix(base,'#000000',.6));x.fillStyle=r;x.fillRect(0,0,1600,900)})};
 // ---- art: montage (blocks, mine wall, moonlit lake, koi)
 AB.blk=()=>art(54*6,54,1,x=>{const T=54,px=(i,b,hi,lo,fn)=>{x.save();x.translate(i*T,0);x.fillStyle=b;x.fillRect(0,0,T,T);x.fillStyle=hi;x.fillRect(0,0,T,5);x.fillRect(0,0,5,T);x.fillStyle=lo;x.fillRect(0,T-5,T,5);x.fillRect(T-5,0,5,T);if(fn)fn();x.strokeStyle='rgba(20,10,30,.6)';x.lineWidth=2;x.strokeRect(1,1,T-2,T-2);x.restore()};
  px(0,'#8a5a3a','#a9744c','#5e3c26',()=>{x.fillStyle='#4fc06a';x.fillRect(0,0,T,15);x.fillStyle='#8ff09a';x.fillRect(0,0,T,4);for(let i=0;i<6;i++){x.fillStyle='#4fc06a';x.fillRect(i*9+2,15,4,4+(i%3)*3)}});
  px(1,'#b9824e','#d9a066','#8a5a32',()=>{x.fillStyle='#7a4e2a';x.fillRect(0,17,T,2);x.fillRect(0,35,T,2);x.fillRect(20,0,2,17);x.fillRect(38,19,2,16);x.fillRect(12,37,2,17)});
  px(2,'#8d8f9e','#b4b6c4','#62646f',()=>{x.fillStyle='#6f717d';x.fillRect(8,10,14,9);x.fillRect(30,28,16,10);x.fillRect(12,38,10,8)});
  px(3,'#9fdcf0','#e8fbff','#6aaed0',()=>{x.fillStyle='rgba(255,255,255,.75)';x.fillRect(12,10,6,22);x.fillRect(22,10,4,10)});
  px(4,'#c0394e','#e86a78','#8a2232',()=>{x.fillStyle='#a02a3e';for(let k=0;k<3;k++)x.fillRect(0,k*18+12,T,3)});
  px(5,'#6b4426','#8a5a34','#4a2c16',()=>{x.fillStyle='#ffd36a';x.fillRect(16,14,22,18);x.fillStyle='#fff3c0';x.fillRect(20,18,7,7)})});
 function blk(g,i,x,y,w,h){const s=as('blk'),q=s.c.width/324;g.drawImage(s.c,i*54*q,0,54*q,54*q,x,y,w,h==null?w:h)}
 AB.m1=()=>art(1600,900,.35,x=>{const gr=x.createLinearGradient(0,0,0,900);gr.addColorStop(0,'#3a2f86');gr.addColorStop(.45,'#c0609a');gr.addColorStop(.75,'#ff9f78');gr.addColorStop(1,'#ffd9a0');x.fillStyle=gr;x.fillRect(0,0,1600,900);const s=x.createRadialGradient(1200,560,20,1200,560,420);s.addColorStop(0,'rgba(255,250,220,1)');s.addColorStop(.12,'rgba(255,230,170,.8)');s.addColorStop(1,'rgba(255,200,150,0)');x.fillStyle=s;x.fillRect(0,0,1600,900);
  x.fillStyle='rgba(90,50,110,.55)';for(const i of[[180,330,140],[420,250,90],[1430,300,120],[1000,200,70]]){x.beginPath();x.moveTo(i[0]-i[2],i[1]);x.lineTo(i[0]+i[2],i[1]);x.lineTo(i[0]+i[2]*.3,i[1]+i[2]*.9);x.lineTo(i[0]-i[2]*.4,i[1]+i[2]*.7);x.closePath();x.fill()}});
 AB.m2=()=>art(1600,900,.7,x=>{const T=108,r=srnd(61);for(let gy=-T/2;gy<900;gy+=T)for(let gx=-20;gx<1600;gx+=T){const v=r();x.fillStyle=mix('#3a3d4f','#5a5d70',v);x.fillRect(gx,gy,T,T);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(gx,gy,T,8);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(gx,gy+T-8,T,8);x.fillRect(gx+T-6,gy,6,T);
   x.fillStyle='rgba(0,0,0,.25)';x.fillRect(gx+20+v*30,gy+30,24,16);x.fillRect(gx+60-v*20,gy+66,30,14);
   if(r()<.18){const c=r()<.6?'#7ff6ff':'#ffd36a';x.fillStyle=c;x.shadowColor=c;x.shadowBlur=14;for(let k=0;k<4;k++){const ox=gx+20+r()*68,oy=gy+20+r()*68;x.beginPath();x.moveTo(ox,oy-10);x.lineTo(ox+7,oy);x.lineTo(ox,oy+10);x.lineTo(ox-7,oy);x.closePath();x.fill()}x.shadowBlur=0}}
  const v=x.createRadialGradient(800,430,100,800,450,900);v.addColorStop(0,'rgba(255,190,120,.18)');v.addColorStop(.5,'rgba(0,0,0,.2)');v.addColorStop(1,'rgba(0,0,0,.85)');x.fillStyle=v;x.fillRect(0,0,1600,900)});
 AB.m3=()=>art(1600,900,.45,x=>{const gr=x.createLinearGradient(0,0,0,520);gr.addColorStop(0,'#050a26');gr.addColorStop(1,'#25306a');x.fillStyle=gr;x.fillRect(0,0,1600,520);const r=srnd(88);x.fillStyle='#fff';for(let i=0;i<120;i++){x.globalAlpha=.3+r()*.7;x.fillRect(r()*1600,r()*450,1.5+r()*1.5,1.5+r()*1.5)}x.globalAlpha=1;
  const mg=x.createRadialGradient(1180,190,30,1180,190,260);mg.addColorStop(0,'rgba(220,235,255,.65)');mg.addColorStop(1,'rgba(220,235,255,0)');x.fillStyle=mg;x.fillRect(800,0,800,500);x.fillStyle='#f4f8ff';x.beginPath();x.arc(1180,190,58,0,TAU);x.fill();
  x.fillStyle='#0a0e26';x.beginPath();x.moveTo(0,520);for(let px=0;px<=1600;px+=40)x.lineTo(px,500-Math.abs(Math.sin(px*.004))*60-r()*14);x.lineTo(1600,520);x.closePath();x.fill();for(let i=0;i<7;i++){x.fillStyle='#ffd36a';x.shadowColor='#ffb84a';x.shadowBlur=10;x.fillRect(120+r()*1300,486+r()*14,4,4)}x.shadowBlur=0;
  const wg=x.createLinearGradient(0,520,0,900);wg.addColorStop(0,'#18234f');wg.addColorStop(1,'#050816');x.fillStyle=wg;x.fillRect(0,520,1600,380);x.fillStyle='rgba(230,240,255,.5)';for(let y=530;y<900;y+=9){const w=30+(y-520)*.5*r();x.globalAlpha=.15+.5*(1-(y-520)/380);x.fillRect(1180-w/2+(r()-.5)*20,y,w,2.2)}x.globalAlpha=1});
 AB.koi=()=>art(240,120,1,x=>{x.translate(120,60);x.shadowColor='#ffb84a';x.shadowBlur=22;const gr=x.createLinearGradient(-80,0,80,0);gr.addColorStop(0,'#ff7a3a');gr.addColorStop(.6,'#ffd36a');gr.addColorStop(1,'#fff3c8');x.fillStyle=gr;x.beginPath();x.ellipse(10,0,66,24,0,0,TAU);x.fill();x.beginPath();x.moveTo(-50,0);x.lineTo(-104,-30);x.quadraticCurveTo(-88,0,-104,30);x.closePath();x.fill();
  x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(0,-22);x.quadraticCurveTo(20,-44,40,-20);x.closePath();x.fill();x.fillStyle='#1a1020';x.beginPath();x.arc(56,-6,4.5,0,TAU);x.fill();x.fillStyle='rgba(255,90,60,.6)';for(const s of[[-10,-6],[14,8],[30,-10]]){x.beginPath();x.arc(s[0],s[1],8,0,TAU);x.fill()}});
 AB.vig=()=>{const c=mk(320,180),x=c.getContext('2d'),r=x.createRadialGradient(160,90,40,160,90,190);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(.7,'rgba(0,0,0,.25)');r.addColorStop(1,'rgba(0,0,0,.75)');x.fillStyle=r;x.fillRect(0,0,320,180);return{c,w:320,h:180}};
 // ---- art: title letters
 AB.title=()=>{const txt='ROOTBOUND',F='700 210px '+SERIF,tc=mk(10,10).getContext('2d');tc.font=F;const ws=[...txt].map(ch=>tc.measureText(ch).width),gap=10,tot=ws.reduce((a,b)=>a+b,0)+gap*(txt.length-1);let cx=-tot/2;
  const L=[...txt].map((ch,i)=>{const w=ws[i],a=art(w+90,300,1,x=>{x.font=F;x.textAlign='center';x.textBaseline='middle';const gr=x.createLinearGradient(0,70,0,230);gr.addColorStop(0,'#fffaf0');gr.addColorStop(.5,'#ffd77a');gr.addColorStop(1,'#c3822a');
   x.shadowColor='rgba(255,200,110,.9)';x.shadowBlur=36;x.lineWidth=10;x.strokeStyle='#1a0f2e';x.strokeText(ch,(w+90)/2,156);x.shadowBlur=0;x.fillStyle=gr;x.fillText(ch,(w+90)/2,156);x.lineWidth=1.5;x.strokeStyle='rgba(255,255,255,.7)';x.strokeText(ch,(w+90)/2,156)});const o={a,x:cx+w/2};cx+=w+gap;return o});
  const word=art(tot+90,300,.6,x=>{x.font=F;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';let px=45;[...txt].forEach((ch,i)=>{x.fillText(ch,px+ws[i]/2,156);px+=ws[i]+gap})});return{L,word,tot}};
 AB.band=()=>art(260,300,.5,x=>{const gr=x.createLinearGradient(0,0,260,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,260,300)});
 // which assets each scene needs (pre-built one per frame, a scene ahead of time)
 const NEED=[['sky1','spark','aurora','clouds','tree','treeG','isl2','isl3','isl4','isl0','isl1','fg'],['sun','corona'],['sky3','sil_warden','pbg_warden','sil_sovereign','pbg_sovereign','sil_eclipse','pbg_eclipse','sil_magma','pbg_magma','sil_tide','pbg_tide','sil_storm','pbg_storm'],['cave','face','bust','bustD'],['bustL','wing','rays','speed','vlines','flyer'],['blk','m1','m2','m3','koi','sky7','treeY'],['title','band']];
 // ---- camera: (cx,cy) of the 1600x900 stage at zoom z, with parallax depth p
 function cam(g,cx,cy,z,p){p=p==null?1:p;const Z=1+(z-1)*p,X=800+(cx-800)*p,Y=450+(cy-450)*p,s=I.s*Z;g.setTransform(s,0,0,s,I.cw/2-X*s+I.shx,I.ch/2-Y*s+I.shy)}
 const stage=g=>cam(g,800,450,1,1);
 const A=(g,a,op)=>{g.globalAlpha=a;g.globalCompositeOperation=op||'source-over'};
 function islands(g,list,C,t){for(const s of list){cam(g,C[0],C[1],C[2],s.p);const a=as(s.a);put(g,a,s.x-a.w*s.sc/2,s.y+Math.sin(t*.8+s.ph)*9-a.h*.25*s.sc,a.w*s.sc,a.h*s.sc)}}
 function motes(g,t,al,col){stage(g);A(g,1,'lighter');for(const m of I.motes){const y=((m.y-t*m.v)%960+960)%960-30,x=m.x+Math.sin(t*.7+m.ph)*18;g.globalAlpha=al*(.5+.5*Math.sin(t*2+m.ph));const s=glow(col||m.c);g.drawImage(s.c,x-m.r,y-m.r,m.r*2,m.r*2)}A(g,1)}
 function world(g,t,C,o){o=o||{};cam(g,C[0],C[1],C[2],.25);put(g,as(o.sky||'sky1'),-100,-300);stars(g,t,o.st==null?1:o.st);
  if(o.pre)o.pre(g);
  cam(g,C[0],C[1],C[2],.3);A(g,(o.au==null?.6:o.au)+.2*Math.sin(t*.9),'lighter');put(g,as('aurora'),-100,-250);A(g,1);
  if(o.shoot)o.shoot(g);
  cam(g,C[0],C[1],C[2],.5);A(g,o.cl==null?1:o.cl);put(g,as('clouds'),-200,560);A(g,1);
  islands(g,I.islF,C,t);
  cam(g,C[0],C[1],C[2],.85);A(g,o.gw==null?.5:o.gw,'lighter');putc(g,glow(o.gc||'#9fd8ff'),800,360,8);A(g,1);
  const tw=900,th=tw*1550/1500,tx=800-tw/2,ty=900-tw;put(g,as('tree'),tx,ty,tw,th);const vg=o.veins==null?.8+.2*Math.sin(t*2.2):o.veins;if(vg>.01){A(g,vg,'lighter');put(g,as(o.gold?'treeY':'treeG'),tx,ty,tw,th);A(g,1)}
  if(o.mid)o.mid(g);
  islands(g,I.islN,C,t);
  if(!o.nofg){cam(g,C[0],C[1],C[2],1.35);put(g,as('fg'),-100,560)}}
 // ---- scenes (t = local story seconds)
 function sTree(g,t,d){const k=t/d,C=[800,lerp(-260,532,ez(k)),lerp(1.32,.95,eo(k))];I.C=C;
  world(g,t,C,{shoot:g2=>{for(const s of[[1.1,1700,-160,2.6],[2.9,1500,-250,2.75]]){const u=(t-s[0])/.7;if(u<0||u>1)continue;cam(g2,C[0],C[1],C[2],.25);const x=s[1]-u*700,y=s[2]+u*330;drawStreak(g2,'#cfe8ff',x,y,PI-.44,260,Math.sin(u*PI),9)}}});
  motes(g,t,.8)}
 function sEclipse(g,t,d){const k=t/d,crack=1.8,ct=t-crack;I.sa=ct>0&&ct<.7?(1-ct/.7)*22:0;const C=[800,lerp(532,-170,ez(t/1.7)),lerp(.95,1.1,ez(k))];I.C=C;
  const cover=ez(t/1.6),dim=ez(t/3);
  world(g,t+4.6,C,{st:1-dim*.6,au:.6-dim*.5,veins:Math.max(0,.9-ez(ct/1.1))*(1+(ct<0?0:.6*Math.sin(ct*40)*(1-cl(ct,0,1)))),gw:.5*(1-dim),
   pre:g2=>{cam(g2,C[0],C[1],C[2],.35);const ex=800,ey=-20;
    if(ct<0){A(g2,1,'lighter');putc(g2,as('sun'),ex,ey,1.15)}
    A(g2,cover,'lighter');putc(g2,as('corona'),ex,ey,(.7+cover*.5+(ct>0?ez(ct/.5)*.4:0))*(1+.03*Math.sin(t*6)));A(g2,1);g2.save();g2.translate(ex,ey);g2.rotate(t*.05);g2.restore();
    g2.fillStyle='#030008';g2.beginPath();g2.arc(ex+lerp(-190,0,cover),ey+lerp(30,0,cover),63,0,TAU);g2.fill();
    if(ct>0){A(g2,.7*ez(ct/.8));putc(g2,glow('#000000'),ex,ey,9);A(g2,1);cracks(g2,eo(ct/.5),ex,ey,1);
     g2.lineWidth=2;for(const s of I.sh){const tt=ct-s.dl;if(tt<0)continue;const x=ex+s.x+s.vx*tt,y=ey+s.y+s.vy*tt+260*tt*tt;g2.save();g2.translate(x,y);g2.rotate(s.a+s.va*tt);g2.beginPath();s.pts.forEach((q,i)=>i?g2.lineTo(q[0],q[1]):g2.moveTo(q[0],q[1]));g2.closePath();g2.fillStyle='#1d1036';g2.fill();g2.strokeStyle='rgba(255,150,235,.95)';g2.stroke();g2.restore()}}
    // the sky reddens behind everything else
    g2.setTransform(1,0,0,1,0,0);A(g2,1,'multiply');g2.fillStyle=mix('#ffffff','#a0306a',dim*.7);g2.fillRect(0,0,I.cw,I.ch);A(g2,1)}});
  g.setTransform(1,0,0,1,0,0);A(g,1,'multiply');g.fillStyle=mix('#ffffff','#5a2a5a',dim*.55);g.fillRect(0,0,I.cw,I.ch);A(g,1);
  // falling comets in the guardians' colours
  stage(g);BIDS.forEach((id,i)=>{const u=(t-2.45-i*.2)/.75;if(u<0||u>1)return;const x0=800+(i-2.5)*30,x1=180+i*248,x=lerp(x0,x1,u),y=lerp(200,980,.35*u+.65*u*u),ang=Math.atan2(980-140,(x1-x0)*.5+1)*(1)+0;A(g,1,'lighter');drawStreak(g,BC[id],x,y,Math.atan2(780*(.35+1.3*u),x1-x0),260,1,12);putc(g,glow(BC[id]),x,y,1.3);A(g,1)});
  if(ct>0&&ct<.6){stage(g);A(g,(1-ct/.6)*.75,'lighter');put(g,as('speed'),0,0,1600,900);A(g,1)}
  if(ct>=0&&ct<.4)I.fl=Math.max(I.fl,(1-ct/.4));motes(g,t,.4*(1-dim),'#ff9ad8')}
 function sBosses(g,t,d){stage(g);put(g,as('sky3'),0,0,1600,900);A(g,.9,'lighter');putc(g,as('corona'),800,110,.85+.05*Math.sin(t*3));A(g,1);g.fillStyle='#030008';g.beginPath();g.arc(800,110,60,0,TAU);g.fill();cracks(g,1,800,110,.55);
  const T0=[.1,.32,.54,2.35,2.57,2.79],sk=72;
  for(let i=0;i<6;i++){const j=i%3,w=i<3?0:1,tl=t-T0[i];if(tl<0)continue;const outT=w?99:2.2;if(t>outT+.3)continue;const dir=j%2?1:-1;let off=(1-eo(tl/.34))*dir*960;if(t>outT)off=-dir*960*ei((t-outT)/.3);
   const x0=j*533.33,x1=x0+533.33,cx=(x0+x1)/2,id=BIDS[i];g.save();g.beginPath();g.moveTo(x0+sk,off);g.lineTo(x1+sk,off);g.lineTo(x1-sk,900+off);g.lineTo(x0-sk,900+off);g.closePath();g.clip();
   put(g,as('pbg_'+id),cx-310,off,620,900);const zz=1.3*(1+.05*cl(tl,0,2)),sa=as('sil_'+id),sw=420*zz,sh=540*zz,sx=cx-sw/2,sy=off+880-sh;put(g,sa,sx,sy,sw,sh);
   const ga=tl>.3?(tl<.55?1+2.5*Math.sin((tl-.3)/.25*PI):1):0;if(ga>0){A(g,1,'lighter');for(const e of EY[id]){const ex=sx+e[0]*zz,ey=sy+(e[1]+10)*zz;g.globalAlpha=Math.min(1,ga*.5);putc(g,glow(BC[id]),ex,ey,.7*ga);if(tl<.6){g.globalAlpha=1-(tl-.3)/.3;drawStreak(g,'#ffffff',ex+90*zz,ey,0,180*zz,1-(tl-.3)/.3,6)}}A(g,1)}
   const ny=688+off,nx=cx+sk*(1-2*688/900);g.font='italic 900 34px '+SANS;g.textAlign='center';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(nx-220,ny-36,440,58);g.fillStyle=BC[id];g.fillRect(nx-220,ny+18,440,4);g.fillStyle='#fff';g.fillText(BNM[id].toUpperCase(),nx,ny+4);g.restore();
   g.lineWidth=10;g.strokeStyle='#fff';g.beginPath();g.moveTo(x0+sk,off);g.lineTo(x0-sk,900+off);g.moveTo(x1+sk,off);g.lineTo(x1-sk,900+off);g.stroke()}
  if(t>2.2&&t<2.45)I.fl=Math.max(I.fl,.55*(1-(t-2.2)/.25));if(t<.25)I.fl=Math.max(I.fl,1-t/.25);I.dk=Math.max(I.dk,ez((t-(d-.45))/.45))}
 function sleeper(g,lit){const c=lit>0?mix('#04080c','#4a9aa0',lit*.35):'#04080c';g.fillStyle=c;g.beginPath();g.ellipse(770,742,92,26,-.05,0,TAU);g.fill();g.beginPath();g.arc(874,722,27,0,TAU);g.fill();g.beginPath();poly(g,852,706,868,676,872,700);poly(g,866,700,890,672,886,700);poly(g,880,704,912,690,896,712);g.fill();g.beginPath();g.moveTo(850,700);g.quadraticCurveTo(900,680,912,716);g.quadraticCurveTo(880,700,860,712);g.fill();g.beginPath();g.ellipse(690,754,50,16,.1,0,TAU);g.fill()}
 function eyeShot(g,te){const ap=(()=>{try{return AP.eyeCol[cel.ap.eyeCol|0]||'#35c9c0'}catch(_){return'#35c9c0'}})(),hc=(()=>{try{return/^#[0-9a-f]{6}$/i.test(cel.ap.hairCol)?cel.ap.hairCol:'#3a2a3a'}catch(_){return'#3a2a3a'}})();
  const op=te<.35?0:te<.5?.38*ez((te-.35)/.15):te<.62?lerp(.38,.12,ez((te-.5)/.12)):eo((te-.62)/.28);
  cam(g,800,470,1+.06*ez(te/1.35),1);put(g,as('face'),-60,-40,1720,980);
  const L=330,Rx=1270,cy=470,tc=lerp(cy+150,cy-330,op),bc=cy+150;
  g.save();g.beginPath();g.moveTo(L,cy);g.quadraticCurveTo(800,tc,Rx,cy-30);g.quadraticCurveTo(840,bc,L,cy);g.closePath();g.clip();
  g.fillStyle='#e6ecf8';g.fillRect(L-20,cy-420,Rx-L+40,650);const ix=810,iy=478,ir=178;
  const ig=g.createRadialGradient(ix,iy-60,10,ix,iy,ir);ig.addColorStop(0,mix(ap,'#000000',.55));ig.addColorStop(.55,ap);ig.addColorStop(1,mix(ap,'#000000',.45));g.fillStyle=ig;g.beginPath();g.arc(ix,iy,ir,0,TAU);g.fill();
  g.fillStyle=rgba(mix(ap,'#ffffff',.6),.55);g.beginPath();g.ellipse(ix,iy+95,120,55,0,0,PI);g.fill();g.strokeStyle=mix(ap,'#000000',.6);g.lineWidth=7;g.beginPath();g.arc(ix,iy,ir,0,TAU);g.stroke();
  g.fillStyle='#08060e';g.beginPath();g.ellipse(ix,iy,58,74,0,0,TAU);g.fill();g.strokeStyle=rgba(mix(ap,'#ffffff',.5),.35);g.lineWidth=2;for(let i=0;i<18;i++){const a=i/18*TAU;g.beginPath();g.moveTo(ix+Math.cos(a)*70,iy+Math.sin(a)*82);g.lineTo(ix+Math.cos(a)*160,iy+Math.sin(a)*160);g.stroke()}
  g.fillStyle='#fff';g.beginPath();g.ellipse(ix-70,iy-78,46,30,-.4,0,TAU);g.fill();g.beginPath();g.arc(ix+76,iy+60,13,0,TAU);g.fill();A(g,1,'lighter');putc(g,glow('#7ff0ff'),ix+40,iy-40,.9);A(g,1);
  const sg=g.createLinearGradient(0,tc-40,0,tc+150);sg.addColorStop(0,'rgba(20,10,40,.6)');sg.addColorStop(1,'rgba(20,10,40,0)');g.fillStyle=sg;g.fillRect(L,tc-200,Rx-L,400);g.restore();
  g.strokeStyle='#160d1c';g.fillStyle='#160d1c';g.lineWidth=26;g.beginPath();g.moveTo(L-30,cy+12);g.quadraticCurveTo(800,tc-8,Rx+26,cy-44);g.stroke();
  for(let i=0;i<4;i++){const bx=Rx-20+i*14,by=cy-46-i*6;g.beginPath();g.moveTo(bx-24,by+12);g.lineTo(bx+40,by-30-i*8);g.lineTo(bx+4,by+16);g.closePath();g.fill()}
  g.lineWidth=7;g.beginPath();g.moveTo(L+50,cy+14);g.quadraticCurveTo(840,bc-4,Rx-40,cy-22);g.stroke();
  if(op>.2){g.globalAlpha=op*.6;g.lineWidth=6;g.beginPath();g.moveTo(L+80,cy-70-op*150);g.quadraticCurveTo(800,tc-120,Rx-60,cy-120-op*60);g.stroke();g.globalAlpha=1}
  for(const h of[[-60,20,300,600,120,70],[230,-40,470,330,80,40],[1440,-40,1230,400,90,-40],[1720,60,1450,660,130,-70]]){const mx=(h[0]+h[2])/2+h[5],my=(h[1]+h[3])/2,w=h[4];g.fillStyle=mix(hc,'#000000',.5);g.beginPath();g.moveTo(h[0]-w/2,h[1]);g.quadraticCurveTo(mx-w*.35,my,h[2],h[3]);g.quadraticCurveTo(mx+w*.35,my,h[0]+w/2,h[1]);g.closePath();g.fill();g.strokeStyle=rgba(mix(hc,'#bff6ff',.45),.55);g.lineWidth=5;g.beginPath();g.moveTo(h[0]+w*.1,h[1]);g.quadraticCurveTo(mx+w*.05,my,lerp(h[0],h[2],.8),lerp(h[1],h[3],.8));g.stroke()}
  if(te>.88&&te<1.3){const u=(te-.88)/.42;stage(g);A(g,1,'lighter');drawStreak(g,'#bff6ff',lerp(200,1700,u),430,0,900,Math.sin(u*PI),26);putc(g,as('spark'),810-70,478-78,3*Math.sin(u*PI));A(g,1)}}
 function bustShot(g,tb,lit,rise){const off=lerp(130,0,eo(rise)),zz=1.12;put(g,as(lit>.5?'bustL':'bustD'),800-350*zz,900-820*zz+off+30,700*zz,820*zz)}
 function sWake(g,t,d){
  if(t<1.65){const u=t/1.65;cam(g,800,lerp(450,580,ez(u)),lerp(1,1.22,ez(u)),1);put(g,as('cave'),0,0,1600,900);const sy=lerp(-90,690,ez(t/1.45)),lit=cl((t-1.45)/.2,0,1);
    A(g,.35+lit*.6,'lighter');putc(g,glow('#5fffd0'),820,730,3+lit*3);A(g,1);g.save();g.translate(790,745);g.scale(1.9,1.9);g.translate(-790,-745);sleeper(g,lit);g.restore();
    A(g,1,'lighter');for(let i=1;i<9;i++)putc(g,glow('#bff6ff'),800+Math.sin(t*9+i)*4,sy-i*26,.6-i*.05);putc(g,glow('#e8fdff'),800,sy,1.1+.15*Math.sin(t*20));putc(g,as('spark'),800,sy,1.2);
    if(t>1.45){const v=(t-1.45)/.2;g.strokeStyle='rgba(180,255,240,'+(1-v)+')';g.lineWidth=4;g.beginPath();g.ellipse(820,735,40+v*400,10+v*90,0,0,TAU);g.stroke()}A(g,1);motes(g,t,.5,'#5fffd0')}
  else if(t<3.0){eyeShot(g,t-1.65)}
  else{const tb=t-3.0;cam(g,800,450,1.0+.02*tb,1);put(g,as('cave'),0,0,1600,900);g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,I.cw,I.ch);stage(g);A(g,.7,'lighter');putc(g,glow('#5fffd0'),800,330,7);A(g,1);bustShot(g,tb,0,tb/.9);A(g,1,'lighter');putc(g,glow('#e8fdff'),800,150-tb*20,1.2);A(g,1);motes(g,t,.5,'#5fffd0')}
  if(t<.5)I.dk=Math.max(I.dk,1-t/.5)}
 function sWings(g,t,d){if(t<1.9){const burst=1.0,bt=t-burst;I.sa=bt>0&&bt<.5?(1-bt/.5)*16:0;cam(g,800,450,1.02+.05*ez(t/1.9),1);put(g,as('cave'),0,0,1600,900);g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(0,0,0,'+(bt>0?.45-.3*ez(bt/.4):.45)+')';g.fillRect(0,0,I.cw,I.ch);stage(g);
   const gs=bt<0?lerp(1.5,5,ez(t/1)):5+bt*3;A(g,1,'lighter');putc(g,glow('#e8fdff'),800,400,gs);
   if(bt<0){g.strokeStyle='rgba(220,255,255,.75)';g.lineWidth=3;for(let i=0;i<28;i++){const a=i/28*TAU+i,u=((t*1.6+i*.137)%1),r0=900*(1-u),r1=r0-120;g.globalAlpha=u;g.beginPath();g.moveTo(800+Math.cos(a)*r0,400+Math.sin(a)*r0*.7);g.lineTo(800+Math.cos(a)*r1,400+Math.sin(a)*r1*.7);g.stroke()}g.globalAlpha=1}
   if(bt>0){A(g,(1-ez(bt/.9))*.85+.15,'lighter');g.save();g.translate(800,430);g.rotate(bt*.4);putc(g,as('rays'),0,0,1.7+bt*.3);g.restore();A(g,1);
    const sx=bo(bt/.55),sy=lerp(.6,1,eo(bt/.55)),ws=1.02,wa=as('wing');put(g,wa,800-650*sx*ws,560-560*sy*ws,1300*sx*ws,860*sy*ws);
    A(g,1,'lighter');for(const f of I.fe){const tt=bt;const x=800+f.vx*tt,y=430+f.vy*tt+90*tt*tt;g.save();g.translate(x,y);g.rotate(f.a+tt*f.va);g.globalAlpha=Math.max(0,1-tt/1.2);g.fillStyle='#f4fbff';g.beginPath();g.ellipse(0,0,f.s,f.s*.32,0,0,TAU);g.fill();g.restore()}A(g,1);
    A(g,(1-ez(bt/.8))*.9,'lighter');put(g,as('speed'),0,0,1600,900);A(g,1)}
   A(g,1);bustShot(g,t,bt>0?1:0,(t+1)/.9);if(bt>=0&&bt<.45)I.fl=Math.max(I.fl,1-bt/.45)}
  else{const ta=t-1.9,u=ta/1.9,C=[800,lerp(450,-150,ez(u)),1.05];I.C=C;cam(g,C[0],C[1],C[2],.25);put(g,as('sky1'),-100,-300);stars(g,t,1);
   g.setTransform(1,0,0,1,0,0);A(g,.25,'lighter');g.fillStyle='#ffd0e0';g.fillRect(0,0,I.cw,I.ch);A(g,1);
   cam(g,C[0],C[1],C[2],.3);A(g,.7,'lighter');put(g,as('aurora'),-100,-250);A(g,1);
   stage(g);const cy=lerp(1400,-500,u);put(g,as('isl1'),1050,cy,420,462);put(g,as('isl3'),150,cy+700,220,242);A(g,.22,'lighter');for(let i=0;i<7;i++){const px=(i*331)%1600,py=((ta*1500+i*260)%1700)-400,sz=500+(i%3)*160;putc(g,glow('#ffffff'),px,py,sz/128)}A(g,1);
   for(let k=0;k<2;k++){const oy=((ta*2600)%900)+k*900-900;A(g,.55,'lighter');put(g,as('vlines'),0,oy,1600,900)}A(g,1);
   const fy=lerp(1050,400,eo(u*1.4)),fx=800+Math.sin(ta*3)*20;A(g,1,'lighter');for(let i=1;i<14;i++)putc(g,glow('#bff6ff'),fx+Math.sin((ta-i*.03)*3)*20,fy+i*34,1.1-i*.06);A(g,1);putc(g,as('flyer'),fx,fy,1.25);
   motes(g,t,.6,'#ffffff')}}
 const WORDS=['BUILD','MINE','FISH','CLIMB'],ACC=['#ffb84a','#7ff6ff','#ffd36a','#ff9ad8'];
 const HOUSE=[[0,0,2],[1,0,2],[2,0,5],[3,0,2],[4,0,2],[0,1,1],[1,1,3],[2,1,1],[3,1,3],[4,1,1],[0,2,1],[1,2,1],[2,2,1],[3,2,1],[4,2,1],[0,3,4],[1,3,4],[2,3,4],[3,3,4],[4,3,4],[1,4,4],[2,4,4],[3,4,4],[2,5,4]];
 function mBuild(g,tc){cam(g,800,450,1.02+.04*tc,1);put(g,as('m1'),-40,-30,1680,960);const S=64,gx=800-2.5*S,gy=760;for(let x=-S;x<1700;x+=S){blk(g,0,x,gy,S);blk(g,2,x,gy+S,S)}
  HOUSE.forEach((b,i)=>{const L=.03+i*.03,f=(tc-(L-.12))/.12;if(f<0)return;const x=gx+b[0]*S,ty=gy-(b[1]+1)*S,y=f<1?ty-380*(1-f*f):ty,sq=f>=1&&tc-L<.08?1-.18*Math.sin((tc-L)/.08*PI):1;blk(g,b[2],x+S*(1-1/sq)/2*0,y+S*(1-sq),S,S*sq);
   if(f>=1&&tc-L<.25){const v=(tc-L)/.25;g.fillStyle='rgba(255,240,220,'+(.6*(1-v))+')';for(const s of[-1,1]){g.beginPath();g.arc(x+S/2+s*(S*.5+v*40),ty+S-4-v*10,6+v*8,0,TAU);g.fill()}}});
  const nx=HOUSE.findIndex((b,i)=>tc<.03+i*.03);if(nx>=0){const b=HOUSE[nx];g.strokeStyle='rgba(255,255,255,'+(.6+.4*Math.sin(tc*40))+')';g.lineWidth=3;g.strokeRect(gx+b[0]*S+2,gy-(b[1]+1)*S+2,S-4,S-4)}}
 function mMine(g,tc){cam(g,800,450,1.04+.06*tc,1);put(g,as('m2'),-40,-30,1680,960);const bx=800-54,by=430-54,hit1=.3,hit2=.58;
  if(tc<hit2){if(tc>hit1){g.strokeStyle='#14121c';g.lineWidth=4;g.beginPath();g.moveTo(bx+54,by+54);g.lineTo(bx+20,by+18);g.moveTo(bx+54,by+54);g.lineTo(bx+96,by+30);g.moveTo(bx+54,by+54);g.lineTo(bx+70,by+100);g.moveTo(bx+54,by+54);g.lineTo(bx+12,by+80);g.stroke()}}
  else{g.fillStyle='#07060c';g.fillRect(bx,by,108,108);const tt=tc-hit2,r=srnd(3);for(let i=0;i<10;i++){const a=r()*TAU,sp=300+r()*500,s=(16+r()*26)*(1+tt*2.2),x=bx+54+Math.cos(a)*sp*tt,y=by+54+Math.sin(a)*sp*tt+600*tt*tt;g.fillStyle=i%3?'#6a6d80':'#8d8f9e';g.fillRect(x-s/2,y-s/2,s,s);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-s/2,y+s*.2,s,s*.3)}
   A(g,1,'lighter');for(let i=0;i<3;i++){const x=bx+54+(i-1)*70*tt*4,y=by+54-200*tt+400*tt*tt;putc(g,glow('#7ff6ff'),x,y,.8);putc(g,as('spark'),x,y,1.1)}A(g,1)}
  for(const h of[hit1,hit2]){const u=(tc-h)/.14;if(u<0||u>1)continue;A(g,1-u,'lighter');g.strokeStyle='#fff3c0';g.lineWidth=4;for(let i=0;i<14;i++){const a=i/14*TAU+h*9,r0=30+u*60,r1=r0+40+u*90;g.beginPath();g.moveTo(800+Math.cos(a)*r0,430+Math.sin(a)*r0);g.lineTo(800+Math.cos(a)*r1,430+Math.sin(a)*r1);g.stroke()}putc(g,glow('#ffe7a0'),800,430,2.2*(1-u));A(g,1);I.sa=Math.max(I.sa,(1-u)*10)}
  const sw=tc<.2?lerp(1.1,1.62,ez(tc/.2)):tc<hit1?lerp(1.62,.715,ei((tc-.2)/.1)):tc<.48?lerp(.715,1.55,eo((tc-hit1)/.18)):tc<hit2?lerp(1.55,.715,ei((tc-.48)/.1)):lerp(.715,1.0,eo((tc-hit2)/.3));
  g.save();g.translate(1250,830);g.rotate(sw);g.fillStyle='#5a3a24';g.fillRect(-560,-12,560,24);g.fillStyle='#7a5234';g.fillRect(-560,-12,560,7);g.translate(-560,0);g.fillStyle='#b8c0d0';g.strokeStyle='#1a1424';g.lineWidth=5;g.beginPath();g.moveTo(-10,-150);g.quadraticCurveTo(40,-40,24,0);g.quadraticCurveTo(40,40,-10,150);g.quadraticCurveTo(70,40,70,0);g.quadraticCurveTo(70,-40,-10,-150);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';g.fillRect(40,-50,8,100);g.restore()}
 function mFish(g,tc){cam(g,800,450,1.02+.03*tc,1);put(g,as('m3'),-40,-30,1680,960);const r=srnd(5);g.fillStyle='rgba(220,235,255,.5)';for(let i=0;i<14;i++){const y=560+r()*320,x=r()*1600+Math.sin(tc*3+i)*30;g.globalAlpha=.25+.25*Math.sin(tc*6+i);g.fillRect(x,y,40+r()*80,2)}g.globalAlpha=1;
  const bob=tc<.28?Math.sin(tc*14)*5:tc<.36?18:Math.sin(tc*10)*3,bx=880,by=640+bob;g.strokeStyle='#0a0614';g.lineWidth=9;g.beginPath();g.moveTo(-20,360);g.lineTo(260,110);g.stroke();g.strokeStyle='rgba(240,240,255,.7)';g.lineWidth=1.6;g.beginPath();g.moveTo(260,110);g.quadraticCurveTo(600,300,bx,by-12);g.stroke();
  g.fillStyle='#ff4a5a';g.beginPath();g.arc(bx,by-8,10,PI,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(bx,by-8,10,0,PI);g.fill();
  for(const sp of[.3,.85]){const u=(tc-sp)/.4;if(u<0||u>1)continue;g.strokeStyle='rgba(220,240,255,'+(1-u)+')';g.lineWidth=3;const sx=sp<.5?960:1340;g.beginPath();g.ellipse(sx,652,30+u*160,6+u*28,0,0,TAU);g.stroke();g.fillStyle='rgba(230,245,255,'+(1-u)+')';for(let i=0;i<9;i++){const a=PI+i/8*PI,x=sx+Math.cos(a)*u*160,y=650-Math.sin(i/8*PI)*(u*200-u*u*240);g.beginPath();g.arc(x,y,4,0,TAU);g.fill()}}
  const u=(tc-.3)/.55;if(u>0&&u<1){const x=lerp(960,1340,u),y=650-Math.sin(u*PI)*340,ang=Math.atan2(-Math.cos(u*PI)*340*PI,380);A(g,1,'lighter');for(let i=1;i<7;i++){const v=u-i*.035;if(v<0)break;putc(g,glow('#ffd36a'),lerp(960,1340,v),650-Math.sin(v*PI)*340,.5-i*.06)}A(g,1);g.save();g.translate(x,y);g.rotate(ang);putc(g,as('koi'),0,0,1.35);g.restore()}}
 function mClimb(g,tc){const C=[800,lerp(560,360,ez(tc/.9)),1.0];I.C=C;cam(g,C[0],C[1],C[2],.25);put(g,as('sky7'),-100,-300);stars(g,tc,.4);cam(g,C[0],C[1],C[2],.4);A(g,.8,'lighter');putc(g,glow('#ffd77a'),1420,380,5.5);A(g,1);const tw=380,th=tw*1550/1500;put(g,as('tree'),1420-tw/2,640-tw,tw,th);A(g,1,'lighter');put(g,as('treeY'),1420-tw/2,640-tw,tw,th);A(g,1);
  cam(g,C[0],C[1],C[2],1);const P=[[420,760,'isl0',330],[820,560,'isl2',220],[1130,340,'isl3',200]];for(const p of P){const a=as(p[2]);put(g,a,p[0]-p[3]/2,p[1]-p[3]*.24,p[3],p[3]*1.1)}
  const seg=tc<.45?0:1,v=seg?(tc-.45)/.45:tc/.45,a=P[seg],b=P[seg+1],x=lerp(a[0],b[0],ez(v)),y=lerp(a[1],b[1],ez(v))-Math.sin(v*PI)*150-80;A(g,1,'lighter');for(let i=1;i<8;i++){const w=Math.max(0,v-i*.04);putc(g,glow('#ffe7c0'),lerp(a[0],b[0],ez(w)),lerp(a[1],b[1],ez(w))-Math.sin(w*PI)*150-80,.7-i*.07)}A(g,1);putc(g,as('flyer'),x,y,.62)}
 function sMont(g,t,d){const n=Math.min(3,Math.floor(t/.9)),tc=t-n*.9;[mBuild,mMine,mFish,mClimb][n](g,tc);stage(g);
  if(tc<.3){A(g,(1-tc/.3)*.5,'lighter');put(g,as('speed'),0,0,1600,900);A(g,1)}
  const wa=cl(tc/.1,0,1),sc=lerp(1.6,1,eo(tc/.16)),right=n==1,wx=right?1480:120,wy=300;g.save();g.translate(wx,wy);g.scale(sc,sc);g.textAlign=right?'right':'left';g.textBaseline='middle';g.globalAlpha=wa;
  g.font='italic 700 24px '+SANS;g.fillStyle='#fff';g.fillText('0'+(n+1)+' / 04',0,-92);g.font='italic 900 150px '+SANS;g.lineWidth=14;g.strokeStyle='#120a1e';g.strokeText(WORDS[n],0,0);g.fillStyle=ACC[n];g.fillText(WORDS[n],8,8);g.fillStyle='#fff';g.fillText(WORDS[n],0,0);g.restore();g.globalAlpha=1;
  if(tc<.16){const u=tc/.16,x=lerp(-500,2100,u);g.fillStyle='#fff';g.beginPath();g.moveTo(x,0);g.lineTo(x+260,0);g.lineTo(x+60,900);g.lineTo(x-200,900);g.closePath();g.fill()}
  if(tc<.07)I.fl=Math.max(I.fl,(1-tc/.07)*.7)}
 function sTitle(g,t,d){const slam=.55,C=[800,lerp(470,420,ez(t/d)),lerp(1.12,1.0,eo(t/2.5))];I.C=C;I.sa=t>slam&&t<slam+.5?(1-(t-slam)/.5)*18:0;
  world(g,t,C,{sky:'sky7',st:.45,au:.45,gold:1,gw:.75,gc:'#ffd77a',veins:.85+.15*Math.sin(t*3),nofg:false,
   shoot:g2=>{cam(g2,C[0],C[1],C[2],.25);for(let i=0;i<9;i++){const st=.2+i*.5,u=(t-st)/.6;if(u<0||u>1)continue;const x=1700-((i*373)%900)-u*620,y=-260+((i*211)%300)+u*300;drawStreak(g2,i%2?'#ffe7c0':'#cfe8ff',x,y,PI-.45,240,Math.sin(u*PI),8)}}});
  motes(g,t,.7,'#ffe7a0');stage(g);A(g,.7);const dg=glow('#05030c');g.drawImage(dg.c,-100,140,1800,500);A(g,1);
  const T=as('title'),ty=380,tsc=.86;
  if(t<slam){A(g,ez(t/slam)*.8,'lighter');putc(g,glow('#fff4d0'),800,ty,2+t*8);A(g,1)}
  T.L.forEach((l,i)=>{const ti=t-slam-i*.055;if(ti<0)return;const sc=lerp(2.6,1,eo(ti/.24))*tsc,al=cl(ti/.1,0,1);g.globalAlpha=al;putc(g,l.a,800+l.x*tsc,ty-(1-eo(ti/.24))*30,sc);g.globalAlpha=1;if(ti<.3){A(g,(1-ti/.3),'lighter');putc(g,as('spark'),800+l.x*tsc,ty+60,2.5);A(g,1)}});
  const sw=(t-1.55)/.75;if(sw>0&&sw<1){const W=T.word,tc=I.tc||(I.tc=mk(W.c.width,W.c.height)),x=tc.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.clearRect(0,0,tc.width,tc.height);const bw=tc.width*.22;x.drawImage(as('band').c,lerp(-bw,tc.width,sw),0,bw,tc.height);x.globalCompositeOperation='destination-in';x.drawImage(W.c,0,0);
   A(g,.9,'lighter');g.drawImage(tc,800-W.w*tsc/2,ty-W.h*tsc/2,W.w*tsc,W.h*tsc);A(g,1)}
  const st=t-1.25;if(st>0){const a=cl(st/.5,0,1),sp=lerp(2,16,eo(st/1.2));g.globalAlpha=a;g.font='600 30px '+SANS;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#f8eeff';try{g.letterSpacing=sp+'px'}catch(_){}g.fillText('CELESTIAL ASCENSION',800+sp/2,ty+118);try{g.letterSpacing='0px'}catch(_){}
   const lw=lerp(0,190,eo(st/1)),hw=(()=>{try{g.letterSpacing=sp+'px'}catch(_){}const m=g.measureText('CELESTIAL ASCENSION').width/2+26;try{g.letterSpacing='0px'}catch(_){}return m})();g.fillStyle='#ffd77a';g.fillRect(800-hw-lw,ty+117,lw,2);g.fillRect(800+hw,ty+117,lw,2);for(const s of[-1,1]){const dx=800+s*(hw+lw);g.save();g.translate(dx,ty+118);g.rotate(PI/4);g.fillRect(-4,-4,8,8);g.restore()}g.globalAlpha=1}
  if(t>=slam&&t<slam+.5)I.fl=Math.max(I.fl,1-(t-slam)/.5)}
 const SCN={tree:sTree,eclipse:sEclipse,bosses:sBosses,wake:sWake,wings:sWings,montage:sMont,title:sTitle};
 // ---- frame: background scene, then flash / letterbox / caption in screen space
 function draw(){const g=I.g,u=I.u;g.setTransform(1,0,0,1,0,0);A(g,1);g.fillStyle='#000';g.fillRect(0,0,I.cw,I.ch);I.fl=0;I.dk=0;I.sa=0;I.shx=I.shy=0;
  let si=0;while(si<STORY.length-1&&u>=STORY[si+1][3])si++;const S=STORY[si],t=u-S[3];I.si=si;
  // shake is decided by the scene's first lines; compute it with a dry pass of the timings
  const pre=SCN[S[0]];I.sa=0;
  if(!I.red){const sa=shakeAt(S[0],t);if(sa>0){I.shx=(R()-.5)*2*sa*I.s/2;I.shy=(R()-.5)*2*sa*I.s/2}}
  g.save();try{pre(g,t,S[1])}catch(e){if(!draw.e){draw.e=1;console.error('CINE7 scene',S[0],e)}}g.restore();
  g.setTransform(1,0,0,1,0,0);A(g,1);
  const vg=as('vig');g.drawImage(vg.c,0,0,I.cw,I.ch);
  if(u<1.2)I.dk=Math.max(I.dk,1-ez(u/1.2));
  if(I.dk>0){g.fillStyle='rgba(0,0,0,'+I.dk+')';g.fillRect(0,0,I.cw,I.ch)}
  if(I.fl>0){g.fillStyle='rgba(255,255,255,'+(I.red?Math.min(.35,I.fl):I.fl)+')';g.fillRect(0,0,I.cw,I.ch)}
  // letterbox: slides in at the start, opens a little for the title
  const bh=I.ch*lerp(.115,.075,ez((u-25.4)/.6))*eo(u/.9);g.fillStyle='#000';g.fillRect(0,0,I.cw,bh);g.fillRect(0,I.ch-bh,I.cw,bh);
  // typewriter caption inside the lower bar
  const cap=S[2];if(cap&&bh>8){const ct=t-.35,n=Math.floor(ct/Math.min(.034,(S[1]*.55)/cap.length));if(n>0){const fs=Math.max(12,Math.min(bh*.34,I.cw*.021));g.font='italic 600 '+fs+'px '+SERIF;let f2=fs;while(g.measureText(cap).width>I.cw*.9&&f2>10){f2-=1;g.font='italic 600 '+f2+'px '+SERIF}
    const shown=cap.slice(0,n),fade=1-ez((t-(S[1]-.3))/.3);g.textAlign='center';g.textBaseline='middle';const full=g.measureText(cap).width,x0=I.cw/2-full/2;g.textAlign='left';g.fillStyle='rgba(244,236,255,'+fade+')';g.fillText(shown,x0,I.ch-bh/2);
    if(n<cap.length&&Math.floor(u*6)%2==0){const w=g.measureText(shown).width;g.fillStyle='rgba(255,215,122,'+fade+')';g.fillRect(x0+w+3,I.ch-bh/2-f2*.4,2,f2*.8)}}}}
 function shakeAt(id,t){if(id=='eclipse'){const ct=t-1.8;return ct>0&&ct<.7?(1-ct/.7)*22:0}if(id=='wings'){const bt=t-1.0;return bt>0&&bt<.5?(1-bt/.5)*16:0}if(id=='title'){const st=t-.55;return st>0&&st<.5?(1-st/.5)*18:0}if(id=='montage'){const tc=t-2*.9;if(tc>0&&tc<.9){for(const h of[.3,.58]){const v=(tc-h)/.14;if(v>0&&v<1)return(1-v)*10}}}return 0}
 function fit(){if(!I)return;const d=Math.min(1.5,window.devicePixelRatio||1);I.cw=Math.max(320,Math.round(innerWidth*d));I.ch=Math.max(180,Math.round(innerHeight*d));I.cv.width=I.cw;I.cv.height=I.ch;I.s=Math.max(I.cw/1600,I.ch/900)}
 function sched(){const ax=au();while(I.evi<I.ev.length&&I.ev[I.evi][0]<=I.u+.3){const e=I.ev[I.evi++];if(ax&&e[0]>=I.u-.08)try{e[1](ax.a.currentTime+Math.max(0,(e[0]-I.u)*I.k)+.02)}catch(_){}}}
 function frame(now){if(!I)return;I.raf=requestAnimationFrame(frame);const f0=performance.now(),dt=Math.min(.1,(now-I.last)/1000);I.last=now;I.el+=dt;I.u=Math.min(ST,I.el/I.k);
  sched();draw();
  // build upcoming art while there is time left in this frame
  if(I.q2.length&&performance.now()-f0<7){const n=I.q2.shift();try{as(n)}catch(e){console.error('CINE7 art',n,e)}}
  if(I.u>=ST-.9&&!I.ending){I.ending=1;try{I.done&&I.done()}catch(e){console.error(e)}I.cv.style.transition='opacity '+(.9*I.k).toFixed(2)+'s ease';I.cv.classList.add('out')}
  if(I.el>=ST*I.k+.05)end()}
 function blockKey(e){if(!I)return;try{if(AC&&AC.state=='suspended')AC.resume()}catch(_){}if(/^F\d+$/.test(e.key||''))return;e.stopImmediatePropagation();e.preventDefault()}
 function resume(){try{if(AC&&AC.state=='suspended')AC.resume()}catch(_){}}
 function end(){if(!I)return;cancelAnimationFrame(I.raf);removeEventListener('resize',fit);removeEventListener('keydown',blockKey,true);try{I.cv.remove()}catch(_){}I=null;
  try{if(!(typeof SHOW7!='undefined'&&SHOW7.isOpen))window.RB_COVER=false}catch(_){window.RB_COVER=false}try{startBGM()}catch(_){}/* the game's music takes over (it was held back during the story) */}
 function intro(done){if(I)return false;const red=reduce(),cv=mk(1,1);cv.id='cine7';cv.setAttribute('role','img');cv.setAttribute('aria-label','Story intro: Rootbound, Celestial Ascension');document.body.appendChild(cv);
  I={cv,g:cv.getContext('2d',{alpha:false}),k:red?.6:1,red,el:0,u:0,last:performance.now(),done,as:{},ev:score(),evi:0,fl:0,dk:0,sa:0,shx:0,shy:0,C:[800,450,1]};fit();I.q=Math.min(2,I.s*1.1);
  const r=srnd(99);I.stars=[];for(let i=0;i<260;i++)I.stars.push({x:-100+r()*1800,y:-300+r()*950,r:r()<.85?1.2+r()*1.3:2.4+r()*1.5,b:.4+r()*.6,sp:1+r()*3,ph:r()*6});I.big=[];for(let i=0;i<14;i++)I.big.push({x:-50+r()*1700,y:-280+r()*700,r:18+r()*26,ph:r()*6});
  I.motes=[];for(let i=0;i<64;i++)I.motes.push({x:r()*1600,y:r()*900,v:14+r()*36,r:5+r()*13,ph:r()*6,c:r()<.7?'#9ff6ff':'#ffe08a'});
  I.islF=[{a:'isl2',x:300,y:190,p:.6,sc:1,ph:1},{a:'isl3',x:1290,y:120,p:.6,sc:1,ph:2},{a:'isl4',x:1060,y:520,p:.6,sc:1,ph:3}];I.islN=[{a:'isl0',x:150,y:520,p:1.15,sc:1,ph:4},{a:'isl1',x:1460,y:380,p:1.15,sc:1,ph:5}];
  I.cr=crackGen();I.sh=shardGen();I.fe=[];for(let i=0;i<46;i++){const a=r()*TAU,sp=200+r()*700;I.fe.push({vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.7-120,a:r()*6,va:(r()-.5)*8,s:6+r()*10})}
  I.q2=[].concat(...NEED.slice(1));NEED[0].concat(['vig']).forEach(n=>{try{as(n)}catch(e){console.error('CINE7 art',n,e)}});
  window.RB_COVER=true;addEventListener('resize',fit);addEventListener('keydown',blockKey,true);cv.addEventListener('pointerdown',resume);I.last=performance.now();I.raf=requestAnimationFrame(frame);return true}
 // launch: wait for the game to be ready (never hide the startup diagnostic), then play the story and hand over to the home screen
 function launch(home){let n=0;const iv=setInterval(()=>{n++;let rdy=true,bad=false;try{rdy=!window.RBDIAG||RBDIAG.ready;const d=document.getElementById('rbdiag');bad=!!(d&&getComputedStyle(d).display!='none')}catch(_){}
  if(bad||n>330){clearInterval(iv);home();return}if(!rdy)return;clearInterval(iv);try{if(!intro(home))home()}catch(e){console.error('CINE7 intro',e);try{if(I){try{I.cv.remove()}catch(_){}I=null}window.RB_COVER=false}catch(_){}home()}},60)}
 // the game's own music waits until the story has finished
 {const _sb=startBGM;startBGM=function(){if(I){I.bgm=1;return}return _sb.apply(this,arguments)}}

 // ================= WORLD ENTRY: portal iris + title card =================
 let W7=null,lastN='',lastT=-1e9,pend=null,pendIv=0;
 function seen(n){let o={};try{o=JSON.parse(localStorage.getItem('rbc7')||'{}')||{}}catch(_){}if(!o.v||typeof o.v!='object')o.v={};const first=!o.v[n];o.v[n]=(o.v[n]|0)+1;try{localStorage.setItem('rbc7',JSON.stringify(o))}catch(_){}return first}
 const wName=n=>n=='plaza'?'The Plaza':String(n).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
 function tod(){try{const d=((clock()%1)+1)%1;return d<.1||d>=.92?'Midday':d<.2?'Afternoon':d<.28?'Dusk':d<.72?'Night':d<.8?'Dawn':'Morning'}catch(_){return''}}
 function wxl(){try{if(ENV7.target&&ENV7.target!='default'&&ENV7.names[ENV7.target])return ENV7.names[ENV7.target]}catch(_){}try{if(WX_NAMES[WX6.cur])return WX_NAMES[WX6.cur]}catch(_){}return{clear:'Clear skies',cloud:'Cloudy',rain:'Rain',storm:'Storm',snow:'Snow'}[typeof wxN!='undefined'?wxN:'']||''}
 function killW(){if(!W7)return;cancelAnimationFrame(W7.raf);clearTimeout(W7.tm);try{W7.w.remove()}catch(_){}try{document.body.classList.remove('c7w-on')}catch(_){}W7=null}
 function onEnter(n){const now=performance.now();if(n==lastN&&now-lastT<8000)return;lastN=n;lastT=now;if(I)return;
  if(window.RB_COVER){pend=n;clearInterval(pendIv);let k=0;pendIv=setInterval(()=>{if(++k>100||pend!=n){clearInterval(pendIv);return}if(!window.RB_COVER&&!I){clearInterval(pendIv);pend=null;if(cur==n)worldCard(n)}},200);return}
  worldCard(n)}
 function worldCard(n){killW();const red=reduce(),D=red?1.2:1.9,first=seen(n),w=document.createElement('div');w.id='cine7w';w.setAttribute('aria-hidden','true');const c=mk(Math.max(2,innerWidth*.5),Math.max(2,innerHeight*.5));w.appendChild(c);
  const card=document.createElement('div');card.className='c7w-card'+(red?' red':'')+(first?' new':'');card.innerHTML='<i class="c7w-k">'+(first?'New world discovered':'Welcome back')+'</i><b>'+esc(wName(n))+'</b><span class="c7w-ln"></span><em></em>';w.appendChild(card);document.body.appendChild(w);document.body.classList.add('c7w-on');
  setTimeout(()=>{try{card.querySelector('em').textContent=[tod(),wxl()].filter(Boolean).join('   ·   ')}catch(_){}},40);
  const P=[],g=c.getContext('2d'),t0=performance.now(),cols=['#b58cff','#7ff0ff','#ffd36a','#ffffff'];W7={w,raf:0,tm:setTimeout(killW,(red?1.9:2.9)*1000)};
  sfx(t=>{whoosh(t,.7,.05);o('s',M(81),M(81),t+.25,1.2,'sine',.03,.004,0,1);o('s',M(88),M(88),t+.36,1.1,'sine',.022,.004,0,1);o('s',M(93),M(93),t+.47,1,'sine',.018,.004,0,1)});
  const fr=now=>{if(!W7||W7.w!==w)return;const t=(now-t0)/1000,k=t/D,cw=c.width,ch=c.height,cx=cw/2,cy=ch*.48,dg=Math.hypot(cw,ch)*.55;if(k>=1){g.clearRect(0,0,cw,ch);c.style.display='none';return}W7.raf=requestAnimationFrame(fr);
   const op=eo((k-.1)/.72),r=op*dg*1.05;g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,cw,ch);g.fillStyle='#0b0718';g.fillRect(0,0,cw,ch);
   g.globalCompositeOperation='lighter';g.lineWidth=2.2;for(let a=0;a<5;a++){g.strokeStyle=rgba(cols[a%4],.42*(1-k));g.beginPath();for(let s=0;s<=26;s++){const rr=r+s/26*(dg-r+40),th=a*TAU/5+t*(red?1:2.6)+rr*.011;s?g.lineTo(cx+Math.cos(th)*rr,cy+Math.sin(th)*rr):g.moveTo(cx+Math.cos(th)*rr,cy+Math.sin(th)*rr)}g.stroke()}
   g.globalCompositeOperation='destination-out';if(r>1){const gr=g.createRadialGradient(cx,cy,r*.8,cx,cy,r+1);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r+2,0,TAU);g.fill()}
   g.globalCompositeOperation='lighter';if(r>1){g.globalAlpha=1-k;g.strokeStyle='#d9c4ff';g.lineWidth=3;g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.setLineDash([6,14]);g.lineDashOffset=-t*60;g.strokeStyle='#ffd36a';g.lineWidth=2;g.beginPath();g.arc(cx,cy,r*1.04+6,0,TAU);g.stroke();g.setLineDash([])}
   if(!red&&P.length<140)for(let i=0;i<5;i++){const a=R()*TAU,rr=Math.max(4,r);P.push({x:cx+Math.cos(a)*rr,y:cy+Math.sin(a)*rr,vx:Math.cos(a+1.2)*(60+R()*140)+Math.cos(a)*90,vy:Math.sin(a+1.2)*(60+R()*140)+Math.sin(a)*90,l:.7,c:cols[(R()*4)|0]})}
   for(let i=P.length-1;i>=0;i--){const p=P[i];p.l-=1/60;if(p.l<=0){P.splice(i,1);continue}p.x+=p.vx/60;p.y+=p.vy/60;g.globalAlpha=Math.min(1,p.l*1.6)*(1-k*.5);g.fillStyle=p.c;g.fillRect(p.x-1.5,p.y-1.5,3,3)}g.globalAlpha=1};
  W7.raf=requestAnimationFrame(fr)}
 {const _lw=loadWorld;loadWorld=function(n,e){const r=_lw.apply(this,arguments);try{killB();tS=1;slowD=0;onEnter(cur)}catch(err){console.error('CINE7 world',err)}return r}}

 // ================= BOSSES: intro card + camera focus, defeat card + slow motion, loss card =================
 let B7=null,tS=1,slowT0=0,slowD=0,SL=null;
 function slCanvas(){if(SL)return SL;const w=Math.max(320,innerWidth*.5|0),h=Math.max(180,innerHeight*.5|0),c=mk(w,h),x=c.getContext('2d'),r=srnd(19);x.fillStyle='#fff';for(let i=0;i<150;i++){const a=r()*TAU,r0=Math.min(w,h)*(.42+r()*.2),L=Math.hypot(w,h),wd=.003+r()*.006;x.globalAlpha=.3+r()*.6;x.beginPath();x.moveTo(w/2+Math.cos(a)*r0,h/2+Math.sin(a)*r0*.8);x.lineTo(w/2+Math.cos(a-wd)*L,h/2+Math.sin(a-wd)*L);x.lineTo(w/2+Math.cos(a+wd)*L,h/2+Math.sin(a+wd)*L);x.closePath();x.fill()}SL=c;return c}
 function zoom(on){try{if(on){cv.style.transformOrigin='50% 50%';cv.style.transition='transform .55s cubic-bezier(.2,.8,.2,1)';cv.style.transform='scale(1.14)'}else{cv.style.transition='transform .6s cubic-bezier(.4,0,.2,1)';cv.style.transform=''}}catch(_){}}
 function killB(){if(!B7)return;B7.tms.forEach(clearTimeout);try{B7.w.remove()}catch(_){}if(B7.zoom){try{cv.style.transform='';cv.style.transition=''}catch(_){}}B7=null}
 function shell(cls,c){const w=document.createElement('div');w.id='cine7b';w.className=cls;w.style.setProperty('--c',c);w.setAttribute('aria-hidden','true');return w}
 const later=(f,ms)=>{const b=B7;const h=setTimeout(()=>{if(B7===b)try{f()}catch(e){console.error('CINE7 boss',e)}},ms);b.tms.push(h)};
 function bossIntro(m,arena){killB();const id=String(m.k||'').replace('boss_',''),b=bdef(id)||{n:BNM[id]||'Boss',c:BC[id]||'#b58cff'},c=b.c||BC[id]||'#b58cff',red=reduce(),D=red?1.7:2.6;
  const w=shell('c7b'+(red?' red':''),c);w.innerHTML='<i class="c7b-bar t"></i><i class="c7b-bar b"></i><div class="c7b-sl"></div><div class="c7b-card"><span class="c7b-stripe"></span><em>'+esc(EPI[id]||b.desc||'')+'</em><b>'+esc(b.n)+'</b><small>A boss appears</small></div>';
  const sl=w.querySelector('.c7b-sl');if(!red)sl.appendChild(slCanvas());w.querySelector('.c7b-stripe').style.background='linear-gradient(90deg,transparent,'+rgba(c,.0)+' 4%,'+rgba(mix(c,'#000000',.45),.85)+' 22%,'+rgba(mix(c,'#000000',.45),.85)+' 78%,transparent)';
  document.body.appendChild(w);B7={w,m,arena,end:performance.now()+D*1000,tms:[],hold:true,zoom:!red,kind:'in'};
  try{window.CAMT={x:m.x,y:m.y+m.h/2}}catch(_){}if(!red)zoom(true);try{iT=Math.max(iT,D+.3)}catch(_){}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(B7&&B7.w===w)w.classList.add('on')}));
  sfx(t=>{boom(t,.32);taiko(t+.02,.2)});later(()=>sfx(t=>shing(t,.12)),D*130);
  later(()=>{const A2=B7.arena;try{window.CAMT=A2&&A2.fit&&!A2.end?{x:(A2.x0+A2.x1)/2,y:(A2.y0+A2.y1)/2}:null}catch(_){}zoom(false)},D*580);
  later(()=>{w.classList.add('off');B7.hold=false},D*850);later(()=>killB(),D*1000+450)}
 function bossWin(m,b,first){killB();const c=b.c||'#ffd36a',red=reduce(),D=red?2.4:3.4;if(!red){slowT0=performance.now();slowD=1150}
  const rw='+'+(b.gems|0).toLocaleString()+' gems   ·   +'+(b.xp|0).toLocaleString()+' XP'+(first&&b.rn?'   ·   Relic: '+b.rn:'');
  const w=shell('c7b win'+(red?' red':''),c);w.innerHTML='<i class="c7b-flash"></i><i class="c7b-bar t"></i><i class="c7b-bar b"></i><div class="c7b-card"><span class="c7b-stripe"></span><em>'+esc(b.n)+'</em><b>Boss Defeated</b><small>'+esc(rw)+'</small>'+(first&&b.rd?'<small class="c7b-rd">'+esc(b.rn+': '+b.rd)+'</small>':'')+'</div>';
  w.querySelector('.c7b-stripe').style.background='linear-gradient(90deg,transparent,'+rgba('#3a2a08',.85)+' 22%,'+rgba(mix(c,'#000000',.55),.85)+' 78%,transparent)';
  document.body.appendChild(w);B7={w,m,end:0,tms:[],hold:false,zoom:false,kind:'win'};requestAnimationFrame(()=>requestAnimationFrame(()=>{if(B7&&B7.w===w)w.classList.add('on')}));
  later(()=>w.classList.add('off'),D*1000-650);later(()=>killB(),D*1000)}
 function bossLose(name){killB();const red=reduce(),D=red?1.8:2.4,w=shell('c7b lose'+(red?' red':''),'#ff4a5a');w.innerHTML='<i class="c7b-dim"></i><div class="c7b-card"><b>Defeated</b><small>'+esc(String(name||'The boss'))+' vanished into the dark</small></div>';
  document.body.appendChild(w);B7={w,end:0,tms:[],hold:false,zoom:false,kind:'lose'};requestAnimationFrame(()=>requestAnimationFrame(()=>{if(B7&&B7.w===w)w.classList.add('on')}));later(()=>w.classList.add('off'),D*1000-600);later(()=>killB(),D*1000)}
 // slow motion after a boss falls (game time only; it always returns to 1 within ~1.2 s)
 const slowNow=()=>{if(!slowD)return 1;const k=(performance.now()-slowT0)/slowD;if(k>=1||k<0){slowD=0;return 1}return lerp(.28,1,ez(k))};
 {const _u=update;update=function(dt){tS=slowNow();return _u.call(this,dt*tS)}}
 try{const _vu=VFX.update;VFX.update=function(dt){return _vu.call(this,dt*tS)}}catch(_){}
 // boss AI waits (and stays put) while its intro card plays
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){try{if(B7&&B7.hold&&B7.m&&performance.now()<B7.end){const m=B7.m;if(mobs.includes(m)&&!m.dead){m.bt=Math.max(m.bt||0,.5);m.bs='idle';if(m.xt!=null)m.xt=Math.max(m.xt,.5);if(B7.lx==null){B7.lx=m.x;B7.ly=m.y}m.x=B7.lx;m.vx=0;if(MK[m.k]&&MK[m.k].fly){m.y=B7.ly;m.vy=0}}}}catch(_){}return _t.call(this,dt*tS)}}
 return{launch,intro,bossIntro,bossWin,bossLose,on:true,get playing(){return !!I},get boss(){return B7&&B7.kind},get world(){return !!W7},
  seek(u){if(!I)return;I.el=cl(u,0,ST)*I.k;I.u=I.el/I.k;I.evi=I.ev.findIndex(e=>e[0]>=I.u);if(I.evi<0)I.evi=I.ev.length;for(const s of NEED)for(const n of s)try{as(n)}catch(_){}},
  get state(){return I?{u:I.u,scene:STORY[I.si|0][0],total:ST,k:I.k}:null},STORY}})();
