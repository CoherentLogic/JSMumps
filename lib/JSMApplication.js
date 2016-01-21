var fs = require('fs');

function JSMApplication(session, request, response, parsedURL, callback)
{
    this.io = require('socket.io');
    
    var configFile = parsedURL.documentRoot + parsedURL.basePath + "app.json";

    try {
	this.config = JSON.parse(fs.readFileSync(configFile));

	var contextModule = parsedURL.documentRoot + parsedURL.basePath + this.config.contextModule;



	session.server.writeLog("Attempting to load application context module " + contextModule);
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

module.exports = {
    JSMApplication: JSMApplication
};
