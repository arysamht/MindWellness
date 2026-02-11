class MindQuestChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.suggestedResponses = document.getElementById('suggestedResponses');
        this.lastMessageCategory = 'initial';
        this.conversationContext = [];

        // Define possible responses (same as before)
        this.responses = {
            greetings: [
                "Hi there! I'm your MindWellness assistant, here to support your mental well-being. What's on your mind?",
                "Hello! I'm here to help you with your mental well-being. How are you feeling today?",
                "Welcome to MindWellness! I'm your supportive companion. How can I assist you today?"
            ],
            suggestions: {
                initial: [
                    "I need help with stress",
                    "I'm feeling anxious",
                    "I'm feeling down",
                    "Tell me about relaxation techniques"
                ],
                stress: [
                    "How can I manage stress?",
                    "Quick stress relief tips",
                    "Breathing exercises",
                    "Work-life balance advice"
                ],
                anxiety: [
                    "Anxiety coping techniques",
                    "How to calm down quickly",
                    "Dealing with panic attacks",
                    "Anxiety self-help tips"
                ],
                depression: [
                    "Ways to improve mood",
                    "Daily self-care tips",
                    "Finding motivation",
                    "Professional help resources"
                ],
                self_care: [
                    "Tips for self-care today",
                    "Take a break, relax your mind",
                    "How to unwind after a busy day",
                    "Mindfulness exercises"
                ],
                relaxation: [
                    "Guided breathing exercises",
                    "Progressive muscle relaxation",
                    "Mindful meditation",
                    "Quick relaxation techniques"
                ]
            },
            depression: {
                emergency: [
                    "If you're having thoughts of self-harm or feeling overwhelmed:",
                    "• Emergency Services: 911",
                    "• National Suicide Prevention Lifeline: 988 or 1-800-273-8255",
                    "• Crisis Text Line: Text HOME to 741741",
                    "You're not alone. Would you like me to provide more crisis resources or connect you with professional help?"
                ],
                coping: [
                    "I hear that you're feeling down. Here are some strategies that might help:",
                    "1. Start with small, achievable goals each day",
                    "2. Try to maintain a regular sleep schedule",
                    "3. Engage in light physical activity",
                    "4. Connect with supportive friends or family",
                    "5. Practice self-compassion",
                    "Would you like to explore any of these strategies further?"
                ]
            },
            stress: {
                coping: [
                    "Here are some effective stress management strategies:",
                    "1. Practice time management and prioritization",
                    "2. Try mindfulness meditation",
                    "3. Regular physical exercise",
                    "4. Maintain work-life balance",
                    "5. Set healthy boundaries",
                    "Would you like to explore any of these strategies in detail?"
                ],
                quick_relief: [
                    "Try this quick stress relief exercise:",
                    "1. Find a comfortable position",
                    "2. Take a deep breath in for 4 counts",
                    "3. Hold for 4 counts",
                    "4. Exhale slowly for 6 counts",
                    "5. Repeat 3-5 times",
                    "Would you like to try another relaxation technique?"
                ]
            },
            anxiety: {
                coping: [
                    "I understand you're feeling anxious. Here are some effective techniques:",
                    "1. Try the 4-7-8 breathing technique",
                    "2. Practice progressive muscle relaxation",
                    "3. Use grounding exercises (5-4-3-2-1 method)",
                    "4. Challenge anxious thoughts",
                    "5. Focus on the present moment",
                    "Would you like to learn more about any of these techniques?"
                ],
                grounding: [
                    "Let's try a grounding exercise called the 5-4-3-2-1 method:",
                    "• Name 5 things you can see",
                    "• Name 4 things you can touch",
                    "• Name 3 things you can hear",
                    "• Name 2 things you can smell",
                    "• Name 1 thing you can taste",
                    "This can help bring you back to the present moment. Would you like to try it?"
                ]
            },
            relaxation: {
                techniques: [
                    "Here are some relaxation techniques you can try:",
                    "1. Deep breathing exercises",
                    "2. Progressive muscle relaxation",
                    "3. Guided imagery",
                    "4. Mindful meditation",
                    "5. Body scan meditation",
                    "Which technique would you like to learn more about?"
                ]
            },
            follow_up: [
                "How are you feeling now?",
                "Is there anything specific you'd like to know more about?",
                "Would you like to try another technique?",
                "Is there something else on your mind?"
            ]
        };

        this.init();
    }

    async processUserMessage(message) {
        const lowerMsg = message.toLowerCase();
        let responses = [];
        let category = 'initial';

        // Call API first
        try {
            const response = await fetch('/api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    context: this.conversationContext.slice(-5)
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.response) {
                    responses = Array.isArray(data.response) ? data.response : [data.response];
                }
            }
        } catch (error) {
            console.warn('API call failed, using local responses');
        }

        // Local fallback if API fails or empty response
        if (responses.length === 0) {
            const crisisWords = ['suicid', 'kill myself', 'end my life', 'die', 'dead', 'death', 'harm'];
            if (crisisWords.some(word => lowerMsg.includes(word))) {
                responses = this.responses.depression.emergency;
                this.showCrisisMessage();
                category = 'depression';
            } else if (lowerMsg.includes('stress')) {
                responses = lowerMsg.includes('quick') || lowerMsg.includes('help') ? 
                    this.responses.stress.quick_relief : this.responses.stress.coping;
                category = 'stress';
            } else if (lowerMsg.includes('anxi')) {
                responses = lowerMsg.includes('ground') || lowerMsg.includes('panic') ? 
                    this.responses.anxiety.grounding : this.responses.anxiety.coping;
                category = 'anxiety';
            } else if (/depress|sad|down/.test(lowerMsg)) {
                responses = this.responses.depression.coping;
                category = 'depression';
            } else if (/relax|calm|breath|meditat/.test(lowerMsg)) {
                responses = this.responses.relaxation.techniques;
                category = 'relaxation';
            } else if (this.isGreeting(lowerMsg)) {
                responses = [this.getRandomResponse(this.responses.greetings)];
                category = 'initial';
            } else {
                responses = [
                    "I'm here to support you! You can ask me about:",
                    "• Managing stress and anxiety",
                    "• Coping with depression",
                    "• Relaxation techniques",
                    "• Breathing exercises",
                    "• Grounding methods",
                    "• Crisis resources",
                    "What would you like to explore?"
                ];
            }
        }

        // Update conversation context
        this.conversationContext.push({ sender: 'user', message });
        responses.forEach(resp => this.conversationContext.push({ sender: 'bot', message: resp }));

        // Update suggested responses
        this.showSuggestedResponses(category);

        // Save to session storage
        try {
            const sessionConversation = JSON.parse(sessionStorage.getItem('chatConversation') || '[]');
            sessionConversation.push({ timestamp: new Date().toISOString(), message, responses, category });
            sessionStorage.setItem('chatConversation', JSON.stringify(sessionConversation.slice(-50)));
        } catch (error) {
            console.warn('Error saving conversation to sessionStorage:', error);
        }

        return responses;
    }

    init() {
        // Event listeners
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleUserInput(); });

        // Initial greeting
        this.addMessage(this.getRandomResponse(this.responses.greetings), 'bot');

        // Show initial suggestions
        if (this.suggestedResponses) {
            this.showSuggestedResponses('initial');
        }
    }

    showTypingIndicator() {
        this.removeTypingIndicator(); // Remove existing
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.chatMessages.appendChild(indicator);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        return indicator;
    }

    removeTypingIndicator() {
        const existing = document.querySelector('.typing-indicator');
        if (existing) existing.remove();
    }

    handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message) return;
        this.addMessage(message, 'user');
        this.userInput.value = '';
        const typingIndicator = this.showTypingIndicator();

        setTimeout(async () => {
            this.removeTypingIndicator();
            const botResponses = await this.processUserMessage(message);
            for (let i = 0; i < botResponses.length; i++) {
                await new Promise(res => setTimeout(() => { this.addMessage(botResponses[i], 'bot'); res(); }, 800));
            }
            // Optional: Add follow-up only if no crisis
            if (!document.querySelector('.crisis-alert')) {
                const followUp = this.getRandomResponse(this.responses.follow_up);
                setTimeout(() => this.addMessage(followUp, 'bot'), 800);
            }
        }, 500);
    }

    addMessage(message, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message message-appear`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.linkify(this.formatMessage(message));

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        div.appendChild(contentDiv);
        div.appendChild(timeDiv);
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatMessage(message) {
        message = message.replace(/•/g, '<br>•').replace(/(\d+\.\s)/g, '<br>$1').replace(/^<br>/, '');
        return message;
    }

    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s,.]+)/g;
        return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }

    showSuggestedResponses(category) {
        if (!this.suggestedResponses) return;
        const suggestions = this.responses.suggestions[category] || this.responses.suggestions.initial;
        this.suggestedResponses.innerHTML = '';
        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'suggested-response';
            btn.textContent = suggestion;
            btn.addEventListener('click', () => { this.userInput.value = suggestion; this.handleUserInput(); });
            this.suggestedResponses.appendChild(btn);
        });
    }

    showCrisisMessage() {
        if (document.querySelector('.crisis-alert')) return;
        const crisisHTML = `
            <div class="alert alert-danger crisis-alert">
                <h4 class="alert-heading">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Immediate Support Available
                </h4>
                <p>It seems you're going through a difficult time. Help is available 24/7:</p>
                <ul>
                    <li>Emergency Services: <a href="tel:911">911</a></li>
                    <li>National Suicide Prevention Lifeline: <a href="tel:988">988</a> or <a href="tel:1-800-273-8255">1-800-273-8255</a></li>
                    <li>Crisis Text Line: Text HOME to <b>741741</b></li>
                </ul>
                <p class="mb-0">You're not alone. Professionals are ready to listen and help.</p>
                <button class="btn btn-outline-danger mt-3" onclick="chatbot.removeCrisisMessage()">
                    <i class="bi bi-x-lg me-2"></i>Close
                </button>
            </div>
        `;
        const container = document.createElement('div');
        container.innerHTML = crisisHTML;
        this.chatMessages.insertBefore(container, this.chatMessages.firstChild);
    }

    removeCrisisMessage() {
        const alert = document.querySelector('.crisis-alert');
        if (alert) alert.remove();
    }

    isGreeting(message) {
        const greetings = [/\b(hello|helo)\b/i, /\b(hi|hey)\b/i, /\b(good\s?(morning|afternoon|evening)|greetings)\b/i];
        return greetings.some(re => re.test(message));
    }

    getRandomResponse(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}

// Instantiate chatbot
const chatbot = new MindQuestChatbot();
