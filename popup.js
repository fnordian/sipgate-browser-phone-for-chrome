requirejs.config({
    baseUrl: '',
    paths: {
        react: "node_modules/react/dist/react-with-addons",
        reactdom: "node_modules/react-dom/dist/react-dom",
        'google-client-api': "node_modules/google-client-api/index",
        'scriptjs': "node_modules/google-client-api/node_modules/scriptjs/dist/script.min",
        'promise': "node_modules/google-client-api/node_modules/promise/index",
        ui: "generated-jsx/ui"
    }
});


requirejs(['ui', 'reactdom'], function (ui, reactdom) {
    var dialer = reactdom.render(ui, window.document.getElementById("container"));
    var globals = chrome.extension.getBackgroundPage().globals;
    var userAgent = globals["userAgent"];
    var audio = globals["audio"];
    var addStream = globals["addStream"];

    globals["dialStatePopupHandler"] = function(dialState) {
        dialer.setDialState(dialState);
    };

    globals["registerStatePopupHandler"] = function(registerState) {
        dialer.setRegisterState(registerState);
    };


    dialer.setDialState(globals["dialState"]);
    dialer.setRegisterState(globals["registerState"]);

    dialer.setHandler("onDial", function (number) {
        globals["call"]('sip:' + number + '@sipgate.de');
    });
    dialer.setHandler("onHangup", function () {
        //userAgent.terminateSessions();
        globals["hangup"]();
    });
    dialer.setHandler("onAccept", function () {
        globals["answer"]();
    });
    dialer.setHandler("onReject", function () {
        globals["reject"]();
    });



    var getContacts = function(token) {
        var x = new XMLHttpRequest();
        x.open('GET', 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000');
        x.onload = function() {
            var response = JSON.parse(x.response);
            console.log(response);
            dialer.setContacts(response.feed.entry);
        };
        x.setRequestHeader('Authorization', "Bearer " + token);
        x.send();
    };

    chrome.identity.getAuthToken({
        interactive: true
    }, function(token) {
        if (chrome.runtime.lastError) {
            alert(chrome.runtime.lastError.message);
            return;
        }


        getContacts(token);
    });



});
