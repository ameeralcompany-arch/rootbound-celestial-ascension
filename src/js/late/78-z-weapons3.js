// ===== WFX9 data: wands and bows (behaviour in 85-zz-weapons3.js) =====
const WFX9NEW=(()=>{
 const NEW={
  starwand:{n:'Star Wand',g:[255,226,120],bd:1,md:13,cd:.5,k:'wand',cost:900,fx:'',d:'Fires a fan of three star bolts that burst into sparkles on impact.'},
  frostwand:{n:'Frost Wand',g:[150,225,255],bd:1,md:17,cd:.85,k:'wand',cost:1400,fx:'slow',d:'Ice crystals erupt from the ground in a line toward your cursor, then shatter in a snowflake ring.'},
  voidwand:{n:'Void Wand',g:[190,80,255],bd:1,md:9,cd:1.6,k:'wand',cost:2200,fx:'',d:'Launches an orb that collapses into a small black hole. It drags enemies in and crackles with violet lightning.'},
  tendrilwand:{n:'Crimson Tendril Wand',g:[230,40,70],bd:1,md:18,cd:.6,k:'wand',cost:1700,fx:'',d:'Three living tendrils lash out in a red slash and hit everything in front of you.'},
  chainwand:{n:'Spectral Chains',g:[170,120,255],bd:1,md:14,cd:1.2,k:'wand',cost:2000,fx:'',d:'Ghostly chains burst from the ground around you and drag enemies in close.'},
  crowbow:{n:'Murder Bow',g:[150,90,220],bd:1,md:15,cd:.9,k:'bow',cost:1900,fx:'',d:'Looses a flock of spectral crows that weave toward enemies and pierce them.'},
  icebow:{n:'Glacier Bow',g:[170,235,255],bd:1,md:18,cd:.7,k:'bow',cost:1500,fx:'slow',d:'A frozen arrow that shatters into ice shards when it lands.'}};
 for(const id in NEW){WPN[id]=NEW[id];WPN[id].id=id}
 return NEW
})();
