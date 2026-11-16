// ===== TIERAURA: a character wearing a legendary, mythic or exclusive look shows it: a few slow glints drift around them in the tier's own colour
// (legendary gold, mythic rose, exclusive prismatic). Three cached sprites per character at most, nothing at all for plain looks; others see it too
// (worn looks travel as cz in presence). Off with reduced motion. =====
try{(()=>{
 const RANK={legendary:1,mythic:2,exclusive:3,relic:3},COL={1:['#ffe9a8','#f0cf83'],2:['#ffd0e0','#ff8fae'],3:['#e8fff8','#7ff5e0']};
 let byOrd=null;const ordMap=()=>{if(byOrd)return byOrd;byOrd=new Map();try{for(const it of SHOP7.items)if(it.cat=='cosmetics'&&it.ord!=null)byOrd.set(it.ord,it.rar)}catch(_){}return byOrd};
 const rarOf=id=>{try{const it=SHOP7.byId.get(id);return it?it.rar:''}catch(_){return''}};
 function best(q){let r=0;try{if(q==='me'){const eq=(typeof COS1!='undefined'&&COS1.eq)||{};for(const s in eq){const v=RANK[rarOf(eq[s])]|0;if(v>r)r=v}}else if(q&&q.cx&&Array.isArray(q.cx.cz)){const m=ordMap();for(const o of q.cx.cz){const v=RANK[m.get(o)]|0;if(v>r)r=v}}}catch(_){}return r}
 const SP={};function glint(rank){if(SP[rank])return SP[rank];const c=document.createElement('canvas');c.width=c.height=24;const x=c.getContext('2d'),[a,b]=COL[rank];const g=x.createRadialGradient(12,12,0,12,12,12);g.addColorStop(0,a);g.addColorStop(.35,b);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.globalAlpha=.55;x.fillRect(0,0,24,24);x.globalAlpha=1;x.fillStyle=a;x.beginPath();for(let i=0;i<8;i++){const ang=i*Math.PI/4,r=i%2?1.4:5.5;x.lineTo(12+Math.cos(ang)*r,12+Math.sin(ang)*r)}x.fill();return SP[rank]=c}
 const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}};
 const _dc=drawChar;drawChar=function(cx,cy){const r=_dc.apply(this,arguments);try{const q=arguments[15],k=best(q);if(!k||reduce())return r;const t=performance.now()/1000,n=k>=2?3:2,sp=glint(k);
   for(let i=0;i<n;i++){const ph=t*(.55+i*.13)+i*2.1,rx=22+i*5,ry=16+i*3,x=cx+Math.cos(ph)*rx,y=cy+24+Math.sin(ph*1.3)*ry-6,a=.35+.4*(.5+.5*Math.sin(t*2.2+i*1.7)),s=k==3?16:13;g.globalAlpha=a;g.drawImage(sp,x-s/2,y-s/2,s,s)}g.globalAlpha=1}catch(_){}return r};
 window.TIERAURA={best};
})()}catch(e){console.error('TIERAURA',e)}
