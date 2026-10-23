// ===== Shared UI components (modal / confirm / form). Uses design tokens only. =====
const DLG7=(()=>{
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let host=null,cur=null;
 function ensure(){if(host)return host;host=document.createElement('div');host.id='dlg7';host.innerHTML='<div class="box" role="dialog" aria-modal="true"></div>';document.body.appendChild(host);
  host.addEventListener('mousedown',e=>{if(e.target===host&&cur&&cur.dismiss)cur.done(null)});
  addEventListener('keydown',e=>{if(!cur)return;if(e.key=='Escape'){e.stopPropagation();e.preventDefault();cur.done(null)}else if(e.key=='Enter'&&e.target.tagName!='TEXTAREA'&&e.target.tagName!='BUTTON'){const b=host.querySelector('[data-ok]');if(b){e.stopPropagation();e.preventDefault();b.click()}}},true);return host}
 // fields: [{k,label,type,ph,val,max}] ; resolves with {k:value} or null
 function open({title,text,fields=[],ok='OK',cancel='Cancel',danger,dismiss=true,html}){return new Promise(res=>{ensure();if(cur)cur.done(null);const box=host.firstChild;
  box.innerHTML='<h3>'+esc(title||'')+'</h3>'+(text?'<p>'+esc(text)+'</p>':'')+(html||'')+fields.map(f=>'<label>'+esc(f.label||'')+(f.type=='select'?'<select data-k="'+f.k+'">'+f.opts.map(o=>'<option value="'+esc(o[0])+'"'+(o[0]==f.val?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>':'<input data-k="'+f.k+'" type="'+(f.type||'text')+'" placeholder="'+esc(f.ph||'')+'" maxlength="'+(f.max||40)+'" value="'+esc(f.val||'')+'" autocomplete="off">')+'</label>').join('')
   +'<div class="acts">'+(cancel?'<button data-cancel>'+esc(cancel)+'</button>':'')+'<button data-ok class="'+(danger?'danger':'pri')+'">'+esc(ok)+'</button></div>';
  const done=v=>{if(cur&&cur.done!==done)return;cur=null;host.classList.remove('on');try{UIS.play('close')}catch(_){}setTimeout(()=>{if(!cur)host.style.display='none'},200);res(v)};
  cur={done,dismiss};host.style.display='flex';requestAnimationFrame(()=>host.classList.add('on'));try{UIS.play('open')}catch(_){}
  box.querySelector('[data-ok]').onclick=()=>{const o={};for(const i of box.querySelectorAll('[data-k]'))o[i.dataset.k]=i.value;done(o)};const c=box.querySelector('[data-cancel]');if(c)c.onclick=()=>done(null);
  const f=box.querySelector('input,select');setTimeout(()=>{try{(f||box.querySelector('[data-ok]')).focus()}catch(_){}},30)})}
 return{open,confirm:(title,text,ok,danger)=>open({title,text,ok:ok||'Confirm',danger}).then(v=>!!v),alert:(title,text)=>open({title,text,cancel:'',ok:'OK'}),esc,get isOpen(){return !!cur}}})();
