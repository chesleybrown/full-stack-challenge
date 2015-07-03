'use strict';

/*
 * Evaluator module that evaluates simple "a+b=" type expressions. Works with
 * +, -, *, and / operators. Will only correctly evaluate given integers.
 */
module.exports = function () {
	/*
	 * Returns the regex for parsing a "(a)(operator)(b)=" type expression
	 */
	this.getRegex = function () {
		return /^([\-]{0,1}\d*)([\+\-\*\/])([\-]{0,1}\d*)\=$/;
	};
	
	/*
	 * Given an expression as a string, will evaulate it and return the answer.
	 * Expression must contain 2 integers and one operator and end with "="
	 *
	 * Parameters
	 * - expression: string expression, example: 2+3=
	 */
	this.evaluateExpression = function (expression) {
		var matches = this.getRegex().exec(expression);
		
		if (!matches || matches.length !== 4) {
			throw new Error('Could not parse given expression', expression);
		}
		
		var firstNumber = parseInt(matches[1]);
		var operator = matches[2];
		var secondNumber = parseInt(matches[3]);
		
		switch (operator) {
			case '+':
				return firstNumber + secondNumber;
			case '-':
				return firstNumber - secondNumber;
			case '/':
				return firstNumber / secondNumber;
			case '*':
				return firstNumber * secondNumber;
		}
	};
};
