'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
var io = require('socket.io-client');
var GeneratorService = require('./generator.service');

/*
 * Producer app that emits question events using web sockets and listens for
 * answers.
 *
 * Events listening on
 * - connect: fired when a producer connects to consumer.
 * - answer: fired when an answer event is received.
 * - invalid: fired when an expression that was given was considered invalid
 * by the consumer.
 *
 * Emits following events
 * - question: when using autoRequester will emit a question with a random
 * expression to solve.
 */
module.exports = function () {
	var generator = new GeneratorService(0, 100);
	
	// Start listening on the desired port
	this.connect = function (port) {
		this.socket = io.connect('http://localhost:' + port, {forceNew: true});
		
		this.socket.on('connect', function () {
			logger.info('PRODUCER: Connected to consumer.');
		});
		this.socket.on('disconnect', function () {
			logger.info('PRODUCER: Disconnected from consumer.');
		});
		
		// Logs answer received from Consumer
		this.socket.on('answer', function (msg) {
			logger.info('PRODUCER: Received answer to expression ' + msg.expression + msg.answer + '.');
		});
		
		// Handles invalid responses
		this.socket.on('invalid', function (msg) {
			logger.info('PRODUCER: Consumer considers expression "' + msg.expression + '" invalid.');
		});
	};
	
	// Generate a random expression every second and send it to the consumer
	this.autoRequester = function () {
		var expression = generator.generateRandomExpression();
		logger.info('PRODUCER: Sending expression ' + generator.generateRandomExpression() + ' to consumer.');
		this.socket.emit('question', {expression: expression});
		
		var self = this;
		setTimeout(function () {
			self.autoRequester();
		}, 1000);
	};
	
	// Use to stop the server from listening (shutdown)
	this.close = function () {
		this.socket.disconnect();
	};
};
