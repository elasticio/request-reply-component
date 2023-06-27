const { messages } = require('elasticio-node');
const commons = require('@elastic.io/component-commons-library');
const utils = require('./utils');

const DEFAULT_CONTENT_TYPE = 'application/json';
const DEFAULT_STATUS_CODE = 200;
const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_ROUTING_KEY = 'X-EIO-Routing-Key';
const HEADER_STATUS_CODE = 'x-eio-status-code';
const HEADER_OBJECT_STORAGE = 'x-ipaas-object-storage-id';

class ReplyClient {
  constructor(context, msg) {
    const {
      contentType = DEFAULT_CONTENT_TYPE,
      statusCode = DEFAULT_STATUS_CODE,
      customHeaders = {},
    } = msg.body;

    const {
      reply_to
    } = msg.headers;

    if (utils.isNumberNaN(statusCode) || Number(statusCode) < 200 || Number(statusCode) > 999) {
      const errorMessage = `"Response Status Code" must be valid number between 200 and 999, got ${this.statusCode}`;
      utils.logAndThrowError(context.logger, errorMessage);
    }

    this.reply_to = reply_to;
    this.contentType = contentType;
    this.statusCode = Number(statusCode);
    this.customHeaders = customHeaders;
    this.replyBody = {};
    this.logger = context.logger;
    this.context = context;
    this.msg = msg;
  }

  prepareReply() {
    const reply = messages.newMessageWithBody(this.replyBody);
    reply.headers[HEADER_ROUTING_KEY] = this.reply_to;
    reply.headers[HEADER_CONTENT_TYPE] = this.contentType;
    reply.headers[HEADER_STATUS_CODE] = this.statusCode;
    if (this.objectId) reply.headers[HEADER_OBJECT_STORAGE] = this.objectId;
    Object.assign(reply.headers, this.customHeaders);
    this.reply = reply;
  }

  async emitReply() {
    if (!this.reply_to) return;
    this.prepareReply();
    this.logger.info('Sending reply');
    await this.context.emit('data', this.reply);
  }

  async emitData() {
    this.logger.info('Emitting data...');
    await this.context.emit('data', messages.newMessageWithBody(this.msg.body));
  }

  async replyWithBody() {
    this.replyBody = this.msg.body.responseBody;
    if (!this.msg.body.responseBody) {
      this.logger.warn('Field "Response Body" on the message body was empty, we will reply with the whole message body');
      this.replyBody = this.msg.body;
    }
    await this.emitReply();
    await this.emitData();
  }

  async replyWithAttachment() {
    const { responseUrl } = this.msg.body;
    if (!responseUrl) {
      const errorMessage = '"Attachment URL" field can not be empty!';
      utils.logAndThrowError(this.logger, errorMessage);
    }
    const attachmentProcessor = new commons.AttachmentProcessor(utils.getUserAgent('component-commons-library'), this.msg.id);
    const objectStorage = utils.getObjectStorage();
    const getDataStream = async () => (await attachmentProcessor.getAttachment(responseUrl, 'stream')).data;
    this.objectId = await objectStorage.add(getDataStream);
    await this.emitReply();
    await this.emitData();
  }
}

module.exports.ReplyClient = ReplyClient;
