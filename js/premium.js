/* Martins Premium — animações próprias da página (chamadas pelo main.js via window.pageMotion).
   No computador, as 5 dicas kids viram um trilho horizontal fixado que anda com a rolagem.
   No celular e com movimento reduzido, as dicas ficam empilhadas e legíveis sem animação. */
window.pageMotion = function (gsap, cond) {
  'use strict';
  var ST = window.ScrollTrigger;
  var tips = document.querySelector('.tips');
  var track = document.querySelector('.tips__track');
  var cleanups = [];

  /* foto do "sobre" abre como uma cortina dourada */
  gsap.fromTo('.about__photo', { clipPath: 'inset(0 0 100% 0 round 22px)' }, {
    clipPath: 'inset(0 0 0% 0 round 22px)', duration: 1.3, ease: 'expo.inOut',
    scrollTrigger: { trigger: '.about__photo', start: 'top 80%', once: true }
  });

  /* ofertas kids sobem com leve rotação, como cartões sendo colocados na mesa */
  gsap.from('.offer', { y: 40, rotate: function (i) { return i ? 2 : -2; }, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'expo.out',
    scrollTrigger: { trigger: '.kids__offers', start: 'top 85%', once: true } });

  if (cond.desktop && tips && track) {
    tips.classList.add('tips--h');
    ST.refresh();
    var distance = function () { return Math.max(0, track.scrollWidth - track.parentElement.clientWidth); };
    var tween = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: tips, start: 'center center', end: function () { return '+=' + distance(); },
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    /* cada dica gira de leve e ganha destaque ao passar pelo centro */
    gsap.utils.toArray('.tip').forEach(function (tip) {
      gsap.fromTo(tip, { rotate: 3, scale: 0.94 }, { rotate: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: tip, containerAnimation: tween, start: 'left 95%', end: 'left 45%', scrub: true } });
    });
    cleanups.push(function () { tips.classList.remove('tips--h'); gsap.set(track, { clearProps: 'transform' }); });
  } else if (tips) {
    gsap.from('.tip', { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.tips__track', start: 'top 85%', once: true } });
  }

  return function () { cleanups.forEach(function (fn) { fn(); }); };
};
