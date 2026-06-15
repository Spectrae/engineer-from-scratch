import { Storage } from './storage.js';

export const Progress = {
    init() {
        this.bindCheckboxes();
        this.updateUI(); // Force update on load to fill the bar
    },

    bindCheckboxes() {
        const checkboxes = document.querySelectorAll('.checkbox-input');
        
        checkboxes.forEach(cb => {
            const taskId = cb.dataset.taskId;
            if (!taskId) return;

            // Set initial state from LocalStorage on render
            cb.checked = Storage.getTaskStatus(taskId);

            // Listen for user toggles
            const newCb = cb.cloneNode(true);
            cb.parentNode.replaceChild(newCb, cb);

            newCb.addEventListener('change', (e) => {
                Storage.setTaskStatus(taskId, e.target.checked);
                this.updateUI();
            });
        });
    },

    updateUI() {
        const totalCompleted = Storage.getTotalCompletedTasks();
        
        // Update Tasks Executed
        const statTasks = document.getElementById('stat-tasks');
        if (statTasks) {
            statTasks.innerText = totalCompleted;
        }

        // Update Overall Progress 
        const statOverall = document.getElementById('stat-overall');
        const statBar = document.getElementById('stat-progress-bar');
        
        if (statOverall) {
            const estimatedTotalTasks = 150; // Approximated total checkboxes across all 24 weeks
            let percentage = Math.min(Math.round((totalCompleted / estimatedTotalTasks) * 100), 100);
            
            statOverall.innerText = `${percentage}%`;
            
            // Fill the visual bar smoothly
            if (statBar) {
                statBar.style.width = `${percentage}%`;
            }
        }
    }
};