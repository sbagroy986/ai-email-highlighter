// move to global vars
const DEFAULT_CRITERIA = `- Does the email refer to a receipt, a billing schedule, a subscription, a bank transfer or any other financially relevant detail? 
- Does it contain any lucrative job offers?
- Does it contain any philosophical ideas and concepts?
- Does it contain any content around mental models or thought provoking discussion?
- Does it contain important science news in the fields of nutrition, biology, longevity or physics?
`;

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
    var oaiKey = request.oaiKey;
    var emailCriteria = request.emailCriteria;
    
    // deal with missing email criteria
    if (!emailCriteria || emailCriteria === "") {
      emailCriteria = DEFAULT_CRITERIA;
    }

    // deal with missing OpenAI key
    if (!oaiKey) {
      oaiKey = "";
    }   

    chrome.storage.local.set({ oaiKey: oaiKey, emailCriteria: emailCriteria}, function() {
    });
  }

  // handle reading stored user input
  if (request.type === "loadConfig") {
    try {
      chrome.storage.local.get(["oaiKey", "emailCriteria"], function(result) {
        var oaiKey = result.oaiKey;
        var emailCriteria = result.emailCriteria;

        // deal with missing email criteria
        if(!emailCriteria || emailCriteria === "") {
          emailCriteria = DEFAULT_CRITERIA;
        }

        // deal with missing OpenAI key
        if (!oaiKey) {
          oaiKey = "";
        }  

        sendResponse({oaiKey: oaiKey, emailCriteria: emailCriteria});
      });       
    } catch {
      sendResponse({oaiKey: null, emailCriteria: DEFAULT_CRITERIA});
    }
  }

  // use async
  return true;
});
