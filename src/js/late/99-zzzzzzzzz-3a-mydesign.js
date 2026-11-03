// ===== MYD: the shape of each class's Mythic, drawn once by COSM into a picture. Design length about 100 with the grip at the origin and the weapon along +x; a blade's cutting side is -y
// (the swing code flips it to lead). H (made in 99-zzzzzzzzz-3b-cosmic.js) paints: blade() fills a shape with its class nebula and a white-hot edge, metal() silver filigree, dark() the
// midnight parts, line() light drawn on top, orb() a small world, star() a glint, flower() petals, crescent() a moon. st is the stage (1 Awakened, 2 Ascended, 3 Transcendent). =====
const MYD={
 // Reaper: a long crescent cut from the night sky, a galaxy at its heart, worlds spiralling up the shaft
 reaper(H,st){H.dark('M-36 -2.2 L92 -2.6 L92 2.6 L-36 2.2 Z');H.vine(-32,88,2.4,5);H.metal('M-36 -3.4 L-52 0 L-36 3.4 L-33 0 Z');H.metal('M-33 -5 L-27 -2 L-27 2 L-33 5 L-30 0 Z');H.orb(-40,0,2.6,st>=2);
   H.blade('M84 4 C112 -4 118 -52 16 -84 C70 -60 82 -30 76 -7 C74 -2 78 3 84 4 Z',[80,0,30,-80]);H.line('M80 -2 C96 -22 74 -56 26 -78',.6,'#ffffff',.85);
   H.metal('M76 -9 L88 -19 L84 -7 L99 -11 L91 -1 L104 3 L90 5 L95 16 L83 8 L80 14 L76 6 L68 7 L73 0 L68 -5 Z');H.orb(84,-1,5.6,true,1);
   if(st>=2){H.charm(58,-30,14);H.charm(44,-42,20);for(const[x,r]of[[56,2.4],[30,1.9]])H.orb(x,x%3-1,r)}if(st>=3){H.charm(66,-22,9);for(const[x,r]of[[10,1.6],[-14,1.5],[70,1.6]])H.orb(x,x%2,r);H.star(-52,0,5)}},
 // Mage: a staff crowned with a crescent moon of faceted light, carried on silver filigree
 mage(H,st){H.dark('M-44 -1.5 L70 -1.5 L70 1.5 L-44 1.5 Z');H.line('M-40 0 L66 0',.7,'#ffffff',.75);H.metal('M-44 -5 Q-50 -2 -58 0 Q-50 2 -44 5 Q-46 2 -42 0 Q-46 -2 -44 -5 Z');H.metal('M-36 -3 L-31 -6 L-27 0 L-31 6 L-36 3 L-33 0 Z');H.metal('M18 -3 L24 -2 L24 2 L18 3 Z');
   H.metal('M58 -2 Q66 -9 62 -13 Q72 -11 72 -3 L78 -4 Q76 -14 84 -18 Q84 -10 88 -6 L84 0 L88 6 Q84 10 84 18 Q76 14 78 4 L72 3 Q72 11 62 13 Q66 9 58 2 Z');H.gem(74,0,2.8);
   H.crescent(106,0,22,0,1);H.line('M94 -13 L104 -5 M88 -2 L100 2 M95 13 L104 6',.45,'#ffffff',.8);H.star(120,-16,st>=2?6:4);if(st>=2)H.star(120,16,3.4);if(st>=3)H.orb(110,0,3.4,true,1)},
 // Samurai: one slender curved cut, a lily of light where the guard should be, a silk tassel falling from the hilt
 samurai(H,st){H.dark('M-27 -2.4 L-3 -2.4 L-3 2.4 L-27 2.4 Z');H.wrap(-26,-4,2.4);H.metal('M-30 -3 L-26 -3 L-26 3 L-30 3 Z');H.tassel(-28,2,20,st);
   H.blade('M1 -2.8 Q56 -9 114 -17 Q108 -9 100 -6.4 Q52 2 1 2.8 Z',[0,3,110,-14]);H.line('M6 -.2 Q30 -3 34 -2 T58 -4 T80 -7 T98 -8',.5,'#ffffff',.8);H.line('M1 -2.8 Q56 -9 114 -17',.55,'#ffffff',1);
   H.flower(-1,0,st>=3?13:11,7);H.gem(-1,0,1.9);if(st>=3)H.star(114,-17,6)},
 // Knight: a cathedral blade with a line of light down its fuller and a winged guard
 knight(H,st){H.metal('M-24 -3 L-30 0 L-24 3 L-21 0 Z');H.dark('M-21 -2.8 L-2 -2.8 L-2 2.8 L-21 2.8 Z');H.wrap(-20,-3,2.8);
   H.blade('M5 -8 L92 -6 L116 0 L92 6 L5 8 Z',[5,-8,5,8]);H.line('M12 0 L104 0',1.5,'#ffffff',.9);H.line('M5 -8 L92 -6 L116 0 L92 6 L5 8',.5,'#ffffff',1);
   H.metal('M3 -4 L-3 -14 L0 -30 L8 -20 L14 -32 L14 -14 L8 -5 L8 5 L14 14 L14 32 L8 20 L0 30 L-3 14 L3 4 Z');H.flower(5,0,8,6);H.gem(5,0,2.2);if(st>=2)for(const q of[-1,1])H.line('M14 '+q*9+' Q34 '+q*16+' 52 '+q*9,.5,'#ffffff',.7);if(st>=3){H.star(116,0,6);H.star(58,0,4)}},
 // Demon: a blade that burns upward in tongues of crimson, horned at the hilt
 demon(H,st){H.metal('M-26 -3 L-31 0 L-26 3 Z');H.dark('M-24 -2.8 L-2 -2.8 L-2 2.8 L-24 2.8 Z');H.wrap(-22,-4,2.8);
   H.blade('M4 6 C30 8 44 7 66 6 C82 5 96 3 112 -8 C104 -5 100 -8 98 -13 C94 -8 88 -7 84 -11 C82 -16 84 -20 80 -24 C78 -14 72 -10 66 -12 C62 -15 62 -20 58 -22 C58 -14 52 -8 44 -9 C40 -11 40 -15 36 -17 C36 -10 30 -6 22 -7 C14 -8 8 -6 4 -6 Z',[6,6,110,-20]);H.line('M8 2 C36 2 66 2 106 -6',.6,'#ffe6e6',.9);
   H.metal('M4 -5 Q-4 -18 8 -28 Q2 -16 12 -8 L8 -4 L8 4 L12 8 Q2 16 8 28 Q-4 18 4 5 Z');H.gem(4,0,3.1);if(st>=2)H.star(112,-8,5);if(st>=3){H.line('M4 6 C30 8 66 6 112 -8',.5,'#ffffff',1)}},
 // Archer: a recurve of starlight; the tips hold two stars and the string is drawn by the hand (see BOW15)
 archer(H,st){const L='M-1 -7 C10 -22 2 -44 15 -62 C18 -66 26 -68 28 -72 C30 -64 25 -56 20 -52 C12 -40 18 -22 5 -5 Z';H.blade(L,[0,-6,26,-68]);H.blade('M-1 7 C10 22 2 44 15 62 C18 66 26 68 28 72 C30 64 25 56 20 52 C12 40 18 22 5 5 Z',[0,6,26,68]);
   H.line('M2 -8 C12 -24 6 -44 18 -60 M2 8 C12 24 6 44 18 60',.5,'#ffffff',.9);H.metal('M-4 -9 L5 -9 L8 -3 L8 3 L5 9 L-4 9 L-6 4 L-6 -4 Z');H.flower(1,0,6,5);H.orb(1,0,2.4,false,1);H.star(28,-72,st>=2?6:4);H.star(28,72,st>=2?6:4);if(st>=3)for(const y of[-36,36])H.star(12,y,2.6)},
 // Elementalist: a long spear with a comet for a head, fire on one side and frost on the other
 elementalist(H,st){H.dark('M-38 -1.8 L76 -1.8 L76 1.8 L-38 1.8 Z');H.wrap(-8,12,2.2);H.metal('M-38 -3 L-52 0 L-38 3 Z');H.line('M-30 0 L70 0',.6,'#ffffff',.6);
   H.blade('M76 0 C86 -9 100 -7 130 0 Z',[100,-8,100,0],0);H.blade('M76 0 C86 9 100 7 130 0 Z',[100,0,100,8],1);H.line('M76 0 L130 0',.7,'#ffffff',1);
   H.metal('M64 -3 Q72 -18 88 -22 Q78 -14 80 -5 L76 0 L80 5 Q78 14 88 22 Q72 18 64 3 Z');H.flower(70,0,8,8);H.gem(70,0,2.3);H.ribbon(62,3,18,0);H.ribbon(62,-3,18,1);if(st>=3){H.star(130,0,6);H.star(88,-22,3);H.star(88,22,3)}},
 // Stormcaller: a hammer that holds a storm: a drum of night sky with a bolt through it
 stormcaller(H,st){H.dark('M-20 -2.2 L66 -2.2 L66 2.2 L-20 2.2 Z');H.wrap(-18,8,2.6);H.metal('M-24 -4 L-20 -3 L-20 3 L-24 4 L-28 0 Z');
   H.blade('M64 -24 Q60 -28 68 -30 L92 -30 Q100 -28 96 -24 Q102 0 96 24 Q100 28 92 30 L68 30 Q60 28 64 24 Q58 0 64 -24 Z',[64,-30,96,30]);H.line('M82 -22 L74 -4 L84 -3 L76 22',1.4,'#ffffff',1);
   H.metal('M60 -22 L44 -38 L50 -22 L40 -24 L56 -8 Z');H.metal('M60 22 L44 38 L50 22 L40 24 L56 8 Z');H.metal('M64 -32 L96 -32 L98 -28 L62 -28 Z');H.metal('M64 32 L96 32 L98 28 L62 28 Z');if(st>=2){H.orb(80,0,4,true,1)}if(st>=3){H.star(80,-34,5);H.star(80,34,5)}},
 // Berserker: a crescent great-axe of molten planet-core, split with burning cracks
 berserker(H,st){H.dark('M-20 -2.8 L86 -2.8 L86 2.8 L-20 2.8 Z');H.wrap(-18,8,3);H.metal('M-24 -5 L-20 -3 L-20 3 L-24 5 L-30 0 Z');
   H.blade('M74 -7 Q86 -22 76 -52 Q122 -38 124 0 Q122 38 76 52 Q86 22 74 7 Q70 0 74 -7 Z',[76,-50,120,40]);H.line('M78 -46 Q118 -32 120 0 Q118 32 78 46',.8,'#ffffff',1);H.line('M92 -30 L100 -16 L94 -6 L106 4 L98 16 L104 28',.9,'#ffe08a',.95);
   H.metal('M72 -6 L54 -16 L60 -4 L60 4 L54 16 L72 6 Z');H.gem(78,0,3.2);if(st>=3){H.star(124,0,6);H.star(76,-52,4);H.star(76,52,4)}},
 // Brawler: a gauntlet with a dying star in its knuckles, flame streaming back along the arm
 brawler(H,st){H.blade('M-6 -10 C-24 -22 -34 -12 -46 -20 C-38 -8 -44 -2 -52 0 C-44 2 -38 8 -46 20 C-34 12 -24 22 -6 10 Z',[-6,0,-50,0]);H.metal('M-8 -10 L-20 -13 L-22 13 L-8 10 Z');
   H.metal('M-8 -12 Q6 -15 20 -12 L20 12 Q6 15 -8 12 Z');for(let i=0;i<4;i++)H.metal('M20 '+(-12+i*6.2)+' L31 '+(-11+i*6.2)+' Q33 '+(-9+i*6.2)+' 31 '+(-7+i*6.2)+' L20 '+(-6.4+i*6.2)+' Z');H.orb(6,0,6,st>=2,1);if(st>=2)H.line('M-4 -8 Q6 -11 16 -8 M-4 8 Q6 11 16 8',.5,'#ffe6c8',.9);if(st>=3)for(let i=0;i<4;i++)H.star(32,-9+i*6.2,2.4)},
 // Ninja: a chakram spun from ink and twilight, its blades curved like a turning wave
 ninja(H,st){H.chakram(20,0,18,28,6);H.line('M6 0 A14 14 0 1 1 34 0 A14 14 0 1 1 6 0',.7,'#ffffff',.9);H.ink(20,0,11);if(st>=3)H.star(48,0,5);H.dark('M-7 -2 L3 -2 L3 2 L-7 2 Z')},
 // Druid: a living branch of the first world-tree, a lotus of light opening at its crown
 druid(H,st){H.branch();H.flower(92,0,st>=2?17:14,9);H.flower(92,0,8,6);H.orb(92,0,3,false,1);H.leaf(34,-6,10,-.7);H.leaf(52,6,9,.7);H.leaf(10,-4,8,-.9);if(st>=2){H.leaf(66,-7,10,-.8);H.leaf(-12,5,8,.8)}if(st>=3)H.star(110,-10,5)},
 // Gunslinger: a long pistol with a clockwork world for a cylinder
 gunslinger(H,st){H.dark('M-4 0 L-14 20 Q-10 26 -3 24 L6 5 Z');H.metal('M-12 16 L-3 22 L-5 24 L-13 19 Z');H.metal('M-8 -8 L26 -8 L26 6 L6 6 L0 12 L-8 4 Z');
   H.blade('M24 -7 L92 -6 L96 -3 L92 1 L24 3 Z',[24,-7,24,3]);H.line('M26 -4 L92 -3.4',.6,'#ffffff',1);H.metal('M90 -8 L97 -8 L97 3 L90 3 Z');H.metal('M24 3 L66 3 L66 6 L24 6 Z');H.orb(10,-1,7,true,1);if(st>=2){H.line('M32 -8 Q40 -13 48 -8 M52 -8 Q60 -13 68 -8',.5,'#ffe9b8',.9)}if(st>=3)H.star(98,-3,6)}};
