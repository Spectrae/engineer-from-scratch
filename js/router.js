import { UI } from './ui.js';
import { Storage } from './storage.js';

export const Router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },

    async handleRoute() {
        const hash = window.location.hash.replace('#', '') || '/';
        UI.updateNav(hash);

        if (hash === '/') {
            UI.renderLandingPage();
        }
        else if (hash === '/tracks') {
            UI.renderTracksPage();
        }
        else if (hash.startsWith('/track/')) {
            const trackId = hash.split('/')[2];
            await UI.renderTrackPage(trackId);
        }
        else if (hash.startsWith('/roadmap/')) {
            Storage.setLastRoute('#' + hash);

            const parts = hash.split('/');
            const trackId = parts[2];
            const stageId = parts[3];

            if (trackId && stageId) {
                await UI.renderRoadmapPage(trackId, stageId);
            } else {
                UI.renderPlaceholder('Invalid Roadmap Path');
            }
        }
        else if (hash === '/settings') {
            UI.renderSettingsPage();
        }
        else {
            UI.renderPlaceholder('404 - Module Not Found');
        }
    }
};