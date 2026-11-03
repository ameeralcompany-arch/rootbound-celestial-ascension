// ===== MYUI: the mythic arsenal on screen.
// Classes screen (CLS9): every class gets its own look, painted once (the screen stays still, so it costs nothing per frame). The palette recolours the light, the title and the glass; a live background in the
// class motif (falling petals / leaves / feathers, rising embers, twinkling stars, a turning rune circle, lightning, blood drips, crows,
// ink, floating rock, turning gears); an animated anime hero of the class (hair and cloth sway, blinking, breathing, wings, holding its
// mythic scythe) inside an ornate frame; and a Mythic card: the scythe's name and creed, its tier, the three moves, what each tier unlocks,
// what the next ascension needs (with what you have), the Forge / Ascend button and the outfit switch.
// Character card (HUD): an ornate avatar frame and a hanging banner in the style of the class you are using. =====
const MYUI=(()=>{
 const A=MYART,TH=A.TH,TAU=Math.PI*2,R=Math.random,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const red=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const UNL=['Forged: the three-move combo','The first move hits 30% harder and wider','The finisher throws the scythe; it swings back','Hits echo with small bursts','Transcendent: a doubled finisher that heals you on hit, then a fourth strike, Supernova','Mythic Awakening: every effect 20% larger and stronger'];
 const CROWN_Y=150,CROWN_S=6.2;   // where the crown piece sits on the hero portrait (SHOWART design space)
 const FXN={crescent:'◐',pillar:'▮',vortex:'◉',chains:'∞',flock:'≋',splash:'✺',bolts:'ϟ',stars:'✦',shards:'▲',ring:'◎'};
 // ---- the Mythic card
 function section(k){const th=TH[k],t=MYTH.tier(k),nx=MYTH.next(k),ck=MYTH.check(k),RN=MYTH.RN;
  const pips=[1,2,3,4,5,6].map(i=>'<i class="'+(i<=t?'on':'')+'">'+RN[i]+'</i>').join('');
  const mv=th.mv.map((m,i)=>'<li><span class="mvi" aria-hidden="true">'+(FXN[m[1]]||'✦')+'</span><div><b>'+(i+1)+' · '+esc(m[0])+'</b><small>'+esc(m[2])+'</small></div></li>').join('');
  const pf=MYTH.prof(k),U=UNL.slice();U[2]=pf.thr?'The finisher throws the '+th.noun+'; it flies back':'The finisher strikes a second time';
  const un=U.map((u,i)=>'<li class="'+(t>=i+1?'got':'')+'"><b>'+RN[i+1]+'</b><span>'+esc(u)+(i?' · +'+Math.round(MYTH.DMG*100*i)+'% damage':'')+'</span></li>').join('');
  let req='';if(nx){const rows=[];const free=typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE,ac=MYTH.access(k);if(ac)rows.push([ac,false]);
   if(!free)for(const r of MYTH.reqs(k))rows.push([r.label+'  '+Math.min(r.have,r.need).toLocaleString()+' / '+r.need.toLocaleString(),r.ok]);
   req='<ul class="c9req">'+rows.map(r=>'<li class="'+(r[1]?'ok':'no')+'">'+esc(r[0])+'</li>').join('')+'</ul>'+(nx.mats.length?'<p class="dim">Materials come from the depths: groves, caches, geodes, the Singing Crystals and the relic vaults (two of each per world).</p>':'')}
  const lab=!nx?'Fully ascended':t==0?'Forge '+th.n:'Ascend to Tier '+RN[nx.n];
  return'<section class="c9card c9my" id="c9-my"><div class="c9myh"><div><h4>Mythic '+esc(th.noun)+'</h4><h3>'+esc(th.n)+'</h3><small>'+esc(th.ep)+'</small></div><div class="c9pips" title="Tier '+(t?RN[t]:'— (not forged)')+'">'+pips+'</div></div>'+
   '<blockquote>“'+esc(th.q)+'”</blockquote><h4>Combo</h4><ul class="c9mv">'+mv+'</ul><h4>Ascension</h4><ol class="c9un">'+un+'</ol>'+
   (nx?'<h4>'+(t==0?'To forge (class level 50)':'Next ascension · Tier '+RN[nx.n]+' at class level '+nx.lv)+'</h4>'+(t>0?'<p class="dim">Slain monsters and bosses count from your last ascension, with this class\'s weapons.</p>':'')+req:'')+
   '<div class="c9myb"><button class="c9asc" data-a="my:asc"'+(ck.ok?'':' aria-disabled="true"')+(ck.miss&&ck.miss.length?' title="Needs: '+esc(ck.miss.join(', '))+'"':'')+'>'+esc(lab)+'</button>'+
   (t>=1?(wp===MYTH.ID(k)?'<button class="c9eq on" aria-disabled="true">Equipped</button>':'<button class="c9eq big" data-a="eq:'+MYTH.ID(k)+'">Equip '+esc(th.noun)+'</button>'):'')+
   (t>=1?'<button class="c9tog" data-a="my:out" aria-pressed="'+(MYTH.outfit?'true':'false')+'">Mythic outfit · '+(MYTH.outfit?'On':'Off')+'</button>':'')+'</div></section>'}
 function act(a,k){if(a=='asc')return MYTH.ascend(k);if(a=='out'){MYTH.setOutfit(!MYTH.outfit);return true}return false}
 // ---- live canvases on the Classes screen
 let root=null,cur=null,bgP=[];
 function after(el,k){root=el;schedule();const p=TH[k].pal;el.style.setProperty('--m',p[0]);el.style.setProperty('--l',p[1]);el.style.setProperty('--d',p[2]);el.style.setProperty('--a',p[3]);el.dataset.cls=k;if(cur!==k){cur=k;bgP=[]}}
 // the Classes screen is still (and fast): the background and the hero are painted once per class, and again on resize; nothing animates
 let pend=0;
 function paint(){pend=0;if(!root||!root.isConnected||root.style.display=='none'||!cur)return;const k=cur,t=1.2;
  try{const fx=root.querySelector('.c9fx');if(fx)bg(fx,k,t)}catch(e){if(!paint.e1){paint.e1=1;console.error('MYUI bg',e)}}
  try{const hc=root.querySelector('.c9heroc');if(hc)hero(hc,k,t)}catch(e){if(!paint.e2){paint.e2=1;console.error('MYUI hero',e)}}}
 const schedule=()=>{if(!pend)pend=requestAnimationFrame(paint)};
 function start(el){root=el;schedule()}
 function stop(){if(pend)cancelAnimationFrame(pend);pend=0}
 addEventListener('resize',()=>{if(root&&root.style.display!='none')schedule()});
 function fit(c){const r=c.getBoundingClientRect(),d=Math.min(1.5,devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h}return{w:r.width,h:r.height,d}}
 // background: motif particles that behave like their material, over a faint class sigil
 function bg(c,k,t){const{w,h,d}=fit(c),g=c.getContext('2d'),th=TH[k],p=th.pal,mo=th.mot;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  try{if(typeof CLART!='undefined')CLART.scene(g,k,w,h)}catch(_){}   // the class's own world (99-zzzzzzzzz-9-classart.js)
  const n=mo=='star'?60:mo=='rune'||mo=='gear'?14:30;let sd=A.KEYS.indexOf(k)*977+13;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;bgP=[];
  while(bgP.length<n)bgP.push({x:rn()*w,y:rn()*h,s:.6+rn()*.9,v:.4+rn()*.8,a:rn()*TAU,ph:rn()*TAU,o:.2+rn()*.6});
  const fall=mo=='petal'||mo=='leaf'||mo=='feather'||mo=='blood',rise=mo=='spark'||mo=='flame'||mo=='rock';
  // the big sigil behind the hero
  const sx=w*.24,sy=h*.48,sr=Math.min(w,h)*.36;g.save();g.translate(sx,sy);g.rotate(t*.05);g.globalAlpha=.16;g.strokeStyle=p[1];g.lineWidth=1;g.beginPath();g.arc(0,0,sr,0,TAU);g.stroke();g.beginPath();g.arc(0,0,sr*.86,0,TAU);g.stroke();
  for(let i=0;i<24;i++){const q=i/24*TAU;A.rune(g,Math.cos(q)*sr*.93,Math.sin(q)*sr*.93,5,p[1],q+Math.PI/2,i)}g.rotate(-t*.12);for(let i=0;i<6;i++){const q=i/6*TAU;g.beginPath();g.moveTo(Math.cos(q)*sr*.86,Math.sin(q)*sr*.86);g.lineTo(Math.cos(q+TAU/3)*sr*.86,Math.sin(q+TAU/3)*sr*.86);g.stroke()}g.restore();g.globalAlpha=1;
  if(mo=='bolt'){g.globalCompositeOperation='lighter';A.bolt(g,R()*w,0,h*.5,Math.PI/2+(R()-.5)*.4,p[0],(R()*1e6)|0);g.globalCompositeOperation='source-over'}
  if(mo=='gear'){g.globalAlpha=.18;A.gear(g,w*.92,h*.18,90,p[3],t*.2);A.gear(g,w*.82,h*.32,50,p[3],-t*.36);g.globalAlpha=1}
  for(const q of bgP){const al=mo=='star'?.25+.6*Math.abs(Math.sin(t*1.3+q.ph)):mo=='ink'?Math.sin(q.o*Math.PI)*.5:.55;g.globalAlpha=al*(.5+q.s*.4);
   if(mo=='star')A.star4(g,q.x,q.y,2+q.s*3,q.o<.3?p[3]:'#ffffff',t*.3+q.ph);else if(mo=='crow')A.crow(g,q.x,q.y,8+q.s*8,0,'#0a0610',t*10+q.ph);else if(mo=='rune'){const rr=Math.min(w,h)*(.2+q.o*.5);A.rune(g,w*.5+Math.cos(t*.1*q.v+q.ph)*rr,h*.5+Math.sin(t*.1*q.v+q.ph)*rr*.6,6+q.s*6,p[q.o<.5?0:1],t*.2,(q.ph*10)|0)}
   else if(mo=='gear')A.gear(g,q.x,q.y,8+q.s*8,p[3],t*q.v*(q.o<.5?1:-1));else A.motif(g,k,q.x,q.y,5+q.s*6,q.a,t)}
  g.globalAlpha=1}
 // the class weapon in a showcase pose in front of the hero (its own placement per kind, so short weapons stay in the picture)
 const POSE={scythe:[.8,.9,-1.2,.66],greatsword:[.7,.94,-1.25,.6],katana:[.72,.92,-1.2,.6],blade:[.72,.92,-1.2,.56],spear:[.72,.96,-1.3,.6],hammer:[.66,.93,-1.15,.48],axe:[.66,.93,-1.15,.48],staff:[.72,.96,-1.35,.58],branch:[.72,.96,-1.35,.58],
  gauntlet:[.7,.8,-.5,.46],chakram:[.7,.74,-.3,.46],gun:[.6,.82,-.45,.42],bow:[.7,.64,-.12,.44]};
 function showWeapon(g,k,w,h,t){const ty=TH[k].type||'scythe',ps=POSE[ty]||POSE.scythe,pf=MYTH.prof(k),L=h*ps[3];g.save();g.translate(w*ps[0],h*ps[1]);g.rotate(ps[2]);g.translate(-L*(ty=='bow'?0:pf.piv),0);A.weapon(g,k,Math.max(1,MYTH.tier(k)),L,t,{aura:1});g.restore()}
 // the hero: the anime portrait renderer (SHOWART) with a look of the class, its wings and its mythic scythe, inside an ornate frame
 function lookOf(k){const L=TH[k].look,ap=typeof AP!='undefined'?AP:{eyeCol:['#35c9c0']};return{skin:L.skin,hair:L.hair,eye:ap.eyeCol[L.eye%ap.eyeCol.length],out:L.out,trim:L.trim,hs:L.hs,es:L.gd?1:0,of:A.KEYS.indexOf(k)%6,acc:0,cape:1,gd:L.gd}}
 function hero(c,k,t){const{w,h,d}=fit(c),g=c.getContext('2d'),th=TH[k],p=th.pal;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  const gr=g.createRadialGradient(w*.5,h*.42,10,w*.5,h*.42,Math.max(w,h)*.7);gr.addColorStop(0,A.rgba(p[0],.32));gr.addColorStop(.55,A.rgba(p[2],.18));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  // halo behind the head
  g.save();g.translate(w*.5,h*.36);g.rotate(t*.15);g.globalCompositeOperation='lighter';g.strokeStyle=A.rgba(p[1],.5);g.lineWidth=1.5;g.beginPath();g.arc(0,0,Math.min(w,h)*.26,0,TAU);g.stroke();for(let i=0;i<8;i++){const q=i/8*TAU;g.beginPath();g.moveTo(Math.cos(q)*Math.min(w,h)*.26,Math.sin(q)*Math.min(w,h)*.26);g.lineTo(Math.cos(q)*Math.min(w,h)*.31,Math.sin(q)*Math.min(w,h)*.31);g.stroke()}g.restore();g.globalCompositeOperation='source-over';
  if(typeof SHOWART!='undefined'){g.save();const ih=h*.94;try{const zm=.86,dy=h*.06;SHOWART.draw(g,w,ih,{look:lookOf(k),t:red()?0:t,wpn:'fist',wingIdx:th.wing,gear:{},ox:w*.5,dy,zoom:zm});const sc=ih/760*zm,X=w*.5-310*sc,Y=ih-860*sc+60*sc+dy;g.save();g.translate(X+310*sc,Y+CROWN_Y*sc+Math.sin(t*1.5)*3*sc);g.scale(sc*CROWN_S,sc*CROWN_S);MYTH.drawCrown(g,k,0,0,1,t);g.restore();showWeapon(g,k,w,h,t)}catch(e){if(!hero.e){hero.e=1;console.error('MYUI showart',e)}}g.restore()}
  // the frame: thin metal lines with filigree corners, a crowning gem and the class motif at the corners
  g.save();const m=8;g.strokeStyle=A.metal(g,0,0,w,h,k,.15);g.lineWidth=2;g.strokeRect(m,m,w-m*2,h-m*2);g.strokeStyle=A.rgba(p[1],.5);g.lineWidth=1;g.strokeRect(m+5,m+5,w-m*2-10,h-m*2-10);
  const cn=[[m,m,0],[w-m,m,Math.PI/2],[w-m,h-m,Math.PI],[m,h-m,-Math.PI/2]];for(const[x,y,a]of cn){A.curl(g,x,y,26,a+.3,false,A.mix(p[1],'#ffffff',.3),2);A.curl(g,x,y,26,a+1.27,true,A.mix(p[1],'#ffffff',.3),2);A.gem(g,x,y,5,p[3],true)}
  A.gem(g,w/2,m,7,p[3],true);A.curl(g,w/2-6,m+2,18,Math.PI-.2,true,A.mix(p[1],'#ffffff',.3),1.6);A.curl(g,w/2+6,m+2,18,.2,false,A.mix(p[1],'#ffffff',.3),1.6);
  for(let i=0;i<4;i++){const tw=.5+.5*Math.sin(t*2+i*1.7);g.globalAlpha=tw;A.star4(g,[m+30,w-m-30,w-m-26,m+26][i],[m+24,m+30,h-m-28,h-m-34][i],4+tw*3,'#ffffff',t)}g.globalAlpha=1;
  g.font="600 9px Montserrat,'Segoe UI',sans-serif";g.textAlign='center';g.fillStyle=A.rgba(p[1],.8);g.fillText((th.n+' · '+(MYTH.tier(k)?'Tier '+MYTH.RN[MYTH.tier(k)]:'Not forged')).toUpperCase().split('').join(String.fromCharCode(8202)),w/2,h-m-12);g.restore()}
 // ---- HUD: the character card. The portrait sits in a crisp ring in the class colours with the class emblem as a badge, the class
 // banner hangs below the card (drawn once per class; it sways with a CSS animation, so nothing is redrawn per frame), and a class bar
 // shows the class, its level and the XP to the next level. Updated four times a second; DOM writes only when a value changed.
 let wrap=null,bc=null,cx=null,hk=null,cxk='';
 const cls=()=>{try{return CLASS7.cur()||CJOB.cur||null}catch(_){return null}};
 const fmtN=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e4?Math.round(n/1e3)+'k':String(Math.round(n));
 function hud(){const hl=document.getElementById('hudL'),pt=document.getElementById('portrait');if(!hl||!pt)return;try{if(CLS9.isOpen())return}catch(_){}const k=cls();
  if(!wrap||!wrap.isConnected){wrap=document.createElement('div');wrap.id='pwrap9';pt.parentNode.insertBefore(wrap,pt);wrap.appendChild(pt);wrap.insertAdjacentHTML('beforeend','<i class="ring" aria-hidden="true"></i><img class="emb" alt="" hidden>');
   bc=document.createElement('canvas');bc.id='pbanner9';bc.setAttribute('aria-hidden','true');hl.appendChild(bc);
   cx=document.createElement('div');cx.id='cxp9';cx.innerHTML='<span class="cl"><b></b><em></em></span><div class="hpb cx"><i></i></div>';const xb=document.getElementById('xpf');const row=xb&&xb.parentNode;if(row&&row.parentNode===hl)row.after(cx);else hl.appendChild(cx);hk=undefined;cxk=''}
  // gems and wings share one row, so the class bar fits without making the card taller
  {const gv=document.getElementById('gv'),hw=document.getElementById('hudWing');if(gv&&hw&&hw.parentNode!==gv.parentNode){gv.parentNode.classList.add('gw9');gv.parentNode.appendChild(hw)}}
  // the CHARACTER button hangs from the card's bottom edge, whatever the card's height
  {const bh=document.getElementById('bhub');if(bh&&hl.offsetWidth){const y=Math.round(hl.getBoundingClientRect().bottom-12);if(bh._y!==y){bh._y=y;bh.style.top=y+'px'}}}
  const show=!!k&&hl.offsetWidth>0;hl.classList.toggle('cls9on',show);
  if(!show){if(hk!==null){hk=null;bc.style.display=cx.style.display='none';wrap.querySelector('.emb').hidden=true}return}
  if(hk!==k){hk=k;const p=TH[k].pal;for(const[n,v]of[['--clsc',p[0]],['--clsl',p[1]],['--clsd',p[2]],['--clsa',p[3]]])hl.style.setProperty(n,v);
   const em=wrap.querySelector('.emb');em.src=A.emblem(k,48);em.hidden=false;bc.style.display='block';cx.style.display='';
   const d=Math.min(2,devicePixelRatio||1),bw=34,bh=84;bc.width=bw*d;bc.height=bh*d;const b2=bc.getContext('2d');b2.setTransform(d,0,0,d,0,0);b2.clearRect(0,0,bw,bh);A.banner(b2,k,bw,bh,0)}
  let L=1,mx=75,x=0,need=1;try{L=CLASS7.lv(k);mx=CLASS7.MAX||75;if(L<mx){need=CLASS7.need(L);x=Math.max(0,CLASS7.S.xp[k]||0)}}catch(_){}
  const f=L>=mx?1:Math.min(1,x/need),key=k+'|'+L+'|'+Math.round(f*500);if(key===cxk)return;cxk=key;
  let nm=k;try{nm=CLASS7.C[k].n}catch(_){}cx.querySelector('b').textContent=nm+' · Lv '+L+(L>=mx?' (max)':'');cx.querySelector('em').textContent=L>=mx?'MAX':fmtN(x)+' / '+fmtN(need)+' XP';
  cx.querySelector('i').style.width=(f*100).toFixed(1)+'%';cx.title=nm+' class level '+L+' of '+mx+(L<mx?' · '+Math.round(f*100)+'% to level '+(L+1):'')}
 setInterval(()=>{if(document.hidden)return;try{hud()}catch(e){if(!hud.e){hud.e=1;console.error('MYUI hud',e)}}},250);
 return{section,act,after,start,stop,hud,lookOf}})();
