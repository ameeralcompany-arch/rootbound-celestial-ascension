// ===== Realistic wings: barbed feathers with a central shaft, in natural bird palettes =====
(()=>{const STY=WingArt.STY;
 STY.real=(x,L,w,c0,c1,c2,glow,edge,cr,rand)=>{x.save();const up=w*.55,lo=w*.95;
  const path=()=>{x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.25,-up,L*.75,-up*1.05,L*.97,-up*.25);x.quadraticCurveTo(L*1.04,0,L*.96,lo*.3);x.bezierCurveTo(L*.7,lo*1.15,L*.28,lo,0,0);x.closePath()};
  path();const g=x.createLinearGradient(0,-up,L,lo);g.addColorStop(0,c0);g.addColorStop(.55,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fill();
  x.save();path();x.clip();
  // barbs: fine diagonal lines sweeping from the shaft toward the tip, lighter on top, darker beneath
  const N=Math.max(12,(L/2.6)|0);x.lineWidth=Math.max(.5,w*.022);
  for(let i=1;i<N;i++){const u=i/N,bx=L*u,sw=L*.12*(1-u*.4),ju=(rand?rand()-.5:0)*w*.03;
   x.strokeStyle='rgba(255,255,255,'+(.14+.1*(1-u))+')';x.beginPath();x.moveTo(bx,0);x.lineTo(bx+sw,-up*(1-u*.55)+ju);x.stroke();
   x.strokeStyle='rgba(0,0,0,'+(.1+.1*u)+')';x.beginPath();x.moveTo(bx,0);x.lineTo(bx+sw*1.1,lo*(1-u*.5)+ju);x.stroke()}
  // soft sheen across the leading vane and a shaded trailing edge
  const sh=x.createLinearGradient(0,-up,0,lo);sh.addColorStop(0,'rgba(255,255,255,.3)');sh.addColorStop(.4,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');x.fillStyle=sh;x.fillRect(0,-up*1.2,L*1.1,lo*2.3);
  x.restore();
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=Math.max(.8,w*.045);path();x.stroke();
  // the shaft
  x.lineCap='round';x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=Math.max(1.4,w*.085);x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(L*.5,-w*.04,L*.96,-w*.02);x.stroke();
  x.strokeStyle=c2;x.lineWidth=Math.max(.8,w*.045);x.stroke();
  if(glow){x.globalCompositeOperation='lighter';x.strokeStyle=glow;x.globalAlpha*=.35;x.lineWidth=Math.max(.8,w*.05);path();x.stroke()}
  x.restore()};
 const E=[
  {id:'eagle',n:'Eagle Wings',style:'real',rows:4,fe:11,span:1.45,pal:['#2e1c0e','#7a4f2a','#d9bf92','#fff0c8'],crys:0,sp:'#fff0c8',d:'Broad brown-and-cream flight feathers, built for long glides.'},
  {id:'swan',n:'Swan Wings',style:'real',rows:4,fe:12,span:1.4,pal:['#c5cde0','#f3f6ff','#ffffff','#fff6e0'],crys:0,sp:'#ffffff',fxk:'glitter',d:'Layered white plumage with a soft glow along the edge.'},
  {id:'raven',n:'Raven Wings',style:'real',rows:4,fe:11,span:1.42,pal:['#040307','#19152b','#463f66','#9a8fd6'],crys:0,sp:'#9a8fd6',fxk:'smoke',d:'Glossy black feathers with a violet sheen.'},
  {id:'plume',n:'Phoenix Plume Wings',style:'real',rows:5,fe:11,span:1.55,pal:['#6a0e08','#e8541a','#ffc83a','#fff4c0'],crys:0,sp:'#ffd24a',fxk:'embers',d:'Realistic plumage that burns from deep red to gold.'}];
 for(const e of E){e.lvl=0;e.shop=1;WINGS.push(e)}
})();
