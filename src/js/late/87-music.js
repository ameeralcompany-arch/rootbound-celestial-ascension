// ===== MUS7: calm generative anime-lofi music with a mood per place (plaza / blossom / space / galaxy / combat) =====
// Everything is synthesised with WebAudio (no audio files). startBGM() is replaced so existing music volume / mute code keeps working: bgm.m is the music master gain.
const MUS7=(()=>{
 const MOODS={
  plaza:{bpm:76,root:130.81,ch:[[0,4,7,11,14],[-3,0,4,7,11],[-7,-3,0,4,7],[-5,-1,2,5,9]],sc:[0,2,4,7,9,12,14],pad:.035,mel:.045,sw:.12,drums:1,wave:'triangle',hat:.04},
  blossom:{bpm:62,root:146.83,ch:[[0,3,7,10,14],[-4,0,3,7,10],[-9,-5,-2,3,7],[-2,2,5,9,12]],sc:[0,2,3,7,8,12,14],pad:.032,mel:.06,sw:.05,drums:0,wave:'triangle',pluck:1,hat:0},
  space:{bpm:52,root:164.81,ch:[[0,7,12,14,19],[-5,2,7,12,14],[-3,4,9,12,16],[-7,0,5,7,12]],sc:[0,2,7,9,14,16,19],pad:.05,mel:.03,sw:0,drums:0,wave:'sine',bell:1,hat:0},
  galaxy:{bpm:68,root:174.61,ch:[[0,4,7,12,16],[-3,0,4,9,12],[-5,-1,4,7,11],[2,7,9,14,16]],sc:[0,4,7,9,12,16,19],pad:.04,mel:.04,sw:.06,drums:0,wave:'sine',arp:1,hat:0},
  combat:{bpm:100,root:110,ch:[[0,3,7,10],[-4,0,3,7],[-9,-5,-2,3],[-2,2,5,9]],sc:[0,3,5,7,10,12],pad:.03,mel:.04,sw:.05,drums:2,wave:'triangle',hat:.05}};
 let mood='plaza',want='plaza',ctx=null,master=null,mg=null,lp=null,wet=null,nb=null,timer=0,nextT=0,step=0,on=false,holdUntil=0,last='';
 const R=Math.random,F=(m,n)=>m.root*2**(n/12);
 function mkReverb(){const len=ctx.sampleRate*2.2,b=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}const cv=ctx.createConvolver();cv.buffer=b;return cv}
 const env=(g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+d)};
 function voice(fr,t,d,ty,v,a,dest){const o=ctx.createOscillator(),g=ctx.createGain();o.type=ty;o.frequency.value=fr;env(g,t,a||.03,d,v);o.connect(g);g.connect(dest||lp);o.start(t);o.stop(t+d+.05)}
 function pad(m,fr,t,d){voice(fr,t,d,m.wave,m.pad,.6);voice(fr*1.004,t,d,'sine',m.pad*.7,.8)}
 function pluck(m,fr,t,v){voice(fr,t,1.3,'triangle',v,.006);voice(fr*2,t,.5,'sine',v*.4,.004)}
 function bell(fr,t,v){voice(fr,t,3.2,'sine',v,.01,wet);voice(fr*2.76,t,1.6,'sine',v*.3,.01,wet)}
 function kick(t,v){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(mg);o.start(t);o.stop(t+.25)}
 function hat(t,v){const b=ctx.createBufferSource();b.buffer=nb;const h=ctx.createBiquadFilter();h.type='highpass';h.frequency.value=7000;const g=ctx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);b.connect(h);h.connect(g);g.connect(mg);b.start(t);b.stop(t+.07)}
 function tick(){if(!on||!ctx)return;const m=MOODS[mood],e8=60/m.bpm/2;
  while(nextT<ctx.currentTime+.4){const s=step%8,bar=(step>>3),c=m.ch[bar%4],t=nextT+(s%2?m.sw*e8:0);
   if(s==0){c.forEach((n,i)=>pad(m,F(m,n),t+i*.02,e8*8+1));voice(F(m,c[0]-24),t,e8*4,'sine',.1)}
   if(s==4&&m.drums!=1)voice(F(m,c[0]-24),t,e8*3,'sine',.07);
   if(m.pluck&&(s==2||s==5||s==7)&&R()<.7)pluck(m,F(m,m.sc[(R()*m.sc.length)|0]+12),t,m.mel);
   else if(m.bell&&s%4==0&&R()<.5)bell(F(m,m.sc[(R()*m.sc.length)|0]+24),t,m.mel);
   else if(m.arp&&s%1==0&&R()<.65)pluck(m,F(m,c[(s*3+bar)%c.length]+24),t,m.mel*.7);
   else if(!m.pluck&&!m.bell&&!m.arp&&(s==1||s==3||s==6)&&R()<.45)pluck(m,F(m,m.sc[(R()*m.sc.length)|0]+12),t,m.mel);
   if(m.drums){if(s==0||(m.drums==2&&s==4)||s==5)kick(t,m.drums==2?.16:.12);if(s%2==1)hat(t,m.hat)}
   nextT+=e8;step++}}
 function start(){ac();if(on||!AC)return;ctx=AC;master=ctx.createGain();master.gain.value=mute?0:(OPT.mv==null?.5:OPT.mv);mg=ctx.createGain();mg.gain.value=1;lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;
  wet=ctx.createGain();wet.gain.value=.3;const rv=mkReverb();lp.connect(mg);lp.connect(rv);rv.connect(wet);wet.connect(mg);mg.connect(master);master.connect(ctx.destination);
  nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  bgm={m:master};on=true;nextT=ctx.currentTime+.1;timer=setInterval(tick,120);setInterval(detect,1000)}
 function fadeTo(m2){if(m2==mood||!ctx)return;const t=ctx.currentTime;mg.gain.cancelScheduledValues(t);mg.gain.setValueAtTime(mg.gain.value,t);mg.gain.linearRampToValueAtTime(0,t+1.2);setTimeout(()=>{mood=m2;step=0;nextT=ctx.currentTime+.1;const t2=ctx.currentTime;mg.gain.cancelScheduledValues(t2);mg.gain.setValueAtTime(0,t2);mg.gain.linearRampToValueAtTime(1,t2+1.5)},1250)}
 function detect(){try{if(!entered)return;let m='plaza';const e=ENV7.target;if(e=='blossom'||e=='space'||e=='galaxy')m=e;
  let fight=false;try{if(BOSS6.active())fight=true}catch(_){}for(const k of mobs){if(Math.abs(k.x-P.x)<420&&Math.abs(k.y-P.y)<300){fight=true;break}}
  const now=performance.now();if(fight)holdUntil=now+7000;if(now<holdUntil)m='combat';want=m;if(m!=last){last=m;fadeTo(m)}}catch(_){}}
 return{start,get mood(){return mood},get want(){return want},get on(){return on},MOODS,detect,force(m){want=m;last=m;fadeTo(m)}}})();
startBGM=function(){MUS7.start()};
// ambience volume slider (0-100%), saved with the other options
{const _au=ambUpdate;ambUpdate=function(){_au();try{if(ambG)ambG.gain.value*=OPT.av==null?1:OPT.av}catch(_){}};
 const addSlider=()=>{const os=document.getElementById('os');if(!os||document.getElementById('oav'))return;const lb=os.parentElement,l=document.createElement('label');l.innerHTML='Ambience <input type="range" id="oav" min="0" max="100">';lb.after(l);const r=l.querySelector('input');r.value=(OPT.av==null?1:OPT.av)*100;r.oninput=e=>{OPT.av=e.target.value/100;try{saveP()}catch(_){}}};
 addSlider();addEventListener('load',addSlider)}
