// ===== Keys work on any keyboard layout. On Arabic and other non-Latin layouts the W key types another letter, so every control that listens for "w" would go dead. This runs before every other key handler and, when a key produced a non-Latin character, reports the English letter of that physical key.
// Latin layouts keep their own letters (an AZERTY Q stays A). Anything typed into a text box is left exactly as typed. =====
(function(){
 function latin(e){try{latin0(e);const t=e.target;if(t&&(t.isContentEditable||t.tagName=='TEXTAREA'||(t.tagName=='INPUT'&&/^(text|search|number|email|password|url|tel|)$/i.test(t.type||''))))return;const raw=String(e.key||'').toLowerCase();Object.defineProperty(e,'rbKey',{value:raw,configurable:true});const u=(window.RB_KB&&window.RB_KB.use)||'f';if(raw===u&&u!=='e')Object.defineProperty(e,'key',{value:'e',configurable:true})}catch(_){}}
 function latin0(e){try{const k=e.key,c=e.code||'',t=e.target;if(!k||k.length!=1||k.charCodeAt(0)<128)return;if(t&&(t.isContentEditable||t.tagName=='TEXTAREA'||(t.tagName=='INPUT'&&/^(text|search|number|email|password|url|tel|)$/i.test(t.type||''))))return;
   const m=/^Key([A-Z])$/.exec(c)||/^Digit(\d)$/.exec(c);if(!m)return;Object.defineProperty(e,'key',{value:e.shiftKey?m[1]:m[1].toLowerCase(),configurable:true})}catch(_){}}
 addEventListener('keydown',latin,true);addEventListener('keyup',latin,true);
})();
