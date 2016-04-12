"use strict";
let Q = require("q");
var amqplib = require('amqplib');
let messages = require('elasticio-node').messages;

exports.process = function (msg) {
    var taskId = process.env.ELASTICIO_TASK_ID;
    var userId = process.env.ELASTICIO_USER_ID;
    var execId = process.env.ELASTICIO_EXEC_ID;
    var exchangeName = process.env.ELASTICIO_PUBLISH_MESSAGES_TO;

    console.log(`Received new message for execId=${execId}`);

    var responseBody = msg.body.responseBody;

    var self = this;

    var amqpConnection;


    Q()
        //.then(connect)
        //.then(createChannel)
        .then(emitReply)
        //.then(publishReply)
        .then(emitData)
        .fail(onError)
        .finally(onEnd);

    function connect() {
        var uri = process.env.ELASTICIO_AMQP_URI;

        function onConnect(connection) {
            console.log('Successfully connected to AMQP');
            amqpConnection = connection;
            return connection;
        }

        return amqplib.connect(uri).then(onConnect);
    }

    function createChannel(connection) {

        function onCreateChannel(channel) {
            console.log('Successfully connected channel');
            return channel;
        }
        return connection.createChannel().then(onCreateChannel);
    }

    function emitReply() {
        let replyTo = msg.headers.reply_to;
        
        console.log(`Replying to ${replyTo}`);

        var reply = messages.newMessageWithBody(responseBody);
        reply.headers['X-EIO-Routing-Key'] = replyTo;

        self.emit('data', reply);
    }

    function publishReply(channel) {
        var routingKey = getReplyRoutingKey(execId);

        var headers = {
            taskId: taskId,
            execId: execId,
            userId: userId
        };

        var options = {
            contentType: 'application/json',
            contentEncoding: 'utf8',
            headers: headers
        };


        console.log(`Publishing response for execId=${execId}`);
        console.log(`Exchange: ${exchangeName}`);
        console.log(`Routing key: ${routingKey}`);

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
        if (amqpConnection) {
            console.log('Closing AMQP connection');
            //amqpConnection.close();
        }
        console.log(`Finished processing message for execId=${execId}`);
        self.emit('end');
    }
};