define(["react", "reactdom", "contact", "buttons"], function (React, ReactDom, Contact, Buttons) {

    var self;

    var CallStatus = React.createClass({
        getInitialState: function () {
            return {callstate: {mode: 'idle', startTime: 0, endTime: 0, contact: undefined}};
        },

        initiateCall: function(contact) {
            this.setState({callstate: {mode: 'initializing', startTime: 0, endTime: 0, contact: contact}});
        },
        establishCall: function(startTime, contact) {
            this.setState({callstate: {mode: 'established', startTime: startTime, endTime: 0, contact: contact}});
        },
        endCall: function(startTime, endTime, contact) {
            this.setState({callstate: {mode: 'idle', startTime: startTime, endTime: endTime, contact: contact}});
        },

        callDuration: function () {
            return this.state.callstate.mode === "established"
                ? new Date().getTime() - this.state.callstate.startTime
                : this.state.callstate.endTime
        },


        render: function () {
            return <p>callstate: {this.state.callstate.mode}, duration: {this.callDuration()}</p>
        }
    });

    var CallPopUp = React.createClass({
        render: function () {

            var contact = { title:"test", "gd$phoneNumber": [ {uri: "tel:49-163-123456"}, {uri: "tel:49-211-3020330"}]};

            return <div className="row">
                <div className="col s12">
                    <ul className="collection"><Contact contact={contact} /></ul>
                    <CallStatus/>
                    <Buttons.DialPadButton value="hangup"/>
                </div>
            </div>
        }
    });

    self =
        <CallPopUp />
    ;
    return self;
});
