// ===== The compact valley of a g3 world (VILL9): cut last, after every other part of world generation (caves, lakes, chests, depths), so nothing
// carves into the cliff faces; and the cliffs cannot be broken (the server refuses edits beyond them too, rules.js checkEdit). =====
try{
 {const _g=gen;gen=function(){const r=_g.apply(this,arguments);try{if(cur!='plaza'&&VILL9.gv==3&&!(window.DG&&(DG.run||DG.loading))){VILL9.valley();/* the summer seats and floaties were planned before the cliffs were cut: plan them again inside the valley */try{SUMMER9.build()}catch(_){}/* and the treasure chests: none sealed inside a cliff */try{CHEST7.build()}catch(_){}}}catch(e){console.error('valley',e)}return r}}
 {let warned=0;const _b=breakAt;breakAt=function(x,y){try{if(window.WBND&&cur!='plaza'&&(x<=VILL9.BX0||x>=VILL9.BX1)){if(performance.now()-warned>1500){warned=performance.now();say('The cliff is too hard to break')}return false}}catch(_){}return _b.apply(this,arguments)}}
 // a hard edge at each cliff, so neither walking nor flying high above the sky line can get past one
 {const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{if(window.WBND&&cur!='plaza'){const a=(VILL9.BX0+1)*T+P.w/2+1,b=VILL9.BX1*T-P.w/2-1;if(P.x<a){P.x=a;if(P.vx<0)P.vx=0}else if(P.x>b){P.x=b;if(P.vx>0)P.vx=0}}}catch(_){}return r}}
}catch(e){console.error('valley',e)}
