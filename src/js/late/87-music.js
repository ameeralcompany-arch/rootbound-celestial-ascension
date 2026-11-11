// ===== MUS7 v2: calm anime-lofi generated music. Every weather / place has its own set of songs; songs never repeat back-to-back =====
// All synthesised with WebAudio (no audio files). Instruments: Rhodes-style keys, soft bass, music-box melody, brushed drums, vinyl crackle, soft pad.
// A song = chord progression + scale + tempo + feel. Melodies are generated from a short motif that mutates every phrase, so a long listen never loops.
// startBGM() is replaced so the existing music volume / mute code keeps working: bgm.m is the music master gain.
// v12: the master goes through a treble shelf, a gentle lowpass and a soft compressor (calm, no piercing highs or sharp drum transients).
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
   {id:'small-courage',bpm:92,key:2,sc:'dor',feel:'beat',prog:C([[0,'m9'],[5,'d9'],[10,'maj7'],[7,'m7']]),lead:'box'}]},
  // the realms (Inferno, Galaxy, Abyssal Sea, Crystal Realm: REALM10.mood()): their own songs everywhere in the realm, and their own battle song
  inferno:{n:'Inferno',songs:[
   {id:'ember-march',bpm:98,key:5,sc:'hira',feel:'drive',prog:C([[0,'m9'],[1,'maj7'],[10,'m7'],[7,'sus']]),lead:'koto',dark:1},
   {id:'ash-and-iron',bpm:94,key:2,sc:'min',feel:'drive',prog:C([[0,'m11'],[8,'maj7'],[5,'m9'],[7,'d9']]),lead:'mar',dark:1}]},
  inferno_f:{n:'Inferno battle',songs:[{id:'molten-clash',bpm:112,key:0,sc:'hira',feel:'drive',prog:C([[0,'m7'],[1,'maj7'],[8,'maj7'],[7,'sus']]),lead:'koto'},
   {id:'cinder-storm',bpm:116,key:7,sc:'min',feel:'drive',prog:C([[0,'m9'],[10,'d9'],[8,'maj7'],[7,'sus']]),lead:'mar'}]},
  realm_gal:{n:'Galaxy',songs:[
   {id:'nebula-drift',bpm:58,key:2,sc:'lyd',feel:'ambient',prog:C([[0,'maj9'],[2,'add9'],[7,'maj7'],[9,'m9']]),lead:'arp'},
   {id:'zero-gravity',bpm:70,key:7,sc:'lyd',feel:'soft',prog:C([[0,'add9'],[4,'m7'],[2,'d9'],[7,'sus']]),lead:'bell'}]},
  realm_gal_f:{n:'Galaxy battle',songs:[{id:'supernova-run',bpm:104,key:9,sc:'dor',feel:'beat',prog:C([[0,'m9'],[10,'maj7'],[5,'d9'],[7,'sus']]),lead:'arp'},
   {id:'meteor-dash',bpm:108,key:2,sc:'lyd',feel:'beat',prog:C([[0,'maj9'],[2,'d9'],[9,'m7'],[7,'sus']]),lead:'bell'}]},
  realm_sea:{n:'Abyssal Sea',cave:1,songs:[
   {id:'whale-song',bpm:54,key:3,sc:'dor',feel:'ambient',prog:C([[0,'m9'],[5,'d9'],[3,'maj7'],[10,'sus']]),lead:'bell',whale:1},
   {id:'coral-lullaby',bpm:62,key:8,sc:'maj',feel:'soft',prog:C([[0,'maj9'],[9,'m7'],[5,'add9'],[7,'sus']]),lead:'glass',whale:1}]},
  realm_sea_f:{n:'Abyss battle',cave:1,songs:[{id:'riptide',bpm:100,key:4,sc:'min',feel:'drive',prog:C([[0,'m9'],[8,'maj9'],[3,'maj7'],[10,'d9']]),lead:'mar'},
   {id:'leviathan',bpm:96,key:11,sc:'dor',feel:'drive',prog:C([[0,'m11'],[5,'d9'],[10,'maj7'],[7,'sus']]),lead:'glass'}]},
  realm_cry:{n:'Crystal Realm',songs:[
   {id:'prism-waltz',bpm:72,key:11,sc:'lyd',feel:'brush',prog:C([[0,'maj9'],[2,'d9'],[4,'m7'],[7,'add9']]),lead:'glass'},
   {id:'glass-garden',bpm:66,key:4,sc:'hira',feel:'soft',prog:C([[0,'m9'],[8,'maj9'],[3,'add9'],[10,'sus']]),lead:'box'}]},
  realm_cry_f:{n:'Crystal battle',songs:[{id:'shatterpoint',bpm:108,key:1,sc:'lyd',feel:'beat',prog:C([[0,'maj7'],[2,'d9'],[9,'m9'],[7,'sus']]),lead:'glass'},
   {id:'prism-rush',bpm:112,key:6,sc:'hira',feel:'beat',prog:C([[0,'m9'],[8,'maj9'],[3,'add9'],[10,'sus']]),lead:'box'}]},
  // underground (20 m and deeper): a curious cave groove with marimba, water drops and a cave echo...
  mine:{n:'Echo Caves',cave:1,songs:[
   {id:'glimmer-tunnels',bpm:84,key:4,sc:'dor',feel:'cave',prog:C([[0,'m9'],[10,'maj7'],[8,'maj9'],[10,'sus']]),lead:'mar'},
   {id:'crystal-echo',bpm:78,key:9,sc:'min',feel:'cave',prog:C([[0,'m11'],[5,'m9'],[8,'maj7'],[7,'sus']]),lead:'mar'},
   {id:'lantern-miner',bpm:90,key:2,sc:'dor',feel:'cave',prog:C([[0,'m7'],[3,'maj9'],[5,'d9'],[0,'m9']]),lead:'bell'}]},
  // ...and deeper still (46 m+): darker, driving, a little dangerous
  deep:{n:'Ember Depths',cave:1,songs:[
   {id:'magma-heart',bpm:96,key:5,sc:'hira',feel:'drive',prog:C([[0,'m9'],[1,'maj7'],[8,'maj7'],[7,'sus']]),lead:'mar'},
   {id:'ancient-forge',bpm:100,key:0,sc:'min',feel:'drive',prog:C([[0,'m11'],[8,'maj9'],[10,'d9'],[7,'m7']]),lead:'koto'}]}};
 const BARS=24;
 let mood='plaza',want='plaza',ctx=null,master=null,mg=null,lp=null,wet=null,cave=null,caveSend=null,nb=null,timer=0,nextT=0,step=0,on=false,holdUntil=0,last='',song=null,songBar=0,played=[],gap=0,fading=0,detT=0,crackT=0;
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
 // underground: a woody marimba, falling water drops into the cave echo, hand-drum and rim sounds
 const mar=(fr,t,v)=>{voice(fr,t,.55,'sine',v,.003,cave);voice(fr*4,t,.09,'sine',v*.3,.002);voice(fr*10,t,.03,'sine',v*.08,.001)};
 const glass=(fr,t,v)=>{voice(fr*2,t,2.6,'sine',v,.06,wet);voice(fr*4.01,t,1.4,'sine',v*.32,.04,wet);voice(fr*6.02,t,.6,'sine',v*.12,.02,wet)};
 const whale=(t,root)=>{const o=ctx.createOscillator(),g=ctx.createGain(),f=hz(root,-12+[0,3,7][(R()*3)|0]);o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.5,t+1.6);o.frequency.exponentialRampToValueAtTime(f*1.12,t+3.4);env(g,t,.9,3.8,.03);o.connect(g);g.connect(cave);o.start(t);o.stop(t+4)};
 const drip=t=>{const f=900+R()*1500,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.9,t+.06);env(g,t,.003,.22,.022);o.connect(g);g.connect(cave);o.start(t);o.stop(t+.3)};
 const hand=(t,v,lo)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(lo?150:230,t);o.frequency.exponentialRampToValueAtTime(lo?80:150,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(mg);o.start(t);o.stop(t+.22)};
 function kick(t,v){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(100,t);o.frequency.exponentialRampToValueAtTime(40,t+.16);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);o.connect(g);g.connect(mg);o.start(t);o.stop(t+.3)}
 function nz(t,d,f1,type,v,dest){const b=ctx.createBufferSource();b.buffer=nb;b.playbackRate.value=.8+R()*.4;const h=ctx.createBiquadFilter();h.type=type;h.frequency.value=f1;const g=ctx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);b.connect(h);h.connect(g);g.connect(dest||mg);b.start(t,R()*.5,d+.05)}
 const hat=(t,v)=>nz(t,.045,8000,'highpass',v);
 const snare=(t,v)=>{nz(t,.16,1800,'bandpass',v);voice(180,t,.1,'sine',v*.5,.002,mg)};
 const brush=(t,v)=>nz(t,.22,3500,'bandpass',v);
 // strings, brass, choir, a plucked harp and a piano-like voice for the class themes; a taiko for the drums
 const ens=(f,t,d,w,v,a,n)=>{for(let i=0;i<(n||2);i++)voice(f*(1+(i?.004:-.004)*(i+1)),t,d,w,v/(n||2),a,lp)};
 const strings=(f,t,v,d)=>ens(f,t,d||.5,'sawtooth',v*.62,.06,3);const brass=(f,t,v,d)=>ens(f,t,d||.42,'sawtooth',v*.7,.03,2);const choir=(f,t,v,d)=>ens(f,t,d||1.4,'triangle',v*1.3,.3,3);const harp=(f,t,v)=>voice(f,t,.8,'triangle',v*1.2,.004,lp);const piano=(f,t,v)=>{voice(f,t,1,'triangle',v,.004,lp);voice(f*2,t,.5,'sine',v*.3,.004,lp)};
 function taiko(t,v){const o=ctx.createOscillator(),g2=ctx.createGain();o.frequency.setValueAtTime(92,t);o.frequency.exponentialRampToValueAtTime(44,t+.24);g2.gain.setValueAtTime(v,t);g2.gain.exponentialRampToValueAtTime(.001,t+.5);o.connect(g2);g2.connect(mg);o.start(t);o.stop(t+.55)}
 const CM=(id,bpm,key,sc,prog,lead,A,B,o)=>({n:id,songs:[Object.assign({id:'cls-'+id,bpm,key,sc,feel:'epic',prog:C(prog),lead,A,B},o||{})]});
 MOODS.cls_reaper=CM('reaper',104,1,'min',[[0,'m9'],[8,'maj7'],[5,'m7'],[7,'sus']],'str',[0,-1,2,3,-1,2,1,-1],[4,-1,3,2,-1,1,0,-1],{pad:'choir',perc:[1,0,0,1,0,0,1,0]});
 MOODS.cls_knight=CM('knight',118,2,'maj',[[0,'add9'],[7,'sus'],[9,'m7'],[5,'maj7']],'brass',[0,2,4,-1,3,2,1,-1],[4,-1,3,4,2,-1,1,0],{perc:[1,0,1,0,1,0,1,1],ride:1});
 MOODS.cls_samurai=CM('samurai',96,2,'hira',[[0,'m9'],[8,'maj7'],[3,'maj9'],[10,'sus']],'harp',[0,-1,1,2,-1,4,3,-1],[4,3,-1,2,1,-1,0,-1],{perc:[1,0,0,0,1,0,1,0]});
 MOODS.cls_archer=CM('archer',136,9,'dor',[[0,'m7'],[3,'maj7'],[10,'add9'],[5,'d9']],'str',[0,2,4,2,5,4,2,1],[6,4,2,4,3,2,1,0],{perc:[1,0,1,1,0,1,0,1],ride:1});
 MOODS.cls_mage=CM('mage',84,9,'lyd',[[0,'maj9'],[7,'add9'],[2,'m9'],[9,'sus']],'piano',[0,2,4,6,-1,4,2,-1],[6,-1,5,4,2,-1,1,0],{pad:'choir',perc:[0,0,0,0,1,0,0,0]});
 MOODS.cls_demon=CM('demon',98,4,'min',[[0,'m11'],[1,'maj7'],[8,'maj7'],[7,'m7']],'brass',[0,-1,0,1,-1,4,3,-1],[4,-1,4,3,1,-1,0,-1],{pad:'choir',perc:[1,1,0,0,1,0,1,0]});
 MOODS.cls_elementalist=CM('elementalist',112,5,'dor',[[0,'m9'],[5,'d9'],[10,'maj7'],[3,'add9']],'harp',[0,3,1,4,2,5,3,6],[6,3,5,2,4,1,3,0],{perc:[1,0,0,1,0,1,1,0]});
 MOODS.cls_stormcaller=CM('stormcaller',140,7,'min',[[0,'m7'],[10,'maj7'],[8,'maj7'],[7,'sus']],'brass',[0,0,3,-1,4,-1,3,2],[4,4,3,-1,2,-1,1,0],{perc:[1,0,1,0,1,1,1,0],ride:1});
 MOODS.cls_berserker=CM('berserker',126,0,'min',[[0,'m7'],[0,'m7'],[8,'maj7'],[10,'d9']],'brass',[0,-1,0,-1,1,2,-1,1],[3,-1,3,2,-1,1,0,-1],{perc:[1,1,0,1,1,0,1,1]});
 MOODS.cls_ninja=CM('ninja',148,6,'hira',[[0,'m7'],[3,'maj7'],[8,'maj7'],[7,'sus']],'str',[0,1,-1,3,2,-1,4,3],[4,3,-1,1,2,-1,0,-1],{perc:[1,0,1,1,0,1,1,0],ride:1});
 MOODS.cls_druid=CM('druid',80,7,'maj',[[0,'add9'],[9,'m9'],[5,'maj9'],[7,'sus']],'harp',[0,2,-1,4,3,-1,2,1],[4,-1,3,2,-1,4,1,0],{pad:'choir',perc:[0,0,0,1,0,0,0,1]});
 MOODS.cls_gunslinger=CM('gunslinger',110,4,'min',[[0,'m7'],[3,'maj7'],[5,'m7'],[7,'d9']],'piano',[0,-1,2,1,-1,3,2,-1],[4,-1,3,1,-1,2,0,-1],{perc:[1,0,0,1,1,0,0,1],ride:1});
 MOODS.cls_brawler=CM('brawler',130,0,'maj',[[0,'d9'],[5,'d9'],[7,'d9'],[0,'d9']],'brass',[0,0,2,-1,4,-1,2,1],[4,2,-1,3,2,-1,1,0],{perc:[1,0,1,1,1,0,1,0],ride:1});
 // ---- song machinery
 function newSong(m){const list=MOODS[m].songs;let c=list.filter(s=>!played.slice(-Math.min(2,list.length-1)).includes(s.id));if(!c.length)c=list;const d=pick(c);played.push(d.id);if(played.length>8)played.shift();
  const sc=SC[d.sc],mt=()=>{const n=[];for(let i=0;i<8;i++)n.push(R()<.55?(R()*sc.length)|0:-1);n[0]=(R()*sc.length)|0;return n};
  song={d,sc,A:d.A?d.A.slice():mt(),B:d.B?d.B.slice():mt(),root:d.key,id:d.id,ph:0};songBar=0;step=0}
 function mutate(m,sc){const o=m.slice();for(let i=0;i<o.length;i++){const r=R();if(o[i]>=0&&r<.18)o[i]=Math.max(0,Math.min(sc.length-1,o[i]+(R()<.5?-1:1)));else if(o[i]>=0&&r<.28)o[i]=-1;else if(o[i]<0&&r<.14)o[i]=(R()*sc.length)|0}return o}
 function tick(){if(!on||!ctx)return;if(window.MUS_HOLD)return;/* the dungeon score plays instead */if(ctx.currentTime<gap||fading)return;if(!song)newSong(mood);const d=song.d,e8=60/d.bpm/2;
  if(nextT<ctx.currentTime)nextT=ctx.currentTime+.05;
  while(nextT<ctx.currentTime+.45){const s=step%8,bar=songBar,[rt,q]=d.prog[bar%d.prog.length],t=nextT+(s%2?(d.feel=='ambient'?0:.1)*e8:0),hv=.85+R()*.3;
   const sect=bar>>3&3,mel=(sect==2?song.B:song.A);
   // pad / chord
   if(d.feel=='epic'){if(s==0){const dur=e8*8;q.slice(0,4).forEach((n,i)=>{(d.pad=='choir'?choir:strings)(hz(song.root+rt,n+12),t+i*.01,.014,dur)});bass(hz(song.root+rt,-12),t,e8*3.5,.13);bass(hz(song.root+rt,-24),t,e8*7,.08)}}else if(s==0){const dur=e8*8+.6;if(d.feel!='beat')q.slice(0,4).forEach((n,i)=>padv(hz(song.root+rt,n+12),t+i*.02,dur,.018));
    const kv=d.feel=='ambient'?.016:.05;q.forEach((n,i)=>rhodes(hz(song.root+rt,n+12),t+i*.028+R()*.01,kv*(.8+R()*.4),d.feel=='ambient'?4:2.2));bass(hz(song.root+rt,-12),t,e8*3.5,.11)}
   if((s==3||s==6)&&d.feel!='ambient'&&d.feel!='soft'&&R()<.55){const k=(s==3?q.slice(1,4):q.slice(0,3));k.forEach((n,i)=>rhodes(hz(song.root+rt,n+12),t+i*.02,.028,1.2))}
   if(s==4&&(d.feel=='lofi'||d.feel=='beat')&&R()<.7)bass(hz(song.root+rt,-12+(R()<.5?7:0)),t,e8*2,.08);
   if(s==7&&d.feel!='ambient'&&R()<.25)bass(hz(song.root+rt,-12+q[1]),t,e8,.05);
   // melody (rests in the first bar of each section so the chords breathe)
   if(bar%8!=0||s>2){const ni=mel[s],m2=(bar&1)?mutate(mel,song.sc):mel;const idx=(bar&1)?m2[s]:ni;
    if(idx>=0&&R()<(d.feel=='ambient'?.5:.9)){const oct=(sect==3?12:0)+(R()<.12?12:0),f=hz(song.root,song.sc[idx]+12+oct),v=(d.lead=='bell'?.03:d.lead=='arp'?.026:d.lead=='glass'?.024:.032)*hv;
     d.lead=='str'?strings(f,t,v*1.3,e8*1.9):d.lead=='brass'?brass(f,t,v*1.35,e8*1.7):d.lead=='harp'?harp(f,t,v*1.1):d.lead=='piano'?piano(f,t,v*1.2):d.lead=='box'?box(f,t,v):d.lead=='koto'?koto(f,t,v*1.1):d.lead=='bell'?bellv(f,t,v):d.lead=='arp'?pluck(f,t,v):d.lead=='mar'?mar(f,t,v*1.25):d.lead=='glass'?glass(f,t,v):rhodes(f,t,v*1.15,1.4)}}
   if(d.whale&&s==0&&bar%4==1&&R()<.8)whale(t,song.root);
   if(d.lead=='mar'&&s%2==1&&R()<.6){const n=q[(s+bar)%q.length];mar(hz(song.root+rt,n+24),t,.014*hv)}   // a soft marimba arpeggio under the tune
   if(d.lead=='arp'&&(s%2==0)){const n=q[(s/2+bar)%q.length|0];pluck(hz(song.root+rt,n+24),t,.016*hv)}
   // drums
   if(d.feel=='epic'){const pt=d.perc||[1,0,0,1,0,1,0,0];if(pt[s])taiko(t,(s?.1:.15)*hv);if(s==2||s==6)nz(t,.06,3200,'bandpass',.024);if(d.ride)hat(t,(s%2?.012:.02)*hv)}else if(d.feel=='lofi'||d.feel=='beat'){if(s==0||(s==3&&R()<.4)||s==5||(d.feel=='beat'&&s==4&&R()<.2))kick(t,d.feel=='beat'?.12:.085);if(s==2||s==6)snare(t,d.feel=='beat'?.045:.028);hat(t,(s%2?.016:.026)*hv);if(R()<.07)hat(t+e8*.5,.012)}
   else if(d.feel=='brush'){if(s==0)kick(t,.05);if(s==4)brush(t,.03);if(s%2==0)hat(t,.012*hv)}
   else if(d.feel=='soft'){if(s==0&&R()<.4)kick(t,.04);if(s==4&&R()<.5)brush(t,.016)}
   else if(d.feel=='cave'){if(s==0||s==5)kick(t,.07);if(s==2||s==6)nz(t,.03,5200,'bandpass',.03);hand(t+e8*.02,(s%2?.03:.045)*hv,s==3||s==7);nz(t,.03,9000,'highpass',.008*hv);if(R()<.18)drip(t+e8*R())}
   else if(d.feel=='drive'){if(s==0||s==3||s==4||(s==7&&R()<.5))kick(t,.11);if(s==2||s==6)snare(t,.04);hat(t,(s%2?.014:.022)*hv);if(s==7&&bar%4==3){hand(t,.05,1);hand(t+e8*.5,.05,0)}if(R()<.1)drip(t+e8*R())}
   nextT+=e8;step++;if(step%8==0){songBar++;if(songBar>=BARS){endSong();return}}}}
 function endSong(){fading=1;const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(mg.gain.value,t);mg.gain.linearRampToValueAtTime(0,t+3.2);setTimeout(()=>{song=null;fading=0;gap=ctx.currentTime+1.5+R()*3;nextT=gap;fadeIn()},3300)}
 function fadeIn(){const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(0,t);mg.gain.linearRampToValueAtTime(1,t+2.2)}
 function crackle(){if(!on||!ctx||window.MUS_HOLD)return;const t=ctx.currentTime;if(R()<.7)nz(t,.012+R()*.02,2500+R()*4000,'bandpass',.004+R()*.006);if(R()<.04)nz(t,.05,900,'bandpass',.008)}
 function start(){ac();if(on||!AC)return;ctx=AC;master=ctx.createGain();master.gain.value=mute?0:(OPT.mv==null?.5:OPT.mv);mg=ctx.createGain();mg.gain.value=1;lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;lp.Q.value=.4;
  wet=ctx.createGain();wet.gain.value=.34;const rv=mkReverb();lp.connect(mg);lp.connect(rv);rv.connect(wet);wet.connect(mg);mg.connect(master);
  // calm master: a treble shelf and a gentle lowpass take the edge off bright notes and crackle, and a slow soft compressor rounds drum transients
  {const hs=ctx.createBiquadFilter(),lp2=ctx.createBiquadFilter(),cp=ctx.createDynamicsCompressor();hs.type='highshelf';hs.frequency.value=2200;hs.gain.value=-5;lp2.type='lowpass';lp2.frequency.value=7000;lp2.Q.value=.5;
   cp.threshold.value=-20;cp.knee.value=16;cp.ratio.value=2.5;cp.attack.value=.012;cp.release.value=.35;master.connect(hs);hs.connect(lp2);lp2.connect(cp);cp.connect(ctx.destination)}
  // the cave echo (a dotted-eighth delay with feedback): marimba and drops go through it; underground moods also send the whole mix in
  cave=ctx.createGain();cave.gain.value=1;const dl=ctx.createDelay(1),fb=ctx.createGain(),dlp=ctx.createBiquadFilter();dl.delayTime.value=.33;fb.gain.value=.38;dlp.type='lowpass';dlp.frequency.value=1800;
  cave.connect(lp);cave.connect(dl);dl.connect(dlp);dlp.connect(fb);fb.connect(dl);dlp.connect(wet);caveSend=ctx.createGain();caveSend.gain.value=0;lp.connect(caveSend);caveSend.connect(dl);
  // gentle tape wobble on the filter keeps the sound alive and slightly warm
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.13;lg.gain.value=260;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  bgm={m:master};on=true;nextT=ctx.currentTime+.1;timer=setInterval(tick,120);crackT=setInterval(crackle,260);detT=setInterval(detect,1000);detect()}
 function switchTo(m2){if(m2==mood&&song)return;if(!ctx)return;fading=1;const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(mg.gain.value,t);mg.gain.linearRampToValueAtTime(0,t+1.6);
  setTimeout(()=>{mood=m2;song=null;fading=0;gap=0;nextT=ctx.currentTime+.2;try{const c=MOODS[m2]&&MOODS[m2].cave,tt=ctx.currentTime;caveSend.gain.setTargetAtTime(c?.32:0,tt,.4);lp.frequency.setTargetAtTime(String(m2).startsWith('cls_')?5600:c?2100:2600,tt,.4)}catch(_){}fadeIn()},1700)}
 // tiles below the surface under the player (the depth zones count the same way)
 const depthNow=()=>{try{const tx=Math.max(0,Math.min(W-1,Math.floor(P.x/T)));return Math.floor((P.y+P.h)/T)-sh(tx)}catch(_){return 0}};
 function classMood(){try{const k=CLASS7.cur();let near=null;if(typeof cur!='undefined'&&cur=='plaza'&&window.PLZ7)for(const h of PLZ7.HS){if(Math.abs((h.x0+h.w/2)*T-P.x)<T*6){near=h.c;break}}const fight=window.CLS9&&CLS9.isOpen()?1:0,cb=(window.SK1&&SK1.FX.length>0)||(mobs||[]).some(m=>m.hp>0&&Math.abs(m.x-P.x)<T*9&&(m.boss));const c=near||(fight||cb?k:null);return c&&MOODS['cls_'+c]?'cls_'+c:null}catch(_){return null}}
 function detect(){try{if(!entered)return;const cm0=classMood();if(cm0&&!window.MUS_HOLD){if(mood!=cm0)switchTo(cm0);return}let m='plaza';const e=ENV7.target,dep=depthNow();let rm=null;try{rm=typeof REALM10!='undefined'?REALM10.mood():null}catch(_){}if(rm&&!MOODS[rm])rm=null;
  if(rm)m=rm;
  else if(dep>=46)m='deep';else if(dep>=20)m='mine';
  else if(e&&e!='default'&&MOODS[e])m=e;
  else if(wxN=='storm')m='storm';else if(wxN=='rain')m='rain';else if(wxN=='snow')m='snow';
  else if(night>.6)m='night';else if(wxN=='cloud')m='cloud';
  let fight=false;try{if(BOSS6.active())fight=true}catch(_){}for(const k of mobs){if(Math.abs(k.x-P.x)<420&&Math.abs(k.y-P.y)<300){fight=true;break}}
  const now=performance.now();if(fight)holdUntil=now+7000;if(now<holdUntil)m=rm&&MOODS[rm+'_f']?rm+'_f':'combat';want=m;if(m!=last){last=m;switchTo(m)}}catch(_){}}
 // a fight's music hold (7 s after the last monster) doesn't follow you into another world
 {const _lw=loadWorld;loadWorld=function(){holdUntil=0;return _lw.apply(this,arguments)}}
 // a few seconds for the moment of evolution, in the class's own key
 function stinger(k){try{if(!ctx)return;const m=MOODS['cls_'+k];if(!m)return;const d=m.songs[0],sc=SC[d.sc],t=ctx.currentTime+.05;for(let i=0;i<6;i++){const n=sc[i%sc.length]+12*(i>>2);brass(hz(d.key,n+12),t+i*.34,.05,.5);strings(hz(d.key,n),t+i*.34,.04,.6)}for(const[q,a]of[[0,1],[.68,.8],[1.36,.9],[2.04,1]])taiko(t+q,.16*a);const fin=t+2.5;d.prog[0][1].slice(0,4).forEach(n=>{brass(hz(d.key,n+12),fin,.07,1.6);strings(hz(d.key,n+24),fin,.05,1.8);choir(hz(d.key,n),fin,.03,2)});taiko(fin,.22)}catch(_){}}
 return{stinger,calm(){holdUntil=0},start,get mood(){return mood},get want(){return want},get on(){return on},get song(){return song&&song.id},get played(){return played.slice()},MOODS,detect,endSong,force(m){want=m;last=m;switchTo(m)},newSong,depthNow}})();
startBGM=function(){MUS7.start()};
// ambience volume slider (0-100%), saved with the other options
{const _au=ambUpdate;ambUpdate=function(){_au();try{if(ambG)ambG.gain.value*=OPT.av==null?1:OPT.av}catch(_){}};
 const addSlider=()=>{const os=document.getElementById('os');if(!os||document.getElementById('oav'))return;const lb=os.parentElement,l=document.createElement('label');l.innerHTML='Ambience <input type="range" id="oav" min="0" max="100">';lb.after(l);const r=l.querySelector('input');r.value=(OPT.av==null?1:OPT.av)*100;r.oninput=e=>{OPT.av=e.target.value/100;try{saveP()}catch(_){}}};
 addSlider();addEventListener('load',addSlider);
}
