var _ = require('lodash');
var amqplib = require('amqplib');
var format = require('util').format;

function AMQP(config) {
	var uri = config;

	if (_.isObject(uri)) {
		_.defaults(uri, {
			user: '',
			password: '',
			host: '',
			vhost: ''
		});

		uri = format(
			'amqp://%s:%s@%s/%s',
			uri.user,
			uri.password,
			uri.host,
			uri.vhost
		);
	}

	if (!_.isString(uri) || !uri) throw new Error('Malformed config');

	return amqplib.connect(uri).then(function (conn) {
		return conn.createChannel();
	});
}

module.exports = AMQP;