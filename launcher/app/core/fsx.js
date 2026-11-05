// Electron makes the ordinary fs module treat .asar files as folders. The launcher handles .asar files as plain files (the game's own, and its own update package),
// so everything here uses the real file system. Under plain Node (tests, publishing tools) original-fs doesn't exist and fs is already the real thing.
'use strict';
let fs;
try { fs = require('original-fs'); } catch (_) { fs = require('fs'); }
module.exports = fs;
