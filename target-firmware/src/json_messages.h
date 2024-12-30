#ifndef JSON_MESSAGES_H
#define JSON_MESSAGES_H
#include <ArduinoJson.h>

class Messages
{
  public:
    Messages();
    void begin(String uuid, String deviceName, String deviceType);
    String createDeviceOnlineMessage();
    String createTargetHitMessage(const char *targetZone);
    String createMessageWitoutPayload(String action);
    String createDeviceUpdatedMessage();

  private: String UUID;
  private: String deviceName;
  private: String deviceType;
};


#endif
