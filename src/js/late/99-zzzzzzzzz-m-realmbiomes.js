// ===== The realms' biomes (BIOME17.addStage): every realm works like the first world, with one biome per letter of its word: the Inferno has 3, the
// Galaxy 4, the Abyssal Sea 5 and the Crystal Realm 8. Each biome has its own blocks, ore, two monsters, beacons and a trial; finishing the trial frees
// that biome's letter and wakes its Letter Warden. Block ids are nearly used up (tiles are one byte), so these biomes are new combinations of existing
// blocks. A row: id, name, colour, light colour, motes, shape of its caves (fx), rock, soil, accent, ore, ore name, beacon [one, many, verb, art], monsters. =====
(()=>{
 const B=(id,n,c,l,m,fx,rock,soil,acc,ore,on,bea,mob,mat)=>({id,n,c,l,m,fx,rock,soil,acc,ore,tl:{[ore]:[on]},bea,mob,mat});
 // a monster: key, shape, name, colour, movement, health, damage, gems, width, height, extras (tr: its trim)
 const M=(k,look,n,c,ai,hp,dmg,gem,w,h,x)=>[k,look,n,c,ai,hp,dmg,gem,w,h,x||{}];
 BIOME17.addStage(1,[
  B('ashfall','Ashen Wastes','#c8a89a','#fff0e6','embers','ember',99,19,226,227,'Emberglass Ore',['Ash Brazier','Ash Braziers','Rekindle','brazier'],
   [M('inf_b_ashling','slime','Ashling','#8a7a76','hop',80,12,14,40,32,{jp:620,sx:210,tr:'spikes'}),M('inf_b_cinderbat','moth','Cinder Bat','#c86a3a','fly',64,11,14,34,28,{spm:1.4,tr:'flames'})],208),
  B('vents','Basalt Vents','#ff9a4a','#ffe6c8','embers','crystal',78,99,54,62,'Magma Vein',['Vent Obelisk','Vent Obelisks','Awaken','obelisk'],
   [M('inf_b_ventcrab','crab','Vent Crab','#a84a2a','walk',110,14,16,44,30,{spm:1.1,tr:'flames'}),M('inf_b_smoke','wraith','Smoke Wraith','#6a5a5e','fly',90,13,16,34,44,{ph:1,spm:.9,tr:'orbit'})],208),
  B('core','Molten Core','#ff5a2a','#ffd8b0','embers','ember',225,226,79,73,'Ruby Ore',['Magma Totem','Magma Totems','Light','totem'],
   [M('inf_b_coregolem','golem','Core Golem','#c84a1e','walk',170,18,22,48,56,{spm:.7,tr:'flames'}),M('inf_b_flamelet','moth','Flamelet','#ffb04a','fly',80,14,18,30,26,{spm:1.6,tr:'flames'})],208)]);
 BIOME17.addStage(2,[
  B('nebula','Nebula Caves','#b48cff','#f0e4ff','glint','moss',229,229,67,233,'Comet Ore',['Nebula Lantern','Nebula Lanterns','Rekindle','lantern'],
   [M('gal_b_mote','slime','Star Mote','#a890ff','hop',140,15,20,38,30,{jp:760,sx:230,tr:'orbit'}),M('gal_b_drifter','wraith','Nebula Drifter','#c8a8ff','fly',130,15,20,34,44,{ph:1,spm:1,tr:'orbit'})],231),
  B('vault','Starfall Vault','#ffe9a8','#fffbe6','glint','crystal',68,68,232,60,'Moonstone Ore',['Star Prism','Star Prisms','Tune','prism'],
   [M('gal_b_shardling','crab','Star Shardling','#ffe08a','walk',170,17,22,42,28,{spm:1.3,tr:'spikes'}),M('gal_b_glim','moth','Glim','#fff0b0','fly',120,15,20,30,26,{spm:1.7,tr:'orbit'})],231),
  B('hollow','Void Hollow','#6a4ad8','#d8ccff','glint','crystal',66,66,65,74,'Sapphire Ore',['Void Totem','Void Totems','Wake','totem'],
   [M('gal_b_voidling','slime','Voidling','#3a2a7a','hop',190,18,24,42,34,{jp:700,sx:220,tr:'spikes'}),M('gal_b_gazer','wraith','Void Gazer','#5a3ac8','fly',170,18,24,36,46,{spm:.9,tr:'orbit'})],231),
  B('ruins','Astral Ruins','#8ad8ff','#e6f8ff','dust','dune',12,68,45,10,'Gold',['Sky Obelisk','Sky Obelisks','Raise','obelisk'],
   [M('gal_b_sentinel','golem','Astral Sentinel','#9ac8e8','walk',260,22,30,48,56,{spm:.7,tr:'spikes'}),M('gal_b_wisp','moth','Ruin Wisp','#c8ecff','fly',140,17,24,30,26,{spm:1.5,tr:'orbit'})],231)]);
 BIOME17.addStage(3,[
  B('gardens','Coral Gardens','#ff8aa8','#ffe6ee','bubbles','reef',222,222,223,224,'Pearl Ore',['Tide Shell','Tide Shells','Wake','shell'],
   [M('sea_b_crab','crab','Garden Crab','#ff7a8a','walk',170,16,24,44,28,{spm:1.1,tr:'spikes'}),M('sea_b_puff','slime','Puffer Blob','#ffc08a','hop',150,16,24,40,32,{jp:640,sx:200,tr:'bubbles'})],224),
  B('grottos','Pearl Grottos','#4fe0d0','#d8fff8','bubbles','reef',55,55,59,75,'Emerald Ore',['Pearl Shell','Pearl Shells','Wake','shell'],
   [M('sea_b_eel','wraith','Grotto Eel','#3ac8b0','fly',170,17,26,34,44,{ph:1,spm:1.2,tr:'bubbles'}),M('sea_b_snail','slime','Pearl Snail','#e8f4e0','hop',200,17,26,42,34,{jp:520,sx:150,tr:'spikes'})],224),
  B('kelphollow','Kelp Hollow','#5fd47a','#d4ffb8','spores','moss',57,42,42,212,'Verdant Ore',['Kelp Totem','Kelp Totems','Light','totem'],
   [M('sea_b_lurker','crab','Kelp Lurker','#4a9a5a','walk',210,18,28,44,30,{spm:1.2,tr:'spikes'}),M('sea_b_frond','moth','Drift Frond','#8fdc7a','fly',150,16,26,32,28,{spm:1.3,tr:'bubbles'})],224),
  B('city','Sunken City','#ffc45a','#fff0c8','bubbles','dune',45,8,12,218,'Sunstone Ore',['Drowned Obelisk','Drowned Obelisks','Raise','obelisk'],
   [M('sea_b_guard','golem','Drowned Guard','#b8985a','walk',320,24,34,48,56,{spm:.65,tr:'spikes'}),M('sea_b_ghost','wraith','Sailor Ghost','#c8e8e0','fly',190,19,28,34,44,{ph:1,spm:.9,tr:'bubbles'})],224),
  B('midnight','Midnight Trench','#2a6ad8','#cce0ff','bubbles','reef',235,235,236,237,'Tidal Ore',['Abyss Lantern','Abyss Lanterns','Rekindle','lantern'],
   [M('sea_b_fang','wraith','Trench Fang','#1a4aa8','fly',260,24,34,36,46,{spm:1.1,tr:'spikes'}),M('sea_b_glow','moth','Lantern Fish','#7ae8ff','fly',190,20,30,32,28,{spm:1.5,tr:'bubbles'})],224)]);
 BIOME17.addStage(4,[
  B('amethyst','Amethyst Hollows','#b48cff','#f0e4ff','glint','crystal',219,219,220,221,'Prism Ore',['Resonant Prism','Resonant Prisms','Tune','prism'],
   [M('cry_b_golem','golem','Amethyst Golem','#a07ad8','walk',340,26,36,46,54,{spm:.7,tr:'spikes'}),M('cry_b_sprite','moth','Amethyst Sprite','#e0c8ff','fly',190,20,30,30,26,{spm:1.6,tr:'orbit'})],221),
  B('frostprism','Frost Prism Depths','#7ad8ff','#e6f8ff','snow','frost',213,213,214,215,'Frostcore Ore',['Frost Lantern','Frost Lanterns','Rekindle','lantern'],
   [M('cry_b_frost','slime','Prism Slime','#9ae4ff','hop',230,21,32,40,32,{jp:640,sx:200,tr:'spikes'}),M('cry_b_ice','wraith','Ice Shade','#d8f4ff','fly',230,22,32,32,42,{spm:1.1,tr:'orbit'})],221),
  B('radiant','Radiant Caverns','#fff0a8','#fffbe6','glint','crystal',239,238,253,254,'Aurora Ore',['Aurora Prism','Aurora Prisms','Tune','prism'],
   [M('cry_b_lumen','crab','Lumen Crab','#ffe68a','walk',260,23,34,42,28,{spm:1.4,tr:'spikes'}),M('cry_b_ray','moth','Ray Sprite','#fff6c8','fly',210,21,32,30,26,{spm:1.8,tr:'orbit'})],221),
  B('quartz','Quartz Halls','#e8e8f8','#ffffff','glint','dune',12,8,9,76,'Diamond Ore',['Quartz Obelisk','Quartz Obelisks','Raise','obelisk'],
   [M('cry_b_warden','golem','Quartz Warden','#d8d8ec','walk',400,28,40,48,56,{spm:.65,tr:'spikes'}),M('cry_b_echo','wraith','Hall Echo','#f0f0ff','fly',240,23,34,34,44,{ph:1,spm:1,tr:'orbit'})],221),
  B('verdant','Emerald Vault','#3ae88a','#d8ffe8','spores','moss',57,42,42,75,'Emerald Ore',['Emerald Totem','Emerald Totems','Light','totem'],
   [M('cry_b_vine','crab','Vine Crawler','#3aa86a','walk',280,24,36,44,30,{spm:1.3,tr:'spikes'}),M('cry_b_seed','slime','Gem Seed','#7aff9a','hop',250,23,34,38,30,{jp:700,sx:220,tr:'orbit'})],221),
  B('rubyforge','Ruby Forge','#ff4a6a','#ffd8e0','embers','ember',225,226,62,73,'Ruby Ore',['Forge Brazier','Forge Braziers','Rekindle','brazier'],
   [M('cry_b_smith','golem','Ruby Smith','#c82a4a','walk',440,30,42,48,56,{spm:.7,tr:'flames'}),M('cry_b_spark','moth','Forge Spark','#ff8a9a','fly',240,24,36,30,26,{spm:1.7,tr:'flames'})],221),
  B('sapphire','Sapphire Deep','#4a8aff','#d8e6ff','bubbles','reef',66,66,94,74,'Sapphire Ore',['Deep Shell','Deep Shells','Wake','shell'],
   [M('cry_b_deepling','crab','Deepling','#2a5ac8','walk',320,26,38,44,30,{spm:1.2,tr:'spikes'}),M('cry_b_mist','wraith','Blue Mist','#8ab8ff','fly',280,25,38,34,44,{ph:1,spm:1,tr:'orbit'})],221),
  B('sanctum','Golden Sanctum','#ffd24a','#fff6c8','dust','dune',68,8,58,10,'Gold',['Sun Obelisk','Sun Obelisks','Raise','obelisk'],
   [M('cry_b_paladin','golem','Gilded Paladin','#e8b83a','walk',520,34,50,50,58,{spm:.65,tr:'spikes'}),M('cry_b_halo','moth','Lumen','#fff0a0','fly',300,28,44,32,28,{spm:1.5,tr:'orbit'})],221)]);
})();
