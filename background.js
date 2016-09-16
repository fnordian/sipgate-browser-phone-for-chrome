requirejs.config({
    baseUrl: 'node_modules',
    paths: {
        jssip: "jssip/dist/jssip",
        react: "react/dist/react-with-addons.min",
        reactdom: "react-dom/dist/react-dom.min",
        langHelper: "../helper/lang",
        contactHelper: "../helper/contact",
        helper: "../helper/all",
    }
});

var globals = {
    dialState: "idle",
    callInfo: {}
};

chrome.storage.sync.get({
    ws_servers: "",
    uri: "",
    password: ""
}, function (configuration) {

    requirejs(['reactdom', 'jssip', 'helper'], function (reactdom, jssip, helper) {

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

        var setDialState = function (dialState, callInfo) {
            if (dialState === "idle") {
                session = undefined;
            }

            globals["dialState"] = dialState;
            globals["callInfo"] = helper.lang.mergeObjects(globals["callInfo"], callInfo);
            if (globals["dialStatePopupHandler"]) {
                try {
                    globals["dialStatePopupHandler"](dialState, globals["callInfo"]);
                } catch (err) {
                    console.log("error in dialStatePopupHandler: " + err);
                }
            }
            if (dialState != "incoming") {
                chrome.notifications.clear("newcallnotification");
            }

            var icon = dialState == "idle" ? "icon190.png" : "callIcon.gif";
            chrome.browserAction.setIcon({
                path: icon
            });

        };

        globals["userAgent"] = userAgent;
        globals["audio"] = audio;


        globals["call"] = function (url) {
            var urlToNumber = function(url) {
                var number = url.match(/:(.*)@/)[1];
                console.log("matched number: " + number);
                return number;
            };

            if (globals["dialState"] !== "idle") {
                console.log("call already in progress");
                return;
            }

            var contact = helper.contact.findContactByNumber(globals["contacts"], urlToNumber(url));
            setDialState("trying", {remote: url, remoteContact: contact});

            var eventHandlers = {
                'progress': function (e) {
                    setDialState("progress");
                    console.log('call is in progress');
                },
                'failed': function (e) {
                    setDialState("idle");
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
            } catch (err) {
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
            var contact = helper.contact.findContactByNumber(globals["contacts"], caller);
            setDialState("incoming", {remote: caller, remoteContact: contact});
            chrome.notifications.create("newcallnotification", {
                type: "basic",
                iconUrl: contact.photoLink ? contact.photoLink : "icon.png",
                title: "incoming call",
                message: contact.title["$t"],
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


        var checkForSuspend = function (lastCheckTime) {
            var checkForSuspendInterval = 10000;
            var now = Date.now();
            var restartUA = function() {
                console.log("restart ua");
                userAgent.stop();
                userAgent.start();
            };

            try {
                if (now - lastCheckTime > checkForSuspendInterval + 100) {
                    console.log("suspend heuristic triggered");
                    restartUA();
                } else if (!userAgent.isRegistered()) {
                    console.log("ua not connected. retrying...");
                    restartUA();
                }
            } catch (err) {
                console.log("error checking ua status: " + err);
            }



            setTimeout(function() {
                checkForSuspend(now)
            }, checkForSuspendInterval);
        };
        checkForSuspend(Date.now());

    });
});

var gapiAuthenticated = true;

var gapiAuthError = function () {
    gapiAuthenticated = false;
};

var gapiAuthSuccess = function () {
    if (!gapiAuthenticated) {
        setTimeout(getContacts, 2000);
    }
    gapiAuthenticated = true;
};

var gapiRequest = function (method, url, data, onSuccess, onError, interactive) {
    interactive = typeof interactive !== 'undefined' ? interactive : false;
    var isAuthRetry = false;

    var doRequest = function () {

        chrome.identity.getAuthToken({
            interactive: interactive
        }, function (token) {

            console.log("is retry: " + isAuthRetry);

            if (chrome.runtime.lastError && (isAuthRetry || !interactive)) {
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
                    onSuccess(x.response, token);
                } else {
                    if (x.status == 401) {
                        if (!isAuthRetry) {
                            console.log("access denied, token removed " + token);
                            isAuthRetry = true;
                            interactive = false;
                            if (token) {
                                chrome.identity.removeCachedAuthToken({token: token}, doRequest);
                            } else {
                                doRequest();
                            }
                            return;
                        } else {
                            gapiAuthError();
                        }
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
    return doRequest();
};



var getContacts = function () {
    var enrichContactPhoto = function (contact, token) {
        if (contact.link && contact.link.length > 3) {
            photolink = contact.link[0].href + "?access_token=" + token;
        } else {
            photolink = "defaultavatar.png";
        }
        contact.photoLink = photolink;

        return contact;
    };

    gapiRequest("GET", 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=1000',
        [],
        function (result, token) {
            var response = JSON.parse(result);
            globals["contacts"] = response.feed.entry.map(function (c) {
                return enrichContactPhoto(c, token)
            });
        },
        function () {
            console.log("unable to get contacts");
        }
    );
};

var pollContacts = function () {
    getContacts();
    setTimeout(pollContacts, 600000);
};


pollContacts();


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (sender.tab) {
            // from content-script
        }


        console.log("message received: " + request);
        console.log(request);

        if (request.dialNumber) {

            globals["call"]("sip:" + request.dialNumber + "@sipgate.de");
        } else if (request.request === "requestGoogleAuthorization") {
            var response = function (autherror) {
                console.log("sending response " + autherror);
                sendResponse({autherror: autherror});
            };
            gapiRequest("GET", "https://www.google.com/m8/feeds/contacts", [],
                function () {
                    response(false)
                },
                function () {
                    response(!gapiAuthenticated)
                },
                request.interactive);
        } else {
            console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
                "from the extension");
        }

        return true;
    });

var showCallPopUp = function() {
    chrome.windows.create({
        url: "callpopup.html",
//        left: -1,
//        top: -400,
        width: 400,
        height: 200,
        type: "panel"
    });
};

//showCallPopUp();