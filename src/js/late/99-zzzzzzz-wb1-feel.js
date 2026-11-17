// ===== FEEL10: placing and breaking that feel good (world building). Every block has a material class (wood, stone, glass, ice, metal, magic,
// fabric, plant, sand, snow, dirt), read from its name or pinned for the new materials.
//  Placing: the block settles into its grid cell (a quick 150 ms settle with a soft overshoot), a brief glaze in the material's tint, four corner
//  ticks that close onto the cell (the "snapped" confirmation), a few tiny motes for the material, and a soft placement sound of its own:
//  wood a warm knock, stone a clean tap, glass a small crystal ting, ice a cold ting, metal a controlled damped ping, magic a gentle chime,
//  fabric/plant/sand/snow a muffled pat. Pitch varies a little every time, a fast run gets quieter, and there is a voice budget, so a hundred
//  blocks in a row never pile up or grate. It replaces the old square-wave blip and the big bump for every block, old or new.
//  Breaking keeps the existing material sounds (MSFX8), texture debris (DEB12) and cracks; FEEL10 adds what was missing: a short damage
//  shiver while a block is being hit, metal sparks, magic motes, ice glints, petals and fluff, with a small sound layer for metal, magic and ice.
//  Everything follows the Sound effects slider and stops for reduced motion where it is motion. =====
const FEEL10=(()=>{
 const R=Math.random,TAU=Math.PI*2;
 const CLS={115:null,116:'glass',117:'magic',120:'wood',121:'wood',122:'wood',123:'stone',124:'stone',125:'wood',126:'metal',127:'metal',128:'ice',129:'snow',130:'magic',131:'glass',132:'stone',133:'stone',134:'magic',135:'sand',136:'plant',137:'magic',138:'wood',
  1:'dirt',2:'plant',3:'stone',5:'wood',6:'glass',8:'sand',9:'magic',10:'metal',13:'metal',15:'plant'};
 const PMC=['stone','stone','fabric','stone','stone','wood'];
 function cls(b,k){if(b==115)return PMC[Math.min(5,((k!=null?TVAR[k]:0)||0)>>6)];if(CLS[b])return CLS[b];const n=((BLK[b]||[''])[0])||'';
  return/Glass|Window/.test(n)?'glass':/Ice|Frost/.test(n)?'ice':/Crystal|Galaxy|Aurora|Starlight|Celestial|Moon|Star|Nebula|Rune|Magic/.test(n)?'magic':/Gold|Steel|Iron|Metal|Copper|Lantern|Lamp/.test(n)?'metal':
   /Wood|Plank|Log|Bamboo|Crate|Shelf|Fence|Door|Timber|Parquet|Shingle/.test(n)?'wood':/Sand|Gravel/.test(n)?'sand':/Snow/.test(n)?'snow':/Leaf|Leaves|Hedge|Moss|Vine|Flower|Planter|Grass|Turf|Hay/.test(n)?'plant':/Rug|Wool|Fabric|Thatch|Cloth/.test(n)?'fabric':/Dirt|Soil|Mud|Clay|Farm/.test(n)?'dirt':'stone'}
 const TINT={wood:'#f0c890',stone:'#ffffff',glass:'#e8fbff',ice:'#dff4ff',metal:'#f2f6fa',magic:'#f4e6ff',fabric:'#fff4f8',plant:'#e8ffd8',sand:'#fff4d8',snow:'#ffffff',dirt:'#f0d8b8'};
 // ---- sound: a tiny synth on its own gentle bus (treble shelf + lowpass + soft compressor), following OPT.sv
 const vol=()=>typeof OPT=='undefined'||OPT.sv==null?1:+OPT.sv;
 let bus=null,nb=null;
 function ready(){try{ac()}catch(_){}return typeof AC!='undefined'&&AC&&AC.state!='closed'&&vol()>0}
 function out(){if(bus&&bus.context===AC)return bus;bus=AC.createGain();bus.gain.value=.85;const sh=AC.createBiquadFilter();sh.type='highshelf';sh.frequency.value=3600;sh.gain.value=-5;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7600;
  const cp=AC.createDynamicsCompressor();cp.threshold.value=-22;cp.knee.value=16;cp.ratio.value=3;cp.attack.value=.004;cp.release.value=.16;bus.connect(sh);sh.connect(lp);lp.connect(cp);cp.connect(AC.destination);return bus}
 function noiseBuf(){if(nb&&nb.sampleRate==AC.sampleRate)return nb;const b=AC.createBuffer(1,AC.sampleRate>>1,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;return nb=b}
 function nz(d,ty,f0,f1,q,v,dl,at){const t=AC.currentTime+(dl||0)+.003,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf();f.type=ty;f.Q.value=q;f.frequency.setValueAtTime(f0,t);if(f1!=f0)f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+(at||.008));g.gain.exponentialRampToValueAtTime(.0003,t+d);s.connect(f);f.connect(g);g.connect(out());s.start(t,R()*.4,d+.04);s.stop(t+d+.05)}
 function os(ty,f0,f1,d,v,dl,at){const t=AC.currentTime+(dl||0)+.003,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t);if(f1!=f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d*.9);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol(),t+(at||.006));g.gain.exponentialRampToValueAtTime(.0003,t+d);o.connect(g);g.connect(out());o.start(t);o.stop(t+d+.04)}
 // placement voices: q = pitch variation, d = how quiet the run has made it
 const PV={
  wood(q,d){nz(.09,'bandpass',620*q,520*q,2.4,.16*d);os('sine',300*q,270*q,.09,.05*d);nz(.05,'bandpass',1500*q,1200*q,2,.05*d,.006)},
  stone(q,d){nz(.07,'bandpass',1350*q,1000*q,1.4,.13*d);os('triangle',420*q,380*q,.06,.035*d);nz(.12,'lowpass',700*q,300,.7,.06*d,.01)},
  glass(q,d){const f=[2093,2349,2637][R()*3|0]*q;os('sine',f,f*1.002,.32,.045*d);os('sine',f*2.01,f*2.01,.16,.012*d,.004);nz(.04,'highpass',5000,4500,.8,.03*d)},
  ice(q,d){const f=[2637,3136][R()*2|0]*q;os('sine',f,f*.998,.4,.04*d);os('sine',f*1.5,f*1.5,.22,.014*d,.03);nz(.05,'highpass',6000,5200,.7,.035*d)},
  metal(q,d){const f=520*q;os('sine',f,f,.22,.04*d);os('sine',f*2.76,f*2.74,.12,.016*d);nz(.04,'bandpass',2400*q,2000*q,3,.05*d)},
  magic(q,d){const f=[1047,1319,1568][R()*3|0]*q;os('sine',f,f,.5,.032*d,0,.02);os('sine',f*1.5,f*1.5,.42,.016*d,.05,.03);nz(.25,'bandpass',4200,6000,4,.012*d,.02,.05)},
  fabric(q,d){nz(.1,'lowpass',900*q,400,.7,.15*d);nz(.06,'bandpass',500*q,420*q,1.2,.06*d)},
  plant(q,d){nz(.12,'bandpass',2600*q,1800*q,1.4,.06*d);nz(.08,'lowpass',800*q,400,.7,.1*d)},
  sand(q,d){nz(.14,'bandpass',2200*q,1500*q,.9,.08*d);nz(.08,'lowpass',700*q,350,.7,.08*d)},
  snow(q,d){nz(.12,'lowpass',1600*q,600,.8,.12*d);nz(.05,'bandpass',3200*q,2600,2,.025*d,.02)},
  dirt(q,d){nz(.1,'lowpass',800*q,350,.7,.15*d);nz(.06,'bandpass',600*q,480*q,1.3,.06*d)}};
 // break layers for the materials the mining sounds do not cover
 const BV={metal(q){os('sine',640*q,630*q,.35,.04);os('sine',1730*q,1720*q,.18,.016,.01);nz(.08,'bandpass',3000*q,2200,3,.04)},
  magic(q){[1319,1568,2093].forEach((f,i)=>os('sine',f*q,f*q,.45,.022,i*.05,.02))},ice(q){[2637,3136,3520].forEach((f,i)=>os('sine',f*q,f*q*.99,.3,.02,i*.04))},
  fabric(q){nz(.14,'lowpass',700*q,300,.7,.1)},plant(q){nz(.2,'bandpass',2400*q,1500,1.2,.05)}};
 let last={},win=0,used=0,run=0,lastT=0;const log=[];
 function gate(c,n){const now=performance.now();if(now-(last[c]||0)<38)return false;if(now-win>120){win=now;used=0}if(used+n>10)return false;used+=n;last[c]=now;return true}
 function playPlace(c){log.push('place:'+c);if(log.length>40)log.shift();if(!ready()||!PV[c]||!gate('p'+c,2))return;const now=performance.now();run=now-lastT<260?Math.min(run+1,8):0;lastT=now;
  try{PV[c](.95+R()*.1,1-run*.06)}catch(_){}}
 function playBreak(c){log.push('break:'+c);if(log.length>40)log.shift();if(!ready()||!BV[c]||!gate('b'+c,3))return;try{BV[c](.96+R()*.08)}catch(_){}}
 // ---- visuals
 const PF=new Map();// k -> {t, b, c(lass)}
 const reduce=()=>{try{return!!(QM&&QM.reduce)}catch(_){return false}};
 function motes(c,px,py,col,n){const P0={wood:['#c8945e',90,3],stone:['#d8dce6',70,2.5],glass:['#ffffff',110,2,'p'],ice:['#e8f8ff',110,2,'p'],metal:['#fff2c8',140,1.6,'p'],magic:[col||'#e6d2ff',60,2.2,'p'],
   fabric:['#ffffff',40,2.4],plant:['#ffd6e6',60,2.4],sand:['#f0dca8',70,2],snow:['#ffffff',50,2.4],dirt:['#b08860',60,2.2]}[c]||['#ffffff',60,2];try{burst(px,py,P0[0],n,P0[1],P0[2],P0[3])}catch(_){}}
 function placed(b,k,v){const c=cls(b,k),px=(k%W)*T+T/2,py=(k/W|0)*T+T/2;pop.delete(k);PF.set(k,{t:performance.now(),b,c});if(PF.size>64)PF.delete(PF.keys().next().value);
  let col=null;try{if(b==115||b==116||b==117)col=MATS10.PAL[Math.min(MATS10.NC-1,(v||0)&63)][1]}catch(_){}motes(c,px,py+T*.3,col,reduce()?1:3);playPlace(c);FEEL10.n++}
 function hit(b,k,v){const c=cls(b,k);SH.set(k,performance.now());if(SH.size>32)SH.delete(SH.keys().next().value);if(c=='metal'&&R()<.6)motes('metal',(k%W)*T+T/2,(k/W|0)*T+T/2,null,2)}
 function broke(b,k,v){const c=cls(b,k),px=(k%W)*T+T/2,py=(k/W|0)*T+T/2;SH.delete(k);PF.delete(k);let col=null;try{if(b==115||b==116||b==117)col=MATS10.PAL[Math.min(MATS10.NC-1,(v||0)&63)][1]}catch(_){}
  const n=reduce()?2:{metal:6,magic:7,ice:5,plant:6,fabric:4,glass:3}[c]||0;if(n)motes(c,px,py,col,n);if(col&&b!=117)try{burst(px,py,col,reduce()?3:6,120,3)}catch(_){}playBreak(c)}
 const SH=new Map();// a block being hit shivers for 120 ms (damage feedback that reads without shaking the screen)
 function draw(x0,x1,y0,y1,now){if(PF.size){for(const[k,f]of PF){const a=(now-f.t)/170;if(a>=1){PF.delete(k);continue}if(tiles[k]!==f.b){PF.delete(k);continue}const x=k%W,y=k/W|0;if(x<x0-1||x>x1+1||y<y0-1||y>y1+1)continue;
   const px=x*T-cam.x,py=y*T-cam.y,e=1-Math.pow(1-a,3),s=reduce()?1:1+.1*Math.sin(Math.min(1,a*1.25)*Math.PI)*(1-a),sp=spr(f.b,x,y);
   g.save();g.translate(px+T/2,py+T/2);g.scale(s,s);g.drawImage(sp,-T/2,-T/2,T,T);g.globalAlpha=.42*(1-e);g.fillStyle=TINT[f.c]||'#fff';g.fillRect(-T/2,-T/2,T,T);g.restore();
   const o=5*(1-e),L=8;g.save();g.globalAlpha=.85*(1-a*a);g.strokeStyle='#fff8e6';g.lineWidth=2;g.beginPath();
   for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const cx=px+(sx<0?-o:T+o),cy=py+(sy<0?-o:T+o);g.moveTo(cx,cy+(sy<0?L:-L));g.lineTo(cx,cy);g.lineTo(cx+(sx<0?L:-L),cy)}g.stroke();g.restore()}}
  if(SH.size){for(const[k,t0]of SH){const a=(now-t0)/120;if(a>=1||!tiles[k]){SH.delete(k);continue}const x=k%W,y=k/W|0;if(x<x0||x>x1||y<y0||y>y1)continue;const b=tiles[k];if(!SOLID6[b])continue;
   const px=x*T-cam.x,py=y*T-cam.y,d=reduce()?0:Math.sin(a*Math.PI*3)*1.6*(1-a);g.save();g.drawImage(spr(b,x,y),px+d,py,T,T);g.globalAlpha=.18*(1-a);g.fillStyle='#ffffff';g.fillRect(px+d,py,T,T);g.restore()}}}
 // ---- hook every placement (old blocks, house blocks, new materials) and every break
 let mute=0;{const _s=snd;snd=function(){if(mute)return;return _s.apply(this,arguments)}}
 const atCursor=()=>{try{const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);if(tx<0||ty<0||tx>=W||ty>=H)return -1;return ty*W+tx}catch(_){return -1}};
 const blocky=()=>{try{let it=null;try{it=HOTBAR.held()}catch(_){}if(it==null)it=bar[sel];const c=ITEM7.cat(it);return c=='block'||c=='door'}catch(_){return false}};
 function around(fn,self,args){if(!blocky())return fn.apply(self,args);const k=atCursor(),b0=k>=0?tiles[k]:0,n0=FEEL10.n;mute++;let r;try{r=fn.apply(self,args)}finally{mute--}
  try{if(k>=0&&!b0&&tiles[k]&&FEEL10.n===n0){const b=tiles[k];placed(b,k,TVAR[k]);try{BUILDER10.used(null,k,b,TVAR[k])}catch(_){}for(let i=rings.length-1;i>=0&&i>=rings.length-2;i--)if(performance.now()-rings[i].t<30)rings.splice(i,1)}}catch(_){}return r}
 {const _pa=placeAction;placeAction=function(){return around(_pa,this,arguments)}}
 {const _uw=useWeapon;useWeapon=function(){const k=atCursor(),b0=k>=0?tiles[k]:0;if(b0)return _uw.apply(this,arguments);return around(_uw,this,arguments)}}
 {const _ba=breakAt;breakAt=function(x,y,dmg){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0,v=inb?TVAR[k]:0;const r=_ba.apply(this,arguments);
   try{if(b&&inb&&r&&!(VARID[b]&&b<=117)&&!MATS10.FIXID.has(b)){if(!tiles[k])broke(b,k,v);else if(tiles[k]==b)hit(b,k,v)}}catch(_){}return r}}
 {const _d=TILE7.draw;TILE7.draw=function(x0,x1,y0,y1,now){const r=_d.apply(this,arguments);try{MATS10.overlay(x0,x1,y0,y1,now);draw(x0,x1,y0,y1,now)}catch(e){if(!FEEL10.e){FEEL10.e=1;console.error('FEEL10 draw',e)}}return r}}
 return{cls,placed,hit,broke,playPlace,playBreak,log,PF,SH,n:0,ui(){},get mute(){return mute}}})();
