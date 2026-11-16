'use strict';
// The Tool Forge, charged by the server (the weapon forge's twin, enhance.js). Using a tool fills its bar; a full bar can be forged to the next level,
// for gems plus the tool's own materials, rarer at every step (common dirt, stone, copper, wood or small fish first; gems, rare ores and dungeon
// materials near the top). The client shows the same table (TFORGE in src/js/late/99-zzzzzzzzzz-zt-toolforge.js); tests/toolforge.js fails if the two differ.
// Gems and materials come off the account's ledger in one step, or not at all. The same request sent twice (a lost answer, a retry) is answered from the
// record and charged once. The first time the server sees a tool it takes the level from the save: levels earned before the forge existed are kept.
const MAX=10,IDS=['pip','pebble','glimmer','twiggy','bubbles'];
// each tool's own material line, common -> legendary
const NAT={pip:[1,8,250,260,265],pebble:[3,77,262,263,264],glimmer:[71,72,73,75,76],twiggy:[5,260,706,261,265],bubbles:[240,242,244,246,248]};
// forging TO a level: [gems, [[tier,count],...] of the tool's own line, [[item,count],...] of shared materials (Monster Core 701, Dungeon Essence 702,
// Tempering Oil 709, Masterwork Component 720)]
const RECIPE={2:[60,[[0,30]],[]],3:[120,[[0,60]],[]],4:[220,[[0,40],[1,10]],[]],5:[350,[[1,20]],[[701,4]]],6:[550,[[1,30],[2,8]],[[701,8]]],
 7:[800,[[2,14]],[[702,3]]],8:[1200,[[2,20],[3,6]],[[702,5]]],9:[1700,[[3,10]],[[702,8],[709,2]]],10:[2500,[[3,16],[4,2]],[[720,1]]]};
// the full price of forging tool id up to level `to`, as [[item,count],...] with item 0 = gems
function cost(id,to){const r=RECIPE[to],nat=NAT[id];if(!r||!nat)return null;const out=[[0,r[0]]];for(const[t,n]of r[1])out.push([nat[t],n]);for(const[i,n]of r[2])out.push([i,n]);
 const m=new Map();for(const[i,n]of out)m.set(i,(m.get(i)||0)+n);return[...m.entries()]}
function forge(u,m,{count,charge,free}){const rid=String(m.rid||'').slice(0,24),id=m.tool,from=m.from;
 if(!rid||!IDS.includes(id)||!Number.isInteger(from)||from<1||from>=MAX)return{ok:0,rid,m:'That forge is not valid'};
 const done=u.toolRid||(u.toolRid={});if(done[rid])return{ok:1,rid,dup:1,tool:done[rid][0],to:done[rid][1]};
 const led=u.tool||(u.tool={}),cur=Number.isInteger(led[id])?led[id]:from;
 if(cur!==from)return{ok:0,rid,tool:id,to:cur,m:'That tool is already level '+cur};
 const list=cost(id,from+1);
 if(!free){for(const[i,n]of list)if(count(u,i)<n)return{ok:0,rid,m:i===0?'The server has you at fewer gems than that. Nothing was spent.':'The server has not seen enough of those materials yet. Nothing was spent.'};charge(u,list,'toolforge')}
 led[id]=from+1;done[rid]=[id,from+1];const ks=Object.keys(done);if(ks.length>40)delete done[ks[0]];return{ok:1,rid,tool:id,to:from+1,spent:list[0][1]}}
module.exports={forge,cost,RECIPE,NAT,IDS,MAX};
