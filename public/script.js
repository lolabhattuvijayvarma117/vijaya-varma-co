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

    // 4b. Service Card Touch Toggle (for mobile — hover doesn't exist)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Only use touch-toggle behavior on touch devices
            if (!window.matchMedia('(hover: hover)').matches) {
                const wasActive = card.classList.contains('touch-active');
                // Close all others
                serviceCards.forEach(c => c.classList.remove('touch-active'));
                // Toggle this one
                if (!wasActive) card.classList.add('touch-active');
            }
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const wasActive = card.classList.contains('touch-active');
                serviceCards.forEach(c => c.classList.remove('touch-active'));
                if (!wasActive) card.classList.add('touch-active');
            }
        });
    });

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

            // Inject Web3Forms Access Key
            data.access_key = "017537e2-67fa-4ba2-86b9-fc1db083e23c";
            // Set subject line for email
            data.subject = "New Contact Form Submission from " + (data.name || "Website");
            // Set from name
            data.from_name = "Vijaya Varma & Co Website";
            
            // Set auto-reply to the customer
            data.autoresponse = "Thank you for contacting Vijaya Varma & Co.\n\nWe have received your message and our team will get back to you shortly.\n\nBest regards,\nVijaya Varma & Co.";

            try {
                const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
                });
                const result = await res.json();

                if (res.status === 200) {
                responseDiv.style.background = '#d4edda';
                responseDiv.style.color = '#155724';
                responseDiv.style.border = '1px solid #c3e6cb';
                responseDiv.textContent = '✅ ' + result.message;
                this.reset();
                } else {
                responseDiv.style.background = '#f8d7da';
                responseDiv.style.color = '#721c24';
                responseDiv.style.border = '1px solid #f5c6cb';
                responseDiv.textContent = '❌ ' + (result.message || 'Something went wrong');
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

    // ==========================================
    // MODAL LOGIC (Shared for Clients & Work Orders)
    // ==========================================
    const modal = document.getElementById('details-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalScope = document.getElementById('modal-scope');
    
    function openModal(title, scope) {
        if (!modal) return;
        modalTitle.textContent = title;
        modalScope.innerHTML = scope || "No additional details verified on file.";
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    }
    
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Wire up Work Order buttons
    document.querySelectorAll('.wo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(btn.getAttribute('data-name'), btn.getAttribute('data-scope'));
        });
    });
    
    // ==========================================
    // CLIENTS DOCK MAGNIFICATION EFFECT
    // ==========================================
    const dock = document.getElementById('dock');
    const dockItems = document.querySelectorAll('.dock-item');
    
    // Scale configuration
    const maxScale = 1.5;
    const baseScale = 1.0;
    const effectRadius = 250; // pixels
    
    if (dock) {
        dock.addEventListener('mousemove', (e) => {
            // Only apply on non-touch devices
            if (window.matchMedia('(pointer: coarse)').matches) return;
            
            dockItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                
                // Distance from mouse to center of this item
                const dist = Math.abs(e.clientX - itemCenterX);
                
                // Calculate scale
                let scale = baseScale;
                if (dist < effectRadius) {
                    // Exponential falloff
                    const factor = 1 - (dist / effectRadius);
                    scale = baseScale + (maxScale - baseScale) * factor;
                }
                
                item.style.transform = `scale(${scale})`;
            });
        });
        
        dock.addEventListener('mouseleave', () => {
            // Reset all items
            dockItems.forEach(item => {
                item.style.transform = `scale(${baseScale})`;
            });
        });
        
        // Horizontal Scroll with Mouse Wheel
        dock.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                dock.scrollLeft += e.deltaY;
            }
        });
        
        // Drag to scroll
        let isDown = false;
        let startX;
        let scrollLeft;
        
        dock.addEventListener('mousedown', (e) => {
            isDown = true;
            dock.style.cursor = 'grabbing';
            startX = e.pageX - dock.offsetLeft;
            scrollLeft = dock.scrollLeft;
        });
        
        dock.addEventListener('mouseleave', () => {
            isDown = false;
            dock.style.cursor = 'default';
        });
        
        dock.addEventListener('mouseup', () => {
            isDown = false;
            dock.style.cursor = 'default';
        });
        
        dock.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - dock.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            dock.scrollLeft = scrollLeft - walk;
        });
    }
    
    // Wire up Clients clicks to open Modal
    dockItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent if dragging
            
            const name = item.getAttribute('data-name');
            const scope = item.getAttribute('data-scope');
            openModal(name, scope);
        });
    });

});
