// Locks the packaged Rootbound.exe down after packaging: it can no longer be run as a plain Node program, take code through
// NODE_OPTIONS or a debugger flag, or load game files from outside app.asar. node harden.js <path to Rootbound.exe>
const {flipFuses,FuseVersion,FuseV1Options}=require('@electron/fuses');
const exe=process.argv[2];if(!exe){console.error('usage: node harden.js <Rootbound.exe>');process.exit(1)}
flipFuses(exe,{version:FuseVersion.V1,[FuseV1Options.RunAsNode]:false,[FuseV1Options.EnableNodeOptionsEnvironmentVariable]:false,[FuseV1Options.EnableNodeCliInspectArguments]:false,[FuseV1Options.OnlyLoadAppFromAsar]:true}).then(()=>console.log('hardened',exe)).catch(e=>{console.error(e);process.exit(1)});
