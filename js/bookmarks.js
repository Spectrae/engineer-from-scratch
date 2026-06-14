import { Storage } from './storage.js';

export const Bookmarks = {
    init() {
        this.bindBookmarkButtons();
    },

    bindBookmarkButtons() {
        const btns = document.querySelectorAll('.bookmark-btn');
        btns.forEach(btn => {
            const id = btn.dataset.id;
            const title = btn.dataset.title;
            const url = btn.dataset.url;

            // Set initial state
            if (Storage.isBookmarked(id)) {
                btn.classList.add('active');
                btn.innerHTML = '★'; // Filled star
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '☆'; // Empty star
            }

            // Remove old listeners to prevent duplication on re-render
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Storage.toggleBookmark(id, title, url);
                this.init(); // Re-bind and update UI
                
                // If on dashboard, force re-render to update the list
                if (window.location.hash === '#/' || window.location.hash === '') {
                    window.dispatchEvent(new Event('hashchange'));
                }
            });
        });
    }
};