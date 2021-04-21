const {
  AttachmentProcessor,
} = require("@elastic.io/component-commons-library");
const { default: axios } = require("axios");
const { messages } = require("elasticio-node");
const { Readable } = require("stream");
// const { v1 } = require("uuid");

const JWTToken = process.env.ELASTICIO_OBJECT_STORAGE_TOKEN;
const maesterUri = process.env.ELASTICIO_OBJECT_STORAGE_URI;

const HEADER_CONTENT_TYPE = "Content-Type";
const HEADER_ROUTING_KEY = "X-EIO-Routing-Key";
const DEFAULT_CONTENT_TYPE = "application/json";
const HEADER_STATUS_CODE = "x-eio-status-code";
const HEADER_OBJECT_STORAGE = "x-ipaas-object-storage-id";

exports.process = async function processMessage(msg) {
  try {
    const replyTo = msg.headers.reply_to;
    const { responseUrl } = msg.body;
    console.log(`Received new message, replyTo: ${replyTo}`);
    console.log("Received new message: %j", msg);
    console.log(`responseUrl is ${responseUrl}`);
    if (!replyTo || !responseUrl) return;

    const contentType = msg.body.contentType; // change to func

    console.log(`Replying to ${replyTo}`);
    console.log(`contentType is ${contentType}`);

    const result = await new AttachmentProcessor().getAttachment(
      responseUrl,
      contentType
    );

    // console.log("res data: ", typeof result.data);

    // const stream = formStream(result.data);
    // console.log("stream: ", typeof stream, stream instanceof Readable);
    const { objectId } = await sendStreamToStorage(
      result.data,
      maesterUri,
      JWTToken
    );

    const reply = messages.newMessageWithBody({});
    reply.headers[HEADER_ROUTING_KEY] = replyTo;
    reply.headers[HEADER_CONTENT_TYPE] = "image/png";
    reply.headers[HEADER_OBJECT_STORAGE] = objectId;

    if (msg.body.customHeaders) {
      this.logger.debug("Applying custom headers: %j", msg.body.customHeaders);
      Object.assign(reply.headers, msg.body.customHeaders);
    }

    if (msg.body.statusCode) {
      reply.headers[HEADER_STATUS_CODE] = msg.body.statusCode;
    }

    console.log("Replying with %j", reply);

    this.emit("data", reply);
    this.emit("end");
  } catch (err) {
    console.log(err);
    this.emit("error", err);
  }
};

const formStream = (data) => {
  const stream = new Readable();
  stream.push(data);
  stream.push(null);
  return stream;
};

const sendStreamToStorage = async (stream, maesterUri, JWTToken) => {
  console.log(`sending query to ${maesterUri} with token: ${JWTToken}`);

  const res = await axios.post(`${maesterUri}/objects`, stream, {
    headers: { Authorization: `Bearer ${JWTToken}` },
  });

  console.log("response: ", res.data);
  return res.data;
};

const getResponseUrl = (msg) => {
  if (!msg.body.responseUrl) {
    console.log(
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
