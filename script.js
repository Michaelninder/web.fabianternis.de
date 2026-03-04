/* ════════════════════════════════════════════════════════════
   FABIAN TERNIS — Portfolio
   script.js
   ════════════════════════════════════════════════════════════

   Modules:
   A. Utilities
   B. Reduced-motion flag
   C. Custom Cursor
   D. Loader / Reveal Sequence
   E. Text Scramble — Button 2 (Scroll Domains)
   F. Magnetic Button — Button 1 (View Work)
   G. Spark Particles — Button 3 (Hire Me)
   H. Keyboard / Accessibility polish
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════
   A. UTILITIES
   ════════════════════════════════════════════════════════════ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const rand = (a, b) => Math.random() * (b - a) + a;

/* ════════════════════════════════════════════════════════════
   B. REDUCED-MOTION
   ════════════════════════════════════════════════════════════ */

const NO_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ════════════════════════════════════════════════════════════
   C. CUSTOM CURSOR
   Smooth-following ring + accent dot.
   Only activates on pointer:fine (mouse) devices.
   ════════════════════════════════════════════════════════════ */

(function initCursor () {

  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mx = -200, my = -200;   // mouse position
  let rx = -200, ry = -200;   // ring follower position

  /* ── Move dot instantly ── */
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  });

  /* ── Ring follows with smooth lerp ── */
  const LERP = 0.13;
  (function trackRing () {
    rx += (mx - rx) * LERP;
    ry += (my - ry) * LERP;
    ring.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    requestAnimationFrame(trackRing);
  })();

  /* ── Hover: enlarge ring and tint ── */
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  /* ── Hide ring when cursor leaves viewport ── */
  document.addEventListener('mouseleave', () => ring.classList.add('gone'));
  document.addEventListener('mouseenter', () => ring.classList.remove('gone'));

})();


/* ════════════════════════════════════════════════════════════
   D. LOADER / REVEAL SEQUENCE
   Timeline:
     200 ms  — red seam line sweeps across
     750 ms  — FT brand fades + bounces up
     1 350 ms — curtain splits open
     2 200 ms — loader hidden, page.is-revealed added
   ════════════════════════════════════════════════════════════ */

(function initLoader () {

  const loader  = $('#loader');
  const page    = $('#page');
  if (!loader || !page) return;

  document.body.classList.add('is-loading');

  /* ── Skip animation for reduced-motion preference ── */
  if (NO_MOTION) {
    loader.style.display = 'none';
    document.body.classList.remove('is-loading');
    page.classList.add('is-revealed');
    return;
  }

  const T = 1; // time multiplier (set to 0 during dev to skip)

  function addPhase (cls, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        loader.classList.add(cls);
        resolve();
      }, delay * T);
    });
  }

  /* Run the sequence */
  addPhase('phase-line',  200)
    .then(() => addPhase('phase-brand', 750))
    .then(() => addPhase('phase-open',  1350))
    .then(() => {
      setTimeout(() => {
        loader.style.display = 'none';
        document.body.classList.remove('is-loading');
        page.classList.add('is-revealed');
      }, 2200 * T);
    });

  /* Safety fallback: reveal page after 4 s no matter what */
  setTimeout(() => {
    if (!page.classList.contains('is-revealed')) {
      loader.style.display = 'none';
      document.body.classList.remove('is-loading');
      page.classList.add('is-revealed');
    }
  }, 4000);

})();


/* ════════════════════════════════════════════════════════════
   E. TEXT SCRAMBLE — Button 2 (Scroll Domains)
   On mouseenter: characters randomise then resolve back to
   the original string, reading left-to-right.
   ════════════════════════════════════════════════════════════ */

(function initScramble () {

  if (NO_MOTION) return;

  const btn    = $('.btn--domains');
  if (!btn) return;
  const label  = btn.querySelector('[data-scramble]');
  if (!label) return;

  const original = label.textContent;
  const POOL     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&?!';
  const FPS      = 28;   // ms between frames
  const SPEED    = 0.55; // chars locked per frame

  let raf, iter;

  function scramble () {
    iter = 0;
    clearInterval(raf);

    raf = setInterval(() => {
      label.textContent = original
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iter)  return original[i];
          return POOL[Math.floor(Math.random() * POOL.length)];
        })
        .join('');

      iter += SPEED;

      if (iter >= original.length) {
        clearInterval(raf);
        label.textContent = original;
      }
    }, FPS);
  }

  function reset () {
    clearInterval(raf);
    label.textContent = original;
  }

  btn.addEventListener('mouseenter', scramble);
  btn.addEventListener('mouseleave', reset);
  btn.addEventListener('focus',      scramble);
  btn.addEventListener('blur',       reset);

})();


/* ════════════════════════════════════════════════════════════
   F. MAGNETIC BUTTON — Button 1 (View Work)
   Cursor pulls the button gently toward it while hovering.
   Button snaps back elastically on leave.
   ════════════════════════════════════════════════════════════ */

(function initMagnetic () {

  if (NO_MOTION) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const btn = $('.btn--work');
  if (!btn) return;

  const PULL = 0.28;   // fraction of offset to apply

  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'transform 0.1s linear';
  });

  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * PULL;
    const dy = (e.clientY - (r.top  + r.height / 2)) * PULL;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transition = 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)';
    btn.style.transform  = 'translate(0, 0)';
  });

})();


/* ════════════════════════════════════════════════════════════
   G. SPARK PARTICLES — Button 3 (Hire Me)
   On mouseenter: 10 coloured dots burst outward in all
   directions, then fade and remove themselves.
   A slow interval re-bursts every 700 ms while hovered.
   ════════════════════════════════════════════════════════════ */

(function initSparks () {

  if (NO_MOTION) return;

  const btn = $('.btn--hire');
  if (!btn) return;

  let ticker = null;

  function burst () {
    const r   = btn.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const N   = 11;

    for (let i = 0; i < N; i++) {
      const el  = document.createElement('div');
      el.classList.add('spark');

      /* Evenly spread + small random offset */
      const angle = ((i / N) * Math.PI * 2) + rand(-0.25, 0.25);
      const dist  = rand(32, 70);
      const dx    = Math.cos(angle) * dist;
      const dy    = Math.sin(angle) * dist;
      const size  = rand(3, 7);
      const dur   = rand(0.38, 0.62);

      el.style.cssText = `
        left: ${cx}px;
        top:  ${cy}px;
        width:  ${size}px;
        height: ${size}px;
        --dx:  ${dx}px;
        --dy:  ${dy}px;
        --dur: ${dur}s;
      `;

      document.body.appendChild(el);

      el.addEventListener('animationend', () => el.remove(), { once: true });
    }
  }

  btn.addEventListener('mouseenter', () => {
    burst();
    ticker = setInterval(burst, 700);
  });

  btn.addEventListener('mouseleave', () => {
    clearInterval(ticker);
    ticker = null;
  });

  /* Also fire on keyboard focus for accessibility */
  btn.addEventListener('focus', burst);

})();


/* ════════════════════════════════════════════════════════════
   H. ACCESSIBILITY POLISH
   ════════════════════════════════════════════════════════════ */

/* Add data-revealed marker once page is revealed
   so external tools / tests can detect readiness */
(function watchReveal () {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const page = m.target;
        if (page.classList.contains('is-revealed')) {
          document.body.setAttribute('data-loaded', 'true');
          observer.disconnect();
        }
      }
    }
  });

  const page = $('#page');
  if (page) observer.observe(page, { attributes: true });
})();
