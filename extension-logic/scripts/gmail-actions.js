//// helper variables
//limit marking to a constant number of emails
const NUM_EMAILS = 10;
// set debug mode to enable/disable logging
const DEBUG_MODE = true;
const LOG_PREFIX = "[Extension Log] ";
// time to sleep
const SLEEP_TIME_MS = 3000;



//// helper functions
// limit the number of emails to operate on
function enforceEmailLimit(emails) {
	var filteredNodeList = [];
	for (var i=0; i<NUM_EMAILS; i+=1) {
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
	const table = document.querySelector('.F.cf.zt'); // TO-DO: rewrite this to read id classes from a locale file
	debugLog("Table found: " + table);

	if (table) {
		var spans = table.querySelectorAll('span.T-KT.aXw'); // TO-DO: rewrite this to read id classes from a locale file
		spans = enforceEmailLimit(spans);
		debugLog("Spans (containing emails) found");
		debugLog(spans, false);

		spans.forEach(span => {
			span.classList.remove('aXw');
			span.classList.add('T-KT-Jp');
		});	
		debugLog("Spans (containing emails) modified");
		debugLog(spans, false);
	}	

}


// style to inject
const style = document.createElement('style');
style.textContent = `
	T-KT.T-KT-Jp-ext::before {
	    background-image: url(//ssl.gstatic.com/ui/v1/icons/mail/gm3/2x/star_fill_googyellow500_20dp.png);
	    background-position: center;
	    background-repeat: no-repeat;
	    background-size: 20px;
	}
`;

// inject custom style into document
document.head.appendChild(style);

scanEmails();