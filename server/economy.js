'use strict';
// Items between players. Every account has a server-side bag (u.bag) next to its gem wallet (u.shop). Trades, drops, pickups and the owner's /give
// only ever move what the ledger holds, one side at a time, so a modified client cannot invent items by lying about a trade.
// The server cannot watch mining or monster drops, so a client reports its inventory (bag_sync): decreases count at once, growth is rate-limited,
// the same honest limit the gem wallet has (shop.js). Item 0 means gems throughout. Guests have no ledger: they cannot trade or drop.
const SHOP=require('./shop');
const DG_BURST=600,DG_PER_MIN=40,BURST=2000,PER_MIN=1500,MAXN=99999,MAXKEYS=600,MAX_OFFER=12,MAX_DROPS=80,PICK_DIST=240,ASK_MS=30000;
const okItem=i=>Number.isInteger(i)&&i>=0&&i<=999;
const okN=n=>Number.isInteger(n)&&n>=1&&n<=MAXN;
// gear: weapons and wearables ('w:id', 'a:id') live in a record per account (u.gear.h), store items ('id:x') in the store's own ledger (u.shop.owned). Like the bag, a client reports what it owns:
// losing something counts at once, growth is rate-limited, and something that left this account by a drop or a trade cannot come back by being reported, only by really being received.
// The first report is taken whole, so the record starts from each player's existing save: anything edited into a save before that cannot be told apart.
const GEAR_BURST=60,GEAR_PER_MIN=20,MAXGEAR=1200,DROP_TTL=15*60000;
const okGear=k=>typeof k=='string'&&k.length<=56&&/^(w|a|id):[A-Za-z0-9_-]{1,50}$/.test(k);
const NOGEAR=new Set(['w:fist','w:pip','w:pebble','w:glimmer','w:twiggy','w:bubbles','w:wrench']);
const okDrop=i=>okItem(i)||(okGear(i)&&!NOGEAR.has(i));
function gearOf(u){if(!u.gear||typeof u.gear!='object')u.gear={};const g=u.gear;for(const k of['h','out','mail','dropped'])if(!g[k]||typeof g[k]!='object')g[k]={};if(!Number.isFinite(g.seq))g.seq=0;if(!Number.isFinite(g.allow))g.allow=GEAR_BURST;if(!Number.isFinite(g.t))g.t=Date.now();return g}
const hasGear=(u,k)=>k.startsWith('id:')?(SHOP.ensure(u).owned[k.slice(3)]|0)>0:!!gearOf(u).h[k];
function setGear(u,k,on){if(k.startsWith('id:')){const o=SHOP.ensure(u).owned,id=k.slice(3);if(on)o[id]=1;else delete o[id];return}const g=gearOf(u);if(on)g.h[k]=1;else delete g.h[k]}
function gearSync(u,list,seq,now){const g=gearOf(u);g.over=0;if(seq!==g.seq||!Array.isArray(list))return false;now=now||Date.now();g.allow=Math.min(GEAR_BURST,g.allow+Math.max(0,now-g.t)/60000*GEAR_PER_MIN);g.t=now;
 const want=new Set(list.slice(0,MAXGEAR).filter(k=>okGear(k)&&!NOGEAR.has(k)&&!k.startsWith('id:')));
 for(const k of want){if(g.h[k])continue;if(g.out[k]){g.over++;continue}if(!g.seeded){g.h[k]=1;continue}if(g.allow>=1){g.allow--;g.h[k]=1}else g.over++}
 for(const k of Object.keys(g.h))if(!want.has(k))delete g.h[k];g.seeded=1;return true}
function ensure(u){if(!u.bag||typeof u.bag!='object')u.bag={};const b=u.bag;if(!b.i||typeof b.i!='object')b.i={};if(!Number.isFinite(b.seq))b.seq=0;if(!Number.isFinite(b.allow))b.allow=BURST;if(!Number.isFinite(b.t))b.t=Date.now();if(!b.out||typeof b.out!='object')b.out={};return b}
function count(u,i){return i===0?Math.floor(SHOP.ensure(u).g):(ensure(u).i[i]|0)}
function add(u,i,n){if(i===0){const s=SHOP.ensure(u);s.g=Math.max(0,s.g+n);return}const b=ensure(u),v=(b.i[i]|0)+n;if(v>0)b.i[i]=Math.min(MAXN,v);else delete b.i[i]}
// a client report: ignored when it predates a server-made change (seq), otherwise decreases apply and growth spends the allowance
function sync(u,inv,seq,now){const b=ensure(u);b.over=0;if(seq!==b.seq||!inv||typeof inv!='object')return false;now=now||Date.now();const mins=Math.max(0,now-b.t)/60000;b.allow=Math.min(BURST,b.allow+mins*PER_MIN);b.dgAllow=Math.min(DG_BURST,(Number.isFinite(b.dgAllow)?b.dgAllow:DG_BURST)+mins*DG_PER_MIN);b.t=now;const seen=new Set();let n=0;
 for(const k of Object.keys(inv)){if(++n>MAXKEYS)break;const i=+k,v=inv[k];if(!okItem(i)||i===0||!Number.isInteger(v)||v<0||v>MAXN)continue;seen.add(i);const have=b.i[i]|0;
  if(v>have){const dg=i>=700&&i<=749,inc=Math.min(v-have,Math.floor(dg?b.dgAllow:b.allow));if(inc>0){b.i[i]=have+inc;if(dg)b.dgAllow-=inc;else b.allow-=inc}b.over+=v-have-Math.max(0,inc)}else if(v<have){if(v>0)b.i[i]=v;else delete b.i[i]}}
 for(const k of Object.keys(b.i))if(!seen.has(+k))delete b.i[k];return true}
function cleanDrops(a){return(Array.isArray(a)?a:[]).slice(0,MAX_DROPS).map(d=>d&&okDrop(d.i)&&okN(d.n)&&typeof d.id=='string'&&Number.isFinite(d.x)&&Number.isFinite(d.y)?{id:d.id.slice(0,20),i:d.i,n:d.n,x:d.x,y:d.y,o:typeof d.o=='string'?d.o:'',by:typeof d.by=='string'?d.by.slice(0,14):'',t0:Number.isFinite(d.t0)?d.t0:Date.now()}:null).filter(Boolean)}
// what other players are told about a drop: never the owner's account id
const pubDrop=d=>({id:d.id,i:d.i,n:d.n,x:d.x,y:d.y,by:d.by||'',t0:d.t0||0});
function createEconomy({send,sessions,userById,saveAcc,relay,dropsOf,touchWorld,bucket,audit,rid,loadW,allDrops}){
 const byUid=uid=>{for(const o of sessions.values())if(o.uid==uid&&o.conn&&!o.conn.closed)return o;return null};
 const free=s=>!!s.god;// the owner in god mode has everything: nothing is debited or checked
 // tell the owning client about a change the server made; an offline account gets it at next sign-in
 function deliver(u,delta,why){const b=ensure(u);b.seq++;const o=byUid(u.id);if(o){send(o,{t:'bag',seq:b.seq,d:delta,why});if(delta[0]!=null)send(o,Object.assign({t:'wallet'},SHOP.view(u)))}else for(const k of Object.keys(delta))b.out[k]=(b.out[k]|0)+delta[k];saveAcc()}
 function deliverGear(u,delta,why){const g=gearOf(u);g.seq++;const o=byUid(u.id);if(o){send(o,{t:'gear',seq:g.seq,d:delta,why});if(Object.keys(delta).some(k=>k.startsWith('id:')))send(o,Object.assign({t:'wallet'},SHOP.view(u)))}else for(const k of Object.keys(delta))g.mail[k]=(g.mail[k]|0)+delta[k];saveAcc()}
 // a drop comes home: its time ran out, its world is gone, or the server lost it (the Plaza is held in memory only)
 function giveBack(u,id,why){const g=gearOf(u),e=g.dropped[id];if(!e)return;delete g.dropped[id];if(typeof e.i=='string'){if(!hasGear(u,e.i)){setGear(u,e.i,1);delete g.out[e.i];deliverGear(u,{[e.i]:1},why)}}else{add(u,e.i,e.n);deliver(u,{[e.i]:e.n},why)}saveAcc();audit({ev:'drop_back',uid:u.id,i:e.i,n:e.n,why})}
 function reconcile(u){const g=gearOf(u);for(const id of Object.keys(g.dropped)){const e=g.dropped[id];let a=null;try{a=e.w=='plaza'||loadW(e.w)?dropsOf(e.w):null}catch(_){a=null}if(!a||!a.some(d=>d.id===id))giveBack(u,id,'returned')}}
 function signedIn(s,u){const b=ensure(u),d=b.out;b.out={};send(s,{t:'bag',seq:b.seq,d,why:Object.keys(d).length?'While you were away':undefined});if(Object.keys(d).length)saveAcc();
  const g=gearOf(u),gm=g.mail;g.mail={};send(s,{t:'gear',seq:g.seq,d:gm,why:Object.keys(gm).length?'While you were away':undefined});if(Object.keys(gm).length)saveAcc();reconcile(u)}
 function sweep(now){now=now||Date.now();for(const[w,a]of allDrops()){let ch=false;for(let i=a.length-1;i>=0;i--){const d=a[i];if(now-(d.t0||0)<DROP_TTL)continue;a.splice(i,1);ch=true;relay(w,{t:'dr-',d:{id:d.id,by:''}});const u=d.o?userById(d.o):null;if(u)giveBack(u,d.id,'returned')}if(ch)touchWorld(w)}}
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
   if(!o||o===s||!s.world||o.world!==s.world||o.oInv)return fail('That player is not in this world');if(o.kind=='guest')return fail(o.name+' needs an account to trade');{const ou=userById(o.uid);if(ou&&(ou.blocks||[]).includes(String(s.name).slice(0,14).toLowerCase()))return fail(o.name+' is not taking trade requests')}if(tradeOf.has(o.sid))return fail(o.name+' is busy trading');
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
  const i=m.i,gear=typeof i=='string',n=gear?1:m.n;if(!okDrop(i)||!okN(n))return;if(gear?(!free(s)&&!hasGear(u,i)):(!free(s)&&count(u,i)<n)){send(s,{t:'drop_res',ok:0,i});return fail(gear?'You do not have that item':'You do not have that many')}if(!gear&&i>=731&&i<=749)return fail('Quest items stay with you');if(i===17)return fail('A World Lock can not be dropped');const a=dropsOf(s.world);if(a.length>=MAX_DROPS){send(s,{t:'drop_res',ok:0,i});return fail('Too many items on the ground here')}
  const now=Date.now(),p=s.pres||{},d={id:'d'+(++dropN).toString(36)+rid(),i,n,x:(+p.x||0)+(p.f>0?44:-44),y:+p.y||0,o:free(s)?'':s.uid,by:String(s.name||'').slice(0,14),t0:now};a.push(d);touchWorld(s.world);
  if(!free(s)){const g=gearOf(u);g.dropped[d.id]={i,n,w:s.world,t0:now};if(gear){setGear(u,i,0);g.out[i]=now;deliverGear(u,{[i]:-1},'drop')}else{add(u,i,-n);deliver(u,{[i]:-n},'drop')}}else send(s,{t:'drop_res',ok:1,i});audit({ev:'drop',uid:s.uid,w:s.world,i,n});relay(s.world,{t:'dr+',d:pubDrop(d)})}
 function pickMsg(s,m){if(!s.world||!bucket(s,'pick',30,5000))return;const a=dropsOf(s.world),at=a.findIndex(d=>d.id===m.id);if(at<0)return;const d=a[at],p=s.pres||{};if(Math.hypot((+p.x||0)-d.x,(+p.y||0)-d.y)>PICK_DIST)return;
  const u=s.kind=='guest'?null:userById(s.uid),gear=typeof d.i=='string';if(gear){if(!u)return send(s,{t:'notice',d:{text:'Create an account to pick up gear',by:'Server'}});if(hasGear(u,d.i))return send(s,{t:'notice',d:{text:'You already own one of these',by:'Server'}})}
  a.splice(at,1);touchWorld(s.world);relay(s.world,{t:'dr-',d:{id:d.id,by:s.sid}});if(d.o){const ow=userById(d.o);if(ow){delete gearOf(ow).dropped[d.id];saveAcc()}}audit({ev:'pick',uid:s.uid||'',w:s.world,i:d.i,n:d.n});
  if(gear){setGear(u,d.i,1);delete gearOf(u).out[d.i];deliverGear(u,{[d.i]:1},'pick')}else if(u){add(u,d.i,d.n);deliver(u,{[d.i]:d.n},'pick')}else send(s,{t:'bag',d:{[d.i]:d.n},why:'pick'})}
 function charge(u,list,why){const d={};for(const[i,n]of list){add(u,i,-n);d[i]=(d[i]|0)-n}deliver(u,d,why)}
 return{tradeMsg,dropMsg,pickMsg,leaving,give,signedIn,charge,sweep,sync:(u,m)=>sync(u,m.inv,m.seq),gearSync:(u,m)=>gearSync(u,m.list,m.seq)}}
module.exports={createEconomy,ensure,count,add,sync,cleanDrops,pubDrop,okItem,okN,okGear,gearOf,hasGear,BURST,MAX_DROPS,DROP_TTL,NOGEAR};
