import {sendDataToArduino} from "../backend/arduino.js";

setInterval(() => {
    const colors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 }
    ]

    const colorMessage = JSON.stringify(colors)
    sendDataToArduino(colorMessage)
}, 5000)
