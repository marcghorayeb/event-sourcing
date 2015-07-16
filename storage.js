var async = require('async');
var format = require('util').format;

function Storage(config) {
	if (!config.adapters.length) throw new Error('No defined adapters');

	this.config = config;
	this.adapters = [];
}

Storage.adapters = [ 'none', 'memory', 'mongodb', 'fs' ];

Storage.isAdapterAvailable = function (adapter) {
	return adapter && (Storage.adapters.indexOf(adapter.toLowerCase()) !== -1);
};

Storage.prototype.initAdapters = function (done) {
	var self = this;

	async.each(this.config.adapters, function (adapter, done) {
		self.initAdapter(adapter.config, adapter.type, done);
	}, done);
};

Storage.prototype.initAdapter = function (config, adapterName, done) {
	if (!Storage.isAdapterAvailable(adapterName)) return done(new Error('Missing storage adapter'));

	if (adapterName === 'none') return done();

	var Adapter = require(format('./storage/%s.js', adapterName));
	var adapter = new Adapter(config);
	var self = this;

	adapter.connect(function (err) {
		if (err) return done(err);
		self.adapters.push(adapter);
		done();
	});
};

Storage.prototype.persistEvent = function (event, done) {
	event.createdAt = new Date();
	async.each(this.adapters, function (adapter, done) {
		adapter.persistEvent(event, done);
	}, done);
};

module.exports = Storage;