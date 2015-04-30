var _ = require('lodash');
var format = require('util').format;
var MongoClient = require('mongodb').MongoClient;

function MongoDB(config) {
	this.uri = config;
	this.col = null;

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
		if (err) return callback(err);

		db.collection('events', function (err, col) {
			if (err) return callback(err);

			self.db = db;
			self.col = col;
			callback();
		});
	});
};

MongoDB.prototype.persistEvent = function (event, callback) {
	this.col.insertOne(event, callback);
};

module.exports = MongoDB;
