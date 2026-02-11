// Wait for DOM to be ready before initializing
(function() {
    // Function to get severity badge class
    function getSeverityBadgeClass(severity) {
        switch (severity.toLowerCase()) {
            case 'normal':
                return 'bg-success';
            case 'mild':
                return 'bg-info';
            case 'moderate':
                return 'bg-warning text-dark';
            case 'severe':
                return 'bg-danger';
            case 'extremely severe':
                return 'bg-dark';
            default:
                return 'bg-secondary';
        }
    }

    // Function to load and display results
    window.loadResults = async function() {
        const resultsContainer = document.getElementById('dassResults');
        const recommendationsContainer = document.getElementById('dassRecommendations');
        
        // Show loading spinners
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading your DASS-21 results...</p>
            </div>
        `;
        
        recommendationsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading recommendations...</p>
            </div>
        `;
        
        try {
            console.log('\n Getting DASS results...');
            const response = await fetch('api/get_dass_result.php');
            const data = await response.json();
            console.log('API Response: \n', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get DASS results');
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to get DASS results');
            }
            
            if (!data.hasResults) {
                resultsContainer.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        ${data.message}
                    </div>
                    <div class="text-center mt-4">
                        <a href="dass21.html" class="btn btn-primary">
                            <i class="bi bi-clipboard-check me-2"></i>
                            Take DASS-21 Assessment
                        </a>
                    </div>
                `;
                recommendationsContainer.innerHTML = '';
                return;
            }
            
            // Format date
            const assessmentDate = new Date(data.assessment_date);
            const dateString = assessmentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create results HTML
            let resultsHTML = `
                <div class="mb-4">
                    <h6 class="text-muted mb-3">Assessment Date: ${dateString}</h6>
                    <div class="row g-4">
            `;
            
            // Add score cards
            const categories = ['depression', 'anxiety', 'stress'];
            categories.forEach(category => {
                const score = data.scores[category];
                const level = data.severity_levels[category];
                const levelClass = getLevelClass(level);
                
                resultsHTML += `
                    <div class="col-md-4">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title text-capitalize">${category}</h5>
                                <div class="d-flex align-items-baseline mb-3">
                                    <h2 class="mb-0 me-2">${score}</h2>
                                    <p class="text-muted mb-0">points</p>
                                </div>
                                <span class="badge ${levelClass}">${level}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            resultsHTML += `
                </div>
            </div>
        `;
        
        // Update results container
        resultsContainer.innerHTML = resultsHTML;
        
        // Create recommendations HTML
        let recommendationsHTML = `
            <div class="accordion" id="recommendationsAccordion">
        `;
        
        // Add general recommendations
        recommendationsHTML += createAccordionItem(
            'general',
            'General Recommendations',
            data.recommendations.general
        );
        
        // Add specific recommendations if severity level is not Normal
        categories.forEach(category => {
            if (data.severity_levels[category] !== 'Normal' && data.recommendations[category].length > 0) {
                recommendationsHTML += createAccordionItem(
                    category,
                    `${category.charAt(0).toUpperCase() + category.slice(1)} Recommendations`,
                    data.recommendations[category]
                );
            }
        });
        
        recommendationsHTML += `</div>`;
        
        // Update recommendations container
        recommendationsContainer.innerHTML = recommendationsHTML;
        
        // Show first accordion item
        const firstAccordion = document.querySelector('.accordion-collapse');
        if (firstAccordion) {
            firstAccordion.classList.add('show');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        resultsContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Failed to load your DASS-21 results. Please try again later.
            </div>
        `;
        
        recommendationsContainer.innerHTML = '';
    }
};

// Helper function to get Bootstrap class for severity level
function getLevelClass(level) {
    switch (level.toLowerCase()) {
        case 'normal':
            return 'bg-success';
        case 'mild':
            return 'bg-info';
        case 'moderate':
            return 'bg-warning text-dark';
        case 'severe':
            return 'bg-danger';
        case 'extremely severe':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Helper function to create accordion items
function createAccordionItem(id, title, recommendations) {
    return `
        <div class="accordion-item border-0 shadow-sm mb-3">
            <h2 class="accordion-header">
                <button class="accordion-button ${id === 'general' ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${id}Collapse">
                    ${title}
                </button>
            </h2>
            <div id="${id}Collapse" class="accordion-collapse collapse ${id === 'general' ? 'show' : ''}" data-bs-parent="#recommendationsAccordion">
                <div class="accordion-body">
                    <ul class="list-unstyled mb-0">
                        ${recommendations.map(rec => `
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                ${rec}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Function to download results
window.downloadResults = function() {
    const resultsDiv = document.getElementById('dassResults');
    const recommendationsDiv = document.getElementById('dassRecommendations');
    
    if (!resultsDiv || !recommendationsDiv) {
        console.error('Results containers not found for download');
        return;
    }

    const content = `
DASS Assessment Results
----------------------
${resultsDiv.textContent.trim()}

Recommendations
--------------
${recommendationsDiv.textContent.trim()}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DASS_Assessment_Results.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.loadResults);
} else {
    window.loadResults();
}
})();
