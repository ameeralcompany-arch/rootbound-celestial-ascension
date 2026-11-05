// The shell: sidebar, routing, and one click handler for the whole page.
'use strict';
(() => {
  const { $, esc } = RB;
  const t = (...a) => RB.t(...a);
  const NAV = ['home', 'library', 'news', 'events', 'updates', 'settings', 'community'];
  RB.current = 'home';

  function sideHtml() {
    const S = RB.state, P = S.profile, st = S.status;
    const hasUpdate = st && st.action === 'update' || (S.launcherUpdate && S.launcherUpdate.ready);
    return `<aside id="side">
      <div class="winbar drag"><button class="winbtn x" data-win="close" aria-label="${esc(t('close'))}" title="${esc(t('close'))}">${RB.I.close}</button><button class="winbtn" data-win="minimize" aria-label="${esc(t('minimize'))}" title="${esc(t('minimize'))}">${RB.I.minimize}</button><button class="winbtn" data-win="toggleMax" aria-label="${esc(t('maximize'))}" title="${esc(t('maximize'))}">${RB.I.maximize}</button></div>
      <button class="brand" data-nav="home" aria-label="Rootbound"><img src="art/logo.png" alt="ROOTBOUND"><small>ルートバウンド</small></button>
      <nav>${NAV.map(n => `<button class="nav ${RB.current === n ? 'on' : ''}" data-nav="${n}">${RB.I[n]}<span>${esc(t(n))}</span>${n === 'updates' && hasUpdate ? '<i class="dot"></i>' : ''}<span class="jp">${RB.JP[n]}</span></button>`).join('')}</nav>
      <div class="side-gap"></div>
      <div id="miniDl"></div>
      <button class="me ${RB.current === 'profile' ? 'on' : ''}" data-nav="profile">${RB.avatar(P.available ? P : null)}<span style="min-width:0"><b>${esc(P.available && P.name ? P.name : t('profile'))}</b><small>${P.available && P.level ? esc(t('level')) + ' ' + esc(P.level) : esc(t('neverPlayed'))}</small></span></button>
    </aside>`;
  }

  function paintMini() {
    const box = $('#miniDl'), task = RB.state.task;
    if (!box) return;
    if (!task || ['done', 'failed', 'canceled'].includes(task.phase)) { box.innerHTML = ''; return; }
    if (!box.firstChild) box.innerHTML = `<button class="mini-dl" data-nav="updates" data-tab="downloads"><b data-m="t"></b><div class="bar" data-b="bar" style="height:4px;margin:6px 0 4px"><i data-b="fill"></i></div><small data-m="s" class="num"></small></button>`;
    const d = task.download;
    $('[data-m=t]', box).textContent = t(task.paused ? 'phase_paused' : 'phase_' + task.phase);
    const pct = task.phase === 'downloading' && d ? d.percent : task.phasePercent;
    $('[data-b=fill]', box).style.transform = 'scaleX(' + Math.min(1, (pct || 0) / 100) + ')';
    $('[data-m=s]', box).textContent = d && task.phase === 'downloading' ? Math.floor(pct) + '%' + (d.speed > 0 ? ' · ' + t('perSec', { s: RB.bytes(d.speed) }) : '') : Math.floor(pct || 0) + '%';
  }

  RB.renderShell = () => {
    $('#root').innerHTML = `<div id="shell">${sideHtml()}<main id="main"><div id="topdrag" class="drag"></div><div id="page"></div></main></div>`;
    RB.show(RB.current);
    paintMini();
  };

  RB.show = (name, opts = {}) => {
    const leaving = RB.pages[RB.current];
    if (leaving && leaving.leave) leaving.leave();
    RB.current = RB.pages[name] ? name : 'home';
    const side = $('#side');
    if (side) side.outerHTML = sideHtml();
    paintMini();
    const page = $('#page'), p = RB.pages[RB.current];
    if (opts.tab && p.setTab) p.setTab(opts.tab);
    if (p.enter) p.enter();
    const view = document.createElement('div');
    view.className = 'view'; view.id = 'view-' + RB.current;
    page.replaceChildren(view);
    page.scrollTop = 0;
    p.render(view);
  };

  RB.subscribe(what => {
    const p = RB.pages[RB.current], view = RB.$('#view-' + RB.current);
    if (['status', 'profile', 'launcherUpdate', 'game'].includes(what)) { const side = $('#side'); if (side) { side.outerHTML = sideHtml(); paintMini(); } }
    if (what === 'task' || what === 'queue') paintMini();
    if (p && p.onChange && view) p.onChange(what, view);
    const h = what === 'queue' && RB.state.queue.history[0], hk = h && h.at + h.kind + h.result;
    if (h && hk !== RB.lastHistKey) {
      RB.lastHistKey = hk;
      if (h.result === 'failed') RB.toast(t('updateFailedT'), RB.errorText({ code: h.code }), 'bad');
      else if (h.result === 'done' && h.kind !== 'recovery') RB.toast(t('kind_' + h.kind) + (h.version ? ' ' + h.version : ''), t('ready'), 'ok');
    }
  });

  RB.onGameCrashed = async () => {
    const a = await RB.dialog({ title: t('gameCrashedT'), body: t('gameCrashedB'), buttons: [{ label: t('ok'), act: null }, { label: t('verify'), act: 'verify', primary: true }] });
    if (a === 'verify') { RB.show('library'); RB.verifyFlow(RB.$('#view-library')); }
  };

  document.addEventListener('click', async e => {
    if (RB.state.mode !== 'launcher') return;
    const win = e.target.closest('[data-win]');
    if (win) { RB.call('window.' + win.dataset.win); return; }
    const nav = e.target.closest('[data-nav]');
    if (nav) { RB.show(nav.dataset.nav, { tab: nav.dataset.tab }); return; }
    const qw = e.target.closest('[data-quick-world]');
    if (qw) { if (RB.primary().act === 'play') RB.play({ world: qw.dataset.quickWorld }); return; }
    const qd = e.target.closest('[data-quick-dungeon]');
    if (qd) { if (RB.primary().act === 'play') RB.play({ dungeon: qd.dataset.quickDungeon }); return; }
    const n = e.target.closest('[data-news]');
    if (n) { RB.openNews(n.dataset.news); return; }
    const view = RB.$('#view-' + RB.current), p = RB.pages[RB.current];
    if (p && p.click && await p.click(e, view)) return;
    const a = e.target.closest('[data-act]');
    if (a && a.dataset.act && !a.disabled) RB.act(a.dataset.act);
  });
  document.addEventListener('change', e => {
    const view = RB.$('#view-' + RB.current), p = RB.pages[RB.current];
    if (p && p.change) p.change(e, view);
  });
  document.addEventListener('keydown', e => {
    // Ctrl+1..7 move between pages
    if (e.ctrlKey && /^[1-7]$/.test(e.key)) { RB.show(NAV[+e.key - 1]); e.preventDefault(); }
  });

  (async () => {
    const mode = new URLSearchParams(location.search).get('mode') || 'launcher';
    await RB.loadState();
    RB.state.mode = mode;
    { const h = RB.state.queue.history[0]; RB.lastHistKey = h ? h.at + h.kind + h.result : null; }
    RB.applyVisualSettings();
    const L = RB.state.settings.launcher, smooth = RB.state.settings.performance.smoothAnimations;
    if (mode === 'install') { await RB.renderSetup(); RB.fx.sky(); RB.$('#intro').remove(); }
    else if (mode === 'uninstall') { await RB.renderUninstall(); RB.$('#intro').remove(); }
    else {
      RB.renderShell();
      RB.fx.sky();
      if (L.intro && smooth && !RB.state.settings.performance.lowMemory && !RB.state.introDone) await RB.fx.intro(L.introSound);
      else RB.$('#intro').remove();
    }
    window.__rbReady = true;
    await RB.call('ui.ready');
  })().catch(e => { console.error(e); document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;inset:20px;color:#fff">The launcher page failed to load: ' + RB.esc(e.message) + '</div>'); });
})();
