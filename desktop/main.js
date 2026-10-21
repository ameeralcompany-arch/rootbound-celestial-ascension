const {app,BrowserWindow,Menu}=require('electron');const path=require('path');
function create(){const w=new BrowserWindow({width:1280,height:720,backgroundColor:'#120a24',title:'Rootbound',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});Menu.setApplicationMenu(null);w.loadFile(path.join(__dirname,'index.html'));w.webContents.setWindowOpenHandler(()=>({action:'deny'}))}
app.whenReady().then(create);app.on('window-all-closed',()=>app.quit());
