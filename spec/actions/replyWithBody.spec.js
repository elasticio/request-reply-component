const sinon = require('sinon');
const chai = require('chai');
const { getContext } = require('../common');
const replyWithBody = require('../../lib/actions/replyWithBody');

chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Reply With Body action', () => {
  describe('success', () => {
    beforeEach(() => {
    });
    afterEach(() => {
      sinon.restore();
    });
    it('Status code 500', async () => {
      const msg = {
        body: {
          responseBody: 'some body',
          contentType: 'contentType',
          statusCode: 500,
          customHeaders: { x: 2 }
        },
        headers: { reply_to: 'me' }
      };
      const context = getContext();
      await replyWithBody.process.call(context, msg, {});
      expect(context.emit.getCall(0).args[1].body).to.be.equal(msg.body.responseBody);
      expect(context.emit.getCall(0).args[1].headers).to.be.deep.equal({
        'Content-Type': 'contentType',
        'X-EIO-Routing-Key': 'me',
        'x-eio-status-code': 500,
        'x': 2
      });
      expect(context.emit.getCall(1).args[1].body).to.be.deep.equal(msg.body);
    });
    it('default status code', async () => {
      const msg = {
        body: {
          responseBody: 'some body',
          contentType: 'contentType',
          customHeaders: { x: 2 }
        },
        headers: { reply_to: 'me' }
      };
      const context = getContext();
      await replyWithBody.process.call(context, msg, {});
      expect(context.emit.getCall(0).args[1].body).to.be.equal(msg.body.responseBody);
      expect(context.emit.getCall(0).args[1].headers).to.be.deep.equal({
        'Content-Type': 'contentType',
        'X-EIO-Routing-Key': 'me',
        'x-eio-status-code': 200,
        'x': 2
      });
      expect(context.emit.getCall(1).args[1].body).to.be.deep.equal(msg.body);
    });
    it('empty body = whole body', async () => {
      const msg = {
        body: {
          contentType: 'contentType',
          customHeaders: { x: 2 }
        },
        headers: { reply_to: 'me' }
      };
      const context = getContext();
      await replyWithBody.process.call(context, msg, {});
      expect(context.emit.getCall(0).args[1].body).to.be.deep.equal(msg.body);
      expect(context.emit.getCall(0).args[1].headers).to.be.deep.equal({
        'Content-Type': 'contentType',
        'X-EIO-Routing-Key': 'me',
        'x-eio-status-code': 200,
        'x': 2
      });
      expect(context.emit.getCall(1).args[1].body).to.be.deep.equal(msg.body);
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
    });
    afterEach(() => {
      sinon.restore();
    });
    it('"Response Status Code" must be valid number between 200 and 999', async () => {
      const cfg = {};
      const msg = {
        body: {
          responseUrl: 'some url',
          contentType: 'contentType',
          statusCode: "a",
          customHeaders: { x: 2 }
        },
        headers: { reply_to: 'me' }
      };
      await expect(replyWithBody.process.call(getContext(), msg, cfg)).to.be.rejectedWith('"Response Status Code" must be valid number between 200 and 999');
    });
  });
});
