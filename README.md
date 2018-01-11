# A blank Mongoose OS app

## Overview

This is an empty app, serves as a skeleton for building Mongoose OS
apps from scratch.

## How to install this app

* Install and start [mos tool](https://mongoose-os.com/software.html)
* Switch to the Project page, find and import this app, build and flash it:

<p align="center">
  <img src="https://mongoose-os.com/images/app1.gif" width="75%">
</p>

```
$ mos build
$ mos wifi WIFI_SSID WIFI_PASSWORD
$ mos flush
$ mos console
```

```
[Jan 12 08:40:59.342] field1=20.623331&field2=21.791409
[Jan 12 08:40:59.366] MQTT req Success
```

It Request works!
