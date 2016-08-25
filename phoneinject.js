window.SipgateApiClient.initiateClickToDial = function (phonelineId, caller, callee) {

    callee = "00" + callee;
    console.log("requesting call to" + callee);

    var event = new CustomEvent('sipgateCallEvent', {'detail': callee});
    event.initEvent('sipgateCallEvent', true, true);

    document.getElementsByTagName("body")[0].dispatchEvent(event);

    return {
        then: function () {
        }
    };
};
