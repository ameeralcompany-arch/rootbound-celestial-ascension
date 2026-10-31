// ===== BIOME17: biome worlds. Every normal world (not the Plaza, not an Inferno) is a first-tier world: its hidden word always has 3 letters,
// and under the surface it has one biome per letter, stacked in equal bands of 30 depths (depth = tiles below the surface, sh(x)):
//   biome I  6-36 m     biome II  36-66 m     biome III  66-96 m (its rock runs on down to the bedrock)
// Three biomes per world are drawn from six, from the world name, so worlds differ and the layout never shifts between loads:
//   Verdant Hollow (moss, roots, glowshroom caverns)   Frost Grotto (frozen pools, icicles)   Sunken Dunes (layered sandstone, buried ruins)
//   Amethyst Geodes (hollow crystal geodes)            Tidewater Caves (pools, coral)         Cinder Depths (basalt spires, magma veins)
// Each biome has its own rock, soil and accent blocks (tile ids 210-227; they drop plain blocks), its own ore (drops a shard to sell), two
// monsters of its own (stronger the deeper the biome and the harder the world) and its own adventure, a trial of three parts:
//   light its 3 beacons (each one wakes a wave of the biome's monsters; beat the wave to light it) · defeat 12/16/20 of its monsters ·
//   mine 6/8/10 of its ore
// The biome's letter waits in a chamber deep in the biome, sealed until the trial is done; then its Letter Warden (GUARD16) can be fought.
// Every world has a difficulty (1-5 stars, from its name) that scales the biome monsters and the reward for finishing the world: all three
// trials done and the Word Gate solved. Rewards follow the economy in docs/progression-balance.md:
//   biome trial   4 min of income in gems, 5% of a level in XP, class XP
//   world         (10 + 6 x difficulty) min of income in gems, (20 + 8 x difficulty)% of a level in XP, class XP and depth materials
// Worlds where the letter hunt had already started keep their old word and letter spots; the biomes and trials still apply there.
// The DEPTH8 zone indicator, tint, motes and ambience follow the biomes in a biome world. State: RB_PREFIX + 'rbbiome'. =====
const BIOME17=(()=>{
 const R=Math.random,TAU=Math.PI*2,OL='rgba(20,15,40,.9)';
 const h32=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
 const rr=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
 const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 const norm=n=>String(n||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16)||'plaza';
 const creative=()=>{try{return !!(typeof RB_CREATIVE!='undefined'&&RB_CREATIVE)||!!CRV8.on}catch(_){return false}};
 const isWorld=n=>{n=norm(n);try{return WORD9.hasWord(n)}catch(_){return n!='plaza'&&!/-inf$/.test(n)}};
 const tone=(a,b,d,ty,v,dl)=>{try{SFX7.tone(a,b,d,ty,v,dl)}catch(_){}};
 const BAND=30,TOP=6,N=3,ROM=['I','II','III','IV','V'],STARS=['','Gentle','Fair','Tough','Fierce','Mythic'];
 // 3-letter words with no common anagram, so the Word Gate never refuses a fair answer
 const WORDS3=['SUN','SKY','GEM','KEY','OAK','FOX','BEE','ICE','ELF','AXE','BOW','CUP','HAT','JAM','LOG','PIE','EGG','FIG','FIN','IVY','JOY','HEN','JET','YAK','KIT','ZOO','TOY','BUG','WEB','HUG','FUN'];
 // ---- the six biomes. rock / soil / acc / ore are tile ids; mob: [kind, look (classic shape), name, colour, ai, hp, dmg, gem, w, h, extra]
 const BI=[
  {id:'moss',n:'Verdant Hollow',c:'#5fd47a',l:'#d4ffb8',m:'spores',rock:210,soil:211,acc:211,ore:212,
   tl:{210:['Moss Rock','#6f8a68','rock'],211:['Root Loam','#5e4a34','soil'],212:['Verdant Ore','#6dff9a','ore']},sh:['Verdant Shard',34],
   bea:['Spore Totem','Spore Totems','Light','totem'],
   mob:[['b_beetle','crab','Moss Beetle','#6aa85a','walk',46,7,7,44,30,{spm:.8}],['b_puff','slime','Spore Puff','#c8e86a','hop',30,6,6,34,28,{jp:520,sx:190,cd:.7}]]},
  {id:'frost',n:'Frost Grotto',c:'#7ad8ff',l:'#e6f8ff',m:'snow',rock:213,soil:213,acc:214,ore:215,
   tl:{213:['Frost Rock','#9cb8cc','rock'],214:['Packed Ice','#a8e6ff','ice'],215:['Frostcore Ore','#7ae0ff','ore']},sh:['Frost Core',36],
   bea:['Frost Lantern','Frost Lanterns','Rekindle','lantern'],
   mob:[['b_fslime','slime','Frost Slime','#9ae4ff','hop',40,7,7,40,32,{jp:560,sx:170}],['b_wisp','wraith','Ice Wisp','#d8f4ff','fly',30,7,7,32,42,{spm:1.15}]]},
  {id:'dune',n:'Sunken Dunes',c:'#ffc45a',l:'#fff0c8',m:'dust',rock:216,soil:217,acc:217,ore:218,
   tl:{216:['Dune Rock','#c79a5e','rock'],217:['Dune Sand','#e8c98a','sand'],218:['Sunstone Ore','#ffb43a','ore']},sh:['Sunstone',38],
   bea:['Sun Obelisk','Sun Obelisks','Raise','obelisk'],
   mob:[['b_scarab','crab','Sand Scarab','#e0a040','walk',38,8,7,40,26,{spm:1.8}],['b_dust','wraith','Dust Wraith','#e8c890','fly',32,7,7,34,44,{ph:1,spm:.9}]]},
  {id:'crystal',n:'Amethyst Geodes',c:'#b48cff',l:'#f0e4ff',m:'glint',rock:219,soil:219,acc:220,ore:221,
   tl:{219:['Geode Rock','#5e4a7a','rock'],220:['Amethyst Crystal','#b48cff','crys'],221:['Prism Ore','#ffd0ff','ore']},sh:['Prism Shard',42],
   bea:['Resonant Prism','Resonant Prisms','Tune','prism'],
   mob:[['b_cgolem','golem','Crystal Golem','#a07ad8','walk',80,10,10,46,54,{spm:.65}],['b_sprite','moth','Shard Sprite','#e0c8ff','fly',26,6,7,30,26,{spm:1.5}]]},
  {id:'reef',n:'Tidewater Caves',c:'#4fe0d0',l:'#d8fff8',m:'bubbles',rock:222,soil:222,acc:223,ore:224,
   tl:{222:['Reef Rock','#4f8a8a','rock'],223:['Brain Coral','#ff8aa8','coral'],224:['Pearl Ore','#fff4f0','ore']},sh:['Abyss Pearl',40],
   bea:['Tide Shell','Tide Shells','Wake','shell'],
   mob:[['b_crab','crab','Reef Crab','#ff7a8a','walk',44,8,7,42,28,{spm:1.1}],['b_jelly','wraith','Glow Jelly','#ffa8e0','fly',34,7,7,34,40,{spm:.7}]]},
  {id:'ember',n:'Cinder Depths',c:'#ff8a4a',l:'#ffe0c8',m:'embers',rock:225,soil:226,acc:226,ore:227,
   tl:{225:['Cinder Rock','#6a3a30','rock'],226:['Cinder Ash','#4a4044','ash'],227:['Emberglass Ore','#ff7a2a','ore']},sh:['Emberglass',44],
   bea:['Ember Brazier','Ember Braziers','Rekindle','brazier'],
   mob:[['b_toad','slime','Cinder Toad','#d0603a','hop',48,8,8,42,32,{jp:680,sx:220,cd:.9}],['b_fmoth','moth','Flame Moth','#ffb05a','fly',28,7,7,32,28,{spm:1.3}]]}];
 const TILE={},ORE=new Set(),KIND={},DROP={};
 const SOFT=()=>(BLK[1]||[0,0,3])[2],HARD=()=>(BLK[3]||[0,0,6])[2];
 for(const b of BI){for(const id in b.tl){const t=b.tl[id],n=+id;TILE[n]={n:t[0],c:t[1],s:t[2],b};BLK[n]=[t[0],t[1],t[2]=='rock'?HARD():t[2]=='ore'?Math.round(HARD()*1.6):t[2]=='crys'?Math.round(HARD()*1.2):SOFT()];
   try{PRICE[n]=t[2]=='ore'?b.sh[1]:4;LVREQ[n]=0;SOLID6[n]=1}catch(_){}
   try{TOOLS8.CAT[n]=t[2]=='rock'?'stone':t[2]=='ore'||t[2]=='crys'?'ore':'soft'}catch(_){}}
 // Geode Rock yields to the Rock Tapper alone
 try{TOOLS8.ONLY[219]='stone'}catch(_){}
  ORE.add(b.ore);MAT[b.ore]={n:b.sh[0],c:b.tl[b.ore][1],p:b.sh[1]};try{GLOW7[b.ore]=hexRGB(b.tl[b.ore][1])}catch(_){}
  for(const q of b.mob){const[k,look,n,c,ai,hp,dmg,gem,w,h,x]=q;KIND[k]={b,look,base:{hp,dmg,gem}};MK[k]=Object.assign({c,hp,dmg,gem,w,h,ai,n,min:9999,max:9999,bio:1,look},ai=='fly'?{fly:1}:{},x||{});MOBMAT[k]=b.ore}}
 // biome blocks break into plain blocks (the ores drop their shard: the ore tile id is the shard's item id)
 Object.assign(DROP,{210:3,211:1,213:3,214:56,216:3,217:8,219:3,220:9,222:3,223:59,225:78,226:99});
 function hexRGB(h){h=String(h).replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
 // ---- save: {w:{world:{bw:biome word?, lit:{beaconId:1}, k:[kills per biome], o:[ore per biome], c:[trial done per biome], done}}}
 const SK=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbbiome';let S={w:{}};
 try{const o=JSON.parse(localStorage.getItem(SK())||'null');if(o&&o.w&&typeof o.w=='object')S=o}catch(_){}
 let dirty=0;const save=()=>{dirty=0;try{localStorage.setItem(SK(),JSON.stringify(S))}catch(_){}};
 function rec(n){n=norm(n);let r=S.w[n];if(!r){let old=0;try{const st=WORD9.state.w[n];old=st&&((st.got&&st.got.length)||st.ok)?1:0}catch(_){}r=S.w[n]={bw:old?0:1,lit:{},k:[0,0,0],o:[0,0,0],c:[0,0,0],done:0};save()}
  for(const f of['k','o','c'])if(!Array.isArray(r[f]))r[f]=[0,0,0];if(!r.lit||typeof r.lit!='object')r.lit={};return r}
 // ---- world layout from its name: which three biomes (in band order) and the difficulty
 function layout(n){n=norm(n);const Rn=rr((h32(n)^0xb10e)>>>0),ids=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=Math.floor(Rn()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
  const q=Rn(),diff=q<.2?1:q<.45?2:q<.7?3:q<.88?4:5;return{bi:ids.slice(0,N).map(i=>BI[i]),diff,bands:ids.slice(0,N).map((_,i)=>({d0:TOP+i*BAND,d1:TOP+(i+1)*BAND}))}}
 const wordOf=n=>{if(!isWorld(n))return null;const r=rec(n);return r.bw?WORDS3[h32(norm(n)+'#w3')%WORDS3.length]:null};
 const needK=i=>12+4*i,needO=i=>6+2*i,NB=3;
 const bandOfDepth=d=>{if(d<TOP)return -1;return Math.min(N-1,Math.floor((d-TOP)/BAND))};
 let LAY=null,ON=false,BEA=[],LSP=null,LCH=[];
 // ---- terrain: re-skin the bands, carve each biome's features, beacon chambers and letter chambers. Runs right after the base terrain
 // (WORD9's gen wrapper), before the letters are placed and before saved edits apply.
 const CARVE=new Set([1,3,77,...Object.keys(TILE).map(Number).filter(n=>!ORE.has(n))]);
 function shape(){LAY=null;ON=false;BEA=[];LSP=null;LCH=[];if(!isWorld(cur))return;const lay=layout(cur);LAY=lay;ON=true;const r=rec(cur),Rg=rr((h32(cur)^0x5a9e)>>>0),ri=(a,b)=>a+Math.floor(Rg()*Math.max(1,b-a));
  const S0=new Int16Array(W),J=new Int8Array(W);for(let x=0;x<W;x++){S0[x]=sh(x);J[x]=Math.round(Math.sin(x*.21+lay.diff)*1.2+Math.sin(x*.07+3.1)*1.3)}
  const bandAt=(x,y)=>{if(x<1||x>=W-1||y>=H-2)return -1;const d=y-S0[x]-J[x];return d<TOP?-1:Math.min(N-1,Math.floor((d-TOP)/BAND))};
  const inB=(x,y,i)=>bandAt(x,y)==i,T0=(x,y)=>tiles[y*W+x],put=(x,y,b)=>{const k=y*W+x;tiles[k]=b;hp[k]=b?BLK[b][2]:0;if(b)wl[k]=0};
  const noise=(x,y,o)=>Math.sin(x*.31+y*.17+o)+Math.sin(x*.13-y*.29+o*1.7)+Math.sin((x+y)*.11+o*2.3);
  // 1. re-skin: stone and deepslate become the biome rock, dirt its soil, blobs / layers of its accent block
  for(let y=TOP;y<H-2;y++)for(let x=1;x<W-1;x++){const i=bandAt(x,y);if(i<0)continue;const b=lay.bi[i],k=y*W+x,t=tiles[k];if(t!=3&&t!=77&&t!=1)continue;
   let nb=t==1?b.soil:b.rock;if(t!=1){const v=noise(x,y,i*5+lay.diff);if(b.id=='dune'?((y+Math.round(Math.sin(x*.1)*2))%7)<2:v>(b.id=='crystal'?2.05:1.65))nb=b.acc}put(x,y,nb)}
  // 2. features
  const area=(x0,y0,x1,y1,ok)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(x<2||x>W-3||y<2||y>H-4)return false;const t=T0(x,y);if(t&&!ok(t))return false;if(wl[y*W+x])return false}return true};
  const rockish=t=>CARVE.has(t)||ORE.has(t)||t==9||t==10||(t>=71&&t<=76);
  const floorAir=(x,y)=>!T0(x,y)&&!wl[y*W+x]&&T0(x,y+1)&&CARVE.has(T0(x,y+1));
  lay.bi.forEach((b,i)=>{const d0=TOP+i*BAND,d1=d0+BAND,yAt=x=>S0[x]+d0+ri(3,BAND-3);
   if(b.id=='moss'){for(let n=0;n<6;n++){const cx=ri(8,W-8),cy=yAt(cx),rx=4+Rg()*4,ry=2.5+Rg()*1.6;for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(inB(x,y,i)&&((x-cx)/rx)**2+((y-cy)/ry)**2<1&&CARVE.has(T0(x,y)))put(x,y,0)}}
   if(b.id=='crystal'){for(let n=0;n<4;n++){const cx=ri(10,W-10),cy=yAt(cx),rad=4+Rg()*2.2;if(!area(Math.floor(cx-rad),Math.floor(cy-rad),Math.ceil(cx+rad),Math.ceil(cy+rad),rockish))continue;
     for(let y=Math.floor(cy-rad);y<=cy+rad;y++)for(let x=Math.floor(cx-rad);x<=cx+rad;x++){const dd=Math.hypot(x-cx,y-cy);if(dd<rad-1.5)put(x,y,0);else if(dd<rad&&CARVE.has(T0(x,y)))put(x,y,b.acc)}
     for(let x=Math.floor(cx-rad+2);x<=cx+rad-2;x++){let y=Math.floor(cy);while(y<H-3&&!T0(x,y+1))y++;if(!T0(x,y)&&Rg()<.35)put(x,y,52)}}}
   if(b.id=='dune'){for(let n=0;n<2;n++){const x0=ri(10,W-22),y1=yAt(x0+5),y0=y1-5;if(!area(x0-1,y0-1,x0+11,y1+1,rockish))continue;
     for(let y=y0;y<=y1;y++)for(let x=x0;x<=x0+10;x++){const edge=y==y0||y==y1||x==x0||x==x0+10;put(x,y,edge?45:0)}
     for(const x of[x0,x0+10]){put(x,y1-1,0);put(x,y1-2,0)}put(x0+3,y1-1,64);put(x0+7,y1-1,64);if(Rg()<.6)put(x0+5,y1-1,10)}}
   for(let y=d0;y<H-3;y++)for(let x=2;x<W-2;x++){if(!inB(x,y,i))continue;const k=y*W+x;
    if(b.id=='frost'){if(!tiles[k]&&wl[k]){wl[k]=0;put(x,y,b.acc);continue}if(!tiles[k]&&!wl[k]&&CARVE.has(T0(x,y-1))&&!T0(x,y+1)&&Rg()<.07){put(x,y,b.acc);if(!T0(x,y+2)&&Rg()<.5)put(x,y+1,b.acc)}}
    if(!floorAir(x,y))continue;const f=Rg();
    if(b.id=='moss'){if(f<.5)put(x,y+1,42);else if(f<.54)put(x,y,63)}
    else if(b.id=='frost'){if(f<.25)put(x,y+1,b.acc)}
    else if(b.id=='reef'){if(f<.3)put(x,y+1,b.acc);else if(f<.36)put(x,y,59)}
    else if(b.id=='ember'){if(f<.3)put(x,y+1,b.acc);else if(f<.37){put(x,y,54);if(!T0(x,y-1)&&Rg()<.5)put(x,y-1,54)}}}
   if(b.id=='reef'){for(let n=0;n<14;n++){for(let t=0;t<40;t++){const x=ri(4,W-4),y=yAt(x);if(!inB(x,y,i)||!floorAir(x,y))continue;let l=x,rr2=x;while(l>2&&x-l<8&&!T0(l-1,y)&&T0(l-1,y+1))l--;while(rr2<W-3&&rr2-x<8&&!T0(rr2+1,y)&&T0(rr2+1,y+1))rr2++;
     if(rr2-l<2)continue;for(let xx=l;xx<=rr2;xx++)wl[y*W+xx]=8;break}}}
   if(b.id=='ember'){for(let y=d0;y<H-3;y++)for(let x=2;x<W-2;x++)if(inB(x,y,i)&&T0(x,y)==b.rock&&Rg()<.012)put(x,y,62)}
   // ore veins
   for(let n=0;n<26;n++){for(let t=0;t<30;t++){let x=ri(3,W-3),y=yAt(x);if(!inB(x,y,i)||T0(x,y)!=b.rock)continue;const len=2+Math.floor(Rg()*3);for(let s=0;s<len;s++){if(inB(x,y,i)&&CARVE.has(T0(x,y)))put(x,y,b.ore);x+=Math.round(Rg()*2-1);y+=Math.round(Rg()*2-1)}break}}});
  // 3. chambers: 3 beacon chambers per biome (one per third of the map), then a letter chamber deep in each biome (biome-word worlds)
  const used=[];const far=(x,y,d)=>used.every(u=>Math.abs(u.x-x)>d||Math.abs(u.y-y)>8);
  function chamber(i,x0,x1,dmin,dmax,hw,hh,minD){const b=lay.bi[i];let best=null;for(let t=0;t<70;t++){const x=ri(x0,x1);if(x<hw+3||x>W-hw-4)continue;const y=S0[x]+TOP+i*BAND+ri(dmin,dmax);if(y>H-5||!far(x,y,minD))continue;
    if(area(x-hw-1,y-hh-1,x+hw+1,y+1,rockish)){best={x,y};break}if(!best&&t>50)best={x,y}}
   if(!best)return null;const{x,y}=best;for(let yy=y-hh;yy<y;yy++)for(let xx=x-hw;xx<=x+hw;xx++){if((yy==y-hh)&&(xx==x-hw||xx==x+hw))continue;const t=T0(xx,yy);if(!t||rockish(t)){put(xx,yy,0);wl[yy*W+xx]=0}}
   for(let xx=x-hw;xx<=x+hw;xx++){const t=T0(xx,y);if(!t||rockish(t))put(xx,y,b.rock)}used.push(best);return best}
  for(let i=0;i<N;i++)for(let j=0;j<NB;j++){const s=(W-16)/NB,c=chamber(i,Math.floor(8+j*s),Math.floor(8+(j+1)*s),6,BAND-4,3,4,10);if(c){const id=i+'-'+j;BEA.push({id,i,j,x:c.x,y:c.y,st:r.lit[id]?'lit':'idle',t:0,ms:[],sp:0,want:0,nx:0})}}
  if(r.bw){LSP=[];for(let i=0;i<N;i++){const c=chamber(i,8,W-8,18,BAND-3,4,4,14);if(c){LCH.push(c);LSP.push((c.y-1)*W+c.x+3)}else LSP.push(-1)}}}
 const letterSpots=(n,cnt)=>ON&&norm(n)==cur&&LSP&&cnt==N?LSP.slice():null;
 // ---- seals: the biome's letter stays sealed (and its warden asleep) until the biome's trial is done
 const sealed=(w,i)=>{if(creative()||!ON||norm(w)!=cur||!(i>=0&&i<N))return false;const r=rec(cur);return !!r.bw&&!r.c[i]};
 let lockT=0;function locks(w,l){if(!l||!sealed(w,l.i))return false;const n=performance.now();if(n-lockT>2400){lockT=n;const b=LAY.bi[l.i],p=prog(l.i);
   try{say('Sealed by the '+b.n+': '+b.bea[2]+' '+p.lit+'/'+p.nb+' '+b.bea[1].toLowerCase()+' · monsters '+p.k+'/'+p.nk+' · '+b.tl[b.ore][0]+' '+p.o+'/'+p.no)}catch(_){}
   try{UI6.say6('SEALED BY THE '+b.n.toUpperCase(),'Finish the biome trial to free the letter',2400)}catch(_){}tone(220,170,.25,'square',.03)}return true}
 function prog(i){const r=rec(cur);return{nb:BEA.filter(q=>q.i==i).length,lit:BEA.filter(q=>q.i==i&&r.lit[q.id]).length,k:Math.min(needK(i),r.k[i]|0),nk:needK(i),o:Math.min(needO(i),r.o[i]|0),no:needO(i),done:!!r.c[i]}}
 // ---- monster strength: base x player level x biome depth x world difficulty (refreshed every two seconds)
 function refresh(){if(!LAY)return;const L=Math.max(1,lvl|0),df=LAY.diff;LAY.bi.forEach((b,i)=>{for(const q of b.mob){const k=q[0],bs=KIND[k].base,d=MK[k];
   d.hp=Math.round(bs.hp*(1+.07*(L-1))*(1+.4*i)*(1+.2*(df-1)));d.dmg=Math.round(bs.dmg*(1+.025*(L-1))*(1+.25*i)*(1+.12*(df-1)));d.gem=Math.round(bs.gem*(1+.5*i)*(1+.15*(df-1)))}})}
 {const _pm=pickMob;pickMob=function(dp){try{if(ON&&!creative()){const i=bandOfDepth(dp);if(i>=0&&R()<.82){const b=LAY.bi[i];return b.mob[R()<.6?0:1][0]}}}catch(_){}return _pm.apply(this,arguments)}}
 // ---- trial progress: kills, ore, beacons
 const income=L=>{try{return ECON14.income(L)}catch(_){return 30+4.5*Math.max(1,L)}};
 function onKill(m){const i=LAY.bi.findIndex(b=>b.mob.some(q=>q[0]==m.k));if(i<0)return;const r=rec(cur);if(r.c[i])return;r.k[i]=(r.k[i]|0)+1;dirty=1;if(r.k[i]==needK(i))try{ft(m.x,m.y-24,'Monsters '+needK(i)+'/'+needK(i)+' ✓','#9affb0')}catch(_){}check(i)}
 function onOre(b){const i=LAY.bi.findIndex(q=>q.ore==b);if(i<0)return;const r=rec(cur);if(r.c[i])return;r.o[i]=(r.o[i]|0)+1;dirty=1;check(i)}
 {const _hm=hurtMob;hurtMob=function(m,d,w,ang){const live=!!m&&m.hp>0&&!m.dead,r=_hm.apply(this,arguments);try{if(live&&ON&&(m.hp<=0||m.dead)&&MK[m.k]&&MK[m.k].bio)onKill(m)}catch(e){if(!BIOME17.e1){BIOME17.e1=1;console.error('BIOME17 kill',e)}}return r}}
 {const _ba=breakAt;breakAt=function(x,y){const inb=x>=0&&y>=0&&x<W&&y<H,k=y*W+x,b=inb?tiles[k]:0,r=_ba.apply(this,arguments);try{if(r&&ON&&b&&ORE.has(b)&&!tiles[k])onOre(b)}catch(_){}return r}}
 {const _sd=spawnDrop;spawnDrop=function(x,y,it,n){if(typeof it=='number'&&DROP[it]!=null)it=DROP[it];return _sd.call(this,x,y,it,n)}}
 function check(i){const r=rec(cur),p=prog(i);if(r.c[i]||p.lit<p.nb||p.k<p.nk||p.o<p.no)return;r.c[i]=1;save();const b=LAY.bi[i],L=Math.max(1,lvl|0),gm=Math.round(4*income(L)),x2=Math.round(.05*xpNeed(L));
  gems+=gm;try{stat('gems',gm)}catch(_){}try{xpGain('fight',x2)}catch(_){}try{const c=CLASS7.cur();if(c)CLASS7.gainXp(c,30+L)}catch(_){}
  let ch='';try{const l=WORD9.letters.find(q=>q.i==i);if(l&&r.bw)ch=l.ch}catch(_){}
  try{const q=REW8;q.celebrate(P.x,P.y+P.h/2,b.c,{d:1.5,s:1,n:26});q.fly(P.x,P.y,gm);q.fan('discover');q.card({kind:'biome',kick:'Biome trial complete',title:b.n,sub:ch?'The seal on "'+ch+'" breaks: its warden awaits':'The biome is yours',gems:gm,xp:x2,tier:2})}catch(_){try{say(b.n+' trial complete! +'+gm+' gems')}catch(__){}}
  tone(523,523,.2,'triangle',.05);tone(659,659,.22,'triangle',.05,.1);tone(784,784,.4,'sine',.05,.2)}
 // world finished: every trial done and the Word Gate solved
 function worldReward(){const r=rec(cur),df=LAY.diff,L=Math.max(1,lvl|0),gm=Math.round(income(L)*(10+6*df)),x2=Math.round((.2+.08*df)*xpNeed(L));r.done=1;save();
  const items=[[262,3],[263,2]];if(df>=2)items.push([264,2]);if(df>=3)items.push([268,1]);if(df>=4)items.push([265,2]);if(df>=5)items.push([269,1],[266,1]);
  gems+=gm;try{stat('gems',gm)}catch(_){}try{xpGain('fight',x2)}catch(_){}try{const c=CLASS7.cur();if(c)CLASS7.gainXp(c,100*df+3*L)}catch(_){}for(const[k,n]of items)try{addI(k,n)}catch(_){}
  try{const q=REW8;q.celebrate(P.x,P.y+P.h/2,'#ffe27a',{d:2,s:1.2,n:40});q.fly(P.x,P.y,gm);q.fan('ach');q.card({kind:'world',kick:'World conquered · '+'★'.repeat(df)+' '+STARS[df],title:label(cur),sub:'All three biomes cleared and the Word Gate opened',gems:gm,xp:x2,items:items.slice(-4),tier:df>=4?4:3,showTier:1})}catch(_){try{say('World conquered! +'+gm+' gems')}catch(__){}}
  try{UI6.say6('WORLD CONQUERED',label(cur)+' · '+'★'.repeat(df),3200)}catch(_){}[523,659,784,1047].forEach((f,i)=>tone(f,f*1.01,.35,'triangle',.06,i*.12))}
 const label=n=>{try{return WORD9.label(n)}catch(_){return n}};
 const rewardFor=(df,L)=>({gems:Math.round(income(L)*(10+6*df)),xp:Math.round((.2+.08*df)*xpNeed(L))});
 // ---- beacons: E (or a hit) next to one wakes a wave of the biome's monsters; beat the wave and the beacon lights
 const nearB=(q,d)=>Math.abs((q.x+.5)*T-P.x)<d&&Math.abs(q.y*T-(P.y+P.h))<T*2.2;
 function spot(q,fly){for(let t=0;t<30;t++){const tx=q.x+Math.round((R()-.5)*12),ty=q.y-1-Math.floor(R()*3);if(tx<2||tx>W-3||ty<2||ty>H-3)continue;if(solidAt(tx,ty)||solidAt(tx,ty-1)||wl[ty*W+tx]>3)continue;if(!fly&&!solidAt(tx,ty+1))continue;return{x:tx*T+T/2,y:ty*T}}
  return{x:(q.x+(R()<.5?-2:2)+.5)*T,y:(q.y-2)*T}}
 function spawnW(q,n){const b=LAY.bi[q.i];for(let j=0;j<n;j++){const k=b.mob[(q.sp+j)%2][0],d=MK[k],sp=spot(q,d.fly),m={k,x:sp.x,y:d.fly?sp.y:sp.y+T-d.h-2,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,fl:0,burn:0,slow:0,ph:R()*6,t:R(),dir:R()<.5?-1:1,fade:0,g:false,wall:0,wv:q.id};
   try{mobs.push(m)}catch(_){}if(!mobs.includes(m))Array.prototype.push.call(mobs,m);q.ms.push(m);try{VFX.burst(m.x,m.y+m.h/2,[b.c,b.l],10,180,1,.5,8)}catch(_){}}q.sp+=n}
 function wake(q){if(q.st!='idle'||rec(cur).lit[q.id])return false;const b=LAY.bi[q.i];q.st='wave';q.t=0;q.ms=[];q.sp=0;q.want=3+q.i+(LAY.diff>=4?1:0);q.nx=3.5;spawnW(q,Math.ceil(q.want/2));refresh();
  try{UI6.say6(b.bea[0].toUpperCase(),'Defeat the wave to '+b.bea[2].toLowerCase()+' it',2200)}catch(_){}try{VFX.wave((q.x+.5)*T,q.y*T,b.c,T*3,.5,1)}catch(_){}tone(196,147,.5,'sawtooth',.04);tone(392,294,.4,'triangle',.03,.1);return true}
 function light(q){const r=rec(cur),b=LAY.bi[q.i];q.st='lit';r.lit[q.id]=1;save();const x=(q.x+.5)*T,y=(q.y-1)*T;
  try{VFX.burst(x,y,[b.c,b.l,'#ffffff'],30,320,1,.9,14);VFX.wave(x,y,b.l,T*2.6,.6,1)}catch(_){}try{ft(x,y-30,b.bea[0]+' '+prog(q.i).lit+'/'+prog(q.i).nb,b.l)}catch(_){}try{gain(8,x,y-44)}catch(_){}
  tone(659,659,.2,'triangle',.05);tone(988,988,.3,'sine',.04,.12);check(q.i)}
 function use(){if(!ON||creative())return false;for(const q of BEA){if(!nearB(q,T*2.4))continue;if(q.st=='idle')return wake(q);if(q.st=='wave'){try{say('Defeat the wave first ('+q.ms.filter(m=>m.hp>0&&!m.dead).length+' left)')}catch(_){}return true}}return false}
 {const _i=interact;interact=function(){try{if(entered&&!dlgOpen&&!showInv&&menuEl.style.display=='none'&&use())return}catch(e){console.error('BIOME17',e)}return _i.apply(this,arguments)}}
 {const _uw=useWeapon;useWeapon=function(){try{if(ON&&entered&&typeof mx!='undefined'){const wx=mx+cam.x,wy=my+cam.y;for(const q of BEA)if(q.st=='idle'&&Math.abs(wx-(q.x+.5)*T)<T*.8&&wy>(q.y-2)*T&&wy<q.y*T&&nearB(q,T*3))wake(q)}}catch(_){}return _uw.apply(this,arguments)}}
 // ---- per frame
 let refT=0,doneT=0,uiT=0,saveT=0;
 function tick(dt){if(!entered||!ON)return;refT-=dt;if(refT<=0){refT=2;refresh()}
  for(const q of BEA){if(q.st!='wave')continue;q.t+=dt;q.nx-=dt;const live=q.ms.filter(m=>m.hp>0&&!m.dead&&mobs.includes(m));
   if(q.sp<q.want&&(q.nx<=0||!live.length)){spawnW(q,q.want-q.sp)}
   else if(q.sp>=q.want&&!live.length)light(q);
   if(Math.abs((q.x+.5)*T-P.x)>T*26||Math.abs(q.y*T-P.y)>T*18){q.st='idle';for(const m of live)m.wv=null;q.ms=[];try{say('The '+LAY.bi[q.i].bea[0].toLowerCase()+' dims... come back and try again')}catch(_){}}}
  doneT-=dt;if(doneT<=0){doneT=.25;const r=rec(cur);if(!r.done&&r.c.every(Boolean)){let ok=0;try{ok=WORD9.state.w[cur]&&WORD9.state.w[cur].ok}catch(_){}if(ok)worldReward()}}
  saveT-=dt;if(saveT<=0){saveT=3;if(dirty)save()}
  uiT-=dt;if(uiT<=0){uiT=.25;panel()}}
 {const _et=evTick;evTick=function(dt){_et(dt);try{tick(dt)}catch(e){if(!BIOME17.e2){BIOME17.e2=1;console.error('BIOME17',e)}}}}
 addEventListener('beforeunload',()=>{if(dirty)save()});
 // ---- world load: theme the depth bands, refresh monsters
 const ord=i=>ROM[i]||String(i+1);
 function hint(i){const b=LAY.bi[i];return b.bea[2]+' '+NB+' '+b.bea[1]+' · defeat '+needK(i)+' monsters · mine '+needO(i)+' '+b.tl[b.ore][0]}
 function theme(){try{if(!ON){DEPTH8.theme(null);return}DEPTH8.theme(LAY.bi.map((b,i)=>({n:b.n,c:b.c,h:hint(i),d0:TOP+i*BAND,d1:i==N-1?999:TOP+(i+1)*BAND,m:b.m,z:'b_'+b.id,
   em:d=>{const p=prog(i);return'Biome '+ord(i)+' of '+ord(N-1)+' · '+d+' m deep · '+(p.done?'trial complete':'trial '+[p.lit>=p.nb,p.k>=p.nk,p.o>=p.no].filter(Boolean).length+'/3')}})))}catch(_){}}
 {const _lw=loadWorld;loadWorld=function(n,e){const r=_lw.apply(this,arguments);try{if(!isWorld(cur)){ON=false;LAY=null;BEA=[]}theme();refresh();shown=null;panel()}catch(err){console.error('BIOME17 load',err)}return r}}
 // ---- HUD panel: the current biome's trial, a pointer to the nearest beacon (or the letter once the trial is done)
 let PE=null,shown=null,html='';
 const ARW=['→','↘','↓','↙','←','↖','↑','↗'],arrow=(dx,dy)=>ARW[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function panel(){if(!PE){PE=document.createElement('div');PE.id='bi17';PE.setAttribute('role','status');PE.style.display='none';document.body.appendChild(PE)}
  let i=-1,d=0;if(ON&&entered&&!creative()){const tx=Math.max(0,Math.min(W-1,P.x/T|0));d=(P.y+P.h/2)/T-sh(tx);i=bandOfDepth(Math.floor(d))}
  const busy=(()=>{try{return menuEl.style.display!='none'||showInv||(typeof CLS9!='undefined'&&CLS9.isOpen())||document.body.classList.contains('c7w-on')}catch(_){return false}})();
  const v=i>=0&&!busy;if(v!==shown){shown=v;PE.style.display=v?'':'none'}if(!v)return;
  const b=LAY.bi[i],p=prog(i),r=rec(cur),row=(ok,t,a,n)=>'<li class="'+(ok?'ok':'')+'"><span>'+esc(t)+'</span><em>'+(ok?'✓':a+'/'+n)+'</em></li>';
  let tgt=null,tn='';if(!p.done){let bd=1e9;for(const q of BEA){if(q.i!=i||r.lit[q.id])continue;const dd=Math.hypot((q.x+.5)*T-P.x,q.y*T-P.y);if(dd<bd){bd=dd;tgt=q}}if(tgt)tn=b.bea[0].toLowerCase()}
  else if(r.bw){try{const l=WORD9.letters.find(q=>q.i==i);const got=((WORD9.state.w[cur]||{}).got||[]).includes(i);if(l&&!got){tgt={x:l.x,y:l.y+1};tn='letter "'+l.ch+'"'}}catch(_){}}
  let nav='';if(tgt){const dx=(tgt.x+.5)*T-P.x,dy=(tgt.y-.5)*T-(P.y+P.h/2);nav='<p class="bi17n"><b>'+arrow(dx,dy)+'</b> Nearest '+esc(tn)+' · '+Math.round(Math.hypot(dx,dy)/T)+' m</p>'}
  const h='<div class="bi17h" style="--bi:'+b.c+'"><i aria-hidden="true"></i><div><small>Biome '+ord(i)+' of '+ord(N-1)+' · <span class="st">'+'★'.repeat(LAY.diff)+'<s>'+'★'.repeat(5-LAY.diff)+'</s></span> '+STARS[LAY.diff]+'</small><b>'+esc(b.n)+'</b></div></div>'
   +(p.done?'<p class="bi17d">Trial complete'+(r.bw?' · the letter\'s warden awaits':'')+'</p>':'<ul>'+row(p.lit>=p.nb,b.bea[2]+' '+p.nb+' '+b.bea[1],p.lit,p.nb)+row(p.k>=p.nk,'Defeat biome monsters',p.k,p.nk)+row(p.o>=p.no,'Mine '+b.tl[b.ore][0],p.o,p.no)+'</ul>')+nav;
  if(h!==html){html=h;PE.innerHTML=h;PE.style.setProperty('--bi',b.c)}}
 // ---- block art: rock, soil, ice, sand, crystal, coral, ash and ore tiles in the biome colours (same finish as the other blocks)
 function paint(b,v){const c=cvs(T,T),x=c.getContext('2d'),t=TILE[b],Rb=rr(b*7919+v*131+17),col=t.c,k=t.s,bi=t.b;
  const gr=x.createLinearGradient(0,0,T,T);gr.addColorStop(0,mixc(col,1.16));gr.addColorStop(1,mixc(col,.74));x.fillStyle=gr;x.fillRect(0,0,T,T);
  const dots=(n,a,b2,s)=>{for(let i=0;i<n;i++){x.fillStyle=Rb()<.5?a:b2;x.fillRect(Rb()*T,Rb()*T,s+Rb()*s,s+Rb()*s)}};
  const crack=(n,c2)=>{x.strokeStyle=c2;x.lineWidth=1.5;for(let i=0;i<n;i++){x.beginPath();let px=Rb()*T,py=Rb()*T;x.moveTo(px,py);for(let j=0;j<3;j++){px+=(Rb()-.5)*16;py+=(Rb()-.5)*16;x.lineTo(px,py)}x.stroke()}};
  if(k=='rock'||k=='ore'){const base=k=='ore'?TILE[bi.rock].c:col;if(k=='ore'){const g2=x.createLinearGradient(0,0,T,T);g2.addColorStop(0,mixc(base,1.16));g2.addColorStop(1,mixc(base,.74));x.fillStyle=g2;x.fillRect(0,0,T,T)}
   dots(26,'rgba(255,255,255,.08)','rgba(0,0,0,.16)',2);crack(2,'rgba(0,0,0,.3)');
   if(bi.id=='moss'){x.fillStyle='#5fbf4a';for(let i=0;i<5;i++){x.beginPath();x.ellipse(Rb()*T,Rb()*8,5+Rb()*6,3+Rb()*3,0,0,TAU);x.fill()}x.fillStyle='rgba(120,220,90,.5)';for(let i=0;i<4;i++){x.beginPath();x.ellipse(Rb()*T,10+Rb()*34,3+Rb()*3,2,0,0,TAU);x.fill()}}
   else if(bi.id=='frost'){x.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<7;i++){const px=Rb()*T,py=Rb()*T;x.fillRect(px-1,py,3,1);x.fillRect(px,py-1,1,3)}x.fillStyle='rgba(230,248,255,.55)';x.fillRect(0,0,T,4)}
   else if(bi.id=='dune'){x.fillStyle='rgba(120,70,30,.22)';for(let yy=6;yy<T;yy+=11)x.fillRect(0,yy+Math.round(Rb()*2),T,3)}
   else if(bi.id=='crystal'){x.fillStyle='rgba(200,160,255,.35)';for(let i=0;i<5;i++){const px=Rb()*T,py=Rb()*T;x.beginPath();x.moveTo(px,py-3);x.lineTo(px+2,py);x.lineTo(px,py+3);x.lineTo(px-2,py);x.closePath();x.fill()}}
   else if(bi.id=='reef'){x.strokeStyle='rgba(220,255,250,.35)';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.arc(Rb()*T,Rb()*T,2+Rb()*2,0,TAU);x.stroke()}}
   else if(bi.id=='ember'){x.strokeStyle='rgba(255,120,40,.6)';x.lineWidth=1.6;for(let i=0;i<2;i++){x.beginPath();let px=Rb()*T,py=Rb()*T;x.moveTo(px,py);for(let j=0;j<3;j++){px+=(Rb()-.5)*14;py+=(Rb()-.5)*14;x.lineTo(px,py)}x.stroke()}}
   if(k=='ore'){for(let i=0;i<5;i++){const cx=7+Rb()*34,cy=7+Rb()*34,r=3.5+Rb()*3.5,g3=x.createRadialGradient(cx-1,cy-1,.5,cx,cy,r+2);g3.addColorStop(0,'#ffffff');g3.addColorStop(.45,col);g3.addColorStop(1,mixc(col,.55));x.fillStyle=g3;
     x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.85,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.85,cy);x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1;x.stroke()}}}
  else if(k=='soil'){dots(30,'rgba(255,230,190,.08)','rgba(0,0,0,.2)',2);x.strokeStyle='rgba(40,25,12,.6)';x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();let px=Rb()*T,py=0;x.moveTo(px,py);for(let j=0;j<4;j++){px+=(Rb()-.5)*12;py+=T/4;x.lineTo(px,py)}x.stroke()}}
  else if(k=='ice'){x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.moveTo(0,0);x.lineTo(T*.6,0);x.lineTo(0,T*.6);x.closePath();x.fill();crack(3,'rgba(255,255,255,.6)');x.fillStyle='rgba(255,255,255,.7)';x.fillRect(8,6,10,3);x.fillRect(6,9,3,7)}
  else if(k=='sand'){dots(60,'rgba(255,250,220,.25)','rgba(120,80,30,.18)',1);x.fillStyle='rgba(255,240,200,.3)';for(let yy=8;yy<T;yy+=12){x.beginPath();x.moveTo(0,yy);x.quadraticCurveTo(T/2,yy-4,T,yy);x.lineTo(T,yy+2);x.quadraticCurveTo(T/2,yy-2,0,yy+2);x.fill()}}
  else if(k=='crys'){x.fillStyle=mixc(TILE[bi.rock].c,.9);x.fillRect(0,0,T,T);dots(16,'rgba(255,255,255,.06)','rgba(0,0,0,.2)',2);
   for(const[cx,h2,w2,a]of[[12,30,9,-.25],[25,40,11,0],[37,26,8,.3]]){x.save();x.translate(cx,T);x.rotate(a);const g3=x.createLinearGradient(-w2,0,w2,0);g3.addColorStop(0,mixc(col,.7));g3.addColorStop(.5,mixc(col,1.35));g3.addColorStop(1,mixc(col,.85));x.fillStyle=g3;
    x.beginPath();x.moveTo(-w2/2,0);x.lineTo(-w2/2,-h2+6);x.lineTo(0,-h2);x.lineTo(w2/2,-h2+6);x.lineTo(w2/2,0);x.closePath();x.fill();x.strokeStyle='rgba(40,20,70,.5)';x.lineWidth=1;x.stroke();x.fillStyle='rgba(255,255,255,.45)';x.fillRect(-w2/2+2,-h2+8,2,h2-12);x.restore()}}
  else if(k=='coral'){dots(14,'rgba(255,255,255,.12)','rgba(120,20,60,.2)',2);x.strokeStyle='rgba(150,40,80,.55)';x.lineWidth=2.2;x.lineCap='round';for(let yy=7;yy<T;yy+=9){x.beginPath();x.moveTo(3,yy);for(let xx=3;xx<T;xx+=6)x.quadraticCurveTo(xx+3,yy+(xx/6%2?4:-4),xx+6,yy);x.stroke()}}
  else if(k=='ash'){dots(30,'rgba(255,255,255,.06)','rgba(0,0,0,.25)',2);for(let i=0;i<5;i++){x.fillStyle='rgba(255,'+(110+Rb()*90|0)+',40,.85)';x.fillRect(Rb()*T,Rb()*T,2,2)}}
  x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=3;x.strokeRect(1.5,1.5,T-3,T-3);x.strokeStyle='rgba(255,255,255,.13)';x.lineWidth=2;x.beginPath();x.moveTo(4,T-5);x.lineTo(4,4);x.lineTo(T-5,4);x.stroke();return c}
 {const _bs=blockSprite;blockSprite=function(b,v){if(TILE[b])return paint(b,v);return _bs.apply(this,arguments)}}
 // ---- monsters: drawn with the classic shapes in the biome colours, plus a biome trim (moss, ice spikes, horns, crystals, shells, flames)
 {const _dv=drawMobV;drawMobV=function(m,now,px,py){const d=MK[m.k];if(!d||!d.bio)return _dv.apply(this,arguments);const k0=m.k,lk=d.look,c0=MK[lk].c;
   try{MK[lk].c=d.c;m.k=lk;_dv.call(this,m,now,px,py)}finally{m.k=k0;MK[lk].c=c0}try{trim(m,d,now,px,py)}catch(e){if(!BIOME17.e3){BIOME17.e3=1;console.error('BIOME17 art',e)}}}}
 function trim(m,d,now,px,py){const b=KIND[m.k].b,t=now/1000+m.ph,top=-m.h*(d.look=='slime'?1.25:d.look=='golem'?1:.95),dir=(m.vx||m.dir||1)<0?-1:1;g.save();g.translate(px,py+m.h);g.globalAlpha=m.fade;g.lineWidth=2;g.strokeStyle=OL;g.lineJoin='round';
  const spike=(x0,y0,w2,h2,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x0-w2,y0);g.lineTo(x0,y0-h2);g.lineTo(x0+w2,y0);g.closePath();g.fill();g.stroke()};
  if(m.k=='b_beetle'){g.fillStyle='#4f9a3e';for(const s of[-1,0,1]){g.beginPath();g.ellipse(s*10,-m.h*.92,7,4,0,0,TAU);g.fill()}spike(dir*m.w*.42,-m.h*.85,4,12,'#d8f0a0')}
  else if(m.k=='b_puff'){g.fillStyle='#e85a6a';g.beginPath();g.ellipse(0,top+2,m.w*.5,9,0,Math.PI,0);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';for(const s of[-.25,.15,.38])g.fillRect(s*m.w-2,top-4,4,3)}
  else if(m.k=='b_fslime'){for(const[s,h2]of[[-9,12],[0,17],[9,11]])spike(s,top+4,5,h2,'#e6faff')}
  else if(m.k=='b_wisp'){g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const a=t*2+i*TAU/4;g.fillStyle='rgba(220,245,255,.85)';const sx=Math.cos(a)*m.w*.7,sy=-m.h*.55+Math.sin(a)*8;g.fillRect(sx-1,sy-4,2,8);g.fillRect(sx-4,sy-1,8,2)}g.globalCompositeOperation='source-over'}
  else if(m.k=='b_scarab'){g.fillStyle='#ffd27a';g.fillRect(-m.w*.4,-m.h*.62,m.w*.8,3);spike(dir*m.w*.4,-m.h*.85,3.5,13,'#8a5a1a')}
  else if(m.k=='b_dust'){g.strokeStyle='rgba(240,210,150,.7)';g.lineWidth=2;for(let i=0;i<2;i++){g.beginPath();g.ellipse(0,-m.h*.25-i*12,m.w*(.6+i*.15),5,0,t*3+i,t*3+i+4.2);g.stroke()}}
  else if(m.k=='b_cgolem'){for(const s of[-1,1]){spike(s*m.w*.45,-m.h*.8,5,15,'#e6d0ff');spike(s*m.w*.3,-m.h*.82,4,10,'#c8a8ff')}}
  else if(m.k=='b_sprite'){g.globalCompositeOperation='lighter';const cy=-m.h/2;g.fillStyle='rgba(240,220,255,.9)';g.beginPath();g.moveTo(0,cy-7);g.lineTo(5,cy);g.lineTo(0,cy+7);g.lineTo(-5,cy);g.closePath();g.fill();g.globalCompositeOperation='source-over'}
  else if(m.k=='b_crab'){g.fillStyle='#fff6f0';g.beginPath();g.arc(-6,-m.h*.85,4,0,TAU);g.fill();g.stroke();g.fillStyle='#ffd0e0';g.beginPath();g.arc(7,-m.h*.8,3,0,TAU);g.fill();g.stroke()}
  else if(m.k=='b_jelly'){g.strokeStyle='rgba(255,170,230,.85)';g.lineWidth=2.4;g.lineCap='round';for(let i=0;i<4;i++){const sx=(i-1.5)*7;g.beginPath();g.moveTo(sx,-4);g.quadraticCurveTo(sx+Math.sin(t*4+i)*5,8,sx+Math.sin(t*3+i)*3,16);g.stroke()}}
  else if(m.k=='b_toad'){g.fillStyle='#ffb040';for(const[sx,sy]of[[-.3,.7],[.25,.85],[.05,.5]]){g.beginPath();g.arc(sx*m.w,-sy*m.h,3,0,TAU);g.fill()}}
  else if(m.k=='b_fmoth'){g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const fh=8+Math.sin(t*12+i*2)*3;g.fillStyle=i%2?'rgba(255,150,50,.8)':'rgba(255,210,90,.8)';g.beginPath();g.ellipse(-dir*(6+i*5),-m.h*.5+i*2,3,fh/2,0,0,TAU);g.fill()}g.globalCompositeOperation='source-over'}
  g.restore()}
 // ---- beacon art: the body in the world layer (lit beacons also light the cave), the glow, wave ring and prompt after the lighting
 const vis=q=>{const x=(q.x+.5)*T-cam.x,y=q.y*T-cam.y,vw=cv.width/ZM,vh=cv.height/ZM;return x>-T*2&&y>-T*3&&x<vw+T*2&&y<vh+T*2};
 function body(q,x,y,t){const b=LAY.bi[q.i],on=q.st=='lit',wv=q.st=='wave',dim=(a,k)=>{try{return MYART.mix(a,'#6a6478',k)}catch(_){return '#7a7488'}},c=on||wv?b.c:dim(b.c,.55),l=on?b.l:dim(b.l,.5),pulse=wv?.5+.5*Math.sin(t*8):on?1:0,ty=b.bea[3];g.save();g.translate(x,y);g.scale(1.35,1.35);g.lineJoin='round';g.lineWidth=2;g.strokeStyle=OL;
  const ped=(w2,h2,cl)=>{g.fillStyle=cl;g.beginPath();g.roundRect(-w2/2,-h2,w2,h2,3);g.fill();g.stroke()};
  if(ty=='totem'){ped(18,40,'#6a5a48');g.fillStyle='#4a3e30';g.fillRect(-9,-28,18,3);g.fillRect(-9,-16,18,3);g.fillStyle=c;g.beginPath();g.ellipse(0,-42,17,9,0,Math.PI,0);g.closePath();g.fill();g.stroke();g.fillStyle=l;for(const s of[-8,0,8])g.fillRect(s-2,-47,4,3)}
  else if(ty=='lantern'){ped(6,62,'#4a5468');g.fillRect(-2,-62,14,3);g.fillStyle='#3a4458';g.beginPath();g.roundRect(4,-58,16,22,4);g.fill();g.stroke();g.fillStyle=on||wv?l:'#5a6478';g.globalAlpha=.6+.4*pulse;g.fillRect(7,-54,10,14);g.globalAlpha=1}
  else if(ty=='obelisk'){g.fillStyle='#c8a46a';g.beginPath();g.moveTo(-10,0);g.lineTo(-6,-54);g.lineTo(0,-62);g.lineTo(6,-54);g.lineTo(10,0);g.closePath();g.fill();g.stroke();g.fillStyle=c;g.beginPath();g.arc(0,-40,6,0,TAU);g.fill();g.stroke()}
  else if(ty=='prism'){ped(22,14,'#4e3e66');g.save();g.translate(0,-36+Math.sin(t*2)*3);g.rotate(on?t*.8:0);g.fillStyle=c;g.beginPath();g.moveTo(0,-14);g.lineTo(9,0);g.lineTo(0,14);g.lineTo(-9,0);g.closePath();g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(-2,-9,3,10);g.restore()}
  else if(ty=='shell'){ped(20,12,'#3e6a6a');g.fillStyle=on||wv?'#ffd8e8':'#a89cb0';g.beginPath();g.moveTo(-16,-12);g.quadraticCurveTo(0,-46,16,-12);g.closePath();g.fill();g.stroke();g.strokeStyle='rgba(120,60,90,.5)';for(const s of[-8,0,8]){g.beginPath();g.moveTo(0,-13);g.lineTo(s,-36);g.stroke()}g.strokeStyle=OL;g.fillStyle=c;g.beginPath();g.arc(0,-16,5,0,TAU);g.fill();g.stroke()}
  else{g.strokeStyle='#3a2a26';g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(s*12,0);g.lineTo(s*4,-26);g.stroke()}g.lineWidth=2;g.strokeStyle=OL;g.fillStyle='#4a3a36';g.beginPath();g.moveTo(-15,-30);g.lineTo(15,-30);g.lineTo(9,-22);g.lineTo(-9,-22);g.closePath();g.fill();g.stroke()
   if(on||wv)for(let i=0;i<4;i++){const fh=14+Math.sin(t*10+i*1.7)*5;g.fillStyle=i%2?b.c:b.l;g.beginPath();g.moveTo(-12+i*8-5,-30);g.quadraticCurveTo(-12+i*8,-30-fh,-12+i*8+1,-32-fh);g.quadraticCurveTo(-12+i*8+3,-30-fh*.5,-12+i*8+5,-30);g.closePath();g.fill()}}
  g.restore()}
 {const _dw=drawWater;drawWater=function(x0,x1,y0,y1,now){const r=_dw.apply(this,arguments);try{if(ON&&BEA.length){const t=now/1000;for(const q of BEA){if(!vis(q))continue;const x=(q.x+.5)*T-cam.x,y=q.y*T-cam.y;body(q,x,y,t);try{lampL.push(x,y-T)}catch(_){}}}}catch(e){if(!BIOME17.e4){BIOME17.e4=1;console.error('BIOME17 beacon',e)}}return r}}
 let GL=null;const glow=()=>GL||(GL=(()=>{const c=cvs(96,96),x=c.getContext('2d'),gr=x.createRadialGradient(48,48,2,48,48,48);gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,96,96);return c})());
 function over(g2,cx,cy){if(!ON||!entered)return;const t=performance.now()/1000;for(const q of BEA){if(!vis(q))continue;const b=LAY.bi[q.i],x=(q.x+.5)*T-cx,y=q.y*T-cy;
   {g2.save();g2.globalCompositeOperation='lighter';g2.globalAlpha=q.st=='lit'?.55:q.st=='wave'?.35+.25*Math.sin(t*8):.12+.06*Math.sin(t*2+q.x);g2.drawImage(glow(),x-60,y-T*1.4-60,120,120);g2.restore();
    }
   if(q.st=='wave'){g2.save();g2.strokeStyle=b.c;g2.globalAlpha=.6;g2.lineWidth=2;g2.setLineDash([6,5]);g2.lineDashOffset=-t*20;g2.beginPath();g2.ellipse(x,y-4,T*2.6,T*.5,0,0,TAU);g2.stroke();g2.restore()}
   if(q.st=='idle'&&nearB(q,T*2.4)){g2.save();g2.font="800 12px Montserrat,'Segoe UI',sans-serif";g2.textAlign='center';const s='E · '+b.bea[2]+' the '+b.bea[0],w2=g2.measureText(s).width+16;g2.fillStyle='rgba(16,12,28,.82)';g2.beginPath();g2.roundRect(x-w2/2,y-T*1.9-12,w2,20,10);g2.fill();g2.fillStyle=b.l;g2.fillText(s,x,y-T*1.9+2);g2.restore()}}}
 {const _d=BOSS6.drawProj;BOSS6.drawProj=function(g2,cx,cy){_d.call(this,g2,cx,cy);try{over(g2,cx,cy)}catch(e){if(!BIOME17.e5){BIOME17.e5=1;console.error('BIOME17 over',e)}}}}
 return{BI,BAND,TOP,N,WORDS3,layout,wordOf,letterSpots,shape,locks,sealed,prog,rec,needK,needO,bandOfDepth,refresh,rewardFor,wake,use,
  get on(){return ON},get lay(){return LAY},get beacons(){return BEA.map(q=>({id:q.id,i:q.i,x:q.x,y:q.y,st:q.st,want:q.want,live:q.ms.filter(m=>m.hp>0&&!m.dead).length}))},get chambers(){return LCH.slice()},get state(){return S},
  // tests / creative tools: finish a biome's trial parts at once
  finish(i){if(!ON)return false;const r=rec(cur);for(const q of BEA)if(q.i==i){r.lit[q.id]=1;q.st='lit'}r.k[i]=needK(i);r.o[i]=needO(i);check(i);return !!r.c[i]},
  clearAll(){if(!ON)return;for(let i=0;i<N;i++){const r=rec(cur);for(const q of BEA)if(q.i==i){r.lit[q.id]=1;q.st='lit'}r.k[i]=needK(i);r.o[i]=needO(i);r.c[i]=1}save()},TILE,ORE,DROP}})();
