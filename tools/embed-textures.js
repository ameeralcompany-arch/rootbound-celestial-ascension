// Packs the Blender textures (tools/blender/render_textures.py) into src/js/late/00-tex.js, so they travel inside index.html: pictures from a data URL never block the canvas from being read,
// and they are there on every platform with nothing extra to fetch. node tools/embed-textures.js <dir with the .jpg files>
const fs=require('fs'),path=require('path');const dir=process.argv[2];const names=['neb1','neb2','lanes','caustic','folds'];
const parts=names.map(n=>n+":'data:image/jpeg;base64,"+fs.readFileSync(path.join(dir,n+'.jpg')).toString('base64')+"'");
fs.writeFileSync(path.join(__dirname,'..','src','js','late','00-tex.js'),"// ===== TEX15: grey textures rendered in Blender by tools/blender/render_textures.py and packed by tools/embed-textures.js. Generated: don't edit by hand. =====\nconst TEX15=(()=>{const SRC={"+parts.join(',')+"},I={},W=[];let left=0;for(const k in SRC){left++;const m=new Image();m.onload=m.onerror=()=>{if(--left==0)for(const f of W)try{f()}catch(_){}};m.src=SRC[k];I[k]=m}return{I,ok:k=>!!(I[k]&&I[k].complete&&I[k].naturalWidth),whenReady(f){left?W.push(f):f()}}})();\n");
console.log('embedded',names.length);
