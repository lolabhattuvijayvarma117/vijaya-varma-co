document.addEventListener('DOMContentLoaded', () => {

    // Set Current Year in Footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // ── 1. Mobile Menu Toggle ──────────────────────────────────────────────
    const menuBtn  = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const navbar   = document.querySelector('.navbar');

    function openMenu() {
        navLinks.classList.add('active');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.querySelector('i').className = 'fas fa-times';
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.querySelector('i').className = 'fas fa-bars';
    }

    if (menuBtn && navLinks) {
        // Toggle on hamburger click
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.contains('active') ? closeMenu() : openMenu();
        });

        // Close when any nav link is tapped
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Close when clicking outside the navbar
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active')) {
            if (!navbar.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // ── 2. Sticky Navbar & Active Link on Scroll ──────────────────────────
    const sections = document.querySelectorAll('section');
    // Select anchors from both the mobile list and the desktop contact button
    const allNavAnchors = document.querySelectorAll('.nav-links a, .nav-contact-desktop');

    window.addEventListener('scroll', () => {
        // Scrolled shadow
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        // Active link highlight
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });

        allNavAnchors.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    });

    // 3. Operations Section Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 4. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    const leftElements = document.querySelectorAll('.left-anim');
    const rightElements = document.querySelectorAll('.right-anim');

    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(el => appearOnScroll.observe(el));
    leftElements.forEach(el => appearOnScroll.observe(el));
    rightElements.forEach(el => appearOnScroll.observe(el));

    // 5. Form Submission (Send to Backend)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const responseDiv = document.getElementById('form-response');
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            btn.disabled = true;
            btn.textContent = 'Sending...';
            responseDiv.style.display = 'none';

            try {
                const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
                });
                const result = await res.json();

                if (result.success) {
                responseDiv.style.background = '#d4edda';
                responseDiv.style.color = '#155724';
                responseDiv.style.border = '1px solid #c3e6cb';
                responseDiv.textContent = '✅ ' + result.message;
                this.reset();
                } else {
                responseDiv.style.background = '#f8d7da';
                responseDiv.style.color = '#721c24';
                responseDiv.style.border = '1px solid #f5c6cb';
                responseDiv.textContent = '❌ ' + result.error;
                }
            } catch (err) {
                responseDiv.style.background = '#f8d7da';
                responseDiv.style.color = '#721c24';
                responseDiv.style.border = '1px solid #f5c6cb';
                responseDiv.textContent = '❌ Something went wrong. Please try again.';
            } finally {
                responseDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Send Message';
            }
        });
    }

});
