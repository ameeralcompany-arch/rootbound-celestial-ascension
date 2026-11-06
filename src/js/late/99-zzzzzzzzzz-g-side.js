// ===== SIDE1: eight small side stories from the Plaza townsfolk (docs/story-proposal.md, stage 4). Each is offered when you talk to its townsperson (once its moment
// in the story has come), tracks something you really do in the game (blocks broken, seeds planted, monsters defeated, Magma Shards carried, a realm visited, a dungeon
// cleared), and is handed in by talking to them again: their thank-you in their own voice (audio/town/side_*.mp3), a reward, and a page in the Journal.
// STORY2 asks SIDE1 first when you talk to someone: a story ready to hand in, then their story lines, then a new story to offer. State: RB_PREFIX+'rbside'. =====
try{(()=>{
 const KEY=()=>(typeof RB_PREFIX!='undefined'?RB_PREFIX:'')+'rbside';
 let S={q:{}};try{S=Object.assign(S,JSON.parse(localStorage.getItem(KEY())||'{}'))}catch(_){}
 const save=()=>{try{localStorage.setItem(KEY(),JSON.stringify(S))}catch(_){}};
 const st=k=>{try{return stats[k]|0}catch(_){return 0}};
 const got=id=>{try{return STORY1.got.includes(id)}catch(_){return false}};
 const stage=n=>{try{return WORD9.stageOf(n)}catch(_){return -1}};
 const inWorld=sg=>{try{return typeof cur!='undefined'&&cur&&cur!='plaza'&&!(window.DG&&DG.run)&&WORD9.hasWord(cur)&&stage(cur)===sg}catch(_){return false}};
 const clears=()=>{try{let n=0;for(const d of Object.keys(DG.S.clr||{}))n+=Object.keys(DG.S.clr[d]||{}).length;return n}catch(_){return 0}};
 const isNight=()=>{try{return typeof night!='undefined'&&night>.55}catch(_){return false}};
 // kind: 'stat' (a game counter grows by need), 'item' (carry need of an item; handed over), 'visit' (be somewhere, once, after accepting), 'clear' (clear a dungeon after accepting)
 const Q=[
  {id:'pip',npc:'pip',t:'Kevin',goal:'Break 25 blocks',kind:'stat',k:'break',need:25,gems:150,when:()=>true,x:'Pip asked for a dragon egg, which turned out to mean a round stone. You broke a great many blocks to find the roundest one. He named it Kevin. Kevin now sleeps in a nest of socks, and is, by all accounts, very happy.'},
  {id:'hana',npc:'hana',t:'The Last Seed',goal:'Plant 5 seeds',kind:'stat',k:'plant',need:5,gems:150,when:()=>true,x:'Hana kept one seed from before the Silence. You warmed the soil with five of your own, and she planted the old seed among them. It has not sprouted yet. Hana says it is only remembering how.'},
  {id:'bram',npc:'bram',t:'One Perfect Blade',goal:'Defeat 20 monsters',kind:'stat',k:'kill',need:20,gems:250,when:()=>(typeof lvl!='undefined'?lvl:1)>=8,x:'Bram watched you fight twenty times and said almost nothing. Then he went back to the forge and hammered all night. He says the blade is nearly ready, and that it learned a few things from you.'},
  {id:'tobi',npc:'tobi',t:'Grandmother\'s Bread',goal:'Bring 5 Magma Shards',kind:'item',item:208,need:5,gems:300,when:()=>got('w1_seen'),x:'Tobi\'s grandmother\'s bread needs Inferno heat, so you brought him five Magma Shards. The loaf rose golden. It was only a little burnt. Half the Plaza came for a slice, and the other half came for a second one.'},
  {id:'kael',npc:'kael',t:'A Letter by the Water',goal:'Visit an Abyssal Sea world',kind:'visit',sg:3,gems:250,when:()=>got('w3_seen'),x:'Kael gave you a letter for the Abyssal Sea. You left it by the water. (You read it. It said: "I kept the lantern lit. Come home when you can.") He pretends he has not checked the shore since. He has.'},
  {id:'lumi',npc:'lumi',t:'Lumi\'s Lantern',goal:'Visit a Galaxy world at night',kind:'visit',sg:2,night:1,gems:250,when:()=>got('w2_seen'),x:'Lumi left her lantern in the Galaxy a hundred years ago. You found its light at night, still glowing, still waiting. She keeps it on the stone lantern now, and sleeps beside it.'},
  {id:'lulu',npc:'lulu',t:'The Festival Bell',goal:'Visit a Crystal Realm world',kind:'visit',sg:4,gems:250,when:()=>got('w4_seen'),x:'The festival bell had been lost in the Crystal Realm. You brought it back to Lulu, and now everyone knows when to dance. Pip knows too. Pip rings it all day.'},
  {id:'mira',npc:'mira',t:'The Music Box',goal:'Clear any dungeon',kind:'clear',gems:400,when:()=>got('dg_first'),x:'Mira\'s music box had gone missing down a dungeon. You brought it back up, and it still plays: the lullaby her mother used to hum. She gave you a discount. A small one. She would like you to know that it was small.'}];
 const qs=id=>S.q[id]||null;
 const prog=q=>{const s=qs(q.id);if(!s||s.done)return s&&s.done?1:0;if(q.kind=='stat')return Math.min(1,(st(q.k)-s.b)/q.need);if(q.kind=='item'){let n=0;try{n=inv[q.item]|0}catch(_){}return Math.min(1,n/q.need)}if(q.kind=='visit'||q.kind=='clear')return s.met?1:0;return 0};
 const label=q=>{const s=qs(q.id),p=prog(q);if(s&&s.done)return'Done';if(q.kind=='stat')return Math.max(0,Math.min(q.need,st(q.k)-s.b))+' / '+q.need;if(q.kind=='item'){let n=0;try{n=inv[q.item]|0}catch(_){}return Math.min(n,q.need)+' / '+q.need}return p>=1?'Ready':'Not yet'};
 const ready=q=>{const s=qs(q.id);return !!(s&&!s.done&&prog(q)>=1)};
 const offerable=q=>!qs(q.id)&&(()=>{try{return q.when()}catch(_){return false}})();
 const lines=()=>window.TOWNVOICE||{};
 let au=null;function play(id){try{if(au)au.pause();const v=typeof OPT!='undefined'&&OPT.sv!=null?+OPT.sv:1;if(!(v>0)||!lines()[id])return;au=new Audio('audio/town/'+id+'.mp3');au.volume=Math.min(1,v*.95);const p=au.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
 // watching for 'visit' and 'clear' stories, every 2 s
 setInterval(()=>{let ch=false;for(const q of Q){const s=qs(q.id);if(!s||s.done||s.met)continue;if(q.kind=='visit'&&inWorld(q.sg)&&(!q.night||isNight())){s.met=1;ch=true;try{say(q.t+': done. Talk to '+q.npc[0].toUpperCase()+q.npc.slice(1)+' in the Plaza.')}catch(_){}}
  if(q.kind=='clear'&&clears()>s.c){s.met=1;ch=true}}if(ch)save()},2000);
 function turnIn(npc){const q=Q.find(q=>q.npc==npc&&ready(q));if(!q)return null;const s=qs(q.id);
  if(q.kind=='item'){try{inv[q.item]=(inv[q.item]|0)-q.need;if(inv[q.item]<=0)delete inv[q.item]}catch(_){}}
  s.done=Date.now();save();try{gems+=q.gems;stat('gems',q.gems);say(q.t+' complete  +'+q.gems+' gems')}catch(_){}play('side_'+q.id+'_done');try{STORY1.check()}catch(_){}
  return(lines()['side_'+q.id+'_done']||{}).text||'Thank you!'}
 function offer(npc){const q=Q.find(q=>q.npc==npc&&offerable(q));if(!q)return null;S.q[q.id]={t:Date.now(),b:q.kind=='stat'?st(q.k):0,c:q.kind=='clear'?clears():0};save();play('side_'+q.id+'_ask');try{say('New story: '+q.t+'. '+q.goal+'.')}catch(_){}
  return(lines()['side_'+q.id+'_ask']||{}).text||q.goal}
 // the Journal gets a chapter of its own: each story's page appears when you hand it in
 try{STORY1.CH.push({k:'side',n:'Side Stories',pages:Q.map(q=>({id:'side_'+q.id,t:q.t,ch:'side',if:()=>!!(qs(q.id)&&qs(q.id).done),hint:'A story from '+q.npc[0].toUpperCase()+q.npc.slice(1)+', in the Plaza',x:q.x}))});for(const p of STORY1.CH[STORY1.CH.length-1].pages)STORY1.PAGES.push(p)}catch(e){console.error('SIDE1 journal',e)}
 window.SIDE1={Q,has:npc=>Q.some(q=>q.npc==npc&&(ready(q)||offerable(q))),turnIn,offer,prog,label,ready,
  active:()=>Q.filter(q=>qs(q.id)&&!qs(q.id).done),done:id=>!!(qs(id)&&qs(id).done),get S(){return S},reset(){S={q:{}};save()}};
})()}catch(e){console.error('SIDE1',e)}
