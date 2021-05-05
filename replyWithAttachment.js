const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { messages } = require('elasticio-node');
const Encryptor = require('elasticio-sailor-nodejs/lib/encryptor');
const { ObjectStorage } = require('@elastic.io/object-storage-client');
// eslint-disable-next-line
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
require('dotenv').config({ path: envFile });

const JWTToken = process.env.ELASTICIO_OBJECT_STORAGE_TOKEN;
const maesterUri = process.env.ELASTICIO_OBJECT_STORAGE_URI;
const PASSWORD = process.env.ELASTICIO_MESSAGE_CRYPTO_PASSWORD;
const VECTOR = process.env.ELASTICIO_MESSAGE_CRYPTO_IV;

const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_ROUTING_KEY = 'X-EIO-Routing-Key';
const DEFAULT_CONTENT_TYPE = 'application/json';
const HEADER_STATUS_CODE = 'x-eio-status-code';
const HEADER_OBJECT_STORAGE = 'x-ipaas-object-storage-id';

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
    const emitSample = process.env.ELASTICIO_FLOW_TYPE === 'debug';

    this.logger.info('Received new message');

    if (!responseUrl) throw new Error('"responseUrl" field can not be empty!');
    if (!emitSample && !replyTo) return;

    const { contentType = DEFAULT_CONTENT_TYPE } = msg.body;

    const { data } = await new AttachmentProcessor().getAttachment(
      responseUrl,
      'stream'
    );

    const objectId = await objectStorage.addAsStream(() => data, JWTToken);

    const reply = messages.newMessageWithBody({});
    reply.headers[HEADER_ROUTING_KEY] = replyTo;
    reply.headers[HEADER_CONTENT_TYPE] = contentType;
    reply.headers[HEADER_OBJECT_STORAGE] = objectId;

    if (msg.body.customHeaders) {
      this.logger.debug('Applying custom headers...');
      Object.assign(reply.headers, msg.body.customHeaders);
    }

    if (msg.body.statusCode) {
      reply.headers[HEADER_STATUS_CODE] = msg.body.statusCode;
    }

    this.logger.debug('Replying...');
    this.emit('data', reply);
    // emit some empty object just for statistic on dashboard
    this.emit('data', messages.newMessageWithBody(msg.body));
  } catch (err) {
    this.logger.error(err.toString());
    this.emit('error', err);
  }
};
