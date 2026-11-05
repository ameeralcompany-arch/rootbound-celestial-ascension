// News and Events. Everything on these pages comes from the signed feed; with no feed they say so.
'use strict';
(() => {
  const { $, $$, esc } = RB;
  const t = (...a) => RB.t(...a);
  let filter = 'all';

  // Same calculation as the main process's eventTimes, for the countdowns on the page.
  function times(e, now = Date.now()) {
    if (e.recur === 'weekly-utc-monday') { const d = new Date(now); d.setUTCHours(0, 0, 0, 0); const day = d.getUTCDay() || 7, start = d.getTime() - (day - 1) * 864e5; return { state: 'active', start, end: start + 7 * 864e5, recur: true }; }
    if (e.recur === 'daily-local') { const d = new Date(now); d.setHours(0, 0, 0, 0); const n = new Date(d); n.setDate(n.getDate() + 1); return { state: 'active', start: d.getTime(), end: n.getTime(), recur: true }; }
    const start = Date.parse(e.start), end = Date.parse(e.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { state: now < start ? 'upcoming' : now >= end ? 'ended' : 'active', start, end };
  }

  const pic = (im, art) => `<img src="${esc(RB.feedImg(im) || RB.thumb(art))}" alt="" loading="lazy">`;
  const evtRow = (e, x) => `<div class="evt"><div class="pic">${pic(e.image, RB.artFor(e.id))}</div><div style="min-width:0"><b>${esc(e.title)}</b>${e.summary ? `<p>${esc(e.summary)}</p>` : ''}${e.reward ? `<div class="rew">${esc(t('reward'))}: ${esc(e.reward)}</div>` : ''}</div>
    ${x.state === 'ended' ? '' : `<div class="count"><small>${esc(x.recur ? t('resetsIn') : x.state === 'upcoming' ? t('startsIn') : t('endsIn'))}</small><b data-count="${x.state === 'upcoming' ? x.start : x.end}" data-recur="${esc(e.recur)}">–</b></div>`}</div>`;

  RB.eventsHtml = max => {
    const feed = RB.state.news.feed, now = Date.now();
    const list = (feed ? feed.events : []).map(e => [e, times(e, now)]).filter(([, x]) => x && x.state !== 'ended').sort((a, b) => (a[1].state === b[1].state ? a[1].end - b[1].end : a[1].state === 'active' ? -1 : 1));
    if (!list.length) return `<div class="empty">${RB.I.events}<b>${esc(t('noEventsT'))}</b><span>${esc(t('noEvents'))}</span></div>`;
    return list.slice(0, max).map(([e, x]) => evtRow(e, x)).join('');
  };

  let tickT = null;
  RB.tickEvents = () => {
    clearInterval(tickT);
    const paint = () => { const els = $$('[data-count]'); if (!els.length) { clearInterval(tickT); tickT = null; return; } const now = Date.now(); for (const el of els) { const left = +el.dataset.count - now; el.textContent = RB.countdown(left); if (left <= 0 && !el.dataset.fired) { el.dataset.fired = '1'; RB.emit('news'); } } };
    paint();
    tickT = setInterval(() => { if (!document.hidden) paint(); }, 1000);
  };

  RB.newsRow = n => `<button class="newsrow" data-news="${esc(n.id)}"><span class="pic">${pic(n.image, RB.artFor(n.id))}</span><span style="min-width:0"><span class="kind">${esc(t('t_' + n.type))}</span><b>${esc(n.title)}</b><p>${esc(n.summary)}</p></span></button>`;

  RB.openNews = async id => {
    const feed = RB.state.news.feed, n = feed && feed.items.find(i => i.id === id);
    if (!n) return;
    const html = `<div class="muted small" style="margin-bottom:10px">${esc(t('t_' + n.type))} · ${esc(RB.date(n.date))}${n.version ? ' · ' + esc(t('version')) + ' ' + esc(n.version) : ''}</div><div class="notes">${esc(n.body || n.summary)}</div>`;
    const buttons = [{ label: t('backToNews'), act: null, primary: !n.link }];
    if (n.link) buttons.push({ label: t('readMore'), act: 'link', primary: true });
    const a = await RB.dialog({ title: n.title, html, banner: RB.feedImg(n.image) || RB.full(RB.artFor(n.id)), buttons, wide: true });
    if (a === 'link') RB.call('shell.open', { url: n.link });
  };

  RB.pages.news = {
    render(view) {
      const feed = RB.state.news.feed, types = ['all', 'update', 'content', 'dungeon', 'equipment', 'developer', 'maintenance', 'event'];
      const items = feed ? feed.items.filter(i => filter === 'all' || i.type === filter) : [];
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('news'))}</h1><span class="jp">${RB.JP.news}</span><span class="grow"></span><button class="btn" data-do="refresh">${RB.I.refresh}<span>${esc(t('refresh'))}</span></button></div>
      ${RB.state.news.error && feed ? `<div class="notice info">${RB.I.info}<div><span>${esc(t('newsOffline'))}</span></div></div>` : ''}
      ${feed && feed.maintenance ? `<div class="notice">${RB.I.warn}<div><b>${esc(feed.maintenance.title)}</b><span>${esc(feed.maintenance.text)}</span></div></div>` : ''}
      <div class="filters">${types.map(k => `<button class="filter ${filter === k ? 'on' : ''}" data-filter="${k}">${esc(k === 'all' ? t('all') : t('t_' + k))}</button>`).join('')}</div>
      ${items.length ? `<div class="newsgrid">${items.map(n => `<button class="newscard" data-news="${esc(n.id)}"><div class="pic"><img src="${esc(RB.feedImg(n.image) || RB.thumb(RB.artFor(n.id)))}" alt="" loading="lazy"></div><div class="body"><span class="kind">${esc(t('t_' + n.type))}</span><b>${esc(n.title)}</b><p>${esc(n.summary)}</p><small>${esc(RB.date(n.date))}</small></div></button>`).join('')}</div>`
    : `<div class="empty">${RB.I.news}<b>${esc(t('noNewsT'))}</b><span>${esc(RB.state.news.error && !feed ? t('newsOffline') : t('noNews'))}</span></div>`}`;
      RB.fx.setSky('galaxy');
    },
    onChange(what, view) { if (what === 'news') this.render(view); },
    async click(e, view) {
      const f = e.target.closest('[data-filter]');
      if (f) { filter = f.dataset.filter; this.render(view); return true; }
      const r = e.target.closest('[data-do=refresh]');
      if (r) { r.disabled = true; await RB.call('news.refresh'); return true; }
      return false;
    },
  };

  RB.pages.events = {
    render(view) {
      const feed = RB.state.news.feed, now = Date.now(), all = (feed ? feed.events : []).map(e => [e, times(e, now)]).filter(([, x]) => x);
      const group = (key, title) => { const g = all.filter(([, x]) => x.state === key); return g.length ? `<h2 class="s">${esc(title)} <span class="n">${g.length}</span></h2>${g.map(([e, x]) => evtRow(e, x)).join('')}` : ''; };
      const body = group('active', t('active')) + group('upcoming', t('upcoming')) + group('ended', t('ended'));
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('events'))}</h1><span class="jp">${RB.JP.events}</span></div><div class="evtbig">${body || `<div class="empty">${RB.I.events}<b>${esc(t('noEventsT'))}</b><span>${esc(t('noEvents'))}</span></div>`}</div>`;
      RB.fx.setSky('crystal');
      RB.tickEvents();
    },
    onChange(what, view) { if (what === 'news') this.render(view); },
  };

  // Community: the real server, and links the developer publishes.
  RB.pages.community = {
    render(view) {
      const S = RB.state, links = [];
      if (S.app.links && S.app.links.project) links.push({ title: t('projectPage'), text: t('projectSub'), url: S.app.links.project });
      if (S.app.links && S.app.links.issues) links.push({ title: t('reportBug'), text: t('reportBugSub'), url: S.app.links.issues });
      for (const l of (S.news.feed && S.news.feed.community.links) || []) links.push(l);
      const sv = S.server;
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('community'))}</h1><span class="jp">${RB.JP.community}</span></div>
      <div class="two">
        <div class="glass edge pad"><div class="sechead"><h2 class="s">${esc(t('serverStatus'))}</h2>${!sv ? `<span class="chip">${esc(t('serverChecking'))}</span>` : sv.online ? `<span class="chip ok"><i class="pulse"></i>${esc(t('serverOnline'))}</span>` : `<span class="chip warn">${esc(t('serverOffline'))}</span>`}</div>
          ${sv && sv.online ? `<div class="statgrid"><div class="stat"><small>${esc(t('playersOnline', { n: '' }).trim())}</small><b>${Number.isFinite(sv.players) ? sv.players : '–'}</b></div><div class="stat"><small>${esc(t('speed'))}</small><b>${esc(t('pingMs', { n: sv.ms }))}</b></div></div>` : `<p class="muted small" style="margin:0">${esc(t('serverAsleepSub'))}</p>`}
        </div>
        <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('links'))}</h2></div><div class="rows">${links.map(l => `<button class="rowi" style="width:100%;text-align:left" data-link="${esc(l.url)}"><span class="grow"><b style="font-weight:600">${esc(l.title)}</b><small>${esc(l.text)}</small></span>${RB.I.link.replace('<svg', '<svg style="width:15px;height:15px;opacity:.7"')}</button>`).join('') || `<span class="muted small">–</span>`}</div><p class="muted small" style="margin:12px 0 0">${esc(t('communityNote'))}</p></div>
      </div>`;
      RB.fx.setSky('sunset');
      if (!sv) RB.call('server.status').then(s => { S.server = s; if (RB.current === 'community') this.render(view); });
    },
    click(e) {
      const l = e.target.closest('[data-link]');
      if (l) { RB.call('shell.open', { url: l.dataset.link }); return true; }
      return false;
    },
    enter() { RB.state.server = null; },
    onChange(what, view) { if (what === 'news') this.render(view); },
  };
})();
