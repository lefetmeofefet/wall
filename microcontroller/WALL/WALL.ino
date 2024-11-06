#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Arduino_JSON.h>
#include <Preferences.h>
#include <FastLED.h>

#define NUM_LEDS 300
#define DATA_PIN 19

Preferences preferences;
CRGB leds[NUM_LEDS];

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;


// UUIDs for BLE service and characteristics
#define SERVICE_UUID        "5c8468d0-024e-4a0c-a2f1-4742299119e3"
#define CHARACTERISTIC_UUID "82155e2a-76a2-42fb-8273-ea01aa87c5be"

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

int getBrightness() {
  preferences.begin("settings", true);  // Open in read-only mode
  int value = preferences.getInt("brightness", 120);  // Brightness level (0 - 255)
  preferences.end();
  return value;
}

void setBrightness(int brightness) {
  preferences.begin("settings", false);  // Open in read-write mode
  preferences.putString("brightness", brightness);
  preferences.end();
  FastLED.setBrightness(brightness);
}

class MessageCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String messageString = pCharacteristic->getValue();
    Serial.println("Got message: " + messageString);
    JSONVar message = JSON.parse(messageString);
    String command = message["command"];

    if (command == "sendWallName") {
      setWallName(message["wallName"]);
    } else if (command == "getWallName") {
      String wallName = getWallName();
      JSONVar response;
      response["wallName"] = wallName;
      sendMessage(JSON.stringify(response));
    } else if (command == "setLeds") {
      JSONVar ledsList = message["leds"];

      // Turn off all leds
      for (int i=0; i<NUM_LEDS; i++) {
        leds[i] = CRGB(0, 0, 0);
      }
      // Turn on route leds
      for (int i=0; i<ledsList.length(); i++) {
        JSONVar ledGroup = ledsList[i];
        int r = ledGroup["r"];
        int g = ledGroup["g"];
        int b = ledGroup["b"];
        for (int j=0; j<ledGroup["i"].length(); j++) {
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

bool deviceConnected = false;
class ConnectionCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      BLEDevice::startAdvertising();
    }

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      BLEDevice::startAdvertising();
    }
};

void sendMessage(String message) {
  pCharacteristic->setValue(message);
  pCharacteristic->notify();
}

void setupBluetooth() {
    String wallName = getWallName();
    BLEDevice::init(wallName);

    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ConnectionCallbacks());

    BLEService *pService = pServer->createService(SERVICE_UUID);
    pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE |
      BLECharacteristic::PROPERTY_NOTIFY
    );

    pCharacteristic->addDescriptor(new BLE2902());
    pCharacteristic->setCallbacks(new MessageCallbacks());
    pService->start();

    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    // pAdvertising->setMinPreferred(0x06);  // functions that help with iOS issue
    // pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();
}

void setupLeds() {
  FastLED.addLeds<WS2811, DATA_PIN, RGB>(leds, NUM_LEDS);
  FastLED.setBrightness(getBrightness());

  // Shut down leds on startup
  for (int i=0; i<NUM_LEDS; i++) {
    leds[i] = CRGB(0, 0, 0);
  }
  FastLED.show();
}

void setup() {
  Serial.begin(115200);
  setupBluetooth();
  setupLeds();
}

void loop() {
    delay(20);
}
