// Retrieve results from localStorage
function getDassResults() {
    const data = localStorage.getItem('dassResults');
    return data ? JSON.parse(data) : null;
}

// Compute severity based on score
function getSeverity(type, score) {
    const levels = {
        depression: [[0,9,'Normal'],[10,13,'Mild'],[14,20,'Moderate'],[21,27,'Severe'],[28,Infinity,'Extremely Severe']],
        anxiety:    [[0,7,'Normal'],[8,9,'Mild'],[10,14,'Moderate'],[15,19,'Severe'],[20,Infinity,'Extremely Severe']],
        stress:     [[0,14,'Normal'],[15,18,'Mild'],[19,25,'Moderate'],[26,33,'Severe'],[34,Infinity,'Extremely Severe']]
    };
    return levels[type].find(l => score >= l[0] && score <= l[1])[2];
}

function badgeClass(level) {
    return level === 'Normal' ? 'bg-success'
         : level === 'Mild' ? 'bg-info'
         : level === 'Moderate' ? 'bg-warning text-dark'
         : 'bg-danger';
}

// Main
document.addEventListener('DOMContentLoaded', () => {
    const results = getDassResults();
    const resultCard = document.getElementById('dassResultCard');
    const emptyMsg = document.getElementById('noDassMessage');

    if (!results) {
        if(emptyMsg) emptyMsg.style.display = 'block';
        if(resultCard) resultCard.style.display = 'none';
        return;
    }

    if(emptyMsg) emptyMsg.style.display = 'none';
    if(resultCard) resultCard.style.display = 'block';

    const depressionScore = results.depressionScore ?? 0;
    const anxietyScore = results.anxietyScore ?? 0;
    const stressScore = results.stressScore ?? 0;

    // Set scores
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if(el) el.textContent = value;
    };
    setText('depressionScore', depressionScore);
    setText('anxietyScore', anxietyScore);
    setText('stressScore', stressScore);

    // Set severity badges
    const dLevel = getSeverity('depression', depressionScore);
    const aLevel = getSeverity('anxiety', anxietyScore);
    const sLevel = getSeverity('stress', stressScore);

    const setBadge = (id, level) => {
        const el = document.getElementById(id);
        if(el) { el.textContent = level; el.className = `badge ${badgeClass(level)}`; }
    };
    setBadge('depressionLevel', dLevel);
    setBadge('anxietyLevel', aLevel);
    setBadge('stressLevel', sLevel);

    // Save normalized severity for recommendations
    results.depression_level = dLevel;
    results.anxiety_level = aLevel;
    results.stress_level = sLevel;
    localStorage.setItem('dassResults', JSON.stringify(results));
});
