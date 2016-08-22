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

    dialer.setContacts(globals["contacts"]);

});
