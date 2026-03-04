/* ========================================
   DOM Elements
======================================== */
const loader = document.getElementById('loader');
const mainContent = document.getElementById('mainContent');
const cursorFollower = document.getElementById('cursorFollower');
const btnWork = document.getElementById('btnWork');
const btnDomains = document.getElementById('btnDomains');
const btnHire = document.getElementById('btnHire');

/* ========================================
   Configuration
======================================== */
const CONFIG = {
    loaderDuration: 1800,
    cursorSmoothness: 0.15,
    tiltIntensity: 15
};

/* ========================================
   State
======================================== */
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let isTouchDevice = false;

/* ========================================
   Initialization
======================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Detect touch device
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Hide loader after animation
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
    }, CONFIG.loaderDuration);
    
    // Initialize features
    if (!isTouchDevice) {
        initCursorFollower();
    }
    initButtonInteractions();
    initKeyboardNavigation();
    
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        loader.style.display = 'none';
    }
});

/* ========================================
   Cursor Follower
======================================== */
function initCursorFollower() {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show cursor follower
        if (!cursorFollower.classList.contains('visible')) {
            cursorFollower.classList.add('visible');
        }
    });
    
    document.addEventListener('mouseleave', () => {
        cursorFollower.classList.remove('visible');
    });
    
    // Smooth cursor animation
    function animateCursor() {
        cursorX += (mouseX - cursorX) * CONFIG.cursorSmoothness;
        cursorY += (mouseY - cursorY) * CONFIG.cursorSmoothness;
        
        cursorFollower.style.left = cursorX + 'px';
        cursorFollower.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Hover effects for buttons
    const buttons = document.querySelectorAll('.cta-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('hovering');
        });
        btn.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('hovering');
        });
    });
}

/* ========================================
   Button Interactions
======================================== */
function initButtonInteractions() {
    // Button 2: 3D Tilt Effect
    initTiltButton(btnDomains);
    
    // Button 3: Slice effect enhancement
    initSliceButton(btnHire);
}

function initTiltButton(button) {
    if (isTouchDevice) return;
    
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltIntensity;
        const rotateY = ((x - centerX) / centerX) * CONFIG.tiltIntensity;
        
        button.style.setProperty('--rotateX', rotateX + 'deg');
        button.style.setProperty('--rotateY', rotateY + 'deg');
        button.classList.add('tilted');
    });
    
    button.addEventListener('mouseleave', () => {
        button.classList.remove('tilted');
        button.style.setProperty('--rotateX', '0deg');
        button.style.setProperty('--rotateY', '0deg');
    });
}

function initSliceButton(button) {
    // Add click ripple effect
    button.addEventListener('click', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleEffect 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 10;
        `;
        
        button.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => ripple.remove(), 600);
    });
    
    // Add ripple keyframes dynamically
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: translate(-50%, -50%) scale(20);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ========================================
   Keyboard Navigation
======================================== */
function initKeyboardNavigation() {
    const buttons = [btnWork, btnDomains, btnHire];
    
    buttons.forEach((btn, index) => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
            
            // Arrow key navigation between buttons
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextBtn = buttons[(index + 1) % buttons.length];
                nextBtn.focus();
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevBtn = buttons[(index - 1 + buttons.length) % buttons.length];
                prevBtn.focus();
            }
        });
    });
}

/* ========================================
   Viewport Height Fix (Mobile)
======================================== */
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);

/* ========================================
   Performance: Pause animations when hidden
======================================== */
document.addEventListener('visibilitychange', () => {
    const floatingElements = document.querySelectorAll('.float-circle');
    if (document.hidden) {
        floatingElements.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        floatingElements.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});