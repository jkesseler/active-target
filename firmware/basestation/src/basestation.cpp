#include "Roboto_16.h"
#include "board.h"
#include <Arduino.h>
#include <LoRa.h>
#include <SD.h>
#include <SPI.h>

OLED_CLASS_OBJ display(OLED_ADDRESS, OLED_SDA, OLED_SCL);

String contents = "";
String buttonPress = "button pressed";
bool x;

void onLoraRecieve(int packetSize) {
  String message = "";

  while (LoRa.available()) {
    message += (char)LoRa.read();
  }
  // parseMessage(message). json decode
}

void setup() {
  Serial.begin(115200);
  while (!Serial)
    ;

  if (OLED_RST > 0) {
    pinMode(OLED_RST, OUTPUT);
    digitalWrite(OLED_RST, HIGH);
    delay(100);
    digitalWrite(OLED_RST, LOW);
    delay(100);
    digitalWrite(OLED_RST, HIGH);
  }

  display.init();
  display.flipScreenVertically();
  display.clear();
  display.setFont(Roboto_16);
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(display.getWidth() / 2, display.getHeight() / 2, "LoRa Recieve");
  display.display();
  delay(2000);

  SPI.begin(CONFIG_CLK, CONFIG_MISO, CONFIG_MOSI, CONFIG_NSS);

  LoRa.setPins(CONFIG_NSS, CONFIG_RST, CONFIG_DIO0);
  if (!LoRa.begin(BAND)) {
    Serial.println("Starting LoRa failed!");
    while (1)
      ;
  }

  display.clear();
  display.drawString(display.getWidth() / 2, display.getHeight() / 2, "LoraRcv Ready");
  display.display();

  if (SDCARD_CS > 0) {
    display.clear();
    SPIClass sdSPI(VSPI);
    sdSPI.begin(SDCARD_SCLK, SDCARD_MISO, SDCARD_MOSI, SDCARD_CS);
    if (!SD.begin(SDCARD_CS, sdSPI)) {
      display.drawString(display.getWidth() / 2, display.getHeight() / 2, "SDCard FAIL");
    } else {
      display.drawString(display.getWidth() / 2, display.getHeight() / 2 - 16, "SDCard PASS");
      uint32_t cardSize = SD.cardSize() / (1024 * 1024);
      display.drawString(display.getWidth() / 2, display.getHeight() / 2, "Size: " + String(cardSize) + "MB");
    }
    display.display();
    delay(2000);
  }
}

void loop() {
  LoRa.onReceive(onLoraRecieve);

  int packetSize = LoRa.parsePacket();

  if (packetSize) {
    Serial.print("Received packet '");

    // read packet
    while (LoRa.available()) {
      contents += (char)LoRa.read();
    }

    // print RSSI of packet
    Serial.print("' with RSSI ");
    Serial.println(LoRa.packetRssi());
    Serial.println(contents);

    if (contents.equals(buttonPress)) {
      x = !x;
    }

    display.clear();

    if (x == true) {
      display.drawString(display.getWidth() / 2, display.getHeight() / 2, "State On");
    } else {
      display.drawString(display.getWidth() / 2, display.getHeight() / 2, "State Off");
    }
    display.display();

    contents = "";
  }
}
