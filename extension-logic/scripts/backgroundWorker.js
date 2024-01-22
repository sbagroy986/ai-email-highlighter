// background cookie service worker
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    // handle cookie request message events
    if (request.type === "cookie") {
      var formattedCookie = "";
      const params = request.params;
      const array = request.array;
      chrome.cookies.getAll(params, function(cookies) {
        if (cookies) {
          for(var i=0; i<cookies.length; i+=1) {
            if (array.includes(cookies[i].name)) {
              formattedCookie += cookies[i].name+"="+cookies[i].value+";";  
            }
          }
          sendResponse({cookie: formattedCookie});
        } else {
          console.log("Cookie not found for request: "+request);
        }
      }); 
    }

  // handle user input message events
  if (request.type === "saveConfig") {
    const oaiKey = request.oaiKey;
    const emailCriteria = request.emailCriteria;
    
    chrome.storage.local.set({ oaiKey: oaiKey, emailCriteria: emailCriteria}, function() {
    });
  }

  // handle reading stored user input
  if (request.type === "loadConfig") {
    try {
      chrome.storage.local.get(["oaiKey", "emailCriteria"], function(result) {
        sendResponse({oaiKey: result.oaiKey, emailCriteria: result.emailCriteria});
      });       
    } catch {
      sendResponse({oaiKey: null, emailCriteria: null});
    }
  }

  // use async
  return true;
});
