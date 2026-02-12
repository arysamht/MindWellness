// Journal Entry Class
class JournalEntry {
    constructor(title, content, mood, date) {
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.date = date || new Date();
    }
}

// Journal Manager Class
class JournalManager {
    constructor() {
        this.entries = [];
        this.loadEntries();
        this.setupEventListeners();
        this.selectedMood = null;
    }

    loadEntries() {
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
            this.entries = JSON.parse(savedEntries).map(entry => {
                entry.date = new Date(entry.date);
                return entry;
            });
            this.displayEntries();
        }
    }

    saveEntries() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
    }

    addEntry(title, content, mood) {
        const entry = new JournalEntry(title, content, mood);
        this.entries.unshift(entry); // Add to beginning of array
        this.saveEntries();
        this.displayEntries();
    }

    displayEntries() {
        const container = document.getElementById('journalEntries');
        container.innerHTML = '';

        this.entries.forEach((entry, index) => {
            const card = document.createElement('div');
            card.className = 'card mb-3 journal-entry';
            
            const moodEmoji = this.getMoodEmoji(entry.mood);
            const formattedDate = this.formatDate(entry.date);

            card.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${entry.title}</h5>
                        <span class="mood-emoji" title="Mood">${moodEmoji}</span>
                    </div>
                    <p class="card-text">${entry.content}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${formattedDate}</small>
                        <button class="btn btn-sm btn-outline-danger" onclick="journalManager.deleteEntry(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    deleteEntry(index) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries.splice(index, 1);
            this.saveEntries();
            this.displayEntries();
        }
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setupEventListeners() {
        // Mood selection
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                moodButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                this.selectedMood = button.dataset.mood;
                document.getElementById('moodInput').value = this.selectedMood;
            });
        });

        // Form submission
        const form = document.getElementById('journalForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('titleInput').value;
            const content = document.getElementById('contentInput').value;
            
            if (!this.selectedMood) {
                alert('Please select your mood');
                return;
            }

            this.addEntry(title, content, this.selectedMood);
            
            // Reset form and close modal
            form.reset();
            this.selectedMood = null;
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            const modal = bootstrap.Modal.getInstance(document.getElementById('journalModal'));
            modal.hide();
        });
    }
}

// Initialize Journal Manager
let journalManager;
document.addEventListener('DOMContentLoaded', () => {
    journalManager = new JournalManager();
});

// Function to open new journal entry modal
function openNewJournalEntry() {
    const modal = new bootstrap.Modal(document.getElementById('journalModal'));
    modal.show();
}

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get mood icon
function getMoodIcon(mood) {
    const icons = {
        'Happy': 'bi-emoji-smile',
        'Calm': 'bi-emoji-neutral',
        'Sad': 'bi-emoji-frown',
        'Anxious': 'bi-emoji-dizzy',
        'Angry': 'bi-emoji-angry'
    };
    return icons[mood] || 'bi-emoji-neutral';
}

// Load journal entries from localStorage
function loadJournalEntries() {
    const entries = JSON.parse(localStorage.getItem('demoJournalEntries')) || [
        { title: 'Feeling Great', content: 'Had a productive day!', mood: 'Happy', created_at: new Date() },
        { title: 'A Bit Anxious', content: 'Work deadlines stress me out.', mood: 'Anxious', created_at: new Date() }
    ];

    const entriesContainer = document.getElementById('journalEntries');
    entriesContainer.innerHTML = entries.map(entry => `
        <div class="journal-entry">
            <div class="date"><i class="bi bi-calendar3 me-2"></i>${formatDate(entry.created_at)}</div>
            <div class="title">${entry.title}</div>
            <div class="content">${entry.content}</div>
            ${entry.mood ? `<div class="mood"><i class="bi ${getMoodIcon(entry.mood)} me-2"></i>Feeling ${entry.mood}</div>` : ''}
        </div>
    `).join('');
}

// Save a new journal entry
function saveJournalEntry(event) {
    event.preventDefault();

    const title = document.getElementById('entryTitle').value.trim();
    const content = document.getElementById('entryContent').value.trim();
    const alertElement = document.getElementById('submitAlert');

    if (!title || !content) {
        alertElement.textContent = 'Please fill in both title and content';
        alertElement.className = 'alert alert-danger';
        alertElement.style.display = 'block';
        return;
    }

    const entries = JSON.parse(localStorage.getItem('demoJournalEntries')) || [];
    entries.unshift({
        title,
        content,
        mood: selectedMood,
        created_at: new Date()
    });

    localStorage.setItem('demoJournalEntries', JSON.stringify(entries));

    // Clear form
    document.getElementById('entryTitle').value = '';
    document.getElementById('entryContent').value = '';
    selectedMood = null;
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));

    // Show success message
    alertElement.textContent = 'Journal entry saved!';
    alertElement.className = 'alert alert-success';
    alertElement.style.display = 'block';

    // Reload entries
    loadJournalEntries();
}

// Handle mood selection
let selectedMood = null;
document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedMood = this.dataset.mood;
    });
});

// Handle form submission
document.getElementById('journalForm').addEventListener('submit', saveJournalEntry);

// Handle logout (demo just clears form, no auth)
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('demoJournalEntries');
    alert('Demo cleared! Reloading page...');
    window.location.reload();
});

// Initialize entries on page load
document.addEventListener('DOMContentLoaded', loadJournalEntries);
