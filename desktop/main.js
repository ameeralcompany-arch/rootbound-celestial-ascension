const {app,BrowserWindow,Menu,dialog,session,screen}=require('electron');const path=require('path');const fs=require('fs');
// RB_TEST_OFFSCREEN=1 (automated tests): the window renders normally but sits off-screen, never takes focus and has no taskbar button
const OFF=process.env.RB_TEST_OFFSCREEN=='1';if(OFF)require('electron').app.commandLine.appendSwitch('disable-features','CalculateNativeWinOcclusion');
const argv=process.argv,SMOKE=argv.includes('--smoke'),SAFE=argv.includes('--safe-mode')||fs.existsSync(path.join(path.dirname(process.execPath),'safe-mode.txt'));
// Safe mode turns hardware acceleration off. Some graphics drivers show a black window with it on.
if(SAFE){app.disableHardwareAcceleration();app.commandLine.appendSwitch('disable-gpu')}
// Always the dedicated graphics card on PCs that also have integrated graphics. The frame rate stays synced to the monitor (144 Hz
// monitor = 144 FPS): running uncapped without vsync made frames pile up and the GPU process crash, so the screen showed ~10 FPS.
else app.commandLine.appendSwitch('force_high_performance_gpu');
// Settings > Graphics > Uncapped frame rate (off by default): the game stores it in its storage; the app copies it to rbgfx.json
// (see syncGfx) and applies it at the next launch, since these switches only work before start-up.
const GFX=(()=>{try{return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'),'rbgfx.json'),'utf8'))}catch(_){return{}}})();
// The uncapped setting is no longer applied: turning off the monitor sync let frames pile up faster than the graphics card could show them, the GPU
// process ran at full load and the game froze or fell to ~10 FPS (seen on a GTX 1650 SUPER at 143 Hz, 2026-11-06). The game always runs at the monitor's rate.
// What the Rootbound launcher can ask for. Started without these, the game behaves as it always has. --rb-display: fullscreen, borderless or windowed. --rb-res: WIDTHxHEIGHT. --rb-quality: a graphics preset id. --rb-world / --rb-dungeon: a quick launch.
const rbArg=k=>{const p='--rb-'+k+'=',a=argv.find(x=>x.startsWith(p));return a?a.slice(p.length):''};
const DISPLAY=/^(fullscreen|borderless|windowed)$/.test(rbArg('display'))?rbArg('display'):'fullscreen',RES=/^(\d{3,5})x(\d{3,5})$/.exec(rbArg('res')),QUALITY=/^(auto|potato|low|med|high|ultra|cine)$/.test(rbArg('quality'))?rbArg('quality'):'',QUICK={};
if(/^[a-z0-9_-]{1,16}$/.test(rbArg('world')))QUICK.rbworld=rbArg('world');if(/^[a-z0-9_-]{1,16}$/.test(rbArg('dungeon')))QUICK.rbdungeon=rbArg('dungeon');
let logf=null;function log(m){const l=new Date().toISOString()+' '+m+'\n';try{if(!logf)logf=path.join(app.getPath('userData'),'rootbound-startup.log');fs.appendFileSync(logf,l)}catch(_){}if(SMOKE)console.log(m)}
function create(){
 const size=RES?{width:+RES[1],height:+RES[2]}:{width:1280,height:720},bl=DISPLAY=='borderless'&&!OFF&&!SMOKE;
 const w=new BrowserWindow(Object.assign({width:size.width,height:size.height,show:false,frame:!bl,backgroundColor:'#ece8f5',title:'Rootbound',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}},OFF?{x:-32000,y:-32000,skipTaskbar:true,focusable:false}:{}));
 Menu.setApplicationMenu(null);
 // the game always opens full-screen (F11 still switches to a window and back); test runs stay off-screen and windowed
 const show=()=>{if(OFF)w.showInactive();else{if(bl){const a=screen.getPrimaryDisplay().bounds;w.setBounds(RES?{x:a.x+Math.max(0,(a.width-size.width)>>1),y:a.y+Math.max(0,(a.height-size.height)>>1),width:Math.min(a.width,size.width),height:Math.min(a.height,size.height)}:a)}w.show();if(!SMOKE&&DISPLAY=='fullscreen')w.setFullScreen(true)}};
 w.once('ready-to-show',show);setTimeout(()=>{if(!w.isDestroyed()&&!w.isVisible())show()},4000);
 w.webContents.on('console-message',e=>{if(e.level=='warning'||e.level=='error')log('console: '+String(e.message).slice(0,300))});
 // no error windows for the player: a failed load is logged and quietly retried (a file being replaced by an update can briefly fail)
 let tries=0;w.webContents.on('did-fail-load',(_e,code,desc,url)=>{log('did-fail-load '+code+' '+desc+' '+url);/* -3 = load aborted by a reload/navigation: harmless */if(code!==-3&&!SMOKE&&!OFF&&tries<3){tries++;setTimeout(()=>{if(!w.isDestroyed())w.loadFile(path.join(__dirname,'index.html'),{query:QUICK})},1500*tries)}});
 w.webContents.on('render-process-gone',(_e,d)=>{log('render-process-gone '+JSON.stringify(d));if(!SMOKE&&!SAFE&&!OFF){app.relaunch({args:process.argv.slice(1).concat('--safe-mode')});app.exit(0)}});
 w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 // the window only ever shows the game: no navigating away, no embedded pages, no camera, microphone or the like
 w.webContents.on('will-navigate',(e,u)=>{if(!String(u).startsWith('file:'))e.preventDefault()});w.webContents.on('will-attach-webview',e=>e.preventDefault());
 {const OK=new Set(['fullscreen','pointerLock','clipboard-sanitized-write']);session.defaultSession.setPermissionRequestHandler((_c,p,cb)=>cb(OK.has(p)));session.defaultSession.setPermissionCheckHandler((_c,p)=>OK.has(p))}
 // F11 toggles fullscreen (the app menu is hidden, so add it back by hand)
 w.webContents.on('before-input-event',(e,i)=>{if(i.type=='keyDown'&&i.key=='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault()}});
 w.loadFile(path.join(__dirname,'index.html'),{query:QUICK});
 // copy the game's frame rate choice to rbgfx.json for the next launch (only when it changes)
 const syncGfx=()=>{if(w.isDestroyed())return;w.webContents.executeJavaScript("(()=>{try{return localStorage.getItem('rb_fps_uncapped')}catch(_){return null}})()",true).then(v=>{const u=v==='1';if(!!GFX.uncapped===u)return;GFX.uncapped=u;try{fs.writeFileSync(path.join(app.getPath('userData'),'rbgfx.json'),JSON.stringify(GFX))}catch(_){}}).catch(()=>{})};
 const gfxT=setInterval(syncGfx,5000);w.on('closed',()=>clearInterval(gfxT));
 // the launcher's Profile and Continue Playing pages read rootbound-profile.json (never the save itself). Playtime counts while a world is open. A crash loses at most ten seconds of it.
 const PF=path.join(app.getPath('userData'),'rootbound-profile.json');let pf=(()=>{try{return JSON.parse(fs.readFileSync(PF,'utf8'))}catch(_){return{}}})(),pfLast=Date.now(),pfSeen='';if(!pf||typeof pf!='object')pf={};pf.playSeconds=Number.isFinite(pf.playSeconds)?pf.playSeconds:0;pf.recentWorlds=Array.isArray(pf.recentWorlds)?pf.recentWorlds:[];pf.recentDungeons=Array.isArray(pf.recentDungeons)?pf.recentDungeons:[];
 const playing={startedAt:Date.now(),seconds:0};
 const pfWrite=()=>{try{const t=PF+'.tmp';fs.writeFileSync(t,JSON.stringify(pf));fs.renameSync(t,PF)}catch(e){log('profile '+e)}};
 const touch=(list,key,val,o)=>{const i=list.findIndex(x=>x[key]==val);if(i>=0)list.splice(i,1);list.unshift(Object.assign({[key]:val,at:Date.now()},o));list.length=Math.min(list.length,12)};
 const syncProfile=()=>{if(w.isDestroyed())return Promise.resolve();return w.webContents.executeJavaScript("(()=>{try{return window.RBLAUNCH?RBLAUNCH.profile():null}catch(_){return null}})()",true).then(p=>{const now=Date.now(),dt=Math.min(30,(now-pfLast)/1000);pfLast=now;if(!p)return;if(p.entered&&!p.cover){pf.playSeconds+=dt;playing.seconds+=dt}if(p.world&&!p.run)touch(pf.recentWorlds,'name',p.world,{});if(p.run)touch(pf.recentDungeons,'id',p.run.id,{name:p.run.name,diff:p.run.diff});pf.game=p;pf.lastSession={startedAt:playing.startedAt,seconds:Math.round(playing.seconds),endedAt:now};pf.updatedAt=now;pf.version=app.getVersion();const k=JSON.stringify(pf);if(k!==pfSeen){pfSeen=k;pfWrite()}}).catch(()=>{})};
 if(!SMOKE){const pfT=setInterval(syncProfile,10000);w.on('closed',()=>clearInterval(pfT));let closing=false;w.on('close',e=>{if(closing)return;closing=true;e.preventDefault();const done=()=>{if(!w.isDestroyed())w.close()};Promise.race([syncProfile(),new Promise(r=>setTimeout(r,800))]).then(done,done)})}
 // a graphics preset chosen in the launcher, applied once the game has loaded
 if(QUALITY){let n=0;const qT=setInterval(()=>{if(w.isDestroyed()||++n>120)return clearInterval(qT);w.webContents.executeJavaScript("(()=>{try{if(window.RBDIAG&&RBDIAG.ready&&typeof QM!='undefined'){QM.setting('"+QUALITY+"');return true}}catch(_){}return false})()",true).then(ok=>{if(ok)clearInterval(qT)}).catch(()=>{})},500)}
 if(SMOKE){let n=0;const iv=setInterval(async()=>{n++;try{const r=await w.webContents.executeJavaScript('(function(){return window.RBDIAG?{ready:RBDIAG.ready,errors:RBDIAG.errors.length,rep:RBDIAG.report()}:null})()');if(r&&r.ready){clearInterval(iv);console.log('SMOKE-OK ready; runtime errors='+r.errors);try{console.log('gpu '+JSON.stringify(app.getGPUFeatureStatus()))}catch(_){}console.log(r.rep);app.exit(0)}}catch(e){log('smoke eval '+e)}if(n>40){clearInterval(iv);console.log('SMOKE-FAIL not ready in 20s');try{console.log(await w.webContents.executeJavaScript('RBDIAG.report()'))}catch(_){}app.exit(1)}},500)}
}
// a crashed GPU process makes Chromium fall back to slow software drawing: leave a trace in the startup log
app.on('child-process-gone',(_e,d)=>log('child-process-gone '+JSON.stringify(d)));
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
