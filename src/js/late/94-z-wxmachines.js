// ===== WXM9: five new weather machines (object tiles 85-89) for the ENV9 scenes, their store art and their music moods =====
// They reuse the whole weather-machine pipeline: ODEF cat 'wx' (placement, access level, config dialog, WXM7.use, server op 'wx'),
// the per-world save (X6.wx offline / server world weather online) and ENV7.set. Machine art is drawn like the other objects
// (origin = bottom-left of the tile) with a cached glow sprite instead of per-frame gradients.
const WXM9=(()=>{
 const M={85:{k:'wx_sunflower',n:'Sunflower Weather Machine',c:'#ffc61a',hard:6,price:1200,th:'#ffd84a',light:'#ffe680',wx:'sunflower',lv:10},
  86:{k:'wx_sakura',n:'Sakura Sunset Machine',c:'#ff8f8a',hard:6,price:1400,th:'#ff9aa8',light:'#ffb090',wx:'sakura',lv:12},
  87:{k:'wx_ocean',n:'Ocean Sunset Machine',c:'#ff9a62',hard:7,price:2000,th:'#ffb07a',light:'#ffc890',wx:'ocean',lv:18},
  88:{k:'wx_neon',n:'Neon Rain Machine',c:'#ff4fd8',hard:7,price:2400,th:'#ff6ae0',light:'#7ff3ff',wx:'neon',lv:22},
  89:{k:'wx_aurora',n:'Aurora Night Machine',c:'#4dffb0',hard:8,price:3600,th:'#6affc0',light:'#8affd0',wx:'aurora',lv:30,rare:1}};
 for(const id in M){const d=M[id];ODEF[id]={k:d.k,n:d.n,cat:'wx',c:d.c,hard:d.hard,price:d.price,th:d.th,light:d.light,wx:d.wx,rare:d.rare|0};BLK[id]=[d.n,d.c,d.hard];PRICE[id]=d.price;SOLID6[id]=0;LVREQ[id]=d.lv}
 // ---- art
 const GL={};function glow(c){if(GL[c])return GL[c];const s=document.createElement('canvas');s.width=s.height=64;const x=s.getContext('2d'),g2=x.createRadialGradient(32,32,0,32,32,32);g2.addColorStop(0,c+'cc');g2.addColorStop(.45,c+'44');g2.addColorStop(1,c+'00');x.fillStyle=g2;x.fillRect(0,0,64,64);return GL[c]=s}
 const O='#140c1c',ol=g=>{g.strokeStyle=O;g.lineWidth=1.6;g.lineJoin='round'};
 const act=o=>o&&o._act?Math.max(0,1-(performance.now()-o._act)/1400):0,on=d=>{try{return ENV7.target==d.wx?1:0}catch(_){return 0}};
 const aura=(g,c,cx,cy,R)=>{g.save();g.globalCompositeOperation='lighter';g.drawImage(glow(c),cx-R,cy-R,R*2,R*2);g.restore()};
 const base=(g,top,trim)=>{g.fillStyle=top;g.fillRect(6,-12,36,12);g.strokeRect(6,-12,36,12);g.fillStyle=trim;g.fillRect(6,-14,36,3);g.fillRect(14,-24,20,10);g.strokeRect(14,-24,20,10)};
 ART.wx_sunflower=(g,o,d,t)=>{const a=act(o),ac=on(d),cx=24;ol(g);g.fillStyle='#b8643a';g.beginPath();g.moveTo(10,-20);g.lineTo(38,-20);g.lineTo(34,0);g.lineTo(14,0);g.closePath();g.fill();g.stroke();g.fillStyle='#d8844a';g.fillRect(8,-24,32,5);g.strokeRect(8,-24,32,5);
  g.strokeStyle='#3e7f34';g.lineWidth=3;g.beginPath();g.moveTo(cx,-24);g.quadraticCurveTo(cx-4,-44,cx,-58);g.stroke();g.fillStyle='#4f9a3e';g.beginPath();g.ellipse(cx-8,-38,7,3,-.5,0,6.3);g.fill();ol(g);
  aura(g,'#ffe066',cx,-66,30+ac*10+a*16);g.save();g.translate(cx,-66);g.rotate(t*(.3+a*3));const sc=1+a*.25;g.scale(sc,sc);g.fillStyle='#ffc61a';for(let i=0;i<12;i++){g.save();g.rotate(i*.5236);g.beginPath();g.ellipse(0,-11,4,8,0,0,6.3);g.fill();g.stroke();g.restore()}
  g.fillStyle='#6a3a1a';g.beginPath();g.arc(0,0,7,0,6.3);g.fill();g.stroke();g.fillStyle='#3a1f0a';for(let i=0;i<5;i++){g.beginPath();g.arc(Math.cos(i*1.3)*3,Math.sin(i*1.3)*3,1,0,6.3);g.fill()}g.restore();
  g.fillStyle='#fff';g.globalAlpha=.85;const cx2=cx+14+Math.sin(t*.8)*3;g.beginPath();g.arc(cx2,-86,5,0,6.3);g.arc(cx2+6,-88,6,0,6.3);g.arc(cx2+12,-85,4.5,0,6.3);g.fill();g.globalAlpha=1};
 ART.wx_sakura=(g,o,d,t)=>{const a=act(o),ac=on(d),cx=24;ol(g);base(g,'#3a1a40','#ff9aa8');
  // mini torii
  g.fillStyle='#d8343a';g.fillRect(9,-56,5,32);g.fillRect(34,-56,5,32);g.strokeRect(9,-56,5,32);g.strokeRect(34,-56,5,32);g.fillRect(5,-62,38,5);g.strokeRect(5,-62,38,5);g.fillRect(8,-50,32,3);
  aura(g,'#ff9a7a',cx,-44,26+ac*10+a*14);
  // striped setting sun between the posts
  g.save();g.beginPath();g.rect(14,-56,20,32);g.clip();const sy=-34+Math.sin(t*.6)*2-a*6;g.fillStyle='#ffb36b';g.beginPath();g.arc(cx,sy,9,0,6.3);g.fill();g.fillStyle='#3a1a40';for(let i=0;i<3;i++)g.fillRect(14,sy+2+i*3,20,1.2);g.restore();
  g.fillStyle='#ffc2d6';for(let i=0;i<4;i++){const ph=(t*.3+i*.25)%1;g.globalAlpha=.85*(1-ph);g.beginPath();g.ellipse(cx+Math.sin(ph*6+i*2)*16,-66+ph*52,2.4,1.3,ph*6,0,6.3);g.fill()}g.globalAlpha=1};
 ART.wx_ocean=(g,o,d,t)=>{const a=act(o),ac=on(d),cx=24;ol(g);base(g,'#2c2a6a','#ffb07a');
  // little lighthouse with a turning lamp
  g.fillStyle='#f4ecdc';g.beginPath();g.moveTo(17,-24);g.lineTo(20,-62);g.lineTo(28,-62);g.lineTo(31,-24);g.closePath();g.fill();g.stroke();g.fillStyle='#d84a4a';g.fillRect(18.5,-44,11,6);g.fillRect(19.5,-56,9,5);
  g.fillStyle='#ffe8a0';g.fillRect(19,-70,10,8);g.strokeRect(19,-70,10,8);g.fillStyle='#2c2a6a';g.beginPath();g.moveTo(17,-70);g.lineTo(24,-78);g.lineTo(31,-70);g.closePath();g.fill();g.stroke();
  aura(g,'#ffc890',cx,-66,22+ac*12+a*16);const b=t*(1.2+a*3);g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,230,160,.35)';g.beginPath();g.moveTo(cx,-66);g.lineTo(cx+Math.cos(b)*40,-66+Math.sin(b)*6-5);g.lineTo(cx+Math.cos(b)*40,-66+Math.sin(b)*6+5);g.closePath();g.fill();g.restore();
  g.strokeStyle='#7fb8ff';g.lineWidth=2;g.beginPath();for(let x2=4;x2<=44;x2+=2)g.lineTo(x2,-6+Math.sin(x2*.4+t*3)*1.6);g.stroke()};
 ART.wx_neon=(g,o,d,t)=>{const a=act(o),ac=on(d),cx=24;ol(g);base(g,'#120a26','#ff4fd8');
  g.fillStyle='#1d1240';g.fillRect(12,-70,14,46);g.strokeRect(12,-70,14,46);g.fillRect(26,-56,11,32);g.strokeRect(26,-56,11,32);
  for(let r=0;r<6;r++)for(let c=0;c<2;c++){const lit=((r*3+c*5+(t*2|0))%5)!=0;g.fillStyle=lit?(c?'#7ff3ff':'#ffd68a'):'#2a1f50';g.fillRect(15+c*6,-66+r*7,3,4)}
  const fl=(Math.sin(t*23)>-.85||a>0)?1:.3;aura(g,'#ff4fd8',cx,-74,20+ac*10+a*14);g.globalAlpha=fl;g.strokeStyle='#ff4fd8';g.lineWidth=2.2;g.strokeRect(9,-82,22,8);g.strokeStyle='#7ff3ff';g.beginPath();g.arc(32,-62,4,0,6.3);g.stroke();g.globalAlpha=1;
  g.strokeStyle='rgba(180,200,255,.7)';g.lineWidth=1;g.beginPath();for(let i=0;i<6;i++){const px=4+i*8,py=-90+((t*90+i*23)%70);g.moveTo(px,py);g.lineTo(px-2,py+7)}g.stroke()};
 ART.wx_aurora=(g,o,d,t)=>{const a=act(o),ac=on(d),cx=24;ol(g);base(g,'#0a1c30','#bfe8ff');
  // crystal obelisk
  g.fillStyle='#bfe8ff';g.beginPath();g.moveTo(cx,-80);g.lineTo(cx+9,-56);g.lineTo(cx+6,-24);g.lineTo(cx-6,-24);g.lineTo(cx-9,-56);g.closePath();g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(cx,-78);g.lineTo(cx-7,-56);g.lineTo(cx-4,-28);g.lineTo(cx-1,-28);g.lineTo(cx-2,-58);g.closePath();g.fill();
  aura(g,'#4dffb0',cx,-60,30+ac*12+a*18);
  // two flowing aurora ribbons around it
  g.save();g.globalCompositeOperation='lighter';g.lineWidth=3;for(let k=0;k<2;k++){g.strokeStyle=k?'rgba(220,120,255,.6)':'rgba(80,255,170,.75)';g.beginPath();for(let i=0;i<=20;i++){const u=i/20,px=4+u*40,py=-66+k*10+Math.sin(u*6+t*(1.4+k*.5)+k)*6*(1+a);i?g.lineTo(px,py):g.moveTo(px,py)}g.stroke()}g.restore();
  g.fillStyle='#fff';for(let i=0;i<3;i++){const tw=.5+.5*Math.sin(t*3+i*2);g.globalAlpha=tw;g.fillRect(8+i*15,-86+i*4,2,2)}g.globalAlpha=1};
 // ---- music: two songs per new scene (same instruments / feels as the rest of MUS7)
 const Q={maj7:[0,4,7,11],maj9:[0,4,7,11,14],m7:[0,3,7,10],m9:[0,3,7,10,14],d9:[0,4,7,10,14],sus:[0,5,7,10,14],add9:[0,4,7,14],m11:[0,3,7,10,17]},C=a=>a.map(x=>[x[0],Q[x[1]]]);
 const MOOD={sunflower:{n:'Sunflower Fields',songs:[{id:'sunflower-sway',bpm:84,key:7,sc:'maj',feel:'brush',prog:C([[0,'maj9'],[5,'add9'],[9,'m7'],[7,'sus']]),lead:'box'},{id:'windmill-hill',bpm:78,key:2,sc:'maj',feel:'lofi',prog:C([[0,'add9'],[7,'maj7'],[9,'m9'],[5,'maj9']]),lead:'koto'}]},
  sakura:{n:'Sakura Sunset',songs:[{id:'dusk-petals',bpm:66,key:4,sc:'hira',feel:'soft',prog:C([[0,'m9'],[8,'maj9'],[5,'m7'],[7,'sus']]),lead:'koto'},{id:'evening-bell',bpm:60,key:9,sc:'hira',feel:'brush',prog:C([[0,'m7'],[3,'maj7'],[8,'maj9'],[10,'d9']]),lead:'bell'}]},
  ocean:{n:'Ocean Sunset',songs:[{id:'golden-tide',bpm:70,key:5,sc:'lyd',feel:'soft',prog:C([[0,'maj9'],[2,'d9'],[7,'add9'],[9,'m9']]),lead:'keys'},{id:'seashell-radio',bpm:74,key:0,sc:'maj',feel:'brush',prog:C([[0,'maj7'],[9,'m9'],[2,'m7'],[7,'d9']]),lead:'box'}]},
  neon:{n:'Neon Rain',songs:[{id:'city-pop-rain',bpm:86,key:10,sc:'dor',feel:'beat',prog:C([[0,'m9'],[5,'d9'],[3,'maj9'],[8,'maj7']]),lead:'keys'},{id:'midnight-arcade',bpm:80,key:3,sc:'min',feel:'lofi',prog:C([[0,'m7'],[8,'maj9'],[10,'d9'],[7,'m7']]),lead:'arp'}]},
  aurora:{n:'Aurora',songs:[{id:'northern-lights',bpm:54,key:2,sc:'lyd',feel:'ambient',prog:C([[0,'maj9'],[7,'add9'],[4,'m7'],[9,'sus']]),lead:'bell'},{id:'frozen-lake',bpm:58,key:7,sc:'dor',feel:'ambient',prog:C([[0,'m11'],[3,'maj9'],[10,'add9'],[5,'d9']]),lead:'arp'}]}};
 try{Object.assign(MUS7.MOODS,MOOD)}catch(e){console.error('WXM9 music',e)}
 return{M,IDS:Object.keys(M).map(Number),MOOD}})();
