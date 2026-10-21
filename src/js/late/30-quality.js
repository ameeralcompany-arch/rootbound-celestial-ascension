// ===== V6 Quality manager: presets + optional adaptive downgrade; reads cel.opt =====
const QM={cur:QPRE[2],auto:true,ema:16.7,lowT:0,hiT:0,lastChange:0,reduce:false,vfxK:1,
 apply(id,silent){const p=QPRE.find(q=>q.id==id)||QPRE[2];QM.cur=p;RSC=p.rsc;OPT.q=Math.min(1.6,p.part);QM.reduce=!!cel.opt.reduce||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches&&cel.opt.reduce!=0&&false);QM.vfxK=p.vfx*cel.opt.vfx*(QM.reduce?.4:1);try{rs()}catch(_){}if(!silent&&typeof say=='function')say('Graphics: '+p.n)},
 init(){const s=cel.opt.qp;QM.auto=s=='auto';let id=s;if(QM.auto){const m=navigator.hardwareConcurrency||4,small=Math.min(innerWidth,innerHeight)<500;id=small||m<=2?'low':m<=4?'med':'high'}QM.apply(id,true)},
 setting(s){cel.opt.qp=s;celSave();QM.auto=s=='auto';if(!QM.auto)QM.apply(s);else QM.init()},
 // adaptive: called each frame with frame ms. Downgrades one step after ~2s of sustained >24ms; never auto-upgrades past the initial pick.
 tick(ms,now){if(!QM.auto||document.hidden)return;QM.ema+=(Math.min(100,ms)-QM.ema)*.05;
  if(QM.ema>24&&now-QM.lastChange>4000){QM.lowT+=ms;if(QM.lowT>2000){const i=QPRE.indexOf(QM.cur);if(i>0){QM.apply(QPRE[i-1].id,true);QM.lastChange=now;QM.ema=16;if(typeof say=='function')say('Auto quality: '+QPRE[i-1].n)}QM.lowT=0}}else QM.lowT=Math.max(0,QM.lowT-ms)}};
QM.init();
