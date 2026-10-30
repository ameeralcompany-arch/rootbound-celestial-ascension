// ===== WORD9: the letter hunt, the Word Gate and the Inferno worlds. Every normal world (not the Plaza, not an Inferno) hides one word
// from a list of friendly words (CHEST, APPLE, KEY, DRAGON...), its letters scattered as shiny rainbow Letter Blocks (tile 18): on the
// surface, in caves and buried in stone, one per stretch of the map. Word, order and spots come from the world name, so they stay put across
// reloads; what you collected is saved per world (RB_PREFIX+'rbpword'). Touch a letter, break it or click it to collect it; the HUD strip
// shows the scrambled slots. With every letter found the Word Gate asks for the word (Enter / Esc, a hint after two misses, reopen with L or
// by clicking the strip). Solved at level 15+ it takes you to "<World> · Inferno" (world name + '-inf'): the same terrain burnt to ash,
// basalt and magma stone, lava instead of water (it burns, except in creative), embers in a red sky and four new, much stronger monsters
// (Molten Slime, Ember Imp with fireballs, Hellhound, Obsidian Golem) with better drops. Below level 15 an Inferno is refused.
// Cost: letters/glow/rainbow/sparkle frames are pre-rendered once; per frame at most 7 letters, the visible lava tiles (one pattern fill each),
// <=40 ember sprites and a few fireballs; the Inferno sky is three cached canvases. Nothing per frame is O(world). =====
const WORD9=(()=>{
 const LETTER=18,ASH=19,BASALT=78,MAGMA=79,SCORCH=99,OBSID=BASALT,LV=15,MINE=new Set([18,19,78,79,99]);// the last free ids below 100 (item keys are the tile ids; 100-199 mean seeds; 90-98 are summer objects): the dark rock under lava is Basalt
 const WORDS=['CHEST','APPLE','KEY','SWORD','CROWN','MAGIC','DRAGON','STAR','MOON','GEM','ROOT','TREE','BLOOM','LEAF','WING','HEART','SHIELD','CASTLE','FOREST','RIVER','STONE','GOLD','CANDLE','POTION','FAIRY','KNIGHT','LANTERN','CLOUD','SPARK','FLAME','FROST','PEARL','CRYSTAL','PLANET','COMET','HONEY','MAPLE','PANDA','TIGER','BREAD','ROBIN','OCEAN'];
 const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296,R=Math.random,rn=(a,b)=>a+R()*(b-a);
 const norm=n=>String(n||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)||'plaza',wsOf=n=>[...n].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7)%1000/10;
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const creative=()=>{try{return !!CRV8.on}catch(_){return false}};
 // ---- save: {w:{world:{got:[slot...],ok:solved,tr:wrong tries}},inf:{infernoName:baseWorld}}
 const KEY=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpword';let S={w:{},inf:{}};
 try{const o=JSON.parse(localStorage.getItem(KEY())||'null');if(o&&typeof o=='object'){if(o.w&&typeof o.w=='object')for(const n in o.w){const v=o.w[n];if(v&&typeof v=='object')S.w[norm(n)]={got:Array.isArray(v.got)?v.got.filter(i=>Number.isInteger(i)&&i>=0&&i<8):[],ok:v.ok?1:0,tr:Math.max(0,Math.min(99,v.tr|0))}}if(o.inf&&typeof o.inf=='object')for(const n in o.inf)if(typeof o.inf[n]=='string')S.inf[norm(n)]=norm(o.inf[n])}}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}},stOf=n=>S.w[n]||(S.w[n]={got:[],ok:0,tr:0}),peek=n=>S.w[n]||{got:[],ok:0,tr:0};
 // ---- worlds: '<base>-inf' is the Inferno of <base> (long names: 9 letters + a 3-char hash)
 const isInf=n=>typeof n=='string'&&n.length>4&&/-inf$/.test(n);
 function infName(b){b=norm(b);const n=b.length<=12?b+'-inf':b.slice(0,9)+(h32(b)%46656).toString(36).padStart(3,'0')+'-inf';S.inf[n]=b;return n}
 const baseOf=n=>S.inf[n]||n.slice(0,-4)||'plaza',pretty=n=>n=='plaza'?'The Plaza':String(n).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
 const label=n=>isInf(n)?pretty(baseOf(n))+' · Inferno':pretty(n),hasWord=n=>n!='plaza'&&!isInf(n);
 const wordFor=n=>WORDS[Math.floor(rr((h32(n)^0x5eed)>>>0)()*WORDS.length)];
 let INF=false,L=[],WORD='';
 // ---- blocks
 BLK[LETTER]=['Letter Block','#ffe27a',2];BLK[ASH]=['Ash','#6a6266',3];BLK[BASALT]=['Basalt','#3c3b43',6];BLK[MAGMA]=['Magma Stone','#d2481c',8];BLK[SCORCH]=['Scorched Earth','#4e2e26',3];
 for(const id of[ASH,BASALT,MAGMA,SCORCH]){try{PRICE[id]=Math.max(2,BLK[id][2]*2);LVREQ[id]=0}catch(_){}}try{GLOW7[MAGMA]=[255,120,40]}catch(_){}
 function paint(b,v){const c=cvs(T,T),x=c.getContext('2d'),Rb=rr(b*7919+v*131+3),col=BLK[b][1];
  if(b==LETTER){const gr=x.createLinearGradient(0,0,0,T);gr.addColorStop(0,'#3b2470');gr.addColorStop(1,'#170d33');x.fillStyle=gr;x.fillRect(0,0,T,T);x.strokeStyle='#ffe27a';x.lineWidth=3;x.strokeRect(2.5,2.5,T-5,T-5);x.fillStyle='#fff3b0';x.font='900 30px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('?',T/2,T/2+2);return c}
  const gr=x.createLinearGradient(0,0,T,T);gr.addColorStop(0,mixc(col,1.18));gr.addColorStop(1,mixc(col,.72));x.fillStyle=gr;x.fillRect(0,0,T,T);
  if(b==ASH){for(let i=0;i<26;i++){x.fillStyle=Rb()<.5?'rgba(255,255,255,.1)':'rgba(0,0,0,.18)';x.fillRect(Rb()*T,Rb()*T,2+Rb()*4,2+Rb()*3)}x.fillStyle='#8a8288';x.fillRect(0,0,T,7);x.fillStyle='#a49ca2';x.fillRect(0,0,T,2);for(let i=0;i<4;i++){x.fillStyle='rgba(255,'+(110+Rb()*80|0)+',40,.9)';x.fillRect(Rb()*T,8+Rb()*(T-12),2,2)}}
  else if(b==SCORCH){for(let i=0;i<24;i++){x.fillStyle=Rb()<.5?'rgba(255,170,120,.08)':'rgba(0,0,0,.2)';x.fillRect(Rb()*T,Rb()*T,2+Rb()*6,2+Rb()*4)}x.strokeStyle='rgba(20,6,4,.55)';x.lineWidth=1.5;for(let i=0;i<3;i++){x.beginPath();let px=Rb()*T,py=Rb()*T;x.moveTo(px,py);for(let k=0;k<3;k++){px+=(Rb()-.5)*16;py+=(Rb()-.5)*16;x.lineTo(px,py)}x.stroke()}}
  else if(b==BASALT){x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=2;for(let i=1;i<3;i++){x.beginPath();x.moveTo(i*16+(Rb()-.5)*4,0);x.lineTo(i*16+(Rb()-.5)*4,T);x.stroke()}x.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<3;i++)x.fillRect(i*16+2,0,4,T);for(let i=0;i<14;i++){x.fillStyle='rgba(0,0,0,.22)';x.fillRect(Rb()*T,Rb()*T,2,2)}}
  else if(b==MAGMA){x.fillStyle='#2a1612';x.fillRect(0,0,T,T);x.lineCap='round';for(const[w,c2]of[[6,'rgba(255,90,20,.55)'],[2.5,'#ffb040']]){x.strokeStyle=c2;x.lineWidth=w;const R2=rr(b*31+v*7);for(let i=0;i<3;i++){x.beginPath();let px=R2()*T,py=R2()*T;x.moveTo(px,py);for(let k=0;k<4;k++){px+=(R2()-.5)*22;py+=(R2()-.5)*22;x.lineTo(px,py)}x.stroke()}}}
  x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=3;x.strokeRect(1.5,1.5,T-3,T-3);x.strokeStyle='rgba(255,255,255,.14)';x.lineWidth=2;x.beginPath();x.moveTo(4,T-5);x.lineTo(4,4);x.lineTo(T-5,4);x.stroke();return c}
 {const _bs=blockSprite;blockSprite=function(b,v){if(MINE.has(b))return paint(b,v);return _bs.apply(this,arguments)}}
 // ---- letters: word, scramble and spots for the current world (called right after the terrain is generated, before saved edits apply)
 function place(){L=[];WORD='';if(!hasWord(cur))return;const R0=rr((h32(cur)^0x1e77e2)>>>0);WORD=wordFor(cur);const n=WORD.length;
  const sc=[...WORD];for(let i=n-1;i>0;i--){const j=Math.floor(R0()*(i+1));[sc[i],sc[j]]=[sc[j],sc[i]]}if(sc.join('')==WORD)sc.push(sc.shift());
  const x0=6,x1=W-7,seg=(x1-x0)/n,segs=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(R0()*(i+1));[segs[i],segs[j]]=[segs[j],segs[i]]}
  const used=new Set(),off=Math.floor(R0()*3),okX=x=>Math.abs(x-DX)>5,rx=(a,b)=>a+Math.floor(R0()*Math.max(1,b-a));
  const KIND={surf(a,b){for(let t=0;t<40;t++){const x=rx(a,b);if(!okX(x))continue;const s=sh(x),k=(s-1)*W+x;if(s<3||tiles[k]||wl[k]||wl[k-W]||trees.has(k)||used.has(k))continue;const gb=tiles[s*W+x];if(gb&&SOLID6[gb])return k}return -1},
   cave(a,b){for(let t=0;t<80;t++){const x=rx(a,b),s=sh(x),y=s+8+Math.floor(R0()*Math.max(1,H-s-14)),k=y*W+x;if(y>=H-4||tiles[k]||wl[k]||used.has(k))continue;const gb=tiles[k+W];if(gb&&SOLID6[gb])return k}return -1},
   deep(a,b){for(let t=0;t<80;t++){const x=rx(a,b),s=sh(x),y=s+12+Math.floor(R0()*Math.max(1,H-s-17)),k=y*W+x;if(y>=H-3||used.has(k))continue;const b0=tiles[k];if(b0==3||b0==77||b0==1)return k}return -1}};
  const ORD=['surf','cave','deep'];
  for(let i=0;i<n;i++){const a=Math.floor(x0+segs[i]*seg),b=Math.floor(x0+(segs[i]+1)*seg);let k=-1;for(let j=0;j<3&&k<0;j++)k=KIND[ORD[(i+off+j)%3]](a,b);for(let j=0;j<3&&k<0;j++)k=KIND[ORD[j]](x0,x1);if(k<0)continue;
   used.add(k);tiles[k]=LETTER;hp[k]=BLK[LETTER][2];wl[k]=0;L.push({k,ch:sc[i],i})}}
 // after the saved edits: letters not collected yet are always there, collected ones are gone
 function sync(){if(!L.length)return;const st=peek(cur);for(const l of L){const got=st.got.includes(l.i);if(!got&&tiles[l.k]!=LETTER){tiles[l.k]=LETTER;hp[l.k]=BLK[LETTER][2];wl[l.k]=0;trees.delete(l.k)}else if(got&&tiles[l.k]==LETTER){tiles[l.k]=0;hp[l.k]=0}}}
 const gotN=()=>{const st=peek(cur);return L.filter(l=>st.got.includes(l.i)).length};
 const NOTE=[523,587,659,784,880,988,1047];
 function collect(l){if(!l||!hasWord(cur))return false;const st=stOf(cur);if(st.got.includes(l.i))return false;st.got.push(l.i);save();
  if(tiles[l.k]==LETTER){tiles[l.k]=0;hp[l.k]=0;try{pushEdit(l.k)}catch(_){}}
  const x=(l.k%W+.5)*T,y=((l.k/W|0)+.5)*T,n=gotN();
  try{VFX.burst(x,y,['#ff6a8a','#ffb84a','#ffe86a','#6aff9a','#5ad0ff','#b07aff'],26,320,1,.9,14);VFX.wave(x,y,'#fff6c0',70,.5,1)}catch(_){}try{burst(x,y,'#ffe27a',10,160,4,'p');rings.push({x,y,c:'#ffe27a',t:performance.now()})}catch(_){}
  try{ft(x,y-18,'+'+l.ch,'#ffe27a')}catch(_){}try{gain(6,x,y-34)}catch(_){}
  try{const f=NOTE[Math.min(NOTE.length-1,n-1)];SFX7.tone(f,f*1.01,.18,'triangle',.07);SFX7.tone(f*1.5,f*1.5,.22,'sine',.05,.08);SFX7.tone(f*2,f*2.02,.3,'sine',.035,.16,1)}catch(_){}
  fly(l,x,y);strip();
  if(n>=L.length){try{UI6.say6('ALL LETTERS FOUND','Unscramble the word at the Word Gate',2600)}catch(_){}setTimeout(()=>{if(hasWord(cur)&&gotN()>=L.length&&!peek(cur).ok)open()},1300)}else say('Letter '+l.ch+' found  ·  '+n+'/'+L.length+'  ·  the hidden word has '+L.length+' letters');return true}
 // breaking (any tool, any power) collects instead of mining; outermost wrapper, so no other break logic sees the tile
 {const _ba=breakAt;breakAt=function(x,y){if(x>=0&&y>=0&&x<W&&y<H&&tiles[y*W+x]==LETTER){const k=y*W+x,l=L.find(q=>q.k==k);if(l)return collect(l)||true;tiles[k]=0;hp[k]=0;try{pushEdit(k)}catch(_){}return true}return _ba.apply(this,arguments)}}
 // ---- HUD strip (scrambled slots) + the letter flying into it
 let SE=null,shown=null;const reduce=()=>{try{return document.documentElement.getAttribute('data-reduce')=='true'||matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}};
 function ens(){if(SE)return SE;SE=document.createElement('div');SE.id='wl9';SE.className='pn';SE.setAttribute('role','button');SE.title='Hidden word letters (L: Word Gate)';SE.style.display='none';SE.onclick=()=>open();document.body.appendChild(SE);return SE}
 function strip(){const el=ens();if(INF){el.className='pn inf';el.innerHTML='<span class="t">Inferno</span><em>Lava burns · the door leads home</em>';return}el.className='pn';if(!L.length){el.innerHTML='';return}
  const st=peek(cur),n=gotN();let h='<span class="t">Hidden word</span><span class="sl">';for(const l of L){const g=st.got.includes(l.i);h+='<i class="'+(g?'on':'')+'" data-i="'+l.i+'">'+(g?l.ch:'')+'</i>'}
  h+='</span>'+(st.ok?'<em class="ok">Gate open · L</em>':n>=L.length?'<em class="go">Word Gate · L</em>':'<em>'+n+'/'+L.length+'</em>');el.innerHTML=h;el.classList.toggle('full',n>=L.length)}
 function vis(){const el=ens(),v=!!(entered&&(L.length||INF)&&menuEl.style.display=='none'&&!document.body.classList.contains('c7w-on'));if(v!==shown){shown=v;el.style.display=v?'':'none'}}
 function fly(l,x,y){if(reduce()||!SE||SE.style.display=='none')return;const sl=SE.querySelector('i[data-i="'+l.i+'"]');if(!sl)return;const r=sl.getBoundingClientRect(),k=innerWidth/cv.width*ZM,sx=(x-cam.x)*k,sy=(y-cam.y)*k;
  const f=document.createElement('span');f.className='wl9f';f.textContent=l.ch;f.style.left=sx+'px';f.style.top=sy+'px';document.body.appendChild(f);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transform='translate('+(r.left+r.width/2-sx)+'px,'+(r.top+r.height/2-sy)+'px) scale(.6)';f.style.opacity='.2'}));setTimeout(()=>f.remove(),800)}
 // ---- the Word Gate modal (same look as the shared dialogs)
 let MD=null,mode='',openF=false,cT=0;
 function open(){if(INF||!L.length||!entered)return false;const st=peek(cur),n=gotN();if(n<L.length&&!st.ok){say('Find every letter first  ·  '+n+'/'+L.length+' found');if(SE){SE.classList.remove('nudge');void SE.offsetWidth;SE.classList.add('nudge')}return false}
  if(!MD){MD=document.createElement('div');MD.id='wg9';MD.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="wg9t"></div>';document.body.appendChild(MD);MD.addEventListener('mousedown',e=>{if(e.target===MD)close()})}
  try{mdL=mdR=false}catch(_){}clearTimeout(cT);render(st.ok?'done':'ask');MD.style.display='flex';void MD.offsetWidth;MD.classList.add('on');openF=true;try{UIS.play('open')}catch(_){}return true}
 function close(){if(!MD||!openF)return;openF=false;MD.classList.remove('on');try{UIS.play('close')}catch(_){}clearTimeout(cT);cT=setTimeout(()=>{if(MD&&!openF)MD.style.display='none'},200);try{document.activeElement&&document.activeElement.blur()}catch(_){}}
 const isOpen=()=>openF;
 function render(m){mode=m;const st=peek(cur),box=MD.firstChild,tl=L.map(l=>'<i>'+l.ch+'</i>').join(''),inf=label(infName(cur)),lv=lvl|0;
  if(m=='ask')box.innerHTML='<h3 id="wg9t">The Word Gate</h3><p>You found every hidden letter of this world. Put them in the right order to open the gate.</p><div class="tl">'+tl+'</div>'
   +'<label>Your word ('+L.length+' letters)<input id="wg9i" type="text" maxlength="'+(L.length+4)+'" autocomplete="off" spellcheck="false" autocapitalize="characters"></label>'
   +'<p class="hint"'+(st.tr>=2?'':' hidden')+'>Hint: it starts with <b>'+WORD[0]+'</b></p><p class="err" aria-live="polite"></p><div class="acts"><button data-x>Cancel</button><button data-ok class="pri">Open the gate</button></div>';
  else box.innerHTML='<h3 id="wg9t">The gate is open</h3><p>The word was <b class="rw">'+WORD+'</b>.</p>'+(lv<LV?'<p>Beyond it lies <b>'+esc(inf)+'</b>: lava, fire and far stronger monsters. You need <b>level '+LV+'</b> to go (you are level '+lv+'). Come back any time: press L or click the letters.</p><div class="acts"><button data-x class="pri">OK</button></div>'
   :'<p>Beyond it lies <b>'+esc(inf)+'</b>: a burning version of this world with lava, fire and far stronger monsters.</p><div class="acts"><button data-x>Not now</button><button data-go class="pri">Enter the Inferno</button></div>');
  const q=s=>box.querySelector(s);if(q('[data-x]'))q('[data-x]').onclick=close;if(q('[data-ok]'))q('[data-ok]').onclick=()=>submit(q('#wg9i').value);if(q('[data-go]'))q('[data-go]').onclick=()=>travel();
  const i=q('#wg9i');if(i)i.addEventListener('keydown',e=>{if(e.key=='Enter'){e.preventDefault();e.stopPropagation();submit(i.value)}});
  setTimeout(()=>{try{(i||q('[data-go]')||q('[data-x]')).focus()}catch(_){}},40)}
 function submit(v){if(!MD||!L.length)return false;const st=stOf(cur),g=String(v||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(g==WORD){st.ok=1;save();strip();const x=P.x,y=P.y;try{VFX.levelUp(x,y,'#ffe27a');VFX.burst(x,y+20,['#ff6a8a','#ffe86a','#6aff9a','#5ad0ff','#b07aff'],40,380,2,1.2,16)}catch(_){}
   try{[0,1,2,3].forEach(i=>SFX7.tone(NOTE[i*2]||1047,(NOTE[i*2]||1047)*1.01,.32,'triangle',.07,i*.09))}catch(_){}
   if((lvl|0)>=LV){close();try{UI6.say6('THE GATE OPENS',label(infName(cur)),2400)}catch(_){}setTimeout(travel,700)}else render('done');return true}
  st.tr++;save();const box=MD.firstChild,e=box.querySelector('.err'),h=box.querySelector('.hint');if(e)e.textContent=g?'Not quite. Try again!':'Type the word first.';if(h&&st.tr>=2)h.hidden=false;
  box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');try{SFX7.tone(330,250,.16,'sine',.05);SFX7.tone(262,200,.2,'sine',.04,.1)}catch(_){}
  const i=box.querySelector('#wg9i');if(i){i.select();i.focus()}return false}
 function travel(){if(INF||!hasWord(cur)||!peek(cur).ok)return false;if((lvl|0)<LV){say('Reach level '+LV+' to enter the Inferno');return false}const n=infName(cur);save();close();try{enterWorld(n)}catch(e){console.error('WORD9 travel',e);return false}return true}
 addEventListener('keydown',e=>{if(isOpen()&&e.key=='Escape'){e.stopPropagation();e.preventDefault();close();return}if(e.repeat||isTextEl(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key=='l'||e.key=='L'){if(!entered||menuEl.style.display!='none'||isOpen())return;open()}},true);
 // ---- Inferno: same seed as the base world, burnt; extra lava pockets in the caves
 function burn(){const M=new Uint8Array(256);for(let i=0;i<256;i++)M[i]=i;M[1]=SCORCH;M[2]=ASH;M[3]=BASALT;M[8]=OBSID;M[42]=ASH;M[43]=SCORCH;M[48]=104;M[105]=104;M[106]=104;M[113]=0;M[15]=0;
  const R0=rr((h32(cur)^0xf1e7)>>>0);for(let k=0;k<W*H;k++){const b=tiles[k];if(!b)continue;let m=M[b];if(m==BASALT&&k>W*12&&R0()<.022)m=MAGMA;if(m!==b){tiles[k]=m;hp[k]=m?BLK[m][2]:0}}trees.clear();
  for(let i=0;i<34;i++){const x=3+(R0()*(W-6)|0),s=sh(x),y0=s+14+(R0()*Math.max(1,H-s-20)|0);if(y0>=H-4||tiles[y0*W+x])continue;let y=y0;while(y<H-3&&!tiles[(y+1)*W+x])y++;if(y>=H-3)continue;
   let l=x,r=x;while(l>2&&!tiles[y*W+l-1]&&x-l<6)l--;while(r<W-3&&!tiles[y*W+r+1]&&r-x<6)r++;for(let xx=l;xx<=r;xx++){wl[y*W+xx]=8;const kb=(y+1)*W+xx;if(tiles[kb]&&tiles[kb]!=4){tiles[kb]=OBSID;hp[kb]=BLK[OBSID][2]}}}}
 {const _g=gen;gen=function(){const inf=cur!='plaza'&&isInf(cur);if(inf){const b=baseOf(cur);try{ws=wsOf(b);SHN=VILL9.verOf(b)==2?VILL9.terrain(ws).h:null}catch(e){console.error('WORD9 seed',e)}}
  const r=_g.apply(this,arguments);try{if(inf){L=[];WORD='';burn()}else place()}catch(e){console.error('WORD9 gen',e)}return r}}
 let wxSet=false;
 {const _lw=loadWorld;loadWorld=function(n,e){let nm=norm(n);if(isInf(nm)&&(lvl|0)<LV){const b=baseOf(nm);n=b;e=undefined;nm=b;setTimeout(()=>{say('The Inferno needs level '+LV+' (you are level '+(lvl|0)+')');try{UI6.say6('TOO HOT TO ENTER','Reach level '+LV+' to brave the Inferno',2800)}catch(_){}},60)}
  const r=_lw.call(this,n,e);try{INF=isInf(cur);EM.length=0;FB.length=0;sync();strip();shown=null;vis();
   if(INF){if(!WX6.force||wxSet){WX6.force='clear';wxSet=true}try{for(const s in WX6.I)WX6.I[s]=s==WX6.force?1:0;WX6.reset()}catch(_){}try{document.getElementById('wname').textContent=label(cur)}catch(_){}const c=document.querySelector('#cine7w .c7w-card b');if(c)c.textContent=label(cur);setTimeout(()=>{try{if(INF)UI6.say6(label(cur).toUpperCase(),'Lava burns · the monsters here hit hard',3000)}catch(_){}},400)}
   else if(wxSet){WX6.force=null;wxSet=false}}catch(err){console.error('WORD9 load',err)}return r}}
 {const _ev=enterWorld;enterWorld=function(n){const nm=norm(n);if(isInf(nm)&&(lvl|0)<LV&&entered){say('The Inferno needs level '+LV+' (you are level '+(lvl|0)+')');try{UI6.say6('TOO HOT TO ENTER','Reach level '+LV+' to brave the Inferno',2800)}catch(_){}try{menuEl.style.display='none'}catch(_){}return}return _ev.apply(this,arguments)}}
 // ---- lava (Inferno water): one pattern fill per visible tile, a pre-rendered crest on the surface, lava lights the dark
 let LTEX=null,LPAT=null,LCR=null,BUB=null;const LDK=['rgba(60,0,0,0)','rgba(60,4,0,.14)','rgba(60,4,0,.26)','rgba(50,2,0,.36)','rgba(40,0,0,.44)'];
 function mkLava(){LTEX=cvs(128,128);const x=LTEX.getContext('2d'),R2=rr(9091);x.fillStyle='#e0501a';x.fillRect(0,0,128,128);
  for(const[n,c,r0,r1]of[[18,'rgba(150,30,8,.55)',10,24],[22,'rgba(255,140,40,.55)',6,16],[14,'rgba(255,214,90,.6)',3,8]])for(let i=0;i<n;i++){const cx=R2()*128,cy=R2()*128,r=r0+R2()*(r1-r0);for(const ox of[-128,0,128])for(const oy of[-128,0,128]){const gr=x.createRadialGradient(cx+ox,cy+oy,0,cx+ox,cy+oy,r);gr.addColorStop(0,c);gr.addColorStop(1,c.replace(/[\d.]+\)$/,'0)'));x.fillStyle=gr;x.fillRect(cx+ox-r,cy+oy-r,r*2,r*2)}}
  LPAT=g.createPattern(LTEX,'repeat');
  LCR=cvs(T+2,22);const y=LCR.getContext('2d'),gr=y.createLinearGradient(0,0,0,22);gr.addColorStop(0,'rgba(255,240,170,0)');gr.addColorStop(.32,'rgba(255,236,150,.95)');gr.addColorStop(.5,'rgba(255,170,60,.7)');gr.addColorStop(1,'rgba(255,120,30,0)');y.fillStyle=gr;y.fillRect(0,0,T+2,22);
  BUB=cvs(16,16);const b=BUB.getContext('2d');b.strokeStyle='#ffd27a';b.lineWidth=2;b.beginPath();b.arc(8,8,5,0,6.3);b.stroke();b.fillStyle='rgba(255,240,180,.8)';b.fillRect(5,5,2,2)}
 function lava(x0,x1,y0,y1,now){if(!LPAT)mkLava();const t=now/1000;let lights=0;
  try{LPAT.setTransform(new DOMMatrix([1,0,0,1,-cam.x+t*7,-cam.y+t*3]))}catch(_){}g.save();
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const k=y*W+x,v=wl[k];if(!v||tiles[k])continue;const above=y>0&&wl[k-W]>0,full=above||v>=8,h=full?T:Math.max(4,v/8*T),px=x*T-cam.x,bot=y*T-cam.y+T;
   const wv=above?0:Math.sin(t*1.7+x*.8)*1.4,py=bot-h+wv;g.fillStyle=LPAT;g.fillRect(px,py,T+1,bot-py+1);
   let d=0;for(let j=1;j<=4&&y-j>=0&&wl[k-W*j]>0;j++)d++;if(d){g.fillStyle=LDK[d];g.fillRect(px,py,T+1,bot-py+1)}
   if(!above){g.globalCompositeOperation='lighter';g.drawImage(LCR,px-1,py-7,T+2,22);const u=(t*.45+x*.37+y*.11)%1;if(((x*7+y*3)%5)==0&&u<.7){g.globalAlpha=1-u/.7;g.drawImage(BUB,px+10+((x*13)%24),py+6-u*10,10+u*6,10+u*6);g.globalAlpha=1}g.globalCompositeOperation='source-over';
    if(lights<12&&x%3==0){lights++;try{lampL.push(px+T/2,py+T/2)}catch(_){}}}}
  g.restore()}
 // jumping into lava sends up sparks, not water drops and bubbles; no blue underwater tint (the burn flashes red instead)
 {const _sf=splashFx,_bf=bubFx;splashFx=function(x,y){if(!INF)return _sf.apply(this,arguments);try{VFX.burst(x,y,['#ffb040','#ff6a2a','#fff0a0'],14,240,1,.6,10);noise(.3,900,.14);snd(120,.2,'sawtooth',.04,.5)}catch(_){}};bubFx=function(){if(!INF)return _bf.apply(this,arguments)}}
 {const _dw=drawWater;drawWater=function(x0,x1,y0,y1,now){if(!INF)return _dw.apply(this,arguments);try{R3D.shade3D(x0,x1,y0,y1)}catch(_){}try{lava(x0,x1,y0,y1,now)}catch(e){if(!WORD9.err){WORD9.err=1;console.error('WORD9 lava',e)}}}}
 // ---- Inferno sky: gradient + hazy blood sun (cached), two parallax ridges of volcanoes (cached, tileable)
 let SKY=null,RG1=null,RG2=null;
 function mkSky(){SKY=cvs(640,360);let x=SKY.getContext('2d'),gr=x.createLinearGradient(0,0,0,360);gr.addColorStop(0,'#0c0208');gr.addColorStop(.42,'#36090f');gr.addColorStop(.72,'#8e240e');gr.addColorStop(.88,'#f0601c');gr.addColorStop(1,'#4a1006');x.fillStyle=gr;x.fillRect(0,0,640,360);
  let rg=x.createRadialGradient(470,118,4,470,118,120);rg.addColorStop(0,'rgba(255,190,120,.55)');rg.addColorStop(1,'rgba(255,90,40,0)');x.fillStyle=rg;x.fillRect(330,0,280,260);x.fillStyle='rgba(255,130,70,.75)';x.beginPath();x.arc(470,118,26,0,6.3);x.fill();
  const R2=rr(4242);for(let i=0;i<9;i++){x.fillStyle='rgba(24,6,10,'+(.25+R2()*.3)+')';const cx=R2()*640,cy=30+R2()*170,w=90+R2()*160;for(let k=0;k<4;k++){x.beginPath();x.ellipse(cx+(k-1.5)*w*.25,cy+(k%2)*6,w*.3,w*.07,0,0,6.3);x.fill()}}
  for(let i=0;i<70;i++){x.fillStyle='rgba(255,'+(120+R2()*90|0)+',60,'+(.2+R2()*.5)+')';x.fillRect(R2()*640,R2()*300,1.5,1.5)}
  const ridge=(c,base,amp,seed,glow)=>{const C=cvs(1280,240),y=C.getContext('2d'),f=px=>base-(Math.abs(Math.sin(px/1280*6.283*2+seed))*.5+Math.abs(Math.sin(px/1280*6.283*5+seed*2))*.3+Math.sin(px/1280*6.283*13+seed)*.06+.14)*amp;
   y.fillStyle=c;y.beginPath();y.moveTo(0,240);for(let px=0;px<=1280;px+=10)y.lineTo(px,f(px));y.lineTo(1280,240);y.closePath();y.fill();
   if(glow)for(let i=0;i<3;i++){const px=(i+.5)*1280/3,py=f(px);let r=y.createRadialGradient(px,py,2,px,py,70);r.addColorStop(0,'rgba(255,150,60,.7)');r.addColorStop(1,'rgba(255,80,20,0)');y.fillStyle=r;y.fillRect(px-70,py-70,140,140);y.lineCap='round';for(const[lw,c2]of[[7,'rgba(255,90,20,.35)'],[3,'rgba(255,160,60,.8)']]){y.strokeStyle=c2;y.lineWidth=lw;for(const s of[-1,1]){y.beginPath();y.moveTo(px+s*3,py+3);y.quadraticCurveTo(px+s*10,py+22,px+s*20,py+46);y.stroke()}}}return C};
  RG1=ridge('#24070a',150,120,1.3,true);RG2=ridge('#0e0305',200,90,4.1,false)}
 function sky(w,hh){if(!SKY)mkSky();g.drawImage(SKY,0,0,w,hh);const k=hh/360;for(const[c,pk,y0]of[[RG1,.03,.36],[RG2,.08,.52]]){const cw=1280*k,ch=240*k,ox=-((cam.x*pk)%cw+cw)%cw;for(let x=ox;x<w;x+=cw)g.drawImage(c,x,hh*y0,cw+1,ch)}g.fillStyle='#0e0305';const by=hh*.52+240*k;if(by<hh)g.fillRect(0,by-1,w,hh-by+1)}
 {const _ds=drawSky;drawSky=function(w,hh,now){if(!INF)return _ds.apply(this,arguments);try{sky(w,hh)}catch(e){_ds.apply(this,arguments)}}}
 // ---- Inferno monsters: stronger than anything in a normal world (normal max: 95 HP, 15 damage); never spawn outside an Inferno
 const IM={inf_slime:{c:'#ff6a2a',hp:190,w:50,h:34,gem:26,dmg:18,ai:'hop',jp:720,sx:240,cd:.6,n:'Molten Slime'},inf_imp:{c:'#ff4a3a',hp:150,w:34,h:34,gem:30,dmg:16,ai:'fly',fly:1,spm:1.35,n:'Ember Imp'},
  inf_hound:{c:'#ff8a3a',hp:230,w:58,h:36,gem:34,dmg:22,ai:'walk',spm:2.1,n:'Hellhound'},inf_golem:{c:'#7a5ac8',hp:460,w:54,h:64,gem:60,dmg:30,ai:'walk',spm:.75,n:'Obsidian Golem'}};
 const DROP={inf_slime:[290,'Molten Core','#ff7a2a',70],inf_imp:[291,'Imp Horn','#ff4a3a',75],inf_hound:[292,'Hellfang','#ffb04a',85],inf_golem:[293,'Obsidian Heart','#7a5ac8',140]};
 for(const k in IM){MK[k]=Object.assign({min:9999,max:9999,inf:1},IM[k]);const d=DROP[k];MAT[d[0]]={n:d[1],c:d[2],p:d[3]};MOBMAT[k]=d[0]}
 {const _pm=pickMob;pickMob=function(dp){if(!INF)return _pm.apply(this,arguments);const pool=dp<6?[['inf_hound',3],['inf_imp',3],['inf_slime',3],['inf_golem',1.2]]:[['inf_slime',3],['inf_imp',2],['inf_golem',2],['inf_hound',2]];let t=0;for(const p of pool)t+=p[1];let r=R()*t;for(const p of pool){r-=p[1];if(r<=0)return p[0]}return pool[0][0]}}
 {const _md=mobDrops;mobDrops=function(m){const r=_md.apply(this,arguments);try{if(MK[m.k]&&MK[m.k].inf){for(let i=0;i<3;i++)spawnDrop(m.x,m.y,'gem',3);if(R()<.3)spawnDrop(m.x,m.y,[73,74,75,76,10][R()*5|0],1);if(R()<.35)spawnDrop(m.x,m.y,MAGMA,1+(R()*2|0))}}catch(_){}return r}}
 function spawnAt(k,x,y){const d=MK[k];if(!d)return null;const m={k,x,y,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:R()*6,t:rn(.5,1.5),dir:R()<.5?-1:1,fade:0,g:false,wall:0};mobs.push(m);return m}
 // art: drawn like the classic monsters (outlined, flat colours, white flash on hit); the glow is one cached sprite
 let MG=null;const mglow=()=>MG||(MG=(()=>{const c=cvs(96,96),x=c.getContext('2d'),gr=x.createRadialGradient(48,48,2,48,48,48);gr.addColorStop(0,'rgba(255,140,50,.6)');gr.addColorStop(1,'rgba(255,70,20,0)');x.fillStyle=gr;x.fillRect(0,0,96,96);return c})());
 function art(m,now,px,py){g.save();try{art0(m,now,px,py)}finally{g.restore()}}
 function art0(m,now,px,py){const k=m.k,fl=m.fl>0,F=(c)=>fl?'#fff':c;g.translate(px,py+m.h);g.globalAlpha=m.fade;g.lineWidth=2.5;g.strokeStyle='rgba(20,10,20,.92)';g.lineJoin='round';g.lineCap='round';const t=now/1000+m.ph;
  const glow=(y,s,a)=>{g.globalCompositeOperation='lighter';g.globalAlpha=m.fade*a;g.drawImage(mglow(),-s/2,y-s/2,s,s);g.globalAlpha=m.fade;g.globalCompositeOperation='source-over'};
  const eye=(ex,ey,r,c)=>{g.fillStyle=F(c||'#ffe66a');g.beginPath();g.ellipse(ex,ey,r,r*.8,0,0,6.3);g.fill();g.stroke();g.fillStyle='#1a0a0a';g.fillRect(ex-1,ey-r*.6,2,r*1.2)};
  const dir=(m.vx||m.dir||1)<0?-1:1;
  if(k=='inf_slime'){glow(-m.h*.5,104,.85);const sq=m.g?1+Math.sin(t*4)*.05:1+Math.min(.28,Math.abs(m.vy)/1800),w=m.w/2*(2-sq),h=m.h*sq;g.fillStyle=F('#ff6a2a');g.beginPath();g.moveTo(-w,0);g.bezierCurveTo(-w*1.12,-h*.9,-w*.6,-h*1.12,0,-h*1.1);g.bezierCurveTo(w*.6,-h*1.12,w*1.12,-h*.9,w,0);g.closePath();g.fill();g.stroke();
   if(!fl){g.fillStyle='#3a1a16';for(const[ox,oy,s]of[[-.5,.86,.24],[.08,1.0,.28],[.52,.8,.2]]){g.beginPath();g.moveTo(ox*w-s*w,-oy*h+2);g.lineTo(ox*w-s*w*.3,-oy*h-s*h*.5);g.lineTo(ox*w+s*w,-oy*h-1);g.lineTo(ox*w+s*w*.5,-oy*h+s*h*.45);g.closePath();g.fill()}
    g.fillStyle='rgba(255,240,160,.85)';g.beginPath();g.ellipse(-w*.45,-h*.55,4,2.5,-.4,0,6.3);g.fill();g.fillStyle='#ffd25a';const dr=(t*1.3)%1;g.beginPath();g.ellipse(w*.62,-h*.1+dr*8,2.5,3.5+dr*2,0,0,6.3);g.fill()}
   eye(-9,-h*.6,5.5);eye(9,-h*.6,5.5);g.strokeStyle='rgba(20,10,20,.92)';g.beginPath();g.moveTo(-15,-h*.84);g.lineTo(-4,-h*.74);g.moveTo(15,-h*.84);g.lineTo(4,-h*.74);g.stroke();g.beginPath();g.moveTo(-6,-h*.28);g.lineTo(-2,-h*.34);g.lineTo(2,-h*.28);g.lineTo(6,-h*.34);g.stroke()}
  else if(k=='inf_imp'){const cy=-m.h/2+Math.sin(t*3)*3,fw=Math.sin(now/55+m.ph*3);glow(cy,80,.65);g.fillStyle=F('#5a1420');for(const sd of[-1,1]){g.save();g.translate(sd*6,cy-2);g.scale(sd,1);g.rotate(-.35+fw*.55);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(14,-20,30,-10);g.lineTo(24,-4);g.lineTo(26,4);g.lineTo(18,1);g.lineTo(14,8);g.quadraticCurveTo(8,4,0,6);g.closePath();g.fill();g.stroke();g.restore()}
   g.strokeStyle='rgba(20,10,20,.92)';g.beginPath();g.moveTo(-dir*6,cy+8);g.quadraticCurveTo(-dir*18,cy+18,-dir*14,cy+26);g.stroke();g.fillStyle=F('#ffb040');g.beginPath();g.moveTo(-dir*14,cy+22);g.lineTo(-dir*19,cy+30);g.lineTo(-dir*10,cy+29);g.closePath();g.fill();
   g.fillStyle=F('#e8402e');g.beginPath();g.ellipse(0,cy,11,12,0,0,6.3);g.fill();g.stroke();g.fillStyle=F('#2a1010');for(const sd of[-1,1]){g.beginPath();g.moveTo(sd*5,cy-9);g.quadraticCurveTo(sd*12,cy-18,sd*9,cy-22);g.lineTo(sd*3,cy-11);g.closePath();g.fill();g.stroke()}
   eye(-4,cy-2,3.2);eye(5,cy-2,3.2);g.strokeStyle='rgba(20,10,20,.92)';g.beginPath();g.moveTo(-4,cy+5);g.lineTo(-1,cy+7);g.lineTo(2,cy+5);g.lineTo(5,cy+7);g.stroke();
   g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,200,90,.9)';g.beginPath();g.arc(dir*12,cy+6,3.5+Math.sin(t*9),0,6.3);g.fill();g.globalCompositeOperation='source-over'}
  else if(k=='inf_hound'){glow(-m.h*.6,100,.5);g.scale(dir,1);const run=m.g&&Math.abs(m.vx)>20?Math.sin(m.x*.09):Math.sin(t*2)*.2,bw=m.w/2;g.fillStyle=F('#2a1e1e');
   for(const[lx,ph]of[[-bw*.6,0],[-bw*.35,3.1],[bw*.45,1.6],[bw*.7,4.7]]){const a=Math.sin(ph)*run*.6+run*.5*Math.cos(ph);g.save();g.translate(lx,-12);g.rotate(a);g.beginPath();g.rect(-3.5,0,7,13);g.fill();g.stroke();g.restore()}
   g.beginPath();g.ellipse(-2,-20,bw*.78,10.5,0,0,6.3);g.fill();g.stroke();
   g.beginPath();g.moveTo(bw*.62,-33);g.lineTo(bw*.66,-45);g.lineTo(bw*.84,-35);g.closePath();g.fill();g.stroke();g.beginPath();g.arc(bw*.78,-28,9.5,0,6.3);g.fill();g.stroke();
   g.beginPath();g.moveTo(bw*.84,-31);g.lineTo(bw*1.22,-28);g.lineTo(bw*1.2,-20);g.lineTo(bw*.84,-20);g.closePath();g.fill();g.stroke();g.fillStyle=F('#1a1010');g.fillRect(bw*1.14,-30,4,3);
   g.fillStyle=F('#ff3a2a');g.beginPath();g.ellipse(bw*.84,-31,3.2,2.4,-.2,0,6.3);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(bw*1.0,-20);g.lineTo(bw*1.04,-15.5);g.lineTo(bw*1.08,-20);g.moveTo(bw*1.1,-20);g.lineTo(bw*1.13,-16);g.lineTo(bw*1.16,-20);g.fill();
   if(!fl){for(let i=0;i<6;i++){const fx=-bw*.7+i*bw*.26,fh=9+Math.sin(t*12+i*1.9)*4;g.fillStyle=i%2?'#ff8a2a':'#ffc04a';g.beginPath();g.moveTo(fx-5,-28);g.quadraticCurveTo(fx-2,-28-fh,fx+1,-28-fh-3);g.quadraticCurveTo(fx+2,-30-fh*.5,fx+5,-28);g.closePath();g.fill()}}
   g.strokeStyle='rgba(20,10,20,.92)';g.fillStyle=F('#ff8a2a');g.beginPath();g.moveTo(-bw*.8,-24);g.quadraticCurveTo(-bw*1.15,-34+Math.sin(t*6)*3,-bw*1.25,-40);g.quadraticCurveTo(-bw*1.05,-30,-bw*.78,-18);g.closePath();g.fill();g.stroke()}
  else if(k=='inf_golem'){glow(-m.h*.55,120,.7);const st=Math.sin(t*3)*2,lf=m.g&&Math.abs(m.vx)>10?Math.sin(m.x*.05)*3:0;const blk=(x,y,w,h,c)=>{g.fillStyle=F(c);g.fillRect(x,y,w,h);g.strokeRect(x,y,w,h)};
   blk(-17,-12+lf,13,12,'#2a1f3c');blk(4,-12-lf,13,12,'#2a1f3c');blk(-30,-44+st,11,26,'#3a2a56');blk(19,-44-st,11,26,'#3a2a56');blk(-21,-46,42,34,'#2e2244');blk(-13,-64,26,19,'#3a2a56');
   if(!fl){g.fillStyle='rgba(190,150,255,.28)';g.fillRect(-19,-44,12,4);g.fillRect(-11,-62,8,3);g.strokeStyle='#ff8a2a';g.lineWidth=2;g.beginPath();g.moveTo(-14,-40);g.lineTo(-8,-32);g.lineTo(-12,-22);g.moveTo(12,-42);g.lineTo(7,-34);g.lineTo(13,-26);g.moveTo(-27,-38+st);g.lineTo(-23,-30+st);g.stroke();g.lineWidth=2.5;
    g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,'+(140+Math.sin(t*4)*40|0)+',50,.95)';g.beginPath();g.moveTo(0,-38);g.lineTo(6,-30);g.lineTo(0,-22);g.lineTo(-6,-30);g.closePath();g.fill();g.globalCompositeOperation='source-over'}
   g.fillStyle=F('#ff9a3a');g.fillRect(-8,-57,5,4);g.fillRect(3,-57,5,4)}}
 {const _dv=drawMobV;drawMobV=function(m,now,px,py){const d=MK[m.k];if(!d||!d.inf)return _dv.apply(this,arguments);try{art(m,now,px,py)}catch(e){if(!WORD9.err2){WORD9.err2=1;console.error('WORD9 art',e)}}}}
 // ---- fireballs (Ember Imps), embers in the air, lava burns, extra spawns (Infernos have monsters by day too)
 const FB=[],EM=[];let FS=null,ES=null,emT=0,infT=4,burnT=0,sizT=0,thrown=0;
 const fsp=()=>FS||(FS=(()=>{const c=cvs(40,40),x=c.getContext('2d'),gr=x.createRadialGradient(20,20,1,20,20,20);gr.addColorStop(0,'rgba(255,250,200,1)');gr.addColorStop(.35,'rgba(255,170,60,.9)');gr.addColorStop(1,'rgba(255,60,10,0)');x.fillStyle=gr;x.fillRect(0,0,40,40);return c})());
 const esp=()=>ES||(ES=(()=>{const c=cvs(12,12),x=c.getContext('2d'),gr=x.createRadialGradient(6,6,0,6,6,6);gr.addColorStop(0,'rgba(255,230,150,1)');gr.addColorStop(.4,'rgba(255,140,40,.8)');gr.addColorStop(1,'rgba(255,60,10,0)');x.fillStyle=gr;x.fillRect(0,0,12,12);return c})());
 function hurt(a,kb){if(creative()||iT>0||P.hp<=0)return;P.hp-=a*(1-Math.min(.8,(bonus().arm||0)+(guard>0?.5:0)));iT=.8;P.vx=kb||0;P.vy=Math.min(P.vy,-260);hurtF=.42;shake=Math.max(shake,QM.reduce?0:.1);try{snd(150,.2,'sawtooth',.06)}catch(_){}}
 function tick(dt){if(!entered)return;vis();
  // letters: touching or clicking one collects it
  if(L.length){for(const l of L){if(tiles[l.k]!=LETTER)continue;const x=(l.k%W)*T,y=(l.k/W|0)*T,dx=Math.max(x-(P.x+P.w/2),(P.x-P.w/2)-(x+T),0),dy=Math.max(y-(P.y+P.h),P.y-(y+T),0);if(dx<8&&dy<8){collect(l);break}}
   if(mdL&&!showInv&&menuEl.style.display=='none'&&!isOpen()){const tx=Math.floor((mx+cam.x)/T),ty=Math.floor((my+cam.y)/T);if(tx>=0&&ty>=0&&tx<W&&ty<H&&tiles[ty*W+tx]==LETTER&&Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH){const l=L.find(q=>q.k==ty*W+tx);if(l)collect(l)}}}
  if(!INF){if(FB.length)FB.length=0;if(EM.length)EM.length=0;return}
  // no rain or snow in an Inferno (the world weather / machines set WX6.force after a load: keep it clear while here)
  if(WX6.force!='clear'){WX6.force='clear';wxSet=true;try{for(const s in WX6.I)WX6.I[s]=s=='clear'?1:0;WX6.reset()}catch(_){}}
  if(P.hw)P.hw=false;
  const vw=cv.width/ZM,vh=cv.height/ZM,cap=QM.reduce?14:40;emT-=dt;if(emT<-.2)emT=-.2;while(emT<=0&&EM.length<cap){emT+=.07;EM.push({x:cam.x+R()*vw,y:cam.y+vh*(.2+R()*.85),vx:rn(-14,14),vy:-rn(28,80),l:rn(2.5,5.5),t:0,p:R()*6})}
  for(let i=EM.length-1;i>=0;i--){const e=EM[i];e.t+=dt;e.x+=(e.vx+Math.sin(e.t*2+e.p)*14)*dt;e.y+=e.vy*dt;if(e.t>e.l)EM.splice(i,1)}
  // lava burns (bounces you up a little so you can climb out)
  if(!creative()&&P.hp>0&&(inWater(P.x,P.y+P.h*.85)||inWater(P.x,P.y+P.h*.4))){burnT-=dt;sizT-=dt;P.hp-=22*dt*(1-Math.min(.6,(bonus().arm||0)*.6));hurtF=Math.max(hurtF,.3);if(burnT<=0){burnT=.5;P.vy=Math.min(P.vy,-420);try{VFX.burst(P.x,P.y+P.h*.7,['#ffb040','#ff6a2a','#fff0a0'],10,180,1,.6,10)}catch(_){}}if(sizT<=0){sizT=.35;try{noise(.25,1400,.12);snd(90,.18,'sawtooth',.03)}catch(_){}}}
  // extra spawns: a steady trickle, day or night, on the surface or below
  infT-=dt;if(infT<=0){const dp=depthAt(P.x,P.y+P.h/2),n=mobs.filter(m=>MK[m.k]&&MK[m.k].inf).length,c2=Math.min(9,4+Math.floor(Math.max(0,dp)/10));infT=n<c2?rn(4,8):2;if(n<c2)try{spawnMob()}catch(_){}}
  // special moves: imps throw fireballs, hounds leap, golems slam
  for(const m of mobs){const d=MK[m.k];if(!d||!d.inf||m.dead||m.hp<=0)continue;const dx=P.x-m.x,dy=P.y+P.h/2-(m.y+m.h/2),dist=Math.hypot(dx,dy);m.sk=(m.sk==null?rn(1,3):m.sk)-dt;if(m.stun>0||m.sk>0)continue;
   if(m.k=='inf_imp'&&dist<T*9){m.sk=rn(2.4,3.6);thrown++;const v=330,a=Math.atan2(dy,dx);FB.push({x:m.x+Math.cos(a)*12,y:m.y+m.h/2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:2.6});try{SFX7.tone(520,180,.22,'sawtooth',.03)}catch(_){}}
   else if(m.k=='inf_hound'&&m.g&&dist<T*6&&Math.abs(dy)<T*3){m.sk=rn(1.6,2.8);m.vy=-640;m.dir=Math.sign(dx)||1;try{SFX7.tone(240,120,.16,'square',.025)}catch(_){}}
   else if(m.k=='inf_golem'&&m.g&&dist<T*3.2){m.sk=rn(2.8,4);rings.push({x:m.x,y:m.y+m.h,c:'#ff8a2a',t:performance.now()});try{VFX.wave(m.x,m.y+m.h,'#ff8a2a',110,.5,.3);noise(.35,400,.25)}catch(_){}shake=Math.max(shake,QM.reduce?0:.18);if(dist<T*2.6&&P.g)hurt(14,Math.sign(dx||1)*380)}
   else m.sk=.4}
  for(let i=FB.length-1;i>=0;i--){const f=FB[i];f.l-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(solidAt(Math.floor(f.x/T),Math.floor(f.y/T)))f.l=0;
   if(f.l>0&&Math.abs(f.x-P.x)<P.w/2+8&&f.y>P.y-6&&f.y<P.y+P.h+6){f.l=0;hurt(14,Math.sign(f.vx)*240);try{VFX.burst(f.x,f.y,['#ffb040','#ff5a1a'],10,200,1,.5,10)}catch(_){}}
   if(f.l<=0){try{VFX.burst(f.x,f.y,['#ff8a2a','#ffd27a'],6,120,1,.4,8)}catch(_){}FB.splice(i,1)}}
  if(FB.length>24)FB.splice(0,FB.length-24)}
 // ---- per-frame draw (after the lighting, so letters, lava sparks and embers glow in the dark)
 const NF=24,HF=12;let OV=null,GL=null,ST=null;const LS={};
 const hsl=(h,l)=>'hsl('+((h%360+360)%360)+',100%,'+l+'%)';
 function mkOV(){OV=cvs(T*NF,T);const x=OV.getContext('2d');for(let f=0;f<NF;f++){const ox=f*T,h0=f/NF*360;x.save();x.beginPath();x.rect(ox,0,T,T);x.clip();
   let gr=x.createLinearGradient(ox,0,ox,T);gr.addColorStop(0,'#40287a');gr.addColorStop(1,'#160c30');x.fillStyle=gr;x.fillRect(ox,0,T,T);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(ox+4,4,T-8,T*.4);
   const edge=(ax,ay,bx,by,h)=>{const e=x.createLinearGradient(ax,ay,bx,by);for(let i=0;i<=3;i++)e.addColorStop(i/3,hsl(h+i*30,62));x.strokeStyle=e;x.beginPath();x.moveTo(ax,ay);x.lineTo(bx,by);x.stroke()};x.lineWidth=5;x.lineCap='square';
   edge(ox+2.5,2.5,ox+T-2.5,2.5,h0);edge(ox+T-2.5,2.5,ox+T-2.5,T-2.5,h0+90);edge(ox+T-2.5,T-2.5,ox+2.5,T-2.5,h0+180);edge(ox+2.5,T-2.5,ox+2.5,2.5,h0+270);
   x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.strokeRect(ox+6.5,6.5,T-13,T-13);
   const b=-T*1.6+(f/NF)*T*3.6;x.translate(ox+T/2,T/2);x.rotate(-.75);gr=x.createLinearGradient(b-12,0,b+12,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(b-12,-T,24,T*2);x.restore()}
  GL=cvs(96,96);let y=GL.getContext('2d'),rg=y.createRadialGradient(48,48,2,48,48,48);rg.addColorStop(0,'rgba(255,240,170,.75)');rg.addColorStop(.45,'rgba(200,150,255,.3)');rg.addColorStop(1,'rgba(120,180,255,0)');y.fillStyle=rg;y.fillRect(0,0,96,96);
  ST=cvs(16,16);y=ST.getContext('2d');y.fillStyle='#fff';y.beginPath();y.moveTo(8,0);y.quadraticCurveTo(9,7,16,8);y.quadraticCurveTo(9,9,8,16);y.quadraticCurveTo(7,9,0,8);y.quadraticCurveTo(7,7,8,0);y.fill()}
 function lsp(ch){if(LS[ch])return LS[ch];const c=cvs(T*HF,T),x=c.getContext('2d');x.font='900 33px '+FONT;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
  for(let f=0;f<HF;f++){const ox=f*T,cx=ox+T/2,cy=T/2+2,h0=f/HF*360,gr=x.createLinearGradient(ox+8,8,ox+T-8,T-8);for(let i=0;i<=4;i++)gr.addColorStop(i/4,hsl(h0+i*55,66));
   x.lineWidth=6;x.strokeStyle='#120822';x.strokeText(ch,cx,cy);x.fillStyle=gr;x.fillText(ch,cx,cy);x.save();x.beginPath();x.rect(ox,0,T,T*.45);x.clip();x.globalAlpha=.4;x.fillStyle='#fff';x.fillText(ch,cx,cy);x.restore()}return LS[ch]=c}
 const hs=(a,b)=>{let n=Math.imul(a*73856093^b*19349663,2246822519)>>>0;n^=n>>>13;return(Math.imul(n,3266489917)>>>0)/4294967296};
 function draw(g2,cx,cy){const now=performance.now()/1000,vw=cv.width/ZM,vh=cv.height/ZM;
  if(L.length){if(!OV)mkOV();for(const l of L){if(tiles[l.k]!=LETTER)continue;const tx=l.k%W,ty=l.k/W|0,px=tx*T-cx,py=ty*T-cy;if(px<-T*2||py<-T*2||px>vw+T||py>vh+T)continue;const ph=now+l.i*.37;
    g2.save();g2.globalCompositeOperation='lighter';g2.globalAlpha=.4+.18*Math.sin(ph*2.2);g2.drawImage(GL,px+T/2-T*1.25,py+T/2-T*1.25,T*2.5,T*2.5);g2.globalAlpha=1;g2.globalCompositeOperation='source-over';
    g2.drawImage(OV,(((ph/2.6)*NF|0)%NF)*T,0,T,T,px,py,T,T);g2.drawImage(lsp(l.ch),(((ph*4)|0)%HF)*T,0,T,T,px,py+Math.sin(ph*3)*1.5,T,T);
    g2.globalCompositeOperation='lighter';for(let s=0;s<3;s++){const tw=Math.sin(ph*(2.6+s*.7)+s*2.1);if(tw<.2)continue;const z=(5+tw*9);g2.globalAlpha=tw;g2.drawImage(ST,px+4+hs(l.k,s)*(T-8)-z/2,py+4+hs(l.k,s+7)*(T-8)-z/2,z,z)}g2.restore()}}
  if(!INF)return;g2.save();g2.globalCompositeOperation='lighter';const es=esp();for(const e of EM){const a=Math.min(1,e.t*2,(e.l-e.t)*1.5)*.85;if(a<=.02)continue;g2.globalAlpha=a;const z=5+Math.sin(e.t*7+e.p)*1.5;g2.drawImage(es,e.x-cx-z/2,e.y-cy-z/2,z,z)}
  const fs=fsp();g2.globalAlpha=1;for(const f of FB){g2.drawImage(fs,f.x-cx-16,f.y-cy-16,32,32);g2.globalAlpha=.5;g2.drawImage(fs,f.x-f.vx*.03-cx-11,f.y-f.vy*.03-cy-11,22,22);g2.globalAlpha=1}g2.restore()}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.apply(this,arguments);try{tick(dt)}catch(e){if(!WORD9.err3){WORD9.err3=1;console.error('WORD9 tick',e)}}};BOSS6.drawProj=function(g2,cx,cy){_d.apply(this,arguments);try{draw(g2,cx,cy)}catch(e){if(!WORD9.err4){WORD9.err4=1;console.error('WORD9 draw',e)}}}}
 // the world name on the HUD reads "<World> · Inferno"
 // (the legacy HUD timer writes cur.toUpperCase() through the element's own textContent setter, see BUILD9's guard: wrap that setter)
 try{const el=document.getElementById('wname'),d=Object.getOwnPropertyDescriptor(el,'textContent')||Object.getOwnPropertyDescriptor(Node.prototype,'textContent');el._g9=1;
  Object.defineProperty(el,'textContent',{configurable:true,get(){return d.get.call(this)},set(v){if(INF&&entered)v=label(cur);d.set.call(this,v)}})}catch(e){console.error('WORD9 hud',e)}
 return{LETTER,ASH,BASALT,MAGMA,OBSID,SCORCH,LV,WORDS,IM,get letters(){return L.map(l=>({k:l.k,x:l.k%W,y:l.k/W|0,ch:l.ch,i:l.i}))},get word(){return WORD},get inf(){return INF},get state(){return S},
  wordFor,isInf,infName,baseOf,label,hasWord,collect:i=>collect(L.find(l=>l.i==i)),open,close,submit,travel,isOpen,spawnAt,strip,get fireballs(){return FB.length},get thrown(){return thrown},get embers(){return EM.length}}})();
