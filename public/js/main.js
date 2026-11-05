// AGREXA shared utilities: language, nav, phone, toasts, forms
(function () {
  const LANG_KEY = 'agrexa-lang';
  const CACHE = {};

  async function loadDict(lang) {
    if (CACHE[lang]) return CACHE[lang];
    try {
      const r = await fetch('/i18n/' + lang + '.json');
      CACHE[lang] = await r.json();
      return CACHE[lang];
    } catch {
      return {};
    }
  }

  async function applyLang(lang, initial) {
    const dict = await loadDict(lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const t = dict[el.getAttribute('data-i18n')];
      if (t) el.innerHTML = t;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const t = dict[el.getAttribute('data-i18n-ph')];
      if (t) el.setAttribute('placeholder', t);
    });
    document.querySelectorAll('.langs button').forEach((b) =>
      b.classList.toggle('on', b.dataset.lang === lang)
    );
    if (!initial) localStorage.setItem(LANG_KEY, lang);
  }

  window.AGREXA = {
    lang: () => localStorage.getItem(LANG_KEY) || 'en',
    applyLang,
    tel(token) {
      return `tel:+91${token.replace(/\D/g, '')}`;
    },
    toast(msg, ok = true) {
      let t = document.querySelector('.toast');
      if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
      t.textContent = msg;
      t.classList.toggle('err', !ok);
      t.classList.add('show');
      clearTimeout(t._h);
      t._h = setTimeout(() => t.classList.remove('show'), 4200);
    },
    async postJSON(url, body) {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Request failed');
      return j;
    },
  };

  // boot i18n
  applyLang(window.AGREXA.lang(), true);

  // language buttons
  document.querySelectorAll('.langs button').forEach((b) =>
    b.addEventListener('click', () => applyLang(b.dataset.lang))
  );

  // mobile overlay navigation
  const burger = document.querySelector('.burger');
  const mnav = document.querySelector('.m-nav');
  if (burger && mnav) {
    const closeNav = () => {
      mnav.classList.remove('open');
      mnav.setAttribute('aria-hidden', 'true');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => {
      const open = !mnav.classList.contains('open');
      mnav.classList.toggle('open', open);
      mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mnav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  }
  // mobile accordion groups
  document.querySelectorAll('.m-group > button').forEach((b) =>
    b.addEventListener('click', () => b.parentElement.classList.toggle('open'))
  );

  // desktop dropdowns: click/fallback + outside close (hover handled by CSS)
  document.querySelectorAll('.drop-toggle').forEach((t) => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const li = t.parentElement;
      const wasOpen = li.classList.contains('open');
      document.querySelectorAll('.nav-links li.open').forEach((o) => {
        o.classList.remove('open');
        const b = o.querySelector('.drop-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { li.classList.add('open'); t.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-drop')) {
      document.querySelectorAll('.nav-links li.open').forEach((o) => {
        o.classList.remove('open');
        const b = o.querySelector('.drop-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // mark active nav (absolute-path aware)
  const here = (location.pathname.replace(/\/index\.html?$/, '').replace(/\/+$/, '')) || '/';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const h = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    if (h && h === here) a.classList.add('active');
  });

  // sticky header: transparent band → floating glass card
  const head = document.querySelector('header.site');
  const hasDark = !!document.querySelector('.hero-video');
  if (head) {
    let hsTick = false;
    const setHeadState = () => {
      const scrolled = window.scrollY > 18;
      head.classList.toggle('scrolled', scrolled);
      head.classList.toggle('over-dark', hasDark && !scrolled);
      hsTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!hsTick) { requestAnimationFrame(setHeadState); hsTick = true; }
    }, { passive: true });
    setHeadState();
  }

  // sliding green indicator under top-level nav items
  const linksUl = document.querySelector('.nav-links');
  const spool = document.querySelector('.nav-spool');
  if (linksUl && spool) {
    const restTargets = () =>
      linksUl.querySelector(':scope > li > a.active') ||
      linksUl.querySelector(':scope > li > a:hover') ||
      linksUl.querySelector(':scope > li > .drop-toggle:hover');
    let spoolTarget = null;
    const moveSpool = (t) => {
      if (!t) return;
      spoolTarget = t;
      const r = t.getBoundingClientRect();
      const ur = linksUl.getBoundingClientRect();
      spool.style.width = Math.max(14, r.width - 24) + 'px';
      spool.style.transform = 'translateX(' + (r.left - ur.left + 12) + 'px)';
      spool.style.opacity = '1';
    };
    const restSpool = (hide) => {
      const t = restTargets();
      if (t) moveSpool(t);
      else { spoolTarget = null; spool.style.opacity = '0'; spool.style.width = '0'; }
    };
    linksUl.querySelectorAll(':scope > li > a, :scope > li > .drop-toggle').forEach((t) => {
      t.addEventListener('mouseenter', () => moveSpool(t));
      t.addEventListener('focus', () => moveSpool(t));
    });
    linksUl.addEventListener('mouseleave', restSpool);
    window.addEventListener('resize', restSpool, { passive: true });
    // language switch changes widths — re-seat after text swap
    document.querySelectorAll('.langs button').forEach((b) =>
      b.addEventListener('click', () => setTimeout(restSpool, 120))
    );
    restSpool();
  }

  // accessible mobile accordion groups
  document.querySelectorAll('.m-group > button').forEach((b) =>
    b.addEventListener('click', () => {
      const open = b.parentElement.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
    })
  );

  // Escape dismisses open desktop dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-links li.open').forEach((o) => {
        o.classList.remove('open');
        const b = o.querySelector('.drop-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // accordion single-open
  document.querySelectorAll('.acc').forEach((box) => {
    box.querySelectorAll('details').forEach((d) =>
      d.addEventListener('toggle', () => {
        if (d.open) box.querySelectorAll('details').forEach((o) => { if (o !== d) o.open = false; });
      })
    );
  });
})();
