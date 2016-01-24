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

    var configFile = this.appRoot + "app.json";

    try {
	this.config = JSON.parse(fs.readFileSync(configFile));
	var contextModule = this.appRoot + this.config.contextModule;
    }
    catch (ex) {}

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

	    // patch JSM APIs into application context
	    tcontext.JSM = new JSM.init(socket, session.server.db);
	    tcontext.getSession = session.get;
	    tcontext.getSessionSync = session.getSync;
	    tcontext.setSession = session.set;
	    tcontext.setSessionSync = session.setSync;

	    session.server.writeLog("WebSocket connected");
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

	// process application-specific routes
	session.server.writeLog("Processing application-specific routes");
	var JSMRouter = require('./JSMRouter');
	var router = new JSMRouter.JSMRouter(this.config.routes, session, request, response);
	router.route(parsedURL, this.appRoot);

	if(callback) {
	    callback(null, result);
	} 
    }
    catch(ex) {
	var JSMRouter = require('./JSMRouter');
	var router = new JSMRouter.JSMRouter(session.server.routes,
					     session,
					     request,
					     response);
	session.server.writeLog("Processing global routes");
	router.route(parsedURL, "/");

					      
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
