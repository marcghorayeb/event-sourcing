var fs = require('fs');

function FS(config) {
	this.filepath = config;
}

FS.prototype.connect = function (callback) {
	this.stream = fs.createWriteStream(this.filepath);
	callback();
};

FS.prototype.persistEvent = function (event, callback) {
	var buffer = new Buffer(JSON.stringify(event));
	this.stream.write(buffer, callback);
};

module.exports = FS;
