// ===== Eight more wings for the store, added to the end of WINGS so nobody's saved or synced wing changes. Art comes from the same parts as the rest (50-wings.js), so they animate like the others. =====
WINGS.push(
 {id:'tideveil',n:'Tidecaller Veil',fam:'elemental',rar:'legendary',src:'shop',lv:38,pal:['#07324e','#1f8cc0','#bff2ff','#e8fbff'],sp:'#d8f6ff',fxk:'bubbles',d:'Long veils of running water that never quite fall. Light ripples through them as you fly.',
  a:{L:100,trail:['drip','dust'],parts:[{s:'tier',e:['tendril','tendril','shroud'],n:[9,8,6],len:[.66,.44,.22],wd:[.13,.15,.3],pa:[-16,100],arm:-30,glow:1}]}},
 {id:'foamlace',n:'Foamlace Wings',fam:'fantasy',rar:'epic',src:'shop',lv:24,pal:['#3a6c98','#a8e4ff','#ffe6f6','#ffffff'],sp:'#ffffff',fxk:'bubbles',d:'Soft pastel wings of sea foam, shedding small round bubbles with every beat.',
  a:{L:82,flutter:1,trail:['dust'],parts:[{s:'tier',e:['moth','mothhind','mothfur'],n:[1,1,1],la:.05,lh:0,len:[.92,.7,.16],wd:[.36,.5,.9],pa:[-22,0],ra:[[62,62],[40,40]],rp:[[.5,.5],[.2,.2]],arm:-24,glow:1}]}},
 {id:'nebuladrake',n:'Nebula Drake',fam:'cosmic',rar:'mythic',src:'shop',lv:60,pal:['#0a0620','#2a1a6a','#7a4ce0','#ffd98a'],sp:'#ffd98a',fxk:'stars',d:'Vast dragon wings whose membranes are open windows on a violet night sky, veined with gold.',
  a:{L:108,corona:{c:'#a890ff',r:.2},trail:['void','spark','dust'],parts:[{s:'mem',fingers:5,bone:'#ffd98a',claw:1,vein:1}]}},
 {id:'cometlance',n:'Comet Lances',fam:'cosmic',rar:'legendary',src:'shop',lv:46,pal:['#0a1838','#3a78d8','#c8ecff','#ffffff'],sp:'#e0f4ff',fxk:'stars',d:'Three tiers of burning comet tails, streaming back from the shoulders.',
  a:{L:98,trail:['spark','dust'],parts:[{s:'tier',e:['bolt','bolt','arc'],n:[7,6,5],len:[.66,.44,.24],wd:[.14,.16,.3],pa:[-14,92],arm:-30,glow:1}]}},
 {id:'sakurasilk',n:'Sakura Silk',fam:'fantasy',rar:'epic',src:'shop',lv:28,pal:['#7a2a54','#ff9ac0','#ffe8f2','#ffffff'],sp:'#ffd0e0',fxk:'petals',d:'Layered silk feathers the colour of a spring dusk. Petals follow you.',
  a:{L:84,trail:['petal','dust','feather'],parts:[{s:'fan',tip:'point',rows:3,n:10,a:[-52,84],arm:-40,att:.55,fw:.24,cov:'round',glow:1}]}},
 {id:'cinderphoenix',n:'Cinder Phoenix',fam:'elemental',rar:'legendary',src:'shop',lv:42,pal:['#5a1208','#ff6a1e','#ffd27a','#fff4d8'],sp:'#ffb24a',fxk:'embers',d:'Burning feathers rimmed in white heat, dropping embers as they fold.',
  a:{L:96,trail:['spark','ember'],parts:[{s:'fan',tip:'point',rows:3,n:12,a:[-56,84],arm:-42,att:.56,fw:.23,rim:'#ffe6a8',glow:1}]}},
 {id:'chronovane',n:'Chrono Vanes',fam:'mechanical',rar:'epic',src:'shop',lv:32,pal:['#2a2018','#a07a3a','#ffe0a0','#8ae6ff'],sp:'#ffe0a0',fxk:'sparks',d:'Brass clockwork panels on oiled hinges, turning over with a quiet tick.',
  a:{L:76,parts:[{s:'mech',style:'panel',n:8,a:[-72,40],joint:'#8ae6ff'}]}},
 {id:'inkdragon',n:'Ink Dragon',fam:'dark',rar:'mythic',src:'shop',lv:58,pal:['#030305','#101016','#6a6a78','#ffffff'],sp:'#ffffff',fxk:'smoke',d:'Great wet strokes of black ink in the shape of a dragon\'s wings. They spatter as you turn.',
  a:{L:110,trail:['smoke','dust'],parts:[{s:'tier',e:['ink','ink','ink'],n:[9,8,7],len:[.7,.46,.24],wd:[.24,.26,.32],pa:[-16,104],arm:-30,glow:1}]}});
// the same preparation 20-data.js gives the first wings: flying needs pw
for(const w of WINGS)if(!Number.isFinite(w.pw))w.pw=Math.max(0,WRAR.indexOf(w.rar))+(w.a&&w.a.L>90?1:0);
