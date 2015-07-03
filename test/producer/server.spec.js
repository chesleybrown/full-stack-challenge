'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var log4js = require('log4js');
var logger = log4js.getLogger();

describe('Producer server', function () {
	describe('when started', function () {
		var server, sandbox;
		
		before(function () {
			// Use sandbox because we are spying on a global
			sandbox = sinon.sandbox.create();
			sandbox.stub(logger, 'info');
			
			server = require('../../src/producer/server');
		});
		
		it('should be able to stop server', function () {
			expect(server.close).to.not.throw;
		});
		
		it('shoud log message about attempting to connect', function () {
			expect(logger.info).to.have.been.calledOnce;
			expect(logger.info).to.have.been.calledWith('PRODUCER: Attempting to connect to consumer at http://localhost:3000.');
		});
		
		after(function () {
			server.close();
			// Restores anything we were spying on for the tests
			sandbox.restore();
		});
	});
});
