// ===== REW8: rewards that feel rewarding. One visual language for every payout - level up, quests (starter + town + daily), achievements,
// chests, rare catches and drops, boss wins, world goals and the depth activities (DEPTH8): a light pillar with slow radial rays and confetti at
// the source, gems that fly into the HUD counter (which ticks up and bounces as they land), a rarity-coloured reveal card (common -> mythic:
// glow colour, sparkle count, a soft screen flash for legendary/mythic) and a short synthesized fanfare. Sprites are pre-rendered once per
// colour, particles use the pooled VFX system, cards animate transform/opacity only, nothing blocks play, and reduced motion
// (cel.opt.reduce / QM.reduce) drops pillars, rays, flashes and flights (numbers simply update). =====
const REW8=(()=>{
 const RC=['#e4e9f2','#6fe3a0','#64b0ff','#b98aff','#ffc640','#ff5f9e'],RK=['common','uncommon','rare','epic','legendary','mythic'],RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
 const CF=['#ff6fa8','#ffd24a','#6fe3ff','#9dff8a','#b98aff','#ffffff'];
 const red=()=>{try{return !!(cel.opt.reduce||QM.reduce)}catch(_){return false}},vk=()=>{try{return Math.max(.25,QM.vfxK)}catch(_){return 1}};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const rgb=h=>{h=String(h).replace('#','');return[parseInt(h.slice(0,2),16)|0,parseInt(h.slice(2,4),16)|0,parseInt(h.slice(4,6),16)|0]};
 const rgba=(h,a)=>{const[r,g2,b]=rgb(h);return'rgba('+r+','+g2+','+b+','+a+')'};
 const tierOf=k=>{try{return Math.max(0,Math.min(5,ITEM7.tier(k)))}catch(_){return 0}};
 const nm=k=>{try{return iname(k)}catch(_){return'Item'}},ico=k=>{try{return iconURL(k)}catch(_){return''}};
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 // ---- sprites (cached per colour)
 const SPR=new Map();const memo=(k,f)=>{let s=SPR.get(k);if(!s){if(SPR.size>64)SPR.clear();s=f();SPR.set(k,s)}return s};
 const pil=c=>memo('p'+c,()=>{const s=mkc(64,256),x=s.getContext('2d'),gr=x.createLinearGradient(0,0,64,0);gr.addColorStop(0,rgba(c,0));gr.addColorStop(.28,rgba(c,.42));gr.addColorStop(.5,'rgba(255,255,255,.95)');gr.addColorStop(.72,rgba(c,.42));gr.addColorStop(1,rgba(c,0));x.fillStyle=gr;x.fillRect(0,0,64,256);
  x.globalCompositeOperation='destination-in';const v=x.createLinearGradient(0,0,0,256);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.4,'rgba(0,0,0,.75)');v.addColorStop(.93,'#000');v.addColorStop(1,'rgba(0,0,0,.15)');x.fillStyle=v;x.fillRect(0,0,64,256);return s});
 const ray=c=>memo('r'+c,()=>{const s=mkc(256,256),x=s.getContext('2d');x.translate(128,128);const gr=x.createRadialGradient(0,0,6,0,0,128);gr.addColorStop(0,rgba(c,.8));gr.addColorStop(.55,rgba(c,.25));gr.addColorStop(1,rgba(c,0));x.fillStyle=gr;
  for(let i=0;i<14;i++){const a=i/14*6.2832,w=i%2?.05:.085;x.beginPath();x.moveTo(0,0);x.arc(0,0,128,a-w,a+w);x.closePath();x.fill()}const c2=x.createRadialGradient(0,0,0,0,0,46);c2.addColorStop(0,'rgba(255,255,255,.85)');c2.addColorStop(.4,rgba(c,.35));c2.addColorStop(1,rgba(c,0));x.fillStyle=c2;x.fillRect(-46,-46,92,92);return s});
 const glo=c=>memo('g'+c,()=>{const s=mkc(64,64),x=s.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.25,rgba(c,.6));gr.addColorStop(1,rgba(c,0));x.fillStyle=gr;x.fillRect(0,0,64,64);return s});
 const GEM=(()=>{const s=mkc(40,40),x=s.getContext('2d'),gr=x.createRadialGradient(20,20,2,20,20,20);gr.addColorStop(0,'rgba(140,230,255,.75)');gr.addColorStop(1,'rgba(140,230,255,0)');x.fillStyle=gr;x.fillRect(0,0,40,40);x.translate(20,20);x.fillStyle='#5fd0ff';x.strokeStyle='#06304a';x.lineWidth=2;
  x.beginPath();x.moveTo(0,-11);x.lineTo(10,-3);x.lineTo(0,11);x.lineTo(-10,-3);x.closePath();x.fill();x.stroke();x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.moveTo(0,-11);x.lineTo(4,-3);x.lineTo(-4,-3);x.closePath();x.fill();return s})();
 // ---- world effects: light pillar + rays (drawn after the lighting layer, additive, capped)
 const FX=[];
 function pillar(x,y,c,d,sc){if(red()||typeof entered=='undefined'||!entered)return;if(FX.length>=5)FX.shift();FX.push({x,y,c:c||'#ffd24a',t0:performance.now(),d:d||1.5,s:sc||1,r0:Math.random()*6})}
 function drawFX(g2,cx,cy,now){if(!FX.length)return;g2.save();g2.globalCompositeOperation='lighter';
  for(let i=FX.length-1;i>=0;i--){const f=FX[i],u=(now-f.t0)/1000/f.d;if(u>=1||u<0){if(u>=1)FX.splice(i,1);continue}const x=f.x-cx,y=f.y-cy,s=f.s,fade=u<.55?1:1-(u-.55)/.45;
   const rr=(120+110*Math.min(1,u*1.6))*s;g2.globalAlpha=.7*fade;g2.save();g2.translate(x,y-34*s);g2.rotate(f.r0+u*f.d*.55);g2.drawImage(ray(f.c),-rr,-rr,rr*2,rr*2);g2.restore();
   const w=(u<.1?u/.1:1)*54*s*(1-.45*u),h=560*s*Math.min(1,u*6);g2.globalAlpha=.9*fade;g2.drawImage(pil(f.c),x-w/2,y-h,w,h);
   g2.globalAlpha=.8*fade;g2.drawImage(glo(f.c),x-70*s,y-34*s,140*s,68*s)}
  g2.restore()}
 function confetti(x,y,n,cols){if(typeof VFX=='undefined')return;n=Math.round(n*vk()*(red()?.3:1));cols=cols||CF;for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=160+Math.random()*340,sh2=i%3!=0;
  VFX.add(sh2?2:1,cols[i%cols.length],x,y,Math.cos(a)*v,Math.sin(a)*v,1+Math.random()*.9,sh2?9:13,sh2?7:2,{g:sh2?560:120,d:sh2?1.5:1.1,r:Math.random()*6,vr:(Math.random()-.5)*14})}}
 function sparkle(x,y,c,n,sp){if(typeof VFX=='undefined')return;n=Math.round(n*vk()*(red()?.4:1));for(let i=0;i<n;i++){const a=Math.random()*6.2832,v=(.35+Math.random()*.65)*(sp||200);VFX.add(1,i%3?c:'#ffffff',x,y,Math.cos(a)*v,Math.sin(a)*v-40,.6+Math.random()*.6,10+Math.random()*8,2,{d:2,g:60,r:a,vr:(Math.random()-.5)*6})}}
 // ---- gems fly into the HUD counter; the counter holds back what is still in the air, then ticks up as each one lands
 const FL=[];let pend=0,tgt=null,tgtT=0,combo=0,comboT=0,bumpT=0;
 function hudPt(){const now=performance.now();if(tgt&&now-tgtT<400)return tgt;tgtT=now;const e=document.querySelector('#hudL .gem')||document.getElementById('gv');if(!e)return tgt={x:80,y:80};const r=e.getBoundingClientRect();return tgt={x:(r.left+r.width/2)*cv.width/innerWidth,y:(r.top+r.height/2)*cv.height/innerHeight}}
 function fly(wx,wy,n){n=Math.round(+n||0);if(!(n>0))return;if(red()||typeof entered=='undefined'||!entered||typeof cam=='undefined'){bump();return}
  const k=Math.min(9,Math.max(1,Math.ceil(Math.sqrt(n)*1.5))),sx=(wx-cam.x)*ZM,sy=(wy-cam.y)*ZM;let left=n;
  for(let i=0;i<k&&FL.length<28;i++){const a=i==k-1?left:Math.floor(n/k);if(a<=0)continue;left-=a;pend+=a;FL.push({sx:sx+(Math.random()-.5)*36,sy:sy+(Math.random()-.5)*36,ox:(Math.random()-.5)*300,oy:-140-Math.random()*170,t:-i*.055,d:.62+Math.random()*.22,n:a})}}
 function bump(){const now=performance.now();if(now-bumpT<70)return;bumpT=now;const e=document.getElementById('gv'),gi=document.querySelector('#hudL .gem');if(red())return;
  try{if(e&&e.animate)e.animate([{transform:'scale(1)'},{transform:'scale(1.32)',color:'#2aa8e8'},{transform:'scale(1)'}],{duration:240,easing:'cubic-bezier(.2,.9,.3,1.4)'});if(gi&&gi.animate)gi.animate([{transform:'scale(1) rotate(0)'},{transform:'scale(1.45) rotate(-12deg)'},{transform:'scale(1)'}],{duration:280,easing:'cubic-bezier(.2,.9,.3,1.4)'})}catch(_){}}
 function land(f){pend=Math.max(0,pend-f.n);bump();const now=performance.now();combo=now-comboT<350?Math.min(12,combo+1):0;comboT=now;if(!land.t||now-land.t>45){land.t=now;tone(1250+combo*70,1600+combo*70,.05,'sine',.016)}}
 function drawFlights(g2){if(!FL.length)return;const p=hudPt();g2.save();g2.globalCompositeOperation='lighter';
  for(const f of FL){if(f.t<0)continue;const u=Math.min(1,f.t/f.d),e=u*u,cx2=f.sx+f.ox,cy2=f.sy+f.oy,x=(1-e)*(1-e)*f.sx+2*(1-e)*e*cx2+e*e*p.x,y=(1-e)*(1-e)*f.sy+2*(1-e)*e*cy2+e*e*p.y,s=(26-10*u)*Math.min(1,f.t*8+.3);
   g2.globalAlpha=1;g2.drawImage(GEM,(x-s/2)/ZM,(y-s/2)/ZM,s/ZM,s/ZM)}g2.restore()}
 // ---- HUD gem counter (counts toward the wallet minus what is still flying)
 let dv=null,entT=0,wasE=false;
 function counter(dt){const e=document.getElementById('gv');if(!e||typeof gems=='undefined')return;const en=typeof entered!='undefined'&&!!entered;if(en&&!wasE)entT=performance.now();wasE=en;if(!en){dv=null;return}
  const tg=Math.max(0,gems-pend);if(dv==null||performance.now()-entT<1500||tg<dv||(red()&&!FL.length))dv=tg;else if(dv<tg)dv=Math.min(tg,dv+Math.max(1,(tg-dv)*Math.min(1,dt*9)));
  const s=String(Math.floor(dv));if(e.textContent!==s)e.textContent=s}
 // ---- cards
 let host=null;const cards=[];
 function ensure(){if(host&&host.isConnected)return host;host=document.createElement('div');host.id='rw8';host.setAttribute('role','status');host.setAttribute('aria-live','polite');document.body.appendChild(host);return host}
 function out(c,fast){clearTimeout(c._t);const i=cards.indexOf(c);if(i>=0)cards.splice(i,1);c.classList.remove('in');c.classList.add('out');setTimeout(()=>{try{c.remove()}catch(_){}},fast?180:460)}
 function card(o){o=o||{};ensure();const t=Math.max(0,Math.min(5,o.tier|0)),c=document.createElement('div');c.className='rw8c'+(o.icon!=null?' ic':'');c.setAttribute('data-rar',RK[t]);c.style.setProperty('--rw',RC[t]);c.dataset.kind=o.kind||'';
  let h='<i class="rw8g" aria-hidden="true"></i>'+(o.icon!=null?'<img class="rw8ic" alt="" src="'+ico(o.icon)+'">':'')+(o.showTier?'<i class="rw8tier">'+RN[t]+'</i>':'')+'<div class="rw8b"><small class="rw8k">'+esc(o.kick||'Reward')+'</small><b class="rw8t">'+esc(o.title||'')+'</b>'+(o.sub?'<span class="rw8s">'+esc(o.sub)+'</span>':'');
  const ln=[];if(o.gems>0)ln.push('<span class="rw8n"><i class="gem"></i>+<em data-to="'+Math.round(o.gems)+'">0</em></span>');if(o.xp>0)ln.push('<span class="rw8n x"><i>XP</i>+<em data-to="'+Math.round(o.xp)+'">0</em></span>');
  if(ln.length)h+='<div class="rw8r">'+ln.join('')+'</div>';
  if(o.items&&o.items.length)h+='<div class="rw8it">'+o.items.slice(0,4).map(([k,n])=>{const tt=tierOf(k);return'<span data-rar="'+RK[tt]+'"><img alt="" src="'+ico(k)+'">'+esc(nm(k))+(n>1?' ×'+n:'')+'</span>'}).join('')+'</div>';
  c.innerHTML=h+'</div>';host.appendChild(c);cards.push(c);while(cards.length>3)out(cards[0],true);
  const go=()=>{c.classList.add('in');for(const e of c.querySelectorAll('em[data-to]')){try{MOTION7.tick(e,+e.dataset.to,0)}catch(_){e.textContent=e.dataset.to}}};
  if(red())go();else requestAnimationFrame(()=>requestAnimationFrame(go));c._t=setTimeout(()=>out(c),o.ms||(2600+t*250));return c}
 // ---- full-screen flash for the top tiers (one fixed element, opacity only)
 function flash(c,a){if(red())return;let f=document.getElementById('rw8f');if(!f){f=document.createElement('div');f.id='rw8f';f.setAttribute('aria-hidden','true');document.body.appendChild(f)}
  f.style.background='radial-gradient(ellipse at 50% 50%,'+rgba(c,.05)+' 0%,'+rgba(c,.35)+' 55%,'+rgba(c,.75)+' 100%)';try{f.animate([{opacity:0},{opacity:a||.3,offset:.18},{opacity:0}],{duration:620,easing:'ease-out'})}catch(_){}}
 // ---- fanfares (WebAudio, follows the sound-effects volume)
 function fan(kind,t){t=t|0;
  if(kind=='level'){tone(131,98,.6,'sine',.07);[523,659,784,1047].forEach((f,i)=>tone(f,f*1.004,.34,'triangle',.05,i*.085));[1047,1319,1568].forEach((f,i)=>tone(f,f,1.15,'sine',.026,.38+i*.012));for(let i=0;i<6;i++)tone(2093+i*190,2350+i*190,.1,'sine',.011,.46+i*.065)}
  else if(kind=='quest'){tone(784,790,.18,'triangle',.045);tone(1175,1180,.32,'triangle',.045,.1);tone(1568,1600,.45,'sine',.02,.2)}
  else if(kind=='ach'){[659,880,1109,1319].forEach((f,i)=>tone(f,f,.42,'triangle',.042,i*.075));tone(1760,1760,.9,'sine',.02,.32);tone(110,82,.5,'sine',.05)}
  else if(kind=='discover'){tone(880,1320,.25,'sine',.035);tone(1320,1760,.35,'sine',.03,.12);tone(1760,1765,.7,'triangle',.016,.24)}
  else{const B=[523,587,659,784,880,1047,1175,1319];for(let i=0;i<Math.min(B.length,2+t);i++)tone(B[i],B[i]*1.01,.3,'sine',.03,i*.06);if(t>=3)tone(1568,1568,.9,'triangle',.02,.26);if(t>=4){tone(98,62,.7,'sine',.09);[1047,1319,1568,2093].forEach((f,i)=>tone(f,f,1.3,'sine',.022,.32+i*.02))}}}
 // ---- composed rewards
 function reveal(k,n,x,y,o){o=o||{};const t=o.tier!=null?o.tier:tierOf(k),c=RC[t];n=n||1;
  try{VFX.wave(x,y,c,70+t*34,.6,.35)}catch(_){}sparkle(x,y,c,6+t*7,170+t*40);if(t>=2)pillar(x,y+(o.dy||16),c,1.1+t*.16,.6+t*.13);if(t>=3)confetti(x,y,8+t*6,[c,'#ffffff',RC[Math.max(0,t-1)]]);
  if(t>=4){flash(c,.22+(t-4)*.12);try{shake=Math.max(shake,red()?0:.08+(t-4)*.05)}catch(_){}}
  fan('reveal',t);if(o.gems)fly(x,y,o.gems);return card({kind:'reveal',kick:o.kick||RN[t]+' find',showTier:!o.kick||o.showTier,title:nm(k)+(n>1?' ×'+n:''),sub:o.sub,tier:t,icon:k,gems:o.gems,xp:o.xp,ms:o.ms})}
 function celebrate(x,y,c,o){o=o||{};pillar(x,y,c,o.d||1.6,o.s||1);confetti(x,y-20,o.n==null?30:o.n);sparkle(x,y-30,c,o.sp||14,220);try{VFX.wave(x,y,c,o.w||150,.7,.3)}catch(_){}}
 function quest(title,g,xp2,kick){const x=P.x,y=P.y+P.h;celebrate(x,y,'#ffd24a',{d:1.3,s:.8,n:18,sp:10});fly(P.x,P.y-20,g);fan('quest');return card({kind:'quest',kick:kick||'Quest complete',title,gems:g,xp:xp2,tier:1})}
 function ach(a){const g=a[4]|0,t=g>=900?4:g>=300?3:2,c=RC[t];celebrate(P.x,P.y+P.h,c,{d:1.8,s:1.1,n:34});if(t>=4)flash(c,.22);fly(P.x,P.y-20,g);fan('ach');return card({kind:'ach',kick:'Achievement unlocked',title:a[0],sub:a[1],gems:g,tier:t,ms:3400})}
 // ---- level up: pillar + rays + confetti + a rolling number + fanfare
 let lvEl=null,lvT=0,prevL=0;
 function levelUp(a,b){const x=P.x,y=P.y+P.h;celebrate(x,y,'#ffd24a',{d:2,s:1.3,n:48,sp:22,w:190});fan('level');lvT=performance.now()+2700;
  if(!lvEl||!lvEl.isConnected){lvEl=document.createElement('div');lvEl.id='rw8lv';lvEl.setAttribute('role','status');document.body.appendChild(lvEl)}
  lvEl.innerHTML='<i class="rw8ray" aria-hidden="true"></i><small>Level up</small><div class="rw8num"><span class="rw8roll"><i>'+a+'</i><i>'+b+'</i></span></div><em>+'+2*(b-a)+' stat points · health restored</em>';
  lvEl.classList.remove('on','off');void lvEl.offsetWidth;lvEl.classList.add('on');clearTimeout(levelUp.t);clearTimeout(levelUp.t2);levelUp.t=setTimeout(()=>lvEl.classList.add('off'),2300);levelUp.t2=setTimeout(()=>lvEl.classList.remove('on','off'),2800)}
 // ---- per frame
 function tick(dt){counter(dt);watchMsg();for(let i=FL.length-1;i>=0;i--){const f=FL[i];f.t+=dt;if(f.t>=f.d){FL.splice(i,1);land(f)}}if(!FL.length&&pend)pend=0;
  try{if(entered){if(prevL&&lvl>prevL)levelUp(prevL,lvl);prevL=lvl}else prevL=0}catch(_){}
  // the plain "LEVEL n" banner is replaced by the level card while it plays (wings / nameplate banners still show)
  if(lvT>performance.now()){const b=document.getElementById('banner');if(b&&b.classList.contains('on')&&/^LEVEL \d+$/.test((b.firstChild&&b.firstChild.textContent)||''))b.classList.remove('on')}}
 function draw(g2,cx,cy){const now=performance.now();drawFX(g2,cx,cy,now);drawFlights(g2)}
 // ---- hooks into every reward path
 try{const _vu=VFX.update;VFX.update=function(dt){const r=_vu.apply(this,arguments);try{tick(Math.min(.05,window.FDT||dt||.016))}catch(e){if(!tick.e){tick.e=1;console.error('REW8',e)}}return r}}catch(_){}
 {const _d=BOSS6.drawProj;BOSS6.drawProj=function(g2,cx,cy){_d.apply(this,arguments);try{draw(g2,cx,cy)}catch(e){if(!draw.e){draw.e=1;console.error('REW8 draw',e)}}}}
 {const _G=G;G=function(k){const was=!!done[k];const r=_G.apply(this,arguments);try{if(!was&&done[k]){const q=QUEST.find(x=>x[2]==k);if(q)quest(q[0],q[3],0)}}catch(_){}return r}}
 {const _ca=checkAch;checkAch=function(){const before={};try{for(const i in achD)before[i]=1}catch(_){}const r=_ca.apply(this,arguments);try{for(const i in achD)if(achD[i]&&!before[i]&&ACH[i])ach(ACH[i])}catch(_){}return r}}
 {const _da=dlgAct;dlgAct=function(a){let q=null,g0=0;try{const p=String(a).split(':');if(p[0]=='claim'){const qq=qs[+p[1]];if(qq&&qq.p>=qq.need)q={n:qq.n,g:qq.g,x:qq.x};g0=gems}}catch(_){}const r=_da.apply(this,arguments);try{if(q&&gems>g0)quest(q.n,q.g,q.x,'Town quest complete')}catch(_){}return r}}
 try{const _dc=DAILY6.claim;DAILY6.claim=function(i){let t0=null,g0=gems;try{const t=dly.tasks[i];if(t&&!t.claimed)t0={l:DAILY6.label(t),x:t.x}}catch(_){}const r=_dc.apply(this,arguments);try{const t=dly.tasks[i];if(t0&&t&&t.claimed)quest(t0.l,gems-g0,t0.x,'Daily challenge complete')}catch(_){}return r}}catch(_){}
 {const _i=interact;interact=function(){let c=null,was=false;try{if(!dlgOpen){c=CHEST7.near();was=!!(c&&(CHEST7.opened()[cur]||[]).includes(c.i))}}catch(_){}const m0=typeof msg=='string'?msg:'';const r=_i.apply(this,arguments);
  try{if(c&&!was&&(CHEST7.opened()[cur]||[]).includes(c.i)){const t=c.dp<20?1:c.dp<32?2:3,x=(c.tx+.5)*T,y=(c.ty+1)*T,m=String(msg||''),gm=m.match(/\+(\d+) gems/);celebrate(x,y,RC[t],{d:1.4,s:.85,n:22});fan('reveal',t);
   card({kind:'chest',kick:'Treasure chest',title:['Wooden','Iron','Golden'][t-1]+' chest',sub:m.indexOf(', ')>0?m.slice(m.indexOf(', ')+2):'',gems:gm?+gm[1]:0,tier:t})}}catch(_){}return r}}
 try{const _bw=CINE7.bossWin;CINE7.bossWin=function(m,b,first){const r=_bw.apply(this,arguments);try{celebrate(m.x,m.y+m.h,b.c||'#ffd24a',{d:2.4,s:1.5,n:34,sp:14,w:300});/* trimmed: with the boss dissolve running too, 60+26 pushed frames past the 144 FPS budget */fly(m.x,m.y+m.h/2,b.gems|0);fan('level');if(first)flash(b.c||'#ffd24a',.25);
   const sm=document.querySelector('#cine7b .c7b-card small');if(sm&&!red()){sm.innerHTML=esc(sm.textContent).replace(/\+([\d,]+)/g,(q,d)=>'+<em data-to="'+d.replace(/,/g,'')+'">0</em>');for(const e of sm.querySelectorAll('em[data-to]'))try{e.style.fontStyle='normal';MOTION7.tick(e,+e.dataset.to,0)}catch(_){}}}catch(_){}return r}}catch(_){}
 // rare catches: the fishing code announces them with UI6.say6; show the reveal card instead of the banner
 try{const _s6=UI6.say6;UI6.say6=function(t,s){try{if(t=='Rare catch!'){const F=TOOLS8.FISH.FISHES,k=+Object.keys(F).find(id=>F[id].n==s);if(k){reveal(k,1,P.x,P.y-24,{kick:'Rare catch!',showTier:true});return}}}catch(_){}return _s6.apply(this,arguments)}}catch(_){}
 // picked-up drops of epic or better get a reveal (only items coming out of the pickup loop, never chest moves or crafting)
 // (addI is a const arrow in legacy, so the pickup loop is watched instead: an item drop that leaves the list before it expires was picked up)
 let pickT=0;const pre=[];
 {const _ud=updDrops;updDrops=function(){pre.length=0;if(drops.length)for(const d of drops)if(typeof d.k=='number'&&Math.abs(d.x-P.x)<240&&Math.abs(d.y-P.y)<280)pre.push(d);const r=_ud.apply(this,arguments);
   try{if(pre.length){for(const d of pre){if(d.t>119||drops.indexOf(d)>=0)continue;const t=tierOf(d.k),now=performance.now();if(t>=3&&now-pickT>600){pickT=now;reveal(d.k,d.n,P.x,P.y-20,{kick:RN[t]+' drop'})}}}}catch(_){}return r}}
 // gems picked up in the world fly to the counter
 {const _g=gain;gain=function(n,x,y){const g0=gems;const r=_g.apply(this,arguments);try{const d=gems-g0;if(d>0&&x!=null)fly(x,y,d)}catch(_){}return r}}
 // other payouts announced through say() (a const in legacy, so the message is watched): world goals, collection milestones, world events
 let lastMt=0;
 function watchMsg(){if(typeof msg=='undefined'||typeof mt=='undefined')return;const fresh=mt>lastMt+.05;lastMt=mt;if(fresh)onSay(msg)}
 function onSay(m){try{const s=String(m||'');let mm;
   if((mm=s.match(/^(World goal done|World mastered|Collection reward): ?(.*?)\s*\+(\d+) gems$/))){const g=+mm[3];celebrate(P.x,P.y+P.h,RC[mm[1]=='World mastered'?3:1],{d:1.2,s:.8,n:16});fly(P.x,P.y-20,g);fan('quest');card({kind:'goal',kick:mm[1],title:mm[2]||'Collection',gems:g,tier:mm[1]=='World mastered'?3:1})}
   else if(/cosmic rift is closed|blossom spirit smiles/.test(s)){const g=(s.match(/\+(\d+) gems/)||[])[1]|0;celebrate(P.x,P.y+P.h,'#d7c2ff',{d:1.4,s:.9,n:20});if(g)fly(P.x,P.y-20,g);fan('ach');card({kind:'event',kick:'World event',title:/rift/.test(s)?'Rift closed':'Blessed by the spirit',gems:g,tier:2})}}catch(_){}}
 return{card,reveal,pillar,confetti,sparkle,flash,fly,fan,quest,ach,levelUp,celebrate,RC,RK,RN,tierOf,get pend(){return pend},get flights(){return FL.length},get fx(){return FX.length},get cards(){return cards.length},get shown(){return dv}}})();
