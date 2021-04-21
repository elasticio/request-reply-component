const {
  AttachmentProcessor,
} = require("@elastic.io/component-commons-library");
const { messages } = require("elasticio-node");
const Encryptor = require("elasticio-sailor-nodejs/lib/encryptor");
const { ObjectStorage } = require("@elastic.io/object-storage-client");

const JWTToken = process.env.ELASTICIO_OBJECT_STORAGE_TOKEN;
const maesterUri = process.env.ELASTICIO_OBJECT_STORAGE_URI;
const PASSWORD = process.env.ELASTICIO_MESSAGE_CRYPTO_PASSWORD;
const VECTOR = process.env.ELASTICIO_MESSAGE_CRYPTO_IV;

const HEADER_CONTENT_TYPE = "Content-Type";
const HEADER_ROUTING_KEY = "X-EIO-Routing-Key";
const DEFAULT_CONTENT_TYPE = "application/json";
const HEADER_STATUS_CODE = "x-eio-status-code";
const HEADER_OBJECT_STORAGE = "x-ipaas-object-storage-id";

const objectStorage = new ObjectStorage({
  uri: maesterUri,
  jwtSecret: JWTToken,
});

const encryptor = new Encryptor(PASSWORD, VECTOR);
objectStorage.use(
  () => encryptor.createCipher(),
  () => encryptor.createDecipher()
);

exports.process = async function processMessage(msg) {
  try {
    const replyTo = msg.headers.reply_to;
    const { responseUrl } = msg.body;
    this.logger.info(
      `Received new message, replyTo: ${replyTo} \nResponseUrl is ${responseUrl}`
    );
    this.logger.debug("Received new message: %j", msg);
    if (!replyTo || !responseUrl) return;

    const contentType = msg.body.contentType; // change to func

    this.logger.debug(`Replying to ${replyTo}`);
    this.logger.debug(`contentType is ${contentType}`);

    const attachmentAsStream = await new AttachmentProcessor().getAttachment(
      responseUrl,
      "stream"
    );

    const objectId = await objectStorage.addAsStream(
      () => attachmentAsStream.data,
      JWTToken
    );

    const reply = messages.newMessageWithBody({});
    reply.headers[HEADER_ROUTING_KEY] = replyTo;
    reply.headers[HEADER_CONTENT_TYPE] = contentType;
    reply.headers[HEADER_OBJECT_STORAGE] = objectId;

    if (msg.body.customHeaders) {
      this.logger.debug("Applying custom headers: %j", msg.body.customHeaders);
      Object.assign(reply.headers, msg.body.customHeaders);
    }

    if (msg.body.statusCode) {
      reply.headers[HEADER_STATUS_CODE] = msg.body.statusCode;
    }

    this.logger.debug("Replying with %j", reply);

    this.emit("data", reply);
    this.emit("end");
  } catch (err) {
    console.log(err);
    this.emit("error", err);
  }
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
