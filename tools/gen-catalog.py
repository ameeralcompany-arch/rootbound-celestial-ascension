#!/usr/bin/env python3
"""Generates server/catalog.json (the single source of truth for the store: ids, prices, rarity, rules).
The server validates every purchase against this file; build.py inlines it into index.html for display.
Legacy items come from tools/legacy-items.json (dumped from the game's own data); new items are defined below."""
import json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L=json.load(open(os.path.join(R,'tools/legacy-items.json')))
items=[]
def add(**k): items.append(k)
def rar_by_price(p):
    return 'common' if p<100 else 'uncommon' if p<400 else 'rare' if p<1000 else 'epic' if p<2500 else 'legendary'
# ---- legacy: blocks / seeds / objects / weather machines (stackable, bought with gems)
for b in L['blocks']:
    k=b['k']; base=k%100 if k<200 else k
    if 39<=k<=41:
        add(id='obj_%d'%k,cat='weather',n=b['n'],price=b['price'],rar={39:'rare',40:'epic',41:'legendary'}[k],stack=1,ref=k,lv=b['lv'],d={39:'Turns the whole world into a pink cherry-blossom evening with drifting petals.',40:'Opens the sky to deep space: planets, nebulae and slow stars.',41:'A swirling galaxy with colourful nebulae. The grandest sky in Rootbound.'}[k],how='store')
    elif k>=100 and k<200:
        add(id='seed_%d'%k,cat='seeds',n=b['n'],price=b['price'],rar=rar_by_price(b['price']),stack=1,ref=k,lv=b['lv'],d='Plant it and it grows into a harvestable tree.',how='store')
    elif k>=20:
        add(id='obj_%d'%k,cat='objects',n=b['n'],price=b['price'],rar=rar_by_price(b['price']),stack=1,ref=k,lv=b['lv'],d='Placeable interactive object.',how='store')
    else:
        add(id='blk_%d'%k,cat='blocks',n=b['n'],price=b['price'],rar=rar_by_price(b['price']),stack=1,ref=k,lv=b['lv'],d='Building block.',how='store')
# ---- legacy weapons (not evolved forms, not fists)
for w in L['weapons']:
    if w['hid'] or w['id']=='fist' or w['cost']<=0: continue
    add(id='wpn_'+w['id'],cat='weapons',n=w['n'],price=w['cost'],rar=rar_by_price(w['cost']),stack=0,ref=w['id'],lv=0,d=w['d'],how='store',legacy=1)
# ---- legacy gear
for w in L['wear']:
    if w['s']=='wing': continue  # wearable wings were removed: wings are appearance items now
    add(id='wear_'+w['id'],cat='gear',n=w['n'],price=w['cost'],rar=rar_by_price(w['cost']),stack=0,ref=w['id'],lv=w['lv'],d=w['d'],how='store',legacy=1,sub=w['s'])
# ---- NEW weapons
W=[('solarfang','Solar Fang','epic',1200,'A radiant gold-orange blade. Every hit bursts into a sunflare and sets monsters alight.'),
 ('frostbite','Frostbite Edge','rare',700,'Icy crystal edge that sheds frost shards and slows whatever it cuts.'),
 ('astralkat','Astral Katana','epic',1500,'A thin blue-violet blade that leaves a starlit slash and fires a piercing wave.'),
 ('crimsonrift','Crimson Rift','legendary',2800,'Tears red cracks in the ground and pulls monsters into the rift.'),
 ('verdant','Verdant Breaker','uncommon',450,'A living-wood hammer-blade that scatters leaves and heals you while you fight.'),
 ('skyspear','Skyspear','rare',600,'A long thrust that pierces everything in a straight line.'),
 ('thornlash','Thornlash','epic',900,'A living whip that cracks along its length and drags enemies in.'),
 ('moonchakram','Moon Chakram','epic',1100,'Thrown in a wide curve, it returns to your hand and cuts both ways.'),
 ('zephyrbow','Zephyr Bow','rare',800,'Arrows that fall in an arc and stick into walls.'),
 ('stormflail','Stormflail','epic',1500,'A spiked ball on a chain with real momentum.'),
 ('gravitystaff','Graviton Rod','legendary',1800,'Launches a heavy orb that bounces off walls and bursts.'),
 ('galeshuriken','Gale Shurikens','rare',700,'Three seeking stars that ricochet once off walls.'),
 ('titanmaul','Titan Maul','legendary',2400,'Slams the ground and sends a shockwave along the terrain.'),
 ('starwand','Star Wand','rare',900,'Fires a fan of three star bolts that burst into sparkles.'),
 ('frostwand','Frost Wand','epic',1400,'Ice crystals erupt in a line, then shatter in a snowflake ring.'),
 ('voidwand','Void Wand','legendary',2200,'Launches an orb that becomes a black hole with violet lightning.'),
 ('tendrilwand','Crimson Tendril Wand','epic',1700,'Three living tendrils lash out in a red slash.'),
 ('chainwand','Spectral Chains','legendary',2000,'Ghostly chains burst around you and drag enemies in.'),
 ('crowbow','Murder Bow','legendary',1900,'Looses a flock of spectral crows that weave toward enemies.'),
 ('icebow','Glacier Bow','epic',1500,'A frozen arrow that shatters into ice shards.')]
for i,n,r,p,d in W: add(id='wpn_'+i,cat='weapons',n=n,price=p,rar=r,stack=0,ref=i,lv=0,d=d,how='store',new=1)
# ---- new building blocks (ids 42-59), data shared with the client through tools/new-blocks.json
for b in json.load(open(os.path.join(R,'tools/new-blocks.json'))):
    add(id='blk_%d'%b['id'],cat='blocks',n=b['n'],price=b['p'],rar=rar_by_price(b['p']),stack=1,ref=b['id'],lv=b['lv'],d=b['d'],how='store',new=1)
# ---- house-building blocks: tiles 100-114, inventory keys 400-414 (tile + 300; see src/js/late/70-zz-blocks2.js)
HB=[(400,'Clay Brick',12,1,'Warm fired-clay bricks with soft mortar. The classic cottage wall.'),(401,'Half-Timber Wood Frame',16,2,'White plaster set in dark oak beams, like an old village house.'),(402,'Mossy Stone Brick',14,2,'Weathered stone bricks with moss in the cracks. Great for foundations.'),
 (403,'Polished Wood Floor',12,1,'Honey-coloured floorboards with a soft polish.'),(404,'Slate Roof Tile',18,3,'Overlapping blue-grey slate shingles.'),(405,'Mossgreen Roof Tile',18,3,'Rounded clay roof tiles glazed forest green.'),(406,'Thatch Roof',10,1,'Bundled golden straw for a cosy cottage roof.'),
 (407,'Framed Window',20,2,'A clear glass window in a wooden cross frame. You can see through it.'),(408,'Iron Lantern',35,3,'A little iron lantern with a warm flame. Lights up rooms at night.'),(409,'Wooden Bookshelf',28,3,'A dark wood shelf packed with colourful books.'),
 (410,'Wooden Fence',8,1,'A picket fence for gardens and paths. You can walk past it.'),(411,'Woven Rug',14,2,'A soft patterned rug that lies flat on the floor.'),(412,'Marble Floor Tiles',26,4,'Polished checkered marble tiles.'),(413,'Flower Planter',16,2,'A wooden planter box full of bright flowers.'),(414,'Gravel Path',6,1,'Crunchy pebbles over packed earth. Makes a tidy village path.')]
for k,n,p,lv,d in HB: add(id='blk_%d'%k,cat='blocks',n=n,price=p,rar=rar_by_price(p),stack=1,ref=k,lv=lv,d=d,how='store',new=1)
# ---- background walls (item keys 320-328, placed into the wall layer; see src/js/late/70-zz-walls.js)
WL=[(320,'Oak Panel Wall',6,1,'Warm vertical oak panelling for the inside of a house.'),(321,'Stone Brick Wall',6,1,'Grey stone bricks for cellars, towers and cosy cottages.'),(322,'Cream Floral Wallpaper',8,2,'Soft cream wallpaper with tiny flowers.'),(323,'Red Brick Wall',7,1,'Red bricks, set back as a background wall.'),
 (324,'Whitewash Plaster Wall',6,1,'A bright limewashed plaster wall.'),(325,'Dark Timber Wall',7,2,'Dark stained planks, great for attics and taverns.'),(326,'Blue Striped Wallpaper',8,2,'Calm blue wallpaper with thin stripes.'),(327,'Mossy Stone Wall',7,2,'Old stones with moss growing between them.'),(328,'Cottage Window Wall',12,2,'A background wall with a bright window in it.')]
for k,n,p,lv,d in WL: add(id='wall_%d'%k,cat='blocks',n=n,price=p,rar=rar_by_price(p),stack=1,ref=k,lv=lv,d=d,how='store',new=1)
# ---- wings sold for gems (level + exclusive wings are never sold; see WINGS in src/js/late/20-data.js)
WG=[('dove','Dove Wings','common',350,0,'Broad, rounded pearl-white feathers with luminous tips. Gives a double jump.'),
 ('blossom','Blossom Wings','common',380,0,'Soft petal wings that shed cherry-blossom petals as you move. Gives a double jump.'),
 ('crystal','Amethyst Crystal Wings','uncommon',900,0,'Angular amethyst crystals grown from the earth, catching every light. Gives a double jump.'),
 ('mech','Blade Mech Wings','uncommon',1000,0,'Five steel blades on a jointed arm, with glowing conduits. Gives a double jump.'),
 ('umbral','Umbral Obsidian Wings','rare',2200,20,'Long blades of black volcanic glass with a violet rim light. Needs level 20. Gives a double jump.'),
 ('galaxy','Galaxy Wings','rare',2400,30,'Feathers filled with a living, twinkling starfield. Needs level 30. Gives a double jump.'),
 ('dragon','Dragon Wings','rare',2600,35,'Red leather membranes stretched over four bone fingers. They flex with every beat. Needs level 35. Gives a double jump.'),
 ('moth','Omen Moth Wings','uncommon',950,25,'Broad crimson-black moth wings with glowing veins and eye spots. Needs level 25. Gives a double jump.'),
 ('eagle','Eagle Wings','uncommon',800,0,'Broad brown-and-cream wings with spread finger feathers, built for long glides. Gives a double jump.'),
 ('swan','Swan Wings','rare',1800,15,'Long, layered white plumage that rises high and glows along the edge. Needs level 15. Gives a double jump.'),
 ('raven','Raven Wings','rare',2000,20,'Huge glossy black wings with a violet sheen and ragged finger feathers. Needs level 20. Gives a double jump.'),
 ('plume','Phoenix Plume Wings','rare',2500,40,'Long realistic plumes that burn from deep red to gold. Needs level 40. Gives a double jump.'),
 ('zephyr','Zephyr Wings','common',320,0,'Sweeping ribbons of wind around faint, airy feathers. Gives a double jump.'),
 ('bat','Night Bat Wings','uncommon',850,10,'Small demonic bat wings with hooked claws and scalloped membranes. Needs level 10. Gives a double jump.'),
 ('ember','Ember Wings','uncommon',900,10,'Wings of living flame that flicker and shed embers. Needs level 10. Gives a double jump.'),
 ('tide','Tide Wings','uncommon',850,0,'Translucent wings of flowing water with rising bubbles. Gives a double jump.'),
 ('lunar','Lunar Wings','uncommon',950,0,'Three silver crescent moons on each side, glowing softly. Gives a double jump.'),
 ('circuit','Circuit Wings','rare',2300,30,'Hexagonal energy panels on a thin frame, pulsing with data light. Needs level 30. Gives a double jump.'),
 ('spirit','Spectral Wings','rare',2100,25,'Ghostly violet membranes on clawed bones, half in this world. Needs level 25. Gives a double jump.')]
for i,n,r,p,lv,d in WG: add(id='wing_'+i,cat='wings',n=n,price=p,rar=r,stack=0,ref=i,lv=lv,d=d,how='store',new=1,excl=False)
# ---- NEW effects
FXI=[('aura_void','aura','Void Aura','rare',600,'Slow violet smoke curls around you.'),
 ('aura_solar','aura','Solar Aura','epic',900,'A warm ring of drifting sparks.'),
 ('aura_blossom','aura','Blossom Aura','uncommon',500,'Petals orbit gently.'),
 ('aura_frost','aura','Frost Aura','rare',600,'Snow motes and a cold shimmer.'),
 ('aura_astral','aura','Astral Aura','legendary',1600,'Tiny stars orbit on a tilted ring.'),
 ('trail_ember','trail','Ember Dash Trail','uncommon',350,'Embers fall behind your dashes and sprints.'),
 ('trail_neon','trail','Neon Dash Trail','rare',700,'Cyan and pink after-images.'),
 ('trail_crow','trail','Crow Flock Dash','epic',1200,'A flock of dark crows scatters behind your dash.'),
 ('spawn_chains','spawn','Spectral Chains Spawn','rare',800,'Violet chains ring the ground when you arrive.'),
 ('spawn_bloom','spawn','Bloom Spawn','uncommon',500,'A burst of petals when you arrive.'),
 ('vic_nova','victory','Victory Nova','epic',900,'A star nova when you level up or defeat a boss.'),
 ('wt_rose','wtrail','Rose Weapon Trail','uncommon',400,'Pink slash trail for any weapon.'),
 ('wt_azure','wtrail','Azure Weapon Trail','uncommon',400,'Pale-blue slash trail for any weapon.'),
 ('wt_void','wtrail','Void Weapon Trail','rare',650,'Violet-black slash trail for any weapon.'),
 ('skin_obsidian','wskin','Obsidian Weapon Skin','rare',700,'Recolours any weapon in glossy black and violet.'),
 ('skin_pearl','wskin','Pearl Weapon Skin','rare',700,'Recolours any weapon in pearl white.'),
 ('skin_sakura','wskin','Sakura Weapon Skin','epic',1000,'Recolours any weapon in blossom pink.')]
for i,s,n,r,p,d in FXI: add(id='fx_'+i,cat='effects',n=n,price=p,rar=r,stack=0,ref=i,lv=0,d=d,how='store',new=1,sub=s)
# ---- NEW charms
CH=[('star','Star Charm','uncommon',250,'A small star that floats beside you.'),('moon','Moon Charm','uncommon',300,'A crescent that glows softly.'),
 ('lumi','Lumi, Firefly Spirit','uncommon',600,'A tiny glowing firefly that lights your way and flutters beside you. A companion.'),('mochi','Mochi, Cloud Spirit','rare',900,'A soft cloud puff that bounces after you, squishes when you jump and naps when you stand still. A companion.'),
 ('pebble','Pebble, Moss Golem','rare',1000,'A tiny mossy rock with a glowing rune eye. It hops along behind you. A companion.'),('kitsu','Kitsu, Fox Spirit','epic',1600,'A two-tailed fox spirit with blue flames on its tails. A companion.'),
 ('leaf','Leaf Charm','common',150,'A leaf that turns slowly.'),('chain','Spectral Chain Charm','rare',450,'A short chain of light that swings as you move.'),
 ('raven','Raven Companion','epic',1100,'A small raven that circles you.')]
for i,n,r,p,d in CH: add(id='charm_'+i,cat='charms',n=n,price=p,rar=r,stack=0,ref=i,lv=0,d=d,how='store',new=1)
# ---- v8 wardrobe (gear stays legacy: owned via ownW, stats in the WEAR table) + v8 charms; shared with tools/gear-catalog.js
V8=json.load(open(os.path.join(R,'tools/gear-v8.json')))
for g in V8['gear']: add(id='wear_'+g['id'],cat='gear',n=g['n'],price=g['price'],rar=g['rar'],stack=0,ref=g['id'],lv=g['lv'],d=g['d'],how='store',legacy=1,sub=g['sub'],new=1)
for c in V8['charms']: add(id='charm_'+c['id'],cat='charms',n=c['n'],price=c['price'],rar=c['rar'],stack=0,ref=c['id'],lv=0,d=c['d'],how='store',new=1)
# ---- v9 play update: new weather machines + crop seeds; shared with tools/play-catalog.js
V9=json.load(open(os.path.join(R,'tools/play-v9.json')))
for w in V9['weather']: add(id='obj_%d'%w['id'],cat='weather',n=w['n'],price=w['price'],rar=w['rar'],stack=1,ref=w['id'],lv=w['lv'],d=w['d'],how='store',new=1)
for s in V9['seeds']: add(id='seed_%d'%s['id'],cat='seeds',n=s['n'],price=s['price'],rar=s['rar'],stack=1,ref=s['id'],lv=s['lv'],d=s['d'],how='store',new=1)
ids=[i['id'] for i in items]; assert len(ids)==len(set(ids)),'duplicate ids'
for i in items:
    assert i['price']>0 and i['rar'] in('common','uncommon','rare','epic','legendary','mythic','exclusive'),i
feat=['wing_galaxy','wpn_solarfang','wpn_astralkat','obj_41','wing_moth','fx_aura_void','charm_raven','wpn_crimsonrift','wear_anonmask','wear_anonsuit','charm_cinder']
for i in items: i['feat']=1 if i['id'] in feat else 0
json.dump({'v':1,'items':items},open(os.path.join(R,'server/catalog.json'),'w'),separators=(',',':'))
print(len(items),'items')
