var amqp = require('./amqp');
var uuid = require('node-uuid');

function Publisher(amqp, db) {
	this.amqp = amqp;

	var self = this;
	db.collection('events', function (err, col) {
		self.col = col;
	});
}

Publisher.prototype.connect = function (callback) {
	var self = this;
	this.amqp.then(function (channel) {
		self.channel = channel;
		callback(channel);
	});
};

Publisher.prototype.askRPC = function (queue, event, callback) {
	var self = this;
	this.persistEvent(event, function (err) {
		if (err) throw err;
		self.emitEvent(queue, event, callback);
	});
};

Publisher.prototype.persistEvent = function (event, callback) {
	this.col.insertOne(event, function (err, results) {
		if (err) throw err;
		callback(err, results);
	});
};

Publisher.prototype.assertReplyQueue = function () {
	return this.channel.assertQueue('', { exclusive: true }).then(function (queueAssertion) {
		return queueAssertion.queue;
	});
};

Publisher.prototype.emitEvent = function (queue, event, callback) {
	event = new Buffer(JSON.stringify(event));

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