define(["react", "reactdom", "buttons"], function (React, ReactDom, Buttons) {

    return React.createClass({

        renderOutgoingWaitForAnswer: function() {
            return <div>
                <p>waiting for remote party to answer call</p>
                <Buttons.DialPadButton value="cancel" onPress={this.props.requestHangup}/>
            </div>
        },
        renderIncomingRinging: function() {
            return <div>
                <p>incoming call</p>
                <Buttons.DialPadButton value="answer" onPress={this.props.requestAccept}/>
                <Buttons.DialPadButton value="reject" onPress={this.props.requestReject}/>
            </div>
        },

        render: function() {

            var self = this;

            if (this.props.dialState === 'confirmed') {
                return <div>
                    <p>phonecall in progress</p>
                    <Buttons.DialPadButton value="hangup" onPress={self.props.requestHangup}/>
                </div>
            } else if (this.props.dialState === 'progress' || this.props.dialState === 'trying') {
                return self.renderOutgoingWaitForAnswer();
            } else if (this.props.dialState === 'incoming') {
                return self.renderIncomingRinging();
            } else if (this.props.dialState === 'idle') {
                return null;
            } else {
                console.log("unhandled dialstate: " + this.props.dialState);
                return null;
            }
        }
    });

});
