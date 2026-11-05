// Settings. Every control here writes to the launcher's settings file through the main process, and takes effect at once or says it needs a restart.
'use strict';
(() => {
  const { $, esc } = RB;
  const t = (...a) => RB.t(...a);
  let sec = 'game';
  const row = (label, sub, control) => `<div class="setrow"><div class="lbl"><b>${esc(label)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>${control}</div>`;
  const toggle = (section, key) => { const on = RB.state.settings[section][key]; return `<button class="tog" role="switch" aria-checked="${on}" data-set="${section}.${key}" data-type="bool" aria-label="${section}.${key}"></button>`; };
  const select = (section, key, options) => { const v = RB.state.settings[section][key]; return `<select data-set="${section}.${key}" aria-label="${section}.${key}">${options.map(([val, lbl]) => `<option value="${esc(val)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(lbl)}</option>`).join('')}</select>`; };

  const RES = [[1280, 720], [1366, 768], [1600, 900], [1920, 1080], [2560, 1440], [3840, 2160]];
  const BW = [0, 250, 500, 1000, 2000, 5000, 10000, 25000, 50000];
  const bwLabel = k => !k ? t('noLimit') : k >= 1000 ? (k / 1000) + ' MB/s' : k + ' KB/s';

  const SECTIONS = {
    game() {
      const S = RB.state, scr = S.app.screen || {};
      const resList = RES.filter(([w, h]) => !scr.width || (w <= scr.width && h <= scr.height));
      const resNow = S.settings.game.resolution;
      if (resNow !== 'auto' && !resList.some(([w, h]) => w + 'x' + h === resNow)) resList.push(resNow.split('x').map(Number));
      return row(t('installDir'), t('installDirSub'), `<button class="btn" data-do="moveDir">${RB.I.folder}${esc(t('change'))}</button>`) +
        `<div class="pathrow" style="margin:0 0 6px"><code>${esc(S.status && S.status.dir)}</code></div>` +
        row(t('displayMode'), t('displayModeSub'), select('game', 'displayMode', [['fullscreen', t('fullscreen')], ['borderless', t('borderless')], ['windowed', t('windowed')]])) +
        row(t('resolution'), t('resolutionSub'), select('game', 'resolution', [['auto', t('resAuto')], ...resList.map(([w, h]) => [w + 'x' + h, w + ' × ' + h])])) +
        row(t('quality'), t('qualitySub'), select('game', 'quality', [['game', t('qGame')], ['auto', t('qAuto')], ['potato', t('qPotato')], ['low', t('qLow')], ['med', t('qMed')], ['high', t('qHigh')], ['ultra', t('qUltra')], ['cine', t('qCine')]])) +
        row(t('launchArgs'), t('launchArgsSub'), `<input type="text" spellcheck="false" data-set="game.launchArgs" data-type="text" value="${esc(S.settings.game.launchArgs)}" aria-label="launch arguments">`);
    },
    launcher() {
      const L = RB.state.settings.launcher;
      const themes = [['midnight', t('themeMidnight'), 'linear-gradient(140deg,#0a0c2c,#1b2a8c 60%,#5a2cc0)'], ['violet', t('themeViolet'), 'linear-gradient(140deg,#150a34,#3a1c9c 60%,#8a2cbc)'], ['ocean', t('themeOcean'), 'linear-gradient(140deg,#061b30,#0c4d8c 60%,#0fb0b8)']];
      return row(t('language'), '', select('launcher', 'language', [['auto', t('langAuto')], ...Object.entries(RB.LANGS)])) +
        row(t('theme'), '', `<div class="swatches">${themes.map(([id, lbl, bg]) => `<button class="swatch ${L.theme === id ? 'on' : ''}" data-theme="${id}" style="background:${bg}">${esc(lbl)}</button>`).join('')}</div>`) +
        row(t('startWin'), t('startWinSub'), toggle('launcher', 'startWithWindows')) +
        row(t('toTray'), t('toTraySub'), toggle('launcher', 'minimizeToTray')) +
        row(t('closeAfter'), t('closeAfterSub'), toggle('launcher', 'closeAfterStart')) +
        row(t('autoCheck'), t('autoCheckSub'), toggle('launcher', 'autoCheck')) +
        row(t('autoDl'), t('autoDlSub'), toggle('launcher', 'autoDownload')) +
        row(t('bandwidth'), t('bandwidthSub'), select('launcher', 'bandwidthKBps', BW.map(k => [k, bwLabel(k)]))) +
        row(t('notifs'), t('notifsSub'), toggle('launcher', 'notifications')) +
        row(t('intro'), t('introSub'), toggle('launcher', 'intro')) +
        row(t('introSound'), t('introSoundSub'), toggle('launcher', 'introSound')) +
        row(t('launchAnim'), t('launchAnimSub'), toggle('launcher', 'launchAnimation'));
    },
    performance() {
      return row(t('hwAccel'), t('hwAccelSub'), toggle('performance', 'hardwareAcceleration')) +
        row(t('efficient'), t('efficientSub'), toggle('performance', 'efficientBackground')) +
        row(t('smooth'), t('smoothSub'), toggle('performance', 'smoothAnimations')) +
        row(t('lowMem'), t('lowMemSub'), toggle('performance', 'lowMemory'));
    },
    about() {
      const S = RB.state, ver = S.app.version + (S.app.updated ? '' : '');
      return `<div class="facts" style="margin-top:4px">
        <div class="fact"><small>${esc(t('aboutVersion'))}</small><b>${esc(ver)}</b></div>
        <div class="fact"><small>${esc(t('aboutGame'))}</small><b>${esc(S.status && S.status.version || '–')}</b></div></div>` +
        row(t('aboutServer'), S.app.channelUrl, '') + row(t('aboutData'), S.app.userData, '') + row(t('aboutSaves'), S.saves.dir, '') +
        `<div class="btnrow" style="margin-top:10px"><button class="btn" data-do="launcherLog">${esc(t('openLauncherLog'))}</button><button class="btn" data-do="gameLog">${esc(t('openGameLog'))}</button>${S.app.links && S.app.links.project ? `<button class="btn" data-link="${esc(S.app.links.project)}">${RB.I.link}${esc(t('viewProject'))}</button>` : ''}</div>`;
    },
  };

  RB.applyVisualSettings = () => {
    const s = RB.state.settings, h = document.documentElement;
    h.dataset.theme = s.launcher.theme;
    h.dataset.motion = s.performance.smoothAnimations ? 'on' : 'off';
    h.toggleAttribute('data-lowmem', s.performance.lowMemory);
    RB.fx.setEnabled(s.performance.smoothAnimations && !s.performance.lowMemory);
    const lang = s.launcher.language === 'auto' ? String(RB.state.app.locale || 'en').slice(0, 2) : s.launcher.language;
    RB.setLang(lang);
  };

  async function change(key, value, view, page) {
    const [section, name] = key.split('.');
    const r = await RB.call('settings.set', { section, key: name, value });
    if (!r.ok) { RB.toast(t('failed'), r.error, 'bad'); return; }
    RB.state.settings = r.settings;
    RB.applyVisualSettings();
    if (key === 'launcher.language') { RB.renderShell(); return; }
    page.render(view);
    if (r.needsRestart) {
      const a = await RB.dialog({ title: t('needsRestart'), buttons: [{ label: t('cancel'), act: null }, { label: t('restartNow'), act: 'restart', primary: true }] });
      if (a === 'restart') RB.call('launcher.restart');
    }
  }

  RB.pages.settings = {
    render(view) {
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('settings'))}</h1><span class="jp">${RB.JP.settings}</span></div>
      <div class="setgrid"><div class="setnav glass">${[['game', t('s_game')], ['launcher', t('s_launcher')], ['performance', t('s_perf')], ['about', t('s_about')]].map(([k, l]) => `<button data-sec="${k}" class="${sec === k ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>
      <div class="glass edge pad">${SECTIONS[sec]()}</div></div>`;
      RB.fx.setSky('sea');
    },
    onChange() {},
    click(e, view) {
      const s = e.target.closest('[data-sec]');
      if (s) { sec = s.dataset.sec; this.render(view); return true; }
      const tg = e.target.closest('.tog[data-set]');
      if (tg) { change(tg.dataset.set, tg.getAttribute('aria-checked') !== 'true', view, this); return true; }
      const th = e.target.closest('button[data-theme]');
      if (th) { change('launcher.theme', th.dataset.theme, view, this); return true; }
      const d = e.target.closest('[data-do]');
      if (d && d.dataset.do === 'moveDir') { RB.moveFlow().then(() => this.render(view)); return true; }
      if (d && d.dataset.do === 'launcherLog') { RB.call('launcher.openLog'); return true; }
      if (d && d.dataset.do === 'gameLog') { RB.call('game.openLog'); return true; }
      const l = e.target.closest('[data-link]');
      if (l) { RB.call('shell.open', { url: l.dataset.link }); return true; }
      return false;
    },
    change(e, view) {
      const el = e.target.closest('[data-set]');
      if (!el) return;
      const key = el.dataset.set;
      let v = el.value;
      if (key === 'launcher.bandwidthKBps') v = parseInt(v, 10);
      change(key, v, view, this);
    },
  };
})();
