// v10 break effects: upserts the buyable block-break effects (fx_brk_*, effect slot 'break') from tools/breakfx-v10.json into
// server/catalog.json (idempotent, keeps the compact one-line format). tools/gen-catalog.py reads the same JSON. Usage: node tools/breakfx-catalog.js
const fs=require('fs'),path=require('path');const F=path.join(__dirname,'..','server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8')),V=JSON.parse(fs.readFileSync(path.join(__dirname,'breakfx-v10.json'),'utf8'));
const items=V.break.map(b=>({id:'fx_brk_'+b.id,cat:'effects',n:b.n,price:b.price,rar:b.rar,stack:0,ref:'brk_'+b.id,lv:0,d:b.d,how:'store',new:1,sub:'break',feat:b.id=='phantom'?1:0}));
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(i=>i.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: +'+add+' new, '+upd+' updated, '+j.items.length+' items');
