let questions = [];
let currentQuestionIndex = 0;
const userSelections = {};

// Fetch questions
fetch('/static/json/onboarding_questions.json')
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
const skipBtn = document.getElementById('skip-btn');

// Render current question
function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  // Update question title and text
  questionTitle.textContent = currentQuestion.title;
  questionText.textContent = currentQuestion.question;

  // Clear previous options and render new ones
  optionsContainer.innerHTML = '';

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.classList.add('option-btn');
    button.textContent = option;

    // Highlight the previously selected option
    if (userSelections[currentQuestion.id] === index) {
      button.classList.add('selected');
    }

    // Event listener: Save selection and move to the next question
    button.addEventListener('click', () => {
      // Save user selection
      //userSelections[currentQuestion.id] = index;
      userSelections[currentQuestion.id] = currentQuestion.options[index];
      localStorage.setItem('userSelections', JSON.stringify(userSelections));

      // Move to the next question or submit on the last question
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion(); // Render the next question
      } else {
        submitOnboarding(); // Submit responses when on the last question
        window.location.href = 'http://127.0.0.1:5000/chatbot';
      }
    });

    optionsContainer.appendChild(button);
  });

  // Update the Previous button's state
  prevBtn.disabled = currentQuestionIndex === 0;
}
  

// Navigation
prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

skipBtn.addEventListener('click', () => {
  // Redirect to chatbot.html
  window.location.href = 'http://127.0.0.1:5000/chatbot';
});


function submitOnboarding() {
  const userData = JSON.stringify(userSelections);
  fetch('http://127.0.0.1:5000/api/process-onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: userData,
  })
  .then((response) => response.json())
  /*
  .then((onboardingData) => {
    console.log("Onboarding data received:");
    console.log(onboardingData); // Log data to the terminal/console
    alert("Check the browser console for the onboarding data!"); // Optional alert for confirmation
  })
  */
  .catch((error) => console.error('Error fetching onboarding data:', error));
}