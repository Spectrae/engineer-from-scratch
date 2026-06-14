const DB_KEY = 'ai_tracker_data';

export const Storage = {
    data: null,

    init() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            this.data = JSON.parse(stored);
        } else {
            this.data = {
                tasks: {},      
                notes: {},      
                bookmarks: {},  
                activity: [],
                lastRoute: '#/tracks' // Default resume location
            };
            this.save();
        }
    },

    save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    },

    // ... (Keep existing Task & Activity methods from Stage 6) ...
    setTaskStatus(taskId, isCompleted) {
        this.data.tasks[taskId] = isCompleted;
        const actionText = isCompleted ? 'Completed task' : 'Unchecked task';
        this.logActivity(`${actionText}: ${taskId}`);
        this.save();
    },

    getTaskStatus(taskId) { return !!this.data.tasks[taskId]; },
    getTotalCompletedTasks() { return Object.values(this.data.tasks).filter(status => status === true).length; },
    logActivity(description) {
        this.data.activity.unshift({ desc: description, time: new Date().toISOString() });
        if (this.data.activity.length > 10) this.data.activity.pop();
        this.save();
    },
    getRecentActivity() { return this.data.activity; },

    // --- NEW: Resume Learning Methods ---
    setLastRoute(hash) {
        this.data.lastRoute = hash;
        this.save();
    },

    getLastRoute() {
        return this.data.lastRoute || '#/tracks';
    },

    // --- NEW: Bookmark Methods ---
    toggleBookmark(id, title, url) {
        if (this.data.bookmarks[id]) {
            delete this.data.bookmarks[id];
            this.logActivity(`Removed bookmark: ${title}`);
        } else {
            this.data.bookmarks[id] = { title, url, timestamp: new Date().toISOString() };
            this.logActivity(`Added bookmark: ${title}`);
        }
        this.save();
    },

    getBookmarks() {
        return Object.values(this.data.bookmarks).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    isBookmarked(id) {
        return !!this.data.bookmarks[id];
    }
};