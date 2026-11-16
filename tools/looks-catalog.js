#!/usr/bin/env node
// Makes every looks-only item exclusive: not sold any more, earned by playing (master update 2). Run once; it rewrites server/catalog.json and
// docs/master-update-2/cosmetic-sources.md (the list of every cosmetic and how it is earned). Safe to run again: items already converted keep their rule.
//   wings, effects, charms (companions), pets and pet clothes, store cosmetics, and the weather machines that only change the sky.
// Kept in the store: blocks, seeds, objects, pet care (home, food, treats) and Neon Rain (it waters crops). Rare finds from breaking stay "drop".
// Each item gets one metric the game already tracks and a goal by its rarity (rarer = more). The metric is chosen per family so sources feel themed,
// and spread by a stable hash of the id so neighbours differ.
'use strict';
const fs=require('fs'),path=require('path');const R=path.resolve(__dirname,'..');const F=path.join(R,'server/catalog.json');
const cat=JSON.parse(fs.readFileSync(F,'utf8'));const items=cat.items||cat;
const TIER={common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5,exclusive:5,relic:5};
// metric -> goals by tier, and how to say it
const M={lv:{g:[5,12,20,30,45,60],t:n=>'Reach level '+n},kill:{g:[50,200,600,1500,4000,9000],t:n=>'Defeat '+n.toLocaleString('en')+' monsters'},
 brk:{g:[300,1500,5000,12000,30000,60000],t:n=>'Break '+n.toLocaleString('en')+' blocks'},place:{g:[200,1000,4000,10000,25000,50000],t:n=>'Place '+n.toLocaleString('en')+' blocks'},
 fish:{g:[10,40,120,300,700,1500],t:n=>'Catch '+n.toLocaleString('en')+' fish'},harvest:{g:[20,80,250,600,1500,3000],t:n=>'Harvest '+n.toLocaleString('en')+' crops'},
 boss:{g:[1,3,8,20,45,90],t:n=>'Defeat '+n+' boss'+(n>1?'es':'')},worlds:{g:[2,4,7,10,14,20],t:n=>'Visit '+n+' worlds'},
 dg:{g:[1,2,3,4,6,8],t:n=>'Clear '+n+' different dungeon'+(n>1?'s':'')},wb:{g:[1,1,2,3,4,5],t:n=>'Defeat '+n+' world boss'+(n>1?'es':'')},
 ach:{g:[3,5,7,9,11,13],t:n=>'Unlock '+n+' achievements'},cls:{g:[1,2,3,5,8,13],t:n=>'Learn '+n+' class'+(n>1?'es':'')}};
// themed metrics per family (and per effect kind)
const FAM={wings:['lv','boss','wb','dg','worlds'],charms:['fish','harvest','cls','ach'],pets:['harvest','fish','ach','place'],weather:['worlds','ach','lv'],
 cosmetics:['kill','dg','place','worlds','fish','boss','harvest'],
 fx:{aura:['kill','boss'],trail:['worlds','lv'],spawn:['dg','ach'],victory:['boss','wb'],wtrail:['wb','dg'],wskin:['wb','lv'],break:['brk','place']}};
const CARE=new Set(['pet_home','pet_food','pet_treat']);
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const looks=it=>{if(it.sale===0&&it.how!=='store')return false;if(['wings','effects','charms','cosmetics'].includes(it.cat))return it.how!=='drop';if(it.cat=='pets')return !CARE.has(it.id);if(it.cat=='weather')return it.id!=='obj_88';return false};
let n=0;const rows=[];
for(const it of items){if(it.earn&&it.earn.m&&it.sale===0){rows.push(it);continue}if(!looks(it))continue;
 const list=it.cat=='effects'?(FAM.fx[it.sub]||['kill','worlds']):it.cat=='cosmetics'&&it.set?FAM.cosmetics:(FAM[it.cat]||['lv']);
 // cosmetic sets share one theme each (a set's pieces are earned the same way); others spread by id
 const key=it.cat=='cosmetics'&&it.set?it.set:it.id,m=list[hash(key)%list.length],t=TIER[it.rar]!=null?TIER[it.rar]:1,goal=M[m].g[t];
 it.sale=0;it.how='earn';it.earn={m,n:goal,t:M[m].t(goal)};delete it.feat;n++;rows.push(it)}
fs.writeFileSync(F,JSON.stringify(cat,null,1)+'\n');
// the source list
const byCat={};for(const it of items){if(!(it.how==='earn'&&it.earn&&it.earn.m)&&!(it.cat=='cosmetics'&&it.how==='drop'))continue;(byCat[it.cat]=byCat[it.cat]||[]).push(it)}
const NAMES={wings:'Wings',effects:'Effects',charms:'Companions (charms)',pets:'Pets and pet clothes',cosmetics:'Cosmetics',weather:'Weather machines (sky only)'};
let md='# Where every cosmetic comes from\n\nWritten by `tools/looks-catalog.js` from `server/catalog.json`. Since master update 2, no cosmetic is sold in the store: each one is **exclusive**, earned by playing (or, for the rare finds, found by breaking natural blocks). Everything a player already owned stays owned.\n\nThe game checks your progress every few seconds and grants an item the moment its goal is met; online, the server records it on your account. Goals rise with rarity.\n\n';
for(const c of ['cosmetics','wings','effects','charms','pets','weather']){const l=byCat[c];if(!l)continue;md+='## '+NAMES[c]+' ('+l.length+')\n\n| Item | Rarity | How to get it |\n|---|---|---|\n';
 for(const it of l.sort((a,b)=>(TIER[a.rar]||0)-(TIER[b.rar]||0)||a.n.localeCompare(b.n)))md+='| '+it.n+' | '+it.rar+' | '+(it.how==='drop'?'Rare find: breaking natural blocks':it.earn.t)+' |\n';md+='\n'}
md+='Kept in the store (useful, not looks): blocks, seeds, objects, pet care (home, food, treats) and Neon Rain, which waters crops.\n';
fs.mkdirSync(path.join(R,'docs/master-update-2'),{recursive:true});fs.writeFileSync(path.join(R,'docs/master-update-2/cosmetic-sources.md'),md);
console.log('converted',n,'items; listed',Object.values(byCat).reduce((s,l)=>s+l.length,0));
