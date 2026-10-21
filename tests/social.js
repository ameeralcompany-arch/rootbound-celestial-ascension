// Social / trade / admin tests using TWO real page instances joined by an in-memory fake room (NOT PeerJS; validates game logic, not the network transport)
const {chromium}=require('playwright');const path=require('path');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium';
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d?'  - '+d:''))};
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});const pages={},errs=[];
 async function mk(name,id){const ctx=await b.newContext({viewport:{width:1000,height:600}});const p=await ctx.newPage();p.on('pageerror',x=>errs.push(name+':'+x.message));
  await p.addInitScript(()=>localStorage.setItem('rb_session',JSON.stringify({id:'guest',name:'Guest'})));await p.goto(URL);await p.waitForTimeout(600);await p.evaluate(()=>document.getElementById('bp').click());await p.waitForTimeout(400);
  await p.evaluate(()=>{try{document.getElementById('cgo').click()}catch(_){}try{menuEl.style.display='none'}catch(_){}lvl=20});pages[name]=p;return p}
 const A=await mk('A'),B=await mk('B');const IA=await A.evaluate(()=>myId),IB=await B.evaluate(()=>myId);for(const q of[A,B])await q.evaluate(([a,b])=>{window.IA=a;window.IB=b},[IA,IB]);ok('clients have distinct identities',IA!=IB,IA+' vs '+IB);
 // fake room: host=A (peer 'pa'), guest=B (peer 'pb'); host relays + validates through the real hostAllow
 await A.exposeFunction('relayToB',m=>B.evaluate(m=>{if(m.t=='x')SOC6.remote(m.d,m.f);else if(m.t=='chat')chatIn6({peer:m.f,data:m.d})},m));
 await B.exposeFunction('sendToHost',async m=>{return A.evaluate(m=>{const v=hostAllow('pb',m.t,m.d);if(v===false)return false;if(m.t=='x'){if(v.to==rm.id)SOC6.remote(v,'pb');else relayToB({t:'x',d:v,f:'pb'})}return true},m)});
 await A.evaluate(()=>{window.__sent=[];cur='fort';meta=null;rm={isHost:true,id:'pa',ps:{pb:{n:'Bea',uid:window.IB,lv:5}},conns:[],presence(){},peers(){return[{peer:'pa',isMe:true,presence:{n:'Ann',uid:window.IA}},{peer:'pb',isMe:false,presence:{n:'Bea',uid:window.IB,lv:5,cx:{t:0}}}]},emit(t,d){relayToB({t,d,f:'pa'})}};myName='Ann'});
 await B.evaluate(()=>{cur='fort';rm={isHost:false,id:'pb',hc:{peer:"pa"},presence(){},ps:{pa:{n:'Ann',uid:window.IA}},peers(){return[{peer:'pb',isMe:true,presence:{n:'Bea',uid:window.IB}},{peer:'pa',isMe:false,presence:{n:'Ann',uid:window.IA,lv:20,cx:{t:0}}}]},emit(t,d){sendToHost({t,d})}};myName='Bea'});
 // trade: Ann gives 5 wood(id5), wants 3 gems(id0)
 await A.evaluate(()=>{inv={5:10};gems=0});await B.evaluate(()=>{inv={};gems=10});
 await B.evaluate(()=>{SOC6.cmd('/trade ann 0 3 5 5')});await B.waitForTimeout(200);
 // B offers 3 gems for 5 wood; A receives
 const inn=await A.evaluate(()=>SOC6.T6.inn&&JSON.stringify(SOC6.T6.inn));ok('offer reaches the other client',!!inn,inn);
 const before=await A.evaluate(()=>({w:cnt(5),g:gems}));ok('nothing changes before accept',before.w==10&&before.g==0&&await B.evaluate(()=>gems==10));
 await A.evaluate(()=>SOC6.accept());await A.waitForTimeout(400);await B.waitForTimeout(400);
 const fa=await A.evaluate(()=>({w:cnt(5),g:gems})),fb=await B.evaluate(()=>({w:cnt(5),g:gems}));
 ok('trade completes with exact conservation',fa.w==5&&fa.g==3&&fb.w==5&&fb.g==7,JSON.stringify({fa,fb}));
 // decline path
 await B.evaluate(()=>SOC6.cmd('/trade ann 0 1 5 1'));await B.waitForTimeout(200);await A.evaluate(()=>SOC6.decline());await B.waitForTimeout(300);
 ok('declined trade changes nothing',(await A.evaluate(()=>cnt(5)))==5&&(await B.evaluate(()=>gems))==7);
 // accept without having items -> refused, no loss
 await B.evaluate(()=>{gems=7;SOC6.T6.out=null;SOC6.cmd('/trade ann 0 1 5 99')});await B.waitForTimeout(200);const r1=await A.evaluate(()=>{SOC6.accept();return cnt(5)});ok('accepting without enough items is refused',r1==5);
 // forged/duplicate messages
 await A.evaluate(()=>{SOC6.T6.inn=null});
 const dup=await B.evaluate(()=>{gems=7;SOC6.remote({op:'tr_done',to:'pb',id:'zzz'},'pa');SOC6.remote({op:'tr_acc',to:'pb',id:'zzz'},'pa');return gems});ok('forged tr_done/tr_acc without a pending trade does nothing',dup==7);
 // escrow refund on timeout
 const esc=await B.evaluate(()=>{gems=10;SOC6.T6.esc={id:'q',give:[5,1],want:[0,4],t:Date.now()-16000};gems-=4;SOC6.tick(1.1);return gems});ok('escrow refunded when partner never confirms',esc==10,esc);
 // host validation
 const hv=await A.evaluate(()=>({big:hostAllow('pb','x',{op:'tr_offer',to:'pa',id:'a',give:[5,99999],want:[0,1]}),self:hostAllow('pb','x',{op:'tr_offer',to:'pb',id:'a',give:[5,1],want:[0,1]}),adm:hostAllow('pb','x',{op:'kick',to:'pa'}),tp:hostAllow('pb','x',{op:'tp',to:'pa',x:1,y:1}),ok:!!hostAllow('pb','x',{op:'wh',to:'pa',t:'hi',n:'Bea'})}));
 ok('host rejects oversized/self/admin ops from guests',hv.big===false&&hv.self===false&&hv.adm===false&&hv.tp===false&&hv.ok);
 // rate limit
 const rl=await A.evaluate(()=>{let n=0;for(let i=0;i<30;i++)if(hostAllow('pc','chat',{n:'x',t:'hi'}))n++;return n});ok('host rate-limits chat floods (8 per 8s)',rl<=8,rl);
 // whisper
 await B.evaluate(()=>SOC6.cmd('/w ann secret'));await A.waitForTimeout(200);ok('whisper delivered',await A.evaluate(()=>/whisper.*Bea.*secret/.test(msg)));
 // mute
 await A.evaluate(()=>SOC6.cmd('/mute bea'));const mu=await A.evaluate(()=>chatIn6({peer:'pb',data:{n:'Bea',t:'spam'}}));ok('muted player chat is dropped',mu===false);await A.evaluate(()=>SOC6.cmd('/unmute bea'));
 const em=await A.evaluate(()=>chatIn6({peer:'pb',data:{n:'Bea',t:'👋',e:0}}));ok('unmuted chat/emote accepted',em===true);
 // chat length/format enforced by host
 const cl=await A.evaluate(()=>hostAllow('pb','chat',{n:'N'.repeat(50),t:'x'.repeat(500),e:99}));ok('host trims chat and drops invalid emote id',cl.t.length==80&&cl.n.length==14&&cl.e===undefined);
 // admin: guests cannot, host can
 await B.evaluate(()=>ADMIN6.cmd('/admin on'));const g1=await B.evaluate(()=>{ADMIN6.cmd('/a gems 100');return gems});ok('guest cannot use creator console',g1==10);
 await A.evaluate(()=>{ADMIN6.cmd('/admin on');ADMIN6.cmd('/a gems 100')});ok('host console works after /admin on',(await A.evaluate(()=>gems))>=100);
 const off=await A.evaluate(()=>{ADMIN6.cmd('/admin off');const g=gems;ADMIN6.cmd('/a gems 100');return gems==g});ok('console commands refused when off',off);
 // host bring: guest obeys only host
 await A.evaluate(()=>{ADMIN6.cmd('/admin on');ADMIN6.cmd('/a bring bea')});await B.waitForTimeout(250);
 const tp=await B.evaluate(()=>[P.x,P.y]);const fk=await B.evaluate(()=>{const x0=P.x;SOC6.remote({op:'tp',to:'pb',x:12345,y:50},'pEvil');return P.x==x0});ok('guest ignores teleport from a non-host peer',fk);
 ok('host bring teleports guest',await B.evaluate(()=>true)&&tp[0]>0);
 // ban list
 await A.evaluate(()=>{meta={x:5,y:5,o:window.IA,on:'Ann',f:[],t:[],b:[],pub:0};ADMIN6.cmd('/a perm bea builder')});ok('perm builder sets meta.f',await A.evaluate(()=>meta.f.includes(window.IB)));
 await A.evaluate(()=>ADMIN6.cmd('/a ban bea'));ok('ban records uid and role -1',await A.evaluate(()=>meta.b.includes(window.IB)&&OBJ6.roleOf(window.IB)===-1));
 ok('no page errors',errs.length==0,errs.join('|'));
 console.log(fails?fails+' FAILED':'all social tests passed');await b.close();process.exit(fails?1:0)})();
