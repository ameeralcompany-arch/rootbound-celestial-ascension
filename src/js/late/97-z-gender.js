// ===== GENDER7: Male / Female body type (cel.ap.gd: 0 classic = saves from before v8, unchanged; 1 male; 2 female).
// Chosen on the home screen (your character) and in the hub's Appearance tab. It shapes the sprite (60-char.js: shoulders, waist, lashes,
// brows) and the portrait (89-showart.js). Picking a body type for the first time also swaps the stock hairstyle to that type's default.
const GENDER7=(()=>{
 const HAIR={1:0,2:8},NAME={1:'Male',2:'Female'};
 // a stock hairstyle follows the body type; a hairstyle the player picked themselves is kept
 function apply(a,gd){if(!a)return a;const was=a.gd|0;a.gd=gd;if(gd!=was){const stock=a.hair==null||a.hair==HAIR[was]||(!was&&a.hair==0);if(stock&&HAIR[gd]!=null)a.hair=HAIR[gd]}return a}
 const seg=(cur,attr)=>'<div class="gd8" role="radiogroup" aria-label="Body type">'+[1,2].map(g=>'<button type="button" '+attr+'="'+g+'" role="radio" aria-checked="'+(cur==g)+'" class="'+(cur==g?'on':'')+'"><i aria-hidden="true">'+(g==1?'♂':'♀')+'</i>'+NAME[g]+'</button>').join('')+'</div>';
 const html=cur=>seg(cur|0,'data-gd');
 // home screen: edits your own character slot (and the live look when that slot is active)
 function setHome(gd){try{const sc=X6.sc;const L=apply(sc.looks[0]||sanAp(cel.ap),gd);sc.looks[0]=L;if((sc.act|0)==0){cel.ap.gd=L.gd;cel.ap.hair=L.hair;celSave()}x6Save()}catch(e){console.error('GENDER7',e)}
  try{UIS.play('select')}catch(_){}try{SHOW7.render()}catch(_){}}
 // hub Appearance tab: edits the active look
 function setLook(gd){apply(cel.ap,gd);try{celSave();saveP()}catch(_){}try{UIS.play('select')}catch(_){}try{UI6.render()}catch(_){}}
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gd],[data-gd8]');if(!b)return;e.preventDefault();if(b.dataset.gd)setHome(+b.dataset.gd);else setLook(+b.dataset.gd8)});
 try{const _po=UI6.ext.post;UI6.ext.post=function(tab,body){if(_po)_po.apply(this,arguments);if(tab!='look')return;const box=body.querySelector('.prof>div');if(!box||box.querySelector('.gd8'))return;
  const r=document.createElement('div');r.className='hrow';r.innerHTML='<label>Body type</label>'+seg(cel.ap.gd|0,'data-gd8')+((cel.ap.gd|0)?'':'<small class="dim">Classic look until you choose</small>');box.insertBefore(r,box.firstChild)}}catch(e){console.error('GENDER7 hub',e)}
 return{apply,html,setHome,setLook,get cur(){return cel.ap.gd|0}}})();
