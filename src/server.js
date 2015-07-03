'use strict';

var cluster = require('cluster');
var Consumer = require('./consumer/app');
var Producer = require('./producer/app');

// Consumer is master
if (cluster.isMaster) {
	new Consumer(cluster);
}

if (cluster.isWorker) {
	new Producer();
}
