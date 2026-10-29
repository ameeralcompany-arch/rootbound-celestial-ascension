// ===== V6 data: everything tunable lives here (wings, nameplates, auras, quality presets) =====
const CEL_VER=1;
// ===== WINGS (v8): one data-driven table. Every wing has a family, a rarity, a source and an art spec `a` that the
// shape-family renderer (50-wings.js) paints procedurally. src: 'level' (milestone reward at `lvl`), 'shop' (gems, catalog
// item wing_<id>), 'excl' (achievement only, never sold; see WINGX in 87-z-wings.js). Index order is kept stable for the
// ids that existed before (network presence sends the index; 85-bosses draws index 4 = eclipse).
// pal = [deep, mid, light, glow]. Fan part: tip = element painter, rows/n = feather rows/count, a = fan angles in degrees
// (negative = up), fw = width ratio, att = how far along the arm feathers attach, lc = length curve.
const WFAM={feathered:'Feathered',dark:'Dark',elemental:'Elemental',cosmic:'Cosmic',mechanical:'Mechanical',fantasy:'Fantasy'};
const WRAR=['common','uncommon','rare','epic','legendary','mythic','exclusive'];
const WINGS=[
 {id:'celestial',n:'Celestial Wings',fam:'feathered',rar:'uncommon',src:'level',lvl:10,pal:['#8f9cc9','#dfe7ff','#ffffff','#bcd4ff'],sp:'#ffffff',fxk:'glitter',d:'Classic pearl-white angel wings with a soft blue glow.',
  a:{L:54,parts:[{s:'fan',tip:'point',rows:3,n:11,a:[-52,84],arm:-40,att:.55,fw:.24,cov:'round',glow:1}]}},
 {id:'frost',n:'Frost Crystal Wings',fam:'elemental',rar:'rare',src:'level',lvl:30,pal:['#2a6fb8','#8fd4ff','#effaff','#7fd0ff'],sp:'#c8f0ff',fxk:'snow',d:'Translucent ice crystals with branching frost veins that glint in the light.',
  a:{L:60,glint:1,parts:[{s:'fan',tip:'ice',rows:2,n:9,a:[-62,70],arm:-46,att:.45,fw:.26,lc:'mid',al:.9}]}},
 {id:'silver',n:'Radiant Silver Wings',fam:'feathered',rar:'rare',src:'level',lvl:25,pal:['#6d7686','#c9d0dc','#ffffff','#fff3c8'],sp:'#fff7d6',fxk:'glitter',d:'Tall, narrow sickle feathers of mirror silver, swept high above the shoulders.',
  a:{L:64,parts:[{s:'fan',tip:'sickle',rows:2,n:8,a:[-84,24],arm:-62,att:.42,fw:.14,lc:'flat',rf:.7}]}},
 {id:'astral',n:'Astral Shard Wings',fam:'cosmic',rar:'legendary',src:'level',lvl:75,pal:['#1b1f5a','#5a63d8','#cfe0ff','#8fd0ff'],sp:'#9fe0ff',fxk:'stars',d:'Floating star-stone fragments held together by glowing constellation lines.',
  a:{L:80,parts:[{s:'fan',tip:'point',rows:1,n:9,a:[-52,80],arm:-40,att:.5,fw:.26,al:.22},{s:'frag',shape:'rock',n:16,a:[-52,80],arm:-40,att:.5,sz:[5,11],line:1}]}},
 {id:'eclipse',n:'Eclipse Wings',fam:'cosmic',rar:'epic',src:'level',lvl:50,pal:['#07050c','#24163a','#5e4382','#ffcf5a'],sp:'#ffd98a',fxk:'omen',d:'Great black crescent blades rimmed in gold, with a burning corona behind the back.',
  a:{L:72,corona:{c:'#ffcf5a',r:.42},parts:[{s:'fan',tip:'crescent',rows:2,n:6,a:[-50,72],arm:-42,att:.45,fw:.18,rim:'#ffcf5a',rf:.62}]}},
 {id:'ascendant',n:'Royal Ascendant Wings',fam:'fantasy',rar:'legendary',src:'level',lvl:100,pal:['#a8843a','#f6e2b0','#ffffff','#ffe39a'],sp:'#fff4c4',fxk:'glitter',d:'Four layers of white-gold royal plumage, a second lower pair and a radiant halo.',
  a:{L:88,halo:'#ffe39a',parts:[{s:'fan',off:36,sc:.52,tip:'point',rows:2,n:8,a:[-40,70],arm:-30,att:.5,fw:.24,rim:'#e8c26a'},{s:'fan',tip:'point',rows:4,n:13,a:[-56,82],arm:-42,att:.56,fw:.23,cov:'round',rim:'#e8c26a'}]}},
 {id:'cosmic',n:'Transcendent Wings',fam:'cosmic',rar:'mythic',src:'level',lvl:150,pal:['#1a0b45','#7a3cff','#7ff0ff','#ff9be8'],sp:'#ffffff',fxk:'stars',d:'Three layers of living nebula, an orbit ring and drifting stars. The final milestone.',
  a:{L:104,halo:'#ff9be8',orbit:'#7ff0ff',stars:30,parts:[{s:'fan',off:36,sc:.52,tip:'star',rows:2,n:8,a:[-40,70],arm:-30,att:.5,fw:.24},{s:'rib',kind:'nebula',n:5,a:[-60,40],len:1.08,w:7},{s:'fan',tip:'star',rows:3,n:13,a:[-54,82],arm:-42,att:.56,fw:.24,glow:1}]}},
 {id:'dove',n:'Dove Wings',fam:'feathered',rar:'common',src:'shop',pal:['#c9d3ee','#f1f5ff','#ffffff','#fff2d0'],sp:'#fff',fxk:'glitter',d:'Broad, rounded pearl-white feathers with luminous tips.',
  a:{L:44,parts:[{s:'fan',tip:'round',rows:3,n:9,a:[-40,88],arm:-30,att:.5,fw:.34,lc:'mid'}]}},
 {id:'blossom',n:'Blossom Wings',fam:'fantasy',rar:'common',src:'shop',pal:['#e66a9a','#ffb0cf','#fff0f6','#ff7fb0'],sp:'#ffd0e4',fxk:'petals',d:'Soft petal wings that shed cherry-blossom petals as you move.',
  a:{L:44,parts:[{s:'fan',tip:'petal',rows:2,n:6,a:[-56,66],arm:-40,att:.25,fw:.4}]}},
 {id:'crystal',n:'Amethyst Crystal Wings',fam:'elemental',rar:'uncommon',src:'shop',pal:['#4a1f78','#a874d8','#f4e6ff','#d6a8ff'],sp:'#efd8ff',fxk:'glints',d:'Angular amethyst crystals grown from the earth, catching every light.',
  a:{L:54,glint:1,parts:[{s:'fan',tip:'shard',rows:2,n:8,a:[-60,72],arm:-42,att:.36,fw:.32,lc:'rand'}]}},
 {id:'mech',n:'Blade Mech Wings',fam:'mechanical',rar:'uncommon',src:'shop',pal:['#2e3440','#7d8799','#cfd6e4','#3ff3ff'],sp:'#3ff3ff',fxk:'sparks',d:'Five steel blades on a jointed arm, with glowing conduits.',
  a:{L:58,parts:[{s:'mech',style:'blade',n:5,a:[-58,34]}]}},
 {id:'umbral',n:'Umbral Obsidian Wings',fam:'dark',rar:'rare',src:'shop',lv:20,pal:['#05030a','#1c1230','#4a3a6a','#b88bff'],sp:'#b88bff',fxk:'smoke',d:'Long blades of black volcanic glass with a violet rim light.',
  a:{L:62,parts:[{s:'fan',tip:'blade',rows:2,n:8,a:[-62,72],arm:-40,att:.42,fw:.17,rim:'#b88bff'}]}},
 {id:'galaxy',n:'Galaxy Wings',fam:'cosmic',rar:'rare',src:'shop',lv:30,pal:['#140a3a','#4b2fb0','#2fb6ff','#ff7fe0'],sp:'#fff',fxk:'stars',d:'Feathers filled with a living, twinkling starfield.',
  a:{L:62,stars:22,parts:[{s:'fan',tip:'star',rows:3,n:11,a:[-50,84],arm:-38,att:.55,fw:.24}]}},
 {id:'dragon',n:'Dragon Wings',fam:'fantasy',rar:'rare',src:'shop',lv:35,pal:['#4a0c10','#a3212a','#ff7a4a','#ffb347'],sp:'#ff9a4a',fxk:'embers',d:'Red leather membranes stretched over four bone fingers. They flex with every beat.',
  a:{L:68,parts:[{s:'mem',fingers:4,bone:'#e9d9c8',claw:1,vein:1}]}},
 {id:'moth',n:'Omen Moth Wings',fam:'fantasy',rar:'uncommon',src:'shop',lv:25,pal:['#1a0409','#6e0f1c','#c4283a','#ffb8a0'],sp:'#ff4a5a',fxk:'omen',d:'Broad crimson-black moth wings with glowing veins and eye spots.',
  a:{L:56,flutter:1,parts:[{s:'fan',tip:'lobe',rows:1,n:2,a:[-36,40],fw:.55,att:0,lc:'top'}]}},
 {id:'eagle',n:'Eagle Wings',fam:'feathered',rar:'uncommon',src:'shop',pal:['#2e1c0e','#7a4f2a','#d9bf92','#fff0c8'],sp:'#fff0c8',d:'Broad brown-and-cream wings with spread finger feathers, built for long glides.',
  a:{L:62,parts:[{s:'fan',tip:'real',rows:3,n:12,a:[-26,90],arm:-16,att:.62,fw:.2,lc:'eagle',fing:1}]}},
 {id:'swan',n:'Swan Wings',fam:'feathered',rar:'rare',src:'shop',lv:15,pal:['#c5cde0','#f3f6ff','#ffffff','#fff6e0'],sp:'#ffffff',fxk:'glitter',d:'Long, layered white plumage that rises high and glows along the edge.',
  a:{L:64,parts:[{s:'fan',tip:'real',rows:4,n:13,a:[-66,74],arm:-56,att:.55,fw:.2}]}},
 {id:'raven',n:'Raven Wings',fam:'dark',rar:'rare',src:'shop',lv:20,pal:['#040307','#19152b','#463f66','#9a8fd6'],sp:'#9a8fd6',fxk:'smoke',d:'Huge glossy black wings with a violet sheen and ragged finger feathers.',
  a:{L:78,parts:[{s:'fan',tip:'real',rows:3,n:13,a:[-34,84],arm:-22,att:.62,fw:.21,lc:'eagle',fing:1}]}},
 {id:'plume',n:'Phoenix Plume Wings',fam:'elemental',rar:'rare',src:'shop',lv:40,pal:['#6a0e08','#e8541a','#ffc83a','#fff4c0'],sp:'#ffd24a',fxk:'embers',d:'Long realistic plumes that burn from deep red to gold.',
  a:{L:66,parts:[{s:'fan',tip:'real',rows:3,n:11,a:[-74,60],arm:-52,att:.45,fw:.16,tipc:'#fff4c0',lc:'flat'}]}},
 {id:'feather',n:'Fledgling Wings',fam:'feathered',rar:'common',src:'level',lvl:5,pal:['#8a6a4a','#e6d8c0','#fffaf0','#fff0d0'],sp:'#fff6e0',d:'Small, soft feather wings. Your first pair.',
  a:{L:34,parts:[{s:'fan',tip:'round',rows:2,n:7,a:[-40,86],arm:-30,att:.5,fw:.32,lc:'mid'}]}},
 {id:'shadow',n:'Shadow Wings',fam:'dark',rar:'uncommon',src:'level',lvl:15,pal:['#06040c','#1e1630','#4a3d6e','#8a6bff'],sp:'#8a6bff',fxk:'smoke',d:'Jagged tendrils of living shadow that trail dark smoke.',
  a:{L:48,parts:[{s:'fan',tip:'wisp',rows:2,n:8,a:[-56,74],arm:-40,att:.45,fw:.26,al:.95}]}},
 {id:'crimson',n:'Crimson Raven Wings',fam:'dark',rar:'rare',src:'level',lvl:20,pal:['#050307','#1a1218','#2c2228','#ff2a3a'],sp:'#ff4a5a',fxk:'crimson',d:'Large black raven feathers dipped in crimson at the tips.',
  a:{L:66,parts:[{s:'fan',tip:'ragged',rows:3,n:13,a:[-38,84],arm:-26,att:.62,fw:.21,lc:'eagle',fing:1,tipc:'#c8102a',tl:.3}]}},
 {id:'storm',n:'Thunder Wings',fam:'elemental',rar:'epic',src:'level',lvl:40,pal:['#141a33','#2c3d72','#8aa6e8','#ffe86a'],sp:'#fff2a0',fxk:'volt',d:'Storm-cloud feathers veined with lightning that branches between the wings.',
  a:{L:66,arcs:'#fff2a0',parts:[{s:'fan',tip:'storm',rows:3,n:11,a:[-50,84],arm:-36,att:.55,fw:.23}]}},
 {id:'aegis',n:'Aegis Frame Wings',fam:'mechanical',rar:'epic',src:'level',lvl:60,pal:['#1c2230','#56637a','#dfe6f2','#46e8ff'],sp:'#46e8ff',fxk:'sparks',d:'Seven armoured panels on an articulated frame that unfold one by one.',
  a:{L:72,parts:[{s:'mech',style:'panel',n:7,a:[-72,40],joint:'#ffd36a'}]}},
 {id:'mythic',n:'Mythic Void Wings',fam:'fantasy',rar:'mythic',src:'level',lvl:120,pal:['#a07a2a','#f2d68a','#fff6dc','#ffd36a'],pal2:['#0a0614','#3a1a6a','#a46bff','#c9a0ff'],sp:'#ffd36a',fxk:'stars',d:'Asymmetric: one wing of radiant gold feathers, the other a storm of void fragments.',
  a:{L:92,parts:[{s:'fan',tip:'point',rows:3,n:12,a:[-54,82],arm:-42,att:.56,fw:.23,rim:'#e8c26a'}],alt:[{s:'rib',kind:'void',n:4,a:[-60,40],len:.9,w:6,p2:1},{s:'frag',shape:'void',n:16,a:[-54,80],arm:-42,att:.5,sz:[6,14],p2:1}]}},
 {id:'zephyr',n:'Zephyr Wings',fam:'elemental',rar:'common',src:'shop',pal:['#5fae96','#c8f2e4','#ffffff','#e8fff6'],sp:'#e8fff6',fxk:'leaf',d:'Sweeping ribbons of wind around faint, airy feathers.',
  a:{L:50,parts:[{s:'fan',tip:'round',rows:1,n:7,a:[-50,80],arm:-36,att:.5,fw:.3,al:.55},{s:'rib',kind:'wind',n:6,a:[-56,40],len:1,w:3.2}]}},
 {id:'bat',n:'Night Bat Wings',fam:'dark',rar:'uncommon',src:'shop',lv:10,pal:['#120814','#3a1638','#7a2a5a','#ff4a8a'],sp:'#ff4a8a',fxk:'omen',d:'Small demonic bat wings with hooked claws and scalloped membranes.',
  a:{L:48,parts:[{s:'mem',fingers:3,bone:'#2a1020',claw:1,hook:1,scal:.36}]}},
 {id:'ember',n:'Ember Wings',fam:'elemental',rar:'uncommon',src:'shop',lv:10,pal:['#7a1606','#ff5a1a','#ffd04a','#fff2b0'],sp:'#ffd04a',fxk:'embers',d:'Wings of living flame that flicker and shed embers.',
  a:{L:52,parts:[{s:'fan',tip:'flame',rows:2,n:8,a:[-62,64],arm:-46,att:.4,fw:.32},{s:'rib',kind:'flame',n:4,a:[-60,30],len:.8,w:5}]}},
 {id:'tide',n:'Tide Wings',fam:'elemental',rar:'uncommon',src:'shop',pal:['#0d4a8a','#3aa8e8','#d8f6ff','#9fe8ff'],sp:'#d8f6ff',fxk:'bubbles',d:'Translucent wings of flowing water with rising bubbles.',
  a:{L:54,parts:[{s:'fan',tip:'water',rows:2,n:8,a:[-52,80],arm:-38,att:.5,fw:.3,al:.78},{s:'rib',kind:'water',n:3,a:[-50,40],len:.9,w:3}]}},
 {id:'lunar',n:'Lunar Wings',fam:'cosmic',rar:'uncommon',src:'shop',pal:['#2a3050','#9aa6d8','#f4f6ff','#cfd8ff'],sp:'#f4f6ff',fxk:'stars',d:'Three silver crescent moons on each side, glowing softly.',
  a:{L:52,parts:[{s:'fan',tip:'moon',rows:1,n:3,a:[-50,50],arm:-40,att:.35,fw:.42,glow:1}]}},
 {id:'circuit',n:'Circuit Wings',fam:'mechanical',rar:'rare',src:'shop',lv:30,pal:['#0a1a2a','#164a6a','#7ff0ff','#3ff3ff'],sp:'#7ff0ff',fxk:'sparks',d:'Hexagonal energy panels on a thin frame, pulsing with data light.',
  a:{L:62,parts:[{s:'mech',style:'hex',n:6,a:[-64,34]}]}},
 {id:'spirit',n:'Spectral Wings',fam:'fantasy',rar:'rare',src:'shop',lv:25,pal:['#1a0c33','#5a2aa8','#c9a0ff','#b07aff'],sp:'#c9a0ff',fxk:'smoke',d:'Ghostly violet membranes on clawed bones, half in this world.',
  a:{L:66,parts:[{s:'mem',fingers:4,bone:'#e8d8ff',claw:1,ghost:1,scal:.3}]}},
 {id:'sovereign',n:'Eclipse Sovereign',fam:'dark',rar:'exclusive',src:'excl',pal:['#030205','#110a0e','#272026','#ff1f3a'],sp:'#ff1f3a',fxk:'crimson',d:'Vast black wings unfolding beneath a crimson eclipse.',
  a:{L:98,corona:{c:'#ff1f3a',r:.36},unfold:1,parts:[{s:'fan',tip:'ragged',rows:4,n:14,a:[-50,82],arm:-34,att:.6,fw:.2,lc:'eagle',tipc:'#a0081c',tl:.22}]}},
 {id:'monarch',n:'Astral Monarch',fam:'cosmic',rar:'exclusive',src:'excl',pal:['#0a0f3a','#2a3aa8','#6f9be8','#bfe4ff'],sp:'#bfe4ff',fxk:'stars',d:'A vast, layered cosmic wingspan: star feathers, a crown pair and floating constellations.',
  a:{L:112,stars:34,parts:[{s:'frag',shape:'star',n:16,a:[-56,80],arm:-44,att:.5,sc:1.12,sz:[4,8],line:1},{s:'fan',off:-36,sc:.58,tip:'star',rows:2,n:7,a:[-60,50],arm:-50,att:.45,fw:.24},{s:'rib',kind:'nebula',n:4,a:[-60,40],len:1,w:8},{s:'fan',tip:'star',rows:3,n:13,a:[-52,82],arm:-40,att:.56,fw:.24}]}},
 {id:'voidemp',n:'Void Emperor',fam:'dark',rar:'exclusive',src:'excl',pal:['#05020a','#1e0a38','#7a3cff','#c46bff'],sp:'#c46bff',fxk:'smoke',d:'Jagged violet-black fragments that float apart and lock back into wings.',
  a:{L:104,parts:[{s:'rib',kind:'void',n:5,a:[-64,40],len:.9,w:7},{s:'frag',shape:'void',n:20,a:[-54,82],arm:-40,att:.52,sz:[7,17]}]}},
 {id:'phoenix',n:'Phoenix Reborn',fam:'elemental',rar:'exclusive',src:'excl',pal:['#5a0a04','#ff4a12','#ffd040','#fff6c0'],sp:'#ffd040',fxk:'embers',d:'Massive wings of fire that burst into a rebirth flame.',
  a:{L:110,rebirth:1,parts:[{s:'fan',tip:'flame',rows:3,n:12,a:[-64,74],arm:-48,att:.5,fw:.3},{s:'rib',kind:'flame',n:6,a:[-62,30],len:.95,w:7}]}},
 {id:'eternity',n:'Seraph of Eternity',fam:'feathered',rar:'exclusive',src:'excl',pal:['#7a84a4','#d6dbea','#ffffff','#ffe9a0'],sp:'#fff4c4',fxk:'glitter',d:'Three pairs of silver and gold wings that open slowly and majestically.',
  a:{L:100,halo:'#ffe9a0',slow:1,parts:[{s:'fan',off:38,sc:.52,tip:'point',rows:2,n:8,a:[-40,70],arm:-30,att:.5,fw:.24,rim:'#d9a93a'},{s:'fan',off:-38,sc:.62,tip:'point',rows:2,n:8,a:[-60,60],arm:-48,att:.5,fw:.24,rim:'#d9a93a'},{s:'fan',tip:'point',rows:3,n:13,a:[-54,82],arm:-40,att:.56,fw:.23,cov:'round'}]}},
 {id:'drakelord',n:'Dragon Sovereign',fam:'fantasy',rar:'exclusive',src:'excl',pal:['#120808','#3a1410','#d89a3a','#ff8a2a'],sp:'#ff8a2a',fxk:'embers',d:'Colossal obsidian dragon wings with five spiked fingers and molten veins.',
  a:{L:112,parts:[{s:'mem',fingers:5,bone:'#2a1a12',claw:1,spikes:1,vein:1,glowVein:1}]}},
 // ---- v9 ascended wings: 'tier' family (50-z-wings2.js): three overlapping tiers e = [primaries, secondaries, coverts] element
 // painters, n = counts, len/wd = length/width ratios, pa = primary fan angles at the wrist, tip = emissive tip colour, trail = shed particles
 {id:'voidshroud',n:'Abyssal Shroud',fam:'dark',rar:'mythic',src:'shop',lv:70,pal:['#030208','#150d28','#4c3c7c','#e6dcff'],sp:'#e6dcff',fxk:'stars',d:'A cosmic shroud of living tendrils around a black-hole core. Its tips glow like distant stars.',
  a:{L:112,corona:{c:'#cfc0ff',r:.24},trail:['void','spark','dust'],parts:[{s:'tier',e:['tendril','tendril','shroud'],n:[9,9,7],len:[.7,.46,.22],wd:[.12,.14,.3],pa:[-16,104],arm:-30,glow:1}]}},
 {id:'nightforge',n:'Nightforged Aegis',fam:'mechanical',rar:'legendary',src:'shop',lv:45,pal:['#05040a','#1d1a29','#4e4866','#c86bff'],sp:'#c86bff',fxk:'smoke',d:'Black armoured wing plates joined by violet glowing seams, layered in three hinged tiers.',
  a:{L:100,trail:['spark','ember'],parts:[{s:'tier',e:['plate','plate','scale'],n:[8,7,6],len:[.6,.38,.2],wd:[.17,.2,.32],pa:[-12,92],arm:-36,tip:'#e9b8ff',orn:'gem',glow:1}]}},
 {id:'haloseraph',n:'Halo Seraph',fam:'feathered',rar:'mythic',src:'shop',lv:60,pal:['#8c92c0','#e9edff','#ffffff','#d6b8ff'],sp:'#ffffff',fxk:'glitter',d:'Radiant white feathers in three tiers around a glowing halo ring, shedding petals of light.',
  a:{L:108,ring:{c:'#e3d2ff',r:.2},trail:['petal','dust','feather'],parts:[{s:'tier',e:['feather','feather','covert'],n:[11,10,9],len:[.62,.4,.2],wd:[.17,.2,.34],pa:[-12,96],arm:-38,tip:'#cdb0ff',glow:1}]}},
 {id:'inkwraith',n:'Inkwraith Wings',fam:'dark',rar:'legendary',src:'shop',lv:40,pal:['#040405','#16161b','#5c5c68','#f4f4ff'],sp:'#f4f4ff',fxk:'smoke',d:'Brush-stroke wings of black ink that dissolve into drifting wisps, streaked with pale light.',
  a:{L:104,trail:['smoke','dust'],parts:[{s:'tier',e:['ink','ink','ink'],n:[8,7,6],len:[.64,.42,.22],wd:[.22,.24,.3],pa:[-16,100],arm:-30,glow:1}]}},
 {id:'eyemoth',n:'Oracle Moth Wings',fam:'fantasy',rar:'legendary',src:'shop',lv:42,pal:['#0e080c','#35212d','#efc6cf','#ffd6e4'],sp:'#ffd6e4',fxk:'omen',d:'Vast dusky moth wings painted with watchful glowing eyes; they scatter luminous scales.',
  a:{L:98,flutter:1,trail:['dust'],parts:[{s:'tier',e:['moth','mothhind','mothfur'],n:[1,1,1],la:.05,lh:0,len:[.95,.72,.16],wd:[.36,.5,.9],pa:[-22,0],ra:[[62,62],[40,40]],rp:[[.5,.5],[.2,.2]],arm:-24,glow:1}]}},
 {id:'stormlance',n:'Stormlance Wings',fam:'elemental',rar:'mythic',src:'shop',lv:55,pal:['#04163f','#1866ff','#c4ecff','#7fdcff'],sp:'#c4ecff',fxk:'volt',d:'Wings of raw blue lightning: three tiers of crackling energy that arc and spit sparks.',
  a:{L:116,arcs:'#bfe8ff',trail:['spark','dust'],parts:[{s:'tier',e:['bolt','bolt','arc'],n:[11,10,7],len:[.66,.42,.22],wd:[.1,.12,.14],pa:[-20,104],arm:-34,tip:'#ffffff',add:1,glow:1}]}},
 {id:'bonelight',n:'Ossuary Dawn',fam:'fantasy',rar:'legendary',src:'shop',lv:50,pal:['#151012','#3a3034','#ece2dc','#ffe6f0'],sp:'#ffe6f0',fxk:'glitter',d:'Skeletal wings of curved bone; pale light drips from every joint like a melting dawn.',
  a:{L:106,trail:['drip','dust'],parts:[{s:'tier',e:['bone','drip','boneplate'],n:[6,9,5],len:[.66,.42,.13],wd:[.085,.05,.45],pa:[-26,80],ra:[[95,80],[6,6]],rp:[[.15,1],[.05,.95]],arm:-32,glow:1}]}},
 {id:'amethclaw',n:'Amethyst Talon Wings',fam:'feathered',rar:'legendary',src:'shop',lv:48,pal:['#26083f','#7b3fe0','#e6ccff','#c77dff'],sp:'#e6ccff',fxk:'glints',d:'Translucent violet feathers that glow from within, crowned by curved talons at the wrist.',
  a:{L:102,trail:['feather','dust'],parts:[{s:'tier',e:['feather','feather','covert'],n:[10,9,8],len:[.62,.4,.2],wd:[.16,.19,.32],pa:[-10,96],arm:-40,tip:'#f0ddff',orn:'claw',al:.93,glow:1}]}}
];
// v9: the older top-tier wings also shed trail particles from their tips during strokes (same system as the ascended wings)
for(const[id,tr]of[['astral',['spark']],['eclipse',['ember']],['ascendant',['feather','dust']],['cosmic',['spark','dust']],['storm',['spark']],['mythic',['dust','spark']],['sovereign',['smoke','ember']],['monarch',['spark','dust']],['voidemp',['void','spark']],['phoenix',['ember']],['eternity',['feather','dust']],['drakelord',['ember']]]){const w=WINGS.find(x=>x.id==id);if(w)w.a.trail=tr}
for(const w of WINGS){w.lvl=w.src=='level'?w.lvl:0;w.shop=w.src=='shop'?1:0;w.excl=w.src=='excl'?1:0;w.pw=Math.max(0,WRAR.indexOf(w.rar))+(w.a.L>90?1:0)}
// Nameplates: a new tier every 15 levels. Names beyond the table continue automatically.
const NP_NAMES=['Wanderer','Initiate','Pathfinder','Warden','Vanguard','Crystal Knight','Astral Sentinel','Eclipse Champion','Ascendant Paragon','Cosmic Overlord','Celestial Sovereign','Void Monarch','Starforged Regent','Eternal Ascendant'];
const NP_STEP=15;
const npTier=l=>Math.max(0,Math.floor(Math.max(1,l|0)/NP_STEP));
const npName=t=>t<NP_NAMES.length?NP_NAMES[t]:NP_NAMES[NP_NAMES.length-1]+' '+['II','III','IV','V','VI','VII','VIII','IX','X'][Math.min(8,t-NP_NAMES.length)];
const npRange=t=>t==0?[1,NP_STEP-1]:[t*NP_STEP,t*NP_STEP+NP_STEP-1];
// frame style per tier (drawn procedurally; look inspired by the ornate banner + thorn-frame references)
const NP_STYLE=t=>t<2?{k:'plain',a:'#6d7a99',b:'#262c44',g:'#aab6d8'}:t<4?{k:'scroll',a:'#b98a4e',b:'#2b1d14',g:'#f0c98a'}:t<6?{k:'crystal',a:'#8fb8ff',b:'#14213f',g:'#cfe4ff'}:t<8?{k:'rose',a:'#d9b46a',b:'#2a0d14',g:'#ff5a6e'}:t<10?{k:'wing',a:'#fff0c0',b:'#241c0c',g:'#ffe9a0'}:t<12?{k:'thorn',a:'#b58cff',b:'#0a0610',g:'#9a6bff'}:{k:'cosmic',a:'#7ff0ff',b:'#14082e',g:'#ff9be8'};
// Aura = ground magic circle. Unlock by level (references: violet sigil circle, golden winged-sigil circle).
const AURAS=[
 {id:'none',n:'None',lvl:1,c:'#fff'},
 {id:'sigil',n:'Violet Sigil',lvl:20,c:'#a46bff',c2:'#e3ccff',pts:5},
 {id:'frost',n:'Frost Mandala',lvl:45,c:'#7fd0ff',c2:'#eaf8ff',pts:6},
 {id:'solar',n:'Golden Seraph Ring',lvl:80,c:'#ffd24a',c2:'#fff4c4',pts:8,wing:1},
 {id:'eclipse',n:'Eclipse Rune',lvl:110,c:'#c05cff',c2:'#ffd36a',pts:7},
 {id:'cosmos',n:'Cosmic Orrery',lvl:140,c:'#7ff0ff',c2:'#ff9be8',pts:9}
];
// Appearance options (anime styles; colours are free). gd = body type: 0 classic (saves made before v8 keep their exact look), 1 male, 2 female
const AP={hair:['Spiky swept','Long tail','Side-parted','Wild layered','Undercut','Windblown','Short crop','Shoulder length','Long straight','Twin tails'],gd:['Classic','Male','Female'],
 eyes:['Sharp','Calm','Fierce','Round'],outfit:['Wanderer coat','Knight tunic','Mage robe','Rogue jacket','Scholar vest','Ronin haori'],
 acc:['None','Scarf','Earring','Mask (lower)','Headband','Shoulder mantle'],cape:['None','Short cape','Long cape'],
 eyeCol:['#35c9c0','#6aa8ff','#ffb347','#d25cff','#ff5a6e','#7dff8a','#e8e8ff']};
// Quality presets. Every cost-driving system reads these - nothing is hard-coded elsewhere.
const QPRE=[
 {id:'potato',n:'Lowest (very weak PCs)',rsc:.5,vfx:.2,cap:200,part:.3,bloom:0,par:1,shadow:0,wx:.25,wfx:0,feat:0,grade:0,cine:0,hd:0,fps:30},
 {id:'low',n:'Low',rsc:.7,vfx:.35,cap:350,part:.45,bloom:0,par:1,shadow:0,wx:.35,wfx:0,feat:0,grade:0,cine:0,hd:0,fps:30},
 {id:'med',n:'Medium',rsc:.85,vfx:.65,cap:700,part:.7,bloom:0,par:2,shadow:1,wx:.6,wfx:1,feat:1,grade:1,cine:0,hd:0,fps:60},
 {id:'high',n:'High',rsc:1,vfx:1,cap:1200,part:1,bloom:1,par:3,shadow:1,wx:1,wfx:2,feat:2,grade:1,cine:0,hd:1,fps:60},
 {id:'ultra',n:'Ultra',rsc:1,vfx:1.25,cap:1800,part:1.3,bloom:2,par:4,shadow:2,wx:1.3,wfx:3,feat:3,grade:2,cine:0,hd:1,fps:60},
 {id:'cine',n:'Cinematic',rsc:1,   /* native resolution: 1.25x supersampling cost ~25% FPS for a barely visible difference */vfx:1.5,cap:2600,part:1.6,bloom:2,par:5,shadow:2,wx:1.6,wfx:3,feat:3,grade:2,cine:1,hd:1,fps:60}];
const WX_STATES=['clear','cloudy','fog','drizzle','rain','storm','snow','blizzard','windy','aurora','starfall','crystal'];
const WX_NAMES={clear:'Clear',cloudy:'Overcast',fog:'Fog',drizzle:'Drizzle',rain:'Rain',storm:'Thunderstorm',snow:'Snowfall',blizzard:'Blizzard',windy:'High Wind',aurora:'Aurora',starfall:'Starfall',crystal:'Crystal Mist'};

// ---- celestial state, saved per account under key "rbc" (namespaced by the profile layer)
const cel={v:CEL_VER,wing:'auto',wingsOn:1,aura:'auto',auraOn:1,plate:'auto',ap:{hair:0,eyes:0,outfit:0,acc:0,cape:1,eyeCol:0,hairCol:'#3a2a3a',skinCol:'#f1c9a0',outCol:'#2d3f6b',trimCol:'#d9b46a'},
 seenW:0,seenNp:0,opt:{qp:'auto',vfx:1,reduce:0,ui:1,bloom:1,wxOn:1,fpsShow:0,cine:0},tut:0};
function celSave(){try{localStorage.setItem('rbc',JSON.stringify(cel))}catch(_){}}
function celLoad(){let o=null;try{o=JSON.parse(localStorage.getItem('rbc')||'null')}catch(_){}if(!o||typeof o!='object')return;
 const n=(v,d,lo,hi)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v|0)):d},col=(v,d)=>/^#[0-9a-f]{6}$/i.test(v)?v:d;
 // one wing state: cel.wing = 'auto' (no explicit choice yet: best level wing) | 'none' (unequipped) | a wing id. wingsOn mirrors it.
 cel.wing=WINGS.some(w=>w.id==o.wing)||o.wing=='auto'||o.wing=='none'?o.wing:'auto';if(o.wingsOn!=null&&!o.wingsOn)cel.wing='none';cel.wingsOn=cel.wing=='none'?0:1;cel.aura=AURAS.some(a=>a.id==o.aura)||o.aura=='auto'?o.aura:'auto';cel.auraOn=o.auraOn==0?0:1;
 cel.plate=o.plate=='auto'?'auto':n(o.plate,'auto',0,99);cel.seenW=n(o.seenW,0,0,99);cel.seenNp=n(o.seenNp,0,0,999);cel.tut=n(o.tut,0,0,9);
 const a=o.ap||{},A=cel.ap;A.hair=n(a.hair,0,0,AP.hair.length-1);A.eyes=n(a.eyes,0,0,AP.eyes.length-1);A.outfit=n(a.outfit,0,0,AP.outfit.length-1);A.acc=n(a.acc,0,0,AP.acc.length-1);A.cape=n(a.cape,1,0,AP.cape.length-1);A.eyeCol=n(a.eyeCol,0,0,AP.eyeCol.length-1);A.gd=n(a.gd,0,0,2);
 A.hairCol=col(a.hairCol,A.hairCol);A.skinCol=col(a.skinCol,A.skinCol);A.outCol=col(a.outCol,A.outCol);A.trimCol=col(a.trimCol,A.trimCol);
 const p=o.opt||{};cel.opt.qp=['auto','low','med','high','ultra','cine'].includes(p.qp)?p.qp:'auto';cel.opt.vfx=Math.max(0,Math.min(1.5,+p.vfx>=0?+p.vfx:1));cel.opt.reduce=p.reduce?1:0;cel.opt.ui=Math.max(.8,Math.min(1.4,+p.ui||1));cel.opt.bloom=p.bloom==0?0:1;cel.opt.wxOn=p.wxOn==0?0:1;cel.opt.fpsShow=p.fpsShow?1:0;cel.opt.cine=p.cine?1:0;cel.opt.uiv=Math.max(0,Math.min(1,+p.uiv>=0?+p.uiv:.6));cel.opt.uim=p.uim?1:0;cel.opt.theme=['light','dark','auto'].includes(p.theme)?p.theme:'light'}
// ---- derived progression (single source of truth: character level)
// ownership: level wings by level, shop wings by the catalog item, exclusive wings by their achievement record (WINGX)
const wingOwned=(w,l)=>{if(!w)return false;if(w.src=='level')return (l==null?lvl:l)>=w.lvl;if(w.src=='excl'){try{return WINGX.has(w.id)}catch(_){return false}}try{return SHOP7.has('wing_'+w.id)}catch(_){return false}};
const wingById=id=>WINGS.find(w=>w.id==id)||null;
const wingUnlocked=(l)=>WINGS.filter(w=>w.src=='level'&&l>=w.lvl).sort((a,b)=>a.lvl-b.lvl);
const bestWing=l=>{const u=wingUnlocked(l);return u.length?u[u.length-1]:null};
// reconcile writers that still poke cel.wing / cel.wingsOn directly (old UI paths, tests): whichever changed last wins
const WSYNC={w:cel.wing,on:cel.wingsOn};
function wingSync(){if(cel.wing===WSYNC.w&&cel.wingsOn===WSYNC.on)return;
 if(cel.wing!==WSYNC.w){if(cel.wing!='none'&&cel.wing!='auto'&&!wingById(cel.wing))cel.wing='none';cel.wingsOn=cel.wing=='none'?0:1}
 else{cel.wing=cel.wingsOn?(cel.wing=='none'?'auto':cel.wing):'none';cel.wingsOn=cel.wing=='none'?0:1}
 WSYNC.w=cel.wing;WSYNC.on=cel.wingsOn}
// the equipped wing. An explicit choice that is not owned shows nothing (never silently swaps in another wing).
function curWing(l){wingSync();if(cel.wing=='none')return null;if(cel.wing=='auto')return bestWing(l==null?lvl:l);const w=wingById(cel.wing);return w&&wingOwned(w,l)?w:null}
// equip / unequip: the only two writers of the wing state
function wingEquip(id,quiet){const w=wingById(id);if(!w||!(wingOwned(w)||window.__forceOwn))return false;cel.wing=w.id;cel.wingsOn=1;WSYNC.w=cel.wing;WSYNC.on=1;try{celSave()}catch(_){}try{WPREV.id=null}catch(_){}return true}
function wingUnequip(){cel.wing='none';cel.wingsOn=0;WSYNC.w='none';WSYNC.on=0;try{celSave()}catch(_){}try{WPREV.id=null}catch(_){}return true}
// preview (wings tab): shown on your character until it expires, the hub closes or you equip. Never changes the saved state.
const WPREV={id:null,until:0};
function wingShown(l){if(WPREV.id){if(performance.now()<WPREV.until){const w=wingById(WPREV.id);if(w)return w}WPREV.id=null}return curWing(l)}
function curAura(l){if(!cel.auraOn)return AURAS[0];if(cel.aura!='auto'){const a=AURAS.find(x=>x.id==cel.aura);if(a&&l>=a.lvl)return a}const u=AURAS.filter(a=>l>=a.lvl);return u[u.length-1]}
const curPlateTier=l=>{const t=npTier(l);return cel.plate=='auto'?t:Math.min(t,cel.plate|0)};
celLoad();
// validation for cosmetic data received from other players (host and clients both run this)
function cleanCx(c){if(!c||typeof c!='object')return null;const n=(v,lo,hi,d)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,v|0)):d},col=(v,d)=>typeof v=='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:d,a=c.ap||{},A=cel.ap;
 const wl=(v,l)=>typeof v=='string'&&l.indexOf(v)>=0?v:'';
 return{fx:{au:wl(c.fx&&c.fx.au,['aura_void','aura_solar','aura_blossom','aura_frost','aura_astral']),ch:wl(c.fx&&c.fx.ch,['star','moon','leaf','chain','raven','mochi','kitsu','lumi','pebble','pip','gloop','cinder','runehalo','sakura','comet']),ws:wl(c.fx&&c.fx.ws,['skin_obsidian','skin_pearl','skin_sakura'])},w:n(c.w,-1,WINGS.length-1,-1),a:n(c.a,0,AURAS.length-1,0),t:n(c.t,0,999,0),ap:{hair:n(a.hair,0,AP.hair.length-1,0),eyes:n(a.eyes,0,AP.eyes.length-1,0),outfit:n(a.outfit,0,AP.outfit.length-1,0),acc:n(a.acc,0,AP.acc.length-1,0),cape:n(a.cape,0,AP.cape.length-1,1),eyeCol:n(a.eyeCol,0,AP.eyeCol.length-1,0),gd:n(a.gd,0,2,0),hairCol:col(a.hairCol,'#3a2a3a'),skinCol:col(a.skinCol,'#f1c9a0'),outCol:col(a.outCol,'#2d3f6b'),trimCol:col(a.trimCol,'#d9b46a')}}}
