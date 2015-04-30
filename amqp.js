var _ = require('lodash');
var amqplib = require('amqplib');
var format = require('util').format;

function AMQP(config) {
	this.config = config;
	this.uri = config;

	if (_.isObject(this.uri)) {
		_.defaults(this.uri, {
			user: '',
			password: '',
			host: '',
			vhost: ''
		});

		this.uri = format(
			'amqp://%s:%s@%s/%s',
			this.uri.user,
			this.uri.password,
			this.uri.host,
			this.uri.vhost
		);
	}

	if (!_.isString(this.uri) || !this.uri) throw new Error('Malformed config');
}

AMQP.prototype.connect = function () {
	return amqplib.connect(this.uri).then(function (conn) {
		return conn.createChannel();
	});
};

module.exports = AMQP;