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
module.exports = function (low, high) {
	var generator = new GeneratorService(low, high);
	
	/*
	 * Start listening on the desired port
	 *
	 * Params
	 * - address: the address for the Consumer to connect to (excluding port)
	 * - port: the port the Consumer is listening on
	 */
	this.connect = function (address, port) {
		var url = address + ':' + port;
		logger.info('PRODUCER: Attempting to connect to consumer at ' + url + '.');
		this.socket = io.connect(url, {forceNew: true});
		
		this.socket.on('connect', function () {
			logger.info('PRODUCER: Connected to consumer at ' + url + '.');
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
			logger.error('PRODUCER: Consumer considers expression "' + msg.expression + '" invalid.');
		});
	};
	
	/*
	 * Generate a random expression every provided interval and send it to the
	 * consumer.
	 *
	 * Params
	 * - interval: the interval in milliseconds to generate random expressions
	 */
	this.autoRequester = function (interval) {
		var expression = generator.generateRandomExpression();
		logger.info('PRODUCER: Sending expression ' + generator.generateRandomExpression() + ' to consumer.');
		this.socket.emit('question', {expression: expression});
		
		var self = this;
		setTimeout(function () {
			self.autoRequester(interval);
		}, interval);
	};
	
	// Use to stop the server from listening (shutdown)
	this.close = function () {
		this.socket.disconnect();
	};
};
