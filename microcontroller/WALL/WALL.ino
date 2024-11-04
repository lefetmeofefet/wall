#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Arduino_JSON.h>
#include <Preferences.h>


#define NUM_LEDS 300
#define DATA_PIN 19
#define BRIGHTNESS 120  // Brightness level (0 - 255)

Preferences preferences;
CRGB leds[NUM_LEDS];

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;


// UUIDs for BLE service and characteristics
#define SERVICE_UUID        "4fafc201-1fb5-459e-cdbe-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-abcd-ea07361b26a8"

String getWallName() {
  preferences.begin("settings", true);  // Open in read-only mode
  String defaultName = "WALL";
  String value = preferences.getString("wallName", defaultName);
  preferences.end();
  return value;
}

void setWallName(String name) {
    preferences.begin("settings", false);  // Open in read-write mode
    preferences.putString("wallName", name);
    preferences.end();
}

class MessageCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String messageString = pCharacteristic->getValue();
    Serial.println("Got message: " + messageString);
    JSONVar message = JSON.parse(messageString);
    String command = message["command"];

    if (command == "sendWallName") {
      setWallName(message["wallName"])
    } else if (command == "getWallName") {
      String wallName = getWallName();
      JSONVar response;
      response["wallName"] = wallName;
      sendMessage(wallName)
    } else if (command == "setLeds") {
      JSONVar ledsList = message["leds"];

      // Turn off all leds
      for (int i=0; i<NUM_LEDS; i++) {
        leds[i] = CRGB(0, 0, 0);
      }
      // Turn on route leds
      for (let i=0; i<ledsList.length(); i++) {
        JSONVar ledGroup = ledsList[i];
        int r = ledGroup["r"];
        int g = ledGroup["g"];
        int b = ledGroup["b"];
        for (int j=0; j<ledGroup["i"].length; j++) {
          int index = ledGroup["i"][j];
          leds[index] = CRGB(r, g, b);
        }
      }
      FastLED.show();
    } else if (command == "setLed") {
      JSONVar led = message["led"];
      leds[led["i"]] = CRGB(led["r"], led["g"], led["b"]);
      FastLED.show();
    } else if (command == "clearLeds") {
      for (int i=0; i<NUM_LEDS; i++) {
        leds[i] = CRGB(0, 0, 0);
      }
      FastLED.show();
    }
  }
};

bool deviceConnected = false
class ConnectionCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    }

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
}

void sendMessage(String message) {
  pCharacteristic->setValue(message);
  pCharacteristic->notify();
}


void setupBluetooth() {
    BLEDevice::init("Climbing Wall ESP32");

    String wallName = getWallName();
    pServer = BLEDevice::createServer(wallName);
    pServer->setCallbacks(new ConnectionCallbacks());

    BLEService *pService = pServer->createService(SERVICE_UUID);
    pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE |
      BLECharacteristic::PROPERTY_NOTIFY
    );

    //pCharacteristic->addDescriptor(new BLE2902())
    pCharacteristic->setCallbacks(new MessageCallbacks());
    pService->start();

    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising()
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    // pAdvertising->setMinPreferred(0x06);  // functions that help with iOS issue
    // pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();
}

void setupLeds() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);

  // Shut down leds on startup
  for (int i=0; i<NUM_LEDS; i++) {
    leds[i] = CRGB(0, 0, 0);
  }
  FastLED.show();
}

void setup() {
  Serial.begin(115200)
  setupBluetooth();
  setupLeds();
}

void loop() {
    delay(20);
}


// void loop() {
//   leds[0] = CRGB::Red;      // Set first LED to red
//   leds[1] = CRGB::Green;    // Set second LED to green
//   leds[2] = CRGB::Blue;     // Set third LED to blue
//   FastLED.show();           // Update the LED strip
//   delay(1000);

//   FastLED.clear();          // Turn off all LEDs
//   FastLED.show();
//   delay(1000);
// }