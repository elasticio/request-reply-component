# request-reply-component

## General information

### Description

The component replies with messages to the client requested a webhook.

This component takes the incoming message body and applies the configured JSONata tranformation on it, if present, and return a message back to the client requested a webhook of a given flow.

### Environment variables

No required environment variables

## Credentials

This component requires no authentication.

## Actions

### Reply

List of Expected Config fields:

- `Custom HTTP Headers` - not required, provides with possibility to set additional headers (e.g `Content-Language`)
- `Content Type (Defaults to 'application/json')` - not required, header value tells the client what the content type of the returned content actually is. The action supports only types with `text/...` or `application/...` in the beginning of the header name.
- `Response Body` -  required, supports JSONata expressions. Max length of a JSONata expression is 1000 symbols.
- `Response Status Code` - not required,user may specify response code, if needed

![image](https://user-images.githubusercontent.com/36419533/115863191-cb8e6800-a43d-11eb-83f2-c859b854db44.png)

### Reply With Attachment

List of Expected Config fields:

- `Custom HTTP Headers` - non-required, provides with possibility to set additional headers (e.g `Content-Language`)
- `Content Type (Defaults to 'application/json')` - the `non-required` header value tells the client what the content type of the returned content actually is
- `Attachment URL` - required, supported are attachments from `stewart` microservice by URL and external attachments URL, Max field length is 1000 symbols.
- `Response Status Code` - not required, user may specify response code, if needed

![image](https://user-images.githubusercontent.com/36419533/115863277-e8c33680-a43d-11eb-9819-667c369b141c.png)

## Known limitations
No.

## Documentation links
More information and some examples of JSONata expressions can be found [here](http://docs.jsonata.org/).
