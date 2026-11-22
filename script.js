const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/HPBRA7H5SE';
const TG_LINK = 'https://t.me/Olesyasevergina';
const BOT_LINK = 'https://t.me/PsySeverBot';
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const safe = fn => { try { fn(); } catch (e) { console.error(e); } };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  const NS = 'http://www.w3.org/2000/svg';
  const mkEl = (tag, cls, t) => { const e = document.createElement(tag); if (cls) e.className = cls; if (t) e.textContent = t; return e; };
  const toForm = svc => {
    const s = $('#svc'); if (s && svc) s.value = svc;
    scrollTo({ top: $('#form').getBoundingClientRect().top + scrollY - 56, behavior: reduce ? 'auto' : 'smooth' });
  };

  const bar = $('#bar');
  const fb = () => bar.classList.toggle('show', scrollY > 30);
  addEventListener('scroll', fb, { passive: true }); fb();

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const t = $(h); if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 56, behavior: reduce ? 'auto' : 'smooth' });
  }));

  // ===== knots: клубок линий, который распутывается (e: 0 клубок, 1 ровное кольцо) =====
  const C0 = [212, 85, 60], C1 = [42, 124, 118];
  const knots = [];
  function makeKnot(path, cx, cy, rx, ry, N, loops, seed, wMin, wMax) {
    const A = [], B = [], ph = seed * 1.7;
    for (let k = 0; k <= N; k++) {
      const t = k / N, ang = t * Math.PI * 2 * loops + ph;
      const n = 0.62 + 0.38 * Math.sin(k * 0.37 + seed) * Math.cos(k * 0.173 + seed * 2.1);
      A.push([cx + rx * n * Math.cos(ang), cy + ry * n * Math.sin(ang + 0.5 * Math.sin(k * 0.21))]);
      const ac = t * Math.PI * 2 + ph;
      B.push([cx + rx * Math.cos(ac), cy + ry * Math.sin(ac)]);
    }
    const K = { path, A, B, e: 0, target: 0, up: .6, down: 6, vis: true, w0: wMin, w1: wMax, amp: Math.max(rx, ry) * 0.012, dirty: true };
    knots.push(K); return K;
  }
  function drawKnot(K, time) {
    const e = ease(clamp(K.e)), j = (1 - e) * K.amp;
    let d = '';
    for (let k = 0; k < K.A.length; k++) {
      const a = K.A[k], b = K.B[k];
      const x = a[0] + (b[0] - a[0]) * e + (j ? Math.sin(time * 7 + k * 1.3) * j : 0);
      const y = a[1] + (b[1] - a[1]) * e + (j ? Math.cos(time * 6 + k * 0.9) * j : 0);
      d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    K.path.setAttribute('d', d);
    K.path.setAttribute('stroke', 'rgb(' + C0.map((c, i) => Math.round(c + (C1[i] - c) * e)).join(',') + ')');
    K.path.setAttribute('stroke-width', (K.w0 + (K.w1 - K.w0) * e).toFixed(2));
  }
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    knots.forEach(K => {
      if (!K.vis) return;
      if (!K.manual && K.e !== K.target) {
        const r = (K.target > K.e ? K.up : K.down) * dt;
        K.e = Math.abs(K.target - K.e) <= r ? K.target : K.e + Math.sign(K.target - K.e) * r;
        K.dirty = true;
      }
      if (K.dirty || K.e < 0.999) { drawKnot(K, now / 1000); K.dirty = false; }
    });
    requestAnimationFrame(loop);
  };
  const track = (K, el) => { if (!('IntersectionObserver' in window)) return; K.vis = false; new IntersectionObserver(en => { K.vis = en[0].isIntersecting; K.dirty = true; }, { rootMargin: '80px' }).observe(el); };
  const finish = () => { if (reduce) knots.forEach(K => { K.e = K.target = 1; K.dirty = true; K.vis = true; drawKnot(K, 0); }); else requestAnimationFrame(loop); };

  // hero
  safe(() => {
    const fig = $('#breath'), p = $('#heroKnot'); if (!p) return;
    const K = makeKnot(p, 200, 200, 120, 120, 260, 5, 3.1, 3.2, 2.2);
    K.up = .42; K.down = 5; track(K, fig);
    const word = $('#breathWord');
    if (reduce) { K.e = K.target = 1; return; }
    setTimeout(() => { K.target = 1; }, 500);
    let inh = true; word.textContent = 'вдох';
    setInterval(() => { inh = !inh; word.textContent = inh ? 'вдох' : 'выдох'; }, 4000);
    if (matchMedia('(pointer:fine)').matches) {
      addEventListener('pointermove', e => {
        const r = fig.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const near = clamp(1 - d / (r.width * 0.65));
        K.target = near > 0.05 ? 1 - near * 0.92 : 1;
      }, { passive: true });
    }
    fig.addEventListener('pointerdown', () => { K.e = 0.08; K.target = 1; K.dirty = true; });
  });

  // ===== scroll scene: body knots =====
  safe(() => {
    const scene = $('#body'); if (!scene) return;
    const defs = [[180, 106, 24, 11], [180, 134, 17, 11], [180, 164, 92, 12], [180, 236, 52, 40], [180, 350, 62, 50]];
    const gK = $('#knots'), gH = $('#halos'), ks = [], hs = [];
    defs.forEach((d, i) => {
      const h = document.createElementNS(NS, 'ellipse');
      h.setAttribute('cx', d[0]); h.setAttribute('cy', d[1]); h.setAttribute('rx', d[2] * 1.5); h.setAttribute('ry', d[3] * 1.6); h.setAttribute('class', 'halo');
      gH.append(h); hs.push(h);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
      gK.append(p);
      const K = makeKnot(p, d[0], d[1], d[2], d[3], 110, i === 2 ? 4 : 3, i * 2.3 + 1, 2.8, 2);
      K.manual = true; K.amp = 1.3; ks.push(K); track(K, scene);
    });
    const steps = $$('#steps li'), cnt = $('#knotN');
    let lastSt = -1;
    const apply = p => {
      let left = 0;
      ks.forEach((K, i) => { K.e = clamp((p - (0.04 + i * 0.17)) / 0.13); K.dirty = true; if (K.e < 0.98) left++; });
      cnt.textContent = left;
      const st = p > 0.86 ? 5 : clamp(Math.floor((p - 0.02) / 0.17), 0, 4);
      if (st !== lastSt) {
        lastSt = st;
        steps.forEach((l, i) => l.classList.toggle('on', i === st));
        hs.forEach((h, i) => h.classList.toggle('on', i === st));
      }
    };
    if (reduce) { scene.classList.add('static'); ks.forEach(K => { K.vis = true; }); apply(1); steps.forEach(l => l.classList.add('on')); hs.forEach(h => h.classList.remove('on')); return; }
    let tick = false;
    const upd = () => { tick = false; const r = scene.getBoundingClientRect(); apply(clamp(-r.top / Math.max(1, r.height - innerHeight))); };
    const on = () => { if (!tick) { tick = true; requestAnimationFrame(upd); } };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); upd();
  });

  // ===== rows: small knots =====
  safe(() => {
    $$('#asks li').forEach((li, i) => {
      const p = $('path', li);
      const K = makeKnot(p, 35, 22, 28, 14, 90, 3, i * 1.9 + 0.5, 2.4, 1.8);
      K.amp = .6; K.up = .7; K.down = 5; track(K, li);
      if (reduce) return;
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { setTimeout(() => { K.target = 1; }, 200 + i * 140); io.disconnect(); } }, { threshold: .7 });
        io.observe(li);
      } else K.target = 1;
      li.addEventListener('pointerenter', () => { K.target = 0.1; });
      li.addEventListener('pointerleave', () => { K.target = 1; });
    });
  });
  finish();

  // ===== practice =====
  safe(() => {
    const box = $('#pr'); if (!box) return;
    box.querySelector('noscript')?.remove();
    const PH = ['не высовывайся', 'сначала другие', 'потерпи, так надо', 'не создавай проблем'];
    const OWN = ['Мне можно', 'Я имею право', 'Я выбираю', 'Я достаточно'];
    const VOICES = ['Мама', 'Папа', 'Учитель', 'Партнёр', 'Общество', 'Не знаю'];
    let phrase = '', stage = 0;
    const dots = () => { const d = mkEl('div', 'pr__dots'); for (let i = 0; i < 5; i++) d.append(mkEl('i', i <= stage ? 'on' : '')); return d; };
    const opts = (list, fn) => { const w = mkEl('div', 'opts'); list.forEach(t => { const b = mkEl('button', 'opt', t); b.type = 'button'; b.addEventListener('click', () => fn(t)); w.append(b); }); return w; };
    const phraseEl = (t, cls) => {
      const p = mkEl('div', 'phrase' + (cls ? ' ' + cls : ''));
      [...t].forEach((ch, i) => { const s = mkEl('span', '', ch); s.style.setProperty('--i', i); s.style.setProperty('--r', (i % 2 ? 1 : -1) * (6 + (i * 7) % 14)); p.append(s); });
      p.setAttribute('aria-label', t); return p;
    };
    const go = n => { stage = n; render(); };
    const render = () => {
      box.classList.remove('washing'); box.textContent = '';
      const body = mkEl('div', 'fade'); body.style.cssText = 'display:flex;flex-direction:column;gap:16px;flex:1';
      box.append(dots(), body);
      if (stage === 0) {
        body.append(mkEl('h3', '', 'Какая фраза управляет вами, но не принадлежит вам?'), mkEl('p', 'pr__sub', 'Первая пришедшая мысль и есть она. Не анализируйте, просто выберите.'));
        body.append(opts(PH, t => { phrase = t; go(1); }));
        const own = mkEl('form', 'pr__own'), inp = mkEl('input'); inp.type = 'text'; inp.maxLength = 40; inp.placeholder = 'или впишите свою'; inp.setAttribute('aria-label', 'Своя фраза');
        const ok = mkEl('button', 'btn btn--sm', 'Дальше'); ok.type = 'submit';
        own.append(inp, ok); own.addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (v) { phrase = v; go(1); } });
        body.append(own);
      } else if (stage === 1) {
        body.append(mkEl('h3', '', 'Чей это голос?'), phraseEl(phrase), mkEl('p', 'pr__sub', 'Важно не обвинить, а отделить. Голос мог принадлежать любому.'));
        body.append(opts(VOICES, () => go(2)));
      } else if (stage === 2) {
        body.append(mkEl('h3', '', 'Вода'), phraseEl(phrase), mkEl('p', 'pr__sub', 'Скажите вслух или мысленно: «Я благодарю этот голос за то, что он когда-то помогал мне. Теперь я возвращаю его владельцу. Я выбираю своё». Затем смойте фразу.'));
        const a = mkEl('div', 'pr__actions'), b = mkEl('button', 'btn', 'Смыть водой'); b.type = 'button';
        b.addEventListener('click', () => { b.disabled = true; box.classList.add('washing'); setTimeout(() => go(3), reduce ? 200 : 2300); });
        a.append(b); body.append(a);
        const w = mkEl('div', 'water'); w.innerHTML = '<svg viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 24Q50 2 100 24T200 24T300 24T400 24V46H0Z" fill="rgba(42,124,118,.26)"/></svg>'; box.append(w);
      } else if (stage === 3) {
        body.append(mkEl('h3', '', 'Какая фраза теперь ваша?'), mkEl('p', 'pr__sub', 'Выберите ту, что откликается. Можно произнести её вслух.'));
        body.append(opts(OWN, t => { phrase = t; go(4); }));
      } else {
        body.classList.add('res');
        body.append(mkEl('span', 'eyebrow', 'Ваша фраза'), phraseEl(phrase, 'own'), mkEl('p', '', 'Может прийти лёгкость, сопротивление, злость или слёзы. Это нормально: вы убираете не грязь, а внутреннюю программу.'));
        const a = mkEl('div', 'pr__actions');
        const g = mkEl('a', 'btn', 'Полный гайд в Telegram-боте'); g.href = BOT_LINK; g.target = '_blank'; g.rel = 'noopener';
        const s = mkEl('a', 'btn btn--ghost', 'Разобрать на сессии'); s.href = '#form'; s.addEventListener('click', e => { e.preventDefault(); toForm('Сессия онлайн (1 час)'); });
        const r = mkEl('button', 'btn btn--ghost', 'Заново'); r.type = 'button'; r.addEventListener('click', () => go(0));
        a.append(g, s, r); body.append(a);
      }
    };
    render();
  });

  // ===== price =====
  safe(() => {
    const M = {
      one: ['3 000', 'Сессия онлайн, 1 час', 'Подойдёт, чтобы попробовать формат и разобрать один запрос.', 1, 'Сессия онлайн (1 час)'],
      five: ['12 000', 'Пакет из 5 сессий', 'Пять отдельных сессий стоили бы 15 000 ₽, пакетом выходит 2 400 ₽ за сессию. Для работы с запросом не за один раз.', 5, 'Пакет из 5 сессий']
    };
    const num = $('#pNum'), t = $('#pTitle'), x = $('#pText'), g = $('#pDots');
    let cur = 'one', svc = M.one[4], raf;
    const dots = n => {
      g.textContent = '';
      if (n > 1) { const l = document.createElementNS(NS, 'path'); l.setAttribute('d', 'M20 15H260'); l.setAttribute('stroke', '#2A7C76'); l.setAttribute('stroke-width', '2'); l.setAttribute('opacity', '.4'); g.append(l); }
      for (let i = 0; i < 5; i++) {
        const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 20 + i * 60); c.setAttribute('cy', 15); c.setAttribute('r', 8);
        const on = i < n; c.setAttribute('fill', on ? '#2A7C76' : '#F7F3EC'); c.setAttribute('stroke', on ? '#2A7C76' : 'rgba(43,36,48,.3)'); c.setAttribute('stroke-width', '2');
        g.append(c);
      }
    };
    const fmt = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const set = k => {
      const prev = parseInt(num.textContent.replace(/\D/g, ''), 10), to = parseInt(M[k][0].replace(/\D/g, ''), 10);
      cur = k; svc = M[k][4]; t.textContent = M[k][1]; x.textContent = M[k][2]; dots(M[k][3]);
      cancelAnimationFrame(raf);
      if (reduce) { num.textContent = fmt(to); return; }
      const t0 = performance.now();
      const f = n => { const p = clamp((n - t0) / 700); num.textContent = fmt(prev + (to - prev) * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(f); };
      raf = requestAnimationFrame(f);
    };
    $$('[data-m]').forEach(b => b.addEventListener('click', () => set(b.dataset.m)));
    $('#pBtn').addEventListener('click', e => { e.preventDefault(); toForm(svc); });
    dots(1);
  });

  // ===== form =====
  const form = $('#leadForm');
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent, msg = $('#msg');
    const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    msg.textContent = '';
    if (!payload.name.trim() || !payload.contact.trim()) { msg.textContent = 'Укажите имя и телефон или Telegram.'; return; }
    if (!form.consent.checked) { msg.textContent = 'Отметьте согласие на обработку персональных данных.'; return; }
    payload.phone = payload.contact;
    payload.comment = 'Услуга: ' + payload.service + (payload.comment ? '. ' + payload.comment : '');
    delete payload.consent;
    const tgText = 'Заявка с сайта. Имя: ' + payload.name + '. Контакт: ' + payload.contact + '. ' + payload.comment;
    const tgLink = TG_LINK + '?text=' + encodeURIComponent(tgText);
    btn.disabled = true; btn.textContent = 'Отправляем...';
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      msg.textContent = 'Заявка отправлена. Скоро свяжемся.'; form.reset();
    } catch (err) {
      console.error(err);
      msg.textContent = 'Заявка не ушла автоматически. Отправьте её одним касанием в Telegram: ';
      const a = document.createElement('a'); a.href = tgLink; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'отправить в Telegram';
      msg.append(a, '. Текст уже готов, останется нажать «Отправить».');
    } finally {
      clearTimeout(timer); btn.disabled = false; btn.textContent = orig;
    }
  });
})();
