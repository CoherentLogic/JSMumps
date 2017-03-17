const cp = require('child_process');

function Worker()
{
    
    var self = this;

    this.running = true;

    this.callback = null;

    this.workerFree = true;

    this.worker = cp.fork(`${__dirname}/child.js`);


    // Parent got a message
    this.worker.on('message', (msg) => {
        if(!msg.type) {
            throw("Error in message from child process:  no message type specified.");
        }
        
        switch(msg.type) {
            case 'DBOP_COMPLETE':
                this.callback(false, msg.data);
                this.workerFree = true;
                break;
            case 'DBOP_ERROR':
                this.callback(msg.error, {});
                this.workerFree = true;
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
    this.workerFree = false;

    return this;
}

module.exports.Worker = Worker;