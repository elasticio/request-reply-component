const _ = require('lodash');
const { messages } = require('elasticio-node');
const { AttachmentProcessor, ApiKeyRestClient } = require('@elastic.io/component-commons-library');
const crypto = require('crypto');

const HEADER_ROUTING_KEY = 'x-eio-routing-key';

async function createMaesterAttachment(dataStream) {
    const JWTToken = process.env.ELASTICIO_OBJECT_STORAGE_TOKEN;
    const maesterUri = process.env.ELASTICIO_OBJECT_STORAGE_URI;


    const PASSWORD = process.env.ELASTICIO_MESSAGE_CRYPTO_PASSWORD;
    const VECTOR = process.env.ELASTICIO_MESSAGE_CRYPTO_IV;
    const encryptedDataStream = encryptStream.call(this, dataStream, PASSWORD, VECTOR);
    this.logger.info('Going to send stream to Maester');
    const result = await sendStreamToStorage.call(this, encryptedDataStream, maesterUri, JWTToken)
    this.logger.info('got result', result);
    await this.emit('data', { body: { result }, headers: {'x-ipaas-object-storage-id': result.objectId} });
    this.logger.info('Execution finished');
}

exports.process = async function processMessage(msg) {
    const maesterClient = new ApiKeyRestClient(this, {
        apiKeyHeaderName: 
    });
    const replyTo = msg.headers.reply_to;

    this.logger.info({ headers: msg.headers }, 'Received new lightweight message');
    this.logger.debug('Received new message: %j', msg);

    // Don't emit this message when running sample data
    if (replyTo) {
        this.logger.debug({ headers: msg.headers }, 'Replying');
        const reply = messages.newMessageWithBody(msg.body);
        // if message contains 'x-ipaas-object-storage-id' header then simply buypass it further
        reply.headers = _.omit(msg.headers, 'reply_to');
        reply.headers[HEADER_ROUTING_KEY] = replyTo;
        this.logger.debug('Replying with %j', reply);
        await this.emit('data', reply);
    }


    this.logger.debug({ headers: msg.headers }, 'Emitting data to next step');
    const messageForNextStep = messages.newMessageWithBody(msg.body);
    messageForNextStep.headers = _.omit(msg.headers, 'reply_to');
    this.logger.debug('Data for next step with %j', messageForNextStep);

    return messageForNextStep;
};
