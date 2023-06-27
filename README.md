# HTTP Reply Component

## Table of Contents

* [Description](#description)
* [Actions](#actions)
  * [Reply](#reply)
  * [Reply With Attachment](#reply-with-attachment)

### Description

The component replies with messages to the client requested a webhook.

This component takes the incoming message body and applies the configured JSONata transformation on it, if present, and return a message back to the client requested a webhook of a given flow.

## Actions

### Reply

#### Configuration Fields
* **Custom HTTP Headers** - (string, optional): Provides with possibility to set additional headers separated by comma (e.g `Content-Language, User-Agent`)

#### Input Metadata
* **Content Type (Defaults to 'application/json')** - (string, optional, defaults to `application/json`): Header value tells the client what the content type of the returned content actually is.
* **Response Body** - (string/Object, required): Body to send as the response
* **Response Status Code** - (number, optional, defaults to `200`): Integer number between `200` and `999` (ore info about status codes in [rfc7231](https://datatracker.ietf.org/doc/html/rfc7231#section-6) standart)

If provided `Custom HTTP Headers` there will be additional field:
* **customHeaders**, contains:
  * **Header <header name provided in "Custom HTTP Headers">** - you can provide value to your custom header here


#### Output Metadata
Same as `Input Metadata`

### Reply With Attachment

#### Configuration Fields
* **Custom HTTP Headers** - (string, optional): Provides with possibility to set additional headers separated by comma (e.g `Content-Language, User-Agent`)

#### Input Metadata
* **Content Type (Defaults to 'application/json')** - (string, optional, defaults to `application/json`): Header value tells the client what the content type of the returned content actually is.
* **Attachment URL** - (string, required): Link to file (on platform or external) that will be used as response
* **Response Status Code** - (number, optional, defaults to `200`): Integer number between `200` and `999` (ore info about status codes in [rfc7231](https://datatracker.ietf.org/doc/html/rfc7231#section-6) standart)

If provided `Custom HTTP Headers` there will be additional field:
* **customHeaders**, contains:
  * **Header <header name provided in "Custom HTTP Headers">** - you can provide value to your custom header here


#### Output Metadata
Same as `Input Metadata`

