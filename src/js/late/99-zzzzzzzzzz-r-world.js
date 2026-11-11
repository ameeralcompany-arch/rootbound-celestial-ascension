// ===== DISC1: things to find on the First Realm road. Each of the three lands holds eight: three lore fragments (they become Journal pages), two buried caches (the ground above them glitters),
// two rare gathering points and one chime puzzle. Places come from the land's name, so everyone's land matches. Press F beside one. Rewards follow the game's income, once each. State: RB_PREFIX+'rbdisc'.
// LOGBOOK1: Quests > Logbook, everything you have found and done, read from the game's own records.  WXAUTO: weather is on by default and pauses by itself when the frame rate slips.
// MOMENT2: small personal moments: a thought bubble when you stand still a while, a reaction to rain and to a rare find. Local only, never sent to other players. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbdisc';
 let S={got:{},m:{}};try{const o=JSON.parse(localStorage.getItem(KEY())||'null');if(o&&typeof o=='object'){if(o.got)S.got=o.got;if(o.m)S.m=o.m}}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const tone=(a,b,d,t,v,dl)=>{try{SFX7.tone(a,b,d,t,v,dl)}catch(_){}};
 const income=()=>{const L=Math.max(1,typeof lvl!='undefined'?lvl|0:1);try{return ECON14.income(L)}catch(_){return 30+4.5*L}};
 const LORE=[
  [['The First Root','Before the Silence, one root held every world together. Nobody planted it. It simply decided to stay.'],['Words in the Bark','Someone carved their name here, and under it: "If you find this, I got home." The carving is very old. The bark has grown around it gently.'],['The Morning Field','The Vale keeps one hour of a morning that ended long ago. Walk slowly and you can almost hear it.']],
  [['Glass That Remembers','The hills here are not stone. They are years, cooled and set. Hold a shard to the light and you will see a little of someone else\'s evening.'],['The Dusk That Stayed','The sun started to set in the Reach and never finished. People here learned to sleep without a night.'],['A Note Left Behind','"I have gone to look for the morning. Keep the lamp lit. Do not wait up." Nobody ever came back for this note.']],
  [['Where Stars Land','Every crater here was a wish someone made too loudly. The sky answers slowly, and it does not aim.'],['Still Falling','The stars over the Wastes have been falling for a hundred years. They are in no hurry. Neither is the ground.'],['The Last Lantern','At the edge of the burnt plain, one lantern was left burning for travellers. It is still warm. No one remembers lighting it.']]];
 const AREA=x=>{try{return x<W*.34?'in the west':x<W*.67?'near the middle':'in the east'}catch(_){return''}};
 let SP={},spots=null,land=-1,chime={i:0,t:0,on:0};
 const here=()=>{try{return PATH1.here()}catch(_){return -1}},inRun=()=>{try{return !!(window.DG&&DG.run)}catch(_){return false}};
 const id=(l,i)=>l+':'+i,got=(l,i)=>!!(S.got[id(l,i)]);
 const count=()=>Object.keys(S.got).length;
 const TOTAL=24,MILE=[[6,3],[12,5],[18,8],[24,14]];
 function surf(x){let y=2;while(y<H-3&&!solidAt(x,y))y++;return y}
 function build(l){const R0=rr(h32(PATH1.B[l].w)^0x71c3),ri=(a,b)=>a+Math.floor(R0()*(b-a+1)),A=[];const sect=W/9;let order=[0,1,2,3,4,5,6,7,8];for(let i=8;i>0;i--){const j=ri(0,i);[order[i],order[j]]=[order[j],order[i]]}order=order.filter(s=>s!=4);
  const place=(kind,n,extra)=>{for(let q=0;q<n;q++){const s=order.shift();const x=Math.max(8,Math.min(W-9,Math.floor((s+.2+R0()*.6)*sect)));A.push(Object.assign({kind,x},extra?extra(q,x):{}))}};
  place('lore',3,q=>({lore:q}));place('cache',2,()=>({deep:ri(12,20)}));place('gather',2);place('puzzle',1,()=>({order:(()=>{const a=[0,1,2];for(let i=2;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a})()}));
  for(const p of A){const y=surf(p.x);p.y=y-1;if(p.kind=='cache'){p.y=Math.min(H-6,y+p.deep);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=0;dy++){const k=(p.y+dy)*W+p.x+dx;if(tiles[k]&&tiles[k]!=4){tiles[k]=0;hp[k]=0}}p.sy=y}p.px=(p.x+.5)*T;p.py=(p.y+1)*T}return A}
 {const _g=gen;gen=function(){const r=_g.apply(this,arguments);try{land=here();spots=land>=0?build(land):null;if(spots)SP[land]=spots.map(s=>({kind:s.kind,area:AREA(s.x),deep:s.deep}))}catch(e){console.error('DISC1 gen',e)}return r}}
 {const _lw=loadWorld;loadWorld=function(){const r=_lw.apply(this,arguments);try{const l=here();if(l<0){spots=null;land=-1}}catch(_){}return r}}
 // the puzzle's three stones stand around its centre, each with its own note
 const NOTE=[523,659,784];const stones=p=>[0,1,2].map(i=>{const x=p.x+(i-1)*4,sy=surf(x);return{x:(x+.5)*T,y:sy*T,i}});
 function near(){if(!spots||inRun()||!entered)return null;let best=null,bd=78;for(let i=0;i<spots.length;i++){const s=spots[i];if(got(land,i))continue;if(s.kind=='puzzle'){for(const st of stones(s)){const q=Math.hypot(P.x-st.x,P.y+30-st.y);if(q<bd){bd=q;best={s,i,st}}}continue}const q=Math.hypot(P.x-s.px,P.y+30-s.py);if(q<bd){bd=q;best={s,i}}}return best}
 function milestone(){const n=count();for(const[need,g]of MILE)if(n>=need&&!S.m[need]){S.m[need]=1;save();const v=Math.round(g*income());try{gems+=v;stat('gems',v);say('Discoveries: '+need+' found  +'+v+' gems');REW8.card({kind:'reveal',kick:'Explorer milestone',title:need+' discoveries',tier:Math.min(4,1+MILE.findIndex(m=>m[0]==need)),gems:v})}catch(_){}}}
 function mark(l,i){S.got[id(l,i)]=1;save();milestone();try{renderLog()}catch(_){}}
 function collect(n){const{s,i}=n,l=land,inc=income();
  if(s.kind=='lore'){const q=LORE[l][s.lore];mark(l,i);try{xpGain('fight',Math.round(.02*xpNeed(Math.max(1,lvl|0))));say('Fragment found: '+q[0]+' (M > Journal)');STORY1.check();UI6.say6(q[0].toUpperCase(),q[1],6000)}catch(_){}tone(392,523,.5,'sine',.05);return}
  if(s.kind=='cache'){mark(l,i);const v=Math.round(2*inc);try{gems+=v;stat('gems',v);REW8.card({kind:'reveal',kick:'Hidden cache',title:PATH1.B[l].n,tier:2,gems:v})}catch(_){}tone(523,1047,.3,'triangle',.06);return}
  if(s.kind=='gather'){mark(l,i);const ore=BIOME17.BI[[0,3,5][l]].ore,n2=3+l;try{addI(ore,n2);ft(s.px,s.py-30,'+'+n2+' '+iname(ore),'#fff');say('Rare find: '+n2+' × '+iname(ore))}catch(_){}tone(660,990,.24,'triangle',.05);return}
  if(s.kind=='puzzle'){const want=s.order[chime.i];if(n.st.i==want){tone(NOTE[n.st.i],NOTE[n.st.i],.32,'sine',.07);chime.i++;chime.lit=n.st.i;chime.litT=performance.now();if(chime.i>=3){chime.i=0;mark(l,i);const v=Math.round(4*inc);try{gems+=v;stat('gems',v);REW8.card({kind:'reveal',kick:'Puzzle solved',title:'The stones answer',tier:3,gems:v})}catch(_){}}}else{chime.i=0;tone(180,120,.3,'triangle',.06);try{say('The stones fall silent. Listen again.')}catch(_){}}}}
 addEventListener('keydown',e=>{try{if((e.key!='e'&&e.key!='E')||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(!entered||dlgOpen||showInv||creatorOn||menuEl.style.display!='none'||window.RB_COVER||(window.DLG7&&DLG7.isOpen))return;const n=near();if(!n)return;e.preventDefault();e.stopImmediatePropagation();collect(n)}catch(_){}},true);
 // ---- drawing, only what is on screen
 const COL={lore:'#a4e0ff',cache:'#f4d59a',gather:'#c8a8ff',puzzle:'#9be37a'};
 const GS={};function glowS(c){if(GS[c])return GS[c];const q=document.createElement('canvas');q.width=q.height=64;const x=q.getContext('2d'),G=x.createRadialGradient(32,32,1,32,32,32);G.addColorStop(0,c);G.addColorStop(1,c+'00');x.fillStyle=G;x.fillRect(0,0,64,64);return GS[c]=q}
 function glow(c,x,y,r,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowS(c),x-r,y-r,r*2,r*2);g.restore()}
 function stone(x,y,c,on){g.fillStyle='#3a3648';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(x-11,y);g.lineTo(x-8,y-30);g.lineTo(x+6,y-36);g.lineTo(x+11,y);g.closePath();g.fill();g.stroke();g.fillStyle=c;g.globalAlpha=on?1:.55;g.fillRect(x-3,y-26,6,12);g.globalAlpha=1}
 function draw(now){if(!spots||inRun())return;const vw=cv.width/ZM;for(let i=0;i<spots.length;i++){if(got(land,i))continue;const s=spots[i],c=COL[s.kind],t=now/1000,px=s.px-cam.x;if(px<-140||px>vw+140)continue;
   if(s.kind=='lore'){const py=s.py-cam.y;glow(c,px,py-20,46,.35+.1*Math.sin(t*1.6+i));stone(px,py,c,true)}
   else if(s.kind=='gather'){const py=s.py-cam.y;glow(c,px,py-14,44,.4+.12*Math.sin(t*2+i));g.fillStyle=c;g.strokeStyle='#000';g.lineWidth=1.5;for(const[dx,h2]of[[-8,20],[0,32],[8,22]]){g.beginPath();g.moveTo(px+dx-5,py);g.lineTo(px+dx,py-h2);g.lineTo(px+dx+5,py);g.closePath();g.fill();g.stroke()}}
   else if(s.kind=='cache'){const gy=s.sy*T-cam.y;for(let k=0;k<3;k++){const ph=(t*.7+k*.33+i*.2)%1;g.fillStyle='rgba(244,213,154,'+(1-ph).toFixed(2)+')';g.fillRect(px+Math.sin(k*2.1+i)*22,gy-4-ph*16,2.5,2.5)}const py=s.py-cam.y;g.fillStyle='#6a4726';g.strokeStyle='#000';g.lineWidth=1.5;g.fillRect(px-13,py-18,26,18);g.strokeRect(px-13,py-18,26,18);g.fillStyle=c;g.fillRect(px-3,py-12,6,6);glow(c,px,py-10,34,.35)}
   else{const ST=stones(s);const cyc=(now%3600)/900|0,show=Math.hypot(P.x-s.px,P.y-s.py)<520&&cyc<3?s.order[cyc]:-1;if(show>=0&&cyc!==chime.c){chime.c=cyc;if(!window.RB_COVER&&!showInv)tone(NOTE[show],NOTE[show],.26,'sine',.03)}for(const st of ST){const lit=show==st.i||(chime.lit==st.i&&now-(chime.litT||0)<500);const x=st.x-cam.x,y=st.y-cam.y;if(lit)glow(c,x,y-22,50,.7);stone(x,y,lit?'#ffffff':c,lit)}}}
  const n=near();if(n){const x=(n.st?n.st.x:n.s.px)-cam.x,y=(n.st?n.st.y:n.s.py)-cam.y-52,txt=n.s.kind=='lore'?'Read':n.s.kind=='cache'?'Open':n.s.kind=='gather'?'Gather':'Strike';g.save();g.font='700 13px '+FONT;const w2=g.measureText(txt).width+44;g.fillStyle='rgba(10,8,22,.86)';g.strokeStyle=COL[n.s.kind];g.lineWidth=1.2;g.beginPath();g.roundRect(x-w2/2,y-14,w2,26,8);g.fill();g.stroke();g.fillStyle='#f4d59a';g.fillRect(x-w2/2+7,y-8,16,14);g.fillStyle='#1a1020';g.textAlign='center';g.fillText('E',x-w2/2+15,y+4);g.fillStyle='#fff8e6';g.textAlign='left';g.fillText(txt,x-w2/2+30,y+4);g.restore()}}
 // the land itself moves: drifting motes and, over the Wastes, the odd falling star
 const MO=[];for(let i=0;i<34;i++)MO.push({x:Math.random(),y:Math.random(),s:.3+Math.random()*.7,p:Math.random()*6});
 function life(now){const l=here();if(l<1||inRun())return;const vw=cv.width/ZM,vh=cv.height/ZM,t=now/1000,c=PATH1.B[l].c;g.save();g.globalCompositeOperation='lighter';g.fillStyle=c;for(const m of MO){const rise=l==2?1:.35,x=((m.x*vw+Math.sin(t*.5+m.p)*22-cam.x*.15)%vw+vw)%vw,y=((m.y*vh-t*14*m.s*rise)%vh+vh)%vh;g.globalAlpha=.25+.3*Math.abs(Math.sin(t*m.s+m.p));g.fillRect(x,y,2*m.s+.8,2*m.s+.8)}if(l==2){const k=(t%7)/1.1;if(k<1){const sx=vw*(.2+.6*((Math.floor(t/7)*.618)%1)),x=sx-k*260,y=40+k*150,G=g.createLinearGradient(x,y,x+90,y-52);G.addColorStop(0,'#ffe2b0');G.addColorStop(1,'#ff8a4a00');g.globalAlpha=1-k;g.strokeStyle=G;g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+90,y-52);g.stroke()}}g.restore()}
 {const _d=drawDrops;drawDrops=function(now){const r=_d.apply(this,arguments);try{if(!(window.WBOSS13&&WBOSS13.void)){life(now);draw(now)}}catch(e){if(!draw.e){draw.e=1;console.error('DISC1 draw',e)}}return r}}
 // fragments are Journal pages
 try{const pages=[];LORE.forEach((L,l)=>L.forEach((q,n)=>{const pid='frag_'+l+'_'+n;pages.push({id:pid,t:q[0],ch:'frag',if:()=>got(l,n),hint:'A fragment somewhere in '+PATH1.B[l].n,x:q[1]})}));STORY1.CH.push({k:'frag',n:'Fragments',pages});for(const p of pages)STORY1.PAGES.push(p)}catch(e){console.error('DISC1 journal',e)}
 // ---- Logbook
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const row=(n,v,m)=>'<div class="lb-r"><span>'+esc(n)+'</span><div class="lb-b"'+(m?'':' style="visibility:hidden"')+'><u style="transform:scaleX('+(m?Math.min(1,v/m):0).toFixed(3)+')"></u></div><b>'+Number(v).toLocaleString()+(m?' / '+Number(m).toLocaleString():'')+'</b></div>';
 function data(){const o={};const safe=(f,d)=>{try{return f()}catch(_){return d}};o.items=safe(()=>INV7.items().filter(i=>i.own).length,0);o.bosses=safe(()=>BOSSES.filter(b=>!b.wb&&(bossK[b.id]|0)>0).length,0);o.bossN=safe(()=>BOSSES.filter(b=>!b.wb).length,0);o.wb=safe(()=>Object.keys(WBOSS13.state.w||{}).length,0);o.dg=safe(()=>{let n=0;for(const d of Object.keys(DG.S.clr||{}))if(Object.keys(DG.S.clr[d]||{}).length)n++;return n},0);o.dgN=safe(()=>DG.LIST.length,0);o.lands=safe(()=>PATH1.B.filter((b,i)=>PATH1.open(i)).length,0);o.walked=safe(()=>PATH1.B.filter((b,i)=>PATH1.done(i)).length,0);o.realms=safe(()=>Object.values(WORD9.state.w).filter(v=>v&&v.ok).length,0);o.worlds=safe(()=>stats.worlds|0,0);o.kills=safe(()=>stats.kill|0,0);o.found=count();return o}
 function byKind(){const c={lore:0,cache:0,gather:0,puzzle:0};for(const k of Object.keys(S.got)){const[l,i]=k.split(':').map(Number);const q=SP[l]&&SP[l][i];if(q)c[q.kind]++}return c}
 function logHTML(){const d=data(),k=byKind();let h='<h3>Logbook</h3><p class="dim">Everything you have found and done so far.</p>';
  h+='<h4>Places</h4>'+row('Lands of the First Realm open',d.lands,3)+row('Lands completed',d.walked,3)+row('Realm words spoken',d.realms,0)+row('Worlds visited',d.worlds,0);
  h+='<h4>Battles</h4>'+row('Depth bosses defeated',d.bosses,d.bossN)+row('World guardians defeated',d.wb,0)+row('Dungeons cleared',d.dg,d.dgN)+row('Monsters defeated',d.kills,0);
  h+='<h4>Discoveries</h4>'+row('All discoveries',d.found,TOTAL)+row('Lore fragments',k.lore,9)+row('Hidden caches',k.cache,6)+row('Rare gathering points',k.gather,6)+row('Puzzles solved',k.puzzle,3)+row('Items collected',d.items,0);
  h+='<h4>Explorer milestones</h4><div class="lb-m">'+MILE.map(([n])=>'<span class="'+(S.m[n]?'on':'')+'">'+n+' found</span>').join('')+'</div>';
  const nf=[];for(let l=0;l<3;l++){if(!SP[l])continue;SP[l].forEach((s,i)=>{if(!got(l,i)&&nf.length<4)nf.push(PATH1.B[l].n+': '+({lore:'a fragment',cache:'something buried',gather:'a rare find',puzzle:'three stones'})[s.kind]+' '+s.area)})}
  if(nf.length)h+='<h4>Still out there</h4><ul class="lb-h">'+nf.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';return h}
 let logBody=null;function renderLog(){if(logBody&&logBody.isConnected&&UI6.tab=='log')logBody.innerHTML=logHTML()}
 try{UI6.TABS.push(['log','Logbook']);UI6.ext.log=b=>{logBody=b;b.innerHTML=logHTML()}}catch(e){console.error('LOGBOOK1',e)}
 window.DISC1={get spots(){return spots},near,collect,get S(){return S},count,TOTAL,got,LORE,reset(){S={got:{},m:{}};save()},SP,get chime(){return chime}};
 window.LOGBOOK1={html:logHTML,data};
})()}catch(e){console.error('DISC1',e)}
// ---- weather that gets out of the way
try{(()=>{
 try{if(!localStorage.getItem('rbstill2')){localStorage.setItem('rbstill2','1');cel.opt.still=0;celSave()}}catch(_){}
 let lowT=0,okT=0,last=performance.now();window.WXAUTO=false;
 setInterval(()=>{try{const now=performance.now(),dt=(now-last)/1000;last=now;if(navigator.webdriver)return;if(typeof entered=='undefined'||!entered||document.hidden)return;const fps=1/Math.max(.001,PERF7.ema);if(fps<40){lowT+=dt;okT=0}else if(fps>=56){okT+=dt;lowT=0}if(!window.WXAUTO&&lowT>4)window.WXAUTO=true;else if(window.WXAUTO&&okT>30)window.WXAUTO=false}catch(_){}},1000);
})()}catch(e){console.error('WXAUTO',e)}
// ---- personal moments
try{(()=>{
 const THINK=['♪','…','☁','✧'];let still=0,cd=20,last=performance.now(),rain=0;
 const bubble=t=>{try{bub.me={t,e:performance.now()+2200}}catch(_){}};
 setInterval(()=>{try{const now=performance.now(),dt=(now-last)/1000;last=now;cd-=dt;if(typeof entered=='undefined'||!entered||window.RB_COVER||menuEl.style.display!='none'||showInv||dlgOpen||document.hidden){still=0;return}if(window.DG&&DG.run){still=0;return}const idle=Math.abs(P.vx)<4&&P.g&&swing<=0;still=idle?still+dt:0;if(window.ROOTLINK&&ROOTLINK.on)still=0;
   if(cd<=0&&still>14){cd=45+Math.random()*30;still=0;bubble(THINK[Math.random()*THINK.length|0])}
   const r=WX6.rain||0;if(r>.4&&rain<=.4&&cd<=0&&idle){cd=40;bubble('☂')}rain=r}catch(_){}},500);
 window.MOMENT2={bubble};
})()}catch(e){console.error('MOMENT2',e)}
