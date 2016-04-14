'use strict';

describe('Reply', () => {
    const sinon = require('sinon');
    const should = require('chai').should();
    const reply = require('../reply.js');
    const messages = require('elasticio-node').messages;
    
    process.env.ELASTICIO_EXEC_ID = 'my_exec_123';


    describe('reply properly', () => {
        console.log('=>reply properly')
        const self = {
            emit: sinon.spy()
        };

        let msg = messages.newMessageWithBody({
            contentType: 'application/json',
            responseBody: {
                greeting: 'Hello, world!'
            }
        });

        msg.headers = {
            reply_to: 'my_routing_key_123'
        };

        before((done) => {

            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit reply', () => {
            var spy = self.emit;
            var dataCall = spy.getCall(0);

            dataCall.args[0].should.to.be.equal("data");

            var data = dataCall.args[1];

            data.headers.should.to.be.deep.equal({
                "Content-Type": "application/json",
                "X-EIO-Routing-Key": "my_routing_key_123"
            });

            data.body.should.to.be.deep.equal({
                "greeting": "Hello, world!"
            });
        });

        it('should emit proper data', () => {
            var spy = self.emit;
            var dataCall = spy.getCall(1);

            dataCall.args[0].should.to.be.equal("data");

            var data = dataCall.args[1];

            data.headers.should.to.be.deep.equal({
                "reply_to": "my_routing_key_123"
            });

            data.body.should.to.be.deep.equal({
                contentType: 'application/json',
                responseBody: {
                    greeting: 'Hello, world!'
                }
            });
        });

        it('should emit end', () => {
            var spy = self.emit;

            spy.getCall(2).args[0].should.to.be.equal("end");
        });
    });

    describe('body is empty', () => {
        const self = {
            emit: sinon.spy()
        };

        let msg = "";

        before((done) => {

            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit error', () => {
            var spy = self.emit;
            var call = spy.getCall(0);

            call.args[0].should.to.be.equal("error");

            var error = call.args[1];

            error.message.should.to.be.equal("Cannot read property 'contentType' of undefined");
        });

        it('should emit end', () => {
            var spy = self.emit;

            spy.getCall(1).args[0].should.to.be.equal("end");
        });
    });

    describe('Invalid content type', () => {
        const self = {
            emit: sinon.spy()
        };

        let msg = messages.newMessageWithBody({
            contentType: 'audio/mp4'
        });

        before((done) => {

            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit error', () => {
            var spy = self.emit;
            var call = spy.getCall(0);

            call.args[0].should.to.be.equal("error");

            var error = call.args[1];

            error.message.should.to.be.equal("Content-type audio/mp4 is not supported");
        });

        it('should emit end', () => {
            var spy = self.emit;

            spy.getCall(1).args[0].should.to.be.equal("end");
        });
    });


});