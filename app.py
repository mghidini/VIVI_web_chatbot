from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os
import json

app = Flask(__name__)
CORS(app)
app.secret_key = 'YOUR_SECRET_KEY'

# Set OpenAI API key
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize conversation history storage
user_conversations = {}  # Dictionary to store conversation history for each user

# Load onboarding questions at app startup
with open('static/json/onboarding_questions.json', 'r') as file:
    questions = json.load(file)  # A list of question dictionaries

# Route to serve index.html
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

# Route to serve chatbot.html
@app.route('/chatbot')
def serve_chatbot():
    return send_from_directory('static', 'chatbot.html')

# Route to serve onboarding.html
@app.route('/onboarding')
def serve_onboarding():
    return send_from_directory('static', 'onboarding.html')

@app.route('/api/submit-onboarding', methods=['POST'])
def submit_onboarding():
    try:
        # Get the user selection data from the request body
        user_selections = request.get_json()
        
        print("Received user selections:")
        print(user_selections)

        # Return a success response
        return jsonify({"message": "Onboarding data submitted successfully"}), 200

    except Exception as e:
        # Handle errors and return a failure response
        return jsonify({"error": str(e)}), 500

@app.route('/api/process-onboarding', methods=['POST'])
def process_onboarding():
    try:
        # Receive onboarding answers from the frontend
        onboarding_answers = request.get_json()

        # Format questions with user answers
        combined_responses = []
        for question in questions:
            question_id = str(question['id'])
            user_answer = onboarding_answers.get(question_id, "No answer provided")
            combined_responses.append(
                f"Q: {question['question']} A: {user_answer}"
            )

        # Combine everything into a single string for the prompt
        formatted_responses = "\n".join(combined_responses)
        session['onboarding_data'] = formatted_responses

        prompt = f"""
        The user was presented with the following questions and provided these answers during onboarding:
        {formatted_responses}

        Now they are chatting with you. Your name is Vivi and you are a friendly assistant that helps the user to grow and cultivate relationships. Respond thoughtfully.
        """
        print(prompt)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": prompt},
                      {"role": "assistant", "content": "Hi, I'm Vivi, how can I help you today?"}]
        )

        chatbot_message = response.choices[0].message.content

        # Send the response back to the frontend
        return jsonify({"message": chatbot_message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Endpoint for chatbot interaction
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # Get the user message from the frontend
        user_message = request.json.get('message')
        user_id = request.remote_addr

        # Retrieve the onboarding data from the session
        onboarding_data = session.get('onboarding_data', {})
        if not onboarding_data:
            onboarding_data = {}

        # Construct the full prompt
        system_prompt = f"""
        The user was presented with the following questions and provided these answers during onboarding:
        {str(onboarding_data)}

        Now they are chatting with you. Your name is Vivi and you are a friendly assistant that helps the user to grow and cultivate relationships. Respond thoughtfully.
        """

        # Initialize conversation history for the user if it doesn't exist
        if user_id not in user_conversations:
            user_conversations[user_id] = [
                {"role": "system", "content": system_prompt}
            ]

        # Append user's message to conversation history
        user_conversations[user_id].append({"role": "user", "content": user_message})

        # OpenAI API call
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=user_conversations[user_id]
        )

        # Extract and return the assistant's response
        bot_message = response.choices[0].message.content
        user_conversations[user_id].append({"role": "assistant", "content": bot_message})

        return jsonify({"message": bot_message})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "An error occurred while processing your request."}), 500


if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)