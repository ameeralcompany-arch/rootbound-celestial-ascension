// ===== RBART: sprite sheets made outside the game (Blender, tools/blender/render_sheet.py; see docs/blender.md). They sit in assets/sprites/ next to index.html, like the song,
// so they never add to the page. Art is loaded the first time it's asked for and draw() returns false until it's ready, or if it's missing (only index.html was copied, a
// bad connection): the caller keeps drawing what it always drew, so a missing file can never break the game. =====
// RBART.draw(g,'my-object',seconds,x,y,{w:64,fw:128,fh:128,n:24,cols:5,fps:24,flip:false}): x,y = the centre, w = width on screen; the sheet's numbers are in its .json.
const RBART=(()=>{
 const S=new Map();let base='assets/sprites/';
 function get(name){let e=S.get(name);if(e)return e;if(!/^[a-z0-9_-]{1,40}$/.test(name)){e={bad:true};S.set(name,e);return e}e={img:new Image(),ready:false,bad:false};S.set(name,e);e.img.onload=()=>{e.ready=true};e.img.onerror=()=>{e.bad=true};e.img.src=base+name+'.png';return e}
 function draw(g,name,t,x,y,o){const e=get(name);if(!e.ready)return false;const fw=o.fw,fh=o.fh||o.fw,n=o.n||1,cols=o.cols||n,f=o.frame!=null?o.frame%n:Math.floor(Math.max(0,t)*(o.fps||12))%n,w=o.w||fw,h=w*fh/fw;
  const sx=f%cols*fw,sy=Math.floor(f/cols)*fh;if(o.flip){g.save();g.translate(x,y);g.scale(-1,1);g.drawImage(e.img,sx,sy,fw,fh,-w/2,-h/2,w,h);g.restore()}else g.drawImage(e.img,sx,sy,fw,fh,x-w/2,y-h/2,w,h);return true}
 return{draw,load:get,ready:name=>!!get(name).ready,failed:name=>!!get(name).bad,set base(v){base=v},get base(){return base}}})();
