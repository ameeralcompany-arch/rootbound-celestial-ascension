// ===== PATH1: the First Realm road. Three fixed lands, chosen from the Worlds page (World Gate > Travel), each opened by finishing the questline of the one before:
//   Sunroot Vale (world 'rootbound', the story's first world), Gloamglass Reach ('biome-reach'), the Starfall Wastes ('biome-wastes').
// A questline is a short ordered list of real things done in that land, read from the game's own counter (stat() is wrapped), its visits and its depth trial (BIOME17).
// One lock, three places: enterWorld refuses, loadWorld redirects (the only route that reaches every entry) and a summon stops (75-net.js). Any realm of a locked land is
// locked with it. Server limit: the server has no knowledge of quests, so a modified client could walk in; rewards are small and nothing else depends on it.
// Lands 2 and 3 are the normal generator with its surface re-dressed from BIOME17's own tiles, so no new tile ids, and worlds stay deterministic for online edits.
// State: RB_PREFIX+'rbpath' {q:[{s:step,n:count,done:time},...]} (synced by ACCT13 like every rb* key). =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbpath';
 const B=[
  {id:'vale',w:'rootbound',n:'Sunroot Vale',c:'#9be37a',d:'Golden meadows where the first roots woke. Gentle ground, and the best place to learn.',find:'Open fields, old trees and the first of the depths below.',g:6,x:.1,
   q:[{t:'Arrive in Sunroot Vale',k:'visit'},{t:'Break blocks',k:'stat',s:'break',n:20},{t:'Plant seeds',k:'stat',s:'plant',n:3},{t:'Place blocks',k:'stat',s:'place',n:10},{t:'Defeat monsters',k:'stat',s:'kill',n:10}]},
  {id:'reach',w:'biome-reach',n:'Gloamglass Reach',c:'#b48cff',d:'A land stuck at dusk, its hills grown through with violet glass.',find:'Glass spires, new monsters and a depth trial under the hills.',g:10,x:.15,rock:219,soil:219,acc:220,mob:3,
   q:[{t:'Arrive in Gloamglass Reach',k:'visit'},{t:'Break blocks',k:'stat',s:'break',n:30},{t:'Defeat monsters',k:'stat',s:'kill',n:15},{t:'Finish the first depth trial',k:'trial'}]},
  {id:'wastes',w:'biome-wastes',n:'Starfall Wastes',c:'#ff9a4a',d:'Burnt plains under a sky that is still falling. Craters, basalt and ember.',find:'Meteor craters, the hardest monsters of the road and the way onward.',g:16,x:.2,rock:225,soil:226,acc:226,mob:5,
   q:[{t:'Arrive in the Starfall Wastes',k:'visit'},{t:'Defeat monsters',k:'stat',s:'kill',n:25},{t:'Break blocks',k:'stat',s:'break',n:40},{t:'Finish the first depth trial',k:'trial'}]}];
 const fresh=()=>({q:B.map(()=>({s:0,n:0}))});
 let S=fresh();try{const o=JSON.parse(localStorage.getItem(KEY())||'null');if(o&&Array.isArray(o.q))B.forEach((_,i)=>{const v=o.q[i];if(v)S.q[i]={s:Math.max(0,Math.min(B[i].q.length,v.s|0)),n:Math.max(0,v.n|0),done:v.done||undefined}})}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const god=()=>{try{return !!(typeof RB_CREATIVE!='undefined'&&RB_CREATIVE)||!!CRV8.on}catch(_){return false}};
 const norm=n=>String(n||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);
 const done=i=>!!S.q[i].done,open=i=>i==0||done(i-1);
 // a land's own name, or any realm built on it
 const names=B.map(b=>{const a=[b.w];try{for(let s=1;s<5;s++)a.push(WORD9.stName(b.w,s))}catch(_){}return a});
 const landOf=n=>{n=norm(n);for(let i=0;i<B.length;i++)if(names[i].includes(n))return i;return -1};
 const locked=n=>{const i=landOf(n);return i>0&&!open(i)&&!god()};
 const here=()=>{try{const c=typeof cur!='undefined'?cur:'';for(let i=0;i<B.length;i++)if(B[i].w==c)return i}catch(_){}return -1};
 const inRun=()=>{try{return !!(window.DG&&DG.run)}catch(_){return false}};
 const income=L=>{try{return ECON14.income(L)}catch(_){return 30+4.5*Math.max(1,L)}};
 const rewardOf=i=>{const L=Math.max(1,typeof lvl!='undefined'?lvl|0:1);return{g:Math.round(B[i].g*income(L)),x:Math.round(B[i].x*xpNeed(L))}};
 const tone=(a,b,d,t,v,dl)=>{try{SFX7.tone(a,b,d,t,v,dl)}catch(_){}};
 const why=i=>'Complete the '+B[i-1].n+' questline to open '+B[i].n;
 function refuse(n){const i=landOf(n);try{say(why(i));UI6.say6(B[i].n.toUpperCase()+' IS LOCKED',why(i),3000);tone(220,150,.25,'triangle',.05)}catch(_){}}
 // ---- questlines
 function step(i){const q=S.q[i],st=B[i].q[q.s];return st||null}
 function advance(i){const b=B[i],q=S.q[i],st=step(i);q.s++;q.n=0;
  if(q.s>=b.q.length){q.done=Date.now();save();finish(i)}else{save();try{say(b.n+': '+st.t+' done');tone(660,880,.16,'triangle',.05)}catch(_){}}paint()}
 function finish(i){const r=rewardOf(i);try{gems+=r.g;stat('gems',r.g);xpGain('fight',r.x);say(B[i].n+' questline complete  +'+r.g+' gems')}catch(_){}
  if(B[i+1])reveal(i+1);else try{UI6.say6('THE FIRST REALM IS YOURS','All three lands walked. The realms beyond are waiting.',4200);for(let k=0;k<4;k++)tone(523*Math.pow(1.26,k),523*Math.pow(1.26,k),.3,'triangle',.05,k*.12)}catch(_){}}
 {const s0=stat;stat=function(k,n){const r=s0.apply(this,arguments);try{if(n>0){const i=here();if(i>=0&&open(i)&&!done(i)&&!inRun()&&!god()){const st=step(i);if(st&&st.k=='stat'&&st.s==k){S.q[i].n+=n;if(S.q[i].n>=st.n)advance(i);else{save();paint()}}}}}catch(e){console.error('PATH1 stat',e)}return r}}
 setInterval(()=>{try{const i=here();if(i<0||!open(i)||done(i)||inRun()||god()||(typeof entered!='undefined'&&!entered))return;const st=step(i);if(!st)return;if(st.k=='visit')advance(i);else if(st.k=='trial'&&BIOME17.prog(0).done)advance(i)}catch(_){}},1000);
 // ---- the locks
 {const _ev=enterWorld;enterWorld=function(n){if(locked(n)&&(typeof entered=='undefined'||entered)){refuse(n);return}return _ev.apply(this,arguments)}}
 {const _lw=loadWorld;loadWorld=function(n,e){let shut=-1;if(locked(n)){shut=landOf(n);n='plaza';e=undefined}const r=_lw.call(this,n,e);if(shut>=0)setTimeout(()=>refuse(B[shut].w),60);try{const i=here();if(i>=0){const el=document.getElementById('wname');if(el)el.textContent=B[i].n;const w0=cur;setTimeout(()=>{try{if(cur==w0&&!inRun())UI6.say6(B[i].n.toUpperCase(),B[i].d,3000)}catch(_){}},420)}}catch(err){console.error('PATH1 load',err)}return r}}
 // ---- lands 2 and 3: the same generator, re-dressed. Deterministic from the name, run before any saved edits are laid over it
 const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 function setT(x,y,t){const k=y*W+x;tiles[k]=t;hp[k]=t?BLK[t][2]:0}
 function reshape(i){const b=B[i],Rg=rr(h32(b.w)),ri=(a,c)=>a+Math.floor(Rg()*(c-a+1));trees.clear();
  for(let x=1;x<W-1;x++){let top=2;while(top<H-3&&![1,2,3,8].includes(tiles[top*W+x]))top++;for(let y=top;y<Math.min(H-3,top+13);y++){const t=tiles[y*W+x];if(t==1||t==2||t==8)setT(x,y,b.soil);else if(t==3)setT(x,y,b.rock)}}
  const mid=W>>1,clear=x=>Math.abs(x-mid)<9;
  if(i==1){for(let x=6;x<W-6;x+=ri(7,16)){if(clear(x)||wl[sh(x)*W+x])continue;const tall=ri(3,8),hw=ri(0,1);for(let dx=-hw;dx<=hw;dx++){const top=sh(x+dx)-1,n=tall-Math.abs(dx)*2;for(let y=0;y<n&&top-y>2;y++)setT(x+dx,top-y,y>=n-2?b.acc:b.rock)}}}
  else{for(let x=14;x<W-14;x+=ri(26,46)){if(clear(x))continue;const r=ri(4,7);for(let dx=-r;dx<=r;dx++){const d=Math.round((1-(dx*dx)/(r*r))*3.4),h=sh(x+dx);for(let y=h;y<h+d&&y<H-4;y++){if(tiles[y*W+x+dx])setT(x+dx,y,0)}if(d>0&&h+d<H-4)setT(x+dx,h+d,b.acc)}}
   for(let x=9;x<W-9;x+=ri(17,31)){if(clear(x))continue;const top=sh(x)-1,n=ri(3,9);for(let y=0;y<n&&top-y>2;y++){setT(x,top-y,b.rock);if(y<n/2&&Rg()<.5)setT(x+(Rg()<.5?-1:1),top-y,b.rock)}}}}
 {const _g=gen;gen=function(){const r=_g.apply(this,arguments);try{const i=here();if(i>0)reshape(i)}catch(e){console.error('PATH1 shape',e)}return r}}
 // monsters of the land roam its surface
 {const _pm=pickMob;pickMob=function(dp){try{const i=here();if(i>0&&dp<6&&!god()&&Math.random()<.7){const m=BIOME17.BI[B[i].mob].mob;return m[Math.random()<.6?0:1][0]}}catch(_){}return _pm.apply(this,arguments)}}
 // ---- art: one painter per land, used for the road's cards, the unlock and the land's own sky
 const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const grad=(x,h,a)=>{const g=x.createLinearGradient(0,0,0,h);a.forEach((c,i)=>g.addColorStop(i/(a.length-1),c));return g};
 const ridge=(x,w,h,base,amp,col,seed,jag)=>{const R=rr(seed);x.fillStyle=col;x.beginPath();x.moveTo(0,h);let px=0;x.lineTo(0,base);while(px<w){px+=jag?10+R()*26:22+R()*30;x.lineTo(px,base-(jag?R()*R():Math.sin(px*.012+seed)*.5+.5)*amp-(jag&&R()<.2?amp*.5:0))}x.lineTo(w,h);x.closePath();x.fill()};
 function sky(i,x,w,h){const R=rr(77+i*31);
  if(i==0){x.fillStyle=grad(x,h,['#7fb8e8','#f7d9a4','#ffc98a']);x.fillRect(0,0,w,h);const g=x.createRadialGradient(w*.72,h*.42,4,w*.72,h*.42,h*.8);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.12,'rgba(255,236,170,.85)');g.addColorStop(1,'rgba(255,220,150,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}
  else if(i==1){x.fillStyle=grad(x,h,['#120a33','#3a2070','#a0509a','#f0a48c']);x.fillRect(0,0,w,h);for(let k=0;k<90;k++){x.fillStyle='rgba(255,240,255,'+(.2+R()*.7)+')';const s=R()<.1?2:1;x.fillRect(R()*w,R()*h*.55,s,s)}const mx=w*.3,my=h*.28,r=h*.13;const g=x.createRadialGradient(mx,my,r*.6,mx,my,r*3);g.addColorStop(0,'rgba(220,200,255,.5)');g.addColorStop(1,'rgba(220,200,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#efe6ff';x.beginPath();x.arc(mx,my,r,0,7);x.fill();x.fillStyle='#2a1658';x.globalAlpha=.32;x.beginPath();x.arc(mx+r*.4,my-r*.12,r*.92,0,7);x.fill();x.globalAlpha=1}
  else{x.fillStyle=grad(x,h,['#06040f','#160a26','#4a1a24','#c0562a']);x.fillRect(0,0,w,h);for(let k=0;k<150;k++){x.fillStyle='rgba(255,240,220,'+(.2+R()*.8)+')';const s=R()<.12?2:1;x.fillRect(R()*w,R()*h*.7,s,s)}x.lineCap='round';for(let k=0;k<7;k++){const a=R()*w*.9+w*.1,b=R()*h*.45,l=30+R()*90,g=x.createLinearGradient(a,b,a-l,b-l*.6);g.addColorStop(0,'rgba(255,214,150,.95)');g.addColorStop(1,'rgba(255,120,60,0)');x.strokeStyle=g;x.lineWidth=1+R()*2;x.beginPath();x.moveTo(a,b);x.lineTo(a-l,b-l*.6);x.stroke()}}}
 function land(i,x,w,h){if(i==0){ridge(x,w,h,h*.72,h*.2,'#8fbf7a',11);ridge(x,w,h,h*.82,h*.16,'#5f9e58',23);x.fillStyle='#2f5a32';x.beginPath();x.moveTo(w*.2,h);x.quadraticCurveTo(w*.205,h*.62,w*.17,h*.5);x.lineTo(w*.235,h*.5);x.quadraticCurveTo(w*.222,h*.66,w*.26,h);x.fill();x.fillStyle='#3f7d3e';for(const[a,b,r]of[[.2,.42,.16],[.13,.5,.11],[.28,.5,.12]]){x.beginPath();x.arc(w*a,h*b,h*r,0,7);x.fill()}ridge(x,w,h,h*.93,h*.09,'#3d7a3f',37)}
  else if(i==1){ridge(x,w,h,h*.8,h*.42,'#3a2570',41,1);ridge(x,w,h,h*.9,h*.34,'#23164c',53,1);const R=rr(9);for(let k=0;k<9;k++){const a=R()*w,c=h*(.86+R()*.1),t=h*(.3+R()*.28),s=7+R()*12,g=x.createLinearGradient(a,c-t,a,c);g.addColorStop(0,'#e8d4ff');g.addColorStop(1,'#6a3fc0');x.fillStyle=g;x.beginPath();x.moveTo(a-s,c);x.lineTo(a-s*.2,c-t);x.lineTo(a+s,c);x.fill()}ridge(x,w,h,h*.98,h*.08,'#120a30',67)}
  else{ridge(x,w,h,h*.84,h*.3,'#3a1a22',71,1);ridge(x,w,h,h*.93,h*.26,'#1f0e16',83,1);const g=x.createRadialGradient(w*.66,h,4,w*.66,h,h*.6);g.addColorStop(0,'rgba(255,150,70,.65)');g.addColorStop(1,'rgba(255,120,50,0)');x.fillStyle=g;x.fillRect(0,0,w,h);ridge(x,w,h,h*.99,h*.07,'#0e060c',97)}}
 const ART={};function art(i){if(ART[i])return ART[i];const c=cvs(640,300),x=c.getContext('2d');sky(i,x,640,300);land(i,x,640,300);return ART[i]=c}
 const SK={};function bg(i){if(SK[i])return SK[i];const a=cvs(960,540);sky(i,a.getContext('2d'),960,540);const b=cvs(1400,260),y=b.getContext('2d');land(i,y,1400,260);return SK[i]={a,b}}
 {const _ds=drawSky;drawSky=function(w,hh,now){const i=here();if(i<1)return _ds.apply(this,arguments);try{const s=bg(i);g.drawImage(s.a,0,0,w,hh);const bh=hh*.55,bw=bh*1400/260,ox=-(((cam.x*.1)%bw+bw)%bw);g.drawImage(s.b,ox,hh-bh,bw,bh);g.drawImage(s.b,ox+bw,hh-bh,bw,bh);if(ox+bw*2<w)g.drawImage(s.b,ox+bw*2,hh-bh,bw,bh)}catch(e){_ds.apply(this,arguments)}}}
 // ---- the road (Worlds > Travel)
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.4"/><path d="M8 11V7.500a4 4 0 0 1 8 0V11"/></svg>';
 const count=i=>{const q=S.q[i],st=step(i);return st&&st.k=='stat'?' '+Math.min(q.n,st.n)+' / '+st.n:''};
 const objective=()=>{for(let i=0;i<B.length;i++){if(done(i))continue;const st=step(i),h=here()==i;return{i,land:B[i].n,text:h?st.t+count(i):'Travel to '+B[i].n,sub:h?'':'World Gate, or Worlds in the menu'}}return null};
 function card(i){const b=B[i],q=S.q[i],lk=!open(i),d=done(i),h=here()==i,all=b.q.length,cnt=d?all:q.s,r=rewardOf(i);
  const stLab=lk?'Locked':d?'Complete':h?'You are here':q.s?'In progress':'Available';
  return '<article class="bp-c'+(lk?' lock':'')+(d?' done':'')+(h?' here':'')+'" style="--c:'+b.c+'" data-i="'+i+'"><div class="bp-art"><canvas width="640" height="300"></canvas><span class="bp-n">'+(i+1)+'</span><span class="bp-st">'+(lk?LOCK:'')+stLab+'</span></div>'
   +'<div class="bp-b"><h4>'+esc(b.n)+'</h4><p>'+esc(b.d)+'</p><div class="bp-bar" role="progressbar" aria-valuenow="'+cnt+'" aria-valuemin="0" aria-valuemax="'+all+'" aria-label="'+esc(b.n)+' questline"><u style="width:'+Math.round(cnt/all*100)+'%"></u></div>'
   +(lk?'<p class="bp-need">'+LOCK+'<span>'+esc(why(i))+'</span></p>':'<ol>'+b.q.map((s,k)=>'<li class="'+(k<q.s||d?'ok':k==q.s?'cur':'')+'">'+esc(s.t)+(k==q.s&&!d?'<em>'+count(i)+'</em>':'')+'</li>').join('')+'</ol>')
   +'<small class="bp-find">'+esc(b.find)+(d?'':' Reward: '+r.g.toLocaleString()+' gems.')+'</small>'+(lk?'':'<button type="button" class="bp-go"'+(h?' disabled':'')+'>'+(h?'You are here':d?'Return':'Travel')+'</button>')+'</div></article>'}
 function render(){const m=document.getElementById('mworlds');if(!m)return;let e=document.getElementById('bpath');if(!e){e=document.createElement('section');e.id='bpath';e.setAttribute('aria-label','The First Realm road');const t=document.getElementById('wtabs16');if(t&&t.parentNode==m)t.after(e);else m.insertBefore(e,m.firstChild);e.addEventListener('click',ev=>{const b=ev.target.closest('.bp-go');if(!b||b.disabled)return;const i=+b.closest('.bp-c').dataset.i;if(!open(i))return;try{enterWorld(B[i].w)}catch(err){console.error('PATH1 go',err)}})}
  const o=objective();e.innerHTML='<header><div><small>The First Realm</small><div class="bp-title">Three lands, one road</div></div><p>'+(o?'<b>Next</b> '+esc(o.land)+': '+esc(o.text):'<b>Done</b> All three lands walked')+'</p></header><div class="bp-road">'+B.map((_,i)=>card(i)+(i<2?'<i class="bp-link'+(open(i+1)?' on':'')+'" aria-hidden="true"></i>':'')).join('')+'</div>';
  e.querySelectorAll('.bp-c').forEach(c=>{const v=c.querySelector('canvas');v.getContext('2d').drawImage(art(+c.dataset.i),0,0)})}
 {const _r=renderWorlds;renderWorlds=function(){const r=_r.apply(this,arguments);try{render()}catch(e){console.error('PATH1 road',e)}return r}}
 // the next objective, in the quest card
 {const _q=renderQuest;renderQuest=function(){const r=_q.apply(this,arguments);try{const el=document.getElementById('quest'),o=objective();if(!el||(typeof creatorOn!='undefined'&&creatorOn))return r;const html=o?'<div class="bpq" style="--c:'+B[o.i].c+'"><small>'+esc(o.land)+'</small><b>'+esc(o.text)+'</b>'+(o.sub?'<em>'+esc(o.sub)+'</em>':'')+'</div>':'';
    if(el.style.display=='none'){if(o){el.style.display='block';el.innerHTML=html}}else if(html)el.insertAdjacentHTML('beforeend',html)}catch(e){console.error('PATH1 quest',e)}return r}}
 let paintT=0;function paint(){clearTimeout(paintT);paintT=setTimeout(()=>{try{renderQuest();const m=document.getElementById('mworlds');if(m&&m.style.display=='block')render()}catch(_){}},120)}
 // ---- a new land opens
 function reveal(i){const b=B[i],old=document.getElementById('bpun');if(old)old.remove();const e=document.createElement('div');e.id='bpun';e.style.setProperty('--c',b.c);e.setAttribute('role','status');e.innerHTML='<div class="bpu-card"><canvas width="640" height="300"></canvas><div class="bpu-lock">'+LOCK+'</div><div class="bpu-t"><small>A new land is open</small><b>'+esc(b.n)+'</b><span>'+esc(b.d)+'</span></div></div>';document.body.appendChild(e);e.querySelector('canvas').getContext('2d').drawImage(art(i),0,0);
  try{[392,523,659,784,1047].forEach((f,k)=>tone(f,f,.42,'triangle',.05,k*.11));tone(120,60,.5,'sine',.08)}catch(_){}setTimeout(()=>{e.classList.add('out');setTimeout(()=>e.remove(),520)},4200)}
 window.PATH1={B,S:()=>S,open,done,locked,landOf,here,objective,render,reveal,advance,reset(){S=fresh();save();paint()},step,names};
 setTimeout(()=>{try{renderQuest()}catch(_){}},1500);
})()}catch(e){console.error('PATH1',e)}
