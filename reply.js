"use strict";
var Q = require("q");

exports.process = function (msg) {
    var taskId = process.env.ELASTICIO_TASK_ID;
    var userId = process.env.ELASTICIO_USER_ID;
    var execId = process.env.ELASTICIO_EXEC_ID;

    console.log(`Received new message for execId=${execId}`);

    var responseBody = msg.body.responseBody;

    var self = this;


    Q()
        .then(connect)
        .then(publishReply)
        .then(emitData)
        .fail(onError)
        .finally(onEnd);

    function connect() {

    }

    function publishReply() {
        var exchangeName = process.env.ELASTICIO_PUBLISH_MESSAGES_TO;
        var routingKey = getReplyRoutingKey(execId);

        var headers = {
            taskId: taskId,
            execId: execId,
            userId: userId
        };

        var options = {
            contentType: 'application/json',
            contentEncoding: 'utf8',
            mandatory: true,
            headers: headers
        };


        console.log(`Publishing response for execId=${execId}`);

        return channel.publish(
            exchangeName,
            routingKey,
            new Buffer(JSON.stringify(responseBody)),
            options);
    }

    function getReplyRoutingKey(execId) {
        return `request_reply_key_${execId}`;
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