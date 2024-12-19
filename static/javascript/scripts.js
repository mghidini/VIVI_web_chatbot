
// DOM elements
const onboarding_btn = document.getElementById('onboarding-btn');
const chatbot_btn = document.getElementById('chatbot-btn');

// Event listeners
onboarding_btn.addEventListener('click', () => {
    window.location.href = 'http://127.0.0.1:5000/onboarding';
});

chatbot_btn.addEventListener('click', () => {
    window.location.href = 'http://127.0.0.1:5000/chatbot';
});