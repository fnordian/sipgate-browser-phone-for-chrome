
window.setTimeout(function () {

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
