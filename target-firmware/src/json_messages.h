#ifndef JSON_MESSAGES_H
#define JSON_MESSAGES_H
#include <ArduinoJson.h>

class Messages
{
  public:
    Messages(String uuid);
    String createAddTargetMessage();
    String createAddResultMessage();
    String createUpdateTargetMessage();

  private : String UUID;

};


#endif
