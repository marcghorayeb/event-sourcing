var uuid = require('node-uuid');
var AMQP = require('./amqp.js');
var Storage = require('./storage.js');

function Publisher(config) {
	if (!this.domain) throw new Error('Missing domain property');

	this.amqp = new AMQP(config.amqp);
	this.storage = new Storage(config.storage);
}

Publisher.prototype.connect = function (callback) {
	var self = this;

	this.storage.initAdapters(function (err) {
		if (err) return callback(err);

		this.amqp.connect().then(function (channel) {
			self.channel = channel;
			callback(null, channel);
		}, callback);
	});
};

Publisher.prototype.askRPC = function (event, callback) {
	var self = this;
	this.persistEvent(event, function (err) {
		if (err) return callback(err);
		self.emitEvent(event, callback);
	});
};

Publisher.prototype.persistEvent = function (event, callback) {
	this.storage.persistEvent(event, callback);
};

Publisher.prototype.assertReplyQueue = function () {
	return this.channel.assertQueue('', { exclusive: true }).then(function (queueAssertion) {
		return queueAssertion.queue;
	});
};

Publisher.prototype.emitEvent = function (event, callback) {
	event = new Buffer(JSON.stringify(event));
	var queue = this.domain;

	if (!callback) return this.channel.sendToQueue(queue, event);

	var self = this;
	var rpcConfig = { correlationId: uuid.v4(), replyTo: null };
	var rpcCallback = function (msg) {
		if (msg.properties.correlationId !== rpcConfig.correlationId) return;
		callback(msg);
	};

	this.assertReplyQueue().then(function (responseQ) {
		self.channel.consume(responseQ, rpcCallback, { noAck: true }).then(function () {
			rpcConfig.replyTo = responseQ;
			self.channel.sendToQueue(queue, event, rpcConfig);
		});
	});
};

module.exports = Publisher;