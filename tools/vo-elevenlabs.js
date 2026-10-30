// Render the launch intro's narration with ElevenLabs into desktop/vo/<id>.mp3 (the desktop app plays them instead of the system voice).
// Usage (PowerShell):  $env:ELEVENLABS_API_KEY="..."; $env:ELEVENLABS_VOICE_ID="..."; node tools/vo-elevenlabs.js [--only tree,title] [--out desktop/vo]
// Needs Node 18+ (built-in fetch). Lines and voice settings live in tools/vo-script.json. Then repackage the desktop app.
// Why the settings: stability ~0.5 keeps the read human (higher goes flat and robotic, lower starts to wobble and stutter), similarity
// ~0.78 keeps the timbre clean without copying recording noise, a little style (0.15-0.35) adds emotion without artifacts, speed ~0.93
// is calm. previous_text / next_text give each line the intonation of its neighbours so lines sound like one continuous take, and every
// line ends on a full stop so the model finishes the sentence instead of trailing off.
const fs=require('fs'),path=require('path');
const KEY=process.env.ELEVENLABS_API_KEY,VOICE=process.env.ELEVENLABS_VOICE_ID;
const arg=n=>{const i=process.argv.indexOf(n);return i>0?process.argv[i+1]:null};
if(!KEY||!VOICE){console.error('Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (pick a deep, calm narrator voice in your ElevenLabs Voice Library and copy its ID).');process.exit(1)}
const S=JSON.parse(fs.readFileSync(path.join(__dirname,'vo-script.json'),'utf8'));
const out=path.resolve(arg('--out')||path.join(__dirname,'..','desktop','vo')),only=(arg('--only')||'').split(',').filter(Boolean);
const plain=t=>t.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
fs.mkdirSync(out,{recursive:true});
(async()=>{let bad=0;
 for(let i=0;i<S.lines.length;i++){const L=S.lines[i];if(only.length&&!only.includes(L.id))continue;
  let text=L.say.trim();if(!/[.!?]["')\]]*$/.test(plain(text)))text+='.';   // a line that ends without a full stop is where the model trails off
  const body={text,model_id:L.model_id||S.model_id,voice_settings:Object.assign({},S.voice_settings,L.voice_settings||{}),
   previous_text:i>0?plain(S.lines[i-1].say):undefined,next_text:i<S.lines.length-1?plain(S.lines[i+1].say):undefined};
  const url='https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(VOICE)+'?output_format='+encodeURIComponent(S.output_format||'mp3_44100_128');
  let ok=false;for(let tries=0;tries<3&&!ok;tries++){try{
   const r=await fetch(url,{method:'POST',headers:{'xi-api-key':KEY,'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify(body)});
   if(r.status==429||r.status>=500){await new Promise(z=>setTimeout(z,2000*(tries+1)));continue}
   if(!r.ok){console.error(L.id+': HTTP '+r.status+' '+(await r.text()).slice(0,300));break}
   const buf=Buffer.from(await r.arrayBuffer());if(buf.length<2000){console.error(L.id+': clip too small ('+buf.length+' bytes)');break}
   fs.writeFileSync(path.join(out,L.id+'.mp3'),buf);console.log('wrote',L.id+'.mp3',(buf.length/1024).toFixed(0)+' KB');ok=true}catch(e){console.error(L.id+': '+e.message)}}
  if(!ok)bad++}
 if(bad){console.error(bad+' line(s) failed. The game only uses studio clips when every line is present, otherwise it keeps the system voice.');process.exit(1)}
 console.log('Done. Repackage the desktop app so desktop/vo/ ships next to index.html.')})();
