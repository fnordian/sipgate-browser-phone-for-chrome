define(["react", "reactdom", "contact", "buttons"], function (React, ReactDom, Contact, Buttons) {

    var ContactNotes = React.createClass({
        render: function () {

            var text = this.props.value
                ? this.props.value["$t"]
                : "";
            return <div className="row">
                <div className="col s12">
                    <h5>Notes</h5>
                </div>
                <div className="input-field col s11 offset-s1">
                    <textarea id="contactNotes" className="materialize-textarea" tabIndex="0">{text}</textarea>

                </div>
            </div>

        }
    });

    return React.createClass({
        renderPhoneNumbers: function (contactNumbers) {

            var self = this;

            var numbers = contactNumbers !== undefined && contactNumbers.length > 0
                ?
                contactNumbers.map(function (contactNumber) {
                    if (contactNumber["uri"]) {
                        var number = "00" + contactNumber["uri"].replace(/[^0-9]/g, "");
                        return <Buttons.BigPhonenumberButton onPress={self.props.onDial} number={number}/>
                    } else if (contactNumber["$t"]) {
                        var number = contactNumber["$t"];
                        return <Buttons.BigPhonenumberButton onPress={self.props.onDial} number={number}/>
                    } else {
                        return null;
                    }
                })
                : <p></p>;

            return <div id="numbers" className="row">
                    <div className="col s12">
                        <h5>Phone</h5>
                    </div>
                <div className="col s11 offset-s1">
                { numbers }
                </div>
            </div>;
        },

        renderEmailAddresses: function (contactEmailAddresses) {

            var self = this;

            var emailAddresses = contactEmailAddresses !== undefined && contactEmailAddresses.length > 0
                ?
                contactEmailAddresses.filter(function(emailAddress) {
                    console.log(emailAddress["address"]);
                    console.log(emailAddress["address"] && emailAddress["address"] !== "");
                    return emailAddress["address"] && emailAddress["address"] !== "";
                }).map(function (emailAddress) {
                        return <Buttons.BigMailAddressButton address={emailAddress["address"]}/>
                })
                : <p></p>;

            return <div id="emailAddresses" className="row">
                <div className="col s12">
                    <h5>Email</h5>
                </div>
                <div className="col s11 offset-s1">
                    { emailAddresses }
                </div>
            </div>;
        },

        render: function () {
            var contactTitle = this.props.contact.title["$t"];
            var contactPhotoLink = this.props.contact.photoLink;

            console.log(this.props.contact);

            return <div className="card">
                <div className="card-image waves-effect waves-block waves-light">
                    <div>
                        <div style={{
                            height: '200px',
                            top: 0,
                            background: "url('" + contactPhotoLink + "') no-repeat center center fixed",
                            WebkitBackgroundSize: 'cover',
                            MozBackgroundSize: 'cover',
                            OBackgroundSize: 'cover',
                            backgroundSize: 'cover',

                        }}>
                            <div style={{
                                height: '200px',
                                top: 0,
                                background: 'rgba(0, 0, 0, 0.74)',


                            }} className="card-image z-depth-3">
                                <span className="card-title" tabIndex="1">{contactTitle}</span>
                            </div>
                        </div>

                    </div>
                    <div className="card-content">

                        {this.renderPhoneNumbers(this.props.contact["gd$phoneNumber"])}
                        {this.renderEmailAddresses(this.props.contact["gd$email"])}

                        <ContactNotes value={this.props.contact["content"]}/>

                    </div>
                </div>
            </div>
        }
    });
});
