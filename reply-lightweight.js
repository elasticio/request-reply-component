const _ = require('lodash');
const { messages } = require('elasticio-node');

const HEADER_ROUTING_KEY = 'x-eio-routing-key';

exports.process = async function processMessage(msg) {
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
