/* ============================================================
   AGREXA motion engine — zero dependencies.
   - One orchestrated page-load sequence for above-the-fold
   - IntersectionObserver staggered reveals for scroll sections
   - rAF parallax (hero art), scroll progress bar, header compact
   - Count-up stats, smooth anchor scroll
   Fully disabled under prefers-reduced-motion; if JS fails,
   content simply stays visible (CSS hides only tagged nodes).
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    // respect reduced motion: stop the hero video, keep the poster
    var hv = doc.querySelector('.hero-v');
    if (hv) { hv.removeAttribute('autoplay'); hv.pause(); }
    return; // static site, nothing hidden, CSS guards too
  }

  // data-saver / very slow connections: skip video playback, keep poster
  var conn = navigator.connection || {};
  if (conn.saveData || /2g$/i.test(conn.effectiveType || '')) {
    var hv2 = doc.querySelector('.hero-v');
    if (hv2) { hv2.removeAttribute('autoplay'); hv2.pause(); }
  }

  var doc = document;
  var html = doc.documentElement;

  /* ---------- 1. tag elements ---------- */
  // groups that stagger their children
  var GROUPS = '.grid, .steps, .check-list, .stats, .values, .timeline';
  // standalone blocks that fade in as a unit
  var SOLO = [
    '.callout', '.pf-block', '.map-frame', 'form', '.table',
    '.alert', '.booking-note', '.form-note', '.mono-tag', '.value-pill'
  ];

  var groups = doc.querySelectorAll(GROUPS);
  Array.prototype.forEach.call(groups, function (g) {
    var kids = g.children;
    for (var i = 0; i < kids.length; i++) {
      if (kids[i].closest('.hero, .page-hero')) continue; // hero handled separately
      kids[i].setAttribute('data-mo', 'fade');
      kids[i].style.setProperty('--d', Math.min(i * 90, 540) + 'ms');
    }
  });

  SOLO.forEach(function (sel) {
    doc.querySelectorAll(sel).forEach(function (el) {
      if (!el.hasAttribute('data-mo')) el.setAttribute('data-mo', 'fade');
    });
  });

  // splits: left column slides from left, right from right
  doc.querySelectorAll('.split').forEach(function (sp) {
    var cols = sp.children;
    if (cols[0]) cols[0].setAttribute('data-mo', 'left');
    if (cols[1]) cols[1].setAttribute('data-mo', 'right');
  });

  // above-the-fold: hero + page-hero internals (play on load, sequenced)
  var aboveFold = [];
  ['.hero-eyebrow', 'h1', '.lead', '.hero-ctas', '.hero-trust'].forEach(function (sel, i) {
    doc.querySelectorAll('.hero-video ' + sel).forEach(function (el) {
      el.setAttribute('data-mo', 'fade');
      aboveFold.push({ el: el, delay: 80 + i * 130 });
    });
  });
  doc.querySelectorAll('.hero-video .hero-card').forEach(function (el) {
    el.setAttribute('data-mo', 'fade');
    aboveFold.push({ el: el, delay: 900 });
  });
  ['.crumb', 'h1', '.lead'].forEach(function (sel, i) {
    doc.querySelectorAll('.page-hero ' + sel).forEach(function (el) {
      if (el.dataset.mo) return;
      el.setAttribute('data-mo', 'fade');
      aboveFold.push({ el: el, delay: 80 + i * 130 });
    });
  });

  // center-head sections
  doc.querySelectorAll('.center-head').forEach(function (el) {
    if (!el.dataset.mo) el.setAttribute('data-mo', 'fade');
  });

  /* ---------- 2. arm CSS (hidden state) ---------- */
  html.classList.add('mo');

  /* ---------- 3. reveal helpers ---------- */
  function reveal(el) { el.classList.add('in'); }

  function revealWithDelay(el, delay) {
    el.style.setProperty('--d', delay + 'ms');
    reveal(el);
  }

  // count-up stats
  function countUp(el) {
    var txt = el.textContent.trim();
    var m = txt.match(/([^\d]*)([\d.]+)(.*)/);
    if (!m) return;
    var pre = m[1] || '', end = parseFloat(m[2]), suf = m[3] || '';
    var t0 = null, dur = 1300;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = pre + Math.round(end * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counted = false;
  function maybeCount() {
    if (counted) return;
    counted = true;
    doc.querySelectorAll('.stats strong').forEach(function (s, i) {
      setTimeout(function () { countUp(s); }, 200 + i * 120);
    });
  }

  // above-the-fold load sequence (double rAF so styles apply first)
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      aboveFold.forEach(function (o) { revealWithDelay(o.el, o.delay); });
      setTimeout(maybeCount, 600);
    });
  });

  /* ---------- 4. scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      reveal(en.target);
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  doc.querySelectorAll('[data-mo]').forEach(function (el) {
    if (aboveFold.some(function (o) { return o.el === el; })) return;
    io.observe(el);
  });
  doc.querySelectorAll('.stats').forEach(function (s) { io.observe(s); }); // counters trigger

  /* ---------- 5. rAF scroll effects: progress, header, parallax ---------- */
  var bar = doc.createElement('div');
  bar.id = 'agx-progress';
  doc.body.appendChild(bar);

  var header = doc.querySelector('header.site');
  var heroArt = doc.querySelector('.hero-v');
  var pageHeroH1 = doc.querySelector('.page-hero h1');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

      if (header) header.classList.toggle('scrolled', y > 24);

      if (heroArt && y < window.innerHeight) {
        var r = heroArt.getBoundingClientRect();
        if (r.bottom > 0) {
          heroArt.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px) scale(1.06)';
        }
      }
      if (pageHeroH1 && y < 600) {
        pageHeroH1.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px)';
        pageHeroH1.style.opacity = String(1 - y / 700);
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 6. magnetic CTA buttons (fine pointers only) ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    doc.querySelectorAll('.btn-green, .call-desk').forEach(function (btn) {
      btn.classList.add('magnet');
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (dx * 6).toFixed(1) + 'px,' + (dy * 5 - 2).toFixed(1) + 'px) scale(1.05)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 7. smooth anchor scroll ---------- */
  doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = doc.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
