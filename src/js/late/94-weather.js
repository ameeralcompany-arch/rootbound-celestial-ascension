// ===== Weather machines: validate -> activate -> server sets world weather -> everyone sees it, persisted =====
// Online: the server validates permission + cooldown, saves the weather with the world, and broadcasts it ('wx' message => ENV7.set).
// Offline: the weather is stored with the local world (X6.wx). No client flag can change a shared world's weather by itself.
const WXM7=(()=>{
 let last=0;
 function pulse(k,o,d){o._act=performance.now();try{VFX.wave(k%W*T+T/2,(k/W|0)*T+T/2,d.th,110,.9,.7);OBJ6.sfx('star')}catch(_){}}
 function use(k){const o=OBJ[k];if(!o)return;const d=ODEF[o.t];if(performance.now()-last<1200)return;last=performance.now();
  if(!OBJ6.canUse(o,myId)){say('Access: '+roleName[OBJ6.need(o)]);OBJ6.sfx('lock');return}
  if(ENV7.target==d.wx){say('This world already has '+ENV7.names[d.wx]+' weather');pulse(k,o,d);return}
  if(NET7.online&&rm){if(!rm.net){say('Not connected');return}pulse(k,o,d);say('Activating '+d.n+'…');rm.emit('o',{op:'wx',k});return}
  if(NET7.state=='reconnecting'){say('Reconnecting… try again in a moment');return}
  pulse(k,o,d);ENV7.set(d.wx,{by:myName});X6.wx[cur]=d.wx;x6Save()}
 function reset(k){const o=OBJ[k];if(!o)return;if(!OBJ6.canConfig(myId)){say('Only builders can reset the weather');return}
  if(NET7.online&&rm){rm.emit('o',{op:'wx',k,reset:1});say('Restoring the default skies…');return}
  ENV7.set('default',{by:myName});delete X6.wx[cur];x6Save()}
 return{use,reset}})();
