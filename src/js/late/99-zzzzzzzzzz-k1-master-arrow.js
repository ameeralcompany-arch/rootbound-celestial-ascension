// ===== MASTER1: finding the class masters. Until you choose a class, every class master in the Plaza has a glowing arrow bobbing above them, and the ones
// near you also say CHOOSE YOUR PATH, so a new player sees at once where to go. Once you have a class the arrows go quiet: only your own master keeps a small
// marker (YOUR MASTER) when you are near, and a master whose class you could learn next shows a faint arrow. Drawn from cached sprites: no blur, a few
// drawImage calls a frame. Called from the class masters' overlay in 77-npcs2.js. =====
try{window.MASTER1=(()=>{
 const sprites={};
 function arrow(col){const k='a'+col;if(sprites[k])return sprites[k];const c=document.createElement('canvas');c.width=64;c.height=72;const x=c.getContext('2d');
  // a soft glow behind, then a cel-shaded chevron pointing down
  const gr=x.createRadialGradient(32,30,2,32,30,30);gr.addColorStop(0,col+'aa');gr.addColorStop(1,col+'00');x.fillStyle=gr;x.fillRect(0,0,64,64);
  x.lineJoin='round';x.beginPath();x.moveTo(20,10);x.lineTo(44,10);x.lineTo(44,30);x.lineTo(54,30);x.lineTo(32,56);x.lineTo(10,30);x.lineTo(20,30);x.closePath();
  x.fillStyle=col;x.fill();x.lineWidth=3;x.strokeStyle='#2c1b33';x.stroke();
  x.beginPath();x.moveTo(23,13);x.lineTo(30,13);x.lineTo(30,32);x.lineTo(23,32);x.closePath();x.fillStyle='rgba(255,255,255,.55)';x.fill();
  return sprites[k]=c}
 function label(t,col){const k='l'+t+col;if(sprites[k])return sprites[k];const c=document.createElement('canvas'),x=c.getContext('2d');const f='900 13px Montserrat,system-ui,sans-serif';x.font=f;const w=Math.ceil(x.measureText(t).width)+26;c.width=w;c.height=26;x.font=f;
  x.fillStyle='rgba(28,18,44,.86)';x.beginPath();x.roundRect(1,1,w-2,24,12);x.fill();x.lineWidth=1.5;x.strokeStyle=col;x.stroke();x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(t,w/2,13.5);return sprites[k]=c}
 const myCls=()=>{try{return CJOB.cur||null}catch(_){return null}};
 const learnable=k=>{try{return !!(CJOB.canLearn&&CJOB.canLearn(k)===true)}catch(_){return false}};
 // n: the NPC, px/y: where its overlay stack is (screen space, y goes up); returns the new top of the stack
 function mark(g,n,px,y,now){if(!n||!n.cls)return y;const t=now/1000,mine=myCls();let dist=1e9;try{dist=Math.hypot(n.wx-P.x,(n.wy-n.top/2)-(P.y+P.h/2))}catch(_){}
  let col=null,text=null,alpha=1,size=1;
  if(!mine){col='#ffd56a';size=1;if(dist<T*9)text='CHOOSE YOUR PATH'}
  else if(mine===n.cls){if(dist>T*14)return y;col='#9dffb8';size=.72;alpha=.9;if(dist<T*8)text='YOUR MASTER'}
  else if(learnable(n.cls)&&dist<T*12){col='#c9b8ff';size=.6;alpha=.55}
  if(!col)return y;
  const bob=Math.sin(t*3.2+n.wx*.01)*4,a=arrow(col),w=34*size,h=38*size,pulse=.85+.15*Math.sin(t*4.4+n.wx);
  g.save();g.globalAlpha=alpha*pulse;g.drawImage(a,Math.round(px-w/2),Math.round(y-h-4+bob),w,h);g.restore();y-=h+4;
  if(text){const l=label(text,col);g.save();g.globalAlpha=Math.min(1,alpha+.1);g.drawImage(l,Math.round(px-l.width/2),Math.round(y-l.height+bob*.5),l.width,l.height);g.restore();y-=l.height+2}
  return y}
 // no class yet and no master on screen: a pointer at the edge of the screen says which way the class masters are
 function edge(g,L,now){if(myCls())return;let best=null,bd=1e12,vis=false;for(const n of L){if(!n.cls)continue;if(n.vis){const x=n.wx-cam.x;if(x>-10&&x<cv.width/ZM+10){vis=true;break}}const d=Math.abs(n.wx-P.x);if(d<bd){bd=d;best=n}}
  if(vis||!best)return;const vw=cv.width/ZM,vh=cv.height/ZM,right=best.wx>P.x,t=now/1000,l=label(right?'CLASS MASTERS  ▶':'◀  CLASS MASTERS','#ffd56a'),nud=Math.sin(t*4)*4*(right?1:-1);
  /* level with the player's head: clear of the side panels and signs */const x=right?vw-l.width-14+nud:14+nud,y=Math.round(Math.max(60,Math.min(vh-140,P.y-cam.y-28)));g.save();g.globalAlpha=.92;g.drawImage(l,Math.round(x),y,l.width,l.height);g.restore()}
 return{mark,edge}})()}catch(e){console.error("MASTER1",e)}
