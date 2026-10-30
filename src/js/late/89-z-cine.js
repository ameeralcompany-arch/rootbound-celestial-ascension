// ===== CINE7: anime-style cinematics. Original procedural art + synthesized score (no image or audio files) =====
// 1) launch story intro: unskippable, 1:30 with a continuous score (reduced motion: the same 17 scenes in ~54 s), then fades into the home screen.
//    Story beats: World Tree, lantern night, Eclipse, the fall, six guardians, a hundred years, awakening, first friend (gag), wings,
//    a botched first flight (gag), practice (gag), the journey, struck down and rising (fight), campfire, montage, restoration, title
// 2) world entry: portal iris opening + world title card (pointer-events:none, never blocks input)
// 3) boss overlays (letterbox, name card, defeat / loss cards), slow motion and boss sounds, driven by BOSS10 (89-zz-bossfight.js)
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
 let AX=null,NB=null,DUCK=1;
 function vol(){if(!AX)return;try{const mu=typeof mute!='undefined'&&mute,t=AX.a.currentTime;AX.m.gain.setTargetAtTime(mu?0:(OPT.mv==null?.5:+OPT.mv)*DUCK,t,.12);AX.s.gain.value=OPT.sv==null?1:+OPT.sv}catch(_){}}
 function au(){try{ac();if(!AC||AC.state=='closed')return null;if(AC.state=='suspended'){AC.resume().catch(()=>{});return null}
   if(!AX||AX.a!==AC){const a=AC,m=a.createGain(),s=a.createGain(),mi=a.createGain(),si=a.createGain(),comp=a.createDynamicsCompressor(),len=a.sampleRate*2.4|0,b=a.createBuffer(2,len,a.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(R()*2-1)*Math.pow(1-i/len,2.6)}
    const rv=a.createConvolver(),rv2=a.createConvolver(),wm=a.createGain(),ws=a.createGain(),sx=a.createGain();rv.buffer=b;rv2.buffer=b;wm.gain.value=.4;ws.gain.value=.3;
    comp.threshold.value=-16;comp.knee.value=14;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.3;mi.connect(m);mi.connect(rv);rv.connect(wm);wm.connect(m);si.connect(s);sx.connect(rv2);rv2.connect(ws);ws.connect(s);
    // calm score: soften the treble and cut piercing highs before the compressor (long-listen ear comfort)
    const hs=a.createBiquadFilter(),lpf=a.createBiquadFilter();hs.type='highshelf';hs.frequency.value=3000;hs.gain.value=-6;lpf.type='lowpass';lpf.frequency.value=8500;lpf.Q.value=.5;m.connect(hs);hs.connect(lpf);lpf.connect(comp);s.connect(comp);comp.connect(a.destination);
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
 const piano=(m,t,v)=>{const f=M(m);o('m',f,f,t,1.8,'triangle',v,.004);o('m',f*2,f*2,t,.7,'sine',v*.28,.003);o('m',f*3,f*3,t,.25,'sine',v*.08,.002)};
 const flute=(m,t,d,v)=>{const f=M(m);o('m',f,f*1.003,t,d,'sine',v,.14);o('m',f*2,f*2,t,d*.8,'sine',v*.1,.18);nz('m',t,Math.min(.25,d),'bandpass',f*2,0,v*.12,.05,4)};
 const tuba=(m,t,d,v)=>{const f=M(m);o('m',f,f,t,d,'triangle',v,.012);o('m',f*2,f*2,t,d*.8,'square',v*.07,.012)};
 const choir=(ms,t,d,v)=>stack(ms.map(M),t,d,v,'triangle',700,1600,900,Math.min(.9,d*.4),12);
 // cartoon + storm sound effects for the gag and the fight
 const scratch=(t,v)=>{nz('s',t,.11,'bandpass',2600,500,v,.004,3);nz('s',t+.1,.1,'bandpass',500,2800,v*.8,.004,3)};
 const bonk=(t,v)=>{o('s',700,180,t,.2,'square',v*.25,.002);o('s',330,95,t,.35,'sine',v,.002);nz('s',t,.08,'lowpass',2200,300,v*.5,.002);for(let i=0;i<6;i++)o('s',240+(i%2)*90,240+(i%2)*90,t+.08+i*.055,.06,'sine',v*.35*(1-i/6),.004)};
 const slideW=(t,d,v)=>{o('s',1500,280,t,d,'sine',v,.04);o('s',1520,284,t,d,'sine',v*.5,.04)};
 const tweet=(t,v)=>{o('s',2700,3500,t,.07,'sine',v,.004);o('s',3500,2800,t+.08,.07,'sine',v,.004)};
 const pop=(t,v)=>{o('s',300,900,t,.09,'sine',v,.002);nz('s',t,.03,'highpass',2500,0,v*.4)};
 const giggle=(t,v)=>[1150,1350,1180,1400,1220,1450].forEach((f,i)=>o('s',f,f*.82,t+i*.085,.07,'triangle',v,.004));
 const wahwah=(t,v)=>[[58,.24],[57,.24],[56,.24],[55,.75]].reduce((s,n)=>{stack([M(n[0])],s,n[1],v,'sawtooth',350,1300,420,.03,6);return s+n[1]},t);
 const thunder=(t,v)=>{nz('s',t,2.4,'lowpass',520,55,v,.02,0,1);o('s',58,30,t,1.6,'sine',v*.6,.03);nz('s',t+.05,.3,'highpass',1800,0,v*.25,.003)};
 const rain=(t,v)=>nz('s',t,1.5,'bandpass',3200,2400,v,.55,.5,1);
 const sfx=(fn,...a)=>{const x=au();if(x)try{fn(x.a.currentTime+.01,...a)}catch(_){}};

 // the score, in "story seconds" (reduced motion plays the same timeline faster)
 function score(){const E=[];let OFF=0;const at=(t,f)=>E.push([t+OFF,f]);
  // the first sections were written at fixed times; sec() shifts one to wherever its scene now starts. Newer sections use S0() directly.
  const S0=n=>STORY.find(s=>s[0]==n)[3],sec=(n,o0)=>{OFF=S0(n)-o0};
  // shared building blocks for the driving sections: drum kit, octave bass, string chords and the hero theme (minor, and a major version)
  const beat=(a,b,v)=>{for(let x=a;x<b-.05;x+=.4){at(x,t=>kick(t,.15*v));at(x+.2,t=>hat(t,.025*v))}for(let x=a+.4;x<b-.05;x+=.8)at(x,t=>snare(t,.05*v))};
  const bassline=(roots,end)=>roots.forEach((r,i)=>{const e=i<roots.length-1?roots[i+1][0]:end;for(let x=r[0];x<e-.01;x+=.2){const oc=Math.round((x-r[0])/.2)%2?12:0;at(x,t=>bass(r[1]+oc,t,.19,.07))}});
  const chords=(cs,d,v)=>cs.forEach(c=>at(c[0],t=>pad(c[1],t,d,v,1500)));
  const THEME=[[74,2],[76,1],[77,3],[81,2],[79,2],[77,1],[76,1],[77,2],[79,1],[81,3],[82,2],[84,2],[81,2],[86,3]],MAJ={77:78,82:83,84:85};
  const melody=(a,end,v,maj)=>{let lt=a;for(const n of THEME){if(lt>=end-.05)break;const d=Math.min(n[1]*.2,end-lt),m=maj&&MAJ[n[0]]||n[0];at(lt,t=>lead(m,t,d*.95,v));lt+=n[1]*.2}};
  // energy layers: a crescendo string ostinato, taiko runs and tom fills (used to drive the scenes that were too gentle)
  const ost=(a,b,ns,v,st)=>{st=st||.15;let i=0;for(let x=a;x<b-.02;x+=st,i++){const n=ns[i%ns.length],k=.45+.55*Math.min(1,(x-a)/Math.max(.01,b-a)*1.3);at(x,t=>o('m',M(n),0,t,st*.85,'sawtooth',v*k,.004))}};
  const taikoRun=(a,b,st,v,v2)=>{let i=0;for(let x=a;x<b-.02;x+=st,i++){const w=i%2&&v2!=null?v2:v;at(x,t=>taiko(t,w))}};
  const toms=(t0,v)=>[0,.07,.14,.21].forEach((d,i)=>at(t0+d,t=>{o('m',190-i*28,60,t,.28,'sine',v,.003);nz('m',t,.05,'lowpass',1200,300,v*.3,.002)}));
  sec('tree',0);
  // 1 World Tree: warm pad, music-box arpeggio, wind
  at(0,t=>{pad([50,57,64,65],t,2.7,.032,750);nz('m',t,4.6,'bandpass',420,900,.022,1.6,.7)});
  at(2.3,t=>pad([46,53,57,62],t,2.6,.032,850));
  [69,74,76,77,76,74,69,72,70,74,77,81,79,77,74,72].forEach((n,i)=>at(.25+i*.27,t=>bell(n,t,.045,1.8)));
  at(1.25,t=>o('m',M(93),M(101),t,.6,'sine',.018,.01));at(3.15,t=>o('m',M(96),M(103),t,.6,'sine',.016,.01));
  // a soft flute sings the theme's answer over the music box, with a warm bass underneath
  at(0,t=>bass(38,t,2.3,.05));at(2.3,t=>bass(34,t,2.3,.05));
  [[81,.9,.8],[79,1.7,.5],[77,2.2,.9],[76,3.1,.45],[77,3.55,1.0]].forEach(n=>at(n[1],t=>flute(n[0],t,n[2],.03)));
  // ...and a second, brighter phrase while the camera settles on the tree
  at(4.6,t=>{pad([50,57,62,65],t,2.5,.03,800);bass(38,t,2.4,.05)});
  [74,76,77,81,79,77,76,74].forEach((n,i)=>at(4.7+i*.28,t=>bell(n,t,.04,1.8)));
  [[81,4.9,.9],[84,5.9,1.0]].forEach(n=>at(n[1],t=>flute(n[0],t,n[2],.028)));
  // ...as the camera rises the music wakes up: a string ostinato and taiko build to a cymbal swell into the lantern night
  ost(3.0,7.0,[62,69,74,69],.011);taikoRun(3.2,6.9,.4,.08,.05);at(5.9,t=>riser(t,1.1,.05));toms(6.7,.06);at(6.98,t=>{crash(t,.05);boom(t,.18)});
  // 1b Lantern night: a gentle waltz in D major (bass on one, plucked chords on two and three), the theme turned bright on flute,
  //    lanterns whooshing up, and the cat's "mrrp!" when it leaps for one
  OFF=0;const V=S0('village');
  [[50,[62,66,69]],[43,[59,62,67]],[45,[61,64,69]],[50,[62,66,69]],[47,[59,62,66]],[45,[61,64,67]]].forEach((c,i)=>{const b=V+i*1.05;at(b,t=>bass(c[0],t,.9,.055));at(b+.35,t=>c[1].forEach(n=>pluck(n,t,.022)));at(b+.7,t=>c[1].forEach(n=>pluck(n+12,t,.016)))});
  [[74,0,.7],[76,.7,.35],[78,1.05,1.0],[81,2.1,.7],[79,2.8,.35],[78,3.15,1.0],[76,4.2,.7],[78,4.9,.35],[74,5.25,1.1]].forEach(n=>at(V+n[1],t=>flute(n[0],t,n[2],.032)));
  at(V+.2,t=>pad([62,66,69],t,6.2,.018,1000));for(let i=0;i<6;i++)at(V+.6+i*.9,t=>whoosh(t,.9,.012));
  at(V+3.05,t=>{o('s',900,520,t,.35,'triangle',.05,.01);o('s',1300,700,t+.05,.25,'sine',.03,.01)});at(V+3.62,t=>thunk(t,.07));
  // festival percussion: kick on one, tambourine on two and three, a little fill into each phrase
  for(let i=0;i<6;i++){const b=V+i*1.05;at(b,t=>kick(t,.09));at(b+.35,t=>{hat(t,.03);nz('m',t,.09,'bandpass',6500,0,.02,.002,2)});at(b+.7,t=>{hat(t,.03);nz('m',t,.09,'bandpass',6500,0,.02,.002,2)})}
  [V+2.0,V+4.1].forEach(x=>toms(x,.045));at(V+6.1,t=>riser(t,.4,.04));
  sec('eclipse',4.6);
  // 2 Eclipse: drone swell, timpani, shatter, falling comets
  at(4.6,t=>{stack([M(26),M(33),M(38)],t,4.3,.05,'sawtooth',90,90,620,1.6,6)});
  [4.95,5.6,6.05].forEach(x=>at(x,t=>taiko(t,.16)));at(5.0,t=>pad([46,49,53,58],t,1.5,.03,600));
  at(6.4,t=>{boom(t,.42);shatter(t,.16);crash(t,.09);brass([38,45,50],t,1.7,.07)});
  at(6.6,t=>pad([43,50,55,58],t,1.2,.034,900));at(7.7,t=>pad([45,52,55,61],t,1.15,.034,1000));
  [7.1,7.35,7.6,7.85].forEach(x=>at(x,t=>whoosh(t,.55,.05)));
  // trembling strings build to the shatter; a dark choir and a falling brass line after it
  for(let i=0;i<26;i++)at(4.9+i*.058,t=>o('m',M(i%2?65:62),M(i%2?65:62),t,.07,'sawtooth',.006+i*.0007,.01));
  at(6.45,t=>choir([38,45,50,53],t,2.2,.04));[50,49,46,45].forEach((n,i)=>at(6.9+i*.45,t=>brass([n,n-12],t,.5,.045)));
  // after the shatter the drums never stop: low string 16ths and a taiko run straight into the fall
  ost(6.45,8.8,[38,45,50,45],.013,.1);taikoRun(6.6,8.75,.2,.11,.06);toms(8.5,.06);
  // 2b The fall: a low choir and drone, rumbling, islands cracking off, and a lonely piano as a lantern drops into the dark
  OFF=0;const F=S0('fall');at(F,t=>{choir([38,41,45],t,5.4,.035);stack([M(26),M(33)],t,5.4,.04,'sawtooth',120,200,90,1,5)});
  [0,1.2,2.4,3.6].forEach(x=>at(F+x,t=>{nz('s',t,1.6,'lowpass',400,60,.12,.05,0,1);o('s',50,30,t,1.2,'sine',.08,.05)}));
  [.2,.9,1.5,2.2].forEach(x=>at(F+x+.1,t=>{boom(t,.18);for(let i=0;i<6;i++)thunk(t+.1+i*.07,.03)}));
  [[69,2.5],[67,3.0],[65,3.5],[64,4.0],[62,4.6]].forEach(n=>at(F+n[1],t=>piano(n[0],t,.05)));
  [93,91,89,88,86,84].forEach((n,i)=>at(F+2.6+i*.38,t=>bell(n,t,.012,1.2)));
  // a tragic but driving pulse: string ostinato, taiko eighths, tom fills, brass stabs as islands break
  ost(F,F+5.4,[38,41,45,41],.012);taikoRun(F,F+5.3,.3,.11,.06);[F+2.2,F+4.6].forEach(x=>toms(x,.06));[F+.3,F+1.0,F+1.6].forEach(x=>at(x,t=>brass([38,41,45],t,.45,.05)));
  sec('bosses',8.8);
  // 3 Six shadows: ostinato, taiko per panel, power chords, snare roll
  for(let x=8.8;x<13.4;x+=.2)at(x,t=>{o('m',M(38),M(38),t,.17,'sawtooth',.026,.004);o('m',M(26),M(26),t,.18,'sine',.05,.004)});
  [.38,.6,.82,2.63,2.85,3.07].forEach(x=>at(8.8+x,t=>{taiko(t,.22);crash(t,.025)}));
  [[8.9,[38,45,50]],[11.15,[41,48,53]],[12.3,[43,50,55]],[12.9,[45,52,57]]].forEach(c=>at(c[0],t=>brass(c[1],t,1.1,.06)));
  for(let i=0;i<12;i++)at(13.0+i*.045,t=>snare(t,.02+i*.006));
  for(let x=8.8;x<13.3;x+=.1)at(x,t=>pluck(Math.round((x-8.8)*10)%2?77:74,t,.012));
  [8.9,11.15].forEach(x=>at(x,t=>choir([50,53,57,62],t,1.6,.03)));
  // 3b A hundred years: a clock ticking, wind, slow chords and a lone flute; a few bells of hope as spring returns
  OFF=0;const A0=S0('ages');for(let i=0;i<10;i++)at(A0+.1+i*.5,t=>{o('s',2100,2000,t,.03,'square',.012,.001);nz('s',t,.02,'highpass',5000,0,.02)});
  at(A0,t=>{pad([45,52,57,60],t,2.5,.03,700);nz('m',t,5,'bandpass',300,700,.025,2,.6)});at(A0+2.5,t=>pad([41,48,53,57],t,2.5,.03,900));
  [[69,.4,1.1],[72,1.6,.8],[71,2.5,1.2],[69,3.8,1.0]].forEach(n=>at(A0+n[1],t=>flute(n[0],t,n[2],.028)));
  at(A0+3.4,t=>[74,78,81].forEach((n,i)=>bell(n,t+i*.12,.02,1.6)));
  // time-lapse drive: a ticking arpeggio and a kick pulse that speed up with the years, then a riser into the awakening
  ost(A0+.5,A0+5,[57,60,64,69,64,60],.009,.125);for(let x=A0+1,i=0;x<A0+4.9;x+=i<4?.5:.25,i++)at(x,t=>kick(t,.07+Math.min(.06,i*.006)));at(A0+3.8,t=>riser(t,1.2,.05));
  sec('wake',13.6);
  // 4 Awakening: heartbeat, descending twinkles, the eye opens, rising notes of hope
  [13.95,14.2,14.95,15.2].forEach((x,i)=>at(x,t=>kick(t,i%2?.07:.1)));
  [93,88,86,81,79,76,74].forEach((n,i)=>at(13.75+i*.19,t=>bell(n,t,.02,1.2)));
  at(15.1,t=>{bell(74,t,.05,2.6);whoosh(t,.8,.03);pad([62,69,74],t,2.6,.02,1400)});
  at(16.2,t=>shing(t,.14));[62,65,69,74].forEach((n,i)=>at(16.95+i*.15,t=>pluck(n,t,.05)));
  [[62,14.3],[65,14.75],[69,15.2],[67,15.65],[65,16.1],[64,16.55]].forEach(n=>at(n[1],t=>piano(n[0],t,.035)));
  // 4b First friend: footsteps, a little tune, POP, a double scream (scratch + "AAAH" + "EEEK"), a giggly pizzicato, the seed's chime
  OFF=0;const MT=S0('meet');for(let i=0;i<6;i++)at(MT+.1+i*.27,t=>thunk(t,.03));
  at(MT,t=>pad([62,66,69],t,1.6,.018,1200));[74,78,81,78].forEach((n,i)=>at(MT+.15+i*.38,t=>pluck(n,t,.03)));
  at(MT+1.55,t=>pop(t,.07));at(MT+1.75,t=>{scratch(t,.06);o('s',300,520,t+.05,.9,'sawtooth',.03,.02);o('s',1400,2200,t+.1,.8,'square',.012,.02);crash(t,.03)});
  at(MT+3.0,t=>whoosh(t,.3,.04));[62,0,69,66,0,74,71,69].forEach((n,i)=>{if(n)at(MT+3.05+i*.16,t=>pluck(n,t,.045))});[38,45,38,45].forEach((n,i)=>at(MT+3.05+i*.32,t=>tuba(n,t,.14,.07)));
  at(MT+3.6,t=>[81,86,90,93].forEach((n,i)=>bell(n,t+i*.07,.03,1.4)));at(MT+4.3,t=>[86,90].forEach((n,i)=>bell(n,t+i*.1,.025,1)));
  sec('wings',17.6);const OO=S0('oops'),BONK=OO+1.25,CL=S0('clash'),MO=S0('montage'),RS=S0('restore'),TI=S0('title'),BK=BONK-OFF;
  // 5 Wings: riser, burst, then the driving beat and the hero theme... which keeps going, full of confidence, right into the first flight
  at(17.6,t=>riser(t,1.02,.07));
  at(18.6,t=>{boom(t,.36);crash(t,.09);brass([41,45,48,53],t,1.9,.07);pad([53,57,60,65,69],t,1.6,.035,1600)});
  [81,84,86,89].forEach((n,i)=>at(18.7+i*.09,t=>bell(n,t,.025,1.4)));
  beat(19.5,BK,1);bassline([[19.5,38],[20.3,41],[21.1,46],[21.9,48]],BK);melody(19.5,BK,.05);
  chords([[19.5,[50,57,62,65]],[20.3,[53,57,60,65]],[21.1,[46,53,58,62]],[21.9,[48,55,60,64]]],.85,.022);
  OFF=0;at(OO,t=>{crash(t,.05);whoosh(t,.5,.06)});at(OO+.15,t=>whoosh(t,1.0,.05));
  // 6 The first flight: a record scratch stops the theme dead on its high note. Bonk, a slide whistle down the wall,
  //   dizzy tweets, the sprout's giggle, and a bouncy "well, that happened" tune on pizzicato and tuba
  at(BONK-.03,t=>scratch(t,.09));at(BONK,t=>{bonk(t,.3);crash(t,.03)});at(BONK+.42,t=>slideW(t,1.15,.05));
  for(let i=0;i<6;i++)at(BONK+.5+i*.28,t=>tweet(t,.025));
  at(OO+2.1,t=>pop(t,.06));at(OO+2.4,t=>giggle(t,.05));
  [62,0,66,69,66,0,64,61,57].forEach((n,i)=>{if(n)at(BONK+.75+i*.13,t=>pluck(n,t,.05))});
  [38,45,38,45,33].forEach((n,i)=>at(BONK+.75+i*.26,t=>tuba(n,t,.15,.08)));
  // 6b Practice: a bouncy tuba + pizzicato march; every try gets its own crash (spin and drop, lake splash and sad trombone,
  //    clonk and a falling block), then a fanfare, a giggle and tiny applause for the perfect landing
  const TR=S0('training');for(let c=0;c<4;c++){for(let s=0;s<5;s++)at(TR+c*1.5+s*.3,t=>tuba([38,43,41,45][c]+(s%2?7:0),t,.13,.07));at(TR+c*1.5,t=>{crash(t,.03);snare(t,.04)})}
  [74,78,81,78,79,83,86,83,77,81,84,81,76,79,83,85].forEach((n,i)=>at(TR+i*.375,t=>pluck(n,t,.035)));
  at(TR+.2,t=>whoosh(t,.9,.04));at(TR+1.05,t=>slideW(t,.45,.04));
  at(TR+2.18,t=>{splash(t,.16);splash(t+.08,.1)});at(TR+2.45,t=>wahwah(t,.035));
  at(TR+3.52,t=>bonk(t,.25));at(TR+3.92,t=>thunk(t,.1));
  at(TR+5.1,t=>{brass([50,54,57,62],t,.9,.06);shing(t,.1)});at(TR+5.25,t=>giggle(t,.04));for(let i=0;i<6;i++)at(TR+5.3+i*.09,t=>nz('s',t,.05,'bandpass',1800,0,.05,.002,1));
  // 6c The journey: running strings, drums, the theme on lead, a whoosh for every island that flashes past
  const J=S0('journey');beat(J,J+6,.8);bassline([[J,38],[J+1.5,46],[J+3,48],[J+4.5,45]],J+6);
  for(let x=0;x<5.95;x+=.15){const n=[62,65,69,65][Math.round(x/.15)%4];at(J+x,t=>o('m',M(n),0,t,.12,'sawtooth',.008,.005))}
  chords([[J,[50,57,62,65]],[J+1.5,[46,53,58,62]],[J+3,[48,55,60,64]],[J+4.5,[45,52,57,61]]],1.45,.022);melody(J+.6,J+6,.04);
  for(let i=0;i<4;i++)at(J+i*1.5+.7,t=>whoosh(t,.6,.04));
  [[J,[50,57,62]],[J+1.5,[46,53,58]],[J+3,[48,55,60]],[J+4.5,[45,52,57]]].forEach(c=>at(c[0],t=>{brass(c[1],t,.45,.055);crash(t,.035)}));[J+1.28,J+2.78,J+4.28,J+5.75].forEach(x=>toms(x,.055));
  // 7 The fight: thunder and rain, a drone and taiko as the wanderer charges. The strike drops the music to a muffled heartbeat
  //   and a lonely piano in the rain; a choir swells as they stand back up, and the brass answers when the wings reignite
  const SK=CL+.9,KN=CL+1.25,UP=CL+2.9,IG=CL+3.6;
  at(CL,t=>{thunder(t,.22);stack([M(26),M(33),M(38)],t,1.2,.05,'sawtooth',90,300,200,.2,6)});
  for(let i=0;i<6;i++)at(CL+i*.75,t=>rain(t,.035));
  [CL+.15,CL+.45,CL+.62,CL+.75].forEach((x,i)=>at(x,t=>taiko(t,.14+i*.03)));
  for(let i=0;i<10;i++)at(CL+.4+i*.05,t=>snare(t,.015+i*.006));
  at(CL+.1,t=>choir([50,53,57],t,.9,.03));
  at(SK,t=>{boom(t,.48);shatter(t,.08);crash(t,.08);brass([37,44,49],t,.9,.06)});
  at(CL+1.7,t=>thunder(t,.14));
  [0,.25,.8,1.05].forEach((x,i)=>at(KN+.2+x,t=>kick(t,i%2?.06:.09)));
  [69,67,65,64,65,64,62].forEach((n,i)=>at(KN+.25+i*.22,t=>piano(n,t,.045)));
  at(UP-.7,t=>riser(t,1.3,.05));at(UP,t=>{choir([62,66,69,74],t,1.6,.04);pad([50,57,62,66],t,1.6,.03,1200)});
  [74,78,81].forEach((n,i)=>at(UP+.2+i*.22,t=>bell(n,t,.035,1.4)));
  at(IG,t=>{boom(t,.4);crash(t,.09);shing(t,.12);brass([38,45,50,54,57],t,1.4,.075)});
  [86,90,93].forEach((n,i)=>at(IG+.05+i*.07,t=>bell(n,t,.025,1.2)));
  // 7b Campfire: crackling fire, crickets, soft guitar arpeggios and flute; Sprig snores (in... whistle out) until the bubble pops
  const CP=S0('camp');for(let i=0;i<40;i++){const j=R()*.05,d=.04+R()*.05,f=1500+R()*2500,v=.02+R()*.03;at(CP+i*.135+j,t=>nz('s',t,d,'bandpass',f,0,v,.002,2))}
  at(CP,t=>nz('s',t,5.4,'lowpass',500,300,.03,1,0));
  [[50,[62,66,69,74]],[47,[62,66,71,74]],[43,[59,62,67,71]],[45,[61,64,69,73]]].forEach((c,i)=>{const b=CP+i*1.35;at(b,t=>bass(c[0],t,1.2,.04));c[1].forEach((n,j)=>at(b+j*.17,t=>pluck(n,t,.03)))});
  [[78,.5,1],[76,1.85,.8],[74,3.2,1.2]].forEach(n=>at(CP+n[1],t=>flute(n[0],t,n[2],.026)));
  for(let i=0;i<14;i++)at(CP+.3+i*.37,t=>{o('s',4200,4300,t,.04,'sine',.006,.002);o('s',4200,4300,t+.06,.04,'sine',.006,.002)});
  [1.0,2.6].forEach(x=>at(CP+x,t=>{nz('s',t,.7,'lowpass',380,200,.05,.3,0);o('s',1100,1500,t+.75,.5,'sine',.012,.2)}));
  at(CP+4.2,t=>{pop(t,.07);o('s',900,1500,t+.05,.12,'triangle',.04,.004)});
  for(let x=CP+.2,i=0;x<CP+5.3;x+=.45,i++)at(x,t=>o('s',i%3==2?260:200,i%3==2?220:170,t,.09,'sine',.022,.003));   // a soft hand-drum groove by the fire
  // 8 Montage: the theme returns at full strength over the beat, plus each cut's own sounds (and a sad trombone for the boot)
  const cut=i=>MO+MCUT[i][0];
  beat(MO,RS-.1,1.1);bassline([[cut(0),38],[cut(1),46],[cut(2),48],[cut(2)+FPRE+.8,45],[cut(3),50]],RS-.1);melody(MO,RS-.15,.055);
  chords([[cut(0),[50,57,62,65]],[cut(1),[46,53,58,62]],[cut(2),[48,55,60,64]],[cut(2)+FPRE+.8,[45,52,57,61]],[cut(3),[50,57,62,65]]],.85,.024);
  for(let i=0;i<4;i++)at(cut(i),t=>{crash(t,.04);whoosh(t,.3,.04)});
  for(let i=0;i<18;i++)at(cut(0)+.04+i*.042,t=>thunk(t,.07));
  at(cut(1)+.3,t=>clink(t,.14));at(cut(1)+.58,t=>{clink(t,.16);nz('s',t,.3,'lowpass',900,200,.08)});
  {const F=cut(2)+FPRE;at(cut(2)+.3,t=>splash(t,.025));at(F+.22,t=>splash(t,.1));at(F+.48,t=>wahwah(t,.045));at(F+.9,t=>splash(t,.12));at(F+1.22,t=>splash(t,.06));at(F+1.45,t=>splash(t,.07))}
  at(cut(3),t=>whoosh(t,.4,.05));at(cut(3)+.45,t=>whoosh(t,.4,.05));
  // 8b Restoration: a hush, the seed sinks in, then the light bursts out (choir, brass, cascading bells) and the theme
  //    comes back in MAJOR over the full beat as the islands rise; a riser into the title
  at(RS,t=>{pad([50,53,57],t,1.6,.025,600);nz('m',t,1.6,'bandpass',300,600,.02,.6,.6)});[74,77,81].forEach((n,i)=>at(RS+.3+i*.35,t=>bell(n,t,.03,1.6)));
  at(RS+1.3,t=>o('s',1500,400,t,.3,'sine',.03,.01));
  at(RS+1.6,t=>{boom(t,.4);crash(t,.08);shing(t,.12);brass([38,45,50,54,57],t,2.2,.06);choir([62,66,69,74],t,4.6,.04)});
  for(let i=0;i<14;i++)at(RS+1.7+i*.12,t=>bell([74,78,81,86,90,93,90][i%7],t,.022,1.2));
  taikoRun(RS+1.6,RS+2.4,.2,.12,.07);ost(RS+2.4,TI-.1,[62,66,69,74],.011,.15);toms(TI-.35,.07);
  beat(RS+2.4,TI-.1,1);bassline([[RS+2.4,38],[RS+3.4,43],[RS+4.4,45],[RS+5.4,50]],TI-.1);melody(RS+2.4,TI-.15,.05,true);
  chords([[RS+2.4,[62,66,69,74]],[RS+3.4,[59,62,67,71]],[RS+4.4,[61,64,69,73]],[RS+5.4,[62,66,69,74]]],.95,.026);
  at(TI-.9,t=>riser(t,.9,.06));
  // 9 Title: slam, then a shimmering resolve that fades into the home screen
  at(TI+.55,t=>{boom(t,.5);crash(t,.1);kick(t,.22);brass([38,45,50,53,57],t,2.6,.075);pad([50,57,62,64,65,69],t,4.3,.036,1500)});
  [74,77,81,86,81,77,76,79,83,88,83,79,77,81,86,89].forEach((n,i)=>at(TI+1.0+i*.22,t=>bell(n,t,.03,1.6)));
  [[86,TI+1.0,1.2],[84,TI+2.2,.6],[81,TI+2.8,1.6]].forEach(n=>at(n[1],t=>flute(n[0],t,n[2],.03)));
  at(TI+1.55,t=>o('s',1800,5200,t,.7,'sine',.035,.05,0,1));
  // the title rides out on the full kit and taiko before the gentle last chord
  at(TI+.55,t=>taiko(t,.2));beat(TI+.95,TI+3.15,.85);bassline([[TI+.95,38],[TI+1.75,46],[TI+2.55,45]],TI+3.15);taikoRun(TI+.95,TI+3.1,.4,.08,.05);
  // "Your story begins": soft falling bells, the flute's last word, one long warm chord
  at(TI+3.2,t=>[86,81,78,74].forEach((n,i)=>bell(n,t+i*.2,.026,2)));at(TI+4.2,t=>flute(78,t,1.6,.026));at(TI+4.6,t=>{pad([50,57,62,66,69],t,3.2,.03,1200);bass(38,t,3,.04)});
  return E.sort((a,b)=>a[0]-b[0])}

 // ================= LAUNCH STORY INTRO =================
 const STORY=[['tree',7.0,'Long ago, the World Tree held up the sky, its roots binding every island to the stars.'],
  ['village',6.5,'Islanders built their homes in its branches. And every night, they sent lanterns up to the stars.'],
  ['eclipse',4.2,'Then the Eclipse came. The sky shattered... and the roots fell silent.'],
  ['fall',5.5,'Islands tumbled from the sky, and one by one, the roots went dark.'],
  ['bosses',4.8,'Six guardians, twisted by the dark, broke loose upon the world.'],
  ['ages',5.0,'For a hundred years, the world waited... for someone to wake.'],
  ['wake',4.0,'Then, deep beneath the roots, a lone wanderer awoke.'],
  ['meet',5.0,'Their first friend was a sprout. A small, very loud sprout.'],
  ['wings',3.8,'A spark of fallen starlight became their wings.'],
  ['oops',3.4,'Their first flight went... about as well as you would expect.'],
  ['training',6.0,'So they practised. And practised. And practised some more.'],
  ['journey',6.0,'They crossed the shattered islands, from crystal caves to burning peaks.'],
  ['clash',5.0,'The dark struck them down, again and again. But every time, they stood back up.'],
  ['camp',5.5,'And they never had to face the dark alone.'],
  ['montage',4.9,'Build. Mine. Fish. Climb. And mend the roots.'],
  ['restore',6.5,'Root by root, the light came back, and the islands rose to meet the sky.'],
  ['title',7.5,'']];   // 90 s in all
 for(const s of STORY)s[4]=s[1];   // s[4]: the designed length. s[1] may grow so the narration fits (retime)
 let ST=0,TI0=0;function stime(){ST=0;for(const s of STORY){s[3]=ST;ST+=s[1]}TI0=STORY[STORY.length-1][3]}stime();
 const MCUT=[[0,.9],[.9,.9],[1.8,2.2],[4.0,.9]];   // montage cuts: start, length (the fishing cut is longest: the still lake, then the boot, then the koi)
 function mcut(d){const e=Math.max(0,d-4.9),b=.9+e*.2,m=.9+e*.2,f=2.2+e*.25;MCUT[0]=[0,b];MCUT[1]=[b,m];MCUT[2]=[b+m,f];MCUT[3]=[b+m+f,Math.max(.9,d-(b+m+f))]}
 // ---- narration timing. Every scene is at least as long as its spoken line plus a breath, so a line always finishes before the next
 // scene's line starts (lines used to overrun their scenes, pile up in the speech queue, and get cut off by the "RootBound" title call).
 // Studio voice-over (optional): if vo/<scene>.mp3 files sit next to index.html (tools/vo-elevenlabs.js renders them with ElevenLabs),
 // their real lengths drive the timing and they play instead of the system voice. vo/title.mp3 is probed first (desktop app only); only if it exists are
 // the others loaded. If any clip is missing or broken the whole intro uses the system voice, so voices never mix.
 const VO={ok:false,el:{},n:0,bad:0,need:0};
 try{if(typeof Audio!='undefined'&&/Electron/.test(navigator.userAgent)){const ids=STORY.filter(s=>s[2]).map(s=>s[0]).concat(['title']);VO.need=ids.length;
  const probe=(id,then)=>{const a=new Audio();a.preload='auto';a.onloadedmetadata=()=>{if(isFinite(a.duration)&&a.duration>.25){VO.el[id]=a;VO.n++;VO.ok=VO.n==VO.need&&!VO.bad;then&&then()}else VO.bad++};a.onerror=()=>{VO.bad++};a.src='vo/'+id+'.mp3'};
  probe('title',()=>ids.forEach(id=>{if(id!='title')probe(id)}))}}catch(_){}
 const BREATH=.5;
 function retime(k){k=k||1;const p=VOX12.params();for(const s of STORY){let need=0;if(s[2])need=(VO.ok&&VO.el[s[0]]?VO.el[s[0]].duration:VOX12.est(s[2],p.rate))+BREATH+.15;s[1]=Math.max(s[4],Math.round(need/k*10)/10)}
  stime();mcut(STORY.find(s=>s[0]=='montage')[1])}
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
 function crackPaths(g,f,a){for(const ps of[[10,'rgba(255,80,200,'+(.26*a)+')'],[2.6,'rgba(255,240,255,'+(.95*a)+')']]){g.lineWidth=ps[0];g.strokeStyle=ps[1];g.beginPath();for(const b of I.cr){const n=Math.floor(b.p.length*cl(f*1.5-b.d*.32,0,1));if(n<2)continue;g.moveTo(b.p[0][0],b.p[0][1]);for(let i=1;i<n;i++)g.lineTo(b.p[i][0],b.p[i][1])}g.stroke()}}
 // the fully grown cracks are baked once (re-stroking ~1000 wide segments every frame cost the GPU a lot); only the growth is live
 AB.crk=()=>art(2000,1800,.7,x=>{x.translate(1000,700);x.globalCompositeOperation='lighter';crackPaths(x,1,1)});
 // growing cracks reveal the baked art through an expanding circle (one cheap clip instead of re-stroking every segment each frame)
 function cracks(g,f,cx,cy,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;if(f<.999){g.beginPath();g.arc(cx,cy,30+eo(f)*1150,0,TAU);g.clip()}put(g,as('crk'),cx-1000,cy-700);g.restore()}
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
 // one comic panel per guardian (background, silhouette and name plate), masked to its slanted frame once instead of clipped every frame
 const PSK=72,PW=533.33,PZ=1.34;
 function pnlArt(id){return art(PW+2*PSK,900,.7,x=>{x.beginPath();x.moveTo(2*PSK,0);x.lineTo(PW+2*PSK,0);x.lineTo(PW,900);x.lineTo(0,900);x.closePath();x.clip();const cx=PW/2+PSK;
  put(x,as('pbg_'+id),cx-310,0,620,900);const sw=420*PZ,sh=540*PZ;put(x,as('sil_'+id),cx-sw/2,880-sh,sw,sh);
  const ny=688,nx=cx+PSK*(1-2*688/900);x.font='italic 900 34px '+SANS;x.textAlign='center';x.fillStyle='rgba(0,0,0,.55)';x.fillRect(nx-220,ny-36,440,58);x.fillStyle=BC[id];x.fillRect(nx-220,ny+18,440,4);x.fillStyle='#fff';x.fillText(BNM[id].toUpperCase(),nx,ny+4)})}
 BIDS.forEach(id=>{AB['sil_'+id]=()=>silArt(id);AB['pbg_'+id]=()=>pbgArt(id);AB['pnl_'+id]=()=>pnlArt(id)});
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
 const BID=[2,5,3,6,7,10];   // grass, planks, stone, glass, brick, gold: the game's own painted block sprites (BART9), so the story matches the world
 function blk(g,i,x,y,w,h){h=h==null?w:h;let c=null;try{if(typeof spr=='function'&&typeof BLK!='undefined'&&BLK[BID[i]])c=spr(BID[i],(x/64|0)&7,(y/64|0)&7)}catch(_){}
  if(c){g.drawImage(c,x,y,w,h);return}const s=as('blk'),q=s.c.width/324;g.drawImage(s.c,i*54*q,0,54*q,54*q,x,y,w,h)}
 AB.m1=()=>art(1600,900,.35,x=>{const gr=x.createLinearGradient(0,0,0,900);gr.addColorStop(0,'#3a2f86');gr.addColorStop(.45,'#c0609a');gr.addColorStop(.75,'#ff9f78');gr.addColorStop(1,'#ffd9a0');x.fillStyle=gr;x.fillRect(0,0,1600,900);const s=x.createRadialGradient(1200,560,20,1200,560,420);s.addColorStop(0,'rgba(255,250,220,1)');s.addColorStop(.12,'rgba(255,230,170,.8)');s.addColorStop(1,'rgba(255,200,150,0)');x.fillStyle=s;x.fillRect(0,0,1600,900);
  x.fillStyle='rgba(90,50,110,.55)';for(const i of[[180,330,140],[420,250,90],[1430,300,120],[1000,200,70]]){x.beginPath();x.moveTo(i[0]-i[2],i[1]);x.lineTo(i[0]+i[2],i[1]);x.lineTo(i[0]+i[2]*.3,i[1]+i[2]*.9);x.lineTo(i[0]-i[2]*.4,i[1]+i[2]*.7);x.closePath();x.fill()}});
 AB.m2=()=>art(1600,900,.7,x=>{const T=108,r=srnd(61);let st=null,ores=[];try{if(typeof spr=='function'&&typeof BLK!='undefined'&&BLK[3]){st=b=>spr(b,(r()*8)|0,0);ores=Object.keys(BLK).filter(b=>/Ore/i.test(BLK[b][0])&&!/Deep|Nether|Void/i.test(BLK[b][0])).map(Number)}}catch(_){}
  // the world's own painted stone and ore blocks (BART9), dimmed to cave light; the flat fallback below if sprites are unavailable
  if(st){for(let gy=-T/2;gy<900;gy+=T)for(let gx=-20;gx<1600;gx+=T){const o=ores.length&&r()<.15?ores[(r()*ores.length)|0]:3;x.drawImage(st(o),gx,gy,T,T)}x.fillStyle='rgba(8,10,28,.42)';x.fillRect(0,0,1600,900)}
  else for(let gy=-T/2;gy<900;gy+=T)for(let gx=-20;gx<1600;gx+=T){const v=r();x.fillStyle=mix('#3a3d4f','#5a5d70',v);x.fillRect(gx,gy,T,T);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(gx,gy,T,8);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(gx,gy+T-8,T,8);x.fillRect(gx+T-6,gy,6,T);
   x.fillStyle='rgba(0,0,0,.25)';x.fillRect(gx+20+v*30,gy+30,24,16);x.fillRect(gx+60-v*20,gy+66,30,14);
   if(r()<.18){const c=r()<.6?'#7ff6ff':'#ffd36a';x.fillStyle=c;x.shadowColor=c;x.shadowBlur=14;for(let k=0;k<4;k++){const ox=gx+20+r()*68,oy=gy+20+r()*68;x.beginPath();x.moveTo(ox,oy-10);x.lineTo(ox+7,oy);x.lineTo(ox,oy+10);x.lineTo(ox-7,oy);x.closePath();x.fill()}x.shadowBlur=0}}
  const v=x.createRadialGradient(800,430,100,800,450,900);v.addColorStop(0,'rgba(255,190,120,.18)');v.addColorStop(.5,'rgba(0,0,0,.2)');v.addColorStop(1,'rgba(0,0,0,.85)');x.fillStyle=v;x.fillRect(0,0,1600,900)});
 AB.m3=()=>art(1600,900,.45,x=>{const gr=x.createLinearGradient(0,0,0,520);gr.addColorStop(0,'#050a26');gr.addColorStop(1,'#25306a');x.fillStyle=gr;x.fillRect(0,0,1600,520);const r=srnd(88);x.fillStyle='#fff';for(let i=0;i<120;i++){x.globalAlpha=.3+r()*.7;x.fillRect(r()*1600,r()*450,1.5+r()*1.5,1.5+r()*1.5)}x.globalAlpha=1;
  const mg=x.createRadialGradient(1180,190,30,1180,190,260);mg.addColorStop(0,'rgba(220,235,255,.65)');mg.addColorStop(1,'rgba(220,235,255,0)');x.fillStyle=mg;x.fillRect(800,0,800,500);x.fillStyle='#f4f8ff';x.beginPath();x.arc(1180,190,58,0,TAU);x.fill();
  x.fillStyle='#0a0e26';x.beginPath();x.moveTo(0,520);for(let px=0;px<=1600;px+=40)x.lineTo(px,500-Math.abs(Math.sin(px*.004))*60-r()*14);x.lineTo(1600,520);x.closePath();x.fill();for(let i=0;i<7;i++){x.fillStyle='#ffd36a';x.shadowColor='#ffb84a';x.shadowBlur=10;x.fillRect(120+r()*1300,486+r()*14,4,4)}x.shadowBlur=0;
  const wg=x.createLinearGradient(0,520,0,900);wg.addColorStop(0,'#18234f');wg.addColorStop(1,'#050816');x.fillStyle=wg;x.fillRect(0,520,1600,380);x.fillStyle='rgba(230,240,255,.5)';for(let y=530;y<900;y+=9){const w=30+(y-520)*.5*r();x.globalAlpha=.15+.5*(1-(y-520)/380);x.fillRect(1180-w/2+(r()-.5)*20,y,w,2.2)}x.globalAlpha=1});
 AB.koi=()=>art(240,120,1,x=>{x.translate(120,60);x.shadowColor='#ffb84a';x.shadowBlur=22;const gr=x.createLinearGradient(-80,0,80,0);gr.addColorStop(0,'#ff7a3a');gr.addColorStop(.6,'#ffd36a');gr.addColorStop(1,'#fff3c8');x.fillStyle=gr;x.beginPath();x.ellipse(10,0,66,24,0,0,TAU);x.fill();x.beginPath();x.moveTo(-50,0);x.lineTo(-104,-30);x.quadraticCurveTo(-88,0,-104,30);x.closePath();x.fill();
  x.shadowBlur=0;x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(0,-22);x.quadraticCurveTo(20,-44,40,-20);x.closePath();x.fill();x.fillStyle='#1a1020';x.beginPath();x.arc(56,-6,4.5,0,TAU);x.fill();x.fillStyle='rgba(255,90,60,.6)';for(const s of[[-10,-6],[14,8],[30,-10]]){x.beginPath();x.arc(s[0],s[1],8,0,TAU);x.fill()}});
 // ---- art: the lake's mirror image (sky, moon and treeline flipped, cooled and softened), a caustic light-net tile, a wet boot
 AB.m3r=()=>{const s=as('m3'),q=s.c.width/1600,c=mk(800,260),x=c.getContext('2d');x.translate(0,260);x.scale(1,-1);try{x.filter='blur(1.2px)'}catch(_){}
  x.drawImage(s.c,0,0,s.c.width,520*q,0,0,800,260);x.setTransform(1,0,0,1,0,0);x.filter='none';x.globalCompositeOperation='multiply';x.fillStyle='#8aa4d8';x.fillRect(0,0,800,260);
  x.globalCompositeOperation='source-over';const g=x.createLinearGradient(0,0,0,260);g.addColorStop(0,'rgba(150,175,235,.18)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,800,260);return{c,w:1600,h:520}};
 AB.caus=()=>{const N=256,c=mk(N,N),x=c.getContext('2d'),d=x.createImageData(N,N),K=TAU/N;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const u=i*K,v=j*K,a=Math.sin(u*3+1.3*Math.sin(v*2)),b=Math.sin(v*3+1.1*Math.sin(u*2+.5)),e=Math.sin((u-v)*2+.9*Math.sin(u+v*2)),
   l=Math.pow(cl(1-Math.abs(a+b+e)/1.1,0,1),5),o=(j*N+i)*4;d.data[o]=170;d.data[o+1]=228;d.data[o+2]=255;d.data[o+3]=l*255|0}x.putImageData(d,0,0);return{c,w:N,h:N}};
 AB.bootW=()=>art(150,150,1,x=>{x.translate(44,80);   // hook point at (40,10), same shape as boot()
  x.fillStyle='#6a4426';x.strokeStyle='#1a0f0a';x.lineWidth=5;x.beginPath();x.moveTo(-26,-70);x.lineTo(18,-70);x.lineTo(20,-8);x.quadraticCurveTo(70,-6,74,14);x.lineTo(74,26);x.lineTo(-30,26);x.closePath();x.fill();x.stroke();
  x.fillStyle='#2a1a10';x.fillRect(-32,18,108,12);x.fillStyle='#8a5c36';x.fillRect(-26,-70,44,12);x.strokeStyle='#d8c090';x.lineWidth=3;for(let i=0;i<3;i++){x.beginPath();x.moveTo(-2,-50+i*14);x.lineTo(14,-44+i*14);x.stroke()}
  // night grade (moonlit, soaked leather is darker), a cool moon rim on the right, glossy wet streaks, weed caught on the heel
  x.globalCompositeOperation='source-atop';x.fillStyle='rgba(16,26,66,.42)';x.fillRect(-60,-90,200,160);
  const rg=x.createLinearGradient(30,0,80,0);rg.addColorStop(0,'rgba(190,220,255,0)');rg.addColorStop(1,'rgba(190,220,255,.6)');x.fillStyle=rg;x.fillRect(-60,-90,200,160);
  const tg=x.createLinearGradient(0,-72,0,-50);tg.addColorStop(0,'rgba(200,225,255,.35)');tg.addColorStop(1,'rgba(200,225,255,0)');x.fillStyle=tg;x.fillRect(-60,-90,200,40);
  x.fillStyle='rgba(235,245,255,.55)';for(const s of[[-17,-58,3,38],[9,-54,2,26],[34,-1,24,2.4],[56,6,10,2]]){x.beginPath();x.ellipse(s[0],s[1],s[2],s[3]/2+s[3]%1,0,0,TAU);x.fill()}
  x.globalCompositeOperation='source-over';x.strokeStyle='#2f6a3a';x.lineWidth=3;x.beginPath();x.moveTo(-30,22);x.quadraticCurveTo(-44,34,-38,52);x.moveTo(-26,24);x.quadraticCurveTo(-30,40,-22,50);x.stroke()});
 AB.vig=()=>{const c=mk(320,180),x=c.getContext('2d'),r=x.createRadialGradient(160,90,40,160,90,190);r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(.7,'rgba(0,0,0,.25)');r.addColorStop(1,'rgba(0,0,0,.75)');x.fillStyle=r;x.fillRect(0,0,320,180);return{c,w:320,h:180}};
 // ---- art: title letters
 AB.title=()=>{const txt='ROOTBOUND',F='700 210px '+SERIF,tc=mk(10,10).getContext('2d');tc.font=F;const ws=[...txt].map(ch=>tc.measureText(ch).width),gap=10,tot=ws.reduce((a,b)=>a+b,0)+gap*(txt.length-1);let cx=-tot/2;
  const L=[...txt].map((ch,i)=>{const w=ws[i],a=art(w+90,300,1,x=>{x.font=F;x.textAlign='center';x.textBaseline='middle';const gr=x.createLinearGradient(0,70,0,230);gr.addColorStop(0,'#fffaf0');gr.addColorStop(.5,'#ffd77a');gr.addColorStop(1,'#c3822a');
   x.shadowColor='rgba(255,200,110,.9)';x.shadowBlur=36;x.lineWidth=10;x.strokeStyle='#1a0f2e';x.strokeText(ch,(w+90)/2,156);x.shadowBlur=0;x.fillStyle=gr;x.fillText(ch,(w+90)/2,156);x.lineWidth=1.5;x.strokeStyle='rgba(255,255,255,.7)';x.strokeText(ch,(w+90)/2,156)});const o={a,x:cx+w/2};cx+=w+gap;return o});
  const word=art(tot+90,300,.6,x=>{x.font=F;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';let px=45;[...txt].forEach((ch,i)=>{x.fillText(ch,px+ws[i]/2,156);px+=ws[i]+gap})});return{L,word,tot}};
 AB.band=()=>art(260,300,.5,x=>{const gr=x.createLinearGradient(0,0,260,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,260,300)});
 // ---- art: the storm-wrecked ruins where the wanderer faces the Eclipse Lord, and a film-grain tile
 AB.storm=()=>art(1600,900,.35,x=>{const gr=x.createLinearGradient(0,0,0,900);gr.addColorStop(0,'#05030a');gr.addColorStop(.5,'#1c0d2a');gr.addColorStop(.78,'#2e1338');gr.addColorStop(1,'#0a0510');x.fillStyle=gr;x.fillRect(0,0,1600,900);const r=srnd(71);
  x.fillStyle='rgba(70,45,100,.35)';for(let i=0;i<28;i++){const cx=r()*1600,cy=40+r()*320,rr=70+r()*150;x.beginPath();x.ellipse(cx,cy,rr*1.9,rr*.45,0,0,TAU);x.fill()}
  const hz=x.createRadialGradient(1180,700,20,1180,700,700);hz.addColorStop(0,'rgba(190,80,160,.28)');hz.addColorStop(1,'rgba(190,80,160,0)');x.fillStyle=hz;x.fillRect(0,0,1600,900);
  x.fillStyle='#0c0714';for(const p of[[110,46,300],[290,38,190],[500,30,130],[1380,50,290],[1530,34,170]]){const bx=p[0]-p[1]/2,top=760-p[2];x.beginPath();x.moveTo(bx,760);x.lineTo(bx,top+10);x.lineTo(bx+p[1]*.3,top-12);x.lineTo(bx+p[1]*.55,top+6);x.lineTo(bx+p[1],top-6);x.lineTo(bx+p[1],760);x.closePath();x.fill()}
  x.beginPath();x.moveTo(660,760);x.lineTo(660,560);x.quadraticCurveTo(760,470,860,560);x.lineTo(860,760);x.lineTo(830,760);x.lineTo(830,575);x.quadraticCurveTo(760,515,690,575);x.lineTo(690,760);x.closePath();x.fill();
  const gg=x.createLinearGradient(0,740,0,900);gg.addColorStop(0,'#160b20');gg.addColorStop(1,'#050208');x.fillStyle=gg;x.fillRect(0,752,1600,148);
  x.fillStyle='rgba(160,120,230,.13)';for(let i=0;i<10;i++){x.beginPath();x.ellipse(r()*1600,795+r()*90,60+r()*150,5+r()*8,0,0,TAU);x.fill()}});
 AB.grain=()=>{const c=mk(256,256),x=c.getContext('2d'),d=x.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=R()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return{c,w:256,h:256}};
 // which assets each scene needs (pre-built one per frame, a scene ahead of time)
 const NEED=[['sky1','spark','aurora','clouds','tree','treeG','isl2','isl3','isl4','isl0','isl1','fg','grain'],[],['sun','corona','crk'],['sky3'],['sil_warden','pbg_warden','pnl_warden','sil_sovereign','pbg_sovereign','pnl_sovereign','sil_eclipse','pbg_eclipse','pnl_eclipse','sil_magma','pbg_magma','pnl_magma','sil_tide','pbg_tide','pnl_tide','sil_storm','pbg_storm','pnl_storm'],[],['cave','face','bust','bustD'],['m1','blk','bustL'],['wing','rays','speed','vlines','flyer'],['sky7'],['m3','m3r','caus','bootW'],[],['storm'],[],['m2','koi','treeY'],[],['title','band']];
 // ---- camera: (cx,cy) of the 1600x900 stage at zoom z, with parallax depth p
 function cam(g,cx,cy,z,p){p=p==null?1:p;const Z=1+(z-1)*p,X=800+(cx-800)*p,Y=450+(cy-450)*p,s=I.s*Z;g.setTransform(s,0,0,s,I.cw/2-X*s+I.shx,I.ch/2-Y*s+I.shy)}
 const stage=g=>cam(g,800,450,1,1);
 const A=(g,a,op)=>{g.globalAlpha=a;g.globalCompositeOperation=op||'source-over'};
 function islands(g,list,C,t){for(const s of list){cam(g,C[0],C[1],C[2],s.p);const a=as(s.a);put(g,a,s.x-a.w*s.sc/2,s.y+(I.isy||0)+Math.sin(t*.8+s.ph)*9-a.h*.25*s.sc,a.w*s.sc,a.h*s.sc)}}   // I.isy: islands rising back up (restoration)
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
   const x0=j*533.33,x1=x0+533.33,cx=(x0+x1)/2,id=BIDS[i];put(g,as('pnl_'+id),x0-sk,off);   // pre-masked panel art (no per-frame clip)
   const zz=PZ,sw=420*zz,sh=540*zz,sx=cx-sw/2,sy=off+880-sh;
   const ga=tl>.3?(tl<.55?1+2.5*Math.sin((tl-.3)/.25*PI):1):0;if(ga>0){A(g,1,'lighter');for(const e of EY[id]){const ex=sx+e[0]*zz,ey=sy+(e[1]+10)*zz;g.globalAlpha=Math.min(1,ga*.5);putc(g,glow(BC[id]),ex,ey,.7*ga);if(tl<.6){g.globalAlpha=1-(tl-.3)/.3;drawStreak(g,'#ffffff',ex+90*zz,ey,0,180*zz,1-(tl-.3)/.3,6)}}A(g,1)}
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
  // grounding: the house casts a long soft shadow away from the low sun (right), and each falling block's shadow sharpens as it lands
  {let hgt=0;HOUSE.forEach((b,i)=>{if(tc>=.03+i*.03)hgt=Math.max(hgt,b[1]+1)});if(hgt){g.fillStyle='rgba(40,12,44,.3)';g.beginPath();g.moveTo(gx-6,gy+2);g.lineTo(gx+5*S+6,gy+2);g.lineTo(gx+5*S-10-hgt*S*.9,gy+16);g.lineTo(gx-30-hgt*S*.9,gy+16);g.closePath();g.fill()}}
  HOUSE.forEach((b,i)=>{const L=.03+i*.03,f=(tc-(L-.12))/.12;if(f<0||f>=1)return;const x=gx+b[0]*S,ty=gy-(b[1]+1)*S;g.fillStyle='rgba(30,8,36,'+(.4*f*f)+')';g.beginPath();g.ellipse(x+S/2,ty+S,S*(.3+.25*f),S*(.05+.06*f),0,0,TAU);g.fill()});
  HOUSE.forEach((b,i)=>{const L=.03+i*.03,f=(tc-(L-.12))/.12;if(f<0)return;const x=gx+b[0]*S,ty=gy-(b[1]+1)*S,y=f<1?ty-380*(1-f*f):ty,sq=f>=1&&tc-L<.08?1-.18*Math.sin((tc-L)/.08*PI):1;blk(g,b[2],x+S*(1-1/sq)/2*0,y+S*(1-sq),S,S*sq);
   if(f>=1&&tc-L<.25){const v=(tc-L)/.25;g.fillStyle='rgba(255,240,220,'+(.6*(1-v))+')';for(const s of[-1,1]){g.beginPath();g.arc(x+S/2+s*(S*.5+v*40),ty+S-4-v*10,6+v*8,0,TAU);g.fill()}}});
  // warm sunset rim light on the sun-facing edges, then one soft-light grade so the sprites sit in the scene's light
  A(g,1,'lighter');HOUSE.forEach((b,i)=>{if(tc<.03+i*.03)return;const x=gx+b[0]*S,y=gy-(b[1]+1)*S;g.fillStyle='rgba(255,170,110,.22)';g.fillRect(x+S-6,y+3,5,S-6);g.fillStyle='rgba(255,210,160,.16)';g.fillRect(x+3,y+1,S-6,4)});
  A(g,1,'soft-light');{const gr=g.createLinearGradient(1500,300,200,900);gr.addColorStop(0,'rgba(255,170,110,.85)');gr.addColorStop(1,'rgba(70,30,120,.7)');g.fillStyle=gr;g.fillRect(-60,-40,1720,980)}A(g,1);
  const nx=HOUSE.findIndex((b,i)=>tc<.03+i*.03);if(nx>=0){const b=HOUSE[nx];g.strokeStyle='rgba(255,255,255,'+(.6+.4*Math.sin(tc*40))+')';g.lineWidth=3;g.strokeRect(gx+b[0]*S+2,gy-(b[1]+1)*S+2,S-4,S-4)}}
 function mMine(g,tc){cam(g,800,450,1.04+.06*tc,1);put(g,as('m2'),-40,-30,1680,960);const bx=800-54,by=430-54,hit1=.3,hit2=.58;
  if(tc<hit2){if(tc>hit1){g.strokeStyle='#14121c';g.lineWidth=4;g.beginPath();g.moveTo(bx+54,by+54);g.lineTo(bx+20,by+18);g.moveTo(bx+54,by+54);g.lineTo(bx+96,by+30);g.moveTo(bx+54,by+54);g.lineTo(bx+70,by+100);g.moveTo(bx+54,by+54);g.lineTo(bx+12,by+80);g.stroke()}}
  else{g.fillStyle='#07060c';g.fillRect(bx,by,108,108);const tt=tc-hit2,r=srnd(3);for(let i=0;i<10;i++){const a=r()*TAU,sp=300+r()*500,s=(16+r()*26)*(1+tt*2.2),x=bx+54+Math.cos(a)*sp*tt,y=by+54+Math.sin(a)*sp*tt+600*tt*tt;let sc=null;try{sc=typeof spr=='function'?spr(3,i,0):null}catch(_){}if(sc){g.save();g.translate(x,y);g.rotate(tt*(i%2?7:-6)+i);g.drawImage(sc,(i*11)%24,(i*7)%24,24,24,-s/2,-s/2,s,s);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-s/2,s*.15,s,s*.35);g.restore()}
    else{g.fillStyle=i%3?'#6a6d80':'#8d8f9e';g.fillRect(x-s/2,y-s/2,s,s);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-s/2,y+s*.2,s,s*.3)}}
   A(g,1,'lighter');for(let i=0;i<3;i++){const x=bx+54+(i-1)*70*tt*4,y=by+54-200*tt+400*tt*tt;putc(g,glow('#7ff6ff'),x,y,.8);putc(g,as('spark'),x,y,1.1)}A(g,1)}
  for(const h of[hit1,hit2]){const u=(tc-h)/.14;if(u<0||u>1)continue;A(g,1-u,'lighter');g.strokeStyle='#fff3c0';g.lineWidth=4;for(let i=0;i<14;i++){const a=i/14*TAU+h*9,r0=30+u*60,r1=r0+40+u*90;g.beginPath();g.moveTo(800+Math.cos(a)*r0,430+Math.sin(a)*r0);g.lineTo(800+Math.cos(a)*r1,430+Math.sin(a)*r1);g.stroke()}putc(g,glow('#ffe7a0'),800,430,2.2*(1-u));A(g,1);I.sa=Math.max(I.sa,(1-u)*10)}
  const sw=tc<.2?lerp(1.1,1.62,ez(tc/.2)):tc<hit1?lerp(1.62,.715,ei((tc-.2)/.1)):tc<.48?lerp(.715,1.55,eo((tc-hit1)/.18)):tc<hit2?lerp(1.55,.715,ei((tc-.48)/.1)):lerp(.715,1.0,eo((tc-hit2)/.3));
  g.save();g.translate(1250,830);g.rotate(sw);g.fillStyle='#5a3a24';g.fillRect(-560,-12,560,24);g.fillStyle='#7a5234';g.fillRect(-560,-12,560,7);g.translate(-560,0);g.fillStyle='#b8c0d0';g.strokeStyle='#1a1424';g.lineWidth=5;g.beginPath();g.moveTo(-10,-150);g.quadraticCurveTo(40,-40,24,0);g.quadraticCurveTo(40,40,-10,150);g.quadraticCurveTo(70,40,70,0);g.quadraticCurveTo(70,-40,-10,-150);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';g.fillRect(40,-50,8,100);g.restore()}
 // ---- the lake (stage coords; m3 is drawn at -40,-30 x1.05). HZ: the far shore, WL: the near water plane the float / boot / koi touch
 const HZ=524.7,WL=652,MX=1199,FPRE=.6;
 function lake(g,t){const r=as('m3r'),rh=r.c.height/r.h;
  // 1. mirror reflection of sky, moon and treeline, in thin strips that sway more the nearer they are (calm far, choppy near)
  for(let y=HZ;y<935;y+=5){const d=y-HZ,k=d/410,sy=d/.82;if(sy>r.h-7)break;const sw=Math.sin(t*1.7+d*.09)*(1+d*.045)+Math.sin(t*.9+d*.031)*d*.02;
   g.globalAlpha=.8-.5*k;g.drawImage(r.c,0,sy*rh,r.c.width,6.4*rh,-40+sw,y,1680,5.8)}
  // 2. fresnel: bright and mirror-like toward the horizon, deep blue-black and see-through up close
  g.globalAlpha=1;const dg=g.createLinearGradient(0,HZ,0,935);dg.addColorStop(0,'rgba(140,165,230,.16)');dg.addColorStop(.3,'rgba(10,26,64,.12)');dg.addColorStop(1,'rgba(2,8,24,.6)');g.fillStyle=dg;g.fillRect(-60,HZ,1720,420);
  // 3. caustic light-net in the shallows, two layers drifting against each other, squashed by perspective
  A(g,1,'lighter');const pat=I.cpat||(I.cpat=g.createPattern(as('caus').c,'repeat'));
  for(const L of[[790,.05],[835,.08],[880,.12]])for(const m of[[1,0],[-1,97]]){g.save();g.beginPath();g.rect(-60,L[0],1720,45+(L[0]==880?20:0));g.clip();g.translate(m[1]+t*16*m[0],L[0]);g.scale(1.4,.42);g.globalAlpha=L[1];g.fillStyle=pat;g.fillRect(-400,-10,1800,260);g.restore()}
  // 4. moonlight glitter: anime sparkle dashes in the moon's path, plus a few four-point glints
  for(let i=0;i<46;i++){const h=(i*.618)%1,d=8+i*8.6,y=HZ+d,k=d/410,fl=Math.sin(t*(4+h*7)+i*2.1);if(fl<.15)continue;const w=(8+k*64)*(.5+h)*fl,xx=MX+Math.sin(i*12.9898)*(12+k*130)+Math.sin(t*1.3+i)*6*k;
   g.globalAlpha=.55*fl*(1-k*.35);g.fillStyle='#eaf3ff';g.fillRect(xx-w/2,y,w,1.2+k*2.6)}
  for(let i=0;i<6;i++){const ph=(t*.8+i*.37)%1,a=Math.sin(ph*PI);if(a<.05)continue;const d=30+(i*97)%330,xx=MX+Math.sin(i*7.3)*(20+d*.25),y=HZ+d,s=(5+d*.05)*a;
   g.globalAlpha=a*.9;g.fillStyle='#fff';g.fillRect(xx-s*2.2,y-.7,s*4.4,1.4);g.fillRect(xx-.7,y-s,1.4,s*2);g.globalAlpha=a*.6;putc(g,glow('#cfe4ff'),xx,y,s*.05)}
  A(g,1);
  // 5. wind crests: thin curved highlights that grow with nearness and drift with the breeze
  g.strokeStyle='#dfeaff';g.lineCap='round';for(let i=0;i<34;i++){const hh=(i*.754877)%1,d=20+hh*390,k=d/410,y=HZ+d,xx=((i*911.9+t*(10+k*30))%1760)-80,ph=Math.sin(t*1.8+i*1.7);if(ph<0)continue;
   g.globalAlpha=ph*(.16+.3*k);g.lineWidth=1+k*2.2;const w=10+k*70;g.beginPath();g.moveTo(xx-w,y);g.quadraticCurveTo(xx,y-2-k*5,xx+w,y);g.stroke()}
  // 6. a broken foam line where the water meets the far shore
  g.globalAlpha=.32;g.fillStyle='#cfe0ff';for(let x=-40;x<1640;x+=22){const a=Math.sin(x*.05+t*1.4);if(a>.2)g.fillRect(x,HZ-1+Math.sin(x*.13)*1.2,10+a*12,1.4)}g.globalAlpha=1}
 // ripples where something touches the water: a perspective ring with a bright leading edge, a dark trailing edge and a faint second ring
 function wRing(g,x,y,u,s){if(!(u>0&&u<1))return;s=s||1;const k=eo(u);for(let j=0;j<3;j++){const v=k-j*.16;if(v<=0)continue;const rx=(14+v*170)*s,ry=rx*.2,a=(1-u)*(1-j*.3);
   g.lineWidth=(2.6-j*.6)*s;g.globalAlpha=a*.85;g.strokeStyle='#eef6ff';g.beginPath();g.ellipse(x,y,rx,ry,0,PI,TAU);g.stroke();g.globalAlpha=a*.45;g.strokeStyle='#04102a';g.beginPath();g.ellipse(x,y+1.5*s,rx,ry,0,0,PI);g.stroke();
   g.globalAlpha=a*.55;g.strokeStyle='#bcd2ff';g.beginPath();g.ellipse(x,y,rx*.96,ry*.88,0,0,PI);g.stroke()}g.globalAlpha=1}
 // a splash: a white crown that rises and falls back, beaded droplets on ballistic arcs, and a foam patch that spreads and thins
 function wSplash(g,x,y,u,s){if(!(u>0&&u<1))return;s=s||1;const r=srnd(((x*13+y)|0)+7),h=Math.sin(Math.min(1,u*1.7)*PI)*140*s;
  if(h>2){g.globalAlpha=1-u*.5;g.fillStyle='rgba(236,246,255,.92)';for(let i=0;i<9;i++){const ox=(i-4)*10*s*(1+u*1.4),hh=h*(1-Math.abs(i-4)/5.5)*(.7+r()*.5),w=(4+r()*4)*s;
    g.beginPath();g.moveTo(x+ox-w,y);g.quadraticCurveTo(x+ox*1.1,y-hh*.6,x+ox*1.3,y-hh);g.quadraticCurveTo(x+ox*1.05,y-hh*.5,x+ox+w,y);g.closePath();g.fill()}}
  for(let i=0;i<18;i++){const a=PI*(.15+r()*.7),sp=(220+r()*260)*s,sg=r()<.5?-1:1,rr=(2+r()*3.5)*s,tt=u*.9,dx=Math.cos(a)*sp*tt*sg,dy=-Math.sin(a)*sp*tt+620*s*tt*tt;if(dy>4)continue;
   g.globalAlpha=1-u*.7;g.fillStyle='#d8ebff';g.beginPath();g.arc(x+dx,y+dy,rr,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+dx-rr*.3,y+dy-rr*.3,rr*.4,0,TAU);g.fill()}
  g.globalAlpha=(1-u)*.7;g.fillStyle='#f2f8ff';for(let i=0;i<12;i++){const a=r()*TAU,rd=(10+u*90)*s*(.5+r()*.6),fw=(6+r()*10)*s*(1-u*.5),fh=(1.5+r()*2)*s;g.beginPath();g.ellipse(x+Math.cos(a)*rd,y+Math.sin(a)*rd*.2,fw,fh,0,0,TAU);g.fill()}
  g.globalAlpha=1}
 // a dimmer, wavier mirror copy of whatever fn() draws, below the water plane wl
 function reflect(g,wl,t,fn){g.save();g.beginPath();g.rect(-60,wl,1720,400);g.clip();g.translate(Math.sin(t*6)*3,wl*2);g.scale(1,-1);g.globalAlpha=.3;try{fn()}catch(_){}g.restore();g.globalAlpha=1}
 function bootW(g,x,y,a){g.save();g.translate(x,y);g.rotate(a);g.drawImage(as('bootW').c,-40,-10,150,150);g.restore()}
 // water dripping off the boot's sole, each drop leaving a tiny ring where it lands
 function drips(g,hx,hy,a,tc){const ca=Math.cos(a),sa=Math.sin(a),sx=hx+ca*25-sa*96,sy=hy+sa*25+ca*96;if(sy>WL-12)return;
  for(let i=0;i<5;i++){const ph=(tc*2.4+i*.2)%1,ox=(i-2)*9,x0=sx+ca*ox,y0=sy+sa*ox,y=y0+ph*ph*(WL-y0);g.globalAlpha=.85;g.fillStyle='#cfe6ff';g.beginPath();g.ellipse(x0,y,2.2,3.4+ph*3,0,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(x0-1,y-2,1.2,1.2);
   if(ph<.15){const q=ph/.15;g.globalAlpha=(1-q)*.6;g.strokeStyle='#e6f2ff';g.lineWidth=1.2;g.beginPath();g.ellipse(x0,WL,4+q*16,1+q*3.5,0,0,TAU);g.stroke()}}g.globalAlpha=1}
 // the float sits IN the water: red top above the line, the white half seen dimly through it, a meniscus ring, its reflection
 function float(g,x,y){const cy=y-8;g.globalAlpha=.28;g.fillStyle='#ff4a5a';g.beginPath();g.ellipse(x,cy+7,9,6,0,0,PI);g.fill();g.globalAlpha=.38;g.fillStyle='#e8f0ff';g.beginPath();g.arc(x,cy,10,0,PI);g.fill();
  g.globalAlpha=1;g.fillStyle='#ff4a5a';g.beginPath();g.arc(x,cy,10,PI,TAU);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(x-4,cy-5,2.6,0,TAU);g.fill();
  g.globalAlpha=.8;g.strokeStyle='#eaf4ff';g.lineWidth=1.6;g.beginPath();g.ellipse(x,cy,14,3,0,0,TAU);g.stroke();g.globalAlpha=1}
 function mFish(g,tc0){const tc=tc0-FPRE,t=I.u;cam(g,800,450,1.0+.035*tc0,1);put(g,as('m3'),-40,-30,1680,960);lake(g,t);
  wRing(g,560,600,tc0/1.2,.55);   // the still lake: a fish rises far out before anything happens
  // first bite: up comes... an old boot (it dangles, everyone stares, it drops). Second bite: the golden koi.
  const bob=tc<0?Math.sin(tc0*3)*2:tc<.2?Math.sin(tc*14)*5:tc<.24?18:Math.sin(tc*10)*3,bx=880,by=640+bob,bu=(tc-.22)/.22,hang=tc>.22&&tc<.86;
  let hx=bx,hy=by-12;if(hang){const k=eo(bu);hx=lerp(900,830,k)+Math.sin((tc-.44)*9)*22*(tc>.44?1:0);hy=lerp(650,300,k)}
  for(const sp of[[.22,bx,.5],[.9,960,1],[1.22,866,.75],[1.45,1340,.9]])wRing(g,sp[1],WL,(tc-sp[0])/1,sp[2]);
  if(tc<.22){const q=(tc0%1.3)/1.3;g.globalAlpha=(1-q)*.5;g.strokeStyle='#e6f2ff';g.lineWidth=1.2;g.beginPath();g.ellipse(bx,WL-8,12+q*30,2.5+q*6,0,0,TAU);g.stroke();g.globalAlpha=1}
  g.strokeStyle='#0a0614';g.lineWidth=9;g.beginPath();g.moveTo(-20,360);g.lineTo(260,110);g.stroke();g.strokeStyle='rgba(240,240,255,.7)';g.lineWidth=1.6;g.beginPath();g.moveTo(260,110);g.quadraticCurveTo(hang?560:600,hang?180:300,hx,hy);g.stroke();
  if(hang){const a=Math.sin((tc-.44)*9)*.25*(tc>.44?1:0)+(1-cl(bu,0,1))*.6;reflect(g,WL,t,()=>bootW(g,hx,hy,a));bootW(g,hx,hy,a);drips(g,hx,hy,a,tc)}
  else float(g,bx,by);
  if(tc>=.86&&tc<1.3){const v=(tc-.86)/.44,x=830+v*40,y=300+v*v*520,a=.4+v*3;reflect(g,WL,t,()=>bootW(g,x,y,a));g.save();g.beginPath();g.rect(-60,-200,1720,WL+204);g.clip();bootW(g,x,y,a);g.restore()}
  if(tc>.42&&tc<.98){const a=cl((tc-.42)/.06,0,1)*cl((.98-tc)/.08,0,1);bubble(g,1080,250,'...a boot.',38,-1,a);for(let i=0;i<3;i++){g.globalAlpha=a*.8;g.fillStyle='#bfe8ff';g.beginPath();g.ellipse(835+i*16-16,232-((tc*90+i*13)%26),4,6,0,0,TAU);g.fill()}g.globalAlpha=1}
  const u=(tc-.9)/.55;if(u>0&&u<1){const P0=v=>[lerp(960,1340,v),WL-2-Math.sin(v*PI)*340],p=P0(u),ang=Math.atan2(-Math.cos(u*PI)*340*PI,380),kd=()=>{g.save();g.translate(p[0],p[1]);g.rotate(ang);putc(g,as('koi'),0,0,1.35);g.restore()};
   reflect(g,WL,t,kd);A(g,1,'lighter');for(let i=1;i<7;i++){const v=u-i*.035;if(v<0)break;const q=P0(v);putc(g,glow('#ffd36a'),q[0],q[1],.5-i*.06)}A(g,1);
   // water streaming off the koi: drops shed along its arc fall away under gravity
   for(let i=1;i<10;i++){const v=u-i*.045;if(v<0)break;const q=P0(v),dt=(u-v)*.55,y=q[1]+900*dt*dt;if(y>WL)continue;g.globalAlpha=.8-i*.06;g.fillStyle='#d8ecff';g.beginPath();g.arc(q[0]+(i%2?6:-6),y,2.4,0,TAU);g.fill()}g.globalAlpha=1;
   kd();A(g,.5,'lighter');putc(g,glow('#cfe4ff'),p[0]+10,p[1]-12,.45);A(g,1)}
  for(const sp of[[.22,bx,.45],[.9,960,1],[1.22,866,.7],[1.45,1340,.85]])wSplash(g,sp[1],WL,(tc-sp[0])/.55,sp[2])}
 // a soggy old boot hanging from the hook by its top (hook point at x,y)
 function boot(g,x,y,a){g.save();g.translate(x,y);g.rotate(a);g.translate(4,70);g.fillStyle='#6a4426';g.strokeStyle='#1a0f0a';g.lineWidth=5;g.beginPath();g.moveTo(-26,-70);g.lineTo(18,-70);g.lineTo(20,-8);g.quadraticCurveTo(70,-6,74,14);g.lineTo(74,26);g.lineTo(-30,26);g.closePath();g.fill();g.stroke();
  g.fillStyle='#2a1a10';g.fillRect(-32,18,108,12);g.fillStyle='#8a5c36';g.fillRect(-26,-70,44,12);g.strokeStyle='#d8c090';g.lineWidth=3;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-2,-50+i*14);g.lineTo(14,-44+i*14);g.stroke()}
  g.fillStyle='rgba(170,215,255,.85)';for(const d of[[-10,34],[30,40],[60,36]]){g.beginPath();g.arc(d[0],d[1]+(I.u*260+d[0])%22,4,0,TAU);g.fill()}g.restore()}
 // comic speech bubble (tail -1 points down-left, 1 down-right)
 function bubble(g,x,y,txt,sz,tail,a){if(a<=0)return;g.save();g.globalAlpha=a;g.font='italic 800 '+sz+'px '+SANS;const w=g.measureText(txt).width+sz*1.3,h=sz*1.75,sc=lerp(.6,1,bo(a));g.translate(x,y);g.scale(sc,sc);g.fillStyle='#fff';g.strokeStyle='#120a1e';g.lineWidth=4;
  g.beginPath();g.moveTo(tail*w*.12-12,h/2-4);g.lineTo(tail*w*.42,h/2+sz*.95);g.lineTo(tail*w*.12+12,h/2-4);g.closePath();g.fill();g.stroke();
  g.beginPath();if(g.roundRect)g.roundRect(-w/2,-h/2,w,h,h/2);else g.rect(-w/2,-h/2,w,h);g.fill();g.stroke();g.textAlign='center';g.textBaseline='middle';g.fillStyle='#120a1e';g.fillText(txt,0,2);g.restore()}
 function mClimb(g,tc){const C=[800,lerp(560,360,ez(tc/.9)),1.0];I.C=C;cam(g,C[0],C[1],C[2],.25);put(g,as('sky7'),-100,-300);stars(g,tc,.4);cam(g,C[0],C[1],C[2],.4);A(g,.8,'lighter');putc(g,glow('#ffd77a'),1420,380,5.5);A(g,1);const tw=380,th=tw*1550/1500;put(g,as('tree'),1420-tw/2,640-tw,tw,th);A(g,1,'lighter');put(g,as('treeY'),1420-tw/2,640-tw,tw,th);A(g,1);
  cam(g,C[0],C[1],C[2],1);const P=[[420,760,'isl0',330],[820,560,'isl2',220],[1130,340,'isl3',200]];for(const p of P){const a=as(p[2]);put(g,a,p[0]-p[3]/2,p[1]-p[3]*.24,p[3],p[3]*1.1)}
  const seg=tc<.45?0:1,v=seg?(tc-.45)/.45:tc/.45,a=P[seg],b=P[seg+1],x=lerp(a[0],b[0],ez(v)),y=lerp(a[1],b[1],ez(v))-Math.sin(v*PI)*150-80;A(g,1,'lighter');for(let i=1;i<8;i++){const w=Math.max(0,v-i*.04);putc(g,glow('#ffe7c0'),lerp(a[0],b[0],ez(w)),lerp(a[1],b[1],ez(w))-Math.sin(w*PI)*150-80,.7-i*.07)}A(g,1);putc(g,as('flyer'),x,y,.62)}
 function sMont(g,t,d){let n=0;while(n<3&&t>=MCUT[n+1][0])n++;const tc=t-MCUT[n][0];[mBuild,mMine,mFish,mClimb][n](g,tc);stage(g);
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
  const tg=t-3.2;if(tg>0){g.globalAlpha=cl(tg/.8,0,1)*(1-ez((t-(d-1.1))/.8));g.font='italic 500 36px '+SERIF;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff4dc';g.fillText('Your story begins.',800,ty+196);g.globalAlpha=1}
  if(t>=slam&&t<slam+.5)I.fl=Math.max(I.fl,1-(t-slam)/.5)}
 // ---- the first flight (a gag): full speed, total confidence, straight into a wall. A little sprout finds it hilarious.
 // Sprig, the sprout companion. mode: true/'laugh', 'scream', 'sleep', or idle
 function sprig(g,x,y,s,t,mode){const laugh=mode===true||mode=='laugh';g.save();g.translate(x,y);g.scale(s,s);const sq=laugh?1+.12*Math.sin(t*38):1;g.scale(1/Math.sqrt(sq),sq);g.lineWidth=4;g.strokeStyle='#1a2a1a';
  g.beginPath();g.moveTo(0,-42);g.quadraticCurveTo(-3,-52,0,-58);g.stroke();g.fillStyle='#4fc06a';
  for(const sd of[-1,1]){g.save();g.translate(0,-57);g.rotate(sd*(.75+(laugh?.18*Math.sin(t*30+sd):0)));g.beginPath();g.ellipse(0,-14,8,15,0,0,TAU);g.fill();g.stroke();g.restore()}
  const bg=g.createLinearGradient(0,-46,0,0);bg.addColorStop(0,'#a8f4b0');bg.addColorStop(1,'#3fae5c');g.fillStyle=bg;g.beginPath();g.ellipse(0,-22,30,24,0,0,TAU);g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-11,-33,8,5,-.5,0,TAU);g.fill();g.strokeStyle='#14201a';g.lineWidth=3.5;
  if(mode=='scream'){g.fillStyle='#fff';for(const sd of[-1,1]){g.beginPath();g.arc(sd*12,-27,8,0,TAU);g.fill();g.stroke();g.fillStyle='#14201a';g.beginPath();g.arc(sd*12,-27,2.2,0,TAU);g.fill();g.fillStyle='#fff'}g.fillStyle='#6a1a2e';g.beginPath();g.ellipse(0,-10,8,10,0,0,TAU);g.fill();g.stroke()}
  else if(mode=='sleep'){for(const sd of[-1,1]){g.beginPath();g.arc(sd*11,-25,5,PI*.15,PI*.85);g.stroke()}g.beginPath();g.arc(0,-13,2.5,0,TAU);g.stroke()}
  else if(laugh){for(const sd of[-1,1]){g.beginPath();g.arc(sd*11,-21,5,PI*1.15,PI*1.85);g.stroke()}g.fillStyle='#6a1a2e';g.beginPath();g.arc(0,-13,8,0,PI);g.closePath();g.fill()}
  else{g.fillStyle='#14201a';for(const sd of[-1,1]){g.beginPath();g.arc(sd*11,-24,4.2,0,TAU);g.fill()}g.fillStyle='#fff';for(const sd of[-1,1]){g.beginPath();g.arc(sd*11-1.4,-25.4,1.4,0,TAU);g.fill()}g.beginPath();g.arc(0,-14,3,0,PI);g.stroke()}
  g.fillStyle='rgba(255,120,150,.55)';for(const sd of[-1,1]){g.beginPath();g.ellipse(sd*20,-14,6,3.5,0,0,TAU);g.fill()}g.restore()}
 function star5(g,x,y,r,a){g.beginPath();for(let i=0;i<10;i++){const rr=i%2?r*.45:r,an=a+i/10*TAU-PI/2;i?g.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr):g.moveTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr)}g.closePath();g.fill();g.stroke()}
 function burstTxt(g,x,y,r,sc,rot,txt,fill){g.save();g.translate(x,y);g.rotate(rot);g.scale(sc,sc);g.beginPath();for(let i=0;i<22;i++){const a=i/22*TAU,rr=i%2?r*.6:r*(i%4?1.05:.9);i?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.72):g.moveTo(rr,0)}g.closePath();
  g.fillStyle=fill;g.fill();g.lineWidth=8;g.strokeStyle='#120a1e';g.stroke();g.font='italic 900 '+(r*.44|0)+'px '+SANS;g.textAlign='center';g.textBaseline='middle';g.lineWidth=12;g.strokeText(txt,0,5);g.fillStyle='#fff';g.fillText(txt,0,5);g.restore()}
 function sOops(g,t,d){const HIT=1.25,ht=t-HIT,WX=1150,S=96,GY=790;
  const C=ht<0?[lerp(620,820,ez(t/HIT)),lerp(470,440,ez(t/HIT)),1]:[lerp(820,930,ez(ht/.4)),lerp(440,500,ez(ht/1.2)),lerp(1,1.1,eo(ht/.5))];I.C=C;
  cam(g,C[0],C[1],C[2],.25);put(g,as('sky7'),-100,-300);stars(g,t,.15);
  cam(g,C[0],C[1],C[2],.5);A(g,.9);put(g,as('clouds'),-200,540);A(g,1);
  cam(g,C[0],C[1],C[2],.65);putc(g,as('isl3'),260,250+Math.sin(t)*8,.9);putc(g,as('isl2'),780,170+Math.sin(t*.8+1)*8,.8);
  cam(g,C[0],C[1],C[2],1);for(let x=-300;x<WX;x+=S){blk(g,0,x,GY,S);blk(g,2,x,GY+S,S)}
  for(let j=0;j<14;j++)for(let i=0;i<10;i++)blk(g,(i*3+j*7)%11==0?1:2,WX+i*S,GY+S-j*S,S);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(WX,-400,14,GY+S+400);
  // the sprout pops out of the grass and can't stop giggling
  const st=t-2.05;if(st>0){g.save();g.beginPath();g.rect(-400,-400,2400,GY+400);g.clip();sprig(g,760,GY+70*(1-bo(st/.28)),1.5,t,st>.35);g.restore();
   bubble(g,880,GY-150,st<1?'pfft!':'hehehe',34,-1,cl((st-.35)/.08,0,1))}
  // the flyer: a confident zig-zag, a split-second "!" ... then the wall
  const fa=as('flyer');let fx,fy,sx=1,sy=1,rot=1.25;
  const path=u=>[lerp(-180,WX-60,u),lerp(650,430,ez(u))+Math.sin(u*9)*18*(1-u)];
  if(ht<0){const u=t/HIT,p=path(u);fx=p[0];fy=p[1];rot=1.25+Math.sin(t*7)*.08;A(g,1,'lighter');for(let i=1;i<12;i++){const q=path(Math.max(0,u-i*.025));putc(g,glow('#ffe7c0'),q[0],q[1],.9-i*.06)}A(g,1)}
  else if(ht<.35){fx=WX-36;fy=430;sx=.52;sy=1.16}
  else{const v=cl((ht-.35)/1.2,0,1);fx=WX-36-14*v;fy=lerp(430,GY-80,ei(v)*.55+v*.45);sx=lerp(.52,.9,ez(v*1.5));sy=lerp(1.16,1,v);rot=lerp(1.25,-.12,ez(v))}
  g.save();g.translate(fx,fy);g.scale(sx,sy);g.rotate(rot);putc(g,fa,0,0,1);g.restore();
  if(t>.78&&t<1.2){const k=bo((t-.78)/.12);g.save();g.translate(fx-30,fy-120);g.scale(k,k);g.font='900 80px '+SANS;g.textAlign='center';g.lineWidth=10;g.strokeStyle='#120a1e';g.strokeText('!',0,0);g.fillStyle='#ffd36a';g.fillText('!',0,0);g.restore()}
  if(ht>0&&ht<.7){const u=ht/.14;if(u<1){A(g,1-u,'lighter');g.strokeStyle='#fff3c0';g.lineWidth=5;for(let i=0;i<16;i++){const a=i/16*TAU,r0=30+u*70,r1=r0+50+u*110;g.beginPath();g.moveTo(WX-10+Math.cos(a)*r0,430+Math.sin(a)*r0);g.lineTo(WX-10+Math.cos(a)*r1,430+Math.sin(a)*r1);g.stroke()}A(g,1)}
   g.globalAlpha=cl((.7-ht)/.2,0,1);burstTxt(g,WX-150,300,150,bo(ht/.16),-.16,'BONK!','#ffd36a');g.globalAlpha=1}
  // dizzy stars circling the head while they slide down the wall
  if(ht>.3){g.fillStyle='#ffe27a';g.strokeStyle='#120a1e';g.lineWidth=3;for(let i=0;i<3;i++){const a=t*6+i*TAU/3;star5(g,fx-6+Math.cos(a)*52,fy-96+Math.sin(a)*14,11,t*4)}}
  // reaction cut-in: a close-up of the wanderer, one sweat drop, one word
  const pt=t-2.3;if(pt>0){stage(g);const k=eo(pt/.25),pw=460,ph=290,px=lerp(-620,90,k),py=96;g.save();g.translate(px+pw/2,py+ph/2);g.rotate(-.05);g.translate(-pw/2,-ph/2);g.fillStyle='#fff';g.fillRect(-9,-9,pw+18,ph+18);
   g.save();g.beginPath();g.rect(0,0,pw,ph);g.clip();const bg=g.createLinearGradient(0,0,0,ph);bg.addColorStop(0,'#ffe9f2');bg.addColorStop(1,'#ffbfd4');g.fillStyle=bg;g.fillRect(0,0,pw,ph);
   g.globalAlpha=.5;put(g,as('vlines'),-100,-((pt*900)%ph)-ph,pw+200,ph*3);g.globalAlpha=1;const b=as('bustL');g.drawImage(b.c,0,b.c.height*.03,b.c.width,b.c.height*.5,0,14,pw,pw*(.5*b.h)/b.w);
   const dy=Math.min(20,pt*30);g.fillStyle='#8fd8ff';g.strokeStyle='#120a1e';g.lineWidth=3;g.beginPath();g.moveTo(352,52+dy);g.quadraticCurveTo(334,88+dy,352,96+dy);g.quadraticCurveTo(370,88+dy,352,52+dy);g.fill();g.stroke();
   g.font='italic 900 46px '+SANS;g.lineWidth=9;g.strokeText('...ow.',26,ph-30);g.fillStyle='#fff';g.fillText('...ow.',26,ph-30);g.restore();g.lineWidth=6;g.strokeStyle='#120a1e';g.strokeRect(0,0,pw,ph);g.restore()}
  if(t<.15)I.fl=Math.max(I.fl,.45*(1-t/.15));if(ht>0&&ht<.22)I.fl=Math.max(I.fl,.7*(1-ht/.22))}
 // ---- the fight: the wanderer charges the Eclipse Lord in a storm and is struck down. They kneel in the rain... and stand back up.
 // k: 0 kneeling -> 1 standing; k<0 sits on the ground (knees up, arms resting on them)
 function hero(g,x,y,k,s,t,rim,wk){const L=(a,b)=>[lerp(a[0],b[0],k),lerp(a[1],b[1],k)];
  const J=k<0?{hd:[6,-130],nk:[2,-106],hp:[-8,-34],kf:[34,-56],ff:[48,0],kb:[24,-46],fb:[30,0],el:[16,-72],ha:[38,-58],eb:[-6,-72],hb:[22,-50]}:{hd:L([28,-112],[2,-186]),nk:L([14,-96],[0,-160]),hp:L([-6,-50],[0,-96]),kf:L([36,-44],[14,-50]),ff:L([46,0],[22,0]),kb:L([-30,-4],[-12,-50]),fb:L([-72,-2],[-20,0]),el:L([34,-50],[24,-126]),ha:L([44,-2],[36,-96]),eb:L([-12,-66],[-22,-126]),hb:L([-8,-38],[-32,-96])};
  // wk: walk cycle phase (standing pose only): legs scissor, arms swing, a little bob
  if(wk!=null){const sw=Math.sin(wk),bob=Math.abs(Math.cos(wk))*4;J.ff=[sw*26,-Math.max(0,-Math.cos(wk))*8];J.kf=[sw*14+6,-50];J.fb=[-sw*26,-Math.max(0,Math.cos(wk))*8];J.kb=[-sw*14+6,-50];J.ha=[30-sw*16,-96];J.hb=[-28+sw*16,-96];for(const n of['hd','nk','hp','el','eb','ha','hb'])J[n]=[J[n][0],J[n][1]-bob]}
  const limb=(p,w)=>{g.lineWidth=w;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.stroke()};
  const body=()=>{limb([J.hp,J.kb,J.fb],15);limb([J.nk,J.eb,J.hb],11);limb([J.nk,J.hp],26);limb([J.hp,J.kf,J.ff],15);limb([J.nk,J.el,J.ha],11);const hx=J.hd[0],hy=J.hd[1];g.beginPath();g.arc(hx,hy,19,0,TAU);g.fill();
   g.beginPath();poly(g,hx-20,hy-2,hx-32,hy-24,hx-12,hy-16,hx-8,hy-36,hx+6,hy-19,hx+24,hy-30,hx+19,hy-6,hx+32,hy+5,hx+14,hy+3);g.fill()};
  g.save();g.translate(x,y);g.scale(s,s);g.lineCap='round';g.lineJoin='round';
  // the scarf streams in the storm wind (red stays bright even when the world loses its colour)
  const n=J.nk;g.strokeStyle='#d8304a';for(const w of[[9,0],[5,1.3]]){g.lineWidth=w[0];g.beginPath();g.moveTo(n[0],n[1]+4);for(let i=1;i<=8;i++){const u=i/8;g.lineTo(n[0]-u*130,n[1]+4+u*lerp(26,-6,Math.max(0,k))+Math.sin(t*9-u*5+w[1])*10*u)}g.stroke()}
  g.save();g.translate(3,-3);g.strokeStyle=rim;g.fillStyle=rim;body();g.restore();g.strokeStyle='#07050d';g.fillStyle='#07050d';body();g.restore()}
 function sClash(g,t,d){const SK=.9,KN=1.25,UP=2.9,IG=3.6,low=ez((t-KN)/.3)*(1-ez((t-UP)/.5));
  let C;if(t<SK)C=[lerp(560,760,ez(t/SK)),450,1];else if(t<KN)C=[lerp(760,600,ez((t-SK)/.35)),lerp(450,470,ez((t-SK)/.35)),1];else if(t<UP){const u=(t-KN)/(UP-KN);C=[lerp(600,430,ez(u)),lerp(470,610,ez(u)),lerp(1,1.45,ez(u))]}
  else{const u=eo((t-UP)/.7);C=[lerp(430,700,u),lerp(610,470,u),lerp(1.45,1.05,u)+(t>IG?.04*ez((t-IG)/1):0)]}I.C=C;
  cam(g,C[0],C[1],C[2],.3);put(g,as('storm'),-80,-50,1760,990);
  // the swallowed sun, with lightning
  A(g,.8,'lighter');putc(g,as('corona'),1180,140,.55+.03*Math.sin(t*5));A(g,1);g.fillStyle='#030008';g.beginPath();g.arc(1180,140,36,0,TAU);g.fill();
  for(const b of[[.15,260],[1.7,1450]]){const u=(t-b[0])/.25;if(u<0||u>1)continue;const r=srnd(b[1]);let px=b[1],py=-40;A(g,1-u,'lighter');g.strokeStyle='#e8dcff';g.lineWidth=4;g.shadowColor='#b58cff';g.shadowBlur=20;g.beginPath();g.moveTo(px,py);while(py<740){px+=(r()-.5)*90;py+=40+r()*50;g.lineTo(px,py)}g.stroke();g.shadowBlur=0;A(g,1);I.fl=Math.max(I.fl,.35*(1-u))}
  // the Eclipse Lord towers over the ruins
  cam(g,C[0],C[1],C[2],.85);const z=1.55,sa=as('sil_eclipse'),lx=1190-210*z,ly=790-540*z+Math.sin(t*1.4)*5;put(g,sa,lx,ly,420*z,540*z);
  const eg=t<SK?.6:t<KN?1.6:t>IG?1.4+.3*Math.sin(t*20):.8;A(g,1,'lighter');for(const e of EY.eclipse){const ex=lx+e[0]*z,ey=ly+(e[1]+10)*z;g.globalAlpha=Math.min(1,eg*.6);putc(g,glow('#b58cff'),ex,ey,.55*eg);putc(g,glow('#ffffff'),ex,ey,.18*eg)}A(g,1);
  // the strike: a shockwave of darkness
  const sk=t-SK;if(sk>0&&sk<.6){A(g,(1-sk/.6),'lighter');for(let i=0;i<3;i++){g.strokeStyle=i?'#b58cff':'#fff';g.lineWidth=(14-i*4)*(1-sk/.6);g.beginPath();g.ellipse(1040,520,sk*(1300-i*200),sk*(700-i*120),0,0,TAU);g.stroke()}
   for(let i=0;i<14;i++){const a=PI+(i/13-.5)*1.6;drawStreak(g,'#b58cff',1040+Math.cos(a)*sk*900,520+Math.sin(a)*sk*500,a,260,1-sk/.6,10)}A(g,1)}
  cam(g,C[0],C[1],C[2],1);
  // rain (it slows to a crawl while they are down)
  const rt=t<KN?t:t<UP?KN+(t-KN)*.22:KN+(UP-KN)*.22+(t-UP);g.strokeStyle='rgba(170,190,255,.38)';g.lineWidth=1.8;g.beginPath();for(const r of I.rain){const y=((r.y+rt*r.v)%1100)-100,x=r.x+y*.2;g.moveTo(x,y);g.lineTo(x-r.l*.2,y-r.l)}g.stroke();
  // the world drains of colour while they kneel
  if(low>.01){g.setTransform(1,0,0,1,0,0);A(g,low*.9,'saturation');g.fillStyle='#808080';g.fillRect(0,0,I.cw,I.ch);A(g,low*.45,'multiply');g.fillStyle='#6a78c8';g.fillRect(0,0,I.cw,I.ch);A(g,1);cam(g,C[0],C[1],C[2],1)}
  // the wanderer: charge -> thrown back -> kneeling -> standing
  if(t<KN){const fa=as('flyer');let fx,fy,rot;if(t<SK){const u=ez(cl((t-.1)/.8,0,1));fx=lerp(120,840,u);fy=lerp(610,560,u);rot=1.3;A(g,1,'lighter');for(let i=1;i<10;i++){const v=Math.max(0,u-i*.03);putc(g,glow('#bff6ff'),lerp(120,840,v),lerp(610,560,v),.8-i*.07)}A(g,1)}
   else{const u=(t-SK)/(KN-SK);fx=lerp(840,330,u);fy=lerp(560,720,u)-Math.sin(u*PI)*130;rot=1.3-u*5}g.save();g.translate(fx,fy);g.rotate(rot);putc(g,fa,0,0,.9);g.restore()}
  else{const k=t<UP?0:ez((t-UP)/.7),shiv=t<UP?Math.sin(t*40)*1.2:0,gold=ez((t-IG)/.3);
   const dl=t-KN;if(dl<.6){g.fillStyle='rgba(120,100,150,'+(.5*(1-dl/.6))+')';for(let i=0;i<8;i++){const a=PI+i/7*PI;g.beginPath();g.arc(330+Math.cos(a)*(40+dl*160),776+Math.sin(a)*dl*40,10+dl*24,0,TAU);g.fill()}}
   const chest=[330+lerp(14,0,k)*1.2,780-lerp(80,130,k)*1.2];
   if(t>IG-.05){const w=t-IG,wa=as('wing'),s=.34,bx=bo(w/.45),by=lerp(.6,1,eo(w/.45));A(g,(1-ez(w/1))*.8+.2,'lighter');g.save();g.translate(chest[0],chest[1]);g.rotate(w*.4);putc(g,as('rays'),0,0,.8+w*.2);g.restore();A(g,1);
    put(g,wa,chest[0]-650*s*bx,chest[1]-560*s*by+20,1300*s*bx,860*s*by);A(g,.6,'lighter');putc(g,glow('#ffd77a'),chest[0],chest[1],3);A(g,1)}
   hero(g,330+shiv,780,k,1.2,t,mix('#9a8ad8','#ffd77a',gold));
   const sp=ez((t-(UP-.35))/.35);if(sp>0){A(g,1,'lighter');putc(g,glow(t>IG?'#ffd77a':'#bff6ff'),chest[0],chest[1],.6+sp*1.2+.15*Math.sin(t*14));putc(g,as('spark'),chest[0],chest[1],.5+sp*.8);A(g,1)}
   if(t>IG+.1&&t<IG+.6){const u=(t-IG-.1)/.5;const hd=[330+2*1.2,780-186*1.2];A(g,1,'lighter');drawStreak(g,'#bff6ff',hd[0]+60,hd[1]+2,0,120,Math.sin(u*PI),5);A(g,1)}}
  if(t>IG&&t<IG+1){stage(g);A(g,(1-ez((t-IG)/.9))*.6,'lighter');put(g,as('speed'),0,0,1600,900);A(g,1)}
  if(t>=SK&&t<SK+.3)I.fl=Math.max(I.fl,(1-(t-SK)/.3)*.85);if(t>=IG&&t<IG+.35)I.fl=Math.max(I.fl,(1-(t-IG)/.35)*.8);if(t<.12)I.dk=Math.max(I.dk,1-t/.12)}
 // ---- small props shared by the longer story: sky lanterns, a cat, a score card
 function lantern(g,x,y,s,a,fl){if(a<=0)return;A(g,a*.75,'lighter');putc(g,glow('#ffb84a'),x,y,1.15*s*(1+.08*fl));A(g,a);g.fillStyle='#ffcf7a';g.fillRect(x-7*s,y-9*s,14*s,18*s);g.fillStyle='#e8762a';g.fillRect(x-7*s,y+5*s,14*s,4*s);g.fillStyle='rgba(255,252,225,.95)';g.fillRect(x-3*s,y-5*s,6*s,8*s);A(g,1)}
 function cat(g,x,y,s,leap,sq){g.save();g.translate(x,y);g.scale(s,s*(sq||1));g.fillStyle='#07050d';g.beginPath();
  if(leap){g.ellipse(0,-14,26,9,-.25,0,TAU);g.moveTo(33,-26);g.arc(24,-26,9,0,TAU);poly(g,19,-31,21,-44,27,-33);poly(g,26,-33,32,-43,33,-30);g.moveTo(-22,-10);g.quadraticCurveTo(-44,-2,-50,-22);g.lineTo(-46,-24);g.quadraticCurveTo(-41,-10,-20,-15)}
  else{g.ellipse(0,-14,14,15,0,0,TAU);g.moveTo(12,-36);g.arc(2,-36,10,0,TAU);poly(g,-6,-42,-4,-54,2,-44);poly(g,4,-44,10,-54,11,-40);g.moveTo(12,-4);g.quadraticCurveTo(34,-2,30,-26);g.lineTo(34,-26);g.quadraticCurveTo(38,2,12,0)}
  g.fill();g.restore()}
 function card(g,x,y,txt){g.save();g.translate(x,y);g.rotate(-.06);g.fillStyle='#5a3a24';g.fillRect(-4,30,8,54);g.fillStyle='#fff';g.strokeStyle='#120a1e';g.lineWidth=4;g.fillRect(-64,-32,128,64);g.strokeRect(-64,-32,128,64);g.font='900 34px '+SANS;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#120a1e';g.fillText(txt,0,2);g.restore()}
 // ---- lantern night in the branches: life before the fall (and a cat that wants a lantern very badly)
 function sVillage(g,t,d){const k=t/d,C=[lerp(520,660,ez(k)),lerp(500,450,ez(k)),lerp(1.22,1.12,ez(k))];I.C=C;
  world(g,t+3,C,{veins:.9+.1*Math.sin(t*2.5),nofg:true,mid:g2=>{cam(g2,C[0],C[1],C[2],.9);for(const l of I.lan){const u=t-l.dl;if(u<0)continue;const y=l.y-u*l.v;if(y<-420)continue;lantern(g2,l.x+Math.sin(u*.9+l.ph)*16,y,l.s,Math.min(1,u/.6),Math.sin(t*9+l.ph))}}});
  cam(g,C[0],C[1],C[2],1.3);g.fillStyle='#05040b';g.beginPath();g.moveTo(-400,1100);g.lineTo(-400,800);g.quadraticCurveTo(200,768,560,792);g.quadraticCurveTo(760,806,960,860);g.lineTo(960,1100);g.closePath();g.fill();
  hero(g,300,788,1,.5,t,'#ffcf9a');
  const cu=(t-3)/.6;if(cu<0)cat(g,470,792,.9,0);else if(cu<1)cat(g,lerp(470,560,cu),792-Math.sin(cu*PI)*150,.9,1);else cat(g,560,794,.9,0,cu<1.35?.6+.4*ez((cu-1)/.35):1);
  if(t>3&&t<4)bubble(g,640,650,'mrrp!',26,-1,cl((t-3)/.08,0,1)*cl((4-t)/.1,0,1));
  const lu=t-1.3;lantern(g,322+(lu>0?Math.sin(lu*1.2)*20:0),720-(lu>0?lu*85:0),1.3,1,Math.sin(t*9))}
 // ---- the fall: islands break loose and tumble into the dark, the tree's light flickers out, a lantern slips away
 function sFall(g,t,d){const k=t/d,C=[800,lerp(430,470,ez(k)),lerp(1,1.08,ez(k))];I.C=C;
  cam(g,C[0],C[1],C[2],.2);put(g,as('sky3'),-100,-60,1800,1012);
  cam(g,C[0],C[1],C[2],.35);A(g,.6,'lighter');putc(g,as('corona'),800,60,.8);A(g,1);g.fillStyle='#030008';g.beginPath();g.arc(800,60,60,0,TAU);g.fill();cracks(g,1,800,60,.4);
  cam(g,C[0],C[1],C[2],.85);const tw=900,th=tw*1550/1500,tx=800-tw/2,ty=900-tw;put(g,as('tree'),tx,ty,tw,th);const vg=Math.max(0,1-ez(t/4))*(.6+.4*Math.abs(Math.sin(t*13+Math.sin(t*5)*3)));if(vg>.02){A(g,vg,'lighter');put(g,as('treeG'),tx,ty,tw,th);A(g,1)}
  for(const s of I.fallI){const u=t-s.dl;cam(g,C[0],C[1],C[2],s.p);const a=as(s.a);let x=s.x,y=s.y,r=0;if(u<0)x+=Math.sin(t*40+s.x)*2;else{y+=90*u*u+20*u;r=u*.12*s.dir;x+=s.dir*u*20}
   g.save();g.translate(x,y);g.rotate(r);put(g,a,-a.w*s.sc/2,-a.h*.25*s.sc,a.w*s.sc,a.h*s.sc);g.restore();
   if(u>0)for(let i=0;i<5;i++){const v=u-i*.15;if(v<0)continue;blk(g,2,x+(i-2)*40*s.sc+s.dir*v*30,y+a.h*.5*s.sc+120*v*v+v*40,22*s.sc)}}
  stage(g);g.fillStyle='rgba(205,195,215,.55)';for(const m of I.motes){const y=((m.y+t*m.v*1.6)%960+960)%960-30;g.fillRect(m.x+Math.sin(t*.8+m.ph)*30,y,m.r*.35,m.r*.35)}
  A(g,.6,'lighter');for(let i=0;i<24;i++){const m=I.motes[i];putc(g,glow('#ff6a2a'),m.x+Math.sin(t*2+m.ph)*20,900-((t*m.v*3+m.y)%1000),.35)}A(g,1);
  const lu=(t-2.6)/2.6;if(lu>0&&lu<1){A(g,.25,'lighter');for(let i=1;i<6;i++){const v=Math.max(0,lu-i*.02);putc(g,glow('#ffb84a'),860+Math.sin(v*7)*30,lerp(200,1000,v*v),.6)}A(g,1);lantern(g,860+Math.sin(lu*7)*30,lerp(200,1000,lu*lu),1.4,1-lu*.6,Math.sin(t*20))}
  I.dk=Math.max(I.dk,ez((t-(d-.6))/.6))}
 // ---- a hundred years: star trails wheel overhead, the moon races by, snow falls, then moss and flowers creep back over the hill
 function sAges(g,t,d){const k=t/d,C=[800,450,lerp(1.06,1,ez(k))];I.C=C;
  cam(g,C[0],C[1],C[2],.25);put(g,as('sky1'),-100,-300);g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(4,4,18,.55)';g.fillRect(0,0,I.cw,I.ch);
  // star trails accumulate on their own canvas: each frame strokes only the new sliver of arc (stroking 150 ever-longer arcs every
  // frame was the scene's whole cost), then the canvas is drawn in one go
  cam(g,C[0],C[1],C[2],.3);const w=t*.45;if(!I.trc||I.trw>w){I.trc=mk(1350,975);I.trw=0}const tx=I.trc.getContext('2d');tx.setTransform(.75,0,0,.75,75,225);tx.strokeStyle='rgba(220,230,255,.5)';tx.lineWidth=1.6;tx.lineCap='butt';
  if(w>I.trw){tx.beginPath();for(const s of I.trail){const a0=s.a+I.trw;tx.moveTo(800+Math.cos(a0)*s.r,-260+Math.sin(a0)*s.r);tx.arc(800,-260,s.r,a0,s.a+w)}tx.stroke();I.trw=w}g.drawImage(I.trc,-100,-300,1800,1300);
  const mu=(t*.8)%1,mx=lerp(-100,1700,mu),my=360-Math.sin(mu*PI)*260;A(g,.8,'lighter');putc(g,glow('#dfe8ff'),mx,my,2.2);A(g,1);g.fillStyle='#eef3ff';g.beginPath();g.arc(mx,my,30,0,TAU);g.fill();
  cam(g,C[0],C[1],C[2],.85);const tw=760,th=tw*1550/1500;put(g,as('tree'),800-tw/2,880-tw,tw,th);
  cam(g,C[0],C[1],C[2],1);g.fillStyle='#06050e';g.beginPath();g.moveTo(-300,1100);g.lineTo(-300,860);g.quadraticCurveTo(800,700,1900,860);g.lineTo(1900,1100);g.closePath();g.fill();
  const sn=ez((t-1.2)/.4)*(1-ez((t-3)/.5));if(sn>0){stage(g);g.fillStyle='rgba(240,245,255,'+(.8*sn)+')';for(const r of I.rain)g.fillRect(r.x+Math.sin(t*1.5+r.l)*20,((r.y+t*r.v*.12)%1100)-100,3,3)}
  const gr=ez((t-2.8)/1.8);if(gr>0){cam(g,C[0],C[1],C[2],1);g.strokeStyle='#2f8a5a';g.lineWidth=5;g.beginPath();for(const v of I.vines){const n=Math.floor(v.length*gr);if(n<2)continue;g.moveTo(v[0][0],v[0][1]);for(let i=1;i<n;i++)g.lineTo(v[i][0],v[i][1])}g.stroke();
   if(gr>.9){g.fillStyle='#ff9ad8';for(const v of I.vines){const p=v[v.length-1];g.beginPath();g.arc(p[0],p[1]-4,5*ez((gr-.9)/.1),0,TAU);g.fill()}}}
  stage(g);g.font='italic 600 34px '+SERIF;g.textAlign='left';g.textBaseline='middle';g.fillStyle='rgba(244,236,255,.8)';g.fillText('Year '+Math.min(100,1+Math.floor(ez(t/(d-.5))*99)),110,190);
  if(t<.3)I.dk=Math.max(I.dk,1-t/.3)}
 // ---- first friend: out of the cave, into the sunrise... and face to face with a sprout. Both scream. Then: friends.
 function sMeet(g,t,d){const GY=760,S=80,C=[800,450,lerp(1.04,1.08,ez(t/d))];I.C=C;
  cam(g,C[0],C[1],C[2],.4);put(g,as('m1'),-40,-30,1680,960);
  cam(g,C[0],C[1],C[2],1);for(let x=-200;x<1900;x+=S){blk(g,0,x,GY,S);blk(g,2,x,GY+S,S)}
  g.fillStyle='#07060c';g.beginPath();g.moveTo(-200,GY);g.lineTo(-200,200);g.quadraticCurveTo(180,180,250,420);g.quadraticCurveTo(290,560,230,GY);g.closePath();g.fill();g.fillStyle='#000';g.beginPath();g.moveTo(40,GY);g.quadraticCurveTo(60,470,150,470);g.quadraticCurveTo(220,520,200,GY);g.closePath();g.fill();
  const scared=t>1.6&&t<3.0,hx=lerp(120,600,ez(Math.min(1,t/1.6))),kneel=t>3.4?lerp(1,.62,ez((t-3.4)/.5)):1;
  hero(g,hx+(scared?Math.sin(t*60)*3:0),GY,kneel,1,t,'#ffd8b0',t<1.6?t*9:null);
  const st=t-1.5;if(st>0){const hop=t>3&&t<3.6?Math.abs(Math.sin((t-3)*PI*3.3))*40:0;g.save();g.beginPath();g.rect(-400,-400,2600,GY+400);g.clip();sprig(g,820,GY+70*(1-bo(st/.25))-hop,1.6,t,scared?'scream':t>3?'laugh':0);g.restore();
   if(t>3.6){const sa=ez((t-3.6)/.3);A(g,1,'lighter');putc(g,glow('#bff6ff'),820,GY-150,1.2*sa+.1*Math.sin(t*9));putc(g,as('spark'),820,GY-150,.8*sa);A(g,1)}
   if(t>3.8)bubble(g,960,GY-230,'...friends?',30,-1,cl((t-3.8)/.1,0,1));
   if(t>4.3){const hp=bo((t-4.3)/.3);g.save();g.translate(710,GY-300-(t-4.3)*30);g.scale(hp,hp);g.fillStyle='#ff6a8a';g.strokeStyle='#120a1e';g.lineWidth=4;g.beginPath();g.moveTo(0,10);g.bezierCurveTo(-26,-8,-14,-30,0,-16);g.bezierCurveTo(14,-30,26,-8,0,10);g.fill();g.stroke();g.restore()}}
  const pt=t-1.75;if(pt>0&&t<3.0){stage(g);const kin=eo(pt/.2),kout=t>2.8?ei((t-2.8)/.2):0;
   for(const side of[0,1]){g.save();g.translate((side?1:-1)*(1-kin+kout)*900,0);g.beginPath();if(side)poly(g,820,0,1600,0,1600,900,740,900);else poly(g,0,0,780,0,700,900,0,900);g.save();g.clip();
    g.fillStyle=side?'#ffd6e6':'#fff1b8';g.fillRect(0,0,1600,900);A(g,.5);put(g,as('speed'),side?400:-400,0,1600,900);A(g,1);
    if(side){sprig(g,1210,700,5,t,'scream');burstTxt(g,1250,270,160,1,.1,'EEEEK!','#ff9ad8')}else{const b=as('bustL');g.drawImage(b.c,0,0,b.c.width,b.c.height*.62,40,150,640,640*(.62*b.h)/b.w);burstTxt(g,350,260,160,1,-.1,'AAAAH!','#ffd36a')}
    g.restore();g.lineWidth=10;g.strokeStyle='#120a1e';g.stroke();g.restore()}
   if(pt<.12)I.fl=Math.max(I.fl,.5*(1-pt/.12))}}
 // ---- practice makes... eventually: four tries, four cuts, one perfect landing
 const TRY=['TRY #1','TRY #9','TRY #31','TRY #77 ✓'];
 function sTrain(g,t,d){const n=Math.min(3,Math.floor(t/1.5)),tc=t-n*1.5,fa=as('flyer');const fly=(x,y,r,s)=>{g.save();g.translate(x,y);g.rotate(r);putc(g,fa,0,0,s||.8);g.restore()};
  if(n==0){cam(g,800,450,1,.25);put(g,as('sky7'),-100,-300);cam(g,800,450,1,.5);put(g,as('clouds'),-200,540);stage(g);
   const a=Math.min(tc,1.05)*8,rr=170;let fx=800+Math.cos(a)*rr*1.3,fy=380+Math.sin(a)*rr*.8;if(tc>1.05)fy+=(tc-1.05)**2*3000;
   A(g,1,'lighter');for(let i=1;i<10;i++){const b=Math.max(0,Math.min(tc,1.05)-i*.03)*8;putc(g,glow('#ffe7c0'),800+Math.cos(b)*rr*1.3,380+Math.sin(b)*rr*.8,.7-i*.06)}A(g,1);
   fly(fx,fy,a+PI/2,.8);if(tc>.8){g.fillStyle='#ffe27a';g.strokeStyle='#120a1e';g.lineWidth=3;for(let i=0;i<3;i++){const b=t*7+i*TAU/3;star5(g,fx+Math.cos(b)*40,fy-60+Math.sin(b)*12,10,t*4)}}}
  else if(n==1){cam(g,800,450,1.02,1);put(g,as('m3'),-40,-30,1680,960);lake(g,I.u);const dv=Math.min(1,tc/.68);if(tc<.68){const x=lerp(300,900,dv),y=lerp(-80,640,dv*dv);if(dv>.6)reflect(g,WL,I.u,()=>fly(x,y,2.3,.8));fly(x,y,2.3,.8)}
   if(tc>.68){wRing(g,900,WL,(tc-.68)/.82,1.5);if(tc>.95){g.fillStyle='#07050d';g.fillRect(885,628,8,22);g.fillRect(905,624,8,26);wRing(g,899,WL,((tc-.95)%.5)/.5,.35)}wSplash(g,900,WL,(tc-.68)/.6,1.5)}
   g.fillStyle='rgba(2,8,22,.45)';g.beginPath();g.ellipse(386,697,74,17,0,0,TAU);g.fill();g.fillStyle='#2f8a5a';g.beginPath();g.ellipse(380,690,70,16,0,0,TAU);g.fill();g.strokeStyle='rgba(190,230,200,.45)';g.lineWidth=2;g.beginPath();g.ellipse(380,689,68,14,0,PI*1.05,PI*1.95);g.stroke();sprig(g,380,690,1.2,t,0);if(tc>.9)card(g,380,520,'2/10')}
  else if(n==2){cam(g,800,450,1,.25);put(g,as('sky7'),-100,-300);cam(g,800,450,1,.5);put(g,as('clouds'),-200,600);stage(g);const ia=as('isl1');put(g,ia,800-ia.w,-300,ia.w*2,ia.h*2);
   const HIT=.52,fx=760;let fy=lerp(1000,330,ez(Math.min(1,tc/HIT)));if(tc>.95)fy=330+(tc-.95)**2*2600;fly(fx,fy,tc<HIT?-.1:PI+(tc<.95?.3*Math.sin(t*30):0),.8);
   if(tc>HIT&&tc<HIT+.6)burstTxt(g,600,260,120,bo((tc-HIT)/.15),-.15,'CLONK!','#7fd8ff');
   if(tc>.62&&tc<1.0){const v=(tc-.62)/.3;blk(g,1,fx-28,lerp(180,fy-80,Math.min(1,v*v)),56)}
   if(tc>.92&&tc<1.3)burstTxt(g,fx+130,fy-130,70,bo((tc-.92)/.12),.2,'bonk','#ffd36a')}
  else{cam(g,800,450,1,.25);put(g,as('sky7'),-100,-300);stars(g,t,.2);cam(g,800,450,1,.5);put(g,as('clouds'),-200,560);stage(g);const ia=as('isl0'),sc=2.2,top=640;put(g,ia,800-ia.w*sc/2,top-.19*ia.w*sc,ia.w*sc,ia.h*sc);
   const LAND=.6,HX=950;if(tc<LAND){const u=ez(tc/LAND);fly(lerp(300,HX,u),lerp(200,top-70,u)-Math.sin(u*PI)*60,lerp(1.3,.2,u),.8)}
   else{const w=tc-LAND,s=.24,wa=as('wing');put(g,wa,HX-650*s,top-98-560*s,1300*s,860*s);hero(g,HX,top,1,.75,t,'#ffd8b0');A(g,1,'lighter');for(let i=0;i<10;i++){const a=i/10*TAU+w*2;putc(g,as('spark'),HX+Math.cos(a)*(60+w*120),top-80+Math.sin(a)*(40+w*80),Math.max(0,.5*(1-w)))}A(g,1)}
   const jump=tc>LAND?Math.abs(Math.sin((tc-LAND)*12))*30:0;sprig(g,1075,top-jump,1.3,t,tc>LAND?'laugh':0);if(tc>LAND+.1)card(g,1075,top-170-jump,'10/10!')}
  stage(g);const sp=bo(Math.min(1,tc/.18));g.save();g.translate(140,200);g.rotate(-.08);g.scale(sp,sp);g.font='italic 900 64px '+SANS;g.textAlign='left';g.textBaseline='middle';g.lineWidth=12;g.strokeStyle='#120a1e';g.strokeText(TRY[n],0,0);g.fillStyle=n==3?'#7fffb0':'#fff';g.fillText(TRY[n],0,0);g.restore();
  if(tc<.08)I.fl=Math.max(I.fl,.4*(1-tc/.08))}
 // ---- the journey: crystal caves, red mesas, frozen peaks streaming past; the guardians' lairs glow on the horizon
 // per region: sky top, sky middle, horizon, far ranges, near ranges, glow. Each region holds for a third of the scene, then blends quickly.
 const BIO=[['#020c2a','#0d3a7a','#5fe0ff','#0f3a66','#06203e','#7ff6ff'],['#1a0610','#8a2a2a','#ff9a4a','#5a1a1a','#2a0a0a','#ff6a2a'],['#0a1a3a','#4a7ac0','#f0f8ff','#5a7ab0','#2a3a6a','#e8fbff']];
 function sJourney(g,t,d){const seg=d/3,i0=Math.min(2,Math.floor(t/seg)),f=i0<2?ez(((t%seg)/seg-.72)/.28):0,i1=Math.min(2,i0+1),col=j=>mix(BIO[i0][j],BIO[i1][j],f),wt=b=>b==i0?1-f:b==i1?f:0;
  g.setTransform(1,0,0,1,0,0);const sg=g.createLinearGradient(0,0,0,I.ch);sg.addColorStop(0,col(0));sg.addColorStop(.55,col(1));sg.addColorStop(1,col(2));g.fillStyle=sg;g.fillRect(0,0,I.cw,I.ch);
  stage(g);
  for(let i=0;i<6;i++){const x=((i*520-t*.18*420)%3120+3120)%3120-300;if(x<-100||x>1700)continue;A(g,.55,'lighter');drawStreak(g,BC[BIDS[i]],x,560,-PI/2,420,.6,16);putc(g,glow(BC[BIDS[i]]),x,560,1.4);A(g,1)}
  [[.18,560,col(3),.9],[.45,690,mix(col(3),col(4),.5),.9],[1,800,col(4),1.1]].forEach((l,li)=>{const h=I.mt[li],N=h.length,seg=60,off=t*l[0]*420,base=Math.floor(off/seg),sh=off%seg;g.fillStyle=l[2];g.beginPath();g.moveTo(-seg,900);
   for(let j=-1;j<1600/seg+3;j++)g.lineTo(j*seg-sh,l[1]-h[((base+j)%N+N)%N]*l[3]);g.lineTo(1700,900);g.closePath();g.fill();
   // the near peaks carry each region's mark: crystal spires, lava glow, snow caps
   if(li==2){for(let j=-1;j<1600/seg+3;j++){if(((base+j)%3+3)%3)continue;const px=j*seg-sh,py=l[1]-h[((base+j)%N+N)%N]*l[3];
     if(wt(0)>.01){g.globalAlpha=wt(0);g.fillStyle='#7ff6ff';g.beginPath();poly(g,px-12,py+6,px,py-58,px+12,py+6);poly(g,px+8,py+8,px+20,py-30,px+28,py+8);g.fill();A(g,wt(0)*.8,'lighter');putc(g,glow('#7ff6ff'),px,py-20,.5);A(g,1)}
     if(wt(1)>.01){A(g,wt(1)*.9,'lighter');putc(g,glow('#ff6a2a'),px,py+30,.9);putc(g,glow('#ffd36a'),px,py+4,.3);A(g,1)}
     if(wt(2)>.01){g.globalAlpha=wt(2);g.fillStyle='#f4fbff';g.beginPath();poly(g,px-22,py+18,px,py-2,px+22,py+18);g.fill();g.globalAlpha=1}}}});
  A(g,.7);const cx=(t*520)%2000;put(g,as('clouds'),-cx,680,2000,440);if(cx>400)put(g,as('clouds'),2000-cx,680,2000,440);A(g,1);
  if(wt(1)>.01){A(g,wt(1)*.6,'lighter');for(let i=0;i<20;i++){const m=I.motes[i];putc(g,glow('#ff8a3a'),m.x,900-((t*m.v*4+m.y)%1000),.3)}A(g,1)}
  if(wt(2)>.01){g.fillStyle='rgba(245,250,255,'+(.8*wt(2))+')';for(const r of I.rain)g.fillRect(((r.x-t*600)%1900+1900)%1900-150,((r.y+t*r.v*.15)%1100)-100,3,3)}
  const fx=620+Math.sin(t*1.3)*40,fy=400+Math.sin(t*2.1)*26;A(g,1,'lighter');for(let i=1;i<12;i++)putc(g,glow('#e8fdff'),fx-i*34,400+Math.sin((t-i*.03)*2.1)*26,.75-i*.055);A(g,1);g.save();g.translate(fx,fy);g.rotate(1.38);putc(g,as('flyer'),0,0,.85);g.restore();
  g.strokeStyle='rgba(20,10,30,.7)';g.lineWidth=3;g.beginPath();for(let i=0;i<6;i++){const bx=((1700-t*260-i*70)%1900+1900)%1900-150,by=230+i%3*30+Math.sin(t*3+i)*10,wf=Math.sin(t*14+i)*8;g.moveTo(bx-14,by-wf);g.lineTo(bx,by);g.lineTo(bx+14,by-wf)}g.stroke()}
 // ---- campfire: friends around the fire, Sprig asleep (with a snot bubble, naturally) until it pops
 function sCamp(g,t,d){const C=[800,lerp(470,455,ez(t/d)),lerp(1.12,1.05,ez(t/d))],FX=800,FY=700;I.C=C;
  cam(g,C[0],C[1],C[2],.25);put(g,as('sky1'),-100,-300);stars(g,t,1);cam(g,C[0],C[1],C[2],.3);A(g,.45+.1*Math.sin(t),'lighter');put(g,as('aurora'),-100,-250);A(g,1);islands(g,I.islF,C,t);
  cam(g,C[0],C[1],C[2],1);g.fillStyle='#08061a';g.fillRect(-300,FY+6,2200,600);g.fillStyle='#1b2f3a';g.fillRect(-300,FY+2,2200,8);
  const fl=.85+.15*Math.sin(t*17)*Math.sin(t*7.3);A(g,.55*fl,'lighter');putc(g,glow('#ff9a3a'),FX,FY-40,7*fl);A(g,1);
  hero(g,620,FY,-1,.9,t,'#ffb070');
  g.save();g.translate(2000,0);g.scale(-1,1);hero(g,1000,FY,-1,.95,t,'#ffb070');g.restore();
  g.save();g.translate(2280,0);g.scale(-1,1);hero(g,1140,FY,-1,1.05,t,'#ffb070');const hx=1140+6*1.05,hy=FY-130*1.05-14;g.fillStyle='#07050d';g.beginPath();g.ellipse(hx,hy,40,9,0,0,TAU);g.fill();g.beginPath();poly(g,hx-20,hy,hx-12,hy-34,hx+14,hy-30,hx+20,hy);g.fill();g.restore();
  g.save();g.translate(FX,FY);g.fillStyle='#2a1a12';for(const r of[-.35,.35]){g.save();g.rotate(r);g.fillRect(-46,-6,92,12);g.restore()}g.restore();
  A(g,1,'lighter');for(const fz of[[1,'#ff6a2a',60],[.72,'#ffb04a',44],[.45,'#fff0b0',28]]){const hgt=fz[2]*2.2*(1+.12*Math.sin(t*13+fz[0]*5));g.fillStyle=fz[1];g.beginPath();g.moveTo(FX-fz[2]*.8,FY);g.quadraticCurveTo(FX-fz[2],FY-hgt*.5,FX+Math.sin(t*9)*8,FY-hgt);g.quadraticCurveTo(FX+fz[2],FY-hgt*.5,FX+fz[2]*.8,FY);g.closePath();g.fill()}
  for(let i=0;i<20;i++){const u=((t*.9+i*.137)%1);putc(g,glow('#ffb04a'),FX+Math.sin(t*3+i)*24*u+(i%5-2)*6,FY-30-u*260,.22*(1-u))}A(g,1);
  const pop=4.2,startle=t>pop&&t<pop+.5;sprig(g,700,FY-(startle?Math.sin((t-pop)/.5*PI)*50:0),1,t,startle?'scream':'sleep');
  if(t<pop){const br=4+10*(.5+.5*Math.sin(t*PI/.8));g.fillStyle='rgba(190,240,255,.55)';g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.beginPath();g.arc(712,FY-12,br,0,TAU);g.fill();g.stroke();
   g.font='italic 800 26px '+SANS;g.fillStyle='rgba(255,255,255,.8)';g.textAlign='center';for(let i=0;i<3;i++){const u=((t*.5+i/3)%1);g.globalAlpha=Math.sin(u*PI)*.8;g.fillText('z',700+20+u*40+i*6,FY-60-u*90)}g.globalAlpha=1}
  else if(t<pop+.3){const u=(t-pop)/.3;g.strokeStyle='rgba(255,255,255,'+(1-u)+')';g.lineWidth=3;for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(712+Math.cos(a)*(8+u*14),FY-12+Math.sin(a)*(8+u*14));g.lineTo(712+Math.cos(a)*(14+u*24),FY-12+Math.sin(a)*(14+u*24));g.stroke()}}
  if(t>pop&&t<pop+.8)bubble(g,640,FY-150,'!!',30,1,cl((t-pop)/.06,0,1)*cl((pop+.8-t)/.1,0,1))}
 // ---- restoration: the seed goes into the roots, gold light races out along them, colour floods back and the islands rise
 function sRestore(g,t,d){const B=1.6,k=t/d,lit=ez((t-B)/2.4),rise=ez((t-B-.3)/2.6),C=[800,lerp(560,470,ez(k)),lerp(1.15,.97,ez(k))];I.C=C;I.isy=lerp(800,0,rise);
  world(g,t,C,{st:.4+.6*lit,au:.6*lit,gw:.15+.6*lit,gc:'#ffd77a',veins:0,cl:.5+.5*lit,
   pre:g2=>{if(lit>0){A(g2,lit);put(g2,as('sky7'),-100,-300);A(g2,1)}},
   mid:g2=>{if(t<=B)return;const R=lerp(0,1300,ez((t-B)/2.2)),tw=900,th=tw*1550/1500,tx=800-tw/2,ty=900-tw;g2.save();g2.beginPath();g2.arc(800,800,R,0,TAU);g2.clip();A(g2,.95,'lighter');put(g2,as('treeY'),tx,ty,tw,th);A(g2,1);g2.restore();
    A(g2,(1-ez((t-B)/2.2))*.8,'lighter');g2.strokeStyle='#ffe7a0';g2.lineWidth=10;g2.beginPath();g2.arc(800,800,R,0,TAU);g2.stroke();A(g2,1)}});
  I.isy=0;
  if(lit<1){g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(6,4,20,'+(.45*(1-lit))+')';g.fillRect(0,0,I.cw,I.ch)}
  cam(g,C[0],C[1],C[2],.85);const fy=t<1.2?lerp(300,700,ez(t/1.2)):t<B+.6?700:lerp(700,520,ez((t-B-.6)/3));g.save();g.translate(800,fy);putc(g,as('flyer'),0,0,.55);g.restore();
  if(t>1.1&&t<B+.05){const u=ez((t-1.1)/.5);A(g,1,'lighter');putc(g,glow('#bff6ff'),800,lerp(fy+20,800,u),.9);putc(g,as('spark'),800,lerp(fy+20,800,u),.7);A(g,1)}
  if(t>B){const w=t-B;A(g,(1-ez(w/2.5))*.9,'lighter');g.save();g.translate(800,800);g.rotate(w*.3);putc(g,as('rays'),0,0,1.2+w*.4);g.restore();A(g,1)}
  motes(g,t,.3+.5*lit,'#ffe7a0');
  if(t>=B&&t<B+.4)I.fl=Math.max(I.fl,(1-(t-B)/.4)*.9);if(t<.3)I.dk=Math.max(I.dk,1-t/.3)}
 const SCN={tree:sTree,village:sVillage,eclipse:sEclipse,fall:sFall,bosses:sBosses,ages:sAges,wake:sWake,meet:sMeet,wings:sWings,oops:sOops,training:sTrain,journey:sJourney,clash:sClash,camp:sCamp,montage:sMont,restore:sRestore,title:sTitle};
 // ---- frame: background scene, then flash / letterbox / caption in screen space
 function draw(){const g=I.g,u=I.u;g.setTransform(1,0,0,1,0,0);A(g,1);g.fillStyle='#000';g.fillRect(0,0,I.cw,I.ch);I.fl=0;I.dk=0;I.sa=0;I.shx=I.shy=0;
  let si=0;while(si<STORY.length-1&&u>=STORY[si+1][3])si++;const S=STORY[si],t=u-S[3];I.si=si;
  if(!I.prep&&I.vsi!==si){I.vsi=si;if(S[2])narr(S[2],S[0]);if(S[0]=='title'&&!I.vt){I.vt=1;setTimeout(()=>narr('RootBound.','title',true),Math.max(0,(.5-t)*1000))}}
  // shake is decided by the scene's first lines; compute it with a dry pass of the timings
  const pre=SCN[S[0]];I.sa=0;
  if(!I.red){const sa=shakeAt(S[0],t);if(sa>0){I.shx=(R()-.5)*2*sa*I.s/2;I.shy=(R()-.5)*2*sa*I.s/2}}
  g.save();try{pre(g,t,S[1])}catch(e){if(!draw.e){draw.e=1;console.error('CINE7 scene',S[0],e)}}g.restore();
  g.setTransform(1,0,0,1,0,0);A(g,1);
  const vg=as('vig');g.drawImage(vg.c,0,0,I.cw,I.ch);
  // fine film grain (one pattern fill, moved every frame)
  if(!I.red){const gp=I.gp||(I.gp=g.createPattern(as('grain').c,'repeat'));g.save();g.globalAlpha=.05;g.globalCompositeOperation='overlay';g.translate(-(R()*256|0),-(R()*256|0));g.fillStyle=gp;g.fillRect(0,0,I.cw+256,I.ch+256);g.restore()}
  // ink-slash wipe into the scenes that start on a hard cut
  if(WIPE[S[0]]&&t<.28){const k=eo(t/.28),w=I.cw*1.6;g.fillStyle=WIPE[S[0]];g.beginPath();g.moveTo(-I.cw*.3+k*w,0);g.lineTo(I.cw*1.6+k*w,0);g.lineTo(I.cw*1.3+k*w,I.ch);g.lineTo(-I.cw*.6+k*w,I.ch);g.closePath();g.fill()}
  if(u<1.2)I.dk=Math.max(I.dk,1-ez(u/1.2));
  if(I.dk>0){g.fillStyle='rgba(0,0,0,'+I.dk+')';g.fillRect(0,0,I.cw,I.ch)}
  if(I.fl>0){g.fillStyle='rgba(255,255,255,'+(I.red?Math.min(.35,I.fl):I.fl)+')';g.fillRect(0,0,I.cw,I.ch)}
  // letterbox: slides in at the start, opens a little for the title
  const bh=I.ch*lerp(.115,.075,ez((u-(TI0+.4))/.6))*eo(u/.9);g.fillStyle='#000';g.fillRect(0,0,I.cw,bh);g.fillRect(0,I.ch-bh,I.cw,bh);
  // typewriter caption inside the lower bar
  const cap=S[2];if(cap&&bh>8){const ct=t-.35,n=Math.floor(ct/Math.min(.034,(S[1]*.55)/cap.length));if(n>0){const fs=Math.max(12,Math.min(bh*.34,I.cw*.021));g.font='italic 600 '+fs+'px '+SERIF;let f2=fs;while(g.measureText(cap).width>I.cw*.9&&f2>10){f2-=1;g.font='italic 600 '+f2+'px '+SERIF}
    const shown=cap.slice(0,n),fade=1-ez((t-(S[1]-.3))/.3);g.textAlign='center';g.textBaseline='middle';const full=g.measureText(cap).width,x0=I.cw/2-full/2;g.textAlign='left';g.fillStyle='rgba(244,236,255,'+fade+')';g.fillText(shown,x0,I.ch-bh/2);
    if(n<cap.length&&Math.floor(u*6)%2==0){const w=g.measureText(shown).width;g.fillStyle='rgba(255,215,122,'+fade+')';g.fillRect(x0+w+3,I.ch-bh/2-f2*.4,2,f2*.8)}}}}
 const WIPE={fall:'#000',meet:'#fff6e0',oops:'#fff6e0',training:'#fff6e0',journey:'#000',clash:'#000',camp:'#000',montage:'#000'};   // scenes that open on an ink-slash wipe
 function shakeAt(id,t){if(id=='eclipse'){const ct=t-1.8;return ct>0&&ct<.7?(1-ct/.7)*22:0}if(id=='wings'){const bt=t-1.0;return bt>0&&bt<.5?(1-bt/.5)*16:0}if(id=='title'){const st=t-.55;return st>0&&st<.5?(1-st/.5)*18:0}if(id=='oops'){const ht=t-1.25;return ht>0&&ht<.4?(1-ht/.4)*16:0}
  if(id=='fall'){let s=2.5;for(const b of[.3,1.0,1.6,2.3]){const v=(t-b)/.35;if(v>0&&v<1)s=Math.max(s,(1-v)*10)}return s}
  if(id=='training'){const v=(t-3.52)/.3;return v>0&&v<1?(1-v)*12:0}
  if(id=='restore'){const v=(t-1.6)/.6;return v>0&&v<1?(1-v)*12:0}
  if(id=='clash'){for(const s of[[.9,24,.6],[3.6,12,.45]]){const v=(t-s[0])/s[2];if(v>0&&v<1)return(1-v)*s[1]}return 0}
  if(id=='montage'){const tc=t-MCUT[1][0];if(tc>0&&tc<MCUT[1][1]){for(const h of[.3,.58]){const v=(tc-h)/.14;if(v>0&&v<1)return(1-v)*10}}}return 0}
 function fit(){if(!I)return;const d=Math.min(1.5,window.devicePixelRatio||1);I.cw=Math.max(320,Math.round(innerWidth*d));I.ch=Math.max(180,Math.round(innerHeight*d));I.cv.width=I.cw;I.cv.height=I.ch;I.s=Math.max(I.cw/1600,I.ch/900)}
 function sched(){const ax=au();while(I.evi<I.ev.length&&I.ev[I.evi][0]<=I.u+.3){const e=I.ev[I.evi++];if(ax&&e[0]>=I.u-.08)try{e[1](ax.a.currentTime+Math.max(0,(e[0]-I.u)*I.k)+.02)}catch(_){}}}
 function frame(now){if(!I)return;I.raf=requestAnimationFrame(frame);const f0=performance.now();
  // prep: build every scene's art on a black screen BEFORE the story clock starts (~12 ms of work per frame), so nothing is
  // built mid-scene. Building art lazily during playback caused freezes of up to 0.3 s in the opening seconds.
  // each finished picture is also drawn once, tiny, so the GPU has it uploaded before the scene needs it (first draws cost up to 0.1 s)
  // Then the audio graph is built (its reverb takes ~0.25 s to set up) and every scene is rehearsed once, unseen, at a few moments:
  // that compiles the GPU's drawing programs for each new kind of draw before the story needs it. Then the clock starts.
  if(I.prep){if(!AX||AX.a!==AC)au();else nbuf(AX.a);   // a brand-new AudioContext can report 'suspended' for a moment: keep trying until the graph exists
   while(I.q2.length&&performance.now()-f0<12){const n=I.q2.shift();try{const a=as(n);if(a&&a.c){I.g.setTransform(1,0,0,1,0,0);I.g.drawImage(a.c,0,0,4,4)}}catch(e){console.error('CINE7 art',n,e)}}
   if(!I.q2.length){if(!I.warm){I.warm=[];for(const s of STORY)for(const k of[.1,.4,.7,.95])I.warm.push(s[3]+s[1]*k)}
    while(I.warm.length&&performance.now()-f0<12){I.u=I.warm.shift();try{draw()}catch(e){console.error('CINE7 warm',e)}}}
   if((I.q2.length||I.warm.length||!AX)&&now-I.prep<6000){const g=I.g;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,I.cw,I.ch);return}
   I.prep=0;I.u=0;I.trc=null;I.isy=0;I.last=now}
  const dt=Math.min(.1,(now-I.last)/1000);I.last=now;
  {let si=0;while(si<STORY.length-1&&I.u>=STORY[si+1][3])si++;const S=STORY[si];if(si!==I.hsi){I.hsi=si;I.hold=0}
   let r=1;if(vpend>0&&si<STORY.length-1&&I.u>S[3]+S[1]-.5&&I.hold<3){r=.15;I.hold+=dt}I.rate=r;I.el+=dt*r}
  I.u=Math.min(ST,I.el/I.k);
  sched();draw();
  // build upcoming art while there is time left in this frame
  if(I.q2.length&&performance.now()-f0<7){const n=I.q2.shift();try{as(n)}catch(e){console.error('CINE7 art',n,e)}}
  if(I.u>=ST-.9&&!I.ending){I.ending=1;try{I.done&&I.done()}catch(e){console.error(e)}I.cv.style.transition='opacity '+(.9*I.k).toFixed(2)+'s ease';I.cv.classList.add('out')}
  if(I.el>=ST*I.k+.05)end()}
 function blockKey(e){if(!I)return;try{if(AC&&AC.state=='suspended')AC.resume()}catch(_){}if(/^F\d+$/.test(e.key||''))return;e.stopImmediatePropagation();e.preventDefault()}
 function resume(){try{if(AC&&AC.state=='suspended')AC.resume()}catch(_){}}
 // ---- narrator (VOX12): deep, calm and clean; darker characters get a deeper, more commanding read. The score ducks under the voice.
 let talking=0,vpend=0;
 const duck=on=>{if(on){talking++;DUCK=.45}else{talking=Math.max(0,talking-1);if(!talking)DUCK=1}vol()};
 // one narration line. vpend counts lines not yet finished: the story clock eases into slow motion at the end of a scene while it is > 0.
 // A safety timer releases a line whose end event never comes (no voices installed, speech service hiccup).
 function narr(text,id,title){try{const p=VOX12.params();let fin=false,dk=false,tm=0;const on=()=>{if(!dk){dk=true;duck(true)}},
    done=()=>{if(fin)return;fin=true;clearTimeout(tm);vpend=Math.max(0,vpend-1);if(dk){dk=false;duck(false)}};
   vpend++;tm=setTimeout(done,(VOX12.est(text,p.rate)*1.6+3)*1000);
   const a=VO.ok&&VO.el[id];
   if(a){VOX12.log.push(text);try{a.currentTime=0;a.volume=Math.min(1,OPT.sv==null?1:+OPT.sv);a.onplay=on;a.onended=done;a.onerror=done;const pr=a.play();if(pr&&pr.catch)pr.catch(done)}catch(_){done()}}
   else if(!VOX12.say(text,{pitch:title?Math.max(.74,p.pitch-.06):p.pitch,rate:title?.74:p.rate,onstart:on,onend:done}))done();
  if(title){try{const A=au();if(A){const t0=A.a.currentTime+.05;o('m',65.4,65.4,t0,3.2,'sine',.09,.06);o('m',98,98,t0,3,'sine',.05,.08);o('m',130.8,130.8,t0+.05,2.6,'triangle',.025,.1,0,1)}}catch(_){}}}catch(_){}}
 function end(){if(!I)return;cancelAnimationFrame(I.raf);{const t0=Date.now(),w=()=>{if(I)return;if(vpend>0&&Date.now()-t0<9000){setTimeout(w,250);return}try{VOX12.stop()}catch(_){}DUCK=1;talking=0;vpend=0;vol()};setTimeout(w,400)}removeEventListener('resize',fit);removeEventListener('keydown',blockKey,true);try{I.cv.remove()}catch(_){}I=null;
  try{if(!(typeof SHOW7!='undefined'&&SHOW7.isOpen))window.RB_COVER=false}catch(_){window.RB_COVER=false}try{startBGM()}catch(_){}/* the game's music takes over (it was held back during the story) */}
 function intro(done){if(I)return false;try{retime(reduce()?.6:1)}catch(e){console.error('CINE7 retime',e)}const red=reduce(),cv=mk(1,1);cv.id='cine7';cv.setAttribute('role','img');cv.setAttribute('aria-label','Story intro: Rootbound, Celestial Ascension');document.body.appendChild(cv);
  I={cv,g:cv.getContext('2d',{alpha:false}),k:red?.6:1,red,el:0,u:0,last:performance.now(),prep:performance.now(),done,as:{},ev:score(),evi:0,fl:0,dk:0,sa:0,shx:0,shy:0,C:[800,450,1]};fit();I.q=Math.min(2,I.s*1.1);
  const r=srnd(99);I.stars=[];for(let i=0;i<260;i++)I.stars.push({x:-100+r()*1800,y:-300+r()*950,r:r()<.85?1.2+r()*1.3:2.4+r()*1.5,b:.4+r()*.6,sp:1+r()*3,ph:r()*6});I.big=[];for(let i=0;i<14;i++)I.big.push({x:-50+r()*1700,y:-280+r()*700,r:18+r()*26,ph:r()*6});
  I.motes=[];for(let i=0;i<64;i++)I.motes.push({x:r()*1600,y:r()*900,v:14+r()*36,r:5+r()*13,ph:r()*6,c:r()<.7?'#9ff6ff':'#ffe08a'});
  I.islF=[{a:'isl2',x:300,y:190,p:.6,sc:1,ph:1},{a:'isl3',x:1290,y:120,p:.6,sc:1,ph:2},{a:'isl4',x:1060,y:520,p:.6,sc:1,ph:3}];I.islN=[{a:'isl0',x:150,y:520,p:1.15,sc:1,ph:4},{a:'isl1',x:1460,y:380,p:1.15,sc:1,ph:5}];
  I.rain=[];for(let i=0;i<170;i++)I.rain.push({x:-300+r()*2100,y:r()*1100,l:28+r()*46,v:1300+r()*700});
  I.lan=[];for(let i=0;i<36;i++)I.lan.push({x:60+r()*1480,y:620+r()*260,v:38+r()*50,dl:r()*4.5,s:.55+r()*.7,ph:r()*6});
  I.fallI=[{a:'isl0',x:260,y:430,sc:1,p:.9,dl:.2,dir:-1},{a:'isl1',x:1320,y:320,sc:1,p:.9,dl:.9,dir:1},{a:'isl2',x:560,y:170,sc:1,p:.6,dl:1.5,dir:-1},{a:'isl3',x:1110,y:150,sc:1,p:.6,dl:.5,dir:1},{a:'isl4',x:930,y:470,sc:1.2,p:.7,dl:2.2,dir:-1}];
  I.trail=[];for(let i=0;i<150;i++)I.trail.push({r:150+r()*1500,a:r()*TAU});
  {const hill=u=>[(1-u)*(1-u)*-300+2*(1-u)*u*800+u*u*1900,(1-u)*(1-u)*860+2*(1-u)*u*700+u*u*860];I.vines=[];for(let i=0;i<16;i++){const u0=.12+r()*.76,dir=r()<.5?-1:1,pts=[];for(let j=0;j<12;j++){const p=hill(u0+dir*j*.006);pts.push([p[0],p[1]+2-Math.abs(Math.sin(j*.9+i))*10-j*1.5])}I.vines.push(pts)}}
  I.mt=[0,1,2].map(li=>{const h=[];for(let j=0;j<64;j++)h.push(Math.max(10,(li==0?150:li==1?110:70)+Math.sin(j*.45+li*2)*60+Math.sin(j*1.3+li)*30+r()*40+(j%5==0&&li==2?50:0)));return h});
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

 // ================= BOSSES: letterbox + name card, defeat card, loss card, slow motion and synthesized boss sounds =================
 // BOSS10 (89-zz-bossfight.js) directs the cinematics (camera, hold, entrance / collapse art, timing) and calls these for the overlay layer.
 let B7=null,tS=1,slowT0=0,slowD=0,slowLo=.28,SL=null;
 function slCanvas(){if(SL)return SL;const w=Math.max(320,innerWidth*.5|0),h=Math.max(180,innerHeight*.5|0),c=mk(w,h),x=c.getContext('2d'),r=srnd(19);x.fillStyle='#fff';for(let i=0;i<150;i++){const a=r()*TAU,r0=Math.min(w,h)*(.42+r()*.2),L=Math.hypot(w,h),wd=.003+r()*.006;x.globalAlpha=.3+r()*.6;x.beginPath();x.moveTo(w/2+Math.cos(a)*r0,h/2+Math.sin(a)*r0*.8);x.lineTo(w/2+Math.cos(a-wd)*L,h/2+Math.sin(a-wd)*L);x.lineTo(w/2+Math.cos(a+wd)*L,h/2+Math.sin(a+wd)*L);x.closePath();x.fill()}SL=c;return c}
 function killB(){if(!B7)return;B7.tms.forEach(clearTimeout);try{B7.w.remove()}catch(_){}B7=null}
 function shell(cls,c){const w=document.createElement('div');w.id='cine7b';w.className=cls;w.style.setProperty('--c',c);w.setAttribute('aria-hidden','true');return w}
 const later=(f,ms)=>{const b=B7;const h=setTimeout(()=>{if(B7===b)try{f()}catch(e){console.error('CINE7 boss',e)}},ms);b.tms.push(h)};
 const nextF=(w,c)=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(B7&&B7.w===w)w.classList.add(c)}));
 const BARS='<i class="c7b-bar t"></i><i class="c7b-bar b"></i>';
 // intro overlay: letterbox now, the name card (+ speed lines) at o.card ms, card out at o.out, removed at o.end
 function bossIntro(m,arena,o){killB();o=o||{};const id=String(m.k||'').replace('boss_',''),b=bdef(id)||{n:BNM[id]||'Boss',c:BC[id]||'#b58cff'},c=b.c||BC[id]||'#b58cff',red=reduce();
  const card=o.card==null?400:o.card,out=o.out==null?card+1500:o.out,end=o.end==null?out+600:o.end;
  const w=shell('c7b'+(red?' red':''),c);w.innerHTML=BARS+'<div class="c7b-sl"></div><div class="c7b-card"><span class="c7b-stripe"></span><em>'+esc(EPI[id]||b.desc||'')+'</em><b>'+esc(b.n)+'</b><small>A boss appears</small></div>';
  const sl=w.querySelector('.c7b-sl');if(!red)sl.appendChild(slCanvas());w.querySelector('.c7b-stripe').style.background='linear-gradient(90deg,transparent,'+rgba(c,.0)+' 4%,'+rgba(mix(c,'#000000',.45),.85)+' 22%,'+rgba(mix(c,'#000000',.45),.85)+' 78%,transparent)';
  document.body.appendChild(w);B7={w,m,tms:[],kind:'in'};nextF(w,'bars');
  later(()=>w.classList.add('on'),card);later(()=>w.classList.add('off'),out);later(()=>killB(),end)}
 // skip: card and bars leave at once
 function bossSkip(){if(!B7||B7.kind!='in')return;B7.tms.forEach(clearTimeout);B7.tms=[];B7.w.classList.add('off');later(()=>killB(),520)}
 // outro start: letterbox only (the defeat card takes over without the bars sliding again)
 function bossBars(c){killB();const w=shell('c7b out',c||'#ffd36a');w.innerHTML=BARS;document.body.appendChild(w);B7={w,tms:[],kind:'out'};nextF(w,'bars');later(()=>killB(),6000)}
 // defeat card (o.cine: shown by BOSS10's outro, which already runs the slow motion and the flash)
 function bossWin(m,b,first,o){const cine=!!(o&&o.cine),keep=cine&&B7&&B7.kind=='out';killB();const c=b.c||'#ffd36a',red=reduce(),D=cine?(red?2.4:3.0):(red?2.4:3.4);if(!red&&!cine)slow(1150);
  const rw='+'+(b.gems|0).toLocaleString()+' gems   ·   +'+(b.xp|0).toLocaleString()+' XP'+(first&&b.rn?'   ·   Relic: '+b.rn:'');
  const w=shell('c7b win'+(red?' red':'')+(cine?' nf':'')+(keep?' b0 bars':''),c);w.innerHTML='<i class="c7b-flash"></i>'+BARS+'<div class="c7b-card"><span class="c7b-stripe"></span><em>'+esc(b.n)+'</em><b>Boss Defeated</b><small>'+esc(rw)+'</small>'+(first&&b.rd?'<small class="c7b-rd">'+esc(b.rn+': '+b.rd)+'</small>':'')+'</div>';
  w.querySelector('.c7b-stripe').style.background='linear-gradient(90deg,transparent,'+rgba('#3a2a08',.85)+' 22%,'+rgba(mix(c,'#000000',.55),.85)+' 78%,transparent)';
  document.body.appendChild(w);B7={w,m,tms:[],kind:'win'};if(keep)requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.remove('b0')));if(!keep)nextF(w,'bars');nextF(w,'on');
  later(()=>w.classList.add('off'),D*1000-650);later(()=>killB(),D*1000)}
 function bossLose(name){killB();const red=reduce(),D=red?1.8:2.4,w=shell('c7b lose'+(red?' red':''),'#ff4a5a');w.innerHTML='<i class="c7b-dim"></i><div class="c7b-card"><b>Defeated</b><small>'+esc(String(name||'The boss'))+' vanished into the dark</small></div>';
  document.body.appendChild(w);B7={w,tms:[],kind:'lose'};nextF(w,'on');later(()=>w.classList.add('off'),D*1000-600);later(()=>killB(),D*1000)}
 // slow motion (game time only): eases from lo back to 1 over d ms; slow(0) stops it at once
 function slow(d,lo){if(!d){slowD=0;tS=1;return}slowT0=performance.now();slowD=d;slowLo=lo==null?.28:lo}
 const slowNow=()=>{if(!slowD)return 1;const k=(performance.now()-slowT0)/slowD;if(k>=1||k<0){slowD=0;return 1}return lerp(slowLo,1,ez(k))};
 {const _u=update;update=function(dt){tS=slowNow();return _u.call(this,dt*tS)}}
 try{const _vu=VFX.update;VFX.update=function(dt){return _vu.call(this,dt*tS)}}catch(_){}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){return _t.call(this,dt*tS)}}
 // ---- synthesized boss sounds (sfx bus with reverb): a roar per boss, entrance sounds, phase change, collapse + final burst, barrier
 const RV={warden:[62,.9,520,1.5],sovereign:[98,1.25,1500,1.3],eclipse:[52,.8,700,1.7],magma:[44,.7,380,1.7],tide:[74,1.1,900,1.6],storm:[150,1.6,2400,1.2]};
 function roar(t,id,v,d){const r=RV[id]||RV.warden,f=r[0],k=r[1],d2=d||r[3];
  for(const det of[-14,0,13])o('s',f*1.5,f*.82,t,d2,'sawtooth',v*.07,.09,det,1);o('s',f*3*k,f*1.4*k,t,d2*.8,'square',v*.025,.12,0,1);
  nz('s',t,d2*1.05,'bandpass',r[2],r[2]*.35,v*.5,.1,1.4,1);nz('s',t,d2*.6,'lowpass',420,90,v*.45,.06,0,1);boom(t,v*.6);
  if(id=='sovereign')shing(t+.12,v*.5);else if(id=='storm')thunder(t+.05,v*.5);else if(id=='tide')o('s',420,180,t+.1,d2*.9,'sine',v*.1,.15,0,1);else if(id=='eclipse')o('s',f*4,f*8,t,d2,'sine',v*.04,.4,0,1)}
 function bossSfx(k,id,v){v=v==null?1:v;sfx(t=>{
  if(k=='roar')roar(t,id,v);else if(k=='phase'){roar(t+.05,id,v*.8,1);crash(t,v*.05)}
  else if(k=='rumble'){nz('s',t,1.6,'lowpass',260,70,v*.32,.4,0,1);o('s',46,34,t,1.6,'sine',v*.25,.4)}
  else if(k=='roots'){for(let i=0;i<6;i++)nz('s',t+i*.09,.18,'bandpass',900+R()*700,300,v*.14,.004,2);thunk(t,v*.25)}
  else if(k=='shards'){riser(t,1.4,v*.12);shatter(t+1.35,v*.18)}
  else if(k=='sun'){o('s',55,40,t,2.2,'sine',v*.22,.6,0,1);riser(t+.2,1.6,v*.08);o('s',880,440,t+.6,1.4,'sine',v*.03,.5,0,1)}
  else if(k=='erupt'){boom(t,v*.45);nz('s',t,1.4,'lowpass',900,140,v*.35,.02,0,1);for(let i=0;i<5;i++)o('s',120+R()*80,60,t+.1+i*.12,.15,'sine',v*.12,.004)}
  else if(k=='surge'){whoosh(t,1.1,v*.16);splash(t+.9,v*.35);nz('s',t+.9,.9,'lowpass',1600,240,v*.25,.01,0,1)}
  else if(k=='thunder'){nz('s',t,.08,'highpass',3000,0,v*.3,.001);thunder(t+.02,v*.5)}
  else if(k=='dive'){whoosh(t,.6,v*.2);o('s',1400,500,t,.6,'sawtooth',v*.03,.05,0,1)}
  else if(k=='land'){boom(t,v*.35);thunk(t,v*.3)}
  else if(k=='fall'){o('s',90,38,t,.6,'sawtooth',v*.08);o('s',62,30,t,.9,'sine',v*.12);o('s',260,68,t+.15,1.5,'sine',v*.06,.02,0,1);roar(t+.1,id,v*.5,1.2)}
  else if(k=='crack'){for(let i=0;i<4;i++)nz('s',t+i*.21,.09,'highpass',2200+R()*2000,0,v*.12,.001);o('s',1200,600,t,.8,'sine',v*.03,.05,0,1)}
  else if(k=='burst'){boom(t,v*.55);shatter(t+.02,v*.2);crash(t,v*.08);for(let i=0;i<7;i++)o('s',110+R()*90,50,t+.35+i*.15+R()*.05,.12,'triangle',v*.05,.003);[523,659,784,1047].forEach((f,i)=>o('s',f,f,t+1.1+i*.09,.6,'sine',v*.04,.004,0,1))}
  else if(k=='vuln'){o('s',660,990,t,.18,'triangle',v*.05,.003);o('s',990,1320,t+.09,.22,'sine',v*.04,.003)}})}
 return{launch,intro,bossIntro,bossSkip,bossBars,bossWin,bossLose,bossSfx,slow,get tS(){return tS},on:true,get playing(){return !!I},get boss(){return B7&&B7.kind},get world(){return !!W7},
  seek(u){if(!I)return;I.el=cl(u,0,ST)*I.k;I.u=I.el/I.k;I.evi=I.ev.findIndex(e=>e[0]>=I.u);if(I.evi<0)I.evi=I.ev.length;for(const s of NEED)for(const n of s)try{as(n)}catch(_){}},
  get state(){return I?{u:I.u,scene:STORY[I.si|0][0],total:ST,k:I.k,rate:I.rate||1,vpend}:null},get VO(){return VO},retime,lake:()=>!!AB.m3r,STORY}})();
