//// script body

// main function that scans emails and highlights the "important" ones
// needs to be an async function because we need to introduce a delay between extension load
// and logic execution; gmail takes a few seconds to load UI elements and ends up over-writing
// the injected HTML (i.e highlights) if we don't wait a few seconds
async function scanEmails(oaiKey, emailCriteria) {

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


		// find emails to highlight
		var promises = [];
		for (var i=0; i<emailsStruct.length; i+=1)
			promises.push(gptQuery(emailsStruct[i].emailContent, oaiKey, emailCriteria));

		Promise.all(promises).then((results) =>{
			for(var i=0; i<emailsStruct.length;i+=1) {
				var toHighlight = false;
				try {
				  // try to parse result as JSON
				  const result = JSON.parse(results[i]);
				  debugLog(emailsStruct[i], false);
				  debugLog(result, false);

				  if(result.response === "Yes") {
				  	// highlight email
				  	highlightEmail(emailsStruct[i]);
				  }
				} catch (error) {
				  // in case malformed JSON, try string match
				  if(results[i] && results[i].includes("Yes")) {
				  	// highlight email
				  	highlightEmail(emailsStruct[i]);
				  }
				}
			}
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

// Get stored user api key and email criteria 
chrome.runtime.sendMessage({ type: "loadConfig" }, function(response) {
	const oaiKey = response.oaiKey;
	const emailCriteria = response.emailCriteria;

	debugLog("Loaded config");

	// don't execute logic if no OpenAI key provided
	if (!oaiKey || oaiKey === "") return true;

	debugLog("Executing logic");
	debugLog(emailCriteria, false);
	
	// scan emails with loaded email criteria and api key
	scanEmails(oaiKey, emailCriteria);
});