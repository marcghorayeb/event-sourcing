var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

function FS(config) {
	if (!config) throw new Error('Missing filepath');

	this.filepath = config;
}

FS.prototype.connect = function (callback) {
	var directory = path.dirname(this.filepath);
	var self = this;

	mkdirp(directory, function (err) {
		if (err) return callback(err);
		self.stream = fs.createWriteStream(self.filepath, { flags: 'a+' });
		callback();
	});
};

FS.prototype.persistEvent = function (event, callback) {
	var buffer = new Buffer(JSON.stringify(event) + '\n');
	this.stream.write(buffer, callback);
};

module.exports = FS;
