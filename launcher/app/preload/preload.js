// The only door between the page and the launcher. The page gets named calls and an event stream; it has no Node, no files and no network of its own.
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const CALLS = new Set([
  'state.get', 'ui.ready', 'settings.set', 'game.play', 'updates.check', 'updates.unblock', 'task.start', 'task.pause', 'task.resume', 'task.cancel', 'game.verify', 'game.restorePrevious', 'game.openFolder', 'game.openLog', 'launcher.openLog',
  'game.pickDir', 'game.moveDir', 'server.status', 'news.refresh', 'profile.get', 'launcher.restart', 'launcher.uninstall', 'window.minimize', 'window.toggleMax', 'window.close', 'shell.open', 'system.memory',
  'setup.info', 'setup.free', 'setup.pickDir', 'setup.install', 'setup.downloadGame', 'setup.repair', 'setup.finish', 'setup.quit', 'uninstall.info', 'uninstall.run',
]);

contextBridge.exposeInMainWorld('rb', {
  call: (name, arg) => CALLS.has(name) ? ipcRenderer.invoke(name, arg) : Promise.reject(new Error('Unknown call ' + name)),
  on: fn => { const h = (_e, m) => fn(m); ipcRenderer.on('rb:event', h); return () => ipcRenderer.removeListener('rb:event', h); },
});
