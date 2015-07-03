'use strict';

var Consumer = require('./consumer');

/*
 * Create an instance of the consumer app and start listening
 */
var consumer = new Consumer();
consumer.listen(3000);
