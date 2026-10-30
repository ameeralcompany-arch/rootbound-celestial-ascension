// ===== SKYC7: the whole sky (gradient, sun/moon, god rays, parallax mountains/islands/hills, clouds, themed skies, plaza backdrop) is
// painted into an offscreen canvas every 3rd frame and copied to the screen in between. All of it moves slowly (the nearest hills shift
// ~1.5 px between updates while walking, the far layers much less), so 48 sky updates a second at 144 FPS look the same, and the sky was
// the largest per-frame cost (full HD plaza: 90 -> 142 FPS together with the tile cache).
// The cache is painted at a reduced resolution (SC below: the sky is soft gradients, glows and silhouettes) and smoothly scaled up: each
// repaint frame was over the 144 FPS budget on the GPU at full HD (switching the sky off alone took a busy world from ~122 to 144 FPS).
// Sky code that sets absolute transforms multiplies them by window.SKYS (the current paint scale). =====
const SKYC7=(()=>{
 const c=document.createElement('canvas'),x=c.getContext('2d');let n=0,last='',on=true,every=3;
 const SC={potato:.5,low:.55,med:.6,high:.65,ultra:.7,cine:.7},scale=()=>{try{return SC[QM.cur.id]||.7}catch(_){return .7}};
 const _ds=drawSky;
 drawSky=function(w,hh,now){if(!on)return _ds(w,hh,now);
  const s=scale(),cw=Math.ceil(w*s),ch=Math.ceil(hh*s),key=w+'x'+hh+'|'+cur+'|'+ZM+'|'+s;let fresh=false;if(key!==last){last=key;fresh=true;if(c.width!=cw||c.height!=ch){c.width=cw;c.height=ch}}
  if(fresh||(n++%every)==0){const og=g;g=x;window.SKYS=s;try{x.setTransform(s,0,0,s,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,w,hh);_ds(w,hh,now)}finally{g=og;window.SKYS=1}}
  const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';g.drawImage(c,0,0,w,hh);g.imageSmoothingEnabled=sm};
 return{get on(){return on},set on(v){on=!!v},get every(){return every},set every(v){every=Math.max(1,v|0)},get scale(){return scale()}}})();
