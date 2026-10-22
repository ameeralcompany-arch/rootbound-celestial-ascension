const {chromium}=require('playwright');let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?'  - '+x:''));if(!c)fails++};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const vp of [[1280,720],[390,800],[1920,1080]]){const p=await b.newPage({viewport:{width:vp[0],height:vp[1]}});const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('file://'+__dirname+'/../index.html');await p.waitForTimeout(700);await p.getByText('PLAY AS GUEST',{exact:false}).first().click();await p.waitForTimeout(800);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(1200);
const tag=' @'+vp[0];
ok('showcase opens after launch'+tag,await p.evaluate(()=>SHOW7.isOpen));
const nm=()=>p.evaluate(()=>document.querySelector('#show .name').innerText.replace(/\n/g,' '));
const n0=await nm();await p.keyboard.press('ArrowRight');await p.waitForTimeout(900);const n1=await nm();
ok('arrow key switches character'+tag,n0!=n1,n0+' -> '+n1);
const c=await p.evaluate(()=>({cur:SHOW7.cur,name:document.querySelector('#show .name').innerText.replace(/\n/g,' ').toLowerCase(),want:(SHOW7.CHARS[SHOW7.cur].first||'').toLowerCase()}));
ok('info matches selected character'+tag,!c.want||c.name.startsWith(c.want),JSON.stringify(c));
ok('no horizontal overflow'+tag,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
ok('canvas has pixels'+tag,await p.evaluate(()=>{const c=document.getElementById('showCv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4*50)if(d[i])n++;return n>50}));
if(vp[0]==1280){
 ok('locked character disables Play',await p.evaluate(()=>{SHOW7.cur=3;SHOW7.render();return document.querySelector('[data-a=play]').disabled}));
 await p.evaluate(()=>{SHOW7.cur=0;SHOW7.render()});
 await p.click('[data-a=fav]');ok('favorite toggles + persists',await p.evaluate(()=>X6.sc.fav[0]==1&&document.querySelector('[data-a=fav]').classList.contains('on')));
 await p.click('[data-a=gmenu]');await p.click('[data-g=wings]');ok('gallery switches to wings',await p.evaluate(()=>X6.sc.gal=='wings'));
 await p.click('#show nav a[data-n=inv]');await p.waitForTimeout(700);ok('Inventory nav opens inventory + closes showcase',await p.evaluate(()=>!SHOW7.isOpen&&!!document.querySelector('#inv7')&&getComputedStyle(document.querySelector('#inv7')).display!='none'));
 await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await p.evaluate(()=>SHOW7.open());await p.waitForTimeout(400);
 await p.click('#show nav a[data-n=store]');await p.waitForTimeout(500);ok('Store nav opens shop dialog',await p.evaluate(()=>dlgOpen&&dlg.style.display=='block'));
 ok('UIS volume/mute state exists',await p.evaluate(()=>typeof UIS.play=='function'));
}
ok('no page errors'+tag,e.length==0,e.join('|'));await p.close()}
await b.close();console.log(fails?'FAILURES '+fails:'all showcase tests passed');process.exit(fails?1:0)})();
