requirejs.config({
    baseUrl: '',
    paths: {
        react: "node_modules/react/dist/react-with-addons",
        reactdom: "node_modules/react-dom/dist/react-dom",
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

    dialer.setDialState(globals["dialState"]);

    dialer.setHandler("onDial", function (number) {

        //userAgent.call('sip:' + number + '@sipgate.de', options);
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

    /*
    var eventHandlers = {
        'progress': function (e) {
            setDialState("progress");
            console.log('call is in progress');
        },
        'failed': function (e) {
            setDialState("idle");
            console.log('call failed with cause: ' + e);
        },
        'confirmed': function (e) {
            setDialState("confirmed");
            console.log('call confirmed');
        },
        'addstream': function (e) {
            console.log('remote stream added');
            var stream = e.stream;
            addStream(audio, stream);
        },
        'ended': function (e) {
            setDialState("idle");
            console.log('call ended with cause: ');
            console.log(e);
        }
    };

    var options = {
        eventHandlers: eventHandlers,
        mediaConstraints: {'audio': true, 'video': false}
    };*/

});