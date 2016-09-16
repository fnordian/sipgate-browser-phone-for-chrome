define([], function () {

    return {
        contactNumbers: function (contact) {

            var contactNumbers = contact["gd$phoneNumber"];


            return contactNumbers
                ?
                contactNumbers.map(function (contactNumber) {
                    if (contactNumber["uri"] !== undefined) {
                        return "00" + contactNumber["uri"].replace(/[^0-9]/g, "");
                    } else if (contactNumber["$t"] !== undefined) {
                        return contactNumber["$t"];
                    }
                }).filter(function (number) {
                    return number != null;
                })
                : [];
        },

        inventContactByNumber: function (number) {
            return {
                title: { "$t" : "unknown contact" },
                "gd$phoneNumber": [ { "$t" : number } ]
            };
        },

        findContactByNumber: function (contacts, number) {
            var self = this;
            var stripNumber = function (number) {
                var m = number.match(/^0+(.*)$/);
                if (m && m.length > 0) {
                    return number.match(/^0+(.*)$/)[1];
                } else {
                    return number;
                }
            };

            var strippedNumber = stripNumber(number);
            console.log("stripped number: " + strippedNumber);
            var filterContactByNumber = function (c) {

                var numbers = self.contactNumbers(c)

                for (i = 0; i < numbers.length; i++) {
                    var cNumber = numbers[i];
                    if (cNumber.indexOf(strippedNumber) != -1) {
                        console.log("match: " + strippedNumber);
                        return true;
                    } else {
                        console.log("no match: " + strippedNumber);
                    }
                }

                return false;

            };

            if (contacts) {
                result = contacts.filter(filterContactByNumber);
                if (result.length > 0) {
                    //return {title: result[0].title["$t"], photoLink: result[0].photoLink};
                    return result[0];
                }
            }

            return this.inventContactByNumber(number);
        },
    }

});