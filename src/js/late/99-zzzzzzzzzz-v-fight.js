// ===== FIGHT: full-body fighting animation. A move is a list of poses with timing; each pose places the hips, the lean of the torso, both hands, both feet and the weapon, and the character renderer bends real elbows and knees to reach them.
// Poses blend into each other with their own easing, so a cut has a wind-up, a fast strike, a follow-through and a recovery. Steps can carry the body forward, lift it or hang it in the air, and mark the moment a hit lands.
// One character can run one move at a time; a move can never leave anyone stuck: it clears itself on death, on menus and past a hard time limit. Other players see the same move (it travels in the cosmetics they already receive). =====
try{(()=>{
 const cl=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,u)=>a+(b-a)*u,TAU=6.2832;
 const E={i:u=>u*u*u,o:u=>1-Math.pow(1-u,3),s:u=>u*u*(3-2*u),l:u=>u,x:u=>1-Math.pow(1-u,5)};
 // pose = [hip drop, hip shift, torso lean, near hand x,y, far hand x,y, front foot x,y, back foot x,y, weapon angle, extras]
 // hands are measured from the shoulder, feet from the ground under the character, angles in radians (0 = forward, negative = up)
 const P_=(by,bx,lean,nx,ny,fx,fy,ax,ay,bfx,bfy,wa,e)=>Object.assign({by,bx,lean,nh:[nx,ny],fh:[fx,fy],ff:[ax,ay],bf:[bfx,bfy],wa},e||{});
 const POSE={
  // neutral
  ready:P_(1,0,.05,13,7,6,10,8,-2,-8,-2,-.7),rec:P_(0,0,.02,3,14,-3,10,5,-2,-5,-2,.95),guard:P_(4,-1,.08,12,0,9,6,10,-2,-10,-2,-1.15),
  // cuts
  coilH:P_(3,-3,-.26,-7,-13,-3,-9,7,-2,-11,-2,-2.5),cutD:P_(5,6,.46,15,9,10,12,15,-2,-13,-2,.95),flwD:P_(6,6,.6,8,17,3,16,15,-2,-14,-1,2.25),
  coilL:P_(6,-4,.2,-9,12,-3,12,8,-2,-13,-2,2.75),cutU:P_(-2,5,-.26,13,-12,8,-7,12,-2,-11,-4,-1.05),flwU:P_(-3,4,-.34,3,-18,-1,-15,10,-5,-9,-6,-2.45),
  coilS:P_(4,-4,-.14,-11,3,-5,6,8,-2,-12,-2,3.0),cutF:P_(4,7,.26,17,2,11,5,14,-2,-13,-2,.12),flwF:P_(3,5,.12,6,1,0,8,13,-2,-11,-2,-2.75),
  // thrusts and rushes
  drawT:P_(5,-5,-.14,-6,6,6,6,9,-2,-13,-2,-.03),thr:P_(5,10,.36,18,2,9,5,18,-2,-16,-2,-.03),thrU:P_(0,7,-.3,15,-9,8,-3,14,-5,-12,-2,-.72),crch:P_(11,-1,.34,9,13,3,13,11,-2,-10,-2,.45),rush:P_(7,9,.62,15,8,-13,6,16,-2,-17,-5,-.14),
  // whole body
  spinA:P_(4,0,.1,15,2,-14,3,8,-2,-8,-2,0,{turn:0}),spinB:P_(4,0,.1,15,2,-14,3,8,-2,-8,-2,0,{turn:3.14}),spinC:P_(4,0,.1,15,2,-14,3,8,-2,-8,-2,0,{turn:6.28}),
  rise:P_(-2,0,-.2,10,-15,4,-12,4,-13,-6,-7,-1.4),tuck:P_(-6,0,.3,9,4,3,7,7,-16,-5,-13,1.1),flipA:P_(-4,0,0,10,6,4,8,7,-15,-5,-13,1.5,{spin:0}),flipB:P_(-4,0,0,10,6,4,8,7,-15,-5,-13,1.5,{spin:3.14}),flipC:P_(-4,0,0,10,6,4,8,7,-15,-5,-13,1.5,{spin:6.28}),
  diveD:P_(-3,3,.72,14,14,6,14,6,-10,-9,-15,1.25),land:P_(13,4,.56,14,13,7,14,13,-2,-9,-1,1.55),kneel:P_(15,1,.42,8,15,-2,14,12,-2,-7,-1,.3),
  back:P_(3,-7,-.24,6,6,0,9,3,-2,-16,-2,-.5),step:P_(3,6,.14,10,6,3,9,15,-3,-8,-2,-.55),
  stanceH:P_(8,-2,.02,4,-20,-1,-16,11,-2,-12,-2,-1.56),stanceL:P_(11,-3,.3,-6,15,-2,13,12,-2,-14,-2,2.9),stanceS:P_(8,-5,-.08,-11,-1,3,5,11,-2,-14,-2,3.14),
  // fists
  jabN:P_(4,5,.24,18,1,2,7,13,-2,-10,-2,0),jabF:P_(4,5,.32,2,3,19,0,12,-2,-11,-2,0),hook:P_(5,4,.3,15,-3,-6,5,12,-2,-11,-2,0),upper:P_(-2,4,-.34,12,-17,-5,4,11,-4,-10,-3,0),coilP:P_(8,-5,-.1,-8,4,5,4,9,-2,-12,-2,0),kick:P_(2,-5,-.44,3,6,-8,7,22,-25,-8,-2,0),spinK:P_(-3,0,-.1,6,3,-8,2,22,-19,-5,-6,0),smash:P_(9,6,.66,14,18,6,20,13,-2,-13,-2,0),pummelA:P_(4,6,.3,19,-4,3,4,14,-2,-11,-2,0),pummelB:P_(5,6,.34,3,4,19,5,14,-2,-11,-2,0),
  // casting
  castU:P_(0,0,-.16,9,-18,-3,-17,7,-2,-8,-2,-1.5),castF:P_(3,5,.2,18,0,16,3,12,-2,-11,-2,-.05),castL:P_(9,-2,.3,13,16,-8,15,10,-2,-10,-2,1.3),castO:P_(2,0,-.05,15,-4,-15,-4,9,-2,-9,-2,-.2),castC:P_(5,-2,.06,6,4,5,7,7,-2,-9,-2,-1.5),castSpin:P_(2,0,.04,16,-6,-16,-6,8,-2,-8,-2,-.8,{turn:3.14}),
  // bows: the bow rests in the far hand
  nock:P_(3,-1,-.06,8,3,18,1,10,-2,-10,-2,-.04,{off:1}),draw:P_(4,-3,-.12,-6,2,19,0,11,-2,-11,-2,-.04,{off:1}),loose:P_(2,-1,-.03,-11,0,19,0,11,-2,-10,-2,-.03,{off:1}),drawU:P_(7,-3,-.42,-3,-3,12,-15,10,-2,-12,-2,-1.05,{off:1}),looseU:P_(5,-1,-.36,-8,-1,12,-15,10,-2,-11,-2,-1.05,{off:1}),drawD:P_(-2,1,.45,-2,7,17,13,7,-12,-6,-9,.62,{off:1}),
  // guns
  aim:P_(3,1,.05,18,0,12,5,10,-2,-9,-2,0),fire:P_(2,-2,-.14,14,-4,10,1,10,-2,-11,-2,-.42),aimU:P_(4,0,-.3,12,-14,7,-8,9,-2,-10,-2,-.95),fireU:P_(3,-2,-.42,10,-16,5,-11,9,-2,-11,-2,-1.3),akimbo:P_(5,0,.04,18,0,-18,1,10,-2,-10,-2,0),roll:P_(13,5,.95,6,12,1,12,7,-7,-5,-7,.6,{spin:1.6}),
 };
 const NM=Object.keys(POSE);
 const lerpPose=(o,a,b,u)=>{o.by=lerp(a.by,b.by,u);o.bx=lerp(a.bx,b.bx,u);o.lean=lerp(a.lean,b.lean,u);o.nh[0]=lerp(a.nh[0],b.nh[0],u);o.nh[1]=lerp(a.nh[1],b.nh[1],u);o.fh[0]=lerp(a.fh[0],b.fh[0],u);o.fh[1]=lerp(a.fh[1],b.fh[1],u);o.ff[0]=lerp(a.ff[0],b.ff[0],u);o.ff[1]=lerp(a.ff[1],b.ff[1],u);o.bf[0]=lerp(a.bf[0],b.bf[0],u);o.bf[1]=lerp(a.bf[1],b.bf[1],u);o.wa=lerp(a.wa,b.wa,u);o.spin=a.spin!=null||b.spin!=null?lerp(a.spin||0,b.spin||0,u):0;o.turn=a.turn!=null||b.turn!=null?lerp(a.turn||0,b.turn||0,u):null;o.off=u<.5?a.off:b.off;return o};
 const newPose=()=>P_(0,0,0,0,0,0,0,0,0,0,0,0,{spin:0,turn:null,off:0,grip:0,len:40,hide:0,rx:0,ry:0});
 // "name.dur" plus ! (a hit lands at the end of this step), >n forward speed, ^n upward speed, ~ hang in the air, # hold still (no walking)
 const CACHE=new Map();
 function parse(s){let q=CACHE.get(s);if(q)return q;q=[];for(const tok of s.trim().split(/\s+/)){const m=/^([a-zA-Z]+)(\.\d+)(!?)(?:>(-?\d+))?(?:\^(-?\d+))?(~?)(#?)$/.exec(tok);if(!m||!POSE[m[1]])throw new Error('FIGHT pose '+tok);q.push({p:POSE[m[1]],n:m[1],d:+m[2],hit:!!m[3],vx:m[4]!=null?+m[4]:null,vy:m[5]!=null?+m[5]:null,hang:!!m[6],hold:!!m[7]})}CACHE.set(s,q);return q}
 const dur=s=>parse(s).reduce((a,x)=>a+x.d,0);
 const hits=s=>parse(s).filter(x=>x.hit).length;
 const lastHit=s=>{let t=0,e=0;for(const x of parse(s)){t+=x.d;if(x.hit)e=t}return e};
 const easeOf=(st,i)=>st.hit||st.n=='cutD'||st.n=='cutU'||st.n=='cutF'||st.n=='thr'?E.x:st.n.startsWith('coil')||st.n=='crch'||st.n=='drawT'?E.o:E.s;
 const ST=new Map();
 const mk=()=>({q:null,i:0,t:0,cur:newPose(),from:newPose(),cb:null,tot:0,wk:null,k:''});
 const stOf=k=>{let s=ST.get(k);if(!s){s=mk();ST.set(k,s);if(ST.size>32)ST.delete(ST.keys().next().value)}return s};
 let netS=0,netSeq=0;
 // type -> hold: length, two-hand grip distance
 const HOLD={sword:[44,0],great:[48,15],katana:[46,0],hammer:[46,15],axe:[48,15],scythe:[50,18],staff:[48,18],dagger:[28,0],kunai:[26,0],bow:[40,0],gun:[30,0],fist:[0,0],whip:[44,0],orb:[34,0],spear:[50,18]};
 function play(key,str,o){o=o||{};const s=stOf(key),q=parse(str),h=HOLD[o.type||'sword']||HOLD.sword;s.from=lerpPose(s.from,s.q?s.cur:POSE.ready,s.q?s.cur:POSE.ready,0);s.q=q;s.i=0;s.t=0;s.cb=o.hit||null;s.done=o.done||null;s.tot=0;s.cur.len=h[0];s.cur.grip=h[1];s.cur.hide=o.type=='fist'?1:0;s.hn=0;s.max=dur(str)+1;s.k=o.id||str;s.soft=!!o.soft;s.hideW=o.type=='fist';if(key=='me'&&o.id){netS=o.id;netSeq=(netSeq+1)%100}return s}
 function stop(key){const s=ST.get(key);if(s){s.q=null;s.cb=null}if(key=='me'){api.root=null}}
 function step(s,key,dt){if(!s.q)return;s.tot+=dt;if(s.tot>s.max){stop(key);return}const q=s.q;let st=q[s.i];if(s.t==0&&key=='me')api.root=st.vx!=null||st.vy!=null||st.hang||st.hold?st:null;s.t+=dt;while(s.t>=st.d){s.t-=st.d;if(st.hit){const n=s.hn++;try{s.cb&&s.cb(n)}catch(e){console.error('FIGHT hit',e)}}s.from=lerpPose(s.from,st.p,st.p,0);s.i++;if(s.i>=q.length){const dn=s.done;s.q=null;s.cb=null;s.done=null;if(key=='me')api.root=null;try{dn&&dn()}catch(_){}return}st=q[s.i];if(key=='me')api.root=st.vx!=null||st.vy!=null||st.hang||st.hold?st:null}
  lerpPose(s.cur,s.from,st.p,easeOf(st)(cl(s.t/st.d,0,1)))}
 function tick(dt0){const dt=Math.min(.05,dt0);for(const[k,s]of ST)step(s,k,dt);
  // nothing can hold a character in a pose: dead, in a menu, swimming or riding a cut-scene all end the move
  const me=ST.get('me');if(me&&me.q){let bad=false;try{bad=P.hp<=0||(typeof dlgOpen!='undefined'&&dlgOpen)||!entered}catch(_){}if(bad)stop('me')}}
 AC6.FA=(key,wpn,fm)=>{const s=ST.get(key);if(!s||!s.q)return null;const c=s.cur;c.hide=s.hideW?1:0;return c};
 // the body follows the move: forward speed, jump, hanging
 {const _p=physics;physics=function(dt,ax,busy){const r0=api.root;if(!r0)return _p.apply(this,arguments);if(r0.vx!=null)P.vx=r0.vx*P.f;if(r0.vy!=null&&!r0.vyd){P.vy=-r0.vy;r0.vyd=api.mark}if(r0.hang)P.vy=0;const noWalk=r0.vx!=null||r0.hold;const r=_p.call(this,dt,noWalk?0:ax,busy);if(r0.vx!=null)P.vx=r0.vx*P.f;if(r0.hang)P.vy=0;return r}}
 {const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{tick(dt)}catch(e){if(!tick.e){tick.e=1;console.error('FIGHT tick',e)}}return r}}
 function net(){return netS?[netS,netSeq]:0}
 // what another player is doing: when their move changes, play the same pose; the skill system adds its picture
 const RM=new Map();function remote(name,q){try{const fa=q&&q.cx&&q.cx.fa;if(!Array.isArray(fa))return;const k=String(fa[0]).slice(0,28),sq=fa[1]|0,prev=RM.get(name);if(prev===k+'#'+sq)return;RM.set(name,k+'#'+sq);if(prev===undefined)return;if(RM.size>32)RM.delete(RM.keys().next().value);if(api.onRemote)api.onRemote('p:'+name,k,q)}catch(_){}}
 const api={play,stop,parse,dur,hits,lastHit,POSE,NM,HOLD,net,root:null,mark:0,remote,onRemote:null,active:k=>{const s=ST.get(k);return!!(s&&s.q)},state:k=>ST.get(k),clearNet(){netS=0}};window.FIGHT=api;
 setInterval(()=>{api.mark++},16);
})()}catch(e){console.error('FIGHT',e)}
