"use strict";
const Q = require("q");
const messages = require('elasticio-node').messages;

const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_ROUTING_KEY = 'X-EIO-Routing-Key';
const DEFAULT_CONTENT_TYPE = 'application/json';
const HEADER_STATUS_CODE = 'x-eio-status-code';

exports.process = function (msg) {
    const replyTo = msg.headers.reply_to;

    this.logger.info('Received new message');
    this.logger.trace('Received new message: %j', msg);

    let contentType;
    let responseBody;
    const self = this;

    Q()
        .then(init)
        .then(emitReply)
        .then(emitData)
        .catch(onError)
        .finally(onEnd);

    function init() {
        contentType = getContentType();
        if (!msg.body.responseBody) {
            self.logger.debug('Field responseBody on the message body was empty, we will reply with the whole message body');
        }
        responseBody = msg.body.responseBody ? msg.body.responseBody : msg.body;
    }

    function emitReply() {
        // Don't emit this message when running sample data
        if (!replyTo) {
            return;
        }

        self.logger.info('About to reply');
        self.logger.trace(`Replying to ${replyTo}`);
        self.logger.trace(`Response content type is ${contentType}`);

        const reply = messages.newMessageWithBody(responseBody);
        reply.headers[HEADER_ROUTING_KEY] = replyTo;
        reply.headers[HEADER_CONTENT_TYPE] = contentType;

        if (msg.body.customHeaders) {
            self.logger.trace('Applying custom headers: %j', msg.body.customHeaders);
            Object.assign(reply.headers, msg.body.customHeaders);
        }

        if (msg.body.statusCode) {
            reply.headers[HEADER_STATUS_CODE] = msg.body.statusCode;
        }

        self.logger.trace('Replying with %j', reply);
        self.emit('data', reply);
    }

    function getContentType() {
        const contentType = msg.body.contentType;

        if (contentType) {
            if (/^application|text\//.test(contentType)) {
                return contentType;
            }

            throw new Error(`Content-type ${contentType} is not supported`);
        }

        return DEFAULT_CONTENT_TYPE;
    }

    function emitData() {
        self.logger.info('Emitting data...');

        delete msg.body.elasticio;

        self.emit('data', messages.newMessageWithBody(msg.body));
    }

    function onError(e) {
        self.logger.error(e.toString());
        self.emit('error', e);
    }

    function onEnd() {
        self.logger.trace(`Finished processing message for replyTo: ${replyTo}`);
        self.emit('end');
    }
};
