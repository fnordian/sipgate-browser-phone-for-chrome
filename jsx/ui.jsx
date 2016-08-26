define(["react", "reactdom"], function (React, ReactDom) {

    var self;

    var NumberInputField = React.createClass({
        render: function () {
            return <input type="text" ref={ (ref) => {
                this._input = ref;
            } } id="numberinput" value={this.props.number}
                          onKeyPress={this.props.onKeyPress}
                          onKeyDown={this.props.onKeyDown}/>;
        },
        componentDidMount: function () {
            var input = this._input;
            input.focus();
            input.onblur = function (event) {
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

            return <a style={ {width: '100%'} } href="#" className="btn waves-effect waves-light"
                      onClick={ (event) => {
                          event.stopPropagation();
                          this.handleClick()
                      } }>{text}</a>
        }
    });

    var Contact = React.createClass({
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

            return <li className="collection-item avatar">
                <img src={this.props.img} alt="" className="circle"/>
                <span className="title">{text}</span>
                <p onClick={ (event) => {
                          event.stopPropagation();
                          this.handleClick()
                      } }>{this.props.value}</p>
            </li>
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

        setNumber: function (number) {
            this.setState({number: number});
            if (this.props.onNumberUpdate) {
                this.props.onNumberUpdate(number);
            }
        },
        addDigit: function (digit) {
            var newNumber = this.state.number + digit;
            this.setNumber(newNumber);

        },
        removeDigit: function () {
            var newNumber = this.state.number.substr(0, this.state.number.length - 1);
            this.setNumber(newNumber);
        },
        clearNumber: function () {
            this.setNumber("")
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
                case 13:
                    this.doDial();
                    break;
                default:
                    var char = String.fromCharCode(charCode);
                    if (char !== "")
                        this.addDigit(char);
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

            var numberButtons = (
                <div>
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
                </div>
            );

            statusText = this.props.dialState === "idle" || !this.props.callInfo
                ? "type number or name to call"
                : "call with " + this.props.callInfo.remote;

            return (
                <div className="container">
                    <div className="row">
                        <div className="col s12"><NumberInputField number={this.state.number}
                                                                   onKeyPress={ this.handleKeyPress }
                                                                   onKeyDown={ this.handleKeyDown}
                        />
                            <p>{statusText}</p>
                        </div>
                    </div>


                    { isNaN(this.state.number) ? null : numberButtons }
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
                return {dialState: 'idle', callInfo: {}, registerState: 'unregistered', contacts: []};
            },
            setHandler: function (eventName, func) {
                this["handlers"][eventName] = func;
            },
            setDialState: function (dialState, callInfo = {}) {
                if (Object.keys(callInfo).length > 0) {
                    this.setState({dialState: dialState, callInfo: callInfo});
                } else {
                    this.setState({dialState: dialState});
                }
            },
            setRegisterState: function (registerState) {
                this.setState({registerState: registerState})
            },
            setContacts: function (contacts) {
                this.setState({contacts: contacts});
            },
            setContactFilter: function (filterString) {
                this.refs["contacts"].setContactFilter(filterString);
            },
            componentDidMount: function () {
                var self = this;
                self.mouseup = 0;
                const addEvent = ReactDom.findDOMNode(self.refs["main"]).addEventListener || node.attachEvent;
                addEvent("mousedown", function (e) {
                    self.mouseup--;
                    e.preventDefault();
                }, false);
                addEvent("mouseup", function () {
                    self.mouseup++;
                }, false);
            },
            render: function () {
                var self = this;
                var dialpad =
                        <DialPad
                            onDial={ (number) => self["handlers"]["onDial"](number) }
                            onAccept={ (number) => self["handlers"]["onAccept"]() }
                            onHangup={ () => self["handlers"]["onHangup"]() }
                            onReject={ () => self["handlers"]["onReject"]() }
                            onNumberUpdate={ self.setContactFilter }
                            dialState={this.state.dialState}
                            callInfo={this.state.callInfo}
                            ref="dialpad"
                        />
                    ;

                var selectNumber = function (number) {
                    return self.refs["dialpad"].setNumber(number);
                };

                var contacts = <Contacts ref="contacts" contacts={this.state.contacts} selectNumber={selectNumber}/>;

                this["dialpad"] = dialpad;
                this["contacts"] = contacts;

                return this.state.registerState != "failed"
                    ? (
                    <div ref="main">
                        { dialpad }
                        <br />
                        { contacts }
                    </div>
                )
                    : (
                    <div ref="main">
                        <Error message="Cannot connect to sipgate. Check your settings."/>
                    </div>
                );
            }
        })
        ;

    var Contacts = React.createClass({
        self: this,
        handlers: {},

        getInitialState: function () {
            return {filterString: ""};
        },
        setContactFilter: function (filterString) {
            this.setState({filterString: filterString});
        },
        contactFilter: function (contact) {
            return (contact.title["$t"] !== undefined
                && contact.title["$t"].toLowerCase().indexOf(this.state.filterString.toLowerCase()) != -1
            );
        },

        render: function () {

            var self = this;
            return <div><ul className="collection">
                {
                    (self.state.filterString !== "" && self.props.contacts !== undefined) ?
                        self.props.contacts
                            .filter(function (c) {
                                return ('gd$phoneNumber' in c) && (c["gd$phoneNumber"][0]["uri"] !== undefined)
                            })
                            .filter(self.contactFilter)
                            .slice(0, 5)
                            .map(function (c) {
                                console.log(c);

                                var number = "00" + c["gd$phoneNumber"][0]["uri"].replace(/[^0-9]/g, "");

                                return <Contact img={c.photoLink} text={c.title["$t"]} value={number}
                                                onPress={self.props.selectNumber}/>
                            })
                        : null
                }
            </ul></div>
        }
    });

    self =
        <Dialer />
    ;
    return self;
});
