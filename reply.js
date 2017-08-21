"use strict";
let Q = require("q");
let debug = require('debug')('request-reply');
let messages = require('elasticio-node').messages;

const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_ROUTING_KEY = 'X-EIO-Routing-Key';
const DEFAULT_CONTENT_TYPE = 'application/json';

exports.process = function (msg) {
    let replyTo = msg.headers.reply_to;

    console.log(`Received new message, replyTo=${replyTo}`);
    debug('Received new message:%j', msg);

    var contentType;
    var responseBody;

    var self = this;


    Q()
        .then(init)
        .then(emitReply)
        .then(emitData)
        .fail(onError)
        .finally(onEnd);

    function init() {
        contentType = getContentType();
        if (!msg.body.responseBody) {
            debug('Field responseBody on the message body was empty, we will reply with the whole message body');
        }
        responseBody = msg.body.responseBody? msg.body.responseBody : msg.body;
    }

    function emitReply() {

        console.log(`Replying to ${replyTo}`);
        console.log(`Response content type is ${contentType}`);

        var reply = messages.newMessageWithBody(responseBody);
        reply.headers[HEADER_ROUTING_KEY] = replyTo;
        reply.headers[HEADER_CONTENT_TYPE] = contentType;

        if (msg.body.customHeaders) {
            console.log('Applying custom headers: %j', msg.body.customHeaders);
            Object.assign(reply.headers, msg.body.customHeaders);
        }

        debug('Replying with %j', reply);
        self.emit('data', reply);
    }

    function getContentType() {
        var contentType = msg.body.contentType;

        if (contentType) {
            if (/^application|text\//.test(contentType)) {
                return contentType;
            }

            throw new Error(`Content-type ${contentType} is not supported`);
        }

        return DEFAULT_CONTENT_TYPE;
    }

    function emitData() {
        const origMessage = msg.original_message;

        if (origMessage) {
            debug('Emitting original message');

            delete origMessage.body.elasticio;

            return self.emit('data', messages.newMessageWithBody(origMessage.body));
        }

        debug('Original message not found. Emitting data.');

        delete origMessage.body.elasticio;

        self.emit('data', messages.newMessageWithBody(msg.body));
    }

    function onError(e) {
        console.log(e);
        self.emit('error', e);
    }

    function onEnd() {
        console.log(`Finished processing message for replyTo=${replyTo}`);
        self.emit('end');
    }
};
