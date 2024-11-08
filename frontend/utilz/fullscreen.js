function enterFullscreen() {
    const element = document.documentElement
    if (element.requestFullscreen) {
        element.requestFullscreen()
    } else if (element.webkitRequestFullscreen) { // Safari
        element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) { // IE11
        element.msRequestFullscreen()
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen()
    }
}

function isFullScreen() {
    return document.fullscreenElement != null
}

export {enterFullscreen, exitFullscreen, isFullScreen}
