// ===== V6 sigils: ground magic circles (violet sigil / golden seraph ring references), pre-rendered, drawn with a 2.5D squash =====
const Sigil=(()=>{
 const cache=new Map(),S=256;
 function build(a){const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.translate(S/2,S/2);x.lineJoin='round';x.shadowColor=a.c;x.shadowBlur=8;
  const ring=(r,w,col,al,dash)=>{x.save();x.strokeStyle=col;x.globalAlpha=al;x.lineWidth=w;if(dash)x.setLineDash(dash);x.beginPath();x.arc(0,0,r,0,6.3);x.stroke();x.restore()};
  ring(120,2.5,a.c,1);ring(112,1,a.c2,.8);ring(84,1.6,a.c,.9);ring(60,1.2,a.c2,.8);
  // rune ticks between outer rings
  x.fillStyle=a.c2;x.strokeStyle=a.c2;x.lineWidth=1.2;const nt=a.pts*4;for(let i=0;i<nt;i++){const t=i/nt*6.283;x.save();x.rotate(t);if(i%2){x.fillRect(-1,-109,2,7)}else{x.beginPath();x.moveTo(-3,-100);x.lineTo(3,-100);x.lineTo(0,-108);x.closePath();x.stroke()}x.restore()}
  // star polygon
  const star=(r,n,k,al,w)=>{x.save();x.strokeStyle=a.c;x.globalAlpha=al;x.lineWidth=w;x.beginPath();for(let i=0;i<=n;i++){const t=(i*k)/n*6.283-1.5708;x[i?'lineTo':'moveTo'](Math.cos(t)*r,Math.sin(t)*r)}x.closePath();x.stroke();x.restore()};
  star(84,a.pts,2,1,1.8);star(60,a.pts,2,.8,1.2);if(a.pts>6)star(84,a.pts,3,.7,1.1);
  // node circles on the ring
  for(let i=0;i<a.pts;i++){const t=i/a.pts*6.283-1.5708,X=Math.cos(t)*100,Y=Math.sin(t)*100;x.save();x.translate(X,Y);x.strokeStyle=a.c2;x.lineWidth=1.4;x.beginPath();x.arc(0,0,9,0,6.3);x.stroke();x.beginPath();x.arc(0,0,4,0,6.3);x.stroke();x.fillStyle=a.c;x.beginPath();x.arc(0,0,1.8,0,6.3);x.fill();x.restore()}
  // core glow
  const gr=x.createRadialGradient(0,0,0,0,0,46);gr.addColorStop(0,a.c2);gr.addColorStop(.35,a.c);gr.addColorStop(1,'rgba(0,0,0,0)');x.shadowBlur=0;x.globalAlpha=.55;x.fillStyle=gr;x.beginPath();x.arc(0,0,46,0,6.3);x.fill();x.globalAlpha=1;
  if(a.wing){x.fillStyle=a.c2;for(const s of[-1,1]){for(let i=0;i<4;i++){x.beginPath();x.moveTo(s*6,4);x.quadraticCurveTo(s*(14+i*7),-6-i*5,s*(24+i*8),-4-i*6);x.quadraticCurveTo(s*(16+i*6),2-i,s*6,4);x.globalAlpha=.9-i*.15;x.fill()}}x.globalAlpha=1}
  else{x.strokeStyle=a.c2;x.lineWidth=1.4;x.beginPath();for(let i=0;i<=a.pts;i++){const t=i/a.pts*6.283-1.5708;x[i?'lineTo':'moveTo'](Math.cos(t)*22,Math.sin(t)*22)}x.stroke()}
  return c}
 const get=a=>{let c=cache.get(a.id);if(!c){c=build(a);cache.set(a.id,c)}return c};
 return{draw(g,a,cx,cy,t,r,alpha){if(!a||a.id=='none')return;const im=get(a),R=r||70;g.save();g.globalCompositeOperation='lighter';g.translate(cx,cy);g.scale(1,.26);g.globalAlpha=(alpha==null?.85:alpha)*(.8+.2*Math.sin(t*2));g.rotate(t*.35);g.drawImage(im,-R,-R,R*2,R*2);
   g.rotate(-t*.7);g.globalAlpha*=.45;g.drawImage(im,-R*.62,-R*.62,R*1.24,R*1.24);g.restore()}}})();
