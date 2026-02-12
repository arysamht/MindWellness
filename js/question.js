const questions = [
    "I found it hard to wind down",
    "I was aware of dryness of my mouth",
    "I couldn't seem to experience any positive feeling at all",
    "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)",
    "I found it difficult to work up the initiative to do things",
    "I tended to over-react to situations",
    "I experienced trembling (e.g. in the hands)",
    "I felt that I was using a lot of nervous energy",
    "I was worried about situations in which I might panic and make a fool of myself",
    "I felt that I had nothing to look forward to",
    "I found myself getting agitated",
    "I found it difficult to relax",
    "I felt down-hearted and blue",
    "I was intolerant of anything that kept me from getting on with what I was doing",
    "I felt I was close to panic",
    "I was unable to become enthusiastic about anything",
    "I felt I wasn't worth much as a person",
    "I felt that I was rather touchy",
    "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)",
    "I felt scared without any good reason",
    "I felt that life was meaningless"
];

const form = document.getElementById('dassForm');
const questionsContainer = document.querySelector('.questions-list');
const progressBar = document.getElementById('progressBar');
const progressText = progressBar.querySelector('.progress-text');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

let currentQuestionIndex = 0;

// Generate questions
questions.forEach((q, i) => {
    const html = `
        <div class="question-item mb-5" data-index="${i}" style="display:${i===0?'block':'none'};">
            <div class="mb-3">
                <div class="d-flex align-items-start mb-2">
                    <span class="badge bg-primary me-3">Q${i+1}</span>
                    <p class="mb-0">${q}</p>
                </div>
            </div>
            <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" name="q${i+1}" id="q${i+1}_0" value="0" required>
                <label class="btn btn-outline-primary" for="q${i+1}_0">0</label>
                <input type="radio" class="btn-check" name="q${i+1}" id="q${i+1}_1" value="1">
                <label class="btn btn-outline-primary" for="q${i+1}_1">1</label>
                <input type="radio" class="btn-check" name="q${i+1}" id="q${i+1}_2" value="2">
                <label class="btn btn-outline-primary" for="q${i+1}_2">2</label>
                <input type="radio" class="btn-check" name="q${i+1}" id="q${i+1}_3" value="3">
                <label class="btn btn-outline-primary" for="q${i+1}_3">3</label>
            </div>
        </div>
    `;
    questionsContainer.insertAdjacentHTML('beforeend', html);
});

// Highlight active radio buttons
form.addEventListener('change', e => {
    if(e.target.type === 'radio'){
        const parent = e.target.closest('.btn-group');
        Array.from(parent.children).forEach(el=>el.classList.remove('active'));
        parent.querySelector(`label[for="${e.target.id}"]`).classList.add('active');
        updateProgress();
        checkCurrentQuestionAnswered();
    }
});

function checkCurrentQuestionAnswered() {
    const allQuestions = form.querySelectorAll('.question-item');
    const currentQuestion = allQuestions[currentQuestionIndex];
    const isAnswered = currentQuestion.querySelector('input[type="radio"]:checked') !== null;
    
    // Enable next button only if current question is answered
    if(currentQuestionIndex < allQuestions.length - 1) {
        nextBtn.disabled = !isAnswered;
    }
}

function updateProgress(){
    const total = questions.length;
    const answered = form.querySelectorAll('input[type="radio"]:checked').length;
    const percent = Math.round((answered/total)*100);
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
    document.getElementById('progressPercent').textContent = percent;
}

// Navigation
nextBtn.addEventListener('click', ()=>showQuestion(currentQuestionIndex+1));
    
    // Check if current question is answered to enable/disable next button
    checkCurrentQuestionAnswered();
prevBtn.addEventListener('click', ()=>showQuestion(currentQuestionIndex-1));

function showQuestion(index){
    const allQuestions = form.querySelectorAll('.question-item');
    if(index<0||index>=allQuestions.length) return;
    allQuestions[currentQuestionIndex].style.display='none';
    allQuestions[index].style.display='block';
    currentQuestionIndex=index;

    prevBtn.disabled = currentQuestionIndex===0;
    nextBtn.style.display = currentQuestionIndex===allQuestions.length-1 ? 'none' : 'inline-block';
    submitBtn.style.display = currentQuestionIndex===allQuestions.length-1 ? 'inline-block' : 'none';
}

// Form submission
// Form submission (FRONTEND ONLY – no PHP)
form.addEventListener('submit', e => {
    e.preventDefault();

    if(!form.checkValidity()){
        form.classList.add('was-validated');
        alert('Please answer all questions before submitting.');
        return;
    }

    const answers = Array.from(new FormData(form).values()).map(Number);

    const depressionScore = (answers[2]+answers[4]+answers[9]+answers[12]+answers[15]+answers[16]+answers[20]) * 2;
    const anxietyScore = (answers[1]+answers[3]+answers[6]+answers[8]+answers[14]+answers[18]+answers[19]) * 2;
    const stressScore = (answers[0]+answers[5]+answers[7]+answers[10]+answers[11]+answers[13]+answers[17]) * 2;

const history = JSON.parse(localStorage.getItem('dassHistory')) || [];

history.push({
    depressionScore,
    anxietyScore,
    stressScore,
    date: new Date().toISOString()
});

localStorage.setItem('dassHistory', JSON.stringify(history));
localStorage.setItem('dassResults', JSON.stringify(history[history.length - 1]));

    // Go to dashboard
    window.location.href = 'dashboard.html';
});

// Initialize
updateProgress();