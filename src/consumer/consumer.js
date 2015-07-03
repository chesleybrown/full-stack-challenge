'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
var connect = require('connect');
var serveStatic = require('serve-static');

var EvaluatorService = require('./evaluator.service');

/*
 * Consumer app that listens for events using web sockets.
 *
 * Events listening on
 * - connection: fired when a producer connects
 * - question: fired when a question event is received. Will try to solve the
 * given expression and if it's valid will emit an "answer" event with the
 * answer.
 * - disconnect: fired when a producer disconnects from the consumer
 *
 * Emits following events
 * - answer: when an expression is successfully solved this event is fired with
 * the answer.
 * - invalid: when an expression is invalid this event is fired with the
 * message about it being invalid.
 */
module.exports = function () {
	var evaluator = new EvaluatorService();
	var app = connect();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	
	app.use(serveStatic(__dirname + '/web'));
	
	io.on('connection', function (socket) {
		logger.info('CONSUMER: A producer has connected.');
		
		// Listen for expression questions being asked and answered them when
		// received
		socket.on('question', function (question) {
			// Determine answer to expression
			try {
				logger.info('CONSUMER: Expression "' + question.expression + '" has been received.');
				var answer = evaluator.evaluateExpression(question.expression);
				logger.info('CONSUMER: Sending expression answer ' + question.expression + answer + ' back to producer.');
				
				// Respond back to the producer directly with their answer
				socket.emit('answer', {expression: question.expression, answer: answer});
				
				// Broadcast to answer to public answers feed
				io.emit('all-answers', {expression: question.expression, answer: answer});
			}
			catch (err) {
				logger.info('CONSUMER: Given expression "' + question.expression + '" was invalid.');
				socket.emit('invalid', {expression: question.expression});
			}
		});
		
		// Log whenever a producer disconnects
		socket.on('disconnect', function () {
			logger.info('CONSUMER: A producer has disconnected.');
		});
	});
	
	// Start listening on the desired port
	this.listen = function (port) {
		http.listen(port);
		logger.info('CONSUMER: Listening on port ' + port);
	};
	
	// Use to stop the server from listening (shutdown)
	this.close = function () {
		http.close();
	};
};
