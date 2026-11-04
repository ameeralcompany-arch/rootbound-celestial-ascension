'use strict';
// Chat words that get masked for everyone, whatever client sent them. Short and aimed at abuse, so ordinary chat is never touched. Look-alike letters are read through, and letters in
// other words stay put (matches are whole words, plus the usual suffixes).
const LOOK={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s'};
const WORD=/[^\s]+/g,RE=/^(?:fuck(?:s|ed|er|ers|ing|in|y)?|shit(?:s|ty|ting)?|bitch(?:es|ing|y)?|assholes?|cunts?|niggers?|niggas?|faggots?|fags?|retards?|retarded|kys|whores?|sluts?|rapes?|raped|raping|rapists?)$/;
function cleanText(t){return String(t).replace(WORD,w=>{const low=w.toLowerCase().replace(/^[^a-z0-9@$]+/,'').replace(/[^a-z0-9]+$/,''),n=low.replace(/[013457@$]/g,c=>LOOK[c]||c).replace(/[^a-z]/g,'');return RE.test(n)||RE.test(n.replace(/(.)\1{2,}/g,'$1$1'))||RE.test(n.replace(/(.)\1+/g,'$1'))?'*'.repeat(Math.min(8,w.length)):w})}
module.exports={cleanText};
