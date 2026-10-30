// ===== PET10: cute pets. Cat, Dog, Rabbit and Fox (4 fur colours each) live at a Pet Home you place in the world and wander a few tiles
// left and right of it (cheap physics: gravity, tile ground, hop up 1-block steps, turn at walls / cliffs / the edge of their range, no
// pathfinding). Timed behaviours: walk, sit, hop, stretch, chase their tail, flips, sleep (zzz), meow / bark / squeak / yip, and a happy pet
// follows you a little. Care: hungry again 2 h after a meal (real time via Date.now, so it carries across sessions; a hungry pet looks sad
// and will not play or do tricks, it never dies), happiness from petting, treats and fetch (throw a ball, it runs after it and brings it
// back). Clothes: bow, top hat, flower crown, bandana, scarf, bell collar, sweater, cape, fairy wings, each in any colour (Pet UI: press E
// next to a pet or its home). Store: adopt pets, clothes, Pet Food, Pet Treats, Pet Home (tools/pets-v11.json).
// Cost: every pose is drawn once into a cached sprite per species/fur/frame/mood/outfit (one drawImage per pet per frame: no paths, gradients
// or blur in the loop); only pets near the screen run physics, the rest just keep their timers; at most 40 little particles. =====
const PET10=(()=>{
 const R=Math.random,TAU=Math.PI*2,OL='#2b1d33',FOOD=610,TREAT=611,HOME=612,FEED_MS=2*3600e3,RANGE=4,PS=1.05,MAXH=4;
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpet10';
 MAT[FOOD]={n:'Pet Food',c:'#c98a4a',p:6};MAT[TREAT]={n:'Pet Treat',c:'#ff8fb0',p:15};MAT[HOME]={n:'Pet Home',c:'#ff9cbc',p:60};
 // fur: [name, main, light (belly / muzzle), dark (stripes, tips, spots), pattern, eye colour]
 const SP={
  cat:{n:'Cat',nm:'Mochi',spd:46,fur:[['Ginger','#f3a454','#fff1dc','#c4682a','stripe','#46a85a'],['Grey Tabby','#a6abba','#f4f4f8','#6c7186','stripe','#3f97d8'],['Midnight','#4a4460','#a59cc0','#2a2638','','#f2b52c'],['Snowball','#fffaf3','#ffffff','#e2d4c4','','#5a9ee8']]},
  dog:{n:'Dog',nm:'Biscuit',spd:58,fur:[['Golden','#efc06a','#fff3d6','#c8913a','','#7a4a2a'],['Shiba','#e98b3f','#fff4e2','#b5602a','mask','#6e3a1e'],['Cocoa','#8a5a3c','#e8c9a8','#5e3a24','','#5a3420'],['Dalmatian','#fbfbfb','#ffffff','#2d2a33','spot','#5a3a2a']]},
  rabbit:{n:'Rabbit',nm:'Bun',spd:52,fur:[['Snow','#fffaf4','#ffffff','#e4d6c8','','#d0507a'],['Cocoa','#b88760','#f4e2cc','#8a5e3e','','#6a3e26'],['Dusk','#a8a2b8','#eeeaf6','#77708a','','#7a5ab8'],['Patches','#fffaf4','#ffffff','#a07050','patch','#7a4a2a']]},
  fox:{n:'Fox',nm:'Momiji',spd:54,fur:[['Red','#f07a34','#fff4e8','#3a2430','','#d88a1a'],['Arctic','#f2f5fc','#ffffff','#a9b4d0','','#4a8ad8'],['Silver','#6f7390','#eef0f8','#2e2f40','','#c8a02a'],['Sunset','#f5a142','#fff1d8','#7a3a2a','','#b8602a']]}};
 const SPECIES=Object.keys(SP);
 const CL={bow:{n:'Ribbon Bow',s:'head',c:'#ff6fa8'},hat:{n:'Tiny Top Hat',s:'head',c:'#4a3d7a'},crown:{n:'Flower Crown',s:'head',c:'#ff9ccf'},
  bandana:{n:'Bandana',s:'neck',c:'#e8404f'},scarf:{n:'Cozy Scarf',s:'neck',c:'#5ab0ff'},collar:{n:'Bell Collar',s:'neck',c:'#d8344a'},
  sweater:{n:'Knit Sweater',s:'body',c:'#8fd16a'},cape:{n:'Hero Cape',s:'back',c:'#b3263a'},wings:{n:'Fairy Wings',s:'back',c:'#a9dcff'}};
 const SLOTS=['head','neck','body','back'],SLN={head:'Head',neck:'Neck',body:'Body',back:'Back'};
 const PAL=['#ff6fa8','#ff4d5e','#ff9a3d','#ffd34a','#8fd16a','#3fc9a0','#5ab0ff','#7a66ff','#b07aff','#ffffff','#3a3346','#c98a5a'];
 const own=id=>{try{return SHOP7.has(id)}catch(_){return false}},ownC=k=>own('petc_'+k),ownP=s=>own('pet_'+s);
 const now=()=>Date.now()+S.off;
 // ---- state: {pets:[...], homes:{world:[{id,x,y}]}} ; pet {id,sp,fur,nm,home,clo:{slot:[item,colour]},fed,hap,hapT,n:{meals,pets,plays}}
 const S={pets:[],homes:{},off:0,clk:0};
 const hexOk=c=>typeof c=='string'&&/^#[0-9a-f]{6}$/i.test(c);
 const clean=(v,n)=>String(v==null?'':v).replace(/[<>&"]/g,'').trim().slice(0,n);
 function load(){S.pets=[];S.homes={};let o=null;try{o=JSON.parse(localStorage.getItem(K())||'null')}catch(_){o=null}if(!o||typeof o!='object')return;const t=Date.now(),num=(v,lo,hi,d)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):d};
  try{const HM=o.homes&&typeof o.homes=='object'?o.homes:{};for(const w of Object.keys(HM).slice(0,60)){const L=Array.isArray(HM[w])?HM[w]:[];const out=[];for(const h of L.slice(0,8)){if(!h||typeof h!='object')continue;const x=h.x|0,y=h.y|0;if(x<1||y<1||x>=W-1||y>=H-1)continue;out.push({id:clean(h.id,12)||('h'+out.length),x,y})}if(out.length)S.homes[String(w).slice(0,40)]=out}}catch(_){}
  try{for(const p of(Array.isArray(o.pets)?o.pets:[]).slice(0,12)){if(!p||typeof p!='object'||!SP[p.sp]||S.pets.some(q=>q.sp==p.sp))continue;const clo={};const c=p.clo&&typeof p.clo=='object'?p.clo:{};
    for(const s of SLOTS){const v=c[s];if(Array.isArray(v)&&CL[v[0]]&&CL[v[0]].s==s)clo[s]=[v[0],hexOk(v[1])?v[1].toLowerCase():CL[v[0]].c]}
    const n=p.n&&typeof p.n=='object'?p.n:{};
    S.pets.push({id:clean(p.id,12)||('p'+p.sp),sp:p.sp,fur:num(p.fur,0,3,0)|0,nm:clean(p.nm,14)||SP[p.sp].nm,home:clean(p.home,12),clo,fed:num(p.fed,0,t+864e5,t),hap:num(p.hap,0,100,80),hapT:num(p.hapT,0,t+864e5,t),n:{meals:num(n.meals,0,1e6,0)|0,pets:num(n.pets,0,1e6,0)|0,plays:num(n.plays,0,1e6,0)|0}})}}catch(_){}}
 let saveT=0;function save(){clearTimeout(saveT);saveT=0;try{localStorage.setItem(K(),JSON.stringify({v:1,pets:S.pets.map(p=>({id:p.id,sp:p.sp,fur:p.fur,nm:p.nm,home:p.home,clo:p.clo,fed:p.fed,hap:p.hap,hapT:p.hapT,n:p.n})),homes:S.homes}))}catch(_){}}
 const later=()=>{clearTimeout(saveT);saveT=setTimeout(save,400)};
 load();addEventListener('pagehide',()=>{if(saveT)save()});
 const homesHere=()=>S.homes[cur]||[];
 const homeById=id=>{for(const w in S.homes){const h=S.homes[w].find(q=>q.id==id);if(h)return{w,h}}return null};
 const petsAt=id=>S.pets.filter(p=>p.home==id);
 // ---- care
 const hunger=p=>Math.max(0,(now()-p.fed)/FEED_MS),hungry=p=>hunger(p)>=1;
 const happy=p=>Math.max(5,Math.min(100,p.hap-(now()-p.hapT)/3600e3*(hungry(p)?12:4)));
 function addHap(p,v){p.hap=Math.max(5,Math.min(100,happy(p)+v));p.hapT=now();later()}
 // ---- adoption: every owned pet_* store item becomes a pet (works for store buys, creative mode and the server wallet alike)
 function ensure(){let add=0;for(const s of SPECIES){if(!ownP(s)||S.pets.some(p=>p.sp==s))continue;const h=homesHere().find(h=>petsAt(h.id).length<MAXH);
   S.pets.push({id:'p'+s,sp:s,fur:0,nm:SP[s].nm,home:h?h.id:'',clo:{},fed:now(),hap:80,hapT:now(),n:{meals:0,pets:0,plays:0}});add++;
   if(entered)try{say('You adopted a '+SP[s].n+'! '+(h?'It moved into your Pet Home. Press E next to it to open its Pet UI.':'Place a Pet Home (store, Pets) to give it a place to live.'))}catch(_){}}
  if(add)save();return add}
 setTimeout(ensure,0);setInterval(()=>{try{ensure()}catch(_){}},4000);
 {const _b=SHOP7.buy;SHOP7.buy=function(){return Promise.resolve(_b.apply(this,arguments)).then(r=>{try{ensure();if(UI.el&&UI.on)render()}catch(_){}return r})}}
 // ==== sprites ===========================================================================================================
 const hx=c=>{c=String(c).replace('#','');if(c.length==3)c=c.replace(/./g,'$&$&');const n=parseInt(c,16)||0;return[n>>16&255,n>>8&255,n&255]};
 const mix=(a,b,f)=>{const A=hx(a),B=hx(b);return'rgb('+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*f)).join(',')+')'};
 const out=(X,c,w)=>{X.fillStyle=c;X.fill();X.strokeStyle=OL;X.lineWidth=w||1.4;X.stroke()};
 const ell=(X,x,y,rx,ry,r)=>{X.beginPath();X.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),r||0,0,TAU)};
 // chibi look: a big round head over a small round body, stubby legs, big sparkly eyes (iris gradient, soft pupil, two highlights), soft
 // blush, a tiny ":3" mouth, fluffy tails and cheek tufts. Gradients are fine here: every pose is drawn once into a cached sprite.
 // frames: bob, lg = walk leg phase (-1 tucked), sit, lie (curled up), cr = stretch, hd = head down, tilt, eye o/c/z/h/s, mo w/o/e/b/f,
 // tail (wag), ear (perk + / droop -), tw = one ear twitches
 const FR={idle0:{},idle1:{bob:.6},blink:{eye:'c'},twitch:{tw:1},walk0:{lg:0,tail:.15},walk1:{lg:1,bob:-.6,tail:.35},walk2:{lg:2,tail:.15},walk3:{lg:3,bob:-.6,tail:-.05},jump:{lg:-1,sq:1,ear:.3,tail:.5},
  sit:{sit:1},sitb:{sit:1,eye:'c'},sitt:{sit:1,tw:1},talk:{sit:1,mo:'o',tilt:-.12,ear:.15},sleep0:{lie:1,eye:'z',ear:-.45},sleep1:{lie:1,eye:'z',ear:-.45,bob:.7},
  eat0:{hd:5,eye:'c',mo:'e'},eat1:{hd:6.5,eye:'c',mo:'o'},happy:{eye:'h',mo:'o',tail:.9,bob:-.8,ear:.25},stretch:{cr:1,eye:'c',mo:'o'},
  wig0:{eye:'h',mo:'o',tail:1.1,ear:.3,tilt:-.1},wig1:{eye:'h',mo:'o',tail:-.4,ear:.3,tilt:.06,bob:-.5}};
 function geo(sp,f){const b=f.bob||0,s={};
  if(f.lie){s.bx=-2;s.by=-6.4;s.rx=12.4;s.ry=6.4;s.hx=7.4;s.hy=-12.6+b*.4}
  else if(f.sit){s.bx=-3;s.by=-10;s.rx=8.6;s.ry=9.2;s.hx=4.2;s.hy=-25.5+b}
  else if(f.cr){s.bx=-4;s.by=-10;s.rx=11;s.ry=6.8;s.rot=.26;s.hx=9.6;s.hy=-12.4}
  else{s.bx=-2.5;s.by=-10+b;s.rx=10.6;s.ry=7;s.hx=7.2;s.hy=-21.4+b}
  if(sp=='rabbit'&&!f.lie&&!f.sit&&!f.cr){s.rx=9.6;s.ry=7.8;s.by=-10.2+b}
  if(f.sq){s.by-=1;s.ry-=.8;s.rx+=1;s.hy-=1.5}
  const hd=f.hd||0;s.hy+=hd;s.hx+=hd*.5;s.tilt=f.tilt||0;s.hr=sp=='rabbit'?11.6:12.4;s.fx=s.hx+2;s.fy=s.hy+2.2;return s}
 // a round fluffy puff (pom-pom tails, fox tail tips): a ring of bumps, the inner outlines covered by the fill
 function fluff(X,cx,cy,r,n,col,a0){const P2=[];for(let i=0;i<n;i++){const a=(a0||0)+i*TAU/n;P2.push([cx+Math.cos(a)*r*.6,cy+Math.sin(a)*r*.6])}
  X.strokeStyle=OL;X.lineWidth=1.3;for(const[x,y]of P2){ell(X,x,y,r*.46,r*.46);X.stroke()}X.fillStyle=col;for(const[x,y]of P2){ell(X,x,y,r*.46,r*.46);X.fill()}ell(X,cx,cy,r*.66,r*.66);X.fill()}
 function legs(X,s,f,F,near){if(f.lie)return;const far=mix(F[1],F[3],.18),col=near?F[1]:far;
  if(f.sit){if(!near){ell(X,s.bx-2.6,-4.4,6.8,4.6);out(X,F[1],1.3);ell(X,s.bx+2.8,-1.6,3.5,1.9);out(X,F[2],1.1)}
   const x=near?s.hx-4.4:s.hx-.8;X.beginPath();X.roundRect(x-2.5,s.by+3,5,-s.by-3,2.5);out(X,col,1.3);ell(X,x+.5,-1.3,2.6,1.4);X.fillStyle=F[2];X.fill();return}
  const L=[[s.bx-s.rx*.55+2.4,Math.PI],[s.bx-s.rx*.55,0],[s.bx+s.rx*.45+2.2,0],[s.bx+s.rx*.45,Math.PI]];
  for(let i=near?1:0;i<4;i+=2){let[x,ph]=L[i];let dx=0,lift=0;
   if(f.cr&&i>=2){X.beginPath();X.roundRect(s.hx-6.5+(i==2?2:0),-3.8,9.4,3.8,1.9);out(X,col,1.3);continue}
   if(f.lg==-1){dx=i<2?-2.2:2.2;lift=i<2?2.2:3}else if(f.lg!=null){const a=f.lg*Math.PI/2+ph;dx=Math.sin(a)*2.3;lift=Math.max(0,Math.cos(a))*1.6}
   const top=s.by+s.ry*.2;X.beginPath();X.roundRect(x+dx-2.6,top,5.2,-lift-top,2.6);out(X,col,1.3);ell(X,x+dx+.5,-lift-1.2,2.5,1.3);X.fillStyle=F[2];X.fill()}}
 function body(X,s,F,f){X.save();X.translate(s.bx,s.by);if(s.rot)X.rotate(s.rot);ell(X,0,0,s.rx,s.ry);X.fillStyle=F[1];X.fill();
  X.save();X.clip();X.fillStyle=F[2];ell(X,2,s.ry*.55,s.rx*.68,s.ry*.55);X.fill();X.fillStyle=F[3];
  if(F[4]=='stripe'){X.strokeStyle=F[3];X.lineWidth=1.7;X.lineCap='round';for(let i=0;i<3;i++){const x=-5+i*4;X.beginPath();X.moveTo(x-1,-s.ry);X.lineTo(x+.6,-s.ry*.35);X.stroke()}}
  else if(F[4]=='spot'){ell(X,-5,-3,2.3,1.7);X.fill();ell(X,2.5,-4.6,1.8,1.3);X.fill();ell(X,-1,1.5,1.6,1.2);X.fill();ell(X,6,0,1.4,1.1);X.fill()}
  else if(F[4]=='patch'){ell(X,-4,-3,5,4);X.fill()}
  X.fillStyle='rgba(255,255,255,.28)';ell(X,-s.rx*.25,-s.ry*.5,s.rx*.4,s.ry*.22,-.2);X.fill();   // soft sheen
  X.restore();ell(X,0,0,s.rx,s.ry);X.strokeStyle=OL;X.lineWidth=1.45;X.stroke();X.restore()}
 function tail(X,s,f,F,sp,wrap){const t=f.tail||0;X.lineCap='round';
  if(sp=='rabbit'){fluff(X,s.bx-s.rx+.8,s.by-1.4+(f.sit?6:f.lie?2:0),4.8,6,F[2],.3);return}
  if(sp=='fox'){X.save();if(wrap){X.translate(s.bx+3,f.lie?-2.8:-3.6);ell(X,-1,0,12,f.lie?4:4.6);out(X,F[1],1.4);fluff(X,10,-.4,5,5,F[2],.6)}
   else{X.translate(s.bx-s.rx+2,s.by-1);X.rotate(-.55-t*.5);ell(X,-9.5,0,11.5,6);out(X,F[1],1.4);fluff(X,-18.4,0,5.4,5,F[2],0)}X.restore();return}
  let ex,ey;X.beginPath();
  if(wrap){X.moveTo(s.bx-s.rx+2,s.by+s.ry-3);X.bezierCurveTo(s.bx-s.rx-2,-1,s.bx+2,-1.4,s.bx+9,-2.8);ex=s.bx+9;ey=-2.8}
  else if(sp=='cat'){const x0=s.bx-s.rx+1.5;X.moveTo(x0,s.by-1);ex=x0-3+t*3.4;ey=s.by-16-t*3;X.bezierCurveTo(x0-7,s.by-2,x0-8.5,s.by-11-t*4,ex,ey)}
  else{const x0=s.bx-s.rx+1.5;X.moveTo(x0,s.by-2);ex=x0-1+t*2.6;ey=s.by-12-t*2;X.bezierCurveTo(x0-5,s.by-4-t*2,x0-7+t*1.5,s.by-11-t*2.5,ex,ey)}
  const dog=sp=='dog';X.strokeStyle=OL;X.lineWidth=dog?7.4:6.6;X.stroke();X.strokeStyle=F[1];X.lineWidth=dog?5:4.4;X.stroke();
  if(sp=='cat'&&F[4]=='stripe'&&!wrap){X.strokeStyle=F[3];X.lineWidth=4.4;X.setLineDash([1.8,3.2]);X.stroke();X.setLineDash([])}
  ell(X,ex,ey,dog?2:1.4,dog?2:1.4);X.fillStyle=sp=='cat'&&F[4]?F[3]:mix(F[1],'#ffffff',.4);X.fill()}
 function ears(X,s,f,F,sp,front){const e=f.ear||0,dr=Math.max(0,-e),pk=Math.max(0,e),hr=s.hr,tw=f.tw?1:0;
  if(sp=='dog'){if(!front)return;const ec=mix(F[1],F[3],.45);for(const sd of[-1,1]){X.save();X.translate(s.hx+1.2+sd*hr*.94,s.hy-hr*.42);X.rotate(-sd*(.22+dr*.4-pk*.25)+(tw&&sd<0?.55:0));
    ell(X,0,5.4,3.7,7.2);out(X,ec,1.4);ell(X,sd*.3,6.6,2,4.4);X.fillStyle=mix(F[1],F[3],.62);X.fill();X.restore()}return}
  if(front)return;
  if(sp=='rabbit'){for(const sd of[-1,1]){X.save();X.translate(s.hx+1+sd*3.9,s.hy-hr*.7);X.rotate(sd*(.14+dr*1.05-pk*.08)+(f.lie?-1.25:0)+(tw&&sd>0?.4:0));
    ell(X,0,-8.6,3.9,9.6);out(X,F[1],1.4);ell(X,0,-8,1.9,6.8);X.fillStyle='#ffb3c6';X.fill();X.restore()}return}
  const fox=sp=='fox',big=fox?1.25:1.05;for(const sd of[-1,1]){X.save();X.translate(s.hx+1+sd*hr*.5,s.hy-hr*.6);X.rotate(sd*(.22+dr*.55-pk*.08)+(tw&&sd>0?.32:0));X.scale(big,big);
   X.beginPath();X.moveTo(-4.4,2.4);X.quadraticCurveTo(-4.3,-4.2,sd*.6,-8.4);X.quadraticCurveTo(4.3,-4.2,4.4,2.4);X.closePath();X.fillStyle=F[1];X.fill();
   if(fox){X.save();X.clip();X.fillStyle=F[3];X.fillRect(-6,-10,12,5.2);X.restore()}X.strokeStyle=OL;X.lineWidth=1.4;X.stroke();
   X.beginPath();X.moveTo(-2.3,1.4);X.quadraticCurveTo(-2.4,-2.6,sd*.5,-5);X.quadraticCurveTo(2.4,-2.6,2.3,1.4);X.closePath();X.fillStyle=fox?F[2]:'#ffb3c6';X.fill();X.restore()}}
 function head(X,s,f,F,sp){X.save();X.translate(s.hx,s.hy);X.rotate(s.tilt);X.translate(-s.hx,-s.hy);
  const hr=s.hr,hx=s.hx,hy=s.hy,rx=hr*(sp=='rabbit'?1.04:sp=='dog'?1.06:1.1),ry=hr*.93;
  // cheek tufts (cat, fox): drawn first, the head covers their inner half
  if(sp=='cat'||sp=='fox'){const cc=sp=='fox'?F[2]:F[1];for(const sd of[-1,1]){X.beginPath();X.moveTo(hx+sd*rx*.9,hy-.6);X.lineTo(hx+sd*(rx+2.5),hy+3);X.lineTo(hx+sd*rx*.96,hy+4.2);X.lineTo(hx+sd*(rx+1.7),hy+6.6);X.lineTo(hx+sd*rx*.7,hy+7.8);X.closePath();out(X,cc,1.3)}}
  ell(X,hx,hy,rx,ry);X.fillStyle=F[1];X.fill();
  X.save();X.clip();const fx=s.fx,fy=s.fy;X.fillStyle=F[2];
  if(sp=='fox'||F[4]=='mask'){ell(X,fx-6.4,fy+5,6.2,4.8);X.fill();ell(X,fx+6.8,fy+5,6.2,4.8);X.fill();ell(X,fx+.2,fy+6.4,6,4);X.fill()}
  else if(sp=='dog'){ell(X,fx+.5,fy+4.8,5.8,4);X.fill()}
  else{ell(X,fx+.3,fy+4.6,4.6,3.1);X.fill()}
  if(F[4]=='stripe'){X.strokeStyle=F[3];X.lineWidth=1.6;X.lineCap='round';for(const d of[-2.8,0,2.8]){X.beginPath();X.moveTo(hx+1+d,hy-ry+.2);X.lineTo(hx+1+d*.8,hy-ry+3.8);X.stroke()}}
  if(F[4]=='spot'){X.fillStyle=F[3];ell(X,fx+5.4,fy-.6,4,3.8);X.fill()}
  if(F[4]=='patch'){X.fillStyle=F[3];ell(X,fx-6.4,fy-4.6,5.4,4.8);X.fill()}
  X.fillStyle='rgba(255,255,255,.3)';ell(X,hx-rx*.35,hy-ry*.55,rx*.32,ry*.16,-.35);X.fill();   // soft sheen on the forehead
  X.restore();ell(X,hx,hy,rx,ry);X.strokeStyle=OL;X.lineWidth=1.5;X.stroke();face(X,s,f,F,sp);X.restore()}
 function face(X,s,f,F,sp){const fx=s.fx,fy=s.fy,eye=f.eye||'o',ic=F[5]||'#6a4a3a';X.lineCap='round';X.lineJoin='round';
  for(const bx of[fx-7.9,fx+8.5]){X.save();X.translate(bx,fy+3.9);X.scale(1,.6);const gr=X.createRadialGradient(0,0,0,0,0,3.8);gr.addColorStop(0,'rgba(255,100,145,.75)');gr.addColorStop(.55,'rgba(255,110,150,.42)');gr.addColorStop(1,'rgba(255,120,160,0)');
   X.fillStyle=gr;X.beginPath();X.arc(0,0,3.8,0,TAU);X.fill();X.restore()}
  for(const ex of[fx-4.8,fx+5.2]){const ey=fy;X.strokeStyle=OL;X.lineWidth=1.45;
   if(eye=='c'){X.beginPath();X.moveTo(ex-2.4,ey+.3);X.quadraticCurveTo(ex,ey+2.1,ex+2.4,ey+.3);X.stroke()}
   else if(eye=='z'){X.beginPath();X.moveTo(ex-2.4,ey+.8);X.quadraticCurveTo(ex,ey+2.8,ex+2.4,ey+.8);X.stroke();X.lineWidth=1;X.beginPath();X.moveTo(ex+2.3,ey+.9);X.lineTo(ex+3.3,ey+.1);X.stroke()}
   else if(eye=='h'){X.beginPath();X.moveTo(ex-2.4,ey+1.3);X.quadraticCurveTo(ex,ey-2.9,ex+2.4,ey+1.3);X.stroke()}
   else{const sad=eye=='s',rx=2.8,ry=sad?3:3.55;ell(X,ex,ey,rx,ry);X.fillStyle=OL;X.fill();
    X.save();ell(X,ex,ey+.25,rx-.6,ry-.75);X.clip();const gr=X.createLinearGradient(0,ey-ry,0,ey+ry);gr.addColorStop(0,mix(ic,OL,.6));gr.addColorStop(.55,ic);gr.addColorStop(1,mix(ic,'#ffffff',.55));
    X.fillStyle=gr;X.fillRect(ex-rx,ey-ry,rx*2,ry*2);X.fillStyle='rgba(28,14,34,.62)';ell(X,ex,ey-.2,1.3,1.9);X.fill();X.restore();
    X.fillStyle='#fff';ell(X,ex-.95,ey-1.3,1.25,1.35);X.fill();ell(X,ex+1.1,ey+1.4,.62,.62);X.fill();
    if(sad){const sd=ex<fx?1:-1;X.lineWidth=1.2;X.beginPath();X.moveTo(ex-2*sd,ey-3.6);X.lineTo(ex+1.8*sd,ey-4.8);X.stroke()}}}
  if(eye=='s'){X.beginPath();X.moveTo(fx+6.6,fy+2.6);X.quadraticCurveTo(fx+5.5,fy+4.6,fx+6.6,fy+5);X.quadraticCurveTo(fx+7.7,fy+4.6,fx+6.6,fy+2.6);X.fillStyle='#9fdcff';X.fill();X.strokeStyle='#3a7ab8';X.lineWidth=.7;X.stroke()}
  const nx=fx+.3,ny=fy+3.1,my=ny+1;
  if(sp=='dog'){ell(X,nx,ny,1.9,1.3);X.fillStyle=OL;X.fill();X.fillStyle='rgba(255,255,255,.75)';ell(X,nx-.6,ny-.45,.6,.35);X.fill()}
  else{X.beginPath();X.moveTo(nx-1.3,ny-.6);X.quadraticCurveTo(nx,ny-1.1,nx+1.3,ny-.6);X.quadraticCurveTo(nx+.3,ny+1,nx,ny+1);X.quadraticCurveTo(nx-.3,ny+1,nx-1.3,ny-.6);X.fillStyle=sp=='fox'?OL:'#ff86a6';X.fill()}
  const mo=f.mo||'w';X.strokeStyle=OL;X.lineWidth=1.1;
  if(mo=='o'||mo=='e'){const w=mo=='e'?1.1:1.6,h=mo=='e'?1:1.7;X.beginPath();X.moveTo(nx-w,my+.5);X.quadraticCurveTo(nx,my+.1,nx+w,my+.5);X.quadraticCurveTo(nx+w,my+h*1.5,nx,my+h*1.6);X.quadraticCurveTo(nx-w,my+h*1.5,nx-w,my+.5);X.closePath();
   X.fillStyle='#8a2a3a';X.fill();X.stroke();X.fillStyle='#ff8fa8';ell(X,nx,my+h*1.15,w*.62,h*.42);X.fill();if(sp=='dog'&&mo=='o'){ell(X,nx+.3,my+h*1.9,1.3,1.7);X.fillStyle='#ff7f9e';X.fill();X.lineWidth=.8;X.stroke()}}
  else if(mo=='f'){X.beginPath();X.moveTo(nx-1.6,my+2.2);X.quadraticCurveTo(nx,my+.9,nx+1.6,my+2.2);X.stroke()}
  else{if(sp=='dog'){ell(X,nx+.5,my+2,1,1.25);X.fillStyle='#ff7f9e';X.fill();X.lineWidth=.8;X.stroke();X.lineWidth=1.1}   // a little tongue blep
   X.beginPath();X.moveTo(nx,my-.5);X.lineTo(nx,my+.3);X.moveTo(nx-2,my+.2);X.quadraticCurveTo(nx-1,my+1.9,nx,my+.3);X.quadraticCurveTo(nx+1,my+1.9,nx+2,my+.2);X.stroke();
   if(sp=='rabbit'){X.fillStyle='#fff';X.beginPath();X.roundRect(nx-.9,my+1,1.8,1.5,.4);X.fill();X.lineWidth=.7;X.stroke()}}
  if(mo=='b'){ell(X,nx+2.4,my+2.4,3.4,3.4);out(X,'#ff5a6a',1.2);X.strokeStyle='#fff';X.lineWidth=1;X.beginPath();X.arc(nx+2.4,my+2.4,2.1,-2.2,-.6);X.stroke()}
  if(sp=='cat'){X.strokeStyle='rgba(43,29,51,.4)';X.lineWidth=.75;for(const sd of[-1,1])for(const dy of[-.6,1]){const x0=fx+(sd<0?-7.6:8);X.beginPath();X.moveTo(x0,fy+3.8+dy*.5);X.lineTo(x0+sd*3.8,fy+3.3+dy*1.5);X.stroke()}}}
 // ---- clothes (drawn at the pose's anchors so they follow sitting, sleeping, stretching; neck items sit just under the big chibi head)
 const CLD={
  bow(X,s,c,f,sp){const x=sp=='rabbit'?s.hx:s.hx+5.4,y=s.hy-s.hr*(sp=='rabbit'?.86:.72);X.save();X.translate(x,y);X.rotate(sp=='rabbit'?0:.35);
   for(const sd of[-1,1]){X.beginPath();X.moveTo(0,0);X.bezierCurveTo(sd*3,-4.4,sd*7,-3.6,sd*6.4,0);X.bezierCurveTo(sd*7,3.6,sd*3,4.2,0,0);X.closePath();out(X,c,1.2)}
   X.fillStyle=mix(c,'#ffffff',.5);ell(X,-3.6,-1.2,1.3,.8);X.fill();ell(X,3.6,-1.2,1.3,.8);X.fill();ell(X,0,0,1.8,2);out(X,mix(c,'#000000',.15),1.1);X.restore()},
  hat(X,s,c,f,sp){X.save();X.translate(s.hx+.6,s.hy-s.hr*.8);X.rotate(-.12+s.tilt);ell(X,0,0,7.6,1.9);out(X,c,1.2);X.beginPath();X.roundRect(-4.6,-9.6,9.2,9.8,1.4);out(X,c,1.2);
   X.fillStyle=mix(c,'#ffffff',.55);X.fillRect(-4.6,-2.9,9.2,2);X.fillStyle='rgba(255,255,255,.35)';X.fillRect(-3.4,-8.6,1.4,5);X.restore()},
  crown(X,s,c,f,sp){const L=sp=='rabbit'?[-2.6,-2.1,-1.55,-1,-.5]:[-2.75,-2.25,-1.6,-.95,-.42];X.save();X.translate(s.hx,s.hy);X.rotate(s.tilt);
   for(let i=0;i<L.length;i++){const a=L[i],x=Math.cos(a)*s.hr*1.02,y=Math.sin(a)*s.hr*.86;X.fillStyle='#5fbf5a';ell(X,x+2.2,y+.6,2,1,.6);X.fill();const col=i%2?mix(c,'#ffffff',.55):c;
    for(let k=0;k<5;k++){const b=k*TAU/5;ell(X,x+Math.cos(b)*1.6,y+Math.sin(b)*1.6,1.35,1.35);X.fillStyle=col;X.fill()}X.fillStyle='#ffd34a';ell(X,x,y,1,1);X.fill()}X.restore()},
  bandana(X,s,c,f){const y=s.hy+s.hr*.84;X.beginPath();X.moveTo(s.hx-6.4,y-1.4);X.quadraticCurveTo(s.hx,y+2.6,s.hx+7.2,y-1.6);X.lineTo(s.hx+5,y+1.4);X.lineTo(s.hx+1,y+8);X.lineTo(s.hx-4.4,y+1.2);X.closePath();out(X,c,1.2);
   X.fillStyle='rgba(255,255,255,.85)';for(const[a,b]of[[-1.6,1.6],[2.6,1.4],[.6,4.8]]){ell(X,s.hx+a,y+b,.8,.8);X.fill()}},
  scarf(X,s,c,f){const y=s.hy+s.hr*.86;X.save();X.translate(s.hx-4.6,y+1);X.rotate(.35+(f.lg!=null&&f.lg>=0?Math.sin(f.lg*1.57)*.12:0));X.beginPath();X.roundRect(-2.4,0,4.8,8.4,1.4);out(X,c,1.2);X.fillStyle=mix(c,'#ffffff',.5);X.fillRect(-2.4,3,4.8,1.4);X.fillRect(-2.4,6,4.8,1.2);X.restore();
   X.beginPath();X.moveTo(s.hx-7.6,y-1.4);X.quadraticCurveTo(s.hx,y+4.2,s.hx+7.8,y-1.4);X.lineTo(s.hx+7.2,y+1.6);X.quadraticCurveTo(s.hx,y+7,s.hx-7.4,y+1.8);X.closePath();out(X,c,1.2);
   X.strokeStyle=mix(c,'#ffffff',.5);X.lineWidth=1;for(const d of[-3.5,0,3.5]){X.beginPath();X.moveTo(s.hx+d,y+.4+Math.abs(d)*-.1);X.lineTo(s.hx+d+.4,y+3.6);X.stroke()}},
  collar(X,s,c,f){const y=s.hy+s.hr*.88;X.beginPath();X.moveTo(s.hx-6.6,y-1.2);X.quadraticCurveTo(s.hx,y+3.2,s.hx+7.4,y-1.2);X.strokeStyle=OL;X.lineWidth=3.6;X.lineCap='round';X.stroke();X.strokeStyle=c;X.lineWidth=2.2;X.stroke();
   ell(X,s.hx+1.4,y+3.4,2.3,2.3);out(X,'#ffd34a',1.1);X.fillStyle=OL;X.fillRect(s.hx+.6,y+4.4,1.6,.7);X.fillStyle='#fff7c0';ell(X,s.hx+.7,y+2.6,.7,.6);X.fill()},
  sweater(X,s,c,f){X.save();X.translate(s.bx,s.by);if(s.rot)X.rotate(s.rot);ell(X,0,0,s.rx+.3,s.ry+.3);X.save();X.clip();X.fillStyle=c;X.fillRect(-s.rx*.5,-s.ry-2,s.rx*2+2,s.ry*2+4);
   X.strokeStyle=mix(c,'#000000',.18);X.lineWidth=1;for(let x=-s.rx*.5+3;x<s.rx;x+=3){X.beginPath();X.moveTo(x,-s.ry);X.lineTo(x,s.ry);X.stroke()}
   X.fillStyle=mix(c,'#ffffff',.55);X.fillRect(-s.rx*.5-.4,-s.ry-2,2.4,s.ry*2+4);X.fillStyle='rgba(255,255,255,.9)';ell(X,s.rx*.2,-s.ry*.25,1.6,1.6);X.fill();X.restore();ell(X,0,0,s.rx+.3,s.ry+.3);X.strokeStyle=OL;X.lineWidth=1.5;X.stroke();X.restore()},
  // cape: draped over the back (drawn on top of the body), its hem flutters with the walk cycle and streams out in a jump
  cape(X,s,c,f){const nx=s.hx-4,ny=s.hy+s.hr*.72,fl=f.lg!=null&&f.lg>=0?Math.sin(f.lg*1.57)*1.6:f.lg==-1?3:0,sit=f.sit?1:0,tx=s.bx-s.rx-3-fl-sit*2,ty=s.by+(sit?s.ry*.8:s.ry*.15)-fl*.6;
   X.beginPath();X.moveTo(nx+3,ny);X.quadraticCurveTo(s.bx+2,s.by-s.ry-4.5,tx,ty-1);X.lineTo(tx+3,ty+3.4);X.quadraticCurveTo(tx+6,ty+1,s.bx-2,s.by-s.ry*.15);X.quadraticCurveTo(nx-2,ny+5,nx-2,ny+3);X.closePath();out(X,c,1.3);
   X.strokeStyle=mix(c,'#ffffff',.4);X.lineWidth=1;X.beginPath();X.moveTo(nx+1,ny+1);X.quadraticCurveTo(s.bx,s.by-s.ry-2.4,tx+2,ty);X.stroke();X.fillStyle=mix(c,'#000000',.25);X.beginPath();X.moveTo(tx,ty-1);X.lineTo(tx+3,ty+3.4);X.lineTo(tx+3.6,ty+1.2);X.closePath();X.fill()},
  clasp(X,s){ell(X,s.hx-1.8,s.hy+s.hr*.9,1.7,1.7);out(X,'#ffd34a',1)},
  wings(X,s,c,f){const x=s.bx+2,y=s.by-s.ry*.95,fl=f.lg==-1?.35:f.lie?-.45:f.lg!=null?Math.sin(f.lg*1.57)*.08:0,a=mix(c,'#ffffff',.35),dk=mix(c,'#000000',.25);
   for(const k of[1,0]){X.save();X.translate(x+(k?3:0),y);X.rotate(.15+fl+(k?.32:0));X.scale(1.45,1.45);X.globalAlpha=k?.7:.95;
    X.beginPath();X.moveTo(0,0);X.bezierCurveTo(-4,-14,-16,-15,-14,-5);X.bezierCurveTo(-13,-1,-6,1,0,0);X.closePath();X.fillStyle=a;X.fill();X.strokeStyle=dk;X.lineWidth=1.2;X.stroke();
    X.beginPath();X.moveTo(0,0);X.bezierCurveTo(-8,1,-12,6,-8,9);X.bezierCurveTo(-4,10,-1,5,0,0);X.closePath();X.fillStyle=c;X.fill();X.stroke();
    X.fillStyle='rgba(255,255,255,.85)';ell(X,-9,-8,1.6,1.1,-.5);X.fill();ell(X,-6,5,1,1);X.fill();X.restore()}X.globalAlpha=1}};
 function drawPet(X,sp,fur,fr,mood,clo){const base=FR[fr]||FR.idle0,f=Object.assign({},base);
  if(mood=='sad'&&!f.lie&&f.mo!='e'){if(!f.eye||f.eye=='o')f.eye='s';f.ear=(f.ear||0)-1;f.tail=(f.tail||0)-.7;if(!f.mo)f.mo='f'}if(mood=='ball')f.mo='b';
  const s=geo(sp,f),F=SP[sp].fur[fur]||SP[sp].fur[0],it=sl=>clo&&clo[sl]?clo[sl]:null,wrap=(f.sit||f.lie)&&(sp=='cat'||sp=='fox')||f.lie&&sp=='dog';X.lineJoin='round';
  const bk=it('back');if(bk&&bk[0]=='wings')CLD.wings(X,s,bk[1],f);
  if(!wrap)tail(X,s,f,F,sp,false);legs(X,s,f,F,false);body(X,s,F,f);const bd=it('body');if(bd)CLD.sweater(X,s,bd[1],f);if(bk&&bk[0]=='cape')CLD.cape(X,s,bk[1],f);legs(X,s,f,F,true);
  if(wrap&&!f.lie)tail(X,s,f,F,sp,true);ears(X,s,f,F,sp,false);head(X,s,f,F,sp);ears(X,s,f,F,sp,true);
  // curled up asleep: the paws tuck under the chin and the tail wraps round like a blanket
  if(f.lie){for(const d of[-4.2,2.8]){ell(X,s.hx+d,-1.7,2.8,1.8);out(X,F[2],1.1)}if(wrap)tail(X,s,f,F,sp,true)}
  const nk=it('neck');if(nk&&CLD[nk[0]])CLD[nk[0]](X,s,nk[1],f,sp);if(bk&&bk[0]=='cape')CLD.clasp(X,s);
  const hd=it('head');if(hd&&CLD[hd[0]])CLD[hd[0]](X,s,hd[1],f,sp);return s}
 // sprite: 76 x 64 logical units drawn at 2x, origin (38, 60) = between the feet
 const SW=76,SH=64,OX=38,OY=60,SS=2,CACHE=new Map();
 const cloSig=clo=>SLOTS.map(s=>clo&&clo[s]?clo[s][0]+clo[s][1]:'').join(',');
 function sprite(sp,fur,fr,mood,clo){const k=sp+fur+fr+'|'+(mood||'')+'|'+cloSig(clo);let c=CACHE.get(k);if(c)return c;if(CACHE.size>500)CACHE.clear();
  c=document.createElement('canvas');c.width=SW*SS;c.height=SH*SS;const X=c.getContext('2d');X.scale(SS,SS);X.translate(OX,OY);try{drawPet(X,sp,fur,fr,mood,clo)}catch(e){console.error('PET10 sprite',e)}CACHE.set(k,c);return c}
 // small sprites: shadow, heart, z, note, crumb, sparkle, ball, hungry bowl, E prompt
 const SM={};const sm=(k,w,h,fn)=>{if(SM[k])return SM[k];const c=document.createElement('canvas');c.width=w;c.height=h;const X=c.getContext('2d');fn(X,w,h);return SM[k]=c};
 const shadowS=()=>sm('sh',40,12,X=>{X.fillStyle='rgba(20,10,30,.22)';ell(X,20,6,19,5);X.fill()});
 const heartS=()=>sm('he',24,22,X=>{X.translate(12,12);X.beginPath();X.moveTo(0,8);X.bezierCurveTo(-11,0,-6,-9,0,-3.5);X.bezierCurveTo(6,-9,11,0,0,8);X.closePath();X.fillStyle='#ff6f9c';X.fill();X.strokeStyle='#b8305a';X.lineWidth=1.4;X.stroke();X.fillStyle='rgba(255,255,255,.8)';ell(X,-4,-3,2,1.2,-.6);X.fill()});
 const txtS=(k,t,col,sz)=>sm(k,sz*1.4|0,sz*1.4|0,(X,w,h)=>{X.font='900 '+sz+'px system-ui,sans-serif';X.textAlign='center';X.textBaseline='middle';X.lineWidth=3;X.strokeStyle='rgba(255,255,255,.9)';X.strokeText(t,w/2,h/2);X.fillStyle=col;X.fillText(t,w/2,h/2)});
 const sparkS=()=>sm('sp',16,16,X=>{X.translate(8,8);X.fillStyle='#fff6b0';X.beginPath();for(let i=0;i<8;i++){const r=i%2?1.6:7,a=i*Math.PI/4;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.closePath();X.fill()});
 const ballS=()=>sm('ba',20,20,X=>{ell(X,10,10,7.5,7.5);out(X,'#ff5a6a',1.6);X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();X.arc(10,10,4.6,-2.4,-.4);X.stroke();X.fillStyle='rgba(255,255,255,.7)';ell(X,7.4,7,1.6,1.1,-.6);X.fill()});
 const bowlS=()=>sm('bo',30,22,X=>{X.fillStyle='rgba(255,255,255,.92)';X.beginPath();X.roundRect(1,1,28,20,8);X.fill();X.strokeStyle='rgba(43,29,51,.35)';X.lineWidth=1;X.stroke();X.translate(15,13);
  X.fillStyle='#b5713c';for(const[a,b]of[[-4,-3],[0,-4],[4,-3],[-2,-1],[2,-1]]){ell(X,a,b,2.2,1.6);X.fill()}X.beginPath();X.moveTo(-9,-2);X.lineTo(9,-2);X.lineTo(6,4);X.lineTo(-6,4);X.closePath();out(X,'#5ab0ff',1.2)});
 const labelC={};function label(t){if(labelC[t])return labelC[t];const c=document.createElement('canvas'),X=c.getContext('2d'),f='700 12px system-ui,sans-serif';X.font=f;const w=Math.ceil(X.measureText(t).width)+18;c.width=w*2;c.height=40;X.scale(2,2);X.font=f;
  X.fillStyle='rgba(20,18,30,.78)';X.beginPath();X.roundRect(0,0,w,20,10);X.fill();X.fillStyle='#fff';X.textAlign='center';X.textBaseline='middle';X.fillText(t,w/2,10.5);if(Object.keys(labelC).length>60)for(const k in labelC)delete labelC[k];return labelC[t]=c}
 // ---- the Pet Home: a little pink-roofed house with a heart, a cushion inside and a food bowl (cached; logical origin = bottom centre)
 function homeArt(X){X.lineJoin='round';X.beginPath();X.roundRect(-30,-7,60,7,3);out(X,'#c98a5a',1.6);X.fillStyle='#e0a878';X.fillRect(-28,-6,56,2);
  X.beginPath();X.rect(-21,-37,42,30);out(X,'#fff1e0',1.6);X.strokeStyle='rgba(180,130,100,.35)';X.lineWidth=1;for(let y=-31;y<-8;y+=6){X.beginPath();X.moveTo(-20,y);X.lineTo(20,y);X.stroke()}
  X.beginPath();X.moveTo(-10,-7);X.lineTo(-10,-20);X.arc(0,-20,10,Math.PI,0);X.lineTo(10,-7);X.closePath();out(X,'#5a3a52',1.5);X.fillStyle='#ff9cbc';X.beginPath();X.ellipse(0,-9,9,3.2,0,0,TAU);X.fill();X.fillStyle='#ffc9da';X.beginPath();X.ellipse(-2,-10,5,1.4,0,0,TAU);X.fill();
  X.beginPath();X.moveTo(-28,-34);X.lineTo(0,-58);X.lineTo(28,-34);X.lineTo(24,-31);X.lineTo(0,-51);X.lineTo(-24,-31);X.closePath();out(X,'#ff7fa8',1.6);X.fillStyle='#ffb3c9';X.beginPath();X.moveTo(-24,-34.5);X.lineTo(0,-55);X.lineTo(2,-53);X.lineTo(-22,-33);X.closePath();X.fill();
  X.save();X.translate(0,-40);X.beginPath();X.moveTo(0,4.5);X.bezierCurveTo(-7,0,-4,-6,0,-2.2);X.bezierCurveTo(4,-6,7,0,0,4.5);X.closePath();out(X,'#ff4f7e',1.2);X.restore();
  X.save();X.translate(21,-7);X.fillStyle='#b5713c';for(const[a,b]of[[-3,-5],[0,-5.8],[3,-5]]){X.beginPath();X.ellipse(a,b,2,1.4,0,0,TAU);X.fill()}X.beginPath();X.moveTo(-7,-4.5);X.lineTo(7,-4.5);X.lineTo(5,0);X.lineTo(-5,0);X.closePath();out(X,'#5ab0ff',1.2);X.restore()}
 const homeS=()=>sm('home',72*SS,68*SS,X=>{X.scale(SS,SS);X.translate(36,64);homeArt(X)});
 function foodArt(X,treat){if(treat){X.save();X.rotate(-.2);X.beginPath();X.moveTo(-9,0);X.bezierCurveTo(-6,-7,6,-7,8,0);X.bezierCurveTo(6,7,-6,7,-9,0);X.closePath();out(X,'#ffb06a',1.5);X.beginPath();X.moveTo(8,0);X.lineTo(14,-5);X.lineTo(14,5);X.closePath();out(X,'#ffb06a',1.5);
   X.fillStyle='#ff6f9c';for(const a of[-4,0,4]){X.beginPath();X.arc(a,-1,1.2,0,TAU);X.fill()}X.fillStyle=OL;X.beginPath();X.arc(-5,-1.5,1,0,TAU);X.fill();X.restore();return}
  X.fillStyle='#b5713c';for(const[a,b]of[[-6,-7],[-2,-8.6],[2,-8.6],[6,-7],[-4,-5],[0,-5.4],[4,-5]]){ell(X,a,b,2.6,1.9);out(X,'#c98a4a',.9)}X.beginPath();X.moveTo(-12,-4);X.lineTo(12,-4);X.lineTo(9,4);X.lineTo(-9,4);X.closePath();out(X,'#5ab0ff',1.5);X.fillStyle='#ffffff';X.fillRect(-4,-2,8,2.4)}
 {const _iu=iconURL;iconURL=function(k){if((k!==FOOD&&k!==TREAT&&k!==HOME)||ICON[k])return _iu.apply(this,arguments);const S2=48,c=document.createElement('canvas');c.width=c.height=S2;const X=c.getContext('2d');try{burstBG(X,S2)}catch(_){}
  X.save();if(k==HOME){X.translate(24,44);X.scale(.6,.6);homeArt(X)}else{X.translate(24,k==TREAT?24:30);X.scale(1.45,1.45);foodArt(X,k==TREAT)}X.restore();try{ICONC[k]=c}catch(_){}return ICON[k]=c.toDataURL()}}
 // ==== world: runtime pets, physics, behaviour ============================================================================
 const RT=new Map(),PT=[],MAXP=40;let ball=null;
 const solid=(tx,ty)=>solidAt(tx,ty),wet=(tx,ty)=>tx>=0&&ty>=0&&tx<W&&ty<H&&wl[ty*W+tx]>0;
 function rt(p){const h=homeById(p.home);if(!h||h.w!==cur)return null;let r=RT.get(p.id);if(r&&r.home===p.home&&r.w===cur)return r;
  r={x:(h.h.x+.5)*T+(R()-.5)*T*.6,y:(h.h.y+1)*T,vx:0,vy:0,g:0,dir:R()<.5?-1:1,st:'idle',t:0,tm:1+R()*2,at:R()*9,dist:0,rot:0,fr:'idle0',w:cur,home:p.home,snd:0,nt:0,ph:R()*9,wig:0,wigN:2,cl:0,land:0};RT.set(p.id,r);return r}
 const homePos=p=>{const h=homeById(p.home);return h?{x:(h.h.x+.5)*T,y:(h.h.y+1)*T,h:h.h}:null};
 function puff(k,x,y,n){for(let i=0;i<(n||1)&&PT.length<MAXP;i++)PT.push({k,x:x+(R()-.5)*10,y,vx:(R()-.5)*30,vy:k=='z'?-18:k=='crumb'?-60-R()*40:-40-R()*20,t:0,life:k=='z'?1.8:k=='crumb'?.6:1.2,ph:R()*6})}
 function voice(sp,kind,x,y){if(typeof SFX7=='undefined')return;const d=Math.hypot(x-P.x,y-P.y);if(d>T*14)return;const a=Math.max(.3,1-d/(T*14)),v=.045*a,t=SFX7.tone,j=.94+R()*.12;
  if(kind=='eat'){for(let i=0;i<3;i++)t(1500*j,1100,.035,'triangle',v*.5,i*.13);return}
  if(kind=='purr'){t(150,140,.5,'triangle',v*.8,0,1);t(160,150,.45,'triangle',v*.7,.45,1);return}
  if(kind=='yay'){t(660*j,990*j,.1,'sine',v*.8);t(880*j,1320*j,.12,'sine',v*.7,.09);return}
  const sad=kind=='sad';
  if(sp=='cat'){if(sad)t(700*j,420*j,.45,'sine',v,0,1);else{t(560*j,900*j,.12,'triangle',v*.8);t(900*j,600*j,.24,'sine',v,.1,1)}}
  else if(sp=='dog'){if(sad)t(900*j,620*j,.35,'sine',v*.8,0,1);else{t(430*j,250*j,.08,'triangle',v*1.1);t(460*j,270*j,.09,'triangle',v,.17)}}
  else if(sp=='rabbit'){t(1500*j,2100*j,.06,'sine',v*.6);t(1700*j,2300*j,.06,'sine',v*.6,.1);if(sad)t(1300*j,900*j,.2,'sine',v*.5,.22)}
  else{if(sad)t(1000*j,600*j,.4,'sine',v*.8,0,1);else{t(880*j,1350*j,.07,'triangle',v*.8);t(1350*j,820*j,.13,'sine',v*.8,.07)}}}
 const DUR={idle:[2,2],walk:[2,3],sit:[3,4],talk:[1.3,0],sleep:[8,8],hop:[.9,0],stretch:[1.7,0],spin:[1.8,0],flip:[1.2,0],eat:[2.6,0],happy:[1.6,0],follow:[4,3],fetch:[15,0],ret:[15,0]};
 function setSt(p,r,st){r.st=st;r.t=0;const d=DUR[st]||[2,0];r.tm=d[0]+R()*d[1];r.rot=0;const hp=homePos(p);
  if(st=='walk'){r.dir=hp&&Math.abs(r.x-hp.x)>RANGE*T*.5?Math.sign(hp.x-r.x):R()<.5?-1:1}
  else if(st=='hop'&&r.g){r.vy=-330;r.g=0;r.vx=0}
  else if(st=='flip'&&r.g){r.vy=-460;r.g=0;r.vx=0;voice(p.sp,'yay',r.x,r.y)}
  else if(st=='talk'){voice(p.sp,hungry(p)?'sad':'talk',r.x,r.y);puff('note',r.x+r.dir*10,r.y-38)}
  else if(st=='happy'){if(r.g){r.vy=-220;r.g=0;r.vx=0}puff('heart',r.x,r.y-36,3)}
  else if(st=='eat')voice(p.sp,'eat',r.x,r.y)}
 function think(p,r){const hun=hungry(p),hp=happy(p),near=Math.abs(P.x-r.x)<T*4&&Math.abs(P.y+P.h-r.y)<T*3;
  const w=hun?[['walk',1.5],['sit',4],['sleep',2],['talk',2]]:[['walk',4],['idle',2],['sit',1.5],['hop',1],['stretch',.6],['spin',.6],['talk',.9],['sleep',.5]];
  if(!hun&&near&&hp>=60)w.push(['follow',2.2],['flip',.7],['spin',.5]);let tot=0;for(const e of w)tot+=e[1];let q=R()*tot,st='idle';for(const e of w){q-=e[1];if(q<=0){st=e[0];break}}setSt(p,r,st)}
 const HW=9;
 function phys(r,dt){r.vy=Math.min(900,r.vy+1500*dt);r.wet=wet(Math.floor(r.x/T),Math.floor((r.y-8)/T));if(r.wet)r.vy=Math.max(-150,r.vy-3000*dt); // fell in water: it floats up and paddles
  if(r.vx){const nx=r.x+r.vx*dt,fx=Math.floor((nx+Math.sign(r.vx)*HW)/T),fy=Math.floor((r.y-6)/T);
   if(solid(fx,fy)){if(r.g||r.wet){if(!solid(fx,fy-1)&&!solid(Math.floor(r.x/T),fy-1)){r.vy=-440;r.g=0}else{r.vx=0;r.blocked=1}}}else{r.dist+=Math.abs(nx-r.x);r.x=nx}}
  const ny=r.y+r.vy*dt;if(r.vy<0&&solid(Math.floor(r.x/T),Math.floor((ny-26)/T))){r.vy=0}else r.y=ny;
  const ty=Math.floor(r.y/T);if(r.vy>=0&&(solid(Math.floor((r.x-HW)/T),ty)||solid(Math.floor((r.x+HW)/T),ty))){r.y=ty*T;r.vy=0;r.g=1}else r.g=0;
  // stuck inside a block (one was placed on it): pop up; lost (fell far / out of the world): back home
  for(let i=0;i<3&&solid(Math.floor(r.x/T),Math.floor((r.y-4)/T));i++){r.y=Math.floor((r.y-4)/T)*T;r.vy=0}}
 const busy=st=>st=='eat'||st=='fetch'||st=='ret';
 function upd(p,r,dt,hp){r.t+=dt;r.at+=dt;r.blocked=0;const hun=hungry(p),spd=SP[p.sp].spd*(hun?.6:1),rng=RANGE*T;let want=0;
  // stranded (fell somewhere it cannot walk back from, no pathfinding): after a few seconds it pops back home in a puff of sparkles
  r.lost=r.wet||r.y>hp.y+T*2.5||r.y<hp.y-T*5||Math.abs(r.x-hp.x)>T*(RANGE+10)?(r.lost||0)+dt:0;
  if(r.lost>4||Math.abs(r.x-hp.x)>T*24||r.y>hp.y+T*14||r.y>H*T){r.x=hp.x;r.y=hp.y;r.vx=r.vy=0;r.lost=0;puff('spark',r.x,r.y-20,4);setSt(p,r,'idle')}
  const st=r.st;
  // happy wiggle when you walk up to it (once per approach, as soon as it can: not while hungry, asleep, busy or in the air; it keeps its state and timers)
  const cl=Math.abs(P.x-r.x)<T*2.2&&Math.abs(P.y+P.h-r.y)<T*2;if(!cl)r.cl=0;else if(!r.cl&&!hun&&r.g&&r.at>r.wigN&&(st=='idle'||st=='sit'||st=='walk')){r.cl=1;r.wig=1.2;r.wigN=r.at+9;r.dir=P.x<r.x?-1:1;puff('heart',r.x+r.dir*6,r.y-34,1)}
  if(r.wig>0)r.wig=Math.max(0,r.wig-dt);
  if(st=='walk'){if((r.x-hp.x)*r.dir>rng)r.dir=-r.dir;want=r.wig>0?0:r.dir*spd}
  else if(st=='follow'){const dx=P.x-r.x;if(Math.abs(dx)>T*1.1&&Math.abs(P.y+P.h-r.y)<T*4){r.dir=Math.sign(dx);want=r.dir*spd*1.35;if((r.x-hp.x)*r.dir>rng+T*3)want=0}}
  else if(st=='spin'){if((r.t*5|0)!=(r.t*5-dt*5|0))r.dir=-r.dir;want=r.dir*20}
  else if(st=='fetch'){if(!ball||ball.pet!==p.id){setSt(p,r,'idle')}else{const dx=ball.x-r.x;r.dir=dx<0?-1:1;if(Math.abs(dx)>8&&(r.x-hp.x)*r.dir<rng+T*8)want=r.dir*spd*1.6;
    if(Math.abs(dx)<12&&Math.abs(ball.y-(r.y-4))<T*.7||r.t>6){ball.st='held';setSt(p,r,'ret');r.tm=15}}} // out of reach for 6 s: it bounces back to the pet
  else if(st=='ret'){const pn=Math.abs(P.x-r.x)<T*12&&Math.abs(P.y+P.h-r.y)<T*6,tx=pn?P.x:hp.x,dx=tx-r.x;r.dir=dx<0?-1:1;if(Math.abs(dx)>T*.9&&r.t<8)want=r.dir*spd*1.4;else{ball=null;p.n.plays++;addHap(p,15);setSt(p,r,'happy');voice(p.sp,'talk',r.x,r.y);try{say(p.nm+' brought the ball back! ♥')}catch(_){}}}
  if(busy(st)&&r.t>r.tm){if(ball&&ball.pet===p.id)ball=null;setSt(p,r,'idle')}
  // ledges and water: walking never steps down more than one block or into water (rabbits look further ahead: they hop)
  if(want&&r.g){const fx=Math.floor((r.x+Math.sign(want)*(HW+(p.sp=='rabbit'?24:4)))/T),gy=Math.floor(r.y/T);if(wet(fx,gy-1)||wet(fx,gy)||!solid(fx,gy)&&!solid(fx,gy+1)&&!solid(fx,gy-1)){if(st=='walk')r.dir=-r.dir;want=0}}
  if(p.sp=='rabbit'&&want){if(r.g){r.vy=-230;r.g=0;r.vx=want*1.2}}else r.vx+=(want-r.vx)*Math.min(1,dt*10);
  if(!want&&r.g)r.vx*=Math.max(0,1-dt*12);
  const wasG=r.g,vy0=r.vy;phys(r,dt);if(r.blocked&&st=='walk')r.dir=-r.dir;
  r.land=Math.max(0,r.land-dt);if(r.g&&!wasG&&vy0>160)r.land=.2;   // squash on landing (applied when drawn)
  if(st=='flip'&&!r.g)r.rot=Math.min(1,r.t/.62)*TAU;else r.rot=0;
  if(st=='sleep'&&r.at-r.nt>1.1){r.nt=r.at;puff('z',r.x+r.dir*8,r.y-26)}
  if(st=='eat'&&r.at-r.nt>.3){r.nt=r.at;puff('crumb',r.x+r.dir*12,r.y-4,2)}
  if(r.t>=r.tm&&!busy(st))think(p,r);
  // frame
  const bt=(r.at+r.ph)%4.1,blink=bt<.13||bt>.3&&bt<.42&&r.ph>4.5,tw=(r.at+r.ph*1.7)%5.3>5.1,ph=r.at;let fr='idle0';
  if(!r.g&&st!='sleep')fr='jump';
  else if(st=='walk'||st=='follow'&&want||st=='spin'||st=='fetch'&&want||st=='ret'&&want)fr=p.sp=='rabbit'?'idle0':'walk'+((r.dist/7|0)%4);
  else if(st=='sit'||st=='follow'&&!want&&r.t>1.5)fr=blink?'sitb':tw?'sitt':'sit';else if(st=='talk')fr=r.t<.9?'talk':'sit';
  else if(st=='sleep')fr=(ph%2.4)<1.2?'sleep0':'sleep1';else if(st=='eat')fr=(ph%.5)<.25?'eat0':'eat1';else if(st=='happy')fr='happy';else if(st=='stretch')fr=r.t>.25&&r.t<1.4?'stretch':'idle0';
  else fr=blink?'blink':tw?'twitch':(ph%1.4)<.7?'idle0':'idle1';
  if(r.wig>0&&r.g&&(st=='idle'||st=='sit'||st=='walk'))fr=(r.wig*8|0)%2?'wig0':'wig1';
  r.fr=fr;r.mood=st=='ret'||(ball&&ball.st=='held'&&ball.pet===p.id)?'ball':hun&&st!='eat'&&st!='happy'?'sad':''}
 function ballTick(dt){if(!ball)return;if(ball.w!==cur){ball=null;return}ball.t+=dt;if(ball.st=='held'){const p=S.pets.find(q=>q.id==ball.pet),r=p&&RT.get(p.id);if(!r||r.st!='ret'){ball=null;return}ball.x=r.x+r.dir*12;ball.y=r.y-8;return}
  ball.vy=Math.min(900,ball.vy+1500*dt);const nx=ball.x+ball.vx*dt;if(solid(Math.floor((nx+Math.sign(ball.vx)*4)/T),Math.floor((ball.y-4)/T)))ball.vx*=-.5;else ball.x=nx;
  const ny=ball.y+ball.vy*dt,ty=Math.floor(ny/T);if(ball.vy>0&&solid(Math.floor(ball.x/T),ty)){ball.y=ty*T;ball.vy=Math.abs(ball.vy)>90?-ball.vy*.45:0;ball.vx*=.8}else if(ball.vy<0&&solid(Math.floor(ball.x/T),Math.floor((ny-8)/T)))ball.vy=0;else ball.y=ny;
  if(ball.vy==0)ball.vx*=Math.max(0,1-dt*3);if(ball.t>20)ball=null}
 function tick(dt){if(!entered||dt>.25)return;S.clk+=dt;const vw=cv.width/ZM,vh=cv.height/ZM,cx=cam.x+vw/2,cy=cam.y+vh/2;
  for(const p of S.pets){const r=rt(p);if(!r)continue;const hp=homePos(p);if(Math.abs(r.x-cx)>vw/2+T*8||Math.abs(r.y-cy)>vh/2+T*8){r.t+=dt;r.at+=dt;r.far=1;continue}r.far=0;upd(p,r,dt,hp)}
  ballTick(dt);for(let i=PT.length-1;i>=0;i--){const q=PT[i];q.t+=dt;if(q.t>=q.life){PT.splice(i,1);continue}if(q.k=='crumb')q.vy+=300*dt;else q.vx+=Math.sin(q.t*4+q.ph)*20*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}
  if(UI.on)uiTick(dt);
  // a meal reminder once per pet when it gets hungry
  for(const p of S.pets)if(hungry(p)&&p._nf!==p.fed){p._nf=p.fed;try{say(p.nm+' is hungry! Feed them at their Pet Home (Pet Food)')}catch(_){}}}
 function nearest(){let best=null,bd=1e9;const fy=P.y+P.h;for(const p of S.pets){const r=rt(p);if(!r||r.far)continue;const dx=Math.abs(r.x-P.x),dy=Math.abs(r.y-fy);if(dx<T*1.5&&dy<T*1.6&&dx<bd){bd=dx;best={pet:p}}}
  if(best)return best;for(const h of homesHere()){const dx=Math.abs((h.x+.5)*T-P.x),dy=Math.abs((h.y+1)*T-fy);if(dx<T*1.4&&dy<T*1.6&&dx<bd){bd=dx;best={home:h}}}return best}
 // squash and stretch (transform only, no extra drawing): breathing while it rests, stretched in the air, squashed on landing, a wiggle
 const SQ={x:1,y:1,a:0};function squash(r){const st=r.st;let y=1;
  if(r.land>0)y=1-r.land*.9;else if(!r.g&&st!='sleep')y=1+Math.min(.1,Math.abs(r.vy)/3000);
  else if(st=='sleep')y=1+Math.sin(r.at*1.7+r.ph)*.035;else if(st=='idle'||st=='sit'||st=='talk'||st=='follow'&&Math.abs(r.vx)<5)y=1+Math.sin(r.at*2.8+r.ph)*.025;
  SQ.y=y;SQ.x=1+(1-y)*.85;SQ.a=r.wig>0?Math.sin(r.wig*24)*.08*Math.min(1,r.wig*3):0;return SQ}
 function draw(){if(!entered)return;const vw=cv.width/ZM,vh=cv.height/ZM,ox=cam.x,oy=cam.y,on=x=>x>ox-T*3&&x<ox+vw+T*3,H2=homeS();
  for(const h of homesHere()){const x=(h.x+.5)*T,y=(h.y+1)*T;if(!on(x)||y<oy-T*3||y>oy+vh+T*3)continue;g.drawImage(H2,x-ox-36,y-oy-64,72,68)}
  const sw=SW*PS,shh=SH*PS;
  for(const p of S.pets){const r=RT.get(p.id);if(!r||r.w!==cur||r.home!==p.home||r.far||!on(r.x))continue;const x=r.x-ox,y=r.y-oy;
   if(r.g)g.drawImage(shadowS(),x-14,y-5,28,8);const im=sprite(p.sp,p.fur,r.fr,r.mood,p.clo);g.save();g.translate(x,y);if(r.rot){g.translate(0,-14);g.rotate(r.rot*r.dir);g.translate(0,14)}const q=squash(r);if(q.a)g.rotate(q.a);g.scale(r.dir<0?-q.x:q.x,q.y);g.drawImage(im,-OX*PS,-OY*PS,sw,shh);g.restore();
   if(hungry(p)&&r.st!='eat'&&r.st!='sleep')g.drawImage(bowlS(),x-15,y-58+Math.sin(r.at*3)*1.5,30,22)}
  if(ball&&ball.st!='held')g.drawImage(ballS(),ball.x-ox-6,ball.y-oy-12,12,12);
  for(const q of PT){const a=Math.min(1,q.t*6)*(1-q.t/q.life),x=q.x-ox,y=q.y-oy;g.globalAlpha=a;
   if(q.k=='heart'){const z=Math.min(1,.45+q.t*3.5)*(1+Math.sin(q.t*9+q.ph)*.06);g.drawImage(heartS(),x-7*z,y-7*z,14*z,13*z)}else if(q.k=='z')g.drawImage(txtS('z','z','#7a66c2',16),x-8+Math.sin(q.t*3)*3,y-8,16+q.t*3,16+q.t*3);else if(q.k=='note')g.drawImage(txtS('n','♪','#e0507a',18),x-9,y-9,18,18);
   else if(q.k=='crumb'){g.fillStyle='#b5713c';g.fillRect(x-1.5,y-1.5,3,3)}else g.drawImage(sparkS(),x-6,y-6,12,12)}g.globalAlpha=1;
  if(!UI.on&&!(typeof dlgOpen!='undefined'&&dlgOpen)){const n=nearest();if(n){let x,y,t;if(n.pet){const r=RT.get(n.pet.id);x=r.x;y=r.y-68;t='E  '+n.pet.nm}else{x=(n.home.x+.5)*T;y=(n.home.y+1)*T-80;t='E  Pet Home'}
    const L=label(t);g.drawImage(L,x-ox-L.width/4,y-oy+Math.sin(performance.now()/250)*2,L.width/2,L.height/2)}}}
 {const _t=BOSS6.tick;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('PET10',e)}}}}
 {const _dn=drawNPCs;drawNPCs=function(now){_dn(now);try{draw()}catch(e){if(!draw.e){draw.e=1;console.error('PET10 draw',e)}}}}
 {const _lw=loadWorld;loadWorld=function(){try{closeUI()}catch(_){}ball=null;PT.length=0;RT.clear();const r=_lw.apply(this,arguments);try{settle()}catch(_){}return r}}
 // homeless pets move into a home in this world that has room
 function settle(){let ch=0;for(const p of S.pets){if(homeById(p.home))continue;const h=homesHere().find(h=>petsAt(h.id).length<MAXH);if(h){p.home=h.id;ch=1}else p.home=''}if(ch)later();return ch}
 // ---- placing and picking up the Pet Home (item 612): click with it held on an empty tile that has ground under it
 const cursor=()=>({tx:Math.floor((mx+cam.x)/T),ty:Math.floor((my+cam.y)/T)});
 const held=()=>{try{const k=HOTBAR.held();if(k!=null)return k}catch(_){}return bar[sel]};
 const inReach=(tx,ty)=>Math.hypot(tx*T+T/2-P.x,ty*T+T/2-(P.y+P.h/2))<REACH;
 function place(tx,ty,free){if(!free&&cnt(HOME)<1)return false;if(tx<1||ty<1||tx>=W-1||ty>=H-1)return false;const k=ty*W+tx;
  if(tiles[k]||!solid(tx,ty+1)){try{say('A Pet Home needs an empty spot with ground under it')}catch(_){}return false}
  if(!free&&!canEdit()){try{say('You cannot build in this world')}catch(_){}return false}
  if(homesHere().some(h=>Math.abs(h.x-tx)<2&&Math.abs(h.y-ty)<2)){try{say('Too close to another Pet Home')}catch(_){}return false}
  if(homesHere().length>=8){try{say('This world already has 8 Pet Homes')}catch(_){}return false}
  const h={id:'h'+Date.now().toString(36).slice(-5)+(R()*99|0),x:tx,y:ty};(S.homes[cur]||(S.homes[cur]=[])).push(h);if(!free)addI(HOME,-1);
  const moved=settle();save();try{barDirty=1;renderBar()}catch(_){}const px=(tx+.5)*T,py=(ty+1)*T;try{VFX.burst(px,py-20,['#ff9cbc','#fff','#ffd34a'],16,160,1,.7,10)}catch(_){}try{rings.push({x:px,y:py-16,c:'#ff9cbc',t:performance.now()})}catch(_){}
  try{SFX7.tone(520,780,.12,'sine',.05);SFX7.tone(780,1170,.16,'sine',.04,.1)}catch(_){}
  try{say(moved?'Pet Home placed. Your pets moved in!':S.pets.length?'Pet Home placed.':'Pet Home placed. Adopt a pet in the store (Pets) and it will live here.')}catch(_){}return h}
 function remove(h,silent){const L=homesHere(),i=L.indexOf(h);if(i<0)return false;L.splice(i,1);if(!L.length)delete S.homes[cur];addI(HOME,1);
  for(const p of petsAt(h.id)){p.home='';RT.delete(p.id)}const moved=settle();if(ball)ball=null;save();try{barDirty=1;renderBar()}catch(_){}
  const px=(h.x+.5)*T,py=(h.y+1)*T;try{burst(px,py-20,'#ff9cbc',12,160,4)}catch(_){}if(!silent)try{say(moved?'Pet Home picked up. Your pets moved to another home here.':'Pet Home picked up. Your pets wait for you until you place it again.')}catch(_){}return true}
 const hits=new Map();
 function hitHome(){try{const w=WPN[wp]||{};if(w.k&&w.k!='tool'&&w.k!='fist'&&wp!='fist')return false}catch(_){} // weapons keep attacking; fists and tools pick it up
  const{tx,ty}=cursor();const h=homesHere().find(q=>q.x==tx&&(q.y==ty||q.y-1==ty));if(!h||tiles[h.y*W+h.x]||tiles[ty*W+tx]||!inReach(tx,ty))return false;if(!canEdit())return false;
  const n=(hits.get(h.id)||0)+1;try{wcd=.25;swing=.15;P.f=(h.x+.5)*T>=P.x?1:-1}catch(_){}try{burst((h.x+.5)*T,(h.y+.5)*T,'#ff9cbc',4,90,3)}catch(_){}try{MSFX8.play('hit','wood',5)}catch(_){}
  if(n<3){hits.set(h.id,n);setTimeout(()=>{if(hits.get(h.id)==n)hits.delete(h.id)},1500);return true}hits.delete(h.id);remove(h);return true}
 {const _pa=placeAction;placeAction=function(){try{if(held()===HOME&&!showInv){const{tx,ty}=cursor();if(inReach(tx,ty)){place(tx,ty);return}}}catch(e){console.error('PET10 place',e)}return _pa.apply(this,arguments)}}
 {const _uw=useWeapon;useWeapon=function(){try{if(!showInv){if(held()===HOME&&cnt(HOME)>0){const{tx,ty}=cursor();if(inReach(tx,ty)){place(tx,ty);try{wcd=.3}catch(_){}return}}else if(hitHome())return}}catch(e){console.error('PET10 use',e)}return _uw.apply(this,arguments)}}
 // ---- E: open the Pet UI next to a pet or a Pet Home (NPCs, doors, objects and chests keep priority)
 {const _i=interact;interact=function(){try{if(!UI.on&&!dlgOpen&&!creatorOn&&!showInv&&menuEl.style.display=='none'){let busy=false;try{busy=!!nearNPC()}catch(_){}try{busy=busy||!!(OBJ6.near&&OBJ6.near())}catch(_){}try{busy=busy||!!CHEST7.near()}catch(_){}try{busy=busy||HDOOR9.nearest()>=0}catch(_){}
   if(!busy){const n=nearest();if(n){openUI(n.pet?n.pet.id:null,n.home?n.home.id:homeById(n.pet.home).h.id);return}}}}catch(e){console.error('PET10 E',e)}return _i.apply(this,arguments)}}
 // ---- actions (used by the UI and the tests)
 const byId=id=>S.pets.find(p=>p.id==id);
 function feed(id,treat){const p=byId(id);if(!p)return{ok:0,m:'No pet'};const it=treat?TREAT:FOOD;if(cnt(it)<1)return{ok:0,m:'You have no '+MAT[it].n+'. Get some in the store (Pets).'};
  if(!treat&&hunger(p)<.15)return{ok:0,m:p.nm+' is full right now'};addI(it,-1);p.fed=now();p.n.meals++;addHap(p,treat?20:8);save();try{barDirty=1;renderBar()}catch(_){}
  const r=rt(p);if(r){setSt(p,r,'eat');puff('heart',r.x,r.y-34,treat?3:2)}return{ok:1,m:p.nm+(treat?' loved the treat!':' ate happily. Next meal in 2 hours.')}}
 function pet(id){const p=byId(id);if(!p)return{ok:0};const t=performance.now();if(t-(p._pt||0)<1200)return{ok:0,m:''};p._pt=t;p.n.pets++;addHap(p,hungry(p)?2:6);const r=rt(p);
  if(r){setSt(p,r,'happy');puff('heart',r.x,r.y-36,2);voice(p.sp,p.sp=='cat'?'purr':'talk',r.x,r.y)}later();return{ok:1,m:hungry(p)?p.nm+' leans into your hand, but looks hungry':p.nm+' loves that! ♥'}}
 function play(id){const p=byId(id);if(!p)return{ok:0,m:'No pet'};if(hungry(p))return{ok:0,m:p.nm+' is too hungry to play. Feed them first.'};const r=rt(p);if(!r)return{ok:0,m:p.nm+' is not in this world'};
  if(ball)return{ok:0,m:'The ball is already out'};const hp=homePos(p),d=Math.abs(P.x-hp.x)>T*2?Math.sign(hp.x-P.x):(P.f||1);
  ball={x:P.x+d*10,y:P.y+P.h*.35,vx:d*(140+R()*70),vy:-360,st:'fly',t:0,pet:p.id,w:cur};setSt(p,r,'fetch');r.tm=15;voice(p.sp,'talk',r.x,r.y);try{UIS.play('click')}catch(_){}return{ok:1,m:'You threw the ball for '+p.nm+'!'}}
 function moveTo(id,hid){const p=byId(id),h=homeById(hid);if(!p||!h)return false;if(petsAt(hid).length>=MAXH&&p.home!=hid)return false;p.home=hid;RT.delete(p.id);save();return true}
 function force(id,st){const p=byId(id),r=p&&rt(p);if(!r)return false;setSt(p,r,st);return true}
 // ==== Pet UI =============================================================================================================
 const UI={el:null,on:false,pid:null,hid:null,slot:'head',raf:0,acc:0,anim:0};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fmt=ms=>{ms=Math.max(0,ms);const m=Math.round(ms/6e4);return m<1?'less than a minute':m<60?m+' min':Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':'')};
 const ICC={};function clothIcon(id,c){const k=id+c;if(ICC[k])return ICC[k];const cv2=document.createElement('canvas');cv2.width=cv2.height=88;const X=cv2.getContext('2d');X.scale(2,2);X.translate(22,30);
  const f=FR.idle0,s=geo('cat',f),sl=CL[id].s,ax=sl=='body'?s.bx:sl=='back'?s.bx-4:s.hx,ay=sl=='head'?s.hy-s.hr-1:sl=='neck'?s.hy+s.hr*.85:sl=='body'?s.by:s.by-s.ry-3,z=sl=='back'?1.45:sl=='body'?1.6:2.3;
  X.scale(z,z);X.translate(-ax,-ay);X.lineJoin='round';try{if(id=='sweater'){CLD.sweater(X,s,c,f)}else{CLD[id](X,s,c,f,'cat');if(id=='cape')CLD.clasp(X,s)}}catch(_){}if(Object.keys(ICC).length>120)for(const q in ICC)delete ICC[q];return ICC[k]=cv2.toDataURL()}
 const PIC={};function petIcon(p){const k=p.sp+p.fur+cloSig(p.clo);if(PIC[k])return PIC[k];const c=document.createElement('canvas');c.width=c.height=64;const X=c.getContext('2d');X.drawImage(sprite(p.sp,p.fur,'idle0','',p.clo),0,0,SW*SS,SH*SS,-4,-6,72,61);return PIC[k]=c.toDataURL()}
 function mk(){if(UI.el)return;const el=UI.el=document.createElement('div');el.id='petui';el.setAttribute('role','dialog');el.setAttribute('aria-label','Pet care');document.body.appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,p=byId(UI.pid);let r=null;
   if(a=='close')return closeUI();if(a=='tab'){UI.pid=b.dataset.id;render();return}if(a=='store'){closeUI();try{STORE7.open({cat:'pets'})}catch(_){}return}
   if(!p)return;if(a=='fur'){p.fur=+b.dataset.i|0;later()}else if(a=='feed')r=feed(p.id,false);else if(a=='treat')r=feed(p.id,true);else if(a=='pet')r=pet(p.id);
   else if(a=='play'){r=play(p.id);if(r.ok){closeUI();try{say(r.m)}catch(_){}return}}
   else if(a=='home'){if(moveTo(p.id,UI.hid))r={ok:1,m:p.nm+' moved to this Pet Home'};else r={ok:0,m:'This Pet Home is full ('+MAXH+' pets)'}}
   else if(a=='slot'){UI.slot=b.dataset.s}else if(a=='wear'){const s=b.dataset.s,id=b.dataset.id;if(!id){delete p.clo[s]}else if(ownC(id)){const old=p.clo[s];p.clo[s]=[id,old&&old[0]==id?old[1]:CL[id].c]}else{closeUI();try{STORE7.open({item:'petc_'+id})}catch(_){}return}UI.slot=s;later();try{UIS.play('click')}catch(_){}}
   else if(a=='col'){const c=p.clo[UI.slot];if(c){c[1]=b.dataset.c;later()}}
   if(r&&r.m)try{say(r.m)}catch(_){}if(r)try{UIS.play(r.ok?'select':'error')}catch(_){}render()});
  el.addEventListener('input',e=>{const p=byId(UI.pid);if(!p)return;if(e.target.dataset.a=='pick'){const c=p.clo[UI.slot];if(c&&hexOk(e.target.value)){c[1]=e.target.value.toLowerCase();later();paintClo(1)}}});
  el.addEventListener('change',e=>{const p=byId(UI.pid);if(!p)return;if(e.target.dataset.a=='nm'){p.nm=clean(e.target.value,14)||SP[p.sp].nm;later();render()}else if(e.target.dataset.a=='pick')render()});
  el.addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'){e.stopPropagation();if(e.key=='Escape'||e.key=='Enter')e.target.blur()}})}
 function bars(p){const h=hunger(p),hp=happy(p),fed=now()-p.fed,left=FEED_MS-fed;
  return'<div class="pb10"><span>Food</span><i class="m10 f10'+(h>=1?' low':'')+'"><b style="width:'+Math.round(Math.max(0,1-Math.min(1,h))*100)+'%"></b></i><small>'+(h>=1?'Hungry! Fed '+fmt(fed)+' ago':h>=.5?'Getting peckish · next meal in '+fmt(left):'Full · next meal in '+fmt(left))+'</small></div>'
   +'<div class="pb10"><span>Joy</span><i class="m10 j10'+(hp<35?' low':'')+'"><b style="width:'+Math.round(hp)+'%"></b></i><small>'+(hp>=80?'Very happy':hp>=55?'Happy':hp>=35?'A bit bored':'Lonely, play with me!')+'</small></div>'}
 function render(){if(!UI.el)return;const el=UI.el;if(!byId(UI.pid))UI.pid=(S.pets[0]||{}).id||null;const p=byId(UI.pid);
  const tabs=S.pets.map(q=>'<button class="tb10'+(q.id==UI.pid?' on':'')+'" data-a="tab" data-id="'+q.id+'"><img src="'+petIcon(q)+'" alt="">'+esc(q.nm)+(hungry(q)?' <em>!</em>':'')+'</button>').join('')+'<button class="tb10 add" data-a="store" title="Adopt pets, buy clothes and food">＋ Store</button>';
  let h='<div class="hd10"><div class="tabs10">'+tabs+'</div><button class="x10" data-a="close" title="Close (Esc or E)">✕</button></div>';
  if(!p){h+='<div class="empty10"><canvas class="pv10" width="300" height="190"></canvas><p>No pets yet. Adopt a <b>Cat</b>, <b>Dog</b>, <b>Rabbit</b> or <b>Fox</b> in the store (Pets tab). They live at a Pet Home you place in your world.</p><button class="pri10" data-a="store">Open the Pet store</button></div>';el.innerHTML=h;return}
  const hm=homeById(p.home),F=SP[p.sp].fur,here=hm&&hm.w===cur,fc=cnt(FOOD),tc=cnt(TREAT),hun=hungry(p);
  const where=!hm?'No home yet: place a Pet Home and '+esc(p.nm)+' moves in':here?'Lives at a Pet Home in this world':'Lives in world “'+esc(hm.w)+'”';
  h+='<div class="main10"><div class="left10"><canvas class="pv10" width="300" height="190"></canvas><div class="fur10">'+F.map((f,i)=>'<button data-a="fur" data-i="'+i+'" class="'+(p.fur==i?'on':'')+'" title="'+esc(f[0])+'" style="--a:'+f[1]+';--b:'+f[2]+'"></button>').join('')+'<small>'+esc(F[p.fur][0])+' '+SP[p.sp].n.toLowerCase()+'</small></div></div>'
   +'<div class="right10"><label class="nm10">Name<input data-a="nm" maxlength="14" value="'+esc(p.nm)+'"></label><small class="wh10">'+where+'</small><div class="bars10">'+bars(p)+'</div>'
   +'<div class="acts10"><button class="pri10" data-a="feed"'+(fc<1?' title="Buy Pet Food in the store"':'')+'>Feed <small>Pet Food ×'+fc+'</small></button><button data-a="treat"'+(tc<1?' title="Buy Pet Treats in the store"':'')+'>Treat <small>×'+tc+'</small></button>'
   +'<button data-a="pet">Pet ♥</button><button data-a="play"'+(hun||!here?' disabled title="'+(hun?'Too hungry to play':'Not in this world')+'"':'')+'>Play ball</button>'
   +(UI.hid&&p.home!==UI.hid&&homesHere().some(q=>q.id==UI.hid)?'<button data-a="home">Move to this home</button>':'')+'</div>'
   +'<small class="st10">Meals '+p.n.meals+' · Pets '+p.n.pets+' · Fetches '+p.n.plays+'</small></div></div>'
   +'<div class="clo10"><h5>Clothes</h5><div class="slots10"></div><div class="cols10"></div></div>';
  el.innerHTML=h;paintClo()}
 function paintClo(only){const el=UI.el,p=byId(UI.pid);if(!el||!p)return;const sb=el.querySelector('.slots10'),cb=el.querySelector('.cols10');if(!sb)return;
  sb.innerHTML=SLOTS.map(s=>{const cur2=p.clo[s];return'<div class="row10'+(UI.slot==s?' on':'')+'"><button class="sl10" data-a="slot" data-s="'+s+'">'+SLN[s]+'</button><button class="ch10'+(!cur2?' on':'')+'" data-a="wear" data-s="'+s+'" data-id="" title="Nothing">∅</button>'
   +Object.keys(CL).filter(k=>CL[k].s==s).map(k=>{const o=ownC(k),on=cur2&&cur2[0]==k;return'<button class="ch10'+(on?' on':'')+(o?'':' lock')+'" data-a="wear" data-s="'+s+'" data-id="'+k+'" title="'+esc(CL[k].n)+(o?'':' (in the store)')+'"><img src="'+clothIcon(k,on?cur2[1]:CL[k].c)+'" alt=""><small>'+esc(CL[k].n)+'</small>'+(o?'':'<u>🔒</u>')+'</button>'}).join('')+'</div>'}).join('');
  const c=p.clo[UI.slot];if(only){for(const b of cb.querySelectorAll('.sw10'))b.classList.toggle('on',!!c&&b.dataset.c==c[1]);return}cb.innerHTML=c?'<span>'+esc(CL[c[0]].n)+' colour</span>'+PAL.map(x=>'<button class="sw10'+(x==c[1]?' on':'')+'" data-a="col" data-c="'+x+'" style="--c:'+x+'" title="'+x+'"></button>').join('')+'<label class="pk10" title="Any colour"><input type="color" data-a="pick" value="'+c[1]+'"></label>':'<span class="dim10">Pick something for the '+SLN[UI.slot].toLowerCase()+' to choose its colour.</span>'}
 // live preview: the pet acts out its moves in the panel (cached frames, scaled up)
 const DEMO=[['idle0',1.2],['blink',.15],['idle1',.6],['twitch',.18],['idle0',.5],['walk0',.15],['walk1',.15],['walk2',.15],['walk3',.15],['walk0',.15],['walk1',.15],['walk2',.15],['walk3',.15],['sit',1.4],['talk',.8],['sit',.6],['happy',1],['wig0',.12],['wig1',.12],['wig0',.12],['wig1',.12],['wig0',.12],['wig1',.12],['stretch',1.1],['idle0',.6],['sleep0',1.1],['sleep1',1.1]];
 function uiTick(dt){UI.anim+=dt;UI.acc+=dt;const el=UI.el;if(!el)return;const p=byId(UI.pid);if(UI.acc>1){UI.acc=0;if(p){const b=el.querySelector('.bars10');if(b)b.innerHTML=bars(p)}}
  if(UI.hid){const h=homeById(UI.hid);if(!h||h.w!==cur){closeUI();return}const x=(h.h.x+.5)*T,y=(h.h.y+1)*T;if(Math.abs(P.x-x)>T*8||Math.abs(P.y+P.h-y)>T*6){closeUI();return}}
  const c=el.querySelector('.pv10');if(!c)return;const X=c.getContext('2d');X.clearRect(0,0,c.width,c.height);
  if(!p){let t=UI.anim%4;SPECIES.forEach((s,i)=>{const fr=['idle0','sit','happy','walk'+((UI.anim*7|0)%4)][(i+(UI.anim/1.6|0))%4];X.drawImage(sprite(s,(UI.anim/4|0)%4,fr,'',{}),12+i*70,40,76*.92,64*.92)});return}
  let t=UI.anim%DEMO.reduce((a,b)=>a+b[1],0),fr='idle0';for(const d of DEMO){if(t<d[1]){fr=d[0];break}t-=d[1]}const sad=hungry(p)&&!fr.startsWith('sleep')&&fr!='happy';
  X.fillStyle='rgba(0,0,0,.12)';X.beginPath();X.ellipse(150,170,58,8,0,0,TAU);X.fill();const z=2.8,hop=fr=='happy'?Math.abs(Math.sin(UI.anim*6))*-8:0,by=fr.startsWith('sleep')?1+Math.sin(UI.anim*1.7)*.035:/^(idle|blink|twitch|sit|talk)/.test(fr)?1+Math.sin(UI.anim*2.8)*.025:1,bx=1+(1-by)*.85;
  X.drawImage(sprite(p.sp,p.fur,fr,sad?'sad':'',p.clo),150-OX*z*bx,172-OY*z*by+hop,SW*z*bx,SH*z*by)}
 function openUI(pid,hid){mk();ensure();settle();UI.pid=pid||(hid&&petsAt(hid)[0]||S.pets[0]||{}).id||null;UI.hid=hid||null;UI.on=true;UI.anim=0;UI.el.style.display='block';render();try{UIS.play('open')}catch(_){}
  const p=byId(UI.pid),r=p&&rt(p);if(r&&!busy(r.st)&&r.st!='sleep'){r.dir=P.x<r.x?-1:1;setSt(p,r,'sit');r.tm=6}}
 function closeUI(){if(!UI.on)return;UI.on=false;if(UI.el)UI.el.style.display='none';try{const a=document.activeElement;if(a&&UI.el.contains(a))a.blur()}catch(_){}save()}
 addEventListener('keydown',e=>{if(!UI.on)return;if(e.key=='Escape'){closeUI();e.stopPropagation();return}if((e.key=='e'||e.key=='E')&&!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey){try{if(isTextEl(e.target))return}catch(_){}closeUI();e.stopPropagation();e.preventDefault()}},true);
 // ==== store: Pets tab + card art ==========================================================================================
 try{if(!SHOP7.CATS.some(c=>c[0]=='pets'))SHOP7.CATS.splice(SHOP7.CATS.findIndex(c=>c[0]=='weather'),0,['pets','Pets'])}catch(_){}
 const PVF=['walk0','walk1','walk2','walk3','walk0','walk1','walk2','walk3','sit','talk','sit','happy','happy','idle0','blink','idle1'];
 function preview(X,it,W2,H2,t,still){const id=String(it.id||''),k=Math.min(W2/300,H2/220);X.save();
  if(id.startsWith('pet_')&&SP[it.ref]){const fr=still?'idle0':PVF[(t*5|0)%PVF.length],fur=still?0:(t/3.2|0)%4,z=k*2.9,hop=fr=='happy'?-Math.abs(Math.sin(t*7))*10*k:0;
   X.fillStyle='rgba(0,0,0,.13)';X.beginPath();X.ellipse(W2/2,H2*.8,46*k*1.6,7*k*1.4,0,0,TAU);X.fill();X.drawImage(sprite(it.ref,fur,fr,'',{}),W2/2-OX*z,H2*.82-OY*z+hop,SW*z,SH*z)}
  else if(id.startsWith('petc_')&&CL[it.ref]){const cl={};cl[CL[it.ref].s]=[it.ref,still?CL[it.ref].c:PAL[(t/1.4|0)%PAL.length]];const sp=it.ref=='wings'||it.ref=='crown'?'rabbit':it.ref=='bandana'||it.ref=='collar'?'dog':it.ref=='scarf'?'fox':'cat',
   fr=still?'idle0':['idle0','idle1','blink','happy','sit','talk'][(t/0.9|0)%6],z=k*2.9;X.fillStyle='rgba(0,0,0,.13)';X.beginPath();X.ellipse(W2/2,H2*.8,46*k*1.6,7*k*1.4,0,0,TAU);X.fill();X.drawImage(sprite(sp,sp=='cat'?0:sp=='dog'?1:sp=='fox'?0:2,fr,'',cl),W2/2-OX*z,H2*.82-OY*z,SW*z,SH*z)}
  else if(+it.ref==HOME){const z=k*2.2;X.translate(W2/2,H2*.86+(still?0:Math.sin(t*2)*2*k));X.scale(z,z);homeArt(X)}
  else{const z=k*(+it.ref==TREAT?4.4:3.8);X.translate(W2/2,H2*(+it.ref==TREAT?.55:.62)+(still?0:Math.sin(t*2)*3*k));X.scale(z,z);foodArt(X,+it.ref==TREAT)}
  X.restore()}
 // ---- crafting: kibble from crops, treats from fish (at the Crafting Table)
 try{for(const r of[{id:'petfood',n:'Pet Food',out:[FOOD,3],in:[[282,1],[280,1]],secs:4,lv:1},{id:'pettreat',n:'Pet Treat',out:[TREAT,2],in:[[240,1],[281,1]],secs:6,lv:2}])if(!RECIPES.some(q=>q.id==r.id))RECIPES.push(r)}catch(_){}
 return{S,SP,CL,SLOTS,PAL,FR,SPECIES,FOOD,TREAT,HOME,FEED_MS,RANGE,RT,PT,get ball(){return ball},set ball(v){ball=v},hunger,hungry,happy,addHap,ensure,settle,place,remove,feed,pet,play,moveTo,force,rt,sprite,preview,
  open:openUI,close:closeUI,render,get ui(){return UI},nearest,save,load(){load();RT.clear()},timeShift(ms){S.off=+ms||0},get clock(){return S.clk},CACHE,homesHere,homeById,petsAt,clothIcon}})();
