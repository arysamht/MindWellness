let isRelaxing = false;
let currentMuscleGroup = 0;
const muscleGroups = document.querySelectorAll('.muscle-group');
const instructions = {
    hands: "Clench your fists tightly, then release...",
    shoulders: "Raise your shoulders to your ears, then relax...",
    face: "Scrunch your facial muscles, then release...",
    chest: "Take a deep breath, tighten chest muscles, then release...",
    stomach: "Tighten your stomach muscles, then relax...",
    legs: "Point your toes and tighten leg muscles, then release..."
};

function startRelaxation() {
    if (!isRelaxing) {
        isRelaxing = true;
        currentMuscleGroup = 0;
        document.getElementById('relaxationButton').textContent = 'Stop Exercise';
        progressRelaxation();
    } else {
        stopRelaxation();
    }
}

function progressRelaxation() {
    if (!isRelaxing) return;
    
    muscleGroups.forEach((group, index) => {
        if (index === currentMuscleGroup) {
            group.classList.add('active');
            group.classList.remove('completed');
            const groupName = group.dataset.group;
            document.getElementById('currentInstruction').textContent = instructions[groupName];
        } else if (index < currentMuscleGroup) {
            group.classList.remove('active');
            group.classList.add('completed');
        } else {
            group.classList.remove('active', 'completed');
        }
    });

    if (currentMuscleGroup >= muscleGroups.length) {
        stopRelaxation();
        return;
    }

    setTimeout(() => {
        currentMuscleGroup++;
        if (isRelaxing) progressRelaxation();
    }, 10000);
}

function stopRelaxation() {
    isRelaxing = false;
    document.getElementById('relaxationButton').textContent = 'Start Exercise';
    document.getElementById('currentInstruction').textContent = "Click 'Start Exercise' to begin the relaxation session.";
    muscleGroups.forEach(group => group.classList.remove('active', 'completed'));
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async function() {
    try {
        await fetch('api/logout.php', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to logout. Please try again.');
    }
});