// ===== MYUI: the mythic arsenal on screen.
// Classes screen (CLS9): every class gets its own look. The palette recolours the light, the title and the glass; a live background in the
// class motif (falling petals / leaves / feathers, rising embers, twinkling stars, a turning rune circle, lightning, blood drips, crows,
// ink, floating rock, turning gears); an animated anime hero of the class (hair and cloth sway, blinking, breathing, wings, holding its
// mythic scythe) inside an ornate frame; and a Mythic card: the scythe's name and creed, its tier, the three moves, what each tier unlocks,
// what the next ascension needs (with what you have), the Forge / Ascend button and the outfit switch.
// Character card (HUD): an ornate avatar frame and a hanging banner in the style of the class you are using. =====
const MYUI=(()=>{
 const A=MYART,TH=A.TH,TAU=Math.PI*2,R=Math.random,esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const red=()=>{try{return !!(cel.opt.reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
 const UNL=['Forged: the three-move combo','The first cut also fires a crescent','The finisher throws the scythe; it swings back','Hits echo with small bursts','A doubled finisher that heals you on hit'];
 const CROWN_Y=150,CROWN_S=6.2;   // where the crown piece sits on the hero portrait (SHOWART design space)
 const FXN={crescent:'◐',pillar:'▮',vortex:'◉',chains:'∞',flock:'≋',splash:'✺',bolts:'ϟ',stars:'✦',shards:'▲',ring:'◎'};
 // ---- the Mythic card
 function section(k){const th=TH[k],t=MYTH.tier(k),nx=MYTH.next(k),ck=MYTH.check(k),RN=MYTH.RN;
  const pips=[1,2,3,4,5].map(i=>'<i class="'+(i<=t?'on':'')+'">'+RN[i]+'</i>').join('');
  const mv=th.mv.map((m,i)=>'<li><span class="mvi" aria-hidden="true">'+(FXN[m[1]]||'✦')+'</span><div><b>'+(i+1)+' · '+esc(m[0])+'</b><small>'+esc(m[2])+'</small></div></li>').join('');
  const un=UNL.map((u,i)=>'<li class="'+(t>=i+1?'got':'')+'"><b>'+RN[i+1]+'</b><span>'+esc(u)+(i?' · +'+(22*i)+'% damage':'')+'</span></li>').join('');
  let req='';if(nx){const rows=[];const free=typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE,ac=MYTH.access(k);if(ac)rows.push([ac,false]);
   if(!free){rows.push([CLASS7.C[k].n+' level '+nx.lv+' (now '+CLASS7.lv(k)+')',CLASS7.lv(k)>=nx.lv]);if(nx.gems)rows.push([nx.gems+' gems (you have '+(gems|0)+')',(gems|0)>=nx.gems]);for(const[id,n]of nx.mats)rows.push([n+' × '+iname(id)+' ('+cnt(id)+')',cnt(id)>=n])}
   req='<ul class="c9req">'+rows.map(r=>'<li class="'+(r[1]?'ok':'no')+'">'+esc(r[0])+'</li>').join('')+'</ul>'+(nx.mats.length?'<p class="dim">Materials come from the depths: groves, caches, geodes, the Singing Crystals and the relic vaults.</p>':'')}
  const lab=!nx?'Fully ascended':t==0?'Forge '+th.n:'Ascend to Tier '+RN[nx.n];
  return'<section class="c9card c9my" id="c9-my"><div class="c9myh"><div><h4>Mythic scythe</h4><h3>'+esc(th.n)+'</h3><small>'+esc(th.ep)+'</small></div><div class="c9pips" title="Tier '+(t?RN[t]:'— (not forged)')+'">'+pips+'</div></div>'+
   '<blockquote>“'+esc(th.q)+'”</blockquote><h4>Combo</h4><ul class="c9mv">'+mv+'</ul><h4>Ascension</h4><ol class="c9un">'+un+'</ol>'+
   (nx?'<h4>'+(t==0?'To forge':'Next ascension')+'</h4>'+req:'')+
   '<div class="c9myb"><button class="c9asc" data-a="my:asc"'+(ck.ok?'':' aria-disabled="true"')+(ck.miss&&ck.miss.length?' title="Needs: '+esc(ck.miss.join(', '))+'"':'')+'>'+esc(lab)+'</button>'+
   (t>=1?'<button class="c9tog" data-a="my:out" aria-pressed="'+(MYTH.outfit?'true':'false')+'">Mythic outfit · '+(MYTH.outfit?'On':'Off')+'</button>':'')+'</div></section>'}
 function act(a,k){if(a=='asc')return MYTH.ascend(k);if(a=='out'){MYTH.setOutfit(!MYTH.outfit);return true}return false}
 // ---- live canvases on the Classes screen
 let root=null,raf=0,last=0,cur=null,bgP=[];
 function after(el,k){root=el;const p=TH[k].pal;el.style.setProperty('--m',p[0]);el.style.setProperty('--l',p[1]);el.style.setProperty('--d',p[2]);el.style.setProperty('--a',p[3]);el.dataset.cls=k;if(cur!==k){cur=k;bgP=[]}}
 function start(el){root=el;stop();last=0;raf=requestAnimationFrame(loop)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
 function fit(c){const r=c.getBoundingClientRect(),d=Math.min(1.5,devicePixelRatio||1),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h}return{w:r.width,h:r.height,d}}
 function loop(now){raf=requestAnimationFrame(loop);if(!root||!root.isConnected||root.style.display=='none'){stop();return}if(now-last<(red()?200:33))return;last=now;const t=now/1000,k=cur;if(!k)return;
  try{const fx=root.querySelector('.c9fx');if(fx)bg(fx,k,t)}catch(e){if(!loop.e1){loop.e1=1;console.error('MYUI bg',e)}}
  try{const hc=root.querySelector('.c9heroc');if(hc)hero(hc,k,t)}catch(e){if(!loop.e2){loop.e2=1;console.error('MYUI hero',e)}}}
 // background: motif particles that behave like their material, over a faint class sigil
 function bg(c,k,t){const{w,h,d}=fit(c),g=c.getContext('2d'),th=TH[k],p=th.pal,mo=th.mot;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  const n=red()?10:mo=='star'?60:mo=='rune'||mo=='gear'?14:34;
  while(bgP.length<n)bgP.push({x:R()*w,y:R()*h,s:.6+R()*.9,v:.4+R()*.8,a:R()*TAU,ph:R()*TAU,o:R()});
  const fall=mo=='petal'||mo=='leaf'||mo=='feather'||mo=='blood',rise=mo=='spark'||mo=='flame'||mo=='rock';
  for(const q of bgP){if(fall){q.y+=q.v*.9;q.x+=Math.sin(t+q.ph)*.5;q.a+=.01*q.v}else if(rise){q.y-=q.v*.6;q.x+=Math.sin(t*.7+q.ph)*.3}else if(mo=='crow'){q.x+=q.v*1.4;q.y+=Math.sin(t+q.ph)*.3}else if(mo=='ink'){q.o+=.004;if(q.o>1){q.o=0;q.x=R()*w;q.y=R()*h}}
   if(q.y>h+30){q.y=-20;q.x=R()*w}if(q.y<-30){q.y=h+20;q.x=R()*w}if(q.x>w+40){q.x=-30;q.y=R()*h}}
  // the big sigil behind the hero
  const sx=w*.24,sy=h*.48,sr=Math.min(w,h)*.36;g.save();g.translate(sx,sy);g.rotate(t*.05);g.globalAlpha=.16;g.strokeStyle=p[1];g.lineWidth=1;g.beginPath();g.arc(0,0,sr,0,TAU);g.stroke();g.beginPath();g.arc(0,0,sr*.86,0,TAU);g.stroke();
  for(let i=0;i<24;i++){const q=i/24*TAU;A.rune(g,Math.cos(q)*sr*.93,Math.sin(q)*sr*.93,5,p[1],q+Math.PI/2,i)}g.rotate(-t*.12);for(let i=0;i<6;i++){const q=i/6*TAU;g.beginPath();g.moveTo(Math.cos(q)*sr*.86,Math.sin(q)*sr*.86);g.lineTo(Math.cos(q+TAU/3)*sr*.86,Math.sin(q+TAU/3)*sr*.86);g.stroke()}g.restore();g.globalAlpha=1;
  if(mo=='bolt'&&R()<.02){g.globalCompositeOperation='lighter';A.bolt(g,R()*w,0,h*.5,Math.PI/2+(R()-.5)*.4,p[0],(R()*1e6)|0);g.globalCompositeOperation='source-over'}
  if(mo=='gear'){g.globalAlpha=.18;A.gear(g,w*.92,h*.18,90,p[3],t*.2);A.gear(g,w*.82,h*.32,50,p[3],-t*.36);g.globalAlpha=1}
  for(const q of bgP){const al=mo=='star'?.25+.6*Math.abs(Math.sin(t*1.3+q.ph)):mo=='ink'?Math.sin(q.o*Math.PI)*.5:.55;g.globalAlpha=al*(.5+q.s*.4);
   if(mo=='star')A.star4(g,q.x,q.y,2+q.s*3,q.o<.3?p[3]:'#ffffff',t*.3+q.ph);else if(mo=='crow')A.crow(g,q.x,q.y,8+q.s*8,0,'#0a0610',t*10+q.ph);else if(mo=='rune'){const rr=Math.min(w,h)*(.2+q.o*.5);A.rune(g,w*.5+Math.cos(t*.1*q.v+q.ph)*rr,h*.5+Math.sin(t*.1*q.v+q.ph)*rr*.6,6+q.s*6,p[q.o<.5?0:1],t*.2,(q.ph*10)|0)}
   else if(mo=='gear')A.gear(g,q.x,q.y,8+q.s*8,p[3],t*q.v*(q.o<.5?1:-1));else A.motif(g,k,q.x,q.y,5+q.s*6,q.a,t)}
  g.globalAlpha=1}
 // the hero: the anime portrait renderer (SHOWART) with a look of the class, its wings and its mythic scythe, inside an ornate frame
 function lookOf(k){const L=TH[k].look,ap=typeof AP!='undefined'?AP:{eyeCol:['#35c9c0']};return{skin:L.skin,hair:L.hair,eye:ap.eyeCol[L.eye%ap.eyeCol.length],out:L.out,trim:L.trim,hs:L.hs,es:L.gd?1:0,of:A.KEYS.indexOf(k)%6,acc:0,cape:1,gd:L.gd}}
 function hero(c,k,t){const{w,h,d}=fit(c),g=c.getContext('2d'),th=TH[k],p=th.pal;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);
  const gr=g.createRadialGradient(w*.5,h*.42,10,w*.5,h*.42,Math.max(w,h)*.7);gr.addColorStop(0,A.rgba(p[0],.32));gr.addColorStop(.55,A.rgba(p[2],.18));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  // halo behind the head
  g.save();g.translate(w*.5,h*.36);g.rotate(t*.15);g.globalCompositeOperation='lighter';g.strokeStyle=A.rgba(p[1],.5);g.lineWidth=1.5;g.beginPath();g.arc(0,0,Math.min(w,h)*.26,0,TAU);g.stroke();for(let i=0;i<8;i++){const q=i/8*TAU;g.beginPath();g.moveTo(Math.cos(q)*Math.min(w,h)*.26,Math.sin(q)*Math.min(w,h)*.26);g.lineTo(Math.cos(q)*Math.min(w,h)*.31,Math.sin(q)*Math.min(w,h)*.31);g.stroke()}g.restore();g.globalCompositeOperation='source-over';
  if(typeof SHOWART!='undefined'){g.save();const ih=h*.94;try{const zm=.86,dy=h*.06;SHOWART.draw(g,w,ih,{look:lookOf(k),t:red()?0:t,wpn:MYTH.ID(k),wingIdx:th.wing,gear:{},ox:w*.5,dy,zoom:zm});const sc=ih/760*zm,X=w*.5-310*sc,Y=ih-860*sc+60*sc+dy;g.save();g.translate(X+310*sc,Y+CROWN_Y*sc+Math.sin(t*1.5)*3*sc);g.scale(sc*CROWN_S,sc*CROWN_S);MYTH.drawCrown(g,k,0,0,1,t);g.restore()}catch(e){if(!hero.e){hero.e=1;console.error('MYUI showart',e)}}g.restore()}
  // the frame: thin metal lines with filigree corners, a crowning gem and the class motif at the corners
  g.save();const m=8;g.strokeStyle=A.metal(g,0,0,w,h,k,.15);g.lineWidth=2;g.strokeRect(m,m,w-m*2,h-m*2);g.strokeStyle=A.rgba(p[1],.5);g.lineWidth=1;g.strokeRect(m+5,m+5,w-m*2-10,h-m*2-10);
  const cn=[[m,m,0],[w-m,m,Math.PI/2],[w-m,h-m,Math.PI],[m,h-m,-Math.PI/2]];for(const[x,y,a]of cn){A.curl(g,x,y,26,a+.3,false,A.mix(p[1],'#ffffff',.3),2);A.curl(g,x,y,26,a+1.27,true,A.mix(p[1],'#ffffff',.3),2);A.gem(g,x,y,5,p[3],true)}
  A.gem(g,w/2,m,7,p[3],true);A.curl(g,w/2-6,m+2,18,Math.PI-.2,true,A.mix(p[1],'#ffffff',.3),1.6);A.curl(g,w/2+6,m+2,18,.2,false,A.mix(p[1],'#ffffff',.3),1.6);
  for(let i=0;i<4;i++){const tw=.5+.5*Math.sin(t*2+i*1.7);g.globalAlpha=tw;A.star4(g,[m+30,w-m-30,w-m-26,m+26][i],[m+24,m+30,h-m-28,h-m-34][i],4+tw*3,'#ffffff',t)}g.globalAlpha=1;
  g.font="600 9px Montserrat,'Segoe UI',sans-serif";g.textAlign='center';g.fillStyle=A.rgba(p[1],.8);g.fillText((th.n+' · '+(MYTH.tier(k)?'Tier '+MYTH.RN[MYTH.tier(k)]:'Not forged')).toUpperCase().split('').join(String.fromCharCode(8202)),w/2,h-m-12);g.restore()}
 // ---- HUD: the avatar frame and the class banner on the character card
 let fc=null,bc=null,hk=null,lay=null,layT=0;
 const cls=()=>{try{return CLASS7.cur()||CJOB.cur||null}catch(_){return null}};
 function hud(){const hl=document.getElementById('hudL'),pt=document.getElementById('portrait');if(!hl||!pt)return;const k=cls();
  if(!fc){fc=document.createElement('canvas');fc.id='pframe9';fc.setAttribute('aria-hidden','true');hl.appendChild(fc);bc=document.createElement('canvas');bc.id='pbanner9';bc.setAttribute('aria-hidden','true');hl.appendChild(bc)}
  const show=!!k&&hl.offsetParent!==null;fc.style.display=bc.style.display=show?'block':'none';hl.classList.toggle('cls9on',show);if(!show){hk=null;return}
  if(hk!==k){hk=k;hl.style.setProperty('--clsc',TH[k].pal[0])}
  // the layout is measured once a second (not every frame); the art redraws ~10 times a second
  const now=performance.now();if(!lay||now-layT>1000){layT=now;const hr=hl.getBoundingClientRect(),pr=pt.getBoundingClientRect();if(!pr.width)return;lay={pw:pr.width,S:Math.round(pr.width*1.9),x:Math.round(pr.left-hr.left+pr.width/2-pr.width*.95),y:Math.round(pr.top-hr.top+pr.height/2-pr.width*.95)};
   fc.style.width=fc.style.height=lay.S+'px';fc.style.left=lay.x+'px';fc.style.top=lay.y+'px'}
  const S=lay.S,pr={width:lay.pw},d=Math.min(2,devicePixelRatio||1);if(fc.width!==S*d){fc.width=fc.height=S*d}
  const t=performance.now()/1000,g=fc.getContext('2d');g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,S,S);A.frame(g,k,S/2,S/2,pr.width/2+1,red()?0:t);
  const bw=34,bh=84;if(bc.width!==bw*d){bc.width=bw*d;bc.height=bh*d}const b2=bc.getContext('2d');b2.setTransform(d,0,0,d,0,0);b2.clearRect(0,0,bw,bh);A.banner(b2,k,bw,bh,red()?0:t)}
 setInterval(()=>{if(document.hidden)return;try{hud()}catch(e){if(!hud.e){hud.e=1;console.error('MYUI hud',e)}}},100);
 return{section,act,after,start,stop,hud,lookOf}})();
