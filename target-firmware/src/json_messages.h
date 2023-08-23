#ifndef JSON_MESSAGES_H
#define JSON_MESSAGES_H
#include <ArduinoJson.h>
#include "settings.h"

class Messages
{
  public:
    Messages();
    void begin(String uuid, Settings settings);
    String createDeviceOnlineMessage();
    String createAddResultMessage();
    String createDeviceUpdatedMessage();

  private : String UUID;
  private : Settings settings;

};


#endif
