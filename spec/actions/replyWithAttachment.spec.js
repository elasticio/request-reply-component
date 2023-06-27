const sinon = require('sinon');
const chai = require('chai');
const { getContext } = require('../common');
const replyWithAttachment = require('../../lib/actions/replyWithAttachment');
const utils = require('../../lib/utils');

chai.use(require('chai-as-promised'));

const { expect } = chai;

const fakeObjectStorage = {
  add: () => 'id'
};

describe('Reply With Attachment action', () => {
  let getObjectStorageReq;
  describe('success', () => {
    beforeEach(() => {
      getObjectStorageReq = sinon.stub(utils, 'getObjectStorage').callsFake(() => fakeObjectStorage);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should successfully reply With Attachment', async () => {
      const msg = {
        body: {
          responseUrl: 'some url',
          contentType: 'contentType',
          statusCode: 500,
          customHeaders: { x: 2 }
        },
        headers: { reply_to: 'me' }
      };
      const context = getContext();
      await replyWithAttachment.process.call(context, msg, {});
      expect(getObjectStorageReq.callCount).to.be.equal(1);
      expect(context.emit.getCall(0).args[1].body).to.be.deep.equal({});
      expect(context.emit.getCall(0).args[1].headers).to.be.deep.equal({
        'Content-Type': 'contentType',
        'X-EIO-Routing-Key': 'me',
        'x-eio-status-code': 500,
        'x-ipaas-object-storage-id': 'id',
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
      await expect(replyWithAttachment.process.call(getContext(), msg, cfg)).to.be.rejectedWith('"Response Status Code" must be valid number between 200 and 999');
    });
    it('"Attachment URL" field can not be empty!', async () => {
      const cfg = {};
      const msg = {
        body: {
          contentType: 'contentType',
          customHeaders: { x: 2 }
        },
        headers: { reply_to: 'me' }
      };
      await expect(replyWithAttachment.process.call(getContext(), msg, cfg)).to.be.rejectedWith('"Attachment URL" field can not be empty!');
    });
  });
});
