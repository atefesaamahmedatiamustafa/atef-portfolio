/**
 * Atef Esaam Ahmed Portfolio — Admin Dashboard Controller
 * Handles project CRUD operations, authentication, reordering,
 * cloud sync, and backup/restore.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Admin Auth State
    const AUTH_SESSION_KEY = 'atef_portfolio_admin_auth';
    const DEFAULT_ADMIN_PIN = 'admin2026';

    // DOM Elements
    const loginScreen = document.getElementById('admin-login-screen');
    const adminApp = document.getElementById('admin-app');
    const loginForm = document.getElementById('admin-login-form');
    const pinInput = document.getElementById('admin-pin');
    const authErrorMsg = document.getElementById('auth-error-msg');
    const btnLogout = document.getElementById('btn-logout');

    const projectsListContainer = document.getElementById('admin-projects-list');
    const projectCountBadge = document.getElementById('project-count-badge');
    const btnOpenAddModal = document.getElementById('btn-open-add-modal');
    const btnCloudSync = document.getElementById('btn-cloud-sync');
    const btnExportJson = document.getElementById('btn-export-json');
    const importJsonInput = document.getElementById('import-json-input');

    const projectModal = document.getElementById('admin-project-modal');
    const modalClose = document.getElementById('admin-modal-close');
    const modalOverlay = document.getElementById('admin-modal-overlay');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const projectForm = document.getElementById('project-editor-form');
    const formModalTitle = document.getElementById('form-modal-title');

    // Form inputs
    const editId = document.getElementById('edit-project-id');
    const editTitle = document.getElementById('edit-title');
    const editCategory = document.getElementById('edit-category');
    const editStatus = document.getElementById('edit-status');
    const editGithub = document.getElementById('edit-github');
    const editDemo = document.getElementById('edit-demo');
    const editDate = document.getElementById('edit-date');
    const editVisible = document.getElementById('edit-visible');
    const editDescription = document.getElementById('edit-description');
    const editFocus = document.getElementById('edit-focus');
    const editTechs = document.getElementById('edit-techs');
    const editProblem = document.getElementById('edit-problem');
    const editSolution = document.getElementById('edit-solution');
    const editLearned = document.getElementById('edit-learned');

    // Cloud config inputs
    const cloudConfigForm = document.getElementById('cloud-config-form');
    const cloudEndpoint = document.getElementById('cloud-endpoint');
    const cloudApiKey = document.getElementById('cloud-api-key');
    const cloudEnableToggle = document.getElementById('cloud-enable-toggle');

    const toastContainer = document.getElementById('admin-toast-container');

    // --- Authentication ---
    function checkAuth() {
        const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
        if (isAuth) {
            loginScreen.style.display = 'none';
            adminApp.style.display = 'block';
            loadAdminProjects();
            loadCloudConfig();
        } else {
            loginScreen.style.display = 'flex';
            adminApp.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPin = pinInput.value.trim();
            if (enteredPin === DEFAULT_ADMIN_PIN || enteredPin === 'atef2026') {
                sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
                authErrorMsg.style.display = 'none';
                checkAuth();
                showToast('Welcome back, Atef! Dashboard unlocked.', 'success');
            } else {
                authErrorMsg.style.display = 'block';
                pinInput.focus();
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
            checkAuth();
            showToast('Logged out successfully.', 'info');
        });
    }

    // --- Toast Notifications ---
    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `admin-toast toast-${type} fade-in visible`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- Load and Render Admin Projects ---
    function loadAdminProjects() {
        if (!projectsListContainer || !window.PortfolioDB) return;

        const projects = window.PortfolioDB.getProjects(true); // include hidden
        if (projectCountBadge) projectCountBadge.textContent = projects.length;

        if (projects.length === 0) {
            projectsListContainer.innerHTML = `
                <div class="empty-projects-state">
                    <i class="fas fa-folder-plus"></i>
                    <h4>No Projects in Database</h4>
                    <p>Click "Add New Project" above to create your first real project.</p>
                </div>
            `;
            return;
        }

        projectsListContainer.innerHTML = projects.map((p, idx) => {
            const statusClass = p.status === 'In Progress' ? 'status-progress' : (p.status === 'Practice' ? 'status-practice' : 'status-completed');
            const statusIcon = p.status === 'In Progress' ? 'fa-spinner fa-spin' : (p.status === 'Practice' ? 'fa-flask' : 'fa-check-circle');

            return `
                <div class="admin-project-item ${p.visible === false ? 'item-hidden' : ''}" data-id="${p.id}" data-order="${p.order || idx + 1}">
                    <div class="item-drag-order">
                        <span class="order-badge">#${idx + 1}</span>
                        <div class="order-btns">
                            <button class="btn-order-move btn-move-up" data-id="${p.id}" title="Move Up" ${idx === 0 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <button class="btn-order-move btn-move-down" data-id="${p.id}" title="Move Down" ${idx === projects.length - 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    <div class="item-main-info">
                        <div class="item-header-meta">
                            <span class="project-category-badge">${escapeHtml(p.category || 'AI / Data Science')}</span>
                            <span class="project-status-badge ${statusClass}"><i class="fas ${statusIcon}"></i> ${escapeHtml(p.status || 'Completed')}</span>
                            ${p.visible === false ? '<span class="badge-hidden"><i class="fas fa-eye-slash"></i> Hidden</span>' : ''}
                        </div>
                        <h4 class="item-title">${escapeHtml(p.title)}</h4>
                        <p class="item-desc">${escapeHtml(p.description || '')}</p>
                        
                        <div class="item-meta-links">
                            <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="link-tag">
                                <i class="fab fa-github"></i> ${escapeHtml(p.githubUrl)}
                            </a>
                            ${p.demoUrl ? `<a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener noreferrer" class="link-tag"><i class="fas fa-external-link-alt"></i> Demo</a>` : ''}
                        </div>
                    </div>

                    <div class="item-actions">
                        <button class="btn btn-sm btn-outline-tech btn-edit-proj" data-id="${p.id}" title="Edit Project">
                            <i class="fas fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-secondary btn-duplicate-proj" data-id="${p.id}" title="Duplicate Project">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="btn btn-sm ${p.visible === false ? 'btn-outline-tech' : 'btn-secondary'} btn-toggle-vis" data-id="${p.id}" title="Toggle Visibility">
                            <i class="fas ${p.visible === false ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger-tech btn-delete-proj" data-id="${p.id}" title="Delete Project">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        attachAdminItemListeners();
    }

    // Attach Action Listeners on Project Items
    function attachAdminItemListeners() {
        // Edit
        document.querySelectorAll('.btn-edit-proj').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        // Duplicate
        document.querySelectorAll('.btn-duplicate-proj').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const duplicated = window.PortfolioDB.duplicateProject(id);
                if (duplicated) {
                    loadAdminProjects();
                    showToast(`Project duplicated as "${duplicated.title}"`, 'success');
                }
            });
        });

        // Visibility toggle
        document.querySelectorAll('.btn-toggle-vis').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const proj = window.PortfolioDB.getProjectById(id);
                if (proj) {
                    proj.visible = proj.visible === false ? true : false;
                    window.PortfolioDB.saveProject(proj);
                    loadAdminProjects();
                    showToast(`Project visibility updated: ${proj.visible ? 'Visible' : 'Hidden'}`, 'info');
                }
            });
        });

        // Delete
        document.querySelectorAll('.btn-delete-proj').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const proj = window.PortfolioDB.getProjectById(id);
                if (!proj) return;

                if (confirm(`Are you sure you want to delete "${proj.title}"? This cannot be undone.`)) {
                    window.PortfolioDB.deleteProject(id);
                    loadAdminProjects();
                    showToast(`Project deleted successfully.`, 'warning');
                }
            });
        });

        // Move Up
        document.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                moveProject(id, -1);
            });
        });

        // Move Down
        document.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                moveProject(id, 1);
            });
        });
    }

    // Move project in order
    function moveProject(id, direction) {
        const projects = window.PortfolioDB.getProjects(true);
        const currentIndex = projects.findIndex(p => p.id === id);
        if (currentIndex === -1) return;

        const targetIndex = currentIndex + direction;
        if (targetIndex < 0 || targetIndex >= projects.length) return;

        // Swap in array
        const temp = projects[currentIndex];
        projects[currentIndex] = projects[targetIndex];
        projects[targetIndex] = temp;

        const orderedIds = projects.map(p => p.id);
        window.PortfolioDB.reorderProjects(orderedIds);
        loadAdminProjects();
        showToast('Project order updated.', 'info');
    }

    // --- Modal Add / Edit Form Handling ---
    function openAddModal() {
        formModalTitle.innerHTML = '<i class="fas fa-folder-plus"></i> Add New Project';
        projectForm.reset();
        editId.value = '';
        editVisible.checked = true;
        editStatus.value = 'Completed';
        editCategory.value = 'AI / Data Science / Python';
        editDate.value = new Date().getFullYear().toString();
        
        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
    }

    function openEditModal(id) {
        const proj = window.PortfolioDB.getProjectById(id);
        if (!proj) return;

        formModalTitle.innerHTML = '<i class="fas fa-pen-to-square"></i> Edit Project';
        editId.value = proj.id;
        editTitle.value = proj.title || '';
        editCategory.value = proj.category || '';
        editStatus.value = proj.status || 'Completed';
        editGithub.value = proj.githubUrl || '';
        editDemo.value = proj.demoUrl || '';
        editDate.value = proj.date || '';
        editVisible.checked = proj.visible !== false;
        editDescription.value = proj.description || '';

        editFocus.value = Array.isArray(proj.focusAreas) ? proj.focusAreas.join(', ') : (proj.focusAreas || '');
        editTechs.value = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '');
        editProblem.value = proj.problem || '';
        editSolution.value = proj.solution || '';
        
        if (Array.isArray(proj.whatILearned)) {
            editLearned.value = proj.whatILearned.join('\n');
        } else {
            editLearned.value = proj.whatILearned || '';
        }

        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
    }

    if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', openAddModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    // Save project form submission
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = editTitle.value.trim();
            const category = editCategory.value.trim();
            const status = editStatus.value;
            const githubUrl = editGithub.value.trim();
            const demoUrl = editDemo.value.trim();
            const date = editDate.value.trim();
            const visible = editVisible.checked;
            const description = editDescription.value.trim();

            const focusAreas = editFocus.value.split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const technologies = editTechs.value.split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const problem = editProblem.value.trim();
            const solution = editSolution.value.trim();

            const whatILearned = editLearned.value
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const projectData = {
                id: editId.value || undefined,
                title,
                category,
                status,
                githubUrl,
                demoUrl,
                date,
                visible,
                description,
                focusAreas,
                technologies,
                problem,
                solution,
                whatILearned
            };

            const saved = window.PortfolioDB.saveProject(projectData);
            closeModal();
            loadAdminProjects();
            showToast(`Project "${saved.title}" saved successfully to database!`, 'success');
        });
    }

    // --- Cloud Config Settings ---
    function loadCloudConfig() {
        if (!window.PortfolioDB) return;
        const config = window.PortfolioDB.getCloudConfig();
        if (cloudEndpoint) cloudEndpoint.value = config.endpoint || '';
        if (cloudApiKey) cloudApiKey.value = config.apiKey || '';
        if (cloudEnableToggle) cloudEnableToggle.checked = !!config.enabled;
    }

    if (cloudConfigForm) {
        cloudConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const config = {
                endpoint: cloudEndpoint.value.trim(),
                apiKey: cloudApiKey.value.trim(),
                enabled: cloudEnableToggle.checked
            };

            window.PortfolioDB.saveCloudConfig(config);
            showToast('Cloud database settings saved successfully.', 'success');

            if (config.enabled && config.endpoint) {
                btnCloudSync.click();
            }
        });
    }

    if (btnCloudSync) {
        btnCloudSync.addEventListener('click', async () => {
            btnCloudSync.disabled = true;
            btnCloudSync.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

            const projects = window.PortfolioDB.getProjects(true);
            await window.PortfolioDB.triggerCloudSync(projects);

            setTimeout(() => {
                btnCloudSync.disabled = false;
                btnCloudSync.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Cloud Sync';
                showToast('Cloud database synchronized successfully!', 'success');
            }, 800);
        });
    }

    // --- JSON Backup & Restore ---
    if (btnExportJson) {
        btnExportJson.addEventListener('click', () => {
            const jsonStr = window.PortfolioDB.exportJSON();
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio_projects_backup_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Projects database exported as JSON backup.', 'success');
        });
    }

    if (importJsonInput) {
        importJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const result = window.PortfolioDB.importJSON(evt.target.result);
                if (result.success) {
                    loadAdminProjects();
                    showToast(`Successfully imported ${result.count} project(s) from JSON backup.`, 'success');
                } else {
                    showToast(`Failed to import JSON: ${result.error}`, 'error');
                }
                importJsonInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    // Helper escaper
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Run Auth check on start
    checkAuth();
});
