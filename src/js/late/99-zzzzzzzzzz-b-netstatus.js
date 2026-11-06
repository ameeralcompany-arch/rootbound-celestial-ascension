// ===== NET17: the connection indicator. A small glass pill by the map: Connected with the ping, Connection unstable, Reconnecting, Reconnected (for a
// moment), Disconnected. Shown while you play online; it never pops up messages of its own. The ping comes from the heartbeat (75-net.js), every 6 s. =====
try{(()=>{
 let el=null,prev='',flashT=0;
 function make(){if(el)return el;el=document.createElement('div');el.id='net16';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.innerHTML='<i></i><span></span>';document.body.appendChild(el);return el}
 function tick(){try{const e=make(),st=NET7.state,now=performance.now();let k='',t='';
  const online=st=='online',rt=NET7.rtt|0,quiet=NET7.quiet|0;
  if(prev=='reconnecting'&&online)flashT=now+3000;prev=st;
  if(!online&&st!='reconnecting'&&st!='connecting'){if(st=='offline'&&!(window.DG&&DG.coop&&DG.coop.on)){e.style.display='none';return}k='off';t='Disconnected'}
  else if(st=='reconnecting'||st=='connecting'){k='re';t=st=='connecting'?'Connecting…':'Reconnecting…'}
  else if(now<flashT){k='ok';t='Reconnected'+(rt?' · '+rt+' ms':'')}
  else if(rt>250||quiet>15000){k='bad';t='Connection unstable'+(rt?' · '+rt+' ms':'')}
  else{k='ok';t=rt?rt+' ms':'Connected'}
  e.style.display='';if(e.dataset.k!==k)e.dataset.k=k;const s=e.querySelector('span');if(s.textContent!==t)s.textContent=t;e.title=k=='ok'?'Connected to the server':k=='bad'?'The connection is slow or losing messages; the game keeps trying':k=='re'?'The connection dropped. Reconnecting by itself, your run is kept':'Not connected to the server'}catch(_){}}
 setInterval(tick,500);
})()}catch(e){console.error('NET17',e)}
