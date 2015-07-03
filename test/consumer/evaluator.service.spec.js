'use strict';

var _ = require('lodash');
var chai = require('chai');
var expect = chai.expect;

var EvaluatorService = require('../../src/consumer/evaluator.service');

describe('Evaluator service', function () {
	describe('when initialized', function () {
		var service;
		var validExpressions = {
			'2+3=': {
				first: 2,
				operator: '+',
				second: 3,
				answer: 5
			},
			'23-5=': {
				first: 23,
				operator: '-',
				second: 5,
				answer: 18
			},
			'-5+25=': {
				first: -5,
				operator: '+',
				second: 25,
				answer: 20
			},
			'-5--20=': {
				first: -5,
				operator: '-',
				second: -20,
				answer: 15
			},
			'5*3=': {
				first: 5,
				operator: '*',
				second: 3,
				answer: 15
			},
			'5000*25=': {
				first: 5000,
				operator: '*',
				second: 25,
				answer: 125000
			},
			'25/5=': {
				first: 25,
				operator: '/',
				second: 5,
				answer: 5
			},
			'0/25=': {
				first: 0,
				operator: '/',
				second: 25,
				answer: 0
			},
			'25/0=': {
				first: 25,
				operator: '/',
				second: 0,
				answer: Infinity
			}
		};
		var invalidExpressions = [
			'2+3',
			'231',
			'no-numbers',
			23,
			'5+abc',
			'25*25+5=',
			'=25*5'
		];
		
		beforeEach(function () {
			service = new EvaluatorService();
		});
		
		describe('and getting evaluator regex', function () {
			var regex;
			
			beforeEach(function () {
				regex = service.getRegex();
			});
			
			it('should return regex', function () {
				expect(regex).to.be.instanceof(RegExp);
			});
			
			_.each(validExpressions, function (parsed, expression) {
				describe('and valid expression of ' + expression, function () {
					it('should properly parse expression to be "' + parsed.first + '", "' + parsed.operator + '", "' + parsed.second + '"', function () {
						var result = regex.exec(expression);
						expect(result).to.have.length(4);
						expect(parseInt(result[1])).to.equal(parsed.first);
						expect(result[2]).to.equal(parsed.operator);
						expect(parseInt(result[3])).to.equal(parsed.second);
					});
				});
			});
			
			_.each(invalidExpressions, function (expression) {
				describe('and invalid expression of ' + expression, function () {
					it('should find no matches', function () {
						expect(regex.exec(expression)).to.be.null;
					});
				});
			});
		});
		
		describe('and evaluating expression', function () {
			describe('and given valid expression', function () {
				_.each(validExpressions, function (parsed, expression) {
					it('should return correct answer of ' + expression + parsed.answer, function () {
						expect(service.evaluateExpression(expression)).to.equal(parsed.answer);
					});
				});
			});
			
			describe('and given invalid expression', function () {
				_.each(invalidExpressions, function (expression) {
					describe('of ' + expression, function () {
						it('should throw error about invalid expression of ' + expression, function () {
							var evaluatorWrapper = function () {
								return service.evaluateExpression(expression);
							};
							expect(evaluatorWrapper).to.throw(Error, 'Could not parse given expression');
						});
					});
				});
			});
		});
	});
});
