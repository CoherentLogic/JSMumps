/*
 * JSMumps API
 * 
 * jsmumps.js: implementation of the API
 *
 * 
 * Copyright (C) 2017 Coherent Logic Development LLC
 * 
 * Author: John P. Willis <jpw@coherent-logic.com>
 *
 */

const logger = require('./logger');
const worker = require('./worker');
const nodem = require('nodem');
const fs = require('fs');
const readline = require('readline');

function JSMumps(opts)
{

    var self = this;

    this.exitNode = process.exit;

    process.exit = this.shutdown.bind(this);

    if(opts) {
        var workerCount = opts.workerCount || 10;
        this.logLevel = opts.logLevel || 2;
    }
    else {
        var workerCount = 10;
        this.logLevel = 2;
    }

    this.logger = new logger.Logger({
        logLevel: this.logLevel,
        moduleName: "jsmumps (parent, pid " + process.pid + ")"
    });

    this.logger.debug("logLevel is " + this.logLevel);
    this.logger.debug("workerCount is " + workerCount);

    this.db = new nodem.Gtm();
    var result = this.db.open();

    if(!result.ok) {
        this.logger.error("error opening nodem");
    }


    this.workers = [];

    for(i = 0; i < workerCount; i++) {
        this.workers.push(new worker.Worker(this.logLevel));
    }

    this.logger.debug("workers.length is " + this.workers.length);

    process.on('SIGINT', (code) => {
        this.logger.info("user initiated parent process shutdown (SIGINT) with code", code);

        self.shutdown();
    });

    return this;
}

JSMumps.prototype.shutdown = function (exitCode) {

    var self = this;

    this.logger.info("closing master process database connection");

    var result = this.db.close({resetTerminal: true});

    if(!result.ok) {
        this.logger.error("error closing master process database connection");
    }

    this.logger.info("sending CP_SHUTDOWN to " + this.workers.length + " worker processes");

    for(i = 0; i < this.workers.length; i++) { 
        try {   
            this.workers[i].dispatch('CP_SHUTDOWN');
        }
        catch (ex) {
            // do nothing
        }
    }

    setTimeout(() => {

        this.logger.info("sending SIGTERM to all remaining worker processes");

        for(i = 0; i < this.workers.length; i++) {
            this.workers[i].worker.kill();
        }

        this.logger.info("exiting");
        self.exitNode(exitCode);
    }, 5000);

}

JSMumps.prototype.nextFreeWorker = function () {
    for(var index in this.workers) {
        if(this.workers[index].free()) {    
            this.logger.debug("worker process index " + index + " is free");
            return this.workers[index].reserve();
        }
    }

    this.logger.debug("no free workers found; creating a new worker");
    // no free worker found... create a new one
    this.workers.push(new worker.Worker(this.logLevel));

    return this.workers[this.workers.length - 1];
}

JSMumps.prototype.dispatch = function (action, opts, callback) {    
    var w = this.nextFreeWorker();

    this.logger.debug("dispatching " + action + " to pid " + w.worker.pid);

    return w.dispatch(action, opts, callback);
}

JSMumps.prototype.getObject = function(global, subscripts, callback) {
    this.dispatch('getObject', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.getObjectSync = function(global, subscripts) {

}

JSMumps.prototype.setObject = function(global, subscripts, data, callback) {
    this.dispatch('setObject', {global: global, subscripts: subscripts, data: data}, callback);
}

JSMumps.prototype.setObjectSync = function(global, subscripts, data) {

}

JSMumps.prototype.get = function(global, subscripts, callback) {
    this.dispatch('get', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.getSync = function(global, subscripts) {
    return this.db.get({global: global, subscripts: subscripts});
}

JSMumps.prototype.set = function(global, subscripts, data, callback) {
    this.dispatch('set', {global: global, subscripts: subscripts, data: data}, callback);
}

JSMumps.prototype.setSync = function(global, subscripts, data) {
    return this.db.set({global: global, subscripts: subscripts, data: data});
}

JSMumps.prototype.merge = function(fromGlobal, fromSubscripts, toGlobal, toSubscripts, callback) {
    this.dispatch('merge', {
        to: {
            global: toGlobal,
            subscripts: toSubscripts
        },
        from: {
            global: fromGlobal,
            subscripts: fromSubscripts
        }
    }, callback);
}

JSMumps.prototype.mergeSync = function(fromGlobal, fromSubscripts, toGlobal, toSubscripts) {
    return this.db.merge({
        to: {
            global: toGlobal,
            subscripts: toSubscripts
        },
        from: {
            global: fromGlobal,
            subscripts: fromSubscripts
        }
    });
}

JSMumps.prototype.kill = function(global, subscripts, callback) {
    this.dispatch('kill', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.killSync = function(global, subscripts) {
    return this.db.kill({global: global, subscripts: subscripts});
}

JSMumps.prototype.lock = function(global, subscripts, timeout, callback) {
    this.dispatch('lock', {global: global, subscripts: subscripts, timeout: timeout}, callback);
}

JSMumps.prototype.lockSync = function(global, subscripts, timeout) {
    return this.db.lock({global: global, subscripts: subscripts, timeout: timeout});
}

JSMumps.prototype.unlock = function(global, subscripts, callback) {
    this.dispatch('unlock', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.unlockSync = function(global, subscripts) {
    return this.db.unlock({global: global, subscripts: subscripts});
}

JSMumps.prototype.data = function(global, subscripts, callback) {
    this.dispatch('data', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.dataSync = function(global, subscripts) {
    return this.db.data({global: global, subscripts: subscripts});
}

JSMumps.prototype.order = function(global, subscripts, callback) {
    this.dispatch('order', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.orderSync = function(global, subscripts) {
    return this.db.order({global: global, subscripts: subscripts});
}

JSMumps.prototype.query = function(global, subscripts, callback) {
    this.dispatch('query', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.querySync = function(global, subscripts) {
    return this.db.query({global: global, subscripts: subscripts});
}


JSMumps.prototype.import = function(routine, async) {

    if(!async) var async = false;

    routine = routine.replace("%", "_");

    var dirs = process.env.gtmroutines.split(" ");
    var directories = [];

    var num = 0;

    for(var i = 0; i < dirs.length; i++) {
        if(dirs[i] !== "" && dirs[i].match(/.*\(.*\).*/)) {
            directories[num] = dirs[i].split("(")[1].split(")")[0];
            num++;
        }
    }

    var file = "";

    for(var i in directories) {
        this.logger.debug("routine(): scanning " + directories[i] + " for " + routine);
        file = directories[i] + "/" + routine + ".m";

        if(fs.existsSync(file)) {
            this.logger.debug("routine(): found routine " + routine + " at " + file);
            break;
        }

    }

    this.logger.debug("routine(): parsing " + file);

    var fd = fs.openSync(file, "r");
    var lines = fs.readFileSync(fd, "utf-8").split("\n");

    this.logger.debug("routine(): read " + lines.length + " lines from " + file);

    var line = "";
    var methods = {};
   
    var hasParameterList = false;
    var parameterList = "";

    for(line in lines) {
        if(lines[line].match(/^[%A-Za-z0-9]+/)) {
            var label = lines[line].split(" ")[0];

            this.logger.debug("routine(): found label " + label + " at line " + (line + 1));

            if(label.indexOf("(") > -1) {
                hasParameterList = true;
                var trueLabel = label.split("(")[0];
                parameterList = label.split("(")[1].split(")")[0];
            }
            else {
                hasParameterList = false;
                var trueLabel = label;
            }

            if(trueLabel.charAt(trueLabel.length - 1) === ":") continue;

            methods[trueLabel] = buildFunction(routine, trueLabel, this, async);
        }
    }

    return methods;
}

function buildFunction(routine, label, instance, async) {
    if(async) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            var func = label + "^" + routine;
            var cb = args.pop();

            instance.dispatch('function', {func: func, args: args}, cb);
        };
    }
    else {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            var func = label + "^" + routine;

            return instance.functionSync(func, args);
        };
    }
}


JSMumps.prototype.function = function(func, args, callback) {
    this.dispatch('function', {func: func, args: args}, callback);
}

JSMumps.prototype.functionSync = function(func, args) {
    return this.db.function({function: func, arguments: args});
}

JSMumps.prototype.procedure = function(proc, args, callback) {
    this.dispatch('procedure', {proc: proc, args: args}, callback);
}

JSMumps.prototype.procedureSync = function(proc, args) {
    return this.db.procedure({procedure: proc, arguments: args});
}

module.exports = JSMumps;