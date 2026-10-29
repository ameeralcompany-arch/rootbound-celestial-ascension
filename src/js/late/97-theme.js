// ===== THEME7: light/dark/auto theme, reduced-motion + contrast flags, HUD interface options, toast colours, per-category item-icon plates =====
const THEME7=(()=>{
 const mq=(()=>{try{return matchMedia('(prefers-color-scheme: dark)')}catch(_){return null}})();
 const eff=m=>m=='auto'?(mq&&mq.matches?'dark':'light'):(m=='dark'?'dark':'light');
 // extra interface options live in cel.opt (saved by celSave); celLoad only copies the original keys, so restore ours from the same save
 try{const o=(JSON.parse(localStorage.getItem('rbc')||'null')||{}).opt||{},O=cel.opt;O.hudOp=Math.max(.4,Math.min(1,+o.hudOp||1));O.hideQuest=o.hideQuest?1:0;O.hideMini=o.hideMini?1:0;O.contrast=o.contrast?1:0}catch(_){}
 // toasts are DOM elements now (87-uisfx, animated with the motion tokens); the legacy canvas toast keeps running but draws fully transparent
 function toastColors(){window.TK6={bg:'rgba(0,0,0,0)',bd:'rgba(0,0,0,0)',tx:'rgba(0,0,0,0)'}}
 function apply(){const o=cel.opt||{},m=o.theme||'light',t=eff(m),d=document.documentElement;d.setAttribute('data-theme',t);d.setAttribute('data-reduce',o.reduce||(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}})()?'true':'false');
  d.setAttribute('data-contrast',o.contrast?'high':'normal');d.setAttribute('data-hidequest',o.hideQuest?'true':'false');d.setAttribute('data-hidemini',o.hideMini?'true':'false');d.style.setProperty('--hud-op',String(o.hudOp||1));
  toastColors();try{localStorage.setItem('rbtheme',m)}catch(_){}}
 try{if(mq&&mq.addEventListener)mq.addEventListener('change',()=>{if(cel.opt.theme=='auto')apply()})}catch(_){}
 // ---- item icon plates: every icon gets a soft rounded backplate whose colour and faint motif say what kind of item it is
 // (blocks: stone floor, seeds: soil mound, weapons: slash, wearables: halo, doors: arch, fish: ripples). Built once per icon, never per frame.
 let IK='';
 const PL={block:['#f7f5fa','#dad6e6','#a69fc0'],seed:['#f5fbf0','#d2e7cb','#7fa974'],mat:['#fef9ee','#ecdab8','#c39b5e'],fish:['#f1fafd','#c9e3ee','#6fa6c4'],bait:['#fcf6ec','#e8d6ba','#b38d5c'],
  obj:['#f9f4fe','#dbd0f0','#9a84cc'],door:['#f2f6fc','#d0daee','#7f95c2'],wear:['#f2f6fe','#dcd4f3','#8c82cd'],weapon:['#fef1f5','#ebe5f6','#c28397'],wing:['#f4f0fd','#dde6f8','#9688d4'],fx:['#f4f0fd','#dde6f8','#9688d4']};
 const PLD={block:['#4a4560','#2c2840','#8a82ad'],seed:['#3c4d40','#263229','#7fae86'],mat:['#54473a','#332b25','#c9a26a'],fish:['#33495a','#202d3b','#79b2d0'],bait:['#4f4234','#30281f','#b8946a'],
  obj:['#463a63','#2a2342','#a08ad8'],door:['#38415f','#222a42','#8ea2d4'],wear:['#383f66','#2b2546','#9a8fdd'],weapon:['#553447','#2e2440','#d48da4'],wing:['#3e3466','#222c4a','#a596e6'],fx:['#3e3466','#222c4a','#a596e6']};
 const dark=()=>document.documentElement.getAttribute('data-theme')=='dark';
 const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
 burstBG=function(x,S){const D=dark(),p=(D?PLD:PL)[IK]||(D?PLD:PL).fx,k=S/48;x.save();rr(x,.5,.5,S-1,S-1,8*k);const gr=x.createLinearGradient(0,0,S,S);gr.addColorStop(0,p[0]);gr.addColorStop(1,p[1]);x.fillStyle=gr;x.fill();x.clip();
  x.globalAlpha=.2;x.strokeStyle=p[2];x.fillStyle=p[2];x.lineWidth=k;
  if(IK=='seed'){x.beginPath();x.ellipse(S/2,S*1.04,S*.48,S*.2,0,0,6.3);x.fill()}
  else if(IK=='weapon'){x.lineWidth=7*k;x.beginPath();x.moveTo(S*.08,S*.92);x.lineTo(S*.92,S*.08);x.stroke()}
  else if(IK=='wear'||IK=='fx'||IK=='wing'){for(const r of[.33,.41]){x.beginPath();x.arc(S/2,S/2,S*r,0,6.3);x.stroke()}}
  else if(IK=='fish'){for(let i=0;i<3;i++){x.beginPath();for(let xx=0;xx<=S;xx+=3)x.lineTo(xx,S*(.74+i*.09)+Math.sin(xx/5+i*2)*1.3*k);x.stroke()}}
  else if(IK=='door'){x.beginPath();x.moveTo(S*.24,S);x.lineTo(S*.24,S*.42);x.arc(S/2,S*.42,S*.26,Math.PI,0);x.lineTo(S*.76,S);x.closePath();x.fill()}
  else if(IK=='obj'||IK=='block'){x.fillRect(0,S*.82,S,S*.18)}
  else{const g2=x.createRadialGradient(S/2,S*.46,1,S/2,S*.46,S*.5);g2.addColorStop(0,'#fff');g2.addColorStop(1,'rgba(255,255,255,0)');x.globalAlpha=.7;x.fillStyle=g2;x.fillRect(0,0,S,S)}
  x.globalAlpha=1;x.fillStyle=D?'rgba(255,255,255,.45)':'rgba(255,255,255,.8)';for(const[a,b]of[[9,10],[39,12],[11,38]])x.fillRect(a*k,b*k,1.5*k,1.5*k);x.restore();
  x.save();rr(x,1.5,1.5,S-3,S-3,7*k);x.strokeStyle=D?'rgba(255,255,255,.16)':'rgba(255,255,255,.9)';x.lineWidth=1;x.stroke();rr(x,.5,.5,S-1,S-1,8*k);x.strokeStyle=p[2]+'aa';x.stroke();x.restore();
  // a soft contact shadow under vector art gives tools, weapons and gear a clear silhouette (seeds are per-pixel, so they stay crisp)
  if(IK!='seed'&&IK!='block'){x.shadowColor=D?'rgba(0,0,0,.5)':'rgba(45,30,70,.3)';x.shadowBlur=2*k;x.shadowOffsetY=1.2*k}};
 // icons are cached canvases: rebuild them (lazily) when the effective theme flips so plates match the palette
 let lastT=null;const flushIcons=()=>{for(const k of Object.keys(ICON))delete ICON[k];for(const k of Object.keys(ICONC))delete ICONC[k];try{STORE7.flush()}catch(_){}try{renderBar();if(INV7.isOpen)INV7.render();if(UI6.on)UI6.render()}catch(_){}};
 // blocks keep their tile identity (nearest-neighbour scaling, inset on a plate); objects and doors draw their own art on the plate
 const _iu=iconURL;iconURL=function(k){if(ICON[k])return ICON[k];IK=ITEM7.cat(k);try{
   if(typeof k=='number'&&k<100&&k>0){const S=48,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');burstBG(x,S);
    if((IK=='obj'||IK=='door')&&typeof ART!='undefined'&&ODEF[k]&&ART[ODEF[k].k]){const d=ODEF[k],o=objDefaults(k),s=(d.cat=='door'?.62:.86)*S/T;x.save();x.shadowColor='rgba(45,30,70,.25)';x.shadowBlur=2;x.shadowOffsetY=1;x.translate(S/2*(1-s*T/S),S-4);x.scale(s,s);const og=g;g=x;try{ART[d.k](x,o,d,.3,0,false)}catch(_){}finally{g=og}x.restore()}
    else{const sp=spr(k,0,0);x.save();x.shadowColor='rgba(30,20,55,.38)';x.shadowBlur=4;x.shadowOffsetY=2;x.fillStyle='#000';x.fillRect(5,4,38,38);x.restore();x.imageSmoothingEnabled=false;x.drawImage(sp,5,4,38,38);x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=1;x.strokeRect(5.5,4.5,37,37)}
    ICONC[k]=c;return ICON[k]=c.toDataURL()}
   return _iu(k)}finally{IK=''}};
 const _ap=apply;apply=function(){_ap();const t=document.documentElement.getAttribute('data-theme');if(lastT!==null&&t!==lastT)flushIcons();lastT=t};
 apply();flushIcons();return{apply,flushIcons,get effective(){return eff(cel.opt.theme)}}})();
// re-apply once the saved options are loaded and whenever they change
{const _cs=celSave;celSave=function(){_cs();try{THEME7.apply()}catch(_){}}}
