// ===== MILE10: everything you do adds up to a reward. Each activity has a ladder of milestones (blocks broken and placed, monsters
// defeated, seeds planted, harvests, fish, worlds visited, hidden letters found, words solved, totems lit, distance walked); every rung
// pays gems and XP through the usual reward card (REW8), sized by your income at your level (ECON14: about 0.6 to 6 minutes of play) so
// rewards stay fair at every level. The common activities start at 10, the rare ones at 1. Counts come from the game's own stats (stat())
// and saves; nothing is paid twice, and on first run the ladders start from where you already are (no flood of old rewards).
// State: RB_PREFIX + 'rbmile' {i:{kind:rungs reached}, walk:tiles}. =====
const MILE10=(()=>{
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbmile';
 const OFTEN=[10,25,50,100,200,350,500,750,1000,1500,2000,3000,4000,5000,7500,10000],RARE=[1,3,5,10,15,25,40,60,100,150,250],WALK=[100,300,600,1000,2000,3500,5000,7500,10000,15000,25000,40000];
 const KINDS={break:['Blocks broken',OFTEN],place:['Blocks placed',OFTEN],kill:['Monsters defeated',OFTEN],plant:['Seeds planted',OFTEN],harvest:['Harvests',OFTEN],fish:['Fish caught',RARE],
  worlds:['Worlds visited',RARE],letters:['Hidden letters found',RARE],words:['Words solved',RARE],totems:['Totems lit',RARE],walk:['Tiles walked',WALK]};
 let S={i:{},walk:0,init:0};try{const o=JSON.parse(localStorage.getItem(K())||'null');if(o&&typeof o=='object'){if(o.i&&typeof o.i=='object')S.i=o.i;S.walk=+o.walk||0;S.init=o.init?1:0}}catch(_){}
 const save=()=>{try{localStorage.setItem(K(),JSON.stringify(S))}catch(_){}};
 const rungAt=(L,n)=>{let r=0;while(r<L.length&&n>=L[r])r++;if(r==L.length){let t=L[L.length-1];while(n>=t*1.5){t=Math.round(t*1.5);r++}}return r};
 const target=(L,r)=>{if(r<L.length)return L[r];let t=L[L.length-1];for(let i=L.length;i<=r;i++)t=Math.round(t*1.5);return t};
 // current counts
 function count(k){try{
  if(k=='walk')return Math.floor(S.walk);
  if(k=='letters'){let n=0;for(const w in WORD9.state.w)n+=(WORD9.state.w[w].got||[]).length;return n}
  if(k=='words'){let n=0;for(const w in WORD9.state.w)if(WORD9.state.w[w].ok)n++;return n}
  if(k=='totems'){let n=0;const st=BIOME17.state.w||{};for(const w in st)n+=Object.keys(st[w].lit||{}).length;return n}
  return (typeof stats!='undefined'&&stats[k])|0}catch(_){return 0}}
 // the reward for a rung: minutes of income at your level (more for later rungs and rare activities), and a slice of a level in XP
 function pay(k,r){const rare=KINDS[k][1]===RARE,L=Math.max(1,lvl|0),inc=(()=>{try{return ECON14.income(L)}catch(_){return 30+4.5*L}})();
  const mins=Math.min(6,(rare?1.4:.6)+r*(rare?.5:.3)),g=Math.max(5,Math.round(inc*mins/5)*5),x=Math.max(5,Math.round(xpNeed(L)*Math.min(.08,.015+r*.005)));
  try{gain(g,P.x,P.y-30)}catch(_){}try{xpGain('misc',x)}catch(_){}
  const nm=KINDS[k][0],reached=target(KINDS[k][1],r),next=target(KINDS[k][1],r+1);
  try{REW8.card({kind:'ach',kick:'Milestone',title:nm+' · '+reached.toLocaleString(),sub:'Next: '+next.toLocaleString(),gems:g,xp:x,tier:Math.min(5,Math.floor(r/3))});REW8.fly(P.x,P.y-20,g)}catch(_){try{say(nm+' '+reached+'! +'+g+' gems')}catch(_){}}}
 function check(k){const L=KINDS[k][1],n=count(k),r=rungAt(L,n),have=S.i[k]|0;if(r>have){S.i[k]=r;save();for(let q=have;q<r&&q<have+2;q++)pay(k,q)}}
 // first run: start every ladder where the player already is
 function init(){if(S.init)return;for(const k in KINDS)S.i[k]=rungAt(KINDS[k][1],count(k));S.init=1;save()}
 // stat() is the game's own counter for most activities
 {const _st=stat;stat=function(k,n){const r=_st.apply(this,arguments);try{if(KINDS[k]&&entered)check(k)}catch(_){}return r}}
 // walking (on the ground or swimming; not flying or falling), letters, words and totems are checked once a second
 let lx=null,acc=0;
 setInterval(()=>{try{if(!entered)return;init();if(lx!=null&&(P.g||P.sw)){const d=Math.abs(P.x-lx)/T;if(d<8)acc+=d}lx=P.x;if(acc>=1){S.walk+=acc;acc=0;check('walk');if(Math.random()<.2)save()}
  check('letters');check('words');check('totems')}catch(_){}},1000);
 addEventListener('beforeunload',save);
 return{KINDS,count,check,get state(){return S},rungAt,target}})();
