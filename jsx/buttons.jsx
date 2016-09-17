define(["react", "reactdom"], function (React, ReactDom) {

    return {

        DialPadButton: React.createClass({
            handleClick: function () {
                this.props.onPress(this.props.value);
            },
            render: function () {
                var text;
                if (this.props.text === undefined) {
                    text = this.props.value;
                } else {
                    text = this.props.text;
                }

                return <a style={ {width: '100%'} } href="#" className="btn waves-effect waves-light"
                          onClick={ (event) => {
                              event.stopPropagation();
                              this.handleClick()
                          } }>{text}</a>
            }
        }),

        SmallPhonenumberButton: React.createClass({
            handleClick: function () {
                this.props.onPress(this.props.number);
            },
            render: function () {
                var self = this;

                return <div
                          onClick={ (event) => {
                              event.stopPropagation();
                              self.handleClick()
                          } }>
                    &#9990; {this.props.number}</div>
            }
        }),

        BigPhonenumberButton: React.createClass({
            handleClick: function () {
                this.props.onPress(this.props.number);
            },
            render: function () {
                var self = this;

                return <div
                    onClick={ (event) => {
                        event.stopPropagation();
                        self.handleClick()
                    } }>
                    &#9990; {this.props.number}</div>
            }
        }),

        BigMailAddressButton: React.createClass({
            handleClick: function () {
                this.props.onPress(this.props.address);
            },
            render: function () {
                var self = this;

                return <div
                          onClick={ (event) => {
                              event.stopPropagation();
                              self.handleClick()
                          } }>
                    &#9993; {this.props.address}</div>
            }
        })



    };

});