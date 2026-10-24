// ===== Shop wings: each has its own silhouette (STY), palette, animation weight and particle behaviour (fxk, see FX7.wingFx) =====
(()=>{const STY=WingArt.STY,fillG=(x,L,c0,c1,c2)=>{const g=x.createLinearGradient(0,0,L,0);g.addColorStop(0,c0);g.addColorStop(.5,c1);g.addColorStop(1,c2);x.fillStyle=g};
 // dove: broad rounded feathers with soft glowing tips
 STY.dove=(x,L,w,c0,c1,c2,glow,edge,cr,rand)=>{x.save();x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.3,-w*1.25,L*.85,-w*1.3,L,-w*.1);x.bezierCurveTo(L*1.02,w*.5,L*.6,w*1.05,0,0);x.closePath();fillG(x,L,c0,c1,c2);x.shadowColor='#fff';x.shadowBlur=w*.5;x.fill();x.shadowBlur=0;x.strokeStyle='rgba(150,170,220,.55)';x.lineWidth=Math.max(1,w*.06);x.stroke();
  x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=Math.max(.8,w*.08);x.beginPath();x.moveTo(L*.04,0);x.quadraticCurveTo(L*.5,-w*.3,L*.96,-w*.08);x.stroke();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(L*.94,-w*.1,w*.18,0,6.3);x.fill();x.restore()};
 // blossom: petal shapes with a notched tip and a pink vein
 STY.petal=(x,L,w,c0,c1,c2)=>{x.save();x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.2,-w*1.3,L*.8,-w*1.4,L*.98,-w*.35);x.lineTo(L*.88,-w*.05);x.lineTo(L,w*.3);x.bezierCurveTo(L*.7,w*1.1,L*.25,w*1.0,0,0);x.closePath();fillG(x,L,c0,c1,c2);x.fill();x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=Math.max(1,w*.07);x.stroke();
  x.strokeStyle='rgba(190,60,110,.45)';x.lineWidth=Math.max(.8,w*.06);x.beginPath();x.moveTo(L*.05,0);x.quadraticCurveTo(L*.5,-w*.25,L*.9,-w*.05);x.stroke();x.restore()};
 // crystal: faceted kite shards
 STY.shard=(x,L,w,c0,c1,c2)=>{x.save();x.beginPath();x.moveTo(0,0);x.lineTo(L*.35,-w*.95);x.lineTo(L,-w*.1);x.lineTo(L*.45,w*.7);x.closePath();fillG(x,L,c0,c1,c2);x.shadowColor=c2;x.shadowBlur=w*.6;x.fill();x.shadowBlur=0;x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=Math.max(1,w*.08);x.stroke();
  x.fillStyle='rgba(255,255,255,.32)';x.beginPath();x.moveTo(0,0);x.lineTo(L*.35,-w*.95);x.lineTo(L*.5,-w*.1);x.closePath();x.fill();x.fillStyle='rgba(90,170,255,.28)';x.beginPath();x.moveTo(L*.5,-w*.1);x.lineTo(L,-w*.1);x.lineTo(L*.45,w*.7);x.closePath();x.fill();
  x.strokeStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(L*.35,-w*.95);x.lineTo(L*.45,w*.7);x.stroke();x.restore()};
 // mechanical: tapered metal plates with a glowing conduit and rivets
 STY.blade=(x,L,w,c0,c1,c2)=>{x.save();x.beginPath();x.moveTo(0,-w*.25);x.lineTo(L*.9,-w*.55);x.lineTo(L,-w*.05);x.lineTo(L*.85,w*.5);x.lineTo(0,w*.3);x.closePath();const g=x.createLinearGradient(0,-w,0,w);g.addColorStop(0,'#cfd6e4');g.addColorStop(.45,'#7d8799');g.addColorStop(1,'#2e3440');x.fillStyle=g;x.fill();x.strokeStyle='#161a22';x.lineWidth=Math.max(1,w*.09);x.stroke();
  x.shadowColor='#3ff3ff';x.shadowBlur=w*.5;x.strokeStyle='#3ff3ff';x.lineWidth=Math.max(1,w*.1);x.beginPath();x.moveTo(L*.1,0);x.lineTo(L*.8,-w*.18);x.stroke();x.shadowBlur=0;x.fillStyle='#e8eef9';for(let i=1;i<4;i++){x.beginPath();x.arc(L*(.2+i*.2),-w*.2+i*.02*w,Math.max(1,w*.06),0,6.3);x.fill()}x.restore()};
 // umbral eclipse: serrated black feathers with a violet rim light
 STY.jag=(x,L,w,c0,c1,c2)=>{x.save();x.beginPath();x.moveTo(0,0);x.lineTo(L*.2,-w*.75);x.lineTo(L*.3,-w*.5);x.lineTo(L*.5,-w*1.0);x.lineTo(L*.58,-w*.55);x.lineTo(L*.8,-w*.8);x.lineTo(L,-w*.1);x.lineTo(L*.7,w*.35);x.lineTo(L*.45,w*.55);x.lineTo(L*.2,w*.45);x.closePath();fillG(x,L,c0,c1,c2);x.shadowColor='#9b5cff';x.shadowBlur=w*.8;x.fill();x.shadowBlur=0;x.strokeStyle='rgba(190,140,255,.85)';x.lineWidth=Math.max(1,w*.09);x.stroke();x.restore()};
 // galaxy: feather silhouette with a starfield inside
 STY.star=(x,L,w,c0,c1,c2,glow,edge,cr,rand)=>{x.save();x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.25,-w*1.0,L*.7,-w*.9,L,-w*.15);x.bezierCurveTo(L*.72,w*.55,L*.3,w*.8,0,0);x.closePath();fillG(x,L,c0,c1,c2);x.fill();x.save();x.clip();for(let i=0;i<26;i++){x.fillStyle=['#fff','#9fe8ff','#ffb3f0','#c9a8ff'][i%4];x.globalAlpha=.35+rand()*.65;const s=.8+rand()*1.8;x.fillRect(rand()*L,(rand()-.5)*w*1.6,s,s)}x.restore();x.globalAlpha=1;x.strokeStyle='rgba(190,170,255,.8)';x.lineWidth=Math.max(1,w*.07);x.stroke();x.restore()};
 // dragon: a bone finger with a leathery membrane webbed to the next finger
 STY.bone=(x,L,w,c0,c1,c2)=>{x.save();x.beginPath();x.moveTo(0,0);x.lineTo(L,-w*.1);x.lineTo(L*.8,w*.95);x.quadraticCurveTo(L*.45,w*.55,0,w*.15);x.closePath();const g=x.createLinearGradient(0,0,L,w);g.addColorStop(0,c0);g.addColorStop(.6,c1);g.addColorStop(1,c2);x.globalAlpha*=.92;x.fillStyle=g;x.fill();x.globalAlpha=1;
  x.strokeStyle='#2a0a0a';x.lineWidth=Math.max(1.5,w*.16);x.lineCap='round';x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(L*.5,-w*.2,L,-w*.1);x.stroke();x.strokeStyle='#e9d9c8';x.lineWidth=Math.max(.8,w*.07);x.stroke();x.fillStyle='#e9d9c8';x.beginPath();x.moveTo(L,-w*.1);x.lineTo(L*1.08,-w*.08);x.lineTo(L,0);x.fill();x.restore()};
 // omen moth: broad rounded lobes with glowing veins and an eye spot
 STY.lobe=(x,L,w,c0,c1,c2)=>{x.save();x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.1,-w*2.0,L*.95,-w*2.1,L,-w*.4);x.bezierCurveTo(L*1.0,w*.9,L*.4,w*1.4,0,0);x.closePath();fillG(x,L,c0,c1,c2);x.fill();x.strokeStyle='rgba(255,120,120,.7)';x.lineWidth=Math.max(1,w*.06);x.stroke();
  x.shadowColor='#ff3a4a';x.shadowBlur=w*.5;x.strokeStyle='rgba(255,90,90,.85)';x.lineWidth=Math.max(.8,w*.05);for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(L*.05,0);x.quadraticCurveTo(L*.5,i*w*.55,L*.9,i*w*.6-w*.2);x.stroke()}x.shadowBlur=0;
  x.fillStyle='#fff0d8';x.beginPath();x.ellipse(L*.68,-w*.5,w*.4,w*.55,.4,0,6.3);x.fill();x.fillStyle='#2a0612';x.beginPath();x.ellipse(L*.69,-w*.5,w*.2,w*.3,.4,0,6.3);x.fill();x.restore()};
 // ---- entries (ids match the catalog: wing_<ref>). lvl 0 + shop:1 => never part of level progression; ownership decides.
 const E=[
  {id:'dove',n:'Dove Wings',style:'dove',rows:4,fe:9,span:1.2,pal:['#c9d3ee','#f1f5ff','#ffffff','#fff2d0'],crys:1,sp:'#fff',fxk:'glitter',d:'Pearl-white feather wings with luminous tips and falling glitter.'},
  {id:'blossom',n:'Blossom Wings',style:'petal',rows:3,fe:8,span:1.15,pal:['#e66a9a','#ffb0cf','#fff0f6','#ff7fb0'],crys:0,sp:'#ffd0e4',fxk:'petals',d:'Soft petal-shaped wings that shed cherry-blossom petals as you move.'},
  {id:'crystal',n:'Crystal Wings',style:'shard',rows:3,fe:8,span:1.15,pal:['#2a76c9','#8fe0ff','#f4fdff','#7ff0ff'],crys:6,sp:'#c8f6ff',fxk:'glints',d:'Angular shards with refracting light bands.'},
  {id:'mech',n:'Mechanical Wings',style:'blade',rows:3,fe:7,span:1.2,pal:['#2e3440','#7d8799','#cfd6e4','#3ff3ff'],crys:0,sp:'#3ff3ff',fxk:'sparks',d:'Metal plates and glowing conduits with small turning gears.'},
  {id:'umbral',n:'Umbral Eclipse Wings',style:'jag',rows:4,fe:10,span:1.35,pal:['#07040d','#2d1458','#7a42d6','#b88bff'],crys:4,sp:'#b88bff',fxk:'smoke',d:'Violet-black feathers wrapped in rising dark energy.'},
  {id:'galaxy',n:'Galaxy Wings',style:'star',rows:4,fe:10,span:1.4,pal:['#140a3a','#4b2fb0','#2fb6ff','#ff7fe0'],crys:5,sp:'#fff',fxk:'stars',cosmic:1,d:'Feather silhouettes filled with a living starfield.'},
  {id:'dragon',n:'Dragon Wings',style:'bone',rows:2,fe:5,span:1.55,pal:['#5a0f12','#b3262b','#ff7a4a','#ffb347'],crys:0,sp:'#ff9a4a',fxk:'embers',d:'Large articulated bat wings with membranes and bone fingers.'},
  {id:'moth',n:'Omen Moth Wings',style:'lobe',rows:3,fe:4,span:1.6,pal:['#1a0409','#6e0f1c','#c4283a','#ffb8a0'],crys:0,sp:'#ff4a5a',fxk:'omen',d:'Broad crimson-black moth wings with glowing veins.'}];
 for(const e of E){e.lvl=0;e.shop=1;WINGS.push(e)}
})();
