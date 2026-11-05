// ===== LAVIART: Lavi, the fairy guide, drawn entirely on canvas (no image files, no game dependencies, so it also loads on a blank page).
//   LAVIART.draw(ctx,{x,y,s,t,flip,mood,pose,mouth,blink,look:[dx,dy],bank})
//     x,y: centre on the canvas. s: scale, 1 = about 200 px tall. t: seconds, drives everything that moves.
//     mood: happy excited thinking surprised sad sleepy. pose: idle fly land point wave celebrate think surprised sleep.
//     mouth: 0..1 lip sync. blink: 0 open .. 1 closed (leave it out and she blinks by herself). look: where her eyes turn, -1..1 each way.
//     bank: -1..1 lean while flying sideways. Poses blend into each other as long as t keeps moving; a repeated or far-off t snaps.
//   LAVIART.portrait(mood): a cached 160x160 canvas of her head and shoulders for dialog bubbles.
//   LAVIART.preload(s): builds the layers for that size now, so the first frame on screen doesn't pay for it.
// Everything that does not change frame to frame (wings, tail, dress, limbs, hair, face) is painted once per size step into small offscreen
// canvases; a frame only places those layers and draws the eyes, brows and mouth. =====
try{window.LAVIART=(()=>{
 const TAU=Math.PI*2,D=Math.PI/180,sin=Math.sin,cos=Math.cos,abs=Math.abs,clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const LINE='#2a2044',SKIN='#fde0cd',SKIN2='#f4c3ac',MINT='#b4efe2',LAV='#c8abf0',GOLD='#f2cf58',GOLD2='#b98a34',GREEN='#7fd653',GREEN2='#49a033';
 const BUCKETS=[.5,1,1.5,2,3];
 // ---- painting helpers, used only while the layers are built
 const P=s=>new Path2D(s);
 const lg=(x,x0,y0,x1,y1,st)=>{const g=x.createLinearGradient(x0,y0,x1,y1);for(const[o,c]of st)g.addColorStop(o,c);return g};
 const rg=(x,cx,cy,r,st,r0)=>{const g=x.createRadialGradient(cx,cy,r0||0,cx,cy,r);for(const[o,c]of st)g.addColorStop(o,c);return g};
 function build(k){
  const LS=k<.75?1.4:1;  // lines stay readable when she is small
  const S=(x0,y0,w,h,fn)=>{const c=document.createElement('canvas');c.width=Math.ceil(w*k);c.height=Math.ceil(h*k);const x=c.getContext('2d');x.scale(k,k);x.translate(-x0,-y0);x.lineJoin=x.lineCap='round';fn(x);return{c,x0,y0,w,h}};
  const fs=(x,p,fill,lw,col)=>{const q=typeof p=='string'?P(p):p;if(fill){x.fillStyle=fill;x.fill(q)}if(lw!==0){x.strokeStyle=col||LINE;x.lineWidth=(lw||1.3)*LS;x.stroke(q)}return q};
  const st=(x,p,col,lw,al)=>{x.save();if(al!=null)x.globalAlpha=al;x.strokeStyle=col;x.lineWidth=(lw||.7)*LS;x.stroke(typeof p=='string'?P(p):p);x.restore()};
  const leaf=(x,px,py,ang,len,wid,fill,lw,col)=>{x.save();x.translate(px,py);x.rotate(ang);const q=P('M0,0C'+len*.28+','+-wid+' '+len*.8+','+-wid*.72+' '+len+',0C'+len*.8+','+wid*.72+' '+len*.28+','+wid+' 0,0Z');fs(x,q,fill,lw==null?.9:lw,col);st(x,'M'+len*.12+',0L'+len*.8+',0',LINE,.45,.45);x.restore()};
  const dot=(x,px,py,r,c,a)=>{x.save();if(a!=null)x.globalAlpha=a;x.fillStyle=c;x.beginPath();x.arc(px,py,r,0,TAU);x.fill();x.restore()};
  const star4=(x,px,py,r,c)=>{x.save();x.translate(px,py);x.fillStyle=c;x.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8,q=i%2?r*.24:r;x[i?'lineTo':'moveTo'](cos(a)*q,sin(a)*q)}x.closePath();x.fill();x.restore()};
  // ---- wings, painted for her right side (viewer's right) and mirrored for the other. Two colourings cross-fade for the iridescence
  const WU=P('M3,-34C9,-54 24,-80 45,-93C56,-100 69,-104 74,-96C80,-87 77,-70 71,-56C65,-41 53,-27 39,-20C26,-14 11,-20 3,-34Z');
  const WL=P('M4,-25C19,-32 41,-28 52,-15C60,-5 54,11 41,16C29,20 18,9 12,-4C9,-12 6,-19 4,-25Z');
  const SU=[[[0,'#fff1a8'],[.3,'#fff8cf'],[.5,'#aef3dc'],[.67,'#b5dcfa'],[.84,'#d0b6f6'],[1,'#a78cf2']],[[0,'#d6f9e8'],[.3,'#c0f5e4'],[.5,'#fdf3b6'],[.68,'#f6c9ec'],[.84,'#bcb5fa'],[1,'#9a9cf6']]];
  const SL=[[[0,'#fff3b4'],[.42,'#b4f3dc'],[.72,'#d6c0f7'],[1,'#ac95f2']],[[0,'#d6f9e8'],[.42,'#fdf2b4'],[.72,'#c6baf9'],[1,'#a0a2f6']]];
  const wingU=v=>S(-2,-108,84,94,x=>{x.save();x.clip(WU);x.fillStyle=rg(x,3,-34,96,SU[v]);x.fillRect(-2,-108,84,94);
    x.globalCompositeOperation='screen';x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=5;x.stroke(WU);x.globalCompositeOperation='source-over';
    const vein='#b89a54';for(const p of['M6,-35C18,-58 36,-80 60,-94','M6,-34C24,-52 46,-68 73,-80','M6,-33C26,-40 48,-46 68,-54','M6,-32C20,-32 34,-30 48,-30'])st(x,p,vein,.75,.8);
    for(const p of['M12,-38C24,-58 40,-72 54,-80C56,-68 38,-50 12,-38Z','M14,-34C32,-46 50,-54 64,-60C60,-48 38,-36 14,-34Z'])st(x,p,'#fff',.7,.6);
    x.restore();if(!v){for(const[a,b,r]of[[66,-92,1.1],[71,-84,.8],[60,-86,.7],[72,-72,1],[65,-66,.6],[56,-94,.6],[68,-60,.7],[50,-84,.5],[62,-76,.5]])dot(x,a,b,r,'#fff',.95);star4(x,64,-80,3.2,'#fff');star4(x,70,-66,2.2,'#fff')}
    fs(x,WU,null,1.5)});
  const wingL=v=>S(0,-36,60,60,x=>{x.save();x.clip(WL);x.fillStyle=rg(x,4,-25,58,SL[v]);x.fillRect(0,-36,60,60);x.globalCompositeOperation='screen';x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=4;x.stroke(WL);x.globalCompositeOperation='source-over';
    for(const p of['M6,-24C20,-22 36,-16 50,-8','M6,-24C16,-14 28,-2 40,12','M6,-24C14,-22 30,-8 46,4'])st(x,p,'#b89a54',.7,.75);x.restore();if(!v){for(const[a,b,r]of[[46,-6,.9],[42,6,.7],[50,2,.6],[36,10,.6]])dot(x,a,b,r,'#fff',.95);star4(x,44,0,2.2,'#fff')}fs(x,WL,null,1.4)});
  // ---- the fluffy tail, a big crescent plume sweeping out to her right (viewer's left)
  const tail=S(-92,-4,96,66,x=>{const T=P('M2,0C-8,8 -22,14 -34,17C-44,20 -55,20 -59,15C-61,11 -57,7 -51,8C-57,2 -70,4 -77,13C-83,23 -84,35 -75,44Q-74,51 -65,50Q-61,57 -52,52Q-46,58 -39,51Q-31,54 -27,46Q-19,47 -16,38Q-8,37 -6,28Q2,22 2,0Z');
    fs(x,T,lg(x,-6,2,-60,52,[[0,'#cdb6ef'],[.42,'#ddcdf6'],[.72,'#c9e6f0'],[1,'#aee9dd']]),1.4);x.save();x.clip(T);x.globalAlpha=.6;x.fillStyle='#fff';x.fill(P('M-74,16C-68,8 -58,6 -52,9C-60,8 -68,14 -70,24C-71,32 -66,38 -60,42C-70,38 -78,28 -74,16Z'));x.fill(P('M-30,22C-40,28 -50,30 -58,28C-50,34 -38,33 -26,26Z'));x.restore();
    for(const p of['M-12,20C-22,28 -36,33 -50,34','M-16,30C-26,38 -38,43 -50,44','M-62,44C-70,38 -74,30 -72,20','M-4,14C-10,20 -16,24 -24,27','M-34,40C-40,44 -46,46 -52,46'])st(x,p,'#9583c9',.7,.7)});
  // ---- legs. +x runs down the limb from its joint, so a pose only sets two angles per leg
  const thigh=S(-6,-9,36,18,x=>{fs(x,'M-1,-6.6C8,-7 18,-6 28,-4.8L28,4.8C18,6 8,7 -1,6.6Z',lg(x,0,-7,0,7,[[0,SKIN],[.65,SKIN],[1,SKIN2]]),0);st(x,'M-1,-6.6C8,-7 18,-6 28,-4.8',LINE,1.2);st(x,'M-1,6.6C8,7 18,6 28,4.8',LINE,1.2);dot(x,26,-.6,2.8,'#ff9f8e',.32)});
  const shin=S(-6,-8,38,16,x=>{x.fillStyle=SKIN;x.beginPath();x.arc(0,0,4.7,0,TAU);x.fill();fs(x,'M0,-4.8C8,-5.4 18,-4.2 29,-3.2L29,3.2C18,4.2 8,5.4 0,4.8Z',lg(x,0,-5,0,5,[[0,SKIN],[.65,SKIN],[1,SKIN2]]),0);st(x,'M0,-4.8C8,-5.4 18,-4.2 29,-3.2',LINE,1.2);st(x,'M0,4.8C8,5.4 18,4.2 29,3.2',LINE,1.2);for(const p of['M6,-1.4l2.4,1.4','M9,1l2,1.2','M4,1.6l1.8,.8'])st(x,p,'#c98a78',.5,.7);for(const p of['M17.5,-3.4L23,3.2','M23,-3.2L17.5,3.4','M23.4,-3L28.6,2.8','M28.6,-2.8L23.4,3'])st(x,p,GREEN2,1.35,1);for(const p of['M17.5,-3.4L23,3.2','M23,-3.2L17.5,3.4','M23.4,-3L28.6,2.8','M28.6,-2.8L23.4,3'])st(x,p,GREEN,.85,1)});
  const foot=S(-9,-10,36,23,x=>{x.scale(1.18,1.18);fs(x,'M-3.8,-3.4C2,-5.2 10,-5.2 15.6,-2.8C19,-1.2 19.2,2.2 16,3L-3.8,3.6Z',SKIN,1.1);for(const q of[12.4,14.6,16.6])st(x,'M'+q+',.1l.5,2.2','#c98a78',.45,.8);fs(x,'M-4.6,3.1C2,3.7 11,3.7 17.8,2.6C18.6,3.4 18.2,4.6 16.8,4.8L-3.4,5.2C-4.8,5 -5,3.8 -4.6,3.1Z',lg(x,0,2,0,6,[[0,GREEN],[1,GREEN2]]),.9);for(const p of['M4.4,-4.6L7.6,3.1','M10.2,-4L7,3.1'])st(x,p,GREEN2,1.9,1);for(const p of['M4.4,-4.6L7.6,3.1','M10.2,-4L7,3.1'])st(x,p,GREEN,1.15,1)});
  // ---- arms
  const armU=S(-5,-7,28,14,x=>{fs(x,'M-1,-4.6C6,-5.2 14,-4.6 22,-3.8L22,3.8C14,4.6 6,5.2 -1,4.6Z',lg(x,0,-5,0,5,[[0,SKIN],[.7,SKIN],[1,SKIN2]]),0);st(x,'M-1,-4.6C6,-5.2 14,-4.6 22,-3.8',LINE,1.2);st(x,'M-1,4.6C6,5.2 14,4.6 22,3.8',LINE,1.2)});
  const SLV=P('M-1,-4.4C8,-5.4 18,-4.4 27,-2.9L27,2.9C18,4.4 8,5.4 -1,4.4Z');
  const armF=S(-9,-11,41,22,x=>{fs(x,SLV,lg(x,-1,0,27,0,[[0,'#cdb2f3'],[.4,'#b8ece9'],[.75,'#f3efc0'],[1,'#d4bdf5']]),1.2);x.save();x.clip(SLV);x.globalAlpha=.55;x.fillStyle='#fff';x.fill(P('M0,-4C10,-4.4 18,-3.8 26,-2.6L26,-1C18,-1.8 10,-2 0,-2Z'));x.restore();for(const[a,b,r]of[[8,0,.5],[14,2,.45],[20,-1,.45],[5,2.6,.4]])dot(x,a,b,r,'#fff',.95);
    for(const[a,b]of[[-40,6],[-18,7.5],[8,8],[32,7],[55,5.6]])leaf(x,-1,0,a*D+Math.PI*.04,b,2.3,lg(x,-1,-8,8,8,[[0,MINT],[1,'#d5c2f5']]),.8);st(x,'M27,-3L27,3','#fff',1.2,.8)});
  const hand=S(-4,-8,22,16,x=>{fs(x,'M0,-3.2C3,-4 6,-4.4 7.4,-4C10.4,-4.2 12,-3.2 11.8,-2.4C11.6,-1.8 9.6,-1.7 8.6,-1.8C11,-1.7 12.6,-.8 12.4,-.1C12.2,.6 10.4,.5 8.8,.3C10.6,.8 11.8,1.6 11.4,2.2C11,2.9 9.4,2.5 7.8,1.9C9,2.8 9.6,3.5 9,4C8.4,4.4 6.4,3.6 5,3.2C3.4,3.5 1.2,3.5 0,3.2Z',SKIN,1)});
  const handP=S(-4,-8,28,16,x=>{fs(x,'M0,-3.2C3,-3.8 6,-3.8 8,-3.3L17,-2.8C18.8,-2.6 18.8,-.8 17,-.7L9,-.6C9.6,.2 9.4,1.2 8.8,1.2C9.6,2.2 9,3.2 8,3C7.4,3.8 6,3.6 5,3.2C3.4,3.5 1.2,3.5 0,3.2Z',SKIN,1);st(x,'M6.4,-3.2C4.6,-5.2 3,-5 2.4,-3.8','#2a2044',.8,1)});
  const pad=S(-13,-13,34,28,x=>{for(const[a,l,w]of[[-55,12,3.4],[-26,15,3.8],[0,17,4],[24,16,3.8],[48,13,3.4],[70,11,3]])leaf(x,-3,-1,a*D,l,w,lg(x,-3,-8,14,10,[[0,'#e4f9f2'],[.55,MINT],[1,'#9fe0d4']]),1);for(const[a,l,w]of[[-14,10,2.6],[14,10,2.6],[38,9,2.4]])leaf(x,-3,-1,a*D,l,w,'#f0fcf8',.7)});
  // ---- skirt, top, satchel
  const skirt=S(-37,-20,74,62,x=>{const U=P('M-9,-14C-16,0 -27,14 -33,27C-27,34 -20,33 -16,31C-12,38 -4,38 0,33C4,38 12,38 16,31C20,34 28,33 33,26C26,12 16,0 9,-14Z');fs(x,U,'#83d6cf',1.3);
    const Q=P('M-10,-15C-14,-2 -24,12 -30,24C-26,30 -20,29 -17,26C-14,32 -6,34 -2,28C2,34 10,34 14,28C18,31 26,29 30,22C24,10 14,-3 10,-15Z');fs(x,Q,lg(x,0,-15,0,32,[[0,'#bfa0ee'],[.55,'#cdb8f4'],[.85,'#bfe5ec'],[1,'#a8ecdf']]),1.3);x.save();x.clip(Q);x.globalAlpha=.3;x.fillStyle='#7f66c4';x.fill(P('M-10,-15C-14,-2 -24,12 -30,24L-24,30C-20,16 -12,0 -6,-15Z'));x.fill(P('M10,-15C14,-2 24,10 30,22L22,30C18,16 12,0 7,-15Z'));x.globalAlpha=.5;x.fillStyle='#fff';x.fill(P('M-3,-12C-7,4 -11,14 -13,26L-8,28C-6,14 -3,2 -1,-12Z'));x.restore();
    for(const p of['M-5,-12C-8,4 -11,16 -17,26','M5,-12C7,4 10,16 14,27','M-1,-12C-1,6 -2,18 -2,28','M-11,-2C-15,8 -19,16 -23,24','M11,-2C14,8 19,16 22,23'])st(x,p,'#7e68bd',.7,.7);for(const[a,b,r]of[[-16,14,.5],[12,10,.5],[-6,20,.5],[20,18,.45],[3,14,.4]])dot(x,a,b,r,'#fff',.95)});
  const top=S(-18,-48,36,40,x=>{fs(x,'M-4.2,-48L4.2,-48L4.8,-37L0,-25L-4.8,-37Z',lg(x,0,-48,0,-30,[[0,SKIN2],[.45,SKIN],[1,SKIN]]),1.1);
    const Q=P('M-6,-41L-13,-37C-13,-28 -11,-20 -9.6,-14L9.6,-14C11,-20 13,-28 13,-37L6,-41L0,-26Z');fs(x,Q,lg(x,0,-41,0,-14,[[0,'#d5c1f6'],[1,'#b597ea']]),1.3);for(const p of['M-5,-37L-1,-24','M5,-37L1,-24','M-8,-30C-6,-24 -5,-19 -5,-15','M8,-30C6,-24 5,-19 5,-15'])st(x,p,'#7e68bd',.65,.65);
    st(x,'M-5.2,-39.5C-4,-33 -2,-29 0,-27C2,-29 4,-33 5.2,-39.5',GOLD2,.8,1);fs(x,'M0,-28C2.4,-25.6 3.2,-23.4 2.4,-21.6C1.5,-19.8 -1.5,-19.8 -2.4,-21.6C-3.2,-23.4 -2.4,-25.6 0,-28Z',rg(x,-.6,-23,4.4,[[0,'#d4fff8'],[.5,'#49d6d0'],[1,'#17809a']]),1.1,GOLD2);dot(x,-.8,-24,.55,'#fff');
    x.lineWidth=.6;for(let i=0,a=-11.5;a<=11.6;a+=2.3,i++){const y=-13.8+(.6-.012*a*a);x.save();x.translate(a,y);x.rotate(i%2?.5:-.5);x.fillStyle=i%2?GOLD:'#e0b644';x.strokeStyle=GOLD2;x.beginPath();x.ellipse(0,0,1.9,1.45,0,0,TAU);x.fill();x.stroke();x.restore()}fs(x,'M-12.5,-16.2C-5,-17 5,-17 12.5,-16.2L12.5,-11.6C5,-10.6 -5,-10.6 -12.5,-11.6Z',null,.9,LINE)});
  const belttail=S(-14,-18,44,44,x=>{for(const[a,b,c,d]of[[-7,-13,-16,2],[-3,-12,-7,4],[1,-12,1,4.6],[5,-12,8,3.6]])leaf(x,a,b,Math.atan2(d-b,c-a),Math.hypot(d-b,c-a),2.6,lg(x,0,-14,0,4,[[0,MINT],[1,'#d7c3f6']]),.85);st(x,'M4,-11C8,-8 10,-4 12,-1',GOLD2,2,1);st(x,'M4,-11C8,-8 10,-4 12,-1',GOLD,1.2,1);for(const[a,b]of[[6,-9.2],[8.4,-6.6],[10.2,-3.8]])dot(x,a,b,.45,GOLD2)});
  const satchel=S(-16,-3,32,29,x=>{st(x,'M-6,-2C-2,1 2,3 3,6',GOLD2,1.8,1);st(x,'M-6,-2C-2,1 2,3 3,6',GOLD,1,1);const Q=P('M-9,6C-9,1 9,1 10,6L12,15C12,24 -10,24 -11,15Z');fs(x,Q,lg(x,0,2,0,22,[[0,'#c6f0d6'],[1,'#94d8bc']]),1.2);fs(x,'M-9,6C-5,1 6,1 10,6L9,11C5,14 -4,14 -9,11Z','#aee4c8',1);for(const[a,b,r]of[[-6,16,.55],[8,18,.45],[-3,20,.5],[6,14,.4]])dot(x,a,b,r,'#fff');x.fillStyle=LINE;dot(x,-2.6,15,.95,LINE);dot(x,3.4,15,.95,LINE);st(x,'M-.8,16.4Q.4,18.6 1.6,16.4',LINE,.7,1);dot(x,-4.4,17,.9,'#ff9fb0',.8);dot(x,5.4,17,.9,'#ff9fb0',.8);fs(x,'M-1,9.5h3.2v3.2h-3.2Z',GOLD,.7,GOLD2)});
  // ---- head, in head coordinates: centre (0,0), chin at +27
  const hairB=S(-36,-38,72,66,x=>{const Q=P('M-26.4,-8C-28,-28 -14,-32.6 0,-32.6C14,-32.6 28,-28 26.4,-8C28,2 29,8 33,13C29,16 25,16 22,14C22,18 20,21 16,22C14,19 12,18 10,17L-10,17C-12,18 -14,19 -16,22C-20,21 -22,18 -22,14C-25,16 -29,16 -33,13C-29,8 -28,2 -26.4,-8Z');fs(x,Q,lg(x,0,-35,0,22,[[0,'#d6f3f0'],[.6,'#bfe6e6'],[1,'#c0cdee']]),1.4);for(const p of['M-24,4C-25,8 -26,11 -29,13','M24,4C25,8 26,11 29,13','M-18,10C-18,14 -18,17 -17,20','M18,10C18,14 18,17 17,20'])st(x,p,'#7f9ac4',.7,.6)});
  const face=S(-24,-26,48,58,x=>{const Q=P('M-21,-6C-21.4,7 -14,20 -3,26.4C-1,27.6 1,27.6 3,26.4C14,20 21.4,7 21,-6C21,-24 -21,-24 -21,-6Z');fs(x,Q,SKIN,1.25);x.save();x.clip(Q);x.fillStyle=lg(x,0,-22,0,-6,[[0,'rgba(190,120,110,.34)'],[1,'rgba(190,120,110,0)']]);x.fillRect(-24,-26,48,22);x.restore();
    for(const s of[-1,1]){x.save();x.fillStyle=rg(x,s*14,11.5,7,[[0,'rgba(255,130,120,.5)'],[1,'rgba(255,130,120,0)']]);x.beginPath();x.ellipse(s*14,11.5,7,4.4,0,0,TAU);x.fill();x.restore();
     for(const[a,b]of[[6,9.5],[8,11],[5,12],[9,8.6],[3.6,10]])dot(x,s*a,b,.36,'#c9775e',.85);
     for(const[a,b,r]of[[17,8,1],[15,12.6,1.2],[17.6,12,.72]]){x.save();x.translate(s*a,b);x.fillStyle='#b5c6dc';x.strokeStyle='#6f7fa0';x.lineWidth=.35;x.beginPath();x.moveTo(0,-r*1.7);x.bezierCurveTo(r*1.1,-r*.3,r,r,0,r);x.bezierCurveTo(-r,r,-r*1.1,-r*.3,0,-r*1.7);x.fill();x.stroke();x.restore()}}
    st(x,'M-.6,9C-.1,9.8 .6,9.8 1,9.2','#c9775e',.7,1)});
  const hairF=S(-36,-42,72,50,x=>{for(const p of['M-25.6,-12C-29,-12 -31.6,-10.4 -32.6,-6.6C-30,-8 -28,-7 -26,-5Z','M25.6,-12C29,-12 31.6,-10.4 32.6,-6.6C30,-8 28,-7 26,-5Z'])fs(x,p,'#e6f8f6',1.1);const Q=P('M-27,-7C-31,-20 -24,-31 -12,-34C-6,-36 6,-36 12,-34C24,-31 31,-20 27,-7C27,-3 25,0 22,3C22,-3 20,-8 16,-11C15.6,-8 14,-6.6 11,-6C12,-9 11.4,-11 10,-14C8.4,-11 6,-9 3.4,-8.2C4,-11 3.6,-13 2.4,-15C0,-11 -3,-9 -6.6,-8C-5.6,-11 -6,-13 -7,-15C-9,-11.6 -12,-9.6 -15,-9.4C-15,-10.6 -14.4,-12 -13.4,-13C-17,-10 -21,-5 -22,3C-25,0 -27,-3 -27,-7Z');
    fs(x,Q,lg(x,0,-33,0,0,[[0,'#f8fffe'],[.5,'#e2f8f5'],[.85,'#bfe8e8'],[1,'#b8d2ee']]),1.35);x.save();x.clip(Q);x.globalAlpha=.28;x.fillStyle='#8fa0e0';x.fill(P('M-29,-18C-24,-8 -22,-2 -22,4L-30,4Z'));x.fill(P('M29,-18C24,-8 22,-2 22,4L30,4Z'));x.globalAlpha=.8;x.strokeStyle='#fff';x.lineWidth=2.6;x.stroke(P('M-22,-20C-12,-29 12,-29 22,-20'));x.restore();
    for(const p of['M-3,-30C-6,-24 -6,-18 -7,-15','M6,-30C8,-24 9,-18 10,-14','M-12,-28C-14,-22 -15,-17 -15,-12','M14,-27C15,-22 16,-16 16,-11','M1,-31C1,-25 2,-20 2.4,-15','M-23,-22C-24,-16 -24,-8 -23,0','M23,-22C24,-16 24,-8 23,0'])st(x,p,'#7fa6c8',.7,.7);
    // the leaf crown
    st(x,'M-24,-13C-16,-27 16,-27 24,-13','#6fbb9c',.8,1);for(let i=0;i<=10;i++){const u=i/10,a=(u-.5)*2,px=a*23.6,py=-13-11.2*(1-a*a),ang=(i%2?-1:1)*.75+a*1.2-Math.PI/2;leaf(x,px,py,ang,5.4,1.9,i%3?'#d6f5e3':'#a9e6ca',.6,'#4e9379')}});
  const lock=S(-12,-3,20,30,x=>{fs(x,'M-3,-1C-6,6 -7,13 -8,18C-9,21 -10,23 -11,24C-7,25 -3,23 -1,20C2,15 4,8 4,-1Z',lg(x,0,0,0,24,[[0,'#e2f8f5'],[.6,'#c8ecec'],[1,'#c0d0ee']]),1.2);st(x,'M0,2C-1,8 -3,14 -6,20','#7f9ac4',.6,.75)});
  const tuft=S(-10,-13,20,16,x=>{fs(x,'M-2,1C-1.6,-3 1,-7.4 6.4,-9.6C4,-6.6 3,-3 2.6,1Z','#eefcfa',.95)});
  // the iris, one per look: dark rim, bright lower crescent, pupil, highlights
  const iris=S(-8,-9,16,18,x=>{x.fillStyle=rg(x,0,1.6,8,[[0,'#7df4ec'],[.42,'#37cfd4'],[.72,'#129aa8'],[1,'#0d5e78']]);x.beginPath();x.ellipse(0,0,6.3,7.7,0,0,TAU);x.fill();x.fillStyle=lg(x,0,-7.7,0,-1,[[0,'rgba(10,46,76,.95)'],[1,'rgba(10,46,76,0)']]);x.fill();x.strokeStyle='#123a58';x.lineWidth=.7*LS;x.stroke();x.fillStyle='#10304e';x.beginPath();x.ellipse(0,-.4,2.9,3.7,0,0,TAU);x.fill();x.fillStyle=lg(x,0,2,0,7,[[0,'rgba(190,255,245,0)'],[1,'rgba(205,255,248,.95)']]);x.beginPath();x.ellipse(0,4.1,4.6,2.8,0,0,TAU);x.fill();dot(x,-2.5,-3.2,1.95,'#fff');dot(x,2.6,1.4,.95,'#fff');dot(x,-1,3.8,.5,'#fff',.9)});
  const glow=S(-84,-84,168,168,x=>{x.fillStyle=rg(x,0,0,84,[[0,'rgba(214,190,255,.5)'],[.55,'rgba(170,236,235,.18)'],[1,'rgba(170,236,235,0)']]);x.fillRect(-84,-84,168,168)});
  const spark=['#ffffff','#fff2b0','#b8f6ee','#dcc4ff'].map(c=>S(-6,-6,12,12,x=>{star4(x,0,0,5.6,c);dot(x,0,0,1.1,'#fff')}));
  return{wingU:[wingU(0),wingU(1)],wingL:[wingL(0),wingL(1)],tail,thigh,shin,foot,armU,armF,hand,handP,pad,skirt,top,belttail,satchel,hairB,face,hairF,lock,tuft,iris,glow,spark,lw:LS};
 }
 const BY={};const bundle=b=>BY[b]||(BY[b]=build(b));
 const bucket=k=>{for(const b of BUCKETS)if(k<=b*1.05)return b;return 3};
 const blit=(g,s)=>g.drawImage(s.c,s.x0,s.y0,s.w,s.h);
 // ---- face shapes, built once
 let F=null;const shapes=()=>F||(F={
  scl:P('M-6.9,-1.4C-6.6,-6 -3.6,-8 0,-8C3.6,-8 6.6,-6 6.9,-1.4C7,3.4 4.2,8 0,8C-4.2,8 -7,3.4 -6.9,-1.4Z'),
  lid:P('M-8,-1.4C-6,-4.2 -3,-5 0,-5C3,-5 6,-4.2 8,-1.4L8,-13L-8,-13Z'),
  lash:P('M-7.2,-1C-5.4,-4.4 -3,-5 0,-5C3.4,-5 6,-4.2 7.4,-.6L9.4,-2.2M7.6,-1.8L9,-4.4'),
  low:P('M-4.2,7.2C-1.6,8.6 1.6,8.6 4.2,7.2'),
  shut:P('M-6.8,1.4C-3.8,5 3.8,5 6.8,1.4L8.8,.4M6.4,2.4L7.8,3.8'),
  brow:P('M-5.4,.7C-2.6,-1.1 2.6,-1.1 5.4,.7'),
  smile:P('M-3.8,-.4C-1.8,2.2 1.8,2.2 3.8,-.4'),flat:P('M-2.4,.6C-.8,.1 1,0 2.4,-.5'),frown:P('M-2.8,1.2C-1.2,-.7 1.2,-.7 2.8,1.2'),
  open:P('M-5,-.8C-2.4,-1.8 2.4,-1.8 5,-.8C4.8,4.4 2.4,6 0,6C-2.4,6 -4.8,4.4 -5,-.8Z'),tongue:P('M-3,3.6C-1.4,2.2 1.4,2.2 3,3.6C2,5.4 -2,5.4 -3,3.6Z'),
  z:P('M-3,-3L3,-3L-3,3L3,3')});
 const MOOD={happy:{o:1,by:0,br:0,lr:0,mb:0,m:'smile',ir:1},excited:{o:1,by:-1.6,br:-.08,lr:0,mb:.62,m:'smile',ir:1.04,star:1,blush:1},thinking:{o:.8,by:0,br:.05,lr:0,mb:0,m:'flat',ir:1,lk:[.75,-.55],raise:1},surprised:{o:1,by:-3,br:-.1,lr:0,mb:.55,m:'o',ir:.8},sad:{o:.7,by:.4,br:.34,lr:.2,mb:0,m:'frown',ir:1,lk:[0,.55]},sleepy:{o:.4,by:.8,br:.06,lr:.06,mb:0,m:'flat',ir:1}};
 // ---- poses: a target for every joint. Angles in degrees, 0 = viewer's right, 90 = straight down
 const N=20,cur=new Float32Array(N),tgt=new Float32Array(N);let lastT=-1e9,phase=0,seeded=false;
 const I={rot:0,y:1,head:2,aL1:3,aL2:4,aR1:5,aR2:6,lL1:7,lL2:8,lR1:9,lR2:10,wB:11,wA:12,wR:13,tail:14,hx:15,fL:16,fR:17,wRot:18,sk:19};
 function pose(p,t){const b=sin(t*1.9),bob=sin(t*1.7),q=tgt,set=(rot,y,head,aL1,aL2,aR1,aR2,lL1,lL2,lR1,lR2,wB,wA,wR,tail,fL,fR,wRot,sk)=>{q[0]=rot;q[1]=y;q[2]=head;q[3]=aL1;q[4]=aL2;q[5]=aR1;q[6]=aR2;q[7]=lL1;q[8]=lL2;q[9]=lR1;q[10]=lR2;q[11]=wB;q[12]=wA;q[13]=wR;q[14]=tail;q[15]=0;q[16]=fL;q[17]=fR;q[18]=wRot;q[19]=sk};
  switch(p){
   case'fly':set(.1,bob*1.4,-.06+sin(t*1.4)*.02,112+b*4,150+b*6,68-b*4,30-b*6,97,120,72,126,1,.3,24,-.14+sin(t*5)*.06,-30,-40,.02,sin(t*3)*.05);break;
   case'land':set(0,bob*.7,.02,152+b*2,176,28-b*2,4,88,92,92,88,.94,.14,10,.06,-42,-42,.04,sin(t*2)*.03);break;
   case'point':set(.05,bob*2,.05+sin(t*1.1)*.015,108,66,8+b*1.2,-6+b*1.6,94,86,70,112,1,.11,6.5,sin(t*1.3)*.05,-22,-46,0,sin(t*1.3)*.025);break;
   case'wave':set(-.03,bob*2.2,-.05+sin(t*2.2)*.02,120+b*2,150,-34+sin(t*7.4)*5,-84+sin(t*7.4)*24,94,86,70,112,1,.12,7,sin(t*1.3)*.06,-22,-46,0,sin(t*1.5)*.03);break;
   case'celebrate':{const j=abs(sin(t*4.6)),w=sin(t*9.2);set(sin(t*2.3)*.05,-j*11,sin(t*4.6)*.05,226+w*9,258+w*12,-46-w*9,-78-w*12,80+j*14,82-j*26,74-j*14,104+j*26,1.03,.3,20,sin(t*4.6)*.13,-40,-46,0,sin(t*4.6)*.06);break}
   case'think':set(-.03,bob*1.6,-.11+sin(t*.9)*.015,102,28,74,-114+b*1.2,94,86,70,112,.98,.08,5,sin(t*1.1)*.05,-22,-46,0,sin(t*1.1)*.02);break;
   case'surprised':set(-.06,-4+sin(t*16)*.5,-.04,118,234,62,-54,97,82,83,98,1.1,.05,16,-.16,-46,-46,-.03,0);break;
   case'sleep':set(.3,8+sin(t*1.05)*1.5,.26+sin(t*1.05)*.012,104,62,84,122,58,132,48,142,.74,.035,2.1,.16,-44,-44,.2,.02);break;
   default:set(sin(t*.9)*.015,bob*2.4,sin(t*1.1)*.03,128+b*2,168+b*1.5,52-b*2,12-b*1.5,94,86,70,112,1,.11,6.5,sin(t*1.3)*.05,-22,-46,0,sin(t*1.3)*.025)}
 }
 const STN=26,SEED=new Float32Array(STN*4);for(let i=0;i<STN;i++){const h=n=>{const v=sin((i+1)*n)*43758.5453;return v-Math.floor(v)};SEED[i*4]=h(12.9);SEED[i*4+1]=h(78.2);SEED[i*4+2]=h(37.7);SEED[i*4+3]=h(93.9)}
 function sparkles(g,B,t,n,front){for(let i=0;i<n;i++){if((i%2==0)!=front)continue;const a=SEED[i*4],b=SEED[i*4+1],c=SEED[i*4+2],l=(t*(.22+c*.3)+b)%1,al=sin(l*Math.PI);if(al<.05)continue;const ang=a*TAU,r=46+b*62,x=cos(ang+t*.12)*r,y=sin(ang+t*.12)*r*.95-22-l*20,sz=(1.4+c*2.6)*(.55+al*.55);g.globalAlpha=al*.95;g.drawImage(B.spark[i&3].c,x-sz,y-sz,sz*2,sz*2)}g.globalAlpha=1}
 function limb(g,B,x,y,a1,len1,sp1,a2,len2,sp2,sp3,a3,mir){g.save();g.translate(x,y);g.rotate(a1*D);if(mir)g.scale(1,-1);blit(g,sp1);g.translate(len1,0);g.rotate((a2-a1)*D*(mir?-1:1));blit(g,sp2);g.translate(len2,0);if(a3)g.rotate(a3*D*(mir?-1:1));blit(g,sp3);g.restore()}
 function wing(g,B,side,ux,uy,flap,shim,base,wRot,bank){const near=1+bank*side*.28,up=base*near*(.88+.12*flap),lo=base*near*(.9+.1*sin(phase-.9));
  g.save();g.translate(side*ux,uy);g.rotate(side*(flap*.05+wRot));g.scale(side*up,1);g.translate(-3,34);blit(g,B.wingU[0]);if(shim>.02){g.globalAlpha=shim;blit(g,B.wingU[1]);g.globalAlpha=1}g.restore();
  g.save();g.translate(side*ux,uy+11);g.rotate(side*(sin(phase-.9)*-.05+wRot*1.4));g.scale(side*lo,1);g.translate(-4,25);blit(g,B.wingL[0]);g.restore()}
 function eye(g,B,side,M,closed,lx,ly){const f=shapes(),o=M.o*(1-closed);g.save();g.translate(side*10.6,-.6);if(M.lr)g.rotate(side*M.lr);
  if(o<.16){g.strokeStyle=LINE;g.lineWidth=1.5*B.lw;if(side<0)g.scale(-1,1);g.stroke(f.shut);g.restore();return}
  g.fillStyle='#fdfeff';g.fill(f.scl);g.save();g.clip(f.scl);const ir=M.ir;g.translate(lx*1.9,ly*1.3);if(ir!=1)g.scale(ir,ir);blit(g,B.iris);if(M.star){g.globalAlpha=.95;g.drawImage(B.spark[0].c,-5.6,-6.4,6.4,6.4);g.drawImage(B.spark[1].c,1,.4,3.6,3.6);g.globalAlpha=1}g.restore();
  g.save();if(side<0)g.scale(-1,1);const dy=o<1?(1-o)*10.4:0;if(dy){g.translate(0,dy);g.fillStyle=SKIN;g.fill(f.lid)}g.strokeStyle=LINE;g.lineWidth=1.75*B.lw;g.stroke(f.lash);if(dy)g.translate(0,-dy);g.lineWidth=.7*B.lw;g.strokeStyle='#6d5a70';g.stroke(f.low);g.restore();g.restore()}
 function head(g,B,o){const f=shapes(),M=o.M,t=o.t;blit(g,B.hairB);blit(g,B.face);
  if(M.blush){g.fillStyle='rgba(255,120,120,.28)';g.beginPath();g.ellipse(-14,11,7,3.8,0,0,TAU);g.ellipse(14,11,7,3.8,0,0,TAU);g.fill()}
  eye(g,B,-1,M,o.closed,o.lx,o.ly);eye(g,B,1,M,o.closed,o.lx,o.ly);
  // the mouth: lip sync wins over the mood's own shape
  g.save();g.translate(0,16.6);const op=Math.max(o.mouth,o.sleep?0:M.mb*(o.mouth>0?.3:1));
  if(op>.07){if(M.m=='o'&&o.mouth<=.07){g.fillStyle='#a33d50';g.strokeStyle=LINE;g.lineWidth=1*B.lw;g.beginPath();g.ellipse(0,1.2,2.2,3,0,0,TAU);g.fill();g.stroke()}else{g.scale(.72+op*.42,.4+op*.78);g.fillStyle='#a33d50';g.fill(f.open);g.fillStyle='#ff9aa6';g.fill(f.tongue);g.lineWidth=1*B.lw;g.strokeStyle=LINE;g.stroke(f.open)}}
  else{g.strokeStyle=LINE;g.lineWidth=1.05*B.lw;g.stroke(M.m=='flat'?f.flat:M.m=='frown'?f.frown:f.smile)}
  g.restore();
  // hair over the face, then the side locks and top tuft that sway
  const sw=sin(t*1.6)*.045+(o.sway||0);g.save();g.translate(-23,-5);g.rotate(sw);blit(g,B.lock);g.restore();g.save();g.translate(23,-5);g.rotate(-sw*.8);g.scale(-1,1);blit(g,B.lock);g.restore();blit(g,B.hairF);g.save();g.translate(.5,-34);g.rotate(sin(t*2.1)*.07+(o.sway||0));blit(g,B.tuft);g.restore();
  // brows sit on top of the fringe, soft, the way anime faces read them
  g.lineWidth=1.05*B.lw;g.strokeStyle='#5f6f9f';for(let i=-1;i<=1;i+=2){g.save();g.translate(i*10.8,-11.6+M.by-(M.raise&&i>0?2.2:0));g.rotate(i*M.br);g.stroke(f.brow);g.restore()}
 }
 const HEADO={M:null,t:0,closed:0,lx:0,ly:0,mouth:0,sleep:false,sway:0};
 function blinkAt(t){const c=t%4.3;let v=c<.15?sin(c/.15*Math.PI):0;const d=t%13.7;if(d>4.5&&d<4.62)v=Math.max(v,sin((d-4.5)/.12*Math.PI));return v}
 function draw(g,o){
  const t=o.t||0,s=o.s==null?1:o.s,flip=o.flip?-1:1,bank=clamp(o.bank||0,-1,1),pn=o.pose||'idle',M=MOOD[o.mood]||(pn=='sleep'?MOOD.sleepy:MOOD.happy);
  let scl=1;if(g.getTransform){const m=g.getTransform();scl=Math.hypot(m.a,m.b)||1}const B=bundle(bucket(s*scl));
  pose(pn,t);const dt=t-lastT;lastT=t;if(!seeded||dt<=0||dt>.5){cur.set(tgt);phase=t*tgt[I.wR];seeded=true}else{const u=Math.min(1,dt*11);for(let i=0;i<N;i++)cur[i]+=(tgt[i]-cur[i])*u;phase+=dt*cur[I.wR]}
  const q=cur,flap=sin(phase)*q[I.wA]/.12,wA=q[I.wA],shim=.34+.26*sin(t*1.3);
  g.save();g.translate(o.x||0,o.y||0);g.scale(flip*s,s);g.rotate(bank*.2);
  g.globalAlpha=.5+.1*sin(t*1.5);blit(g,B.glow);g.globalAlpha=1;
  const nSp=pn=='celebrate'?STN:pn=='sleep'?4:12;sparkles(g,B,t,nSp,false);
  g.translate(0,q[I.y]+9);g.rotate(q[I.rot]);
  // wings, tail
  const f2=clamp(flap,-1.6,1.6)*(wA>.2?1:.7);wing(g,B,-1,3,-34,f2,shim,q[I.wB],q[I.wRot],bank*flip);wing(g,B,1,3,-34,f2,shim,q[I.wB],q[I.wRot],bank*flip);
  g.save();g.translate(-6,8);g.rotate(q[I.tail]);g.transform(1,0,sin(t*1.7)*.05,1,0,0);g.translate(0,-3);blit(g,B.tail);g.restore();
  // legs: her far (viewer's right) leg first
  limb(g,B,8,20,q[I.lR1],27,B.thigh,q[I.lR2],28,B.shin,B.foot,q[I.fR],false);limb(g,B,-7,20,q[I.lL1],27,B.thigh,q[I.lL2],28,B.shin,B.foot,q[I.fL],false);
  // skirt, top
  g.save();g.translate(0,-14);g.rotate(q[I.sk]);g.translate(0,14);blit(g,B.skirt);blit(g,B.belttail);g.save();g.translate(17,-7);g.rotate(-q[I.sk]*2.4+sin(t*1.9)*.03);blit(g,B.satchel);g.restore();g.restore();blit(g,B.top);
  // arms, shoulder feathers, head. A hand held to the chin goes in front of the face
  const point=pn=='point',think=pn=='think';
  limb(g,B,-12.6,-36,q[I.aL1],19,B.armU,q[I.aL2],26,B.armF,B.hand,0,true);if(!think)limb(g,B,12.6,-36,q[I.aR1],19,B.armU,q[I.aR2],26,B.armF,point?B.handP:B.hand,0,false);
  g.save();g.translate(-11.5,-37);g.rotate(Math.PI+(q[I.aL1]-128)*D*-.35*-1);g.scale(1,-1);blit(g,B.pad);g.restore();g.save();g.translate(11.5,-37);g.rotate((q[I.aR1]-52)*D*.35);blit(g,B.pad);g.restore();
  const sleep=pn=='sleep',H=HEADO;H.M=M;H.t=t;H.sleep=sleep;H.closed=o.blink!=null?clamp(o.blink,0,1):sleep?1:blinkAt(t);H.mouth=sleep?0:clamp(o.mouth||0,0,1);H.sway=-bank*.12-q[I.rot]*.3;
  let lx=0,ly=0;if(o.look){lx=clamp(o.look[0],-1,1)*flip;ly=clamp(o.look[1],-1,1)}else if(M.lk){lx=M.lk[0];ly=M.lk[1]}else if(point)lx=.7;else if(pn=='fly')lx=.2;H.lx=lx;H.ly=ly;
  g.save();g.translate(0,-44);g.rotate(q[I.head]);g.scale(1.1,1.1);g.translate(0,-27);head(g,B,H);g.restore();
  if(think)limb(g,B,12.6,-36,q[I.aR1],19,B.armU,q[I.aR2],26,B.armF,B.hand,0,false);
  if(sleep){g.strokeStyle='#8c7bd0';g.lineCap=g.lineJoin='round';for(let i=0;i<3;i++){const l=(t*.32+i/3)%1,a=sin(l*Math.PI);g.globalAlpha=a*.95;g.save();g.translate(24+l*20+i*3,-92-l*28);const k=.55+l*.85;g.scale(k,k);g.lineWidth=1.5;g.stroke(shapes().z);g.restore()}g.globalAlpha=1}
  sparkles(g,B,t,nSp,true);g.restore();
 }
 const PORT={};function portrait(mood){const m=MOOD[mood]?mood:'happy';if(PORT[m])return PORT[m];const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d'),B=bundle(3),H=HEADO,Ms=1.86;g.lineJoin=g.lineCap='round';
  g.save();g.translate(80,87);g.scale(Ms,Ms);g.save();g.translate(0,71);for(const side of[-1,1]){g.save();g.translate(side*3,-34);g.scale(side,1);g.translate(-3,34);blit(g,B.wingU[0]);g.restore()}blit(g,B.top);g.save();g.translate(-11.5,-37);g.rotate(Math.PI);g.scale(1,-1);blit(g,B.pad);g.restore();g.save();g.translate(11.5,-37);blit(g,B.pad);g.restore();g.restore();g.scale(1.1,1.1);
  const M=MOOD[m];H.M=M;H.t=.4;H.sleep=false;H.closed=0;H.mouth=0;H.sway=0;H.lx=M.lk?M.lk[0]:0;H.ly=M.lk?M.lk[1]:0;head(g,B,H);g.restore();return PORT[m]=c}
 function preload(s){bundle(bucket(s==null?1:s));shapes()}
 return{draw,portrait,preload,POSES:['idle','fly','land','point','wave','celebrate','think','surprised','sleep'],MOODS:Object.keys(MOOD)}})()}catch(e){console.error('LAVIART',e)}
