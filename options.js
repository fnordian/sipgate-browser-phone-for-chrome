function getCredentials() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://beeblebrox.heartofgold.de/webrtc/creds.json";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            storeCredentials(myArr);
        } else {
            reportFailure();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    function storeCredentials(arr) {
        alert(arr);
    }
}

var clientId = "rBXYamyzeb";
var clientSecret = "MGYJkI58f33xn1UApszbOWEmWSGMm5vJzDRQcVhWVaPUxdpgaW";


function getRedirectUrl() {
    var url = window.location.toString();

    var urlDelimiters = ["?", "#"];

    for (var c in urlDelimiters) {
        var pos = url.indexOf(urlDelimiters[c]);

        if (pos >= 0) {
            url = url.substr(0, pos);
        }
    }

    return url;
}

var redirectUri = getRedirectUrl();

function getCodeFromUri(uri) {
    var pos = uri.search("code=");

    if (pos != -1) {
        return uri.substr(pos + 5);
    } else {
        return undefined;
    }
}

function requestAuthentication() {

    var code = getCodeFromUri(window.location.toString());

    if (code === undefined) {
        window.location = "https://api.sipgate.com/v1/authorization/oauth/authorize?" +
            "client_id=" + clientId +
            "&redirect_uri=" + encodeURIComponent(redirectUri) +
            "&response_type=code" +
            "&scope=users:read+devices:read";
    } else {
        requestToken(code);
    }
}

function requestToken(code) {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://api.sipgate.com/v1/authorization/oauth/token";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            storeToken(myArr);
        } else {
            reportFailure();
        }
    };
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xmlhttp.send("" +
        "client_id=" + clientId +
        "&client_secret=" + clientSecret +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&code=" + code +
        "&grant_type=authorization_code");

    function storeToken(arr) {
        alert(arr);
    }
}

function reportFailure() {
    console.log("unable to get credentials. authenticate first.");
}

window.setTimeout(function () {
    document.getElementById("getCredentialsLink").onclick = function () {
        getCredentials();
    };
    document.getElementById("authenticateLink").onclick = function () {
        requestAuthentication();
    };

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
