// v9 play update: upserts the new weather machines (obj_85..89) and crop seeds (seed_180..184) from tools/play-v9.json into
// server/catalog.json (idempotent, keeps the compact one-line format). tools/gen-catalog.py reads the same JSON. Usage: node tools/play-catalog.js
const fs=require('fs'),path=require('path');const F=path.join(__dirname,'..','server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8')),V=JSON.parse(fs.readFileSync(path.join(__dirname,'play-v9.json'),'utf8'));
const items=[];
for(const w of V.weather)items.push({id:'obj_'+w.id,cat:'weather',n:w.n,price:w.price,rar:w.rar,stack:1,ref:w.id,lv:w.lv,d:w.d,how:'store',feat:0,new:1});
for(const s of V.seeds)items.push({id:'seed_'+s.id,cat:'seeds',n:s.n,price:s.price,rar:s.rar,stack:1,ref:s.id,lv:s.lv,d:s.d,how:'store',feat:0,new:1});
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(i=>i.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: +'+add+' new, '+upd+' updated, '+j.items.length+' items');
