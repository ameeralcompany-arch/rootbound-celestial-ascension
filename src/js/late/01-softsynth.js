// ===== Soft synth: the game's two basic sound makers, snd() (a tone) and noise() (a burst of air), rebuilt for Rootbound's smooth sound.
// Hundreds of sounds in the game call these two. They used raw square and saw waves with an instant start, which clicks and buzzes. Now:
//   - square and saw become rounded tones with only their lower harmonics (the same pitch and character, without the buzz), with a soft lowpass;
//   - every sound starts with a few milliseconds of fade-in (no click) and rings out a touch longer;
//   - each repeat is a hair higher or lower (about 1.5%), so a hundred swings in a row never sound like one sample on loop;
//   - at most 28 of these sounds play at once, so a busy fight can not pile up into noise;
//   - noise() reuses one shared buffer (it used to allocate a new one on every call).
// Runs before every file that wraps snd() / noise() (they wrap these). Volume still follows the Sound effects slider (OPT.sv). =====
try{(()=>{
 if(typeof snd!='function'||typeof noise!='function')return;
 const R=Math.random;let waves=null,nb=null,live=0;const MAX=28;
 const vol=()=>{try{return OPT.sv==null?1:+OPT.sv}catch(_){return 1}};
 function wave(kind){if(!waves||waves.ac!==AC)waves={ac:AC};if(waves[kind])return waves[kind];const N=20,re=new Float32Array(N),im=new Float32Array(N);
  for(let k=1;k<N;k++)im[k]=kind=='square'?(k%2?(1/k)*Math.pow(.6,(k-1)/2):0):(1/k)*Math.pow(.68,k-1);return waves[kind]=AC.createPeriodicWave(re,im)}
 function buf(){if(nb&&nb.ac===AC)return nb.b;const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const w=R()*2-1;l=l*.55+w*.45;d[i]=l*1.4}nb={ac:AC,b};return b}
 snd=function(f,d,ty,v,sl){try{if(!AC||live>=MAX)return;d=d==null?.1:+d;ty=ty||'sine';v=v==null?.07:+v;const amp=Math.max(0,v*vol()*.85);if(!(amp>.0002)||!(f>0)||!(d>0))return;
  const t=AC.currentTime,o=AC.createOscillator(),n=AC.createGain(),pf=f*(1+(R()-.5)*.03);
  if(ty=='square'||ty=='sawtooth')o.setPeriodicWave(wave(ty));else o.type=ty;
  o.frequency.setValueAtTime(pf,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,pf*sl),t+d);
  const at=Math.min(.006,d*.25);n.gain.setValueAtTime(.0001,t);n.gain.linearRampToValueAtTime(amp,t+at);n.gain.exponentialRampToValueAtTime(.00005,t+d+.05);
  o.connect(n);let last=n;if(ty!='sine'){const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(6500,Math.max(900,pf*5));lp.Q.value=.5;n.connect(lp);last=lp}
  last.connect(AC.destination);live++;o.onended=()=>{live--};o.start(t);o.stop(t+d+.08)}catch(_){}};
 noise=function(d,f,v){try{if(!AC||live>=MAX)return;d=+d||.1;f=+f||1200;const amp=Math.max(0,(v==null?.05:+v)*vol());if(!(amp>.0002))return;
  const t=AC.currentTime,s=AC.createBufferSource(),lp=AC.createBiquadFilter(),n=AC.createGain();s.buffer=buf();lp.type='lowpass';lp.frequency.value=Math.max(60,f);lp.Q.value=.6;
  n.gain.setValueAtTime(.0001,t);n.gain.linearRampToValueAtTime(amp,t+.004);n.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(lp);lp.connect(n);n.connect(AC.destination);
  live++;s.onended=()=>{live--};s.start(t,R()*1.5,d+.05)}catch(_){}};
 window.SOFTSYN={get live(){return live},MAX,wave,buf};
})()}catch(e){console.error('SOFTSYN',e)}
