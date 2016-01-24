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
