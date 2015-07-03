'use strict';

var _ = require('lodash');

/*
 * Generator module that creates random math expressions given an operator.
 *
 * Constructor accepts two parameters
 * - low: the lowest random number possible (inclusive)
 * - high: the highest random number possible (inclusive)
 */
module.exports = function (low, high) {
	var supportedOperators = ['+', '-', '*', '/'];
	
	// Returns boolean on if given param is a valid number
	var validNumber = function (num) {
		return !_.isNaN(num) && _.isNumber(num);
	};
	
	if (!validNumber(low) || !validNumber(high) || low >= high) {
		throw new Error('Must provide a valid low and high');
	}
	
	// Generates a random integer in the range of low to high
	var randomInteger = function () {
		var num = Math.random() * (high - low) + low;
		return Math.floor(num);
	};
	
	/*
	 * Generates a random math expression and returns it as a string. Only
	 * supports +, -, * and / operators.
	 *
	 * Parameters
	 * - operator: the math operator to use in the expression.
	 */
	this.generateRandomExpression = function (operator) {
		if (!operator || supportedOperators.indexOf(operator) == -1) {
			throw new Error('Must provide a single operator that\'s one of (' + supportedOperators.join(',') + ')');
		}
		
		var firstNumber = randomInteger();
		var secondNumber = randomInteger();
		return firstNumber.toString() + operator.toString() + secondNumber.toString() + '=';
	};
};
