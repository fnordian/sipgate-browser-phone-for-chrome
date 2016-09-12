define(["react", "reactdom", "contact", "buttons", "contactdetails", "phonestatebar"], function (React, ReactDom, Contact, Buttons, ContactDetails, PhonestateBar) {

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

    var BreadCrumps = React.createClass({
        render: function () {
            try {
                var self = this;

                var navElements = this.props.viewStack.map(function (viewElement) {
                    return <a href="#!" onClick={() => self.props.onNavigate(viewElement[0])}
                              className="breadcrumb">{viewElement[1]}</a>
                });

                return <nav>
                    <div className="nav-wrapper">
                        <div className="row">
                            <div className="col s12">
                                {navElements}
                            </div>
                        </div>
                    </div>
                </nav>
            } catch (err) {
                console.log("unable to render breadcrump: " + err);
                return null;
            }
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


        setNumber: function (number) {
            this.setState({number: number});
            if (this.props.onNumberUpdate) {
                this.props.onNumberUpdate(number);
            }
        },
        addDigit: function (digit) {
            var newNumber = this.props.number + digit;
            this.setNumber(newNumber);

        },
        removeDigit: function () {
            var newNumber = this.props.number.substr(0, this.props.number.length - 1);
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
            this.props.onDial(this.props.number);
        },

        render: function () {
            try {
                return this.renderUnsafe();
            } catch (err) {
                console.log("unable to render dialpad: " + err);
                return null;
            }
        },

        renderUnsafe: function () {

            var actionButton;
            var actionButton2;


            switch (this.props.dialState) {
                case 'idle':
                    actionButton = <Buttons.DialPadButton
                        onPress={ () => this.doDial() } value="dial"/>;
                    break;
                case 'trying':
                case 'progress':
                case 'confirmed':
                    actionButton = <Buttons.DialPadButton
                        onPress={ () => this.props.onHangup() } value="hangup"/>;
                    break;
                case 'incoming':
                    actionButton = <Buttons.DialPadButton
                        onPress={ () => this.props.onAccept() } value="accept"/>;
                    break;
                default:
                    actionButton = <Buttons.DialPadButton onPress={ () => {
                    } } value="?"/>
            }

            switch (this.props.dialState) {
                case 'incoming':
                    actionButton2 = <Buttons.DialPadButton onPress={ () => this.props.onReject() } value="reject"/>
                    break;
                default:
                    actionButton2 = <Buttons.DialPadButton onPress={ this.clearNumber } value="clear"/>
            }

            var numberButtons = (
                <div>
                    <div className="row">
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="1"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="2"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="3"/></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="4"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="5"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="6"/></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="7"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="8"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="9"/></div>
                    </div>
                    <div className="row">
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="*"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="0"/></div>
                        <div className="col s4"><Buttons.DialPadButton onPress={ this.addDigit } value="#"/></div>
                    </div>
                </div>
            );

            statusText = this.props.dialState === "idle" || !this.props.callInfo
                ? "type number or name to call"
                : "call with " + this.props.callInfo.remote;

            var numberActionButtons = <div className="row">
                <div className="col s6">{ actionButton }</div>
                <div className="col s6">{ actionButton2 }</div>
            </div>;

            return (
                <div className="container">
                    <div className="row">
                        <div className="col s12"><NumberInputField number={this.props.number}
                                                                   onKeyPress={ this.handleKeyPress }
                                                                   onKeyDown={ this.handleKeyDown}
                        />
                            <p>{statusText}</p>
                        </div>
                    </div>

                </div>
            )
        }
    });


    var Dialer = React.createClass({
            self: this,
            handlers: {},
            getInitialState: function () {
                return {
                    dialState: 'idle',
                    callInfo: {},
                    registerState: 'unregistered',
                    contacts: [],
                    selectedContact: null,
                    contactFilter: ""
                };
            },
            setHandler: function (eventName, func) {
                this["handlers"][eventName] = func;
            },
            setDialState: function (dialState, callInfo = {}) {
                console.log("setDialState: " + dialState);
                try {
                    if (Object.keys(callInfo).length > 0) {
                        this.setState({dialState: dialState, callInfo: callInfo});
                        if (callInfo.remoteContact) {
                            this.setState({callInfoContact: callInfo.remoteContact});
                        }
                        if (dialState !== "idle" && this.state.callInfoContact && !this.state.selectedContact) {
                            this.selectContact(this.state.callInfoContact);
                        }
                    } else {
                        this.setState({dialState: dialState});
                    }
                } catch (err) {
                    console.log("error setting state: " + err);
                }
            },
            setRegisterState: function (registerState) {
                this.setState({registerState: registerState})
            },
            setContacts: function (contacts) {
                this.setState({contacts: contacts});
            },
            setContactFilter: function (filterString) {
                this.setState({contactFilter: filterString});
                this.refs["contacts"].setContactFilter(filterString);
            },
            selectContact: function (contact) {
                this.setState({selectedContact: contact});
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

            navigateTo: function (viewElementName) {
                if (viewElementName === "contacts") {
                    this.selectContact(null);
                }
            },

            render: function () {

                try {

                    var self = this;

                    var view = this.state.selectedContact
                        ? [
                        [["contacts", "Contacts"], ["selectedContact", this.state.selectedContact.title["$t"]]],
                        <ContactDetails contact={this.state.selectedContact} onDial={self["handlers"]["onDial"]}/>]
                        : [
                        [["contacts", "Contacts"]],
                        this.renderDialpad()];

                    var nav = <BreadCrumps viewStack={view[0]}
                                           onNavigate={(viewElementName) => self.navigateTo(viewElementName)}/>;
                    var phonestatebar = <PhonestateBar dialState={self.state.dialState}
                                                       requestHangup={self["handlers"]["onHangup"]}
                                                       requestAccept={self["handlers"]["onAccept"]}
                                                       requestReject={self["handlers"]["onReject"]}
                    />;

                    return <div>
                        {nav}
                        {phonestatebar}
                        {view[1]}
                    </div>
                } catch (err) {
                    console.log("error rendering dialer: " + err);
                }
            },

            renderDialpad: function () {
                var self = this;
                var dialpad =
                        <DialPad
                            onDial={ (number) => self["handlers"]["onDial"](number) }
                            onAccept={ (number) => self["handlers"]["onAccept"]() }
                            onHangup={ () => self["handlers"]["onHangup"]() }
                            onReject={ () => self["handlers"]["onReject"]() }
                            onNumberUpdate={ self.setContactFilter }
                            dialState={this.state.dialState}
                            number={this.state.contactFilter}
                            callInfo={this.state.callInfo}
                            ref="dialpad"
                        />
                    ;

                console.log("filter: " + this.state.contactFilter);


                var selectNumber = function (number) {
                    return self.refs["dialpad"].setNumber(number);
                };

                var contacts = <Contacts
                    ref="contacts"
                    contacts={this.state.contacts}
                    selectNumber={selectNumber}
                    onSelectContact={this.selectContact}
                    initialFilter={this.state.contactFilter}
                    onDial={self["handlers"]["onDial"]}
                />;

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
            return {filterString: this.props.initialFilter};
        },
        setContactFilter: function (filterString) {
            this.setState({filterString: filterString});
        },
        getContactFilter: function () {
            return this.state.filterString;
        },
        contactFilter: function (contact) {
            return (contact.title["$t"] !== undefined
                && contact.title["$t"].toLowerCase().indexOf(this.state.filterString.toLowerCase()) != -1
            );
        },

        render: function () {

            var self = this;
            return <div>
                <ul className="collection">
                    {
                        (self.state.filterString !== "" && self.props.contacts !== undefined) ?
                            self.props.contacts
                                .filter(self.contactFilter)
                                .slice(0, 5)
                                .map(function (c) {
                                    return <Contact contact={c} onClick={self.props.onSelectContact}
                                                    onDial={self.props.onDial}/>
                                })
                            : null
                    }
                </ul>
            </div>
        }
    });

    self =
        <Dialer />
    ;
    return self;
});
