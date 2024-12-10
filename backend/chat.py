from flask import Flask, request, jsonify, session
import openai
import os

app = Flask(__name__)

# Set your OpenAI API Key
openai.api_key = "YOUR_OPENAI_API_KEY"

@app.route('/api/onboarding', methods=['POST'])
def process_onboarding():
    try:
        # Receive onboarding data from the frontend
        onboarding_data = request.json

        # Prepare the prompt for the OpenAI API
        prompt = f"""
        The user completed an onboarding process and gave the following answers:
        {onboarding_data}

        Now they are chatting with you. Respond thoughtfully.
        """

        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        # Extract the response from OpenAI
        chatbot_message = response['choices'][0]['message']['content']

        # Send the response back to the frontend
        return jsonify({"message": chatbot_message})

    except Exception as e:
        # Handle errors gracefully
        return jsonify({"error": str(e)}), 500
    
# Endpoint for chatbot interaction
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        onboarding_data = session.get('onboarding_data', "No onboarding data provided")

        # Combine onboarding data with user message to create context
        prompt = f"""
        The user completed an onboarding process and gave the following answers:
        {onboarding_data}

        Now they are chatting with you. Their message: "{user_message}"
        Respond thoughtfully.
        """

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        bot_message = response['choices'][0]['message']['content']
        return jsonify({"message": bot_message})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)
