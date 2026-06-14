export const Search = {
    init() {
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return;

        // Debounce search input
        let timeout = null;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.executeSearch(e.target.value.toLowerCase());
            }, 300);
        });
    },

    executeSearch(query) {
        // For now, this performs DOM-based filtering on the active page.
        // In Stage 9 (Data Integration), this will search the JSON data directly.
        if (query.trim() === '') {
            this.resetSearch();
            return;
        }

        console.log(`[Search] Executing local DOM search for: "${query}"`);
        const searchables = document.querySelectorAll('.stage-card, .expandable, .resource-item, .checkbox-wrapper');
        
        searchables.forEach(el => {
            const text = el.innerText.toLowerCase();
            if (text.includes(query)) {
                el.style.display = ''; // Restore default display
                // If it's an expandable, open it to show the match
                const parentDetails = el.closest('details');
                if (parentDetails) parentDetails.setAttribute('open', '');
            } else {
                el.style.display = 'none';
            }
        });
    },

    resetSearch() {
        const searchables = document.querySelectorAll('.stage-card, .expandable, .resource-item, .checkbox-wrapper');
        searchables.forEach(el => el.style.display = '');
    }
};