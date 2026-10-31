// The story intro's last two scenes (restore + title) use the Unity-rendered backdrop media/intro.webm: it preloads when the
// intro starts, plays in sync with the story clock, overlays (title letters) still draw, and it is released when the intro ends.
// Without the video the painted world draws as before. node tests/intro-video.js [shotDir]
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const URL='file://'+path.resolve(__dirname,'../index.html'),EXE=process.env.CHROMIUM||'/opt/pw-browsers/chromium',SHOTS=process.argv[2];
let fails=0;const ok=(n,c,d)=>{if(!c)fails++;console.log((c?'PASS ':'FAIL ')+n+(d!=null&&d!==''?'  - '+(typeof d=='string'?d:JSON.stringify(d)):''))};
setTimeout(()=>{console.log('FAIL global timeout (test hung)');process.exit(2)},120000).unref();
(async()=>{const b=await chromium.launch({executablePath:EXE,args:['--no-sandbox','--mute-audio','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 // automated browsers skip the launch intro unless rb_force_launch is set (see tests/cine.js)
 await p.addInitScript(()=>{try{localStorage.setItem('rb_force_launch','1')}catch(_){}try{speechSynthesis.speak=function(){}}catch(_){}});
 await p.goto(URL);
 await p.waitForFunction(()=>typeof CINE7!='undefined'&&CINE7.playing,null,{timeout:30000}).catch(()=>{});
 ok('the story intro starts',await p.evaluate(()=>CINE7.playing));
 await p.waitForFunction(()=>CINE7.uvState().ok,null,{timeout:20000}).catch(()=>{});
 const st=await p.evaluate(()=>CINE7.uvState());
 ok('the Unity backdrop video preloads (14 s, 1600 px)',st.ok&&st.rs>=2&&st.w==1600&&Math.abs(st.d-14)<.3,st);
 // jump to 2 s into "restore" (the light comes back), then 3 s into "title"
 const starts=await p.evaluate(()=>{const r={};try{for(const s of CINE7.STORY)r[s[0]]=s[3]}catch(_){}return r});
 const at=async(u,name)=>{await p.evaluate(u=>CINE7.seek(u),u);await p.waitForTimeout(1600);const s=await p.evaluate(()=>CINE7.uvState());if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await p.screenshot({path:path.join(SHOTS,name+'.png')})}return s};
 if(starts.restore!=null){
  const a=await at(starts.restore+2,'restore');ok('in "restore" the video plays near the story clock',a.ok&&!isNaN(a.ct)&&a.ct>1&&a.ct<5.5,a);
  const c=await at(starts.title+5,'title');ok('in "title" it continues from the restore length',c.ok&&c.ct>(starts.title-starts.restore)+1.5&&c.ct<14,c);
 }else ok('story timings are readable (CINE7.STORY)',false,Object.keys(starts));
 await p.evaluate(()=>CINE7.seek(9999));await p.waitForTimeout(2500);
 const end=await p.evaluate(()=>({playing:CINE7.playing,uv:CINE7.uvState()}));
 ok('when the intro ends the video is released',!end.playing&&end.uv.rs==-1,end);
 ok('no page errors',errs.length==0,errs.slice(0,3).join(' | '));
 await b.close();console.log(fails?fails+' intro-video test(s) FAILED':'all intro-video tests passed');process.exit(fails?1:0)})().catch(e=>{console.error('FAIL',e.message.slice(0,300));process.exit(1)});
