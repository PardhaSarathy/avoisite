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

                if (entry.target.classList.contains('process-step')) {
                    entry.target.classList.add('visible');
                }

                // For signal train
                if (entry.target.classList.contains('timeline-signal')) {
                    entry.target.classList.add('active');
                }

                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('section, .glow-card, .stat-item, .pipeline-step, .trust-bar, .booking-container, .process-step, .timeline-signal');

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in-section');

        // Auto-stagger siblings in grids
        if (el.classList.contains('glow-card') || el.classList.contains('stat-item')) {
            const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
            el.style.transitionDelay = `${(siblingIndex % 3) * 0.1}s`;
        }

        // Specific stagger for Process Steps (01-04)
        if (el.classList.contains('process-step')) {
            el.classList.remove('fade-in-section'); // Remove generic fade
            // Stagger handled by CSS nth-child delay
            // We just need the observer to add 'visible' or 'is-visible'
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

    // ===================================
    // HERO BACKGROUND: AGENTIC GRID
    // ===================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let animationFrameId;

        // Configuration
        const config = {
            gridSize: 40,        // Spacing between lines
            lineColor: 'rgba(74, 236, 255, 0.05)', // Even subtly for background safety
            activeColor: '#4aecff', // Bright Cyan for nodes
            nodeProb: 0.02,      // Chance of a node appearing
            pulseSpeed: 2.5,     // Slower, more deliberate data flow
        };

        // State
        let time = 0;
        const nodes = [];
        const pulses = [];

        // Resize Handling
        function resize() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }
        window.addEventListener('resize', resize);
        // Initial resize
        resize();

        // Classes
        class Node {
            constructor() {
                // Random position grid-aligned
                // We calculate max grid lines to ensure we cover screen
                const maxCols = Math.ceil(width / config.gridSize);
                const maxRows = Math.ceil(height / config.gridSize);

                this.gridX = Math.floor(Math.random() * maxCols);
                this.gridY = Math.floor(Math.random() * maxRows);
                this.x = this.gridX * config.gridSize;
                this.y = this.gridY * config.gridSize;

                this.life = 0;
                this.maxLife = 30 + Math.random() * 30; // Short 0.5-1s blink
                this.active = true;
            }

            update() {
                this.life++;
                if (this.life > this.maxLife) this.active = false;
            }

            draw(ctx, offset) {
                // Blink opacity curve
                let alpha = 0;
                if (this.life < 10) alpha = this.life / 10;
                else if (this.life > this.maxLife - 10) alpha = (this.maxLife - this.life) / 10;
                else alpha = 1;

                ctx.fillStyle = config.activeColor;
                ctx.globalAlpha = alpha;

                // Draw at grid intersection (accounting for vertical scroll)
                // Nodes move with the grid
                const drawY = (this.y + offset) % height;

                // Only draw if within bounds (wrap handling)
                // If drawY wraps abruptly (e.g at 0), we might need logic, but modulo handles smooth loop if Y is consistently incrementing.
                // However, since we re-calculate drawY every frame, if it wraps, the node might jump. 
                // Since nodes are short lived, it's mostly fine. But ideally nodes should attach to the *scrolling* grid.
                // Simplified: Nodes stay at fixed Y but just 'appear'. 
                // BETTER: Nodes stay at fixed screen Y to simulate 'scanning' or attach to grid? 
                // Agentic Grid implies structure. Let's make nodes scroll with grid.

                ctx.beginPath();
                ctx.arc(this.x, drawY, 2, 0, Math.PI * 2);
                ctx.fill();

                // Glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = config.activeColor;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }

        class Pulse {
            constructor(vertical = true) {
                this.vertical = vertical;
                this.progress = 0;
                this.speed = config.pulseSpeed + Math.random() * 2;
                this.active = true;

                if (this.vertical) {
                    this.lineIndex = Math.floor(Math.random() * Math.ceil(width / config.gridSize));
                    this.length = 50 + Math.random() * 100; // Trail length
                    this.progress = -this.length; // Start off screen
                } else {
                    this.lineIndex = Math.floor(Math.random() * Math.ceil(height / config.gridSize));
                    this.length = 50 + Math.random() * 100;
                    this.progress = -this.length;
                }
            }

            update() {
                this.progress += this.speed;
                // Deactivate if far off screen
                if (this.vertical && this.progress > height + this.length) this.active = false;
                if (!this.vertical && this.progress > width + this.length) this.active = false;
            }

            draw(ctx, offset) {
                ctx.lineWidth = 1.5;
                const beamOpacity = 0.4;

                if (this.vertical) {
                    const x = (this.lineIndex * config.gridSize);

                    const headY = this.progress;
                    const tailY = this.progress - this.length;

                    const grad = ctx.createLinearGradient(x, tailY, x, headY);
                    grad.addColorStop(0, 'rgba(74, 236, 255, 0)');
                    grad.addColorStop(1, `rgba(74, 236, 255, ${beamOpacity})`);
                    ctx.strokeStyle = grad;

                    ctx.beginPath();
                    ctx.moveTo(x, tailY);
                    ctx.lineTo(x, headY);
                    ctx.stroke();
                } else {
                    // Horizontal pulse moves along a horizontal line.
                    // Horizontal lines SCROLL. So Y depends on offset.
                    // We need to pick a SPECIFIC line Y relative to 'start' or 'grid index'.
                    // If we use grid index, y changes every frame.
                    const y = ((this.lineIndex * config.gridSize) + offset) % height;

                    const headX = this.progress;
                    const tailX = this.progress - this.length;

                    const grad = ctx.createLinearGradient(tailX, y, headX, y);
                    grad.addColorStop(0, 'rgba(74, 236, 255, 0)');
                    grad.addColorStop(1, `rgba(74, 236, 255, ${beamOpacity})`);
                    ctx.strokeStyle = grad;

                    ctx.beginPath();
                    ctx.moveTo(tailX, y);
                    ctx.lineTo(headX, y);
                    ctx.stroke();
                }
            }
        }

        function drawGrid(offset) {
            ctx.strokeStyle = config.lineColor;
            ctx.lineWidth = 1;

            // Vertical Lines
            for (let x = 0; x <= width; x += config.gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Horizontal Lines (Scrolling)
            // Use modulo to cycle
            const startY = offset % config.gridSize;
            for (let y = startY; y <= height; y += config.gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            time += 1;
            const scrollOffset = time * 0.25; // Scroll speed

            drawGrid(scrollOffset);

            // Manage Nodes
            // Cleanup inactive
            for (let i = nodes.length - 1; i >= 0; i--) {
                nodes[i].update();
                nodes[i].draw(ctx, scrollOffset);
                if (!nodes[i].active) nodes.splice(i, 1);
            }
            // Add new
            if (nodes.length < 15 && Math.random() < config.nodeProb) {
                nodes.push(new Node());
            }

            // Manage Pulses
            for (let i = pulses.length - 1; i >= 0; i--) {
                pulses[i].update();
                pulses[i].draw(ctx, scrollOffset);
                if (!pulses[i].active) pulses.splice(i, 1);
            }
            // Add new
            if (pulses.length < 8 && Math.random() < 0.03) {
                pulses.push(new Pulse(Math.random() > 0.5)); // 50/50 vertical/horizontal
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // Start
        animate();
    }
});
