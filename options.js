window.setTimeout(function () {

    var init = function () {
        var uriToSipid = function (uri) {
            var ret = /sip:(.*)@/.exec(uri);

            if (ret !== null && ret.length > 1) {
                return ret[1];
            } else {
                return "";
            }
        };

        chrome.storage.sync.get(["uri", "password"], function (config) {
            $(document).ready(function () {
                $('select').material_select();
            });
            document.getElementById("sipid").value = uriToSipid(config["uri"]);
            document.getElementById("password").value = typeof config["password"] === "undefined" ? "" : config["password"];
            document.getElementById("password").focus();
            document.getElementById("domain").focus();
            document.getElementById("sipid").focus();
        });

    };

    init();

    document.getElementById("saveSipCredentialsButton").onclick = function (e) {

        var sipid = document.getElementById("sipid").value;
        var password = document.getElementById("password").value;
        var domain = document.getElementById("domain").value;

        if (!domain) {
            domain = "sipgate.de";
        }

        chrome.storage.sync.set({
            'ws_servers': 'wss://tls01.sipgate.de:443',
            uri: "sip:" + sipid + "@" + domain,
            password: password
        });

        chrome.runtime.reload()
    };

    document.getElementById("requestGoogleAuthorizationButton").onclick = function (e) {
        requestGoogleAuthorization(true);
        e.preventDefault();
    }

});

var showGoogleAuthorizationRequest = function (show) {
    document.getElementById("requestGoogleAuthorization").style.display = show ? "block" : "none";
};

var requestGoogleAuthorization = function (interactive) {
    console.log("sending request");

    chrome.extension.sendMessage({request: "requestGoogleAuthorization", interactive: interactive}, function (response) {
        console.log("response received");
        console.log(response);

        showGoogleAuthorizationRequest(interactive ? false : response.autherror);
    });
};


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
    audio: true,
    video: false
};
var audio = document.querySelector('webrtcaudio');

navigator.getUserMedia(constraints, function () {
}, function () {
});
requestGoogleAuthorization(false);
