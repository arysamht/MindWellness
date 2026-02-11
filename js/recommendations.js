// ===================== RECOMMENDATIONS.JS =====================

// Load recommendations when page loads
document.addEventListener('DOMContentLoaded', loadRecommendations);

function loadRecommendations() {
    const container = document.getElementById('recommendations');

    if (!container) {
        console.error('Recommendations container not found');
        return;
    }

    // Loading state
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
    `;

    const dassResults = JSON.parse(localStorage.getItem('dassResults'));
    if (!dassResults) {
        showError(container, 'Please complete a DASS assessment first.');
        return;
    }

    // Normalize severity levels
    const severityLevels = {
        depression: normalizeSeverity(dassResults.depression_level),
        anxiety: normalizeSeverity(dassResults.anxiety_level),
        stress: normalizeSeverity(dassResults.stress_level)
    };

    const recommendations = generateRecommendations(dassResults);

    container.innerHTML = '';
    let hasRecommendations = false;

    // Create outer wrapper for conditions to display in a row
    const conditionsWrapper = document.createElement('div');
    conditionsWrapper.className = 'row g-4 mb-5';

    ['depression', 'anxiety', 'stress'].forEach(condition => {
        const severityLevel = severityLevels[condition];
        const recs = recommendations[condition]?.[severityLevel] || [];

        if (!recs.length) return;

        hasRecommendations = true;

        const section = document.createElement('div');
        section.className = 'col-md-4';

        const warningBanner = severityLevel === 'Extremely Severe'
            ? `<div class="alert alert-danger mb-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Important:</strong> Your ${condition} level requires immediate professional attention.
               </div>`
            : '';

        section.innerHTML = `
            ${warningBanner}
            <h4 class="mb-3 d-flex align-items-center">
                <span class="text-capitalize">${condition}</span>
                <span class="badge ${getSeverityBadgeClass(severityLevel)} ms-2">
                    ${severityLevel}
                </span>
            </h4>
            <div class="row g-4"></div>
        `;

        const grid = section.querySelector('.row');

        recs.forEach(rec => {
            const col = document.createElement('div');
            col.className = 'col-12';

            col.innerHTML = `
                <div class="card h-100 ${rec.content_type === 'urgent' ? 'border-danger' : ''}">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <i class="bi ${getContentTypeIcon(rec.content_type)} me-2 
                                ${rec.content_type === 'urgent' ? 'text-danger' : 'text-primary'}"></i>
                            <span class="badge bg-light text-dark">${rec.category_name}</span>
                        </div>
                        <h5 class="card-title">${rec.title}</h5>
                        <p class="card-text text-muted">${rec.description}</p>
                        <button class="btn ${rec.content_type === 'urgent' ? 'btn-danger' : 'btn-primary'} btn-sm" disabled>
                            ${rec.action_text}
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(col);
        });

        conditionsWrapper.appendChild(section);
    });

    if (hasRecommendations) {
        container.appendChild(conditionsWrapper);
    }

    // General recommendations
    if (recommendations.general?.length) {
        const section = document.createElement('div');
        section.className = 'mb-5';
        section.innerHTML = `
            <h4 class="mb-3">General Support</h4>
            <div class="row g-4"></div>
        `;
        const grid = section.querySelector('.row');
        recommendations.general.forEach(rec => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <div class="card h-100 border-danger">
                    <div class="card-body">
                        <h5 class="card-title">${rec.title}</h5>
                        <p class="card-text text-muted">${rec.description}</p>
                        <button class="btn btn-danger btn-sm" disabled>
                            ${rec.action_text}
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(col);
        });
        container.appendChild(section);
    }

    if (!hasRecommendations) {
        showError(container, 'No recommendations available at this time.');
    }
}

// Normalize severity keys
function normalizeSeverity(level) {
    if (!level) return 'Normal';
    // Capitalize first letter of each word
    return level.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Recommendations by condition & severity
function generateRecommendations(results) {
    return {
        depression: {
            Normal: [
                {
                    title: "Maintain Your Wellbeing",
                    description: "Your mood is in a healthy range. Continue maintaining regular sleep, physical activity, and social connections to sustain your mental health.",
                    category_name: "Preventive Care",
                    content_type: "wellness",
                    action_text: "View Tips"
                }
            ],
            Mild: [
                {
                    title: "Gentle Mood Support",
                    description: "Maintain regular sleep, meals, and light physical activity. Journaling your emotions and staying socially connected can help prevent symptoms from worsening.",
                    category_name: "Mood Care",
                    content_type: "wellness",
                    action_text: "View Tips"
                }
            ],
            Moderate: [
                {
                    title: "Structured Emotional Care",
                    description: "Use guided self-care routines such as mindfulness, mood tracking, and goal-setting. Consider peer support or counseling if symptoms persist.",
                    category_name: "Emotional Wellbeing",
                    content_type: "wellness",
                    action_text: "View Activities"
                }
            ],
            Severe: [
                {
                    title: "Professional Mental Health Support",
                    description: "Persistent low mood and loss of interest detected. Speaking with a psychologist or counselor is strongly recommended.",
                    category_name: "Mental Health",
                    content_type: "urgent",
                    action_text: "Seek Support"
                }
            ],
            "Extremely Severe": [
                {
                    title: "Immediate Mental Health Intervention",
                    description: "Your symptoms indicate a very high level of distress. Immediate professional care is strongly advised. If you feel unsafe, seek emergency help.",
                    category_name: "Emergency Care",
                    content_type: "urgent",
                    action_text: "Get Help Now"
                }
            ]
        },

        anxiety: {
            Normal: [
                {
                    title: "Keep Anxiety Levels Low",
                    description: "Your anxiety is at a healthy level. Maintain this by practicing regular relaxation techniques and staying physically active.",
                    category_name: "Preventive Care",
                    content_type: "wellness",
                    action_text: "View Tips"
                }
            ],
            Mild: [
                {
                    title: "Calming Daily Practices",
                    description: "Practice slow breathing, limit caffeine, and schedule short breaks to relax your mind. Light exercise and grounding techniques can help.",
                    category_name: "Stress Response",
                    content_type: "exercise",
                    action_text: "Try Techniques"
                }
            ],
            Moderate: [
                {
                    title: "Anxiety Regulation Exercises",
                    description: "Use structured breathing, progressive muscle relaxation, and cognitive reframing techniques to manage anxious thoughts.",
                    category_name: "Anxiety Care",
                    content_type: "exercise",
                    action_text: "Start Exercise"
                }
            ],
            Severe: [
                {
                    title: "Anxiety Management Program",
                    description: "High anxiety levels detected. Professional guidance and structured therapy approaches can help reduce symptoms effectively.",
                    category_name: "Mental Health",
                    content_type: "resource",
                    action_text: "View Program"
                }
            ],
            "Extremely Severe": [
                {
                    title: "Urgent Anxiety Support",
                    description: "Intense anxiety may significantly impact daily functioning. Immediate professional support is strongly recommended.",
                    category_name: "Emergency Care",
                    content_type: "urgent",
                    action_text: "Seek Help"
                }
            ]
        },

        stress: {
            Normal: [
                {
                    title: "Maintain Stress Management",
                    description: "Your stress level is healthy. Keep maintaining good work-life balance, sleep habits, and regular exercise to stay resilient.",
                    category_name: "Preventive Care",
                    content_type: "wellness",
                    action_text: "View Tips"
                }
            ],
            Mild: [
                {
                    title: "Lifestyle Balance Support",
                    description: "Improve time management, take regular breaks, and maintain hydration and sleep to prevent stress escalation.",
                    category_name: "Lifestyle Balance",
                    content_type: "resource",
                    action_text: "View Tips"
                }
            ],
            Moderate: [
                {
                    title: "Stress Management Techniques",
                    description: "Adopt stress-reduction strategies such as prioritization, relaxation exercises, and reducing workload where possible.",
                    category_name: "Stress Care",
                    content_type: "resource",
                    action_text: "View Techniques"
                }
            ],
            Severe: [
                {
                    title: "Burnout Prevention Support",
                    description: "Sustained high stress detected. Consider professional advice and structured coping strategies to prevent burnout.",
                    category_name: "Mental Health",
                    content_type: "resource",
                    action_text: "Learn More"
                }
            ],
            "Extremely Severe": [
                {
                    title: "Critical Stress Support",
                    description: "Severe stress levels may seriously affect your health. Immediate professional intervention is strongly advised.",
                    category_name: "Emergency Care",
                    content_type: "urgent",
                    action_text: "Get Support"
                }
            ]
        },

        general: [
            {
                title: "Mental Health Professional Support",
                description: "If symptoms persist, worsen, or interfere with daily life, professional care is recommended regardless of severity level.",
                category_name: "Mental Health Care",
                content_type: "urgent",
                action_text: "Seek Help"
            }
        ]
    };
}


// --------------------- HELPERS ---------------------
function showError(container, message) {
    container.innerHTML = `<div class="alert alert-warning"><i class="bi bi-exclamation-circle me-2"></i>${message}</div>`;
}

function getContentTypeIcon(type) {
    const icons = { urgent: 'bi-exclamation-triangle-fill', resource: 'bi-journal-text', exercise: 'bi-activity', wellness: 'bi-heart-pulse' };
    return icons[type] || 'bi-check-circle';
}

function getSeverityBadgeClass(severity) {
    const classes = { Normal:'bg-success', Mild:'bg-info', Moderate:'bg-warning text-dark', Severe:'bg-danger', 'Extremely Severe':'bg-danger' };
    return classes[severity] || 'bg-secondary';
}
