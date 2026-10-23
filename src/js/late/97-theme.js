// ===== THEME7: light/dark/auto theme, reduced-motion flag, toast colours, pastel item-icon backing, UI sound settings =====
const THEME7=(()=>{
 const mq=(()=>{try{return matchMedia('(prefers-color-scheme: dark)')}catch(_){return null}})();
 const eff=m=>m=='auto'?(mq&&mq.matches?'dark':'light'):(m=='dark'?'dark':'light');
 function toastColors(){try{const c=getComputedStyle(document.documentElement);window.TK6={bg:c.getPropertyValue('--toast-bg').trim(),bd:c.getPropertyValue('--toast-bd').trim(),tx:c.getPropertyValue('--toast-tx').trim()}}catch(_){}}
 function apply(){const m=(cel.opt&&cel.opt.theme)||'light',t=eff(m);document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-reduce',(cel.opt&&cel.opt.reduce)||(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}})()?'true':'false');toastColors();try{localStorage.setItem('rbtheme',m)}catch(_){}}
 try{if(mq&&mq.addEventListener)mq.addEventListener('change',()=>{if(cel.opt.theme=='auto')apply()})}catch(_){}
 // pastel gradient backing for every item icon (replaces the old blue burst); a thin ring keeps tiles readable on light and dark UI
 burstBG=function(x,S){const r=x.createLinearGradient(0,0,S,S);r.addColorStop(0,'#efe9fb');r.addColorStop(.55,'#dfe6f7');r.addColorStop(1,'#f6e2ea');x.fillStyle=r;x.fillRect(0,0,S,S);
  x.fillStyle='rgba(255,255,255,.7)';for(const[a,b]of[[8,9],[38,12],[11,37],[39,36],[24,5]])x.fillRect(a*S/48,b*S/48,2,2);x.strokeStyle='rgba(122,102,194,.45)';x.lineWidth=2;x.strokeRect(1,1,S-2,S-2)};
 for(const k of Object.keys(ICON))delete ICON[k];for(const k of Object.keys(ICONC))delete ICONC[k];try{renderBar();renderW()}catch(_){}
 // ---- settings rows (injected into the hub Settings tab)
 const E=UI6.ext;
 E.sx=o=>'<div class="hrow"><label>Theme</label><select id="sth"><option value="light"'+(o.theme=='light'?' selected':'')+'>Pearl (light)</option><option value="dark"'+(o.theme=='dark'?' selected':'')+'>Plum night (dark)</option><option value="auto"'+(o.theme=='auto'?' selected':'')+'>Match my system</option></select></div>'
  +'<div class="hrow"><label>UI sounds</label><input type="range" id="suv" min="0" max="100" value="'+Math.round((o.uiv==null?.6:o.uiv)*100)+'"><small id="suvn">'+Math.round((o.uiv==null?.6:o.uiv)*100)+'%</small><span class="hchip'+(o.uim?' on':'')+'" id="sum">'+(o.uim?'MUTED':'ON')+'</span></div>';
 E.sxBind=(body,o)=>{const q=id=>body.querySelector('#'+id);
  q('sth').onchange=e=>{o.theme=e.target.value;celSave();apply()};
  q('suv').oninput=e=>{o.uiv=e.target.value/100;q('suvn').textContent=e.target.value+'%';celSave()};q('suv').onchange=()=>{try{UIS.play('select')}catch(_){}};
  q('sum').onclick=()=>{o.uim=o.uim?0:1;celSave();q('sum').textContent=o.uim?'MUTED':'ON';q('sum').classList.toggle('on',!!o.uim);if(!o.uim)try{UIS.play('select')}catch(_){}}};
 apply();return{apply,get effective(){return eff(cel.opt.theme)}}})();
// re-apply once the saved options are loaded and whenever they change
{const _cs=celSave;celSave=function(){_cs();try{THEME7.apply()}catch(_){}}}
