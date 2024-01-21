//// helper variables
// limit marking to a constant number of emails
const NUM_EMAILS = 10;
// set debug mode to enable/disable logging
const DEBUG_MODE = true;
const LOG_PREFIX = "[Extension Log] ";
// time to sleep
const SLEEP_TIME_MS = 4000;
// dictionary for DOM elements
const DOM_MAP = {
	topLevelTable: '.F.cf.zt',
	unreadEmail: 'tr.zE',
	iconTd: '.apU.xY',
	idTd: '.yX.xY',
	emailIconSpan: 'span.T-KT.aXw',
	iconToRemove: 'aXw',
	iconToAdd: 'T-KT-Jp-ext'
};
// cookie params to fetch
const googleDomainParams = ["HSID","SSID","APISID","SAPISID","SEARCH_SAMESITE","AEC","NID","SID","1P_JAR","SIDCC","__Secure-1PSID","__Secure-3PSID","__Secure-1PAPISID","__Secure-3PAPISID","__Secure-1PSIDTS","__Secure-3PSIDTS","__Secure-1PSIDCC","__Secure-3PSIDCC"];
const mailGoogleDomainParams = ["OSID", "__Secure-OSID", "S", "__Host-GMAIL_SCH_GMN", "__Host-GMAIL_SCH_GMS", "__Host-GMAIL_SCH_GML", "__Host-GMAIL_SCH"];

// openai api key
const oaiKey = "";
const proxyUrl = "https://openai-be-proxy-66ad8b45b156.herokuapp.com/chat";


//// helper functions
// limit the number of emails to operate on
function enforceEmailLimit(emails) {
	var filteredNodeList = [];
	for (var i=0; (i<NUM_EMAILS)&&(i<emails.length); i+=1) {
		filteredNodeList.push(emails[i]);
	}
	return filteredNodeList;
};

// helper function to implement sleep() in JS
function sleepHelper(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// helper function to show/hide logs based on debugging mode
function debugLog(message, logAsString=true) {
    if (DEBUG_MODE) {
    	if (logAsString) {
	        console.log(LOG_PREFIX + message);
    	} else {
    		console.log(message);
    		console.log("\n");
    	}
    }
}

// helper function to make a POST call to fetch email content
async function emailContentQuery(cookie, emailId) {
	const url = 'https://mail.google.com/sync/u/0/i/fd?hl=en&c=0&rt=r&pt=ji';
	const headers = {
	  'authority': 'mail.google.com',
	  'accept': '*/*',
	  'accept-language': 'en-US,en;q=0.9',
	  'content-type': 'application/json',
	  'cookie': cookie,
	  'origin': 'https://mail.google.com',
	  'referer': 'https://mail.google.com/mail/u/0/',
	  'sec-fetch-dest': 'empty',
	  'sec-fetch-mode': 'cors',
	  'sec-fetch-site': 'same-origin',
	  'x-gmail-btai': '[null,null,[null,null,null,null,null,0,null,null,null,1,null,null,1,null,0,1,1,0,1,null,null,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,"en","",1,0,25,null,0,1,0,1,1,1,1,1,null,1,1,0,1,1,0,0,null,0,1,null,1,0,null,null,0,null,1,0,1,0,null,0,0,0,null,null,1,100,0,1,0,1,0,0,0,1,0,0,1],null,"f4db4e34fb",null,25,"gmail.pinto-server_20240115.06_p1",1,5,"",-18000000,"-05:00",null,null,598938947,"","",1705796803701]',
	  'x-gmail-storage-request': '',
	  'x-google-btd': '1'
	};

	const data = JSON.stringify([[[ emailId, 1, null, null, 1 ]], 1]);

	return await fetch(url, {method: 'POST', headers: headers, body: data})
		    .then(response => {return response.text();})
		    .then(data => {return data;})
		    .catch(error => {console.error('Fetch error:', error);});
}

// helper function to generate the below struct for a given email
//// {
////		emailId: <id>,
////		emailSubject: <from>,
////		emailIconSpan: <iconSpan>,
////		emailContent: <content>
//// }
async function parseEmailHelper(cookie, email) {
	const tempSpan = email.querySelector('span[data-thread-id]');
	const emailId = tempSpan.getAttribute('data-thread-id').slice(1);
	const emailSubject = tempSpan.textContent;
	const emailIconSpan = email.querySelector(DOM_MAP.emailIconSpan);
	const emailContent = await emailContentQuery(cookie, emailId);

	const struct = {
		emailId: emailId,
		emailSubject: emailSubject,
		emailIconSpan: emailIconSpan,
		emailContent: emailContent
	};
	return struct;
}

// helper function to structure email metadata
async function parseEmails(cookie, emails) {
	var structs = [];
	for (var i=0; i<emails.length; i+=1) {
		structs.push(await parseEmailHelper(cookie, emails[i]));
	}
	return structs;
}


// helper function to fetch and generate cookie
async function fetchAndGenerateCookie() {
	var cookie = "";
	var response = "";
	var params = "";
	
	// COMPASS-1
	params = {"name": "COMPASS", "path": "/sync/u/0", "domain": "mail.google.com"};
	response = await chrome.runtime.sendMessage({ params: params, array: ["COMPASS"] });
	cookie = response.cookie;

	// COMPASS-2
	params = {"name": "COMPASS", "path": "/mail", "domain": "mail.google.com"};
	response = await chrome.runtime.sendMessage({ params: params, array: ["COMPASS"] });
	cookie = cookie + ";" + response.cookie;

	// all mail.google.com params
	params = {"domain": "mail.google.com"};
	response = await chrome.runtime.sendMessage({ params: params, array: mailGoogleDomainParams});
	cookie = cookie + ";" + response.cookie;

	// all .google.com params
	params = {"domain": ".google.com"};
	response = await chrome.runtime.sendMessage({ params: params, array: googleDomainParams});
	cookie = cookie + ";" + response.cookie;

	debugLog(cookie);
	return cookie;
}

// helper function to query openai
function gptQuery(p) {

	const prompt = "Translate the following English text to French: 'Hello, how are you?'";

	const requestData = {
	  api_key: oaiKey,
	  prompt: prompt
	};

	const headers = {
		"Content-Type": "application/json"
	};

	// Make the POST request to the GPT-3.5 Turbo API
	fetch(proxyUrl, {
	  method: "POST",
	  headers: headers,
	  body: JSON.stringify(requestData)
	})
	  .then(response => {
	    if (!response.ok) {
	      throw new Error(`HTTP error! Status: ${response.status}`);
	    }
	    return response.json();
	  })
	  .then(data => {
	    // Handle the response from the API
	    console.log("API Response:", data);
	  })
	  .catch(error => {
	    console.error("API Error:", error);
	  });	
}

//// script body

// main function that scans emails and highlights the "important" ones
// needs to be an async function because we need to introduce a delay between extension load
// and logic execution; gmail takes a few seconds to load UI elements and ends up over-writing
// the injected HTML (i.e highlights) if we don't wait a few seconds
async function scanEmails() {

	// Get cookie to make API calls
	var cookie = await fetchAndGenerateCookie();


	// wait for Gmail to finish loading before marking/highlighting emails
	debugLog("Sleeping....");
    await sleepHelper(SLEEP_TIME_MS);
	debugLog("Done sleeping....");

	// find parent table DOM elements for emails to mark
	const table = document.querySelector(DOM_MAP.topLevelTable);
	debugLog("Table found ");
	debugLog(table, false);

	if (table) {
		// Search for unread emails
		var unreadEmails = table.querySelectorAll(DOM_MAP.unreadEmail);
		debugLog("Unread emails");
		debugLog(unreadEmails, false);

		// if no unread emails are found, end execution
		if(!unreadEmails) return;

		// limit number of emails to be processed
		unreadEmails = enforceEmailLimit(unreadEmails);
		debugLog("Unread emails after limiting");
		debugLog(unreadEmails, false);

		// structure found emails for further processing
		const emailsStruct = await parseEmails(cookie, unreadEmails);
		debugLog("Unread emails after structuring");
		debugLog(emailsStruct, false);


		// highlight emails
		emailsStruct.forEach(email => {
			email.emailIconSpan.classList.remove(DOM_MAP.iconToRemove);
			email.emailIconSpan.classList.add(DOM_MAP.iconToAdd);
		});

		gptQuery("prompt");
	}	

}



// get URL for icon to inject
var iconPath = chrome.runtime.getURL('images/email-highlight-icon.png');

// style to inject
const style = document.createElement('style');
style.textContent = `
	.T-KT.T-KT-Jp-ext::before {
	    background-image: url(`+ iconPath +`);
	    background-position: center;
	    background-repeat: no-repeat;
	    background-size: 20px;
	}
`;

// inject custom style into document
document.head.appendChild(style);

// execute logic
scanEmails();