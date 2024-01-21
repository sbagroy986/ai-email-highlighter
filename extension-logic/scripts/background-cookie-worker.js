// background cookie service worker
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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

    // use async
    return true;
});
