#include <WiFi.h> // Include the Wi-Fi library
unsigned long initialDelay = 1000;  // Initial delay in ms
unsigned long maxDelay = 30000;     // Maximum delay in ms

void connectToWiFi(const char *ssid, const char *password)
{
  unsigned long currentDelay = initialDelay;

  // Connect to Wi-Fi network
  
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(currentDelay);
    currentDelay = min(currentDelay * 2, maxDelay);
    Serial.print(".");
    WiFi.begin(ssid, password);
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}