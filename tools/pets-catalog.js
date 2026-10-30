// v11 pets: upserts the adoptable pets (pet_*), pet clothes (petc_*) and pet care items (Pet Home / Pet Food / Pet Treat, stackable, inventory
// keys 610-612) from tools/pets-v11.json into server/catalog.json, store category 'pets' (idempotent, keeps the compact one-line format).
// tools/gen-catalog.py reads the same JSON. Usage: node tools/pets-catalog.js
const fs=require('fs'),path=require('path');const F=path.join(__dirname,'..','server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8')),V=JSON.parse(fs.readFileSync(path.join(__dirname,'pets-v11.json'),'utf8'));
const items=[];
for(const p of V.pets)items.push({id:'pet_'+p.id,cat:'pets',n:p.n,price:p.price,rar:p.rar,stack:0,ref:p.id,lv:0,d:p.d,how:'store',new:1,sub:'pet',feat:p.id=='fox'?1:0});
for(const c of V.clothes)items.push({id:'petc_'+c.id,cat:'pets',n:c.n,price:c.price,rar:c.rar,stack:0,ref:c.id,lv:0,d:c.d,how:'store',new:1,sub:'clothes',feat:0});
for(const c of V.care)items.push({id:c.id,cat:'pets',n:c.n,price:c.price,rar:c.rar,stack:1,ref:c.ref,lv:0,d:c.d,how:'store',new:1,sub:'care',feat:0});
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(i=>i.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: +'+add+' new, '+upd+' updated, '+j.items.length+' items');
