var s = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.extension.getURL('phoneinject.js');

var runtime = chrome.runtime;

s.onload = function() {
    document.getElementsByTagName("body")[0].addEventListener('sipgateCallEvent', function(e) {

        console.log("custom event received");
        console.log(e);

        runtime.sendMessage({dialNumber: e.detail}, function (response) {

        });
    });


    this.remove();
};
(document.head || document.documentElement).appendChild(s);



