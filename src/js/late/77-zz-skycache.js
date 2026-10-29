// ===== SKYC7: the whole sky (gradient, sun/moon, god rays, parallax mountains/islands/hills, clouds, themed skies, plaza backdrop) is
// painted into an offscreen canvas every 3rd frame and copied to the screen in between. All of it moves slowly (the nearest hills shift
// ~1.5 px between updates while walking, the far layers much less), so 48 sky updates a second at 144 FPS look the same, and the sky was
// the largest per-frame cost (full HD plaza: 90 -> 142 FPS together with the tile cache). =====
const SKYC7=(()=>{
 const c=document.createElement('canvas'),x=c.getContext('2d');let n=0,last='',on=true,every=3;
 const _ds=drawSky;
 drawSky=function(w,hh,now){if(!on)return _ds(w,hh,now);
  const key=w+'x'+hh+'|'+cur+'|'+ZM;let fresh=false;if(key!==last){last=key;fresh=true;if(c.width!=w||c.height!=hh){c.width=w;c.height=hh}}
  if(fresh||(n++%every)==0){const og=g;g=x;try{x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,w,hh);_ds(w,hh,now)}finally{g=og}}
  g.drawImage(c,0,0)};
 return{get on(){return on},set on(v){on=!!v},get every(){return every},set every(v){every=Math.max(1,v|0)}}})();
