var _ = require('lodash');
var format = require('util').format;
var MongoClient = require('mongodb').MongoClient;

function MongoDB(config) {
	this.uri = config;

	if (_.isObject(this.uri)) {
		_.defaults(this.uri, {
			host: '',
			port: '',
			db: ''
		});

		this.uri = format(
			'mongodb://%s:%s/%s',
			this.uri.host,
			this.uri.port,
			this.uri.db
		);
	}

	if (!_.isString(this.uri) || !this.uri) throw new Error('Malformed config');
}

MongoDB.prototype.connect = function (callback) {
	if (this.db) return callback(null, this.db);

	var self = this;
	MongoClient.connect(this.uri, function (err, db) {
		if (err) throw err;
		self.db = db;
		callback(err, db);
	});
};

module.exports = MongoDB;
