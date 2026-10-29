// v9 ascended wings: upserts the eight new gem-store wings listed in tools/wings-v9.json into server/catalog.json (idempotent; keeps
// the compact one-line format). tools/gen-catalog.py reads the same JSON, so both generators agree. Usage: node tools/wings-catalog.js
const fs=require('fs'),path=require('path');const F=path.join(__dirname,'..','server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8')),V=JSON.parse(fs.readFileSync(path.join(__dirname,'wings-v9.json'),'utf8'));
const items=V.wings.map(w=>({id:'wing_'+w.id,cat:'wings',n:w.n,price:w.price,rar:w.rar,stack:0,ref:w.id,lv:w.lv,d:w.d,how:'store',new:1,excl:false,feat:w.feat|0}));
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(i=>i.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: +'+add+' new, '+upd+' updated, '+j.items.length+' items');
