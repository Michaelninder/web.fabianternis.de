/**
 * Fabian Ternis — Portfolio Landing Page
 * script.js
 *
 * Handles:
 *  1. Loader progress animation (RAF-based counter)
 *  2. Loader shutter-open reveal
 *  3. Staggered content entrance sequence
 *  4. Prefers-reduced-motion fallback
 *  5. Cursor dot follower
 *  6. 3D tilt effect on Scroll Domains button
 *  7. Click ripple on Hire Me button
 */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────── */
  const loader      = document.getElementById('loader');
  const loaderCount = document.getElementById('loader-count');
  const loaderBar   = document.getElementById('loader-bar-fill');
  const main        = document.getElementById('main');
  const nlFabian    = document.getElementById('nl-fabian');
  const nlTernis    = document.getElementById('nl-ternis');
  const siteRole    = document.getElementById('site-role');
  const btnWork     = document.getElementById('btn-work');
  const btnDomains  = document.getElementById('btn-domains');
  const btnHire     = document.getElementById('btn-hire');
  const cursorDot   = document.getElementById('cursor-dot');

  /* ── Motion / touch preference ───────────────── */
  const reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  /* ── Easing functions ─────────────────────────── */
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Format counter number ────────────────────── */
  function fmtCount(n) {
    return Math.floor(n).toString().padStart(2, '0');
  }

  /* ── Set ARIA progress ────────────────────────── */
  function setProgress(pct) {
    loader.setAttribute('aria-valuenow', Math.round(pct));
    loaderCount.textContent = fmtCount(pct);
    loaderBar.style.width   = pct + '%';
  }

  /* ── Content reveal ───────────────────────────── */
  function revealContent() {
    document.body.classList.add('revealed');
    main.removeAttribute('aria-hidden');
    main.classList.add('is-visible');

    nlFabian.classList.add('is-in');

    delay(110, function () {
      nlTernis.classList.add('is-in');
    });

    delay(340, function () {
      siteRole.classList.add('is-in');
    });

    delay(560, function () { btnWork.classList.add('is-in'); });
    delay(680, function () { btnDomains.classList.add('is-in'); });
    delay(800, function () { btnHire.classList.add('is-in'); });
  }

  /* ── Open loader (shutter) ────────────────────── */
  function openLoader() {
    loader.classList.add('split');

    delay(820, function () {
      loader.hidden = true;
      revealContent();
    });
  }

  /* ── Loader animation (RAF) ───────────────────── */
  var loaderStart = null;
  var loaderDur   = 1100;

  function loaderTick(ts) {
    if (!loaderStart) loaderStart = ts;
    var elapsed = ts - loaderStart;
    var t       = Math.min(elapsed / loaderDur, 1);
    var eased   = easeInOutCubic(t);
    var pct     = eased * 100;

    setProgress(pct);

    if (t < 1) {
      requestAnimationFrame(loaderTick);
    } else {
      setProgress(100);
      delay(200, openLoader);
    }
  }

  /* ── Tiny helper: setTimeout wrapper ─────────── */
  function delay(ms, fn) {
    return setTimeout(fn, ms);
  }

  /* ─────────────────────────────────────────────
     CURSOR DOT
  ───────────────────────────────────────────── */
  if (!isTouchDevice && !reducedMotion && cursorDot) {
    var dotX = 0, dotY = 0;
    var mouseX = 0, mouseY = 0;
    var dotVisible = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!dotVisible) {
        dotVisible = true;
        cursorDot.classList.add('visible');
        /* Snap to position on first appearance */
        dotX = mouseX;
        dotY = mouseY;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top  = dotY + 'px';
      }
    });

    document.addEventListener('mouseleave', function () {
      dotVisible = false;
      cursorDot.classList.remove('visible');
    });

    /* Smooth lag follow */
    function animateDot() {
      var dx = mouseX - dotX;
      var dy = mouseY - dotY;
      dotX += dx * 0.18;
      dotY += dy * 0.18;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
      requestAnimationFrame(animateDot);
    }
    animateDot();

    /* Swell on button hover */
    [btnWork, btnDomains, btnHire].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener('mouseenter', function () {
        cursorDot.classList.add('on-btn');
      });
      btn.addEventListener('mouseleave', function () {
        cursorDot.classList.remove('on-btn');
      });
    });
  }

  /* ─────────────────────────────────────────────
     3D TILT — Scroll Domains
  ───────────────────────────────────────────── */
  if (!isTouchDevice && !reducedMotion && btnDomains) {
    var TILT = 10; /* max degrees */

    btnDomains.addEventListener('mousemove', function (e) {
      var rect    = btnDomains.getBoundingClientRect();
      var cx      = rect.left + rect.width  / 2;
      var cy      = rect.top  + rect.height / 2;
      var rx      = ((e.clientY - cy) / (rect.height / 2)) * -TILT;
      var ry      = ((e.clientX - cx) / (rect.width  / 2)) *  TILT;

      btnDomains.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      btnDomains.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      btnDomains.classList.add('is-tilted');
    });

    btnDomains.addEventListener('mouseleave', function () {
      btnDomains.classList.remove('is-tilted');
      btnDomains.style.setProperty('--rx', '0deg');
      btnDomains.style.setProperty('--ry', '0deg');
    });
  }

  /* ─────────────────────────────────────────────
     CLICK RIPPLE — Hire Me
  ───────────────────────────────────────────── */
  if (btnHire) {
    /* Inject keyframes once */
    if (!document.getElementById('ripple-kf')) {
      var style = document.createElement('style');
      style.id  = 'ripple-kf';
      style.textContent = '@keyframes _ripple { to { transform: translate(-50%,-50%) scale(22); opacity: 0; } }';
      document.head.appendChild(style);
    }

    btnHire.addEventListener('click', function (e) {
      var rect   = btnHire.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.style.cssText =
        'position:absolute;' +
        'width:10px;height:10px;' +
        'background:rgba(243,240,232,0.35);' +
        'border-radius:50%;' +
        'left:' + (e.clientX - rect.left) + 'px;' +
        'top:'  + (e.clientY - rect.top)  + 'px;' +
        'transform:translate(-50%,-50%) scale(0);' +
        'animation:_ripple 0.55s ease-out forwards;' +
        'pointer-events:none;z-index:3;';
      btnHire.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 560);
    });
  }

  /* ─────────────────────────────────────────────
     KEYBOARD: Enter / Space on buttons
  ───────────────────────────────────────────── */
  [btnWork, btnDomains, btnHire].forEach(function (btn) {
    if (!btn) return;
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  /* ── Boot ─────────────────────────────────────── */
  if (reducedMotion) {
    if (loader) loader.hidden = true;
    document.body.classList.add('revealed');
    main.removeAttribute('aria-hidden');
    main.classList.add('is-visible');
    nlFabian.classList.add('is-in');
    nlTernis.classList.add('is-in');
    siteRole.classList.add('is-in');
    btnWork.classList.add('is-in');
    btnDomains.classList.add('is-in');
    btnHire.classList.add('is-in');
  } else {
    requestAnimationFrame(loaderTick);
  }

}());