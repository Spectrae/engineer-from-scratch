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

            // Check if bookmark exists in the Storage data
            const isBookmarked = Storage.data.bookmarks && Storage.data.bookmarks[id];

            // Set initial state
            if (isBookmarked) {
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
                e.stopPropagation(); // VERY IMPORTANT: Stops the <details> accordion from opening/closing when clicking the star
                
                Storage.toggleBookmark(id, title, url);
                
                // If we are on the dashboard, re-render it instantly to update the list visually
                if (window.location.hash === '#/' || window.location.hash === '') {
                    window.dispatchEvent(new Event('hashchange'));
                } else {
                    this.init(); // Just re-bind the current button on other pages
                }
            });
        });
    }
};