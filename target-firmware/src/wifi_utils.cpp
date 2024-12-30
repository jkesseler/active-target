#include "common.h"
#include <WiFi.h> // Include the Wi-Fi library
int maxRetries = 5;

String connectToWiFi(const char *ssid, const char *password) {
  int attempt = 0;
  int delayTime = 500; // Initial delay in milliseconds

  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  // Attempt to connect to WiFi with backoff
  while (WiFi.status() != WL_CONNECTED && attempt < maxRetries) {
    WiFi.begin(ssid, password);
    delay(delayTime);
    Serial.print(".");

    if (WiFi.status() == WL_CONNECTED) {
      break;
    }

    attempt++;
    delayTime *= 2; // Exponential backoff
    Serial.print(" Retry attempt ");
    Serial.print(attempt);
    Serial.print(", next delay: ");
    Serial.print(delayTime);
    Serial.println(" ms");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Gateway IP: ");
    Serial.println(WiFi.gatewayIP());
    return WiFi.gatewayIP().toString();
  } else {
    Serial.println("\nFailed to connect to WiFi after maximum retries.");
    return "Connection Failed";
  }
}