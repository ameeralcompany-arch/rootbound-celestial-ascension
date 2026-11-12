// ===== BRAND1: the Rootbound logo on the title screen (docs/brand.md). The symbol (assets/brand/symbol.svg, inlined here so it can animate) and the wordmark reveal
// themselves: the ring draws, the roots grow, the leaves open, the star glints, the letters settle, then the tagline. It shows only on the start card (before you
// enter the game), never over the worlds list the same menu also shows later. Reduce motion shows the finished logo at once. =====
try{(()=>{
 const SYM='<svg class="br-sym" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="brG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8E6"/><stop offset=".45" stop-color="#F4D59A"/><stop offset=".8" stop-color="#D9B773"/><stop offset="1" stop-color="#F1DDA8"/></linearGradient></defs>'
  +'<g fill="none" stroke="url(#brG)" stroke-linecap="round" stroke-linejoin="round"><path class="br-ring" pathLength="1" d="M52.5 11.6 A49 49 0 1 0 67.5 11.6" stroke-width="3.2"/><path class="br-trunk" pathLength="1" d="M60 86 C58.6 74 61.4 62 60 40" stroke-width="3.6"/>'
  +'<path class="br-root" pathLength="1" d="M60 86 C55 92 46 96 37 104" stroke-width="2.6"/><path class="br-root" pathLength="1" d="M60 86 C60.6 94 60 100 60 109" stroke-width="2.6"/><path class="br-root" pathLength="1" d="M60 86 C65 92 74 96 83 104" stroke-width="2.6"/>'
  +'<path class="br-root br-r2" pathLength="1" d="M53 93 C49 92 45 93 41 90" stroke-width="1.8"/><path class="br-root br-r2" pathLength="1" d="M67 93 C71 92 75 93 79 90" stroke-width="1.8"/></g>'
  +'<g fill="url(#brG)"><path class="br-leaf br-l1" d="M60 55 C52 54 44 49 39 40 C49 39 57 44 60 55 Z"/><path class="br-leaf br-l2" d="M60.4 47 C67 45 76 39 81 30 C70 30 62 36 60.4 47 Z"/><path class="br-star" d="M60 2.5 L62.2 9.3 L69 11.5 L62.2 13.7 L60 20.5 L57.8 13.7 L51 11.5 L57.8 9.3 Z"/></g></svg>';
 window.RB_BRANDSYM=SYM;const WORD='ROOTBOUND';let uid=0;const sym=()=>{const id='brG'+(++uid);return SYM.split('brG').join(id)};
 function mount(){const card=document.getElementById('card');if(!card||document.getElementById('brand1'))return;const b=document.createElement('div');b.id='brand1';b.setAttribute('role','img');b.setAttribute('aria-label','Rootbound');
  b.innerHTML=sym()+'<div class="br-word">'+[...WORD].map((ch,i)=>'<span style="--i:'+i+'">'+ch+'</span>').join('')+'</div><div class="br-tag">Every world is waiting to be remembered.</div>';
  card.insertBefore(b,card.querySelector('#mhome')||card.firstChild);update()}
 // visible on the start card only: before the game is entered, while the name and Play row is the menu's section
 function update(){const b=document.getElementById('brand1'),menu=document.getElementById('menu'),home=document.getElementById('mhome');if(!b||!menu)return;
  let show=false;try{show=!entered&&menu.style.display!='none'&&home&&getComputedStyle(home).display!='none'}catch(_){}
  document.documentElement.classList.toggle('rb-title',show);if(show&&!b.classList.contains('go')){void b.offsetWidth;b.classList.add('go')}}
 const iv=setInterval(()=>{mount();update();try{if(entered){update();clearInterval(iv);setInterval(update,2000)}}catch(_){}},250);
 // the page's own icon is the symbol, not an emoji
 try{const l=document.querySelector('link[rel=icon]');if(l)l.href='data:image/svg+xml,'+encodeURIComponent(SYM.replace('class="br-sym"','xmlns="http://www.w3.org/2000/svg"'))}catch(_){}
 // the launch title: after the intro film the game starts under a short logo reveal (4.6 s, never blocks input, removed afterwards)
 function reveal(){if(document.getElementById('brandrev'))return;/* players already saw the logo on the login screen (LOGIN1) */if(window.RB_LOGINHOME)return;const o=document.createElement('div');o.id='brandrev';o.setAttribute('aria-hidden','true');
  o.innerHTML='<div class="brv-in">'+sym()+'<div class="br-word">'+[...WORD].map((ch,i)=>'<span style="--i:'+i+'">'+ch+'</span>').join('')+'</div><div class="br-tag">Every world is waiting to be remembered.</div></div>';
  document.body.appendChild(o);void o.offsetWidth;o.classList.add('go');try{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>{try{snd(f,1.4,'sine',.03)}catch(_){}},1100+i*160))}catch(_){}setTimeout(()=>{try{o.remove()}catch(_){}},4800)}
 try{const o=SHOW7.open;SHOW7.open=function(){const r=o.apply(this,arguments);try{reveal()}catch(_){}return r}}catch(_){}
 window.BRAND1={SYM,update,reveal};
})()}catch(e){console.error('BRAND1',e)}
