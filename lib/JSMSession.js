/*
 * JSMSession.js
 *  JSM session management
 *
 * Copyright (C)  Coherent Logic Development LLC
 * 
 * Author: John P. Willis <jpw@coherent-logic.com>
 *
 * This file is part of JSMumps.
 * 
 * JSMumps is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * JSMumps is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


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
