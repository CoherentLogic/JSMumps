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

const worker = require('./worker');

function JSMumps(opts)
{
    var self = this;

    if(opts) {
        var workerCount = opts.workerCount || 10;
    }
    else {
        var workerCount = 10;
    }

    this.workers = [];

    for(i = 0; i < workerCount; i++) {
        this.workers.push(new worker.Worker());
    }

    process.on('beforeExit', () => {
        for(i = 0; i < self.workers.length; i++) {
            
        }
    });

    return this;
}



JSMumps.prototype.close = function () {
    for(i = 0; i < this.workers.length; i++) { 
        try {   
            this.workers[i].dispatch('CP_SHUTDOWN');
        }
        catch (ex) {
            // do nothing
        }
    }
}

JSMumps.prototype.nextFreeWorker = function () {
    for(var index in this.workers) {
        if(this.workers[index].free()) {
            return this.workers[index].reserve();
        }
    }

    // no free worker found... create a new one
    this.workers.push(new worker.Worker());

    return this.nextFreeWorker();
}

JSMumps.prototype.dispatch = function (action, opts, callback) {
    var w = this.nextFreeWorker();

    return w.dispatch(action, opts, callback);
}

JSMumps.prototype.getObject = function(global, subscripts, callback) {
    this.dispatch('getObject', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.setObject = function(global, subscripts, data, callback) {
    this.dispatch('setObject', {global: global, subscripts: subscripts, data: data}, callback);
}

JSMumps.prototype.get = function(global, subscripts, callback) {
    this.dispatch('get', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.set = function(global, subscripts, data, callback) {
    this.dispatch('set', {global: global, subscripts: subscripts, data: data}, callback);
}

JSMumps.prototype.kill = function(global, subscripts, callback) {
    this.dispatch('kill', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.lock = function(global, subscripts, timeout, callback) {
    this.dispatch('lock', {global: global, subscripts: subscripts, timeout: timeout}, callback);
}

JSMumps.prototype.unlock = function(global, subscripts, callback) {
    this.dispatch('unlock', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.data = function(global, subscripts, callback) {
    this.dispatch('data', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.order = function(global, subscripts, callback) {
    this.dispatch('order', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.query = function(global, subscripts, callback) {
    this.dispatch('query', {global: global, subscripts: subscripts}, callback);
}

JSMumps.prototype.function = function(func, args, callback) {
    this.dispatch('function', {func: func, args: args}, callback);
}

JSMumps.prototype.procedure = function(proc, args, callback) {
    this.dispatch('procedure', {proc: proc, args: args}, callback);
}

module.exports.JSMumps = JSMumps;

