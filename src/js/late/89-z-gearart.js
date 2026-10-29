// ===== v8 wardrobe in the large portrait (SHOWART, 620x860 design space, front view): the Anonymous dark aura (same cached sprites as
// in-game, scaled up), the Anonymous cloak, and front-facing overlays for the new body pieces. Hats come from GEAR7.front automatically.
(()=>{if(typeof SHOWART=='undefined'||!SHOWART.EXT||typeof GEAR8=='undefined')return;
 const OL='#1a1220',LW=1.7,sh=(c,k)=>AC6.shade(c,k),X=SHOWART.EXT,VI='#8a4cff',GOLD='#f2c14e';
 const fill=(g,c,lw)=>{g.fillStyle=c;g.fill();g.strokeStyle=OL;g.lineWidth=lw||LW;g.stroke()};
 const poly=(g,a)=>{g.beginPath();g.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)g.lineTo(a[i],a[i+1]);g.closePath()};
 const dot=(g,x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.3);g.fill()};
 const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
 const star=(g,cx,cy,r1,r2,n)=>{g.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,r=i%2?r2:r1;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}g.closePath()};
 const aura=(G,t)=>({cx:310,base:905,rise:840,w:250,k:7.5,hx:310,hy:250,hr:250,lv:GEAR8.level(G),boost:0});
 X.back=function(g,G,t){if(GEAR8.level(G))GEAR8.paint(g,aura(G,t),t,'b');const b=G.body;
  if(b=='anonsuit'){const sw=Math.sin(t*1.1)*10;
   g.beginPath();g.moveTo(200,420);g.bezierCurveTo(150,520,112+sw,700,98+sw,890);let x0=98+sw;for(let i=1;i<=12;i++){const x=x0+(526-x0)*(i/12);g.lineTo(x,i%2?862:896)}g.bezierCurveTo(512+sw*.5,700,470,520,420,420);g.closePath();
   const gr=g.createLinearGradient(0,400,0,900);gr.addColorStop(0,'#231b2f');gr.addColorStop(1,'#0a070f');fill(g,gr);g.save();g.clip();g.strokeStyle='rgba(70,52,96,.8)';g.lineWidth=3;for(const[a,c]of[[180,130],[250,230],[370,400],[440,500]]){g.beginPath();g.moveTo(a,460);g.quadraticCurveTo((a+c)/2+sw*.4,700,c+sw*.6,900);g.stroke()}g.restore()}
  if(b=='astrosuit'){for(const s of[-1,1]){rr(g,s<0?168:396,404,56,170,22);fill(g,'#dfe6f2');g.fillStyle='#8e98ab';g.fillRect(s<0?176:404,450,40,6);g.fillRect(s<0?176:404,520,40,6)}}};
 X.body=function(g,G,t,L){const b=G.body,br=Math.sin(t*1.5)*3;g.save();g.translate(0,br);g.lineJoin='round';
  if(b=='anonsuit'){poly(g,[268,378,352,378,310,566]);g.fillStyle='#2b1d42';g.fill();
   poly(g,[300,386,320,386,328,540,310,586,292,540]);g.fillStyle='#08060c';g.fill();g.strokeStyle='rgba(160,110,255,.7)';g.lineWidth=2;g.stroke();
   for(const s of[-1,1]){poly(g,[310+s*42,378,310+s*96,394,310+s*62,478,310+s*84,494,310+s*6,606]);fill(g,'#241c30');g.strokeStyle='rgba(150,100,255,.6)';g.lineWidth=2;g.beginPath();g.moveTo(310+s*42,382);g.lineTo(310+s*62,478);g.lineTo(310+s*8,600);g.stroke()}
   dot(g,316,650,7,'#c9c4d4');dot(g,316,712,7,'#c9c4d4');poly(g,[368,456,398,452,384,472]);g.fillStyle=VI;g.fill();
   const zz=[444,476,414,500,384,482,352,510,320,486,288,512,256,484,226,506,196,480,176,476];g.beginPath();g.moveTo(176,476);g.bezierCurveTo(186,402,250,372,310,372);g.bezierCurveTo(370,372,434,402,444,476);for(let i=2;i<zz.length;i+=2)g.lineTo(zz[i],zz[i+1]);g.closePath();fill(g,'#1d1727');
   g.save();g.globalAlpha=.85;g.strokeStyle=VI;g.lineWidth=3;g.beginPath();g.moveTo(zz[0],zz[1]);for(let i=2;i<zz.length;i+=2)g.lineTo(zz[i],zz[i+1]);g.stroke();g.restore();
   g.strokeStyle='rgba(70,52,96,.9)';g.lineWidth=3;for(const[a,c]of[[240,226],[380,394]]){g.beginPath();g.moveTo(a,392);g.lineTo(c,480);g.stroke()}
   g.beginPath();g.arc(310,396,17,0,6.3);fill(g,'#c9c4d4');g.beginPath();g.moveTo(310,384);g.lineTo(320,396);g.lineTo(310,408);g.lineTo(300,396);g.closePath();fill(g,'#9a5cff',1.4)}
  else if(b=='samurai'){const R='#b0283a',K='#2b2230';for(let i=0;i<5;i++){const y=470+i*60;g.fillStyle=sh(R,-.25);g.fillRect(212+i*2,y+40,196-i*4,6);for(let x=226;x<=394;x+=18)dot(g,x,y+22,3.2,(x/18|0)%2?'#1a1018':'#ffd27a')}
   poly(g,[250,380,370,380,358,430,262,430]);fill(g,K);g.strokeStyle=GOLD;g.lineWidth=3;g.beginPath();g.moveTo(252,388);g.lineTo(368,388);g.stroke();
   g.beginPath();g.arc(310,520,24,0,6.3);fill(g,GOLD,2);star(g,310,520,14,6,3);g.fillStyle=R;g.fill();poly(g,[206,770,414,770,418,812,202,812]);fill(g,K);g.beginPath();g.ellipse(352,792,16,12,0,0,6.3);fill(g,GOLD,1.6);
   for(const s of[-1,1]){g.save();g.translate(310+s*112,430);g.rotate(s*.16);rr(g,-48,0,96,140,6);fill(g,R);g.strokeStyle=sh(R,-.4);g.lineWidth=3;for(const y of[36,72,108]){g.beginPath();g.moveTo(-48,y);g.lineTo(48,y);g.stroke()}for(const y of[18,54,90,126])for(const x of[-30,0,30])dot(g,x,y,3,'#ffd27a');rr(g,-52,-12,104,18,4);fill(g,K);g.restore()}}
  else if(b=='bomber'){const c='#2f6b4f',O='#ff8a2a';poly(g,[276,378,344,378,310,450]);g.fillStyle=O;g.fill();g.beginPath();g.moveTo(248,376);g.quadraticCurveTo(310,420,372,376);g.lineTo(362,360);g.quadraticCurveTo(310,396,258,360);g.closePath();fill(g,'#1e2a24');
   g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;for(let x=262;x<=358;x+=12){g.beginPath();g.moveTo(x,366+Math.abs(x-310)*-.1);g.lineTo(x,384+(1-Math.abs(x-310)/60)*14);g.stroke()}
   g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.moveTo(314,440);g.lineTo(314,900);g.stroke();g.strokeStyle='#c9d2e0';g.lineWidth=3.5;g.stroke();
   g.beginPath();g.arc(248,520,26,0,6.3);fill(g,O,2);star(g,248,520,16,7,5);g.fillStyle='#fff';g.fill();for(const s of[-1,1]){poly(g,[310+s*22,640,310+s*84,628,310+s*82,650,310+s*24,662]);fill(g,sh(c,-.12),1.4)}
   g.fillStyle='#1e2a24';g.fillRect(186,830,252,40);g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=2;for(let x=192;x<436;x+=12){g.beginPath();g.moveTo(x,832);g.lineTo(x,868);g.stroke()}}
  else if(b=='astrosuit'){g.beginPath();g.ellipse(310,386,76,18,0,0,6.3);fill(g,'#c9d2e0');g.fillStyle='#4fb4ff';g.fillRect(240,382,140,6);
   rr(g,258,470,104,62,10);fill(g,'#8e98ab');g.fillStyle='#1a2236';g.fillRect(268,480,48,30);g.fillStyle='#5ff3ff';g.fillRect(272,486,18,5);g.fillRect(272,498,30,4);dot(g,330,488,7,'#ff4d4d');dot(g,348,488,7,'#ffd24a');dot(g,339,512,7,'#3fdf7f');
   g.fillStyle='#ff8a2a';g.fillRect(200,650,224,16);g.beginPath();g.arc(388,446,18,0,6.3);fill(g,'#3a5bd6',1.6);star(g,388,446,10,4,4);g.fillStyle='#fff';g.fill();poly(g,[204,790,416,790,418,824,202,824]);fill(g,'#8e98ab');rr(g,292,786,36,42,6);fill(g,'#dfe6f2',1.4)}
  g.restore()};
 X.front=function(g,G,t){if(GEAR8.level(G))GEAR8.paint(g,aura(G,t),t,'f')};
})();
