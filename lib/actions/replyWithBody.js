const { ReplyClient } = require('../ReplyClient');

exports.process = async function (msg) {
  this.logger.info('"Reply" action started');
  const replyClient = new ReplyClient(this, msg);
  await replyClient.replyWithBody();
  this.logger.info('Processing "Reply" action finished successfully');
};
