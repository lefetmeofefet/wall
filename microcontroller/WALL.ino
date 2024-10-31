#include <FastLED.h>
//#include <ArduinoJson.h>
#define NUM_LEDS 300
#define DATA_PIN 6
#define BRIGHTNESS 120 // Brightness level (0 - 255)

CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  
  // Shut down leds on startup
  for (int i=0; i<NUM_LEDS; i++) {
    leds[i] = CRGB(0, 0, 0);
  }
  FastLED.show();
}
  
void loop() {
  if (Serial.available()) {
    String message = Serial.readStringUntil('\n');
    //Serial.println("Got message");
      
    if (message == "CLEAR") {
      //Serial.println("Clearing all leds");
      for (int i=0; i<NUM_LEDS; i++) {
        leds[i] = CRGB(0, 0, 0);
      }
    } else {
      // Split the remaining string by commas
      int r = message.substring(0, message.indexOf(',')).toInt();
      message = message.substring(message.indexOf(',') + 1);
      int g = message.substring(0, message.indexOf(',')).toInt();
      message = message.substring(message.indexOf(',') + 1);
      int b = message.substring(0, message.indexOf(',')).toInt();
      message = message.substring(message.indexOf(',') + 1);
      int i = message.toInt();

      //Serial.println("R: " + String(r) + ", G: " + String(g) + ", B: " + String(b) + ", i: " + String(i));
      leds[i] = CRGB(g, r, b);
    }
    FastLED.show();
  }
  delay(20);
}
