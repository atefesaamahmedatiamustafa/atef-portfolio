/**
 * Atef Esaam Ahmed Portfolio — Database & Synchronization Module
 * Handles local caching and shared cloud database synchronization
 * for projects and dynamic content.
 */

(function(window) {
    'use strict';

    const DB_STORAGE_KEY = 'atef_portfolio_projects_v2';
    const DB_CLOUD_CONFIG_KEY = 'atef_portfolio_cloud_config';

    // The verified real projects data (Project Sentinel & Project Aftershock)
    const DEFAULT_PROJECTS = [
        {
            id: 'project-sentinel-neo-pipeline',
            title: 'Project Sentinel — Near-Earth Object (NEO) Triage Pipeline',
            category: 'AI / Data Science / Data Analytics / Python',
            status: 'Completed', // 'Completed' | 'In Progress' | 'Practice'
            date: '2026',
            githubUrl: 'https://github.com/atefesaamahmedatiamustafa/project-sentinel',
            demoUrl: '', // Left empty so Live Demo button is hidden
            description: "An automated Near-Earth Object (NEO) Triage Pipeline built using real data from NASA's NeoWs API. The project processes, validates, transforms, and classifies Near-Earth Objects using a rule-based approach to identify cases that may require closer analyst review.",
            focusAreas: [
                'Data Acquisition',
                'Data Cleaning',
                'Data Validation',
                'Data Integration',
                'Feature Engineering',
                'Rule-Based Classification',
                'Data Processing',
                'Data Analysis'
            ],
            technologies: [
                'Python',
                'NASA NeoWs API',
                'Data Processing',
                'Data Validation',
                'Feature Engineering',
                'Rule-Based Classification',
                'Min-Max Scaling'
            ],
            problem: 'Near-Earth Object data can contain multiple attributes that need to be processed and evaluated before identifying objects that may require closer review.',
            solution: 'Built an automated Python pipeline that retrieves NEO data, cleans and validates it, integrates relevant information, engineers useful features, and applies a rule-based triage approach.',
            whatILearned: [
                'Working with API data',
                'Data cleaning and validation',
                'Data integration',
                'Feature engineering',
                'Rule-based classification',
                'Data processing',
                'Building an automated data pipeline',
                'Translating raw data into actionable analytical features'
            ],
            visible: true,
            order: 1
        },
        {
            id: 'project-aftershock-seismic-triage',
            title: 'Project Aftershock — Regional Seismic Risk Triage',
            category: 'Data Science / Data Analysis / Python / Data Pipeline',
            status: 'Completed',
            date: '2026',
            githubUrl: 'https://github.com/atefesaamahmedatiamustafa/Project_Aftershock',
            demoUrl: '', // Left empty so Live Demo button is hidden
            description: "An automated first-pass seismic risk triage pipeline using earthquake data from the USGS Earthquake Catalog, with data processing, validation, and rule-based classification.",
            focusAreas: [
                'Data Acquisition',
                'Data Cleaning',
                'Data Validation',
                'Data Transformation',
                'Rule-Based Classification',
                'CSV & JSON Processing',
                'Python File Handling',
                'First-Pass Risk Triage'
            ],
            technologies: [
                'Python',
                'Requests',
                'JSON',
                'CSV',
                'Pathlib',
                'Regex',
                'USGS Earthquake Catalog'
            ],
            problem: 'Earthquake catalogs contain continuous streams of global events. Reviewing every event manually is inefficient when analysts need to quickly identify potentially significant events.',
            solution: 'Built an automated Python triage pipeline that fetches earthquake data from the USGS Earthquake Catalog, validates and cleans event records, applies a transparent rule-based classification (significant = 1 when mag >= 5.0), and structures raw and processed CSV datasets.',
            whatILearned: [
                'Working with external data sources (USGS Earthquake Catalog)',
                'Automated data acquisition using Python Requests',
                'Parsing and validating nested JSON earthquake data',
                'Data cleaning and attribute validation',
                'CSV file handling and data transformation',
                'Robust file path management with pathlib',
                'Pattern matching and text parsing with regular expressions (Regex)',
                'Implementing transparent rule-based classification flags',
                'Structuring reproducible raw vs. processed data pipelines',
                'Turning raw seismic event feeds into structured analytical outputs'
            ],
            visible: true,
            order: 2
        }
    ];

    const PortfolioDB = {
        /**
         * Initialize DB
         */
        init: function() {
            const currentData = localStorage.getItem(DB_STORAGE_KEY);
            if (!currentData) {
                this.setLocalProjects(DEFAULT_PROJECTS);
            } else {
                try {
                    let existing = JSON.parse(currentData);
                    if (Array.isArray(existing)) {
                        // Ensure both default projects exist in database
                        let modified = false;
                        DEFAULT_PROJECTS.forEach(defProj => {
                            if (!existing.some(p => p.id === defProj.id || p.title.toLowerCase().includes(defProj.title.split('—')[0].trim().toLowerCase()))) {
                                existing.push(defProj);
                                modified = true;
                            }
                        });
                        if (modified) {
                            this.setLocalProjects(existing);
                        }
                    }
                } catch (e) {
                    this.setLocalProjects(DEFAULT_PROJECTS);
                }
            }
        },

        /**
         * Get all projects (sorted by order)
         * @param {boolean} includeHidden - whether to include hidden projects (for admin)
         * @returns {Array} List of projects
         */
        getProjects: function(includeHidden = false) {
            try {
                const raw = localStorage.getItem(DB_STORAGE_KEY);
                let projects = raw ? JSON.parse(raw) : DEFAULT_PROJECTS;
                
                if (!Array.isArray(projects) || projects.length === 0) {
                    projects = DEFAULT_PROJECTS;
                    this.setLocalProjects(projects);
                }

                if (!includeHidden) {
                    projects = projects.filter(p => p.visible !== false);
                }

                return projects.sort((a, b) => (a.order || 0) - (b.order || 0));
            } catch (e) {
                console.error('Error loading projects from DB:', e);
                return DEFAULT_PROJECTS;
            }
        },

        /**
         * Get a single project by ID
         */
        getProjectById: function(id) {
            const projects = this.getProjects(true);
            return projects.find(p => p.id === id) || null;
        },

        /**
         * Save a project (Create or Update)
         */
        saveProject: function(projectData) {
            const projects = this.getProjects(true);
            const isNew = !projectData.id;
            
            if (isNew) {
                projectData.id = 'proj-' + Date.now();
                projectData.order = projects.length + 1;
                if (projectData.visible === undefined) projectData.visible = true;
                projects.push(projectData);
            } else {
                const index = projects.findIndex(p => p.id === projectData.id);
                if (index !== -1) {
                    projects[index] = { ...projects[index], ...projectData };
                } else {
                    projects.push(projectData);
                }
            }

            this.setLocalProjects(projects);
            this.triggerCloudSync(projects);
            return projectData;
        },

        /**
         * Delete a project by ID
         */
        deleteProject: function(id) {
            let projects = this.getProjects(true);
            projects = projects.filter(p => p.id !== id);
            this.setLocalProjects(projects);
            this.triggerCloudSync(projects);
            return true;
        },

        /**
         * Duplicate a project by ID
         */
        duplicateProject: function(id) {
            const project = this.getProjectById(id);
            if (!project) return null;

            const cloned = JSON.parse(JSON.stringify(project));
            cloned.id = 'proj-' + Date.now();
            cloned.title = cloned.title + ' (Copy)';
            cloned.order = (project.order || 1) + 0.5;

            const projects = this.getProjects(true);
            projects.push(cloned);
            
            // Normalize orders
            projects.sort((a, b) => (a.order || 0) - (b.order || 0));
            projects.forEach((p, idx) => p.order = idx + 1);

            this.setLocalProjects(projects);
            this.triggerCloudSync(projects);
            return cloned;
        },

        /**
         * Reorder projects
         * @param {Array<string>} orderedIds - List of project IDs in desired order
         */
        reorderProjects: function(orderedIds) {
            const projects = this.getProjects(true);
            const map = new Map(projects.map(p => [p.id, p]));
            
            const reordered = [];
            orderedIds.forEach((id, idx) => {
                const p = map.get(id);
                if (p) {
                    p.order = idx + 1;
                    reordered.push(p);
                    map.delete(id);
                }
            });

            // Add any remaining
            map.forEach(p => {
                p.order = reordered.length + 1;
                reordered.push(p);
            });

            this.setLocalProjects(reordered);
            this.triggerCloudSync(reordered);
            return reordered;
        },

        /**
         * Reset to default verified projects
         */
        resetToDefault: function() {
            this.setLocalProjects(DEFAULT_PROJECTS);
            this.triggerCloudSync(DEFAULT_PROJECTS);
            return DEFAULT_PROJECTS;
        },

        /**
         * Save to localStorage
         */
        setLocalProjects: function(projects) {
            localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(projects));
        },

        /**
         * Export database as JSON string
         */
        exportJSON: function() {
            const data = {
                timestamp: new Date().toISOString(),
                version: '2.0',
                projects: this.getProjects(true)
            };
            return JSON.stringify(data, null, 2);
        },

        /**
         * Import database from JSON string
         */
        importJSON: function(jsonString) {
            try {
                const parsed = JSON.parse(jsonString);
                let projects = Array.isArray(parsed) ? parsed : (parsed.projects || []);
                if (!Array.isArray(projects) || projects.length === 0) {
                    throw new Error('Invalid JSON format: projects array not found');
                }
                this.setLocalProjects(projects);
                this.triggerCloudSync(projects);
                return { success: true, count: projects.length };
            } catch (err) {
                return { success: false, error: err.message };
            }
        },

        /**
         * Cloud Config Settings (Endpoint/API Key for Shared Server Sync)
         */
        getCloudConfig: function() {
            try {
                const raw = localStorage.getItem(DB_CLOUD_CONFIG_KEY);
                return raw ? JSON.parse(raw) : { endpoint: '', apiKey: '', enabled: false };
            } catch (e) {
                return { endpoint: '', apiKey: '', enabled: false };
            }
        },

        saveCloudConfig: function(config) {
            localStorage.setItem(DB_CLOUD_CONFIG_KEY, JSON.stringify(config));
        },

        /**
         * Trigger Cloud Synchronization to Server / Shared DB
         */
        triggerCloudSync: async function(projects) {
            const config = this.getCloudConfig();
            if (!config.enabled || !config.endpoint) return;

            try {
                const response = await fetch(config.endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(config.apiKey ? { 'X-Master-Key': config.apiKey, 'Authorization': `Bearer ${config.apiKey}` } : {})
                    },
                    body: JSON.stringify({ projects: projects, updatedAt: new Date().toISOString() })
                });

                if (!response.ok) {
                    console.warn('Cloud sync response error:', response.status);
                }
            } catch (err) {
                console.warn('Cloud sync could not reach endpoint:', err);
            }
        },

        /**
         * Fetch latest from Cloud Database if available
         */
        fetchFromCloud: async function() {
            const config = this.getCloudConfig();
            if (!config.enabled || !config.endpoint) return null;

            try {
                const response = await fetch(config.endpoint, {
                    headers: config.apiKey ? { 'X-Master-Key': config.apiKey, 'Authorization': `Bearer ${config.apiKey}` } : {}
                });

                if (response.ok) {
                    const data = await response.json();
                    const projects = data.projects || (Array.isArray(data) ? data : null);
                    if (projects && Array.isArray(projects) && projects.length > 0) {
                        this.setLocalProjects(projects);
                        return projects;
                    }
                }
            } catch (err) {
                console.warn('Could not fetch from cloud database:', err);
            }
            return null;
        }
    };

    // Initialize DB immediately
    PortfolioDB.init();

    // Attach to global window
    window.PortfolioDB = PortfolioDB;

})(window);
