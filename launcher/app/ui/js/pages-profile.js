// Profile: what the game itself reported about your character. Nothing on this page is invented; with nothing reported, it says so.
'use strict';
(() => {
  const { esc } = RB;
  const t = (...a) => RB.t(...a);
  const fmt = n => Number(n || 0).toLocaleString(RB.lang);
  RB.pages.profile = {
    render(view) {
      const P = RB.state.profile;
      RB.fx.setSky('galaxy');
      if (!P.available || !P.made && !P.level) {
        view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('profile'))}</h1></div><div class="glass edge pad"><div class="empty">${RB.I.user}<b>${esc(t('profileNoneT'))}</b><span>${esc(t('profileNone'))}</span></div></div>`;
        return;
      }
      const a = P.achievements, d = P.dungeons, st = P.stats || {};
      const pct = P.xpNext ? Math.min(1, P.xp / P.xpNext) : 0;
      view.innerHTML = `<div class="pagehead"><h1 class="t">${esc(t('profile'))}</h1><span class="grow"></span><span class="muted small">${esc(t('fromSession', { t: RB.ago(P.updatedAt) }))}</span></div>
      <div class="prof">
        <div class="glass edge who">
          ${RB.avatar(P)}
          <h2>${esc(P.name || t('localPlayer'))}</h2>
          ${P.title ? `<div class="ttl">${esc(P.title)}</div>` : ''}
          <div class="lvlbar"><div class="t2"><span>${esc(t('level'))} ${fmt(P.level)}</span>${P.xpNext ? `<span class="num">${fmt(Math.floor(P.xp))} / ${fmt(P.xpNext)} XP</span>` : ''}</div><div class="bar"><i style="transform:scaleX(${pct})"></i></div></div>
          <div class="facts" style="grid-template-columns:1fr 1fr;text-align:left;margin:16px 0 0">
            <div class="fact"><small>${esc(t('username'))}</small><b>${esc(P.signedIn ? (P.account || P.name) : t('offlineAccount'))}</b></div>
            <div class="fact"><small>${esc(t('playtime'))}</small><b>${esc(RB.span(P.playSeconds))}</b></div>
            ${P.klass ? `<div class="fact"><small>${esc(t('klass'))}</small><b>${esc(P.klass.name)} ${esc(P.klass.level)}</b></div>` : ''}
            <div class="fact"><small>${esc(t('gems'))}</small><b class="num">${fmt(P.gems)}</b></div>
            ${P.weapon ? `<div class="fact" style="grid-column:span 2"><small>${esc(t('weapon'))}</small><b>${esc(P.weapon.name)}</b></div>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('progression'))}</h2></div>
            <div class="statgrid">
              <div class="stat"><small>${esc(t('dungeonsCleared'))}</small><b>${fmt(d.cleared)}${d.total ? ' / ' + fmt(d.total) : ''}</b></div>
              ${a.total ? `<div class="stat"><small>${esc(t('achievements'))}</small><b>${fmt(a.done)} / ${fmt(a.total)}</b></div>` : ''}
              ${P.skills ? `<div class="stat"><small>${esc(t('mining'))}</small><b>${fmt(P.skills.mine)}</b></div><div class="stat"><small>${esc(t('farming'))}</small><b>${fmt(P.skills.farm)}</b></div><div class="stat"><small>${esc(t('fighting'))}</small><b>${fmt(P.skills.fight)}</b></div>` : ''}
              ${st.break !== undefined ? `<div class="stat"><small>${esc(t('blocksBroken'))}</small><b>${fmt(st.break)}</b></div><div class="stat"><small>${esc(t('monsters'))}</small><b>${fmt(st.kill)}</b></div>` : ''}
            </div>
          </div>
          <div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('outfit'))}</h2></div><div class="tagrow">${P.outfit.length ? P.outfit.map(o => `<span class="chip">${esc(t('slot_' + o.slot))}: ${esc(o.name)}</span>`).join('') : `<span class="muted small">${esc(t('noOutfit'))}</span>`}</div></div>
          ${d.list.length ? `<div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('dungeonLabel'))}</h2></div><div class="rows">${d.list.map(x => `<div class="rowi"><span class="grow"><b style="font-weight:600">${esc(x.name)}</b><small>${esc(x.diffs.join(', ') || (x.locked ? t('locked') : t('notCleared')))}</small></span><span class="chip ${x.cleared ? 'ok' : ''}">${esc(x.cleared ? t('cleared') : x.locked ? t('locked') : t('notCleared'))}</span></div>`).join('')}</div></div>` : ''}
          ${a.list.length ? `<div class="glass pad"><div class="sechead"><h2 class="s">${esc(t('achievements'))} <span class="n">${fmt(a.done)} / ${fmt(a.total)}</span></h2></div><div class="achs">${a.list.map(x => `<div class="ach ${x.done ? 'done' : ''}"><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></div>`).join('')}</div></div>` : ''}
        </div>
      </div>`;
    },
    onChange(what, view) { if (what === 'profile') this.render(view); },
  };
})();
