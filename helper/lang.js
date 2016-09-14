define([], function () {

    return {
        mergeObjects: function (a, b) {
            var result = {};
            for (var attrname in a) { result[attrname] = a[attrname] };
            for (var attrname in b) { result[attrname] = b[attrname] };
            return result;
        }
    }
});