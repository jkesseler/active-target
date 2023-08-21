#ifndef JSON_MESSAGES_H
#define JSON_MESSAGES_H
#include <ArduinoJson.h>

class Messages
{
  public:
    Messages(String uuid);
    String createDeviceOnlineMessage();
    String createAddResultMessage();
    String createDeviceUpdatedMessage();

  private : String UUID;

};


#endif
