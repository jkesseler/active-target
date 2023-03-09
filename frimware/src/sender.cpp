#include <Arduino.h>
#include <SPI.h>
#include <LoRa.h>
#include "board.h"
#include "Roboto_16.h"
OLED_CLASS_OBJ display(OLED_ADDRESS, OLED_SDA, OLED_SCL);

int counter = 0;
int BUTTON_PIN = 21;
int lastButtonState;

void setup()
{
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  lastButtonState = digitalRead(BUTTON_PIN);

  Serial.begin(115200);
  while (!Serial)
    ;

  if (OLED_RST > 0)
  {
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
  display.drawString(display.getWidth() / 2, display.getHeight() / 2, "LoRa button Sender");
  display.display();
  delay(2000);

  SPI.begin(CONFIG_CLK, CONFIG_MISO, CONFIG_MOSI, CONFIG_NSS);
  LoRa.setPins(CONFIG_NSS, CONFIG_RST, CONFIG_DIO0);
  if (!LoRa.begin(BAND))
  {
    Serial.println("Starting LoRa failed!");
    while (1); // endless loop
  }

  display.clear();
  display.drawString(display.getWidth() / 2, display.getHeight() / 2, "Push the button");
  display.display();
}

void loop()
{
  int buttonState = digitalRead(BUTTON_PIN);

  if (lastButtonState != buttonState)
  {            // state changed
    delay(50); // debounce time

    if (buttonState == HIGH)
    {
      LoRa.beginPacket();
      LoRa.print("button pressed");
      LoRa.endPacket();

      counter++;

      display.clear();
      display.drawString(display.getWidth() / 2, display.getHeight() / 2, "Pressed");
      display.display();
    }
    else
    {
      display.clear();
      display.drawString(display.getWidth() / 2, display.getHeight() / 2, "Released");
      display.display();
    }

    lastButtonState = buttonState;

  }
}
