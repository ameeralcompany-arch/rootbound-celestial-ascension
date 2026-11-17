// World building online, end to end: a real server and two real headless players in one world. A colour block and decorations placed by one
// player appear for the other with the same colour / kind; a duck greeting replays for the other player; a lamp switched by one is switched for
// the other; the server refuses an edit with a bad variant; everything is still there after leaving and coming back.   node tests/worldbuild-online.js
const path=require('path'),fs=require('fs'),os=require('os');
const {chromium}=require('playwright');const {createServer}=require('../server/server');const R=require('../server/rules');
let fails=0;const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&x!==''?'  - '+(typeof x=='string'?x:JSON.stringify(x)).slice(0,500):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},240000).unref();
// the rule itself first (no browser)
{const w={edits:{},objs:{},meta:null,g:3},k=40*256+128;
 ok('rules: a colour block / decoration edit with a clean variant and state is accepted',R.checkEdit(w,{k,a:[115,0,2*64+33,0]},'u1')&&R.checkEdit(w,{k,a:[140,0,40,3]},'u1')&&R.checkEdit(w,{k,a:[3,0,0,0]},'u1'));
 ok('rules: a bad variant or state is refused (negative, too big, not a number, extra slots)',!R.checkEdit(w,{k,a:[115,0,-1,0]},'u1')&&!R.checkEdit(w,{k,a:[115,0,70000,0]},'u1')&&!R.checkEdit(w,{k,a:[140,0,'x',0]},'u1')&&!R.checkEdit(w,{k,a:[140,0,1,300]},'u1')&&!R.checkEdit(w,{k,a:[140,0,1,0,9]},'u1'));
 ok('rules: saved worlds still load through the old check unchanged',R.validEdit({k,a:[3,0,0,0]})&&R.validEdit({k,a:[2,5,5,123.5]})&&R.validEdit({k,a:[115,0,161,0]}))}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rbwbo-'));
const S=createServer({allowGuests:true,csp:false,port:0,host:'127.0.0.1',dataDir:dir,scryptN:64,wxCooldownMs:0,maxConnsPerIp:200,ownerName:'Boss',ownerPass:'owner-password-1',client:path.join(__dirname,'..','index.html')});
const errs=[];
async function client(b,url,tag){const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+': '+e.message.slice(0,200)));
 await p.goto(url);await p.waitForTimeout(800);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}});await p.waitForTimeout(400);await p.evaluate(()=>{try{SHOW7.close()}catch(_){}});
 await p.waitForFunction(()=>NET7.online,null,{timeout:15000});return p}
const ev=(p,f,a)=>p.evaluate(f,a);
const signup=async(p,name)=>{await ev(p,([n,w])=>NET7.send({t:'register',name:n,pass:w}),[name,name+'-password']);await p.waitForFunction(n=>typeof NET7!='undefined'&&NET7.auth&&NET7.auth.name==n,name,{timeout:15000});await p.waitForTimeout(400);await p.evaluate(()=>{try{$('cgo').click()}catch(_){}try{SHOW7.close()}catch(_){}});await p.waitForTimeout(300)};
const go=async(p,w,c)=>{await ev(p,([w,c])=>NET7.go(w,c),[w,!!c]);await p.waitForFunction(w=>NET7.world==w&&cur==w,w,{timeout:10000}).catch(()=>{});await p.waitForTimeout(600)};
(async()=>{const port=await S.listen(),url='http://127.0.0.1:'+port+'/';const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium',args:['--no-sandbox','--mute-audio']});
 try{const A=await client(b,url,'Ann'),B=await client(b,url,'Bea');await signup(A,'Annwb');await signup(B,'Beawb');
  await go(A,'wbonline',true);await go(B,'wbonline');
  // Ann builds next to herself: a flat strip, a colour block, a duck and a lantern post
  const spot=await ev(A,()=>{try{RPG.guide.stop()}catch(_){}const gy=Math.floor((P.y+P.h)/T),tx=Math.floor(P.x/T);for(let x=tx-1;x<=tx+4;x++){for(let y=gy-4;y<gy;y++){const k=y*W+x;if(tiles[k]){tiles[k]=0;pushEdit(k)}}const k=gy*W+x;if(!SOLID6[tiles[k]]){tiles[k]=3;hp[k]=6;pushEdit(k)}}
   addI(904,5);addI(DECOR10.keyOf(DECOR10.BYID.puddle_duck.i),2);addI(DECOR10.keyOf(DECOR10.BYID.lantern_post.i),2);MATS10.setCol(904,35);
   const why=MATS10.canPlaceAt(tx+1,gy-1,115),ce=canEdit(),n=cnt(904),py=P.y,cur0=cur,meta0=JSON.stringify(meta);const a=MATS10.placeKey(904,tx+1,gy-1),d=DECOR10.place(DECOR10.BYID.puddle_duck.i,tx+2,gy-1,{flip:1}),l=DECOR10.place(DECOR10.BYID.lantern_post.i,tx+3,gy-1,{flip:0});return{why,ce,n,py,cur0,meta0,tx,gy,a,d,l,kb:(gy-1)*W+tx+1,kd:(gy-1)*W+tx+2,kl:(gy-1)*W+tx+3}});
  ok('Ann places a colour block, a duck and a lantern in a shared world',spot.a&&spot.d&&spot.l,spot);
  await B.waitForFunction(s=>tiles[s.kb]==115&&tiles[s.kd]==140&&tiles[s.kl]==140,spot,{timeout:8000}).catch(()=>{});
  const seen=await ev(B,s=>({b:[tiles[s.kb],TVAR[s.kb]],d:[tiles[s.kd],TVAR[s.kd],TST[s.kd]],l:[tiles[s.kl],TVAR[s.kl],TST[s.kl]],di:DECOR10.BYID.puddle_duck.i}),spot);
  ok('Bea sees the same block in the same colour (Fired Brick, Fuchsia), the duck facing the same way and the lantern lit',seen.b[0]==115&&seen.b[1]==4*64+35&&seen.d[0]==140&&seen.d[1]==seen.di&&(seen.d[2]&2)==2&&seen.l[0]==140&&(seen.l[2]&1)==1,seen);
  // Ann greets the duck: Bea's duck reacts the same way
  await ev(B,s=>{P.x=(s.tx+2)*T;},spot);await sleep(400);const l0=await ev(B,()=>DECOR10.log.length);
  const r=await ev(A,s=>{P.x=(s.tx+2)*T+T/2;DECOR10.act(s.kd);const st=DECOR10.st(s.kd);return st.r},spot);
  await B.waitForFunction(n=>DECOR10.log.length>n,l0,{timeout:6000}).catch(()=>{});const got=await ev(B,n=>DECOR10.log.slice(n),l0);
  ok('when Ann says hello to the duck, Bea sees it quack with the same reaction',got.length>=1&&got[0].remote&&got[0].kind=='quack'&&got[0].r==r,{r,got});
  // Ann switches the lantern off: Bea's goes off too
  await ev(A,s=>DECOR10.act(s.kl),spot);await B.waitForFunction(s=>(TST[s.kl]&1)==0,spot,{timeout:6000}).catch(()=>{});
  ok('Ann switches the lantern off and it goes off for Bea',await ev(B,s=>(TST[s.kl]&1)==0,spot));
  // Ann claims her world with a World Lock: from now on Bea is a visitor
  await ev(A,()=>{const x=(P.x/T|0)-1;let y=0;for(let yy=0;yy<H;yy++)if(tiles[yy*W+x]){y=yy-1;break}const k=y*W+x;tiles[k]=17;hp[k]=99;setMeta({x,y,o:myId,on:(NET7.auth&&NET7.auth.name)||myName,f:[],pub:0});pushEdit(k)});await sleep(800);
  const vis=await ev(B,s=>{const s0=TST[s.kl];DECOR10.act(s.kl);return{ce:canEdit(),same:TST[s.kl]===s0}},spot);
  ok('Bea is a visitor in Ann’s world: she can greet the duck but cannot switch Ann’s lantern',!vis.ce&&vis.same,vis);
  // a forged edit with a bad variant changes nothing on the server
  await ev(A,s=>{try{rm.emit('e',{k:s.kb,a:[115,0,-9,0]})}catch(_){}},spot);await sleep(700);
  const srv=JSON.parse(JSON.stringify((S.worlds&&S.worlds.get?S.worlds.get('wbonline'):null)||{}));const fileW=(()=>{try{const f=fs.readdirSync(path.join(dir,'worlds')).find(n=>/wbonline/.test(n));return f?JSON.parse(fs.readFileSync(path.join(dir,'worlds',f),'utf8')):null}catch(_){return null}})();
  const sv=await ev(B,s=>[tiles[s.kb],TVAR[s.kb]],spot);
  ok('a forged edit with a bad colour is refused: everyone keeps the real block',sv[0]==115&&sv[1]==4*64+35,sv);
  // Bea leaves and comes back: everything is still there, from the server
  await go(B,'plaza');await go(B,'wbonline');await B.waitForFunction(s=>tiles[s.kb]==115,spot,{timeout:8000}).catch(()=>{});
  const back=await ev(B,s=>({b:[tiles[s.kb],TVAR[s.kb]],d:[tiles[s.kd],TVAR[s.kd]],l:[tiles[s.kl],TST[s.kl]&1]}),spot);
  ok('after leaving and coming back, Bea still sees the block, the duck and the switched-off lantern',back.b[0]==115&&back.b[1]==4*64+35&&back.d[0]==140&&back.l[0]==140&&back.l[1]==0,back);
  ok('no page errors',errs.length==0,errs.slice(0,4));
 }catch(e){ok('online world building run',false,e&&e.stack||String(e))}
 await b.close();try{await S.close()}catch(_){}console.log(fails?fails+' FAILED':'ALL PASS');process.exit(fails?1:0)})();
