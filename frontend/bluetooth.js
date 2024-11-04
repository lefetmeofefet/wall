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
        if (message.wallName != null) {
            if (receiveWallName != null) {
                receiveWallName(message.wallName)
            }
        }

    })
    await characteristic.startNotifications()

    // // Disconnect after communication
    // await server.disconnect()
}

function sendBTMessage(message) {
    const encoder = new TextEncoder()
    characteristic.writeValue(encoder.encode(JSON.stringify(message)))
    console.log("Sending to esp: ", message)
}

function setWallName(wallName) {
    sendBTMessage({
        command: "setWallName",
        wallName
    })
}

let receiveWallName

async function getWallName() {
    sendBTMessage({
        command: "getWallName",
    })
    return new Promise(resolve => receiveWallName = resolve)
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

function highlightRoute(route) {
    let normalLedGroup = getLedRGB(true, false)
    let startOrFinishLedGroup = getLedRGB(true, true)
    normalLedGroup.i = []
    startOrFinishLedGroup.i = []
    for (let hold of route.holds) {
        if (hold.startOrFinishHold) {
            normalLedGroup.i.push(hold.id)
        } else {
            startOrFinishLedGroup.i.push(hold.id)
        }
    }
    sendBTMessage({
        command: "setLeds",
        leds: [normalLedGroup, startOrFinishLedGroup].filter(ledGroup => ledGroup.i.length > 0)
    })
}

function clearLeds() {
    sendBTMessage({
        command: "clearLeds"
    })
}

function setHoldState(hold) {
    sendBTMessage({
        command: "setLed",
        led: {
            ...getLedRGB(hold.inRoute, hold.startOrFinishHold),
            i: hold.id
        }
    })
}

export {scanAndConnect, setWallName, highlightRoute, setHoldState, clearLeds, getWallName}
