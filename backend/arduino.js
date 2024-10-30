import {SerialPort} from 'serialport'
import {ReadlineParser}  from '@serialport/parser-readline'


const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600
})
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

port.on('open', () => {
    console.log('Serial Port Opened')
    // sendDataToArduino("I AM ALIVE")
})

parser.on('data', (data) => {
    console.log('Received data from Arduino:', data)
})

port.on('error', (err) => {
    console.error('Error: ', err.message)
})

const sendDataToArduino = (message) => {
    port.write(message + '\n', (err) => {
        if (err) {
            return console.error('Error on write:', err.message)
        }
        console.log('Message sent to Arduino:', message)
    })
}

function setLEDs(leds) {
    sendDataToArduino(JSON.stringify(leds))
}

function clearLEDs() {
    sendDataToArduino("CLEAR")
}

export {sendDataToArduino, setLEDs, clearLEDs}
