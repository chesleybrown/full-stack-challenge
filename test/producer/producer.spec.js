'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var log4js = require('log4js');
var logger = log4js.getLogger();
var connect = require('connect');

var Producer = require('../../src/producer/producer');
var EvaluatorService = require('../../src/consumer/evaluator.service');
var evaluatorService = new EvaluatorService();

describe('Producer app', function () {
	var producer, sandbox, http, io, connectionSpy, clock, socket;
	var address = 'http://localhost';
	var port = 3001;
	
	beforeEach(function () {
		connectionSpy = sinon.spy();
		var app = connect();
		http = require('http').Server(app);
		io = require('socket.io')(http);
		io.on('connection', function (s) {
			socket = s;
			connectionSpy();
			
			socket.on('question', function (msg) {
				socket.emit('received', msg);
			});
		});
		http.listen(port);
	});
	
	beforeEach(function () {
		// Use sandbox because we are spying on a global
		sandbox = sinon.sandbox.create();
		sandbox.stub(logger, 'info');
		clock = sandbox.useFakeTimers();
	});
	
	describe('when starting', function () {
		beforeEach(function (done) {
			producer = new Producer(0, 10);
			producer.connect(address, port);
			producer.socket.on('connect', function () {
				done();
			});
		});
		
		it('should log message about connecting to consumer', function () {
			expect(logger.info).to.have.been.calledTwice;
			expect(logger.info).to.have.been.calledWith('PRODUCER: Attempting to connect to consumer at ' + address + ':' + port + '.');
			expect(logger.info).to.have.been.calledWith('PRODUCER: Connected to consumer at ' + address + ':' + port + '.');
			expect(connectionSpy).to.have.been.calledOnce;
		});
		
		describe('and auto requester is started', function () {
			it('should emit a random question every interval', function (done) {
				// Listening on custom "received" event to verify "question" was
				// actually received by the consumer
				producer.socket.on('received', function (msg) {
					expect(msg.expression).to.match(evaluatorService.getRegex());
					done();
				});
				producer.autoRequester(1000);
			});
			
			it('should call itself again every interval', function () {
				sandbox.spy(producer, 'autoRequester');
				producer.autoRequester(1000);
				clock.tick(500);
				expect(producer.autoRequester).to.have.been.calledOnce;
				clock.tick(500);
				expect(producer.autoRequester).to.have.been.calledTwice;
				clock.tick(500);
				expect(producer.autoRequester).to.have.been.calledTwice;
				clock.tick(500);
				expect(producer.autoRequester).to.have.been.calledThrice;
			});
		});
		
		describe('and consumer emits "answer" event', function () {
			it('should log answer', function (done) {
				var answer = {expression: '4+3=', answer: 7};
				producer.socket.on('answer', function (msg) {
					expect(msg).to.deep.equal(answer);
					expect(logger.info).to.have.been.calledWith('PRODUCER: Received answer to expression ' + msg.expression + msg.answer + '.');
					done();
				});
				socket.emit('answer', answer);
			});
		});
		
		describe('and consumer emits "invalid" event', function () {
			it('should log invalid message', function (done) {
				var invalid = {expression: '4+3='};
				producer.socket.on('invalid', function (msg) {
					expect(msg).to.deep.equal(invalid);
					expect(logger.info).to.have.been.calledWith('PRODUCER: Consumer considers expression "' + msg.expression + '" invalid.');
					done();
				});
				socket.emit('invalid', invalid);
			});
		});
		
		afterEach(function () {
			producer.close();
		});
	});
	
	afterEach(function () {
		http.close();
		// Restores anything we were spying on for the tests
		sandbox.restore();
	});
});
