document.addEventListener('DOMContentLoaded', function() {
    var output = document.querySelector('output');
    var input = document.getElementById('nameInput');
    var addLstBtn = document.getElementById('addLstBtn');
    var dltLstBtn = document.getElementById('dltLstBtn');
    var simpleBtn = document.getElementById('simpleBtn');
    var recordBtn = document.getElementById('recordBtn');
    var reloadBtn = document.getElementById('reloadBtn');
    var selection = document.getElementById('myUL');

    var listObjArray = [undefined,undefined,undefined,undefined]; // the array of list objects

    var numOfLists = 0;
    var toDelete = false;
    const LIST_NUM_LIMIT = 4;

    /*
    * the format of the list objects stored
    * listName :
    * urlArray :
    *
    * and they are stored with tags BrowserReliefURLs1 2,3,4
    * */

    /*
     * the format of the options:
     *
     * innerHTML : the list name (displayed) of the list
     * value : the tag index of the option, used to do record, reload (array index+1)
     * (i.e. 1/2/3/4)
     *
     * */


    function find1stFreeTag() {
        for(var i = 0; i < LIST_NUM_LIMIT; i++){
            if (listObjArray[i] == undefined){
                return i+1;
            }
        }
        return LIST_NUM_LIMIT+1;
    }



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
                    listObjArray[i-1] = listObj;
                    // create new element in html
                    var opt = document.createElement('option');
                    opt.innerHTML = listObj.listName;
                    opt.value = i; // the tag index
                    selection.appendChild(opt);

                    // increment the number of the list counter
                    numOfLists++;
                    loadLists(i+1)
                }
                else {
                    loadLists(i+1)
                }
            });
        }
        else{
            // reached the end
            if (numOfLists == 4){
                input.value = "already full!";
            }
            else{
                input.value = 'defaultList' + find1stFreeTag().toString();
            }
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
            // the tag index about to be used
            var tagNumber = find1stFreeTag();
            // create a new option entry
            var opt = document.createElement('option');
            opt.innerHTML = newListName;
            opt.value = tagNumber; // the tag index
            selection.appendChild(opt);
            numOfLists++;

            // ready to set the new list object
            var tagName = 'BrowserReliefURLs' + (tagNumber).toString();
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
                listObjArray[tagNumber-1] = tagObj[tagName];

                // update the input box
                if (numOfLists >= 4){
                    input.value = "already full!";
                }
                else{
                    input.value = 'defaultList' + (find1stFreeTag()).toString();
                }
            });


        }

    },false);

    // delete a list
    dltLstBtn.addEventListener('click', function () {
        if (toDelete){
            var dltIndex = selection.selectedIndex;
            var dltTagIndex = selection.options[dltIndex].value;
            var dltName = selection.options[dltIndex].innerHTML;
            var dltTagName = 'BrowserReliefURLs' + (dltTagIndex).toString()

            // remove the object in chrome storage
            chrome.storage.sync.remove(dltTagName, function() {

                selection.remove(dltIndex); // remove the html option

                // also remove the object in list object array
                listObjArray[dltTagIndex-1] = undefined;
                numOfLists--;

                // update the input box
                input.value = 'defaultList' + (find1stFreeTag()).toString();

                toDelete = false; // reset the bool
                output.textContent = dltName + "deleted";

                if (numOfLists > 0){
                    // set the focus to selection list
                    selection.selectedIndex = 0;
                    selection.focus();
                }
            });
        }
        else{
            toDelete = true;
            output.textContent = "Click again to delete records"
        }

    },false);


    recordBtn.addEventListener('click', function () {

        var recIndex = selection.selectedIndex;
        var recTagIndex = selection.options[recIndex].value;
        var recName = selection.options[recIndex].innerHTML;
        var recTagName = 'BrowserReliefURLs' + (recTagIndex).toString()

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
            listObjArray[recTagIndex] = tagObj[recTagName];
        });

    },false);


    reloadBtn.addEventListener('click', function () {
        var reloadIndex = selection.selectedIndex;
        var rldTagIndex = selection.options[reloadIndex].value;
        var reloadName = selection.options[reloadIndex].innerHTML;
        var URLsArray = listObjArray[rldTagIndex].urlArray;
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
