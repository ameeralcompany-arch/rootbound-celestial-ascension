'use strict';
// Chat words that get masked for everyone, whatever client sent them. Short and aimed at abuse, so ordinary chat is never touched. Look-alike letters are read through, and letters in
// other words stay put (matches are whole words, plus the usual suffixes).
const LOOK={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','!':'i'};
const ROOTS=['fuck','shit','bitch','asshole','cunt','nigger','nigga','faggot','fag','retard','kys','whore','slut','rape','rapist'];
const WORD=/[^\s]+/g,RE=new RegExp('^('+ROOTS.join('|')+')(s|es|ed|er|ers|ing|in|y)?$');
function cleanText(t){return String(t).replace(WORD,w=>{const n=w.toLowerCase().replace(/[01345 7@$!]/g,c=>LOOK[c]||c).replace(/[^a-z]/g,'').replace(/(.)\1{2,}/g,'$1$1');return RE.test(n)?'*'.repeat(Math.min(8,w.length)):w})}
module.exports={cleanText};
