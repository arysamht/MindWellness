// --------------------- SESSION & USER ---------------------

// Check if user is logged in
function checkSession() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return !!user;
}

// Load user info from localStorage
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && user.username) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        userNameDisplay.textContent = user.username;
    }
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser'); // Clear current user
    window.location.href = 'index.html';    // Redirect to homepage
});

// --------------------- DASHBOARD INITIALIZATION ---------------------
document.addEventListener('DOMContentLoaded', function() {
    if (!checkSession()) {
        window.location.href = 'index.html';
        return;
    }

    loadUserInfo();
    loadRecommendations();
});

// --------------------- DASS RESULTS & SEVERITY ---------------------

function getSeverityLevel(score, type) {
    const levels = {
        depression: [
            { max: 9, level: 'Normal' },
            { max: 13, level: 'Mild' },
            { max: 20, level: 'Moderate' },
            { max: 27, level: 'Severe' },
            { max: Infinity, level: 'Extremely Severe' }
        ],
        anxiety: [
            { max: 7, level: 'Normal' },
            { max: 9, level: 'Mild' },
            { max: 14, level: 'Moderate' },
            { max: 19, level: 'Severe' },
            { max: Infinity, level: 'Extremely Severe' }
        ],
        stress: [
            { max: 14, level: 'Normal' },
            { max: 18, level: 'Mild' },
            { max: 25, level: 'Moderate' },
            { max: 33, level: 'Severe' },
            { max: Infinity, level: 'Extremely Severe' }
        ]
    };

    const scale = levels[type];
    for (let i = 0; i < scale.length; i++) {
        if (score <= scale[i].max) return scale[i].level;
    }
    return 'Extremely Severe';
}

function getSeverityClass(score, type) {
    return 'severity-' + getSeverityLevel(score, type).toLowerCase().replace(' ', '-');
}

// Display DASS-21 results
function displayDassResults(results) {
    const depression = parseInt(results.depression_score) || 0;
    const anxiety = parseInt(results.anxiety_score) || 0;
    const stress = parseInt(results.stress_score) || 0;

    return `
    <div class="card dashboard-card mb-4">
        <div class="card-body">
            <h3 class="card-title">
                <i class="bi bi-graph-up me-2"></i>Your DASS-21 Assessment Results
            </h3>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="score-card depression">
                        <h4>Depression</h4>
                        <div class="score-value">${depression}</div>
                        <div class="severity-badge ${getSeverityClass(depression, 'depression')}">
                            ${getSeverityLevel(depression, 'depression')}
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="score-card anxiety">
                        <h4>Anxiety</h4>
                        <div class="score-value">${anxiety}</div>
                        <div class="severity-badge ${getSeverityClass(anxiety, 'anxiety')}">
                            ${getSeverityLevel(anxiety, 'anxiety')}
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="score-card stress">
                        <h4>Stress</h4>
                        <div class="score-value">${stress}</div>
                        <div class="severity-badge ${getSeverityClass(stress, 'stress')}">
                            ${getSeverityLevel(stress, 'stress')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// --------------------- SEVERE WARNING MODAL ---------------------

function showSeverityWarning(severeConditions) {
    // create modal if it doesn't exist
    if (!document.getElementById('severityWarningModal')) {
        const modalHtml = `
        <div class="modal fade" id="severityWarningModal" tabindex="-1" aria-labelledby="severityWarningModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="severityWarningModalLabel">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Important Health Notice
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="severityWarningContent"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-danger" onclick="window.open('https://www.nimh.nih.gov/health/find-help', '_blank')">
                            Find Professional Help
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const modalContent = document.getElementById('severityWarningContent');
    modalContent.innerHTML = `
        <div class="text-center mb-4">
            <i class="bi bi-exclamation-circle-fill text-danger" style="font-size: 3rem;"></i>
        </div>
        <p class="mb-3">Your assessment indicates ${severeConditions.length > 1 ? 'severe levels' : 'a severe level'} of ${severeConditions.join(', ')}.</p>
        <div class="alert alert-danger">
            <p class="mb-2"><strong>Immediate Action Recommended:</strong></p>
            <ul class="mb-0">
                <li>Contact a mental health professional immediately</li>
                <li>If you're having thoughts of self-harm, please reach out for help</li>
            </ul>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('severityWarningModal'));
    modal.show();
}

// --------------------- RECOMMENDATIONS ---------------------

function getConditionIcon(condition) {
    switch (condition.toLowerCase()) {
        case 'depression': return 'bi-cloud-rain';
        case 'anxiety': return 'bi-heart-pulse';
        case 'stress': return 'bi-battery-charging';
        case 'general': return 'bi-stars';
        default: return 'bi-lightbulb';
    }
}

// Load recommendations from localStorage
function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    const data = JSON.parse(localStorage.getItem('recommendations')) || null;

    if (!data) {
        recommendationsContainer.innerHTML = `
            <div class="alert alert-info" role="alert">
                <h4 class="alert-heading"><i class="bi bi-info-circle me-2"></i>No Assessment Results</h4>
                <p>Complete a DASS-21 assessment to receive personalized recommendations.</p>
                <hr>
                <a href="dass_assessment.html" class="btn btn-primary">
                    <i class="bi bi-clipboard-pulse me-2"></i>Take Assessment
                </a>
            </div>
        `;
        return;
    }

    let html = '';

    // Show DASS results if available
    if (data.dass_results) {
        html += displayDassResults(data.dass_results);

        // Check for severe conditions
        const results = data.dass_results;
        const severeConditions = [];
        if (['Severe', 'Extremely Severe'].includes(results.depression_level)) severeConditions.push('Depression');
        if (['Severe', 'Extremely Severe'].includes(results.anxiety_level)) severeConditions.push('Anxiety');
        if (['Severe', 'Extremely Severe'].includes(results.stress_level)) severeConditions.push('Stress');

        if (severeConditions.length > 0) showSeverityWarning(severeConditions);
    }

    // Show personalized recommendations
    if (data.recommendations) {
        Object.entries(data.recommendations).forEach(([condition, items]) => {
            const conditionTitle = condition.charAt(0).toUpperCase() + condition.slice(1);
            html += `
            <div class="card dashboard-card mb-4">
                <div class="card-body">
                    <h3 class="card-title"><i class="bi ${getConditionIcon(condition)} me-2"></i>${conditionTitle} Recommendations</h3>
                    <div class="row g-4">
            `;

            items.forEach(item => {
                const severity = item.severity || 'General';
                const severityClass = severity.toLowerCase().replace(' ', '-');
                const showSeverityBadge = severity !== 'General';

                html += `
                <div class="col-md-6">
                    <div class="recommendation-card h-100 ${severityClass}">
                        <div class="recommendation-header">
                            <i class="${item.icon} me-2"></i>
                            <h5>${item.title}</h5>
                        </div>
                        <div class="recommendation-content">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <p class="category-tag ${severityClass}">${item.category}</p>
                                ${showSeverityBadge ? `<span class="severity-badge ${severityClass}">${severity} Level</span>` : ''}
                            </div>
                            <p class="content-text">${item.content}</p>
                            ${item.activities ? `
                                <div class="activities-section">
                                    <h6 class="activities-title">Try These Activities:</h6>
                                    <div class="activity-chips">
                                        ${item.activities.map(a => `<span class="activity-chip"><i class="bi bi-check-circle-fill me-2"></i>${a}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
            });

            html += `</div></div></div>`;
        });
    }

    recommendationsContainer.innerHTML = html;
}
// --------------------- END OF DASHBOARD.JS ---------------------
