// Measures every ARS10 weapon with the balance simulator from tests/balance.js and writes its tables into
// src/js/late/99-zzzzzzzzz-d-arsenal.js: AK (measured power per point of base damage, BAL11's K) and AM (base damage, BAL11's MD).
// Each weapon's target power follows its rarity band and level: it is placed on the curve through the existing weapons of its rarity
// (monotonic in level, kept inside the gap between the rarity below and above), then base damage = target / K, re-measured once.
// Usage: node tools/arsenal-measure.js [--only id,id] [--secs 20]   (needs the built index.html; CHROMIUM / NODE_PATH like the tests)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),SRC=path.join(ROOT,'src/js/late/99-zzzzzzzzz-d-arsenal.js');
const bal=fs.readFileSync(path.join(ROOT,'tests/balance.js'),'utf8'),SIMLIB=bal.slice(bal.indexOf('const SIMLIB=`')+14,bal.indexOf('`;',bal.indexOf('const SIMLIB=`')));
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'}))});
 await p.goto('file://'+path.join(ROOT,'index.html'));await p.waitForTimeout(800);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(400);
 await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=40});await p.evaluate(SIMLIB);
 await p.evaluate(()=>enterWorld('baltest'));await p.waitForTimeout(1500);
 const only=arg('--only'),secs=+(arg('--secs')||20);
 const ids=await p.evaluate(o=>o?o.split(','):ARS10.IDS.slice(),only);
 const val=v=>{const r=v.far>=.5*v.near,S=r?(v.near+v.far)/2:v.near,A=Math.min(3.5,r?(v.nearA+v.farA)/Math.max(1e-6,v.near+v.far):v.nearA/Math.max(1e-6,v.near));return S*(1+.15*(A-1))*(r?1.1:1)};
 const measure=async(id,md)=>{const v=await p.evaluate(([id,md,secs])=>{WPN[id].md=md;return SIM.weapon(id,{secs})},[id,md,secs]);return val(v)};
 // existing weapons (not the arsenal): rarity, level, power — the curves the new weapons are placed on
 const ex=await p.evaluate(()=>Object.keys(WPN).filter(id=>WPN[id].md>0&&WPN[id].k!='tool'&&!WPN[id].myth&&!WPN[id].ars).map(id=>({r:BAL11.RO.indexOf(WPNRAR(id)),lv:WPN[id].lv|0,p:WPOWER(id)})));
 const spec=await p.evaluate(ids=>ids.map(id=>({id,r:ARS10.SPEC[id].r,lv:ARS10.SPEC[id].lv})),ids);
 const RO=6,band=r=>40*Math.pow(1.3,r);
 const lo=r=>{const a=ex.filter(x=>x.r==r-1).map(x=>x.p);return a.length?Math.max(...a)*1.03:band(r)*.85},hi=r=>{const a=ex.filter(x=>x.r==r+1).map(x=>x.p);return a.length?Math.min(...a)*.97:band(r)*1.2};
 function target(r,lv){const pts=ex.filter(x=>x.r==r).sort((a,b)=>a.lv-b.lv);let run=0;for(const q of pts){run=Math.max(run,q.p);q.m=run}
  let t;if(!pts.length)t=band(r);else{const below=pts.filter(q=>q.lv<lv),above=pts.filter(q=>q.lv>lv),same=pts.filter(q=>q.lv==lv);
   const a=below.length?below[below.length-1]:null,c=above.length?above[0]:null;
   if(same.length)t=Math.max(...same.map(q=>q.m));else if(a&&c)t=a.m+(Math.max(a.m,c.p)-a.m)*(lv-a.lv)/(c.lv-a.lv);else if(a)t=a.m*1.01;else t=Math.min(c.p,band(r))*.99;
   if(a)t=Math.max(t,a.m);if(c)t=Math.min(t,Math.max(c.p,a?a.m:0))}
  return Math.max(lo(r),Math.min(hi(r),t))}
 // among the new weapons of a rarity, power must also rise with level: nudge targets up the level order
 const T={};for(let r=0;r<RO;r++){const L=spec.filter(s=>s.r==r).sort((a,b)=>a.lv-b.lv);let prev=0,plv=-1;for(const s of L){let t=target(r,s.lv);if(s.lv>plv&&t<prev)t=Math.min(hi(r),prev*1.001);T[s.id]=t;if(s.lv>plv){prev=Math.max(prev,t);plv=s.lv}else prev=Math.max(prev,t)}}
 const src=fs.readFileSync(SRC,'utf8'),old=k=>{const m=src.match(new RegExp('/\\*'+k+'\\*/(\\{[^]*?\\})/\\*'+k+'\\*/'));return m?JSON.parse(m[1].replace(/([a-z_0-9]+):/g,'"$1":')):{}};
 const AK=old('AK'),AM=old('AM');const t0=Date.now();let i=0;
 for(const s of spec){const v1=await measure(s.id,10),k1=Math.max(.01,v1/10),md1=Math.max(3,T[s.id]/k1),v2=await measure(s.id,md1),k2=Math.max(.01,v2/md1);
  AK[s.id]=+k2.toFixed(3);AM[s.id]=+Math.max(3,T[s.id]/k2).toFixed(1);i++;
  if(i%10==0||i==spec.length)console.log(i+'/'+spec.length,s.id,'K',AK[s.id],'md',AM[s.id],'target',T[s.id].toFixed(1),Math.round((Date.now()-t0)/1000)+'s')}
 const ser=o=>'{'+Object.keys(o).map(k=>k+':'+o[k]).join(',')+'}';
 const out=src.replace(/\/\*AK\*\/\{[^]*?\}\/\*AK\*\//,'/*AK*/'+ser(AK)+'/*AK*/').replace(/\/\*AM\*\/\{[^]*?\}\/\*AM\*\//,'/*AM*/'+ser(AM)+'/*AM*/');
 fs.writeFileSync(SRC,out);console.log('wrote',Object.keys(AK).length,'K and',Object.keys(AM).length,'base damages',errs.length?'errors: '+errs.slice(0,3).join(' | '):'');await b.close()})();
