/*
 * JSMumps
 *  Asynchronous Web Server for NodeM
 *
 * JSMSession.js - Session Support
 *
 * John Willis <jpw@coherent-logic.com>
 * Copyright (C) 2016 Coherent Logic Development LLC
 *
 */

var Cookies = require('cookies');
var Crypto = require('crypto');
var Q = require('q');

function JSMSession(options)
{
    var cookies = new Cookies(options.request, options.response);

    this.jsmBaseDirectory = __dirname;
    this.options = options;
    this.token = cookies.get('JSMSESSID');
    this.server = this.options.server;

    if(!this.token) {
	this.token = Crypto.randomBytes(48).toString('hex');

	this.server.db.set({global: 'JSM', 
			    subscripts: ['sessions', 
					 this.token], 
			    data: ''});

	cookies.set('JSMSESSID', this.token, {maxAge: this.server.MaxSessionAge});
    }    

	
    return(this);
}

JSMSession.prototype.getSync = function(variable) {

    var result = this.server.db.get({global: 'JSM', 
				     subscripts: ['sessions', 
						  this.token, 
						  "variables", 
						  variable]});

    if(result.defined) {
	return(result.data);
    }
    else {
	throw("Session variable " + variable + " undefined.");   
    }

};

JSMSession.prototype.setSync = function(variable, value) {

    var result = this.server.db.set({global: 'JSM', 
				     subscripts: ['sessions', 
						  this.token, 
						  "variables",
						  variable],
				     data: value});

    return(value);

};

JSMSession.prototype.get = function(variable, callback) {

    var deferred = Q.defer();

    var result = this.server.db.get({global: 'JSM', 
				     subscripts: ['sessions', 
						  this.token, 
						  "variables", 
						  variable]
				    },
				    function(err, data) {
					if(err) {
					    deferred.reject(err);
					}
					else {
					    deferred.resolve(data);
					}
				    });

    return(deferred.promise.nodeify(callback));

};

JSMSession.prototype.set = function(variable, value, callback) {

    var deferred = Q.defer();

    var result = this.server.db.set({global: 'JSM', 
				     subscripts: ['sessions', 
						  this.token, 
						  "variables",
						  variable],
				     data: value
				    },
				    function(err, data) {
					if(err) {
					    deferred.reject(err);
					}
					else {
					    deferred.resolve(data);
					}
				    });

    return(deferred.promise.nodeify(callback));

};

module.exports = {
    JSMSession: JSMSession
};
