// ===== V6 Quality manager: presets + optional adaptive downgrade; reads cel.opt =====
const QM={cur:QPRE.find(q=>q.id=='high'),auto:true,ema:16.7,lowT:0,hiT:0,lastChange:0,reduce:false,vfxK:1,
 apply(id,silent){const p=QPRE.find(q=>q.id==id)||QPRE.find(q=>q.id=='high');QM.cur=p;RSC=p.rsc;try{document.documentElement.classList.toggle('lowfx',p.id=='low'||p.id=='potato')}catch(_){}OPT.q=Math.min(1.6,p.part);QM.reduce=!!cel.opt.reduce||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches&&cel.opt.reduce!=0&&false);QM.vfxK=p.vfx*cel.opt.vfx*(QM.reduce?.4:1);try{rs()}catch(_){}if(!silent&&typeof say=='function')say('Graphics: '+p.n)},
 init(){const s=cel.opt.qp;QM.auto=s=='auto';let id=s;if(QM.auto){const m=navigator.hardwareConcurrency||4,small=Math.min(innerWidth,innerHeight)<500;id=small||m<=2?'low':m<=4?'med':'high';/* no hardware canvas/WebGL = software drawing: start low */try{const t=document.createElement('canvas');if(!(t.getContext('webgl')||t.getContext('experimental-webgl'))&&id!='low')id='low'}catch(_){id='low'}}QM.apply(id,true)},
 setting(s){cel.opt.qp=s;celSave();QM.auto=s=='auto';if(!QM.auto)QM.apply(s);else QM.init()},
 // quality never drops on its own: the player picks it in Settings (the old adaptive downgrade is gone)
 tick(){}};
QM.init();
