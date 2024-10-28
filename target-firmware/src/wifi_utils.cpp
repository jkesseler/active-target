#include <WiFi.h> // Include the Wi-Fi library

String connectToWiFi(const char *ssid, const char *password) {
  // Connect to Wi-Fi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  IPAddress apIP = WiFi.gatewayIP();
  

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println(WiFi.gatewayIP());

  return apIP.toString();
}