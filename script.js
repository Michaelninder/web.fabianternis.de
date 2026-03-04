/**
 * Fabian Ternis — Portfolio
 * Handles: loader dismissal, staggered reveal, cursor, scroll hint
 */

(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────── */
  const LOADER_DURATION  = 950;  // ms — matches CSS loader animation
  const REVEAL_BASE_MS   = 80;   // ms per stagger step
  const REVEAL_DELAY_MS  = 160;  // delay multiplier between items

  /* ── Elements ────────────────────────────────────────────── */
  const loader  = document.getElementById('loader');
  const reveals = [];            // filled on DOMContentLoaded

  /* ── Utility: stagger reveal ─────────────────────────────── */
  function scheduleReveal(el, delayIndex) {
    const base   = LOADER_DURATION + 100;
    const offset = delayIndex * REVEAL_DELAY_MS;
    setTimeout(() => {
      el.classList.add('is-visible');
    }, base + offset);
  }

  /* ── Dismiss loader ──────────────────────────────────────── */
  function dismissLoader() {
    setTimeout(() => {
      loader.classList.add('is-done');
    }, LOADER_DURATION);
  }

  /* ── Main init (DOMContentLoaded) ────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {

    // 1. Start loader dismiss sequence
    dismissLoader();

    // 2. Collect all [data-reveal] elements in DOM order
    const revealEls = document.querySelectorAll('[data-reveal]');

    revealEls.forEach((el) => {
      const delayAttr = el.getAttribute('data-delay');
      const delay     = delayAttr !== null ? parseInt(delayAttr, 10) : reveals.length;
      reveals.push({ el, delay });
    });

    // 3. Schedule each reveal
    reveals.forEach(({ el, delay }) => {
      scheduleReveal(el, delay);
    });

    // 4. CTA: add letter-by-letter data only (animation is CSS-driven)
    initCTALetters();

    // 5. Custom cursor dot
    initCursor();

    // 6. Keyboard shortcut hints (optional accessible tooltip on focus)
    initFocusIndicators();
  });

  /* ── Split label text into hoverable chars (CTA labels) ─── */
  function initCTALetters() {
    // Wrap each letter in a span so CSS :nth-child can stagger them
    document.querySelectorAll('.cta__label').forEach((label) => {
      const text = label.textContent;
      label.textContent = '';
      label.setAttribute('aria-label', text); // preserve a11y

      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.classList.add('cta__char');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--i', i);
        span.setAttribute('aria-hidden', 'true');
        label.appendChild(span);
      });
    });

    // Inject the per-char animation CSS dynamically
    injectCharStyles();
  }

  function injectCharStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cta__char {
        display: inline-block;
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                    color 0.25s ease;
        transition-delay: calc(var(--i) * 0.028s);
      }
      .cta--work:hover .cta__char {
        transform: translateY(-2px);
        color: #d4a853;
      }
      .cta--domains:hover .cta__char {
        transform: translateY(-3px) scale(1.05);
        transition-delay: calc(var(--i) * 0.035s);
      }
      .cta--hire:hover .cta__char {
        transform: translateY(-2px) rotate(-1deg);
        color: #3dba72;
        transition-delay: calc(var(--i) * 0.03s);
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Minimal crosshair cursor dot ───────────────────────── */
  function initCursor() {
    // Only on pointer devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = document.createElement('div');
    dot.setAttribute('aria-hidden', 'true');
    Object.assign(dot.style, {
      position: 'fixed',
      top: '0', left: '0',
      width: '6px', height: '6px',
      borderRadius: '50%',
      background: 'rgba(212,168,83,0.9)',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%,-50%)',
      transition: 'transform 0.12s ease, background 0.25s ease',
      willChange: 'transform',
    });
    document.body.appendChild(dot);

    let mx = -100, my = -100;
    let rafId;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          dot.style.left = mx + 'px';
          dot.style.top  = my + 'px';
          rafId = null;
        });
      }
    });

    // Enlarge dot on interactive elements
    const interactives = 'a, button, [tabindex]';
    document.querySelectorAll(interactives).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.style.transform = 'translate(-50%,-50%) scale(2.5)';
        dot.style.background = 'rgba(212,168,83,0.5)';
        dot.style.outline = '1px solid rgba(212,168,83,0.6)';
      });
      el.addEventListener('mouseleave', () => {
        dot.style.transform = 'translate(-50%,-50%) scale(1)';
        dot.style.background = 'rgba(212,168,83,0.9)';
        dot.style.outline = '';
      });
    });
  }

  /* ── Focus indicators for keyboard navigation ───────────── */
  function initFocusIndicators() {
    // Only show ring when using keyboard
    let usingKeyboard = false;

    document.addEventListener('keydown', () => { usingKeyboard = true; });
    document.addEventListener('mousedown', () => { usingKeyboard = false; });

    document.querySelectorAll('.cta').forEach((cta) => {
      cta.addEventListener('focus', () => {
        if (!usingKeyboard) return;
        cta.style.outlineOffset = '4px';
      });
      cta.addEventListener('blur', () => {
        cta.style.outlineOffset = '';
      });
    });
  }

})();
