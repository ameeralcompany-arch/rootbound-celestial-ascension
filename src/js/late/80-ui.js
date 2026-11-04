// ===== V6 UI: HUD (portrait/title/wing), banner, minimap, character hub (profile, appearance, wings, nameplates, skills, settings, account) =====
const UI6=(()=>{
 const el=id=>document.getElementById(id);let hubOn=false,tab='profile',prevW=-2,prevT=-1,prevL=0;
 // ---- HUD additions
 const hl=el('hudL');const pc=document.createElement('canvas');pc.id='portrait';pc.width=pc.height=128;hl.insertBefore(pc,hl.firstChild);
 const tt=document.createElement('div');tt.id='hudTitle';const hw=document.createElement('div');hw.id='hudWing';
 hl.insertBefore(tt,el('pname').nextSibling);hl.appendChild(hw);
 function withCtx(ctx,fn){const o=g;g=ctx;try{fn()}finally{g=o}}
 let pkey='';
 function portrait(){const A=cel.ap,dk=document.documentElement.dataset.theme=='dark',key=JSON.stringify(A)+dk+(wear.hat||'')+(typeof AVF10!='undefined'?AVF10.bgKey():'');if(key==pkey)return;pkey=key;const x=pc.getContext('2d');x.clearRect(0,0,128,128);x.save();x.beginPath();x.arc(64,64,64,0,6.3);x.clip();if(!(typeof AVF10!='undefined'&&AVF10.bg(x,dk))){const gr=x.createRadialGradient(64,44,6,64,64,72);gr.addColorStop(0,dk?'#4a3a78':'#ffffff');gr.addColorStop(.6,dk?'#2a2148':'#e6def6');gr.addColorStop(1,dk?'#181430':'#d6e2f4');x.fillStyle=gr;x.fillRect(0,0,128,128)}
  withCtx(x,()=>{x.save();const hz=wear.hat&&WEAR[wear.hat]?1:0;x.translate(64,236-hz*8);x.scale(3.4-hz*.4,3.4-hz*.4);const L=AC6.info(look,null,true);AC6.headFull(x,L,-50,0,0,wear);x.restore()});x.restore()}
 function say6(t,s,ms){const b=el('banner');b.firstChild.textContent=t;b.lastChild.textContent=s||'';b.classList.add('on');clearTimeout(say6.t);say6.t=setTimeout(()=>b.classList.remove('on'),ms||3200)}
 // ---- minimap
 const mc=el('minic'),mx=mc.getContext('2d');let mmT=0;
 function minimap(now){if(now-mmT<250||!entered)return;mmT=now;mx.clearRect(0,0,150,96);const R=75,cxT=P.x/T|0,cyT=P.y/T|0,sx=150/(R*2),sy=96/(R*1.28),y0=cyT-48*.64|0;mx.fillStyle='rgba(8,6,16,.85)';mx.fillRect(0,0,150,96);
  const img=mx.createImageData(150,96),d=img.data;for(let j=0;j<96;j++)for(let i=0;i<150;i++){const tx=cxT+((i/150)*R*2-R)|0,ty=cyT+((j/96)*R*1.28-R*.64)|0;let r=0,g2=0,b=0,a=0;if(tx>=0&&ty>=0&&tx<W&&ty<H){const bk=tiles[ty*W+tx];if(bk){const c=BLK[bk]&&BLK[bk][1]?BLK[bk][1]:'#777';r=parseInt(c.slice(1,3),16)||100;g2=parseInt(c.slice(3,5),16)||100;b=parseInt(c.slice(5,7),16)||100;a=210}else if(wl[ty*W+tx]){r=60;g2=120;b=220;a=190}}const o=(j*150+i)*4;d[o]=r;d[o+1]=g2;d[o+2]=b;d[o+3]=a}mx.putImageData(img,0,0);
  for(const m of mobs){const i=(m.x/T-cxT+R)*sx,j=(m.y/T-cyT+R*.64)*sy;if(i>0&&i<150&&j>0&&j<96){mx.fillStyle='#ff5a6a';mx.fillRect(i-1,j-1,3,3)}}
  if(rm)for(const p of rm.peers()){const q=p.presence;if(p.isMe||!q||q.x==null)continue;const i=(q.x/T-cxT+R)*sx,j=(q.y/T-cyT+R*.64)*sy;if(i>0&&i<150&&j>0&&j<96){mx.fillStyle='#7ff0ff';mx.fillRect(i-1.5,j-1.5,4,4)}}
  mx.fillStyle='#ffd24a';mx.beginPath();mx.arc(75,48,3,0,6.3);mx.fill();mx.strokeStyle='#fff';mx.lineWidth=1;mx.stroke()}
 function hudTick(){if(!entered)return;portrait();const t=curPlateTier(lvl),w=curWing(lvl),A=curAura(lvl);el('pname').textContent='Lv '+lvl+'  '+myName;tt.textContent=npName(t);hw.innerHTML=w?'<i></i>'+w.n:'<i style="opacity:.3"></i>No wings yet';
  
  // progression events
  const wi=w?WINGS.indexOf(w):-1,best=bestWing(lvl),bi=best?WINGS.indexOf(best):-1;
  if(prevL&&lvl>prevL){VFX.levelUp(P.x,P.y,'#ffd24a');if(bi>cel.seenW-1&&bi>=0&&cel.seenW<=bi){cel.seenW=bi+1;celSave();VFX.ascend(P.x,P.y+10,WINGS[bi].pal);say6('WINGS AWAKENED',WINGS[bi].n.toUpperCase(),4200);shake=Math.max(shake,cel.opt.reduce?0:.12)}else if(npTier(lvl)>npTier(prevL)){VFX.wave(P.x,P.y+25,'#9a6bff',160,1,.3);say6('NEW NAMEPLATE',npName(npTier(lvl)).toUpperCase(),3600)}else say6('LEVEL '+lvl,'',1400)}
  prevL=lvl;if(bi>=0&&cel.seenW<bi+1&&!(prevL&&false)){cel.seenW=bi+1;celSave()}}
 setInterval(hudTick,150);
 // ---- hub
 const nav=el('hubnav'),body=el('hubbody');
 const EXT={};const TABS=[['profile','Profile'],['look','Appearance'],['wings','Wings & Aura'],['plates','Nameplates'],['skills','Skills'],['bosses','Bosses'],['quests','Quests'],['ach','Achievements'],['events','Events'],['settings','Settings'],['account','Save Data']];
 // open: overlay fades, sheet rises (CSS); close: a short exit (class .out) before display:none, so the hub never just blinks away
 function open(t){hubOn=true;if(t)tab=t;const h=el('hub');clearTimeout(close.t);h.classList.remove('out');if(h.style.display!='flex')lastTab='';h.style.display='flex';render()}
 function close(){if(!hubOn)return;hubOn=false;const h=el('hub');h.classList.add('out');clearTimeout(close.t);close.t=setTimeout(()=>{h.classList.remove('out');if(!hubOn)h.style.display='none'},MOTION7.reduce()?0:170)}
 el('hubx').onclick=close;el('hub').addEventListener('mousedown',e=>{if(e.target.id=='hub')close()});
 addEventListener('keydown',e=>{if(!entered||RB_SESS==null)return;const k=e.key.toLowerCase();if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'||e.target.tagName=='TEXTAREA'||e.target.isContentEditable)return;if(hubOn){e.stopPropagation();if(k=='escape')close();else if(k=='c'&&!e.repeat){close();try{EQM9.show()}catch(_){}}return}/* C: the Character Equipment menu (the hub is one click away from it) */if(k=='c'&&!e.repeat&&!e.ctrlKey&&!e.metaKey){try{if(EQM9.toggle())e.stopPropagation()}catch(er){console.error('EQM9',er)}}},true);
 function canvasFor(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
 function previewChar(c,scale,over){const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);withCtx(x,()=>{const o=cam.x,oy=cam.y;try{AC6.draw(c.width/2,c.height/2-30*scale/2.2,1,0,over&&over.name||myName,performance.now()/1000,0,false,'',wp,0,0,{},false,look,'me')}finally{}})}
 function wingCard(i,w){const u=wingOwned(w),c=canvasFor(260,170);const x=c.getContext('2d');withCtx(x,()=>{x.save();x.fillStyle='rgba(0,0,0,0)';WingArt.draw(x,i,130,90,1,performance.now()/1000,0,0,0,u?1:.35);x.restore()});return c}
 const sel=(cond)=>cond?' sel':'';
 let lastTab='';
 function render(){const vw=NAV16.view(tab);el('hubhead').innerHTML=vw.ic+'<b>'+esc(vw.title)+'</b><i aria-hidden="true">'+vw.jp+'</i>';el('hubc').classList.toggle('one',vw.tabs.length<2);body.dataset.tab=tab;nav.innerHTML=vw.tabs.map(t=>'<button data-t="'+t[0]+'" class="'+(t[0]==tab?'on':'')+'">'+esc(t[1])+'</button>').join('');nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{const a=vw.acts[b.dataset.t];if(a)return a();tab=b.dataset.t;render()});body.scrollTop=0;
  try{MOTION7.ind(nav,'button.on','u')}catch(_){}
  // content fades in only when the tab changes, not on every refresh inside a tab; it slides from the side the new tab is on
  const changed=tab!=lastTab;if(changed){const ix=k=>TABS.findIndex(t=>t[0]==k),d=lastTab?Math.sign(ix(tab)-ix(lastTab)):0;body.style.setProperty('--mo-dx',(d*12)+'px');lastTab=tab;body.classList.remove('tabin');void body.offsetWidth;body.classList.add('tabin');clearTimeout(render.t);render.t=setTimeout(()=>body.classList.remove('tabin'),700)}
  (EXT[tab]||({profile,look,wings,plates,skills,account})[tab]||profile)(body);try{EXT.post&&EXT.post(tab,body)}catch(e){console.error(e)}
  if(changed){let i=0;for(const c of body.children)c.style.setProperty('--i',Math.min(i++,8));body.querySelectorAll('.hgrid,.ach7').forEach(g=>MOTION7.stagger(g,':scope>*',12));body.querySelectorAll('.kv7 b').forEach(b=>{const v=+b.textContent;if(isFinite(v))MOTION7.tick(b,v,0)})}}
 function profile(){const t=npTier(lvl),w=curWing(lvl),nx=npRange(t)[1]+1,nw=WINGS.find(x=>!x.shop&&lvl<x.lvl),xpp=Math.min(100,xp/xpNeed(lvl)*100);
  body.innerHTML='<h3>Profile</h3><div class="prof"><canvas id="pv" width="220" height="286"></canvas><div><div class="psub7">✦ '+esc(npName(t))+' · Level '+lvl+'</div><div class="pname7">'+esc(myName)+'</div>'+
  '<div class="stat" style="margin-top:14px!important"><span>XP</span><div class="bar"><i style="width:'+xpp+'%"></i></div><small>'+Math.floor(xp)+' / '+xpNeed(lvl)+'</small></div>'+
  '<div class="kv7"><div><small>Health</small><b>'+Math.round(maxHP())+'</b></div><div><small>Gems</small><b>'+gems+'</b></div><div><small>Skill points</small><b>'+pst.pts+'</b></div><div><small>Blocks broken</small><b>'+(stats.break|0)+'</b></div><div><small>Monsters defeated</small><b>'+(stats.kill|0)+'</b></div></div>'+
  '<h4>Ascension</h4><p>Wings: <b>'+(w?esc(w.n):'none yet')+'</b>'+(nw?' · next: '+esc(nw.n)+' at level '+nw.lvl:' · all wings unlocked')+'<br>Next nameplate: <b>'+esc(npName(t+1))+'</b> at level '+nx+'</p></div></div>';
  const c=el('pv');const x=c.getContext('2d');let raf;const loop=()=>{if(!hubOn||tab!='profile')return;pvDraw(x);raf=requestAnimationFrame(loop)};loop()}
 // large character preview for Profile / Appearance (scaled up around the feet so the nameplate and wings stay in frame)
 function pvDraw(x){x.clearRect(0,0,220,286);withCtx(x,()=>{x.save();x.translate(110,252);x.scale(1.55,1.55);AC6.draw(0,-70,1,0,'',performance.now()/1000,0,false,'',wp,0,0,wear,false,look,'me');x.restore()})}
 function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
 function chips(label,key,list){return '<div class="hrow"><label>'+label+'</label>'+list.map((n,i)=>'<span class="hchip'+(cel.ap[key]==i?' on':'')+'" data-k="'+key+'" data-i="'+i+'">'+n+'</span>').join('')+'</div>'}
 function look_(){}
 function look(){body.innerHTML='<h3>Appearance</h3><div class="prof"><canvas id="pv" width="220" height="286"></canvas><div>'+chips('Hair style','hair',AP.hair)+chips('Eyes','eyes',AP.eyes)+chips('Outfit','outfit',AP.outfit)+chips('Accessory','acc',AP.acc)+chips('Cape','cape',AP.cape)+
  '<div class="hrow"><label>Eye colour</label>'+AP.eyeCol.map((c,i)=>'<span class="hchip sw7'+(cel.ap.eyeCol==i?' on':'')+'" data-k="eyeCol" data-i="'+i+'" style="--sw:'+c+'" title="Eye colour '+(i+1)+'"></span>').join('')+'</div>'+
  '<div class="hrow"><label>Hair</label><input type="color" id="chair" value="'+cel.ap.hairCol+'"><label>Skin</label><input type="color" id="cskin" value="'+cel.ap.skinCol+'"><label>Outfit</label><input type="color" id="cout" value="'+cel.ap.outCol+'"><label>Trim</label><input type="color" id="ctrim" value="'+cel.ap.trimCol+'"></div>'+
  '<div class="hrow"><button class="hbtn" id="crand">Randomise</button><button class="hbtn" id="cname">Change name</button></div></div></div>';
  const c=el('pv'),x=c.getContext('2d');const loop=()=>{if(!hubOn||tab!='look')return;pvDraw(x);requestAnimationFrame(loop)};loop();
  const upd=()=>{celSave();try{look.skin=cel.ap.skinCol;look.hair=cel.ap.hairCol;saveP()}catch(_){}};
  body.querySelectorAll('.hchip[data-k]').forEach(b=>b.onclick=()=>{cel.ap[b.dataset.k]=+b.dataset.i;upd();render()});
  for(const[id,k]of[['chair','hairCol'],['cskin','skinCol'],['cout','outCol'],['ctrim','trimCol']])el(id).oninput=e=>{cel.ap[k]=e.target.value;upd()};
  el('crand').onclick=()=>{const r=n=>Math.random()*n|0,hx=()=>'#'+[0,0,0].map(()=>(40+r(180)).toString(16).padStart(2,'0')).join('');Object.assign(cel.ap,{hair:r(AP.hair.length),eyes:r(AP.eyes.length),outfit:r(AP.outfit.length),acc:r(AP.acc.length),cape:r(3),eyeCol:r(AP.eyeCol.length),hairCol:hx(),outCol:hx(),trimCol:hx()});upd();render()};
  el('cname').onclick=()=>{const n=prompt('Character name (max 14)',myName);if(n){myName=n.trim().slice(0,14)||myName;saveP()}}}
 function wings(){const w0=curWing(lvl),a0=curAura(lvl);let h='<h3>Celestial Wings</h3><div class="hrow"><span class="hchip'+(cel.wingsOn?' on':'')+'" id="wtog">Wings '+(cel.wingsOn?'ON':'OFF')+'</span><span class="hchip'+(cel.wing=='auto'?' on':'')+'" id="wauto">Auto (best unlocked)</span></div><div class="hgrid">';
  WINGS.forEach((w,i)=>{const u=wingOwned(w);h+='<div class="hcard'+(u?'':' lock')+sel(w0&&w0.id==w.id)+'" data-w="'+i+'"><div class="cv"></div><b>'+w.n+'</b><small>'+(u?w.d+' Double jump.':w.shop?'Available in the Store':'Unlocks at level '+w.lvl)+'</small></div>'});
  h+='</div><h3 style="margin-top:18px">Ground Aura</h3><div class="hrow"><span class="hchip'+(cel.auraOn?' on':'')+'" id="atog">Aura '+(cel.auraOn?'ON':'OFF')+'</span><span class="hchip'+(cel.aura=='auto'?' on':'')+'" id="aauto">Auto</span></div><div class="hgrid">';
  AURAS.forEach((a,i)=>{if(a.id=='none')return;const u=lvl>=a.lvl;h+='<div class="hcard'+(u?'':' lock')+sel(a0.id==a.id)+'" data-a="'+i+'"><div class="cv"></div><b>'+a.n+'</b><small>'+(u?'Unlocked':'Unlocks at level '+a.lvl)+'</small></div>'});
  body.innerHTML=h+'</div>';body.querySelectorAll('.hcard[data-w]').forEach(d=>{const i=+d.dataset.w;d.querySelector('.cv').appendChild(wingCard(i,WINGS[i]));d.onclick=()=>{if(wingOwned(WINGS[i])){cel.wing=WINGS[i].id;cel.wingsOn=1;celSave();render()}else if(WINGS[i].shop){try{STORE7.open({item:'wing_'+WINGS[i].id})}catch(_){}}}});
  body.querySelectorAll('.hcard[data-a]').forEach(d=>{const i=+d.dataset.a,a=AURAS[i],c=canvasFor(260,120),x=c.getContext('2d');withCtx(x,()=>{Sigil.draw(x,a,130,60,0,110,lvl>=a.lvl?1:.3)});d.querySelector('.cv').appendChild(c);d.onclick=()=>{if(lvl>=a.lvl){cel.aura=a.id;cel.auraOn=1;celSave();render()}}});
  el('wtog').onclick=()=>{cel.wingsOn=cel.wingsOn?0:1;celSave();render()};el('wauto').onclick=()=>{cel.wing='auto';celSave();render()};el('atog').onclick=()=>{cel.auraOn=cel.auraOn?0:1;celSave();render()};el('aauto').onclick=()=>{cel.aura='auto';celSave();render()}}
 function plates(){const t0=npTier(lvl),cur=curPlateTier(lvl);let h='<h3>Nameplate Gallery</h3><div class="hrow"><span class="dim">A new nameplate unlocks every '+NP_STEP+' levels. Pick any unlocked one to display.</span><span class="hchip'+(cel.plate=='auto'?' on':'')+'" id="pauto">Auto (highest)</span></div><div class="hgrid">';
  const show=Math.max(12,t0+4);for(let t=0;t<show;t++){const u=t<=t0,r=npRange(t);h+='<div class="hcard'+(u?'':' lock')+sel(t==cur)+'" data-t="'+t+'"><div class="cv" style="text-align:center;padding:10px 0"></div><b>'+npName(t)+'</b><small>'+(u?'Unlocked':'Locked')+' - level '+r[0]+(t==0?'-'+r[1]:'-'+r[1])+'</small></div>'}
  body.innerHTML=h+'</div>';body.querySelectorAll('.hcard[data-t]').forEach(d=>{const t=+d.dataset.t,u=t<=t0,p=Plate.get(t,myName,Math.max(1,npRange(t)[0])),c=canvasFor(p.w*2,p.h*2),x=c.getContext('2d');if(!u)x.globalAlpha=.35;x.drawImage(p.c,0,0,p.w*2,p.h*2);c.style.cssText='width:auto;max-width:100%;background:none';d.querySelector('.cv').appendChild(c);d.onclick=()=>{if(u){cel.plate=t;celSave();render()}}});
  el('pauto').onclick=()=>{cel.plate='auto';celSave();render()}}
 const SK=[['vit','Vitality','+10 max HP per point'],['str','Strength','+4% damage, +1 break power / 5'],['agi','Agility','+1% speed, +2% attack speed'],['def','Defense','-1.5% damage taken'],['lck','Fortune','+1% crit, +2% luck'],['foc','Focus','-2% skill cooldown']];
 function skills(){let h='<h3>Skills</h3><div class="hrow"><div class="hchip on">Unspent points: '+pst.pts+'</div><small>+2 points each level up</small></div>';for(const[k,n,d]of SK)h+='<div class="stat"><span>'+n+'</span><div class="bar"><i style="width:'+Math.min(100,pst[k]*2)+'%"></i></div><span><b>'+pst[k]+'</b> <button class="hbtn" data-k="'+k+'" '+(pst.pts<1?'disabled style="opacity:.4"':'')+'>+1</button> <small>'+d+'</small></span></div>';
  h+='<div class="hrow"><button class="hbtn dng" id="srst">Respec (costs '+(100+20*(lvl|0))+' gems)</button></div>';body.innerHTML=h;body.querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{if(pst.pts>0){pst.pts--;pst[b.dataset.k]++;P.hp=Math.min(P.hp,maxHP());try{saveP()}catch(_){}render()}});
  el('srst').onclick=()=>{const cost=100+20*(lvl|0);if(gems<cost){say('Need '+cost+' gems to respec');return}let tot=0;for(const[k]of SK){tot+=pst[k];pst[k]=0}pst.pts+=tot;gems-=cost;try{saveP()}catch(_){}render()}}
 // Settings tab: UI6.ext.settings (90-settings-organize.js)
 function applyUi(){const s=cel.opt.ui;for(const id of['hudL','bar','skills','quest','hudR'])el(id)&&(el(id).style.zoom=s);$('fps').style.display=cel.opt.fpsShow?'block':'none'}
 // ---- account / save export & import
 const BK_DEVICE=/^(rb_|rbtok$|rbsrv$|rbdiag|rbp_corrupt)/,BK_JSON=/^(rbp$|rbopt$|rbidx$|rbw_|rbc\d*$|rbp_bak)/;
 function exportAll(){const o={app:'rootbound',v:1,keys:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(RB_PREFIX)){const b=k.slice(RB_PREFIX.length);if(/^rb/.test(b)&&!BK_DEVICE.test(b))o.keys[b]=localStorage.getItem(b)}}return JSON.stringify(o)}
 function importAll(txt){if(typeof RB_ACCT!='undefined'&&RB_ACCT.id)throw Error('Save files cannot be imported while signed in. Sign out first');const o=JSON.parse(txt);if(!o||o.app!='rootbound'||typeof o.keys!='object')throw Error('Not a Rootbound backup');let n=0;for(const k in o.keys){if(!/^rb[A-Za-z0-9_-]{0,44}$/.test(k)||BK_DEVICE.test(k)||typeof o.keys[k]!='string'||o.keys[k].length>4e6)continue;if(BK_JSON.test(k)){try{JSON.parse(o.keys[k])}catch(_){continue}}localStorage.setItem(k,o.keys[k]);n++}return n}
 // save backup (the game is single-player: one save on this computer)
 function account(){if((()=>{try{return !!RB_ACCT.id}catch(_){return false}})()){body.innerHTML='<h3>Save Data</h3><p>Your progress is saved on the server with your account.</p>';return}body.innerHTML='<h3>Save Data</h3><p>Your progress is saved automatically on this computer.</p><div class="hrow"><button class="hbtn" id="aex">Export save file</button><button class="hbtn" id="aim">Import save file</button></div><input type="file" id="afile" accept=".json,application/json" style="display:none"><div id="amsg" class="dim"></div><p class="dim">Export a backup now and then, so you can bring your progress back if anything happens to this computer.</p>';
  el('aex').onclick=()=>{try{saveP();celSave()}catch(_){}const b=new Blob([exportAll()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='rootbound-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
  el('aim').onclick=()=>el('afile').click();el('afile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const n=importAll(String(r.result));if(!n){el('amsg').textContent='No Rootbound save found in that file.';return}try{RB_ACCT.freeze()}catch(_){}el('amsg').textContent='Save imported. Restarting...';setTimeout(()=>location.reload(),700)}catch(er){el('amsg').textContent='Import failed: '+er.message}};r.readAsText(f)}}
 applyUi();
 return{open,close,say6,minimap,exportAll,importAll,get on(){return hubOn},render,applyUi,ext:EXT,TABS,get body(){return body},esc,get tab(){return tab}}})();
// expose AC6.head for the portrait
