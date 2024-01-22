# AI Email Highlighter

## Description
A Chrome extension built to help highlight emails you don't want to miss. The extension aims to manage the overflow of emails, newsletters, and articles that can be overwhelming to sort through. 

## Usage
See the extension in action in the video below.

https://github.com/sbagroy986/ai-email-scanner/assets/7946556/fe2c425b-a9ab-496a-8dbd-c2e927b4b6af


- To use the extension, generate your own OpenAI API key from their [portal](https://platform.openai.com/api-keys) and copy it. The extension defaults to using GPT-3.5 Turbo, standard usage rates will apply.
- Open the extension pop-up UI by clicking on the extension icon (see video).
- Paste the generated API key in the *OpenAI Key* field. This key is being saved on your local browser storage, the extension does **not** share this key with anyone else nor use it for any other purpose than those described in this app.
- Write your own criteria for which emails are important to you. Add this criteria as a list in the extension pop-up UI. There should be a few default criteria in there already to give you a sense of how to define the criteria and syntax, feel free to replace any/all of these with your own.
- Reload the webpage once you are done configuring the API key and/or the criteria.
- Now when you oepn Gmal, your last 10 unread emails will automatically be scanned by the extension and the important ones will be highlighted!

## To-Dos
- The extension is currently only limited to the last 10 unread emails. A limit was added to prevent excessive OpenAI API usage/costs. This limit should be exposed as a parameter so that the user is able to define how many emails they want scanned in one go.
- This extension is currently dependent on a Flask intermediate/proxy server (that I set up) hosted on Heroku which facilitates querying OpenAI endpoints. There might be a better architecture in the future that has a lower maintenance and/or cost burden.
- The extension cannot currently be disabled from the UI. A checkbox should be added in the pop-up UI to allow the user to enable/disable the extension.
- Allow the user to choose what LLM to be used for scanning emails.
- Find more robust ways to access Gmail DOM elements and API calls; these are currently brittle and are likely to break in case of any major changes.
- Improving code modularity and readability.

## Personal Note
This project is stemming from my recent inability to keep up with my personal email account. I receive too many emails, newsletters and articles for me to look through them consistently, and I am hoping this extension can help with some of it. More broadly, this is a small way for me to start tackling the larger problem that modernity/technology has introduced; there is too much information out there, what should I consume?
