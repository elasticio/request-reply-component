const { ReplyClient } = require('../ReplyClient');

exports.process = async function (msg) {
  this.logger.info('"Reply With Attachment" action started');
  const replyClient = new ReplyClient(this, msg);
  await replyClient.replyWithAttachment();
  this.logger.info('Processing "Reply With Attachment" action finished successfully');
};
