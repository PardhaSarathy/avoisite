// AVOI — Minimal JavaScript
// Only functional interactions, no decorative effects

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
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

    const observerOptions = {
        threshold: 0.1, // Trigger sooner for snappy feel
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('section, .glow-card, .stat-item, .pipeline-step, .trust-bar, .booking-container');

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in-section');

        // Auto-stagger siblings in grids
        if (el.classList.contains('glow-card') || el.classList.contains('stat-item')) {
            const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
            el.style.transitionDelay = `${(siblingIndex % 3) * 0.1}s`;
        }

        observer.observe(el);
    });

    // Mobile Navigation Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            mobileBtn.classList.toggle('active-toggle');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                mobileBtn.classList.remove('active-toggle');
            });
        });
    }

    // Splash Screen Sequence
    const splash = document.getElementById('splash-screen');
    const hero = document.querySelector('.hero');

    if (splash) {
        // Wait for page load + small buffer
        setTimeout(() => {
            splash.classList.add('splash-hidden');
            // Trigger Hero Entrance
            if (hero) hero.classList.add('hero-active');
        }, 1800); // 1.8s hold time
    } else {
        // Fallback if no splash
        if (hero) hero.classList.add('hero-active');
    }
    // Footer System Clock
    function updateFooterClock() {
        const timeElement = document.getElementById('footer-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        }
    }

    // Initial call and interval
    updateFooterClock();
    setInterval(updateFooterClock, 1000);
});
