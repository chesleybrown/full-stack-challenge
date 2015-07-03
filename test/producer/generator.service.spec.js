'use strict';

var _ = require('lodash');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;

var GeneratorService = require('../../src/producer/generator.service');

describe('Generator service', function () {
	var service;
	var sandbox;
	
	// Matches an expression like "2+3=", "200*123=", "-23*-50" etc
	var expressionRegex = /^[\-]{0,1}\d*[\+\-\*\/][\-]{0,1}\d*\=$/;
	
	beforeEach(function () {
		service = undefined;
		
		// Use sandbox because we are spying on a global
		sandbox = sinon.sandbox.create();
		sandbox.spy(Math, 'random');
		sandbox.spy(Math, 'floor');
	});
	
	describe('when using a valid low and high', function () {
		_.each([[0, 10], [-100, -50]], function (lowHigh) {
			describe('when initalized with a valid low and high', function () {
				beforeEach(function () {
					service = new GeneratorService(lowHigh[0], lowHigh[1]);
				});
				
				describe('and generating a random expression', function () {
					describe('and using a supported operator', function () {
						_.each(['+', '-', '*', '/'], function (operator) {
							describe('with (' + operator + ') operator', function () {
								var result;
								
								beforeEach(function () {
									result = service.generateRandomExpression(operator);
								});
								
								it('shoud generate random numbers within provided range', function () {
									expect(Math.random).to.have.been.calledTwice;
									expect(Math.floor).to.have.been.calledTwice;
								});
								
								it('shoud return a random (' + operator + ') expression', function () {
									expect(result).to.match(expressionRegex);
								});
							});
						});
					});
					
					describe('and not providing an operator', function () {
						describe('with no given operator', function () {
							var result;
							
							beforeEach(function () {
								result = service.generateRandomExpression();
							});
							
							it('shoud generate random numbers within provided range', function () {
								expect(Math.random).to.have.been.callCount(3);
								expect(Math.floor).to.have.been.callCount(3);
							});
							
							it('shoud return a random operator expression', function () {
								expect(result).to.match(expressionRegex);
							});
						});
					});
					
					describe('and using an unsupported operator', function () {
						_.each(['^', '!', '$', '**', '++', '-/', 'some-string'], function (operator) {
							describe('with (' + operator + ') operator', function () {
								it('shoud throw error about invalid operator', function () {
									var generateWrapper = function () {
										service.generateRandomExpression(operator);
									};
									expect(generateWrapper).to.throw(Error, 'Must provide a single operator that\'s one of (+,-,*,/)');
								});
							});
						});
					});
				});
			});
		});
	});
	
	describe('when using an invalid low and high', function () {
		_.each([[undefined, 100], ['using', 'strings'], [50, 'and string']], function (lowHigh) {
			describe('and initalized', function () {
				it('shoud throw error about invalid operator', function () {
					var init = function () {
						return new GeneratorService(lowHigh[0], lowHigh[1]);
					};
					expect(init).to.throw(Error, 'Must provide a valid low and high');
				});
			});
		});
	});
	
	afterEach(function () {
		// Restores anything we were spying on for the tests
		sandbox.restore();
	});
});
