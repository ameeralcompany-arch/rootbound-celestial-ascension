// ===== Block-break skins (BRK7): cute soul wisps, sparkles, petals. Chosen in Hub > Settings > Break effect theme. =====
const BRK7=(()=>{
 const SK=[['souls','Soul wisps'],['sparkle','Star sparkles'],['petals','Petals'],['classic','Classic']];
 const K=()=>(typeof RB_PREFIX=='string'?RB_PREFIX:'')+'rbpbrk';let skin='souls';try{skin=localStorage.getItem(K())||'souls'}catch(_){}
 const L=[];const MAX=60;
 function hex(c){c=(c||'#9cf').replace('#','');if(c.length==3)c=c.replace(/./g,'$&$&');const n=parseInt(c,16)||0;return[n>>16&255,n>>8&255,n&255]}
 function spawn(tx,ty,id){if(skin=='classic'||(typeof QM!='undefined'&&QM.reduce))return;const b=BLK[id],col=b&&b[1]?hex(b[1]):[150,200,255],x=(tx+.5)*T,y=(ty+.5)*T,n=skin=='souls'?2+(Math.random()<.5):4;
  for(let i=0;i<n&&L.length<MAX;i++)L.push({k:skin,x:x+(Math.random()-.5)*T*.6,y:y+(Math.random()-.5)*T*.4,vx:(Math.random()-.5)*40,vy:-50-Math.random()*50,t:0,life:1.3+Math.random()*.6,ph:Math.random()*6.3,r:skin=='souls'?7+Math.random()*3:3+Math.random()*2.5,c:col,tr:[]})}
 {const _b=breakAt;breakAt=function(x,y){const id=tiles[y*W+x];const r=_b.apply(this,arguments);try{if(r&&id&&!tiles[y*W+x])spawn(x,y,id)}catch(_){}return r}}
 function tick(dt){for(let i=L.length-1;i>=0;i--){const w=L[i];w.t+=dt;if(w.t>=w.life){if(w.k=='souls')try{VFX.mote&&VFX.mote(w.x,w.y,'#cfe8ff')}catch(_){}L.splice(i,1);continue}
  const u=w.t/w.life;if(w.k=='souls'){const tx=P.x,ty=P.y+P.h*.4,a=Math.max(0,(u-.35)/.65);w.vx+=((tx-w.x)*2.2*a-w.vx*1.5+Math.sin(w.t*6+w.ph)*60*(1-a))*dt;w.vy+=((ty-w.y)*2.2*a-w.vy*1.2-30*(1-a))*dt}else if(w.k=='petals'){w.vy+=(40-w.vy)*dt;w.vx+=Math.sin(w.t*5+w.ph)*90*dt}else{w.vy+=60*dt}
  w.x+=w.vx*dt;w.y+=w.vy*dt;if(w.k=='souls'){w.tr.push(w.x,w.y);if(w.tr.length>14)w.tr.splice(0,2)}}}
 function draw(g,cx,cy){if(!L.length)return;g.save();g.globalCompositeOperation='lighter';for(const w of L){const u=w.t/w.life,al=Math.min(1,w.t*5)*(1-Math.pow(u,3)),x=w.x-cx,y=w.y-cy,r=w.r;const c=w.c;
  if(w.k=='souls'){const tr=w.tr;for(let j=0;j<tr.length;j+=2){const f=j/tr.length;g.fillStyle='rgba(190,225,255,'+(.22*f*al)+')';g.beginPath();g.arc(tr[j]-cx,tr[j+1]-cy,r*.7*f,0,6.3);g.fill()}
   const gr=g.createRadialGradient(x,y,1,x,y,r*2.6);gr.addColorStop(0,'rgba(220,240,255,'+(.5*al)+')');gr.addColorStop(1,'rgba(140,190,255,0)');g.fillStyle=gr;g.fillRect(x-r*3,y-r*3,r*6,r*6);
   g.globalCompositeOperation='source-over';g.fillStyle='rgba(245,250,255,'+(.92*al)+')';g.beginPath();g.arc(x,y,r,Math.PI,0);g.lineTo(x+r,y+r*1.2);for(let s=0;s<3;s++){g.quadraticCurveTo(x+r*(.67-s*.67)+r*.33,y+r*(.7+Math.sin(w.t*10+s)*.35),x+r*(.33-s*.67),y+r*1.2)}g.closePath();g.fill();
   g.fillStyle='rgba(40,50,90,'+al+')';g.beginPath();g.arc(x-r*.35,y,r*.14,0,6.3);g.arc(x+r*.35,y,r*.14,0,6.3);g.fill();g.fillStyle='rgba(255,150,170,'+(.6*al)+')';g.beginPath();g.arc(x-r*.6,y+r*.3,r*.16,0,6.3);g.arc(x+r*.6,y+r*.3,r*.16,0,6.3);g.fill();g.globalCompositeOperation='lighter'}
  else if(w.k=='sparkle'){g.fillStyle='rgba('+(c[0]+80>255?255:c[0]+80)+','+Math.min(255,c[1]+80)+','+Math.min(255,c[2]+80)+','+al+')';g.save();g.translate(x,y);g.rotate(w.t*3+w.ph);g.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*.35:r*1.4,a=i*Math.PI/4;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();g.fill();g.restore()}
  else{g.fillStyle='rgba(255,'+(170+Math.floor(c[1]/4))+',200,'+(.85*al)+')';g.save();g.translate(x,y);g.rotate(w.t*4+w.ph);g.beginPath();g.ellipse(0,0,r*1.5,r*.8,0,0,6.3);g.fill();g.restore()}}
  g.restore()}
 {const _t=BOSS6.tick,_d=BOSS6.drawProj;BOSS6.tick=function(dt){_t.call(this,dt);try{tick(dt)}catch(e){console.error('BRK7',e)}};BOSS6.drawProj=function(g,cx,cy){_d.call(this,g,cx,cy);try{draw(g,cx,cy)}catch(e){console.error('BRK7d',e)}}}
 {const _p=UI6.ext.post;UI6.ext.post=function(tab,body){if(tab=='settings'){const r=document.createElement('div');r.className='hrow';r.innerHTML='<label>Break effect theme</label><select id="brk7">'+SK.map(s=>'<option value="'+s[0]+'"'+(skin==s[0]?' selected':'')+'>'+s[1]+'</option>').join('')+'</select>';r.querySelector('select').onchange=e=>{skin=e.target.value;try{localStorage.setItem(K(),skin)}catch(_){}};const h=body.querySelector('h3');h&&h.nextSibling?body.insertBefore(r,h.nextSibling):body.appendChild(r)}return _p&&_p.apply(this,arguments)}}
 return{spawn,get skin(){return skin},set(v){skin=v},L}})();
