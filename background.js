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

        var setRegisterState = function (registerState) {
            globals["registerState"] = registerState;
            if (globals["registerStatePopupHandler"]) {
                globals["registerStatePopupHandler"](registerState);
            }
        };

        if (!configuration.uri || !configuration.password) {
            setRegisterState("failed");
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

                        reportIncomingCall((data.request.from + "").match(/sip:([0-9]+)@/)[1]);

                        var endEvents = ["ended", "failed", "removestream"];
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

        userAgent.on('unregistered', function (response) {
            setRegisterState("unregistered");
        });
        userAgent.on('registered', function (response, cause) {
            setRegisterState("registered");
        });
        userAgent.on('registrationFailed', function (response, cause) {
            setRegisterState("failed");
        });

        var addStream = function (audio, stream) {
            jssip.rtcninja.attachMediaStream(audio, stream);
        };

        var setDialState = function (dialState) {
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


        globals["call"] = function (url) {
            setDialState("trying");

            var eventHandlers = {
                'progress': function (e) {
                    setDialState("progress");
                    console.log('call is in progress');
                },
                'failed': function (e) {
                    setDialState("idle");
                    session = undefined;
                    console.log('call failed with: ' + e);
                    console.log('call failed with cause: ' + e.cause);
                },
                'confirmed': function (e) {
                    setDialState("confirmed");
                    console.log('call confirmed');
                    console.log(e);
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
                    if (e.cause === "RTP Timeout") {
                        console.log("rtp timeout, boooh! " + url + " " + configuration.uri);
                        askToReportErrors({
                            "user": configuration.uri,
                            "to": url,
                            "time": new Date().toGMTString(),
                            "cause": e.cause
                        });
                    }
                }
            };

            var options = {
                eventHandlers: eventHandlers,
                mediaConstraints: {'audio': true, 'video': false}
            };

            try {
                session = userAgent.call(url, options);
            } catch(err) {
                setDialState("idle");
                console.log(err);
            }
        };

        globals["hangup"] = function () {
            userAgent.terminateSessions();
        };

        var reject = globals["reject"] = function () {
            session.terminate();
        };

        var answer = globals["answer"] = function () {
            session.answer();
        };

        var reportIncomingCall = function (caller) {
            console.log("orignator: " + caller);
            setDialState("incoming");
            chrome.notifications.create("newcallnotification", {
                type: "basic",
                iconUrl: "icon.png",
                title: "incoming call",
                message: findContactByNumber(caller),
                buttons: [{title: "accept"}, {title: "reject"}],
                requireInteraction: true,

            })
        };


        var errors = [];

        var askToReportErrors = function (error) {

            errors.push(error);

            chrome.notifications.create("reporterrornotification", {
                type: "basic",
                iconUrl: "icon.png",
                title: "oops",
                message: "something went wrong with the last call. may i report call errors now? this helps to improve the service.",
                buttons: [{title: "yes"}, {title: "no"}],
                requireInteraction: true,

            })
        };

        var reportErrors = function () {
            console.log("about to report errors");
            console.log(errors);

            var errorFormUrl = "https://docs.google.com/a/sipgate.de/forms/d/1uAIVvTHP-G7XYUX0SQ4A6LCxZuZxvXQRUh4h0GMvAn8/formResponse";
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", errorFormUrl, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send("entry.988598802=" + JSON.stringify(errors));
            errors = [];
        };

        var notificationClickHandlers = {
            "newcallnotification": function (buttonIndex) {
                if (buttonIndex == 0) {
                    answer();
                } else {
                    reject();
                }
            },
            "reporterrornotification": function (buttonIndex) {
                if (buttonIndex == 0) {
                    reportErrors();
                }
                chrome.notifications.clear("reporterrornotification");
            }
        };

        chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {

            if (notificationClickHandlers[notificationId]) {
                notificationClickHandlers[notificationId](buttonIndex);
            }

        });
    });
});

var gapiAuthenticated = true;

var gapiAuthError = function() {
    gapiAuthenticated = false;
};

var gapiAuthSuccess = function() {
    gapiAuthenticated = true;
};

var gapiRequest = function (method, url, data, onSuccess, onError) {
    chrome.identity.getAuthToken({
        interactive: false
    }, function (token) {

        if (chrome.runtime.lastError) {
            console.log("cannot get authtoken: " + chrome.runtime.lastError.message);
            gapiAuthError();
            onError();
            return;
        }

        var x = new XMLHttpRequest();

        x.open(method, url);
        x.onload = function () {
            if (x.status == 200) {
                gapiAuthSuccess();
                onSuccess(x.response);
            } else {
                if (x.status == 401) {
                    console.log("access denied, token removed");
                    chrome.identity.removeCachedAuthToken({token: token});
                    gapiAuthError();
                } else {
                    gapiAuthSuccess();
                }
                onError();
            }
        };

        x.setRequestHeader('Authorization', "Bearer " + token);
        x.send();
    });

};

var findContactByNumber = function(number) {
    var strippedNumber = number.match(/^0+(.*)$/)[1];
    console.log("stripped number: " + strippedNumber);
    var filterContactByNumber = function(c) {
        if (c["gd$phoneNumber"]) {
            for (i = 0; i < c["gd$phoneNumber"].length; i++ ) {
                var cNumber = c["gd$phoneNumber"][i]["uri"].replace(/[^0-9]/g, "");
                if (cNumber.indexOf(strippedNumber) != -1) {
                    return true;
                }
            }
        }
        return false;
    };

    if (globals["contacts"]) {
        result = globals["contacts"].filter(filterContactByNumber);
        if (result.length > 0) {
            return result[0].title["$t"];
        } else {
            return number;
        }
    }
};

var getContacts = function () {
    gapiRequest("GET", 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000',
        [],
        function (result) {
            var response = JSON.parse(result);
            globals["contacts"] = response.feed.entry;
        },
        function () {
            console.log("unable to get contacts");
        }
    );
};

var pollContacts = function() {
    getContacts();
    setTimeout(pollContacts, 600000);
};

pollContacts();