'use strict';
// Two-player dungeon parties. The dungeon itself runs on the players' computers (the leader's runs the monsters), so the server's job is what must not be left to them:
// who is in a party (never more than two), who may enter, relaying play only between the two members of a live run, surviving a dropped connection, and paying a run's
// reward exactly once per account. Client messages: {t:'party',op:...}. Play traffic: {t:'pg',d:...}.
const crypto=require('crypto');
const MAX=2,INVITE_MS=60000,GRACE_MS=120000,ASK_MS=12000;
// what a run's completion pays on the server, on top of what the player's own chest gives
const GEMS={ruins:800,crimson:1100,frozen:1500,hollow:2000,dragon:2600,abyss:3400,star:6000,night:7000,king:8000,eater:10000};
const DIFFS=['normal','hard','nightmare','abyssal','cataclysm'];
function createParties({send,sessions,userById,saveAcc,bonus,bucket,minRunMs,graceMs}){
 const parties=new Map(),byUid=new Map(),invites=new Map();const grace=graceMs==null?GRACE_MS:graceMs;
 const minRun=minRunMs==null?60000:minRunMs;
 const sessOf=uid=>{for(const s of sessions.values())if(s.uid===uid)return s;return null};
 const memberOf=(p,uid)=>p.m.find(x=>x.uid===uid);
 const other=(p,uid)=>p.m.find(x=>x.uid!==uid);
 const view=p=>({id:p.id,leader:p.leader,m:p.m.map(x=>({uid:x.uid,name:x.name,on:!!x.sid,info:x.info||null})),run:p.run&&!p.run.over?{id:p.run.id,d:p.run.d,df:p.run.df,leader:p.run.leader,seed:p.run.seed,done:!!p.run.done}:null});
 const each=(p,msg)=>{for(const x of p.m){const s=x.sid&&sessions.get(x.sid);if(s)send(s,msg)}};
 const push=p=>each(p,{t:'party',op:'state',p:view(p)});
 const err=(s,m)=>send(s,{t:'party',op:'err',m});
 function dissolve(p){for(const x of p.m){byUid.delete(x.uid);clearTimeout(x.gone)}clearTimeout(p.askT);parties.delete(p.id);each(p,{t:'party',op:'state',p:null})}
 function leaveParty(p,uid,why){const x=memberOf(p,uid);if(!x)return;clearTimeout(x.gone);p.m=p.m.filter(q=>q!==x);byUid.delete(uid);const s=x.sid&&sessions.get(x.sid);if(s)send(s,{t:'party',op:'state',p:null});
  if(p.ask){clearTimeout(p.askT);p.ask=null}
  if(!p.m.length){parties.delete(p.id);return}if(p.leader===uid)p.leader=p.m[0].uid;
  // a live run carries on for the one who stayed: their computer takes over the monsters
  if(p.run&&!p.run.over){if(p.run.leader===uid)p.run.leader=p.m[0].uid;each(p,{t:'party',op:'mate_gone',name:x.name,why:why||'left',leader:p.run.leader})}
  push(p);
  if(p.m.length<2&&!(p.run&&!p.run.over))dissolve(p)}
 function newParty(s){const p={id:crypto.randomBytes(5).toString('hex'),leader:s.uid,m:[{uid:s.uid,name:s.name,sid:s.sid,info:s.dgInfo||null}],run:null,ask:null};parties.set(p.id,p);byUid.set(s.uid,p.id);return p}
 const mine=s=>{const id=byUid.get(s.uid);return id?parties.get(id):null};
 function claim(s,p,m){const r=p&&p.run;const u=userById(s.uid);if(!u)return;const rid=String(m.run||'');
  const cl=u.dgClaims||(u.dgClaims={});
  // already paid (a resend after a dropped connection, a tampered client): the answer stays "paid", nothing is paid again
  if(cl[rid]){send(s,{t:'party',op:'reward',run:rid,ok:1,dup:1});return}
  if(!r||r.id!==rid||!r.done){send(s,{t:'party',op:'reward',run:rid,ok:0});return}
  if(!memberOf(p,s.uid))return send(s,{t:'party',op:'reward',run:rid,ok:0});
  cl[rid]=Date.now();const ks=Object.keys(cl);if(ks.length>60){ks.sort((a,b)=>cl[a]-cl[b]);for(const k of ks.slice(0,ks.length-60))delete cl[k]}
  const gems=Math.round((GEMS[r.d]||500)*(1+Math.max(0,DIFFS.indexOf(r.df))*.5));try{bonus(u,gems)}catch(_){}
  const st=u.dgDuo||(u.dgDuo={});st[r.d]=(st[r.d]|0)+1;const first=st[r.d]===1;saveAcc();send(s,{t:'party',op:'reward',run:rid,ok:1,gems,first,clears:st[r.d]})}
 function msg(s,m){if(s.kind=='guest'||!s.uid)return err(s,'Sign in to play with a friend');if(!bucket(s,'party',40,10000))return;const op=m.op;
  let p=mine(s);
  switch(op){
  case 'info':{const i=m.d;if(!i||typeof i!='object')return;const c={lvl:Math.max(1,Math.min(9999,i.lvl|0)),wp:String(i.wp||'').slice(0,24),wg:String(i.wg||'').slice(0,24),title:String(i.title||'').slice(0,32),open:Array.isArray(i.open)?i.open.slice(0,16).map(q=>String(q).slice(0,12)):[],pr:typeof i.pr=='string'&&i.pr.length<4000?i.pr:''};s.dgInfo=c;if(p){const x=memberOf(p,s.uid);if(x){x.info=c;push(p)}}return}
  case 'state':return send(s,{t:'party',op:'state',p:p?view(p):null});
  case 'invite':{if(p&&p.m.length>=MAX)return err(s,'Your party is full');if(p&&p.run&&!p.run.over)return err(s,'Finish your dungeon first');if(p&&p.leader!==s.uid)return err(s,'Only the leader can invite');
   const who=String(m.who||'').toLowerCase().slice(0,16);if(!who)return err(s,'Type a player\'s name');let t=null;for(const q of sessions.values())if(q.uid&&q.kind!='guest'&&String(q.name).toLowerCase()===who){t=q;break}
   if(!t)return err(s,'That player is not online');if(t.uid===s.uid)return err(s,'That is you');if(byUid.has(t.uid))return err(s,t.name+' is already in a party');
   const tu=userById(t.uid);if(tu&&Array.isArray(tu.blocks)&&tu.blocks.includes(s.uid))return err(s,'That player is not online');
   const old=invites.get(t.uid);if(old&&old.exp>Date.now())return err(s,old.from===s.uid?'You already invited '+t.name:t.name+' has another invitation');
   if(!p)p=newParty(s);const id=crypto.randomBytes(4).toString('hex');invites.set(t.uid,{id,from:s.uid,pid:p.id,exp:Date.now()+INVITE_MS});
   send(t,{t:'party',op:'invited',id,from:s.name,lvl:(s.dgInfo&&s.dgInfo.lvl)||0,ms:INVITE_MS});send(s,{t:'party',op:'sent',to:t.name});push(p);return}
  case 'accept':case 'decline':{const inv=invites.get(s.uid);if(!inv||inv.id!==m.id||inv.exp<Date.now()){invites.delete(s.uid);return err(s,'That invitation has ended')}invites.delete(s.uid);const q=parties.get(inv.pid),by=sessOf(inv.from);
   if(op=='decline'){if(by)send(by,{t:'party',op:'declined',name:s.name});if(q&&q.m.length<2)dissolve(q);return}
   if(p)return err(s,'Leave your party first');if(!q)return err(s,'That party has ended');if(q.m.length>=MAX)return err(s,'That party is full');if(q.run&&!q.run.over)return err(s,'They are already in a dungeon');
   q.m.push({uid:s.uid,name:s.name,sid:s.sid,info:s.dgInfo||null});byUid.set(s.uid,q.id);push(q);return}
  case 'leave':if(p)leaveParty(p,s.uid,'left');return;
  case 'lead':{if(!p||p.leader!==s.uid)return;if(p.run&&!p.run.over)return err(s,'Not during a dungeon');const x=other(p,s.uid);if(!x)return;p.leader=x.uid;push(p);return}
  // the leader asks to enter: the other player's game answers whether it may (its level, its keys, its unlocks). Nobody enters unless both may.
  case 'start':{if(!p)return err(s,'You are not in a party');if(p.leader!==s.uid)return err(s,'Only the leader can start');if(p.m.length<2)return err(s,'You need a second player');if(p.run&&!p.run.over)return err(s,'Your party is already in a dungeon');if(p.m.some(x=>!x.sid))return err(s,'Your friend is offline');
   const d=String(m.d||'').slice(0,12),df=String(m.df||'normal').slice(0,12);if(!GEMS[d]||!DIFFS.includes(df))return err(s,'Unknown dungeon');const x=other(p,s.uid),q=sessions.get(x.sid);p.ask={d,df,by:s.uid};send(q,{t:'party',op:'ask',d,df});clearTimeout(p.askT);p.askT=setTimeout(()=>{if(p.ask){p.ask=null;err(s,x.name+' did not answer')}},ASK_MS);if(p.askT.unref)p.askT.unref();return}
  case 'ready':{if(!p||!p.ask)return;const a=p.ask,by=sessOf(a.by);p.ask=null;clearTimeout(p.askT);if(!m.ok){if(by)err(by,s.name+' cannot enter: '+String(m.why||'not unlocked').slice(0,80));return}
   p.run={id:crypto.randomBytes(8).toString('hex'),d:a.d,df:a.df,leader:a.by,seed:crypto.randomInt(1,1e9),t0:Date.now(),done:false,over:false};each(p,{t:'party',op:'go',run:p.run.id,d:a.d,df:a.df,leader:a.by,seed:p.run.seed});push(p);return}
  // the boss has fallen. Only the run's leader can say so, and not impossibly fast
  case 'done':{const r=p&&p.run;if(!r||r.over||r.id!==m.run||r.leader!==s.uid||r.done)return;if(Date.now()-r.t0<minRun)return;r.done=true;each(p,{t:'party',op:'run_done',run:r.id});return}
  case 'claim':return claim(s,p,m);
  // a page reload lost this computer's copy of the run: it comes back as the second computer, and the other one runs the monsters
  case 'rejoin':{const r=p&&p.run;if(!r||r.over||r.id!==m.run)return;const x=other(p,s.uid);if(r.leader===s.uid&&x&&x.sid){r.leader=x.uid;const q=sessions.get(x.sid);if(q)send(q,{t:'party',op:'promote',leader:x.uid})}return}
  // back at the door, the party can go again. Anyone leaving the dungeon ends the run for themselves; it ends for the party when both have gone
  case 'out':{const r=p&&p.run;if(!r||r.id!==m.run)return;r.out=r.out||{};r.out[s.uid]=1;const x=other(p,s.uid);const q=x&&x.sid&&sessions.get(x.sid);if(q&&!r.over)send(q,{t:'party',op:'mate_out',name:s.name});if(p.m.every(z=>r.out[z.uid])){r.over=true;if(p.m.length<2)dissolve(p);else push(p)}else if(p.leader===s.uid&&x&&r.leader===s.uid){r.leader=x.uid;if(q)send(q,{t:'party',op:'mate_gone',name:s.name,why:'left',leader:x.uid})}return}
  }}
 // play traffic: only between the two members of a run that is on, and never more than a game could use
 function relay(s,m){const p=mine(s);if(!p||!p.run||p.run.over)return;if(!bucket(s,'pg',450,5000))return;const x=other(p,s.uid);if(!x||!x.sid)return;const q=sessions.get(x.sid);if(q)send(q,{t:'pg',d:m.d})}
 function onAuth(s){const p=mine(s);if(!p)return;const x=memberOf(p,s.uid);if(!x)return;clearTimeout(x.gone);x.sid=s.sid;x.info=x.info||s.dgInfo||null;send(s,{t:'party',op:'state',p:view(p),back:1});const o=other(p,s.uid),q=o&&o.sid&&sessions.get(o.sid);if(q)send(q,{t:'party',op:'mate_back',name:s.name,run:p.run&&!p.run.over?p.run.id:null})}
 function onClose(s){if(!s.uid)return;invites.delete(s.uid);const p=mine(s);if(!p)return;const x=memberOf(p,s.uid);if(!x||x.sid!==s.sid)return;x.sid=null;const o=other(p,s.uid),q=o&&o.sid&&sessions.get(o.sid);if(q)send(q,{t:'party',op:'mate_off',name:s.name,ms:grace});push(p);clearTimeout(x.gone);x.gone=setTimeout(()=>{if(parties.get(p.id)&&!x.sid)leaveParty(p,x.uid,'lost')},grace);if(x.gone.unref)x.gone.unref()}
 return{msg,relay,onAuth,onClose,parties,get size(){return parties.size}}}
module.exports={createParties,GEMS,DIFFS,MAX};
