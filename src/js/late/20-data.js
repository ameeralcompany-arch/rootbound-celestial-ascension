// ===== V6 data: everything tunable lives here (wings, nameplates, auras, quality presets) =====
const CEL_VER=1;
// Wing tiers. `lvl` = level required. pal = [deep, mid, light, glow]. Art direction taken from the supplied references
// (white/blue crystal wings; violet feathered wings) - these are procedurally painted, NOT copies of those images.
const WINGS=[
 {id:'celestial',n:'Celestial Wings',lvl:10,rows:3,fe:7,span:1.0,pal:['#7e86b8','#cfd8ff','#ffffff','#bcd4ff'],crys:2,sp:'#ffffff',d:'Pearl-white feathers with the first crystal roots.'},
 {id:'frost',n:'Frost Crystal Wings',lvl:30,rows:3,fe:8,span:1.08,pal:['#3a7fc0','#9fd8ff','#f2fbff','#7fd0ff'],crys:4,sp:'#c8f0ff',d:'Ice-blue feathers fused with frozen crystal.'},
 {id:'silver',n:'Radiant Silver Wings',lvl:50,rows:4,fe:9,span:1.16,pal:['#7d8798','#dfe5f0','#ffffff','#fff3c8'],crys:5,sp:'#fff7d6',d:'Mirror-silver plumage that throws light.'},
 {id:'astral',n:'Astral Storm Wings',lvl:75,rows:4,fe:10,span:1.26,pal:['#2b2a7a','#6a63ff','#c9d1ff','#78c8ff'],crys:6,sp:'#9fe0ff',d:'Storm-indigo feathers crackling with starlight.',arc:1},
 {id:'eclipse',n:'Eclipse Wings',lvl:100,rows:4,fe:11,span:1.36,pal:['#0c0714','#4b2a86','#b58cff','#ffd36a'],crys:7,sp:'#ffd98a',d:'Void-black feathers edged by a golden corona.',corona:1},
 {id:'ascendant',n:'Ascendant Celestial Wings',lvl:125,rows:5,fe:11,span:1.48,pal:['#c9a45a','#fff0c0','#ffffff','#ffe9a0'],crys:8,sp:'#fff4c4',d:'White-gold wings crowned by a radiant halo.',halo:1},
 {id:'cosmic',n:'Mythic Cosmic Wings',lvl:150,rows:5,fe:12,span:1.62,pal:['#2a1060','#c05cff','#7ff0ff','#ff9be8'],crys:10,sp:'#ffffff',d:'A living nebula folded into feathers.',nebula:1,halo:1}
];
// Nameplates: a new tier every 15 levels. Names beyond the table continue automatically.
const NP_NAMES=['Wanderer','Initiate','Pathfinder','Warden','Vanguard','Crystal Knight','Astral Sentinel','Eclipse Champion','Ascendant Paragon','Cosmic Overlord','Celestial Sovereign','Void Monarch','Starforged Regent','Eternal Ascendant'];
const NP_STEP=15;
const npTier=l=>Math.max(0,Math.floor(Math.max(1,l|0)/NP_STEP));
const npName=t=>t<NP_NAMES.length?NP_NAMES[t]:NP_NAMES[NP_NAMES.length-1]+' '+['II','III','IV','V','VI','VII','VIII','IX','X'][Math.min(8,t-NP_NAMES.length)];
const npRange=t=>t==0?[1,NP_STEP-1]:[t*NP_STEP,t*NP_STEP+NP_STEP-1];
// frame style per tier (drawn procedurally; look inspired by the ornate banner + thorn-frame references)
const NP_STYLE=t=>t<2?{k:'plain',a:'#6d7a99',b:'#262c44',g:'#aab6d8'}:t<4?{k:'scroll',a:'#b98a4e',b:'#2b1d14',g:'#f0c98a'}:t<6?{k:'crystal',a:'#8fb8ff',b:'#14213f',g:'#cfe4ff'}:t<8?{k:'rose',a:'#d9b46a',b:'#2a0d14',g:'#ff5a6e'}:t<10?{k:'wing',a:'#fff0c0',b:'#241c0c',g:'#ffe9a0'}:t<12?{k:'thorn',a:'#b58cff',b:'#0a0610',g:'#9a6bff'}:{k:'cosmic',a:'#7ff0ff',b:'#14082e',g:'#ff9be8'};
// Aura = ground magic circle. Unlock by level (references: violet sigil circle, golden winged-sigil circle).
const AURAS=[
 {id:'none',n:'None',lvl:1,c:'#fff'},
 {id:'sigil',n:'Violet Sigil',lvl:20,c:'#a46bff',c2:'#e3ccff',pts:5},
 {id:'frost',n:'Frost Mandala',lvl:45,c:'#7fd0ff',c2:'#eaf8ff',pts:6},
 {id:'solar',n:'Golden Seraph Ring',lvl:80,c:'#ffd24a',c2:'#fff4c4',pts:8,wing:1},
 {id:'eclipse',n:'Eclipse Rune',lvl:110,c:'#c05cff',c2:'#ffd36a',pts:7},
 {id:'cosmos',n:'Cosmic Orrery',lvl:140,c:'#7ff0ff',c2:'#ff9be8',pts:9}
];
// Appearance options (all masculine-leaning anime styles; colours are free)
const AP={hair:['Spiky swept','Long tail','Side-parted','Wild layered','Undercut','Windblown','Short crop','Shoulder length'],
 eyes:['Sharp','Calm','Fierce','Round'],outfit:['Wanderer coat','Knight tunic','Mage robe','Rogue jacket','Scholar vest','Ronin haori'],
 acc:['None','Scarf','Earring','Mask (lower)','Headband','Shoulder mantle'],cape:['None','Short cape','Long cape'],
 eyeCol:['#35c9c0','#6aa8ff','#ffb347','#d25cff','#ff5a6e','#7dff8a','#e8e8ff']};
// Quality presets. Every cost-driving system reads these - nothing is hard-coded elsewhere.
const QPRE=[
 {id:'low',n:'Low',rsc:.7,vfx:.35,cap:350,part:.45,bloom:0,par:1,shadow:0,wx:.35,wfx:0,feat:0,grade:0,cine:0,hd:0,fps:30},
 {id:'med',n:'Medium',rsc:.85,vfx:.65,cap:700,part:.7,bloom:0,par:2,shadow:1,wx:.6,wfx:1,feat:1,grade:1,cine:0,hd:0,fps:60},
 {id:'high',n:'High',rsc:1,vfx:1,cap:1200,part:1,bloom:1,par:3,shadow:1,wx:1,wfx:2,feat:2,grade:1,cine:0,hd:1,fps:60},
 {id:'ultra',n:'Ultra',rsc:1,vfx:1.25,cap:1800,part:1.3,bloom:2,par:4,shadow:2,wx:1.3,wfx:3,feat:3,grade:2,cine:0,hd:1,fps:60},
 {id:'cine',n:'Cinematic',rsc:1.25,vfx:1.5,cap:2600,part:1.6,bloom:2,par:5,shadow:2,wx:1.6,wfx:3,feat:3,grade:2,cine:1,hd:1,fps:60}];
const WX_STATES=['clear','cloudy','fog','drizzle','rain','storm','snow','blizzard','windy','aurora','starfall','crystal'];
const WX_NAMES={clear:'Clear',cloudy:'Overcast',fog:'Fog',drizzle:'Drizzle',rain:'Rain',storm:'Thunderstorm',snow:'Snowfall',blizzard:'Blizzard',windy:'High Wind',aurora:'Aurora',starfall:'Starfall',crystal:'Crystal Mist'};

// ---- celestial state, saved per account under key "rbc" (namespaced by the profile layer)
const cel={v:CEL_VER,wing:'auto',wingsOn:1,aura:'auto',auraOn:1,plate:'auto',ap:{hair:0,eyes:0,outfit:0,acc:0,cape:1,eyeCol:0,hairCol:'#3a2a3a',skinCol:'#f1c9a0',outCol:'#2d3f6b',trimCol:'#d9b46a'},
 seenW:0,seenNp:0,opt:{qp:'auto',vfx:1,reduce:0,ui:1,bloom:1,wxOn:1,fpsShow:0,cine:0},tut:0};
function celSave(){try{localStorage.setItem('rbc',JSON.stringify(cel))}catch(_){}}
function celLoad(){let o=null;try{o=JSON.parse(localStorage.getItem('rbc')||'null')}catch(_){}if(!o||typeof o!='object')return;
 const n=(v,d,lo,hi)=>{v=+v;return isFinite(v)?Math.max(lo,Math.min(hi,v|0)):d},col=(v,d)=>/^#[0-9a-f]{6}$/i.test(v)?v:d;
 cel.wing=WINGS.some(w=>w.id==o.wing)||o.wing=='auto'?o.wing:'auto';cel.wingsOn=o.wingsOn?1:0;cel.aura=AURAS.some(a=>a.id==o.aura)||o.aura=='auto'?o.aura:'auto';cel.auraOn=o.auraOn==0?0:1;
 cel.plate=o.plate=='auto'?'auto':n(o.plate,'auto',0,99);cel.seenW=n(o.seenW,0,0,99);cel.seenNp=n(o.seenNp,0,0,999);cel.tut=n(o.tut,0,0,9);
 const a=o.ap||{},A=cel.ap;A.hair=n(a.hair,0,0,AP.hair.length-1);A.eyes=n(a.eyes,0,0,AP.eyes.length-1);A.outfit=n(a.outfit,0,0,AP.outfit.length-1);A.acc=n(a.acc,0,0,AP.acc.length-1);A.cape=n(a.cape,1,0,AP.cape.length-1);A.eyeCol=n(a.eyeCol,0,0,AP.eyeCol.length-1);
 A.hairCol=col(a.hairCol,A.hairCol);A.skinCol=col(a.skinCol,A.skinCol);A.outCol=col(a.outCol,A.outCol);A.trimCol=col(a.trimCol,A.trimCol);
 const p=o.opt||{};cel.opt.qp=['auto','low','med','high','ultra','cine'].includes(p.qp)?p.qp:'auto';cel.opt.vfx=Math.max(0,Math.min(1.5,+p.vfx>=0?+p.vfx:1));cel.opt.reduce=p.reduce?1:0;cel.opt.ui=Math.max(.8,Math.min(1.4,+p.ui||1));cel.opt.bloom=p.bloom==0?0:1;cel.opt.wxOn=p.wxOn==0?0:1;cel.opt.fpsShow=p.fpsShow?1:0;cel.opt.cine=p.cine?1:0}
// ---- derived progression (single source of truth: character level)
const wingUnlocked=(l)=>WINGS.filter(w=>l>=w.lvl);
const bestWing=l=>{const u=wingUnlocked(l);return u.length?u[u.length-1]:null};
function curWing(l){if(!cel.wingsOn)return null;if(cel.wing!='auto'){const w=WINGS.find(x=>x.id==cel.wing);if(w&&l>=w.lvl)return w}return bestWing(l)}
function curAura(l){if(!cel.auraOn)return AURAS[0];if(cel.aura!='auto'){const a=AURAS.find(x=>x.id==cel.aura);if(a&&l>=a.lvl)return a}const u=AURAS.filter(a=>l>=a.lvl);return u[u.length-1]}
const curPlateTier=l=>{const t=npTier(l);return cel.plate=='auto'?t:Math.min(t,cel.plate|0)};
celLoad();
// validation for cosmetic data received from other players (host and clients both run this)
function cleanCx(c){if(!c||typeof c!='object')return null;const n=(v,lo,hi,d)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,v|0)):d},col=(v,d)=>typeof v=='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:d,a=c.ap||{},A=cel.ap;
 return{w:n(c.w,-1,WINGS.length-1,-1),a:n(c.a,0,AURAS.length-1,0),t:n(c.t,0,999,0),ap:{hair:n(a.hair,0,AP.hair.length-1,0),eyes:n(a.eyes,0,AP.eyes.length-1,0),outfit:n(a.outfit,0,AP.outfit.length-1,0),acc:n(a.acc,0,AP.acc.length-1,0),cape:n(a.cape,0,AP.cape.length-1,1),eyeCol:n(a.eyeCol,0,AP.eyeCol.length-1,0),hairCol:col(a.hairCol,'#3a2a3a'),skinCol:col(a.skinCol,'#f1c9a0'),outCol:col(a.outCol,'#2d3f6b'),trimCol:col(a.trimCol,'#d9b46a')}}}
