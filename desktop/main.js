const {app,BrowserWindow,Menu,dialog,session}=require('electron');const path=require('path');const fs=require('fs');
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
if(!SAFE&&GFX.uncapped){app.commandLine.appendSwitch('disable-frame-rate-limit');app.commandLine.appendSwitch('disable-gpu-vsync')}
let logf=null;function log(m){const l=new Date().toISOString()+' '+m+'\n';try{if(!logf)logf=path.join(app.getPath('userData'),'rootbound-startup.log');fs.appendFileSync(logf,l)}catch(_){}if(SMOKE)console.log(m)}
function create(){
 const w=new BrowserWindow(Object.assign({width:1280,height:720,show:false,backgroundColor:'#ece8f5',title:'Rootbound',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}},OFF?{x:-32000,y:-32000,skipTaskbar:true,focusable:false}:{}));
 Menu.setApplicationMenu(null);
 // the game always opens full-screen (F11 still switches to a window and back); test runs stay off-screen and windowed
 const show=()=>{if(OFF)w.showInactive();else{w.show();if(!SMOKE)w.setFullScreen(true)}};
 w.once('ready-to-show',show);setTimeout(()=>{if(!w.isDestroyed()&&!w.isVisible())show()},4000);
 w.webContents.on('console-message',e=>{if(e.level=='warning'||e.level=='error')log('console: '+String(e.message).slice(0,300))});
 // no error windows for the player: a failed load is logged and quietly retried (a file being replaced by an update can briefly fail)
 let tries=0;w.webContents.on('did-fail-load',(_e,code,desc,url)=>{log('did-fail-load '+code+' '+desc+' '+url);/* -3 = load aborted by a reload/navigation: harmless */if(code!==-3&&!SMOKE&&!OFF&&tries<3){tries++;setTimeout(()=>{if(!w.isDestroyed())w.loadFile(path.join(__dirname,'index.html'))},1500*tries)}});
 w.webContents.on('render-process-gone',(_e,d)=>{log('render-process-gone '+JSON.stringify(d));if(!SMOKE&&!SAFE&&!OFF){app.relaunch({args:process.argv.slice(1).concat('--safe-mode')});app.exit(0)}});
 w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 // the window only ever shows the game: no navigating away, no embedded pages, no camera, microphone or the like
 w.webContents.on('will-navigate',(e,u)=>{if(!String(u).startsWith('file:'))e.preventDefault()});w.webContents.on('will-attach-webview',e=>e.preventDefault());
 {const OK=new Set(['fullscreen','pointerLock','clipboard-sanitized-write']);session.defaultSession.setPermissionRequestHandler((_c,p,cb)=>cb(OK.has(p)));session.defaultSession.setPermissionCheckHandler((_c,p)=>OK.has(p))}
 // F11 toggles fullscreen (the app menu is hidden, so add it back by hand)
 w.webContents.on('before-input-event',(e,i)=>{if(i.type=='keyDown'&&i.key=='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault()}});
 w.loadFile(path.join(__dirname,'index.html'));
 // copy the game's frame rate choice to rbgfx.json for the next launch (only when it changes)
 const syncGfx=()=>{if(w.isDestroyed())return;w.webContents.executeJavaScript("(()=>{try{return localStorage.getItem('rb_fps_uncapped')}catch(_){return null}})()",true).then(v=>{const u=v==='1';if(!!GFX.uncapped===u)return;GFX.uncapped=u;try{fs.writeFileSync(path.join(app.getPath('userData'),'rbgfx.json'),JSON.stringify(GFX))}catch(_){}}).catch(()=>{})};
 const gfxT=setInterval(syncGfx,5000);w.on('closed',()=>clearInterval(gfxT));
 if(SMOKE){let n=0;const iv=setInterval(async()=>{n++;try{const r=await w.webContents.executeJavaScript('(function(){return window.RBDIAG?{ready:RBDIAG.ready,errors:RBDIAG.errors.length,rep:RBDIAG.report()}:null})()');if(r&&r.ready){clearInterval(iv);console.log('SMOKE-OK ready; runtime errors='+r.errors);try{console.log('gpu '+JSON.stringify(app.getGPUFeatureStatus()))}catch(_){}console.log(r.rep);app.exit(0)}}catch(e){log('smoke eval '+e)}if(n>40){clearInterval(iv);console.log('SMOKE-FAIL not ready in 20s');try{console.log(await w.webContents.executeJavaScript('RBDIAG.report()'))}catch(_){}app.exit(1)}},500)}
}
// a crashed GPU process makes Chromium fall back to slow software drawing: leave a trace in the startup log
app.on('child-process-gone',(_e,d)=>log('child-process-gone '+JSON.stringify(d)));
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
