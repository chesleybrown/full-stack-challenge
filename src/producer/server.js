'use strict';

var Producer = require('./producer');

/*
 * Create an instance of the producer app and start listening
 */
var producer = new Producer();
producer.connect(3000);

// Start generating expressions and requesting answer from consumer continusouly
producer.autoRequester();
