document.addEventListener('DOMContentLoaded', () => {
    const chatbox = document.getElementById('chatbox');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
  
    // Function to append messages to the chatbox
    function appendMessage(content, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
      messageDiv.textContent = content;
      chatbox.appendChild(messageDiv);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
    // Send message to the backend
    sendBtn.addEventListener('click', () => {
      const message = userInput.value.trim();
      if (message) {
        appendMessage(message, 'user'); // Display user's message
        userInput.value = ''; // Clear input field
  
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        })
        .then((res) => res.json())
        .then((data) => {
          appendMessage(data.message, 'bot'); // Display bot's response
        })
        .catch((error) => {
          console.error('Error:', error);
          appendMessage('Oops! Something went wrong.', 'bot');
        });
      }
    });
  });  