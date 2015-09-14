var AMQP = require('./amqp.js');

function Consumer(config) {
	if (!this.domain) throw new Error('Missing domain property');
	if (!config) throw new Error('Missing amqp config');

	this.amqp = new AMQP(config);
}

Consumer.prototype.consume = function (callback) {
	var self = this;
	var queue = this.domain;

	this.amqp.connect().then(function (channel) {
		self.channel = channel;

		channel.assertQueue(queue);
		channel.consume(queue, self.handleMessage.bind(self));
	}).then(callback, callback);
};

Consumer.prototype.handleMessage = function (msg) {
	var self = this;

	function onProcessed(err, results) {
		if (err) return self.onConsumerError && self.onConsumerError(err, msg);

		self.channel.ack(msg);

		if (!msg.properties.replyTo) return;

		var reply = { err: err, results: results };
		var rpcConfig = { correlationId: msg.properties.correlationId };

		self.channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(reply)), rpcConfig);
	}

	try {
		var event = JSON.parse(msg.content.toString());
		this.handleEvent(event, onProcessed.bind(this));
	} catch (e) {
		onProcessed(e);
	}
};

Consumer.prototype.handleEvent = function (event, callback) {
	if (!event.type) throw new Error('Missing event type');
	if (!this.projections[event.type]) throw new Error('No projections for ' + event.type);
	this.projections[event.type].bind(this)(event.data || event.args || {}, callback);
};


module.exports = Consumer;