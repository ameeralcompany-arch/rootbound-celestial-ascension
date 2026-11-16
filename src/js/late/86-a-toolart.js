// ===== TOOLART: the five tools as real equipment, each with its own silhouette, in four grades that follow the tool's level (TOOLLV):
//   levels 1-3 wood and copper  ·  4-6 steel with a leather grip  ·  7-9 gem-set, gold fittings  ·  10 celestial (ivory and pale gold, a star)
// Pip is a spade, Pebble a mason's hammer (flat face and chisel back), Glimmer a double pickaxe, Twiggy a bearded axe, Bubbles a rod with a reel.
// Drawn in the game's cel style (dark outline, a lit face and a shade face, no gradients) with the origin at the hand, pointing +x; the level shine
// (TOOLLV) still draws around them. 86-minetools.js uses these in place of its older cute models. =====
const TOOLART=(()=>{
 const OL='#1e1430';
 const GR=[{h:'#9a6a3c',hl:'#c08a52',m:'#c7783f',ml:'#eaa56e',md:'#8a4a26',band:'#5a3a22'},
  {h:'#6b4a3a',hl:'#8a6450',m:'#9aa6b8',ml:'#e2e9f3',md:'#5d6878',band:'#2e2430',grip:'#3a2a24'},
  {h:'#4a3428',hl:'#6a4c3a',m:'#b8c2d4',ml:'#f4f7ff',md:'#6f7a90',band:'#e0b85a',grip:'#2a2030'},
  {h:'#efe6d2',hl:'#fffaf0',m:'#f3d996',ml:'#fff6dc',md:'#c9a24e',band:'#f4d59a',grip:'#d9c9a6'}];
 const GEM={pip:'#7fe0a0',pebble:'#ff9ac8',glimmer:'#8fe0ff',twiggy:'#a8e070',bubbles:'#7fc8ff'};
 const grade=id=>{try{const l=TOOLLV.lvl(id);return l>=10?3:l>=7?2:l>=4?1:0}catch(_){return 0}};
 const poly=(x,pts,fill,lw)=>{x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.closePath();x.fillStyle=fill;x.fill();x.strokeStyle=OL;x.lineWidth=lw||1.6;x.stroke()};
 // a handle from the hand to `len`, with grip wraps, metal bands and (grade 3) gold caps
 function handle(x,len,th,G,g){x.fillStyle=G.h;x.beginPath();x.roundRect(-3,-th/2,len+3,th,th/2);x.fill();x.strokeStyle=OL;x.lineWidth=1.6;x.stroke();x.fillStyle=G.hl;x.fillRect(0,-th/2+1,len,th*.3);
  if(g>=1){x.fillStyle=G.grip;for(let i=0;i<4;i++){x.fillRect(2+i*4.2,-th/2-.5,2.6,th+1)}}
  x.fillStyle=G.band;x.fillRect(len-5,-th/2-1,3.5,th+2);x.strokeRect(len-5,-th/2-1,3.5,th+2);if(g>=2){x.fillRect(-4,-th/2-1,3.2,th+2);x.strokeRect(-4,-th/2-1,3.2,th+2)}}
 function gem(x,cx,cy,r,c){x.fillStyle=c;x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.8,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.8,cy);x.closePath();x.fill();x.strokeStyle=OL;x.lineWidth=1.2;x.stroke();x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.moveTo(cx-r*.2,cy-r*.6);x.lineTo(cx+r*.25,cy-r*.15);x.lineTo(cx-r*.05,cy-r*.05);x.closePath();x.fill()}
 function star(x,cx,cy,r){x.fillStyle='#ffffff';x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.38:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
 const D={
  // a spade: straight shaft, a socket, a rounded-tip blade; grade 1 adds a D-grip and a rolled edge, 2 an engraved line and a gem, 3 a star cut-out
  pip(x,L,t,g,G){const s=L*.58;handle(x,s,4.4,G,g);if(g>=1){x.strokeStyle=OL;x.lineWidth=4;x.beginPath();x.moveTo(-3,0);x.lineTo(-9,-5);x.lineTo(-9,5);x.closePath();x.stroke();x.strokeStyle=G.h;x.lineWidth=2;x.stroke()}
   poly(x,[s-2,-3.5,s+5,-4.5,s+5,4.5,s-2,3.5],G.md);const b0=s+4,b1=L*.98;poly(x,[b0,-8.5,b1-6,-9.5,b1,-4,b1+1,0,b1,4,b1-6,9.5,b0,8.5],G.m);poly(x,[b0+2,-7,b1-7,-8,b1-2,-4,b0+2,-3.5],G.ml,0.01);
   if(g>=1){x.strokeStyle=G.md;x.lineWidth=1.4;x.beginPath();x.moveTo(b0+2,6.5);x.lineTo(b1-6,7.5);x.stroke()}if(g>=2){x.strokeStyle=G.md;x.lineWidth=1;x.beginPath();x.moveTo(b0+5,0);x.lineTo(b1-6,0);x.stroke();gem(x,b0+1,0,3.4,GEM.pip)}
   if(g>=3){x.save();x.globalCompositeOperation='destination-out';star(x,b0+(b1-b0)*.55,0,4.2);x.restore();star(x,b0+(b1-b0)*.55,0,2.2)}},
  // a mason's hammer: a square striking face and a chisel back on a crossways head
  pebble(x,L,t,g,G){const s=L*.66;handle(x,s,4.6,G,g);const hx=s+1,hw=8.5;poly(x,[hx-hw/2,-15,hx+hw/2,-15,hx+hw/2,15,hx-hw/2,15],G.m);poly(x,[hx-hw/2+1.4,-13.5,hx+hw/2-1.6,-13.5,hx+hw/2-1.6,-1,hx-hw/2+1.4,-1],G.ml,.01);
   poly(x,[hx-hw/2-1,-17,hx+hw/2+1,-17,hx+hw/2+1,-13,hx-hw/2-1,-13],G.md);poly(x,[hx-hw/2,15,hx+hw/2,15,hx+1,22,hx-1,22],G.md);
   if(g>=1){x.fillStyle=G.band;x.fillRect(hx-hw/2-.5,-3,hw+1,6);x.strokeRect(hx-hw/2-.5,-3,hw+1,6)}if(g>=2)gem(x,hx,-7,3.2,GEM.pebble);if(g>=3)star(x,hx,7,3.4)},
  // a double pickaxe: a curved head with a point at each end, wedged on the shaft
  glimmer(x,L,t,g,G){const s=L*.64;handle(x,s,4.4,G,g);const hx=s+1;x.beginPath();x.moveTo(hx-3,-1);x.quadraticCurveTo(hx-8,-12,hx-2,-24);x.quadraticCurveTo(hx+2,-12,hx+5,-2);x.lineTo(hx+5,2);x.quadraticCurveTo(hx+2,12,hx-2,24);x.quadraticCurveTo(hx-8,12,hx-3,1);x.closePath();
   x.fillStyle=G.m;x.fill();x.strokeStyle=OL;x.lineWidth=1.6;x.stroke();x.beginPath();x.moveTo(hx-2,-3);x.quadraticCurveTo(hx-5,-12,hx-2,-20);x.quadraticCurveTo(hx,-12,hx+2,-3);x.closePath();x.fillStyle=G.ml;x.fill();
   poly(x,[hx-4.5,-4,hx+6,-4,hx+6,4,hx-4.5,4],G.md);if(g>=2)gem(x,hx+.6,0,3.1,GEM.glimmer);if(g>=3){star(x,hx-2,-20,2.6);star(x,hx-2,20,2.6)}if(g>=1){x.strokeStyle=G.ml;x.lineWidth=1;x.beginPath();x.moveTo(hx-1,8);x.quadraticCurveTo(hx-3,14,hx-2,19);x.stroke()}},
  // a bearded axe: a long low beard and a straight top, with a poll on the back
  twiggy(x,L,t,g,G){const s=L*.66;handle(x,s,4.6,G,g);const hx=s-2;poly(x,[hx-3,-6,hx+4,-6,hx+4,6,hx-3,6],G.md);
   poly(x,[hx+3,-6,hx+12,-9,hx+17,-4,hx+18,6,hx+15,16,hx+8,20,hx+5,9,hx+3,6],G.m);poly(x,[hx+5,-5,hx+12,-7.5,hx+15.5,-3.5,hx+16,4,hx+6,4],G.ml,.01);
   x.strokeStyle=G.md;x.lineWidth=1.2;x.beginPath();x.moveTo(hx+17,-3);x.lineTo(hx+17.5,6);x.lineTo(hx+14.5,15);x.stroke();if(g>=1){poly(x,[hx-7,-4,hx-3,-4,hx-3,4,hx-7,4],G.md)}if(g>=2)gem(x,hx+8,4,3,GEM.twiggy);if(g>=3)star(x,hx+10,-2,3)},
  // a rod with a cork grip and a reel; the line and bobber are drawn as before (fishing state)
  bubbles(x,L,t,g,G){let bd=0;try{bd=TOOLS8.FISH.S.st=='reel'&&typeof FISHGAME!='undefined'?.25+FISHGAME.G.ten*.6:0}catch(_){}const tipX=L*.95,tipY=-L*.35;
   x.strokeStyle=OL;x.lineWidth=4.6;x.beginPath();x.moveTo(-2,0);x.lineTo(tipX,tipY);x.stroke();x.strokeStyle=g>=3?G.band:g>=2?'#3a3a5a':g>=1?'#5a5a6a':'#8a5a30';x.lineWidth=2.6;x.stroke();
   x.fillStyle=g>=3?G.h:'#c8a070';x.beginPath();x.roundRect(-3,-3,L*.22,6,3);x.fill();x.strokeStyle=OL;x.lineWidth=1.4;x.stroke();
   const rx=L*.17,ry=5;x.fillStyle=G.m;x.beginPath();x.arc(rx,ry,4.4,0,6.3);x.fill();x.stroke();x.fillStyle=G.md;x.beginPath();x.arc(rx,ry,1.6,0,6.3);x.fill();
   for(const u of[.45,.7,.88]){x.strokeStyle=g>=2?G.band:'#c8c8d0';x.lineWidth=1.2;x.beginPath();x.arc(tipX*u,tipY*u-2,1.8,0,6.3);x.stroke()}if(g>=2)gem(x,L*.27,-L*.1,2.6,GEM.bubbles);if(g>=3)star(x,tipX,tipY,2.4);
   x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1;x.beginPath();x.moveTo(tipX,tipY);let st='idle';try{st=TOOLS8.FISH.S.st}catch(_){}if(bd)x.quadraticCurveTo(L*.98,tipY+L*.2,L*1.0,tipY+bd*L*.5+8);else x.lineTo(tipX,tipY+8+(st=='idle'?Math.sin(t*3)*2:0));x.stroke()}};
 function draw(x,id,L,t){const f=D[id];if(!f)return false;const g=grade(id);x.save();x.lineJoin='round';x.lineCap='round';try{f(x,L,t||0,g,GR[g])}finally{x.restore()}return true}
 return{draw,grade,GR,IDS:Object.keys(D)}})();
