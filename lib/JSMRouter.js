/*
 * JSMRouter.js
 *  JSM request routing engine
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


var fs = require('fs');

function JSMRouter(routes, session, request, response)
{

    this.routes = routes;
    this.session = session;
    this.request = request;
    this.response = response;
    this.errors = [];

    this.errors[403] = fs.readFileSync('403.html');
    this.errors[404] = fs.readFileSync('404.html');
    this.errors[500] = fs.readFileSync('500.html');

    return(this);
}

JSMRouter.prototype.serve = function(statusCode, data) {

    this.response.statusCode = statusCode;
    this.response.end(data);

};

JSMRouter.prototype.route = function(url, root) {
    
    var rt = "";
    var re = "";
    var pth = "";
    var relPth = "";
    var matched = false;

    for(route in this.routes) {
	rt = this.routes[route];
	pth = url.systemPath;
	relPth = pth.substring(root.length);
	

	
	re = new RegExp(rt.match);
	
	switch(rt.matchOn) {
	case 'absolute':
	    if(re.test(pth)) {
		matched = true;
	    }
	    else {
		matched = false;
	    }
	    break;
	case 'relative':
	    if(re.test(relPth)) {
		matched = true;
	    }
	    else {
		matched = false;
	    }
	    break;
	default:
	    break;
	}
	
	pth = "";
	if(matched) {
	    switch(rt.action) {
	    case 'serve':
		switch(rt.resourceClass) {
		case 'internal':
		    pth = this.session.jsmBaseDirectory + rt.internalResourcePath;
		    break;
		case 'application':
		    var realPath;
		    if(url.pathname.charAt(0) === '/') {
			realPath = url.pathname.substring(1);
		    }
		    else {
			realPath = url.pathname;
		    }
		    pth = root + realPath;
		    break;
		case 'document':
		    pth = url.systemPath;
		    break;
		case 'function':
		    break;
		}
		
		if(rt.resourceClass != 'function') {
		    this.session.server.writeLog("Route: " + rt.matchOn + " match on " + rt.match + " (path " + pth + ")");	
		    var that = this;
		    fs.readFile(pth, function (err, data) {
			if(err) {
			    that.serve(rt.failure, that.errors[rt.failure]);
			}
			else {
			    that.serve(rt.success, data);
			}
		    });
		}
		break;
	    case 'reject':
		this.serve(rt.reject, this.errors[rt.reject]);
		break;
	    }

	    break;
	}
    }
};

module.exports = {
    JSMRouter: JSMRouter
};
