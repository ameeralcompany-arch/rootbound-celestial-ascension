const {app,BrowserWindow,Menu,dialog}=require('electron');const path=require('path');const fs=require('fs');
const argv=process.argv,SMOKE=argv.includes('--smoke'),SAFE=argv.includes('--safe-mode')||fs.existsSync(path.join(path.dirname(process.execPath),'safe-mode.txt'));
// Safe mode turns hardware acceleration off. Some graphics drivers show a black window with it on.
if(SAFE){app.disableHardwareAcceleration();app.commandLine.appendSwitch('disable-gpu')}
let logf=null;function log(m){const l=new Date().toISOString()+' '+m+'\n';try{if(!logf)logf=path.join(app.getPath('userData'),'rootbound-startup.log');fs.appendFileSync(logf,l)}catch(_){}if(SMOKE)console.log(m)}
function create(){
 const w=new BrowserWindow({width:1280,height:720,show:false,backgroundColor:'#ece8f5',title:'Rootbound',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
 Menu.setApplicationMenu(null);
 w.once('ready-to-show',()=>w.show());setTimeout(()=>{if(!w.isDestroyed()&&!w.isVisible())w.show()},4000);
 w.webContents.on('console-message',(_e,lvl,msg)=>{if(lvl>=2)log('console: '+msg.slice(0,300))});
 w.webContents.on('did-fail-load',(_e,code,desc,url)=>{log('did-fail-load '+code+' '+desc+' '+url);if(!SMOKE)dialog.showErrorBox('Rootbound could not load','The game file failed to load ('+desc+').\nA log was written to:\n'+logf)});
 w.webContents.on('render-process-gone',(_e,d)=>{log('render-process-gone '+JSON.stringify(d));if(!SMOKE&&!SAFE){app.relaunch({args:process.argv.slice(1).concat('--safe-mode')});app.exit(0)}});
 w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 w.loadFile(path.join(__dirname,'index.html'));
 if(SMOKE){let n=0;const iv=setInterval(async()=>{n++;try{const r=await w.webContents.executeJavaScript('(function(){return window.RBDIAG?{ready:RBDIAG.ready,errors:RBDIAG.errors.length,rep:RBDIAG.report()}:null})()');if(r&&r.ready){clearInterval(iv);console.log('SMOKE-OK ready; runtime errors='+r.errors);console.log(r.rep);app.exit(0)}}catch(e){log('smoke eval '+e)}if(n>40){clearInterval(iv);console.log('SMOKE-FAIL not ready in 20s');try{console.log(await w.webContents.executeJavaScript('RBDIAG.report()'))}catch(_){}app.exit(1)}},500)}
}
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
