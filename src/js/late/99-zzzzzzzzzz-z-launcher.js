// ===== RBLAUNCH: the small bridge between the game and the Rootbound launcher. It reads, never writes: RBLAUNCH.profile() gathers what the launcher's Profile and Continue
// Playing pages show, from the same save the game itself uses. The Windows app (desktop/main.js) writes it to rootbound-profile.json in the game's data folder. Quick launch: the
// launcher can name a world or a dungeon in the address (index.html?rbworld=x or ?rbdungeon=y); a world becomes the one the Play path enters, a dungeon opens its page once the game has started. =====
window.RBLAUNCH=(()=>{
 const q=(()=>{try{return new URLSearchParams(location.search)}catch(_){return new URLSearchParams('')}})();
 const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,16);
 // a quick launch is one-time: it changes where this start lands, the same way having last played there would
 const qw=clean(q.get('rbworld'));if(qw)try{addRecent(qw)}catch(_){}
 const qd=clean(q.get('rbdungeon'));
 if(qd){const iv=setInterval(()=>{try{if(!entered||window.RB_COVER)return;clearInterval(iv);if(window.DG&&DG.BY[qd]&&DG.page)DG.page.open(null,qd)}catch(e){clearInterval(iv);console.error('RBLAUNCH',e)}},700);setTimeout(()=>clearInterval(iv),600000)}
 const num=v=>Number.isFinite(+v)?+v:0;
 function avatar(){try{const c=document.getElementById('portrait');if(c&&c.width>0&&entered)return c.toDataURL('image/png')}catch(_){}return null}
 function outfit(){const out=[];try{for(const s of ['hat','body','wing','boot','glove']){const id=wear[s];if(id)out.push({slot:s,name:(WEAR[id]&&WEAR[id].n)||id})}}catch(_){}return out}
 function weapon(){try{const w=WPN[wp];return w?{id:wp,name:w.n||wp}:null}catch(_){return null}}
 function klass(){try{const k=CLASS7.cur();if(!k||!CLASS7.C[k])return null;return{id:k,name:CLASS7.C[k].n,level:CLASS7.lv(k)}}catch(_){return null}}
 function achievements(){try{const list=[];ACH.forEach((a,i)=>list.push({name:a[0],desc:a[1],done:!!achD[i]}));return{done:list.filter(a=>a.done).length,total:list.length,list}}catch(_){return{done:0,total:0,list:[]}}}
 function dungeons(){try{if(!window.DG)return{cleared:0,total:0,list:[]};const list=DG.LIST.map(d=>{const c=DG.S.clr[d.id]||{},best=DG.S.best[d.id]||{};return{id:d.id,name:d.n,sub:d.sub||'',entry:d.entry,cleared:DG.cleared(d.id),diffs:Object.keys(c).filter(k=>c[k]),best,locked:!!DG.lockReason(d.id),glow:d.p&&d.p.glow}});return{cleared:list.filter(d=>d.cleared).length,total:list.length,list,deaths:num(DG.S.deaths)}}catch(_){return{cleared:0,total:0,list:[]}}}
 function worlds(){try{return recents().slice(0,12)}catch(_){return[]}}
 // the whole summary; anything the game can't answer right now is simply left out, never guessed
 function profile(){let acct='';try{acct=(RB_ACCT.id&&localStorage.getItem('rb_lastname'))||''}catch(_){}
  const run=window.DG&&DG.run?{id:DG.run.d.id,name:DG.run.d.n,diff:DG.run.df&&DG.run.df.n}:null;
  return{v:1,entered:!!entered,cover:!!window.RB_COVER,name:typeof myName=='string'&&made?myName:'',made:!!made,account:acct,signedIn:!!(window.RB_ACCT&&RB_ACCT.id),level:num(lvl),xp:num(xp),xpNext:(()=>{try{return num(xpNeed(lvl))}catch(_){return 0}})(),gems:num(gems),
   title:(()=>{try{return(window.DG&&DG.S&&DG.S.titleOn)||npName(curPlateTier(lvl))}catch(_){return''}})(),world:entered&&typeof cur=='string'?cur:null,run,worlds:worlds(),outfit:outfit(),weapon:weapon(),klass:klass(),
   skills:(()=>{try{return{mine:prof.mine.l,farm:prof.farm.l,fight:prof.fight.l}}catch(_){return null}})(),stats:(()=>{try{return Object.assign({},stats)}catch(_){return null}})(),achievements:achievements(),dungeons:dungeons(),avatar:avatar()}}
 return{profile}})();
