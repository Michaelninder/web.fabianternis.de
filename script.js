/* ============================================================
   FABIAN TERNIS — PORTFOLIO
   script.js · Animations & Interactions
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────
   UTILITY
   ──────────────────────────────────────────────────────────── */

/**
 * Pad a number to two digits, e.g. 7 → "07".
 */
const pad2 = n => String(Math.floor(n)).padStart(2, '0');

/**
 * Schedule a one-shot callback after `ms` milliseconds.
 */
const after = (ms, fn) => setTimeout(fn, ms);

/* ────────────────────────────────────────────────────────────
   LOADING COUNTER ANIMATION
   Races from 0 → 100 with an eased curve before the curtain
   opens, giving the impression of real loading work.
   ──────────────────────────────────────────────────────────── */

function runCounter(el, duration, onComplete) {
    const start = performance.now();

    const tick = (now) => {
        const elapsed = now - start;
        const raw     = Math.min(elapsed / duration, 1);
        // Ease-out quad — fast at first, slows near 100
        const eased   = 1 - Math.pow(1 - raw, 2.2);
        const value   = Math.floor(eased * 100);

        el.textContent = pad2(value);

        if (raw < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = '100';
            onComplete();
        }
    };

    requestAnimationFrame(tick);
}

/* ────────────────────────────────────────────────────────────
   TEXT SCRAMBLE
   Progressively reveals text while filling unrevealed
   characters with random glyphs — a classic hacker effect.
   ──────────────────────────────────────────────────────────── */

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$·%—';

function scrambleText(el, target, duration, onDone) {
    const len   = target.length;
    let   start = null;
    let   raf   = null;

    function tick(timestamp) {
        if (!start) start = timestamp;

        const progress  = Math.min((timestamp - start) / duration, 1);
        const revealed  = Math.floor(progress * len);
        let   result    = '';

        for (let i = 0; i < len; i++) {
            if (i < revealed) {
                result += target[i];
            } else {
                result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
        }

        el.textContent = result;

        if (progress < 1) {
            raf = requestAnimationFrame(tick);
        } else {
            el.textContent = target;
            if (typeof onDone === 'function') onDone();
        }
    }

    raf = requestAnimationFrame(tick);

    return () => { if (raf) cancelAnimationFrame(raf); };
}

/* ────────────────────────────────────────────────────────────
   DOMAINS BUTTON — BORDER TRACE + TEXT SCRAMBLE
   ──────────────────────────────────────────────────────────── */

function initDomainsButton() {
    const btn      = document.querySelector('.btn--domains');
    const textEl   = document.getElementById('domainsText');
    const traceEl  = btn.querySelector('.trace__rect');
    const svgEl    = btn.querySelector('.btn__trace');

    if (!btn || !textEl || !traceEl) return;

    const originalText = btn.dataset.original || textEl.textContent;
    let   cancelScramble = null;

    /* ── Size the SVG rect to match the button exactly ── */
    function syncBorder() {
        const w = btn.offsetWidth;
        const h = btn.offsetHeight;

        svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
        traceEl.setAttribute('width',  w - 1);
        traceEl.setAttribute('height', h - 1);

        // Perimeter = total length of the closed rectangle path
        const perimeter = 2 * ((w - 1) + (h - 1));
        traceEl.setAttribute('stroke-dasharray',  perimeter);
        traceEl.setAttribute('stroke-dashoffset', perimeter); // starts hidden
        traceEl.style.strokeDasharray  = perimeter;
        traceEl.style.strokeDashoffset = perimeter;
    }

    syncBorder();

    // Re-sync on resize
    const ro = new ResizeObserver(syncBorder);
    ro.observe(btn);

    /* ── Mouse enter: draw the border + scramble text ── */
    btn.addEventListener('mouseenter', () => {
        // Animate the stroke-dashoffset to 0 (draws the full perimeter)
        traceEl.style.transition       = 'stroke-dashoffset 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
        traceEl.style.strokeDashoffset = '0';

        // Cancel any in-flight scramble and start a new one
        if (cancelScramble) cancelScramble();
        cancelScramble = scrambleText(textEl, originalText, 620);
    });

    /* ── Mouse leave: retrace back + restore text cleanly ── */
    btn.addEventListener('mouseleave', () => {
        const dash = traceEl.style.strokeDasharray;
        traceEl.style.transition       = 'stroke-dashoffset 0.4s cubic-bezier(0.87, 0, 0.13, 1)';
        traceEl.style.strokeDashoffset = dash; // hide again

        if (cancelScramble) { cancelScramble(); cancelScramble = null; }
        textEl.textContent = originalText;
    });
}

/* ────────────────────────────────────────────────────────────
   PAGE LOAD SEQUENCE
   Curtain → counter → reveal → stagger elements in
   ──────────────────────────────────────────────────────────── */

function initLoadSequence() {
    const curtain  = document.getElementById('curtain');
    const counter  = document.getElementById('curtainCounter');
    const gridlines = document.getElementById('gridlines');
    const eyebrow  = document.querySelector('.eyebrow');
    const nameEl   = document.getElementById('heroName');
    const subtitle = document.getElementById('heroSubtitle');
    const cta      = document.getElementById('ctaNav');
    const footer   = document.querySelector('.page-footer');

    // Step 1 — Run the loading counter (0 → 100 over ~900ms)
    runCounter(counter, 900, () => {

        // Step 2 — Fade out the counter, then open the curtain
        counter.classList.add('hidden');

        after(200, () => {
            curtain.classList.add('is-open');

            // Trigger gridlines after curtain starts opening
            after(400, () => {
                gridlines.classList.add('visible');
            });

            // Step 3 — Show eyebrow bar
            after(600, () => {
                eyebrow.classList.add('visible');
            });

            // Step 4 — Animate name characters in
            after(700, () => {
                const chars = nameEl.querySelectorAll('.nc');
                chars.forEach(c => c.classList.add('show'));
            });

            // Step 5 — Subtitle
            after(1300, () => {
                subtitle.classList.add('visible');
            });

            // Step 6 — CTA buttons
            after(1750, () => {
                cta.classList.add('visible');
            });

            // Step 7 — Footer + unlock scroll
            after(2200, () => {
                footer.classList.add('visible');
                after(300, () => document.body.classList.add('ready'));
            });
        });
    });
}

/* ────────────────────────────────────────────────────────────
   CURSOR MAGNETIC EFFECT
   Buttons gently attract toward the mouse pointer for a
   tactile, premium feel (subtle — never exceeds ±8px).
   ──────────────────────────────────────────────────────────── */

function initMagneticButtons() {
    const MAX_SHIFT = 8; // px

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect   = btn.getBoundingClientRect();
            const cx     = rect.left + rect.width  / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = (e.clientX - cx) / (rect.width  / 2);
            const dy     = (e.clientY - cy) / (rect.height / 2);

            btn.style.transform = `translate(${dx * MAX_SHIFT}px, ${dy * MAX_SHIFT}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.35s ease, border-color 0.35s ease, box-shadow 0.45s ease, background 0.45s ease';
            btn.style.transform  = 'translate(0, 0)';
            // Reset transition to default after spring settles
            after(500, () => { btn.style.transition = ''; });
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.15s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.45s ease, background 0.45s ease';
        });
    });
}

/* ────────────────────────────────────────────────────────────
   BOOT
   ──────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    initLoadSequence();
    initDomainsButton();
    initMagneticButtons();
});
