// ===== MYART: the look of the mythic arsenal. One theme per class (palette, motif, scythe name, its three moves, the outfit pieces, the
// avatar frame and banner style, the anime look of its hero), plus the vector art shared by the game, the HUD and the Classes screen:
// ornaments (filigree curls, gems, feathers, petals, roses, leaves, stars, crystals, bolts, flames, crows, drops, gears, runes, shuriken,
// ink), the mythic scythe at any size and ascension tier, the ornate avatar frame and the hanging class banner. Everything is drawn in
// code (no image files), lined like anime cel art with metallic gradients and soft glows. =====
const MYART=(()=>{
 const TAU=Math.PI*2,R=Math.random;
 const hex=h=>{h=String(h).replace('#','');return[parseInt(h.slice(0,2),16)|0,parseInt(h.slice(2,4),16)|0,parseInt(h.slice(4,6),16)|0]};
 const rgba=(h,a)=>{const c=hex(h);return'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'};
 const mix=(a,b,k)=>{const x=hex(a),y=hex(b);return'#'+x.map((v,i)=>Math.round(v+(y[i]-v)*k).toString(16).padStart(2,'0')).join('')};
 // pal: [main, light, dark, accent]; mv: the three combo moves [name, effect, what it does]; out: outfit pieces; fr: frame style; gold: gold metal
 const TH={
  brawler:{n:'Cindermaw',ep:'Scythe of the Burning Fist',q:'Every blow is a promise kept.',pal:['#ff8a3a','#ffe0b0','#5a1a08','#ffd36a'],mot:'spark',fr:'flame',gold:1,
   mv:[['Crashing Arc','ring','A wide sweep that bursts into a ring of shockwaves'],['Ember Crescent','crescent','The return cut hurls a blazing crescent'],['Meteor Uppercut','pillar','A full spin that drives a pillar of fire up from the ground']],
   out:{crown:'band',cape:'#5a1a08'},wing:27,look:{hs:0,hair:'#3a1a10',eye:2,skin:'#f1c9a0',out:'#7a2e10',trim:'#ffb27a',gd:0}},
  knight:{n:'Dawnwarden',ep:'Scythe of the Last Light',q:'I stand so that others may rise.',pal:['#ffd86a','#fffbe8','#6a5418','#ffffff'],mot:'feather',fr:'angel',gold:1,
   mv:[['Oath Sweep','crescent','A radiant arc of light cuts ahead'],['Lances of Dawn','shards','Golden spears erupt along the ground'],['Judgement','pillar','A spin that calls a column of holy light']],
   out:{crown:'halo',cape:'#e8e2d0'},wing:40,look:{hs:8,hair:'#f4ecd8',eye:1,skin:'#f6d7b8',out:'#e8e2d0',trim:'#d9b46a',gd:1}},
  samurai:{n:'Sakura Requiem',ep:'Scythe of Falling Petals',q:'Bloom once. Cut once. Never look back.',pal:['#ff7a9a','#ffe4ec','#5a1428','#ffd0dc'],mot:'petal',fr:'blossom',
   mv:[['Iaido Crescent','crescent','A blinding draw-cut sends a pink crescent'],['Petal Storm','flock','A cyclone of sakura petals slices through enemies'],['Ink Requiem','splash','A spin that bursts into sweeping ink strokes']],
   out:{crown:'crest',cape:'#2a1420'},wing:8,look:{hs:1,hair:'#1a1420',eye:4,skin:'#f6d7c0',out:'#2a1420',trim:'#ff7a9a',gd:1}},
  archer:{n:'Starlight Aurelis',ep:'Scythe of a Thousand Stars',q:'When stars align, destiny is reaped.',pal:['#c8b8ff','#fff6e0','#2a2050','#ffd98a'],mot:'star',fr:'star',
   mv:[['Starlight Arc','crescent','A crescent of condensed starlight that flies true'],['Stardust Veil','flock','A swarm of shooting stars weaves into enemies'],['Starfall','stars','A spin that rains falling stars onto the field']],
   out:{crown:'tiara',cape:'#2a2050'},wing:33,look:{hs:5,hair:'#f0e6ff',eye:6,skin:'#f6dccb',out:'#2a2050',trim:'#ffd98a',gd:1}},
  mage:{n:'Arcana Veil',ep:'Scythe of the Spectral Library',q:'Every spell is a door. I hold the keys.',pal:['#b06aff','#f0e0ff','#2a1050','#ff6ae0'],mot:'rune',fr:'crystal',
   mv:[['Spectral Chains','chains','Ghostly chains whirl out and drag enemies close'],['Arcane Eruption','pillar','A burst of violet light tears up from the ground'],['Event Horizon','vortex','A spin that opens a black hole that swallows foes']],
   out:{crown:'circlet',cape:'#3a1a6a'},wing:9,look:{hs:2,hair:'#e8e8ff',eye:3,skin:'#f3d9c8',out:'#3a1a6a',trim:'#c8a0ff',gd:1}},
  demon:{n:'Crimson Covenant',ep:'Scythe of the Blood Pact',q:'Your strength becomes mine.',pal:['#ff2a4a','#ffd0d8','#3a0610','#ff8a9a'],mot:'blood',fr:'demon',
   mv:[['Blood Rend','splash','A cut that explodes into living crimson tendrils'],['Hemorrhage Arc','crescent','A crescent of blood that drains what it cuts'],['Blood Moon','vortex','A spin that summons a crimson moon pulling foes in']],
   out:{crown:'horns',cape:'#1a0a10'},wing:21,look:{hs:3,hair:'#e8e8ec',eye:4,skin:'#ecd0c4',out:'#1a0a10',trim:'#ff2a4a',gd:0}},
  reaper:{n:'Nightveil Harvester',ep:'Scythe of the Final Hour',q:'Every soul has an hour. I bring it.',pal:['#9a6aff','#ece0ff','#14081e','#e04aff'],mot:'crow',fr:'raven',
   mv:[['Crow Flock','flock','A murder of spectral crows tears forward'],['Spectral Chains','chains','Chains of the dead coil around you and bind'],['Grave Rupture','pillar','A spin that shatters the ground in violet light']],
   out:{crown:'thorn',cape:'#14081e'},wing:17,look:{hs:5,hair:'#f0f0f4',eye:6,skin:'#efdcd2',out:'#14081e',trim:'#9a6aff',gd:1}},
  elementalist:{n:'Tempest Prism',ep:'Scythe of Fire and Frost',q:'Fire remembers. Ice forgets nothing.',pal:['#5ad8ff','#e8fbff','#0a2a3a','#ff8a3a'],mot:'flame',fr:'frost',
   mv:[['Glacier Line','shards','Ice crystals rupture along the ground'],['Flame Geyser','pillar','A geyser of fire bursts where you cut'],['Prism Nova','ring','A spin that releases a ring of fire and frost']],
   out:{crown:'flame',cape:'#123a50'},wing:1,look:{hs:7,hair:'#bfefff',eye:0,skin:'#f3dccc',out:'#123a50',trim:'#5ad8ff',gd:1}},
  stormcaller:{n:'Thunderveil',ep:'Scythe of the Sky Tyrant',q:'The sky answers when I call.',pal:['#ffe95a','#fffbe0','#2a2a10','#7ad8ff'],mot:'bolt',fr:'storm',gold:1,
   mv:[['Chain Lightning','bolts','Lightning leaps down onto nearby enemies'],['Thunderclap','ring','A crack of thunder rolls out as a shockwave'],['Skyfall Spire','pillar','A spin that calls a lightning spire down']],
   out:{crown:'bolt',cape:'#1a2240'},wing:43,look:{hs:3,hair:'#fff3a0',eye:1,skin:'#f1c9a0',out:'#1a2240',trim:'#ffe95a',gd:0}},
  berserker:{n:'Ruinbringer',ep:'Scythe of the Broken Mountain',q:'Pain is just fuel.',pal:['#ff6a2a','#ffd8b8','#3a1206','#ffb04a'],mot:'rock',fr:'flame',gold:1,
   mv:[['Quake Sweep','ring','A crushing sweep that rolls a quake outward'],['Rockbreaker','shards','Jagged stone spikes burst from the earth'],['Cataclysm','pillar','A spin that erupts the ground in molten rock']],
   out:{crown:'horns2',cape:'#3a1206'},wing:13,look:{hs:0,hair:'#8a1a10',eye:2,skin:'#e8bc98',out:'#3a1206',trim:'#ff8a4a',gd:0}},
  ninja:{n:'Inkshade',ep:'Scythe of the Silent Brush',q:'You will not see the cut.',pal:['#7ad0ff','#eaf6ff','#0a1420','#ffffff'],mot:'ink',fr:'ink',
   mv:[['Shadow Crescent','crescent','A swift crescent of shadow'],['Shuriken Gale','flock','A spiral of shadow shuriken flies out'],['Ink Tempest','splash','A spin that splashes slashing ink everywhere']],
   out:{crown:'band',cape:'#0a1420'},wing:41,look:{hs:4,hair:'#101418',eye:0,skin:'#f1d2b8',out:'#0a1420',trim:'#7ad0ff',gd:0}},
  druid:{n:'Thornbloom',ep:'Scythe of the First Grove',q:'What is cut, regrows. What grows, binds.',pal:['#7aff8a','#eaffe0','#123a14','#ff7aa8'],mot:'leaf',fr:'rose',
   mv:[['Thorn Line','shards','Thorned vines burst from the ground ahead'],['Leaf Gale','flock','A gale of razor leaves sweeps forward'],['Bloom Nova','ring','A spin that blooms a ring of petals and thorns']],
   out:{crown:'flowers',cape:'#1a4020'},wing:25,look:{hs:7,hair:'#d8ffc8',eye:5,skin:'#f3dcc4',out:'#1a4020',trim:'#9aff7a',gd:1}},
  gunslinger:{n:'Chrono Reaver',ep:'Scythe of the Clockwork Sun',q:'Six seconds is all I need.',pal:['#6adfff','#e0fbff','#0a1e28','#ffd36a'],mot:'gear',fr:'gear',gold:1,
   mv:[['Barrel Arc','crescent','A crescent fired like a shot'],['Bullet Rain','stars','A spin of the barrel rains rounds from above'],['Clockwork Nova','ring','Gears of light burst outward in a ring']],
   out:{crown:'hat',cape:'#1a2a38'},wing:30,look:{hs:6,hair:'#2a2a30',eye:0,skin:'#f1c9a0',out:'#1a2a38',trim:'#ffd36a',gd:0}}};
 const OL='#0d0a12';
 // ---- metal: a cel-shaded metallic gradient between two points, silver or gold, tinted toward the class colour
 function metal(g,x0,y0,x1,y1,k,tint){const t=TH[k]||TH.reaper,base=t.gold?['#fff7d6','#f0c860','#8a6420','#ffe9a0','#5a4010']:['#ffffff','#d8dce6','#6e7080','#f2f2f6','#3a3a48'];const gr=g.createLinearGradient(x0,y0,x1,y1);
  const tn=tint==null?.18:tint;[0,.32,.5,.62,1].forEach((s,i)=>gr.addColorStop(s,tn?mix(base[i],t.pal[0],tn*(i==2||i==4?1:.5)):base[i]));return gr}
 // ---- ornaments (all in local units, centred on x,y)
 function curl(g,x,y,s,a,flip,col,lw){g.save();g.translate(x,y);g.rotate(a);if(flip)g.scale(1,-1);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(s*.4,-s*.5,s*1.1,-s*.35,s*1.05,s*.15);g.bezierCurveTo(s*1,s*.5,s*.55,s*.55,s*.55,s*.25);g.bezierCurveTo(s*.55,s*.05,s*.78,s*.02,s*.8,s*.2);
  g.strokeStyle=col||'#e8e8f0';g.lineWidth=lw||Math.max(.8,s*.12);g.lineCap='round';g.stroke();g.restore()}
 function gem(g,x,y,r,col,glow){g.save();g.translate(x,y);if(glow){const gr=g.createRadialGradient(0,0,0,0,0,r*3);gr.addColorStop(0,rgba(col,.55));gr.addColorStop(1,rgba(col,0));g.fillStyle=gr;g.fillRect(-r*3,-r*3,r*6,r*6)}
  g.beginPath();g.moveTo(0,-r*1.25);g.lineTo(r*.85,-r*.2);g.lineTo(0,r*1.25);g.lineTo(-r*.85,-r*.2);g.closePath();const gr=g.createLinearGradient(-r,-r,r,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,col);gr.addColorStop(1,mix(col,'#000000',.55));g.fillStyle=gr;g.fill();
  g.strokeStyle=OL;g.lineWidth=Math.max(.6,r*.18);g.stroke();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(-r*.3,-r*.6);g.lineTo(0,-r*.95);g.lineTo(r*.15,-r*.4);g.closePath();g.fill();g.restore()}
 function star4(g,x,y,r,col,a){g.save();g.translate(x,y);g.rotate(a||0);g.fillStyle=col;g.beginPath();for(let i=0;i<8;i++){const q=i*Math.PI/4,rr=i%2?r*.22:r;g.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}g.closePath();g.fill();g.restore()}
 function feather(g,x,y,len,a,c1,c2){g.save();g.translate(x,y);g.rotate(a);const w=len*.2;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.35,-w,len,-w*.1);g.quadraticCurveTo(len*.4,w*.9,0,0);const gr=g.createLinearGradient(0,0,len,0);gr.addColorStop(0,c2);gr.addColorStop(1,c1);g.fillStyle=gr;g.fill();
  g.strokeStyle=OL;g.lineWidth=Math.max(.5,len*.03);g.stroke();g.strokeStyle=rgba('#ffffff',.45);g.lineWidth=Math.max(.4,len*.02);g.beginPath();g.moveTo(len*.05,0);g.quadraticCurveTo(len*.5,-w*.3,len*.95,-w*.1);g.stroke();
  g.strokeStyle=rgba('#000000',.25);for(let i=1;i<6;i++){const u=i/6;g.beginPath();g.moveTo(len*u,-w*.25*(1-u));g.lineTo(len*(u+.07),w*.35*(1-u*.7));g.stroke()}g.restore()}
 function petal(g,x,y,s,a,col){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,s);g.bezierCurveTo(-s*.9,s*.2,-s*.6,-s*.8,-s*.12,-s*.9);g.lineTo(0,-s*.62);g.lineTo(s*.12,-s*.9);g.bezierCurveTo(s*.6,-s*.8,s*.9,s*.2,0,s);
  const gr=g.createLinearGradient(0,s,0,-s);gr.addColorStop(0,mix(col,'#ffffff',.6));gr.addColorStop(1,col);g.fillStyle=gr;g.fill();g.strokeStyle=rgba(mix(col,'#000000',.5),.8);g.lineWidth=Math.max(.4,s*.08);g.stroke();g.restore()}
 function rose(g,x,y,r,col){g.save();g.translate(x,y);for(let i=0;i<3;i++){const rr=r*(1-i*.28);g.beginPath();for(let j=0;j<5;j++){const q=j*TAU/5+i*.6;g.ellipse(Math.cos(q)*rr*.35,Math.sin(q)*rr*.35,rr*.62,rr*.45,q,0,TAU)}
   g.fillStyle=mix(col,i?'#ffffff':'#000000',i*.18+(i?0:.15));g.fill();g.strokeStyle=rgba(mix(col,'#000000',.6),.9);g.lineWidth=Math.max(.4,r*.06);g.stroke()}
  g.strokeStyle=rgba(mix(col,'#000000',.6),.9);g.beginPath();for(let q=0;q<9;q+=.35){const rr=r*.08*q;g.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}g.stroke();g.restore()}
 function leaf(g,x,y,s,a,col){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(s*.5,-s*.45,s,0);g.quadraticCurveTo(s*.5,s*.45,0,0);g.fillStyle=col;g.fill();g.strokeStyle=rgba(mix(col,'#000000',.55),.9);g.lineWidth=Math.max(.4,s*.06);g.stroke();
  g.beginPath();g.moveTo(0,0);g.lineTo(s*.9,0);g.stroke();g.restore()}
 function crystal(g,x,y,h,a,col){g.save();g.translate(x,y);g.rotate(a);const w=h*.28;g.beginPath();g.moveTo(0,-h);g.lineTo(w,-h*.7);g.lineTo(w*.8,0);g.lineTo(-w*.8,0);g.lineTo(-w,-h*.7);g.closePath();const gr=g.createLinearGradient(-w,0,w,0);gr.addColorStop(0,mix(col,'#ffffff',.7));gr.addColorStop(.5,col);gr.addColorStop(1,mix(col,'#000000',.4));
  g.fillStyle=gr;g.fill();g.strokeStyle=OL;g.lineWidth=Math.max(.5,h*.05);g.stroke();g.strokeStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(0,-h);g.lineTo(0,0);g.stroke();g.restore()}
 function bolt(g,x,y,len,a,col,seed){g.save();g.translate(x,y);g.rotate(a);let s=Math.abs(seed|0)%2147483000+1;const rn=()=>(s=(s*16807)%2147483647)/2147483647;g.beginPath();g.moveTo(0,0);for(let i=1;i<=6;i++)g.lineTo(len*i/6,(rn()-.5)*len*.28*(i<6?1:0));
  g.strokeStyle=rgba(col,.5);g.lineWidth=Math.max(1,len*.08);g.stroke();g.strokeStyle='#ffffff';g.lineWidth=Math.max(.6,len*.025);g.stroke();g.restore()}
 function flame(g,x,y,s,col,t){g.save();g.translate(x,y);const w=Math.sin((t||0)*9+x)*s*.08;g.beginPath();g.moveTo(-s*.5,0);g.bezierCurveTo(-s*.6,-s*.6,w-s*.1,-s*.9,w,-s*1.4);g.bezierCurveTo(w+s*.15,-s*.8,s*.6,-s*.7,s*.5,0);g.closePath();
  const gr=g.createLinearGradient(0,0,0,-s*1.4);gr.addColorStop(0,col);gr.addColorStop(.6,mix(col,'#ffe9a0',.6));gr.addColorStop(1,'#ffffff');g.fillStyle=gr;g.fill();g.restore()}
 function crow(g,x,y,s,a,col,fl){g.save();g.translate(x,y);g.rotate(a);const f=Math.sin(fl||0)*.6;g.fillStyle=col;g.beginPath();g.moveTo(s,0);g.quadraticCurveTo(s*.3,-s*.18,-s*.2,-s*.05);g.quadraticCurveTo(-s*.1,-s*(.7+f),-s*.7,-s*(.9+f*.6));g.quadraticCurveTo(-s*.35,-s*.3,-s*.5,0);
  g.quadraticCurveTo(-s*.1,s*(.55-f*.4),-s*.8,s*(.6-f*.5));g.quadraticCurveTo(-s*.2,s*.25,s,0);g.fill();g.restore()}
 function drop(g,x,y,s,col){g.save();g.translate(x,y);g.beginPath();g.moveTo(0,-s);g.bezierCurveTo(s*.6,-s*.2,s*.6,s*.6,0,s*.6);g.bezierCurveTo(-s*.6,s*.6,-s*.6,-s*.2,0,-s);g.fillStyle=col;g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-s*.15,s*.05,s*.12,s*.2,0,0,TAU);g.fill();g.restore()}
 function gear(g,x,y,r,col,a){g.save();g.translate(x,y);g.rotate(a||0);g.beginPath();const n=10;for(let i=0;i<n*2;i++){const q=i*Math.PI/n,rr=i%2?r*.78:r;g.lineTo(Math.cos(q-.08)*rr,Math.sin(q-.08)*rr);g.lineTo(Math.cos(q+.08)*rr,Math.sin(q+.08)*rr)}g.closePath();
  g.fillStyle=col;g.fill();g.strokeStyle=OL;g.lineWidth=Math.max(.5,r*.08);g.stroke();g.beginPath();g.arc(0,0,r*.35,0,TAU);g.fillStyle=mix(col,'#000000',.5);g.fill();g.stroke();g.restore()}
 function rune(g,x,y,r,col,a,seed){g.save();g.translate(x,y);g.rotate(a||0);g.strokeStyle=col;g.lineWidth=Math.max(.6,r*.14);g.lineCap='round';const s=Math.abs(seed|0)%4;g.beginPath();
  if(s==0){g.moveTo(0,-r);g.lineTo(0,r);g.moveTo(0,-r*.3);g.lineTo(r*.6,-r*.8);g.moveTo(0,r*.2);g.lineTo(-r*.6,-r*.2)}else if(s==1){g.moveTo(-r*.6,r);g.lineTo(0,-r);g.lineTo(r*.6,r);g.moveTo(-r*.35,r*.2);g.lineTo(r*.35,r*.2)}
  else if(s==2){g.arc(0,0,r*.65,0,TAU);g.moveTo(0,-r);g.lineTo(0,r)}else{g.moveTo(-r*.6,-r);g.lineTo(r*.6,r);g.moveTo(r*.6,-r);g.lineTo(-r*.6,r);g.moveTo(-r*.8,0);g.lineTo(r*.8,0)}g.stroke();g.restore()}
 function shuriken(g,x,y,r,a,col){g.save();g.translate(x,y);g.rotate(a);g.beginPath();for(let i=0;i<4;i++){const q=i*Math.PI/2;g.lineTo(Math.cos(q)*r,Math.sin(q)*r);g.lineTo(Math.cos(q+Math.PI/4)*r*.28,Math.sin(q+Math.PI/4)*r*.28)}g.closePath();g.fillStyle=col;g.fill();g.strokeStyle=OL;g.lineWidth=Math.max(.5,r*.1);g.stroke();
  g.fillStyle=OL;g.beginPath();g.arc(0,0,r*.14,0,TAU);g.fill();g.restore()}
 function ink(g,x,y,r,col,seed){g.save();g.translate(x,y);let s=Math.abs(seed|0)%2147483000+7;const rn=()=>(s=(s*16807)%2147483647)/2147483647;g.fillStyle=col;g.beginPath();for(let i=0;i<14;i++){const q=i/14*TAU,rr=r*(.55+rn()*.6);g.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}g.closePath();g.fill();
  for(let i=0;i<5;i++){const q=rn()*TAU,d=r*(1.1+rn()*.7);g.beginPath();g.arc(Math.cos(q)*d,Math.sin(q)*d,r*(.08+rn()*.14),0,TAU);g.fill()}g.restore()}
 // the class motif at a point (used by particles, engravings, frames and the Classes screen background)
 function motif(g,k,x,y,s,a,t,col){const th=TH[k]||TH.reaper,c=col||th.pal[0];switch(th.mot){
  case'spark':return star4(g,x,y,s,c,a);case'feather':return feather(g,x,y,s*2,a,'#ffffff',mix(c,'#ffffff',.4));case'petal':return petal(g,x,y,s*.8,a,c);case'star':return star4(g,x,y,s,c,a);
  case'rune':return rune(g,x,y,s*.8,c,a,Math.floor(x*13+y*7));case'blood':return drop(g,x,y,s*.8,c);case'crow':return crow(g,x,y,s*1.2,a,mix(th.pal[2],'#000000',.3),(t||0)*14+x);
  case'flame':return(Math.floor(x+y)%2?flame(g,x,y,s,th.pal[3],t):crystal(g,x,y,s*1.3,a,c));case'bolt':return bolt(g,x,y,s*1.6,a,c,Math.floor(x*31+y*17)|1);case'rock':return crystal(g,x,y,s*1.2,a,mix(th.pal[2],'#8a6a5a',.5));
  case'ink':return ink(g,x,y,s*.6,mix(th.pal[2],'#000000',.3),Math.floor(x*3+y));case'leaf':return leaf(g,x,y,s*1.3,a,c);case'gear':return gear(g,x,y,s*.8,th.pal[3],a)}}
 // ---- the mythic scythe. Local space: the shaft runs from x=0 (butt) to x=L (head) along +x; the blade sweeps up (-y) and back.
 // tier 1-5 adds detail: II a second barb and a gem, III a smaller second blade, IV a floating halo ring, V a living glow and sparks.
 function scythe(g,k,tier,L,t,o){const th=TH[k]||TH.reaper,[m,l,d,a]=th.pal,s=L/100;tier=Math.max(1,Math.min(5,tier|0));o=o||{};t=t||0;g.save();g.scale(s,s);g.lineJoin='round';g.lineCap='round';const lw=1.3;
  // aura (tier 4+ and large showcase draws)
  if(tier>=4||o.aura){const pul=.5+.5*Math.sin(t*3),gr=g.createRadialGradient(70,-30,4,70,-30,80);gr.addColorStop(0,rgba(m,.28+pul*.12*(tier>=5?1.6:1)));gr.addColorStop(1,rgba(m,0));g.fillStyle=gr;g.fillRect(-20,-120,180,180)}
  // butt spike + shaft
  g.beginPath();g.moveTo(-3,-2.6);g.lineTo(-17,0);g.lineTo(-3,2.6);g.closePath();g.fillStyle=metal(g,-17,-3,-3,3,k);g.fill();g.strokeStyle=OL;g.lineWidth=lw;g.stroke();
  const sg=g.createLinearGradient(0,-2.4,0,2.4);sg.addColorStop(0,mix(d,'#ffffff',.25));sg.addColorStop(.45,d);sg.addColorStop(1,'#050307');g.fillStyle=sg;g.beginPath();g.roundRect(-4,-2.4,102,4.8,2);g.fill();g.stroke();
  g.strokeStyle=rgba(m,.75);g.lineWidth=.9;g.beginPath();g.moveTo(6,-.6);g.lineTo(90,-.6);g.stroke();   // a vein of class colour down the shaft (like the red streak in the reference)
  g.strokeStyle=rgba(a,.9);g.lineWidth=1.1;for(let x=36;x<54;x+=3.2){g.beginPath();g.moveTo(x,-2.4);g.lineTo(x+2.6,2.4);g.stroke()}   // grip wrap
  for(const x of[28,58,88]){g.fillStyle=metal(g,x,-4,x+4,4,k);g.beginPath();g.roundRect(x,-3.6,4,7.2,1.4);g.fill();g.strokeStyle=OL;g.lineWidth=lw;g.stroke()}
  // barbs under the head (opposite the blade)
  const barb=(x0,y0,x1,y1,cx,cy)=>{g.beginPath();g.moveTo(x0-4,y0);g.quadraticCurveTo(cx,cy,x1,y1);g.quadraticCurveTo(cx+4,cy-2,x0+4,y0);g.closePath();g.fillStyle=metal(g,x0,y0,x1,y1,k,.3);g.fill();g.strokeStyle=OL;g.lineWidth=lw;g.stroke()};
  barb(98,3,84,24,96,16);if(tier>=2)barb(104,2,112,20,110,10);
  // second blade (tier 3+): a smaller crescent hanging down and back
  if(tier>=3){g.save();g.translate(98,6);g.scale(.52,-.52);bladePath(g);g.fillStyle=metal(g,0,0,-80,-60,k,.35);g.fill();g.strokeStyle=OL;g.lineWidth=lw*1.8;g.stroke();g.restore()}
  // main blade
  g.save();g.translate(100,-1);g.scale(1.22,1.22);bladePath(g);g.fillStyle=metal(g,0,0,-86,-58,k,.12);g.fill();g.strokeStyle=OL;g.lineWidth=lw;g.stroke();
  // the coloured pattern along the spine (flame-like band), engraved with the class motif
  g.beginPath();g.moveTo(-2,-7);g.bezierCurveTo(-3,-34,-30,-53,-70,-55);g.bezierCurveTo(-58,-50,-48,-47,-40,-44);g.bezierCurveTo(-46,-40,-30,-38,-24,-34);g.bezierCurveTo(-28,-28,-12,-26,-8,-12);g.closePath();
  const bg=g.createLinearGradient(0,-8,-70,-55);bg.addColorStop(0,d);bg.addColorStop(.5,m);bg.addColorStop(1,mix(m,l,.5));g.fillStyle=bg;g.globalAlpha=.92;g.fill();g.globalAlpha=1;g.strokeStyle=rgba(OL,.6);g.lineWidth=.8;g.stroke();
  for(let i=0;i<3;i++)motif(g,k,-16-i*16,-34-i*6.5+(i==2?2:0),3.4,-.5-i*.25,t,mix(l,'#ffffff',.3));
  // the cutting edge: a hard white line and a soft coloured glow
  g.beginPath();g.moveTo(-6,-6);g.bezierCurveTo(-14,-30,-40,-44,-86,-58);g.strokeStyle=rgba(l,.45);g.lineWidth=3.2;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=1;g.stroke();
  if(tier>=5){g.globalCompositeOperation='lighter';g.globalAlpha=.35+.25*Math.sin(t*5);g.strokeStyle=m;g.lineWidth=6;g.stroke();g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  g.restore();
  // ornate head collar + gem
  g.beginPath();g.moveTo(90,-5);g.lineTo(95,-10);g.lineTo(100,-6);g.lineTo(106,-12);g.lineTo(108,-4);g.lineTo(112,0);g.lineTo(108,4);g.lineTo(100,7);g.lineTo(92,5);g.closePath();g.fillStyle=metal(g,90,-12,112,7,k,.2);g.fill();g.strokeStyle=OL;g.lineWidth=lw;g.stroke();
  curl(g,92,6,7,.4,false,mix(l,'#ffffff',.4),.9);curl(g,104,-11,6,-1.6,true,mix(l,'#ffffff',.4),.9);
  gem(g,101,-1,tier>=2?4:3.2,a,tier>=2||o.aura);
  // halo ring (tier 4+)
  if(tier>=4){g.save();g.translate(101,-1);g.rotate(t*.8);g.strokeStyle=rgba(l,.85);g.lineWidth=1.1;g.beginPath();g.ellipse(0,0,15,6,0,0,TAU);g.stroke();for(let i=0;i<4;i++){const q=i*TAU/4+t;star4(g,Math.cos(q)*15,Math.sin(q)*6,2.6,l,t)}g.restore()}
  // sparks (tier 5) and chains with charms (tier 2+)
  if(tier>=2){g.strokeStyle=rgba(mix(l,'#9a9aa8',.4),.9);g.lineWidth=.8;const sw=Math.sin(t*2)*2;for(let i=0;i<(tier>=4?3:2);i++){g.beginPath();g.moveTo(96+i*4,6);g.quadraticCurveTo(97+i*4+sw,18+i*3,95+i*5+sw,28+i*6);g.stroke();gem(g,95+i*5+sw,30+i*6,1.8,a)}}
  if(tier>=5)for(let i=0;i<5;i++){const q=t*1.7+i*1.26,r=30+12*Math.sin(t*2+i);star4(g,70+Math.cos(q)*r,-30+Math.sin(q)*r*.7,2.2+Math.sin(t*6+i),l,q)}
  g.restore()}
 // outline of the main blade, from the head (0,0) to the tip (-86,-58)
 function bladePath(g){g.beginPath();g.moveTo(3,-1);g.bezierCurveTo(6,-40,-26,-64,-86,-58);g.bezierCurveTo(-46,-50,-20,-38,-8,-8);g.lineTo(-6,4);g.closePath()}
 // ---- avatar frame: an ornate ring around a round portrait of radius r (cached per class and size; sparkles drawn live on top)
 const FC={};
 function frameStatic(k,r){const key=k+'|'+r;if(FC[key])return FC[key];const S=Math.ceil(r*3.2),c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),th=TH[k]||TH.reaper,[m,l,d,a]=th.pal,cx=S/2,cy=S/2;g.lineJoin='round';g.lineCap='round';
  const ring=(rr,w,tint)=>{g.beginPath();g.arc(cx,cy,rr,0,TAU);g.strokeStyle=metal(g,cx-rr,cy-rr,cx+rr,cy+rr,k,tint);g.lineWidth=w;g.stroke()};
  // style adornments behind the ring
  const st=th.fr;
  if(st=='angel'||st=='raven'||st=='demon'){const dark=st!='angel',c1=st=='angel'?'#ffffff':st=='raven'?'#2a2038':'#3a0a14',c2=st=='angel'?mix(m,'#ffffff',.5):st=='raven'?m:'#ff2a4a';
   for(const sd of[-1,1]){if(st=='raven'&&sd>0)continue;for(let i=7;i>=0;i--){const o=Math.PI-.55+i*.15,q=Math.PI-.3+i*.19,len=r*(.7+Math.sin(i/7*Math.PI)*.45+(i>5?.1:0)),ox=cx+Math.cos(o)*r*.92,oy=cy+Math.sin(o)*r*.92;if(sd<0)feather(g,ox,oy,len,q,dark?c1:'#ffffff',c2);else feather(g,2*cx-ox,oy,len,Math.PI-q,dark?c1:'#ffffff',c2)}}
   if(st=='raven'){g.save();g.translate(cx+r*1.02,cy+r*.35);const og=g.createRadialGradient(0,0,0,0,0,r*.3);og.addColorStop(0,'#ffffff');og.addColorStop(.3,a);og.addColorStop(1,mix(d,'#000000',.2));g.fillStyle=og;g.beginPath();g.arc(0,0,r*.24,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=r*.03;g.stroke();
    g.strokeStyle='#1a1424';g.lineWidth=r*.05;for(let i=0;i<3;i++){g.beginPath();g.arc(0,0,r*(.28+i*.03),i,i+2.4);g.stroke()}g.restore()}
   if(st=='demon')for(const sd of[-1,1]){g.beginPath();g.moveTo(cx+sd*r*.35,cy-r*.85);g.quadraticCurveTo(cx+sd*r*.75,cy-r*1.45,cx+sd*r*.25,cy-r*1.55);g.quadraticCurveTo(cx+sd*r*.5,cy-r*1.2,cx+sd*r*.15,cy-r*.95);g.closePath();g.fillStyle=metal(g,cx,cy-r*1.5,cx+sd*r,cy-r*.8,k,.4);g.fill();g.strokeStyle=OL;g.lineWidth=r*.03;g.stroke()}}
  if(st=='blossom'){for(let i=0;i<9;i++){const q=Math.PI*.15+i*.32;petal(g,cx+Math.cos(q)*r*1.08,cy+Math.sin(q)*r*1.08,r*.16,q+1.2,i%2?m:mix(m,'#ffffff',.4))}g.strokeStyle='#3a1a14';g.lineWidth=r*.05;g.beginPath();g.arc(cx,cy,r*1.12,Math.PI*.1,Math.PI*.95);g.stroke()}
  if(st=='star'){g.save();g.translate(cx,cy-r*1.12);g.fillStyle=metal(g,-r*.3,-r*.3,r*.3,r*.3,k,.1);g.beginPath();g.arc(0,0,r*.26,0,TAU);g.arc(r*.1,-r*.05,r*.22,0,TAU,true);g.fill('evenodd');g.restore();for(let i=0;i<6;i++){const q=i*TAU/6+.3;star4(g,cx+Math.cos(q)*r*1.18,cy+Math.sin(q)*r*1.18,r*(i%2?.12:.2),l)}}
  if(st=='crystal'||st=='frost'){for(let i=0;i<5;i++){const q=Math.PI*.55+(i-2)*.28;crystal(g,cx+Math.cos(q)*r*.98,cy+Math.sin(q)*r*.98,r*(.5-Math.abs(i-2)*.1),q+Math.PI/2,i%2?l:m)}for(let i=0;i<3;i++){const q=-Math.PI/2+(i-1)*.35;crystal(g,cx+Math.cos(q)*r*.98,cy+Math.sin(q)*r*.98,r*(.32-Math.abs(i-1)*.08),q+Math.PI/2,m)}}
  if(st=='flame'){for(let i=0;i<9;i++){const q=Math.PI*.1+i*.35;g.save();g.translate(cx+Math.cos(q)*r,cy+Math.sin(q)*r);g.rotate(q+Math.PI/2);flame(g,0,0,r*.28,a,i);g.restore()}}
  if(st=='storm'){for(let i=0;i<6;i++){const q=i*TAU/6+.4;bolt(g,cx+Math.cos(q)*r*.98,cy+Math.sin(q)*r*.98,r*.55,q,m,i*7+3)}}
  if(st=='ink'){for(let i=0;i<5;i++){const q=Math.PI*.6+i*.5;ink(g,cx+Math.cos(q)*r*1.02,cy+Math.sin(q)*r*1.02,r*.16,mix(d,'#000000',.3),i*11)}g.strokeStyle=mix(d,'#000000',.3);g.lineWidth=r*.12;g.beginPath();g.arc(cx,cy,r*1.08,Math.PI*.9,Math.PI*1.6);g.stroke()}
  if(st=='rose'){g.strokeStyle='#1e3a18';g.lineWidth=r*.05;g.beginPath();g.arc(cx,cy,r*1.06,Math.PI*.5,Math.PI*1.4);g.stroke();for(let i=0;i<6;i++){const q=Math.PI*.55+i*.16;leaf(g,cx+Math.cos(q)*r*1.06,cy+Math.sin(q)*r*1.06,r*.22,q+(i%2?.8:-.8),m)}
   rose(g,cx-r*.72,cy+r*.78,r*.24,a);rose(g,cx+r*.8,cy-r*.72,r*.2,a);rose(g,cx-r*.98,cy+r*.3,r*.15,mix(a,'#ffffff',.3))}
  if(st=='gear'){gear(g,cx-r*.85,cy+r*.8,r*.32,mix(a,'#8a6420',.3),.2);gear(g,cx+r*.95,cy-r*.65,r*.22,mix(a,'#8a6420',.3),.5);for(let i=0;i<12;i++){const q=i*TAU/12;g.fillStyle=metal(g,0,0,4,4,k);g.beginPath();g.arc(cx+Math.cos(q)*r*1.08,cy+Math.sin(q)*r*1.08,r*.045,0,TAU);g.fill()}}
  // the ring itself: a thick metal band, an inner coloured line, filigree curls and gems
  ring(r*1.02,r*.13,.15);g.beginPath();g.arc(cx,cy,r*1.02,0,TAU);g.strokeStyle=OL;g.lineWidth=r*.02;g.stroke();ring(r*.9,r*.04,.4);g.beginPath();g.arc(cx,cy,r*.93,0,TAU);g.strokeStyle=rgba(m,.9);g.lineWidth=r*.025;g.stroke();
  for(let i=0;i<8;i++){const q=i*TAU/8+TAU/16;curl(g,cx+Math.cos(q)*r*1.1,cy+Math.sin(q)*r*1.1,r*.2,q+.4,i%2==1,mix(l,'#ffffff',.4),r*.03)}
  gem(g,cx,cy-r*1.04,r*.14,a,true);gem(g,cx,cy+r*1.04,r*.11,a,true);gem(g,cx-r*1.04,cy,r*.07,m);gem(g,cx+r*1.04,cy,r*.07,m);
  // a charm chain hanging under the bottom gem
  g.strokeStyle=rgba(l,.8);g.lineWidth=r*.02;g.beginPath();g.moveTo(cx-r*.3,cy+r*1.0);g.quadraticCurveTo(cx,cy+r*1.25,cx+r*.3,cy+r*1.0);g.stroke();gem(g,cx,cy+r*1.24,r*.05,a);
  FC[key]=c;return c}
 function frame(g,k,cx,cy,r,t){const c=frameStatic(k,Math.round(r)),S=c.width;g.drawImage(c,cx-S/2,cy-S/2);const th=TH[k]||TH.reaper;
  for(let i=0;i<5;i++){const q=i*1.7+t*.4,tw=.5+.5*Math.sin(t*3+i*2.1);if(tw<.35)continue;g.globalAlpha=tw;star4(g,cx+Math.cos(q)*r*1.18,cy+Math.sin(q)*r*1.18,r*.09*tw+1,i%2?'#ffffff':th.pal[1],t);g.globalAlpha=1}}
 // ---- the hanging class banner: a cloth pennant on a rod, swaying, with a swallowtail, a trim, tassels and the class emblem
 function banner(g,k,w,h,t){const th=TH[k]||TH.reaper,[m,l,d,a]=th.pal,sway=Math.sin(t*1.3)*.5;g.save();g.lineJoin='round';
  const rodY=5;g.fillStyle=metal(g,0,rodY-2,w,rodY+2,k);g.beginPath();g.roundRect(1,rodY-2.2,w-2,4.4,2);g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();gem(g,2.5,rodY,2.6,a);gem(g,w-2.5,rodY,2.6,a);
  const x0=w*.14,x1=w*.86,yb=h-2,yn=h*.8,wave=y=>Math.sin(t*2.1+y*.06)*1.4*(y/h)+sway*(y/h)*3;
  g.beginPath();g.moveTo(x0,rodY+2);for(let y=rodY+2;y<=yb;y+=4)g.lineTo(x0+wave(y),y);g.lineTo((x0+x1)/2+wave(yn),yn);g.lineTo(x1+wave(yb),yb);for(let y=yb;y>=rodY+2;y-=4)g.lineTo(x1+wave(y),y);g.closePath();
  const cg=g.createLinearGradient(0,0,w,h);cg.addColorStop(0,mix(m,'#ffffff',.15));cg.addColorStop(.5,mix(m,d,.35));cg.addColorStop(1,d);g.fillStyle=cg;g.fill();g.strokeStyle=OL;g.lineWidth=1;g.stroke();
  // inner trim line
  const ix0=x0+3,ix1=x1-3;g.beginPath();g.moveTo(ix0,rodY+5);for(let y=rodY+5;y<=yb-6;y+=4)g.lineTo(ix0+wave(y),y);g.lineTo((x0+x1)/2+wave(yn-5),yn-5);g.lineTo(ix1+wave(yb-6),yb-6);for(let y=yb-6;y>=rodY+5;y-=4)g.lineTo(ix1+wave(y),y);g.closePath();g.strokeStyle=rgba(a,.9);g.lineWidth=1;g.stroke();
  // fold shading
  g.globalAlpha=.18;g.fillStyle='#000000';g.fillRect((x0+x1)/2-2+wave(h*.5),rodY+4,4,h*.6);g.globalAlpha=1;
  // emblem: a ring with the motif, and a little crest of the class colour
  const ex=(x0+x1)/2+wave(h*.42),ey=h*.42,er=Math.min(w*.26,h*.15);g.beginPath();g.arc(ex,ey,er,0,TAU);g.fillStyle=rgba(d,.55);g.fill();g.strokeStyle=metal(g,ex-er,ey-er,ex+er,ey+er,k,.1);g.lineWidth=1.6;g.stroke();
  motif(g,k,ex,ey,er*.7,-.6,t,l);star4(g,ex,ey-er-3,2.4,a,t);
  for(const tx of[x0+1,x1-1]){const tw=wave(yb);g.strokeStyle=rgba(a,.9);g.lineWidth=.8;g.beginPath();g.moveTo(tx+tw,tx==x0+1?yb-8:yb);g.lineTo(tx+tw+sway,tx==x0+1?yb-2:yb+6);g.stroke();gem(g,tx+tw+sway,tx==x0+1?yb-1:yb+7,1.6,a)}
  g.restore()}
 return{TH,KEYS:Object.keys(TH),hex,rgba,mix,metal,curl,gem,star4,feather,petal,rose,leaf,crystal,bolt,flame,crow,drop,gear,rune,shuriken,ink,motif,scythe,frame,frameStatic,banner,OL}})();
