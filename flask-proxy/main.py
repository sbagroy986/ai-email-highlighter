from flask import Flask, request, jsonify
import requests
import openai
from openai import OpenAI


app = Flask(__name__)

# ChatGPT API endpoint
CHATGPT_API_URL = "https://api.openai.com/v1/engines/gpt-3.5-turbo/completions"

@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Request params
        data = request.form

        # Extract prompt from request
        prompt = data["prompt"]

        # Extract OpenAI API key from request
        api_key = data["api_key"]

        response = call_chatgpt(prompt, api_key)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)})

def call_chatgpt(prompt, api_key, max_tokens=10000):
    # Intialize OpenAI client
    openai.api_key = api_key
    client = OpenAI()

    try:
        # Use GPT-3.5 Turbo to respond to user prompt
        completion = client.chat.completions.create(
          model="gpt-3.5-turbo",
          messages=[
            {"role": "user", "content": prompt}
          ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    app.run(debug=True)
