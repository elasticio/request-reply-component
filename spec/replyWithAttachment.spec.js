const sinon = require("sinon");
const nock = require("nock");
const { expect } = require("chai");
const { messages } = require("elasticio-node");
const logger = require("@elastic.io/component-logger")();
const replyWithAttachment = require("../replyWithAttachment");

describe("Reply with attachment", () => {
  const msg = messages.newMessageWithBody({
    contentType: "image/png",
    responseUrl: "http://fake_api",
    customHeaders: {
      "X-Test-Header1": "test1",
      "X-Test-Header2": "test2",
    },
  });

  msg.headers = {
    reply_to: "my_routing_key_123",
  };

  const self = {
    emit: sinon.spy(),
    logger,
  };

  const fakeGetAttachmentResponse = { foo: "bar" };

  describe("for message with body", () => {
    it("should emit reply and original message", async () => {
      const getAttachment = nock(msg.body.responseUrl)
        .get("/")
        .reply(200, fakeGetAttachmentResponse);

      await replyWithAttachment.process.bind(self)(msg);
      expect(getAttachment.isDone()).to.be.equal(true);

      const spy = self.emit;
      expect(spy.callCount).to.be.equal(2);

      expect(spy.getCall(0).args[0]).to.be.equal("data");
      expect(spy.getCall(1).args[0]).to.be.equal("end");

      expect(spy.getCall(0).args[1].headers).to.be.deep.equal({
        "Content-Type": msg.body.contentType,
        "X-EIO-Routing-Key": msg.headers.reply_to,
        ...msg.body.customHeaders,
      });

      expect(spy.getCall(0).args[1].body).to.be.deep.equal(
        fakeGetAttachmentResponse
      );
    });

    it("should emit error (no message)", async () => {
      await replyWithAttachment.process.bind(self)();

      const spy = self.emit;
      const call = spy.getCall(0);

      expect(call.args[0]).to.be.equal("error");

      const error = call.args[1];

      expect(error.message).to.be.equal(
        "Cannot read property 'headers' of undefined"
      );
    });

    it("should emit error (empty headers)", async () => {
      await replyWithAttachment.process.bind(self)({ ...msg, headers: {} });

      const spy = self.emit;
      const call = spy.getCall(0);

      // only return, no reply_to
      expect(call).to.be.equal(null);
    });

    it("should emit error (empty body)", async () => {
      await replyWithAttachment.process.bind(self)({ ...msg, body: {} });

      const spy = self.emit;
      const call = spy.getCall(0);

      // only return, no responseUrl
      expect(call).to.be.equal(null);
    });
  });
});
