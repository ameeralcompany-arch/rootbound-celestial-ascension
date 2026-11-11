// ===== EVC1: the evolution cinematics. Twenty seconds for each class, fast and loud: the Mythic wakes, the eyes open, the class's own power gathers and draws its sigil on the ground, the new look arrives piece by piece, a black silhouette against the light, the evolved hero, the class's signature move, and its name.
// One timeline shared by all 13 (so every score lands on the same beats), filled with each class's own look, place, aura, sigil and move. Classes register with EVC1.add(class, spec) in the z8 files; this turns each into a MOVIE1 movie.
// The hero is the player's own character drawn by FILM1. Nothing bright ever sits behind the head. Every frame is computed from time alone. =====
try{window.EVC1=(()=>{
 const K=MOVIE1.kit,{TAU,V_W:W,V_H:H,cl,lerp,ez,eo,ei,sr,mk,glow,rect,crescent,speedLines,sparks,motes,actor,view,reduce}=K;
 const sin=Math.sin,cos=Math.cos,F=()=>FILM1;
 // the shared timeline: [name, seconds]. 20.0 s in all; the evolution is granted at the start of 'peak'.
 const TL=[['spark',1.3],['eyes',1.0],['gather',2.4],['sigil',.8],['p1',.9],['p2',.9],['p3',.9],['peak',.9],['hero',2.6],['windup',.8],['sig',2.8],['title',4.7]];
 const AT={};{let a=0;for(const[n,d]of TL){AT[n]=a;a+=d}AT.end=a}
 const SPEC={};
 // ---------- small helpers every class can use
 function canvas(m,w,h){const c=mk(Math.ceil((w||W)*m.k),Math.ceil((h||H)*m.k)),x=c.getContext('2d');x.scale(m.k,m.k);return[c,x]}
 function blurOf(m,src,px){const c=mk(src.width,src.height),x=c.getContext('2d');x.filter='blur('+(px*m.k)+'px)';x.drawImage(src,0,0);return c}
 const vg=(x,y0,y1,st)=>{const G=x.createLinearGradient(0,y0,0,y1);for(const[o,c]of st)G.addColorStop(o,c);return G};
 const hex=c=>{if(c.length==4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const p=parseInt(c.slice(1,7),16);return[p>>16,p>>8&255,p&255]};
 const mixC=(a,b,k)=>{const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
 const rgba=(c,a)=>{const v=hex(c);return'rgba('+v[0]+','+v[1]+','+v[2]+','+a+')'};
 // before the change: the same clothes, plainer
 function plain(C){const o={};for(const q in C){const v=C[q];o[q]=typeof v=='string'&&v[0]=='#'?mixC(v,q=='trim'?'#9a96a8':'#2e2c3a',q=='trim'?.6:.42):v}return o}
 function impact(x){if(reduce())return;x.save();x.globalCompositeOperation='difference';x.setTransform(1,0,0,1,0,0);x.fillStyle='#fff';x.fillRect(0,0,x.canvas.width,x.canvas.height);x.restore()}
 const lit=(t,t0,d)=>t>=t0&&t<t0+(d||.07);
 // a body part's place on the standing body (body units, feet at 0, facing right) and how close the camera comes
 const REG={head:[-10,-1440,1.5],face:[-10,-1420,1.9],chest:[-20,-1130,1.05],shoulders:[-40,-1230,1.2],back:[-150,-1060,.85],waist:[0,-860,1.05],legs:[0,-420,.8],feet:[0,-150,1.1],hand:null,weapon:null,full:[0,-800,.55]};
 // ---------- default poses by weapon kind (body pose objects for FILM1.body); a class can replace any of them
 const POSE={
  great:{gather:{nh:[150,300],fh:[40,330],wa:1.57,lean:.02},hero:{nh:[190,250],fh:[70,280],wa:1.6,lean:0,nf:[-110,0],ff:[120,0]},windup:{nh:[-120,-180],fh:[-200,-120],wa:-2.3,lean:-.1,nf:[-160,0],ff:[180,0],py:40}},
  katana:{gather:{nh:[60,520],fh:[60,500],wa:.3},hero:{nh:[160,330],fh:[-30,420],wa:-.5,nf:[-120,0],ff:[140,0]},windup:{nh:[-60,380],fh:[-20,400],wa:2.6,lean:.18,py:60,nf:[-220,0],ff:[230,0]}},
  bow:{gather:{nh:[40,460],fh:[30,500],wa:-1.45},hero:{nh:[300,40],fh:[80,60],wa:-1.57,nf:[-110,0],ff:[120,0]},windup:{nh:[380,-20],fh:[-120,-10],wa:-1.57,lean:-.04,nf:[-140,0],ff:[150,0]}},
  staff:{gather:{nh:[120,280],fh:[60,520],wa:-1.45},hero:{nh:[220,120],fh:[40,500],wa:-1.5,nf:[-100,0],ff:[120,0]},windup:{nh:[260,-180],fh:[120,-60],wa:-1.2,lean:-.06}},
  dagger:{gather:{nh:[30,540],fh:[20,520],wa:.6},hero:{nh:[220,200],fh:[-40,430],wa:.2,nf:[-130,0],ff:[140,0]},windup:{nh:[-80,300],fh:[60,360],wa:2.4,lean:.2,py:70,nf:[-220,0],ff:[240,0]}},
  scythe:{gather:{nh:[200,40],fh:[40,470],wa:-1.46},hero:{nh:[240,-34],fh:[-70,430],wa:-1.46,nf:[-90,0],ff:[120,0]},windup:{nh:[-200,100],fh:[-260,120],wa:-2.6,lean:.1,py:50,nf:[-200,0],ff:[220,0]}},
  spear:{gather:{nh:[160,260],fh:[60,520],wa:-1.5},hero:{nh:[260,120],fh:[80,300],wa:-.4,nf:[-120,0],ff:[150,0]},windup:{nh:[-160,160],fh:[60,180],wa:.05,lean:-.12,py:40,nf:[-200,0],ff:[230,0]}},
  hammer:{gather:{nh:[150,300],fh:[40,330],wa:1.5},hero:{nh:[160,-40],fh:[60,-10],wa:-1.4,nf:[-110,0],ff:[120,0]},windup:{nh:[-100,-260],fh:[-160,-220],wa:-2.1,lean:-.14,py:30,nf:[-170,0],ff:[190,0]}},
  axe:{gather:{nh:[150,300],fh:[40,330],wa:1.5},hero:{nh:[180,-30],fh:[60,10],wa:-1.3,nf:[-110,0],ff:[120,0]},windup:{nh:[-120,-240],fh:[-180,-200],wa:-2.2,lean:-.14,py:30,nf:[-170,0],ff:[190,0]}},
  kunai:{gather:{nh:[40,520],fh:[20,520],wa:0},hero:{nh:[280,140],fh:[-120,300],wa:.2,nf:[-130,0],ff:[150,0]},windup:{nh:[-200,200],fh:[120,260],wa:2.8,lean:.24,py:80,nf:[-240,0],ff:[250,0]}},
  branch:{gather:{nh:[120,280],fh:[60,520],wa:-1.45},hero:{nh:[220,120],fh:[40,500],wa:-1.5,nf:[-100,0],ff:[120,0]},windup:{nh:[260,-180],fh:[120,-60],wa:-1.2,lean:-.06}},
  gun:{gather:{nh:[60,540],fh:[20,520],wa:1.4,wFront:1},hero:{nh:[120,330],fh:[-40,460],wa:-1.2,wFront:1,nf:[-110,0],ff:[120,0]},windup:{nh:[400,40],fh:[300,90],wa:0,wFront:1,lean:-.02,nf:[-150,0],ff:[170,0]}},
  gaunt:{gather:{nh:[80,480],fh:[40,470],wa:1.4,wFront:1},hero:{nh:[220,80],fh:[120,160],wa:-.6,wFront:1,nf:[-140,0],ff:[160,0],py:30},windup:{nh:[-140,180],fh:[200,120],wa:.4,wFront:1,lean:-.2,py:70,nf:[-230,0],ff:[250,0]}}};
 const TYPE=k=>{try{return SK1.WK['myth_'+k][0].type}catch(_){return({brawler:'gaunt',knight:'great',samurai:'katana',archer:'bow',mage:'staff',demon:'dagger',reaper:'scythe',elementalist:'spear',stormcaller:'hammer',berserker:'axe',ninja:'kunai',druid:'branch',gunslinger:'gun'})[k]||'great'}};
 const WLEN={great:1500,katana:1400,bow:1300,staff:1650,dagger:900,scythe:1560,spear:1750,hammer:1400,axe:1400,kunai:640,branch:1650,gun:560,gaunt:420};
 // ---------- the hero, at any size, on a layer that covers the screen
 function hero(q,c,y,X,Y,s,pose,o){o=o||{};const sp=q.sp,gr=o.g||{p1:1,p2:1,p3:1},ev=gr.p1>0||o.evolved,C=o.C||(ev?sp.C:q.C0);
  const P=Object.assign({},pose||{});P.hd=Object.assign({yaw:.26},P.hd||{});const face=Object.assign({},o.face||{});face.eye=Object.assign({},P.hd.eye||{},face.eye||{});if(ev&&!face.eye.col)face.eye.col=sp.eye;
  const O={t:c.T,wpn:o.noWpn?null:q.k,tier:q.tier,C,wind:o.wind==null?.3:o.wind,wpnLen:o.wpnLen||sp.wl||WLEN[q.type],dress:ev?sp.dress:null,dk:gr,face,evo:sp.evo?sp.evo(gr,ev):null};
  const pad=380,w=W+pad*2,h=H+pad*2,act=Object.assign({w,h,bx:(X+pad)/w,by:(Y+pad)/h},o.act||{});
  actor(y,X,Y,z=>{z.scale(s*(o.f||1),s);F().body(z,q.L,P,O)},act)}
 // the Mythic on its own, big: grip at X,Y, pointing at angle a
 function wpn(q,y,X,Y,a,len,t,o){y.save();y.translate(X,Y);y.rotate(a);const th=F().lineScale(y,.5);let piv=.3;try{piv=MYTH.prof(q.k).piv||0}catch(_){}y.translate(-len*piv,0);try{MYART.weapon(th,q.k,q.tier,len,t,Object.assign({vector:1},o||{}))}catch(e){if(!wpn.e){wpn.e=1;console.error('EVC1 weapon',e)}}y.restore()}
 // the class's own slash/ring/hit painter from the game, drawn at film size
 function painter(q,y,kind,X,Y,r,u,a,spr,sc){const P=window.STY1&&STY1.P[q.k];if(!P||!P[kind])return;sc=sc||5;y.save();y.translate(X,Y);y.scale(sc,sc);try{P[kind](y,{r:r/sc,a:a||0,spr:spr==null?3:spr},0,0,cl(u,0,1),q.sp.pal)}catch(_){}y.restore();y.globalAlpha=1;y.globalCompositeOperation='source-over'}
 // the painted place, behind everything, with a little camera parallax
 function bg(q,x,c,dim,blur){view(x,c.C,.14,y=>y.drawImage(blur?q.plateB:q.plate,-60,-40,W+120,H+80));if(dim)rect(x,'#05030c',dim)}
 function sigilAt(q,y,X,Y,R0,k,t,a){if(!q.sp.sigil||R0<=0)return;y.save();y.translate(X,Y);y.scale(1,.27);y.globalAlpha=a==null?1:a;try{q.sp.sigil(y,k,t,R0)}catch(e){if(!sigilAt.e){sigilAt.e=1;console.error('EVC1 sigil',e)}}y.restore();y.globalAlpha=1;y.globalCompositeOperation='source-over'}
 function aura(q,y,X,Y,k,t){if(!q.sp.aura)return;y.save();try{q.sp.aura(y,X,Y,k,t)}catch(e){if(!aura.e){aura.e=1;console.error('EVC1 aura',e)}}y.restore();y.globalAlpha=1;y.globalCompositeOperation='source-over'}
 function rays(y,X,Y,n,len,c,a,t,seed){const R=sr(seed||5);y.save();y.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const b=-Math.PI*(.08+.84*R())+sin(t*.6+i)*.02,w=.02+R()*.05,L=len*(.6+R()*.5);y.globalAlpha=a*(.3+.7*R());const G=y.createLinearGradient(X,Y,X+cos(b)*L,Y+sin(b)*L);G.addColorStop(0,c);G.addColorStop(1,rgba(c,0));y.fillStyle=G;y.beginPath();y.moveTo(X,Y);y.lineTo(X+cos(b-w)*L,Y+sin(b-w)*L);y.lineTo(X+cos(b+w)*L,Y+sin(b+w)*L);y.closePath();y.fill()}y.restore()}
 const api=q=>({q,hero:(c,y,X,Y,s,p,o)=>hero(q,c,y,X,Y,s,p,o),wpn:(y,X,Y,a,len,t,o)=>wpn(q,y,X,Y,a,len,t,o),painter:(y,kind,X,Y,r,u,a,spr,sc)=>painter(q,y,kind,X,Y,r,u,a,spr,sc),bg:(x,c,dim,blur)=>bg(q,x,c,dim,blur),sigil:(y,X,Y,R0,k,t,a)=>sigilAt(q,y,X,Y,R0,k,t,a),aura:(y,X,Y,k,t)=>aura(q,y,X,Y,k,t),impact,rays,lit,glow,rect,crescent,speedLines,sparks,motes,view,ez,eo,ei,lerp,cl,sr,rgba,mixC,vg,W,H,TAU,pose:q.pose,pal:q.sp.pal,F:F()});
 // ---------- the twelve shots
 function shots(k){const S=[];const sh=(n,o)=>{o.d=TL.find(r=>r[0]==n)[1];o.name=n;S.push(o);return o};
  // 1. the Mythic wakes: a line of the class's light runs the length of the blade
  sh('spark',{tr:'black',trd:.35,cam:[[0,960,540,1.12,-.04],[1,960,540,1.3,.02]],draw(x,c){const q=c.m.ctx,sp=q.sp,u=c.u;bg(q,x,c,.8,1);view(x,c.C,1,y=>{const L=q.wl0,a=-.32+u*.06,X=lerp(380,300,u),Y=650;wpn(q,y,X,Y,a,L,c.T);const run=ez(cl((c.t-.15)/.9,0,1)),px=X+cos(a)*L*lerp(-.1,.95,run),py=Y+sin(a)*L*lerp(-.1,.95,run);glow(y,px,py,180,sp.pal[0],.9*(1-Math.abs(run-.5)));glow(y,px,py,40,'#ffffff',.9*(1-Math.abs(run-.5)));sparks(y,11,c.t-.2,px,py,26,620,sp.pal[2],.5,500)});motes(x,3,c.T,40,0,0,W,H,sp.pal[0],5,-30,.6*u);if(sp.spark){x.save();try{sp.spark(x,c,api(q))}catch(_){}x.restore()}}});
  // 2. the eyes open, and the class's mark is in them
  sh('eyes',{cam:[[0,960,540,1,0],[1,960,540,1.12,0]],draw(x,c){const q=c.m.ctx,sp=q.sp,k=ez((c.t-.08)/.5);x.fillStyle='#030208';x.fillRect(0,0,W,H);glow(x,W/2,H*.86,900,sp.pal[0],.18*k);view(x,c.C,1,y=>{const col=k>.45?sp.eye:q.L.eyeCol,iris=sp.glyph?(g,cx,cy,rx,ry)=>{g.save();try{sp.glyph(g,cx,cy,rx,ry,k,c.T)}catch(_){}g.restore()}:null;for(const s of[-1,1]){y.save();y.translate(W/2+s*360,H*.52);y.scale(7.2,7.2);F().eye(y,q.L,{open:lerp(.05,1.1,k),iris,look:[0,-.05],col,angry:.25},0,0,34,28,s,q.L.gd|0);y.restore()}});if(lit(c.t,.42,.06))impact(x)}});
  // 3. the power gathers around the hero; wind rises; the sigil begins
  sh('gather',{tr:'cut',cam:[[0,960,640,1.1,-.03],[1,960,560,1.0,.02]],draw(x,c){const q=c.m.ctx,sp=q.sp,k=ez(c.u);bg(q,x,c,.38-.18*k);view(x,c.C,1,y=>{sigilAt(q,y,960,1010,lerp(60,420,k),k*.6,c.T,.8);aura(q,y,960,1000,k*.8,c.T);hero(q,c,y,960,1000,.5,Object.assign({hd:{yaw:.22,eye:{open:.9,angry:.3},brow:{angry:.2}}},q.pose.gather),{g:{p1:0,p2:0,p3:0},wind:.1+k*.6,act:{rim:[sp.pal[0],.5+.4*k,-8,-3]}})});motes(x,7,c.T,70,0,0,W,H,sp.pal[0],6,-60-120*k,.7*k)}});
  // 4. the sigil races across the ground
  sh('sigil',{tr:'cut',cam:[[0,960,860,1.3,0],[1,960,820,1.18,0]],shk:t=>t<.18?6:0,draw(x,c){const q=c.m.ctx,sp=q.sp,k=eo(c.t/.6);bg(q,x,c,.5);view(x,c.C,1,y=>{sigilAt(q,y,960,980,lerp(380,1300,k),.6+.4*k,c.T,1);rays(y,960,980,14,700,sp.pal[0],.5*k,c.T,3);hero(q,c,y,960,980,.36,q.pose.gather,{g:{p1:0,p2:0,p3:0},wind:.7,act:{sil:.75,silC:'#06040e',rim:[sp.pal[2],.8,-6,-2]}})});sparks(x,21,c.t,960,980,40,900,sp.pal[0],.7,-400)}});
  // 5-7. the new look, one piece at a time, each in close-up
  for(const n of['p1','p2','p3'])sh(n,{tr:'cut',cam:[[0,960,540,1,n=='p2'?.03:-.03],[1,960,540,1.1,0]],draw(x,c){const q=c.m.ctx,sp=q.sp,i=+n[1]-1,reg=q.pieceReg[i],gr={p1:i>0?1:0,p2:i>1?1:0,p3:0};gr[n]=eo(cl(c.t/.62,0,1));bg(q,x,c,.55,1);glow(x,W*.5,H*.62,800,sp.pal[0],.22);motes(x,30+i,c.T,50,0,0,W,H,sp.pal[0],5,-260,.7);view(x,c.C,1,y=>{const s=reg[2],X=W/2-reg[0]*s,Y=H/2-reg[1]*s;hero(q,c,y,X,Y,s,Object.assign({hd:{yaw:.24,eye:{open:.86,angry:.25},brow:{angry:.15}}},q.pose.piece),{g:gr,wind:.55,act:{rim:[sp.pal[0],.9,-8,-3]}});if(c.t>.55&&c.t<.85){const f=1-(c.t-.55)/.3;glow(y,W/2+300,H/2+160,220,sp.pal[2],.4*f);motes(y,40+i,c.T,26,W/2-420,H/2-300,840,600,sp.pal[2],7,-380,.9*f)}});if(sp.piece){x.save();try{sp.piece(x,c,api(q),i)}catch(_){}x.restore()}}});
  // 8. black silhouette against the class's light: the moment it becomes real
  sh('peak',{tr:'bflash',evoPeak:1,cam:[[0,960,560,1.04,0],[1,960,560,1.12,0]],draw(x,c){const q=c.m.ctx,sp=q.sp,k=eo(c.t/.5);const G=x.createLinearGradient(0,0,0,H);G.addColorStop(0,sp.pal[1]);G.addColorStop(.55,sp.pal[0]);G.addColorStop(1,sp.pal[2]);x.fillStyle=G;x.fillRect(0,0,W,H);view(x,c.C,1,y=>{rays(y,960,1100,26,1500,'#ffffff',.55,c.T,9);speedLines(y,960,620,7,c.T,rgba('#ffffff',.9),.5,40,520);if(sp.burst){y.save();try{sp.burst(y,k,c.T,api(q))}catch(_){}y.restore()}hero(q,c,y,960,1010,.5,q.pose.hero,{g:{p1:1,p2:1,p3:1},wind:.8,act:{sil:1,silC:'#000'}})})}});
  // 9. the evolved hero
  sh('hero',{tr:'flash',cam:[[0,960,600,1.06,-.02],[1,960,545,1.0,0]],draw(x,c){const q=c.m.ctx,sp=q.sp,k=ez(c.t/1.2);bg(q,x,c,.18);view(x,c.C,1,y=>{sigilAt(q,y,960,1000,700,1,c.T,.75);rays(y,960,1060,16,900,sp.pal[0],.22,c.T,4);aura(q,y,960,1000,1,c.T);hero(q,c,y,960,1000,.52,Object.assign({hd:{yaw:.26,eye:{open:.9,angry:.12}}},q.pose.hero),{wind:.45+.3*k,act:{rim:[sp.pal[2],.95,-8,-3]}})});motes(x,81,c.T,90,0,0,W,H,sp.pal[0],6,-30,.8)}});
  // 10. the wind-up: tight, eyes narrow, the move gathers
  sh('windup',{tr:'cut',cam:[[0,960,530,.98,.04],[1,960,530,1.08,-.02]],shk:t=>t>.5?5:0,draw(x,c){const q=c.m.ctx,sp=q.sp,k=ez(c.u);bg(q,x,c,.5,1);speedLines(x,960,500,13,c.T,rgba(sp.pal[2],.8),.35+.4*k,46,420);view(x,c.C,1,y=>{const s=.95,X=W/2+60*s,Y=H/2+1150*s;hero(q,c,y,X,Y,s,Object.assign({hd:{yaw:.3,eye:{open:.62,angry:.75,pupil:.7},brow:{angry:.8},mouth:{open:.12,smile:-.2}}},q.pose.windup),{wind:.9,act:{rim:[sp.pal[0],1,-10,-3]}})});if(sp.windup){x.save();try{sp.windup(x,c,api(q))}catch(_){}x.restore()}}});
  // 11. the signature move: each class's own
  sh('sig',{tr:'cut',cam:[[0,960,560,1.0,0],[1,960,560,1.06,0]],shk:t=>{const h=(SPEC[k].sig&&SPEC[k].sig.hits)||[.35];for(const a of h)if(t>a&&t<a+.3)return 14;return 0},draw(x,c){const q=c.m.ctx,sp=q.sp;x.save();try{if(sp.sig&&sp.sig.draw)sp.sig.draw(x,c,api(q));else defaultSig(x,c,q)}catch(e){if(!shots.e){shots.e=1;console.error('EVC1 sig',k,e)}}x.restore()}});
  // 12. the name
  sh('title',{tr:'flash',out:'black',outd:.8,cam:[[0,960,560,1.0,0],[1,960,540,1.05,0]],draw(x,c){const q=c.m.ctx,sp=q.sp,k=ez(c.t/.9),E=q.E;bg(q,x,c,.5);view(x,c.C,1,y=>{sigilAt(q,y,1380,1010,520,1,c.T*.6,.55);hero(q,c,y,1380,1000,.46,Object.assign({hd:{yaw:-.1}},q.pose.hero),{f:-1,wind:.4,act:{grade:['#05030c',.35],rim:[sp.pal[0],.9,8,-3]}})});motes(x,91,c.T,80,0,0,W,H,sp.pal[0],6,-24,.8);
   x.save();x.textAlign='center';x.fillStyle=sp.pal[2];x.globalAlpha=k*.95;x.font="600 26px Montserrat,system-ui,sans-serif";try{x.letterSpacing='.42em'}catch(_){}x.fillText('CLASS EVOLUTION  ·  '+q.cls.toUpperCase(),W*.36,H*.36);
   const sz=E.n.length>16?84:96;x.globalAlpha=k;x.fillStyle='#ffffff';x.shadowColor=sp.pal[0];x.shadowBlur=34;x.font="700 "+sz+"px 'Cormorant Garamond',Georgia,serif";try{x.letterSpacing='.1em'}catch(_){}const sl=lerp(40,0,eo(c.t/.7));x.fillText(E.n.toUpperCase(),W*.36+sl,H*.48);x.shadowBlur=0;
   x.globalAlpha=ez((c.t-.7)/.8);x.fillStyle=sp.pal[0];x.fillRect(W*.36-160,H*.53,320,3);x.font="italic 500 40px 'Cormorant Garamond',Georgia,serif";try{x.letterSpacing='0em'}catch(_){}x.fillStyle='#f4eefc';x.fillText(E.d,W*.36,H*.61);x.restore()}});
  return S}
 // a plain move for any class that does not draw its own: lunge, the class's slash, its ring, a hit frame
 function defaultSig(x,c,q){const sp=q.sp,hit0=.35,a=eo((c.t-hit0)/.5);bg(q,x,c,.3);view(x,c.C,1,y=>{if(c.t<hit0)hero(q,c,y,lerp(700,860,ez(c.t/hit0)),1000,.5,q.pose.windup,{wind:.8,act:{rim:[sp.pal[0],1,-8,-3]}});else{painter(q,y,'slash',960,640,520,(c.t-hit0)/.9,-.4,1.6,6);painter(q,y,'ring',960,900,900,(c.t-hit0)/1.6,0,3,6);hero(q,c,y,1160,1000,.5,q.pose.hero,{wind:.9,act:{rim:[sp.pal[2],1,-8,-3]}})}});if(lit(c.t,hit0,.07))impact(x)}
 // ---------- what is painted when a cinematic starts
 function setup(k){return m=>{const sp=SPEC[k],q={k,sp};q.L=(m.o&&m.o.look)||FILM1.look();q.type=TYPE(k);q.tier=(()=>{try{return Math.max(3,MYTH.tier(k)|0)}catch(_){return 3}})();q.E=EVO1.E[k];try{q.cls=CLASS7.C[k].n}catch(_){q.cls=k}
  q.C0=plain(sp.C);q.wl0=sp.wlClose||Math.min(1500,(sp.wl||WLEN[q.type])*(q.type=='gun'||q.type=='gaunt'||q.type=='kunai'?2.2:1));
  const base=POSE[q.type]||POSE.great;q.pose={gather:Object.assign({},base.gather,sp.pose&&sp.pose.gather),hero:Object.assign({},base.hero,sp.pose&&sp.pose.hero),windup:Object.assign({},base.windup,sp.pose&&sp.pose.windup)};q.pose.piece=Object.assign({},q.pose.gather,sp.pose&&sp.pose.piece);
  q.pieceReg=(sp.pieces||['chest','head','back']).map(r=>{if(Array.isArray(r))return r;if(r=='hand'||r=='weapon'){const p=q.pose.piece,nh=p.nh||[-16,560];return[-128+nh[0],-1202+nh[1],r=='hand'?1.45:.9]}return REG[r]||REG.chest});
  const[c,x]=canvas(m);try{x.fillStyle=vg(x,0,H,sp.sky||[[0,'#0a0818'],[1,'#2a2440']]);x.fillRect(0,0,W,H);if(sp.plate)sp.plate(x,sr(17),{W,H,glow,vg,rgba,mixC,sr})}catch(e){console.error('EVC1 plate',k,e)}q.plate=c;q.plateB=blurOf(m,c,9);
  return q}}
 function add(k,sp){SPEC[k]=sp;const S=shots(k);let reveal=0;{let a=0;for(const s of S){if(s.evoPeak)reveal=a;a+=s.d}}
  let nm=k;try{nm=EVO1.E[k].n}catch(_){}
  MOVIE1.register(k,{id:k,kind:'evo',title:nm,cls:nm,score:'audio/movie/evo/'+k+'.mp3',reveal,shots:S,lines:[],setup:setup(k),teardown(m){m.ctx=null},hits:((sp.sig&&sp.sig.hits)||[.35]).map(h=>+(AT.sig+h).toFixed(3))})}
 return{add,SPEC,TL,AT,POSE,REG,WLEN,TYPE,plain,mixC,rgba,vg,impact}})()}catch(e){console.error('EVC1',e)}
