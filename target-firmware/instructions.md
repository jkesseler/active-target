## Raspberry pi install scripts

I'm setting up a Raspberry Pi to act as a 'master' device in a time tracking system.
The system has multiple slave devices in the form of ESP32's
I want to be able to quicky configure multiple Raspberry Pi's to that end I'd like to have a bash script
that automate the tasks for me. In the end I want to have a set of files that can be quickly deployed to
create a working system. A bit like Terraform is used to quickly setup a web platform.

It must do the following:

- setup the Raspberry Pi as a wifi hotspot with the name "active-target" and DHCP server while still having a working internet connection
- The Raspberry Pi must have the hostname "active-target.local"
- Set the default user password to "active-target"
- Enable SSH
- Install Docker
- Create a docker-compose.yml file and DOCKERFILE files for the following:
  1 caddy as a reverse proxy
  2 Install a Chrony, a ntp server.
    If the Raspberry Pi has a internet connection Chrony will sync the Pi to a public ntp servers
    every 5 minutes
    Other devices connecting to the Raspberry Pi will use this server to sync time
    They will connect via 'npt.active-target.local' or the Raspberry Pi's IP address
  3 NodeJS as webserver on port 80 with a simple default page that prints "Welcome to Active Target"
    accessible via 'http://active-target.local'
  4 node-red
    accessible via 'http://flow.active-target.local'
  5 mqtt server
    accessible via 'mqtt.active-target.local' or the Raspberry Pi's IP address it should accept plain mqtt and WebSocket connections
