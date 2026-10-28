const {app,BrowserWindow,Menu,dialog}=require('electron');const path=require('path');const fs=require('fs');
// RB_TEST_OFFSCREEN=1 (automated tests): the window renders normally but sits off-screen, never takes focus and has no taskbar button
const OFF=process.env.RB_TEST_OFFSCREEN=='1';if(OFF)require('electron').app.commandLine.appendSwitch('disable-features','CalculateNativeWinOcclusion');
const argv=process.argv,SMOKE=argv.includes('--smoke'),SAFE=argv.includes('--safe-mode')||fs.existsSync(path.join(path.dirname(process.execPath),'safe-mode.txt'));
// Safe mode turns hardware acceleration off. Some graphics drivers show a black window with it on.
if(SAFE){app.disableHardwareAcceleration();app.commandLine.appendSwitch('disable-gpu')}
// Uncapped frame rate (no 60/144 Hz vsync limit) and always the dedicated graphics card on PCs that also have integrated graphics.
else{app.commandLine.appendSwitch('disable-frame-rate-limit');app.commandLine.appendSwitch('disable-gpu-vsync');app.commandLine.appendSwitch('force_high_performance_gpu')}
let logf=null;function log(m){const l=new Date().toISOString()+' '+m+'\n';try{if(!logf)logf=path.join(app.getPath('userData'),'rootbound-startup.log');fs.appendFileSync(logf,l)}catch(_){}if(SMOKE)console.log(m)}
function create(){
 const w=new BrowserWindow(Object.assign({width:1280,height:720,show:false,backgroundColor:'#ece8f5',title:'Rootbound',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}},OFF?{x:-32000,y:-32000,skipTaskbar:true,focusable:false}:{}));
 Menu.setApplicationMenu(null);
 const show=()=>{if(OFF)w.showInactive();else w.show()};
 w.once('ready-to-show',show);setTimeout(()=>{if(!w.isDestroyed()&&!w.isVisible())show()},4000);
 w.webContents.on('console-message',(_e,lvl,msg)=>{if(lvl>=2)log('console: '+msg.slice(0,300))});
 w.webContents.on('did-fail-load',(_e,code,desc,url)=>{log('did-fail-load '+code+' '+desc+' '+url);/* -3 = load aborted by a reload/navigation: harmless */if(code!==-3&&!SMOKE&&!OFF)dialog.showErrorBox('Rootbound could not load','The game file failed to load ('+desc+').\nA log was written to:\n'+logf)});
 w.webContents.on('render-process-gone',(_e,d)=>{log('render-process-gone '+JSON.stringify(d));if(!SMOKE&&!SAFE&&!OFF){app.relaunch({args:process.argv.slice(1).concat('--safe-mode')});app.exit(0)}});
 w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 // F11 toggles fullscreen (the app menu is hidden, so add it back by hand)
 w.webContents.on('before-input-event',(e,i)=>{if(i.type=='keyDown'&&i.key=='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault()}});
 w.loadFile(path.join(__dirname,'index.html'));
 if(SMOKE){let n=0;const iv=setInterval(async()=>{n++;try{const r=await w.webContents.executeJavaScript('(function(){return window.RBDIAG?{ready:RBDIAG.ready,errors:RBDIAG.errors.length,rep:RBDIAG.report()}:null})()');if(r&&r.ready){clearInterval(iv);console.log('SMOKE-OK ready; runtime errors='+r.errors);try{console.log('gpu '+JSON.stringify(app.getGPUFeatureStatus()))}catch(_){}console.log(r.rep);app.exit(0)}}catch(e){log('smoke eval '+e)}if(n>40){clearInterval(iv);console.log('SMOKE-FAIL not ready in 20s');try{console.log(await w.webContents.executeJavaScript('RBDIAG.report()'))}catch(_){}app.exit(1)}},500)}
}
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
