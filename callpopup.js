requirejs.config({
    baseUrl: '',
    paths: {
        react: "node_modules/react/dist/react-with-addons",
        reactdom: "node_modules/react-dom/dist/react-dom",
        'google-client-api': "node_modules/google-client-api/index",
        'scriptjs': "node_modules/google-client-api/node_modules/scriptjs/dist/script.min",
        'promise': "node_modules/google-client-api/node_modules/promise/index",
        ui: "generated-jsx/callpopup",
        contact: "generated-jsx/contact",
        buttons: "generated-jsx/buttons",
    }
});


requirejs(['ui', 'reactdom'], function (ui, reactdom) {
    var callpopup = reactdom.render(ui, window.document.getElementById("container"));
    var globals = chrome.extension.getBackgroundPage().globals;
    var userAgent = globals["userAgent"];
    var audio = globals["audio"];
    var addStream = globals["addStream"];

});
