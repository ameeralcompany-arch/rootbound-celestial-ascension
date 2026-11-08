// ===== HUDCARD1: the character card's bars and health number (the layout is 99-zzzzzzzz-hudcard.css). The game keeps writing the two old fills' widths as before; each frame these bars read that value
// and ease towards it using transform only, so no layout runs and a hit never jumps. A pale strip shows the health you just lost for a moment, then drains. Below a quarter the bar turns red.
// Only what changed is written. Reduced motion: the bars jump straight to their value. =====
try{(()=>{
 const reduce=()=>{try{return MOTION7.reduce()}catch(_){return false}};
 const mk=(host,ghost)=>{const v=document.createElement('u');v.className='hpv';let g=null;if(ghost){g=document.createElement('u');g.className='hpg';host.insertBefore(g,host.firstChild)}host.appendChild(v);return{v,g}};
 let hp=null,xp=null,hpRow=null,num=null;
 function build(){const f=document.getElementById('hpf'),x=document.getElementById('xpf');if(!f||!x)return false;const bar=f.parentNode;hpRow=document.createElement('div');hpRow.className='hprow';bar.parentNode.insertBefore(hpRow,bar);hpRow.appendChild(bar);num=document.createElement('span');num.className='hpn';num.setAttribute('aria-label','Health');hpRow.appendChild(num);hp={f,bar,...mk(bar,true),s:-1,g0:-1,hold:0,lastV:-1,lastG:-1};xp={f:x,bar:x.parentNode,...mk(x.parentNode,false),s:-1,lastV:-1};return true}
 const read=e=>{const w=e.style.width;if(!w)return 0;const n=parseFloat(w);return Number.isFinite(n)?Math.max(0,Math.min(1,n/100)):0};
 let t0=0;function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-t0)/1000||.016);t0=t;if(!hp&&!build())return;if(document.hidden)return;const snap=reduce();
  const ht=read(hp.f);if(hp.s<0)hp.s=hp.g0=ht;if(snap)hp.s=hp.g0=ht;else{hp.s+=(ht-hp.s)*(1-Math.exp(-dt/.07));if(Math.abs(ht-hp.s)<.0015)hp.s=ht;if(ht>=hp.g0){hp.g0=ht;hp.hold=0}else if(hp.hold<.42)hp.hold+=dt;else{hp.g0+=(ht-hp.g0)*(1-Math.exp(-dt/.16));if(hp.g0-ht<.002)hp.g0=ht}}
  if(hp.s!==hp.lastV){hp.lastV=hp.s;hp.v.style.transform='scaleX('+hp.s.toFixed(4)+')';const low=ht<.25;if(low!==hp.low){hp.low=low;hp.bar.classList.toggle('low',low)}}if(hp.g0!==hp.lastG){hp.lastG=hp.g0;hp.g.style.transform='scaleX('+hp.g0.toFixed(4)+')'}
  const xt=read(xp.f);if(xp.s<0)xp.s=xt;if(snap||xt<xp.s-.5)xp.s=xt;else{xp.s+=(xt-xp.s)*(1-Math.exp(-dt/.14));if(Math.abs(xt-xp.s)<.001)xp.s=xt}if(xp.s!==xp.lastV){xp.lastV=xp.s;xp.v.style.transform='scaleX('+xp.s.toFixed(4)+')'}}
 requestAnimationFrame(frame);
 let lastN='';setInterval(()=>{try{if(!num||typeof P=='undefined')return;const s=Math.max(0,Math.ceil(P.hp))+' / '+Math.ceil(maxHP());if(s!==lastN){lastN=s;num.textContent=s}}catch(_){}},150);
})()}catch(e){console.error('HUDCARD1',e)}
