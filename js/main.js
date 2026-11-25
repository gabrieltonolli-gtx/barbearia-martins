/* Barbearia Martins — interações e animações
   GSAP + ScrollTrigger: entrada do hero, parallax, ciência fixada, linha do ritual.
   Motion: revelações em viewport, contagem da nota, barras de avaliação.
   Padrões 21st.dev adaptados para JS puro: spotlight card e botão magnético. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var M = window.Motion || null;
  if (reduced) doc.classList.add('is-reduced');

  /* ---------- ano no rodapé ---------- */
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- loader + entrada do hero ---------- */
  var loader = document.querySelector('.loader');
  function removeLoader() { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }
  var safety = setTimeout(removeLoader, 3000);

  function heroIntro() {
    if (!hasGsap || reduced) { removeLoader(); return; }
    var gsap = window.gsap;
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.loader__pole span', { scaleX: 1, duration: 0.55, ease: 'power2.inOut' })
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut', onComplete: function () { clearTimeout(safety); removeLoader(); } })
      .from('.hero__media img', { scale: 1.18, duration: 1.8 }, '<0.1')
      .from('.hero__eyebrow', { y: 20, autoAlpha: 0, duration: 0.8 }, '<0.3')
      .from('.hero__title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.09 }, '<0.05')
      .to('.hero__razor', { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }, '<0.2')
      .to('.hero__razor', { autoAlpha: 0, duration: 0.6 })
      .from('.hero__lead', { y: 24, autoAlpha: 0, duration: 0.9 }, '<-0.9')
      .from('.hero__actions > *', { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, '<0.1')
      .from('.hero__facts li', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, '<0.1');
  }
  if (document.readyState === 'complete') heroIntro();
  else window.addEventListener('load', heroIntro, { once: true });

  /* ---------- navegação ---------- */
  var nav = document.querySelector('.nav');
  var dock = document.querySelector('.dock');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (dock) dock.classList.toggle('is-hidden', y < window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.nav__burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      if (hasGsap && !reduced) {
        window.gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.inOut' });
        window.gsap.from('.menu__list a', { y: 40, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: 'expo.out', delay: 0.2 });
      }
      var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true });
    } else {
      menu.hidden = true;
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024 && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  /* ---------- spotlight (21st.dev) ---------- */
  if (finePointer) {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- botão magnético (21st.dev) ---------- */
  if (finePointer && hasGsap && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var xTo = window.gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      var yTo = window.gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      btn.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- revelações com Motion ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (M && M.inView && !reduced) {
    M.inView('.services__grid, .team__list', function (info) {
      var items = (info.target || info).querySelectorAll('.reveal');
      M.animate(items, { opacity: [0, 1], y: [24, 0] },
        { duration: 0.7, delay: M.stagger(0.08), ease: [0.22, 1, 0.36, 1] });
    }, { amount: 0.15 });
  } else {
    reveals.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ---------- contagem da nota e barras (Motion) ---------- */
  function fmt(v, dec) { return v.toFixed(dec).replace('.', ','); }
  var counts = document.querySelectorAll('.count');
  var bars = document.querySelectorAll('.bars b');
  function finishReviews() {
    counts.forEach(function (c) { c.textContent = fmt(parseFloat(c.dataset.to), +c.dataset.dec); });
    bars.forEach(function (b) { b.style.width = b.dataset.w + '%'; });
  }
  if (M && M.inView && M.animate && !reduced) {
    M.inView('.reviews', function () {
      counts.forEach(function (c) {
        var to = parseFloat(c.dataset.to), dec = +c.dataset.dec;
        M.animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: function (v) { c.textContent = fmt(v, dec); } });
      });
      bars.forEach(function (b, i) {
        M.animate(b, { width: ['0%', b.dataset.w + '%'] }, { duration: 1.2, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] });
      });
    }, { amount: 0.3 });
  } else {
    finishReviews();
  }

  /* ---------- GSAP ScrollTrigger ---------- */
  if (!hasGsap || typeof window.ScrollTrigger === 'undefined') {
    document.querySelector('.science').classList.add('no-pin');
    return;
  }
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var mm = gsap.matchMedia();

  mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, function (ctx) {
    var c = ctx.conditions;
    if (!c.motion) {
      if (c.desktop) document.querySelector('.science').classList.add('no-pin');
      return function () { document.querySelector('.science').classList.remove('no-pin'); };
    }

    /* parallax do hero */
    gsap.to('.hero__media', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* marquee acelera com a rolagem */
    var track = document.querySelector('.marquee__track');
    window.ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        var v = Math.min(Math.abs(self.getVelocity()) / 800, 3);
        track.style.animationDuration = (32 / (1 + v)) + 's';
      }
    });

    /* foto de serviços com leve zoom de entrada */

    /* ritual da barba: linha listrada enche com a rolagem */
    gsap.fromTo('.steps__line b', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 50%', scrub: true } });
    gsap.from('.steps li', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } });
    gsap.from('.beard__strip figure', { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.beard__strip', start: 'top 90%', once: true } });

    /* fechamento: título entra linha a linha */
    gsap.from('.close__title span', { yPercent: 60, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.close', start: 'top 70%', once: true } });

    if (c.desktop) {
      /* ciência: seção fixada, a lente troca de imagem a cada capítulo */
      var chapters = gsap.utils.toArray('.chapter');
      var lensImgs = gsap.utils.toArray('.lens__view img');
      var countEl = document.querySelector('.science__count');
      var bar = document.querySelector('.science__progress b');
      var current = 0;
      function setChapter(i) {
        if (i === current) return;
        chapters[current].classList.remove('is-active'); lensImgs[current].classList.remove('is-active');
        chapters[i].classList.add('is-active'); lensImgs[i].classList.add('is-active');
        countEl.textContent = '0' + (i + 1);
        current = i;
      }
      var st = window.ScrollTrigger.create({
        trigger: '.science', start: 'top top', end: '+=' + (chapters.length * 70) + '%',
        pin: true, scrub: true, anticipatePin: 1,
        onUpdate: function (self) {
          var i = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
          setChapter(i);
          bar.style.transform = 'scaleX(' + Math.max(0.25, (self.progress * (chapters.length - 1) + 1) / chapters.length) + ')';
        }
      });
      gsap.to('.lens__ring', { rotate: 120, ease: 'none', scrollTrigger: { trigger: '.science', start: 'top top', end: function () { return st.end; }, scrub: true } });
      gsap.from('.lens', { scale: 0.7, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.science', start: 'top 70%', once: true } });
      return function () { chapters.forEach(function (ch, i) { ch.classList.toggle('is-active', i === 0); }); lensImgs.forEach(function (im, i) { im.classList.toggle('is-active', i === 0); }); current = 0; };
    } else {
      gsap.utils.toArray('.chapter').forEach(function (ch) {
        gsap.from(ch.querySelector('.chapter__img'), { scale: 0.6, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: ch, start: 'top 85%', once: true } });
      });
    }
  });

  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
