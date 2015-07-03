'use strict';

var EvaluatorService = require('./evaluator.service');
var evaluator = new EvaluatorService();

module.exports = function (cluster) {
	console.log('CONSUMER: ' + process.pid + ' has started.');
	
	// Fork producers
	for (var i = 0; i < 2; i++) {
		var producer = cluster.fork();
		
		// Receive messages from the producer processes
		producer.on('message', function (msg) {
			console.log('CONSUMER: Expression ' + msg.expression + ' received.');
			
			// Determine answer
			var answer = evaluator.evaluateExpression(msg.expression);
			
			console.log('CONSUMER: Sending expression answer ' + msg.expression + answer + ' back to producer.');
			
			// Send answer to producer
			producer.send({expression: msg.expression, answer: answer});
		});
	}
	
	// Be notified when producer processes die
	cluster.on('death', function (producer) {
		console.log('PRODUCER: ' + producer.pid + ' died.');
	});
	
	return cluster;
};
