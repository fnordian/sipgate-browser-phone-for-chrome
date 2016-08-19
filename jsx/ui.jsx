define(["react"], function (React) {

    var self;

    var NumberInputField = React.createClass({
        render: function () {
            return <input type="text" ref={ (ref) => { this._input = ref; } } id="numberinput" value={this.props.number}
                          onKeyPress={this.props.onKeyPress}
                          onKeyDown={this.props.onKeyDown}/>;
        },
        componentDidMount: function () {
            var input = this._input;
            input.focus();
            input.onblur = function () {
                input.focus();
            };
        }
    });

    var DialPadButton = React.createClass({
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

            return <a style={ {width:'100%'} } href="#" className="btn waves-effect waves-light"
                      onClick={ () => this.handleClick() }>{text}</a>
        }
    });

    var Error = React.createClass({
        render: function () {
            return (
                <div>
                    <span style={ {weight: 'bold'} }>{ this.props.message }</span>
                    <br />
                    <a target="_blank" href={ chrome.extension.getURL('/options.html')}>Change settings here</a>
                </div>
            );
        }
    });

    var DialPad = React.createClass({

        getInitialState: function () {
            return {number: ''};
        },

        setNumber: function(number) {
            this.setState({number: number})
        },
        addDigit: function (digit) {
            this.setState({number: this.state.number + digit})
        },
        removeDigit: function () {
            this.setState({number: this.state.number.substr(0, this.state.number.length - 1)})
        },
        clearNumber: function () {
            this.setState({number: ""})
        },
        handleKeyDown: function (ev) {
            var charCode = ev.keyCode;
            switch (charCode) {
                case 8:
                    this.removeDigit();
                    break;
            }
        },
        handleKeyPress: function (ev) {
            var charCode = ('charCode' in ev) ? ev.charCode : ev.keyCode;
            switch (charCode) {
                case 35:
                case 42:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                    this.addDigit(String.fromCharCode(charCode));
                    break;
                case 13:
                    this.doDial();
            }
        },

        doDial: function () {
            this.props.onDial(this.state.number);
        },

        render: function () {

            var actionButton;
            var actionButton2;


            switch (this.props.dialState) {
                case 'idle':
                    actionButton = <DialPadButton
                        onPress={ () => this.doDial() } value="dial"/>;
                    break;
                case 'trying':
                case 'progress':
                case 'confirmed':
                    actionButton = <DialPadButton
                        onPress={ () => this.props.onHangup() } value="hangup"/>;
                    break;
                case 'incoming':
                    actionButton = <DialPadButton
                        onPress={ () => this.props.onAccept() } value="accept"/>;
                    break;
                default:
                    actionButton = <DialPadButton onPress={ () => {
                } } value="?"/>
            }

            switch (this.props.dialState) {
                case 'incoming':
                    actionButton2 = <DialPadButton onPress={ () => this.props.onReject() } value="reject"/>
                    break;
                default:
                    actionButton2 = <DialPadButton onPress={ this.clearNumber } value="clear"/>
            }

            return (
                <div className="container">
                    <div className="row">
                        <div className="col s12"><NumberInputField number={this.state.number}
                                                                   onKeyPress={ this.handleKeyPress }
                                                                   onKeyDown={ this.handleKeyDown}
                        /></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="1"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="2"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="3"/></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="4"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="5"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="6"/></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="7"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="8"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="9"/></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="*"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="0"/></div>
                        <div className="col s4"><DialPadButton onPress={ this.addDigit } value="#"/></div>
                    </div>
                    <div className="row">
                        <div className="col s6">{ actionButton }</div>
                        <div className="col s6">{ actionButton2 }</div>
                    </div>
                </div>
            )
        }
    });


    var Dialer = React.createClass({
            self: this,
            handlers: {},
            getInitialState: function () {
                return {dialState: 'idle', registerState: 'unregistered', contacts: []};
            },
            setHandler: function (eventName, func) {
                this["handlers"][eventName] = func;
            },
            setDialState: function (dialState) {
                this.setState({dialState: dialState})
            },
            setRegisterState: function (registerState) {
                this.setState({registerState: registerState})
            },
            setContacts: function (contacts) {
                this.setState({contacts: contacts});
            },
            render: function () {
                var self = this;
                var dialpad =
                        <DialPad
                            onDial={ (number) => self["handlers"]["onDial"](number) }
                            onAccept={ (number) => self["handlers"]["onAccept"]() }
                            onHangup={ () => self["handlers"]["onHangup"]() }
                            onReject={ () => self["handlers"]["onReject"]() }
                            dialState={this.state.dialState}
                            ref="dialpad"
                        />
                    ;

                var selectNumber = function(number) {
                    return self.refs["dialpad"].setNumber(number);
                };

                var contacts = <Contacts contacts={this.state.contacts} selectNumber={selectNumber}/>;

                this["dialpad"] = dialpad;
                this["contacts"] = contacts;

                return this.state.registerState != "failed"
                    ? (
                    <div>
                        { dialpad }
                        <br />
                        { contacts }
                    </div>
                )
                    : (
                    <div>
                        <Error message="Cannot connect to sipgate. Check your settings."/>
                    </div>
                )
            }
        })
        ;

    var Contacts = React.createClass({
        self: this,
        handlers: {},

        render: function () {

            var self = this;
            return <div>
                {self.props.contacts.filter(function(c) { return('gd$phoneNumber' in c) }).map(function (c) {
                    console.log(c);
                    var number = "00" + c["gd$phoneNumber"][0]["uri"].replace(/[^0-9]/g, "");

                    return <DialPadButton text={c.title["$t"]} value={number} onPress={self.props.selectNumber} />
                })}
            </div>
        }
    });

    self =
        <Dialer />
    ;
    return self;
});
