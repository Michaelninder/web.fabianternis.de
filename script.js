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
 *  6. 3D tilt on WIP Tilt button (#btn-wip-tilt)
 *  7. Keyboard navigation
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
  const btnWipTilt  = document.getElementById('btn-wip-tilt');
  const btnWipSlice = document.getElementById('btn-wip-slice');
  const cursorDot   = document.getElementById('cursor-dot');

  const allBtns = [btnWork, btnDomains, btnHire, btnWipTilt, btnWipSlice].filter(Boolean);

  /* ── Motion / touch preference ───────────────── */
  const reducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  /* ── Easing ───────────────────────────────────── */
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Format counter ───────────────────────────── */
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
    delay(110,  function () { nlTernis.classList.add('is-in'); });
    delay(340,  function () { siteRole.classList.add('is-in'); });
    delay(560,  function () { btnWork.classList.add('is-in'); });
    delay(680,  function () { btnDomains.classList.add('is-in'); });
    delay(800,  function () { btnHire.classList.add('is-in'); });
    delay(920,  function () { if (btnWipTilt)  btnWipTilt.classList.add('is-in'); });
    delay(1020, function () { if (btnWipSlice) btnWipSlice.classList.add('is-in'); });
  }

  /* ── Open loader (shutter) ────────────────────── */
  function openLoader() {
    loader.classList.add('split');
    delay(820, function () {
      loader.hidden = true;
      revealContent();
    });
  }

  /* ── Loader RAF loop ──────────────────────────── */
  var loaderStart = null;
  var loaderDur   = 1100;

  function loaderTick(ts) {
    if (!loaderStart) loaderStart = ts;
    var elapsed = ts - loaderStart;
    var t       = Math.min(elapsed / loaderDur, 1);
    var pct     = easeInOutCubic(t) * 100;

    setProgress(pct);

    if (t < 1) {
      requestAnimationFrame(loaderTick);
    } else {
      setProgress(100);
      delay(200, openLoader);
    }
  }

  /* ── Helpers ──────────────────────────────────── */
  function delay(ms, fn) { return setTimeout(fn, ms); }

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

    (function animateDot() {
      dotX += (mouseX - dotX) * 0.18;
      dotY += (mouseY - dotY) * 0.18;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
      requestAnimationFrame(animateDot);
    }());

    allBtns.forEach(function (btn) {
      btn.addEventListener('mouseenter', function () { cursorDot.classList.add('on-btn'); });
      btn.addEventListener('mouseleave', function () { cursorDot.classList.remove('on-btn'); });
    });
  }

  /* ─────────────────────────────────────────────
     3D TILT — WIP Tilt button only
  ───────────────────────────────────────────── */
  if (!isTouchDevice && !reducedMotion && btnWipTilt) {
    var TILT = 10;

    btnWipTilt.addEventListener('mousemove', function (e) {
      var rect = btnWipTilt.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var rx   = ((e.clientY - cy) / (rect.height / 2)) * -TILT;
      var ry   = ((e.clientX - cx) / (rect.width  / 2)) *  TILT;

      btnWipTilt.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      btnWipTilt.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      btnWipTilt.classList.add('is-tilted');
    });

    btnWipTilt.addEventListener('mouseleave', function () {
      btnWipTilt.classList.remove('is-tilted');
      btnWipTilt.style.setProperty('--rx', '0deg');
      btnWipTilt.style.setProperty('--ry', '0deg');
    });
  }

  /* ─────────────────────────────────────────────
     KEYBOARD NAVIGATION
  ───────────────────────────────────────────── */
  allBtns.forEach(function (btn, i) {
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        allBtns[(i + 1) % allBtns.length].focus();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        allBtns[(i - 1 + allBtns.length) % allBtns.length].focus();
      }
    });
  });

  /* ── Boot ─────────────────────────────────────── */
  if (reducedMotion) {
    if (loader) loader.hidden = true;
    document.body.classList.add('revealed');
    main.removeAttribute('aria-hidden');
    main.classList.add('is-visible');
    [nlFabian, nlTernis, siteRole, btnWork, btnDomains, btnHire, btnWipTilt, btnWipSlice]
      .filter(Boolean)
      .forEach(function (el) { el.classList.add('is-in'); });
  } else {
    requestAnimationFrame(loaderTick);
  }

}());