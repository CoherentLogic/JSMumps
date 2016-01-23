var fs = require('fs');

function appRoot(parsedURL)
{
    var pc = parsedURL.pathComponents.length;    

    var tmp;
    var pth;

    while(pc-- > 0) {
	tmp = [];
	
	for(i = 0; i < pc; i++) {
	    tmp.push(parsedURL.pathComponents[i]);
	}
	pth = tmp.join("/");

	if(pth.charAt(0) != "/") {
	    pth = "/" + pth;
	}
	if(pth.charAt(pth.length - 1) != "/") {
	    pth = pth + "/";
	}

	try {
	    fs.statSync(parsedURL.documentRoot + pth + "app.json");
	    return(parsedURL.documentRoot + pth);
	}
	catch (ex) {}
    }

    return("");
}

function JSMApplication(session, request, response, parsedURL, callback)
{
    this.appRoot = appRoot(parsedURL);
    this.io = require('socket.io');
    this.errors = [];
    this.errors[403] = fs.readFileSync('403.html');
    this.errors[404] = fs.readFileSync('404.html');
    this.errors[500] = fs.readFileSync('500.html');

    session.server.writeLog("Application root is " + this.appRoot);
   
    var configFile = this.appRoot + "app.json";

    try {
	this.config = JSON.parse(fs.readFileSync(configFile));

	var contextModule = this.appRoot + this.config.contextModule;

	session.server.writeLog("Attempting to load application context module " + contextModule);
    }
    catch (ex) {
	session.server.writeLog("Error loading context module " + contextModule + " (" + ex + ")");
    }

    try {
	this.context = require(contextModule);
	
	var result = this.context.init({session: session,
					request: request,
					response: response});

	session.server.writeLog("Starting websocket listener");
	this.listener = this.io.listen(session.server.server);
	
	var tcontext = this.context;
	this.listener.sockets.on('connection', function(socket) {
	    var JSM = require('./JSM');
	    tcontext.JSM = new JSM.init(socket, session.server.db);

	    console.log("WebSocket Connected");
	    if(tcontext.onConnected) {
		tcontext.onConnected();
	    }

	    socket.on('jsm_message', function(msg) {
		if(msg.type) {
		    if(tcontext[msg.type]) {
			if(typeof tcontext[msg.type] === "function") {
			    if(msg.data) {
				tcontext[msg.type](msg.data);
			    }
			    else {
				session.server.writeLog("Message contains no data");
			    }
			}
			else {
			    session.server.writeLog("Application context message handler for " + msg.type + " is not a function");
			}
		    }
		    else {
			session.server.writeLog("Application context has no message handler for " + msg.type);

		    }
		}
		else {
		    session.server.writeLog("Malformed websocket message received (no 'type' field)");
		}

	    });
	});	    
	
	var rt = "";
	var re = "";
	var pth = "";
	var relPth = "";
	var matched = false;

	for(route in this.config.routes) {
	    rt = this.config.routes[route];
	    pth = parsedURL.systemPath;
	    relPth = pth.substring(this.appRoot.length);

	    session.server.writeLog("Route: attempt " + rt.matchOn + " match on " + rt.match + " (path " + pth + ")");

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
			pth = session.jsmBaseDirectory + rt.internalResourcePath;
			break;
		    case 'application':
			var realPath;
			if(parsedURL.pathname.charAt(0) === '/') {
			    realPath = parsedURL.pathname.substring(1);
			}
			else {
			    realPath = parsedURL.pathname;
			}
			pth = this.appRoot + realPath;
			break;
		    case 'document':
			pth = parsedURL.systemPath;
			break;
		    case 'function':
			break;
		    }
		    
		    if(rt.resourceClass != 'function') {
			var that = this;
			fs.readFile(pth, function (err, data) {
			    if(err) {
				that.serve(response, rt.failure, that.errors[rt.failure]);
			    }
			    else {
				that.serve(response, rt.success, data);
			    }
			});
		    }
		    break;
		case 'reject':
		    this.serve(response, rt.reject, this.errors[rt.reject]);
		    break;
		}
	    }
	}

	if(callback) {
	    callback(null, result);
	} 
    }
    catch(ex) {
	session.server.writeLog("Failed to load " + contextModule + " (" + ex + ")");
	callback(ex, null);
    }
    
    return(this);
}

JSMApplication.prototype.serve = function(response, statusCode, data) {
    response.statusCode = statusCode;
    response.end(data);
};

module.exports = {
    JSMApplication: JSMApplication
};

/*
	if(basePath != "/socket.io/") {
	    fs.readFile(that.parsedURL.systemPath, function (err, data) {
		var respData = "";
	    
		if(err) {
		    switch(err.code) {
		    case 'ENOENT':
			// error 404
			response.statusCode = 404;
			respData = that.error404;
			break;
		    default:
			break;
		    }
		}
		else {
		    response.statusCode = 200;
		    
		    respData = data;
		}
		
		response.end(respData);
	    });
	}
*/
