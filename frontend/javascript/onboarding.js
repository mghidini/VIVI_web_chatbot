let questions = [];
let currentQuestionIndex = 0;
const userSelections = {};

// Fetch questions
fetch('../public/onboarding_questions.json')
  .then((response) => response.json())
  .then((data) => {
    questions = data;
    renderQuestion();
  });

// DOM Elements
const questionTitle = document.getElementById('question-title');
const questionText = document.getElementById('question-text');
const optionsContainer = document.querySelector('.options');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Render current question
function renderQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionTitle.textContent = currentQuestion.title;
    questionText.textContent = currentQuestion.question;
  
    // Render options
    optionsContainer.innerHTML = ''; // Clear previous options
    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.classList.add('option-btn');
      button.textContent = option;
  
      // Highlight previously selected option
      if (userSelections[currentQuestion.id] === index) {
        button.classList.add('selected');
      }
  
      // Handle option selection
      button.addEventListener('click', () => {
        userSelections[currentQuestion.id] = index;
        localStorage.setItem('userSelections', JSON.stringify(userSelections));
        renderQuestion();
      });
  
      optionsContainer.appendChild(button);
    });
  
    // Toggle Previous button
    prevBtn.disabled = currentQuestionIndex === 0;
  
    // Update Next button text
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next';
  }
  

// Navigation
prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    // Submit data to backend
    submitDataToBackend();
  }
});

// Send data to backend
  function submitDataToBackend() {
    fetch('/api/get-onboarding')
      .then((response) => response.json())
      .then((onboardingData) => {
        // Send onboarding data to your Python backend
        fetch('/api/onboarding', { // Python backend endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(onboardingData), // Send the onboarding data
        })
        .then((res) => res.json())
        .then((data) => {
          console.log('Chatbot response:', data.message);
          // Example: Display chatbot response in the UI
          document.getElementById('response-container').innerText = data.message;
        })
        .catch((error) => console.error('Error:', error));
      })
      .catch((error) => console.error('Failed to get onboarding data:', error));
  }
  