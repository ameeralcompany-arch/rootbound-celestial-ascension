'use strict';
// Server-side store rules: catalog (prices/rarity/stackability), per-account wallet + ownership, idempotent purchases.
// The client may display anything it likes; the server only trusts catalog.json, its own wallet and its own ownership record.
const fs=require('fs'),path=require('path');
function loadCatalog(file){const j=JSON.parse(fs.readFileSync(file||path.join(__dirname,'catalog.json'),'utf8'));const m=new Map();for(const it of j.items){if(m.has(it.id))throw Error('duplicate catalog id '+it.id);m.set(it.id,it)}return m}
const BURST=1500,PER_MIN=600,MAX_GEMS=1e7;
function ensure(u){if(!u.shop||typeof u.shop!='object')u.shop={};const s=u.shop;
 if(!Number.isFinite(s.g)||s.g<0)s.g=0;if(!Number.isFinite(s.allow))s.allow=BURST;if(!Number.isFinite(s.t))s.t=Date.now();
 if(!s.owned||typeof s.owned!='object')s.owned={};if(!s.rids||typeof s.rids!='object')s.rids={};return s}
function view(u){const s=ensure(u);return{gems:Math.floor(s.g),owned:s.owned}}
// The server cannot watch gameplay, so gem *growth* is rate-limited (burst + per minute). Spending always goes through buy().
function sync(u,gems,now){const s=ensure(u);now=now||Date.now();s.allow=Math.min(BURST,s.allow+Math.max(0,now-s.t)/60000*PER_MIN);s.t=now;gems=Math.floor(+gems);if(!Number.isFinite(gems)||gems<0||gems>MAX_GEMS)return view(u);
 if(gems>s.g){const inc=Math.min(gems-s.g,Math.floor(s.allow));s.g+=inc;s.allow-=inc}else s.g=gems;return view(u)}
function buy(u,cat,m,now){const s=ensure(u);const rid=String(m.rid||'').slice(0,40);
 if(!rid)return{ok:0,m:'Missing request id'};
 if(s.rids[rid])return Object.assign({},s.rids[rid],{dup:1});
 const it=cat.get(String(m.id||''));const fail=msg=>({ok:0,m:msg,rid,gems:Math.floor(s.g)});
 if(!it)return fail('That item does not exist');
 let qty=it.stack?Math.floor(+m.qty||1):1;if(!(qty>=1&&qty<=99))return fail('Invalid quantity');
 if(!it.stack&&s.owned[it.id])return fail('You already own this');
 const total=it.price*qty;if(!(total>0)||total>MAX_GEMS)return fail('Invalid price');
 if(s.g<total)return fail('Not enough gems ('+total+' needed)');
 s.g-=total;s.owned[it.id]=(s.owned[it.id]|0)+qty;
 const res={ok:1,rid,id:it.id,qty,spent:total,gems:Math.floor(s.g),owned:s.owned[it.id]};
 s.rids[rid]=res;const keys=Object.keys(s.rids);if(keys.length>40)for(const k of keys.slice(0,keys.length-40))delete s.rids[k];return res}
module.exports={loadCatalog,ensure,view,sync,buy,BURST,PER_MIN};
