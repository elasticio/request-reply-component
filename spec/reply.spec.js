'use strict';

const sinon = require('sinon');
require('chai').should();
const reply = require('../reply.js');
const {messages} = require('elasticio-node');
const logger = require('@elastic.io/component-logger')();

describe('Reply', () => {
    process.env.ELASTICIO_EXEC_ID = 'my_exec_123';
    process.env.DEBUG = 'request-reply';

    describe('for message with body', () => {
        const self = {
            emit: sinon.spy(),
            logger,
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

        msg.headers = {
            reply_to: 'my_routing_key_123'
        };

        before((done) => {
            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit reply and original message', () => {
            const spy = self.emit;

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

            spy.getCall(1).args[1].body.should.be.deep.equal({
                contentType: 'application/json',
                responseBody: {
                    greeting: 'Hello, world!'
                },
                customHeaders: {
                    'X-Test-Header1': 'test1',
                    'X-Test-Header2': 'test2'
                }
            });
        });
    });

    describe('for message with empty body', () => {
        const self = {
            emit: sinon.spy(),
            logger
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
            const spy = self.emit;
            const call = spy.getCall(0);

            call.args[0].should.be.equal('error');

            const error = call.args[1];

            error.message.should.be.equal('Cannot read property \'contentType\' of undefined');
        });

        it('should emit end', () => {
            const spy = self.emit;
            spy.getCall(1).args[0].should.be.equal('end');
        });
    });

    describe('no reply_to', () => {
        const self = {
            emit: sinon.spy(),
            logger
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

        before((done) => {
            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit only original message', () => {
            const spy = self.emit;

            spy.callCount.should.be.equal(2);

            spy.getCall(0).args[0].should.be.equal('data');
            spy.getCall(1).args[0].should.be.equal('end');

            spy.getCall(0).args[1].body.should.be.deep.equal({
                contentType: 'application/json',
                responseBody: {
                    greeting: 'Hello, world!'
                },
                customHeaders: {
                    'X-Test-Header1': 'test1',
                    'X-Test-Header2': 'test2'
                }
            });
        });
    });


    describe('for message with non-existing responseBody', () => {
        const self = {
            emit: sinon.spy(),
            logger
        };

        let msg = {
            headers : {
                reply_to: 'my_routing_key_123'
            },
            body: {
                foo: 'bar'
            }
        };

        before((done) => {
            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should have send two data and one end', () => {
            const spy = self.emit;
            spy.callCount.should.be.equal(3);
            spy.getCall(0).args[0].should.be.equal('data');
            spy.getCall(1).args[0].should.be.equal('data');
            spy.getCall(2).args[0].should.be.equal('end');
        });

        it('should emit data for response', () => {
            const spy = self.emit;
            // reply message
            spy.getCall(0).args[1].headers.should.be.deep.equal({
                'Content-Type': 'application/json',
                'X-EIO-Routing-Key': 'my_routing_key_123'
            });
            spy.getCall(0).args[1].body.should.be.deep.equal({
                foo: 'bar'
            });

        });

        it('should emit data for original message', () => {
            const spy = self.emit;
            // original message
            spy.getCall(1).args[1].body.should.be.deep.equal({
                foo: 'bar'
            });
        });

        it('should emit end', () => {
            const spy = self.emit;
            spy.getCall(2).args[0].should.be.equal('end');
        });
    });

    describe('Invalid content type', () => {
        const self = {
            emit: sinon.spy(),
            logger
        };

        let msg = messages.newMessageWithBody({
            contentType: 'audio/mp4'
        });

        before((done) => {
            reply.process.bind(self)(msg);
            setTimeout(done, 50)
        });

        it('should emit error', () => {
            const spy = self.emit;
            const call = spy.getCall(0);

            call.args[0].should.be.equal('error');

            const error = call.args[1];

            error.message.should.be.equal('Content-type audio/mp4 is not supported');
        });

        it('should emit end', () => {
            const spy = self.emit;

            spy.getCall(1).args[0].should.be.equal('end');
        });
    });

});
