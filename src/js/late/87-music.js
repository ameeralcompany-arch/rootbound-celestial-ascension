// ===== MUS7 v2: calm anime-lofi generated music. Every weather / place has its own set of songs; songs never repeat back-to-back =====
// All synthesised with WebAudio (no audio files). Instruments: Rhodes-style keys, soft bass, music-box melody, brushed drums, vinyl crackle, soft pad.
// A song = chord progression + scale + tempo + feel. Melodies are generated from a short motif that mutates every phrase, so a long listen never loops.
// startBGM() is replaced so the existing music volume / mute code keeps working: bgm.m is the music master gain.
const MUS7=(()=>{
 const Q={maj7:[0,4,7,11],maj9:[0,4,7,11,14],m7:[0,3,7,10],m9:[0,3,7,10,14],d9:[0,4,7,10,14],sus:[0,5,7,10,14],add9:[0,4,7,14],m6:[0,3,7,9,14],m11:[0,3,7,10,17]};
 const SC={maj:[0,2,4,7,9],min:[0,3,5,7,10],hira:[0,2,3,7,8],lyd:[0,2,4,6,7,9,11],dor:[0,2,3,5,7,9,10]};
 // chord = [semitones from key root, quality]
 const C=(a)=>a.map(x=>[x[0],Q[x[1]]]);
 const MOODS={
  plaza:{n:'Sunny day',songs:[
   {id:'morning-walk',bpm:76,key:0,sc:'maj',feel:'lofi',prog:C([[0,'maj9'],[9,'m9'],[5,'maj7'],[7,'sus']]),lead:'box'},
   {id:'window-seat',bpm:72,key:5,sc:'maj',feel:'lofi',prog:C([[0,'maj7'],[2,'m9'],[4,'m7'],[9,'m9'],[5,'maj9'],[7,'d9'],[0,'maj9'],[0,'add9']]),lead:'keys'},
   {id:'paper-planes',bpm:80,key:7,sc:'maj',feel:'brush',prog:C([[5,'maj9'],[0,'add9'],[9,'m7'],[2,'m9']]),lead:'box'}]},
  cloud:{n:'Cloudy',songs:[
   {id:'grey-ribbon',bpm:66,key:9,sc:'min',feel:'brush',prog:C([[0,'m9'],[5,'maj9'],[10,'maj7'],[7,'m7']]),lead:'keys'},
   {id:'slow-tea',bpm:64,key:2,sc:'dor',feel:'lofi',prog:C([[0,'m9'],[7,'m7'],[3,'maj9'],[5,'d9']]),lead:'box'}]},
  night:{n:'Night',songs:[
   {id:'moonlit-tea',bpm:62,key:3,sc:'min',feel:'soft',prog:C([[0,'m9'],[8,'maj9'],[3,'maj7'],[10,'d9']]),lead:'box'},
   {id:'lantern-road',bpm:68,key:10,sc:'min',feel:'lofi',prog:C([[0,'m7'],[5,'m9'],[8,'maj7'],[7,'sus']]),lead:'keys'},
   {id:'sleepy-stars',bpm:58,key:5,sc:'maj',feel:'soft',prog:C([[0,'maj9'],[4,'m7'],[9,'m9'],[2,'m7'],[7,'sus']]),lead:'box'}]},
  rain:{n:'Rain',songs:[
   {id:'rainy-window',bpm:60,key:4,sc:'min',feel:'brush',prog:C([[0,'m9'],[3,'maj7'],[8,'maj9'],[10,'d9']]),lead:'keys'},
   {id:'umbrella-blue',bpm:64,key:9,sc:'dor',feel:'lofi',prog:C([[0,'m9'],[5,'d9'],[10,'maj7'],[3,'maj7']]),lead:'box'},
   {id:'puddle-lights',bpm:58,key:0,sc:'min',feel:'soft',prog:C([[9,'m9'],[2,'m7'],[7,'d9'],[0,'maj7']]),lead:'keys'}]},
  storm:{n:'Storm',songs:[
   {id:'distant-thunder',bpm:54,key:7,sc:'min',feel:'soft',prog:C([[0,'m11'],[8,'maj7'],[5,'m7'],[10,'d9']]),lead:'keys',dark:1},
   {id:'candle-room',bpm:56,key:2,sc:'min',feel:'soft',prog:C([[0,'m9'],[10,'maj9'],[8,'maj7'],[7,'sus']]),lead:'box',dark:1}]},
  snow:{n:'Snow',songs:[
   {id:'first-snow',bpm:60,key:0,sc:'maj',feel:'soft',prog:C([[0,'maj9'],[7,'add9'],[9,'m9'],[5,'maj7']]),lead:'bell'},
   {id:'warm-scarf',bpm:66,key:7,sc:'maj',feel:'brush',prog:C([[0,'maj7'],[4,'m7'],[5,'maj9'],[7,'sus']]),lead:'bell'}]},
  blossom:{n:'Blossom',songs:[
   {id:'sakura-drift',bpm:64,key:2,sc:'hira',feel:'soft',prog:C([[0,'m9'],[8,'maj7'],[3,'maj9'],[10,'sus']]),lead:'koto'},
   {id:'spring-letter',bpm:70,key:9,sc:'hira',feel:'brush',prog:C([[0,'m7'],[5,'maj9'],[10,'maj7'],[3,'add9']]),lead:'koto'}]},
  space:{n:'Space',songs:[
   {id:'orbit-lullaby',bpm:52,key:4,sc:'lyd',feel:'ambient',prog:C([[0,'maj9'],[7,'add9'],[2,'m9'],[9,'sus']]),lead:'bell'},
   {id:'quiet-satellite',bpm:50,key:9,sc:'dor',feel:'ambient',prog:C([[0,'m11'],[5,'maj9'],[10,'maj7'],[3,'add9']]),lead:'bell'}]},
  galaxy:{n:'Galaxy',songs:[
   {id:'starlight-ferry',bpm:62,key:5,sc:'lyd',feel:'ambient',prog:C([[0,'maj9'],[4,'m7'],[9,'m9'],[7,'d9']]),lead:'arp'},
   {id:'comet-tail',bpm:66,key:10,sc:'maj',feel:'soft',prog:C([[0,'maj7'],[2,'m9'],[7,'sus'],[5,'maj9']]),lead:'arp'}]},
  combat:{n:'Gentle fight',songs:[
   {id:'brave-steps',bpm:88,key:9,sc:'min',feel:'beat',prog:C([[0,'m7'],[8,'maj7'],[3,'maj7'],[10,'d9']]),lead:'keys'},
   {id:'small-courage',bpm:92,key:2,sc:'dor',feel:'beat',prog:C([[0,'m9'],[5,'d9'],[10,'maj7'],[7,'m7']]),lead:'box'}]}};
 const BARS=24;
 let mood='plaza',want='plaza',ctx=null,master=null,mg=null,lp=null,wet=null,nb=null,timer=0,nextT=0,step=0,on=false,holdUntil=0,last='',song=null,songBar=0,played=[],gap=0,fading=0,detT=0,crackT=0;
 const R=Math.random,pick=a=>a[(R()*a.length)|0];
 const hz=(root,n)=>261.63*2**((root+n)/12)/2;
 function mkReverb(){const len=ctx.sampleRate*2.6,b=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4)}const cv=ctx.createConvolver();cv.buffer=b;return cv}
 const env=(g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+d)};
 function voice(fr,t,d,ty,v,a,dest,det){const o=ctx.createOscillator(),g=ctx.createGain();o.type=ty;o.frequency.value=fr;if(det)o.detune.value=det;env(g,t,a||.03,d,v);o.connect(g);g.connect(dest||lp);o.start(t);o.stop(t+d+.05)}
 // ---- instruments
 const rhodes=(fr,t,v,d)=>{d=d||2.2;voice(fr,t,d,'sine',v,.012,0,(R()-.5)*8);voice(fr*2,t,d*.35,'sine',v*.28,.004);voice(fr*7.1,t,.12,'sine',v*.07,.002);voice(fr*1.003,t,d*.8,'triangle',v*.2,.02)};
 const box=(fr,t,v)=>{voice(fr*2,t,1.6,'sine',v,.004,wet);voice(fr*4,t,.35,'sine',v*.25,.002);voice(fr*2,t,.9,'triangle',v*.3,.004)};
 const koto=(fr,t,v)=>{voice(fr,t,1.4,'triangle',v,.003,wet);voice(fr*2,t,.5,'sine',v*.35,.002);voice(fr*3.01,t,.18,'sine',v*.12,.002)};
 const bellv=(fr,t,v)=>{voice(fr*2,t,3.4,'sine',v,.01,wet);voice(fr*2*2.76,t,1.3,'sine',v*.22,.01,wet);voice(fr*2*5.4,t,.5,'sine',v*.06,.01,wet)};
 const pluck=(fr,t,v)=>{voice(fr,t,1.1,'triangle',v,.006);voice(fr*2,t,.4,'sine',v*.35,.004)};
 const padv=(fr,t,d,v)=>{voice(fr,t,d,'sine',v,Math.min(1.4,d*.3),0,-4);voice(fr*1.003,t,d,'triangle',v*.45,Math.min(1.6,d*.35),0,5)};
 const bass=(fr,t,d,v)=>{voice(fr,t,d,'sine',v,.02);voice(fr*2,t,d*.5,'triangle',v*.12,.02)};
 function kick(t,v){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(100,t);o.frequency.exponentialRampToValueAtTime(40,t+.16);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);o.connect(g);g.connect(mg);o.start(t);o.stop(t+.3)}
 function nz(t,d,f1,type,v,dest){const b=ctx.createBufferSource();b.buffer=nb;b.playbackRate.value=.8+R()*.4;const h=ctx.createBiquadFilter();h.type=type;h.frequency.value=f1;const g=ctx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);b.connect(h);h.connect(g);g.connect(dest||mg);b.start(t,R()*.5,d+.05)}
 const hat=(t,v)=>nz(t,.045,8000,'highpass',v);
 const snare=(t,v)=>{nz(t,.16,1800,'bandpass',v);voice(180,t,.1,'sine',v*.5,.002,mg)};
 const brush=(t,v)=>nz(t,.22,3500,'bandpass',v);
 // ---- song machinery
 function newSong(m){const list=MOODS[m].songs;let c=list.filter(s=>!played.slice(-Math.min(2,list.length-1)).includes(s.id));if(!c.length)c=list;const d=pick(c);played.push(d.id);if(played.length>8)played.shift();
  const sc=SC[d.sc],mt=()=>{const n=[];for(let i=0;i<8;i++)n.push(R()<.55?(R()*sc.length)|0:-1);n[0]=(R()*sc.length)|0;return n};
  song={d,sc,A:mt(),B:mt(),root:d.key,id:d.id,ph:0};songBar=0;step=0}
 function mutate(m,sc){const o=m.slice();for(let i=0;i<o.length;i++){const r=R();if(o[i]>=0&&r<.18)o[i]=Math.max(0,Math.min(sc.length-1,o[i]+(R()<.5?-1:1)));else if(o[i]>=0&&r<.28)o[i]=-1;else if(o[i]<0&&r<.14)o[i]=(R()*sc.length)|0}return o}
 function tick(){if(!on||!ctx)return;if(ctx.currentTime<gap||fading)return;if(!song)newSong(mood);const d=song.d,e8=60/d.bpm/2;
  if(nextT<ctx.currentTime)nextT=ctx.currentTime+.05;
  while(nextT<ctx.currentTime+.45){const s=step%8,bar=songBar,[rt,q]=d.prog[bar%d.prog.length],t=nextT+(s%2?(d.feel=='ambient'?0:.1)*e8:0),hv=.85+R()*.3;
   const sect=bar>>3&3,mel=(sect==2?song.B:song.A);
   // pad / chord
   if(s==0){const dur=e8*8+.6;if(d.feel!='beat')q.slice(0,4).forEach((n,i)=>padv(hz(song.root+rt,n+12),t+i*.02,dur,.018));
    const kv=d.feel=='ambient'?.016:.05;q.forEach((n,i)=>rhodes(hz(song.root+rt,n+12),t+i*.028+R()*.01,kv*(.8+R()*.4),d.feel=='ambient'?4:2.2));bass(hz(song.root+rt,-12),t,e8*3.5,.11)}
   if((s==3||s==6)&&d.feel!='ambient'&&d.feel!='soft'&&R()<.55){const k=(s==3?q.slice(1,4):q.slice(0,3));k.forEach((n,i)=>rhodes(hz(song.root+rt,n+12),t+i*.02,.028,1.2))}
   if(s==4&&(d.feel=='lofi'||d.feel=='beat')&&R()<.7)bass(hz(song.root+rt,-12+(R()<.5?7:0)),t,e8*2,.08);
   if(s==7&&d.feel!='ambient'&&R()<.25)bass(hz(song.root+rt,-12+q[1]),t,e8,.05);
   // melody (rests in the first bar of each section so the chords breathe)
   if(bar%8!=0||s>2){const ni=mel[s],m2=(bar&1)?mutate(mel,song.sc):mel;const idx=(bar&1)?m2[s]:ni;
    if(idx>=0&&R()<(d.feel=='ambient'?.5:.9)){const oct=(sect==3?12:0)+(R()<.12?12:0),f=hz(song.root,song.sc[idx]+12+oct),v=(d.lead=='bell'?.03:d.lead=='arp'?.026:.032)*hv;
     d.lead=='box'?box(f,t,v):d.lead=='koto'?koto(f,t,v*1.1):d.lead=='bell'?bellv(f,t,v):d.lead=='arp'?pluck(f,t,v):rhodes(f,t,v*1.15,1.4)}}
   if(d.lead=='arp'&&(s%2==0)){const n=q[(s/2+bar)%q.length|0];pluck(hz(song.root+rt,n+24),t,.016*hv)}
   // drums
   if(d.feel=='lofi'||d.feel=='beat'){if(s==0||(s==3&&R()<.4)||s==5||(d.feel=='beat'&&s==4&&R()<.2))kick(t,d.feel=='beat'?.12:.085);if(s==2||s==6)snare(t,d.feel=='beat'?.045:.028);hat(t,(s%2?.016:.026)*hv);if(R()<.07)hat(t+e8*.5,.012)}
   else if(d.feel=='brush'){if(s==0)kick(t,.05);if(s==4)brush(t,.03);if(s%2==0)hat(t,.012*hv)}
   else if(d.feel=='soft'){if(s==0&&R()<.4)kick(t,.04);if(s==4&&R()<.5)brush(t,.016)}
   nextT+=e8;step++;if(step%8==0){songBar++;if(songBar>=BARS){endSong();return}}}}
 function endSong(){fading=1;const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(mg.gain.value,t);mg.gain.linearRampToValueAtTime(0,t+3.2);setTimeout(()=>{song=null;fading=0;gap=ctx.currentTime+1.5+R()*3;nextT=gap;fadeIn()},3300)}
 function fadeIn(){const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(0,t);mg.gain.linearRampToValueAtTime(1,t+2.2)}
 function crackle(){if(!on||!ctx)return;const t=ctx.currentTime;if(R()<.7)nz(t,.012+R()*.02,2500+R()*4000,'bandpass',.004+R()*.006);if(R()<.04)nz(t,.05,900,'bandpass',.008)}
 function start(){ac();if(on||!AC)return;ctx=AC;master=ctx.createGain();master.gain.value=mute?0:(OPT.mv==null?.5:OPT.mv);mg=ctx.createGain();mg.gain.value=1;lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;lp.Q.value=.4;
  wet=ctx.createGain();wet.gain.value=.34;const rv=mkReverb();lp.connect(mg);lp.connect(rv);rv.connect(wet);wet.connect(mg);mg.connect(master);master.connect(ctx.destination);
  // gentle tape wobble on the filter keeps the sound alive and slightly warm
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.13;lg.gain.value=260;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  bgm={m:master};on=true;nextT=ctx.currentTime+.1;timer=setInterval(tick,120);crackT=setInterval(crackle,260);detT=setInterval(detect,1000);detect()}
 function switchTo(m2){if(m2==mood&&song)return;if(!ctx)return;fading=1;const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(mg.gain.value,t);mg.gain.linearRampToValueAtTime(0,t+1.6);setTimeout(()=>{mood=m2;song=null;fading=0;gap=0;nextT=ctx.currentTime+.2;fadeIn()},1700)}
 function detect(){try{if(!entered)return;let m='plaza';const e=ENV7.target;
  if(e=='blossom'||e=='space'||e=='galaxy')m=e;
  else if(wxN=='storm')m='storm';else if(wxN=='rain')m='rain';else if(wxN=='snow')m='snow';
  else if(night>.6)m='night';else if(wxN=='cloud')m='cloud';
  let fight=false;try{if(BOSS6.active())fight=true}catch(_){}for(const k of mobs){if(Math.abs(k.x-P.x)<420&&Math.abs(k.y-P.y)<300){fight=true;break}}
  const now=performance.now();if(fight)holdUntil=now+7000;if(now<holdUntil)m='combat';want=m;if(m!=last){last=m;switchTo(m)}}catch(_){}}
 return{start,get mood(){return mood},get want(){return want},get on(){return on},get song(){return song&&song.id},get played(){return played.slice()},MOODS,detect,endSong,force(m){want=m;last=m;switchTo(m)},newSong}})();
startBGM=function(){MUS7.start()};
// ambience volume slider (0-100%), saved with the other options
{const _au=ambUpdate;ambUpdate=function(){_au();try{if(ambG)ambG.gain.value*=OPT.av==null?1:OPT.av}catch(_){}};
 const addSlider=()=>{const os=document.getElementById('os');if(!os||document.getElementById('oav'))return;const lb=os.parentElement,l=document.createElement('label');l.innerHTML='Ambience <input type="range" id="oav" min="0" max="100">';lb.after(l);const r=l.querySelector('input');r.value=(OPT.av==null?1:OPT.av)*100;r.oninput=e=>{OPT.av=e.target.value/100;try{saveP()}catch(_){}}};
 addSlider();addEventListener('load',addSlider);
 const addVoice=()=>{const os=document.getElementById('os');if(!os||document.getElementById('ovo'))return;const lb=os.parentElement,l=document.createElement('label');l.innerHTML='Voice <input type="range" id="ovo" min="0" max="100"> <span style="margin-left:8px">Subtitles <input type="checkbox" id="osub"></span>';lb.after(l);const r=l.querySelector('#ovo'),c=l.querySelector('#osub');r.value=(OPT.vo==null?1:OPT.vo)*100;c.checked=!!OPT.sub;r.oninput=e=>{OPT.vo=e.target.value/100;try{saveP()}catch(_){}};c.onchange=e=>{OPT.sub=e.target.checked?1:0;try{saveP()}catch(_){}}};
 addVoice();addEventListener('load',addVoice)}
