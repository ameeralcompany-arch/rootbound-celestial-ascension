// ===== Cute wings: smaller, rounder, pastel and soft. Applies to every wing (level wings and shop wings). =====
(()=>{const S=.64; // overall size (was 1.0)
 const mixW=(h,a)=>{const n=parseInt(h.slice(1),16),f=c=>Math.round(c+(255-c)*a);return'#'+[f(n>>16&255),f(n>>8&255),f(n&255)].map(v=>('0'+v.toString(16)).slice(-2)).join('')};
 // a plump, round feather: pearl tip, soft glow, white outline instead of a dark one
 WingArt.STY.cute=(x,L,w,c0,c1,c2,glow,edge)=>{x.save();x.beginPath();x.moveTo(0,0);x.bezierCurveTo(L*.18,-w*1.2,L*.92,-w*1.25,L,-w*.08);x.bezierCurveTo(L*1.0,w*.8,L*.42,w*1.0,0,0);x.closePath();
  const gr=x.createLinearGradient(0,0,L,0);gr.addColorStop(0,c0);gr.addColorStop(.5,c1);gr.addColorStop(1,c2);x.fillStyle=gr;x.fill();
  x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=Math.max(.8,w*.09);x.stroke();
  x.fillStyle='rgba(255,255,255,.38)';x.beginPath();x.ellipse(L*.42,-w*.34,L*.26,w*.2,-.12,0,6.3);x.fill();
  x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(L*.93,-w*.08,Math.max(1,w*.16),0,6.3);x.fill();x.restore()};
 for(const w of WINGS){if(!w.style&&!w.shop)w.style='cute';if(!w.shop&&w.pal)w.pal=w.pal.map((c,i)=>i<3?mixW(c,.3):c)}
 const _d=WingArt.draw;
 WingArt.draw=function(g,tier,cx,cy){const a=arguments;g.save();g.translate(cx,cy);g.scale(S,S);g.translate(-cx,-cy);
  try{const W=WINGS[tier],c=W&&W.pal?W.pal[2]:'#fff',al=(a[9]==null?1:a[9]);g.globalCompositeOperation='lighter';g.globalAlpha=.16*al;const gr=g.createRadialGradient(cx-30,cy-40,4,cx-30,cy-40,120);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(cx-150,cy-160,260,240);g.globalCompositeOperation='source-over';g.globalAlpha=1}catch(_){}
  try{return _d.apply(this,a)}finally{g.restore()}}})();
