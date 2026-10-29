// ===== NPC2: living Plaza NPCs. Behaviour state machine (idle / walk / work / greet / attend / talk / rest / react) on defined routes,
// tile-collision aware movement, contextual dialogue (time of day, weather, player level), nameplates, subtle service indicators.
// Shop (Mira), smith (Bram) and quests (Elder Oak) stay the legacy NPCS entries, so every existing dialog keeps working.
// Art comes from NPCART (77-npc.js); every pose frame is cached on an offscreen canvas, so a frame costs one drawImage per NPC.
const NPC2=(()=>{
 const TAU=6.2832,{abs,min,max,sin,cos,floor,round,ceil,random}=Math,R=(a,b)=>a+random()*(b-a),sgn=v=>v<0?-1:1;
 // animation table: [frames, seconds per loop, play once]
 const A0={idle:[6,2.6],walk:[8,0],greet:[6,1.2,1],talk:[4,.9]};
 const AN={merchant:{...A0,inspect:[8,2.4],coins:[6,1.3]},smith:{...A0,work:[8,1.05],wipe:[6,2,1]},farmer:{...A0,water:[8,1.8],tend:[6,2.2],wipe:[6,2,1]},guard:{...A0},
  mage:{...A0,read:[6,3.4],cast:[8,1.8,1]},traveler:{...A0,map:[6,2.8],sit:[4,3.2],stretch:[6,1.8,1]},elder:{...A0,sit:[4,3.6],think:[6,2.6]},
  villager:{...A0,sit:[4,3],react:[4,.7,1],play:[6,.9],sweep:[6,1.4],sip:[6,3.2],stretch:[6,1.8,1]},lumi:{fly:[6,.42],perch:[4,3],greet:[6,.8,1],talk:[6,.6]},hollow:{idle:[8,4],greet:[6,1.6,1],talk:[8,4],react:[4,.6,1]}};
 const BOX={def:[130,124,65,114],villager:[90,76,45,68],lumi:[70,64,35,36]},STRIDE={def:30,villager:22,guard:34,elder:22};
 // ---- cast. Every NPC has a CLASS7 class and lives in its own class house (PLZ7.HS / HOUSE7 facades). Positions here are in tiles
 // from the left edge of the NPC's house (px = (house.x0 + v) * T) and are converted below to the old DX-relative offsets;
 // r = route bounds; acts = weighted activities; props = station props drawn in front of the house
 const DEF={
  mira:{arch:'merchant',home:6.5,r:[6.5,10],spd:30,top:74,hue:35,L:{skin:'#f3d3b4',hair:'#c0542e',es:0,eyeCol:'#35c9c0'},c:{skin:'#f3d3b4',coat:'#e0903a',hat:'#7a4a2a',scarf:'#d8435a',pants:'#3a2f4f',boot:'#4a3020',bag:'#8a5a30',pouch:'#b07a40',sash:'#5a3a6a'},
   acts:[{a:'inspect',at:10,f:1,d:[3,6],w:4},{a:'coins',at:9,d:[2.4,4],w:2},{a:'idle',wander:1,d:[2,4],w:2},{a:'idle',at:6.5,f:1,d:[2.5,5],w:2}],props:[['stall',11.05]]},
  oak:{arch:'elder',home:6,r:[2.55,9.4],spd:15,top:62,hue:120,L:{skin:'#f0d0b0',hair:'#ecebe2',es:1,eyeCol:'#6a9a5a'},c:{skin:'#f0d0b0',robe:'#5aa05a',trim:'#e8e2c0',sash:'#7a5a2a',cane:'#7a5230',leaf:'#6fbf6a',boot:'#5a4030'},
   acts:[{a:'sit',at:2.55,f:-1,d:[8,14],w:4},{a:'think',at:9.4,f:1,d:[3,5],w:2},{a:'idle',wander:1,d:[2,4],w:2}],props:[['bench',2.5]]},
  bram:{arch:'smith',home:10,r:[10,10.4],spd:26,top:74,hue:210,L:{skin:'#e8b890',hair:'#2b2b33',es:2,eyeCol:'#e0a040'},c:{skin:'#e8b890',shirt:'#a8483a',apron:'#5a3a24',glove:'#3a2a22',pants:'#3a3440',boot:'#2a2020'},
   acts:[{a:'work',at:10.3,f:1,d:[4,8],w:6},{a:'wipe',at:10,f:-1,d:[2,2],w:1},{a:'idle',at:10,d:[2,3.5],w:1}],props:[['forge',12.15],['anvil',11.05]]},
  hana:{n:'Hana',role:'Gardener',arch:'farmer',home:6,r:[2.5,13.9],spd:28,top:66,hue:95,L:{skin:'#f1c9a0',hair:'#6a3e22',es:0,eyeCol:'#4fae5a'},c:{skin:'#f1c9a0',shirt:'#f2e6c8',over:'#4f7ab8',boot:'#5a4030',hat:'#e8c96a',band:'#c0504a',can:'#7fb0c0'},
   acts:[{a:'water',at:12.6,f:1,d:[3,5],w:3},{a:'tend',at:13.9,f:1,d:[3,6],w:3},{a:'wipe',d:[2,2],w:1},{a:'idle',wander:1,d:[2,4],w:2}],props:[['crops',14.1]]},
  seren:{n:'Seren',role:'Astral Mage',arch:'mage',home:5.5,r:[4,7],spd:20,top:84,hue:265,L:{skin:'#f6dcc8',hair:'#d2d8ff',es:3,eyeCol:'#b06aff'},c:{skin:'#f6dcc8',robe:'#3b3f9a',inner:'#6a4ab0',trim:'#ffd24a',cape:'#2a2d78',hat:'#2e3180',staff:'#e8e0ff',moon:'#ffe9a8',gem:'#7fe9ff',book:'#8a3a5a',page:'#f4ead0'},
   acts:[{a:'read',f:1,d:[4,8],w:4},{a:'cast',f:1,d:[1.8,1.8],w:2},{a:'idle',wander:1,d:[2,4],w:2}]},
  kael:{n:'Kael',role:'Gate Guard',arch:'guard',home:6.5,r:[2,11],spd:34,top:82,hue:220,L:{skin:'#e9c4a0',hair:'#3a4a6a',es:2,eyeCol:'#6aa8ff'},c:{skin:'#e9c4a0',armor:'#b8c2d4',armorD:'#5a6478',tab:'#3a6ad0',gold:'#ffd24a',pants:'#2a3040',glove:'#6a5040',plume:'#d8434a',shaft:'#7a5a3a',tip:'#dfe6f0',shield:'#3a6ad0'},
   acts:[{a:'walk',patrol:1,d:[2,4],w:5},{a:'idle',f:-1,d:[3,6],w:3},{a:'idle',look:1,d:[3,4.5],w:2}]},
  pip:{n:'Pip',role:'Village Kid',arch:'villager',v:'kid',home:5.5,r:[2.5,6],spd:40,top:54,hue:170,L:{skin:'#f6d2b0',hair:'#e08a3a',es:3,eyeCol:'#35c9c0'},c:{skin:'#f6d2b0',shirt:'#ff9a4a',pants:'#4a5a8a',boot:'#7a4a3a',cap:'#3fb0a0'},
   acts:[{a:'sit',at:3.2,f:1,d:[6,11],w:4},{a:'play',d:[1.8,2.7],w:2},{a:'idle',wander:1,d:[1.5,3],w:2}]},
  lulu:{n:'Lulu',role:'Teahouse Keeper',arch:'villager',v:'girl',home:6,r:[2.5,9.5],spd:26,top:58,hue:330,L:{skin:'#f3d3b4',hair:'#6a3a7a',es:0,eyeCol:'#e06a9a'},c:{skin:'#f3d3b4',dress:'#ff9fbf',apron:'#fff6f0',boot:'#8a4a5a',clip:'#ffd24a'},
   acts:[{a:'sweep',wander:1,d:[3,6],w:3},{a:'sit',at:8.95,f:1,d:[6,10],w:2},{a:'sip',d:[3.2,6.4],w:2},{a:'idle',wander:1,d:[2,4],w:2}],props:[['table',9.7]]},
  tobi:{n:'Tobi',role:'Baker',arch:'villager',v:'stout',home:2.5,r:[1,10],spd:30,top:58,hue:30,L:{skin:'#e8b890',hair:'#4a2e1a',es:1,eyeCol:'#8a6a3a'},c:{skin:'#e8b890',shirt:'#e8a050',apron:'#f6f0e4',pants:'#6a5040',boot:'#4a3020',band:'#d05a4a',basket:'#c08a4a',bread:'#e0a860'},
   acts:[{a:'idle',wander:1,d:[1.5,3.5],w:5},{a:'stretch',d:[1.8,1.8],w:1},{a:'idle',d:[2,4],w:2}]},
  ren:{n:'Ren',role:'Wandering Traveler',arch:'traveler',home:5.5,r:[2.5,8.5],spd:34,top:70,hue:200,L:{skin:'#ecc9a8',hair:'#1e1c26',es:1,eyeCol:'#9aa4c0'},c:{skin:'#ecc9a8',coat:'#2a2a33',inner:'#45454f',scarf:'#4a7a7a',pants:'#25252c',boot:'#1a1a20',pack:'#6a5a44',roll:'#9a3a3a',map:'#e8dcb8'},
   acts:[{a:'idle',wander:1,d:[2,4],w:4},{a:'map',d:[3,5],w:3},{a:'sit',d:[6,11],w:2},{a:'stretch',d:[1.8,1.8],w:1}]},
  lumi:{n:'Lumi',role:'Moth Spirit',arch:'lumi',home:6,fly:1,top:24,hue:285,c:{wing:'#efe2ff',wing2:'#dcc8fa',vein:'#b49ae0',spot:'#8a6ac8',spot2:'#ffd27a',body:'#fff1dc',fluff:'#fffaf2',ant:'#9a84c4'}},
  hollow:{n:'The Hollow',role:'Night Wanderer',arch:'hollow',home:6,r:[4.5,8],spd:10,top:82,hue:250,night:1,c:{body:'#17131f',hair:'#0e0b14',pants:'#1e1a28',sash:'#8a8494',hand:'#dcd8e8',eye:'#f6f8ff'},
   acts:[{a:'idle',d:[4,8],w:4},{a:'idle',wander:1,d:[3,5],w:1}]},
  vesper:{n:'Vesper',role:'Fortune Teller',arch:'mage',home:6.5,r:[3,10],spd:20,top:84,hue:345,L:{skin:'#f1d4c8',hair:'#2a1a2e',es:2,eyeCol:'#ff4a6a'},c:{skin:'#f1d4c8',robe:'#6a1a2e',inner:'#2a0e18',trim:'#ff6a8a',cape:'#2a0a14',hat:'#1e0a14',staff:'#3a2a3a',moon:'#ff8ab0',gem:'#ff4a6a',book:'#2a1a2a',page:'#f4d0d8'},
   acts:[{a:'read',f:-1,d:[4,8],w:3},{a:'cast',f:1,d:[1.8,1.8],w:2},{a:'idle',wander:1,d:[2,4],w:3}]}};
 // house-local tiles -> DX-relative tile offsets (hx() below), class from the NPC's house
 for(const id in DEF){const d=DEF[id],h=PLZ7.house(id);if(!h)continue;const cv_=v=>h.x0+v-.5-DX;d.cls=h.c;d.home=cv_(d.home);if(d.r)d.r=d.r.map(cv_);if(d.acts)for(const a of d.acts)if(a.at!=null)a.at=cv_(a.at);if(d.props)d.props=d.props.map(([k,o])=>[k,cv_(o)])}
 // class tips each NPC can share (on top of the class passive from CLASS7)
 const TIPS={ninja:'Shuriken, chakrams and glaives attack fast and land the odd critical. Never stop moving.',reaper:'Reapers cut weakened monsters to pieces, and every kill heals you. Finish what you start.',
  archer:'Bows hit harder the farther the target is. Keep your distance and let the arrow do the walking.',stormcaller:'Hammers and sparks can stun. Hit, stun, hit again... like kneading dough.',
  mage:'Each Mage level adds spell damage. Wands and staves reward patience, and a very good hat.',gunslinger:'Gunslingers pull the trigger faster with every level and land headshots. Aim for the eyes!',
  druid:'Hold a druid weapon and you slowly heal. Perfect for long digs far from town.',berserker:'Berserkers hit harder the lower their health. Dangerous... and very fun.',
  knight:'Knight blades knock monsters back and sometimes stun them. Hold the line.',samurai:'A samurai blade can land a 1.6x critical cut. Strike once, strike true.',
  brawler:'Brawlers recover faster between punches, and fists never break. Start here, stay forever.',elementalist:'Burns, chills and freezes last longer the more you level Elementalist.',demon:'Demon weapons steal life with every hit. Stay greedy, stay alive.'};
 // ---- dialogue. 'x|text' = only when context x holds: n night, d day, c clear day, r rain, s snow, l low level, h high level. {name} {lvl}
 const LINES={
  mira:{g:['Welcome, welcome!','Fresh stock today!','Psst... shiny things!','n|Late-night bargains!','r|Come in out of the rain!'],
   t:['Seeds, blocks, a World Lock... if it fits in a bag, I sell it.','I check every gem with my monocle. Twice. Then once more for luck.','A merchant who shoots straight gets paid on time. Gunslinger rule number one.','Want a challenge? Ride the Sky Beam in the square up to the Sky Run.','Sell me your spare ore, {name}. I pay fair, and I pay in gems.','l|New here? Grab some seeds first. Trees pay you back forever.','h|Level {lvl}? My, you could buy out the whole stall.','n|Lantern light makes the gems sparkle. Good for business!','r|Rain is bad for paper and good for umbrellas. I sell neither, sadly.','s|Snow! Keep your hands warm and your coin purse warmer.']},
  oak:{g:['Ah, a visitor.','The roots remember you.','Sit, sit.','n|Up late, little sprout?'],
   t:['Every task you finish makes the roots of this world grow a little deeper.','Pip asks for a story every day. I have told him the same one forty times.','Patience, {name}. A sapling does not become a forest in one night.','l|Begin with small tasks: break some stone, harvest a ripe tree.','h|Level {lvl}... you have grown taller than my oldest oak.','n|At night the plaza listens. Walk west to the Lantern Crypt and you may meet the Hollow.','Druids and old trees agree: roots first, then branches. That is why my lodge has a moss roof.','r|Rain is the sky watering us all. Even old trees like me.','s|Snow tucks the seeds in for a long sleep.']},
  bram:{g:['Mind the sparks!','Hah! Good timing.','Need a sharper edge?','n|The forge never sleeps.'],
   t:['Bring me Stone and gems and I will make that tool sing.','Equip the tool you want upgraded first. I am a smith, not a mind reader.','This anvil is older than the plaza. It has opinions.','Berserkers forge angry. The angrier the hammer, the sharper the axe.','l|Even a fist hits harder after a visit to Bram.','h|That gear has seen some fights. Respect.','n|Embers glow brighter at night. Best time to temper steel.','r|Rain hisses on the forge. Sounds like applause.','s|Snow day? The forge is the warmest spot in the plaza.']},
  hana:{g:['Hi there!','Watch the sprouts!','Oh! Hello!','c|Lovely sun today!'],
   t:['This patch feeds half the plaza. The other half eats Tobi\'s bread.','Plant seeds on soil and come back later. Ripe trees give the best harvest.','I talk to my cabbages. They are very good listeners.','An archer needs good eyes. Carrots help. That is my official archery advice.','r|Rain means a day off from watering!','s|Shh, the seeds are sleeping under the snow.','n|At night the sunflower dreams about the sun.','l|A tip: gardening gear makes you a better farmer.']},
  seren:{g:['The stars greet you.','Mm? Oh, hello.','n|The sky is loud tonight.'],
   t:['The crystal above my tower hums. I am trying to learn its song.','Magic is mostly reading. And patience. And a very good hat.','Every star above the plaza is a world nobody has built yet.','A mage tower must be tall. The stars are shy and do not like to shout.','n|Look up, {name}. Can you see the constellations shifting?','d|Daylight hides the runes. I read them anyway.','r|Rain scatters starlight. My spells come out a little soggy.','h|Your aura is strong, {name}. The crystal noticed.']},
  kael:{g:['Halt! ...Ah, it is you.','All quiet.','Safe travels.','n|Stay near the lanterns.'],
   t:['Nothing passes this gate without me knowing. Except butterflies.','The World Gate in the square leads to other worlds. Monsters live out there, not here.','A knight keeps the keep. I keep the keep AND the gate. Double duty.','I have walked this patrol ten thousand times. Three steps, turn, three steps.','n|Monsters roam the wild worlds at night. Bring light and a good weapon.','l|Practice on small monsters first. Then see Bram.','h|With gear like that, maybe YOU should guard the gate.','r|Rain or shine, the watch goes on.']},
  pip:{g:['Hi hi!','Whoa, cool!','Are you an adventurer?'],
   t:['Elder Oak is telling me about the First Root. Again! I love this part.','When I grow up I want wings like yours. Bigger, though.','Lumi naps on the shrine lantern all day. I tried it. I fell off.','I am a Brawler! Hi-yah! Fists never break, so I never have to buy a sword.','l|I bet I can break blocks faster than you! ...Maybe not.','h|Level {lvl}?! That\'s like... a million!','n|I\'m not sleepy. Not even a little. *yawn*']},
  lulu:{g:['Welcome in!','Tea is ready!','Mind the clean floor!'],
   t:['Jasmine, mint or moonleaf? ...They come from the same pot, honestly.','The teahouse has two floors. I have swept both twice today.','Seren drinks her tea cold. She forgets it while she reads.','I was a samurai once. Now I cut tea leaves. The blade is just as sharp.','r|Rainy days are teahouse days.','s|Hot tea, snow outside. Perfect.','n|We are closed... but for you, one quiet cup.']},
  tobi:{g:['Fresh bread!','Morning!','Smell that?','n|Midnight snack?'],
   t:['I bake at dawn, walk all day and sell out by noon. Then I bake again.','This basket has carried a thousand loaves. Maybe two thousand.','The pond is lovely, but after dark someone stands among the crypt stones.','My windmill catches storms. Lightning bakes the best crust, I swear.','r|Rain makes the crust soggy. I walk faster.','s|Cold hands, warm bread.','h|A strong adventurer needs a strong breakfast!']},
  ren:{g:['Hey.','Long road?','Oh, a fellow wanderer.'],
   t:['I have walked through a hundred worlds. This plaza is the only one that feels like home.','My map has more holes than paper by now. I keep it anyway.','Tip: type any name at the World Gate and a fresh world will be waiting.','The pond at the west end is the best fishing spot in town. Moonfish bite at night.','A ninja travels light: one blade, one map, zero footprints.','n|Stars are the best map. They never fold wrong.','r|Rain? I have slept in worse. Much worse.','l|Travel light and pack seeds. Trust me.','h|You look like someone who has seen a few worlds too.']},
  lumi:{g:['*flutter*','Mrrp!','n|*happy wing flaps*','d|*sleepy chirp*'],
   t:['*Lumi circles you once and leaves a trail of soft sparkles.*','*She chirps. You feel a little lighter.*','*Lumi spins a tiny ember and a tiny snowflake around each other. Elementalist show-off.*','d|*Lumi is napping on the lantern. One antenna twitches at you.*','n|*Lumi dances in the lantern light.*']},
  vesper:{g:['Mm, a visitor.','The embers like you.','Your fortune? Sit, sit.','n|The night tastes sweet.'],
   t:['They call me a demon. I prefer fortune teller with a temper.','Every hit you land can feed you, if you wield the right blade. Demon blades, of course.','Ember Manor stood here before the World Gate. Ask Elder Oak, if he remembers.','n|At midnight the manor fires burn violet. Pretty, no?','l|Fear is just hunger for adventure, little one.','h|Level {lvl}. Your soul burns brightly. Delicious... I mean, impressive.','I see a big world in your future. Several, actually. Through the gate.']},
  hollow:{g:['...','You see me?','...the roots are deep.'],
   t:['I was here before the plaza. I will be here when the stars move.','Do not fear the dark, {name}. It is only light, waiting.','The thorns do not hurt. They remind me where I end.','When the sun rises I return to the crypt shadows. Look for me again.','A reaper does not take. A reaper only collects what is already falling.']}};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 function ctx(){let w='';try{w=WX6.cur||''}catch(_){}w=w||String(wxN||'');const n=night>.6;return{n,d:!n,c:!n&&!/rain|storm|drizzle|snow|blizzard|cloud|fog/.test(w),r:/rain|storm|drizzle/.test(w),s:/snow|blizzard/.test(w),l:lvl<6,h:lvl>=20}}
 function pick(arr,last){const C=ctx(),a=[],gen=[];for(const s of arr){const i=s.indexOf('|');if(i>0&&i<4){if([...s.slice(0,i)].every(k=>C[k]))a.push(s.slice(i+1))}else gen.push(s)}
  let pool=a.length&&(random()<.6||!gen.length)?a:gen;if(pool.length>1)pool=pool.filter(s=>s!=last);const s=pool[floor(random()*pool.length)]||'...';return s.replace(/\{name\}/g,String(myName||'friend').slice(0,14)).replace(/\{lvl\}/g,lvl)}
 // ---- roster: the 3 service NPCs are the legacy NPCS objects (shop/smith/quest logic reads them), the rest are ambient talkers
 const L=[];
 for(const id in DEF){const d=DEF[id];let n=NPCS.find(q=>q.id==id);if(!n){n={id,n:d.n,role:d.role,k:'talk',x:DX+round(d.home)};}
  if(id=='oak')n.role='Quest Elder';n.roleBase=n.role;n.cls=d.cls||null;if(n.cls)n.role=n.roleBase+' · '+n.cls[0].toUpperCase()+n.cls.slice(1);/* CLASS7 loads later; its keys are the class names */n.x=DX+round(d.home);n.house=(PLZ7.NAMES||{})[id]||'';
  Object.assign(n,{arch:d.arch,v:d.v,pal:d.c,L:d.L||{skin:'#fff',hair:'#000',es:0,eyeCol:'#fff'},d,spd:d.spd||30,top:d.top||70,hue:d.hue||200,fly:!!d.fly,night:!!d.night,amb:n.k=='talk'});L.push(n)}
 const hx=o=>(DX+o)*T+T/2;
 // ---- ground + walkable columns (the NPC needs its own tile and the one above free, solid ground below, no water)
 function gRow(c){const h=sh(c);for(let d=0;d<10;d++)for(const r of[h+d,h-d])if(r>2&&r<H-1&&solidAt(c,r)&&!tiles[(r-1)*W+c])return r;return h}
 function walk(c,row){return c>1&&c<W-2&&solidAt(c,row)&&!tiles[(row-1)*W+c]&&!tiles[(row-2)*W+c]&&!wl[(row-1)*W+c]}
 function segs(n){if(n.fly)return;const d=n.d;let c=floor(hx(d.home)/T);n.row=gRow(c);if(!walk(c,n.row)){for(let k=1;k<8;k++){if(walk(c+k,n.row)){c+=k;break}if(walk(c-k,n.row)){c-=k;break}}}
  let a=c,b=c;while(a-1>c-40&&walk(a-1,n.row))a--;while(b+1<c+40&&walk(b+1,n.row))b++;n.sa=a;n.sb=b;const r=d.r||[d.home,d.home];n.lo=max(hx(r[0]),a*T+12);n.hi=min(hx(r[1]),(b+1)*T-12);if(n.lo>n.hi){n.lo=n.hi=c*T+T/2}n.wy=n.row*T}
 const clampX=(n,x)=>max(n.lo,min(n.hi,x));
 // Lumi's perch: the lantern orb on top of her Prism Shrine (PLZ7.perch)
 function perch(n){const p=PLZ7.perch(n.id);if(p)return{x:p.x,y:p.y,ok:true};const c=DX+n.d.home;return{x:c*T+T/2,y:(PLZ7.S-2)*T,ok:false}}
 let inited=0,lastCur='',segT=0;
 function reset(){for(const n of L){segs(n);n.wx=n.fly?perch(n).x:clampX(n,hx(n.d.home));if(n.fly)n.wy=perch(n).y;n.st='act';n.act=null;n.tm=R(.3,2);n.an='idle';n.at=R(0,3);n.ph=0;n.face=random()<.5?1:-1;n.fx=n.face;n.gcd=R(0,4);n.rcd=0;n.seen=0;n.bub=null;n.na=0;n.alpha=n.night?(night>.62?1:0):1;n.on=n.alpha>0;n.bt=R(1,4);n.blink=0;n.vis=0;n.acc=0;n.fi=-1;n.lt=0}}
 function setAn(n,a){const t=AN[n.arch];if(!t[a])a=t.idle?'idle':Object.keys(t)[0];if(n.an!=a){n.an=a;n.at=0}}
 function sayB(n,s,dur){n.bub={s,e:performance.now()+(dur||2600)*1}}
 // choose the next activity (weighted, avoids repeating the same one)
 function next(n){const d=n.d;if(!d.acts){n.st='act';n.tm=R(2,4);setAn(n,'idle');return}let tot=0;const ac=d.acts.filter(a=>a!==n.act||d.acts.length==1);for(const a of ac)tot+=a.w;let r=random()*tot,a=ac[0];for(const q of ac){r-=q.w;if(r<=0){a=q;break}}
  n.act=a;n.actT=R(a.d[0],a.d[1]);n.lk=R(.8,1.6);let tx=n.wx;if(a.patrol){n.pi=n.pi?0:1;tx=n.pi?n.hi:n.lo}else if(a.at!=null)tx=hx(a.at);else if(a.wander)tx=R(n.lo,n.hi);tx=clampX(n,tx);
  if(abs(tx-n.wx)>3){n.st='walk';n.tx=tx}else begin(n)}
 function begin(n){const a=n.act;n.st='act';n.tm=n.actT;if(a&&a.f)n.face=a.f;setAn(n,a&&a.a!='walk'?a.a:'idle');if(a&&a.patrol)n.face=n.pi?-1:1}
 function resume(n){if(!n.act){next(n);return}const a=n.act;let tx=a.at!=null?clampX(n,hx(a.at)):n.wx;if(abs(tx-n.wx)>3){n.st='walk';n.tx=tx}else{n.st='act';n.tm=max(.8,n.tm);if(a.f)n.face=a.f;setAn(n,a.a!='walk'?a.a:'idle')}}
 // ---- particles (sparks, motes, wisps, dust), capped
 const PT=[],PMAX=42;function pt(x,y,vx,vy,l,c,s,k){if(PT.length>=PMAX||document.documentElement.classList.contains('lowfx'))return;PT.push({x,y,vx,vy,l,ml:l,c,s,k})}
 function upd(n,dt){const d=n.d,dxp=P.x-n.wx,adx=abs(dxp),vyP=abs((P.y+P.h)-(n.fly?n.wy+40:n.wy)),near=adx<3.2*T&&vyP<2.4*T,talk=dlgOpen&&curNPC===n;
  n.at+=dt;n.gcd-=dt;n.rcd-=dt;n.pd=near?adx:1e9;
  if((n.bt-=dt)<0){n.blink=1;if(n.bt<-.13){n.blink=0;n.bt=R(2.2,5)}}
  if(n.night){const tg=night>.62?1:0;n.alpha+=(tg-n.alpha)*min(1,dt*.8);if(abs(tg-n.alpha)<.01)n.alpha=tg;n.on=n.alpha>.02;if(!n.on){n.vis=0;return}if(random()<dt*2&&n.vis)pt(n.wx+R(-14,14),n.wy-R(10,70),R(-6,6),R(-14,-4),R(1.2,2),'210,200,255',R(1,2),'w')}
  if(n.fly)return updFly(n,dt,near,talk,dxp);
  if(talk){n.st='talk';n.face=sgn(dxp);setAn(n,'talk');return}
  if(n.st=='talk'){n.st='attend';n.tm=2.5;setAn(n,'idle')}
  if(near&&!n.seen&&!(n.night&&n.alpha<.6)){n.seen=1;if(n.gcd<=0){n.gcd=R(35,55);n.st='greet';n.tm=AN[n.arch].greet?AN[n.arch].greet[1]:1;n.face=sgn(dxp);setAn(n,'greet');if(!dlgOpen)sayB(n,pick(LINES[n.id].g))}}
  if(!near&&adx>4.6*T)n.seen=0;
  // quick reactions: the kid jumps when someone dashes past
  if(AN[n.arch].react&&n.rcd<=0&&adx<1.6*T&&vyP<2*T&&(abs(P.vx)>330||(typeof dash!='undefined'&&dash>0))&&n.st!='talk'){n.rcd=14;n.st='react';n.tm=AN[n.arch].react[1];n.face=sgn(dxp);setAn(n,'react');sayB(n,n.v=='kid'?'Whoa!':'!',1400)}
  switch(n.st){
   case'greet':case'react':n.face=sgn(dxp);if((n.tm-=dt)<=0){const a=n.act,work=a&&a.at!=null&&a.a!='idle'&&a.a!='walk'&&!d.r;if(near&&!(a&&/work|water|tend|read|sit|sweep|inspect/.test(a.a))){n.st='attend';n.tm=R(5,8);setAn(n,'idle')}else resume(n)}break;
   case'attend':if(near)n.face=sgn(dxp);if((n.tm-=dt)<=0||!near){resume(n)}break;
   case'walk':{const dd=n.tx-n.wx,dir=sgn(dd);n.face=dir;setAn(n,'walk');if(sgn(n.fx)!=dir&&abs(n.fx)>.3)break;const step=min(abs(dd),n.spd*dt),nx=n.wx+dir*step,fc=floor((nx+dir*8)/T);
    if(fc<n.sa||fc>n.sb){n.tx=n.wx;begin(n);break}n.wx=nx;n.ph+=step/(STRIDE[n.arch]||STRIDE.def);if(abs(n.tx-n.wx)<.6){n.wx=n.tx;begin(n)}break}
   case'act':{n.tm-=dt;const a=n.act;if(a&&a.look&&(n.lk-=dt)<=0){n.lk=R(.9,1.6);n.face=-n.face}else if(a&&!a.f&&!a.look&&n.an=='idle'&&n.tm>1.2&&random()<dt*.18)n.face=-n.face;if(n.tm<=0)next(n);break}
   default:next(n)}
  // role effects
  if(n.vis){const an=n.an,sp=AN[n.arch][an],fi=sp?floor((sp[2]?min(n.at/sp[1],.999):(n.at/sp[1])%1)*sp[0]):0;
   if(n.arch=='smith'&&an=='work'&&fi==5&&n.fi!=5){const av=(d.props||[]).find(p=>p[0]=='anvil'),ax=hx(av?av[1]:d.home+1.05)+12,ay=n.wy-21;for(let i=0;i<5;i++)pt(ax,ay,R(-60,60),R(-120,-40),R(.3,.6),'255,'+floor(R(150,220))+',70',R(1.4,2.4),'s');if(adx<6*T)try{snd(1700+random()*400,.05,'triangle',.01)}catch(_){}}
   if(n.arch=='mage'&&(an=='read'||an=='cast')&&random()<dt*(an=='cast'?7:2.2))pt(n.wx+n.face*(an=='cast'?24:14),n.wy-90,R(-8,8),R(-18,-6),R(1,1.8),an=='cast'?'140,230,255':'220,200,255',R(1,1.8),'m');
   n.fi=fi}}
 function updFly(n,dt,near,talk,dxp){const pr=perch(n),wake=night>.55||talk||(near&&n.seen);n.t2=(n.t2||0)+dt;
  if(talk||n.st=='greet'||(near&&wake)){if(!n.seen&&near){n.seen=1;if(n.gcd<=0){n.gcd=R(30,50);n.st='greet';n.tm=.8;setAn(n,'greet');if(!dlgOpen)sayB(n,pick(LINES[n.id].g))}}
   if(n.st=='greet'&&(n.tm-=dt)<=0)n.st='act';const tx=P.x-sgn(dxp)*34,ty=P.y-14+sin(n.t2*3)*5;n.wx+=(tx-n.wx)*min(1,dt*2.2);n.wy+=(ty-n.wy)*min(1,dt*2.2);n.face=sgn(P.x-n.wx);if(n.st!='greet')setAn(n,talk?'talk':'fly')}
  else{if(!near&&abs(dxp)>4.6*T)n.seen=0;
   if(night>.55){const t=n.t2*.55,tx=pr.x+sin(t)*58,ty=pr.y-40+sin(t*2)*16;n.wx+=(tx-n.wx)*min(1,dt*1.6);n.wy+=(ty-n.wy)*min(1,dt*1.6);n.face=cos(t)>=0?1:-1;setAn(n,'fly')}
   else{const dx=pr.x-n.wx,dy=pr.y-n.wy,far=abs(dx)+abs(dy)>3;n.wx+=dx*min(1,dt*2);n.wy+=dy*min(1,dt*2);if(far){setAn(n,'fly');n.face=sgn(dx)}else{n.wx=pr.x;n.wy=pr.y;setAn(n,'perch')}}}
  if(n.vis&&n.an!='perch'&&random()<dt*3)pt(n.wx+R(-10,10),n.wy+R(-4,8),R(-10,10),R(4,16),R(.8,1.4),'255,236,190',R(1,1.8),'m')}
 // ---- tick (called from update): far / off-screen NPCs think at ~5 Hz
 function tick(dt){if(cur!='plaza'){if(lastCur=='plaza')for(const n of L)n.vis=0;lastCur=cur;return}
  if(lastCur!='plaza'||!inited){inited=1;reset()}lastCur=cur;
  if((segT-=dt)<=0){segT=2.5;for(const n of L){const lo=n.lo,hi=n.hi;segs(n);if(!n.fly&&(n.wx<n.lo-1||n.wx>n.hi+1))n.wx=clampX(n,n.wx)}}
  const vw=cv.width/ZM,cx=cam.x+vw/2;
  for(const n of L){const far=abs(n.wx-cx)>vw*.75+240;if(far){n.acc+=dt;if(n.acc<.2)continue;upd(n,n.acc);n.acc=0}else{if(n.acc){upd(n,n.acc+dt);n.acc=0}else upd(n,dt)}
   n.fx+=(n.face-n.fx)*min(1,dt*13);if(n.amb)n.x=floor(n.wx/T);const pd=n.on&&n.pd<4.2*T&&!(n.night&&n.alpha<.6)?1:0;n.na+=(pd-n.na)*min(1,dt*7);if(n.na<.01)n.na=0}
  for(let i=PT.length-1;i>=0;i--){const p=PT[i];p.l-=dt;if(p.l<=0){PT.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k=='s')p.vy+=320*dt;else p.vx+=sin(p.l*6+p.x)*8*dt}
  // auto-close an ambient chat when the player walks away
  if(dlgOpen&&curNPC&&curNPC.amb&&abs(P.x-curNPC.wx)>4.8*T)try{closeDlg()}catch(_){}}
 // ---- drawing
 let Z=0;const FC=new Map(),FCAP=320,PLC={},ICN={};let glow=null;
 function zsc(){return max(.5,min(2.5,round(ZM*4)/4))}
 function frame(n){const sp=AN[n.arch][n.an]||[1,1],N=sp[0],u=n.an=='walk'?n.ph%1:sp[2]?min(n.at/sp[1],.999):(n.at/sp[1])%1,fi=floor(u*N)%N,bl=n.blink&&n.arch!='lumi'&&n.arch!='hollow'?1:0,key=n.id+'|'+n.an+'|'+fi+'|'+bl;
  let c=FC.get(key);if(c){FC.delete(key);FC.set(key,c);return c}
  const B=BOX[n.arch]||BOX.def;c=document.createElement('canvas');c.width=ceil(B[0]*Z);c.height=ceil(B[1]*Z);const x=c.getContext('2d');x.setTransform(Z,0,0,Z,B[2]*Z,B[3]*Z);x.lineJoin='round';x.lineCap='round';
  try{NPCART.draw(x,n.arch,{a:n.an,u:fi/N,b:bl,v:n.v,c:n.pal,L:n.L})}catch(e){if(!frame.e){frame.e=1;console.error('NPC art',n.id,n.an,e)}}
  FC.set(key,c);if(FC.size>FCAP)FC.delete(FC.keys().next().value);return c}
 // nameplate: name, then role + class (class name in its CLASS7 colour)
 function plate(n){const k=n.id+'@'+Z;if(PLC[k])return PLC[k];const c=document.createElement('canvas'),x=c.getContext('2d'),f1='700 11px '+FONT,f2='600 8px '+FONT,role=(n.roleBase||n.role).toUpperCase(),cl=n.cls&&CLASS7.C[n.cls],cls=cl?'  '+cl.ic+' '+cl.n.toUpperCase():'';x.font=f1;const w1=x.measureText(n.n).width;x.font=f2;try{x.letterSpacing='.6px'}catch(_){}const wr=x.measureText(role).width,wc=cls?x.measureText(cls).width:0,w2=wr+wc;const w=ceil(max(w1,w2)+18),h=27;
  c.width=ceil(w*Z);c.height=ceil(h*Z);x.scale(Z,Z);x.fillStyle='rgba(14,12,32,.78)';x.beginPath();x.roundRect(.5,.5,w-1,h-1,8);x.fill();x.strokeStyle=cl?cl.c:'hsla('+n.hue+',80%,68%,.8)';x.globalAlpha=.85;x.lineWidth=1;x.stroke();x.globalAlpha=1;
  x.textAlign='center';x.font=f1;x.fillStyle='#fff';x.fillText(n.n,w/2,12);x.font=f2;try{x.letterSpacing='.6px'}catch(_){}x.textAlign='left';const x0=(w-w2)/2;x.fillStyle='hsl('+n.hue+',85%,76%)';x.fillText(role,x0,22.5);if(cls){x.fillStyle=cl.c;x.fillText(cls,x0+wr,22.5)}c.w=w;c.h=h;return PLC[k]=c}
 function icon(k){const key=k+'@'+Z;if(ICN[key])return ICN[key];const c=document.createElement('canvas'),s=18;c.width=c.height=ceil(s*Z);const x=c.getContext('2d');x.scale(Z,Z);x.translate(9,9);
  x.fillStyle=k=='q2'?'#ffcf3a':'rgba(14,12,32,.82)';x.strokeStyle=k=='q2'?'#7a4a00':'#ffd24a';x.lineWidth=1.3;x.beginPath();x.arc(0,0,7.5,0,TAU);x.fill();x.stroke();x.fillStyle=k=='q2'?'#3a2200':'#ffd24a';x.strokeStyle='#ffd24a';
  if(k=='shop'){x.beginPath();x.moveTo(-3.6,-1);x.lineTo(3.6,-1);x.lineTo(3,4);x.lineTo(-3,4);x.closePath();x.fill();x.lineWidth=1.2;x.beginPath();x.arc(0,-1.4,2.3,PI_,0);x.stroke()}
  else if(k=='smith'){x.save();x.rotate(-.7);x.fillRect(-.8,-1,1.6,6.5);x.fillRect(-3.6,-4,7.2,3.2);x.restore()}
  else{x.font='800 11px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(k=='q2'?'?':'!',0,.8)}return ICN[key]=c}
 const PI_=Math.PI;
 function glowS(){if(glow)return glow;glow=document.createElement('canvas');glow.width=glow.height=128;const x=glow.getContext('2d'),gr=x.createRadialGradient(64,64,2,64,64,64);gr.addColorStop(0,'rgba(255,170,70,.55)');gr.addColorStop(1,'rgba(255,120,40,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return glow}
 function bubble(n,px,py,now){const b=n.bub;if(!b||now>b.e||(dlgOpen&&curNPC===n))return;const a=min(1,(b.e-now)/300,1);g.save();g.globalAlpha=a*(n.alpha==null?1:n.alpha);g.font='600 11px '+FONT;const s=b.s.length>44?b.s.slice(0,42)+'...':b.s;if(b.s!=b.k){b.k=b.s;b.w=g.measureText(s).width}const w=b.w+14,x0=px-w/2,y0=py-20;
  g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.roundRect(x0,y0,w,18,8);g.fill();g.beginPath();g.moveTo(px-4,y0+17);g.lineTo(px,y0+23);g.lineTo(px+4,y0+17);g.fill();g.strokeStyle='rgba(30,20,50,.35)';g.lineWidth=1;g.beginPath();g.roundRect(x0,y0,w,18,8);g.stroke();
  g.fillStyle='#231a33';g.textAlign='center';g.fillText(s,px,y0+12.6);g.restore()}
 function draw(now){if(cur!='plaza')return;const z=zsc();if(z!=Z){Z=z;FC.clear()}const vw=cv.width/ZM,vh=cv.height/ZM;
  // station props
  for(const n of L){if(!n.d.props)continue;for(const[k,o]of n.d.props){const px=hx(o)-cam.x,py=n.wy-cam.y;if(px<-110||px>vw+110)continue;const c=NPCART.prop(k,Z);g.drawImage(c,px-90,py-130,180,140);
   if(k=='forge'){const f=.75+.25*sin(now/90)*sin(now/237);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=f;g.drawImage(glowS(),px-64,py-80,128,128);g.restore()}}}
  // bodies
  for(const n of L){if(!n.on){n.vis=0;continue}const px=n.wx-cam.x,py=n.wy-cam.y;if(px<-90||px>vw+90||py<-160||py>vh+90){n.vis=0;continue}n.vis=1;
   const B=BOX[n.arch]||BOX.def,c=frame(n);let sx=n.fx;if(abs(sx)<.22)sx=sx<0?-.22:.22;
   g.save();if(n.alpha<1)g.globalAlpha=n.alpha;
   if(!n.fly||n.an=='perch'){g.fillStyle='rgba(0,0,0,.26)';g.beginPath();g.ellipse(px,n.fly?py+15:py,n.fly?8:n.arch=='smith'?17:n.v=='kid'?10:14,n.fly?2:3.6,0,0,TAU);g.fill()}
   if(n.night){const fl=.85+.15*sin(now/120+n.wx);g.globalAlpha=n.alpha*fl}
   g.translate(px,py);g.scale(sx,1);g.drawImage(c,-B[2],-B[3],B[0],B[1]);g.restore()}
  // particles
  if(PT.length){g.save();g.globalCompositeOperation='lighter';for(const p of PT){const a=p.l/p.ml;g.fillStyle='rgba('+p.c+','+a.toFixed(2)+')';g.fillRect(p.x-cam.x-p.s/2,p.y-cam.y-p.s/2,p.s,p.s)}g.restore()}
  // overlays: indicators, nameplates, bubbles
  for(const n of L){if(!n.vis)continue;const px=n.wx-cam.x,top=n.wy-n.top-cam.y,cl=n.pd<1.8*T?min(1,(1.8*T-n.pd)/(.8*T)):0;let y=min(top-6,top-6-cl*(n.top<64?62:50)+(n.top<64?0:0));
   if(n.na>0){const c=plate(n);g.save();g.globalAlpha=n.na*(n.alpha==null?1:n.alpha);g.drawImage(c,round(px-c.w/2),round(y-c.h-(1-n.na)*4),c.w,c.h);g.restore();y-=c.h+2}
   if(!n.amb&&n.k){const k=n.k=='shop'?'shop':n.k=='smith'?'smith':(qs.some(q=>q.p>=q.need)?'q2':'q');const ic=icon(k),bob=sin(now/420+n.wx)*1.5;g.save();g.globalAlpha=n.na>0?1:.8;g.drawImage(ic,round(px-9),round(y-18+bob),18,18);g.restore();y-=18}
   bubble(n,px,y-2,now)}}
 // ---- dialogs
 function onTalk(n){if(!n||!LINES[n.id])return;n.line=pick(LINES[n.id].t,n.line);n.bub=null;n.seen=1}
 function nextLine(n){if(n&&LINES[n.id])n.line=pick(LINES[n.id].t,n.line)}
 function classHTML(n){/* class row: every NPC has a class and lives in that class's house; the button cycles passive / tip */const cl=n&&n.cls&&CLASS7.C[n.cls];if(!cl)return'';const tip=n.ct?(n.ct%2?TIPS[n.cls]:cl.p):'';return`<div class="rw" style="border-left:3px solid ${cl.c};padding-left:8px"><div style="flex:1"><b style="color:${cl.c}">${cl.ic} ${esc(cl.n)}</b><small>${esc(n.house||'')}${tip?' \u00b7 '+esc(tip):' \u00b7 a '+esc(cl.n)+' house'}</small></div><button data-a="talk:cls">Class tip</button></div>`}
 function classTip(n){if(n)n.ct=(n.ct||0)+1}
 function lineHTML(n){if(!n||n.amb)return'';const ch=classHTML(n);if(!n.line)return ch;return ch+`<div class="rw"><div><small style="font-style:italic;opacity:.92">\u201c${esc(n.line)}\u201d</small></div></div>`}
 function talkHTML(n){return classHTML(n)+`<div class="rw"><div style="flex:1"><b style="font-weight:500;line-height:1.4">\u201c${esc(n.line||'...')}\u201d</b></div></div><div class="rw" style="justify-content:flex-end"><button data-a="talk:next">Tell me more</button><button data-a="close">Goodbye</button></div>`}
 function near(){if(cur!='plaza')return null;let b=null,bd=2.7*T;for(const n of L){if(!n.on||(n.night&&n.alpha<.6))continue;const x=n.wx!=null?n.wx:n.x*T+T/2,y=n.wy!=null?n.wy:sh(n.x)*T,d=abs(x-P.x),vy=n.fly?abs(y-(P.y+P.h/2)):abs(y-(P.y+P.h));if(d<bd&&vy<(n.fly?4*T:2*T)){bd=d;b=n}}return b}
 for(const n of L){n.wx=hx(n.d.home);n.wy=PLZ7.S*T;n.on=!n.night;n.alpha=n.on?1:0;n.na=0}
 return{tick,draw,near,onTalk,nextLine,lineHTML,talkHTML,classHTML,classTip,list:()=>L,DEF,LINES,TIPS,pick,reset}})();
// 'Class tip' button in NPC dialogs
{const _da=dlgAct;dlgAct=function(a){if(a=='talk:cls'){try{NPC2.classTip(curNPC)}catch(_){}renderDlg();return}return _da.apply(this,arguments)}}
nearNPC=function(){return NPC2.near()};
{const _u=update;update=function(dt){_u.apply(this,arguments);try{NPC2.tick(dt)}catch(e){if(!NPC2.err){NPC2.err=1;console.error('NPC2',e)}}}}
