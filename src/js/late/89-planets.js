// ===== PLN7: Star Atlas. World selection as a universe of planets, one planet per real saved world. =====
// Data comes only from this device: the recent-worlds list (rbidx), saved edits (rbw_<id>) and a small planet record (rbpl) that stores the
// planet theme, display name and visit times. A world's terrain is generated from its id, so Rename changes only the display name.
const PLN7=(()=>{
 const ID=/^[a-z0-9_-]{1,16}$/,KEY='rbpl',TAU=Math.PI*2,POOL=['verdant','frost','void','ember','tidal','dune'];
 const THEMES=PLG7.THEMES,ORDER=PLG7.ORDER;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ease=t=>t<0?0:t>1?1:t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t,cl=(v,a,b)=>v<a?a:v>b?b:v;
 const hs=s=>{let h=7;for(const c of String(s))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h};
 const reduce=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const lowfx=()=>document.documentElement.classList.contains('lowfx');
 const srv=()=>{try{return SHOP7.serverMode}catch(_){return false}};
 const online=()=>{try{return !!NET7.online}catch(_){return false}};
 // ------------------------------------------------------------ data
 let db={w:{},m:{}};
 function load(){let o={};try{o=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){o={}}if(!o||typeof o!='object')o={};const w={},src=o.w&&typeof o.w=='object'?o.w:{};
  for(const k of Object.keys(src)){if(!ID.test(k)||k=='plaza')continue;const r=src[k];if(!r||typeof r!='object')continue;
   w[k]={theme:THEMES[r.theme]&&r.theme!='plaza'?r.theme:'',label:typeof r.label=='string'?r.label.replace(/[<>]/g,'').slice(0,24):'',ix:Number.isFinite(+r.ix)?Math.max(0,r.ix|0):-1,created:+r.created||0,last:+r.last||0,plays:r.plays|0,disc:r.disc?1:0,ent:r.ent?1:0,fresh:r.fresh?1:0,rev:+r.rev||0}}
  const m=o.m&&typeof o.m=='object'?o.m:{};db={w,m:{claimed:m.claimed&&typeof m.claimed=='object'?m.claimed:{},plazaLast:+m.plazaLast||0,plazaPlays:m.plazaPlays|0,plazaEnt:m.plazaEnt?1:0}}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch(_){return false}}
 const recentsL=()=>{try{return recents().filter(n=>ID.test(n))}catch(_){return[]}};
 function ids(){const set=new Set(recentsL());try{const pre=(typeof RB_PREFIX=='string'?RB_PREFIX:'');for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(pre+'rbw_')){const n=k.slice(pre.length+4);if(ID.test(n))set.add(n)}}}catch(_){}
  for(const n of Object.keys(db.w))set.add(n);set.delete('plaza');return[...set]}
 function freeIx(){const used=new Set(Object.values(db.w).map(r=>r.ix));let i=0;while(used.has(i))i++;return i}
 function sync(){let ch=0;const all=ids(),rec=recentsL().slice().reverse();
  const legacy=all.filter(n=>!db.w[n]).sort((a,b)=>{const ia=rec.indexOf(a),ib=rec.indexOf(b);return(ia<0?1e9:ia)-(ib<0?1e9:ib)||(a<b?-1:1)});
  for(const n of legacy){db.w[n]={theme:'',label:'',ix:freeIx(),created:0,last:0,plays:0,disc:1,ent:1,fresh:0,rev:0};ch=1}
  for(const n of all){const r=db.w[n];if(r.ix<0){r.ix=freeIx();ch=1}}
  // two worlds must never share a slot
  const seen=new Set();for(const n of Object.keys(db.w).sort((a,b)=>db.w[a].ix-db.w[b].ix)){const r=db.w[n];if(seen.has(r.ix)){r.ix=freeIx();ch=1}seen.add(r.ix)}
  if(ch)save();return all}
 function skyOf(n){try{return(X6.wx&&X6.wx[n])||''}catch(_){return''}}
 function themeOf(n){if(n=='plaza')return'plaza';const sk=PLG7.SKY2THEME[skyOf(n)];if(sk)return sk;const r=db.w[n];if(r&&r.theme)return r.theme;return POOL[hs(n)%POOL.length]}
 const labelOf=n=>n=='plaza'?'Plaza':(db.w[n]&&db.w[n].label)||n;
 function readSave(n){let raw=null;try{raw=localStorage.getItem('rbw_'+n)}catch(_){}if(raw==null)return{empty:1,blocks:0,objs:0,owner:'',desc:''};
  try{const e=JSON.parse(raw);if(!e||typeof e!='object'||Array.isArray(e))return{bad:1};let b=0;for(const k in e)if(/^\d+$/.test(k))b++;return{blocks:b,objs:e.o&&typeof e.o=='object'?Object.keys(e.o).length:0,owner:e.m&&e.m.on?String(e.m.on).slice(0,14):'',desc:e.m&&e.m.d?String(e.m.d).slice(0,80):''}}catch(_){return{bad:1}}}
 function flush(){try{if(entered&&cur&&cur!='plaza'&&dirty&&!guest){localStorage.setItem('rbw_'+cur,JSON.stringify(edits));dirty=0}}catch(_){}}
 // a world was loaded by the game (any route): remember it
 function touch(n){try{if(n=='plaza'){db.m.plazaLast=Date.now();db.m.plazaPlays++;db.m.plazaEnt=1;save();atlasCheck();return}if(!ID.test(n))return;let r=db.w[n];const first=!r;
   if(!r){r=db.w[n]={theme:'',label:'',ix:freeIx(),created:Date.now(),last:0,plays:0,disc:0,ent:0,fresh:0,rev:0}}
   if(!r.ent)r.rev=Date.now();r.ent=1;r.last=Date.now();r.plays++;save();atlasCheck()}catch(e){console.error('PLN7 touch',e)}}
 // ------------------------------------------------------------ atlas (explored world types)
 const MILES=[[3,100],[6,250],[10,600]];
 function explored(){const s=new Set();if(db.m.plazaEnt)s.add('plaza');for(const n of Object.keys(db.w))if(db.w[n].ent)s.add(themeOf(n));return s}
 function atlasCheck(){try{const c=explored().size;for(const[need,g]of MILES){if(c>=need&&!db.m.claimed[need]){db.m.claimed[need]=1;let m='Star Atlas: '+need+' world types explored';if(!srv()){gems+=g;m+='  +'+g+' gems'}if(need==10)m+='  Title: Star Cartographer';save();setTimeout(()=>{try{say(m);saveP();if(open)renderAtlas()}catch(_){}},900)}}}catch(_){}}
 // ------------------------------------------------------------ audio (all synthesised; respects the music and UI-sound settings)
 const AU=(()=>{let ctx=null,out=null,sfx=null,pad=null,bellT=0,lastH=0,running=false,duckBase=null;
  const sfxV=()=>{try{const o=cel.opt||{};return o.uim?0:(o.uiv==null?.6:o.uiv)}catch(_){return .6}};
  const musV=()=>{try{return mute?0:(OPT.mv==null?.5:OPT.mv)}catch(_){return .5}};
  function ac(){if(ctx)return ctx;try{ctx=(typeof AC!='undefined'&&AC)||new(window.AudioContext||window.webkitAudioContext)();out=ctx.createGain();out.gain.value=1;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;out.connect(lp);lp.connect(ctx.destination)}catch(_){ctx=null}return ctx}
  function tone(f,t,d,v,type,slide){const c=ac();if(!c)return;const k=sfxV();if(!k)return;const o=c.createOscillator(),g=c.createGain(),T=c.currentTime+t;o.type=type||'sine';o.frequency.setValueAtTime(f,T);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f*slide),T+d);
   g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v*k,T+.015);g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(out);o.start(T);o.stop(T+d+.05)}
  function sweep(t,d,v,f0,f1){const c=ac();if(!c)return;const k=sfxV();if(!k)return;const n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1);const s=c.createBufferSource();s.buffer=b;const fl=c.createBiquadFilter();fl.type='bandpass';fl.Q.value=.9;const T=c.currentTime+t;fl.frequency.setValueAtTime(f0,T);fl.frequency.exponentialRampToValueAtTime(f1,T+d);
   const g=c.createGain();g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v*k,T+d*.55);g.gain.linearRampToValueAtTime(0,T+d);s.connect(fl);fl.connect(g);g.connect(out);s.start(T)}
  const PENT=[587.33,659.25,739.99,880,987.77,1174.66];
  function ready(){const c=ac();if(!c)return null;if(c.state=='suspended')c.resume().catch(()=>{});return c}
  const api={
   hover(n){const now=performance.now();if(now-lastH<170||!ready())return;lastH=now;tone(PENT[n%6],0,.28,.028,'sine');tone(PENT[n%6]*2,.02,.2,.01,'sine')},
   tick(){const now=performance.now();if(now-lastH<90||!ready())return;lastH=now;tone(1320,0,.05,.014,'sine')},
   select(){if(!ready())return;tone(660,0,.16,.04,'triangle');tone(990,.07,.22,.03,'sine');sweep(0,.3,.012,1800,3600)},
   back(){if(!ready())return;tone(520,0,.16,.03,'sine',.8)},
   error(){if(!ready())return;tone(200,0,.2,.04,'sine',.85)},
   discover(){if(!ready())return;[880,1174.66,1480].forEach((f,i)=>tone(f,i*.11,.9,.03,'sine'))},
   form(){if(!ready())return;sweep(0,1.5,.03,260,2600);[392,494,587,784,988,1174.66].forEach((f,i)=>tone(f,.25+i*.13,.8,.032,'triangle'));tone(98,0,1.6,.05,'sine',1.4)},
   enter(){if(!ready())return;sweep(0,1.1,.05,240,3400);[293.66,440,587.33,739.99].forEach((f,i)=>tone(f,i*.12,.9,.035,'triangle'));tone(110,0,1.1,.05,'sine',1.6)},
   start(){const c=ready();if(!c||running)return;running=true;
    pad=c.createGain();pad.gain.value=0;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=760;lp.Q.value=.5;lp.connect(pad);pad.connect(out);
    const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.07;lg.gain.value=240;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
    const oscs=[lfo];[146.83,220,293.66,369.99,440.4].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i%2?'triangle':'sine';o.frequency.value=f;o.detune.value=(i-2)*5;g.gain.value=[.5,.4,.32,.22,.12][i];o.connect(g);g.connect(lp);o.start();oscs.push(o)});
    pad._o=oscs;pad._lp=lp;const v=musV();pad.gain.setTargetAtTime(.075*Math.min(1,v*2),c.currentTime,1.4);
    try{if(bgm&&bgm.m&&bgm.m.gain){duckBase=musV();bgm.m.gain.setTargetAtTime(duckBase*.22,c.currentTime,.5)}}catch(_){}
    const bell=()=>{if(!running)return;const k=musV();if(k>0&&!document.hidden){const f=PENT[Math.random()*6|0];tone2(f,k)}bellT=setTimeout(bell,2600+Math.random()*4200)};bellT=setTimeout(bell,1800)},
   stop(){if(!running)return;running=false;clearTimeout(bellT);const c=ctx;try{if(pad&&c){pad.gain.setTargetAtTime(0,c.currentTime,.25);const p=pad;setTimeout(()=>{try{p._o.forEach(o=>o.stop());p.disconnect();p._lp.disconnect()}catch(_){}},900)}pad=null;
     if(bgm&&bgm.m&&bgm.m.gain&&c)bgm.m.gain.setTargetAtTime(musV(),c.currentTime,.6)}catch(_){}},
   get running(){return running}};
  function tone2(f,k){const c=ctx;if(!c||!out)return;const o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),T=c.currentTime+.01;o.frequency.value=f;o2.frequency.value=f*2.01;o2.type='sine';g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.032*Math.min(1,k*2),T+.02);g.gain.exponentialRampToValueAtTime(.0001,T+2.6);const g2=c.createGain();g2.gain.value=.25;o.connect(g);o2.connect(g2);g2.connect(g);g.connect(out);o.start(T);o2.start(T);o.stop(T+2.7);o2.stop(T+2.7)}
  return api})();
 // ------------------------------------------------------------ state
 let el,cv,g,open=false,raf=0,last=0,t0=0,W=0,H=0,D=1;
 const S={mode:'overview',cam:{x:0,y:0,z:.5},tgt:{x:0,y:0,z:.5},ax:.5,ay:.5,tax:.5,tay:.5,sel:null,hov:null,drag:null,planets:[],lines:true,renaming:false,bits:[],sparks:[],busy:0,from:'',ent:null,arr:null,form:null,pv:null,creating:false,toastT:0,mouse:{x:-1,y:-1}};
 const byId=n=>S.planets.find(p=>p.id==n);
 // ------------------------------------------------------------ planets
 function slot(ix){const a=ix*2.39996+.55,r=340*Math.sqrt(ix+1);return{x:Math.cos(a)*r,y:Math.sin(a)*r*.8}}
 function mkPlanet(id){const plaza=id=='plaza',r=db.w[id],h=hs(id),th=themeOf(id),T=THEMES[th],P=slot(plaza?-1:r.ix);
  const p={id,plaza,label:labelOf(id),theme:th,T,variant:h%3,tilt:[-.38,-.17,.08,.27,.46][(h>>3)%5],rot0:(h%1000)/1000,spd:.006+(h%7)*.0012,R:plaza?118:84+(h%9)*3,x:plaza?0:P.x,y:plaza?0:P.y,
   rec:plaza?null:r,auto:!plaza&&!(r&&r.theme)&&!PLG7.SKY2THEME[skyOf(id)],stat:null,cv:null,cx:null,img:null,N:0,spT:0,fade:0,hv:0,sl:0,bits:[],moons:[],born:0,veil:0,err:0};
  const known=plaza?db.m.plazaEnt:r.ent;p.explored=!!known;p.veil=known?0:1;
  const nb=lowfx()||reduce()?(reduce()?0:4):7+(h%5);for(let i=0;i<nb;i++)p.bits.push({a:(i/nb)*TAU+(h%10),rad:1.28+((h>>(i%9))&7)*.07,sp:(.16+((h>>i)&3)*.05)*(i%2?1:-1),sz:1.5+((h>>(i+2))&3)*.7,k:i*1.7,tilt:(i%3-1)*.22});
  for(const m of T.moons)p.moons.push({rad:m[0],size:m[1],col:m[2],sp:m[3]*(h%2?1:-1),a:(h%628)/100});
  if(!plaza&&r.disc==0){p.born=performance.now()}return p}
 function buildPlanets(){S.planets=[mkPlanet('plaza')];for(const n of ids().sort((a,b)=>db.w[a].ix-db.w[b].ix))S.planets.push(mkPlanet(n));
  for(const p of S.planets){if(!p.plaza)p.stat=readSave(p.id)}
  // constellation: every world is joined to its nearest earlier neighbour, which gives a tidy web without crossings
  for(let i=1;i<S.planets.length;i++){let b=null,bd=1e18;for(let j=0;j<i;j++){const d=(S.planets[i].x-S.planets[j].x)**2+(S.planets[i].y-S.planets[j].y)**2;if(d<bd){bd=d;b=S.planets[j]}}S.planets[i].link=b&&b.id}}
 function order(){return S.planets.slice()}
 // ------------------------------------------------------------ camera
 function bounds(){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const ps=S.planets.concat(S.pv?[S.pv]:[]);for(const p of ps){x0=Math.min(x0,p.x-p.R*1.7);x1=Math.max(x1,p.x+p.R*1.7);y0=Math.min(y0,p.y-p.R*1.6);y1=Math.max(y1,p.y+p.R*2.5)}return{x0,y0,x1,y1}}
 const narrow=()=>W/D<820||W/H<1;
 function viewOverview(snap){const b=bounds(),bw=b.x1-b.x0,bh=b.y1-b.y0;let z=Math.min(W*.9/bw,H*.7/bh);const minR=Math.min(...S.planets.map(p=>p.R));z=Math.max(z,34*D/minR);z=cl(z,.12*D,1.5*D);
  S.tgt.x=(b.x0+b.x1)/2;S.tgt.y=(b.y0+b.y1)/2;S.tgt.z=z;S.tax=.5;S.tay=.46;if(snap)snapCam()}
 function viewPlanet(p,snap,pad){const small=narrow(),rr=small?Math.min(H*.2,W*.34):Math.min(H*.3,W*.2);S.tgt.x=p.x;S.tgt.y=p.y;S.tgt.z=rr/p.R*(pad||1);S.tax=small?.5:.34;S.tay=small?.27:.5;if(snap)snapCam()}
 function snapCam(){S.cam.x=S.tgt.x;S.cam.y=S.tgt.y;S.cam.z=S.tgt.z;S.ax=S.tax;S.ay=S.tay}
 function stepCam(dt){const f=1-Math.exp(-dt*(reduce()?80:4.4));S.cam.x+=(S.tgt.x-S.cam.x)*f;S.cam.y+=(S.tgt.y-S.cam.y)*f;S.cam.z=Math.exp(Math.log(S.cam.z)+(Math.log(S.tgt.z)-Math.log(S.cam.z))*f);S.ax+=(S.tax-S.ax)*f;S.ay+=(S.tay-S.ay)*f}
 let boost=1;
 const sx=p=>(p.x-S.cam.x)*S.cam.z*boost+W*S.ax,sy=p=>(p.y-S.cam.y)*S.cam.z*boost+H*S.ay,sr=p=>p.R*S.cam.z*boost*(1+p.hv*.05);
 // ------------------------------------------------------------ rendering of one planet
 let budget=0;
 function ensureTex(p){const tx=PLG7.getTex(p.theme,p.variant);if(tx)return tx;PLG7.want(p.theme,p.variant);return null}
 function updateSprite(p,now,r,force){const tx=ensureTex(p);if(!tx)return false;const want=r*2;const N=want<110?96:want<170?144:want<240?192:want<330?256:320,Nn=Math.min(N,lowfx()?192:320);
  const age=now-p.spT,per=p.sl>.5||p.hv>.3?80:p.sl>0?120:260;if(!force&&p.cv&&p.N==Nn&&age<per)return true;if(budget<=0&&p.cv&&!force)return true;budget--;
  if(!p.cv||p.N!=Nn){p.cv=document.createElement('canvas');p.cv.width=p.cv.height=Nn;p.cx=p.cv.getContext('2d');p.img=p.cx.createImageData(Nn,Nn);p.N=Nn}
  const rot=reduce()?p.rot0:(p.rot0+now/1000*p.spd)%1,ge=PLG7.geo(Nn,p.tilt);PLG7.render(p.img,ge,tx,rot,(rot*1.4+.31)%1,p.T,.9+p.hv*.35+p.sl*.2,p.veil*.9);p.cx.putImageData(p.img,0,0);p.spT=now;return true}
 function drawRing(p,x,y,r,front){const rg=p.T.ring;if(!rg)return;g.save();g.translate(x,y);g.rotate(rg.t);g.scale(1,.26);g.lineCap='butt';
  const a0=front?0:Math.PI,a1=front?Math.PI:TAU;g.globalAlpha=(front?.95:.7)*(.4+.6*p.fade);
  g.strokeStyle=rg.c;g.lineWidth=r*.2;g.beginPath();g.arc(0,0,r*1.62,a0,a1);g.stroke();g.globalAlpha*=.55;g.lineWidth=r*.06;g.beginPath();g.arc(0,0,r*1.9,a0,a1);g.stroke();g.lineWidth=r*.09;g.beginPath();g.arc(0,0,r*1.43,a0,a1);g.stroke();g.restore()}
 function drawOrbiters(p,x,y,r,t,front){const st=reduce()?0:1;for(const b of p.bits){const a=b.a+t*b.sp*(1+p.hv*.9)*st,s=Math.sin(a);if((s>0)!=front)continue;const rad=r*b.rad,px=x+Math.cos(a)*rad*1.05,py=y+s*rad*(.34+b.tilt)+Math.cos(a)*rad*b.tilt*.4;
   g.globalAlpha=(front?1:.6)*p.fade*(p.veil?.4:1);PLG7.drawBit(g,p.T.fx,px,py,b.sz*Math.max(.8,r/90),a,t,b.k)}g.globalAlpha=1;
  for(const m of p.moons){const a=m.a+t*m.sp*.35*(reduce()?0:1),s=Math.sin(a);if((s>0)!=front)continue;const rad=r*m.rad,px=x+Math.cos(a)*rad,py=y+s*rad*.3-rad*.05,ms=r*m.size;g.globalAlpha=p.fade*(front?1:.75);g.drawImage(PLG7.moonSprite(m.col),px-ms,py-ms,ms*2,ms*2)}g.globalAlpha=1}
 function lbl(txt,x,y,px,col,w,sp){g.font=w+' '+px+'px '+LF;g.textAlign='center';try{g.letterSpacing=(sp||0)+'px'}catch(_){}g.fillStyle=col;g.fillText(txt,x,y);try{g.letterSpacing='0px'}catch(_){}}
 let LF='system-ui,sans-serif';
 function drawPlanet(p,now,t){const x=sx(p),y=sy(p)+(reduce()?0:Math.sin(t*.7+p.R)*3*D),r=sr(p);if(x<-r*2.4||x>W+r*2.4||y<-r*2.4||y>H+r*2.4)return;
  let alpha=1;if(p.born){const e=(now-p.born)/2600;if(e<1){alpha=ease(e);p.fade=Math.min(p.fade,alpha)}}
  const ready=updateSprite(p,now,r,false);p.fade=ready?Math.min(1,p.fade+.06):p.fade;const A=p.fade*alpha;
  g.save();g.globalAlpha=A;
  // atmosphere glow
  const aI=p.T.ai*(.30+.28*p.hv+.18*p.sl)*(.92+.08*Math.sin(t*1.2+p.R)),c=p.T.atm.join(',');
  g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(x,y,r*.86,x,y,r*(1.62+.3*p.hv));gr.addColorStop(0,'rgba('+c+','+(aI*(p.veil?.5:1)).toFixed(3)+')');gr.addColorStop(.35,'rgba('+c+','+(aI*.28).toFixed(3)+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r*(1.62+.3*p.hv),0,TAU);g.fill();g.globalCompositeOperation='source-over';
  if(!lowfx()){g.globalAlpha=A;drawRing(p,x,y,r,false);drawOrbiters(p,x,y,r,t,false)}
  // sphere
  g.globalAlpha=A;g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();
  if(p.cv&&ready)g.drawImage(p.cv,x-r,y-r,r*2,r*2);else{const pg=g.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);pg.addColorStop(0,'rgba('+c+',.8)');pg.addColorStop(1,'#0a0818');g.fillStyle=pg;g.fillRect(x-r,y-r,r*2,r*2)}
  // terminator shadow + soft highlight (kept outside the sprite so it stays smooth at any zoom)
  const sh=g.createRadialGradient(x-r*.42,y-r*.42,r*.2,x-r*.1,y-r*.1,r*1.12);sh.addColorStop(0,'rgba(255,255,255,'+(.10+.1*p.hv)+')');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(4,2,16,.46)');g.fillStyle=sh;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
  // rim light on the lit edge
  g.save();g.globalAlpha=A;g.globalCompositeOperation='lighter';g.lineWidth=Math.max(1.2,r*.025);const rim=g.createLinearGradient(x-r*.8,y-r*.8,x+r*.6,y+r*.6);rim.addColorStop(0,'rgba('+c+','+(.55+.3*p.hv)+')');rim.addColorStop(.5,'rgba('+c+',.08)');rim.addColorStop(1,'rgba('+c+',0)');g.strokeStyle=rim;g.beginPath();g.arc(x,y,r-g.lineWidth/2,0,TAU);g.stroke();g.restore();
  // veil for worlds that have never been entered
  if(p.veil&&!p.plaza){g.save();g.globalAlpha=A*.9;g.setLineDash([4*D,7*D]);g.lineDashOffset=-t*6;g.strokeStyle='rgba(190,205,255,.55)';g.lineWidth=1.3*D;g.beginPath();g.arc(x,y,r*1.14,0,TAU);g.stroke();g.setLineDash([]);
   if(!reduce()){g.fillStyle='rgba(220,230,255,'+(.18+.14*Math.sin(t*2+p.R)).toFixed(2)+')';for(let i=0;i<5;i++){const a=t*.25+i*1.26,rx=x+Math.cos(a)*r*1.14,ry=y+Math.sin(a)*r*1.14;g.beginPath();g.arc(rx,ry,2*D,0,TAU);g.fill()}}g.restore()}
  // reveal flash after the first visit
  const rv=p.rec&&p.rec.rev?(now-p.rec.rev)/1800:2;if(rv>=0&&rv<1&&p.rec.rev>S.openAt){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=(1-rv)*.7;g.strokeStyle='rgba('+c+',1)';g.lineWidth=3*D;g.beginPath();g.arc(x,y,r*(1.05+rv*.9),0,TAU);g.stroke();g.restore()}
  // unexplored / current / selected markers
  if(!lowfx()){g.globalAlpha=A;drawRing(p,x,y,r,true);drawOrbiters(p,x,y,r,t,true)}
  if(p.plaza&&db.m.claimed&&db.m.claimed[10]){g.save();g.globalAlpha=A*.8;g.strokeStyle='rgba(255,226,140,.8)';g.lineWidth=1.5*D;g.beginPath();g.ellipse(x,y,r*2.15,r*.62,-.3,0,TAU);g.stroke();g.restore()}
  if(entered&&cur==p.id){const k=.5+.5*Math.sin(t*2.4);g.save();g.globalAlpha=A*(.45+.35*k);g.fillStyle='#fff';g.shadowColor='rgba('+c+',1)';g.shadowBlur=10*D;g.beginPath();g.arc(x+r*.82,y-r*.82,3.2*D,0,TAU);g.fill();g.restore()}
  g.restore();
  // label
  if(r>22*D&&p!==S.pv&&!(S.mode!='overview'&&S.sel==p.id)){const big=S.sel==p.id,ly=y+r*(big?1.28:1.22)+16*D,a=cl(A*(S.mode=='overview'?1:big?.95:.55),0,1);if(a>.02){g.save();g.globalAlpha=a;g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=8*D;
    lbl(p.label.toUpperCase(),x,ly,Math.round(clampPx(r*.2,12,17)*D),'#fff','600',2.2*D);
    const sub=p.plaza?'Shared hub':p.err?'Could not load':p.stat&&p.stat.bad?'Save unreadable':p.explored?THEMES[p.theme].name:'Unexplored';
    lbl(sub,x,ly+15*D,Math.round(clampPx(r*.14,10,12)*D),'rgba('+c+',.95)','500',1*D);g.restore()}}}
 const clampPx=(v,a,b)=>cl(v/D,a,b);
 // ------------------------------------------------------------ frame
 function sparkAt(x,y,col,n,sp){for(let i=0;i<n&&S.sparks.length<90;i++){const a=Math.random()*TAU,s=(20+Math.random()*60)*(sp||1);S.sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-10,l:1,c:col})}}
 function frame(now){if(!open)return;raf=requestAnimationFrame(frame);const fps=reduce()?8:lowfx()?24:36;if(now-last<1000/fps)return;const dt=Math.min(.1,(now-last)/1000);last=now;fit();const t=reduce()?3:(now-t0)/1000;
  // texture generation (one per frame so nothing stalls)
  try{PLG7.pump(7)}catch(e){console.error('PLG7',e)}
  budget=lowfx()?1:2;stepCam(dt);boost=1;
  // transitions
  let veilA=0,veilC='255,255,255';
  if(S.ent){const e=(now-S.ent.t0)/(reduce()?350:1150),p=byId(S.ent.id);S.ent.e=e;
   if(p){const k=ease(Math.min(1,e/.85));boost=reduce()?1:Math.exp(Math.log(16)*k*k);S.tax=lerp(S.ax,.5,.1);S.tay=lerp(S.ay,.5,.1);veilC=p.T.atm.join(',');veilA=cl((e-.45)/.4,0,1)}
   if(!S.ent.done&&(e>=.78||S.ent.skip)){S.ent.done=now;doEnter(S.ent.id)}
   if(S.ent.done){const f=(now-S.ent.done)/(S.ent.skip||reduce()?200:420);veilA=1;el.style.opacity=String(1-cl(f,0,1));if(f>=1&&S.ent.ok)finishClose();else if(f>=1&&!S.ent.ok){S.ent=null;el.style.opacity='1'}}}
  else if(S.arr){const e=(now-S.arr.t0)/(reduce()?350:1000);boost=reduce()?1:Math.exp(Math.log(16)*(1-ease(e)));veilA=1-ease(Math.min(1,e*1.15));const p=byId(S.arr.id);if(p)veilC=p.T.atm.join(',');if(e>=1){S.arr=null;boost=1}}
  // backdrop
  const px=-(S.cam.x*S.cam.z)*.6,py=-(S.cam.y*S.cam.z)*.6,fp=S.sel&&byId(S.sel),pp=S.mode=='create'&&S.pv?S.pv:fp;
  PLG7.drawBackdrop(g,W,H,t,px,py,reduce(),pp?{x:sx(pp),y:sy(pp),r:Math.max(W,H)*.55,c:pp.T.atm.join(','),a:.09}:null);
  // orbit paths + constellation lines
  const hasDash=typeof g.setLineDash=='function';
  if(S.lines&&S.planets.length&&!S.form){g.save();g.lineWidth=1*D;const cx0=sx({x:0,y:0}),cy0=sy({x:0,y:0});
   g.strokeStyle='rgba(170,185,255,.07)';for(const p of S.planets){if(p.plaza)continue;const rr=Math.hypot(p.x,p.y/.82)*S.cam.z*boost;g.beginPath();g.ellipse(cx0,cy0,rr,rr*.82,0,0,TAU);g.stroke()}
   g.strokeStyle='rgba(190,205,255,'+(S.mode=='overview'?.3:.12)+')';if(hasDash)g.setLineDash([5*D,8*D]);
   for(const p of S.planets){const q=p.link&&byId(p.link);if(!q)continue;g.beginPath();g.moveTo(sx(q),sy(q));g.lineTo(sx(p),sy(p));g.stroke();
    const mx=(sx(q)+sx(p))/2,my=(sy(q)+sy(p))/2;g.fillStyle='rgba(220,230,255,.5)';g.fillRect(mx-1.5*D,my-1.5*D,3*D,3*D)}if(hasDash)g.setLineDash([]);g.restore()}
  // hover easing
  for(const p of S.planets){const th=S.hov==p.id&&!S.ent?1:0,ts=S.sel==p.id?1:0;p.hv+=(th-p.hv)*Math.min(1,dt*9);p.sl+=(ts-p.sl)*Math.min(1,dt*7)}
  const list=S.planets.slice().sort((a,b)=>a.hv+a.sl-b.hv-b.sl);
  for(const p of list){if(S.form&&S.form.p===p)continue;drawPlanet(p,now,t)}
  if(S.pv)drawPreview(now,t);
  // sparks
  if(S.sparks.length){g.save();g.globalCompositeOperation='lighter';for(let i=S.sparks.length-1;i>=0;i--){const s=S.sparks[i];s.l-=dt*1.6;if(s.l<=0){S.sparks.splice(i,1);continue}s.x+=s.vx*dt;s.y+=s.vy*dt;g.fillStyle='rgba('+s.c+','+(s.l*.8).toFixed(2)+')';g.beginPath();g.arc(s.x,s.y,(1+s.l*1.6)*D,0,TAU);g.fill()}g.restore()}
  // streaks while travelling
  if(S.ent&&!reduce()){const e=S.ent.e||0,n=lowfx()?26:50;g.save();g.globalCompositeOperation='lighter';const cx=W*S.ax,cy=H*S.ay;for(let i=0;i<n;i++){const a=i*2.399+hs(S.ent.id)%7,sp=cl((e-.1)/.7,0,1),r0=(60+((i*53)%140))*D*(1+sp*8)*Math.max(.3,sp),r1=r0+sp*(120+(i%7)*40)*D;if(sp<=0)continue;g.strokeStyle='rgba(255,255,255,'+(.05+.35*sp*(i%3?.6:1))+')';g.lineWidth=(1+(i%3))*D*.8;g.beginPath();g.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);g.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);g.stroke()}g.restore()}
  if(S.form)drawForm(now,t);
  if(veilA>.01){const gr=g.createRadialGradient(W*S.ax,H*S.ay,0,W*S.ax,H*S.ay,Math.hypot(W,H)*.6);gr.addColorStop(0,'rgba(255,255,255,'+veilA*.96+')');gr.addColorStop(.55,'rgba('+veilC+','+veilA*.9+')');gr.addColorStop(1,'rgba('+veilC+','+veilA+')');g.fillStyle=gr;g.fillRect(0,0,W,H)}}
 function fit(){const d=Math.min(lowfx()?1:1.5,window.devicePixelRatio||1),w=Math.max(320,innerWidth*d|0),h=Math.max(240,innerHeight*d|0);const first=!W,ch=cv.width!=w||cv.height!=h||D!=d;D=d;if(ch){cv.width=w;cv.height=h}W=w;H=h;if(ch&&!first)relayout()}
 function relayout(){if(S.mode=='overview')viewOverview(true);else if(S.sel&&byId(S.sel))viewPlanet(byId(S.sel),true);else if(S.pv)viewPlanet(S.pv,true)}
 // ------------------------------------------------------------ world creation preview / formation
 function newPlanet(id,theme){const h=hs(id||'newworld'),P=slot(freeIx());const T=THEMES[theme];const p={id:id||'?',plaza:false,label:id||'New world',theme,T,variant:h%3,tilt:[-.38,-.17,.08,.27,.46][(h>>3)%5],rot0:(h%1000)/1000,spd:.008,R:90,x:P.x,y:P.y,rec:null,auto:false,stat:null,cv:null,cx:null,img:null,N:0,spT:0,fade:0,hv:0,sl:1,bits:[],moons:[],born:0,veil:0,err:0,explored:true};
  const nb=lowfx()||reduce()?(reduce()?0:4):9;for(let i=0;i<nb;i++)p.bits.push({a:(i/nb)*TAU,rad:1.3+(i%4)*.08,sp:(.2+(i%3)*.06)*(i%2?1:-1),sz:1.8+(i%3)*.6,k:i*1.9,tilt:(i%3-1)*.2});for(const m of T.moons)p.moons.push({rad:m[0],size:m[1],col:m[2],sp:m[3],a:(h%628)/100});return p}
 function setPreview(theme,name){const id=cleanId(name)||'';if(S.pv&&S.pv.theme==theme){S.pv.id=id||'?';S.pv.label=id||'New world';const h=hs(id||'newworld');S.pv.variant=h%3;S.pv.rot0=(h%1000)/1000;return}
  const old=S.pv;S.pv=newPlanet(id,theme);S.pv.oldCv=old&&old.cv?old.cv:null;S.pv.swapT=performance.now();S.pv.fade=old?1:0}
 function drawPreview(now,t){const p=S.pv;if(!p)return;p.hv=.5;const tx=ensureTex(p);const r=sr(p),x=sx(p),y=sy(p);
  // empty region marker
  g.save();g.strokeStyle='rgba(200,215,255,.35)';g.lineWidth=1.2*D;if(g.setLineDash)g.setLineDash([3*D,7*D]);g.beginPath();g.arc(x,y,r*1.5,0,TAU);g.stroke();g.restore();
  if(S.form)return;
  drawPlanet(p,now,t);
  // crossfade from the previous theme
  const k=(now-p.swapT)/450;if(p.oldCv&&k<1){g.save();g.globalAlpha=1-ease(k);g.beginPath();g.arc(x,y,r,0,TAU);g.clip();g.drawImage(p.oldCv,x-r,y-r,r*2,r*2);g.restore()}else if(p.oldCv&&k>=1)p.oldCv=null}
 function drawForm(now,t){const f=S.form,p=f.p,e=(now-f.t0)/(reduce()?500:1900);if(e>=1){S.form=null;return}
  const x=sx(p),y=sy(p),R=p.R*S.cam.z;
  // particles converge on the centre, then the planet blooms into view
  const conv=ease(Math.min(1,e/.62)),n=lowfx()?40:90;g.save();g.globalCompositeOperation='lighter';const c=p.T.atm.join(',');
  for(let i=0;i<n;i++){const a=i*2.399+f.seed,r0=R*(2.8+((i*37)%11)*.28),rr=lerp(r0,R*.05,conv),sw=a+conv*1.4;g.fillStyle='rgba('+c+','+((1-conv*.6)*.8).toFixed(2)+')';g.beginPath();g.arc(x+Math.cos(sw)*rr,y+Math.sin(sw)*rr*.8,(1+(i%3))*D*(1+(1-conv)),0,TAU);g.fill()}
  const core=g.createRadialGradient(x,y,0,x,y,R*(.6+conv*.9));core.addColorStop(0,'rgba(255,255,255,'+(.4+.5*conv*(1-ease((e-.6)/.4)))+')');core.addColorStop(1,'rgba('+c+',0)');g.fillStyle=core;g.beginPath();g.arc(x,y,R*1.6,0,TAU);g.fill();g.restore();
  if(e>.5){const k=ease((e-.5)/.5);const keep=p.hv;p.fade=1;p.sl=1;const sc=.2+.8*(1-Math.pow(1-k,3))*(1+Math.sin(k*Math.PI)*.06);const oR=p.R;p.R=oR*sc;g.save();g.globalAlpha=k;drawPlanet(p,now,t);g.restore();p.R=oR;p.hv=keep}}
 // ------------------------------------------------------------ actions
 function cleanId(s){return String(s||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)}
 function fmtTime(ts){if(!ts)return'';const d=new Date(ts),n=new Date(),same=d.toDateString()==n.toDateString();try{return same?'Today '+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString([], {day:'numeric',month:'short',year:'numeric'})}catch(_){return d.toISOString().slice(0,10)}}
 function toast(m,undo){const t=el.querySelector('#plnToast');t.innerHTML=esc(m)+(undo?' <button data-a="undo">Undo</button>':'');t.classList.add('on');clearTimeout(S.toastT);S.toastT=setTimeout(()=>t.classList.remove('on'),undo?12000:3800)}
 function select(id,quiet){const p=byId(id);if(!p||S.ent||S.form)return;if(S.sel==id&&S.mode=='focus')return;S.sel=id;S.mode='focus';S.renaming=false;S.creating=false;S.pv=null;if(!quiet)AU.select();
  if(entered&&id==cur)flush();if(p.stat||!p.plaza)p.stat=p.plaza?null:readSave(id);viewPlanet(p);if(p.rec&&!p.rec.disc){p.rec.disc=1;save();AU.discover();toast('New world discovered: '+p.label)}renderPanels();sparkAt(sx(p),sy(p),p.T.atm.join(','),10)}
 function overview(){if(S.ent||S.form)return;S.sel=null;S.mode='overview';S.pv=null;S.creating=false;S.renaming=false;viewOverview();renderPanels();AU.back()}
 function step(d){const l=order();if(!l.length)return;let i=l.findIndex(p=>p.id==S.sel);i=i<0?(d>0?0:l.length-1):(i+d+l.length)%l.length;select(l[i].id)}
 function go(id){const p=byId(id);if(!p||S.ent||S.form)return;if(S.creating){}S.mode='entering';S.sel=id;S.renaming=false;viewPlanet(p);AU.enter();S.ent={id,t0:performance.now(),done:0,skip:0,ok:0};renderPanels();hint()}
 function prepare(id){const r=db.w[id];if(r&&r.fresh){const sky=PLG7.SKY[r.theme];if(sky&&!skyOf(id)&&!online()){try{X6.wx[id]=sky;x6Save()}catch(_){}}r.fresh=0;save()}}
 function doEnter(id){const prev=entered?cur:null;try{flush();prepare(id);enterWorld(id);if(!entered||(!online()&&cur!=id))throw new Error('The world did not load');S.ent.ok=1;try{menuEl.style.display='none'}catch(_){}}
  catch(err){console.error('PLN7 enter',err);S.ent.ok=0;const p=byId(id);if(p)p.err=1;try{if(prev&&cur!=prev)loadWorld(prev)}catch(_){}S.mode='focus';toast('Could not load '+labelOf(id)+'. Your other worlds are untouched.');AU.error();S.ent.done=performance.now();S.ent.skip=1;renderPanels()}}
 function skip(){if(S.ent&&!S.ent.done)S.ent.skip=1;if(S.arr)S.arr.t0=-1e9;if(S.form)S.form.t0=-1e9}
 function finishClose(){S.ent=null;close(true)}
 // rename / delete / settings
 function rename(id,v){const r=db.w[id];if(!r)return;v=String(v||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,24);r.label=v==id?'':v;save();const p=byId(id);if(p)p.label=labelOf(id);S.renaming=false;renderPanels();buildDock();toast('Renamed. The world id stays “'+id+'”.')}
 let lastDel=null;
 function removeWorld(id){const key='rbw_'+id,raw=(()=>{try{return localStorage.getItem(key)}catch(_){return null}})();
  lastDel={id,raw,rec:db.w[id],idx:recentsL().indexOf(id),wx:skyOf(id)};
  try{localStorage.removeItem(key);const rc=recents().filter(x=>x!=id);localStorage.setItem('rbidx',JSON.stringify(rc));delete db.w[id];save();if(X6.wx&&X6.wx[id]){delete X6.wx[id];x6Save()}}catch(e){console.error(e);toast('Could not delete this world.');return false}
  S.sel=null;S.mode='overview';buildPlanets();viewOverview();renderPanels();buildDock();toast('Deleted “'+id+'”.',true);AU.back();return true}
 function undoDelete(){const d=lastDel;if(!d)return;lastDel=null;try{if(d.raw!=null)localStorage.setItem('rbw_'+d.id,d.raw);if(d.rec)db.w[d.id]=d.rec;const rc=recents().filter(x=>x!=d.id);rc.splice(Math.max(0,d.idx),0,d.id);localStorage.setItem('rbidx',JSON.stringify(rc.slice(0,12)));save();if(d.wx){X6.wx[d.id]=d.wx;x6Save()}}catch(_){}
  buildPlanets();renderPanels();buildDock();viewOverview();select(d.id,true);toast('Restored “'+d.id+'”.')}
 function setTheme(id,th){const r=db.w[id];if(!r||!THEMES[th]||th=='plaza')return;r.theme=th;save();const p=byId(id);buildPlanets();renderPanels();buildDock()}
 function applySky(id){const r=db.w[id],th=themeOf(id),sky=PLG7.SKY[th];if(!r||!sky||online()){toast(online()?'Skies of online worlds belong to the server.':'This theme has no special sky.');return}
  try{X6.wx[id]=sky;x6Save();if(entered&&cur==id)ENV7.set(sky,{by:myName})}catch(_){}buildPlanets();renderPanels();toast('Sky set to '+ENV7.names[sky]+'.')}
 function create(name,theme){const id=cleanId(name);const err=m=>{toast(m);AU.error();return false};
  if(!id)return err('Give your world a name (letters, numbers, - or _).');if(id=='plaza')return err('“plaza” is reserved for the shared hub.');if(!THEMES[theme]||theme=='plaza')return err('Choose a world theme first.');
  if(ids().includes(id))return err('A world named “'+id+'” already exists. Pick another name, or open it from the atlas.');
  const prevDb=JSON.stringify(db);let ok=false;
  try{localStorage.setItem('rbw_'+id,'{}');if(localStorage.getItem('rbw_'+id)!=='{}')throw new Error('write check failed');
   const rc=recents().filter(x=>x!=id);rc.unshift(id);localStorage.setItem('rbidx',JSON.stringify(rc.slice(0,12)));
   db.w[id]={theme,label:'',ix:freeIx(),created:Date.now(),last:0,plays:0,disc:1,ent:0,fresh:PLG7.SKY[theme]?1:0,rev:0};if(!save())throw new Error('could not save the planet record');ok=true}
  catch(e){console.error('PLN7 create',e);try{localStorage.removeItem('rbw_'+id)}catch(_){}try{db=JSON.parse(prevDb)}catch(_){}return err('Could not save the new world on this device. Your existing worlds are untouched.')}
  buildPlanets();buildDock();const p=byId(id);S.pv=null;S.creating=false;S.sel=id;S.mode='focus';p.fade=1;S.form={p,t0:performance.now(),seed:hs(id)%100};viewPlanet(p);AU.form();renderPanels();
  setTimeout(()=>{if(open&&S.sel==id){select(id,true);const b=el.querySelector('[data-a=enter]');if(b)b.focus({preventScroll:true})}},reduce()?560:1950);return true}
 // ------------------------------------------------------------ DOM
 function build(){if(el)return;el=document.createElement('div');el.id='pln';el.className='pln';el.setAttribute('role','dialog');el.setAttribute('aria-label','Star Atlas: choose a world');
  el.innerHTML='<canvas id="plnCv" aria-hidden="true"></canvas>'
   +'<header class="plnTop"><div class="plnLogo"><b>STAR ATLAS</b><i>YOUR WORLDS</i></div><div class="plnBtns"><button data-a="atlas" id="plnAtlasBtn" aria-expanded="false">Atlas</button><button data-a="lines" aria-pressed="true">Constellations</button><button data-a="close" aria-label="Close the atlas">✕</button></div></header>'
   +'<aside id="plnInfo" class="plnPanel" aria-live="polite"></aside><aside id="plnNew" class="plnPanel"></aside><aside id="plnAtlas" class="plnPop"></aside>'
   +'<nav id="plnDock" aria-label="Worlds"></nav><div id="plnHint"></div><div id="plnToast" role="status"></div><div id="plnModal"></div>';
  document.body.appendChild(el);cv=el.querySelector('#plnCv');g=cv.getContext('2d');
  try{LF=getComputedStyle(document.body).fontFamily||LF}catch(_){}
  el.addEventListener('click',onClick);el.addEventListener('input',onInput);el.addEventListener('keydown',onFieldKey);
  for(const ev of['mousedown','mouseup','touchstart','contextmenu','wheel'])el.addEventListener(ev,e=>{e.stopPropagation()},{passive:true});
  cv.addEventListener('pointerdown',pDown);addEventListener('pointermove',pMove);addEventListener('pointerup',pUp);cv.addEventListener('wheel',onWheel,{passive:false});
  el.addEventListener('pointerover',e=>{const b=e.target.closest&&e.target.closest('button:not(:disabled)');if(b&&b!==el._hb){el._hb=b;AU.tick()}});
  addEventListener('keydown',onKey,true);addEventListener('resize',()=>{if(open)fit()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else if(open){last=0;raf=requestAnimationFrame(frame)}})}
 function hint(){const h=el.querySelector('#plnHint');h.textContent=S.ent?'Click or press any key to skip':S.mode=='create'?'Pick a theme, name your world, then press Form planet':S.mode=='focus'?'Enter: travel · ← → other worlds · Esc: back to the atlas':'Click a planet · Tab or ← → to move · N: new world · Esc: close'}
 function buildDock(){const d=el.querySelector('#plnDock');d.innerHTML=S.planets.map(p=>'<button data-id="'+esc(p.id)+'" class="'+(S.sel==p.id?'on':'')+(entered&&cur==p.id?' cur':'')+'" style="--c:rgb('+p.T.atm.join(',')+')"><i></i><span>'+esc(p.label)+'</span></button>').join('')+'<button data-a="new" class="plus">＋ New world</button>'}
 function panelStat(p){const s=p.stat,rows=[];const sky=skyOf(p.id);
  rows.push(['Type',esc(THEMES[p.theme].name)+(p.auto?' <small>(assigned from the name)</small>':'')]);
  rows.push(['Sky',sky&&ENV7.names[sky]?esc(ENV7.names[sky]):'Natural skies']);
  if(p.plaza){rows.push(['Last visit',db.m.plazaLast?fmtTime(db.m.plazaLast):'Not recorded yet']);rows.push(['Protected',"Yes: shared hub, can't be changed or deleted"])}
  else{const r=p.rec;rows.push(['Status',p.explored?'Visited':'Not entered yet']);rows.push(['Last played',r.last?fmtTime(r.last)+(r.plays>1?' · '+r.plays+' visits':''):p.explored?'Before the atlas was added':'Never']);
   if(s&&s.bad)rows.push(['Save','<span class="warn">Unreadable. Entering starts this world fresh.</span>']);else if(s&&!s.empty){rows.push(['Blocks changed',String(s.blocks)]);if(s.objs)rows.push(['Objects placed',String(s.objs)]);if(s.owner)rows.push(['Claimed by',esc(s.owner)])}else if(s)rows.push(['Blocks changed','0']);
   if(r.created)rows.push(['Created',fmtTime(r.created)])}
  return rows.map(r=>'<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>').join('')}
 function renderPanels(){if(!el)return;const info=el.querySelector('#plnInfo'),nw=el.querySelector('#plnNew');const p=S.sel&&byId(S.sel);
  el.classList.toggle('hasInfo',!!p&&S.mode!='entering'&&!S.pv);el.classList.toggle('hasNew',S.mode=='create');el.classList.toggle('busy',!!(S.ent||S.form));
  if(p&&S.mode!='create'){const cur_=entered&&cur==p.id,name=esc(p.label);
   let h='<div class="pk" style="--c:rgb('+p.T.atm.join(',')+')"><i></i>'+(p.plaza?'SHARED HUB':p.explored?'WORLD':'UNEXPLORED WORLD')+(cur_?' · YOU ARE HERE':'')+'</div>';
   if(S.renaming)h+='<div class="rn"><input id="plnRn" maxlength="24" value="'+esc(p.rec&&p.rec.label||'')+'" placeholder="'+esc(p.id)+'" aria-label="World display name"><button data-a="rnOk">Save</button><button data-a="rnNo">Cancel</button></div>';
   else h+='<h2>'+name+'</h2>';
   h+='<div class="pid">'+(p.plaza?'plaza':'id: '+esc(p.id))+'</div><p class="blurb">'+esc(THEMES[p.theme].blurb)+'</p><dl>'+panelStat(p)+'</dl>';
   h+='<div class="acts"><button class="pri" data-a="enter">'+(cur_?'Return to this world':p.explored||p.plaza?'Enter World':'Explore this world')+'</button>';
   if(!p.plaza)h+='<button data-a="settings" aria-expanded="'+(S.settings?'true':'false')+'">World settings</button><button data-a="rename">Rename</button><button class="dng" data-a="del">Delete…</button>';h+='</div>';
   if(S.settings&&!p.plaza)h+=settingsHtml(p);
   h+='<div class="note">'+(p.plaza?'':'Renaming changes the display name only. The land is generated from the id, so the id stays. ')+(online()?'Signed-in worlds are kept by the server; this atlas only shows what is on this device.':'Everything here is stored on this device.')+'</div>';
   info.innerHTML=h;const rn=info.querySelector('#plnRn');if(rn){rn.focus();rn.select()}}else info.innerHTML='';
  if(S.mode=='create')renderNew();else nw.innerHTML='';buildDock();hint();renderAtlasBtn()}
 function settingsHtml(p){const r=p.rec,sky=PLG7.SKY[p.theme];return'<div class="set"><h4>Appearance theme</h4><div class="chips">'+ORDER.map(k=>'<button data-th="'+k+'" class="'+(r.theme==k||(!r.theme&&k==p.theme)?'on':'')+'">'+esc(THEMES[k].name)+'</button>').join('')+'</div>'
  +'<p class="dim">The theme is how this planet looks in the atlas. A world’s sky only changes through its Weather Machine'+(sky?', or here:':'.')+'</p>'+(sky?'<button data-a="sky">Give this world its '+esc(ENV7.names[sky])+' sky</button>':'')
  +(entered&&cur==p.id?'<button data-a="inworld">Open in-world settings</button>':'')+'</div>'}
 function renderNew(){const nw=el.querySelector('#plnNew'),th=S.newTheme||'verdant',name=S.newName||'',id=cleanId(name),dup=id&&(ids().includes(id)||id=='plaza');
  nw.innerHTML='<div class="pk"><i></i>FORM A NEW WORLD</div><h2>New planet</h2><label for="plnName">World name</label><div class="nm"><input id="plnName" maxlength="16" value="'+esc(name)+'" placeholder="e.g. sakuragrove" autocomplete="off" spellcheck="false"><button data-a="dice" title="Random name" aria-label="Random name">🎲</button></div>'
   +'<div class="pid" id="plnIdv">'+(id?(dup?'<span class="warn">“'+esc(id)+'” already exists</span>':'world id: '+esc(id)):'Letters, numbers, - and _ only')+'</div>'
   +'<label>Theme</label><div class="themes">'+ORDER.map(k=>'<button data-nth="'+k+'" class="'+(k==th?'on':'')+'" style="--c:rgb('+THEMES[k].atm.join(',')+')"><i></i>'+esc(THEMES[k].name)+'</button>').join('')+'</div>'
   +'<p class="blurb" id="plnTb">'+esc(THEMES[th].blurb)+'</p><div class="info2">'+(PLG7.SKY[th]?'Starts with the <b>'+esc(ENV7.names[PLG7.SKY[th]])+'</b> sky.':'Starts with natural skies and weather.')+' The land is generated from the name: the same name always gives the same terrain.</div>'
   +'<div class="acts"><button class="pri" data-a="form"'+(id&&!dup?'':' disabled')+'>Form planet</button><button data-a="cancelNew">Cancel</button></div>'}
 function renderAtlas(){const a=el.querySelector('#plnAtlas'),ex=explored(),all=['plaza'].concat(ORDER),c=ex.size;
  a.innerHTML='<h3>Star Atlas</h3><p class="dim">World types you have really entered: <b>'+c+' / '+all.length+'</b></p><ul>'+all.map(k=>'<li class="'+(ex.has(k)?'ok':'')+'"><i style="background:rgb('+THEMES[k].atm.join(',')+')"></i>'+esc(THEMES[k].name)+'<span>'+(ex.has(k)?'✓':'—')+'</span></li>').join('')+'</ul>'
   +'<h4>Milestones</h4>'+MILES.map(([n,gm])=>'<div class="ms '+(db.m.claimed[n]?'ok':'')+'">'+n+' types · '+(srv()?'badge':gm+' gems')+(n==10?' · title “Star Cartographer”':'')+'<span>'+(db.m.claimed[n]?'claimed':c+'/'+n)+'</span></div>').join('')
   +'<p class="dim">'+(srv()?'Signed-in wallets are server-owned, so gem rewards are only paid in offline play.':'Rewards are paid once, offline.')+'</p>'}
 function renderAtlasBtn(){const b=el&&el.querySelector('#plnAtlasBtn');if(b)b.textContent='Atlas '+explored().size+'/'+(ORDER.length+1)}
 // ------------------------------------------------------------ input
 function pt(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*(cv.width/r.width),y:(e.clientY-r.top)*(cv.height/r.height)}}
 function hit(x,y){let best=null,bd=1e9;for(const p of S.planets){const dx=x-sx(p),dy=y-sy(p),r=sr(p)+10*D,d=Math.hypot(dx,dy);if(d<r&&d<bd){best=p;bd=d}}return best}
 function pDown(e){if(S.ent){skip();return}if(S.form){skip();return}const q=pt(e),h=S.mode=='create'?null:hit(q.x,q.y);S.drag={x:q.x,y:q.y,moved:0,hit:h,ox:S.tgt.x,oy:S.tgt.y};try{cv.setPointerCapture(e.pointerId)}catch(_){}}
 function pMove(e){if(!open||!cv)return;const q=pt(e);S.mouse=q;
  if(S.drag){const d=S.drag,dx=q.x-d.x,dy=q.y-d.y;if(Math.hypot(dx,dy)>6*D)d.moved=1;if(d.moved&&S.mode=='overview'&&!d.hit){S.tgt.x=d.ox-dx/S.cam.z;S.tgt.y=d.oy-dy/S.cam.z;S.cam.x=S.tgt.x;S.cam.y=S.tgt.y}}
  else{const over=e.target===cv,h=over&&S.mode!='create'?hit(q.x,q.y):null,id=h?h.id:null;if(id!=S.hov){S.hov=id;cv.style.cursor=id?'pointer':'default';if(h){AU.hover(h.T.n);sparkAt(sx(h)+Math.cos(1)*sr(h)*.7,sy(h)-sr(h)*.7,h.T.atm.join(','),5,.8)}}}}
 function pUp(e){if(!S.drag)return;const d=S.drag;S.drag=null;if(!open)return;if(!d.moved){if(d.hit){const nw=performance.now(),dbl=S.lc&&S.lc.id==d.hit.id&&nw-S.lc.t<420;S.lc={id:d.hit.id,t:nw};if(dbl&&S.mode=='focus'&&S.sel==d.hit.id)go(d.hit.id);else select(d.hit.id)}else if(S.mode=='focus')overview()}}
 function onWheel(e){if(S.mode!='overview'){e.preventDefault();return}e.preventDefault();S.tgt.z=cl(S.tgt.z*Math.exp(-e.deltaY*.0012),.12*D,2.6*D)}
 function onClick(e){const a=e.target.closest('[data-a],[data-id],[data-th],[data-nth]');if(!a)return;
  if(a.dataset.id){select(a.dataset.id);return}
  if(a.dataset.th){setTheme(S.sel,a.dataset.th);AU.select();return}
  if(a.dataset.nth){S.newTheme=a.dataset.nth;setPreview(S.newTheme,S.newName);renderNew();AU.select();return}
  const k=a.dataset.a;
  if(k=='close'){close()}else if(k=='atlas'){const p=el.querySelector('#plnAtlas'),on=!p.classList.contains('on');if(on)renderAtlas();p.classList.toggle('on',on);a.setAttribute('aria-expanded',on?'true':'false');AU.select()}
  else if(k=='lines'){S.lines=!S.lines;a.setAttribute('aria-pressed',S.lines?'true':'false');AU.tick()}
  else if(k=='enter'){if(S.sel)go(S.sel)}
  else if(k=='new'){openCreate()}
  else if(k=='cancelNew'){overview()}
  else if(k=='dice'){const w1=['sakura','lumen','aster','mochi','nova','hoshi','kumo','yuki','ember','tide'],w2=['grove','reach','haven','drift','isle','garden','veil','peak','cove','bloom'];S.newName=w1[Math.random()*10|0]+w2[Math.random()*10|0];setPreview(S.newTheme||'verdant',S.newName);renderNew();AU.select()}
  else if(k=='form'){create(S.newName,S.newTheme||'verdant')}
  else if(k=='rename'){S.renaming=true;renderPanels()}
  else if(k=='rnOk'){const i=el.querySelector('#plnRn');rename(S.sel,i&&i.value)}
  else if(k=='rnNo'){S.renaming=false;renderPanels()}
  else if(k=='settings'){S.settings=!S.settings;renderPanels()}
  else if(k=='sky'){applySky(S.sel)}
  else if(k=='inworld'){try{close();UI6.open('world')}catch(_){}}
  else if(k=='del'){askDelete(S.sel)}
  else if(k=='delNo'){el.querySelector('#plnModal').classList.remove('on')}
  else if(k=='delYes'){const id=el.querySelector('#plnModal').dataset.id;el.querySelector('#plnModal').classList.remove('on');removeWorld(id)}
  else if(k=='undo'){undoDelete()}}
 function askDelete(id){const p=byId(id);if(!p||p.plaza)return;const m=el.querySelector('#plnModal');
  if(entered&&cur==id){toast('You are inside this world right now. Travel somewhere else first, then delete it.');AU.error();return}
  m.dataset.id=id;const bl=p.stat&&p.stat.blocks?p.stat.blocks:0;
  m.innerHTML='<div class="card" role="alertdialog" aria-label="Delete world"><h3>Delete “'+esc(p.label)+'”?</h3><p>This permanently erases the saved changes of this world from this device'+(bl?' ('+bl+' blocks changed'+(p.stat.objs?', '+p.stat.objs+' objects':'')+')':'')+'. Your character, items and other worlds are not touched.</p><label for="plnDelIn">Type <b>'+esc(id)+'</b> to confirm</label><input id="plnDelIn" autocomplete="off" spellcheck="false"><div class="acts"><button data-a="delNo">Keep it</button><button class="dng" data-a="delYes" disabled>Delete forever</button></div></div>';
  m.classList.add('on');setTimeout(()=>{const i=m.querySelector('input');i&&i.focus()},30)}
 function onInput(e){if(e.target.id=='plnDelIn'){const b=el.querySelector('[data-a=delYes]');b.disabled=e.target.value.trim().toLowerCase()!=el.querySelector('#plnModal').dataset.id}
  else if(e.target.id=='plnName'){S.newName=e.target.value;const id=cleanId(S.newName),dup=id&&(ids().includes(id)||id=='plaza');setPreview(S.newTheme||'verdant',S.newName);el.querySelector('#plnIdv').innerHTML=id?(dup?'<span class="warn">“'+esc(id)+'” already exists</span>':'world id: '+esc(id)):'Letters, numbers, - and _ only';el.querySelector('[data-a=form]').disabled=!id||dup}}
 function onFieldKey(e){if(e.target.tagName!='INPUT')return;if(e.key=='Enter'){e.preventDefault();e.stopPropagation();if(e.target.id=='plnRn')rename(S.sel,e.target.value);else if(e.target.id=='plnName'){const b=el.querySelector('[data-a=form]');if(b&&!b.disabled)b.click()}else if(e.target.id=='plnDelIn'){const b=el.querySelector('[data-a=delYes]');if(b&&!b.disabled)b.click()}}else if(e.key=='Escape'){e.preventDefault();e.stopPropagation();if(e.target.id=='plnRn'){S.renaming=false;renderPanels()}else if(e.target.id=='plnDelIn')el.querySelector('#plnModal').classList.remove('on');else overview()}}
 function onKey(e){if(!open)return;if(e.target&&e.target.tagName=='INPUT'){onFieldKey(e);e.stopPropagation();return}
  const k=e.key;if(S.ent||S.form){if(k!='Tab'&&k!='Shift'&&k!='Control'&&k!='Alt'&&k!='Meta'){skip();e.preventDefault();e.stopPropagation()}return}
  if(el.querySelector('#plnModal').classList.contains('on')){if(k=='Escape'){el.querySelector('#plnModal').classList.remove('on');e.preventDefault();e.stopPropagation()}return}
  if(k=='Escape'){e.preventDefault();e.stopPropagation();const at=el.querySelector('#plnAtlas');if(at.classList.contains('on')){at.classList.remove('on');return}if(S.mode=='focus'||S.mode=='create')overview();else close()}
  else if(k=='ArrowRight'||k=='ArrowDown'){if(S.mode!='create'){step(1);e.preventDefault();e.stopPropagation()}}
  else if(k=='ArrowLeft'||k=='ArrowUp'){if(S.mode!='create'){step(-1);e.preventDefault();e.stopPropagation()}}
  else if(k=='Enter'&&S.mode=='focus'&&!(e.target.closest&&e.target.closest('button'))){go(S.sel);e.preventDefault();e.stopPropagation()}
  else if((k=='n'||k=='N')&&S.mode!='create'){openCreate();e.preventDefault();e.stopPropagation()}
  else if(k=='Tab'){/* native focus order: dock, panel, header */}
  else if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&k.length==1){e.stopPropagation()}}
 function openCreate(){if(S.ent||S.form)return;S.mode='create';S.creating=true;S.sel=null;S.settings=false;S.newTheme=S.newTheme||'verdant';S.newName=S.newName||'';setPreview(S.newTheme,S.newName);viewPlanet(S.pv);AU.select();renderPanels();setTimeout(()=>{const i=el.querySelector('#plnName');i&&i.focus()},60)}
 // ------------------------------------------------------------ open / close
 function openUI(opts){opts=opts||{};build();if(open){if(opts.create!=null){S.newName=cleanId(opts.create);openCreate();setPreview(S.newTheme,S.newName);renderNew()}else if(opts.select)select(opts.select);return}load();sync();flush();open=true;S.openAt=Date.now();el.style.display='block';el.style.opacity='1';el.classList.remove('out');void el.offsetWidth;el.classList.add('in');
  try{if(typeof SHOW7!='undefined'&&SHOW7.isOpen)SHOW7.close()}catch(_){}try{menuEl.style.display='none'}catch(_){}try{mdL=mdR=false}catch(_){}
  W=H=0;S.ent=S.arr=S.form=null;S.sel=null;S.hov=null;S.pv=null;S.sparks.length=0;S.settings=false;PLG7.buildBackdrop(lowfx());buildPlanets();fit();const now=performance.now();last=0;t0=now;
  const here=entered?byId(cur):null;
  if(opts.create!=null){S.mode='overview';viewOverview(true);openCreate();S.newName=cleanId(opts.create);setPreview(S.newTheme,S.newName);renderNew()}
  else if(here){S.mode='focus';S.sel=here.id;viewPlanet(here,true);if(!reduce()){S.arr={t0:now,id:here.id}}if(here.rec&&!here.rec.disc){here.rec.disc=1;save()}renderPanels();AU.discover&&0}
  else{S.mode='overview';viewOverview(true);renderPanels()}
  if(opts.select&&byId(opts.select))select(opts.select,true);
  cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);AU.start();AU.tick();
  const newly=S.planets.find(p=>p.rec&&!p.rec.disc);if(newly&&S.mode=='overview'){setTimeout(()=>{if(open&&S.mode=='overview'){newly.rec.disc=1;save();AU.discover();toast('New world discovered: '+newly.label)}},1400)}}
 function close(fast){if(!open)return;open=false;cancelAnimationFrame(raf);AU.stop();el.classList.remove('in');el.classList.add('out');S.ent=S.arr=S.form=null;S.drag=null;
  const done=()=>{if(open)return;el.style.display='none';el.querySelector('#plnModal').classList.remove('on');el.querySelector('#plnAtlas').classList.remove('on');
   // free everything this screen created
   S.planets.length=0;S.sparks.length=0;S.pv=null;PLG7.dispose();try{g.clearRect(0,0,cv.width,cv.height)}catch(_){}cv.width=cv.height=1;W=H=0};
  setTimeout(done,fast?30:260)}
 load();
 return{open:openUI,close,touch,sync,select,go,create,rename,removeWorld,undoDelete,themeOf,ids,get isOpen(){return open},get state(){return S},get db(){return db},planets:()=>S.planets,explored,atlasCheck,AU,skip,cleanId,skyOf,load,readSave}})();
// remember every world the game loads, whichever way the player got there
{const _lw=loadWorld;loadWorld=function(n,e){const r=_lw.apply(this,arguments);try{PLN7.touch(cur)}catch(_){}return r}}

// ---- wiring: the old world list buttons and a HUD button now open the atlas
(()=>{const $=id=>document.getElementById(id);
 try{$('bw').onclick=()=>PLN7.open();$('bj').onclick=()=>PLN7.open({create:$('wn').value});$('br').onclick=()=>PLN7.open({create:'w'+(1000+Math.random()*9000|0)});$('wn').onkeydown=e=>{if(e.key=='Enter')PLN7.open({create:$('wn').value})}}catch(_){}
 const mk=()=>{const bm=$('bmenu');if(!bm||$('bplanets'))return;const b=document.createElement('button');b.className='pn';b.id='bplanets';b.title='Star Atlas: your worlds';b.setAttribute('aria-label','Star Atlas');
  b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><ellipse cx="12" cy="12" rx="10" ry="3.4" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-24 12 12)"/></svg>';
  b.onclick=()=>{if(PLN7.isOpen)PLN7.close();else PLN7.open()};bm.parentElement.insertBefore(b,bm)};setTimeout(mk,450)})();
