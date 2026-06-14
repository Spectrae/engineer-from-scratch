import { Progress } from './progress.js';
import { Storage } from './storage.js';
import { Bookmarks } from './bookmarks.js';
import { Notes } from './notes.js';

export const UI = {
    root: document.getElementById('app-root'),
    cachedData: {
        track_a: null,
        track_b: null
    },

    async fetchTrackData(trackId) {
        if (this.cachedData[trackId]) return this.cachedData[trackId];
        try {
            const fileMap = { 'track_a': 'data/fullstack.json', 'track_b': 'data/aiml.json' };
            const response = await fetch(fileMap[trackId]);
            if (!response.ok) throw new Error('Data file not found');
            const data = await response.json();
            this.cachedData[trackId] = data;
            return data;
        } catch (error) {
            console.error('[UI] Error fetching data:', error);
            return null;
        }
    },

    renderLandingPage() {
        const lastRoute = Storage.getLastRoute();
        const bookmarks = Storage.getBookmarks();
        let bookmarksHtml = bookmarks.length > 0 ? bookmarks.map(b => `
            <div class="bookmark-item">
                <a href="${b.url}">> ${b.title}</a>
                <button class="bookmark-btn active" data-id="${b.title}" data-title="${b.title}" data-url="${b.url}">★</button>
            </div>
        `).join('') : '<div class="empty-state">No bookmarks saved yet.</div>';

        this.root.innerHTML = `
            <div class="dashboard-layout">
                <header class="dashboard-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div><h2>System Dashboard</h2><p>Track your 24-week intensive progress.</p></div>
                    <a href="${lastRoute}" class="btn btn-primary">Resume Learning →</a>
                </header>
                <section class="stats-grid">
                    <div class="stat-card"><span class="stat-label">Overall Progress</span><span class="stat-value" id="stat-overall">0%</span></div>
                    <div class="stat-card"><span class="stat-label">Completed Tasks</span><span class="stat-value" id="stat-tasks">0</span></div>
                </section>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-xl);">
                    <section class="tracks-grid" style="grid-template-columns: 1fr;">
                        <div class="card"><div class="card-header"><span class="card-subtitle">Track A</span><h3 class="card-title">Full-Stack Engineering</h3></div><a href="#/track/track_a" class="btn btn-secondary btn-block">View Track A</a></div>
                        <div class="card"><div class="card-header"><span class="card-subtitle">Track B</span><h3 class="card-title">AI / ML Engineering</h3></div><a href="#/track/track_b" class="btn btn-secondary btn-block">View Track B</a></div>
                    </section>
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-xl);">
                        <section class="card"><div class="card-header"><h3 class="card-title">Saved Bookmarks</h3></div><div class="bookmark-list">${bookmarksHtml}</div></section>
                        <section class="card"><div class="card-header"><h3 class="card-title">Recent Activity</h3></div><div class="activity-list"><div class="empty-state">No recent activity found.</div></div></section>
                    </div>
                </div>
            </div>
        `;
        Progress.updateUI();
        Bookmarks.init();
    },

    renderTracksPage() {
        this.root.innerHTML = `
            <div class="dashboard-layout">
                <header class="dashboard-header"><h2>Curriculum Tracks</h2><p>Select a track to view its complete roadmap.</p></header>
                <section class="tracks-grid">
                    <a href="#/track/track_a" class="card" style="text-decoration: none;"><div class="card-header"><span class="card-subtitle">Track A</span><h3 class="card-title">Full-Stack Engineering</h3></div></a>
                    <a href="#/track/track_b" class="card" style="text-decoration: none;"><div class="card-header"><span class="card-subtitle">Track B</span><h3 class="card-title">AI / ML Engineering</h3></div></a>
                </section>
            </div>
        `;
    },

    async renderTrackPage(trackId) {
        this.renderLoading();
        const data = await this.fetchTrackData(trackId);
        if (!data) return this.renderPlaceholder('Error loading data.');
        const stagesHtml = data.stages.map(stage => `
            <a href="#/roadmap/${trackId}/${stage.stageId}" class="stage-card">
                <div class="stage-info"><h3>${stage.stageTitle}</h3></div>
                <div class="stage-meta"><span class="completion">${stage.weeks ? stage.weeks.length : 0} Weeks</span></div>
            </a>
        `).join('');
        this.root.innerHTML = `<div class="track-layout"><header class="track-header"><h2>${data.trackName}</h2></header><div class="stage-list">${stagesHtml}</div></div>`;
    },

    async renderRoadmapPage(trackId, stageId) {
        this.renderLoading();
        const data = await this.fetchTrackData(trackId);
        if (!data) return this.renderPlaceholder('Error loading data.');
        const stage = data.stages.find(s => s.stageId === stageId);
        if (!stage) return this.renderPlaceholder('Stage not found.');
        
        const currentUrl = `#/roadmap/${trackId}/${stageId}`;
        let weeksHtml = '';
        
        if (stage.weeks) {
            weeksHtml = stage.weeks.map((week, wIndex) => {
                const isOpen = wIndex === 0 ? 'open' : ''; 
                
                const conceptsHtml = (week.concepts || []).map((concept, cIndex) => `
                    <label class="checkbox-wrapper">
                        <input type="checkbox" class="checkbox-input" data-task-id="${trackId}_${stageId}_${week.weekId}_concept_${cIndex}">
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-label">${concept}</span>
                    </label>
                `).join('');

                const microProjectsHtml = (week.microProjects || []).map((mp, mpIndex) => `
                    <div class="resource-item">
                        <label class="checkbox-wrapper" style="margin-bottom: var(--spacing-sm);">
                            <input type="checkbox" class="checkbox-input" data-task-id="${trackId}_${stageId}_${week.weekId}_mp_${mpIndex}">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label" style="font-weight: bold; color: var(--accent-color);">${mp.title}</span>
                        </label>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Concept:</strong> ${mp.conceptLearned}</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Build:</strong> ${mp.whatToBuild}</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Action:</strong> ${mp.action}</span>
                    </div>
                `).join('');

                const advProjectHtml = week.advancedProject ? `
                    <div class="resource-item">
                        <label class="checkbox-wrapper" style="margin-bottom: var(--spacing-sm);">
                            <input type="checkbox" class="checkbox-input" data-task-id="${trackId}_${stageId}_${week.weekId}_adv">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label" style="font-weight: bold; color: var(--accent-color);">${week.advancedProject.title}</span>
                        </label>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Stack:</strong> ${week.advancedProject.techStack}</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Features:</strong> ${week.advancedProject.features}</span>
                    </div>
                ` : '';

                const openSourceHtml = week.openSource ? `
                    <div class="resource-item">
                        <label class="checkbox-wrapper" style="margin-bottom: var(--spacing-sm);">
                            <input type="checkbox" class="checkbox-input" data-task-id="${trackId}_${stageId}_${week.weekId}_os">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label" style="font-weight: bold; color: var(--text-primary);">Open Source Contribution</span>
                        </label>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Contribute:</strong> ${week.openSource.whatToContribute}</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Flow:</strong> ${week.openSource.contributionFlow}</span>
                        <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 32px;"><strong>Where:</strong> ${week.openSource.whereToContribute}</span>
                    </div>
                ` : '';

                const resourcesHtml = (week.resources || []).map((res, rIndex) => `
                    <div class="resource-item">
                        <label class="checkbox-wrapper" style="margin-bottom: 0;">
                            <input type="checkbox" class="checkbox-input" data-task-id="${trackId}_${stageId}_${week.weekId}_res_${rIndex}">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">
                                <a href="${res.url}" target="_blank" class="resource-link">${res.url}</a>
                                <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">
                                    <span class="badge" style="border-color: #4ade80; color: #4ade80;">READ</span> ${res.read}<br>
                                    ${res.skip ? `<span class="badge" style="border-color: #f87171; color: #f87171; margin-top: 4px;">SKIP</span> ${res.skip}` : ''}
                                </div>
                            </span>
                        </label>
                    </div>
                `).join('');

                return `
                    <details class="expandable" ${isOpen}>
                        <summary class="expandable-header">
                            <div class="expandable-title">
                                <span class="badge accent">Week ${wIndex + 1}</span>
                                <h3>${week.weekTitle}</h3>
                            </div>
                            <span class="expandable-indicator">+</span>
                        </summary>
                        <div class="expandable-content">
                            <div class="week-container">
                                <p class="week-focus">Focus: ${week.focus}</p>
                                ${conceptsHtml ? `<div class="content-block"><h4>> Concepts to Learn</h4>${conceptsHtml}</div>` : ''}
                                ${microProjectsHtml ? `<div class="content-block"><h4>> Micro-Projects</h4>${microProjectsHtml}</div>` : ''}
                                ${advProjectHtml ? `<div class="content-block"><h4>> Advanced Project</h4>${advProjectHtml}</div>` : ''}
                                ${openSourceHtml ? `<div class="content-block"><h4>> Open Source</h4>${openSourceHtml}</div>` : ''}
                                ${resourcesHtml ? `<div class="content-block"><h4>> Resources</h4>${resourcesHtml}</div>` : ''}
                                <div class="content-block">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                                        <h4>> Personal Notes</h4>
                                        <span id="note-status-${trackId}_${stageId}_${week.weekId}" style="font-size: 0.75rem; color: var(--accent-color); font-family: var(--font-mono); opacity: 0; transition: opacity var(--transition-fast);">Saved.</span>
                                    </div>
                                    <textarea class="note-input search-input" data-note-id="${trackId}_${stageId}_${week.weekId}" rows="4" placeholder="Write markdown/text notes for this week..."></textarea>
                                </div>
                            </div>
                        </div>
                    </details>
                `;
            }).join('');
        }

        this.root.innerHTML = `
            <div class="roadmap-layout">
                <header class="track-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <a href="#/track/${trackId}" style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.8rem; text-decoration: underline;">← Back to Track Overview</a>
                        <h2 style="margin-top: 1rem;">${stage.stageTitle}</h2>
                    </div>
                    <button class="bookmark-btn" data-id="${trackId}_${stageId}" data-title="${stage.stageTitle}" data-url="${currentUrl}" title="Bookmark Stage">☆</button>
                </header>
                <div class="roadmap-accordion">
                    ${weeksHtml || '<p style="color: var(--text-secondary); font-family: var(--font-mono);">No weeks defined yet.</p>'}
                </div>
            </div>
        `;
        
        this.bindExpandableIndicators();
        Progress.init();
        Bookmarks.init();
        Notes.init();
    },

    renderSettingsPage() {
        this.root.innerHTML = `
            <div class="dashboard-layout">
                <header class="dashboard-header">
                    <h2>System Settings</h2>
                    <p>Manage your local tracking data.</p>
                </header>
                <div class="tracks-grid" style="grid-template-columns: 1fr; max-width: 600px;">
                    <section class="card">
                        <div class="card-header"><h3 class="card-title">Data Management</h3></div>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">
                            Your progress is saved exclusively in your browser's LocalStorage. If you switch devices or clear your browser data, your progress will be lost. Export your data regularly.
                        </p>
                        <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                            <button id="btn-export" class="btn btn-primary" style="flex: 1;">Export Data (JSON)</button>
                            <label class="btn btn-secondary" style="flex: 1; text-align: center; cursor: pointer;">
                                Import Data
                                <input type="file" id="input-import" accept=".json" style="display: none;">
                            </label>
                        </div>
                        <div style="border-top: 1px solid var(--border-color); padding-top: var(--spacing-md);">
                            <h4 style="color: #f87171; margin-bottom: var(--spacing-sm); font-family: var(--font-mono);">> DANGER ZONE</h4>
                            <button id="btn-clear" class="btn btn-secondary" style="border-color: #f87171; color: #f87171; width: 100%;">Hard Reset All Progress</button>
                        </div>
                    </section>
                </div>
            </div>
        `;
        this.bindSettingsEvents();
    },

    bindSettingsEvents() {
        document.getElementById('btn-export')?.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Storage.data));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "ai_tracker_backup.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });

        document.getElementById('input-import')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (importedData.tasks && importedData.activity) {
                        Storage.data = importedData;
                        Storage.save();
                        alert('Data successfully imported!');
                        window.location.hash = '#/';
                    } else {
                        alert('Invalid backup file format.');
                    }
                } catch (err) {
                    alert('Error parsing JSON file.');
                }
            };
            reader.readAsText(file);
        });

        document.getElementById('btn-clear')?.addEventListener('click', () => {
            if(confirm("Are you sure? This will delete all completed tasks, bookmarks, and notes. This cannot be undone.")) { 
                localStorage.removeItem('ai_tracker_data'); 
                window.location.reload(); 
            }
        });
    },

    renderLoading() { this.root.innerHTML = `<section class="base-loading"><p>Loading curriculum data...</p></section>`; },
    renderPlaceholder(title) { this.root.innerHTML = `<section class="base-loading"><div style="text-align: center;"><h2 style="color: var(--accent-color); margin-bottom: 1rem;">${title}</h2><p style="color: var(--text-secondary); font-family: var(--font-mono);">This module will be generated in the upcoming stages.</p></div></section>`; },
    
    updateNav(activeHash) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (activeHash === '/' && link.getAttribute('href') === '#/') {
                link.classList.add('active');
            } else if (activeHash !== '/' && activeHash.startsWith(link.getAttribute('href').replace('#', '')) && link.getAttribute('href') !== '#/') {
                link.classList.add('active');
            }
        });
    },

    bindExpandableIndicators() {
        const detailsElements = this.root.querySelectorAll('details.expandable');
        detailsElements.forEach(details => {
            details.addEventListener('toggle', () => {
                const indicator = details.querySelector('.expandable-indicator');
                if (indicator) {
                    indicator.style.transform = details.open ? 'rotate(45deg)' : 'rotate(0deg)';
                }
            });
            if(details.open) {
                const indicator = details.querySelector('.expandable-indicator');
                if (indicator) indicator.style.transform = 'rotate(45deg)';
            }
        });
    }
};