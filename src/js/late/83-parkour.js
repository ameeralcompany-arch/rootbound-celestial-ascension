// ===== Sky Run: a parkour course of floating platforms above the Plaza =====
// Touch the glowing START platform (far left, over the cottage side) and climb to the gilded FINISH. The timer runs while you stay on the course;
// touching the ground stops it. Best time is saved. First finish under 90 s pays gems (offline/guest play only) and unlocks the "Sky Runner" title.
const RUN7=(()=>{
 const S=22,N=14,X0=-26,DXs=3,PL=[];for(let k=0;k<N;k++)PL.push({x:X0+k*DXs,y:S-3-k});
 let state='idle',t0=0,best=null,title=false,hud=null,toast=0;try{const o=JSON.parse(localStorage.getItem('rbrun')||'{}');best=o.b||null;title=!!o.t}catch(_){}
 const save=()=>{try{localStorage.setItem('rbrun',JSON.stringify({b:best,t:title}))}catch(_){}},srv=()=>{try{return SHOP7.serverMode}catch(_){return false}};
 function build(){const set=(x,y,b)=>{if(x>0&&x<W-1&&y>=0&&y<H-2){tiles[y*W+x]=b;hp[y*W+x]=b?BLK[b][2]:0}};
  PL.forEach((p,k)=>{const b=k==0?52:k==N-1?58:k%2?47:50;for(let d=0;d<2;d++){set(DX+p.x+d,p.y,b);set(DX+p.x+d,p.y+1,k==0?44:k==N-1?58:49)}})}
 function ensureHud(){if(hud)return;hud=document.createElement('div');hud.style.cssText='position:fixed;top:78px;left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:12px;background:rgba(20,18,40,.72);color:#fff;font:700 18px system-ui,sans-serif;letter-spacing:.06em;z-index:40;pointer-events:none;display:none';document.body.appendChild(hud)}
 const fmt=ms=>(ms/1000).toFixed(2)+'s';
 function platAt(){if(!P.g)return-1;const fy=Math.round((P.y+P.h)/T);for(let k=0;k<N;k++){const p=PL[k];if(fy==p.y&&P.x>=(DX+p.x)*T-8&&P.x<=(DX+p.x+2)*T+8)return k}return-1}
 function tick(now){if(!entered)return;ensureHud();
  const inPlaza=cur=='plaza';if(!inPlaza){hud.style.display='none';state='idle';return}
  const k=platAt(),onGround=P.g&&(P.y+P.h)>=(S*T-4);
  if(k==0&&state!='run'){state='run';t0=now;toast=now+1200;try{SFX7.tone(520,780,.15,'sine',.05)}catch(_){}}
  else if(k==0&&state=='run'){t0=now}
  else if(state=='run'&&k==N-1){const ms=now-t0;state='done';let msg='Sky Run finished: '+fmt(ms);if(best==null||ms<best){best=ms;msg+=' (new best!)'}
   if(ms<90000&&!title){title=true;if(!srv())gems+=150;msg+='  Title: Sky Runner'+(srv()?'':'  +150 gems')}save();try{say(msg);saveP();burst(P.x,P.y,'#ffd24a',30,220,6,'p');SFX7.tone(660,1320,.35,'sine',.07)}catch(_){}toast=now+3500}
  else if(state=='run'&&onGround){state='idle';toast=now+1500;hud.textContent='Fell! Touch START to try again';}
  else if(state=='done'&&onGround){state='idle'}
  if(state=='run'){hud.style.display='block';hud.textContent='Sky Run  '+fmt(now-t0)+(best?'   best '+fmt(best):'')}
  else if(now<toast){hud.style.display='block';if(state=='done')hud.textContent='Finished!  best '+fmt(best)}
  else hud.style.display='none'}
 function draw(now){if(cur!='plaza')return;const t=now/1000;for(const[k,txt,col]of[[0,'START','#7ff5e8'],[N-1,'FINISH','#ffd24a']]){const p=PL[k],sx=(DX+p.x+1)*T-cam.x,sy=p.y*T-cam.y-26-Math.sin(t*2)*3;if(sx<-80||sx>cv.width/ZM+80)continue;g.save();g.font='800 13px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.6)';g.fillStyle=col;g.strokeText(txt,sx,sy);g.fillText(txt,sx,sy);g.restore()}}
 {const _g=gen;gen=function(){_g();if(cur=='plaza')try{build()}catch(e){console.error('run',e)}}}
 {const _dn=drawNPCs;drawNPCs=function(now){try{draw(now)}catch(_){}return _dn(now)}}
 {const _u=update;update=function(dt){_u(dt);try{tick(performance.now())}catch(_){}}}
 if(cur=='plaza'){try{build()}catch(_){}}
 return{PL,N,tick,get state(){return state},get best(){return best},get title(){return title},reset(){best=null;title=false;state='idle';save()}}})();
