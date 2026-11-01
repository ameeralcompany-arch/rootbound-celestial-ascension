// ===== ARS10: the grand arsenal. 21 new weapons for every class (273), each with its own name, move, element, held art and stats.
// A weapon = a move (13 kinds: slash, thrust, bolt, nova, quake, sky strike, boomerang, chain lightning, beam, dash, vortex, orbiting blades,
// whip lash) + modifiers (twin, wide, long, combo3, fan3/fan5, pierce, homing, gravity, split, burst, bounce, rapid, rain, triple...) + an
// element (fire burns, frost slows, ice freezes, storm stuns and arcs, void pulls, blood heals you, poison eats away, holy and nature heal,
// arcane/star/shadow/moon crit, wind and earth knock back, water and light). No two weapons of a class share the same move + element.
// Rarity by position in the class list: 4 common, 4 uncommon, 4 rare, 4 epic, 3 legendary, 2 mythic, with levels spread through each band.
// Base damage is set so each weapon's measured power lands in its rarity band (BAL11): tools/arsenal-measure.js measures every weapon with
// the balance simulator and writes the AK table below (power per point of base damage) and AM (base damage).
// Art: one parametric painter per weapon kind (blade shapes, guards, heads, gems, runes, palettes from the element), rendered once per
// (weapon, scale bucket) to a canvas and blitted; spinning/swinging parts rotate the cached image. Projectiles and effects live in one
// capped pool, glows are cached sprites per colour, particles go through the capped VFX pool. Weapons never break blocks. =====
const ARS10=(()=>{
 const R=Math.random,TAU=Math.PI*2,PI=Math.PI;
 // ---- the arsenal: per class, 21 rows "Name|kind|move|element|mods" (kind: the held art; the weapon kind WPN.k follows it)
 const LIST={
  brawler:`Pebble Mitts|knuckle|slash|earth|short
Ember Wraps|knuckle|slash|fire|twin short
Frostbite Fists|knuckle|bolt|frost|fist
Gale Knuckles|knuckle|dash|wind|
Viper Fangs|knuckle|slash|poison|combo3 short
Thunderclap Gauntlets|knuckle|nova|storm|
Tidal Fists|knuckle|quake|water|fwd
Iron Lotus|knuckle|orbit|holy|
Comet Knuckles|knuckle|sky|star|
Shadow Claws|knuckle|slash|shadow|wide twin
Crystal Cestus|knuckle|bolt|ice|fan3 fist
Lion's Roar|knuckle|nova|light|big
Quake Breakers|knuckle|quake|earth|
Bloodmoon Knuckles|knuckle|dash|blood|long
Starfist|knuckle|bolt|star|pierce fist
Nebula Fists|knuckle|vortex|void|
Phoenix Gauntlets|knuckle|sky|fire|rain
Titan Grips|knuckle|nova|earth|big
Dragon Palm|knuckle|beam|fire|
Raijin Fury Fists|knuckle|chain|storm|long
Celestial Knuckles|knuckle|slash|holy|combo3 wide`,
  knight:`Squire's Blade|sword|slash|earth|
Oakshield Sword|sword|slash|nature|combo3
Gale Pike|spear|thrust|wind|
Silver Oath|sword|slash|light|wide
Ember Paladin|sword|slash|fire|twin
Frostguard Lance|spear|thrust|frost|long
Lionheart|sword|bolt|holy|crescent
Thornguard|sword|nova|nature|
Storm Halberd|spear|thrust|storm|triple
Crusader's Cross|sword|sky|holy|
Moonlit Claymore|sword|slash|moon|long wide
Tidebreaker|spear|quake|water|fwd
Dawnbreaker|sword|beam|light|
Radiant Lance|spear|thrust|holy|long wave
Bastion Blade|sword|nova|earth|big
Starforged Sword|sword|bolt|star|crescent pierce
Aegis Spear|spear|orbit|light|
Sunfire Greatsword|sword|quake|fire|
Valkyrie Lance|spear|dash|wind|long
Eternal Vow|sword|sky|light|triple
Heaven's Bulwark|sword|nova|holy|big`,
  samurai:`Bamboo Katana|katana|slash|nature|
Plum Rain|katana|slash|water|twin
Kitsune Edge|katana|bolt|fire|crescent
Frost Petal|katana|slash|frost|combo3
Ronin's Oath|katana|dash|wind|
Thunder Iai|katana|dash|storm|long
Crescent Wakizashi|katana|slash|moon|twin short
Koi Current|katana|thrust|water|triple
Ember Shogun|katana|slash|fire|wide combo3
Moonshadow|katana|bolt|shadow|crescent pierce
Wind Reaper Tachi|katana|bolt|wind|crescent fan3
Cherry Storm|katana|vortex|nature|
Dragon Spine|katana|beam|fire|
Ghostfire Odachi|katana|slash|void|long wide
Starfall Katana|katana|sky|star|rain
Raijin Edge|katana|chain|storm|
Lotus Dawn|katana|nova|holy|
Crimson Hanabi|katana|sky|fire|triple
Void Muramasa|katana|dash|void|long
Celestial Masamune|katana|slash|star|combo3 long
Amaterasu|katana|beam|holy|`,
  archer:`Willow Bow|bow|bolt|nature|arrow
Sparrow Shot|bow|bolt|light|rapid arrow
Ember Longbow|bow|bolt|fire|grav arrow
Frostwing Bow|bow|bolt|frost|pierce arrow
Galeforce|bow|bolt|wind|fan3 arrow
Thornvine Bow|bow|bolt|poison|split arrow
Moonstring|bow|bolt|moon|home arrow
Hawkeye|bow|bolt|star|pierce big arrow
Venom Recurve|bow|sky|poison|rain
Thunderhead|bow|chain|storm|
Starshot|bow|sky|star|
Tidal Arc|bow|bolt|water|bounce arrow
Phoenix Wing|bow|sky|fire|triple
Shadow Quill|bow|bolt|shadow|home fan3 arrow
Aurora Bow|bow|beam|light|
Sunpiercer|bow|beam|holy|
Comet Bow|bow|bolt|ice|burst big arrow
Wyvern Bow|bow|bolt|void|split pierce arrow
Seraph Bow|bow|bolt|holy|fan5 home arrow
Eclipse Bow|bow|vortex|void|
Heavenstring|bow|sky|light|rain`,
  mage:`Apprentice Wand|wand|bolt|arcane|
Ember Rod|wand|bolt|fire|burst
Frost Scepter|staff|bolt|frost|fan3
Spark Wand|wand|chain|storm|
Prism Staff|staff|beam|arcane|
Moonstone Staff|staff|bolt|moon|home
Tempest Rod|wand|sky|storm|
Crystal Focus|staff|orbit|ice|
Starseer Staff|staff|sky|star|rain
Aether Wand|wand|bolt|wind|pierce rapid
Nova Scepter|staff|nova|arcane|big
Chrono Staff|staff|vortex|arcane|
Sunflare Rod|wand|beam|fire|
Mirror Wand|wand|bolt|light|bounce fan3
Galaxy Staff|staff|vortex|void|
Runic Codex Staff|staff|orbit|arcane|
Wisp Lantern|staff|bolt|holy|home fan5
Glacial Spire|staff|sky|ice|triple
Void Prism|staff|beam|void|
Archmage's Will|staff|chain|arcane|long
Cosmos Scepter|staff|nova|star|big`,
  demon:`Imp Blade|sword|slash|fire|
Bloodthorn|sword|slash|blood|twin
Brimstone Wand|wand|bolt|fire|burst
Hex Claw|sword|slash|shadow|combo3
Abyss Fang|sword|thrust|void|
Wraith Saber|sword|dash|shadow|
Nightmare Glaive|glaive|boomer|shadow|
Plague Edge|sword|slash|poison|wide
Soulbrand|sword|bolt|blood|crescent home
Inferno Scepter|wand|sky|fire|
Doom Glaive|glaive|boomer|void|
Chaos Wand|wand|chain|void|
Shadowflame|sword|beam|shadow|
Bloodmoon Saber|sword|nova|blood|big
Hellgate Blade|sword|quake|fire|
Sin Eater|glaive|vortex|blood|
Void Tyrant|sword|slash|void|long wide
Abaddon|glaive|boomer|fire|
Lucifer's Dawn|sword|sky|shadow|rain
Demon King's Edge|sword|beam|blood|
Pandemonium|wand|nova|void|big`,
  reaper:`Rusty Sickle|sickle|slash|earth|short
Grave Scythe|scythe|slash|shadow|wide
Bone Harvester|scythe|slash|void|combo3
Wailing Kama|sickle|boomer|shadow|
Frost Scythe|scythe|slash|frost|wide long
Lantern Scythe|scythe|orbit|fire|
Moonsickle|sickle|boomer|moon|
Plague Harvester|scythe|vortex|poison|
Soul Reaper|scythe|slash|blood|long wide
Thunder Reaper|scythe|chain|storm|
Crimson Kama|sickle|dash|blood|
Specter Scythe|scythe|bolt|shadow|crescent pierce
Eclipse Sickle|sickle|boomer|void|
Phantom Harvester|scythe|vortex|void|
Wraithcutter|scythe|dash|shadow|long
Starlit Scythe|scythe|bolt|star|crescent fan3
Death's Whisper|scythe|sky|shadow|
Soulstorm|scythe|orbit|void|
Netherreap|scythe|nova|shadow|big
Thanatos|scythe|beam|void|
Final Requiem|scythe|sky|void|rain`,
  elementalist:`Spark Twig|staff|bolt|storm|
Pyre Staff|staff|bolt|fire|
Glacier Rod|staff|bolt|frost|
Breeze Blade|sword|slash|wind|
Terra Spear|spear|thrust|earth|
Magma Lance|spear|thrust|fire|long
Frostfire Staff|staff|bolt|ice|fan3
Storm Shard|staff|chain|storm|
Quakebrand|sword|quake|earth|
Tide Staff|staff|quake|water|fwd
Cinder Spear|spear|sky|fire|
Blizzard Rod|staff|sky|frost|rain
Lavaflow Blade|sword|slash|fire|wide combo3
Gaia Staff|staff|nova|nature|big
Tsunami Lance|spear|beam|water|
Volcano Heart|staff|nova|fire|big
Permafrost|staff|vortex|ice|
Hurricane Staff|staff|vortex|wind|
Elemental Prism|staff|orbit|arcane|
Primordial Spear|spear|dash|earth|long
Four Winds|staff|bolt|wind|fan5 home`,
  stormcaller:`Tin Hammer|hammer|slash|earth|
Spark Mallet|hammer|slash|storm|
Static Flail|flail|orbit|storm|
Thunder Gavel|hammer|quake|storm|
Cloudbreaker|hammer|sky|light|
Volt Flail|flail|nova|storm|
Rolling Thunder|hammer|bolt|storm|grav burst
Gale Hammer|hammer|nova|wind|
Tempest Hammer|hammer|vortex|wind|
Lightning Censer|flail|chain|storm|
Skyforge Hammer|hammer|sky|fire|
Thundercrown|hammer|beam|storm|
Ion Flail|flail|orbit|arcane|
Frost Thunder|hammer|quake|frost|
Stormbringer|hammer|sky|storm|rain
Raiju Mallet|hammer|dash|storm|
Supercell|flail|vortex|storm|
Heaven's Anvil|hammer|nova|light|big
Thunderking's Maul|hammer|quake|light|
Fulgur|hammer|chain|light|long
Worldstorm|flail|orbit|light|`,
  berserker:`Woodcutter Axe|axe|slash|earth|
Bone Club|maul|quake|earth|
Rage Cleaver|axe|slash|blood|twin
Frostbite Axe|axe|slash|frost|wide
Warlord Maul|maul|nova|earth|
Bloodaxe|axe|boomer|blood|
Earthshaker|maul|quake|storm|
Magma Maul|maul|quake|fire|
Wolfjaw Axe|axe|dash|blood|
Thunder Cleaver|axe|slash|storm|wide combo3
Skullsplitter|axe|slash|shadow|long
Ravager|axe|boomer|fire|
Glacier Breaker|maul|nova|ice|big
Inferno Axe|axe|slash|fire|long wide
Colossus|maul|sky|earth|
Wrathbringer|axe|vortex|blood|
Ragnarok Axe|axe|boomer|storm|
Bloodmoon Maul|maul|nova|blood|big
Titan's Wrath|maul|quake|light|
Worldbreaker|maul|sky|fire|triple
Berserk God's Axe|axe|dash|fire|long`,
  ninja:`Paper Shuriken|shuriken|bolt|wind|star
Kunai Star|shuriken|bolt|earth|pierce star
Wind Chakram|chakram|boomer|wind|
Shadow Star|shuriken|bolt|shadow|fan3 star
Viper Shuriken|shuriken|bolt|poison|bounce star
Moon Ring|chakram|boomer|moon|
Smoke Star|shuriken|vortex|shadow|
Lotus Chakram|chakram|orbit|nature|
Thunder Star|shuriken|chain|storm|
Crimson Ring|chakram|boomer|blood|
Frost Shuriken|shuriken|bolt|frost|fan3 star
Twin Glaive|glaive|slash|wind|twin
Phantom Star|shuriken|bolt|void|home fan3 star
Sakura Ring|chakram|orbit|holy|
Kage Glaive|glaive|dash|shadow|
Dragon Chakram|chakram|boomer|fire|
Starfall Shuriken|shuriken|sky|star|rain
Eclipse Ring|chakram|boomer|void|
Tengu Glaive|glaive|vortex|wind|
Raijin Shuriken|shuriken|bolt|storm|fan5 bounce star
Oblivion Star|shuriken|bolt|star|fan5 home pierce star`,
  druid:`Sprout Staff|staff|bolt|nature|
Vine Whip|whip|lash|nature|
Mossy Mallet|hammer|slash|earth|
Bloom Rod|staff|nova|nature|
Bramble Lash|whip|lash|poison|
Oakheart Staff|staff|quake|nature|fwd
Mushroom Maul|hammer|nova|poison|
Willow Whip|whip|lash|water|
Sunpetal Staff|staff|beam|light|
Thorn Hammer|hammer|quake|earth|
Lotus Rod|staff|orbit|nature|
Spirit Antler Staff|staff|bolt|holy|home fan3
Venom Vine|whip|vortex|poison|
Grove Warden Mallet|hammer|sky|nature|
Moonflower Staff|staff|bolt|moon|fan3 home
Wildroot Lash|whip|lash|earth|long
Ancient Oak|staff|nova|earth|big
Fae Blossom Staff|staff|chain|nature|
World Tree Branch|staff|beam|nature|
Gaia's Lash|whip|lash|holy|long
Eternal Grove|staff|vortex|nature|`,
  gunslinger:`Cork Popper|gun|bolt|earth|bullet
Bubble Pistol|gun|bolt|water|bounce bullet
Ember Derringer|gun|bolt|fire|bullet
Frost Blaster|gun|bolt|frost|pierce bullet
Spark Repeater|gun|bolt|storm|rapid bullet
Jelly Launcher|gun|bolt|poison|grav burst
Starlight Revolver|gun|bolt|star|big bullet
Hydro Cannon|gun|beam|water|
Neon Carbine|gun|bolt|arcane|rapid pierce bullet
Thunder Rifle|gun|chain|storm|
Comet Hand-cannon|gun|bolt|ice|burst big
Prism Repeater|gun|bolt|light|fan3 bounce bullet
Gatling Bloom|gun|bolt|nature|rapid fan3 bullet
Plasma Caster|gun|beam|arcane|
Railstar|gun|beam|star|
Nova Shotgun|gun|bolt|holy|fan5 bullet
Meteor Launcher|gun|sky|fire|
Aurora Rifle|gun|bolt|moon|pierce home bullet
Singularity Gun|gun|vortex|void|
Supernova Cannon|gun|sky|star|triple
Big Bang Blaster|gun|bolt|void|fan5 burst`};
 const KIND={knuckle:'knuckle',sword:'sword',katana:'sword',spear:'spear',bow:'bow',wand:'wand',staff:'staff',glaive:'glaive',sickle:'sickle',scythe:'scythe',hammer:'hammer',flail:'flail',maul:'maul',axe:'maul',shuriken:'shuriken',chakram:'chakram',whip:'whip',gun:'gun'};
 // elements: [main colour, light colour, dark colour, metal tint]
 const EL={fire:['#ff7a2a','#ffd27a','#8a2a10','#e8a070'],frost:['#8ae0ff','#e8fbff','#2a6a9a','#cfe8f8'],ice:['#bff6ff','#ffffff','#4ab8d8','#e6f8ff'],storm:['#ffe85a','#fffbd0','#8a6a10','#f0e6b0'],
  void:['#9a6aff','#e0d0ff','#2a1046','#6a5a8a'],blood:['#ff3a4a','#ffb0b8','#5a0a14','#8a3a40'],poison:['#8aff5a','#e0ffc8','#2a6a1a','#a8c890'],holy:['#fff2a0','#ffffff','#b8862a','#f8f0d8'],
  arcane:['#d08aff','#ffd8ff','#4a1a7a','#c8b8e8'],wind:['#a8ffe0','#ffffff','#2a8a6a','#d8f4ec'],earth:['#c8964a','#f0d8a8','#5a3a1a','#b8a080'],star:['#ffe9a8','#ffffff','#6a4aa8','#e8e0ff'],
  shadow:['#8a6ad8','#d8c8ff','#140a24','#5a5068'],moon:['#d8e0ff','#ffffff','#4a5a9a','#e0e6f8'],nature:['#7aff8a','#e0ffe0','#2a6a3a','#b8d8a8'],water:['#4ac8ff','#d8f6ff','#1a5a8a','#b0d8e8'],light:['#fff6c0','#ffffff','#c8a040','#f8f4e0']};
 const ELN={fire:'sets monsters ablaze',frost:'chills and slows',ice:'can freeze monsters solid',storm:'can stun and arcs to a neighbour',void:'drags monsters inward',blood:'heals you as it hits',poison:'poisons monsters',
  holy:'can heal you',arcane:'hits critically now and then',wind:'blasts monsters back',earth:'can stagger monsters',star:'lands brilliant critical hits',shadow:'strikes critically from the shadows',moon:'slows and can crit',
  nature:'mends you as it hits',water:'pushes monsters away',light:'can heal you and knocks back'};
 const MOVEN=(m,M)=>({slash:M.has('twin')?'Two quick slashes':M.has('wide')?'A wide sweeping slash':M.has('short')?'Fast close-range strikes':'A clean slash',thrust:M.has('triple')?'Three lightning thrusts':'A piercing thrust',
  bolt:(M.has('fan5')?'Five ':M.has('fan3')?'Three ':'')+(M.has('arrow')?'arrows':M.has('bullet')?'shots':M.has('star')?'thrown stars':M.has('crescent')?'crescent waves':M.has('fist')?'energy fists':'magic bolts')+(M.has('fan3')||M.has('fan5')?' in a fan':' fly straight'),
  nova:'A burst all around you',quake:M.has('fwd')?'A shockwave rolls forward along the ground':'A ground slam sends shockwaves both ways',sky:M.has('rain')?'Rains strikes from the sky around the target':M.has('triple')?'Three strikes fall on the target':'Calls a strike down on the target',
  boomer:'Thrown in an arc and returns, cutting both ways',chain:'Lightning leaps from monster to monster',beam:'A beam pierces everything in a line',dash:'Dash through monsters',vortex:'Opens a vortex that pulls monsters in',orbit:'Blades orbit you and cut what they touch',lash:'A lash cracks along its whole length'}[m]);
 const MODN=M=>{const o=[];if(M.has('combo3'))o.push('every third attack lands a heavy blow');if(M.has('long'))o.push('long reach');if(M.has('pierce'))o.push('pierces');if(M.has('home'))o.push('seeks targets');if(M.has('grav'))o.push('arcs under gravity');if(M.has('split'))o.push('splits on impact');if(M.has('burst'))o.push('explodes');if(M.has('bounce'))o.push('bounces off walls');if(M.has('rapid'))o.push('fires fast');if(M.has('big'))o.push('a huge radius');if(M.has('wave'))o.push('ends in a light wave');return o.join(', ')};
 // rarity per row position; level ranges per rarity (the class level needed follows the rarity, CJOB)
 const RAR=[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5],RO=['common','uncommon','rare','epic','legendary','mythic'],LVR=[[1,7],[6,15],[14,25],[24,35],[34,46],[46,58]],PRICE=[150,500,1200,2400,4200,7000];
 const BASECD={slash:.42,thrust:.5,bolt:.46,nova:.9,quake:1,sky:.9,boomer:.75,chain:.65,beam:.75,dash:.9,vortex:1.4,orbit:2.6,lash:.5};
 const slug=s=>s.toLowerCase().replace(/'/g,'').replace(/[^a-z0-9]+/g,'');
 const SPEC={},IDS=[],BYC={};
 for(const cls in LIST){BYC[cls]=[];const rows=LIST[cls].split('\n');rows.forEach((row,i)=>{const[n,art,mv,el,mods]=row.split('|');const M=new Set((mods||'').split(/\s+/).filter(Boolean)),id='ax_'+slug(n),r=RAR[i]|0,inR=RAR.filter((x,j)=>x==r&&j<i).length,cnt=RAR.filter(x=>x==r).length,lr=LVR[r];
   const lv=Math.round(lr[0]+(lr[1]-lr[0])*(cnt>1?inR/(cnt-1):.5)),cd=+(BASECD[mv]*(M.has('twin')||M.has('long')&&mv=='slash'?1.15:1)*(M.has('rapid')?.42:1)*(M.has('fan3')?1.25:1)*(M.has('fan5')?1.45:1)*(M.has('big')?1.35:1)*(M.has('burst')?1.4:1)*(M.has('triple')||M.has('rain')?1.3:1)*(M.has('short')?.8:1)).toFixed(3);
   const c=EL[el];SPEC[id]={id,n,cls,art,mv,el,M,c,r,lv};IDS.push(id);BYC[cls].push(id);
   const tail=MODN(M),d=MOVEN(mv,M)+(tail?' ('+tail+')':'')+'; '+ELN[el]+'.';
   WPN[id]={id,n,k:KIND[art],bd:1,md:10,cd,lv,cost:Math.round(PRICE[r]*(1+lv/40)/10)*10,rar:RO[r],g:hexRGB(c[0]),fx:'',d,move:MOVEN(mv,M),cls,ars:1}})}
 function hexRGB(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
 // measured power per point of base damage (BAL11's K) and base damage (BAL11's MD), written by tools/arsenal-measure.js
 const AK=/*AK*/{ax_pebblemitts:3.763,ax_willowbow:2.726,ax_emberwraps:6.671,ax_frostbitefists:2.733,ax_galeknuckles:1.79,ax_viperfangs:7.317,ax_thunderclapgauntlets:1.936,ax_tidalfists:1.691,ax_ironlotus:1.879,ax_cometknuckles:2.154,ax_shadowclaws:6.251,ax_crystalcestus:6.009,ax_lionsroar:1.33,ax_quakebreakers:1.676,ax_bloodmoonknuckles:1.75,ax_starfist:4.147,ax_nebulafists:2.156,ax_phoenixgauntlets:3.385,ax_titangrips:1.338,ax_dragonpalm:2.274,ax_raijinfuryfists:2.489,ax_celestialknuckles:5.743,ax_squiresblade:3.072,ax_oakshieldsword:5.533,ax_galepike:2.935,ax_silveroath:3.062,ax_emberpaladin:5.734,ax_frostguardlance:2.889,ax_lionheart:3.601,ax_thornguard:1.813,ax_stormhalberd:6.291,ax_crusaderscross:1.807,ax_moonlitclaymore:3.561,ax_tidebreaker:1.708,ax_dawnbreaker:2.245,ax_radiantlance:2.867,ax_bastionblade:1.236,ax_starforgedsword:4.064,ax_aegisspear:1.838,ax_sunfiregreatsword:1.76,ax_valkyrielance:1.826,ax_eternalvow:2.487,ax_heavensbulwark:1.291,ax_bambookatana:3.071,ax_plumrain:5.658,ax_kitsuneedge:3.786,ax_frostpetal:5.557,ax_roninsoath:1.831,ax_thunderiai:1.911,ax_crescentwakizashi:6.87,ax_koicurrent:5.998,ax_embershogun:5.768,ax_moonshadow:3.997,ax_windreapertachi:8.079,ax_cherrystorm:2.166,ax_dragonspine:2.281,ax_ghostfireodachi:3.069,ax_starfallkatana:3.715,ax_raijinedge:2.462,ax_lotusdawn:1.746,ax_crimsonhanabi:2.67,ax_voidmuramasa:1.823,ax_celestialmasamune:6.015,ax_amaterasu:2.216,ax_sparrowshot:6.485,ax_emberlongbow:2.908,ax_frostwingbow:3.616,ax_galeforce:6.385,ax_thornvinebow:3.302,ax_moonstring:2.927,ax_hawkeye:3.016,ax_venomrecurve:3.532,ax_thunderhead:2.478,ax_starshot:1.946,ax_tidalarc:2.805,ax_phoenixwing:2.595,ax_shadowquill:7.487,ax_aurorabow:2.201,ax_sunpiercer:2.364,ax_cometbow:1.759,ax_wyvernbow:3.783,ax_seraphbow:9.493,ax_eclipsebow:2.155,ax_heavenstring:3.359,ax_apprenticewand:2.948,ax_emberrod:2.41,ax_frostscepter:6.115,ax_sparkwand:2.424,ax_prismstaff:2.542,ax_moonstonestaff:2.876,ax_tempestrod:1.932,ax_crystalfocus:1.797,ax_starseerstaff:3.731,ax_aetherwand:8.459,ax_novascepter:1.438,ax_chronostaff:2.452,ax_sunflarerod:2.385,ax_mirrorwand:5.606,ax_galaxystaff:2.144,ax_runiccodexstaff:2.041,ax_wisplantern:9.45,ax_glacialspire:2.57,ax_voidprism:2.228,ax_archmageswill:2.718,ax_cosmosscepter:1.373,ax_impblade:3.409,ax_bloodthorn:5.734,ax_brimstonewand:2.544,ax_hexclaw:6.412,ax_abyssfang:2.934,ax_wraithsaber:1.966,ax_nightmareglaive:2.411,ax_plagueedge:3.316,ax_soulbrand:3.605,ax_infernoscepter:1.87,ax_doomglaive:2.122,ax_chaoswand:2.447,ax_shadowflame:2.536,ax_bloodmoonsaber:1.284,ax_hellgateblade:1.687,ax_sineater:2.122,ax_voidtyrant:3.178,ax_abaddon:2.18,ax_lucifersdawn:3.767,ax_demonkingsedge:2.237,ax_pandemonium:1.29,ax_rustysickle:3.919,ax_gravescythe:3.474,ax_boneharvester:5.791,ax_wailingkama:2.378,ax_frostscythe:3.115,ax_lanternscythe:1.982,ax_moonsickle:2.186,ax_plagueharvester:2.24,ax_soulreaper:3.152,ax_thunderreaper:2.447,ax_crimsonkama:1.734,ax_specterscythe:4.283,ax_eclipsesickle:2.119,ax_phantomharvester:2.144,ax_wraithcutter:2.003,ax_starlitscythe:8.737,ax_deathswhisper:1.993,ax_soulstorm:1.851,ax_netherreap:1.406,ax_thanatos:2.237,ax_finalrequiem:3.401,ax_sparktwig:2.813,ax_pyrestaff:2.919,ax_glacierrod:2.814,ax_breezeblade:3.211,ax_terraspear:2.934,ax_magmalance:3.099,ax_frostfirestaff:6.285,ax_stormshard:2.49,ax_quakebrand:1.654,ax_tidestaff:1.651,ax_cinderspear:1.87,ax_blizzardrod:3.376,ax_lavaflowblade:5.783,ax_gaiastaff:1.284,ax_tsunamilance:2.22,ax_volcanoheart:1.378,ax_permafrost:2.189,ax_hurricanestaff:2.166,ax_elementalprism:2.108,ax_primordialspear:1.719,ax_fourwinds:9.588,ax_tinhammer:3.133,ax_sparkmallet:3.284,ax_staticflail:1.964,ax_thundergavel:1.73,ax_cloudbreaker:1.84,ax_voltflail:1.812,ax_rollingthunder:2.458,ax_galehammer:1.738,ax_tempesthammer:2.179,ax_lightningcenser:2.447,ax_skyforgehammer:1.87,ax_thundercrown:2.362,ax_ionflail:2.09,ax_frostthunder:1.654,ax_stormbringer:3.641,ax_raijumallet:1.797,ax_supercell:2.307,ax_heavensanvil:1.293,ax_thunderkingsmaul:1.66,ax_fulgur:2.467,ax_worldstorm:1.863,ax_woodcutteraxe:3.133,ax_boneclub:1.66,ax_ragecleaver:5.734,ax_frostbiteaxe:3.211,ax_warlordmaul:1.719,ax_bloodaxe:2.089,ax_earthshaker:1.729,ax_magmamaul:1.725,ax_wolfjawaxe:1.728,ax_thundercleaver:5.949,ax_skullsplitter:3.597,ax_ravager:2.215,ax_glacierbreaker:1.29,ax_infernoaxe:3.316,ax_colossus:1.832,ax_wrathbringer:2.122,ax_ragnarokaxe:2.256,ax_bloodmoonmaul:1.293,ax_titanswrath:1.66,ax_worldbreaker:2.601,ax_berserkgodsaxe:1.72,ax_papershuriken:2.757,ax_kunaistar:3.593,ax_windchakram:2.11,ax_shadowstar:7.016,ax_vipershuriken:2.876,ax_moonring:2.239,ax_smokestar:2.466,ax_lotuschakram:1.816,ax_thunderstar:2.463,ax_crimsonring:2.122,ax_frostshuriken:6.235,ax_twinglaive:5.683,ax_phantomstar:6.648,ax_sakuraring:1.838,ax_kageglaive:1.966,ax_dragonchakram:2.185,ax_starfallshuriken:3.85,ax_eclipsering:2.1,ax_tenguglaive:2.195,ax_raijinshuriken:7.822,ax_oblivionstar:13.851,ax_sproutstaff:2.757,ax_vinewhip:2.967,ax_mossymallet:3.211,ax_bloomrod:1.738,ax_bramblelash:3.106,ax_oakheartstaff:1.67,ax_mushroommaul:1.78,ax_willowwhip:2.973,ax_sunpetalstaff:2.231,ax_thornhammer:1.651,ax_lotusrod:1.848,ax_spiritantlerstaff:6.607,ax_venomvine:2.189,ax_grovewardenmallet:1.832,ax_moonflowerstaff:7.051,ax_wildrootlash:2.933,ax_ancientoak:1.294,ax_faeblossomstaff:2.449,ax_worldtreebranch:2.228,ax_gaiaslash:2.941,ax_eternalgrove:2.18,ax_corkpopper:2.757,ax_bubblepistol:2.814,ax_emberderringer:2.931,ax_frostblaster:3.608,ax_sparkrepeater:6.788,ax_jellylauncher:2.49,ax_starlightrevolver:2.405,ax_hydrocannon:2.224,ax_neoncarbine:9.208,ax_thunderrifle:2.447,ax_comethandcannon:1.769,ax_prismrepeater:5.59,ax_gatlingbloom:14.033,ax_plasmacaster:2.483,ax_railstar:2.63,ax_novashotgun:8.908,ax_meteorlauncher:1.861,ax_aurorarifle:3.777,ax_singularitygun:2.187,ax_supernovacannon:2.869,ax_bigbangblaster:7.555}/*AK*/,AM=/*AM*/{ax_pebblemitts:12,ax_willowbow:16.5,ax_emberwraps:6.8,ax_frostbitefists:16.6,ax_galeknuckles:25.4,ax_viperfangs:7.9,ax_thunderclapgauntlets:30.3,ax_tidalfists:34.6,ax_ironlotus:31.2,ax_cometknuckles:34.8,ax_shadowclaws:12.3,ax_crystalcestus:12.8,ax_lionsroar:57.7,ax_quakebreakers:57.9,ax_bloodmoonknuckles:56,ax_starfist:23.6,ax_nebulafists:45.9,ax_phoenixgauntlets:37.2,ax_titangrips:95.1,ax_dragonpalm:56.8,ax_raijinfuryfists:66.5,ax_celestialknuckles:29.2,ax_squiresblade:14.7,ax_oakshieldsword:8.2,ax_galepike:15.5,ax_silveroath:14.8,ax_emberpaladin:10.1,ax_frostguardlance:20.3,ax_lionheart:16.3,ax_thornguard:32.3,ax_stormhalberd:11.9,ax_crusaderscross:42.5,ax_moonlitclaymore:21.6,ax_tidebreaker:44.9,ax_dawnbreaker:43.2,ax_radiantlance:34.2,ax_bastionblade:79.3,ax_starforgedsword:24.4,ax_aegisspear:68.5,ax_sunfiregreatsword:72.3,ax_valkyrielance:70.8,ax_eternalvow:66.6,ax_heavensbulwark:129.9,ax_bambookatana:14.7,ax_plumrain:8,ax_kitsuneedge:12,ax_frostpetal:8.2,ax_roninsoath:31.7,ax_thunderiai:30.7,ax_crescentwakizashi:8.5,ax_koicurrent:9.8,ax_embershogun:13,ax_moonshadow:19.2,ax_windreapertachi:9.5,ax_cherrystorm:35.4,ax_dragonspine:42.5,ax_ghostfireodachi:31.9,ax_starfallkatana:26.4,ax_raijinedge:40.2,ax_lotusdawn:72.2,ax_crimsonhanabi:47.7,ax_voidmuramasa:70.9,ax_celestialmasamune:27.5,ax_amaterasu:75.6,ax_sparrowshot:7,ax_emberlongbow:15.6,ax_frostwingbow:12.6,ax_galeforce:9.1,ax_thornvinebow:17.7,ax_moonstring:20,ax_hawkeye:19.4,ax_venomrecurve:21.2,ax_thunderhead:31,ax_starshot:39.4,ax_tidalarc:27.4,ax_phoenixwing:37.4,ax_shadowquill:13.1,ax_aurorabow:44.5,ax_sunpiercer:41.9,ax_cometbow:71.6,ax_wyvernbow:33.6,ax_seraphbow:13.6,ax_eclipsebow:76.9,ax_heavenstring:49.9,ax_apprenticewand:15.3,ax_emberrod:18.9,ax_frostscepter:7.4,ax_sparkwand:18.8,ax_prismstaff:22.8,ax_moonstonestaff:20.4,ax_tempestrod:30.3,ax_crystalfocus:32.6,ax_starseerstaff:20.1,ax_aetherwand:9.1,ax_novascepter:53.4,ax_chronostaff:31.3,ax_sunflarerod:40.7,ax_mirrorwand:17.5,ax_galaxystaff:45.7,ax_runiccodexstaff:48.5,ax_wisplantern:13.3,ax_glacialspire:49.5,ax_voidprism:58,ax_archmageswill:60.9,ax_cosmosscepter:122.1,ax_impblade:13.2,ax_bloodthorn:7.9,ax_brimstonewand:17.9,ax_hexclaw:7.1,ax_abyssfang:19.8,ax_wraithsaber:29.8,ax_nightmareglaive:24.3,ax_plagueedge:17.7,ax_soulbrand:20.8,ax_infernoscepter:41.1,ax_doomglaive:36.2,ax_chaoswand:31.4,ax_shadowflame:38.3,ax_bloodmoonsaber:76.3,ax_hellgateblade:58.1,ax_sineater:46.6,ax_voidtyrant:39.6,ax_abaddon:58.4,ax_lucifersdawn:34.3,ax_demonkingsedge:74,ax_pandemonium:130,ax_rustysickle:11.5,ax_gravescythe:13.1,ax_boneharvester:7.8,ax_wailingkama:19.1,ax_frostscythe:18.6,ax_lanternscythe:29.6,ax_moonsickle:26.8,ax_plagueharvester:26.2,ax_soulreaper:23.8,ax_thunderreaper:31.4,ax_crimsonkama:44.3,ax_specterscythe:17.9,ax_eclipsesickle:45.8,ax_phantomharvester:45.7,ax_wraithcutter:48.9,ax_starlitscythe:11.3,ax_deathswhisper:63.2,ax_soulstorm:68.7,ax_netherreap:91.9,ax_thanatos:74,ax_finalrequiem:49.3,ax_sparktwig:16,ax_pyrestaff:15.6,ax_glacierrod:16.1,ax_breezeblade:14.2,ax_terraspear:19.8,ax_magmalance:18.9,ax_frostfirestaff:9.3,ax_stormshard:23.5,ax_quakebrand:45.3,ax_tidestaff:46.5,ax_cinderspear:41.1,ax_blizzardrod:22.7,ax_lavaflowblade:16.8,ax_gaiastaff:76.3,ax_tsunamilance:44.1,ax_volcanoheart:71.8,ax_permafrost:57.5,ax_hurricanestaff:58.7,ax_elementalprism:61.3,ax_primordialspear:96.3,ax_fourwinds:17.5,ax_tinhammer:14.4,ax_sparkmallet:13.8,ax_staticflail:23.1,ax_thundergavel:26.3,ax_cloudbreaker:31.5,ax_voltflail:32.3,ax_rollingthunder:23.8,ax_galehammer:33.7,ax_tempesthammer:34.4,ax_lightningcenser:31.4,ax_skyforgehammer:41.1,ax_thundercrown:32.5,ax_ionflail:46.4,ax_frostthunder:59.3,ax_stormbringer:26.9,ax_raijumallet:55.1,ax_supercell:54.6,ax_heavensanvil:98.4,ax_thunderkingsmaul:77.9,ax_fulgur:67.1,ax_worldstorm:90,ax_woodcutteraxe:14.4,ax_boneclub:27.4,ax_ragecleaver:7.9,ax_frostbiteaxe:14.2,ax_warlordmaul:33.7,ax_bloodaxe:28,ax_earthshaker:33.9,ax_magmamaul:34,ax_wolfjawaxe:43.4,ax_thundercleaver:12.9,ax_skullsplitter:21.3,ax_ravager:34.7,ax_glacierbreaker:75.2,ax_infernoaxe:29.6,ax_colossus:53.5,ax_wrathbringer:46.6,ax_ragnarokaxe:55.8,ax_bloodmoonmaul:98.4,ax_titanswrath:77.9,ax_worldbreaker:63.7,ax_berserkgodsaxe:97.5,ax_papershuriken:16.3,ax_kunaistar:12.6,ax_windchakram:21.5,ax_shadowstar:6.5,ax_vipershuriken:20.2,ax_moonring:26.2,ax_smokestar:23.8,ax_lotuschakram:32.3,ax_thunderstar:30.5,ax_crimsonring:36.2,ax_frostshuriken:12.3,ax_twinglaive:13.5,ax_phantomstar:14.6,ax_sakuraring:53.3,ax_kageglaive:49.8,ax_dragonchakram:45.3,ax_starfallshuriken:32.7,ax_eclipsering:60.6,ax_tenguglaive:58.9,ax_raijinshuriken:21.2,ax_oblivionstar:12.1,ax_sproutstaff:16.3,ax_vinewhip:15.3,ax_mossymallet:14.2,ax_bloomrod:26.1,ax_bramblelash:18.7,ax_oakheartstaff:35.1,ax_mushroommaul:32.9,ax_willowwhip:19.7,ax_sunpetalstaff:33.6,ax_thornhammer:46.5,ax_lotusrod:41.5,ax_spiritantlerstaff:11.6,ax_venomvine:44.3,ax_grovewardenmallet:53.5,ax_moonflowerstaff:13.9,ax_wildrootlash:33.8,ax_ancientoak:97.4,ax_faeblossomstaff:52,ax_worldtreebranch:58,ax_gaiaslash:56.3,ax_eternalgrove:76.9,ax_corkpopper:16.3,ax_bubblepistol:16.1,ax_emberderringer:15.5,ax_frostblaster:12.6,ax_sparkrepeater:8.5,ax_jellylauncher:23.5,ax_starlightrevolver:24.4,ax_hydrocannon:26.3,ax_neoncarbine:8.1,ax_thunderrifle:31.4,ax_comethandcannon:43.4,ax_prismrepeater:13.7,ax_gatlingbloom:6.9,ax_plasmacaster:39.5,ax_railstar:37.3,ax_novashotgun:11.1,ax_meteorlauncher:67.7,ax_aurorarifle:33.7,ax_singularitygun:59.1,ax_supernovacannon:57.7,ax_bigbangblaster:22.2}/*AM*/;
 for(const id of IDS){if(AM[id])WPN[id].md=AM[id];if(AK[id])try{BAL11.K[id]=AK[id]}catch(_){}}
 // class membership (86-classes.js reads w.cls) and the class id lists (the class screen and the balance checks)
 try{for(const cls in BYC)for(const id of BYC[cls])CLASS7.C[cls].ids.push(id)}catch(e){console.error('ARS10 classes',e)}
 // ---- store: local catalog items, owned in `own` (like the gun shop)
 try{for(const id of IDS){const w=WPN[id],cid='wpn_'+id;if(SHOP7.byId.has(cid))continue;const it={id:cid,cat:'weapons',n:w.n,price:w.cost,rar:w.rar,stack:0,ref:id,lv:w.lv,d:w.d,how:'store',legacy:1,new:1,feat:0,local:1};SHOP7.items.push(it);SHOP7.byId.set(cid,it)}}catch(e){console.error('ARS10 store',e)}
 // ================= behaviour =================
 const PR=[];const live=m=>!m.dead&&m.hp>0,rad=m=>Math.max(m.w,m.h)*.5,cy0=m=>m.y+m.h/2;
 const pos=()=>({x:P.x,y:P.y+23});
 const solidP=(x,y)=>solidAt(Math.floor(x/T),Math.floor(y/T));
 const red=()=>typeof QM!='undefined'&&QM&&QM.reduce;
 const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/l;t=t<0?0:t>1?1:t;return Math.hypot(px-(ax+dx*t),py-(ay+dy*t))};
 const reach=(o,a,len)=>{for(let d=T*.4;d<=len;d+=T*.4)if(solidP(o.x+Math.cos(a)*d,o.y+Math.sin(a)*d))return d;return len};
 const spark=(x,y,c,n,sp)=>{if(red())n=Math.ceil(n/3);try{for(let i=0;i<n;i++){const a=R()*TAU,v=(.3+R())*(sp||140);VFX.add(1,c,x,y,Math.cos(a)*v,Math.sin(a)*v,.45,8,2,{a:1})}}catch(_){}};
 const tone=(f,d,ty,v,b)=>{try{snd(f,d,ty,v,b)}catch(_){}};
 const SND={slash:[520,.08,'triangle',.04,.5],thrust:[760,.07,'triangle',.04,.6],bolt:[880,.07,'sine',.035,.6],nova:[160,.3,'sine',.06,.4],quake:[70,.35,'square',.07,.4],sky:[240,.25,'sawtooth',.04,.5],boomer:[640,.2,'sine',.035,.6],
  chain:[1400,.12,'square',.03,.5],beam:[300,.25,'sawtooth',.04,.5],dash:[420,.15,'triangle',.04,.7],vortex:[110,.5,'sine',.06,.4],orbit:[980,.2,'sine',.03,.6],lash:[1800,.05,'square',.04,.7]};
 // damage + the element's effect
 function hit(m,w,k,ang,S,o){if(!live(m))return;const e=S.el;let kk=k;
  if((e=='arcane'&&R()<.16)||(e=='star'&&R()<.15)||(e=='shadow'&&R()<.2)||(e=='moon'&&R()<.1))kk*=e=='star'?1.9:1.7;
  try{hurtMob(m,Math.max(1,Math.round(dmgM(w)*kk)),w,ang)}catch(err){console.error(err)}
  if(e=='fire')m.burn=Math.max(m.burn||0,2.5);else if(e=='poison')m.burn=Math.max(m.burn||0,3.5);
  else if(e=='frost'||e=='moon')m.slow=Math.max(m.slow||0,e=='frost'?2:1.4);
  else if(e=='ice'){m.slow=Math.max(m.slow||0,2.4);if(R()<.22)m.stun=Math.max(m.stun||0,.6)}
  else if(e=='storm'){if(R()<.28)m.stun=Math.max(m.stun||0,.4);if(!S.noArc&&R()<.5){let b=null,bd=T*3.2;for(const q of mobs)if(q!==m&&live(q)){const d=Math.hypot(q.x-m.x,q.y-m.y);if(d<bd){bd=d;b=q}}if(b){try{hurtMob(b,Math.max(1,Math.round(dmgM(w)*k*.4)),w,ang)}catch(_){}PR.push({k:'zap',pts:[[m.x,cy0(m)],[b.x,cy0(b)]],t:.12,c:S.c})}}}
  else if(e=='void'){const cx=o?o.x:P.x,cy=o?o.y:P.y;m.vx=(m.vx||0)+(cx-m.x)*1.4;m.vy=(m.vy||0)+(cy-m.y)*.6}
  else if(e=='blood'){if(P.hp>0)P.hp=Math.min(maxHP(),P.hp+Math.max(1,dmgM(w)*kk*.05))}
  else if(e=='holy'||e=='light'){if(R()<.18&&P.hp>0)P.hp=Math.min(maxHP(),P.hp+maxHP()*.012);if(e=='light'){m.vx=(m.vx||0)+Math.cos(ang||0)*160}}
  else if(e=='nature'){if(R()<.3&&P.hp>0)P.hp=Math.min(maxHP(),P.hp+maxHP()*.006)}
  else if(e=='wind'||e=='water'){m.vx=(m.vx||0)+Math.cos(ang||0)*(e=='wind'?360:240);m.vy=(m.vy||0)-110}
  else if(e=='earth'){if(R()<.3)m.stun=Math.max(m.stun||0,.25);m.vy=(m.vy||0)-160}
  if(!red()&&R()<.6)spark(m.x,cy0(m),S.c[0],4,130)}
 const cnt={};
 const MOVE={
  slash(w,S,a,o){const M=S.M,Rr=T*(M.has('long')?2.5:M.has('short')?1.45:1.9),arc=M.has('wide')?1.45:M.has('short')?.85:1.05,c3=M.has('combo3')&&(cnt[w.id]=(cnt[w.id]|0)+1)%3==0;
   const go=(aa,k)=>{for(const m of mobs){if(!live(m))continue;const d=Math.hypot(m.x-o.x,cy0(m)-o.y);if(d>Rr+rad(m))continue;let da=Math.abs(Math.atan2(cy0(m)-o.y,m.x-o.x)-aa);if(da>PI)da=TAU-da;if(da<arc||d<rad(m))hit(m,w,k,aa,S,o)}PR.push({k:'arc',x:o.x,y:o.y,a:aa,R:Rr,arc,t:.18,t0:.18,c:S.c,dir:P.f||1})};
   go(a,c3?2.2:1);if(M.has('twin'))PR.push({k:'later',t:.11,f:()=>go(a,1)});if(c3)PR.push({k:'bolt',x:o.x,y:o.y,vx:Math.cos(a)*640,vy:Math.sin(a)*640,l:.7,r:16,w,S,vis:'crescent',pierce:9,hit:new Set(),dmg:1})},
  thrust(w,S,a,o){const M=S.M,L0=T*(M.has('long')?4.2:3.2);const go=k=>{const L=reach(o,a,L0);for(const m of mobs)if(live(m)&&segDist(m.x,cy0(m),o.x,o.y,o.x+Math.cos(a)*L,o.y+Math.sin(a)*L)<rad(m)+8)hit(m,w,k,a,S,o);PR.push({k:'thrust',a,L,t:.16,t0:.16,c:S.c})};
   go(1);if(M.has('triple')){PR.push({k:'later',t:.09,f:()=>go(.8)});PR.push({k:'later',t:.18,f:()=>go(.8)})}
   if(M.has('wave'))PR.push({k:'bolt',x:o.x+Math.cos(a)*L0*.6,y:o.y+Math.sin(a)*L0*.6,vx:Math.cos(a)*560,vy:Math.sin(a)*560,l:.6,r:14,w,S,vis:'crescent',pierce:9,hit:new Set(),dmg:.7})},
  bolt(w,S,a,o){const M=S.M,n=M.has('fan5')?5:M.has('fan3')?3:1,sp=M.has('grav')?620:M.has('big')?560:M.has('arrow')?900:M.has('bullet')?1000:720,vis=M.has('arrow')?'arrow':M.has('bullet')?'bullet':M.has('star')?'star':M.has('crescent')?'crescent':M.has('fist')?'fist':'orb';
   for(let i=0;i<n;i++){const q=a+(n>1?(i-(n-1)/2)*(n>3?.16:.2):0);PR.push({k:'bolt',x:o.x,y:o.y,vx:Math.cos(q)*sp,vy:Math.sin(q)*sp-(M.has('grav')?140:0),l:M.has('grav')?2.2:1.5,r:M.has('big')?18:vis=='crescent'?15:10,w,S,vis,pierce:M.has('pierce')?4:vis=='crescent'?2:0,home:M.has('home'),grav:M.has('grav'),split:M.has('split'),burst:M.has('burst')?T*(M.has('big')?2:1.5):0,bounce:M.has('bounce')?2:0,hit:new Set(),dmg:1,rot:0})}},
  nova(w,S,a,o){const r=T*(S.M.has('big')?3.4:2.6);for(const m of mobs)if(live(m)&&Math.hypot(m.x-o.x,cy0(m)-o.y)<r+rad(m))hit(m,w,1,Math.atan2(cy0(m)-o.y,m.x-o.x),S,o);PR.push({k:'ring',x:o.x,y:o.y,r,t:.35,t0:.35,c:S.c});try{VFX.wave(o.x,o.y,S.c[0],r,.4,.3)}catch(_){}},
  quake(w,S,a,o){const gy=(()=>{let ty=Math.floor((P.y+P.h-4)/T);for(let i=0;i<8&&ty<H-1;i++,ty++)if(solidAt(Math.floor(P.x/T),ty))return ty*T;return P.y+P.h})();
   for(const d of S.M.has('fwd')?[P.f||1]:[-1,1])PR.push({k:'quake',x:P.x,d,sp:S.M.has('fwd')?640:540,l:.8,w,S,hit:new Set(),gy});try{VFX.wave(P.x,gy,S.c[0],140,.45,.3)}catch(_){}shake=Math.max(shake,red()?0:.14)},
  sky(w,S,a,o){const tx0=mx+cam.x,ty0=my+cam.y,dd=Math.min(T*8,Math.hypot(tx0-o.x,ty0-o.y)),tx=o.x+Math.cos(a)*dd,ty=o.y+Math.sin(a)*dd,M=S.M;
   if(M.has('rain'))for(let i=0;i<5;i++)PR.push({k:'sky',x:tx+(R()-.5)*T*3.2,y:ty+(R()-.5)*T,t:.25+i*.09,r:T*1.1,dmg:.5,w,S});
   else if(M.has('triple'))for(let i=0;i<3;i++)PR.push({k:'sky',x:tx+(i-1)*T*.9,y:ty,t:.25+i*.12,r:T*1.2,dmg:.62,w,S});
   else PR.push({k:'sky',x:tx,y:ty,t:.3,r:T*1.5,dmg:1,w,S})},
  boomer(w,S,a,o){if(PR.some(p=>p.k=='boom'&&p.w===w))return;PR.push({k:'boom',a,u:0,TT:1.05,D:T*6,Wd:-T*.9*(Math.cos(a)>=0?1:-1),hit:new Set(),w,S,x:o.x,y:o.y,rot:0})},
  chain(w,S,a,o){const tx=mx+cam.x,ty=my+cam.y;let cur=null,bd=T*9;for(const m of mobs)if(live(m)){const d=Math.hypot(m.x-tx,cy0(m)-ty);if(d<bd&&Math.hypot(m.x-o.x,cy0(m)-o.y)<T*10){bd=d;cur=m}}
   const pts=[[o.x,o.y]];if(!cur){pts.push([o.x+Math.cos(a)*T*4,o.y+Math.sin(a)*T*4]);PR.push({k:'zap',pts,t:.14,c:S.c});return}
   const n=S.M.has('long')?6:4,done=new Set();let k=1;for(let i=0;i<n&&cur;i++){done.add(cur);hit(cur,w,k,a,Object.assign({},S,{noArc:1}),o);pts.push([cur.x,cy0(cur)]);k*=.85;let nx=null,nd=T*4.2;for(const m of mobs)if(live(m)&&!done.has(m)){const d=Math.hypot(m.x-cur.x,m.y-cur.y);if(d<nd){nd=d;nx=m}}cur=nx}PR.push({k:'zap',pts,t:.18,c:S.c})},
  beam(w,S,a,o){const L=reach(o,a,T*8.5);for(const m of mobs)if(live(m)&&segDist(m.x,cy0(m),o.x,o.y,o.x+Math.cos(a)*L,o.y+Math.sin(a)*L)<rad(m)+10)hit(m,w,1,a,S,o);PR.push({k:'beam',a,L,t:.2,t0:.2,c:S.c})},
  dash(w,S,a,o){const f=P.f||1,D=T*(S.M.has('long')?4.4:3.4);let dd=0;for(let d=T*.5;d<=D;d+=T*.5){if(solidP(P.x+f*d,P.y+P.h-8)||solidP(P.x+f*d,P.y+10))break;dd=d}
   const x0=P.x,x1=P.x+f*dd;for(const m of mobs)if(live(m)&&Math.abs(cy0(m)-(P.y+P.h/2))<T*1.3&&(m.x-x0)*f>-T*.5&&(m.x-x1)*f<T*.8)hit(m,w,1,f>0?0:PI,S,o);
   PR.push({k:'trail',x0,x1,y:P.y+P.h/2,t:.25,t0:.25,c:S.c});P.x=x1;try{brace=Math.max(brace,.3)}catch(_){}},
  vortex(w,S,a,o){const tx0=mx+cam.x,ty0=my+cam.y,dd=Math.min(T*7,Math.hypot(tx0-o.x,ty0-o.y));PR.push({k:'vortex',x:o.x+Math.cos(a)*dd,y:o.y+Math.sin(a)*dd,t:1.3,t0:1.3,tick:0,r:T*2.3,w,S})},
  orbit(w,S,a,o){for(let i=PR.length-1;i>=0;i--)if(PR[i].k=='orbit')PR.splice(i,1);PR.push({k:'orbit',t:2.6,t0:2.6,n:3,w,S,cd:new Map(),ph:R()*TAU})},
  lash(w,S,a,o){PR.push({k:'lash',a,L:T*(S.M.has('long')?5:4.2),t:.32,t0:.32,hit:new Set(),w,S})}};
 function use(w){const S=SPEC[w.id],cdm=(typeof over!='undefined'&&over>0)?.5:1;wcd=w.cd*cdm/(1+bonus().atk);try{const k=w.cls,o2=CLASS7.bon(k,CLASS7.lv(k));if(o2.spd>0)wcd/=1+o2.spd}catch(_){}/* the class attack-speed perk (86-classes.js applies it in a useWeapon wrapper this one bypasses) */swing=.22;const o=pos(),a=Math.atan2(my+cam.y-o.y,mx+cam.x-o.x);P.f=Math.cos(a)>=0?1:-1;
  const s=SND[S.mv];if(s)tone(s[0],s[1],s[2],s[3],s[4]);try{FX7.weaponAnim(w.id)}catch(_){}MOVE[S.mv](w,S,a,o)}
 {const _uw=useWeapon;useWeapon=function(){const w=WPN[wp];if(w&&SPEC[w.id]&&own[w.id]){use(w);return}return _uw.apply(this,arguments)}}
 function tick(dt){if(!PR.length)return;const o=pos();
  for(let i=PR.length-1;i>=0;i--){const p=PR[i];let dead=false;
   if(p.k=='later'){p.t-=dt;if(p.t<=0){try{p.f()}catch(_){}dead=true}}
   else if(p.k=='bolt'){p.l-=dt;if(p.grav)p.vy+=900*dt;
    if(p.home){let b=null,bd=T*6;for(const m of mobs)if(live(m)&&!p.hit.has(m)){const d=Math.hypot(m.x-p.x,cy0(m)-p.y);if(d<bd){bd=d;b=m}}if(b){const sp=Math.hypot(p.vx,p.vy),ta=Math.atan2(cy0(b)-p.y,b.x-p.x),ca=Math.atan2(p.vy,p.vx);let da=ta-ca;while(da>PI)da-=TAU;while(da<-PI)da+=TAU;const na=ca+Math.max(-6*dt,Math.min(6*dt,da));p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}}
    const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;if(solidP(nx,ny)){if(p.bounce>0){p.bounce--;if(solidP(nx,p.y))p.vx*=-1;else p.vy*=-1}else{if(p.burst)boom(p);dead=true}}else{p.x=nx;p.y=ny}p.rot+=dt*14;
    if(!dead)for(const m of mobs){if(!live(m)||p.hit.has(m))continue;if(Math.hypot(m.x-p.x,cy0(m)-p.y)<rad(m)+p.r*.7){p.hit.add(m);hit(m,p.w,p.dmg,Math.atan2(p.vy,p.vx),p.S,p);
      if(p.split&&!p.child){for(const s of[-.5,.5]){const q=Math.atan2(p.vy,p.vx)+s,sp=Math.hypot(p.vx,p.vy)*.8;PR.push(Object.assign({},p,{vx:Math.cos(q)*sp,vy:Math.sin(q)*sp,l:.5,dmg:.5,split:0,child:1,hit:new Set(p.hit),burst:0}))}}
      if(p.burst){boom(p);dead=true;break}if(p.pierce>0)p.pierce--;else{dead=true;break}}}
    if(p.l<=0)dead=true}
   else if(p.k=='quake'){p.l-=dt;p.x+=p.d*p.sp*dt;if(solidP(p.x+p.d*T*.4,p.gy-T*.6))p.l=0;for(const m of mobs)if(live(m)&&!p.hit.has(m)&&Math.abs(m.x-p.x)<T*.8&&Math.abs(m.y+m.h-p.gy)<T*1.4){p.hit.add(m);hit(m,p.w,1,p.d>0?0:PI,p.S,null)}
    if(!red()&&R()<.6)spark(p.x,p.gy-4,p.S.c[0],2,120);dead=p.l<=0}
   else if(p.k=='sky'){p.t-=dt;if(p.t<=0){for(const m of mobs)if(live(m)&&Math.hypot(m.x-p.x,cy0(m)-p.y)<p.r+rad(m))hit(m,p.w,p.dmg,-PI/2,p.S,p);PR.push({k:'col',x:p.x,y:p.y,r:p.r,t:.3,t0:.3,c:p.S.c});try{VFX.wave(p.x,p.y,p.S.c[0],p.r*1.3,.35,.3)}catch(_){}spark(p.x,p.y,p.S.c[1],8,200);dead=true}}
   else if(p.k=='boom'){p.u+=dt/p.TT;if(p.u>=1)dead=true;else{if(p.u>.5&&!p.half){p.half=1;p.hit.clear()}const s=p.u,al=p.D*(1-Math.cos(TAU*s))/2,pe=p.Wd*Math.sin(TAU*s),ca=Math.cos(p.a),sa=Math.sin(p.a);p.x=o.x+ca*al-sa*pe;p.y=o.y+sa*al+ca*pe;p.rot+=dt*22;
     if(solidP(p.x,p.y)&&s<.5){p.u=1-s;p.half=1;p.hit.clear()}for(const m of mobs)if(live(m)&&!p.hit.has(m)&&Math.hypot(m.x-p.x,cy0(m)-p.y)<rad(m)+18){p.hit.add(m);hit(m,p.w,1,p.a,p.S,p)}}}
   else if(p.k=='vortex'){p.t-=dt;p.tick-=dt;for(const m of mobs)if(live(m)){const dx=p.x-m.x,dy=p.y-cy0(m),d=Math.hypot(dx,dy);if(d<p.r*1.6&&d>8){m.vx=(m.vx||0)*.9+dx*2.2*dt*10;m.vy=(m.vy||0)*.9+dy*1.4*dt*10}}
    if(p.tick<=0){p.tick=.2;for(const m of mobs)if(live(m)&&Math.hypot(m.x-p.x,cy0(m)-p.y)<p.r+rad(m))hit(m,p.w,.3,0,p.S,p)}dead=p.t<=0}
   else if(p.k=='orbit'){p.t-=dt;p.ph+=dt*7;for(let j=0;j<p.n;j++){const aa=p.ph+j*TAU/p.n,bx=o.x+Math.cos(aa)*T*1.5,by=o.y+Math.sin(aa)*T*1.1;for(const m of mobs){if(!live(m))continue;const last=p.cd.get(m)||0;if(p.t0-p.t-last<.32&&last)continue;if(Math.hypot(m.x-bx,cy0(m)-by)<rad(m)+14){p.cd.set(m,p.t0-p.t+.0001);hit(m,p.w,.45,aa,p.S,o)}}}dead=p.t<=0}
   else if(p.k=='lash'){p.t-=dt;const e=Math.sin(Math.min(1,(p.t0-p.t)/(p.t0*.55))*PI/2),Ln=p.L*e,wv=Math.sin((p.t0-p.t)*26);
    if(p.t>p.t0*.2)for(const m of mobs){if(!live(m)||p.hit.has(m))continue;for(let s=3;s<=14;s++){const u=s/14,d=Ln*u,amp=Math.max(0,1-u*.6)*T*.5*wv*(1-e*.5),px=o.x+Math.cos(p.a)*d-Math.sin(p.a)*amp,py=o.y+Math.sin(p.a)*d+Math.cos(p.a)*amp;if(Math.hypot(m.x-px,cy0(m)-py)<rad(m)+14){p.hit.add(m);hit(m,p.w,1,p.a,p.S,o);break}}}
    dead=p.t<=0}
   else{p.t-=dt;dead=p.t<=0}
   if(dead)PR.splice(i,1)}
  if(PR.length>140)PR.splice(0,PR.length-140)}
 function boom(p){for(const m of mobs)if(live(m)&&Math.hypot(m.x-p.x,cy0(m)-p.y)<p.burst+rad(m)&&!p.hit.has(m))hit(m,p.w,.7,Math.atan2(cy0(m)-p.y,m.x-p.x),p.S,p);PR.push({k:'ring',x:p.x,y:p.y,r:p.burst,t:.3,t0:.3,c:p.S.c});spark(p.x,p.y,p.S.c[1],10,220)}
 // ---- drawing (world space, after the lighting)
 const GS={};const glow=c=>GS[c]||(GS[c]=(()=>{const q=document.createElement('canvas');q.width=q.height=48;const x=q.getContext('2d'),gr=x.createRadialGradient(24,24,1,24,24,24);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.32,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,48,48);return q})());
 function draw(g2,cx,cy){if(!PR.length)return;const o=pos(),now=performance.now()/1000;g2.save();g2.lineCap='round';g2.lineJoin='round';
  for(const p of PR){const c=p.c||(p.S&&p.S.c);if(!c)continue;
   if(p.k=='arc'){const u=1-p.t/p.t0;g2.globalCompositeOperation='lighter';g2.globalAlpha=(1-u)*.9;const a0=p.a-p.arc*(.3+u*.7),a1=p.a+p.arc*(.3+u*.7);for(const[w,col]of[[16,c[0]],[6,c[1]]]){g2.strokeStyle=col;g2.lineWidth=w*(1-u*.5);g2.beginPath();g2.arc(p.x-cx,p.y-cy,p.R*.82,a0,a1);g2.stroke()}g2.globalCompositeOperation='source-over'}
   else if(p.k=='thrust'||p.k=='beam'){const u=1-p.t/p.t0,ex=o.x+Math.cos(p.a)*p.L,ey=o.y+Math.sin(p.a)*p.L;g2.globalCompositeOperation='lighter';g2.globalAlpha=1-u;for(const[w,col]of p.k=='beam'?[[18,c[0]],[8,c[1]],[3,'#fff']]:[[9,c[0]],[3,c[1]]]){g2.strokeStyle=col;g2.lineWidth=w*(1-u*.4);g2.beginPath();g2.moveTo(o.x-cx,o.y-cy);g2.lineTo(ex-cx,ey-cy);g2.stroke()}g2.globalCompositeOperation='source-over'}
   else if(p.k=='bolt'){const x=p.x-cx,y=p.y-cy,a=Math.atan2(p.vy,p.vx);g2.globalAlpha=1;g2.globalCompositeOperation='lighter';g2.drawImage(glow(c[0]),x-p.r*1.6,y-p.r*1.6,p.r*3.2,p.r*3.2);g2.globalCompositeOperation='source-over';
    g2.save();g2.translate(x,y);g2.rotate(p.vis=='star'||p.vis=='orb'?p.rot:a);g2.fillStyle=c[1];g2.strokeStyle=c[2];g2.lineWidth=1.5;
    if(p.vis=='arrow'){g2.fillRect(-14,-1.2,20,2.4);g2.beginPath();g2.moveTo(10,0);g2.lineTo(3,-4.5);g2.lineTo(3,4.5);g2.closePath();g2.fill();g2.stroke();g2.fillStyle=c[0];g2.fillRect(-15,-3,4,6)}
    else if(p.vis=='bullet'){g2.beginPath();g2.ellipse(0,0,7,3.2,0,0,TAU);g2.fill();g2.stroke()}
    else if(p.vis=='star'){g2.beginPath();for(let i=0;i<8;i++){const rr=i%2?3:9;g2.lineTo(Math.cos(i*PI/4)*rr,Math.sin(i*PI/4)*rr)}g2.closePath();g2.fill();g2.stroke()}
    else if(p.vis=='crescent'){g2.beginPath();g2.arc(-4,0,p.r,-1.2,1.2);g2.arc(-10,0,p.r*.8,1.1,-1.1,true);g2.closePath();g2.fill()}
    else if(p.vis=='fist'){g2.beginPath();g2.arc(0,0,7,0,TAU);g2.fill();g2.stroke();g2.globalAlpha=.6;g2.fillRect(-16,-4,10,8)}
    else{g2.beginPath();g2.arc(0,0,p.r*.45,0,TAU);g2.fill()}g2.restore()}
   else if(p.k=='ring'){const u=1-p.t/p.t0;g2.globalCompositeOperation='lighter';g2.globalAlpha=(1-u)*.8;g2.strokeStyle=c[0];g2.lineWidth=10*(1-u)+2;g2.beginPath();g2.arc(p.x-cx,p.y-cy,p.r*(.3+u*.75),0,TAU);g2.stroke();g2.globalCompositeOperation='source-over'}
   else if(p.k=='quake'){g2.globalCompositeOperation='lighter';g2.globalAlpha=Math.min(1,p.l*2);g2.drawImage(glow(c[0]),p.x-cx-24,p.gy-cy-34,48,40);g2.fillStyle=c[1];for(let j=0;j<3;j++){const hx=p.x-cx-p.d*j*10,h=16-j*4;g2.beginPath();g2.moveTo(hx-5,p.gy-cy);g2.lineTo(hx,p.gy-cy-h);g2.lineTo(hx+5,p.gy-cy);g2.fill()}g2.globalCompositeOperation='source-over'}
   else if(p.k=='sky'){const k=1-Math.min(1,p.t/.3);g2.globalCompositeOperation='lighter';g2.globalAlpha=.35+k*.5;g2.strokeStyle=c[0];g2.lineWidth=2;g2.setLineDash([6,6]);g2.beginPath();g2.arc(p.x-cx,p.y-cy,p.r,0,TAU);g2.stroke();g2.setLineDash([]);
    const fy=p.y-cy-(1-k)*T*6;g2.drawImage(glow(c[0]),p.x-cx-14,fy-14,28,28);g2.globalCompositeOperation='source-over'}
   else if(p.k=='col'){const u=1-p.t/p.t0;g2.globalCompositeOperation='lighter';g2.globalAlpha=1-u;const w=p.r*(.7-u*.4);const gr=g2.createLinearGradient(0,p.y-cy-T*7,0,p.y-cy);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,c[0]);g2.fillStyle=gr;g2.fillRect(p.x-cx-w/2,p.y-cy-T*7,w,T*7);g2.drawImage(glow(c[1]),p.x-cx-p.r,p.y-cy-p.r*.6,p.r*2,p.r*1.2);g2.globalCompositeOperation='source-over'}
   else if(p.k=='boom'){g2.save();g2.translate(p.x-cx,p.y-cy);g2.rotate(p.rot);g2.globalCompositeOperation='lighter';g2.drawImage(glow(c[0]),-20,-20,40,40);g2.globalCompositeOperation='source-over';try{drawWeapon(g2,p.w.id,30,0)}catch(_){}g2.restore()}
   else if(p.k=='zap'){g2.globalCompositeOperation='lighter';g2.globalAlpha=Math.min(1,p.t*8);for(const[w,col]of[[6,c[0]],[2,'#fff']]){g2.strokeStyle=col;g2.lineWidth=w;g2.beginPath();for(let j=0;j<p.pts.length;j++){const[x,y]=p.pts[j];if(!j){g2.moveTo(x-cx,y-cy);continue}const[x0,y0]=p.pts[j-1];for(let s=1;s<=4;s++){const u=s/4;g2.lineTo(x0+(x-x0)*u-cx+(s<4?(R()-.5)*12:0),y0+(y-y0)*u-cy+(s<4?(R()-.5)*12:0))}}g2.stroke()}g2.globalCompositeOperation='source-over'}
   else if(p.k=='trail'){const u=1-p.t/p.t0;g2.globalCompositeOperation='lighter';g2.globalAlpha=(1-u)*.8;g2.strokeStyle=c[0];g2.lineWidth=22*(1-u);g2.beginPath();g2.moveTo(p.x0-cx,p.y-cy);g2.lineTo(p.x1-cx,p.y-cy);g2.stroke();g2.strokeStyle=c[1];g2.lineWidth=6*(1-u);g2.stroke();g2.globalCompositeOperation='source-over'}
   else if(p.k=='vortex'){const u=1-p.t/p.t0,x=p.x-cx,y=p.y-cy;g2.globalCompositeOperation='lighter';g2.globalAlpha=Math.min(1,p.t*3)*.85;for(let j=0;j<3;j++){g2.strokeStyle=j%2?c[1]:c[0];g2.lineWidth=4-j;g2.beginPath();g2.arc(x,y,p.r*(.35+j*.25),now*6+j*2,now*6+j*2+4.2);g2.stroke()}g2.drawImage(glow(c[2]),x-18,y-18,36,36);g2.globalCompositeOperation='source-over'}
   else if(p.k=='orbit'){g2.globalAlpha=Math.min(1,p.t*3);for(let j=0;j<p.n;j++){const aa=p.ph+j*TAU/p.n,bx=o.x+Math.cos(aa)*T*1.5-cx,by=o.y+Math.sin(aa)*T*1.1-cy;g2.globalCompositeOperation='lighter';g2.drawImage(glow(c[0]),bx-16,by-16,32,32);g2.globalCompositeOperation='source-over';g2.save();g2.translate(bx,by);g2.rotate(aa*3);g2.fillStyle=c[1];g2.strokeStyle=c[2];g2.lineWidth=1.4;g2.beginPath();g2.moveTo(0,-9);g2.lineTo(3,0);g2.lineTo(0,9);g2.lineTo(-3,0);g2.closePath();g2.fill();g2.stroke();g2.restore()}}
   else if(p.k=='lash'){const e=Math.sin(Math.min(1,(p.t0-p.t)/(p.t0*.55))*PI/2),Ln=p.L*e,wv=Math.sin((p.t0-p.t)*26);g2.globalAlpha=1;for(const[w,col]of[[5,c[2]],[2.5,c[0]]]){g2.strokeStyle=col;g2.lineWidth=w;g2.beginPath();for(let s=0;s<=14;s++){const u=s/14,d=Ln*u,amp=Math.max(0,1-u*.6)*T*.5*wv*(1-e*.5);const px=o.x+Math.cos(p.a)*d-Math.sin(p.a)*amp-cx,py=o.y+Math.sin(p.a)*d+Math.cos(p.a)*amp-cy;s?g2.lineTo(px,py):g2.moveTo(px,py)}g2.stroke()}}}
  g2.restore()}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.apply(this,arguments);try{tick(dt)}catch(e){if(!ARS10.e1){ARS10.e1=1;console.error('ARS10 tick',e)}}};BOSS6.drawProj=function(g2,cx,cy){_d.apply(this,arguments);try{draw(g2,cx,cy)}catch(e){if(!ARS10.e2){ARS10.e2=1;console.error('ARS10 draw',e)}}}}
 {const _lw=loadWorld;loadWorld=function(){PR.length=0;return _lw.apply(this,arguments)}}
 // ================= art: one parametric painter per kind, cached per (weapon, scale bucket) =================
 const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const OL='#160c1c',sh=(c,k)=>AC6.shade(c,k);
 function paint(x,S,L){const c=S.c,hv=h32(S.id),v=n=>(hv>>>(n*3))%8,metal=c[3],gem=c[0],dark=c[2],lite=c[1],tier=S.r,gold=tier>=4?'#f2c14e':tier>=2?'#d8dce8':'#9a8a7a';
  x.lineJoin='round';x.lineCap='round';x.strokeStyle=OL;x.lineWidth=Math.max(1.2,L*.045);
  const lin=(x0,y0,x1,y1,a,b)=>{const gr=x.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr};
  const fillS=(path,fill)=>{x.beginPath();path();x.fillStyle=fill;x.fill();x.stroke()};
  const gemAt=(gx,gy,r)=>{x.beginPath();x.moveTo(gx,gy-r);x.lineTo(gx+r*.85,gy);x.lineTo(gx,gy+r);x.lineTo(gx-r*.85,gy);x.closePath();x.fillStyle=lin(gx-r,gy-r,gx+r,gy+r,lite,gem);x.fill();x.lineWidth=Math.max(.8,L*.025);x.stroke();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(gx-r*.25,gy-r*.3,r*.25,0,TAU);x.fill();x.lineWidth=Math.max(1.2,L*.045)};
  const grip=(x0,x1,w)=>{fillS(()=>x.rect(x0,-w/2,x1-x0,w),lin(0,-w/2,0,w/2,sh(dark,.25),dark));x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=L*.02;for(let gx=x0+L*.05;gx<x1;gx+=L*.07){x.beginPath();x.moveTo(gx,-w/2);x.lineTo(gx+L*.03,w/2);x.stroke()}x.strokeStyle=OL;x.lineWidth=Math.max(1.2,L*.045)};
  const runes=(x0,x1,y)=>{x.strokeStyle=lite;x.globalAlpha=.8;x.lineWidth=L*.025;for(let gx=x0;gx<x1;gx+=L*.13){x.beginPath();x.moveTo(gx,y-L*.025);x.lineTo(gx+L*.03,y+L*.025);x.lineTo(gx+L*.06,y-L*.025);x.stroke()}x.globalAlpha=1;x.strokeStyle=OL;x.lineWidth=Math.max(1.2,L*.045)};
  const k=S.art;
  if(k=='sword'||k=='katana'){const curved=k=='katana',bs=curved?6:v(1)%6,len=L*(S.M.has('long')?1.25:1.1),bw=L*(bs==1?.21:bs==4?.17:.14)*(curved?.85:1);grip(-L*.28,L*.06,L*.085);gemAt(-L*.32,0,L*.06);
   const blade=()=>{x.beginPath();if(curved){x.moveTo(L*.1,-bw*.4);x.quadraticCurveTo(L*.6,-bw*.9,len,-bw*1.5);x.quadraticCurveTo(L*.62,bw*.4,L*.1,bw*.5)}
    else if(bs==2){x.moveTo(L*.1,-bw/2);for(let i=1;i<=4;i++)x.quadraticCurveTo(L*.1+(len-L*.1)*(i-.5)/4,-bw*(i%2?1.2:.5),L*.1+(len-L*.1)*i/4*.92,-bw*.45);x.lineTo(len,0);x.lineTo(L*.1,bw/2)}
    else if(bs==3){x.moveTo(L*.1,-bw/2);for(let i=0;i<6;i++){const gx=L*.12+i*(len-L*.2)/6;x.lineTo(gx+L*.04,-bw*.75);x.lineTo(gx+L*.08,-bw/2)}x.lineTo(len,0);x.lineTo(L*.1,bw/2)}
    else if(bs==5){x.moveTo(L*.1,-bw/2);x.lineTo(L*.55,-bw*.9);x.lineTo(len*.88,-bw*.5);x.lineTo(len,0);x.lineTo(len*.86,bw*.6);x.lineTo(L*.5,bw*.85);x.lineTo(L*.1,bw/2)}
    else{x.moveTo(L*.1,-bw/2);x.lineTo(len-bw*1.4,-bw/2);x.lineTo(len,0);x.lineTo(len-bw*1.4,bw/2);x.lineTo(L*.1,bw/2)}x.closePath()};
   blade();x.fillStyle=lin(0,-bw,0,bw,'#ffffff',bs==5?lite:metal);x.fill();x.stroke();x.save();blade();x.clip();x.fillStyle=gem;x.globalAlpha=.35;x.fillRect(L*.1,curved?-bw*.2:-bw*.1,len,bw*.25);x.globalAlpha=1;x.restore();
   if(!curved&&tier>=2)runes(L*.25,len*.75,0);
   if(curved){fillS(()=>x.ellipse(L*.08,0,L*.05,L*.15,0,0,TAU),gold)}else{const gs=v(2)%4;if(gs==0)fillS(()=>x.rect(L*.03,-L*.2,L*.08,L*.4),gold);else if(gs==1)fillS(()=>{x.moveTo(L*.12,0);x.quadraticCurveTo(L*.02,-L*.28,-L*.06,-L*.3);x.quadraticCurveTo(L*.04,-L*.1,L*.04,0);x.quadraticCurveTo(L*.04,L*.1,-L*.06,L*.3);x.quadraticCurveTo(L*.02,L*.28,L*.12,0)},gold);else if(gs==2){fillS(()=>x.ellipse(L*.07,0,L*.1,L*.1,0,0,TAU),gold);gemAt(L*.07,0,L*.05)}else fillS(()=>{x.moveTo(L*.12,-L*.06);x.lineTo(L*.02,-L*.24);x.lineTo(L*.05,0);x.lineTo(L*.02,L*.24);x.lineTo(L*.12,L*.06)},gold)}}
  else if(k=='spear'){const len=L*(S.M.has('long')?1.55:1.42);grip(-L*.55,L*.95,L*.07);x.fillStyle=gold;x.fillRect(L*.9,-L*.06,L*.07,L*.12);const hs=v(1)%5,hx=L*.97;
   const head=()=>{x.beginPath();if(hs==1){x.moveTo(hx,0);x.lineTo(len,-L*.02);x.lineTo(len,L*.02);x.closePath();for(const s of[-1,1]){x.moveTo(hx,s*L*.04);x.quadraticCurveTo(hx+L*.12,s*L*.2,len-L*.08,s*L*.16);x.lineTo(hx+L*.12,s*L*.05);x.closePath()}}
    else if(hs==2){x.moveTo(hx,-L*.04);x.lineTo(len,0);x.lineTo(hx,L*.04);x.closePath();x.moveTo(hx+L*.02,-L*.04);x.quadraticCurveTo(hx+L*.12,-L*.34,hx+L*.26,-L*.26);x.quadraticCurveTo(hx+L*.14,-L*.14,hx+L*.16,-L*.04);x.closePath()}
    else if(hs==3){x.moveTo(hx,-L*.1);x.lineTo(len,0);x.lineTo(hx,L*.1);x.lineTo(hx+L*.06,0);x.closePath()}
    else if(hs==4){x.moveTo(hx,0);x.quadraticCurveTo(hx+L*.2,-L*.3,len,-L*.18);x.quadraticCurveTo(hx+L*.22,-L*.08,hx+L*.3,0);x.quadraticCurveTo(hx+L*.22,L*.08,len,L*.18);x.quadraticCurveTo(hx+L*.2,L*.3,hx,0)}
    else{x.moveTo(hx,0);x.quadraticCurveTo(hx+L*.18,-L*.13,len,0);x.quadraticCurveTo(hx+L*.18,L*.13,hx,0)}x.closePath()};
   head();x.fillStyle=lin(hx,-L*.2,len,L*.2,'#ffffff',metal);x.fill();x.stroke();gemAt(L*.93,0,L*.05);if(tier>=3){x.strokeStyle=gem;x.lineWidth=L*.03;x.beginPath();x.moveTo(L*.85,L*.05);x.quadraticCurveTo(L*.7,L*.25,L*.6,L*.18);x.stroke()}}
  else if(k=='bow'){const bs=v(1)%4,top=-L*.56,bot=L*.56,bx=L*.32,bend=L*(bs==1?.92:bs==2?.66:.8);
   const limb=()=>{x.beginPath();x.moveTo(bx,top);if(bs==3){x.bezierCurveTo(bx+L*.55,top+L*.2,bx+L*.15,-L*.15,bend,0);x.bezierCurveTo(bx+L*.15,L*.15,bx+L*.55,bot-L*.2,bx,bot)}else x.quadraticCurveTo(bend+L*.18,0,bx,bot)};
   limb();x.strokeStyle=OL;x.lineWidth=L*.13;x.stroke();limb();x.strokeStyle=lin(0,top,0,bot,metal,dark);x.lineWidth=L*.08;x.stroke();limb();x.strokeStyle=lite;x.lineWidth=L*.02;x.stroke();
   x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=L*.018;x.beginPath();x.moveTo(bx,top);x.lineTo(bx-L*.02,0);x.lineTo(bx,bot);x.stroke();
   for(const s of[-1,1]){x.save();x.translate(bx,s*L*.56);fillS(()=>{x.moveTo(0,0);x.lineTo(L*.1,s*L*.1);x.lineTo(-L*.04,s*L*.06)},gold);x.restore()}gemAt(bend*.86+L*.06,0,L*.07);x.lineWidth=Math.max(1.2,L*.045)}
  else if(k=='staff'||k=='wand'){const wand=k=='wand',top=L*(wand?.78:1.05);grip(wand?-L*.1:-L*.45,top-L*.08,L*(wand?.06:.075));const hs=v(1)%8,hr=L*(wand?.12:.17),hx=top+hr*.6;
   x.fillStyle=gold;x.fillRect(top-L*.1,-L*.06,L*.06,L*.12);x.strokeRect(top-L*.1,-L*.06,L*.06,L*.12);
   const orb=()=>{const gr=x.createRadialGradient(hx-hr*.3,-hr*.3,1,hx,0,hr);gr.addColorStop(0,'#fff');gr.addColorStop(.4,lite);gr.addColorStop(1,gem);x.beginPath();x.arc(hx,0,hr,0,TAU);x.fillStyle=gr;x.fill();x.stroke()};
   if(hs==0)orb();
   else if(hs==1){fillS(()=>{x.moveTo(hx-hr,0);x.lineTo(hx,-hr*1.4);x.lineTo(hx+hr*1.3,0);x.lineTo(hx,hr*1.4)},lin(hx-hr,-hr,hx+hr,hr,'#fff',gem))}
   else if(hs==2){fillS(()=>{x.arc(hx,0,hr*1.2,-2.4,2.4);x.arc(hx+hr*.5,0,hr*.9,2.2,-2.2,true)},gold);x.save();x.translate(-hr*.2,0);orb();x.restore()}
   else if(hs==3){fillS(()=>{x.moveTo(hx-hr*.8,hr*.5);x.quadraticCurveTo(hx-hr*.4,-hr*.8,hx+hr*.2,-hr*1.6);x.quadraticCurveTo(hx+hr*.3,-hr*.5,hx+hr*1.2,-hr*.6);x.quadraticCurveTo(hx+hr*.9,hr*.4,hx,hr*.8)},lin(hx,-hr*1.6,hx,hr,lite,gem))}
   else if(hs==4){for(const s of[-1,1])fillS(()=>{x.moveTo(hx-hr*.6,0);x.quadraticCurveTo(hx,s*hr*1.4,hx+hr*1.3,s*hr*.3);x.quadraticCurveTo(hx+hr*.2,s*hr*.2,hx-hr*.6,0)},lin(0,-hr,0,hr,lite,gem));gemAt(hx,0,hr*.45)}
   else if(hs==5){x.beginPath();for(let i=0;i<10;i++){const a=i*PI/5,r=i%2?hr*.5:hr*1.2;x.lineTo(hx+Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fillStyle=lin(hx-hr,-hr,hx+hr,hr,'#fff',gem);x.fill();x.stroke()}
   else if(hs==6){x.beginPath();x.arc(hx,0,hr*1.15,0,TAU);x.lineWidth=L*.06;x.strokeStyle=OL;x.stroke();x.lineWidth=L*.035;x.strokeStyle=gold;x.stroke();x.lineWidth=Math.max(1.2,L*.045);x.strokeStyle=OL;gemAt(hx,0,hr*.55)}
   else{fillS(()=>x.ellipse(hx,0,hr*1.1,hr*.75,0,0,TAU),'#fff8f0');x.beginPath();x.arc(hx,0,hr*.5,0,TAU);x.fillStyle=gem;x.fill();x.fillStyle=OL;x.beginPath();x.ellipse(hx,0,hr*.18,hr*.42,0,0,TAU);x.fill()}
   if(tier>=3)runes(top*.25,top*.75,0)}
  else if(k=='scythe'||k=='sickle'){const sick=k=='sickle',top=L*(sick?.5:1.05);grip(sick?-L*.15:-L*.45,top,L*(sick?.08:.07));const bl=L*(sick?.62:.9),bs=v(1)%3;
   const blade=()=>{x.beginPath();x.moveTo(top,-L*.03);x.bezierCurveTo(top-bl*.1,-bl*(bs==1?.95:.8),top-bl*.75,-bl*(bs==2?.55:.7),top-bl,-bl*(bs==2?.12:.3));x.bezierCurveTo(top-bl*.6,-bl*.42,top-bl*.1,-bl*.42,top+L*.05,L*.03);x.closePath()};
   blade();x.fillStyle=lin(top,-bl,top-bl,0,'#ffffff',metal);x.fill();x.stroke();x.save();blade();x.clip();x.strokeStyle=gem;x.globalAlpha=.6;x.lineWidth=L*.05;x.beginPath();x.moveTo(top-bl*.95,-bl*.3);x.bezierCurveTo(top-bl*.7,-bl*.6,top-bl*.15,-bl*.72,top,-L*.06);x.stroke();x.restore();x.lineWidth=Math.max(1.2,L*.045);
   gemAt(top,0,L*.07);if(!sick&&tier>=2)fillS(()=>{x.moveTo(top+L*.02,L*.02);x.lineTo(top+L*.14,L*.12);x.lineTo(top+L*.03,L*.1)},gold)}
  else if(k=='hammer'||k=='maul'||k=='axe'){const big=k!='hammer',top=L*(big?1:.9);grip(-L*.3,top,L*(big?.085:.075));const hs=v(1)%4;
   if(k=='axe'){const dbl=hs%2==0,ax=top-L*.05;for(const s of dbl?[-1,1]:[-1])fillS(()=>{x.moveTo(ax-L*.06,s*L*.04);x.quadraticCurveTo(ax-L*.05,s*L*.36,ax-L*.22,s*L*.48);x.quadraticCurveTo(ax+L*.12,s*L*.42,ax+L*.2,s*L*.36);x.quadraticCurveTo(ax+L*.1,s*L*.2,ax+L*.08,s*L*.04)},lin(ax,0,ax,s*L*.48,metal,'#ffffff'));
    if(!dbl)fillS(()=>{x.moveTo(ax,L*.04);x.lineTo(ax+L*.05,L*.24);x.lineTo(ax+L*.1,L*.04)},gold);gemAt(ax+L*.01,0,L*.07)}
   else{const hw=L*(big?.34:.26),hh=L*(big?.5:.4),hx=top-hw*.5;
    if(hs==1)fillS(()=>x.ellipse(hx+hw*.5,0,hw*.6,hh*.55,0,0,TAU),lin(0,-hh,0,hh,'#fff',metal));
    else if(hs==2){fillS(()=>x.rect(hx,-hh/2,hw,hh),lin(0,-hh/2,0,hh/2,'#fff',metal));for(const s of[-1,1])fillS(()=>{x.moveTo(hx+hw*.2,s*hh/2);x.lineTo(hx+hw*.5,s*hh*.85);x.lineTo(hx+hw*.8,s*hh/2)},gold)}
    else if(hs==3){fillS(()=>x.rect(hx,-hh/2,hw,hh),lin(0,-hh/2,0,hh/2,'#fff',metal));for(const s of[-1,1])fillS(()=>{x.moveTo(hx+hw*.5,s*hh/2);x.quadraticCurveTo(hx+hw*1.3,s*hh*.9,hx+hw*1.6,s*hh*.4);x.quadraticCurveTo(hx+hw,s*hh*.45,hx+hw,s*hh*.2)},lin(0,0,0,s*hh,lite,gem))}
    else fillS(()=>x.rect(hx,-hh/2,hw,hh),lin(0,-hh/2,0,hh/2,'#fff',metal));
    x.fillStyle=gold;x.fillRect(hx-L*.02,-hh*.52,L*.04,hh*1.04);x.fillRect(hx+hw-L*.02,-hh*.52,L*.04,hh*1.04);gemAt(hx+hw*.5,0,L*.08);if(tier>=3)runes(hx+hw*.15,hx+hw*.9,hh*.3)}}
  else if(k=='glaive'){grip(-L*.18,L*.18,L*.08);for(const s of[-1,1])fillS(()=>{x.moveTo(s*L*.18,-L*.06);x.quadraticCurveTo(s*L*.55,-L*.22,s*L*.85,-L*.04);x.quadraticCurveTo(s*L*.55,L*.08,s*L*.18,L*.06)},lin(0,-L*.2,0,L*.1,'#ffffff',metal));gemAt(0,0,L*.08)}
  else if(k=='knuckle'){const kx=L*.2,kr=L*.24;fillS(()=>{x.moveTo(kx-kr,-kr*.8);x.quadraticCurveTo(kx+kr*1.2,-kr*1.2,kx+kr*1.2,0);x.quadraticCurveTo(kx+kr*1.2,kr*1.2,kx-kr,kr*.8);x.closePath()},lin(0,-kr,0,kr,'#ffffff',metal));
   const sp=v(1)%3;for(let i=0;i<3;i++){const yy=(i-1)*kr*.55;if(sp==0)fillS(()=>{x.moveTo(kx+kr*1.05,yy-kr*.15);x.lineTo(kx+kr*1.6,yy);x.lineTo(kx+kr*1.05,yy+kr*.15)},gold);else if(sp==1)fillS(()=>x.arc(kx+kr*1.15,yy,kr*.2,0,TAU),gold);else fillS(()=>{x.moveTo(kx+kr,yy-kr*.12);x.quadraticCurveTo(kx+kr*1.7,yy-kr*.4,kx+kr*1.9,yy+kr*.05);x.quadraticCurveTo(kx+kr*1.4,yy,kx+kr,yy+kr*.12)},lite)}
   fillS(()=>x.rect(kx-kr*1.3,-kr*.6,kr*.45,kr*1.2),dark);gemAt(kx+kr*.2,0,kr*.35)}
  else if(k=='shuriken'){const n=4+v(1)%4,r=L*.34;x.beginPath();for(let i=0;i<n*2;i++){const a=i*PI/n,rr=i%2?r*.38:r;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fillStyle=lin(-r,-r,r,r,'#ffffff',metal);x.fill();x.stroke();x.beginPath();x.arc(0,0,r*.2,0,TAU);x.fillStyle=gem;x.fill();x.stroke()}
  else if(k=='chakram'){const r=L*.34;x.beginPath();x.arc(0,0,r,0,TAU);x.arc(0,0,r*.68,0,TAU,true);x.fillStyle=lin(-r,-r,r,r,'#ffffff',metal);x.fill('evenodd');x.stroke();const nb=3+v(1)%4;for(let i=0;i<nb;i++){const a=i*TAU/nb;x.save();x.rotate(a);fillS(()=>{x.moveTo(r*.95,-r*.12);x.quadraticCurveTo(r*1.35,-r*.1,r*1.3,r*.25);x.lineTo(r*.95,r*.12)},lite);x.restore()}gemAt(r*.84,0,r*.12)}
  else if(k=='flail'){grip(-L*.1,L*.32,L*.08);x.fillStyle=gold;x.fillRect(L*.3,-L*.06,L*.05,L*.12)}
  else if(k=='whip'){grip(-L*.12,L*.28,L*.08);gemAt(-L*.16,0,L*.06)}
  else if(k=='gun'){const gs=v(1)%4,len=L*(gs==1?1.25:gs==3?1.05:.85),bh=L*(gs==3?.22:.15);
   fillS(()=>{x.moveTo(-L*.12,bh*.5);x.lineTo(L*.02,L*.4);x.lineTo(L*.18,L*.38);x.lineTo(L*.12,bh*.5)},dark);
   fillS(()=>{x.moveTo(-L*.2,-bh*.6);x.lineTo(len*.72,-bh*.6);x.lineTo(len*.72,bh*.5);x.lineTo(-L*.2,bh*.5)},lin(0,-bh,0,bh,'#ffffff',metal));
   fillS(()=>x.rect(len*.6,-bh*.32,len*.42,bh*.55),lin(0,-bh*.4,0,bh*.4,lite,metal));if(gs==2)for(let i=0;i<3;i++)fillS(()=>x.arc(len*.25+i*L*.12,-bh*.6,L*.035,PI,0),gem);
   if(gs==1)fillS(()=>x.rect(L*.12,-bh*1.25,L*.34,bh*.5),dark);if(gs==3)fillS(()=>x.arc(len*1.02,-bh*.05,bh*.42,0,TAU),lin(0,-bh,0,bh,lite,gem));
   x.strokeStyle=gem;x.lineWidth=L*.035;x.beginPath();x.moveTo(-L*.12,-bh*.1);x.lineTo(len*.6,-bh*.1);x.stroke();x.lineWidth=Math.max(1.2,L*.045);x.strokeStyle=OL;gemAt(L*.06,-bh*.05,L*.06)}}
 const CA=new Map(),BK=[1,1.5,2,3,4,6,8];
 function cached(id,L,s){const b=BK.find(q=>q>=s*.97)||8,key=id+'|'+L+'|'+b;let e=CA.get(key);if(e)return e;const S=SPEC[id],pad=L*.85,w=L*2.9,hgt=L*1.8,c=document.createElement('canvas');
  c.width=Math.ceil(w*b);c.height=Math.ceil(hgt*b);const x=c.getContext('2d');x.scale(b,b);x.translate(pad,hgt/2);try{paint(x,S,L)}catch(err){console.error('ARS10 art',err)}e={c,x:-pad,y:-hgt/2,w,h:hgt};if(CA.size>500)CA.clear();CA.set(key,e);return e}
 const SPIN={shuriken:1,chakram:1};
 {const _dw=drawWeapon;drawWeapon=function(x,id,L,t){const S=SPEC[id];if(!S)return _dw.apply(this,arguments);let s=2;try{const m=x.getTransform();s=Math.hypot(m.a,m.b)||2}catch(_){}
  const e=cached(id,Math.round(L),s),tt=t||0;x.save();try{
   if(SPIN[S.art]){x.translate(L*.35,0);x.rotate(tt*7);x.translate(-L*.35,0);x.drawImage(e.c,e.x,e.y,e.w,e.h);x.restore();x.save();x.translate(0,0)}else x.drawImage(e.c,e.x,e.y,e.w,e.h);
   // live parts: flail ball, whip cord, and a soft element glow + sparkle on rare weapons
   if(S.art=='flail'){const a=Math.sin(tt*3)*.5,cxp=L*.35+Math.cos(a)*L*.55,cyp=Math.sin(a)*L*.55;x.strokeStyle='#8a8f9a';x.lineWidth=Math.max(1,L*.04);x.setLineDash([L*.05,L*.04]);x.beginPath();x.moveTo(L*.35,0);x.lineTo(cxp,cyp);x.stroke();x.setLineDash([]);
    x.fillStyle=S.c[3];x.strokeStyle=OL;x.lineWidth=Math.max(1,L*.04);x.beginPath();x.arc(cxp,cyp,L*.17,0,TAU);x.fill();x.stroke();x.fillStyle=S.c[0];for(let i=0;i<6;i++){const q=i*TAU/6;x.beginPath();x.moveTo(cxp+Math.cos(q)*L*.15,cyp+Math.sin(q)*L*.15);x.lineTo(cxp+Math.cos(q)*L*.27,cyp+Math.sin(q)*L*.27);x.lineTo(cxp+Math.cos(q+.3)*L*.15,cyp+Math.sin(q+.3)*L*.15);x.fill()}}
   if(S.art=='whip'){x.strokeStyle=S.c[2];x.lineWidth=Math.max(1.5,L*.07);x.beginPath();x.moveTo(L*.28,0);x.bezierCurveTo(L*.55,-L*.25+Math.sin(tt*3)*L*.06,L*.75,L*.25,L*1.05,-L*.05);x.stroke();x.strokeStyle=S.c[0];x.lineWidth=Math.max(1,L*.03);x.stroke();
    x.fillStyle=S.c[1];for(let i=1;i<5;i++){const u=i/5;x.beginPath();x.arc(L*.28+u*L*.75,Math.sin(u*5+tt*3)*L*.08,L*.03,0,TAU);x.fill()}}
   if(S.r>=2&&tt){x.globalCompositeOperation='lighter';const gl=glow(S.c[0]),pulse=.25+.15*Math.sin(tt*3+S.lv),gx=S.art=='bow'?L*.7:S.art=='knuckle'?L*.25:S.art=='gun'?L*.9:SPIN[S.art]?L*.35:L*.95;x.globalAlpha=pulse*(S.r>=4?1.3:1);x.drawImage(gl,gx-L*.3,-L*.3,L*.6,L*.6);
    if(S.r>=4){const u=(tt*.7+S.lv*.13)%1;x.globalAlpha=Math.sin(u*PI);x.drawImage(gl,L*(.2+u*.8)-L*.06,-L*.06-Math.sin(u*9)*L*.05,L*.12,L*.12)}x.globalCompositeOperation='source-over'}
  }finally{x.restore()}}}
 return{SPEC,IDS,BYC,LIST,EL,MOVE,AK,AM,get pool(){return PR.length},paint,cached}})();
