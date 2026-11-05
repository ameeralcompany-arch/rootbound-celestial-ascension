// The installer and uninstaller windows. Same look, same engine as the launcher.
'use strict';
(() => {
  const { $, esc } = RB;
  const t = (...a) => RB.t(...a);
  const shell = inner => `<div id="setup"><div class="art"><img class="bg" src="${RB.full('tree')}" alt=""><img class="lg" src="art/logo.png" alt="ROOTBOUND"><small>ルートバウンド</small></div>
    <div class="pane drag"><div class="top"><button class="winbtn x" data-setup="quit" aria-label="${esc(t('close'))}">${RB.I.close}</button></div><div id="stepBody" class="nodrag" style="display:flex;flex-direction:column;flex:1;min-height:0">${inner}</div></div></div>`;
  const chk = (id, label, on) => `<label class="chk"><button type="button" class="tog" role="switch" aria-checked="${on}" data-chk="${id}" aria-label="${esc(label)}"></button><span>${esc(label)}</span></label>`;

  let info = null, form = { dir: '', desktop: true, startMenu: true }, stage = 'welcome', failed = null, free = null;

  function welcome() {
    if (info.existing) return `<h1>${esc(t('setupExistingT'))}</h1><p class="muted" style="margin:0 0 12px">${esc(t('setupExistingB'))}</p>
      <div class="pathrow"><code>${esc(info.existing.root)}</code></div><div class="grow"></div>
      <div class="foot"><button class="btn" data-setup="quit">${esc(t('setupExit'))}</button><span class="sp"></span><button class="btn p big" data-setup="repair" id="repairBtn">${RB.I.shield}${esc(t('setupRepair'))}</button></div>`;
    const off = info.checkError && !info.latest;
    return `<h1>${esc(t('setupTitle'))}</h1><p class="muted" style="margin:0 0 14px">${esc(t('setupSub'))}</p>
      <small class="muted">${esc(t('setupWhere'))}</small>
      <div class="pathrow" style="margin-bottom:4px"><code id="dirText">${esc(form.dir)}</code><button class="btn" style="height:34px" data-setup="pick">${esc(t('change'))}</button></div>
      <div class="muted small" id="freeText" style="margin-bottom:10px">${free !== null ? esc(t('setupFree', { size: RB.bytes(free) })) : ''}</div>
      ${chk('desktop', t('setupDesktop'), form.desktop)}${chk('startMenu', t('setupStart'), form.startMenu)}
      ${info.latest ? `<div class="muted small" style="margin-top:6px">Rootbound ${esc(info.latest.version)}${info.latest.downloadSize ? ' · ' + esc(t('fullSize', { size: RB.bytes(info.latest.downloadSize) })) : ''}</div>` : ''}
      ${off ? `<div class="notice" style="margin:10px 0 0">${RB.I.warn}<div><b>${esc(t('offline'))}</b><span>${esc(t('offlineInstall'))}</span></div></div>` : ''}
      ${info.saves ? `<div class="muted small" style="margin-top:8px">${esc(t('setupSavesFound', { dir: info.saves }))}</div>` : ''}
      <div class="grow"></div>
      <div class="foot"><button class="btn" data-setup="quit">${esc(t('setupExit'))}</button><span class="sp"></span><button class="btn p big" data-setup="go" id="installBtn">${RB.I.updates}${esc(t('setupInstall'))}</button></div>`;
  }
  function working() {
    return `<h1 id="wTitle">${esc(t('setupCopy'))}</h1><div class="grow" style="max-height:30px"></div>
      <div class="dl" style="max-width:none" id="wBox"><div class="row"><b data-b="phase"></b><span class="right num" data-b="right"></span></div><div class="bar" data-b="bar"><i data-b="fill"></i></div><div class="row" style="margin:7px 0 0"><span class="num small" data-b="sub"></span></div><div class="ctl"><button class="btn icon-btn" data-act="pause" data-b="pp" aria-label="${esc(t('pause'))}">${RB.I.pause}</button></div></div>
      <div class="muted small" style="margin-top:14px" id="wNote"></div><div class="grow"></div>`;
  }
  function doneView() {
    return `<h1>${esc(t('setupDoneT'))}</h1><p class="muted" style="margin:0">${esc(t('setupDoneB'))}</p><div class="grow"></div>
      <div class="foot"><button class="btn" data-setup="open">${esc(t('setupOpen'))}</button><span class="sp"></span><button class="btn p big" data-setup="play" id="playNow">${RB.I.play}${esc(t('setupPlay'))}</button></div>`;
  }
  function failView() {
    return `<h1>${esc(t('updateFailedT'))}</h1><div class="notice bad">${RB.I.warn}<div><b>${esc(t('setupNetFail'))}</b><span>${esc(failed || '')}</span></div></div><div class="grow"></div>
      <div class="foot"><button class="btn" data-setup="open">${esc(t('setupLater'))}</button><span class="sp"></span><button class="btn p big" data-setup="retry" id="retryBtn">${RB.I.refresh}${esc(t('retry'))}</button></div>`;
  }
  function paint() {
    const b = $('#stepBody'); if (!b) return;
    b.innerHTML = stage === 'welcome' ? welcome() : stage === 'working' ? working() : stage === 'done' ? doneView() : failView();
  }
  const refreshFree = async () => { const r = await RB.call('setup.free', { dir: form.dir }); free = r.free; const f = $('#freeText'); if (f) f.textContent = r.why ? r.why : (free !== null ? t('setupFree', { size: RB.bytes(free) }) : ''); const go = $('#installBtn'); if (go) go.disabled = !!r.why; };

  function onTask() {
    const task = RB.state.task, box = $('#wBox');
    if (task && box) {
      RB.paintProgress(box, task);
      const w = $('#wTitle');
      if (w) w.textContent = task.phase === 'verifying' || task.phase === 'testing' ? t('setupVerify') : t('setupGame');
    }
  }

  RB.renderSetup = async () => {
    RB.$('#root').innerHTML = shell('<div class="muted">' + esc(t('checking')) + '</div>');
    info = await RB.call('setup.info');
    form.dir = info.defaultDir; free = info.free;
    stage = 'welcome'; paint();
    if (!info.existing) refreshFree();
    RB.subscribe(what => { if (what === 'task' || what === 'queue') onTask(); if (what === 'setup') { const d = RB.setupEvent, box = $('#wBox'), ti = $('#wTitle'); if (box && d) { if (ti) ti.textContent = d.step === 'copy' ? t('setupCopy') : t('setupLinks'); const fill = box.querySelector('[data-b="fill"]'); if (d.step === 'copy') { fill.style.transform = 'scaleX(' + (d.percent / 100) + ')'; box.querySelector('[data-b="right"]').textContent = Math.floor(d.percent) + '%'; } } } });
    RB.state.onTaskEnd = null;
    document.addEventListener('click', onClick);
  };
  async function waitGame() {
    await new Promise(res => { const un = RB.subscribe(what => { if (what === 'queue' && !RB.state.queue.current) { un(); res(); } }); });
    const hist = RB.state.queue.history[0];
    if (hist && hist.result === 'done') { stage = 'done'; paint(); }
    else { failed = hist && hist.detail || ''; stage = 'fail'; paint(); }
  }
  async function onClick(e) {
    const tg = e.target.closest('[data-chk]');
    if (tg) { form[tg.dataset.chk] = !form[tg.dataset.chk]; tg.setAttribute('aria-checked', form[tg.dataset.chk]); return; }
    const a = e.target.closest('[data-act]');
    if (a && a.dataset.act) { RB.act(a.dataset.act); return; }
    const b = e.target.closest('[data-setup]');
    if (!b) return;
    const what = b.dataset.setup;
    if (what === 'quit') return RB.call('setup.quit');
    if (what === 'pick') { const d = await RB.call('setup.pickDir'); if (d) { form.dir = d; $('#dirText').textContent = d; refreshFree(); } return; }
    if (what === 'go' || what === 'repair') {
      stage = 'working'; paint();
      const wait = waitGame();
      if (what === 'repair') {
        const r = await RB.call('setup.repair');
        if (!r.ok) { failed = r.message; stage = 'fail'; paint(); return; }
      } else {
        const r = await RB.call('setup.install', form);
        if (!r.ok) { stage = 'welcome'; paint(); RB.toast(t('failed'), r.message, 'bad'); return; }
        $('#wTitle').textContent = t('setupGame');
        await RB.call('setup.downloadGame');
      }
      return wait;
    }
    if (what === 'retry') { stage = 'working'; paint(); const wait = waitGame(); await RB.call('setup.downloadGame'); return wait; }
    if (what === 'play') return RB.call('setup.finish', { play: true });
    if (what === 'open') return RB.call('setup.finish', { play: false });
  }

  // ---- uninstall
  RB.renderUninstall = async () => {
    const info2 = await RB.call('uninstall.info');
    RB.$('#root').innerHTML = shell(`<h1>${esc(t('uninstTitle'))}</h1><p class="muted" style="margin:0 0 12px">${esc(t('uninstBody'))}</p>${info2.saves ? `<div class="notice info">${RB.I.shield}<div><span>${esc(t('uninstSaves', { dir: info2.saves }))}</span></div></div>` : ''}${info2.running ? `<div class="notice">${RB.I.warn}<div><b>${esc(t('uninstRunning'))}</b></div></div>` : ''}<div class="grow"></div><div class="foot"><button class="btn" data-un="quit">${esc(t('cancel'))}</button><span class="sp"></span><button class="btn p big danger" data-un="go" id="uninstBtn" ${info2.running ? 'disabled' : ''}>${esc(t('uninstGo'))}</button></div>`);
    document.addEventListener('click', async e => {
      const q = e.target.closest('[data-setup=quit],[data-un=quit],[data-un=close]');
      if (q) return RB.call('setup.quit');
      const go = e.target.closest('[data-un=go]');
      if (!go) return;
      $('#stepBody').innerHTML = `<h1>${esc(t('uninstWorking'))}</h1><div class="bar busy"><i></i></div>`;
      const r = await RB.call('uninstall.run');
      $('#stepBody').innerHTML = r.ok ? `<h1>${esc(t('uninstDoneT'))}</h1><p class="muted">${esc(t('uninstDoneB'))}</p><div class="grow"></div><div class="foot"><span class="sp"></span><button class="btn p" data-un="close" id="uninstClose">${esc(t('close'))}</button></div>` : `<h1>${esc(t('failed'))}</h1><p class="muted">${esc(r.message)}</p><div class="grow"></div><div class="foot"><span class="sp"></span><button class="btn" data-un="close">${esc(t('close'))}</button></div>`;
    });
  };
})();
