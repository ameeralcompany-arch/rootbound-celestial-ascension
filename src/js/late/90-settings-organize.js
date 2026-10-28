// ===== Settings: grouped sections + search. Rows are regrouped after the hub renders them, so every option added elsewhere still appears. =====
UI6.ext.post=(tab,body)=>{if(tab=='plates'){try{UI6.ext.postPlates(body)}catch(e){console.error(e)}return}if(tab!='settings')return;
 const GROUPS=[['Look & feel','Theme, interface size',/theme|ui scale|language|colou?r/i],['Performance','Graphics quality, effects, weather',/graphics|vfx|bloom|weather|motion|fps/i],['Sound','Music and effects',/sound|audio|music|volume|sfx/i],['More','Everything else',/./]];
 const rows=[...body.querySelectorAll(':scope > .hrow')];if(!rows.length)return;
 const h3=body.querySelector('h3');
 const bar=document.createElement('div');bar.className='setq7';bar.innerHTML='<input type="search" id="setq7" placeholder="Search settings…" aria-label="Search settings" autocomplete="off"><span class="dim" id="setn7"></span>';
 const box=document.createElement('div');box.className='setg7';
 const secs=GROUPS.map(([n,d,re])=>{const sec=document.createElement('section');sec.className='setsec7';sec.innerHTML='<h4>'+n+'<small>'+d+'</small></h4>';box.appendChild(sec);return{sec,re,n:0}});
 for(const r of rows){const t=(r.querySelector('label')||r).textContent;const g=secs.find(x=>x.re.test(t));g.sec.appendChild(r);g.n++;r.dataset.k=(r.textContent||'').toLowerCase()}
 for(const g of secs)if(!g.n)g.sec.remove();
 body.append(bar,box);if(h3)body.insertBefore(h3,bar);
 const inp=bar.querySelector('input');
 inp.oninput=()=>{const q=inp.value.trim().toLowerCase();let shown=0;for(const r of rows){const m=!q||r.dataset.k.includes(q);r.style.display=m?'':'none';if(m)shown++}
  for(const g of secs)if(g.sec.isConnected){const any=[...g.sec.querySelectorAll('.hrow')].some(r=>r.style.display!='none');g.sec.style.display=any?'':'none'}
  bar.querySelector('#setn7').textContent=q?(shown?shown+' found':'No settings match'):''};
 inp.onkeydown=e=>{e.stopPropagation()}};
