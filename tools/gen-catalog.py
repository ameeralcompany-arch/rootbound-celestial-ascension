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
 ('titanmaul','Titan Maul','legendary',2400,'Slams the ground and sends a shockwave along the terrain.')]
for i,n,r,p,d in W: add(id='wpn_'+i,cat='weapons',n=n,price=p,rar=r,stack=0,ref=i,lv=0,d=d,how='store',new=1)
# ---- new building blocks (ids 42-59), data shared with the client through tools/new-blocks.json
for b in json.load(open(os.path.join(R,'tools/new-blocks.json'))):
    add(id='blk_%d'%b['id'],cat='blocks',n=b['n'],price=b['p'],rar=rar_by_price(b['p']),stack=1,ref=b['id'],lv=b['lv'],d=b['d'],how='store',new=1)
# ---- NEW wings
WG=[('dove','Dove Wings','rare',600,0,'Pearl-white feather wings with luminous tips and falling glitter. Gives a double jump.'),
 ('blossom','Blossom Wings','uncommon',400,0,'Soft petal-shaped wings that shed cherry-blossom petals as you move. Gives a double jump.'),
 ('crystal','Crystal Wings','rare',800,0,'Angular shards with refracting light bands. Gives a double jump.'),
 ('mech','Mechanical Wings','epic',1400,0,'Metal plates and glowing conduits with small turning gears. Gives a double jump.'),
 ('umbral','Umbral Eclipse Wings','epic',1800,0,'Violet-black feathers wrapped in rising dark energy. Gives a double jump.'),
 ('galaxy','Galaxy Wings','legendary',3000,40,'Feather silhouettes filled with a living starfield. Needs level 40. Gives a double jump.'),
 ('dragon','Dragon Wings','legendary',3400,60,'Large articulated bat wings with membranes and bone fingers. Needs level 60. Gives a double jump.'),
 ('moth','Omen Moth Wings','mythic',8000,100,'Broad crimson-black moth wings with glowing veins. The rarest wings. Needs level 100. Gives a double jump.'),
 ('eagle','Eagle Wings','rare',900,0,'Broad brown-and-cream flight feathers, built for long glides. Hold Space to fly.'),
 ('swan','Swan Wings','epic',1600,0,'Layered white plumage with a soft glow. Hold Space to fly.'),
 ('raven','Raven Wings','epic',1800,0,'Glossy black feathers with a violet sheen. Hold Space to fly.'),
 ('plume','Phoenix Plume Wings','legendary',3200,70,'Realistic plumage that burns from deep red to gold. Needs level 70. Hold Space to fly.')]
for i,n,r,p,lv,d in WG: add(id='wing_'+i,cat='wings',n=n,price=p,rar=r,stack=0,ref=i,lv=lv,d=d,how='store',new=1,excl=(r=='mythic'))
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
ids=[i['id'] for i in items]; assert len(ids)==len(set(ids)),'duplicate ids'
for i in items:
    assert i['price']>0 and i['rar'] in('common','uncommon','rare','epic','legendary','mythic','exclusive'),i
feat=['wing_galaxy','wpn_solarfang','wpn_astralkat','obj_41','wing_moth','fx_aura_void','charm_raven','wpn_crimsonrift']
for i in items: i['feat']=1 if i['id'] in feat else 0
json.dump({'v':1,'items':items},open(os.path.join(R,'server/catalog.json'),'w'),separators=(',',':'))
print(len(items),'items')
