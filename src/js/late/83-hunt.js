// ===== Spirit Stone hunt: 7 hidden glowing stones in the Plaza (underwater, on the bridge, inside buildings, in the grove...) =====
// Finding a stone gives gems once; finding all seven gives a bonus and the "Stone Seeker" title. Progress is saved on this device.
// Gems are only paid in offline / guest play (a signed-in online account's wallet belongs to the server).
const HUNT7=(()=>{
 const S=22,SPOTS=[[-47,S-1,'behind the left cherry tree'],[-41,S+4,'at the bottom of the pond'],[-41,S-3,'on top of the bridge'],[-32,S-2,'inside the cottage'],[30,S-2,'inside the teahouse'],[43,S-1,'deep in the bamboo grove'],[-14,S-2,'in the fountain']];
 let found={},title=false;try{const o=JSON.parse(localStorage.getItem('rbhunt')||'{}');found=o.f||{};title=!!o.t}catch(_){}
 const save=()=>{try{localStorage.setItem('rbhunt',JSON.stringify({f:found,t:title}))}catch(_){}};
 const count=()=>Object.keys(found).length,srv=()=>{try{return SHOP7.serverMode}catch(_){return false}};
 const pos=i=>{const[dx,y0]=SPOTS[i];let y=y0;const x=DX+dx;while(y>2&&(tiles[y*W+x]))y--;return{x:x*T+T/2,y:y*T+T/2}};
 function draw(now){if(cur!='plaza')return;const t=now/1000;
  for(let i=0;i<SPOTS.length;i++){if(found[i])continue;const p=pos(i),sx=p.x-cam.x,sy=p.y-cam.y;if(sx<-60||sx>cv.width/ZM+60||sy<-60||sy>cv.height/ZM+60)continue;
   const near=Math.hypot(P.x-p.x,P.y+P.h/2-p.y);if(near<T*.9){take(i);continue}
   const pl=.6+.4*Math.sin(t*3+i),prox=Math.max(0,1-near/420);g.save();g.translate(sx,sy+Math.sin(t*2+i)*3);g.globalCompositeOperation='lighter';
   const gr=g.createRadialGradient(0,0,1,0,0,22+prox*14);gr.addColorStop(0,'rgba(190,170,255,'+(.25+.5*prox)*pl+')');gr.addColorStop(1,'rgba(140,110,255,0)');g.fillStyle=gr;g.fillRect(-40,-40,80,80);g.globalCompositeOperation='source-over';
   g.globalAlpha=.25+.75*prox;g.fillStyle='#e9e1ff';g.strokeStyle='#8a6bff';g.lineWidth=1.5;g.rotate(t*.7+i);g.beginPath();g.moveTo(0,-7);g.lineTo(5,0);g.lineTo(0,7);g.lineTo(-5,0);g.closePath();g.fill();g.stroke();g.restore()}}
 function take(i){if(found[i])return;found[i]=1;const p=pos(i);let msg='Spirit Stone found! '+count()+' / '+SPOTS.length;
  if(!srv()){gems+=50;msg+='  +50 gems'}
  try{burst(p.x,p.y,'#c9b8ff',24,200,6,'p');rings.push({x:p.x,y:p.y,c:'#c9b8ff',t:performance.now()});SFX7.tone(660,1320,.35,'sine',.07);SFX7.tone(990,1980,.4,'sine',.05,.12)}catch(_){}
  if(count()>=SPOTS.length&&!title){title=true;if(!srv())gems+=500;msg='All Spirit Stones found!'+(srv()?'':'  +500 gems')+'  Title: Stone Seeker'}
  save();try{say(msg);saveP()}catch(_){}}
 const _dn=drawNPCs;drawNPCs=function(now){try{draw(now)}catch(_){}return _dn(now)};
 return{SPOTS,found:()=>({...found}),count,take,pos,get title(){return title},hint(){const i=SPOTS.findIndex((_,k)=>!found[k]);return i<0?'You found them all!':'A stone hides '+SPOTS[i][2]+'.'},reset(){found={};title=false;save()}}})();
