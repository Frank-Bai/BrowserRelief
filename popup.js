document.addEventListener('DOMContentLoaded', function() {
  var output = document.querySelector('output');
  var recordButton = document.getElementById('recordTabs');
  var reopenButton = document.getElementById('reopenTabs');
  var deleteRecords = document.getElementById('deleteRecords');
  var toDelete = false;

  recordButton.addEventListener('click', function() {
    toDelete = false; // disable delete
    chrome.tabs.query({
        lastFocusedWindow: true     // In the current window
    }, function(array_of_Tabs) {
        len = array_of_Tabs.length; // the number of tabs
        var array_of_URLs = [];
        for (var i = 0; i < len; i++) {
          array_of_URLs.push(array_of_Tabs[i].url); // write URLs 
        }
        chrome.storage.sync.set({'BrowserReliefURLs': array_of_URLs}, function() {
          // already recorded
          output.textContent = "Recorded!";
        });
    });
  }, false);  

  reopenButton.addEventListener('click', function() {
    chrome.storage.sync.get('BrowserReliefURLs',function(items){
      var URLsArray = items.BrowserReliefURLs;
      for (var url in URLsArray) {
        // open tabs
        chrome.tabs.create({url:URLsArray[url]});      
      }
    });
  }, false);

  deleteRecords.addEventListener('click', function() {
    if(!toDelete){
      output.textContent = "Click again to delete records";
      toDelete = true; // ready to delete
    }
    else {
      chrome.storage.sync.remove('BrowserReliefURLs', function() {
          // already recorded
          output.textContent = "Deleted!";
          toDelete = false;
      });
    }

  }, false);   


}, false);
