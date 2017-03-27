document.addEventListener('DOMContentLoaded', function() {
    var output = document.querySelector('output');
    var input = document.getElementById('nameInput');
    var addLstBtn = document.getElementById('addLstBtn');
    var dltLstBtn = document.getElementById('dltLstBtn');
    var simpleBtn = document.getElementById('simpleBtn');
    var recordBtn = document.getElementById('recordBtn');
    var reloadBtn = document.getElementById('reloadBtn');
    var selection = document.getElementById('myUL');

    var listObjArray = []; // the array of list objects

    var numOfLists = 0;
    var toDelete = false;
    var LIST_NUM_LIMIT = 4;

    /*
    * the format of the list objects stored
    * listName :
    * urlArray :
    *
    * and they are stored with tags BrowserReliefURLs1 2,3,4
    * */

    // load the objects information and update the page
    // loop through the lists by recursion
    // making nested callback function calls to make them executed in order
    function loadLists(i) {
        var tagName = 'BrowserReliefURLs' + (i).toString();
        if (i <= LIST_NUM_LIMIT){
            chrome.storage.sync.get(tagName,function(items){
                // if the object exists
                if (items[tagName] != undefined){
                    var listObj = items[tagName];
                    // put into the global var array
                    listObjArray.push(listObj);
                    // create new element in html
                    var opt = document.createElement('option');
                    opt.innerHTML = listObj.listName;
                    selection.appendChild(opt);
                    loadLists(i+1)
                }
                else {
                    numOfLists = listObjArray.length;
                    // update the input box
                    input.value = 'defaultList' + (numOfLists+1).toString();
                    if (numOfLists > 0) {
                        selection.selectedIndex = 0;
                        selection.focus();
                    }
                }
            });
        }
        else{
            // already full
            numOfLists = 4;
            input.value = "already full!";
            // set the focus to selection list
            selection.selectedIndex = 0;
            selection.focus();
        }

    }

    loadLists(1);


    // add a new list
    addLstBtn.addEventListener('click', function(){
        // if the current list number is beyond the limit
        if (numOfLists >= LIST_NUM_LIMIT){
            output.textContent = "at most 4 lists, please delete a list first";
        }
        else{
            // and set the name of the list as the one in input
            var newListName = input.value;
            // create a new option entry
            var opt = document.createElement('option');
            opt.innerHTML = newListName;
            selection.appendChild(opt);
            numOfLists++;

            // ready to set the new list object
            var tagName = 'BrowserReliefURLs' + (numOfLists).toString();
            var tagObj = new Object;

            toDelete = false; // disable delete

            // when creating the new list, we record the tabs automatically
            chrome.tabs.query({
                lastFocusedWindow: true     // In the current window
            }, function(array_of_Tabs) {
                var array_of_URLs = [];
                for (var i = 0; i < array_of_Tabs.length; i++) {
                    array_of_URLs.push(array_of_Tabs[i].url); // write URLs
                }
                // the urlArray set up
                tagObj[tagName] = {
                    listName : newListName,
                    urlArray : array_of_URLs
                };
                // the chrome storage set
                chrome.storage.sync.set(tagObj, function() {
                    output.textContent = newListName + " list created and current tabs recorded";
                });
                // also update the local array
                listObjArray.push(tagObj[tagName]);
            });
            // update the input box
            input.value = 'defaultList' + (numOfLists+1).toString();

        }

    },false);

    // delete a list
    dltLstBtn.addEventListener('click', function () {
        if (toDelete){
            var dltIndex = selection.selectedIndex;
            var dltName = selection.options[dltIndex].innerHTML;
            var dltTagName = 'BrowserReliefURLs' + (dltIndex+1).toString()

            selection.remove(dltIndex);
            // remove the object in chrome storage
            chrome.storage.sync.remove(dltTagName, function() {
                output.textContent = dltName + "deleted";
            });
            // also remove the object in list object array
            listObjArray.remove(dltIndex);
            numOfLists--;
            // update the input box
            input.value = 'defaultList' + (numOfLists+1).toString();
            if (numOfLists > 0){
                // set the focus to selection list
                selection.selectedIndex = 0;
                selection.focus();
            }
            toDelete = false; // reset the bool
        }
        else{
            toDelete = true;
            output.textContent = "Click again to delete records"
        }

    },false);


    recordBtn.addEventListener('click', function () {
        var recIndex = selection.selectedIndex;
        var recName = selection.options[recIndex].innerHTML;
        var recTagName = 'BrowserReliefURLs' + (recIndex+1).toString()

        // ready to set the new list object
        var tagObj = new Object;

        toDelete = false; // disable delete

        // recording the tabs
        chrome.tabs.query({
            lastFocusedWindow: true     // In the current window
        }, function(array_of_Tabs) {
            var array_of_URLs = [];
            for (var i = 0; i < array_of_Tabs.length; i++) {
                array_of_URLs.push(array_of_Tabs[i].url); // write URLs
            }
            // the urlArray set up
            tagObj[recTagName] = {
                listName : recName,
                urlArray : array_of_URLs
            };
            // the chrome storage set
            chrome.storage.sync.set(tagObj, function() {
                output.textContent = "tabs recorded, written to " + recName;
            });
            // also update the local array
            listObjArray[recIndex] = tagObj[recTagName];
        });

    },false);


    reloadBtn.addEventListener('click', function () {
        var reloadIndex = selection.selectedIndex;
        var reloadName = selection.options[reloadIndex].innerHTML;
        var URLsArray = listObjArray[reloadIndex].urlArray;
        for (var url in URLsArray) {
            chrome.tabs.create({url:URLsArray[url]}); // open tabs
        }
        output.textContent = reloadName + " list reloaded";
    },false);


    // button directs back to simple
    simpleBtn.addEventListener('click', function(){
        chrome.storage.sync.set({'BrowserReliefAdvBool' : false});
        window.location.href = "popup.html";
    });



}, false);
