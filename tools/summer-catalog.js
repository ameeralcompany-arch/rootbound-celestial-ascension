// v11 summer objects: upserts the placeable Sun Lounger / Deck Chair / Beach Umbrella / Sandcastle / Beach Ball (obj_90-92, 97, 98; art and
// sitting in src/js/late/92-zz-summer.js) from tools/summer-v11.json into server/catalog.json (idempotent, keeps the compact one-line format).
// tools/gen-catalog.py reads the same JSON. Usage: node tools/summer-catalog.js
const fs=require('fs'),path=require('path');const F=path.join(__dirname,'..','server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8')),V=JSON.parse(fs.readFileSync(path.join(__dirname,'summer-v11.json'),'utf8'));
const items=V.objects.map(o=>({id:'obj_'+o.id,cat:'objects',n:o.n,price:o.price,rar:o.rar,stack:1,ref:o.id,lv:o.lv,d:o.d,how:'store',new:1,feat:0}));
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(i=>i.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: +'+add+' new, '+upd+' updated, '+j.items.length+' items');
