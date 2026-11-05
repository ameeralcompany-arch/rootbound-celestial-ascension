// Home: the big banner with the one button that matters, then where you left off, then what's new.
'use strict';
RB.pages = RB.pages || {};
(() => {
  const { $, $$, esc, t: _t } = RB;
  const t = (...a) => RB.t(...a);
  let timer = null, slide = 0, slides = [];
  const DWELL = 9000;

  // Banners: the current version first, then what the feed pins or announces. Without a feed, only what is really known.
  function buildSlides() {
    const S = RB.state, st = S.status, feed = S.news.feed, out = [];
    const verText = st && st.version ? t('version') + ' ' + st.version : '';
    if (st && st.action === 'update' && st.latest) out.push({ id: 'update', art: 'gate', kind: t('available'), title: st.latest.notes && st.latest.notes.title || ('Rootbound ' + st.latest.version), text: st.latest.notes && st.latest.notes.body || t('updateReady') });
    if (feed) {
      for (const b of feed.banners || []) out.push({ id: 'b' + b.id, art: b.art, img: RB.feedImg(b.image), title: b.title, text: b.text, newsId: b.newsId });
      for (const n of feed.items.filter(i => i.pin).slice(0, 2)) out.push({ id: 'n' + n.id, art: RB.artFor(n.id), img: RB.feedImg(n.image), kind: t('t_' + n.type), title: n.title, text: n.summary, newsId: n.id });
      const first = feed.items.find(i => !i.pin);
      if (first && out.length < 4) out.push({ id: 'n' + first.id, art: RB.artFor(first.id), img: RB.feedImg(first.image), kind: t('t_' + first.type), title: first.title, text: first.summary, newsId: first.id });
    }
    if (!out.some(s => s.id === 'welcome')) out.unshift({ id: 'welcome', art: 'tree', kind: verText, title: t('welcome'), text: t('welcomeBlurb') });
    return out.slice(0, 5);
  }

  function heroHtml() {
    const s = slides[slide] || slides[0];
    return `<section class="hero" id="hero">
      ${slides.map((x, i) => `<div class="art ${i === slide ? 'on' : ''}" data-s="${i}"><img src="${esc(x.img || RB.full(x.art))}" alt="" loading="lazy"></div>`).join('')}
      <div class="mist"></div><canvas class="spark" id="spark"></canvas>
      <div class="vert">ルートバウンド</div>
      <div class="inner">
        <img class="logo" src="art/logo.png" alt="ROOTBOUND">
        <div class="chips" id="heroChips"></div>
        <div id="heroCopy">${copyHtml(s)}</div>
        <div id="heroAct"></div>
      </div>
      <div class="dots">${slides.length > 1 ? slides.map((x, i) => `<button data-go="${i}" class="${i === slide ? 'on' : ''}" aria-label="${i + 1}"><i></i></button>`).join('') : ''}</div>
    </section>`;
  }
  const copyHtml = s => `<h2 class="headline">${esc(s.title)}</h2><p class="blurb">${esc(s.text)}</p>`;

  function chipsHtml() {
    const S = RB.state, st = S.status;
    if (!st) return '';
    const c = [];
    if (st.version) c.push(`<span class="chip">${esc(t('version'))} ${esc(st.version)}</span>`);
    if (S.game.running) c.push(`<span class="chip live"><i class="pulse"></i>${esc(t('running'))}</span>`);
    else if (st.action === 'play') c.push(`<span class="chip ok">${esc(t('ready'))}</span>`);
    else if (st.action === 'update') c.push(`<span class="chip live"><i class="pulse"></i>${esc(t('available'))}${st.latest ? ' · ' + esc(st.latest.version) : ''}</span>`);
    else if (st.action === 'repair') c.push(`<span class="chip bad">${esc(t('broken'))}</span>`);
    else if (st.action === 'install' && !st.latest && st.checkError) c.push(`<span class="chip warn">${esc(t('offline'))}</span>`);
    else if (st.action === 'install') c.push(`<span class="chip">${esc(t('notInstalled'))}</span>`);
    return c.join('');
  }

  // The button, or the live download. Rewritten only when its shape changes; numbers update in place.
  RB.actHtml = () => {
    const p = RB.primary(), task = RB.state.task, st = RB.state.status;
    if (p.busy && task) return dlHtml(task);
    return `<div class="actions"><button class="btn p big" ${p.disabled ? 'disabled' : ''} data-act="${esc(p.act || '')}" id="primaryBtn">${p.icon || ''}<span>${esc(p.label)}</span></button>
      ${p.sub ? `<span class="muted small">${esc(p.sub)}</span>` : ''}
      ${st && st.action === 'play' && !RB.state.game.running ? `<button class="btn ghost" data-nav="library">${esc(t('details'))}</button>` : ''}
      ${st && st.action === 'install' && !st.latest && st.checkError ? `<span class="muted small">${esc(t('offlineInstall'))}</span>` : ''}</div>`;
  };
  function dlHtml(task) {
    return `<div class="dl" id="dlBox"><div class="row"><b data-b="phase"></b><span class="right num" data-b="right"></span></div><div class="bar" data-b="bar"><i data-b="fill"></i></div><div class="row" style="margin:7px 0 0"><span class="num small" data-b="sub"></span></div>
      <div class="ctl"><button class="btn icon-btn" data-act="pause" data-b="pp" title="${esc(t('pause'))}" aria-label="${esc(t('pause'))}">${RB.I.pause}</button><button class="btn icon-btn" data-act="cancel" title="${esc(t('cancel'))}" aria-label="${esc(t('cancel'))}">${RB.I.stop}</button><button class="btn ghost" data-nav="updates" data-tab="downloads" style="height:34px">${esc(t('downloads'))}</button></div></div>`;
  }
  // Fills in any progress block on the page: same numbers everywhere.
  RB.paintProgress = (root, task) => {
    const b = n => root.querySelector('[data-b="' + n + '"]');
    if (!b('fill')) return;
    const d = task.download, phase = task.paused ? 'paused' : task.phase, dl = phase === 'downloading' || phase === 'paused';
    b('phase').textContent = t('phase_' + phase);
    const bar = b('bar');
    const determinate = dl ? !!d : ['scanning', 'assembling', 'verifying'].includes(phase);
    bar.classList.toggle('busy', !determinate);
    bar.classList.toggle('paused', phase === 'paused');
    const pct = dl && d ? d.percent : task.phasePercent;
    if (determinate) b('fill').style.transform = 'scaleX(' + Math.min(1, (pct || 0) / 100) + ')'; else b('fill').style.transform = '';
    b('right').textContent = determinate ? Math.floor(pct || 0) + '%' : '';
    let sub = '';
    if (dl && d) {
      sub = t('of', { a: RB.bytes(d.downloaded), b: RB.bytes(d.total) });
      if (d.speed > 0) sub += '  ·  ' + t('perSec', { s: RB.bytes(d.speed) });
      if (d.eta !== null && d.speed > 0) sub += '  ·  ' + t('left', { t: RB.span(d.eta) });
    } else if (phase === 'scanning' || phase === 'checking') sub = t('calculating');
    else if (task.delta && task.delta.reusedBytes && !task.delta.firstInstall) sub = t('savedDelta', { size: RB.bytes(task.delta.reusedBytes) });
    b('sub').textContent = sub;
    const pp = b('pp');
    if (pp) {
      pp.style.display = dl ? '' : 'none';
      pp.dataset.act = task.paused ? 'resume' : 'pause';
      const lbl = t(task.paused ? 'resume' : 'pause'); pp.title = lbl; pp.setAttribute('aria-label', lbl);
      const want = task.paused ? RB.I.play : RB.I.pause;
      if (pp.dataset.icon !== (task.paused ? 'p' : 'q')) { pp.innerHTML = want; pp.dataset.icon = task.paused ? 'p' : 'q'; }
    }
  };

  function continueHtml() {
    const P = RB.state.profile, cards = [];
    if (P.available) {
      const seen = new Set();
      if (P.lastSession) cards.push(`<div class="card"><div class="thumb"><img src="${RB.thumb('hero')}" alt=""><span class="tag chip">${esc(t('lastSession'))}</span></div><div class="meta"><b>${esc(RB.ago(P.lastSession.endedAt))}</b><small>${esc(t('sessionLen', { t: RB.span(P.lastSession.seconds) }))}</small></div></div>`);
      for (const d of P.recentDungeons.slice(0, 2)) cards.push(`<button class="card" data-quick-dungeon="${esc(d.id)}" title="${esc(t('quickLaunch'))}"><div class="thumb"><img src="${RB.thumb(RB.artFor(d.id))}" alt=""><span class="tag chip">${esc(t('dungeonLabel'))}</span><span class="play">${RB.I.play}</span></div><div class="meta"><b>${esc(d.name || d.id)}</b><small>${esc(d.diff ? d.diff + ' · ' : '')}${esc(t('playedAgo', { t: RB.ago(d.at) }))}</small></div></button>`);
      for (const w of P.recentWorlds) { if (seen.has(w.name) || cards.length >= 5) continue; seen.add(w.name); cards.push(`<button class="card" data-quick-world="${esc(w.name)}" title="${esc(t('quickLaunch'))}"><div class="thumb"><img src="${RB.thumb(RB.artFor(w.name))}" alt=""><span class="tag chip">${esc(t('worldLabel'))}</span><span class="play">${RB.I.play}</span></div><div class="meta"><b>${esc(w.name)}</b><small>${esc(t('playedAgo', { t: RB.ago(w.at) }))}</small></div></button>`); }
      for (const w of P.knownWorlds) { if (seen.has(w) || cards.length >= 5) continue; seen.add(w); cards.push(`<button class="card" data-quick-world="${esc(w)}" title="${esc(t('quickLaunch'))}"><div class="thumb"><img src="${RB.thumb(RB.artFor(w))}" alt=""><span class="tag chip">${esc(t('worldLabel'))}</span><span class="play">${RB.I.play}</span></div><div class="meta"><b>${esc(w)}</b><small>${esc(t('quickLaunch'))}</small></div></button>`); }
    }
    if (!cards.length) return `<div class="empty">${RB.I.sparkle}<b>${esc(t('noContinueT'))}</b><span>${esc(t('noContinue'))}</span></div>`;
    return `<div class="cards">${cards.join('')}</div>`;
  }

  function newsListHtml() {
    const feed = RB.state.news.feed;
    if (!feed || !feed.items.length) return `<div class="empty">${RB.I.news}<b>${esc(t('noNewsT'))}</b><span>${esc(RB.state.news.error ? t('newsOffline') : t('noNews'))}</span></div>`;
    return feed.items.slice(0, 5).map(n => RB.newsRow(n)).join('');
  }

  RB.pages.home = {
    render(view) {
      slides = buildSlides(); slide = Math.min(slide, slides.length - 1);
      const m = RB.state.news.feed && RB.state.news.feed.maintenance;
      view.innerHTML = `${m ? `<div class="notice">${RB.I.warn}<div><b>${esc(m.title)}</b><span>${esc(m.text)}</span></div></div>` : ''}
      ${heroHtml()}
      <div class="grid-home">
        <div>
          <div class="glass edge pad" id="contBox"><div class="sechead"><h2 class="s">${esc(t('continuePlaying'))}</h2></div><div id="contBody">${continueHtml()}</div></div>
          <div class="glass pad" style="margin-top:18px"><div class="sechead"><h2 class="s">${esc(t('latestNews'))}</h2><button class="linkbtn" data-nav="news">${esc(t('exploreAll'))} ${RB.I.arrow}</button></div><div id="homeNews">${newsListHtml()}</div></div>
        </div>
        <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('events'))}</h2><button class="linkbtn" data-nav="events">${esc(t('exploreAll'))} ${RB.I.arrow}</button></div><div id="homeEvents">${RB.eventsHtml(4)}</div></div>
      </div>`;
      RB.fx.hero($('#spark', view));
      RB.fx.setSky((slides[slide] && slides[slide].art) || 'tree');
      this.paint(view);
      this.startTimer();
      RB.tickEvents();
    },
    paint(view) {
      const chips = $('#heroChips', view), box = $('#heroAct', view);
      if (!box) return;
      chips.innerHTML = chipsHtml();
      const task = RB.state.task, p = RB.primary();
      const shape = p.busy ? 'dl' : JSON.stringify([p.label, p.act, p.disabled, p.sub, RB.state.status && RB.state.status.action, RB.state.game.running]);
      if (box.dataset.shape !== shape) { box.dataset.shape = shape; box.innerHTML = RB.actHtml(); }
      if (p.busy && task) RB.paintProgress(box, task);
    },
    go(i) {
      if (i === slide || !slides[i]) return;
      slide = i;
      const hero = $('#hero'); if (!hero) return;
      $$('.art', hero).forEach((a, n) => a.classList.toggle('on', n === i));
      $$('.dots button', hero).forEach((b, n) => b.classList.toggle('on', n === i));
      const copy = $('#heroCopy', hero);
      copy.innerHTML = copyHtml(slides[i]);
      RB.fx.setSky(slides[i].art || 'tree');
      this.startTimer();
    },
    startTimer() { clearInterval(timer); if (slides.length > 1) timer = setInterval(() => { if (!document.hidden && !document.documentElement.hasAttribute('data-idle')) this.go((slide + 1) % slides.length); }, DWELL); },
    leave() { clearInterval(timer); timer = null; },
    onChange(what, view) {
      if (what === 'task' || what === 'queue' || what === 'status' || what === 'game') {
        const was = slides.map(s => s.id).join();
        slides = buildSlides();
        if (slides.map(s => s.id).join() !== was) return this.render(view);
        this.paint(view);
      }
      if (what === 'news') this.render(view);
      if (what === 'profile') { const c = $('#contBody', view); if (c) c.innerHTML = continueHtml(); }
    },
    click(e, view) {
      const go = e.target.closest('[data-go]');
      if (go) { this.go(+go.dataset.go); return true; }
      return false;
    },
  };
})();
