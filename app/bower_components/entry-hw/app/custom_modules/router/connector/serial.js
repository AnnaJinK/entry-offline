'use strict';
function Connector() {
}

Connector.prototype.open = function(port, options, callback) {
	var serialport = require('../../serialport');

	// options
	var _options = {};
	_options.baudRate = options.baudRate || options.baudrate;
	_options.parity = options.parity;
	_options.dataBits = options.dataBits || options.databits;
	_options.stopBits = options.stopBits || options.stopbits;
	_options.bufferSize = options.bufferSize || options.buffersize;
	if(options.delimiter) {
		_options.parser = serialport.parsers.readline(options.delimiter);
	}
	var flowcontrol = options.flowControl || options.flowcontrol;
	if(flowcontrol === 'hardware') {
		_options.flowControl = true;
	} else if(flowcontrol === 'software') {
		_options.flowControl = ['XON', 'XOFF'];
	}

	var sp = new serialport.SerialPort(port, _options);
	this.sp = sp;
	sp.on('error', function(error) {
		console.error(error);
	});
	sp.on('open', function(error) {
		sp.removeAllListeners('open');
		if(callback) {
			callback(error, sp);
		}
	});
};

Connector.prototype.connect = function(extension, callback) {
	console.log('connect!')
	var self = this;
	if(self.sp) {
		self.connected = false;
		self.received = true;
		var sp = self.sp;
		callback('connect');
		sp.on('data', function(data) {
			var valid = true;
			if(extension.validateLocalData) {
				valid = extension.validateLocalData(data);
			}
			if(valid) {
				if(self.connected == false) {
					self.connected = true;
					if(callback) {
						callback('connected');
					}
				}
				self.received = true;
				if(callback) {
					callback(null, data);
				}
			}
		});
		sp.on('disconnect', function() {
			self.close();
			if(callback) {
				callback('disconnected');
			}
		});
		self.timer = setInterval(function() {
			if(self.connected) {
				if(self.received == false) {
					self.connected = false;
					if(callback) {
						callback('lost');
					}
				}
				self.received = false;
			}
		}, 500);
	}
};

Connector.prototype.clear = function() {
	this.connected = false;
	if(this.timer) {
		clearInterval(this.timer);
		this.timer = undefined;
	}
	if(this.sp) {
		this.sp.removeAllListeners();
	}
};

Connector.prototype.close = function() {
	this.clear();
	if(this.sp) {
		if(this.sp.isOpen()) {
			this.sp.close();
		}
		this.sp = undefined;
	}
};

Connector.prototype.send = function(data) {
    console.log('send');
	if(this.sp && this.sp.isOpen()) {
		this.sp.write(data);
	}
};

module.exports.create = function() {
	return new Connector();
};
