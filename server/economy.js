'use strict';
// Items between players. Every account has a server-side bag (u.bag) next to its gem wallet (u.shop). Trades, drops, pickups and the owner's /give
// only ever move what the ledger holds, one side at a time, so a modified client cannot invent items by lying about a trade.
// The server cannot watch mining or monster drops, so a client reports its inventory (bag_sync): decreases count at once, growth is rate-limited,
// the same honest limit the gem wallet has (shop.js). Item 0 means gems throughout. Guests have no ledger: they cannot trade or drop.
const SHOP=require('./shop');
const BURST=2000,PER_MIN=1500,MAXN=99999,MAXKEYS=600,MAX_OFFER=12,MAX_DROPS=80,PICK_DIST=240,ASK_MS=30000;
const okItem=i=>Number.isInteger(i)&&i>=0&&i<=999;
const okN=n=>Number.isInteger(n)&&n>=1&&n<=MAXN;
function ensure(u){if(!u.bag||typeof u.bag!='object')u.bag={};const b=u.bag;if(!b.i||typeof b.i!='object')b.i={};if(!Number.isFinite(b.seq))b.seq=0;if(!Number.isFinite(b.allow))b.allow=BURST;if(!Number.isFinite(b.t))b.t=Date.now();if(!b.out||typeof b.out!='object')b.out={};return b}
function count(u,i){return i===0?Math.floor(SHOP.ensure(u).g):(ensure(u).i[i]|0)}
function add(u,i,n){if(i===0){const s=SHOP.ensure(u);s.g=Math.max(0,s.g+n);return}const b=ensure(u),v=(b.i[i]|0)+n;if(v>0)b.i[i]=Math.min(MAXN,v);else delete b.i[i]}
// a client report: ignored when it predates a server-made change (seq), otherwise decreases apply and growth spends the allowance
function sync(u,inv,seq,now){const b=ensure(u);b.over=0;if(seq!==b.seq||!inv||typeof inv!='object')return false;now=now||Date.now();b.allow=Math.min(BURST,b.allow+Math.max(0,now-b.t)/60000*PER_MIN);b.t=now;const seen=new Set();let n=0;
 for(const k of Object.keys(inv)){if(++n>MAXKEYS)break;const i=+k,v=inv[k];if(!okItem(i)||i===0||!Number.isInteger(v)||v<0||v>MAXN)continue;seen.add(i);const have=b.i[i]|0;
  if(v>have){const inc=Math.min(v-have,Math.floor(b.allow));if(inc>0){b.i[i]=have+inc;b.allow-=inc}b.over+=v-have-Math.max(0,inc)}else if(v<have){if(v>0)b.i[i]=v;else delete b.i[i]}}
 for(const k of Object.keys(b.i))if(!seen.has(+k))delete b.i[k];return true}
function cleanDrops(a){return(Array.isArray(a)?a:[]).slice(0,MAX_DROPS).map(d=>d&&okItem(d.i)&&okN(d.n)&&typeof d.id=='string'&&Number.isFinite(d.x)&&Number.isFinite(d.y)?{id:d.id.slice(0,20),i:d.i,n:d.n,x:d.x,y:d.y}:null).filter(Boolean)}
function createEconomy({send,sessions,userById,saveAcc,relay,dropsOf,touchWorld,bucket,audit,rid}){
 const byUid=uid=>{for(const o of sessions.values())if(o.uid==uid&&o.conn&&!o.conn.closed)return o;return null};
 const free=s=>!!s.god;// the owner in god mode has everything: nothing is debited or checked
 // tell the owning client about a change the server made; an offline account gets it at next sign-in
 function deliver(u,delta,why){const b=ensure(u);b.seq++;const o=byUid(u.id);if(o){send(o,{t:'bag',seq:b.seq,d:delta,why});if(delta[0]!=null)send(o,Object.assign({t:'wallet'},SHOP.view(u)))}else for(const k of Object.keys(delta))b.out[k]=(b.out[k]|0)+delta[k];saveAcc()}
 function signedIn(s,u){const b=ensure(u),d=b.out;b.out={};send(s,{t:'bag',seq:b.seq,d,why:Object.keys(d).length?'While you were away':undefined});if(Object.keys(d).length)saveAcc()}
 // ---- owner gift: credits an account (online or not) or, for a guest, just that session's client
 function give(target,u,i,n){if(u){add(u,i,n);deliver(u,{[i]:n},'gift')}else send(target,{t:'bag',d:{[i]:n},why:'gift'})}
 // ---- trades: ask, accept, both set offers, both lock, both confirm. Any offer change unlocks both sides, so nothing can be swapped after a lock.
 const trades=new Map(),tradeOf=new Map();let tradeN=0;
 const other=(T,s)=>T.a===s?T.b:T.a,side=(T,s)=>T.a===s?T.oa:T.ob;
 function view(T,s){const m=side(T,s),t=side(T,other(T,s));return{t:'trade',op:'state',id:T.id,name:other(T,s).name,me:{it:m.it,lock:m.lock,ok:m.ok},them:{it:t.it,lock:t.lock,ok:t.ok}}}
 const push=T=>{send(T.a,view(T,T.a));send(T.b,view(T,T.b))};
 function end(T,why,done){trades.delete(T.id);if(tradeOf.get(T.a.sid)==T.id)tradeOf.delete(T.a.sid);if(tradeOf.get(T.b.sid)==T.id)tradeOf.delete(T.b.sid);clearTimeout(T.timer);for(const s of[T.a,T.b])send(s,{t:'trade',op:'closed',id:T.id,why,done:done?1:0})}
 const cleanIt=it=>{const m=new Map();for(const x of Array.isArray(it)?it.slice(0,MAX_OFFER):[]){if(!Array.isArray(x)||!okItem(x[0])||!okN(x[1]))return null;m.set(x[0],Math.min(MAXN,(m.get(x[0])||0)+x[1]))}return[...m.entries()]};
 const covers=(s,u,it)=>free(s)||it.every(([i,n])=>count(u,i)>=n);
 const seed=x=>Array.isArray(x)&&okItem(x[0])&&okN(x[1])?[x[0],x[1]]:null;
 function swap(T){const A=userById(T.a.uid),B=userById(T.b.uid);if(!A||!B)return end(T,'A player is unavailable');
  if(!covers(T.a,A,T.oa.it)||!covers(T.b,B,T.ob.it)){T.oa.lock=T.ob.lock=T.oa.ok=T.ob.ok=0;for(const s of[T.a,T.b])send(s,{t:'trade',op:'err',m:'Someone no longer has those items. Offers unlocked.'});return push(T)}
  const da={},db={};const move=(from,fs,to,it,df,dt)=>{for(const[i,n]of it){if(!free(fs))add(from,i,-n);add(to,i,n);df[i]=(df[i]|0)-n;dt[i]=(dt[i]|0)+n}};
  move(A,T.a,B,T.oa.it,da,db);move(B,T.b,A,T.ob.it,db,da);audit({ev:'trade',a:A.id,b:B.id,ga:T.oa.it,gb:T.ob.it});end(T,'',true);deliver(A,da,'trade');deliver(B,db,'trade')}
 function tradeMsg(s,m){const fail=x=>send(s,{t:'trade',op:'err',m:x});const op=String(m.op||'');
  if(s.kind=='guest')return fail('Create an account to trade');const u=userById(s.uid);if(!u)return;
  if(op=='ask'){if(!bucket(s,'tradeask',6,20000))return fail('Slow down');if(tradeOf.has(s.sid))return fail('Finish your current trade first');const o=sessions.get(String(m.to||''));
   if(!o||o===s||!s.world||o.world!==s.world)return fail('That player is not in this world');if(o.kind=='guest')return fail(o.name+' needs an account to trade');if(tradeOf.has(o.sid))return fail(o.name+' is busy trading');
   const give=seed(m.give),want=seed(m.want);if(give&&!covers(s,u,[give]))return fail('You do not have that many');
   const T={id:'t'+(++tradeN).toString(36)+rid(),a:s,b:o,on:0,oa:{it:give?[give]:[],lock:0,ok:0},ob:{it:[],lock:0,ok:0},want};trades.set(T.id,T);tradeOf.set(s.sid,T.id);tradeOf.set(o.sid,T.id);
   T.timer=setTimeout(()=>{if(trades.has(T.id)&&!T.on)end(T,'The request timed out')},ASK_MS);if(T.timer.unref)T.timer.unref();
   send(s,{t:'trade',op:'asked',id:T.id,name:o.name});send(o,{t:'trade',op:'ask',id:T.id,name:s.name,give,want});return}
  const T=trades.get(tradeOf.get(s.sid));if(!T||(m.id&&m.id!==T.id))return fail('That trade is over');
  if(op=='cancel')return end(T,s.name+' cancelled the trade');
  if(op=='accept'){if(s!==T.b||T.on)return;T.on=1;clearTimeout(T.timer);if(T.want&&count(u,T.want[0])>=T.want[1])T.ob.it=[T.want];return push(T)}
  if(!T.on)return fail('Waiting for the other player');const me=side(T,s),th=side(T,other(T,s));
  if(op=='set'){if(!bucket(s,'tradeset',30,10000))return;const it=cleanIt(m.it);if(!it)return fail('Those items are not valid');if(!covers(s,u,it))return fail('You do not have that many');me.it=it;me.lock=me.ok=th.lock=th.ok=0;return push(T)}
  if(op=='lock'){me.lock=m.on?1:0;me.ok=0;th.ok=0;return push(T)}
  if(op=='confirm'){if(!me.lock||!th.lock)return fail('Both players must lock their offers first');me.ok=1;if(th.ok)return swap(T);return push(T)}}
 function leaving(s){const T=trades.get(tradeOf.get(s.sid));if(T)end(T,s.name+' left')}
 // ---- world drops: the server holds them, first player to reach one gets it
 let dropN=0;
 function dropMsg(s,m){if(!s.world)return;const fail=x=>send(s,{t:'notice',d:{text:x,by:'Server'}});if(s.kind=='guest')return fail('Create an account to drop items');const u=userById(s.uid);if(!u||!bucket(s,'drop',10,10000))return;
  const i=m.i,n=m.n;if(!okItem(i)||!okN(n))return;if(!free(s)&&count(u,i)<n)return fail('You do not have that many');const a=dropsOf(s.world);if(a.length>=MAX_DROPS)return fail('Too many items on the ground here');
  const p=s.pres||{},d={id:'d'+(++dropN).toString(36)+rid(),i,n,x:(+p.x||0)+(p.f>0?44:-44),y:+p.y||0};a.push(d);touchWorld(s.world);if(!free(s)){add(u,i,-n);deliver(u,{[i]:-n},'drop')}audit({ev:'drop',uid:s.uid,w:s.world,i,n});relay(s.world,{t:'dr+',d})}
 function pickMsg(s,m){if(!s.world||!bucket(s,'pick',30,5000))return;const a=dropsOf(s.world),at=a.findIndex(d=>d.id===m.id);if(at<0)return;const d=a[at],p=s.pres||{};if(Math.hypot((+p.x||0)-d.x,(+p.y||0)-d.y)>PICK_DIST)return;
  a.splice(at,1);touchWorld(s.world);relay(s.world,{t:'dr-',d:{id:d.id,by:s.sid}});const u=s.kind=='guest'?null:userById(s.uid);if(u){add(u,d.i,d.n);deliver(u,{[d.i]:d.n},'pick')}else send(s,{t:'bag',d:{[d.i]:d.n},why:'pick'})}
 return{tradeMsg,dropMsg,pickMsg,leaving,give,signedIn,sync:(u,m)=>sync(u,m.inv,m.seq)}}
module.exports={createEconomy,ensure,count,add,sync,cleanDrops,okItem,okN,BURST,MAX_DROPS};
