// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const userInput = document.getElementById('userInput');
  const submitButton = document.getElementById('submitButton');

  submitButton.addEventListener('click', function() {
    const data = userInput.value;
    const type = "userInput";
    // Send data to background script
    chrome.runtime.sendMessage({ input: data, type: type }, function(response) {
      console.log('Message sent from popup to background script:', response);
    });
  });
});
