# MQTT Messages standard

## Introduction

A human-friendly standard for MQTT messages use by Active Target. Loosly based on [Flux standard action](https://github.com/redux-utilities/flux-standard-action/).


## Motivation

MQTT as used within Active Target is conceptually similar to [Redux JS](https://redux.js.org/). It provides a centralized state for the system. That is easy to debug and flexible.


## Design goals
* **Human-friendly.** Messages should be easy to read and write by humans.
* **Useful**. Messages should enable the creation of useful tools and abstractions.
* **Simple.** Messages be simple, straightforward, and flexible in its design.

## Message standard

A message MUST

* be a plain JSON Object.
* have a `type` property.

An a message MAY

* have an `error` property.
* have a `payload` property.
* have a `meta` property.

An message MUST NOT include properties other than `type`, `payload`, `error`, and `meta`.

### `payload`

The optional `payload` property MAY be any type of value. It represents the payload of the message. Any information about the message that is not the `type` or status of the action should be part of the `payload` field.

By convention, if `error` is `true`, the `payload` SHOULD be an error object.

### `error`
<!-- How do errors work in C++ ? -->
The optional `error` property MAY be set to `true` if the action represents an error.

An action whose `error` is true is analogous to a rejected Promise. By convention, the `payload` SHOULD be an error object.

If `error` has any other value besides `true`, the action MUST NOT be interpreted as an error.

### `meta`

The optional `meta` property MAY be any type of value. It is intended for any extra information that is not part of the payload.

In Active Target the `meta` property contains the sender's `deviceId`, a timestamp when the message was send and the `millies` (calculated from UINX epoch) when the message was send.
