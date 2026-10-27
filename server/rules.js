'use strict';
// Server-side port of the game's validation rules. The client is NOT trusted: every world change is re-validated here.
const W=100,H=64,MAXBLK=66;
const ODEF={20:{cat:'door',d:'Oak Door'},21:{cat:'door',d:'Stone Gate'},22:{cat:'door',d:'Steel Hatch'},23:{cat:'door',d:'Magic Portal'},24:{cat:'door',d:'Neon Gate'},25:{cat:'door',d:'Starlit Gate'},26:{cat:'door',d:'Sealed Gate',special:1},
 27:{cat:'cont',k:'chest',d:'Treasure Chest'},28:{cat:'misc',k:'sign',d:'Signpost'},29:{cat:'light',k:'lamp',d:'Lantern'},30:{cat:'dev',k:'switch',d:'Lever'},31:{cat:'dev',k:'plate',d:'Pressure Plate'},32:{cat:'tele',k:'tele',d:'Teleport Pad'},
 33:{cat:'station',d:'Crafting Table'},34:{cat:'cont',k:'crate',d:'Storage Crate'},35:{cat:'misc',d:'Training Dummy'},36:{cat:'misc',k:'waystone',d:'Waystone'},37:{cat:'deco',d:'Bench'},38:{cat:'deco',d:'Banner'},
 39:{cat:'wx',k:'wx_blossom',d:'Blossom Weather Machine',wx:'blossom'},40:{cat:'wx',k:'wx_space',d:'Space Weather Machine',wx:'space'},41:{cat:'wx',k:'wx_galaxy',d:'Galaxy Weather Machine',wx:'galaxy'}};
const WEATHERS=['default','blossom','space','galaxy'];
const isObjId=b=>b>=20&&b<=41&&!!ODEF[b];
const ROLE={BAN:-1,VIS:0,TRUST:1,BUILD:2,OWN:3};
const i32=Number.isInteger;
function validEdit(d){if(!d||!i32(d.k)||d.k<0||d.k>=W*H||!Array.isArray(d.a)||d.a.length<4)return false;const a=d.a;if(!i32(a[0])||a[0]<0||a[0]>MAXBLK)return false;if(a[1]){if(!i32(a[1])||!i32(a[2])||a[1]<1||a[1]>16||a[2]<1||a[2]>16||!isFinite(+a[3]))return false}return true}
const id16=v=>String(v||'').slice(0,16).replace(/[^a-z0-9]/gi,'');
function cleanMeta(m){if(m===null)return null;if(!m||typeof m!='object')return undefined;const x=m.x|0,y=m.y|0;if(x<1||x>=W-1||y<1||y>=H-1)return undefined;
 return{x,y,o:id16(m.o),on:String(m.on||'Player').slice(0,14),f:Array.isArray(m.f)?m.f.slice(0,32).map(id16).filter(Boolean):[],pub:m.pub?1:0,t:Array.isArray(m.t)?m.t.slice(0,32).map(id16).filter(Boolean):[],b:Array.isArray(m.b)?m.b.slice(0,32).map(id16).filter(Boolean):[],pr:m.pr?1:0,d:String(m.d||'').slice(0,80).replace(/[<>]/g,''),sp:(m.sp&&(m.sp.x|0)>=1&&(m.sp.x|0)<W-1&&(m.sp.y|0)>=1&&(m.sp.y|0)<H-1)?{x:m.sp.x|0,y:m.sp.y|0}:null}}
function roleOf(meta,uid){if(!meta)return ROLE.OWN;if(meta.b&&meta.b.includes(uid))return ROLE.BAN;if(meta.o==uid)return ROLE.OWN;if((meta.f||[]).includes(uid)||meta.pub)return ROLE.BUILD;if((meta.t||[]).includes(uid))return ROLE.TRUST;return ROLE.VIS}
function objDefaults(t){const d=ODEF[t];if(!d)return null;const c={};
 if(d.cat=='door')Object.assign(c,{nm:d.d,dt:'w',d:'plaza',lb:'',ac:0,kr:d.special?1:0,kc:d.special?1:0,lv:0,sw:0});else if(d.cat=='cont')Object.assign(c,{it:[],ac:2,dp:2,nm:d.d});
 else if(d.k=='sign')c.tx='Welcome!';else if(d.k=='tele')Object.assign(c,{lb:'A',ac:0});else if(d.k=='waystone')c.nm='Waystone';else if(d.k=='lamp')c.on=1;else if(d.cat=='wx')Object.assign(c,{ac:2});
 return{t:t,c:c,s:{}}}
function cleanObj(o){if(!o||typeof o!='object')return null;const t=o.t|0;if(!ODEF[t])return null;const d=ODEF[t],i=(v,lo,hi,df)=>{v=+v;return Number.isFinite(v)?Math.max(lo,Math.min(hi,v|0)):df},s=(v,n)=>String(v==null?'':v).slice(0,n).replace(/[<>]/g,''),c=o.c&&typeof o.c=='object'?o.c:{},r=objDefaults(t);
 if(d.cat=='door'){const w=String(c.d||'plaza').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);Object.assign(r.c,{nm:s(c.nm||d.d,16),dt:['w','s','l'].includes(c.dt)?c.dt:'w',d:w||'plaza',lb:s(c.lb,12).replace(/[^A-Za-z0-9_ -]/g,''),ac:i(c.ac,0,3,0),kr:c.kr?1:0,kc:c.kc?1:0,lv:i(c.lv,0,999,0),sw:c.sw?1:0})}
 else if(d.cat=='cont'){r.c.nm=s(c.nm||d.d,16);r.c.ac=i(c.ac,0,3,2);r.c.dp=i(c.dp,0,3,2);r.c.it=(Array.isArray(c.it)?c.it:[]).slice(0,12).map(x=>Array.isArray(x)?[i(x[0],1,999,0),i(x[1],1,9999,0)]:null).filter(x=>x&&x[0]&&x[1])}
 else if(d.k=='sign')r.c.tx=s(c.tx,80);else if(d.k=='tele'){r.c.lb=s(c.lb,12).replace(/[^A-Za-z0-9_ -]/g,'');r.c.ac=i(c.ac,0,3,0)}else if(d.k=='waystone')r.c.nm=s(c.nm,16);else if(d.k=='lamp')r.c.on=c.on?1:0;else if(d.cat=='wx')r.c.ac=i(c.ac,0,3,2);
 const st=o.s&&typeof o.s=='object'?o.s:{};r.s={on:st.on?1:0};return r}
function cleanObjMap(e){const out={};if(!e||typeof e!='object')return out;let n=0;for(const k of Object.keys(e)){if(++n>1500)break;const kk=+k;if(!i32(kk)||kk<0||kk>=W*H)continue;const o=cleanObj(e[k]);if(o)out[kk]=o}return out}
const need=o=>{const d=ODEF[o.t];return d.cat=='door'||d.cat=='tele'||d.cat=='cont'||d.cat=='wx'?o.c.ac|0:d.k=='lamp'||d.k=='switch'?ROLE.TRUST:ROLE.VIS};
const canUse=(meta,o,uid)=>{const r=roleOf(meta,uid);return r>ROLE.BAN&&r>=need(o)||!meta};
const canConfig=(meta,uid)=>{const r=roleOf(meta,uid);return r>=ROLE.BUILD||!meta};
const tileAt=(world,k)=>{const a=world.edits[k];return a?a[0]:0};
// world: {edits, meta, objs}
function applyEdit(world,k,a){world.edits[k]=a;const b=a[0];if(isObjId(b)){if(!world.objs[k]||world.objs[k].t!=b)world.objs[k]=objDefaults(b)}else if(world.objs[k])delete world.objs[k]}
function checkEdit(world,d,uid){if(!validEdit(d))return false;const meta=world.meta;if(meta&&!(meta.o==uid||meta.pub||(meta.f||[]).includes(uid)))return false;if(meta&&meta.b&&meta.b.includes(uid))return false;if(meta&&d.k==meta.y*W+meta.x&&d.a[0]!=17&&meta.o!=uid)return false;return true}
function checkMeta(world,d,uid){const v=cleanMeta(d);if(v===undefined)return false;if(world.meta)return world.meta.o==uid&&(v===null||v.o==world.meta.o)?{v}:false;return v!==null&&uid!==''&&v.o==uid?{v}:false}
// object ops: returns {bcast:[msgs], reply:[msgs], changed} or false
function objOp(world,d,uid,weatherCb){if(!d||typeof d!='object'||typeof d.op!='string')return false;const k=d.k|0;if(!(k>=0&&k<W*H))return false;const t=tileAt(world,k);if(!isObjId(t))return false;let o=world.objs[k];if(!o)o=world.objs[k]=objDefaults(t);const meta=world.meta;
 if(d.op=='cfg'){if(!canConfig(meta,uid))return false;const v=cleanObj(d.v);if(!v||v.t!=t)return false;if(ODEF[v.t].cat=='cont')v.c.it=o.c.it;world.objs[k]=v;return{bcast:[{op:'cfg',k,v}],changed:1}}
 if(d.op=='st'){if(!canUse(meta,o,uid))return false;const s=d.s&&typeof d.s=='object'?d.s:{};const df=ODEF[o.t];if(df.k=='lamp'||df.k=='switch'){o.s.on=s.on?1:0;if(df.k=='lamp')o.c.on=o.s.on}return{bcast:[{op:'st',k,s:{on:o.s.on,open:s.open?1:0},by:uid}],changed:1}}
 if(d.op=='wx'){const df=ODEF[o.t];if(df.cat!='wx'||!canUse(meta,o,uid))return false;if(d.reset){if(!canConfig(meta,uid))return false;return{weather:'default',k}}return{weather:df.wx,k}}
 if(d.op=='take'||d.op=='put'){const df=ODEF[o.t];if(df.cat!='cont')return false;const rid=String(d.rid||'').slice(0,12),it=d.i|0,n=d.n|0;if(n<1||n>9999||it<1||it>999)return false;const res=(ok,m,extra)=>Object.assign({op:'res',k,rid,by:uid,ok:ok?1:0,m},extra||{});
  if(d.op=='take'){if(!canUse(meta,o,uid))return{reply:[res(0,'No permission')]};const slot=o.c.it.find(x=>x[0]==it);if(!slot||slot[1]<n)return{reply:[res(0,'Not there anymore')]};slot[1]-=n;o.c.it=o.c.it.filter(x=>x[1]>0)}
  else{if(roleOf(meta,uid)<(o.c.dp|0)&&meta)return{reply:[res(0,'No permission')]};if(o.c.it.length>=12&&!o.c.it.find(x=>x[0]==it))return{reply:[res(0,'Chest is full')]};const slot=o.c.it.find(x=>x[0]==it);if(slot)slot[1]=Math.min(9999,slot[1]+n);else o.c.it.push([it,n])}
  return{bcast:[res(1,undefined,{mode:d.op,i:it,n,v:o})],changed:1}}
 return false}
function cleanPres(d,allowWpn){const o={};if(!d||typeof d!='object')return o;const num=(v,a,b)=>{v=+v;return isFinite(v)?Math.max(a,Math.min(b,v)):0},str=(v,n)=>String(v==null?'':v).slice(0,n);
 o.x=num(d.x,-1e5,1e5);o.y=num(d.y,-1e5,1e5);o.f=d.f>0?1:-1;o.h=num(d.h,0,360);o.vx=num(d.vx,-2000,2000);o.wp=str(d.wp,20).replace(/[^a-z0-9_]/gi,'')||'fist';o.sw=d.sw?1:0;o.fm=d.fm?1:0;o.lv=num(d.lv,0,999)|0;o.wo=d.wo==null?.1:num(d.wo,0,1);
 for(const k of['hat','body','wing','boot','glove'])o[k]=str(d[k],20).replace(/[^a-z0-9_]/gi,'');
 if(d.lk&&typeof d.lk=='object'){const hx=v=>/^#[0-9a-f]{6}$/i.test(v)?v:null,l=d.lk;o.lk={skin:hx(l.skin)||'#f1c9a0',hair:hx(l.hair)||'#3a2a1a',shirt:hx(l.shirt)||'#3c6fd1',pants:hx(l.pants)||'#2b3a5a',style:Math.max(0,Math.min(4,l.style|0))}}
 if(d.cx&&typeof d.cx=='object'){try{const s=JSON.stringify(d.cx);if(s.length<=600)o.cx=JSON.parse(s)}catch(_){}}
 return o}
function checkX(d,fromSid,has){if(!d||typeof d!='object')return false;const OPS=['wh','tr_offer','tr_acc','tr_done','tr_fail','tr_no'];if(!OPS.includes(d.op))return false;const id=v=>String(v||'').replace(/[^a-z0-9_-]/gi,'').slice(0,24);const r={op:d.op};r.to=id(d.to);if(!r.to||r.to==fromSid||!has(r.to))return false;
 if(d.op=='wh'){r.t=String(d.t||'').slice(0,80);return r.t?r:false}r.id=id(d.id);if(!r.id)return false;
 if(d.op=='tr_offer'){const it=v=>Array.isArray(v)&&v.length==2&&i32(v[0])&&v[0]>=0&&v[0]<=999&&i32(v[1])&&v[1]>=1&&v[1]<=9999;if(!it(d.give)||!it(d.want))return false;r.give=d.give;r.want=d.want}return r}
module.exports={W,H,ODEF,WEATHERS,ROLE,isObjId,validEdit,cleanMeta,roleOf,cleanObj,cleanObjMap,objDefaults,applyEdit,checkEdit,checkMeta,objOp,cleanPres,checkX,tileAt};
