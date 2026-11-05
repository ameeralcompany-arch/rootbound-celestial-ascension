// The ambient things: drifting motes, hero sparkles, the opening reveal and the launch moment. Everything stops when the window isn't being looked at.
'use strict';
RB.fx = (() => {
  let enabled = true, visible = true, canvases = [], raf = 0, last = 0, audio = null;
  const dprNow = () => Math.min(window.devicePixelRatio || 1, 1.5);

  function makeField(canvas, count, opts) {
    const g = canvas.getContext('2d');
    const P = [];
    let W = 0, H = 0;
    const resize = () => { const r = canvas.getBoundingClientRect(), d = dprNow(); W = r.width; H = r.height; canvas.width = Math.max(1, W * d); canvas.height = Math.max(1, H * d); g.setTransform(d, 0, 0, d, 0, 0); };
    resize();
    const seed = () => ({ x: Math.random() * W, y: Math.random() * H, r: opts.size[0] + Math.random() * (opts.size[1] - opts.size[0]), vx: (Math.random() - .5) * opts.drift, vy: -(opts.rise[0] + Math.random() * (opts.rise[1] - opts.rise[0])), a: Math.random() * 6.28, s: .4 + Math.random() * .9, c: opts.colors[Math.random() * opts.colors.length | 0] });
    for (let i = 0; i < count; i++) P.push(seed());
    return {
      canvas, resize,
      draw(dt) {
        if (!canvas.isConnected) return false;
        g.clearRect(0, 0, W, H);
        g.globalCompositeOperation = 'lighter';
        for (const p of P) {
          p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.s * dt;
          if (p.y < -8) { p.y = H + 6; p.x = Math.random() * W; } if (p.x < -8) p.x = W + 6; else if (p.x > W + 8) p.x = -6;
          const tw = .35 + .65 * (.5 + .5 * Math.sin(p.a));
          g.globalAlpha = tw * opts.alpha;
          g.fillStyle = p.c;
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
          g.globalAlpha = tw * opts.alpha * .14;
          g.beginPath(); g.arc(p.x, p.y, p.r * 3, 0, 6.283); g.fill();
        }
        g.globalCompositeOperation = 'source-over';
        return true;
      },
    };
  }

  // about 24 frames a second is plenty for something this slow, and much cheaper than 60
  function loop(t) {
    raf = 0;
    if (!enabled || !visible || !canvases.length) return;
    raf = requestAnimationFrame(loop);
    if (t - last < 41) return;
    const dt = Math.min(.1, (t - last) / 1000); last = t;
    canvases = canvases.filter(c => c.draw(dt));
  }
  const kick = () => { if (!raf && enabled && visible && canvases.length) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const MOTE = { size: [.4, 1.1], drift: 6, rise: [3, 10], alpha: .4, colors: ['#9fb4ff', '#c6b0ff', '#8fe6ff', '#f4d59a'] };
  const SPARK = { size: [.4, 1.3], drift: 10, rise: [5, 16], alpha: .7, colors: ['#ffffff', '#a8e8ff', '#d3bdff', '#ffe2ad'] };

  window.addEventListener('resize', () => canvases.forEach(c => c.resize()));
  document.addEventListener('visibilitychange', () => setVisible(!document.hidden));

  function setVisible(v) {
    visible = v;
    document.documentElement.toggleAttribute('data-idle', !v);
    if (!v && raf) { cancelAnimationFrame(raf); raf = 0; }
    kick();
  }
  return {
    setEnabled(on) { enabled = on; if (!on) { if (raf) cancelAnimationFrame(raf); raf = 0; const c = RB.$('#motes'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); } else kick(); },
    setVisible,
    sky() { const c = RB.$('#motes'); if (c && !canvases.some(x => x.canvas === c)) canvases.push(makeField(c, 26, MOTE)); kick(); },
    hero(canvas) { canvases.push(makeField(canvas, 18, SPARK)); kick(); },
    setSky(art) { const el = RB.$('#skyArt'); if (!el) return; if (el.dataset.art === art) return; el.dataset.art = art; el.classList.remove('on'); el.onload = () => el.classList.add('on'); el.src = RB.full(art); },

    // The opening: a real logo reveal over stars. No fake loading: the dashboard is ready behind it, and a click skips it.
    intro(sound) {
      return new Promise(resolve => {
        const box = RB.$('#intro'), c = RB.$('#introStars');
        box.classList.add('on');
        const g = c.getContext('2d'), W = c.width = innerWidth, H = c.height = innerHeight;
        const stars = Array.from({ length: 180 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .2, a: Math.random() * 6.28 }));
        let on = true, t0 = performance.now();
        const frame = t => { if (!on) return; const e = (t - t0) / 1000; g.fillStyle = '#03041a'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * .6); gr.addColorStop(0, 'rgba(70,60,190,' + Math.min(.42, e * .3) + ')'); gr.addColorStop(1, 'rgba(3,4,26,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = '#dfe6ff'; for (const s of stars) { g.globalAlpha = Math.min(1, e * .8) * (.4 + .6 * Math.abs(Math.sin(s.a + e * 1.3))); g.beginPath(); g.arc(s.x, s.y - e * 3, s.r, 0, 6.283); g.fill(); } g.globalAlpha = 1; requestAnimationFrame(frame); };
        requestAnimationFrame(frame);
        if (sound) {
          try {
            audio = new Audio('art/ambient.mp3'); audio.volume = 0; audio.loop = false;
            audio.play().then(() => { let v = 0; const up = setInterval(() => { v = Math.min(.22, v + .02); if (audio) audio.volume = v; if (v >= .22) clearInterval(up); }, 80); }).catch(() => {});
          } catch (_) {}
        }
        let finished = false;
        const end = () => {
          if (finished) return; finished = true;
          box.classList.add('out');
          if (audio) { const a = audio; let v = a.volume; const down = setInterval(() => { v -= .012; if (v <= 0) { clearInterval(down); a.pause(); a.src = ''; if (audio === a) audio = null; } else a.volume = v; }, 90); }
          resolve();
          setTimeout(() => { on = false; box.remove(); }, 650);
        };
        box.addEventListener('click', end); document.addEventListener('keydown', end, { once: true });
        setTimeout(end, 2100);
      });
    },

    launch(status) {
      const el = document.createElement('div'); el.id = 'launchfx';
      el.innerHTML = '<div class="wash"></div><div class="ring"></div><div class="st">' + RB.esc(status) + '</div>';
      document.body.appendChild(el);
      return () => { el.style.transition = 'opacity .25s'; el.style.opacity = 0; setTimeout(() => el.remove(), 260); };
    },
  };
})();
