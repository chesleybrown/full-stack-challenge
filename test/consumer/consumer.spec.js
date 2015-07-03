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
	var port = 3001;
	
	beforeEach(function () {
		// Use sandbox because we are spying on a global
		sandbox = sinon.sandbox.create();
		sandbox.stub(logger, 'info');
	});
	
	describe('when starting', function () {
		beforeEach(function () {
			consumer = new Consumer();
			consumer.listen(port);
		});
		
		it('should log message about listening on port', function () {
			expect(logger.info).to.have.been.calledOnce;
			expect(logger.info).to.have.been.calledWith('CONSUMER: Listening on port ' + port);
		});
		
		describe('and connecting to it', function () {
			var socket, socket2;
			
			beforeEach(function (done) {
				var count = 0;
				
				socket = io('http://localhost:' + port, {forceNew: true});
				socket.on('connect', function () {
					count == 1 ? done() : count++;
				});
				
				socket2 = io('http://localhost:' + port, {forceNew: true});
				socket2.on('connect', function () {
					count == 1 ? done() : count++;
				});
			});
			
			it('should respond to valid question directly to producer', function (done) {
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
			
			it('should respond to valid question to public feed', function (done) {
				var invalidStub = sandbox.stub();
				var invalid2Stub = sandbox.stub();
				var answerStub = sandbox.stub();
				var answer2Stub = sandbox.stub();
				// socket2 is a different provider and only gets the answer on
				// the public feed
				socket.on('invalid', invalidStub);
				socket2.on('invalid', invalid2Stub);
				socket.on('answer', answerStub);
				socket2.on('answer', answer2Stub);
				socket2.on('all-answers', function (msg) {
					expect(logger.info).to.have.been.calledWith('CONSUMER: Sending expression answer ' + msg.expression + msg.answer + ' back to producer.');
					expect(invalidStub).to.not.have.been.called;
					expect(invalid2Stub).to.not.been.called;
					expect(answerStub).to.have.been.calledOnce;
					expect(answer2Stub).to.not.have.been.called;
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
			
			it('should respond to invalid question to public feed', function (done) {
				var invalidStub = sandbox.stub();
				var invalid2Stub = sandbox.stub();
				var answerStub = sandbox.stub();
				var answer2Stub = sandbox.stub();
				// socket2 is a different provider and only gets the invalid event
				// on the public feed
				socket.on('invalid', invalidStub);
				socket2.on('invalid', invalid2Stub);
				socket.on('answer', answerStub);
				socket2.on('answer', answer2Stub);
				socket2.on('all-invalids', function (msg) {
					expect(logger.info).to.have.been.calledWith('CONSUMER: Given expression "' + msg.expression + '" was invalid.');
					expect(invalidStub).to.have.been.calledOnce;
					expect(invalid2Stub).to.not.have.been.called;
					expect(answerStub).to.not.have.been.called;
					expect(answer2Stub).to.not.have.been.called;
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
