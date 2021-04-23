# request-reply-component

## General information

### Description

The component replies with messages to the client requested a webhook.

### Authentication

This component requires no authentication.

### Environment variables

No required environment variables

## How it works

This component takes the incoming message body and applies the configured JSONata tranformation on it, if present, and return a message back to the client requested a webhook of a given flow.

## Actions

### Reply

List of Expected Config fields:

- Custom HTTP Headers - the `non-required` header names separated by comma (e.g `Content-Type`, `Content-Language`)
- Content Type (default `application/json`) - the `non-required` header value tells the client what the content type of the returned content actually is. The action supports only types with `text/...` or `application/...` in the beginning of the header name.
- Response Body - the `required` field supports JSONata expressions. Max length of a JSONata expression is 1000 symbols.

![image](https://user-images.githubusercontent.com/40201204/81501098-1cfe1f80-92df-11ea-8d99-76211d83fc85.png)

### ReplyWithAttachment

List of Expected Config fields:

- Custom HTTP Headers - the `non-required` header names separated by comma (e.g `Content-Type`, `Content-Language`)
- Content Type (default `application/json`) - the `non-required` header value tells the client what the content type of the returned content actually is
- Attachment URL - the `required` field supports JSONata expressions. Max length of a JSONata expression is 1000 symbols.

![image](https://user-images.githubusercontent.com/30211658/115857013-dd6c0d00-a435-11eb-9ed4-af334b9b77a3.png)

## Known limitations (common for the component)
No.

## Documentation links
More information and some examples of JSONata expressions can be found [here](http://docs.jsonata.org/).
