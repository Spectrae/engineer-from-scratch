import { Storage } from './storage.js';

export const Notes = {
    init() {
        this.bindTextareas();
    },

    bindTextareas() {
        const textareas = document.querySelectorAll('.note-input');
        
        textareas.forEach(textarea => {
            const noteId = textarea.dataset.noteId;
            if (!noteId) return;

            // Load existing note
            const savedNote = Storage.data.notes[noteId] || '';
            textarea.value = savedNote;

            // Debounce save on input
            let timeout = null;
            
            // Clone to remove old listeners
            const newTextarea = textarea.cloneNode(true);
            textarea.parentNode.replaceChild(newTextarea, textarea);

            newTextarea.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    Storage.data.notes[noteId] = e.target.value;
                    Storage.save();
                    
                    // Optional: Show a subtle "Saved" indicator
                    const statusEl = document.getElementById(`note-status-${noteId}`);
                    if (statusEl) {
                        statusEl.innerText = 'Saved.';
                        statusEl.style.opacity = 1;
                        setTimeout(() => statusEl.style.opacity = 0, 2000);
                    }
                }, 500);
            });
        });
    }
};