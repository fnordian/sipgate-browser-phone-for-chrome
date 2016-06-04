requirejs.config({
    baseUrl: 'node_modules',
    paths: {
        jssip: "jssip/dist/jssip",
        react: "react/dist/react-with-addons.min",
        reactdom: "react-dom/dist/react-dom.min",
    }
});

var globals = {
    dialState: "idle"
};

chrome.storage.sync.get({
    ws_servers: "",
    uri: "",
    password: ""
}, function (configuration) {

    requirejs(['reactdom', 'jssip', 'react'], function (reactdom, jssip) {

        jssip.debug.enable('*');

        if (!configuration.uri || !configuration.password) {
            return;
        }

        var userAgent = new jssip.UA({
            uri: configuration.uri,
            password: configuration.password,
            ws_servers: configuration.ws_servers
        });

        var session;

        userAgent.start();

        var audio = document.getElementById('webrtc_audio');

        userAgent.on('newRTCSession', function (data) {
                var newSession = data.session;


                if (newSession.direction === "incoming") {
                    console.log('incoming!!!!');

                    if (session === undefined) {
                        //dialer.setDialState("incoming");
                        session = newSession;

                        reportIncomingCall();

                        var endEvents = ["ended", "failed", "removestream"]
                        for (var i in endEvents) {
                            newSession.on(endEvents[i], function () {
                                setDialState("idle");
                                session = undefined;
                            });
                        }

                        newSession.on("confirmed", function () {
                            setDialState("confirmed");
                        });

                        newSession.on('addstream', function (e) {
                            var stream = e.stream;
                            addStream(audio, stream);
                        });

                    } else {
                        newSession.terminate();
                    }
                }
            }
        );

        var addStream = function(audio, stream) {
            jssip.rtcninja.attachMediaStream(audio, stream);
        };

        var setDialState = function(dialState) {
            globals["dialState"] = dialState;
            if (globals["dialStatePopupHandler"]) {
                globals["dialStatePopupHandler"](dialState);
            }
            if (dialState != "incoming") {
                chrome.notifications.clear("newcallnotification");
            }
        };

        globals["userAgent"] = userAgent;
        globals["audio"] = audio;


        globals["call"] = function(url) {
            setDialState("trying");

            var eventHandlers = {
                'progress': function (e) {
                    setDialState("progress");
                    console.log('call is in progress');
                },
                'failed': function (e) {
                    setDialState("idle");
                    session = undefined;
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
                    session = undefined;
                    console.log('call ended with cause: ');
                    console.log(e);
                }
            };

            var options = {
                eventHandlers: eventHandlers,
                mediaConstraints: {'audio': true, 'video': false}
            };

            session = userAgent.call(url, options);
        };

        globals["hangup"] = function() {
            userAgent.terminateSessions();
        };

        var reject = globals["reject"] = function() {
            session.terminate();
        };

        var answer = globals["answer"] = function() {
            session.answer();
        };

        var reportIncomingCall = function() {
            setDialState("incoming");
            chrome.notifications.create("newcallnotification", {
                type: "basic",
                iconUrl: "icon.png",
                title: "incoming call",
                message: "there is an incoming call",
                buttons: [{title:"accept"}, {title:"reject"}],
                requireInteraction: true,

            })
        };

        chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
            if (notificationId == "newcallnotification") {
                if (buttonIndex == 0) {
                    answer();
                } else {
                    reject();
                }
            }
        });
    });
});

