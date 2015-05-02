function Memory() {
	this.events = [];
}

Memory.prototype.connect = function (callback) {
	callback();
};

Memory.prototype.persistEvent = function (event, callback) {
	this.events.push(event);
	callback();
};

module.exports = Memory;
