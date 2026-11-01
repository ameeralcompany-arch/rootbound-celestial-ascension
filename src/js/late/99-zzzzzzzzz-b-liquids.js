// ===== LIQ10: liquids that settle flat, and lava that looks molten.
// Levelling: the flow step only moves liquid sideways when neighbours differ by 2+ (of 8), so differences of 1 never evened out and lakes
// froze into ramps (one unit higher every column: water tilted, lava climbed out of its lake in a staircase). After each flow step, every
// run of resting liquid in a row (side by side, each on a block or on full liquid) now shares its total evenly, so surfaces settle flat.
// Lava (Inferno worlds): it creeps (flows a third as often as water), and over the molten pattern it gets drifting dark crust plates
// that crack and glow at their seams, a pulsing molten shine, and a heat haze above the surface. All per visible surface tile, cached art. =====
const LIQ10=(()=>{
 const INF=()=>typeof cur=='string'&&/-inf$/.test(cur);
 // ---- even out each resting run, row by row (runs over liquid cells only; spreading into empty cells is still the flow step's job)
 function level(){const top=1,bot=H-3;for(let y=bot;y>=top;y--){const row=y*W;let x=1;while(x<W-1){const k=row+x;
    if(!wl[k]||tiles[k]||!(tiles[k+W]||wl[k+W]>=8)){x++;continue}
    let e=x,sum=0;while(e<W-1){const q=row+e;if(!wl[q]||tiles[q]||!(tiles[q+W]||wl[q+W]>=8))break;sum+=wl[q];e++}
    const n=e-x;if(n>1){const b=(sum/n)|0;let r=sum-b*n;for(let i=x;i<e;i++){wl[row+i]=b+(r>0?1:0);if(r>0)r--}}x=e}
   // a few blocks poking out of a lake: the liquid joins up underneath them, so both sides share their level (water finds its level)
   for(let x=2;x<W-6;x++){const k=row+x;if(tiles[k]||!tiles[k+1])continue;let e=x+1;while(e<W-1&&e-x<=4&&tiles[row+e])e++;if(e-x>4||tiles[row+e]){x=e-1;continue}
    let ok=true;for(let i=x+1;i<e;i++)if(tiles[row+W+i]||wl[row+W+i]<8){ok=false;break}
    const b=row+e,rest=q=>tiles[q+W]||wl[q+W]>=8;if(ok&&rest(k)&&rest(b)){const d=wl[k]-wl[b];if(d>=2||d<=-2){const m=(d/2)|0;wl[k]-=m;wl[b]+=m}}x=e-1}}}
 // ---- lava creeps: two of every three flow steps are skipped in the Inferno
 let lt=0;{const _sw=stepWater;stepWater=function(){if(INF()&&(lt++%3))return;const r=_sw.apply(this,arguments);try{level()}catch(_){}return r}}
 // ---- molten look (Inferno only): crust plates, a pulsing shine and heat haze over each visible surface tile
 let CR=null,CRP=null,HZ=null,SH=null;
 function mk(){const N=256;CR=document.createElement('canvas');CR.width=CR.height=N;const x=CR.getContext('2d');let s=917;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  // dark cooling plates with glowing cracks between them (tileable: plates wrap around the edges)
  for(let i=0;i<26;i++){const cx=r()*N,cy=r()*N,rw=10+r()*20,rh=6+r()*10,a=r()*Math.PI;for(const ox of[-N,0,N])for(const oy of[-N,0,N]){x.save();x.translate(cx+ox,cy+oy);x.rotate(a);x.fillStyle='rgba(70,16,6,'+(.45+r()*.25)+')';x.beginPath();for(let j=0;j<7;j++){const q=j/7*Math.PI*2,rr=1+(r()-.5)*.35;j?x.lineTo(Math.cos(q)*rw*rr,Math.sin(q)*rh*rr):x.moveTo(Math.cos(q)*rw*rr,Math.sin(q)*rh*rr)}x.closePath();x.fill();
   x.strokeStyle='rgba(255,210,110,.6)';x.lineWidth=1.2;x.stroke();x.restore()}}
  HZ=document.createElement('canvas');HZ.width=64;HZ.height=64;const h=HZ.getContext('2d'),gr=h.createLinearGradient(0,64,0,0);gr.addColorStop(0,'rgba(255,150,60,.55)');gr.addColorStop(.5,'rgba(255,110,40,.16)');gr.addColorStop(1,'rgba(255,90,30,0)');h.fillStyle=gr;h.fillRect(0,0,64,64);
  SH=document.createElement('canvas');SH.width=64;SH.height=16;const sx=SH.getContext('2d'),sg=sx.createLinearGradient(0,0,0,16);sg.addColorStop(0,'rgba(255,240,170,.9)');sg.addColorStop(1,'rgba(255,170,60,0)');sx.fillStyle=sg;sx.fillRect(0,0,64,16)}
 {const _dw=drawWater;drawWater=function(x0,x1,y0,y1,now){const r=_dw.apply(this,arguments);if(!INF())return r;try{molten(x0,x1,y0,y1,now)}catch(e){if(!molten.e){molten.e=1;console.error('LIQ10',e)}}return r}}
 function molten(x0,x1,y0,y1,now){if(!CR)mk();if(!CRP)CRP=g.createPattern(CR,'repeat');const t=now/1000;try{CRP.setTransform(new DOMMatrix([1,0,0,1,-cam.x*.98+t*5,-cam.y+Math.sin(t*.2)*6]))}catch(_){}
  g.save();for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*W+x,v=wl[k];if(!v||tiles[k])continue;const above=y>0&&wl[k-W]>0;if(above)continue;
   const h=v>=8?T:Math.max(4,v/8*T),px=x*T-cam.x,bot=y*T-cam.y+T,py=bot-h+Math.sin(t*1.7+x*.8)*1.4;
   // thin cooling crust just under the surface line
   if(h>8){g.globalAlpha=.5;g.fillStyle=CRP;g.fillRect(px,py+4,T+1,Math.min(h-4,T*.6))}
   // pulsing molten shine on the surface line
   g.globalCompositeOperation='lighter';g.globalAlpha=.6+.2*Math.sin(t*2.3+x*.35);g.drawImage(SH,px-1,py-2,T+2,10);
   // heat haze rising above
   g.globalAlpha=.24+.08*Math.sin(t*1.1+x*.18);g.drawImage(HZ,px-T*.5,py-T*1.2,T*2,T*1.2);g.globalCompositeOperation='source-over';g.globalAlpha=1}
  g.restore()}
 return{level}})();
