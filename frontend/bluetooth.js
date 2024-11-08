import {GlobalState} from "./state.js";
import {showToast} from "./utilz/toaster.js";

const WALL_SERVICE_ID = '5c8468d0-024e-4a0c-a2f1-4742299119e3'
const CHARACTERISTIC_ID = '82155e2a-76a2-42fb-8273-ea01aa87c5be'  // We don't really use this, its mandatory in BLE

let characteristic

// Scan and display available walls
async function scanAndConnect() {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{services: [WALL_SERVICE_ID]}],
        optionalServices: [WALL_SERVICE_ID],
    })

    // Present user with wall name and option to connect
    console.log(`found device `, device)
    console.log(`Connecting to ${device.name}`)
    await connectToWall(device)
    return device.name
}

async function connectToWall(device) {
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(WALL_SERVICE_ID)
    characteristic = await service.getCharacteristic(CHARACTERISTIC_ID)

    // Receive JSON data
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const decoder = new TextDecoder()
        const messageString = decoder.decode(event.target.value)
        console.log('Received:', messageString)
        let message = JSON.parse(messageString)
        if (message.command === "wallInfo") {
            if (receiveWallInfo != null) {
                receiveWallInfo(message)
            }
        } else if (message.command === "killPlayer") {
            window.onKillPlayer && window.onKillPlayer(message.color)
        } else if (message.command === "playerAteApple") {
            window.onPlayerAteApple && window.onPlayerAteApple(message.color)
        }
    })
    await characteristic.startNotifications()

    // // Disconnect after communication
    // await server.disconnect()
}

// In bluetooth we must send messages sequentially otherwise we get bugs, so we implement a queue
const messageQueue = []

async function sendBTMessageFromQueue(message) {
    try {
        const encoder = new TextEncoder()
        console.log("Sending to esp: ", message)
        await characteristic.writeValue(encoder.encode(JSON.stringify(message)))
    } catch (e) {
        console.log("Error sending bluetooth message: ", {e})
        console.error(e)
        showToast(`Error sending Bluetooth message: ${e.toString()}`, {error: true})
        if (e.code === 9) {
            // "GATT operation failed for unknown reason."
        } else if (e.code === 19) {
            // Disconnected
            console.log("Disconnected")
            GlobalState.wallName = null
        }
    }
}

let consuming = false

async function consumeQueue() {
    if (consuming) {
        return
    }
    consuming = true
    try {
        while (messageQueue.length > 0) {
            let {message, resolve} = messageQueue.shift()
            await sendBTMessageFromQueue(message)
            resolve()
        }
    } finally {
        consuming = false
    }
}

function sendBTMessage(message) {
    let btMessagePromise
    let promise = new Promise(resolve => btMessagePromise = resolve)
    messageQueue.push({message, resolve: btMessagePromise})
    consumeQueue()
    return promise
}

async function setWallName(wallName) {
    await sendBTMessage({
        command: "setWallName",
        wallName
    })
}

let receiveWallInfo

async function getWallInfo() {
    await sendBTMessage({
        command: "getInfo",
    })
    return new Promise(resolve => receiveWallInfo = resolve)
}

async function setWallBrightness(brightness) {
    await sendBTMessage({
        command: "setBrightness",
        brightness
    })
}

function getLedRGB(isOn, startOrFinishHold) {
    if (isOn) {
        if (startOrFinishHold) {
            return {r: 0, g: 255, b: 0}
        }
        return {r: 0, g: 0, b: 255}
    }
    return {r: 0, g: 0, b: 0}
}

async function highlightRoute(route) {
    let normalLedGroup = getLedRGB(true, false)
    let startOrFinishLedGroup = getLedRGB(true, true)
    normalLedGroup.i = []
    startOrFinishLedGroup.i = []
    for (let hold of route.holds) {
        if (hold.startOrFinishHold) {
            startOrFinishLedGroup.i.push(hold.id)
        } else {
            normalLedGroup.i.push(hold.id)
        }
    }
    await sendBTMessage({
        command: "setLeds",
        leds: [normalLedGroup, startOrFinishLedGroup].filter(ledGroup => ledGroup.i.length > 0)
    })
}

async function setLeds(ledGroups) {
    await sendBTMessage({
        command: "setLeds",
        leds: ledGroups
    })
}

async function clearLeds() {
    await sendBTMessage({
        command: "clearLeds"
    })
}

async function setHoldState(hold) {
    await sendBTMessage({
        command: "setLed",
        snakeMode: false,
        led: {
            ...getLedRGB(hold.inRoute, hold.startOrFinishHold),
            i: hold.id
        }
    })
}

async function setSnakeModeLed(r, g, b, i) {
    await sendBTMessage({
        command: "setLed",
        snakeMode: true,
        led: {r, g, b, i}
    })
}

export {
    scanAndConnect,
    setWallName,
    highlightRoute,
    setHoldState,
    clearLeds,
    setWallBrightness,
    getWallInfo,
    setSnakeModeLed,
    setLeds,
    messageQueue
}
