'use strict';

describe('Reply', () => {
    process.env.ELASTICIO_EXEC_ID = 'my_exec_123';
    process.env.DEBUG = 'request-reply';

    const sinon = require('sinon');
    const should = require('chai').should();
    const reply = require('../reply.js');
    const messages = require('elasticio-node').messages;

    describe('reply properly', () => {

        const self = {
            emit: sinon.spy()
        };

        let msg = messages.newMessageWithBody({
            contentType: 'application/json',
            responseBody: {
                greeting: 'Hello, world!'
            },
            customHeaders: {
                'X-Test-Header1': 'test1',
                'X-Test-Header2': 'test2'
            }
        });

        msg.original_message = messages.newMessageWithBody({test: 'test'});
        msg.original_message.headers = {
            some: 'header'
        };

        msg.headers = {
            reply_to: 'my_routing_key_123'
        };

        before((done) => {
            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit reply and original message', () => {
            var spy = self.emit;

            spy.callCount.should.be.equal(3);

            spy.getCall(0).args[0].should.be.equal('data');
            spy.getCall(1).args[0].should.be.equal('data');
            spy.getCall(2).args[0].should.be.equal('end');

            // reply message
            spy.getCall(0).args[1].headers.should.be.deep.equal({
                'Content-Type': 'application/json',
                'X-EIO-Routing-Key': 'my_routing_key_123',
                'X-Test-Header1': 'test1',
                'X-Test-Header2': 'test2'
            });

            spy.getCall(0).args[1].body.should.be.deep.equal({
                greeting: 'Hello, world!'
            });

            // original message
            spy.getCall(1).args[1].headers.should.be.deep.equal({
                some: 'header'
            });

            spy.getCall(1).args[1].body.should.be.deep.equal({
                test: 'test'
            });
        });
    });

    describe('body is empty', () => {
        const self = {
            emit: sinon.spy()
        };

        let msg = {
            headers : {
               reply_to: 'my_routing_key_123'
            }
        };

        before((done) => {

            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit error', () => {
            var spy = self.emit;
            var call = spy.getCall(0);

            call.args[0].should.be.equal('error');

            var error = call.args[1];

            error.message.should.be.equal('Cannot read property \'contentType\' of undefined');
        });

        it('should emit end', () => {
            var spy = self.emit;
            spy.getCall(1).args[0].should.be.equal('end');
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

            call.args[0].should.be.equal('error');

            var error = call.args[1];

            error.message.should.be.equal('Content-type audio/mp4 is not supported');
        });

        it('should emit end', () => {
            var spy = self.emit;

            spy.getCall(1).args[0].should.be.equal('end');
        });
    });
});
