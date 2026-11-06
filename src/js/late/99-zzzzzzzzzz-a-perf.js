// ===== PERF20: keeping frames smooth, and saying so when they are not.
//  - IDLE: small jobs that run only in the browser's spare time between frames, a few milliseconds at a time.
//  - Icons of everything you own are drawn in that spare time after you arrive, so the first time a panel opens it does not stop to draw them.
//  - A stall watch: a frame that takes longer than 300 ms is written to the game's log (rootbound-startup.log, through console.warn) with what was happening,
//    at most 30 times a session, so a freeze on a player's PC can be traced. RBPERF keeps frame times for the stress tests (average, 1% low, worst). =====
try{(()=>{
 // ---- the spare-time queue
 const Q=[];let on=false;const ric=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>8,didTimeout:false}),50));
 function run(dl){on=false;/* one job per spare moment, and only in real spare time: a job never competes with a frame */if(Q.length&&dl.timeRemaining()>4){const f=Q.shift();try{f()}catch(e){console.warn('[idle] '+(e&&e.message||e))}}if(Q.length)kick()}
 const kick=()=>{if(!on){on=true;ric(run)}};
 window.IDLE={add(f){Q.push(f);kick()},get size(){return Q.length}};
 // ---- after arriving: draw the icons the panels will want
 let warmed=false;function warm(){if(warmed)return;warmed=true;const keys=new Set();try{for(const k in inv)if((inv[k]|0)>0)keys.add(/^\d+$/.test(k)?+k:k)}catch(_){}try{for(const id in own)if(own[id]&&WPN[id])keys.add('w:'+id)}catch(_){}try{for(const id in ownW)if(ownW[id])keys.add('a:'+id)}catch(_){}try{for(const k of bar)if(k!=null)keys.add(k)}catch(_){}
  /* only block and material icons, which are drawn from shapes: equipment and weapon icons copy pictures from the graphics card, and that read-back is what stalls */for(const k of keys)if(typeof k=='number')IDLE.add(()=>{try{iconURL(k)}catch(_){}});
  /* not the larger wing and store previews: some take a third of a second to draw, which is a stall whenever it happens */}
 // ---- frame times and stalls
 const P={n:0,sum:0,worst:0,ft:new Float32Array(3600),i:0,stalls:0,since:performance.now()};let last=0,logged=0;window.RBPERF=P;
 const phase=()=>{try{if(typeof INTRO60!='undefined'&&INTRO60.playing)return'intro film';if(typeof entered=='undefined'||!entered)return'menu';if(window.DG&&DG.run)return DG.boss&&DG.boss.act?'boss fight ('+DG.run.d.n+', phase '+DG.boss.act.phase+')':'dungeon ('+DG.run.d.n+')';return'world ('+(typeof cur!='undefined'?cur:'?')+')'}catch(_){return'?'}};
 const panel=()=>{try{const o=[];if(INV7.isOpen)o.push('inventory');if(EQM9.isOpen)o.push('equipment');if(UI6.on)o.push('hub:'+UI6.tab);if(window.DG&&DG.page&&DG.page.on)o.push('dungeons');if(window.RPG){if(RPG.enh.isOpen)o.push('forge');if(RPG.path.isOpen)o.push('path')}return o.join(',')||'none'}catch(_){return'?'}};
 function frame(t){requestAnimationFrame(frame);if(!last){last=t;return}const d=t-last;last=t;if(document.hidden||d>5000)return;P.ft[P.i++%P.ft.length]=d;P.n++;P.sum+=d;if(d>P.worst)P.worst=d;
  if(d>300&&performance.now()-P.since>8000){P.stalls++;if(logged<30){logged++;let extra='';try{extra=' · fx '+(window.DG&&DG.fx?DG.fx.count:0)+' · monsters '+(typeof mobs!='undefined'?mobs.length:0)}catch(_){}console.warn('[stall] '+Math.round(d)+' ms in '+phase()+' · open: '+panel()+extra)}}
  if(!warmed){try{if(entered&&!window.RB_COVER&&performance.now()-P.since>4000)warm()}catch(_){}}}
 requestAnimationFrame(frame);
 // the numbers the stress tests read: average fps, the 1% low, the worst frame, over the last minute or so
 P.report=()=>{const n=Math.min(P.n,P.ft.length),a=Array.from(P.ft.slice(0,n)).sort((x,y)=>x-y);if(!n)return null;const avg=a.reduce((s,v)=>s+v,0)/n,p99=a[Math.floor(n*.99)]||a[n-1];return{frames:n,avgFps:Math.round(1000/avg),low1Fps:Math.round(1000/p99),worstMs:Math.round(a[n-1]),over50:a.filter(v=>v>50).length,stalls:P.stalls}};
 P.reset=()=>{P.n=0;P.sum=0;P.worst=0;P.i=0;P.ft.fill(0);P.stalls=0};
})()}catch(e){console.error('PERF20',e)}
