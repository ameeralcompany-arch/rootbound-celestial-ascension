// ===== Small canvases are CPU-backed. Sprites, item icons and thumbnails live on small offscreen canvases; the menus turn icons into
// images (toDataURL), and on GPU-backed canvases every such read waits for the GPU to finish the game's frame (about 40 ms per icon, so a
// first inventory, store or class screen froze the game for 0.5-1 s, worse while uncapped). A 2D canvas of at most 160 x 160 pixels when
// its context is created gets willReadFrequently (CPU-backed) unless the caller chose options itself: drawing it onto the game canvas is
// unchanged (the browser uploads it once and reuses the texture), and reading it back costs about 1 ms. =====
(()=>{const gc=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(t,o){if(t=='2d'&&o==null&&this.width*this.height<=25600&&!this.isConnected)o={willReadFrequently:true};return gc.call(this,t,o)}})();
