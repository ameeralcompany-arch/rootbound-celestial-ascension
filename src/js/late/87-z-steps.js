// ===== Footsteps (STEP7): the sound, dust and scuff change with the block you stand on; soft thud on landing; light splash in water. =====
const STEP7=(()=>{
 let dist=0,alt=0,lastG=true,lastW=false;
 const SURF=b=>b==2||b==15||b==42?'grass':b==1||b==43||b==46?'dirt':b==8||b==59?'sand':b==5||b==47||b==50||b==51?'wood':b==6||b==9||b==56||b==49||b==52?'glass':b==3||b==11||b==12||b==7||b==44||b==45||b==14?'stone':'stone';
 const under=()=>{const tx=Math.floor(P.x/T),ty=Math.floor((P.y+P.h+3)/T);return tx>=0&&tx<W&&ty>=0&&ty<H?tiles[ty*W+tx]:0};
 const S={grass:{f:700,v:.045,tone:null,dust:'#8fcf7a'},dirt:{f:500,v:.05,tone:null,dust:'#b08a60'},sand:{f:900,v:.035,tone:null,dust:'#e8d49a'},wood:{f:260,v:.05,tone:[190,.05,'triangle'],dust:'#c99a62'},glass:{f:3200,v:.03,tone:[1500,.05,'sine'],dust:'#bfe8ff'},stone:{f:1600,v:.045,tone:[300,.03,'square'],dust:'#c8c8d0'}};
 function step(strong){const k=SURF(under()),s=S[k]||S.stone;alt^=1;const v=s.v*(strong?1.5:1)*(.85+Math.random()*.3);
  noise(strong?.12:.06,s.f*(alt?1:1.15),v);if(s.tone)snd(s.tone[0]*(alt?1:.92)*(.95+Math.random()*.1),s.tone[1],s.tone[2],v*.6,.6);
  if(!QM.reduce)for(let i=0;i<(strong?4:1);i++)VFX.add(0,s.dust,P.x+(Math.random()-.5)*10,P.y+P.h-1,(Math.random()-.5)*40-P.vx*.1,-18-Math.random()*26,.45,9,3,{a:.55})}
 function tick(dt){const sw=P.sw;
  if(P.g&&!P.sw){if(!lastG&&P.pvy>260){step(true);snd(95,.16,'sine',.06,.6)}
   const sp=Math.abs(P.vx);if(sp>55){dist+=sp*dt;if(dist>(sp>300?40:34)){dist=0;step(false)}}else dist=Math.min(dist,20)}
  if(sw&&!lastW)noise(.25,1800,.06);lastG=P.g;lastW=sw}
 {const _p=physics;physics=function(dt,ax,busy){const r=_p.apply(this,arguments);try{tick(dt)}catch(_){}return r}}
 return{step,SURF}})();
