'use strict';
// Durable storage: atomic JSON writes with .bak copies, corrupt-file quarantine, append-only audit log.
const fs=require('fs'),path=require('path');
class Store{
 constructor(dir){this.dir=dir;fs.mkdirSync(path.join(dir,'worlds'),{recursive:true});this.timers=new Map()}
 p(...a){return path.join(this.dir,...a)}
 readJSON(file,def){const tryRead=f=>JSON.parse(fs.readFileSync(f,'utf8'));
  try{return tryRead(file)}catch(e){
   if(e.code=='ENOENT'){if(!fs.existsSync(file+'.bak'))return def}
   else{try{fs.renameSync(file,file+'.corrupt-'+Date.now())}catch(_){}this.audit({ev:'corrupt-file-quarantined',file:path.basename(file)})}
   try{const j=tryRead(file+'.bak');try{fs.copyFileSync(file+'.bak',file)}catch(_){}this.audit({ev:'recovered-from-backup',file:path.basename(file)});return j}catch(_){}
   return def}}
 writeJSON(file,obj){const tmp=file+'.tmp-'+process.pid;fs.writeFileSync(tmp,JSON.stringify(obj));try{if(fs.existsSync(file))fs.copyFileSync(file,file+'.bak')}catch(_){}fs.renameSync(tmp,file)}
 later(key,fn,ms=1500){if(this.timers.has(key))return;this.timers.set(key,setTimeout(()=>{this.timers.delete(key);try{fn()}catch(e){console.error('save failed',key,e.message)}},ms))}
 flush(){for(const[k,t]of this.timers){clearTimeout(t)}const pend=[...this.timers.keys()];this.timers.clear();return pend}
 audit(o){try{const f=this.p('audit.log');try{if(fs.statSync(f).size>1e6)fs.renameSync(f,f+'.1')}catch(_){}fs.appendFileSync(f,JSON.stringify(Object.assign({ts:new Date().toISOString()},o))+'\n')}catch(_){}}
 readAudit(n){try{const l=fs.readFileSync(this.p('audit.log'),'utf8').trim().split('\n');return l.slice(-n).map(x=>{try{return JSON.parse(x)}catch(_){return{raw:x}}})}catch(_){return[]}}
}
module.exports={Store};
