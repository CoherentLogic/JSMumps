/*
 * JSMumps API
 * 
 * worker.js: wrapper class for worker processes
 *
 * 
 * Copyright (C) 2017 Coherent Logic Development LLC
 * 
 * Author: John P. Willis <jpw@coherent-logic.com>
 *
 */

const cp = require('child_process');
const logger = require('./logger');

function Worker(logLevel)
{
    
    var self = this;

    this.running = true;

    this.callback = null;

    this.workerFree = true;

    this.worker = cp.fork(`${__dirname}/child.js`, [logLevel]);

    this.logger = new logger.Logger({
        logLevel: logLevel,
        moduleName: "jsmumps (parent, pid " + process.pid + ")"
    });

    this.logger.debug("worker process pid is " + this.worker.pid);

    // Parent got a message
    this.worker.on('message', (msg) => {
        if(!msg.type) {
            throw("Error in message from child process:  no message type specified.");
        }
        
        switch(msg.type) {
            case 'DBOP_COMPLETE':
                this.logger.debug('worker pid ' + this.worker.pid + ' sent DBOP_COMPLETE; calling the callback');
                this.callback(false, msg.data);
                this.unreserve();
                break;
            case 'DBOP_ERROR':
                this.logger.debug('worker pid ' + this.worker.pid + ' sent DBOP_ERROR; calling the callback');
                this.callback(msg.error, {});
                this.unreserve();
                break;        
        }
    });

    this.worker.on('exit', (code, signal) => {
        self.running = false;
    });

    return this;
}

Worker.prototype.dispatch = function(action, options, callback) {
    this.reserve();

    this.callback = callback;

    this.worker.send({action: action,
                      options: options});
}

Worker.prototype.free = function () {
    return this.workerFree;
}

Worker.prototype.reserve = function () {

    this.logger.debug("worker pid " + this.worker.pid + " is now reserved");

    this.workerFree = false;

    return this;
}

Worker.prototype.unreserve = function () {
    this.logger.debug("worker pid " + this.worker.pid + " is now free");

    this.workerFree = true;

    return this;
}

module.exports.Worker = Worker;