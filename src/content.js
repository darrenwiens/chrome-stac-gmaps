chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg == "toggle") {
        toggle();
    } else if (msg == "query") {
        let pathParts = new URL(window.location.href).pathname.split("/")
        let coordsPart = pathParts.filter((part) => part.startsWith("@"))[0].split(",");
        coords = {
            lat: parseFloat(coordsPart[0].substring(1)),
            lng: parseFloat(coordsPart[1]),
            zoom: parseFloat(coordsPart[2].substring(0, coordsPart[2].length - 1))
        }
        sendResponse(coords);
    }
})

var iframe = document.createElement('iframe');
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.border = "0px";
iframe.src = chrome.runtime.getURL("popup.html")

document.body.appendChild(iframe);

function toggle() {
    if (iframe.style.width == "0px") {
        iframe.style.width = "400px";
    }
    else {
        iframe.style.width = "0px";
    }
}