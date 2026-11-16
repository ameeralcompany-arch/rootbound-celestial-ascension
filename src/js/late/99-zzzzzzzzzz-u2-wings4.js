// ===== WINGS4: ten new wings (master update 2), each with its own silhouette, material, palette, sparkle and trail, appended at the very end of WINGS
// (others are sent a wing's position in the list, so nothing already there moves). None are sold: each is earned through something the game records,
// shown with its goal in the Wings tab (WINGX rows). Built from the wing art's families, combined differently for each:
//   Prismheart Facets  crystal: two tall shard clusters over prism feathers, refracted glints
//   Lumen Cascade      celestial energy: ribbons of nebula light over pale aurora layers
//   Emberhorn          demonic: a clawed membrane with ember veins and horn spurs, embers in its wake
//   Snow Owl Mantle    feathered: broad rounded owl feathers in three soft rows, silent
//   Moonmoth Veil      butterfly: two-lobed translucent panes with eye spots, a fluttering beat and scale dust
//   Vector Array       futuristic: hex plates on light arms with clean energy lines
//   Camellia Bloom     floral: petals over leaves, dropping petals as you fly
//   Gossamer Drift     ethereal: see-through veils that move like slow water
//   Origami Crane      unusual: folded paper planes, crisp and flat, with a paper flutter
//   Dawnbreaker Regalia endgame: gold blades over layered light, an orbit and a crown of stars =====
try{(()=>{
 const fl=k=>(WINGX.S.fl[k]|0),safe=f=>()=>{try{return+f()||0}catch(_){return 0}};
 const kills=safe(()=>stats.kill),fish=safe(()=>stats.fish),plc=safe(()=>stats.place),disc=safe(()=>DISC1.count()),lv=safe(()=>lvl|0);
 const allClr=safe(()=>DG.LIST.filter(d=>DG.cleared(d.id)).length),wbN=safe(()=>BOSSES.filter(b=>b.wb&&bossK[b.id]>0).length),bossN=safe(()=>stats.bosskills),elite=safe(()=>fl('elite'));
 const owns=id=>safe(()=>WINGX.has(id)?1:0);
 const T=(e,n,len,wd,pa,arm,o)=>Object.assign({s:'tier',e,n,len,wd,pa,arm},o||{});
 // [id, name, family, rarity, how, palette, sparkle, particle, description, art, requirements]
 const L=[
  ['prismheart','Prismheart Facets','elemental','epic','explore',['#1a1a4a','#5a6ae0','#e0eaff','#ffd0f4'],'#e0eaff','glints','Two tall clusters of clear crystal over prism feathers. Light comes out the other side in pieces.',
   {L:92,glint:1,trail:['spark'],parts:[T(['prism','prism','scale'],[7,6,5],[.56,.36,.2],[.1,.12,.28],[-40,60],-50,{la:.3,glow:1}),{s:'frag',shape:'rock',n:16,a:[-70,-8],arm:-62,att:.42,sc:1.1,sz:[7,15]}]},[['Find 16 Discoveries',disc,16]]],
  ['lumencascade','Lumen Cascade','cosmic','legendary','dungeon',['#0c1438','#3a5ac8','#c8e4ff','#ffe4a8'],'#ffe4a8','stars','Light that falls the wrong way: ribbons of it pour up from your back and fade into pale gold.',
   {L:104,trail:['dust','spark'],parts:[{s:'rib',kind:'nebula',n:6,a:[-64,58],len:1.05,w:2.6},T(['aurora','shroud','fluff'],[8,6,5],[.6,.4,.2],[.22,.24,.3],[-30,92],-34,{add:1,al:.7,glow:1})]},[['Clear 6 different dungeons',allClr,6]]],
  ['emberhorn','Emberhorn Membrane','dark','legendary','boss',['#120404','#3a0e0e','#c8402a','#ffb060'],'#ffb060','embers','Leather stretched between clawed fingers, cracked with ember light. Horn spurs crown the wrists.',
   {L:100,trail:['spark','smoke'],parts:[{s:'mem',fingers:5,bone:'#2a0a0a',claw:1,hook:1,spikes:1,glowVein:'#ffb060',vein:1,scal:.3},{s:'frag',shape:'void',n:6,a:[-82,-48],arm:-70,att:.3,sc:.7,sz:[5,9]}]},[['Defeat 25 bosses',bossN,25]]],
  ['snowowl','Snow Owl Mantle','feathered','rare','hunt',['#7a7a74','#e8e4da','#ffffff','#f6f2e6'],'#ffffff','','Broad, round-tipped owl feathers in three soft rows. They make no sound at all.',
   {L:74,trail:['feather'],parts:[{s:'fan',tip:'real',rows:3,n:9,a:[-24,92],arm:-20,att:.58,fw:.24,lc:'eagle',fing:1}]},[['Defeat 1,500 monsters',kills,1500]]],
  ['moonmoth','Moonmoth Veil','fantasy','epic','quest',['#1c1440','#5a48b0','#c8f0ff','#fff0a8'],'#c8f0ff','glitter','Two great translucent panes with pale eye spots, beating softly and shedding a fine silver dust.',
   {L:86,flutter:1,trail:['dust'],parts:[T(['iris','iris','fluff'],[6,5,4],[.62,.44,.26],[.34,.36,.4],[-36,96],-24,{al:.72,glow:1,la:.4})]},[['Catch 300 fish',fish,300]]],
  ['vectorarray','Vector Array','mechanical','epic','event',['#0a1424','#2a4a6a','#9ae8ff','#7affd8'],'#9ae8ff','sparks','Hexagonal plates on light arms, held in place by thin clean lines of energy.',
   {L:88,trail:['spark'],parts:[{s:'mech',style:'hex',n:8,a:[-70,40],joint:'#7affd8'},{s:'rib',kind:'wind',n:4,a:[-60,30],len:.9,w:2}]},[['Defeat 60 elites anywhere',elite,60]]],
  ['camellia','Camellia Bloom','fantasy','rare','craft',['#3a1420','#c84a6a','#ffd0dc','#fff4f6'],'#ffd0dc','petals','Rows of camellia petals over glossy leaves. A few always come loose when you take off.',
   {L:76,trail:['petal'],parts:[T(['coral','leaf','leaf'],[7,6,5],[.58,.4,.22],[.3,.32,.42],[-28,90],-28,{la:.36})]},[['Place 10,000 blocks',plc,10000]]],
  ['gossamer','Gossamer Drift','cosmic','legendary','explore',['#1a2a3a','#7aa8c8','#eaf6ff','#ffffff'],'#eaf6ff','glints','Veils so thin you see the sky through them. They move like slow water, even when you stand still.',
   {L:102,trail:['dust'],parts:[T(['shroud','aurora','shroud'],[9,8,6],[.78,.5,.24],[.18,.2,.3],[-26,100],-30,{add:1,al:.55,glow:1}),{s:'rib',kind:'water',n:4,a:[-44,70],len:1,w:1.8}]},[['Find 22 Discoveries',disc,22]]],
  ['origamicrane','Origami Crane','feathered','rare','quest',['#6a6a72','#f2f0ea','#ffffff','#ff8a8a'],'#ffffff','','Folded from one long sheet, creased sharp, with a red seal on each wing. Crisp, flat, and oddly proud.',
   {L:72,flutter:1,parts:[T(['plate','plate','steel'],[5,4,4],[.7,.44,.22],[.22,.24,.32],[-34,70],-40,{la:.22,tip:'#ff8a8a'})]},[['Reach level 40',lv,40]]],
  ['dawnbreaker','Dawnbreaker Regalia','cosmic','mythic','relic',['#2a1606','#c88a2a','#fff0c8','#ffd27a'],'#fff0c8','stars','Gold blades over layered morning light, circled by small suns. Worn by those who finished everything.',
   {L:126,orbit:'#ffd27a',stars:14,trail:['spark','dust','feather'],parts:[{s:'fan',off:30,sc:.6,tip:'blade',rows:1,n:7,a:[-34,58],arm:-22,att:.45,fw:.2,rim:'#fff0c8'},T(['quill','aurora','iris'],[10,9,7],[.82,.5,.24],[.14,.18,.3],[-24,98],-30,{glow:1,la:.4}),{s:'frag',shape:'star',n:12,a:[-64,80],arm:-44,att:.5,sc:1.1,sz:[3,7],line:1}]},
   [['Reach level 120',lv,120],['Defeat 4 world bosses',wbN,4],['Earn the Gossamer Drift',owns('gossamer'),1]]]];
 const SND={feathered:'haloseraph',dark:'inkwraith',mechanical:'nightforge',elemental:'amethclaw',fantasy:'eyemoth',cosmic:'stormlance'};
 for(const q of L){const[id,n,fam,rar,how,pal,sp,fxk,d,a,req]=q;if(WINGS.find(w=>w.id==id))continue;const w={id,n,fam,rar,src:'excl',how,lvl:0,shop:0,excl:1,pal,sp,fxk,d,a,pw:Math.max(0,WRAR.indexOf(rar))+(a.L>90?1:0)};WINGS.push(w);WINGX.REQ[id]=req;try{if(!WINGSFX.P7[id]&&WINGSFX.P7[SND[fam]])WINGSFX.P7[id]=WINGSFX.P7[SND[fam]]}catch(_){}}
 window.WINGS4=L.map(q=>q[0]);
})()}catch(e){console.error('WINGS4',e)}
