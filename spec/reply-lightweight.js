const _ = require('lodash');
const sinon = require('sinon');
const chai = require('chai');
const { messages } = require('elasticio-node');
const logger = require('@elastic.io/component-logger')();

const { expect } = chai;
const reply = require('../reply-lightweight.js');
chai.use(require('sinon-chai'));

describe('Reply', () => {
    let ctx;
    let message;
    beforeEach(() => {
        const body = {
            key: 'value'
        };
        ctx = {
            logger,
            emit: sinon.stub().resolves()
        };
        message = messages.newMessageWithBody(body);
        message.headers = {
            'reply_to': 'return_to_webhook',
            'x-ipaas-object-storage-id': '1234'
        };
    });
    it('should emit message to reply to destination including headers but excluding reply_to header', async () => {
        await reply.process.call(ctx, JSON.parse(JSON.stringify(message)));
        expect(ctx.emit).to.have.been.calledOnce.and.calledWith('data', sinon.match(arg => {
            expect(arg.body).to.deep.equal(message.body);
            expect(arg.headers).to.deep.equal({
                ..._.omit(message.headers, 'reply_to'),
                'x-eio-routing-key': message.headers.reply_to
            });
            return true;
        }));
    });
    it('should return message to next step, as is including headers but excluding reply_to header', async () => {
        const result = await reply.process.call(ctx, JSON.parse(JSON.stringify(message)));
        expect(result.body).to.deep.equal(message.body);
        expect(result.headers).to.deep.equal(_.omit(message.headers, 'reply_to'));
    });
    it('should not fail if reply_to header is missing', async () => {
        delete message.headers.reply_to;
        await reply.process.call(ctx, JSON.parse(JSON.stringify(message)));
        expect(ctx.emit).not.to.have.been.called; // eslint-disable-line
    });
});
