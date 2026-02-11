// Dashboard Journal Widget
class DashboardJournal {
    constructor() {
        this.loadRecentEntries();
    }

    loadRecentEntries() {
        const container = document.getElementById('recentJournalEntries');
        if (!container) return;

        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
            const entries = JSON.parse(savedEntries)
                .slice(0, 3) // Get only the 3 most recent entries
                .map(entry => {
                    entry.date = new Date(entry.date);
                    return entry;
                });

            container.innerHTML = entries.length ? this.createEntriesHTML(entries) : this.getEmptyStateHTML();
        } else {
            container.innerHTML = this.getEmptyStateHTML();
        }
    }

    createEntriesHTML(entries) {
        return entries.map(entry => `
            <div class="card mb-2 journal-entry">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="card-title mb-1">${entry.title}</h6>
                        <span class="mood-emoji">${this.getMoodEmoji(entry.mood)}</span>
                    </div>
                    <p class="card-text small text-muted mb-0">
                        ${this.formatDate(entry.date)}
                    </p>
                </div>
            </div>
        `).join('');
    }

    getEmptyStateHTML() {
        return `
            <div class="text-center text-muted p-4">
                <i class="bi bi-journal-plus display-4 mb-3"></i>
                <p>No journal entries yet. Start writing today!</p>
            </div>
        `;
    }

    getMoodEmoji(mood) {
        const moods = {
            1: '😢',
            2: '😕',
            3: '😐',
            4: '🙂',
            5: '😊'
        };
        return moods[mood] || '😐';
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize Dashboard Journal Widget
document.addEventListener('DOMContentLoaded', () => {
    new DashboardJournal();
});
