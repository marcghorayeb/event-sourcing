function Consumer(amqp) {
	if (!this.domain) throw new Error('Missing domain property');
	if (!amqp) throw new Error('Missing amqp connection');

	this.amqp = amqp;

	this.consume(this.domain, this.handleEvent.bind(this));
}

Consumer.prototype.connect = function (callback) {
	var self = this;
	this.amqp.then(function (channel) {
		self.channel = channel;
		callback(channel);
	});
};

Consumer.prototype.consume = function (queue, callback) {
	var self = this;

	this.channel.assertQueue(queue);

	this.channel.consume(queue, function (msg) {
		self.handleMessage(msg, callback);
	});
};

Consumer.prototype.handleMessage = function (msg, callback) {
	var data = JSON.parse(msg.content.toString());
	callback(data, this.onProcessed.bind(this));
};

Consumer.prototype.handleEvent = function (event, callback) {
	if (!event.type) throw new Error('Missing event type');
	if (!this.projections[event.type]) throw new Error('No projections for ' + event.type);
	this.projections[event.type].bind(this)(event.data || event.args || {}, callback);
};

Consumer.prototype.onProcessed = function (err, results) {
	this.channel.ack(msg);

	if (!msg.properties.replyTo) return;

	var reply = { err: err, results: results };
	var rpcConfig = { correlationId: msg.properties.correlationId };

	this.channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(reply)), rpcConfig);
};

module.exports = Consumer;