// ===== Banner queue: the big centre title banner (UI6.say6) sits right where the chest window's header is. While a chest window or the
// Pet UI is open the latest banner waits, then shows as soon as the window closes (nothing is lost; older waiting banners are replaced). =====
{const _s6=UI6.say6;let pend=null,iv=0;
 const busy=()=>{try{return (typeof CHEST6!='undefined'&&CHEST6.k>=0)||(typeof PET10!='undefined'&&!!PET10.ui&&!!PET10.ui.on)}catch(_){return false}};
 UI6.say6=function(t,s,ms){if(!busy())return _s6.apply(this,arguments);pend=[t,s,ms];if(!iv)iv=setInterval(()=>{if(busy())return;clearInterval(iv);iv=0;const a=pend;pend=null;if(a)try{_s6.apply(UI6,a)}catch(_){}},250);return undefined}}
