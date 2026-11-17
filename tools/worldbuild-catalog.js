// World building: upserts the colour materials, the fixed materials and the decorations into server/catalog.json (idempotent, keeps the
// one-line format). Read straight from the game's own tables (src/js/late/99-zzzzzzz-wb0-mats.js and 99-zzzzzzz-wb2-decor.js) so names,
// prices and descriptions never drift. Common to epic decorations are sold (objects tab, item key 620 + index); legendary, mythic and
// exclusive decorations are patterns: never sold (sale 0), each earned by one building or adventure goal (earn {m, n, t}, checked by the
// server like the exclusive looks). tools/gen-catalog.py does not know these items: run this after it.  Usage: node tools/worldbuild-catalog.js
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..'),F=path.join(ROOT,'server','catalog.json');
const j=JSON.parse(fs.readFileSync(F,'utf8'));
const mats=fs.readFileSync(path.join(ROOT,'src/js/late/99-zzzzzzz-wb0-mats.js'),'utf8'),dec=fs.readFileSync(path.join(ROOT,'src/js/late/99-zzzzzzz-wb2-decor.js'),'utf8');
const items=[];
// paintable materials (keys 900-905), tinted glass 906, glow block 907
let m,re=/\{n:'([^']+)',d:'([^']+)',cat:'(\w+)',p:(\d+),lv:(\d+)/g,i=0;
while((m=re.exec(mats))){items.push({id:'blk_'+(900+i),cat:'blocks',n:m[1],price:+m[4],rar:'common',stack:1,ref:900+i,lv:+m[5],d:m[2]+' Pick from 51 colours while placing.',how:'store',new:1,feat:0});i++}
if(i!==6)throw Error('expected 6 paintable materials, found '+i);
items.push({id:'blk_906',cat:'blocks',n:'Tinted Glass',price:4,rar:'common',stack:1,ref:906,lv:2,d:'Clear glass with a soft colour tint. Pick from 51 colours while placing.',how:'store',new:1,feat:0});
items.push({id:'blk_907',cat:'blocks',n:'Glow Block',price:8,rar:'uncommon',stack:1,ref:907,lv:3,d:'A softly glowing block that lights the area around it. Pick from 51 colours while placing.',how:'store',new:1,feat:0});
// fixed materials (tiles 120-138 = keys 920-938)
re=/\[(1[23]\d),'([^']+)','(#[0-9a-f]{6})',(\d+),(\d+),(\d+),'(\w+)','([^']+)'/g;let nf=0;
while((m=re.exec(mats))){const t=+m[1],p=+m[5];items.push({id:'blk_'+(t+800),cat:'blocks',n:m[2],price:p,rar:p>=12?'rare':p>=7?'uncommon':'common',stack:1,ref:t+800,lv:+m[6],d:m[8],how:'store',new:1,feat:0});nf++}
if(nf!==19)throw Error('expected 19 fixed materials, found '+nf);
// decorations, in catalog order (their index is their number)
const PRICE={common:20,uncommon:45,rare:90,epic:180};
const EARN={moonwell:{m:'place',n:2500,t:'Place 2,500 blocks'},floating_islet:{m:'worlds',n:15,t:'Visit 15 worlds'},glass_swan:{m:'place',n:5000,t:'Place 5,000 blocks'},
 crystal_chandelier:{m:'brk',n:20000,t:'Break 20,000 blocks'},aurora_tree:{m:'place',n:15000,t:'Place 15,000 blocks'},star_carousel:{m:'ach',n:30,t:'Unlock 30 achievements'},comet_egg:{m:'wb',n:3,t:'Defeat 3 world bosses'}};
const LV={common:1,uncommon:2,rare:4,epic:8,legendary:12,mythic:20,exclusive:25};
const segs=dec.split(/\n D\('/).slice(1);let n=0;
for(const s of segs){const h=/^([a-z_]+)','([^']+)','(\w+)','(\w+)'/.exec(s);if(!h)continue;const[,id,name,fam,rar]=h;
 const strs=[...("'"+s).split(/\n (?:\/\/|const |D\()/)[0].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x=>x[1]).filter(x=>/[.!]$/.test(x)&&x.length>12);
 const d=(strs[strs.length-1]||name).replace(/\\u2019/g,'’').replace(/\\u2026/g,'…');
 if(EARN[id])items.push({id:'dec_'+id,cat:'objects',n:name,price:{legendary:600,mythic:1500,exclusive:2400}[rar]||600,rar,stack:0,lv:LV[rar],d:d+' A pattern: place it as often as you like.',how:'earn',sale:0,earn:EARN[id],fam,dec:n});
 else{if(!PRICE[rar])throw Error('no price for '+id+' ('+rar+')');items.push({id:'obj_'+(620+n),cat:'objects',n:name,price:PRICE[rar],rar,stack:1,ref:620+n,lv:LV[rar],d,how:'store',new:1,feat:0,fam,dec:n})}
 n++}
if(n<40)throw Error('too few decorations parsed: '+n);
let add=0,upd=0;for(const it of items){const k=j.items.findIndex(x=>x.id==it.id);if(k<0){j.items.push(it);add++}else{j.items[k]=it;upd++}}
const ids=j.items.map(x=>x.id);if(new Set(ids).size!=ids.length)throw Error('duplicate ids');
fs.writeFileSync(F,JSON.stringify(j));console.log('catalog: '+n+' decorations, '+(6+2+nf)+' materials; +'+add+' new, '+upd+' updated, '+j.items.length+' items');
