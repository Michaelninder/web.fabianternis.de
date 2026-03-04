/**
 * Fabian Ternis — Portfolio Landing Page
 * script.js
 *
 * Handles:
 *  1. Loader progress animation (RAF-based counter)
 *  2. Loader shutter-open reveal
 *  3. Staggered content entrance sequence
 *  4. Prefers-reduced-motion fallback
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

  /* ── Motion preference ────────────────────────── */
  const reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

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
    /* Unlock scroll and mark main as visible */
    document.body.classList.add('revealed');
    main.removeAttribute('aria-hidden');
    main.classList.add('is-visible');

    /* Animate heading lines in */
    nlFabian.classList.add('is-in');

    delay(110, function () {
      nlTernis.classList.add('is-in');
    });

    delay(340, function () {
      siteRole.classList.add('is-in');
    });

    /* Stagger buttons */
    delay(560, function () { btnWork.classList.add('is-in'); });
    delay(680, function () { btnDomains.classList.add('is-in'); });
    delay(800, function () { btnHire.classList.add('is-in'); });
  }

  /* ── Open loader (shutter) ────────────────────── */
  function openLoader() {
    loader.classList.add('split');

    /* After the CSS transition (720ms) + small buffer */
    delay(820, function () {
      loader.hidden = true;
      revealContent();
    });
  }

  /* ── Loader animation (RAF) ───────────────────── */
  var loaderStart  = null;
  var loaderDur    = 1100; /* ms — how long progress takes */

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
      /* Brief pause at 100 before opening */
      delay(200, openLoader);
    }
  }

  /* ── Tiny helper: setTimeout wrapper ─────────── */
  function delay(ms, fn) {
    return setTimeout(fn, ms);
  }

  /* ── Boot ─────────────────────────────────────── */
  if (reducedMotion) {
    /* Skip all animations — just show content */
    if (loader) loader.hidden = true;
    document.body.classList.add('revealed');
    main.removeAttribute('aria-hidden');
    main.classList.add('is-visible');
    /* Force visible states */
    nlFabian.classList.add('is-in');
    nlTernis.classList.add('is-in');
    siteRole.classList.add('is-in');
    btnWork.classList.add('is-in');
    btnDomains.classList.add('is-in');
    btnHire.classList.add('is-in');
  } else {
    /* CSS already sets overflow:hidden on body until .revealed is added */
    requestAnimationFrame(loaderTick);
  }

  /* ── Keyboard: Enter/Space on buttons ────────── */
  [btnWork, btnDomains, btnHire].forEach(function (btn) {
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

}());
