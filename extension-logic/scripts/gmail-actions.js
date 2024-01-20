//// helper variables
//limit marking to a constant number of emails
const NUM_EMAILS = 10;
// set debug mode to enable/disable logging
const DEBUG_MODE = true;
const LOG_PREFIX = "[Extension Log] ";
// time to sleep
const SLEEP_TIME_MS = 4000;
// dictionary for DOM elements
const DOM_MAP = {
	topLevelTable: '.F.cf.zt',
	emailSpan: 'span.T-KT.aXw',
	iconToRemove: 'aXw',
	iconToAdd: 'T-KT-Jp-ext',
	unreadEmail: 'tr.zE'
};



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



//// script body

// main function that scans emails and highlights the "important" ones
// needs to be an async function because we need to introduce a delay between extension load
// and logic execution; gmail takes a few seconds to load UI elements and ends up over-writing
// the injected HTML (i.e highlights) if we don't wait a few seconds
async function scanEmails() {

	// wait for GMail to finish loading before marking/highlighting emails
	debugLog("Sleeping....");
    await sleepHelper(SLEEP_TIME_MS);
	debugLog("Done sleeping....");

	// find parent table DOM elements for emails to mark
	const table = document.querySelector(DOM_MAP.topLevelTable);
	debugLog("Table found ");
	debugLog(table, false);

	if (table) {
		var unreadEmails = table.querySelectorAll(DOM_MAP.unreadEmail);
		debugLog("Unread emails");
		debugLog(unreadEmails, false);

		// if no unread emails are found, end execution
		if(!unreadEmails) return;
	
		var spans = [];
		unreadEmails.forEach(email => {
			spans.push(email.querySelector(DOM_MAP.emailSpan));
		});
		spans = enforceEmailLimit(spans);
		debugLog("Spans (containing unread emails) found");
		debugLog(spans, false);

		spans.forEach(span => {
			span.classList.remove(DOM_MAP.iconToRemove);
			span.classList.add(DOM_MAP.iconToAdd);
		});	
		debugLog("Spans (containing unread emails) modified");
		debugLog(spans, false);
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

scanEmails();