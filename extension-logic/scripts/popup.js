// popup.js
document.addEventListener('DOMContentLoaded', function() {
	const oaiKey = document.getElementById('oaiKey');
	const emailCriteria = document.getElementById('emailCriteria');
	const submitButton = document.getElementById('submitButton');

	// Save new user config
	submitButton.addEventListener('click', function() {
		const oaiKeyValue = oaiKey.value;
		const emailCriteriaValue = emailCriteria.value;
		const type = "saveConfig";

		// Send data to background script
		chrome.runtime.sendMessage({ oaiKey: oaiKeyValue, emailCriteria: emailCriteriaValue, type: type }, function(response) {
		});
	});


	// Get stored user config
	chrome.runtime.sendMessage({ type: "loadConfig" }, function(response) {
		const oaiKeyValue = response.oaiKey;
		const emailCriteriaValue = response.emailCriteria;

		emailCriteria.value = emailCriteriaValue;
		oaiKey.value = oaiKeyValue;
	});
});
