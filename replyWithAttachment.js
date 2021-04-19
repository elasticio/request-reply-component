const {
  AttachmentProcessor,
} = require("@elastic.io/component-commons-library");
const { messages } = require("elasticio-node");

const HEADER_CONTENT_TYPE = "Content-Type";
const HEADER_ROUTING_KEY = "X-EIO-Routing-Key";
const DEFAULT_CONTENT_TYPE = "application/json";
const HEADER_STATUS_CODE = "x-eio-status-code";

exports.process = async function processMessage(msg) {
  const replyTo = msg.headers.reply_to;
  console.log(`Received new message, replyTo: ${replyTo}`);
  console.log("Received new message: %j", msg);
  // if (!replyTo) return;

  const responseUrl = getResponseUrl(msg);
  const contentType = getContentType(msg);

  console.log(`Replying to ${replyTo}`);
  console.log(`Response content type is ${contentType}`);
  let body;
  const result = await new AttachmentProcessor().getAttachment(
    msg.attachments["img.png"].url,
    contentType
  );
  console.log("result attachment ", typeof result.data, result.headers);

  result.on("data", function (chunk) {
    body += chunk;
  });
  result.on("end", function () {
    // all data has been downloaded
  });
  console.log(body);
  // const reply = messages.newMessageWithBody(responseUrl);
  // reply.headers[HEADER_ROUTING_KEY] = replyTo;
  // reply.headers[HEADER_CONTENT_TYPE] = contentType;

  // if (msg.body.customHeaders) {
  //   this.logger.debug("Applying custom headers: %j", msg.body.customHeaders);
  //   Object.assign(reply.headers, msg.body.customHeaders);
  // }

  // if (msg.body.statusCode) {
  //   reply.headers[HEADER_STATUS_CODE] = msg.body.statusCode;
  // }

  // this.logger.debug("Replying with %j", reply);
  // this.emit("data", reply);

  // emitData();
  // onEnd();
  this.emit("end");
};

const getResponseUrl = (msg) => {
  if (!msg.body.responseUrl) {
    this.logger.debug(
      "Field responseUrl on the message body was empty, we will reply with the whole message body"
    );
  }
  return msg.body.responseUrl ?? msg.body;
};

const getContentType = (msg) => {
  const contentType = msg.body.contentType;

  if (contentType) {
    if (/^application|text\//.test(contentType)) {
      return contentType;
    }

    throw new Error(`Content-type ${contentType} is not supported`);
  }

  return DEFAULT_CONTENT_TYPE;
};

const emitData = () => {
  this.logger.info("Emitting data...");

  delete msg.body.elasticio; // eslint-disable-line
  this.emit("data", messages.newMessageWithBody(msg.body));
};

const onEnd = () => {
  this.logger.debug(`Finished processing message for replyTo: ${replyTo}`);
  this.emit("end");
};
