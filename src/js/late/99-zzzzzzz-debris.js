// ===== DEB12 + BFX12: block-break feedback, hooked as the OUTERMOST breakAt wrapper (it loads last), so every path that removes a block
// through breakAt (tools, vein mining, fists, blasts) is caught by comparing the tile before and after, whatever the inner wrappers return.
// DEB12: debris cut from the block's own texture (irregular fragments of its sprite, made once per block) plus dust in the block's average
// colour, with behaviour by material: dirt/sand/grass clumps that thud and roll, sand grains, stone chips that bounce, ore chips with glints in
// the ore colour, wood splinters that spin, leaves that flutter, glass/ice shards that glint (no dust). It always plays (even with the
// "classic" break effect or reduced effects, then smaller), on top of the chosen break effect (BRK7). Particles live in a struct-of-arrays
// pool (typed arrays, no objects per particle, no garbage while mass-harvesting) that starts at 192 and doubles up to 1024 when full.
// BFX12: each break effect has its own soft sound layer over the material sound (Heart Pop: a warm chime with a gentle magical pulse; Bubble
// Pop: soft pops; Snowfall: crystalline twinkles; ...), from one mapping table, panned by where the block is and balanced on its own gentle bus
// (treble shelf, lowpass, soft compressor), following the Sound effects slider. =====
const DEB12=(()=>{
 const R=Math.random,TAU=Math.PI*2;
 // ---- pool (struct of arrays)
 let N=192,n=0;const MAXN=1024;
 let X,Y,VX,VY,RO,VR,TT,LF,SZ,GV,BN,KD,BC;const IM=[];
 function alloc(sz){const f=()=>new Float32Array(sz),o={X,Y,VX,VY,RO,VR,TT,LF,SZ,GV,BN};X=f();Y=f();VX=f();VY=f();RO=f();VR=f();TT=f();LF=f();SZ=f();GV=f();BN=f();const k=new Uint8Array(sz),b=new Uint8Array(sz);
  if(o.X){X.set(o.X);Y.set(o.Y);VX.set(o.VX);VY.set(o.VY);RO.set(o.RO);VR.set(o.VR);TT.set(o.TT);LF.set(o.LF);SZ.set(o.SZ);GV.set(o.GV);BN.set(o.BN);k.set(KD);b.set(BC)}KD=k;BC=b;IM.length=sz;N=sz}
 alloc(N);
 // kinds: 0 fragment (rotates, bounces), 1 dust (grows, fades, drifts up), 2 glint (star twinkle), 3 grain (tiny, falls), 4 leaf (flutters)
 function add(k,img,x,y,vx,vy,life,sz,grav,bounce,vr){if(n>=N){if(N<MAXN)alloc(Math.min(MAXN,N*2));else return}const i=n++;KD[i]=k;IM[i]=img;X[i]=x;Y[i]=y;VX[i]=vx;VY[i]=vy;TT[i]=0;LF[i]=life;SZ[i]=sz;GV[i]=grav;BN[i]=bounce;RO[i]=R()*TAU;VR[i]=vr||0;BC[i]=0}
 function kill(i){const j=--n;if(i!==j){KD[i]=KD[j];IM[i]=IM[j];X[i]=X[j];Y[i]=Y[j];VX[i]=VX[j];VY[i]=VY[j];TT[i]=TT[j];LF[i]=LF[j];SZ[i]=SZ[j];GV[i]=GV[j];BN[i]=BN[j];RO[i]=RO[j];VR[i]=VR[j];BC[i]=BC[j]}IM[j]=null}
 // ---- per-block art: fragments of its sprite, average colour, material
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c};
 const ART=new Map();
 function mat(b){const nm=(BLK[b]||[''])[0]||'';if(/Glass|Ice|Crystal Block|Window/.test(nm))return'glass';if(/Leaf|Leaves|Hedge|Moss|Vine/.test(nm))return'leaf';
  let c='soft';try{c=TOOLS8.catOf(b)}catch(_){}if(c=='soft'&&/Sand|Gravel/.test(nm))return'sand';if(c=='soft'&&/Snow/.test(nm))return'snow';return c||'soft'}
 function art(b){let a=ART.get(b);if(a)return a;let src=null;try{src=spr(b,0,0)}catch(_){}const S=src&&src.width||32;a={m:mat(b),f:[],dust:null,col:[150,130,110],glint:null};
  try{const one=mk(1,1),o=one.getContext('2d');o.drawImage(src,0,0,1,1);const d=o.getImageData(0,0,1,1).data;if(d[3]>10)a.col=[d[0],d[1],d[2]]}catch(_){const c=BLK[b]&&BLK[b][1];if(c){const v=parseInt(String(c).replace('#',''),16);a.col=[v>>16&255,v>>8&255,v&255]}}
  const C='rgb('+a.col.join(',')+')',dark='rgba(0,0,0,.45)';
  // 8 irregular fragments; wood gets long splinters
  for(let i=0;i<8;i++){const wood=a.m=='wood',fw=wood?S*(.5+R()*.3):S*(.26+R()*.16),fh=wood?S*(.1+R()*.08):S*(.24+R()*.16),sx=R()*(S-fw),sy=R()*(S-fh),c=mk(fw+2,fh+2),x=c.getContext('2d');
   x.beginPath();const pts=wood?4:5+(R()*2|0);for(let p=0;p<pts;p++){const an=p/pts*TAU+R()*.5,rx=(fw/2)*(.75+R()*.25),ry=(fh/2)*(.75+R()*.25);x.lineTo(1+fw/2+Math.cos(an)*rx,1+fh/2+Math.sin(an)*ry)}x.closePath();
   x.save();x.clip();if(src)x.drawImage(src,sx,sy,fw,fh,1,1,fw,fh);else{x.fillStyle=C;x.fillRect(0,0,fw+2,fh+2)}x.restore();x.strokeStyle=a.m=='glass'?'rgba(255,255,255,.8)':dark;x.lineWidth=1;x.stroke();a.f.push(c)}
  a.dust=mk(32,32);{const x=a.dust.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16),l=a.col.map(v=>Math.min(255,v+40)).join(',');g.addColorStop(0,'rgba('+l+',.75)');g.addColorStop(.6,'rgba('+l+',.35)');g.addColorStop(1,'rgba('+l+',0)');x.fillStyle=g;x.fillRect(0,0,32,32)}
  a.grain=mk(4,4);{const x=a.grain.getContext('2d');x.fillStyle=C;x.fillRect(0,0,4,4);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(0,0,4,1.5)}
  if(a.m=='ore'||a.m=='glass'){a.glint=mk(24,24);const x=a.glint.getContext('2d'),l='rgb('+a.col.map(v=>Math.min(255,v+110)).join(',')+')';x.translate(12,12);x.fillStyle=l;x.beginPath();for(let i=0;i<8;i++){const r=i%2?2:11,an=i*Math.PI/4;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.closePath();x.fill();x.fillStyle='#fff';x.beginPath();x.arc(0,0,2,0,TAU);x.fill()}
  ART.set(b,a);return a}
 // ---- spawn for one broken block
 function spawn(tx,ty,b){const a=art(b),TT0=typeof T=='number'?T:32,cx=(tx+.5)*TT0,cy=(ty+.5)*TT0,j=s=>(R()-.5)*s;let k=1;try{k=Math.max(.5,PERF7.k)}catch(_){}try{if(QM.reduce)k*=.5}catch(_){}
  const m=a.m,F=a.f,nf=Math.max(2,Math.round((m=='wood'?5:m=='glass'?7:m=='leaf'?5:6)*k));
  for(let i=0;i<nf;i++){const an=-Math.PI/2+j(2.6),v=(m=='stone'||m=='ore'?150:m=='glass'?170:120)+R()*130;
   if(m=='leaf')add(4,F[i%F.length],cx+j(TT0*.6),cy+j(TT0*.6),j(90),-60-R()*90,1.3+R()*.5,.8+R()*.4,120,0,j(4));
   else add(0,F[i%F.length],cx+j(TT0*.5),cy+j(TT0*.5),Math.cos(an)*v,Math.sin(an)*v,.9+R()*.5,.75+R()*.4,1100,m=='stone'||m=='ore'?.38:m=='glass'?.3:.18,j(m=='wood'?22:12))}
  if(m!='glass'){const nd=Math.max(1,Math.round((m=='soft'||m=='sand'||m=='snow'?3:2)*k));for(let i=0;i<nd;i++)add(1,a.dust,cx+j(TT0*.7),cy+j(TT0*.4),j(30),-12-R()*20,.55+R()*.35,(m=='snow'?1.3:1)*(.8+R()*.5),0,0,0)}
  if(m=='sand'||m=='soft'){const ng=Math.round((m=='sand'?8:4)*k);for(let i=0;i<ng;i++)add(3,a.grain,cx+j(TT0*.7),cy+j(TT0*.5),j(110),-40-R()*120,.6+R()*.4,.6+R()*.5,900,0,0)}
  if(a.glint){const ng=Math.round((m=='ore'?3:2)*k);for(let i=0;i<ng;i++)add(2,a.glint,cx+j(TT0*.8),cy+j(TT0*.8),j(30),-20-R()*30,.5+R()*.3,.6+R()*.5,0,0,j(3))}}
 // ---- physics: gravity, one or two bounces on solid tiles, then settle and fade
 const solid=(x,y)=>{try{return solidAt(Math.floor(x/T),Math.floor(y/T))}catch(_){return false}};
 function tick(dt){for(let i=n-1;i>=0;i--){TT[i]+=dt;if(TT[i]>=LF[i]){kill(i);continue}const k=KD[i];
   if(k==1){X[i]+=VX[i]*dt;Y[i]+=VY[i]*dt;VX[i]*=1-2*dt;continue}
   if(k==2){Y[i]+=VY[i]*dt;RO[i]+=VR[i]*dt;continue}
   if(k==4){VY[i]+=(40-VY[i])*1.6*dt;VX[i]+=(Math.sin(TT[i]*5+i)*80-VX[i])*1.5*dt;RO[i]+=VR[i]*dt}
   else VY[i]+=GV[i]*dt;
   const nx=X[i]+VX[i]*dt,ny=Y[i]+VY[i]*dt;
   if(VY[i]>0&&k!=4&&solid(nx,ny+2)){if(BC[i]<2&&BN[i]>0&&VY[i]>90){VY[i]*=-BN[i];VX[i]*=.6;VR[i]*=.5;BC[i]++}else{VY[i]=0;VX[i]*=1-6*dt;VR[i]*=1-6*dt;if(TT[i]<LF[i]-.35)TT[i]=LF[i]-.35}}else Y[i]=ny;
   if(solid(nx,Y[i]))VX[i]*=-.4;else X[i]=nx;RO[i]+=VR[i]*dt}}
 // ---- draw (world space): one drawImage per particle, rotation by setTransform from the frame's base matrix
 function draw(g,ox,oy){if(!n)return;g.save();const B=g.getTransform();
  for(let i=0;i<n;i++){const k=KD[i],im=IM[i];if(!im)continue;const u=TT[i]/LF[i],x=X[i]-ox,y=Y[i]-oy;
   if(k==1){g.globalAlpha=.55*(1-u);const s=im.width*SZ[i]*(.7+u*1.2);g.setTransform(B);g.drawImage(im,x-s/2,y-s/2,s,s);continue}
   g.globalAlpha=k==2?Math.sin(u*Math.PI):u>.7?(1-u)/.3:1;const s=SZ[i]*(k==2?1+.3*Math.sin(TT[i]*20):1),c=Math.cos(RO[i])*s,sn=Math.sin(RO[i])*s;
   g.setTransform(B.a*c+B.c*sn,B.b*c+B.d*sn,-B.a*sn+B.c*c,-B.b*sn+B.d*c,B.a*x+B.c*y+B.e,B.b*x+B.d*y+B.f);g.drawImage(im,-im.width/2,-im.height/2)}
  g.restore()}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('DEB12',e)}}};
  BOSS6.drawProj=function(g,cx,cy){_d.call(this,g,cx,cy);try{draw(g,cx,cy)}catch(e){if(!draw.e){draw.e=1;console.error('DEB12 draw',e)}}}}
 return{spawn,tick,draw,art,mat,get count(){return n},get cap(){return N},clear(){for(let i=0;i<n;i++)IM[i]=null;n=0}}})();

const BFX12=(()=>{
 const R=Math.random;let bus=null,nb=null;const log=[];
 const vol=()=>typeof OPT=='undefined'||OPT.sv==null?1:+OPT.sv;
 const ok=()=>{try{ac()}catch(_){}return typeof AC!='undefined'&&!!AC&&AC.state!='closed'&&vol()>0};
 function out(){if(bus&&bus.context===AC)return bus;bus=AC.createGain();bus.gain.value=.9;const sh=AC.createBiquadFilter();sh.type='highshelf';sh.frequency.value=3500;sh.gain.value=-7;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;lp.Q.value=.5;
  const cp=AC.createDynamicsCompressor();cp.threshold.value=-22;cp.knee.value=20;cp.ratio.value=3;cp.attack.value=.006;cp.release.value=.25;bus.connect(sh);sh.connect(lp);lp.connect(cp);cp.connect(AC.destination);return bus}
 const buf=()=>{if(nb&&nb.sampleRate==AC.sampleRate)return nb;const b=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;return nb=b};
 let PAN=null;
 // voices go through a stereo panner set per break (where the block is relative to you)
 function dest(){const p=AC.createStereoPanner?AC.createStereoPanner():null;if(p){p.pan.value=PAN||0;p.connect(out());return p}return out()}
 function os(ty,f0,f1,d,v,dl,at,dst){const t=AC.currentTime+(dl||0)+.005,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);if(f1!=f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d*.9);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+(at||.012));g.gain.exponentialRampToValueAtTime(.0004,t+d);o.connect(g);g.connect(dst);o.start(t);o.stop(t+d+.05)}
 function nz(d,ty,f0,f1,q,v,dl,dst){const t=AC.currentTime+(dl||0)+.005,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=buf();f.type=ty;f.Q.value=q||1;f.frequency.setValueAtTime(f0,t);if(f1!=f0)f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+Math.min(.015,d*.3));g.gain.exponentialRampToValueAtTime(.0004,t+d);s.connect(f);f.connect(g);g.connect(dst);s.start(t,R()*.7,d+.05);s.stop(t+d+.06)}
 // a soft tremolo pad (the "magical pulse"): triangle through a lowpass, gain pulsing a few times
 function pulse(f,d,v,rate,dl,dst){const t=AC.currentTime+(dl||0)+.005,o=AC.createOscillator(),lp=AC.createBiquadFilter(),g=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain();o.type='triangle';o.frequency.value=f;lp.type='lowpass';lp.frequency.setValueAtTime(600,t);lp.frequency.linearRampToValueAtTime(1400,t+d*.4);lp.frequency.linearRampToValueAtTime(700,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+.08);g.gain.exponentialRampToValueAtTime(.0004,t+d);lfo.frequency.value=rate;lg.gain.value=v*vol()*.45;lfo.connect(lg);lg.connect(g.gain);o.connect(lp);lp.connect(g);g.connect(dst);o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05)}
 const bell=(f,d,v,dl,dst)=>{os('sine',f,f,d,v,dl,.015,dst);os('sine',f*2,f*2,d*.5,v*.25,dl,.015,dst);os('sine',f*3.01,f*3,d*.25,v*.08,dl,.015,dst)};
 const J=()=>1+(R()-.5)*.06; // small pitch variation so repeats never sound identical
 // the mapping: break effect id -> its sound layer (quiet, under the material sound)
 const MAP={
  souls(d){const j=J();nz(.5,'bandpass',500*j,1100*j,2,.05,0,d);os('sine',392*j,523*j,.6,.025,.02,.08,d)},
  sparkle(d){const j=J();bell(1568*j,.35,.03,0,d);bell(2093*j,.3,.022,.07,d)},
  petals(d){const j=J();nz(.6,'bandpass',900*j,1400*j,1.5,.04,0,d);bell(1175*j,.4,.018,.05,d)},
  bubble(d){for(let i=0;i<3;i++){const f=(500+R()*400)*J();os('sine',f,f*1.9,.07,.05,i*.07+R()*.03,.004,d)}},
  heart(d){const j=J();bell(523.25*j,1.1,.05,0,d);bell(659.25*j,1,.035,.06,d);bell(783.99*j,1,.03,.12,d);pulse(261.6*j,.9,.03,5,.02,d);os('sine',130.8*j,130.8*j,.5,.035,0,.03,d)},
  blossom(d){const j=J();bell(880*j,.7,.03,0,d);bell(1318.5*j,.6,.022,.1,d);nz(.5,'bandpass',1000,1600,1.2,.025,0,d)},
  snow(d){for(let i=0;i<4;i++)bell((2093+R()*700)*J(),.4,.016,i*.06,d)},
  firefly(d){const j=J();os('sine',880*j,1046*j,.5,.02,0,.05,d);os('sine',1318*j,1568*j,.45,.014,.12,.05,d)},
  butterfly(d){const j=J();nz(.25,'bandpass',1800,1200,2,.03,0,d);nz(.25,'bandpass',1800,1200,2,.025,.12,d);bell(1046*j,.4,.016,.05,d)},
  coin(d){const j=J();bell(1975*j,.45,.04,0,d);bell(2637*j,.5,.035,.08,d)},
  galaxy(d){const j=J();pulse(220*j,1.2,.03,3,0,d);bell(1318*j,.9,.02,.1,d);bell(1760*j,.9,.016,.25,d)},
  royal(d){const j=J();bell(587*j,.8,.035,0,d);bell(880*j,.8,.03,.1,d);bell(1174*j,.8,.022,.2,d)},
  phantom(d){const j=J();nz(.7,'lowpass',900,200,.8,.08,0,d);os('sine',98*j,65*j,.8,.05,0,.06,d);pulse(146.8*j,.8,.02,6,.05,d)},
  confetti(d){const j=J();nz(.08,'highpass',2500,2500,.7,.05,0,d);for(let i=0;i<3;i++)bell((1318+i*330)*j,.25,.018,.05+i*.05,d)},
  leaf(d){nz(.7,'bandpass',700,1300,1.2,.05,0,d);nz(.5,'bandpass',1100,800,1.2,.03,.2,d)},
  notes(d){const j=J(),s=[523.25,659.25,783.99,1046.5];s.forEach((f,i)=>bell(f*j,.5,.03,i*.08,d))},
  candy(d){const j=J();os('sine',700*j,1200*j,.09,.045,0,.004,d);bell(1568*j,.35,.02,.06,d)},
  paws(d){for(let i=0;i<3;i++){const f=(600+i*80)*J();os('sine',f,f*1.3,.06,.035,i*.11,.006,d)}},
  ember(d){for(let i=0;i<5;i++)nz(.03,'bandpass',2000+R()*1500,1500,3,.04,i*.05+R()*.04,d);os('sine',110,90,.5,.03,0,.05,d)},
  crystal(d){const j=J();bell(1760*j,.8,.035,0,d);bell(2637*j,.7,.025,.04,d);bell(3520*j,.6,.012,.08,d)},
  rainbow(d){const j=J(),s=[523.25,587.33,659.25,783.99,880,1046.5];s.forEach((f,i)=>bell(f*j,.6,.022,i*.05,d))}};
 let last=0;
 function play(kind,tx){if(!MAP[kind]||!ok())return false;const now=performance.now();if(now-last<70)return false;last=now;
  try{const sx=((tx+.5)*T-P.x)/Math.max(200,innerWidth/(typeof ZM=='number'?ZM:1)/2);PAN=Math.max(-.6,Math.min(.6,sx*.6))}catch(_){PAN=0}
  try{MAP[kind](dest())}catch(e){return false}log.push(kind);if(log.length>20)log.shift();return true}
 return{play,MAP,log}})();

// the outermost breakAt hook: tile before vs after
{const _ba=breakAt;breakAt=function(x,y){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0;const r=_ba.apply(this,arguments);
  try{if(b&&inb&&!tiles[k]){DEB12.spawn(x,y,b);try{BRK7.spawn(x,y,b)}catch(_){}try{BFX12.play(BRK7.skin,x)}catch(_){}}}catch(e){console.error('DEB12 hook',e)}return r}}
