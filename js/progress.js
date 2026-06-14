import { Storage } from './storage.js';

/**
 * Progress Engine
 * Calculates completion percentages and updates DOM progress bars and stats.
 */

export const Progress = {
    init() {
        this.bindCheckboxes();
    },

    bindCheckboxes() {
        const checkboxes = document.querySelectorAll('.checkbox-input');
        
        checkboxes.forEach(cb => {
            const taskId = cb.dataset.taskId;
            if (!taskId) return;

            // 1. Set initial state from LocalStorage on render
            cb.checked = Storage.getTaskStatus(taskId);

            // 2. Listen for user toggles
            // Remove old listener to prevent memory leaks if re-rendered
            const newCb = cb.cloneNode(true);
            cb.parentNode.replaceChild(newCb, cb);

            newCb.addEventListener('change', (e) => {
                Storage.setTaskStatus(taskId, e.target.checked);
                this.updateUI();
            });
        });
    },

    updateUI() {
        // This function will eventually calculate precise percentages based on JSON data (Stage 8).
        // For now, we update the global dashboard statistics.
        const totalCompleted = Storage.getTotalCompletedTasks();
        
        // Update Stats Grid if present
        const statsElements = document.querySelectorAll('.stat-value');
        if (statsElements.length >= 3) {
            // Placeholder updates until we have total counts from JSON
            statsElements[2].innerText = totalCompleted; // Completed Tasks
        }

        // Update Activity Feed if present
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            const activities = Storage.getRecentActivity();
            if (activities.length > 0) {
                activityList.innerHTML = activities.map(act => {
                    const date = new Date(act.time);
                    const timeString = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                    return `
                        <div class="activity-item">
                            <span class="action">${act.desc}</span>
                            <span class="time">${timeString}</span>
                        </div>
                    `;
                }).join('');
            }
        }
    }
};