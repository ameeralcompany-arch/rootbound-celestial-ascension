'use strict';
// Free hosts wipe their disk on every restart, so the data folder is mirrored to a Redis database over its REST API (Upstash's free plan: no card).
// Every saved JSON file is one field of a single hash. At boot the hash is written back to disk before the server reads anything; afterwards
// writes are batched so a busy world costs a few commands a minute (the free plan allows 500,000 a month). Node 18+ global fetch, no dependencies.
const fs=require('fs'),path=require('path');
const KEY='rb:data',DELAY=20000,MAX_BATCH=8e6;
const SAFE=/^([a-z]+\.json|worlds\/[a-z0-9_-]+\.json|profiles\/[A-Za-z0-9_-]+\.json)$/;
class Cloud{
 constructor(url,token,dir,delay){this.url=String(url).replace(/\/+$/,'');this.token=token;this.dir=dir;this.delay=delay==null?DELAY:delay;this.pend=new Map();this.t=null}
 async cmd(a){const r=await fetch(this.url,{method:'POST',headers:{Authorization:'Bearer '+this.token,'Content-Type':'application/json'},body:JSON.stringify(a)});if(!r.ok)throw new Error('cloud store answered '+r.status);const j=await r.json();if(j.error)throw new Error(j.error);return j.result}
 rel(file){return path.relative(this.dir,file).split(path.sep).join('/')}
 // fills the data folder from the database. Throws when the database cannot be read: starting empty would later overwrite everyone's saves.
 async restore(){const a=await this.cmd(['HGETALL',KEY]);let n=0;if(!Array.isArray(a))return 0;fs.mkdirSync(path.join(this.dir,'worlds'),{recursive:true});fs.mkdirSync(path.join(this.dir,'profiles'),{recursive:true});
  for(let i=0;i+1<a.length;i+=2){if(!SAFE.test(a[i]))continue;fs.writeFileSync(path.join(this.dir,...a[i].split('/')),a[i+1]);n++}return n}
 put(file,str){const r=this.rel(file);if(!SAFE.test(r))return;this.pend.set(r,str);this.arm()}
 forget(file){const r=this.rel(file);if(!SAFE.test(r))return;this.pend.set(r,null);this.arm()}
 arm(){if(this.t)return;this.t=setTimeout(()=>{this.t=null;this.flush().catch(e=>console.error('cloud save failed:',e.message))},this.delay);if(this.t.unref)this.t.unref()}
 async flush(){clearTimeout(this.t);this.t=null;if(!this.pend.size)return;const items=[...this.pend];this.pend.clear();
  try{const del=items.filter(x=>x[1]===null).map(x=>x[0]);if(del.length)await this.cmd(['HDEL',KEY,...del]);let b=[],size=0;const go=async()=>{if(b.length)await this.cmd(['HSET',KEY,...b]);b=[];size=0};
   for(const[k,v]of items){if(v===null)continue;if(size+v.length>MAX_BATCH)await go();b.push(k,v);size+=v.length}await go()}
  catch(e){for(const[k,v]of items)if(!this.pend.has(k))this.pend.set(k,v);this.arm();throw e}}}
const fromEnv=(dir,env=process.env)=>{const u=env.UPSTASH_REDIS_REST_URL,t=env.UPSTASH_REDIS_REST_TOKEN;return u&&t?new Cloud(u,t,dir):null};
module.exports={Cloud,fromEnv,KEY};
