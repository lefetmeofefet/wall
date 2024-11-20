import {GlobalState} from "./state.js";
import {showToast} from "../utilz/toaster.js";

const WALL_SERVICE_ID = '5c8468d0-024e-4a0c-a2f1-4742299119e3'
const CHARACTERISTIC_ID = '82155e2a-76a2-42fb-8273-ea01aa87c5be'

let characteristic


// Scan and display available walls
async function scanAndConnect(onMessageCb, onDisconnectCb) {
    const device = await navigator.bluetooth.requestDevice({
        filters: [{services: [WALL_SERVICE_ID]}],
        optionalServices: [WALL_SERVICE_ID],
    })

    // Present user with wall name and option to connect
    console.log(`found device `, device)
    console.log(`Connecting to ${device.name}`)
    await connectToDevice(device, onMessageCb)
    device.addEventListener('gattserverdisconnected', () => onDisconnectCb());
    return device.name
}

async function connectToDevice(device, onMessageCb) {
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(WALL_SERVICE_ID)
    characteristic = await service.getCharacteristic(CHARACTERISTIC_ID)

    // Receive JSON data
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const decoder = new TextDecoder()
        const messageString = decoder.decode(event.target.value)
        onMessageCb(messageString)
    })
    await characteristic.startNotifications()

    // // Disconnect after communication
    // await server.disconnect()
}

/** @returns {Wall} */
async function connectToWall(secondTry) {
    GlobalState.loading = true
    try {
        let wallName = await scanAndConnect(
            messageString => {
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
            },
            () => {
                showToast("Disconnected from bluetooth", {error: true})
                GlobalState.bluetoothConnected = false
            }
        )
        GlobalState.bluetoothConnected = true
        let wallInfo = await getWallInfo()

        return {
            id: wallInfo.id,
            name: wallName,
            brightness: wallInfo.brightness,
        }
    } catch(e) {
        console.log("Error connecting to BT: ", e)
        console.error(e)
        if (e.code !== 8) {  // If user pressed "Cancel"
            showToast(`Error connecting to Bluetooth: ${e.toString()}`, {error: true})
        }
        if (e.code === 19 && !secondTry) {  // Sometimes happens randomly with the message "GATT Server is disconnected. Cannot retrieve services. (Re)connect first with `device.gatt.connect`."
            console.log(`Failed with msg ${e.toString()}, giving it a second try`)
            return await connectToWall(true)
        }
    } finally {
        GlobalState.loading = false
    }
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

async function sendBTMessage(message){
    if (!GlobalState.bluetoothConnected) {
        await connectToWall(message)
    }
    await sendBTMessageSync(message)
}

function sendBTMessageSync(message) {
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

function getLedRGB(isOn, holdType) {
    if (isOn) {
        if (holdType === "start") {
            return {r: 0, g: 255, b: 0}
        } else if (holdType === "finish") {
            return {r: 255, g: 0, b: 0}
        }
        return {r: 0, g: 0, b: 255}
    }
    return {r: 0, g: 0, b: 0}
}

async function highlightRoute(route) {
    let normalLedGroup = getLedRGB(true)
    let startLedGroup = getLedRGB(true, "start")
    let finishLedGroup = getLedRGB(true, "finish")
    normalLedGroup.i = []
    startLedGroup.i = []
    finishLedGroup.i = []
    for (let hold of route.holds) {
        if (hold.holdType === "start") {
            startLedGroup.i.push(hold.id)
        } else if (hold.holdType === "finish") {
            finishLedGroup.i.push(hold.id)
        } else {
            normalLedGroup.i.push(hold.id)
        }
    }
    await sendBTMessage({
        command: "setLeds",
        leds: [normalLedGroup, startLedGroup, finishLedGroup].filter(ledGroup => ledGroup.i.length > 0)
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
            ...getLedRGB(hold.inRoute, hold.holdType),
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

setInterval(async () => {
    if (GlobalState.bluetoothConnected) {
        await sendBTMessage({
            command: "keepawife"
        })
    }
}, 5000)

export {
    connectToWall,
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
