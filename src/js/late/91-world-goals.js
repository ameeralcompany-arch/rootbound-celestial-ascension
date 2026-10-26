// ===== World goals (GOAL7): three real, tracked objectives per world. Progress counts only what you do inside that world. =====
const GOAL7=(()=>{
 const POOL=[['break','Break {n} blocks',[40,80,150],20],['place','Place {n} blocks',[30,60,120],20],['kill','Defeat {n} monsters',[3,6,12],30],['plant','Plant {n} seeds',[3,6,10],20],['harvest','Harvest {n} trees',[2,4,8],25]];
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpgoal';
 let db={};const load=()=>{try{db=JSON.parse(localStorage.getItem(K())||'{}')||{}}catch(_){db={}}};const save=()=>{try{localStorage.setItem(K(),JSON.stringify(db))}catch(_){}};load();
 const hs=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const online=()=>{try{return !!NET7.online}catch(_){return false}};
 function goalsOf(id){const h=hs(String(id)),o=[],used=[];let x=h;while(o.length<3){x=Math.imul(x,1103515245)+12345>>>0;const i=(x>>>8)%POOL.length;if(used.includes(i))continue;used.push(i);const p=POOL[i],tier=o.length==0?0:o.length==1?1:2;const n=p[2][tier===2?(h%2?2:1):tier];o.push({i:o.length,key:p[0],n,text:p[1].replace('{n}',n),gems:p[3]+tier*10})}return o}
 function rec(id){return db[id]||(db[id]={p:{},d:[]})}
 function view(id){const r=db[id]||{p:{},d:[]};return goalsOf(id).map(g=>({...g,v:Math.min(g.n,r.p[g.key]|0),done:r.d.includes(g.i)}))}
 function add(id,k,n){if(!id||!(n>0))return;const gs=goalsOf(id).filter(g=>g.key==k);if(!gs.length)return;const r=rec(id);r.p[k]=(r.p[k]|0)+n;
  for(const g of gs){if(!r.d.includes(g.i)&&r.p[k]>=g.n){r.d.push(g.i);const pay=online()?0:g.gems;if(pay)gems+=pay;try{say('World goal done: '+g.text+(pay?'  +'+pay+' gems':''))}catch(_){}try{UIS.play('buy')}catch(_){}
    if(r.d.length>=3&&!r.all){r.all=1;const b=online()?0:150;if(b)gems+=b;try{say('World mastered: '+(typeof PLN7!='undefined'?PLN7.info(id).label||id:id)+(b?'  +'+b+' gems':''))}catch(_){}}}}
  save()}
 const html=id=>view(id).map(g=>'<div class="gl7'+(g.done?' ok':'')+'"><span>'+(g.done?'✓ ':'')+g.text+'</span><i><b style="width:'+Math.round(g.v/g.n*100)+'%"></b></i><small>'+g.v+' / '+g.n+(online()?'':' · +'+g.gems+' gems')+'</small></div>').join('');
 return{goalsOf,view,add,html,get db(){return db},reload:load}})();
{const _s=stat;stat=function(k,n){const r=_s.apply(this,arguments);try{GOAL7.add(cur,k,n)}catch(_){}return r}}
