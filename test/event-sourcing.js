var eventSourcing = require('../event-sourcing.js');
var expect = require('chai').expect;

describe('event-sourcing', function () {
	it('should have a publisher interface', function () {
		expect(eventSourcing.publisher).to.exist;
	});

	it('should have a consumer interface', function () {
		expect(eventSourcing.consumer).to.exist;
	});
});