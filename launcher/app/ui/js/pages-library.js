// Game Library: Rootbound's card, with everything about the installation.
'use strict';
(() => {
  const { $, esc } = RB;
  const t = (...a) => RB.t(...a);
  RB.pages.library = {
    render(view) {
      const S = RB.state, st = S.status, P = S.profile, p = RB.primary();
      const status = S.game.running ? `<span class="chip live"><i class="pulse"></i>${esc(t('running'))}</span>` : !st ? '' : st.action === 'play' ? `<span class="chip ok">${esc(t('upToDate'))}</span>` : st.action === 'update' ? `<span class="chip live">${esc(t('available'))}</span>` : st.action === 'repair' ? `<span class="chip bad">${esc(t('broken'))}</span>` : `<span class="chip">${esc(t('notInstalled'))}</span>`;
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('library'))}</h1><span class="jp">${RB.JP.library}</span></div>
      <div class="lib glass edge">
        <div class="pic"><img src="${RB.full('tree')}" alt=""><img class="lg" src="art/logo.png" alt="ROOTBOUND"></div>
        <div class="info">
          <div class="btnrow" style="justify-content:space-between"><h2 class="s" style="font-size:20px">Rootbound</h2>${status}</div>
          <div class="facts">
            <div class="fact"><small>${esc(t('currentVersion'))}</small><b>${esc(st && st.version || '–')}</b></div>
            <div class="fact"><small>${esc(t('latestVersion'))}</small><b>${esc(st && st.latest ? st.latest.version : '–')}</b></div>
            <div class="fact"><small>${esc(t('totalSize'))}</small><b>${st && st.size ? esc(RB.bytes(st.size)) : '–'}</b></div>
            <div class="fact"><small>${esc(t('lastPlayed'))}</small><b>${P.available && P.lastSession ? esc(RB.ago(P.lastSession.endedAt)) : esc(t('neverPlayed'))}</b></div>
            <div class="fact"><small>${esc(t('playtime'))}</small><b>${P.available ? esc(RB.span(P.playSeconds)) : '–'}</b></div>
            <div class="fact"><small>${esc(t('previousVersion'))}</small><b>${st && st.previous ? esc(st.previous.version) : esc(t('noPrev'))}</b></div>
          </div>
          <small class="muted">${esc(t('installLoc'))}</small>
          <div class="pathrow"><code title="${esc(st && st.dir)}">${esc(st && st.dir)}</code><button class="btn icon-btn" data-do="openFolder" title="${esc(t('openFolder'))}" aria-label="${esc(t('openFolder'))}">${RB.I.folder}</button><button class="btn" style="height:34px" data-do="moveDir">${esc(t('change'))}</button></div>
          <div id="libAct" class="btnrow">
            <button class="btn p" id="libPrimary" ${p.disabled ? 'disabled' : ''} data-act="${esc(p.act || '')}">${p.icon || ''}${esc(p.label)}</button>
            <button class="btn" data-do="verify" ${!st || !st.installed ? 'disabled' : ''}>${RB.I.shield}${esc(t('verify'))}</button>
            <button class="btn" data-act="repair" ${!st || !st.installed || S.game.running ? 'disabled' : ''}>${esc(t('repair'))}</button>
            <button class="btn" data-act="check">${RB.I.refresh}${esc(t('check'))}</button>
            ${st && st.previous ? `<button class="btn" data-do="restore">${esc(t('restorePrev', { v: st.previous.version }))}</button>` : ''}
            ${S.app.installed ? `<button class="btn danger" data-do="uninstall">${esc(t('uninstall'))}</button>` : ''}
          </div>
          <div class="muted small" style="margin-top:14px" id="libNote">${S.saves && S.saves.dir ? esc(t('savesSafe', { dir: S.saves.dir })) : ''}</div>
        </div>
      </div>`;
    },
    onChange(what, view) {
      if (['status', 'game', 'queue', 'profile'].includes(what)) this.render(view);
      if (what === 'task') { const b = $('#libPrimary', view), p = RB.primary(); if (b) { b.lastChild.textContent = p.label; } }
      if (what === 'verify') { const n = $('#libNote', view), d = RB.verifyProgress; if (n && d) n.textContent = (d.moving ? t('moving') : t('verifying')) + ' ' + Math.floor(d.done / Math.max(1, d.total) * 100) + '%'; }
    },
    async click(e, view) {
      const b = e.target.closest('[data-do]');
      if (!b) return false;
      const what = b.dataset.do;
      if (what === 'openFolder') RB.call('game.openFolder');
      if (what === 'uninstall') RB.call('launcher.uninstall');
      if (what === 'verify') await RB.verifyFlow(view);
      if (what === 'moveDir') await RB.moveFlow();
      if (what === 'restore') {
        const r = await RB.call('game.restorePrevious');
        if (r.ok) RB.toast(t('kind_restore'), t('version') + ' ' + r.version, 'ok'); else RB.toast(t('failed'), r.message, 'bad');
        this.render(view);
      }
      return true;
    },
  };
  RB.verifyFlow = async view => {
    const r = await RB.call('game.verify');
    const note = view && $('#libNote', view);
    if (note) note.textContent = '';
    if (r.ok) { RB.toast(t('verifyOk'), r.version ? t('version') + ' ' + r.version : '', 'ok'); return r; }
    if (r.busy) return r;
    const a = await RB.dialog({ title: r.manifestProblem ? t('needsRepairT') : t('verifyBad', { n: (r.bad || []).length }), html: `<div class="notes small">${r.manifestProblem ? esc(t('needsRepairB')) : (r.bad || []).slice(0, 12).map(b => esc(b.path)).join('\n')}</div>`, buttons: [{ label: t('cancel'), act: null }, { label: t('repairNow'), act: 'repair', primary: true }] });
    if (a === 'repair') RB.act('repair');
    return r;
  };
  RB.moveFlow = async () => {
    const dir = await RB.call('game.pickDir');
    if (!dir) return;
    const r = await RB.call('game.moveDir', { dir });
    if (r.ok) { RB.toast(t('done'), t('moved', { dir: r.dir }), 'ok'); RB.state.settings.game.installDir = r.dir; RB.emit('status'); } else RB.toast(t('failed'), r.message, 'bad');
    return r;
  };
})();
