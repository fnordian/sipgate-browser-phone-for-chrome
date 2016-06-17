
window.setTimeout(function () {

    var init = function() {
        var uriToSipid = function(uri) {
            var ret = /sip:(.*)@/.exec(uri);

            if (ret !== null && ret.length > 1) {
                return ret[1];
            } else {
                return "";
            }
        };

        chrome.storage.sync.get([ "uri", "password" ], function(config) {
            document.getElementById("sipid").value = uriToSipid(config["uri"]);
            document.getElementById("password").value = typeof config["password"] === "undefined" ? "" : config["password"];
            document.getElementById("password").focus();
            document.getElementById("sipid").focus();
        });

    };

    init();

    document.getElementById("saveSipCredentialsButton").onclick = function(e) {

        var sipid = document.getElementById("sipid").value;
        var password = document.getElementById("password").value;
        chrome.storage.sync.set({
            'ws_servers': 'wss://tls01.sipgate.de:443',
            uri: "sip:" + sipid + "@sipgate.de",
            password: password
        });

        chrome.runtime.reload()
    };

});


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
    audio: true,
    video: false
};
var audio = document.querySelector('webrtcaudio');

navigator.getUserMedia(constraints, function() {}, function() {});
