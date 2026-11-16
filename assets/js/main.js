/* ==========================================================================
   RUSSELL EVAN O. LOQUINARIO - PORTFOLIO 2026
   Main Interactive Controller (Responsive in JavaScript)
   No external libraries, pure vanilla JS (ES6+)
   ========================================================================== */

(function() {
  'use strict';

  // --- 1. STATE & CONSTANTS ---
  const STATE = {
    theme: 'dark',
    currentBreakpoint: 'desktop',
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    mobileNavOpen: false,
    activeSection: 'home'
  };

  // --- 2. THEME CONTROLLER (NIGHT & DAY) ---
  const ThemeController = {
    init() {
      const savedTheme = localStorage.getItem('russell_portfolio_theme');
      if (savedTheme) {
        STATE.theme = savedTheme;
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        STATE.theme = prefersLight ? 'light' : 'dark';
      }

      this.applyTheme(STATE.theme);
      this.bindEvents();
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('russell_portfolio_theme', theme);

      const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
      toggleBtns.forEach(btn => {
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Day' : 'Night'} Mode`);
        btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        btn.title = `Current: ${theme === 'dark' ? 'Night Mode' : 'Day Mode'} (Press T to switch)`;
      });

      if (window.ambientCanvasController) {
        window.ambientCanvasController.updateTheme(theme);
      }
    },

    toggle() {
      STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(STATE.theme);
      Toast.show(`Switched to ${STATE.theme === 'dark' ? 'Night 🌙' : 'Day ☀️'} Theme`);
    },

    bindEvents() {
      const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
      toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });

      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.key === 't' || e.key === 'T') {
          this.toggle();
        }
      });
    }
  };

  // --- 3. RESPONSIVE IN JAVASCRIPT CONTROLLER ---
  const ResponsiveController = {
    mediaQueries: {
      mobile: window.matchMedia('(max-width: 768px)'),
      tablet: window.matchMedia('(min-width: 769px) and (max-width: 1024px)'),
      desktop: window.matchMedia('(min-width: 1025px)')
    },

    init() {
      this.evaluateBreakpoints();
      this.bindListeners();
      this.createViewportHUD();
    },

    evaluateBreakpoints() {
      STATE.windowWidth = window.innerWidth;
      STATE.windowHeight = window.innerHeight;

      let newBreakpoint = 'desktop';
      if (this.mediaQueries.mobile.matches) {
        newBreakpoint = 'mobile';
      } else if (this.mediaQueries.tablet.matches) {
        newBreakpoint = 'tablet';
      } else {
        newBreakpoint = 'desktop';
      }

      if (newBreakpoint !== STATE.currentBreakpoint) {
        STATE.currentBreakpoint = newBreakpoint;
        this.onBreakpointChange(newBreakpoint);
      }

      this.updateViewportHUD();
    },

    onBreakpointChange(breakpoint) {
      console.log(`[Responsive JS] Layout shifted to: ${breakpoint.toUpperCase()} (${window.innerWidth}px)`);

      if (breakpoint === 'desktop' && STATE.mobileNavOpen) {
        NavigationController.closeMobileNav();
      }

      if (window.ambientCanvasController) {
        window.ambientCanvasController.resize();
      }
    },

    bindListeners() {
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.evaluateBreakpoints();
        }, 120);
      });

      window.addEventListener('orientationchange', () => {
        setTimeout(() => this.evaluateBreakpoints(), 200);
      });
    },

    createViewportHUD() {
      const hud = document.createElement('div');
      hud.className = 'js-viewport-badge';
      hud.id = 'jsViewportHUD';
      hud.innerHTML = `
        <span class="js-viewport-dot"></span>
        <span id="jsViewportText">Init...</span>
      `;
      document.body.appendChild(hud);
      this.updateViewportHUD();
    },

    updateViewportHUD() {
      const txt = document.getElementById('jsViewportText');
      if (txt) {
        const bpLabel = STATE.currentBreakpoint.toUpperCase();
        txt.textContent = `${window.innerWidth}px • ${bpLabel}`;
      }
    }
  };

  // --- 4. RESPONSIVE AMBIENT MATRIX/STARS CANVAS ---
  const AmbientCanvasController = {
    canvas: null,
    ctx: null,
    columns: 0,
    drops: [],
    fontSize: 14,
    animationFrameId: null,
    characters: '01<>{}[]/*=+-_~#@$%^&LOQUINARIO2026',

    init() {
      this.canvas = document.getElementById('ambientCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.animate();

      window.ambientCanvasController = this;
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.fontSize = STATE.currentBreakpoint === 'mobile' ? 12 : 14;
      this.columns = Math.floor(this.canvas.width / this.fontSize);

      this.drops = [];
      for (let i = 0; i < this.columns; i++) {
        this.drops[i] = Math.floor(Math.random() * -100);
      }
    },

    updateTheme(theme) {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },

    animate() {
      if (document.hidden) {
        setTimeout(() => requestAnimationFrame(() => this.animate()), 1000);
        return;
      }

      const isDark = STATE.theme === 'dark';

      this.ctx.fillStyle = isDark ? 'rgba(6, 9, 19, 0.12)' : 'rgba(248, 250, 252, 0.18)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.font = `${this.fontSize}px 'JetBrains Mono', Consolas, monospace`;

      for (let i = 0; i < this.drops.length; i++) {
        const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;

        if (isDark) {
          this.ctx.fillStyle = (i % 5 === 0) ? '#00e5ff' : (i % 3 === 0 ? '#00e676' : 'rgba(56, 189, 248, 0.4)');
        } else {
          this.ctx.fillStyle = (i % 4 === 0) ? 'rgba(2, 132, 199, 0.35)' : 'rgba(148, 163, 184, 0.25)';
        }

        this.ctx.fillText(text, x, y);

        if (y > this.canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }

        this.drops[i]++;
      }

      if (STATE.currentBreakpoint === 'mobile') {
        setTimeout(() => {
          this.animationFrameId = requestAnimationFrame(() => this.animate());
        }, 50);
      } else {
        setTimeout(() => {
          this.animationFrameId = requestAnimationFrame(() => this.animate());
        }, 32);
      }
    }
  };

  // --- 5. NAVIGATION & SCROLLSPY ---
  const NavigationController = {
    navbar: null,
    mobileToggle: null,
    mobileDrawer: null,
    navLinks: [],
    sections: [],

    init() {
      this.navbar = document.querySelector('.navbar');
      this.mobileToggle = document.querySelector('.mobile-nav-toggle');
      this.mobileDrawer = document.querySelector('.mobile-drawer');
      this.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
      this.sections = document.querySelectorAll('section[id]');

      this.bindEvents();
      this.initScrollSpy();
    },

    bindEvents() {
      if (this.mobileToggle) {
        this.mobileToggle.addEventListener('click', () => {
          this.toggleMobileNav();
        });
      }

      this.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          const targetId = link.getAttribute('href');
          if (targetId && targetId.startsWith('#')) {
            if (STATE.mobileNavOpen) {
              this.closeMobileNav();
            }
          }
        });
      });

      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          this.navbar.classList.add('scrolled');
        } else {
          this.navbar.classList.remove('scrolled');
        }
      }, { passive: true });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && STATE.mobileNavOpen) {
          this.closeMobileNav();
        }
      });
    },

    toggleMobileNav() {
      STATE.mobileNavOpen = !STATE.mobileNavOpen;
      this.mobileToggle.classList.toggle('open', STATE.mobileNavOpen);
      this.mobileDrawer.classList.toggle('open', STATE.mobileNavOpen);
      document.body.style.overflow = STATE.mobileNavOpen ? 'hidden' : '';
    },

    closeMobileNav() {
      STATE.mobileNavOpen = false;
      if (this.mobileToggle) this.mobileToggle.classList.remove('open');
      if (this.mobileDrawer) this.mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    },

    initScrollSpy() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              STATE.activeSection = id;
              this.updateActiveNavLink(id);
            }
          }
        });
      }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1
      });

      this.sections.forEach(section => observer.observe(section));
    },

    updateActiveNavLink(activeId) {
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${activeId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  // --- 6. TYPING EFFECT IN HERO ---
  const TypingEffect = {
    titles: [
      'BSIT Web Developer',
      'Full-Stack PHP & Vue.js Engineer',
      'IT Technician & Systems Specialist (NC II)',
      'Responsive UI & Frontend Architect',
      'AI Prompt Engineer & Problem Solver'
    ],
    currentIndex: 0,
    charIndex: 0,
    isDeleting: false,
    targetEl: null,

    init() {
      this.targetEl = document.getElementById('heroTypingText');
      if (!this.targetEl) return;
      this.tick();
    },

    tick() {
      const currentFullText = this.titles[this.currentIndex];
      if (this.isDeleting) {
        this.charIndex--;
      } else {
        this.charIndex++;
      }

      this.targetEl.textContent = currentFullText.substring(0, this.charIndex);

      let delta = this.isDeleting ? 40 : 80;

      if (!this.isDeleting && this.charIndex === currentFullText.length) {
        delta = 2000;
        this.isDeleting = true;
      } else if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.currentIndex = (this.currentIndex + 1) % this.titles.length;
        delta = 500;
      }

      setTimeout(() => this.tick(), delta);
    }
  };

  // --- 7. PROJECT FILTERING & SHOWCASE CONTROLLER ---
  const ProjectShowcaseController = {
    projects: {
      upcebu: {
        title: 'UP Cebu Room & Equipment Management System',
        subtitle: 'University of the Philippines Cebu • ITC OJT Developer Project',
        category: 'Enterprise Campus Management & Reservation',
        stack: ['Vue.js', 'Laravel', 'Inertia.js', 'Tailwind CSS', 'MySQL', 'REST API', 'Chart Analytics'],
        description: 'Engineered during Russell Evan Loquinario\'s web developer engagement at the University of the Philippines Cebu Information Technology Center under ITC Head Engr. Jonathan P. Victolero. The system automates room reservation workflows, eliminates scheduling conflicts across colleges, and delivers comprehensive real-time asset tracking for university hardware and AV equipment.',
        credentials: 'Admin Demo: admin / password123',
        features: [
          'Interactive Schedule Calendar with appointment modal for classes (CS 101, UG 114, Engineering, Prof. John Smith)',
          'Equipment Management dashboard with active counters (Total: 20, Available: 6, In Use: 5) and instant search',
          'Data visual analytics: Equipment Distribution by Person pie chart and Equipment Count by Building bar chart',
          'Campus room matrix tracking subjects, colleges, faculty members, timeslots, and full CRUD actions',
          'Multi-tier role authentication with secure session management'
        ],
        screenshots: [
          {
            src: 'assets/img/project-upcebu-equipment.jpg',
            label: '📊 Equipment Inventory & Distribution',
            caption: 'Equipment Management dashboard: 20 total assets, 6 available, 5 in use, searchable inventory table, distribution pie chart by person, and count by building.'
          },
          {
            src: 'assets/img/project-upcebu-schedule.png',
            label: '📅 Schedule Calendar & Appointment Modal',
            caption: 'Real-time schedule calendar showing Appointment Details modal for Class CS 101, Room UG 114, Engineering building requested by Prof. John Smith.'
          },
          {
            src: 'assets/img/project-upcebu-dashboard.jpg',
            label: '🏫 Room Management Directory Matrix',
            caption: 'Room Management matrix tracking subjects, colleges, faculty members, timeslots, and CRUD action controls across university facilities.'
          },
          {
            src: 'assets/img/project-upcebu-login.jpg',
            label: '🔐 UP Cebu Authentication Portal',
            caption: 'Administrative portal login screen showcasing UP Cebu facade backdrop with pre-configured developer demo credentials.'
          }
        ]
      },

      ecommerce: {
        title: 'E-Commerce Loquinario Management (Farm & Grocery Products)',
        subtitle: 'Full-Stack Agricultural Commerce & Order Processing System',
        category: 'E-Commerce & Inventory Management Platform',
        stack: ['PHP (OOP)', 'JavaScript ES6', 'MySQL Database', 'Bootstrap 5', 'Order Tracking', 'File Upload API'],
        description: 'Designed and engineered by Russell Evan Loquinario as a robust agricultural e-commerce platform and inventory system for fresh farm produce and groceries. Features real-time stock deductions, unique order tracking codes, image upload processing, and responsive mobile-first purchasing.',
        features: [
          'Dynamic product catalog with high-resolution image upload preview and pricing/stock validation',
          'End-to-end Order Lifecycle tracking with unique tracking reference codes (#ORD-69A7DACDA5376) and pending status badges',
          'Client-side cart calculation with automatic item extension and order invoice totals ($115.00, $60.00)',
          'Secure customer and administrative portal authentication with password hashing and session controls',
          'Mobile-first responsive interface optimized for smartphones, tablets, and desktop workstations'
        ],
        screenshots: [
          {
            src: 'assets/img/project-ecommerce-upload.jpg',
            label: '🛒 Product Catalog & Upload Interface',
            caption: 'Upload New Product interface featuring vibrant fresh produce banner, image upload preview, pricing, and live stock calculation.'
          },
          {
            src: 'assets/img/project-ecommerce-orders.jpg',
            label: '📦 "My Orders" Real-Time Tracking',
            caption: 'Customer order history dashboard showing unique reference codes (#ORD-69A7DACDA5376), pending status tags, itemized totals ($115.00, $60.00), and order items.'
          },
          {
            src: 'assets/img/project-ecommerce-modal.jpg',
            label: '📝 Product Creation Modal & Validation',
            caption: 'Interactive modal dialog with client-side form validation for Product Name, Price ($), Stock Quantity, Description, and File Upload.'
          },
          {
            src: 'assets/img/project-ecommerce-login.jpg',
            label: '🔑 Loquinario Management Login',
            caption: 'Customer and administrative authentication portal with session persistence and secure password hashing.'
          }
        ]
      },

      calculator: {
        title: 'Calculator Loquinario (Tactile Neumorphic Mobile & Web)',
        subtitle: 'Interactive Client-Side Engineering • Web Audio API Synthesis',
        category: 'Interactive Utility & Responsive Tool',
        stack: ['JavaScript ES6', 'Neumorphic CSS3', 'Web Audio API', 'Mobile Touch', 'Responsive HUD'],
        description: 'A tactile, accessible calculator engineered with pure vanilla JavaScript ES6. Designed to resemble modern mobile iOS/Android tactile calculators with concave neumorphic buttons, synthesized haptic click frequencies via Web Audio API, and robust error handling.',
        features: [
          'Zero-division error guard: safely displays "Error" on division by zero (e.g., 7 ÷ 0)',
          'Chained arithmetic expressions (e.g., 7 × 8 × 75 - 3 = 4,197)',
          'Pure Web Audio API synthesizer for tactile mechanical click sound without external mp3 files',
          'Full physical keyboard support (Enter for =, Escape for Clear, Backspace for Del)',
          'Embedded directly on portfolio page as an active interactive widget'
        ],
        screenshots: [
          {
            src: 'assets/img/project-calc-success.jpg',
            label: '📱 Interactive Live Calculator Screen',
            caption: 'Tactile neumorphic calculator interface featuring zero-division protection, multi-step math evaluation, and audio click feedback.'
          }
        ]
      },

      crudsystem: {
        title: 'Loquinario User Management & CRUD System',
        subtitle: 'Full-Stack PHP & MySQL User Administration Platform',
        category: 'Full-Stack CRUD Application & Dual-Role Portal',
        stack: ['PHP (OOP)', 'MySQL Database', 'CRUD Operations', 'Bootstrap 5', 'JavaScript', 'Photo Upload', 'Session Security'],
        description: 'A comprehensive user management platform engineered by Russell Evan Loquinario using PHP, MySQL, and modern Bootstrap 5 styling. The system implements end-to-end CRUD (Create, Read, Update, Delete) database workflows with dual-role authentication (Admin vs Regular User), real-time counter metrics (Total Users: 2, Admins: 1, Regular Users: 1), user registration with profile image uploading, password encryption, and a personalized user dashboard with account age calculations.',
        features: [
          'Full CRUD Capabilities: Create accounts with photo upload, Read user lists with role badges, Update profile credentials, and Delete accounts with confirmation',
          'Dynamic metric counters for Total Users, Admins, and Regular Users with instant synchronization',
          'Administrative User Management table with ID, profile avatar, username, email, role badge, joined date, and action icons (View 👁️, Edit ✏️, Delete 🗑️)',
          'User Registration modal form with client-side validation, password confirmation, and profile image upload zone',
          'Personal User Dashboard with profile card, User ID (#5), email (user@gmail.com), member join date, active account status, and account age counter',
          'Dual-Role Authentication Portal with login role selection dropdown (User vs Admin), session persistence, and logout flow'
        ],
        screenshots: [
          {
            src: 'assets/img/project-crud-admin-panel.jpg',
            label: '👑 Admin Panel & User CRUD Table',
            caption: 'Admin Panel with real-time statistics counters (Total Users: 2, Admins: 1, Regular Users: 1) and User Management data table with action buttons (View, Edit, Delete).'
          },
          {
            src: 'assets/img/project-crud-register.jpg',
            label: '📝 Create User Account (Registration)',
            caption: 'User Registration modal form with Username, Email, Password, Confirm Password, and Drag-and-drop / Click Profile Photo Upload.'
          },
          {
            src: 'assets/img/project-crud-user-dashboard.jpg',
            label: '👤 User Dashboard & Account Status',
            caption: 'Logged-in user dashboard showing Profile avatar (armyoftight01), Account Information (User ID #5, Email: user@gmail.com), and Active Account Status.'
          },
          {
            src: 'assets/img/project-crud-login.jpg',
            label: '🔐 Dual-Role Login Authentication',
            caption: 'Portal authentication modal with Email, Password, and "Login as" role selector dropdown (User or Admin).'
          }
        ]
      },

      portfolioproject: {
        title: 'Russell Evan Developer Portfolio Project',
        subtitle: 'Clean & Minimalist Personal Portfolio Website',
        category: 'Frontend Engineering & Responsive UI/UX',
        stack: ['HTML5 Semantic', 'CSS3 Flexbox/Grid', 'JavaScript ES6', 'Responsive Design', 'Mobile First', 'Clean UI/UX'],
        description: 'A clean, modern personal developer portfolio designed and built by Russell Evan Loquinario using semantic HTML5, modern CSS3 layout systems, and vanilla JavaScript. Features a centered circular portrait hero section with prominent call-to-actions, responsive 3-column services grid (Web Development, UI/UX Design, Mobile Apps), featured projects showcase, and an interactive contact interface.',
        features: [
          'Centered circular portrait hero layout with high-impact typography: "Hi, I\'m Russell Evan - Creative Developer & Designer"',
          'Dual primary action buttons: "View My Work" (smooth scrolls to portfolio projects) and "Contact Me"',
          'Responsive 3-column services section highlighting Web Development, UI/UX Design, and Mobile Apps',
          'Featured projects showcase cards with tech stack badges (React, Node.js, Vue.js, Firebase, Tailwind, JavaScript, API, CSS3)',
          'Interactive "Get In Touch" contact section featuring direct email, phone, location details, responsive form, and social media footer links',
          '100% responsive across mobile smartphones, tablets, and desktop workstations with zero external framework bloat'
        ],
        screenshots: [
          {
            src: 'assets/img/project-portfolio-hero.jpg',
            label: '🌟 Clean Hero Section & Circular Portrait',
            caption: 'Minimalist hero section with centered circular portrait: "Hi, I\'m Russell Evan - Creative Developer & Designer crafting beautiful digital experiences with clean code and stunning design."'
          },
          {
            src: 'assets/img/project-portfolio-services.png',
            label: '🛠️ My Services & Featured Projects',
            caption: 'Three-column services grid (Web Development, UI/UX Design, Mobile Apps) and Featured Projects showcase with technology pills.'
          },
          {
            src: 'assets/img/project-portfolio-contact.png',
            label: '📬 Get In Touch & Contact Section',
            caption: 'Contact section with direct contact information (Email, Phone, Location), interactive message form, and social media footer.'
          }
        ]
      },

      // Aliases for backwards compatibility
      usermanagement: null, // assigned below
      reactiveui: null, // assigned below

      arbotics: {
        title: 'Hardware Diagnostics & Arbotics Robotics Controller',
        subtitle: 'Cebu Eastern College IT Laboratory & TESDA NC II Standards',
        category: 'IT Systems Diagnostics & Robotics Firmware',
        stack: ['C++', 'Arduino', 'Hardware Troubleshooting', 'LAN Networking', 'NC II CSS'],
        description: 'Diagnostic procedures and microcontroller programming firmware developed during IT systems training at Cebu Eastern College. Combines hardware assembly, OS reformatting, local network setup, and automated Arduino robotics.',
        features: [
          'Computer hardware diagnostics (RAM, power supply, motherboard, and HDD/SSD testing)',
          'Operating system deployment, reformatting, and driver installation',
          'Structured LAN cabling, RJ-45 crimping, and network packet testing',
          'Microcontroller sensor programming in C++ for automated robotics'
        ],
        screenshots: [
          {
            src: 'assets/img/cert-cec-arbotics.jpg',
            label: '🤖 Arbotics Recognition Certificate',
            caption: 'Awarded at Cebu Eastern College Computer Laboratory 2 for Arbotics Arduino robotics programming.'
          },
          {
            src: 'assets/img/cert-tesda-css-hd.jpg',
            label: '🛠️ TESDA NC II CSS Credential',
            caption: 'National Certificate II in Computer Systems Servicing (Cert No. 18072202014988).'
          }
        ]
      }
    },

    init() {
      this.projects.usermanagement = this.projects.crudsystem;
      this.projects.reactiveui = this.projects.portfolioproject;
      this.bindFilter();
      this.bindProjectInspection();
    },

    bindFilter() {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const projectCards = document.querySelectorAll('.project-card');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filterCategory = btn.getAttribute('data-filter');

          projectCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (filterCategory === 'all' || cardCat === filterCategory) {
              card.style.display = 'flex';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 20);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(10px)';
              setTimeout(() => {
                card.style.display = 'none';
              }, 250);
            }
          });
        });
      });
    },

    bindProjectInspection() {
      // Bind click on inspect buttons
      document.querySelectorAll('.inspect-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = btn.getAttribute('data-project-id');
          if (pId && this.projects[pId]) {
            this.openProjectModal(pId);
          }
        });
      });

      // Bind click on project media (click image to inspect)
      document.querySelectorAll('.project-card').forEach(card => {
        const media = card.querySelector('.project-media');
        if (media) {
          media.addEventListener('click', () => {
            const pId = card.getAttribute('data-project-id');
            if (pId && this.projects[pId]) {
              this.openProjectModal(pId);
            }
          });
        }
      });
    },

    openProjectModal(projectId) {
      const p = this.projects[projectId];
      if (!p) return;

      const firstScreen = p.screenshots[0];

      // Build thumbnail gallery nav
      let galleryNavHtml = '';
      if (p.screenshots.length > 1) {
        galleryNavHtml = `
          <div class="modal-gallery-nav" id="modalGalleryNav">
            ${p.screenshots.map((s, idx) => `
              <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" data-screen-index="${idx}">
                <span>${s.label}</span>
              </button>
            `).join('')}
          </div>
        `;
      }

      // Build features list
      const featuresHtml = p.features ? `
        <h4 style="font-size: 1rem; color: var(--text-main); margin-top: 1.25rem; margin-bottom: 0.5rem; font-weight: 700;">Key Engineered Features:</h4>
        <ul class="modal-features-list">
          ${p.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      ` : '';

      // Build credentials box
      const credentialsHtml = p.credentials ? `
        <div class="modal-credentials-box">
          <div>
            <strong>🔑 Demo Credentials:</strong> <code>${p.credentials}</code>
          </div>
          <span style="font-size: 0.75rem; color: var(--accent-cyan);">(Pre-configured Developer Demo Access)</span>
        </div>
      ` : '';

      // Build tech tags
      const techTagsHtml = p.stack ? `
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem;">
          ${p.stack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
      ` : '';

      // Build actions
      const actionsHtml = `
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; justify-content: flex-start; padding-top: 1.25rem; border-top: 1px solid var(--border-light); margin-top: 1.25rem;">
          <a id="modalFullSizeLink" href="${firstScreen.src}" target="_blank" class="btn btn-secondary btn-sm" title="Open original high-res screenshot in new tab">
            <span>🔍 View Full Size Original</span>
            <span>↗</span>
          </a>
          <a href="#contact" onclick="document.getElementById('globalModalOverlay').classList.remove('open'); document.body.style.overflow='';" class="btn btn-primary btn-sm">
            <span>Inquire About This Project</span>
            <span>💬</span>
          </a>
        </div>
      `;

      ModalController.open({
        title: p.title,
        subtitle: `${p.subtitle} • ${p.category}`,
        image: firstScreen.src,
        contentHtml: `
          ${galleryNavHtml}
          
          <div id="modalScreenshotCaption" style="font-size: 0.85rem; color: var(--accent-cyan); font-family: var(--font-mono); margin-bottom: 1rem; padding: 0.5rem 0.75rem; background: var(--bg-surface); border-left: 3px solid var(--accent-cyan); border-radius: var(--radius-sm);">
            ${firstScreen.caption}
          </div>

          <div style="color: var(--text-muted); line-height: 1.7; font-size: 0.95rem;">
            ${p.description}
          </div>

          ${credentialsHtml}
          ${featuresHtml}
          ${techTagsHtml}
          ${actionsHtml}
        `
      });

      // Bind gallery tab clicks inside modal
      if (p.screenshots.length > 1) {
        setTimeout(() => {
          const nav = document.getElementById('modalGalleryNav');
          const modalImg = document.getElementById('modalImage');
          const captionEl = document.getElementById('modalScreenshotCaption');
          const fullLink = document.getElementById('modalFullSizeLink');

          if (nav && modalImg) {
            const btns = nav.querySelectorAll('.modal-thumb-btn');
            btns.forEach(b => {
              b.addEventListener('click', () => {
                btns.forEach(x => x.classList.remove('active'));
                b.classList.add('active');

                const idx = parseInt(b.getAttribute('data-screen-index'), 10);
                const scr = p.screenshots[idx];
                if (scr) {
                  modalImg.style.opacity = '0.3';
                  setTimeout(() => {
                    modalImg.src = scr.src;
                    modalImg.style.opacity = '1';
                  }, 120);

                  if (captionEl) captionEl.textContent = scr.caption;
                  if (fullLink) fullLink.href = scr.src;
                }
              });
            });
          }
        }, 50);
      }
    }
  };

  // --- 8. CERTIFICATE FILTER & LIGHTBOX MODAL (Non-blurred High-Res Inspection) ---
  const CertificateController = {
    init() {
      const filterPills = document.querySelectorAll('.cert-filter-pill');
      const certCards = document.querySelectorAll('.cert-card');

      filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          filterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          const category = pill.getAttribute('data-cert-filter');

          certCards.forEach(card => {
            const cardCat = card.getAttribute('data-cert-cat');
            if (category === 'all' || cardCat === category) {
              card.style.display = 'flex';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 20);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(10px)';
              setTimeout(() => {
                card.style.display = 'none';
              }, 250);
            }
          });
        });
      });

      // Card click opens modal in high definition
      certCards.forEach(card => {
        card.addEventListener('click', () => {
          const title = card.querySelector('.cert-title') ? card.querySelector('.cert-title').textContent : 'Certificate';
          const issuer = card.querySelector('.cert-issuer') ? card.querySelector('.cert-issuer').textContent : '';
          const meta = card.querySelector('.cert-meta') ? card.querySelector('.cert-meta').textContent.trim() : '';
          const desc = card.querySelector('.cert-desc') ? card.querySelector('.cert-desc').innerHTML : '';
          const imgSrc = card.getAttribute('data-full-img') || card.querySelector('img').getAttribute('src');
          const verifyUrl = card.getAttribute('data-verify-url');

          let actionButtons = `
            <a href="${imgSrc}" target="_blank" class="btn btn-secondary btn-sm" title="Open original high-res image">
              <span>🔍 View Full Resolution Image</span>
              <span>↗</span>
            </a>
          `;

          if (verifyUrl) {
            actionButtons += `
              <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                <span>Verify Credential Online</span>
                <span>✓</span>
              </a>
            `;
          }

          ModalController.open({
            title: title,
            subtitle: `${issuer} • ${meta}`,
            image: imgSrc,
            contentHtml: `
              <div style="margin-bottom: 1.25rem; color: var(--text-muted); line-height: 1.7; font-size: 0.95rem;">
                ${desc}
              </div>
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; justify-content: flex-start; padding-top: 1rem; border-top: 1px solid var(--border-light);">
                ${actionButtons}
              </div>
            `
          });
        });
      });
    }
  };

  // --- 9. MODAL LIGHTBOX CONTROLLER ---
  const ModalController = {
    overlay: null,

    init() {
      this.overlay = document.getElementById('globalModalOverlay');
      const closeBtn = document.getElementById('globalModalClose');

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) this.close();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('open')) {
          this.close();
        }
      });
    },

    open({ title, subtitle, image, contentHtml }) {
      if (!this.overlay) return;

      const titleEl = document.getElementById('modalTitle');
      const subEl = document.getElementById('modalSubtitle');
      const imgEl = document.getElementById('modalImage');
      const bodyEl = document.getElementById('modalBody');

      if (titleEl) titleEl.textContent = title || 'Details';
      if (subEl) subEl.textContent = subtitle || '';
      if (imgEl) {
        if (image) {
          imgEl.src = image;
          imgEl.style.display = 'block';
        } else {
          imgEl.style.display = 'none';
        }
      }
      if (bodyEl) bodyEl.innerHTML = contentHtml || '';

      this.overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    close() {
      if (!this.overlay) return;
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // --- 10. ANIMATED STATS COUNTER ---
  const StatsCounterController = {
    hasAnimated: false,

    init() {
      const statsSection = document.querySelector('.stats-counter-banner');
      if (!statsSection) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.animateNumbers();
          }
        });
      }, { threshold: 0.3 });

      observer.observe(statsSection);
    },

    animateNumbers() {
      const counters = document.querySelectorAll('[data-counter-target]');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-counter-target'), 10);
        const suffix = counter.getAttribute('data-counter-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easedProgress * target);

          counter.textContent = `${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            counter.textContent = `${target}${suffix}`;
          }
        };

        requestAnimationFrame(updateCount);
      });
    }
  };

  // --- 11. CONTACT FORM CONTROLLER ---
  const ContactFormController = {
    init() {
      const form = document.getElementById('contactForm');
      const textarea = document.getElementById('contactMessage');
      const charCount = document.getElementById('messageCharCount');

      if (textarea && charCount) {
        textarea.addEventListener('input', () => {
          charCount.textContent = `${textarea.value.length} / 500`;
        });
      }

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit(form);
        });
      }
    },

    handleSubmit(form) {
      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const subjectInput = document.getElementById('contactSubject');
      const messageInput = document.getElementById('contactMessage');
      const submitBtn = document.getElementById('contactSubmitBtn');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !email || !message) {
        Toast.show('Please fill in all required fields.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Toast.show('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending message... ⏳';
      submitBtn.disabled = true;

      setTimeout(() => {
        const stored = JSON.parse(localStorage.getItem('russell_sent_messages') || '[]');
        stored.push({
          name,
          email,
          subject,
          message,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('russell_sent_messages', JSON.stringify(stored));

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();

        const charCount = document.getElementById('messageCharCount');
        if (charCount) charCount.textContent = '0 / 500';

        Toast.show(`Thank you ${name}! Your message has been sent to Russell Evan.`, 'success');
      }, 750);
    }
  };

  // --- 12. TOAST NOTIFICATION SYSTEM ---
  const Toast = {
    container: null,

    getContainer() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
      return this.container;
    },

    show(msg, type = 'info') {
      const container = this.getContainer();
      const toast = document.createElement('div');
      toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;

      const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
      toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;

      container.appendChild(toast);

      setTimeout(() => toast.classList.add('show'), 20);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    }
  };

  // --- 13. PRINT RESUME HANDLER ---
  const ResumeController = {
    init() {
      const printBtn = document.getElementById('printResumeBtn');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          Toast.show('Preparing printer-friendly CV format...');
          setTimeout(() => {
            window.print();
          }, 300);
        });
      }
    }
  };

  // --- 14. INITIALIZATION HOOK ---
  document.addEventListener('DOMContentLoaded', () => {
    ThemeController.init();
    ResponsiveController.init();
    AmbientCanvasController.init();
    NavigationController.init();
    TypingEffect.init();
    ProjectShowcaseController.init();
    CertificateController.init();
    ModalController.init();
    StatsCounterController.init();
    ContactFormController.init();
    ResumeController.init();

    if (typeof window.initCalculatorLoquinario === 'function') {
      window.initCalculatorLoquinario();
    }

    console.log('🚀 Russell Evan O. Loquinario Portfolio 2026 Loaded Successfully!');
  });

})();
