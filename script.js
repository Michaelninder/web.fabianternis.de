// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations are CSS-driven, but we can add interactivity here
    
    // Add hover sound effect placeholder (visual feedback)
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        // Mouse enter - add ripple effect starting point
        btn.addEventListener('mouseenter', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            btn.style.setProperty('--mouse-x', `${x}px`);
            btn.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Keyboard accessibility
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                btn.click();
            }
        });
    });
    
    // Parallax effect on mouse move for decoration
    const decoration = document.querySelector('.decoration');
    const hero = document.querySelector('.hero');
    
    if (decoration && window.matchMedia('(min-width: 900px)').matches) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xPercent = (clientX / innerWidth - 0.5) * 2;
            const yPercent = (clientY / innerHeight - 0.5) * 2;
            
            const ring = decoration.querySelector('.decoration-ring');
            const dot = decoration.querySelector('.decoration-dot');
            
            if (ring) {
                ring.style.transform = `translate(${xPercent * 10}px, ${yPercent * 10}px)`;
            }
            
            if (dot) {
                dot.style.transform = `translate(${xPercent * -15}px, ${yPercent * -15}px)`;
            }
        });
    }
    
    // Add intersection observer for scroll reveal (if content extends below fold)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.observe').forEach(el => {
        observer.observe(el);
    });
    
    // Console Easter egg
    console.log('%c Welcome to Fabian Ternis Portfolio ', 
        'background: linear-gradient(135deg, #00d4aa, #6366f1); color: #0a0a0b; font-size: 14px; font-weight: bold; padding: 10px 20px; border-radius: 6px;');
    console.log('%c German Web Developer ', 
        'color: #a1a1aa; font-size: 12px;');
});

// Smooth scroll behavior enhancement
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});