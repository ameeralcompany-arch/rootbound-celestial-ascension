// ===== Small canvases are CPU-backed. Sprites, item icons and thumbnails live on small offscreen canvases; the menus turn icons into
// images (toDataURL), and on GPU-backed canvases every such read waits for the GPU to finish the game's frame (about 40 ms per icon, so a
// first inventory, store or class screen froze the game for 0.5-1 s, worse while uncapped). A 2D canvas of at most 160 x 160 pixels when
// its context is created gets willReadFrequently (CPU-backed) unless the caller chose options itself: drawing it onto the game canvas is
// unchanged (the browser uploads it once and reuses the texture), and reading it back costs about 1 ms. =====
(()=>{const gc=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(t,o){if(t=='2d'&&o==null&&this.width*this.height<=25600&&!this.isConnected){o={willReadFrequently:true};this._rbCpu=1}return gc.call(this,t,o)};
 // A repeating pattern is different: every fill with a CPU-backed canvas uploads it again, which took the Inferno's lava from 144 fps down to 12, and
 // the slowdown stayed after leaving the realm. So a pattern is made from a copy of the canvas that lives on the graphics card.
 const cp=CanvasRenderingContext2D.prototype.createPattern;
 CanvasRenderingContext2D.prototype.createPattern=function(im,rep){if(im&&im._rbCpu&&im.width&&im.height){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d',{alpha:true}).drawImage(im,0,0);im=c}return cp.call(this,im,rep)}})();

// The very first pixel read and the very first image encode in a session each cost about half a second while the browser sets them up. Paid here, during
// loading, they are gone before the intro film starts; otherwise they landed on the first weapon or icon drawn, mid-film or just after arriving.
(()=>{try{const t=performance.now(),c=document.createElement('canvas');c.width=c.height=2;const x=c.getContext('2d',{willReadFrequently:true});x.fillRect(0,0,1,1);x.getImageData(0,0,2,2);c.toDataURL();window.RB_WARM=Math.round(performance.now()-t)}catch(_){}})();
