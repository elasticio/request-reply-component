"use strict";
let Q = require("q");
let messages = require('elasticio-node').messages;

const HEADER_CONTENT_TYPE = 'Content-Type';
const HEADER_ROUTING_KEY = 'X-EIO-Routing-Key';
const DEFAULT_CONTENT_TYPE = 'application/json';

exports.process = function (msg) {
    var execId = process.env.ELASTICIO_EXEC_ID;

    console.log(`Received new message for execId=${execId}`);

    var contentType = getContentType();
    var responseBody = msg.body.responseBody;

    var self = this;


    Q()
        .then(emitReply)
        .then(emitData)
        .fail(onError)
        .finally(onEnd);

    function emitReply() {
        let replyTo = msg.headers.reply_to;

        console.log(`Replying to ${replyTo}`);
        console.log(`Response content type is ${contentType}`);

        var reply = messages.newMessageWithBody(responseBody);
        reply.headers[HEADER_ROUTING_KEY] = replyTo;
        reply.headers[HEADER_CONTENT_TYPE] = contentType;

        self.emit('data', reply);
    }

    function getContentType() {
        var contentType = msg.body.contentType;

        if (contentType) {
            if(/^application|text\//.test(contentType)){
                return contentType;
            }

            throw new Error(`Content-type ${contentType} is not supported`);
        }

        return DEFAULT_CONTENT_TYPE;
    }

    function emitData() {
        console.log("Emitting data");
        self.emit('data', msg);
    }

    function onError(e) {
        console.log(e);
        self.emit('error', e);
    }

    function onEnd() {
        console.log(`Finished processing message for execId=${execId}`);
        self.emit('end');
    }
};