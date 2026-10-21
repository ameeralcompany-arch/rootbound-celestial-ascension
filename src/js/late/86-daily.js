// ===== V6 daily challenges (3 per local day, streak bonus). State lives in legacy `dly`, saved with the profile. =====
const DAILY6=(()=>{
 const POOL=[['break','Break {n} blocks',[60,140],'break'],['kill','Defeat {n} monsters',[8,20],'kill'],['place','Place {n} blocks',[50,120],'place'],['gems','Earn {n} gems',[250,700],'gems'],['harvest','Harvest {n} trees',[6,14],'harvest'],['plant','Plant {n} seeds',[8,20],'plant']];
 const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const yest=()=>{const d=new Date(Date.now()-864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const sr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 function roll(){const day=today();if(dly.day==day&&dly.tasks.length)return;if(dly.last!=yest()&&dly.last!=day)dly.streak=0;const seed=[...day].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7),r=sr(seed),ids=POOL.map((_,i)=>i).sort(()=>r()-.5).slice(0,3);
  dly.day=day;dly.tasks=ids.map(i=>{const p=POOL[i],need=Math.round((p[2][0]+r()*(p[2][1]-p[2][0]))/5)*5||p[2][0];return{id:p[0],need,base:stats[p[3]]|0,done:0,claimed:0,g:Math.round(need*(p[0]=='gems'?.25:p[0]=='kill'?9:p[0]=='harvest'?14:1.4)+60),x:Math.round(80+lvl*6)}});try{saveP()}catch(_){}}
 const prog=t=>{const p=POOL.find(q=>q[0]==t.id);return Math.min(t.need,Math.max(0,(stats[p[3]]|0)-t.base))};
 const label=t=>POOL.find(q=>q[0]==t.id)[1].replace('{n}',t.need);
 function claim(i){const t=dly.tasks[i];if(!t||t.claimed||prog(t)<t.need)return;t.claimed=1;t.done=1;const bonus=1+Math.min(.5,dly.streak*.1);gems+=Math.round(t.g*bonus);stat('gems',Math.round(t.g*bonus));xpGain('fight',Math.round(t.x*bonus));VFX.levelUp(P.x,P.y,'#9fe0ff');snd(880,.3,'triangle');
  if(dly.tasks.every(x=>x.claimed)&&dly.last!=dly.day){dly.last=dly.day;dly.streak++;gems+=100*Math.min(5,dly.streak);UI6.say6('DAILY COMPLETE','STREAK '+dly.streak+' - +'+100*Math.min(5,dly.streak)+' GEMS',3400)}try{saveP()}catch(_){}}
 let tm=0;return{roll,prog,label,claim,tick(dt){tm-=dt;if(tm<=0){tm=15;if(entered)roll()}},today}})();
