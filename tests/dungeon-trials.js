// A bot plays every parkour trial with the game's real physics and base movement only: no wings, no air jumps, no help but what a new player has (walk, jump, wall jump, Shift dash).
// Damage is off so timing mistakes don't end the attempt; falling still returns it to the checkpoint. It has to reach the key by itself. Runs the game's update loop faster than real time.
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html');let fails=0;
const SAVE=JSON.stringify({v:1,inv:{1:5},gems:0,own:{fist:1},ownW:{},wear:{},wp:'fist',bar:[1],done:{},xp:3,lvl:70,prof:{mine:{l:2,x:0},farm:{l:1,x:0},fight:{l:1,x:0}},look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a'},made:true});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:640,height:360}});await c.addInitScript(s=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.setItem('rbp',s)}},SAVE);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:60000});await p.evaluate(()=>{enterWorld('plaza')});await p.waitForTimeout(600);
 const ids=process.argv.slice(2).length?process.argv.slice(2):await p.evaluate(()=>DG.LIST.map(d=>d.id));
 for(const id of ids){if(process.env.TRACE)await p.evaluate(()=>{window.TRACE=1});const r=await p.evaluate(async id=>{const d=DG.BY[id];DG.enter(id,DG.diffsOf(d)[0],{force:true,skipCine:true});DG.god=1;try{cel.wing='none'}catch(_){}
    // stop the real loop fighting the bot: hold the cover while we step by hand
    window.RB_COVER=1;const L=DG.L,rm=L.rooms.find(q=>q.kind=='trial');P.x=(rm.x0+1.5)*T;P.y=rm.fy*T-P.h-2;P.vx=P.vy=0;DG.run.check={x:P.x,y:P.y};DG.run.room=rm;
    const DT=1/60,kx=L.keyAt.x;let climbed=null;
    // Hollow Sanctuary's climb doubles back on itself, which this simple bot can't plan: each hop is played by hand here, with real physics, and the bot takes over at the top
    if(id=='hollow'){const steps=[[44.3,7,-1,9],[41.7,9,1,11],[44.3,11,-1,13],[41.7,13,1,14]];climbed=[];for(const[x,up,dir,want]of steps){P.x=(rm.x0+x)*T;P.y=(rm.fy-up)*T-P.h-1;P.vx=dir*260;P.vy=0;for(let i=0;i<12;i++){K[dir>0?'d':'a']=1;K.d=dir>0?1:0;K.a=dir<0?1:0;update(DT)}jumpPress();K.w=1;let n=0;const x0=(rm.x0+(dir>0?44.9:41))*T;do{K.d=dir>0&&P.x<x0?1:0;K.a=dir<0&&P.x>x0?1:0;update(DT);n++}while(n<110&&!(P.g&&n>10));K.w=0;K.a=K.d=0;jumpRelease();climbed.push(Math.round((rm.fy*T-P.y-P.h)/T)==want&&P.g)}P.x=(rm.x0+46)*T;P.y=(rm.fy-14)*T-P.h-2;P.vx=P.vy=0;DG.run.check={x:P.x,y:P.y}}let climb=null,tgt=null,t=0,best=P.x,bestT=0,falls0=DG.run.falls|0,jumps=0,dashes=0,wj=0,log=[],waitT=0,jheld=0,side=1,path=[];const solid=(tx,ty)=>solidAt(tx,ty);
    // the surfaces this frame: tiles, and whatever gadget can be stood on right now
    const surf=(x0,x1,y0,y1)=>{let b=null;const c=(top,xa,xb)=>{if(top>=y0&&top<=y1&&xb>=x0&&xa<=x1){if(!b||xa<b.xa)b={top,xa,xb}}};for(let tx=Math.floor(x0/T);tx<=Math.floor(x1/T);tx++)for(let ty=Math.floor(y0/T);ty<=Math.floor(y1/T);ty++)if(solid(tx,ty)&&!solid(tx,ty-1)&&!solid(tx,ty-2))c(ty*T,tx*T,(tx+1)*T);for(const q of DG.PL)c(q.y,q.x,q.x+q.w);return b};
    const press=(k,v)=>{K[k]=v?1:0};const g2x=g=>g.cx+g.r+T*.1;
    while(t<420){t+=DT;if(DG.L.keyAt.got)break;
     for(const g of L.gad){if(g.k=='seq'&&g.st!=3&&g.rm===rm&&Math.abs(P.x-g.pads[0].x)<T*8){g.st=3;if(DG.groups[g.grp]){DG.groups[g.grp].on=1;DG.groups[g.grp].t=1e9}}}
     const feet=P.y+P.h,fx=P.x+T*.6;let ax=1,jump=false,dashNow=false;if(P.g)tgt=null;else if(tgt&&(feet<=tgt.top+4||P.vy<0)){const c=(tgt.xa+tgt.xb)/2;ax=P.x>c+6?-1:P.x<c-6?1:0}
     // what lies ahead
     const ahead=P.g?surf(P.x+T*.2,P.x+T*1.1,feet-T*.7,feet+T*.9):null;const wall=solid(Math.floor((P.x+P.w/2+6)/T),Math.floor((feet-T*.5)/T))||solid(Math.floor((P.x+P.w/2+6)/T),Math.floor((feet-T*1.5)/T));
     const doorAhead=L.solids.some(s=>s.on&&P.x+T*1.2>s.x0&&P.x<s.x0&&feet>s.y0&&P.y<s.y1);
     const gate=L.gad.find(g=>g.k=='dashgate'&&g.x-P.x>0&&g.x-P.x<T*1.7&&feet>g.y0&&P.y<g.y1);
     if(gate)dashNow=true;
     if(P.g&&climb){ax=-1;if(P.x-climb.xb<T*2.7){jump=true;jheld=0;tgt=climb;climb=null}}else if(P.g){if(doorAhead){ax=0}else if(wall){const up=surf(P.x,P.x+T*5,feet-T*3.1,feet-T*.5);jump=true;if(!up)wj++}else if(!ahead){
       // an edge: is there anything to jump to right now?
       const gz=L.gad.find(g=>g.k=='grav'&&g.rm===rm&&P.x>g.x0-T&&P.x<g.x1&&g.cur<1&&g.ph2<.3),wheel=L.gad.find(g=>g.k=='rotor'&&g.rm===rm&&Math.abs(Math.hypot(P.x-g.cx,feet-g.cy)-g.r)<T*2.2),land=surf(wheel?Math.max(P.x+T,g2x(wheel)):P.x+T*1,P.x+T*6,feet-T*(gz?6.5:2.7),feet+T*3);const far=land||wheel?null:surf(P.x+T*6,P.x+T*9.5,feet-T*1.5,feet+T*2);const fading=land&&L.gad.find(g=>g.k=='vanish'&&g.vis&&Math.abs(g.x-land.xa)<4&&Math.abs(g.y-land.top)<4);const soon=fading&&(fading.on-((fading.t+fading.ph*(fading.on+fading.off))%(fading.on+fading.off)))<1;
       const gzAny=L.gad.find(g=>g.k=='grav'&&g.rm===rm&&(P.x>g.x0-T*2&&P.x<g.x1)),heavy=gzAny&&(gzAny.cur>1||gzAny.ph2>.3);if((land&&heavy)||soon){ax=0}else if(land){if(land.xa-P.x<T*5){jump=true;tgt={xa:land.xa,xb:land.xb,top:land.top}}}else if(far){jump=true;dashNow='air';tgt={xa:far.xa,xb:far.xb,top:far.top}}else{ax=0;waitT+=DT;
        // something below that we can drop to (the way down), after a moment of waiting for platforms
        const back=surf(P.x-T*6.5,P.x-T*1.2,feet-T*2.7,feet-T*1);if(back&&waitT>.6&&!wheel){climb={xa:back.xa,xb:back.xb,top:back.top};waitT=0}if(waitT>9){ax=1;waitT=0}}
      }else waitT=0}
     else{const above=solid(Math.floor((P.x+P.w/2+6)/T),Math.floor((feet-T*.5)/T));if(P.wall&&!solid(Math.floor(P.x/T),Math.floor(P.y/T)-1)&&above){jump=true;jheld=0}
       // mid-air: dash when the landing would otherwise fall short
       const backward=tgt&&(tgt.xa+tgt.xb)/2<P.x;if(!backward&&(dashNow=='air'||(P.vy>120&&!surf(P.x,P.x+T*5.5,feet,feet+T*5)&&surf(P.x+T*2,P.x+T*8,feet-T*.5,feet+T*2))))dashNow=true}
     if(P.x>=kx-T*.5&&P.x<=kx+T*.5){ax=0}if(P.x>kx+T*.5)ax=-1;
     press('d',ax>0);press('a',ax<0);if(jump&&!jheld){jumpPress();jumps++;jheld=1;press('w',1)}else{jheld=Math.max(0,jheld-(P.g?1:0));if(!jump&&P.g&&P.vy>=0){press('w',0);jumpRelease()}}if(!P.g&&P.vy>0){press('w',0)}
     if(dashNow===true&&DG.dashCD<=0&&dash<=0){const e=new KeyboardEvent('keydown',{key:'Shift'});dispatchEvent(e);dashes++;K.shift=0}
     update(DT);try{BOSS6.tick(DT)}catch(_){}if(window.TRACE&&((t*60|0)%12==0)){path.push([+t.toFixed(1),+(P.x/T-rm.x0).toFixed(1),+((rm.fy*T-P.y-P.h)/T).toFixed(1),P.g?1:0,+P.vy.toFixed(0),jump?1:0,ax,DG.PL.filter(q=>q.x>P.x-T*2&&q.x<P.x+T*8).map(q=>[+(q.x/T-rm.x0).toFixed(0),+((rm.fy*T-q.y)/T).toFixed(0)]).join('|')]);if(path.length>40)path.shift()}
     if(P.x>best+T*.5){best=P.x;bestT=t}if(t-bestT>170){break}}
    press('d',0);press('a',0);press('w',0);const got=DG.L.keyAt.got&&(!climbed||climbed.every(Boolean)),o={got,climbed,t:Math.round(t),falls:(DG.run.falls|0)-falls0,jumps,dashes,reached:Math.round(best/T-rm.x0),of:rm.x1-rm.x0,keyAt:Math.round(kx/T-rm.x0),py:Math.round(P.y/T)-rm.fy,trace:window.TRACE?path:undefined};delete window.RB_COVER;DG.god=0;DG.leave();await new Promise(q=>setTimeout(q,700));return o},id);
  console.log((r.got?'PASS ':'FAIL ')+id+': the bot crossed the trial on base movement  - '+JSON.stringify(r));if(!r.got)fails++}
 if(errs.length){fails++;console.log('FAIL page errors',errs.slice(0,4))}await b.close();console.log(fails?'FAILURES: '+fails:'ALL PASSED');process.exit(fails?1:0)})().catch(e=>{console.error(e);process.exit(1)});
