// The controls work on a non-Latin keyboard layout (Arabic here), and text typed in the chat stays as typed. Run: node tests/keys.js
const path=require('path');const {chromium}=require('playwright');
const EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',FILE='file://'+path.resolve(__dirname,'../index.html');
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?'  - '+JSON.stringify(d).slice(0,300):''))};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
setTimeout(()=>{console.log('FAIL global timeout');process.exit(2)},120000).unref();
const SAVE=JSON.stringify({v:1,inv:{1:20},gems:100,own:{fist:1},wp:'fist',bar:[1],done:{},xp:3,lvl:20,made:true,look:{skin:'#f1c9a0',hair:'#3a2a1a',style:0,shirt:'#3c6fd1',pants:'#2b3a5a',shoes:'#222',hat:0,gd:1,eye:'#222'}});
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio']});const c=await b.newContext({viewport:{width:1280,height:720}});await c.addInitScript(sd=>{localStorage.setItem('rbp',sd);localStorage.setItem('rbg_seen','1')},SAVE);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(FILE,{waitUntil:'commit'});await p.waitForFunction(()=>window.RBDIAG&&RBDIAG.ready,null,{timeout:90000});await sleep(1500);await p.evaluate(()=>{try{RPG.guide.stop()}catch(_){}enterWorld('rbkeys')});await sleep(2600);
 const send=(type,key,code,target)=>p.evaluate(([type,key,code,target])=>{const e=new KeyboardEvent(type,{key,code,bubbles:true,cancelable:true});(target?document.querySelector(target):document.body).dispatchEvent(e);return e.key},[type,key,code,target]);
 const AR=[['ص','KeyW','w'],['ش','KeyA','a'],['س','KeyS','s'],['ي','KeyD','d']];
 for(const[k,c,want]of AR){await send('keydown',k,c);const on=await p.evaluate(w=>!!K[w],want);await send('keyup',k,c);const off=await p.evaluate(w=>!K[w],want);ok('the '+want.toUpperCase()+' key works on an Arabic keyboard',on&&off)}
 const x0=await p.evaluate(()=>P.x);await send('keydown','ي','KeyD');await sleep(500);const x1=await p.evaluate(()=>P.x);await send('keyup','ي','KeyD');ok('the character really walks',x1-x0>40,{moved:x1-x0});
 await send('keydown','d','KeyD');const en=await p.evaluate(()=>!!K.d);await send('keyup','d','KeyD');ok('an English keyboard works as before',en);
 const az=await send('keydown','a','KeyQ');await send('keyup','a','KeyQ');ok('other Latin layouts keep their own letters',az=='a',az);
 const chat=await p.evaluate(()=>{const i=document.createElement('input');i.type='text';i.id='tk';document.body.appendChild(i);i.focus();const e=new KeyboardEvent('keydown',{key:'ش',code:'KeyA',bubbles:true,cancelable:true});i.dispatchEvent(e);const r=e.key;i.remove();return r});ok('Arabic typed in a text box stays Arabic',chat=='ش',chat);
 ok('no script errors',errs.length==0,errs.slice(0,3));await b.close();console.log(fails?'FAILED '+fails:'ALL PASSED');process.exit(fails?1:0)})().catch(e=>{console.log('FAIL crashed',e.message);process.exit(2)});
