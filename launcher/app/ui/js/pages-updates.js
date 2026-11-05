// Updates and the Download Center.
'use strict';
(() => {
  const { $, esc } = RB;
  const t = (...a) => RB.t(...a);
  let tab = 'updates';
  RB.pages.updates = {
    setTab(x) { tab = x; },
    render(view) {
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('updates'))}</h1><span class="jp">${RB.JP.updates}</span></div>
      <div class="tabs" role="tablist"><button class="tab ${tab === 'updates' ? 'on' : ''}" data-tab2="updates">${esc(t('updatesTab'))}</button><button class="tab ${tab === 'downloads' ? 'on' : ''}" data-tab2="downloads">${esc(t('downloads'))}</button></div>
      <div id="updBody"></div>`;
      RB.fx.setSky('gate');
      this.body(view);
    },
    body(view) {
      const box = $('#updBody', view);
      if (!box) return;
      if (tab === 'updates') this.updates(box); else this.downloads(box);
    },
    updates(box) {
      const S = RB.state, st = S.status, p = RB.primary(), l = st && st.latest, lu = S.launcherUpdate;
      const err = st && st.checkError;
      box.innerHTML = `${lu && lu.ready ? `<div class="notice info">${RB.I.info}<div style="flex:1"><b>${esc(t('launcherReady', { v: lu.ready }))}</b></div><button class="btn" data-do="restart">${esc(t('restart'))}</button></div>` : ''}
      ${err ? `<div class="notice ${err.code === 'BAD_SIGNATURE' || err.code === 'REPLAY' || err.code === 'BAD_MANIFEST' ? 'bad' : ''}">${RB.I.warn}<div><b>${esc(err.code === 'BAD_SIGNATURE' || err.code === 'REPLAY' || err.code === 'BAD_MANIFEST' ? t('badSigB') : t('offline'))}</b><span>${esc(st.installed ? t('offlinePlay') : t('offlineInstall'))}</span></div></div>` : ''}
      <div class="two">
        <div class="glass edge pad">
          <div class="facts" style="margin-top:0">
            <div class="fact"><small>${esc(t('currentVersion'))}</small><b>${esc(st && st.version || '–')}</b></div>
            <div class="fact"><small>${esc(t('latestVersion'))}</small><b>${esc(l ? l.version : '–')}</b></div>
            <div class="fact"><small>${esc(t('lastCheck'))}</small><b>${esc(st && st.lastCheck ? RB.ago(st.lastCheck) : t('never'))}</b></div>
            <div class="fact"><small>${esc(t('launcherVer'))}</small><b>${esc(S.app.version || '')}</b></div>
          </div>
          <div class="btnrow">
            <button class="btn p" ${p.disabled ? 'disabled' : ''} data-act="${esc(p.act || '')}" id="updPrimary">${p.icon || ''}${esc(p.label)}</button>
            <button class="btn" data-act="check" ${S.checkingNow ? 'disabled' : ''}>${RB.I.refresh}${esc(S.checkingNow ? t('checking') : t('check'))}</button>
            ${st && st.blocked ? `<button class="btn" data-do="unblock">${esc(t('update'))} ${esc(l ? l.version : '')}</button>` : ''}
          </div>
          ${st && st.action === 'update' ? `<p class="muted small" style="margin:12px 0 0">${esc(RB.updateSizeText(st))}</p>` : ''}
        </div>
        <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('releaseNotes'))}</h2>${l ? `<span class="chip">${esc(l.version)}</span>` : ''}</div>
          ${l && l.notes ? `<b style="font-weight:600">${esc(l.notes.title)}</b><div class="notes" style="margin-top:6px">${esc(l.notes.body || t('noNotes'))}</div>` : `<span class="muted small">${esc(t('noNotes'))}</span>`}
        </div>
      </div>`;
    },
    downloads(box) {
      const S = RB.state, q = S.queue;
      const live = S.task && !['done', 'failed', 'canceled'].includes(S.task.phase) ? S.task : null;
      const h0 = q.history && q.history[0];
      const cur = live || (h0 && h0.result === 'failed' ? { phase: 'failed', kind: h0.kind, version: h0.version, error: { code: h0.code, message: h0.detail } } : null);
      box.innerHTML = `<div class="glass edge pad"><div class="sechead"><h2 class="s">${esc(t('currentDownload'))}</h2>${cur ? `<span class="chip">${esc(t('kind_' + cur.kind))}${cur.version ? ' · ' + esc(cur.version) : ''}</span>` : ''}</div><div id="dcCur">${cur ? this.curHtml(cur) : `<div class="empty">${RB.I.updates}<b>${esc(t('nothingDownloading'))}</b><span>${esc(t('nothingDownloadingSub'))}</span></div>`}</div></div>
      <div class="two" style="margin-top:16px">
        <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('queue'))}</h2></div><div class="rows">${q.queued.length ? q.queued.map(x => `<div class="rowi"><span class="grow">${esc(t('kind_' + x.kind))}</span><button class="btn icon-btn" data-cancel="${x.id}" aria-label="${esc(t('cancel'))}">${RB.I.stop}</button></div>`).join('') : `<span class="muted small">${esc(t('queueEmpty'))}</span>`}</div></div>
        <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('history'))}</h2></div><div class="rows" id="dcHist">${this.histHtml(q.history)}</div></div>
      </div>`;
      if (live) this.paintCur(box, live);
    },
    histHtml(h) {
      if (!h || !h.length) return `<span class="muted small">${esc(t('historyEmpty'))}</span>`;
      return h.slice(0, 12).map(x => {
        const r = x.result === 'done' ? 'ok' : x.result === 'failed' ? 'bad' : '';
        const sub = x.detail === 'nothing-wrong' ? t('nothingWrong') : x.detail === 'previous-restored' ? t('previousRestored') : x.detail ? x.detail : x.delta ? (x.delta.firstInstall ? RB.bytes(x.delta.downloadBytes) : t('of', { a: RB.bytes(x.delta.downloadBytes), b: RB.bytes(x.delta.totalSize) })) : '';
        return `<div class="rowi"><span class="grow"><b style="font-weight:600">${esc(t('kind_' + x.kind))}${x.version ? ' ' + esc(x.version) : ''}</b><small>${esc(RB.ago(x.at))}${sub ? ' · ' + esc(sub) : ''}</small></span><span class="chip ${r}">${esc(t('r_' + x.result))}</span></div>`;
      }).join('');
    },
    curHtml(task) {
      if (task.phase === 'failed') return `<div class="notice bad" style="margin:0 0 12px">${RB.I.warn}<div><b>${esc(t('updateFailedT'))}</b><span>${esc(RB.errorText(task.error))}</span>${task.error && task.error.message ? `<div class="muted small" style="margin-top:3px">${esc(task.error.message)}</div>` : ''}</div></div><div class="btnrow"><button class="btn p" data-retry="${esc(task.kind)}">${RB.I.refresh}${esc(t('retry'))}</button></div>`;
      const order = ['scanning', 'downloading', 'assembling', 'verifying', 'testing', 'activating'], names = ['st_compare', 'st_download', 'st_install', 'st_verify', 'st_test', 'st_live'], now = order.indexOf(task.phase);
      return `<div class="steps">${names.map((n, i) => `<div class="step ${i < now ? 'done' : i === now ? 'now' : ''}">${esc(t(n))}</div>`).join('')}</div>
        <div class="dl" style="max-width:none"><div class="row"><b data-b="phase"></b><span class="right num" data-b="right"></span></div><div class="bar" data-b="bar"><i data-b="fill"></i></div><div class="row" style="margin:7px 0 0"><span class="num small" data-b="sub"></span></div></div>
        <div class="bigstats">
          <div><small>${esc(t('downloaded'))}</small><b data-s="dl">–</b></div><div><small>${esc(t('speed'))}</small><b data-s="speed">–</b></div><div><small>${esc(t('timeLeft'))}</small><b data-s="eta">–</b></div><div><small>${esc(t('progress'))}</small><b data-s="pct">–</b></div>
          <div><small>${esc(t('verification'))}</small><b data-s="verify" style="font-size:14px">–</b></div><div><small>${esc(t('installProgress'))}</small><b data-s="install" style="font-size:14px">–</b></div><div style="grid-column:span 2"><small>${esc(t('details'))}</small><b data-s="delta" style="font-size:13px;white-space:normal;font-weight:500">–</b></div>
        </div>
        <div class="ctl btnrow" style="margin-top:14px"><button class="btn" data-act="pause" data-b="pp2" id="dcPause">${RB.I.pause}<span>${esc(t('pause'))}</span></button><button class="btn danger" data-act="cancel" id="dcCancel">${RB.I.stop}<span>${esc(t('cancel'))}</span></button></div>`;
    },
    paintCur(box, task) {
      RB.paintProgress(box, task);
      const s = n => box.querySelector('[data-s="' + n + '"]'), d = task.download;
      if (!s('dl')) return;
      s('dl').textContent = d ? t('of', { a: RB.bytes(d.downloaded), b: RB.bytes(d.total) }) : '–';
      s('speed').textContent = d && d.speed > 0 ? t('perSec', { s: RB.bytes(d.speed) }) : '–';
      s('eta').textContent = d && d.eta !== null && d.speed > 0 ? RB.span(d.eta) : '–';
      s('pct').textContent = Math.floor(task.phasePercent || 0) + '%';
      const v = task.verify || {};
      s('verify').textContent = v.state === 'ok' ? t('passed') : v.state === 'failed' ? t('failed') : v.state === 'running' ? t('inProgress') + ' ' + Math.floor(v.percent || 0) + '%' : t('waiting');
      s('install').textContent = task.install > 0 ? Math.floor(task.install) + '%' : t('waiting');
      const dx = task.delta;
      s('delta').textContent = dx ? t('keptFiles', { n: dx.keptFiles }) + ' · ' + t('changedFiles', { n: dx.changedFiles }) + (dx.reusedBytes && !dx.firstInstall ? ' · ' + t('savedDelta', { size: RB.bytes(dx.reusedBytes) }) : '') : '–';
      const pp = $('#dcPause', box);
      if (pp) {
        const dl = task.phase === 'downloading';
        pp.disabled = !dl;
        pp.dataset.act = task.paused ? 'resume' : 'pause';
        const lbl = task.paused ? 'resume' : 'pause';
        if (pp.dataset.lbl !== lbl) { pp.dataset.lbl = lbl; pp.innerHTML = (task.paused ? RB.I.play : RB.I.pause) + '<span>' + esc(t(lbl)) + '</span>'; }
      }
    },
    onChange(what, view) {
      if (what === 'status' || what === 'launcherUpdate') { if (tab === 'updates') this.body(view); }
      if (what === 'queue') this.body(view);
      if (what === 'game' && tab === 'updates') this.body(view);
      if (what === 'task') {
        const task = RB.state.task;
        if (tab === 'downloads') {
          const box = $('#updBody', view), steps = box && box.querySelector('.step.now');
          // phase change: redraw the steps; otherwise just the numbers
          const key = task ? task.phase + ':' + task.id : '';
          if (box && box.dataset.phase !== key) { box.dataset.phase = key; this.downloads(box); }
          else if (task && box) this.paintCur(box, task);
          return steps;
        }
        const b = $('#updPrimary', view); if (b) { const p = RB.primary(); b.lastChild.textContent = p.label; b.disabled = !!p.disabled; }
      }
    },
    async click(e, view) {
      const tb = e.target.closest('[data-tab2]');
      if (tb) { tab = tb.dataset.tab2; this.render(view); return true; }
      const r = e.target.closest('[data-retry]');
      if (r) { await RB.call('task.start', { kind: r.dataset.retry }); return true; }
      const c = e.target.closest('[data-cancel]');
      if (c) { await RB.call('task.cancel', { id: +c.dataset.cancel }); return true; }
      const d = e.target.closest('[data-do]');
      if (d && d.dataset.do === 'restart') { RB.call('launcher.restart'); return true; }
      if (d && d.dataset.do === 'unblock') { await RB.call('updates.unblock'); return true; }
      return false;
    },
  };
})();
