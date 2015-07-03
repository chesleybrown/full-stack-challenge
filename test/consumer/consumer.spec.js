'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var log4js = require('log4js');
var logger = log4js.getLogger();
var io = require('socket.io-client');

var Consumer = require('../../src/consumer/consumer');

describe('Consumer app', function () {
	var consumer, sandbox;
	var port = 3000;
	
	beforeEach(function () {
		// Use sandbox because we are spying on a global
		sandbox = sinon.sandbox.create();
		sandbox.stub(logger, 'info');
	});
	
	describe('when starting', function () {
		beforeEach(function () {
			consumer = new Consumer();
			consumer.listen(3000);
		});
		
		it('should log message about listening on port', function () {
			expect(logger.info).to.have.been.calledOnce;
			expect(logger.info).to.have.been.calledWith('CONSUMER: Listening on port 3000');
		});
		
		describe('and connecting to it', function () {
			var socket;
			
			beforeEach(function (done) {
				socket = io('http://localhost:' + port, {forceNew: true});
				socket.on('connect', function () {
					done();
				});
			});
			
			it('should respond to valid question', function (done) {
				var invalidStub = sandbox.stub();
				socket.on('invalid', invalidStub);
				socket.on('answer', function (msg) {
					expect(logger.info).to.have.been.calledWith('CONSUMER: Sending expression answer ' + msg.expression + msg.answer + ' back to producer.');
					expect(invalidStub).to.not.have.been.called;
					expect(msg.expression).to.equal('2+3=');
					expect(msg.answer).to.equal(5);
					done();
				});
				socket.emit('question', {expression: '2+3='});
			});
			
			it('should respond to invalid question', function (done) {
				var answerStub = sandbox.stub();
				socket.on('answer', answerStub);
				socket.on('invalid', function (msg) {
					expect(logger.info).to.have.been.calledWith('CONSUMER: Given expression "' + msg.expression + '" was invalid.');
					expect(answerStub).to.not.have.been.called;
					expect(msg.expression).to.equal('a+b=');
					expect(msg.answer).to.be.undefined;
					done();
				});
				socket.emit('question', {expression: 'a+b='});
			});
			
			afterEach(function (done) {
				socket.on('disconnect', function () {
					done();
				});
				socket.disconnect();
			});
		});
	});
	
	afterEach(function () {
		consumer.close();
		// Restores anything we were spying on for the tests
		sandbox.restore();
	});
});
