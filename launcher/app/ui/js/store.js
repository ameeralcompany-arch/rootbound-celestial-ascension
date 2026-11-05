// What the page knows. A small store: the main process sends events, the store keeps the newest state and tells the app what changed.
'use strict';
RB.state = { mode: 'launcher', settings: null, status: null, queue: { current: null, queued: [], history: [] }, profile: { available: false }, news: { feed: null }, game: { running: false }, app: {}, launcherUpdate: {}, saves: {}, task: null, server: null };
RB.call = (name, arg) => window.rb.call(name, arg);

RB.listeners = new Set();
RB.subscribe = fn => { RB.listeners.add(fn); return () => RB.listeners.delete(fn); };
RB.emit = what => { for (const fn of RB.listeners) { try { fn(what); } catch (e) { console.error(e); } } };

RB.loadState = async () => {
  const s = await RB.call('state.get');
  Object.assign(RB.state, s);
  RB.state.task = s.queue.current;
  return RB.state;
};

window.rb.on(({ type, data }) => {
  const S = RB.state;
  if (type === 'status') { S.status = data; RB.emit('status'); }
  else if (type === 'task') { S.task = data; S.queue.current = data; RB.emit('task'); }
  else if (type === 'queue') { S.queue = data; S.task = data.current; RB.emit('queue'); }
  else if (type === 'news') { S.news = data; RB.emit('news'); }
  else if (type === 'profile') { S.profile = data; RB.emit('profile'); }
  else if (type === 'game') { S.game = data; RB.emit('game'); }
  else if (type === 'launcherUpdate') { S.launcherUpdate = data; RB.emit('launcherUpdate'); }
  else if (type === 'gameEnded') { RB.emit('game'); if (data.crashed) RB.onGameCrashed && RB.onGameCrashed(data); }
  else if (type === 'verify') { RB.verifyProgress = data; RB.emit('verify'); }
  else if (type === 'setup') { RB.setupEvent = data; RB.emit('setup'); }
  else if (type === 'window') {
    if (typeof data.hidden === 'boolean') RB.fx.setVisible(!data.hidden);
    if (typeof data.focused === 'boolean') {
      // "efficient background": when the launcher is behind other windows nothing moves
      const eff = S.settings && S.settings.performance.efficientBackground;
      RB.fx.setVisible(eff ? data.focused : true);
    }
  }
});

// The one question every page asks: what should the big button do right now?
RB.primary = () => {
  const { status: st, game, task } = RB.state, t = RB.t;
  if (!st) return { label: t('checking'), act: null, disabled: true };
  if (game.running) return { label: t('playing'), act: null, disabled: true, icon: RB.I.play };
  if (task && !['done', 'failed', 'canceled'].includes(task.phase)) return { busy: true, label: t(task.paused ? 'phase_paused' : 'phase_' + task.phase), act: null, disabled: true };
  if (st.action === 'repair') return { label: t('repair'), act: 'repair', icon: RB.I.shield };
  if (st.action === 'install') {
    if (!st.latest) return st.checkError ? { label: t('retry'), act: 'check', icon: RB.I.refresh } : { label: t('checking'), act: null, disabled: true };
    return { label: st.canResume ? t('resume') : t('install'), act: 'install', icon: RB.I.updates, sub: st.latest.downloadSize ? t('fullSize', { size: RB.bytes(st.latest.downloadSize) }) : '' };
  }
  if (st.action === 'update') return { label: st.canResume ? t('resume') : t('update'), act: 'update', icon: RB.I.updates, sub: RB.updateSizeText(st) };
  return { label: t('play'), act: 'play', icon: RB.I.play };
};
RB.updateSizeText = st => {
  const l = st.latest; if (!l) return '';
  if (l.fromVersion && l.fromVersion === st.version && Number.isFinite(l.deltaBytes)) return RB.t('updateSizeAbout', { size: RB.bytes(l.deltaBytes) });
  return l.downloadSize ? RB.t('updateSizeAbout', { size: RB.bytes(l.downloadSize) }) : '';
};

RB.act = async (act, arg) => {
  const t = RB.t;
  if (act === 'play') return RB.play(arg || {});
  if (act === 'check') { RB.state.checkingNow = true; RB.emit('status'); const s = await RB.call('updates.check'); RB.state.checkingNow = false; RB.state.status = s; RB.emit('status'); if (s.checkError) RB.toast(t('offline'), s.checkError.message, 'bad'); else if (s.action === 'play') RB.toast(t('upToDate'), t('version') + ' ' + s.version, 'ok'); return s; }
  if (act === 'install' || act === 'update' || act === 'repair') { await RB.call('task.start', { kind: act }); return; }
  if (act === 'pause') return RB.call('task.pause');
  if (act === 'resume') return RB.call('task.resume');
  if (act === 'cancel') return RB.call('task.cancel', {});
};

RB.play = async quick => {
  const t = RB.t, S = RB.state;
  const fx = S.settings.launcher.launchAnimation && S.settings.performance.smoothAnimations;
  const close = fx ? RB.fx.launch(t('launching')) : () => {};
  let r;
  try { r = await RB.call('game.play', quick); } catch (e) { r = { ok: false, message: e.message }; }
  close();
  if (r.ok) return r;
  if (r.code === 'NEEDS_REPAIR') { const a = await RB.dialog({ title: t('needsRepairT'), body: t('needsRepairB'), buttons: [{ label: t('cancel'), act: null }, { label: t('repairNow'), act: 'repair', primary: true }] }); if (a === 'repair') RB.act('repair'); }
  else if (r.code === 'ALREADY_RUNNING') RB.toast(t('alreadyRunning'));
  else if (r.code === 'NOT_INSTALLED') RB.toast(t('notInstalledMsg'));
  else RB.toast(t('startFailed'), r.message, 'bad');
  return r;
};

RB.errorText = e => {
  const t = RB.t;
  if (!e) return t('updateFailedB');
  if (e.code === 'BOOT_TEST_FAILED') return t('bootFailB');
  if (e.code === 'BAD_SIGNATURE' || e.code === 'BAD_MANIFEST' || e.code === 'REPLAY') return t('badSigB');
  if (e.code === 'NO_SPACE') return t('noSpaceB');
  if (e.code === 'NOTHING_PUBLISHED') return t('noPublish');
  return t('updateFailedB');
};
