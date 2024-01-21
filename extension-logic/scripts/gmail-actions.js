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

// helper function to generate the below struct for a given email
// {
//		emailId: <id>,
//		emailSubject: <from>,
//		emailIconSpan: <iconSpan>,
//		emailContent: <content>
// }
function parseEmailHelper(email) {
	const tempSpan = email.querySelector('span[data-thread-id]');
	const emailId = tempSpan.getAttribute('data-thread-id');
	const emailSubject = tempSpan.textContent;
	const emailIconSpan = email.querySelector(DOM_MAP.emailIconSpan);

	const struct = {
		emailId: emailId,
		emailSubject: emailSubject,
		emailIconSpan: emailIconSpan,
		emailContent: ""
	};
	return struct;
}

// helper function to structure email metadata
function parseEmails(emails) {
	var structs = [];
	for (var i=0; i<emails.length; i+=1) {
		structs.push(parseEmailHelper(emails[i]));
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
		const emailsStruct = parseEmails(unreadEmails);
		debugLog("Unread emails after structuring");
		debugLog(emailsStruct, false);


		// highlight emails
		emailsStruct.forEach(email => {
			email.emailIconSpan.classList.remove(DOM_MAP.iconToRemove);
			email.emailIconSpan.classList.add(DOM_MAP.iconToAdd);
		});	
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