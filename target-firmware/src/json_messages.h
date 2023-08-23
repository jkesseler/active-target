#ifndef JSON_MESSAGES_H
#define JSON_MESSAGES_H
#include <ArduinoJson.h>

class Messages
{
  public:
    Messages();
    void begin(String uuid, String deviceName);
    String createDeviceOnlineMessage();
    String createAddResultMessage();
    String createDeviceUpdatedMessage();

  private: String UUID;
  private: String deviceName;
};


#endif
