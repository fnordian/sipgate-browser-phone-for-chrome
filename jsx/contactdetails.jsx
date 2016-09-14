define(["react", "reactdom", "contact", "buttons"], function (React, ReactDom, Contact, Buttons) {

    return React.createClass({
        renderPhoneNumbers: function (contactNumbers) {

            var self = this;

            return contactNumbers !== undefined && contactNumbers.length > 0
                ?
                contactNumbers.map(function (contactNumber) {
                    if (contactNumber["uri"]) {
                        var number = "00" + contactNumber["uri"].replace(/[^0-9]/g, "");
                        return <Buttons.SmallPhonenumberButton onPress={self.props.onDial} number={number}/>
                    } else if (contactNumber["$t"]) {
                        var number = contactNumber["$t"];
                        return <Buttons.SmallPhonenumberButton onPress={self.props.onDial} number={number}/>
                    } else {
                        return null;
                    }
                })
                : <p></p>;
        },


        render: function () {
            var contactTitle = this.props.contact.title["$t"];
            var contactPhotoLink = this.props.contact.photoLink;

            return <div className="card">
                <div className="card-image waves-effect waves-block waves-light">
                    <div>
                        <div style={{
                            height: '200px',
                            top:0,
                            background: "url('" + contactPhotoLink + "') no-repeat center center fixed",
                            WebkitBackgroundSize: 'cover',
                            MozBackgroundSize: 'cover',
                            OBackgroundSize: 'cover',
                            backgroundSize: 'cover',

                        }}>
                            <div style={{
                                height: '200px',
                                top:0,
                                background: 'rgba(0, 0, 0, 0.74)',


                            }} className="card-image">
                                <span className="card-title">{contactTitle}</span>
                            </div>
                        </div>

                    </div>
                    <div className="card-content">

                        {this.renderPhoneNumbers(this.props.contact["gd$phoneNumber"])}

                    </div>
                </div>
            </div>
        }
    });
});
