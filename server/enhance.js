'use strict';
// Weapon enhancement, charged by the server. The client shows the same table (RPG.CFG.enhCost in src/js/late/99-zzzzzzzzz-s0-rpg-core.js); tests/rpg.js fails if the two ever differ.
// Materials and gems come off the account's ledger in one step, or not at all. The same request sent twice (a lost answer, a retry) is answered from the record and charged once.
const MAX=15;
const COST=[
 [100,[3,10]],[250,[3,20]],[450,[3,30]],
 [500,[700,14],[701,8],[703,2]],[800,[700,22],[701,12],[703,5]],[1200,[700,30],[701,16],[704,6]],
 [1700,[701,22],[704,10],[702,3]],[2300,[701,26],[705,12],[702,4]],[3000,[705,14],[706,6],[702,6]],
 [4000,[706,12],[702,8]],[6000,[707,12],[702,10],[709,3]],[8000,[707,16],[708,6]],
 [10000,[708,14],[702,14],[709,4]],[14000,[716,20],[717,6]],[20000,[716,30],[718,8],[719,4],[720,1]]];
const okWeapon=w=>typeof w=='string'&&/^[a-z0-9_]{1,24}$/.test(w);
// count(u,item) reads the ledger (item 0 is gems), charge(u,[[item,n],...],why) takes it off and tells the client. free: the owner in god mode
function upgrade(u,m,{count,charge,free}){const rid=String(m.rid||'').slice(0,24),w=m.wp,from=m.from;if(!rid||!okWeapon(w)||!Number.isInteger(from)||from<0||from>=MAX)return{ok:0,rid,m:'That upgrade is not valid'};
 const done=u.enhRid||(u.enhRid={});if(done[rid])return{ok:1,rid,dup:1,wp:done[rid][0],to:done[rid][1]};
 const led=u.enh||(u.enh={}),cur=Number.isInteger(led[w])?led[w]:from;   // the first time the server sees a weapon it takes the level from the save: older upgrades were paid for long ago
 if(cur!==from)return{ok:0,rid,wp:w,to:cur,m:'That weapon is already +'+cur};
 const c=COST[from],list=[[0,c[0]],...c.slice(1)];
 if(!free){for(const[i,n]of list)if(count(u,i)<n)return{ok:0,rid,m:i===0?'The server has you at fewer gems than that. Nothing was spent.':'The server has not seen enough of those materials yet. Nothing was spent.'};charge(u,list,'forge')}
 led[w]=from+1;done[rid]=[w,from+1];const ks=Object.keys(done);if(ks.length>40)delete done[ks[0]];return{ok:1,rid,wp:w,to:from+1,spent:c[0]}}
module.exports={upgrade,COST,MAX};
