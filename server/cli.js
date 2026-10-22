#!/usr/bin/env node
'use strict';
// Owner setup. The owner password is read from a hidden prompt (or stdin with --password-stdin) and stored only as a scrypt hash on the server.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),readline=require('readline');
const {Store}=require('./store');
const dir=process.env.DATA_DIR||path.join(__dirname,'data'),store=new Store(dir);
const args=process.argv.slice(2),cmd=args[0];
function ask(q,hidden){return new Promise(res=>{if(args.includes('--password-stdin')){let b='';process.stdin.on('data',d=>b+=d);process.stdin.on('end',()=>res(b.split('\n')[0].replace(/\r$/,'')));return}
 const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});if(hidden){rl._writeToOutput=s=>{if(s.includes(q))rl.output.write(s);else rl.output.write('')}}rl.question(q,a=>{rl.close();if(hidden)process.stdout.write('\n');res(a)})})}
(async()=>{
 if(cmd=='set-owner'){const name=args[1];if(!/^[A-Za-z0-9_-]{3,16}$/.test(name||'')){console.error('Usage: node server/cli.js set-owner <AccountName(3-16 letters/numbers/_-)> [--password-stdin] [--force]');process.exit(1)}
  const owner=store.readJSON(store.p('owner.json'),null);if(owner&&owner.name.toLowerCase()!=name.toLowerCase()&&!args.includes('--force')){console.error('An owner ('+owner.name+') is already configured. Re-run with --force to replace it.');process.exit(1)}
  const pw=await ask('Owner password (min 12 characters): ',true);if(pw.length<12){console.error('Password too short (min 12).');process.exit(1)}
  const accounts=store.readJSON(store.p('accounts.json'),{users:{}});const key=name.toLowerCase();
  const salt=crypto.randomBytes(16),N=+process.env.SCRYPT_N||16384,h=crypto.scryptSync(pw,salt,32,{N,r:8,p:1});const pwr={s:salt.toString('hex'),h:h.toString('hex'),N};
  let u=accounts.users[key];if(!u){u=accounts.users[key]={id:'a'+crypto.randomBytes(4).toString('hex'),name,pw:pwr,role:'owner',created:Date.now(),worlds:[]}}else{u.pw=pwr;u.role='owner'}
  store.writeJSON(store.p('accounts.json'),accounts);store.writeJSON(store.p('owner.json'),{ownerUid:u.id,name:u.name,set:new Date().toISOString()});store.audit({ev:'owner-set',name});
  console.log('Owner account "'+name+'" is configured. Only this account (signed in with its password) can use creator tools.');return}
 if(cmd=='show-owner'){const o=store.readJSON(store.p('owner.json'),null);console.log(o?'Owner: '+o.name+' ('+o.ownerUid+')':'No owner configured');return}
 console.log('Commands:\n  node server/cli.js set-owner <AccountName>   create/claim the single owner account\n  node server/cli.js show-owner')})();
