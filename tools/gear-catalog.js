// v8 wardrobe + charms: upserts the items listed in tools/gear-v8.json into server/catalog.json (idempotent; keeps the compact one-line
// format). tools/gen-catalog.py reads the same JSON, so both generators agree. Usage: node tools/gear-catalog.js
const fs=require('fs'),path=require('path');const F=path.join(__dirname,'..','server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8')),V=JSON.parse(fs.readFileSync(path.join(__dirname,'gear-v8.json'),'utf8'));
const items=[];
for(const g of V.gear)items.push({id:'wear_'+g.id,cat:'gear',n:g.n,price:g.price,rar:g.rar,stack:0,ref:g.id,lv:g.lv,d:g.d,how:'store',legacy:1,sub:g.sub,feat:g.feat|0,new:1});
for(const c of V.charms)items.push({id:'charm_'+c.id,cat:'charms',n:c.n,price:c.price,rar:c.rar,stack:0,ref:c.id,lv:0,d:c.d,how:'store',new:1,feat:c.feat|0});
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(i=>i.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: +'+add+' new, '+upd+' updated, '+j.items.length+' items');
