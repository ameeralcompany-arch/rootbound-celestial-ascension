// ===== RBMIX: one mixing desk for every sound in Rootbound. The game makes sound in several Web Audio engines (effects, interface, music, weather,
// bosses, the login film); each of them ends by connecting to its speakers. This runs before any of them and sends that last connection through a
// shared desk per engine instead, so the whole game has one smooth, warm character and can never clip:
//   a gentle cut of the harsh band (about 3 kHz) and of the brittle top (above 6 kHz), a clean low end (rumble below 28 Hz removed), a soft "glue"
//   compressor that keeps loud moments from jumping out, and a fast limiter at the end that stops anything from going over full scale.
// It only shapes tone and loudness: every engine's own volume sliders still work exactly as before. Offline renders (OfflineAudioContext) are left alone.
// RBMIX.duck(amount, seconds) lowers the music for a moment (an ultimate's build-up), and RBMIX.stats() reports the peak level for tests. =====
(function(){
 try{
  // the "installed" mark lives under its own name: every node inherits from AudioNode.prototype, so marking it __rbmix would make every sound look
  // like a part of the desk and skip it (only the desk's own nodes carry __rbmix, set on each node)
  if(typeof AudioNode=='undefined'||!AudioNode.prototype||AudioNode.prototype.__rbmixOn)return;
  const raw=AudioNode.prototype.connect;AudioNode.prototype.__rbmixOn=1;
  const buses=new Map();let peak=0,peakT=0;
  function busFor(ctx){
   if(!ctx||(typeof OfflineAudioContext!='undefined'&&ctx instanceof OfflineAudioContext&&!window.RBMIX_OFFLINE))return null;   // tests render offline through the desk (RBMIX_OFFLINE)
   let b=buses.get(ctx);if(b)return b;
   try{
    const mk=(type,f,gain,q)=>{const n=ctx.createBiquadFilter();n.type=type;n.frequency.value=f;if(gain!=null)n.gain.value=gain;if(q!=null)n.Q.value=q;n.__rbmix=1;return n};
    const input=ctx.createGain();input.__rbmix=1;input.gain.value=1;
    const hp=mk('highpass',28,null,.6),harsh=mk('peaking',3000,-2.5,.9),top=mk('highshelf',6200,-4.5),warm=mk('lowshelf',160,1.2);
    const glue=ctx.createDynamicsCompressor();glue.__rbmix=1;glue.threshold.value=-16;glue.knee.value=14;glue.ratio.value=2.6;glue.attack.value=.008;glue.release.value=.28;
    const lim=ctx.createDynamicsCompressor();lim.__rbmix=1;lim.threshold.value=-2.5;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.12;
    // the browser's compressors add their own make-up gain to quiet sound (about +5 dB here); the output takes it back, so the game sounds smoother at
    // the loudness it was made at, never louder (measured: the same level as without the desk for swings, pickups and a long soak)
    const out=ctx.createGain();out.__rbmix=1;out.gain.value=.55;
    const an=ctx.createAnalyser();an.__rbmix=1;an.fftSize=1024;
    for(const[a,z]of[[input,hp],[hp,harsh],[harsh,top],[top,warm],[warm,glue],[glue,lim],[lim,out]])raw.call(a,z);
    raw.call(out,ctx.destination);raw.call(out,an);
    b={input,glue,lim,out,an,buf:new Float32Array(an.fftSize)};buses.set(ctx,b);
    return b}catch(_){return null}}
  AudioNode.prototype.connect=function(dest){
   try{if(dest&&typeof AudioDestinationNode!='undefined'&&dest instanceof AudioDestinationNode&&!this.__rbmix){const b=busFor(this.context);if(b){const a=Array.prototype.slice.call(arguments);a[0]=b.input;return raw.apply(this,a)}}}catch(_){}
   return raw.apply(this,arguments)};
  // the loudest sample heard lately, for tests and the audio soak (cheap: read only when asked)
  function stats(){let p=0;for(const b of buses.values()){try{b.an.getFloatTimeDomainData(b.buf);for(let i=0;i<b.buf.length;i++){const v=Math.abs(b.buf[i]);if(v>p)p=v}}catch(_){}}if(p>peak)peak=p;return{now:p,peak,engines:buses.size,reduce:[...buses.values()].map(b=>{try{return +b.glue.reduction.toFixed?b.glue.reduction:0}catch(_){return 0}})}}
  // music ducking: the music engines register a gain node here; duck() lowers them and brings them back smoothly
  const ducks=new Set();
  function duck(amount,secs,ctxGain){const k=Math.max(0,Math.min(1,1-(amount==null?.6:amount))),s=Math.max(.2,secs||1.5);for(const g of ducks){try{const c=g.context,t=c.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(k,t+.25);g.gain.setValueAtTime(k,t+.25+s);g.gain.linearRampToValueAtTime(1,t+.25+s+.9)}catch(_){}}}
  window.RBMIX={busFor,stats,duck,addDuck:g=>{try{if(g)ducks.add(g)}catch(_){}},duckLevels:()=>[...ducks].map(g=>+g.gain.value.toFixed(3)),resetPeak(){peak=0},get buses(){return buses}};
 }catch(e){try{console.error('RBMIX',e)}catch(_){}}
})();
