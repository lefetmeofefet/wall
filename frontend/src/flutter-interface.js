// Function to receive messages from Flutter
window.receiveFromFlutter = function (message) {
    console.log("Received from Flutter:", message);
    alert("Flutter says: " + message);
};

// Send a message to Flutter
function sendMessageToFlutter() {
    if (window.FlutterChannel) {
        window.FlutterChannel.postMessage("Hello from Web!");
    } else {
        console.log("FlutterChannel not available");
    }
}

function isInFlutter() {
    return window.FlutterChannel != null
}

// Log all console messages so Flutter can capture them
(function () {
    const oldLog = console.log;
    console.log = function (message) {
        oldLog.apply(console, arguments);
        if (window.FlutterChannel) {
            window.FlutterChannel.postMessage("[Console] " + message);
        }
    };
})();

export {isInFlutter}
