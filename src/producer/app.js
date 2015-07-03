'use strict';

var GeneratorService = require('./generator.service');
var generator = new GeneratorService(0, 100);

module.exports = function () {
	console.log('PRODUCER: ' + process.pid + ' has started.');
	
	// Send an expression request to the consumer
	process.send({expression: generator.generateRandomExpression('+')});
	
	// Receive answer from the consumer
	process.on('message', function (msg) {
		console.log('PRODUCER: Received answer to expression ' + msg.expression + msg.answer);
	});
};
