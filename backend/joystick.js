import HID from 'node-hid'
import {getHolds} from "./db.js";

// const devices = HID.devices()
// console.log(devices)

const vendorId = 1118
const productId = 60

const Joystick = {

}

const BUTTONS = {
    FIRE: 1,
    TOP: 2
}

try {
    const device = new HID.HID(vendorId, productId)

    device.on("data", (data) => {
        // Parse the joystick data buffer to get axis, button states, etc.
        let normalizeByte = byte => ((byte - 127) / 127)
        Joystick.xAxis = normalizeByte(data.readUInt8(0))
        Joystick.yAxis = normalizeByte(data.readUInt8(1))
        Joystick.wheel = ((data.readUInt8(2) - 255) / 255)

        // Detect button press
        let oldButton = Joystick.button
        Joystick.button = data.readUInt8(3)
        if (oldButton !== Joystick.button) {
            buttonListeners.forEach(cb => cb(Joystick.button))
        }
    })

    device.on("error", (err) => {
        console.error("Error:", err)
    })
} catch (err) {
    console.error("Device not found or could not be accessed:", err)
}

let buttonListeners = []
let onJoystickButton = cb => buttonListeners.push(cb)

export {
    Joystick,
    onJoystickButton,
    BUTTONS
}