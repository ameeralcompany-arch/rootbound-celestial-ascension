// ===== DG music: an original score synthesised live, one identity per dungeon (scale, tempo, chords, instruments), in layers that fade into each other: exploration, combat, elite, boss entrance, boss, final phase, victory.
// All on the game's music volume and mute. While it plays the normal background songs hold (MUS_HOLD). A bar is scheduled a little ahead; voices are short-lived oscillators, at most a few dozen alive. =====
try{(()=>{
 const DG=window.DG,R=Math.random;
 const SCALE={aeolian:[0,2,3,5,7,8,10],phryg:[0,1,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],harm:[0,2,3,5,7,8,11],hira:[0,2,3,7,8],locrian:[0,1,3,5,6,8,10],lyd:[0,2,4,6,7,9,11]};
 // root (midi), scale, bpm, chords (scale degrees), pad, lead, perc. Each dungeon sounds like itself
 const ID={
  ruins:{root:45,sc:'aeolian',bpm:62,prog:[0,5,3,4],pad:'choir',lead:'bell',perc:'soft',desc:'Mysterious ambience, ancient bells, soft choir'},
  crimson:{root:38,sc:'phryg',bpm:92,prog:[0,1,0,5],pad:'strings',lead:'brass',perc:'taiko',desc:'Dark percussion, low strings, orchestral tension'},
  frozen:{root:50,sc:'aeolian',bpm:58,prog:[0,3,5,4],pad:'glass',lead:'piano',perc:'none',desc:'Emotional piano, icy ambience, distant choir'},
  hollow:{root:47,sc:'harm',bpm:66,prog:[0,5,1,4],pad:'choir',lead:'strings',perc:'soft',desc:'Choir, haunting strings, magical textures'},
  dragon:{root:40,sc:'harm',bpm:96,prog:[0,5,3,4],pad:'strings',lead:'brass',perc:'taiko',desc:'Epic orchestra and powerful percussion'},
  abyss:{root:36,sc:'locrian',bpm:54,prog:[0,1,5,3],pad:'void',lead:'bell',perc:'none',desc:'Deep ambience, cosmic textures, slow emotion'},
  star:{root:41,sc:'lyd',bpm:72,prog:[0,4,5,1],pad:'void',lead:'brass',perc:'taiko',desc:'Golden brass over dying-star drones'},
  night:{root:39,sc:'hira',bpm:60,prog:[0,3,1,4],pad:'choir',lead:'piano',perc:'soft',desc:'Black piano and whispers'},
  king:{root:43,sc:'harm',bpm:76,prog:[0,5,3,6],pad:'strings',lead:'brass',perc:'taiko',desc:'A royal march gone hollow'},
  eater:{root:33,sc:'phryg',bpm:84,prog:[0,1,6,5],pad:'void',lead:'brass',perc:'taiko',desc:'Everything at once, then silence'}};
 const hz=m=>440*Math.pow(2,(m-69)/12);
 let C=null,out=null,lay={},d=null,st='off',timer=0,next=0,step=0,noiseB=null;
 const LAYERS=['pad','melody','ost','perc','brass','choir','drone'];
 const MIX={explore:{pad:.7,melody:.55,drone:.5},combat:{pad:.6,melody:.35,ost:.6,perc:.75,drone:.4},elite:{pad:.6,ost:.8,perc:.9,brass:.55,drone:.5},bossintro:{drone:1,choir:.5,perc:.25},boss:{pad:.55,ost:.85,perc:1,brass:.7,choir:.3,drone:.4},final:{pad:.5,ost:1,perc:1,brass:.95,choir:.75,drone:.55},bossdeath:{drone:.5,choir:.6},victory:{melody:.9,pad:.8,choir:.7},cine:{drone:.75,choir:.35},off:{}};
 function ensure(){if(C)return true;try{try{ac()}catch(_){}C=AC;if(!C)return false;try{startBGM()}catch(_){}out=C.createGain();out.gain.value=.9;const dest=(bgm&&bgm.m)||C.destination;const cmp=C.createDynamicsCompressor();cmp.threshold.value=-20;cmp.ratio.value=4;out.connect(cmp);
    // a touch of space: a short delay feedback standing in for a hall
    const dl=C.createDelay(1);dl.delayTime.value=.27;const fb=C.createGain();fb.gain.value=.34;const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;const wet=C.createGain();wet.gain.value=.3;out.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(wet);wet.connect(cmp);cmp.connect(dest);
    for(const n of LAYERS){const g=C.createGain();g.gain.value=0;g.connect(out);lay[n]=g}noiseB=C.createBuffer(1,C.sampleRate,C.sampleRate);const a=noiseB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=R()*2-1;return true}catch(e){console.error('DG music',e);C=null;return false}}
 const env=(g,t,a,h,r,v)=>{g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+a+h);g.gain.exponentialRampToValueAtTime(.0001,t+a+h+r)};
 function osc(dst,type,f,t,dur,v,o={}){const q=C.createOscillator(),g=C.createGain();q.type=type;q.frequency.setValueAtTime(f,t);if(o.to)q.frequency.exponentialRampToValueAtTime(o.to,t+dur);if(o.det)q.detune.value=o.det;let last=q;if(o.lp){const fl=C.createBiquadFilter();fl.type=o.ft||'lowpass';fl.frequency.value=o.lp;if(o.q)fl.Q.value=o.q;q.connect(fl);last=fl}last.connect(g);g.connect(dst);env(g,t,o.a==null?.01:o.a,o.h||0,o.r==null?dur:o.r,v);if(o.vib){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=o.vib;lg.gain.value=o.vd||5;l.connect(lg);lg.connect(q.frequency);l.start(t);l.stop(t+dur+1)}q.start(t);q.stop(t+(o.a||.01)+(o.h||0)+(o.r==null?dur:o.r)+.05)}
 function noiseHit(dst,t,dur,v,f,type){const s=C.createBufferSource(),fl=C.createBiquadFilter(),g=C.createGain();s.buffer=noiseB;s.loop=true;fl.type=type||'bandpass';fl.frequency.value=f;s.connect(fl);fl.connect(g);g.connect(dst);env(g,t,.005,0,dur,v);s.start(t);s.stop(t+dur+.05)}
 const V={
  choir(dst,m,t,dur,v){for(const det of[-7,5]){osc(dst,'sawtooth',hz(m),t,dur,v*.34,{det,lp:1000,ft:'bandpass',q:3,a:dur*.3,h:dur*.3,r:dur*.5,vib:4.8,vd:3})}osc(dst,'sine',hz(m),t,dur,v*.3,{a:dur*.3,h:dur*.3,r:dur*.5})},
  strings(dst,m,t,dur,v){for(const det of[-9,0,8])osc(dst,'sawtooth',hz(m),t,dur,v*.2,{det,lp:1500,a:dur*.2,h:dur*.5,r:dur*.4,vib:5.2,vd:2.5})},
  glass(dst,m,t,dur,v){osc(dst,'sine',hz(m+12),t,dur,v*.32,{a:dur*.3,h:dur*.2,r:dur*.6});osc(dst,'triangle',hz(m+24),t,dur,v*.12,{a:dur*.4,r:dur*.6,vib:.6,vd:6})},
  void(dst,m,t,dur,v){osc(dst,'sawtooth',hz(m-12),t,dur,v*.32,{lp:360,q:4,a:dur*.4,h:dur*.2,r:dur*.5,det:-5});osc(dst,'sine',hz(m),t,dur,v*.25,{a:dur*.5,r:dur*.5,vib:.3,vd:8})},
  bell(dst,m,t,dur,v){const f=hz(m+12);osc(dst,'sine',f,t,dur,v*.6,{r:Math.max(1.6,dur)});osc(dst,'sine',f*2.76,t,.9,v*.2,{r:.9});osc(dst,'sine',f*5.4,t,.4,v*.08,{r:.4})},
  piano(dst,m,t,dur,v){const f=hz(m+12);osc(dst,'triangle',f,t,dur,v*.6,{r:Math.max(1.4,dur*1.4)});osc(dst,'sine',f*2,t,.7,v*.2,{r:.7});osc(dst,'sine',f/2,t,1,v*.2,{r:1})},
  brass(dst,m,t,dur,v){for(const det of[-6,6])osc(dst,'sawtooth',hz(m),t,dur,v*.32,{det,lp:1100,a:.06,h:dur*.7,r:.25})}};
 function chordOf(deg,c){const s=SCALE[c.sc],f=i=>c.root+s[((deg+i)%s.length+s.length)%s.length]+12*Math.floor((deg+i)/s.length);return[f(0),f(2),f(4)]}
 function bar(t){const c=ID[d.id]||ID.ruins,beat=60/c.bpm,n=(step/4|0),chord=chordOf(c.prog[n%c.prog.length],c),s=SCALE[c.sc];const barDur=beat*4;
  V[c.pad](lay.pad,chord[0]+12,t,barDur*1.05,.34);V[c.pad](lay.pad,chord[1]+12,t,barDur*1.05,.26);V[c.pad](lay.pad,chord[2]+12,t,barDur*1.05,.22);
  osc(lay.drone,'sine',hz(chord[0]-12),t,barDur,.5,{a:.8,h:barDur*.5,r:barDur*.5});osc(lay.drone,'sawtooth',hz(chord[0]-12),t,barDur,.13,{lp:220,a:.8,h:barDur*.5,r:barDur*.5,det:4});
  V.choir(lay.choir,chord[0]+24,t,barDur,.3);if(n%2)V.choir(lay.choir,chord[2]+24,t+beat*2,barDur*.6,.24);
  // a melody that wanders the scale and rests often, so a long stay never settles into a loop
  for(let i=0;i<4;i++){if(R()<.52){const dg=c.prog[n%c.prog.length]+[0,2,4,5,7][(R()*5)|0],m=c.root+24+s[(dg%s.length+s.length)%s.length]+12*Math.floor(dg/s.length);V[c.lead=='strings'?'strings':c.lead](lay.melody,m,t+i*beat+(R()<.3?beat*.5:0),beat*1.6,.3)}}
  // ostinato
  const sub=c.bpm>80?2:3;for(let i=0;i<4*sub;i++){const tt=t+i*beat/sub,m=(i%sub==0?chord[0]:chord[(i%3)])-(i%2?0:12);osc(lay.ost,'sawtooth',hz(m),tt,beat/sub*.9,.22,{lp:900,a:.005,r:beat/sub*.8})}
  // percussion
  if(c.perc=='taiko'){for(let i=0;i<4;i++){osc(lay.perc,'sine',i%2?95:68,t+i*beat,.45,.85,{to:42,r:.42});if(i%2)noiseHit(lay.perc,t+i*beat,.12,.3,1400);if(i==3){osc(lay.perc,'sine',110,t+i*beat+beat*.5,.3,.55,{to:50,r:.28});osc(lay.perc,'sine',110,t+i*beat+beat*.75,.3,.55,{to:50,r:.28})}}}else if(c.perc=='soft'){osc(lay.perc,'sine',64,t,.6,.6,{to:40,r:.6});osc(lay.perc,'sine',64,t+beat*2.5,.5,.45,{to:40,r:.5});for(let i=0;i<8;i++)if(i%2)noiseHit(lay.perc,t+i*beat/2,.05,.08,5200,'highpass')}else{noiseHit(lay.perc,t+beat,.9,.05,3200);noiseHit(lay.perc,t+beat*3,.9,.05,2600)}
  V.brass(lay.brass,chord[0]+12,t,beat*1.5,.42);V.brass(lay.brass,chord[2]+12,t,beat*1.5,.3);V.brass(lay.brass,chord[1]+12,t+beat*2,beat,.36);if(n%2)V.brass(lay.brass,chord[0]+24,t+beat*3,beat*.9,.36);
  return barDur}
 function sched(){if(!C||!d)return;while(next<C.currentTime+.6){const dur=bar(Math.max(next,C.currentTime+.02));next+=dur;step+=4}}
 function setMix(name,sec){const q=MIX[name]||{};const t=C.currentTime;for(const n of LAYERS){const g=lay[n].gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime((q[n]||0)*.7,t+(sec||2))}}
 const M={ID,
  enter(dun){d=dun;window.MUS_HOLD=1;if(!ensure())return;st='explore';step=0;next=C.currentTime+.15;clearInterval(timer);timer=setInterval(sched,200);sched();setMix('explore',3)},
  state(name){if(!C||!d)return;if(st==name)return;st=name;setMix(name,name=='bossintro'||name=='bossdeath'?.9:name=='victory'?1.2:1.8);if(name=='victory')M.stinger('victory')},
  leave(){clearInterval(timer);timer=0;if(C){setMix('off',1.2)}d=null;st='off';setTimeout(()=>{if(!d)window.MUS_HOLD=0},1300);try{MUS7.calm&&MUS7.calm()}catch(_){}},
  // film music: same voices under a film, on the dungeon's own identity
  film(dun){d=dun;window.MUS_HOLD=1;if(!ensure())return;st='cine';step=0;next=C.currentTime+.15;clearInterval(timer);timer=setInterval(sched,200);sched();setMix('cine',2)},
  mix(name,sec){if(C&&MIX[name]){st=name;setMix(name,sec==null?2:sec)}},
  // one-shot sound design for films and bosses
  sfx(k,v=1){if(!ensure())return;const t=C.currentTime,dst=out;switch(k){
    case'wind':{const s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=noiseB;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(380,t);f.frequency.linearRampToValueAtTime(760,t+3);f.frequency.linearRampToValueAtTime(320,t+6);s.connect(f);f.connect(g);g.connect(dst);env(g,t,1.6,2.6,2,.12*v);s.start(t);s.stop(t+6.5);break}
    case'rumble':{osc(dst,'sine',42,t,3.4,.7*v,{to:28,a:.5,h:1.4,r:1.5});noiseHit(dst,t,3,.2*v,120,'lowpass');break}
    case'boom':{osc(dst,'sine',80,t,1.5,.95*v,{to:26,r:1.5});noiseHit(dst,t,.9,.4*v,300,'lowpass');break}
    case'door':{osc(dst,'sawtooth',55,t,4,.22*v,{lp:240,a:.5,h:2.4,r:1,to:38});noiseHit(dst,t,3.6,.1*v,500);break}
    case'bell':{V.bell(dst,62,t,3,.5*v);break}
    case'choir':{V.choir(dst,67,t,3.6,.5*v);V.choir(dst,62,t,3.6,.4*v);V.choir(dst,70,t+.4,3.2,.3*v);break}
    case'roar':{osc(dst,'sawtooth',150,t,1.8,.42*v,{to:60,lp:700,a:.15,h:.7,r:.9,vib:9,vd:14});osc(dst,'square',90,t,1.8,.15*v,{to:40,lp:500,a:.2,h:.6,r:.9,vib:7,vd:10});noiseHit(dst,t,1.7,.26*v,600);break}
    case'thunder':{noiseHit(dst,t,.15,.5*v,2400);noiseHit(dst,t+.08,2.2,.42*v,200,'lowpass');osc(dst,'sine',60,t+.05,1.7,.5*v,{to:30,r:1.7});break}
    case'lava':{for(let i=0;i<6;i++){osc(dst,'sine',90+R()*140,t+i*.4+R()*.2,.25,.12*v,{to:50,r:.25})}noiseHit(dst,t,2.6,.1*v,220,'lowpass');break}
    case'crack':{for(let i=0;i<5;i++)noiseHit(dst,t+i*.18+R()*.1,.07,.3*v,3200+R()*2400,'highpass');break}
    case'glow':{V.glass(dst,74,t,1.4,.4*v);break}
    case'rise':{osc(dst,'sawtooth',70,t,3,.2*v,{to:420,lp:1600,a:.6,r:2.4});noiseHit(dst,t,3,.09*v,2000);break}
    case'eye':{osc(dst,'sine',30,t,3,.9*v,{to:58,a:.4,h:1.6,r:1});V.void(dst,44,t,3.2,.7*v);break}
    case'freeze':{for(let i=0;i<8;i++)osc(dst,'sine',1500+R()*2400,t+i*.09,.3,.08*v,{r:.3});noiseHit(dst,t,1.5,.14*v,5200,'highpass');break}}},
  stinger(k){if(!ensure())return;const t=C.currentTime+.05,c=d?ID[d.id]:ID.ruins,s=SCALE[c.sc],m=c.root+24;if(k=='victory'){const seq=[0,4,7,12],base=m+(s[2]==4?0:3);seq.forEach((iv,i)=>{V.brass(out,base+iv,t+i*.2,.5,.42);V.bell(out,base+iv+12,t+i*.2,1.4,.34)});V.choir(out,base+12,t+.6,2.8,.6);V.choir(out,base+7,t+.6,2.8,.5)}},
  get state_(){return st}};
 DG.music=M;
})()}catch(e){console.error('DG music',e)}
