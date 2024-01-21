from flask import Flask, request, jsonify
import requests
from openai import OpenAI


app = Flask(__name__)

# ChatGPT API endpoint
CHATGPT_API_URL = "https://api.openai.com/v1/engines/gpt-3.5-turbo/completions"

@app.route("/chat", methods=["POST"])
def chat():
    try:
        prompt = request.json["prompt"]
        api_key = request.json["api_key"]
        response = call_chatgpt(prompt)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)})

def call_chatgpt(prompt, api_key, max_tokens=10000):
    openai.api_key = api_key
    client = OpenAI()

    data = {
        "prompt": prompt,
        "max_tokens": max_tokens
    }

    try:
        completion = client.chat.completions.create(
          model="gpt-3.5-turbo",
          messages=[
            {"role": "system", "content": "You are helping filter emails for gmail users. You will be provided email content as well as some criteria to filter these emails by. Return the emails that pass these criteria."},
            {"role": "user", "content": prompt}
          ]
        )
        return completion.choices[0].message
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    app.run(debug=True)
