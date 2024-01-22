# AI Email Highlighter

## Description
A Chrome extension built to help highlight emails you don't want to miss. The extension aims to manage the overflow of emails, newsletters, and articles that can be overwhelming to sort through. 

Note: This is the first Chrome extension I have ever built, I was learning how to build extensions as I was building this. Apologies in advance for any hiccups..

## Usage & Setup
See the extension in action in the video below.

https://github.com/sbagroy986/ai-email-scanner/assets/7946556/fe2c425b-a9ab-496a-8dbd-c2e927b4b6af


- Clone the repo. Follow this [step](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) to package the extension logic (in extension-logic/) into an extension that your (Chrome) browser can use.
- To use the extension, generate your own OpenAI API key from their [portal](https://platform.openai.com/api-keys) and copy it. The extension defaults to using GPT-3.5 Turbo, standard usage rates will apply.
- Open the extension pop-up UI by clicking on the extension icon (see video).
- Paste the generated API key in the *OpenAI Key* field. This key is being saved on your local browser storage, the extension does **not** share this key with anyone else nor use it for any other purpose than those described in this app.
- Write your own criteria for which emails are important to you. Add this criteria as a list in the extension pop-up UI. There should be a few default criteria in there already to give you a sense of how to define the criteria and syntax, feel free to replace any/all of these with your own.
- Reload the webpage once you are done configuring the API key and/or the criteria.
- Now when you oepn Gmal, your last 10 unread emails will automatically be scanned by the extension and the important ones will be highlighted!

## Technical Design
- The extension asks for permission to access your Gmail homepage.
- When you load your homepage, it looks through the HTML/DOM structure of the page to identify unread emails.
- For these unread emails, it makes AJAX POST requests in the background to fetch the content of each email. This is necessary since the content of the email is not available/loaded in the inbox view.
  - To be able to make the above POST request, the extension extracts Gmail cookies from your browser. It then reconstructs this into the shape that the POST end-point expects and then makes the call. This intermediate step was probably the most painful part of this whole journey.
- Once the extension has extracted the content of the unread emails, the next task is to query GPT-3.5 with the content of the email, a set of criteria that determines whether an email is important/should be highlighted and an OpenAI API key.
  - The email importance criteria and API key are received as input from the pop-up's UI. They are stored in chrome's local storage.
  - There currently isn't a way to query OpenAI endpoints directly from Javascript in a Chrome extension. OpenAI provides a Node.js library but that would have been difficult to package into the extension.
  - Instead, I decided to setup a Flask intermediate/proxy server. The logic for this server is pretty straight-forward. It receives the query (i.e API key, email content, email criteria) and then calls the GPT-3.5 Turbo OpenAI endpoint. It then passes back the response from the endpoint (with an additional CORS header)
- The GPT-3.5 Turbo response is parsed out as a basic JSON "Yes" or "No" response; this response is essentially whether or not the email in question is important enough to be highlighted given the user-specified criteria.
- For those emails that should be highlighted, the extension injects an icon via a custom HTML class into the unread email's UI. It replaces the "starred" icon, as can be seen in the demo video. These marked emails are those that should be highlighted.

## To-Dos
- The extension is currently only limited to the last 10 unread emails. A limit was added to prevent excessive OpenAI API usage/costs. This limit should be exposed as a parameter so that the user is able to define how many emails they want scanned in one go.
- This extension is currently dependent on a Flask intermediate/proxy server (that I set up) hosted on Heroku which facilitates querying OpenAI endpoints. There might be a better architecture in the future that has a lower maintenance and/or cost burden.
- The extension cannot currently be disabled from the UI. A checkbox should be added in the pop-up UI to allow the user to enable/disable the extension.
- Allow the user to choose what LLM to be used for scanning emails, as opposed to being stuck to GPT-3.5 Turbo.
- Find more robust ways to access Gmail DOM elements and API calls; these are currently brittle and are likely to break in case of any major changes.
- Improving code modularity and readability.

## Personal Note
This project is stemming from my recent inability to keep up with my personal email account. I receive too many emails, newsletters and articles for me to look through them consistently, and I am hoping this extension can help with some of it. More broadly, this is a small way for me to start tackling the larger problem that modernity/technology has introduced; there is too much information out there, what should I consume?
