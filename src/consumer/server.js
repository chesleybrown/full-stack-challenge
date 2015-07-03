'use strict';

var Consumer = require('./consumer');

/*
 * Create an instance of the consumer app and start listening. Uses port 3000 or
 * env PORT if set.
 */
var consumer = new Consumer();
consumer.listen(process.env.PORT || 3000);
