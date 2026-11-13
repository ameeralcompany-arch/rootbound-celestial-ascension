// ===== COS1: cosmetics. Looks only: they are never in WEAR, so nothing that adds up stats can see them, and a cosmetic hat, outfit or suit simply shows
// instead of the worn gear's look (60-char.js hides the gear art; the gear's stats stay). One item per slot: outfit, hat, mask, hair accessory, back;
// a suit takes the place of the outfit and the hat. Store cosmetics are bought through SHOP7 (server-checked); the rest are found by breaking, rolled
// by the server (server/cosmetics.js), which also removes anything you do not own before others are told what you wear (presence "cz", catalog ords).
// The art for each cosmetic is registered with COS1.art(id, {back, torso, head, front, hb, hh, oc}) in the j2 files (hb: hides the worn gear body and the base outfit's details, hh: hides the gear hat, oc: the colour the body and sleeves take); each layer is called with the body's
// own measurements (sh shoulders, hip, hy head centre in head space, t time, vx, air, run, ls/as leg and arm swing, gd body type, L look, oc/trim colours). =====
try{window.COS1=(()=>{
 const items=(typeof CATALOG7!='undefined'&&CATALOG7.items||[]).filter(i=>i.cat==='cosmetics'),byId=new Map(items.map(i=>[i.id,i])),byOrd=new Map(items.map(i=>[i.ord,i]));
 const TIERS=(typeof CATALOG7!='undefined'&&CATALOG7.cosTiers)||{},SETS=(typeof CATALOG7!='undefined'&&CATALOG7.cosSets)||{};
 const SLOTS=['suit','outfit','hat','mask','hairacc','back'],SLOTN={suit:'Full costume',outfit:'Outfit',hat:'Hat',mask:'Mask',hairacc:'Hair accessory',back:'Back'};
 const TORDER=['rare','veryrare','extreme','mythical','ultra'],RTIER={rare:2,veryrare:3,extreme:4,mythical:5,ultra:5};
 const ART={};const art=(id,a)=>{ART[id]=a;dirty++};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 // ---- state: what you wear (and the finds this computer knows of; the server's record is the truth and arrives on sign-in)
 const st={eq:{},drop:{}};let dirty=1;
 try{const o=JSON.parse(localStorage.getItem('rbcos')||'{}');if(o.eq&&typeof o.eq=='object')for(const s of SLOTS)if(typeof o.eq[s]=='string'&&byId.has(o.eq[s]))st.eq[s]=o.eq[s];if(o.drop&&typeof o.drop=='object')for(const k in o.drop)if(byId.has(k))st.drop[k]=1}catch(_){}
 const save=()=>{dirty++;try{localStorage.setItem('rbcos',JSON.stringify(st))}catch(_){}};
 const creative=()=>typeof RB_CREATIVE!='undefined'&&!!RB_CREATIVE;
 function owns(id){const it=byId.get(id);if(!it)return false;if(creative()||st.drop[id])return true;if(it.how==='drop')return false;try{return !!SHOP7.has(id)}catch(_){return false}}
 function equip(id){const it=byId.get(id);if(!it||!owns(id))return false;const s=it.sub;if(s==='suit'){delete st.eq.outfit;delete st.eq.hat}if((s==='outfit'||s==='hat')&&st.eq.suit)delete st.eq.suit;st.eq[s]=id;save();try{UIS.play('confirm')}catch(_){}return true}
 function unequip(slot){if(!st.eq[slot])return false;delete st.eq[slot];save();try{UIS.play('close')}catch(_){}return true}
 const worn=()=>SLOTS.map(s=>st.eq[s]).filter(id=>id&&owns(id)&&ART[id]);
 // ---- drawing: one render key per combination, cached, so a frame allocates nothing
 const KC=new Map();function keyOf(ids){if(!ids.length)return null;const sig=ids.join('|');let k=KC.get(sig);if(!k){let hb=0,hh=0,oc=null;for(const id of ids){const a=ART[id];if(a.hb)hb=1;if(a.hh)hh=1;if(a.oc)oc=a.oc}k={ids:ids.slice(),hb,hh,oc};KC.set(sig,k);if(KC.size>200)KC.delete(KC.keys().next().value)}return k}
 let mine=null,mineAt=-1,over=null;
 AC6.COSK=(local,cxo)=>{if(local){if(over)return over;if(mineAt!==dirty){mineAt=dirty;mine=keyOf(worn())}return mine}const cz=cxo&&cxo.cz;if(!Array.isArray(cz)||!cz.length)return null;const ids=[];for(const o of cz){const it=byOrd.get(o);if(it&&ART[it.id])ids.push(it.id)}return keyOf(ids)};
 let errN=0;AC6.COS=(g,layer,key,c)=>{LITE=!c.me&&!over&&(crowd()||lowQ());for(const id of key.ids){const f=ART[id]&&ART[id][layer];if(!f)continue;g.save();try{f(g,c)}catch(e){if(errN++<3)console.error('COS1 art',id,layer,e)}g.restore()}};
 // ---- what others see: your worn cosmetics as catalog numbers (the server removes any you do not own)
 try{const _cp=celPres;celPres=function(){const o=_cp.apply(this,arguments);try{const L=worn();o.cz=L.map(id=>byId.get(id).ord)}catch(_){}return o}}catch(e){console.error('COS1 presence',e)}
 // other players' looks: keep the evolution, fight pose, nameplate skin (dropped before by mistake) and cosmetics, each checked
 try{const _cc=cleanCx;cleanCx=function(c){const r=_cc.apply(this,arguments);try{if(r&&c&&typeof c=='object'){
   if(typeof c.ev=='string'&&/^[a-z]{3,14}$/.test(c.ev))r.ev=c.ev;
   if(Array.isArray(c.fa)&&typeof c.fa[0]=='string'&&c.fa[0].length<=28)r.fa=[c.fa[0],c.fa[1]|0];
   if(typeof c.sk=='string'&&/^[a-z0-9_-]{1,32}$/i.test(c.sk))r.sk=c.sk;
   if(Array.isArray(c.cz))r.cz=c.cz.slice(0,8).map(v=>v|0).filter(v=>byOrd.has(v))}}catch(_){}return r}}catch(e){console.error('COS1 cleanCx',e)}
 // ---- a big try-on picture of your own character wearing one item (the store, the collection); returns false if the art is not loaded
 function preview(x,it,Wd,Hd,t,o){o=o||{};const id=it&&(it.id||it);if(!ART[id])return false;const cur=worn().filter(q=>{const a=byId.get(q),b=byId.get(id);if(!a||!b)return true;if(a.sub===b.sub)return false;if(b.sub==='suit'&&(a.sub==='outfit'||a.sub==='hat'))return false;if(a.sub==='suit'&&(b.sub==='outfit'||b.sub==='hat'))return false;return true});
  const key=keyOf(o.only?[id]:cur.concat([id]));const g0=g;over=key;let ws0=null;x.save();try{g=x;if(!o.wings&&typeof WingArt!='undefined'&&WingArt.drawChar){ws0=WingArt.drawChar;WingArt.drawChar=()=>{}}/* the item, not the wings */const s=Math.min(o.scale||9e9,Hd*.8/80,Wd*.86/56);x.translate(Wd/2,Hd*.93);x.scale(s,s);x.translate(0,-30);
   AC6.quiet=1;AC6.draw(0,-24,o.f||1,0,'',t||performance.now()/1000,o.vx||0,!!o.air,'',o.wpn||'fist',0,0,typeof wear!='undefined'?wear:{},false,typeof look!='undefined'?look:null,'me')}catch(e){if(errN++<3)console.error('COS1 preview',e)}finally{AC6.quiet=0;g=g0;over=null;if(ws0)WingArt.drawChar=ws0;x.restore()}return true}
 // ---- finds
 function onFind(m){if(!m)return;if(m.all){try{REW8.card({tier:RTIER[m.tier]||2,kick:'A rare find',title:'+'+(m.gems|0)+' gems',sub:'You already own every cosmetic that can be found, so this find became gems.',showTier:false,kind:'cos'})}catch(_){}return}
  const it=byId.get(m.id);if(!it)return;const had=!!st.drop[m.id];st.drop[m.id]=1;save();try{NET7.send({t:'cosack',id:m.id})}catch(_){}if(had&&m.again)return;
  const T=TIERS[it.tier]||{n:'Rare',p:.005},pct=(T.p*100).toFixed(2)+'%';
  if(it.tier==='ultra'||it.tier==='mythical')moment(it,m.ser,T,pct);
  else{try{REW8.card({tier:RTIER[it.tier]||2,kick:T.n.toUpperCase()+' FIND · '+pct+' per break',title:it.n,sub:'Number '+(m.ser|0)+' ever found. Open your Collection to wear it.',showTier:true,kind:'cos'})}catch(_){}
   try{REW8.reveal('cos',1,P.x,P.y+P.h*.4,{tier:RTIER[it.tier]||2})}catch(_){}try{UIS.play('rare')}catch(_){}chime(it.tier)}}
 // the soft chime of a find: rising pentatonic bells, brighter and longer for rarer tiers
 function chime(tier){try{const a=window.__cosAC||(window.__cosAC=new(window.AudioContext||window.webkitAudioContext)());if(a.state=='suspended')a.resume();const v=(typeof mute!='undefined'&&mute)?0:Math.min(1,typeof OPT!='undefined'&&OPT.sv!=null?+OPT.sv:1);if(!v)return;
   const n=TORDER.indexOf(tier)+3,base=[72,74,76,79,81,84,86,88,91],t0=a.currentTime+.02;for(let i=0;i<n;i++){const f=440*Math.pow(2,(base[i]-69)/12),o=a.createOscillator(),o2=a.createOscillator(),gn=a.createGain();o.type='sine';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.76;gn.gain.setValueAtTime(0,t0+i*.11);gn.gain.linearRampToValueAtTime(.07*v,t0+i*.11+.01);gn.gain.exponentialRampToValueAtTime(.0001,t0+i*.11+1.6+n*.1);o.connect(gn);o2.connect(gn);gn.connect(a.destination);o.start(t0+i*.11);o2.start(t0+i*.11);o.stop(t0+i*.11+2.4);o2.stop(t0+i*.11+2.4)}}catch(_){}}
 // the two rarest tiers stop the moment: a beam of light, your character wearing it, its name and number
 function moment(it,ser,T,pct){let d=document.getElementById('cosfind');if(d)d.remove();d=document.createElement('div');d.id='cosfind';d.setAttribute('role','dialog');d.setAttribute('aria-label','Rare find');
  const col=it.tier==='ultra'?'#ffe9a8':'#ff8ae8';d.style.setProperty('--cf',col);
  d.innerHTML='<div class="cf-beam"></div><div class="cf-in"><small>'+esc(T.n.toUpperCase())+' FIND</small><canvas width="360" height="360"></canvas><b>'+esc(it.n)+'</b><p>'+esc(it.setn||'')+' · number '+(ser|0)+' ever found · '+pct+' per break</p><div class="cf-btn"><button data-c="eq">Wear it now</button><button data-c="x" class="s">Later</button></div></div>';
  document.body.appendChild(d);const cv=d.querySelector('canvas'),x=cv.getContext('2d');let raf=0;const t0=performance.now();const tick=()=>{if(!d.isConnected)return;x.clearRect(0,0,360,360);const t=(performance.now()-t0)/1000;preview(x,it,360,360,t,{scale:4.6,only:false});raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);
  const close=()=>{cancelAnimationFrame(raf);d.classList.add('out');setTimeout(()=>d.remove(),400)};d.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;if(b.dataset.c=='eq')equip(it.id);close()});
  try{REW8.celebrate(P.x,P.y+P.h*.5,col,{n:60})}catch(_){}chime(it.tier);setTimeout(()=>chime(it.tier),900);try{shake=Math.max(shake||0,.2)}catch(_){}}
 try{NET7.on('cosm',onFind);NET7.on('cosw',m=>{if(!Array.isArray(m.own))return;for(const id of m.own)if(byId.has(id))st.drop[id]=1;save()});
  NET7.on('cosann',m=>{const a=m&&m.d;if(!a)return;const it=byId.get(a.id);if(!it)return;const T=TIERS[it.tier]||{n:'Rare'};try{UI6.say6(String(a.n||'Someone').slice(0,14)+' found something incredible',it.n+', a '+T.n.toLowerCase()+' cosmetic (number '+(a.ser|0)+' ever found)',6500)}catch(_){}})}catch(e){console.error('COS1 net',e)}
 // ---- drawing helpers for the art files, in the game's own cel style: dark base, lit shape offset toward the light, outline
 const OLC='#2c1b33',SHC=new Map(),shade=(c,k)=>{const q=c+'|'+k;let v=SHC.get(q);if(v===undefined){try{v=AC6.shade(c,k)}catch(_){v=c}if(SHC.size>600)SHC.clear();SHC.set(q,v)}return v};
 let LITE=false,crowdT=0,crowdV=false;const GLS=new Map();const lowQ=()=>{try{return QM.cur&&(QM.cur.id=='low'||QM.cur.id=='potato')}catch(_){return false}};const crowd=()=>{const n=performance.now();if(n-crowdT>500){crowdT=n;try{crowdV=Object.keys(rp||{}).length>=9}catch(_){crowdV=false}}return crowdV};
 const H={OL:OLC,shade,celf(g,path,col,lw){if(LITE){path();g.fillStyle=col;g.fill();g.strokeStyle=OLC;g.lineWidth=lw||1;g.stroke();return}path();g.fillStyle=shade(col,-.32);g.fill();g.save();path();g.clip();g.translate(1.3,-1);path();g.fillStyle=col;g.fill();g.restore();path();g.strokeStyle=OLC;g.lineWidth=lw||1;g.stroke()},poly:(g,p)=>()=>{g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath()},glow(g,x,y,r,c,a){if(!(r>0))return;let sp=GLS.get(c);if(!sp){sp=document.createElement('canvas');sp.width=sp.height=64;const q=sp.getContext('2d'),G=q.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,c);G.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=G;q.fillRect(0,0,64,64);if(GLS.size>80)GLS.clear();GLS.set(c,sp)}g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=(a==null?.6:a);g.drawImage(sp,x-r,y-r,r*2,r*2);g.restore()},sw:(c,k)=>Math.sin(c.t*2.6+(k||0))*1.2-Math.max(-10,Math.min(10,c.vx*.03))}
 return{items,byId,byOrd,TIERS,SETS,SLOTS,SLOTN,TORDER,ART,art,st,owns,equip,unequip,worn,preview,onFind,H,get eq(){return st.eq}}})()}catch(e){console.error('COS1',e)}
