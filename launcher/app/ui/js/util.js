// Page helpers: escaping, formatting, icons. Text from outside (news, names, paths) always passes through esc() before it reaches the page.
'use strict';
RB.$ = (s, r) => (r || document).querySelector(s);
RB.$$ = (s, r) => [...(r || document).querySelectorAll(s)];
RB.esc = v => String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

RB.bytes = n => {
  if (!Number.isFinite(n) || n < 0) return '0 B';
  if (n < 1024) return n + ' B';
  const u = ['KB', 'MB', 'GB', 'TB']; let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)) + ' ' + u[i];
};

RB.span = seconds => {
  const t = RB.t, s = Math.max(0, Math.round(seconds));
  if (s < 60) return t('seconds', { n: s });
  const m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return t('days', { n: d }) + ' ' + t('hours', { n: h % 24 });
  if (h > 0) return t('hours', { n: h }) + ' ' + t('minutes', { n: m % 60 });
  return t('minutes', { n: m }) + (m < 10 ? ' ' + t('seconds', { n: s % 60 }) : '');
};

RB.ago = at => {
  if (!at) return RB.t('never');
  const s = (Date.now() - at) / 1000, t = RB.t;
  if (s < 90) return t('justNow');
  if (s < 3600) return t('agoMin', { n: Math.round(s / 60) });
  if (s < 86400) return t('agoHour', { n: Math.round(s / 3600) });
  if (s < 86400 * 30) return t('agoDay', { n: Math.round(s / 86400) });
  return new Date(at).toLocaleDateString(RB.lang);
};
RB.date = d => { const t = Date.parse(d); return Number.isFinite(t) ? new Date(t).toLocaleDateString(RB.lang, { year: 'numeric', month: 'short', day: 'numeric' }) : ''; };
RB.countdown = ms => {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, c = s % 60, p = n => String(n).padStart(2, '0');
  return (d ? RB.t('days', { n: d }) + ' ' : '') + p(h) + ':' + p(m) + ':' + p(c);
};

// A stable picture for a world name, from the game's own film.
const ARTS = ['tree', 'crystal', 'galaxy', 'gate', 'sea', 'hero', 'sunset', 'tower'];
RB.ARTS = ARTS;
RB.artFor = name => { let h = 7; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return ARTS[h % ARTS.length]; };
RB.thumb = n => 'art/' + (ARTS.includes(n) ? n : 'tree') + '-thumb.webp';
RB.full = n => 'art/' + (ARTS.includes(n) ? n : 'tree') + '.webp';
RB.feedImg = im => im && im.file ? 'rbimg://news/' + im.file : null;

const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
RB.I = {
  home: svg('<path d="M3.5 11 12 4l8.500 7"/><path d="M5.500 9.500V20h13V9.500"/><path d="M10 20v-5.500h4V20"/>'),
  library: svg('<rect x="3.500" y="5" width="17" height="14" rx="2.500"/><path d="M8 15.500h3M9.500 14v3"/><circle cx="15.500" cy="14" r=".6" fill="currentColor"/><circle cx="17.500" cy="16.500" r=".6" fill="currentColor"/><path d="M7.500 5V3.500M16.500 5V3.500"/>'),
  news: svg('<path d="M4.500 5h12v13a2 2 0 0 0 2 2H6.500a2 2 0 0 1-2-2z"/><path d="M16.500 9h3v9a1.500 1.500 0 0 1-3 0"/><path d="M7.500 9h6M7.500 12.500h6M7.500 16h4"/>'),
  events: svg('<rect x="4" y="5.500" width="16" height="14.500" rx="2.500"/><path d="M4 10h16M8.500 3.500v4M15.500 3.500v4"/><path d="m12 12.500.9 1.800 2 .3-1.450 1.400.35 2-1.800-.95-1.800.95.35-2-1.450-1.400 2-.3z"/>'),
  updates: svg('<path d="M12 4v11"/><path d="m7.500 11 4.500 4.500 4.500-4.500"/><path d="M4.500 19.500h15"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M18.400 5.600l-1.800 1.800M7.400 16.600l-1.800 1.800"/>'),
  community: svg('<circle cx="9" cy="8.500" r="3.200"/><path d="M3 19.500c.5-3.500 3-5 6-5s5.500 1.500 6 5"/><path d="M15.500 5.500a3.200 3.200 0 0 1 0 6M17.500 14.800c2 .6 3.200 2.200 3.500 4.700"/>'),
  user: svg('<circle cx="12" cy="8.500" r="3.800"/><path d="M4.500 20.500c.6-4 3.700-6 7.500-6s6.900 2 7.500 6"/>'),
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.500v15a1 1 0 0 0 1.500.86l12.500-7.500a1 1 0 0 0 0-1.720L8.500 3.640A1 1 0 0 0 7 4.500z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.500" width="4.200" height="15" rx="1"/><rect x="13.800" y="4.500" width="4.200" height="15" rx="1"/></svg>',
  stop: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  folder: svg('<path d="M3.500 7a2 2 0 0 1 2-2H10l2 2.500h6.500a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
  shield: svg('<path d="M12 3.500 5 6v5.500c0 4.500 3 7.500 7 9 4-1.500 7-4.500 7-9V6z"/><path d="m9 12 2.200 2.200L15.500 10"/>'),
  refresh: svg('<path d="M20 12a8 8 0 0 1-14 5.300L4 15"/><path d="M4 12a8 8 0 0 1 14-5.300L20 9"/><path d="M4 20v-5h5M20 4v5h-5"/>'),
  back: svg('<path d="M11 19 4 12l7-7"/><path d="M4 12h16"/>'),
  arrow: svg('<path d="m9 5 7 7-7 7"/>'),
  warn: svg('<path d="M12 4 2.500 20h19z"/><path d="M12 10v4.500"/><circle cx="12" cy="17.300" r=".4" fill="currentColor"/>'),
  info: svg('<circle cx="12" cy="12" r="8.500"/><path d="M12 11v5.500"/><circle cx="12" cy="8" r=".4" fill="currentColor"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>'),
  minimize: svg('<path d="M5 12h14"/>'),
  maximize: svg('<rect x="5.500" y="5.500" width="13" height="13" rx="1.500"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  sparkle: svg('<path d="M12 3.500c.8 4.600 2.500 6.700 8 8.500-5.500 1.800-7.200 3.900-8 8.500-.8-4.600-2.500-6.700-8-8.500 5.500-1.800 7.200-3.900 8-8.500z"/>'),
};
RB.avatar = (p, size) => '<div class="av"' + (size ? ' style="width:' + (size | 0) + 'px;height:' + (size | 0) + 'px"' : '') + '>' + (p && p.avatar ? '<img src="' + RB.esc(p.avatar) + '" alt="">' : RB.I.user) + '</div>';
RB.toast = (title, body, kind) => {
  const box = RB.$('#toasts'), el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.innerHTML = '<b>' + RB.esc(title) + '</b>' + (body ? '<div class="muted small">' + RB.esc(body) + '</div>' : '');
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 280); }, kind === 'bad' ? 7000 : 4200);
  while (box.children.length > 4) box.firstChild.remove();
};
// Modal dialogs. buttons: [{label, act, primary, danger}]; resolves with the act of the button pressed, or null.
RB.dialog = ({ title, body, html, banner, buttons, wide }) => new Promise(resolve => {
  const ov = document.createElement('div'); ov.className = 'ov';
  const btns = (buttons || [{ label: RB.t('ok'), act: 'ok', primary: true }]).map((b, i) => '<button class="btn ' + (b.primary ? 'p' : '') + ' ' + (b.danger ? 'danger' : '') + '" data-i="' + i + '">' + RB.esc(b.label) + '</button>').join('');
  ov.innerHTML = '<div class="dialog glass edge ' + (wide ? 'wide' : '') + '" role="dialog" aria-modal="true">' + (banner ? '<div class="banner"><img src="' + RB.esc(banner) + '" alt=""></div>' : '') + '<div class="pad"><h3>' + RB.esc(title) + '</h3>' + (html || (body ? '<div class="notes">' + RB.esc(body) + '</div>' : '')) + '<div class="btnrow" style="justify-content:flex-end;margin-top:18px">' + btns + '</div></div></div>';
  const done = v => { document.removeEventListener('keydown', key); ov.remove(); resolve(v); };
  const key = e => { if (e.key === 'Escape') done(null); };
  document.addEventListener('keydown', key);
  ov.addEventListener('click', e => { if (e.target === ov) return done(null); const b = e.target.closest('[data-i]'); if (b) done((buttons || [{ act: 'ok' }])[+b.dataset.i].act); });
  RB.$('#overlays').appendChild(ov);
  const first = ov.querySelector('.btn.p') || ov.querySelector('.btn'); if (first) first.focus();
});
