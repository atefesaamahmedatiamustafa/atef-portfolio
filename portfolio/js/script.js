// =========================================
// SCRIPT INITIALIZATION & RESPONSIVE BEHAVIORS
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Add js-ready class for smooth progressive enhancement
    document.documentElement.classList.add('js-ready');

    // DOM Elements
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.documentElement;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    // --- Mobile Navigation Toggle ---
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open', isActive);
            hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close mobile menu when clicking on any nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // --- Theme Toggle (Dark / Light Mode) ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            initParticles(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'light') {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
    }

    // --- Scroll Reveal Animations (IntersectionObserver) ---
    const initScrollReveal = () => {
        const fadeElements = document.querySelectorAll('.fade-in');

        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.05
            };

            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            fadeElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('visible');
                } else {
                    revealObserver.observe(el);
                }
            });
        } else {
            fadeElements.forEach(el => el.classList.add('visible'));
        }
    };

    initScrollReveal();

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();

    // --- Particles.js Background Configuration ---
    function initParticles(theme) {
        if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
            const isMobile = window.innerWidth < 768;
            const particleCount = isMobile ? 30 : 65;
            const linkDistance = isMobile ? 110 : 140;
            const isLight = theme === 'light';

            const particleColors = isLight 
                ? ["#0284c7", "#0369a1", "#0ea5e9"] 
                : ["#38bdf8", "#0ea5e9", "#60a5fa"];
            const lineColor = isLight ? "#0284c7" : "#38bdf8";

            particlesJS('particles-js', {
                "particles": {
                    "number": { 
                        "value": particleCount, 
                        "density": { "enable": true, "value_area": 800 } 
                    },
                    "color": { "value": particleColors },
                    "shape": { "type": "circle" },
                    "opacity": { "value": isLight ? 0.6 : 0.5, "random": true },
                    "size": { "value": 2.5, "random": true },
                    "line_linked": {
                        "enable": true,
                        "distance": linkDistance,
                        "color": lineColor,
                        "opacity": isLight ? 0.22 : 0.18,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": isMobile ? 1.5 : 2.2,
                        "direction": "none",
                        "random": false,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false
                    }
                },
                "interactivity": {
                    "detect_on": "window",
                    "events": {
                        "onhover": { "enable": !isMobile, "mode": "grab" },
                        "onclick": { "enable": true, "mode": "push" },
                        "resize": true
                    },
                    "modes": {
                        "grab": { "distance": 160, "line_linked": { "opacity": 0.7 } },
                        "push": { "particles_nb": 3 }
                    }
                },
                "retina_detect": true
            });
        }
    }

    initParticles(savedTheme);

    // --- 3D Parallax Tilt Effect on Hero Image (Desktop) ---
    const heroImageCard = document.getElementById('hero-image-card');
    if (heroImageCard && window.innerWidth > 992) {
        const imageWrapper = heroImageCard.querySelector('.hero-image-wrapper');
        
        heroImageCard.addEventListener('mousemove', (e) => {
            const rect = heroImageCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            heroImageCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
            if (imageWrapper) {
                imageWrapper.style.transform = `translateZ(20px)`;
            }
        });
        
        heroImageCard.addEventListener('mouseleave', () => {
            heroImageCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            heroImageCard.style.transition = 'transform 0.5s ease';
            if (imageWrapper) {
                imageWrapper.style.transform = 'translateZ(0px)';
                imageWrapper.style.transition = 'transform 0.5s ease';
            }
            setTimeout(() => {
                heroImageCard.style.transition = '';
                if (imageWrapper) imageWrapper.style.transition = '';
            }, 500);
        });
        
        heroImageCard.addEventListener('mouseenter', () => {
            heroImageCard.style.transition = 'none';
            if (imageWrapper) imageWrapper.style.transition = 'none';
        });
    }

    // =========================================================================
    // DYNAMIC PROJECTS RENDERING & DETAILS MODAL
    // =========================================================================

    const projectsGrid = document.getElementById('projects-grid');
    const projectModal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');

    // Helper to determine tech pill class
    function getTechPillClass(techName) {
        const t = techName.toLowerCase();
        if (t.includes('python')) return 'pill-python';
        if (t.includes('api') || t.includes('neows') || t.includes('rest') || t.includes('requests') || t.includes('usgs') || t.includes('catalog')) return 'pill-api';
        if (t.includes('data') || t.includes('cleaning') || t.includes('validation') || t.includes('json') || t.includes('csv') || t.includes('pathlib') || t.includes('pipeline')) return 'pill-data';
        if (t.includes('ai') || t.includes('learning') || t.includes('classification') || t.includes('feature') || t.includes('regex') || t.includes('scaling')) return 'pill-ai';
        if (t.includes('c++') || t.includes('java') || t.includes('excel')) return 'pill-excel';
        if (t.includes('html') || t.includes('css') || t.includes('javascript') || t.includes('web')) return 'pill-html';
        return 'pill-python';
    }

    // Helper to render status badge
    function getStatusBadge(status) {
        const s = (status || 'Completed').toLowerCase();
        if (s.includes('progress')) {
            return `<span class="project-status-badge status-progress"><i class="fas fa-spinner fa-spin"></i> In Progress</span>`;
        }
        if (s.includes('practice')) {
            return `<span class="project-status-badge status-practice"><i class="fas fa-flask"></i> Practice</span>`;
        }
        return `<span class="project-status-badge status-completed"><i class="fas fa-check-circle"></i> Completed</span>`;
    }

    // Render projects list into DOM
    function renderProjects() {
        if (!projectsGrid || !window.PortfolioDB) return;

        const projects = window.PortfolioDB.getProjects(false);
        if (!projects || projects.length === 0) return;

        projectsGrid.innerHTML = projects.map(proj => {
            const techStackHtml = Array.isArray(proj.technologies) && proj.technologies.length > 0
                ? `<div class="tech-stack">
                    ${proj.technologies.map(t => `<span class="${getTechPillClass(t)}">${escapeHtml(t)}</span>`).join('')}
                </div>`
                : '';

            const demoButtonHtml = proj.demoUrl && proj.demoUrl.trim() !== '' && proj.demoUrl !== '#'
                ? `<a href="${escapeHtml(proj.demoUrl)}" class="btn btn-project-demo" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>`
                : '';

            const githubButtonHtml = proj.githubUrl && proj.githubUrl.trim() !== '' && proj.githubUrl !== '#'
                ? `<a href="${escapeHtml(proj.githubUrl)}" class="btn btn-project-github" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-github"></i> GitHub Repo <i class="fas fa-external-link-alt"></i>
                </a>`
                : '';

            return `
                <div class="project-card project-card-pipeline fade-in visible" data-id="${escapeHtml(proj.id)}">
                    <div class="project-card-header">
                        <span class="project-category-badge"><i class="fas fa-brain"></i> ${escapeHtml(proj.category || 'AI / Data Science')}</span>
                        ${getStatusBadge(proj.status)}
                    </div>

                    <div class="project-content">
                        <h3 class="project-title">${escapeHtml(proj.title)}</h3>
                        <p class="project-description">${escapeHtml(proj.description || '')}</p>

                        ${techStackHtml}

                        <div class="project-card-actions">
                            <button type="button" class="btn btn-project-details btn-details" data-project-id="${escapeHtml(proj.id)}">
                                <i class="fas fa-info-circle"></i> View Details
                            </button>
                            ${githubButtonHtml}
                            ${demoButtonHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        attachProjectEventListeners();
    }

    // Attach click listeners to cards and detail buttons
    function attachProjectEventListeners() {
        const detailButtons = document.querySelectorAll('.btn-details');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.getAttribute('data-project-id');
                openProjectModal(projectId);
            });
        });
    }

    // Open project details modal
    function openProjectModal(projectId) {
        if (!projectModal || !window.PortfolioDB) return;

        const proj = window.PortfolioDB.getProjectById(projectId);
        if (!proj) return;

        // Populate elements
        const catEl = document.getElementById('modal-category');
        const statusEl = document.getElementById('modal-status');
        const titleEl = document.getElementById('modal-project-title');
        const descEl = document.getElementById('modal-description');
        const focusBlockEl = document.getElementById('modal-focus-block');
        const focusTagsEl = document.getElementById('modal-focus-tags');
        const probEl = document.getElementById('modal-problem');
        const solEl = document.getElementById('modal-solution');
        const learnedListEl = document.getElementById('modal-learned-list');
        const techStackEl = document.getElementById('modal-tech-stack');
        const actionsEl = document.getElementById('modal-actions');

        if (catEl) catEl.textContent = proj.category || 'AI / Data Science / Python';
        if (statusEl) {
            statusEl.className = 'project-status-badge ' + (proj.status === 'In Progress' ? 'status-progress' : (proj.status === 'Practice' ? 'status-practice' : 'status-completed'));
            statusEl.innerHTML = proj.status === 'In Progress' 
                ? '<i class="fas fa-spinner fa-spin"></i> In Progress' 
                : (proj.status === 'Practice' ? '<i class="fas fa-flask"></i> Practice' : '<i class="fas fa-check-circle"></i> Completed');
        }
        if (titleEl) titleEl.textContent = proj.title;
        if (descEl) descEl.textContent = proj.description || '';

        // Pipeline Focus Areas in Modal
        if (focusBlockEl && focusTagsEl) {
            if (Array.isArray(proj.focusAreas) && proj.focusAreas.length > 0) {
                focusBlockEl.style.display = 'block';
                focusTagsEl.innerHTML = proj.focusAreas.map(f => `<span>${escapeHtml(f)}</span>`).join('');
            } else {
                focusBlockEl.style.display = 'none';
            }
        }

        if (probEl) probEl.textContent = proj.problem || '';
        if (solEl) solEl.textContent = proj.solution || '';

        // What I Learned list
        if (learnedListEl) {
            const list = Array.isArray(proj.whatILearned) && proj.whatILearned.length > 0
                ? proj.whatILearned
                : [];
            
            learnedListEl.innerHTML = list.map(item => `<li>${escapeHtml(item)}</li>`).join('');
        }

        // Tech stack
        if (techStackEl) {
            const techs = Array.isArray(proj.technologies) && proj.technologies.length > 0
                ? proj.technologies
                : [];

            techStackEl.innerHTML = techs.map(t => `<span class="${getTechPillClass(t)}">${escapeHtml(t)}</span>`).join('');
        }

        // Actions
        if (actionsEl) {
            let actionsHtml = '';
            if (proj.githubUrl && proj.githubUrl.trim() !== '' && proj.githubUrl !== '#') {
                actionsHtml += `
                    <a href="${escapeHtml(proj.githubUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        <i class="fab fa-github"></i> View on GitHub <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
            }
            if (proj.demoUrl && proj.demoUrl.trim() !== '' && proj.demoUrl !== '#') {
                actionsHtml += `
                    <a href="${escapeHtml(proj.demoUrl)}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                `;
            }
            actionsEl.innerHTML = actionsHtml;
        }

        // Show modal
        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    // Close modal
    function closeProjectModal() {
        if (!projectModal) return;
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    if (modalClose) modalClose.addEventListener('click', closeProjectModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeProjectModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
            closeProjectModal();
        }
    });

    // Helper HTML escaper
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initialize projects on load
    renderProjects();

    // Check for fresh cloud updates asynchronously
    if (window.PortfolioDB && typeof window.PortfolioDB.fetchFromCloud === 'function') {
        window.PortfolioDB.fetchFromCloud().then(updated => {
            if (updated) {
                renderProjects();
            }
        });
    }
});
