define(["react", "reactdom", "buttons"], function (React, ReactDom, Buttons) {


    return React.createClass({

        handleDial: function (number) {
            this.props.onDial(number);
        },

        handleClick: function () {
            this.props.onClick(this.props.contact);
        },

        renderPhoneNumbers: function (contactNumbers) {
            var self = this;

            return contactNumbers !== undefined && contactNumbers.length > 0
                ?
                contactNumbers.map(function (contactNumber) {
                    if (contactNumber["uri"]) {
                        var number = "00" + contactNumber["uri"].replace(/[^0-9]/g, "");
                        return <Buttons.SmallPhonenumberButton onPress={self.handleDial} number={number}/>
                    } else if (contactNumber["$t"]) {
                        var number = contactNumber["$t"];
                        return <Buttons.SmallPhonenumberButton onPress={self.handleDial} number={number}/>
                    } else {
                        return null;
                    }
                })
                : <p>no phonenumbers</p>;
        },

        render: function () {
            try {
                return this.renderUnsafe();
            } catch (err) {
                console.error("unable to render contact: " + err);
            }
        },

        renderUnsafe: function () {
            var title = this.props.contact.title["$t"];

            var img = this.props.contact.photoLink !== undefined ? this.props.contact.photoLink : "defaultavatar.png";

            return <li className="collection-item avatar" onClick={ (event) => {
                event.stopPropagation();
                this.handleClick()
            } }>
                <img src={img} alt="" className="circle"/>
                <span className="title">{title}</span>
                <p>
                    {this.renderPhoneNumbers(this.props.contact["gd$phoneNumber"])}
                </p>

            </li>
        },

    });
});