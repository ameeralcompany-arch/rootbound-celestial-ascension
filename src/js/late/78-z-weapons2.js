// ===== WFX8 data: eight shop weapons (behaviour lives in 85-zz-weapons2.js, which needs the boss module loaded first) =====
const WFX8NEW=(()=>{
 const NEW={
  skyspear:{n:'Skyspear',g:[190,230,255],bd:3,md:15,cd:.42,k:'spear',cost:600,fx:'',d:'A long thrust that pierces everything in a straight line. Reaches far.'},
  thornlash:{n:'Thornlash',g:[110,230,130],bd:1,md:12,cd:.46,k:'whip',cost:900,fx:'slow',d:'A living whip. It cracks along its whole length and drags enemies toward you.'},
  moonchakram:{n:'Moon Chakram',g:[200,190,255],bd:1,md:14,cd:.65,k:'chakram',cost:1100,fx:'',d:'Thrown in a wide curve and returns to your hand, cutting on both passes.'},
  zephyrbow:{n:'Zephyr Bow',g:[160,255,210],bd:1,md:16,cd:.5,k:'bow',cost:800,fx:'',d:'Fires arrows that fall in an arc and stick into walls.'},
  stormflail:{n:'Stormflail',g:[255,230,110],bd:2,md:20,cd:1.3,k:'flail',cost:1500,fx:'stun',d:'A spiked ball on a chain with real momentum. It whirls around you, then snaps back.'},
  gravitystaff:{n:'Graviton Rod',g:[190,120,255],bd:1,md:22,cd:.95,k:'staff',cost:1800,fx:'',d:'Launches a heavy orb that bounces off walls and bursts on contact.'},
  galeshuriken:{n:'Gale Shurikens',g:[150,240,255],bd:1,md:10,cd:.55,k:'shuriken',cost:700,fx:'',d:'Three seeking stars that ricochet once off walls.'},
  titanmaul:{n:'Titan Maul',g:[255,150,70],bd:5,md:34,cd:1.05,k:'maul',cost:2400,fx:'',d:'Slams the ground and sends a shockwave racing along the terrain both ways.'}};
 for(const id in NEW){WPN[id]=NEW[id];WPN[id].id=id}
 return NEW
})();
