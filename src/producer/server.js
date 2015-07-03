'use strict';

var Producer = require('./producer');

/*
 * Create an instance of the producer app and start listening. Uses port 3000 or
 * env CONSUMER_PORT if set. Will connect to Consumer on localhost or env
 * CONSUMER_ADDRESS if provided.
 *
 * Determine range of random numbers using PRODUCER_LOW and PRODUCER_HIGH env
 * vars. If none set, default to 0 and 1000
 */
var low = process.env.PRODUCER_LOW !== undefined ? process.env.PRODUCER_LOW : 0;
var high = process.env.PRODUCER_HIGH !== undefined ? process.env.PRODUCER_HIGH : 1000;
var producer = new Producer(low, high);
producer.connect(process.env.CONSUMER_ADDRESS || 'http://localhost', process.env.CONSUMER_PORT || 3000);

// Start generating expressions and requesting answer from consumer continusouly
// once connected
producer.socket.on('connect', function () {
	var interval = process.env.PRODUCER_INTERVAL !== undefined ? process.env.PRODUCER_INTERVAL : 1000;
	producer.autoRequester(interval);
});

module.exports = producer;
