var expect = require('chai').expect;
var Storage = require('../storage.js');

describe('storage', function () {
	[
		{ type: 'memory', config: null },
		{ type: 'fs', config: 'tmp/event-stream' },
		{ type: 'mongodb', config: {
			host: 'localhost',
			port: 27017,
			db: 'test'
		} }
	].forEach(function (adapter) {
		var adapterName = adapter.type;

		it('should support ' + adapterName, function () {
			Storage.isAdapterAvailable(adapterName);
		});

		describe(adapterName, function () {
			before(function (done) {
				this.storage = new Storage({ adapters: [ adapter ] });
				this.storage.initAdapters(function (err) {
					expect(err).to.not.exist;
					done();
				});
			});

			it('should handle persisting an event', function (done) {
				var event = { type: 'SomethingHappened', data: { a: 'test', b: 'there' } };
				this.storage.persistEvent(event, function (err) {
					expect(err).to.not.exist;
					done();
				});
			});
		});
	});
});
