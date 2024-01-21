// move to global vars
const DEFAULT_CRITERIA = `- Does the email refer to a receipt, a billing schedule, a subscription, a bank transfer or any other financially relevant detail? 
- Does it contain any lucrative job offers?
- Does it contain any philosophical ideas and concepts?
- Does it contain any content around mental models or thought provoking discussion?
- Does it contain important science news in the fields of nutrition, biology, longevity or physics?
`;

// popup.js
document.addEventListener('DOMContentLoaded', function() {
	const oaiKey = document.getElementById('oaiKey');
	const emailCriteria = document.getElementById('emailCriteria');
	const submitButton = document.getElementById('submitButton');

	// Save new user config
	submitButton.addEventListener('click', function() {
		var oaiKeyValue = oaiKey.value;
		var emailCriteriaValue = emailCriteria.value;
		const type = "saveConfig";

		// deal with missing email criteria
		if (!emailCriteriaValue || emailCriteriaValue === "") {
			emailCriteriaValue = DEFAULT_CRITERIA;
		}

		// deal with missing OpenAI key
		if (!oaiKeyValue) {
			oaiKeyValue = "";
		}		

		// Send data to background script
		chrome.runtime.sendMessage({ oaiKey: oaiKeyValue, emailCriteria: emailCriteriaValue, type: type }, function(response) {
		});
	});


	// Get stored user config
	chrome.runtime.sendMessage({ type: "loadConfig" }, function(response) {
		var oaiKeyValue = response.oaiKey;
		var emailCriteriaValue = response.emailCriteria;

		emailCriteria.value = emailCriteriaValue;
		oaiKey.value = oaiKeyValue;
	});
});
